/* eslint-disable @typescript-eslint/no-explicit-any */
import { FavoriteButton } from '../FavoriteButton';
import { ProductGallery } from '../ProductGallery';
import { PublicProductGrid } from '../PublicProductGrid';
import { ReviewSection } from '../ReviewSection';
import { ViewTracker } from '../ViewTracker';
import { AddToCartButton } from '../AddToCartButton';
import { DetailBackButton } from '../DetailBackButton';
import { Download, Eye, Star } from 'lucide-react';
import Link from '../SiteLink';
import {largePreviewImageUrl} from '../../lib/media';

export function ProductDetailView({p,assets,firstFile,disciplines,tools,keywords,related}:{p:any;assets:any;firstFile:any;disciplines:any;tools:any;keywords:any;related:any}){
  const images=assets.results.map((a:{id:string;object_key:string;thumbnail_key:string|null},i:number)=>({id:a.id,src:largePreviewImageUrl(a.id,a.object_key),alt:`${p.title} - ảnh ${i+1}`}));
  return <><ViewTracker productId={p.id}/><main className="subpage product-detail-page">
    <DetailBackButton/>
    <ProductGallery key={`gallery-${p.id}`} images={images}/>
    <section className="detail-summary"><div className="detail-title-row"><p className="eyebrow">{p.category}{p.building_type&&p.building_type!==p.category?` · ${p.building_type}`:''}{p.style?` · ${p.style}`:''}</p><FavoriteButton productId={p.id} returnUrl={`/ban-ve/${p.slug}`} className="detail-favorite"/></div><h1>{p.title}</h1><Link className="seller-line" href={`/kts/${p.seller_slug}`}><span className="tiny-avatar">{p.seller_name.split(' ').slice(-2).map((x:string)=>x[0]).join('')}</span><b>{p.seller_name}</b>{p.verification_status==='verified'&&<i>✓</i>}</Link><div className="detail-proof"><span><Star size={15} fill="currentColor"/>{p.review_count?`${Number(p.rating).toFixed(1)} (${p.review_count})`:'Chưa đánh giá'}</span><span><Eye size={15}/>{Number(p.view_count||0).toLocaleString('vi-VN')} lượt xem</span><span><Download size={15}/>{Number(p.download_count||0).toLocaleString('vi-VN')} lượt tải</span></div>{p.short_description&&<p className="detail-short">{p.short_description}</p>}<dl>{p.width&&p.length&&<div><dt>Kích thước</dt><dd>{p.width} × {p.length}m</dd></div>}{p.floors&&<div><dt>Số tầng</dt><dd>{p.floors}</dd></div>}{p.area&&<div><dt>Diện tích</dt><dd>{p.area}m²</dd></div>}{p.formats&&<div><dt>Định dạng</dt><dd>{p.formats}</dd></div>}</dl>{(disciplines.results.length>0||tools.results.length>0)&&<div className="disciplines">{disciplines.results.map((x:any)=><span key={x.discipline}>✓ {x.discipline}</span>)}{tools.results.map((x:any)=><span className="tool" key={x.tool}>{x.tool}</span>)}</div>}<div className="detail-purchase"><strong className={p.is_free?'detail-price free-price':'detail-price'}>{p.is_free?'MIỄN PHÍ':`${Number(p.price).toLocaleString('vi-VN')}đ`}</strong>{p.is_free?(firstFile?<a className="download" href={`/api/download/${firstFile.id}`}>TẢI MIỄN PHÍ</a>:<><button className="download" disabled>CHƯA CÓ FILE TẢI</button><small>Người bán chưa hoàn tất file bàn giao.</small></>):<><AddToCartButton productId={p.id} returnTo={`/ban-ve/${p.slug}`}/><small>Giỏ hàng được lưu theo tài khoản của bạn.</small></>}</div></section>
    {(p.description||keywords.results.length>0)&&<section className="detail-description">{p.description&&<><h2>Mô tả hồ sơ</h2><div className="description-content" dangerouslySetInnerHTML={{__html:p.description}}/></>}{keywords.results.length>0&&<div className="detail-keywords">{keywords.results.map((x:any)=><span key={x.keyword}>{x.keyword}</span>)}</div>}</section>}
    <ReviewSection key={`reviews-${p.id}`} target="product" id={p.id} returnTo={`/ban-ve/${p.slug}`} title="Đánh giá bản vẽ" initialAverage={Number(p.rating||0)} initialCount={Number(p.review_count||0)}/>
    <section className="detail-related"><div className="section-heading"><h2>BẢN VẼ LIÊN QUAN</h2></div><PublicProductGrid products={related.results}/></section>
  </main></>;
}
