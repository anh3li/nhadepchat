/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next';
import { DashboardShell } from '../../../components/DashboardShell';
import { requireSeller } from '../../../lib/server-auth';
import { getD1 } from '../../../db';
import { SellerProductList } from '../../../components/SellerProductList';
import Link from 'next/link';
export const metadata:Metadata={title:'Sản phẩm của tôi | Nhà Đẹp Chất',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function SellerProducts(){const{session,profile}=await requireSeller('/dashboard/san-pham');const rows=await getD1().prepare(`SELECT p.*,(SELECT id FROM product_assets WHERE product_id=p.id ORDER BY CASE WHEN type='cover' THEN 0 ELSE 1 END,sort_order LIMIT 1) cover_id,(SELECT COUNT(*) FROM product_assets WHERE product_id=p.id) images,(SELECT COUNT(*) FROM product_files WHERE product_id=p.id) files,(SELECT COUNT(*) FROM downloads WHERE product_id=p.id) downloads FROM products p WHERE seller_id=? ORDER BY updated_at DESC`).bind(profile.id).all<Record<string,any>>();return <DashboardShell name={session.user.name} admin={profile.role==='admin'}><div className="dashboard-heading"><div><p className="eyebrow">QUẢN LÝ</p><h1>Sản phẩm của tôi</h1><p>Theo dõi trạng thái kiểm duyệt và cập nhật hồ sơ đã đăng.</p></div><Link className="button button-primary" href="/dashboard/dang-ban">Đăng sản phẩm</Link></div><SellerProductList initial={rows.results as any}/></DashboardShell>}
