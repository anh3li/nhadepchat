/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- homepage adapter consumes the dynamic public D1 payload.
'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { ProductCard as SharedProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

type Product = {id:string;slug:string;title:string;size:string;floors:string;files:string;views:number;downloads:number;rating:number;review_count:number;price:string;priceValue:number;image:string;type:string;architect:string;badge:string;seller_slug?:string;seller_avatar?:string|null;seller_account_image?:string|null};
type Architect = {slug:string;name:string;files:number;downloads:string;rating:number;reviews:number;photo?:string;verified:boolean};
type PlatformStats={product_count:number;free_count:number;seller_count:number;download_count:number};
type CollectionSummary={count:number;cover_id:string|null};

const collections = [
  { id: 'nha-pho-5m', name: 'NHÀ PHỐ 5M' },
  { id: 'biet-thu-2-tang', name: 'BIỆT THỰ 2 TẦNG' },
  { id: 'nha-cap-4-dep', name: 'NHÀ CẤP 4 ĐẸP' },
  { id: 'nha-xuong-tieu-chuan', name: 'NHÀ XƯỞNG TIÊU CHUẨN' },
  { id: 'file-ket-cau-hay', name: 'FILE KẾT CẤU HAY' },
];

function Hero({stats,image}:{stats:PlatformStats;image?:string}){const number=(value:number)=>Number(value||0).toLocaleString('vi-VN');return <section className="hero-main"><div className="hero-copy"><p className="eyebrow">THƯ VIỆN HỒ SƠ XÂY DỰNG</p><h1>Tìm đúng hồ sơ<br/>bạn cần</h1><p className="hero-description">Kho bản vẽ kiến trúc, kết cấu, MEP, dự toán<br/>được chia sẻ bởi cộng đồng KTS & kỹ sư.</p><div className="hero-actions"><a className="primary-btn" href="#drawings">Tìm bản vẽ ngay</a><Link className="secondary-btn" href="/tim-kiem?q=miễn phí">Bản vẽ miễn phí</Link></div><div className="hero-stats"><span><b>{number(stats.product_count)}</b>Hồ sơ bản vẽ</span><span><b>{number(stats.free_count)}</b>Bản vẽ miễn phí</span><span><b>{number(stats.seller_count)}</b>KTS & kỹ sư</span><span><b>{number(stats.download_count)}</b>Lượt tải</span></div></div><div className="hero-visual"><div className="blueprint-lines"/>{image?<SafeImage src={image} alt="Kiến trúc nhà phố hiện đại" loading="eager" fetchPriority="high" fallbackClassName="hero-image-placeholder"/>:<span className="hero-image-placeholder" aria-hidden/>}<div className="blueprint-card"><small>HỒ SƠ ĐẦY ĐỦ</small><b>NHÀ PHỐ 5 × 20M</b><span>KT · KC · MEP · DT</span></div></div></section>}

function ArchitectPanel({architects}:{architects:Architect[]}){return <aside className="architect-panel" id="architects"><div className="panel-head"><h2>KTS NỔI BẬT</h2><Link href="/cong-dong?sap-xep=noi-bat">Xem tất cả →</Link></div>{architects.length?architects.map(a=><Link className="architect-row" href={`/kts/${a.slug}`} key={a.name}>{a.photo?<SafeImage src={a.photo} alt={a.name}/>:<span className="architect-avatar">{a.name.split(' ').slice(-2).map(x=>x[0]).join('')}</span>}<div><h3>{a.name}{a.verified&&<b title="Đã xác minh">✓</b>}</h3><p>{a.files} hồ sơ <i/> {a.downloads} lượt tải</p></div><span className="architect-rating">★ {a.reviews?a.rating.toFixed(1):'Mới'}</span></Link>):<div className="panel-empty">Chưa có KTS nổi bật.</div>}</aside>}

