'use strict';
/* =========================================================
   62. BALL FIELD: 🎯 HOME RUN DERBY (v1.62), the Ball Field's third game (like Soccer's 🎯 Trick Shots)
   12 fixed challenges in the batting view: hit the ⭐ sign, pop the 🎈, ring the 🔔 over the fence, drop it in the 🪣,
   clear the fence… Pip pitches every one, slow and straight. Two things aim the ball:
   - WHEN you tap: right on time goes straight out, early goes left, late goes right (HR_AW seconds = all the way over).
   - WHERE you tap: high on the screen = a long, high fly ball; low = a short line drive (loft l, 0..1).
   A challenge's targets sit on the path of its `sol` (one working swing {a, l}), so every challenge can be done; the smoke
   test proves it with hrJudge() (the rules, no drawing), and after 3 misses a 💡 dotted line shows that swing.
   No failing: unlimited tries. Coins: +HR_COINS the first time, +HR_REPLAY again (HR_DAILY a day). All 12 = the ⚾ Golden Ball.
   Saved (set up in v1.60): ball.derby{cur, done[], pay{day,n}} and stats.derbies. Challenge ids d1… are saved: never rename
   them; new challenges go at the end.
   ========================================================= */
const HR_COINS=3, HR_REPLAY=1, HR_DAILY=10, HR_T=1.5, HR_AW=0.4, HR_HZ=0.06, HR_FENCE=0.06, HR_PRIZE='goldenBall', HR_EASY=1.3;
// target kinds: star (a sign on a pole), balloon (floating), bell (on a tall post over the fence), hoop (a ring in the air),
// bucket (on the grass: the ball must land in it), fence (clear the fence; side -1 = left, 1 = right, 0 = anywhere).
// e = where on the sol path the target sits (0 = the plate, 1 = where the ball lands).
const DERBY=[
  {id:'d1',icon:'⭐',name:'Star Hit',say:'Hit the star! Swing right on time ⭐',sol:{a:0,l:0.5},t:[{k:'star',e:0.55}]},
  {id:'d2',icon:'↖️',name:'Left Field',say:'Hit the star on the left: swing a little early!',sol:{a:-0.5,l:0.45},t:[{k:'star',e:0.6}]},
  {id:'d3',icon:'↗️',name:'Right Field',say:'Hit the star on the right: swing a little late!',sol:{a:0.5,l:0.45},t:[{k:'star',e:0.6}]},
  {id:'d4',icon:'🎈',name:'Balloon Pop',say:'Pop the balloon! Tap high for a high fly ball 🎈',sol:{a:0.15,l:0.9},t:[{k:'balloon',e:0.5}]},
  {id:'d5',icon:'🪣',name:'Bucket Drop',say:'Drop it in the bucket! Tap low for a short hit 🪣',sol:{a:-0.3,l:0.2},t:[{k:'bucket',e:1}]},
  {id:'d6',icon:'🏟️',name:'Over the Fence',say:'Hit it over the fence! Tap high ⬆️',sol:{a:0,l:1},t:[{k:'fence',side:0,e:1}]},
  {id:'d7',icon:'🔔',name:'Ring the Bell',say:'Ring the bell over the fence! 🔔',sol:{a:0,l:0.75},t:[{k:'bell',e:0.86}]},
  {id:'d8',icon:'✨',name:'Two Stars',say:'Hit both stars with one swing ✨',sol:{a:0.3,l:0.6},t:[{k:'star',e:0.35},{k:'star',e:0.7}]},
  {id:'d9',icon:'🎯',name:'Pop and Drop',say:'Pop the balloon, then land in the bucket!',sol:{a:-0.4,l:0.55},t:[{k:'balloon',e:0.5},{k:'bucket',e:1}]},
  {id:'d10',icon:'🌈',name:'Rainbow Row',say:'Three stars in a row: red, yellow, blue 🌈',sol:{a:0.1,l:0.7},t:[{k:'star',e:0.3,c:'#ff6b6b'},{k:'star',e:0.55,c:'#ffd166'},{k:'star',e:0.8,c:'#5b8dff'}]},
  {id:'d11',icon:'🌙',name:'Left Field Homer',say:'Over the fence on the LEFT side! Early and high 🌙',sol:{a:-0.6,l:1},t:[{k:'fence',side:-1,e:1}]},
  {id:'d12',icon:'🦉',name:"Hoot's Hoop",say:"Through Hoot's hoop, way up high on the right! 🦉",sol:{a:0.6,l:0.85},t:[{k:'hoop',e:0.62}]}
];
const HR_R={star:0.14,balloon:0.15,bell:0.14,hoop:0.15,bucket:0.13}; // how close the ball must pass (field units)
let HR={state:'off',t:0,fly:null,hit:[],miss:0,wait:0,cheer:-9};

