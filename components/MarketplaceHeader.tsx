'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Building, Building2, ChevronDown, Download, DraftingCompass, Droplets, Factory, FileText, Heart, Home, House, Landmark, Layers3, LayoutDashboard, LogIn, LogOut, Menu, PackageCheck, School, Search, Settings, Store, UserPlus, UserRound, X, Zap, type LucideIcon } from 'lucide-react';
import { authClient } from '../lib/auth-client';
import { HeaderCartLink } from './HeaderCartLink';
import { SafeImage } from './SafeImage';

type Viewer={user_id:string;display_name:string;avatar_key:string|null;account_image:string|null;role:'user'|'seller'|'admin';seller_id:string|null};
const groups=[
  {title:'Theo công trình',items:['Nhà phố','Nhà cấp 4','Biệt thự','Nhà vườn','Nhà xưởng','Văn phòng','Trường học','Chung cư']},
  {title:'Theo hồ sơ',items:['Kiến trúc','Kết cấu','Điện','Cấp thoát nước','MEP','Nội thất','Quy hoạch','Biện pháp thi công']},
  {title:'Tài nguyên',items:['AutoCAD','SketchUp','Revit','Excel dự toán','File tính kết cấu','Block CAD','Thuyết minh','Bản vẽ miễn phí']},
];
const icons:Record<string,LucideIcon>={'Nhà phố':House,'Nhà cấp 4':Home,'Biệt thự':Landmark,'Nhà xưởng':Factory,'Văn phòng':Building,'Trường học':School,'Chung cư':Building2,'Kiến trúc':DraftingCompass,'Kết cấu':Layers3,'Điện':Zap,'Cấp thoát nước':Droplets,'AutoCAD':FileText,'Bản vẽ miễn phí':Download};

