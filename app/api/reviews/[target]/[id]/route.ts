import { z } from 'zod';
import { getD1 } from '../../../../../db';
import { apiSession } from '../../../../../lib/server-auth';

const reviewSchema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(1000).default('') });
type Target = 'product' | 'seller';

function config(target: Target) {
  return target === 'product'
    ? { table: 'product_reviews', column: 'product_id' }
    : { table: 'seller_reviews', column: 'seller_id' };
}

async function entity(target: Target, id: string) {
  const db = getD1();
  if (target === 'product') return db.prepare("SELECT p.id,sp.user_id owner_id FROM products p JOIN seller_profiles sp ON sp.id=p.seller_id WHERE p.id=? AND p.status='approved'").bind(id).first<{ id: string; owner_id: string }>();
  return db.prepare('SELECT id,user_id owner_id FROM seller_profiles WHERE id=?').bind(id).first<{ id: string; owner_id: string }>();
}

async function canReview(target: Target, id: string, userId: string, ownerId: string) {
  if (userId === ownerId) return { eligible: false, reason: 'Bạn không thể tự đánh giá hồ sơ của mình.' };
  const db = getD1();
  const downloaded = target === 'product'
    ? await db.prepare('SELECT id FROM downloads WHERE product_id=? AND user_id=? LIMIT 1').bind(id, userId).first()
    : await db.prepare('SELECT d.id FROM downloads d JOIN products p ON p.id=d.product_id WHERE p.seller_id=? AND d.user_id=? LIMIT 1').bind(id, userId).first();
  return downloaded
    ? { eligible: true, reason: '' }
    : { eligible: false, reason: target === 'product' ? 'Hãy tải bản vẽ trước khi đánh giá.' : 'Hãy tải ít nhất một bản vẽ của KTS trước khi đánh giá.' };
}

async function payload(target: Target, id: string, request: Request, ownerId: string) {
  const db = getD1();
  const { table, column } = config(target);
  const session = await apiSession(request);
  const [summary, reviews, eligibility, own] = await Promise.all([
    db.prepare(`SELECT ROUND(AVG(rating),1) average,COUNT(*) count FROM ${table} WHERE ${column}=?`).bind(id).first<{ average: number | null; count: number }>(),
    db.prepare(`SELECT r.rating,r.comment,r.updated_at,up.display_name,up.avatar_key,up.user_id,u.image account_image FROM ${table} r JOIN user_profiles up ON up.user_id=r.user_id LEFT JOIN user u ON u.id=up.user_id WHERE r.${column}=? ORDER BY r.updated_at DESC LIMIT 30`).bind(id).all(),
    session ? canReview(target, id, session.user.id, ownerId) : Promise.resolve({ eligible: false, reason: 'Đăng nhập để đánh giá.' }),
    session ? db.prepare(`SELECT rating,comment FROM ${table} WHERE ${column}=? AND user_id=?`).bind(id, session.user.id).first() : Promise.resolve(null),
  ]);
  return { average: Number(summary?.average || 0), count: Number(summary?.count || 0), reviews: reviews.results, signedIn: Boolean(session), ...eligibility, own };
}

export async function GET(request: Request, { params }: { params: Promise<{ target: string; id: string }> }) {
  const { target, id } = await params;
  if (target !== 'product' && target !== 'seller') return Response.json({ error: 'Loại đánh giá không hợp lệ.' }, { status: 404 });
  const found = await entity(target, id);
  if (!found) return Response.json({ error: 'Không tìm thấy nội dung cần đánh giá.' }, { status: 404 });
  return Response.json(await payload(target, id, request, found.owner_id), { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request, { params }: { params: Promise<{ target: string; id: string }> }) {
  const { target, id } = await params;
  if (target !== 'product' && target !== 'seller') return Response.json({ error: 'Loại đánh giá không hợp lệ.' }, { status: 404 });
  const session = await apiSession(request);
  if (!session) return Response.json({ error: 'Bạn cần đăng nhập để đánh giá.' }, { status: 401 });
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Điểm đánh giá hoặc nội dung không hợp lệ.' }, { status: 422 });
  const found = await entity(target, id);
  if (!found) return Response.json({ error: 'Không tìm thấy nội dung cần đánh giá.' }, { status: 404 });
  const access = await canReview(target, id, session.user.id, found.owner_id);
  if (!access.eligible) return Response.json({ error: access.reason }, { status: 403 });
  const { table, column } = config(target);
  const now = Date.now();
  await getD1().prepare(`INSERT INTO ${table} (id,${column},user_id,rating,comment,created_at,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(${column},user_id) DO UPDATE SET rating=excluded.rating,comment=excluded.comment,updated_at=excluded.updated_at`)
    .bind(crypto.randomUUID(), id, session.user.id, parsed.data.rating, parsed.data.comment, now, now).run();
  return Response.json(await payload(target, id, request, found.owner_id));
}
