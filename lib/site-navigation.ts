export function isPublicPage(href:string){
  if(href.startsWith('#'))return true;
  const path=href.split(/[?#]/)[0].replace(/\/$/,'')||'/';
  return ['/','/tim-kiem','/bo-suu-tap','/cong-dong','/gioi-thieu'].includes(path)||path.startsWith('/ban-ve/')||path.startsWith('/kts/');
}
