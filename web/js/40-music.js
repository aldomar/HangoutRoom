'use strict';
/* =========================================================
   40. MUSIC MAKER (v1.38): a beat-and-melody grid on the Cozy Loft's 🎹 keyboard
   8 steps across. 5 melody rows use only C D E G A (a pentatonic scale), so any pattern sounds nice; 4 beat rows
   (bell, shaker, clap, drum). Tap a square to turn it on or off, or slide a finger to paint a row.
   ▶️ plays the loop round and round. Notes are scheduled a little ahead on the audio clock (like the Stage), and the
   main loop (section 99) runs only while a loop is playing, to move the light along the steps.
   Saved in p.music {kit, speed, cur, slots[3], pay{day,n}}: cur and each slot's g are 72 characters of 0/1
   (9 rows x 8 steps, row by row). Kit ids (soft chip dreamy) and speed numbers (0-2) are saved: never rename them.
   Coins: +3 for saving a new loop (3 notes or more, different from what was in that slot), 3 times a day (MU_DAILY).
   ========================================================= */
const MU_STEPS=8, MU_COINS=3, MU_DAILY=3, MU_MIN_NOTES=3;
// Rows from top to bottom. m = MIDI note (C5=72); d = a drum voice.
const MU_ROWS=[
  {m:81,c:'#ff8cc6',l:'A'},{m:79,c:'#ffab7a',l:'G'},{m:76,c:'#ffd166',l:'E'},{m:74,c:'#8ff0d0',l:'D'},{m:72,c:'#7fc8ff',l:'C'},
  {d:'bell',c:'#e2d8f5',i:'🔔',n:'Bell'},{d:'shake',c:'#ffe6a8',i:'🥚',n:'Shaker'},{d:'clap',c:'#ffc2dd',i:'👏',n:'Clap'},{d:'kick',c:'#c9a7ff',i:'🥁',n:'Drum'}
];
const MU_KITS={
  soft:{icon:'🎹',name:'Soft',wave:'triangle',vol:0.2,dur:0.35},
  chip:{icon:'👾',name:'Chip',wave:'square',vol:0.07,dur:0.16},
  dreamy:{icon:'🌙',name:'Dreamy',wave:'sine',vol:0.17,dur:0.9,bell:1}
};
const MU_SPEEDS=[{icon:'🐢',name:'Slow',bpm:84},{icon:'🚶',name:'Medium',bpm:104},{icon:'🐇',name:'Fast',bpm:126}];
// Ready-made loops to start from (rows top to bottom, 8 steps each).
const MU_IDEAS=[
  {icon:'🦇',name:'Bat Bop',kit:'chip',speed:2,rows:['00000010','00100000','10001000','00000100','01000001','10101010','00000000','00100010','10001000']},
  {icon:'🐰',name:'Bunny Hop',kit:'soft',speed:1,rows:['00001000','00010000','10100000','00000010','01000101','00000000','10101010','00100010','10011000']},
  {icon:'⭐',name:'Sleepy Stars',kit:'dreamy',speed:0,rows:['10000000','00001000','00100000','00000010','00000000','10001000','00000000','00000000','10000000']}
];
const MU_EMPTY='0'.repeat(MU_ROWS.length*MU_STEPS);
const MU={g:null,playing:false,clock:'perf',step:0,nextT:0,q:[],shown:-1,drag:null};
const muKit=p=>MU_KITS[p.music.kit]?p.music.kit:'soft';
const muSpeed=p=>MU_SPEEDS[p.music.speed]?p.music.speed:1;
const muStr=()=>MU.g.map(r=>r.join('')).join('');
const muLoad=s=>{MU.g=MU_ROWS.map((_,r)=>[...s.slice(r*MU_STEPS,(r+1)*MU_STEPS)].map(Number));};
const muNotes=s=>(s.match(/1/g)||[]).length;
const muSaved=p=>p.music.cur===MU_EMPTY||p.music.slots.some(x=>x&&x.g===p.music.cur);

