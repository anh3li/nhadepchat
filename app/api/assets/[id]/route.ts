import { waitUntil } from 'cloudflare:workers';
import { getD1, getFilesBucket } from '../../../../db';
import { apiSession } from '../../../../lib/server-auth';

function imageType(key: string) {
  const ext = key.split('.').pop()?.toLowerCase();
  return ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg';
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cacheStorage = typeof caches !== 'undefined' ? caches as CacheStorage & { default?: Cache } : null;
  const cache = cacheStorage?.default;
  const cacheKey = new Request(request.url, { method: 'GET' });
  if (cache) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    } catch (error) {
      console.error('Asset cache read failed', error);
    }
  }

  const db = getD1();
  const asset = await db.prepare(`SELECT pa.object_key,p.status,sp.user_id FROM product_assets pa JOIN products p ON p.id=pa.product_id JOIN seller_profiles sp ON sp.id=p.seller_id WHERE pa.id=?`)
    .bind(id).first<{ object_key: string; status: string; user_id: string }>();
  if (!asset) return new Response('Không tìm thấy ảnh', { status: 404 });

  if (asset.status !== 'approved') {
    const session = await apiSession(request);
    if (!session || session.user.id !== asset.user_id) {
      const role = session ? await db.prepare('SELECT role FROM user_profiles WHERE user_id=?')
        .bind(session.user.id).first<{ role: string }>() : null;
      if (role?.role !== 'admin') return new Response('Không có quyền', { status: 403 });
    }
  }

  const object = await getFilesBucket().get(asset.object_key);
  if (!object) return new Response('Không tìm thấy ảnh', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', imageType(asset.object_key));
  headers.set('Content-Disposition', 'inline');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Cache-Control', asset.status === 'approved'
    ? 'public, max-age=31536000, immutable, stale-while-revalidate=86400'
    : 'private, no-store');
  headers.set('ETag', object.httpEtag);
  headers.set('Content-Length', String(object.size));
  const response = new Response(object.body, { headers });

  if (cache && asset.status === 'approved') {
    // Cache storage must not delay the image stream or turn a valid image into a 500.
    waitUntil(cache.put(cacheKey, response.clone()).catch(error => {
      console.error('Asset cache write failed', error);
    }));
  }
  return response;
}
