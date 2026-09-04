import { z } from 'zod';
import { getD1 } from '../../../../db';
import { allowedDisciplines, allowedFormats, allowedTools, buildingTypes, jsonError, parseKeywords, parseList, productStyles, sanitizeDescription, uniqueSlug } from '../../../../lib/marketplace';
import { apiSeller } from '../../../../lib/server-auth';

const productSchema = z.object({
  id: z.string().uuid().optional(), title: z.string().trim().min(8, 'Tiêu đề cần ít nhất 8 ký tự.').max(160),
  category: z.enum(buildingTypes), buildingType: z.enum(buildingTypes), style: z.enum(productStyles),
  shortDescription: z.string().trim().max(200), description: z.string(),
  width: z.coerce.number().positive().max(1000).nullable().optional(), length: z.coerce.number().positive().max(1000).nullable().optional(),
  floors: z.coerce.number().int().positive().max(200).nullable().optional(), area: z.coerce.number().positive().max(1000000).nullable().optional(),
  isFree: z.boolean(), price: z.coerce.number().int().min(0).max(100000000),
  formats: z.array(z.string()), disciplines: z.array(z.string()), tools: z.array(z.string()), keywords: z.array(z.string()).max(8),
});

export async function GET(request: Request) {
  const current = await apiSeller(request); if ('error' in current) return current.error;
  const id = new URL(request.url).searchParams.get('id'); const db = getD1();
  if (id) {
    const product = await db.prepare(`SELECT p.*,(SELECT GROUP_CONCAT(format, ',') FROM product_formats WHERE product_id=p.id) formats FROM products p WHERE p.id=? AND p.seller_id=? LIMIT 1`).bind(id,current.seller.id).first<Record<string,unknown>>();
    if (!product) return jsonError('Không tìm thấy sản phẩm.',404);
    const [assets,files,disciplines,tools,keywords] = await Promise.all([
      db.prepare('SELECT id,type,sort_order FROM product_assets WHERE product_id=? ORDER BY sort_order').bind(id).all(),
      db.prepare('SELECT id,original_name name,extension,size FROM product_files WHERE product_id=? ORDER BY created_at').bind(id).all(),
      db.prepare('SELECT discipline FROM product_disciplines WHERE product_id=?').bind(id).all<{discipline:string}>(),
      db.prepare('SELECT tool FROM product_tools WHERE product_id=?').bind(id).all<{tool:string}>(),
      db.prepare('SELECT keyword FROM product_keywords WHERE product_id=?').bind(id).all<{keyword:string}>(),
    ]);
    return Response.json({...product,assets:assets.results,files:files.results,disciplines:disciplines.results.map(r=>r.discipline),tools:tools.results.map(r=>r.tool),keywords:keywords.results.map(r=>r.keyword)});
  }
  const rows = await db.prepare(`SELECT p.*,(SELECT GROUP_CONCAT(format, ',') FROM product_formats WHERE product_id=p.id) formats,(SELECT COUNT(*) FROM product_assets WHERE product_id=p.id) asset_count,(SELECT COUNT(*) FROM product_files WHERE product_id=p.id) file_count FROM products p WHERE seller_id=? ORDER BY updated_at DESC LIMIT 100`).bind(current.seller.id).all();
  return Response.json(rows.results);
}

export async function POST(request: Request) { return save(request,false); }
export async function PATCH(request: Request) { return save(request,true); }

async function save(request: Request, editing: boolean) {
  const current = await apiSeller(request); if ('error' in current) return current.error;
  const parsed = productSchema.safeParse(await request.json()); if (!parsed.success) return jsonError(parsed.error.issues[0].message,422);
  const data=parsed.data, formats=parseList(data.formats,allowedFormats), disciplines=parseList(data.disciplines,allowedDisciplines), tools=parseList(data.tools,allowedTools), keywords=parseKeywords(data.keywords), description=sanitizeDescription(data.description);
  if (!data.isFree && data.price > 0 && data.price < 1000) return jsonError('Giá trả phí phải từ 1.000đ.',422);
  const db=getD1(), now=Date.now(), id=data.id||crypto.randomUUID();
  if (editing) {
    const owned=await db.prepare('SELECT id,status FROM products WHERE id=? AND seller_id=?').bind(id,current.seller.id).first<{id:string;status:string}>();
    if (!owned) return jsonError('Không tìm thấy sản phẩm.',404);
    if (!['draft','rejected'].includes(owned.status)) return jsonError('Chỉ có thể sửa bản nháp hoặc hồ sơ bị từ chối.',409);
  }
  const slug=await uniqueSlug(data.title,'products',editing?id:undefined);
  const statements = editing ? [
    db.prepare("UPDATE products SET slug=?,title=?,short_description=?,description=?,category=?,building_type=?,style=?,width=?,length=?,floors=?,area=?,price=?,is_free=?,status='draft',rejection_reason=NULL,updated_at=? WHERE id=? AND seller_id=?").bind(slug,data.title,data.shortDescription,description,data.category,data.buildingType,data.style,data.width??null,data.length??null,data.floors??null,data.area??null,data.isFree?0:data.price,data.isFree?1:0,now,id,current.seller.id),
    db.prepare('DELETE FROM product_formats WHERE product_id=?').bind(id), db.prepare('DELETE FROM product_disciplines WHERE product_id=?').bind(id), db.prepare('DELETE FROM product_tools WHERE product_id=?').bind(id), db.prepare('DELETE FROM product_keywords WHERE product_id=?').bind(id),
  ] : [db.prepare("INSERT INTO products (id,seller_id,slug,title,short_description,description,category,building_type,style,width,length,floors,area,price,is_free,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'draft',?,?)").bind(id,current.seller.id,slug,data.title,data.shortDescription,description,data.category,data.buildingType,data.style,data.width??null,data.length??null,data.floors??null,data.area??null,data.isFree?0:data.price,data.isFree?1:0,now,now)];
  formats.forEach(v=>statements.push(db.prepare('INSERT INTO product_formats (product_id,format) VALUES (?,?)').bind(id,v)));
  disciplines.forEach(v=>statements.push(db.prepare('INSERT INTO product_disciplines (product_id,discipline) VALUES (?,?)').bind(id,v)));
  tools.forEach(v=>statements.push(db.prepare('INSERT INTO product_tools (product_id,tool) VALUES (?,?)').bind(id,v)));
  keywords.forEach(v=>statements.push(db.prepare('INSERT INTO product_keywords (product_id,keyword) VALUES (?,?)').bind(id,v)));
  await db.batch(statements); return Response.json({ok:true,id,slug});
}
