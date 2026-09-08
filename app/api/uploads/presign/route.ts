import { env } from 'cloudflare:workers';
import { AwsClient } from 'aws4fetch';
import { getD1 } from '../../../../db';
import { apiSeller } from '../../../../lib/server-auth';
import { isAllowedMime, jsonError, safeFilename } from '../../../../lib/marketplace';

export async function POST(request: Request){
  const current=await apiSeller(request);if('error'in current)return current.error;
  const body=await request.json() as Record<string,unknown>,productId=String(body.productId||''),kind=String(body.kind||''),name=safeFilename(String(body.name||'')),mime=String(body.mime||'application/octet-stream'),size=Number(body.size||0),ext=(name.split('.').pop()||'').toLowerCase();
  const allowed=kind==='preview'?['webp']:['dwg','skp','rvt','pdf','xlsx','docx','zip','rar'],max=kind==='preview'?4*1024*1024:250*1024*1024;
  if(!allowed.includes(ext)||size<=0||size>max||!isAllowedMime(ext,mime,kind==='preview'))return jsonError('Metadata upload không hợp lệ.',422);
  const owned=await getD1().prepare("SELECT id FROM products WHERE id=? AND seller_id=? AND status IN ('draft','rejected')").bind(productId,current.seller.id).first();if(!owned)return jsonError('Không có quyền upload cho sản phẩm này.',403);
  if(kind==='preview'){const count=await getD1().prepare('SELECT COUNT(*) count FROM product_assets WHERE product_id=?').bind(productId).first<{count:number}>();if((count?.count||0)>=30)return jsonError('Mỗi sản phẩm tối đa 30 ảnh preview.',422);}
  if(!env.R2_ACCOUNT_ID||!env.R2_BUCKET_NAME||!env.R2_ACCESS_KEY_ID||!env.R2_SECRET_ACCESS_KEY)return Response.json({direct:false,uploadUrl:'/api/uploads'});
  const id=crypto.randomUUID(),objectKey=`products/${productId}/${kind==='preview'?'preview':'files'}/${id}.${ext}`;
  const aws=new AwsClient({accessKeyId:env.R2_ACCESS_KEY_ID,secretAccessKey:env.R2_SECRET_ACCESS_KEY,service:'s3',region:'auto'});
  const target=`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${objectKey}?X-Amz-Expires=300`;
  const signed=await aws.sign(target,{method:'PUT',headers:{'Content-Type':mime},aws:{signQuery:true}});
  return Response.json({direct:true,id,objectKey,uploadUrl:signed.url,expiresIn:300,headers:{'Content-Type':mime},originalName:name,size,mime,kind});
}
