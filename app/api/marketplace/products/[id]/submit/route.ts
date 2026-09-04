/* eslint-disable @typescript-eslint/no-explicit-any */
import { getD1 } from '../../../../../../db';
import { jsonError } from '../../../../../../lib/marketplace';
import { apiSeller } from '../../../../../../lib/server-auth';

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const current=await apiSeller(request);if('error'in current)return current.error;const{id}=await params,db=getD1();
  const product=await db.prepare(`SELECT id,status,title,category,building_type,style,short_description,description,price,is_free,
    (SELECT COUNT(*) FROM product_assets WHERE product_id=products.id) assets,
    (SELECT COUNT(*) FROM product_files WHERE product_id=products.id) files,
    (SELECT COUNT(*) FROM product_formats WHERE product_id=products.id) formats,
    (SELECT COUNT(*) FROM product_disciplines WHERE product_id=products.id) disciplines,
    (SELECT COUNT(*) FROM product_tools WHERE product_id=products.id) tools,
    (SELECT COUNT(*) FROM product_keywords WHERE product_id=products.id) keywords
    FROM products WHERE id=? AND seller_id=?`).bind(id,current.seller.id).first<Record<string,any>>();
  if(!product)return jsonError('Không tìm thấy sản phẩm.',404);
  if(!['draft','rejected'].includes(product.status))return jsonError('Sản phẩm không thể gửi duyệt ở trạng thái hiện tại.',409);
  if(!product.assets||!product.files)return jsonError('Cần ít nhất một ảnh preview và một file hồ sơ trước khi gửi duyệt.',422);
  if(!String(product.title).trim())return jsonError('Vui lòng nhập tên hồ sơ.',422);
  if(!product.category||!product.building_type)return jsonError('Vui lòng chọn loại công trình.',422);
  if(String(product.short_description||'').length>300)return jsonError('Mô tả ngắn tối đa 300 ký tự.',422);
  if(!product.is_free&&product.price<=0)return jsonError('Sản phẩm trả phí cần có giá lớn hơn 0đ.',422);
  const[declared,uploaded]=await Promise.all([db.prepare('SELECT format FROM product_formats WHERE product_id=?').bind(id).all<{format:string}>(),db.prepare('SELECT DISTINCT UPPER(extension) format FROM product_files WHERE product_id=?').bind(id).all<{format:string}>()]);
  const uploadedFormats=new Set(uploaded.results.map(row=>row.format)),archive=uploadedFormats.has('ZIP')||uploadedFormats.has('RAR');
  if(!archive&&declared.results.some(row=>!uploadedFormats.has(row.format)))return jsonError('Định dạng đã khai báo chưa khớp với file đã upload.',422);
  const now=Date.now();await db.prepare("UPDATE products SET status='pending',submitted_at=?,rejection_reason=NULL,updated_at=? WHERE id=?").bind(now,now,id).run();return Response.json({ok:true});
}
