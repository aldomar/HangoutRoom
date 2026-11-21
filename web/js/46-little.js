'use strict';
/* =========================================================
   46. LITTLE ONES' CORNER (v1.46): 🧸 Play, for the youngest (and everyone else)
   The 🧸 button in the room's top bar opens scr-little: a menu with 3 huge picture buttons.
   🖍️ Tap-to-Color (section 47), 🎵 Sound Mat and 👀 Peekaboo. Nothing can go wrong: no words needed, no scores,
   no timers, nothing to lose. Read to me names every button (aria-label).
   Coins: +1 per finished picture or friend found, LITTLE_DAILY a day in all (p.little.pay{day,n}), then one gentle
   note and it keeps working. The Sound Mat pays nothing.
   Saved per room: little{colors{picId:[...]}, hung{picId:{art, sig}}, pay{day,n}} and stats.colored/peeks/pads.
   No main loop: everything moves with CSS animations and transitions.
   ========================================================= */
const LITTLE_DAILY=10;
const LT={view:'menu',pic:'',crayon:0,mat:'notes',peek:null,noted:'',muteNoted:false};
const LT_MENU=[
  {id:'color',icon:'🖍️',name:'Coloring',color:'#ffd166'},
  {id:'mat',icon:'🎵',name:'Sound Mat',color:'#8ff0d0'},
  {id:'peek',icon:'👀',name:'Peekaboo',color:'#c9a7ff'}
];
const ltToday=()=>new Date().toDateString();
// +1 coin, LITTLE_DAILY a day; after that the toys keep working and say so once a day.
function ltPay(){
  const p=P(); if(!p) return;
  if(p.little.pay.day!==ltToday()) p.little.pay={day:ltToday(),n:0};
  if(p.little.pay.n<LITTLE_DAILY){p.little.pay.n++;earn(1,'');return;}
  save(); if(LT.noted!==ltToday()){LT.noted=ltToday();setTimeout(()=>toast('Play coins are full for today! Keep playing for fun ✨'),900);}
}
function ltSoundNote(){if(!DB.settings.sound&&!LT.muteNoted){LT.muteNoted=true;toast('🔇 Sound is off (⚙️ Settings)');}}

/* ---------- screen ---------- */
function renderLittle(){
  const p=P(); if(!p) return;
  const v=LT.view;
  $('#ltBack').innerHTML=v==='menu'?'⬅<span> Room</span>':'⬅';
  $('#ltBack').setAttribute('aria-label',v==='menu'?'Room':'Back');
  const M=LT_MENU.find(m=>m.id===(v==='colorPick'?'color':v));
  $('#ltTitle').textContent=M?M.icon+' '+M.name:'🧸 Play';
  const b=$('#ltBody'); b.className='lt-body ltv-'+v;
  if(v==='menu') b.innerHTML=`<div class="lt-menu">${LT_MENU.map(m=>`<button class="lt-big" data-lt="${m.id}" style="--k:${m.color}" aria-label="${m.name}"><span class="lt-ic">${m.icon}</span><span class="tn">${m.name}</span></button>`).join('')}</div>`;
  else if(v==='colorPick') cbPick(b);
  else if(v==='color') cbOpen(b);
  else if(v==='mat') ltMat(b);
  else if(v==='peek') ltPeek(b);
}
function ltGo(v){LT.view=v;if(v!=='peek')ltPeekStop();renderLittle();}
function ltStop(){ltPeekStop();}
function ltBackKey(){
  const v=LT.view;
  if(v==='color'){cbLeave();ltGo('colorPick');}
  else if(v==='menu') show('room');
  else ltGo('menu');
}
$('#ltBack').onclick=()=>{SFX.click();ltBackKey();};
$('#ltBody').addEventListener('click',e=>{
  const m=e.target.closest('[data-lt]'); if(!m) return;
  SFX.click(); ltGo(m.dataset.lt==='color'?'colorPick':m.dataset.lt);
});
$('#littleBtn').onclick=()=>{SFX.click();LT.view='menu';show('little');};

