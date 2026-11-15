'use strict';
/* =========================================================
   9. SCREENS
   ========================================================= */
let cur='profiles';
function show(n){
  if(n!=='room'&&decorating) exitDecorate(true);
  cur=n; $$('.screen').forEach(s=>s.classList.toggle('on',s.id==='scr-'+n));
  const ep=n==='profiles'?null:P(); applyEasy();
  if(ep&&ep.easy){if(n==='soccer')ep.soccer.level='easy';if(n==='stage')ep.stage.level='easy';} // Easy mode opens games on Easy
  if(n==='room'||n==='cards') checkBonus(); // gives any milestone cards she has earned (section 12)
  if(n==='room'||n==='soccer'){const t=giveTrophies();if(t.length)setTimeout(()=>toast(`🏆 ${t.join(' and ')} added to your room!`),400);} // section 13
  if(n==='profiles') renderProfiles();
  if(n==='room') renderRoom();
  if(n==='closet') renderCloset();
  if(n==='fidget') setFidTab(fidTab);
  if(n==='art') renderArt();
  if(n==='cards') renderCards();
  if(n==='soccer') renderSoccer();
  if(n==='room'||n==='stage'){if(giveMic())setTimeout(()=>toast('🎤 The Golden Mic is in your room!'),400);} // section 14
  if(n==='stage') renderStage(); else stgStop();
  updateCoins();
}

/* ---------- profiles ---------- */
function renderProfiles(){
  $('#profHero').innerHTML=mascotSVG(DEFAULT_LOOK);
  $('#profList').innerHTML=DB.profiles.map(p=>{const c=ROOM_COLORS[p.color];
    return `<div class="pcard" data-id="${p.id}" style="border-color:${c};background:linear-gradient(${c}66,var(--panel) 65%)"><div class="pbadge">${p.badge}</div><div class="pm">${mascotSVG(p.look,'10 0 180 270')}</div><div class="pn">${esc(p.name)}</div><div class="pc">🪙 ${p.coins}${p.easy?' <span class="ptag">· 🐣 Easy</span>':''}</div><div class="pa"><button class="btn small ghost" data-act="edit">✏️</button><button class="btn small ghost" data-act="del">🗑️</button></div></div>`;}).join('')||'<div class="empty">No rooms yet — make one to start! 💜</div>';
  $('#newProfBtn').classList.toggle('hidden',DB.profiles.length>=6);
}
$('#profList').addEventListener('click',e=>{
  const c=e.target.closest('.pcard'); if(!c) return;
  const p=DB.profiles.find(x=>x.id===c.dataset.id); if(!p) return;
  const act=e.target.closest('[data-act]');
  if(act){ SFX.click(); askPin(()=>act.dataset.act==='edit'?roomModal(p):delModal(p)); return; }
  DB.activeId=p.id; save(); SFX.happy(); enterRoom();
});
$('#newProfBtn').onclick=()=>askPin(()=>roomModal(null));
// Make a new room (p = null) or change a room's name, colour and badge.
function roomModal(p){
  const used=DB.profiles.map(x=>x.color), free=Object.keys(ROOM_COLORS).find(k=>!used.includes(k));
  let fur='white', color=p?p.color:(free||'purple'), badge=p?p.badge:ROOM_BADGES[0];
  modal(p?'✏️ Change Room':'✨ New Room ✨',`<input id="npName" class="inp" maxlength="16" placeholder="Your name" autocomplete="off" value="${p?esc(p.name):''}">`
    +(p?'':`<div class="pick-lbl">Bunny fur</div><div class="furpick" id="npFur">${Object.entries(FUR).filter(([k,v])=>!v.price).map(([k,v])=>`<button data-fur="${k}" style="background:${v.c}" class="${k===fur?'on':''}" title="${v.name}"></button>`).join('')}</div>`)
    +`<div class="pick-lbl">Room colour</div><div class="furpick" id="npCol">${Object.entries(ROOM_COLORS).map(([k,c])=>`<button data-col="${k}" style="background:${c}" class="${k===color?'on':''}"></button>`).join('')}</div>`
    +`<div class="pick-lbl">Badge</div><div class="badgepick" id="npBadge">${ROOM_BADGES.map(b=>`<button data-badge="${b}" class="${b===badge?'on':''}">${b}</button>`).join('')}</div>`,
    [{text:'Cancel',cls:'ghost'},{text:p?'Save':'Make it!',cls:'pink',keep:true,on:()=>{
      const n=$('#npName').value.trim(); if(!n){toast('Type a name first!');return;}
      closeModal();
      if(p){p.name=n;p.color=color;p.badge=badge;save();SFX.happy();renderProfiles();return;}
      const q=newProfile(n,fur,color,badge); DB.profiles.push(q); DB.activeId=q.id; save(); SFX.buy(); enterRoom();
    }}]);
  const pick=(sel,attr,set)=>{const row=$(sel);if(row)row.onclick=e=>{const b=e.target.closest(`[data-${attr}]`);if(!b)return;set(b.dataset[attr]);$$(sel+' button').forEach(x=>x.classList.toggle('on',x===b));SFX.click();};};
  pick('#npFur','fur',v=>fur=v); pick('#npCol','col',v=>color=v); pick('#npBadge','badge',v=>badge=v);
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
  const p=P(); if(!p) return; show('room'); loadArtThumbs();
  const today=new Date().toDateString();
  if(p.lastDaily!==today){p.lastDaily=today;save();setTimeout(()=>{earn(10,'Daily gift!',innerWidth/2,innerHeight/2);toast('🎁 Daily gift! +10 coins');},600);}
  if(!p.seenTip){p.seenTip=true;save();setTimeout(()=>say(`Hi ${p.name}! Tap the shelf, closet or desk ✨`),1200);}
}

