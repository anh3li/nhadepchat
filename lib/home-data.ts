import { getD1 } from '../db';
import { productSelect } from './marketplace';
import { publicProductImages } from './media';

const collectionRules = [
  { id: 'nha-pho-5m', where: 'p.building_type=? AND p.width=5 AND p.title NOT LIKE ?', bindings: ['Nhà phố', '%Nhà cấp 4%'] },
  { id: 'biet-thu-2-tang', where: 'p.building_type LIKE ? AND p.floors=2', bindings: ['%Biệt thự%'] },
  { id: 'nha-cap-4-dep', where: '(p.building_type LIKE ? OR p.title LIKE ?)', bindings: ['%Nhà cấp 4%', '%Nhà cấp 4%'] },
  { id: 'nha-xuong-tieu-chuan', where: '(p.building_type LIKE ? OR p.title LIKE ?)', bindings: ['%Nhà xưởng%', '%Nhà xưởng%'] },
  { id: 'file-ket-cau-hay', where: '(p.category LIKE ? OR p.title LIKE ?)', bindings: ['%Kết cấu%', '%Kết cấu%'] },
] as const;

export async function getHomeData() {
  const db = getD1();
  const [products, architects, popular, platformStats, metricSettings, collectionRows] = await Promise.all([
    db.prepare(`${productSelect()} WHERE p.status='approved' ORDER BY p.approved_at DESC LIMIT 10`).all<Record<string, unknown>>(),
    db.prepare(`SELECT up.user_id,up.slug,up.display_name,up.avatar_key,u.image account_image,sp.id,sp.professional_title,sp.verification_status,COUNT(DISTINCT p.id) file_count,COUNT(DISTINCT d.id) download_count,
      CASE WHEN COALESCE((SELECT seller_rating_use_real FROM metric_settings WHERE id=1),1)=1
        THEN (SELECT ROUND(AVG(sr.rating),1) FROM seller_reviews sr WHERE sr.seller_id=sp.id)
        ELSE COALESCE((SELECT smo.rating FROM seller_metric_overrides smo WHERE smo.seller_id=sp.id),0)
      END rating,
      CASE WHEN COALESCE((SELECT seller_rating_use_real FROM metric_settings WHERE id=1),1)=1
        THEN (SELECT COUNT(*) FROM seller_reviews sr WHERE sr.seller_id=sp.id)
        ELSE COALESCE((SELECT smo.review_count FROM seller_metric_overrides smo WHERE smo.seller_id=sp.id),0)
      END review_count
      FROM seller_profiles sp JOIN user_profiles up ON up.user_id=sp.user_id LEFT JOIN user u ON u.id=up.user_id
      LEFT JOIN products p ON p.seller_id=sp.id AND p.status='approved' LEFT JOIN downloads d ON d.product_id=p.id
      GROUP BY sp.id ORDER BY rating DESC,file_count DESC,download_count DESC LIMIT 4`).all<Record<string, unknown>>(),
    db.prepare(`${productSelect()} WHERE p.status='approved' ORDER BY download_count DESC,p.approved_at DESC LIMIT 5`).all<Record<string, unknown>>(),
    db.prepare(`SELECT (SELECT COUNT(*) FROM products WHERE status='approved') product_count,(SELECT COUNT(*) FROM products WHERE status='approved' AND is_free=1) free_count,(SELECT COUNT(*) FROM seller_profiles) seller_count,(SELECT COUNT(*) FROM downloads) download_count`).first<Record<string, number>>(),
    db.prepare('SELECT home_use_real,home_product_count,home_free_count,home_seller_count,home_download_count FROM metric_settings WHERE id=1').first<Record<string, number>>(),
    Promise.all(collectionRules.map(async (rule) => {
      const coverWhere = rule.where.replaceAll('p.', 'px.');
      const [count, cover] = await Promise.all([
        db.prepare(`SELECT COUNT(*) count FROM products p WHERE p.status='approved' AND ${rule.where}`).bind(...rule.bindings).first<{ count: number }>(),
        db.prepare(`SELECT pa.id cover_id FROM products px JOIN product_assets pa ON pa.product_id=px.id WHERE px.status='approved' AND ${coverWhere} ORDER BY px.approved_at DESC,CASE WHEN pa.type='cover' THEN 0 ELSE 1 END,pa.sort_order LIMIT 1`).bind(...rule.bindings).first<{ cover_id: string }>(),
      ]);
      return { count: Number(count?.count || 0), cover_id: cover?.cover_id || null };
    })),
  ]);

  const realStats = platformStats || { product_count: 0, free_count: 0, seller_count: 0, download_count: 0 };
  const stats = metricSettings && !Number(metricSettings.home_use_real) ? {
    product_count: Number(metricSettings.home_product_count || 0),
    free_count: Number(metricSettings.home_free_count || 0),
    seller_count: Number(metricSettings.home_seller_count || 0),
    download_count: Number(metricSettings.home_download_count || 0),
  } : realStats;

  return {
    products: products.results.map(publicProductImages),
    architects: architects.results,
    popular: popular.results.map(publicProductImages),
    collections: Object.fromEntries(collectionRules.map((rule, index) => [rule.id, collectionRows[index]])),
    stats,
  };
}
