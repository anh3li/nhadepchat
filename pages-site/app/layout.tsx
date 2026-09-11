import type {Metadata} from 'next';
import '../../app/globals.css';
import '../../app/home.css';
import { PagesHeader } from '../components/PagesHeader';
import { siteOrigin } from '../lib/catalog';

export const metadata:Metadata = {
  metadataBase:new URL(siteOrigin),
  title:'Bản vẽ nhà đẹp, mẫu nhà đẹp | Nhà Đẹp Chất',
  description:'Thư viện bản vẽ nhà đẹp từ cộng đồng kiến trúc sư và kỹ sư.',
  icons:{icon:'/favicon-48.png',apple:'/apple-touch-icon.png'},
};
export default function Layout({children}:{children:React.ReactNode}) {
  return <html lang="vi"><body><PagesHeader/>{children}</body></html>;
}
