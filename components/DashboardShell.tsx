'use client';
/* eslint-disable @next/next/no-html-link-for-pages */

import { LayoutDashboard, FileText, PlusSquare, Download, Settings, UserRound, Menu, X, Heart } from 'lucide-react';
import { ReactNode, useState } from 'react';

const links=[['/dashboard','Tổng quan',LayoutDashboard],['/tai-khoan','Hồ sơ của tôi',UserRound],['/dashboard/san-pham','Sản phẩm',FileText],['/dashboard/dang-ban','Đăng sản phẩm',PlusSquare],['/dashboard/luot-tai','Lượt tải',Download],['/tai-khoan/da-luu','Đã lưu',Heart],['/tai-khoan','Cài đặt',Settings]] as const;
export function DashboardShell({children,name,admin=false}:{children:ReactNode,name:string,admin?:boolean}){const[open,setOpen]=useState(false);return <div className="dashboard-layout"><button className="dashboard-menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>} Menu</button><aside className={open?'dashboard-sidebar open':'dashboard-sidebar'}><a className="dashboard-brand" href="/">NHÀ ĐẸP CHẤT<small>KHU VỰC NGƯỜI BÁN</small></a><nav>{links.map(([href,label,Icon])=><a href={href} key={label}><Icon size={17}/>{label}</a>)}{admin&&<a href="/admin/san-pham"><LayoutDashboard size={17}/>Quản trị</a>}</nav><p>{name}<a href="/">Về trang chủ</a></p></aside><main className="dashboard-main">{children}</main></div>}
