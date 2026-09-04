import type { Metadata } from 'next';
import { MarketplaceHeader } from '../../../components/MarketplaceHeader';
import { PublicProductGrid } from '../../../components/PublicProductGrid';
import { requireSession } from '../../../lib/server-auth';
import { getD1 } from '../../../db';
import { productSelect } from '../../../lib/marketplace';

export const metadata:Metadata={title:'Bản vẽ đã lưu | Nhà Đẹp Chất',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function SavedPage(){const session=await requireSession('/tai-khoan/da-luu');const rows=await getD1().prepare(`${productSelect()} JOIN favorites fav ON fav.product_id=p.id WHERE fav.user_id=? AND p.status='approved' ORDER BY fav.created_at DESC LIMIT 100`).bind(session.user.id).all();return <><MarketplaceHeader/><main className="subpage"><div className="page-title"><p className="eyebrow">TÀI KHOẢN</p><h1>BẢN VẼ ĐÃ LƯU</h1><p>Những hồ sơ bạn đánh dấu để xem lại sau.</p></div><PublicProductGrid products={rows.results}/></main></>}
