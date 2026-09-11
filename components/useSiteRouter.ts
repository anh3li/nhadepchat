'use client';
import {useRouter} from 'next/navigation';
import {useMemo} from 'react';
import {isPublicPage} from '../lib/site-navigation';

export function useSiteRouter(){
  const router=useRouter();
  return useMemo(()=>({
    ...router,
    push(href:string){
      if(process.env.NEXT_PUBLIC_PAGES_SITE==='1'&&isPublicPage(href))router.push(href);
      else window.location.assign(href);
    },
    replace(href:string){
      if(process.env.NEXT_PUBLIC_PAGES_SITE==='1'&&isPublicPage(href))router.replace(href);
      else window.location.replace(href);
    },
    back(){window.history.back();},
    refresh(){if(process.env.NEXT_PUBLIC_PAGES_SITE==='1')window.location.reload();else router.refresh();},
  }),[router]);
}
