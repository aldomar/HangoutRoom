'use strict';
/* =========================================================
   53. STAGE JAM (v1.52): her 🎹 Music Maker loop is the band, and she plays on top
   Opened by the Stage's 🎸 Jam tab and by the Music Maker's 🎸 button (which starts the loop on the grid straight away).
   1. Pick the band: her loop on the grid now, her saved loops, or the 3 ready-made ideas (MU_IDEAS), plus a jam sound.
   2. Jam: the loop plays round and round with its own kit and speed (Music Maker voices, scheduled a little ahead on the
      audio clock, like muTick). 5 big pads play the Music Maker's notes C D E G A, so every tap fits. Slide a finger
      across them for a run. No falling notes, no score, no "Oops", no timer.
   3. Stop: a cheer box. A jam of JAM_MIN notes or more pays JAM_COINS, JAM_DAILY jams a day (p.jam.pay).
   Drawn by the main loop only while the Stage is open (drawStage hands over while STG.state is 'jam' or 'jamdone').
   Sound ids (sparkle pluck toot) are saved in p.jam.sound: never rename them.
   ========================================================= */
const JAM_MIN=20, JAM_COINS=2, JAM_DAILY=3, JAM_CHEER_EVERY=16;
const JAM_SOUNDS={
  sparkle:{icon:'✨',name:'Sparkle'},
  pluck:{icon:'🎸',name:'Pluck'},
  toot:{icon:'🎺',name:'Toot'}
};
// The pads from left to right, low to high: the Music Maker's 5 note rows (row 4 = C … row 0 = A), with their colors.
const JAM_PADS=[4,3,2,1,0].map(r=>({r,m:MU_ROWS[r].m,c:MU_ROWS[r].c}));
const JAM_WORDS=['Wow! ✨','On fire! 🔥','Encore! 🎉','So cool! 🌟','Rock star! 🎸'];
const JAM={from:'stage',pick:false,on:false,loop:null,clock:'perf',t0:0,step:0,nextT:0,q:[],notes:0,cheers:0,
  press:[0,0,0,0,0],fx:[],spot:null,spotT:0,ptr:{},g:null};
const jamSound=p=>JAM_SOUNDS[p.jam.sound]?p.jam.sound:'sparkle';

/* ---------- the loops she can jam over ---------- */
function jamLoops(p){
  const fix=(g,kit,speed)=>({g,kit:MU_KITS[kit]?kit:'soft',speed:MU_SPEEDS[speed]?speed:1});
  const L=[];
  if(muNotes(p.music.cur)) L.push(Object.assign({id:'cur',icon:'🎹',name:'My loop now',own:1},fix(p.music.cur,muKit(p),muSpeed(p))));
  p.music.slots.forEach((s,i)=>{if(s&&muNotes(s.g))L.push(Object.assign({id:'s'+i,icon:'💾',name:'My loop '+(i+1),own:1},fix(s.g,s.kit,s.speed)));});
  MU_IDEAS.forEach((d,i)=>L.push(Object.assign({id:'i'+i,icon:d.icon,name:d.name,own:0},fix(d.rows.join(''),d.kit,d.speed))));
  return L;
}

/* ---------- 1. pick the band ---------- */
function jamOpen(from){
  const p=P(); if(!p) return;
  if(cur!=='stage') show('stage');
  JAM.from=from==='music'?'music':'stage';
  if(JAM.from==='music'&&muNotes(p.music.cur)){jamStart('cur');return;} // from the Music Maker: her loop on the grid, straight away
  jamPickView();
}
function jamPickView(){
  const p=P(); if(!p) return;
  STG.state='pick'; JAM.pick=true;
  $('#stgPick').classList.add('hidden'); $('#stgPlay').classList.add('hidden'); $('#stgTabs').classList.add('hidden');
  $('#jamPick').classList.remove('hidden'); $('#jamStop').classList.add('hidden');
  $('#stgBack').textContent=JAM.from==='music'?'⬅ Music':'⬅ Songs';
  $('#jamHint').textContent=!DB.settings.sound?'🔇 Sounds are off. Turn them on in ⚙️ Settings to hear the band!'
    :'🎸 Pick a loop to be your band, then tap the circles to play along!';
  $('#jamLoops').innerHTML=jamLoops(p).map(L=>`<button class="song jam-loop${L.own?' own':''}" data-loop="${L.id}" aria-label="${esc(L.name)}">`
    +`<span class="jam-mini">${muMini(L.g)}</span><span><div class="sn">${L.icon} ${esc(L.name)}</div>`
    +`<div class="sd">${MU_KITS[L.kit].icon} ${MU_KITS[L.kit].name} · ${MU_SPEEDS[L.speed].icon} ${MU_SPEEDS[L.speed].name}</div></span></button>`).join('');
  const on=jamSound(p);
  $('#jamSounds').innerHTML=`<div class="bd-t">🎶 <span>Jam sound</span></div>`+Object.entries(JAM_SOUNDS).map(([id,S])=>
    `<button class="tab jam-snd${id===on?' on':''}" data-snd="${id}" aria-label="${S.name}">${S.icon} <span class="tn">${S.name}</span></button>`).join('');
}
function jamHide(){ // the song list is on screen again
  JAM.pick=false; const j=$('#jamPick'); if(j) j.classList.add('hidden');
  const s=$('#jamStop'); if(s) s.classList.add('hidden');
}
$('#jamLoops').onclick=e=>{const b=e.target.closest('[data-loop]');if(b)jamStart(b.dataset.loop);};
$('#jamSounds').onclick=e=>{const b=e.target.closest('[data-snd]');if(!b)return;const p=P();
  p.jam.sound=b.dataset.snd; save(); jamPickView();
  if(DB.settings.sound&&ac()) jamVoice(2,AC.currentTime+0.01,p.jam.sound);};
