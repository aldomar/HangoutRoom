'use strict';
/* =========================================================
   24. CONTENT PACK 2 (v1.21): dinosaurs, space and rockets, trucks/trains/cars, robots/sharks/heroes
   A pack only ADDS entries to the lists from earlier sections. All ids below are saved: never rename them.
   Clothes are drawn in the mascot's 200 x 270 box; decorations bottom-centre at (0,0) like section 4.
   Every entry has p2:'dino' | 'space' | 'ride' | 'hero' (its theme), counted by the four pack stickers.
   Everything is for everyone: nothing here is labelled "boy" or "girl".
   ========================================================= */
const P2_THEMES={dino:'🦕',space:'🚀',ride:'🚂',hero:'🤖'};
const p2Line='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"';
const p2Eyes=(x1,x2,y,r)=>[x1,x2].map(x=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#2a1f33"/><circle cx="${x+r*.35}" cy="${y-r*.35}" r="${r*.35}" fill="#fff"/>`).join('');
const p2Smile=(x,y,w)=>`<path d="M${x-w} ${y} Q${x} ${y+w*.9} ${x+w} ${y}" stroke="#2a1f33" stroke-width="3" fill="none" stroke-linecap="round"/>`;
const p2Blush=(x1,x2,y)=>`<ellipse cx="${x1}" cy="${y}" rx="7" ry="4" fill="#ff8fb8" opacity=".7"/><ellipse cx="${x2}" cy="${y}" rx="7" ry="4" fill="#ff8fb8" opacity=".7"/>`;

/* ---------- closet ---------- */
const p2Spike=(x,y,s,c)=>`<path d="M${x-s} ${y} L${x} ${y-s*1.6} L${x+s} ${y}Z" fill="${c||'#ffb347'}" ${st('#2b2235',2)}/>`;
const p2Wheel=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#2b2235"/><circle cx="${x}" cy="${y}" r="${r*.45}" fill="#c9d1de"/>`;
const p2Boot=x=>`<rect x="${x}" y="224" width="37" height="24" rx="9" fill="#dde3ee" ${st()}/><rect x="${x-3}" y="244" width="43" height="10" rx="4" fill="#8a96ab"/>`
  +`<path d="M${x+4} 233 H${x+33}" stroke="#ff6b6b" stroke-width="4"/><path d="${starPath(x+18,239,4)}" fill="#ffd166"/>`
  +`<path d="M${x+8} 254 Q${x+12} 263 ${x+16} 254 Q${x+20} 264 ${x+24} 254 Q${x+28} 263 ${x+32} 254Z" fill="#ffb347" stroke="#ff6b6b" stroke-width="1.5"/>`;
const p2Foot=x=>`<ellipse cx="${x}" cy="244" rx="20" ry="11" fill="#8fdc9f" ${st('#3f8f55',2.5)}/>`
  +[-11,0,11].map(o=>`<path d="M${x+o-4} 252 L${x+o} 259 L${x+o+4} 252Z" fill="#fff" stroke="#3f8f55" stroke-width="1.5"/>`).join('')
  +`<circle cx="${x-7}" cy="240" r="2.5" fill="#5cb85c"/><circle cx="${x+6}" cy="238" r="3" fill="#5cb85c"/>`;
CLOSET.top.items.push(
  {id:'dinoHoodie',name:'Dino Spike Hoodie',price:20,p2:'dino',
    t:()=>`<path d="${TORSO}" fill="#8fdc9f" ${st()}/><ellipse cx="100" cy="164" rx="22" ry="20" fill="#e7f8d9"/><path d="M84 156 H116 M82 166 H118 M86 176 H114" stroke="#b9e3a6" stroke-width="2.5"/>`
      +`<circle cx="70" cy="174" r="4" fill="#5cb85c"/><circle cx="131" cy="158" r="5" fill="#5cb85c"/>`,
    s:()=>sleeves('#8fdc9f',58)+`<g transform="${LA}">${[148,162,176].map(y=>`<path d="M41 ${y-6} L31 ${y} L41 ${y+6}Z" fill="#ffb347" ${st('#2b2235',2)}/>`).join('')}</g><g transform="${RA}">${[148,162,176].map(y=>`<path d="M159 ${y-6} L169 ${y} L159 ${y+6}Z" fill="#ffb347" ${st('#2b2235',2)}/>`).join('')}</g>`},
  {id:'rocketTee',name:'Rocket Tee',price:15,p2:'space',
    t:()=>`<path d="${TORSO}" fill="#26305e" ${st()}/><path d="M86 127 Q100 138 114 127" fill="none" stroke="#ffd166" stroke-width="3"/>`
      +`<path d="M92 174 L84 182 V170 Z M108 174 L116 182 V170Z" fill="#ff6b6b"/><path d="M100 140 C108 146 110 158 108 176 H92 C90 158 92 146 100 140Z" fill="#fff" ${st('#2b2235',2)}/>`
      +`<path d="M100 140 C104 143 106 147 107 151 H93 C94 147 96 143 100 140Z" fill="#ff6b6b"/><circle cx="100" cy="161" r="4" fill="#7fc8ff" ${st('#2b2235',1.5)}/>`
      +`<path d="M95 177 Q100 188 105 177Z" fill="#ffb347"/><path d="${starPath(76,148,4)} ${starPath(126,170,5)} ${starPath(122,140,3)}" fill="#ffd166"/>`,
    s:()=>sleeves('#26305e',26)},
  {id:'robotTop',name:'Robot Suit',price:20,p2:'hero',
    t:()=>`<path d="${TORSO}" fill="#c9d1de" ${st()}/><rect x="82" y="142" width="36" height="32" rx="6" fill="#3a4a66" ${st('#2b2235',2)}/>`
      +`<circle cx="92" cy="152" r="4" fill="#ff6b6b"/><circle cx="104" cy="152" r="4" fill="#ffd166"/><circle cx="92" cy="164" r="4" fill="#4fd1c5"/><path d="${heartPath(107,164,5)}" fill="#ff8cc6"/>`
      +[[68,140],[132,140],[68,180],[132,180]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.5" fill="#7a869c"/>`).join(''),
    s:()=>sleeves('#c9d1de',58)+`<g fill="#8a96ab"><rect x="40" y="152" width="24" height="5" transform="${LA}"/><rect x="136" y="152" width="24" height="5" transform="${RA}"/></g>`},
  {id:'heroSuit',name:'Star Hero Suit',price:25,p2:'hero',
    t:()=>`<path d="${TORSO}" fill="#4a7bff" ${st()}/><rect x="60" y="178" width="80" height="9" fill="#ffd166" ${st('#2b2235',2)}/>`
      +`<path d="M84 142 H116 L114 160 Q100 172 86 160Z" fill="#ffd166" ${st('#2b2235',2)}/><path d="${starPath(100,154,8)}" fill="#ff5a7a"/>`
      +`<path d="M84 146 Q72 144 66 150 Q76 150 84 154Z M116 146 Q128 144 134 150 Q124 150 116 154Z" fill="#fff" ${st('#2b2235',1.5)}/>`,
    s:()=>sleeves('#4a7bff',58)+`<g fill="#ff5a7a" ${st()}><rect x="40" y="176" width="24" height="12" rx="4" transform="${LA}"/><rect x="136" y="176" width="24" height="12" rx="4" transform="${RA}"/></g>`}
);
CLOSET.bottom.items.push(
  {id:'dinoShorts',name:'Dino Shorts',price:15,p2:'dino',d:()=>`<path d="M60 180 H140 L144 214 H104 L100 202 L96 214 H56Z" fill="#5cb85c" ${st()}/>`
    +[62,78,122,138].map(x=>`<path d="M${x-6} 214 L${x} 222 L${x+6} 214Z" fill="#ffb347" stroke="#2b2235" stroke-width="1.5"/>`).join('')
    +`<circle cx="76" cy="194" r="4" fill="#8fdc9f"/><circle cx="124" cy="198" r="5" fill="#8fdc9f"/>`},
  {id:'racePants',name:'Racing Pants',price:20,p2:'ride',under:true,d:()=>`<path d="M60 180 H140 L142 240 H104 L100 206 L96 240 H58Z" fill="#ff5a5f" ${st()}/>`
    +`<path d="M64 184 L62 238 M136 184 L138 238" stroke="#fff" stroke-width="6"/><rect x="60" y="180" width="80" height="8" fill="url(#p2CheckS)"/>`}
);
CLOSET.legs.items.push(
  {id:'dinoSocks',name:'Dino Scale Socks',price:15,p2:'dino',d:()=>lw('#8fdc9f','#5cb85c')+`<g fill="#ffb347"><circle cx="76" cy="214" r="3.5"/><circle cx="88" cy="228" r="3"/><circle cx="112" cy="216" r="3"/><circle cx="125" cy="229" r="3.5"/></g>`},
  {id:'spaceSocks',name:'Space Socks',price:15,p2:'space',d:()=>lw('#2b2350')+`<path d="${starPath(76,214,4)} ${starPath(90,230,3)} ${starPath(112,218,3)} ${starPath(124,232,4)}" fill="#ffd166"/><circle cx="86" cy="212" r="2" fill="#fff"/><circle cx="120" cy="210" r="2" fill="#fff"/>`}
);
CLOSET.arms.items.push(
  {id:'robotArms',name:'Robot Arm Warmers',price:15,p2:'hero',d:()=>aw('#c9d1de')+[LA,RA].map((t,k)=>`<g transform="${t}"><rect x="${k?134:38}" y="170" width="28" height="5" fill="#8a96ab"/><circle cx="${k?148:52}" cy="181" r="3" fill="#4fd1c5"/></g>`).join('')}
);
CLOSET.shoes.items.push(
  {id:'rocketBoots',name:'Rocket Boots',price:20,p2:'space',d:()=>p2Boot(64)+p2Boot(99)},
  {id:'dinoFeet',name:'Dino Feet',price:15,p2:'dino',d:()=>p2Foot(82)+p2Foot(118)}
);
CLOSET.acc.items.push(
  {id:'spaceHelmet',name:'Space Helmet',price:25,p2:'space',d:()=>`<circle cx="100" cy="92" r="70" fill="#bfe6ff" fill-opacity=".22" stroke="#e8f4ff" stroke-width="6"/>`
    +`<path d="M52 62 Q66 34 96 28" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/><ellipse cx="100" cy="146" rx="36" ry="6" fill="#c9d1de" ${st()}/><circle cx="148" cy="54" r="5" fill="#ff6b6b" ${st('#2b2235',2)}/>`},
  {id:'hardHat',name:'Builder Hat',price:15,p2:'ride',d:()=>`<path d="M56 62 Q58 22 100 20 Q142 22 144 62Z" fill="#ffd23f" ${st()}/><rect x="46" y="58" width="108" height="11" rx="5" fill="#ffd23f" ${st()}/>`
    +`<path d="M100 22 V58 M80 26 Q76 40 76 58 M120 26 Q124 40 124 58" stroke="#e0a800" stroke-width="3" fill="none"/>`},
  {id:'sharkHat',name:'Shark Hat',price:20,p2:'hero',d:()=>`<path d="M98 34 L114 2 Q118 14 120 36Z" fill="#7f9fbf" ${st()}/><path d="M42 86 Q42 30 100 30 Q158 30 158 86 Q100 70 42 86Z" fill="#7f9fbf" ${st()}/>`
    +`<path d="M46 82 ${[0,1,2,3,4,5,6,7,8,9].map(k=>`L${50+k*10.4} ${k%2?78:88}`).join(' ')} L154 82 Q100 70 46 82Z" fill="#fff" stroke="#4f6f90" stroke-width="1.5"/>`
    +p2Eyes(60,140,56,4)+`<path d="M130 46 q4 4 0 8 M136 44 q4 4 0 8" stroke="#4f6f90" stroke-width="2" fill="none"/>`},
  {id:'antennae',name:'Robot Antennae',price:10,p2:'hero',d:()=>`<path d="M48 72 Q100 26 152 72" stroke="#8a96ab" stroke-width="7" fill="none" stroke-linecap="round"/>`
    +`<path d="M80 48 L68 14 M120 48 L132 14" stroke="#8a96ab" stroke-width="4" stroke-linecap="round"/><circle cx="68" cy="12" r="8" fill="#ff6b6b" ${st('#2b2235',2)}/><circle cx="132" cy="12" r="8" fill="#4fd1c5" ${st('#2b2235',2)}/>`},
  {id:'heroMask',name:'Hero Mask',price:15,p2:'hero',d:()=>`<path fill-rule="evenodd" d="M56 92 Q100 78 144 92 Q148 106 138 113 Q118 118 100 108 Q82 118 62 113 Q52 106 56 92Z M68 100 a12 13 0 1 0 24 0 a12 13 0 1 0 -24 0Z M108 100 a12 13 0 1 0 24 0 a12 13 0 1 0 -24 0Z" fill="#ff5a7a" ${st('#2b2235',2.5)}/>`
    +`<path d="M56 96 L42 90 L44 104Z M144 96 L158 90 L156 104Z" fill="#ff5a7a" ${st('#2b2235',2)}/>`}
);
CARD_TAGS.cute.push('top:dinoHoodie','bottom:dinoShorts','legs:dinoSocks','shoes:dinoFeet','acc:sharkHat','acc:antennae');
CARD_TAGS.spooky.push('acc:sharkHat','acc:heroMask','legs:spaceSocks');
CARD_TAGS.sporty.push('top:heroSuit','top:rocketTee','bottom:racePants','shoes:rocketBoots','acc:hardHat','acc:spaceHelmet');

/* ---------- room: walls, floors, decorations ---------- */
EXTRA_DEFS.push(
  `<pattern id="p2CheckS" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#fff"/><rect width="4" height="4" fill="#2b2235"/><rect x="4" y="4" width="4" height="4" fill="#2b2235"/></pattern>`,
  `<pattern id="p2Leaves" width="160" height="140" patternUnits="userSpaceOnUse"><g fill="#7cc98a" opacity=".75"><path d="M30 60 Q20 20 60 10 Q66 50 30 60Z"/><path d="M110 130 Q96 92 136 84 Q142 120 110 130Z"/><path d="M120 40 Q140 20 156 34 Q140 54 120 40Z"/></g><g stroke="#5aa86a" stroke-width="2" fill="none" opacity=".7"><path d="M30 60 Q42 36 60 10"/><path d="M110 130 Q120 106 136 84"/></g></pattern>`,
  `<pattern id="p2Space" width="200" height="180" patternUnits="userSpaceOnUse"><circle cx="40" cy="44" r="16" fill="#ff9f6b" opacity=".85"/><ellipse cx="40" cy="44" rx="28" ry="6" fill="none" stroke="#ffd166" stroke-width="3" opacity=".85"/><circle cx="150" cy="130" r="10" fill="#8ff0d0" opacity=".8"/>`
    +`<path d="${starPath(120,40,6)} ${starPath(70,140,5)} ${starPath(180,70,4)}" fill="#ffd166"/><g fill="#fff"><circle cx="20" cy="120" r="2"/><circle cx="100" cy="90" r="1.6"/><circle cx="170" cy="20" r="2"/><circle cx="110" cy="166" r="1.5"/></g></pattern>`,
  `<pattern id="p2Waves" width="120" height="70" patternUnits="userSpaceOnUse"><path d="M0 30 Q15 18 30 30 T60 30 T90 30 T120 30" stroke="#fff" stroke-width="5" fill="none" opacity=".55"/><circle cx="20" cy="56" r="4" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/><circle cx="84" cy="54" r="6" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/></pattern>`,
  `<pattern id="p2Bolts" width="120" height="120" patternUnits="userSpaceOnUse"><rect x="4" y="4" width="112" height="112" rx="8" fill="none" stroke="#a9b3c4" stroke-width="3"/><g fill="#a9b3c4"><circle cx="16" cy="16" r="4"/><circle cx="104" cy="16" r="4"/><circle cx="16" cy="104" r="4"/><circle cx="104" cy="104" r="4"/></g></pattern>`,
  `<pattern id="p2Road" width="140" height="60" patternUnits="userSpaceOnUse"><rect x="20" y="27" width="60" height="7" rx="3" fill="#ffd166"/></pattern>`,
  `<pattern id="p2Craters" width="150" height="110" patternUnits="userSpaceOnUse"><g fill="#c2bdd4" stroke="#aaa4c0" stroke-width="2"><ellipse cx="34" cy="30" rx="20" ry="9"/><ellipse cx="110" cy="80" rx="26" ry="11"/><ellipse cx="120" cy="18" rx="9" ry="4"/></g></pattern>`,
  `<pattern id="p2Sand" width="90" height="70" patternUnits="userSpaceOnUse"><g fill="#d9bd85"><circle cx="12" cy="14" r="3"/><circle cx="50" cy="40" r="2.5"/><circle cx="76" cy="12" r="2"/><circle cx="30" cy="58" r="2"/></g><path d="M60 58 l6 -4 l2 6z" fill="#fff" opacity=".6"/></pattern>`
);
Object.assign(WALLS,{
  jungle:{name:'Jungle Leaves',price:20,fill:'#c9ecc6',pat:'p2Leaves',p2:'dino'},
  outerSpace:{name:'Outer Space',price:25,fill:'#24215a',pat:'p2Space',p2:'space'},
  ocean:{name:'Ocean Waves',price:20,fill:'#8fd0ee',pat:'p2Waves',p2:'hero'},
  robotPanels:{name:'Robot Panels',price:20,fill:'#d5dbe6',pat:'p2Bolts',p2:'hero'}
});
Object.assign(FLOORS,{
  road:{name:'Road',price:20,fill:'#5d6470',pat:'p2Road',p2:'ride'},
  moon:{name:'Moon Craters',price:20,fill:'#dcd8ea',pat:'p2Craters',p2:'space'},
  dinoDig:{name:'Dino Dig Sand',price:15,fill:'#f0d9a8',pat:'p2Sand',p2:'dino'}
});
Object.assign(DECOR,{
  dinoPlush:{name:'Dino Plush',price:20,p2:'dino',box:'-100 -180 200 190',d:()=>`<ellipse cx="0" cy="-3" rx="70" ry="9" fill="#00000030"/>`
    +`<path d="M-40 -30 Q-96 -16 -92 -64 Q-74 -40 -36 -54Z" fill="#8fdc9f" ${p2Line}/><ellipse cx="0" cy="-52" rx="52" ry="48" fill="#8fdc9f" ${p2Line}/><ellipse cx="0" cy="-44" rx="30" ry="32" fill="#e7f8d9"/>`
    +`<ellipse cx="-28" cy="-8" rx="18" ry="10" fill="#8fdc9f" ${p2Line}/><ellipse cx="28" cy="-8" rx="18" ry="10" fill="#8fdc9f" ${p2Line}/>`
    +p2Spike(-22,-152,10)+p2Spike(0,-160,11)+p2Spike(22,-152,10)+`<ellipse cx="0" cy="-122" rx="44" ry="36" fill="#8fdc9f" ${p2Line}/>`
    +p2Eyes(-16,16,-126,6)+p2Smile(0,-108,9)+p2Blush(-30,30,-110)},
  dinoNest:{name:'Dino Egg Nest',price:15,p2:'dino',box:'-100 -130 200 140',d:()=>`<ellipse cx="0" cy="-3" rx="80" ry="9" fill="#00000030"/>`
    +`<ellipse cx="-34" cy="-58" rx="22" ry="30" fill="#fffbe8" ${p2Line}/><circle cx="-40" cy="-66" r="5" fill="#8fdc9f"/><circle cx="-26" cy="-48" r="4" fill="#8fdc9f"/>`
    +`<circle cx="30" cy="-86" r="24" fill="#8fdc9f" ${p2Line}/>`+p2Eyes(22,40,-90,4)+p2Smile(31,-80,6)
    +`<path d="M4 -66 L12 -76 L20 -64 L30 -78 L40 -64 L48 -76 L56 -66 Q58 -30 30 -30 Q2 -30 4 -66Z" fill="#fffbe8" ${p2Line}/><circle cx="20" cy="-46" r="4" fill="#8fdc9f"/>`
    +`<path d="M-76 -40 Q-80 -6 0 -6 Q80 -6 76 -40 Q40 -26 0 -26 Q-40 -26 -76 -40Z" fill="#b07a4f" ${p2Line}/><path d="M-60 -24 L-30 -12 M-20 -26 L10 -10 M24 -24 L54 -14 M-48 -12 L-20 -22" stroke="#8a5e35" stroke-width="3"/>`},
  volcano:{name:'Volcano Lamp',price:20,p2:'dino',box:'-90 -190 180 200',d:()=>`<ellipse cx="0" cy="-3" rx="74" ry="9" fill="#00000030"/>`
    +`<circle cx="-14" cy="-160" r="12" fill="#efe9f6"/><circle cx="2" cy="-170" r="15" fill="#efe9f6"/><circle cx="18" cy="-158" r="11" fill="#efe9f6"/>`
    +`<path d="M-72 0 L-26 -128 H26 L72 0Z" fill="#a8775a" ${p2Line}/><path d="M-26 -128 H26 L32 -110 Q22 -96 16 -108 Q8 -84 0 -106 Q-10 -90 -16 -108 Q-24 -96 -32 -110Z" fill="#ff8c5a" stroke="#2b2235" stroke-width="3" stroke-linejoin="round"/>`
    +`<ellipse cx="0" cy="-128" rx="26" ry="6" fill="#ffd166"/>`+p2Eyes(-14,14,-56,5)+p2Smile(0,-42,8)},
  toyRocket:{name:'Toy Rocket',price:30,p2:'space',box:'-90 -310 180 320',d:()=>`<ellipse cx="0" cy="-3" rx="70" ry="9" fill="#00000030"/>`
    +`<path d="M-40 -120 L-76 -36 V-8 L-40 -36Z M40 -120 L76 -36 V-8 L40 -36Z" fill="#ff6b6b" ${p2Line}/><rect x="-24" y="-30" width="48" height="24" rx="6" fill="#8a96ab" ${p2Line}/>`
    +`<path d="M0 -296 C44 -252 48 -180 40 -30 H-40 C-48 -180 -44 -252 0 -296Z" fill="#fbf7ff" ${p2Line}/><path d="M0 -296 C24 -272 34 -246 38 -222 H-38 C-34 -246 -24 -272 0 -296Z" fill="#ff6b6b" ${p2Line}/>`
    +`<circle cx="0" cy="-170" r="22" fill="#7fc8ff" stroke="#8a96ab" stroke-width="7"/><path d="M-10 -178 Q-4 -186 6 -184" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-6 -120 V-40" stroke="#ff6b6b" stroke-width="10"/>`},
  planetMobile:{name:'Planet Mobile',price:20,p2:'space',wall:1,box:'-150 -240 300 240',d:()=>`<path d="M-120 -220 H120" stroke="#8a5e35" stroke-width="6" stroke-linecap="round"/><path d="M-90 -220 V-140 M0 -220 V-114 M90 -220 V-152 M48 -220 V-188" stroke="#3b2f52" stroke-width="2"/>`
    +`<ellipse cx="-90" cy="-112" rx="46" ry="10" fill="none" stroke="#ffd166" stroke-width="5"/><circle cx="-90" cy="-112" r="26" fill="#ff9f6b" ${p2Line}/><path d="M-136 -112 Q-90 -96 -44 -112" stroke="#ffd166" stroke-width="5" fill="none"/>`
    +`<circle cx="0" cy="-80" r="34" fill="#7fc8ff" ${p2Line}/><path d="M-22 -96 Q-6 -100 -4 -86 Q-14 -76 -26 -80Z M8 -70 Q22 -76 26 -62 Q14 -52 6 -60Z" fill="#5cd67a"/>`
    +`<circle cx="90" cy="-130" r="22" fill="#c9a7ff" ${p2Line}/><circle cx="84" cy="-136" r="5" fill="#a97cff"/><path d="${starPath(48,-176,13)}" fill="#ffd166" stroke="#2b2235" stroke-width="3"/>`},
  telescope:{name:'Telescope',price:25,p2:'space',box:'-110 -250 220 260',d:()=>`<ellipse cx="0" cy="-3" rx="70" ry="9" fill="#00000030"/>`
    +`<path d="M0 -120 L-60 0 M0 -120 L60 0 M0 -120 V-4" stroke="#8a5e35" stroke-width="8" stroke-linecap="round"/>`
    +`<g transform="rotate(-28 0 -132)"><rect x="-80" y="-150" width="160" height="36" rx="12" fill="#a97cff" ${p2Line}/><rect x="70" y="-158" width="26" height="52" rx="8" fill="#ffd166" ${p2Line}/>`
    +`<rect x="-96" y="-142" width="20" height="20" rx="6" fill="#ffd166" ${p2Line}/><path d="M-20 -150 V-114 M20 -150 V-114" stroke="#ffd166" stroke-width="5"/></g><circle cx="0" cy="-124" r="9" fill="#3b2f52"/>`
    +`<path d="${starPath(70,-226,10)} ${starPath(100,-200,6)}" fill="#ffd166"/>`},
  trainRug:{name:'Train Track Rug',price:25,p2:'ride',flat:1,box:'-200 -100 400 110',d:()=>`<ellipse cx="0" cy="-48" rx="190" ry="48" fill="#a8e3b5" stroke="#5cb85c" stroke-width="5"/>`
    +`<ellipse cx="0" cy="-48" rx="150" ry="30" fill="none" stroke="#b07a4f" stroke-width="16" stroke-dasharray="5 9"/><ellipse cx="0" cy="-48" rx="156" ry="34" fill="none" stroke="#8a96ab" stroke-width="3"/><ellipse cx="0" cy="-48" rx="144" ry="26" fill="none" stroke="#8a96ab" stroke-width="3"/>`
    +`<rect x="-30" y="-40" width="34" height="20" rx="4" fill="#7fc8ff" stroke="#2b2235" stroke-width="2.5"/><rect x="8" y="-46" width="44" height="26" rx="5" fill="#ff6b6b" stroke="#2b2235" stroke-width="2.5"/><rect x="38" y="-56" width="9" height="12" fill="#3b2f52"/>`
    +[-22,-4,16,40].map(x=>p2Wheel(x,-18,5)).join('')},
  dumpTruck:{name:'Dump Truck',price:20,p2:'ride',box:'-120 -140 240 150',d:()=>`<ellipse cx="0" cy="-3" rx="100" ry="9" fill="#00000030"/>`
    +`<path d="M-100 -118 L8 -100 L0 -40 H-92Z" fill="#ff9f43" ${p2Line}/><path d="M-80 -96 L-12 -86 M-84 -70 L-10 -64" stroke="#e07b1a" stroke-width="4"/>`
    +`<rect x="-100" y="-44" width="196" height="18" rx="6" fill="#8a96ab" ${p2Line}/><path d="M14 -40 V-108 Q14 -116 22 -116 H66 Q80 -116 86 -96 L96 -64 V-40Z" fill="#ffd23f" ${p2Line}/>`
    +`<path d="M28 -104 H64 Q72 -104 76 -92 L82 -74 H28Z" fill="#bfe6ff" stroke="#2b2235" stroke-width="3"/>`+p2Eyes(46,64,-90,4)+p2Smile(55,-82,6)
    +`<circle cx="92" cy="-52" r="6" fill="#fff3b0" stroke="#2b2235" stroke-width="2"/>`+[-66,-30,60].map(x=>p2Wheel(x,-22,20)).join('')},
  trafficLight:{name:'Traffic Light Lamp',price:15,p2:'ride',box:'-50 -250 100 260',d:()=>`<ellipse cx="0" cy="-3" rx="40" ry="8" fill="#00000030"/><rect x="-30" y="-14" width="60" height="12" rx="5" fill="#3b2f52"/>`
    +`<rect x="-6" y="-110" width="12" height="100" fill="#8a96ab" stroke="#2b2235" stroke-width="3"/><rect x="-34" y="-240" width="68" height="136" rx="16" fill="#2f3440" ${p2Line}/>`
    +[['#ff5a5f',-216],['#ffd166',-172],['#5cd67a',-128]].map(([c,y])=>`<circle cx="0" cy="${y}" r="20" fill="${c}" opacity=".35"/><circle cx="0" cy="${y}" r="15" fill="${c}"/><circle cx="-5" cy="${y-5}" r="4" fill="#fff" opacity=".7"/>`).join('')},
  robotPal:{name:'Robot Pal',price:25,p2:'hero',box:'-90 -250 180 260',d:()=>`<ellipse cx="0" cy="-3" rx="64" ry="9" fill="#00000030"/>`
    +`<path d="M0 -200 V-230" stroke="#8a96ab" stroke-width="5"/><path d="${heartPath(0,-236,9)}" fill="#ff8cc6" stroke="#2b2235" stroke-width="2.5"/>`
    +`<path d="M-50 -110 Q-78 -90 -70 -66 M50 -110 Q78 -90 70 -66" stroke="#8a96ab" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="-70" cy="-62" r="10" fill="#4fd1c5" ${p2Line}/><circle cx="70" cy="-62" r="10" fill="#4fd1c5" ${p2Line}/>`
    +[-28,28].map(x=>p2Wheel(x,-20,18)).join('')+`<rect x="-50" y="-124" width="100" height="92" rx="16" fill="#c9d1de" ${p2Line}/>`
    +`<circle cx="-18" cy="-80" r="12" fill="#ffd166" stroke="#2b2235" stroke-width="3"/><path d="M-18 -80 L-12 -88" stroke="#2b2235" stroke-width="3"/><rect x="6" y="-92" width="28" height="8" rx="4" fill="#ff6b6b"/><rect x="6" y="-76" width="28" height="8" rx="4" fill="#4fd1c5"/>`
    +`<rect x="-56" y="-206" width="112" height="78" rx="20" fill="#dde3ee" ${p2Line}/><rect x="-42" y="-194" width="84" height="54" rx="12" fill="#26305e"/>`
    +`<g fill="#4fd1c5"><ellipse cx="-18" cy="-172" rx="8" ry="10"/><ellipse cx="18" cy="-172" rx="8" ry="10"/></g><path d="M-12 -154 Q0 -144 12 -154" stroke="#4fd1c5" stroke-width="4" fill="none" stroke-linecap="round"/>`},
  sharkBean:{name:'Shark Beanbag',price:30,p2:'hero',box:'-140 -170 280 180',d:()=>`<ellipse cx="0" cy="-3" rx="116" ry="10" fill="#00000030"/>`
    +`<path d="M-10 -116 L14 -164 Q24 -140 30 -110Z" fill="#7f9fbf" ${p2Line}/><path d="M96 -66 L132 -104 Q130 -66 132 -26Z" fill="#7f9fbf" ${p2Line}/>`
    +`<path d="M-116 -50 Q-112 -120 -10 -122 Q96 -122 106 -60 Q110 -6 -10 -6 Q-120 -6 -116 -50Z" fill="#9db8d4" ${p2Line}/><path d="M-108 -40 Q-60 -54 -6 -50 Q60 -48 100 -44 Q100 -10 -10 -10 Q-104 -10 -108 -40Z" fill="#fbf7ff"/>`
    +p2Eyes(-82,-48,-78,6)+`<path d="M-80 -56 Q-66 -44 -50 -56" stroke="#2a1f33" stroke-width="3" fill="none" stroke-linecap="round"/>`+p2Blush(-94,-38,-62)
    +`<path d="M20 -88 q6 8 0 16 M32 -90 q6 8 0 16 M44 -90 q6 8 0 16" stroke="#5f7fa0" stroke-width="3" fill="none"/>`},
  heroBadge:{name:'Hero Badge',price:15,p2:'hero',wall:1,box:'-90 -200 180 200',d:()=>`<path d="M-30 -130 Q-80 -150 -84 -110 Q-60 -120 -36 -108Z M30 -130 Q80 -150 84 -110 Q60 -120 36 -108Z" fill="#fff" ${p2Line}/>`
    +`<path d="M0 -186 L52 -164 Q54 -96 0 -60 Q-54 -96 -52 -164Z" fill="#8ff0d0" stroke="#ffd166" stroke-width="7" stroke-linejoin="round"/><path d="M0 -186 L52 -164 Q54 -96 0 -60 Q-54 -96 -52 -164Z" fill="none" ${p2Line}/>`
    +`<path d="${starPath(0,-122,26)}" fill="#ffd166" stroke="#2b2235" stroke-width="3"/>`}
});

/* ---------- fidgets ---------- */
Object.assign(POP_THEMES,{
  dino:{name:'Dino',price:15,p2:'dino',board:'#3f8f55',cols:['#ffb347','#c6f0a0','#ffe066','#8fdc9f','#ffb347','#c6f0a0']},
  space:{name:'Space',price:15,p2:'space',board:'#24215a',cols:['#ffd166','#ff9f6b','#ff8cc6','#a97cff','#7fb8ff','#8ff0d0']},
  traffic:{name:'Traffic Lights',price:10,p2:'ride',board:'#2f3440',cols:['#ff5a5f','#ff5a5f','#ffd166','#ffd166','#5cd67a','#5cd67a']}
});
Object.assign(POP_SHAPES,{
  rocket:{name:'🚀 Rocket Board',price:15,p2:'space',path:'M50 -4 C76 10 86 32 86 54 V70 L102 90 V104 L74 94 H26 L-2 104 V90 L14 70 V54 C14 32 24 10 50 -4Z'},
  dino:{name:'🦕 Dino Board',price:15,p2:'dino',path:'M2 66 C4 44 22 32 44 32 C56 32 62 24 64 14 C66 2 80 -4 92 2 C104 8 104 24 92 30 C84 34 80 36 80 44 C92 52 96 64 94 78 V102 H72 V88 H40 V102 H18 V86 C8 84 0 90 -6 98 C-8 84 -4 72 2 66Z'}
});
SQUISHIES.dino={name:'Dino Squish',price:20,p2:'dino',fill:'#a6e8a6',shade:'#6fc47a',line:'#3f8f55',hi:'#efffe8',extra:'spikes'};
SQUISHIES.shark={name:'Sharky',price:20,p2:'hero',fill:'#b3cbe3',shade:'#7f9fc0',line:'#4f6f90',hi:'#f2f8ff',extra:'fin'};
SQUISHIES.planet={name:'Little Planet',price:15,p2:'space',fill:'#ffb07a',shade:'#e8845a',line:'#b85e3a',hi:'#fff0e2',extra:'ring'};
// A squishy's spikes / fins / ring follow its outline (at(angle) = the outline point), so they squash with it.
const p2Out=(at,cx,cy,a,len)=>{const p=at(a),dx=p.x-cx,dy=p.y-cy,l=Math.hypot(dx,dy)||1;return {x:p.x,y:p.y,ux:dx/l,uy:dy/l,len};};
Object.assign(SQ_EXTRAS,{
  spikes:{back(ctx,at,cx,cy,R){ctx.fillStyle='#ffb347';ctx.strokeStyle='#b8741e';ctx.lineWidth=3;ctx.lineJoin='round';
    for(let k=0;k<5;k++){const a=-Math.PI*0.82+k*Math.PI*0.16, o=p2Out(at,cx,cy,a), h=R*(k===2?.3:.24), w=R*.12;
      ctx.beginPath();ctx.moveTo(o.x-o.uy*w-o.ux*R*.06,o.y+o.ux*w-o.uy*R*.06);ctx.lineTo(o.x+o.ux*h,o.y+o.uy*h);ctx.lineTo(o.x+o.uy*w-o.ux*R*.06,o.y-o.ux*w-o.uy*R*.06);ctx.closePath();ctx.fill();ctx.stroke();}},
    front(ctx,at,cx,cy,R){ctx.fillStyle='rgba(63,143,85,.35)';for(const [u,v,r] of [[-.55,-.35,.08],[.5,-.45,.06],[.62,.3,.07],[-.6,.35,.05]]){ctx.beginPath();ctx.arc(cx+u*R,cy+v*R*.8,R*r,0,TAU);ctx.fill();}}},
  fin:{back(ctx,at,cx,cy,R,T){ctx.fillStyle=T.fill;ctx.strokeStyle=T.line;ctx.lineWidth=3;ctx.lineJoin='round';
    const t=at(-Math.PI/2-0.1); ctx.beginPath();ctx.moveTo(t.x-R*.2,t.y+R*.1);ctx.quadraticCurveTo(t.x+R*.05,t.y-R*.25,t.x+R*.28,t.y-R*.42);ctx.quadraticCurveTo(t.x+R*.22,t.y-R*.1,t.x+R*.24,t.y+R*.12);ctx.closePath();ctx.fill();ctx.stroke();
    const s=at(0); ctx.beginPath();ctx.moveTo(s.x-R*.1,s.y);ctx.lineTo(s.x+R*.3,s.y-R*.32);ctx.quadraticCurveTo(s.x+R*.2,s.y,s.x+R*.3,s.y+R*.3);ctx.closePath();ctx.fill();ctx.stroke();},
    front(ctx,at,cx,cy,R,T){ctx.strokeStyle=T.line;ctx.lineWidth=Math.max(2,R*.025);ctx.lineCap='round';
      for(let k=0;k<3;k++){const x=cx-R*(.86-k*.08);ctx.beginPath();ctx.arc(x,cy+R*.1,R*.08,-1.1,1.1);ctx.stroke();}}},
  ring:{back(ctx,at,cx,cy,R){p2Ring(ctx,cx,cy,R,Math.PI,TAU);},front(ctx,at,cx,cy,R){p2Ring(ctx,cx,cy,R,0,Math.PI);}}
});
function p2Ring(ctx,cx,cy,R,a0,a1){ctx.lineCap='butt';ctx.strokeStyle='#b8860b';ctx.lineWidth=R*.16;ctx.beginPath();ctx.ellipse(cx,cy+R*.42,R*1.35,R*.26,-0.12,a0,a1);ctx.stroke();
  ctx.strokeStyle='#ffd166';ctx.lineWidth=R*.1;ctx.beginPath();ctx.ellipse(cx,cy+R*.42,R*1.35,R*.26,-0.12,a0,a1);ctx.stroke();}
Object.assign(SPINS,{
  rocket:{name:'Rocket',price:15,p2:'space',body:'#2b3a7a',edge:'#ff6b6b',cap:'#ffd166',deco:'rocket'},
  gear:{name:'Robo Gear',price:15,p2:'hero',body:'#9aa6b8',edge:'#4fd1c5',cap:'#26305e',deco:'nut'},
  dino:{name:'Dino Spinner',price:15,p2:'dino',body:'#5cb85c',edge:'#ffb347',cap:'#fff3b0',deco:'footprint'}
});
// Small one-colour pictures (the current fill colour) for spinner and slime decorations.
Object.assign(FID_ICONS,{
  // v1.36: a rounder nose, slanted fins, a porthole and a flame under a narrow nozzle (the old flat bottom looked odd).
  rocket(ctx,x,y,s){
    ctx.save();ctx.fillStyle='#ff9f43';ctx.beginPath();ctx.moveTo(x-s*.34,y+s*.62);ctx.quadraticCurveTo(x-s*.36,y+s*1.1,x-s*.12,y+s*1.25);ctx.quadraticCurveTo(x-s*.06,y+s*1.45,x,y+s*1.7);
    ctx.quadraticCurveTo(x+s*.06,y+s*1.45,x+s*.12,y+s*1.25);ctx.quadraticCurveTo(x+s*.36,y+s*1.1,x+s*.34,y+s*.62);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ffe066';ctx.beginPath();ctx.moveTo(x-s*.18,y+s*.62);ctx.quadraticCurveTo(x-s*.16,y+s*1.05,x,y+s*1.3);ctx.quadraticCurveTo(x+s*.16,y+s*1.05,x+s*.18,y+s*.62);ctx.closePath();ctx.fill();ctx.restore();
    ctx.beginPath();ctx.moveTo(x,y-s*1.45);ctx.bezierCurveTo(x+s*.62,y-s*1.0,x+s*.6,y-s*.1,x+s*.38,y+s*.7);ctx.lineTo(x-s*.38,y+s*.7);ctx.bezierCurveTo(x-s*.6,y-s*.1,x-s*.62,y-s*1.0,x,y-s*1.45);
    ctx.moveTo(x+s*.2,y-s*.42);ctx.arc(x,y-s*.42,s*.2,0,TAU,true);ctx.fill('evenodd');
    for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(x+k*s*.46,y-s*.05);ctx.quadraticCurveTo(x+k*s*.95,y+s*.35,x+k*s*.9,y+s*.95);ctx.lineTo(x+k*s*.42,y+s*.62);ctx.closePath();ctx.fill();}},
  nut(ctx,x,y,s){ctx.beginPath();for(let k=0;k<6;k++){const a=k*TAU/6;ctx.lineTo(x+Math.cos(a)*s,y+Math.sin(a)*s);}ctx.closePath();ctx.moveTo(x+s*.42,y);ctx.arc(x,y,s*.42,0,TAU,true);ctx.fill('evenodd');},
  footprint(ctx,x,y,s){ctx.beginPath();ctx.ellipse(x,y+s*.35,s*.5,s*.6,0,0,TAU);ctx.fill();for(const a of [-0.6,0,0.6]){ctx.beginPath();ctx.ellipse(x+Math.sin(a)*s*.95,y-Math.cos(a)*s*.75,s*.2,s*.4,a,0,TAU);ctx.fill();}}
});
Object.assign(SLIMES,{
  dino:{name:'Dino Slime',price:15,p2:'dino',a:'#c6f0a0',b:'#5cb85c',hi:'#f4ffe8',line:'#2f7a3a',deco:'footprint',dc:['#ffb347','#2f7a3a']},
  rocket:{name:'Rocket Goo',price:15,p2:'space',a:'#3a4aa8',b:'#141a4a',hi:'#9fb4ff',line:'#0c0f2a',deco:'rocket',dc:['#ffd166','#ff8cc6','#ffffff'],dark:true}
});
Object.assign(CUBES,{
  robot:{name:'Robot',price:15,p2:'hero',face:'#c9d1de',edge:'#7a869c',part:'#4fd1c5',part2:'#ff6b6b',ink:'#26303f'},
  dino:{name:'Dino',price:10,p2:'dino',face:'#8fdc9f',edge:'#3f8f55',part:'#ffb347',part2:'#fff3b0',ink:'#1f3a25'}
});
Object.assign(MARBLES,{
  earth:{name:'Little Earth',price:10,p2:'space',a:'#7fc8ff',b:'#2f6fc0',sw:'#5cd67a'},
  wheel:{name:'Tyre',price:10,p2:'ride',a:'#5d6470',b:'#2b2235',sw:'#ffd166'}
});

/* ---------- stickers (Room & Style page): 3 things from a theme ---------- */
// Owned keys (closet, walls, floors, fidget designs) plus decorations in either room or My Stuff.
function p2Have(p,theme){
  const keys=new Set();
  for(const [cat,c] of Object.entries(CLOSET)) for(const it of c.items) if(it.p2===theme) keys.add(cat+':'+it.id);
  for(const [pre,list] of [['wall',WALLS],['floor',FLOORS],['pop',POP_THEMES],['popshape',POP_SHAPES],['squish',SQUISHIES],['spin',SPINS],['slime',SLIMES],['cube',CUBES],['marble',MARBLES]])
    for(const [id,v] of Object.entries(list)) if(v.p2===theme) keys.add(pre+':'+id);
  const owned=p.owned.filter(k=>keys.has(k)).length;
  const decor=new Set(allItems(p).filter(i=>DECOR[i.type]&&DECOR[i.type].p2===theme).map(i=>i.type)).size;
  return owned+decor;
}
STICKERS.push(
  stk('p2dino','room','🦕','Dino Fan','circle','Get 3 dinosaur things (clothes, room or fidgets)',3,p=>p2Have(p,'dino')),
  stk('p2space','room','🚀','Space Cadet','star','Get 3 space things (clothes, room or fidgets)',3,p=>p2Have(p,'space')),
  stk('p2ride','room','🚂','Road Trip','scallop','Get 3 truck, train or car things',3,p=>p2Have(p,'ride')),
  stk('p2hero','room','🤖','Hero Squad','heart','Get 3 robot, shark or hero things',3,p=>p2Have(p,'hero'))
);
