'use client';

import { FormEvent, useEffect, useState } from 'react';
import { BarChart3, Eye, Download, MessageSquare, Save, Star } from 'lucide-react';

type MetricProduct = {
  id: string;
  title: string;
  slug: string;
  status: string;
  real_view_count: number;
  real_download_count: number;
  real_rating: number | null;
  real_review_count: number;
  manual_view_count: number;
  manual_download_count: number;
  manual_rating: number;
  manual_review_count: number;
};

type MetricSeller = {
  id: string;
  display_name: string;
  slug: string;
  professional_title: string;
  real_rating: number | null;
  real_review_count: number;
  manual_rating: number;
  manual_review_count: number;
};

type MetricSettings = {
  home_use_real: number;
  home_product_count: number;
  home_free_count: number;
  home_seller_count: number;
  home_download_count: number;
  product_use_real: number;
  rating_use_real: number;
  seller_rating_use_real: number;
};

type MetricsResponse = { settings: MetricSettings; products: MetricProduct[]; sellers: MetricSeller[]; error?: string };

const emptySettings: MetricSettings = {
  home_use_real: 1,
  home_product_count: 0,
  home_free_count: 0,
  home_seller_count: 0,
  home_download_count: 0,
  product_use_real: 1,
  rating_use_real: 1,
  seller_rating_use_real: 1,
};

function numeric(value: string) {
  return Math.max(0, Math.min(2_000_000_000, Math.trunc(Number(value) || 0)));
}

function starRating(value: string) {
  return Math.max(0, Math.min(5, Math.round((Number(value) || 0) * 10) / 10));
}

