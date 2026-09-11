'use client';
import {useSearchParams} from 'next/navigation';
import {PublicProductGrid} from '../../components/PublicProductGrid';
import type {ProductCardData} from '../../components/ProductCard';

export function SearchCatalog({products}:{products:ProductCardData[]}){
  const params=useSearchParams(),q=(params.get('q')||'').trim().toLocaleLowerCase('vi-VN');
  const rows=products.filter(p=>!q||(q.includes('miễn phí')?Boolean(p.is_free):[p.title,p.category,p.building_type,p.formats].some(value=>String(value||'').toLocaleLowerCase('vi-VN').includes(q))));
  if(params.get('sap-xep')==='tai-nhieu')rows.sort((a,b)=>Number(b.download_count||0)-Number(a.download_count||0));
  return <main className="subpage"><div className="page-title"><p className="eyebrow">TÌM KIẾM</p><h1>{q?`Kết quả cho “${q}”`:'Tất cả bản vẽ'}</h1><p>{rows.length} hồ sơ được tìm thấy.</p></div><PublicProductGrid products={rows}/></main>;
}
