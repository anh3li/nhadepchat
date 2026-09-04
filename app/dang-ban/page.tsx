import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { SellerOnboarding } from '../../components/SellerOnboarding';
import { requireSession } from '../../lib/server-auth';
import { getD1 } from '../../db';
export const metadata:Metadata={title:'Đăng bán | Nhà Đẹp Chất',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function SellOnboardingPage(){const session=await requireSession('/dang-ban');const exists=await getD1().prepare('SELECT id FROM seller_profiles WHERE user_id=?').bind(session.user.id).first();if(exists)redirect('/dashboard');return <><MarketplaceHeader/><main className="subpage"><div className="page-title"><p className="eyebrow">DÀNH CHO KTS & KỸ SƯ</p><h1>Tạo hồ sơ người bán</h1><p>Hoàn thiện thông tin chuyên môn trước khi đăng hồ sơ đầu tiên.</p></div><section className="content-card"><SellerOnboarding defaultName={session.user.name}/></section></main></>}
