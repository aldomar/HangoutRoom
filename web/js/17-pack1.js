'use strict';
/* =========================================================
   17. CONTENT PACK 1 (v1.10): new clothes, decorations, walls, floors, a squishy, a spinner and pop-it shapes
   A pack only ADDS entries to the lists from earlier sections. All ids below are saved: never rename them.
   Clothes are drawn in the mascot's 200 x 270 box; decorations bottom-center at (0,0) like section 4.
   ========================================================= */

/* ---------- closet ---------- */
const PACK1_BAT='M84 156 Q90 145 96 152 Q100 146 104 152 Q110 145 116 156 Q110 154 108 161 Q104 156 100 163 Q96 156 92 161 Q90 154 84 156Z';
const p1Slipper=x=>`<ellipse cx="${x}" cy="244" rx="19" ry="11" fill="#fbf7ff" ${st('#9b8cc9',2.5)}/><ellipse cx="${x-6}" cy="231" rx="4" ry="9" fill="#fbf7ff" ${st('#9b8cc9',2)} transform="rotate(-12 ${x-6} 238)"/>`
  +`<ellipse cx="${x+6}" cy="231" rx="4" ry="9" fill="#fbf7ff" ${st('#9b8cc9',2)} transform="rotate(12 ${x+6} 238)"/><circle cx="${x-5}" cy="243" r="1.8" fill="#2a1f33"/><circle cx="${x+5}" cy="243" r="1.8" fill="#2a1f33"/><ellipse cx="${x}" cy="248" rx="3" ry="2" fill="#ff8fb8"/>`;
const p1Flower=(x,y,c)=>[0,1,2,3,4].map(k=>{const a=k*TAU/5;return `<circle cx="${(x+Math.cos(a)*5).toFixed(1)}" cy="${(y+Math.sin(a)*5).toFixed(1)}" r="4.2" fill="${c}"/>`;}).join('')+`<circle cx="${x}" cy="${y}" r="3" fill="#ffd166"/>`;
// (Cotton Candy hair became a hair color in v1.11: see HAIR_COLORS in section 3.)
CLOSET.top.items.push({id:'batSweater',name:'Bat Sweater',price:25,
  t:()=>`<path d="${TORSO}" fill="#3b2f52" ${st()}/><path d="M66 182 H134" stroke="#c9a7ff" stroke-width="4" stroke-dasharray="6 4"/><path d="${PACK1_BAT}" fill="#c9a7ff" ${st('#1f1a26',1.5)}/><circle cx="97" cy="154" r="1.3" fill="#ff6fae"/><circle cx="103" cy="154" r="1.3" fill="#ff6fae"/>`,
  s:()=>sleeves('#3b2f52',58)+`<g stroke="#c9a7ff" stroke-width="4"><path d="M37 184 l18 -7" transform="${LA}"/><path d="M145 177 l18 7" transform="${RA}"/></g>`});
CLOSET.bottom.items.push({id:'galaxySkirt',name:'Galaxy Skirt',price:20,d:()=>`<path d="M60 180 H140 L152 214 Q100 224 48 214 Z" fill="#2b2350" ${st()}/>`
  +[[72,198,4],[100,192,3],[126,203,4.5],[88,210,3],[114,211,3]].map(([x,y,r])=>`<path d="${starPath(x,y,r)}" fill="${r>3.5?'#ffd166':'#fff'}"/>`).join('')});
CLOSET.legs.items.push({id:'mintFuzz',name:'Mint Fluff',price:15,d:()=>lw('#a6f0d5','#5fc9a6')});
CLOSET.arms.items.push({id:'rainbow',name:'Rainbow Fluff',price:20,d:()=>aw('url(#rainbowS)')});
CLOSET.shoes.items.push({id:'slippers',name:'Bunny Slippers',price:20,d:()=>p1Slipper(82)+p1Slipper(118)});
CLOSET.acc.items.push(
  {id:'flowers',name:'Flower Crown',price:20,d:()=>`<path d="M62 56 Q100 34 138 56" stroke="#5cc28a" stroke-width="4" fill="none"/>`+p1Flower(66,55,'#ff9fd0')+p1Flower(84,45,'#c9a7ff')+p1Flower(100,42,'#fff')+p1Flower(116,45,'#8ff0d0')+p1Flower(134,55,'#ff9fd0')},
  {id:'heartShades',name:'Heart Shades',price:15,d:()=>`<g fill="#ff4fa3" fill-opacity=".85" ${st('#1f1a26',2.5)}><path d="${heartPath(80,99,11)}"/><path d="${heartPath(120,99,11)}"/></g><path d="M91 96 Q100 91 109 96" stroke="#1f1a26" stroke-width="3" fill="none"/><path d="M73 93 l4 -3" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`}
);
CARD_TAGS.cute.push('bottom:galaxySkirt','legs:mintFuzz','arms:rainbow','shoes:slippers','acc:flowers','acc:heartShades');
CARD_TAGS.spooky.push('top:batSweater','bottom:galaxySkirt');
CARD_TAGS.sporty.push('acc:heartShades');

