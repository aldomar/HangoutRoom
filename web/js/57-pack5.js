'use strict';
/* =========================================================
   57. CONTENT PACK 5 (v1.58): Finish the Outfits
   Packs 2 and 4 started several dress-up outfits with only one or two pieces (Racing Pants, the Fire Rescue Jacket,
   the Builder Hat, the Karate Gi, the Farm Overalls, the robot, hero, shark and astronaut looks). This pack adds the
   missing pieces, plus pieces for theme tabs that were empty (Stage leg warmers, Cozy and Cafe bottoms, Emo shoes).
   A pack only ADDS entries to the lists from earlier sections. All ids below are saved: never rename them.
   Clothes are drawn in the mascot's 200 x 270 box. Every entry has p5:<a THEMES key> (themesOf() in section 33 reads it).
   P5_SETS lists the finished outfits for the three stickers. Everything is for everyone: no "boy" or "girl".
   ========================================================= */
const P5_SETS={
  racer:  {icon:'🏎️',name:'Race Driver',keys:['top:racingJacket','bottom:racePants','arms:racingGloves','acc:racingHelmet']},
  fire:   {icon:'🚒',name:'Firefighter',keys:['top:fireTop','bottom:firePants','shoes:fireBoots','acc:fireHelmet']},
  builder:{icon:'🚧',name:'Builder',keys:['top:safetyVest','shoes:workBoots','acc:hardHat']},
  karate: {icon:'🥋',name:'Karate',keys:['top:karateGi','bottom:giPants','acc:sportBand']},
  farmer: {icon:'🐮',name:'Farmer',keys:['top:overalls','bottom:overallPants','shoes:rainBoots','acc:strawHat']},
  robot:  {icon:'🤖',name:'Robot',keys:['top:robotTop','bottom:robotPants','arms:robotArms','shoes:robotBoots','acc:antennae']},
  hero:   {icon:'⭐',name:'Star Hero',keys:['top:heroSuit','legs:heroTights','shoes:heroBoots','acc:heroMask']},
  shark:  {icon:'🦈',name:'Shark',keys:['top:sharkHoodie','shoes:sharkSlippers','acc:sharkHat']},
  astro:  {icon:'🚀',name:'Astronaut',keys:['top:astroSuit','bottom:astroPants','shoes:rocketBoots','acc:spaceHelmet']},
  dino:   {icon:'🦕',name:'Dino',keys:['top:dinoHoodie','bottom:dinoShorts','legs:dinoSocks','arms:dinoMitts','shoes:dinoFeet','acc:dinoHood']}
};
// The long-pants outline (the same as Baggy Jeans and Racing Pants), drawn under the leg warmers and shoes.
const P5_PANTS='M60 180 H140 L142 240 H104 L100 206 L96 240 H58Z';
const p5Pants=fill=>`<path d="${P5_PANTS}" fill="${fill}" ${st()}/>`;
// One thing drawn on each arm, in the arm's own (unturned) box: x is 38 for the left arm and 134 for the right.
const p5Arms=fn=>[[LA,38],[RA,134]].map(([t,x])=>`<g transform="${t}">${fn(x)}</g>`).join('');

/* ---------- patterns ---------- */
EXTRA_DEFS.push(
  `<pattern id="p5Moons" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#5a5fb0"/><path d="M8 3 A5 5 0 1 0 13 10 A4 4 0 1 1 8 3Z" fill="#ffe9a8"/><circle cx="16" cy="15" r="1.4" fill="#fff"/><circle cx="4" cy="17" r="1" fill="#fff"/><circle cx="18" cy="5" r="1" fill="#fff"/></pattern>`
);

/* ---------- shoes ---------- */
const p5FireBoot=x=>`<rect x="${x}" y="220" width="37" height="28" rx="8" fill="#2b2235" ${st('#111')}/><rect x="${x-3}" y="244" width="43" height="11" rx="4" fill="#111"/>`
  +`<rect x="${x}" y="231" width="37" height="6" fill="#ffd166"/><rect x="${x-2}" y="217" width="41" height="7" rx="3" fill="#3d3547" ${st('#111',2)}/>`;
const p5WorkBoot=x=>`<path d="M${x} 226 Q${x} 222 ${x+4} 222 H${x+26} V234 Q${x+40} 234 ${x+40} 248 H${x}Z" fill="#c98a4b" ${st('#5a3a1e')}/><rect x="${x-2}" y="246" width="44" height="9" rx="4" fill="#5a3a1e"/>`
  +`<path d="M${x+8} 228 H${x+20} M${x+8} 234 H${x+20} M${x+8} 240 H${x+20}" stroke="#ffe0a8" stroke-width="2.5"/><circle cx="${x+34}" cy="242" r="3" fill="#a06a35"/>`;
