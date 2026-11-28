'use strict';
/* =========================================================
   54. TRICK SHOTS (v1.53): Soccer's 🎯 Tricks mode, 12 fixed trick shots
   Same field, ball and swipe as ⚽ Kick (socAim, ballPos; tap the goal for a straight shot, a bent swipe curves it),
   but no keeper: Mochi, Boo and Flap cheer at the side, or stand together as a wall in front of the goal.
   A trick is one TRICKS entry: targets in the goal (u across -0.5..0.5, v up 0..1; r in goal heights; mu/mv make one
   move: {a, w} = size and speed of a slow swing), an optional wall {e, u0, u1, h} (e = how far along the ball's path,
   u0..u1 = where the ball passes at that point, h = height), order = hit the targets left to right, and sol = one shot
   [u, v, power, curve] per target that works (the smoke test proves them, and they draw the 💡 hint after 3 misses).
   Unlimited tries, nothing counted against her. Trick ids (t1…) are saved in soccer.tricks: never rename them; new tricks
   go at the end. Coins: +TR_COINS the first time, +1 a replay, TR_DAILY a day. All 12 = the Trick Shot Star (Backyard).
   ========================================================= */
const TR_COINS=3, TR_REPLAY=1, TR_DAILY=10, TR_BALL_U=0.035, TR_BALL_V=0.084; // the ball's radius across / up (goal sizes)
const TRICKS=[
  {id:'t1',icon:'⭐',name:'Star Kick',say:'Kick the ball into the big star!',targets:[{k:'star',u:0,v:0.45,r:0.24}],sol:[[0,0.45,1,0]]},
  {id:'t2',icon:'↖️',name:'Top Corner',say:'Hit the star in the top corner!',targets:[{k:'star',u:-0.36,v:0.78,r:0.18}],sol:[[-0.36,0.78,1,0]]},
  {id:'t3',icon:'↘️',name:'Low and Right',say:'Keep it low! A soft kick hits the star by the grass.',targets:[{k:'star',u:0.34,v:0.14,r:0.17}],sol:[[0.34,0.14,1,0]]},
  {id:'t4',icon:'🍩',name:'Hoop Shot',say:'Kick it through the hoop!',targets:[{k:'hoop',u:0.18,v:0.55,r:0.16}],sol:[[0.18,0.55,1,0]]},
  {id:'t5',icon:'🎈',name:'Balloon Pop',say:'Pop all 3 balloons!',targets:[{k:'balloon',u:-0.3,v:0.6,r:0.17,col:'#ff8cc6'},{k:'balloon',u:0,v:0.6,r:0.17,col:'#ffd166'},{k:'balloon',u:0.3,v:0.6,r:0.17,col:'#8ff0d0'}],
    sol:[[-0.3,0.6,1,0],[0,0.6,1,0],[0.3,0.6,1,0]]},
  {id:'t6',icon:'🔔',name:'Ring the Bell',say:'Ring the bell under the crossbar!',targets:[{k:'bell',u:-0.15,v:0.86,r:0.14}],sol:[[-0.15,0.88,1,0]]},
  {id:'t7',icon:'🧱',name:'Over the Wall',say:'Chip it over the wall! Kick high (or tap high in the goal).',wall:{e:0.5,u0:-0.2,u1:0.2,h:0.42},
    targets:[{k:'star',u:0,v:0.72,r:0.17}],sol:[[0,0.82,1,0]]},
  {id:'t8',icon:'🌀',name:'Curve It',say:'Bend the ball around the wall! Swipe in a curve to the right.',wall:{e:0.5,u0:-0.45,u1:-0.12,h:0.42},
    targets:[{k:'star',u:-0.3,v:0.3,r:0.17}],sol:[[-0.3,0.3,1.2,0.35]]},
  {id:'t9',icon:'🎯',name:'Moving Star',say:'The star slides! Kick where it will be.',targets:[{k:'star',u:0,v:0.5,r:0.22,mu:{a:0.3,w:0.8}}],sol:[[0,0.5,1,0]]},
  {id:'t10',icon:'🦇',name:'Bat Hoop',say:'A little bat holds the hoop. Kick it through!',targets:[{k:'bathoop',u:-0.25,v:0.5,r:0.16,mv:{a:0.22,w:1.1}}],sol:[[-0.25,0.5,1,0]]},
  {id:'t11',icon:'🍌',name:'Banana Kick',say:'Curve it around the wall and through the hoop! Swipe in a curve to the left.',wall:{e:0.5,u0:0.1,u1:0.43,h:0.42},
    targets:[{k:'hoop',u:0.3,v:0.4,r:0.16}],sol:[[0.3,0.4,1.2,-0.4]]},
  {id:'t12',icon:'🌈',name:'Rainbow Row',say:'Hit the red, then the yellow, then the blue star!',order:1,
    targets:[{k:'star',u:-0.32,v:0.5,r:0.17,col:'#ff6b8a'},{k:'star',u:0,v:0.5,r:0.17,col:'#ffd166'},{k:'star',u:0.32,v:0.5,r:0.17,col:'#4dabf7'}],
    sol:[[-0.32,0.5,1,0],[0,0.5,1,0],[0.32,0.5,1,0]]}
];
const TR_CURVE=['t8','t11']; // the tricks that need a bent swipe (🍌 Banana Kick sticker)
const TR_PRIZE='trickStar';
let TR={state:'aim',shot:null,t:0,time:0,swipe:null,g:null,hit:[],miss:0,cheer:-9,next:0,fx:[]};
const trIdx=p=>Math.max(0,TRICKS.findIndex(t=>t.id===p.soccer.trick));
const trCur=()=>TRICKS[trIdx(P())];
const trDoneN=p=>TRICKS.filter(t=>p.soccer.tricks.includes(t.id)).length;

