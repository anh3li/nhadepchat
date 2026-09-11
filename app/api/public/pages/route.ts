import { getD1 } from '../../../../db';
import { getHomeData } from '../../../../lib/home-data';
import { getCollectionsData } from '../../../../lib/collection-data';
import { getCommunityData } from '../../../../lib/community-data';
import { getProductPageData } from '../../../../lib/product-page-data';
import { getSellerPageData } from '../../../../lib/seller-page-data';

// Only published page data. No account/session, source object keys, or upload records.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const kind = params.get('kind');
  let data: unknown;
  switch (kind) {
    case 'revision': {
      // Counts plus timestamps detect publication, removal and profile/metric edits.
      // View/download events don't require rebuilding the public HTML every time.
      data = await getD1().prepare(`SELECT
        (SELECT COUNT(*) FROM products WHERE status='approved') products,
        (SELECT COALESCE(MAX(updated_at),0) FROM products) product_updated,
        (SELECT COUNT(*) FROM seller_profiles) sellers,
        (SELECT COALESCE(MAX(updated_at),0) FROM user_profiles) profile_updated,
        (SELECT COALESCE(MAX(updated_at),0) FROM seller_profiles) seller_updated,
        (SELECT COALESCE(MAX(updated_at),0) FROM metric_settings) metrics_updated,
        (SELECT COALESCE(MAX(updated_at),0) FROM product_metric_overrides) product_metrics_updated,
        (SELECT COALESCE(MAX(updated_at),0) FROM seller_metric_overrides) seller_metrics_updated`).first();
      break;
    }
    case 'home': data = await getHomeData(); break;
    case 'collections': data = await getCollectionsData(); break;
    case 'community': data = await getCommunityData(); break;
    case 'product': data = await getProductPageData(params.get('slug') || ''); break;
    case 'seller': data = await getSellerPageData(params.get('slug') || ''); break;
    case 'index': {
      const after = params.get('after') || '';
      const type = params.get('type') === 'sellers' ? 'sellers' : 'products';
      const query = type === 'products'
        ? "SELECT slug FROM products WHERE status='approved' AND slug>? ORDER BY slug LIMIT 100"
        : 'SELECT up.slug FROM user_profiles up JOIN seller_profiles sp ON sp.user_id=up.user_id WHERE up.slug>? ORDER BY up.slug LIMIT 100';
      data = (await getD1().prepare(query).bind(after).all<{slug:string}>()).results;
      break;
    }
    default: return Response.json({error:'Không tìm thấy.'},{status:404});
  }
  if (!data) return Response.json({error:'Không tìm thấy.'},{status:404});
  return Response.json(data, {headers:{'Cache-Control':'public, max-age=0, must-revalidate'}});
}