/* ---------- the rules (no drawing) ---------- */
const hrZEnd=l=>0.45+0.95*l, hrPeak=l=>0.08+0.55*l;
// a point on the path of a swing {a, l}: x across, z out, h up (field units)
function hrPath(a,l,e){const z=hrZEnd(l)*e;return {x:a*z,z,h:HR_HZ*(1-e)+hrPeak(l)*4*e*(1-e)};}
function hrTgt(ch,t){const s=ch.sol, p=hrPath(s.a,s.l,t.e); return t.k==='bucket'?Object.assign(p,{h:0}):p;}
// Which targets does a swing hit? ease = Easy mode (bigger targets). Returns [true/false per target].
function hrJudge(ch,a,l,ease){
  const k=ease?HR_EASY:1;
  return ch.t.map(t=>{
    if(t.k==='fence'){const e1=1/hrZEnd(l); if(e1>=0.97) return false; const p=hrPath(a,l,e1); // where it crosses the fence
      return p.h>HR_FENCE&&Math.abs(p.x)<=1&&(t.side===0||Math.sign(p.x)===t.side&&Math.abs(p.x)>0.15);}
    const q=hrTgt(ch,t), r=HR_R[t.k]*k;
    if(t.k==='bucket'){const p=hrPath(a,l,1);return Math.hypot(p.x-q.x,p.z-q.z)<=r*1.4;}
    for(let e=0;e<=1.0001;e+=0.01){const p=hrPath(a,l,e);if(Math.hypot(p.x-q.x,p.z-q.z,(p.h-q.h)*1.5)<=r)return true;}
    return false;
  });
}
// a swing: d = seconds from right on time, fy = where the tap was (0 top .. 1 bottom of the field)
const hrAim=d=>Math.abs(d)>HR_AW?null:clamp(d/HR_AW,-1,1);
const hrLoft=fy=>clamp((0.92-fy)/0.7,0,1);
const hrFy=l=>0.92-l*0.7; // the other way round, for the 💡 hint

/* ---------- the game ---------- */
const hrIdx=p=>Math.max(0,DERBY.findIndex(c=>c.id===p.ball.derby.cur));
const hrCur=()=>DERBY[hrIdx(P())];
const hrDoneN=p=>DERBY.filter(c=>p.ball.derby.done.includes(c.id)).length;
function hrStop(){HR.state='off';HR.fly=null;$('#bfStage').classList.remove('derby');}
function hrRender(){hrBar();hrReset();}
function hrBar(){
  const p=P(); if(!p) return; const ch=hrCur(), done=p.ball.derby.done.includes(ch.id);
  $('#hrBar').innerHTML=`<button class="btn ghost tr-arrow" data-hr="-1" aria-label="Back one challenge">◀</button>`
    +`<button class="btn tr-name${done?' done':''}" id="hrPick" aria-label="Pick a challenge"><span class="tr-i">${ch.icon}</span> <span class="tn">${esc(ch.name)}</span>${done?' ✅':''}</button>`
    +`<button class="btn ghost tr-arrow" data-hr="1" aria-label="Next challenge">▶</button>`
    +`<span class="tr-count" aria-label="${hrDoneN(p)} challenges done">🎯 ${hrDoneN(p)}/${DERBY.length}</span>`;
}
function hrReset(){Object.assign(HR,{state:'ready',t:0,fly:null,hit:[],miss:0,wait:0});$('#bfMsg').classList.remove('on');hrScore();}
function hrScore(){
  const ch=hrCur(), n=ch.t.length;
  $('#bfScore').innerHTML=n>1?ch.t.map((t,i)=>`<span class="dot${HR.hit[i]?'':' miss'}">${HR.hit[i]?(t.k==='balloon'?'🎈':t.k==='bucket'?'🪣':'⭐'):''}</span>`).join(''):'';
  $('#bfTip').textContent=HR.miss>=3?`💡 Swing ${hrWhen(ch.sol.a)}, and tap where the 👆 is!`:HR.state==='ready'?'Tap for the pitch, then tap to swing. '+ch.say:ch.say;
}
const hrWhen=a=>a<-0.2?'a little early':a>0.2?'a little late':'right on time';
function hrGo(i){const p=P(); i=((i%DERBY.length)+DERBY.length)%DERBY.length; p.ball.derby.cur=DERBY[i].id; save(); hrRender();}
$('#hrBar').onclick=e=>{const b=e.target.closest('button'); if(!b||!P()) return; SFX.click();
  if(b.dataset.hr) hrGo(hrIdx(P())+Number(b.dataset.hr)); else if(b.id==='hrPick') hrPicker();};
