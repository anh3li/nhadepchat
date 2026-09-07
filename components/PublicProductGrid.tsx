/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductCard } from './ProductCard';

export type PublicProduct = Record<string, any>;
export function PublicProductGrid({ products }: { products: PublicProduct[] }) {
  if (!products.length) return <div className="empty-state"><h2>Chưa có hồ sơ phù hợp</h2><p>Các hồ sơ đã duyệt sẽ xuất hiện tại đây.</p></div>;
  return <div className="product-grid">{products.map((product)=><ProductCard product={product} key={product.id}/>)}</div>;
}