export function AdminMetricsSettings() {
  const [settings, setSettings] = useState(emptySettings);
  const [products, setProducts] = useState<MetricProduct[]>([]);
  const [sellers, setSellers] = useState<MetricSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/metrics', { signal: controller.signal })
      .then(async (response) => ({ response, data: await response.json() as MetricsResponse }))
      .then(({ response, data }) => {
        if (!response.ok) throw new Error(data.error || 'Không thể tải cài đặt số liệu.');
        setSettings(data.settings);
        setProducts(data.products);
        setSellers(data.sellers || []);
      })
      .catch((reason) => { if (reason?.name !== 'AbortError') setError(reason instanceof Error ? reason.message : 'Không thể tải cài đặt số liệu.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  function setHome(name: keyof MetricSettings, value: number) {
    setSettings((current) => ({ ...current, [name]: value }));
  }

  function setProduct(id: string, name: 'manual_view_count' | 'manual_download_count' | 'manual_rating' | 'manual_review_count', value: number) {
    setProducts((current) => current.map((product) => product.id === id ? { ...product, [name]: value } : product));
  }

  function setSeller(id: string, name: 'manual_rating' | 'manual_review_count', value: number) {
    setSellers((current) => current.map((seller) => seller.id === id ? { ...seller, [name]: value } : seller));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/admin/metrics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeUseReal: Boolean(settings.home_use_real),
          home: {
            productCount: settings.home_product_count,
            freeCount: settings.home_free_count,
            sellerCount: settings.home_seller_count,
            downloadCount: settings.home_download_count,
          },
          productUseReal: Boolean(settings.product_use_real),
          ratingUseReal: Boolean(settings.rating_use_real),
          sellerRatingUseReal: Boolean(settings.seller_rating_use_real),
          products: products.map((product) => ({
            id: product.id,
            viewCount: product.manual_view_count,
            downloadCount: product.manual_download_count,
            rating: product.manual_rating,
            reviewCount: product.manual_review_count,
          })),
          sellers: sellers.map((seller) => ({
            id: seller.id,
            rating: seller.manual_rating,
            reviewCount: seller.manual_review_count,
          })),
        }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Không thể lưu cài đặt.');
      setMessage('Đã lưu. Số liệu hiển thị ngoài website được cập nhật ngay.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể lưu cài đặt.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <section className="content-card metrics-loading">Đang tải cài đặt số liệu…</section>;

  return <form className="metrics-settings" onSubmit={save}>
    {error && <p className="form-error" role="alert">{error}</p>}
    {message && <p className="form-success" role="status">{message}</p>}

    <section className="content-card metrics-card">
      <div className="metrics-card-heading"><span><BarChart3/></span><div><h2>Số liệu trên ảnh bìa</h2><p>Điều khiển bốn con số “Hồ sơ bản vẽ”, “Bản vẽ miễn phí”, “KTS & kỹ sư” và “Lượt tải”.</p></div><ModeSwitch checked={Boolean(settings.home_use_real)} onChange={(checked) => setHome('home_use_real', checked ? 1 : 0)}/></div>
      <div className="metric-mode-note"><b>{settings.home_use_real ? 'Đang dùng số liệu thật' : 'Đang dùng số nhập thủ công'}</b><span>Dữ liệu thật vẫn tiếp tục được hệ thống ghi nhận.</span></div>
      <div className="home-metric-grid" aria-disabled={Boolean(settings.home_use_real)}>
        {[
          ['home_product_count','Hồ sơ bản vẽ'],
          ['home_free_count','Bản vẽ miễn phí'],
          ['home_seller_count','KTS & kỹ sư'],
          ['home_download_count','Lượt tải'],
        ].map(([name,label]) => <label key={name}>{label}<input type="number" min="0" max="2000000000" disabled={Boolean(settings.home_use_real)} value={settings[name as keyof MetricSettings]} onChange={(event) => setHome(name as keyof MetricSettings,numeric(event.target.value))}/></label>)}
      </div>
    </section>

    <section className="content-card metrics-card">
      <div className="metrics-card-heading"><span><Eye/></span><div><h2>Lượt xem và lượt tải bài đăng</h2><p>Chọn số thật hoặc nhập số hiển thị riêng cho từng bài đã duyệt.</p></div><ModeSwitch checked={Boolean(settings.product_use_real)} onChange={(checked) => setHome('product_use_real', checked ? 1 : 0)}/></div>
      <div className="metric-mode-note"><b>{settings.product_use_real ? 'Đang dùng số liệu thật' : 'Đang dùng số nhập thủ công'}</b><span>Số thật bên dưới chỉ để đối chiếu và không bị thay đổi.</span></div>
      <div className="product-metrics-list">
        <header><span>Bài đăng</span><span>Số thật</span><span>Số hiển thị thủ công</span></header>
        {products.length ? products.map((product) => <article key={product.id}>
          <div><b>{product.title}</b><a href={`/ban-ve/${product.slug}`} target="_blank" rel="noreferrer">Xem bài đăng</a></div>
          <div className="real-metrics"><span><Eye/> {Number(product.real_view_count).toLocaleString('vi-VN')} xem</span><span><Download/> {Number(product.real_download_count).toLocaleString('vi-VN')} tải</span></div>
          <div className="manual-metrics"><label><Eye/><input aria-label={`Lượt xem thủ công của ${product.title}`} type="number" min="0" max="2000000000" disabled={Boolean(settings.product_use_real)} value={product.manual_view_count} onChange={(event) => setProduct(product.id,'manual_view_count',numeric(event.target.value))}/></label><label><Download/><input aria-label={`Lượt tải thủ công của ${product.title}`} type="number" min="0" max="2000000000" disabled={Boolean(settings.product_use_real)} value={product.manual_download_count} onChange={(event) => setProduct(product.id,'manual_download_count',numeric(event.target.value))}/></label></div>
        </article>) : <p className="metrics-empty">Chưa có bài đăng đã duyệt.</p>}
      </div>
    </section>

    <section className="content-card metrics-card">
      <div className="metrics-card-heading"><span><Star/></span><div><h2>Đánh giá sao bài đăng</h2><p>Chọn điểm đánh giá thật hoặc nhập điểm sao và số lượt đánh giá hiển thị cho từng bài.</p></div><ModeSwitch checked={Boolean(settings.rating_use_real)} onChange={(checked) => setHome('rating_use_real', checked ? 1 : 0)}/></div>
      <div className="metric-mode-note"><b>{settings.rating_use_real ? 'Đang dùng đánh giá thật' : 'Đang dùng đánh giá nhập thủ công'}</b><span>Đánh giá thật từ người dùng vẫn tiếp tục được lưu để có thể bật lại bất cứ lúc nào.</span></div>
      <div className="product-metrics-list rating-metrics-list">
        <header><span>Bài đăng</span><span>Đánh giá thật</span><span>Đánh giá hiển thị thủ công</span></header>
        {products.length ? products.map((product) => <article key={product.id}>
          <div><b>{product.title}</b><a href={`/ban-ve/${product.slug}`} target="_blank" rel="noreferrer">Xem bài đăng</a></div>
          <div className="real-metrics"><span><Star fill="currentColor"/> {product.real_review_count ? `${Number(product.real_rating || 0).toFixed(1)} sao` : 'Chưa có'}</span><span><MessageSquare/> {Number(product.real_review_count).toLocaleString('vi-VN')} lượt đánh giá</span></div>
          <div className="manual-metrics rating-inputs"><label><Star/><input aria-label={`Điểm sao thủ công của ${product.title}`} type="number" min="0" max="5" step="0.1" disabled={Boolean(settings.rating_use_real)} value={product.manual_rating} onChange={(event) => setProduct(product.id,'manual_rating',starRating(event.target.value))}/></label><label><MessageSquare/><input aria-label={`Số lượt đánh giá thủ công của ${product.title}`} type="number" min="0" max="2000000000" disabled={Boolean(settings.rating_use_real)} value={product.manual_review_count} onChange={(event) => setProduct(product.id,'manual_review_count',numeric(event.target.value))}/></label></div>
        </article>) : <p className="metrics-empty">Chưa có bài đăng đã duyệt.</p>}
      </div>
    </section>

    <section className="content-card metrics-card">
      <div className="metrics-card-heading"><span><Star/></span><div><h2>Đánh giá sao kiến trúc sư</h2><p>Chọn đánh giá thật hoặc nhập điểm sao và số lượt đánh giá hiển thị riêng cho từng KTS & kỹ sư.</p></div><ModeSwitch checked={Boolean(settings.seller_rating_use_real)} onChange={(checked) => setHome('seller_rating_use_real', checked ? 1 : 0)}/></div>
      <div className="metric-mode-note"><b>{settings.seller_rating_use_real ? 'Đang dùng đánh giá thật' : 'Đang dùng đánh giá nhập thủ công'}</b><span>Đánh giá thật của khách hàng vẫn tiếp tục được lưu khi bạn dùng số hiển thị thủ công.</span></div>
      <div className="product-metrics-list rating-metrics-list">
        <header><span>KTS & kỹ sư</span><span>Đánh giá thật</span><span>Đánh giá hiển thị thủ công</span></header>
        {sellers.length ? sellers.map((seller) => <article key={seller.id}>
          <div><b>{seller.display_name}</b><span>{seller.professional_title}</span><a href={`/kts/${seller.slug}`} target="_blank" rel="noreferrer">Xem hồ sơ KTS</a></div>
          <div className="real-metrics"><span><Star fill="currentColor"/> {seller.real_review_count ? `${Number(seller.real_rating || 0).toFixed(1)} sao` : 'Chưa có'}</span><span><MessageSquare/> {Number(seller.real_review_count).toLocaleString('vi-VN')} lượt đánh giá</span></div>
          <div className="manual-metrics rating-inputs"><label><Star/><input aria-label={`Điểm sao thủ công của ${seller.display_name}`} type="number" min="0" max="5" step="0.1" disabled={Boolean(settings.seller_rating_use_real)} value={seller.manual_rating} onChange={(event) => setSeller(seller.id,'manual_rating',starRating(event.target.value))}/></label><label><MessageSquare/><input aria-label={`Số lượt đánh giá thủ công của ${seller.display_name}`} type="number" min="0" max="2000000000" disabled={Boolean(settings.seller_rating_use_real)} value={seller.manual_review_count} onChange={(event) => setSeller(seller.id,'manual_review_count',numeric(event.target.value))}/></label></div>
        </article>) : <p className="metrics-empty">Chưa có hồ sơ KTS hoặc kỹ sư.</p>}
      </div>
    </section>

    <div className="metrics-save"><button className="button button-primary" disabled={saving}><Save/>{saving ? 'Đang lưu…' : 'Lưu cài đặt số liệu'}</button></div>
  </form>;
}

function ModeSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="mode-switch"><span>{checked ? 'Số thật' : 'Thủ công'}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)}/><i aria-hidden/></label>;
}
