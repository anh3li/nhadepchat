'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DetailBackButton(){
  const router=useRouter();
  function goBack(){
    if(window.history.length>1)router.back();
    else router.push('/tim-kiem');
  }
  return <button type="button" className="detail-back" onClick={goBack}><ArrowLeft size={17} strokeWidth={1.8}/>Trở về</button>;
}
