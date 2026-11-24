'use strict';
/* =========================================================
   41. STUDIO + GETTING AROUND (v1.40)
   The ✨ Studio is the fourth room (roomNo 4, saved in p.room4 {wall, floor, items}). Nothing is built in, so every piece
   in it is her choice. '' as the wall or floor means "not visited yet": studioStart() then gives it her room color's
   wall (ROOM_START, section 23) and the free wood floor. The free Built-in Shelf (Shop, listed first) is the "built-in" option.
   Getting around: her room is the hub. ROOM_MAP lists every room; each one but her room hangs off another room in one
   direction (dir). That gives the arrow tabs at the edges of the screen (roomTabs, hidden while decorating, never covered by
   decorations) and the 🗺️ house map in the top bar (mapOpen). A new room later = one ROOM_MAP entry + its drawing.
   Back still goes any room -> her room -> profiles (section 99).
   ========================================================= */
// col/row = its place on the 🗺️ map (a grid). from/dir = which room it hangs off, and which way.
const ROOM_MAP=[
  {n:1,icon:'🏠',name:'My Room',col:2,row:2},
  {n:2,icon:'🪜',name:'Loft',from:1,dir:'up',col:2,row:1},
  {n:3,icon:'🌳',name:'Backyard',from:1,dir:'left',col:1,row:2},
  {n:4,icon:'✨',name:'Studio',from:1,dir:'right',col:3,row:2}
];
const RT_BACK={up:'down',down:'up',left:'right',right:'left'};
const RT_ARROW={up:'⬆️',down:'⬇️',left:'⬅️',right:'➡️'};
const roomInfo=n=>ROOM_MAP.find(r=>r.n===n)||ROOM_MAP[0];
// The ways out of room n: [{dir, to}], the rooms hanging off it, then the way back.
function roomLinks(n){
  const out=ROOM_MAP.filter(r=>r.from===n).map(r=>({dir:r.dir,to:r.n})), me=roomInfo(n);
  if(me.from) out.push({dir:RT_BACK[me.dir],to:me.from});
  return out;
}
const roomGoWords=n=>n===1?'Back to my room':`Go to the ${roomInfo(n).name}`;
function roomTabs(){
  const box=$('#roomTabs'); if(!box) return;
  box.innerHTML=decorating?'':roomLinks(roomNo).filter(l=>!lockOn()||LOCK_ROOMS.includes(l.to)).map(l=>{const r=roomInfo(l.to);
    return `<button class="rtab rt-${l.dir}" data-go="${l.to}" aria-label="${roomGoWords(l.to)}"><b>${RT_ARROW[l.dir]}</b><i>${r.icon}</i></button>`;}).join('');
}
$('#roomTabs').onclick=e=>{const b=e.target.closest('[data-go]');if(b)goRoom(+b.dataset.go);};

// 🗺️ The house map: every room as a big button, laid out like the house; the room she is in has a ⭐.
function mapOpen(){
  if(!P()) return; SFX.click();
  const cols=Math.max(...ROOM_MAP.map(r=>r.col));
  modal('🗺️ My House',`<div class="hmap" style="grid-template-columns:repeat(${cols},1fr)">`+ROOM_MAP.map(r=>
    `<button class="hm-room${r.n===roomNo?' on':''}" data-map="${r.n}" style="grid-column:${r.col};grid-row:${r.row}" aria-label="${r.name}">`
    +`<i>${r.icon}</i><span class="tn">${r.name}</span>${r.n===roomNo?'<em>⭐ Here</em>':''}</button>`).join('')+`</div>`,
    [{text:'Close',cls:'ghost'}]);
}
$('#mapBtn').onclick=mapOpen;
$('#modal').addEventListener('click',e=>{const b=e.target.closest('[data-map]');if(!b)return;
  closeModal(); const n=+b.dataset.map; if(n!==roomNo) goRoom(n);});

// The Studio itself: no furniture at all (the same {wall, floor} shape as the other rooms, see renderRoom).
function studioFurniture(split){return split?{wall:'',floor:[]}:'';}
function studioStart(p){
  if(!p) return; const R=p.room4; if(R.wall&&R.floor) return;
  if(!R.wall||!WALLS[R.wall]){const r=ROOM_START[p.color], w=r&&WALLS[r[0]]?r[0]:'lavender'; R.wall=w;
    if(WALLS[w].price&&!p.owned.includes('wall:'+w)) p.owned.push('wall:'+w);}
  if(!R.floor||!FLOORS[R.floor]) R.floor='wood';
  save();
}
// A friendly nudge while the Studio is still empty (nothing saved: it simply stops once something is in it).
function studioHi(){const p=P(); if(p&&!p.room4.items.some(i=>i.placed)) say('Your Studio! Tap 🛋️ to fill it ✨');}

// The free Built-in Shelf: a wide ledge that looks part of the wall. Things dropped on it sit on it (shelf, section 9).
DECOR.builtShelf={name:'Built-in Shelf',price:0,wall:1,first:1,shelf:{w:440,top:44},box:'-228 -52 456 42',d:()=>
  `<rect x="-212" y="-28" width="424" height="14" rx="7" fill="#00000024"/>`
  +`<rect x="-220" y="-44" width="440" height="20" rx="5" fill="#fbf6ff" stroke="#2b2235" stroke-width="4" stroke-linejoin="round"/>`
  +`<rect x="-212" y="-30" width="424" height="3" fill="#e2d6ef"/>`};
(THEME_OF['decor:builtShelf']=THEME_OF['decor:builtShelf']||[]).push('cute'); // 🔎 theme chip (section 33)

/* ---------- sticker (Room & Style page) ---------- */
STICKERS.push(
  stk('studio5','room','✨','Studio Star','star','Put 5 things in the Studio',5,p=>p.room4.items.filter(i=>i.placed).length)
);
