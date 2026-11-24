'use strict';
/* =========================================================
   4. ROOM: walls, floors, furniture, decorations
   Room is a 1000 x 700 box. Decor items draw with (0,0) at their bottom-center.
   ========================================================= */
const WALLS={
  lavender:{name:'Lavender Dream',price:0,fill:'#cdb8f0',pat:'pDots'},
  bubblegum:{name:'Bubblegum',price:20,fill:'#ffc1dc',pat:'pHearts'},
  mint:{name:'Mint Cloud',price:20,fill:'#bfeee0',pat:'pDots'},
  midnight:{name:'Midnight Stars',price:30,fill:'#2b2340',pat:'pStars'},
  checker:{name:'Emo Checker',price:30,fill:'#2e2a36',pat:'pCheck'}
};
const FLOORS={
  wood:{name:'Cozy Wood',price:0,fill:'#c49a74',pat:'pPlanks'},
  carpet:{name:'Fluffy Pink',price:20,fill:'#f5b3d1',pat:'pFluff'},
  tiles:{name:'Checker Tiles',price:25,fill:'#efeaf5',pat:'pTiles'},
  turf:{name:'Soccer Turf',price:20,fill:'#6cc56f',pat:'pTurf'},
  galaxy:{name:'Galaxy',price:30,fill:'#262046',pat:'pStars'}
};
const DECOR={
  starRug:{name:'Star Rug',price:20,flat:1,box:'-175 -80 350 90',d:()=>`<ellipse cx="0" cy="-30" rx="165" ry="42" fill="#b892ff" stroke="#6b46b8" stroke-width="5"/><ellipse cx="0" cy="-30" rx="135" ry="30" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 9" opacity=".7"/>`+[[-80,'#ffd166'],[0,'#ff8cc6'],[80,'#8ff0d0']].map(([x,c])=>`<path d="${starPath(x,-30,15)}" fill="${c}"/>`).join('')},
  heartRug:{name:'Heart Rug',price:20,flat:1,box:'-130 -80 260 90',d:()=>`<g transform="translate(0 -32) scale(1 .45)"><path d="${heartPath(0,0,70)}" fill="#ff8cc6" stroke="#c8578f" stroke-width="9"/><path d="${heartPath(0,0,48)}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="12 10" opacity=".7"/></g>`},
  beanbag:{name:'Bean Bag',price:15,box:'-110 -120 220 130',d:()=>`<ellipse cx="0" cy="-4" rx="88" ry="12" fill="#00000030"/><path d="M-85 -6 C-100 -80 -40 -110 0 -100 C50 -110 100 -70 85 -6 Q0 8 -85 -6Z" fill="#8b5cf6" stroke="#4c2d91" stroke-width="5"/><path d="M-50 -60 Q-20 -85 20 -78" stroke="#c4a6ff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>`},
  bed:{name:'Cozy Bed',price:40,box:'-180 -160 360 170',d:()=>`<rect x="-172" y="-150" width="34" height="150" rx="10" fill="#5b3a99" stroke="#2b2235" stroke-width="5"/><rect x="-160" y="-62" width="320" height="62" rx="10" fill="#5b3a99" stroke="#2b2235" stroke-width="5"/><rect x="-150" y="-98" width="300" height="46" rx="18" fill="#fff" stroke="#2b2235" stroke-width="4"/><path d="M-60 -102 H140 Q158 -102 158 -82 V-52 H-60Z" fill="#ff8cc6" stroke="#2b2235" stroke-width="4"/><rect x="-140" y="-122" width="72" height="34" rx="14" fill="#e9ddff" stroke="#2b2235" stroke-width="4"/>${[[0,-78],[60,-70],[115,-82]].map(([x,y])=>`<path d="${heartPath(x,y,7)}" fill="#fff" opacity=".8"/>`).join('')}`},
  plant:{name:'Happy Plant',price:10,box:'-80 -170 160 180',d:()=>[-42,-20,0,20,42].map(a=>`<ellipse cx="0" cy="-98" rx="13" ry="42" fill="#5cc28a" stroke="#2b6a4a" stroke-width="3" transform="rotate(${a} 0 -55)"/>`).join('')+`<path d="M-30 -56 H30 L21 0 H-21Z" fill="#ff8cc6" stroke="#2b2235" stroke-width="4"/><circle cx="-9" cy="-32" r="3" fill="#2b2235"/><circle cx="9" cy="-32" r="3" fill="#2b2235"/><path d="M-6 -24 q6 5 12 0" stroke="#2b2235" stroke-width="2.5" fill="none" stroke-linecap="round"/>`},
  lava:{name:'Lava Lamp',price:15,box:'-60 -150 120 160',d:()=>`<path d="M-14 -34 L-24 -112 Q0 -128 24 -112 L14 -34Z" fill="#ffd1ea" stroke="#1d1724" stroke-width="3"/><circle class="an-lava1" cx="-4" cy="-48" r="9" fill="#ff4fa3"/><circle class="an-lava2" cx="5" cy="-96" r="7" fill="#a97cff"/><path d="M-24 0 L-14 -34 H14 L24 0Z" fill="#3b2f52" stroke="#1d1724" stroke-width="3"/><path d="M-12 -116 h24 l-5 -14 h-14z" fill="#3b2f52" stroke="#1d1724" stroke-width="3"/>`},
  lights:{name:'Fairy Lights',price:20,wall:1,box:'-165 -130 330 90',d:()=>{let s=`<path d="M-150 -110 Q-75 -60 0 -110 Q75 -60 150 -110" fill="none" stroke="#3b2f52" stroke-width="3"/>`;const cols=['#ffd166','#ff8cc6','#8ff0d0','#a97cff'];let k=0;for(const [x0,x1] of [[-150,0],[0,150]]){for(let i=1;i<=4;i++){const t=i/5,xm=(x0+x1)/2;const x=(1-t)*(1-t)*x0+2*(1-t)*t*xm+t*t*x1;const y=(1-t)*(1-t)*-110+2*(1-t)*t*-60+t*t*-110;s+=`<circle cx="${x.toFixed(1)}" cy="${(y+9).toFixed(1)}" r="8" fill="${cols[k%4]}" class="an-tw" style="animation-delay:-${(k*0.2).toFixed(1)}s"/>`;k++;}}return s;}},
  neon:{name:'Neon Heart',price:25,wall:1,box:'-90 -150 180 160',d:()=>`<path d="${heartPath(0,-70,42)}" fill="none" stroke="#ff4fa3" stroke-width="9" filter="url(#glow)"/><path d="${heartPath(0,-70,42)}" fill="none" stroke="#ffd1ea" stroke-width="3"/>`},
  lightstick:{name:'Light Stick',price:15,box:'-50 -160 100 170',d:()=>`<rect x="-20" y="-12" width="40" height="12" rx="4" fill="#3b2f52"/><rect x="-6" y="-92" width="12" height="82" rx="5" fill="#f3ecff" stroke="#2b2235" stroke-width="3"/><path d="${heartPath(0,-118,24)}" fill="#ff8cc6" stroke="#fff" stroke-width="3" filter="url(#glow)" class="an-glow"/><path d="${starPath(28,-140,6)}" fill="#ffd166"/>`},
  speaker:{name:'Music Speaker',price:20,box:'-70 -170 140 180',d:()=>`<rect x="-40" y="-110" width="80" height="110" rx="12" fill="#2a2430" stroke="#120d17" stroke-width="4"/><circle cx="0" cy="-38" r="24" fill="#3d3547" stroke="#a97cff" stroke-width="4"/><circle cx="0" cy="-38" r="8" fill="#a97cff"/><circle cx="0" cy="-86" r="11" fill="#3d3547" stroke="#ff8cc6" stroke-width="3"/><text class="an-note" x="28" y="-115" font-size="30" fill="#ff8cc6">♪</text><text class="an-note2" x="-40" y="-115" font-size="24" fill="#8ff0d0">♫</text>`},
  gaming:{name:'Game Station',price:30,box:'-90 -170 180 180',d:()=>`<rect x="-80" y="-62" width="160" height="14" rx="5" fill="#ffb3d9" stroke="#2b2235" stroke-width="4"/><rect x="-70" y="-48" width="12" height="48" fill="#e48fbf" stroke="#2b2235" stroke-width="3"/><rect x="58" y="-48" width="12" height="48" fill="#e48fbf" stroke="#2b2235" stroke-width="3"/><rect x="-8" y="-80" width="16" height="20" fill="#2b2235"/><rect x="-60" y="-160" width="120" height="84" rx="8" fill="#1d1724" stroke="#2b2235" stroke-width="4"/><rect x="-52" y="-152" width="104" height="68" fill="#7ec8ff"/><rect x="-52" y="-100" width="104" height="16" fill="#69db7c"/><rect x="-14" y="-140" width="18" height="16" fill="#ffd166" stroke="#2b2235" stroke-width="2"/><rect x="-16" y="-124" width="22" height="16" fill="#ff6b8a" stroke="#2b2235" stroke-width="2"/><rect x="-15" y="-108" width="8" height="10" fill="#4dabf7"/><rect x="-3" y="-108" width="8" height="10" fill="#4dabf7"/><path d="${starPath(30,-130,8)}" fill="#ffd166"/>`},
  goal:{name:'Mini Soccer Goal',price:20,box:'-110 -130 220 140',d:()=>`<g stroke="#ddd" stroke-width="2" opacity=".8">${[-80,-60,-40,-20,0,20,40,60,80].map(x=>`<line x1="${x}" y1="-100" x2="${x*0.85}" y2="-6"/>`).join('')}${[-80,-60,-40,-20].map(y=>`<line x1="-90" y1="${y}" x2="90" y2="${y}"/>`).join('')}</g><path d="M-95 0 V-104 H95 V0" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round"/><circle cx="60" cy="-16" r="15" fill="#fff" stroke="#333" stroke-width="2"/><path d="M60 -22 l5 4 -2 6 h-6 l-2 -6z" fill="#333"/>`},
  ball:{name:'Soccer Ball',price:5,box:'-40 -65 80 70',d:()=>`<ellipse cx="0" cy="-2" rx="26" ry="5" fill="#00000030"/><circle cx="0" cy="-30" r="28" fill="#fff" stroke="#333" stroke-width="3"/><path d="M0 -40 l9 7 -3 11 h-12 l-3 -11z" fill="#333"/><path d="M-26 -38 l8 2 M26 -38 l-8 2 M-14 -6 l4 -8 M14 -6 l-4 -8" stroke="#333" stroke-width="3"/>`},
  ghost:{name:'Ghost Plush',price:12,box:'-55 -125 110 130',d:()=>`<path d="M-40 0 V-60 Q-40 -112 0 -112 Q40 -112 40 -60 V0 Q30 -12 20 0 Q10 -12 0 0 Q-10 -12 -20 0 Q-30 -12 -40 0Z" fill="#fbf7ff" stroke="#5b4a6b" stroke-width="4"/><ellipse cx="-13" cy="-66" rx="5" ry="7" fill="#2a1f33"/><ellipse cx="13" cy="-66" rx="5" ry="7" fill="#2a1f33"/><ellipse cx="-24" cy="-52" rx="6" ry="4" fill="#ff8fb8" opacity=".6"/><ellipse cx="24" cy="-52" rx="6" ry="4" fill="#ff8fb8" opacity=".6"/><ellipse cx="0" cy="-50" rx="5" ry="6" fill="#2a1f33"/>`},
  bat:{name:'Bat Plush',price:12,box:'-90 -100 180 110',d:()=>`<g fill="#6b46b8" stroke="#1a1422" stroke-width="3"><path d="M-30 -40 Q-60 -80 -85 -50 Q-70 -46 -72 -34 Q-58 -40 -56 -26 Q-44 -34 -30 -24Z"/><path d="M30 -40 Q60 -80 85 -50 Q70 -46 72 -34 Q58 -40 56 -26 Q44 -34 30 -24Z"/></g><path d="M-22 -58 L-16 -82 L-6 -62 M22 -58 L16 -82 L6 -62" fill="#2a2430" stroke="#1a1422" stroke-width="3"/><circle cx="0" cy="-36" r="34" fill="#2a2430" stroke="#1a1422" stroke-width="4"/><circle cx="-12" cy="-42" r="7" fill="#fff"/><circle cx="12" cy="-42" r="7" fill="#fff"/><circle cx="-11" cy="-41" r="3.5" fill="#ff4fa3"/><circle cx="13" cy="-41" r="3.5" fill="#ff4fa3"/><path d="M-6 -24 l3 6 3 -6 M2 -24 l3 6 3 -6" fill="#fff"/>`},
  blob:{name:'Squish Plush',price:10,box:'-60 -90 120 100',d:()=>`<path d="M-48 0 Q-56 -70 0 -76 Q56 -70 48 0Z" fill="#a6f0d5" stroke="#4fa889" stroke-width="4"/><circle cx="-14" cy="-38" r="5" fill="#2a1f33"/><circle cx="14" cy="-38" r="5" fill="#2a1f33"/><path d="M-6 -28 q3 4 6 0 q3 4 6 0" stroke="#2a1f33" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="-26" cy="-28" rx="7" ry="4" fill="#ff8fb8" opacity=".6"/><ellipse cx="26" cy="-28" rx="7" ry="4" fill="#ff8fb8" opacity=".6"/>`},
  // A framed drawing from the Art Desk. Not sold in the Shop (art:1); made with "Hang in room" in the Gallery.
  // The room item has an extra field: art = the drawing's id.
  poster:{name:'My Poster',price:0,wall:1,art:1,box:'-82 -138 164 146',d:i=>{const t=i&&ART_THUMBS[i.art];
    return `<rect x="-75" y="-124" width="150" height="110" rx="6" fill="#fff" stroke="#5b4a6b" stroke-width="5"/>`
      +(t?`<image href="${esc(t)}" x="-68" y="-117" width="136" height="96" preserveAspectRatio="xMidYMid slice"/>`
         :`<rect x="-68" y="-117" width="136" height="96" fill="#e9ddff"/><text x="0" y="-55" text-anchor="middle" font-size="40">🎨</text>`)
      +`<circle cx="0" cy="-124" r="8" fill="#ff8cc6" stroke="#2b2235" stroke-width="3"/>`;}},
  // Soccer trophies: won with a perfect 5/5 on each level (award:1 = never in the Shop).
  trophyBronze:{name:'Bronze Trophy',price:0,award:1,box:'-70 -150 140 160',d:()=>trophyArt('#cd7f32','#f2b77c','#7a4518','EASY')},
  trophySilver:{name:'Silver Trophy',price:0,award:1,box:'-70 -150 140 160',d:()=>trophyArt('#b9c2cf','#f1f5fa','#5d6675','MEDIUM')},
  trophyGold:{name:'Gold Trophy',price:0,award:1,box:'-70 -150 140 160',d:()=>trophyArt('#ffc83d','#fff1b8','#a8730f','HARD')},
  // Stage prize: 3 stars on Hard (any song), given once (award:1 = never in the Shop).
  goldenMic:{name:'Golden Mic',price:0,award:1,box:'-70 -200 140 210',d:()=>{const o=`stroke="#2b2235" stroke-width="4" stroke-linejoin="round"`;
    return `<ellipse cx="0" cy="-2" rx="46" ry="7" fill="#00000030"/><rect x="-40" y="-16" width="80" height="16" rx="7" fill="#5b3a99" ${o}/>`
      +`<rect x="-5" y="-120" width="10" height="106" rx="4" fill="#3b2f52" ${o}/><path d="M-18 -116 Q0 -100 18 -116" fill="none" stroke="#2b2235" stroke-width="5" stroke-linecap="round"/>`
      +`<path d="M-11 -128 L-7 -112 H7 L11 -128Z" fill="#a8730f" ${o}/><circle cx="0" cy="-150" r="27" fill="url(#gGold)" ${o}/>`
      +`<path d="M-24 -150 H24 M-20 -138 H20 M-20 -162 H20 M0 -176 V-124 M-12 -172 V-128 M12 -172 V-128" stroke="#a8730f" stroke-width="2" opacity=".6"/>`
      +`<path d="M-15 -164 Q-10 -172 -2 -173" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`
      +`<path d="${starPath(-36,-176,9)} ${starPath(38,-160,7)} ${starPath(30,-192,5)}" fill="#ffd166" stroke="#2b2235" stroke-width="1.5"/>`
      +`<text x="0" y="-4" text-anchor="middle" font-size="11" font-weight="900" fill="#ffd166">STAR</text>`;}},
  moon:{name:'Moon Lamp',price:15,box:'-60 -140 120 150',d:()=>`<rect x="-26" y="-14" width="52" height="14" rx="6" fill="#3b2f52"/><rect x="-4" y="-50" width="8" height="38" fill="#3b2f52"/><path d="M8 -128 A40 40 0 1 0 8 -48 A30 30 0 1 1 8 -128Z" fill="#ffe9a8" stroke="#e8b84a" stroke-width="3" filter="url(#glow)"/>`},
  // Wall shelves (v1.11). shelf = {w: width of the top, top: height of the top above the item's (0,0)}.
  // In Decorate, standing things dropped near the top snap onto it, and moving a shelf takes them along.
  shelfS:{name:'Little Shelf',price:10,wall:1,shelf:{w:160,top:44},box:'-95 -60 190 70',d:()=>shelfArt(160)},
  shelfL:{name:'Long Shelf',price:15,wall:1,shelf:{w:300,top:44},box:'-165 -60 330 70',d:()=>shelfArt(300)}
};

