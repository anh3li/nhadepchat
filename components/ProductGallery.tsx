'use client';

import { PointerEvent, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, RotateCcw, X } from 'lucide-react';

export type GalleryImage = { id: string; src: string; alt: string };

export function ProductGallery({ images, compact=false }: { images: GalleryImage[]; compact?: boolean }) {
  const [index,setIndex]=useState(0),[open,setOpen]=useState(false),[failed,setFailed]=useState<Set<string>>(new Set());
  const opener=useRef<HTMLButtonElement>(null);
  if(!images.length)return <div className={`gallery-empty${compact?' compact':''}`}>Chưa có ảnh xem trước</div>;
  const safeIndex=Math.min(index,images.length-1),active=images[safeIndex];
  const markFailed=()=>setFailed(old=>new Set(old).add(active.id));
  return <div className={`product-gallery${compact?' compact':''}`}>
    <button ref={opener} type="button" className="gallery-main" onClick={()=>setOpen(true)} aria-label="Mở ảnh toàn màn hình">{failed.has(active.id)?<span>Không thể tải ảnh</span>:<img src={active.src} alt={active.alt} onError={markFailed}/>}<Maximize2 size={20}/></button>
    {images.length>1&&<div className="gallery-thumbs" aria-label="Danh sách ảnh">{images.map((image,i)=><button type="button" className={i===safeIndex?'active':''} key={image.id} onClick={()=>setIndex(i)} aria-label={`Xem ảnh ${i+1}`}><img src={image.src} alt="" loading="lazy"/></button>)}</div>}
    {open&&<Lightbox images={images} initial={safeIndex} onIndex={setIndex} onClose={()=>{setOpen(false);setTimeout(()=>opener.current?.focus(),0)}}/>}
  </div>;
}

function Lightbox({images,initial,onIndex,onClose}:{images:GalleryImage[];initial:number;onIndex:(i:number)=>void;onClose:()=>void}){
  const [index,setIndex]=useState(initial),[zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0}),[loading,setLoading]=useState(true),[error,setError]=useState(false);
  const dialog=useRef<HTMLDivElement>(null), pointers=useRef(new Map<number,{x:number;y:number}>()), origin=useRef({x:0,y:0,panX:0,panY:0,distance:0,zoom:1});
  const active=images[index];
  const reset=()=>{setZoom(1);setPan({x:0,y:0})};
  const go=(delta:number)=>{const next=(index+delta+images.length)%images.length;setIndex(next);onIndex(next);setLoading(true);setError(false);reset()};
  useEffect(()=>{const old=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current?.focus();return()=>{document.body.style.overflow=old}},[]);
  useEffect(()=>{images.forEach((image,i)=>{if(Math.abs(i-index)===1){const preload=new Image();preload.src=image.src}})},[images,index]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='ArrowLeft')go(-1);if(e.key==='ArrowRight')go(1);if(e.key==='Tab'&&dialog.current){const focusable=[...dialog.current.querySelectorAll<HTMLElement>('button:not(:disabled)')];if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1)!;if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)});
  function down(e:PointerEvent){(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const pts=[...pointers.current.values()];origin.current={x:e.clientX,y:e.clientY,panX:pan.x,panY:pan.y,distance:pts.length===2?Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y):0,zoom};}
  function move(e:PointerEvent){if(!pointers.current.has(e.pointerId))return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const pts=[...pointers.current.values()];if(pts.length===2&&origin.current.distance){const distance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);setZoom(Math.min(4,Math.max(1,origin.current.zoom*distance/origin.current.distance)));return}if(zoom>1)setPan({x:origin.current.panX+e.clientX-origin.current.x,y:origin.current.panY+e.clientY-origin.current.y});}
  function up(e:PointerEvent){const point=pointers.current.get(e.pointerId);if(point&&pointers.current.size===1&&zoom===1){const dx=e.clientX-origin.current.x;if(Math.abs(dx)>60)go(dx<0?1:-1)}pointers.current.delete(e.pointerId)}
  const setScale=(value:number)=>{const next=Math.min(4,Math.max(1,value));setZoom(next);if(next===1)setPan({x:0,y:0})};
  return <div ref={dialog} className="lightbox" role="dialog" aria-modal="true" aria-label={`Ảnh ${index+1} trên ${images.length}`} tabIndex={-1}>
    <div className="lightbox-toolbar"><button onClick={()=>setScale(zoom-.5)} disabled={zoom<=1} aria-label="Thu nhỏ"><Minus/></button><button onClick={reset} aria-label="Đặt lại độ phóng">{Math.round(zoom*100)}%</button><button onClick={()=>setScale(zoom+.5)} disabled={zoom>=4} aria-label="Phóng to"><Plus/></button><button onClick={reset} aria-label="Đặt lại"><RotateCcw/></button><button onClick={onClose} aria-label="Đóng"><X/></button></div>
    {images.length>1&&<><button className="lightbox-prev" onClick={()=>go(-1)} aria-label="Ảnh trước"><ChevronLeft/></button><button className="lightbox-next" onClick={()=>go(1)} aria-label="Ảnh sau"><ChevronRight/></button></>}
    <div className={`lightbox-stage${zoom>1?' zoomed':''}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={e=>{e.preventDefault();setScale(zoom+(e.deltaY<0?.25:-.25))}} onDoubleClick={()=>setScale(zoom===1?2:1)}>
      {loading&&!error&&<span className="gallery-loading">Đang tải ảnh…</span>}{error?<span className="gallery-error">Không thể tải ảnh này.</span>:<img src={active.src} alt={active.alt} draggable={false} onLoad={()=>setLoading(false)} onError={()=>{setLoading(false);setError(true)}} style={{transform:`translate3d(${pan.x}px,${pan.y}px,0) scale(${zoom})`}}/>}
    </div><div className="lightbox-count">{index+1} / {images.length}</div>
  </div>;
}
