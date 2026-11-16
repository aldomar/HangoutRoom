'use strict';
/* =========================================================
   27. BE THE KEEPER (v1.24): the Soccer Field's 🧤 Keep mode
   Her own buddy stands in goal and an original striker takes 5 shots: Easy = Hop (a bouncy frog), Medium = Bolt
   (a robot), Hard = Zip (a speedy fox). Tap a spot in the goal (or swipe) and the buddy dives there; on Easy the
   shots are slow and glowing, and tapping the ball itself catches it, so a 3-year-old can play. Nothing is lost
   on a goal. The shots come from fixed lists (KEEP_SHOTS), taken in turn, so practice pays off.
   Drawn on the Soccer canvas by drawKeep(), called from drawSoccer() (main loop, only while Soccer is open);
   no timers: leaving the screen simply stops the match. The buddy is turned into a picture once (kpArt), so the
   fuzzy SVG filter isn't redrawn every frame.
   Saved: soccer.mode ('kick'|'keep'), soccer.keep{level, best{easy,medium,hard}, gloves[]} and stats.saves.
   Level ids and glove ids (gloveBronze/gloveSilver/gloveGold, DECOR keys) are saved: never rename them.
   ========================================================= */
// wind = run-up seconds; T = seconds the ball flies; reach = half-width the buddy covers (goal widths);
// ballTap = tapping the ball catches it; hint = an arrow shows where the shot goes; redive = can change the dive.
const STRIKERS={
  easy:{name:'Hop',icon:'🐸',kind:'frog',coins:1,wind:1.3,T:2.4,reach:0.24,ballTap:1,redive:1},
  medium:{name:'Bolt',icon:'🤖',kind:'robot',coins:2,wind:1.1,T:1.35,reach:0.21,hint:1},
  hard:{name:'Zip',icon:'🦊',kind:'fox',coins:3,wind:0.9,T:0.95,reach:0.2}
};
// [u across the goal, v height, curve, fake]. 15 per level = 3 matches, taken in turn. fake = Zip leans the wrong way.
const KEEP_SHOTS={
  easy:[[-0.3,0.25,0],[0.3,0.3,0],[0,0.4,0],[-0.25,0.6,0],[0.28,0.2,0],[0.3,0.55,0],[-0.32,0.3,0],[0.15,0.25,0],
    [-0.1,0.5,0],[0.25,0.65,0],[-0.28,0.2,0],[0.32,0.35,0],[-0.2,0.55,0],[0.05,0.3,0],[0.3,0.25,0]],
  medium:[[-0.36,0.3,0],[0.35,0.6,0],[-0.3,0.7,0.15],[0.38,0.2,0],[0.12,0.78,0],[0.36,0.35,-0.15],[-0.38,0.55,0],[0,0.2,0],
    [-0.34,0.25,0.15],[0.32,0.7,0],[0.38,0.4,0],[-0.2,0.78,0],[-0.38,0.3,-0.1],[0.3,0.25,0.15],[-0.36,0.6,0]],
  hard:[[0.4,0.78,0,0],[-0.4,0.2,0.2,1],[0.38,0.25,-0.2,0],[-0.38,0.8,0,0],[0.4,0.5,0,1],[-0.4,0.5,0.25,0],[0.12,0.92,0,0],
    [0.4,0.2,0,1],[-0.4,0.7,-0.2,0],[0.38,0.8,0.2,0],[-0.38,0.25,0,1],[0.4,0.6,-0.25,0],[-0.15,0.15,0,0],[-0.4,0.82,0,1],[0.38,0.3,0.2,0]]
};
const KEEP_KICKS=5, KEEP_H2=0.7, KEEP_SPEED=2.4; // KEEP_H2 = how tall the buddy covers (goal heights); speed in goal widths/s
const GLOVES={easy:'gloveBronze',medium:'gloveSilver',hard:'gloveGold'};
let KP={state:'off',saves:[],shot:null,next:null,t:0,timer:0,time:0,k:{x:0,lift:0,tilt:0},tgt:null,dives:0,swipe:null,g:null,cheer:-9,
  round:{easy:0,medium:0,hard:0},img:null,imgKey:''};