/* ---------- 🎵 Sound Mat ---------- */
// Notes: a pentatonic scale (C D E G A), so any taps in any order sound nice together.
const LT_NOTES=[
  {icon:'🐰',m:60,c:'#ff8cc6'},{icon:'⭐',m:62,c:'#ffab7a'},{icon:'🦕',m:64,c:'#ffd166'},{icon:'🚀',m:67,c:'#8ff0d0'},
  {icon:'🐟',m:69,c:'#7fc8ff'},{icon:'🌙',m:72,c:'#a97cff'},{icon:'🌸',m:74,c:'#ffc2dd'},{icon:'🚂',m:76,c:'#7ee08a'}
];
const LT_FUN=[
  {icon:'🦘',name:'Boing',c:'#ffd166',s:()=>{tone(180,0.18,'sine',0.3,620);tone(620,0.22,'sine',0.22,240,0.17);}},
  {icon:'🥁',name:'Drum',c:'#c9a7ff',s:()=>{tone(140,0.22,'sine',0.45,50);noise(0.08,0.2,2400,500);}},
  {icon:'🔔',name:'Bell',c:'#ffe6a8',s:()=>{tone(1320,0.9,'sine',0.14);tone(2640,0.5,'sine',0.05);tone(1980,0.7,'sine',0.04);}},
  {icon:'💨',name:'Whoosh',c:'#e2d8f5',s:()=>noise(0.45,0.3,600,3800)},
  {icon:'🚀',name:'Rocket',c:'#8ff0d0',s:()=>{noise(0.9,0.25,300,2600);tone(160,0.9,'sawtooth',0.05,900);}},
  {icon:'🚂',name:'Choo choo',c:'#7ee08a',s:()=>{noise(0.16,0.3,2600,700);setTimeout(()=>noise(0.16,0.3,2600,700),220);tone(880,0.5,'triangle',0.09,860,0.45);tone(1100,0.5,'triangle',0.07,1080,0.45);}},
  {icon:'🚗',name:'Honk',c:'#ffab7a',s:()=>{tone(392,0.16,'square',0.07);tone(494,0.16,'square',0.05);tone(392,0.22,'square',0.07,null,0.22);tone(494,0.22,'square',0.05,null,0.22);}},
  {icon:'💦',name:'Splash',c:'#7fc8ff',s:()=>{noise(0.5,0.32,5000,400);tone(900,0.12,'sine',0.08,300,0.05);}}
];
function ltMat(b){
  const list=LT.mat==='fun'?LT_FUN:LT_NOTES;
  b.innerHTML=`<div class="lt-tabs"><button class="tab${LT.mat==='notes'?' on':''}" data-mat="notes" aria-label="Notes">🎹</button>`
    +`<button class="tab${LT.mat==='fun'?' on':''}" data-mat="fun" aria-label="Fun sounds">🥁</button></div>`
    +`<div class="lt-mat" id="ltMat">${list.map((x,i)=>`<button class="lt-pad" data-pad="${i}" style="--k:${x.c}" aria-label="${x.name||'Note '+(i+1)}"><span>${x.icon}</span></button>`).join('')}</div>`;
}
function ltPadPlay(i){
  if(LT.mat==='fun'){const x=LT_FUN[i];if(x)x.s();}
  else{const x=LT_NOTES[i];if(x){tone(mf(x.m),0.7,'triangle',0.22);tone(mf(x.m+12),0.4,'sine',0.05);}}
}
// pointerdown (not click), so several fingers can play at once
$('#ltBody').addEventListener('pointerdown',e=>{
  if(LT.view==='mat'){
    const t=e.target.closest('[data-mat]'); if(t){LT.mat=t.dataset.mat;SFX.click();renderLittle();return;}
    const pad=e.target.closest('.lt-pad'); if(!pad) return;
    e.preventDefault(); ltSoundNote(); ltPadPlay(+pad.dataset.pad);
    pad.classList.remove('hit'); void pad.offsetWidth; pad.classList.add('hit');
    const p=P(); p.stats.pads++; saveSoon(); if(p.stats.pads===100) checkStickers();
  } else if(LT.view==='peek'){
    const s=e.target.closest('[data-spot]'); if(s){e.preventDefault();ltPeekTap(+s.dataset.spot);}
  } else if(LT.view==='color'){
    cbDown(e);
  }
});

