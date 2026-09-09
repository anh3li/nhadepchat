'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ProductCard, type ProductCardData } from './ProductCard';

type SortMode = 'Mới nhất' | 'Tải nhiều' | 'Giá thấp' | 'Giá cao';

export function HomeDrawings({ products }: { products: ProductCardData[] }) {
  const [sort, setSort] = useState<SortMode>('Mới nhất');
  const sorted = useMemo(() => {
    const rows = [...products];
    if (sort === 'Tải nhiều') return rows.sort((a, b) => Number(b.download_count || 0) - Number(a.download_count || 0));
    if (sort === 'Giá thấp') return rows.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sort === 'Giá cao') return rows.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    return rows;
  }, [products, sort]);

  return <section className="drawings" id="drawings">
    <div className="section-heading home-classic-heading">
      <h2>BẢN VẼ MỚI</h2>
      <div>
        <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="Sắp xếp bản vẽ">
          <option>Mới nhất</option>
          <option>Tải nhiều</option>
          <option>Giá thấp</option>
          <option>Giá cao</option>
        </select>
        <Link href="/tim-kiem">Xem tất cả →</Link>
      </div>
    </div>
    {sorted.length
      ? <div className="product-grid">{sorted.slice(0, 5).map((product) => <ProductCard key={product.id} product={product}/>)}</div>
      : <div className="empty-state"><h2>Chưa có bản vẽ đã duyệt</h2><p>Sản phẩm mới sẽ xuất hiện tại đây sau khi được quản trị viên duyệt.</p></div>}
  </section>;
}
