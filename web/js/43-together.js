'use strict';
/* =========================================================
   43. TWO-PLAYER GAMES (v1.42): 👯 play together on one tablet
   Player 1 is the room that is open; player 2 taps another room's badge or 👤 Guest (tgPick). The partner is
   remembered until the app closes (TG.p2), so "Play again" is one tap.
   - ⚽ Soccer Duel (Soccer's 👯 tab): both at once on one screen. The kicker swipes up from the ball (socAim, the same
     swipe as ⚽ Kick); the keeper taps or swipes to dive once the ball flies (like 🧤 Keep). The level sets the ball's
     speed (STRIKERS: Easy is slow, glows and can be tapped). 10 shots, taking turns (TG_SHOTS).
   - 🃏 Memory for 2 (Brain Games menu): a Memory Match board; a pair = a point and another go; a miss passes the turn.
   - 🎤 Together (the Stage's 👯 tab): the 'duo' level (section 14): left pad = player 1, right pad = player 2, one team score.
   Gentle scores: both are cheered, never a loser. Coins: TG_COINS per finished game to each player's room (not a Guest),
   up to TG_DAILY a day (duo.day/duo.n). Bests, trophies, gloves, stars and "solved" puzzles are never changed here.
   - ⚾ Batting Duel (since v1.64, section 63): the Ball Field's 👯 tab.
   Saved per room: duo{day, n, soccer, memory, stage, ball} (coins today + games played together).
   ========================================================= */
const TG_COINS=3, TG_DAILY=15, TG_SHOTS=10;
const TG_GUEST={id:'',name:'Guest',badge:'👤',color:'#8ff0d0',look:Object.assign({},DEFAULT_LOOK,{kind:'puppy',fur:'white',hair:'tuft',top:'hoodie',bottom:'shorts',legs:'none',shoes:'sneakers',acc:'none'})};
let TG={p2:null}; // the partner: a profile id, or 'guest'
const TGS={on:false,was:false}; // the Soccer Duel (filled in by tgSocStart)
const TGT={on:false};           // the Stage together
const tgMe=p=>({id:p.id,name:p.name,badge:p.badge,color:ROOM_COLORS[p.color]||'#ff8cc6',look:p.look});
function tgPartner(){
  if(TG.p2==='guest') return Object.assign({},TG_GUEST);
  const q=DB.profiles.find(x=>x.id===TG.p2&&x.id!==DB.activeId); return q?tgMe(q):null;
}
// The two players; player 2 gets another color if both rooms have the same one.
function tgPlayers(){
  const a=tgMe(P()), b=tgPartner(); if(!b) return null;
  if(b.color===a.color) b.color=a.color==='#8ff0d0'?'#ffd166':'#8ff0d0';
  return [a,b];
}
const tgFace=(pl,cls)=>`<span class="tg-face ${cls||''}" style="--tc:${pl.color}">${flatSVG(mascotSVG(pl.look,'20 0 160 250'))}</span>`;

/* ---------- who is player 2? ---------- */
function tgPick(game){
  const p=P(); if(!p) return; SFX.click();
  const others=DB.profiles.filter(q=>q.id!==p.id);
  const tile=(id,pl)=>`<button class="tg-who${TG.p2===id?' on':''}" data-tg-who="${id}" aria-label="${esc(pl.name)}">${tgFace(pl)}<b>${esc(pl.badge)} ${esc(pl.name)}</b></button>`;
  modal('👯 Who is playing with you?',
    `<div class="tg-pick">${others.map(q=>tile(q.id,tgMe(q))).join('')}${tile('guest',TG_GUEST)}</div>`
    +`<p class="hint" style="text-align:center">${p.easy?'👆':'Tap your friend\'s room, or 👤 Guest.'}</p>`,
    [{text:'✖ Not now',cls:'ghost'}]);
  tgPick.game=game;
}
$('#modal').addEventListener('click',e=>{
  const b=e.target.closest('[data-tg-who]'); if(!b) return;
  TG.p2=b.dataset.tgWho; closeModal(); SFX.happy();
  const g=tgPick.game; if(g==='soccer') tgSocStart(); else if(g==='memory') tgMemStart(); else if(g==='stage') tgStageOn(); else if(g==='ball') bdStart(); // ⚾ Batting Duel (section 63, v1.64)
});

