/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import { BrandLogo } from '../components/BrandLogo';
import { HomeDrawings } from '../components/HomeDrawings';
import { getHomeData } from '../lib/home-data';

const collections = [
  { id: 'nha-pho-5m', name: 'NHÀ PHỐ 5M' },
  { id: 'biet-thu-2-tang', name: 'BIỆT THỰ 2 TẦNG' },
  { id: 'nha-cap-4-dep', name: 'NHÀ CẤP 4 ĐẸP' },
  { id: 'nha-xuong-tieu-chuan', name: 'NHÀ XƯỞNG TIÊU CHUẨN' },
  { id: 'file-ket-cau-hay', name: 'FILE KẾT CẤU HAY' },
];

const number = (value: unknown) => Number(value || 0).toLocaleString('vi-VN');

const heroBlueprint = <svg className="hero-blueprint-art" viewBox="0 0 640 440" aria-hidden="true">
  <path d="M92 316V203l228-146 228 146v113H92Z"/>
  <path d="M148 316V220h126v96m92 0V180h122v136M320 58v258M92 252h456"/>
  <path d="M176 220v-54h70v54m150 32v-45h62v45M205 316v-56h42v56m169 0v-64h38v64"/>
  <path className="measure" d="M92 350h456M92 339v22m456-22v22M70 203V316M59 203h22m-22 113h22"/>
  <circle cx="320" cy="58" r="7"/>
</svg>;

export default async function Home() {
  const data = await getHomeData();
  const products = data.products as any[];
  const popular = data.popular as any[];
  const architects = data.architects as any[];
  const stats = data.stats as Record<string, number>;
  const activeCollections = collections.filter((item) => Number(data.collections[item.id]?.count || 0) > 0);
  const heroImage = '/hero-cover-v1.webp';

  return <>
    <main className="shell marketplace marketplace-v2">
      <section className="hero-main">
        <div className="hero-copy">
          <p className="eyebrow">THƯ VIỆN HỒ SƠ XÂY DỰNG</p>
          <h1>Tìm đúng hồ sơ<br/>bạn cần</h1>
          <p className="hero-description">Kho bản vẽ kiến trúc, kết cấu, MEP, dự toán<br/>được chia sẻ bởi cộng đồng KTS & kỹ sư.</p>
          <div className="hero-actions"><a className="primary-btn" href="#drawings">Tìm bản vẽ ngay</a><Link className="secondary-btn" href="/tim-kiem?q=miễn phí">Bản vẽ miễn phí</Link></div>
          <div className="hero-stats"><span><b>{number(stats.product_count)}</b>Hồ sơ bản vẽ</span><span><b>{number(stats.free_count)}</b>Bản vẽ miễn phí</span><span><b>{number(stats.seller_count)}</b>KTS & kỹ sư</span><span><b>{number(stats.download_count)}</b>Lượt tải</span></div>
        </div>
        <div className="hero-visual"><div className="blueprint-lines"/>{heroImage?<SafeImage src={heroImage} alt="Kiến trúc nhà phố hiện đại" loading="eager" fetchPriority="high" fallbackClassName="hero-image-placeholder" fallback={heroBlueprint}/>:<span className="hero-image-placeholder" aria-hidden>{heroBlueprint}</span>}<div className="blueprint-card"><small>HỒ SƠ ĐẦY ĐỦ</small><b>NHÀ PHỐ 5 × 20M</b><span>KT · KC · MEP · DT</span></div></div>
      </section>

      <aside className="architect-panel">
        <div className="panel-head"><h2>KTS NỔI BẬT</h2><Link href="/cong-dong?sap-xep=noi-bat">Xem tất cả →</Link></div>
        {architects.length ? architects.map((person) => { const avatar=person.avatar_key?`/api/profile-avatar/${person.user_id}?v=${encodeURIComponent(person.avatar_key)}`:person.account_image||''; return <Link className="architect-row" href={`/kts/${person.slug}`} key={person.slug}>{avatar?<SafeImage src={avatar} alt={person.display_name}/>:<span className="architect-avatar">{String(person.display_name).split(' ').slice(-2).map((part:string)=>part[0]).join('')}</span>}<div><h3>{person.display_name}{person.verification_status==='verified'&&<BadgeCheck aria-label="Đã xác minh"/>}</h3><p>{number(person.file_count)} hồ sơ · {number(person.download_count)} lượt tải</p></div><span className="architect-rating">★ {person.review_count?Number(person.rating).toFixed(1):'Mới'}</span></Link> }) : <div className="panel-empty">Chưa có KTS nổi bật.</div>}
      </aside>

      <HomeDrawings products={products}/>

      <aside className="popular-panel">
        <div className="panel-head"><h2>BẢN VẼ TẢI NHIỀU</h2><Link href="/tim-kiem?sap-xep=tai-nhieu">Xem tất cả →</Link></div>
        {popular.length ? popular.slice(0, 5).map((product) => { const image=product.cover_id?`/api/assets/${product.cover_id}`:''; const size=product.width&&product.length?`${product.width} × ${product.length}m`:'Chưa cập nhật'; return <Link className="popular-row" href={`/ban-ve/${product.slug}`} key={product.id}>{image?<SafeImage className="popular-media" src={image} alt={product.title}/>:<span className="image-placeholder popular-media"/>}<span><strong>{product.title}</strong><small>{size} · {number(product.download_count)} lượt tải</small></span><b className={product.is_free?'free-price':''}>{product.is_free?'MIỄN PHÍ':`${number(product.price)}đ`}</b></Link> }) : <div className="panel-empty">Chưa có dữ liệu lượt tải.</div>}
      </aside>

      <section className="collections" id="collections">
        <div className="section-heading home-classic-heading"><h2>BỘ SƯU TẬP NỔI BẬT</h2><Link href="/bo-suu-tap">Xem tất cả →</Link></div>
        {activeCollections.length ? <div className="collection-grid">{activeCollections.map((item) => { const summary=data.collections[item.id]; const image=summary.cover_id?`/api/assets/${summary.cover_id}`:''; return <Link className="collection-card" href={`/bo-suu-tap#${item.id}`} key={item.id}>{image?<SafeImage src={image} alt={item.name}/>:<span className="image-placeholder"/>}<span><strong>{item.name}</strong><small>{number(summary.count)} hồ sơ</small></span></Link> })}</div> : <div className="empty-state"><h2>Chưa có bộ sưu tập nổi bật</h2><p>Bộ sưu tập sẽ xuất hiện khi có hồ sơ phù hợp đã được duyệt.</p></div>}
      </section>
    </main>
    <footer><div className="shell footer-inner"><BrandLogo className="footer-logo"/><p>Nền tảng chia sẻ hồ sơ xây dựng từ cộng đồng kiến trúc sư và kỹ sư Việt Nam.</p><nav><Link href="/tim-kiem">Bản vẽ</Link><Link href="/bo-suu-tap">Bộ sưu tập</Link><Link href="/cong-dong">Cộng đồng</Link><Link href="/dang-ban">Đăng bán</Link></nav></div></footer>
  </>;
}