$('#stgTabs').addEventListener('click',e=>{if(e.target.closest('[data-jam]')&&STG.state==='pick'){SFX.click();TGT.on=false;jamOpen('stage');}});
$('#muJam').onclick=()=>{SFX.click();jamOpen('music');};
$('#jamStop').onclick=()=>{SFX.click();jamEnd(false);};
// Back: a jam -> the loops -> the songs (or the Music Maker). Returns true when it handled Back.
function jamBackKey(){
  if(STG.state==='jam'){jamEnd(false);return true;}
  if(STG.state==='jamdone'){closeModal();jamPickView();return true;}
  if(JAM.pick){if(JAM.from==='music')show('music');else stgPickView();return true;}
  return false;
}

/* ---------- 2. jam ---------- */
function jamStart(id){
  const p=P(), L=p&&jamLoops(p).find(x=>x.id===id); if(!L) return;
  const a=DB.settings.sound?ac():null; stopMusic(); muStop(); // the room music rests while the band plays
  Object.assign(JAM,{pick:false,on:true,loop:Object.assign({rows:MU_ROWS.map((_,r)=>[...L.g.slice(r*MU_STEPS,(r+1)*MU_STEPS)].map(Number))},L),
    step:0,q:[],notes:0,cheers:0,press:[0,0,0,0,0],fx:[],spot:null,spotT:0,ptr:{}});
  JAM.clock=a&&a.state==='running'?'ac':'perf'; JAM.t0=JAM.nextT=jamNow()+0.3;
  STG.state='jam'; STG.time=0;
  $('#jamPick').classList.add('hidden'); $('#stgPick').classList.add('hidden'); $('#stgTabs').classList.add('hidden');
  $('#stgPlay').classList.remove('hidden'); $('#jamStop').classList.remove('hidden'); $('#stgNames').classList.add('hidden');
  $('#stgScore').textContent=''; $('#stgCombo').textContent='';
  $('#stgBack').textContent='⬅ Loops';
  $('#stgMascot').innerHTML=mascotSVG(p.look); $('#stgMascot').classList.remove('duo');
  SFX.click(); wakeLoop();
}
const jamNow=()=>JAM.clock==='ac'&&AC?AC.currentTime:performance.now()/1000;
const jamLat=()=>JAM.clock==='ac'&&AC?(AC.outputLatency||AC.baseLatency||0)+(DB.settings.stageOffset||0)/1000:0;
const jamStepDur=()=>60/MU_SPEEDS[JAM.loop.speed].bpm/2;
// The band: schedules the next steps of the loop a little ahead (like muTick in section 40).
function jamTick(){
  if(!JAM.on) return;
  const now=jamNow(), sd=jamStepDur(), live=JAM.clock==='ac'&&DB.settings.sound&&AC;
  if(JAM.nextT<now-0.2){JAM.nextT=now+0.05;JAM.t0=JAM.nextT-JAM.step*sd;} // after a long pause, carry on from now
  while(JAM.nextT<now+0.15){
    if(live) JAM.loop.rows.forEach((row,r)=>{if(row[JAM.step])muVoice(r,Math.max(JAM.nextT,AC.currentTime),JAM.loop.kit);});
    JAM.step=(JAM.step+1)%MU_STEPS; JAM.nextT+=sd;
  }
}
// One of her notes (pad 0-4), right now, in her jam sound.
function jamVoice(pad,at,snd){
  const m=JAM_PADS[pad].m;
  if(snd==='pluck'){sTone(mf(m),at,0.28,'sawtooth',0.04);sTone(mf(m),at,0.4,'triangle',0.13);}
  else if(snd==='toot'){sTone(mf(m),at,0.45,'square',0.04);sTone(mf(m-12),at,0.45,'sine',0.09);}
  else {sTone(mf(m+12),at,0.7,'sine',0.15);sTone(mf(m+24),at,0.35,'sine',0.04);}
}
function jamPlay(pad){
  const p=P(); if(!p||STG.state!=='jam') return;
  if(DB.settings.sound&&AC&&AC.state==='running') jamVoice(pad,AC.currentTime+0.005,jamSound(p));
  JAM.notes++; JAM.press[pad]=0.2; JAM.spot=JAM_PADS[pad].c; JAM.spotT=1.2;
  const g=JAM.g; if(g) JAM.fx.push({x:g.xs[pad],y:g.yh-g.pr,col:JAM_PADS[pad].c,t:0,wob:Math.random()*TAU,note:1});
  if(JAM.notes%JAM_CHEER_EVERY===0){
    const w=JAM_WORDS[JAM.cheers++%JAM_WORDS.length]; if(g) JAM.fx.push({x:g.cx,y:g.y0+g.H*0.12,txt:w,col:'#ffd166',t:0,big:1});
    vibrate(15);
  }
}
const jamCv=$('#stgCv');
function jamPadAt(e){
  const g=JAM.g; if(!g) return -1;
  const r=jamCv.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top;
  if(y<g.y0+g.H*0.08) return -1; // above the stage floor: her buddy, not a pad
  return clamp(Math.floor((x-(g.cx-g.lw*2.5))/g.lw),0,4);
}
jamCv.addEventListener('pointerdown',e=>{
  if(STG.state==='jamdone'){closeModal();jamPickView();return;}
  if(STG.state!=='jam') return;
  e.preventDefault(); const k=jamPadAt(e); if(k<0) return;
  JAM.ptr[e.pointerId]=k; jamPlay(k);
  try{jamCv.setPointerCapture(e.pointerId);}catch(_){}
});
jamCv.addEventListener('pointermove',e=>{ // slide across the pads for a run
  if(STG.state!=='jam'||!(e.pointerId in JAM.ptr)) return;
  const k=jamPadAt(e); if(k>=0&&k!==JAM.ptr[e.pointerId]){JAM.ptr[e.pointerId]=k;jamPlay(k);}
});
const jamUp=e=>{delete JAM.ptr[e.pointerId];};
jamCv.addEventListener('pointerup',jamUp); jamCv.addEventListener('pointercancel',jamUp);

