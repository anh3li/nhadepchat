/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from '../SiteLink';
import { ArrowRight, Download, FileStack, Layers3 } from 'lucide-react';

import { SafeImage } from '../SafeImage';


export function CollectionsView({activeItems,total}:{activeItems:any[];total:any}){
  return <main className="subpage discovery-page">
    <section className="discovery-hero"><div><p className="eyebrow">THƯ VIỆN TUYỂN CHỌN</p><h1>Thư viện bản vẽ</h1><p>Tìm nhanh những nhóm hồ sơ phù hợp với loại công trình và chuyên môn bạn đang triển khai.</p></div><dl><div><dt>{Number(total?.total||0)}</dt><dd>Hồ sơ đã duyệt</dd></div><div><dt>{activeItems.length}</dt><dd>Nhóm bản vẽ đang có hồ sơ</dd></div></dl></section>
    <section className="collection-directory"><div className="directory-heading"><div><FileStack/><div><h2>Thư viện bản vẽ nổi bật</h2><p>Chỉ hiển thị những nhóm bản vẽ đang có hồ sơ đã duyệt.</p></div></div></div>{activeItems.length?<div className="collection-directory-grid">{activeItems.map(item=><article className="directory-collection" id={item.id} key={item.id}><Link href={`/tim-kiem?q=${encodeURIComponent(item.query)}`}>{item.cover?<SafeImage src={item.cover} alt={item.name}/>:<span className="image-placeholder"/>}<span className="directory-collection-overlay"><b>{item.name}</b><small>{item.count} hồ sơ</small></span></Link><div><p>{item.description}</p><Link href={`/tim-kiem?q=${encodeURIComponent(item.query)}`}>Khám phá thư viện bản vẽ <ArrowRight/></Link></div></article>)}</div>:<div className="empty-state"><h2>Chưa có nhóm bản vẽ</h2><p>Thư viện bản vẽ sẽ xuất hiện tự động khi có hồ sơ phù hợp được duyệt.</p></div>}</section>
    <section className="discovery-callout"><Layers3/><div><h2>Chưa tìm thấy nhóm hồ sơ phù hợp?</h2><p>Dùng tìm kiếm chi tiết để lọc theo công trình, kích thước, định dạng hoặc chuyên môn.</p></div><Link className="button button-primary" href="/tim-kiem">Tìm tất cả bản vẽ <Download/></Link></section>
  </main>;
}