/* ---------- coins and counts (both rooms; a Guest gets nothing) ---------- */
// Returns one line per player for the end box.
function tgPay(players,game){
  const today=new Date().toDateString();
  const lines=players.map(pl=>{
    const q=pl.id&&DB.profiles.find(x=>x.id===pl.id); if(!q) return '';
    const d=q.duo; if(d.day!==today){d.day=today;d.n=0;}
    d[game]=(d[game]||0)+1;
    const c=Math.max(0,Math.min(TG_COINS,TG_DAILY-d.n)); d.n+=c; q.coins+=c;
    return c?`${esc(pl.badge)} ${esc(pl.name)} +${c} 🪙`:`${esc(pl.badge)} ${esc(pl.name)}: coins for playing together are full today. Keep playing for fun! ✨`;
  }).filter(Boolean);
  save(); updateCoins(); SFX.coin();
  return lines.length?`<div class="tg-pay">${lines.map(l=>`<div>${l}</div>`).join('')}</div>`:'';
}
// The end box line: both get a cheer, whatever the score.
function tgCheer(players,a,b){
  if(a===b) return `It's a tie, you're both stars! 🌟`;
  return `Great game, you two! 🎉`;
}
function tgScores(players,s){
  return `<div class="tg-scores">${players.map((pl,i)=>`<div class="tg-sc" style="--tc:${pl.color}">${tgFace(pl)}<b>${esc(pl.name)}</b><span>${s[i]}</span></div>`).join('')}</div>`;
}

/* =========================================================
   ⚽ SOCCER DUEL
   ========================================================= */
const tgSL=()=>STRIKERS[TGS.lvl]||STRIKERS.easy;
const TG_IMG={}; // look (as text) -> a small canvas of that buddy with keeper gloves (drawn once, like kpArt)
function tgImg(look){
  const key=JSON.stringify(look); if(TG_IMG[key]) return TG_IMG[key];
  TG_IMG[key]='loading';
  const svg=mascotSVG(look,null,'width="200" height="270"').replace('>',`><defs>${$('#gdefs').innerHTML}</defs>`), img=new Image();
  img.onload=()=>{const c=document.createElement('canvas');c.width=300;c.height=405;const x=c.getContext('2d');
    x.drawImage(img,0,0,300,405); x.lineWidth=5; x.strokeStyle='#3b2f52';
    [[50,280],[250,280]].forEach(([gx,gy])=>{x.beginPath();x.arc(gx,gy,22,0,TAU);x.fillStyle='#8ff0d0';x.fill();x.stroke();});
    TG_IMG[key]=c;};
  img.onerror=()=>{TG_IMG[key]='none';};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  return 'loading';
}
function tgSocStart(){
  const pl=tgPlayers(); if(!pl) return;
  const p=P(); kpStop(); clearTimeout(SOC.next); SOC.swipe=null;
  Object.assign(TGS,{on:true,was:false,pl,lvl:TGS.lvl||(p.easy?'easy':'medium'),shots:[],state:'aim',shot:null,t:0,timer:0,time:0,
    k:{x:0,lift:0,tilt:0},tgt:null,dives:0,kick:null,keep:null,g:null,cheer:-9});
  pl.forEach(x=>tgImg(x.look));
  tgSocRender(); SFX.whistle();
}
// The shot being taken (or, after it, until the next one starts): even shots are player 1's kicks.
const tgShotNo=()=>TGS.state==='result'||TGS.state==='done'?TGS.shots.length-1:TGS.shots.length;
const tgKicker=()=>TGS.pl[tgShotNo()%2], tgKeeper=()=>TGS.pl[(tgShotNo()+1)%2];
function tgSocRender(){
  const L=tgSL();
  $$('#socTabs [data-mode]').forEach(b=>b.classList.remove('on')); $('#socTabs [data-duo]').classList.add('on');
  $$('#socTabs [data-lvl]').forEach(b=>{b.classList.toggle('on',b.dataset.lvl===TGS.lvl);b.querySelector('i').textContent={easy:'🐢',medium:'⚽',hard:'⚡'}[b.dataset.lvl];});
  $('#socTitle').textContent='👯 Soccer Duel'; $('#kitBadge').classList.add('hidden');
  $('#socMsg').classList.remove('on');
  const k=tgKicker(); $('#socMascot').classList.remove('hidden'); $('#socMascot').innerHTML=mascotSVG(k.look);
  tgSocScore();
}
function tgSocScore(){
  const pl=TGS.pl; if(!pl) return;
  $('#socScore').innerHTML=pl.map((x,i)=>{const mine=TGS.shots.filter(s=>s.by===i);
    return `<span class="tg-row" style="--tc:${x.color}"><b>${esc(x.badge)}</b>`+Array.from({length:TG_SHOTS/2},(_,j)=>{const s=mine[j];
      return `<span class="dot ${s&&!s.goal?'miss':''} ${TGS.state==='aim'&&j===mine.length&&TGS.shots.length%2===i?'now':''}">${s?(s.goal?'⚽':'✖'):''}</span>`;}).join('')+`</span>`;}).join('');
  const k=tgKicker(), g=tgKeeper(), L=tgSL();
  $('#socTip').textContent=TGS.state==='done'?'Tap 👯 Duel to play again!'
    :`⚽ ${k.name}: swipe up from the ball! 🧤 ${g.name}: ${L.ballTap?'tap the ball':'tap where it goes'} when it flies!`;
}
// A level tab sets the ball speed and starts a new duel; Kick or Keep leaves the duel. Returns true when handled here.
function tgSocTab(b){
  if(b.dataset.lvl){TGS.lvl=b.dataset.lvl;SFX.click();tgSocStart();return true;}
  TGS.on=false; TGS.was=true; return false;
}
$('#socTabs').addEventListener('click',e=>{const b=e.target.closest('[data-duo]');if(b)tgPick('soccer');});

