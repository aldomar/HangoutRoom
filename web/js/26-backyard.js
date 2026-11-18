'use strict';
/* =========================================================
   26. BACKYARD: the third room (v1.23)
   Saved in p.room3 {wall, floor, items}; roomNo 3 (curRoom/rooms in section 9). Same 1000 x 700 box.
   The "wall" is a fence in front of the sky, the "floor" is the ground. Fences and grounds have yard:1 and are only
   listed in the Backyard; indoor walls and floors are only listed indoors. Decorations go anywhere; the 8 outdoor
   ones (yard:1) are listed first in the Backyard's Shop.
   Built in: a tree with a swing, a soccer goal (opens Soccer), a garden shed and a chalkboard easel (opens Brain Games,
   since v1.25). The season shows in the sky, on the tree and on the ground (seasonNow, section 20). No animation loop.
   Wall, floor and decoration ids are saved: never rename them.
   ========================================================= */
EXTRA_DEFS.push(`<linearGradient id="gYardSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8ff"/><stop offset="1" stop-color="#d9f1ff"/></linearGradient>`
  +`<pattern id="pGrass" width="40" height="22" patternUnits="userSpaceOnUse"><path d="M6 20 l3 -9 l3 9 M24 14 l3 -9 l3 9" stroke="#3f9a4d" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".55"/></pattern>`
  +`<pattern id="pMeadow" width="70" height="44" patternUnits="userSpaceOnUse"><path d="M8 40 l3 -9 l3 9 M46 18 l3 -9 l3 9" stroke="#3f9a4d" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".5"/><circle cx="30" cy="12" r="5" fill="#ff9fd0"/><circle cx="30" cy="12" r="2" fill="#ffd166"/><circle cx="60" cy="36" r="4.5" fill="#fff"/><circle cx="60" cy="36" r="1.8" fill="#ffd166"/><circle cx="14" cy="26" r="4" fill="#c9b3ff"/></pattern>`
  +`<pattern id="pSand" width="30" height="26" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="2" fill="#c9a25e" opacity=".5"/><circle cx="20" cy="16" r="1.6" fill="#fff" opacity=".6"/><circle cx="12" cy="22" r="1.4" fill="#c9a25e" opacity=".45"/></pattern>`
  +`<pattern id="pStones" width="140" height="80" patternUnits="userSpaceOnUse"><path d="M6 72 l3 -9 l3 9 M96 30 l3 -9 l3 9" stroke="#3f9a4d" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".5"/><ellipse cx="40" cy="24" rx="30" ry="14" fill="#d8d2e2" stroke="#9a93a8" stroke-width="3"/><ellipse cx="108" cy="62" rx="26" ry="12" fill="#d8d2e2" stroke="#9a93a8" stroke-width="3"/></pattern>`
  +`<pattern id="pMow" width="160" height="10" patternUnits="userSpaceOnUse"><rect width="80" height="10" fill="#ffffff26"/></pattern>`);

