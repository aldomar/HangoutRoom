'use strict';
/* =========================================================
   50. I SPY (v1.49): find things in her own room
   The 🔍 button on the room picture (next to 🌙) starts I Spy in whichever room is on screen. A clue card takes the top
   bar's place: "Find the Lava Lamp!" with a picture (⭐), the name only (⭐⭐), or a hint like "something 🦇 spooky" (⭐⭐⭐,
   any thing with that theme counts). Easy mode always uses ⭐. She taps the thing in the room: a tap on it or close to it
   counts. A wrong tap only says "Keep looking"; 💡 makes the right thing shimmer. No timer, no score, nothing to lose.
   What can be spied: the decorations on screen plus the room's own furniture (SPY_FURN, by its data-hot id), skipping
   anything too small or hidden behind other things (spySeen). A round is SPY_ROUND finds (fewer in a room with fewer
   things), then a cheer box. +SPY_COINS a round, SPY_DAILY a day in all (p.spy.pay).
   🌙 At night the room goes dark and a 🔦 flashlight circle follows her finger (spyDark; only one circle moves).
   Saved in p.spy {lvl 1-3, rooms[] (room numbers with a finished round), pay{day,n}}, p.stats.spied / spyRounds.
   No main loop: sparkles and the hint ring are short CSS animations.
   ========================================================= */
const SPY_ROUND=5, SPY_COINS=2, SPY_DAILY=10, SPY_MIN=3;
const SPY_LVLS={1:'⭐',2:'⭐⭐',3:'⭐⭐⭐'};
// The rooms' own furniture that can be spied, by data-hot id (the pet is named in spyThings)
const SPY_FURN={window:'Window',photo:'Corkboard',shelf:'Fidget Shelf',closet:'Closet',desk:'Art Desk',stage:'Stage Sign',
  music:'Keyboard',code:'Computer',goal:'Soccer Goal',garden:'Garden Shed',brain:'Chalkboard',ballfield:'Bat Rack',pet:'Pet'};
// ⭐⭐⭐ hints, by theme chip id (section 33). 'dream' is left out: there are only a few.
const SPY_THEME_WORDS={emo:'spooky',cute:'cute',sport:'sporty',stage:'for the stage',dino:'dino',space:'from space',ride:'with wheels',
  hero:'for a hero',cozy:'cozy',cafe:'yummy',ocean:'from the ocean',farm:'from the farm',yard:'for outside'};
const SPY={on:false,clue:null,found:0,need:SPY_ROUND,used:[],lastTheme:'',done:false,light:{x:500,y:420}};

const spyToday=()=>fpDay();
const spyLvl=p=>p.easy?1:(SPY_LVLS[p.spy.lvl]?p.spy.lvl:1);
const spyPick=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- what can be spied ---------- */
// Big enough to tap and not hidden: at least one of a few points inside it shows this thing on top.
function spySeen(t){
  const r=t.el.getBoundingClientRect(); if(r.width<22||r.height<22) return false;
  return [[.5,.5],[.3,.3],[.7,.3],[.3,.7],[.7,.7],[.5,.15],[.5,.88]].some(([a,b])=>{
    const e=document.elementFromPoint(r.left+r.width*a,r.top+r.height*b); return !!e&&t.el.contains(e);});
}
function spyThings(){
  const p=P(), R=curRoom(p), out=[];
  roomSvg.querySelectorAll('.deco').forEach(g=>{
    const it=R.items.find(i=>i.uid===g.dataset.uid), D=it&&DECOR[it.type]; if(!D) return;
    out.push({key:'decor:'+it.type,el:g,name:D.name.replace(/^My /,''),themes:themesOf('decor:'+it.type,D).filter(t=>SPY_THEME_WORDS[t])});
  });
  roomSvg.querySelectorAll('[data-hot]').forEach(g=>{
    const h=g.dataset.hot; if(!SPY_FURN[h]) return;
    out.push({key:'hot:'+h,el:g,name:h==='pet'&&!petKind(p)?'Pet Bed':SPY_FURN[h],themes:[]});
  });
  return out.filter(spySeen);
}
// A small picture of the thing for the ⭐ clue: a copy of its drawing, framed by its own box.
function spyPic(el){
  let b; try{b=el.getBBox();}catch(_){return '';}
  const c=el.cloneNode(true); c.querySelectorAll('.sign').forEach(s=>s.remove());
  ['transform','id','class','data-hot','data-uid','data-piece'].forEach(a=>c.removeAttribute(a));
  const pad=6, x=Math.round(b.x-pad), y=Math.round(b.y-pad), w=Math.round(b.width+pad*2), h=Math.round(b.height+pad*2);
  return `<svg viewBox="${x} ${y} ${w} ${h}" aria-hidden="true">${c.outerHTML}</svg>`;
}
// A thing's box in the room picture's own units (for the hint ring and sparkles)
function spyBox(el){
  const r=el.getBoundingClientRect(), a=toSvg({clientX:r.left,clientY:r.top}), b=toSvg({clientX:r.right,clientY:r.bottom});
  return {x:a.x,y:a.y,w:b.x-a.x,h:b.y-a.y,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};
}

