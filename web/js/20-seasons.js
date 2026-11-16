'use strict';
/* =========================================================
   20. SEASONS (v1.17): seasonal decorations, walls and windows
   The season comes from the device's date. Everything seasonal can be bought ALL YEAR (no "only this month"
   pressure); the current season is simply listed first in the 🍂 Seasons tab of Decorate, marked "In season!".
   The room window and the Loft's round window show the season (leaves, snow, blossoms, sun): plain drawings, no loop.
   Decoration and wall ids below are saved: never rename them. Season ids are not saved anywhere.
   ========================================================= */
const SEASONS={
  autumn:{name:'Autumn',icon:'🍂',months:[8,9,10]},
  winter:{name:'Winter',icon:'❄️',months:[11,0,1]},
  spring:{name:'Spring',icon:'🌸',months:[2,3,4]},
  summer:{name:'Summer',icon:'☀️',months:[5,6,7]}
};
let seasonTest=null; // the smoke test sets this to try each season
function seasonNow(d){
  if(SEASONS[seasonTest]) return seasonTest;
  const m=(d||new Date()).getMonth();
  return Object.keys(SEASONS).find(k=>SEASONS[k].months.includes(m));
}
// The seasons in shop order: this season first, then the ones after it.
function seasonOrder(){const ks=Object.keys(SEASONS), i=ks.indexOf(seasonNow());return ks.slice(i).concat(ks.slice(0,i));}

/* ---------- little drawing helpers (prefix ssn) ---------- */
const ssnLine='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"';
const ssnLeaf=(x,y,r,c,s)=>`<path transform="translate(${x} ${y}) rotate(${r}) scale(${s||1})" d="M0 -9 Q8 -2 0 9 Q-8 -2 0 -9Z M0 9 V13" fill="${c}" stroke="#7a3d1a" stroke-width="1.5"/>`;
const ssnFlake=(x,y,r,c)=>{const arm=a=>{const dx=(Math.cos(a)*r).toFixed(1), dy=(Math.sin(a)*r).toFixed(1);return `M${x-dx} ${y-dy} L${+x+ +dx} ${+y+ +dy}`;};
  const d=[0,TAU/6,TAU/3].map(arm).join(' ');
  return `<path d="${d}" stroke="#2b2235" stroke-width="${(r/3.2+2.5).toFixed(1)}" stroke-linecap="round"/><path d="${d}" stroke="${c||'#fff'}" stroke-width="${(r/3.2).toFixed(1)}" stroke-linecap="round"/>`;};
const ssnGhost=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M-12 12 V-3 Q-12 -17 0 -17 Q12 -17 12 -3 V12 Q8 8 4 12 Q0 8 -4 12 Q-8 8 -12 12Z" fill="#fbf7ff" stroke="#5b4a6b" stroke-width="2.5"/>`
  +`<circle cx="-4" cy="-5" r="2" fill="#2a1f33"/><circle cx="4" cy="-5" r="2" fill="#2a1f33"/><ellipse cx="0" cy="2" rx="2" ry="2.5" fill="#2a1f33"/><circle cx="-8" cy="0" r="2" fill="#ff8fb8" opacity=".6"/><circle cx="8" cy="0" r="2" fill="#ff8fb8" opacity=".6"/></g>`;
const ssnFly=(x,y,c,r)=>`<g transform="translate(${x} ${y}) rotate(${r||0})"><g fill="${c}" stroke="#2b2235" stroke-width="2"><ellipse cx="-9" cy="-6" rx="9" ry="7" transform="rotate(-25 -9 -6)"/><ellipse cx="9" cy="-6" rx="9" ry="7" transform="rotate(25 9 -6)"/>`
  +`<ellipse cx="-7" cy="7" rx="6" ry="5" transform="rotate(20 -7 7)"/><ellipse cx="7" cy="7" rx="6" ry="5" transform="rotate(-20 7 7)"/></g>`
  +`<rect x="-2" y="-11" width="4" height="22" rx="2" fill="#3b2f52"/><path d="M-1 -11 q-4 -6 -7 -6 M1 -11 q4 -6 7 -6" stroke="#3b2f52" stroke-width="1.5" fill="none"/></g>`;
