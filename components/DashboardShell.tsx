'use client';
/* eslint-disable @next/next/no-html-link-for-pages */

import { Download, FileText, Heart, LayoutDashboard, Menu, PlusSquare, Settings, ShieldCheck, UserRound, X } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const links = [
  ['/dashboard', 'Tổng quan', LayoutDashboard],
  ['/tai-khoan', 'Hồ sơ của tôi', UserRound],
  ['/dashboard/san-pham', 'Sản phẩm', FileText],
  ['/dashboard/dang-ban', 'Đăng sản phẩm', PlusSquare],
  ['/tai-khoan/da-luu', 'Đã lưu', Heart],
  ['/dashboard/luot-tai', 'Lượt tải', Download],
  ['/tai-khoan/doi-mat-khau', 'Đăng nhập & bảo mật', Settings],
] as const;

export function DashboardShell({ children, name, admin = false }: { children: ReactNode; name: string; admin?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sidebar = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector<HTMLElement>('button, a')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
      if (event.key !== 'Tab') return;
      const items = Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a, button') || []);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', handleKey); };
  }, [open]);
  return <div className="dashboard-layout">
    <button ref={trigger} type="button" className="dashboard-menu" aria-expanded={open} aria-controls="dashboard-navigation" onClick={() => setOpen(true)}><Menu size={20} />Không gian làm việc</button>
    {open && <button type="button" className="dashboard-overlay" aria-label="Đóng menu" onClick={() => { setOpen(false); trigger.current?.focus(); }} />}
    <aside ref={sidebar} id="dashboard-navigation" className={`dashboard-sidebar${open ? ' open' : ''}`}>
      <button type="button" className="dashboard-close" aria-label="Đóng menu" onClick={() => { setOpen(false); trigger.current?.focus(); }}><X /></button>
      <a className="dashboard-brand" href="/">NHÀ ĐẸP CHẤT<small>{admin ? 'KHU VỰC QUẢN TRỊ' : 'KHÔNG GIAN NGƯỜI BÁN'}</small></a>
      <nav aria-label="Điều hướng không gian làm việc">
        {admin && <a className={`admin-nav-link${pathname.startsWith('/admin') ? ' active' : ''}`} href="/admin/san-pham" aria-current={pathname.startsWith('/admin') ? 'page' : undefined}><ShieldCheck size={18} strokeWidth={1.8} />Duyệt bài</a>}
        {links.map(([href, label, Icon]) => <a key={href} href={href} className={pathname === href ? 'active' : ''} aria-current={pathname === href ? 'page' : undefined}><Icon size={18} strokeWidth={1.8} />{label}</a>)}
      </nav>
      <p><b>{name}</b><span>{admin ? 'Quản trị viên' : 'Người bán'}</span><a href="/">Về trang chủ</a></p>
    </aside>
    <main className="dashboard-main">{children}</main>
  </div>;
}
