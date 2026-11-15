'use strict';
/* =========================================================
   10. FIDGET SHELF
   ========================================================= */
let fidTab='popit';
function setFidTab(t){
  fidTab=t;
  $$('#fidTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
  $$('.fid').forEach(f=>f.classList.toggle('on',f.id==='fid-'+t));
  if(t==='popit') renderPop();
  renderSkins();
}
$('#fidTabs').onclick=e=>{const b=e.target.closest('[data-tab]');if(!b)return;SFX.click();setFidTab(b.dataset.tab);};
function renderSkins(){
  const p=P(); if(!p) return; const F=FID[fidTab];
  const own=([id,t])=>!t.price||p.owned.includes(F.key+':'+id);
  $('#skinRow').innerHTML=easySort(Object.entries(F.list),e=>own(e)?0:e[1].price).map(e=>{const [id,t]=e, o=own(e), poor=poorCls(p,o,t.price);
    return `<button class="tab ${p.fid[F.key]===id?'on':''}" data-skin="${id}"${poor?' style="opacity:.5"':''}>${t.name}${o?'':(poor?' · 🔒🪙':' · 🪙')+t.price}</button>`;}).join('')
    +(fidTab==='popit'?'<span class="skin-sep"></span>'+shapeButtons(p):'');
}
function shapeButtons(p){ // pop-it board shapes, after the colour themes
  const own=([id,t])=>!t.price||p.owned.includes('popshape:'+id);
  return easySort(Object.entries(POP_SHAPES),e=>own(e)?0:e[1].price).map(e=>{const [id,t]=e, o=own(e), poor=poorCls(p,o,t.price);
    return `<button class="tab ${p.fid.popShape===id?'on':''}" data-shape="${id}"${poor?' style="opacity:.5"':''}>${t.name}${o?'':(poor?' · 🔒🪙':' · 🪙')+t.price}</button>`;}).join('');
}
$('#skinRow').onclick=e=>{
  const sb=e.target.closest('[data-shape]');
  if(sb){const p=P(), id=sb.dataset.shape, t=POP_SHAPES[id]; if(t) tryBuy('popshape:'+id,t.price,t.name,()=>{p.fid.popShape=id;save();SFX.click();renderSkins();renderPop();}); return;}
  const b=e.target.closest('[data-skin]'); if(!b) return; const p=P(), F=FID[fidTab], id=b.dataset.skin, t=F.list[id];
  tryBuy(F.key+':'+id,t.price,t.name,()=>{p.fid[F.key]=id;save();SFX.click();renderSkins();if(fidTab==='popit')renderPop();});
};

/* ---------- pop-it ---------- */
const popState={down:new Array(36).fill(false),flipping:false};
const board=$('#popBoard');
let popping=false;
// A shaped board leaves out the bubbles that don't fit inside its outline. They count as already popped,
// so popping every bubble that IS there still flips the board. Worked out once per shape from the CSS grid
// (6% padding, 3% gaps) by testing points around each bubble against the outline.
const popMasks={};
function popMask(id){
  if(popMasks[id]) return popMasks[id];
  const S=POP_SHAPES[id]; let m=new Array(36).fill(false);
  if(S&&S.path){const ctx=document.createElement('canvas').getContext('2d'), path=new Path2D(S.path);
    const gap=0.03*88, cell=(88-gap*5)/6, r=cell/2*0.5, pts=[[0,0]].concat([0,1,2,3,4,5,6,7].map(k=>[Math.cos(k*TAU/8)*r,Math.sin(k*TAU/8)*r]));
    m=m.map((_,i)=>{const cx=6+(i%6)*(cell+gap)+cell/2, cy=6+Math.floor(i/6)*(cell+gap)+cell/2;
      return !pts.every(([dx,dy])=>ctx.isPointInPath(path,cx+dx,cy+dy));});}
  return popMasks[id]=m;
}
function renderPop(){
  const p=P(), T=POP_THEMES[p.fid.pop]||POP_THEMES.rainbow, sh=POP_SHAPES[p.fid.popShape]?p.fid.popShape:'classic', S=POP_SHAPES[sh], mask=popMask(sh);
  if(popState.shape!==sh){popState.shape=sh;popState.down=mask.slice();}
  board.classList.toggle('shaped',!!S.path);
  board.style.background=S.path?'transparent':T.board;
  board.innerHTML=(S.path?`<svg class="popshape" viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible"><path d="${S.path}" fill="${T.board}" stroke="#ffffff66" stroke-width="2.5" stroke-linejoin="round"/></svg>`:'')
    +popState.down.map((d,i)=>`<div class="bub${mask[i]?' gone':d?' down':''}" data-i="${i}" style="background:${T.cols[Math.floor(i/6)]}"></div>`).join('');
}
function popAt(el){
  if(!el||!el.classList||!el.classList.contains('bub')||popState.flipping) return;
  const i=+el.dataset.i; if(popState.down[i]) return;
  popState.down[i]=true; el.classList.add('down'); SFX.pop(); vibrate(8);
  const p=P(); p.stats.pops++;
  if(p.stats.pops%10===0) earn(1); else saveSoon();
  if(popState.down.every(Boolean)){
    popState.flipping=true;
    setTimeout(()=>{
      board.classList.add('flip'); SFX.flip();
      setTimeout(()=>{popState.down=popMask(popState.shape||'classic').slice();renderPop();},320);
      setTimeout(()=>{board.classList.remove('flip');popState.flipping=false;p.stats.flips++;const r=board.getBoundingClientRect();earn(5,'Flip bonus!',r.left+r.width/2,r.top+r.height/2);},680);
    },250);
  }
}
board.addEventListener('pointerdown',e=>{popping=true;try{board.releasePointerCapture(e.pointerId);}catch(_){}popAt(e.target);});
document.addEventListener('pointermove',e=>{if(popping)popAt(document.elementFromPoint(e.clientX,e.clientY));});
['pointerup','pointercancel'].forEach(ev=>document.addEventListener(ev,()=>{popping=false;}));

/* ---------- canvas helper ---------- */
function fit(cv){
  const r=cv.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1);
  const w=Math.max(1,Math.round(r.width*d)), h=Math.max(1,Math.round(r.height*d));
  if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
  const ctx=cv.getContext('2d'); ctx.setTransform(d,0,0,d,0,0);
  return {ctx,W:r.width,H:r.height};
}