function hrPicker(){
  const p=P();
  modal('🎯 Home Run Derby',`<div class="tr-grid">`+DERBY.map((c,i)=>{const d=p.ball.derby.done.includes(c.id);
    return `<button class="tr-card${d?' done':''}${i===hrIdx(p)?' on':''}" data-pick="${i}" aria-label="${esc(c.name)}"><span class="tr-i">${c.icon}</span><span class="tn">${esc(c.name)}</span>${d?'<b>✅</b>':''}</button>`;}).join('')+'</div>',
    [{text:'✖',cls:'ghost'}]);
  $('#modalBody .tr-grid').onclick=e=>{const b=e.target.closest('[data-pick]');if(!b)return;SFX.click();closeModal();hrGo(+b.dataset.pick);};
}
function hrDown(e){
  const p=P(); if(!p||cur!=='ball') return;
  if(HR.state==='ready'){HR.state='wind';HR.t=0;HR.fly=null;HR.hit=[];hrScore();return;}
  if(HR.state!=='pitch'||HR.swung) return;
  HR.swung=true; const m=$('#bfMascot'); m.classList.remove('swing'); void m.offsetWidth; m.classList.add('swing'); SFX.whoosh();
  const r=bfCv.getBoundingClientRect(), fy=(e.clientY-r.top)/Math.max(1,r.height), d=HR.t-HR_T, a=hrAim(d);
  if(a===null){HR.late=d>0;return;} // no contact: the ball goes on into the mitt
  const l=hrLoft(fy), ch=hrCur(), res=hrJudge(ch,a,l,!!p.easy);
  HR.fly={a,l,res,t:0,dur:0.8+0.7*l}; HR.state='fly'; vibrate(25);
  tone(1250,0.05,'square',0.12,600); noise(0.08,0.35,5000,1200);
}
function hrResult(){
  const p=P(), ch=hrCur(), f=HR.fly, all=!!f&&f.res.every(Boolean);
  HR.state='result'; HR.wait=BF.time+1.6;
  if(all){
    const first=!p.ball.derby.done.includes(ch.id); p.stats.derbies++; HR.cheer=BF.time; SFX.cheer();
    if(first){p.ball.derby.done.push(ch.id);earn(HR_COINS,'Derby!');}
    else {if(dailyPay(p.ball.derby.pay,HR_DAILY,1)){earn(HR_REPLAY,'Derby!');} else save();}
    bfSay(first?'You did it! 🎯':'Again! 🎯');
    if(first) hrWin();
  } else {
    HR.miss++; save();
    const some=f&&f.res.some(Boolean);
    bfSay(!f?(HR.late?'Too late! Swing sooner':'Too early! Wait for it'):some?'Almost! One more 💪':'So close! Try again ⚾');
  }
  hrScore();
}
function hrWin(){ // after the cheer: the Golden Ball for all 12, otherwise a little box with ▶ Next
  const p=P(), all=hrDoneN(p)===DERBY.length, prize=all&&!allItems(p).some(i=>i.type===HR_PRIZE);
  if(prize) p.room3.items.push(Object.assign({uid:uid(),type:HR_PRIZE,placed:true},spot(HR_PRIZE)));
  save(); hrBar(); HR.wait=BF.time+99; // the box below starts the next try
  setTimeout(()=>{if(cur!=='ball'||bfMode()!=='derby')return;
    modal(`${hrCur().icon} ${esc(hrCur().name)}: done!`,`<div style="text-align:center;font-size:18px">🎯 ${hrDoneN(p)} of ${DERBY.length} challenges done!`
      +(prize?`<div style="margin-top:10px">All 12! You won the <b>${DECOR[HR_PRIZE].name}</b>! It's in your Backyard ⚾</div><svg viewBox="${DECOR[HR_PRIZE].box}" style="height:110px">${DECOR[HR_PRIZE].d()}</svg>`:'')+'</div>',
      [{text:'🔁 Again',cls:'ghost',on:()=>hrReset()},{text:'▶ Next',cls:'pink',on:()=>hrGo(hrIdx(p)+1)}]);
    if(prize) SFX.buy(); checkStickers();},900);
}

