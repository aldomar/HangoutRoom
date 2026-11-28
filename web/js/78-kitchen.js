'use strict';
/* =====================================================================
   78. 🍳 KITCHEN, the sixth room (v1.91, Phase 17)
   roomNo 6, saved in p.room6 {wall, floor, items}, like every room. It sits left of her room (⬅️ tab); since v1.91 the
   🌳 Backyard hangs off the Kitchen (one more ⬅️), and her window is still a one-tap shortcut to the Backyard.
   '' as the wall or floor means "not visited yet": kitchenStart() then gives it the free Kitchen Tiles wall and Kitchen
   Checks floor. Built in (kitchenFurniture, the same {wall, floor:[{y, h}]} shape as the other rooms):
   - the 🧊 fridge (data-hot="fridge": Chef's Choice, a future update, so it is in LOCKED for now),
   - the counter with the 📖 recipe book (data-hot="recipes" → the recipe screen, section 79) and the 🫧 sink
     (data-hot="sink" → the washing toy, section 79), and a cooktop with an oven,
   - the 🛎️ order window on the wall (data-hot="order": customer orders, a future update, in LOCKED).
   The fridge, the counter and the wall cabinets can be recolored (FURN_PIECES). 🧸 Little mode lets the Kitchen in
   (LOCK_ROOMS, section 66): the recipe book on Easy and the sink.
   Saved ids: room 6, kitchenTile, kitchenCheck, the piece ids fridge/counter/cabinets and the decorations below.
   ===================================================================== */
ROOM_MAP.push({n:6,icon:'🍳',name:'Kitchen',from:1,dir:'left',col:2,row:2});
ROOM_NAMES[6]='Kitchen';
NAV_PLACES.recipes={icon:'📖',name:'Recipes'}; // ⬅ from a recipe or the Dish Book (section 76)

/* ---------- the first look ---------- */
EXTRA_DEFS.push(`<pattern id="pKTile" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M0 1.5 H80 M1.5 0 V80" stroke="#00000018" stroke-width="3"/>`
  +`<rect x="10" y="10" width="14" height="5" rx="2.5" fill="#ffffff70"/><circle cx="60" cy="60" r="5" fill="#ff8cc622"/></pattern>`,
  `<pattern id="pKCheck" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#00000014"/><rect x="40" y="40" width="40" height="40" fill="#00000014"/></pattern>`);
WALLS.kitchenTile={name:'Kitchen Tiles',price:0,fill:'#fdeedd',pat:'pKTile'};
FLOORS.kitchenCheck={name:'Kitchen Checks',price:0,fill:'#f4d9e8',pat:'pKCheck'};
function kitchenStart(p){
  if(!p) return; const R=p.room6; if(R.wall&&R.floor) return;
  if(!R.wall||!WALLS[R.wall]) R.wall='kitchenTile';
  if(!R.floor||!FLOORS[R.floor]) R.floor='kitchenCheck';
  save();
}
// A friendly nudge until the first recipe is made (nothing saved: it stops by itself).
function kitchenHi(){const p=P(); if(p&&!Object.keys(p.kitchen.stars).length) say(lockOn()?'Tap the 📖 book to cook!':'Tap the 📖 recipe book to cook! 🍳');}

/* ---------- built-in furniture ---------- */
FURN_PIECES.fridge={room:6,icon:'🧊',name:'Fridge',orig:{body:'#bfe6ff',dark:'#86bfe6'},map:c=>({body:c.l,dark:c.m})};
FURN_PIECES.counter={room:6,icon:'🍳',name:'Counter',orig:{top:'#fff4e2',front:'#ff9fc8',dark:'#d9709f'},map:c=>({top:c.l,front:c.b,dark:c.d})};
FURN_PIECES.cabinets={room:6,icon:'🗄️',name:'Wall Cabinets',orig:{body:'#c9b3ff',dark:'#8d68dc'},map:c=>({body:c.l,dark:c.m})};
LOCKED.fridge="Chef's Choice"; LOCKED.order='Customer orders'; // they open in a later Kitchen update (handleHot, section 9)
HOT_WORDS.recipes='Recipe book'; HOT_WORDS.sink='Sink'; HOT_WORDS.fridge='Fridge'; HOT_WORDS.order='Order window';
Object.assign(SPY_FURN,{recipes:'Recipe Book',sink:'Sink',fridge:'Fridge',order:'Order Window'}); // 🔍 I Spy (section 50)

