import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

test('通信が応答しなくても待ち時間後にキャッシュから教材を返す',async()=>{
  const handlers={},cached=new Response('cached lesson');let usedSignal=false,calls=0;
  const context={
    self:{location:{origin:'https://example.test'},addEventListener(name,fn){handlers[name]=fn;}},
    caches:{open:async()=>({match:async()=>cached.clone()})},URL,Response,AbortController,
    setTimeout(fn,ms){assert.equal(ms,3000);queueMicrotask(fn);return 1;},clearTimeout(){},
    fetch(request,{signal}){calls++;usedSignal=true;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('offline'))));}
  };
  vm.runInNewContext(readFileSync(new URL('../sw.js',import.meta.url),'utf8'),context);
  let result;
  handlers.fetch({request:{url:'https://example.test/LearningMaterials/js/main.js',method:'GET'},respondWith(p){result=p;}});
  assert.equal(await (await result).text(),'cached lesson');assert.equal(usedSignal,true);
  handlers.fetch({request:{url:'https://example.test/LearningMaterials/js/session.js',method:'GET'},respondWith(p){result=p;}});
  assert.equal(await (await result).text(),'cached lesson');assert.equal(calls,1,'dependent modules should use the recent offline fallback without another timeout');
});

test('キャッシュ保存が失敗してもオンラインの教材を返す',async()=>{
  const handlers={};
  vm.runInNewContext(readFileSync(new URL('../sw.js',import.meta.url),'utf8'),{
    self:{location:{origin:'https://example.test'},addEventListener(name,fn){handlers[name]=fn;}},
    caches:{open:async()=>({put:async()=>{throw new Error('quota');}})},URL,Response,AbortController,setTimeout,clearTimeout,
    fetch:async()=>new Response('latest lesson')
  });
  let result;handlers.fetch({request:{url:'https://example.test/LearningMaterials/',method:'GET'},respondWith(p){result=p;}});
  assert.equal(await (await result).text(),'latest lesson');
});
