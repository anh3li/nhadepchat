import type { Metadata } from 'next';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProductWizard } from '../../../components/ProductWizard';
import { requireSeller } from '../../../lib/server-auth';
export const metadata:Metadata={title:'Đăng sản phẩm | Nhà Đẹp Chất',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function CreateProduct(){const{session,profile}=await requireSeller('/dashboard/dang-ban');return <DashboardShell name={session.user.name} admin={profile.role==='admin'}><div className="dashboard-heading"><div><p className="eyebrow">SẢN PHẨM</p><h1>Đăng hồ sơ mới</h1></div></div><ProductWizard/></DashboardShell>}
