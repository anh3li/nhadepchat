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
  const description=String(product.description||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  if(String(product.title).trim().length<12||!product.category||!product.building_type||!product.style||String(product.short_description||'').trim().length<80||String(product.short_description||'').length>200||description.length<50)return jsonError('Vui lòng hoàn thiện thông tin và mô tả hồ sơ trước khi gửi duyệt.',422);
  if(!product.formats||!product.disciplines||!product.tools)return jsonError('Cần chọn định dạng, hạng mục và công cụ sử dụng.',422);
  if(product.keywords<3||product.keywords>8)return jsonError('Cần nhập từ 3 đến 8 từ khóa.',422);
  if(!product.is_free&&product.price<1000)return jsonError('Sản phẩm trả phí cần có giá hợp lệ.',422);
  const[declared,uploaded]=await Promise.all([db.prepare('SELECT format FROM product_formats WHERE product_id=?').bind(id).all<{format:string}>(),db.prepare('SELECT DISTINCT UPPER(extension) format FROM product_files WHERE product_id=?').bind(id).all<{format:string}>()]);
  const uploadedFormats=new Set(uploaded.results.map(row=>row.format)),archive=uploadedFormats.has('ZIP')||uploadedFormats.has('RAR');
  if(!archive&&declared.results.some(row=>!uploadedFormats.has(row.format)))return jsonError('Định dạng đã khai báo chưa khớp với file đã upload.',422);
  const now=Date.now();await db.prepare("UPDATE products SET status='pending',submitted_at=?,rejection_reason=NULL,updated_at=? WHERE id=?").bind(now,now,id).run();return Response.json({ok:true});
}