function Drawings({products}:{products:Product[]}){const[sort,setSort]=useState('Mới nhất');const sorted=useMemo(()=>{const rows=[...products];if(sort==='Tải nhiều')return rows.sort((a,b)=>b.downloads-a.downloads);if(sort==='Giá thấp')return rows.sort((a,b)=>a.priceValue-b.priceValue);if(sort==='Giá cao')return rows.sort((a,b)=>b.priceValue-a.priceValue);return rows},[sort,products]);return <section className="drawings" id="drawings"><div className="section-heading"><h2>BẢN VẼ MỚI</h2><div><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sắp xếp"><option>Mới nhất</option><option>Tải nhiều</option><option>Giá thấp</option><option>Giá cao</option></select><Link href="/tim-kiem">Xem tất cả →</Link></div></div>{sorted.length?<div className="product-grid">{sorted.slice(0,5).map(p=><SharedProductCard compact key={p.id} product={{...p,priceLabel:p.price,category:p.type,seller_name:p.architect,download_count:p.downloads}}/>)}</div>:<div className="empty-state"><h2>Chưa có bản vẽ đã duyệt</h2><p>Sản phẩm mới sẽ xuất hiện tại đây sau khi được quản trị viên duyệt.</p></div>}</section>}

function PopularPanel({products}:{products:Product[]}){return <aside className="popular-panel"><div className="panel-head"><h2>BẢN VẼ TẢI NHIỀU</h2><Link href="/tim-kiem">Xem tất cả →</Link></div>{products.length?products.slice(0,5).map(p=><Link className="popular-row" href={`/ban-ve/${p.slug}`} key={p.id}>{p.image?<SafeImage className="popular-media" src={p.image} alt=""/>:<span className="image-placeholder"/>}<span><strong>{p.title}</strong><small>{p.size} · {p.downloads} lượt tải</small></span><b className={p.price==='MIỄN PHÍ'?'free-price':''}>{p.price}</b></Link>):<div className="panel-empty">Chưa có dữ liệu lượt tải.</div>}</aside>}

function Collections({summaries}:{summaries:Record<string,CollectionSummary>}){const available=collections.filter(c=>Number(summaries[c.id]?.count||0)>0);return <section className="collections" id="collections"><div className="section-heading"><h2>BỘ SƯU TẬP NỔI BẬT</h2><Link href="/bo-suu-tap">Xem tất cả →</Link></div>{available.length?<div className={`collection-grid collection-grid-${Math.min(available.length,5)}`}>{available.map(c=>{const summary=summaries[c.id],image=summary.cover_id?`/api/assets/${summary.cover_id}`:'';return <Link className="collection-card" href={`/bo-suu-tap#${c.id}`} key={c.name}>{image?<SafeImage src={image} alt={c.name}/>:<span className="image-placeholder"/>}<span><strong>{c.name}</strong><small>{Number(summary.count)} hồ sơ</small></span></Link>})}</div>:<div className="empty-state"><h2>Chưa có bộ sưu tập nổi bật</h2><p>Bộ sưu tập sẽ xuất hiện khi có hồ sơ phù hợp đã được duyệt.</p></div>}</section>}

function Footer(){return <footer><div className="shell footer-inner"><Link className="logo footer-logo" href="/"><span className="logo-mark"><i/></span><span><b>NHÀ ĐẸP CHẤT</b><small>MẪU NHÀ · BẢN VẼ · KTS</small></span></Link><p>Nền tảng chia sẻ hồ sơ xây dựng từ cộng đồng kiến trúc sư và kỹ sư Việt Nam.</p><nav><a href="#drawings">Bản vẽ</a><Link href="/bo-suu-tap">Bộ sưu tập</Link><Link href="/cong-dong">Kiến trúc sư</Link><Link href="/dang-ban">Đăng bán</Link></nav></div></footer>}

export default function Home(){
  const[products,setProducts]=useState<Product[]>([]),[popular,setPopular]=useState<Product[]>([]),[architects,setArchitects]=useState<Architect[]>([]),[collectionSummaries,setCollectionSummaries]=useState<Record<string,CollectionSummary>>({}),[stats,setStats]=useState<PlatformStats>({product_count:0,free_count:0,seller_count:0,download_count:0});
  useEffect(()=>{fetch('/api/public/home').then(r=>r.ok?r.json():Promise.reject()).then(data=>{
    const adapt=(p:any):Product=>({id:p.id,slug:p.slug,title:p.title,size:p.width&&p.length?`${p.width} × ${p.length}m`:'Chưa cập nhật',floors:p.floors?`${p.floors} tầng`:'—',files:p.formats||'',views:Number(p.view_count||0),downloads:Number(p.download_count||0),rating:Number(p.rating||0),review_count:Number(p.review_count||0),price:p.is_free?'MIỄN PHÍ':`${Number(p.price).toLocaleString('vi-VN')}đ`,priceValue:Number(p.price||0),image:p.cover_id?`/api/assets/${p.cover_id}`:'',type:p.category,architect:p.seller_name,badge:p.is_free?'MIỄN PHÍ':'MỚI',seller_slug:p.seller_slug,seller_avatar:p.seller_avatar,seller_account_image:p.seller_account_image});
    setProducts(data.products.map(adapt));setPopular(data.popular.map(adapt));setArchitects(data.architects.map((a:any)=>({slug:a.slug,name:a.display_name,files:Number(a.file_count||0),downloads:Number(a.download_count||0).toLocaleString('vi-VN'),rating:Number(a.rating||0),reviews:Number(a.review_count||0),photo:a.avatar_key?`/api/profile-avatar/${a.slug}?v=${encodeURIComponent(a.avatar_key)}`:a.account_image||undefined,verified:a.verification_status==='verified'})));setCollectionSummaries(data.collections||{});setStats(data.stats||{});
  }).catch(()=>{})},[]);
  return <><MarketplaceHeader/><main className="shell marketplace"><Hero stats={stats} image={products[0]?.image}/><ArchitectPanel architects={architects}/><Drawings products={products}/><PopularPanel products={popular}/><Collections summaries={collectionSummaries}/></main><Footer/></>;
}
