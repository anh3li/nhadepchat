import {notFound} from 'next/navigation';
import {ProductDetailView} from '../../../../components/views/ProductDetailView';
import {getCatalog,siteOrigin} from '../../../lib/catalog';

export function generateStaticParams(){return Object.keys(getCatalog().products).map(slug=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,data=getCatalog().products[slug];
  if(!data)return {};
  return {title:`${data.p.title} | Nhà Đẹp Chất`,description:data.p.short_description,
    alternates:{canonical:`${siteOrigin}/ban-ve/${slug}/`},
    openGraph:{title:data.p.title,description:data.p.short_description,images:data.p.cover_id?[`/media/${data.p.cover_id}.webp`]:[]}};
}
export default async function Product({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,data=getCatalog().products[slug];
  if(!data)notFound();
  return <ProductDetailView {...data}/>;
}
