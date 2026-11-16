'use strict';
/* =========================================================
   19. NEW FIDGETS (v1.16): slime, clicker cube, marble maze
   ========================================================= */
// Three more tabs on the Fidget Shelf. Each has designs to buy, picked in the skin row like the others.
// Saved: p.fid.slime / p.fid.cube / p.fid.marble, owned as slime:<id> / cube:<id> / marble:<id>,
// p.maze.solved (maze ids), stats.stretches / clicks / mazes. Never rename these ids.
const SLIMES={
  grape:{name:'Glitter Grape',price:0,a:'#d2b6ff',b:'#8a5ae0',hi:'#f6efff',line:'#5a35a8',deco:'glitter',dc:['#ffffff','#ffd166','#ff8cc6']},
  mint:{name:'Mint Cloud',price:10,a:'#d4fff3',b:'#6fdcbc',hi:'#ffffff',line:'#3fae8c',deco:'fluff',dc:['#ffffff']},
  galaxy:{name:'Galaxy Goo',price:15,a:'#5a48a8',b:'#1d1640',hi:'#b4a8ff',line:'#120d2a',deco:'stars',dc:['#ffd166','#ffffff','#8ff0d0'],dark:true},
  bat:{name:'Bat Goo',price:20,a:'#6a5284',b:'#2a1f38',hi:'#c4a4ff',line:'#120d17',deco:'bats',dc:['#ff8cc6','#14101a'],dark:true}
};
const CUBES={
  pastel:{name:'Pastel',price:0,face:'#ffd6ec',edge:'#d99abd',part:'#a97cff',part2:'#8ff0d0',ink:'#3a1830'},
  emo:{name:'Emo Night',price:10,face:'#2b2236',edge:'#120d17',part:'#ff4fa3',part2:'#a97cff',ink:'#ffffff'},
  soccer:{name:'Soccer',price:15,face:'#3fae5a',edge:'#23703a',part:'#ffffff',part2:'#2a2a2a',ink:'#2a2a2a'},
  star:{name:'Starry',price:20,face:'#2a3577',edge:'#141b45',part:'#ffd166',part2:'#ff8cc6',ink:'#2a1f10'}
};
const MARBLES={
  pearl:{name:'Moon Pearl',price:0,a:'#ffffff',b:'#c9bfff',sw:'#a97cff'},
  candy:{name:'Candy Swirl',price:10,a:'#fff0f8',b:'#ff8cc6',sw:'#ff3f94'},
  galaxy:{name:'Galaxy',price:15,a:'#7a68e0',b:'#1d1640',sw:'#ffd166',stars:1},
  soccer:{name:'Soccer Ball',price:15,a:'#ffffff',b:'#cfcfcf',sw:'#222222',ball:1}
};
FID.slime={key:'slime',list:SLIMES}; FID.cube={key:'cube',list:CUBES}; FID.maze={key:'marble',list:MARBLES};
// called by setFidTab() and after picking a design
function fid2Open(t){if(t==='cube')renderCube();if(t==='maze')mzOpen();}
function fid2Refresh(){if(fidTab==='cube')renderCube();}

/* ---------- slime (stretchy blob) ----------
   The outline is a ring of points (in units of the blob's size R, around its resting centre). Grab it and pull:
   the side you pull towards stretches out after your finger and the rest gets a little thinner. Let go and it snaps
   back with a wobble. A quick poke leaves a dimple that fills back in. One stretch is counted per pull. */