/* ---------- room ---------- */
const roomSvg=$('#roomSvg');
let decorating=false,decoTab='mine',drag=null;
function mascotG(p){return `<g id="mascotG" class="mascot"><ellipse cx="500" cy="604" rx="62" ry="12" fill="#00000030"/>${mascotSVG(p.look,null,'x="420" y="396" width="160" height="216"')}</g>`;}
function renderRoom(){
  const p=P(); if(!p) return;
  const W=WALLS[p.room.wall]||WALLS.lavender, F=FLOORS[p.room.floor]||FLOORS.wood;
  let s=`<rect width="1000" height="470" fill="${W.fill}"/><rect width="1000" height="470" fill="url(#${W.pat})"/>`;
  s+=`<rect y="470" width="1000" height="230" fill="${F.fill}"/><rect y="470" width="1000" height="230" fill="url(#${F.pat})"/><rect y="458" width="1000" height="16" fill="#00000026"/>`;
  s+=furniture();
  const items=p.room.items.filter(i=>i.placed&&DECOR[i.type]);
  const deco=i=>`<g class="deco" data-uid="${i.uid}" transform="translate(${Math.round(i.x)} ${Math.round(i.y)})">${DECOR[i.type].d(i)}</g>`;
  s+=items.filter(i=>DECOR[i.type].flat).map(deco).join('');
  const list=items.filter(i=>!DECOR[i.type].flat).map(i=>({y:i.y,h:deco(i)}));
  list.push({y:604,h:mascotG(p)}); list.sort((a,b)=>a.y-b.y);
  s+=list.map(o=>o.h).join('');
  roomSvg.innerHTML=s;
  roomSvg.classList.toggle('decorating',decorating);
  $('#roomTitle').textContent=`${p.name}'s Room`;
  updateCoins();
}
function say(text){
  const old=$('#bubble'); if(old) old.remove();
  const w=Math.max(120,Math.round(text.length*11+40)), x=500-w/2;
  roomSvg.insertAdjacentHTML('beforeend',`<g id="bubble" style="pointer-events:none"><rect x="${x}" y="318" width="${w}" height="52" rx="26" fill="#fff" stroke="#2b2235" stroke-width="4"/><path d="M488 368 L500 392 L514 368" fill="#fff" stroke="#2b2235" stroke-width="4" stroke-linejoin="round"/><rect x="484" y="362" width="34" height="8" fill="#fff"/><text x="500" y="352" text-anchor="middle" font-size="22" font-weight="800" fill="#2b2235">${esc(text)}</text></g>`);
  clearTimeout(say.t); say.t=setTimeout(()=>{const b=$('#bubble');if(b)b.remove();},2600);
}
function mascotTap(){
  const g=$('#mascotG'); if(!g) return;
  g.classList.remove('hop'); void g.getBoundingClientRect(); g.classList.add('hop'); setTimeout(()=>g.classList.remove('hop'),650);
  SFX.happy(); vibrate(10);
  const p=P(); const lines=[`Hi ${p.name}! 💜`,'Squish time? 🍡','Love your style ✨',`I'm ${p.mascotName}!`,'*happy bunny noises*',"Let's play dress-up!",'Pop pop pop! 🫧',"You're the best!",'Fuzzy and cozy 🧦','Dance break! 💃','Stay spooky-cute 🦇'];
  say(lines[Math.floor(Math.random()*lines.length)]);
}
function handleHot(h){
  if(h==='shelf'){SFX.click();show('fidget');}
  else if(h==='closet'){SFX.click();show('closet');}
  else if(h==='desk'){SFX.click();show('art');}
  else if(h==='photo'){SFX.click();show('cards');}
  else if(h==='window'){SFX.click();show('soccer');}
  else if(h==='stage'){SFX.click();show('stage');}
  else {SFX.locked();toast(`🔒 ${LOCKED[h]} is coming in a future update!`);}
}
roomSvg.addEventListener('click',e=>{
  if(decorating) return;
  const hot=e.target.closest('[data-hot]'); if(hot){handleHot(hot.dataset.hot);return;}
  if(e.target.closest('#mascotG')) mascotTap();
});
function toSvg(e){const pt=roomSvg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(roomSvg.getScreenCTM().inverse());}
roomSvg.addEventListener('pointerdown',e=>{
  if(!decorating) return;
  const g=e.target.closest('.deco'); if(!g) return;
  const it=P().room.items.find(i=>i.uid===g.dataset.uid); if(!it) return;
  const pt=toSvg(e); drag={it,g,dx:it.x-pt.x,dy:it.y-pt.y};
  try{roomSvg.setPointerCapture(e.pointerId);}catch(_){}
  g.classList.add('dragging'); roomSvg.appendChild(g); SFX.click(); e.preventDefault();
});
roomSvg.addEventListener('pointermove',e=>{
  if(!drag) return;
  const pt=toSvg(e); drag.it.x=clamp(pt.x+drag.dx,30,970); drag.it.y=clamp(pt.y+drag.dy,90,700);
  drag.g.setAttribute('transform',`translate(${Math.round(drag.it.x)} ${Math.round(drag.it.y)})`);
  $('#decoPanel').classList.toggle('drop',e.clientY>$('#decoPanel').getBoundingClientRect().top);
});
function endDrag(e){
  if(!drag) return;
  if(e.clientY>$('#decoPanel').getBoundingClientRect().top){drag.it.placed=false;SFX.whoosh();toast('Put away in My Stuff 📦');}
  drag=null; save(); $('#decoPanel').classList.remove('drop'); renderRoom(); renderDecoGrid();
}
roomSvg.addEventListener('pointerup',endDrag);
roomSvg.addEventListener('pointercancel',endDrag);

