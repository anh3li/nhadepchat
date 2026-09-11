import {Suspense} from 'react';
import {CommunityCatalog} from '../../components/CommunityCatalog';
import {getCatalog} from '../../lib/catalog';
export const metadata={title:'Cộng đồng KTS & kỹ sư | Nhà Đẹp Chất'};
export default function Community(){return <Suspense fallback={<main className="subpage"><h1>Cộng đồng KTS & kỹ sư</h1></main>}><CommunityCatalog data={getCatalog().community}/></Suspense>;}
