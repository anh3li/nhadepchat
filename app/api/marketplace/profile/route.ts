import { z } from 'zod';
import { getD1 } from '../../../../db';
import { apiUser } from '../../../../lib/server-auth';
import { sellerTypes, uniqueSlug } from '../../../../lib/marketplace';

const schema = z.object({
  displayName: z.string().trim().min(2, 'Tên hiển thị quá ngắn.').max(80),
  sellerType: z.enum(sellerTypes), professionalTitle: z.string().trim().min(2).max(100),
  experienceYears: z.coerce.number().int().min(0).max(80).nullable().optional(), company: z.string().trim().max(120).optional(),
  location: z.string().trim().max(100).optional(), bio: z.string().trim().min(20, 'Giới thiệu cần ít nhất 20 ký tự.').max(2000),
  website: z.union([z.url('Website không hợp lệ.'), z.literal('')]).optional(),
});

export async function GET(request: Request) {
  const current = await apiUser(request); if ('error' in current) return current.error;
  const row = await getD1().prepare('SELECT up.*, sp.id seller_id, sp.seller_type, sp.professional_title, sp.experience_years, sp.company, sp.website, sp.verification_status FROM user_profiles up LEFT JOIN seller_profiles sp ON sp.user_id=up.user_id WHERE up.user_id=?').bind(current.session.user.id).first();
  return Response.json(row ? { ...row, account_image: current.session.user.image || null } : row);
}

export async function POST(request: Request) {
  const current = await apiUser(request); if ('error' in current) return current.error;
  const parsed = schema.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: parsed.error.issues[0].message }, { status: 422 });
  const db = getD1(), data = parsed.data, now = Date.now();
  const existing = await db.prepare('SELECT id FROM seller_profiles WHERE user_id=?').bind(current.session.user.id).first();
  if (existing) return Response.json({ error: 'Hồ sơ người bán đã tồn tại.' }, { status: 409 });
  const slug = await uniqueSlug(data.displayName, 'user_profiles');
  const nextRole = current.profile?.role === 'admin' ? 'admin' : 'seller';
  await db.batch([
    db.prepare('UPDATE user_profiles SET slug=?,display_name=?,bio=?,location=?,role=?,updated_at=? WHERE user_id=?').bind(slug,data.displayName,data.bio,data.location||null,nextRole,now,current.session.user.id),
    db.prepare('INSERT INTO seller_profiles (id,user_id,seller_type,professional_title,experience_years,company,location,website,verification_status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),current.session.user.id,data.sellerType,data.professionalTitle,data.experienceYears??null,data.company||null,data.location||null,data.website||null,'unverified',now,now),
    db.prepare('UPDATE user SET name=?,role=?,updatedAt=? WHERE id=?').bind(data.displayName,nextRole,now,current.session.user.id),
  ]);
  return Response.json({ ok: true, slug });
}
