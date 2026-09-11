import {siteOrigin} from '../lib/catalog';
export default function robots(){return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/admin/','/dashboard/','/tai-khoan/']},sitemap:`${siteOrigin}/sitemap.xml`};}
export const dynamic='force-static';