/* ---------- room: walls, floors, decorations ---------- */
EXTRA_DEFS.push(
  `<pattern id="pStripeV" width="60" height="10" patternUnits="userSpaceOnUse"><rect width="30" height="10" fill="#ffffff40"/></pattern>`,
  `<pattern id="pClouds" width="220" height="160" patternUnits="userSpaceOnUse"><g fill="#fff" opacity=".7"><circle cx="40" cy="40" r="16"/><circle cx="60" cy="34" r="20"/><circle cx="80" cy="42" r="14"/><circle cx="150" cy="116" r="12"/><circle cx="166" cy="110" r="16"/><circle cx="182" cy="118" r="11"/></g></pattern>`,
  `<pattern id="pTilesL" width="70" height="70" patternUnits="userSpaceOnUse"><rect width="35" height="35" fill="#ffffff55"/><rect x="35" y="35" width="35" height="35" fill="#ffffff55"/></pattern>`,
  `<pattern id="pCheckRug" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#f4f0f8"/><rect width="12" height="12" fill="#2e2a36"/><rect x="12" y="12" width="12" height="12" fill="#2e2a36"/></pattern>`
);
Object.assign(WALLS,{
  peachStripe:{name:'Peachy Stripes',price:20,fill:'#ffd3b8',pat:'pStripeV'},
  skyCloud:{name:'Sky Clouds',price:25,fill:'#bfe3ff',pat:'pClouds'}
});
Object.assign(FLOORS,{
  mintTiles:{name:'Mint Tiles',price:20,fill:'#bfeedd',pat:'pTilesL'},
  cloudCarpet:{name:'Cloud Carpet',price:20,fill:'#e3d6ff',pat:'pFluff'}
});
const p1Line='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"';
const p1Bat=(x,y,s)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M-16 0 Q-10 -10 -4 -4 Q0 -10 4 -4 Q10 -10 16 0 Q10 -2 8 4 Q4 0 0 6 Q-4 0 -8 4 Q-10 -2 -16 0Z" fill="#3b2f52" stroke="#1a1422" stroke-width="1.5"/>`;
Object.assign(DECOR,{
  bookNook:{name:'Book Nook',price:25,box:'-90 -190 180 200',d:()=>{const cols=['#ff8cc6','#a97cff','#8ff0d0','#ffd166','#7fc8ff','#ffab7a'];
    let s=`<ellipse cx="0" cy="-2" rx="78" ry="8" fill="#00000030"/><rect x="-72" y="-176" width="144" height="176" rx="8" fill="#b07a4f" ${p1Line}/>`;
    [-166,-110,-54].forEach((y,r)=>{let x=-62;for(let k=0;k<6;k++){const w=12+((k*7+r*3)%3)*4,h=40+((k+r)%3)*6;s+=`<rect x="${x}" y="${y+48-h}" width="${w}" height="${h}" rx="2" fill="${cols[(k+r*2)%6]}" stroke="#2b2235" stroke-width="2"/>`;x+=w+2;if(x>50)break;}
      s+=`<rect x="-66" y="${y+48}" width="132" height="8" fill="#8a5e35"/>`;});
    return s;}},
  disco:{name:'Disco Ball',price:25,wall:1,box:'-70 -200 140 200',d:()=>{let s=`<line x1="0" y1="-196" x2="0" y2="-120" stroke="#3b2f52" stroke-width="3"/><circle cx="0" cy="-80" r="42" fill="#c9cfe0" ${p1Line}/>`;
    for(let r=0;r<5;r++)for(let c=0;c<5;c++){const x=-34+c*14,y=-114+r*14;if(Math.hypot(x+7,y+87)<38)s+=`<rect x="${x}" y="${y}" width="12" height="12" fill="${(r+c)%3?'#eef1fb':'#a9c8ff'}"/>`;}
    return s+`<path d="${starPath(-52,-120,7)} ${starPath(50,-60,6)} ${starPath(46,-130,4)}" fill="#ffd166"/>`;}},
  cushions:{name:'Floor Cushions',price:15,box:'-100 -110 200 120',d:()=>`<ellipse cx="0" cy="-3" rx="88" ry="9" fill="#00000030"/><rect x="-86" y="-40" width="172" height="40" rx="18" fill="#a97cff" ${p1Line}/><rect x="-62" y="-80" width="124" height="42" rx="18" fill="#ff8cc6" ${p1Line}/><path d="${heartPath(0,-60,9)}" fill="#fff"/><circle cx="-60" cy="-20" r="4" fill="#fff"/><circle cx="60" cy="-20" r="4" fill="#fff"/>`},
  batGarland:{name:'Bat Garland',price:20,wall:1,box:'-170 -140 340 100',d:()=>`<path d="M-160 -120 Q-80 -60 0 -110 Q80 -60 160 -120" fill="none" stroke="#3b2f52" stroke-width="3"/>`
    +[[-120,-92],[-60,-80],[0,-104],[60,-80],[120,-92]].map(([x,y],k)=>p1Bat(x,y+12,1.3)+`<circle cx="${x-3}" cy="${y+12}" r="1.3" fill="#ff8cc6"/><circle cx="${x+3}" cy="${y+12}" r="1.3" fill="#ff8cc6"/>`).join('')},
  eggChair:{name:'Egg Chair',price:40,box:'-110 -260 220 270',d:()=>`<ellipse cx="0" cy="-3" rx="70" ry="9" fill="#00000030"/><path d="M0 -250 V-200" stroke="#3b2f52" stroke-width="6"/><path d="M-60 0 Q0 -40 60 0 M0 -20 V-250 M-30 -250 H30" stroke="#3b2f52" stroke-width="8" fill="none" stroke-linecap="round"/>`
    +`<path d="M-62 -110 Q-66 -200 0 -205 Q66 -200 62 -110 Q60 -52 0 -48 Q-60 -52 -62 -110Z" fill="#fbf7ff" ${p1Line}/><path d="M-46 -112 Q-46 -176 0 -180 Q46 -176 46 -112 Q44 -70 0 -66 Q-44 -70 -46 -112Z" fill="#c9a7ff"/>`
    +`<ellipse cx="0" cy="-82" rx="40" ry="14" fill="#ff8cc6" ${p1Line}/><circle cx="-14" cy="-110" r="10" fill="#8ff0d0" stroke="#2b2235" stroke-width="3"/>`},
  cloudShelf:{name:'Cloud Shelf',price:15,wall:1,box:'-90 -150 180 140',d:()=>`<path d="M-70 -40 Q-80 -70 -50 -70 Q-40 -96 -10 -84 Q10 -104 36 -84 Q70 -90 66 -60 Q84 -40 60 -40Z" fill="#fff" ${p1Line}/>`
    +`<rect x="-30" y="-122" width="22" height="38" rx="4" fill="#8ff0d0" stroke="#2b2235" stroke-width="3"/><path d="${starPath(26,-104,16)}" fill="#ffd166" stroke="#2b2235" stroke-width="3"/>`},
  starMirror:{name:'Star Mirror',price:20,wall:1,box:'-80 -170 160 170',d:()=>`<path d="${starPath(0,-86,74,40)}" fill="#ffd166" ${p1Line}/><circle cx="0" cy="-84" r="36" fill="#d9f2ff" stroke="#2b2235" stroke-width="3"/><path d="M-16 -100 L4 -116 M-8 -82 L14 -98" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`},
  checkerRug:{name:'Checker Rug',price:15,flat:1,box:'-170 -80 340 90',d:()=>`<rect x="-160" y="-66" width="320" height="64" rx="14" fill="url(#pCheckRug)" stroke="#ff8cc6" stroke-width="6"/>`}
});

/* ---------- fidgets ---------- */
SQUISHIES.ghost={name:'Ghosty',price:20,fill:'#f4f0ff',shade:'#cfc4ee',line:'#9b8cc9',hi:'#ffffff',extra:'ghost'};
SPINS.batwing={name:'Batwing',price:20,body:'#2a2236',edge:'#a97cff',cap:'#ff8cc6',deco:'bat'};
// Pop-it board shapes (owned as popshape:<id>). The path is in a 100 x 100 box (it may poke out a little);
// bubbles that don't fit inside it are left out.
Object.assign(POP_SHAPES,{
  heart:{name:'❤️ Heart Board',price:15,path:'M50 101 C17 81 -5 59 -4 30 C-3 4 30 -7 50 15 C70 -7 103 4 104 30 C105 59 83 81 50 101Z'},
  star:{name:'⭐ Star Board',price:15,path:starPath(50,54,62,34)}
});
