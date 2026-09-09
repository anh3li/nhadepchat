import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileCheck2, FolderSearch, HardHat, Share2 } from 'lucide-react';
import { SafeImage } from '../../components/SafeImage';
import './about.css';

export const metadata: Metadata = {
  title: 'Giới thiệu Nhà Đẹp Chất | Bản vẽ nhà đẹp và mẫu nhà đẹp',
  description: 'Tìm hiểu Nhà Đẹp Chất - thư viện bản vẽ nhà đẹp, mẫu nhà đẹp và file bản vẽ nhà đẹp dành cho gia chủ, kiến trúc sư và kỹ sư.',
  keywords: ['bản vẽ nhà đẹp', 'mẫu nhà đẹp', 'file bản vẽ nhà đẹp', 'nhà đẹp chất'],
  alternates: { canonical: '/gioi-thieu' },
};

const benefits = [
  { icon: FolderSearch, title: 'Tìm đúng hồ sơ', text: 'Lọc theo loại công trình, chuyên môn, kích thước, định dạng và nhu cầu sử dụng.' },
  { icon: FileCheck2, title: 'Thông tin rõ ràng', text: 'Mỗi hồ sơ có ảnh preview, thông số, định dạng bàn giao và thông tin người chia sẻ.' },
  { icon: HardHat, title: 'Dành cho người làm thật', text: 'Hỗ trợ gia chủ, kiến trúc sư, kỹ sư và đội thi công tham khảo nhanh hơn.' },
  { icon: Share2, title: 'Chia sẻ chuyên môn', text: 'Người bán có thể giới thiệu hồ sơ xây dựng và tiếp cận cộng đồng đúng nhu cầu.' },
];

const audiences = [
  ['Gia chủ', 'Tham khảo mẫu nhà đẹp, mặt bằng và giải pháp phù hợp với khu đất.'],
  ['Kiến trúc sư', 'Tìm tư liệu, mẫu tham khảo và chia sẻ hồ sơ đến đúng cộng đồng chuyên môn.'],
  ['Kỹ sư', 'Khám phá bản vẽ kết cấu, MEP, dự toán và các file kỹ thuật liên quan.'],
];

export default function AboutPage() {
  return <main className="about-page">
    <section className="about-hero">
      <div className="about-hero-copy">
        <p className="eyebrow">VỀ NHÀ ĐẸP CHẤT</p>
        <h1>Nơi tìm bản vẽ nhà đẹp và mẫu nhà đẹp đáng tin cậy.</h1>
        <p className="about-lead">Nhà Đẹp Chất là thư viện hồ sơ xây dựng dành cho những người đang tìm ý tưởng, tài liệu tham khảo hoặc file bản vẽ phục vụ công việc thực tế.</p>
        <div className="about-actions"><Link className="button button-primary" href="/tim-kiem">Xem bản vẽ nhà đẹp <ArrowRight size={17}/></Link><Link className="button outline-action" href="/dang-ban">Chia sẻ hồ sơ</Link></div>
      </div>
      <div className="about-hero-media"><SafeImage src="/hero-architecture-v2.webp" alt="Mẫu nhà đẹp hiện đại trong thư viện Nhà Đẹp Chất" loading="eager" fetchPriority="high"/></div>
    </section>

    <section className="about-intro" aria-labelledby="about-intro-title">
      <div><p className="eyebrow">THƯ VIỆN BẢN VẼ</p><h2 id="about-intro-title">Từ ý tưởng mẫu nhà đến hồ sơ có thể tham khảo.</h2></div>
      <p>Chúng tôi tập trung vào bản vẽ nhà đẹp, hồ sơ kiến trúc, kết cấu, MEP, nội thất và tài liệu kỹ thuật. Nội dung được trình bày theo nhóm dễ tìm, giúp bạn tiết kiệm thời gian trước khi trao đổi với kiến trúc sư hoặc bắt tay vào triển khai.</p>
    </section>

    <section className="about-benefits" aria-labelledby="benefits-title">
      <div className="about-section-heading"><p className="eyebrow">GIÁ TRỊ CỐT LÕI</p><h2 id="benefits-title">Một không gian gọn gàng cho hồ sơ xây dựng.</h2></div>
      <div className="about-benefit-grid">{benefits.map(({ icon: Icon, title, text }) => <article key={title}><Icon aria-hidden size={24}/><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className="about-audience" aria-labelledby="audience-title">
      <div className="about-audience-media"><SafeImage src="/collection-covers-v1.webp" alt="Các nhóm mẫu nhà đẹp và bản vẽ được tuyển chọn"/></div>
      <div className="about-audience-copy"><p className="eyebrow">AI CÓ THỂ SỬ DỤNG?</p><h2 id="audience-title">Mỗi người bắt đầu từ một nhu cầu khác nhau.</h2><div className="audience-list">{audiences.map(([title, text]) => <div key={title}><CheckCircle2 size={19}/><p><strong>{title}</strong>{text}</p></div>)}</div></div>
    </section>

    <section className="about-process" aria-labelledby="process-title">
      <div className="about-section-heading"><p className="eyebrow">CÁCH HOẠT ĐỘNG</p><h2 id="process-title">Bốn bước để tìm và sử dụng hồ sơ phù hợp.</h2></div>
      <ol><li><b>01</b><h3>Tìm kiếm</h3><p>Nhập loại nhà, kích thước, phong cách hoặc chuyên môn cần tìm.</p></li><li><b>02</b><h3>Đối chiếu</h3><p>Xem ảnh, thông số, định dạng và thông tin hồ sơ trước khi lựa chọn.</p></li><li><b>03</b><h3>Lưu hoặc tải</h3><p>Lưu lại hồ sơ quan tâm và tải file theo điều kiện của từng hồ sơ.</p></li><li><b>04</b><h3>Chia sẻ</h3><p>Đăng hồ sơ của bạn để đóng góp cho cộng đồng xây dựng.</p></li></ol>
    </section>

    <section className="about-cta"><div><p className="eyebrow">BẮT ĐẦU NGAY</p><h2>Khám phá thư viện bản vẽ nhà đẹp.</h2><p>Tìm mẫu nhà, file bản vẽ và tài liệu xây dựng phù hợp với công việc của bạn.</p></div><Link className="button button-primary" href="/tim-kiem">Tìm tất cả bản vẽ <ArrowRight size={17}/></Link></section>
  </main>;
}
