'use client';

import { Download, FileText, Heart, Home, LayoutDashboard, Menu, PlusSquare, Settings, ShieldCheck, SlidersHorizontal, Store, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';

type NavItem = readonly [href: string, label: string, icon: typeof UserRound];

const accountLinks: readonly NavItem[] = [
  ['/tai-khoan', 'Hồ sơ cá nhân', UserRound],
  ['/tai-khoan/da-luu', 'Bản vẽ đã lưu', Heart],
  ['/tai-khoan/doi-mat-khau', 'Đăng nhập & bảo mật', Settings],
];

const sellerLinks: readonly NavItem[] = [
  ['/dashboard', 'Tổng quan', LayoutDashboard],
  ['/dashboard/san-pham', 'Sản phẩm của tôi', FileText],
  ['/dashboard/dang-ban', 'Đăng sản phẩm', PlusSquare],
  ['/dashboard/luot-tai', 'Lượt tải', Download],
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard' || href === '/tai-khoan') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavGroup({ label, items, pathname }: { label: string; items: readonly NavItem[]; pathname: string }) {
  return <div className="dashboard-nav-group">
    <span>{label}</span>
    {items.map(([href, itemLabel, Icon]) => {
      const active = isActive(pathname, href);
      return <Link key={href} href={href} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
        <Icon size={18} strokeWidth={1.8} />{itemLabel}
      </Link>;
    })}
  </div>;
}

export function DashboardShell({ children, name, admin = false, seller = true }: { children: ReactNode; name: string; admin?: boolean; seller?: boolean }) {
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

  const roleLabel = admin ? 'Quản trị viên' : seller ? 'Người bán' : 'Thành viên';

  return <div className="dashboard-layout">
    <button ref={trigger} type="button" className="dashboard-menu" aria-expanded={open} aria-controls="dashboard-navigation" onClick={() => setOpen(true)}><Menu size={20} />Không gian làm việc</button>
    {open && <button type="button" className="dashboard-overlay" aria-label="Đóng menu" onClick={() => { setOpen(false); trigger.current?.focus(); }} />}
    <aside ref={sidebar} id="dashboard-navigation" className={`dashboard-sidebar${open ? ' open' : ''}`}>
      <button type="button" className="dashboard-close" aria-label="Đóng menu" onClick={() => { setOpen(false); trigger.current?.focus(); }}><X /></button>
      <BrandLogo className="dashboard-brand" subtitle="KHÔNG GIAN LÀM VIỆC" />
      <nav aria-label="Điều hướng không gian làm việc">
        {seller && <NavGroup label="NGƯỜI BÁN" items={sellerLinks} pathname={pathname} />}
        {!seller && <div className="dashboard-nav-group"><span>NGƯỜI BÁN</span><Link href="/dang-ban"><Store size={18} strokeWidth={1.8} />Bắt đầu đăng bán</Link></div>}
        <NavGroup label="TÀI KHOẢN" items={accountLinks} pathname={pathname} />
        {admin && <div className="dashboard-nav-group">
          <span>QUẢN TRỊ</span>
          <Link className={isActive(pathname, '/admin/san-pham') ? 'active admin-nav-link' : 'admin-nav-link'} href="/admin/san-pham" aria-current={isActive(pathname, '/admin/san-pham') ? 'page' : undefined}><ShieldCheck size={18} strokeWidth={1.8} />Duyệt sản phẩm</Link>
          <Link className={isActive(pathname, '/admin/cai-dat') ? 'active admin-nav-link' : 'admin-nav-link'} href="/admin/cai-dat" aria-current={isActive(pathname, '/admin/cai-dat') ? 'page' : undefined}><SlidersHorizontal size={18} strokeWidth={1.8} />Cài đặt số liệu</Link>
        </div>}
      </nav>
      <div className="dashboard-user"><b>{name}</b><span>{roleLabel}</span><Link href="/"><Home size={14} strokeWidth={1.8} />Về trang chủ</Link></div>
    </aside>
    <main className="dashboard-main">{children}</main>
  </div>;
}
