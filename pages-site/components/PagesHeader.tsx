'use client';
import { useEffect, useState } from 'react';
import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import type { HeaderData } from '../../lib/header-data';

export function PagesHeader(){
  const [data,setData]=useState<HeaderData>({viewer:null,cartCount:0});
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/public/viewer',{signal:controller.signal,cache:'no-store'})
      .then(async response=>{if(response.ok)setData(await response.json());})
      .catch(()=>{});
    return()=>controller.abort();
  },[]);
  return <MarketplaceHeader key={data.viewer?.user_id||'anonymous'} initialViewer={data.viewer} initialCartCount={data.cartCount}/>;
}
