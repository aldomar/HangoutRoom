'use strict';
/* =========================================================
   38. CONTENT PACK 4 (v1.36): basketball, skate and karate, farm animals, more trucks and space, and the 🦖 dino nugget
   A pack only ADDS entries to the lists from earlier sections. All ids below are saved: never rename them.
   Clothes are drawn in the mascot's 200 x 270 box; decorations bottom-center at (0,0) like section 4.
   Every entry has p4:'sport' | 'farm' | 'ride' | 'space' | 'dino' (its theme chip; themesOf() in section 33 reads it).
   Only 🐮 Farm is a new chip. The Dino Nugget Plush is small, so it sits on a Little Shelf (any standing decoration
   snaps onto a shelf, section 9). It has a matching squishy. Original: no real brands, teams, logos or packaging.
   ========================================================= */
const P4_THEMES={sport:'🏀',farm:'🐮',ride:'🚒',space:'🚀',dino:'🦖'};
{const y=THEMES.yard,d=THEMES.dream; delete THEMES.yard; delete THEMES.dream;
  Object.assign(THEMES,{farm:{icon:'🐮',name:'Farm'},yard:y,dream:d});}
const p4L='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"', p4L3='stroke="#2b2235" stroke-width="3" stroke-linejoin="round"';
const p4Ball=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#ff8a2a" ${st('#2b2235',Math.max(1.5,r*.12))}/>`
  +`<path d="M${x-r} ${y} H${x+r} M${x} ${y-r} V${y+r} M${x-r*.7} ${y-r*.7} Q${x-r*.25} ${y} ${x-r*.7} ${y+r*.7} M${x+r*.7} ${y-r*.7} Q${x+r*.25} ${y} ${x+r*.7} ${y+r*.7}" stroke="#2b2235" stroke-width="${Math.max(1,r*.08)}" fill="none"/>`;
// The dino nugget: a chunky little long-neck dinosaur in golden crumbs. Every shape is drawn twice, a dark outline pass
// and then the fill, so it reads as one soft silhouette. (x, y) = bottom center, s = size.
function p4Nug(x,y,s,face){
  const sh=(c,w)=>`<g fill="${c}" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">`
    +`<ellipse cx="8" cy="-36" rx="46" ry="28"/><ellipse cx="-46" cy="-94" rx="20" ry="15"/>${[-28,-8,22,40].map(lx=>`<rect x="${lx-7}" y="-26" width="14" height="24" rx="6"/>`).join('')}</g>`
    +`<path d="M-30 -48 Q-46 -70 -44 -90" stroke="${c}" stroke-width="${26+w}" fill="none" stroke-linecap="round"/><path d="M44 -40 Q70 -36 84 -16" stroke="${c}" stroke-width="${16+w}" fill="none" stroke-linecap="round"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">`+sh('#7a4a1e',8)+sh('#e9a94b',0)
    +`<ellipse cx="0" cy="-48" rx="30" ry="12" fill="#f6cf86" opacity=".7"/>`
    +[[-20,-40],[4,-52],[26,-34],[-6,-24],[40,-46],[-40,-80],[-52,-104],[14,-18],[60,-34]].map(([a,b],k)=>`<circle cx="${a}" cy="${b}" r="${k%2?2.6:2}" fill="${k%2?'#c7832f':'#fbe2a8'}"/>`).join('')
    +(face?`<circle cx="-50" cy="-98" r="3.6" fill="#2a1f33"/><circle cx="-49" cy="-99.5" r="1.2" fill="#fff"/><path d="M-44 -88 q-5 4 -10 0" stroke="#2a1f33" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="-38" cy="-92" rx="4.5" ry="2.6" fill="#ff8fb8" opacity=".8"/>`:'')+`</g>`;
}