const ssnTulip=(x,y,c)=>`<path transform="translate(${x} ${y})" d="M-11 0 Q-13 -20 -7 -23 L0 -14 L7 -23 Q13 -20 11 0 Q0 7 -11 0Z" fill="${c}" stroke="#2b2235" stroke-width="2.5" stroke-linejoin="round"/>`;
const ssnBlossom=(x,y,c,r)=>[0,1,2,3,4].map(k=>{const a=k*TAU/5;return `<circle cx="${(x+Math.cos(a)*r).toFixed(1)}" cy="${(y+Math.sin(a)*r).toFixed(1)}" r="${(r*0.85).toFixed(1)}" fill="${c}"/>`;}).join('')+`<circle cx="${x}" cy="${y}" r="${(r*0.6).toFixed(1)}" fill="#ffd166"/>`;
// A garland string like the Bat Garland's; things hang from the five points on it.
const SSN_HANG=[[-120,-80],[-60,-70],[0,-96],[60,-70],[120,-80]];
const ssnString=`<path d="M-160 -120 Q-80 -60 0 -110 Q80 -60 160 -120" fill="none" stroke="#3b2f52" stroke-width="3"/>`;

/* ---------- walls (one per season) ---------- */
EXTRA_DEFS.push(
  `<pattern id="pLeaves" width="150" height="150" patternUnits="userSpaceOnUse"><g opacity=".55">${ssnLeaf(30,30,20,'#ff9a3c')}${ssnLeaf(105,60,-30,'#e85d4a')}${ssnLeaf(60,115,60,'#ffc23d')}${ssnLeaf(130,130,-10,'#ff9a3c',.8)}</g></pattern>`,
  `<pattern id="pSnow" width="120" height="120" patternUnits="userSpaceOnUse"><g fill="#fff" opacity=".85"><circle cx="20" cy="18" r="4"/><circle cx="80" cy="40" r="3"/><circle cx="50" cy="78" r="5"/><circle cx="104" cy="96" r="3.5"/><circle cx="14" cy="104" r="2.5"/></g></pattern>`,
  `<pattern id="pBlossom" width="130" height="130" patternUnits="userSpaceOnUse"><g opacity=".8">${ssnBlossom(30,30,'#fff',5)}${ssnBlossom(95,70,'#ff9fd0',6)}${ssnBlossom(45,108,'#fff',4)}</g></pattern>`,
  `<pattern id="pWaves" width="120" height="50" patternUnits="userSpaceOnUse"><path d="M0 25 Q30 8 60 25 T120 25" fill="none" stroke="#fff" stroke-width="6" opacity=".7"/><path d="M0 44 Q30 30 60 44 T120 44" fill="none" stroke="#7fd0ff" stroke-width="3" opacity=".5"/></pattern>`,
  // the window glass shapes, so seasonal bits stay inside the windows
  `<clipPath id="cpWin1"><rect x="94" y="74" width="202" height="157"/></clipPath><clipPath id="cpWin2"><circle cx="340" cy="140" r="68"/></clipPath>`
);
Object.assign(WALLS,{
  autumnLeaves:{name:'Falling Leaves',price:20,fill:'#ffdcb8',pat:'pLeaves',season:'autumn'},
  winterSnow:{name:'Snowfall',price:20,fill:'#c9dcff',pat:'pSnow',season:'winter'},
  springBloom:{name:'Blossoms',price:20,fill:'#ffdcec',pat:'pBlossom',season:'spring'},
  summerWaves:{name:'Sunny Waves',price:20,fill:'#fff0a8',pat:'pWaves',season:'summer'}
});

