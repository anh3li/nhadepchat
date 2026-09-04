'use client';
/* eslint-disable @next/next/no-html-link-for-pages */

import { LayoutDashboard, FileText, PlusSquare, Download, Settings, UserRound, Menu, X, Heart } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';

const links=[['/dashboard','Tổng quan',LayoutDashboard],['/tai-khoan','Hồ sơ của tôi',UserRound],['/dashboard/san-pham','Sản phẩm',FileText],['/dashboard/dang-ban','Đăng sản phẩm',PlusSquare],['/dashboard/luot-tai','Lượt tải',Download],['/tai-khoan/da-luu','Đã lưu',Heart],['/tai-khoan','Cài đặt',Settings]] as const;
export function DashboardShell({children,name,admin=false}:{children:ReactNode,name:string,admin?:boolean}){const[open,setOpen]=useState(false),pathname=usePathname();const active=(href:string)=>href==='/dashboard'?pathname===href:pathname.startsWith(href);return <div className="dashboard-layout"><button className="dashboard-menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>} Menu</button><aside className={open?'dashboard-sidebar open':'dashboard-sidebar'}><a className="dashboard-brand" href="/">NHÀ ĐẸP CHẤT<small>{admin?'KHU VỰC QUẢN TRỊ':'KHU VỰC NGƯỜI BÁN'}</small></a><nav>{admin&&<a className={`admin-nav-link${active('/admin')?' active':''}`} href="/admin/san-pham"><LayoutDashboard size={17}/>Duyệt bài</a>}{links.map(([href,label,Icon])=><a className={active(href)?'active':''} href={href} key={label}><Icon size={17}/>{label}</a>)}</nav><p><b>{name}</b><span>{admin?'Quản trị viên':'Người bán'}</span><a href="/">Về trang chủ</a></p></aside><main className="dashboard-main">{children}</main></div>}