/* ---------- sound ---------- */
function muVoice(r,at,kit){
  const R=MU_ROWS[r], K=MU_KITS[kit];
  if(R.m){sTone(mf(R.m),at,K.dur,K.wave,K.vol);if(K.bell)sTone(mf(R.m+12),at,K.dur*0.6,'sine',K.vol*0.3);}
  else if(R.d==='kick') sKick(at);
  else if(R.d==='clap') sSnare(at);
  else if(R.d==='shake') sNoise(at,0.07,0.09,'bandpass',5200);
  else sTone(mf(96),at,0.25,'sine',0.06);
}
function muPreview(r){ // the sound of one square, when she turns it on while the loop is stopped
  if(MU.playing||!DB.settings.sound||!ac()) return;
  muVoice(r,AC.currentTime+0.01,muKit(P()));
}
const muNow=()=>MU.clock==='ac'&&AC?AC.currentTime:performance.now()/1000;
const muLat=()=>MU.clock==='ac'&&AC?(AC.outputLatency||AC.baseLatency||0)+(DB.settings.stageOffset||0)/1000:0;
function muPlay(){
  const p=P(); if(!p) return;
  if(!DB.settings.sound) toast('🔇 Sound is off (⚙️ Settings)');
  const a=DB.settings.sound?ac():null; stopMusic(); // the room music rests while her loop plays
  MU.playing=true; MU.clock=a&&a.state==='running'?'ac':'perf'; MU.step=0; MU.nextT=muNow()+0.1; MU.q=[];
  muCtl(); wakeLoop();
}
function muStop(){if(!MU.playing)return;MU.playing=false;MU.q=[];muShow(-1);muCtl();}
// Called by the main loop while a loop plays: schedules the next steps, and lights up the step she is hearing.
function muTick(){
  const p=P(); if(!MU.playing||!p) return;
  const now=muNow(), sd=60/MU_SPEEDS[muSpeed(p)].bpm/2, kit=muKit(p), live=MU.clock==='ac'&&DB.settings.sound;
  if(MU.nextT<now-0.2) MU.nextT=now+0.05; // after a long pause, start again from now (no burst of notes)
  while(MU.nextT<now+0.15){
    if(live) MU.g.forEach((row,r)=>{if(row[MU.step])muVoice(r,Math.max(MU.nextT,AC.currentTime),kit);});
    MU.q.push([MU.nextT,MU.step]); MU.step=(MU.step+1)%MU_STEPS; MU.nextT+=sd;
  }
  const heard=now-muLat();
  while(MU.q.length>1&&MU.q[1][0]<=heard) MU.q.shift();
  muShow(MU.q.length&&MU.q[0][0]<=heard?MU.q[0][1]:-1);
}
function muShow(c){
  if(c===MU.shown) return; MU.shown=c;
  $$('#muGrid .mc.now').forEach(e=>e.classList.remove('now'));
  if(c>=0) $$(`#muGrid .mc[data-c="${c}"]`).forEach(e=>e.classList.add('now'));
}

