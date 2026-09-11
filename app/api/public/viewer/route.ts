import { getHeaderData } from '../../../../lib/header-data';
export async function GET(){
  return Response.json(await getHeaderData(),{headers:{'Cache-Control':'private, no-store'}});
}
