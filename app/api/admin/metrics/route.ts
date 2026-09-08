import { z } from 'zod';
import { getD1 } from '../../../../db';
import { apiAdmin } from '../../../../lib/server-auth';

const count = z.coerce.number().int().min(0).max(2_000_000_000);
const rating = z.coerce.number().min(0).max(5);
const settingsSchema = z.object({
  homeUseReal: z.boolean(),
  home: z.object({
    productCount: count,
    freeCount: count,
    sellerCount: count,
    downloadCount: count,
  }),
  productUseReal: z.boolean(),
  ratingUseReal: z.boolean(),
  sellerRatingUseReal: z.boolean(),
  products: z.array(z.object({
    id: z.string().min(1).max(100),
    viewCount: count,
    downloadCount: count,
    rating,
    reviewCount: count,
  })).max(500),
  sellers: z.array(z.object({
    id: z.string().min(1).max(100),
    rating,
    reviewCount: count,
  })).max(500),
});

const defaults = {
  home_use_real: 1,
  home_product_count: 0,
  home_free_count: 0,
  home_seller_count: 0,
  home_download_count: 0,
  product_use_real: 1,
  rating_use_real: 1,
  seller_rating_use_real: 1,
};

export async function GET(request: Request) {
  const current = await apiAdmin(request);
  if ('error' in current) return current.error;
  const db = getD1();
  const [saved, products, sellers] = await Promise.all([
    db.prepare('SELECT * FROM metric_settings WHERE id=1').first<Record<string, number>>(),
    db.prepare(`SELECT p.id,p.title,p.slug,p.status,
      (SELECT COUNT(*) FROM product_views pv WHERE pv.product_id=p.id) real_view_count,
      (SELECT COUNT(*) FROM downloads d WHERE d.product_id=p.id) real_download_count,
      (SELECT ROUND(AVG(pr.rating),1) FROM product_reviews pr WHERE pr.product_id=p.id) real_rating,
      (SELECT COUNT(*) FROM product_reviews pr WHERE pr.product_id=p.id) real_review_count,
      COALESCE(pmo.view_count,0) manual_view_count,
      COALESCE(pmo.download_count,0) manual_download_count,
      COALESCE(pmo.rating,0) manual_rating,
      COALESCE(pmo.review_count,0) manual_review_count
      FROM products p LEFT JOIN product_metric_overrides pmo ON pmo.product_id=p.id
      WHERE p.status='approved' ORDER BY p.approved_at DESC,p.updated_at DESC LIMIT 500`).all(),
    db.prepare(`SELECT sp.id,up.display_name,up.slug,sp.professional_title,
      (SELECT ROUND(AVG(sr.rating),1) FROM seller_reviews sr WHERE sr.seller_id=sp.id) real_rating,
      (SELECT COUNT(*) FROM seller_reviews sr WHERE sr.seller_id=sp.id) real_review_count,
      COALESCE(smo.rating,0) manual_rating,
      COALESCE(smo.review_count,0) manual_review_count
      FROM seller_profiles sp
      JOIN user_profiles up ON up.user_id=sp.user_id
      LEFT JOIN seller_metric_overrides smo ON smo.seller_id=sp.id
      ORDER BY up.display_name LIMIT 500`).all(),
  ]);
  return Response.json({ settings: { ...defaults, ...saved }, products: products.results, sellers: sellers.results });
}

export async function PUT(request: Request) {
  const current = await apiAdmin(request);
  if ('error' in current) return current.error;
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Dữ liệu cài đặt không hợp lệ.' }, { status: 422 });

  const { homeUseReal, home, productUseReal, ratingUseReal, sellerRatingUseReal, products, sellers } = parsed.data;
  const db = getD1();
  const now = Date.now();
  const statements = [
    db.prepare(`INSERT INTO metric_settings
      (id,home_use_real,home_product_count,home_free_count,home_seller_count,home_download_count,product_use_real,rating_use_real,seller_rating_use_real,updated_at)
      VALUES (1,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET home_use_real=excluded.home_use_real,home_product_count=excluded.home_product_count,
      home_free_count=excluded.home_free_count,home_seller_count=excluded.home_seller_count,
      home_download_count=excluded.home_download_count,product_use_real=excluded.product_use_real,
      rating_use_real=excluded.rating_use_real,seller_rating_use_real=excluded.seller_rating_use_real,updated_at=excluded.updated_at`)
      .bind(homeUseReal ? 1 : 0, home.productCount, home.freeCount, home.sellerCount, home.downloadCount, productUseReal ? 1 : 0, ratingUseReal ? 1 : 0, sellerRatingUseReal ? 1 : 0, now),
    ...products.map((product) => db.prepare(`INSERT INTO product_metric_overrides (product_id,view_count,download_count,rating,review_count,updated_at)
      VALUES (?,?,?,?,?,?) ON CONFLICT(product_id) DO UPDATE SET view_count=excluded.view_count,
      download_count=excluded.download_count,rating=excluded.rating,review_count=excluded.review_count,updated_at=excluded.updated_at`)
      .bind(product.id, product.viewCount, product.downloadCount, product.rating, product.reviewCount, now)),
    ...sellers.map((seller) => db.prepare(`INSERT INTO seller_metric_overrides (seller_id,rating,review_count,updated_at)
      VALUES (?,?,?,?) ON CONFLICT(seller_id) DO UPDATE SET rating=excluded.rating,
      review_count=excluded.review_count,updated_at=excluded.updated_at`)
      .bind(seller.id, seller.rating, seller.reviewCount, now)),
  ];
  await db.batch(statements);
  return Response.json({ ok: true });
}
