import { getHomeData } from '../../../../lib/home-data';

export async function GET(){
  return Response.json(await getHomeData(), { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
}
