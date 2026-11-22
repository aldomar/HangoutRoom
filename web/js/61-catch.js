'use strict';
/* =========================================================
   61. BALL FIELD: 🧤 CATCH (v1.61), the Ball Field's second game (like Soccer's 🧤 Keep)
   The view turns around: her buddy stands in the outfield with a glove, looking in toward home plate, where an original
   hitter tosses the ball up and hits it out (a fungo, so there's no pitcher): Easy = Tilly (turtle), Medium = Momo
   (koala), Hard = Zippy (zebra). A soft ring on the grass shows where the ball will come down: drag (or tap) to move
   the buddy there before it arrives. Fly balls, line drives, high pop-ups and grounders that roll along the grass.
   Since v1.63, Medium and Hard balls also come down nearer or farther (v: 0 = her line, 1 = CT_ZMAX in toward home): she
   drags up and down too, and the buddy runs in and back (smaller as it goes in). The ring shows only on Easy (and in Easy
   mode); on Medium it fades in late, on Hard there's none: watch the ball's shadow.
   5 hits a game. Nothing is lost on a drop. Each hit waits for her tap, so there's no timer between them.
   The hits come from fixed lists (CATCH_HITS), taken in turn; the smoke test proves every one can be caught.
   Drawn on the Ball Field canvas by ctDraw() (main loop, only while the Ball Field is open); the field behind is drawn
   once per screen size (CT.bg). Field points use bfPt() from section 59 with z = 0 at her catch line and z = 1 at home.
   Saved: ball.catch{level, best{easy,medium,hard}, prizes[]} and stats.catches (set up in v1.60).
   Prize keys (pennantBronze/pennantSilver/pennantGold, DECOR keys) are saved: never rename them.
   ========================================================= */
const CT_HITS=5, CT_PERFECT=5, CT_U=0.85; // hits a game, coins for 5/5, how far left or right a hit can go
// v (0..1, Medium and Hard only) = how far in she runs: v = 1 is CT_ZMAX toward home. A run of v 0 → 1 costs as much as CT_VU across.
const CT_ZMAX=0.15, CT_VU=0.6;
// speed = how fast the buddy runs (u per second; u = -1 .. 1 across her catch line); reach = how close the glove must be;
// depth = balls come down nearer or farther too (v).
const CATCH_HITTERS={
  easy:{name:'Tilly',icon:'🐢',kind:'turtle',coins:1,wind:1.0,speed:1.6,reach:0.24},
  medium:{name:'Momo',icon:'🐨',kind:'koala',coins:2,wind:0.85,speed:1.5,reach:0.17,depth:1},
  hard:{name:'Zippy',icon:'🦓',kind:'zebra',coins:3,wind:0.75,speed:1.5,reach:0.13,depth:1}
};
const CT_EASY_REACH=1.3; // Easy mode (p.easy) makes the glove this much bigger
// [u where it comes down, T seconds in the air, kind (0 fly ball, 1 line drive, 2 pop-up, 3 grounder), v how far in (Medium, Hard)].
// 15 per level = 3 games. Since v1.63 Medium and Hard are tight: catchable from the worst corner with only a little time to spare.
const CATCH_HITS={
  easy:[[0,2.4,0],[0.4,2.4,0],[-0.4,2.4,0],[0.2,2.6,3],[-0.5,2.4,0],[0.5,2.5,2],[-0.2,2.4,0],[0.3,2.6,3],[0,2.6,2],
    [-0.4,2.4,0],[0.5,2.4,0],[-0.3,2.6,3],[0.1,2.5,0],[-0.5,2.6,2],[0.35,2.4,0]],
  medium:[[0.5,1.4,0,0.8],[-0.6,1.5,1,0.2],[0.2,1.25,3,1],[-0.3,1.5,2,0],[0.7,1.5,0,0.5],[-0.7,1.55,0,0.9],[0,1.15,1,1],[0.6,1.5,3,0.1],
    [-0.5,1.4,0,0.6],[0.3,1.5,2,0],[-0.7,1.55,1,0.8],[0.7,1.55,0,0.3],[-0.1,1.2,3,1],[0.5,1.4,1,0.2],[-0.6,1.5,2,0.7]],
  hard:[[0.8,1.5,0,1],[-0.8,1.5,1,0],[0.3,1.2,3,0.6],[-0.6,1.5,2,1],[0.85,1.5,1,0.2],[-0.85,1.5,0,0.9],[0.5,1.3,3,0],[-0.3,1.15,1,1],
    [0.7,1.5,2,0.3],[-0.75,1.4,0,0.8],[0.85,1.5,1,0],[-0.5,1.3,3,1],[0,0.95,1,0.5],[-0.85,1.5,2,0.2],[0.6,1.35,0,1]]
};
const PENNANTS={easy:'pennantBronze',medium:'pennantSilver',hard:'pennantGold'};
let CT={state:'off',res:[],hit:null,t:0,bu:0,tx:0,bv:0,tv:0,down:null,wait:0,cheer:-9,round:{easy:0,medium:0,hard:0},bg:null,bgKey:'',caughtAt:null};
const ctLvl=()=>{const b=bfP();return b&&CATCH_HITTERS[b.catch.level]?b.catch.level:'easy';};
const ctHitter=()=>CATCH_HITTERS[ctLvl()];
const ctReach=()=>ctHitter().reach*(P()&&P().easy?CT_EASY_REACH:1);
const ctDepth=()=>!!ctHitter().depth&&!(P()&&P().easy);