export function MarketplaceHeader(){
  const router=useRouter(),root=useRef<HTMLElement>(null);
  const [mobile,setMobile]=useState(false),[menu,setMenu]=useState<'drawings'|'community'|'account'|null>(null),[viewer,setViewer]=useState<Viewer|null|undefined>(undefined);
  useEffect(()=>{let active=true;fetch('/api/marketplace/profile').then(async response=>response.ok?await response.json() as Viewer:null).then(value=>{if(active)setViewer(value)}).catch(()=>{if(active)setViewer(null)});return()=>{active=false}},[]);
  useEffect(()=>{const close=(event:MouseEvent)=>{if(root.current&&!root.current.contains(event.target as Node)){setMenu(null);setMobile(false)}};const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setMenu(null);setMobile(false)}};document.addEventListener('mousedown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('mousedown',close);document.removeEventListener('keydown',key)}},[]);
  function search(event:FormEvent<HTMLFormElement>){event.preventDefault();const q=String(new FormData(event.currentTarget).get('q')||'').trim();if(q)router.push(`/tim-kiem?q=${encodeURIComponent(q)}`)}
  async function logout(){await authClient.signOut();setViewer(null);setMenu(null);router.push('/');router.refresh()}
  const initials=viewer?.display_name?viewer.display_name.split(' ').filter(Boolean).slice(-2).map(x=>x[0]).join('').toUpperCase():'TK';
  const avatarSource=viewer?.avatar_key?`/api/profile-avatar/${viewer.user_id}?v=${encodeURIComponent(viewer.avatar_key)}`:viewer?.account_image||'';
  return <header className="site-header" ref={root}><div className="shell header-inner">
    <Link className="logo" href="/" aria-label="Nhà Đẹp Chất"><span className="logo-mark"><i/></span><span><b>NHÀ ĐẸP CHẤT</b><small>MẪU NHÀ · BẢN VẼ · KTS</small></span></Link>
    <form className="search" role="search" onSubmit={search}><input type="search" name="q" aria-label="Tìm kiếm bản vẽ" placeholder="Tìm nhà 5x20, biệt thự 2 tầng, file CAD..."/><button type="submit" aria-label="Tìm kiếm"><Search aria-hidden size={20} strokeWidth={1.8}/></button></form>
    <nav className={mobile?'main-nav mobile-open':'main-nav'} aria-label="Điều hướng chính">
      <div className="nav-group"><button type="button" className={menu==='drawings'?'open':''} aria-expanded={menu==='drawings'} onClick={()=>setMenu(menu==='drawings'?null:'drawings')}>Bản vẽ<ChevronDown className="nav-chevron" size={15} strokeWidth={1.8}/></button>{menu==='drawings'&&<MegaMenu/>}</div>
      <Link href="/bo-suu-tap">Bộ sưu tập</Link>
      <div className="nav-group community"><button type="button" className={menu==='community'?'open':''} aria-expanded={menu==='community'} onClick={()=>setMenu(menu==='community'?null:'community')}>Cộng đồng<ChevronDown className="nav-chevron" size={15} strokeWidth={1.8}/></button>{menu==='community'&&<CommunityMenu/>}</div>
      <Link href="/dang-ban">Đăng bán</Link><HeaderCartLink/>
      <div className="nav-group account-group"><button type="button" className={`account-trigger${menu==='account'?' open':''}`} aria-expanded={menu==='account'} onClick={()=>setMenu(menu==='account'?null:'account')}><span className="header-avatar">{avatarSource?<SafeImage src={avatarSource} alt=""/>:initials}</span><span>{viewer?.display_name||'Tài khoản'}</span><ChevronDown className="nav-chevron" size={15} strokeWidth={1.8}/></button>{menu==='account'&&<AccountDropdown viewer={viewer} logout={logout}/>}</div>
    </nav>
    <button type="button" className="menu-toggle" aria-expanded={mobile} onClick={()=>setMobile(!mobile)} aria-label={mobile?'Đóng menu':'Mở menu'}>{mobile?<X/>:<Menu/>}</button>
  </div></header>;
}

function MegaMenu(){return <div className="mega-menu">{groups.map(group=><section key={group.title}><h3>{group.title}</h3>{group.items.map(item=>{const Icon=icons[item];return <Link className="mega-link" href={`/tim-kiem?q=${encodeURIComponent(item)}`} key={item}><span className="menu-icon-slot">{Icon&&<Icon size={16} strokeWidth={1.8}/>}</span>{item}</Link>})}</section>)}<Link className="menu-view-all" href="/tim-kiem">Xem tất cả bản vẽ<ArrowRight size={15}/></Link></div>}
function CommunityMenu(){return <div className="community-menu"><section><h3>KIẾN TRÚC SƯ</h3><Link href="/cong-dong">Danh sách KTS</Link><Link href="/cong-dong?sap-xep=noi-bat">KTS nổi bật</Link><Link href="/cong-dong?sap-xep=moi">KTS mới tham gia</Link></section><section><h3>CỘNG ĐỒNG</h3><Link href="/cong-dong?vai-tro=engineer">Kỹ sư</Link><Link href="/cong-dong?vai-tro=interior_designer">Nhà thiết kế nội thất</Link><Link href="/cong-dong?vai-tro=contractor">Nhà thầu</Link><Link href="/cong-dong?sap-xep=moi">Hoạt động mới</Link><Link href="/cong-dong#yeu-cau-ban-ve">Yêu cầu bản vẽ</Link></section></div>}
function AccountDropdown({viewer,logout}:{viewer:Viewer|null|undefined;logout:()=>void}){
  if(viewer===undefined)return <div className="account-menu loading"><span>Đang tải...</span></div>;
  if(!viewer)return <div className="account-menu"><header><b>Chào mừng bạn</b><span>Đăng nhập để lưu và tải bản vẽ.</span></header><Link href="/dang-nhap"><LogIn/>Đăng nhập</Link><Link href="/dang-ky"><UserPlus/>Đăng ký</Link><Link href="/dang-ban"><Store/>Đăng bán hồ sơ</Link></div>;
  return <div className="account-menu"><header><b>{viewer.display_name}</b><span>{viewer.role==='admin'?'Quản trị viên':viewer.seller_id?'Người bán':'Thành viên'}</span></header><Link href="/tai-khoan"><UserRound/>Tài khoản của tôi</Link><Link href="/tai-khoan/da-luu"><Heart/>Bản vẽ đã lưu</Link><span className="menu-disabled"><PackageCheck/>Đã mua <small>Sắp mở</small></span>{viewer.seller_id&&<><Link href="/dashboard"><LayoutDashboard/>Dashboard người bán</Link><Link href="/dashboard/san-pham"><FileText/>Sản phẩm của tôi</Link><Link href="/dashboard/dang-ban"><Store/>Đăng sản phẩm</Link></>}{viewer.role==='admin'&&<Link href="/admin/san-pham"><Settings/>Quản trị</Link>}<button type="button" onClick={logout}><LogOut/>Đăng xuất</button></div>;
}
