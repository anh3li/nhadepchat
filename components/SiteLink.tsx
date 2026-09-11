'use client';

import NextLink, {type LinkProps} from 'next/link';
import type {AnchorHTMLAttributes} from 'react';
import {isPublicPage} from '../lib/site-navigation';

type Props = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>,keyof LinkProps>;

export default function SiteLink({href,prefetch,replace,scroll,onNavigate,...props}:Props){
  const path=typeof href==='string'?href:href.pathname||'/';
  const isPublic=isPublicPage(path);
  if(process.env.NEXT_PUBLIC_PAGES_SITE==='1'&&isPublic){
    return <NextLink {...props} href={href} prefetch={prefetch} replace={replace} scroll={scroll} onNavigate={onNavigate}/>;
  }
  // Private pages use the backend router. Cross that boundary as a document,
  // never by mixing Next.js static RSC with Vinext's RSC wire format.
  const target=typeof href==='string'?href:`${href.pathname||'/'}${href.query?'?'+new URLSearchParams(href.query as Record<string,string>):''}${href.hash||''}`;
  return <a {...props} href={target}/>;
}
