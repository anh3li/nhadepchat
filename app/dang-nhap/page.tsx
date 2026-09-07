import type { Metadata } from 'next';
import { AuthForm } from '../../components/AuthForm';
import { googleAuthEnabled } from '../../lib/google-auth';
import { AuthShell } from '../../components/AuthShell';
export const metadata:Metadata={title:'Đăng nhập | Nhà Đẹp Chất',robots:{index:false,follow:false}};
export const dynamic = 'force-dynamic';
export default function LoginPage(){return <AuthShell eyebrow="CHÀO MỪNG TRỞ LẠI" title="Đăng nhập" description="Tiếp tục tải hồ sơ, đăng bán và quản lý sản phẩm."><AuthForm googleEnabled={googleAuthEnabled()} mode="login"/></AuthShell>}