socCv.addEventListener('pointercancel',()=>{if(TGS.on){TGS.kick=null;TGS.keep=null;}});
function tgPt(e){const r=socCv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top,performance.now()];}
// Two fingers can be down at once: one swipe for the kicker (below the goal, while aiming) and one for the keeper (once it flies).
function tgDown(e){
  const g=TGS.g; if(!g||TGS.state==='done') return;
  const pt=tgPt(e), L=tgSL();
  if(TGS.state==='aim'&&pt[1]>g.gy+(g.by-g.gy)*0.3&&!TGS.kick){TGS.kick={id:e.pointerId,pts:[pt]};}
  else if(TGS.state==='fly'){
    if(L.ballTap){const b=ballPos(g,TGS.shot,TGS.t);if(Math.hypot(pt[0]-b.x,pt[1]-b.y)<Math.max(56,b.r*3)){tgDive(TGS.shot.u,TGS.shot.v);return;}}
    TGS.keep={id:e.pointerId,pt};
  } else if(TGS.state==='aim'&&pt[1]<=g.gy+(g.by-g.gy)*0.3) socSay(`🧤 ${tgKeeper().name}: wait for the kick!`);
  try{socCv.setPointerCapture(e.pointerId);}catch(_){}
}
function tgMove(e){if(TGS.kick&&TGS.kick.id===e.pointerId)TGS.kick.pts.push(tgPt(e));}
function tgUp(e){
  const g=TGS.g; if(!g) return; const pt=tgPt(e);
  if(TGS.kick&&TGS.kick.id===e.pointerId){
    const sw=TGS.kick.pts; sw.push(pt); TGS.kick=null; if(TGS.state!=='aim') return;
    const s=socAim(sw,g);
    if(s.tap||s.err){toast(`⚽ ${tgKicker().name}: swipe UP from the ball!`);return;}
    tgShoot(s);
  } else if(TGS.keep&&TGS.keep.id===e.pointerId){
    const a=TGS.keep.pt; TGS.keep=null; const dx=pt[0]-a[0], dy=pt[1]-a[1];
    if(Math.hypot(dx,dy)<30) tgDive((a[0]-g.cx)/g.GW,(g.gy-a[1])/g.GH); else tgDive(TGS.k.x+dx/g.GW*1.3,0.35-dy/g.GH);
  }
}
function tgShoot(s){
  const L=tgSL();
  TGS.shot={u:s.u,v:s.v,curve:s.curve||0,T:L.T*clamp(1.3-s.power*0.25,0.85,1.1),res:null}; // a harder flick is a little faster
  TGS.state='fly'; TGS.t=0; TGS.timer=0; TGS.tgt=null; TGS.dives=0; SFX.kick(); vibrate(20);
  const m=$('#socMascot'); m.classList.remove('kick'); void m.offsetWidth; m.classList.add('kick');
}
function tgDive(u,v){
  const L=tgSL(); if(TGS.state!=='fly') return false;
  if(TGS.dives&&!L.redive) return false;
  u=clamp(u,-0.42,0.42);
  TGS.tgt={x:u,lift:clamp(v-0.5,0,0.35),tilt:Math.abs(u)>0.12?Math.sign(u)*Math.min(1,Math.abs(u)/0.32)*0.85:0};
  TGS.dives++; vibrate(12); return true;
}
function tgResolve(){
  const s=TGS.shot, k=TGS.k, L=tgSL(), r=0.035, by=TGS.shots.length%2, K=tgKicker(), G=tgKeeper();
  let res;
  if(Math.abs(s.u)>0.5+r) res='wide'; else if(s.v>1+r) res='over';
  else if(Math.abs(s.u)>0.5-r||s.v>1-r) res='post';
  else if(Math.abs(s.u-k.x)<L.reach+r&&s.v>k.lift-r&&s.v<k.lift+KEEP_H2+r) res='saved';
  else res='goal';
  s.res=res; TGS.state='result'; TGS.timer=0; TGS.shots.push({by,goal:res==='goal'});
  if(res==='goal'){TGS.cheer=TGS.time;SFX.cheer();vibrate(30);socSay(`GOAL for ${K.name}! ⚽`);}
  else if(res==='saved'){SFX.save();SFX.cheer();socSay(`${G.name} saves it! 🧤`);}
  else if(res==='post'){SFX.post();socSay('Off the post!');}
  else {SFX.whoosh();socSay(res==='over'?'Over the bar!':'Wide!');}
  tgSocScore();
}
function tgSocNext(){
  if(TGS.shots.length>=TG_SHOTS){tgSocEnd();return;}
  Object.assign(TGS,{state:'aim',shot:null,t:0,timer:0,tgt:null,dives:0,kick:null,keep:null});
  $('#socMascot').innerHTML=mascotSVG(tgKicker().look);
  socSay(`🔄 Switch! ⚽ ${tgKicker().name} kicks`); tgSocScore();
}
function tgSocEnd(){
  TGS.state='done'; SFX.whistle(); tgSocScore();
  const pl=TGS.pl, s=[0,1].map(i=>TGS.shots.filter(x=>x.by===i&&x.goal).length);
  const pay=tgPay(pl,'soccer');
  modal('👯 Soccer Duel',`<div class="tg-end">${tgScores(pl,s.map(n=>`⚽ ${n}`))}<p>${tgCheer(pl,s[0],s[1])}</p>${pay}</div>`,
    [{text:'⚽ Just me',cls:'ghost',on:()=>{TGS.on=false;renderSoccer();}},{text:'👯 Play again',cls:'pink',on:tgSocStart}]);
  setTimeout(checkStickers,300);
}
function tgDraw(dt){
  const {ctx,W,H}=fit(socCv), g=socGeo(W,H), L=tgSL(), k=TGS.k; TGS.g=g; TGS.time+=dt; TGS.timer+=dt;
  if(TGS.state==='fly'){TGS.t+=dt/TGS.shot.T;if(TGS.t>=1)tgResolve();}
  else if(TGS.state==='result'){TGS.t+=dt/TGS.shot.T;if(TGS.timer>1.6)tgSocNext();}
  if(TGS.tgt){const d=TGS.tgt.x-k.x, st=KEEP_SPEED*dt, f=Math.min(1,dt*12); k.x+=Math.abs(d)<st?d:Math.sign(d)*st; k.lift+=(TGS.tgt.lift-k.lift)*f; k.tilt+=(TGS.tgt.tilt-k.tilt)*f;}
  else if(TGS.state==='aim'){const f=Math.min(1,dt*5);k.x-=k.x*f;k.lift-=k.lift*f;k.tilt-=k.tilt*f;}
  socField(ctx,g,W,H,TGS.time,TGS.time-TGS.cheer<1.6);
  const s=TGS.shot, inNet=s&&s.res==='goal'&&TGS.t>1, shake=inNet?Math.sin(TGS.time*30)*Math.max(0,1-(TGS.t-1)*1.2)*g.GH*0.03:0;
  socNet(ctx,g,shake,inNet?()=>drawBall(ctx,ballPos(g,s,TGS.t),TGS.t*12):null);
  // the keeper: player 2's (or 1's) buddy, drawn from a picture made once
  const G=tgKeeper(), img=tgImg(G.look);
  const h=g.GH*0.92, w=h*200/270, x=g.cx+k.x*g.GW, y=g.gy-k.lift*g.GH;
  ctx.fillStyle='#00000030'; ctx.beginPath(); ctx.ellipse(x,g.gy,w*0.32,w*0.08,0,0,TAU); ctx.fill();
  ctx.save(); ctx.translate(x,y); ctx.rotate(k.tilt);
  if(img&&img.getContext) ctx.drawImage(img,-w/2,-h*242/270,w,h);
  else {ctx.strokeStyle='#3b2f52';ctx.lineWidth=3;kC(ctx,0,-h*0.5,w*0.3,'#fff');}
  ctx.restore();
  socPosts(ctx,g);
  const b=s?ballPos(g,s,TGS.t):{gx:g.bx,gy:g.by,x:g.bx,y:g.by,r:g.rb,a:1};
  if(L.ballTap&&TGS.state==='fly'&&TGS.t<1.05){ctx.globalAlpha=0.45+0.35*Math.sin(TGS.time*8);ctx.fillStyle='#ffd166';
    ctx.beginPath();ctx.arc(b.x,b.y,b.r*(1.9+0.2*Math.sin(TGS.time*8)),0,TAU);ctx.fill();ctx.globalAlpha=1;}
  if(!inNet) drawBall(ctx,b,s?Math.min(TGS.t,1.6)*12:0);
  // name tags: who keeps (over the goal) and who kicks (by the ball)
  const tag=(txt,tx,ty,col)=>{ctx.font=`900 ${Math.round(Math.max(15,g.GH*0.13))}px sans-serif`;ctx.textAlign='center';ctx.lineWidth=5;
    ctx.strokeStyle='#2b2235';ctx.strokeText(txt,tx,ty);ctx.fillStyle=col;ctx.fillText(txt,tx,ty);};
  if(TGS.state!=='done'){const K=tgKicker();
    tag(`🧤 ${G.name}`,g.cx,g.hy-g.GH*0.12,G.color); tag(`⚽ ${K.name}`,g.bx+g.rb*4.2,g.by+g.rb*0.4,K.color);}
}

