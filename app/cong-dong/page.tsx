import type { Metadata } from 'next';
import { CommunityView } from '../../components/views/CommunityView';
import { getCommunityData } from '../../lib/community-data';
export const metadata: Metadata = {
  title: 'Cộng đồng KTS & kỹ sư | Nhà Đẹp Chất',
  description: 'Khám phá hồ sơ kiến trúc sư, kỹ sư, nhà thiết kế nội thất và nhà thầu trên Nhà Đẹp Chất.',
};
export const dynamic = 'force-dynamic';

export default async function CommunityPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){return <CommunityView {...await getCommunityData(await searchParams)}/>;}
