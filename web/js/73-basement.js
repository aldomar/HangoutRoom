'use strict';
/* =====================================================================
   73. 🪜 BASEMENT (v1.79)
   The fifth room (roomNo 5, saved in p.room5 {wall, floor, items}), under her room: a ⬇️ tab at the bottom of her room
   and the 🗺️ map. Nothing is built in, like the Studio (it draws with studioFurniture). '' as the wall or floor means
   "not visited yet": baseStart() then gives it the free 🧱 Cozy Brick wall and Gray Carpet floor (both usable indoors anywhere).
   Little mode keeps out (LOCK_ROOMS, section 66), like the Studio.
   For showing off prizes:
   - 🏆 Prizes in Decorate's 📦 My Stuff (MINE.prizes): every award:1 thing she has, in any room or stored, with where it is.
     Tapping one brings it into the room on screen (a prize is never given away or sold, so this only moves it).
   - Two free display pieces (Shop, listed first): the 🗄️ Trophy Case (3 shelves: shelf.tops, section 9) and the Prize Podium.
   Room 5 and its saved ids (brick, grayCarpet, prizeCase, prizePodium) are saved: never rename them.
   ===================================================================== */
ROOM_MAP.push({n:5,icon:'🪜',name:'Basement',from:1,dir:'down',col:2,row:3});
ROOM_NAMES[5]='Basement';

/* ---------- the first look ---------- */
EXTRA_DEFS.push(`<pattern id="pBrick" width="120" height="60" patternUnits="userSpaceOnUse"><path d="M0 1.5 H120 M0 31.5 H120 M30 1.5 V31.5 M90 1.5 V31.5 M0 31.5 V60 M60 31.5 V60 M120 31.5 V60" stroke="#00000020" stroke-width="3" fill="none"/>`
  +`<rect x="8" y="9" width="18" height="5" rx="2.5" fill="#ffffff2e"/><rect x="68" y="39" width="18" height="5" rx="2.5" fill="#ffffff2e"/></pattern>`);
WALLS.brick={name:'Cozy Brick',price:0,fill:'#d4978a',pat:'pBrick'};
FLOORS.grayCarpet={name:'Gray Carpet',price:0,fill:'#a39db3',pat:'pFluff'};
function baseStart(p){
  if(!p) return; const R=p.room5; if(R.wall&&R.floor) return;
  if(!R.wall||!WALLS[R.wall]) R.wall='brick';
  if(!R.floor||!FLOORS[R.floor]) R.floor='grayCarpet';
  save();
}
// A friendly nudge while the Basement is still empty (nothing saved: it stops once something is in it).
function baseHi(){const p=P(); if(p&&!p.room5.items.some(i=>i.placed)) say('Your Basement! Tap 🛋️ to fill it ✨');}

/* ---------- free display pieces ---------- */
// 🗄️ Trophy Case: a tall open case with 3 shelves (things dropped near a shelf sit on it, and move with the case).
DECOR.prizeCase={name:'Trophy Case',price:0,first:1,shelf:{w:250,top:20,tops:[20,165,310]},box:'-152 -484 304 492',d:()=>{const L=st('#2b2235',4);
  return `<rect x="-136" y="-6" width="272" height="12" rx="6" fill="#00000024"/>`
    +`<rect x="-140" y="-455" width="280" height="455" rx="14" fill="#8e6cd0" ${L}/>`
    +`<rect x="-124" y="-440" width="248" height="428" rx="8" fill="#efe6ff"/>`
    +`<path d="M-124 -440 h248 v40 h-248Z" fill="#e2d4fb"/>`
    +[20,165,310].map(t=>`<rect x="-132" y="${-t}" width="264" height="14" rx="5" fill="#b89cff" ${L}/>`).join('')
    +`<path d="${starPath(0,-462,17)}" fill="#ffd166" ${L}/>`;}};
