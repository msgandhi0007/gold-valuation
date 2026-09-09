const CACHE_NAME = "gold-valuation-v20260909-autobackup-fix-1";

const AUTO_BACKUP_PATCH = `
<script id="sw-autobackup-final-fix">
(function(){
  'use strict';
  if (window.__swAutoBackupFinalFix) return;
  window.__swAutoBackupFinalFix = true;

  function enabled(){ try{return localStorage.getItem('goldValuationAutoBackupEnabled')!=='false';}catch(e){return true;} }
  function vals(){ try{return localStorage.getItem('goldValuations')||'[]';}catch(e){return '[]';} }
  function raw(){
    const o={};
    try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); o[k]=localStorage.getItem(k); } }catch(e){}
    return o;
  }
  function status(now){
    try{
      const el=document.getElementById('sbAutoBackupStatus');
      if(!el)return;
      if(!enabled()){ el.textContent='Auto Backup: OFF\nTurn it on to create a full backup after every successful valuation save.'; return; }
      const x=now?now.toISOString():(localStorage.getItem('goldValuationLastAutoBackup')||'');
      const d=x?new Date(x):null;
      const when=(d&&Number.isFinite(d.getTime()))?d.toLocaleString('en-IN'):'Never';
      el.textContent='Auto Backup: ON ✓\nLast automatic backup: '+when+'\nFile: Backups/Auto_Backup_Latest.json';
    }catch(e){}
  }
  async function getHandle(){
    try{
      let h=window.__gvActiveStorageHandle262||null;
      if(!h&&window.gvStorage&&typeof window.gvStorage.getUsableHandle==='function') h=await window.gvStorage.getUsableHandle(false);
      if(!h&&typeof window.gvGetSelectedStorageHandle==='function') h=await window.gvGetSelectedStorageHandle(false);
      if(!h&&window.gvStorage&&typeof window.gvStorage.getHandle==='function'){
        h=await window.gvStorage.getHandle();
        if(h&&h.queryPermission){
          const p=await h.queryPermission({mode:'readwrite'});
          if(p!=='granted') h=null;
        }
      }
      if(h) window.__gvActiveStorageHandle262=h;
      return h||null;
    }catch(e){ return null; }
  }
  async function writeFile(dir,name,blob){
    const fh=await dir.getFileHandle(name,{create:true});
    const w=await fh.createWritable();
    await w.write(blob); await w.close();
  }
  async function backup(force){
    if(!enabled()||window.__swAutoBackupBusy)return false;
    const fp=vals();
    if(!force&&fp===localStorage.getItem('goldValuationLastAutoBackupFingerprintSW'))return true;
    window.__swAutoBackupBusy=true;
    try{
      const h=await getHandle();
      if(!h){ localStorage.setItem('goldValuationAutoBackupPendingSW','1'); return false; }
      const data=raw(); let arr=[];
      try{ const q=JSON.parse(data.goldValuations||'[]'); if(Array.isArray(q))arr=q; }catch(e){}
      const now=new Date();
      const payload={
        app:'RAJENDRA JEWELLERS GOLD VALUATION APP',
        format:'GOLD_VALUATION_BACKUP_V10',
        version:10, backupType:'automatic', createdAt:now.toISOString(),
        summary:{valuations:arr.length,storageKeys:Object.keys(data).length},
        rawData:data
      };
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
      const dir=await h.getDirectoryHandle('Backups',{create:true});
      await writeFile(dir,'Auto_Backup_Latest.json',blob);
      const day=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
      await writeFile(dir,'Auto_Backup_'+day+'.json',blob);

      localStorage.setItem('goldValuationLastAutoBackup',now.toISOString());
      localStorage.setItem('goldValuationLastAutoBackupFile','Auto_Backup_Latest.json');
      localStorage.setItem('goldValuationLastAutoBackupFingerprintSW',fp);
      localStorage.removeItem('goldValuationAutoBackupPendingSW');
      status(now);
      return true;
    }catch(e){
      try{localStorage.setItem('goldValuationAutoBackupPendingSW','1');}catch(_){}
      return false;
    }finally{ window.__swAutoBackupBusy=false; }
  }

  window.gvAutoBackupFromServiceWorkerPatch=backup;

  function wrapSave(){
    const old=window.gvSaveWithBackup266;
    if(typeof old!=='function'||old.__swAutoBackupWrapped)return;
    const fn=async function(){
      const before=vals();
      const r=await old.apply(this,arguments);
      const after=vals();
      if(enabled()&&after!==before){
        localStorage.setItem('goldValuationAutoBackupPendingSW','1');
        setTimeout(function(){backup(true);},8000);
      }
      return r;
    };
    fn.__swAutoBackupWrapped=true;
    window.gvSaveWithBackup266=fn;
  }

  function wrapStorage(){
    const old=window.openStorageBackupScreen;
    if(typeof old!=='function'||old.__swAutoBackupWrapped)return;
    const fn=function(){
      const r=old.apply(this,arguments);
      status();
      setTimeout(function(){
        if(enabled()&&(localStorage.getItem('goldValuationAutoBackupPendingSW')==='1'||vals()!==localStorage.getItem('goldValuationLastAutoBackupFingerprintSW'))) backup(true);
      },250);
      return r;
    };
    fn.__swAutoBackupWrapped=true;
    window.openStorageBackupScreen=fn;
  }

  function install(){ wrapSave(); wrapStorage(); status(); }
  install();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  [1000,3000,6000,9000].forEach(ms=>setTimeout(install,ms));
})();
</script>`;

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : undefined)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: "no-store" });
        const type = response.headers.get("content-type") || "";
        if (!type.includes("text/html")) return response;

        let html = await response.text();
        if (!html.includes('id="sw-autobackup-final-fix"')) {
          if (html.includes("</body>")) html = html.replace("</body>", AUTO_BACKUP_PATCH + "\n</body>");
          else if (html.includes("</html>")) html = html.replace("</html>", AUTO_BACKUP_PATCH + "\n</html>");
          else html += AUTO_BACKUP_PATCH;
        }

        const headers = new Headers(response.headers);
        headers.delete("content-length");
        return new Response(html, {status:response.status,statusText:response.statusText,headers});
      } catch (err) {
        return caches.match(request);
      }
    })());
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if (request.method === "GET" && response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
