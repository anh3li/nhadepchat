import type { Metadata } from 'next';
import { DashboardShell } from '../../../components/DashboardShell';
import { AdminProducts } from '../../../components/AdminProducts';
import { requireAdmin } from '../../../lib/server-auth';
export const metadata:Metadata={title:'Duyệt sản phẩm | Nhà Đẹp Chất',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function AdminProductsPage(){const session=await requireAdmin('/admin/san-pham');return <DashboardShell name={session.user.name} admin><div className="dashboard-heading"><div><p className="eyebrow">QUẢN TRỊ</p><h1>Duyệt sản phẩm</h1></div></div><AdminProducts/></DashboardShell>}
