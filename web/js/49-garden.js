'use strict';
/* =========================================================
   49. BACKYARD GARDEN (v1.48): plant seeds, they grow over real days, pick them
   The Backyard's garden shed (section 26, data-hot="garden") opens scr-garden: a raised bed of 6 plots and a seed tray.
   A plant grows one step a day by itself (seed -> sprout -> bud -> ready), from the device date (fpDay, section 44), so a
   seed planted today is ready in 3 days. Nothing ever wilts, dries out or goes away, and if the date goes backwards a
   plant keeps the step it had (plot.step). Watering is just for fun (sparkles and a splash); it changes nothing saved.
   Picking a ready plant: +GD_COINS coins, and the first time a kind is grown, its pot (an award:1 decoration, never in the
   Shop) is put in the Backyard. 4 seeds are free; the others are bought once (owned as 'seed:<id>').
   Saved in p.garden {plots[6], grown[]}: a plot is null or {seed, day:'YYYY-MM-DD' planted, step 0-3}; grown = seed ids
   picked at least once. Also p.stats.planted / harvests. Seed ids and pot keys (pot<Name>) are saved: never rename them;
   new seeds go at the end. No main loop: plants are drawn once per change and wiggles are CSS animations.
   ========================================================= */
const GD_PLOTS=6, GD_COINS=3, GD_STEPS=['Seed','Sprout','Bud','Ready'];
const GD_O='stroke="#2b2235" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
// The plant is drawn in a 120 x 140 box, growing up from the soil at (60, 112).
const gdStem=(top,c)=>`<path d="M60 112 Q57 ${(112+top)/2} 60 ${top}" stroke="${c||'#3f9a4d'}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
const gdLeaf=(x,y,r,c)=>`<ellipse cx="${x}" cy="${y}" rx="14" ry="7" fill="${c||'#6cc56f'}" ${GD_O} transform="rotate(${r} ${x} ${y})"/>`;
const gdLeaves=y=>gdLeaf(46,y,-25)+gdLeaf(74,y-4,25);
const GD_SEEDS=[
  {id:'sunflower',icon:'🌻',name:'Sunflower',price:0,c:'#ffd166',th:'cute',d:()=>gdStem(44)+gdLeaves(84)
    +[...Array(12)].map((_,k)=>`<ellipse cx="60" cy="20" rx="7" ry="13" fill="#ffd166" ${GD_O} transform="rotate(${k*30} 60 38)"/>`).join('')
    +`<circle cx="60" cy="38" r="13" fill="#8b5a35" ${GD_O}/><circle cx="55" cy="35" r="2" fill="#2b2235"/><circle cx="65" cy="35" r="2" fill="#2b2235"/><path d="M55 42 q5 4 10 0" stroke="#2b2235" stroke-width="2" fill="none"/>`},
  {id:'strawberry',icon:'🍓',name:'Strawberry',price:0,c:'#ff6b81',th:'cute',bud:'#fff',d:()=>
    gdLeaf(40,94,-30)+gdLeaf(80,92,30)+gdLeaf(60,82,90)+gdLeaf(48,80,-60)+gdLeaf(72,80,60)
    +[[38,96],[62,104],[84,94]].map(([x,y])=>`<path d="M${x} ${y-10} q12 0 11 11 q-3 11 -11 16 q-8 -5 -11 -16 q-1 -11 11 -11z" fill="#ff6b81" ${GD_O}/>`
      +`<path d="M${x-6} ${y-10} l3 -5 l3 4 l3 -4 l3 5z" fill="#3f9a4d"/><circle cx="${x-4}" cy="${y+1}" r="1.4" fill="#fff6c8"/><circle cx="${x+4}" cy="${y+4}" r="1.4" fill="#fff6c8"/><circle cx="${x}" cy="${y+10}" r="1.4" fill="#fff6c8"/>`).join('')},
  {id:'carrot',icon:'🥕',name:'Bunny Carrot',price:0,c:'#ff9a3c',th:'cute',bud:'#6cc56f',d:()=>
    [[50,-14],[70,14]].map(([x,r])=>`<g transform="rotate(${r} ${x} 104)"><ellipse cx="${x}" cy="72" rx="9" ry="32" fill="#6cc56f" ${GD_O}/><ellipse cx="${x}" cy="74" rx="4" ry="22" fill="#ffb3d9"/></g>`).join('')
    +`<path d="M44 106 Q60 96 76 106 L70 120 H50Z" fill="#ff9a3c" ${GD_O}/><path d="M52 112 h6 M62 108 h6" stroke="#c96a1e" stroke-width="2.5" stroke-linecap="round"/>`},
  {id:'tulip',icon:'🌷',name:'Tulip',price:0,c:'#ff8cc6',th:'cute',d:()=>gdStem(52)
    +`<path d="M58 110 Q34 92 38 62 Q52 80 58 104Z" fill="#6cc56f" ${GD_O}/><path d="M62 110 Q86 92 82 66 Q68 82 62 104Z" fill="#6cc56f" ${GD_O}/>`
    +`<path d="M42 30 Q40 62 60 62 Q80 62 78 30 L69 42 L60 26 L51 42Z" fill="#ff8cc6" ${GD_O}/><path d="M51 42 L60 54 L69 42" stroke="#e85d8a" stroke-width="2.5" fill="none"/>`},
  {id:'star',icon:'⭐',name:'Star Flower',price:10,c:'#ffe066',th:'space',d:()=>gdStem(56)+gdLeaves(88)
    +`<circle cx="60" cy="38" r="32" fill="#fff6c8" opacity=".75"/><path d="${starPath(60,38,26,12)}" fill="#ffe066" ${GD_O}/>`
    +`<circle cx="55" cy="38" r="2.2" fill="#2b2235"/><circle cx="65" cy="38" r="2.2" fill="#2b2235"/><path d="M56 44 q4 3 8 0" stroke="#2b2235" stroke-width="2" fill="none"/>`
    +`<path d="${starPath(24,24,5)} ${starPath(96,30,4)}" fill="#ffe066"/>`},
  {id:'batwing',icon:'🦇',name:'Bat-Wing Bloom',price:10,c:'#7d58cc',th:'emo',d:()=>gdStem(52)+gdLeaves(90)
    +[1,-1].map(s=>`<path d="M60 44 Q${60-s*20} 18 ${60-s*40} 30 Q${60-s*33} 38 ${60-s*36} 48 Q${60-s*27} 44 ${60-s*24} 54 Q${60-s*14} 46 60 54Z" fill="#7d58cc" ${GD_O}/>`).join('')
    +`<circle cx="60" cy="48" r="9" fill="#ff8cc6" ${GD_O}/><circle cx="57" cy="47" r="1.6" fill="#2b2235"/><circle cx="63" cy="47" r="1.6" fill="#2b2235"/>`},
  {id:'moonbell',icon:'🌙',name:'Moon Bell',price:12,c:'#c9e4ff',th:'emo',d:()=>
    `<path d="M60 112 Q56 56 86 34" stroke="#3f9a4d" stroke-width="6" fill="none" stroke-linecap="round"/>`+gdLeaf(46,96,-30)
    +[[86,44],[72,60],[62,80]].map(([x,y])=>`<path d="M${x} ${y-14} V${y-8}" stroke="#3f9a4d" stroke-width="3"/><path d="M${x-10} ${y+4} Q${x-10} ${y-10} ${x} ${y-10} Q${x+10} ${y-10} ${x+10} ${y+4} L${x+13} ${y+8} H${x-13}Z" fill="#c9e4ff" ${GD_O}/>`).join('')
    +`<path d="M36 14 A16 16 0 1 0 36 46 A11 11 0 1 1 36 14Z" fill="#ffe066" ${GD_O}/>`},
  {id:'mushroom',icon:'🍄',name:'Puff Mushroom',price:8,c:'#c9a7ff',th:'cute',bud:'#fff6e8',d:()=>
    `<rect x="48" y="70" width="24" height="42" rx="10" fill="#fff6e8" ${GD_O}/><path d="M22 78 Q22 34 60 34 Q98 34 98 78 Q60 88 22 78Z" fill="#c9a7ff" ${GD_O}/>`
    +[[44,56,7],[66,48,6],[82,66,5],[34,70,4],[60,68,5]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join('')
    +`<rect x="88" y="96" width="12" height="16" rx="5" fill="#fff6e8" ${GD_O}/><path d="M80 100 Q80 82 94 82 Q108 82 108 100Z" fill="#ff8cc6" ${GD_O}/><circle cx="94" cy="90" r="2.5" fill="#fff"/>`
    +`<circle cx="54" cy="90" r="2" fill="#2b2235"/><circle cx="66" cy="90" r="2" fill="#2b2235"/>`},
  {id:'pumpkin',icon:'🎃',name:'Mini Pumpkin',price:8,c:'#ff9a3c',th:'yard',bud:'#ffd166',d:()=>
    `<path d="M14 108 Q24 70 44 80 Q36 60 52 54" stroke="#3f9a4d" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M96 70 q10 -6 6 -14 q-4 -6 -10 0" stroke="#3f9a4d" stroke-width="3" fill="none"/>`
    +gdLeaf(28,72,-40)+gdLeaf(94,82,30)
    +`<ellipse cx="60" cy="92" rx="34" ry="22" fill="#ff9a3c" ${GD_O}/><ellipse cx="60" cy="92" rx="14" ry="22" fill="#ffad5c" ${GD_O}/>`
    +`<path d="M60 70 q-2 -10 6 -14" stroke="#8b5a35" stroke-width="6" fill="none" stroke-linecap="round"/>`},
  {id:'dinofern',icon:'🦖',name:'Dino Fern',price:12,c:'#5cc28a',th:'dino',bud:'#8ee08a',d:()=>
    [[-34,.8],[34,.8],[0,1]].map(([r,k])=>{let s='';for(let i=0;i<6;i++){const y=104-i*14,w=(24-i*3.2)*k;
      s+=`<path d="M60 ${y} L${60-w} ${y-9} L60 ${y-12}Z M60 ${y} L${60+w} ${y-9} L60 ${y-12}Z" fill="#8ee08a" ${GD_O}/>`;}
      return `<g transform="rotate(${r} 60 112)"><path d="M60 112 V24" stroke="#3f9a4d" stroke-width="6" stroke-linecap="round"/>${s}<path d="M60 24 l-6 -10 l6 -8 l6 8z" fill="#ffd166" ${GD_O}/></g>`;}).join('')},
  {id:'rocket',icon:'🚀',name:'Rocket Pepper',price:15,c:'#ff6b6b',th:'space',bud:'#8ee08a',d:()=>
    gdStem(96)+gdLeaf(40,104,-20)+gdLeaf(80,104,20)
    +`<path d="M44 80 L32 96 L46 92Z M76 80 L88 96 L74 92Z" fill="#5cc28a" ${GD_O}/>`
    +`<path d="M60 20 Q80 40 76 94 H44 Q40 40 60 20Z" fill="#ff6b6b" ${GD_O}/><circle cx="60" cy="56" r="9" fill="#d9f1ff" ${GD_O}/><path d="M48 80 h24" stroke="#ffffff99" stroke-width="3"/>`
    +`<path d="${starPath(24,40,5)} ${starPath(98,24,4)}" fill="#ffd166"/>`},
  {id:'candy',icon:'🍭',name:'Candy Swirl',price:15,c:'#ff9fd0',th:'cute',d:()=>gdStem(60)+gdLeaves(92)
    +`<circle cx="60" cy="40" r="26" fill="#ff9fd0" ${GD_O}/><path d="M60 40 a4 4 0 1 1 8 0 a8 8 0 1 1 -16 0 a12 12 0 1 1 24 0 a16 16 0 1 1 -32 0 a20 20 0 1 1 40 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`
    +`<path d="${heartPath(96,22,6)}" fill="#ff8cc6"/>`}
];
const GD={sel:'',plot:-1};
const gdSeed=id=>GD_SEEDS.find(s=>s.id===id);
const gdOwns=(p,s)=>!s.price||p.owned.includes('seed:'+s.id);
const gdPotKey=s=>'pot'+s.id[0].toUpperCase()+s.id.slice(1);
// A plot she can see: null when empty (or a seed id this app doesn't know).
const gdPlot=(p,i)=>{const pl=p.garden.plots[i];return pl&&gdSeed(pl.seed)?pl:null;};
// How grown a plant is: one step a day since it was planted, never less than it was before (the date can go back).
function gdStep(pl){const d=fpDayNo(fpDay())-fpDayNo(pl.day);return Math.min(3,Math.max(pl.step||0,isFinite(d)?d:0,0));}
// Keeps each plant's step, so a date that goes backwards never shrinks it.
function gdTouch(p){let ch=false;p.garden.plots.forEach(pl=>{if(pl&&gdSeed(pl.seed)){const s=gdStep(pl);if(s!==pl.step){pl.step=s;ch=true;}}});if(ch)saveSoon();}
const gdReady=p=>p.garden.plots.filter((pl,i)=>gdPlot(p,i)&&gdStep(pl)>=3);

