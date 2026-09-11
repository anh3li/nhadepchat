/* eslint-disable @typescript-eslint/no-explicit-any */
import { getD1 } from '../../../../../db';
import { productSelect } from '../../../../../lib/marketplace';
import { largePreviewImageUrl, previewImageUrl } from '../../../../../lib/media';

export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){
  const{slug}=await params,db=getD1();const product=await db.prepare(`${productSelect()} WHERE p.slug=? AND p.status='approved' LIMIT 1`).bind(slug).first<Record<string,unknown>>();
  if(!product)return Response.json({error:'Không tìm thấy hồ sơ.'},{status:404});
  const[assets,formats,disciplines,tools,keywords]=await Promise.all([
    db.prepare('SELECT id,object_key,thumbnail_key,type,sort_order FROM product_assets WHERE product_id=? ORDER BY sort_order').bind(product.id).all<Record<string, unknown>>(),
    db.prepare('SELECT format FROM product_formats WHERE product_id=?').bind(product.id).all(),
    db.prepare('SELECT discipline FROM product_disciplines WHERE product_id=?').bind(product.id).all(),
    db.prepare('SELECT tool FROM product_tools WHERE product_id=?').bind(product.id).all(),
    db.prepare('SELECT keyword FROM product_keywords WHERE product_id=?').bind(product.id).all(),
  ]);
  // Source-file records remain private; only authorized download endpoints know them.
  return Response.json({...product,thumbnailUrl:previewImageUrl(String(product.cover_id || ''),String(product.cover_key || ''),String(product.thumbnail_key || '')),previewUrl:largePreviewImageUrl(String(product.cover_id || ''),String(product.cover_key || '')),assets:assets.results.map((asset:any)=>({...asset,thumbnailUrl:previewImageUrl(asset.id,asset.object_key,asset.thumbnail_key),previewUrl:largePreviewImageUrl(asset.id,asset.object_key)})),formats:formats.results.map((x:any)=>x.format),disciplines:disciplines.results.map((x:any)=>x.discipline),tools:tools.results.map((x:any)=>x.tool),keywords:keywords.results.map((x:any)=>x.keyword)});
}
