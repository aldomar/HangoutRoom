'use strict';
/* =========================================================
   66. 🧸 LITTLE MODE (v1.71): a lock that keeps a little one in the safe, easy parts of the app.
   p.little.lock (per room, saved): on by default for 🧸 Little rooms (setBand), a switch in ⚙️ Settings → Level.
   While locked (lockOn()), body.locked hides the grown-up and older-kid parts with CSS (app.css, "Little mode"), and:
   - show() sends any screen not in LOCK_SCREENS back to the room (lockGuard: one check, so no path gets out),
     and every game opens on Easy; Soccer only has Kick and Keep, the Ball Field only Bat and Catch;
   - only her room and the Backyard (LOCK_ROOMS): the room tabs and goRoom() follow it, the 🗺️ map is hidden;
   - the desk opens 🧸 Play (its sign says Play) and the corkboard loses its sign; a room hotspot not in LOCK_HOTS
     just wiggles (lockWiggle): nothing opens and nothing is said; no visitors;
   - Android Back never leaves the room (show('profiles') comes back to the room), and the app reopens into the room.
   🔒 #lockBtn in the room's top bar: press and hold LOCK_HOLD ms (a ring fills), then the PIN, or with no PIN 4 numbers written as words (lockCheck, v1.88).
   Unlocked lasts until 🔒 Lock is tapped or the app is opened again (LOCK.open is never saved).
   🎨 Dress like… (every room's Closet): dresses the buddy in pieces she owns from one theme (dressLike).
   ========================================================= */
const LOCK_SCREENS=['room','little','fidget','closet','soccer','ball','brain','garden','walk','kitchen'];
const LOCK_ROOMS=[1,3,6]; // her room and the Backyard (the goal, the bat rack, the chalkboard and the shed)
const LOCK_HOTS=['desk','shelf','closet','window','goal','brain','garden','ballfield','pet','gift','recipes','sink'];
const LOCK_HOLD=3000;
const LOCK={open:'',hold:null,ate:false};
const lockSet=p=>!!(p&&p.little&&p.little.lock);
function lockOn(){const p=P();return lockSet(p)&&LOCK.open!==p.id;}
const lockHotOk=h=>!lockOn()||LOCK_HOTS.includes(h);

// Called first thing by show() (section 9).
function lockGuard(n){
  if(!lockOn()) return n;
  if(!LOCK_SCREENS.includes(n)) n='room';
  if(n==='room'&&!LOCK_ROOMS.includes(roomNo)) roomNo=1;
  const p=P();
  if(n==='soccer'&&p.soccer.mode==='trick') p.soccer.mode='kick';
  if(n==='ball'&&p.ball.mode==='derby') p.ball.mode='bat';
  return n;
}
function applyLock(){
  const p=cur==='profiles'?null:P(), on=!!p&&lockOn(), b=$('#lockBtn');
  document.body.classList.toggle('locked',on);
  if(!b) return;
  b.classList.toggle('hidden',!lockSet(p)); b.classList.toggle('open',lockSet(p)&&!on);
  b.querySelector('.lk-t').textContent=on?'':' Lock';
  b.setAttribute('aria-label',on?'Grown-ups: press and hold':'Lock Little mode');
}
function lockWiggle(h){
  const g=$(`#roomSvg [data-hot="${h}"]`); if(!g) return;
  g.classList.remove('lk-wig'); void g.getBoundingClientRect(); g.classList.add('lk-wig');
  clearTimeout(lockWiggle.t); lockWiggle.t=setTimeout(()=>g.classList.remove('lk-wig'),600);
}
const lockLine=()=>roomNo===6?'Tap the recipe book or the sink!':roomNo===3?'Tap the goal, the bat rack, the chalkboard or the shed!':'Tap Play, the shelf, the closet, your buddy or your pet!';