/* ---------- 3. stop ---------- */
// quiet = leaving the screen or the app going to the background: no box (the coins are still paid).
function jamEnd(quiet){
  const p=P(); if(!JAM.on||!p) return;
  JAM.on=false; JAM.ptr={}; STG.state=quiet?'pick':'jamdone';
  $('#jamStop').classList.add('hidden');
  const n=JAM.notes, done=n>=JAM_MIN; let line='';
  if(done){
    p.stats.jams++; if(JAM.loop.own) p.stats.jamOwn++;
    if(dailyPay(p.jam.pay,JAM_DAILY,1)){earn(JAM_COINS,'Jam!');line=`+${JAM_COINS} 🪙`;}
    else {save();line='Jam coins are full for today. Keep jamming for fun ✨';}
  } else line=n?`Play ${JAM_MIN} notes or more for 🪙`:'Tap the circles to play along! 🎵';
  if(quiet){checkStickers();return;}
  SFX.cheer();
  modal(`🎸 ${n?'Great jam!':'Jam time!'}`,`<div style="text-align:center;font-size:18px"><div style="font-size:30px;font-weight:900">🎶 ${n} ${n===1?'note':'notes'}</div>`
    +`${esc(JAM.loop.icon+' '+JAM.loop.name)}<br><b>${line}</b></div>`,
    [{text:'🎵 Loops',cls:'ghost',on:jamPickView},{text:'🎸 Again',cls:'pink',on:()=>jamStart(JAM.loop.id)}]);
  checkStickers();
}

