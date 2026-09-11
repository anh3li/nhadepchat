'use client';

import Link from './SiteLink';
import { FormEvent, useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { SafeImage } from './SafeImage';

type Review = { rating: number; comment: string; updated_at: number; display_name: string; avatar_key: string | null; account_image: string | null; user_id: string };
type ReviewData = { average: number; count: number; reviews: Review[]; signedIn: boolean; eligible: boolean; reason: string; own?: { rating: number; comment: string } | null };

function Stars({ value, label }: { value: number; label?: string }) {
  return <span className="rating-stars" aria-label={label || `${value} trên 5 sao`}>
    {[1,2,3,4,5].map(star => <Star key={star} aria-hidden size={17} strokeWidth={1.8} fill={star <= Math.round(value) ? 'currentColor' : 'none'} />)}
  </span>;
}

export function ReviewSection({ target, id, title, returnTo, initialAverage = 0, initialCount = 0 }: { target: 'product' | 'seller'; id: string; title: string; returnTo: string; initialAverage?: number; initialCount?: number }) {
  const [data, setData] = useState<ReviewData>({ average: initialAverage, count: initialCount, reviews: [], signedIn: false, eligible: false, reason: '' });
  const [rating, setRating] = useState(0), [comment, setComment] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/reviews/${target}/${id}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error();
      return response.json() as Promise<ReviewData>;
    }).then(result => {
      setData(result);
      if (result.own) { setRating(result.own.rating); setComment(result.own.comment); }
    }).catch(() => {});
    return () => controller.abort();
  }, [id, target]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!rating || busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/reviews/${target}/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating, comment }) });
      const result = await response.json() as ReviewData & { error?: string };
      if (!response.ok) throw new Error(result.error || 'Không thể gửi đánh giá.');
      setData(result);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể gửi đánh giá.'); }
    finally { setBusy(false); }
  }

  return <section className="review-section">
    <header className="review-heading"><div><p className="eyebrow">ĐÁNH GIÁ XÁC THỰC</p><h2>{title}</h2></div><div className="rating-summary"><strong>{data.count ? data.average.toFixed(1) : '—'}</strong><span><Stars value={data.average} />{data.count ? `${data.count} đánh giá` : 'Chưa có đánh giá'}</span></div></header>
    {data.eligible ? <form className="review-form" onSubmit={submit}>
      <div><b>{data.own ? 'Cập nhật đánh giá của bạn' : 'Chia sẻ trải nghiệm của bạn'}</b><div className="rating-picker" role="radiogroup" aria-label="Chọn số sao">{[1,2,3,4,5].map(star => <button key={star} type="button" role="radio" aria-checked={rating === star} aria-label={`${star} sao`} onClick={() => setRating(star)}><Star size={24} strokeWidth={1.7} fill={star <= rating ? 'currentColor' : 'none'} /></button>)}</div></div>
      <textarea value={comment} onChange={event => setComment(event.target.value)} maxLength={1000} rows={3} placeholder="Nhận xét ngắn về chất lượng hồ sơ, độ đầy đủ hoặc trải nghiệm làm việc…" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary" disabled={!rating || busy}>{busy ? 'Đang gửi…' : data.own ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}</button>
    </form> : <div className="review-eligibility">{!data.signedIn && data.reason ? <><span>{data.reason}</span><Link href={`/dang-nhap?returnTo=${encodeURIComponent(returnTo)}`}>Đăng nhập</Link></> : <span>{data.reason || 'Đánh giá được mở cho người đã tải hồ sơ.'}</span>}</div>}
    {data.reviews.length > 0 && <div className="review-list">{data.reviews.map((review, index) => {const avatar=review.avatar_key?`/api/profile-avatar/${review.user_id}?v=${encodeURIComponent(review.avatar_key)}`:review.account_image||'';return <article key={`${review.user_id}-${index}`}><span className="review-avatar">{avatar?<SafeImage src={avatar} alt=""/>:review.display_name.split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase()}</span><div><header><b>{review.display_name}</b><Stars value={review.rating} label={`${review.rating} sao`} /><time>{new Date(review.updated_at).toLocaleDateString('vi-VN')}</time></header>{review.comment && <p>{review.comment}</p>}</div></article>})}</div>}
  </section>;
}
