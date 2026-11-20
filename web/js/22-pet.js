'use strict';
/* =========================================================
   22. PET (v1.19): a little friend for Fuzzy
   A cozy pet bed sits by Fuzzy's feet in both rooms. Tap it to pick a pet (all 4 are free, and she can switch any
   time). Tap the pet for a small menu: 🤚 Pet, 🍪 Treat (PET_TREAT coins), 🎀 Dress-up, ✏️ Name, 🔄 Change.
   Friendship hearts only ever go up: no hunger, nothing sad, nothing lost. New tricks at PET_TRICKS[].at hearts.
   The pet never earns coins. Saved in p.pet {kind, acc, names{kind:name}, hearts{kind:n}};
   accessories are owned as 'petacc:<id>'. Pet kinds and accessory ids are saved: never rename them.
   ========================================================= */
const PET_TREAT=2, PET_TREAT_HEARTS=3, PET_WAIT=2500; // a heart per pat, at most one every PET_WAIT ms
const PET_SPOT={x:566,y:694}; // in front, by Fuzzy's right foot (Fuzzy: x 420-580, feet at y 604), clear of the trophies' spots
const PET_TRICKS=[
  {id:'wiggle',at:0,name:'Wiggle',icon:'〰️'},
  {id:'spin',at:10,name:'Spin',icon:'🌀'},
  {id:'hop',at:30,name:'Hop',icon:'⬆️'},
  {id:'flip',at:60,name:'Flip',icon:'🤸'},
  {id:'dance',at:100,name:'Dance',icon:'💃'}
];
const petLine='stroke="#2b2235" stroke-width="3" stroke-linejoin="round"';
const petEyes=(y,dx)=>[-dx,dx].map(x=>`<circle cx="${x}" cy="${y}" r="4" fill="#2a1f33"/><circle cx="${x+1.3}" cy="${y-1.4}" r="1.4" fill="#fff"/>`).join('');
const petBlush=(y,dx)=>[-dx,dx].map(x=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="#ff8fb8" opacity=".6"/>`).join('');
// Each pet draws bottom-center at (0,0), about 100 wide and 90 tall. hat = where a hat/bow sits; neck = collar/scarf (y, width).
const PETS={
  bat:{name:'Tiny Bat',def:'Nibbles',hat:{x:0,y:-60},neck:{y:-20,w:40},d:()=>
    `<path d="M-24 -42 Q-54 -62 -54 -30 Q-46 -34 -42 -26 Q-36 -32 -26 -22Z M24 -42 Q54 -62 54 -30 Q46 -34 42 -26 Q36 -32 26 -22Z" fill="#3b2f52" ${petLine}/>`
    +`<path d="M-17 -54 L-22 -78 L-5 -60Z M17 -54 L22 -78 L5 -60Z" fill="#4a3b66" ${petLine}/><path d="M-15 -60 L-18 -72 L-9 -62Z M15 -60 L18 -72 L9 -62Z" fill="#ff8fb8"/>`
    +`<ellipse cx="0" cy="-32" rx="29" ry="28" fill="#4a3b66" ${petLine}/><ellipse cx="0" cy="-24" rx="16" ry="13" fill="#6b5a8c"/>`
    +`<path d="M-20 -52 q4 -6 8 -2 M4 -56 q5 -4 9 0" stroke="#6b5a8c" stroke-width="3" fill="none" stroke-linecap="round"/>`
    +`<circle cx="-10" cy="-38" r="7" fill="#fff"/><circle cx="10" cy="-38" r="7" fill="#fff"/>`+petEyes(-37,10)
    +petBlush(-28,18)+`<path d="M-5 -28 q2.5 3 5 0 q2.5 3 5 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M2 -27 l2 4 2 -4Z" fill="#fff"/>`
    +`<path d="M-10 -4 v4 M10 -4 v4" stroke="#2b2235" stroke-width="4" stroke-linecap="round"/>`},
  ghostCat:{name:'Ghost Kitten',def:'Misty',hat:{x:0,y:-70},neck:{y:-30,w:50},d:()=>
    `<path d="M-26 -60 L-28 -86 L-8 -70Z M26 -60 L28 -86 L8 -70Z" fill="#f7f3ff" stroke="#8a7aa8" stroke-width="3" stroke-linejoin="round"/><path d="M-23 -66 L-24 -78 L-14 -70Z M23 -66 L24 -78 L14 -70Z" fill="#ffc1dc"/>`
    +`<path d="M-30 0 V-40 Q-30 -72 0 -72 Q30 -72 30 -40 V0 Q22 -9 15 0 Q7.5 -9 0 0 Q-7.5 -9 -15 0 Q-22 -9 -30 0Z" fill="#f7f3ff" fill-opacity=".93" stroke="#8a7aa8" stroke-width="3" stroke-linejoin="round"/>`
    +petEyes(-46,11)+petBlush(-36,19)+`<path d="M-2.5 -40 h5 l-2.5 3Z" fill="#ff8fb8"/><path d="M-5 -35 q2.5 3 5 0 q2.5 3 5 0" stroke="#2a1f33" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
    +`<path d="M-14 -40 h-12 M-14 -37 l-11 3 M14 -40 h12 M14 -37 l11 3" stroke="#b7a9cf" stroke-width="1.5"/>`},
  cloudPup:{name:'Cloud Puppy',def:'Puff',hat:{x:0,y:-80},neck:{y:-38,w:34},d:()=>
    `<circle cx="40" cy="-26" r="9" fill="#eef6ff" stroke="#8fb3e0" stroke-width="3"/>`
    +`<path d="M-36 -10 Q-48 -30 -28 -40 Q-24 -56 0 -52 Q24 -56 28 -40 Q48 -30 36 -10 Q30 2 0 0 Q-30 2 -36 -10Z" fill="#eef6ff" stroke="#8fb3e0" stroke-width="3" stroke-linejoin="round"/>`
    +[-24,-9,9,24].map(x=>`<rect x="${x-5}" y="-8" width="10" height="9" rx="4" fill="#d6e7fb" stroke="#8fb3e0" stroke-width="2"/>`).join('')
    +`<circle cx="0" cy="-58" r="22" fill="#eef6ff" stroke="#8fb3e0" stroke-width="3"/>`
    +`<ellipse cx="-22" cy="-54" rx="8" ry="16" fill="#b9d4f5" stroke="#8fb3e0" stroke-width="2.5" transform="rotate(20 -22 -54)"/><ellipse cx="22" cy="-54" rx="8" ry="16" fill="#b9d4f5" stroke="#8fb3e0" stroke-width="2.5" transform="rotate(-20 22 -54)"/>`
    +petEyes(-61,8)+petBlush(-52,14)+`<ellipse cx="0" cy="-53" rx="4.5" ry="3.2" fill="#2a1f33"/><path d="M-4 -48 q4 3 8 0" stroke="#2a1f33" stroke-width="1.8" fill="none"/><path d="M1 -47 q2 7 5 0Z" fill="#ff8fb8"/>`},
  starHam:{name:'Star Hamster',def:'Twinkle',hat:{x:0,y:-60},neck:{y:-17,w:46},d:()=>
    `<circle cx="-20" cy="-55" r="9" fill="#ffc98a" stroke="#c98a3e" stroke-width="3"/><circle cx="20" cy="-55" r="9" fill="#ffc98a" stroke="#c98a3e" stroke-width="3"/><circle cx="-20" cy="-55" r="4.5" fill="#ffb3c8"/><circle cx="20" cy="-55" r="4.5" fill="#ffb3c8"/>`
    +`<ellipse cx="0" cy="-30" rx="32" ry="30" fill="#ffd9a0" stroke="#c98a3e" stroke-width="3"/><ellipse cx="0" cy="-20" rx="20" ry="16" fill="#fff3dd"/>`
    +`<path d="${starPath(0,-50,7)}" fill="#ffd166" stroke="#c98a3e" stroke-width="1.5"/>`
    +petEyes(-37,11)+`<circle cx="-21" cy="-28" r="7" fill="#ff9fb8" opacity=".5"/><circle cx="21" cy="-28" r="7" fill="#ff9fb8" opacity=".5"/>`
    +`<ellipse cx="0" cy="-31" rx="2.5" ry="2" fill="#ff7fa0"/><path d="M-4 -27 q2 2.5 4 0 q2 2.5 4 0" stroke="#2a1f33" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
    +`<ellipse cx="-9" cy="-14" rx="5" ry="4" fill="#ffc98a" stroke="#c98a3e" stroke-width="2"/><ellipse cx="9" cy="-14" rx="5" ry="4" fill="#ffc98a" stroke="#c98a3e" stroke-width="2"/>`}
};
// Accessories: one at a time, shared by every pet. hat(x,y) or neck(y,w) is filled in from the pet's own spots.
const PET_ACC={
  bow:{name:'Pink Bow',price:5,icon:'🎀',d:P=>{const {x,y}=P.hat, bx=x+14, by=y+6;return `<path d="M${bx} ${by} l-13 -9 v18Z M${bx} ${by} l13 -9 v18Z" fill="#ff8cc6" ${petLine}/><circle cx="${bx}" cy="${by}" r="4.5" fill="#ff4fa3" stroke="#2b2235" stroke-width="2"/>`;}},
  starCollar:{name:'Star Collar',price:8,icon:'⭐',d:P=>{const {y,w}=P.neck;return `<rect x="${-w/2}" y="${y-3}" width="${w}" height="7" rx="3.5" fill="#a97cff" stroke="#2b2235" stroke-width="2"/><path d="${starPath(0,y+10,7)}" fill="#ffd166" stroke="#2b2235" stroke-width="1.5"/>`;}},
  scarf:{name:'Cozy Scarf',price:10,icon:'🧣',d:P=>{const {y,w}=P.neck;return `<rect x="${-w/2-2}" y="${y-4}" width="${w+4}" height="10" rx="5" fill="#ff8cc6" stroke="#2b2235" stroke-width="2"/><path d="M${w/2-12} ${y+4} l4 18 h9 l-3 -18Z" fill="#ff8cc6" stroke="#2b2235" stroke-width="2"/><path d="M${-w/2+6} ${y-3} v8 M${-w/2+16} ${y-3} v8 M${w/2-4} ${y+10} h8" stroke="#fff" stroke-width="2.5"/>`;}},
  witchHat:{name:'Tiny Witch Hat',price:12,icon:'🧙',d:P=>{const {x,y}=P.hat;return `<ellipse cx="${x}" cy="${y+2}" rx="22" ry="5.5" fill="#3b2f52" ${petLine}/><path d="M${x-13} ${y} Q${x-4} ${y-20} ${x+6} ${y-32} Q${x+4} ${y-14} ${x+13} ${y}Z" fill="#3b2f52" ${petLine}/><rect x="${x-12}" y="${y-6}" width="24" height="5" fill="#a97cff"/><path d="${starPath(x+1,y-15,4)}" fill="#ffd166"/>`;}},
  crown:{name:'Little Crown',price:15,icon:'👑',d:P=>{const {x,y}=P.hat;return `<path d="M${x-14} ${y+2} V${y-12} L${x-7} ${y-4} L${x} ${y-16} L${x+7} ${y-4} L${x+14} ${y-12} V${y+2}Z" fill="#ffd166" ${petLine}/><circle cx="${x}" cy="${y-3}" r="3" fill="#ff4fa3"/><circle cx="${x-8}" cy="${y-2}" r="2" fill="#8ff0d0"/><circle cx="${x+8}" cy="${y-2}" r="2" fill="#8ff0d0"/>`;}}
};

/* ---------- reading the save (normalize() in section 6 only checks the types) ---------- */
const petKind=p=>PETS[p.pet.kind]?p.pet.kind:'';
const petName=(p,k)=>{k=k||petKind(p);return (k&&p.pet.names[k])||(k?PETS[k].def:'');};
const petHearts=(p,k)=>Number(p.pet.hearts[k||petKind(p)])||0;
const petAcc=p=>PET_ACC[p.pet.acc]&&p.owned.includes('petacc:'+p.pet.acc)?p.pet.acc:'none';
const petKnows=h=>PET_TRICKS.filter(t=>h>=t.at);
const petNext=h=>PET_TRICKS.find(t=>h<t.at);

/* ---------- drawing ---------- */
function petArt(kind,acc){const P=PETS[kind]; if(!P) return '';
  const A=PET_ACC[acc]; return P.d()+(A?A.d(P):'');}
function petBed(){return `<ellipse cx="0" cy="-2" rx="52" ry="10" fill="#00000030"/><ellipse cx="0" cy="-12" rx="50" ry="17" fill="#a97cff" stroke="#2b2235" stroke-width="3.5"/>`
  +`<ellipse cx="0" cy="-15" rx="38" ry="10" fill="#ffc1dc"/><path d="${heartPath(-34,-12,3.5)} ${heartPath(34,-12,3.5)} ${heartPath(0,-1,3.5)}" fill="#fff" opacity=".85"/>`;}
// The room calls this (section 9) for both rooms. Before she has a pet, the bed has a little "?" bubble.
function petG(p){
  const k=petKind(p);
  const inner=k?`<g class="pet-bob"><g transform="translate(0 -8)"><g id="petBody" class="pet-body">${petArt(k,petAcc(p))}</g></g></g>`
    :`<g class="pet-ask"><circle cx="0" cy="-56" r="20" fill="#fff" stroke="#2b2235" stroke-width="3"/><text x="0" y="-48" text-anchor="middle" font-size="22">🐾</text><text x="22" y="-66" font-size="18" font-weight="900" fill="#ff4fa3">?</text></g>`;
  return `<g id="petG" class="hot pet" data-hot="pet" transform="translate(${PET_SPOT.x} ${PET_SPOT.y})"><rect x="-55" y="-95" width="110" height="100" fill="transparent"/>${petHomeArt(p)}${inner}</g>`;
}

/* ---------- playing ---------- */
let PET={last:0};
// In the room, pet news goes in Fuzzy's speech bubble (a toast at the bottom would cover the pet).
const petSay=msg=>{if(cur==='room')say(msg);else toast(msg);};
function petTap(){SFX.click(); if(!petKind(P())) petChoose(); else petMenu();}
function petDo(trick){const b=$('#petBody'); if(!b) return;
  PET_TRICKS.forEach(t=>b.classList.remove('t-'+t.id)); void b.getBoundingClientRect(); b.classList.add('t-'+trick);
  clearTimeout(petDo.t); petDo.t=setTimeout(()=>b.classList.remove('t-'+trick),1300);}
function petHeartsFloat(n){
  for(let i=0;i<n;i++){const x=PET_SPOT.x+(i-(n-1)/2)*22, y=PET_SPOT.y-90;
    roomSvg.insertAdjacentHTML('beforeend',`<path class="pet-heart" style="animation-delay:${i*0.12}s" d="${heartPath(x,y,9)}" fill="#ff4fa3" stroke="#fff" stroke-width="2"/>`);}
  setTimeout(()=>$$('#roomSvg .pet-heart').forEach(e=>e.remove()),1500);
}
// Gives hearts and says so when a new trick is learned. Returns the trick to show.
function petGive(p,n){
  const k=petKind(p), before=petHearts(p), after=before+n; p.pet.hearts[k]=after; save();
  const learned=PET_TRICKS.find(t=>before<t.at&&after>=t.at);
  if(learned) setTimeout(()=>petSay(`🎉 New trick: ${learned.icon} ${learned.name}!`),700);
  return learned;
}
function petPat(){
  const p=P(); if(!petKind(p)) return; closeModal();
  const now=Date.now(), gets=now-PET.last>=PET_WAIT; let learned=null;
  if(gets){PET.last=now; learned=petGive(p,1); petHeartsFloat(1);}
  const knows=petKnows(petHearts(p));
  petDo(learned?learned.id:knows[Math.floor(Math.random()*knows.length)].id); SFX.happy(); vibrate(10);
}
function petTreat(){
  const p=P(); if(!petKind(p)) return;
  buyConsumable(PET_TREAT,'a treat 🍪',()=>{
    roomSvg.insertAdjacentHTML('beforeend',`<text class="pet-cookie" x="${PET_SPOT.x-30}" y="${PET_SPOT.y-40}" font-size="30">🍪</text>`);
    setTimeout(()=>$$('#roomSvg .pet-cookie').forEach(e=>e.remove()),1000);
    const learned=petGive(p,PET_TREAT_HEARTS); petHeartsFloat(PET_TREAT_HEARTS);
    setTimeout(()=>petDo(learned?learned.id:'hop'),500); SFX.happy();
  });
}

/* ---------- popups ---------- */
function petMenu(){
  const p=P(), k=petKind(p), h=petHearts(p), nx=petNext(h);
  modal(`🐾 ${esc(petName(p))}`,`<div class="pet-card"><svg class="pet-big" viewBox="-62 -104 124 110">${petArt(k,petAcc(p))}</svg>`
    +`<div class="pet-info"><div class="pet-h">❤️ ${h}</div><div class="pet-sub">${nx?`New trick at ❤️ ${nx.at}`:'Knows every trick! 🌟'}</div>`
    +`<div class="pet-tricks">${PET_TRICKS.map(t=>`<span class="${h>=t.at?'on':''}" title="${t.name}">${h>=t.at?t.icon:'🔒'}<small>${t.name}</small></span>`).join('')}</div></div></div>`
    +`<div class="pet-play"><button class="btn pp-go" data-pa="hide">🙈 Hide &amp; Seek</button><button class="btn pp-go" data-pa="fetch">🎾 Fetch</button><button class="btn pp-go" data-pa="walk">🦮 Walk</button></div>`
    +`<div class="pet-acts"><button class="btn pink" data-pa="pat">🤚 Pet</button><button class="btn" data-pa="treat">🍪 Treat <small>🪙${PET_TREAT}</small></button>`
    +`<button class="btn ghost" data-pa="dress">🎀 Dress</button><button class="btn ghost" data-pa="home">🏠 Home</button><button class="btn ghost" data-pa="name">✏️ Name</button><button class="btn ghost" data-pa="change">🔄 Change</button></div>`,
    [{text:'Close',cls:'ghost'}]);
  $$('#modalBody [data-pa]').forEach(b=>b.onclick=()=>{SFX.click();({hide:()=>ppStart('hide'),fetch:()=>ppStart('fetch'),walk:wkOpen,pat:petPat,treat:petTreat,dress:petDress,home:petHomes,name:petRename,change:petChoose})[b.dataset.pa]();});
}
function petChoose(){
  const p=P(), k=petKind(p);
  modal(k?'🔄 Change pet':'🐾 Pick a pet!',`<div class="pet-pick">${Object.entries(PETS).map(([id,P1])=>`<button class="tile${id===k?' on':''}" data-pet="${id}"><div class="tv"><svg viewBox="-62 -104 124 110">${petArt(id,'none')}</svg></div><div class="tn">${esc(petName(p,id))}</div><div class="pet-ts">${P1.name}${petHearts(p,id)?` · ❤️ ${petHearts(p,id)}`:''}</div></button>`).join('')}</div>`
    +`<div style="text-align:center">${k?'Your pets keep their hearts when you switch.':'They are all free! You can switch any time.'}</div>`,[{text:k?'Close':'Later',cls:'ghost'}]);
  $$('#modalBody [data-pet]').forEach(b=>b.onclick=()=>petPick(b.dataset.pet));
}
function petPick(id){
  const p=P(); if(!PETS[id]) return; const first=!petKind(p);
  p.pet.kind=id; if(!(id in p.pet.hearts)) p.pet.hearts[id]=0; save(); closeModal(); SFX.buy();
  if(cur==='room') renderRoom();
  setTimeout(()=>{petDo('hop');petHeartsFloat(1);},60);
  petSay(first?`Say hi to ${petName(p)}! 🐾`:`${petName(p)} is here! 🐾`);
}
function petDress(){
  const p=P(), k=petKind(p), on=petAcc(p);
  const tile=(id,A)=>{const own=id==='none'||p.owned.includes('petacc:'+id);
    return `<button class="tile${id===on?' on':''}${own?'':' locked'}${poorCls(p,own,A?A.price:0)}" data-acc="${id}"><div class="tv"><svg viewBox="-62 -104 124 110">${petArt(k,id)}</svg></div><div class="tn">${A?A.name:'Nothing'}</div>${own?'':priceTag(p,A.price)}</button>`;};
  modal('🎀 Dress-up',`<div class="pet-pick">${tile('none')}${easySort(Object.entries(PET_ACC),([id,A])=>p.owned.includes('petacc:'+id)?0:A.price).map(([id,A])=>tile(id,A)).join('')}</div>`,[{text:'Done',cls:'pink'}]);
  $$('#modalBody [data-acc]').forEach(b=>b.onclick=()=>petWear(b.dataset.acc));
}
function petWear(id){
  const p=P(), A=PET_ACC[id];
  const wear=()=>{p.pet.acc=id; save(); if(cur==='room') renderRoom(); SFX.click(); petDress();};
  if(id==='none'||!A){p.pet.acc='none'; save(); if(cur==='room') renderRoom(); petDress(); return;}
  tryBuy('petacc:'+id,A.price,A.name,wear);
}
function petRename(){
  const p=P(), k=petKind(p);
  modal(`✏️ Name your ${PETS[k].name.toLowerCase()}`,`<input id="rnName" class="inp" maxlength="12" value="${esc(petName(p))}" autocomplete="off">`,
    [{text:'Cancel',cls:'ghost'},{text:'Save',cls:'pink',on:()=>{const n=$('#rnName').value.trim(); if(n){p.pet.names[k]=n; save();} petMenu();}}]);
}

/* ---------- stickers for the pet (Room & Style page, section 21) ---------- */
const petBest=p=>Math.max(0,...Object.values(p.pet.hearts).map(n=>Number(n)||0));
STICKERS.push(
  stk('pet1','room','🐾','New Friend','heart','Pick a pet (tap the pet bed by your buddy)',1,p=>petKind(p)?1:0),
  stk('petLove','room','💞','Best Buddies','heart','Get 30 hearts with one pet',30,petBest),
  stk('petTricks','room','🎪','Trick Star','star','Teach a pet every trick (100 hearts)',100,petBest),
  stk('petDress','room','🎀','Pet Stylist','scallop','Get something for your pet to wear',1,p=>p.owned.some(k=>String(k).startsWith('petacc:'))?1:0)
);