/* ---------- the rules (no drawing): where the targets are, walls, what a shot hits ---------- */
function trTargets(tr,time){
  return tr.targets.map((t,i)=>Object.assign({},t,{i,u:t.u+(t.mu?t.mu.a*Math.sin(time*t.mu.w):0),v:t.v+(t.mv?t.mv.a*Math.sin(time*t.mv.w):0)}));
}
// Where the ball is when it passes the wall (the same path ballPos draws), and whether the wall stops it.
function trAtWall(w,s){const e=w.e;return {u:s.u*e+s.curve*0.3*Math.sin(Math.PI*e),v:s.v*e+0.12*Math.sin(Math.PI*e)};}
function trWallHit(w,s){const b=trAtWall(w,s);return b.u+TR_BALL_U>w.u0&&b.u-TR_BALL_U<w.u1&&b.v-TR_BALL_V<w.h;}
// A shot s {u, v, curve} against trick tr at time (s), with hit[] = targets already hit. Returns {res, target}:
// res 'wall' | 'wide' | 'over' | 'post' | 'goal' (like ⚽ Kick), target = the index of the target it hit, or -1.
function trJudge(tr,s,time,hit){
  if(tr.wall&&trWallHit(tr.wall,s)) return {res:'wall',target:-1};
  const r=TR_BALL_U; let res;
  if(Math.abs(s.u)>0.5+r) res='wide'; else if(s.v>1+r) res='over'; else if(Math.abs(s.u)>0.5-r||s.v>1-r) res='post'; else res='goal';
  let left=trTargets(tr,time).filter(t=>!hit[t.i]); if(tr.order) left=left.slice(0,1);
  const t=res==='wide'?null:left.find(t=>Math.hypot((s.u-t.u)*2.4,s.v-t.v)<=t.r+0.06);
  return {res,target:t?t.i:-1};
}

