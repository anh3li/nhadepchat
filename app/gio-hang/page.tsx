import type { Metadata } from 'next';
import { CartPanel } from '../../components/CartPanel';

export const metadata:Metadata={title:'Giỏ hàng | Nhà Đẹp Chất',description:'Quản lý các hồ sơ bản vẽ bạn chuẩn bị mua.'};
export default function CartPage(){return <main className="subpage"><div className="page-title"><p className="eyebrow">GIAO DỊCH</p><h1>Giỏ hàng</h1><p>Kiểm tra các hồ sơ trước khi thanh toán.</p></div><CartPanel/></main>}
