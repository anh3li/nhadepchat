import {notFound} from 'next/navigation';
import {SellerView} from '../../../../components/views/SellerView';
import {getCatalog,siteOrigin} from '../../../lib/catalog';
export function generateStaticParams(){return Object.keys(getCatalog().sellers).map(slug=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,data=getCatalog().sellers[slug];
  return {title:data?`${data.s.display_name} | Nhà Đẹp Chất`:'Không tìm thấy',alternates:{canonical:`${siteOrigin}/kts/${slug}/`}};
}
export default async function Seller({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,data=getCatalog().sellers[slug];
  if(!data)notFound();
  return <SellerView {...data}/>;
}
