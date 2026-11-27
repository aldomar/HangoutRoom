'use strict';
/* =========================================================
   56. PET WALKS (v1.55): a stroll with her buddy and her pet
   🦮 Walk in the pet menu (section 22) opens scr-walk. Three views (data-view): pick (4 path cards, all free), walk
   (the scene) and book (🧺 Walk Finds). On a walk, holding 👣 (or the scene) walks: the scenery strips slide by with
   CSS animations that only run while she holds (no main loop). After WK_GAP ms of walking the pet stops and sniffs a
   bush; a tap finds something (a WALK_FINDS entry; animals are only "seen" and waved goodbye). WK_SPOTS sniffs, then a
   bench and home. Hearts only: +WK_FIND_HEARTS a find, +WK_HOME_HEARTS a walk. A path's 8 finds give its treasure
   jar (WALK_JARS, award:1) into My Stuff. Saved in p.walk {path, finds[]} and p.stats.petWalks / finds.
   Path ids, find ids and jar keys are saved: never rename them; new finds go at the end of their path.
   ========================================================= */
const WK_SPOTS=5, WK_GAP=2600, WK_FIND_HEARTS=1, WK_HOME_HEARTS=3;
const WK={view:'pick',path:'',spots:0,got:[],walking:false,walked:0,t0:0,timer:0,sniff:null,done:false,img:'',imgKey:''};
window.WK_TEST_FAST=false; // the smoke test makes the walking gap short
const wkL='stroke="#2b2235" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
// A 1000-wide strip, drawn twice side by side so it can slide round and round. sky (still), far, mid, ground.
const WALK_PATHS={
  meadow:{icon:'🌼',name:'Flower Meadow',sky:'#bfe6ff',
    still:()=>`<circle cx="860" cy="90" r="46" fill="#ffe08a"/>`,
    far:()=>`<path d="M0 380 Q160 300 320 360 T640 350 T1000 380 V450 H0Z" fill="#a8dd92"/>`+[120,560,860].map(x=>`<g fill="#fff" opacity=".9"><ellipse cx="${x}" cy="120" rx="50" ry="20"/><ellipse cx="${x+30}" cy="106" rx="30" ry="20"/></g>`).join(''),
    mid:()=>[140,520,830].map(x=>`<rect x="${x-8}" y="330" width="16" height="110" fill="#9a6b45"/><circle cx="${x}" cy="315" r="48" fill="#6fc06a"/><circle cx="${x-28}" cy="335" r="30" fill="#62b35f"/>`).join('')
      +[60,280,400,680,950].map((x,i)=>`<circle cx="${x}" cy="432" r="7" fill="${['#ff8cc6','#fff','#ffd166','#a97cff','#fff'][i]}"/><circle cx="${x}" cy="432" r="2.5" fill="#ffd166"/>`).join(''),
    ground:()=>`<rect y="440" width="1000" height="120" fill="#7cc76a"/><rect y="478" width="1000" height="52" fill="#e9cf9f"/>`+[90,330,610,880].map(x=>`<ellipse cx="${x}" cy="505" rx="12" ry="5" fill="#cfae7a"/>`).join(''),
    prop:()=>`<path d="M-70 0 Q-80 -60 -30 -70 Q0 -110 40 -72 Q84 -62 70 0Z" fill="#5fb35c" ${wkL}/><circle cx="-24" cy="-40" r="6" fill="#ff8cc6"/><circle cx="26" cy="-50" r="6" fill="#fff"/><circle cx="8" cy="-24" r="6" fill="#ffd166"/>`},
  pond:{icon:'🦆',name:'Duck Pond',sky:'#cfe9ff',
    still:()=>`<circle cx="140" cy="90" r="40" fill="#fff3c4"/>`,
    far:()=>`<path d="M0 350 Q250 290 500 340 T1000 350 V440 H0Z" fill="#9fd4a0"/><rect y="372" width="1000" height="68" fill="#7fc8ef"/>`+[150,420,700,900].map(x=>`<ellipse cx="${x}" cy="404" rx="22" ry="7" fill="#5fb35c"/><path d="M${x-30} 390 h40 M${x+20} 420 h36" stroke="#d9f1ff" stroke-width="3"/>`).join(''),
    mid:()=>[80,330,610,880].map(x=>[0,14,28].map(d=>`<path d="M${x+d} 445 V${370+d}" stroke="#5c9a4a" stroke-width="5"/><rect x="${x+d-5}" y="${352+d}" width="10" height="26" rx="5" fill="#9a6b45"/>`).join('')).join(''),
    ground:()=>`<rect y="440" width="1000" height="120" fill="#7cc76a"/><rect y="470" width="1000" height="64" fill="#c99b6d"/>`+Array.from({length:20},(_,i)=>`<path d="M${i*50} 470 v64" stroke="#a87a52" stroke-width="3"/>`).join(''),
    prop:()=>`<ellipse cx="0" cy="-6" rx="70" ry="14" fill="#7fc8ef" ${wkL}/>`+[-40,-26,30,44].map((x,i)=>`<path d="M${x} -6 V${-70+i*6}" stroke="#5c9a4a" stroke-width="6"/>`).join('')+`<rect x="-31" y="-80" width="10" height="26" rx="5" fill="#9a6b45"/><rect x="39" y="-62" width="10" height="26" rx="5" fill="#9a6b45"/>`},
  town:{icon:'🏘️',name:'Town Sidewalk',sky:'#ffe0ec',
    still:()=>`<circle cx="800" cy="80" r="40" fill="#fff3c4"/>`,
    far:()=>[0,170,330,520,700,850].map((x,i)=>`<rect x="${x}" y="${220+(i%3)*30}" width="150" height="${230-(i%3)*30}" fill="#e7b6d0"/>`).join(''),
    mid:()=>[[60,'#ffc1dc','#c8578f'],[390,'#c9b6ff','#6a45c0'],[700,'#a8e6cf','#3f8f75']].map(([x,c,r])=>`<rect x="${x}" y="300" width="200" height="145" fill="${c}" ${wkL}/><path d="M${x-14} 304 L${x+100} 228 L${x+214} 304Z" fill="${r}" ${wkL}/><rect x="${x+80}" y="372" width="40" height="73" rx="6" fill="#fff6e8" ${wkL}/><rect x="${x+24}" y="330" width="36" height="30" fill="#fff3c4" ${wkL}/><rect x="${x+140}" y="330" width="36" height="30" fill="#fff3c4" ${wkL}/>`).join('')
      +[320,640,960].map(x=>`<path d="M${x} 445 V320" stroke="#4a3d63" stroke-width="7"/><circle cx="${x}" cy="314" r="12" fill="#ffd166" stroke="#4a3d63" stroke-width="4"/>`).join(''),
    ground:()=>`<rect y="440" width="1000" height="120" fill="#bdb4cc"/><rect y="440" width="1000" height="14" fill="#9d93b0"/>`+Array.from({length:10},(_,i)=>`<path d="M${i*100} 454 v106" stroke="#a79dbb" stroke-width="3"/>`).join(''),
    prop:()=>`<rect x="-70" y="-46" width="140" height="46" rx="6" fill="#c98a5e" ${wkL}/>`+[-46,-16,14,44].map((x,i)=>`<path d="M${x} -46 V-74" stroke="#5c9a4a" stroke-width="4"/><circle cx="${x}" cy="-80" r="10" fill="${['#ff8cc6','#ffd166','#a97cff','#fff'][i]}" ${wkL}/>`).join('')},
  stars:{icon:'🌙',name:'Starry Path',sky:'#241e4e',
    still:()=>`<circle cx="830" cy="100" r="54" fill="#fff3c4"/><circle cx="852" cy="88" r="46" fill="#241e4e"/>`+[[80,60],[220,130],[380,50],[520,110],[640,40],[960,180],[300,200],[700,190]].map(([x,y])=>`<path d="${starPath(x,y,6)}" fill="#fff3c4"/>`).join(''),
    far:()=>`<path d="M0 360 Q200 290 400 350 T800 340 T1000 360 V450 H0Z" fill="#3a3478"/>`,
    mid:()=>[120,450,780].map(x=>`<path d="M${x} 445 V340" stroke="#2a2550" stroke-width="14"/><path d="M${x-50} 360 L${x} 250 L${x+50} 360Z" fill="#2f2a63"/>`).join('')
      +[[60,380],[260,320],[380,400],[620,350],[700,410],[900,330]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="#fff3a0" opacity=".3"/><circle cx="${x}" cy="${y}" r="3.5" fill="#fff3a0"/>`).join(''),
    ground:()=>`<rect y="440" width="1000" height="120" fill="#3f3770"/><rect y="478" width="1000" height="52" fill="#5a4f92"/>`+[60,250,470,690,900].map(x=>`<circle cx="${x}" cy="505" r="6" fill="#8ff0d0" opacity=".85"/>`).join(''),
    prop:()=>`<path d="M-70 0 Q-74 -50 -30 -58 Q0 -96 36 -60 Q78 -52 70 0Z" fill="#2f6a5a" ${wkL}/>`+[[-30,-36],[20,-44],[44,-20]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#fff3a0"/>`).join('')}
};
const WALK_IDS=Object.keys(WALK_PATHS);
// Finds: 8 per path, each a small drawing centered at (0,0), about 60 across. seen:1 = an animal, waved goodbye, not taken.
const WALK_FINDS={
  meadow:[
    {id:'daisy',name:'a daisy',d:()=>[0,45,90,135,180,225,270,315].map(a=>`<ellipse cx="0" cy="-16" rx="7" ry="14" fill="#fff" ${wkL} transform="rotate(${a})"/>`).join('')+`<circle r="9" fill="#ffd166" ${wkL}/>`},
    {id:'ladybug',name:'a ladybug',seen:1,d:()=>`<ellipse cx="0" cy="4" rx="22" ry="20" fill="#ff5a6e" ${wkL}/><path d="M0 -16 V24" stroke="#2b2235" stroke-width="2.5"/><circle cx="0" cy="-18" r="10" fill="#2b2235"/>`+[[-10,0],[10,0],[-8,14],[8,14]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="#2b2235"/>`).join('')+`<circle cx="-3" cy="-20" r="2" fill="#fff"/><circle cx="3" cy="-20" r="2" fill="#fff"/>`},
    {id:'butterfly',name:'a butterfly',seen:1,d:()=>`<path d="M0 0 Q-30 -34 -26 -4 Q-30 24 0 4Z M0 0 Q30 -34 26 -4 Q30 24 0 4Z" fill="#c9a7ff" ${wkL}/><circle cx="-14" cy="-8" r="4" fill="#ffd166"/><circle cx="14" cy="-8" r="4" fill="#ffd166"/><path d="M0 -14 V16" stroke="#2b2235" stroke-width="5" stroke-linecap="round"/><path d="M0 -14 Q-6 -24 -10 -26 M0 -14 Q6 -24 10 -26" stroke="#2b2235" stroke-width="2" fill="none"/>`},
    {id:'clover',name:'a four-leaf clover',d:()=>[0,90,180,270].map(a=>`<path d="${heartPath(0,-14,9)}" fill="#6fc06a" ${wkL} transform="rotate(${a})"/>`).join('')+`<path d="M0 0 Q6 16 2 26" stroke="#4a8f45" stroke-width="3.5" fill="none"/>`},
    {id:'feather',name:'a soft feather',d:()=>`<path d="M-14 24 Q-18 -10 14 -26 Q20 4 -14 24Z" fill="#ffc1dc" ${wkL}/><path d="M-18 28 L12 -20" stroke="#c8578f" stroke-width="2.5"/>`},
    {id:'acorn',name:'an acorn',d:()=>`<path d="M-14 -4 Q-14 22 0 26 Q14 22 14 -4Z" fill="#c98a5e" ${wkL}/><path d="M-18 -4 Q-18 -20 0 -20 Q18 -20 18 -4Z" fill="#8b5a35" ${wkL}/><path d="M0 -20 V-28" stroke="#2b2235" stroke-width="3"/>`},
    {id:'stone',name:'a smooth stone',d:()=>`<ellipse cx="0" cy="4" rx="26" ry="17" fill="#b9b2c9" ${wkL}/><ellipse cx="-8" cy="-2" rx="9" ry="4" fill="#fff" opacity=".6"/>`},
    {id:'lostBall',name:'a lost ball',d:()=>`<circle r="22" fill="#ff8cc6" ${wkL}/><path d="M-22 0 H22 M0 -22 Q10 0 0 22" stroke="#fff" stroke-width="3" fill="none"/>`}
  ],
  pond:[
    {id:'shell',name:'a spiral shell',d:()=>`<path d="M-22 14 Q-26 -20 4 -22 Q26 -20 22 6 Q18 20 -2 18 Q-14 14 -10 0 Q-6 -10 6 -6 Q12 0 4 6" fill="#ffe0ec" ${wkL}/>`},
    {id:'duckFeather',name:'a duck feather',d:()=>`<path d="M-12 24 Q-20 -8 12 -26 Q22 6 -12 24Z" fill="#fff6c4" ${wkL}/><path d="M-16 28 L10 -18" stroke="#c9a23e" stroke-width="2.5"/>`},
    {id:'frog',name:'a frog',seen:1,d:()=>`<ellipse cx="0" cy="8" rx="26" ry="18" fill="#7fd36e" ${wkL}/><circle cx="-12" cy="-10" r="9" fill="#7fd36e" ${wkL}/><circle cx="12" cy="-10" r="9" fill="#7fd36e" ${wkL}/><circle cx="-12" cy="-10" r="4" fill="#2b2235"/><circle cx="12" cy="-10" r="4" fill="#2b2235"/><path d="M-10 8 Q0 16 10 8" stroke="#2b2235" stroke-width="2.5" fill="none"/>`},
    {id:'lily',name:'a lily flower',d:()=>`<ellipse cx="0" cy="14" rx="28" ry="9" fill="#5fb35c" ${wkL}/>`+[-40,-15,15,40].map(a=>`<ellipse cx="0" cy="-6" rx="8" ry="17" fill="#ffc1dc" ${wkL} transform="rotate(${a} 0 8)"/>`).join('')+`<circle cx="0" cy="4" r="5" fill="#ffd166"/>`},
    {id:'pebbleHeart',name:'a heart-shaped pebble',d:()=>`<path d="${heartPath(0,0,24)}" fill="#c9c2d9" ${wkL}/>`},
    {id:'cattail',name:'a cattail',d:()=>`<path d="M0 30 V-28" stroke="#5c9a4a" stroke-width="4"/><rect x="-7" y="-18" width="14" height="32" rx="7" fill="#9a6b45" ${wkL}/>`},
    {id:'duckling',name:'a duckling',seen:1,d:()=>`<ellipse cx="4" cy="10" rx="24" ry="15" fill="#ffe17a" ${wkL}/><circle cx="-10" cy="-10" r="13" fill="#ffe17a" ${wkL}/><path d="M-22 -10 l-10 3 10 3Z" fill="#ff9f43" ${wkL}/><circle cx="-12" cy="-13" r="2.5" fill="#2b2235"/>`},
    {id:'paperBoat',name:'a paper boat',d:()=>`<path d="M-28 4 H28 L18 20 H-18Z" fill="#fff" ${wkL}/><path d="M-12 4 L0 -24 L12 4Z" fill="#cfe9ff" ${wkL}/>`}
  ],
  town:[
    {id:'button',name:'a big button',d:()=>`<circle r="22" fill="#a97cff" ${wkL}/>`+[[-6,-6],[6,-6],[-6,6],[6,6]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.5" fill="#2b2235"/>`).join('')},
    {id:'marble',name:'a marble',d:()=>`<circle r="20" fill="#7fc8ef" ${wkL}/><path d="M-12 6 Q0 -10 14 -2" stroke="#ff8cc6" stroke-width="5" fill="none"/><circle cx="-7" cy="-9" r="4" fill="#fff"/>`},
    {id:'chalk',name:'sidewalk chalk',d:()=>`<rect x="-26" y="-6" width="40" height="13" rx="6" fill="#ff8cc6" ${wkL} transform="rotate(-20)"/><rect x="-14" y="8" width="40" height="13" rx="6" fill="#8ff0d0" ${wkL} transform="rotate(10)"/>`},
    {id:'ribbon',name:'a ribbon',d:()=>`<path d="M0 0 L-22 -14 V14Z M0 0 L22 -14 V14Z" fill="#ff8cc6" ${wkL}/><path d="M-4 4 L-12 26 M4 4 L12 26" stroke="#ff8cc6" stroke-width="5" stroke-linecap="round"/><circle r="6" fill="#ff4fa3" ${wkL}/>`},
    {id:'postcard',name:'a postcard',d:()=>`<rect x="-28" y="-18" width="56" height="36" rx="3" fill="#fff6e8" ${wkL}/><rect x="10" y="-12" width="12" height="14" fill="#ff8cc6"/><path d="M-20 -6 h20 M-20 2 h20 M-20 10 h14" stroke="#a79dbb" stroke-width="2.5"/>`},
    {id:'oldKey',name:'an old key',d:()=>`<circle cx="-14" cy="0" r="11" fill="none" stroke="#ffd166" stroke-width="6"/><path d="M-3 0 H26 M18 0 V9 M24 0 V7" stroke="#ffd166" stroke-width="6" fill="none"/>`},
    {id:'snail',name:'a snail',seen:1,d:()=>`<path d="M-28 20 H24 Q30 20 28 12" fill="none" stroke="#2b2235" stroke-width="2.5"/><path d="M-26 20 Q-30 6 -20 4 H18 Q26 6 26 20Z" fill="#c9e7a8" ${wkL}/><circle cx="2" cy="-2" r="17" fill="#ffc98a" ${wkL}/><path d="M2 -2 m-8 0 a8 8 0 1 0 8 -8" stroke="#c98a3e" stroke-width="2.5" fill="none"/><path d="M-22 6 L-28 -8 M-18 5 L-20 -10" stroke="#2b2235" stroke-width="2.5"/>`},
    {id:'kitty',name:'a sleepy kitty',seen:1,d:()=>`<ellipse cx="0" cy="10" rx="28" ry="16" fill="#ffc98a" ${wkL}/><path d="M-22 -2 L-24 -18 L-12 -8 Z M2 -6 L4 -20 L12 -6Z" fill="#ffc98a" ${wkL}/><path d="M-18 4 q3 3 6 0 M-6 4 q3 3 6 0" stroke="#2b2235" stroke-width="2" fill="none"/><path d="M26 14 Q36 4 28 -4" stroke="#ffc98a" stroke-width="6" fill="none" stroke-linecap="round"/>`}
  ],
  stars:[
    {id:'firefly',name:'a firefly',seen:1,d:()=>`<circle cx="0" cy="8" r="20" fill="#fff3a0" opacity=".35"/><ellipse cx="0" cy="8" rx="9" ry="11" fill="#fff3a0" ${wkL}/><circle cx="0" cy="-8" r="7" fill="#4a3d63" ${wkL}/><ellipse cx="-10" cy="-2" rx="9" ry="5" fill="#cfe9ff" ${wkL}/><ellipse cx="10" cy="-2" rx="9" ry="5" fill="#cfe9ff" ${wkL}/>`},
    {id:'owl',name:'an owl',seen:1,d:()=>`<ellipse cx="0" cy="4" rx="22" ry="24" fill="#a07a5a" ${wkL}/><path d="M-18 -16 L-14 -28 L-6 -18Z M18 -16 L14 -28 L6 -18Z" fill="#a07a5a" ${wkL}/><circle cx="-8" cy="-4" r="8" fill="#fff6e8" ${wkL}/><circle cx="8" cy="-4" r="8" fill="#fff6e8" ${wkL}/><circle cx="-8" cy="-4" r="3.5" fill="#2b2235"/><circle cx="8" cy="-4" r="3.5" fill="#2b2235"/><path d="M-3 6 L0 11 L3 6Z" fill="#ffd166"/>`},
    {id:'moonstone',name:'a moonstone',d:()=>`<path d="M-20 10 L-10 -18 L14 -16 L22 8 L2 22Z" fill="#cfe9ff" ${wkL}/><path d="M-10 -18 L2 4 L14 -16 M2 4 L2 22" stroke="#a79dbb" stroke-width="2" fill="none"/>`},
    {id:'starPebble',name:'a star pebble',d:()=>`<path d="${starPath(0,0,24)}" fill="#ffd166" ${wkL}/>`},
    {id:'pinecone',name:'a pinecone',d:()=>`<ellipse cx="0" cy="2" rx="16" ry="24" fill="#8b5a35" ${wkL}/>`+[-12,-2,8,18].map(y=>`<path d="M-14 ${y} Q0 ${y+8} 14 ${y}" stroke="#c98a5e" stroke-width="2.5" fill="none"/>`).join('')},
    {id:'moonflower',name:'a moonflower',d:()=>[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-14" rx="10" ry="14" fill="#f2ecff" ${wkL} transform="rotate(${a})"/>`).join('')+`<circle r="7" fill="#c9a7ff" ${wkL}/>`},
    {id:'hedgehog',name:'a hedgehog',seen:1,d:()=>`<path d="M-26 14 L-24 -2 L-18 -8 L-14 -18 L-6 -12 L0 -22 L6 -12 L14 -18 L16 -6 L24 -4 L26 14Z" fill="#8b6a52" ${wkL}/><ellipse cx="-18" cy="10" rx="12" ry="9" fill="#ffd9b0" ${wkL}/><circle cx="-20" cy="6" r="2.5" fill="#2b2235"/><circle cx="-29" cy="10" r="2.5" fill="#2b2235"/>`},
    {id:'lantern',name:'a little lantern',d:()=>`<path d="M-8 -26 H8 M0 -30 V-26" stroke="#4a3d63" stroke-width="4"/><rect x="-14" y="-24" width="28" height="40" rx="8" fill="#ffd166" ${wkL}/><circle cx="0" cy="-4" r="8" fill="#fff8d0"/><rect x="-16" y="16" width="32" height="8" rx="3" fill="#4a3d63"/>`}
  ]
};
const wkAllFinds=()=>WALK_IDS.reduce((a,k)=>a.concat(WALK_FINDS[k].map(f=>Object.assign({path:k},f))),[]);
const wkFind=id=>wkAllFinds().find(f=>f.id===id);
const wkHave=(p,path)=>WALK_FINDS[path].filter(f=>p.walk.finds.includes(f.id)).length;
const wkPathsDone=p=>WALK_IDS.filter(k=>wkHave(p,k)===WALK_FINDS[k].length).length;
const wkPic=(f,cls)=>`<svg class="${cls||''}" viewBox="-34 -34 68 68" aria-hidden="true">${f.d()}</svg>`;
const wkGap=()=>WK_TEST_FAST?120:WK_GAP;

/* ---------- treasure jars (prizes: never in the Shop) ---------- */
const WALK_JARS={meadow:'jarMeadow',pond:'jarPond',town:'jarTown',stars:'jarStars'};
WALK_IDS.forEach(k=>{
  const key=WALK_JARS[k], F=WALK_FINDS[k];
  DECOR[key]={name:WALK_PATHS[k].name.split(' ').pop()+' Jar',price:0,award:1,box:'-50 -120 100 124',d:()=>
    `<rect x="-38" y="-96" width="76" height="96" rx="18" fill="#dff3ff" fill-opacity=".75" stroke="#2b2235" stroke-width="3.5"/>`
    +[[-14,-26,0],[14,-30,2],[0,-58,4],[-16,-62,6]].map(([x,y,i])=>`<g transform="translate(${x} ${y}) scale(.42)">${F[i].d()}</g>`).join('')
    +`<rect x="-30" y="-110" width="60" height="16" rx="5" fill="#c98a5e" stroke="#2b2235" stroke-width="3.5"/><path d="M-26 -80 Q-30 -40 -26 -14" stroke="#fff" stroke-width="5" opacity=".7" fill="none" stroke-linecap="round"/>`};
  THEME_OF['decor:'+key]=[k==='stars'?'emo':k==='town'?'cozy':k==='pond'?'ocean':'cute'];
});
// Puts a path's jar in My Stuff, once (when its last find is found). Returns the jar's name or ''.
function wkGiveJar(p,path){
  const key=WALK_JARS[path];
  if(wkHave(p,path)<WALK_FINDS[path].length||allItems(p).some(i=>i.type===key)) return '';
  p.room.items.push({uid:uid(),type:key,x:500,y:600,placed:false}); return DECOR[key].name;
}

/* ---------- the screen ---------- */
function wkOpen(){const p=P(); closeModal(); if(!p||!petKind(p)) return; WK.view='pick'; SFX.click(); show('walk');}
function wkArt(p){
  const key=JSON.stringify(p.look); if(WK.imgKey===key) return WK.img; WK.imgKey=key;
  const svg=mascotSVG(p.look,null,'width="200" height="270"').replace('>',`><defs>${$('#gdefs').innerHTML}</defs>`);
  WK.img='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); return WK.img;
}
function renderWalk(){
  const p=P(); if(!p) return;
  const s=$('#scr-walk'); s.dataset.view=WK.view;
  backBtn('#wkBack',WK.view==='pick'?'pet':'paths'); // the pet menu she came from (section 76)
  if(WK.view==='pick'){
    $('#wkPaths').innerHTML=WALK_IDS.map(k=>{const W=WALK_PATHS[k];
      return `<button class="wk-card" data-path="${k}" aria-label="${W.name}"><svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice"><rect width="1000" height="560" fill="${W.sky}"/>${W.still()}${W.far()}${W.mid()}${W.ground()}</svg>`
        +`<span class="wk-cn">${W.icon} ${W.name}</span><span class="wk-cc">🧺 ${wkHave(p,k)}/${WALK_FINDS[k].length}</span></button>`;}).join('');
  } else if(WK.view==='book') wkBook();
}
function wkBook(){
  const p=P();
  $('#wkBook').innerHTML=WALK_IDS.map(k=>`<div class="wk-bh">${WALK_PATHS[k].icon} ${WALK_PATHS[k].name} <small>${wkHave(p,k)}/${WALK_FINDS[k].length}</small></div>`
    +`<div class="wk-bg">${WALK_FINDS[k].map(f=>{const got=p.walk.finds.includes(f.id);
      return `<button class="wk-bt${got?'':' wk-no'}" data-find="${f.id}" aria-label="${got?f.name.replace(/^an? /,''):'Not found yet'}">${wkPic(f)}<span>${got?f.name.replace(/^an? /,''):'?'}</span></button>`;}).join('')}</div>`).join('');
}
// The walk scene: the still sky, three strips that slide (each drawn twice), the sniff spot, her buddy and the pet.
function wkStart(path){
  const p=P(); if(!p||!WALK_PATHS[path]) return;
  p.walk.path=path; save();
  Object.assign(WK,{view:'walk',path,spots:0,got:[],walking:false,walked:0,sniff:null,done:false});
  const W=WALK_PATHS[path], two=f=>`${f()}<g transform="translate(1000 0)">${f()}</g>`;
  $('#wkScene').style.background=W.sky; // on a tall screen the picture sits at the bottom with more sky above
  $('#wkSvg').innerHTML=`<rect width="1000" height="560" fill="${W.sky}"/>${W.still()}`
    +`<g class="wk-strip wk-far">${two(W.far)}</g><g class="wk-strip wk-mid">${two(W.mid)}</g><g class="wk-strip wk-ground">${two(W.ground)}</g>`
    +`<g id="wkSpot" class="hidden" transform="translate(790 500)"><g class="wk-prop">${W.prop()}</g><g class="wk-bang"><circle cx="0" cy="-130" r="24" fill="#fff" stroke="#2b2235" stroke-width="3"/><text x="0" y="-120" text-anchor="middle" font-size="30" font-weight="900" fill="#ff4fa3">!</text></g></g>`
    +`<g id="wkBench" class="hidden" transform="translate(780 500)"><rect x="-90" y="-60" width="180" height="16" rx="6" fill="#c98a5e" stroke="#2b2235" stroke-width="3"/><rect x="-90" y="-96" width="180" height="14" rx="6" fill="#c98a5e" stroke="#2b2235" stroke-width="3"/><path d="M-76 -44 V0 M76 -44 V0 M-76 -82 V-60 M76 -82 V-60" stroke="#2b2235" stroke-width="7"/></g>`
    +`<g class="wk-buddy"><image href="${wkArt(p)}" x="200" y="300" width="150" height="202"/></g>`
    +`<g id="wkPet" class="wk-pet"><g transform="translate(450 506) scale(.8)"><g class="wk-petbob">${petArt(petKind(p),petAcc(p))}</g></g></g>`;
  renderWalk(); wkTip(); SFX.whoosh();
}
function wkTip(){
  const p=P(), name=esc(petName(p));
  const t=WK.done?`What a lovely walk! 🐾`:WK.sniff?`${name} found something! Tap the ❗`:WK.walking?'Walking… 👣':(p.easy?'Hold 👣':'Hold 👣 to walk');
  $('#wkTip').innerHTML=t;
  $('#wkDots').innerHTML=Array.from({length:WK_SPOTS},(_,i)=>`<b class="${i<WK.spots?'on':''}">🐾</b>`).join('');
  $('#wkGo').disabled=!!(WK.sniff||WK.done);
}

/* ---------- walking ---------- */
function wkWalk(on){
  if(WK.view!=='walk'||cur!=='walk') return;
  if(on&&(WK.walking||WK.sniff||WK.done)) return;
  if(!on&&!WK.walking) return;
  const sc=$('#wkScene');
  if(on){WK.walking=true; WK.t0=Date.now(); sc.classList.add('walking'); clearTimeout(WK.timer); WK.timer=setTimeout(wkSniff,Math.max(0,wkGap()-WK.walked));}
  else {WK.walking=false; WK.walked+=Date.now()-WK.t0; sc.classList.remove('walking'); clearTimeout(WK.timer);}
  wkTip();
}
function wkSniff(){
  const p=P(); if(!p||WK.view!=='walk') return;
  wkWalk(false); WK.walked=0;
  const all=WALK_FINDS[WK.path], fresh=all.filter(f=>!p.walk.finds.includes(f.id)&&!WK.got.includes(f.id));
  const pool=fresh.length?fresh:all.filter(f=>!WK.got.includes(f.id)), list=pool.length?pool:all;
  WK.sniff=list[Math.floor(Math.random()*list.length)];
  $('#wkSpot').classList.remove('hidden'); $('#wkPet').classList.add('sniffing');
  tone(880,0.08,'triangle',0.1,1100); vibrate(8); wkTip();
}
function wkDig(){
  const p=P(), f=WK.sniff; if(!p||!f) return;
  WK.sniff=null; WK.got.push(f.id); WK.spots++;
  const isNew=!p.walk.finds.includes(f.id); if(isNew) p.walk.finds.push(f.id);
  p.stats.finds++;
  const learned=petGive(p,WK_FIND_HEARTS), jar=isNew?wkGiveJar(p,WK.path):''; save();
  $('#wkSpot').classList.add('hidden'); $('#wkPet').classList.remove('sniffing');
  SFX.happy(); vibrate(10);
  const nm=f.name.replace(/^an? /,''), last=WK.spots>=WK_SPOTS;
  modal(f.seen?`👋 Hello, ${nm}!`:`✨ ${f.name[0].toUpperCase()+f.name.slice(1)}!`,
    `<div class="wk-found">${wkPic(f,'wk-big')}<div>${f.seen?`${esc(petName(p))} says hi. Bye bye, little ${nm}! 💜`:isNew?'New in your 🧺 Walk Finds!':'Another one! 🧺'}</div><div class="wk-h">❤️ +${WK_FIND_HEARTS}</div>`
      +(learned?`<div>🎉 New trick: ${learned.icon} ${learned.name}!</div>`:'')+(jar?`<div class="wk-jar">🫙 Every ${WALK_PATHS[WK.path].name} find! The <b>${jar}</b> is in 📦 My Stuff.</div>`:'')+`</div>`,
    [{text:last?'🏡 Head home':'👣 Keep walking',cls:'pink',on:()=>{if(last)wkHome();else wkTip();}}]);
  wkTip(); checkStickers();
}
function wkHome(){
  const p=P(); if(!p) return;
  WK.done=true; p.stats.petWalks++; const learned=petGive(p,WK_HOME_HEARTS); save();
  $('#wkBench').classList.remove('hidden'); wkTip(); SFX.cheer();
  endBox({title:'🐾 What a lovely walk!',body:`<div class="wk-found"><div class="wk-big-e">🏡</div><div>${esc(petName(p))} had so much fun!</div><div class="wk-h">❤️ +${WK_HOME_HEARTS}</div>`
    +(learned?`<div>🎉 New trick: ${learned.icon} ${learned.name}!</div>`:'')+`</div>`,
    back:{to:'pet',on:wkToPet},go:{text:'🔁 Another walk',on:()=>{WK.view='pick';renderWalk();}}}); // section 76
  checkStickers();
}
function wkStop(){clearTimeout(WK.timer); WK.walking=false; const sc=$('#wkScene'); if(sc) sc.classList.remove('walking');}
// Back to the pet menu in the room the walk started from (v1.85): that's where she came from.
function wkToPet(){show('room'); if(cur==='room'&&petKind(P())) petMenu();}
function wkBackKey(){
  if(WK.view==='pick') wkToPet();
  else {wkStop(); WK.view='pick'; renderWalk();}
}

/* ---------- taps ---------- */
$('#wkBack').onclick=()=>{SFX.click();wkBackKey();};
$('#wkBookBtn').onclick=()=>{SFX.click();wkStop();WK.view='book';renderWalk();};
$('#wkPaths').onclick=e=>{const b=e.target.closest('[data-path]'); if(b){SFX.click();wkStart(b.dataset.path);}};
$('#wkBook').onclick=e=>{const b=e.target.closest('[data-find]'); if(!b) return; const f=wkFind(b.dataset.find), p=P();
  if(f&&p.walk.finds.includes(f.id)){SFX.pop();toast(`${WALK_PATHS[f.path].icon} ${f.name[0].toUpperCase()+f.name.slice(1)}`);} else SFX.locked();};
{const go=$('#wkGo'), sc=$('#wkScene');
  go.addEventListener('pointerdown',e=>{e.preventDefault();wkWalk(true);});
  sc.addEventListener('pointerdown',e=>{if(e.target.closest('#wkSpot')){wkDig();return;} wkWalk(true);});
  ['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,()=>wkWalk(false)));
  go.addEventListener('pointerleave',()=>wkWalk(false));
  go.addEventListener('contextmenu',e=>e.preventDefault());}

STICKERS.push(
  stk('petWalk1','room','🦮','Walk Buddy','circle','Go for a 🦮 walk with your pet (tap your pet)',1,p=>p.stats.petWalks||0),
  stk('petWalkPath','room','🧺','Collector','heart','Find all 8 things on one walking path',1,wkPathsDone),
  stk('petWalkAll','room','🌟','Treasure Hunter','star','Find all 32 things on the walking paths',()=>wkAllFinds().length,p=>p.walk.finds.filter(id=>wkFind(id)).length,3)
);
