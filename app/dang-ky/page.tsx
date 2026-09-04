import type { Metadata } from 'next';
import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { AuthForm } from '../../components/AuthForm';
export const metadata:Metadata={title:'Đăng ký | Nhà Đẹp Chất',robots:{index:false,follow:false}};
export default function RegisterPage(){return <><MarketplaceHeader/><main className="subpage auth-page"><section className="auth-card"><p className="eyebrow">THAM GIA CỘNG ĐỒNG</p><h1>Tạo tài khoản</h1><p>Một tài khoản cho cả tải bản vẽ và đăng bán hồ sơ.</p><AuthForm mode="register"/></section></main></>}
