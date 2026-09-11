'use client';
import {useSiteRouter} from './useSiteRouter';

import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';


export function AddToCartButton({productId,returnTo}:{productId:string;returnTo:string}){
  const router=useSiteRouter(),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function add(){if(busy)return;setBusy(true);setError('');try{const response=await fetch('/api/cart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId})});const data=await response.json() as {count?:number;error?:string};if(response.status===401){router.push(`/dang-nhap?returnTo=${encodeURIComponent(returnTo)}`);return}if(!response.ok)throw new Error(data.error||'Không thể thêm vào giỏ hàng.');window.dispatchEvent(new CustomEvent('ndc-cart-change',{detail:{count:Number(data.count||0)}}));router.push('/gio-hang')}catch(reason){setError(reason instanceof Error?reason.message:'Không thể thêm vào giỏ hàng.')}finally{setBusy(false)}}
  return <><button type="button" className="download cart-add" disabled={busy} onClick={add}><ShoppingCart/>{busy?'Đang thêm…':'THÊM VÀO GIỎ'}</button>{error&&<small className="cart-inline-error" role="alert">{error}</small>}</>;
}
