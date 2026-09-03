import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://kho-ban-ve-nha-dep.tranvukim-tvk.chatgpt.site'),
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
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="vi"><body>{children}</body></html>}
