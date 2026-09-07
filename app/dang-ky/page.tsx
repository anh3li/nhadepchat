import type { Metadata } from 'next';
import { AuthForm } from '../../components/AuthForm';
import { googleAuthEnabled } from '../../lib/google-auth';
import { AuthShell } from '../../components/AuthShell';
export const metadata:Metadata={title:'Đăng ký | Nhà Đẹp Chất',robots:{index:false,follow:false}};
export const dynamic = 'force-dynamic';
export default function RegisterPage(){return <AuthShell eyebrow="THAM GIA CỘNG ĐỒNG" title="Tạo tài khoản" description="Một tài khoản cho cả tải bản vẽ và đăng bán hồ sơ."><AuthForm googleEnabled={googleAuthEnabled()} mode="register"/></AuthShell>}
