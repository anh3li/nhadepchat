'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from './SiteLink';
import { ArrowRight,LockKeyhole,ShoppingBag,Trash2 } from 'lucide-react';
import { useEffect,useMemo,useState } from 'react';
import { SafeImage } from './SafeImage';
import { previewImageUrl } from '../lib/media';

type CartData={authenticated:boolean;count:number;items:any[]};

export function CartPanel(){
  const[data,setData]=useState<CartData|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{let active=true;fetch('/api/cart').then(async response=>{if(!response.ok)throw new Error();return await response.json() as CartData}).then(result=>{if(active){setData(result);setError('')}}).catch(()=>{if(active)setError('Không thể tải giỏ hàng. Vui lòng thử lại.')});return()=>{active=false}},[retry]);
  async function remove(productId:string){if(busy)return;setBusy(productId);setError('');try{const response=await fetch('/api/cart',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId})});if(!response.ok)throw new Error();setData(current=>current?{...current,count:Math.max(0,current.count-1),items:current.items.filter(item=>item.id!==productId)}:current);window.dispatchEvent(new CustomEvent('ndc-cart-change',{detail:{count:Math.max(0,(data?.count||1)-1)}}))}catch{setError('Không thể xóa sản phẩm khỏi giỏ.')}finally{setBusy('')}}
  async function checkout(){setError('');const response=await fetch('/api/checkout',{method:'POST'});const result=await response.json() as {error?:string};if(!response.ok)setError(result.error||'Không thể tạo đơn hàng.');else setError('Đơn hàng đã tạo ở trạng thái chờ thanh toán. Chỉ webhook hợp lệ mới mở quyền tải file.');}
  const total=useMemo(()=>data?.items.reduce((sum,item)=>sum+Number(item.price||0),0)||0,[data]);
  if(!data&&!error)return <div className="cart-loading">Đang tải giỏ hàng…</div>;
  if(error&&!data)return <div className="empty-state"><h2>Không thể tải giỏ hàng</h2><p>{error}</p><button className="button" onClick={()=>{setError('');setRetry(value=>value+1)}}>Thử lại</button></div>;
  if(data&&!data.authenticated)return <div className="cart-empty"><ShoppingBag/><h2>Đăng nhập để xem giỏ hàng</h2><p>Giỏ hàng được lưu an toàn theo tài khoản và đồng bộ trên các thiết bị.</p><Link className="button button-primary" href="/dang-nhap?returnTo=%2Fgio-hang">Đăng nhập <ArrowRight/></Link></div>;
  if(data&&!data.items.length)return <div className="cart-empty"><ShoppingBag/><h2>Giỏ hàng đang trống</h2><p>Khám phá thư viện và thêm hồ sơ trả phí bạn muốn mua.</p><Link className="button button-primary" href="/tim-kiem">Khám phá bản vẽ <ArrowRight/></Link></div>;
  return <div className="cart-layout"><section className="cart-items">{error&&<p className="form-error" role="alert">{error}</p>}{data?.items.map(item=><article key={item.id}>{item.cover_id?<SafeImage src={item.thumbnailUrl||previewImageUrl(item.cover_id,item.cover_key,item.thumbnail_key)} alt={item.title} fallbackClassName="image-placeholder"/>:<span className="image-placeholder"/>}<div><Link href={`/ban-ve/${item.slug}`}>{item.title}</Link><p>{item.category} · {item.formats||'Đang cập nhật định dạng'}</p><small>{item.seller_name}</small></div><strong>{Number(item.price).toLocaleString('vi-VN')}đ</strong><button type="button" disabled={busy===item.id} onClick={()=>remove(item.id)} aria-label={`Xóa ${item.title}`}><Trash2/>{busy===item.id?'Đang xóa…':'Xóa'}</button></article>)}</section><aside className="cart-summary"><h2>Tóm tắt đơn hàng</h2><p><span>{data?.count||0} sản phẩm</span><b>{total.toLocaleString('vi-VN')}đ</b></p><div className="cart-payment-notice"><LockKeyhole/><span><b>Đơn hàng chờ xác nhận thanh toán</b>Quyền tải file chỉ được mở sau khi backend nhận webhook có chữ ký hợp lệ.</span></div><button type="button" onClick={checkout}>TIẾP TỤC THANH TOÁN</button><Link href="/tim-kiem">Tiếp tục xem bản vẽ</Link></aside></div>;
}