/* ---------- closet ---------- */
EXTRA_DEFS.push(`<pattern id="p4Gingham" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#fff"/><rect width="6" height="12" fill="#ff8a8a" opacity=".6"/><rect width="12" height="6" fill="#ff8a8a" opacity=".6"/></pattern>`);
const p4Rain=x=>`<rect x="${x}" y="210" width="37" height="38" rx="9" fill="#ffd23f" ${st()}/><rect x="${x-3}" y="244" width="43" height="10" rx="4" fill="#5a4a2a"/><path d="M${x+4} 218 H${x+33}" stroke="#e0a800" stroke-width="3"/><circle cx="${x+19}" cy="232" r="4" fill="#fff" opacity=".8"/>`;
CLOSET.top.items.push(
  {id:'hoopJersey',name:'Hoops Jersey',price:15,p4:'sport',
    t:()=>`<path d="${TORSO}" fill="#ff9f43" ${st()}/><path d="M86 127 L100 140 L114 127" fill="none" stroke="#fff" stroke-width="4"/><path d="M64 142 Q72 132 82 128 M136 142 Q128 132 118 128" stroke="#fff" stroke-width="4" fill="none"/>`
      +p4Ball(100,162,14)+`<path d="M60 182 H140" stroke="#3a4a8a" stroke-width="5"/>`},
  {id:'karateGi',name:'Karate Gi',price:20,p4:'sport',
    t:()=>`<path d="${TORSO}" fill="#fbf7ff" ${st()}/><path d="M86 127 L114 172 M114 127 L100 150" stroke="#cfc8de" stroke-width="3" fill="none"/>`
      +`<rect x="60" y="170" width="80" height="10" fill="#ffd166" ${st('#2b2235',1.5)}/><path d="M96 178 L90 194 M104 178 L110 194" stroke="#ffd166" stroke-width="6" stroke-linecap="round"/><rect x="94" y="169" width="12" height="12" rx="3" fill="#ffd166" ${st('#2b2235',1.5)}/>`,
    s:()=>sleeves('#fbf7ff',48)},
  {id:'overalls',name:'Farm Overalls',price:20,p4:'farm',
    t:()=>`<path d="${TORSO}" fill="url(#p4Gingham)" ${st()}/><path d="M80 148 L72 128 M120 148 L128 128" stroke="#5b8dd6" stroke-width="7"/><path d="M74 146 H126 V190 H74Z" fill="#5b8dd6" ${st('#2b2235',2)}/>`
      +`<circle cx="80" cy="152" r="3" fill="#ffd166"/><circle cx="120" cy="152" r="3" fill="#ffd166"/><path d="M88 162 H112 V176 H88Z" fill="#4a78c0" stroke="#2b2235" stroke-width="1.5"/><path d="${heartPath(100,169,4)}" fill="#ff8a8a"/>`,
    s:()=>sleeves('url(#p4Gingham)',26)},
  {id:'fireTop',name:'Fire Rescue Jacket',price:20,p4:'ride',
    t:()=>`<path d="${TORSO}" fill="#e8483f" ${st()}/><path d="M100 128 V188" stroke="#2b2235" stroke-width="2.5"/><g fill="#ffd166"><rect x="60" y="164" width="80" height="7"/><rect x="60" y="176" width="80" height="7"/></g>`
      +`<path d="M84 140 H94 V152 Q89 156 84 152Z" fill="#ffd166" ${st('#2b2235',1.5)}/>`,
    s:()=>sleeves('#e8483f',58)+`<g fill="#ffd166"><rect x="40" y="168" width="24" height="6" transform="${LA}"/><rect x="136" y="168" width="24" height="6" transform="${RA}"/></g>`},
  {id:'alienTee',name:'Little Alien Tee',price:15,p4:'space',
    t:()=>`<path d="${TORSO}" fill="#7a5fc9" ${st()}/><path d="M92 146 L86 134 M108 146 L114 134" stroke="#8fdc9f" stroke-width="3"/><circle cx="86" cy="133" r="3.5" fill="#ffd166"/><circle cx="114" cy="133" r="3.5" fill="#ffd166"/>`
      +`<ellipse cx="100" cy="160" rx="18" ry="16" fill="#8fdc9f" ${st('#2b2235',2)}/><ellipse cx="93" cy="158" rx="4.5" ry="6" fill="#2a1f33"/><ellipse cx="107" cy="158" rx="4.5" ry="6" fill="#2a1f33"/><path d="M95 168 Q100 172 105 168" stroke="#2a1f33" stroke-width="2" fill="none"/>`
      +`<path d="${starPath(72,176,4)} ${starPath(128,146,4)}" fill="#ffd166"/>`,
    s:()=>sleeves('#7a5fc9',26)},
  {id:'nuggetTee',name:'Dino Nugget Tee',price:15,p4:'dino',
    t:()=>`<path d="${TORSO}" fill="#fff3d6" ${st()}/><path d="M86 127 Q100 138 114 127" fill="none" stroke="#e9a94b" stroke-width="3"/>`+p4Nug(100,180,.34,1),
    s:()=>sleeves('#fff3d6',26)}
);
CLOSET.bottom.items.push(
  {id:'hoopShorts',name:'Hoops Shorts',price:15,p4:'sport',d:()=>`<path d="M60 180 H140 L146 222 H104 L100 204 L96 222 H54Z" fill="#3a4a8a" ${st()}/><path d="M62 184 L57 220 M138 184 L143 220" stroke="#ff9f43" stroke-width="5"/>`}
);
CLOSET.legs.items.push(
  {id:'kneePads',name:'Knee Pads',price:10,p4:'sport',d:()=>`<g fill="#ff8cc6" ${st()}><rect x="69" y="200" width="27" height="18" rx="7"/><rect x="104" y="200" width="27" height="18" rx="7"/></g><path d="${starPath(82,209,4)} ${starPath(118,209,4)}" fill="#fff"/>`}
);
CLOSET.arms.items.push(
  {id:'wristbands',name:'Wristbands',price:10,p4:'sport',d:()=>[[LA,40],[RA,136]].map(([t,x])=>`<g transform="${t}"><rect x="${x}" y="174" width="24" height="12" rx="3" fill="#ff9f43" ${st('#2b2235',2)}/><path d="M${x} 180 H${x+24}" stroke="#fff" stroke-width="3"/></g>`).join('')}
);
CLOSET.shoes.items.push(
  {id:'skateShoes',name:'Skate Shoes',price:15,p4:'sport',d:()=>kick(62,'#3b2f52','url(#p2CheckS)')+kick(98,'#3b2f52','url(#p2CheckS)')+`<path d="${starPath(78,236,4)} ${starPath(114,236,4)}" fill="#8ff0d0"/>`},
  {id:'rainBoots',name:'Rain Boots',price:15,p4:'farm',d:()=>p4Rain(64)+p4Rain(99)}
);
CLOSET.acc.items.push(
  {id:'skateHelmet',name:'Skate Helmet',price:15,p4:'sport',d:()=>`<path d="M50 74 Q54 108 66 122 M150 74 Q146 108 134 122" stroke="#2b2235" stroke-width="3" fill="none"/><path d="M46 78 Q46 26 100 26 Q154 26 154 78Z" fill="#8ff0d0" ${st()}/>`
    +`<path d="M84 34 V52 M100 30 V50 M116 34 V52" stroke="#3fae8c" stroke-width="5" stroke-linecap="round"/><path d="${starPath(136,58,7)}" fill="#ffd166" ${st('#b8860b',1.5)}/><path d="${heartPath(64,58,6)}" fill="#ff8cc6"/>`},
  {id:'sportBand',name:'Sports Headband',price:10,p4:'sport',d:()=>`<path d="M46 76 Q100 50 154 76" stroke="#ff5a5f" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M48 76 Q100 52 152 76" stroke="#fff" stroke-width="3" fill="none"/>`},
  {id:'strawHat',name:'Straw Hat',price:15,p4:'farm',d:()=>`<path d="M66 52 Q66 16 100 16 Q134 16 134 52Z" fill="#f2cf6a" ${st()}/><ellipse cx="100" cy="54" rx="68" ry="14" fill="#f2cf6a" ${st()}/>`
    +`<path d="M67 44 Q100 50 133 44" stroke="#e8483f" stroke-width="7" fill="none"/><path d="M42 54 L58 50 M142 50 L158 54 M80 60 L90 58 M112 60 L122 62" stroke="#d6a93a" stroke-width="2"/>`+p1Flower(124,40,'#fff')},
  {id:'chickClip',name:'Chick Clip',price:10,p4:'farm',d:()=>`<circle cx="134" cy="58" r="10" fill="#ffe066" ${st('#2b2235',1.5)}/><path d="M131 48 q3 -6 6 0" stroke="#e0a800" stroke-width="2" fill="none"/>`
    +`<path d="M142 58 l7 2 l-7 3Z" fill="#ff9f43"/><circle cx="137" cy="56" r="1.8" fill="#2a1f33"/><ellipse cx="129" cy="61" rx="4" ry="2.5" fill="#f2c94c"/>`},
  {id:'fireHelmet',name:'Fire Helmet',price:15,p4:'ride',d:()=>`<path d="M46 72 Q46 22 100 22 Q154 22 154 72 L168 80 Q100 68 32 80Z" fill="#e8483f" ${st()}/><path d="M100 24 V64" stroke="#c23a32" stroke-width="5"/>`
    +`<path d="M86 32 H114 V54 Q100 64 86 54Z" fill="#ffd166" ${st('#2b2235',2)}/><path d="${starPath(100,45,6)}" fill="#e8483f"/>`},
  {id:'starVisor',name:'Star Visor',price:15,p4:'space',d:()=>`<path d="M50 94 Q100 78 150 94 L146 110 Q100 96 54 110Z" fill="#7fc8ff" fill-opacity=".55" ${st('#2b2235',2.5)}/>`
    +`<path d="M62 92 L76 88" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="${starPath(48,100,7)} ${starPath(152,100,7)}" fill="#ffd166" ${st('#b8860b',1.5)}/>`}
);
CARD_TAGS.cute.push('top:overalls','top:alienTee','top:nuggetTee','shoes:rainBoots','acc:strawHat','acc:chickClip','legs:kneePads');
CARD_TAGS.spooky.push('acc:starVisor','shoes:skateShoes');
CARD_TAGS.sporty.push('top:hoopJersey','top:karateGi','top:fireTop','bottom:hoopShorts','legs:kneePads','arms:wristbands','shoes:skateShoes','acc:skateHelmet','acc:sportBand','acc:fireHelmet');

