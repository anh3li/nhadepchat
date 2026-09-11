import { getD1 } from '../db';

export const sellerTypes = ['architect','engineer','interior_designer','contractor','student','other'] as const;
export const buildingTypes = ['Nhà phố','Nhà cấp 4','Biệt thự','Nhà vườn','Nhà xưởng','Văn phòng','Trường học','Chung cư','Quy hoạch','Nội thất','Công trình khác'] as const;
export const productStyles = ['Hiện đại','Tân cổ điển','Cổ điển','Mái Nhật','Mái Thái','Tối giản','Công nghiệp','Khác'] as const;
export const allowedFormats = ['DWG','SKP','RVT','PDF','XLSX','DOCX','ZIP','RAR'] as const;
export const allowedDisciplines = ['Kiến trúc','Kết cấu','Điện','Cấp thoát nước','MEP','PCCC','Nội thất','Phối cảnh','Dự toán','Thuyết minh','Tài liệu','Khác'] as const;
export const allowedTools = ['AutoCAD','SketchUp','Revit','3ds Max','Excel','ETABS','SAFE','SAP2000','Khác'] as const;

export function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'ho-so';
}

export function safeFilename(value: string) {
  const ext = value.includes('.') ? `.${value.split('.').pop()!.toLowerCase()}` : '';
  const stem = slugify(value.replace(/\.[^.]+$/, '')).slice(0, 70) || 'tep';
  return `${stem}${ext}`;
}

const previewMimes: Record<string, string[]> = {
  jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], webp: ['image/webp'],
};
const fileMimes: Record<string, string[]> = {
  dwg: ['application/acad', 'application/x-acad', 'application/dwg', 'image/vnd.dwg'],
  skp: ['application/vnd.sketchup.skp'],
  rvt: ['application/octet-stream'],
  pdf: ['application/pdf'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  zip: ['application/zip', 'application/x-zip-compressed'],
  rar: ['application/vnd.rar', 'application/x-rar-compressed'],
};

export function isAllowedMime(extension: string, mime: string, preview: boolean) {
  const normalized = mime.toLowerCase().split(';')[0].trim();
  if (preview) return (previewMimes[extension] || []).includes(normalized);
  return normalized === 'application/octet-stream' || (fileMimes[extension] || []).includes(normalized);
}

export async function uniqueSlug(title: string, table: 'products'|'user_profiles', excludeId?: string) {
  const db = getD1();
  const base = slugify(title);
  for (let i = 0; i < 50; i++) {
    const candidate = i ? `${base}-${i + 1}` : base;
    const query = excludeId ? `SELECT id FROM ${table} WHERE slug=? AND id<>?` : `SELECT id FROM ${table} WHERE slug=?`;
    const row = await db.prepare(query).bind(...(excludeId ? [candidate, excludeId] : [candidate])).first();
    if (!row) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function parseList(value: unknown, allowed: readonly string[]) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && allowed.includes(item)))];
}

export function sanitizeDescription(value: string) {
  return value
    .replace(/<\/?(?:script|style|iframe|object|embed|form|input|button|svg|math)[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(?:javascript|data):/gi, '')
    .replace(/<(?!\/?(?:p|br|h2|h3|strong|b|em|i|ul|ol|li|a)(?:\s|>|\/))[^>]+>/gi, '')
    .replace(/<a\s+([^>]*?)href=("|')([^"']+)\2([^>]*)>/gi, (_all, before, quote, href, after) => `<a ${before}href=${quote}${href}${quote}${after} rel="nofollow noopener">`)
    .trim();
}

export function parseKeywords(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => typeof item === 'string' ? item.trim().toLowerCase().slice(0, 60) : '').filter((item) => item.length >= 2))].slice(0, 8);
}

export function productSelect() {
  return `SELECT p.*, up.slug seller_slug, up.display_name seller_name, up.avatar_key seller_avatar, u.image seller_account_image,
    sp.professional_title, sp.verification_status,
    (SELECT object_key FROM product_assets pa WHERE pa.product_id=p.id ORDER BY CASE WHEN pa.type='cover' THEN 0 ELSE 1 END, pa.sort_order LIMIT 1) cover_key,
    (SELECT thumbnail_key FROM product_assets pa WHERE pa.product_id=p.id ORDER BY CASE WHEN pa.type='cover' THEN 0 ELSE 1 END, pa.sort_order LIMIT 1) thumbnail_key,
    (SELECT id FROM product_assets pa WHERE pa.product_id=p.id ORDER BY CASE WHEN pa.type='cover' THEN 0 ELSE 1 END, pa.sort_order LIMIT 1) cover_id,
    (SELECT GROUP_CONCAT(format, ' · ') FROM product_formats pf WHERE pf.product_id=p.id) formats,
    CASE WHEN COALESCE((SELECT product_use_real FROM metric_settings WHERE id=1),1)=1
      THEN (SELECT COUNT(*) FROM downloads d WHERE d.product_id=p.id)
      ELSE COALESCE((SELECT pmo.download_count FROM product_metric_overrides pmo WHERE pmo.product_id=p.id),0)
    END download_count,
    CASE WHEN COALESCE((SELECT product_use_real FROM metric_settings WHERE id=1),1)=1
      THEN (SELECT COUNT(*) FROM product_views pv WHERE pv.product_id=p.id)
      ELSE COALESCE((SELECT pmo.view_count FROM product_metric_overrides pmo WHERE pmo.product_id=p.id),0)
    END view_count,
    CASE WHEN COALESCE((SELECT rating_use_real FROM metric_settings WHERE id=1),1)=1
      THEN (SELECT ROUND(AVG(pr.rating),1) FROM product_reviews pr WHERE pr.product_id=p.id)
      ELSE COALESCE((SELECT pmo.rating FROM product_metric_overrides pmo WHERE pmo.product_id=p.id),0)
    END rating,
    CASE WHEN COALESCE((SELECT rating_use_real FROM metric_settings WHERE id=1),1)=1
      THEN (SELECT COUNT(*) FROM product_reviews pr WHERE pr.product_id=p.id)
      ELSE COALESCE((SELECT pmo.review_count FROM product_metric_overrides pmo WHERE pmo.product_id=p.id),0)
    END review_count
    FROM products p JOIN seller_profiles sp ON sp.id=p.seller_id JOIN user_profiles up ON up.user_id=sp.user_id LEFT JOIN user u ON u.id=up.user_id`;
}
