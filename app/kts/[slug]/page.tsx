import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {SellerView} from '../../../components/views/SellerView';
import {seller,getSellerPageData} from '../../../lib/seller-page-data';
export const dynamic='force-dynamic';
const origin='https://nhadepchat.pages.dev';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const{slug}=await params,s=await seller(slug);if(!s)return{title:'Không tìm thấy KTS',robots:{index:false,follow:false}};const description=`${s.professional_title} ${s.display_name}. ${s.file_count} hồ sơ đã duyệt trên Nhà Đẹp Chất.`;return{title:`${s.display_name} | Nhà Đẹp Chất`,description,alternates:{canonical:`${origin}/kts/${slug}`},openGraph:{title:s.display_name,description,url:`${origin}/kts/${slug}`,images:s.avatar_key?[`${origin}/api/profile-avatar/${slug}`]:[]}}}
export default async function SellerPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,data=await getSellerPageData(slug);
  if(!data)notFound();
  return <SellerView {...data}/>;
}
