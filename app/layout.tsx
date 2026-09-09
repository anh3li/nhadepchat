import type { Metadata } from 'next';
import './globals.css';
import { SiteChrome } from '../components/SiteChrome';
import { getHeaderData } from '../lib/header-data';
export const metadata: Metadata = {
  metadataBase: new URL('https://nhadepchat.tranvukim-tvk.workers.dev'),
  title: 'Bản vẽ nhà đẹp, mẫu nhà đẹp | Nhà Đẹp Chất',
  description: 'Nhà Đẹp Chất cung cấp bản vẽ nhà đẹp, mẫu nhà đẹp và file bản vẽ nhà đẹp cho kiến trúc, kết cấu, MEP từ cộng đồng KTS và kỹ sư.',
  keywords: ['bản vẽ nhà đẹp', 'mẫu nhà đẹp', 'file bản vẽ nhà đẹp', 'nhà đẹp chất'],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Bản vẽ nhà đẹp, mẫu nhà đẹp | Nhà Đẹp Chất',
    description: 'Khám phá mẫu nhà đẹp, bản vẽ nhà đẹp và file bản vẽ nhà đẹp được tuyển chọn.',
    images: ['/og.png'],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bản vẽ nhà đẹp, mẫu nhà đẹp | Nhà Đẹp Chất',
    description: 'Khám phá mẫu nhà đẹp, bản vẽ nhà đẹp và file bản vẽ nhà đẹp được tuyển chọn.',
    images: ['/og.png'],
  },
  icons: {
    icon: [{ url: '/favicon-48.png', type: 'image/png', sizes: '48x48' }],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
};
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){const header=await getHeaderData();return <html lang="vi"><body><SiteChrome initialViewer={header.viewer} initialCartCount={header.cartCount}>{children}</SiteChrome></body></html>}
