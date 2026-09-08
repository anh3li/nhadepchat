import { z } from 'zod';
import { getD1, getFilesBucket } from '../../../../db';
import { apiSeller } from '../../../../lib/server-auth';
import { isAllowedMime, jsonError, safeFilename } from '../../../../lib/marketplace';

const schema=z.object({id:z.string().uuid(),productId:z.string().uuid(),objectKey:z.string(),kind:z.enum(['preview','file']),originalName:z.string(),extension:z.string(),mime:z.string(),size:z.number().int().positive()});
export async function POST(request:Request){const current=await apiSeller(request);if('error'in current)return current.error;const parsed=schema.safeParse(await request.json());if(!parsed.success)return jsonError('Metadata file không hợp lệ.',422);const d=parsed.data;
  const allowed=d.kind==='preview'?['webp']:['dwg','skp','rvt','pdf','xlsx','docx','zip','rar'];const max=d.kind==='preview'?4*1024*1024:250*1024*1024;
  if(!allowed.includes(d.extension)||d.size>max||!isAllowedMime(d.extension,d.mime,d.kind==='preview'))return jsonError('Loại file hoặc kích thước không hợp lệ.',422);
  if(!d.objectKey.startsWith(`products/${d.productId}/${d.kind==='preview'?'preview':'files'}/`))return jsonError('Object key không hợp lệ.',403);
  const owned=await getD1().prepare("SELECT id FROM products WHERE id=? AND seller_id=? AND status IN ('draft','rejected')").bind(d.productId,current.seller.id).first();if(!owned)return jsonError('Không có quyền hoàn tất upload.',403);
  const object=await getFilesBucket().head(d.objectKey);if(!object)return jsonError('File chưa tồn tại trên R2.',409);if(object.size!==d.size)return jsonError('Kích thước file trên R2 không khớp.',409);const db=getD1(),now=Date.now();
  if(d.kind==='preview'){const count=await db.prepare('SELECT COUNT(*) count FROM product_assets WHERE product_id=?').bind(d.productId).first<{count:number}>();if((count?.count||0)>=30){await getFilesBucket().delete(d.objectKey);return jsonError('Mỗi sản phẩm tối đa 30 ảnh preview.',422)}await db.prepare('INSERT INTO product_assets (id,product_id,object_key,type,sort_order,created_at) VALUES (?,?,?,?,?,?)').bind(d.id,d.productId,d.objectKey,count?.count?'preview':'cover',count?.count||0,now).run();}
  else await db.batch([db.prepare('INSERT INTO product_files (id,product_id,object_key,original_name,extension,mime_type,size,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(d.id,d.productId,d.objectKey,safeFilename(d.originalName),d.extension,d.mime,d.size,now),db.prepare('INSERT OR IGNORE INTO product_formats (product_id,format) VALUES (?,?)').bind(d.productId,d.extension.toUpperCase())]);return Response.json({ok:true});}
