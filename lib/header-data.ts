import { getD1 } from '../db';
import { getSession } from './server-auth';

export type HeaderViewer = {
  user_id: string;
  display_name: string;
  avatar_key: string | null;
  account_image: string | null;
  role: 'user' | 'seller' | 'admin';
  seller_id: string | null;
};

export type HeaderData = {
  viewer: HeaderViewer | null;
  cartCount: number;
};

const emptyHeader: HeaderData = { viewer: null, cartCount: 0 };

export async function getHeaderData(): Promise<HeaderData> {
  try {
    const session = await getSession();
    if (!session) return emptyHeader;

    const db = getD1();
    const [profile, cart] = await Promise.all([
      db.prepare(`SELECT up.user_id,up.display_name,up.avatar_key,up.role,sp.id seller_id
        FROM user_profiles up
        LEFT JOIN seller_profiles sp ON sp.user_id=up.user_id
        WHERE up.user_id=? LIMIT 1`).bind(session.user.id).first<Record<string, unknown>>(),
      db.prepare('SELECT COUNT(*) total FROM cart_items WHERE user_id=?').bind(session.user.id).first<{ total: number }>(),
    ]);

    return {
      viewer: {
        user_id: session.user.id,
        display_name: String(profile?.display_name || session.user.name || 'Thành viên'),
        avatar_key: profile?.avatar_key ? String(profile.avatar_key) : null,
        account_image: session.user.image || null,
        role: profile?.role === 'admin' || profile?.role === 'seller' ? profile.role : 'user',
        seller_id: profile?.seller_id ? String(profile.seller_id) : null,
      },
      cartCount: Number(cart?.total || 0),
    };
  } catch {
    return emptyHeader;
  }
}
