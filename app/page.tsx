/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- homepage adapter consumes the dynamic public D1 payload.
'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Building, Building2, ChevronDown, Download, DraftingCompass,
  Droplets, Factory, FileType2, Home as HomeIcon, House, Landmark, Layers3,
  Menu, School, Search, ShoppingCart, Zap,
  type LucideIcon,
} from 'lucide-react';
import { FavoriteButton } from '../components/FavoriteButton';

type Product = {id:string;slug:string;title:string;size:string;floors:string;files:string;views:number;price:string;image:string;type:string;architect:string;badge:string};
type Architect = {slug:string;name:string;files:number;downloads:string;photo?:string;verified:boolean};
const heroImage='https://static-6.happynest.vn/storage/uploads/2022/03/e9d52a32eac6c72e29b4208375ea2077.jpg';

const drawingMenu = [
  { title: 'Theo công trình', links: ['Nhà phố','Nhà cấp 4','Biệt thự','Nhà vườn','Nhà xưởng','Văn phòng','Trường học','Chung cư'] },
  { title: 'Theo hồ sơ', links: ['Kiến trúc','Kết cấu','Điện','Cấp thoát nước','MEP','Nội thất','Quy hoạch','Biện pháp thi công'] },
  { title: 'Tài nguyên', links: ['AutoCAD','SketchUp','Revit','Excel dự toán','File tính kết cấu','Block CAD','Thuyết minh','Bản vẽ miễn phí'] },
];

const menuIcons: Record<string, LucideIcon> = {
  'Nhà phố': House,
  'Nhà cấp 4': HomeIcon,
  'Biệt thự': Landmark,
  'Nhà xưởng': Factory,
  'Văn phòng': Building,
  'Trường học': School,
  'Chung cư': Building2,
  'Kiến trúc': DraftingCompass,
  'Kết cấu': Layers3,
  'Điện': Zap,
  'Cấp thoát nước': Droplets,
  'AutoCAD': FileType2,
  'Bản vẽ miễn phí': Download,
};

const collections = [
  { name: 'NHÀ PHỐ 5M', count: 24, image: 'https://static.kienviet.net/storage/uploads/2025/01/rio-house-nha-pho-huong-tay-voi-vuon-cay-xanh-mat-hava-studio_2.jpg' },
  { name: 'BIỆT THỰ 2 TẦNG', count: 36, image: 'https://3adesign.vn/wp-content/uploads/mat-tien-nha-dep-anh-minh-long-thanh-3-3.jpg' },
  { name: 'NHÀ CẤP 4 ĐẸP', count: 18, image: 'https://static-2.happynest.vn/storage/uploads/2022/11/nha-pho-co-gara-de-xe-21-1667295187.jpg' },
  { name: 'NHÀ XƯỞNG TIÊU CHUẨN', count: 12, image: 'https://static.kienviet.net/storage/uploads/2024/06/kienviet-a2-house28-1718640013.jpg' },
  { name: 'FILE KẾT CẤU HAY', count: 42, image: 'https://static.kienviet.net/storage/uploads/2025/01/kienviet-top10-house-rio-house-kientruchava-1-1736927162.jpg' },
];

