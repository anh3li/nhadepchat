/* eslint-disable @typescript-eslint/no-explicit-any */
import { getD1 } from '../db';
const roles = [{value:'',label:'Tất cả'},{value:'architect',label:'Kiến trúc sư'},{value:'engineer',label:'Kỹ sư'},{value:'interior_designer',label:'Thiết kế nội thất'},{value:'contractor',label:'Nhà thầu'}];

export async function getCommunityData(params:Record<string,string|undefined>={}){
  const requestedRole=params['vai-tro']||'',role=roles.some(item=>item.value===requestedRole)?requestedRole:'',sort=params['sap-xep']==='moi'?'moi':'noi-bat';
  const db=getD1(),where=role?'WHERE sp.seller_type=?':'',order=sort==='moi'?'sp.created_at DESC':'rating DESC,download_count DESC,file_count DESC,sp.created_at DESC';
  const statement=db.prepare(`SELECT sp.created_at,sp.id,sp.user_id,sp.seller_type,sp.professional_title,sp.company,sp.location,sp.experience_years,sp.verification_status,up.slug,up.display_name,up.avatar_key,up.bio,u.image account_image,(SELECT COUNT(*) FROM products p WHERE p.seller_id=sp.id AND p.status='approved') file_count,(SELECT COUNT(*) FROM downloads d JOIN products p ON p.id=d.product_id WHERE p.seller_id=sp.id) download_count,
    CASE WHEN COALESCE((SELECT seller_rating_use_real FROM metric_settings WHERE id=1),1)=1 THEN (SELECT ROUND(AVG(sr.rating),1) FROM seller_reviews sr WHERE sr.seller_id=sp.id) ELSE COALESCE((SELECT smo.rating FROM seller_metric_overrides smo WHERE smo.seller_id=sp.id),0) END rating,
    CASE WHEN COALESCE((SELECT seller_rating_use_real FROM metric_settings WHERE id=1),1)=1 THEN (SELECT COUNT(*) FROM seller_reviews sr WHERE sr.seller_id=sp.id) ELSE COALESCE((SELECT smo.review_count FROM seller_metric_overrides smo WHERE smo.seller_id=sp.id),0) END review_count
    FROM seller_profiles sp JOIN user_profiles up ON up.user_id=sp.user_id LEFT JOIN user u ON u.id=up.user_id ${where} ORDER BY ${order} LIMIT 60`);
  const [people,stats]=await Promise.all([role?statement.bind(role).all<Record<string,any>>():statement.all<Record<string,any>>(),db.prepare("SELECT (SELECT COUNT(*) FROM seller_profiles) members,(SELECT COUNT(*) FROM products WHERE status='approved') products,(SELECT COUNT(*) FROM downloads) downloads").first<Record<string,number>>()]);
return {people,stats,role,sort};
}
