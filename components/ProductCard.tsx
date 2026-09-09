/* eslint-disable @typescript-eslint/no-explicit-any */
import { FavoriteButton } from './FavoriteButton';
import { Download, Eye, Star } from 'lucide-react';
import Link from 'next/link';
import { SafeImage } from './SafeImage';
import { LinkPending } from './LinkPending';

export type ProductCardData=Record<string,any>;
export function ProductCard({product:p,preview=false,compact=false}:{product:ProductCardData;preview?:boolean;compact?:boolean}){
  const image=p.image||(p.cover_id?`/api/assets/${p.cover_id}`:''),isFree=Boolean(p.is_free)||p.priceLabel==='MIỄN PHÍ',formats=Array.isArray(p.formats)?p.formats:String(p.formats||p.files||'').split(/[·,]/).map((x:string)=>x.trim()).filter(Boolean),seller=p.seller_name||p.architect||'Nhà Đẹp Chất';
  const sellerAvatar=p.seller_avatar?`/api/profile-avatar/${p.seller_slug}?v=${encodeURIComponent(p.seller_avatar)}`:String(p.seller_account_image||'');
  const dimensions=p.size||(p.width&&p.length?`${p.width} × ${p.length}m`:'Chưa cập nhật'),floors=typeof p.floors==='string'?p.floors:p.floors?`${p.floors} tầng`:'—',price=p.priceLabel||(isFree?'MIỄN PHÍ':`${Number(p.price||0).toLocaleString('vi-VN')}đ`);
  const content=<><div className="product-image">{image?<SafeImage src={image} alt={p.title}/>:<div className="image-placeholder"/>}<b className={isFree?'card-badge free':'card-badge'}>{isFree?'MIỄN PHÍ':'MỚI'}</b></div><div className="product-body"><h3>{p.title}</h3>{!compact&&<><p className="product-type">{p.category||p.type}</p><p className="product-meta">{dimensions}<i/>{floors}</p>{formats.length>0&&<div className="formats">{formats.map((format:string)=><span key={format}>{format}</span>)}</div>}</>}<div className="card-proof"><span><Star size={13} fill={Number(p.review_count||0)?'currentColor':'none'}/>{p.review_count?Number(p.rating).toFixed(1):'Mới'}</span><span><Eye size={13}/>{Number(p.view_count||p.views||0).toLocaleString('vi-VN')}</span><span><Download size={13}/>{Number(p.download_count||p.downloads||0).toLocaleString('vi-VN')}</span></div><div className="author"><span className="tiny-avatar">{sellerAvatar?<SafeImage src={sellerAvatar} alt=""/>:seller.split(' ').filter(Boolean).slice(-2).map((x:string)=>x[0]).join('').toUpperCase()}</span><span>{seller}{p.verification_status==='verified'&&<b>✓</b>}</span><strong className={isFree?'free-price':''}>{price}</strong></div></div></>;
  return <article className={`product-card${compact?' compact':''}`}>{preview?<div className="product-card-link">{content}</div>:<Link className="product-card-link" href={`/ban-ve/${p.slug}`}>{content}<LinkPending/></Link>}{!preview&&p.id&&<FavoriteButton productId={p.id} returnUrl={`/ban-ve/${p.slug}`}/>}</article>;
}
