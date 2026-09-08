import type { Metadata } from 'next';
import './globals.css';
import { SiteChrome } from '../components/SiteChrome';
import { getHeaderData } from '../lib/header-data';
export const metadata: Metadata = {
  metadataBase: new URL('https://nhadepchat.tranvukim-tvk.workers.dev'),
  title: 'Nhà Đẹp Chất | Mẫu nhà, bản vẽ và kiến trúc sư',
  description: 'Marketplace bản vẽ kiến trúc, kết cấu, MEP và dự toán từ cộng đồng KTS và kỹ sư.',
  openGraph: {
    title: 'Nhà Đẹp Chất',
    description: 'Mẫu nhà · Bản vẽ · KTS',
    images: ['/og.png'],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nhà Đẹp Chất',
    description: 'Mẫu nhà · Bản vẽ · KTS',
    images: ['/og.png'],
  },
  icons: {
    icon: [{ url: '/favicon-48.png', type: 'image/png', sizes: '48x48' }],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
};
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){const header=await getHeaderData();return <html lang="vi"><body><SiteChrome initialViewer={header.viewer} initialCartCount={header.cartCount}>{children}</SiteChrome></body></html>}
