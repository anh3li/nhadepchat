import {HomeView} from '../../components/views/HomeView';
import {getCatalog} from '../lib/catalog';
export default function Home(){return <HomeView data={getCatalog().home}/>;}
