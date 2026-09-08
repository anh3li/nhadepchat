/* eslint-disable @next/next/no-img-element */
'use client';

import { PointerEvent, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, X } from 'lucide-react';

export type GalleryImage = { id: string; src: string; alt: string };

export function ProductGallery({images,compact=false}:{images:GalleryImage[];compact?:boolean}){
  const [index,setIndex]=useState(0),[open,setOpen]=useState(false),[failed,setFailed]=useState<Set<string>>(new Set());
  const opener=useRef<HTMLButtonElement>(null);
  if(!images.length)return <div className={`gallery-empty${compact?' compact':''}`}>Chưa có ảnh xem trước</div>;
  const safeIndex=Math.min(index,images.length-1),active=images[safeIndex];
  return <div className={`product-gallery${compact?' compact':''}`}>
    <button ref={opener} type="button" className="gallery-main" onClick={()=>setOpen(true)} aria-label="Mở ảnh toàn màn hình">{failed.has(active.id)?<span>Không thể tải ảnh</span>:<img src={active.src} alt={active.alt} onError={()=>setFailed(old=>new Set(old).add(active.id))}/>}<span className="gallery-expand"><Maximize2 size={18}/>Xem toàn màn hình</span></button>
    {images.length>1&&<div className="gallery-thumbs" aria-label="Danh sách ảnh">{images.map((image,i)=><button type="button" className={i===safeIndex?'active':''} key={image.id} onClick={()=>setIndex(i)} aria-label={`Xem ảnh ${i+1}`}><img src={image.src} alt="" loading="lazy"/><span>{i+1}</span></button>)}</div>}
    {open&&<ImageViewer images={images} initial={safeIndex} onIndex={setIndex} onClose={()=>{setOpen(false);setTimeout(()=>opener.current?.focus(),0)}}/>}
  </div>;
}

export function ImageViewer({images,initial,onIndex,onClose}:{images:GalleryImage[];initial:number;onIndex:(i:number)=>void;onClose:()=>void}){
  const [index,setIndex]=useState(initial),[zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0}),[loading,setLoading]=useState(true),[error,setError]=useState(false);
  const dialog=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),image=useRef<HTMLImageElement>(null),pointers=useRef(new Map<number,{x:number;y:number}>()),origin=useRef({x:0,y:0,panX:0,panY:0,distance:0,zoom:1});
  const pinched=useRef(false);
  const active=images[Math.min(index,images.length-1)];
  function clamp(next:{x:number;y:number},scale=zoom){if(scale<=1||!stage.current||!image.current)return{x:0,y:0};const box=stage.current.getBoundingClientRect(),ratio=image.current.naturalWidth/image.current.naturalHeight,fitW=Math.min(box.width,box.height*ratio),fitH=fitW/ratio,maxX=Math.max(0,(fitW*scale-box.width)/2),maxY=Math.max(0,(fitH*scale-box.height)/2);return{x:Math.max(-maxX,Math.min(maxX,next.x)),y:Math.max(-maxY,Math.min(maxY,next.y))}}
  function reset(){setZoom(1);setPan({x:0,y:0})}
  function go(delta:number){const next=(index+delta+images.length)%images.length;setIndex(next);onIndex(next);setLoading(true);setError(false);reset()}
  function scaleTo(value:number){const next=Math.min(4,Math.max(1,value));setZoom(next);setPan(old=>clamp(old,next))}
  useEffect(()=>{const old=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current?.focus();return()=>{document.body.style.overflow=old}},[]);
  useEffect(()=>{images.forEach((item,i)=>{if(Math.abs(i-index)===1){const preload=new Image();preload.src=item.src}})},[images,index]);
  useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();if(event.key==='ArrowLeft')go(-1);if(event.key==='ArrowRight')go(1);if(event.key==='Tab'&&dialog.current){const focusable=[...dialog.current.querySelectorAll<HTMLElement>('button:not(:disabled)')];if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1)!;if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)});
  function down(event:PointerEvent){(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});const points=[...pointers.current.values()];if(points.length===1)pinched.current=false;else pinched.current=true;origin.current={x:event.clientX,y:event.clientY,panX:pan.x,panY:pan.y,distance:points.length===2?Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y):0,zoom}}
  function move(event:PointerEvent){if(!pointers.current.has(event.pointerId))return;pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});const points=[...pointers.current.values()];if(points.length===2&&origin.current.distance){const distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y),next=Math.min(4,Math.max(1,origin.current.zoom*distance/origin.current.distance));setZoom(next);setPan(old=>clamp(old,next));return}if(zoom>1)setPan(clamp({x:origin.current.panX+event.clientX-origin.current.x,y:origin.current.panY+event.clientY-origin.current.y}))}
  function up(event:PointerEvent){const point=pointers.current.get(event.pointerId);if(point&&!pinched.current&&pointers.current.size===1&&zoom===1){const dx=event.clientX-origin.current.x,dy=event.clientY-origin.current.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy))go(dx<0?1:-1)}pointers.current.delete(event.pointerId);const remaining=[...pointers.current.values()][0];if(remaining)origin.current={...origin.current,x:remaining.x,y:remaining.y,panX:pan.x,panY:pan.y,distance:0}}
  return <div ref={dialog} className="lightbox" role="dialog" aria-modal="true" aria-label={`Ảnh ${index+1} trên ${images.length}`} tabIndex={-1}>
    <div className="lightbox-toolbar"><button type="button" onClick={()=>scaleTo(zoom-.5)} disabled={zoom<=1} aria-label="Thu nhỏ" title="Thu nhỏ"><Minus/></button><span>{Math.round(zoom*100)}%</span><button type="button" onClick={()=>scaleTo(zoom+.5)} disabled={zoom>=4} aria-label="Phóng to" title="Phóng to"><Plus/></button><button type="button" onClick={reset} aria-label="Vừa màn hình" title="Vừa màn hình">Vừa ảnh</button><button type="button" onClick={onClose} aria-label="Đóng" title="Đóng"><X/></button></div>
    {images.length>1&&<><button type="button" className="lightbox-prev" onClick={()=>go(-1)} aria-label="Ảnh trước" title="Ảnh trước"><ChevronLeft/></button><button type="button" className="lightbox-next" onClick={()=>go(1)} aria-label="Ảnh sau" title="Ảnh sau"><ChevronRight/></button></>}
    <div ref={stage} className={`lightbox-stage${zoom>1?' zoomed':''}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={event=>{pointers.current.delete(event.pointerId);pinched.current=true}} onWheel={event=>{event.preventDefault();scaleTo(zoom+(event.deltaY<0?.25:-.25))}} onDoubleClick={()=>scaleTo(zoom===1?2:1)}>{loading&&!error&&<span className="gallery-loading">Đang tải ảnh…</span>}{error?<span className="gallery-error">Không thể tải ảnh này.</span>:<img ref={image} src={active.src} alt={active.alt} draggable={false} onLoad={()=>setLoading(false)} onError={()=>{setLoading(false);setError(true)}} style={{transform:`translate3d(${pan.x}px,${pan.y}px,0) scale(${zoom})`}}/>}</div>
    <div className="lightbox-footer"><span>{index+1} / {images.length}</span>{images.length>1&&<div className="lightbox-thumbs">{images.map((item,i)=><button type="button" key={item.id} className={i===index?'active':''} onClick={()=>{if(zoom>1)reset();setIndex(i);onIndex(i);setLoading(true);setError(false)}} aria-label={`Mở ảnh ${i+1}`}><img src={item.src} alt=""/></button>)}</div>}</div>
  </div>;
}