const SL={N:56,pts:[],touches:new Map(),dimples:[],geo:null,maxPull:0,glit:[],gd:''};
const slc=$('#slimeCv');
(function(){for(let i=0;i<SL.N;i++){const r=slRest(i);SL.pts.push({x:r.x,y:r.y,vx:0,vy:0});}})();
function slRest(i){const a=i/SL.N*TAU;let y=Math.sin(a)*0.62;if(y>0.4)y=0.4+(y-0.4)*0.25;return {x:Math.cos(a),y};} // a dome, flat where it sits
function slGlitter(T){ // the bits inside, placed by (outline point, distance from the middle), so they stretch with it
  if(SL.gd===T.deco) return; SL.gd=T.deco; SL.glit=[]; let s=7;
  const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  const n=T.deco==='fluff'?14:T.deco==='glitter'?46:16;
  for(let k=0;k<n;k++) SL.glit.push({i:Math.floor(rnd()*SL.N),f:0.15+0.7*Math.sqrt(rnd()),c:T.dc[k%T.dc.length],s:0.6+rnd()*0.8,r:rnd()*TAU});
}
function slLocal(e){const r=slc.getBoundingClientRect(),g=SL.geo;if(!g)return {x:0,y:0};return {x:(e.clientX-r.left-g.cx)/g.R,y:(e.clientY-r.top-g.cy)/g.R};}
function slInside(q){ // near or inside the blob?
  const a=Math.atan2(q.y,q.x), i=Math.round(((a%TAU+TAU)%TAU)/TAU*SL.N)%SL.N, o=SL.pts[i];
  return Math.hypot(q.x,q.y)<Math.hypot(o.x,o.y)*1.12+0.08;
}
slc.addEventListener('pointerdown',e=>{
  const q=slLocal(e); if(!slInside(q)) return;
  if(!SL.touches.size) SL.maxPull=0;
  SL.touches.set(e.pointerId,{gx:q.x,gy:q.y,fx:q.x,fy:q.y,at:performance.now(),max:0,step:0});
  try{slc.setPointerCapture(e.pointerId);}catch(_){}
  noise(0.18,0.22,900,250); vibrate(10);
});
slc.addEventListener('pointermove',e=>{
  const t=SL.touches.get(e.pointerId); if(!t) return; const q=slLocal(e); t.fx=q.x; t.fy=q.y;
  const L=Math.hypot(t.fx-t.gx,t.fy-t.gy); t.max=Math.max(t.max,L); SL.maxPull=Math.max(SL.maxPull,L);
  const step=Math.floor(L/0.45); if(step>t.step){tone(240+step*90,0.14,'sine',0.07,340+step*110);t.step=step;} // stretchy squeak
});
function slUp(e){
  const t=SL.touches.get(e.pointerId); if(!t) return; SL.touches.delete(e.pointerId);
  if(t.max<0.15&&performance.now()-t.at<300){SL.dimples.push({x:t.gx,y:t.gy,d:1});if(SL.dimples.length>6)SL.dimples.shift();tone(260,0.12,'sine',0.14,520);}
  else if(t.max>0.3){tone(520,0.22,'sine',0.13,150);noise(0.16,0.18,1400,250);}
  if(!SL.touches.size&&SL.maxPull>0.5){SL.maxPull=0;const p=P();p.stats.stretches++;if(p.stats.stretches%5===0)earn(1);else saveSoon();} // one stretch per pull
}
slc.addEventListener('pointerup',slUp); slc.addEventListener('pointercancel',slUp);