function shelfArt(w){const h=w/2, o='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"';
  return [-1,1].map(k=>`<path d="M${k*(h-26)} -30 V-4 L${k*(h-26)-k*22} -30Z" fill="#ff8cc6" ${o}/>`).join('')
    +`<rect x="${-h}" y="-44" width="${w}" height="16" rx="5" fill="#fbf2e6" ${o}/><rect x="${-h+6}" y="-34" width="${w-12}" height="3" fill="#e7d6c2"/>`;}
// A trophy cup with a soccer-ball badge, drawn bottom-center at (0,0) like the other decorations.
function trophyArt(main,light,dark,label){
  const o=`stroke="#2b2235" stroke-width="4" stroke-linejoin="round"`;
  return `<ellipse cx="0" cy="-2" rx="44" ry="7" fill="#00000030"/>`
    +`<path d="M-34 -96 Q-62 -98 -56 -72 Q-50 -54 -26 -56" fill="none" stroke="#2b2235" stroke-width="11" stroke-linecap="round"/><path d="M34 -96 Q62 -98 56 -72 Q50 -54 26 -56" fill="none" stroke="#2b2235" stroke-width="11" stroke-linecap="round"/>`
    +`<path d="M-34 -96 Q-62 -98 -56 -72 Q-50 -54 -26 -56" fill="none" stroke="${main}" stroke-width="5" stroke-linecap="round"/><path d="M34 -96 Q62 -98 56 -72 Q50 -54 26 -56" fill="none" stroke="${main}" stroke-width="5" stroke-linecap="round"/>`
    +`<rect x="-38" y="-26" width="76" height="26" rx="5" fill="#5b3a99" ${o}/><rect x="-28" y="-20" width="56" height="13" rx="3" fill="${light}"/>`
    +`<text x="0" y="-9.5" text-anchor="middle" font-size="10" font-weight="900" fill="${dark}">${label}</text>`
    +`<path d="M-9 -26 L-6 -48 H6 L9 -26Z" fill="${main}" ${o}/><ellipse cx="0" cy="-48" rx="16" ry="5" fill="${main}" ${o}/>`
    +`<path d="M-38 -132 H38 Q38 -64 0 -52 Q-38 -64 -38 -132Z" fill="${main}" ${o}/><ellipse cx="0" cy="-132" rx="38" ry="7" fill="${light}" ${o}/>`
    +`<path d="M-25 -122 Q-27 -84 -11 -66" stroke="${light}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".75"/>`
    +`<circle cx="4" cy="-96" r="15" fill="#fff" stroke="#2b2235" stroke-width="3"/><path d="M4 -103 l6 4.5 -2.3 7 h-7.4 l-2.3 -7z" fill="#2b2235"/>`
    +`<path d="${starPath(-22,-142,7)} ${starPath(24,-144,5)}" fill="#fff" opacity=".9"/>`;
}
const LOCKED={}; // every room area is open since v1.5; add future locked areas here
function sign(x,y,text,locked){
  const w=Math.round(text.length*11.5+34);
  return `<g class="sign${locked?'':' bob'}"><rect x="${x-w/2}" y="${y-20}" width="${w}" height="40" rx="20" ${locked?'fill="#4a3d63"':'style="fill:var(--pink)"'} stroke="#2b2235" stroke-width="3"/><text x="${x}" y="${y+7}" text-anchor="middle" font-size="20" font-weight="800" ${locked?'fill="#e2d8f0"':'style="fill:var(--pink-ink)"'}>${text}</text></g>`;
}
// Stage marquee (open since v1.7; in the Cozy Loft since v1.12). Drawn at x 766-964, y 6-104; the Loft moves it with a
// transform. Two groups of bulbs twinkle in turn.
function stageMarquee(){
  const bulbs=(k)=>{let b='';for(let i=0;i<9;i++){const x=788+i*19.5;if(i%2===k)b+=`<circle cx="${x}" cy="16" r="5"/><circle cx="${x}" cy="94" r="5"/>`;}
    [[0,36],[1,55],[0,74]].forEach(([q,y])=>{if(q===k)b+=`<circle cx="776" cy="${y}" r="5"/><circle cx="954" cy="${y}" r="5"/>`;});return b;};
  return `<g class="hot" data-hot="stage"><rect x="766" y="6" width="198" height="98" rx="16" fill="#2b2340" stroke="#ff8cc6" stroke-width="5"/>`
    +`<g fill="#ffd166" class="an-bulb">${bulbs(0)}</g>`
    +`<g fill="#8ff0d0" class="an-bulb2">${bulbs(1)}</g>`
    +`<text x="865" y="68" text-anchor="middle" font-size="32" font-weight="900" fill="#ffd1ea" filter="url(#glow)">🎤 Stage</text></g>`;
}
function furniture(split){ // split (v1.39): {wall, floor:[{y, h}]} so floor pieces can be sorted with the room's things
  let s=''; const F=[]; const cu=furnC('curtain'), sh=furnC('shelf'), cl=furnC('closet'), dk=furnC('desk'); // colors (v1.20, section 23)
  // window -> soccer field (open since v1.5); since v1.40 a shortcut out to the Backyard (Soccer is at its goal)
  s+=`<g class="hot" data-hot="window"><rect x="80" y="60" width="230" height="185" rx="12" fill="#fff" stroke="#5b4a6b" stroke-width="5"/><rect x="94" y="74" width="202" height="157" rx="6" fill="url(#gSky)"/><rect x="94" y="182" width="202" height="49" fill="#6cc56f"/>${seasonWindow(1,'ground')}<g stroke="#fff" stroke-width="2" opacity=".7"><line x1="216" y1="160" x2="216" y2="182"/><line x1="236" y1="160" x2="236" y2="182"/><line x1="256" y1="160" x2="256" y2="182"/><line x1="200" y1="170" x2="272" y2="170"/></g><path d="M200 182 V152 H272 V182" fill="none" stroke="#fff" stroke-width="5"/><circle cx="148" cy="204" r="11" fill="#fff" stroke="#333" stroke-width="2"/><path d="M148 199 l4 3 -1.5 5 h-5 l-1.5 -5z" fill="#333"/><circle cx="130" cy="100" r="16" fill="#fff" opacity=".9"/><circle cx="146" cy="96" r="20" fill="#fff" opacity=".9"/><circle cx="164" cy="102" r="14" fill="#fff" opacity=".9"/>${seasonWindow(1,'air')}<path d="M68 52 Q112 150 84 258 L64 258 Z" fill="${cu.fill}" stroke="${cu.line}" stroke-width="4"/><path d="M322 52 Q278 150 306 258 L326 258 Z" fill="${cu.fill}" stroke="${cu.line}" stroke-width="4"/>${sign(195,278,'🌳 Outside')}</g>`;
  // photocard wall (open since v1.4): up to 3 pinned cards, drawn without the fuzz filter to stay light
  const pp=P(), pins=pp?pp.cardPins.map(id=>pp.cards.find(c=>c.id===id)).filter(Boolean):[];
  s+=`<g class="hot" data-hot="photo"><rect x="385" y="34" width="230" height="140" rx="10" fill="#d9a46c" stroke="#8a5e35" stroke-width="5"/>${[[415,52,-6],[472,48,4],[530,54,-3]].map(([x,y,r],i)=>`<g transform="rotate(${r} ${x+28} ${y+40})">`
    +(pins[i]?cardSVG(pins[i],true,`x="${x}" y="${y}" width="56" height="78"`)
      :`<rect x="${x}" y="${y}" width="56" height="78" rx="4" fill="#fff" stroke="#8a5e35" stroke-width="2" opacity=".55"/><text x="${x+28}" y="${y+50}" text-anchor="middle" font-size="30" font-weight="900" fill="#a97cff" opacity=".7">+</text>`)
    +`<circle cx="${x+28}" cy="${y+2}" r="5" fill="#ff6fae" stroke="#8a5e35" stroke-width="1.5"/></g>`).join('')}${lockOn()?'':sign(500,196,'📸 Photocards')}</g>`;
  // fidget shelf (open!)
  s+=`<g class="hot" data-hot="shelf"><rect x="350" y="222" width="300" height="148" fill="transparent"/><path d="M390 316 v24 h14 M610 316 v24 h-14" stroke="${sh.bracket}" stroke-width="6" fill="none"/><rect x="384" y="250" width="80" height="50" rx="14" fill="#ff6b8a" stroke="#2b2235" stroke-width="3"/>${[0,1,2,3].map(i=>`<circle cx="${400+i*16}" cy="266" r="6" fill="${['#ffe066','#69db7c','#4dabf7','#b197fc'][i]}"/><circle cx="${400+i*16}" cy="284" r="6" fill="${['#b197fc','#ffe066','#69db7c','#4dabf7'][i]}"/>`).join('')}<ellipse cx="484" cy="252" rx="7" ry="16" fill="#fff6fa" stroke="#c9a3b8" stroke-width="2" transform="rotate(-15 484 262)"/><ellipse cx="510" cy="252" rx="7" ry="16" fill="#fff6fa" stroke="#c9a3b8" stroke-width="2" transform="rotate(15 510 262)"/><path d="M468 302 C462 262 532 262 526 302Z" fill="#fff6fa" stroke="#c9a3b8" stroke-width="3"/><circle cx="488" cy="286" r="2.5" fill="#2a1f33"/><circle cx="506" cy="286" r="2.5" fill="#2a1f33"/>${[0,1,2].map(k=>{const a=k*TAU/3-Math.PI/2;return `<circle cx="${(585+Math.cos(a)*16).toFixed(1)}" cy="${(278+Math.sin(a)*16).toFixed(1)}" r="11" fill="#6d3fd6" stroke="#2b2235" stroke-width="2"/>`;}).join('')}<circle cx="585" cy="278" r="7" fill="#ffd166" stroke="#2b2235" stroke-width="2"/><rect x="365" y="302" width="270" height="16" rx="6" fill="${sh.board}" stroke="#2b2235" stroke-width="4"/>${sign(500,352,'🫧 Fidget Shelf',false)}</g>`;
  // closet (open!)
  F.push({y:564,h:`<g class="hot" data-hot="closet"><rect x="770" y="150" width="190" height="400" rx="16" fill="${cl.body}" stroke="${cl.dark}" stroke-width="5"/><rect x="785" y="168" width="78" height="365" rx="10" fill="${cl.door}" stroke="${cl.dark}" stroke-width="3"/><rect x="867" y="168" width="78" height="365" rx="10" fill="${cl.door}" stroke="${cl.dark}" stroke-width="3"/><circle cx="852" cy="350" r="7" fill="#ffd166"/><circle cx="878" cy="350" r="7" fill="#ffd166"/><path d="${heartPath(824,240,14)}" fill="#ff8cc6"/><path d="${starPath(906,236,16)}" fill="#ffd166"/><rect x="858" y="440" width="15" height="70" rx="6" fill="url(#stripeBP)" filter="url(#fuzz)" transform="rotate(8 865 440)"/><rect x="788" y="548" width="22" height="16" fill="${cl.dark}"/><rect x="920" y="548" width="22" height="16" fill="${cl.dark}"/>${sign(865,126,'👗 Closet',false)}</g>`});
  // art desk (open since v1.3)
  F.push({y:582,h:`<g class="hot" data-hot="desk"><rect x="58" y="432" width="16" height="150" fill="${dk.legs}" stroke="#2b2235" stroke-width="3"/><rect x="276" y="432" width="16" height="150" fill="${dk.legs}" stroke="#2b2235" stroke-width="3"/><rect x="190" y="432" width="90" height="60" rx="6" fill="${dk.top}" stroke="#2b2235" stroke-width="3"/><circle cx="235" cy="462" r="5" fill="#2b2235"/><rect x="40" y="410" width="270" height="22" rx="6" fill="${dk.top}" stroke="#2b2235" stroke-width="4"/><rect x="80" y="396" width="90" height="14" rx="3" fill="#fff" stroke="#2b2235" stroke-width="3"/><path d="M95 402 q20 -6 40 0" stroke="#a97cff" stroke-width="3" fill="none"/><rect x="236" y="374" width="34" height="36" rx="6" fill="#a97cff" stroke="#2b2235" stroke-width="3"/>${[['#ff6b8a',-8],['#ffd166',0],['#4dabf7',8]].map(([c,o])=>`<rect x="${249+o}" y="350" width="6" height="28" rx="2" fill="${c}" stroke="#2b2235" stroke-width="1.5" transform="rotate(${o} 252 378)"/>`).join('')}${sign(175,370,lockOn()?'🧸 Play':'🎨 Art Desk',false)}</g>`});
  return split?{wall:s,floor:F}:s+F.map(f=>f.h).join('');
}