/* ---------- fences: drawn in the strip y 290-470 in front of the sky ---------- */
const ydPickets=(cols,stroke)=>{let s='';for(let x=8,k=0;x<1000;x+=46,k++)s+=`<path d="M${x} 470 V318 L${x+17} 298 L${x+34} 318 V470Z" fill="${cols[k%cols.length]}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`;return s;};
const ydRails=c=>`<rect y="350" width="1000" height="14" fill="${c}"/><rect y="420" width="1000" height="14" fill="${c}"/>`;
const YARD_FENCES={
  picket:()=>ydRails('#d8cfe6')+ydPickets(['#ffffff'],'#8e86a0'),
  hedge:()=>`<rect y="330" width="1000" height="140" fill="#4fae5c"/>`+[...Array(18)].map((_,k)=>`<circle cx="${k*60}" cy="334" r="38" fill="#4fae5c"/>`).join('')
    +[...Array(40)].map((_,k)=>`<circle cx="${(k*97)%1000+12}" cy="${330+((k*53)%130)}" r="${5+(k%3)*2}" fill="#3f9a4d" opacity=".7"/>`).join('')
    +[...Array(14)].map((_,k)=>`<circle cx="${(k*151)%1000+30}" cy="${318+((k*71)%140)}" r="5" fill="${k%2?'#fff':'#ff9fd0'}"/><circle cx="${(k*151)%1000+30}" cy="${318+((k*71)%140)}" r="2" fill="#ffd166"/>`).join(''),
  stoneWall:()=>{let s=`<rect y="336" width="1000" height="134" fill="#a69fb4"/>`;for(let r=0;r<4;r++)for(let x=(r%2?-30:0);x<1000;x+=64)s+=`<rect x="${x+3}" y="${348+r*30}" width="58" height="26" rx="9" fill="#cfc8d8" stroke="#8e86a0" stroke-width="2.5"/>`;
    return s+`<rect y="324" width="1000" height="20" rx="6" fill="#8e86a0"/>`;},
  rainbowFence:()=>ydRails('#d8cfe6')+ydPickets(['#ff8c8c','#ffc46b','#ffe66b','#8ee08a','#7cc8ff','#b39cff'],'#2b2235'),
  batFence:()=>{let s=ydRails('#4e3191')+ydPickets(['#7d58cc','#6b46b8'],'#2b2235');
    for(let x=31;x<1000;x+=184)s+=`<path d="M${x-14} 392 q7 -9 14 0 q7 -9 14 0 q-7 2 -14 10 q-7 -8 -14 -10Z" fill="#2b2235"/><circle cx="${x-3}" cy="392" r="1.5" fill="#ffd166"/><circle cx="${x+3}" cy="392" r="1.5" fill="#ffd166"/>`;
    for(let x=100;x<1000;x+=184)s+=`<path d="${starPath(x,446,7)}" fill="#ffd166"/>`;return s;}
};
// A fence tile in Decorate: a slice of sky and the fence.
const ydTile=id=>`<svg viewBox="0 270 330 220"><rect y="270" width="330" height="220" fill="url(#gYardSky)"/>${YARD_FENCES[id]()}</svg>`;
Object.assign(WALLS,{
  picket:{name:'White Picket',price:0,yard:1,fill:'#ffffff',pat:'pDots'},
  hedge:{name:'Garden Hedge',price:15,yard:1,fill:'#4fae5c',pat:'pDots'},
  stoneWall:{name:'Stone Wall',price:15,yard:1,fill:'#b9b2c4',pat:'pDots'},
  rainbowFence:{name:'Rainbow Fence',price:20,yard:1,fill:'#ffe66b',pat:'pDots'},
  batFence:{name:'Bat Night Fence',price:20,yard:1,fill:'#6b46b8',pat:'pDots'}
});
Object.assign(FLOORS,{
  grass:{name:'Grass',price:0,yard:1,fill:'#6cc56f',pat:'pGrass'},
  meadow:{name:'Flower Meadow',price:15,yard:1,fill:'#78cc78',pat:'pMeadow'},
  sand:{name:'Sandy Beach',price:15,yard:1,fill:'#f7dc9c',pat:'pSand'},
  stones:{name:'Stepping Stones',price:15,yard:1,fill:'#6cc56f',pat:'pStones'},
  mowStripes:{name:'Soccer Stripes',price:20,yard:1,fill:'#5fbb63',pat:'pMow'}
});
const yardWall=R=>WALLS[R.wall]&&WALLS[R.wall].yard?R.wall:'picket';
const yardFloor=R=>FLOORS[R.floor]&&FLOORS[R.floor].yard?R.floor:'grass';

