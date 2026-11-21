'use strict';
/* =========================================================
   59. BALL FIELD (v1.60): baseball mini-games, opened from the Backyard's bat rack (data-hot="ballfield")
   One canvas (#bfCv), drawn by the main loop only while this screen is open (LOOP_SCREENS has 'ball').
   ⚾ Batting: an original pitcher throws 6 pitches; tap anywhere to swing. Timing is everything: right on time = a
   ⭐ home run, a little early = to the left, a little late = to the right, more than that = a foul, and then a miss.
   No strike-outs, no timer: each pitch starts when she taps, and every pitch is simply a hit or not (dots like Soccer).
   Pitchers: Easy = Pip (penguin), Medium = Rocco (raccoon), Hard = Hoot (owl). The pitches come from fixed lists
   (BAT_PITCHES), taken in turn, so practice pays off; bfJudge() holds the rules with no drawing (the smoke test uses it).
   The view is from behind home plate. Field points are (x across, z out to the fence = 1); bfG() turns them into
   screen points. The grass, the stands and the fence are drawn once into a hidden canvas (BF.bg) per screen size.
   Saved: ball{mode, bat{level, best{easy,medium,hard}, prizes[]}, …} and stats.hits / homers.
   Mode ids, level ids and prize keys (batBronze/batSilver/batGold, DECOR keys) are saved: never rename them.
   ========================================================= */
const BF_PITCHES=6, BF_PERFECT=5, BF_HOMER=2; // pitches a game, coins for 6/6, extra coins for a home run
// wind = seconds of wind-up; win = [home run, hit, foul] timing windows in seconds either side of "right on time".
const BAT_PITCHERS={
  easy:{name:'Pip',icon:'🐧',kind:'penguin',coins:1,wind:1.0,win:[0.07,0.16,0.24]},
  medium:{name:'Rocco',icon:'🦝',kind:'raccoon',coins:2,wind:0.85,win:[0.05,0.12,0.19]},
  hard:{name:'Hoot',icon:'🦉',kind:'owl',coins:3,wind:0.75,win:[0.04,0.1,0.16]}
};
const BF_EASY_WIN=1.4; // Easy mode (p.easy) makes every window this much wider
// [T seconds from the throw to the plate, kind (0 straight, 1 floater: slow then fast, 2 curve), x where it crosses (-1..1)].
// 18 per level = 3 games, taken in turn.
const BAT_PITCHES={
  easy:[[1.6,0,0],[1.6,0,0.2],[1.6,0,-0.2],[1.6,0,0],[1.6,0,0.2],[1.6,0,-0.2],[1.5,0,0],[1.5,0,-0.2],[1.5,0,0.2],
    [1.5,0,0],[1.5,0,0.2],[1.5,0,-0.2],[1.6,0,0.1],[1.5,0,-0.1],[1.6,0,0.2],[1.5,0,0],[1.6,0,-0.2],[1.5,0,0.1]],
  medium:[[1.3,0,0],[1.1,0,0.3],[1.4,1,-0.2],[1.0,0,-0.3],[1.25,0,0.2],[1.4,1,0],[1.05,0,0.3],[1.3,1,-0.3],[1.15,0,0],
    [1.0,0,-0.2],[1.35,1,0.2],[1.2,0,0.3],[1.1,0,-0.3],[1.4,1,0],[1.0,0,0.2],[1.3,0,-0.2],[1.2,1,0.3],[1.05,0,0]],
  hard:[[0.9,0,0],[1.2,1,0.3],[0.8,2,-0.3],[1.0,0,0.3],[0.75,0,-0.2],[1.15,1,0],[0.85,2,0.3],[0.8,0,-0.3],[1.2,1,0.2],
    [0.9,2,-0.2],[0.75,0,0.3],[1.1,1,-0.3],[0.85,0,0],[0.8,2,0.3],[1.2,1,-0.2],[0.75,0,0.2],[0.95,2,0],[1.0,1,0.3]]
};
// The ⚾ team kit: 2 of these on = +1 coin a hit (the Soccer Cleats count too)
const BF_KIT=[['acc','ballCap'],['top','ballTee'],['bottom','ballPants'],['legs','ballSocks'],['shoes','cleats']];
const hasBallKit=p=>BF_KIT.filter(([c,id])=>p.look[c]===id).length>=2;
const BATS={easy:'batBronze',medium:'batSilver',hard:'batGold'}; // a 6/6 wins that level's bat once (in the Backyard)
let BF={state:'off',res:[],pitch:null,t:0,time:0,d:null,swung:false,fly:null,cheer:-9,wait:0,round:{easy:0,medium:0,hard:0},
  bg:null,bgKey:'',lay:'',G:null};
const bfCv=$('#bfCv');
const bfP=()=>P()&&P().ball;
const bfLvl=()=>{const b=bfP();return b&&BAT_PITCHERS[b.bat.level]?b.bat.level:'easy';};
const bfPitcher=()=>BAT_PITCHERS[bfLvl()];

