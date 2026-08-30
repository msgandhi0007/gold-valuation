const CACHE='rajendra-gold-valuation-v28-fixed';
const CORE=['./','./index.html','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url);
 if(url.pathname.endsWith('/')||url.pathname.endsWith('/index.html')){
   e.respondWith(fetch(e.request).then(r=>{
     if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}
     return r;
   }).catch(()=>caches.match(e.request)));
 }else{
   e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));
 }
});