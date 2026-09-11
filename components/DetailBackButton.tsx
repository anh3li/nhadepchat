'use client';
import {useSiteRouter} from './useSiteRouter';

import { ArrowLeft } from 'lucide-react';


export function DetailBackButton(){
  const router=useSiteRouter();
  function goBack(){
    if(window.history.length>1)router.back();
    else router.push('/tim-kiem');
  }
  return <button type="button" className="detail-back" onClick={goBack}><ArrowLeft size={17} strokeWidth={1.8}/>Trở về</button>;
}
