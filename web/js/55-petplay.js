'use strict';
/* =========================================================
   55. PET PLAY (v1.54): 🙈 Hide & Seek and 🎾 Fetch with her pet
   Two big buttons at the top of the pet menu (section 22). Both play in whichever room is on screen; while one is on,
   body.petplay hides the top bar, the room tabs and the room buttons, a card (#ppCard) takes the top bar's place,
   and the room's click handler (section 9) hands taps to ppTap. Back, ✖ or leaving the room ends it quietly.
   🙈 Hide & Seek: a short count behind a curtain, then the pet is drawn just *behind* a standing decoration or a
   built-in floor piece (closet, desk, tree, shed…), placed so only a little of it peeks out (8-45%, Easy 16-45%) (ppPlace measures what
   shows with elementFromPoint, like I Spy's spySeen). At night two glowing eyes show instead. A wrong tap shakes the
   thing ("Not here!"), nothing is counted; after PP_HINT wrong taps the right spot sparkles. Found: +PP_FIND_HEARTS.
   🎾 Fetch: swipe (or tap the floor) to throw the toy; it lands on the floor, the pet runs, picks it up and brings it
   back: +1 heart. The throw and the run use requestAnimationFrame only while something moves (no main loop).
   Toys (PET_TOYS) are owned as 'pettoy:<id>' (the ball is free); p.pet.toy is the one in use. Toy ids are saved:
   never rename them. The pet still never earns coins. Totals: p.stats.seeks / fetches.
   ========================================================= */
const PP_FIND_HEARTS=2, PP_FETCH_HEARTS=1, PP_HINT=3, PP_MIN=2, PP_SCALE=0.85;
// v1.85 (section 76): a find ends on the end box (🔁 Hide again / ⬅ 🐾 Pet); Fetch offers it every PP_ASK fetches and when
// the pet is tapped. ✖, Android Back and "put out a few more things" all go back to the pet menu (ppQuit), where she started.
const PP_ASK=5;
const PP_FLOOR={x0:60,x1:940,y0:505,y1:688}; // where a thrown toy can land
const PP_HAND={x:600,y:548}; // the toy waits by the buddy's right hand
const PP_DROP={x:PET_SPOT.x+34,y:PET_SPOT.y-4}; // where the pet drops the toy
// Each toy draws centered at (0,0), about 40 across. far = how far a swipe throws it, roll = how far it rolls on.
const PET_TOYS={
  ball:{name:'Ball',icon:'🎾',price:0,far:1,roll:70,d:()=>`<circle r="15" fill="#d8f25a" stroke="#2b2235" stroke-width="3"/><path d="M-13 -7 Q0 0 -6 13 M13 7 Q0 0 6 -13" stroke="#fff" stroke-width="2.5" fill="none"/>`},
  bone:{name:'Squeaky Bone',icon:'🦴',price:6,far:0.9,roll:24,d:()=>`<path d="M-12 -4 H12 A6 6 0 1 1 16 -9 A6 6 0 1 1 18 4 A6 6 0 1 1 12 4 H-12 A6 6 0 1 1 -18 4 A6 6 0 1 1 -16 -9 A6 6 0 1 1 -12 -4Z" fill="#ffc1dc" stroke="#2b2235" stroke-width="3" stroke-linejoin="round"/>`},
  yarn:{name:'Yarn Ball',icon:'🧶',price:8,far:0.95,roll:60,trail:1,d:()=>`<circle r="15" fill="#ff8cc6" stroke="#2b2235" stroke-width="3"/><path d="M-12 -6 Q0 -14 12 -6 M-14 2 Q0 -6 14 2 M-10 9 Q0 3 10 9" stroke="#ffd6ea" stroke-width="2" fill="none"/>`},
  disc:{name:'Star Disc',icon:'🥏',price:10,far:1.35,roll:10,glide:1,d:()=>`<ellipse rx="20" ry="9" fill="#a97cff" stroke="#2b2235" stroke-width="3"/><path d="${starPath(0,-1,6)}" fill="#ffd166"/>`}
};
const PP={on:false,mode:'',phase:'',spot:null,last:'',wrong:0,found:false,timers:[],raf:0,down:null,streak:0,fly:null};
window.PP_TEST_FAST=false; // the smoke test makes the count and the run quick

