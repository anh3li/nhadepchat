import {cp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root=fileURLToPath(new URL('../',import.meta.url));
const site=path.join(root,'pages-site');
const backend=process.argv.find(arg=>arg.startsWith('--data-origin='))?.slice('--data-origin='.length)||process.env.PAGES_DATA_ORIGIN||'https://nhadepchat.tranvukim-tvk.workers.dev';
const origin=process.env.PAGES_SITE_ORIGIN||'https://nhadepchat.pages.dev';
const snapshot=process.argv.includes('--snapshot');

async function load(kind,params={}){
  const url=new URL('/api/public/pages',backend);
  url.search=new URLSearchParams({kind,...params}).toString();
  const response=await fetch(url,{signal:AbortSignal.timeout(60000),headers:{'User-Agent':'nhadepchat-pages-build'}});
  if(!response.ok)throw new Error(`Public catalog ${kind}: HTTP ${response.status}`);
  return response.json();
}
async function index(type){
  const rows=[];let after='';
  while(true){
    const page=await load('index',{type,after});
    if(!Array.isArray(page))throw new Error('Invalid public index');
    rows.push(...page);if(page.length<100)return rows;
    const next=page.at(-1).slug;if(next<=after)throw new Error('Index cursor did not advance');after=next;
  }
}
await mkdir(site,{recursive:true});
if(!snapshot){
  const revision=await load('revision');
  const [home,collections,community,productsIndex,sellersIndex]=await Promise.all([load('home'),load('collections'),load('community'),index('products'),index('sellers')]);
  const products={},sellers={};
  // Limit build-time load on D1. No account or file payloads are fetched.
  for(const {slug} of productsIndex)products[slug]=await load('product',{slug});
  for(const {slug} of sellersIndex)sellers[slug]=await load('seller',{slug});
  await writeFile(path.join(site,'catalog.json'),JSON.stringify({revision,home,collections,community,products,sellers}));
}
const generatedPublic=path.resolve(site,'public');
if(path.dirname(generatedPublic)!==path.resolve(site))throw new Error('Invalid generated public directory');
await rm(generatedPublic,{recursive:true,force:true});
await cp(path.join(root,'public'),generatedPublic,{recursive:true});
const catalog=JSON.parse(await readFile(path.join(site,'catalog.json'),'utf8'));
const assetIds=new Set();
function collect(value){
  if(!value||typeof value!=='object')return;
  if(typeof value.cover_id==='string')assetIds.add(value.cover_id);
  if(typeof value.cover==='string'){
    const match=/^\/api\/assets\/([a-zA-Z0-9-]+)$/.exec(value.cover);
    if(match)assetIds.add(match[1]);
  }
  for(const child of Object.values(value))collect(child);
}
collect(catalog);
for(const data of Object.values(catalog.products))for(const asset of data.assets.results)assetIds.add(asset.id);
const media=path.join(site,'public/media');
await mkdir(media,{recursive:true});
for(const id of assetIds){
  if(!/^[a-zA-Z0-9-]+$/.test(id))throw new Error('Invalid asset ID');
  const response=await fetch(new URL(`/api/assets/${id}`,backend),{signal:AbortSignal.timeout(60000)});
  if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw new Error(`Published image ${id}: HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  await sharp(bytes).rotate().resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toFile(path.join(media,`${id}.webp`));
  await sharp(bytes).rotate().resize({width:640,height:640,fit:'inside',withoutEnlargement:true}).webp({quality:78}).toFile(path.join(media,`${id}-thumb.webp`));
}
const result=spawnSync(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'build','--webpack'],{
  cwd:site,stdio:'inherit',env:{...process.env,NEXT_PUBLIC_PAGES_SITE:'1',PAGES_SITE_ORIGIN:origin,NEXT_TELEMETRY_DISABLED:'1'},
});
if(result.status!==0)process.exit(result.status||1);
// Fail before deployment if a config change moved or broke the static export.
const homeHtml=await readFile(path.join(site,'out/index.html'),'utf8');
if(!homeHtml.includes('<html'))throw new Error('Pages HTML export is missing');
for(const slug of Object.keys(catalog.products)){
  const html=await readFile(path.join(site,'out/ban-ve',slug,'index.html'),'utf8');
  if(html.includes('src="/api/assets/'))throw new Error(`Product ${slug} still requests preview images from the backend`);
}
await cp(path.join(site,'gateway.js'),path.join(site,'out/_worker.js'));
await writeFile(path.join(site,'out/_routes.json'),JSON.stringify({version:1,include:['/api/*','/assets/*','/_next/*','/vinext-client-entry-manifest.json','/admin','/admin/*','/dashboard','/dashboard/*','/tai-khoan','/tai-khoan/*','/dang-nhap','/dang-nhap/*','/dang-ky','/dang-ky/*','/dang-ban','/dang-ban/*','/gio-hang','/gio-hang/*','/quen-mat-khau','/quen-mat-khau/*'],exclude:[]}));
await writeFile(path.join(site,'out/_headers'),'/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable\n/media/*\n  Cache-Control: public, max-age=86400\n');
await writeFile(path.join(site,'out/catalog-revision.json'),JSON.stringify(catalog.revision||null));
console.log(`Pages export: ${Object.keys(catalog.products).length} product pages, ${Object.keys(catalog.sellers).length} seller pages. Origin: ${origin}`);
