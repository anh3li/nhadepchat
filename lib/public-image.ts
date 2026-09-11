export function publicImageUrl(src:string,thumbnail=false){
  if(process.env.NEXT_PUBLIC_PAGES_SITE!=='1')return src;
  const match=/^\/api\/assets\/([a-zA-Z0-9-]+)$/.exec(src);
  return match?`/media/${match[1]}${thumbnail?'-thumb':''}.webp`:src;
}
