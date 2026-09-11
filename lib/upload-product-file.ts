/** Upload completion, not transport progress, determines whether an asset is ready. */
export async function uploadProductFile(productId: string, file: File, kind: 'preview' | 'thumbnail' | 'file', onProgress: (value: number) => void, assetId?: string) {
  const response = await fetch('/api/uploads/presign', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, kind, assetId, name: file.name, mime: file.type || 'application/octet-stream', size: file.size }),
  });
  const presign = await response.json() as { error?: string; direct?: boolean; uploadUrl: string; headers?: Record<string, string>; id: string; objectKey: string; originalName: string; mime: string };
  if (!response.ok) throw new Error(presign.error || 'Không thể chuẩn bị tải file.');
  const result = await new Promise<{ id: string; url?: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(presign.direct ? 'PUT' : 'POST', presign.direct ? presign.uploadUrl : '/api/uploads');
    xhr.timeout = 10 * 60 * 1000;
    if (presign.direct) Object.entries(presign.headers || {}).forEach(([key, value]) => xhr.setRequestHeader(key, value));
    xhr.upload.onprogress = event => { if (event.lengthComputable) onProgress(Math.min(99, Math.round(event.loaded / event.total * 100))); };
    xhr.onerror = () => reject(new Error('Mất kết nối khi tải file. Vui lòng thử lại.'));
    xhr.ontimeout = () => reject(new Error('Tải file quá thời gian chờ. Vui lòng thử lại.'));
    xhr.onabort = () => reject(new Error('Đã hủy tải file.'));
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) { reject(new Error(`Không thể tải file ${file.name}.`)); return; }
      try { resolve(presign.direct ? { id: presign.id } : JSON.parse(xhr.responseText)); }
      catch { reject(new Error('Máy chủ trả về kết quả tải file không hợp lệ.')); }
    };
    const form = new FormData(); form.set('productId', productId); form.set('kind', kind); if (assetId) form.set('assetId', assetId); form.set('file', file);
    xhr.send(presign.direct ? file : form);
  });
  if (presign.direct) {
    const completed = await fetch('/api/uploads/complete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: presign.id, productId, assetId, objectKey: presign.objectKey, kind, originalName: presign.originalName, extension: file.name.split('.').pop()?.toLowerCase() || '', mime: presign.mime, size: file.size }),
    });
    const body = await completed.json() as { error?: string };
    if (!completed.ok) throw new Error(body.error || 'Chưa xác nhận được file. Vui lòng thử lại.');
    result.url = kind === 'preview' ? `/api/assets/${presign.id}` : undefined;
  }
  if (!result.id) throw new Error('Máy chủ chưa xác nhận file đã tải lên.');
  return result;
}
