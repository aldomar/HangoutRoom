'use strict';
/* =========================================================
   13. SOCCER FIELD: penalty kicks against three original keepers
   One canvas, drawn by the main loop only while this screen is open.
   Goal coordinates: u = across the goal (-0.5 left post .. 0.5 right post), v = height (0 grass .. 1 crossbar).
   A match is 5 kicks. Swipe up from the ball (direction = aim, speed = power and height, a bent swipe curves it),
   or tap a spot in the goal for an easy shot. Level ids (easy/medium/hard) are saved: never rename them.
   Since v1.24 the same screen has a 🧤 Keep mode (section 27); socField / socNet / socPosts / ballPos are shared.
   ========================================================= */
const SOC_KICKS=5, PERFECT_COINS=5, KEEP_H=0.74; // KEEP_H = how tall the keeper covers, arms included (goal heights)
// react = seconds before moving, speed = goal widths per second, reach = half-width covered,
// read = chance to guess the right spot, stay = chance to stay in the middle, jump = how high it can lift.
const KEEPERS={
  easy:{name:'Mochi',icon:'😺',kind:'cat',coins:1,react:0.45,speed:0.8,reach:0.17,read:0.3,stay:0.4,jump:0.1},
  medium:{name:'Boo',icon:'👻',kind:'ghost',coins:2,react:0.3,speed:1.2,reach:0.19,read:0.45,stay:0.2,jump:0.3},
  hard:{name:'Flap',icon:'🦇',kind:'bat',coins:3,react:0.18,speed:1.6,reach:0.21,read:0.6,stay:0.1,jump:0.45}
};
const KIT=[['top','jersey'],['bottom','shorts'],['legs','soccer'],['shoes','cleats']];
const hasKit=p=>KIT.filter(([c,id])=>p.look[c]===id).length>=2; // 2+ soccer items = +1 coin per goal
let SOC={state:'aim',kicks:[],shot:null,t:0,time:0,keeper:{x:0,lift:0,tilt:0},swipe:null,g:null,cheer:-9,next:0};
const socCv=$('#socCv');
const LVL_KEYS=Object.keys(KEEPERS);
const socLevel=()=>KEEPERS[P().soccer.level]||KEEPERS.easy;
// ⚽ Kick (this section) or 🧤 Keep (section 27, v1.24). The mode is saved per room in soccer.mode.
const socKeep=()=>{const p=P();return !!p&&p.soccer.mode==='keep';};

function socGeo(W,H){
  const GW=Math.min(W*0.66,H*0.36*2.4), GH=GW/2.4;
  return {W,H,GW,GH,cx:W/2,gy:H*0.5,hy:H*0.5-GH*0.55,bx:W/2,by:H*0.84,rb:Math.min(W,H)*0.05};
}
const toScr=(g,u,v)=>({x:g.cx+u*g.GW,y:g.gy-v*g.GH});