const p5RoboBoot=x=>`<rect x="${x}" y="222" width="37" height="26" rx="5" fill="#c9d1de" ${st()}/><rect x="${x-3}" y="244" width="43" height="11" rx="3" fill="#7a869c" ${st('#2b2235',2)}/>`
  +`<path d="M${x+5} 230 H${x+32}" stroke="#8a96ab" stroke-width="3"/><circle cx="${x+18}" cy="238" r="3.5" fill="#ff6b6b"/>`;
const p5HeroBoot=x=>`<path d="M${x} 210 L${x+18} 218 L${x+36} 210 V234 Q${x+42} 238 ${x+42} 250 H${x}Z" fill="#ff5a7a" ${st()}/>`
  +`<path d="M${x} 210 L${x+18} 218 L${x+36} 210" stroke="#ffd166" stroke-width="4" fill="none" stroke-linejoin="round"/><path d="M${x+1} 247 H${x+41}" stroke="#c23a52" stroke-width="4"/>`;
const p5SharkSlip=x=>`<path d="M${x-5} 237 L${x+1} 225 L${x+6} 237Z" fill="#7f9fbf" ${st('#4f6f90',2)}/><ellipse cx="${x}" cy="244" rx="20" ry="11" fill="#7f9fbf" ${st('#4f6f90',2.5)}/>`
  +`<path d="M${x-15} 246${[0,1,2,3,4,5].map(k=>` L${x-12.5+k*5} 251 L${x-10+k*5} 246`).join('')}Z" fill="#fff" stroke="#4f6f90" stroke-width="1.2" stroke-linejoin="round"/>`
  +`<circle cx="${x+9}" cy="239" r="2.4" fill="#2a1f33"/><circle cx="${x+9.8}" cy="238.2" r=".8" fill="#fff"/>`;

