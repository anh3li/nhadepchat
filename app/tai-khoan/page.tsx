import type { Metadata } from 'next';
import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { AccountPanel } from '../../components/AccountPanel';
import { requireSession } from '../../lib/server-auth';
import { getD1 } from '../../db';
export const metadata:Metadata={title:'Tài khoản | Nhà Đẹp Chất',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function AccountPage(){const session=await requireSession('/tai-khoan');const profile=await getD1().prepare('SELECT role,avatar_key FROM user_profiles WHERE user_id=?').bind(session.user.id).first<{role:string;avatar_key:string|null}>();return <><MarketplaceHeader/><main className="subpage account-page"><div className="page-title"><p className="eyebrow">TÀI KHOẢN</p><h1>Xin chào, {session.user.name}</h1><p>Quản lý thông tin cá nhân và quyền truy cập của bạn.</p></div><AccountPanel name={session.user.name} email={session.user.email} role={profile?.role||'user'} avatarUrl={profile?.avatar_key?`/api/profile-avatar/${session.user.id}`:null}/></main></>}