function enterDecorate(){decorating=true;$('#decoPanel').classList.remove('hidden');$('#decoBtn').textContent='✔ Done';renderRoom();renderDecoGrid();SFX.click();}
function exitDecorate(silent){decorating=false;drag=null;$('#decoPanel').classList.add('hidden');$('#decoBtn').textContent='🛋️ Decorate';if(!silent)renderRoom();}
$('#decoBtn').onclick=()=>decorating?exitDecorate():enterDecorate();
$('#decoDone').onclick=()=>exitDecorate();
$('#decoTabs').onclick=e=>{const b=e.target.closest('[data-dt]');if(!b)return;decoTab=b.dataset.dt;SFX.click();renderDecoGrid();};
const decoPrev=k=>`<svg viewBox="${DECOR[k].box}">${DECOR[k].d()}</svg>`;
function renderDecoGrid(){
  const p=P(); if(!p) return;
  $$('#decoTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.dt===decoTab));
  let h='';
  if(decoTab==='mine'){
    const stored=p.room.items.filter(i=>!i.placed&&DECOR[i.type]), counts={};
    stored.filter(i=>!DECOR[i.type].art).forEach(i=>counts[i.type]=(counts[i.type]||0)+1);
    const keys=Object.keys(counts);
    // posters are each different, so they get one tile each
    h=stored.filter(i=>DECOR[i.type].art).map(i=>`<button class="tile" data-place-uid="${i.uid}"><div class="tv"><svg viewBox="${DECOR[i.type].box}">${DECOR[i.type].d(i)}</svg></div><div class="tn">${DECOR[i.type].name}</div></button>`).join('')
      +keys.map(k=>`<button class="tile" data-place="${k}"><div class="tv">${decoPrev(k)}</div><div class="tn">${DECOR[k].name}</div><div class="tp cnt">×${counts[k]}</div></button>`).join('');
    if(!h) h=`<div class="empty">Nothing stored right now! Drag things from your room down here to put them away, or get new stuff in the Shop 🛍️</div>`;
  } else if(decoTab==='shop'){
    h=easySort(Object.entries(DECOR).filter(([k,d])=>!d.art&&!d.award),([k,d])=>d.price).map(([k,d])=>`<button class="tile${poorCls(p,false,d.price)}" data-buy="${k}"><div class="tv">${decoPrev(k)}</div><div class="tn">${d.name}</div>${priceTag(p,d.price)}</button>`).join('');
  } else {
    const isW=decoTab==='wall', L=isW?WALLS:FLOORS, curId=isW?p.room.wall:p.room.floor;
    const own=([k,v])=>!v.price||p.owned.includes((isW?'wall:':'floor:')+k);
    h=easySort(Object.entries(L),e=>own(e)?0:e[1].price).map(e=>{const [k,v]=e, o=own(e);
      return `<button class="tile ${k===curId?'on':''} ${o?'':'locked'}${poorCls(p,o,v.price)}" data-surf="${k}"><div class="tv"><svg viewBox="0 0 300 200"><rect width="300" height="200" fill="${v.fill}"/><rect width="300" height="200" fill="url(#${v.pat})"/></svg></div><div class="tn">${v.name}</div>${o?'':priceTag(p,v.price)}</button>`;}).join('');
  }
  $('#decoGrid').innerHTML=h;
}
// Posters go on the free bit of wall between the photocard board and the closet.
// Trophies each get their own clear spot on the floor, so they never hide behind Fuzzy (who stands at x 420-580).
const TROPHY_SPOTS={trophyBronze:{x:345,y:665},trophySilver:{x:655,y:680},trophyGold:{x:850,y:660},goldenMic:{x:180,y:688}};
function spot(type){if(TROPHY_SPOTS[type])return Object.assign({},TROPHY_SPOTS[type]);if(type==='poster')return {x:686+Math.random()*12,y:200+Math.random()*12};return DECOR[type].wall?{x:380+Math.random()*240,y:200+Math.random()*60}:{x:400+Math.random()*200,y:560+Math.random()*90};}
$('#decoGrid').addEventListener('click',e=>{
  const t=e.target.closest('.tile'); if(!t) return; const p=P();
  if(t.dataset.place||t.dataset.placeUid){
    const it=p.room.items.find(i=>!i.placed&&(t.dataset.placeUid?i.uid===t.dataset.placeUid:i.type===t.dataset.place));
    if(it){Object.assign(it,spot(it.type),{placed:true});save();SFX.pop();renderRoom();renderDecoGrid();}
  } else if(t.dataset.buy){
    const k=t.dataset.buy, d=DECOR[k];
    buyConsumable(d.price,d.name,()=>{p.room.items.push(Object.assign({uid:uid(),type:k,placed:true},spot(k)));save();renderRoom();renderDecoGrid();toast(`${d.name} is in your room! Drag it anywhere ✨`);});
  } else if(t.dataset.surf){
    const isW=decoTab==='wall', k=t.dataset.surf, v=(isW?WALLS:FLOORS)[k];
    tryBuy((isW?'wall:':'floor:')+k,v.price,v.name,()=>{if(isW)p.room.wall=k;else p.room.floor=k;save();SFX.click();renderRoom();renderDecoGrid();});
  }
});

/* ---------- settings + backup ---------- */
$('#setBtn').onclick=settingsModal;
function settingsModal(){
  const s=DB.settings;
  const p=P();
  modal('⚙️ Settings',`<div class="setlist"><button class="btn ghost" id="sSound">${s.sound?'🔊 Sounds: ON':'🔇 Sounds: OFF'}</button><button class="btn ghost" id="sMusic">${s.music?'🎵 Music: ON':'🎵 Music: OFF'}</button>`
    +(p?`<button class="btn ghost" id="sEasy">${p.easy?'🐣 Easy mode: ON':'🐣 Easy mode: OFF'}</button>`:'')
    +`<button class="btn ghost" id="sSwitch">👥 Switch Room</button><button class="btn ghost" id="sBackup">💾 Backup &amp; Restore</button><button class="btn ghost" id="sPin">${s.pin?'🔒 Grown-up PIN: ON':'🔓 Grown-up PIN: OFF'}</button></div><p class="about">🐰 Hangout Room · version ${APP_VERSION}</p>`,[{text:'Close',cls:'pink'}]);
  $('#sSound').onclick=()=>{s.sound=!s.sound;save();SFX.click();settingsModal();};
  $('#sMusic').onclick=()=>{s.music=!s.music;save();if(s.music)startMusic();else stopMusic();settingsModal();};
  if(p) $('#sEasy').onclick=()=>{p.easy=!p.easy;save();SFX.click();applyEasy();if(cur==='room')renderRoom();settingsModal();};
  $('#sSwitch').onclick=()=>{closeModal();show('profiles');};
  $('#sBackup').onclick=backupModal;
  $('#sPin').onclick=pinSettings;
}
// Easy mode belongs to a room, so it is on only while that room is open (never on the profile screen).
function applyEasy(){const p=cur==='profiles'?null:P();document.body.classList.toggle('easy',!!(p&&p.easy));}

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
function newPin(){ // type a new PIN twice
  const back={text:'Cancel',cls:'ghost',on:settingsModal};
  pinPad('🔒 Pick a 4-digit PIN',c=>{
    pinPad('🔒 Type it again',c2=>{
      if(c2!==c){SFX.locked();toast('Those did not match. Try again!');newPin();return true;}
      DB.settings.pin=c;save();SFX.buy();toast('PIN is on 🔒');settingsModal();return true;},[back]);
    return true;},[back]);
}
function pinSettings(){
  if(!DB.settings.pin){newPin();return;}
  askPin(()=>modal('🔒 Grown-up PIN','The PIN is needed to make, change or delete a room, and to restore a backup.',[
    {text:'Remove PIN',cls:'ghost',on:()=>{DB.settings.pin='';save();toast('PIN removed 🔓');settingsModal();}},
    {text:'Change PIN',cls:'ghost',on:newPin},{text:'Close',cls:'pink',on:settingsModal}]));
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
    let ok=false;try{ok=document.execCommand('copy');}catch(e){}ta.remove();toast(ok?'Copied! 📋':'Copying did not work here, use Save file');};
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(()=>toast('Copied! 📋'),fallback); else fallback();
}
function downloadFile(txt){
  const name='hangout-room-backup-'+new Date().toISOString().slice(0,10)+'.json';
  // Inside the Android app, the wrapper opens a "save file" picker for us.
  if(window.AndroidBridge&&window.AndroidBridge.saveBackup){window.AndroidBridge.saveBackup(txt,name);return;}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);toast('Backup file saved 💾');}
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
    d.settings.pin=DB.settings.pin||'';} // the PIN belongs to this device, so a backup can't change or remove it
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
  $('#closetTabs').innerHTML=Object.entries(CLOSET).map(([k,c])=>`<button class="tab ${k===closetCat?'on':''}" data-cat="${k}">${c.icon} ${c.label}</button>`).join('');
  const C=CLOSET[closetCat];
  $('#closetGrid').innerHTML=easySort(C.items,it=>isOwned(p,closetCat,it)?0:it.price).map(it=>{const own=isOwned(p,closetCat,it),on=p.look[closetCat]===it.id;
    return `<button class="tile ${on?'on':''} ${own?'':'locked'}${poorCls(p,own,it.price)}" data-id="${it.id}"><div class="tv">${mascotSVG(Object.assign({},p.look,{[closetCat]:it.id}),C.vb)}</div><div class="tn">${it.name}</div>${own?'':priceTag(p,it.price)}</button>`;}).join('');
}
function hopCloset(){const m=$('#closetMascot');m.classList.remove('hop');void m.offsetWidth;m.classList.add('hop');}
$('#closetTabs').onclick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;closetCat=b.dataset.cat;SFX.click();renderCloset();$('#closetGrid').scrollTop=0;};
$('#closetGrid').onclick=e=>{
  const t=e.target.closest('.tile'); if(!t) return; const p=P(); const it=itemOf(closetCat,t.dataset.id);
  const equip=()=>{p.look[closetCat]=it.id;save();SFX.happy();const st=$('#closetGrid').scrollTop;renderCloset();$('#closetGrid').scrollTop=st;hopCloset();};
  if(isOwned(p,closetCat,it)) equip(); else tryBuy(closetCat+':'+it.id,it.price,it.name,equip);
};
$('#randomBtn').onclick=()=>{
  const p=P();
  for(const cat of Object.keys(CLOSET)){if(cat==='fur')continue;const own=CLOSET[cat].items.filter(i=>isOwned(p,cat,i));p.look[cat]=own[Math.floor(Math.random()*own.length)].id;}
  save();SFX.happy();renderCloset();hopCloset();
};
$('#mascotNameBtn').onclick=()=>renameModal(P(),'mascotName',"Name your bunny");
$$('[data-back]').forEach(b=>b.onclick=()=>{SFX.click();show('room');});
