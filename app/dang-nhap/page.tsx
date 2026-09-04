import type { Metadata } from 'next';
import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { AuthForm } from '../../components/AuthForm';
export const metadata:Metadata={title:'Đăng nhập | Nhà Đẹp Chất',robots:{index:false,follow:false}};
export default function LoginPage(){return <><MarketplaceHeader/><main className="subpage auth-page"><section className="auth-card"><p className="eyebrow">NHÀ ĐẸP CHẤT</p><h1>Đăng nhập</h1><p>Đăng nhập để tải hồ sơ, đăng bán và quản lý sản phẩm.</p><AuthForm mode="login"/></section></main></>}