/* ---------- the rules (no drawing) ---------- */
// d = swing time minus the moment the ball reaches the plate (seconds; below 0 = early).
// Returns {res:'homer'|'hit'|'foul'|'miss', ang (-1.4 left .. 1.4 right), q (0..1, how well it was hit)}.
function bfJudge(lvl,d,easy){
  const w=(BAT_PITCHERS[lvl]||BAT_PITCHERS.easy).win.map(x=>x*(easy?BF_EASY_WIN:1)), a=Math.abs(d), sd=d<0?-1:1;
  if(a<=w[0]) return {res:'homer',ang:d/w[0]*0.25,q:1};
  if(a<=w[1]){const q=1-(a-w[0])/(w[1]-w[0]);return {res:'hit',ang:sd*(0.25+0.6*(1-q)),q};}
  if(a<=w[2]) return {res:'foul',ang:sd*(1.2+0.25*(a-w[1])/(w[2]-w[1])),q:0};
  return {res:'miss',ang:0,q:0};
}
const bfWin=()=>bfPitcher().win[2]*(P()&&P().easy?BF_EASY_WIN:1); // the latest a swing can still touch the ball

/* ---------- the screen ---------- */
function renderBall(){
  const p=P(); if(!p) return; const b=p.ball, lvl=bfLvl();
  $$('#bfTabs [data-mode]').forEach(t=>t.classList.toggle('on',t.dataset.mode===b.mode));
  $$('#bfTabs [data-lvl]').forEach(t=>{t.classList.toggle('on',t.dataset.lvl===lvl);t.querySelector('i').textContent=BAT_PITCHERS[t.dataset.lvl].icon;});
  $('#bfTitle').textContent='⚾ Batting';
  $('#bfKit').classList.toggle('hidden',!hasBallKit(p));
  $('#bfMascot').innerHTML=mascotSVG(p.look)+bfBatSVG();
  BF.lay=''; bfNewGame();
}
$('#bfTabs').onclick=e=>{const t=e.target.closest('[data-lvl],[data-mode]'); if(!t) return; const b=bfP(); if(!b) return;
  if(t.dataset.mode){if(b.mode===t.dataset.mode)return;b.mode=t.dataset.mode;} else {if(b.bat.level===t.dataset.lvl)return;b.bat.level=t.dataset.lvl;}
  save(); SFX.click(); renderBall();};
function bfStop(){BF.state='off';BF.fly=null;BF.pitch=null;}
function bfNewGame(){BF.res=[];BF.state='ready';BF.pitch=null;BF.fly=null;BF.swung=false;BF.wait=0;$('#bfMsg').classList.remove('on');bfScore();SFX.whistle();}
function bfScore(){
  const b=bfP(); if(!b) return; const L=bfPitcher();
  $('#bfScore').innerHTML=Array.from({length:BF_PITCHES},(_,i)=>{const r=BF.res[i];
    return `<span class="dot ${r===false?'miss':''} ${i===BF.res.length&&BF.state!=='done'?'now':''}">${r==='homer'?'⭐':r?'⚾':r===false?'✖':''}</span>`;}).join('')
    +`<span class="best">🏆 Best ${b.bat.best[bfLvl()]||0}/${BF_PITCHES}</span>`;
  $('#bfTip').textContent=BF.state==='done'?'Tap to play again!':BF.state==='ready'?`${L.icon} ${L.name} is pitching! Tap when you're ready, then tap again to swing ⚾`:'Swing when the ball reaches you! ⚾';
}
function bfSay(txt){const m=$('#bfMsg');m.textContent=txt;m.classList.remove('on');void m.offsetWidth;m.classList.add('on');}

