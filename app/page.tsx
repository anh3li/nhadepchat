'use client';

import { useMemo, useState } from 'react';

const products = [
  { id: 1, title: 'Hồ sơ nhà phố 5x20m 2 tầng mái bằng', size: '5 × 20m', floors: '02 tầng', files: 'DWG · SKP · XLSX', views: 328, price: '49.000đ', image: 'https://static.kienviet.net/storage/uploads/2025/01/rio-house-nha-pho-huong-tay-voi-vuon-cay-xanh-mat-hava-studio_2.jpg', type: 'Hồ sơ kiến trúc', architect: 'Nguyễn Minh Khang' },
  { id: 2, title: 'Bản vẽ nhà phố 4x18m hiện đại có gara', size: '4 × 18m', floors: '03 tầng', files: 'DWG · PDF · SKP', views: 814, price: '69.000đ', image: 'https://static-6.happynest.vn/storage/uploads/2022/03/e9d52a32eac6c72e29b4208375ea2077.jpg', type: 'Kiến trúc + Kết cấu', architect: 'Trần Hải Nam' },
  { id: 3, title: 'Hồ sơ kiến trúc nhà mái Thái 1 tầng', size: '8 × 12m', floors: '01 tầng', files: 'DWG · PDF', views: 1290, price: 'MIỄN PHÍ', image: 'https://3adesign.vn/wp-content/uploads/mat-tien-nha-dep-anh-minh-long-thanh-3-3.jpg', type: 'Hồ sơ kiến trúc', architect: 'Lê Hoàng Anh' },
  { id: 4, title: 'Nhà phố 5x16m mặt tiền lam gỗ', size: '5 × 16m', floors: '03 tầng', files: 'DWG · SKP · PDF', views: 506, price: '39.000đ', image: 'https://static.kienviet.net/storage/uploads/2024/06/kienviet-a2-house28-1718640013.jpg', type: 'Kiến trúc + Nội thất', architect: 'Phạm Thu Hà' },
  { id: 5, title: 'Thiết kế nhà phố xanh 4 tầng', size: '5 × 22m', floors: '04 tầng', files: 'DWG · SKP', views: 967, price: '79.000đ', image: 'https://static.kienviet.net/storage/uploads/2025/01/kienviet-top10-house-rio-house-kientruchava-1-1736927162.jpg', type: 'Hồ sơ đầy đủ', architect: 'Vũ Đức Long' },
  { id: 6, title: 'Hồ sơ nhà phố có gara ô tô', size: '6 × 18m', floors: '03 tầng', files: 'DWG · XLSX · PDF', views: 742, price: '59.000đ', image: 'https://static-2.happynest.vn/storage/uploads/2022/11/nha-pho-co-gara-de-xe-21-1667295187.jpg', type: 'Kiến trúc + Dự toán', architect: 'Nguyễn Minh Khang' },
];

const drawingMenu = [
  { title: 'Theo công trình', links: ['Nhà phố','Nhà cấp 4','Biệt thự','Nhà vườn','Nhà xưởng','Văn phòng','Trường học','Chung cư'] },
  { title: 'Theo hồ sơ', links: ['Kiến trúc','Kết cấu','Điện','Cấp thoát nước','MEP','Nội thất','Quy hoạch','Biện pháp thi công'] },
  { title: 'Tài nguyên', links: ['AutoCAD','SketchUp','Revit','Excel dự toán','File tính kết cấu','Block CAD','Thuyết minh','Bản vẽ miễn phí'] },
];

const architects = [
  { name: 'Nguyễn Minh Khang', role: 'KTS', files: 86, downloads: '12,4K', rating: '4.9', initials: 'MK' },
  { name: 'Trần Hải Nam', role: 'Kỹ sư', files: 64, downloads: '9,8K', rating: '4.8', initials: 'HN' },
  { name: 'Phạm Thu Hà', role: 'KTS nội thất', files: 51, downloads: '7,2K', rating: '4.9', initials: 'TH' },
];

