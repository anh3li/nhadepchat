'use client';
/* eslint-disable @next/next/no-html-link-for-pages */

import { Menu, Search, ShoppingCart } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function MarketplaceHeader(){const router=useRouter(),[mobile,setMobile]=useState(false);function search(e:FormEvent<HTMLFormElement>){e.preventDefault();const q=new FormData(e.currentTarget).get('q');if(q)router.push(`/tim-kiem?q=${encodeURIComponent(String(q))}`)}return <header className="site-header"><div className="shell header-inner">
  <a className="logo" href="/" aria-label="Nhà Đẹp Chất"><span className="logo-mark"><i/></span><span><b>NHÀ ĐẸP CHẤT</b><small>MẪU NHÀ · BẢN VẼ · KTS</small></span></a>
  <form className="search" role="search" onSubmit={search}><input type="search" name="q" aria-label="Tìm kiếm bản vẽ" placeholder="Tìm nhà 5x20, biệt thự 2 tầng, file CAD..."/><button type="submit" aria-label="Tìm kiếm"><Search aria-hidden size={20} strokeWidth={1.8}/></button></form>
  <nav className={mobile?'main-nav mobile-open':'main-nav'}><a href="/tim-kiem">Bản vẽ</a><a href="/#collections">Bộ sưu tập</a><a href="/#architects">Cộng đồng</a><a href="/dang-ban">Đăng bán</a><a className="nav-cart" href="#cart"><ShoppingCart size={17} strokeWidth={1.8}/> Giỏ hàng <i>0</i></a><a className="account-link" href="/tai-khoan"><span>TK</span>Tài khoản</a></nav>
  <button type="button" className="menu-toggle" aria-expanded={mobile} onClick={()=>setMobile(!mobile)} aria-label="Mở menu"><Menu aria-hidden size={24} strokeWidth={1.8}/></button>
  </div></header>}