function Header() {
  const [open, setOpen] = useState<'drawings'|'community'|null>(null);
  const [pinned, setPinned] = useState<'drawings'|'community'|null>(null);
  const [mobile, setMobile] = useState(false);
  const toggleMenu = (menu: 'drawings'|'community') => {
    if (pinned === menu) {
      setPinned(null);
      setOpen(null);
      return;
    }
    setPinned(menu);
    setOpen(menu);
  };
  return <header className="site-header"><div className="shell header-inner">
    <a className="logo" href="#" aria-label="Nhà Đẹp Chất"><span className="logo-mark"><i/></span><span><b>NHÀ ĐẸP CHẤT</b><small>MẪU NHÀ · BẢN VẼ · KTS</small></span></a>
    <form className="search" role="search" action="/tim-kiem"><input type="search" name="q" aria-label="Tìm kiếm bản vẽ" placeholder="Tìm nhà 5x20, biệt thự 2 tầng, file CAD..."/><button type="submit" aria-label="Tìm kiếm"><Search aria-hidden="true" size={20} strokeWidth={1.8}/></button></form>
    <nav className={mobile?'main-nav mobile-open':'main-nav'}>
      <div className="nav-group" onMouseEnter={()=>!pinned&&setOpen('drawings')} onMouseLeave={()=>!pinned&&setOpen(null)}><button type="button" className={open==='drawings'?'open':''} aria-expanded={open==='drawings'} aria-controls="drawings-mega-menu" onClick={()=>toggleMenu('drawings')}>Bản vẽ <ChevronDown aria-hidden="true" className="nav-chevron" size={15} strokeWidth={1.8}/></button>{open==='drawings'&&<MegaMenu/>}</div>
      <a href="#collections">Bộ sưu tập</a>
      <div className="nav-group community" onMouseEnter={()=>!pinned&&setOpen('community')} onMouseLeave={()=>!pinned&&setOpen(null)}><button type="button" className={open==='community'?'open':''} aria-expanded={open==='community'} aria-controls="community-menu" onClick={()=>toggleMenu('community')}>Cộng đồng <ChevronDown aria-hidden="true" className="nav-chevron" size={15} strokeWidth={1.8}/></button>{open==='community'&&<CommunityMenu/>}</div>
      <a href="/dang-ban">Đăng bán</a><a className="nav-cart" href="#cart"><ShoppingCart size={17} strokeWidth={1.8}/> Giỏ hàng <i>0</i></a><a className="account-link" href="/tai-khoan"><span>TK</span>Tài khoản</a>
    </nav><button type="button" className="menu-toggle" aria-expanded={mobile} onClick={()=>setMobile(!mobile)} aria-label="Mở menu"><Menu aria-hidden="true" size={24} strokeWidth={1.8}/></button>
  </div></header>;
}

function MegaMenu(){return <div className="mega-menu" id="drawings-mega-menu">{drawingMenu.map(group=><section key={group.title}><h3>{group.title}</h3>{group.links.map(link=>{const Icon=menuIcons[link];return <a className="mega-link" href="#drawings" key={link}><span className="menu-icon-slot" aria-hidden="true">{Icon&&<Icon size={16} strokeWidth={1.8}/>}</span><span>{link}</span></a>})}</section>)}<a className="menu-view-all" href="#drawings">Xem tất cả bản vẽ <ArrowRight aria-hidden="true" size={14} strokeWidth={1.8}/></a></div>}
function CommunityMenu(){return <div className="community-menu" id="community-menu"><section><h3>KIẾN TRÚC SƯ</h3>{['Danh sách KTS','KTS nổi bật','KTS mới tham gia','KTS được đánh giá cao'].map((x,i)=><a className={i===0?'highlight':''} href="#architects" key={x}>{x}</a>)}</section><section><h3>CỘNG ĐỒNG</h3>{['Kỹ sư','Nhà thiết kế nội thất','Nhà thầu','Hoạt động mới','Yêu cầu bản vẽ'].map(x=><a href="#architects" key={x}>{x}</a>)}</section></div>}

function Hero(){return <section className="hero-main"><div className="hero-copy"><p className="eyebrow">THƯ VIỆN HỒ SƠ XÂY DỰNG</p><h1>Tìm đúng hồ sơ<br/>bạn cần</h1><p className="hero-description">Kho bản vẽ kiến trúc, kết cấu, MEP, dự toán<br/>được chia sẻ bởi cộng đồng KTS & kỹ sư.</p><div className="hero-actions"><a className="primary-btn" href="#drawings">Tìm bản vẽ ngay</a><a className="secondary-btn" href="/tim-kiem?q=miễn phí">Bản vẽ miễn phí</a></div><div className="hero-stats"><span><b>43.000+</b>Hồ sơ bản vẽ</span><span><b>5.200+</b>Bản vẽ miễn phí</span><span><b>3.800+</b>KTS & kỹ sư</span><span><b>98.700+</b>Lượt tải</span></div></div><div className="hero-visual"><div className="blueprint-lines"/><img src={heroImage} alt="Kiến trúc nhà phố hiện đại"/><div className="blueprint-card"><small>HỒ SƠ ĐẦY ĐỦ</small><b>NHÀ PHỐ 5 × 20M</b><span>KT · KC · MEP · DT</span></div></div></section>}