function Header() {
  const [open, setOpen] = useState<'drawings'|'community'|null>(null);
  const [mobile, setMobile] = useState(false);
  return <header className="site-header"><div className="shell header-inner">
    <a className="logo" href="#" aria-label="Kho Bản Vẽ"><span className="logo-roof">BV</span><span><b>KHO BẢN VẼ</b><small>KIẾN TRÚC & XÂY DỰNG</small></span></a>
    <form className="search" onSubmit={e=>e.preventDefault()}><input aria-label="Tìm kiếm bản vẽ" placeholder="Tìm nhà 5x20, biệt thự 2 tầng, file CAD..."/><button aria-label="Tìm kiếm">⌕</button></form>
    <nav className={mobile?'main-nav mobile-open':'main-nav'}>
      <div className="nav-group" onMouseEnter={()=>setOpen('drawings')} onMouseLeave={()=>setOpen(null)}><button onClick={()=>setOpen(open==='drawings'?null:'drawings')}>Bản vẽ <span>⌄</span></button>{open==='drawings'&&<MegaMenu/>}</div>
      <a href="#collections">Bộ sưu tập</a>
      <div className="nav-group community" onMouseEnter={()=>setOpen('community')} onMouseLeave={()=>setOpen(null)}><button onClick={()=>setOpen(open==='community'?null:'community')}>Cộng đồng <span>⌄</span></button>{open==='community'&&<CommunityMenu/>}</div>
      <a href="#sell">Đăng bán</a><a className="nav-icon" href="#cart">Giỏ hàng <i>0</i></a><a className="account-link" href="#account"><span>TK</span>Tài khoản</a>
    </nav><button className="menu-toggle" onClick={()=>setMobile(!mobile)} aria-label="Mở menu">☰</button>
  </div></header>;
}

function MegaMenu(){return <div className="mega-menu">{drawingMenu.map(group=><section key={group.title}><h3>{group.title}</h3>{group.links.map(link=><a href="#drawings" key={link}>{link}</a>)}</section>)}</div>}
function CommunityMenu(){return <div className="community-menu">{['Danh sách KTS','KTS nổi bật','KTS mới tham gia','Kỹ sư','Nhà thiết kế nội thất','Nhà thầu','Hoạt động mới','Yêu cầu bản vẽ'].map(x=><a href="#architects" key={x}>{x}</a>)}</div>}

function ArchitectPanel(){return <aside className="architect-panel" id="architects"><div className="panel-head"><h2>KTS NỔI BẬT</h2><span>Tuần này</span></div>{architects.map((a,index)=><article className="architect-row" key={a.name}><span className={`avatar avatar-${index+1}`}>{a.initials}</span><div className="architect-info"><h3>{a.name}<b title="Đã xác minh">✓</b></h3><p>{a.role} · {a.files} hồ sơ</p><small>{a.downloads} lượt tải</small></div><strong>★ {a.rating}</strong></article>)}<a className="view-all" href="#">Xem tất cả KTS <span>→</span></a></aside>}

function Hero(){return <section className="shell hero"><div className="hero-main"><div className="hero-copy"><p className="eyebrow">THƯ VIỆN HỒ SƠ XÂY DỰNG</p><h1>Tìm đúng hồ sơ<br/>bạn cần</h1><p className="hero-description">Kho bản vẽ kiến trúc, kết cấu, MEP, dự toán được chia sẻ bởi cộng đồng KTS & kỹ sư.</p><div className="hero-actions"><a className="primary-btn" href="#drawings">Tìm bản vẽ ngay</a><a className="secondary-btn" href="#free">Bản vẽ miễn phí</a></div><div className="hero-stats"><span><b>12.480+</b> hồ sơ</span><span><b>860+</b> KTS & kỹ sư</span></div></div><div className="hero-visual"><img src={products[1].image} alt="Kiến trúc nhà phố hiện đại"/><div className="blueprint-card"><small>HỒ SƠ MẪU</small><b>NHÀ PHỐ 5 × 20M</b><span>KT · KC · MEP · DT</span></div></div></div><ArchitectPanel/></section>}

function ProductCard({product,onOpen}:{product:typeof products[number];onOpen:()=>void}){return <article className="product-card" onClick={onOpen} tabIndex={0} onKeyDown={e=>(e.key==='Enter'||e.key===' ')&&onOpen()}><div className="product-image"><img src={product.image} alt={product.title} loading="lazy"/><span className="save">♡</span>{product.price==='MIỄN PHÍ'&&<b className="free-label">MIỄN PHÍ</b>}</div><div className="product-body"><p className="product-type">{product.type}</p><h3>{product.title}</h3><div className="specs"><span>{product.size}</span><span>{product.floors}</span></div><p className="formats">{product.files}</p><div className="author"><span className="tiny-avatar">{product.architect.split(' ').slice(-2).map(x=>x[0]).join('')}</span><span>{product.architect}<b>✓</b></span><strong className={product.price==='MIỄN PHÍ'?'free-price':''}>{product.price}</strong></div></div></article>}

