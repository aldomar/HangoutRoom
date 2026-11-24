'use strict';
/* =========================================================
   34. GROWN-UP HELPERS (v1.30)
   💾 Backup reminder: settings.lastBackup (ms, belongs to the device like the PIN) is set when a backup file is saved
   or the code is copied. On Android the wrapper calls backupSaved() only after the file was really written.
   ⚙️ Settings shows "Last backup: 12 days ago" in small grown-up text. Nothing for the children, no pop-ups.
   🔊 Read to me: tapping a button also says its name, through AndroidBridge.speak(text) (Android's built-in offline
   voice). p.speak is null (follow Easy mode: on in Easy mode, off otherwise) or true/false once someone switches it in
   Settings. The switch only shows when the app can speak: the Android wrapper, or (since v1.59, for iPad/iPhone) a voice
   that lives on the device (speechSynthesis, localService only, so no words ever leave it). speakText(t) says it either way.
   📷 Snapshot: the 📷 button under 🌙 saves a picture of the room on screen; "📷 Save picture" on a photocard saves
   the card. The SVG is drawn into a canvas and saved as a PNG through AndroidBridge.saveImage(base64, fileName)
   (Android's save picker) or a download in the browser.
   ========================================================= */
/* ---------- backup reminder ---------- */
function backupSaved(){DB.settings.lastBackup=Date.now();save();if(cur==='profiles')bkNag();} // bkNag: section 64
function lastBackupText(){
  const t=Number(DB.settings.lastBackup)||0; if(!t) return '💾 Last backup: never';
  const days=Math.floor((Date.now()-t)/86400000);
  return '💾 Last backup: '+(days<=0?'today':days===1?'yesterday':days+' days ago');
}

/* ---------- read to me ---------- */
let webVoice=null; // (v1.59) an English voice built into the device; online voices are never used
function findWebVoice(){
  try{const vs=window.speechSynthesis.getVoices().filter(v=>v.localService&&/^en/i.test(v.lang));
    webVoice=vs.find(v=>/^en[-_]US/i.test(v.lang)&&v.default)||vs.find(v=>/^en[-_]US/i.test(v.lang))||vs[0]||null;}catch(_){webVoice=null;}
}
if(window.speechSynthesis){findWebVoice();try{window.speechSynthesis.addEventListener('voiceschanged',findWebVoice);}catch(_){}}
const hasBridgeVoice=()=>!!(window.AndroidBridge&&typeof window.AndroidBridge.speak==='function');
const canSpeak=()=>hasBridgeVoice()||!!webVoice;
// A little slower in 🧸 Little and 🐣 Easy rooms (v1.70). The Android voice keeps its own speed.
const spkRate=()=>{const p=cur==='profiles'?null:P();return p&&p.easy?0.8:0.95;};
function speakText(t){
  if(!t) return;
  if(hasBridgeVoice()){try{window.AndroidBridge.speak(t);}catch(_){}return;}
  if(!webVoice) return;
  try{const S=window.speechSynthesis;S.cancel();const u=new SpeechSynthesisUtterance(t);u.lang=webVoice.lang;u.rate=spkRate();try{u.voice=webVoice;}catch(_){}S.speak(u);}catch(_){}
}
const readOn=p=>!!p&&(p.speak===null?p.easy:p.speak);
const HOT_WORDS={shelf:'Fidget shelf',closet:'Closet',desk:'Art desk',photo:'Photocards',window:'Backyard',goal:'Soccer',stage:'Stage',
  code:'Code Lab',brain:'Brain games',music:'Music Maker',pet:'Pet',gift:'A gift!',ballfield:'Ball field'};
function speakLabel(el){
  if(el.classList&&el.classList.contains('say-btn')) return ''; // 🔊 says the screen's line instead (section 65)
  if(el.dataset.hot==='desk'&&lockOn()) return 'Play'; // 🧸 Little mode: the desk opens Play (section 66)
  if(el.dataset.hot) return lockHotOk(el.dataset.hot)?HOT_WORDS[el.dataset.hot]||'':''; // 🧸 a wiggle says nothing (section 66)
  if(el.id==='lockBtn'&&lockOn()) return ''; // never tells a little one to press and hold
  const tn=el.querySelector&&el.querySelector('.tn');
  const raw=el.getAttribute('aria-label')||(tn&&tn.textContent)||el.textContent||'';
  const t=raw.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}]/gu,'').replace(/[✔✖⬅➜•·]/g,' ').replace(/\s+/g,' ').trim();
  return t.length>60?'':t;
}
let lastSaid={t:'',at:0};
// Since v1.70 the name is said just after the tap has done its work: if the tap opened a place with its own spoken line
// (spkCheck, section 65), that line is said instead. 🔇 (the room's sound button) also keeps it quiet.
document.addEventListener('click',e=>{
  const el=e.target.closest('button,.tile,[data-hot],.chip'), t=el?speakLabel(el):'';
  setTimeout(()=>{
    if(spkCheck()||Date.now()-spkToldAt<400) return; // a place's line, or something just told (the buddy's bubble…)
    const p=cur==='profiles'?null:P(); if(!t||!canSpeak()||!readOn(p)||!DB.settings.sound) return;
    if(cur==='stage'&&typeof STG!=='undefined'&&STG.state==='play') return; // never talk over a song
    const now=Date.now(); if(t===lastSaid.t&&now-lastSaid.at<800) return; lastSaid={t,at:now};
    speakText(t);
  },0);
},true);

/* ---------- snapshots ---------- */
function svgPng(svgEl,w,h){
  const c=svgEl.cloneNode(true);
  c.querySelectorAll('#bubble,#emoteFx,.sign').forEach(n=>n.remove()); // no speech bubble, emote or Easy-mode labels (their colors come from CSS)
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
  else if(typeof iosPicture==='function'&&iosPicture(url)){} // iPad/iPhone: press and hold to save (section 58)
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

/* ---------- 🔊/🔇 sound button (v1.67) ---------- */
// The round button under 🔍 in the room switches every sound on or off (DB.settings.sound, the same switch as in Settings).
// The room music stops with it. On an iPad the app plays even when the device is muted (section 58), so this is the quick way.
function setSound(on){const s=DB.settings;s.sound=!!on;save();if(!s.sound)stopMusic();else if(s.music)startMusic();soundBtn();}
function soundBtn(){const b=$('#soundBtn');if(!b)return;const on=!!DB.settings.sound;
  b.textContent=on?'🔊':'🔇'; b.setAttribute('aria-label',on?'Sound off':'Sound on'); b.classList.toggle('on',!on);}
$('#soundBtn').onclick=()=>{const on=!DB.settings.sound;setSound(on);if(on)SFX.happy();else toast('🔇 Sound is off');};

STICKERS.push(
  stk('snap1','art','📷','Say Cheese!','circle','Save a picture of your room or a photocard (📷)',1,p=>p.stats.snaps)
);
