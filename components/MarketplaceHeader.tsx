'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FormEvent,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import {
  ArrowRight,
  Building,
  Building2,
  ChevronDown,
  Download,
  DraftingCompass,
  Droplets,
  Factory,
  FileText,
  Heart,
  Home,
  House,
  Landmark,
  Layers3,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PackageCheck,
  School,
  Search,
  Settings,
  Store,
  UserPlus,
  UserRound,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { authClient } from '../lib/auth-client';
import type { HeaderViewer } from '../lib/header-data';
import { HeaderCartLink } from './HeaderCartLink';
import { SafeImage } from './SafeImage';
import { BrandLogo } from './BrandLogo';

type MenuName = 'drawings' | 'community' | 'account';

const groups = [
  { title: 'Theo công trình', items: ['Nhà phố','Nhà cấp 4','Biệt thự','Nhà vườn','Nhà xưởng','Văn phòng','Trường học','Chung cư','Công trình khác'] },
  { title: 'Theo hồ sơ', items: ['Kiến trúc','Kết cấu','Điện','Cấp thoát nước','MEP','Nội thất','Quy hoạch','Biện pháp thi công'] },
  { title: 'Tài nguyên', items: ['AutoCAD','SketchUp','Revit','Excel dự toán','File tính kết cấu','Block CAD','Thuyết minh','Bản vẽ miễn phí'] },
];

const icons: Record<string, LucideIcon> = {
  'Nhà phố': House,
  'Nhà cấp 4': Home,
  'Biệt thự': Landmark,
  'Nhà xưởng': Factory,
  'Văn phòng': Building,
  'Trường học': School,
  'Chung cư': Building2,
  'Kiến trúc': DraftingCompass,
  'Kết cấu': Layers3,
  'Điện': Zap,
  'Cấp thoát nước': Droplets,
  AutoCAD: FileText,
  'Bản vẽ miễn phí': Download,
};

export function MarketplaceHeader({ initialViewer, initialCartCount }: { initialViewer: HeaderViewer | null; initialCartCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [navigating, startNavigation] = useTransition();
  const [viewer, setViewer] = useState<HeaderViewer | null>(initialViewer);
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null);
  const [menuRoute, setMenuRoute] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileRoute, setMobileRoute] = useState('');

  const activeMenu = menuRoute === pathname ? openMenu : null;
  const activeMobile = mobileRoute === pathname && mobileOpen;

  useEffect(() => {
    const id = globalThis.setTimeout(() => {
      ['/','/tim-kiem','/bo-suu-tap','/cong-dong','/gio-hang'].forEach(route => router.prefetch(route));
    }, 300);
    return () => globalThis.clearTimeout(id);
  }, [router]);

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  function toggleMenu(menu: MenuName) {
    setOpenMenu(activeMenu === menu ? null : menu);
    setMenuRoute(pathname);
  }

  function toggleMobile() {
    setMobileOpen(!activeMobile);
    setMobileRoute(pathname);
  }

  function beginNavigation(href: string) {
    setOpenMenu(null);
    setMobileOpen(false);
    startNavigation(() => router.push(href));
  }

  function navigate(event: ReactMouseEvent<HTMLElement>) {
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return;
    const href = `${url.pathname}${url.search}${url.hash}`;
    if (href === `${location.pathname}${location.search}${location.hash}`) return;
    event.preventDefault();
    beginNavigation(href);
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get('q') || '').trim();
    if (query) beginNavigation(`/tim-kiem?q=${encodeURIComponent(query)}`);
  }

  async function logout() {
    await authClient.signOut();
    setViewer(null);
    setOpenMenu(null);
    beginNavigation('/');
    router.refresh();
  }

  const initials = viewer?.display_name
    ? viewer.display_name.split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase()
    : 'TK';
  const avatarSource = viewer?.avatar_key
    ? `/api/profile-avatar/${viewer.user_id}?v=${encodeURIComponent(viewer.avatar_key)}`
    : viewer?.account_image || '';

  return <header className={`site-header${navigating ? ' is-navigating' : ''}`} ref={headerRef} onClick={navigate}>
    <span className="navigation-progress" aria-hidden />
    <div className="shell header-inner">
      <BrandLogo />
      <form className="search" role="search" onSubmit={search}><input type="search" name="q" aria-label="Tìm kiếm bản vẽ" placeholder="Tìm nhà 5x20, biệt thự 2 tầng, file CAD..."/><button type="submit" aria-label="Tìm kiếm"><Search aria-hidden size={20} strokeWidth={1.8}/></button></form>
      <nav className={activeMobile ? 'main-nav mobile-open' : 'main-nav'} aria-label="Điều hướng chính">
        <div className="nav-group">
          <button type="button" className={activeMenu === 'drawings' ? 'open' : ''} aria-expanded={activeMenu === 'drawings'} onClick={() => toggleMenu('drawings')}>Bản vẽ<ChevronDown className="nav-chevron" size={15} strokeWidth={1.8}/></button>
          <MegaMenu open={activeMenu === 'drawings'}/>
        </div>
        <Link href="/bo-suu-tap">Bộ sưu tập</Link>
        <div className="nav-group community">
          <button type="button" className={activeMenu === 'community' ? 'open' : ''} aria-expanded={activeMenu === 'community'} onClick={() => toggleMenu('community')}>Cộng đồng<ChevronDown className="nav-chevron" size={15} strokeWidth={1.8}/></button>
          <CommunityMenu open={activeMenu === 'community'}/>
        </div>
        <Link href="/dang-ban">Đăng bán</Link>
        <HeaderCartLink initialCount={initialCartCount}/>
        <div className="nav-group account-group">
          <button type="button" className={`account-trigger${activeMenu === 'account' ? ' open' : ''}`} aria-expanded={activeMenu === 'account'} onClick={() => toggleMenu('account')}><span className="header-avatar">{avatarSource ? <SafeImage src={avatarSource} alt=""/> : initials}</span><span>{viewer?.display_name || 'Tài khoản'}</span><ChevronDown className="nav-chevron" size={15} strokeWidth={1.8}/></button>
          <AccountDropdown open={activeMenu === 'account'} viewer={viewer} logout={logout}/>
        </div>
      </nav>
      <button type="button" className="menu-toggle" aria-expanded={activeMobile} onClick={toggleMobile} aria-label={activeMobile ? 'Đóng menu' : 'Mở menu'}>{activeMobile ? <X/> : <Menu/>}</button>
    </div>
  </header>;
}

