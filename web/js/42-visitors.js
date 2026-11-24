'use strict';
/* =========================================================
   42. VISITORS & WISHES (v1.41)
   Six friends from the games drop by: Mochi, Boo, Flap (the Soccer keepers) and Hop, Bolt, Zip (the strikers).
   One friend at a time stands in whichever room is on screen (VISIT_SPOT, like the gift pile) with a little wish.
   Tapping them opens the wish card: ✅ Show me! checks the room on screen (or her outfit), 💡 Help opens the Shop or the
   Closet with the right theme chip, 🔄 swaps to another wish. No timer and no failing: a friend waits as long as it takes.
   Pace: one new friend a day. The first comes straight away; after a wish comes true, the next one knocks the next day
   (from the device date, like the daily gift). Nothing is missed and nothing goes away.
   Thank-you: VISIT_COINS per wish; after all 3 of a friend's wishes they leave a plush of themselves (award:1, not in the Shop).
   Saved per room: visit{cur, day, done[]}: cur = the wish waiting ('' = none), day = when the last wish came true,
   done = wish ids. Wish ids and plush ids are saved: never rename or remove them; add new wishes at the end.
   The friends are drawn here facing front in SVG (in their games they are canvas drawings, the strikers seen from behind).
   ========================================================= */
const VISIT_COINS=5;
SFX.knock=()=>{[0,0.2].forEach(d=>tone(170,0.09,'triangle',0.3,110,d));};
const VISIT_SPOT={x:880,y:676}; // in front on the right, clear of the buddy (420-580), the pet (566) and the gifts (262)
const vO='stroke="#3b2f52" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
const vE=(x,y,rx,ry,f)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${vO}/>`;
const vC=(x,y,r,f)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${vO}/>`;
const vP=(d,f)=>`<path d="${d}" fill="${f}" ${vO}/>`;
const vMirror=h=>h+`<g transform="scale(-1 1)">${h}</g>`;
function vFace(y,dx){
  dx=dx||12;
  return [-dx,dx].map(x=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="6.5" fill="#2a1f33"/><circle cx="${x+1.5}" cy="${y-2.5}" r="1.8" fill="#fff"/>`
    +`<ellipse cx="${x*1.75}" cy="${y+9}" rx="6" ry="3.5" fill="#ff8fb8" opacity=".55"/>`).join('')
    +`<path d="M-6 ${y+9} Q0 ${y+14} 6 ${y+9}" fill="none" stroke="#2a1f33" stroke-width="3" stroke-linecap="round"/>`;
}
// Each friend stands in a box about 150 tall with (0,0) at their feet.
const VISIT_FRIENDS={
  mochi:{name:'Mochi',icon:'😺',color:'#ffd166',d:()=>{const f='#f8ecd8';
    return `<path d="M22 -14 Q62 -26 46 -66" fill="none" stroke="#3b2f52" stroke-width="14" stroke-linecap="round"/><path d="M22 -14 Q62 -26 46 -66" fill="none" stroke="${f}" stroke-width="7" stroke-linecap="round"/>`
      +vE(-16,-6,14,7,f)+vE(16,-6,14,7,f)+vE(0,-38,30,32,'#ffd166')+vE(-30,-44,9,14,f)+vE(30,-44,9,14,f)
      +vMirror(vP('M-28 -100 L-20 -128 L-6 -114Z',f)+`<path d="M-22 -110 L-19 -121 L-13 -114Z" fill="#ff8fb8"/>`)
      +vC(0,-88,32,f)+[-7,0,7].map(x=>`<path d="M${x} -116 v9" stroke="#f2b36b" stroke-width="3.5" stroke-linecap="round"/>`).join('')
      +vFace(-88)+`<path d="M-3 -80 L3 -80 L0 -76Z" fill="#ff8fb8"/>`;}},
  boo:{name:'Boo',icon:'👻',color:'#c9a7ff',d:()=>
    vC(-42,-58,10,'#a97cff')+vC(42,-58,10,'#a97cff')
    +vP('M-38 -8 L-38 -72 Q-38 -130 0 -130 Q38 -130 38 -72 L38 -8 Q29 -18 19 -8 Q9 2 0 -8 Q-9 2 -19 -8 Q-29 -18 -38 -8Z','#fbf7ff')
    +`<rect x="-35" y="-108" width="70" height="9" fill="#a97cff"/>`+vFace(-80)},
  flap:{name:'Flap',icon:'🦇',color:'#a97cff',d:()=>
    vMirror(vP('M-28 -72 Q-62 -106 -94 -86 Q-84 -76 -86 -64 Q-72 -72 -68 -58 Q-54 -68 -28 -50Z','#4c2d91'))
    +vE(-12,-6,9,6,'#6b46b8')+vE(12,-6,9,6,'#6b46b8')
    +vMirror(vP('M-26 -84 L-20 -116 L-6 -96Z','#6b46b8'))+vC(0,-56,40,'#6b46b8')
    +`<ellipse cx="0" cy="-38" rx="22" ry="16" fill="#9b7be0"/>`+vC(-38,-40,10,'#8ff0d0')+vC(38,-40,10,'#8ff0d0')
    +[-14,14].map(x=>`<circle cx="${x}" cy="-66" r="10" fill="#fff"/><ellipse cx="${x+1}" cy="-65" rx="5" ry="6" fill="#1a1422"/><circle cx="${x+2.5}" cy="-67.5" r="1.6" fill="#fff"/>`).join('')
    +`<path d="M-6 -52 Q0 -47 6 -52" fill="none" stroke="#1a1422" stroke-width="3" stroke-linecap="round"/><path d="M4 -51 L9 -51 L6.5 -45Z" fill="#fff"/>`},
  hop:{name:'Hop',icon:'🐸',color:'#7ed957',d:()=>{const g='#7ed957';
    return vE(-28,-8,18,9,'#5cbf4a')+vE(28,-8,18,9,'#5cbf4a')+vE(-38,-48,9,14,g)+vE(38,-48,9,14,g)+vE(0,-46,36,34,g)
      +vP('M-34 -60 Q0 -72 34 -60 L30 -22 Q0 -12 -30 -22Z','#ff8cc6')
      +`<text x="0" y="-31" text-anchor="middle" font-size="24" font-weight="900" fill="#fff" stroke="#3b2f52" stroke-width="4" paint-order="stroke">1</text>`
      +vC(-18,-114,13,g)+vC(18,-114,13,g)+vE(0,-92,34,24,g)
      +`<rect x="-30" y="-112" width="60" height="12" fill="${g}"/>`
      +[-18,18].map(x=>`<circle cx="${x}" cy="-114" r="7" fill="#fff"/><circle cx="${x}" cy="-113" r="4" fill="#1a1422"/>`).join('')
      +`<path d="M-16 -88 Q0 -76 16 -88" fill="none" stroke="#2a1f33" stroke-width="3.5" stroke-linecap="round"/>`
      +`<ellipse cx="-24" cy="-86" rx="6" ry="3.5" fill="#ff8fb8" opacity=".55"/><ellipse cx="24" cy="-86" rx="6" ry="3.5" fill="#ff8fb8" opacity=".55"/>`;}},
  bolt:{name:'Bolt',icon:'🤖',color:'#7fc8ff',d:()=>
    `<rect x="-22" y="-26" width="14" height="24" rx="4" fill="#7d8ea3" ${vO}/><rect x="8" y="-26" width="14" height="24" rx="4" fill="#7d8ea3" ${vO}/>`
    +vMirror(`<path d="M-34 -72 L-48 -46" stroke="#3b2f52" stroke-width="14" stroke-linecap="round"/><path d="M-34 -72 L-48 -46" stroke="#9fb4c8" stroke-width="7" stroke-linecap="round"/>`+vC(-48,-42,7,'#ffd166'))
    +`<rect x="-34" y="-86" width="68" height="60" rx="12" fill="#a9bdd2" ${vO}/><rect x="-20" y="-76" width="40" height="30" rx="6" fill="#5b6b80" ${vO}/>`
    +['#ff8cc6','#8ff0d0','#ffd166'].map((c,i)=>`<circle cx="${-11+i*11}" cy="-61" r="4.5" fill="${c}"/>`).join('')
    +`<path d="M0 -126 V-140" ${vO}/><circle class="an-glow" cx="0" cy="-143" r="6" fill="#ff8cc6" ${vO}/>`
    +`<rect x="-34" y="-114" width="8" height="16" rx="3" fill="#7d8ea3" ${vO}/><rect x="26" y="-114" width="8" height="16" rx="3" fill="#7d8ea3" ${vO}/>`
    +`<rect x="-28" y="-126" width="56" height="40" rx="10" fill="#c4d4e4" ${vO}/><rect x="-20" y="-119" width="40" height="25" rx="6" fill="#2a3446"/>`
    +`<path d="M-13 -106 q4 -6 8 0 M5 -106 q4 -6 8 0" fill="none" stroke="#8ff0d0" stroke-width="3.5" stroke-linecap="round"/><path d="M-5 -100 Q0 -96 5 -100" fill="none" stroke="#8ff0d0" stroke-width="3" stroke-linecap="round"/>`},
  zip:{name:'Zip',icon:'🦊',color:'#ff9a3c',d:()=>{const o='#ff9a3c';
    return vP('M14 -24 Q54 -12 62 -46 Q70 -78 52 -94 Q34 -62 10 -40Z',o)+vP('M52 -94 Q70 -78 63 -60 Q55 -72 45 -80Z','#fff')
      +vE(-12,-6,11,7,'#5a3a2a')+vE(12,-6,11,7,'#5a3a2a')+vE(-30,-48,8,13,o)+vE(30,-48,8,13,o)+vE(0,-46,30,30,o)
      +vP('M-28 -56 Q0 -66 28 -56 L25 -26 Q0 -18 -25 -26Z','#a97cff')
      +`<text x="0" y="-33" text-anchor="middle" font-size="22" font-weight="900" fill="#fff" stroke="#3b2f52" stroke-width="4" paint-order="stroke">3</text>`
      +vE(0,-72,27,8,'#8ff0d0')
      +vMirror(vP('M-8 -116 L-22 -140 L-26 -104Z',o)+`<path d="M-17 -132 L-22 -140 L-24 -128Z" fill="#3b2f52"/>`)
      +vC(0,-98,26,o)+`<ellipse cx="0" cy="-86" rx="15" ry="10" fill="#fff"/>`+vFace(-100,10).replace(/<path d="M-6[^>]*>/,'')
      +`<ellipse cx="0" cy="-91" rx="4.5" ry="3.5" fill="#2a1f33"/><path d="M-5 -85 Q0 -81 5 -85" fill="none" stroke="#2a1f33" stroke-width="3" stroke-linecap="round"/>`;}}
};
const vFriendSVG=(who,cls)=>`<svg class="${cls||''}" viewBox="-100 -150 200 160"><ellipse cx="0" cy="0" rx="44" ry="9" fill="#00000030"/>${VISIT_FRIENDS[who].d()}</svg>`;

/* ---------- what a wish needs ---------- */
// The themes (theme chips, section 33) of things placed in the room on screen, and of the clothes she has on.
const vRoomThemes=R=>R.items.filter(i=>i.placed&&DECOR[i.type]).map(i=>themesOf('decor:'+i.type,DECOR[i.type]));
function vWornThemes(p){
  return Object.keys(CLOSET).filter(c=>!['kind','fur','face'].includes(c)).map(c=>{
    const id=c==='hair'?hairIds(p.look).h:p.look[c], it=id&&CLOSET[c].items.find(x=>x.id===id);
    return it&&it.id!=='none'?themesOf(c+':'+id,it):[];});
}
const vAny=(themes,ts)=>ts.some(t=>themes.includes(t));
// A part = one line on the wish card: {icon, name, n, have(p,R), help}. help: {shop:theme} | {closet:theme} | {art:1} | {night:1} | {room:n}
const vInRoom=(themes,n,icon,name)=>({th:themes,icon,name,n,have:(p,R)=>vRoomThemes(R).filter(ts=>vAny(themes,ts)).length,help:{shop:themes[0]}});
const vWear=(themes,n,icon,name)=>({th:themes,wear:1,icon,name,n,have:p=>vWornThemes(p).filter(ts=>vAny(themes,ts)).length,help:{closet:themes[0]}});
const vRug={icon:'🧶',name:'A rug',n:1,have:(p,R)=>R.items.filter(i=>i.placed&&DECOR[i.type]&&DECOR[i.type].flat).length,help:{shop:'all'}};
const vPosters={icon:'🖼️',name:'Your drawings on the wall',n:2,have:(p,R)=>R.items.filter(i=>i.placed&&i.type==='poster').length,help:{art:1}};
const vGlow={icon:'💡',name:'Something that glows',n:1,have:(p,R)=>R.items.filter(i=>i.placed&&NIGHT_GLOW[i.type]).length,help:{shop:'all'}};
const vNight={icon:'🌙',name:'Night time on',n:1,have:p=>isNight(p)?1:0,help:{night:1}};
const vYard={icon:'🌳',name:'Out in the Backyard',n:1,have:()=>roomNo===3?1:0,help:{room:3}};
const vWish=(id,who,icon,title,say,parts)=>({id,who,icon,title,say,parts});
// In visiting order: each friend's 1st wish, then each one's 2nd, then each one's 3rd.
const VISIT_WISHES=[
  vWish('mochi1','mochi','🧺','A cozy corner','I love curling up somewhere soft!',[vInRoom(['cute','cozy'],2,'☁️','Cute or cozy things'),vRug]),
  vWish('boo1','boo','🦇','Spooky-cute room','Can this room be a little spooky?',[vInRoom(['emo'],3,'🦇','Emo things')]),
  vWish('flap1','flap','🎤','Put on a show','I want to dance! Is there a stage?',[vInRoom(['stage'],2,'🎤','Stage things')]),
  vWish('hop1','hop','🌳','Garden party','Let\'s have a party outside!',[vYard,vInRoom(['yard'],3,'🌳','Outdoor things')]),
  vWish('bolt1','bolt','🚀','Space base','Beep boop! I want to see space!',[vInRoom(['space'],2,'🚀','Space things')]),
  vWish('zip1','zip','⚽','Soccer outfit','Ready to play? Dress for the game!',[vWear(['sport'],2,'⚽','Sport clothes on')]),
  vWish('mochi2','mochi','🧦','Comfy clothes','Let\'s wear our coziest things!',[vWear(['cute','cozy'],2,'☁️','Cute or cozy clothes on')]),
  vWish('boo2','boo','🌌','Space ghost','Whooo! Let\'s dress for outer space!',[vWear(['space'],2,'🚀','Space clothes on')]),
  vWish('flap2','flap','✨','Stage outfit','Dress up like a star!',[vWear(['stage'],2,'🎤','Stage clothes on')]),
  vWish('hop2','hop','🐚','Under the sea','I miss the water. Ocean things?',[vInRoom(['ocean'],2,'🐚','Ocean things')]),
  vWish('bolt2','bolt','🤖','Hero base','Every hero needs a base!',[vInRoom(['hero'],2,'🤖','Hero things')]),
  vWish('zip2','zip','🏆','Sports corner','A corner for sports, please!',[vInRoom(['sport'],2,'⚽','Sport things')]),
  vWish('mochi3','mochi','🧁','Snack time','Something yummy? Mrrow!',[vInRoom(['cafe'],2,'🧁','Cafe things')]),
  vWish('boo3','boo','🌙','Night lights','I like a soft light at night.',[vGlow,vNight]),
  vWish('flap3','flap','🎨','Art show','Can I see your drawings?',[vPosters]),
  vWish('hop3','hop','🐮','Farm day','Moo! Ribbit! Farm things?',[vInRoom(['farm'],2,'🐮','Farm things')]),
  vWish('bolt3','bolt','🦕','Dino den','Rawr! Dinosaurs are cool!',[vInRoom(['dino'],2,'🦕','Dino things')]),
  vWish('zip3','zip','🚗','Road trip','Vroom! Let\'s go for a ride!',[vInRoom(['ride'],2,'🚗','Ride things')])
];
const vWishOf=id=>VISIT_WISHES.find(w=>w.id===id);
const vToday=()=>new Date().toDateString();
const vPartsDone=(p,w)=>w.parts.map(pt=>({pt,have:Math.min(pt.n,pt.have(p,curRoom(p)))}));
const vMet=(p,w)=>vPartsDone(p,w).every(x=>x.have>=x.pt.n);

/* ---------- arriving ---------- */
// A new friend knocks when nobody is visiting, there are wishes left and no wish came true today.
function visitArrive(p){
  const v=p.visit; if(v.cur&&vWishOf(v.cur)) return false;
  v.cur=''; if(v.day===vToday()) return false;
  const w=VISIT_WISHES.find(x=>!v.done.includes(x.id)); if(!w) return false;
  v.cur=w.id; save(); return true;
}
// Drawn by renderRoom (section 9) in the floor layer, in every room. Fades while decorating, like the pet and gifts.
function visitG(p){
  if(visitArrive(p)) setTimeout(()=>{if(cur==='room'&&!decorating){SFX.knock();say(`Knock knock! ${VISIT_FRIENDS[vWishOf(p.visit.cur).who].name} is here!`);}},300);
  const w=vWishOf(p.visit.cur); if(!w) return '';
  const F=VISIT_FRIENDS[w.who];
  return `<g class="hot visitor" data-hot="visitor" transform="translate(${VISIT_SPOT.x} ${VISIT_SPOT.y})"><ellipse cx="0" cy="0" rx="44" ry="9" fill="#00000030"/>`
    +`<g class="an-bob">${F.d()}</g><g transform="translate(46 -150)"><circle r="24" fill="#fff" stroke="#2b2235" stroke-width="4"/>`
    +`<path d="M-14 16 L-24 30 L-2 22Z" fill="#fff" stroke="#2b2235" stroke-width="4" stroke-linejoin="round"/><circle r="20" fill="#fff"/>`
    +`<text y="9" text-anchor="middle" font-size="26">${w.icon}</text></g></g>`;
}

/* ---------- the wish card ---------- */
function visitTap(msg){
  const p=P(), w=p&&vWishOf(p.visit.cur); if(!w) return;
  const F=VISIT_FRIENDS[w.who], rows=vPartsDone(p,w), left=VISIT_WISHES.filter(x=>!p.visit.done.includes(x.id)).length;
  if(!msg){SFX.click(); const g=$('.visitor .an-bob'); if(g){g.classList.remove('vs-hop');void g.getBoundingClientRect();g.classList.add('vs-hop');}}
  modal(`${F.icon} ${F.name} is visiting!`,
    `<button class="vs-x" data-vs="close" aria-label="Close">✖</button>`
    +`<div class="vs-card" style="--vs:${F.color}">${vFriendSVG(w.who,'vs-pic')}<div class="vs-say"><b>${w.icon} ${esc(w.title)}</b><span>${esc(w.say)}</span></div></div>`
    +`<div class="vs-parts">${rows.map(({pt,have},i)=>`<button class="vs-row${have>=pt.n?' ok':''}" data-vs-help="${i}" aria-label="${esc(pt.name)}"><i>${pt.icon}</i><span class="tn">${esc(pt.name)}</span><b>${have>=pt.n?'✔':`${have} / ${pt.n}`}</b></button>`).join('')}</div>`
    +(msg?`<div class="vs-msg">${msg}</div>`:`<div class="vs-tip">Tap a line for 💡 help</div>`),
    [{text:'🔄 Other wish',cls:'ghost',on:()=>visitSwap(),hide:left<2},{text:'✅ Show me!',cls:'pink',keep:true,on:()=>visitCheck()}].filter(b=>!b.hide));
  if(!msg) setTimeout(()=>tell(`${F.name} is visiting! ${w.title}. ${w.say}`),0); // after the tap's own words (section 65, v1.70)
}
// Not yet: say what is still missing, kindly, and keep the card open.
function visitCheck(){
  const p=P(), w=vWishOf(p.visit.cur); if(!w) return;
  if(vMet(p,w)){closeModal();visitDone(p,w);return;}
  const miss=vPartsDone(p,w).find(x=>x.have<x.pt.n), more=miss.pt.n-miss.have;
  SFX.locked();
  visitTap(miss.pt.help.room?`Almost! Let's go out to the 🌳 Backyard.`:miss.pt.help.night?`Almost! Tap 🌙 to make it night.`
    :`Almost! ${miss.pt.n>1?`${more} more`:'Just need'} ${miss.pt.icon} ${miss.pt.n>1?(more>1?'things':'thing'):esc(miss.pt.name.toLowerCase())}. You can do it! 💜`);
}
function visitHelp(i){
  const p=P(), w=vWishOf(p.visit.cur), pt=w&&w.parts[i]; if(!pt) return;
  closeModal(); const h=pt.help;
  if(h.room){goRoom(h.room);say('Here we are! 🌳');}
  else if(h.night){say('Tap the 🌙 button! ✨');}
  else if(h.art){SFX.click();show('art');toast('Draw something, then 📌 hang it in your room!');}
  else if(h.closet){
    const cat=Object.keys(CLOSET).find(c=>CLOSET[c].items.some(it=>themesOf(c+':'+it.id,it).includes(h.closet)))||'top';
    closetCat=cat; themePick.closet=h.closet; SFX.click(); show('closet');
  } else {themePick.shop=h.shop; decoTab='shop'; if(decorating)renderDecoGrid(); else enterDecorate(); $('#decoGrid').scrollTop=0;
    if(pt===vRug) toast('Rugs lie flat on the floor 🧶'); else if(pt===vGlow) toast('Lamps, lights and neon signs glow 💡');}
}
// 🔄 Something else: the next wish she hasn't done (in visiting order). The new friend shows up in the same spot.
function visitSwap(){
  const p=P(), v=p.visit, left=VISIT_WISHES.filter(x=>!v.done.includes(x.id));
  if(left.length<2) return;
  const i=left.findIndex(x=>x.id===v.cur), w=left[(i+1)%left.length];
  v.cur=w.id; save(); SFX.whoosh(); renderRoom();
  say(`Hi! I'm ${VISIT_FRIENDS[w.who].name}! ${w.icon}`);
}
function visitDone(p,w){
  const v=p.visit; v.done.push(w.id); v.cur=''; v.day=vToday(); p.coins+=VISIT_COINS; p.stats.wishes=(p.stats.wishes||0)+1;
  const F=VISIT_FRIENDS[w.who], all=VISIT_WISHES.filter(x=>x.who===w.who).every(x=>v.done.includes(x.id)), plush=VISIT_PLUSH[w.who];
  if(all&&!allItems(p).some(i=>i.type===plush)) curRoom(p).items.push({uid:uid(),type:plush,x:VISIT_SPOT.x,y:VISIT_SPOT.y,placed:true});
  save(); updateCoins(); renderRoom(); SFX.cheer(); vibrate(20); giftConfetti();
  modal(`${F.icon} ${F.name} loves it!`,`<div class="vs-card" style="--vs:${F.color}">${vFriendSVG(w.who,'vs-pic vs-yay')}<div class="vs-say"><b>Thank you, ${esc(p.name)}! 💜</b><span>Your ${esc(w.title.toLowerCase())} is perfect!</span></div></div>`
    +`<div class="gv-ask">+${VISIT_COINS} 🪙</div>`
    +(all?`<div class="vs-plush"><svg viewBox="${DECOR[plush].box}">${DECOR[plush].d()}</svg><span>${F.name} left you a plush! It's in this room. ✨</span></div>`:'')
    +`<p style="text-align:center">${VISIT_WISHES.every(x=>v.done.includes(x.id))?'Every wish came true! You are the best host! 🌟':'Another friend will knock tomorrow 🚪'}</p>`,
    [{text:'Yay! ✨',cls:'pink',on:()=>checkStickers()}]);
}
$('#modal').addEventListener('click',e=>{
  if(e.target.closest('[data-vs="close"]')){closeModal();return;}
  const h=e.target.closest('[data-vs-help]'); if(h) visitHelp(+h.dataset.vsHelp);
});
HOT_WORDS.visitor='A friend is visiting';

