const V='hexos-v5';
const SHELL=['index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
const FB='https://www.gstatic.com/firebasejs/10.12.2/';
const CDN=[FB+'firebase-app.js',FB+'firebase-auth.js',FB+'firebase-firestore.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.concat(CDN).map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
function timeout(ms){return new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),ms))}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url),same=u.origin===location.origin,cdn=u.hostname==='www.gstatic.com'&&u.pathname.indexOf('/firebasejs/')===0;
  if(!same&&!cdn)return;
  if(r.mode==='navigate'){
    e.respondWith(Promise.race([fetch(r),timeout(4000)]).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(V).then(c=>c.put('index.html',cp))}return res}).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(m=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>m);
    return m||net;
  }));
});