const ppToy=p=>PET_TOYS[p.pet.toy]&&(p.pet.toy==='ball'||p.owned.includes('pettoy:'+p.pet.toy))?p.pet.toy:'ball';
const ppPeek=p=>p.easy?0.16:0.08; // the least share of the pet that peeks out (more in Easy mode)
const ppFlies=k=>k==='bat'||k==='ghostCat'; // these float instead of hopping
const ppSoon=(fn,ms)=>{PP.timers.push(setTimeout(fn,PP_TEST_FAST?Math.min(ms,60):ms));};
const ppNS='http://www.w3.org/2000/svg';

/* ---------- start and stop ---------- */
function ppStart(mode){
  const p=P(); closeModal();
  if(!p||cur!=='room'||decorating||SPY.on||!petKind(p)) return;
  ppEnd(true); SFX.click(); emoteBar(false);
  PP.on=true; PP.mode=mode; PP.streak=0; PP.last='';
  document.body.classList.add('petplay');
  $('#ppCard').classList.remove('hidden');
  if(mode==='hide') ppHideRound(); else {PP.phase='ready'; renderRoom(); ppCard();}
}
// Stop and go back to the pet menu (✖, ⬅ in the end box, Android Back).
function ppQuit(){ppEnd(); if(cur==='room'&&petKind(P())) petMenu();}
function ppAsk(){
  const p=P(); if(!p||!PP.on) return; const name=esc(petName(p));
  endBox({title:PP.mode==='hide'?`🙈 You found ${name}!`:`🎾 ${PP.streak?PP.streak+' fetches!':'Fetch'}`,
    body:`<div style="text-align:center;font-size:20px">🐾 ${name} ❤️ ${petHearts(p)}</div>`,
    back:{to:'pet',on:ppQuit},go:PP.mode==='hide'?{text:'🔁 Hide again',on:ppHideRound}:{text:'🔁 Keep playing',on:()=>{}}});
}
function ppEnd(quiet){
  const was=PP.on;
  PP.timers.forEach(clearTimeout); PP.timers=[]; cancelAnimationFrame(PP.raf); PP.raf=0;
  Object.assign(PP,{on:false,mode:'',phase:'',spot:null,wrong:0,found:false,down:null,fly:null});
  document.body.classList.remove('petplay'); const c=$('#ppCard'); if(c) c.classList.add('hidden');
  if(was&&!quiet&&cur==='room') renderRoom();
}
// The card at the top (it takes the top bar's place, like I Spy's clue card)
function ppCard(){
  const p=P(); if(!p||!PP.on) return;
  const name=esc(petName(p)), X=`<button class="spy-b" id="ppX" aria-label="Stop">✖</button>`;
  let h;
  if(PP.mode==='hide'){
    const txt=PP.phase==='count'?`${name} is hiding… 🙈`:PP.found?`You found ${name}! ❤️ +${PP_FIND_HEARTS}`:`Where is ${name}?`;
    h=`<div class="spy-txt"><b>🙈 Hide &amp; Seek</b><span id="ppText">${txt}</span></div>`
      +`<div class="spy-btns">${X}</div>`; // 🔁 is in the end box now (v1.85)
  } else {
    const on=ppToy(p);
    h=`<div class="spy-txt"><b>🎾 Fetch</b><span id="ppText">${p.easy?'Swipe! 👉':'Swipe to throw!'}</span></div>`
      +`<div class="spy-btns pp-toys">${Object.entries(PET_TOYS).map(([id,T])=>{const own=!T.price||p.owned.includes('pettoy:'+id);
        return `<button class="spy-b pp-toy${id===on?' on':''}${own?'':' locked'}" data-toy="${id}" aria-label="${T.name}"><svg viewBox="-22 -22 44 44">${T.d()}</svg>${own?'':`<small>🪙${T.price}</small>`}</button>`;}).join('')}${X}</div>`;
  }
  $('#ppCard').innerHTML=h;
  $('#ppX').onclick=()=>{SFX.click();ppQuit();};
  $$('#ppCard [data-toy]').forEach(b=>b.onclick=()=>ppPickToy(b.dataset.toy));
}
// renderRoom (section 9) calls this at the end while a game is on, so a redraw keeps the game as it was.
function ppRedraw(){
  const p=P(); if(!PP.on||!p) return;
  if(PP.mode==='hide'){
    if(PP.phase==='count'||(PP.spot&&!PP.found)) ppAway(true);
    if(PP.spot&&!PP.found){const s=ppSpots().find(x=>x.key===PP.spot.key); if(s&&ppPut(s,PP.spot.c)) ppEyes(); else ppHideRound();}
  } else {
    if(PP.phase!=='ready'){cancelAnimationFrame(PP.raf); PP.raf=0; PP.phase='ready'; PP.fly=null;}
    ppHand();
  }
}
const ppAway=on=>{const g=$('#petG'); if(g) g.classList.toggle('pp-away',on);}; // hides the pet at home (its bed stays)