function drawSlime(dt){
  const {ctx,W,H}=fit(slc); ctx.clearRect(0,0,W,H);
  const p=P(), T=SLIMES[p.fid.slime]||SLIMES.grape; slGlitter(T);
  const R=Math.min(W*0.26,H*0.34), baseY=Math.min(H*0.62+R*0.4,H-40), cx=W/2, cy=baseY-R*0.4;
  SL.geo={cx,cy,R};
  // table
  ctx.fillStyle='#3b2f52'; ctx.fillRect(0,baseY,W,H-baseY); ctx.fillStyle='#4b3a66'; ctx.fillRect(0,baseY,W,6);
  // where each point wants to be: pulled after the fingers, the rest a little thinner
  const act=[...SL.touches.values()], N=SL.N, held=act.length>0;
  let thin=0; const pulls=act.map(t=>{let dx=t.fx-t.gx, dy=t.fy-t.gy; const L=Math.hypot(dx,dy), Lc=1.9*Math.tanh(L/1.9);
    if(L>0){dx*=Lc/L;dy*=Lc/L;} thin=Math.max(thin,Lc);
    return {dx,dy,ga:Math.atan2(t.gy+dy*2,t.gx+dx*2),sig:0.62/(1+Lc*0.9)};});
  const k=held?320:150, c=held?20:5.5;
  for(let i=0;i<N;i++){
    const r=slRest(i), a=i/N*TAU, P0=SL.pts[i]; let tx=r.x, ty=r.y, wsum=0;
    for(const u of pulls){let d=a-u.ga; d=Math.atan2(Math.sin(d),Math.cos(d)); const w=Math.exp(-d*d/(2*u.sig*u.sig)); tx+=u.dx*w; ty+=u.dy*w; wsum+=w;
      tx+=u.dx*0.12*(1-w); ty+=u.dy*0.12*(1-w);} // the whole blob leans along a little
    const sh=1-0.1*Math.min(thin,1.9)*(1-Math.min(1,wsum)); tx=tx*sh+(1-sh)*0; ty=ty*sh+0.4*(1-sh); // keep it sitting on the table
    const h=Math.min(dt,0.05)/3;
    for(let s=0;s<3;s++){P0.vx+=(k*(tx-P0.x)-c*P0.vx)*h; P0.vy+=(k*(ty-P0.y)-c*P0.vy)*h; P0.x+=P0.vx*h; P0.y+=P0.vy*h;}
    if(P0.y>0.42) {P0.y=0.42; if(P0.vy>0)P0.vy=0;} // can't go through the table
  }
  for(const D of SL.dimples) D.d-=dt*0.7; SL.dimples=SL.dimples.filter(D=>D.d>0);
  const pt=i=>{const q=SL.pts[(i+N)%N];return {x:cx+q.x*R,y:cy+q.y*R};};
  // shadow
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(cx,baseY+3,R*1.05,R*0.1,0,0,TAU); ctx.fill();
  // body
  const body=new Path2D(); let a0=pt(N-1), b0=pt(0); body.moveTo((a0.x+b0.x)/2,(a0.y+b0.y)/2);
  for(let i=0;i<N;i++){const q=pt(i), q2=pt(i+1); body.quadraticCurveTo(q.x,q.y,(q.x+q2.x)/2,(q.y+q2.y)/2);}
  body.closePath();
  const g=ctx.createRadialGradient(cx-R*0.35,cy-R*0.35,R*0.05,cx,cy,R*1.4);
  g.addColorStop(0,T.hi); g.addColorStop(0.35,T.a); g.addColorStop(1,T.b);
  ctx.fillStyle=g; ctx.fill(body);
  ctx.save(); ctx.clip(body);
  // the bits inside
  for(const G of SL.glit){const q=SL.pts[G.i], x=cx+q.x*R*G.f, y=cy+q.y*R*G.f, s=R*0.035*G.s; ctx.fillStyle=G.c; ctx.globalAlpha=T.deco==='fluff'?0.55:0.95;
    if(T.deco==='glitter'){ctx.save();ctx.translate(x,y);ctx.rotate(G.r);ctx.fillRect(-s*0.6,-s*0.6,s*1.2,s*1.2);ctx.restore();}
    else if(T.deco==='fluff'){ctx.beginPath();ctx.arc(x,y,s*3,0,TAU);ctx.fill();}
    else if(T.deco==='stars') cStar(ctx,x,y,s*1.6);
    else if(T.deco==='bats') cBat(ctx,x,y,s*1.3);}
  ctx.globalAlpha=1;
  // dimples from pokes
  for(const D of SL.dimples){const x=cx+D.x*R, y=cy+D.y*R, rd=R*0.17, dg=ctx.createRadialGradient(x,y,0,x,y,rd);
    dg.addColorStop(0,`rgba(0,0,0,${0.3*D.d})`); dg.addColorStop(0.7,`rgba(0,0,0,${0.1*D.d})`); dg.addColorStop(0.9,`rgba(255,255,255,${0.35*D.d})`); dg.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=dg; ctx.beginPath(); ctx.arc(x,y,rd,0,TAU); ctx.fill();}
  // shine
  ctx.fillStyle='rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(cx-R*0.38,cy-R*0.3,R*0.26,R*0.1,-0.35,0,TAU); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(cx-R*0.08,cy-R*0.42,R*0.045,0,TAU); ctx.fill();
  ctx.restore();
  ctx.strokeStyle=T.line; ctx.lineWidth=3; ctx.lineJoin='round'; ctx.stroke(body);
}

/* ---------- clicker cube (buttons, no animation loop) ----------
   One face of a fidget cube: 3 clicky buttons, a flip switch, a roller, a joystick and a spinning ball.
   Buttons, the switch and joystick pushes are 1 click each; the roller and ball tick, and 4 ticks are 1 click. */
