import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { getD1 } from '../db';

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession(returnTo = '/dashboard') {
  const session = await getSession();
  if (!session) redirect(`/dang-nhap?returnTo=${encodeURIComponent(returnTo)}`);
  return session;
}

export async function requireSeller(returnTo = '/dashboard') {
  const session = await requireSession(returnTo);
  const profile = await getD1().prepare('SELECT sp.*, up.slug, up.display_name, up.bio, up.avatar_key, up.role FROM seller_profiles sp JOIN user_profiles up ON up.user_id=sp.user_id WHERE sp.user_id=?').bind(session.user.id).first<Record<string, unknown>>();
  if (!profile) redirect('/dang-ban');
  return { session, profile };
}

export async function requireAdmin(returnTo = '/admin') {
  const session = await requireSession(returnTo);
  const row = await getD1().prepare('SELECT role FROM user_profiles WHERE user_id=?').bind(session.user.id).first<{role:string}>();
  if (row?.role !== 'admin') redirect('/dashboard');
  return session;
}

export async function apiSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

type ApiSession = NonNullable<Awaited<ReturnType<typeof apiSession>>>;
type ApiError = { error: Response };
type ApiUserSuccess = { session: ApiSession; profile: Record<string, unknown> | null };
type ApiSellerSuccess = ApiUserSuccess & { seller: Record<string, unknown> };

export async function apiUser(request: Request): Promise<ApiError | ApiUserSuccess> {
  const session = await apiSession(request);
  if (!session) return { error: Response.json({ error: 'Bạn cần đăng nhập.' }, { status: 401 }) } as const;
  const profile = await getD1().prepare('SELECT * FROM user_profiles WHERE user_id=?').bind(session.user.id).first<Record<string, unknown>>();
  return { session, profile } as const;
}

export async function apiSeller(request: Request): Promise<ApiError | ApiSellerSuccess> {
  const user = await apiUser(request);
  if ('error' in user) return user;
  const seller = await getD1().prepare('SELECT * FROM seller_profiles WHERE user_id=?').bind(user.session.user.id).first<Record<string, unknown>>();
  if (!seller) return { error: Response.json({ error: 'Bạn chưa hoàn thành hồ sơ người bán.' }, { status: 403 }) } as const;
  return { ...user, seller } as const;
}

export async function apiAdmin(request: Request): Promise<ApiError | ApiUserSuccess> {
  const user = await apiUser(request);
  if ('error' in user) return user;
  if (user.profile?.role !== 'admin') return { error: Response.json({ error: 'Không có quyền quản trị.' }, { status: 403 }) } as const;
  return user;
}
