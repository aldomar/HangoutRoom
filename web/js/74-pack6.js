'use strict';
/* =========================================================
   74. CONTENT PACK 6 (v1.82): purple things + sea friends (the children's first requests)
   Adds 6 coloring pages for 🧸 Play (axolotl, whale shark, puppy in a dino costume, jellyfish, sea turtle, star pony),
   a purple Axolotl Plush and a Dino Pup plush, and more purple: pop-its, an axolotl pop-it board, a squishy, a spinner,
   a slime, a clicker cube, clothes, decorations, a wall and a floor.
   A pack only ADDS entries to the lists from earlier sections. All ids below are saved: never rename them.
   Coloring pages go at the end of CB_PICS (section 47): never reorder, remove or insert their areas.
   Themes: items use the chips that already exist (Cute, Emo, Dino, Ocean), set through THEME_OF (section 33).
   Helpers use the p6 prefix. Everything is for everyone: no "boy" or "girl".
   ========================================================= */
const p6L='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"', p6L3='stroke="#2b2235" stroke-width="3" stroke-linejoin="round"';
// Theme chips for an item ('decor:<key>' or 'category:id'), on top of any it already has.
const p6Th=(key,...ts)=>{THEME_OF[key]=(THEME_OF[key]||[]).concat(ts);};

