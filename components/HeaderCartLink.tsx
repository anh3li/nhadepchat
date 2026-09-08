'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useEffect,useState } from 'react';

export function HeaderCartLink({initialCount=0}:{initialCount?:number}){
  const[count,setCount]=useState(initialCount);
  useEffect(()=>{let active=true;const load=()=>fetch('/api/cart').then(async response=>response.ok?await response.json() as {count:number}:null).then(data=>{if(active&&data)setCount(Number(data.count||0))}).catch(()=>{});const update=(event:Event)=>{const value=(event as CustomEvent<{count?:number}>).detail?.count;if(typeof value==='number')setCount(value);else void load()};window.addEventListener('ndc-cart-change',update);return()=>{active=false;window.removeEventListener('ndc-cart-change',update)}},[]);
  return <Link className="nav-cart" href="/gio-hang"><ShoppingCart size={17}/>Giỏ hàng<i>{count}</i></Link>;
}
