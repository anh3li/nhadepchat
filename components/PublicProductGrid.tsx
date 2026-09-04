/* eslint-disable @typescript-eslint/no-explicit-any */
import { FavoriteButton } from './FavoriteButton';

export type PublicProduct = Record<string, any>;
export function PublicProductGrid({ products }: { products: PublicProduct[] }) {
  if (!products.length) return <div className="empty-state"><h2>Chưa có hồ sơ phù hợp</h2><p>Các hồ sơ đã duyệt sẽ xuất hiện tại đây.</p></div>;
  return <div className="product-grid">{products.map((p) => <a className="product-card" href={`/ban-ve/${p.slug}`} key={p.id}>
    <div className="product-image">{p.cover_id?<img src={`/api/assets/${p.cover_id}`} alt={p.title}/>:<div className="image-placeholder"/>}<b className={p.is_free?'card-badge free':'card-badge'}>{p.is_free?'MIỄN PHÍ':'MỚI'}</b><FavoriteButton productId={p.id} returnUrl={`/ban-ve/${p.slug}`}/></div>
    <div className="product-body"><h3>{p.title}</h3><p className="product-type">{p.category}</p><p className="product-meta">{p.width&&p.length?`${p.width} × ${p.length}m`:'Chưa cập nhật'} <i/> {p.floors?`${p.floors} tầng`:'—'}</p><div className="formats">{String(p.formats||'').split(/[·,]/).map((x:string)=>x.trim()).filter(Boolean).map((x:string)=><span key={x}>{x}</span>)}</div><div className="author"><span className="tiny-avatar">{String(p.seller_name||'KTS').split(' ').slice(-2).map((x:string)=>x[0]).join('')}</span><span>{p.seller_name}{p.verification_status==='verified'&&<b>✓</b>}</span><strong className={p.is_free?'free-price':''}>{p.is_free?'MIỄN PHÍ':`${Number(p.price).toLocaleString('vi-VN')}đ`}</strong></div></div>
  </a>)}</div>;
}