const CB={ticks:0,roll:0,ball:0,sw:false,drag:new Map()};
const cubeEl=$('#cube');
function renderCube(){
  const p=P(); if(!p) return; const T=CUBES[p.fid.cube]||CUBES.pastel;
  const st=cubeEl.style; st.setProperty('--f',T.face); st.setProperty('--e',T.edge); st.setProperty('--p',T.part); st.setProperty('--p2',T.part2); st.setProperty('--ink',T.ink);
  if(!cubeEl.firstChild) cubeEl.innerHTML=`<div class="cb-btns">${['★','♥','☾'].map((s,i)=>`<button class="cb-btn" data-cb="btn" data-i="${i}"><b>${s}</b></button>`).join('')}</div>
    <button class="cb-sw" data-cb="sw"><i></i></button><div class="cb-roll" data-cb="roll"></div>
    <div class="cb-joy" data-cb="joy"><i></i></div><div class="cb-ball" data-cb="ball"><i></i></div>`;
  cbFit();
}
function cbFit(){ // pick the tall or wide layout, whichever makes the parts bigger, then size it in em
  const r=$('#fid-cube').getBoundingClientRect(); if(!r.width) return;
  const W=r.width*0.94, H=r.height-(document.body.classList.contains('easy')?24:58);
  const tall=Math.min(26,W/18,H/15.5), wide=Math.min(26,W/30.5,H/9.5), isWide=wide>tall, em=Math.max(9,isWide?wide:tall);
  cubeEl.classList.toggle('wide',isWide); cubeEl.style.fontSize=em+'px';
  cubeEl.style.width=(isWide?30.5:18)*em+'px'; cubeEl.style.height=(isWide?9.5:15.5)*em+'px';
}
window.addEventListener('resize',()=>{if(cur==='fidget'&&fidTab==='cube')cbFit();});
function cbClick(){const p=P();p.stats.clicks++;if(p.stats.clicks%25===0)earn(1);else saveSoon();}
function cbTick(){tone(2600,0.014,'square',0.03);if(++CB.ticks%4===0)cbClick();}
const cbSnd={
  btn:i=>{tone([1900,1600,2200][i]||1900,0.03,'square',0.06,1200);noise(0.03,0.12,5000,1800);},
  sw:on=>{noise(0.04,0.22,4200,1400);tone(on?900:700,0.05,'square',0.05,500);},
  joy:()=>{tone(170,0.07,'sine',0.22,110);noise(0.03,0.1,2500,700);}
};
cubeEl.addEventListener('pointerdown',e=>{
  const el=e.target.closest('[data-cb]'); if(!el) return; const kind=el.dataset.cb;
  if(kind==='btn'){el.classList.add('down');cbSnd.btn(+el.dataset.i);vibrate(6);cbClick();}
  else if(kind==='sw'){CB.sw=!CB.sw;el.classList.toggle('on',CB.sw);cbSnd.sw(CB.sw);vibrate(10);cbClick();}
  else{const r=el.getBoundingClientRect();
    CB.drag.set(e.pointerId,{el,kind,x:e.clientX,y:e.clientY,cx:r.left+r.width/2,cy:r.top+r.height/2,max:r.width*0.27,
      a:Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2),dist:0,tick:0,dir:'',w:0,t:performance.now()});
    if(kind==='joy') el.classList.add('held'); if(kind==='ball') el.classList.remove('free');}
  try{el.setPointerCapture(e.pointerId);}catch(_){}
});
cubeEl.addEventListener('pointermove',e=>{
  const d=CB.drag.get(e.pointerId); if(!d) return; const dx=e.clientX-d.x, dy=e.clientY-d.y, em=parseFloat(cubeEl.style.fontSize)||16;
  if(d.kind==='roll'){const m=Math.abs(dy)>=Math.abs(dx)?dy:dx; CB.roll+=m; d.el.style.backgroundPositionY=CB.roll+'px';
    d.dist+=Math.abs(m); while(d.dist>em*0.95){d.dist-=em*0.95;cbTick();}}
  if(d.kind==='joy'){let jx=e.clientX-d.cx, jy=e.clientY-d.cy; const L=Math.hypot(jx,jy); if(L>d.max){jx*=d.max/L;jy*=d.max/L;}
    d.el.firstChild.style.transform=`translate(${jx}px,${jy}px)`;
    const dir=L>d.max*0.7?(Math.abs(jx)>Math.abs(jy)?(jx>0?'R':'L'):(jy>0?'D':'U')):'';
    if(dir&&dir!==d.dir){cbSnd.joy();vibrate(8);cbClick();} d.dir=dir;}
  if(d.kind==='ball'){const a=Math.atan2(e.clientY-d.cy,e.clientX-d.cx); let da=a-d.a; da=Math.atan2(Math.sin(da),Math.cos(da));
    const now=performance.now(); d.w=d.w*0.5+da/Math.max(0.004,(now-d.t)/1000)*0.5; d.t=now;
    CB.ball+=da; d.a=a; d.el.firstChild.style.transform=`rotate(${CB.ball}rad)`;
    d.dist+=Math.abs(da); while(d.dist>Math.PI/6){d.dist-=Math.PI/6;cbTick();}}
  d.x=e.clientX; d.y=e.clientY;
});
function cbUp(e){
  const b=e.target.closest&&e.target.closest('.cb-btn.down'); if(b) b.classList.remove('down');
  $$('#cube .cb-btn.down').forEach(x=>x.classList.remove('down'));
  const d=CB.drag.get(e.pointerId); if(!d) return; CB.drag.delete(e.pointerId);
  if(d.kind==='joy'){d.el.classList.remove('held');d.el.firstChild.style.transform='';if(d.dir)tone(1200,0.03,'triangle',0.05);}
  if(d.kind==='ball'&&performance.now()-d.t<120&&Math.abs(d.w)>3){ // a flick keeps it spinning a moment (a CSS ease, no loop)
    const extra=clamp(d.w*0.35,-14,14); CB.ball+=extra; d.el.classList.add('free'); d.el.firstChild.style.transform=`rotate(${CB.ball}rad)`;
    const n=Math.min(12,Math.floor(Math.abs(extra)/(Math.PI/6))); for(let i=0;i<n;i++) setTimeout(cbTick,60+i*i*6);}
}
cubeEl.addEventListener('pointerup',cbUp); cubeEl.addEventListener('pointercancel',cbUp);

