'use strict';
/* =========================================================
   9. SCREENS
   ========================================================= */
let cur='profiles';
function show(n){
  n=lockGuard(n); // 🧸 Little mode keeps her in the safe screens (section 66)
  if(n!=='room'&&decorating) exitDecorate(true);
  if(n!=='room'&&SPY.on) spyEnd(true); // 🔍 (section 50)
  if(n!=='room'&&PP.on) ppEnd(true); // 🙈🎾 pet play (section 55)
  cur=n; $$('.screen').forEach(s=>s.classList.toggle('on',s.id==='scr-'+n));
  const ep=n==='profiles'?null:P(); applyEasy(); applyLock();
  if(ep&&(ep.easy||lockOn())){if(n==='soccer'){ep.soccer.level='easy';ep.soccer.keep.level='easy';}if(n==='ball'){ep.ball.bat.level='easy';ep.ball.catch.level='easy';}if(n==='stage')ep.stage.level='easy';if(n==='code')ep.code.level='easy';if(n==='brain')Object.keys(ep.brain.level).forEach(g=>{ep.brain.level[g]='easy';});} // Easy mode opens games on Easy
  if(n==='room'||n==='cards') checkBonus(); // gives any milestone cards she has earned (section 12)
  if(n==='room'||n==='soccer'){const t=giveTrophies();if(t.length)setTimeout(()=>toast(`🏆 ${t.join(' and ')} added to your room!`),400); // section 13
    const gl=giveGloves();if(gl.length)setTimeout(()=>toast(`🧤 ${gl.join(' and ')} added to your Backyard!`),t.length?2400:400);} // section 27
  if(n==='profiles') renderProfiles();
  setTimeout(spkCheck,0); // 🗣️ say what to do here (section 65)
  if(n==='room') renderRoom();
  if(n==='closet') renderCloset();
  if(n==='fidget') setFidTab(fidTab);
  if(n==='art') renderArt();
  if(n==='cards') renderCards();
  if(n!=='soccer') TGS.on=false; if(n!=='stage') TGT.on=false; // 👯 (section 43)
  if(n==='soccer') renderSoccer();
  if(n==='room'||n==='stage'){if(giveMic())setTimeout(()=>toast('🎤 The Golden Mic is in your room!'),400);} // section 14
  if(n==='stage') renderStage(); else stgStop();
  if(n==='code') renderCode(); else codeStop(); // section 18
  if(n==='brain') renderBrain(); else brStop(); // section 28
  if(n==='music') renderMusic(); else muStop(); // section 40
  if(n==='little') renderLittle(); else ltStop(); // 🧸 Play (section 46)
  if(n==='dance') renderDance(); else dnStop(); // 💃 Dance Maker (section 48)
  if(n==='garden') renderGarden(); // 🌱 Garden (section 49)
  if(n==='ball') renderBall(); else bfStop(); // ⚾ Ball Field (section 59)
  if(n==='runway') renderRunway(); else rwStop(); // 👠 Runway (section 52)
  if(n==='walk') renderWalk(); else wkStop(); // 🦮 Pet walks (section 56)
  if(n==='stickers') renderStickers(); // section 21
  if(n==='about') renderAbout(); // section 25
  if(n==='room') stkDot();
  if(n!=='profiles') setTimeout(checkStickers,400); // new stickers (section 21)
  updateCoins();
  if(typeof wakeLoop==='function') wakeLoop(); // the main loop runs only on game screens (section 99, v1.32)
}