const kpLevel=()=>STRIKERS[P().soccer.keep.level]||STRIKERS.easy;

/* ---------- the buddy in goal: drawn once into a small canvas (with keeper gloves) ---------- */
function kpArt(p){
  const key=JSON.stringify(p.look); if(KP.imgKey===key&&KP.img) return; KP.imgKey=key; KP.img=null;
  const svg=mascotSVG(p.look,null,'width="200" height="270"').replace('>',`><defs>${$('#gdefs').innerHTML}</defs>`);
  const img=new Image();
  img.onload=()=>{if(KP.imgKey!==key)return;const c=document.createElement('canvas');c.width=300;c.height=405;const x=c.getContext('2d');
    x.drawImage(img,0,0,300,405); x.lineWidth=5; x.strokeStyle='#3b2f52';
    [[50,280],[250,280]].forEach(([gx,gy])=>{x.beginPath();x.arc(gx,gy,22,0,TAU);x.fillStyle='#8ff0d0';x.fill();x.stroke();
      x.beginPath();x.moveTo(gx-14,gy-6);x.lineTo(gx+14,gy-6);x.stroke();});
    KP.img=c;};
  img.onerror=()=>{if(KP.imgKey===key)KP.img='none';};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function drawBuddyKeeper(ctx,g,k){
  const h=g.GH*0.92, w=h*200/270, x=g.cx+k.x*g.GW, y=g.gy-k.lift*g.GH;
  ctx.fillStyle='#00000030'; ctx.beginPath(); ctx.ellipse(x,g.gy,w*0.32,w*0.08,0,0,TAU); ctx.fill();
  ctx.save(); ctx.translate(x,y); ctx.rotate(k.tilt);
  if(KP.img&&KP.img!=='none') ctx.drawImage(KP.img,-w/2,-h*242/270,w,h);
  else { // a simple stand-in while the picture loads (or if it can't)
    const f=(FUR[P().look.fur]||FUR.white).c; ctx.strokeStyle='#3b2f52'; ctx.lineWidth=3;
    kE(ctx,0,-h*0.25,w*0.22,h*0.22,f); kC(ctx,0,-h*0.58,w*0.28,f); kC(ctx,-w*0.3,-h*0.3,w*0.08,'#8ff0d0'); kC(ctx,w*0.3,-h*0.3,w*0.08,'#8ff0d0');
  }
  ctx.restore();
}

/* ---------- the three strikers, seen from behind, in a 100-tall box with (0,0) at their feet ---------- */
function kpRR(ctx,x,y,w,h,r,f){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fillStyle=f;ctx.fill();ctx.stroke();}
function kpNum(ctx,n,x,y,col){ctx.font='900 24px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=5;ctx.strokeText(n,x,y);ctx.fillStyle=col||'#fff';ctx.fillText(n,x,y);ctx.lineWidth=4;}
function drawStriker(ctx,kind,x,y,s,lean,kick,time){
  ctx.save(); ctx.translate(x,y); ctx.scale(s/100,s/100); ctx.rotate(lean);
  ctx.lineJoin='round'; ctx.lineCap='round'; ctx.lineWidth=4; ctx.strokeStyle='#3b2f52';
  const leg=(lx,ang,len,w,col)=>{ctx.save();ctx.translate(lx,-24);ctx.rotate(ang);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,len);
    ctx.lineWidth=w+8;ctx.strokeStyle='#3b2f52';ctx.stroke();ctx.lineWidth=w;ctx.strokeStyle=col;ctx.stroke();ctx.restore();ctx.lineWidth=4;ctx.strokeStyle='#3b2f52';};
  if(kind==='frog'){ // Hop: a bouncy green frog in a pink jersey
    ctx.translate(0,-Math.abs(Math.sin(time*5))*10*(1-kick));
    [-1,1].forEach(sd=>{kE(ctx,sd*30,-14+(sd>0?-kick*14:0),18,13,'#5cbf4a');kE(ctx,sd*42,-3+(sd>0?-kick*14:0),17,6,'#5cbf4a');});
    kE(ctx,0,-46,38,36,'#7ed957');
    ctx.beginPath();ctx.moveTo(-35,-60);ctx.quadraticCurveTo(0,-72,35,-60);ctx.lineTo(31,-24);ctx.quadraticCurveTo(0,-15,-31,-24);ctx.closePath();ctx.fillStyle='#ff8cc6';ctx.fill();ctx.stroke();
    kpNum(ctx,'1',0,-42);
    [-1,1].forEach(sd=>kC(ctx,sd*19,-82,14,'#7ed957'));
    ctx.fillStyle='#4fa83d';[[-24,-86],[16,-88],[-8,-52]].forEach(([a,b])=>{ctx.beginPath();ctx.arc(a,b,3.5,0,TAU);ctx.fill();});
  } else if(kind==='robot'){ // Bolt: a friendly blue-grey robot with a blinking antenna
    leg(-13,0,24,12,'#7d8ea3'); leg(13,-kick*0.9,24,12,'#7d8ea3');
    [-1,1].forEach(sd=>{ctx.beginPath();ctx.moveTo(sd*32,-70);ctx.lineTo(sd*46,-42);ctx.lineWidth=14;ctx.stroke();ctx.lineWidth=7;ctx.strokeStyle='#9fb4c8';ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle='#3b2f52';kC(ctx,sd*46,-40,7,'#ffd166');});
    kpRR(ctx,-34,-80,68,56,12,'#a9bdd2');
    kpRR(ctx,-20,-72,40,34,6,'#5b6b80');
    ['#ff8cc6','#8ff0d0','#ffd166'].forEach((c,i)=>{ctx.globalAlpha=(Math.floor(time*3)%3===i)?1:0.35;ctx.fillStyle=c;ctx.beginPath();ctx.arc(-11+i*11,-64,4.5,0,TAU);ctx.fill();});
    ctx.globalAlpha=1; kpNum(ctx,'2',0,-47,'#8ff0d0');
    kpRR(ctx,-26,-114,52,32,10,'#c4d4e4');
    ctx.beginPath();ctx.moveTo(0,-114);ctx.lineTo(0,-128);ctx.stroke();
    ctx.globalAlpha=0.55+0.45*Math.sin(time*6);kC(ctx,0,-131,6,'#ff8cc6');ctx.globalAlpha=1;
    [-1,1].forEach(sd=>kpRR(ctx,sd>0?26:-32,-104,6,14,2,'#7d8ea3'));
  } else { // Zip: a speedy orange fox with a mint scarf and a big swishy tail
    leg(-12,0,24,10,'#5a3a2a'); leg(12,-kick*0.9,24,10,'#5a3a2a');
    kE(ctx,0,-48,30,30,'#ff9a3c');
    ctx.beginPath();ctx.moveTo(-28,-58);ctx.quadraticCurveTo(0,-68,28,-58);ctx.lineTo(25,-28);ctx.quadraticCurveTo(0,-20,-25,-28);ctx.closePath();ctx.fillStyle='#a97cff';ctx.fill();ctx.stroke();
    kpNum(ctx,'3',0,-44);
    kE(ctx,0,-70,27,7,'#8ff0d0');
    [-1,1].forEach(sd=>{ctx.beginPath();ctx.moveTo(sd*8,-104);ctx.lineTo(sd*22,-128);ctx.lineTo(sd*26,-96);ctx.closePath();ctx.fillStyle='#ff9a3c';ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(sd*18,-122);ctx.lineTo(sd*22,-128);ctx.lineTo(sd*24,-118);ctx.closePath();ctx.fillStyle='#3b2f52';ctx.fill();});
    kC(ctx,0,-90,25,'#ff9a3c');
    const sw=Math.sin(time*(kick?14:4))*0.18; ctx.save(); ctx.translate(10,-26); ctx.rotate(sw);
    ctx.beginPath();ctx.moveTo(-8,0);ctx.quadraticCurveTo(30,14,46,-14);ctx.quadraticCurveTo(58,-40,44,-58);ctx.quadraticCurveTo(24,-30,4,-10);ctx.closePath();ctx.fillStyle='#ff9a3c';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(44,-58);ctx.quadraticCurveTo(58,-40,50,-26);ctx.quadraticCurveTo(44,-38,36,-46);ctx.closePath();ctx.fillStyle='#fff';ctx.fill();ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/* ---------- a match: ready -> run-up (wind) -> fly -> result, 5 times -> done ---------- */
function kpRender(){
  const p=P(); if(!p) return; kpArt(p); kpNewMatch(); SFX.whistle();
}
function kpStop(){KP.state='off';KP.swipe=null;}
function kpNewMatch(){KP.saves=[];$('#socMsg').classList.remove('on');kpNextShot();}
function kpNextShot(){
  const lvl=P().soccer.keep.level, list=KEEP_SHOTS[lvl]||KEEP_SHOTS.easy;
  const sh=list[(KP.round[lvl]*KEEP_KICKS+KP.saves.length)%list.length];
  KP.next={u:sh[0],v:sh[1],curve:sh[2]||0,fake:!!sh[3]}; KP.shot=null; KP.state='ready'; KP.timer=0; KP.t=0;
  KP.tgt=null; KP.dives=0; KP.swipe=null; renderKpScore();
}
function renderKpScore(){
  const p=P(); if(!p) return; const L=kpLevel();
  $('#socScore').innerHTML=Array.from({length:KEEP_KICKS},(_,i)=>{const k=KP.saves[i];
    return `<span class="dot ${k===false?'miss':''} ${i===KP.saves.length&&KP.state!=='done'?'now':''}">${k?'🧤':k===false?'⚽':''}</span>`;}).join('')
    +`<span class="best">🏆 Best ${p.soccer.keep.best[p.soccer.keep.level]||0}/${KEEP_KICKS}</span>`;
  $('#socTip').textContent=KP.state==='done'?'Tap to play again!':L.ballTap?`${L.icon} ${L.name} is shooting! Tap the ball to catch it!`
    :`${L.icon} ${L.name} is shooting! Tap where the ball goes, or swipe to dive.`;
}
// Dive toward a spot in the goal (u across, v up). Easy can change its mind; Medium and Hard dive once per shot.
function kpDive(u,v){
  const L=kpLevel(); if(!['ready','wind','fly'].includes(KP.state)) return false;
  if(KP.state==='ready'&&!L.redive) return false;
  if(KP.dives&&!L.redive) return false;
  u=clamp(u,-0.42,0.42);
  KP.tgt={x:u,lift:clamp(v-0.5,0,0.35),tilt:Math.abs(u)>0.12?Math.sign(u)*Math.min(1,Math.abs(u)/0.32)*0.85:0};
  KP.dives++; vibrate(12); return true;
}
function kpKick(){
  const L=kpLevel(), n=KP.next;
  KP.shot={u:n.u,v:n.v,curve:n.curve,T:L.T,res:null}; KP.state='fly'; KP.t=0; KP.timer=0; SFX.kick(); vibrate(20);
}
function kpResolve(){
  const s=KP.shot, k=KP.k, L=kpLevel(), r=0.035, p=P();
  const saved=Math.abs(s.u-k.x)<L.reach+r&&s.v>k.lift-r&&s.v<k.lift+KEEP_H2+r;
  s.res=saved?'saved':'goal'; KP.state='result'; KP.timer=0; KP.saves.push(saved);
  if(saved){
    p.stats.saves++; KP.cheer=KP.time; SFX.save(); SFX.cheer(); vibrate(30);
    const pt=toScr(KP.g,s.u,s.v), rc=socCv.getBoundingClientRect();
    earn(L.coins+(hasKit(p)?1:0),'SAVE!',rc.left+pt.x,rc.top+pt.y); socSay('SAVED! 🧤');
  } else {save();SFX.whoosh();socSay(`${L.name} scores! ${L.icon}`);}
  renderKpScore();
}
function giveGloves(){ // a perfect 5/5 as keeper wins that level's glove once; it goes into the Backyard, by the goal
  const p=P(); if(!p) return [];
  const won=Object.keys(GLOVES).filter(l=>(p.soccer.keep.best[l]||0)>=KEEP_KICKS&&!p.soccer.keep.gloves.includes(l));
  won.forEach(l=>{const type=GLOVES[l];p.soccer.keep.gloves.push(l);p.room3.items.push(Object.assign({uid:uid(),type,placed:true},spot(type)));});
  if(won.length) save();
  return won.map(l=>DECOR[GLOVES[l]].name);
}
function kpEnd(){
  const p=P(), lvl=p.soccer.keep.level, L=kpLevel(), saves=KP.saves.filter(Boolean).length;
  KP.state='done'; KP.round[lvl]=(KP.round[lvl]+1)%3; p.stats.matches++;
  const best=saves>(p.soccer.keep.best[lvl]||0); if(best) p.soccer.keep.best[lvl]=saves;
  if(saves===KEEP_KICKS){p.stats.perfects++;earn(PERFECT_COINS,'Perfect!');} else save();
  const gloves=giveGloves();
  SFX.whistle(); renderKpScore(); if(gloves.length) setTimeout(SFX.buy,400);
  const line=saves===KEEP_KICKS?'PERFECT KEEPER! 🌟':saves>=3?'Super saves! ✨':saves>=1?'Nice catch! Keep practising 💪':`${L.name} was tricky! Try again? ${L.icon}`;
  const glo=gloves.map(n=>`<div style="margin-top:10px">You won the <b>${n}</b>! It's in your Backyard 🧤</div><svg viewBox="${DECOR[GLOVES[lvl]].box}" style="height:110px">${DECOR[GLOVES[lvl]].d()}</svg>`).join('');
  modal(`🧤 ${saves} / ${KEEP_KICKS} saves!`,`<div style="text-align:center;font-size:18px">${line}${best&&saves?`<br>New best on ${lvl[0].toUpperCase()+lvl.slice(1)}! 🏆`:''}${glo}</div>`,
    [{text:'⬅ Room',cls:'ghost',on:()=>show('room')},{text:'Play again',cls:'pink',on:()=>{kpNewMatch();SFX.whistle();}}]);
}

/* ---------- touch: tap a spot in the goal, swipe to dive, or (Easy) tap the ball ---------- */
function kpPt(e){const r=socCv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
function kpDown(e){
  if(KP.state==='done'){kpNewMatch();SFX.whistle();return;}
  const [x,y]=kpPt(e), g=KP.g, L=kpLevel(); if(!g) return;
  if(L.ballTap&&KP.state==='fly'){const b=ballPos(g,KP.shot,KP.t);if(Math.hypot(x-b.x,y-b.y)<Math.max(56,b.r*3)){kpDive(KP.shot.u,KP.shot.v);KP.swipe=null;return;}}
  KP.swipe=[x,y]; try{socCv.setPointerCapture(e.pointerId);}catch(_){}
}
function kpMove(){}
function kpUp(e){
  const a=KP.swipe, g=KP.g; KP.swipe=null; if(!a||!g) return;
  const [x,y]=kpPt(e), dx=x-a[0], dy=y-a[1];
  if(Math.hypot(dx,dy)<30) kpDive((a[0]-g.cx)/g.GW,(g.gy-a[1])/g.GH);           // a tap: dive to that spot
  else kpDive(KP.k.x+dx/g.GW*1.3,0.35-dy/g.GH);                                  // a swipe: dive that way
}

/* ---------- drawing (main loop, only while Soccer is open in Keep mode) ---------- */
function drawKeep(dt){
  const {ctx,W,H}=fit(socCv), g=socGeo(W,H), L=kpLevel(), k=KP.k; KP.g=g; KP.time+=dt;
  if(KP.state==='off') kpNewMatch();
  KP.timer+=dt;
  if(KP.state==='ready'&&KP.timer>0.9){KP.state='wind';KP.timer=0;}
  else if(KP.state==='wind'&&KP.timer>=L.wind) kpKick();
  else if(KP.state==='fly'){KP.t+=dt/KP.shot.T;if(KP.t>=1)kpResolve();}
  else if(KP.state==='result'){KP.t+=dt/KP.shot.T;if(KP.timer>1.6){if(KP.saves.length>=KEEP_KICKS)kpEnd();else kpNextShot();}}
  // the buddy moves toward the dive spot (or back to the middle while waiting)
  if(KP.tgt){const d=KP.tgt.x-k.x, st=KEEP_SPEED*dt, f=Math.min(1,dt*12); k.x+=Math.abs(d)<st?d:Math.sign(d)*st; k.lift+=(KP.tgt.lift-k.lift)*f; k.tilt+=(KP.tgt.tilt-k.tilt)*f;}
  else if(KP.state==='ready'||KP.state==='wind'){const f=Math.min(1,dt*5);k.x-=k.x*f;k.lift-=k.lift*f;k.tilt-=k.tilt*f;}
  socField(ctx,g,W,H,KP.time,KP.time-KP.cheer<1.6);
  const s=KP.shot, inNet=s&&s.res==='goal'&&KP.t>1, shake=inNet?Math.sin(KP.time*30)*Math.max(0,1-(KP.t-1)*1.2)*g.GH*0.03:0;
  socNet(ctx,g,shake,inNet?()=>drawBall(ctx,ballPos(g,s,KP.t),KP.t*12):null);
  drawBuddyKeeper(ctx,g,k);
  socPosts(ctx,g);
  // the ball: on the spot, or flying (on Easy it glows so it's easy to follow and tap)
  const b=s?ballPos(g,s,KP.t):{gx:g.bx,gy:g.by,x:g.bx,y:g.by,r:g.rb,a:1};
  if(L.ballTap&&KP.state!=='done'&&!inNet&&(!s||KP.t<1.05)){
    ctx.globalAlpha=0.45+0.35*Math.sin(KP.time*8); ctx.fillStyle='#ffd166';
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r*(1.9+0.2*Math.sin(KP.time*8)),0,TAU); ctx.fill(); ctx.globalAlpha=1;}
  if(!inNet) drawBall(ctx,b,s?Math.min(KP.t,1.6)*12:0);
  // Medium: a dotted arrow shows where the shot will go during the run-up
  const n=KP.next;
  if(L.hint&&KP.state==='wind'&&KP.timer>L.wind*0.35&&n){const tp=toScr(g,n.u,n.v);
    ctx.setLineDash([10,10]); ctx.strokeStyle='#ffd166'; ctx.lineWidth=5; ctx.globalAlpha=0.85;
    ctx.beginPath(); ctx.moveTo(g.bx,g.by-g.rb*1.5); ctx.lineTo(g.bx+(tp.x-g.bx)*0.45,g.by-g.rb*1.5+(tp.y-g.by+g.rb*1.5)*0.45); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha=1;}
  // the striker: runs up from the left, leans toward the side it will shoot (Zip sometimes fakes), and kicks
  const S=Math.min(H*0.3,W*0.28), xk=g.bx-S*0.62, x0=g.bx-S*1.5, yk=g.by+g.rb*1.1;
  let sx=xk, kick=0, lean=0;
  if(KP.state==='ready') sx=x0;
  else if(KP.state==='wind'){const q=clamp(KP.timer/L.wind,0,1);sx=x0+(xk-x0)*q*q;kick=clamp((q-0.85)/0.15,0,1);
    lean=(n&&Math.abs(n.u)>0.12?Math.sign(n.u)*(n.fake?-1:1):0)*0.16*q;}
  else if(KP.state==='fly'||KP.state==='result') kick=clamp(1-KP.timer/0.35,0,1);
  ctx.fillStyle='#00000030'; ctx.beginPath(); ctx.ellipse(sx,yk,S*0.3,S*0.07,0,0,TAU); ctx.fill();
  drawStriker(ctx,L.kind,sx,yk,S*0.78,lean,kick,KP.time);
}

/* ---------- glove trophies (awards: never in the Shop), stickers ---------- */
function gloveArt(main,light,dark,label){
  const o='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"';
  return `<ellipse cx="0" cy="-2" rx="40" ry="7" fill="#00000030"/>`
    +`<rect x="-36" y="-26" width="72" height="26" rx="5" fill="#5b3a99" ${o}/><rect x="-26" y="-20" width="52" height="13" rx="3" fill="${light}"/>`
    +`<text x="0" y="-9.5" text-anchor="middle" font-size="10" font-weight="900" fill="${dark}">${label}</text>`
    +`<path d="M-8 -26 L-5 -46 H5 L8 -26Z" fill="${main}" ${o}/>`
    +`<path d="M-24 -88 Q-46 -94 -44 -76 Q-42 -62 -24 -62Z" fill="${main}" ${o}/>`
    +`<path d="M-26 -52 Q-30 -88 -24 -112 Q-22 -126 -12 -124 Q-6 -136 4 -132 Q12 -138 18 -128 Q30 -126 28 -110 L26 -60 Q24 -48 0 -46 Q-24 -48 -26 -52Z" fill="${main}" ${o}/>`
    +`<path d="M-12 -120 V-100 M3 -127 V-100 M17 -123 V-102" stroke="${dark}" stroke-width="3" stroke-linecap="round" opacity=".45"/>`
    +`<rect x="-29" y="-64" width="58" height="16" rx="6" fill="${light}" ${o}/>`
    +`<path d="${starPath(0,-84,11,5)}" fill="#fff" opacity=".9"/>`;
}
Object.assign(DECOR,{
  gloveBronze:{name:'Bronze Glove',price:0,award:1,box:'-60 -150 120 160',d:()=>gloveArt('#cd7f32','#f2b77c','#7a4518','EASY')},
  gloveSilver:{name:'Silver Glove',price:0,award:1,box:'-60 -150 120 160',d:()=>gloveArt('#b9c2cf','#f1f5fa','#5d6675','MEDIUM')},
  gloveGold:{name:'Gold Glove',price:0,award:1,box:'-60 -150 120 160',d:()=>gloveArt('#ffc83d','#fff1b8','#a8730f','HARD')}
});
// In the Backyard, by the soccer goal (clear of the buddy, the pet, the tree trunk and the chalkboard)
Object.assign(TROPHY_SPOTS,{gloveBronze:{x:215,y:655},gloveSilver:{x:325,y:690},gloveGold:{x:905,y:690}});
STICKERS.push(
  stk('save1','soccer','🧤','First Save','circle','Save a shot as the keeper (🧤 Keep)',1,p=>p.stats.saves,1),
  stk('save25','soccer','🧤','Safe Hands','circle','Save 25 shots as the keeper',25,p=>p.stats.saves,2),
  stk('gloves','soccer','🥇','Glove Case','star','Win all 3 keeper gloves (5/5 saves)',3,p=>p.soccer.keep.gloves.length)
);