function ArchitectPanel({architects}:{architects:Architect[]}){return <aside className="architect-panel" id="architects"><div className="panel-head"><h2>KTS NỔI BẬT</h2><a href="/tim-kiem">Xem tất cả →</a></div>{architects.length?architects.map(a=><a className="architect-row" href={`/kts/${a.slug}`} key={a.name}>{a.photo?<img src={a.photo} alt={a.name} loading="lazy"/>:<span className="architect-avatar">{a.name.split(' ').slice(-2).map(x=>x[0]).join('')}</span>}<div><h3>{a.name}{a.verified&&<b title="Đã xác minh">✓</b>}</h3><p>{a.files} hồ sơ <i/> {a.downloads} lượt tải</p></div></a>):<div className="panel-empty">Chưa có KTS nổi bật.</div>}</aside>}

function ProductCard({product,onOpen}:{product:Product;onOpen:()=>void}){return <article className="product-card" onClick={onOpen} tabIndex={0} onKeyDown={e=>(e.key==='Enter'||e.key===' ')&&onOpen()}><div className="product-image">{product.image?<img src={product.image} alt={product.title} loading="lazy"/>:<div className="image-placeholder"/>}<b className={product.badge==='MIỄN PHÍ'?'card-badge free':'card-badge'}>{product.badge}</b><FavoriteButton productId={product.id} returnUrl={`/ban-ve/${product.slug}`}/></div><div className="product-body"><h3>{product.title}</h3><p className="product-type">{product.type}</p><p className="product-meta">{product.size} <i/> {product.floors}</p><div className="formats">{product.files.split(' · ').filter(Boolean).map(file=><span key={file}>{file}</span>)}</div><div className="author"><span className="tiny-avatar">{product.architect.split(' ').slice(-2).map(x=>x[0]).join('')}</span><span>{product.architect}</span><strong className={product.price==='MIỄN PHÍ'?'free-price':''}>{product.price}</strong></div></div></article>}