/* =========================================================
   🃏 MEMORY FOR 2 (in the Brain Games screen, view 'duo')
   ========================================================= */
let TGM={lvl:'easy',cards:[],open:[],lock:false,turn:0,pts:[0,0],pl:null,done:false};
BR_MENU_TOP.push(p=>`<button class="btn tg-mem-btn" data-duo="memory" aria-label="Memory for 2 players">👯 <span>Memory for 2</span></button>`);
$('#brMenu').addEventListener('click',e=>{const b=e.target.closest('[data-duo]');if(b)tgPick('memory');});
$('#brTabs').addEventListener('click',e=>{const b=e.target.closest('[data-duo]');if(b&&BR.view==='play'){tgMemStart.lvl=BR.lvl;tgPick('memory');}}); // the 👯 tab in Memory Match
function tgMemStart(lvl){
  const pl=tgPlayers(); if(!pl) return;
  if(!lvl&&tgMemStart.lvl){lvl=tgMemStart.lvl;tgMemStart.lvl='';} // from the 👯 tab: the level she was playing
  if(lvl) TGM.lvl=lvl; else TGM.lvl=P().brain.level.memory||'easy';
  const sets=MEM_SETS[TGM.lvl], set=sets[Math.floor(Math.random()*sets.length)];
  const deck=brShuffle([...set,...set],'duo'+Date.now());
  Object.assign(TGM,{cards:deck.map(id=>({id,open:false,got:-1})),open:[],lock:false,turn:0,pts:[0,0],pl,done:false});
  brStop(); BR.view='duo';
  $('#brMenu').classList.add('hidden'); $('#brPlay').classList.add('hidden'); $('#brDuo').classList.remove('hidden');
  $('#brBack').textContent='⬅ Games'; $('#brTitle').textContent='👯 Memory for 2';
  const faces={}; set.forEach(id=>{faces[id]=memPic(id);});
  const cols=deck.length<=6?3:deck.length<=12?4:5;
  $('#brDuo').innerHTML=`<div class="tabs" style="background:var(--panel);justify-content:center">${BRAIN_LVLS.map(l=>`<button class="tab${l===TGM.lvl?' on':''}" data-tg-lvl="${l}">${l==='easy'?'🐣':l==='medium'?'🌟':'🧠'} <span>${l==='easy'?6:l==='medium'?12:20}</span></button>`).join('')}</div>`
    +`<div class="br-scroll"><div class="tg-turn" id="tgTurn"></div><div class="br-board br-memory">`
    +`<div class="mem-grid" style="--cols:${cols};--cw:${cols===5?100:cols===4?124:150}px">`+deck.map((id,i)=>`<button class="mem-card" data-tg-c="${i}" aria-label="Card"><span class="mem-back">❓</span><span class="mem-face">${faces[id]}</span></button>`).join('')+`</div></div></div>`;
  tgMemTurn(); SFX.click();
}
function tgMemTurn(){
  const t=$('#tgTurn'); if(!t) return;
  t.innerHTML=TGM.pl.map((pl,i)=>`<div class="tg-sc${i===TGM.turn&&!TGM.done?' on':''}" style="--tc:${pl.color}">${tgFace(pl)}<b>${esc(pl.name)}</b><span>${TGM.pts[i]}</span></div>`).join('')
    +(TGM.done?'':`<div class="tg-go" style="--tc:${TGM.pl[TGM.turn].color}">${esc(TGM.pl[TGM.turn].name)}'s turn! 👆</div>`);
}
$('#brDuo').addEventListener('click',e=>{
  const l=e.target.closest('[data-tg-lvl]'); if(l){tgMemStart(l.dataset.tgLvl);return;}
  const c=e.target.closest('[data-tg-c]'); if(c) tgMemTap(+c.dataset.tgC);
});
function tgMemTap(i){
  const c=TGM.cards[i]; if(!c||TGM.lock||c.open||c.got>=0||TGM.done||BR.view!=='duo') return;
  c.open=true; TGM.open.push(i); $(`[data-tg-c="${i}"]`).classList.add('open'); SFX.flip();
  if(TGM.open.length<2) return;
  const [a,b]=TGM.open, A=TGM.cards[a], B=TGM.cards[b];
  if(A.id===B.id){ // a pair: a point, and the same player goes again
    A.got=B.got=TGM.turn; TGM.open=[]; TGM.pts[TGM.turn]++; SFX.happy();
    [a,b].forEach(k=>{const el=$(`[data-tg-c="${k}"]`);el.classList.add('got');el.style.borderColor=TGM.pl[TGM.turn].color;});
    if(TGM.cards.every(x=>x.got>=0)){TGM.done=true;tgMemTurn();BR.timer=setTimeout(tgMemEnd,700);} else tgMemTurn();
  } else { // a miss: flip back, the other player's turn
    TGM.lock=true; const tok=BR.tok;
    BR.timer=setTimeout(()=>{if(BR.tok!==tok)return;[a,b].forEach(k=>{TGM.cards[k].open=false;const el=$(`[data-tg-c="${k}"]`);if(el)el.classList.remove('open');});
      TGM.open=[];TGM.lock=false;TGM.turn=1-TGM.turn;tgMemTurn();},900);
  }
}
function tgMemEnd(){
  if(BR.view!=='duo') return;
  const pl=TGM.pl, s=TGM.pts; SFX.cheer();
  const pay=tgPay(pl,'memory');
  modal('👯 Memory for 2',`<div class="tg-end">${tgScores(pl,s.map(n=>`🃏 ${n}`))}<p>${tgCheer(pl,s[0],s[1])}</p>${pay}</div>`,
    [{text:'⬅ Games',cls:'ghost',on:brMenu},{text:'👯 Play again',cls:'pink',on:()=>tgMemStart(TGM.lvl)}]);
  setTimeout(checkStickers,300);
}