/* ---------- closet ---------- */
CLOSET.top.items.push(
  {id:'racingJacket',name:'Racing Jacket',price:20,p5:'ride',
    t:()=>`<path d="${TORSO}" fill="#ff5a5f" ${st()}/><path d="M66 148 V188 M134 148 V188" stroke="#fff" stroke-width="7"/><path d="M90 127 L100 136 L110 127Z" fill="#2b2235"/>`
      +`<path d="M100 136 V180" stroke="#2b2235" stroke-width="2.5"/><rect x="60" y="180" width="80" height="8" fill="url(#p2CheckS)"/>`
      +`<circle cx="118" cy="154" r="9" fill="#fff" ${st('#2b2235',2)}/><path d="${starPath(118,154,5.5)}" fill="#ffd166"/>`,
    s:()=>sleeves('#ff5a5f',58)+p5Arms(x=>`<rect x="${x+2}" y="166" width="24" height="8" fill="url(#p2CheckS)"/>`)},
  {id:'safetyVest',name:'Builder Vest',price:15,p5:'ride',
    t:()=>`<path d="${TORSO}" fill="#9aa6b8" ${st()}/><path d="M86 127 Q100 138 114 127" fill="none" stroke="#6b7689" stroke-width="3"/>`
      +`<path d="M60 160 Q60 126 86 126 L94 150 V188 H60Z M140 160 Q140 126 114 126 L106 150 V188 H140Z" fill="#ff9f1c" ${st('#2b2235',2)}/>`
      +`<g fill="#f4f8ff"><rect x="61" y="164" width="32" height="6"/><rect x="107" y="164" width="32" height="6"/><rect x="61" y="176" width="32" height="6"/><rect x="107" y="176" width="32" height="6"/></g>`
      +`<rect x="112" y="144" width="12" height="9" rx="2" fill="#ffd23f" ${st('#2b2235',1.5)}/>`,
    s:()=>sleeves('#9aa6b8',26)},
  {id:'sharkHoodie',name:'Shark Hoodie',price:20,p5:'hero',
    t:()=>`<path d="${TORSO}" fill="#7f9fbf" ${st()}/><path d="M78 188 Q78 148 100 148 Q122 148 122 188Z" fill="#fff"/>`
      +`<path d="M88 127${[0,1,2,3,4,5].map(k=>` L${90+k*4} 134 L${92+k*4} 127`).join('')}Z" fill="#fff" stroke="#4f6f90" stroke-width="1.2" stroke-linejoin="round"/>`
      +`<path d="M68 152 q4 4 0 8 M74 150 q4 4 0 8 M132 152 q-4 4 0 8 M126 150 q-4 4 0 8" stroke="#4f6f90" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    // a side fin on each sleeve, drawn first so the sleeve covers its base
    s:()=>`<g fill="#7f9fbf" ${st()}><path d="M42 146 Q22 160 28 178 L42 168Z" transform="${LA}"/><path d="M158 146 Q178 160 172 178 L158 168Z" transform="${RA}"/></g>`+sleeves('#7f9fbf',58)},
  {id:'astroSuit',name:'Astronaut Suit',price:25,p5:'space',
    t:()=>`<path d="${TORSO}" fill="#f4f6fb" ${st()}/><path d="M84 127 Q100 140 116 127" fill="none" stroke="#c9d1de" stroke-width="5"/>`
      +`<rect x="84" y="148" width="32" height="22" rx="4" fill="#3a4a66" ${st('#2b2235',2)}/><circle cx="92" cy="155" r="3" fill="#ff6b6b"/><circle cx="100" cy="155" r="3" fill="#ffd166"/><circle cx="108" cy="155" r="3" fill="#4fd1c5"/><rect x="89" y="162" width="22" height="4" rx="2" fill="#7fc8ff"/>`
      +`<circle cx="72" cy="148" r="7" fill="#26305e" ${st('#2b2235',1.5)}/><path d="${starPath(72,148,4)}" fill="#ffd166"/><path d="M60 180 H140" stroke="#7fc8ff" stroke-width="5"/><path d="M128 162 V176" stroke="#c9d1de" stroke-width="3"/>`,
    s:()=>sleeves('#f4f6fb',58)+p5Arms(x=>`<path d="M${x+3} 170 H${x+25}" stroke="#7fc8ff" stroke-width="4"/>`)}
);
CLOSET.bottom.items.push(
  {id:'firePants',name:'Fire Rescue Pants',price:20,p5:'ride',under:true,d:()=>p5Pants('#e8483f')
    +`<path d="M59.2 206 H99.9 L99.2 212 H59 Z M100.1 206 H140.8 L141 212 H100.8Z" fill="#ffd166"/><path d="M100 184 V204" stroke="#c23a32" stroke-width="2"/>`},
  {id:'giPants',name:'Karate Pants',price:15,p5:'sport',under:true,d:()=>`<path d="M60 180 H140 L144 242 H104 L100 206 L96 242 H56Z" fill="#fbf7ff" ${st()}/>`
    +`<path d="M78 196 L74 238 M122 196 L126 238" stroke="#e4ddef" stroke-width="2.5"/>`},
  {id:'overallPants',name:'Overall Pants',price:15,p5:'farm',under:true,d:()=>`<path d="M60 180 H140 L142 236 H104 L100 206 L96 236 H58Z" fill="#5b8dd6" ${st()}/>`
    +`<path d="M58.6 228 H97 M103 228 H141.4" stroke="#4a78c0" stroke-width="7"/><path d="M66 186 Q72 196 84 194 M134 186 Q128 196 116 194" stroke="#ffd166" stroke-width="2" stroke-dasharray="3 2" fill="none"/>`
    +`<path d="M100 182 V204" stroke="#4a78c0" stroke-width="2"/>`},
  {id:'robotPants',name:'Robot Legs',price:20,p5:'hero',under:true,d:()=>p5Pants('#c9d1de')
    +`<rect x="60" y="180" width="80" height="8" fill="#8a96ab"/><g fill="#8a96ab" ${st('#2b2235',2)}><rect x="64" y="208" width="28" height="10" rx="4"/><rect x="108" y="208" width="28" height="10" rx="4"/></g>`
    +`<circle cx="78" cy="228" r="3" fill="#4fd1c5"/><circle cx="122" cy="228" r="3" fill="#ff6b6b"/><path d="M100 188 V204" stroke="#7a869c" stroke-width="2"/>`},
  {id:'astroPants',name:'Astronaut Pants',price:20,p5:'space',under:true,d:()=>p5Pants('#f4f6fb')
    +`<path d="M63 186 L61 236 M137 186 L139 236" stroke="#7fc8ff" stroke-width="4"/><g fill="#c9d1de" ${st('#2b2235',1.5)}><rect x="68" y="210" width="24" height="10" rx="4"/><rect x="108" y="210" width="24" height="10" rx="4"/></g>`
    +`<rect x="112" y="190" width="14" height="10" rx="2" fill="#dfe4ee" stroke="#9aa6b8" stroke-width="1.5"/>`},
  {id:'pjPants',name:'Cozy PJ Pants',price:15,p5:'cozy',under:true,d:()=>p5Pants('url(#p5Moons)')
    +`<path d="M58.3 234 H97 M103 234 H141.7" stroke="#c9b3ff" stroke-width="8"/><path d="M94 184 Q92 192 88 194 M106 184 Q108 192 112 194" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`},
  {id:'berrySkirt',name:'Strawberry Skirt',price:15,p5:'cafe',d:()=>`<path d="M60 180 H140 L152 214 Q100 224 48 214 Z" fill="#ff6b81" ${st()}/>`
    +[[70,197],[86,205],[102,196],[118,206],[132,197],[62,208],[78,213],[94,214],[110,215],[126,213],[142,208]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="1.8" ry="2.6" fill="#ffe9a8"/>`).join('')
    +`<path d="M60 180 H140 V185${' q-5 7 -10 0'.repeat(8)}Z" fill="#5cb85c" ${st('#2b2235',2)}/>`}
);
CLOSET.legs.items.push(
  {id:'heroTights',name:'Hero Tights',price:15,p5:'hero',d:()=>`<g fill="#4a7bff" ${st()}><rect x="69" y="188" width="27" height="52" rx="12"/><rect x="104" y="188" width="27" height="52" rx="12"/></g>`
    +`<path d="M82.5 193 V235 M117.5 193 V235" stroke="#ff5a7a" stroke-width="4"/><path d="${starPath(82.5,201,5)} ${starPath(117.5,201,5)}" fill="#ffd166" ${st('#b8860b',1.2)}/>`},
  {id:'starLegs',name:'Star Sparkle Warmers',price:15,p5:'stage',d:()=>lw('#b07cff','#8a5ae0')
    +`<path d="${starPath(78,214,4.5)} ${starPath(90,229,3.5)} ${starPath(111,216,3.5)} ${starPath(124,230,4.5)}" fill="#ffd166" ${st('#b8860b',1)}/><circle cx="88" cy="213" r="1.6" fill="#fff"/><circle cx="121" cy="212" r="1.6" fill="#fff"/><circle cx="76" cy="230" r="1.3" fill="#fff"/>`},
  {id:'sprinkleSocks',name:'Sprinkle Socks',price:15,p5:'cafe',d:()=>lw('#fff0f6','#ffc9de')
    +[[74,212,'#ff6b81',30],[87,220,'#7fc8ff',-20],[78,230,'#ffd166',60],[92,209,'#8fdc9f',-50],[110,213,'#c9a7ff',40],[124,221,'#ff6b81',-30],[114,231,'#8fdc9f',20],[128,209,'#ffd166',70]]
      .map(([x,y,c,a])=>`<rect x="-3.5" y="-1.5" width="7" height="3" rx="1.5" fill="${c}" transform="translate(${x} ${y}) rotate(${a})"/>`).join('')}
);
CLOSET.arms.items.push(
  {id:'racingGloves',name:'Racing Gloves',price:15,p5:'ride',d:()=>p5Arms(x=>`<rect x="${x}" y="166" width="28" height="26" rx="11" fill="#2b2235" ${st('#111',2.5)}/>`
    +`<rect x="${x}" y="176" width="28" height="6" fill="#ff5a5f"/><path d="M${x+8} 187 H${x+20}" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`)},
  {id:'dinoMitts',name:'Dino Claw Mitts',price:15,p5:'dino',d:()=>p5Arms(x=>`<rect x="${x}" y="164" width="28" height="28" rx="12" fill="#8fdc9f" ${st()}/>`
    +[6,14,22].map(o=>`<path d="M${x+o-3} 191 L${x+o} 198 L${x+o+3} 191Z" fill="#fff" ${st('#3f8f55',1.5)}/>`).join('')
    +`<circle cx="${x+9}" cy="174" r="2.5" fill="#5cb85c"/><circle cx="${x+19}" cy="180" r="3" fill="#5cb85c"/>`)},
  {id:'knitArms',name:'Knit Arm Warmers',price:15,p5:'cozy',d:()=>aw('#f2d9b8')
    +p5Arms(x=>`<g stroke="#cfa97a" stroke-width="2" opacity=".6">${[7,14,21].map(o=>`<line x1="${x+o}" y1="163" x2="${x+o}" y2="183"/>`).join('')}</g>`)}
);
CLOSET.shoes.items.push(
  {id:'fireBoots',name:'Fire Boots',price:15,p5:'ride',d:()=>p5FireBoot(64)+p5FireBoot(99)},
  {id:'workBoots',name:'Work Boots',price:15,p5:'ride',d:()=>p5WorkBoot(62)+p5WorkBoot(98)},
  {id:'robotBoots',name:'Robot Boots',price:15,p5:'hero',d:()=>p5RoboBoot(64)+p5RoboBoot(99)},
  {id:'heroBoots',name:'Hero Boots',price:15,p5:'hero',d:()=>p5HeroBoot(62)+p5HeroBoot(97)},
  {id:'sharkSlippers',name:'Shark Slippers',price:15,p5:'hero',d:()=>p5SharkSlip(82)+p5SharkSlip(118)},
  {id:'checkKicks',name:'Checker Sneakers',price:15,p5:'emo',d:()=>kick(62,'url(#p2CheckS)','#ff8cc6')+kick(98,'url(#p2CheckS)','#ff8cc6')}
);
CLOSET.acc.items.push(
  {id:'racingHelmet',name:'Racing Helmet',price:20,p5:'ride',d:()=>`<path d="M42 84 Q42 22 100 22 Q158 22 158 84 L150 100 Q146 80 100 72 Q54 80 50 100Z" fill="#ff5a5f" ${st()}/>`
    +`<path d="M88 28 Q86 50 88 70 M112 28 Q114 50 112 70" stroke="#fff" stroke-width="6" fill="none"/>`
    +`<path d="M54 60 Q100 42 146 60 L148 70 Q100 52 52 70Z" fill="#7fc8ff" fill-opacity=".75" ${st('#2b2235',2)}/><path d="${starPath(134,40,6)}" fill="#ffd166" ${st('#b8860b',1.5)}/>`},
  {id:'dinoHood',name:'Dino Hood',price:15,p5:'dino',d:()=>p2Spike(74,40,9)+p2Spike(100,34,11)+p2Spike(126,40,9)
    +`<path fill-rule="evenodd" d="M36 120 Q30 30 100 28 Q170 30 164 120 Q160 136 146 140 H54 Q40 136 36 120Z M52 100 a48 38 0 1 0 96 0 a48 38 0 1 0 -96 0Z" fill="#8fdc9f" ${st()}/>`
    +`<circle cx="48" cy="80" r="4" fill="#5cb85c"/><circle cx="152" cy="84" r="5" fill="#5cb85c"/><circle cx="44" cy="112" r="3" fill="#5cb85c"/>`}
);
CARD_TAGS.cute.push('bottom:overallPants','top:sharkHoodie','shoes:sharkSlippers','acc:dinoHood','arms:dinoMitts','legs:starLegs','bottom:pjPants','arms:knitArms','bottom:berrySkirt','legs:sprinkleSocks');
CARD_TAGS.spooky.push('shoes:checkKicks','legs:starLegs','bottom:pjPants','top:sharkHoodie');
CARD_TAGS.sporty.push('top:racingJacket','acc:racingHelmet','arms:racingGloves','bottom:firePants','shoes:fireBoots','top:safetyVest','shoes:workBoots','bottom:giPants',
  'bottom:robotPants','shoes:robotBoots','legs:heroTights','shoes:heroBoots','top:astroSuit','bottom:astroPants');

/* ---------- stickers ---------- */
// How many pieces of a set she owns (0 … the set's size).
function p5SetHave(p,id){return P5_SETS[id].keys.filter(k=>p.owned.includes(k)).length;}
// How many sets she owns every piece of.
function p5SetsDone(p){return Object.keys(P5_SETS).filter(id=>p5SetHave(p,id)===P5_SETS[id].keys.length).length;}
STICKERS.push(
  stk('p5racer','room','🏎️','Pit Crew','star','Get the whole race driver outfit',P5_SETS.racer.keys.length,p=>p5SetHave(p,'racer')),
  stk('p5fire','room','🚒','Rescue Ready','scallop','Get the whole firefighter outfit',P5_SETS.fire.keys.length,p=>p5SetHave(p,'fire')),
  stk('p5sets','room','🧩','Full Outfit','heart','Get every piece of 3 outfits (racer, firefighter, builder, karate, farmer, robot, hero, shark, astronaut or dino)',3,p5SetsDone)
);