/* ---------- 🖍️ coloring pages (400 x 300; area 0 is the background) ---------- */
const p6Tent=x=>`M${x} 160Q${x-12} 200 ${x+6} 230Q${x+16} 250 ${x} 272L${x+14} 272Q${x+30} 248 ${x+20} 228Q${x+2} 200 ${x+16} 160Z`;
const p6Bubbles=pts=>pts.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${cbInk}" stroke-width="3"/>`).join('');
CB_PICS.push(
  {id:'axolotl',icon:'🦎',name:'Axolotl',areas:[CB_BG,'M0 255Q200 240 400 255V300H0Z',
    'M290 190Q350 170 380 118Q372 200 296 228Z',
    'M92 118Q54 96 46 110Q70 118 88 128Z M84 138Q44 134 40 150Q66 150 84 148Z M90 160Q58 172 60 186Q80 174 98 168Z'
      +' M188 118Q226 96 234 110Q210 118 192 128Z M196 138Q236 134 240 150Q214 150 196 148Z M190 160Q222 172 220 186Q200 174 182 168Z',
    cbE(220,205,85,36),
    cbE(175,240,13,16)+' '+cbE(265,240,13,16),
    cbE(140,140,60,46)],
    det:()=>cbEye(118,135)+cbEye(162,135)+cbLine('M128 160Q140 170 152 160',3)+p6Bubbles([[60,60,8],[80,36,6],[330,60,10],[350,30,6]])},
  {id:'whaleShark',icon:'🦈',name:'Whale Shark',areas:[CB_BG,'M0 262Q100 250 200 262Q300 274 400 258V300H0Z',
    'M318 150L388 90Q372 150 388 214Z',
    'M210 104Q236 70 262 74Q250 96 256 112Z M170 186Q160 226 132 238Q176 236 206 196Z',
    'M30 160Q40 112 140 104Q260 98 330 146Q340 152 330 158Q260 202 140 202Q40 200 30 160Z',
    'M40 168Q120 196 220 192Q290 186 326 160Q270 210 150 208Q60 204 40 168Z'],
    det:()=>cbEye(78,146,6)+cbLine('M34 164Q60 172 92 168',3)+cbLine('M112 128Q108 146 112 164M124 126Q120 146 124 166',3)
      +[[150,130,6],[180,122,5],[210,134,6],[240,124,5],[270,138,5],[165,156,5],[200,158,6],[235,154,5],[265,160,4],[295,150,4]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${cbInk}" stroke-width="3"/>`).join('')
      +p6Bubbles([[40,80,8],[56,52,6],[44,26,9]])},
  {id:'dinoPup',icon:'🐶',name:'Dino Pup',areas:[CB_BG,'M0 250H400V300H0Z',
    'M120 252Q120 190 200 190Q280 190 280 252Z',
    'M150 72L165 40L180 66Z M185 58L200 24L215 58Z M220 66L235 40L250 72Z',
    cbE(200,130,95,82),
    cbE(200,145,62,52),
    cbE(142,150,16,30)+' '+cbE(258,150,16,30),
    cbE(200,168,24,16)],
    det:()=>cbEye(178,134)+cbEye(222,134)+`<ellipse cx="200" cy="160" rx="9" ry="6" fill="${cbInk}"/>`+cbLine('M190 174Q200 182 210 174',3)
      +cbLine('M150 252V236M250 252V236',3)+cbStar(60,70,16)+cbStar(340,90,12)},
  {id:'jelly',icon:'🌊',name:'Jellyfish',areas:[CB_BG,'M0 262Q200 248 400 262V300H0Z',
    starPath(60,268,22,10),
    [150,185,220,255].map(p6Tent).join(' '),
    'M120 150H280V158Q260 176 240 158Q220 176 200 158Q180 176 160 158Q140 176 120 158Z',
    'M120 155Q120 60 200 60Q280 60 280 155Z',
    cbC(165,92,10)+' '+cbC(230,84,8)+' '+cbC(252,122,9)],
    det:()=>cbEye(182,122)+cbEye(218,122)+cbLine('M190 138Q200 146 210 138',3)+p6Bubbles([[330,80,8],[350,50,6],[340,24,9],[70,120,7]])},
  {id:'turtle',icon:'🐢',name:'Sea Turtle',areas:[CB_BG,'M0 250Q200 236 400 250V300H0Z',
    'M140 196Q110 236 84 240Q104 210 128 190Z M280 198Q310 230 330 228Q316 204 296 192Z M312 190L340 194L314 202Z',
    'M115 190Q115 100 210 100Q305 100 305 190Z',
    'M105 190H315Q305 210 210 210Q115 210 105 190Z',
    cbE(88,178,30,22),
    'M180 130L210 115L240 130L240 160L210 175L180 160Z',
    'M128 182Q132 140 165 125L172 168Z M292 182Q288 140 255 125L248 168Z'],
    det:()=>cbEye(76,172,5)+cbLine('M64 188Q72 192 80 188',3)+p6Bubbles([[50,110,8],[66,80,6],[52,52,9],[350,70,7]])},
  {id:'starPony',icon:'🦄',name:'Star Pony',areas:[CB_BG,'M0 250Q200 238 400 250V300H0Z',
    'M310 150Q350 140 362 180Q368 220 352 252Q346 210 322 186Z',
    cbR(166,196,18,62,7)+' '+cbR(190,196,18,62,7)+' '+cbR(268,196,18,62,7)+' '+cbR(292,196,18,62,7),
    'M128 92L170 78Q184 112 200 134Q260 126 300 136Q322 146 318 172Q314 204 280 210Q230 216 180 210Q148 204 146 176Q146 150 150 140Q140 116 128 92Z',
    'M146 56Q176 52 186 80Q204 116 212 140Q196 136 186 120Q176 104 166 90Q158 76 146 70Z',
    'M142 60L148 32L160 60Z',
    'M120 66Q150 48 170 70Q176 84 160 96L110 132Q92 142 82 128Q74 114 90 104Z',
    'M120 62L108 28L134 56Z'],
    det:()=>cbEye(138,78,6)+'<circle cx="90" cy="122" r="3" fill="'+cbInk+'"/>'+cbLine('M86 134Q96 137 106 130',3)
      +cbStar(108,20,9)+cbLine('M166 250H184M190 250H208M268 250H286M292 250H310',4)+cbStar(330,50,12)+cbStar(50,60,10)+cbStar(370,100,8)}
);

/* ---------- 🧸 the two plushes and purple decorations ---------- */
const p6Frond=(x,y,a)=>`<ellipse cx="${x}" cy="${y}" rx="17" ry="7" fill="#ff9fd0" ${st('#c8578f',2.5)} transform="rotate(${a} ${x} ${y})"/>`;
Object.assign(DECOR,{
  axolotlPlush:{name:'Axolotl Plush',price:25,box:'-80 -130 160 136',d:()=>`<ellipse cx="0" cy="-3" rx="54" ry="8" fill="#00000030"/>`
    +`<path d="M30 -24 Q66 -20 70 -52 Q58 -34 34 -38Z" fill="#a37cf0" ${p6L3}/>`
    +[[-50,-98,-30],[-56,-80,0],[-50,-62,30],[50,-98,30],[56,-80,0],[50,-62,-30]].map(([x,y,a])=>p6Frond(x,y,a)).join('')
    +`<ellipse cx="0" cy="-32" rx="40" ry="29" fill="#b08cff" ${p6L}/><ellipse cx="0" cy="-26" rx="23" ry="16" fill="#e2d4ff"/>`
    +`<ellipse cx="-26" cy="-8" rx="12" ry="8" fill="#b08cff" ${p6L3}/><ellipse cx="26" cy="-8" rx="12" ry="8" fill="#b08cff" ${p6L3}/>`
    +`<ellipse cx="0" cy="-80" rx="46" ry="34" fill="#c5a6ff" ${p6L}/>`
    +`<circle cx="-17" cy="-84" r="6" fill="#2b2235"/><circle cx="17" cy="-84" r="6" fill="#2b2235"/><circle cx="-15" cy="-86" r="2" fill="#fff"/><circle cx="19" cy="-86" r="2" fill="#fff"/>`
    +`<ellipse cx="-29" cy="-70" rx="7" ry="4" fill="#ff9fd0" opacity=".8"/><ellipse cx="29" cy="-70" rx="7" ry="4" fill="#ff9fd0" opacity=".8"/>`
    +`<path d="M-10 -70 Q0 -62 10 -70" stroke="#2b2235" stroke-width="3" fill="none" stroke-linecap="round"/><path d="${heartPath(0,-32,7)}" fill="#ff9fd0"/>`},
  dinoPup:{name:'Dino Pup Plush',price:25,box:'-80 -158 160 164',d:()=>`<ellipse cx="0" cy="-3" rx="54" ry="8" fill="#00000030"/>`
    +`<path d="M30 -22 Q72 -20 76 -54 Q58 -32 32 -38Z" fill="#7ccf7a" ${p6L3}/><path d="M58 -32 L64 -44 L68 -30Z M44 -26 L48 -38 L54 -26Z" fill="#ffab7a" ${st('#2b2235',2)}/>`
    +`<ellipse cx="0" cy="-34" rx="40" ry="32" fill="#7ccf7a" ${p6L}/><ellipse cx="0" cy="-28" rx="23" ry="18" fill="#ffe9a8"/>`
    +`<ellipse cx="-24" cy="-8" rx="14" ry="9" fill="#7ccf7a" ${p6L3}/><ellipse cx="24" cy="-8" rx="14" ry="9" fill="#7ccf7a" ${p6L3}/>`
    +`<path d="M-32 -6 v-4 M-26 -4 v-4 M-20 -6 v-4 M20 -6 v-4 M26 -4 v-4 M32 -6 v-4" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`
    +`<path d="M-22 -128 L-14 -150 L-4 -130Z M-6 -134 L6 -156 L14 -134Z M10 -130 L20 -150 L26 -126Z" fill="#ffab7a" ${p6L3}/>`
    +`<ellipse cx="0" cy="-94" rx="47" ry="40" fill="#7ccf7a" ${p6L}/>`
    +`<ellipse cx="0" cy="-86" rx="33" ry="27" fill="#f2d2a8" ${p6L3}/>`
    +`<path d="M-22 -112 l5 7 l5 -7 M-6 -113 l5 7 l5 -7 M10 -112 l5 7 l5 -7" fill="#fff" stroke="#2b2235" stroke-width="2" stroke-linejoin="round"/>`
    +`<ellipse cx="-30" cy="-80" rx="9" ry="16" fill="#b7835a" ${st('#2b2235',2.5)} transform="rotate(14 -30 -80)"/><ellipse cx="30" cy="-80" rx="9" ry="16" fill="#b7835a" ${st('#2b2235',2.5)} transform="rotate(-14 30 -80)"/>`
    +`<circle cx="-12" cy="-92" r="5" fill="#2b2235"/><circle cx="12" cy="-92" r="5" fill="#2b2235"/><circle cx="-10" cy="-94" r="1.8" fill="#fff"/><circle cx="14" cy="-94" r="1.8" fill="#fff"/>`
    +`<ellipse cx="0" cy="-76" rx="13" ry="9" fill="#fff3e0"/><ellipse cx="0" cy="-80" rx="5" ry="3.5" fill="#2b2235"/><path d="M-6 -72 Q0 -67 6 -72" stroke="#2b2235" stroke-width="2.5" fill="none" stroke-linecap="round"/>`},
  amethystLamp:{name:'Crystal Lamp',price:20,box:'-60 -170 120 176',d:()=>`<ellipse cx="0" cy="-3" rx="44" ry="7" fill="#00000030"/>`
    +`<path d="M-34 0 L-26 -26 H26 L34 0Z" fill="#ffd166" ${p6L3}/>`
    +`<path d="M-24 -26 L-30 -96 L-14 -116 L-6 -26Z" fill="#9b6bf0" ${p6L3}/><path d="M18 -26 L32 -90 L22 -108 L4 -26Z" fill="#b08cff" ${p6L3}/>`
    +`<path d="M-12 -26 L-14 -134 L2 -160 L16 -132 L12 -26Z" fill="#c5a6ff" ${p6L3}/>`
    +`<path d="M-6 -50 L-6 -128 M-22 -40 L-24 -90 M18 -40 L26 -84" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>`
    +`<path d="${starPath(40,-120,6)} ${starPath(-42,-130,5)}" fill="#ffd166"/>`},
  heartPouf:{name:'Purple Heart Pouf',price:15,box:'-80 -120 160 126',d:()=>`<ellipse cx="0" cy="-3" rx="64" ry="9" fill="#00000030"/>`
    +`<path d="M0 -6 C-40 -12 -72 -36 -70 -70 C-68 -100 -30 -110 0 -84 C30 -110 68 -100 70 -70 C72 -36 40 -12 0 -6Z" fill="#9b6bf0" ${p6L}/>`
    +`<path d="M-40 -78 Q-34 -92 -18 -92" stroke="#c9b3ff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>`},
  butterflyGarland:{name:'Butterfly Garland',price:15,wall:1,box:'-170 -140 340 100',d:()=>`<path d="M-160 -120 Q-80 -60 0 -110 Q80 -60 160 -120" fill="none" stroke="#6a3fc0" stroke-width="3"/>`
    +[[-120,-84,'#c5a6ff'],[-60,-72,'#9b6bf0'],[0,-96,'#e2d4ff'],[60,-72,'#9b6bf0'],[120,-84,'#c5a6ff']].map(([x,y,c])=>
      `<g transform="translate(${x} ${y})"><path d="M0 0 C-10 -16 -24 -14 -20 -2 C-24 8 -12 14 0 4 C12 14 24 8 20 -2 C24 -14 10 -16 0 0Z" fill="${c}" ${st('#2b2235',2)}/><path d="M0 -6 V8" stroke="#2b2235" stroke-width="3" stroke-linecap="round"/></g>`).join('')}
});
Object.assign(NIGHT_GLOW,{amethystLamp:{y:-90,r:110,c:'purple'}});
p6Th('decor:axolotlPlush','cute','ocean'); p6Th('decor:dinoPup','dino','cute');
p6Th('decor:amethystLamp','cute'); p6Th('decor:heartPouf','cute'); p6Th('decor:butterflyGarland','cute');
Object.assign(WALLS,{violetStripe:{name:'Violet Stripes',price:20,fill:'#b89aff',pat:'pStripeV'}});
Object.assign(FLOORS,{plumFluff:{name:'Plum Fluff Carpet',price:20,fill:'#9c7ad6',pat:'pFluff'}});

/* ---------- 👗 purple clothes ---------- */
CLOSET.top.items.push({id:'violetHoodie',name:'Violet Star Hoodie',price:20,
  t:()=>`<path d="${TORSO}" fill="#9b6bf0" ${st()}/><path d="M78 166 H122 L118 186 H82Z" fill="#8a5ae0" stroke="#4a3a5c" stroke-width="2"/>`
    +`<path d="${starPath(100,150,11)}" fill="#ffd166" ${st('#b8860b',1.5)}/><path d="M92 130 v14 M108 130 v14" stroke="#e2d4ff" stroke-width="3" stroke-linecap="round"/>`,
  s:()=>sleeves('#9b6bf0',58)});
CLOSET.legs.items.push({id:'violetFuzz',name:'Violet Fluff',price:15,d:()=>lw('#9b6bf0','#5a35a8')});
CLOSET.shoes.items.push({id:'violetKicks',name:'Violet Kicks',price:15,d:()=>kick(62,'#8a5ae0','#e2d4ff')+kick(98,'#8a5ae0','#e2d4ff')});
CLOSET.acc.items.push({id:'violetBow',name:'Violet Bow',price:10,d:()=>`<g fill="#9b6bf0" ${st('#5a35a8',2.5)}><path d="M100 46 L74 30 Q66 46 74 62 Z"/><path d="M100 46 L126 30 Q134 46 126 62 Z"/><circle cx="100" cy="46" r="7"/></g>`
  +`<path d="${starPath(100,46,4)}" fill="#ffd166"/>`});
p6Th('top:violetHoodie','cute'); p6Th('legs:violetFuzz','emo','cute'); p6Th('shoes:violetKicks','cute'); p6Th('acc:violetBow','cute');
CARD_TAGS.cute.push('top:violetHoodie','legs:violetFuzz','shoes:violetKicks','acc:violetBow');
CARD_TAGS.spooky.push('legs:violetFuzz');

/* ---------- 🫧 purple fidgets ---------- */
Object.assign(POP_THEMES,{
  purple:{name:'Purple Dream',price:15,board:'#efe6ff',cols:['#e2d4ff','#c9b3ff','#b08cff','#9b6bf0','#7b3fd0','#5a2aa8']},
  ube:{name:'Ube Swirl',price:15,board:'#3a2466',cols:['#c9b3ff','#ff9fd0','#9b6bf0','#e2d4ff','#b08cff','#ff8cc6']}
});
Object.assign(POP_SHAPES,{
  axolotl:{name:'🦎 Axolotl Board',price:15,path:'M50 6 C72 6 84 20 86 34 Q100 24 100 34 Q98 40 88 42 Q102 46 100 54 Q96 60 88 54 Q98 66 92 70 Q86 72 82 62 C78 82 66 94 50 94 C34 94 22 82 18 62 Q14 72 8 70 Q2 66 12 54 Q4 60 0 54 Q-2 46 12 42 Q2 40 0 34 Q0 24 14 34 C16 20 28 6 50 6Z'}
});
SQUISHIES.ube={name:'Ube Bun',price:20,fill:'#c9a8ff',shade:'#a07ce8',line:'#6a4ab8',hi:'#f3ecff',extra:'ears'};
Object.assign(SPINS,{amethyst:{name:'Amethyst',price:15,body:'#7b3fd0',edge:'#e2d4ff',cap:'#ffd166',deco:'star'}});
Object.assign(SLIMES,{plum:{name:'Berry Starlight Slime',price:15,a:'#f08cff',b:'#5a1a8a',hi:'#fde8ff',line:'#3a0f5c',deco:'stars',dc:['#8ff0d0','#ffd166','#ffffff']}});
Object.assign(CUBES,{violet:{name:'Violet',price:10,face:'#c9b3ff',edge:'#7b52d0',part:'#ff8cc6',part2:'#ffd166',ink:'#2b1850'}});

/* ---------- stickers ---------- */
// Purple Power counts the purple things from this pack she owns (clothes, fidgets, wall, floor) or has in a room.
const P6_PURPLE=['top:violetHoodie','legs:violetFuzz','shoes:violetKicks','acc:violetBow','pop:purple','pop:ube','popshape:axolotl',
  'squish:ube','spin:amethyst','slime:plum','cube:violet','wall:violetStripe','floor:plumFluff'];
const P6_PURPLE_DECOR=['axolotlPlush','amethystLamp','heartPouf','butterflyGarland'];
const p6Purple=p=>p.owned.filter(k=>P6_PURPLE.includes(k)).length+P6_PURPLE_DECOR.filter(k=>allItems(p).some(i=>i.type===k)).length;
const P6_SEA=['axolotl','whaleShark','jelly','turtle'];
STICKERS.push(
  stk('p6axo','room','🦎','Axolotl Friend','heart','Get the Axolotl Plush',1,p=>allItems(p).some(i=>i.type==='axolotlPlush')?1:0,1),
  stk('p6purple','room','💜','Purple Power','star','Get 5 new purple things',5,p6Purple,1),
  stk('p6sea','little','🐢','Sea Artist','scallop','Color the axolotl, whale shark, jellyfish and turtle in 🧸 Play',4,p=>P6_SEA.filter(id=>cbDone(p,cbPic(id))).length,1)
);