// A tap: get the next pitch, swing, or start a new game.
function bfTap(){
  const p=P(); if(!p||cur!=='ball') return;
  if(BF.state==='done'){closeModal();bfNewGame();return;}
  if(BF.state==='ready'){
    const lvl=bfLvl(), list=BAT_PITCHES[lvl], [T,kind,x]=list[BF.round[lvl]%list.length]; BF.round[lvl]++;
    BF.pitch={T,kind,x}; BF.state='wind'; BF.t=0; BF.swung=false; BF.d=null; bfScore(); return;
  }
  if(BF.state==='pitch'&&!BF.swung) bfSwing();
}
function bfSwing(){
  const p=P(), s=BF.pitch; BF.swung=true;
  const m=$('#bfMascot'); m.classList.remove('swing'); void m.offsetWidth; m.classList.add('swing'); SFX.whoosh();
  const d=BF.t-s.T, j=bfJudge(bfLvl(),d,!!p.easy); BF.d=d;
  if(j.res==='miss') return; // the ball flies on into the catcher's mitt; bfStep() calls it when it gets there
  // contact: the ball flies off into the field
  const q=j.q, fly={res:j.res,ang:j.ang,q,t:0,hz:BF.G?BF.G.hz:0.1,x0:BF.G?s.x*BF.G.bw*0.3/BF.G.Wx:0,
    dur:j.res==='homer'?1.5:j.res==='hit'?0.6+0.5*q:0.8,
    zEnd:j.res==='homer'?1.4:j.res==='hit'?0.45+0.4*q:0.65,
    peak:j.res==='homer'?0.6:j.res==='hit'?0.1+0.22*q:0.3};
  BF.fly=fly; BF.state='hit'; vibrate(25);
  tone(1250,0.05,'square',0.12,600); noise(0.08,0.35,5000,1200); // the bat's crack
  if(j.res==='homer'){BF.cheer=BF.time;SFX.cheer();}
}
function bfResult(res){
  const p=P(), L=bfPitcher(), hit=res==='homer'||res==='hit';
  BF.res.push(hit?res:false); BF.state='result'; BF.wait=BF.time+1.4;
  if(hit){
    p.stats.hits++; if(res==='homer') p.stats.homers++;
    const pt=BF.fly&&BF.G?bfFlyPt(BF.G,BF.fly,Math.min(1,BF.fly.t/BF.fly.dur)):{x:0,y:0}, rc=bfCv.getBoundingClientRect();
    earn(L.coins+(res==='homer'?BF_HOMER:0)+(hasBallKit(p)?1:0),res==='homer'?'Home run!':'Hit!',rc.left+pt.x,rc.top+Math.max(40,pt.y));
    bfSay(res==='homer'?'HOME RUN! ⭐':BF.fly&&BF.fly.q>0.5?'Nice hit! ⚾':'Base hit! ⚾');
    if(res!=='homer'){SFX.happy();BF.cheer=BF.time;}
  } else {
    save();
    if(res==='foul'){SFX.post();bfSay(BF.d<0?'Foul ball! A bit early':'Foul ball! A bit late');}
    else if(BF.swung){SFX.save();bfSay(BF.d<0?'Too early! Wait for it':'Too late! Swing sooner');}
    else {SFX.save();bfSay('It went by! Tap to swing ⚾');}
  }
  bfScore();
}
function bfNext(){
  if(BF.res.length>=BF_PITCHES){bfEnd();return;}
  BF.state='ready'; BF.pitch=null; BF.fly=null; bfScore();
}
function giveBats(){ // a perfect 6/6 wins that level's bat once; it goes into the Backyard
  const p=P(); if(!p) return [];
  const won=Object.keys(BATS).filter(l=>(p.ball.bat.best[l]||0)>=BF_PITCHES&&!p.ball.bat.prizes.includes(l));
  won.forEach(l=>{const type=BATS[l];p.ball.bat.prizes.push(l);p.room3.items.push(Object.assign({uid:uid(),type,placed:true},spot(type)));});
  if(won.length) save();
  return won.map(l=>DECOR[BATS[l]].name);
}
function bfEnd(){
  const p=P(), lvl=bfLvl(), L=bfPitcher(), hits=BF.res.filter(Boolean).length, homers=BF.res.filter(r=>r==='homer').length;
  BF.state='done';
  const best=hits>(p.ball.bat.best[lvl]||0); if(best) p.ball.bat.best[lvl]=hits;
  if(hits===BF_PITCHES) earn(BF_PERFECT,'Perfect!'); else save();
  const bats=giveBats(); SFX.whistle(); bfScore(); if(bats.length) setTimeout(SFX.buy,400);
  const line=hits===BF_PITCHES?'PERFECT GAME! 🌟':hits>=4?'Great hitting! ✨':hits>=1?'Nice! Keep swinging 💪':`${L.name} was tricky! Try again? ${L.icon}`;
  const won=bats.map(n=>`<div style="margin-top:10px">You won the <b>${n}</b>! It's in your Backyard ⚾</div><svg viewBox="${DECOR[BATS[lvl]].box}" style="height:110px">${DECOR[BATS[lvl]].d()}</svg>`).join('');
  modal(`⚾ ${hits} / ${BF_PITCHES} hits!`,`<div style="text-align:center;font-size:18px">${line}${homers?`<br>${homers} home run${homers>1?'s':''}! ⭐`:''}${best&&hits?`<br>New best on ${lvl[0].toUpperCase()+lvl.slice(1)}! 🏆`:''}${won}</div>`,
    [{text:'⬅ Backyard',cls:'ghost',on:()=>show('room')},{text:'Play again',cls:'pink',on:()=>bfNewGame()}]);
  checkStickers();
}
bfCv.addEventListener('pointerdown',e=>{e.preventDefault();bfTap();});

