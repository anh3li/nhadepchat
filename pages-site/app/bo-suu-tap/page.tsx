import {CollectionsView} from '../../../components/views/CollectionsView';
import {getCatalog} from '../../lib/catalog';
export const metadata={title:'Thư viện bản vẽ | Nhà Đẹp Chất'};
export default function Collections(){return <CollectionsView {...getCatalog().collections}/>;}