/* ---------- 🙈 Hide & Seek ---------- */
// The things the pet can hide behind: standing decorations and the room's own floor pieces, big enough.
function ppSpots(){
  const p=P(), R=curRoom(p), out=[];
  [...roomSvg.children].forEach((el,i)=>{
    let key='', name='';
    if(el.classList.contains('deco')){
      const it=R.items.find(x=>x.uid===el.dataset.uid), D=it&&DECOR[it.type];
      if(!D||D.flat||D.wall) return; key='d:'+it.uid; name=D.name.replace(/^My /,'');
    } else if(el.classList.contains('fixed')){
      if(el.querySelector('#mascotG,#petG,[data-hot=gift],[data-hot=visitor]')||!el.firstElementChild) return;
      const h=el.querySelector('[data-hot]'); key='f:'+(h?h.dataset.hot:i); name=h&&SPY_FURN[h.dataset.hot]||'Tree';
    } else return;
    const b=spyBox(el); if(b.w<60||b.h<50) return;
    out.push({key,el,name,b});
  });
  return out.filter(spySeen);
}
// Where the pet could stand behind a spot: on the floor peeking out at a side, or higher up behind a solid part
// (a monitor, a keyboard, a tree top) with its ears over the top. ppHide tries them in a random order.
function ppCands(b){
  const hw=55*PP_SCALE, ht=90*PP_SCALE, fy=b.y+b.h-4;
  const xs=[b.x+hw-30,b.x+b.w-hw+30,b.cx,b.x+b.w*0.3,b.x+b.w*0.7], ys=[fy,b.y+ht-26,b.y+ht+10,b.y+b.h/2+ht/2].filter(y=>y<=fy);
  const c=[]; xs.forEach((x,i)=>ys.forEach(y=>c.push({x,y,f:i===1?-1:1})));
  return c.map(q=>({x:Math.round(clamp(q.x,40,960)),y:Math.round(clamp(q.y,120,698)),f:q.f}));
}
// Draws the hiding pet right behind the spot. Returns the share of the pet that shows (0-1), or 0 if it isn't drawn.
function ppPut(s,c){
  const old=$('#ppPet'); if(old) old.remove();
  const p=P(), k=petKind(p);
  roomSvg.insertBefore(ppPetEl(k,petAcc(p),c,true),s.el);
  return ppShows();
}
function ppPetEl(k,acc,c,hiding){
  const g=document.createElementNS(ppNS,'g'); g.id=hiding?'ppPet':'ppRun';
  g.setAttribute('transform',`translate(${c.x} ${c.y}) scale(${PP_SCALE*(c.f||1)} ${PP_SCALE})`);
  g.innerHTML=`<g class="${hiding?'pp-wig':'pp-bob'}"><g id="${hiding?'ppBody':'ppRunBody'}" class="pet-body">${petArt(k,acc)}</g></g>`;
  return g;
}
// What share of the pet can be seen: sample points over it, against the same points with the pet on top of everything.
function ppSample(el){
  const r=el.getBoundingClientRect(), pts=[];
  if(r.width<4||r.height<4) return pts;
  for(let i=0;i<8;i++) for(let j=0;j<8;j++) pts.push([r.left+r.width*(i+.5)/8,r.top+r.height*(j+.5)/8]);
  return pts;
}
function ppShows(){
  const el=$('#ppPet'); if(!el) return 0;
  const pts=ppSample(el), next=el.nextSibling, hit=([x,y])=>{const e=document.elementFromPoint(x,y);return !!e&&el.contains(e);};
  const seen=pts.filter(hit);
  roomSvg.appendChild(el); const all=pts.filter(hit).length; roomSvg.insertBefore(el,next);
  PP.seen=seen; return all?seen.length/all:0;
}
// Picks a new spot (not the last one) where only a little of the pet shows. false if the room has too few things.
function ppHide(){
  const all=ppSpots(); if(all.length<PP_MIN) return false;
  const pool=all.filter(s=>s.key!==PP.last).sort(()=>Math.random()-.5);
  for(const s of pool) for(const c of ppCands(s.b).sort(()=>Math.random()-.5)){
    const f=ppPut(s,c);
    if(f>=ppPeek(P())&&f<=0.45&&PP.seen.length>=4){PP.spot={key:s.key,name:s.name,c}; PP.last=s.key; ppEyes(); return true;}
  }
  const old=$('#ppPet'); if(old) old.remove(); return false;
}
// 🌙 at night: two little glowing eyes where the pet peeks out
function ppEyes(){
  const old=$('#ppEyes'); if(old) old.remove();
  const p=P(); if(!isNight(p)||!PP.seen||!PP.seen.length) return;
  const n=PP.seen.length, cx=PP.seen.reduce((a,q)=>a+q[0],0)/n, cy=PP.seen.reduce((a,q)=>a+q[1],0)/n, q=toSvg({clientX:cx,clientY:cy});
  const x=Math.round(q.x), y=Math.round(q.y);
  roomSvg.insertAdjacentHTML('beforeend',`<g id="ppEyes" class="pp-eyes" style="pointer-events:none"><circle cx="${x}" cy="${y}" r="20" fill="#fff3c4" opacity=".18"/>`
    +[-7,7].map(d=>`<ellipse cx="${x+d}" cy="${y}" rx="4.5" ry="5.5" fill="#fff3a0" stroke="#ffd166" stroke-width="2"/><circle cx="${x+d+1}" cy="${y-1}" r="1.6" fill="#2b2235"/>`).join('')+'</g>');
}
function ppHideRound(){
  const p=P(); if(!PP.on||!p) return;
  PP.timers.forEach(clearTimeout); PP.timers=[];
  Object.assign(PP,{phase:'count',spot:null,wrong:0,found:false});
  renderRoom(); ppCard();
  roomSvg.insertAdjacentHTML('beforeend',`<g id="ppCurtain" class="pp-curtain" style="pointer-events:none"><rect x="-300" y="-100" width="1600" height="900" fill="#231b2e" opacity=".92"/>`
    +`<text x="500" y="330" text-anchor="middle" font-size="90">🙈</text><text id="ppCount" x="500" y="430" text-anchor="middle" font-size="64" font-weight="900" fill="#ffd166"></text></g>`);
  say('Close your eyes! 🙈');
  [1,2,3].forEach(i=>ppSoon(()=>{const t=$('#ppCount'); if(t) t.textContent=['1…','1… 2…','1… 2… 3…'][i-1]; tone(300+i*80,0.08,'triangle',0.1);},i*600-400));
  ppSoon(()=>{
    if(!PP.on) return; const c=$('#ppCurtain'); if(c) c.remove();
    if(!ppHide()){PP.phase=''; ppAway(false); ppCard(); say('Put out a few more things first! 🛋️'); ppSoon(ppQuit,1800); return;}
    PP.phase='seek'; ppCard(); say('Ready or not! 🐾'); SFX.whoosh();
  },2100);
}
function ppSeekTap(e){
  const p=P(), S=PP.spot; if(PP.phase!=='seek'||!S||PP.found) return;
  const s=ppSpots().find(x=>x.key===S.key), pet=$('#ppPet'), x=e.clientX, y=e.clientY, near=14;
  const r=s&&s.el.getBoundingClientRect();
  const hit=(pet&&pet.contains(e.target))||(s&&(s.el.contains(e.target)||(x>=r.left-near&&x<=r.right+near&&y>=r.top-near&&y<=r.bottom+near)));
  if(!hit){
    PP.wrong++; tone(420,0.1,'sine',0.08,520);
    const top=[...roomSvg.children].find(el=>el.contains(e.target)&&(el.classList.contains('deco')||el.classList.contains('fixed')));
    if(top) ppShake(top);
    floatText(p.easy?'🤭':'Not here! 🤭',x,y);
    if(PP.wrong>=PP_HINT&&s) ppHint(s.el);
    return;
  }
  ppFound();
}
function ppShake(el){
  if(el.parentNode!==roomSvg||el.id==='ppPet') return;
  const w=document.createElementNS(ppNS,'g'); w.setAttribute('class','pp-shake');
  roomSvg.insertBefore(w,el); w.appendChild(el);
  setTimeout(()=>{if(w.parentNode){w.parentNode.insertBefore(el,w);w.remove();}},500);
}
function ppHint(el){
  const old=$('#ppRing'); if(old) old.remove();
  const b=spyBox(el);
  roomSvg.insertAdjacentHTML('beforeend',`<g id="ppRing" class="spy-ring" style="pointer-events:none"><ellipse cx="${Math.round(b.cx)}" cy="${Math.round(b.cy)}" rx="${Math.round(b.w/2+18)}" ry="${Math.round(b.h/2+18)}" fill="none" stroke="#ffd166" stroke-width="8" stroke-dasharray="16 12"/></g>`);
  spySparkle(el);
}
function ppFound(){
  const p=P(), pet=$('#ppPet'); if(!p||!pet) return;
  PP.found=true; PP.phase='found'; p.stats.seeks++;
  ['#ppRing','#ppEyes'].forEach(s=>{const e=$(s); if(e) e.remove();});
  roomSvg.appendChild(pet); pet.querySelector('.pp-wig').classList.remove('pp-wig');
  const c=PP.spot.c, learned=petGive(p,PP_FIND_HEARTS);
  const b=$('#ppBody'); if(b) b.classList.add('t-'+(learned?learned.id:'hop'));
  ppHearts(PP_FIND_HEARTS,c.x,c.y-90*PP_SCALE);
  SFX.cheer(); vibrate(12); ppCard();
  if(!learned) say(`Found you! 🎉`);
  ppSoon(()=>{PP.spot=null; PP.phase='done'; renderRoom(); ppCard(); ppAsk();},1500);
  checkStickers();
}
function ppHearts(n,cx,cy){
  for(let i=0;i<n;i++){const x=Math.round(cx+(i-(n-1)/2)*22), y=Math.round(cy);
    roomSvg.insertAdjacentHTML('beforeend',`<path class="pet-heart pp-heart" style="animation-delay:${i*0.12}s" d="${heartPath(x,y,9)}" fill="#ff4fa3" stroke="#fff" stroke-width="2"/>`);}
  setTimeout(()=>$$('#roomSvg .pp-heart').forEach(e=>e.remove()),1500);
}

