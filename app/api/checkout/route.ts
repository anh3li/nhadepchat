import { getD1 } from '../../../db';
import { apiSession } from '../../../lib/server-auth';

export async function POST(request: Request) {
  const session = await apiSession(request);
  if (!session) return Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 });
  const db = getD1();
  const items = await db.prepare(`SELECT p.id,p.price FROM cart_items c JOIN products p ON p.id=c.product_id WHERE c.user_id=? AND p.status='approved' AND p.is_free=0`).bind(session.user.id).all<{ id: string; price: number }>();
  if (!items.results.length) return Response.json({ error: 'Giỏ hàng không có sản phẩm trả phí hợp lệ.' }, { status: 422 });
  const orderId = crypto.randomUUID(), now = Date.now(), total = items.results.reduce((sum, item) => sum + Number(item.price), 0);
  await db.batch([
    db.prepare('INSERT INTO orders (id,user_id,total,payment_status,created_at,updated_at) VALUES (?,?,?,?,?,?)').bind(orderId, session.user.id, total, 'PENDING', now, now),
    ...items.results.map(item => db.prepare('INSERT INTO order_items (id,order_id,product_id,price,created_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(), orderId, item.id, item.price, now)),
  ]);
  return Response.json({ orderId, total, paymentStatus: 'PENDING', paymentRequired: true });
}