/* ---------- the rules (no drawing) ---------- */
// how far the buddy at (bu, bv) is from a ball coming down at (u, v), in u (across) units
const ctDist=(u,v,bu,bv)=>Math.hypot(u-bu,((v||0)-(bv||0))*CT_VU);
// Can a buddy standing at (fu, fv) get to a hit [u, T, kind, v] in time? (with a quarter second to react)
const ctCanCatch=(lvl,fu,fv,[u,T,,v])=>Math.max(0,ctDist(u,v,fu,fv)-CATCH_HITTERS[lvl].reach)/CATCH_HITTERS[lvl].speed+0.25<=T;
const ctCaught=(u,v,bu,bv,reach)=>ctDist(u,v,bu,bv)<=reach;

/* ---------- the game ---------- */
function ctStop(){CT.state='off';CT.hit=null;CT.down=null;}
function ctNewGame(){CT.res=[];CT.state='ready';CT.hit=null;CT.bu=0;CT.tx=0;CT.bv=CT.tv=ctDepth()?0.5:0;CT.wait=0;CT.caughtAt=null;$('#bfMsg').classList.remove('on');ctScore();SFX.whistle();}
function ctScore(){
  const b=bfP(); if(!b) return; const L=ctHitter();
  $('#bfScore').innerHTML=Array.from({length:CT_HITS},(_,i)=>{const r=CT.res[i];
    return `<span class="dot ${r===false?'miss':''} ${i===CT.res.length&&CT.state!=='done'?'now':''}">${r?'🧤':r===false?'✖':''}</span>`;}).join('')
    +`<span class="best">🏆 Best ${b.catch.best[ctLvl()]||0}/${CT_HITS}</span>`;
  $('#bfTip').textContent=CT.state==='done'?'Tap to play again!':CT.state==='ready'?`${L.icon} ${L.name} is batting! Tap when you're ready`
    :ctLvl()==='hard'&&ctDepth()?"Watch the ball's shadow and drag there! Up = run in 🧤":ctDepth()?'Drag to the ball: left, right, up and down! 🧤':'Drag to the ring to catch it! 🧤';
}
function ctStart(){
  const lvl=ctLvl(), list=CATCH_HITS[lvl], [u,T,kind,v]=list[CT.round[lvl]%list.length]; CT.round[lvl]++;
  CT.hit={u,T,kind,v:ctDepth()?v||0:0}; CT.state='wind'; CT.t=0; CT.caughtAt=null; ctScore();
}
// The finger sets where the buddy runs to (a tap works too): across from x, and (Medium, Hard) how far in from y,
// measured on the grass, so a finger on the ball's ring or shadow sends her right there.
const ctZ=v=>(v||0)*CT_ZMAX;
function ctFinger(e){
  const g=BF.G, r=bfCv.getBoundingClientRect(); if(!g) return;
  const y=e.clientY-r.top;
  if(ctDepth()&&isFinite(y)){const y0=ctPt(g,0,0,0).gy, y1=ctPt(g,0,CT_ZMAX,0).gy; CT.tv=clamp((y0-y)/(y0-y1),0,1);} else CT.tv=0;
  const k=g.k*Math.pow(bfPt(g,0,ctZ(CT.tv),0).s,0.6);
  CT.tx=clamp((e.clientX-r.left-g.cx)/k,-CT_U-0.1,CT_U+0.1);
}
function ctDown(e){
  const p=P(); if(!p||cur!=='ball') return;
  if(CT.state==='done'){closeModal();ctNewGame();return;}
  CT.down=e.pointerId; try{bfCv.setPointerCapture(e.pointerId);}catch(_){}
  ctFinger(e);
  if(CT.state==='ready') ctStart();
}
function ctMove(e){if(CT.down===e.pointerId) ctFinger(e);}
function ctUp(e){if(CT.down===e.pointerId) CT.down=null;}
function ctLand(){ // the ball reaches her catch line
  const p=P(), L=ctHitter(), h=CT.hit, ok=ctCaught(h.u,h.v,CT.bu,CT.bv,ctReach());
  CT.res.push(ok); CT.state='result'; CT.wait=CT.t+1.4;
  if(ok){
    CT.caughtAt=CT.bu; p.stats.catches++; CT.cheer=BF.time; SFX.save(); vibrate(25);
    const g=BF.G, rc=bfCv.getBoundingClientRect();
    earn(L.coins+(hasBallKit(p)?1:0),'Catch!',rc.left+(g?ctPt(g,CT.bu,ctZ(CT.bv),0).x:0),rc.top+(g?g.handY-40:0));
    bfSay(h.kind===3?'Got it! 🧤':h.kind===2?'Way up high! Caught! 🧤':'Great catch! 🧤');
  } else {save();SFX.whoosh();bfSay(ctDist(h.u,h.v,CT.bu,CT.bv)<ctReach()*2?'So close! Next one ⚾':'Missed it! Next one ⚾');}
  ctScore();
}
function givePennantPrizes(){ // a perfect 5/5 catch game wins that level's pennant once; it goes into the Backyard
  const p=P(); if(!p) return [];
  const won=Object.keys(PENNANTS).filter(l=>(p.ball.catch.best[l]||0)>=CT_HITS&&!p.ball.catch.prizes.includes(l));
  won.forEach(l=>{const type=PENNANTS[l];p.ball.catch.prizes.push(l);p.room3.items.push(Object.assign({uid:uid(),type,placed:true},spot(type)));});
  if(won.length) save();
  return won.map(l=>DECOR[PENNANTS[l]].name);
}
function ctEnd(){
  const p=P(), lvl=ctLvl(), L=ctHitter(), n=CT.res.filter(Boolean).length;
  CT.state='done';
  const best=n>(p.ball.catch.best[lvl]||0); if(best) p.ball.catch.best[lvl]=n;
  if(n===CT_HITS) earn(CT_PERFECT,'Perfect!'); else save();
  const won=givePennantPrizes(); SFX.whistle(); ctScore(); if(won.length) setTimeout(SFX.buy,400);
  const line=n===CT_HITS?'PERFECT! Nothing got past you! 🌟':n>=3?'Great catching! ✨':n>=1?'Nice! Keep practicing 💪':`${L.name} hit them far! Try again? ${L.icon}`;
  const pr=won.map(nm=>`<div style="margin-top:10px">You won the <b>${nm}</b>! It's in your Backyard 🧤</div><svg viewBox="${DECOR[PENNANTS[lvl]].box}" style="height:90px">${DECOR[PENNANTS[lvl]].d()}</svg>`).join('');
  modal(`🧤 ${n} / ${CT_HITS} catches!`,`<div style="text-align:center;font-size:18px">${line}${best&&n?`<br>New best on ${lvl[0].toUpperCase()+lvl.slice(1)}! 🏆`:''}${pr}</div>`,
    [{text:'⬅ Backyard',cls:'ghost',on:()=>show('room')},{text:'Play again',cls:'pink',on:()=>ctNewGame()}]);
  checkStickers();
}

