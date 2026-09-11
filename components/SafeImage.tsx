/* eslint-disable @next/next/no-img-element */
'use client';

import { ImageOff } from 'lucide-react';
import {publicImageUrl} from '../lib/public-image';
import { ImgHTMLAttributes,ReactNode,useState } from 'react';

type Props=Omit<ImgHTMLAttributes<HTMLImageElement>,'src'|'onError'> & {src:string;fallbackClassName?:string;fallback?:ReactNode};

export function SafeImage({src:source,alt='',className='',fallbackClassName='',fallback,loading='lazy',decoding='async',...props}:Props){
  const src=publicImageUrl(source,true);
  const[failedSrc,setFailedSrc]=useState('');
  if(failedSrc===src)return <span className={`safe-image-fallback ${className} ${fallbackClassName}`.trim()} role={alt?'img':undefined} aria-label={alt?`${alt} — không thể tải ảnh`:undefined} aria-hidden={alt?undefined:true}>{fallback??<ImageOff aria-hidden size={22}/>}</span>;
  return <img {...props} className={className} src={src} alt={alt} loading={loading} decoding={decoding} onError={()=>setFailedSrc(src)}/>;
}
