export default function Loading() {
  return <main className="subpage product-detail-page" aria-busy="true">
    <p role="status">Đang tải bản vẽ…</p>
    <div className="detail-loading-image" aria-hidden="true" />
  </main>;
}
