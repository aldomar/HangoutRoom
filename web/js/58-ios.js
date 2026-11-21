'use strict';
/* =========================================================
   58. IPAD + IPHONE (v1.59)
   The same page runs on iOS as a Home Screen web app: it is hosted on GitHub Pages, opened once in Safari, then
   Share → Add to Home Screen. Everything here is feature-detected, so the file:// version and the Android APK act
   exactly as before.
   📦 Offline: over https only, sw.js (the service worker, next to index.html) keeps every app file on the device.
      It never fetches anything but the app's own files. Its FILES list must name every web/js file (the smoke test checks).
   🗂️ The app manifest link is only added over https (a file:// page can't read it, and would log an error).
   💾 Saves: in the Home Screen app, iOS is asked to keep storage for good (navigator.storage.persist()).
   🔊 Sound: navigator.audioSession 'playback' (iOS 17+) so sounds play like a game's; extra unlocks on touchend/click,
      because iOS only lets audio start from those (pointerdown from a finger doesn't count there).
   📳 iosTick(): iPhones have no navigator.vibrate, but toggling a hidden switch (<input type=checkbox switch>, iOS 18+)
      gives the phone's own small tap. vibrate() (section 7) calls it. iPads have no buzzer, so nothing happens there.
   📤 iosSaveFile(): the 💾 backup file goes through the iOS share sheet (Save to Files). 📷 Pictures open in a box:
      press and hold the picture, then Save to Photos (iosPicture).
   🤏 No pinch zoom (iOS ignores user-scalable=no in the viewport tag).
   ========================================================= */
const IS_IOS=/iP(ad|hone|od)/.test(navigator.platform||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let IOS_FAKE=false; // only the smoke test sets this, to try the iOS-only paths in a desktop browser
const onIOS=()=>IS_IOS||IOS_FAKE;
const IS_STANDALONE=navigator.standalone===true||(!!window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches);

/* ---------- offline + manifest (hosted copy only) ---------- */
if(location.protocol==='https:'){
  const l=document.createElement('link'); l.rel='manifest'; l.href='manifest.webmanifest'; document.head.appendChild(l);
  if('serviceWorker' in navigator) window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});
}
if(IS_STANDALONE&&navigator.storage&&navigator.storage.persist) try{navigator.storage.persist().catch(()=>{});}catch(_){}

/* ---------- sound ---------- */
try{if(navigator.audioSession) navigator.audioSession.type='playback';}catch(_){}
if(IS_IOS) ['touchend','click'].forEach(t=>document.addEventListener(t,()=>{ac();},{capture:true,passive:true}));

/* ---------- pinch zoom ---------- */
if(IS_IOS) ['gesturestart','gesturechange'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));

/* ---------- iPhone haptics ---------- */
let iosTickEl=null, iosTickAt=0;
function iosTick(ms){
  if(!onIOS()) return;
  const now=Date.now(); if(now-iosTickAt<45) return; iosTickAt=now; // one tap at a time, like a real buzz
  if(!iosTickEl){
    const lab=document.createElement('label'); lab.className='ios-tick'; lab.setAttribute('aria-hidden','true');
    lab.innerHTML='<input type="checkbox" switch tabindex="-1">';
    lab.addEventListener('click',e=>e.stopPropagation());
    document.body.appendChild(lab); iosTickEl=lab;
  }
  try{iosTickEl.click();}catch(_){}
}

/* ---------- saving files ---------- */
// The backup file: the share sheet's "Save to Files". Returns true when iOS took care of it.
function iosSaveFile(txt,name){
  if(!onIOS()||!navigator.share||!navigator.canShare||typeof File!=='function') return false;
  let f; try{f=new File([txt],name,{type:'application/json'});}catch(_){return false;}
  if(!navigator.canShare({files:[f]})) return false;
  navigator.share({files:[f]}).then(()=>{backupSaved();toast('Backup file saved 💾');},e=>{
    if(e&&e.name==='AbortError') return; // closed the sheet: nothing to do
    toast('Saving did not work here — use Copy code');
  });
  return true;
}
// A picture: shown big; press and hold it to save it to Photos. Returns true when shown.
function iosPicture(url){
  if(!onIOS()) return false;
  modal('📷 Your picture',`<img class="ios-pic" src="${url}" alt="Your picture"><div class="ios-pic-tip">Press and hold the picture, then tap <b>Save to Photos</b>.</div>`,[{text:'Done',cls:'pink'}]);
  return true;
}