/* ---------- squishy (slow-rise physics) ----------
   Press anywhere on the toy: a soft dent forms under each finger (deeper the longer you hold), the body
   flattens and bulges around it, and the dent follows the finger (kneading). Several fingers work at once.
   On release the dent stays and slowly rises back (memory foam). A quick poke jiggles instead.
   Dents are kept in body coordinates (u,v: -1..1 across the toy), so they stay put as the toy moves. */
const SQ={N:72,r:new Array(72).fill(1),s:0,q:0,lean:0,wob:0,wv:0,touches:new Map(),dents:[],geo:null,long:false,look:{u:0,v:0}};
const sqc=$('#squishCv');
const SQ_POKE_MS=250, SQ_MEMORY=8;
function sqLocal(e){const r=sqc.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
function sqBody(x,y){ // screen point -> body coordinates, kept inside the toy
  const g=SQ.geo; if(!g) return {u:0,v:0,in:false};
  let u=(x-g.cx)/(g.R*g.sx), v=(y-g.cy)/(g.R*g.sy); const d=Math.hypot(u,v), inside=d<1.2;
  if(d>0.92){u*=0.92/d;v*=0.92/d;}
  return {u,v,in:inside};
}
sqc.addEventListener('pointerdown',e=>{
  const q=sqLocal(e), b=sqBody(q.x,q.y); if(!b.in) return;
  if(!SQ.touches.size) SQ.long=false;
  SQ.touches.set(e.pointerId,{x:q.x,y:q.y,u:b.u,v:b.v,d:0.15,at:performance.now()});
  try{sqc.setPointerCapture(e.pointerId);}catch(_){}
  SFX.squish(); vibrate(15);
});
sqc.addEventListener('pointermove',e=>{const t=SQ.touches.get(e.pointerId);if(!t)return;const q=sqLocal(e);t.x=q.x;t.y=q.y;});
function sqUp(e){
  const t=SQ.touches.get(e.pointerId); if(!t) return; SQ.touches.delete(e.pointerId);
  const held=performance.now()-t.at, quick=held<SQ_POKE_MS;
  SQ.dents.push({u:t.u,v:t.v,d:t.d,quick}); if(SQ.dents.length>SQ_MEMORY) SQ.dents.shift();
  if(quick){SQ.wv-=1.2+t.d;tone(300,0.15,'sine',0.12,520);} else SFX.unsquish();
  if(held>90) SQ.long=true;
  if(!SQ.touches.size&&SQ.long){const p=P();p.stats.squish++;if(p.stats.squish%5===0)earn(1);else saveSoon();} // one squish per squeeze
}
sqc.addEventListener('pointerup',sqUp); sqc.addEventListener('pointercancel',sqUp);
const hexRgb=h=>{const n=parseInt(h.slice(1),16);return `${n>>16},${(n>>8)&255},${n&255}`;};

function drawSquish(dt){
  const {ctx,W,H}=fit(sqc); ctx.clearRect(0,0,W,H);
  const T=SQUISHIES[P().fid.squish]||SQUISHIES.mochi;
  const R=Math.min(W*0.3,H*0.28), baseY=Math.min(H*0.58+R*0.95,H-36); // low enough that the ears fit when it is squeezed tall
  const k=x=>1-Math.pow(1-x,dt*60);
  // fingers: dents deepen while held and follow the finger
  const active=[...SQ.touches.values()];
  // Where the fingers press decides the shape: the sides squeeze it narrower and taller (q), the top or middle
  // flattens it lower and wider (s). One finger on a side also tips it away.
  let sT=0, qT=0, leanT=0;
  for(const t of active){
    const b=sqBody(t.x,t.y); t.u=b.u; t.v=b.v; t.d+=(1-t.d)*k(0.05);
    const side=clamp((Math.abs(t.u)-0.15)/0.6,0,1), top=clamp(0.4-t.v,0,1);
    sT+=t.d*(0.1*(1-side)+0.12*top*(1-side*0.7)); qT+=t.d*side*0.13; leanT-=t.d*t.u*0.1;
  }
  // released dents rise back slowly (a quick poke rises fast)
  for(const D of SQ.dents) D.d-=dt*(D.quick?1.8:0.28)*(0.4+D.d);
  SQ.dents=SQ.dents.filter(D=>D.d>0.02);
  SQ.s+=(Math.min(sT,0.34)-SQ.s)*k(active.length?0.15:0.025);
  SQ.q+=(Math.min(qT,0.18)-SQ.q)*k(active.length?0.15:0.025);
  SQ.lean+=(clamp(leanT,-0.12,0.12)-SQ.lean)*k(active.length?0.12:0.03);
  SQ.wv+=(-180*SQ.wob-9*SQ.wv)*dt; SQ.wob=clamp(SQ.wob+SQ.wv*dt,-0.12,0.12); // jiggle spring
  const s=SQ.s, q=SQ.q, sx=(1+s*.55)*(1-q)*(1+SQ.wob), sy=(1-s)*(1+q*0.65)*(1-SQ.wob), cx=W/2+SQ.lean*R, cy=baseY-R*sy;
  SQ.geo={cx,cy,R,sx,sy};
  const all=active.concat(SQ.dents);
  if(active.length){const t=active[active.length-1];SQ.look={u:t.u,v:t.v};} else if(!SQ.dents.length) SQ.look.u*=0.95,SQ.look.v*=0.95;
  // table
  ctx.fillStyle='#3b2f52'; ctx.fillRect(0,baseY,W,H-baseY); ctx.fillStyle='#4b3a66'; ctx.fillRect(0,baseY,W,6);
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(cx,baseY+4,R*sx,R*.12,0,0,TAU); ctx.fill();
  // outline: pinched in under fingers near the edge, bulging out a little everywhere else
  const N=SQ.N, pts=[];
  for(let i=0;i<N;i++){
    const a=i/N*TAU; let t=1;
    for(const D of all){const rho=Math.hypot(D.u,D.v), edge=clamp((rho-0.45)/0.55,0,1), da=Math.atan2(Math.sin(a-Math.atan2(D.v,D.u)),Math.cos(a-Math.atan2(D.v,D.u)));
      const near=Math.exp(-da*da/0.14); t+=D.d*(0.07*(1-edge*near)-0.32*edge*near);}
    SQ.r[i]+=(t-SQ.r[i])*k(0.3);
    const ghostHem=T.extra==='ghost'&&Math.sin(a)>0.25?Math.min(1,(Math.sin(a)-0.25)*3):0; // Ghosty: a wavy hem along the bottom
    const bump=T.extra==='cloud'?1+0.06*Math.cos(a*7):1+0.07*ghostHem*Math.cos(a*10), rr=R*SQ.r[i]*bump;
    pts.push({x:cx+Math.cos(a)*rr*sx,y:cy+Math.sin(a)*rr*sy});
  }
  const at=a=>pts[Math.round((((a%TAU)+TAU)%TAU)/TAU*N)%N];
  ctx.lineWidth=3; ctx.strokeStyle=T.line; ctx.lineJoin='round';
  // things behind the body
  if(T.extra==='ears'){
    for(const sg of [-1,1]){const p=at(-Math.PI/2+sg*0.5),dx=p.x-cx,dy=p.y-cy,l=Math.hypot(dx,dy)||1;
      ctx.save();ctx.translate(p.x+dx/l*R*.28,p.y+dy/l*R*.28);ctx.rotate(Math.atan2(dy,dx)+Math.PI/2);
      ctx.fillStyle=T.fill;ctx.beginPath();ctx.ellipse(0,0,R*.2,R*.45,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle='#ffc1d9';ctx.beginPath();ctx.ellipse(0,R*.03,R*.09,R*.3,0,0,TAU);ctx.fill();ctx.restore();}
  }
  if(T.extra==='wings'){
    for(const sg of [1,-1]){const p=at(sg>0?0:Math.PI);ctx.save();ctx.translate(p.x-sg*R*.12,p.y);ctx.scale(sg,1);
      ctx.fillStyle='#6b46b8';ctx.beginPath();ctx.moveTo(0,-R*.25);ctx.quadraticCurveTo(R*.5,-R*.6,R*.78,-R*.2);ctx.quadraticCurveTo(R*.6,-R*.05,R*.64,R*.1);
      ctx.quadraticCurveTo(R*.47,0,R*.42,R*.18);ctx.quadraticCurveTo(R*.26,R*.05,0,R*.2);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
    for(const sg of [-1,1]){const p=at(-Math.PI/2+sg*0.45);ctx.fillStyle=T.fill;ctx.beginPath();ctx.moveTo(p.x-R*.14,p.y+R*.12);ctx.lineTo(p.x+sg*R*.06,p.y-R*.3);ctx.lineTo(p.x+R*.14,p.y+R*.12);ctx.closePath();ctx.fill();ctx.stroke();}
  }
  // body
  const g=ctx.createRadialGradient(cx-R*.35,cy-R*.45*sy,R*.08,cx,cy,R*1.5);
  g.addColorStop(0,T.hi); g.addColorStop(.4,T.fill); g.addColorStop(1,T.shade);
  const body=new Path2D(); const m0={x:(pts[N-1].x+pts[0].x)/2,y:(pts[N-1].y+pts[0].y)/2}; body.moveTo(m0.x,m0.y);
  for(let i=0;i<N;i++){const p=pts[i],q=pts[(i+1)%N];body.quadraticCurveTo(p.x,p.y,(p.x+q.x)/2,(p.y+q.y)/2);}
  body.closePath(); ctx.fillStyle=g; ctx.fill(body);
  // dents: a soft shadowy dimple with a light rim and little creases, drawn inside the body only
  if(all.length){
    const sh=hexRgb(T.shade), ln=hexRgb(T.line), rim=T.dark?hexRgb(T.hi):'255,255,255'; // a dark toy gets a soft purple rim, not a white halo
    ctx.save(); ctx.clip(body);
    for(const D of all){
      const x=cx+D.u*R*sx, y=cy+D.v*R*sy, rd=R*(0.16+0.14*D.d), a=Math.min(1,D.d);
      const dg=ctx.createRadialGradient(x,y,0,x,y,rd);
      dg.addColorStop(0,`rgba(${ln},${0.45*a})`); dg.addColorStop(0.35,`rgba(${sh},${0.6*a})`); dg.addColorStop(0.68,`rgba(${sh},${0.22*a})`);
      dg.addColorStop(0.85,`rgba(${rim},${(T.dark?0.3:0.5)*a})`); dg.addColorStop(1,`rgba(${rim},0)`);
      ctx.fillStyle=dg; ctx.beginPath(); ctx.arc(x,y,rd,0,TAU); ctx.fill();
      if(D.d>0.35){ctx.strokeStyle=`rgba(${ln},${0.45*(D.d-0.35)})`;ctx.lineWidth=Math.max(1.5,R*.012);
        for(let c=0;c<3;c++){const ca=c*TAU/3+0.5;ctx.beginPath();ctx.arc(x,y,rd*0.92,ca,ca+0.7);ctx.stroke();}}
    }
    ctx.restore();
  }
  ctx.strokeStyle=T.line; ctx.lineWidth=4; ctx.stroke(body);
  const fsx=sx, fsy=sy;
  if(T.extra==='berry'){ctx.fillStyle='#ffe066';for(const [u,v] of [[-.5,-.2],[-.15,-.45],[.3,-.3],[.55,.05],[-.6,.25],[.1,.45],[-.25,.6],[.45,.5]]){ctx.beginPath();ctx.ellipse(cx+u*R*fsx,cy+v*R*fsy,R*.03,R*.05,0,0,TAU);ctx.fill();}}
  if(T.extra==='berry'||T.extra==='leaf'){const p=at(-Math.PI/2);ctx.fillStyle='#5cc28a';ctx.strokeStyle='#2b6a4a';ctx.lineWidth=3;
    const leaves=T.extra==='berry'?[-0.9,-0.3,0.3,0.9]:[0.5];
    for(const a of leaves){ctx.save();ctx.translate(p.x,p.y+R*.04);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,-R*.14,R*.08,R*.18,0,0,TAU);ctx.fill();ctx.stroke();ctx.restore();}}
  // face: watches your finger, scrunches up when squeezed, blushes when you squish its cheeks
  const fx=R*.3*fsx, ey=cy+R*.02, ink=T.dark?'#fff':'#2a1f33';
  const squint=s>0.13||active.some(t=>t.d>0.35);
  const cheek=Math.max(0,...all.map(D=>D.d*Math.exp(-((Math.abs(D.u)-0.42)**2+(D.v-0.16)**2)/0.03)));
  const lx=clamp(SQ.look.u,-1,1)*R*.025, ly=clamp(SQ.look.v,-1,1)*R*.025;
  ctx.fillStyle=ink; ctx.strokeStyle=ink; ctx.lineCap='round';
  if(squint){ctx.lineWidth=Math.max(2,R*.05);for(const sg of [-1,1]){const x=cx+sg*fx;ctx.beginPath();ctx.moveTo(x+sg*R*.06,ey-R*.08);ctx.lineTo(x-sg*R*.06,ey);ctx.lineTo(x+sg*R*.06,ey+R*.08);ctx.stroke();}}
  else for(const sg of [-1,1]){const x=cx+sg*fx;ctx.fillStyle=T.dark?'#ff4fa3':'#2a1f33';ctx.beginPath();ctx.ellipse(x+lx,ey+ly,R*.07,R*.09,0,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+lx+R*.025,ey+ly-R*.035,R*.028,0,TAU);ctx.fill();}
  ctx.fillStyle=`rgba(255,130,180,${Math.min(0.95,0.55+cheek*0.6)})`;
  for(const sg of [-1,1]){ctx.beginPath();ctx.ellipse(cx+sg*fx*1.4,ey+R*.14,R*(.09+cheek*.04),R*(.05+cheek*.02),0,0,TAU);ctx.fill();}
  ctx.strokeStyle=ink; ctx.lineWidth=Math.max(2,R*.03); const my=ey+R*.15;
  if(squint){ctx.fillStyle=ink;ctx.beginPath();ctx.ellipse(cx,my+R*.02,R*.05,R*.06,0,0,TAU);ctx.fill();}
  else{ctx.beginPath();ctx.moveTo(cx-R*.08,my);ctx.quadraticCurveTo(cx-R*.04,my+R*.07,cx,my);ctx.quadraticCurveTo(cx+R*.04,my+R*.07,cx+R*.08,my);ctx.stroke();}
  if(T.extra==='wings'){ctx.fillStyle='#fff';for(const o of [-.05,.05]){ctx.beginPath();ctx.moveTo(cx+o*R-R*.02,my+R*.02);ctx.lineTo(cx+o*R,my+R*.08);ctx.lineTo(cx+o*R+R*.02,my+R*.02);ctx.fill();}}
}

/* ---------- spinner (flick physics) ---------- */
const SP={a:0,w:0,drag:false,last:0,lastT:0,wEst:0,acc:0};
const spc=$('#spinCv');
const angOf=e=>{const r=spc.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2);};
spc.addEventListener('pointerdown',e=>{SP.drag=true;SP.last=angOf(e);SP.lastT=performance.now();SP.wEst=0;SP.w=0;try{spc.setPointerCapture(e.pointerId);}catch(_){}});
spc.addEventListener('pointermove',e=>{
  if(!SP.drag) return; const a=angOf(e), now=performance.now();
  let d=a-SP.last; d=Math.atan2(Math.sin(d),Math.cos(d));
  const dt=Math.max(0.004,(now-SP.lastT)/1000);
  SP.a+=d; addRot(d); SP.wEst=SP.wEst*0.5+(d/dt)*0.5; SP.last=a; SP.lastT=now;
});
function spUp(){if(!SP.drag)return;SP.drag=false;SP.w=(performance.now()-SP.lastT>100)?0:clamp(SP.wEst*1.15,-90,90);}
spc.addEventListener('pointerup',spUp); spc.addEventListener('pointercancel',spUp);
function addRot(d){
  SP.acc+=Math.abs(d);
  while(SP.acc>=TAU){SP.acc-=TAU;const p=P();p.stats.spins++;if(p.stats.spins%25===0){const r=spc.getBoundingClientRect();earn(1,null,r.left+r.width/2,r.top+r.height*0.2);}}
}
function cStar(ctx,x,y,r){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();ctx.fill();}
function cBat(ctx,x,y,s){ctx.beginPath();ctx.moveTo(x-1.6*s,y);ctx.quadraticCurveTo(x-s,y-s,x-.4*s,y-.4*s);ctx.quadraticCurveTo(x,y-s,x+.4*s,y-.4*s);ctx.quadraticCurveTo(x+s,y-s,x+1.6*s,y);
  ctx.quadraticCurveTo(x+s,y-.2*s,x+.8*s,y+.4*s);ctx.quadraticCurveTo(x+.4*s,y,x,y+.6*s);ctx.quadraticCurveTo(x-.4*s,y,x-.8*s,y+.4*s);ctx.quadraticCurveTo(x-s,y-.2*s,x-1.6*s,y);ctx.fill();}
function cHeart(ctx,x,y,s){ctx.beginPath();ctx.moveTo(x,y+s*.9);ctx.bezierCurveTo(x-s*1.6,y-s*.1,x-s*.9,y-s*1.3,x,y-s*.45);ctx.bezierCurveTo(x+s*.9,y-s*1.3,x+s*1.6,y-s*.1,x,y+s*.9);ctx.fill();}
function spinnerShape(ctx,cx,cy,R,a,T){
  ctx.save(); ctx.translate(cx,cy); ctx.rotate(a);
  const L=R*.62, lr=R*.36, lobes=[0,1,2].map(k=>{const t=k*TAU/3;return [Math.cos(t)*L,Math.sin(t)*L];});
  // outline pass, then fill pass, so lobes + middle read as one smooth shape
  ctx.fillStyle=T.edge; ctx.beginPath(); ctx.arc(0,0,R*.47+5,0,TAU); ctx.fill();
  lobes.forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,lr+5,0,TAU);ctx.fill();});
  ctx.fillStyle=T.body; ctx.beginPath(); ctx.arc(0,0,R*.47,0,TAU); ctx.fill();
  lobes.forEach(([x,y])=>{
    ctx.fillStyle=T.body;ctx.beginPath();ctx.arc(x,y,lr,0,TAU);ctx.fill();
    const g=ctx.createRadialGradient(x-lr*.2,y-lr*.2,lr*.05,x,y,lr*.65);g.addColorStop(0,'#fff');g.addColorStop(1,'#9a96a8');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,lr*.62,0,TAU);ctx.fill();ctx.fillStyle='#55505f';ctx.beginPath();ctx.arc(x,y,lr*.36,0,TAU);ctx.fill();
  });
  ctx.fillStyle=T.deco==='pent'?'#222':T.edge;
  for(let k=0;k<3;k++){const t=k*TAU/3+Math.PI/3,x=Math.cos(t)*R*.35,y=Math.sin(t)*R*.35;
    if(T.deco==='star')cStar(ctx,x,y,R*.08);else if(T.deco==='bat')cBat(ctx,x,y,R*.065);else if(T.deco==='heart')cHeart(ctx,x,y,R*.06);else{ctx.beginPath();for(let i=0;i<5;i++){const q=i*TAU/5-Math.PI/2;ctx.lineTo(x+Math.cos(q)*R*.06,y+Math.sin(q)*R*.06);}ctx.closePath();ctx.fill();}}
  ctx.fillStyle=T.cap;ctx.strokeStyle=T.edge;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,R*.24,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle=T.body;ctx.beginPath();ctx.arc(0,0,R*.11,0,TAU);ctx.fill();
  ctx.restore();
}
function drawSpin(dt){
  const {ctx,W,H}=fit(spc); ctx.clearRect(0,0,W,H);
  const p=P(), T=SPINS[p.fid.spin]||SPINS.galaxy;
  if(!SP.drag){const d=SP.w*dt;SP.a+=d;addRot(d);SP.w*=Math.exp(-0.22*dt);if(Math.abs(SP.w)<1)SP.w*=Math.exp(-2*dt);if(Math.abs(SP.w)<0.03)SP.w=0;}
  const R=Math.min(W,H)*0.34, speed=Math.abs(SP.drag?SP.wEst:SP.w);
  const ghosts=speed>12?3:0, dir=Math.sign(SP.drag?SP.wEst:SP.w)||1;
  for(let i=ghosts;i>=0;i--){ctx.globalAlpha=i?0.13:1;spinnerShape(ctx,W/2,H/2,R,SP.a-i*dir*0.13,T);}
  ctx.globalAlpha=1;
  const rpm=Math.round(speed*60/TAU);
  if(rpm>p.stats.bestRpm){p.stats.bestRpm=rpm;saveSoon();}
  $('#rpm').textContent=`🌀 ${rpm} RPM · Best ${p.stats.bestRpm}`;
  hum(speed);
}
