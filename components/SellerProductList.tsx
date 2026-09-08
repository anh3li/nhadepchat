'use client';

import { useState } from 'react';
import { Clock3, Edit3, Eye, FileUp, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { SafeImage } from './SafeImage';

type Product={id:string;slug:string;title:string;category:string;status:string;is_free:number;price:number;images:number;files:number;cover_id:string|null;downloads:number;views:number;rating:number|null;review_count:number;updated_at:number;rejection_reason:string|null};
const labels:Record<string,string>={draft:'Bản nháp',pending:'Chờ duyệt',approved:'Đã duyệt',rejected:'Bị từ chối',archived:'Đã ẩn'};

export function SellerProductList({initial}:{initial:Product[]}){
  const [products,setProducts]=useState(initial),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState('');
  async function submit(id:string){
    if(busy)return;
    setBusy(id);setError('');
    try {
      const response=await fetch(`/api/marketplace/products/${id}/submit`,{method:'POST'}),data=await response.json() as {error?:string};
      if(!response.ok){setError(data.error||'Không thể gửi duyệt.');return}
      setProducts(rows=>rows.map(row=>row.id===id?{...row,status:'pending',rejection_reason:null}:row));
    } catch {setError('Không kết nối được máy chủ. Vui lòng thử lại.');}
    finally {setBusy(null);}
  }
  if(!products.length)return <div className="empty-state"><ImageIcon/><h2>Chưa có sản phẩm</h2><p>Tạo hồ sơ đầu tiên để bắt đầu quy trình kiểm duyệt.</p><Link className="button button-primary" href="/dashboard/dang-ban">Đăng sản phẩm</Link></div>;
  return <>{error&&<p className="form-error" role="alert">{error}</p>}<div className="seller-products">{products.map(product=><article key={product.id}><div className="seller-product-thumb">{product.cover_id?<SafeImage src={`/api/assets/${product.cover_id}`} alt={product.title}/>:<ImageIcon/>}</div><div className="seller-product-info"><div><span className={`status ${product.status}`}>{labels[product.status]||product.status}</span><span className="updated"><Clock3/>Cập nhật {new Date(product.updated_at).toLocaleDateString('vi-VN')}</span></div><h2>{product.title}</h2><p>{product.category} · {product.images} ảnh · {product.files} file · {product.views||0} lượt xem · {product.downloads||0} lượt tải · {product.review_count?`${Number(product.rating).toFixed(1)} sao`:'chưa đánh giá'}</p>{product.rejection_reason&&<div className="rejection-note"><b>Lý do từ chối</b>{product.rejection_reason}</div>}</div><strong className={product.is_free?'free-price':''}>{product.is_free?'MIỄN PHÍ':`${Number(product.price).toLocaleString('vi-VN')}đ`}</strong><div className="seller-product-actions">{product.status==='approved'&&<Link href={`/ban-ve/${product.slug}`}><Eye/>Xem</Link>}{['draft','rejected'].includes(product.status)&&<><Link href={`/dashboard/dang-ban?id=${product.id}`}><Edit3/>Sửa</Link><button type="button" disabled={busy===product.id} onClick={()=>submit(product.id)}><FileUp/>{busy===product.id?'Đang gửi…':'Gửi duyệt'}</button></>}</div></article>)}</div></>;
}