/* ---------- room: walls, floors, decorations ---------- */
EXTRA_DEFS.push(
  `<pattern id="p4Gym" width="160" height="160" patternUnits="userSpaceOnUse"><rect y="112" width="160" height="14" fill="#ff9f43" opacity=".55"/><rect y="128" width="160" height="6" fill="#3a4a8a" opacity=".45"/>`
    +`<circle cx="40" cy="50" r="10" fill="#ff8a2a" opacity=".5"/><path d="${starPath(120,40,6)}" fill="#ffd166" opacity=".7"/></pattern>`,
  `<pattern id="p4Barn" width="40" height="120" patternUnits="userSpaceOnUse"><path d="M38 0 V120" stroke="#9e3530" stroke-width="4"/><circle cx="20" cy="14" r="2" fill="#7a2925"/><circle cx="20" cy="104" r="2" fill="#7a2925"/></pattern>`,
  `<pattern id="p4Nebula" width="240" height="200" patternUnits="userSpaceOnUse"><ellipse cx="60" cy="60" rx="70" ry="34" fill="#ff8cc6" opacity=".18"/><ellipse cx="180" cy="150" rx="70" ry="30" fill="#7fc8ff" opacity=".18"/>`
    +`<path d="${starPath(120,40,6)} ${starPath(30,160,5)} ${starPath(210,70,4)}" fill="#ffd166"/><g fill="#fff"><circle cx="90" cy="120" r="2"/><circle cx="170" cy="20" r="1.6"/><circle cx="20" cy="90" r="1.6"/></g></pattern>`,
  `<pattern id="p4Court" width="200" height="60" patternUnits="userSpaceOnUse"><path d="M0 59 H200 M70 0 V30 M150 30 V60" stroke="#c98a45" stroke-width="2.5"/><path d="M0 30 H200" stroke="#c98a45" stroke-width="1.5"/></pattern>`,
  `<pattern id="p4Hay" width="90" height="60" patternUnits="userSpaceOnUse"><path d="M6 14 l18 -4 M40 40 l20 4 M62 12 l16 6 M14 50 l14 -6" stroke="#d6a93a" stroke-width="3" stroke-linecap="round"/></pattern>`,
  `<pattern id="p4Roads" width="200" height="140" patternUnits="userSpaceOnUse"><rect y="56" width="200" height="34" fill="#6b7280"/><rect x="120" width="34" height="140" fill="#6b7280"/>`
    +`<path d="M0 73 H112 M162 73 H200 M137 0 V48 M137 98 V140" stroke="#ffd166" stroke-width="3" stroke-dasharray="10 8"/><circle cx="50" cy="24" r="10" fill="#5cb85c"/><circle cx="60" cy="116" r="8" fill="#5cb85c"/></pattern>`
);
Object.assign(WALLS,{
  gymWall:{name:'Sports Gym',price:20,fill:'#f4ead8',pat:'p4Gym',p4:'sport'},
  barnWood:{name:'Red Barn Boards',price:20,fill:'#c8473d',pat:'p4Barn',p4:'farm'},
  nebula:{name:'Nebula Swirl',price:25,fill:'#2a1a4a',pat:'p4Nebula',p4:'space'}
});
Object.assign(FLOORS,{
  court:{name:'Basketball Court',price:20,fill:'#e8b36b',pat:'p4Court',p4:'sport'},
  hayFloor:{name:'Hay Floor',price:15,fill:'#f2d27a',pat:'p4Hay',p4:'farm'},
  roadMat:{name:'Town Play Mat',price:20,fill:'#8fd18f',pat:'p4Roads',p4:'ride'}
});
const p4Wheel=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#2b2235"/><circle cx="${x}" cy="${y}" r="${r*.45}" fill="#c9d1de"/>`;
Object.assign(DECOR,{
  // 🦖 the owner's wish: small enough for a Little Shelf
  dinoNugget:{name:'Dino Nugget Plush',price:15,p4:'dino',box:'-80 -100 160 105',d:()=>`<ellipse cx="2" cy="-2" rx="58" ry="6" fill="#00000030"/>`+p4Nug(0,0,.78,1)},
  // sport
  hoop:{name:'Basketball Hoop',price:25,p4:'sport',box:'-90 -300 180 310',d:()=>`<ellipse cx="0" cy="-4" rx="70" ry="9" fill="#00000030"/><rect x="-36" y="-22" width="72" height="20" rx="6" fill="#3a4a8a" ${p4L}/>`
    +`<rect x="-6" y="-230" width="12" height="210" fill="#8a96ab" ${p4L3}/><rect x="-72" y="-292" width="144" height="92" rx="8" fill="#fbf7ff" ${p4L}/><rect x="-26" y="-262" width="52" height="40" fill="none" stroke="#ff8a2a" stroke-width="5"/>`
    +`<path d="M-30 -206 L-22 -172 M-10 -206 L-8 -170 M10 -206 L8 -170 M30 -206 L22 -172 M-26 -190 H26 M-22 -176 H22" stroke="#fff" stroke-width="3"/><path d="M-30 -206 L-22 -172 M30 -206 L22 -172" stroke="#c9cfe0" stroke-width="2"/>`
    +`<ellipse cx="0" cy="-206" rx="34" ry="7" fill="none" stroke="#ff5a1a" stroke-width="6"/>`+p4Ball(46,-24,22)},
  skateRamp:{name:'Mini Skate Ramp',price:25,p4:'sport',box:'-150 -130 300 140',d:()=>`<ellipse cx="0" cy="-3" rx="140" ry="9" fill="#00000030"/>`
    +`<path d="M-140 -4 L-74 -66 H74 L140 -4Z" fill="#a97cff" ${p4L}/><path d="M-74 -66 H74" stroke="#c9cfe0" stroke-width="6"/><path d="M-100 -26 L-60 -50 M60 -50 L100 -26" stroke="#fff" stroke-width="4" opacity=".5"/>`
    +`<path d="${starPath(0,-34,13)}" fill="#ffd166" ${p4L3}/><rect x="-54" y="-94" width="108" height="13" rx="6" fill="#ff8cc6" ${p4L3}/>`+[-34,34].map(x=>`<circle cx="${x}" cy="-75" r="7" fill="#8ff0d0" ${st('#2b2235',2)}/>`).join('')},
  karateMat:{name:'Karate Mat',price:15,p4:'sport',flat:1,box:'-170 -80 340 90',d:()=>`<rect x="-160" y="-68" width="320" height="64" rx="10" fill="#5cb8a8" stroke="#2f7a6a" stroke-width="6"/>`
    +`<rect x="-120" y="-56" width="240" height="40" rx="6" fill="none" stroke="#fbf7ff" stroke-width="3" opacity=".7"/><ellipse cx="0" cy="-36" rx="34" ry="12" fill="#ffd166" opacity=".8"/>`},
  skateRack:{name:'Skateboard Rack',price:15,p4:'sport',wall:1,box:'-120 -230 240 220',d:()=>`<rect x="-110" y="-224" width="220" height="12" rx="5" fill="#8a5e35" ${p4L3}/>`
    +[[-50,'#ff8cc6','#ffd166'],[50,'#8ff0d0','#a97cff']].map(([x,c,c2])=>`<rect x="${x-24}" y="-212" width="48" height="190" rx="24" fill="${c}" ${p4L}/><path d="${starPath(x,-150,12)}" fill="${c2}"/><path d="${heartPath(x,-90,10)}" fill="#fff"/>`
      +`<circle cx="${x-14}" cy="-190" r="5" fill="#c9cfe0"/><circle cx="${x+14}" cy="-190" r="5" fill="#c9cfe0"/>`).join('')},
  // farm
  barn:{name:'Toy Barn',price:30,p4:'farm',box:'-140 -230 280 240',d:()=>`<ellipse cx="0" cy="-4" rx="130" ry="10" fill="#00000030"/>`
    +`<path d="M-120 -4 V-140 L-70 -196 H70 L120 -140 V-4Z" fill="#d9483f" ${p4L}/><path d="M-128 -136 L-72 -202 H72 L128 -136" stroke="#fbf7ff" stroke-width="10" fill="none" stroke-linejoin="round"/><path d="M-128 -136 L-72 -202 H72 L128 -136" ${p4L3} fill="none"/>`
    +`<rect x="-46" y="-96" width="92" height="92" fill="#b8352e" ${p4L3}/><path d="M-46 -96 L46 -4 M46 -96 L-46 -4" stroke="#fbf7ff" stroke-width="7"/><rect x="-46" y="-96" width="92" height="92" fill="none" stroke="#fbf7ff" stroke-width="6"/>`
    +`<circle cx="0" cy="-150" r="22" fill="#fff3d6" ${p4L3}/><ellipse cx="0" cy="-142" rx="12" ry="8" fill="#ffc9de"/><circle cx="-8" cy="-156" r="3" fill="#2a1f33"/><circle cx="8" cy="-156" r="3" fill="#2a1f33"/>`
    +`<path d="M-22 -164 l-10 -6 M22 -164 l10 -6" stroke="#2b2235" stroke-width="4" stroke-linecap="round"/>`},
  cowPlush:{name:'Cow Plush',price:15,p4:'farm',box:'-75 -140 150 150',d:()=>`<ellipse cx="0" cy="-3" rx="56" ry="7" fill="#00000030"/>`
    +`<ellipse cx="0" cy="-36" rx="46" ry="34" fill="#fbf7ff" ${p4L}/><path d="M-30 -52 q14 -10 22 6 q-6 14 -22 6Z M18 -30 q16 -6 18 10 q-12 8 -18 -10Z" fill="#3b2f52"/>`
    +`<path d="M-48 -102 l-16 -10 l8 16Z M48 -102 l16 -10 l-8 16Z" fill="#ffc9de" ${st('#2b2235',2.5)}/><path d="M-22 -122 q-4 -10 4 -12 M22 -122 q4 -10 -4 -12" stroke="#f2cf6a" stroke-width="6" stroke-linecap="round" fill="none"/>`
    +`<ellipse cx="0" cy="-94" rx="40" ry="32" fill="#fbf7ff" ${p4L}/><path d="M14 -122 q14 2 18 18 q-14 0 -18 -18Z" fill="#3b2f52"/><ellipse cx="0" cy="-76" rx="22" ry="12" fill="#ffc9de" ${st('#2b2235',2.5)}/>`
    +`<circle cx="-7" cy="-76" r="2.5" fill="#c8578f"/><circle cx="7" cy="-76" r="2.5" fill="#c8578f"/>`+p2Eyes(-15,15,-98,4.5)},
  sheepPlush:{name:'Sheep Plush',price:15,p4:'farm',box:'-75 -130 150 140',d:()=>`<ellipse cx="0" cy="-3" rx="56" ry="7" fill="#00000030"/>`
    +[-26,-8,10,28].map(x=>`<rect x="${x-6}" y="-30" width="12" height="28" rx="5" fill="#4b3a66"/>`).join('')
    +`<g fill="#fff8ee" ${st('#2b2235',3)}>${[[-36,-56],[-14,-72],[12,-72],[36,-56],[-24,-38],[0,-40],[24,-38],[0,-64]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="22"/>`).join('')}</g>`
    +`<g fill="#fff8ee">${[[-36,-56],[-14,-72],[12,-72],[36,-56],[-24,-38],[0,-40],[24,-38],[0,-64]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="19"/>`).join('')}</g>`
    +`<ellipse cx="-46" cy="-82" rx="12" ry="7" fill="#4b3a66" transform="rotate(-25 -46 -82)"/><ellipse cx="46" cy="-82" rx="12" ry="7" fill="#4b3a66" transform="rotate(25 46 -82)"/>`
    +`<ellipse cx="0" cy="-84" rx="28" ry="26" fill="#4b3a66" ${p4L3}/><circle cx="-10" cy="-88" r="4" fill="#fff"/><circle cx="10" cy="-88" r="4" fill="#fff"/><circle cx="-10" cy="-87" r="2" fill="#2a1f33"/><circle cx="10" cy="-87" r="2" fill="#2a1f33"/>`
    +`<path d="M-5 -74 q5 4 10 0" stroke="#ffc9de" stroke-width="2.5" fill="none" stroke-linecap="round"/><g fill="#fff8ee">${[-12,0,12].map(x=>`<circle cx="${x}" cy="-108" r="9"/>`).join('')}</g>`},
  hayBale:{name:'Hay Bale Seat',price:15,p4:'farm',yard:1,box:'-100 -100 200 110',d:()=>`<ellipse cx="0" cy="-3" rx="90" ry="8" fill="#00000030"/><rect x="-86" y="-86" width="172" height="82" rx="14" fill="#e8c45a" ${p4L}/>`
    +`<path d="M-76 -70 l20 4 M-30 -60 l24 -4 M20 -74 l22 6 M40 -36 l26 -4 M-64 -30 l22 6 M-10 -24 l20 -2" stroke="#c99a2e" stroke-width="3" stroke-linecap="round"/><path d="M-40 -86 V-4 M40 -86 V-4" stroke="#e8483f" stroke-width="5"/>`},
  tractor:{name:'Toy Tractor',price:25,p4:'farm',yard:1,box:'-130 -180 260 190',d:()=>`<ellipse cx="0" cy="-3" rx="120" ry="9" fill="#00000030"/>`
    +`<rect x="-90" y="-90" width="190" height="50" rx="10" fill="#5cb85c" ${p4L}/><path d="M-80 -90 V-160 H-6 V-90" fill="#bfe6ff" ${p4L}/><rect x="-86" y="-168" width="86" height="12" rx="4" fill="#5cb85c" ${p4L3}/>`
    +`<rect x="70" y="-130" width="10" height="40" fill="#8a96ab" ${p4L3}/><circle cx="86" cy="-60" r="6" fill="#fff3b0" ${st('#2b2235',2)}/>`
    +p2Eyes(-56,-30,-128,4)+p2Smile(-43,-116,6)+p4Wheel(-54,-40,38)+p4Wheel(74,-26,22)},
  // trucks and space
  fireTruck:{name:'Toy Fire Truck',price:25,p4:'ride',box:'-140 -160 280 170',d:()=>`<ellipse cx="0" cy="-3" rx="130" ry="9" fill="#00000030"/>`
    +`<rect x="-130" y="-100" width="170" height="62" rx="8" fill="#e8483f" ${p4L}/><path d="M40 -38 V-108 Q40 -116 48 -116 H96 Q112 -116 118 -96 L128 -66 V-38Z" fill="#e8483f" ${p4L}/>`
    +`<path d="M54 -104 H94 Q102 -104 106 -92 L112 -74 H54Z" fill="#bfe6ff" stroke="#2b2235" stroke-width="3"/>`+p2Eyes(72,92,-90,4)+p2Smile(82,-80,6)
    +`<rect x="-120" y="-122" width="150" height="14" rx="4" fill="#c9d1de" ${p4L3}/><path d="${[-100,-76,-52,-28,-4,20].map(x=>`M${x} -122 V-108`).join(' ')}" stroke="#2b2235" stroke-width="3"/>`
    +`<rect x="64" y="-130" width="22" height="14" rx="5" fill="#7fc8ff" ${st('#2b2235',2.5)}/><rect x="-130" y="-74" width="258" height="8" fill="#ffd166"/>`+[-92,-30,90].map(x=>p4Wheel(x,-30,20)).join('')},
  carBed:{name:'Race Car Bed',price:40,p4:'ride',box:'-200 -180 400 190',d:()=>`<ellipse cx="0" cy="-4" rx="190" ry="11" fill="#00000030"/>`
    +`<path d="M-186 -24 V-90 Q-186 -104 -170 -104 H-120 L-110 -150 H-40 L-30 -104 H150 Q186 -100 190 -60 V-24Z" fill="#ff5a5f" ${p4L}/><path d="M-104 -144 H-46 L-38 -110 H-112Z" fill="#bfe6ff" ${p4L3}/>`
    +`<rect x="-20" y="-128" width="200" height="30" rx="12" fill="#fff" ${p4L3}/><rect x="40" y="-132" width="140" height="34" rx="12" fill="url(#p2CheckS)" ${p4L3}/><rect x="-14" y="-140" width="54" height="24" rx="10" fill="#e9ddff" ${p4L3}/>`
    +`<circle cx="-140" cy="-64" r="20" fill="#fff" ${p4L3}/><path d="${starPath(-140,-64,11)}" fill="#ffd166"/><path d="M-186 -50 H190" stroke="#fff" stroke-width="6"/>`+[-120,120].map(x=>p4Wheel(x,-22,28)).join('')},
  ufoLamp:{name:'UFO Lamp',price:20,p4:'space',box:'-90 -230 180 240',d:()=>`<ellipse cx="0" cy="-4" rx="56" ry="8" fill="#00000030"/><ellipse cx="0" cy="-12" rx="44" ry="10" fill="#3b2f52" ${p4L3}/>`
    +`<path d="M-26 -18 L-44 -140 H44 L26 -18Z" fill="#8ff0d0" opacity=".3"/><path d="M0 -18 V-140" stroke="#8a96ab" stroke-width="6"/>`
    +`<path d="M-40 -170 Q-40 -214 0 -214 Q40 -214 40 -170Z" fill="#bfe6ff" fill-opacity=".85" ${p4L3}/><ellipse cx="0" cy="-182" rx="14" ry="13" fill="#8fdc9f"/><ellipse cx="-5" cy="-184" rx="3.5" ry="4.5" fill="#2a1f33"/><ellipse cx="5" cy="-184" rx="3.5" ry="4.5" fill="#2a1f33"/>`
    +`<ellipse cx="0" cy="-160" rx="80" ry="20" fill="#c9cfe0" ${p4L}/>`+[-54,-18,18,54].map((x,k)=>`<circle cx="${x}" cy="-158" r="6" fill="${['#ff8cc6','#ffd166','#8ff0d0','#a97cff'][k]}"/>`).join('')},
  alienPlush:{name:'Alien Plush',price:15,p4:'space',box:'-70 -160 140 170',d:()=>`<ellipse cx="0" cy="-3" rx="54" ry="7" fill="#00000030"/>`
    +`<path d="M-22 -112 L-34 -146 M22 -112 L34 -146" stroke="#5cb85c" stroke-width="5" stroke-linecap="round"/><circle cx="-34" cy="-148" r="8" fill="#ffd166" ${st('#2b2235',2.5)}/><circle cx="34" cy="-148" r="8" fill="#ff8cc6" ${st('#2b2235',2.5)}/>`
    +`<path d="M-48 -50 Q-64 -40 -58 -22 M48 -50 Q64 -40 58 -22" stroke="#8fdc9f" stroke-width="14" fill="none" stroke-linecap="round"/>`
    +`<path d="M-50 -4 Q-56 -120 0 -122 Q56 -120 50 -4Z" fill="#8fdc9f" ${p4L}/><ellipse cx="-17" cy="-80" rx="11" ry="14" fill="#2a1f33"/><ellipse cx="17" cy="-80" rx="11" ry="14" fill="#2a1f33"/>`
    +`<circle cx="-13" cy="-86" r="4" fill="#fff"/><circle cx="21" cy="-86" r="4" fill="#fff"/>`+p2Smile(0,-52,8)+p2Blush(-30,30,-58)+`<path d="${starPath(0,-26,9)}" fill="#ffd166"/>`}
});
Object.assign(NIGHT_GLOW,{ufoLamp:{y:-150,r:110,c:'mint'}});

