/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next';
import { DashboardShell } from '../../../components/DashboardShell';
import { requireSeller } from '../../../lib/server-auth';
import { getD1 } from '../../../db';
export const metadata:Metadata={title:'Lượt tải | Nhà Đẹp Chất',robots:{index:false,follow:false}};export const dynamic='force-dynamic';
export default async function Downloads(){const{session,profile}=await requireSeller('/dashboard/luot-tai');const rows=await getD1().prepare(`SELECT p.title,p.slug,COUNT(d.id) total,MAX(d.created_at) latest FROM products p LEFT JOIN downloads d ON d.product_id=p.id WHERE p.seller_id=? GROUP BY p.id ORDER BY total DESC`).bind(profile.id).all<Record<string,any>>();return <DashboardShell name={session.user.name} admin={profile.role==='admin'}><div className="dashboard-heading"><div><p className="eyebrow">THỐNG KÊ</p><h1>Lượt tải</h1></div></div><section className="content-card table-card"><div className="data-table">{rows.results.map(row=><article key={row.slug}><div><b>{row.title}</b><small>{row.latest?`Tải gần nhất ${new Date(row.latest).toLocaleDateString('vi-VN')}`:'Chưa có lượt tải'}</small></div><strong>{row.total} lượt tải</strong></article>)}</div></section></DashboardShell>}