function renderSoccer(){
  if(TGS.on){tgSocRender();return;} // 👯 Duel (section 43)
  const p=P(); if(!p) return; const keep=socKeep(), lvl=keep?p.soccer.keep.level:p.soccer.level;
  $$('#socTabs [data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===(keep?'keep':'kick')));
  $$('#socTabs [data-lvl]').forEach(b=>{b.classList.toggle('on',b.dataset.lvl===lvl);b.querySelector('i').textContent=(keep?STRIKERS:KEEPERS)[b.dataset.lvl].icon;});
  $('#socTitle').textContent=keep?'🧤 Be the Keeper':'⚽ Soccer Field';
  $('#socMascot').classList.toggle('hidden',keep);
  if(keep){clearTimeout(SOC.next);SOC.swipe=null;$('#kitBadge').classList.toggle('hidden',!hasKit(p));kpRender();return;}
  kpStop();
  $('#socMascot').innerHTML=mascotSVG(p.look);
  $('#kitBadge').classList.toggle('hidden',!hasKit(p));
  newMatch(); SFX.whistle();
}
$('#socTabs').onclick=e=>{const b=e.target.closest('[data-lvl],[data-mode]');if(!b)return;const p=P();
  if(TGS.on&&tgSocTab(b))return; // 👯 Duel: a level tab sets the ball speed; Kick or Keep leaves the duel (section 43)
  if(b.dataset.mode){if(p.soccer.mode===b.dataset.mode&&!TGS.was)return;TGS.was=false;p.soccer.mode=b.dataset.mode;}
  else if(socKeep()) p.soccer.keep.level=b.dataset.lvl; else p.soccer.level=b.dataset.lvl;
  save();SFX.click();renderSoccer();};
function newMatch(){clearTimeout(SOC.next);SOC.kicks=[];$('#socMsg').classList.remove('on');resetKick();renderSocScore();}
function resetKick(){SOC.state='aim';SOC.shot=null;SOC.t=0;SOC.keeper={x:0,lift:0,tilt:0};}
function renderSocScore(){
  const p=P(); if(!p) return; const L=socLevel();
  $('#socScore').innerHTML=Array.from({length:SOC_KICKS},(_,i)=>{const k=SOC.kicks[i];
    return `<span class="dot ${k===false?'miss':''} ${i===SOC.kicks.length&&SOC.state!=='done'?'now':''}">${k?'⚽':k===false?'✖':''}</span>`;}).join('')
    +`<span class="best">🏆 Best ${p.soccer.best[p.soccer.level]||0}/${SOC_KICKS}</span>`;
  $('#socTip').textContent=SOC.state==='done'?'Tap to play again!':`${L.icon} ${L.name} is in goal! Swipe up from the ball, or tap the goal.`;
}
function socSay(txt){const m=$('#socMsg');m.textContent=txt;m.classList.remove('on');void m.offsetWidth;m.classList.add('on');}

// Takes a kick. Returns false if a kick is already flying.
function socShoot(u,v,power,curve){
  const p=P(); if(!p||SOC.state!=='aim'||SOC.kicks.length>=SOC_KICKS) return false;
  const L=socLevel(), r=Math.random(); let dive,lift;
  if(r<L.read){dive=clamp(u+(Math.random()-0.5)*0.12,-0.45,0.45);lift=clamp(v-0.45,0,L.jump);} // guessed right
  else if(r<L.read+L.stay){dive=0;lift=0;}                                                 // stays in the middle
  else {dive=Math.random()<0.5?-0.32:0.32;lift=Math.random()*L.jump*0.5;}                  // guesses a side
  SOC.shot={u,v,curve:curve||0,T:0.95/power,dive,lift,res:null};
  SOC.state='fly'; SOC.t=0; SFX.kick(); vibrate(20);
  const m=$('#socMascot'); m.classList.remove('kick'); void m.offsetWidth; m.classList.add('kick');
  p.stats.kicks++; saveSoon();
  return true;
}
function resolveShot(){
  const s=SOC.shot, k=SOC.keeper, L=socLevel(), r=0.035, p=P(); // r = ball radius in goal sizes
  let res;
  if(Math.abs(s.u)>0.5+r) res='wide'; else if(s.v>1+r) res='over';
  else if(Math.abs(s.u)>0.5-r||s.v>1-r) res='post';
  else if(Math.abs(s.u-k.x)<L.reach+r&&s.v>k.lift-r&&s.v<k.lift+KEEP_H+r) res='saved';
  else res='goal';
  s.res=res; SOC.state='result'; SOC.kicks.push(res==='goal');
  if(res==='goal'){
    p.stats.goals++; SOC.cheer=SOC.time; SFX.cheer(); vibrate(30);
    const pt=toScr(SOC.g,s.u,s.v), rc=socCv.getBoundingClientRect();
    earn(L.coins+(hasKit(p)?1:0),'GOAL!',rc.left+pt.x,rc.top+pt.y); socSay('GOAL! ⚽');
  } else {
    save();
    if(res==='saved'){SFX.save();socSay(`Saved by ${L.name}!`);}
    else if(res==='post'){SFX.post();socSay(Math.abs(s.u)<=0.5-r?'Hit the bar!':'Off the post!');}
    else {SFX.whoosh();socSay(res==='over'?'Over the bar!':'Wide!');}
  }
  renderSocScore();
  clearTimeout(SOC.next); SOC.next=setTimeout(nextKick,1500);
}
function nextKick(){
  if(cur!=='soccer'||SOC.state!=='result') return;
  if(SOC.kicks.length>=SOC_KICKS) endMatch(); else {resetKick();renderSocScore();}
}
// Trophies: a perfect 5/5 on a level wins that level's trophy once, as a room decoration (placed in the room).
// Ids are saved in soccer.trophies (level ids) and as room items (DECOR keys): never rename them.
const TROPHIES={easy:'trophyBronze',medium:'trophySilver',hard:'trophyGold'};
function giveTrophies(){
  const p=P(); if(!p) return [];
  const won=LVL_KEYS.filter(l=>(p.soccer.best[l]||0)>=SOC_KICKS&&!p.soccer.trophies.includes(l));
  won.forEach(l=>{const type=TROPHIES[l];p.soccer.trophies.push(l);p.room.items.push(Object.assign({uid:uid(),type,placed:true},spot(type)));});
  if(won.length) save();
  return won.map(l=>DECOR[TROPHIES[l]].name);
}
function endMatch(){
  const p=P(), lvl=p.soccer.level, L=socLevel(), goals=SOC.kicks.filter(Boolean).length;
  SOC.state='done'; p.stats.matches++;
  const best=goals>(p.soccer.best[lvl]||0); if(best) p.soccer.best[lvl]=goals;
  if(goals===SOC_KICKS){p.stats.perfects++;earn(PERFECT_COINS,'Perfect!');} else save();
  const trophies=giveTrophies();
  SFX.whistle(); renderSocScore(); if(trophies.length) setTimeout(SFX.buy,400);
  const line=goals===SOC_KICKS?'PERFECT! 🌟':goals>=3?'Great kicks! ✨':goals>=1?'Nice! Keep practising 💪':`${L.name} was on fire! Try again? ${L.icon}`;
  const tro=trophies.map(n=>`<div style="margin-top:10px">You won the <b>${n}</b>! It's in your room 🏆</div><svg viewBox="${DECOR[TROPHIES[lvl]].box}" style="height:110px">${DECOR[TROPHIES[lvl]].d()}</svg>`).join('');
  modal(`⚽ ${goals} / ${SOC_KICKS} goals!`,`<div style="text-align:center;font-size:18px">${line}${best&&goals?`<br>New best on ${lvl[0].toUpperCase()+lvl.slice(1)}! 🏆`:''}${tro}</div>`,
    [{text:'⬅ Room',cls:'ghost',on:()=>show('room')},{text:'Play again',cls:'pink',on:()=>{newMatch();SFX.whistle();}}]);
  checkBonus(); // e.g. "First Goal!" (shown as a message, because the result box is open)
}

// Touch: a short tap aims at that spot in the goal; a swipe up shoots along its direction.
socCv.addEventListener('pointerdown',e=>{
  if(TGS.on){tgDown(e);return;} // 👯 Duel (section 43)
  if(socKeep()){kpDown(e);return;}
  if(SOC.state==='done'){newMatch();SFX.whistle();return;}
  if(SOC.state!=='aim') return;
  const r=socCv.getBoundingClientRect(); SOC.swipe=[[e.clientX-r.left,e.clientY-r.top,performance.now()]];
  try{socCv.setPointerCapture(e.pointerId);}catch(_){}
});
socCv.addEventListener('pointermove',e=>{if(TGS.on){tgMove(e);return;}if(socKeep()){kpMove(e);return;}if(!SOC.swipe)return;const r=socCv.getBoundingClientRect();SOC.swipe.push([e.clientX-r.left,e.clientY-r.top,performance.now()]);});
function socRelease(){
  const sw=SOC.swipe, g=SOC.g; SOC.swipe=null; if(!sw||!g||SOC.state!=='aim') return;
  const s=socAim(sw,g);
  if(s.tap){if(Math.abs(s.u)<0.75&&s.v>-0.2&&s.v<1.4) socShoot(s.u,clamp(s.v,0.03,1.3),1,0); else toast('Swipe up from the ball, or tap the goal! ⚽');}
  else if(s.err) toast(s.err); else socShoot(s.u,s.v,s.power,s.curve);
}
// A swipe (points [x, y, ms]) as a shot: {u, v, power, curve}, or {tap:1, u, v} for a short tap, or {err} (v1.42: shared with 👯 Duel).
function socAim(sw,g){
  const a=sw[0], b=sw[sw.length-1], dx=b[0]-a[0], dy=b[1]-a[1], len=Math.hypot(dx,dy);
  if(len<14) return {tap:1,u:(a[0]-g.cx)/g.GW,v:(g.gy-a[1])/g.GH}; // tap
  if(dy>-20) return {err:'Swipe UP toward the goal! ⚽'};
  // Power comes from the flick: the finger speed over the last 0.12 s (a pause before flicking doesn't count),
  // or the whole swipe if that was faster (a pause at the end doesn't count either). Speed is in px per ms.
  let i=sw.length-1; while(i>0&&b[2]-sw[i-1][2]<=120) i--;
  const c=sw[i], recent=Math.hypot(b[0]-c[0],b[1]-c[1])/Math.max(16,b[2]-c[2]), whole=len/Math.max(16,b[2]-a[2]);
  const power=clamp(0.7+Math.max(recent,whole)*0.45,0.8,1.8); // slow drag 0.8 (about a tap), quick flick 1.8
  // Height grows with power, up to the top corners; only a tap above the bar goes over it.
  const v=clamp(0.12+(power-0.8)*0.75,0.05,0.9);
  const midY=g.gy-g.GH*0.5, k=(g.by-midY)/(-dy), u=(g.bx+dx*k-g.cx)/g.GW; // where the swipe direction meets the goal
  const m=sw[Math.floor(sw.length/2)], lineX=a[0]+dx*((m[1]-a[1])/dy); // the middle of the swipe vs a straight line
  return {u,v,power,curve:clamp((m[0]-lineX)/g.GW*1.5,-0.5,0.5)};
}
socCv.addEventListener('pointerup',e=>{ // add where the finger lifted, then shoot
  if(TGS.on){tgUp(e);return;}
  if(socKeep()){kpUp(e);return;}
  if(SOC.swipe){const r=socCv.getBoundingClientRect();SOC.swipe.push([e.clientX-r.left,e.clientY-r.top,performance.now()]);}
  socRelease();
});
socCv.addEventListener('pointercancel',()=>{SOC.swipe=null;KP.swipe=null;});

// Where the ball is at time t (0 = on the spot, 1 = at the goal, >1 = what happens after).
function ballPos(g,s,t){
  const e=Math.min(t,1), tx=g.cx+s.u*g.GW;
  let x=g.bx+(tx-g.bx)*e+s.curve*g.GW*0.3*Math.sin(Math.PI*e), gy=g.by+(g.gy-g.by)*e;
  let h=s.v*g.GH*e+Math.sin(Math.PI*e)*g.GH*0.12, r=g.rb*(1-0.58*e), a=1;
  if(t>1){const q=Math.min(1,(t-1)*2.2);
    if(s.res==='saved'){x+=(g.bx-tx)*0.25*q;gy+=(g.by-g.gy)*0.3*q;h*=1-q;r*=1+0.5*q;}
    else if(s.res==='post'){x+=Math.sign(s.u||1)*g.GW*0.25*q;h*=1-q*0.7;}
    else if(s.res==='goal'){h=h*(1-q)+g.GH*0.05*q;r*=1-0.12*q;}
    else {x+=(tx-g.bx)*0.2*q;h+=g.GH*0.2*q;r*=1-0.3*q;a=1-q;}}
  return {gx:x,gy,x,y:gy-h,r,a};
}
function drawBall(ctx,b,rot){
  ctx.globalAlpha=b.a; ctx.fillStyle='#00000035'; ctx.beginPath(); ctx.ellipse(b.gx,b.gy,b.r*1.1,b.r*0.35,0,0,TAU); ctx.fill();
  ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(rot);
  ctx.fillStyle='#fff'; ctx.strokeStyle='#333'; ctx.lineWidth=Math.max(1,b.r*0.12);
  ctx.beginPath(); ctx.arc(0,0,b.r,0,TAU); ctx.fill(); ctx.stroke();
  const pt=(i,k)=>{const a=-Math.PI/2+i*TAU/5;return [Math.cos(a)*b.r*k,Math.sin(a)*b.r*k];};
  ctx.fillStyle='#333'; ctx.beginPath(); for(let i=0;i<5;i++) ctx.lineTo(...pt(i,0.38)); ctx.closePath(); ctx.fill();
  for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(...pt(i,0.38));ctx.lineTo(...pt(i,0.95));ctx.stroke();}
  ctx.restore(); ctx.globalAlpha=1;
}

