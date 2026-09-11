import { getD1 } from '../db';
const collections = [
  { id: 'nha-pho-5m', name: 'Nhà phố 5m', query: 'Nhà phố', where: 'p.building_type=? AND p.width=5 AND p.title NOT LIKE ?', bindings: ['Nhà phố','%Nhà cấp 4%'], description: 'Mặt bằng tối ưu cho lô đất đô thị ngang 5m.' },
  { id: 'biet-thu-2-tang', name: 'Biệt thự 2 tầng', query: 'Biệt thự', where: 'p.building_type LIKE ? AND p.floors=2', bindings: ['%Biệt thự%'], description: 'Hồ sơ kiến trúc và kết cấu biệt thự hai tầng.' },
  { id: 'nha-cap-4-dep', name: 'Nhà cấp 4 đẹp', query: 'Nhà cấp 4', where: '(p.building_type LIKE ? OR p.title LIKE ?)', bindings: ['%Nhà cấp 4%','%Nhà cấp 4%'], description: 'Giải pháp một tầng thực dụng, dễ thi công.' },
  { id: 'nha-xuong-tieu-chuan', name: 'Nhà xưởng tiêu chuẩn', query: 'Nhà xưởng', where: '(p.building_type LIKE ? OR p.title LIKE ?)', bindings: ['%Nhà xưởng%','%Nhà xưởng%'], description: 'Bản vẽ công nghiệp, kết cấu và biện pháp thi công.' },
  { id: 'file-ket-cau-hay', name: 'File kết cấu hay', query: 'Kết cấu', where: '(p.category LIKE ? OR p.title LIKE ?)', bindings: ['%Kết cấu%','%Kết cấu%'], description: 'Thuyết minh, bản tính và bản vẽ kết cấu chọn lọc.' },
  { id: 'ho-so-mep', name: 'Hồ sơ MEP', query: 'MEP', where: '(p.category LIKE ? OR p.title LIKE ?)', bindings: ['%MEP%','%MEP%'], description: 'Điện, nước và hệ thống kỹ thuật công trình.' },
  { id: 'noi-that', name: 'Thiết kế nội thất', query: 'Nội thất', where: '(p.category LIKE ? OR p.title LIKE ?)', bindings: ['%Nội thất%','%Nội thất%'], description: 'Hồ sơ bố trí, chi tiết và mô hình nội thất.' },
  { id: 'mien-phi', name: 'Bản vẽ miễn phí', query: 'miễn phí', where: 'p.is_free=1', bindings: [], description: 'Tài nguyên có thể tải miễn phí từ cộng đồng.' },
];

async function collectionData() {
  const db = getD1();
  return Promise.all(collections.map(async collection => {
    const coverWhere=collection.where.replaceAll('p.','px.');
    const [count,cover]=await Promise.all([
      db.prepare(`SELECT COUNT(*) total FROM products p WHERE p.status='approved' AND ${collection.where}`).bind(...collection.bindings).first<{total:number}>(),
      db.prepare(`SELECT pa.id cover_id FROM products px JOIN product_assets pa ON pa.product_id=px.id WHERE px.status='approved' AND ${coverWhere} ORDER BY px.approved_at DESC,CASE WHEN pa.type='cover' THEN 0 ELSE 1 END,pa.sort_order LIMIT 1`).bind(...collection.bindings).first<{cover_id:string}>(),
    ]);
    return {...collection,count:Number(count?.total||0),cover:cover?.cover_id?`/api/assets/${cover.cover_id}`:''};
  }));
}


export async function getCollectionsData(){const items=await collectionData();const total=await getD1().prepare("SELECT COUNT(*) total FROM products WHERE status='approved'").first<{total:number}>();return {activeItems:items.filter(item=>item.count>0),total};}
