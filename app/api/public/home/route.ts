import { getD1 } from '../../../../db';
import { productSelect } from '../../../../lib/marketplace';

export async function GET(){const db=getD1();const [products,architects,popular]=await Promise.all([
  db.prepare(`${productSelect()} WHERE p.status='approved' ORDER BY p.approved_at DESC LIMIT 10`).all(),
  db.prepare(`SELECT up.slug,up.display_name,up.avatar_key,sp.professional_title,sp.verification_status,COUNT(DISTINCT p.id) file_count,COUNT(d.id) download_count FROM seller_profiles sp JOIN user_profiles up ON up.user_id=sp.user_id LEFT JOIN products p ON p.seller_id=sp.id AND p.status='approved' LEFT JOIN downloads d ON d.product_id=p.id GROUP BY sp.id ORDER BY file_count DESC,download_count DESC LIMIT 4`).all(),
  db.prepare(`${productSelect()} WHERE p.status='approved' ORDER BY download_count DESC,p.approved_at DESC LIMIT 5`).all(),
]);return Response.json({products:products.results,architects:architects.results,popular:popular.results},{headers:{'Cache-Control':'public, max-age=60'}});}