/* ---------- fidgets ---------- */
Object.assign(POP_THEMES,{
  hoops:{name:'Hoops',price:15,p4:'sport',board:'#3a4a8a',cols:['#ff8a2a','#ffb066','#ff8a2a','#ffb066','#ff8a2a','#ffb066']},
  farm:{name:'Farm Day',price:10,p4:'farm',board:'#8fd18f',cols:['#e8483f','#f2cf6a','#fbf7ff','#ffc9de','#a97a52','#7fc8ff']},
  nebula:{name:'Nebula',price:15,p4:'space',board:'#2a1a4a',cols:['#ff8cc6','#c9a7ff','#7fc8ff','#8ff0d0','#ffd166','#ff8cc6']}
});
Object.assign(POP_SHAPES,{
  bball:{name:'🏀 Ball Board',price:15,p4:'sport',path:'M50 -2 A52 52 0 1 1 49.9 -2Z'},
  nugget:{name:'🦖 Nugget Board',price:15,p4:'dino',path:'M6 30 C2 12 22 2 34 12 C42 20 38 32 42 42 C56 36 76 38 88 50 C98 60 104 72 106 86 C96 82 90 84 88 90 V102 H70 V92 H50 V102 H32 V88 C20 80 16 66 18 56 C12 50 8 42 6 30Z'}
});
SQUISHIES.nugget={name:'Dino Nugget',price:20,p4:'dino',fill:'#efb557',shade:'#cf8a35',line:'#7a4a1e',hi:'#fde3a6',extra:'nugget'};
SQUISHIES.chick={name:'Chicky',price:15,p4:'farm',fill:'#ffe680',shade:'#f2c94c',line:'#c99a2e',hi:'#fffbe0',extra:'chick'};
SQUISHIES.bball={name:'Bouncy Ball',price:15,p4:'sport',fill:'#ff9a45',shade:'#e0702a',line:'#9a4614',hi:'#ffd2a8',extra:'seams'};
Object.assign(SQ_EXTRAS,{
  nugget:{back(ctx,at,cx,cy,R,T){ctx.fillStyle=T.fill;ctx.strokeStyle=T.line;ctx.lineWidth=3;ctx.lineJoin='round';
      const t=at(0.3);ctx.beginPath();ctx.moveTo(t.x-R*.12,t.y-R*.16);ctx.quadraticCurveTo(t.x+R*.3,t.y-R*.06,t.x+R*.44,t.y+R*.2);ctx.quadraticCurveTo(t.x+R*.1,t.y+R*.18,t.x-R*.06,t.y+R*.14);ctx.closePath();ctx.fill();ctx.stroke();
      for(const a of [-2.25,-1.85,-1.45,-1.05]){const p=at(a),dx=p.x-cx,dy=p.y-cy,l=Math.hypot(dx,dy)||1;ctx.beginPath();ctx.arc(p.x+dx/l*R*.03,p.y+dy/l*R*.03,R*.11,0,TAU);ctx.fill();ctx.stroke();}
      for(const a of [Math.PI/2-0.5,Math.PI/2+0.5]){const p=at(a);ctx.beginPath();ctx.ellipse(p.x,p.y+R*.02,R*.15,R*.1,0,0,TAU);ctx.fill();ctx.stroke();}},
    front(ctx,at,cx,cy,R){[[-.6,-.45],[-.3,-.62],[.1,-.6],[.45,-.42],[.66,-.12],[-.7,.15],[.55,.45],[-.42,.55],[.18,.62],[0,-.32],[-.18,-.46],[.32,-.22]].forEach(([u,v],k)=>{
      ctx.fillStyle=k%2?'#c7832f':'#fde3a6';ctx.beginPath();ctx.arc(cx+u*R,cy+v*R,R*(k%3?.022:.03),0,TAU);ctx.fill();});}},
  chick:{back(ctx,at,cx,cy,R,T){ctx.fillStyle=T.shade;ctx.strokeStyle=T.line;ctx.lineWidth=3;
      for(const sg of [-1,1]){const p=at(sg>0?0.1:Math.PI-0.1);ctx.beginPath();ctx.ellipse(p.x+sg*R*.05,p.y,R*.16,R*.24,sg*0.6,0,TAU);ctx.fill();ctx.stroke();}},
    front(ctx,at,cx,cy,R,T){const t=at(-Math.PI/2);ctx.strokeStyle=T.line;ctx.lineWidth=Math.max(2.5,R*.03);ctx.lineCap='round';
      for(const o of [-1,0,1]){ctx.beginPath();ctx.moveTo(t.x+o*R*.05,t.y+R*.03);ctx.quadraticCurveTo(t.x+o*R*.16,t.y-R*.2,t.x+o*R*.02,t.y-R*.22);ctx.stroke();}}},
  seams:{front(ctx,at,cx,cy,R,T){ctx.strokeStyle=T.line;ctx.lineWidth=Math.max(2,R*.025);ctx.lineCap='round';
    for(const sg of [-1,1]){ctx.beginPath();ctx.arc(cx+sg*R*1.3,cy,R*.9,sg>0?Math.PI-0.6:-0.6,sg>0?Math.PI+0.6:0.6);ctx.stroke();}
    const a=at(-Math.PI/2-0.9),b=at(-Math.PI/2+0.9);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(cx,cy-R*.36,b.x,b.y);ctx.stroke();}}
});
Object.assign(SPINS,{
  hoops:{name:'Hoops',price:15,p4:'sport',body:'#ff8a2a',edge:'#2b2235',cap:'#fff',deco:'star'},
  ufo:{name:'UFO',price:15,p4:'space',body:'#2a1a4a',edge:'#8ff0d0',cap:'#c9cfe0',deco:'ufo'}
});
Object.assign(FID_ICONS,{
  ufo(ctx,x,y,s){ctx.beginPath();ctx.ellipse(x,y+s*.15,s,s*.32,0,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(x,y,s*.45,Math.PI,TAU);ctx.fill();},
  flower(ctx,x,y,s){for(let k=0;k<5;k++){const a=k*TAU/5;ctx.beginPath();ctx.arc(x+Math.cos(a)*s*.45,y+Math.sin(a)*s*.45,s*.32,0,TAU);ctx.fill();}}
});
Object.assign(SLIMES,{
  meadow:{name:'Meadow Slime',price:15,p4:'farm',a:'#c6f0a0',b:'#7fc86a',hi:'#f4ffe8',line:'#3f8f55',deco:'flower',dc:['#ffffff','#ffd166','#ff8cc6']},
  nebula:{name:'Nebula Goo',price:15,p4:'space',a:'#7a4ab8',b:'#2a1a4a',hi:'#d9b8ff',line:'#140a26',deco:'ufo',dc:['#8ff0d0','#ffd166'],dark:true}
});
Object.assign(CUBES,{
  hoops:{name:'Hoops',price:10,p4:'sport',face:'#ff9a45',edge:'#9a4614',part:'#3a4a8a',part2:'#ffffff',ink:'#2b2235'},
  farm:{name:'Farm',price:10,p4:'farm',face:'#e8483f',edge:'#9e3530',part:'#fbf7ff',part2:'#f2cf6a',ink:'#ffffff'}
});
Object.assign(MARBLES,{
  bball:{name:'Mini Ball',price:10,p4:'sport',a:'#ffb066',b:'#e0702a',sw:'#2b2235'},
  egg:{name:'Speckled Egg',price:10,p4:'farm',a:'#fffbe8',b:'#e8d6b0',sw:'#a97a52'}
});

/* ---------- stickers (Room & Style page) ---------- */
// Clothes and decorations count by their theme chip (so soccer things count for All-Star, Pack 2 trucks for Big
// Adventures); walls, floors and fidget designs count by p4.
function p4Have(p,theme){
  const keys=new Set();
  for(const [cat,c] of Object.entries(CLOSET)) for(const it of c.items) if(themesOf(cat+':'+it.id,it).includes(theme)) keys.add(cat+':'+it.id);
  for(const [pre,list] of [['wall',WALLS],['floor',FLOORS],['pop',POP_THEMES],['popshape',POP_SHAPES],['squish',SQUISHIES],['spin',SPINS],['slime',SLIMES],['cube',CUBES],['marble',MARBLES]])
    for(const [id,v] of Object.entries(list)) if(v.p4===theme) keys.add(pre+':'+id);
  const owned=p.owned.filter(k=>keys.has(k)).length;
  const decor=new Set(allItems(p).filter(i=>DECOR[i.type]&&themesOf('decor:'+i.type,DECOR[i.type]).includes(theme)).map(i=>i.type)).size;
  return owned+decor;
}
const p4Nuggets=p=>(allItems(p).some(i=>i.type==='dinoNugget')?1:0)+(p.owned.includes('squish:nugget')?1:0);
STICKERS.push(
  stk('p4sport','room','🏀','All-Star','star','Get 3 sport things (basketball, skate, karate or soccer)',3,p=>p4Have(p,'sport')),
  stk('p4farm','room','🐮','Farm Friend','circle','Get 3 farm things (clothes, room or fidgets)',3,p=>p4Have(p,'farm')),
  stk('p4go','room','🚒','Big Adventures','scallop','Get 5 truck, car or space things',5,p=>p4Have(p,'ride')+p4Have(p,'space')),
  stk('p4nug','room','🦖','Nugget Buddy','heart','Get the Dino Nugget Plush and the Dino Nugget squishy',2,p4Nuggets)
);
