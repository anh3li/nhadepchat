import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ProductDetailView} from '../../../components/views/ProductDetailView';
import {getProduct,getProductPageData} from '../../../lib/product-page-data';
export const dynamic='force-dynamic';
const origin='https://nhadepchat.pages.dev';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params,p=await getProduct(slug);if(!p)return{title:'Không tìm thấy bản vẽ',robots:{index:false,follow:false}};const description=String(p.short_description||'').slice(0,160);return{title:`${p.title} | Nhà Đẹp Chất`,description,alternates:{canonical:`${origin}/ban-ve/${slug}`},openGraph:{title:p.title,description,url:`${origin}/ban-ve/${slug}`,images:p.cover_id?[`${origin}/api/assets/${p.cover_id}`]:[]}}}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,data=await getProductPageData(slug);
  if(!data)notFound();
  return <ProductDetailView {...data}/>;
}