/* ---------- where things are ---------- */
const ctPt=(g,u,z,h)=>bfPt(g,u*g.k/g.Wx,z,h); // u across her catch line (z = 0), z = 1 at home plate
// the ball: e = 0 when it's hit, 1 when it reaches her line (and on past it if she misses)
function ctBallPt(g,h,e){
  if(e>1){const c=ctBallPt(g,h,1), k=e-1; return {x:c.x+(h.u>=0?1:-1)*k*g.W*0.1,y:c.y+k*g.H*0.3,gx:c.x,gy:c.gy+k*g.H*0.3,r:c.r*(1+k*0.5)};}
  const z=1-e*(1-ctZ(h.v)), u=h.u*e; let ht;
  if(h.kind===3){ht=e<0.25?0.06*(1-e/0.25):Math.abs(Math.sin((e-0.25)*Math.PI*4))*0.03*(1-e);ht+=e>0.9?(e-0.9)/0.1*g.hz:0;} // a grounder rolls, then she scoops it up
  else {const peak=h.kind===1?0.12:h.kind===2?1.1:0.6; ht=0.08*(1-e)+g.hz*e+peak*4*e*(1-e);}
  const p=ctPt(g,u,z,ht); return {x:p.x,y:p.y,gx:p.x,gy:p.gy,r:g.rb*p.s};
}

