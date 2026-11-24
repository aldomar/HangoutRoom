'use strict';
/* =========================================================
   14. STAGE: tap-to-the-beat rhythm game with original generated songs
   Notes fall down 1-3 lanes toward glowing pads; tap a pad as its note arrives. She can't fail: the song always
   plays to the end, and a tap between notes costs nothing. Song time comes from the audio clock, so taps match
   what she hears; "Sound late?" (settings.stageOffset, ms) fixes slow speakers. Note charts are fixed per song
   and level (no randomness), so she can learn them. The canvas is drawn only while a song is playing.
   Song ids (starlight/bats/sugar) and level ids (easy/medium/hard) are saved: never rename them.
   ========================================================= */
// Melodies are 4 bars of 8 eighth-notes: 0-9 = notes of the song's scale (1 = home note, 0 = the one below it),
// '-' = hold, '.' = rest. A song is: 2 intro bars, its form (A = verse, B = chorus, 4 bars each), 1 outro bar.
const SONGS={
  starlight:{name:'Starlight Pop',icon:'🌟',desc:'Bright and bouncy',bpm:120,scale:[67,72,74,76,77,79,81,83,84,86],lead:'square',leadVol:0.045,
    chords:{A:['C','G','Am','F'],B:['F','G','Em','Am']},
    mel:{A:'5.3.5.65'+'2-..7.5.'+'6.3.1.36'+'4-3-2-..',B:'6.8.8.6.'+'9.7.5.7.'+'3.5.7.5.'+'6---..56'},
    form:'AABBABB',kick:'x...x...',snare:'..x...x.',hat:'xxxxxxxx',bass:'r.r.o.r.'},
  bats:{name:'Midnight Bats',icon:'🦇',desc:'Spooky-cute',bpm:100,scale:[64,69,71,72,74,76,77,79,81,83],lead:'triangle',leadVol:0.1,
    chords:{A:['Am','F','G','E'],B:['Dm','Am','E','Am']},
    mel:{A:'1.3.5.3.'+'6-5.3.1.'+'7.4.2.4.'+'5-2-0...',B:'8.6.4.68'+'5.3.5.8.'+'9-5.2.5.'+'8---....'},
    form:'AABBAB',kick:'x..x..x.',snare:'....x...',hat:'x.x.x.x.',bass:'r..r..o.'},
  sugar:{name:'Sugar Clouds',icon:'☁️',desc:'Soft and dreamy',bpm:88,scale:[60,65,67,69,70,72,74,76,77,79],lead:'sine',leadVol:0.11,echo:1,
    chords:{A:['F','Am','Bb','C'],B:['Dm','Bb','F','C']},
    mel:{A:'1-3-5---'+'7---5-3-'+'4-6-8-6-'+'5---.5.6',B:'8---6-3-'+'6-4-6-8-'+'8-5-3-5-'+'5-7-9---'},
    form:'ABABB',kick:'x.....x.',snare:'....x...',hat:'..x...x.',bass:'r...r...'}
};
const SONG_IDS=Object.keys(SONGS);
// lanes = pads to tap; coins per star; fall = seconds a note takes to reach its pad; win = timing windows ×
const STG_LEVELS={easy:{lanes:1,coins:2,fall:1.9,win:1.35},medium:{lanes:2,coins:3,fall:1.6,win:1.15},hard:{lanes:3,coins:4,fall:1.3,win:1},
  duo:{lanes:2,coins:0,fall:1.9,win:1.35}}; // 👯 Together (v1.42, section 43): never saved as a level
const JUDGE=[['Perfect!',0.06,100,'#ffd166'],['Great!',0.11,70,'#8ff0d0'],['Good',0.17,40,'#ff8cc6']]; // name, seconds early/late, points, color
const LANE_ICONS={1:[['star','#ffd166']],2:[['heart','#ff8cc6'],['star','#ffd166']],3:[['heart','#ff8cc6'],['star','#ffd166'],['bat','#a97cff']]};
let STG={state:'pick',song:null,lvl:'easy',notes:[],ev:[],ei:0,t0:0,clock:'perf',end:0,first:0,beat:0.5,bar:2,score:0,combo:0,maxCombo:0,counts:[0,0,0,0],fx:[],press:[0,0,0],time:0,g:null};
const stgCv=$('#stgCv');

