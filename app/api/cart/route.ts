import { z } from 'zod';
import { getD1 } from '../../../db';
import { productSelect } from '../../../lib/marketplace';
import { apiSession } from '../../../lib/server-auth';

const schema=z.object({productId:z.string().trim().min(1).max(100)});

export async function GET(request:Request){
  const session=await apiSession(request);
  if(!session)return Response.json({authenticated:false,count:0,items:[]},{headers:{'Cache-Control':'private, no-store'}});
  const rows=await getD1().prepare(`${productSelect()} JOIN cart_items ci ON ci.product_id=p.id WHERE ci.user_id=? AND p.status='approved' ORDER BY ci.created_at DESC`).bind(session.user.id).all();
  return Response.json({authenticated:true,count:rows.results.length,items:rows.results},{headers:{'Cache-Control':'private, no-store'}});
}

export async function POST(request:Request){
  const session=await apiSession(request);
  if(!session)return Response.json({error:'Bạn cần đăng nhập để thêm sản phẩm vào giỏ.'},{status:401});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:'Sản phẩm không hợp lệ.'},{status:422});
  const db=getD1(),product=await db.prepare("SELECT id,is_free FROM products WHERE id=? AND status='approved'").bind(parsed.data.productId).first<{id:string;is_free:number}>();
  if(!product)return Response.json({error:'Không tìm thấy bản vẽ đã duyệt.'},{status:404});
  if(product.is_free)return Response.json({error:'Bản vẽ miễn phí có thể tải trực tiếp, không cần thêm vào giỏ.'},{status:409});
  await db.prepare('INSERT OR IGNORE INTO cart_items (id,user_id,product_id,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(),session.user.id,product.id,Date.now()).run();
  const count=await db.prepare('SELECT COUNT(*) total FROM cart_items WHERE user_id=?').bind(session.user.id).first<{total:number}>();
  return Response.json({added:true,count:Number(count?.total||0)});
}

export async function DELETE(request:Request){
  const session=await apiSession(request);
  if(!session)return Response.json({error:'Bạn cần đăng nhập.'},{status:401});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return Response.json({error:'Sản phẩm không hợp lệ.'},{status:422});
  await getD1().prepare('DELETE FROM cart_items WHERE user_id=? AND product_id=?').bind(session.user.id,parsed.data.productId).run();
  return Response.json({removed:true});
}