/* ---------- marble maze (tilt, or hold a finger where it should roll) ----------
   Mazes are text: '#' wall, '.' floor, 'S' start, 'G' the star hole, 'o' a bouncy bumper. Coordinates are in cells.
   Tilt comes from the device (no permission needed on Android) and is measured from how she held it when the maze
   started, so any comfortable angle is "flat". A finger on the board always works and wins over tilt.
   Coins: +3 the first time each maze is solved, +1 for a replay, +5 once when all of them are solved.
   Maze ids are saved in p.maze.solved: never rename them; add new mazes at the end. */
const MAZES=[
  {id:'m1',name:'First Roll',map:['S........','.........','#######..','.........','.........','........G']},
  {id:'m2',name:'Zig Zag',map:['S...#....','....#....','....#..#.','....#..#.','.......#.','.......#G']},
  {id:'m3',name:'Twisty',map:['S.#......','..#.###..','..#...#..','..###.#..','......#.G','.######..']},
  {id:'m4',name:'Bumper Party',map:['S..o...o.','.o...o...','####.####','...o...o.','.o...o...','G........']},
  {id:'m5',name:'Snake Path',map:['S.#...#..','..#.#.#..','..#.#.#..','..#.#.#..','..#.#.#..','....#...G']},
  {id:'m6',name:'Bat Cave',map:['S...#....','###.#.##.','....#..#.','.####o.#.','.....#.#.','###....#G']}
];
const MZ_ACC=14, MZ_R=0.3, MZ_TILT=20; // full push in cells/s², marble radius in cells, degrees of tilt for a full push
const MZ={i:0,x:0,y:0,vx:0,vy:0,roll:0,drop:0,done:false,fing:null,tilt:{on:true,seen:false,base:null,x:0,y:0},listening:false,geo:null,knock:0,hit:{},cells:null};
const mzc=$('#mazeCv');
function mzCell(c,r){const m=MAZES[MZ.i].map;return r<0||r>=m.length||c<0||c>=m[0].length?'#':m[r][c];}
function mzStart(i){
  MZ.i=clamp(i|0,0,MAZES.length-1); const m=MAZES[MZ.i].map;
  m.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==='S'){MZ.x=c+0.5;MZ.y=r+0.5;}if(ch==='G'){MZ.gx=c+0.5;MZ.gy=r+0.5;}}));
  MZ.vx=MZ.vy=0; MZ.drop=0; MZ.done=false; MZ.tilt.base=null; MZ.hit={};
  mzBar();
}
function mzOpen(){const p=P();if(MZ.i===0&&!MZ.started){MZ.started=1;const k=MAZES.findIndex(m=>!p.maze.solved.includes(m.id));mzStart(k<0?0:k);}else mzBar();}
function mzBar(){
  const p=P(); if(!p) return;
  $('#mazeBar').innerHTML=MAZES.map((m,i)=>`<button class="tab mzb${i===MZ.i?' on':''}" data-mz="${i}">${i+1}${p.maze.solved.includes(m.id)?' ⭐':''}</button>`).join('')
    +(MZ.tilt.seen?`<button class="tab mzb" id="mzTilt">📱 ${MZ.tilt.on?'Tilt ON':'Tilt OFF'}</button>`:'');
}
$('#mazeBar').onclick=e=>{
  if(e.target.closest('#mzTilt')){MZ.tilt.on=!MZ.tilt.on;MZ.tilt.base=null;SFX.click();mzBar();return;}
  const b=e.target.closest('[data-mz]'); if(!b) return; SFX.click(); mzStart(+b.dataset.mz);
};
// the tilt sensor is only listened to while the maze is on screen
function mzOrient(e){
  if(e.beta==null||e.gamma==null) return;
  const ang=((screen.orientation&&screen.orientation.angle)!=null?screen.orientation.angle:(window.orientation||0));
  const A=((ang%360)+360)%360, b=e.beta, g=e.gamma;
  const raw=A===90?{x:b,y:-g}:A===270?{x:-b,y:g}:A===180?{x:-g,y:-b}:{x:g,y:b}; // turn the reading the way the screen is turned
  const T=MZ.tilt; if(!T.seen){T.seen=true;mzBar();}
  if(!T.base) T.base=raw;
  const f=v=>Math.abs(v)<1.5?0:clamp(v/MZ_TILT,-1,1);
  T.x=f(raw.x-T.base.x); T.y=f(raw.y-T.base.y);
}
function mzSensor(on){
  if(on===MZ.listening) return; MZ.listening=on;
  if(on) window.addEventListener('deviceorientation',mzOrient); else {window.removeEventListener('deviceorientation',mzOrient);MZ.fing=null;}
}
window.addEventListener('orientationchange',()=>{MZ.tilt.base=null;});
const mzLocal=e=>{const r=mzc.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
mzc.addEventListener('pointerdown',e=>{MZ.fing=mzLocal(e);MZ.fid=e.pointerId;try{mzc.setPointerCapture(e.pointerId);}catch(_){}});
mzc.addEventListener('pointermove',e=>{if(MZ.fing&&e.pointerId===MZ.fid)MZ.fing=mzLocal(e);});
['pointerup','pointercancel'].forEach(t=>mzc.addEventListener(t,e=>{if(e.pointerId===MZ.fid)MZ.fing=null;}));

function mzPush(){ // which way the marble is pushed, -1..1 on each axis
  const G=MZ.geo;
  if(MZ.fing&&G){let x=(MZ.fing.x-G.mx)/(G.short*0.4), y=(MZ.fing.y-G.my)/(G.short*0.4); const L=Math.hypot(x,y); if(L>1){x/=L;y/=L;} return {x,y};}
  if(MZ.tilt.on&&MZ.tilt.seen) return {x:MZ.tilt.x,y:MZ.tilt.y};
  return {x:0,y:0};
}
function mzStep(dt){
  const m=MAZES[MZ.i].map, cols=m[0].length, rows=m.length, g=mzPush(), n=4, h=dt/n;
  for(let s=0;s<n;s++){
    MZ.vx+=g.x*MZ_ACC*h; MZ.vy+=g.y*MZ_ACC*h;
    const fr=Math.exp(-0.9*h); MZ.vx*=fr; MZ.vy*=fr;
    const sp=Math.hypot(MZ.vx,MZ.vy); if(sp>8){MZ.vx*=8/sp;MZ.vy*=8/sp;}
    MZ.x+=MZ.vx*h; MZ.y+=MZ.vy*h; MZ.roll+=Math.hypot(MZ.vx,MZ.vy)*h/MZ_R;
    // walls (and the board's edge): push out from the nearest point of each block
    const c0=Math.floor(MZ.x), r0=Math.floor(MZ.y);
    for(let r=r0-1;r<=r0+1;r++) for(let c=c0-1;c<=c0+1;c++){
      const ch=mzCell(c,r);
      if(ch==='#'){const px=clamp(MZ.x,c,c+1), py=clamp(MZ.y,r,r+1); let dx=MZ.x-px, dy=MZ.y-py; const d=Math.hypot(dx,dy);
        if(d<MZ_R){ if(d<1e-6){dx=0;dy=-1;} else {dx/=d;dy/=d;}
          MZ.x+=dx*(MZ_R-d); MZ.y+=dy*(MZ_R-d); const vn=MZ.vx*dx+MZ.vy*dy;
          if(vn<0){MZ.vx-=1.35*vn*dx;MZ.vy-=1.35*vn*dy;if(-vn>1.6&&MZ.knock<=0){tone(160+Math.min(4,-vn)*30,0.06,'sine',Math.min(0.25,-vn*0.04),100);MZ.knock=0.08;}}}}
      else if(ch==='o'){const bx=c+0.5, by=r+0.5; let dx=MZ.x-bx, dy=MZ.y-by; const d=Math.hypot(dx,dy), rr=MZ_R+0.24;
        if(d<rr&&d>1e-6){dx/=d;dy/=d;MZ.x=bx+dx*rr;MZ.y=by+dy*rr;const vn=MZ.vx*dx+MZ.vy*dy;
          if(vn<0){MZ.vx-=2.1*vn*dx;MZ.vy-=2.1*vn*dy;}
          const out=MZ.vx*dx+MZ.vy*dy; if(out<3){MZ.vx+=dx*(3-out);MZ.vy+=dy*(3-out);}
          if(!MZ.hit[r+','+c]||MZ.hit[r+','+c]<0.5){tone(1320,0.12,'triangle',0.08,1760);vibrate(8);} MZ.hit[r+','+c]=0.7;}}
    }
    MZ.x=clamp(MZ.x,MZ_R,cols-MZ_R); MZ.y=clamp(MZ.y,MZ_R,rows-MZ_R);
    if(Math.hypot(MZ.x-MZ.gx,MZ.y-MZ.gy)<0.32){MZ.drop=0.0001;tone(880,0.3,'sine',0.15,220);break;}
  }
  MZ.knock-=dt; for(const k in MZ.hit) MZ.hit[k]-=dt;
}
function mzWin(){
  const p=P(), m=MAZES[MZ.i], first=!p.maze.solved.includes(m.id), G=MZ.geo, r=mzc.getBoundingClientRect();
  p.stats.mazes++; if(first) p.maze.solved.push(m.id);
  const all=first&&MAZES.every(q=>p.maze.solved.includes(q.id));
  SFX.happy(); earn(first?3:1,first?'New maze!':'',G?r.left+G.ox+MZ.gx*G.cs:null,G?r.top+G.oy+MZ.gy*G.cs:null);
  if(all) setTimeout(()=>earn(5,'Every maze!'),700);
  mzBar();
  const last=MZ.i===MAZES.length-1;
  modal(`⭐ ${esc(m.name)} done!`,`<div style="font-size:22px;text-align:center">+${first?3:1} 🪙${all?'<br>🏆 Every maze solved! +5 🪙':''}</div>`,
    [{text:'🔁 Again',cls:'ghost',on:()=>mzStart(MZ.i)},{text:last?'▶ Maze 1':'▶ Next',cls:'pink',on:()=>mzStart(last?0:MZ.i+1)}]);
}
function drawMaze(dt){
  const {ctx,W,H}=fit(mzc); ctx.clearRect(0,0,W,H);
  const m=MAZES[MZ.i].map, cols=m[0].length, rows=m.length, foot=document.body.classList.contains('easy')?8:30;
  const cs=Math.max(8,Math.min((W-24)/cols,(H-foot-22)/rows)), bw=cs*cols, bh=cs*rows, ox=(W-bw)/2, oy=Math.max(11,(H-foot-bh)/2);
  MZ.geo={cs,ox,oy,mx:ox+bw/2,my:oy+bh/2,short:Math.min(bw,bh)};
  if(!MZ.done&&!MZ.drop&&$('#modal').classList.contains('hidden')) mzStep(dt);
  if(MZ.drop){MZ.drop+=dt/0.5;MZ.x+=(MZ.gx-MZ.x)*0.3;MZ.y+=(MZ.gy-MZ.y)*0.3;if(MZ.drop>=1&&!MZ.done){MZ.done=true;mzWin();}}
  // board
  ctx.fillStyle='#5a3d7a'; rr(ctx,ox-10,oy-10,bw+20,bh+20,18); ctx.fill();
  ctx.fillStyle='#241a33'; rr(ctx,ox,oy,bw,bh,8); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.12)'; for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) if((r*7+c*3)%5===0) cStar(ctx,ox+(c+0.5)*cs,oy+(r+0.5)*cs,cs*0.08);
  const t=performance.now()/1000;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const ch=m[r][c], x=ox+c*cs, y=oy+r*cs;
    if(ch==='#'){ctx.fillStyle='#a97cff';rr(ctx,x+1,y+1,cs-2,cs-2,cs*0.18);ctx.fill();ctx.fillStyle='#c8adff';rr(ctx,x+1,y+1,cs-2,cs*0.32,cs*0.15);ctx.fill();}
    if(ch==='o'){const lit=(MZ.hit[r+','+c]||0)>0; ctx.fillStyle=lit?'#fff3c4':'#ffd166'; ctx.beginPath(); ctx.arc(x+cs/2,y+cs/2,cs*0.24*(lit?1.12:1),0,TAU); ctx.fill();
      ctx.strokeStyle='#c99a2e'; ctx.lineWidth=Math.max(2,cs*0.05); ctx.stroke(); ctx.fillStyle='#ff8cc6'; cStar(ctx,x+cs/2,y+cs/2,cs*0.11);}
    if(ch==='G'){const gl=0.5+0.5*Math.sin(t*3); ctx.fillStyle=`rgba(255,209,102,${0.18+0.2*gl})`; ctx.beginPath(); ctx.arc(x+cs/2,y+cs/2,cs*0.48,0,TAU); ctx.fill();
      ctx.fillStyle='#0d0914'; ctx.beginPath(); ctx.arc(x+cs/2,y+cs/2,cs*0.34,0,TAU); ctx.fill();
      ctx.strokeStyle='#ffd166'; ctx.lineWidth=Math.max(2,cs*0.06); ctx.stroke(); ctx.fillStyle='#ffd166'; cStar(ctx,x+cs/2,y+cs/2,cs*0.16);}
    if(ch==='S'){ctx.strokeStyle='rgba(143,240,208,.5)';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(x+cs/2,y+cs/2,cs*0.36,0,TAU);ctx.stroke();ctx.setLineDash([]);}
  }
  // finger: a soft ring where she is holding
  if(MZ.fing){ctx.strokeStyle='rgba(255,140,198,.6)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(MZ.fing.x,MZ.fing.y,22,0,TAU);ctx.stroke();}
  // marble
  const T=MARBLES[P().fid.marble]||MARBLES.pearl, sc=MZ.drop?Math.max(0.05,1-MZ.drop):1, bx=ox+MZ.x*cs, by=oy+MZ.y*cs, br=MZ_R*cs*sc;
  ctx.fillStyle='rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(bx+br*0.2,by+br*0.35,br,br*0.8,0,0,TAU); ctx.fill();
  const bg=ctx.createRadialGradient(bx-br*0.35,by-br*0.4,br*0.1,bx,by,br); bg.addColorStop(0,T.a); bg.addColorStop(1,T.b);
  ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(bx,by,br,0,TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(bx,by,br,0,TAU); ctx.clip(); ctx.translate(bx,by); ctx.rotate(MZ.roll);
  if(T.ball){ctx.fillStyle=T.sw;for(const [u,v] of [[0,0],[0.9,0.2],[-0.6,0.75],[-0.5,-0.85],[0.55,-0.8]]){ctx.beginPath();for(let k=0;k<5;k++){const a=k*TAU/5-Math.PI/2;ctx.lineTo(u*br+Math.cos(a)*br*0.3,v*br+Math.sin(a)*br*0.3);}ctx.fill();}}
  else{ctx.strokeStyle=T.sw;ctx.lineWidth=Math.max(2,br*0.22);ctx.beginPath();ctx.arc(0,0,br*0.55,0.2,2.4);ctx.stroke();ctx.beginPath();ctx.arc(0,0,br*0.55,3.3,5.5);ctx.stroke();
    if(T.stars){ctx.fillStyle='#fff';cStar(ctx,br*0.3,-br*0.1,br*0.16);cStar(ctx,-br*0.35,br*0.25,br*0.12);}}
  ctx.restore();
  ctx.fillStyle='rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(bx-br*0.35,by-br*0.4,br*0.28,br*0.18,-0.6,0,TAU); ctx.fill();
}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h);}
