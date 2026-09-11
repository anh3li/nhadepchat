import { getD1, getFilesBucket, getLegacyFilesBucket } from '../../../../db';
import { apiSession } from '../../../../lib/server-auth';
import { presignPrivateGet } from '../../../../lib/r2-presign';

export async function GET(request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const session = await apiSession(request);
  if (!session) return Response.json({ error: 'Bạn cần đăng nhập để tải hồ sơ.' }, { status: 401 });
  const { fileId } = await params;
  const db = getD1();
  const file = await db.prepare(`SELECT pf.*,p.id product_id,p.status,p.is_free,sp.user_id owner_id,up.role
    FROM product_files pf JOIN products p ON p.id=pf.product_id JOIN seller_profiles sp ON sp.id=p.seller_id
    LEFT JOIN user_profiles up ON up.user_id=? WHERE pf.id=?`).bind(session.user.id, fileId).first<Record<string, unknown>>();
  if (!file) return Response.json({ error: 'Không tìm thấy file.' }, { status: 404 });
  const paidOrder = await db.prepare(`SELECT o.id FROM orders o JOIN order_items oi ON oi.order_id=o.id
    WHERE o.user_id=? AND oi.product_id=? AND o.payment_status='PAID' LIMIT 1`).bind(session.user.id, file.product_id).first();
  const allowed = file.role === 'admin' || file.owner_id === session.user.id || (file.status === 'approved' && file.is_free === 1) || Boolean(paidOrder);
  if (!allowed) return Response.json({ error: file.is_free === 0 ? 'Chưa có thanh toán thành công cho sản phẩm này.' : 'Không có quyền tải file.' }, { status: 403 });

  const bucket = getFilesBucket();
  const privateObject = await bucket.head(String(file.object_key));
  const url = privateObject ? await presignPrivateGet(String(file.object_key), 600) : null;
  if (url) {
    if (file.status === 'approved' && file.owner_id !== session.user.id) await db.prepare('INSERT INTO downloads (id,user_id,product_id,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(), session.user.id, file.product_id, Date.now()).run();
    return Response.redirect(url, 302);
  }

  // Legacy files remain in the old bucket until an explicit storage migration.
  const legacyObject = await getLegacyFilesBucket().get(String(file.object_key));
  if (!legacyObject) return Response.json({ error: 'File không tồn tại trên kho lưu trữ.' }, { status: 404 });
  const headers = new Headers();
  legacyObject.writeHttpMetadata(headers);
  headers.set('Content-Disposition', `attachment; filename="${String(file.original_name).replace(/["\r\n]/g, '')}"`);
  headers.set('Cache-Control', 'private, no-store');
  return new Response(legacyObject.body, { headers });
}