/* ---------- screen ---------- */
function renderMusic(){
  const p=P(); if(!p) return;
  muLoad(p.music.cur); MU.shown=-1;
  $('#muGrid').innerHTML=MU_ROWS.map((R,r)=>`<div class="mu-lab${R.m?' note':''}" style="--k:${R.c}" aria-label="${R.m?'Note '+R.l:R.n}">${R.m?R.l:R.i}</div>`
    +MU.g[r].map((v,c)=>`<div class="mc${v?' on':''}${c>=4?' b2':''}${R.d?' drum':''}" data-r="${r}" data-c="${c}" style="--k:${R.c}"></div>`).join('')).join('');
  muCtl();
}
function muCtl(){
  const p=P(); if(!p) return;
  $('#muPlay').innerHTML=MU.playing?'⏹️ <span class="tn">Stop</span>':'▶️ <span class="tn">Play</span>';
  $('#muPlay').setAttribute('aria-label',MU.playing?'Stop':'Play');
  $('#muSpeed').innerHTML=MU_SPEEDS.map((s,i)=>`<button class="tab mu-b${i===muSpeed(p)?' on':''}" data-speed="${i}" aria-label="${s.name}">${s.icon}</button>`).join('');
  $('#muKit').innerHTML=Object.entries(MU_KITS).map(([k,K])=>`<button class="tab mu-b${k===muKit(p)?' on':''}" data-kit="${k}" aria-label="${K.name} sound">${K.icon}</button>`).join('');
  $('#muSlots').innerHTML=p.music.slots.map((s,i)=>`<button class="mu-slot${s?' full':''}" data-slot="${i}" aria-label="${s?'Loop '+(i+1):'Save in slot '+(i+1)}">`
    +(s?muMini(s.g):'<span class="mu-plus">💾</span>')+`<b>${i+1}</b></button>`).join('');
}
// A tiny picture of a saved loop (no reading needed).
function muMini(g){
  return `<svg viewBox="0 0 ${MU_STEPS*6} ${MU_ROWS.length*6}">`+[...g].map((v,k)=>{const r=Math.floor(k/MU_STEPS),c=k%MU_STEPS;
    return `<rect x="${c*6+0.5}" y="${r*6+0.5}" width="5" height="5" rx="1.2" fill="${v==='1'?MU_ROWS[r].c:'#4b3a66'}"/>`;}).join('')+'</svg>';
}
function muSet(el,on){
  const r=+el.dataset.r, c=+el.dataset.c; if(!!MU.g[r][c]===on) return;
  MU.g[r][c]=on?1:0; el.classList.toggle('on',on); if(on) muPreview(r);
  P().music.cur=muStr(); saveSoon();
}
const muGrid=$('#muGrid');
muGrid.addEventListener('pointerdown',e=>{
  const el=e.target.closest('.mc'); if(!el||!P()) return;
  MU.drag={id:e.pointerId,on:!el.classList.contains('on')}; muSet(el,MU.drag.on);
  try{muGrid.setPointerCapture(e.pointerId);}catch(_){} e.preventDefault();
});
muGrid.addEventListener('pointermove',e=>{ // slide a finger to paint (or rub out) more squares
  if(!MU.drag||MU.drag.id!==e.pointerId) return;
  const t=document.elementFromPoint(e.clientX,e.clientY), el=t&&t.closest&&t.closest('#muGrid .mc'); if(el) muSet(el,MU.drag.on);
});
const muUp=e=>{if(MU.drag&&MU.drag.id===e.pointerId)MU.drag=null;};
muGrid.addEventListener('pointerup',muUp); muGrid.addEventListener('pointercancel',muUp);
$('#muPlay').onclick=()=>{SFX.click();if(MU.playing)muStop();else muPlay();};
$('#muSpeed').onclick=e=>{const b=e.target.closest('[data-speed]');if(!b)return;P().music.speed=+b.dataset.speed;save();SFX.click();muCtl();};
$('#muKit').onclick=e=>{const b=e.target.closest('[data-kit]');if(!b)return;P().music.kit=b.dataset.kit;save();SFX.click();muCtl();muPreview(2);};
$('#muSlots').onclick=e=>{const b=e.target.closest('[data-slot]');if(b){SFX.click();muSlot(+b.dataset.slot);}};
$('#muClear').onclick=()=>{
  SFX.click(); if(P().music.cur===MU_EMPTY) return;
  modal('🗑️ Clear all the notes?','<div style="text-align:center;font-size:17px">Saved loops stay safe in 💾 1 2 3.</div>',
    [{text:'✖ No',cls:'ghost'},{text:'🗑️ Clear',cls:'pink',on:()=>muUse(MU_EMPTY)}]);
};
$('#muIdeas').onclick=()=>{
  SFX.click();
  modal('🎁 Loop ideas','<div style="text-align:center;font-size:16px">Start from one of these, then change it!</div>',
    MU_IDEAS.map(z=>({text:z.icon+' '+z.name,cls:'pink',on:()=>muAsk(()=>muUse(z.rows.join(''),z.kit,z.speed))})).concat([{text:'✖',cls:'ghost'}]));
};
$('#muBack').onclick=()=>{SFX.click();show('room');};
// Loading something over a loop that isn't saved anywhere asks first.
function muAsk(fn){
  if(muSaved(P())){fn();return;}
  modal('🎵 Your loop is not saved','<div style="text-align:center;font-size:17px">Save it in 💾 1, 2 or 3 first, or load anyway?</div>',
    [{text:'✖ Keep mine',cls:'ghost'},{text:'▶ Load anyway',cls:'pink',on:fn}]);
}
function muUse(g,kit,speed){
  const p=P(); p.music.cur=g; if(kit&&MU_KITS[kit]) p.music.kit=kit; if(MU_SPEEDS[speed]) p.music.speed=speed;
  save(); renderMusic();
}
function muSlot(i){
  const p=P(), s=p.music.slots[i];
  if(!s){muSaveSlot(i);return;}
  modal(`💾 Loop ${i+1}`,`<div class="mu-big">${muMini(s.g)}</div>`,
    [{text:'▶ Load',cls:'pink',on:()=>muAsk(()=>muUse(s.g,s.kit,s.speed))},{text:'💾 Save mine here',on:()=>muSaveSlot(i)},{text:'✖',cls:'ghost'}]);
}
function muSaveSlot(i){
  const p=P(), g=muStr(), n=muNotes(g);
  if(n<MU_MIN_NOTES){toast('Add a few more notes first! 🎵');return;}
  const fresh=!(p.music.slots[i]&&p.music.slots[i].g===g);
  p.music.slots[i]={g,kit:muKit(p),speed:muSpeed(p)};
  if(fresh&&dailyPay(p.music.pay,MU_DAILY,1)){earn(MU_COINS,'Music!');toast(`Saved in 💾 ${i+1}! 🎶`);}
  else{save();toast(fresh?`Saved in 💾 ${i+1}! 🎶 Music coins are done for today. Keep making music for fun!`:`Saved in 💾 ${i+1}! 🎶`);}
  SFX.happy(); muCtl(); crCheck(); // 📻 the first saved loop brings a Boombox (section 71)
}
function muBackKey(){show('room');}

STICKERS.push(
  stk('beat1','stage','🎹','Beat Maker','star','Save a loop in the 🎹 Music Maker (the Loft\'s keyboard)',1,p=>p.music.slots.filter(Boolean).length)
);
