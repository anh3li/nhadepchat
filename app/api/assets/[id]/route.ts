import { getD1, getFilesBucket } from '../../../../db';
import { apiSession } from '../../../../lib/server-auth';

function imageType(key:string){const ext=key.split('.').pop()?.toLowerCase();return ext==='webp'?'image/webp':ext==='png'?'image/png':'image/jpeg'}

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){const{id}=await params,db=getD1();const asset=await db.prepare(`SELECT pa.object_key,p.status,sp.user_id FROM product_assets pa JOIN products p ON p.id=pa.product_id JOIN seller_profiles sp ON sp.id=p.seller_id WHERE pa.id=?`).bind(id).first<{object_key:string,status:string,user_id:string}>();if(!asset)return new Response('Không tìm thấy ảnh',{status:404});
  if(asset.status!=='approved'){const session=await apiSession(request);if(!session||session.user.id!==asset.user_id){const role=session?await db.prepare('SELECT role FROM user_profiles WHERE user_id=?').bind(session.user.id).first<{role:string}>():null;if(role?.role!=='admin')return new Response('Không có quyền',{status:403});}}
  const object=await getFilesBucket().get(asset.object_key);if(!object)return new Response('Không tìm thấy ảnh',{status:404});const headers=new Headers();object.writeHttpMetadata(headers);if(!headers.has('Content-Type'))headers.set('Content-Type',imageType(asset.object_key));headers.set('Content-Disposition','inline');headers.set('X-Content-Type-Options','nosniff');headers.set('Cache-Control',asset.status==='approved'?'public, max-age=31536000, immutable':'private, no-store');headers.set('ETag',object.httpEtag);return new Response(object.body,{headers});}
