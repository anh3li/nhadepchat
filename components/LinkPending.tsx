'use client';

import { useLinkStatus } from 'next/link';

export function LinkPending() {
  const { pending } = useLinkStatus();
  return pending ? <span className="product-link-pending" role="status">Đang mở bản vẽ…</span> : null;
}
