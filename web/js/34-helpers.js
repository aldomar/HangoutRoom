'use strict';
/* =========================================================
   34. GROWN-UP HELPERS (v1.30)
   💾 Backup reminder: settings.lastBackup (ms, belongs to the device like the PIN) is set when a backup file is saved
   or the code is copied. On Android the wrapper calls backupSaved() only after the file was really written.
   ⚙️ Settings shows "Last backup: 12 days ago" in small grown-up text. Nothing for the children, no pop-ups.
   🔊 Read to me: tapping a button also says its name, through AndroidBridge.speak(text) (Android's built-in offline
   voice). p.speak is null (follow Easy mode: on in Easy mode, off otherwise) or true/false once someone switches it in
   Settings. The switch only shows when the wrapper can speak; the browser version stays quiet.
   📷 Snapshot: the 📷 button under 🌙 saves a picture of the room on screen; "📷 Save picture" on a photocard saves
   the card. The SVG is drawn into a canvas and saved as a PNG through AndroidBridge.saveImage(base64, fileName)
   (Android's save picker) or a download in the browser.
   ========================================================= */
/* ---------- backup reminder ---------- */
function backupSaved(){DB.settings.lastBackup=Date.now();save();}
function lastBackupText(){
  const t=Number(DB.settings.lastBackup)||0; if(!t) return '💾 Last backup: never';
  const days=Math.floor((Date.now()-t)/86400000);
  return '💾 Last backup: '+(days<=0?'today':days===1?'yesterday':days+' days ago');
}

/* ---------- read to me ---------- */
const canSpeak=()=>!!(window.AndroidBridge&&typeof window.AndroidBridge.speak==='function');
const readOn=p=>!!p&&(p.speak===null?p.easy:p.speak);
const HOT_WORDS={shelf:'Fidget shelf',closet:'Closet',desk:'Art desk',photo:'Photocards',window:'Soccer',goal:'Soccer',stage:'Stage',
  code:'Code Lab',brain:'Brain games',pet:'Pet',gift:'A gift!'};
function speakLabel(el){
  if(el.dataset.hot) return HOT_WORDS[el.dataset.hot]||'';
  const tn=el.querySelector&&el.querySelector('.tn');
  const raw=el.getAttribute('aria-label')||(tn&&tn.textContent)||el.textContent||'';
  const t=raw.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}]/gu,'').replace(/[✔✖⬅➜•·]/g,' ').replace(/\s+/g,' ').trim();
  return t.length>60?'':t;
}
let lastSaid={t:'',at:0};
document.addEventListener('click',e=>{
  const p=cur==='profiles'?null:P(); if(!canSpeak()||!readOn(p)) return;
  if(cur==='stage'&&typeof STG!=='undefined'&&STG.state==='play') return; // never talk over a song
  const el=e.target.closest('button,.tile,[data-hot],.chip'); if(!el) return;
  const t=speakLabel(el); if(!t) return;
  const now=Date.now(); if(t===lastSaid.t&&now-lastSaid.at<800) return; lastSaid={t,at:now};
  try{window.AndroidBridge.speak(t);}catch(_){}
},true);

/* ---------- snapshots ---------- */
function svgPng(svgEl,w,h){
  const c=svgEl.cloneNode(true);
  c.querySelectorAll('#bubble,#emoteFx,.sign').forEach(n=>n.remove()); // no speech bubble, emote or Easy-mode labels (their colours come from CSS)
  c.setAttribute('xmlns','http://www.w3.org/2000/svg'); c.setAttribute('width',w); c.setAttribute('height',h);
  c.insertAdjacentHTML('afterbegin',`<defs>${$('#gdefs').innerHTML}</defs>`);
  const xml=new XMLSerializer().serializeToString(c);
  return new Promise((ok,bad)=>{
    const img=new Image();
    img.onload=()=>{try{const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');
      g.fillStyle='#231b2e';g.fillRect(0,0,w,h);g.drawImage(img,0,0,w,h);ok(cv.toDataURL('image/png'));}catch(e){bad(e);}};
    img.onerror=bad; img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);
  });
}
function savePng(url,name){
  const p=P(); if(p){p.stats.snaps++;save();}
  if(window.AndroidBridge&&typeof window.AndroidBridge.saveImage==='function'){window.AndroidBridge.saveImage(url.split(',')[1],name);}
  else{try{const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),500);toast('Picture saved 📷');}catch(e){toast('Saving pictures is not supported here');}}
  checkStickers();
}
const snapName=what=>`hangout-${what}-${new Date().toISOString().slice(0,10)}.png`.replace(/[^a-z0-9.-]+/gi,'-').toLowerCase();
function snapRoom(){
  const p=P(); if(!p) return; SFX.snap(); flashSnap();
  return svgPng(roomSvg,1500,1050).then(url=>savePng(url,snapName(p.name+'-'+ROOM_NAMES[roomNo])),()=>toast('Hmm, the picture did not work'));
}
function snapCard(c){
  const d=document.createElement('div'); d.innerHTML=cardSVG(c); const s=d.querySelector('svg'); if(!s) return;
  const vb=(s.getAttribute('viewBox')||'0 0 270 380').split(/[\s,]+/).map(Number); SFX.snap();
  return svgPng(s,Math.round(vb[2]*3),Math.round(vb[3]*3)).then(url=>savePng(url,snapName('card-'+String(c.no).padStart(3,'0'))),()=>toast('Hmm, the picture did not work'));
}
function flashSnap(){const f=document.createElement('div');f.className='snap-flash';document.body.appendChild(f);setTimeout(()=>f.remove(),450);}
$('#roomSnapBtn').onclick=()=>snapRoom();

STICKERS.push(
  stk('snap1','art','📷','Say Cheese!','circle','Save a picture of your room or a photocard (📷)',1,p=>p.stats.snaps)
);