/* ---------- 🔒 press and hold ---------- */
function lockUnlock(){ // the PIN, or with no PIN 4 numbers written as words (lockCheck, section 76, v1.88)
  lockCheck(()=>{const p=P();if(!p)return;LOCK.open=p.id;applyLock();renderRoom();SFX.happy();
    toast('🔓 Unlocked for grown-ups. Tap 🔒 Lock to lock it again.');});
}
function lockRelock(){
  if(decorating) exitDecorate(true);
  LOCK.open=''; if(!LOCK_ROOMS.includes(roomNo)) roomNo=1;
  SFX.click(); show('room'); toast('🔒 Little mode is on');
}
function lockShake(){const b=$('#lockBtn');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');}
{
  const b=$('#lockBtn');
  const stop=()=>{clearTimeout(LOCK.hold);LOCK.hold=null;b.classList.remove('holding');};
  b.addEventListener('pointerdown',e=>{
    LOCK.ate=false; if(!lockOn()) return;
    e.preventDefault(); stop(); b.classList.add('holding');
    LOCK.hold=setTimeout(()=>{stop();LOCK.ate=true;lockUnlock();},LOCK_HOLD);
  });
  const let_=()=>{if(LOCK.hold){stop();lockShake();}};
  ['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,let_));
  b.addEventListener('click',()=>{if(LOCK.ate){LOCK.ate=false;return;} // the hold that just unlocked it
    if(!lockOn()&&lockSet(P())) lockRelock();});
}
// The app opens straight back into a locked room (section 99).
function lockStart(){if(lockSet(P())&&lockOn())enterRoom();}

/* ---------- ⚙️ Settings → Level: the switch ---------- */
const lockSay=on=>on?'🔒 On: only the easy, safe parts. Press and hold 🔒, then the PIN (or 4 numbers if there is none) to leave.':'🔓 Off: the whole app.';
function lockRow(on){return `<button class="btn ghost lock-sw" id="stLock" aria-pressed="${on}">🧸 Little mode: <b>${on?'On':'Off'}</b></button><div class="band-say" id="stLockSay">${lockSay(on)}</div>`;}
function lockRowSet(on){const b=$('#stLock');if(!b)return;b.setAttribute('aria-pressed',on);b.querySelector('b').textContent=on?'On':'Off';$('#stLockSay').textContent=lockSay(on);}

/* ---------- 🎨 Dress like… (the Closet, every room) ---------- */
const DRESS_SKIP=['fur','kind','face']; // like Surprise me, it keeps the buddy, fur and face
const DRESS_NO=['all','yard','dream'];
// theme -> [[cat, id]…] of the clothes she owns
function dressThemes(p){
  const out={};
  Object.keys(CLOSET).forEach(cat=>{if(DRESS_SKIP.includes(cat))return;
    CLOSET[cat].items.forEach(it=>{if(!isOwned(p,cat,it))return;
      themesOf(cat+':'+it.id,it).forEach(t=>{if(THEMES[t]&&!DRESS_NO.includes(t))(out[t]=out[t]||[]).push([cat,it.id]);});});});
  return out;
}
// Puts on one owned piece of the theme in each slot that has one (a different one when she can), keeps the rest.
function dressLike(t){
  const p=P(), list=dressThemes(p)[t]; if(!list) return 0;
  const by={}; list.forEach(([c,id])=>(by[c]=by[c]||[]).push(id));
  Object.entries(by).forEach(([c,ids])=>{const other=ids.filter(id=>id!==p.look[c]), pool=other.length?other:ids;
    p.look[c]=pool[Math.floor(Math.random()*pool.length)];});
  save(); SFX.happy(); renderCloset(); hopCloset();
  return Object.keys(by).length;
}
function dressModal(){
  const p=P(); if(!p) return; SFX.click();
  const th=dressThemes(p), keys=Object.keys(THEMES).filter(t=>th[t]);
  modal('🎨 Dress like…',keys.length?`<div class="dress-themes">${keys.map(t=>`<button class="dress-th" data-dress="${t}" aria-label="${THEMES[t].name}"><i>${THEMES[t].icon}</i><span class="tn">${THEMES[t].name}</span></button>`).join('')}</div>`
    :`<p style="text-align:center">Clothes with a theme chip (like 🦇 or 🦕) show up here once they are yours.</p>`,
    [{text:'✖ Close',cls:'ghost'}]);
}
$('#dressBtn').onclick=dressModal;
$('#modal').addEventListener('click',e=>{const b=e.target.closest('[data-dress]');if(!b)return;closeModal();dressLike(b.dataset.dress);});