/* ---------- starting, clues, ending ---------- */
function spyStart(){
  const p=P(); if(!p||decorating||SPY.on) return;
  SFX.click(); emoteBar(false);
  SPY.on=true; document.body.classList.add('spying'); // hides the top bar and the room tabs, so they cover nothing
  renderRoom();
  const n=spyThings().length;
  if(n<SPY_MIN){spyEnd(true);renderRoom();say('Put out a few more things first! 🛋️');return;}
  spyRound();
}
function spyRound(){
  const p=P(); if(!p||!SPY.on) return;
  SPY.found=0; SPY.used=[]; SPY.done=false; SPY.lastTheme='';
  SPY.need=Math.min(SPY_ROUND,new Set(spyThings().map(t=>t.key)).size);
  $('#spyCard').classList.remove('hidden'); spyNext();
}
function spyNext(){
  const p=P(); if(!p||!SPY.on) return;
  const all=spyThings();
  if(all.length<SPY_MIN){spyEnd();say('Put out a few more things first! 🛋️');return;}
  const lvl=spyLvl(p);
  let pool=all.filter(t=>!SPY.used.includes(t.key)); if(!pool.length){SPY.used=[];pool=all;}
  if(lvl===3&&pool.some(t=>t.themes.length)) pool=pool.filter(t=>t.themes.length); // hints need a thing with a theme
  const t=spyPick(pool);
  if(lvl===3&&t.themes.length){
    const ths=t.themes.filter(x=>x!==SPY.lastTheme), th=spyPick(ths.length?ths:t.themes); SPY.lastTheme=th;
    SPY.clue={key:t.key,theme:th,pic:'',text:`Find something ${THEMES[th]?THEMES[th].icon+' ':''}${SPY_THEME_WORDS[th]}!`,ok:x=>x.themes.includes(th)};
  } else {
    SPY.clue={key:t.key,theme:'',pic:lvl===1?spyPic(t.el):'',text:`Find the ${t.name}!`,ok:x=>x.key===t.key};
  }
  spyCard(); spySpeak();
}
function spyEnd(quiet){
  SPY.on=false; SPY.clue=null; SPY.done=false;
  document.body.classList.remove('spying'); $('#spyCard').classList.add('hidden');
  const r=$('#spyRing'); if(r) r.remove();
  if(!quiet&&cur==='room') renderRoom();
}
function spyCard(){
  const p=P(), c=SPY.clue; if(!p||!c) return;
  const pic=$('#spyPic'); pic.innerHTML=c.pic; pic.classList.toggle('hidden',!c.pic);
  $('#spyText').textContent=c.text;
  $('#spyDots').innerHTML=Array.from({length:SPY.need},(_,i)=>`<b class="${i<SPY.found?'on':''}"></b>`).join('');
  const lv=$('#spyLvl'); lv.textContent=SPY_LVLS[spyLvl(p)]; lv.classList.toggle('hidden',!!p.easy);
  const sb=$('#spySay'); sb.classList.toggle('hidden',!canSpeak()); sb.setAttribute('aria-label',spyWords(c.text));
}
const spyWords=t=>t.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu,'').replace(/\s+/g,' ').trim();
function spySpeak(force){
  const p=P(), c=SPY.clue; if(!c||!canSpeak()||!(force||readOn(p))) return;
  speakText('I spy. '+spyWords(c.text));
}