/* ---------- profiles ---------- */
function renderProfiles(){
  $('#profHero').innerHTML=profHeroSVG();
  $('#profList').innerHTML=DB.profiles.map(p=>{const c=ROOM_COLORS[p.color];
    return `<div class="pcard" data-id="${p.id}" style="border-color:${c};background:linear-gradient(${c}66,var(--panel) 65%)"><div class="pbadge">${p.badge}</div><div class="pm">${mascotSVG(p.look,'10 0 180 270')}</div><div class="pn">${esc(p.name)}</div><div class="pc">🪙 ${p.coins}${bandOf(p)!=='normal'?` <span class="ptag">· ${BANDS[bandOf(p)].icon} ${BANDS[bandOf(p)].name}</span>`:''}</div><div class="pa"><button class="btn small ghost" data-act="edit">✏️</button><button class="btn small ghost" data-act="del">🗑️</button></div></div>`;}).join('')||'<div class="empty">No rooms yet — make one to start! 💜</div>';
  $('#newProfBtn').classList.toggle('hidden',DB.profiles.length>=6);
  bkNag(); // the grown-up's 30-day backup line (section 64)
}
$('#profList').addEventListener('click',e=>{
  const c=e.target.closest('.pcard'); if(!c) return;
  const p=DB.profiles.find(x=>x.id===c.dataset.id); if(!p) return;
  const act=e.target.closest('[data-act]');
  if(act){ SFX.click(); askPin(()=>act.dataset.act==='edit'?roomModal(p):delModal(p)); return; }
  DB.activeId=p.id; save(); SFX.happy(); enterRoom();
});
$('#newProfBtn').onclick=()=>askPin(()=>roomModal(null));
// Make a new room (p = null) or change a room's name, color, badge and level (v1.69).
// The first-time setup (section 64) passes then(q) to run after a new room is made, and back for Cancel.
function roomModal(p,then,back){
  const used=DB.profiles.map(x=>x.color), free=Object.keys(ROOM_COLORS).find(k=>!used.includes(k));
  let fur='white', start='emo', tint=p?p.tint:true, color=p?p.color:(free||'purple'), badge=p?p.badge:ROOM_BADGES[0], band=p?bandOf(p):'normal';
  modal(p?'✏️ Change Room':'✨ New Room ✨',`<input id="npName" class="inp" maxlength="16" placeholder="Your name" autocomplete="off" value="${p?esc(p.name):''}">`
    +(p?'':`<div class="pick-lbl">Pick a buddy</div><div class="startpick" id="npStart">${starterRow(start)}</div>`
      +`<div class="pick-lbl">Fur</div><div class="furpick" id="npFur">${Object.entries(FUR).filter(([k,v])=>!v.price).map(([k,v])=>`<button data-fur="${k}" style="background:${v.c}" class="${k===fur?'on':''}" title="${v.name}"></button>`).join('')}</div>`)
    +`<div class="pick-lbl">Room color</div><div class="furpick" id="npCol">${Object.entries(ROOM_COLORS).map(([k,c])=>`<button data-col="${k}" style="background:${c}" class="${k===color?'on':''}"></button>`).join('')}</div>`
    +`<div class="pick-lbl">Badge</div><div class="badgepick" id="npBadge">${ROOM_BADGES.map(b=>`<button data-badge="${b}" class="${b===badge?'on':''}">${b}</button>`).join('')}</div>`
    +`<div class="pick-lbl">Level</div>${bandPick('npBand',band)}`
    +`<button class="btn small ghost tintbtn" id="npTint">🎨 Color the buttons too: <b>${tint?'ON':'OFF'}</b></button>`,
    [{text:'Cancel',cls:'ghost',on:back},{text:p?'Save':'Make it!',cls:'pink',keep:true,on:()=>{
      const n=$('#npName').value.trim(); if(!n){toast('Type a name first!');return;}
      closeModal();
      if(p){p.name=n;p.color=color;p.badge=badge;p.tint=tint;setBand(p,band);save();SFX.happy();renderProfiles();return;}
      const q=newProfile(n,fur,color,badge,starterLook(start,fur)); q.tint=tint; giveStarter(q); roomStart(q); setBand(q,band);
      if(!DB.settings.setupDone) DB.settings.setupDone=Date.now(); // the device's first room: setup counts as done (section 64)
      DB.profiles.push(q); DB.activeId=q.id; save(); SFX.buy(); enterRoom(); if(then) then(q);
    }}]);
  const pick=(sel,attr,set)=>{const row=$(sel);if(row)row.onclick=e=>{const b=e.target.closest(`[data-${attr}]`);if(!b)return;set(b.dataset[attr]);$$(sel+' button').forEach(x=>x.classList.toggle('on',x===b));SFX.click();};};
  // Picking a buddy also picks its fur; picking a fur shows every buddy in it.
  pick('#npStart','start',v=>{start=v;fur=STARTERS[v].fur;$$('#npFur button').forEach(x=>x.classList.toggle('on',x.dataset.fur===fur));});
  pick('#npFur','fur',v=>{fur=v;$('#npStart').innerHTML=starterRow(start,fur);});
  pick('#npCol','col',v=>color=v); pick('#npBadge','badge',v=>badge=v);
  bandWire('npBand',v=>band=v);
  $('#npTint').onclick=()=>{tint=!tint;$('#npTint b').textContent=tint?'ON':'OFF';SFX.click();};
  if(!p) setTimeout(()=>{const i=$('#npName');if(i)i.focus();},60);
}
function renameModal(p,field,title){
  modal(title,`<input id="rnName" class="inp" maxlength="16" value="${esc(p[field])}" autocomplete="off">`,[{text:'Cancel',cls:'ghost'},{text:'Save',cls:'pink',on:()=>{const n=$('#rnName').value.trim();if(n){p[field]=n;save();}if(cur==='profiles')renderProfiles();if(cur==='closet')renderCloset();if(cur==='room')renderRoom();}}]);
}
function delModal(p){
  modal('Delete this room?',`${esc(p.name)}'s room, coins, outfits, decorations, drawings and photocards will be gone forever.`,[{text:'Keep it',cls:'pink'},{text:'Delete',cls:'ghost',on:()=>{
    DB.profiles=DB.profiles.filter(x=>x.id!==p.id);if(DB.activeId===p.id)DB.activeId=null;save();renderProfiles();
    if(ART.owner===p.id) ART.owner=null;
    ArtStore.delWhere(r=>r.profileId===p.id).catch(()=>{});}}]);
}
function enterRoom(){
  const p=P(); if(!p) return; roomNo=1; show('room'); loadArtThumbs();
  const today=new Date().toDateString();
  if(p.lastDaily!==today){p.lastDaily=today;p.stats.dailies++;save();setTimeout(()=>{earn(10,'Daily gift!',innerWidth/2,innerHeight/2);toast('🎁 Daily gift! +10 coins');},600);}
  if(!p.seenTip){p.seenTip=true;save();setTimeout(()=>say(lockOn()?`Hi ${p.name}! Tap the desk, the shelf or the closet ✨`:`Hi ${p.name}! Tap the shelf, closet or desk ✨`),1200);}
}