/* =========================================================
   🎤 STAGE TOGETHER (the 'duo' level in section 14: lane 0 = player 1, lane 1 = player 2)
   ========================================================= */
$('#stgTabs').addEventListener('click',e=>{const b=e.target.closest('[data-duo]');if(b&&STG.state==='pick')tgPick('stage');});
function tgStageOn(){if(!tgPlayers())return;TGT.on=true;stgPickView();}
// Called at the end of stgPickView: marks the 👯 tab and says who has which pad.
function tgStagePick(){
  const d=$('#stgTabs [data-duo]'); if(!d) return;
  const pl=TGT.on&&tgPlayers(); if(!pl) TGT.on=false;
  d.classList.toggle('on',TGT.on);
  if(TGT.on){$$('#stgTabs [data-lvl]').forEach(b=>b.classList.remove('on'));
    $('#stgHint').innerHTML=`👯 Pick a song! <b style="color:${pl[0].color}">💗 ${esc(pl[0].name)}</b> taps the left circle, <b style="color:${pl[1].color}">⭐ ${esc(pl[1].name)}</b> the right one.`;}
}
const tgStageBuddies=()=>{const pl=tgPlayers()||[tgMe(P()),TG_GUEST];return pl.map(x=>mascotSVG(x.look)).join('');};
function tgStageNames(){
  const box=$('#stgNames'); if(!box) return; const on=STG.lvl==='duo', pl=on&&tgPlayers();
  box.classList.toggle('hidden',!pl);
  if(pl){$('#stgN1').textContent=`💗 ${pl[0].name}`;$('#stgN1').style.background=pl[0].color;$('#stgN2').textContent=`${pl[1].name} ⭐`;$('#stgN2').style.background=pl[1].color;}
}
function tgStageEnd(){
  const S=SONGS[STG.song], N=STG.notes.length, c=STG.counts, hits=c[0]+c[1]+c[2];
  const acc=N?STG.score/(100*N):0, stars=hits?(acc>=0.85?3:acc>=0.6?2:1):0;
  STG.state='done'; SFX.cheer();
  const pl=tgPlayers()||[tgMe(P()),TG_GUEST], lane=i=>STG.notes.filter(n=>n.lane===i&&n.r>=1&&n.r<=3).length;
  const pay=hits?tgPay(pl,'stage'):'';
  modal(`🎤 ${'⭐'.repeat(stars)||'🎵'} ${esc(S.name)}`,`<div class="tg-end">${tgScores(pl,[lane(0),lane(1)].map(n=>`🎵 ${n}`))}`
    +`<p>${!hits?'Tap your circle when the notes reach it!':stars===3?'Superstar team! 🌟':'What a team show! 🎉'}<br>Team score ${STG.score}</p>${pay}</div>`,
    [{text:'🎵 Songs',cls:'ghost',on:stgPickView},{text:'Play again',cls:'pink',on:()=>stStart(STG.song)}]);
  setTimeout(checkStickers,300);
}

/* ---------- stickers (🚪 Friends page) ---------- */
const tgGames=p=>['soccer','memory','stage'].filter(g=>p.duo[g]>0).length, tgAll=p=>p.duo.soccer+p.duo.memory+p.duo.stage+(p.duo.ball||0);
STICKERS.push(
  stk('duo1','friends','👯','Play Date','circle','Play a game together (👯)',1,tgAll,1),
  stk('duo3','friends','🎲','Game Night','scallop','Play all 3 games together: Soccer, Memory and Stage',3,tgGames,2),
  stk('duo20','friends','💞','Best Buddies','heart','Play 20 games together',20,tgAll,3)
);