/* ---------- where things are on screen ---------- */
const BF_D=0.25; // camera distance behind the plate (field units): smaller = more depth
const bfS=z=>BF_D/(Math.max(-0.2,z)+BF_D);
function bfGeo(W,H){
  const bw=Math.min(H*0.36*200/270,W*0.3), bh=bw*270/200; // the buddy (an SVG over the canvas)
  const g={W,H,cx:W/2,yH:H*0.2,py:H*0.9,Wx:W*0.9,Hp:H*0.7,rb:Math.min(W,H)*0.042,bw,bh,bl:W/2-bw*1.35,bb:H*0.03};
  g.handY=H-g.bb-bh+bh*186/270; // where the bat meets the ball
  g.hz=(g.py-g.handY)/g.Hp;
  return g;
}
// a field point (x across, z out, h up) on screen, with its size
function bfPt(g,x,z,h){const s=bfS(z),sx=Math.pow(s,0.6);return {x:g.cx+x*g.Wx*sx,y:g.yH+(g.py-g.yH)*s-(h||0)*g.Hp*s,gy:g.yH+(g.py-g.yH)*s,s};}
const BF_MOUND=0.3;
// the pitch: e = 0 at the throw, 1 at the plate (and on into the mitt)
function bfPitchPt(g,s,e){
  if(e>1){const c=bfPitchPt(g,s,1), k=e-1;return {x:c.x,y:c.y+k*g.H*0.25,gx:c.x,gy:c.gy+k*g.H*0.25,r:c.r*(1+k*0.6)};} // on into the catcher's mitt
  let k=e; if(s.kind===1) k=e-0.07*Math.sin(TAU*e); // a floater hangs, then hurries
  const z=BF_MOUND*(1-k), s0=bfS(BF_MOUND), sz=bfS(z), u=clamp((sz-s0)/(1-s0),0,1);
  const m=bfPt(g,0,BF_MOUND,0), rx=m.x+g.H*0.17*0.28, ry=m.gy-g.H*0.17*0.95; // the pitcher's hand
  const tx=g.cx+s.x*g.bw*0.3, ty=g.handY;
  let x=rx+(tx-rx)*u, y=ry+(ty-ry)*u;
  if(s.kind===2) x+=Math.sin(Math.PI*Math.min(1,e))*g.bw*0.45*(s.x<=0?1:-1); // a curve swings out, then back in
  return {x,y,gx:x,gy:bfPt(g,0,z,0).gy,r:g.rb*sz};
}
// the ball after it is hit
function bfFlyPt(g,f,e){
  const z=f.zEnd*e, h=f.hz*(1-e)+f.peak*4*e*(1-e), p=bfPt(g,(f.x0||0)*(1-e)+f.ang*z,z,Math.max(0,h));
  return {x:p.x,y:p.y,gx:p.x,gy:p.gy,r:g.rb*p.s};
}

