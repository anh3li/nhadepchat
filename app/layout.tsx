import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://kho-ban-ve-nha-dep.tranvukim-tvk.chatgpt.site'),
  title: 'Kho Bản Vẽ Nhà Đẹp | Thư viện hồ sơ xây dựng',
  description: 'Thư viện bản vẽ kiến trúc, kết cấu, MEP và dự toán xây dựng chọn lọc.',
  openGraph: {
    title: 'Kho Bản Vẽ Nhà Đẹp',
    description: 'Thư viện hồ sơ xây dựng chọn lọc',
    images: ['/og.png'],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kho Bản Vẽ Nhà Đẹp',
    description: 'Thư viện hồ sơ xây dựng chọn lọc',
    images: ['/og.png'],
  },
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="vi"><body>{children}</body></html>}
