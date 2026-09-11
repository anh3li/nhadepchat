/* eslint-disable @typescript-eslint/no-explicit-any */
import {cache} from 'react';
import {getD1} from '../db';
import {productSelect} from './marketplace';
export const getProduct = cache(async (slug:string) => getD1().prepare(`${productSelect()} WHERE p.slug=? AND p.status='approved' LIMIT 1`).bind(slug).first<Record<string,any>>());
export async function getProductPageData(slug:string){
  const p=await getProduct(slug);if(!p)return null;const db=getD1();
  const[assets,firstFile,disciplines,tools,keywords]=await Promise.all([
    db.prepare('SELECT id,object_key,thumbnail_key,type FROM product_assets WHERE product_id=? ORDER BY CASE WHEN type=\'cover\' THEN 0 ELSE 1 END,sort_order').bind(p.id).all<{id:string;object_key:string;thumbnail_key:string|null;type:string}>(),
    db.prepare('SELECT id FROM product_files WHERE product_id=? ORDER BY created_at LIMIT 1').bind(p.id).first<{id:string}>(),
    db.prepare('SELECT discipline FROM product_disciplines WHERE product_id=?').bind(p.id).all<{discipline:string}>(),
    db.prepare('SELECT tool FROM product_tools WHERE product_id=?').bind(p.id).all<{tool:string}>(),
    db.prepare('SELECT keyword FROM product_keywords WHERE product_id=?').bind(p.id).all<{keyword:string}>(),
  ]);
const related=await db.prepare(`${productSelect()} WHERE p.status='approved' AND p.category=? AND p.id<>? ORDER BY p.approved_at DESC LIMIT 4`).bind(p.category,p.id).all<Record<string,any>>();return {p,assets,firstFile,disciplines,tools,keywords,related};
}
