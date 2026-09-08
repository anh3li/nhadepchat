import { CheckCircle2 } from 'lucide-react';

export function AuthShell({eyebrow,title,description,children}:{eyebrow:string;title:string;description:string;children:React.ReactNode}){
  return <main className="auth-layout"><aside className="auth-context"><h2>Một tài khoản cho toàn bộ nền tảng</h2><p>Tìm kiếm, lưu, tải và chia sẻ hồ sơ xây dựng trong cùng một không gian làm việc.</p><ul><li><CheckCircle2/>Kho hồ sơ được kiểm duyệt</li><li><CheckCircle2/>File nguồn lưu trữ riêng tư</li><li><CheckCircle2/>Cộng đồng KTS và kỹ sư</li></ul></aside><section className="auth-card"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p>{children}</section></main>;
}
