import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { MarketplaceHeader } from './MarketplaceHeader';

export function AuthShell({eyebrow,title,description,children}:{eyebrow:string;title:string;description:string;children:React.ReactNode}){
  return <><MarketplaceHeader/><main className="auth-layout"><aside className="auth-context"><Link className="logo auth-logo" href="/"><span className="logo-mark"><i/></span><span><b>NHÀ ĐẸP CHẤT</b><small>MẪU NHÀ · BẢN VẼ · KTS</small></span></Link><h2>Một tài khoản cho toàn bộ nền tảng</h2><p>Tìm kiếm, lưu, tải và chia sẻ hồ sơ xây dựng trong cùng một không gian làm việc.</p><ul><li><CheckCircle2/>Kho hồ sơ được kiểm duyệt</li><li><CheckCircle2/>File nguồn lưu trữ riêng tư</li><li><CheckCircle2/>Cộng đồng KTS và kỹ sư</li></ul></aside><section className="auth-card"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p>{children}</section></main></>;
}
