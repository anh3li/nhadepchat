import type { Metadata } from 'next';
import { ChangePasswordForm } from '../../../components/ChangePasswordForm';
import { DashboardShell } from '../../../components/DashboardShell';
import { getWorkspaceAccess, requireSession } from '../../../lib/server-auth';

export const metadata: Metadata = { title: 'Đổi mật khẩu | Nhà Đẹp Chất', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function ChangePasswordPage() {
  const session = await requireSession('/tai-khoan/doi-mat-khau');
  const access = await getWorkspaceAccess(session.user.id);
  return <DashboardShell name={session.user.name} admin={access.admin} seller={access.seller}>
    <section className="auth-card workspace-auth-card">
      <p className="eyebrow">BẢO MẬT TÀI KHOẢN</p>
      <h1>Đổi mật khẩu</h1>
      <p>Sau khi đổi, các phiên đăng nhập khác sẽ bị thu hồi và bạn cần đăng nhập lại.</p>
      <ChangePasswordForm />
    </section>
  </DashboardShell>;
}