/* ---------- the season outside ---------- */
function yardSeason(layer){
  const s=seasonNow(), lc=['#e85d4a','#ff9a3c','#ffc23d'];
  if(layer==='sky'){
    if(s==='autumn') return [[300,120,20],[420,200,-40],[620,150,70],[700,250,10],[540,80,-60],[360,260,40]].map(([x,y,r],k)=>ssnLeaf(x,y,r,lc[k%3],1.4)).join('');
    if(s==='winter') return [[260,60],[340,150],[420,90],[500,200],[580,60],[640,170],[720,110],[300,240],[460,260],[560,250],[680,240]].map(([x,y],k)=>`<circle cx="${x}" cy="${y}" r="${4+k%3}" fill="#fff"/>`).join('');
    if(s==='spring') return [[320,130,20],[440,210,-30],[600,140,60],[700,240,10],[520,90,-50]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="#ffb3d9" transform="rotate(${r} ${x} ${y})"/>`).join('');
    return [[420,170,'#ff9fd0'],[640,230,'#ffd166']].map(([x,y,c])=>`<g transform="translate(${x} ${y})"><ellipse cx="-7" cy="0" rx="8" ry="11" fill="${c}" transform="rotate(-20)"/><ellipse cx="7" cy="0" rx="8" ry="11" fill="${c}" transform="rotate(20)"/><rect x="-1.5" y="-8" width="3" height="16" rx="1.5" fill="#2b2235"/></g>`).join('');
  }
  if(layer==='fence') return s==='winter'?`<path d="M0 300 Q40 286 80 298 Q140 284 200 298 Q280 284 360 298 Q440 284 520 298 Q600 284 680 298 Q760 284 840 298 Q920 284 1000 298 V312 H0Z" fill="#f4f8ff"/>`:'';
  // the ground, in front of the fence
  if(s==='autumn') return [[300,540,30],[330,552,-50],[640,520,10],[880,640,60],[200,650,-20],[700,670,40]].map(([x,y,r],k)=>ssnLeaf(x,y,r,lc[k%3],1.3)).join('');
  if(s==='winter') return `<ellipse cx="260" cy="560" rx="110" ry="22" fill="#f4f8ff" opacity=".9"/><ellipse cx="760" cy="660" rx="140" ry="26" fill="#f4f8ff" opacity=".9"/>`;
  if(s==='spring') return [[300,540],[640,520],[880,650],[200,660],[720,676]].map(([x,y],k)=>ssnBlossom(x,y,k%2?'#fff':'#ff9fd0',5)).join('');
  return '';
}
const YARD_TREE={autumn:['#f0913a','#e8722f'],winter:['#e8f0ff','#cfdcf5'],spring:['#7fd08a','#ffb3d9'],summer:['#5cc28a','#46a874']};

// Everything behind the furniture: the sky, the sun and clouds, the season in the air and the fence.
function yardBack(R){
  const sun=seasonNow()==='summer'?`<g stroke="#ffb020" stroke-width="6" stroke-linecap="round">${[0,1,2,3,4,5,6,7].map(k=>{const a=k*TAU/8;return `<line x1="${(880+Math.cos(a)*58).toFixed(1)}" y1="${(90+Math.sin(a)*58).toFixed(1)}" x2="${(880+Math.cos(a)*74).toFixed(1)}" y2="${(90+Math.sin(a)*74).toFixed(1)}"/>`;}).join('')}</g>`:'';
  return `<rect width="1000" height="470" fill="url(#gYardSky)"/>${sun}<circle cx="880" cy="90" r="44" fill="#ffe066" stroke="#ffb020" stroke-width="4"/>`
    +[[330,90,1],[600,150,.8],[730,60,.7]].map(([x,y,k])=>`<g transform="translate(${x} ${y}) scale(${k})" fill="#fff" opacity=".9"><ellipse cx="0" cy="0" rx="60" ry="22"/><ellipse cx="-24" cy="-14" rx="28" ry="22"/><ellipse cx="18" cy="-18" rx="32" ry="26"/></g>`).join('')
    +`<g data-season="${seasonNow()}">${yardSeason('sky')}</g>`+`<g data-fence="${yardWall(R)}">${YARD_FENCES[yardWall(R)]()}</g>`+yardSeason('fence');
}

/* ---------- built-in pieces (colours: 🎨 Colours tab, FURN_PIECES room 3) ---------- */
FURN_PIECES.shed={room:3,icon:'🏡',name:'Garden Shed',orig:{body:'#8fd3c0',roof:'#e85d8a',door:'#fff6e8'},map:c=>({body:c.l,roof:c.d,door:c.b})};
FURN_PIECES.easel={room:3,icon:'📚',name:'Chalkboard',orig:{frame:'#c98b52'},map:c=>({frame:c.m})};
function yardFurniture(split){ // split: see furniture() in section 4 (v1.39)
  const o='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"', sh=furnC('shed'), ez=furnC('easel').frame, T=YARD_TREE[seasonNow()]||YARD_TREE.summer;
  let s=`<g data-ground="1">${yardSeason('ground')}</g>`; const F=[];
  // the garden shed, against the fence (a spot for a future game)
  F.push({y:470,h:`<g data-piece="shed"><rect x="782" y="330" width="168" height="140" fill="${sh.body}" ${o}/><path d="M764 338 L866 256 L968 338Z" fill="${sh.roof}" ${o}/>`
    +`<rect x="836" y="382" width="54" height="88" rx="6" fill="${sh.door}" ${o}/><circle cx="880" cy="428" r="4" fill="#2b2235"/>`
    +`<rect x="900" y="352" width="38" height="34" rx="6" fill="#d9f1ff" ${o}/><path d="${heartPath(919,368,8)}" fill="#ff8cc6"/></g>`});
  // the tree with a rope swing
  F.push({y:572,h:`<path d="M58 572 Q80 420 74 214 H120 Q114 420 138 572Z" fill="#8b5a35" ${o}/><path d="M112 300 Q170 284 236 286" stroke="#8b5a35" stroke-width="16" fill="none" stroke-linecap="round"/>`
    +`<g data-tree="${seasonNow()}">`+[[96,150,100,0],[26,230,72,1],[176,214,80,0],[110,250,64,1]].map(([x,y,r,k])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${T[k]}" ${o}/>`).join('')+`</g>`
    +`<path d="M184 292 V488 M230 288 V488" stroke="#c9a77a" stroke-width="4"/><rect x="170" y="484" width="74" height="12" rx="5" fill="#ff8cc6" ${o}/>`});
  // the soccer goal: tap it for Soccer
  let net=''; for(let x=270;x<=402;x+=16)net+=`M${x} 372 V488 `; for(let y=384;y<=480;y+=16)net+=`M262 ${y} H410 `;
  F.push({y:492,h:`<g class="hot" data-hot="goal"><rect x="262" y="370" width="148" height="118" fill="#ffffff2a"/><path d="${net}" stroke="#fff" stroke-width="2" opacity=".75"/>`
    +`<rect x="252" y="358" width="12" height="134" rx="4" fill="#fff" ${o}/><rect x="408" y="358" width="12" height="134" rx="4" fill="#fff" ${o}/><rect x="252" y="356" width="168" height="12" rx="4" fill="#fff" ${o}/>`
    +`<circle cx="372" cy="520" r="17" fill="#fff" stroke="#2b2235" stroke-width="3"/><path d="${starPath(372,520,8,5)}" fill="#2b2235"/>${sign(336,330,'⚽ Soccer')}</g>`});
  // the chalkboard easel: 📚 Brain Games (v1.25, section 28)
  F.push({y:612,h:`<g class="hot" data-hot="brain" data-piece="easel"><path d="M712 612 L770 384 M848 612 L790 384 M780 384 L784 600" stroke="${ez}" stroke-width="10" stroke-linecap="round"/>`
    +`<rect x="694" y="400" width="172" height="124" rx="8" fill="#2f5d50" stroke="${ez}" stroke-width="10"/><rect x="694" y="400" width="172" height="124" rx="8" fill="none" stroke="#2b2235" stroke-width="3"/>`
    +`<text x="716" y="446" font-size="24" font-weight="800" fill="#fff" opacity=".9">1+2=3</text><text x="760" y="500" font-size="22" font-weight="800" fill="#ffd1ea" opacity=".9">A B C</text>`
    +`<path d="${starPath(840,430,9)}" fill="none" stroke="#ffe066" stroke-width="2.5"/><rect x="690" y="522" width="180" height="10" rx="4" fill="${ez}" ${o}/>${sign(780,372,'📚 Brain Games')}</g>`});
  return split?{wall:s,floor:F}:s+F.map(f=>f.h).join('');
}

