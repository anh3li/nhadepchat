import type { Metadata } from 'next';
import { MarketplaceHeader } from '../../../components/MarketplaceHeader';
import { ChangePasswordForm } from '../../../components/ChangePasswordForm';
import { requireSession } from '../../../lib/server-auth';

export const metadata: Metadata = { title: 'Đổi mật khẩu | Nhà Đẹp Chất', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function ChangePasswordPage() {
  await requireSession('/tai-khoan/doi-mat-khau');
  return <>
    <MarketplaceHeader/>
    <main className="subpage auth-page">
      <section className="auth-card">
        <p className="eyebrow">BẢO MẬT TÀI KHOẢN</p>
        <h1>Đổi mật khẩu</h1>
        <p>Sau khi đổi, các phiên đăng nhập khác sẽ bị thu hồi và bạn cần đăng nhập lại.</p>
        <ChangePasswordForm/>
      </section>
    </main>
  </>;
}
