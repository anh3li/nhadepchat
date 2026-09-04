import { getD1, getFilesBucket } from '../../../db';
import { apiSeller } from '../../../lib/server-auth';
import { isAllowedMime, jsonError, safeFilename } from '../../../lib/marketplace';

const previewExtensions = new Set(['jpg','jpeg','png','webp']);
const fileExtensions = new Set(['dwg','skp','rvt','pdf','xlsx','docx','zip','rar']);

export async function POST(request: Request) {
  const current=await apiSeller(request); if ('error' in current) return current.error;
  const form=await request.formData(), file=form.get('file'), productId=String(form.get('productId')||''), kind=String(form.get('kind')||'');
  if(!(file instanceof File))return jsonError('Chưa chọn file.',422);
  const owned=await getD1().prepare("SELECT id FROM products WHERE id=? AND seller_id=? AND status IN ('draft','rejected')").bind(productId,current.seller.id).first();
  if(!owned)return jsonError('Sản phẩm không thuộc quyền chỉnh sửa của bạn.',403);
  const ext=(file.name.split('.').pop()||'').toLowerCase(), isPreview=kind==='preview', allowed=isPreview?previewExtensions:fileExtensions, max=isPreview?10*1024*1024:250*1024*1024;
  if(isPreview){const count=await getD1().prepare('SELECT COUNT(*) count FROM product_assets WHERE product_id=?').bind(productId).first<{count:number}>();if((count?.count||0)>=30)return jsonError('Mỗi sản phẩm tối đa 30 ảnh preview.',422);}
  if(!allowed.has(ext))return jsonError('Định dạng file không được phép.',422); if(file.size>max)return jsonError(`File vượt quá giới hạn ${isPreview?'10MB':'250MB'}.`,422);
  if(!isAllowedMime(ext,file.type||'application/octet-stream',isPreview))return jsonError('MIME file không khớp với định dạng đã chọn.',422);
  const id=crypto.randomUUID(), objectKey=`products/${productId}/${isPreview?'preview':'files'}/${id}.${ext}`;
  await getFilesBucket().put(objectKey,file.stream(),{httpMetadata:{contentType:file.type||'application/octet-stream'},customMetadata:{ownerId:current.session.user.id,productId,originalName:safeFilename(file.name)}});
  const db=getD1(),now=Date.now();
  if(isPreview){const count=await db.prepare('SELECT COUNT(*) count FROM product_assets WHERE product_id=?').bind(productId).first<{count:number}>();await db.prepare('INSERT INTO product_assets (id,product_id,object_key,type,sort_order,created_at) VALUES (?,?,?,?,?,?)').bind(id,productId,objectKey,count?.count?'preview':'cover',count?.count||0,now).run();}
  else await db.batch([db.prepare('INSERT INTO product_files (id,product_id,object_key,original_name,extension,mime_type,size,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,productId,objectKey,safeFilename(file.name),ext,file.type||'application/octet-stream',file.size,now),db.prepare('INSERT OR IGNORE INTO product_formats (product_id,format) VALUES (?,?)').bind(productId,ext.toUpperCase())]);
  return Response.json({ok:true,id,name:safeFilename(file.name),size:file.size,url:isPreview?`/api/assets/${id}`:null});
}