/* ---------- outdoor decorations (yard:1, any room) ---------- */
Object.assign(DECOR,{
  trampoline:{name:'Trampoline',price:30,yard:1,box:'-135 -130 270 140',d:()=>`<path d="M-104 -66 L-112 0 M104 -66 L112 0 M-40 -50 L-44 0 M40 -50 L44 0" stroke="#3b2f52" stroke-width="8" stroke-linecap="round"/><ellipse cx="0" cy="-70" rx="122" ry="30" fill="#ff8cc6" stroke="#2b2235" stroke-width="4"/><ellipse cx="0" cy="-70" rx="102" ry="20" fill="#2b2340"/><path d="M-60 -72 Q0 -60 60 -72" stroke="#ffffff30" stroke-width="4" fill="none"/><path d="${starPath(0,-112,11)}" fill="#ffd166" stroke="#2b2235" stroke-width="2"/>`},
  slide:{name:'Slide',price:30,yard:1,box:'-125 -200 250 210',d:()=>`<path d="M-96 0 V-170 M-62 0 V-170" stroke="#7d58cc" stroke-width="9" stroke-linecap="round"/>${[-30,-62,-94,-126].map(y=>`<path d="M-96 ${y} H-62" stroke="#7d58cc" stroke-width="7"/>`).join('')}<rect x="-104" y="-180" width="74" height="16" rx="5" fill="#ffd166" stroke="#2b2235" stroke-width="4"/><path d="M-34 -172 Q20 -150 40 -80 Q60 -14 116 -10" stroke="#2b2235" stroke-width="32" fill="none" stroke-linecap="round"/><path d="M-34 -172 Q20 -150 40 -80 Q60 -14 116 -10" stroke="#8ff0d0" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M-28 -166 Q24 -146 44 -82" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>`},
  sandbox:{name:'Sandbox',price:20,yard:1,box:'-125 -95 250 105',d:()=>`<rect x="-112" y="-52" width="224" height="50" rx="8" fill="#c98b52" stroke="#2b2235" stroke-width="4"/><path d="M-100 -46 Q-40 -64 0 -50 Q50 -62 100 -46 V-14 H-100Z" fill="#f7dc9c"/><path d="M-30 -58 h22 l-3 -18 h-16z" fill="#f2c27a" stroke="#2b2235" stroke-width="3"/><path d="M-30 -76 l4 -8 l4 8 l4 -8 l4 8 l4 -8" stroke="#2b2235" stroke-width="2.5" fill="#f2c27a"/><path d="M40 -56 l-4 -26 h22 l-4 26z" fill="#ff8cc6" stroke="#2b2235" stroke-width="3"/><path d="M36 -82 q11 -14 22 0" stroke="#2b2235" stroke-width="3" fill="none"/><path d="M76 -50 L96 -86" stroke="#7cc8ff" stroke-width="5" stroke-linecap="round"/>`},
  kiddiePool:{name:'Kiddie Pool',price:20,yard:1,flat:1,box:'-125 -85 250 95',d:()=>`<ellipse cx="0" cy="-34" rx="114" ry="40" fill="#ff9fd0" stroke="#2b2235" stroke-width="4"/><ellipse cx="0" cy="-38" rx="96" ry="28" fill="#7cc8ff"/><path d="M-60 -40 q10 -6 20 0 M10 -30 q10 -6 20 0" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/><ellipse cx="40" cy="-46" rx="14" ry="9" fill="#ffd166" stroke="#2b2235" stroke-width="2.5"/><circle cx="50" cy="-58" r="7" fill="#ffd166" stroke="#2b2235" stroke-width="2.5"/><path d="M56 -58 l7 2 l-7 3z" fill="#ff9a3c"/><circle cx="51" cy="-60" r="1.4" fill="#2b2235"/>`},
  tent:{name:'Camping Tent',price:25,yard:1,box:'-125 -185 250 195',d:()=>`<path d="M-112 0 L0 -150 L112 0Z" fill="#ffb347" stroke="#2b2235" stroke-width="4" stroke-linejoin="round"/><path d="M0 -150 L-40 0 M0 -150 L40 0" stroke="#e8922f" stroke-width="4"/><path d="M-34 0 L0 -96 L34 0Z" fill="#3b2f52" stroke="#2b2235" stroke-width="3"/><path d="M0 -150 V-176" stroke="#2b2235" stroke-width="3"/><path d="M0 -176 l24 7 l-24 7z" fill="#ff8cc6" stroke="#2b2235" stroke-width="2"/><path d="${starPath(-60,-40,8)} ${starPath(62,-46,7)}" fill="#fff6c8"/>`},
  picnic:{name:'Picnic Blanket',price:10,yard:1,flat:1,box:'-155 -80 310 90',d:()=>`<path d="M-140 -8 L-100 -64 H140 L100 -8Z" fill="#ff8c8c" stroke="#2b2235" stroke-width="4" stroke-linejoin="round"/>${[-80,-40,0,40,80].map(x=>`<path d="M${x-14} -8 L${x+26} -64" stroke="#fff" stroke-width="7" opacity=".55"/>`).join('')}<path d="M-126 -28 H126 M-112 -46 H134" stroke="#fff" stroke-width="7" opacity=".55"/><rect x="40" y="-62" width="44" height="30" rx="6" fill="#c98b52" stroke="#2b2235" stroke-width="3"/><path d="M46 -62 q16 -20 32 0" stroke="#2b2235" stroke-width="3" fill="none"/>`},
  birdhouse:{name:'Birdhouse',price:15,yard:1,box:'-55 -215 110 225',d:()=>`<rect x="-6" y="-122" width="12" height="122" fill="#8b5a35" stroke="#2b2235" stroke-width="3"/><rect x="-32" y="-170" width="64" height="52" rx="4" fill="#8ff0d0" stroke="#2b2235" stroke-width="4"/><path d="M-42 -166 L0 -204 L42 -166Z" fill="#ff8cc6" stroke="#2b2235" stroke-width="4" stroke-linejoin="round"/><circle cx="0" cy="-146" r="9" fill="#2b2235"/><path d="M-6 -126 H6" stroke="#2b2235" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="-182" r="9" fill="#7cc8ff" stroke="#2b2235" stroke-width="2.5"/><path d="M38 -183 l6 2 l-6 2z" fill="#ffb020"/><circle cx="32" cy="-185" r="1.4" fill="#2b2235"/>`},
  stringLights:{name:'String Lights',price:15,yard:1,wall:1,box:'-170 -70 340 80',d:()=>{let s=`<path d="M-160 -60 Q-80 -10 0 -60 Q80 -10 160 -60" fill="none" stroke="#2b2235" stroke-width="3"/>`;const cols=['#ffd166','#ff8cc6','#8ff0d0','#c9b3ff','#7cc8ff'];
    let k=0;for(const [x0,x1] of [[-160,0],[0,160]])for(let i=1;i<=4;i++){const t=i/5,xm=(x0+x1)/2,x=(1-t)*(1-t)*x0+2*(1-t)*t*xm+t*t*x1,y=(1-t)*(1-t)*-60+2*(1-t)*t*-10+t*t*-60;
      s+=`<rect x="${(x-2).toFixed(1)}" y="${(y-2).toFixed(1)}" width="4" height="6" fill="#2b2235"/><ellipse cx="${x.toFixed(1)}" cy="${(y+12).toFixed(1)}" rx="7" ry="10" fill="${cols[k%5]}" stroke="#2b2235" stroke-width="2"/>`;k++;}return s;}}
});

/* ---------- stickers (Room & Style page) ---------- */
const yardOutdoor=p=>new Set(allItems(p).filter(i=>DECOR[i.type]&&DECOR[i.type].yard).map(i=>i.type)).size;
STICKERS.push(
  stk('yard5','room','🌳','Yard Life','circle','Put 5 things in the Backyard',5,p=>p.room3.items.filter(i=>i.placed).length),
  stk('camper','room','🏕️','Happy Camper','star','Get 3 outdoor things (trampoline, tent, slide…)',3,yardOutdoor)
);