// The three keepers, drawn in a 100-tall box with (0,0) at their feet. pose: 0 = standing, 1 = arms up in a dive.
function kC(ctx,x,y,r,f){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=f;ctx.fill();ctx.stroke();}
function kE(ctx,x,y,rx,ry,f,line){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=f;ctx.fill();if(line!==false)ctx.stroke();}
function kArms(ctx,fur,glove,pose,bob){
  [-1,1].forEach(sd=>{const hx=sd*(46-14*pose), hy=-40-72*pose+bob;
    ctx.beginPath();ctx.moveTo(sd*24,-56);ctx.lineTo(hx,hy);ctx.lineWidth=15;ctx.strokeStyle='#3b2f52';ctx.stroke();ctx.lineWidth=9;ctx.strokeStyle=fur;ctx.stroke();
    ctx.lineWidth=4;ctx.strokeStyle='#3b2f52';kC(ctx,hx,hy,11,glove);});
}
function kFace(ctx,y,awake,dark){
  const ink=dark?'#1a1422':'#2a1f33';
  if(awake){[-12,12].forEach(x=>{kE(ctx,x,y,5,6.5,ink,false);kC(ctx,x+1.5,y-2.5,1.8,'#fff');});}
  else {ctx.beginPath();ctx.arc(-12,y-2,5,0.2,Math.PI-0.2);ctx.moveTo(17,y-1);ctx.arc(12,y-2,5,0.2,Math.PI-0.2);ctx.stroke();}
  ctx.globalAlpha=.55;kE(ctx,-21,y+9,6,3.5,'#ff8fb8',false);kE(ctx,21,y+9,6,3.5,'#ff8fb8',false);ctx.globalAlpha=1;
}
function drawKeeper(ctx,kind,x,y,s,tilt,pose,time,awake){
  ctx.save(); ctx.translate(x,y); ctx.rotate(tilt); ctx.scale(s/100,s/100);
  ctx.lineJoin='round'; ctx.lineCap='round'; ctx.lineWidth=4; ctx.strokeStyle='#3b2f52';
  const bob=Math.sin(time*2.4)*2;
  if(kind==='cat'){ // Mochi: a sleepy cream cat in a yellow keeper top
    const fur='#f8ecd8';
    ctx.beginPath();ctx.moveTo(22,-12);ctx.quadraticCurveTo(56,-26,44,-60);ctx.lineWidth=14;ctx.stroke();ctx.lineWidth=8;ctx.strokeStyle=fur;ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle='#3b2f52';
    kE(ctx,-14,-4,13,7,fur);kE(ctx,14,-4,13,7,fur);
    kE(ctx,0,-36,30,32,'#ffd166');
    kArms(ctx,fur,'#ff8cc6',pose,bob);
    [-1,1].forEach(sd=>{ctx.beginPath();ctx.moveTo(sd*26,-92+bob);ctx.lineTo(sd*16,-114+bob);ctx.lineTo(sd*6,-102+bob);ctx.closePath();ctx.fillStyle=fur;ctx.fill();ctx.stroke();});
    kC(ctx,0,-78+bob,30,fur);
    ctx.strokeStyle='#f2b36b';ctx.lineWidth=3.5;[-7,0,7].forEach(x=>{ctx.beginPath();ctx.moveTo(x,-106+bob);ctx.lineTo(x,-97+bob);ctx.stroke();});
    ctx.strokeStyle='#3b2f52';ctx.lineWidth=3;kFace(ctx,-78+bob,awake);
    ctx.fillStyle='#ff8fb8';ctx.beginPath();ctx.moveTo(-3,-70+bob);ctx.lineTo(3,-70+bob);ctx.lineTo(0,-66+bob);ctx.fill();
  } else if(kind==='ghost'){ // Boo: a fluffy little ghost with purple gloves
    ctx.translate(0,-8+Math.sin(time*2)*5);
    kArms(ctx,'#fbf7ff','#a97cff',pose,0);
    ctx.beginPath();ctx.moveTo(-36,0);ctx.lineTo(-36,-60);ctx.quadraticCurveTo(-36,-112,0,-112);ctx.quadraticCurveTo(36,-112,36,-60);ctx.lineTo(36,0);
    [18,0,-18,-36].forEach((x,i)=>ctx.quadraticCurveTo(x+9,-11,x,0));ctx.closePath();ctx.fillStyle='#fbf7ff';ctx.fill();ctx.stroke();
    ctx.fillStyle='#a97cff';ctx.fillRect(-33,-92,66,8);
    ctx.lineWidth=3;kFace(ctx,-66,true);
    kE(ctx,0,-52,4,5,'#2a1f33',false);
  } else { // Flap: a chubby purple bat with mint gloves
    const flap=Math.sin(time*(awake?16:6))*0.35;
    [-1,1].forEach(sd=>{ctx.save();ctx.translate(sd*28,-58);ctx.scale(sd,1);ctx.rotate(-flap-pose*0.5);
      ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(30,-34,64,-16);ctx.quadraticCurveTo(54,-6,56,6);ctx.quadraticCurveTo(42,-2,38,12);ctx.quadraticCurveTo(24,2,0,16);ctx.closePath();
      ctx.fillStyle='#4c2d91';ctx.fill();ctx.stroke();ctx.restore();});
    kE(ctx,-12,-6,9,6,'#6b46b8');kE(ctx,12,-6,9,6,'#6b46b8');
    kArms(ctx,'#6b46b8','#8ff0d0',pose,bob);
    [-1,1].forEach(sd=>{ctx.beginPath();ctx.moveTo(sd*26,-76+bob);ctx.lineTo(sd*20,-104+bob);ctx.lineTo(sd*6,-86+bob);ctx.closePath();ctx.fillStyle='#6b46b8';ctx.fill();ctx.stroke();});
    kC(ctx,0,-52+bob,36,'#6b46b8'); kE(ctx,0,-38+bob,20,16,'#9b7be0',false);
    [-13,13].forEach(x=>{kC(ctx,x,-62+bob,9,'#fff');kE(ctx,x+1,-61+bob,4.5,5.5,'#1a1422',false);});
    ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(4,-46+bob);ctx.lineTo(10,-46+bob);ctx.lineTo(7,-40+bob);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}

function drawSoccer(dt){
  if(TGS.on){tgDraw(dt);return;} // 👯 Duel (section 43)
  if(socKeep()){drawKeep(dt);return;} // 🧤 Keep mode (section 27)
  const {ctx,W,H}=fit(socCv), g=socGeo(W,H), L=socLevel(), k=SOC.keeper, s=SOC.shot; SOC.g=g; SOC.time+=dt;
  // keeper + ball movement
  if(s&&(SOC.state==='fly'||SOC.state==='result')){
    SOC.t+=dt/s.T;
    if(SOC.t*s.T>L.react){const d=s.dive-k.x, step=L.speed*dt; k.x+=Math.abs(d)<step?d:Math.sign(d)*step;
      const f=Math.min(1,dt*8); k.lift+=(s.lift-k.lift)*f; k.tilt+=(clamp(s.dive/0.32,-1,1)*0.85-k.tilt)*f;}
    if(SOC.state==='fly'&&SOC.t>=1) resolveShot();
  } else {const f=Math.min(1,dt*5);k.x-=k.x*f;k.lift-=k.lift*f;k.tilt-=k.tilt*f;}
  socField(ctx,g,W,H,SOC.time,SOC.time-SOC.cheer<1.6);
  // goal: net (shakes after a goal), keeper, then posts in front
  const inNet=s&&s.res==='goal'&&SOC.t>1, shake=inNet?Math.sin(SOC.time*30)*Math.max(0,1-(SOC.t-1)*1.2)*g.GH*0.03:0;
  socNet(ctx,g,shake,inNet?()=>drawBall(ctx,ballPos(g,s,SOC.t),SOC.t*12):null);
  const kx=g.cx+k.x*g.GW, ky=g.gy-k.lift*g.GH, ks=g.GH*0.62, pose=clamp(Math.max(Math.abs(k.tilt)/0.85,k.lift/0.15),0,1);
  ctx.fillStyle='#00000030'; ctx.beginPath(); ctx.ellipse(kx,g.gy,ks*0.4,ks*0.08,0,0,TAU); ctx.fill();
  drawKeeper(ctx,L.kind,kx,ky,ks,k.tilt,pose,SOC.time,SOC.state!=='aim'||L.kind!=='cat');
  if(L.kind==='cat'&&SOC.state==='aim'){const z=(SOC.time*0.6)%1;ctx.globalAlpha=1-z;ctx.fillStyle='#fff';ctx.font=`900 ${Math.round(ks*0.18)}px sans-serif`;ctx.fillText('z',kx+ks*0.3+z*ks*0.15,ky-ks*1.1-z*ks*0.3);ctx.globalAlpha=1;}
  socPosts(ctx,g);
  // ball (plus a pulsing ring and an aim line while she is getting ready)
  if(!s){
    ctx.strokeStyle='#ffd166'; ctx.lineWidth=3; ctx.globalAlpha=0.5+0.4*Math.sin(SOC.time*4);
    ctx.beginPath(); ctx.arc(g.bx,g.by,g.rb*(1.6+0.15*Math.sin(SOC.time*4)),0,TAU); ctx.stroke(); ctx.globalAlpha=1;
    const sw=SOC.swipe; if(sw&&sw.length>1){const a=sw[0],b=sw[sw.length-1];
      if(b[1]<a[1]-10){ctx.setLineDash([8,8]);ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(g.bx,g.by);ctx.lineTo(g.bx+(b[0]-a[0])*1.5,g.by+(b[1]-a[1])*1.5);ctx.stroke();ctx.setLineDash([]);}}
    drawBall(ctx,{gx:g.bx,gy:g.by,x:g.bx,y:g.by,r:g.rb,a:1},0);
  } else if(!inNet) drawBall(ctx,ballPos(g,s,SOC.t),Math.min(SOC.t,1.6)*12);
}
// The stadium, grass, pitch lines and penalty spot (shared by ⚽ Kick and 🧤 Keep). cheering = the crowd jumps.
function socField(ctx,g,W,H,time,cheering){
  // sky, sun, clouds
  const sky=ctx.createLinearGradient(0,0,0,g.hy); sky.addColorStop(0,'#7fd0ff'); sky.addColorStop(1,'#e0f6ff');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,g.hy);
  ctx.fillStyle='#ffe066'; ctx.beginPath(); ctx.arc(W*0.86,g.hy*0.3,Math.min(W,H)*0.05,0,TAU); ctx.fill();
  ctx.fillStyle='#ffffffdd'; [[0.18,0.25],[0.55,0.15]].forEach(([fx,fy])=>{const cx=W*fx+Math.sin(time*0.1)*20,cy=g.hy*fy+10,r=Math.min(W,H)*0.035;[[-1.2,0.3,1],[0,0,1.3],[1.2,0.3,0.9]].forEach(([ox,oy,k2])=>{ctx.beginPath();ctx.arc(cx+ox*r,cy+oy*r,r*k2,0,TAU);ctx.fill();});});
  // stands with a cheering crowd (just colored dots)
  const y0=g.hy-g.GH*0.55, cr=(g.hy-y0)/7, cols=['#ff8cc6','#a97cff','#8ff0d0','#ffd166','#4dabf7','#ff6b8a'];
  ctx.fillStyle='#4a3d63'; ctx.fillRect(0,y0,W,g.hy-y0);
  for(let row=0;row<3;row++) for(let i=0,x=cr*(row%2?2.2:1.2);x<W;i++,x+=cr*2.4){
    const jump=cheering?Math.abs(Math.sin(time*12+i*1.7))*cr*0.8:0;
    ctx.fillStyle=cols[(i*7+row*3)%cols.length]; ctx.beginPath(); ctx.arc(x,y0+cr*(1.4+row*2)-jump,cr*0.85,0,TAU); ctx.fill();}
  // grass with stripes that get wider toward you, and the pitch lines
  ctx.fillStyle='#5cb85f'; ctx.fillRect(0,g.hy,W,H-g.hy);
  ctx.fillStyle='#ffffff16'; for(let i=0;i<10;i+=2){const ya=g.hy+(H-g.hy)*Math.pow(i/10,1.6), yb=g.hy+(H-g.hy)*Math.pow((i+1)/10,1.6);ctx.fillRect(0,ya,W,yb-ya);}
  ctx.strokeStyle='#ffffffcc'; ctx.lineWidth=Math.max(2,g.GH*0.025);
  const fy=g.gy+(H-g.gy)*0.62;
  ctx.beginPath(); ctx.moveTo(0,g.gy); ctx.lineTo(W,g.gy);
  ctx.moveTo(g.cx-g.GW*1.15,g.gy); ctx.lineTo(g.cx-g.GW*1.7,fy); ctx.lineTo(g.cx+g.GW*1.7,fy); ctx.lineTo(g.cx+g.GW*1.15,g.gy);
  ctx.moveTo(g.cx-g.GW*0.7,g.gy); ctx.lineTo(g.cx-g.GW*0.8,g.gy+(H-g.gy)*0.18); ctx.lineTo(g.cx+g.GW*0.8,g.gy+(H-g.gy)*0.18); ctx.lineTo(g.cx+g.GW*0.7,g.gy); ctx.stroke();
  ctx.fillStyle='#ffffffcc'; ctx.beginPath(); ctx.ellipse(g.bx,g.by+g.rb*0.9,g.rb*0.5,g.rb*0.18,0,0,TAU); ctx.fill();
}
// The goal's back and net (with a ball inside after a goal, via inside()), then the posts in front of the keeper.
function socNet(ctx,g,shake,inside){
  const gl=g.cx-g.GW/2, gt=g.gy-g.GH;
  ctx.fillStyle='#ffffff26'; ctx.fillRect(gl,gt,g.GW,g.GH);
  if(inside) inside();
  ctx.strokeStyle='#ffffff99'; ctx.lineWidth=1.2; ctx.beginPath();
  for(let i=1;i<14;i++){const x=gl+g.GW*i/14;ctx.moveTo(x,gt);ctx.lineTo(x+shake,g.gy);}
  for(let i=1;i<6;i++){const y=gt+g.GH*i/6;ctx.moveTo(gl,y+shake);ctx.lineTo(gl+g.GW,y+shake);} ctx.stroke();
}
function socPosts(ctx,g){
  const gl=g.cx-g.GW/2, gt=g.gy-g.GH;
  ctx.strokeStyle='#fff'; ctx.lineWidth=Math.max(4,g.GH*0.06); ctx.lineJoin='round';
  ctx.beginPath(); ctx.moveTo(gl,g.gy); ctx.lineTo(gl,gt); ctx.lineTo(gl+g.GW,gt); ctx.lineTo(gl+g.GW,g.gy); ctx.stroke();
}
