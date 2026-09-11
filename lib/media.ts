const mediaBase = (process.env.NEXT_PUBLIC_MEDIA_URL || '').replace(/\/$/, '');

export function previewImageUrl(id: string | null | undefined, objectKey?: string | null, thumbnailKey?: string | null) {
  const key = thumbnailKey || objectKey;
  if (process.env.NEXT_PUBLIC_PAGES_SITE === '1' && id) return `/media/${id}.webp`;
  if (mediaBase && key?.startsWith('previews/')) return `${mediaBase}/${key}`;
  return id ? `/api/assets/${id}` : '';
}

export function largePreviewImageUrl(id: string | null | undefined, objectKey?: string | null) {
  if (process.env.NEXT_PUBLIC_PAGES_SITE === '1' && id) return `/media/${id}.webp`;
  if (mediaBase && objectKey?.startsWith('previews/')) return `${mediaBase}/${objectKey}`;
  return id ? `/api/assets/${id}` : '';
}

export function publicProductImages<T extends Record<string, unknown>>(product: T) {
  return {
    ...product,
    thumbnailUrl: previewImageUrl(String(product.cover_id || ''), product.cover_key as string | null, product.thumbnail_key as string | null),
    previewUrl: largePreviewImageUrl(String(product.cover_id || ''), product.cover_key as string | null),
  };
}