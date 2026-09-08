import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Download, FileStack, Layers3 } from 'lucide-react';
import { MarketplaceHeader } from '../../components/MarketplaceHeader';
import { getD1 } from '../../db';
import { SafeImage } from '../../components/SafeImage';

export const metadata: Metadata = {
  title: 'Bộ sưu tập bản vẽ | Nhà Đẹp Chất',
  description: 'Khám phá các bộ hồ sơ xây dựng được tuyển chọn theo loại công trình, chuyên môn và định dạng.',
};
export const dynamic = 'force-dynamic';

const collections = [
  { id: 'nha-pho-5m', name: 'Nhà phố 5m', query: 'Nhà phố', description: 'Mặt bằng tối ưu cho lô đất đô thị ngang 5m.' },
  { id: 'biet-thu-2-tang', name: 'Biệt thự 2 tầng', query: 'Biệt thự', description: 'Hồ sơ kiến trúc và kết cấu biệt thự hai tầng.' },
  { id: 'nha-cap-4-dep', name: 'Nhà cấp 4 đẹp', query: 'Nhà cấp 4', description: 'Giải pháp một tầng thực dụng, dễ thi công.' },
  { id: 'nha-xuong-tieu-chuan', name: 'Nhà xưởng tiêu chuẩn', query: 'Nhà xưởng', description: 'Bản vẽ công nghiệp, kết cấu và biện pháp thi công.' },
  { id: 'file-ket-cau-hay', name: 'File kết cấu hay', query: 'Kết cấu', description: 'Thuyết minh, bản tính và bản vẽ kết cấu chọn lọc.' },
  { id: 'ho-so-mep', name: 'Hồ sơ MEP', query: 'MEP', description: 'Điện, nước và hệ thống kỹ thuật công trình.' },
  { id: 'noi-that', name: 'Thiết kế nội thất', query: 'Nội thất', description: 'Hồ sơ bố trí, chi tiết và mô hình nội thất.' },
  { id: 'mien-phi', name: 'Bản vẽ miễn phí', query: 'miễn phí', description: 'Tài nguyên có thể tải miễn phí từ cộng đồng.', free: true },
];

async function collectionData() {
  const db = getD1();
  return Promise.all(collections.map(async collection => {
    const like = `%${collection.query}%`;
    const row = await db.prepare(`SELECT COUNT(*) total,(SELECT pa.id FROM products px JOIN product_assets pa ON pa.product_id=px.id WHERE px.status='approved' AND ((?=1 AND px.is_free=1) OR (?=0 AND (px.title LIKE ? OR px.category LIKE ? OR px.building_type LIKE ?))) ORDER BY px.approved_at DESC,pa.sort_order LIMIT 1) cover_id FROM products p WHERE p.status='approved' AND ((?=1 AND p.is_free=1) OR (?=0 AND (p.title LIKE ? OR p.category LIKE ? OR p.building_type LIKE ?)))`)
      .bind(collection.free?1:0,collection.free?1:0,like,like,like,collection.free?1:0,collection.free?1:0,like,like,like).first<{total:number;cover_id:string|null}>();
    return {...collection,count:Number(row?.total||0),cover:row?.cover_id?`/api/assets/${row.cover_id}`:''};
  }));
}

export default async function CollectionsPage() {
  const items = await collectionData();
  const total = await getD1().prepare("SELECT COUNT(*) total FROM products WHERE status='approved'").first<{total:number}>();
  return <><MarketplaceHeader/><main className="subpage discovery-page">
    <section className="discovery-hero"><div><p className="eyebrow">THƯ VIỆN TUYỂN CHỌN</p><h1>Bộ sưu tập bản vẽ</h1><p>Tìm nhanh những nhóm hồ sơ phù hợp với loại công trình và chuyên môn bạn đang triển khai.</p></div><dl><div><dt>{Number(total?.total||0)}</dt><dd>Hồ sơ đã duyệt</dd></div><div><dt>{items.length}</dt><dd>Bộ sưu tập</dd></div></dl></section>
    <section className="collection-directory"><div className="directory-heading"><div><FileStack/><div><h2>Bộ sưu tập nổi bật</h2><p>Nội dung được cập nhật tự động từ các hồ sơ đã duyệt.</p></div></div></div><div className="collection-directory-grid">{items.map(item=><article className="directory-collection" id={item.id} key={item.id}><Link href={`/tim-kiem?q=${encodeURIComponent(item.query)}`}>{item.cover?<SafeImage src={item.cover} alt={item.name}/>:<span className="image-placeholder"/>}<span className="directory-collection-overlay"><b>{item.name}</b><small>{item.count} hồ sơ</small></span></Link><div><p>{item.description}</p><Link href={`/tim-kiem?q=${encodeURIComponent(item.query)}`}>Khám phá bộ sưu tập <ArrowRight/></Link></div></article>)}</div></section>
    <section className="discovery-callout"><Layers3/><div><h2>Chưa tìm thấy nhóm hồ sơ phù hợp?</h2><p>Dùng tìm kiếm chi tiết để lọc theo công trình, kích thước, định dạng hoặc chuyên môn.</p></div><Link className="button button-primary" href="/tim-kiem">Tìm tất cả bản vẽ <Download/></Link></section>
  </main></>;
}
