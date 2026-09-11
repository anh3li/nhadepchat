import {Suspense} from 'react';
import {SearchCatalog} from '../../components/SearchCatalog';
import {getCatalog} from '../../lib/catalog';
import type {ProductCardData} from '../../../components/ProductCard';
export const metadata={title:'Tìm kiếm bản vẽ | Nhà Đẹp Chất'};
export default function Search(){
  const products=Object.values(getCatalog().products).map(data=>(data as {p:ProductCardData}).p);
  return <Suspense fallback={<main className="subpage"><h1>Tìm kiếm bản vẽ</h1></main>}><SearchCatalog products={products}/></Suspense>;
}