/* ---------- taps ---------- */
// The room's click handler (section 9) hands every tap here while I Spy is on.
function spyTap(e){
  const p=P(), c=SPY.clue; if(!p||!c) return;
  const x=e.clientX, y=e.clientY, near=14, all=spyThings().filter(c.ok);
  const hit=all.find(t=>t.el.contains(e.target))||all.find(t=>{const r=t.el.getBoundingClientRect();
    return x>=r.left-near&&x<=r.right+near&&y>=r.top-near&&y<=r.bottom+near;});
  if(!hit){tone(420,0.1,'sine',0.08,520);floatText('👀 Keep looking!',x,y);return;}
  SPY.clue=null; SPY.found++; SPY.used.push(hit.key,c.key); p.stats.spied++; save();
  SFX.happy(); vibrate(12); spySparkle(hit.el); floatText('✨',x,y);
  const r=$('#spyRing'); if(r) r.remove();
  $('#spyDots').innerHTML=Array.from({length:SPY.need},(_,i)=>`<b class="${i<SPY.found?'on':''}"></b>`).join('');
  setTimeout(()=>{if(!SPY.on)return; if(SPY.found>=SPY.need) spyRoundDone(); else spyNext();},750);
}
function spySparkle(el){
  const b=spyBox(el), rr=Math.max(40,Math.min(130,Math.max(b.w,b.h)/2+16));
  const pts=[0,1,2,3,4,5].map(i=>{const a=i*Math.PI/3;return [b.cx+Math.cos(a)*rr,b.cy+Math.sin(a)*rr];});
  roomSvg.insertAdjacentHTML('beforeend',`<g class="spy-spark" style="pointer-events:none">${pts.map(([sx,sy],i)=>
    `<path d="${starPath(Math.round(sx),Math.round(sy),i%2?11:15)}" fill="${i%2?'#ff8cc6':'#ffd166'}" stroke="#2b2235" stroke-width="2"/>`).join('')}</g>`);
  const g=roomSvg.lastElementChild; setTimeout(()=>g.remove(),900);
}
// 💡 the right thing shimmers (a dashed gold ring, a few pulses)
function spyHint(){
  const c=SPY.clue; if(!c) return;
  const all=spyThings(), t=all.find(x=>x.key===c.key&&c.ok(x))||all.find(c.ok); if(!t) return;
  SFX.click(); const old=$('#spyRing'); if(old) old.remove();
  const b=spyBox(t.el);
  roomSvg.insertAdjacentHTML('beforeend',`<g id="spyRing" class="spy-ring" style="pointer-events:none"><ellipse cx="${Math.round(b.cx)}" cy="${Math.round(b.cy)}" rx="${Math.round(b.w/2+18)}" ry="${Math.round(b.h/2+18)}" fill="none" stroke="#ffd166" stroke-width="8" stroke-dasharray="16 12"/></g>`);
  clearTimeout(spyHint.t); spyHint.t=setTimeout(()=>{const r=$('#spyRing');if(r)r.remove();},3000);
}
function spyRoundDone(){
  const p=P(); if(!p) return;
  SPY.done=true; p.stats.spyRounds++; if(!p.spy.rooms.includes(roomNo)) p.spy.rooms.push(roomNo);
  if(p.spy.pay.day!==spyToday()) p.spy.pay={day:spyToday(),n:0};
  let line;
  if(p.spy.pay.n+SPY_COINS<=SPY_DAILY){p.spy.pay.n+=SPY_COINS;earn(SPY_COINS,'I Spy');line=`+${SPY_COINS} 🪙`;}
  else {save();line='I Spy coins are full for today. Keep playing for fun ✨';}
  SFX.cheer();
  modal('🔍 Super spy!',`<div class="spy-done"><div class="spy-big">🎉</div>You found ${SPY.need} things!<br><b>${line}</b></div>`,
    [{text:'🔁 Again',cls:'pink',on:()=>spyRound()},{text:'🏠 Done',on:()=>spyEnd()}]);
  checkStickers();
}
// 🔦 at night: a dark layer with one moving hole (and the lamps still glowing a little). renderRoom adds it.
function spyDark(p,R){
  if(!SPY.on||decorating||!isNight(p)) return '';
  const r=p.easy?190:140, L=SPY.light;
  const glow=R.items.filter(i=>i.placed&&NIGHT_GLOW[i.type]).map(i=>{const g=NIGHT_GLOW[i.type];
    return `<circle cx="${Math.round(i.x)}" cy="${Math.round(i.y+g.y)}" r="${Math.round(g.r*0.6)}" fill="url(#ngHole)"/>`;}).join('');
  return `<g id="spyDark" style="pointer-events:none"><mask id="spyMask"><rect x="-300" y="-100" width="1600" height="900" fill="#fff"/>${glow}`
    +`<circle id="spyLight" cx="${L.x}" cy="${L.y}" r="${r}" fill="url(#ngHole)"/></mask>`
    +`<rect x="-300" y="-100" width="1600" height="900" fill="#05040f" opacity=".8" mask="url(#spyMask)"/>`
    +`<circle id="spyBeam" cx="${L.x}" cy="${L.y}" r="${Math.round(r*0.62)}" fill="none" stroke="#fff3c4" stroke-opacity=".35" stroke-width="4"/></g>`;
}
function spyMove(e){
  if(!SPY.on) return; const l=$('#spyLight'); if(!l) return;
  const pt=toSvg(e), x=Math.round(clamp(pt.x,0,1000)), y=Math.round(clamp(pt.y,0,700)); SPY.light={x,y};
  l.setAttribute('cx',x); l.setAttribute('cy',y); const b=$('#spyBeam'); if(b){b.setAttribute('cx',x);b.setAttribute('cy',y);}
}
roomSvg.addEventListener('pointermove',spyMove);
roomSvg.addEventListener('pointerdown',spyMove);

$('#spyBtn').onclick=()=>spyStart();
$('#spyX').onclick=()=>{SFX.click();spyEnd();};
$('#spyHint').onclick=()=>spyHint();
$('#spySay').onclick=()=>{const p=P();if(!readOn(p))spySpeak(true);}; // with Read to me on, its aria-label (the clue) is said already
$('#spyLvl').onclick=()=>{const p=P(); if(!p||p.easy) return; p.spy.lvl=p.spy.lvl%3+1; save(); SFX.click(); if(SPY.clue){SPY.used=SPY.used.filter(k=>k!==SPY.clue.key);spyNext();}};

STICKERS.push(
  stk('spy1','room','🔍','Sharp Eyes','circle','Finish a round of 🔍 I Spy (the 🔍 button in a room)',1,p=>p.stats.spyRounds||0),
  stk('spy100','room','🕵️','Super Spy','star','Find 100 things in 🔍 I Spy',100,p=>p.stats.spied||0,1),
  stk('spyAll','room','🗺️','Spy Everywhere','heart','Finish a round of 🔍 I Spy in all 4 rooms',4,p=>p.spy.rooms.length,1)
);