/* ---------- 👀 Peekaboo ---------- */
// A friend hides behind one of the spots. Empty spots hide a little surprise, never a "wrong".
const LT_HIDES=[
  {id:'bush',d:()=>`<path d="M-110 0 Q-130 -60 -80 -80 Q-70 -135 -10 -125 Q40 -150 80 -100 Q130 -95 115 -40 Q130 -10 110 0Z" fill="#69c97a" stroke="#2b5e3a" stroke-width="6" stroke-linejoin="round"/>`
    +`<circle cx="-50" cy="-70" r="7" fill="#ff8cc6"/><circle cx="40" cy="-95" r="7" fill="#ffd166"/><circle cx="70" cy="-40" r="7" fill="#ff8cc6"/><circle cx="-20" cy="-30" r="7" fill="#fff"/>`},
  {id:'box',d:()=>`<rect x="-100" y="-130" width="200" height="130" rx="10" fill="#ff8cc6" stroke="#7a2e55" stroke-width="6"/><rect x="-14" y="-130" width="28" height="130" fill="#ffd166" stroke="#7a2e55" stroke-width="4"/>`
    +`<rect x="-112" y="-150" width="224" height="34" rx="8" fill="#ff6fb4" stroke="#7a2e55" stroke-width="6"/><path d="M0 -150 Q-40 -195 -55 -160 Q-40 -145 0 -150 Q40 -145 55 -160 Q40 -195 0 -150Z" fill="#ffd166" stroke="#7a2e55" stroke-width="5"/>`},
  {id:'pot',d:()=>`<path d="M-85 -95 H85 L65 0 H-65Z" fill="#e0895a" stroke="#7a3e1f" stroke-width="6" stroke-linejoin="round"/><rect x="-98" y="-112" width="196" height="28" rx="8" fill="#f0a070" stroke="#7a3e1f" stroke-width="6"/>`
    +`<path d="M-50 -112 Q-70 -170 -40 -190 M0 -112 V-200 M50 -112 Q70 -165 45 -185" stroke="#3f8f4f" stroke-width="10" fill="none" stroke-linecap="round"/>`
    +`<circle cx="-40" cy="-192" r="18" fill="#ffd166" stroke="#7a3e1f" stroke-width="4"/><circle cx="0" cy="-204" r="20" fill="#ff8cc6" stroke="#7a3e1f" stroke-width="4"/><circle cx="45" cy="-188" r="18" fill="#a97cff" stroke="#7a3e1f" stroke-width="4"/>`},
  {id:'cloud',d:()=>`<path d="M-115 0 Q-140 -50 -95 -65 Q-95 -125 -35 -115 Q0 -160 50 -120 Q110 -130 105 -70 Q140 -50 115 0Z" fill="#ffffff" stroke="#7d7396" stroke-width="6" stroke-linejoin="round"/>`
    +`<circle cx="-35" cy="-55" r="6" fill="#3b2f52"/><circle cx="25" cy="-55" r="6" fill="#3b2f52"/><path d="M-15 -38 Q-5 -28 5 -38" stroke="#3b2f52" stroke-width="4" fill="none" stroke-linecap="round"/>`},
  {id:'door',d:()=>`<rect x="-80" y="-210" width="160" height="210" rx="70" ry="70" fill="#a97cff" stroke="#4a2f7a" stroke-width="6"/><rect x="-80" y="-120" width="160" height="120" fill="#a97cff"/>`
    +`<path d="M-80 -140 V0 H80 V-140" fill="none" stroke="#4a2f7a" stroke-width="6"/><circle cx="48" cy="-95" r="10" fill="#ffd166" stroke="#4a2f7a" stroke-width="4"/>`
    +`<path d="${starPath(0,-160,22)}" fill="#ffd166" stroke="#4a2f7a" stroke-width="4"/>`},
  {id:'drum',d:()=>`<rect x="-95" y="-120" width="190" height="120" rx="14" fill="#7fc8ff" stroke="#24507a" stroke-width="6"/><ellipse cx="0" cy="-120" rx="95" ry="22" fill="#e8f4ff" stroke="#24507a" stroke-width="6"/>`
    +`<path d="M-90 -100 L-45 -10 L0 -100 L45 -10 L90 -100" fill="none" stroke="#ffd166" stroke-width="7" stroke-linejoin="round"/>`}
];
const LT_SURPRISES=['🦋','⭐','🐞','🌼','🎈','🍄','🐝','🌈'];
// Who can hide: the 6 visiting friends, her pet (if she has one) and her buddy.
function ltFriends(p){
  const l=Object.keys(VISIT_FRIENDS).map(k=>({k,art:()=>`<g transform="scale(1.15)">${VISIT_FRIENDS[k].d()}</g>`,say:VISIT_FRIENDS[k].name}));
  const pk=petKind(p); if(pk) l.push({k:'pet',art:()=>`<g transform="scale(1.6)">${petArt(pk,petAcc(p))}</g>`,say:petName(p)||'Pet'});
  l.push({k:'buddy',art:()=>mascotSVG(p.look,null,'x="-80" y="-205" width="160" height="216"'),say:p.mascotName||'Fuzzy'});
  return l;
}
const ltSpots=()=>(innerWidth<640||innerHeight>innerWidth*1.15)?4:6;
function ltPeekNew(){
  const p=P(), F=ltFriends(p), n=ltSpots(), last=LT.peek&&LT.peek.who;
  const pool=F.filter(f=>f.k!==last), who=pool[Math.floor(Math.random()*pool.length)];
  const hides=LT_HIDES.slice().sort(()=>Math.random()-0.5).slice(0,n);
  const sur=LT_SURPRISES.slice().sort(()=>Math.random()-0.5);
  LT.peek={n,who:who.k,friend:Math.floor(Math.random()*n),hides:hides.map(h=>h.id),sur:sur.slice(0,n),open:[],found:false};
}
function ltPeekStop(){clearTimeout(ltPeekStop.t);}
function ltPeek(b){
  const p=P(); if(!LT.peek||LT.peek.found||LT.peek.n!==ltSpots()) ltPeekNew(); // a round left half-way waits; a found one starts fresh
  const K=LT.peek, cols=K.n===4?2:3, W=cols*300, H=600;
  const F=ltFriends(p).find(f=>f.k===K.who)||ltFriends(p)[0];
  let s=`<svg class="lt-peek" id="ltPeek" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">`
    +`<rect width="${W}" height="${H}" fill="#bfe6ff"/><rect y="${H*0.62}" width="${W}" height="${H*0.38}" fill="#9be08f"/>`
    +`<circle cx="${W-70}" cy="70" r="40" fill="#ffd166"/>`;
  K.hides.forEach((h,i)=>{
    const x=(i%cols)*300+150, y=Math.floor(i/cols)*300+285, open=K.open.includes(i), it=i===K.friend;
    const behind=it?F.art():`<text x="0" y="-40" text-anchor="middle" font-size="96">${K.sur[i]}</text>`;
    const H2=LT_HIDES.find(z=>z.id===h);
    s+=`<g class="lt-spot${open?' open':''}" data-spot="${i}" transform="translate(${x} ${y})"><rect x="-148" y="-283" width="296" height="296" fill="transparent"/>`
      +`<g class="lt-in">${behind}</g><g class="lt-cover">${H2.d()}</g></g>`;
  });
  if(K.found) s+=ltBubble(K);
  b.innerHTML=s+'</svg>';
}
function ltBubble(K){
  const cols=K.n===4?2:3, x=(K.friend%cols)*300+150, y=Math.floor(K.friend/cols)*300+40;
  return `<g transform="translate(${x} ${Math.max(60,y)})"><g class="lt-boo"><rect x="-120" y="-40" width="240" height="66" rx="30" fill="#fff" stroke="#ff4fa3" stroke-width="5"/>`
    +`<text x="0" y="6" text-anchor="middle" font-size="34" font-weight="900" fill="#ff4fa3">Peekaboo!</text></g></g>`;
}
function ltPeekTap(i){
  const K=LT.peek; if(!K||K.found||K.open.includes(i)) return;
  ltSoundNote(); K.open.push(i);
  const g=$(`#ltPeek [data-spot="${i}"]`); if(g) g.classList.add('open');
  if(i!==K.friend){tone(660,0.09,'sine',0.14,990);tone(990,0.12,'sine',0.12,1320,0.09);return;} // a little giggle
  K.found=true; const p=P();
  SFX.cheer(); giftConfetti();
  const F=ltFriends(p).find(f=>f.k===K.who);
  if(DB.settings.sound&&canSpeak()) speakText('Peekaboo! '+(F?F.say:''));
  $('#ltPeek').insertAdjacentHTML('beforeend',ltBubble(K));
  p.stats.peeks++; ltPay(); checkStickers();
  ltPeekStop(); ltPeekStop.t=setTimeout(()=>{if(cur==='little'&&LT.view==='peek'){ltPeekNew();renderLittle();}},2600);
}
addEventListener('resize',()=>{if(cur==='little'&&LT.view==='peek'&&LT.peek&&LT.peek.n!==ltSpots()&&!LT.peek.found)renderLittle();});

/* ---------- stickers ---------- */
STK_PAGES.little={icon:'🧸',name:'Play',color:'#ffc2dd'};
STICKERS.push(
  stk('lt1','little','🖍️','First Colors','circle','Color every part of a picture (🧸 Play)',1,p=>p.stats.colored,1),
  stk('lt12','little','🎨','Little Artist','star','Color all 12 pictures in 🧸 Play',()=>CB_PICS.length,p=>CB_PICS.filter(z=>cbDone(p,z)).length,2),
  stk('ltpeek','little','👀','Peekaboo!','heart','Find 10 friends in 👀 Peekaboo',10,p=>p.stats.peeks,1),
  stk('ltpad','little','🎵','Music Mat','circle','Tap the 🎵 Sound Mat 100 times',100,p=>p.stats.pads,1),
  stk('lthang','little','🖼️','On the Wall','scallop','Hang a colored picture in your Gallery (🖼️)',1,p=>Object.keys(p.little.hung).length,1),
  stk('ltpeek50','little','🙈','Hide and Seek Pro','heart','Find 50 friends in 👀 Peekaboo',50,p=>p.stats.peeks,2)
);
