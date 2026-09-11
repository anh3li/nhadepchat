import assert from 'node:assert/strict';
import test from 'node:test';
import gateway from '../pages-site/gateway.js';
import {isPublicPage} from '../lib/site-navigation.ts';

test('public pages and optimized images are served without calling the backend',async()=>{
  for(const path of ['/','/ban-ve/nha-dep/','/kts/kien-truc-su/','/media/preview.webp','/_next/static/chunks/app.js']){
    let called=false;
    const response=await gateway.fetch(new Request(`https://nhadepchat.pages.dev${path}`),{
      ASSETS:{fetch:async()=>new Response('static')},
      BACKEND:{fetch:async()=>{called=true;return new Response('backend');}},
    });
    assert.equal(await response.text(),'static');assert.equal(called,false);
  }
});

test('private routes preserve method, cookies, body and origin across service binding',async()=>{
  const request=new Request('https://nhadepchat.pages.dev/api/cart',{method:'POST',headers:{cookie:'session=test',origin:'https://nhadepchat.pages.dev'},body:'payload'});
  const response=await gateway.fetch(request,{BACKEND:{fetch:async received=>{
    assert.equal(received.url,request.url);assert.equal(received.method,'POST');
    assert.equal(received.headers.get('cookie'),'session=test');
    assert.equal(received.headers.get('origin'),'https://nhadepchat.pages.dev');
    assert.equal(await received.text(),'payload');return new Response('ok');
  }}});
  assert.equal(await response.text(),'ok');
});

test('missing backend fails closed for account and download routes',async()=>{
  for(const path of ['/admin','/admin/san-pham','/dashboard/','/tai-khoan','/api/download/private-file','/dang-nhap']){
    assert.equal((await gateway.fetch(new Request(`https://nhadepchat.pages.dev${path}`),{})).status,503);
  }
});

test('private browser chunks fall back to the backend when absent from Pages',async()=>{
  const response=await gateway.fetch(new Request('https://nhadepchat.pages.dev/_next/static/chunks/AuthForm-private.js'),{
    ASSETS:{fetch:async()=>new Response('missing',{status:404})},
    BACKEND:{fetch:async()=>new Response('private JS')},
  });
  assert.equal(await response.text(),'private JS');
});

test('only public page links use the static Next router',()=>{
  for(const href of ['/ban-ve/nha/','/tim-kiem?q=nhà','/kts/kts-name','#ho-so'])assert.equal(isPublicPage(href),true);
  for(const href of ['/dang-nhap?returnTo=/ban-ve/nha','/api/download/id','/tai-khoan/da-luu','https://example.com'])assert.equal(isPublicPage(href),false);
});