function kitchenFurniture(split){
  const o='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"', fr=furnC('fridge'), ct=furnC('counter'), cb=furnC('cabinets');
  // the wall: the order window with its awning and bell, and the cabinets over the sink and cooktop
  let s=`<g class="hot" data-hot="order" data-piece="window"><rect x="420" y="96" width="220" height="170" rx="10" fill="#bfe9ff" ${o}/>`
    +`<path d="M432 250 Q470 200 530 214 Q590 196 628 250Z" fill="#9fdc8f" opacity=".8"/><circle cx="600" cy="140" r="22" fill="#fff3c4"/>`
    +`<path d="M408 96 H652 L640 60 H420Z" fill="#fff" ${o}/>`+[0,1,2,3,4,5].map(k=>`<path d="M${424+k*36} 60 h18 l2 36 h-22Z" fill="#ff8cc6"/>`).join('')
    +`<path d="M408 96 H652 L640 60 H420Z" fill="none" ${o}/>`
    +[0,1,2,3,4,5,6].map(k=>`<path d="M${408+k*34.8} 96 a17.4 14 0 0 0 34.8 0" fill="${k%2?'#fff':'#ff8cc6'}" ${o}/>`).join('')
    +`<rect x="404" y="262" width="252" height="18" rx="6" fill="#fff4e2" ${o}/>`
    +`<path d="M600 262 a16 16 0 0 1 32 0Z" fill="#ffd166" ${o}/><circle cx="616" cy="242" r="4" fill="#2b2235"/>${sign(530,40,'🛎️ Orders',true)}</g>`;
  s+=`<g data-piece="cabinets"><rect x="690" y="70" width="290" height="150" rx="10" fill="${cb.body}" ${o}/><path d="M835 74 V216" stroke="#2b2235" stroke-width="4"/>`
    +`<rect x="706" y="86" width="114" height="118" rx="8" fill="none" stroke="${cb.dark}" stroke-width="4"/><rect x="850" y="86" width="114" height="118" rx="8" fill="none" stroke="${cb.dark}" stroke-width="4"/>`
    +`<circle cx="822" cy="150" r="6" fill="#ffd166" stroke="#2b2235" stroke-width="3"/><circle cx="848" cy="150" r="6" fill="#ffd166" stroke="#2b2235" stroke-width="3"/></g>`;
  const F=[];
  // the fridge, with fruit magnets: Chef's Choice later (LOCKED for now)
  F.push({y:500,h:`<g class="hot" data-hot="fridge" data-piece="fridge"><rect x="36" y="160" width="168" height="340" rx="22" fill="${fr.body}" ${o}/>`
    +`<path d="M36 272 H204" stroke="#2b2235" stroke-width="4"/><rect x="180" y="196" width="10" height="52" rx="5" fill="${fr.dark}" stroke="#2b2235" stroke-width="3"/>`
    +`<rect x="180" y="300" width="10" height="90" rx="5" fill="${fr.dark}" stroke="#2b2235" stroke-width="3"/>`
    +`<path d="M50 176 q10 -6 20 0" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`
    +`<circle cx="80" cy="320" r="13" fill="#ff5a6e" stroke="#2b2235" stroke-width="3"/><path d="M80 307 q4 -8 10 -8" stroke="#3f9a4d" stroke-width="3" fill="none"/>`
    +`<path d="${starPath(120,360,14)}" fill="#ffd166" stroke="#2b2235" stroke-width="3"/><path d="${heartPath(80,400,12)}" fill="#ff8cc6" stroke="#2b2235" stroke-width="3"/>`
    +`<rect x="64" y="200" width="56" height="40" rx="4" fill="#fff" stroke="#2b2235" stroke-width="3"/><path d="M72 214 h40 M72 226 h28" stroke="#a97cff" stroke-width="3"/>`
    +`${sign(120,132,'🧊 Fridge',true)}</g>`});
  // the counter: cabinets, the 📖 recipe book, the 🫧 sink and the cooktop with an oven
  let c=`<rect x="220" y="384" width="764" height="104" fill="${ct.front}" ${o}/>`
    +[[236,360],[376,500],[516,640],[656,780]].map(([a,b])=>`<rect x="${a}" y="400" width="${b-a-12}" height="74" rx="8" fill="none" stroke="${ct.dark}" stroke-width="4"/><circle cx="${b-26}" cy="437" r="5" fill="#ffd166" stroke="#2b2235" stroke-width="2.5"/>`).join('')
    +`<rect x="800" y="398" width="168" height="80" rx="8" fill="#4a3d63" ${o}/><rect x="814" y="414" width="140" height="44" rx="6" fill="#ffb36b" opacity=".55"/><rect x="806" y="390" width="156" height="8" rx="4" fill="#2b2235"/>`
    +`<rect x="210" y="364" width="784" height="24" rx="8" fill="${ct.top}" ${o}/>`
    +`<ellipse cx="850" cy="362" rx="34" ry="6" fill="#2b2235"/><ellipse cx="930" cy="362" rx="26" ry="5" fill="#2b2235"/>`
    +`<path d="M912 352 h36 l-4 -24 h-28Z" fill="#a97cff" ${o}/><path d="M908 330 h44" stroke="#2b2235" stroke-width="5" stroke-linecap="round"/>`;
  c+=`<g class="hot" data-hot="sink" data-piece="sink"><rect x="640" y="330" width="150" height="40" fill="transparent"/><ellipse cx="715" cy="368" rx="66" ry="10" fill="#8aa7bf" ${o}/>`
    +`<path d="M700 368 V318 Q700 296 722 296 H738 Q752 296 752 310 V318" fill="none" stroke="#9fb3c8" stroke-width="10" stroke-linecap="round"/>`
    +`<path d="M700 368 V318 Q700 296 722 296 H738 Q752 296 752 310 V318" fill="none" stroke="#2b2235" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>`
    +`<circle cx="680" cy="346" r="9" fill="#e8f7ff" stroke="#2b2235" stroke-width="2.5"/><circle cx="664" cy="334" r="6" fill="#e8f7ff" stroke="#2b2235" stroke-width="2.5"/><circle cx="694" cy="326" r="5" fill="#e8f7ff" stroke="#2b2235" stroke-width="2.5"/>`
    +`${sign(715,268,'🫧 Sink')}</g>`;
  c+=`<g class="hot" data-hot="recipes" data-piece="book"><rect x="250" y="280" width="170" height="90" fill="transparent"/>`
    +`<path d="M276 366 L300 352 H372 L396 366Z" fill="#c98b52" ${o}/>`
    +`<path d="M258 352 Q296 336 334 350 V290 Q296 276 262 292Z" fill="#fff" ${o}/><path d="M334 350 Q372 336 410 352 L406 292 Q372 276 334 290Z" fill="#fff6e8" ${o}/>`
    +`<path d="M270 306 q30 -10 56 0 M270 322 q30 -10 56 0 M344 306 q28 -10 54 0" stroke="#c9b3ff" stroke-width="3" fill="none"/>`
    +`<circle cx="372" cy="326" r="11" fill="#ff5a6e" stroke="#2b2235" stroke-width="2.5"/><path d="M372 315 q3 -6 8 -6" stroke="#3f9a4d" stroke-width="2.5" fill="none"/>`
    +`<path d="M318 290 v34 l6 -6 l6 6 v-34" fill="#ff8cc6" stroke="#2b2235" stroke-width="2.5" stroke-linejoin="round"/>${sign(335,252,'📖 Recipes')}</g>`;
  F.push({y:488,h:`<g data-piece="counter">${c}</g>`});
  return split?{wall:s,floor:F}:s+F.map(f=>f.h).join('');
}