/* ---------- drawing ---------- */
function bfBall(ctx,b,rot,a){
  ctx.globalAlpha=a==null?1:a;
  ctx.fillStyle='#00000030'; ctx.beginPath(); ctx.ellipse(b.gx,b.gy,b.r*1.1,b.r*0.35,0,0,TAU); ctx.fill();
  ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(rot||0);
  ctx.fillStyle='#fff'; ctx.strokeStyle='#5a4a6a'; ctx.lineWidth=Math.max(1,b.r*0.12);
  ctx.beginPath(); ctx.arc(0,0,b.r,0,TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='#ff5a6e'; ctx.lineWidth=Math.max(1,b.r*0.14);
  ctx.beginPath(); ctx.arc(-b.r*1.25,0,b.r*0.85,-0.7,0.7); ctx.stroke();
  ctx.beginPath(); ctx.arc(b.r*1.25,0,b.r*0.85,Math.PI-0.7,Math.PI+0.7); ctx.stroke();
  ctx.restore(); ctx.globalAlpha=1;
}
// the sky, the stands, the fence and the field, drawn once per screen size into BF.bg
function bfBack(g){
  const key=`${g.W}x${g.H}`; if(BF.bgKey===key&&BF.bg) return BF.bg;
  const d=Math.min(2,window.devicePixelRatio||1), c=document.createElement('canvas'); c.width=Math.max(1,Math.round(g.W*d)); c.height=Math.max(1,Math.round(g.H*d));
  const ctx=c.getContext('2d'); ctx.setTransform(d,0,0,d,0,0); const {W,H}=g;
  const fy=bfPt(g,0,1,0).gy, ft=fy-H*0.045, top=g.yH*0.75;
  const sky=ctx.createLinearGradient(0,0,0,top); sky.addColorStop(0,'#7fd0ff'); sky.addColorStop(1,'#e0f6ff'); ctx.fillStyle=sky; ctx.fillRect(0,0,W,top+1);
  ctx.fillStyle='#ffe066'; ctx.beginPath(); ctx.arc(W*0.88,top*0.45,Math.min(W,H)*0.04,0,TAU); ctx.fill();
  ctx.fillStyle='#ffffffdd'; [[0.2,0.4],[0.6,0.3]].forEach(([fx,fy2])=>{const cx=W*fx,cy=top*fy2,r=Math.min(W,H)*0.03;[[-1.2,0.3,1],[0,0,1.3],[1.2,0.3,0.9]].forEach(([ox,oy,k])=>{ctx.beginPath();ctx.arc(cx+ox*r,cy+oy*r,r*k,0,TAU);ctx.fill();});});
  ctx.fillStyle='#4a3d63'; ctx.fillRect(0,top,W,ft-top); // the stands (the crowd is drawn every frame)
  // the scoreboard, above the stands in the middle
  const sw=Math.min(W*0.3,200), sh=Math.max(34,top*0.6), sx=W/2-sw/2, sy=top-sh*0.5;
  BF.sb={x:sx,y:sy,w:sw,h:sh}; // drawn every frame by bfCrowd, in front of the crowd
  // the fence: green with a gold rail, a little star on each post
  ctx.fillStyle='#3f9e5c'; ctx.fillRect(0,ft,W,fy-ft); ctx.fillStyle='#ffd166'; ctx.fillRect(0,ft-3,W,6);
  ctx.strokeStyle='#2f7a45'; ctx.lineWidth=2; for(let x=W*0.04;x<W;x+=W*0.08){ctx.beginPath();ctx.moveTo(x,ft+3);ctx.lineTo(x,fy);ctx.stroke();}
  // the grass with mown stripes
  const gr=ctx.createLinearGradient(0,fy,0,H); gr.addColorStop(0,'#5cb85f'); gr.addColorStop(1,'#6fcf73'); ctx.fillStyle=gr; ctx.fillRect(0,fy,W,H-fy);
  ctx.fillStyle='#ffffff14'; for(let i=0;i<8;i+=2){const a=bfPt(g,0,1-i/8,0).gy,b=bfPt(g,0,1-(i+1)/8,0).gy;ctx.fillRect(0,a,W,b-a);}
  // the infield dirt: a band around the bases, then the grass inside it
  const poly=(pts,fill)=>{ctx.beginPath();pts.forEach(([x,z],i)=>{const q=bfPt(g,x,z,0);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();};
  poly([[0,-0.08],[0.46,0.32],[0,0.72],[-0.46,0.32]],'#e0a96d');
  poly([[0,0.07],[0.25,0.3],[0,0.53],[-0.25,0.3]],'#5cb85f');
  // the chalk lines out to the foul poles
  ctx.strokeStyle='#fff'; ctx.lineWidth=Math.max(2,H*0.005);
  [-1,1].forEach(sd=>{const a=bfPt(g,0,0,0),b=bfPt(g,sd*1,1,0);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    ctx.fillStyle='#ffd166';ctx.fillRect(b.x-3,b.y-H*0.12,6,H*0.12);});
  // the bases and the mound
  [[0.3,0.3],[0,0.6],[-0.3,0.3]].forEach(([x,z])=>{const q=bfPt(g,x,z,0),r=g.rb*q.s*1.3;ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(q.x,q.y-r*0.5);ctx.lineTo(q.x+r,q.y);ctx.lineTo(q.x,q.y+r*0.5);ctx.lineTo(q.x-r,q.y);ctx.closePath();ctx.fill();});
  const m=bfPt(g,0,BF_MOUND,0); ctx.fillStyle='#d6955a'; ctx.beginPath(); ctx.ellipse(m.x,m.y,g.W*0.07*Math.pow(m.s,0.6)*1.6,g.H*0.022,0,0,TAU); ctx.fill();
  ctx.fillStyle='#fff'; ctx.fillRect(m.x-g.rb*0.5,m.y-2,g.rb,4);
  // home plate, with the batter's boxes
  const hp=bfPt(g,0,0,0), pw=g.rb*1.4; ctx.fillStyle='#fff'; ctx.strokeStyle='#2b2235'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(hp.x-pw,hp.y-pw*0.25); ctx.lineTo(hp.x+pw,hp.y-pw*0.25); ctx.lineTo(hp.x+pw,hp.y+pw*0.15); ctx.lineTo(hp.x,hp.y+pw*0.45); ctx.lineTo(hp.x-pw,hp.y+pw*0.15); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle='#ffffffbb'; ctx.lineWidth=2; [-1,1].forEach(sd=>{ctx.strokeRect(hp.x+sd*pw*1.4-(sd<0?pw*2.2:0),hp.y-pw*0.9,pw*2.2,pw*1.8);});
  BF.bg=c; BF.bgKey=key; return c;
}
function bfCrowd(ctx,g,cheering){
  const fy=bfPt(g,0,1,0).gy, ft=fy-g.H*0.045, top=g.yH*0.75, cr=(ft-top)/7, cols=['#ff8cc6','#a97cff','#8ff0d0','#ffd166','#4dabf7','#ff6b8a'];
  for(let row=0;row<3;row++) for(let i=0,x=cr*(row%2?2.2:1.2);x<g.W;i++,x+=cr*2.4){
    const jump=cheering?Math.abs(Math.sin(BF.time*12+i*1.7))*cr*0.8:0;
    ctx.fillStyle=cols[(i*7+row*3)%cols.length]; ctx.beginPath(); ctx.arc(x,top+cr*(1.4+row*2)-jump,cr*0.85,0,TAU); ctx.fill();}
  // the scoreboard's lights: HITS and the pitch number
  const s=BF.sb; if(!s) return;
  ctx.fillStyle='#2f5d50'; ctx.strokeStyle='#2b2235'; ctx.lineWidth=3; ctx.beginPath(); if(ctx.roundRect)ctx.roundRect(s.x,s.y,s.w,s.h,8); else ctx.rect(s.x,s.y,s.w,s.h); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#ffe9a8'; ctx.font=`900 ${Math.round(s.h*0.3)}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
  const hits=BF.res.filter(Boolean).length;
  ctx.fillText(BF.state==='hit'&&BF.fly&&BF.fly.res==='homer'||BF.res[BF.res.length-1]==='homer'&&BF.state==='result'?'⭐ HOME RUN ⭐':`HITS ${hits}`,s.x+s.w/2,s.y+s.h*0.36);
  ctx.font=`800 ${Math.round(s.h*0.2)}px sans-serif`; ctx.fillStyle='#c8f7e8';
  ctx.fillText(`PITCH ${Math.min(BF_PITCHES,BF.res.length+(BF.state==='ready'||BF.state==='done'?0:1))||1} / ${BF_PITCHES}`,s.x+s.w/2,s.y+s.h*0.74);
  ctx.textAlign='start'; ctx.textBaseline='alphabetic';
}
// The three pitchers, drawn in a 100-tall box with (0,0) at their feet (kC / kE / kFace from section 13).
// arm: the throwing arm's angle (radians, 0 = pointing right, -PI/2 = straight up); ball: draw the ball in that hand.
function bfDrawPitcher(ctx,kind,x,y,s,arm,ball,time){
  ctx.save(); ctx.translate(x,y); ctx.scale(s/100,s/100); ctx.lineJoin='round'; ctx.lineCap='round'; ctx.lineWidth=4; ctx.strokeStyle='#3b2f52';
  const bob=Math.sin(time*2.4)*1.5, sh=[24,-60+bob], hand=[sh[0]+Math.cos(arm)*38,sh[1]+Math.sin(arm)*38];
  const limb=(x1,y1,x2,y2,c,w)=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineWidth=w+6;ctx.strokeStyle='#3b2f52';ctx.stroke();ctx.lineWidth=w;ctx.strokeStyle=c;ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle='#3b2f52';};
  const cap=(cy,c,dark)=>{ctx.beginPath();ctx.moveTo(-30,cy);ctx.quadraticCurveTo(-30,cy-34,0,cy-34);ctx.quadraticCurveTo(30,cy-34,30,cy);ctx.closePath();ctx.fillStyle=c;ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,cy+2,36,7,0,0,TAU);ctx.fillStyle=dark;ctx.fill();ctx.stroke();kC(ctx,0,cy-34,4,dark);};
  let fur,glove;
  if(kind==='penguin'){ // Pip: a round little penguin in a pink cap
    fur='#2e3350'; glove='#ff8cc6';
    kE(ctx,-13,-3,12,6,'#ffb347'); kE(ctx,13,-3,12,6,'#ffb347');
    limb(-24,-56+bob,-38,-34+bob,fur,10); kC(ctx,-38,-34+bob,11,glove); // the glove hand
    kE(ctx,0,-48+bob,32,46,fur); kE(ctx,0,-40+bob,22,34,'#fbf7ff',false);
    ctx.lineWidth=3; kFace(ctx,-70+bob,true); ctx.fillStyle='#ffb347'; ctx.beginPath(); ctx.moveTo(-6,-62+bob); ctx.lineTo(6,-62+bob); ctx.lineTo(0,-54+bob); ctx.closePath(); ctx.fill(); ctx.stroke();
    cap(-84+bob,'#ff8cc6','#c8578f');
  } else if(kind==='raccoon'){ // Rocco: a raccoon with a striped tail and a mint cap
    fur='#a3a3b5'; glove='#8ff0d0';
    ctx.save(); ctx.translate(-20,-20); ctx.rotate(-0.5+Math.sin(time*3)*0.12);
    [0,1,2,3].forEach(i=>{kE(ctx,-10-i*9,-8-i*7,10,9,i%2?'#4a4458':'#c9c9d6');}); ctx.restore();
    kE(ctx,-13,-4,11,6,'#4a4458'); kE(ctx,13,-4,11,6,'#4a4458');
    limb(-22,-56+bob,-38,-36+bob,fur,10); kC(ctx,-38,-36+bob,11,glove);
    kE(ctx,0,-36+bob,28,30,fur); kE(ctx,0,-32+bob,18,20,'#e6e6ee',false);
    [-1,1].forEach(sd=>{ctx.beginPath();ctx.moveTo(sd*30,-86+bob);ctx.lineTo(sd*24,-108+bob);ctx.lineTo(sd*10,-96+bob);ctx.closePath();ctx.fillStyle=fur;ctx.fill();ctx.stroke();});
    kC(ctx,0,-78+bob,30,fur); kE(ctx,0,-80+bob,26,9,'#3b3448',false);
    [-11,11].forEach(xx=>{kC(ctx,xx,-80+bob,5.5,'#fff');kE(ctx,xx+1,-80+bob,3,3.5,'#1a1422',false);});
    kE(ctx,0,-64+bob,12,8,'#e6e6ee',false); kE(ctx,0,-68+bob,4,3,'#2a1f33',false);
    cap(-96+bob,'#8ff0d0','#3a9c7e');
  } else { // Hoot: a fluffy purple owl with big eyes and a gold cap
    fur='#8a6fb3'; glove='#ffd166';
    kE(ctx,-12,-3,10,5,'#ffb347'); kE(ctx,12,-3,10,5,'#ffb347');
    limb(-26,-56+bob,-40,-34+bob,fur,12); kC(ctx,-40,-34+bob,11,glove);
    kE(ctx,0,-50+bob,34,48,fur); kE(ctx,0,-40+bob,22,30,'#c9b3ff',false);
    ctx.strokeStyle='#8d68dc'; ctx.lineWidth=2.5; [[-8,-44],[8,-44],[0,-34],[-8,-24],[8,-24]].forEach(([xx,yy])=>{ctx.beginPath();ctx.arc(xx,yy+bob,4,0.2,Math.PI-0.2);ctx.stroke();}); ctx.strokeStyle='#3b2f52'; ctx.lineWidth=4;
    [-1,1].forEach(sd=>{ctx.beginPath();ctx.moveTo(sd*30,-84+bob);ctx.lineTo(sd*34,-106+bob);ctx.lineTo(sd*16,-92+bob);ctx.closePath();ctx.fillStyle=fur;ctx.fill();ctx.stroke();});
    [-13,13].forEach(xx=>{kC(ctx,xx,-72+bob,12,'#fff');kC(ctx,xx+1,-71+bob,6,'#2a1f33');kC(ctx,xx+3,-74+bob,2,'#fff');});
    ctx.fillStyle='#ffb347'; ctx.beginPath(); ctx.moveTo(-5,-62+bob); ctx.lineTo(5,-62+bob); ctx.lineTo(0,-52+bob); ctx.closePath(); ctx.fill(); ctx.stroke();
    cap(-92+bob,'#ffd166','#c99a2e');
  }
  limb(sh[0],sh[1],hand[0],hand[1],fur,10); kC(ctx,hand[0],hand[1],8,fur);
  if(ball){ctx.lineWidth=2;kC(ctx,hand[0]+4,hand[1]-3,7,'#fff');}
  ctx.restore();
}
// the throwing arm through the wind-up (0..1): down, back over the head, then a whip forward
function bfArm(w){
  if(w<=0) return 1.2;
  if(w<0.6){const k=w/0.6;return 1.2+(-2.6-1.2)*k*k;}
  const k=Math.min(1,(w-0.6)/0.4); return -2.6+3.8*k;
}
// the bat in her hand: an SVG over the buddy (it turns with a CSS animation when she swings)
function bfBatSVG(){
  return `<svg class="bf-bat" viewBox="0 0 200 270" xmlns="http://www.w3.org/2000/svg"><g class="bf-batG">`
    +`<path d="M162 188 L176 66 Q178 46 192 48 Q204 50 200 70 L170 190Z" fill="#e8b97a" stroke="#5a3a1e" stroke-width="4" stroke-linejoin="round"/>`
    +`<path d="M184 60 L176 120" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>`
    +`<rect x="158" y="176" width="16" height="22" rx="5" fill="#ff8cc6" stroke="#5a3a1e" stroke-width="3"/></g></svg>`;
}

function drawBallField(dt){
  const {ctx,W,H}=fit(bfCv), g=bfGeo(W,H), L=bfPitcher(); BF.G=g; BF.time+=dt;
  const lay=`${Math.round(g.bw)},${Math.round(g.bl)},${Math.round(g.bb)}`;
  if(BF.lay!==lay){BF.lay=lay;const m=$('#bfMascot');m.style.width=g.bw+'px';m.style.height=g.bh+'px';m.style.left=g.bl+'px';m.style.bottom=g.bb+'px';}
  // move things on
  const s=BF.pitch;
  if(BF.state==='wind'){BF.t+=dt;if(BF.t>=L.wind){BF.state='pitch';BF.t=0;SFX.kick();}}
  else if(BF.state==='pitch'){BF.t+=dt;
    if(BF.t>s.T+bfWin()+0.05&&BF.t>s.T+0.35){bfResult('miss');tone(140,0.12,'sine',0.35,80);}} // into the catcher's mitt
  else if(BF.state==='hit'){const f=BF.fly;f.t+=dt;
    if(f.t>=f.dur&&!f.done){f.done=1;bfResult(f.res);}}
  else if(BF.state==='result'){if(BF.fly)BF.fly.t+=dt;if(BF.pitch&&!BF.fly)BF.t+=dt;if(BF.time>=BF.wait)bfNext();}
  // draw
  ctx.drawImage(bfBack(g),0,0,W,H);
  bfCrowd(ctx,g,BF.time-BF.cheer<1.6);
  const m=bfPt(g,0,BF_MOUND,0), ps=g.H*0.17*Math.pow(m.s,0.3);
  const w=BF.state==='wind'?BF.t/L.wind:BF.state==='pitch'&&BF.t<0.4?1:-1, arm=w<0?1.2:bfArm(w);
  ctx.fillStyle='#00000030'; ctx.beginPath(); ctx.ellipse(m.x,m.gy,ps*0.4,ps*0.08,0,0,TAU); ctx.fill();
  bfDrawPitcher(ctx,L.kind,m.x,m.gy,ps,arm,BF.state==='ready'||BF.state==='done'||BF.state==='wind',BF.time);
  // where the ball will come: a soft ring by her bat (it glows when it's time to swing on Easy and in Easy mode)
  const tx=s?g.cx+s.x*g.bw*0.3:g.cx;
  if(BF.state!=='hit'){
    const p=P(), now=s&&BF.state==='pitch'&&Math.abs(BF.t-s.T)<=bfPitcher().win[1]*(p&&p.easy?BF_EASY_WIN:1), help=bfLvl()==='easy'||(p&&p.easy);
    ctx.strokeStyle=now&&help?'#ffd166':'#ffffff88'; ctx.lineWidth=now&&help?5:3; ctx.setLineDash(now&&help?[]:[6,6]);
    ctx.beginPath(); ctx.arc(tx,g.handY,g.rb*(now&&help?1.9:1.5),0,TAU); ctx.stroke(); ctx.setLineDash([]);
    if(now&&help){ctx.font=`900 ${Math.round(g.rb*1.1)}px sans-serif`;ctx.lineWidth=5;ctx.strokeStyle='#2b2235';ctx.fillStyle='#fff';const lx=tx+g.rb*2.2,ly=g.handY-g.rb*1.6; // to the right: the buddy stands on the left
      ctx.strokeText('Swing now!',lx,ly);ctx.fillText('Swing now!',lx,ly);}
  }
  // the ball
  if(BF.fly){const f=BF.fly, e=Math.min(1,f.t/f.dur);
    if(f.res==='homer'&&e>0.7) bfSparks(ctx,g,f,e);
    bfBall(ctx,bfFlyPt(g,f,e),f.t*14,f.res==='foul'||f.res==='homer'?1-Math.max(0,(f.t-f.dur)*2):1);}
  else if(s&&(BF.state==='pitch'||BF.state==='result')){const e=BF.t/s.T;
    if(e<1.6) bfBall(ctx,bfPitchPt(g,s,e),BF.t*10,e>1.2?Math.max(0,1-(e-1.2)*2.5):1);}
}
function bfSparks(ctx,g,f,e){ // little stars over the fence after a home run
  const p=bfFlyPt(g,f,e), k=(e-0.7)/0.3;
  ctx.fillStyle='#ffd166'; for(let i=0;i<8;i++){const a=i*TAU/8, r=g.rb*(1+k*3);
    ctx.beginPath(); ctx.arc(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,g.rb*0.25*(1-k*0.5),0,TAU); ctx.fill();}
}

/* ---------- bat prizes (awards: never in the Shop) and stickers ---------- */
function bfBatArt(main,light,dark,label){
  const o='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"';
  return `<ellipse cx="0" cy="-2" rx="44" ry="7" fill="#00000030"/>`
    +`<rect x="-38" y="-26" width="76" height="26" rx="5" fill="#5b3a99" ${o}/><rect x="-28" y="-20" width="56" height="13" rx="3" fill="${light}"/>`
    +`<text x="0" y="-9.5" text-anchor="middle" font-size="10" font-weight="900" fill="${dark}">${label}</text>`
    +`<path d="M-26 -30 L-4 -150 Q0 -166 12 -162 Q22 -156 18 -142 L-16 -28Z" fill="${main}" ${o}/>`
    +`<path d="M4 -146 L-8 -80" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/>`
    +`<rect x="-30" y="-46" width="16" height="20" rx="4" fill="${light}" ${o} transform="rotate(12 -22 -36)"/>`
    +`<circle cx="22" cy="-40" r="14" fill="#fff" ${o}/><path d="M12 -48 Q18 -40 12 -32 M32 -48 Q26 -40 32 -32" stroke="#ff5a6e" stroke-width="2.5" fill="none"/>`;
}
Object.assign(DECOR,{
  batBronze:{name:'Bronze Bat',price:0,award:1,box:'-60 -175 120 185',d:()=>bfBatArt('#cd7f32','#f2b77c','#7a4518','EASY')},
  batSilver:{name:'Silver Bat',price:0,award:1,box:'-60 -175 120 185',d:()=>bfBatArt('#b9c2cf','#f1f5fa','#5d6675','MEDIUM')},
  batGold:{name:'Gold Bat',price:0,award:1,box:'-60 -175 120 185',d:()=>bfBatArt('#ffc83d','#fff1b8','#a8730f','HARD')}
});
// In the Backyard, by the bat rack and along the front (clear of the gloves, the pots, the pet, the gifts and a visitor)
Object.assign(TROPHY_SPOTS,{batBronze:{x:150,y:650},batSilver:{x:690,y:640},batGold:{x:955,y:640}});
STICKERS.push(
  stk('hit1','soccer','⚾','First Hit','circle','Hit a pitch on the ⚾ Ball Field',1,p=>p.stats.hits,1),
  stk('homer1','soccer','⭐','Home Run!','star','Hit a home run',1,p=>p.stats.homers,2),
  stk('batPerfect','soccer','🏟️','Perfect Game','scallop','Hit all 6 pitches in a game',1,p=>Math.max(0,...Object.values(p.ball.bat.best))>=BF_PITCHES?1:0)
);
