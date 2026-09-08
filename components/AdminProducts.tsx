'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Eye, XCircle } from 'lucide-react';
import { SafeImage } from './SafeImage';

type Product = {
  id: string;
  cover_id: string | null;
  title: string;
  seller_name: string;
  category: string;
  building_type: string;
  short_description: string;
  description: string;
  seller_slug: string;
  width: number | null;
  length: number | null;
  floors: number | null;
  formats: string | null;
  price: number;
  submitted_at: number | null;
  file_summary: string | null;
};
type ApiError = { error?: string };

export function AdminProducts() {
  const [status, setStatus] = useState('pending');
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/products?status=${status}`)
      .then(async (response) => ({ response, data: await response.json() as Product[] | ApiError }))
      .then(({ response, data }) => {
        if (!active) return;
        setLoading(false);
        if (response.ok && Array.isArray(data)) setRows(data);
        else setError(!Array.isArray(data) ? data.error || 'Không thể tải danh sách.' : 'Không thể tải danh sách.');
      });
    return () => { active = false; };
  }, [status]);

  async function reload() {
    setLoading(true);
    const response = await fetch(`/api/admin/products?status=${status}`);
    const data = await response.json() as Product[] | ApiError;
    setLoading(false);
    if (response.ok && Array.isArray(data)) setRows(data);
    else setError(!Array.isArray(data) ? data.error || 'Không thể tải danh sách.' : 'Không thể tải danh sách.');
  }

  async function moderate(id: string, action: 'approve' | 'reject') {
    if (action === 'reject' && reason.trim().length < 5) {
      setError('Lý do từ chối phải có ít nhất 5 ký tự.');
      return;
    }
    const response = await fetch(`/api/admin/products/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, reason }),
    });
    const data = await response.json() as ApiError;
    if (!response.ok) { setError(data.error || 'Không thể cập nhật sản phẩm.'); return; }
    setRejectId(null); setReason(''); await reload();
  }

  return <>
    <div className="admin-tabs">{[['pending', 'Chờ duyệt'], ['approved', 'Đã duyệt'], ['rejected', 'Từ chối']].map(([value, label]) =>
      <button className={status === value ? 'active' : ''} key={value} onClick={() => { setLoading(true); setStatus(value); }}>{label}</button>)}</div>
    {error && <p className="form-error">{error}</p>}
    <section className="content-card admin-list">{loading ? <p>Đang tải…</p> : rows.length ? rows.map((product) =>
      <article key={product.id}>
        {product.cover_id ? <SafeImage className="admin-media" src={`/api/assets/${product.cover_id}`} alt={product.title} /> : <div className="image-placeholder" />}
        <div><h2>{product.title}</h2><p><Link href={`/kts/${product.seller_slug}`}>{product.seller_name}</Link> · {product.category} · {product.building_type}</p>{product.short_description&&<p>{product.short_description}</p>}{product.description&&<div className="admin-description" dangerouslySetInnerHTML={{__html:product.description}}/>}
          <small>{product.width || '—'} × {product.length || '—'}m · {product.floors || '—'} tầng · {product.formats || '—'} · {Number(product.price).toLocaleString('vi-VN')}đ</small>
          <small>{product.file_summary || 'Chưa có file'} · {product.submitted_at ? `Gửi ${new Date(product.submitted_at).toLocaleString('vi-VN')}` : 'Chưa gửi duyệt'}</small>
          {rejectId === product.id && <label className="reject-reason">Lý do từ chối<textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={5} /></label>}
        </div>
        <div className="admin-actions">{product.cover_id&&<a className="outline-action" href={`/api/assets/${product.cover_id}`} target="_blank" rel="noreferrer"><Eye size={15}/>Xem ảnh</a>}{status === 'pending'&&(rejectId === product.id ? <><button type="button" className="reject" onClick={() => setRejectId(null)}>Hủy</button><button type="button" className="reject confirm" onClick={() => moderate(product.id, 'reject')}><XCircle size={15}/>Xác nhận từ chối</button></> : <><button type="button" className="approve" onClick={() => moderate(product.id, 'approve')}><CheckCircle2 size={15}/>Duyệt bài</button><button type="button" className="reject" onClick={() => setRejectId(product.id)}><XCircle size={15}/>Từ chối</button></>)}</div>
      </article>) : <div className="empty-state"><h2>Không có sản phẩm</h2><p>Danh sách này hiện đang trống.</p></div>}</section>
  </>;
}