/* ---------- drawing ---------- */
// One plant at a step (0-3). pot = drawn in a pot (no soil mound).
function gdPlant(id,step,pot){
  const s=gdSeed(id); if(!s) return '';
  const mound=pot?'':`<ellipse cx="60" cy="112" rx="22" ry="8" fill="#6b4630"/>`;
  if(step<=0) return mound+`<ellipse cx="60" cy="108" rx="7" ry="5" fill="${s.c}" ${GD_O}/><path d="M60 103 q2 -6 6 -7" stroke="#3f9a4d" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if(step===1) return mound+gdStem(86)+`<ellipse cx="50" cy="84" rx="11" ry="6" fill="#8ee08a" ${GD_O} transform="rotate(-25 50 84)"/><ellipse cx="70" cy="84" rx="11" ry="6" fill="#8ee08a" ${GD_O} transform="rotate(25 70 84)"/>`;
  if(step===2) return mound+gdStem(52)+gdLeaves(88)+gdLeaf(50,70,-20)
    +`<path d="M60 30 Q74 44 66 58 Q60 62 54 58 Q46 44 60 30Z" fill="${s.bud||s.c}" ${GD_O}/><path d="M54 58 l6 -8 l6 8" stroke="#3f9a4d" stroke-width="3" fill="#6cc56f"/>`;
  return mound+s.d();
}
// A garden plot: soil and the plant.
function gdPlotSVG(p,i){
  const pl=gdPlot(p,i), st=pl?gdStep(pl):0;
  return `<svg viewBox="0 0 120 140" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><rect x="4" y="106" width="112" height="30" rx="12" fill="#8b5a35"/>`
    +`<path d="M14 120 h6 M40 128 h6 M70 118 h6 M96 128 h6" stroke="#6b4630" stroke-width="3" stroke-linecap="round"/>`
    +(pl?`<g class="gd-pl">${gdPlant(pl.seed,st)}</g>`:`<path d="M48 112 q12 -8 24 0" stroke="#6b4630" stroke-width="3" fill="none" stroke-linecap="round"/>`)+`</svg>`;
}
// The Backyard: a flower box under the shed's window shows up to 3 plants ready to pick (called by yardFurniture).
function gdShedBox(){
  const p=P(); if(!p||!p.garden) return '';
  const r=gdReady(p).slice(0,3);
  return `<g data-gbox="${r.length}"><rect x="894" y="386" width="50" height="12" rx="3" fill="#c98b52" stroke="#2b2235" stroke-width="2.5"/>`
    +r.map((pl,k)=>{const x=904+k*15,c=gdSeed(pl.seed).c;return `<path d="M${x} 386 V378" stroke="#3f9a4d" stroke-width="2.5"/><circle cx="${x}" cy="375" r="6" fill="${c}" stroke="#2b2235" stroke-width="2"/><circle cx="${x}" cy="375" r="2" fill="#fff6c8"/>`;}).join('')+`</g>`;
}

/* ---------- the screen ---------- */
function renderGarden(){
  const p=P(); if(!p) return; gdTouch(p);
  if(GD.sel&&!gdOwns(p,gdSeed(GD.sel)||{})) GD.sel='';
  $('#gdBed').innerHTML=Array.from({length:GD_PLOTS},(_,i)=>{
    const pl=gdPlot(p,i), st=pl?gdStep(pl):-1, s=pl&&gdSeed(pl.seed);
    const say=pl?`${s.name}, ${st>=3?'ready to pick':GD_STEPS[st].toLowerCase()}`:`Empty plot ${i+1}`;
    return `<button class="gd-plot${pl?'':' gd-empty'}${st>=3?' ready':''}${GD.plot===i?' on':''}" data-plot="${i}" aria-label="${say}">${gdPlotSVG(p,i)}${st>=3?'<span class="gd-tag">✨</span>':''}</button>`;
  }).join('');
  $('#gdSeeds').innerHTML=GD_SEEDS.map(s=>{const own=gdOwns(p,s);
    return `<button class="gd-seed${GD.sel===s.id?' on':''}${poorCls(p,own,s.price)}" data-seed="${s.id}" style="--k:${s.c}" aria-label="${s.name} seeds">`
      +`<svg viewBox="8 6 104 112" aria-hidden="true">${gdPlant(s.id,3,true)}</svg>${own?'':priceTag(p,s.price)}</button>`;}).join('');
  $('#gdTray').classList.toggle('pick',GD.plot>=0);
  gdHint(p);
}
function gdHint(p){
  const n=p.garden.plots.filter((_,i)=>gdPlot(p,i)).length, ready=gdReady(p).length;
  $('#gdHint').textContent=GD.plot>=0?'🌱 Pick a seed to plant!':GD.sel?`${gdSeed(GD.sel).icon} Tap an empty plot to plant it`
    :ready?'✨ Tap a ready plant to pick it!':n?'🌱 Plants grow a little every day':'🌱 Tap a seed, then a plot';
}
function gdPlant1(p,i,id){
  const s=gdSeed(id); p.garden.plots[i]={seed:id,day:fpDay(),step:0}; p.stats.planted=(p.stats.planted||0)+1;
  GD.plot=-1; save(); SFX.squish(); vibrate(10); renderGarden(); gdFx(i,'🌱'); checkStickers();
  toast(`${s.icon} ${s.name} planted! It grows a little every day.`);
}
function gdPick(p,i){
  const pl=gdPlot(p,i), s=gdSeed(pl.seed), first=!p.garden.grown.includes(s.id);
  p.garden.plots[i]=null; p.stats.harvests=(p.stats.harvests||0)+1;
  const r=$(`#gdBed [data-plot="${i}"]`).getBoundingClientRect();
  earn(GD_COINS,s.icon,r.left+r.width/2,r.top+r.height/3);
  if(first){
    p.garden.grown.push(s.id);
    if(!allItems(p).some(it=>it.type===gdPotKey(s))) p.room3.items.push({uid:uid(),type:gdPotKey(s),x:Math.round(600+Math.random()*70),y:Math.round(630+Math.random()*30),placed:true});
  }
  save(); SFX.cheer(); vibrate(20); renderGarden(); gdFx(i,s.icon);
  if(first) modal(`🪴 A new pot!`,`<div class="gd-pot"><svg viewBox="${DECOR[gdPotKey(s)].box}">${DECOR[gdPotKey(s)].d()}</svg></div>`
    +`<p style="text-align:center">You grew your first ${esc(s.name)}! Its pot is in the 🌳 Backyard. Move it to any room in 🛋️ Decorate.</p>`,
    [{text:'Yay! ✨',cls:'pink',on:()=>checkStickers()}]);
  else {toast(`${s.icon} Picked! +${GD_COINS} 🪙`);checkStickers();}
}
// Watering: just for fun. Sparkles, a splash and a wiggle; nothing is saved.
function gdWater(i){
  const b=$(`#gdBed [data-plot="${i}"]`); if(!b) return;
  b.classList.remove('wet'); void b.offsetWidth; b.classList.add('wet'); gdFx(i,'💧');
  noise(0.35,0.18,2600,500); tone(880,0.12,'sine',0.06,1320,0.12);
}
function gdFx(i,ic){
  const b=$(`#gdBed [data-plot="${i}"]`); if(!b) return;
  const d=document.createElement('div'); d.className='gd-fx';
  d.innerHTML=[0,1,2].map(k=>`<span style="left:${20+k*30}%;animation-delay:${k*0.09}s">${ic}</span>`).join('');
  b.appendChild(d); setTimeout(()=>d.remove(),1100);
}
$('#gdBed').onclick=e=>{
  const b=e.target.closest('[data-plot]'), p=P(); if(!b||!p) return; const i=+b.dataset.plot, pl=gdPlot(p,i);
  if(!pl){
    if(GD.sel&&gdOwns(p,gdSeed(GD.sel))){gdPlant1(p,i,GD.sel);return;}
    SFX.click(); GD.plot=GD.plot===i?-1:i; renderGarden(); return;
  }
  if(gdStep(pl)>=3){gdPick(p,i);return;}
  gdWater(i); toast(['💧 Splash! Your seed is growing in the soil 🌱','💧 Splash! Your sprout is growing 🌿','💧 Splash! Your bud is growing, nearly there ✨'][gdStep(pl)]); // never a countdown
};
$('#gdSeeds').onclick=e=>{
  const b=e.target.closest('[data-seed]'), p=P(); if(!b||!p) return; const s=gdSeed(b.dataset.seed);
  tryBuy('seed:'+s.id,s.price,s.name+' seeds',()=>{
    if(GD.plot>=0&&!gdPlot(p,GD.plot)){gdPlant1(p,GD.plot,s.id);GD.sel=s.id;renderGarden();return;}
    SFX.click(); GD.sel=GD.sel===s.id?'':s.id; GD.plot=-1; renderGarden();
  });
};
$('#gdWater').onclick=()=>{
  const p=P(), L=p.garden.plots.map((_,i)=>i).filter(i=>{const pl=gdPlot(p,i);return pl&&gdStep(pl)<3;});
  if(!L.length){SFX.click();toast(gdReady(p).length?'✨ Your plants are ready to pick!':'🌱 Plant a seed first!');return;}
  L.forEach((i,k)=>setTimeout(()=>{if(cur==='garden')gdWater(i);},k*120));
};
$('#gdBack').onclick=()=>{SFX.click();gdBackKey();};
function gdBackKey(){GD.plot=-1;show('room');}
HOT_WORDS.garden='Garden';