/* ---------- drawing ---------- */
function hrDraw(dt){
  const {ctx,W,H}=fit(bfCv), g=bfGeo(W,H), p=P(); BF.G=g; BF.time+=dt;
  const lay=`${Math.round(g.bw)},${Math.round(g.bl)},${Math.round(g.bb)}`;
  if(BF.lay!==lay){BF.lay=lay;const m=$('#bfMascot');m.style.width=g.bw+'px';m.style.height=g.bh+'px';m.style.left=g.bl+'px';m.style.bottom=g.bb+'px';}
  const pitch={T:HR_T,kind:0,x:0}, L=BAT_PITCHERS.easy;
  if(HR.state==='wind'){HR.t+=dt;if(HR.t>=L.wind){HR.state='pitch';HR.t=0;HR.swung=false;HR.late=false;SFX.kick();}}
  else if(HR.state==='pitch'){HR.t+=dt;if(HR.t>HR_T+HR_AW+0.3){HR.fly=null;tone(140,0.12,'sine',0.35,80);hrResult();}}
  else if(HR.state==='fly'){const f=HR.fly;f.t+=dt;const e=Math.min(1,f.t/f.dur);
    hrCur().t.forEach((t,i)=>{if(f.res[i]&&!HR.hit[i]&&(t.k==='fence'||t.k==='bucket'?e>=0.98:e>=t.e-0.02)){HR.hit[i]=true;SFX.pop();hrScore();}});
    if(f.t>=f.dur)hrResult();}
  else if(HR.state==='result'){if(HR.fly)HR.fly.t+=dt;else HR.t+=dt;if(BF.time>=HR.wait){HR.state='ready';HR.fly=null;HR.hit=[];hrScore();}}
  ctx.drawImage(bfBack(g),0,0,W,H);
  bfCrowd(ctx,g,BF.time-HR.cheer<1.6,true); // no scoreboard: the challenge bar is there
  // the targets, far ones first: the ones behind the mound before Pip, the others after
  const ch=hrCur(), ease=!!(p&&p.easy), tg=ch.t.map((t,i)=>({t,i,q:hrTgt(ch,t)})).sort((a,b)=>b.q.z-a.q.z);
  tg.filter(o=>o.q.z>BF_MOUND).forEach(({t,i,q})=>hrTarget(ctx,g,t,q,!!HR.hit[i],ease));
  // Pip pitches
  const m=bfPt(g,0,BF_MOUND,0), ps=g.H*0.17*Math.pow(m.s,0.3), w=HR.state==='wind'?HR.t/L.wind:-1;
  ctx.fillStyle='#00000030'; ctx.beginPath(); ctx.ellipse(m.x,m.gy,ps*0.4,ps*0.08,0,0,TAU); ctx.fill();
  bfDrawPitcher(ctx,'penguin',m.x,m.gy,ps,w<0?1.2:bfArm(w),HR.state==='ready'||HR.state==='wind',BF.time);
  tg.filter(o=>o.q.z<=BF_MOUND).forEach(({t,i,q})=>hrTarget(ctx,g,t,q,!!HR.hit[i],ease));
  // 💡 after 3 misses: the dotted path of a swing that works, and a hand where to tap
  if(HR.miss>=3&&HR.state!=='fly'){
    ctx.setLineDash([7,7]); ctx.strokeStyle='#fff'; ctx.lineWidth=4; ctx.beginPath();
    for(let e=0;e<=1;e+=0.04){const q=hrPath(ch.sol.a,ch.sol.l,e),s=bfPt(g,q.x,q.z,q.h);e?ctx.lineTo(s.x,s.y):ctx.moveTo(s.x,s.y);} ctx.stroke(); ctx.setLineDash([]);
    const hy=hrFy(ch.sol.l)*H; ctx.font=`${Math.round(g.rb*1.6)}px sans-serif`; ctx.textAlign='center'; ctx.fillText('👆',W*0.82,hy+g.rb*0.6);
    ctx.strokeStyle='#ffd166'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(W*0.74,hy); ctx.lineTo(W*0.9,hy); ctx.stroke(); ctx.textAlign='start';
  }
  // the ring by the plate, glowing when it's time
  if(HR.state!=='fly'){const now=HR.state==='pitch'&&Math.abs(HR.t-HR_T)<=0.12;
    ctx.strokeStyle=now?'#ffd166':'#ffffff88'; ctx.lineWidth=now?5:3; ctx.setLineDash(now?[]:[6,6]);
    ctx.beginPath(); ctx.arc(g.cx,g.handY,g.rb*(now?1.9:1.5),0,TAU); ctx.stroke(); ctx.setLineDash([]);}
  // the ball
  if(HR.fly){const f=HR.fly, e=Math.min(1,f.t/f.dur), q=hrPath(f.a,f.l,e), s=bfPt(g,q.x,q.z,q.h);
    bfBall(ctx,{x:s.x,y:s.y,gx:s.x,gy:s.gy,r:g.rb*s.s},f.t*14,HR.state==='result'?Math.max(0,1-(f.t-f.dur)*2):1);}
  else if(HR.state==='pitch'||HR.state==='result'&&!HR.fly&&HR.t>0){const e=HR.t/HR_T; if(e<1.6) bfBall(ctx,bfPitchPt(g,pitch,e),HR.t*10,e>1.2?Math.max(0,1-(e-1.2)*2.5):1);}
}
// one target at field point q
function hrTarget(ctx,g,t,q,hit,ease){
  const k=ease?HR_EASY:1;
  if(t.k==='fence'){ // a glowing band along the fence top (on one side, or all of it)
    const a=bfPt(g,t.side>0?0.15:-1,1,HR_FENCE), b=bfPt(g,t.side<0?-0.15:1,1,HR_FENCE);
    ctx.strokeStyle=hit?'#8ff0d0':'#ffd166'; ctx.lineWidth=8; ctx.globalAlpha=0.6+0.3*Math.sin(BF.time*5); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); ctx.globalAlpha=1;
    const c=bfPt(g,t.side*0.6,1,HR_FENCE*3); ctx.font=`900 ${Math.round(g.rb*1.4)}px sans-serif`; ctx.textAlign='center'; ctx.fillText(hit?'🎉':'⬆️',c.x,c.y); ctx.textAlign='start'; return;}
  const s=bfPt(g,q.x,q.z,q.h), r=Math.max(14,HR_R[t.k]*k*g.Wx*Math.pow(s.s,0.6)*0.55), gp=bfPt(g,q.x,q.z,0);
  ctx.lineJoin='round'; ctx.lineWidth=3; ctx.strokeStyle='#2b2235';
  if(t.k==='star'){ // a star sign on a pole
    ctx.strokeStyle='#8b5a35'; ctx.lineWidth=Math.max(2,r*0.2); ctx.beginPath(); ctx.moveTo(gp.x,gp.y); ctx.lineTo(s.x,s.y); ctx.stroke();
    ctx.fillStyle=hit?'#fff6b0':t.c||'#ffd166'; ctx.strokeStyle='#2b2235'; ctx.lineWidth=3; ctx.beginPath();
    for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*0.45:r;ctx.lineTo(s.x+Math.cos(a)*rr,s.y+Math.sin(a)*rr);} ctx.closePath(); ctx.fill(); ctx.stroke();
    if(hit){ctx.fillStyle='#ffffffaa';ctx.beginPath();ctx.arc(s.x,s.y,r*1.5,0,TAU);ctx.fill();}
  } else if(t.k==='balloon'){
    if(hit){ctx.fillStyle='#ff8cc6';for(let i=0;i<6;i++){const a=i*TAU/6;ctx.beginPath();ctx.arc(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r,r*0.15,0,TAU);ctx.fill();}return;}
    const y=s.y+Math.sin(BF.time*2)*r*0.15;
    ctx.strokeStyle='#ffffffcc'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(s.x,y+r); ctx.quadraticCurveTo(s.x+r*0.4,y+r*2,s.x,y+r*3); ctx.stroke();
    ctx.fillStyle='#ff6b9a'; ctx.strokeStyle='#2b2235'; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(s.x,y,r*0.85,r,0,0,TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#ffffff88'; ctx.beginPath(); ctx.ellipse(s.x-r*0.3,y-r*0.35,r*0.18,r*0.3,-0.4,0,TAU); ctx.fill();
  } else if(t.k==='bell'){ // a bell on a tall post, over the fence
    ctx.strokeStyle='#5a3a1e'; ctx.lineWidth=Math.max(3,r*0.25); ctx.beginPath(); ctx.moveTo(gp.x,gp.y); ctx.lineTo(s.x,s.y-r*1.4); ctx.stroke();
    const sw=hit?Math.sin(BF.time*20)*0.4:0; ctx.save(); ctx.translate(s.x,s.y-r*1.2); ctx.rotate(sw);
    ctx.fillStyle='#ffd166'; ctx.strokeStyle='#2b2235'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-r*0.9,r*1.6); ctx.quadraticCurveTo(-r,0,0,0); ctx.quadraticCurveTo(r,0,r*0.9,r*1.6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#c99a2e'; ctx.beginPath(); ctx.arc(0,r*1.7,r*0.25,0,TAU); ctx.fill(); ctx.restore();
  } else if(t.k==='hoop'){
    ctx.strokeStyle='#8b5a35'; ctx.lineWidth=Math.max(2,r*0.15); ctx.beginPath(); ctx.moveTo(gp.x,gp.y); ctx.lineTo(s.x,s.y+r); ctx.stroke();
    ctx.strokeStyle=hit?'#8ff0d0':'#a97cff'; ctx.lineWidth=Math.max(4,r*0.3); ctx.beginPath(); ctx.ellipse(s.x,s.y,r,r*0.95,0,0,TAU); ctx.stroke();
  } else if(t.k==='bucket'){
    const bw=r*1.1, bh=r*0.9; ctx.fillStyle=hit?'#8ff0d0':'#7cc8ff'; ctx.strokeStyle='#2b2235'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(gp.x-bw,gp.y-bh); ctx.lineTo(gp.x+bw,gp.y-bh); ctx.lineTo(gp.x+bw*0.75,gp.y); ctx.lineTo(gp.x-bw*0.75,gp.y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#2b2235aa'; ctx.beginPath(); ctx.ellipse(gp.x,gp.y-bh,bw,bh*0.25,0,0,TAU); ctx.fill();
  }
}

/* ---------- the Golden Ball (an award: never in the Shop), sticker ---------- */
Object.assign(DECOR,{
  goldenBall:{name:'Golden Ball',price:0,award:1,box:'-55 -120 110 130',d:()=>`<ellipse cx="0" cy="-2" rx="40" ry="7" fill="#00000030"/>`
    +`<rect x="-34" y="-26" width="68" height="26" rx="5" fill="#5b3a99" stroke="#2b2235" stroke-width="4" stroke-linejoin="round"/><rect x="-24" y="-20" width="48" height="13" rx="3" fill="#fff1b8"/>`
    +`<text x="0" y="-9.5" text-anchor="middle" font-size="10" font-weight="900" fill="#a8730f" font-family="Arial,sans-serif">DERBY</text>`
    +`<path d="M-14 -26 L-8 -40 H8 L14 -26Z" fill="#c99a2e" stroke="#2b2235" stroke-width="3" stroke-linejoin="round"/>`
    +`<circle cx="0" cy="-74" r="34" fill="#ffc83d" stroke="#2b2235" stroke-width="4"/><path d="M-20 -100 Q-6 -74 -20 -48 M20 -100 Q6 -74 20 -48" stroke="#fff1b8" stroke-width="4" fill="none" stroke-dasharray="5 4"/>`
    +`<path d="${starPath(-12,-86,6)}" fill="#fff"/>`}
});
TROPHY_SPOTS[HR_PRIZE]={x:75,y:690}; // in the Backyard, in front of the tree (clear of the bats, the gloves and the buddy)
STICKERS.push(
  stk('derbyAll','soccer','🎯','Derby Star','star','Finish all 12 Home Run Derby challenges',DERBY.length,p=>hrDoneN(p),3)
);