/* ---------- 🎾 Fetch ---------- */
function ppHand(){
  const old=$('#ppToy'); if(old) old.remove();
  if(!PP.on||PP.mode!=='fetch'||PP.phase!=='ready') return;
  roomSvg.insertAdjacentHTML('beforeend',`<g id="ppToy" class="pp-toy-wait" style="pointer-events:none" transform="translate(${PP_HAND.x} ${PP_HAND.y})"><g>${PET_TOYS[ppToy(P())].d()}</g></g>`);
}
function ppPickToy(id){
  const p=P(), T=PET_TOYS[id]; if(!p||!T) return;
  tryBuy('pettoy:'+id,T.price,T.name,()=>{p.pet.toy=id; save(); SFX.click(); ppCard(); if(PP.phase==='ready') ppHand();});
}
function ppDown(e){
  if(!PP.on||PP.mode!=='fetch'||PP.phase!=='ready') return;
  PP.down=toSvg(e);
}
function ppUp(e){
  if(!PP.on||PP.mode!=='fetch'||PP.phase!=='ready'||!PP.down) return;
  const a=PP.down, b=toSvg(e); PP.down=null;
  const dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy), T=PET_TOYS[ppToy(P())];
  if(len<25&&e.target.closest&&e.target.closest('#petG')){ppAsk();return;} // a tap on the pet: the end box (v1.85)
  if(len<25) ppThrow(b.x,b.y); // a tap: throw it to that spot
  else ppThrow(PP_HAND.x+dx*2.2*T.far,PP_HAND.y+dy*2.2*T.far);
}
// Keeps a landing spot on the floor; past a side it bounces back off the wall.
function ppLand(x,y){
  const {x0,x1,y0,y1}=PP_FLOOR;
  if(x>x1) x=x1-(x-x1); if(x<x0) x=x0+(x0-x);
  return {x:Math.round(clamp(x,x0,x1)),y:Math.round(clamp(y,y0,y1))};
}
function ppThrow(tx,ty){
  const p=P(); if(!PP.on||PP.mode!=='fetch'||PP.phase!=='ready'||!p) return false;
  const T=PET_TOYS[ppToy(p)], L=ppLand(tx,ty), d=Math.hypot(L.x-PP_HAND.x,L.y-PP_HAND.y)||1;
  const ux=(L.x-PP_HAND.x)/d, uy=(L.y-PP_HAND.y)/d, R=ppLand(L.x+ux*T.roll,L.y+uy*T.roll*0.4);
  const old=$('#ppToy'); if(old) old.remove();
  const before=$('#roomSvg > .night');
  const toy=document.createElementNS(ppNS,'g'); toy.id='ppToyFly'; toy.setAttribute('style','pointer-events:none');
  toy.innerHTML=(T.trail?`<polyline id="ppTrail" fill="none" stroke="#ff8cc6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`:'')+`<g id="ppToyG">${T.d()}</g>`;
  roomSvg.insertBefore(toy,before);
  ppAway(true);
  const k=petKind(p), run=ppPetEl(k,petAcc(p),{x:PET_SPOT.x,y:PET_SPOT.y-8,f:1},false); run.setAttribute('style','pointer-events:none');
  roomSvg.insertBefore(run,before);
  PP.phase='fly'; SFX.whoosh(); vibrate(8);
  PP.fly={t:0,dur:0.45+d/1600,h:(T.glide?60:110)+d*0.18,L,R,pet:{x:PET_SPOT.x,y:PET_SPOT.y},trail:[],stage:'fly',wait:0.15,flies:ppFlies(k)};
  let last=0;
  const step=ts=>{
    if(!PP.on||!PP.fly) return;
    const dt=Math.min(0.05,last?(ts-last)/1000:0.016)*(PP_TEST_FAST?5:1); last=ts;
    ppStep(dt); if(PP.fly) PP.raf=requestAnimationFrame(step);
  };
  PP.raf=requestAnimationFrame(step);
  return true;
}
const ppSet=(id,x,y,extra)=>{const e=$(id); if(e) e.setAttribute('transform',`translate(${Math.round(x)} ${Math.round(y)})${extra||''}`);};
function ppStep(dt){
  const F=PP.fly, SP=520; F.t+=dt;
  let tx, ty;
  if(F.stage==='fly'){ // the arc through the air, then a bounce and a roll
    const a=Math.min(1,F.t/F.dur);
    tx=PP_HAND.x+(F.L.x-PP_HAND.x)*a; ty=PP_HAND.y+(F.L.y-PP_HAND.y)*a-Math.sin(a*Math.PI)*F.h;
    if(a>=1){F.stage='roll';F.t=0;}
  } else if(F.stage==='roll'){
    const a=Math.min(1,F.t/0.5), e=1-(1-a)*(1-a);
    tx=F.L.x+(F.R.x-F.L.x)*e; ty=F.L.y+(F.R.y-F.L.y)*e-Math.abs(Math.sin(a*Math.PI*2))*28*(1-a);
    if(a>=1){F.stage='go';F.t=0;}
  }
  if(tx!=null){ppSet('#ppToyFly',0,0); ppSet('#ppToyG',tx,ty,` rotate(${Math.round(F.t*600)%360})`); F.toy={x:tx,y:ty};
    if(PET_TOYS[ppToy(P())].trail){F.trail.push(Math.round(tx)+','+Math.round(ty)); if(F.trail.length>24) F.trail.shift(); const t=$('#ppTrail'); if(t) t.setAttribute('points',F.trail.join(' '));}}
  // the pet: waits a moment, runs to the toy, then brings it back
  // (it sets off as soon as the toy flies and waits where the toy will stop if it gets there first)
  const goal=F.stage==='back'?{x:PP_DROP.x,y:PP_DROP.y+4}:F.R;
  if(F.wait>0){F.wait-=dt;} else {
    const dx=goal.x-F.pet.x, dy=goal.y-F.pet.y, dist=Math.hypot(dx,dy), mv=SP*dt;
    if(dist<=mv){F.pet.x=goal.x;F.pet.y=goal.y;
      if(F.stage==='go'){F.stage='back';SFX.pop();const t=$('#ppTrail');if(t)t.remove();}
      else if(F.stage==='back'){ppFetched();return;}}
    else {F.pet.x+=dx/dist*mv; F.pet.y+=dy/dist*mv; F.face=dx<-1?-1:dx>1?1:(F.face||1);}
  }
  const bob=F.flies?-22+Math.sin(F.t*8)*5:-Math.abs(Math.sin(F.t*14))*12;
  const run=$('#ppRun'); if(run) run.setAttribute('transform',`translate(${Math.round(F.pet.x)} ${Math.round(F.pet.y-8+bob)}) scale(${(F.face||1)*PP_SCALE} ${PP_SCALE})`);
  if(F.stage==='back'){ppSet('#ppToyG',F.pet.x+(F.face||1)*20,F.pet.y-8+bob-34*PP_SCALE);}
}
function ppFetched(){
  const p=P(); cancelAnimationFrame(PP.raf); PP.raf=0; PP.fly=null; if(!p) return;
  PP.phase='wag'; PP.streak++; p.stats.fetches++;
  const learned=petGive(p,PP_FETCH_HEARTS), knows=petKnows(petHearts(p));
  const trick=learned?learned.id:PP.streak%5===0?knows[Math.floor(Math.random()*knows.length)].id:'wiggle';
  const b=$('#ppRunBody'); if(b) b.classList.add('t-'+trick);
  ppSet('#ppToyG',PP_DROP.x-30,PP_DROP.y-8);
  ppHearts(PP_FETCH_HEARTS,PP_DROP.x,PP_DROP.y-90);
  SFX.happy(); vibrate(10);
  if(!learned) say(PP.streak%5===0?`${PP.streak} fetches! Show-off! 🌟`:['Good catch! 🎾','Again, again! 🐾','Fetch master! ✨','Woo-hoo! 💜'][PP.streak%4]);
  ppSoon(()=>{if(!PP.on) return; PP.phase='ready'; renderRoom(); if(PP.streak%PP_ASK===0) ppAsk();},trick==='wiggle'?800:1300);
  checkStickers();
}

/* ---------- taps ---------- */
// The room's click handler (section 9) hands every tap here while a game is on.
function ppTap(e){if(PP.mode==='hide') ppSeekTap(e);}
roomSvg.addEventListener('pointerdown',ppDown);
roomSvg.addEventListener('pointerup',ppUp);

STICKERS.push(
  stk('ppFind1','room','🙈','Found You!','circle','Find your pet in 🙈 Hide & Seek (tap your pet)',1,p=>p.stats.seeks||0),
  stk('ppFind','room','🔎','Seek Champ','star','Find your pet 25 times in 🙈 Hide & Seek',25,p=>p.stats.seeks||0,1),
  stk('ppFetch1','room','🎾','Good Catch','heart','Play 🎾 Fetch with your pet (tap your pet)',1,p=>p.stats.fetches||0),
  stk('ppFetch','room','🥏','Fetch Fan','scallop','Play 🎾 Fetch 50 times',50,p=>p.stats.fetches||0,1)
);