/* ---------- the thank-you plushes (prizes: never in the Shop) ---------- */
const VISIT_PLUSH={};
Object.keys(VISIT_FRIENDS).forEach(who=>{
  const key='plush'+who[0].toUpperCase()+who.slice(1), F=VISIT_FRIENDS[who]; VISIT_PLUSH[who]=key;
  DECOR[key]={name:F.name+' Plush',price:0,award:1,box:'-62 -108 124 114',d:()=>
    `<ellipse cx="0" cy="0" rx="30" ry="6" fill="#00000030"/><g transform="scale(.68)">${F.d()}</g>`
    +`<rect x="10" y="-18" width="16" height="12" rx="2" fill="#fff" stroke="#3b2f52" stroke-width="2.5" transform="rotate(12 18 -12)"/><path d="M14 -12 h7" stroke="${F.color}" stroke-width="2.5" transform="rotate(12 18 -12)"/>`};
});

/* ---------- stickers (a new 🚪 Friends page) ---------- */
STK_PAGES.friends={icon:'🚪',name:'Friends',color:'#7fe0a8'};
const vPlushes=p=>Object.values(VISIT_PLUSH).filter(k=>allItems(p).some(i=>i.type===k)).length;
STICKERS.push(
  stk('wish1','friends','🚪','Welcome!','circle','Make a visitor\'s wish come true',1,p=>p.visit.done.length,1),
  stk('wish6','friends','💌','Good Friend','heart','Make 6 wishes come true',6,p=>p.visit.done.length,1),
  stk('wish12','friends','💝','Super Friend','heart','Make 12 wishes come true',12,p=>p.visit.done.length,2),
  stk('wishAll','friends','🌟','Best Host','star','Make every wish come true',()=>VISIT_WISHES.length,p=>p.visit.done.length,3),
  stk('plush1','friends','🧸','First Plush','scallop','Get a plush from a friend',1,vPlushes,1),
  stk('plush6','friends','🧸','Plush Pals','scallop','Get all 6 friend plushes',6,vPlushes,3)
);