/* ---------- room ---------- */
const roomSvg=$('#roomSvg');
let decorating=false,decoTab='mine',drag=null;
// Two rooms (v1.10): 1 = her room (p.room), 2 = the Cozy Loft (p.room2, drawn in 16-room2.js). Each has its own wall,
// floor and items; My Stuff (items with placed:false) is shared, so a stored thing can be placed in either room.
// Since v1.23 there is a third: 3 = the Backyard (p.room3, drawn in 26-backyard.js), and since v1.40 a fourth:
// 4 = the Studio (p.room4, bare, section 41). rooms(p) lists them all. Getting around: the edge tabs and 🗺️ map (section 41).
let roomNo=1;
const curRoom=p=>roomNo===4?p.room4:roomNo===3?p.room3:roomNo===2?p.room2:p.room;
const rooms=p=>[p.room,p.room2,p.room3,p.room4];
const allItems=p=>rooms(p).reduce((a,r)=>a.concat(r.items),[]);
const ROOM_NAMES={1:'Room',2:'Loft',3:'Backyard',4:'Studio'};
function goRoom(n){if(lockOn()&&!LOCK_ROOMS.includes(n))n=1;roomNo=n;drag=null;SFX.whoosh();if(n===4)studioStart(P());renderRoom();if(decorating)renderDecoGrid();else if(n===4)studioHi();}
function mascotG(p){return `<g id="mascotG" class="mascot"><ellipse cx="500" cy="604" rx="62" ry="12" fill="#00000030"/>${mascotSVG(p.look,null,'x="420" y="396" width="160" height="216"')}</g>`;}
function renderRoom(){
  const p=P(); if(!p) return;
  const R=curRoom(p), W=WALLS[R.wall]||WALLS.lavender, F=FLOORS[R.floor]||FLOORS.wood;
  let s=roomNo===3?yardBack(R):`<rect width="1000" height="470" fill="${W.fill}"/><rect width="1000" height="470" fill="url(#${W.pat})"/>`; // the Backyard: sky + fence (section 26)
  const G=roomNo===3?FLOORS[yardFloor(R)]:F;
  s+=`<rect y="470" width="1000" height="230" fill="${G.fill}"/><rect y="470" width="1000" height="230" fill="url(#${G.pat})"/><rect y="458" width="1000" height="16" fill="#00000026"/>`;
  const fur=roomNo===4?studioFurniture(true):roomNo===3?yardFurniture(true):roomNo===2?loftFurniture(true):furniture(true);
  s+=fur.wall; // windows, shelves and signs on the wall; furniture standing on the floor is sorted below (v1.39)
  s+=nightBack(p); // 🌙 the night window, behind the room's things (section 31, v1.32)
  const items=R.items.filter(i=>i.placed&&DECOR[i.type]);
  const deco=i=>`<g class="deco" data-uid="${i.uid}" transform="translate(${Math.round(i.x)} ${Math.round(i.y)})">${DECOR[i.type].d(i)}</g>`;
  s+=items.filter(i=>DECOR[i.type].flat).map(deco).join('');
  // Wall things (posters, shelves…) are drawn behind everything that stands, so things on a shelf show in front of it.
  // Rugs and wall things are drawn in list order, and the one touched last moves to the end (toFront, v1.31).
  s+=items.filter(i=>DECOR[i.type].wall&&!DECOR[i.type].flat).map(deco).join('');
  // Things standing on the floor, the room's own furniture, the buddy, the pet bed (section 22) and wrapped gifts (section 32)
  // are drawn back to front by how far forward they stand (y), so whatever is lower on the floor is in front (v1.39).
  // Equal y keeps list order (sort is stable), so the one touched last is in front. While decorating, .fixed fades.
  const fx=h=>`<g class="fixed">${h}</g>`;
  s+=items.filter(i=>!DECOR[i.type].flat&&!DECOR[i.type].wall).map(i=>({y:rideY(i,items),h:deco(i)}))
    .concat(fur.floor.map(f=>({y:f.y,h:fx(f.h)})),[{y:604,h:fx(mascotG(p))},{y:PET_SPOT.y,h:fx(petG(p))},{y:GIFT_SPOT.y,h:fx(giftG(p))},{y:VISIT_SPOT.y,h:fx(visitG(p))}])
    .sort((a,b)=>a.y-b.y).map(e=>e.h).join('');
  s+=nightLayer(p,R); // 🌙 night mode (section 31, v1.27)
  s+=spyDark(p,R); // 🔦 I Spy in the dark (section 50, v1.49)
  roomSvg.innerHTML=s; emoteBar(false); nightBtn();
  roomSvg.classList.toggle('decorating',decorating);
  $('#roomTitle').textContent=`${p.name}'s ${ROOM_NAMES[roomNo]}`;
  roomTabs(); // the arrow tabs to the next rooms (section 41, v1.40)
  updateCoins();
  if(PP.on) ppRedraw(); // 🙈🎾 a pet game keeps going after a redraw (section 55, v1.54)
}
function say(text){
  tell(text); // read aloud when 🔊 Read to me is on (section 65)
  const old=$('#bubble'); if(old) old.remove();
  const w=Math.max(120,Math.round(text.length*11+40)), x=500-w/2;
  roomSvg.insertAdjacentHTML('beforeend',`<g id="bubble" style="pointer-events:none"><rect x="${x}" y="318" width="${w}" height="52" rx="26" fill="#fff" stroke="#2b2235" stroke-width="4"/><path d="M488 368 L500 392 L514 368" fill="#fff" stroke="#2b2235" stroke-width="4" stroke-linejoin="round"/><rect x="484" y="362" width="34" height="8" fill="#fff"/><text x="500" y="352" text-anchor="middle" font-size="22" font-weight="800" fill="#2b2235">${esc(text)}</text></g>`);
  clearTimeout(say.t); say.t=setTimeout(()=>{const b=$('#bubble');if(b)b.remove();},2600);
}
function mascotTap(){
  const g=$('#mascotG'); if(!g) return;
  g.classList.remove('hop'); void g.getBoundingClientRect(); g.classList.add('hop'); setTimeout(()=>g.classList.remove('hop'),650);
  SFX.happy(); vibrate(10); emoteBar(true); // the 4 emote buttons (section 31)
  const p=P(); const lines=[`Hi ${p.name}! 💜`,'Squish time? 🍡','Love your style ✨',`I'm ${p.mascotName}!`,`*happy ${(BUDDIES[p.look.kind]||BUDDIES.bunny).name.toLowerCase()} noises*`,"Let's play dress-up!",'Pop pop pop! 🫧',"You're the best!",'Fuzzy and cozy 🧦','Dance break! 💃','Stay spooky-cute 🦇'];
  say(lines[Math.floor(Math.random()*lines.length)]);
}
function handleHot(h){
  if(!lockHotOk(h)){lockWiggle(h);return;} // 🧸 Little mode: it only wiggles (section 66)
  if(h==='shelf'){SFX.click();show('fidget');}
  else if(h==='closet'){SFX.click();show('closet');}
  else if(h==='desk'){SFX.click();if(lockOn()){LT.view='menu';show('little');}else show('art');} // 🧸 Little mode: the desk is the way to Play (section 66)
  else if(h==='photo'){SFX.click();show('cards');}
  else if(h==='window'){goRoom(3);} // her window: a shortcut out to the Backyard (v1.40; it opened Soccer before)
  else if(h==='goal'){SFX.click();show('soccer');} // the Backyard's soccer goal (v1.23), the way to Soccer since v1.40
  else if(h==='stage'){SFX.click();show('stage');}
  else if(h==='code'){SFX.click();show('code');}
  else if(h==='brain'){SFX.click();show('brain');} // the Backyard's chalkboard (v1.25)
  else if(h==='garden'){SFX.click();show('garden');} // the Backyard's garden shed (v1.48)
  else if(h==='ballfield'){SFX.click();show('ball');} // the Backyard's bat rack: the ⚾ Ball Field (v1.60)
  else if(h==='music'){SFX.click();show('music');} // the Loft's keyboard (v1.38)
  else if(h==='pet'){petTap();} // section 22
  else if(h==='gift'){giftOpen();} // section 32
  else if(h==='visitor'){visitTap();} // a friend with a wish (section 42, v1.41)
  else {SFX.locked();toast(`🔒 ${LOCKED[h]} is coming in a future update!`);}
}
roomSvg.addEventListener('click',e=>{
  if(decorating) return;
  if(SPY.on){spyTap(e);return;} // 🔍 I Spy: taps look for the clue, nothing opens (section 50, v1.49)
  if(PP.on){ppTap(e);return;} // 🙈🎾 pet play: nothing opens while it is on (section 55, v1.54)
  const hot=e.target.closest('[data-hot]'); if(hot){handleHot(hot.dataset.hot);return;}
  if(e.target.closest('#mascotG')) mascotTap();
});
function toSvg(e){const pt=roomSvg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(roomSvg.getScreenCTM().inverse());}
roomSvg.addEventListener('pointerdown',e=>{
  if(!decorating) return;
  const g=e.target.closest('.deco'); if(!g) return;
  const it=curRoom(P()).items.find(i=>i.uid===g.dataset.uid); if(!it) return;
  const pt=toSvg(e); drag={it,g,dx:it.x-pt.x,dy:it.y-pt.y,riders:[]};
  try{roomSvg.setPointerCapture(e.pointerId);}catch(_){}
  g.classList.add('dragging'); roomSvg.appendChild(g); SFX.click(); e.preventDefault();
  const R=curRoom(P()), riders=DECOR[it.type].shelf?onShelf(it):[];
  toFront(R,it); riders.forEach(r=>toFront(R,r)); // the thing touched last sits in front (v1.31); riders stay on their shelf
  // a shelf takes the things sitting on it along
  drag.riders=riders.map(r=>{const rg=roomSvg.querySelector(`.deco[data-uid="${r.uid}"]`);if(rg)roomSvg.appendChild(rg);return {r,g:rg,dx:r.x-it.x,dy:r.y-it.y};});
});
roomSvg.addEventListener('pointermove',e=>{
  if(!drag) return;
  const pt=toSvg(e); drag.it.x=clamp(pt.x+drag.dx,30,970); drag.it.y=clamp(pt.y+drag.dy,90,700);
  drag.g.setAttribute('transform',`translate(${Math.round(drag.it.x)} ${Math.round(drag.it.y)})`);
  for(const R of drag.riders){R.r.x=drag.it.x+R.dx;R.r.y=drag.it.y+R.dy;if(R.g)R.g.setAttribute('transform',`translate(${Math.round(R.r.x)} ${Math.round(R.r.y)})`);}
  $('#decoPanel').classList.toggle('drop',e.clientY>$('#decoPanel').getBoundingClientRect().top);
});
function endDrag(e){
  if(!drag) return;
  if(e.clientY>$('#decoPanel').getBoundingClientRect().top){drag.it.placed=false;SFX.whoosh();toast('Put away in My Stuff 📦');}
  else if(snapToShelf(drag.it)) SFX.pop();
  const away=!drag.it.placed; drag=null; save(); $('#decoPanel').classList.remove('drop'); renderRoom();
  if(away||decoTab==='mine') renderDecoGrid(); // the Shop and the other tabs don't change when a thing moves (v1.32, speed)
}
roomSvg.addEventListener('pointerup',endDrag);
roomSvg.addEventListener('pointercancel',endDrag);
function toFront(R,it){const k=R.items.indexOf(it);if(k>=0)R.items.splice(k,1);R.items.push(it);} // drawn last = in front of its layer
// Shelves: the top of shelf s is at y = s.y - top, from s.x - w/2 to s.x + w/2. Nothing about it is saved.
const standing=i=>i.placed&&DECOR[i.type]&&!DECOR[i.type].wall&&!DECOR[i.type].flat;
function onShelf(s){const S=DECOR[s.type].shelf, top=s.y-S.top;
  return curRoom(P()).items.filter(i=>standing(i)&&Math.abs(i.y-top)<3&&Math.abs(i.x-s.x)<=S.w/2+4);}
