import { z } from 'zod';
import { getD1 } from '../../../db';
import { apiSession } from '../../../lib/server-auth';

// Keep compatibility with stable legacy/seed ids; newly created products use UUIDs.
const schema = z.object({ productId: z.string().trim().min(1).max(100) });

export async function GET(request: Request) {
  const session = await apiSession(request);
  if (!session) return Response.json({ authenticated: false, productIds: [] });
  const rows = await getD1().prepare('SELECT product_id FROM favorites WHERE user_id=? ORDER BY created_at DESC LIMIT 1000').bind(session.user.id).all<{product_id:string}>();
  return Response.json({ authenticated: true, productIds: rows.results.map((row) => row.product_id) });
}

export async function POST(request: Request) {
  const session = await apiSession(request);
  if (!session) return Response.json({ error: 'Bạn cần đăng nhập để lưu bản vẽ.' }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: 'Sản phẩm không hợp lệ.' }, { status: 422 });
  const db = getD1();
  const product = await db.prepare("SELECT id FROM products WHERE id=? AND status='approved'").bind(parsed.data.productId).first();
  if (!product) return Response.json({ error: 'Không tìm thấy bản vẽ đã duyệt.' }, { status: 404 });
  await db.prepare('INSERT OR IGNORE INTO favorites (id,user_id,product_id,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(),session.user.id,parsed.data.productId,Date.now()).run();
  return Response.json({ saved: true });
}

export async function DELETE(request: Request) {
  const session = await apiSession(request);
  if (!session) return Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: 'Sản phẩm không hợp lệ.' }, { status: 422 });
  await getD1().prepare('DELETE FROM favorites WHERE user_id=? AND product_id=?').bind(session.user.id,parsed.data.productId).run();
  return Response.json({ saved: false });
}
