import { getD1 } from '../../../../db';
import { apiSession } from '../../../../lib/server-auth';

const visitorCookie = 'ndc_visitor';

export async function POST(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const db = getD1();
  const product = await db.prepare("SELECT id FROM products WHERE id=? AND status='approved'").bind(productId).first();
  if (!product) return Response.json({ error: 'Không tìm thấy bản vẽ.' }, { status: 404 });

  const session = await apiSession(request);
  const cookieValue = request.headers.get('cookie')?.match(/(?:^|;\s*)ndc_visitor=([a-zA-Z0-9-]{20,80})/)?.[1];
  const visitorId = cookieValue || crypto.randomUUID();
  const viewerKey = session ? `user:${session.user.id}` : `visitor:${visitorId}`;
  const now = Date.now();
  const viewedOn = Math.floor(now / 86_400_000);
  await db.prepare('INSERT OR IGNORE INTO product_views (id,product_id,viewer_key,viewed_on,created_at) VALUES (?,?,?,?,?)')
    .bind(crypto.randomUUID(), productId, viewerKey, viewedOn, now).run();
  const total = await db.prepare('SELECT COUNT(*) total FROM product_views WHERE product_id=?').bind(productId).first<{ total: number }>();
  const headers = new Headers({ 'Cache-Control': 'private, no-store' });
  if (!cookieValue && !session) {
    const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
    headers.append('Set-Cookie', `${visitorCookie}=${visitorId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${secure}`);
  }
  return Response.json({ views: total?.total || 0 }, { headers });
}
