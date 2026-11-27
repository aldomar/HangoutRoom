'use strict';
/* =========================================================
   76. 🧭 GETTING AROUND (v1.85): one end box for every round
   Navigation rules 1 and 4 (CLAUDE.md, docs/NAVIGATION.md). Every game round ends on endBox():
   ⬅ + the icon and name of where it goes on the left (gray), extra choices in the middle, and 🔁 Again / ▶ Next / 🎲 on the
   right (pink). Every button starts with an icon, so a child who can't read can tell them apart by picture, color and place.
   The buttons wait NAV_WAIT ms before they take a tap (#modalBtns.nav-wait), so a quick tap left over from the game can't
   press one by accident. NAV_PLACES names every place a ⬅ can go; 'room' is the room on screen (the one the game was
   opened from), so leaving Soccer says ⬅ 🌳 Backyard. v1.86 uses the same places for the top bars' Back buttons.
   A new game ends its rounds with endBox, and its ⬅ goes exactly one step back (to the room, the list, the pet menu…).
   ========================================================= */
const NAV_WAIT=500;
const NAV_PLACES={
  room:()=>{const r=roomInfo(roomNo);return {icon:r.icon,name:r.name};},
  settings:{icon:'⚙️',name:'Settings'}, closet:{icon:'👗',name:'Closet'}, pet:{icon:'🐾',name:'Pet'},
  songs:{icon:'🎵',name:'Songs'}, loops:{icon:'🎵',name:'Loops'}, music:{icon:'🎹',name:'Music'}, stage:{icon:'🎤',name:'Stage'},
  puzzles:{icon:'🧩',name:'Puzzles'}, levels:{icon:'🛠️',name:'Levels'}, games:{icon:'📚',name:'Games'},
  paths:{icon:'🛤️',name:'Paths'}, cards:{icon:'🃏',name:'Cards'}, play:{icon:'🧸',name:'Play'}, pictures:{icon:'🖍️',name:'Pictures'}
};
function navPlace(k){const v=NAV_PLACES[k]||NAV_PLACES.room;return typeof v==='function'?v():v;}
const navBackText=k=>{const v=navPlace(k);return `⬅ ${v.icon} ${v.name}`;};

/* ---------- ⬅ the top bars' Back buttons (v1.86, rules 2 and 3) ----------
   Every top-bar Back has class nav-bk and data-place. backBtn(el, place) draws ⬅ + the place's icon + its name (the name hides
   on a narrow phone, CSS) and names it for Read to me. show() redraws every Back on the screen it opens (navBacks), so 'room'
   always shows the room the screen was opened from; screens with steps call backBtn as they change step. */
function backBtn(el,place){
  if(typeof el==='string') el=$(el); if(!el) return;
  const v=navPlace(place); el.dataset.place=place;
  el.innerHTML=`⬅ <i class="nb-ic">${v.icon}</i><span class="nb-t"> ${esc(v.name)}</span>`;
  el.setAttribute('aria-label',`Back to ${v.name}`);
}
function navBacks(n){const s=$('#scr-'+n); if(s) s.querySelectorAll('.nav-bk').forEach(b=>backBtn(b,b.dataset.place||'room'));}

// o = {title, body, back:{to, on}, mid:[{text, on}], go:{text, on}}. Every text starts with its icon; go is optional.
function endBox(o){
  const btns=[{text:navBackText(o.back.to),cls:'ghost nav-back',on:o.back.on}]
    .concat((o.mid||[]).map(m=>({text:m.text,cls:'nav-mid',on:m.on})));
  if(o.go) btns.push({text:o.go.text,cls:'pink nav-go',on:o.go.on});
  modal(o.title,o.body,btns);
  const c=$('#modalBtns'); c.classList.add('nav-wait');
  clearTimeout(endBox.t); endBox.t=setTimeout(()=>c.classList.remove('nav-wait'),NAV_WAIT);
}
const endBoxOpen=()=>!$('#modal').classList.contains('hidden')&&!!$('#modalBtns .nav-back');

/* ---------- ⏸️ Back during a round (v1.87, rule 5) ----------
   Back asks only when leaving would lose something (owner, 2026-11-27): a match, a song, a show, a duel half played. Everywhere
   else, and between rounds, it leaves at once. navBack(leave) is called by every Back that can leave a round (the top bars and
   androidBack). Mid-round it opens the pause box: ⬅ + place on the left (small, gray), a big pink ▶ Keep playing on the right.
   While it is open NAV_HOLD.on (08) is true and the main loop passes dt = 0 (99), so the ball, pitch or kick stays exactly where it was;
   modal() and closeModal() turn it off (08), so no box can leave a game frozen. The Stage uses its own ⏸️ Paused (14), which
   also stops the music; the Runway walk holds its CSS walk and its timers (52). A new game that can lose a round adds a line to navMid. */