function menuClass(base: string, open: boolean) {
  return `${base} submenu-surface${open ? ' menu-open' : ''}`;
}

function MegaMenu({ open }: { open: boolean }) {
  return <div className={menuClass('mega-menu', open)} aria-hidden={!open}>{groups.map(group => <section key={group.title}><h3>{group.title}</h3>{group.items.map(item => { const Icon = icons[item]; return <Link className="mega-link" href={`/tim-kiem?q=${encodeURIComponent(item)}`} tabIndex={open ? 0 : -1} key={item}><span className="menu-icon-slot">{Icon && <Icon size={16} strokeWidth={1.8}/>}</span>{item}</Link>; })}</section>)}<Link className="menu-view-all" href="/tim-kiem" tabIndex={open ? 0 : -1}>Xem tất cả bản vẽ<ArrowRight size={15}/></Link></div>;
}

function CommunityMenu({ open }: { open: boolean }) {
  return <div className={menuClass('community-menu', open)} aria-hidden={!open}><section><h3>KIẾN TRÚC SƯ</h3><Link href="/cong-dong" tabIndex={open ? 0 : -1}>Danh sách KTS</Link><Link href="/cong-dong?sap-xep=noi-bat" tabIndex={open ? 0 : -1}>KTS nổi bật</Link><Link href="/cong-dong?sap-xep=moi" tabIndex={open ? 0 : -1}>KTS mới tham gia</Link><Link href="/cong-dong?sap-xep=noi-bat" tabIndex={open ? 0 : -1}>KTS được đánh giá cao</Link></section><section><h3>CỘNG ĐỒNG</h3><Link href="/cong-dong?vai-tro=engineer" tabIndex={open ? 0 : -1}>Kỹ sư</Link><Link href="/cong-dong?vai-tro=interior_designer" tabIndex={open ? 0 : -1}>Nhà thiết kế nội thất</Link><Link href="/cong-dong?vai-tro=contractor" tabIndex={open ? 0 : -1}>Nhà thầu</Link><Link href="/cong-dong?sap-xep=moi" tabIndex={open ? 0 : -1}>Hoạt động mới</Link><Link href="/cong-dong#yeu-cau-ban-ve" tabIndex={open ? 0 : -1}>Yêu cầu bản vẽ</Link></section></div>;
}

function AccountDropdown({ open, viewer, logout }: { open: boolean; viewer: HeaderViewer | null; logout: () => void }) {
  const className = menuClass('account-menu', open);
  if (!viewer) return <div className={className} aria-hidden={!open}><header><b>Chào mừng bạn</b><span>Đăng nhập để lưu và tải bản vẽ.</span></header><Link href="/dang-nhap" tabIndex={open ? 0 : -1}><LogIn/>Đăng nhập</Link><Link href="/dang-ky" tabIndex={open ? 0 : -1}><UserPlus/>Đăng ký</Link><Link href="/dang-ban" tabIndex={open ? 0 : -1}><Store/>Đăng bán hồ sơ</Link></div>;
  return <div className={className} aria-hidden={!open}><header><b>{viewer.display_name}</b><span>{viewer.role === 'admin' ? 'Quản trị viên' : viewer.seller_id ? 'Người bán' : 'Thành viên'}</span></header><Link href="/tai-khoan" tabIndex={open ? 0 : -1}><UserRound/>Tài khoản của tôi</Link><Link href="/tai-khoan/da-luu" tabIndex={open ? 0 : -1}><Heart/>Bản vẽ đã lưu</Link><span className="menu-disabled"><PackageCheck/>Đã mua <small>Sắp mở</small></span>{viewer.seller_id && <><Link href="/dashboard" tabIndex={open ? 0 : -1}><LayoutDashboard/>Dashboard người bán</Link><Link href="/dashboard/san-pham" tabIndex={open ? 0 : -1}><FileText/>Sản phẩm của tôi</Link><Link href="/dashboard/dang-ban" tabIndex={open ? 0 : -1}><Store/>Đăng sản phẩm</Link></>}{viewer.role === 'admin' && <Link href="/admin/san-pham" tabIndex={open ? 0 : -1}><Settings/>Quản trị</Link>}<button type="button" tabIndex={open ? 0 : -1} onClick={logout}><LogOut/>Đăng xuất</button></div>;
}