/* ---------- drawing ---------- */
// the field from the outfield, looking in: stands behind home, the infield far away, big outfield grass in front
function ctBack(g){
  const key=`${g.W}x${g.H}`; if(CT.bgKey===key&&CT.bg) return CT.bg;
  const d=Math.min(2,window.devicePixelRatio||1), c=document.createElement('canvas'); c.width=Math.max(1,Math.round(g.W*d)); c.height=Math.max(1,Math.round(g.H*d));
  const ctx=c.getContext('2d'); ctx.setTransform(d,0,0,d,0,0); const {W,H}=g;
  const gy=ctPt(g,0,1.25,0).gy, top=g.yH*0.75;
  const sky=ctx.createLinearGradient(0,0,0,top); sky.addColorStop(0,'#7fd0ff'); sky.addColorStop(1,'#e0f6ff'); ctx.fillStyle=sky; ctx.fillRect(0,0,W,top+1);
  ctx.fillStyle='#ffffffdd'; [[0.15,0.45],[0.7,0.3]].forEach(([fx,fy])=>{const cx=W*fx,cy=top*fy,r=Math.min(W,H)*0.03;[[-1.2,0.3,1],[0,0,1.3],[1.2,0.3,0.9]].forEach(([ox,oy,k])=>{ctx.beginPath();ctx.arc(cx+ox*r,cy+oy*r,r*k,0,TAU);ctx.fill();});});
  ctx.fillStyle='#4a3d63'; ctx.fillRect(0,top,W,gy-top); // the stands behind home (the crowd is drawn every frame)
  ctx.fillStyle='#3a3050'; ctx.fillRect(0,gy-H*0.03,W,H*0.03); // the backstop wall
  const gr=ctx.createLinearGradient(0,gy,0,H); gr.addColorStop(0,'#5cb85f'); gr.addColorStop(1,'#74d478'); ctx.fillStyle=gr; ctx.fillRect(0,gy,W,H-gy);
  ctx.fillStyle='#ffffff14'; for(let i=0;i<10;i+=2){const a=ctPt(g,0,1.25-i/8,0).gy,b=ctPt(g,0,1.25-(i+1)/8,0).gy;ctx.fillRect(0,a,W,b-a);}
  const poly=(pts,fill)=>{ctx.beginPath();pts.forEach(([u,z],i)=>{const q=bfPt(g,u,z,0);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();};
  poly([[0,1.08],[0.4,0.75],[0,0.42],[-0.4,0.75]],'#e0a96d');
  poly([[0,0.95],[0.22,0.75],[0,0.56],[-0.22,0.75]],'#5cb85f');
  ctx.strokeStyle='#fff'; ctx.lineWidth=Math.max(2,H*0.005);
  [-1,1].forEach(sd=>{const a=bfPt(g,0,1,0),b=bfPt(g,sd*1.2,-0.2,0);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();});
  [[0.3,0.75],[0,0.5],[-0.3,0.75]].forEach(([x,z])=>{const q=bfPt(g,x,z,0),r=g.rb*q.s*1.3;ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(q.x,q.y-r*0.5);ctx.lineTo(q.x+r,q.y);ctx.lineTo(q.x,q.y+r*0.5);ctx.lineTo(q.x-r,q.y);ctx.closePath();ctx.fill();});
  const m=bfPt(g,0,0.78,0); ctx.fillStyle='#d6955a'; ctx.beginPath(); ctx.ellipse(m.x,m.y,g.W*0.04,g.H*0.01,0,0,TAU); ctx.fill();
  const hp=bfPt(g,0,1,0); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(hp.x,hp.y,g.rb*0.5,g.rb*0.15,0,0,TAU); ctx.fill();
  CT.bg=c; CT.bgKey=key; return c;
}
function ctCrowd(ctx,g,cheering){
  const gy=ctPt(g,0,1.25,0).gy-g.H*0.03, top=g.yH*0.75, cr=(gy-top)/7, cols=['#ff8cc6','#a97cff','#8ff0d0','#ffd166','#4dabf7','#ff6b8a'];
  for(let row=0;row<3;row++) for(let i=0,x=cr*(row%2?2.2:1.2);x<g.W;i++,x+=cr*2.4){
    const jump=cheering?Math.abs(Math.sin(BF.time*12+i*1.7))*cr*0.8:0;
    ctx.fillStyle=cols[(i*7+row*3)%cols.length]; ctx.beginPath(); ctx.arc(x,top+cr*(1.4+row*2)-jump,cr*0.85,0,TAU); ctx.fill();}
}
// The three hitters, drawn in a 100-tall box with (0,0) at their feet; w = 0..1 through the toss and swing.
function ctDrawHitter(ctx,kind,x,y,s,w,time){
  ctx.save(); ctx.translate(x,y); ctx.scale(s/100,s/100); ctx.lineJoin='round'; ctx.lineCap='round'; ctx.lineWidth=4; ctx.strokeStyle='#3b2f52';
  const bob=Math.sin(time*2.4)*1.5;
  // the bat: held up and ready, then swung across
  const a=w<0.55?-2.3:w<0.75?-2.3+(w-0.55)/0.2*3.4:1.1, hx=-14, hy=-46+bob;
  ctx.save(); ctx.translate(hx,hy); ctx.rotate(a); ctx.fillStyle='#e8b97a'; ctx.beginPath(); ctx.moveTo(0,-4); ctx.lineTo(54,-8); ctx.quadraticCurveTo(62,0,54,8); ctx.lineTo(0,4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  let fur;
  if(kind==='turtle'){ // Tilly: a little turtle with a dotted shell and a lilac cap
    fur='#9fe0a0';
    kE(ctx,-12,-3,10,6,fur); kE(ctx,12,-3,10,6,fur);
    kE(ctx,0,-34+bob,30,28,'#5aa86a'); ctx.fillStyle='#8fd39a'; [[-12,-40],[10,-42],[0,-26],[-16,-24],[16,-26]].forEach(([xx,yy])=>{ctx.beginPath();ctx.arc(xx,yy+bob,5,0,TAU);ctx.fill();});
    kC(ctx,0,-72+bob,22,fur); ctx.lineWidth=3; kFace(ctx,-70+bob,true);
    ctx.fillStyle='#c9a7ff'; ctx.strokeStyle='#3b2f52'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-22,-80+bob); ctx.quadraticCurveTo(0,-104+bob,22,-80+bob); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if(kind==='koala'){ // Momo: a sleepy gray koala with big fluffy ears and a peach cap
    fur='#b6b6c6';
    kE(ctx,-12,-3,10,6,fur); kE(ctx,12,-3,10,6,fur);
    kE(ctx,0,-34+bob,26,28,fur); kE(ctx,0,-30+bob,16,18,'#e6e6ee',false);
    [-1,1].forEach(sd=>{kC(ctx,sd*26,-86+bob,13,fur);kC(ctx,sd*26,-86+bob,7,'#f2d7e6');});
    kC(ctx,0,-74+bob,26,fur); ctx.lineWidth=3; kFace(ctx,-74+bob,true); kE(ctx,0,-66+bob,6,8,'#4a4458',false);
    ctx.fillStyle='#ffb48a'; ctx.strokeStyle='#3b2f52'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-24,-86+bob); ctx.quadraticCurveTo(0,-112+bob,24,-86+bob); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else { // Zippy: a speedy zebra with a fluffy mane and a mint cap
    fur='#fbf7ff';
    kE(ctx,-12,-3,10,6,'#3b3448'); kE(ctx,12,-3,10,6,'#3b3448');
    kE(ctx,0,-36+bob,24,30,fur); ctx.strokeStyle='#3b3448'; ctx.lineWidth=5; [-42,-30,-18].forEach(yy=>{ctx.beginPath();ctx.moveTo(-20,yy+bob);ctx.quadraticCurveTo(-8,yy-6+bob,-2,yy+bob);ctx.moveTo(20,yy+bob);ctx.quadraticCurveTo(8,yy-6+bob,2,yy+bob);ctx.stroke();});
    ctx.strokeStyle='#3b2f52'; ctx.lineWidth=4;
    [-1,1].forEach(sd=>{ctx.beginPath();ctx.moveTo(sd*12,-92+bob);ctx.lineTo(sd*18,-110+bob);ctx.lineTo(sd*4,-98+bob);ctx.closePath();ctx.fillStyle=fur;ctx.fill();ctx.stroke();});
    kC(ctx,0,-76+bob,22,fur); kE(ctx,0,-62+bob,13,9,'#ffc2df'); ctx.lineWidth=3; kFace(ctx,-78+bob,true);
    ctx.fillStyle='#3b3448'; [-6,0,6].forEach(xx=>{ctx.beginPath();ctx.arc(xx,-98+bob,5,0,TAU);ctx.fill();});
    ctx.fillStyle='#8ff0d0'; ctx.strokeStyle='#3b2f52'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-20,-88+bob); ctx.quadraticCurveTo(0,-110+bob,20,-88+bob); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // the tossed ball (before the swing)
  if(w>0&&w<0.65){const up=Math.sin(Math.min(1,w/0.65)*Math.PI)*40; ctx.lineWidth=2; kC(ctx,-30,-50-up+bob,7,'#fff');}
  ctx.restore();
}
// her glove: an SVG over the buddy's hand
function ctGloveSVG(){
  return `<svg class="ct-glove" viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg"><g transform="translate(168 176) rotate(-15)">`
    +`<path d="M-20 18 Q-26 -4 -18 -22 Q-14 -32 -6 -28 Q-2 -38 6 -34 Q12 -40 18 -30 Q28 -26 24 -10 L20 18 Q0 26 -20 18Z" fill="#c98b52" stroke="#5a3a1e" stroke-width="4" stroke-linejoin="round"/>`
    +`<path d="M-10 -20 V0 M2 -28 V0 M14 -24 V2" stroke="#8a5a2e" stroke-width="2.5" stroke-linecap="round"/>`
    +`<rect x="-20" y="10" width="40" height="12" rx="5" fill="#ff8cc6" stroke="#5a3a1e" stroke-width="3"/></g></svg>`;
}

function ctDraw(dt){
  const {ctx,W,H}=fit(bfCv), g=bfGeo(W,H), L=ctHitter(); BF.G=g; BF.time+=dt;
  g.k=Math.max(40,Math.min(W*0.378,(g.cx-g.bw*0.83-4)/CT_U)); // how far one u is on screen, so the buddy stays on screen
  // the buddy runs toward the finger (or the ring on a tap), only while the ball is in play
  const moving=CT.state==='fly'||CT.state==='wind';
  if(moving){const du=CT.tx-CT.bu, dv=(CT.tv-CT.bv)*CT_VU, d=Math.hypot(du,dv), step=L.speed*dt;
    if(d<=step){CT.bu=CT.tx;CT.bv=CT.tv;} else if(d>0){CT.bu+=du/d*step;CT.bv+=dv/d*step/CT_VU;}}
  CT.bu=clamp(CT.bu,-CT_U-0.1,CT_U+0.1); CT.bv=clamp(CT.bv,0,1);
  // the buddy stands at (bu, bv): further in = higher up and smaller (f)
  const y0=ctPt(g,0,0,0).gy, bp=ctPt(g,CT.bu,ctZ(CT.bv),0), f=bp.s, hx=bp.x, handY=bp.gy-(y0-g.handY)*f;
  const left=hx-g.bw*f*0.83, up=y0-bp.gy, lay=`${Math.round(g.bw*f)},${Math.round(left)},${Math.round(g.bb+up)}`;
  if(BF.lay!==lay){BF.lay=lay;const m=$('#bfMascot');m.style.width=g.bw*f+'px';m.style.height=g.bh*f+'px';m.style.left=left+'px';m.style.bottom=(g.bb+up)+'px';}
  // move things on
  const h=CT.hit;
  if(CT.state==='wind'){CT.t+=dt;if(CT.t>=L.wind){CT.state='fly';CT.t=0;tone(1250,0.05,'square',0.1,600);noise(0.08,0.3,5000,1200);}}
  else if(CT.state==='fly'){CT.t+=dt;if(CT.t>=h.T)ctLand();}
  else if(CT.state==='result'){CT.t+=dt;if(CT.t>=CT.wait){if(CT.res.length>=CT_HITS)ctEnd();else{CT.state='ready';CT.hit=null;ctScore();}}}
  // draw
  ctx.drawImage(ctBack(g),0,0,W,H);
  ctCrowd(ctx,g,BF.time-CT.cheer<1.6);
  const hp=bfPt(g,0,1,0), hs=g.H*0.15*Math.pow(hp.s,0.3);
  ctx.fillStyle='#00000030'; ctx.beginPath(); ctx.ellipse(hp.x,hp.gy,hs*0.35,hs*0.07,0,0,TAU); ctx.fill();
  ctDrawHitter(ctx,L.kind,hp.x,hp.gy,hs,CT.state==='wind'?CT.t/L.wind:0,BF.time);
  // where it comes down: a soft ring on the grass. Easy (and Easy mode): bright all the way; Medium: it fades in for the
  // last part of the flight; Hard: no ring, only the ball's shadow (drawn darker below).
  const p=P(), help=ctLvl()==='easy'||!!(p&&p.easy);
  if(h&&CT.state==='fly'){
    const k=Math.min(1,CT.t/h.T), a=help?0.9:ctLvl()==='medium'?clamp((k-0.45)/0.3,0,1)*0.6:0;
    if(a>0){const q=ctPt(g,h.u,ctZ(h.v),0), r=ctReach()*g.k*Math.pow(q.s,0.6);
      ctx.globalAlpha=a; ctx.strokeStyle=help?'#ffd166':'#ffffff'; ctx.lineWidth=help?5:3;
      ctx.beginPath(); ctx.ellipse(q.x,q.gy,r,r*0.25,0,0,TAU); ctx.stroke();
      ctx.fillStyle=help?'#ffd16640':'#ffffff30'; ctx.fill(); ctx.globalAlpha=1;}
  }
  // the ball: in the air, in her glove, or rolling away
  if(h&&(CT.state==='fly'||CT.state==='result')){
    if(CT.caughtAt!=null){const gp={x:hx,y:handY-g.bh*f*0.02,gx:hx,gy:bp.gy,r:g.rb*f};bfBall(ctx,gp,0,1);}
    else {const e=CT.t/h.T; if(CT.state==='fly'||e<1.8){const b=ctBallPt(g,h,Math.min(e,1.8));
      if(!help&&CT.state==='fly'){ctx.fillStyle='#00000038';ctx.beginPath();ctx.ellipse(b.gx,b.gy,b.r*1.6,b.r*0.5,0,0,TAU);ctx.fill();} // a clearer shadow
      bfBall(ctx,b,CT.t*12,CT.state==='result'?Math.max(0,1-(CT.t-h.T)*1.5):1);}}
  }
}

/* ---------- pennant prizes (awards: never in the Shop), sticker ---------- */
function ctPennantArt(main,light,dark,label){
  const o='stroke="#2b2235" stroke-width="3" stroke-linejoin="round"';
  return `<path d="M-62 -78 Q0 -90 62 -78" stroke="#5a3a1e" stroke-width="3" fill="none"/><circle cx="-62" cy="-78" r="4" fill="#5a3a1e"/><circle cx="62" cy="-78" r="4" fill="#5a3a1e"/>`
    +`<path d="M-56 -76 L56 -76 L0 0Z" fill="${main}" ${o}/><path d="M-56 -76 L56 -76 L50 -66 L-50 -66Z" fill="${light}"/>`
    +`<text x="0" y="-52" text-anchor="middle" font-size="11" font-weight="900" fill="${dark}" font-family="Arial,sans-serif">${label}</text>`
    +`<circle cx="0" cy="-30" r="10" fill="#fff" stroke="#2b2235" stroke-width="2.5"/><path d="M-6 -37 Q-2 -30 -6 -23 M6 -37 Q2 -30 6 -23" stroke="#ff5a6e" stroke-width="2" fill="none"/>`;
}
Object.assign(DECOR,{
  pennantBronze:{name:'Bronze Pennant',price:0,award:1,wall:1,box:'-70 -95 140 100',d:()=>ctPennantArt('#cd7f32','#f2b77c','#7a4518','EASY')},
  pennantSilver:{name:'Silver Pennant',price:0,award:1,wall:1,box:'-70 -95 140 100',d:()=>ctPennantArt('#b9c2cf','#f1f5fa','#5d6675','MEDIUM')},
  pennantGold:{name:'Gold Pennant',price:0,award:1,wall:1,box:'-70 -95 140 100',d:()=>ctPennantArt('#ffc83d','#fff1b8','#a8730f','HARD')}
});
// On top of the Backyard fence, above the buddy (wall items hang on the fence there)
Object.assign(TROPHY_SPOTS,{pennantBronze:{x:405,y:352},pennantSilver:{x:535,y:340},pennantGold:{x:665,y:352}});
STICKERS.push(
  stk('catch1','soccer','🧤','Great Catch','circle','Catch a ball on the ⚾ Ball Field (🧤 Catch)',1,p=>p.stats.catches,1)
);