SPK_FIXED.navPaused='Paused. Tap play to keep playing, or the arrow to go back.'; // 🗣️ said when the pause box opens (section 65)
function navMid(){
  if(!P()) return null;
  if(cur==='soccer'){
    if(TGS.on) return TGS.state!=='done'&&(TGS.shots.length>0||TGS.state!=='aim');
    if(socKeep()) return KP.state!=='done'&&KP.state!=='off'&&(KP.saves.length>0||!['ready','off'].includes(KP.state));
    if(socTrick()) return TR.state!=='done'&&(TR.hit.some(Boolean)||TR.state==='fly'||TR.state==='result');
    return SOC.state!=='done'&&(SOC.kicks.length>0||SOC.state!=='aim');
  }
  if(cur==='ball'){
    if(bfDuel()) return BF.state!=='done'&&(BDL.res.length>0||!['ready','off'].includes(BF.state));
    const m=bfMode();
    if(m==='catch') return CT.state!=='done'&&CT.state!=='off'&&(CT.res.length>0||CT.state!=='ready');
    if(m==='derby') return ['wind','pitch','fly','result'].includes(HR.state);
    return BF.state!=='done'&&BF.state!=='off'&&(BF.res.length>0||BF.state!=='ready');
  }
  if(cur==='stage') return STG.state==='play'&&!STG.paused;
  if(cur==='runway') return RW.walking;
  if(cur==='brain') return BR.view==='duo'&&!TGM.done&&TGM.cards.some(c=>c.got>=0);
  return false;
}
function navBack(leave){
  if(!navMid()){leave();return;}
  if(cur==='stage'){if(AC)AC.suspend();stPause();return;} // the Stage's own ⏸️ (its ⬅ is #stgLeave, v1.87)
  navLeave(leave);
}
// The pause box. Tapping outside does nothing (like every box); the Android Back key presses its ⬅ (99).
function navLeave(leave){
  const bk=$('#scr-'+cur+' .topbar .nav-bk'), place=bk&&bk.dataset.place||'room';
  if(cur==='runway') rwHold();
  modal('⏸️ Paused',`<div class="nl-pic" aria-hidden="true">⏸️</div>`,[
    {text:navBackText(place),cls:'ghost nav-back nl-leave',on:()=>{NAV_HOLD.on=false;if(cur==='runway')rwHeldDrop();leave();}},
    {text:'▶ Keep playing',cls:'pink nav-go nl-stay',on:()=>{NAV_HOLD.on=false;if(cur==='runway')rwResume();}}]);
  NAV_HOLD.on=true;
  const c=$('#modalBtns'); c.classList.add('nav-wait'); clearTimeout(endBox.t); endBox.t=setTimeout(()=>c.classList.remove('nav-wait'),NAV_WAIT);
  tell(SPK_FIXED.navPaused);
}
const navLeaveOpen=()=>!$('#modal').classList.contains('hidden')&&!!$('#modalBtns .nl-leave');

/* ---------- 👤 Whose room (v1.88, rule 6) ----------
   Every coin pill (.coinsDisp) starts with a round picture of the room's buddy, in the room's color, with its badge, so it is always
   clear whose room is open, even for a child who can't read. The picture is drawn once per look (an <img>, like the Runway's), so
   the #fuzz filter is never redrawn. updateCoins (08) calls whoChips. Tapping the pill says whose room it is and does nothing else
   (Read to me says its aria-label; with no voice a short toast shows it). */
const WHO={key:'',img:''};
function whoArt(p){
  const key=JSON.stringify(p.look); if(WHO.key===key) return WHO.img; WHO.key=key;
  const svg=mascotSVG(p.look,'42 34 116 116','width="116" height="116"').replace('>',`><defs>${$('#gdefs').innerHTML}</defs>`);
  WHO.img='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); return WHO.img;
}
const whoSay=p=>`This is ${p.name}'s room`;
function whoChips(p){
  p=p||P(); if(!p) return;
  const img=whoArt(p), k=p.id+'|'+WHO.key+'|'+p.badge, col=ROOM_COLORS[p.color]||'var(--line)';
  $$('.coinsDisp').forEach(e=>{
    let c=e.querySelector('.who'); if(!c){c=document.createElement('i');c.className='who';c.setAttribute('aria-hidden','true');e.prepend(c);}
    if(c.dataset.k!==k){c.dataset.k=k;c.innerHTML=`<img alt="" src="${img}"><b>${esc(p.badge)}</b>`;}
    c.style.borderColor=col; e.setAttribute('role','button'); e.setAttribute('aria-label',whoSay(p));
  });
}
document.addEventListener('click',e=>{
  const d=e.target.closest('.coinsDisp'), p=P(); if(!d||!p) return;
  const c=d.querySelector('.who'); if(c){c.classList.remove('who-hi');void c.offsetWidth;c.classList.add('who-hi');}
  if(!(readOn(p)&&canSpeak())) toast(`${p.badge} ${p.name}'s room · 🪙 ${p.coins}`);
});

/* ---------- 🔒 Little mode's grown-up check with no PIN (v1.88, issue 10) ----------
   With a PIN, the 3 s hold asks for it (as before). With no PIN, a second step a toddler won't do by chance: type 4 numbers written
   as words. One try: a wrong one closes the box, so it starts again with the hold. */
const LOCK_WORDS=['zero','one','two','three','four','five','six','seven','eight','nine'];
function lockCheck(then){
  if(DB.settings.pin){askPin(then);return;}
  const want=Array.from({length:4},()=>Math.floor(Math.random()*10)).join('');
  lockCheck.want=want; // read by the smoke test
  pinPad('🔒 Grown-ups',c=>{closeModal(); if(c!==want){SFX.locked();toast('🔒 Still locked');return true;} then(); return true;},
    [{text:'✖ Close',cls:'ghost'}]);
  $('#pinDots').insertAdjacentHTML('beforebegin',`<p class="lk-ask">Type <b>${[...want].map(d=>LOCK_WORDS[d]).join(' · ')}</b></p>`);
}