/* ---------- the pots (prizes: never in the Shop) ---------- */
GD_SEEDS.forEach(s=>{
  const key=gdPotKey(s);
  DECOR[key]={name:s.name+' Pot',price:0,award:1,box:'-60 -150 120 160',d:()=>
    `<g transform="translate(-45 -122) scale(.75)">${gdPlant(s.id,3,true)}</g>`
    +`<path d="M-36 -40 H36 L28 0 H-28Z" fill="#e8916a" stroke="#2b2235" stroke-width="3.5" stroke-linejoin="round"/>`
    +`<rect x="-42" y="-50" width="84" height="14" rx="5" fill="#f2a983" stroke="#2b2235" stroke-width="3.5"/><path d="${heartPath(0,-20,6)}" fill="#fff6e8"/>`};
  THEME_OF['decor:'+key]=[...new Set([s.th,'yard'])]; // its theme chip, and 🌳 Outdoor
});
Object.assign(NIGHT_GLOW,{potStar:{y:-100,r:90,c:'warm'},potMoonbell:{y:-100,r:90,c:'purple'}});

/* ---------- stickers (Room & Style page) ---------- */
STICKERS.push(
  stk('sprout1','room','🌱','First Sprout','circle','Plant a seed in the 🏡 garden (tap the Backyard shed)',1,p=>p.stats.planted||0),
  stk('harvest10','room','🪴','Green Thumb','heart','Pick 10 plants from the garden',10,p=>p.stats.harvests||0,1),
  stk('garden6','room','🌻','Garden Party','scallop','Have all 6 garden plots growing at once',GD_PLOTS,p=>p.garden.plots.filter(Boolean).length,1),
  stk('gardenAll','room','🏡','Master Gardener','star','Grow every kind of seed once',()=>GD_SEEDS.length,p=>p.garden.grown.filter(id=>gdSeed(id)).length,3)
);
