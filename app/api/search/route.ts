import { getD1 } from '../../../db';
import { productSelect } from '../../../lib/marketplace';

export async function GET(request:Request){const q=(new URL(request.url).searchParams.get('q')||'').trim().slice(0,100);if(!q)return Response.json([]);const like=`%${q.replace(/[%_]/g,'\\$&')}%`;const rows=await getD1().prepare(`${productSelect()} WHERE p.status='approved' AND (p.title LIKE ? ESCAPE '\\' OR p.category LIKE ? ESCAPE '\\' OR p.building_type LIKE ? ESCAPE '\\' OR EXISTS(SELECT 1 FROM product_formats pf2 WHERE pf2.product_id=p.id AND pf2.format LIKE ? ESCAPE '\\')) ORDER BY p.approved_at DESC LIMIT 40`).bind(like,like,like,like).all();return Response.json(rows.results);}