/* ---------- song + note chart builder ---------- */
const NOTE_NO={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function chordNotes(name){ // 'Am' -> [A3, C4, E4] as MIDI numbers
  let r=NOTE_NO[name[0]], i=1; if(name[1]==='b'){r--;i++;} else if(name[1]==='#'){r++;i++;}
  const root=48+(r+12)%12; return [root,root+(name[i]==='m'?3:4),root+7];
}
// Returns the audio events {t, f(at)} and the notes to tap {t, lane}. Times are seconds from the song start.
function buildSong(id,lvl){
  const S=SONGS[id], L=STG_LEVELS[lvl], beat=60/S.bpm, step=beat/2, bar=beat*4, ev=[], mel=[], notes=[];
  const plan=[['I',S.chords.A[0]],['I',S.chords.A[1]]];
  for(const sec of S.form) S.chords[sec].forEach((c,i)=>plan.push([sec,c,i]));
  plan.push(['O',S.chords.A[0]]);
  plan.forEach(([sec,ch,bi],n)=>{
    const t0=n*bar, cn=chordNotes(ch);
    ev.push({t:t0,f:at=>cn.forEach(m=>sTone(mf(m),at,bar*0.95,'triangle',sec==='B'?0.045:0.032))});
    if(sec==='O'){ev.push({t:t0,f:at=>{sKick(at);sTone(mf(cn[0]-12),at,bar,'sine',0.14);sTone(mf(cn[0]+24),at,bar*0.9,S.lead,S.leadVol);}});return;}
    if(n===1) for(let k=0;k<4;k++) ev.push({t:t0+k*beat,f:at=>sTone(k<3?1320:1760,at,0.08,'sine',0.07)}); // count-in: 3, 2, 1, go
    for(let k=0;k<8;k++){
      const t=t0+k*step;
      if(S.hat[k]==='x') ev.push({t,f:sHat});
      if(sec==='I') continue;
      if(S.kick[k]==='x') ev.push({t,f:sKick});
      if(S.snare[k]==='x') ev.push({t,f:sSnare});
      const b=S.bass[k]; if(b!=='.'){const m=cn[0]-12+(b==='o'?12:0);ev.push({t,f:at=>sTone(mf(m),at,step*1.6,'triangle',0.14)});}
    }
    if(sec==='I') return;
    const ph=S.mel[sec].slice(bi*8,bi*8+8);
    for(let k=0;k<8;k++){
      const c=ph[k]; if(c<'0'||c>'9') continue;
      let len=1; while(k+len<8&&ph[k+len]==='-') len++;
      const m=S.scale[+c], t=t0+k*step, dur=len*step*0.95;
      ev.push({t,f:at=>{sTone(mf(m),at,dur,S.lead,S.leadVol);if(S.echo)sTone(mf(m),at+step*3,dur,S.lead,S.leadVol*0.3);}});
      mel.push({t,p:m});
    }
    if(lvl==='easy') for(let j=0;j<4;j++) if(sec==='B'||j%2===0) notes.push({t:t0+j*beat,lane:0}); // steady beats
  });
  if(lvl!=='easy'){
    // Melody notes at least `gap` beats apart; the pitch picks the lane (low notes left, high notes right).
    const gap=lvl==='hard'?0.5:1, fill=lvl==='hard'?1:2, pitches=[...new Set(mel.map(m=>m.p))].sort((a,b)=>a-b);
    let last=-9; mel.forEach(m=>{if(m.t-last>=gap*beat-0.001){notes.push({t:m.t,lane:Math.min(L.lanes-1,Math.floor(pitches.indexOf(m.p)*L.lanes/pitches.length))});last=m.t;}});
    // Long held notes leave gaps: fill them with beats (every 2 beats on Medium, every beat on Hard).
    const melT=notes.map(n=>n.t), fills=[];
    for(let n=2;n<plan.length-1;n++) for(let j=0;j<4;j+=fill){const t=n*bar+j*beat;if(!melT.some(x=>Math.abs(x-t)<fill*beat*0.75))fills.push({t,lane:-1});}
    notes.push(...fills); notes.sort((a,b)=>a.t-b.t);
    notes.forEach((n,i)=>{if(n.lane<0)n.lane=i?(notes[i-1].lane+1)%L.lanes:0;});
  }
  ev.sort((a,b)=>a.t-b.t);
  return {ev,notes:notes.map(n=>({t:n.t,lane:n.lane,r:0})),end:plan.length*bar,first:2*bar,beat,bar};
}

/* ---------- song voices (scheduled ahead on the audio clock) ---------- */
let stageBus=null;
function sBus(){if(!stageBus){stageBus=AC.createGain();stageBus.gain.value=0.85;stageBus.connect(AC.destination);}return stageBus;}
function sTone(f,at,dur,type,vol){
  const o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.setValueAtTime(f,at);
  g.gain.setValueAtTime(0.0001,at); g.gain.exponentialRampToValueAtTime(vol,at+0.015); g.gain.exponentialRampToValueAtTime(0.0001,at+Math.max(0.05,dur));
  o.connect(g); g.connect(sBus()); o.start(at); o.stop(at+dur+0.05);
}
function sNoise(at,dur,vol,type,freq){
  const src=AC.createBufferSource(); src.buffer=noiseBuffer(AC);
  const fl=AC.createBiquadFilter(); fl.type=type; fl.frequency.value=freq; const g=AC.createGain();
  g.gain.setValueAtTime(vol,at); g.gain.exponentialRampToValueAtTime(0.0001,at+dur);
  src.connect(fl); fl.connect(g); g.connect(sBus()); src.start(at,Math.random()*0.5); src.stop(at+dur+0.02);
}
function sKick(at){const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(150,at);o.frequency.exponentialRampToValueAtTime(45,at+0.14);
  g.gain.setValueAtTime(0.45,at);g.gain.exponentialRampToValueAtTime(0.0001,at+0.2);o.connect(g);g.connect(sBus());o.start(at);o.stop(at+0.22);}
function sSnare(at){sNoise(at,0.15,0.22,'bandpass',1800);sTone(220,at,0.08,'triangle',0.07);}
function sHat(at){sNoise(at,0.04,0.08,'highpass',7000);}

/* ---------- ⏸️ pause (v1.74) ---------- */
// Leaving the app mid-song pauses it instead of ending it. The audio clock the song runs on is suspended (99), so the song is
// frozen at STG.pT; coming back shows ⏸️ Paused with ▶ Keep going, then 3-2-1 (STG.paused 'wait' -> 'count' -> ''), and the
// clock starts again right where it stopped. Leaving the song while paused drops the notes already sent to the speaker.
function stPause(){
  if(STG.state!=='play'||STG.paused) return;
  STG.pT=stSongT(); STG.paused='wait'; STG.press=[0,0,0];
  $('#stgPause').classList.remove('hidden');
}
function stGo(){if(STG.paused!=='wait')return;STG.paused='count';STG.cd=performance.now();$('#stgPause').classList.add('hidden');SFX.click();}
function stCountDone(){
  STG.paused='';
  if(AC&&(AC.state==='suspended'||AC.state==='interrupted')) AC.resume();
  if(STG.clock!=='ac') STG.t0=stNow()-stLat()-STG.pT; // the 'ac' clock was frozen with the song; the other one kept going
}
function stUnpause(){
  $('#stgPause').classList.add('hidden'); if(!STG.paused) return; STG.paused='';
  if(stageBus){stageBus.disconnect();stageBus=null;} // the queued notes go nowhere
  if(AC&&!document.hidden) AC.resume();
}
$('#stgGo').onclick=stGo;

/* ---------- clock ---------- */
const stNow=()=>STG.clock==='ac'&&AC?AC.currentTime:performance.now()/1000;
const stLat=()=>(STG.clock==='ac'&&AC?(AC.outputLatency||AC.baseLatency||0):0)+(DB.settings.stageOffset||0)/1000;
const stSongT=()=>stNow()-STG.t0-stLat(); // the song time she is hearing right now

/* ---------- song picker ---------- */
function renderStage(){if(P())stgPickView();}
function stgPickView(){
  stUnpause(); // ⏸️ leaving a paused song (v1.74)
  const p=P(); if(!p) return; STG.state='pick';
  $('#stgPick').classList.remove('hidden'); $('#stgPlay').classList.add('hidden'); $('#stgTabs').classList.remove('hidden');
  $('#stgBack').textContent='⬅ Room'; jamHide(); // 🎸 Jam (section 53)
  $$('#stgTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.lvl===p.stage.level));
  const lv=p.stage.level, n=STG_LEVELS[lv].lanes;
  $('#stgSongs').innerHTML=SONG_IDS.map(id=>{const S=SONGS[id], b=(p.stage.best[id]||{})[lv]||{stars:0,score:0};
    return `<button class="song" data-song="${id}"><span class="si">${S.icon}</span><span><div class="sn">${S.name}</div><div class="sd">${S.desc}${b.score?' · best '+b.score:''}</div>`
      +`<div class="ss">${[1,2,3].map(i=>`<span class="${i<=b.stars?'':'off'}">★</span>`).join('')}</div></span></button>`;}).join('');
  $('#stgHint').textContent=!DB.settings.sound?'🔇 Sounds are off. Turn them on in ⚙️ Settings to hear the songs!'
    :n===1?'Tap anywhere when a star reaches the circle! 🌟':`Tap the ${n} circles when the notes reach them! 🎵`;
  stgBdRow(); // 🎨 the backdrop row (section 51, v1.50)
  tgStagePick(); // 👯 Together marks its tab and names the two players (section 43)
  const o=DB.settings.stageOffset||0; $('#stgLate').textContent=o?(o>0?'+':'')+o+' ms':'0 ms';
}
$('#stgTabs').onclick=e=>{const b=e.target.closest('[data-lvl]');if(!b||STG.state!=='pick')return;TGT.on=false;P().stage.level=b.dataset.lvl;save();SFX.click();stgPickView();};
$('#stgSongs').onclick=e=>{const b=e.target.closest('[data-song]');if(b)stStart(b.dataset.song);};
$('#stgBack').onclick=()=>{SFX.click();if(jamBackKey())return;if(STG.state==='pick')show('room');else stgPickView();};
$$('[data-late]').forEach(b=>b.onclick=()=>{DB.settings.stageOffset=clamp((DB.settings.stageOffset||0)+Number(b.dataset.late),-100,400);save();SFX.click();stgPickView();});

/* ---------- playing ---------- */
function stStart(id){
  const p=P(); if(!p||!SONGS[id]) return;
  const lvl=TGT.on?'duo':p.stage.level, b=buildSong(id,lvl), a=DB.settings.sound?ac():null;
  stopMusic();
  stUnpause(); Object.assign(STG,{state:'play',song:id,lvl,notes:b.notes,ev:b.ev,ei:0,end:b.end,first:b.first,beat:b.beat,bar:b.bar,
    score:0,combo:0,maxCombo:0,counts:[0,0,0,0],fx:[],press:[0,0,0],time:0});
  STG.clock=a&&a.state==='running'?'ac':'perf'; STG.t0=stNow()+0.4;
  $('#stgPick').classList.add('hidden'); $('#stgTabs').classList.add('hidden'); $('#stgPlay').classList.remove('hidden');
  $('#stgBack').textContent='⬅ Songs';
  $('#stgMascot').innerHTML=lvl==='duo'?tgStageBuddies():mascotSVG(p.look); $('#stgMascot').classList.toggle('duo',lvl==='duo');
  stHud(); SFX.click(); tgStageNames();
}
function stgStop(){stUnpause();jamEnd(true);if(STG.state!=='pick')STG.state='pick';} // leaving the screen ends the song (no coins, nothing lost); a jam keeps its coins
function stHud(){
  $('#stgScore').textContent=STG.score?'🎵 '+STG.score:'';
  $('#stgCombo').textContent=STG.combo>=5?STG.combo+' combo!':'';
}
// Tap on a lane at song time t. Returns the rating index (0 Perfect, 1 Great, 2 Good) or -1 if no note was near.
function stTap(lane,t){
  if(STG.state!=='play'||STG.paused) return -1;
  STG.press[lane]=0.18;
  const w=STG_LEVELS[STG.lvl].win, far=JUDGE[JUDGE.length-1][1]*w; let best=null;
  for(const n of STG.notes){if(n.t>t+far)break;if(n.r||n.lane!==lane)continue;if(Math.abs(n.t-t)<=far&&(!best||Math.abs(n.t-t)<Math.abs(best.t-t)))best=n;}
  if(!best) return -1; // a tap between notes is fine
  const d=Math.abs(best.t-t), j=JUDGE.findIndex(J=>d<=J[1]*w);
  best.r=j+1; STG.counts[j]++; STG.score+=JUDGE[j][2]; STG.combo++; STG.maxCombo=Math.max(STG.maxCombo,STG.combo);
  const g=STG.g; if(g){const x=g.xs[lane];STG.fx.push({x,y:g.yh-g.pr*1.4,txt:JUDGE[j][0],col:JUDGE[j][3],t:0});
    for(let k=0;k<5;k++){const a=-Math.PI*(0.15+0.7*Math.random());STG.fx.push({x,y:g.yh,vx:Math.cos(a)*160,vy:Math.sin(a)*220,col:JUDGE[j][3],t:0,spark:1});}}
  if(j===0) vibrate(8);
  stHud(); return j;
}
function stMiss(n){
  n.r=4; STG.counts[3]++; STG.combo=0; stHud();
  const g=STG.g; if(g) STG.fx.push({x:g.xs[n.lane],y:g.yh-g.pr*1.4,txt:'Oops',col:'#cbbbe6',t:0});
}
stgCv.addEventListener('pointerdown',e=>{
  if(STG.state==='done'){stgPickView();return;}
  const g=STG.g; if(STG.state!=='play'||!g) return;
  e.preventDefault();
  const x=e.clientX-stgCv.getBoundingClientRect().left;
  stTap(g.n===1?0:clamp(Math.floor((x-(g.cx-g.lw*g.n/2))/g.lw),0,g.n-1),stSongT());
});

// Stars: 1 for taking part (at least one hit), 2 at 60% of the best possible score, 3 at 85%.
function stFinish(){
  if(STG.lvl==='duo'){tgStageEnd();return;} // 👯 Together (section 43)
  const p=P(); if(!p) return;
  const id=STG.song, lvl=STG.lvl, S=SONGS[id], N=STG.notes.length, c=STG.counts, hits=c[0]+c[1]+c[2];
  const acc=N?STG.score/(100*N):0, stars=hits?(acc>=0.85?3:acc>=0.6?2:1):0, full=N>0&&hits===N;
  STG.state='done';
  if(hits){p.stats.shows++;if(full)p.stats.fullCombos++;}
  const all=p.stage.best[id]=p.stage.best[id]||{}, old=all[lvl]||{stars:0,score:0}, newBest=STG.score>old.score;
  all[lvl]={stars:Math.max(stars,old.stars),score:Math.max(STG.score,old.score)};
  // Stars above her best on this song and level are paid outside the allowance; the rest come out of it (v1.67, section 8).
  const per=STG_LEVELS[lvl].coins, fresh=Math.max(0,stars-old.stars)*per, coins=fresh+gameTake('stage',stars*per-fresh);
  if(coins) earn(coins,'Show!'); else save();
  const mic=giveMic(); SFX.cheer(); if(mic) setTimeout(SFX.buy,400);
  const line=!hits?'Tap the notes when they reach the circles!':full?'FULL COMBO! 🎉':stars===3?'Superstar show! 🌟':stars===2?'Great show! ✨':'Nice show! Keep practising 💜';
  const M=DECOR.goldenMic;
  modal(`🎤 ${'⭐'.repeat(stars)||'🎵'} ${esc(S.name)}`,
    `<div style="text-align:center;font-size:17px">${line}<br><span style="font-size:15px">Perfect ${c[0]} · Great ${c[1]} · Good ${c[2]} · Oops ${c[3]}</span>`
    +`<br>Score ${STG.score}${coins?` · +${coins} 🪙`:''}${newBest&&STG.score?'<br>New best! 🏆':''}`
    +(mic?`<div style="margin-top:10px">You won the <b>Golden Mic</b>! It's in your room 🎤</div><svg viewBox="${M.box}" style="height:120px">${M.d()}</svg>`:'')+'</div>',
    [{text:'🎵 Songs',cls:'ghost',on:stgPickView},{text:'Play again',cls:'pink',on:()=>stStart(id)}]);
  checkBonus(); // e.g. "First Show!" (shown as a message, because the result box is open)
}
// The Golden Mic: 3 stars on Hard on any song puts it in her room, once (stage.mic).
function giveMic(){
  const p=P(); if(!p||p.stage.mic) return false;
  if(!SONG_IDS.some(s=>((p.stage.best[s]||{}).hard||{}).stars>=3)) return false;
  p.stage.mic=true; p.room.items.push(Object.assign({uid:uid(),type:'goldenMic',placed:true},spot('goldenMic'))); save();
  return true;
}

/* ---------- drawing ---------- */
function stIcon(ctx,kind,x,y,r,col){
  ctx.fillStyle=col; ctx.strokeStyle='#2b2235'; ctx.lineWidth=Math.max(2,r*0.12); ctx.lineJoin='round';
  if(kind==='bat'){
    ctx.save(); ctx.translate(x,y);
    for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(0,-r*0.2);ctx.quadraticCurveTo(s*r*0.6,-r*0.9,s*r*1.2,-r*0.35);ctx.quadraticCurveTo(s*r*0.95,-r*0.1,s*r*0.95,r*0.2);
      ctx.quadraticCurveTo(s*r*0.7,r*0.05,s*r*0.55,r*0.35);ctx.quadraticCurveTo(s*r*0.3,r*0.15,0,r*0.4);ctx.closePath();ctx.fill();ctx.stroke();}
    ctx.beginPath(); ctx.arc(0,0,r*0.5,0,TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-r*0.18,-r*0.05,r*0.12,0,TAU); ctx.arc(r*0.18,-r*0.05,r*0.12,0,TAU); ctx.fill();
    ctx.restore(); return;
  }
  ctx.beginPath();
  if(kind==='heart'){ctx.moveTo(x,y+r*0.85);ctx.bezierCurveTo(x-r*1.3,y-r*0.1,x-r*0.6,y-r*1.1,x,y-r*0.45);ctx.bezierCurveTo(x+r*0.6,y-r*1.1,x+r*1.3,y-r*0.1,x,y+r*0.85);}
  else {for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r*0.48:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();}
  ctx.fill(); ctx.stroke();
}
function drawStage(dt){
  if(STG.state==='jam'||STG.state==='jamdone'){drawJam(dt);return;} // 🎸 Jam (section 53, v1.52)
  const {ctx,W,H}=fit(stgCv), L=STG_LEVELS[STG.lvl], n=L.lanes, now=stNow(); STG.time+=dt;
  // send the next bit of the song to the speaker (a little ahead, so it never stutters)
  const live=DB.settings.sound&&AC&&AC.state==='running';
  while(!STG.paused&&STG.ei<STG.ev.length&&STG.ev[STG.ei].t<now-STG.t0+0.2){const e=STG.ev[STG.ei++];if(live){const at=AC.currentTime+(STG.t0+e.t-now);if(at>=AC.currentTime-0.01)e.f(Math.max(at,AC.currentTime));}}
  const t=STG.paused?STG.pT:stSongT(), beatF=t/STG.beat, ph=((beatF%1)+1)%1, onBeat=t>0?Math.pow(1-ph,3):0;
  // layout: Fuzzy at the top, lanes fan out from the stage below Fuzzy down to the pads
  const mh=H*0.3, mw=mh*200/270, y0=H*0.34, yh=H-Math.max(64,H*0.13), lw=Math.min(170,(W-24)/n,W*0.3), cx=W/2;
  const xs=Array.from({length:n},(_,i)=>cx+(i-(n-1)/2)*lw), pr=Math.min(lw*0.36,H*0.075,58);
  STG.g={n,cx,lw,xs,yh,pr};
  stgScene(ctx,W,H,beatF,onBeat,null); ctx.fillStyle='#5b3a99'; ctx.beginPath(); ctx.ellipse(cx,y0,Math.max(mw*0.9,lw*n*0.25),H*0.03,0,0,TAU); ctx.fill();
  // lanes (narrow at the top, like a stage seen from the front) and the pads
  const topX=x=>cx+(x-cx)*0.25;
  xs.forEach((x,i)=>{ctx.fillStyle=i%2?'#ffffff10':'#ffffff1a';ctx.beginPath();
    ctx.moveTo(topX(x-lw/2),y0);ctx.lineTo(topX(x+lw/2),y0);ctx.lineTo(x+lw/2,H);ctx.lineTo(x-lw/2,H);ctx.fill();});
  const ic=LANE_ICONS[n];
  xs.forEach((x,i)=>{const pz=STG.press[i]>0; STG.press[i]=Math.max(0,STG.press[i]-dt);
    ctx.globalAlpha=1; ctx.fillStyle=pz?ic[i][1]:'#2f2540'; ctx.strokeStyle=ic[i][1]; ctx.lineWidth=5;
    ctx.beginPath(); ctx.arc(x,yh,pr*(pz?1.08:1),0,TAU); ctx.fill(); ctx.stroke();
    ctx.globalAlpha=pz?1:0.45; stIcon(ctx,ic[i][0],x,yh,pr*0.5,pz?'#fff':ic[i][1]); ctx.globalAlpha=1;});
  // notes: miss the ones that went past, draw the ones on the way
  const far=JUDGE[JUDGE.length-1][1]*L.win;
  for(const no of STG.notes){
    if(no.t>t+L.fall) break;
    if(no.r) continue;
    if(t-no.t>far){stMiss(no);continue;}
    const f=1-(no.t-t)/L.fall, x=topX(xs[no.lane])+(xs[no.lane]-topX(xs[no.lane]))*f, y=y0+(yh-y0)*f;
    stIcon(ctx,ic[no.lane][0],x,y,pr*(0.4+0.45*Math.min(1,f)),ic[no.lane][1]);
  }
  // ratings and sparkles
  STG.fx=STG.fx.filter(o=>(o.t+=dt)<0.7);
  ctx.textAlign='center'; ctx.font=`900 ${Math.round(Math.max(18,pr*0.55))}px sans-serif`;
  STG.fx.forEach(o=>{ctx.globalAlpha=1-o.t/0.7;
    if(o.spark){ctx.fillStyle=o.col;ctx.beginPath();ctx.arc(o.x+o.vx*o.t,o.y+o.vy*o.t+300*o.t*o.t,4,0,TAU);ctx.fill();}
    else {ctx.lineWidth=4;ctx.strokeStyle='#2b2235';ctx.strokeText(o.txt,o.x,o.y-o.t*40);ctx.fillStyle=o.col;ctx.fillText(o.txt,o.x,o.y-o.t*40);}});
  ctx.globalAlpha=1;
  // count-in on the second intro bar: 3, 2, 1, Go!
  if(t<STG.first){const k=Math.floor((t-STG.bar)/STG.beat);
    const txt=t<STG.bar?'Get ready! 🎵':['3','2','1','Go!'][clamp(k,0,3)];
    ctx.font=`900 ${Math.round(Math.min(W,H)*0.09)}px sans-serif`; ctx.lineWidth=6; ctx.strokeStyle='#2b2235';
    ctx.strokeText(txt,cx,H*0.6); ctx.fillStyle='#fff'; ctx.fillText(txt,cx,H*0.6);}
  if(STG.paused==='count'){const k=Math.floor((performance.now()-STG.cd)/1000); // ⏸️ 3-2-1, then the song carries on (v1.74)
    if(k>=3) stCountDone();
    else {ctx.fillStyle='#0008';ctx.fillRect(0,0,W,H);ctx.font=`900 ${Math.round(Math.min(W,H)*0.16)}px sans-serif`;ctx.lineWidth=8;ctx.strokeStyle='#2b2235';
      ctx.strokeText(String(3-k),cx,H*0.6);ctx.fillStyle='#ffd166';ctx.fillText(String(3-k),cx,H*0.6);}}
  stgBounce(cx,y0,mw,mh,H,t>0&&!STG.paused,ph,onBeat);
  if(STG.state==='play'&&!STG.paused&&t>STG.end) stFinish();
}
// The stage behind a song or a 🎸 Jam (v1.52): her backdrop, swinging spotlights (spot = one color for all three, or null)
// and a row of lights that flash on the beat.
function stgScene(ctx,W,H,beatF,onBeat,spot){
  stgBackdrop(ctx,W,H); // 🎨 her backdrop, drawn once into a hidden canvas (section 51, v1.50)
  ['#ff8cc6','#8ff0d0','#ffd166'].forEach((c,i)=>{const a=Math.sin(STG.time*0.7+i*2.1)*0.35, bx=W*(0.15+i*0.35), len=H*1.1;
    ctx.globalAlpha=0.1+onBeat*0.06; ctx.fillStyle=spot||c; ctx.beginPath(); ctx.moveTo(bx,0);
    ctx.lineTo(bx+Math.sin(a-0.14)*len,Math.cos(a-0.14)*len); ctx.lineTo(bx+Math.sin(a+0.14)*len,Math.cos(a+0.14)*len); ctx.fill();});
  ctx.globalAlpha=1;
  const cols=['#ff8cc6','#ffd166','#8ff0d0','#a97cff'], nl=Math.max(5,Math.round(W/70));
  for(let i=0;i<nl;i++){ctx.globalAlpha=0.35+0.65*((i+Math.floor(beatF))%2?onBeat:0.2);ctx.fillStyle=cols[i%4];ctx.beginPath();ctx.arc((i+0.5)*W/nl,10,6,0,TAU);ctx.fill();}
  ctx.globalAlpha=1;
}
// Her buddy bounces to the beat (moving the whole picture is cheap; the fuzz filter is not redrawn).
function stgBounce(cx,y0,mw,mh,H,going,ph,onBeat){
  const hop=going?Math.sin(ph*Math.PI)*H*0.025:0, sq=going?1+onBeat*0.05:1;
  $('#stgMascot').style.transform=`translate(${(cx-mw/2).toFixed(1)}px,${(y0-mh*0.97-hop).toFixed(1)}px) scale(${(2-sq).toFixed(3)},${sq.toFixed(3)})`;
}
