'use strict';
/* =========================================================
   32. GIFTS + ROOM LAYOUTS (v1.28)
   🎁 Give: from Settings or the top of My Stuff. Pick coins (5 / 10 / 20, never more than you have) or a decoration
   from My Stuff (it leaves your stuff; no posters or prizes), then another room on this tablet, then ✔.
   No network: the gift goes into the other room's inbox (p.gifts[]) and shows there as a wrapped box at GIFT_SPOT in
   every room. Tapping it opens the oldest gift with confetti: coins are added, a decoration is put in the room on screen.
   🏠 Layouts: Decorate's 🏠 tab keeps up to 3 layouts per room (p.presets {'1'|'2'|'3': [3 × null or a layout]}).
   A layout is {wall, floor, items:[{uid, type, x, y}], at}. Loading one puts away what's in the room now, then puts
   back every item that still exists (from My Stuff or any room) where it was; walls and floors only if still owned.
   ========================================================= */
const GIFT_COINS=[5,10,20];
const GIFT_SPOT={x:262,y:690}; // clear of the trophies (345 / 180), the pet (566) and Fuzzy (420-580)
const LAYOUT_SLOTS=3;
const giftable=it=>!it.placed&&DECOR[it.type]&&!DECOR[it.type].art&&!DECOR[it.type].award;
const canOpen=g=>g.kind==='coins'||!!DECOR[g.type];
const others=p=>DB.profiles.filter(q=>q.id!==p.id);

/* ---------- giving ---------- */
function giftWhat(g){return g.kind==='coins'?`🪙 ${g.n} coins`:esc(DECOR[g.type].name);}
function giveModal(){
  const p=P(); if(!p) return; SFX.click();
  if(!others(p).length){modal('🎁 Give a gift','<p style="text-align:center">Gifts go to another room on this tablet. There is only one room right now!</p>',[{text:'OK',cls:'pink'}]);return;}
  const stuff=allItems(p).filter(giftable), seen={};
  const tiles=GIFT_COINS.map(n=>`<button class="tile gv${p.coins<n?' poor':''}" data-gk="coins:${n}"><div class="tv gv-coin">🪙<b>${n}</b></div><div class="tn">${n} coins</div></button>`).join('')
    +stuff.filter(i=>!seen[i.type]&&(seen[i.type]=1)).map(i=>`<button class="tile gv" data-gk="decor:${i.uid}"><div class="tv">${decoPrev(i.type)}</div><div class="tn">${esc(DECOR[i.type].name)}</div></button>`).join('');
  modal('🎁 What to give?',`<div class="grid gv-grid" id="gvGrid">${tiles}</div>${stuff.length?'':'<p class="gv-note">Put things away in 📦 My Stuff to give them too.</p>'}`,[{text:'✖ Not now',cls:'ghost'}]);
  $('#gvGrid').onclick=e=>{const b=e.target.closest('[data-gk]');if(!b)return;const [kind,v]=b.dataset.gk.split(':');
    if(kind==='coins'&&p.coins<+v){needMore(p,+v);return;}
    giveTo(kind==='coins'?{kind,n:+v}:{kind,uid:v,type:allItems(p).find(i=>i.uid===v).type});};
}
function giveTo(g){
  const p=P(); SFX.click();
  modal(`🎁 Who is it for?`,`<div class="gv-who" id="gvWho">${others(p).map(q=>`<button class="btn ghost" data-to="${q.id}" style="border-color:${ROOM_COLORS[q.color]||'var(--line)'}"><span>${esc(q.badge||'🐰')}</span>${esc(q.name)}</button>`).join('')}</div><p class="gv-note">Giving ${giftWhat(g)}</p>`,
    [{text:'⬅ Back',cls:'ghost',keep:1,on:giveModal}]);
  $('#gvWho').onclick=e=>{const b=e.target.closest('[data-to]');if(!b)return;const q=DB.profiles.find(x=>x.id===b.dataset.to);if(!q)return;SFX.click();
    modal(`Give ${giftWhat(g)} to ${esc(q.name)}?`,`<div class="gv-ask">${g.kind==='coins'?`🪙 ${g.n}`:`<svg viewBox="${DECOR[g.type].box}">${DECOR[g.type].d()}</svg>`}<span>➜</span>${esc(q.badge||'🐰')}</div>`,
      [{text:'✖ No',cls:'ghost'},{text:'✔ Give it!',cls:'pink',on:()=>sendGift(p,q,g)}]);};
}
function sendGift(p,q,g){
  if(g.kind==='coins'){if(p.coins<g.n){needMore(p,g.n);return;}p.coins-=g.n;}
  else {const it=allItems(p).find(i=>i.uid===g.uid&&giftable(i)); if(!it) return; rooms(p).forEach(r=>{r.items=r.items.filter(i=>i!==it);});}
  q.gifts.push(g.kind==='coins'?{id:uid(),from:p.name,badge:p.badge||'🐰',kind:'coins',n:g.n,at:Date.now()}:{id:uid(),from:p.name,badge:p.badge||'🐰',kind:'decor',type:g.type,at:Date.now()});
  p.stats.gifts++; save(); updateCoins(); SFX.buy(); toast(`🎁 Sent to ${q.name}! They'll find it in their room.`);
  if(cur==='room'){renderRoom();if(decorating)renderDecoGrid();} checkStickers();
}

