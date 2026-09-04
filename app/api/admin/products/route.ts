import { getD1 } from '../../../../db';
import { apiAdmin } from '../../../../lib/server-auth';
import { productSelect } from '../../../../lib/marketplace';

export async function GET(request:Request){const current=await apiAdmin(request);if('error'in current)return current.error;const status=new URL(request.url).searchParams.get('status')||'pending';if(!['pending','approved','rejected'].includes(status))return Response.json({error:'Trạng thái không hợp lệ.'},{status:422});const rows=await getD1().prepare(`${productSelect().replace('FROM products p',", (SELECT GROUP_CONCAT(pf.original_name || ' (' || ROUND(pf.size/1048576.0,2) || ' MB)', ' · ') FROM product_files pf WHERE pf.product_id=p.id) file_summary FROM products p")} WHERE p.status=? ORDER BY COALESCE(p.submitted_at,p.updated_at) DESC LIMIT 100`).bind(status).all();return Response.json(rows.results);}
