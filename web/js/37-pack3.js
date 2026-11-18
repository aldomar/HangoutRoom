'use strict';
/* =========================================================
   37. CONTENT PACK 3 (v1.35): stage idols, cozy days, cafe and bakery, ocean and mermaids
   A pack only ADDS entries to the lists from earlier sections. All ids below are saved: never rename them.
   Clothes are drawn in the mascot's 200 x 270 box; decorations bottom-centre at (0,0) like section 4.
   Every entry has p3:'stage' | 'cozy' | 'cafe' | 'ocean' (its theme). themesOf() (section 33) reads p3, so the
   🔎 theme chips find them, and p3Have() counts them for the four pack stickers.
   The decorations come in matching sets (same colours): Stage, Cozy, Cafe and Seashell.
   All original: "inspired by" stage shows, cozy anime-style looks, cafes and the sea. No real idols, logos or text.
   ========================================================= */
const P3_THEMES={stage:'🎤',cozy:'🍵',cafe:'🧁',ocean:'🐚'};
// New theme chips go before 🌳 Outdoor and ⭐ Dreams (🎤 Stage already exists).
{const y=THEMES.yard,d=THEMES.dream; delete THEMES.yard; delete THEMES.dream;
  Object.assign(THEMES,{cozy:{icon:'🍵',name:'Cozy'},cafe:{icon:'🧁',name:'Cafe'},ocean:{icon:'🐚',name:'Ocean'},yard:y,dream:d});}
const p3L='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"', p3L3='stroke="#2b2235" stroke-width="3" stroke-linejoin="round"';
// A little scallop shell, pointing down at (x, y+s).
const p3Shell=(x,y,s,c,w)=>`<path d="M${x} ${y+s} L${x-s} ${y-s*.1} Q${x-s} ${y-s} ${x} ${y-s} Q${x+s} ${y-s} ${x+s} ${y-s*.1}Z" fill="${c||'#ffd1e3'}" ${st('#2b2235',w||2)}/>`
  +`<path d="M${x} ${y+s} L${x-s*.55} ${y-s*.8} M${x} ${y+s} V${y-s} M${x} ${y+s} L${x+s*.55} ${y-s*.8}" stroke="#e58fb0" stroke-width="${Math.max(1,(w||2)*.7)}"/>`;
const p3Cake=(x,y,c)=>`<path d="M${x-13} ${y-18} H${x+13} L${x+10} ${y} H${x-10}Z" fill="#ffd9a0" ${st('#2b2235',2)}/><ellipse cx="${x}" cy="${y-21}" rx="15" ry="10" fill="${c}" ${st('#2b2235',2)}/><circle cx="${x}" cy="${y-31}" r="4.5" fill="#ff5a7a"/>`;

/* ---------- closet ---------- */
EXTRA_DEFS.push(
  `<pattern id="p3Scales" width="12" height="10" patternUnits="userSpaceOnUse"><rect width="12" height="10" fill="#5fd3c6"/><path d="M-6 5 Q0 -5 6 5 M6 5 Q12 -5 18 5 M0 10 Q6 0 12 10" fill="none" stroke="#3fa7a0" stroke-width="1.5"/></pattern>`,
  `<pattern id="p3ScalesP" width="12" height="10" patternUnits="userSpaceOnUse"><rect width="12" height="10" fill="#b49cf0"/><path d="M-6 5 Q0 -5 6 5 M6 5 Q12 -5 18 5 M0 10 Q6 0 12 10" fill="none" stroke="#8a6fd1" stroke-width="1.5"/></pattern>`
);
const p3Boot=x=>`<rect x="${x}" y="208" width="37" height="40" rx="10" fill="#fbf7ff" ${st()}/><rect x="${x-3}" y="244" width="43" height="10" rx="4" fill="#c9a7ff" ${st('#2b2235',2)}/>`
  +[[8,218],[26,224],[12,232],[28,213]].map(([a,b],k)=>`<circle cx="${x+a}" cy="${b}" r="2.4" fill="${['#ff8cc6','#8ff0d0','#a97cff','#ff8cc6'][k]}"/>`).join('')
  +`<path d="${starPath(x+20,236,5.5)}" fill="#ffd166" ${st('#b8860b',1.2)}/>`;
const p3Berry=x=>kick(x,'#ff6b81','#fff')+[[10,236],[20,240],[30,235],[16,232]].map(([a,b])=>`<ellipse cx="${x+a}" cy="${b}" rx="1.6" ry="2.4" fill="#ffe066"/>`).join('')
  +`<path d="M${x+12} 230 l5 -7 l4 6 l4 -6 l5 7Z" fill="#5cc28a" ${st('#2b6a4a',1.2)}/>`;
