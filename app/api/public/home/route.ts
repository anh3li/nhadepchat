import { getD1 } from '../../../../db';
import { productSelect } from '../../../../lib/marketplace';

type CollectionRule={id:string;where:string;bindings:unknown[]};

const collectionRules:CollectionRule[]=[
  {id:'nha-pho-5m',where:'p.building_type=? AND p.width=5',bindings:['Nhà phố']},
  {id:'biet-thu-2-tang',where:'p.building_type LIKE ? AND p.floors=2',bindings:['%Biệt thự%']},
  {id:'nha-cap-4-dep',where:'(p.building_type LIKE ? OR p.title LIKE ?)',bindings:['%Nhà cấp 4%','%Nhà cấp 4%']},
  {id:'nha-xuong-tieu-chuan',where:'(p.building_type LIKE ? OR p.title LIKE ?)',bindings:['%Nhà xưởng%','%Nhà xưởng%']},
  {id:'file-ket-cau-hay',where:'(p.category LIKE ? OR p.title LIKE ?)',bindings:['%Kết cấu%','%Kết cấu%']},
];

export async function GET(){
  const db=getD1();
  const [products,architects,popular,platformStats,collectionRows]=await Promise.all([
    db.prepare(`${productSelect()} WHERE p.status='approved' ORDER BY p.approved_at DESC LIMIT 10`).all(),
    db.prepare(`SELECT up.user_id,up.slug,up.display_name,up.avatar_key,u.image account_image,sp.id,sp.professional_title,sp.verification_status,COUNT(DISTINCT p.id) file_count,COUNT(DISTINCT d.id) download_count,(SELECT ROUND(AVG(sr.rating),1) FROM seller_reviews sr WHERE sr.seller_id=sp.id) rating,(SELECT COUNT(*) FROM seller_reviews sr WHERE sr.seller_id=sp.id) review_count FROM seller_profiles sp JOIN user_profiles up ON up.user_id=sp.user_id LEFT JOIN user u ON u.id=up.user_id LEFT JOIN products p ON p.seller_id=sp.id AND p.status='approved' LEFT JOIN downloads d ON d.product_id=p.id GROUP BY sp.id ORDER BY rating DESC,file_count DESC,download_count DESC LIMIT 4`).all(),
    db.prepare(`${productSelect()} WHERE p.status='approved' ORDER BY download_count DESC,p.approved_at DESC LIMIT 5`).all(),
    db.prepare(`SELECT (SELECT COUNT(*) FROM products WHERE status='approved') product_count,(SELECT COUNT(*) FROM products WHERE status='approved' AND is_free=1) free_count,(SELECT COUNT(*) FROM seller_profiles) seller_count,(SELECT COUNT(*) FROM downloads) download_count`).first(),
    Promise.all(collectionRules.map(async rule=>{
      const coverWhere=rule.where.replaceAll('p.','px.');
      const [count,cover]=await Promise.all([
        db.prepare(`SELECT COUNT(*) count FROM products p WHERE p.status='approved' AND ${rule.where}`).bind(...rule.bindings).first<{count:number}>(),
        db.prepare(`SELECT pa.id cover_id FROM products px JOIN product_assets pa ON pa.product_id=px.id WHERE px.status='approved' AND ${coverWhere} ORDER BY px.approved_at DESC,CASE WHEN pa.type='cover' THEN 0 ELSE 1 END,pa.sort_order LIMIT 1`).bind(...rule.bindings).first<{cover_id:string}>(),
      ]);
      return{count:Number(count?.count||0),cover_id:cover?.cover_id||null};
    })),
  ]);
  const collections=Object.fromEntries(collectionRules.map((rule,index)=>[rule.id,{count:Number(collectionRows[index]?.count||0),cover_id:collectionRows[index]?.cover_id||null}]));
  return Response.json({products:products.results,architects:architects.results,popular:popular.results,collections,stats:platformStats||{}},{headers:{'Cache-Control':'public, max-age=60'}});
}
