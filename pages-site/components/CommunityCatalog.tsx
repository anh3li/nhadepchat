'use client';
import {useSearchParams} from 'next/navigation';
import {CommunityView} from '../../components/views/CommunityView';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CommunityCatalog({data}:{data:any}){
  const params=useSearchParams(),role=params.get('vai-tro')||'',sort=params.get('sap-xep')==='moi'?'moi':'noi-bat';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const people=data.people.results.filter((p:any)=>!role||p.seller_type===role);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if(sort==='moi')people.sort((a:any,b:any)=>Number(b.created_at)-Number(a.created_at));
  return <CommunityView {...data} role={role} sort={sort} people={{results:people}}/>;
}
