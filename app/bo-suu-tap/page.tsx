import type { Metadata } from 'next';
import { CollectionsView } from '../../components/views/CollectionsView';
import { getCollectionsData } from '../../lib/collection-data';
export const metadata: Metadata = {
  title: 'Thư viện bản vẽ | Nhà Đẹp Chất',
  description: 'Khám phá các bộ hồ sơ xây dựng được tuyển chọn theo loại công trình, chuyên môn và định dạng.',
};
export const dynamic = 'force-dynamic';

export default async function CollectionsPage(){return <CollectionsView {...await getCollectionsData()}/>;}