function Drawings({onOpen}:{onOpen:(p:typeof products[number])=>void}){const[sort,setSort]=useState('Mới nhất');const sorted=useMemo(()=>sort==='Tải nhiều'?[...products].sort((a,b)=>b.views-a.views):products,[sort]);return <section className="shell drawings" id="drawings"><div className="section-heading"><div><p>MỚI ĐƯỢC CHIA SẺ</p><h2>BẢN VẼ MỚI</h2></div><div><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sắp xếp"><option>Mới nhất</option><option>Tải nhiều</option><option>Giá thấp</option><option>Giá cao</option></select><a href="#">Xem tất cả <span>→</span></a></div></div><div className="product-grid">{sorted.slice(0,5).map(p=><ProductCard key={p.id} product={p} onOpen={()=>onOpen(p)}/>)}</div></section>}

const collections = [
  { name: 'Nhà phố 5m', count: 284, image: products[0].image },
  { name: 'Biệt thự 2 tầng', count: 156, image: products[2].image },
  { name: 'Nhà cấp 4 đẹp', count: 319, image: products[5].image },
  { name: 'Nhà xưởng tiêu chuẩn', count: 92, image: products[3].image },
  { name: 'File kết cấu hay', count: 147, image: products[4].image },
];

function PopularPanel({onOpen}:{onOpen:(p:typeof products[number])=>void}){return <aside className="popular-panel"><div className="panel-head"><h2>TẢI NHIỀU NHẤT</h2><span>30 ngày</span></div>{[...products].sort((a,b)=>b.views-a.views).slice(0,4).map((p,index)=><button className="popular-row" key={p.id} onClick={()=>onOpen(p)}><b>0{index+1}</b><img src={p.image} alt="" loading="lazy"/><span><strong>{p.title}</strong><small>{p.views.toLocaleString('vi-VN')} lượt tải</small></span></button>)}<a className="view-all" href="#drawings">Xem bảng xếp hạng <span>→</span></a></aside>}

function Collections({onOpen}:{onOpen:(p:typeof products[number])=>void}){return <section className="collections-section" id="collections"><div className="shell lower-grid"><div><div className="section-heading compact"><div><p>KHÁM PHÁ THEO CHỦ ĐỀ</p><h2>BỘ SƯU TẬP NỔI BẬT</h2></div><a href="#">Tất cả bộ sưu tập <span>→</span></a></div><div className="collection-grid">{collections.map((c,index)=><a className="collection-card" href="#drawings" key={c.name} onClick={()=>onOpen(products[index])}><img src={c.image} alt={c.name} loading="lazy"/><span><strong>{c.name}</strong><small>{c.count} hồ sơ</small></span></a>)}</div></div><PopularPanel onOpen={onOpen}/></div></section>}

function Footer(){return <footer><div className="shell footer-inner"><a className="logo footer-logo" href="#"><span className="logo-roof">BV</span><span><b>KHO BẢN VẼ</b><small>KIẾN TRÚC & XÂY DỰNG</small></span></a><p>Nền tảng chia sẻ hồ sơ xây dựng từ cộng đồng kiến trúc sư và kỹ sư Việt Nam.</p><nav><a href="#drawings">Bản vẽ</a><a href="#collections">Bộ sưu tập</a><a href="#architects">Kiến trúc sư</a><a href="#sell">Đăng bán</a></nav></div></footer>}

function DetailModal({selected,onClose}:{selected:typeof products[number];onClose:()=>void}){return <div className="modal-backdrop" onClick={onClose}><article className="detail-modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={onClose}>×</button><img src={selected.image} alt={selected.title}/><div><small>BV-002841</small><h2>{selected.title}</h2><dl><dt>Kích thước</dt><dd>{selected.size}</dd><dt>Số tầng</dt><dd>{selected.floors}</dd><dt>Định dạng</dt><dd>{selected.files}</dd><dt>Dung lượng</dt><dd>84MB</dd></dl><p className="includes">✓ Kiến trúc &nbsp; ✓ Kết cấu &nbsp; ✓ Điện nước<br/>✓ SketchUp &nbsp; ✓ Dự toán</p><strong className="detail-price">{selected.price}</strong><button className="download">TẢI HỒ SƠ</button></div></article></div>}

export default function Home(){const[selected,setSelected]=useState<(typeof products)[number]|null>(null);return <><Header/><main><Hero/><Drawings onOpen={setSelected}/><Collections onOpen={setSelected}/></main><Footer/>{selected&&<DetailModal selected={selected} onClose={()=>setSelected(null)}/>}</>}