// Where a standing thing is sorted front to back: on a standing shelf (a pedestal, v1.50) it goes just in front of the
// shelf instead of by its own y (which is higher up, so it would be drawn behind it).
function rideY(i,items){if(!standing(i)||DECOR[i.type].shelf) return i.y;
  for(const s of items){const S=s!==i&&standing(s)&&DECOR[s.type].shelf; if(S&&Math.abs(i.y-(s.y-S.top))<3&&Math.abs(i.x-s.x)<=S.w/2+4) return s.y+0.01;}
  return i.y;}
function snapToShelf(it){ // drop a standing thing near a shelf top and it sits on it
  if(!standing(it)||DECOR[it.type].shelf) return false; let best=null, bd=31; // a pedestal never sits on a shelf (v1.50)
  for(const s of curRoom(P()).items){const S=s!==it&&s.placed&&DECOR[s.type]&&DECOR[s.type].shelf; if(!S) continue;
    const d=Math.abs(it.y-(s.y-S.top)); if(d<bd&&Math.abs(it.x-s.x)<=S.w/2){bd=d;best=s;}}
  if(!best) return false; it.y=best.y-DECOR[best.type].shelf.top; return true;
}

function enterDecorate(){decorating=true;$('#decoPanel').classList.remove('hidden');$('#decoBtn').innerHTML='✔<span> Done</span>';renderRoom();renderDecoGrid();SFX.click();}
function exitDecorate(silent){decorating=false;drag=null;$('#decoPanel').classList.add('hidden');$('#decoBtn').innerHTML='🛋️<span> Decorate</span>';if(!silent)renderRoom();}
$('#decoBtn').onclick=()=>decorating?exitDecorate():enterDecorate();
$('#decoDone').onclick=()=>exitDecorate();
$('#decoTabs').onclick=e=>{const b=e.target.closest('[data-dt]');if(!b)return;decoTab=b.dataset.dt;SFX.click();renderDecoGrid();};
const decoPrev=k=>`<svg viewBox="${DECOR[k].box}">${DECOR[k].d()}</svg>`;
function renderDecoGrid(){
  const p=P(); if(!p) return;
  $$('#decoTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.dt===decoTab));
  let h='';
  if(decoTab==='mine'){
    const stored=allItems(p).filter(i=>!i.placed&&DECOR[i.type]), counts={};
    stored.filter(i=>!DECOR[i.type].art).forEach(i=>counts[i.type]=(counts[i.type]||0)+1);
    const keys=Object.keys(counts);
    // posters are each different, so they get one tile each
    h=stored.filter(i=>DECOR[i.type].art).map(i=>`<button class="tile" data-place-uid="${i.uid}"><div class="tv"><svg viewBox="${DECOR[i.type].box}">${DECOR[i.type].d(i)}</svg></div><div class="tn">${DECOR[i.type].name}</div></button>`).join('')
      +keys.map(k=>`<button class="tile" data-place="${k}"><div class="tv">${decoPrev(k)}</div><div class="tn">${DECOR[k].name}</div><div class="tp cnt">×${counts[k]}</div></button>`).join('');
    h=giveTile(p)+h; // 🎁 Give (section 32)
    if(h===giveTile(p)) h+=`<div class="empty">Nothing stored right now! Drag things from your room down here to put them away, or get new stuff in the Shop 🛍️</div>`;
  } else if(decoTab==='shop'){ // seasonal things (v1.17) have their own tab
    const yd=([k,d])=>d.first||roomNo===3&&d.yard?0:1; // the Backyard lists outdoor things first (v1.23); first:1 = always first (v1.40)
    const tf=themeFilter('shop',Object.entries(DECOR).filter(([k,d])=>!d.art&&!d.award&&!d.season).sort((a,b)=>yd(a)-yd(b)).map(([k,d])=>['decor:'+k,d])); // 🔎 theme chips + ⭐ dreams (section 33)
    h=dreamBar(p)+tf.chips+easySort(tf.list.map(([k,d])=>[k.slice(6),d]),([k,d])=>d.price).map(([k,d])=>`<button class="tile${d.dream?' dream':''}${poorCls(p,false,d.price)}" data-buy="${k}"><div class="tv">${decoPrev(k)}</div><div class="tn">${d.name}</div>${priceTag(p,d.price)}</button>`).join('');
  } else if(decoTab==='season'){
    h=seasonGrid(p); // section 20
  } else if(decoTab==='layouts'){
    h=layoutGrid(p); // 🏠 room layouts (section 32)
  } else if(decoTab==='colors'){
    h=furnGrid(p)||`<div class="empty">Nothing here is built in, so there is nothing to color. Everything in this room is yours to pick! ✨</div>`; // furniture colors (v1.20, section 23); the Studio has none
  } else {
    const isW=decoTab==='wall', L=isW?WALLS:FLOORS, curId=isW?curRoom(p).wall:curRoom(p).floor;
    // fences and grounds (yard:1) only in the Backyard, indoor walls and floors only indoors (v1.23)
    h=easySort(Object.entries(L).filter(([k,v])=>!v.yard===(roomNo!==3)),e=>surfOwned(p,isW,e[0],e[1])?0:e[1].price).map(([k,v])=>surfTile(p,isW,k,v,curId)).join('');
  }
  $('#decoGrid').innerHTML=h;
  seasonTab();
}
const surfOwned=(p,isW,k,v)=>!v.price||p.owned.includes((isW?'wall:':'floor:')+k);
function surfTile(p,isW,k,v,curId){const o=surfOwned(p,isW,k,v);
  return `<button class="tile ${k===curId?'on':''} ${o?'':'locked'}${poorCls(p,o,v.price)}" data-surf="${k}" data-kind="${isW?'wall':'floor'}"><div class="tv">${isW&&v.yard?ydTile(k):`<svg viewBox="0 0 300 200"><rect width="300" height="200" fill="${v.fill}"/><rect width="300" height="200" fill="url(#${v.pat})"/></svg>`}</div><div class="tn">${v.name}</div>${o?'':priceTag(p,v.price)}</button>`;}
// Posters go on the free bit of wall between the photocard board and the closet.
// Trophies each get their own clear spot on the floor, so they never hide behind Fuzzy (who stands at x 420-580).
const TROPHY_SPOTS={trophyBronze:{x:345,y:665},trophySilver:{x:655,y:680},trophyGold:{x:850,y:660},goldenMic:{x:180,y:688}};
// In the Loft, posters go on the wall left of the skylight instead.
function spot(type){if(TROPHY_SPOTS[type])return Object.assign({},TROPHY_SPOTS[type]);if(type==='poster')return roomNo===2?{x:170+Math.random()*12,y:230+Math.random()*12}:{x:686+Math.random()*12,y:200+Math.random()*12};return DECOR[type].wall?{x:380+Math.random()*240,y:roomNo===3?360+Math.random()*40:200+Math.random()*60}:{x:400+Math.random()*200,y:560+Math.random()*90};}
$('#decoGrid').addEventListener('click',e=>{
  const t=e.target.closest('.tile'); if(!t) return; const p=P();
  if(t.dataset.place||t.dataset.placeUid){
    const it=allItems(p).find(i=>!i.placed&&(t.dataset.placeUid?i.uid===t.dataset.placeUid:i.type===t.dataset.place));
    if(!it) return; const R=curRoom(p);
    if(it.type==='poster'&&postersUp(R)>=MAX_POSTERS){SFX.locked();toast(`This room has ${MAX_POSTERS} posters already!`);return;}
    rooms(p).forEach(r=>{r.items=r.items.filter(i=>i!==it);}); R.items.push(it); // into this room, in front (v1.31)
    Object.assign(it,spot(it.type),{placed:true});save();SFX.pop();renderRoom();renderDecoGrid();
  } else if(t.dataset.buy){
    const k=t.dataset.buy, d=DECOR[k]; if(dreamTap(p,k)) return; // a big dream she can't afford yet (section 33)
    buyConsumable(d.price,d.name,()=>{if(p.dream===k)p.dream='';curRoom(p).items.push(Object.assign({uid:uid(),type:k,placed:true},spot(k)));save();renderRoom();renderDecoGrid();toast(`${d.name} is in your room! Drag it anywhere ✨`);});
  } else if(t.dataset.surf){
    const isW=t.dataset.kind==='wall', k=t.dataset.surf, v=(isW?WALLS:FLOORS)[k];
    tryBuy((isW?'wall:':'floor:')+k,v.price,v.name,()=>{if(isW)curRoom(p).wall=k;else curRoom(p).floor=k;save();SFX.click();renderRoom();renderDecoGrid();});
  }
});

/* ---------- settings + backup ---------- */
$('#setBtn').onclick=settingsModal;
function settingsModal(){
  const s=DB.settings;
  const p=P();
  modal('⚙️ Settings',`<div class="setlist"><button class="btn ghost" id="sSound">${s.sound?'🔊 Sounds: ON':'🔇 Sounds: OFF'}</button><button class="btn ghost" id="sMusic">${s.music?'🎵 Music: ON':'🎵 Music: OFF'}</button>`
    +(p?`<button class="btn ghost" id="sBand">${BANDS[bandOf(p)].icon} Level: ${BANDS[bandOf(p)].name}</button>`:'') // section 64
    +(p&&canSpeak()?`<button class="btn ghost" id="sSpeak">${readOn(p)?'🔊 Read to me: ON':'🔈 Read to me: OFF'}</button>`:'') // section 34
    +(p?`<button class="btn ghost" id="sGift">🎁 Give a gift</button>`:'')
    +`<button class="btn ghost" id="sSwitch">👥 Switch Room</button><button class="btn ghost" id="sBackup">💾 Backup &amp; Restore</button><button class="btn ghost" id="sPin">${s.pin?'🔒 Grown-up PIN: ON':'🔓 Grown-up PIN: OFF'}</button><button class="btn ghost" id="sSetup">🧰 Grown-up setup</button><button class="btn ghost" id="sAbout">💌 About</button></div><p class="about">🐰 Hangout Room · version ${APP_VERSION}</p>`,[{text:'Close',cls:'pink'}]);
  $('#sSound').onclick=()=>{setSound(!s.sound);SFX.click();settingsModal();}; // setSound: section 34
  $('#sMusic').onclick=()=>{s.music=!s.music;save();if(s.music)startMusic();else stopMusic();settingsModal();};
  if(p) $('#sBand').onclick=()=>{SFX.click();askPin(bandModal);};
  if(p) $('#sGift').onclick=giveModal; // section 32
  if(p&&canSpeak()) $('#sSpeak').onclick=()=>{p.speak=!readOn(p);save();SFX.click();settingsModal();};
  $('#modalBody').insertAdjacentHTML('beforeend',`<p class="bk-last" id="bkLast">${lastBackupText()}</p>`); // for the grown-up (section 34)
  $('#sSwitch').onclick=()=>{closeModal();show('profiles');};
  $('#sBackup').onclick=backupModal;
  $('#sPin').onclick=pinSettings;
  $('#sSetup').onclick=()=>{SFX.click();askPin(()=>setupPin(true));}; // section 64
  $('#sAbout').onclick=()=>{closeModal();SFX.click();show('about');}; // section 25
}
// Easy mode belongs to a room, so it is on only while that room is open (never on the profile screen).
function applyEasy(){const p=cur==='profiles'?null:P();document.body.classList.toggle('easy',!!(p&&p.easy));applyTint();}

/* ---------- grown-up PIN ---------- */
// Optional 4-digit PIN in DB.settings.pin. When it is set, making / changing / deleting a room and restoring
// a backup ask for it. "Forgot PIN?" clears it after a grown-up sum (two 2-digit numbers multiplied).
function pinPad(title,onCode,btns){ // onCode(code) returns true when it handled the code, false to try again
  let code='';
  modal(title,`<div class="pindots" id="pinDots"></div><div class="pinpad" id="pinPad">${['1','2','3','4','5','6','7','8','9','','0','⌫'].map(k=>k?`<button class="btn ghost" data-k="${k}">${k}</button>`:'<span></span>').join('')}</div>`,btns);
  const dots=()=>{const d=$('#pinDots');if(d)d.innerHTML=[0,1,2,3].map(i=>`<span class="${i<code.length?'on':''}"></span>`).join('');};
  dots();
  $('#pinPad').onclick=e=>{const b=e.target.closest('[data-k]');if(!b||code.length>=4)return;SFX.click();
    code=b.dataset.k==='⌫'?code.slice(0,-1):code+b.dataset.k; dots();
    if(code.length===4) setTimeout(()=>{if(!onCode(code)){code='';dots();const d=$('#pinDots');d.classList.remove('shake');void d.offsetWidth;d.classList.add('shake');}},150);};
}
function askPin(then){
  const pin=DB.settings.pin; if(!pin){then();return;}
  pinPad('🔒 Grown-up PIN',c=>{if(c!==pin){SFX.locked();toast('Wrong PIN');return false;}closeModal();then();return true;},
    [{text:'Forgot PIN?',cls:'ghost',keep:true,on:forgotPin},{text:'Cancel',cls:'pink'}]);
}
function forgotPin(){
  const a=12+Math.floor(Math.random()*88), b=12+Math.floor(Math.random()*88);
  modal('🧮 Grown-up check',`To remove the PIN, what is <b style="color:#fff">${a} × ${b}</b>?<input id="fpAns" class="inp" inputmode="numeric" autocomplete="off" style="margin-top:10px">`,
    [{text:'Cancel',cls:'ghost'},{text:'Remove PIN',cls:'pink',keep:true,on:()=>{
      if(Number($('#fpAns').value.trim())!==a*b){SFX.locked();toast('Not quite. Try again!');return;}
      DB.settings.pin='';save();closeModal();toast('PIN removed 🔓');}}]);
}
function newPin(after){ // type a new PIN twice; then after() (the first-time setup's next step, or Settings)
  if(typeof after!=='function') after=settingsModal;
  const back={text:'Cancel',cls:'ghost',on:after};
  pinPad('🔒 Pick a 4-digit PIN',c=>{
    pinPad('🔒 Type it again',c2=>{
      if(c2!==c){SFX.locked();toast('Those did not match. Try again!');newPin(after);return true;}
      DB.settings.pin=c;save();SFX.buy();toast('PIN is on 🔒');after();return true;},[back]);
    return true;},[back]);
}
function pinSettings(){
  if(!DB.settings.pin){newPin(settingsModal);return;}
  askPin(()=>modal('🔒 Grown-up PIN','The PIN is needed to make, change or delete a room, to change a room\'s level, and to restore a backup.',[
    {text:'Remove PIN',cls:'ghost',on:()=>{DB.settings.pin='';save();toast('PIN removed 🔓');settingsModal();}},
    {text:'Change PIN',cls:'ghost',on:()=>newPin(settingsModal)},{text:'Close',cls:'pink',on:settingsModal}]));
}
// A backup is the save data (DB) as text. With the drawings switch on, it also has
// artwork:[...drawing records]. Older backups have no artwork list and still restore.
function backupModal(){
  const withArt=DB.settings.backupArt!==false;
  (withArt?ArtStore.all().catch(()=>[]):Promise.resolve([])).then(all=>{
    const artwork=all.filter(r=>!r.draft);
    const code=JSON.stringify(withArt?Object.assign({},DB,{artwork}):DB);
    const kb=code.length/1024, size=kb<1024?Math.max(1,Math.round(kb))+' KB':(kb/1024).toFixed(1)+' MB';
    const info=withArt?`🎨 ${artwork.length} drawing${artwork.length===1?'':'s'} in this backup · ${size}`:`🎨 Drawings are NOT in this backup · ${size}`;
    const big=code.length>150000; // a huge code would make the text box slow, so hide it
    modal('💾 Backup &amp; Restore',`Copy this code (or save it as a file) to keep every room safe. Paste it into Restore on any device to bring the rooms back.
      <div class="setlist" style="margin-top:10px"><button class="btn ghost" id="bkArt">${withArt?'🎨 Drawings: IN backup':'🎨 Drawings: NOT in backup'}</button></div>
      <p style="margin:10px 0 0">${info}</p>`+(big?`<p style="margin:6px 0 0">This backup is big, so the code is not shown. Use Copy code or Save file.</p>`
        :`<textarea class="inp" id="bkCode" readonly style="margin-top:10px">${esc(code)}</textarea>`),
      [{text:'Copy code',cls:'ghost',keep:true,on:()=>copyText(code)},{text:'Save file',cls:'ghost',keep:true,on:()=>downloadFile(code)},{text:'Restore…',cls:'ghost',on:()=>askPin(restoreModal)},{text:'Close',cls:'pink'}]);
    $('#bkArt').onclick=()=>{DB.settings.backupArt=!withArt;save();SFX.click();backupModal();};
  });
}
function copyText(txt){
  const fallback=()=>{const ta=document.createElement('textarea');ta.className='inp';ta.value=txt;ta.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(ta);ta.select();
    let ok=false;try{ok=document.execCommand('copy');}catch(e){}ta.remove();if(ok)backupSaved();toast(ok?'Copied! 📋':'Copying did not work here, use Save file');};
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(()=>{backupSaved();toast('Copied! 📋');},fallback); else fallback();
}
function downloadFile(txt){
  const name='hangout-room-backup-'+new Date().toISOString().slice(0,10)+'.json';
  // Inside the Android app, the wrapper opens a "save file" picker for us.
  if(window.AndroidBridge&&window.AndroidBridge.saveBackup){window.AndroidBridge.saveBackup(txt,name);return;}
  if(typeof iosSaveFile==='function'&&iosSaveFile(txt,name)) return; // iPad/iPhone: the share sheet (section 58)
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);toast('Backup file saved 💾');backupSaved();}
  catch(e){toast('Saving files is not supported here — use Copy code');}
}
function restoreModal(){
  modal('♻️ Restore','Paste a backup code, or pick a backup file. This replaces ALL rooms on this device. If the backup has drawings, they replace the drawings here too.<textarea class="inp" id="rsCode" placeholder="Paste backup code here" style="margin-top:10px"></textarea><input type="file" id="rsFile" accept=".json,application/json,text/plain" style="margin-top:10px;color:#fff">',
    [{text:'Cancel',cls:'ghost'},{text:'Restore',cls:'pink',keep:true,on:()=>doRestore($('#rsCode').value)}]);
  $('#rsFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('#rsCode').value=r.result;};r.readAsText(f);};
}
const IMG_URL=/^data:image\/(png|webp|jpeg);base64,[A-Za-z0-9+/=]+$/;
function okArt(r){return r&&typeof r==='object'&&!r.draft&&typeof r.id==='string'&&typeof r.profileId==='string'
  &&typeof r.ink==='string'&&IMG_URL.test(r.ink)&&typeof r.thumb==='string'&&IMG_URL.test(r.thumb);}
function doRestore(txt){
  let d,art;
  try{d=JSON.parse(txt);if(!d||!Array.isArray(d.profiles))throw new Error('bad');
    art=Array.isArray(d.artwork)?d.artwork.filter(okArt):null; delete d.artwork; // drawings go to IndexedDB, not localStorage
    d=fixDB(d);d.profiles.forEach(normalize);
    d.settings.pin=DB.settings.pin||''; // the PIN belongs to this device, so a backup can't change or remove it
    d.settings.seenNew=DB.settings.seenNew||''; // so is "What's New seen" (section 25)
    d.settings.lastBackup=DB.settings.lastBackup||0; // and when this device last made a backup (section 34)
    d.settings.setupDone=DB.settings.setupDone||Date.now();} // and its first-time setup: restoring counts as set up (section 64) // and when this device last made a backup (section 34)
  catch(e){toast('Hmm, that backup code did not work.');return;}
  const done=msg=>{DB=d;save();ART.owner=null;closeModal();toast(msg);show('profiles');};
  // No drawings in the backup: keep the drawings already on this device.
  if(!art){done('Rooms restored! ✨');return;}
  ArtStore.replaceAll(art).then(()=>done(`Rooms and ${art.length} drawing${art.length===1?'':'s'} restored! ✨`),
    ()=>done('Rooms restored! The drawings did not fit on this device.'));
}

/* ---------- closet ---------- */
let closetCat='fur';
function renderCloset(){
  const p=P(); if(!p) return;
  $('#closetMascot').innerHTML=mascotSVG(p.look);
  $('#mascotNameBtn').textContent=p.mascotName+' ✏️';
  renderLooks(); // ⭐ My Looks (section 31)
  $('#closetTabs').innerHTML=Object.entries(CLOSET).map(([k,c])=>`<button class="tab ${k===closetCat?'on':''}" data-cat="${k}">${c.icon} ${c.label}</button>`).join('');
  const C=CLOSET[closetCat];
  const tf=themeFilter('closet',C.items.map(it=>[closetCat+':'+it.id,it])); // 🔎 theme chips (section 33)
  $('#closetGrid').innerHTML=tf.chips+easySort(tf.list.map(x=>x[1]),it=>isOwned(p,closetCat,it)?0:it.price).map(it=>{const own=isOwned(p,closetCat,it),on=p.look[closetCat]===it.id;
    return `<button class="tile ${on?'on':''} ${own?'':'locked'}${poorCls(p,own,it.price)}" data-id="${it.id}"><div class="tv">${mascotSVG(Object.assign({},p.look,{[closetCat]:it.id}),C.vb)}</div><div class="tn">${it.name}</div>${own?'':priceTag(p,it.price)}</button>`;}).join('');
  // Hair colors: a row of swatches above the styles (bought once, for every style)
  const hc=$('#hairCols'); hc.classList.toggle('hidden',closetCat!=='hair');
  if(closetCat==='hair'){const cur=hairIds(p.look).c;
    hc.innerHTML=easySort(Object.entries(HAIR_COLORS),([k,v])=>hcOwned(p,k)?0:v.price).map(([k,v])=>{const own=hcOwned(p,k), poor=poorCls(p,own,v.price);
      return `<button class="hcol${k===cur?' on':''}${own?'':' locked'}" data-hc="${k}" title="${v.name}" style="background:${v.s?`linear-gradient(135deg,${v.c} 55%,${v.s} 55%)`:v.c}${poor?';opacity:.5':''}">${own?'':`<span>${poor?'🔒':''}🪙${v.price}</span>`}</button>`;}).join('');}
}
const hcOwned=(p,k)=>!HAIR_COLORS[k].price||p.owned.includes('hairc:'+k);
$('#hairCols').onclick=e=>{const b=e.target.closest('[data-hc]');if(!b)return;const p=P(),k=b.dataset.hc,v=HAIR_COLORS[k];
  tryBuy('hairc:'+k,v.price,v.name+' hair',()=>{p.look.hairColor=k;save();SFX.happy();const st=$('#closetGrid').scrollTop;renderCloset();$('#closetGrid').scrollTop=st;hopCloset();});};
function hopCloset(){const m=$('#closetMascot');m.classList.remove('hop');void m.offsetWidth;m.classList.add('hop');}
$('#closetTabs').onclick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;closetCat=b.dataset.cat;SFX.click();renderCloset();$('#closetGrid').scrollTop=0;};
$('#closetGrid').onclick=e=>{
  const t=e.target.closest('.tile'); if(!t) return; const p=P(); const it=itemOf(closetCat,t.dataset.id);
  const equip=()=>{p.look[closetCat]=it.id;save();SFX.happy();const st=$('#closetGrid').scrollTop;renderCloset();$('#closetGrid').scrollTop=st;hopCloset();};
  if(isOwned(p,closetCat,it)) closetWear(p,it); else tryBuy(closetCat+':'+it.id,it.price,it.name,equip);
};
// Wearing something she owns (v1.32, speed): every tile in this tab shows its own item in this slot, so no tile picture
// changes. Only the big buddy, the ✔ outline and My Looks are redrawn, instead of the whole grid (much faster).
function closetWear(p,it){
  p.look[closetCat]=it.id; save(); SFX.happy();
  $('#closetMascot').innerHTML=mascotSVG(p.look); renderLooks();
  $$('#closetGrid .tile[data-id]').forEach(t=>t.classList.toggle('on',t.dataset.id===it.id));
  hopCloset();
};
$('#randomBtn').onclick=()=>{
  const p=P();
  for(const cat of Object.keys(CLOSET)){if(cat==='fur'||cat==='kind'||cat==='face')continue;/* Surprise me keeps the buddy, fur and face */const own=CLOSET[cat].items.filter(i=>isOwned(p,cat,i));p.look[cat]=own[Math.floor(Math.random()*own.length)].id;}
  const cols=Object.keys(HAIR_COLORS).filter(k=>hcOwned(p,k)); p.look.hairColor=cols[Math.floor(Math.random()*cols.length)];
  save();SFX.happy();renderCloset();hopCloset();
};
$('#mascotNameBtn').onclick=()=>renameModal(P(),'mascotName',"Name your buddy");
$$('[data-back]').forEach(b=>b.onclick=()=>{SFX.click();show('room');});