/* ---------- kitchen things to buy (🧁 Cafe theme chip) ---------- */
Object.assign(DECOR,{
  hangingPots:{name:'Hanging Pots',price:15,wall:1,box:'-150 -40 300 190',d:()=>{const L=st('#2b2235',4);
    return `<rect x="-140" y="-24" width="280" height="12" rx="6" fill="#c98b52" ${L}/>`
      +[[-96,'#ff8cc6',34],[0,'#a97cff',44],[96,'#8ff0d0',30]].map(([x,c,r])=>`<path d="M${x} -12 V${30-r/3}" stroke="#2b2235" stroke-width="4"/>`
        +`<path d="M${x-r} ${40} a${r} ${r*0.8} 0 0 0 ${2*r} 0Z" fill="${c}" ${L}/><rect x="${x-r-6}" y="34" width="${2*r+12}" height="10" rx="5" fill="${c}" ${L}/>`
        +`<path d="M${x+r+4} 39 h${r*0.7}" stroke="#2b2235" stroke-width="7" stroke-linecap="round"/>`).join('');}},
  fruitMagnets:{name:'Fruit Magnets',price:8,wall:1,box:'-70 -50 140 100',d:()=>{const L=st('#2b2235',3);
    return `<circle cx="-36" cy="-14" r="18" fill="#ff5a6e" ${L}/><path d="M-36 -32 q5 -10 13 -10" stroke="#3f9a4d" stroke-width="3" fill="none"/>`
      +`<path d="M14 -34 Q40 -30 44 0 Q30 -14 12 -8 Z" fill="#ffe066" ${L}/>`
      +`<circle cx="-4" cy="26" r="16" fill="#8bc34a" ${L}/><circle cx="-4" cy="26" r="9" fill="#d9ef9c"/><circle cx="-4" cy="26" r="2.5" fill="#2b2235"/>`
      +`<path d="${heartPath(40,30,12)}" fill="#ff8cc6" ${L}/>`;}},
  herbPots:{name:'Herb Pots',price:10,box:'-110 -120 220 128',d:()=>{const L=st('#2b2235',3.5);
    return [-64,0,64].map((x,i)=>`<path d="M${x} -40 q${-18+i*6} -40 ${-6+i*3} -70 M${x} -40 q${16-i*4} -36 ${10} -64 M${x} -40 q2 -30 -2 -56" stroke="#3f9a4d" stroke-width="5" fill="none" stroke-linecap="round"/>`
      +[[-14,-84],[10,-90],[-2,-102]].map(([a,b])=>`<ellipse cx="${x+a}" cy="${b+i*6}" rx="9" ry="6" fill="#6fd38a" ${L}/>`).join('')
      +`<path d="M${x-28} -42 H${x+28} L${x+22} 0 H${x-22}Z" fill="${['#ff9f7a','#c9b3ff','#ffd166'][i]}" ${L}/>`).join('');}},
  cupcakeRug:{name:'Cupcake Rug',price:15,flat:1,box:'-170 -70 340 140',d:()=>{const L=st('#2b2235',4);
    return `<ellipse cx="0" cy="0" rx="160" ry="58" fill="#ffd1ea" ${L}/><ellipse cx="0" cy="0" rx="130" ry="44" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 10"/>`
      +`<path d="M-40 4 H40 L30 34 H-30Z" fill="#c98b52" ${L}/><path d="M-46 6 Q-50 -26 -16 -26 Q0 -48 16 -26 Q50 -26 46 6Z" fill="#ff8cc6" ${L}/>`
      +`<circle cx="0" cy="-40" r="8" fill="#ff5a6e" ${L}/>`+[[-24,-8],[0,-14],[22,-6],[-8,0]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="9" height="4" rx="2" fill="${['#8ff0d0','#ffd166','#a97cff','#fff'][i]}"/>`).join('');}}
});
['hangingPots','fruitMagnets','herbPots','cupcakeRug'].forEach(k=>{(THEME_OF['decor:'+k]=THEME_OF['decor:'+k]||[]).push('cafe');});