/* ---------- drawing ---------- */
function drawJam(dt){
  const {ctx,W,H}=fit(jamCv); STG.time+=dt; jamTick();
  const L=JAM.loop, sd=L?jamStepDur():0.3, t=jamNow()-jamLat()-JAM.t0, beatF=JAM.on&&t>0?t/(sd*2):0, ph=((beatF%1)+1)%1, onBeat=JAM.on&&t>0?Math.pow(1-ph,3):0;
  const mh=H*0.3, mw=mh*200/270, y0=H*0.34, cx=W/2, lw=Math.min(170,(W-24)/5), yh=H-Math.max(70,H*0.15), pr=Math.min(lw*0.42,H*0.1,70);
  const xs=JAM_PADS.map((_,i)=>cx+(i-2)*lw);
  JAM.g={cx,lw,xs,yh,pr,y0,H};
  JAM.spotT=Math.max(0,JAM.spotT-dt); if(!JAM.spotT) JAM.spot=null;
  stgScene(ctx,W,H,beatF,onBeat,JAM.spot);
  ctx.fillStyle='#5b3a99'; ctx.beginPath(); ctx.ellipse(cx,y0,Math.max(mw*0.9,lw*1.3),H*0.03,0,0,TAU); ctx.fill();
  // the pads: a glowing circle each, in the Music Maker's note colors, with a note on it
  ctx.textAlign='center'; ctx.textBaseline='middle';
  JAM_PADS.forEach((P5,i)=>{const on=JAM.press[i]>0; JAM.press[i]=Math.max(0,JAM.press[i]-dt);
    const r=pr*(on?1.1:1)*(1+onBeat*0.03);
    ctx.globalAlpha=on?0.35:0.12; ctx.fillStyle=P5.c; ctx.beginPath(); ctx.arc(xs[i],yh,r*1.35,0,TAU); ctx.fill();
    ctx.globalAlpha=1; ctx.fillStyle=on?P5.c:'#2f2540'; ctx.strokeStyle=P5.c; ctx.lineWidth=6;
    ctx.beginPath(); ctx.arc(xs[i],yh,r,0,TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle=on?'#2b2235':P5.c; ctx.font=`900 ${Math.round(r*0.95)}px sans-serif`; ctx.fillText('♪',xs[i],yh+r*0.04);});
  // her notes float up toward the stage, and the crowd's words
  JAM.fx=JAM.fx.filter(o=>(o.t+=dt)<(o.big?1.4:1.1));
  JAM.fx.forEach(o=>{
    if(o.note){const k=o.t/1.1, y=o.y-(o.y-y0)*k*0.9, x=o.x+Math.sin(o.wob+o.t*6)*pr*0.25;
      ctx.globalAlpha=1-k; ctx.fillStyle=o.col; ctx.font=`900 ${Math.round(pr*0.7*(1-k*0.4))}px sans-serif`; ctx.fillText('♪',x,y);}
    else {const k=o.t/1.4, s=Math.round(Math.min(W,H)*0.08*(1+0.2*Math.sin(Math.min(1,o.t*4)*Math.PI)));
      ctx.globalAlpha=k<0.7?1:1-(k-0.7)/0.3; ctx.font=`900 ${s}px sans-serif`; ctx.lineWidth=6; ctx.strokeStyle='#2b2235';
      ctx.strokeText(o.txt,o.x,o.y-o.t*30); ctx.fillStyle=o.col; ctx.fillText(o.txt,o.x,o.y-o.t*30);}});
  ctx.globalAlpha=1; ctx.textBaseline='alphabetic';
  if(JAM.on&&JAM.notes===0&&STG.time>0.6){ // a gentle start hint
    ctx.font=`900 ${Math.round(Math.min(W,H)*0.05)}px sans-serif`; ctx.lineWidth=5; ctx.strokeStyle='#2b2235';
    const y=yh-pr*1.9-Math.sin(STG.time*3)*6; ctx.strokeText('Tap the circles! 👇',cx,y); ctx.fillStyle='#fff'; ctx.fillText('Tap the circles! 👇',cx,y);}
  stgBounce(cx,y0,mw,mh,H,JAM.on&&t>0,ph,onBeat);
}

STICKERS.push(
  stk('jam1','stage','🎸','First Jam','circle',`Play a jam of ${JAM_MIN} notes on the Stage (🎸 Jam)`,1,p=>p.stats.jams,1),
  stk('jam10','stage','🎶','Jam Band','scallop','Play 10 jams',10,p=>p.stats.jams,2),
  stk('jamOwn','stage','🎹','My Own Song','heart','Jam over your own 🎹 Music Maker loop',1,p=>p.stats.jamOwn)
);