/* ---------- getting ---------- */
function giftBox(x,y,c,k){return `<g transform="translate(${x} ${y})"><rect x="-32" y="-50" width="64" height="50" rx="6" fill="${c}" stroke="#2b2235" stroke-width="4"/><rect x="-38" y="-62" width="76" height="16" rx="5" fill="${c}" stroke="#2b2235" stroke-width="4"/><rect x="-6" y="-62" width="12" height="62" fill="#fff6c9" stroke="#2b2235" stroke-width="3"/><path d="M0 -62 C-26 -90 -34 -64 0 -62 C34 -64 26 -90 0 -62Z" fill="#fff6c9" stroke="#2b2235" stroke-width="3"/>${k?`<path d="${starPath(22,-34,7)}" fill="#fff"/>`:''}</g>`;}
function giftG(p){
  const gs=p.gifts.filter(canOpen); if(!gs.length) return '';
  const cols=['#ff8cc6','#8ff0d0','#a97cff'], n=gs.length;
  return `<g class="hot gift-pile" data-hot="gift" transform="translate(${GIFT_SPOT.x} ${GIFT_SPOT.y})"><ellipse cx="0" cy="-2" rx="${n>1?60:44}" ry="9" fill="#00000030"/>`
    +(n>2?giftBox(26,-6,cols[2],0):'')+(n>1?giftBox(-26,-4,cols[1],0):'')+giftBox(0,0,cols[0],1)
    +(n>1?`<circle cx="44" cy="-74" r="18" fill="#ff4fa3" stroke="#fff" stroke-width="3"/><text x="44" y="-67" text-anchor="middle" font-size="20" font-weight="900" fill="#fff">${n}</text>`:'')+`</g>`;
}
function giftConfetti(){
  const d=document.createElement('div'); d.className='confetti';
  const cols=['#ff8cc6','#a97cff','#8ff0d0','#ffd166','#7fc8ff'];
  d.innerHTML=Array.from({length:36},(_,i)=>`<i style="left:${(i*137)%100}%;background:${cols[i%5]};animation-delay:${(i%9)*0.07}s;transform:rotate(${i*40}deg)"></i>`).join('');
  document.body.appendChild(d); setTimeout(()=>d.remove(),2600);
}
function giftOpen(){
  const p=P(), g=p.gifts.find(canOpen); if(!g) return;
  p.gifts=p.gifts.filter(x=>x!==g);
  if(g.kind==='coins') p.coins+=g.n;
  else {const R=curRoom(p); R.items.push(Object.assign({uid:uid(),type:g.type,placed:true},spot(g.type)));}
  save(); updateCoins(); renderRoom(); SFX.cheer(); vibrate(20); giftConfetti();
  modal(`🎁 A gift from ${esc(g.badge)} ${esc(g.from)}!`,`<div class="gv-ask">${g.kind==='coins'?`🪙 ${g.n}`:`<svg viewBox="${DECOR[g.type].box}">${DECOR[g.type].d()}</svg>`}</div><p style="text-align:center">${g.kind==='coins'?`${g.n} coins for you!`:`${esc(DECOR[g.type].name)}: it's in your room. Drag it anywhere in 🛋️ Decorate!`}</p>`,
    [{text:'Yay! ✨',cls:'pink'}]);
}