// Prize Podium: a low round stage with gold trim for one big prize.
DECOR.prizePodium={name:'Prize Podium',price:0,first:1,shelf:{w:180,top:62},box:'-112 -92 224 100',d:()=>{const L=st('#2b2235',4);
  return `<ellipse cx="0" cy="0" rx="104" ry="14" fill="#00000024"/>`
    +`<path d="M-100 -62 V-10 A100 18 0 0 0 100 -10 V-62Z" fill="#8e6cd0" ${L}/>`
    +`<path d="M-100 -30 A100 18 0 0 0 100 -30" fill="none" stroke="#ffd166" stroke-width="6"/>`
    +`<ellipse cx="0" cy="-62" rx="100" ry="18" fill="#efe6ff" ${L}/>`
    +[-60,0,60].map((x,i)=>`<path d="${starPath(x,-18+(i===1?4:0),8)}" fill="#ffd166"/>`).join('');}};
// They arrive at the sides, clear of the buddy (x 420-580), so a tall case never hides them. Moving them is up to her.
TROPHY_SPOTS.prizeCase={x:190,y:610}; TROPHY_SPOTS.prizePodium={x:800,y:640};
(THEME_OF['decor:prizeCase']=THEME_OF['decor:prizeCase']||[]).push('sport'); // 🔎 theme chips (section 33)
(THEME_OF['decor:prizePodium']=THEME_OF['decor:prizePodium']||[]).push('stage');

/* ---------- 🏆 Prizes in My Stuff ---------- */
const MINE={prizes:false}; // the 📦 All / 🏆 Prizes chips (not saved)
const isPrize=i=>!!(DECOR[i.type]&&DECOR[i.type].award);
function prizeChips(){
  return `<div class="chips mine-chips"><button class="chip${MINE.prizes?'':' on'}" data-mine-view="all" aria-label="All my stuff">📦<span> All</span></button>`
    +`<button class="chip${MINE.prizes?' on':''}" data-mine-view="prizes" aria-label="My prizes">🏆<span> Prizes</span></button></div>`;
}
// Where a prize is: its room's icon and name, ✔ for the room on screen, 📦 when stored.
function prizeWhere(p,it){
  if(!it.placed) return '📦';
  const n=rooms(p).findIndex(r=>r.items.includes(it))+1;
  return n===roomNo?'✔':roomInfo(n).icon;
}
function prizeGrid(p){
  const list=allItems(p).filter(isPrize);
  if(!list.length) return `<div class="empty">No prizes yet! Win them in the games: trophies, gloves, garden pots, walk jars and more 🏆</div>`;
  // the ones not in this room first, so they are easy to bring here
  const here=it=>it.placed&&curRoom(p).items.includes(it);
  return list.slice().sort((a,b)=>here(a)-here(b)).map(it=>{const d=DECOR[it.type], h=here(it);
    return `<button class="tile${h?' on':''}" data-prize="${it.uid}" aria-label="${esc(d.name)}"><div class="tv"><svg viewBox="${d.box}">${d.d(it)}</svg></div>`
      +`<div class="tn">${esc(d.name)}</div><div class="tp cnt">${prizeWhere(p,it)}</div></button>`;}).join('');
}
$('#decoGrid').addEventListener('click',e=>{
  const c=e.target.closest('[data-mine-view]');
  if(c){MINE.prizes=c.dataset.mineView==='prizes';SFX.click();renderDecoGrid();return;}
  const t=e.target.closest('[data-prize]'); if(!t) return;
  const p=P(), it=allItems(p).find(i=>i.uid===t.dataset.prize); if(!it) return;
  const R=curRoom(p), d=DECOR[it.type];
  if(it.placed&&R.items.includes(it)){SFX.click();toast(`${d.name} is in this room ✔`);return;}
  rooms(p).forEach(r=>{r.items=r.items.filter(i=>i!==it);}); R.items.push(it);
  Object.assign(it,spot(it.type),{placed:true}); save(); SFX.pop(); renderRoom(); renderDecoGrid();
  toast(`🏆 ${d.name} is here now!`);
});

/* ---------- sticker (Room & Style page) ---------- */
STICKERS.push(
  stk('basement5','room','🪜','Basement Builder','scallop','Put 5 things in the Basement',5,p=>p.room5.items.filter(i=>i.placed).length,1)
);
