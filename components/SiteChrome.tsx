'use client';

import { usePathname } from 'next/navigation';
import { MarketplaceHeader } from './MarketplaceHeader';
import type { HeaderViewer } from '../lib/header-data';

const chromeFreeRoutes = [
  '/admin',
  '/dashboard',
  '/tai-khoan',
];

export function SiteChrome({ children, initialViewer, initialCartCount }: { children: React.ReactNode; initialViewer: HeaderViewer | null; initialCartCount: number }) {
  const pathname = usePathname();
  const showHeader = !chromeFreeRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return (
    <>
      {showHeader && <MarketplaceHeader initialViewer={initialViewer} initialCartCount={initialCartCount} />}
      {children}
    </>
  );
}