/* ---------- the screen ---------- */
function trRender(){
  const p=P(); if(!p) return; const i=trIdx(p), tr=TRICKS[i], done=p.soccer.tricks.includes(tr.id);
  $('#trBar').innerHTML=`<button class="btn ghost tr-arrow" data-tr="-1" aria-label="Back one trick">◀</button>`
    +`<button class="btn tr-name${done?' done':''}" id="trPick" aria-label="Pick a trick"><span class="tr-i">${tr.icon}</span> <span class="tn">${esc(tr.name)}</span>${done?' ✅':''}</button>`
    +`<button class="btn ghost tr-arrow" data-tr="1" aria-label="Next trick">▶</button>`
    +`<span class="tr-count" aria-label="${trDoneN(p)} tricks done">🎯 ${trDoneN(p)}/${TRICKS.length}</span>`;
  trReset();
}
function trReset(){clearTimeout(TR.next);Object.assign(TR,{state:'aim',shot:null,t:0,swipe:null,hit:[],miss:0,fx:[]});$('#socMsg').classList.remove('on');trScore();}
function trScore(){ // dots for tricks with more than one target; the tip line says the trick
  const tr=trCur(), n=tr.targets.length;
  $('#socScore').innerHTML=n>1?tr.targets.map((t,i)=>`<span class="dot${TR.hit[i]?'':' miss'}">${TR.hit[i]?(t.k==='balloon'?'🎈':'⭐'):''}</span>`).join(''):'';
  $('#socTip').textContent=TR.miss>=3?'💡 Follow the dotted line! '+tr.say:tr.say;
}
function trGo(i){
  const p=P(); i=((i%TRICKS.length)+TRICKS.length)%TRICKS.length;
  p.soccer.trick=TRICKS[i].id; save(); trRender();
}
$('#trBar').onclick=e=>{
  const b=e.target.closest('button'); if(!b||!P()) return; SFX.click();
  if(b.dataset.tr) trGo(trIdx(P())+Number(b.dataset.tr)); else if(b.id==='trPick') trPicker();
};
function trPicker(){
  const p=P();
  modal('🎯 Trick Shots',`<div class="tr-grid">`+TRICKS.map((t,i)=>{const d=p.soccer.tricks.includes(t.id);
    return `<button class="tr-card${d?' done':''}${i===trIdx(p)?' on':''}" data-pick="${i}" aria-label="${esc(t.name)}"><span class="tr-i">${t.icon}</span><span class="tn">${esc(t.name)}</span>${d?'<b>✅</b>':''}</button>`;}).join('')+'</div>',
    [{text:'✖',cls:'ghost'}]);
  $('#modalBody .tr-grid').onclick=e=>{const b=e.target.closest('[data-pick]');if(!b)return;SFX.click();closeModal();trGo(+b.dataset.pick);};
}

/* ---------- kicking ---------- */
function trShoot(u,v,power,curve){
  const p=P(), tr=trCur(); if(!p||TR.state!=='aim') return false;
  const s={u,v,curve:curve||0,T:0.95/power,res:null,block:null};
  if(tr.wall&&trWallHit(tr.wall,s)) s.block=tr.wall.e;
  TR.shot=s; TR.state='fly'; TR.t=0; SFX.kick(); vibrate(20);
  const m=$('#socMascot'); m.classList.remove('kick'); void m.offsetWidth; m.classList.add('kick');
  return true;
}
function trResolve(){
  const p=P(), tr=trCur(), s=TR.shot, j=trJudge(tr,s,TR.time,TR.hit);
  s.res=j.res; TR.state='result';
  if(j.target>=0){
    TR.hit[j.target]=true; vibrate(25);
    const t=trTargets(tr,TR.time)[j.target], pt=TR.g&&toScr(TR.g,t.u,t.v);
    if(pt) for(let k=0;k<14;k++){const a=Math.random()*TAU,sp=80+Math.random()*160;TR.fx.push({x:pt.x,y:pt.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-60,col:t.col||['#ffd166','#ff8cc6','#8ff0d0'][k%3],t:0});}
    if(t.k==='balloon') SFX.pop(); else SFX.happy();
    if(TR.hit.filter(Boolean).length>=tr.targets.length){TR.cheer=TR.time;SFX.cheer();socSay('TRICK! 🎉');trScore();TR.next=setTimeout(trWin,900);return;}
    const left=tr.targets.length-TR.hit.filter(Boolean).length;
    socSay(t.k==='balloon'?`Pop! ${left} more 🎈`:`Yes! ${left} more ⭐`);
  } else {
    TR.miss++;
    if(j.res==='wall'){SFX.save();socSay('Bonk! Try again 🧱');}
    else if(j.res==='post'){SFX.post();socSay('Off the post! Try again');}
    else if(j.res==='goal'){SFX.whoosh();socSay('Goal! Now hit the '+tr.icon);}
    else {SFX.whoosh();socSay('So close! Try again ⚽');}
  }
  trScore(); clearTimeout(TR.next); TR.next=setTimeout(trAgain,1300);
}
function trAgain(){
  if(cur!=='soccer'||!socTrick()||TR.state!=='result') return;
  TR.state='aim'; TR.shot=null; TR.t=0; trScore();
}
function trWin(){
  const p=P(); if(!p||cur!=='soccer'||!socTrick()) return;
  const tr=trCur(), first=!p.soccer.tricks.includes(tr.id); TR.state='done';
  p.stats.tricks++; let line;
  if(first){p.soccer.tricks.push(tr.id);earn(TR_COINS,'Trick!');line=`New trick! +${TR_COINS} 🪙`;}
  else {if(dailyPay(p.soccer.trickPay,TR_DAILY,1)){earn(TR_REPLAY,'Trick!');line=`+${TR_REPLAY} 🪙`;}
    else {save();line='Trick coins are full for today. Keep kicking for fun ✨';}}
  const prize=trGivePrize(), D=DECOR[TR_PRIZE];
  const nextI=TRICKS.findIndex((t,i)=>i>trIdx(p)&&!p.soccer.tricks.includes(t.id)), go=nextI>=0?nextI:TRICKS.findIndex(t=>!p.soccer.tricks.includes(t.id));
  endBox({title:`🎉 ${tr.icon} ${esc(tr.name)}`,body:`<div style="text-align:center;font-size:18px">You did the trick! ⚽<br><b>${line}</b><br>🎯 ${trDoneN(p)} / ${TRICKS.length} tricks`
    +(prize?`<div style="margin-top:10px">You did all ${TRICKS.length}! The <b>${D.name}</b> is in your Backyard 🏅</div><svg viewBox="${D.box}" style="height:120px">${D.d()}</svg>`:'')+'</div>',
    back:{to:'room',on:()=>show('room')},mid:[{text:'🔁 Again',on:trRender}],go:{text:'▶ Next trick',on:()=>trGo(go>=0?go:trIdx(p)+1)}}); // section 76
  if(prize) setTimeout(SFX.buy,400);
  trRender(); // ready for another go behind the box
  checkStickers();
}
// All 12 tricks: the Trick Shot Star goes into the Backyard, once (like the keeper gloves).
function trGivePrize(){
  const p=P(); if(!p||trDoneN(p)<TRICKS.length||allItems(p).some(i=>i.type===TR_PRIZE)) return false;
  p.room3.items.push(Object.assign({uid:uid(),type:TR_PRIZE,placed:true},spot(TR_PRIZE))); save();
  return true;
}

