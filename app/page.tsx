import './home.css';
import { HomeView } from '../components/views/HomeView';
import { getHomeData } from '../lib/home-data';
export default async function Home(){return <HomeView data={await getHomeData()}/>;}
