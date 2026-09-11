// Pages serves public HTML/JS directly. Only private routes and API calls enter here.
const gateway = {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname.startsWith('/_next/')){
      const asset=await env.ASSETS.fetch(request);
      // Public Next assets and private Vinext assets have different hashes.
      // Resolve locally first; only missing private chunks need the backend.
      return asset.status===404&&env.BACKEND?env.BACKEND.fetch(request):asset;
    }
    if(url.pathname==='/vinext-client-entry-manifest.json')return env.BACKEND?env.BACKEND.fetch(request):new Response('Backend unavailable',{status:503});
    if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/assets/')||/^\/(admin|dashboard|tai-khoan|dang-nhap|dang-ky|dang-ban|gio-hang|quen-mat-khau)(\/|$)/.test(url.pathname)){
      if(!env.BACKEND)return new Response('Backend chưa được cấu hình',{status:503});
      // Service binding preserves the public origin and cookies without CORS.
      return env.BACKEND.fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};
export default gateway;
