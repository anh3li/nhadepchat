import {getCatalog,siteOrigin} from '../lib/catalog';
export default function sitemap(){
  const data=getCatalog();
  return ['','/gioi-thieu','/bo-suu-tap','/cong-dong','/tim-kiem',...Object.keys(data.products).map(slug=>`/ban-ve/${slug}`),...Object.keys(data.sellers).map(slug=>`/kts/${slug}`)].map(path=>({url:`${siteOrigin}${path}/`}));
}
export const dynamic='force-static';
