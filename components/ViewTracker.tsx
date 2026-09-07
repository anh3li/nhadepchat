'use client';

import { useEffect } from 'react';

export function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/views/${productId}`, { method: 'POST', signal: controller.signal, credentials: 'same-origin' }).catch(() => {});
    return () => controller.abort();
  }, [productId]);
  return null;
}