/* ---------- touch (the same tap and swipe as ⚽ Kick) ---------- */
const trPt=e=>{const r=socCv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top,performance.now()];};
function trDown(e){
  if(TR.state!=='aim') return;
  TR.swipe=[trPt(e)]; try{socCv.setPointerCapture(e.pointerId);}catch(_){}
}
function trMove(e){if(TR.swipe)TR.swipe.push(trPt(e));}
function trUp(e){
  const sw=TR.swipe, g=TR.g; TR.swipe=null; if(!sw||!g||TR.state!=='aim') return;
  sw.push(trPt(e)); const s=socAim(sw,g);
  if(s.tap){if(Math.abs(s.u)<0.75&&s.v>-0.2&&s.v<1.4) trShoot(s.u,clamp(s.v,0.03,1.3),1,0); else toast('Swipe up from the ball, or tap the goal! ⚽');}
  else if(s.err) toast(s.err); else trShoot(s.u,s.v,s.power,s.curve);
}

/* ---------- drawing ---------- */
function trBall(g,s,t){ // the ball, which bounces back off the wall when it is blocked
  if(s.block===null||t<=s.block) return ballPos(g,s,t);
  const b=ballPos(g,Object.assign({},s,{res:null}),s.block), q=Math.min(1,(t-s.block)*2);
  b.gy+=(g.by-b.gy)*0.25*q; b.y=b.y+(b.gy-b.y)*q; b.x+=(g.bx-b.x)*0.1*q; b.gx=b.x; b.r*=1+0.25*q; b.a=1-0.5*q;
  return b;
}
function trDrawTarget(ctx,g,t,hit,time){
  const pt=toScr(g,t.u,t.v), R=t.r*g.GH;
  if(t.k==='star'){if(!hit){ctx.globalAlpha=0.25+0.15*Math.sin(time*4);stIcon(ctx,'star',pt.x,pt.y,R*1.25,'#fff');ctx.globalAlpha=1;}
    stIcon(ctx,'star',pt.x,pt.y,R,hit?'#ffffff55':(t.col||'#ffd166'));return;}
  if(t.k==='balloon'){if(hit)return;
    ctx.strokeStyle='#2b2235';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pt.x,pt.y+R*0.95);ctx.quadraticCurveTo(pt.x+R*0.3,pt.y+R*1.6,pt.x,pt.y+R*2.2);ctx.stroke();
    ctx.fillStyle=t.col;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(pt.x,pt.y+Math.sin(time*2+t.i)*3,R*0.8,R,0,0,TAU);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffffff99';ctx.beginPath();ctx.ellipse(pt.x-R*0.3,pt.y-R*0.35,R*0.16,R*0.26,-0.4,0,TAU);ctx.fill();return;}
  if(t.k==='bell'){const top=toScr(g,t.u,1);
    ctx.strokeStyle='#5b3a99';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.lineTo(pt.x,pt.y-R*0.8);ctx.stroke();
    ctx.save();ctx.translate(pt.x,pt.y);ctx.rotate(hit?Math.sin(time*14)*0.4:Math.sin(time*2)*0.08);
    ctx.fillStyle=hit?'#fff1b8':'#ffd166';ctx.strokeStyle='#2b2235';ctx.lineWidth=3;ctx.beginPath();
    ctx.moveTo(-R*0.45,-R*0.75);ctx.quadraticCurveTo(-R*0.55,R*0.3,-R*0.9,R*0.55);ctx.lineTo(R*0.9,R*0.55);ctx.quadraticCurveTo(R*0.55,R*0.3,R*0.45,-R*0.75);
    ctx.quadraticCurveTo(0,-R*1.05,-R*0.45,-R*0.75);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#a8730f';ctx.beginPath();ctx.arc(0,R*0.65,R*0.18,0,TAU);ctx.fill();ctx.restore();return;}
  // hoops (and the bat's hoop): a ring to kick through
  if(t.k==='bathoop') stIcon(ctx,'bat',pt.x,pt.y-R*1.35,R*0.5,'#a97cff');
  ctx.lineWidth=Math.max(5,R*0.22); ctx.strokeStyle='#2b2235'; ctx.beginPath(); ctx.ellipse(pt.x,pt.y,R,R,0,0,TAU); ctx.stroke();
  ctx.lineWidth=Math.max(3,R*0.13); ctx.strokeStyle=hit?'#8ff0d0':'#ff8cc6'; ctx.stroke();
}
function trFriend(ctx,kind,x,y,s,time,jump){drawKeeper(ctx,kind,x,y-jump,s,0,jump?0.6:0,time,true);}
function trDrawWall(ctx,g,w,time){
  const e=w.e, y=g.by+(g.gy-g.by)*e, step=(w.u1-w.u0)/3, s=Math.min(w.h*g.GH/1.14,step*g.GW/0.85); // as tall as the wall, but never piled up
  ['cat','ghost','bat'].forEach((k,i)=>{const x=g.cx+(w.u0+step*(i+0.5))*g.GW;
    ctx.fillStyle='#00000030';ctx.beginPath();ctx.ellipse(x,y,s*0.4,s*0.08,0,0,TAU);ctx.fill();
    trFriend(ctx,k,x,y,s,time+i,0);});
}
function drawTrick(dt){
  const {ctx,W,H}=fit(socCv), g=socGeo(W,H), tr=trCur(), s=TR.shot; TR.g=g; TR.time+=dt;
  if(s&&TR.state!=='aim'){TR.t+=dt/s.T;
    if(TR.state==='fly'&&((s.block!==null&&TR.t>=s.block)||TR.t>=1)) trResolve();}
  const cheering=TR.time-TR.cheer<1.6;
  socField(ctx,g,W,H,TR.time,cheering);
  const inNet=s&&s.res==='goal'&&s.block===null&&TR.t>1, shake=inNet?Math.sin(TR.time*30)*Math.max(0,1-(TR.t-1)*1.2)*g.GH*0.03:0;
  socNet(ctx,g,shake,inNet?()=>drawBall(ctx,ballPos(g,s,TR.t),TR.t*12):null);
  socPosts(ctx,g);
  trTargets(tr,TR.time).forEach(t=>trDrawTarget(ctx,g,t,!!TR.hit[t.i],TR.time));
  if(!tr.wall){const fs=g.GH*0.42, fy=g.gy+g.GH*0.05, j=k=>cheering?Math.abs(Math.sin(TR.time*10+k))*g.GH*0.12:0; // the friends cheer at the side
    trFriend(ctx,'cat',g.cx-g.GW*0.68,fy,fs,TR.time,j(0)); trFriend(ctx,'ghost',g.cx+g.GW*0.64,fy,fs*0.9,TR.time,j(1)); trFriend(ctx,'bat',g.cx+g.GW*0.8,fy-g.GH*0.05,fs*0.8,TR.time,j(2));}
  // 💡 after 3 misses: the path of a shot that works (for the next target)
  if(TR.miss>=3&&TR.state==='aim'){const k=tr.targets.findIndex((_,i)=>!TR.hit[i]), sh=tr.sol[Math.max(0,k)], hs={u:sh[0],v:sh[1],curve:sh[3]};
    ctx.fillStyle='#fff'; for(let i=1;i<=18;i++){const b=ballPos(g,hs,i/18);ctx.globalAlpha=0.5+0.4*Math.sin(TR.time*5-i*0.6);ctx.beginPath();ctx.arc(b.x,b.y,Math.max(3,b.r*0.28),0,TAU);ctx.fill();}
    ctx.globalAlpha=1;}
  // the wall and the ball (the ball is drawn in front of the wall until it gets past it)
  const behind=s&&tr.wall&&s.block===null&&TR.t>tr.wall.e;
  const ball=()=>{if(!s){
      ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.globalAlpha=0.5+0.4*Math.sin(TR.time*4);
      ctx.beginPath();ctx.arc(g.bx,g.by,g.rb*(1.6+0.15*Math.sin(TR.time*4)),0,TAU);ctx.stroke();ctx.globalAlpha=1;
      const sw=TR.swipe; if(sw&&sw.length>1){const a=sw[0],b=sw[sw.length-1];
        if(b[1]<a[1]-10){ctx.setLineDash([8,8]);ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(g.bx,g.by);ctx.lineTo(g.bx+(b[0]-a[0])*1.5,g.by+(b[1]-a[1])*1.5);ctx.stroke();ctx.setLineDash([]);}}
      drawBall(ctx,{gx:g.bx,gy:g.by,x:g.bx,y:g.by,r:g.rb,a:1},0);
    } else if(!inNet) drawBall(ctx,trBall(g,s,TR.t),Math.min(TR.t,1.6)*12);};
  if(behind) ball();
  if(tr.wall) trDrawWall(ctx,g,tr.wall,TR.time);
  if(!behind) ball();
  // sparkles from a hit
  TR.fx=TR.fx.filter(o=>(o.t+=dt)<0.9);
  TR.fx.forEach(o=>{ctx.globalAlpha=1-o.t/0.9;ctx.fillStyle=o.col;ctx.beginPath();ctx.arc(o.x+o.vx*o.t,o.y+o.vy*o.t+220*o.t*o.t,5,0,TAU);ctx.fill();});
  ctx.globalAlpha=1;
}

/* ---------- the prize and stickers ---------- */
DECOR[TR_PRIZE]={name:'Trick Shot Star',price:0,award:1,box:'-60 -150 120 160',d:()=>{
  const o='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"';
  return `<ellipse cx="0" cy="-2" rx="44" ry="7" fill="#00000030"/>`
    +`<rect x="-38" y="-28" width="76" height="28" rx="6" fill="#5b3a99" ${o}/><rect x="-28" y="-22" width="56" height="14" rx="3" fill="#8ff0d0"/>`
    +`<text x="0" y="-11" text-anchor="middle" font-size="10" font-weight="900" fill="#1f6b55">TRICKS</text>`
    +`<path d="M-6 -28 L-4 -50 H4 L6 -28Z" fill="#ffc83d" ${o}/>`
    +`<path d="${starPath(0,-96,46,20)}" fill="#ffc83d" ${o}/>`
    +`<circle cx="0" cy="-94" r="16" fill="#fff" ${o}/>`
    +`<path d="M0 -102 L7 -97 L4 -89 H-4 L-7 -97Z" fill="#2b2235"/>`
    +`<path d="M-30 -136 l4 8 M30 -136 l-4 8 M0 -146 v8" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>`;
}};
TROPHY_SPOTS[TR_PRIZE]={x:745,y:695}; // in the Backyard, between the pots (600-670) and a visitor (880), clear of the buddy
STICKERS.push(
  stk('trick1','soccer','🎯','First Trick','circle','Do a trick shot (⚽ Soccer → 🎯 Tricks)',1,p=>trDoneN(p),1),
  stk('banana','soccer','🍌','Banana Kick','heart','Curve the ball around the wall (🌀 Curve It or 🍌 Banana Kick)',1,p=>TR_CURVE.some(id=>p.soccer.tricks.includes(id))?1:0,2),
  stk('trickAll','soccer','🏅','Trick Master','star','Do all 12 trick shots',()=>TRICKS.length,p=>trDoneN(p),3)
);
