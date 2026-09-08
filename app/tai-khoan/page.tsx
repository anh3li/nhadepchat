import type { Metadata } from 'next';
import { AccountPanel } from '../../components/AccountPanel';
import { DashboardShell } from '../../components/DashboardShell';
import { getWorkspaceAccess, requireSession } from '../../lib/server-auth';

export const metadata: Metadata = { title: 'Tài khoản | Nhà Đẹp Chất', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await requireSession('/tai-khoan');
  const access = await getWorkspaceAccess(session.user.id);
  return <DashboardShell name={session.user.name} admin={access.admin} seller={access.seller}>
    <div className="dashboard-heading"><div><p className="eyebrow">TÀI KHOẢN</p><h1>Xin chào, {session.user.name}</h1><p>Quản lý thông tin cá nhân và quyền truy cập của bạn.</p></div></div>
    <div className="account-page"><AccountPanel name={session.user.name} email={session.user.email} role={access.role} seller={access.seller} avatarUrl={access.avatarKey ? `/api/profile-avatar/${session.user.id}?v=${encodeURIComponent(access.avatarKey)}` : null} /></div>
  </DashboardShell>;
}