/* ---------- room layouts ---------- */
const layoutsOf=p=>p.presets[roomNo];
function layoutPrev(L){
  const W=WALLS[L.wall]||WALLS.lavender, F=FLOORS[L.floor]||FLOORS.wood;
  return `<svg viewBox="0 0 1000 700"><rect width="1000" height="470" fill="${W.fill}"/><rect y="470" width="1000" height="230" fill="${F.fill}"/>`
    +L.items.filter(i=>DECOR[i.type]&&!DECOR[i.type].art).map(i=>`<g transform="translate(${Math.round(i.x)} ${Math.round(i.y)})">${DECOR[i.type].d()}</g>`).join('')+`</svg>`;
}
function layoutGrid(p){
  return `<div class="hint lay-hint">Keep this room's look, and put it back any time 🏠</div>`+layoutsOf(p).map((L,i)=>L
    ?`<div class="tile lay"><div class="tv wide">${layoutPrev(L)}</div><div class="tn">🏠 ${i+1} · ${L.items.length} thing${L.items.length===1?'':'s'}</div><div class="lay-btns"><button class="btn small pink" data-lay-load="${i}">📂 Load</button><button class="btn small ghost" data-lay-save="${i}" aria-label="Save here">💾</button></div></div>`
    :`<button class="tile lay" data-lay-save="${i}"><div class="tv wide lay-empty">➕</div><div class="tn">💾 Save room here</div></button>`).join('');
}
function layoutSave(p,i){
  const R=curRoom(p);
  layoutsOf(p)[i]={wall:R.wall,floor:R.floor,items:R.items.filter(x=>x.placed&&DECOR[x.type]).map(x=>({uid:x.uid,type:x.type,x:Math.round(x.x),y:Math.round(x.y)})),at:Date.now()};
  save(); SFX.save(); toast('Room layout saved! 🏠'); renderDecoGrid(); checkStickers();
}
function layoutLoad(p,i){
  const L=layoutsOf(p)[i], R=curRoom(p); if(!L) return;
  R.items.forEach(x=>{x.placed=false;});
  let missing=0;
  L.items.forEach(s=>{
    const it=allItems(p).find(x=>x.uid===s.uid);
    if(!it){missing++;return;} // given away
    if(!R.items.includes(it)){rooms(p).forEach(r=>{r.items=r.items.filter(x=>x!==it);});R.items.push(it);}
    Object.assign(it,{x:s.x,y:s.y,placed:true});
  });
  const yard=roomNo===3, ok=(L2,k,isW)=>L2[k]&&!L2[k].yard===!yard&&surfOwned(p,isW,k,L2[k]);
  if(ok(WALLS,L.wall,true)) R.wall=L.wall; if(ok(FLOORS,L.floor,false)) R.floor=L.floor;
  save(); SFX.whoosh(); renderRoom(); renderDecoGrid();
  toast(missing?`Room is back! (${missing} thing${missing>1?'s':''} not here any more)`:'Your room is back! 🏠');
}
$('#decoGrid').addEventListener('click',e=>{
  const p=P(); if(!p) return;
  if(e.target.closest('[data-give]')){giveModal();return;}
  const sv=e.target.closest('[data-lay-save]'), ld=e.target.closest('[data-lay-load]');
  if(sv){const i=+sv.dataset.laySave; if(layoutsOf(p)[i]) modal('Save over this layout?',`<div class="lay-ask">${layoutPrev(layoutsOf(p)[i])}</div>`,[{text:'✖ No',cls:'ghost'},{text:'✔ Yes',cls:'pink',on:()=>layoutSave(p,i)}]); else layoutSave(p,i);}
  else if(ld){const i=+ld.dataset.layLoad; modal('Put this layout back?',`<div class="lay-ask">${layoutPrev(layoutsOf(p)[i])}</div><p style="text-align:center">What's in the room now goes to 📦 My Stuff.</p>`,[{text:'✖ No',cls:'ghost'},{text:'✔ Yes',cls:'pink',on:()=>layoutLoad(p,i)}]);}
});
const giveTile=p=>others(p).length?`<button class="tile gv-tile" data-give="1"><div class="tv">🎁</div><div class="tn">Give a gift</div></button>`:'';

STICKERS.push(
  stk('gift1','room','🎁','Kind Heart','heart','Give a gift to another room (🎁)',1,p=>p.stats.gifts),
  stk('layout1','room','🏠','Interior Designer','scallop','Save a room layout (🛋️ Decorate → 🏠 Layouts)',1,p=>Object.values(p.presets).reduce((a,l)=>a+l.filter(Boolean).length,0))
);
