'use client';

import { MouseEvent, useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

let ids = new Set<string>();
let authenticated = false;
let loaded = false;
let request: Promise<void> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

function load() {
  if (loaded) return Promise.resolve();
  request ??= fetch('/api/favorites').then(async (response) => {
    const data = await response.json() as { authenticated: boolean; productIds: string[] };
    authenticated = data.authenticated; ids = new Set(data.productIds); loaded = true; notify();
  }).catch(() => { loaded = true; });
  return request;
}

export function FavoriteButton({ productId, returnUrl, className = 'save' }: { productId: string; returnUrl?: string; className?: string }) {
  const [, rerender] = useState(0); const [busy, setBusy] = useState(false); const saved = ids.has(productId);
  useEffect(() => { const fn=()=>rerender(v=>v+1); listeners.add(fn); void load(); return()=>{listeners.delete(fn)}; }, []);
  async function toggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault(); event.stopPropagation(); if (busy) return;
    await load();
    if (!authenticated) { const back=returnUrl||location.pathname+location.search+location.hash; location.assign(`/dang-nhap?returnTo=${encodeURIComponent(back)}`); return; }
    const previous=ids.has(productId); if(previous)ids.delete(productId);else ids.add(productId); notify(); setBusy(true);
    try { const response=await fetch('/api/favorites',{method:previous?'DELETE':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId})}); if(!response.ok) throw new Error(); }
    catch { if(previous)ids.add(productId);else ids.delete(productId); notify(); }
    finally { setBusy(false); }
  }
  return <button type="button" className={`${className}${saved?' saved':''}`} aria-label={saved?'Bỏ lưu bản vẽ':'Lưu bản vẽ'} aria-pressed={saved} disabled={busy} onClick={toggle}><Heart size={17} strokeWidth={1.8} fill={saved?'currentColor':'none'} aria-hidden /></button>;
}