function Drawings({products,onOpen}:{products:Product[];onOpen:(p:Product)=>void}){const[sort,setSort]=useState('Mới nhất');const sorted=useMemo(()=>sort==='Tải nhiều'?[...products].sort((a,b)=>b.views-a.views):products,[sort,products]);return <section className="drawings" id="drawings"><div className="section-heading"><h2>BẢN VẼ MỚI</h2><div><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sắp xếp"><option>Mới nhất</option><option>Tải nhiều</option><option>Giá thấp</option><option>Giá cao</option></select><a href="/tim-kiem">Xem tất cả →</a></div></div>{sorted.length?<div className="product-grid">{sorted.slice(0,5).map(p=><ProductCard key={p.id} product={p} onOpen={()=>onOpen(p)}/>)}</div>:<div className="empty-state"><h2>Chưa có bản vẽ đã duyệt</h2><p>Sản phẩm mới sẽ xuất hiện tại đây sau khi được quản trị viên duyệt.</p></div>}</section>}

function PopularPanel({products,onOpen}:{products:Product[];onOpen:(p:Product)=>void}){return <aside className="popular-panel"><div className="panel-head"><h2>BẢN VẼ TẢI NHIỀU</h2><a href="/tim-kiem">Xem tất cả →</a></div>{products.length?products.slice(0,5).map(p=><button className="popular-row" key={p.id} onClick={()=>onOpen(p)}>{p.image?<img src={p.image} alt="" loading="lazy"/>:<span className="image-placeholder"/>}<span><strong>{p.title}</strong><small>{p.size} · {p.floors}</small></span><b className={p.price==='MIỄN PHÍ'?'free-price':''}>{p.price}</b></button>):<div className="panel-empty">Chưa có dữ liệu lượt tải.</div>}</aside>}

function Collections(){return <section className="collections" id="collections"><div className="section-heading"><h2>BỘ SƯU TẬP NỔI BẬT</h2><a href="/tim-kiem">Xem tất cả →</a></div><div className="collection-grid">{collections.map(c=><a className="collection-card" href={`/tim-kiem?q=${encodeURIComponent(c.name)}`} key={c.name}><img src={c.image} alt={c.name} loading="lazy"/><span><strong>{c.name}</strong><small>{c.count} hồ sơ</small></span></a>)}</div></section>}

function Footer(){return <footer><div className="shell footer-inner"><a className="logo footer-logo" href="#"><span className="logo-mark"><i/></span><span><b>NHÀ ĐẸP CHẤT</b><small>MẪU NHÀ · BẢN VẼ · KTS</small></span></a><p>Nền tảng chia sẻ hồ sơ xây dựng từ cộng đồng kiến trúc sư và kỹ sư Việt Nam.</p><nav><a href="#drawings">Bản vẽ</a><a href="#collections">Bộ sưu tập</a><a href="#architects">Kiến trúc sư</a><a href="#sell">Đăng bán</a></nav></div></footer>}

function DetailModal({selected,onClose}:{selected:Product;onClose:()=>void}){return <div className="modal-backdrop" onClick={onClose}><article className="detail-modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={onClose}>×</button>{selected.image?<img src={selected.image} alt={selected.title}/>:<div className="image-placeholder"/>}<div><small>{selected.id.slice(0,8).toUpperCase()}</small><h2>{selected.title}</h2><dl><dt>Kích thước</dt><dd>{selected.size}</dd><dt>Số tầng</dt><dd>{selected.floors}</dd><dt>Định dạng</dt><dd>{selected.files}</dd></dl><strong className="detail-price">{selected.price}</strong><a className="download" href={`/ban-ve/${selected.slug}`}>XEM CHI TIẾT</a></div></article></div>}

export default function Home(){const[selected,setSelected]=useState<Product|null>(null),[products,setProducts]=useState<Product[]>([]),[popular,setPopular]=useState<Product[]>([]),[architects,setArchitects]=useState<Architect[]>([]);useEffect(()=>{fetch('/api/public/home').then(r=>r.ok?r.json():Promise.reject()).then(data=>{const adapt=(p:any):Product=>({id:p.id,slug:p.slug,title:p.title,size:p.width&&p.length?`${p.width} × ${p.length}m`:'Chưa cập nhật',floors:p.floors?`${p.floors} tầng`:'—',files:p.formats||'',views:Number(p.download_count||0),price:p.is_free?'MIỄN PHÍ':`${Number(p.price).toLocaleString('vi-VN')}đ`,image:p.cover_id?`/api/assets/${p.cover_id}`:'',type:p.category,architect:p.seller_name,badge:p.is_free?'MIỄN PHÍ':'MỚI'});setProducts(data.products.map(adapt));setPopular(data.popular.map(adapt));setArchitects(data.architects.map((a:any)=>({slug:a.slug,name:a.display_name,files:Number(a.file_count||0),downloads:Number(a.download_count||0).toLocaleString('vi-VN'),verified:a.verification_status==='verified'})))}).catch(()=>{})},[]);return <><Header/><main className="shell marketplace"><Hero/><ArchitectPanel architects={architects}/><Drawings products={products} onOpen={setSelected}/><PopularPanel products={popular} onOpen={setSelected}/><Collections/></main><Footer/>{selected&&<DetailModal selected={selected} onClose={()=>setSelected(null)}/>}</>}