/* ---------- decorations (4 per season) ---------- */
Object.assign(DECOR,{
  // Autumn
  pumpkin:{name:'Smiley Pumpkin',price:15,season:'autumn',box:'-80 -130 160 140',d:()=>`<ellipse cx="0" cy="-3" rx="62" ry="8" fill="#00000030"/>`
    +`<ellipse cx="-30" cy="-46" rx="30" ry="43" fill="#f58a2e" ${ssnLine}/><ellipse cx="30" cy="-46" rx="30" ry="43" fill="#f58a2e" ${ssnLine}/><ellipse cx="0" cy="-48" rx="32" ry="46" fill="#ffa64d" ${ssnLine}/>`
    +`<path d="M-4 -92 Q-2 -110 10 -116" stroke="#5c8a3a" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M8 -100 Q30 -120 42 -98 Q22 -90 8 -100Z" fill="#6cc56f" stroke="#2b6a4a" stroke-width="3"/>`
    +`<ellipse cx="-13" cy="-56" rx="5" ry="7" fill="#2a1f33"/><ellipse cx="13" cy="-56" rx="5" ry="7" fill="#2a1f33"/><circle cx="-11" cy="-59" r="1.8" fill="#fff"/><circle cx="15" cy="-59" r="1.8" fill="#fff"/>`
    +`<ellipse cx="-24" cy="-42" rx="7" ry="4" fill="#ff6f91" opacity=".55"/><ellipse cx="24" cy="-42" rx="7" ry="4" fill="#ff6f91" opacity=".55"/><path d="M-9 -40 Q0 -31 9 -40" stroke="#2a1f33" stroke-width="3" fill="none" stroke-linecap="round"/>`},
  ghostGarland:{name:'Ghost Garland',price:20,wall:1,season:'autumn',box:'-170 -140 340 100',d:()=>ssnString
    +SSN_HANG.map(([x,y],k)=>k%2?ssnLeaf(x,y-4,k*40,['#ff9a3c','#e85d4a'][k%3?0:1],1.3):`<line x1="${x}" y1="${y-14}" x2="${x}" y2="${y-4}" stroke="#3b2f52" stroke-width="2"/>`+ssnGhost(x,y+12)).join('')},
  leafPile:{name:'Leaf Pile',price:10,season:'autumn',box:'-95 -80 190 90',d:()=>`<ellipse cx="0" cy="-3" rx="84" ry="8" fill="#00000030"/>`
    +`<path d="M-82 0 Q-74 -46 -26 -56 Q12 -72 48 -50 Q82 -38 82 0Z" fill="#e8833a" ${ssnLine}/>`
    +[[-60,-18,10,'#ffc23d'],[-38,-40,-30,'#e85d4a'],[-12,-52,40,'#ff9a3c'],[18,-58,-20,'#ffc23d'],[44,-40,70,'#e85d4a'],[64,-16,-50,'#ff9a3c'],[-30,-16,80,'#ff9a3c'],[0,-26,-60,'#e85d4a'],[30,-18,20,'#ffc23d'],[-90,-4,60,'#e85d4a'],[88,-6,-30,'#ffc23d']]
      .map(([x,y,r,c])=>ssnLeaf(x,y,r,c,1.6)).join('')},
  owlPlush:{name:'Owl Plush',price:20,season:'autumn',box:'-60 -135 120 145',d:()=>`<ellipse cx="0" cy="-3" rx="42" ry="7" fill="#00000030"/>`
    +`<path d="M-30 -92 L-38 -122 L-14 -100 M30 -92 L38 -122 L14 -100" fill="#7b55c7" ${ssnLine}/>`
    +`<path d="M-42 -50 Q-44 -112 0 -112 Q44 -112 42 -50 Q40 -2 0 -2 Q-40 -2 -42 -50Z" fill="#8f69d8" ${ssnLine}/>`
    +`<path d="M-24 -44 Q-24 -12 0 -10 Q24 -12 24 -44 Q0 -56 -24 -44Z" fill="#e9ddff"/><path d="M-14 -36 q4 4 8 0 M6 -36 q4 4 8 0 M-6 -24 q4 4 8 0" stroke="#b49ae6" stroke-width="2.5" fill="none"/>`
    +`<circle cx="-15" cy="-74" r="14" fill="#fff" stroke="#2b2235" stroke-width="3"/><circle cx="15" cy="-74" r="14" fill="#fff" stroke="#2b2235" stroke-width="3"/><circle cx="-13" cy="-73" r="7" fill="#2a1f33"/><circle cx="17" cy="-73" r="7" fill="#2a1f33"/>`
    +`<circle cx="-11" cy="-76" r="2.3" fill="#fff"/><circle cx="19" cy="-76" r="2.3" fill="#fff"/><path d="M-5 -60 L5 -60 L0 -52Z" fill="#ffb347" stroke="#2b2235" stroke-width="2"/>`
    +`<path d="M-16 -2 v4 M-10 -2 v4 M10 -2 v4 M16 -2 v4" stroke="#ffb347" stroke-width="3" stroke-linecap="round"/>`+ssnLeaf(26,-108,30,'#ff9a3c',1.2)},
  // Winter
  snowBunny:{name:'Snow Bunny',price:20,season:'winter',box:'-70 -190 140 200',d:()=>`<ellipse cx="0" cy="-3" rx="48" ry="8" fill="#00000030"/>`
    +`<ellipse cx="-13" cy="-146" rx="9" ry="27" fill="#fff" stroke="#8aa4d6" stroke-width="3" transform="rotate(-10 -13 -125)"/><ellipse cx="13" cy="-146" rx="9" ry="27" fill="#fff" stroke="#8aa4d6" stroke-width="3" transform="rotate(10 13 -125)"/>`
    +`<ellipse cx="-13" cy="-146" rx="4" ry="18" fill="#ffc1dc" transform="rotate(-10 -13 -125)"/><ellipse cx="13" cy="-146" rx="4" ry="18" fill="#ffc1dc" transform="rotate(10 13 -125)"/>`
    +`<circle cx="0" cy="-42" r="40" fill="#fff" stroke="#8aa4d6" stroke-width="4"/><circle cx="0" cy="-102" r="29" fill="#fff" stroke="#8aa4d6" stroke-width="4"/>`
    +`<circle cx="-10" cy="-106" r="3.5" fill="#2a1f33"/><circle cx="10" cy="-106" r="3.5" fill="#2a1f33"/><ellipse cx="0" cy="-97" rx="4" ry="3" fill="#ff8fb8"/><path d="M-5 -91 q5 4 10 0" stroke="#2a1f33" stroke-width="2" fill="none"/>`
    +`<ellipse cx="-19" cy="-95" rx="5" ry="3" fill="#ff8fb8" opacity=".55"/><ellipse cx="19" cy="-95" rx="5" ry="3" fill="#ff8fb8" opacity=".55"/>`
    +`<path d="M-28 -80 Q0 -68 28 -80 L28 -70 Q0 -58 -28 -70Z" fill="#ff8cc6" stroke="#2b2235" stroke-width="2.5"/><path d="M14 -70 L22 -40 L10 -42 Z" fill="#ff8cc6" stroke="#2b2235" stroke-width="2.5"/>`
    +`<circle cx="0" cy="-48" r="4" fill="#a97cff"/><circle cx="0" cy="-30" r="4" fill="#a97cff"/>`},
  snowGarland:{name:'Snowflake Garland',price:15,wall:1,season:'winter',box:'-170 -140 340 100',d:()=>ssnString
    +SSN_HANG.map(([x,y],k)=>`<line x1="${x}" y1="${y-14}" x2="${x}" y2="${y-4}" stroke="#3b2f52" stroke-width="2"/>`+ssnFlake(x,y+16,k%2?15:20,k%2?'#bfe3ff':'#fff')).join('')},
  giftStack:{name:'Gift Stack',price:15,season:'winter',box:'-80 -160 160 170',d:()=>{const box=(x,y,w,h,c,r)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${c}" ${ssnLine}/><rect x="${x+w/2-5}" y="${y}" width="10" height="${h}" fill="${r}"/><rect x="${x}" y="${y+h/2-5}" width="${w}" height="10" fill="${r}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="none" ${ssnLine}/>`;
    return `<ellipse cx="0" cy="-3" rx="64" ry="8" fill="#00000030"/>`+box(-58,-62,116,62,'#ff8cc6','#a97cff')+box(-40,-110,80,48,'#8ff0d0','#ff8cc6')+box(-24,-142,48,32,'#ffd166','#a97cff')
      +`<path d="M0 -142 C-22 -164 -26 -140 0 -142 C26 -140 22 -164 0 -142Z" fill="#a97cff" stroke="#2b2235" stroke-width="2.5"/>`;}},
  pineTree:{name:'Little Pine',price:30,season:'winter',box:'-90 -240 180 250',d:()=>`<ellipse cx="0" cy="-3" rx="44" ry="8" fill="#00000030"/>`
    +`<rect x="-9" y="-58" width="18" height="24" fill="#8a5e35"/><path d="M-28 -40 H28 L22 0 H-22Z" fill="#a97cff" ${ssnLine}/>`
    +`<path d="M0 -206 L-46 -140 H46Z M0 -170 L-62 -96 H62Z M0 -130 L-78 -50 H78Z" fill="#3fa36b" ${ssnLine}/>`
    +`<path d="M-50 -66 Q0 -46 52 -72 M-36 -112 Q0 -96 40 -118" stroke="#ff8cc6" stroke-width="4" fill="none" stroke-linecap="round"/>`
    +[[-30,-60,'#ffd166'],[24,-70,'#8ff0d0'],[0,-90,'#ff8cc6'],[-16,-120,'#7fc8ff'],[20,-136,'#ffd166'],[-6,-160,'#ff8cc6'],[52,-58,'#a97cff'],[-56,-56,'#ff8cc6']]
      .map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="6" fill="${c}" stroke="#2b2235" stroke-width="2"/>`).join('')
    +`<path d="${starPath(0,-214,16)}" fill="#ffd166" stroke="#2b2235" stroke-width="3" stroke-linejoin="round"/>`},
  // Spring
  tulipPot:{name:'Tulip Pot',price:10,season:'spring',box:'-60 -150 120 160',d:()=>`<ellipse cx="0" cy="-3" rx="34" ry="7" fill="#00000030"/>`
    +`<path d="M-20 -46 Q-24 -90 -26 -110 M0 -46 V-128 M20 -46 Q24 -86 28 -104" stroke="#4f9e5e" stroke-width="4" fill="none"/>`
    +`<path d="M-4 -60 Q-26 -74 -30 -96 Q-10 -84 -4 -60Z M4 -62 Q26 -72 34 -92 Q12 -84 4 -62Z" fill="#6cc56f" stroke="#2b6a4a" stroke-width="2.5"/>`
    +ssnTulip(-26,-108,'#ff8cc6')+ssnTulip(0,-126,'#ffd166')+ssnTulip(28,-102,'#c9a7ff')
    +`<path d="M-30 -50 H30 L22 0 H-22Z" fill="#8ff0d0" ${ssnLine}/><rect x="-34" y="-58" width="68" height="12" rx="5" fill="#6fd6b6" ${ssnLine}/><path d="${heartPath(0,-26,8)}" fill="#ff8cc6"/>`},
  rainbowArch:{name:'Rainbow',price:20,wall:1,season:'spring',box:'-150 -170 300 160',d:()=>['#ff8a9a','#ffb36b','#ffe066','#8ff0d0','#7fc8ff','#b197fc']
      .map((c,i)=>{const r=104-i*12;return `<path d="M${-r} -30 A${r} ${r} 0 0 1 ${r} -30" fill="none" stroke="${c}" stroke-width="13"/>`;}).join('')
    +[-92,92].map(x=>`<g fill="#fff" stroke="#9db0d6" stroke-width="3"><circle cx="${x-18}" cy="-26" r="16"/><circle cx="${x+18}" cy="-26" r="16"/><circle cx="${x}" cy="-38" r="20"/></g><rect x="${x-30}" y="-30" width="60" height="16" fill="#fff"/>`).join('')},
  eggBasket:{name:'Egg Basket',price:15,season:'spring',box:'-80 -140 160 150',d:()=>{const egg=(x,y,r,c,dots)=>`<ellipse cx="${x}" cy="${y}" rx="17" ry="22" fill="${c}" stroke="#2b2235" stroke-width="2.5" transform="rotate(${r} ${x} ${y})"/>`
      +(dots?`<circle cx="${x-5}" cy="${y-6}" r="3" fill="#fff"/><circle cx="${x+6}" cy="${y-2}" r="3" fill="#fff"/><circle cx="${x-2}" cy="${y+7}" r="3" fill="#fff"/>`:`<path d="M${x-14} ${y} l5 -5 5 5 5 -5 5 5 5 -5" stroke="#fff" stroke-width="2.5" fill="none" transform="rotate(${r} ${x} ${y})"/>`);
    return `<ellipse cx="0" cy="-3" rx="60" ry="8" fill="#00000030"/><path d="M-54 -62 Q0 -150 54 -62" fill="none" stroke="#b07a4f" stroke-width="8"/>`
      +egg(-30,-68,-15,'#ff9fd0',1)+egg(0,-76,0,'#8ff0d0',0)+egg(28,-68,15,'#ffd166',1)+egg(-12,-62,-5,'#c9a7ff',0)+egg(14,-62,8,'#7fc8ff',0)
      +`<path d="M-60 -58 H60 L48 0 H-48Z" fill="#d9a46c" ${ssnLine}/><path d="M-56 -40 H56 M-52 -22 H52" stroke="#b07a4f" stroke-width="4"/>`
      +[-36,-12,12,36].map(x=>`<path d="M${x} -58 V0" stroke="#b07a4f" stroke-width="3"/>`).join('')+`<path d="M-60 -58 H60 L48 0 H-48Z" fill="none" ${ssnLine}/><path d="${heartPath(0,-30,9)}" fill="#ff8cc6" stroke="#2b2235" stroke-width="2"/>`;}},
  butterflies:{name:'Butterfly Garland',price:20,wall:1,season:'spring',box:'-170 -140 340 100',d:()=>ssnString
    +SSN_HANG.map(([x,y],k)=>ssnFly(x,y+6,['#ff9fd0','#ffd166','#8ff0d0','#c9a7ff','#7fc8ff'][k],[-15,10,0,-10,15][k])).join('')},
  // Summer
  beachBall:{name:'Beach Ball',price:10,season:'summer',box:'-50 -90 100 100',d:()=>`<ellipse cx="0" cy="-3" rx="30" ry="6" fill="#00000030"/><circle cx="0" cy="-40" r="36" fill="#fff"/>`
    +`<path d="M0 -76 Q-44 -40 0 -4 Q-20 -40 0 -76Z" fill="#ff6b8a"/><path d="M0 -76 Q44 -40 0 -4 Q20 -40 0 -76Z" fill="#4dabf7"/>`
    +`<path d="M-30 -60 Q-44 -40 -30 -20 Q-38 -40 -30 -60Z M30 -60 Q44 -40 30 -20 Q38 -40 30 -60Z" fill="#ffd166"/><circle cx="0" cy="-76" r="6" fill="#ffd166" stroke="#2b2235" stroke-width="2"/>`
    +`<circle cx="0" cy="-40" r="36" fill="none" ${ssnLine}/><path d="M-20 -62 Q-12 -70 -2 -71" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`},
  donutFloat:{name:'Donut Float',price:15,flat:1,season:'summer',box:'-120 -80 240 90',d:()=>{const ring=(rx,ry,ix,iy)=>`M${-rx} -32 a${rx} ${ry} 0 1 0 ${2*rx} 0 a${rx} ${ry} 0 1 0 ${-2*rx} 0Z M${-ix} -32 a${ix} ${iy} 0 1 0 ${2*ix} 0 a${ix} ${iy} 0 1 0 ${-2*ix} 0Z`;
    return `<path fill-rule="evenodd" d="${ring(104,38,38,13)}" fill="#ffd9a8" stroke="#2b2235" stroke-width="4"/><path fill-rule="evenodd" d="${ring(92,31,46,17)}" fill="#ff8cc6"/>`
      +[[-70,-38,20,'#fff'],[-50,-18,-30,'#ffd166'],[-20,-54,70,'#8ff0d0'],[16,-56,-40,'#fff'],[52,-46,10,'#7fc8ff'],[72,-26,60,'#ffd166'],[40,-12,-20,'#8ff0d0'],[-6,-8,40,'#a97cff'],[-82,-28,-60,'#7fc8ff']]
        .map(([x,y,r,c])=>`<rect x="${x-6}" y="${y-2}" width="12" height="4" rx="2" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('');}},
  lemonade:{name:'Lemonade Stand',price:30,season:'summer',box:'-100 -230 200 240',d:()=>`<ellipse cx="0" cy="-3" rx="86" ry="8" fill="#00000030"/>`
    +`<rect x="-76" y="-196" width="10" height="110" fill="#e4c48f" stroke="#2b2235" stroke-width="3"/><rect x="66" y="-196" width="10" height="110" fill="#e4c48f" stroke="#2b2235" stroke-width="3"/>`
    +`<path d="M-90 -200 H90 L84 -172 H-84Z" fill="#ffe066" ${ssnLine}/>${[-60,-20,20,60].map(x=>`<path d="M${x-10} -200 H${x+10} L${x+9} -172 H${x-9}Z" fill="#fff"/>`).join('')}<path d="M-90 -200 H90 L84 -172 H-84Z" fill="none" ${ssnLine}/>`
    +`<path d="M-84 -172 ${[-63,-42,-21,0,21,42,63,84].map(x=>`Q${x-10.5} -158 ${x} -172`).join(' ')}" fill="#ffe066" ${ssnLine}/>`
    +`<rect x="-80" y="-90" width="160" height="90" rx="6" fill="#fff6d6" ${ssnLine}/><rect x="-86" y="-98" width="172" height="12" rx="5" fill="#ffb3d9" ${ssnLine}/>`
    +`<text x="0" y="-48" text-anchor="middle" font-size="19" font-weight="900" fill="#c88a00">LEMONADE</text><circle cx="-40" cy="-22" r="10" fill="#ffe066" stroke="#2b2235" stroke-width="2"/><circle cx="40" cy="-22" r="10" fill="#ffe066" stroke="#2b2235" stroke-width="2"/>`
    +`<path d="M-50 -98 L-54 -140 H-22 L-26 -98Z" fill="#fff59a" fill-opacity=".85" stroke="#2b2235" stroke-width="3"/><path d="M-22 -132 q12 2 6 18" stroke="#2b2235" stroke-width="3" fill="none"/>`
    +`<path d="M14 -98 L12 -120 H32 L30 -98Z M44 -98 L42 -120 H62 L60 -98Z" fill="#fff59a" stroke="#2b2235" stroke-width="2.5"/><path d="M28 -120 l6 -16 M58 -120 l6 -16" stroke="#ff8cc6" stroke-width="3"/>`},
  sunLamp:{name:'Sun Lamp',price:20,season:'summer',box:'-70 -210 140 220',d:()=>`<ellipse cx="0" cy="-3" rx="36" ry="7" fill="#00000030"/><rect x="-28" y="-14" width="56" height="14" rx="6" fill="#ff8cc6" ${ssnLine}/><rect x="-4" y="-120" width="8" height="108" fill="#3b2f52"/>`
    +[0,1,2,3,4,5,6,7].map(k=>{const a=k*TAU/8, c=Math.cos(a), s=Math.sin(a);return `<line x1="${(c*36).toFixed(1)}" y1="${(-152+s*36).toFixed(1)}" x2="${(c*50).toFixed(1)}" y2="${(-152+s*50).toFixed(1)}" stroke="#ffb020" stroke-width="7" stroke-linecap="round"/>`;}).join('')
    +`<circle cx="0" cy="-152" r="30" fill="#ffe066" stroke="#e8a317" stroke-width="4" filter="url(#glow)"/>`
    +`<path d="M-14 -156 q5 -5 10 0 M4 -156 q5 -5 10 0" stroke="#2a1f33" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-9 -144 q9 8 18 0" stroke="#2a1f33" stroke-width="3" fill="none" stroke-linecap="round"/>`
    +`<ellipse cx="-18" cy="-144" rx="5" ry="3" fill="#ff8fb8" opacity=".6"/><ellipse cx="18" cy="-144" rx="5" ry="3" fill="#ff8fb8" opacity=".6"/>`}
});

/* ---------- the windows change with the season ---------- */
// n = 1 (her room's window, a sunny day over the soccer field) or 2 (the Loft's round night-sky window).
// layer 'ground' is drawn just after the grass (under the goal and ball), 'air' on top of the view, under the curtains.
function seasonWindow(n,layer){
  const s=seasonNow(); let h='';
  if(n===1&&layer==='ground'){
    if(s==='autumn') h=`<rect x="94" y="182" width="202" height="49" fill="#d9a441" opacity=".55"/>`+[[110,200,30],[180,220,-40],[230,196,80],[280,214,10],[132,224,-70]].map(([x,y,r],k)=>ssnLeaf(x,y,r,['#e85d4a','#ff9a3c','#ffc23d'][k%3])).join('');
    else if(s==='winter') h=`<path d="M94 186 Q130 176 170 184 Q220 174 296 184 V231 H94Z" fill="#f4f8ff"/><rect x="94" y="74" width="202" height="108" fill="#dfe9ff" opacity=".35"/>`;
    else if(s==='spring') h=[[110,206],[170,222],[214,200],[262,220],[286,198],[136,190]].map(([x,y],k)=>ssnBlossom(x,y,k%2?'#fff':'#ff9fd0',3.2)).join('');
    else h=`<rect x="94" y="182" width="202" height="49" fill="#8be06b" opacity=".35"/>`;
    return h?`<g clip-path="url(#cpWin1)" data-season="${s}">${h}</g>`:'';
  }
  if(n===1){
    if(s==='autumn') h=[[120,100,20],[176,130,-30],[214,92,60],[262,140,-10],[240,170,40],[150,160,80]].map(([x,y,r],k)=>ssnLeaf(x,y,r,['#e85d4a','#ff9a3c','#ffc23d'][k%3])).join('');
    else if(s==='winter') h=[[110,96,4],[150,130,3],[188,90,3.5],[226,120,4],[266,92,3],[280,150,3.5],[120,160,3],[200,160,2.5],[250,176,3]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join('')
      +`<path d="M196 152 h80" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
    else if(s==='spring') h=`<path d="M296 74 Q250 90 222 84 M262 82 Q256 100 240 108" stroke="#7a5236" stroke-width="5" fill="none" stroke-linecap="round"/>`
      +[[226,84],[246,92],[270,82],[240,108],[286,78]].map(([x,y],k)=>ssnBlossom(x,y,k%2?'#fff':'#ffb3d9',4.5)).join('')
      +[[170,120,20],[200,150,-30],[140,140,50]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="4" ry="2.5" fill="#ffb3d9" transform="rotate(${r} ${x} ${y})"/>`).join('');
    else h=`<g stroke="#ffb020" stroke-width="4" stroke-linecap="round">${[0,1,2,3,4,5,6,7].map(k=>{const a=k*TAU/8;return `<line x1="${(268+Math.cos(a)*24).toFixed(1)}" y1="${(100+Math.sin(a)*24).toFixed(1)}" x2="${(268+Math.cos(a)*32).toFixed(1)}" y2="${(100+Math.sin(a)*32).toFixed(1)}"/>`;}).join('')}</g><circle cx="268" cy="100" r="18" fill="#ffe066" stroke="#ffb020" stroke-width="3"/>`;
    return `<g clip-path="url(#cpWin1)" data-season="${s}">${h}</g>`;
  }
  // the Loft's round window (night sky)
  if(s==='autumn') h=[[296,124,30],[372,118,-20],[318,184,70],[384,164,10],[350,150,-60]].map(([x,y,r],k)=>ssnLeaf(x,y,r,['#e85d4a','#ff9a3c','#ffc23d'][k%3])).join('');
  else if(s==='winter') h=[[300,92,3],[322,134,2.5],[394,128,3],[286,170,2.5],[366,104,2],[330,164,3],[372,182,2.5]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join('')
    +`<path d="M272 196 Q300 186 330 194 Q370 184 408 196 V212 H272Z" fill="#f4f8ff"/>`;
  else if(s==='spring') h=[[300,128,20],[376,120,-30],[326,186,60],[386,170,10],[296,166,-50]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="#ffb3d9" transform="rotate(${r} ${x} ${y})"/>`).join('');
  else h=[[302,130],[374,124],[322,182],[388,170],[296,162],[352,160]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#eaff8a" opacity=".35"/><circle cx="${x}" cy="${y}" r="2.2" fill="#f6ffb8"/>`).join('');
  return `<g clip-path="url(#cpWin2)" data-season="${s}">${h}</g>`;
}

/* ---------- the 🍂 Seasons tab in Decorate ---------- */
// Called by renderDecoGrid (section 9). Walls show here too; a wall tile has data-kind="wall".
function seasonTab(){const t=$('[data-dt=season]'); if(t){const S=SEASONS[seasonNow()];t.innerHTML=`${S.icon}<span> Seasons</span>`;}}
function seasonGrid(p){
  const now=seasonNow(), wallNow=curRoom(p).wall;
  return seasonOrder().map(s=>{const S=SEASONS[s];
    const decos=easySort(Object.entries(DECOR).filter(([k,d])=>d.season===s),([k,d])=>d.price)
      .map(([k,d])=>`<button class="tile${poorCls(p,false,d.price)}" data-buy="${k}"><div class="tv">${decoPrev(k)}</div><div class="tn">${d.name}</div>${priceTag(p,d.price)}</button>`).join('');
    const walls=roomNo===3?'':Object.entries(WALLS).filter(([k,v])=>v.season===s).map(([k,v])=>surfTile(p,true,k,v,wallNow)).join(''); // no indoor walls in the Backyard (v1.23)
    return `<div class="grid-head${s===now?' now':''}">${S.icon} ${S.name}${s===now?' · ✨ In season!':''}</div>`+decos+walls;}).join('');
}
seasonTab();
