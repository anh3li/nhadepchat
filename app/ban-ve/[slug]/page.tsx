/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FavoriteButton } from '../../../components/FavoriteButton';
import { MarketplaceHeader } from '../../../components/MarketplaceHeader';
import { ProductGallery } from '../../../components/ProductGallery';
import { PublicProductGrid } from '../../../components/PublicProductGrid';
import { ReviewSection } from '../../../components/ReviewSection';
import { ViewTracker } from '../../../components/ViewTracker';
import { AddToCartButton } from '../../../components/AddToCartButton';
import { getD1 } from '../../../db';
import { productSelect } from '../../../lib/marketplace';
import { Download, Eye, Star } from 'lucide-react';
import Link from 'next/link';

export const dynamic='force-dynamic';
const origin='https://nhadepchat.tranvukim-tvk.workers.dev';
async function getProduct(slug:string){return getD1().prepare(`${productSelect()} WHERE p.slug=? AND p.status='approved' LIMIT 1`).bind(slug).first<Record<string,any>>()}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params,p=await getProduct(slug);if(!p)return{title:'Không tìm thấy bản vẽ',robots:{index:false,follow:false}};const description=String(p.short_description||'').slice(0,160);return{title:`${p.title} | Nhà Đẹp Chất`,description,alternates:{canonical:`${origin}/ban-ve/${slug}`},openGraph:{title:p.title,description,url:`${origin}/ban-ve/${slug}`,images:p.cover_id?[`${origin}/api/assets/${p.cover_id}`]:[]}}}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
  const{slug}=await params,p=await getProduct(slug);if(!p)notFound();const db=getD1();
  const[assets,firstFile,disciplines,tools,keywords,related]=await Promise.all([
    db.prepare('SELECT id,type FROM product_assets WHERE product_id=? ORDER BY CASE WHEN type=\'cover\' THEN 0 ELSE 1 END,sort_order').bind(p.id).all<{id:string;type:string}>(),
    db.prepare('SELECT id FROM product_files WHERE product_id=? ORDER BY created_at LIMIT 1').bind(p.id).first<{id:string}>(),
    db.prepare('SELECT discipline FROM product_disciplines WHERE product_id=?').bind(p.id).all<{discipline:string}>(),
    db.prepare('SELECT tool FROM product_tools WHERE product_id=?').bind(p.id).all<{tool:string}>(),
    db.prepare('SELECT keyword FROM product_keywords WHERE product_id=?').bind(p.id).all<{keyword:string}>(),
    db.prepare(`${productSelect()} WHERE p.status='approved' AND p.category=? AND p.id<>? ORDER BY p.approved_at DESC LIMIT 4`).bind(p.category,p.id).all<Record<string,any>>(),
  ]);
  const images=assets.results.map((a,i)=>({id:a.id,src:`/api/assets/${a.id}`,alt:`${p.title} - ảnh ${i+1}`}));
  return <><MarketplaceHeader/><ViewTracker productId={p.id}/><main className="subpage product-detail-page">
    <ProductGallery images={images}/>
    <section className="detail-summary"><div className="detail-title-row"><p className="eyebrow">{p.category}{p.building_type&&p.building_type!==p.category?` · ${p.building_type}`:''}{p.style?` · ${p.style}`:''}</p><FavoriteButton productId={p.id} returnUrl={`/ban-ve/${p.slug}`} className="detail-favorite"/></div><h1>{p.title}</h1><Link className="seller-line" href={`/kts/${p.seller_slug}`}><span className="tiny-avatar">{p.seller_name.split(' ').slice(-2).map((x:string)=>x[0]).join('')}</span><b>{p.seller_name}</b>{p.verification_status==='verified'&&<i>✓</i>}</Link><div className="detail-proof"><span><Star size={15} fill="currentColor"/>{p.review_count?`${Number(p.rating).toFixed(1)} (${p.review_count})`:'Chưa đánh giá'}</span><span><Eye size={15}/>{Number(p.view_count||0).toLocaleString('vi-VN')} lượt xem</span><span><Download size={15}/>{Number(p.download_count||0).toLocaleString('vi-VN')} lượt tải</span></div>{p.short_description&&<p className="detail-short">{p.short_description}</p>}<dl>{p.width&&p.length&&<div><dt>Kích thước</dt><dd>{p.width} × {p.length}m</dd></div>}{p.floors&&<div><dt>Số tầng</dt><dd>{p.floors}</dd></div>}{p.area&&<div><dt>Diện tích</dt><dd>{p.area}m²</dd></div>}{p.formats&&<div><dt>Định dạng</dt><dd>{p.formats}</dd></div>}</dl>{(disciplines.results.length>0||tools.results.length>0)&&<div className="disciplines">{disciplines.results.map(x=><span key={x.discipline}>✓ {x.discipline}</span>)}{tools.results.map(x=><span className="tool" key={x.tool}>{x.tool}</span>)}</div>}<div className="detail-purchase"><strong className={p.is_free?'detail-price free-price':'detail-price'}>{p.is_free?'MIỄN PHÍ':`${Number(p.price).toLocaleString('vi-VN')}đ`}</strong>{p.is_free?(firstFile?<a className="download" href={`/api/download/${firstFile.id}`}>TẢI MIỄN PHÍ</a>:<><button className="download" disabled>CHƯA CÓ FILE TẢI</button><small>Người bán chưa hoàn tất file bàn giao.</small></>):<><AddToCartButton productId={p.id} returnTo={`/ban-ve/${p.slug}`}/><small>Giỏ hàng được lưu theo tài khoản của bạn.</small></>}</div></section>
    {(p.description||keywords.results.length>0)&&<section className="detail-description">{p.description&&<><h2>Mô tả hồ sơ</h2><div className="description-content" dangerouslySetInnerHTML={{__html:p.description}}/></>}{keywords.results.length>0&&<div className="detail-keywords">{keywords.results.map(x=><span key={x.keyword}>{x.keyword}</span>)}</div>}</section>}
    <ReviewSection target="product" id={p.id} returnTo={`/ban-ve/${p.slug}`} title="Đánh giá bản vẽ" initialAverage={Number(p.rating||0)} initialCount={Number(p.review_count||0)}/>
    {related.results.length>0&&<section className="detail-related"><div className="section-heading"><h2>BẢN VẼ LIÊN QUAN</h2></div><PublicProductGrid products={related.results}/></section>}
  </main></>;
}