CLOSET.hair.items.push(
  {id:'idolBuns',name:'Idol Buns',price:20,p3:'stage',b:(f,l,H)=>[58,142].map(x=>`<circle cx="${x}" cy="44" r="22" fill="${H.c}" ${HL}/>`).join('')+hStreak(H,'M48 34 Q56 26 66 30'),
    d:(f,l,H)=>`<path d="M46 86 Q46 44 100 42 Q154 44 154 86 Q142 72 128 78 Q118 64 106 74 Q96 62 86 74 Q74 64 66 78 Q56 72 46 86Z" fill="${H.c}" ${HL}/>`+hShine('M66 56 Q100 44 134 56')
      +[48,152].map(x=>`<path d="M${x} 84 Q${x+(x<100?-6:6)} 104 ${x+(x<100?2:-2)} 124" stroke="${H.c}" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')
      +`<path d="${starPath(68,58,7)} ${starPath(132,58,7)}" fill="#ff8cc6" ${st('#c8578f',1.5)}/>`}
);
CLOSET.top.items.push(
  {id:'idolCrop',name:'Sparkle Stage Top',price:25,p3:'stage',
    t:()=>`<path d="${TORSO}" fill="#fbf7ff" ${st()}/><path d="M62 172 L136 136 L139 151 L64 187Z" fill="#a97cff"/><path d="${starPath(100,161,7)}" fill="#ffd166"/>`
      +[[72,146,'#ff8cc6'],[82,138,'#8ff0d0'],[122,172,'#ffd166'],[130,180,'#ff8cc6'],[112,182,'#8ff0d0'],[118,138,'#ffd166']].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="${c}"/>`).join('')
      +`<path d="M86 127 L100 146 L114 127" fill="#ffd166" ${st('#b8860b',2)}/><rect x="60" y="182" width="80" height="6" fill="#ff8cc6"/>`,
    s:()=>sleeves('#ff8cc6',24)+`<g fill="#ffd166"><rect x="40" y="150" width="24" height="5" transform="${LA}"/><rect x="136" y="150" width="24" height="5" transform="${RA}"/></g>`},
  {id:'bigSweater',name:'Comfy Big Sweater',price:20,p3:'cozy',
    t:()=>`<path d="M56 164 Q56 124 94 124 H106 Q144 124 144 164 V194 H56Z" fill="#f2e3c6" ${st()}/><path d="M57 187 H143" stroke="#d9c39a" stroke-width="2"/>`
      +`<path d="${[...Array(11)].map((_,i)=>`M${62+i*7.6} 188 V193`).join(' ')}" stroke="#d9c39a" stroke-width="2"/>`
      +`<path d="M78 134 Q72 146 78 158 Q84 170 78 182 M122 134 Q128 146 122 158 Q116 170 122 182" stroke="#d9c39a" stroke-width="4" fill="none"/>`
      +`<path d="M84 126 Q100 138 116 126" stroke="#d9c39a" stroke-width="4" fill="none"/><path d="${heartPath(100,160,9)}" fill="#ff8cc6" ${st('#2b2235',1.5)}/>`,
    s:()=>sleeves('#f2e3c6',62)+`<g fill="#d9c39a"><rect x="40" y="182" width="24" height="9" rx="3" transform="${LA}"/><rect x="136" y="182" width="24" height="9" rx="3" transform="${RA}"/></g>`},
  {id:'sailorTop',name:'Sailor Collar Top',price:20,p3:'cozy',
    t:()=>`<path d="${TORSO}" fill="#fbf7ff" ${st()}/><path d="M62 148 Q62 128 90 126 L100 150 L110 126 Q138 128 138 148 L116 158 L100 170 L84 158Z" fill="#3a4a8a" ${st('#2b2235',2)}/>`
      +`<path d="M68 146 Q70 134 86 131 M132 146 Q130 134 114 131" stroke="#fff" stroke-width="2.5" fill="none"/><rect x="60" y="182" width="80" height="6" fill="#3a4a8a"/>`
      +`<path d="M98 164 L92 184 M102 164 L108 184" stroke="#ff6b8a" stroke-width="4" stroke-linecap="round"/><g fill="#ff6b8a" ${st('#c8578f',2)}><path d="M100 160 L84 152 L86 170Z"/><path d="M100 160 L116 152 L114 170Z"/><circle cx="100" cy="161" r="5"/></g>`,
    s:()=>sleeves('#fbf7ff',30)+`<g fill="#3a4a8a"><rect x="40" y="154" width="24" height="6" transform="${LA}"/><rect x="136" y="154" width="24" height="6" transform="${RA}"/></g>`},
  {id:'cafeApron',name:'Cafe Apron',price:15,p3:'cafe',
    t:()=>`<path d="${TORSO}" fill="#ffc9de" ${st()}/><path d="M80 134 L90 127 M120 134 L110 127" stroke="#fff" stroke-width="4"/><path d="M76 134 H124 V188 H76Z" fill="#fff" ${st('#2b2235',2)}/>`
      +`<path d="M76 188 q6 7 12 0 q6 7 12 0 q6 7 12 0 q6 7 12 0" fill="#fff" stroke="#2b2235" stroke-width="2"/><path d="M86 160 H114 V172 Q100 180 86 172Z" fill="#ffe9f2" stroke="#2b2235" stroke-width="1.5"/>`
      +`<path d="${heartPath(100,148,6)}" fill="#ff6b81"/>`,
    s:()=>sleeves('#ffc9de',26)},
  {id:'scaleTop',name:'Mermaid Scale Top',price:20,p3:'ocean',
    t:()=>`<path d="${TORSO}" fill="url(#p3Scales)" ${st()}/>`+p3Shell(100,158,13,'#ffd1e3',2)
      +[[86,131],[92,135],[100,137],[108,135],[114,131]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.8" fill="#fff" ${st('#c9b3d9',1.2)}/>`).join(''),
    s:()=>sleeves('url(#p3Scales)',22)}
);
CLOSET.bottom.items.push(
  {id:'starPleats',name:'Star Pleat Skirt',price:20,p3:'stage',d:()=>`<path d="M60 180 H140 L152 214 Q100 224 48 214 Z" fill="#ff8cc6" ${st()}/>`
    +`<path d="M72 182 L64 216 M86 182 L82 219 M100 182 V220 M114 182 L118 219 M128 182 L136 216" stroke="#e0609f" stroke-width="2.5"/>`
    +`<path d="M50 211 Q100 221 150 211" stroke="#ffd166" stroke-width="4" fill="none"/><path d="${starPath(76,198,4.5)} ${starPath(124,200,4.5)} ${starPath(100,192,3)}" fill="#fff"/>`},
  {id:'mermaidTail',name:'Mermaid Tail Skirt',price:25,p3:'ocean',d:()=>`<path d="M60 180 H140 Q140 214 124 236 L154 252 Q128 262 100 246 Q72 262 46 252 L76 236 Q60 214 60 180Z" fill="url(#p3ScalesP)" ${st()}/>`
    +`<path d="M100 246 L82 254 M100 246 L118 254 M100 246 L64 252 M100 246 L136 252" stroke="#7a5fc9" stroke-width="2"/><rect x="60" y="180" width="80" height="7" fill="#ffd1e3" ${st('#2b2235',1.5)}/>`
    +[[78,184],[100,184],[122,184]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="#fff"/>`).join('')}
);
CLOSET.legs.items.push(
  {id:'knitSocks',name:'Cozy Knit Socks',price:10,p3:'cozy',d:()=>lw('#f2e3c6','#d9c39a')+`<path d="${heartPath(82,222,5)} ${heartPath(118,222,5)}" fill="#ff8cc6"/>`}
);
CLOSET.arms.items.push(
  {id:'sparkleGloves',name:'Sparkle Gloves',price:15,p3:'stage',d:()=>aw('#fbf7ff')
    +`<g transform="${LA}"><path d="${starPath(46,166,3.5)} ${starPath(58,176,3.5)} ${starPath(48,182,3)}" fill="#ffd166"/></g><g transform="${RA}"><path d="${starPath(142,166,3.5)} ${starPath(154,176,3.5)} ${starPath(144,182,3)}" fill="#ff8cc6"/></g>`},
  {id:'pearlBands',name:'Pearl Bracelets',price:10,p3:'ocean',d:()=>[[LA,40],[RA,136]].map(([t,x])=>`<g transform="${t}">${[0,6,12,18,24].map(o=>`<circle cx="${x+o}" cy="182" r="3.4" fill="#fff" ${st('#c9b3d9',1.2)}/>`).join('')}</g>`).join('')}
);
CLOSET.shoes.items.push(
  {id:'glitterBoots',name:'Glitter Boots',price:20,p3:'stage',d:()=>p3Boot(64)+p3Boot(99)},
  {id:'berryShoes',name:'Strawberry Shoes',price:15,p3:'cafe',d:()=>p3Berry(62)+p3Berry(98)}
);
CLOSET.acc.items.push(
  {id:'headsetMic',name:'Headset Mic',price:15,p3:'stage',d:()=>`<path d="M46 92 Q44 32 100 30 Q156 32 154 92" fill="none" stroke="#2b2235" stroke-width="5" stroke-linecap="round"/>`
    +`<g fill="#c9cfe0" ${st('#2b2235',2.5)}><rect x="34" y="84" width="16" height="24" rx="7"/><rect x="150" y="84" width="16" height="24" rx="7"/></g>`
    +`<path d="M44 106 Q50 128 78 123" stroke="#2b2235" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="81" cy="122" r="6" fill="#2b2235"/><circle cx="79" cy="120" r="1.8" fill="#8a96ab"/>`},
  {id:'catBeret',name:'Kitty Beret',price:15,p3:'cozy',d:()=>`<path d="M64 42 L70 14 L88 32Z M136 42 L130 14 L112 32Z" fill="#3b2f52" ${st('#1a1320',2.5)}/><path d="M71 33 L73 22 L80 31Z M129 33 L127 22 L120 31Z" fill="#ff8cc6"/>`
    +`<ellipse cx="100" cy="46" rx="56" ry="16" fill="#3b2f52" ${st('#1a1320',2.5)}/><circle cx="100" cy="30" r="5" fill="#3b2f52" ${st('#1a1320',2)}/>`
    +`<path d="M50 52 Q100 66 150 52" stroke="#ff8cc6" stroke-width="4" fill="none"/><path d="${starPath(132,44,5)}" fill="#ffd166"/>`},
  {id:'chefHat',name:'Little Chef Hat',price:15,p3:'cafe',d:()=>`<g fill="#fff" ${st('#2b2235',2.5)}><circle cx="76" cy="30" r="16"/><circle cx="124" cy="30" r="16"/><circle cx="100" cy="20" r="20"/><rect x="66" y="34" width="68" height="22" rx="4"/></g>`
    +`<path d="${heartPath(100,45,6)}" fill="#ff8cc6"/>`},
  {id:'cupcakeClip',name:'Cupcake Clip',price:10,p3:'cafe',d:()=>`<path d="M124 60 H144 L141 74 H127Z" fill="#ffd9a0" ${st('#2b2235',1.5)}/><path d="M122 61 Q122 46 134 46 Q146 46 146 61Z" fill="#ff9fd0" ${st('#2b2235',1.5)}/>`
    +`<circle cx="134" cy="44" r="3.6" fill="#ff5a7a"/><g fill="#fff"><rect x="128" y="52" width="4" height="1.8" rx=".9"/><rect x="137" y="55" width="4" height="1.8" rx=".9"/></g>`},
  {id:'shellCrown',name:'Seashell Tiara',price:20,p3:'ocean',d:()=>`<path d="M62 58 Q100 40 138 58" stroke="#ffd1e3" stroke-width="5" fill="none" stroke-linecap="round"/>`
    +p3Shell(100,38,13)+p3Shell(77,48,8)+p3Shell(123,48,8)+`<circle cx="88" cy="47" r="3.6" fill="#fff" ${st('#c9b3d9',1.2)}/><circle cx="112" cy="47" r="3.6" fill="#fff" ${st('#c9b3d9',1.2)}/>`}
);
CARD_TAGS.cute.push('hair:idolBuns','top:idolCrop','top:bigSweater','top:cafeApron','top:scaleTop','bottom:starPleats','bottom:mermaidTail','legs:knitSocks','arms:pearlBands',
  'shoes:berryShoes','shoes:glitterBoots','acc:cupcakeClip','acc:shellCrown','acc:chefHat');
CARD_TAGS.spooky.push('acc:catBeret','top:sailorTop');
CARD_TAGS.sporty.push('top:idolCrop','arms:sparkleGloves','acc:headsetMic','shoes:glitterBoots');

/* ---------- room: walls, floors, decorations ---------- */
EXTRA_DEFS.push(
  `<pattern id="p3Spot" width="220" height="200" patternUnits="userSpaceOnUse"><path d="M40 0 L6 200 H96Z M160 0 L124 200 H210Z" fill="#fff" opacity=".1"/>`
    +`<path d="${starPath(110,60,7)} ${starPath(30,150,5)} ${starPath(190,120,6)}" fill="#ffd166"/><g fill="#ff8cc6"><circle cx="70" cy="30" r="3"/><circle cx="170" cy="180" r="3"/></g><circle cx="140" cy="90" r="2" fill="#8ff0d0"/></pattern>`,
  `<pattern id="p3Blossom" width="200" height="180" patternUnits="userSpaceOnUse"><path d="M0 40 Q40 30 70 52 M120 120 Q150 100 200 112" stroke="#b08a6a" stroke-width="3" fill="none"/>`
    +p1Flower(36,38,'#ffb3d1')+p1Flower(66,52,'#ffc9de')+p1Flower(140,110,'#ffb3d1')+p1Flower(176,112,'#ffd6e6')+`<g fill="#ffc9de"><ellipse cx="110" cy="40" rx="4" ry="2.5"/><ellipse cx="40" cy="140" rx="4" ry="2.5" transform="rotate(30 40 140)"/><ellipse cx="96" cy="170" rx="4" ry="2.5"/></g></pattern>`,
  `<pattern id="p3Awn" width="60" height="120" patternUnits="userSpaceOnUse"><rect width="30" height="120" fill="#ffd6e4"/><path d="${heartPath(45,60,5)}" fill="#ffb3c7"/></pattern>`,
  `<pattern id="p3Sea" width="200" height="180" patternUnits="userSpaceOnUse"><path d="M30 180 Q20 150 34 130 Q46 110 34 90 M170 180 Q182 160 170 140" stroke="#2f8f7a" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>`
    +`<g fill="none" stroke="#fff" stroke-width="2" opacity=".6"><circle cx="90" cy="40" r="6"/><circle cx="100" cy="20" r="4"/><circle cx="150" cy="70" r="5"/></g>`
    +`<path d="M110 120 Q124 108 138 120 Q124 132 110 120Z M136 120 L146 112 V128Z" fill="#ffab7a" opacity=".85"/><path d="M50 50 Q60 42 70 50 Q60 58 50 50Z M68 50 L75 45 V55Z" fill="#ffd1e3" opacity=".85"/></pattern>`,
  `<pattern id="p3Boards" width="120" height="40" patternUnits="userSpaceOnUse"><path d="M0 39 H120 M40 0 V40" stroke="#2a1a4a" stroke-width="3"/><path d="M8 10 H30" stroke="#fff" stroke-width="2" opacity=".15"/></pattern>`,
  `<pattern id="p3Mat" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="none" stroke="#8a9a5b" stroke-width="5"/><path d="M0 14 H80 M0 28 H80 M0 42 H80 M0 56 H80 M0 70 H80" stroke="#cbb878" stroke-width="1.5"/></pattern>`,
  `<pattern id="p3Tiles" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#ffc9de"/><rect x="30" y="30" width="30" height="30" fill="#ffc9de"/></pattern>`,
  `<pattern id="p3SeaFloor" width="150" height="100" patternUnits="userSpaceOnUse"><g fill="#e6c98e"><circle cx="20" cy="20" r="2.5"/><circle cx="90" cy="60" r="2"/><circle cx="130" cy="16" r="2"/></g>`
    +`<path d="${starPath(50,70,10,5)}" fill="#ffab7a"/><path d="M110 82 L102 72 Q102 64 110 64 Q118 64 118 72Z" fill="#ffd1e3"/></pattern>`
);
Object.assign(WALLS,{
  stageLights:{name:'Stage Lights',price:25,fill:'#3a2266',pat:'p3Spot',p3:'stage'},
  blossom:{name:'Blossom Branches',price:20,fill:'#fff1f5',pat:'p3Blossom',p3:'cozy'},
  cafeStripe:{name:'Cafe Stripes',price:20,fill:'#fff6ea',pat:'p3Awn',p3:'cafe'},
  underSea:{name:'Under the Sea',price:25,fill:'#3fa7c9',pat:'p3Sea',p3:'ocean'}
});
Object.assign(FLOORS,{
  stageFloor:{name:'Stage Floor',price:20,fill:'#4a2f78',pat:'p3Boards',p3:'stage'},
  wovenMat:{name:'Woven Mat',price:15,fill:'#e8d9a0',pat:'p3Mat',p3:'cozy'},
  cafeTiles:{name:'Cafe Tiles',price:20,fill:'#fffaf4',pat:'p3Tiles',p3:'cafe'},
  seaFloor:{name:'Sandy Sea Floor',price:15,fill:'#f3dfb0',pat:'p3SeaFloor',p3:'ocean'}
});
Object.assign(DECOR,{
  // Stage set
  idolVanity:{name:'Stage Vanity',price:30,p3:'stage',box:'-110 -280 220 290',d:()=>`<ellipse cx="0" cy="-3" rx="100" ry="10" fill="#00000030"/>`
    +`<rect x="-90" y="-100" width="12" height="98" fill="#fbf7ff" ${p3L}/><rect x="78" y="-100" width="12" height="98" fill="#fbf7ff" ${p3L}/>`
    +`<rect x="-70" y="-272" width="140" height="156" rx="20" fill="#c9a7ff" ${p3L}/><rect x="-54" y="-256" width="108" height="124" rx="12" fill="#d9f2ff" ${p3L3}/>`
    +`<path d="M-30 -230 L-12 -248 M-32 -200 L6 -238" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`
    +[[-62,-246],[-62,-206],[-62,-166],[62,-246],[62,-206],[62,-166],[-32,-264],[0,-264],[32,-264]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#fff3b0" ${st('#2b2235',2)}/>`).join('')
    +`<rect x="-100" y="-112" width="200" height="22" rx="6" fill="#ff8cc6" ${p3L}/><rect x="-84" y="-90" width="70" height="40" rx="6" fill="#ffd1ea" ${p3L3}/><circle cx="-49" cy="-70" r="5" fill="#ffd166"/>`
    +`<rect x="44" y="-138" width="14" height="26" rx="3" fill="#a97cff" ${st('#2b2235',2)}/><path d="${heartPath(-60,-122,9)}" fill="#ff6fae" ${st('#2b2235',2)}/><path d="${starPath(20,-124,9)}" fill="#ffd166" ${st('#2b2235',2)}/>`},
  micStand:{name:'Star Mic Stand',price:20,p3:'stage',box:'-70 -290 140 300',d:()=>`<ellipse cx="0" cy="-3" rx="56" ry="8" fill="#00000030"/><ellipse cx="0" cy="-12" rx="44" ry="10" fill="#3b2f52" ${p3L}/>`
    +`<path d="M0 -16 V-200 L22 -226" stroke="#2b2235" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M0 -16 V-200 L22 -226" stroke="#8a96ab" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    +`<path d="M-2 -150 Q-24 -120 -10 -90 Q4 -62 -8 -30" stroke="#ff8cc6" stroke-width="5" fill="none" stroke-linecap="round"/>`
    +`<g transform="rotate(40 30 -240)"><rect x="22" y="-250" width="16" height="40" rx="6" fill="#2b2235"/><circle cx="30" cy="-256" r="15" fill="#c9cfe0" ${p3L3}/><path d="M18 -262 H42 M17 -253 H43" stroke="#8a96ab" stroke-width="2"/></g>`
    +`<path d="${starPath(-32,-240,11)} ${starPath(44,-176,7)}" fill="#ffd166" ${st('#2b2235',2.5)}/>`},
  cheerBanner:{name:'Cheer Banner',price:15,p3:'stage',wall:1,box:'-150 -190 300 180',d:()=>`<path d="M-140 -170 L-124 -150 M140 -170 L124 -150" stroke="#8a5e35" stroke-width="3"/><path d="M-146 -172 H146" stroke="#8a5e35" stroke-width="6" stroke-linecap="round"/>`
    +`<path d="M-130 -152 H130 V-60 L0 -38 L-130 -60Z" fill="#a97cff" ${p3L}/><path d="M-116 -140 H116 V-70 L0 -52 L-116 -70Z" fill="#ffd1ea"/>`
    +`<path d="${heartPath(-68,-104,16)}" fill="#ff6fae" ${p3L3}/><path d="${heartPath(68,-104,16)}" fill="#8ff0d0" ${p3L3}/><path d="${starPath(0,-102,24)}" fill="#ffd166" ${p3L3}/>`
    +[[-104,-130],[-30,-132],[30,-132],[104,-130],[-100,-78],[100,-78]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.5" fill="#fff"/>`).join('')},
  // Cozy set
  kotatsu:{name:'Cozy Blanket Table',price:30,p3:'cozy',box:'-160 -150 320 160',d:()=>`<ellipse cx="0" cy="-4" rx="150" ry="10" fill="#00000030"/>`
    +`<path d="M-140 -8 Q-152 -60 -122 -82 H122 Q152 -60 140 -8 Q0 6 -140 -8Z" fill="#ffb3c7" ${p3L}/><path d="M-100 -78 Q-110 -42 -104 -6 M-36 -82 V-2 M36 -82 V-2 M100 -78 Q110 -42 104 -6" stroke="#ff8fb0" stroke-width="4" fill="none"/>`
    +`<rect x="-130" y="-100" width="260" height="20" rx="6" fill="#c08a5a" ${p3L}/>`
    +`<circle cx="-54" cy="-112" r="12" fill="#ffa94d" ${p3L3}/><circle cx="-26" cy="-112" r="12" fill="#ffa94d" ${p3L3}/><circle cx="-40" cy="-126" r="12" fill="#ffa94d" ${p3L3}/><path d="M-40 -138 l6 -6" stroke="#5cc28a" stroke-width="4" stroke-linecap="round"/>`
    +`<path d="M-72 -102 Q-70 -82 -40 -82 Q-10 -82 -8 -102Z" fill="#a97cff" ${p3L3}/>`
    +`<rect x="40" y="-124" width="28" height="24" rx="6" fill="#fff" ${p3L3}/><path d="M68 -118 q10 0 10 7 q0 7 -10 7" stroke="#2b2235" stroke-width="3" fill="none"/><path d="M48 -132 q-4 -6 0 -12 M60 -132 q-4 -6 0 -12" stroke="#c9b3d9" stroke-width="3" fill="none" stroke-linecap="round"/>`},
  paperLantern:{name:'Happy Lantern',price:15,p3:'cozy',wall:1,box:'-80 -200 160 200',d:()=>`<path d="M0 -200 V-176" stroke="#3b2f52" stroke-width="3"/><rect x="-26" y="-180" width="52" height="12" rx="4" fill="#3b2f52"/>`
    +`<ellipse cx="0" cy="-120" rx="56" ry="52" fill="#ffcf8a" ${p3L}/><path d="M-50 -142 Q0 -152 50 -142 M-56 -120 H-34 M34 -120 H56 M-50 -98 Q0 -88 50 -98" stroke="#e8a85a" stroke-width="3" fill="none"/>`
    +p2Eyes(-16,16,-124,4.5)+p2Smile(0,-112,6)+p2Blush(-30,30,-110)
    +`<rect x="-26" y="-74" width="52" height="12" rx="4" fill="#3b2f52"/><path d="M0 -62 V-32" stroke="#ff6b6b" stroke-width="5"/><path d="M-8 -36 L0 -14 L8 -36Z" fill="#ff6b6b"/>`},
  catCushion:{name:'Kitty Cushion',price:20,p3:'cozy',box:'-100 -130 200 140',d:()=>`<ellipse cx="0" cy="-3" rx="90" ry="9" fill="#00000030"/>`
    +`<path d="M-72 -72 L-60 -120 L-30 -88Z M72 -72 L60 -120 L30 -88Z" fill="#c9b3ff" ${p3L}/><path d="M-62 -84 L-57 -106 L-44 -90Z M62 -84 L57 -106 L44 -90Z" fill="#ff9fd0"/>`
    +`<path d="M-90 -40 Q-92 -98 0 -98 Q92 -98 90 -40 Q90 -4 0 -4 Q-90 -4 -90 -40Z" fill="#c9b3ff" ${p3L}/>`
    +`<path d="M-42 -58 q10 -10 20 0 M22 -58 q10 -10 20 0" stroke="#2a1f33" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-5 -46 h10 l-5 5z" fill="#ff8fb8"/>`
    +`<path d="M-10 -38 q5 6 10 0 q5 6 10 0" stroke="#2a1f33" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-50 -44 H-76 M-50 -36 L-74 -30 M50 -44 H76 M50 -36 L74 -30" stroke="#7a63b0" stroke-width="2.5" stroke-linecap="round"/>`+p2Blush(-48,48,-40)},
  // Cafe set
  cafeCounter:{name:'Cafe Counter',price:35,p3:'cafe',box:'-180 -240 360 250',d:()=>`<ellipse cx="0" cy="-3" rx="168" ry="10" fill="#00000030"/>`
    +`<rect x="-160" y="-122" width="320" height="120" rx="8" fill="#fff4e6" ${p3L}/>`+[-120,-60,0,60,120].map(x=>`<rect x="${x-20}" y="-104" width="40" height="88" rx="6" fill="#ffd6e4"/>`).join('')
    +`<rect x="-170" y="-136" width="340" height="18" rx="6" fill="#c08a5a" ${p3L}/>`
    +`<rect x="-140" y="-148" width="100" height="10" rx="4" fill="#fbf7ff" ${p3L3}/><rect x="-120" y="-186" width="60" height="38" rx="6" fill="#ffb3d1" ${p3L3}/>`
    +`<path d="M-120 -174 Q-105 -164 -90 -174 Q-75 -164 -60 -174" stroke="#fff" stroke-width="5" fill="none"/><circle cx="-90" cy="-194" r="7" fill="#ff5a7a" ${st('#2b2235',2)}/>`
    +`<path d="M-136 -148 Q-136 -226 -90 -226 Q-44 -226 -44 -148Z" fill="#d9f2ff" fill-opacity=".4" stroke="#8ab8d8" stroke-width="3"/><path d="M-120 -200 Q-116 -214 -104 -218" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`
    +[[20,'#fff'],[62,'#c9f2e0']].map(([x,c])=>`<rect x="${x-14}" y="-166" width="28" height="30" rx="6" fill="${c}" ${p3L3}/><path d="M${x+14} -158 q9 0 9 7 q0 7 -9 7" stroke="#2b2235" stroke-width="3" fill="none"/><path d="${heartPath(x,-150,5)}" fill="#ff8cc6"/>`).join('')
    +p3Cake(124,-136,'#c9f2e0')},
  cafeTable:{name:'Cafe Table',price:25,p3:'cafe',box:'-160 -170 320 180',d:()=>{const chair=k=>`<g transform="${k<0?'':'scale(-1 1)'}"><path d="M-138 -4 V-70 M-92 -4 V-70" stroke="#c08a5a" stroke-width="7" stroke-linecap="round"/>`
      +`<rect x="-142" y="-160" width="54" height="76" rx="22" fill="#ffd6e4" ${p3L}/><path d="${heartPath(-115,-124,10)}" fill="#ff8cc6"/><rect x="-148" y="-88" width="66" height="16" rx="6" fill="#ff8cc6" ${p3L}/></g>`;
    return `<ellipse cx="0" cy="-3" rx="150" ry="10" fill="#00000030"/>`+chair(-1)+chair(1)
      +`<rect x="-8" y="-104" width="16" height="96" fill="#8a5e35"/><ellipse cx="0" cy="-8" rx="40" ry="8" fill="#8a5e35" ${p3L3}/><ellipse cx="0" cy="-110" rx="80" ry="16" fill="#fff4e6" ${p3L}/>`
      +`<rect x="-46" y="-140" width="26" height="26" rx="6" fill="#fff" ${p3L3}/><path d="M-20 -134 q8 0 8 6 q0 6 -8 6" stroke="#2b2235" stroke-width="3" fill="none"/>`
      +`<path d="M10 -118 L44 -118 L44 -134 Z" fill="#fff3d6" ${p3L3}/><path d="M10 -118 L44 -134" stroke="#ff8cc6" stroke-width="4"/><circle cx="38" cy="-138" r="4" fill="#ff5a7a"/>`;}},
  cupcakeTower:{name:'Cupcake Tower',price:20,p3:'cafe',box:'-90 -240 180 250',d:()=>`<ellipse cx="0" cy="-3" rx="76" ry="8" fill="#00000030"/><path d="M0 -12 V-212" stroke="#c9a7ff" stroke-width="7"/>`
    +`<path d="${starPath(0,-220,12)}" fill="#ffd166" ${st('#2b2235',2.5)}/>`
    +[[-14,70],[-94,54],[-168,38]].map(([y,r])=>`<ellipse cx="0" cy="${y}" rx="${r}" ry="9" fill="#fbf7ff" ${p3L3}/>`).join('')
    +[[-45,'#ff9fd0'],[-15,'#c9f2e0'],[15,'#fff0b3'],[45,'#d9c9ff']].map(([x,c])=>p3Cake(x,-20,c)).join('')
    +[[-30,'#c9f2e0'],[0,'#ff9fd0'],[30,'#ffd9b8']].map(([x,c])=>p3Cake(x,-100,c)).join('')+p3Cake(0,-174,'#ff9fd0')},
  menuBoard:{name:'Cafe Menu Board',price:15,p3:'cafe',wall:1,box:'-110 -220 220 200',d:()=>`<path d="M-60 -190 L0 -214 L60 -190" stroke="#8a5e35" stroke-width="3" fill="none"/>`
    +`<rect x="-100" y="-192" width="200" height="152" rx="10" fill="#c08a5a" ${p3L}/><rect x="-88" y="-180" width="176" height="128" rx="6" fill="#2f4a3a"/>`
    +`<g stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"><path d="M-68 -140 H-38 V-120 Q-38 -108 -53 -108 Q-68 -108 -68 -120Z M-38 -134 q10 0 10 8 q0 8 -10 8"/><path d="M-60 -150 q-4 -6 0 -12 M-48 -150 q-4 -6 0 -12"/>`
    +`<path d="M-70 -80 H-24 M10 -80 H70" stroke-dasharray="6 5"/></g>`
    +`<g stroke="#ff9fd0" stroke-width="3" fill="none"><path d="M26 -124 H58 L54 -104 H30Z"/><path d="M24 -124 Q24 -146 42 -146 Q60 -146 60 -124"/></g><path d="${heartPath(-6,-128,8)}" fill="none" stroke="#ffd166" stroke-width="3"/>`
    +`<path d="${starPath(74,-160,5)} ${starPath(-76,-166,4)}" fill="#fff"/>`},
  // Seashell set
  shellBed:{name:'Seashell Bed',price:40,p3:'ocean',box:'-200 -280 400 290',d:()=>`<ellipse cx="0" cy="-4" rx="190" ry="12" fill="#00000030"/>`
    +`<path d="M-150 -100 Q-172 -232 -60 -252 Q0 -270 60 -252 Q172 -232 150 -100Z" fill="#ffd1e3" ${p3L}/>`
    +`<path d="${[[-136,-160],[-104,-216],[-54,-248],[0,-260],[54,-248],[104,-216],[136,-160]].map(([x,y])=>`M0 -100 L${x} ${y}`).join(' ')}" stroke="#ff9fc4" stroke-width="5"/>`
    +`<circle cx="0" cy="-232" r="11" fill="#fff" ${p3L3}/><rect x="-180" y="-112" width="360" height="56" rx="20" fill="#fff" ${p3L}/>`
    +`<path d="M-40 -114 H160 Q178 -114 178 -94 V-58 H-40Z" fill="#a98be6" ${p3L}/>`+[[10,-90],[60,-82],[120,-94]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="#fff" stroke-width="2.5"/>`).join('')
    +`<rect x="-166" y="-140" width="90" height="38" rx="16" fill="#ffe9f6" ${p3L}/><rect x="-186" y="-62" width="372" height="58" rx="14" fill="#7fd6d0" ${p3L}/>`
    +`<path d="M-176 -36 ${[...Array(8)].map(()=>'q22 -14 44 0').join(' ')}" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>`},
  shellChair:{name:'Seashell Chair',price:25,p3:'ocean',box:'-110 -210 220 220',d:()=>`<ellipse cx="0" cy="-3" rx="90" ry="9" fill="#00000030"/>`
    +`<path d="M-90 -60 Q-112 -172 -36 -192 Q0 -202 36 -192 Q112 -172 90 -60Z" fill="#ffd1e3" ${p3L}/>`
    +`<path d="${[[-84,-120],[-60,-170],[-22,-194],[22,-194],[60,-170],[84,-120]].map(([x,y])=>`M0 -60 L${x} ${y}`).join(' ')}" stroke="#ff9fc4" stroke-width="4"/>`
    +`<path d="M-30 -36 L-40 -4 H40 L30 -36Z" fill="#c9a7ff" ${p3L}/><ellipse cx="0" cy="-58" rx="92" ry="26" fill="#7fd6d0" ${p3L}/><ellipse cx="0" cy="-66" rx="66" ry="14" fill="#a5ece5"/>`
    +`<circle cx="0" cy="-74" r="9" fill="#fff" ${p3L3}/>`},
  coralLamp:{name:'Coral Lamp',price:20,p3:'ocean',box:'-80 -230 160 240',d:()=>{const br='M0 -60 V-150 M0 -112 Q-30 -120 -36 -162 M0 -132 Q28 -142 30 -192 M-18 -126 Q-48 -128 -54 -150 M18 -160 Q40 -168 46 -186';
    return `<ellipse cx="0" cy="-3" rx="56" ry="8" fill="#00000030"/>`
      +`<path d="${br}" stroke="#2b2235" stroke-width="20" fill="none" stroke-linecap="round"/><path d="${br}" stroke="#ff8c7a" stroke-width="13" fill="none" stroke-linecap="round"/><path d="${br}" stroke="#ffb3a6" stroke-width="5" fill="none" stroke-linecap="round"/>`
      +[[-36,-174],[30,-206],[-56,-160],[48,-196]].map(([x,y],k)=>`<circle cx="${x}" cy="${y}" r="${k<2?11:7}" fill="#fff3b0" opacity=".45"/><circle cx="${x}" cy="${y}" r="${k<2?6:4}" fill="#fff3b0" ${st('#2b2235',2)}/>`).join('')
      +`<path d="M-40 -62 H40 L32 -6 H-32Z" fill="#7fd6d0" ${p3L}/><path d="M-36 -40 q9 -7 18 0 t18 0 t18 0 t18 0" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`;}},
  starfishRug:{name:'Starfish Rug',price:15,p3:'ocean',flat:1,box:'-160 -90 320 100',d:()=>`<ellipse cx="0" cy="-44" rx="150" ry="40" fill="#7fd6d0" stroke="#3fa7a0" stroke-width="5"/>`
    +`<g transform="translate(0 -44) scale(1 .45)"><path d="${starPath(0,0,80,40)}" fill="#ffab7a" stroke="#d9734a" stroke-width="6" stroke-linejoin="round"/>`
    +[[0,-46],[40,-14],[24,34],[-24,34],[-40,-14],[0,0]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#ffd9b8"/>`).join('')+`</g>`
    +p3Shell(-104,-42,10)+p3Shell(106,-50,8,'#fff3b0')}
});
Object.assign(NIGHT_GLOW,{idolVanity:{y:-200,r:120,c:'warm'},paperLantern:{y:-120,r:110,c:'orange'},coralLamp:{y:-170,r:100,c:'pink'}});

/* ---------- fidgets ---------- */
Object.assign(POP_THEMES,{
  idol:{name:'Idol Lights',price:15,p3:'stage',board:'#2a1a4a',cols:['#ff8cc6','#a97cff','#7fb8ff','#8ff0d0','#ffd166','#ff8cc6']},
  macaron:{name:'Macarons',price:10,p3:'cafe',board:'#fff4e6',cols:['#ffc9de','#c9f2e0','#fff0b3','#d9c9ff','#ffd9b8','#c9e6ff']},
  sea:{name:'Under the Sea',price:15,p3:'ocean',board:'#2f7fb0',cols:['#7fd6d0','#a5ece5','#ffd1e3','#fff3b0','#ffab7a','#c9b3ff']}
});
Object.assign(POP_SHAPES,{
  shell:{name:'🐚 Shell Board',price:15,p3:'ocean',path:'M38 100 L30 88 C4 76 -4 44 8 22 C14 10 26 2 38 4 C42 -2 58 -2 62 4 C74 2 86 10 92 22 C104 44 96 76 70 88 L62 100Z'},
  cupcake:{name:'🧁 Cupcake Board',price:15,p3:'cafe',path:'M14 52 C2 50 0 36 10 30 C8 16 22 8 34 12 C38 0 62 0 66 12 C78 8 92 16 90 30 C100 36 98 50 86 52 L76 100 H24Z'}
});
SQUISHIES.cupcake={name:'Cupcake',price:20,p3:'cafe',fill:'#ffc9de',shade:'#f29ab9',line:'#c8578f',hi:'#fff4f9',extra:'frosting'};
SQUISHIES.jelly={name:'Jellyfish',price:20,p3:'ocean',fill:'#d9c9ff',shade:'#b39ae8',line:'#7f63c9',hi:'#f8f4ff',extra:'tentacles'};
SQUISHIES.riceBall={name:'Rice Ball',price:15,p3:'cozy',fill:'#fbfbf6',shade:'#e2e0d2',line:'#a8a48c',hi:'#ffffff',extra:'nori'};
// The bottom of a squishy's outline as one closed shape (canvas angles: π/2 is straight down), so a cupcake case or a
// nori strip squashes along with the body. It starts below the mouth.
function p3Bottom(ctx,at,lo,hi){ctx.beginPath();for(let k=0;k<=24;k++){const p=at(lo+(hi-lo)*k/24);ctx.lineTo(p.x,p.y);}ctx.closePath();}
Object.assign(SQ_EXTRAS,{
  frosting:{front(ctx,at,cx,cy,R,T){
    ctx.save();p3Bottom(ctx,at,0.45,Math.PI-0.45);ctx.fillStyle='#ffd9a0';ctx.fill();ctx.clip();
    ctx.strokeStyle='#e8b26a';ctx.lineWidth=Math.max(2,R*.03);for(let k=-5;k<=5;k++){ctx.beginPath();ctx.moveTo(cx+k*R*.2,cy);ctx.lineTo(cx+k*R*.15,cy+R*1.4);ctx.stroke();}
    ctx.restore();p3Bottom(ctx,at,0.45,Math.PI-0.45);ctx.strokeStyle=T.line;ctx.lineWidth=3;ctx.stroke();
    const cols=['#fff','#8ff0d0','#ffd166','#a97cff'];
    [[-.45,-.45,.6],[-.1,-.62,-.4],[.3,-.5,1.1],[.55,-.28,-.2],[-.62,-.2,.2],[.08,-.36,.9]].forEach(([u,v,r],k)=>{ctx.save();ctx.translate(cx+u*R,cy+v*R);ctx.rotate(r);ctx.fillStyle=cols[k%4];ctx.fillRect(-R*.05,-R*.016,R*.1,R*.032);ctx.restore();});
    const t=at(-Math.PI/2);ctx.strokeStyle='#2b6a4a';ctx.lineWidth=Math.max(2,R*.025);ctx.beginPath();ctx.moveTo(t.x,t.y-R*.14);ctx.quadraticCurveTo(t.x+R*.02,t.y-R*.28,t.x+R*.1,t.y-R*.3);ctx.stroke();
    ctx.fillStyle='#ff5a7a';ctx.strokeStyle='#b8344a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(t.x,t.y-R*.05,R*.11,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(t.x-R*.04,t.y-R*.09,R*.03,0,TAU);ctx.fill();}},
  tentacles:{back(ctx,at,cx,cy,R,T){ctx.lineCap='round';
    for(let k=0;k<5;k++){const p=at(Math.PI/2+(k-2)*0.42);ctx.beginPath();ctx.moveTo(p.x,p.y-R*.12);
      for(let s=1;s<=4;s++)ctx.lineTo(p.x+(k-2)*s*R*.02+Math.sin(s*1.4+k)*R*.04,p.y+s*R*.06-R*.04);
      ctx.strokeStyle=T.line;ctx.lineWidth=R*.1;ctx.stroke();ctx.strokeStyle=T.shade;ctx.lineWidth=R*.065;ctx.stroke();}},
    front(ctx,at,cx,cy,R){ctx.fillStyle='rgba(255,255,255,.6)';for(const [u,v,r] of [[-.42,-.5,.07],[0,-.66,.08],[.42,-.5,.07],[-.18,-.36,.045],[.22,-.34,.05]]){ctx.beginPath();ctx.arc(cx+u*R,cy+v*R,R*r,0,TAU);ctx.fill();}}},
  nori:{front(ctx,at,cx,cy,R){
    ctx.save();p3Bottom(ctx,at,0.55,Math.PI-0.55);ctx.clip();ctx.fillStyle='#2f4a3a';ctx.fillRect(cx-R*.36,cy,R*.72,R*1.5);
    ctx.strokeStyle='rgba(143,240,208,.25)';ctx.lineWidth=Math.max(1.5,R*.015);for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(cx-R*.36,cy+R*(.62+k*.12));ctx.lineTo(cx+R*.36,cy+R*(.62+k*.12));ctx.stroke();}
    ctx.restore();ctx.fillStyle='#2a1f33';for(const [u,v,r] of [[-.35,-.55,.5],[.05,-.68,-.3],[.4,-.48,.9],[-.1,-.4,1.4]]){ctx.beginPath();ctx.ellipse(cx+u*R,cy+v*R,R*.025,R*.045,r,0,TAU);ctx.fill();}}}
});
Object.assign(SPINS,{
  seashell:{name:'Seashell',price:15,p3:'ocean',body:'#7fd6d0',edge:'#ffd1e3',cap:'#fff',deco:'shell'},
  idolNote:{name:'Idol Note',price:15,p3:'stage',body:'#6d3fd6',edge:'#ffd166',cap:'#ff8cc6',deco:'note'}
});
Object.assign(FID_ICONS,{
  shell(ctx,x,y,s){ctx.beginPath();ctx.moveTo(x,y+s*.9);ctx.lineTo(x-s*.95,y-s*.1);ctx.quadraticCurveTo(x-s*.9,y-s,x,y-s*1.05);ctx.quadraticCurveTo(x+s*.9,y-s,x+s*.95,y-s*.1);ctx.closePath();ctx.fill();},
  note(ctx,x,y,s){ctx.beginPath();ctx.ellipse(x-s*.3,y+s*.62,s*.4,s*.28,-0.4,0,TAU);ctx.fill();ctx.fillRect(x+s*.02,y-s*.95,s*.18,s*1.55);
    ctx.beginPath();ctx.moveTo(x+s*.2,y-s*.95);ctx.quadraticCurveTo(x+s*.75,y-s*.6,x+s*.55,y-s*.1);ctx.quadraticCurveTo(x+s*.55,y-s*.5,x+s*.2,y-s*.55);ctx.closePath();ctx.fill();},
  boba(ctx,x,y,s){ctx.beginPath();ctx.arc(x,y,s*.55,0,TAU);ctx.fill();}
});
Object.assign(SLIMES,{
  milkTea:{name:'Milk Tea Slime',price:15,p3:'cafe',a:'#f2dcc0',b:'#c9a27a',hi:'#fff8ee',line:'#8a6440',deco:'boba',dc:['#3b2418','#5a3a26']},
  mermaid:{name:'Mermaid Slime',price:15,p3:'ocean',a:'#a5ece5',b:'#6f8fe0',hi:'#f0fffd',line:'#3f5fb0',deco:'shell',dc:['#ffd1e3','#ffffff','#ffd166']}
});
Object.assign(CUBES,{
  macaron:{name:'Macaron',price:10,p3:'cafe',face:'#ffd6e4',edge:'#e79ab8',part:'#a5ece5',part2:'#fff3b0',ink:'#5a2a3a'},
  idol:{name:'Idol Stage',price:15,p3:'stage',face:'#3a2266',edge:'#1d1240',part:'#ff8cc6',part2:'#ffd166',ink:'#ffffff'}
});
Object.assign(MARBLES,{
  seaBubble:{name:'Sea Bubble',price:10,p3:'ocean',a:'#e8fbff',b:'#7fd6d0',sw:'#6f8fe0'},
  boba:{name:'Boba Pearl',price:10,p3:'cafe',a:'#7a5a44',b:'#2e1c12',sw:'#c9a27a'}
});

/* ---------- stickers (Room & Style page): 3 things from a theme ---------- */
// Like p2Have (section 24), but clothes and decorations count by their theme chip, so the older 🎤 Stage things
// (Idol Stage Jacket, Idol Tiara, Disco Ball…) count for Stage Star too. Walls, floors and fidget designs count by p3.
function p3Have(p,theme){
  const keys=new Set();
  for(const [cat,c] of Object.entries(CLOSET)) for(const it of c.items) if(themesOf(cat+':'+it.id,it).includes(theme)) keys.add(cat+':'+it.id);
  for(const [pre,list] of [['wall',WALLS],['floor',FLOORS],['pop',POP_THEMES],['popshape',POP_SHAPES],['squish',SQUISHIES],['spin',SPINS],['slime',SLIMES],['cube',CUBES],['marble',MARBLES]])
    for(const [id,v] of Object.entries(list)) if(v.p3===theme) keys.add(pre+':'+id);
  const owned=p.owned.filter(k=>keys.has(k)).length;
  const decor=new Set(allItems(p).filter(i=>DECOR[i.type]&&themesOf('decor:'+i.type,DECOR[i.type]).includes(theme)).map(i=>i.type)).size;
  return owned+decor;
}
STICKERS.push(
  stk('p3stage','room','🎤','Stage Star','star','Get 3 stage things (clothes, room or fidgets)',3,p=>p3Have(p,'stage')),
  stk('p3cozy','room','🍵','Cozy Day','circle','Get 3 cozy things (clothes, room or fidgets)',3,p=>p3Have(p,'cozy')),
  stk('p3cafe','room','🧁','Cafe Owner','scallop','Get 3 cafe or bakery things',3,p=>p3Have(p,'cafe')),
  stk('p3ocean','room','🐚','Mermaid Friend','heart','Get 3 ocean or mermaid things',3,p=>p3Have(p,'ocean'))
);
