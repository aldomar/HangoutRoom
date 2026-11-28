'use strict';
/* =========================================================
   48. DANCE MAKER (v1.47): her buddy dances to music, with moves she picks
   Opened by 💃 Dance in the Music Maker (section 40) and the 💃 tab of the Stage (section 14); Back goes to where she came from.
   A dance is 8 beats: one move per beat ('.' = an empty beat, the buddy just nods). Tap a move to put it in the next empty
   beat, tap a beat to empty it. ▶️ plays the music and the dance goes round and round. While the music plays, tapping a
   move is 🕺 free dance: the buddy does it on the next beat (the dance itself doesn't change).
   Music: 🥁 a plain beat, 🎹 her Music Maker loop, a 💾 saved loop, or a Stage song (played once, Easy chart sounds only).
   The sound is scheduled ahead on the audio clock (like the Stage and the Music Maker); the main loop (section 99) runs
   only while a dance plays. The buddy is drawn once into a picture, and whole-body CSS moves (one beat long) animate it.
   Saved in p.dance {cur, music, slots[3], songs[], pay{day,n}}: cur and each slot are 8 move codes. Move codes
   (h s p w b c j o) and music ids ('beat' 'loop' 'm0'-'m2' or a song id) are saved: never rename them.
   Since v1.80 each saved dance keeps its music in tracks[3] (an id, or a copy of a loop, played as music id 'd0'-'d2'),
   and the room's 💃 Dance emote dances them (see the end of this file).
   Coins: +3 for saving a new dance (3 moves or more), 3 times a day (DN_DAILY), like the Music Maker.
   ========================================================= */
const DN_BEATS=8, DN_COINS=3, DN_DAILY=3, DN_MIN_MOVES=3, DN_EMPTY='.'.repeat(DN_BEATS);
const DN_MOVES={
  h:{icon:'🦘',name:'Hop'}, s:{icon:'↔️',name:'Sway'}, p:{icon:'🌀',name:'Spin',fx:'💫'}, w:{icon:'🐛',name:'Wiggle'},
  b:{icon:'⬇️',name:'Bounce'}, c:{icon:'👏',name:'Clap',fx:'👏'}, j:{icon:'⭐',name:'Star jump',fx:'⭐'}, o:{icon:'🙇',name:'Bow',fx:'💖'}
};
const DN_CODES=Object.keys(DN_MOVES);
// Ready-made dances to start from.
const DN_IDEAS=[
  {icon:'🐰',name:'Bunny Bop',g:'hhbchhbj',music:'beat'},
  {icon:'🦇',name:'Bat Flap',g:'sswwpcjo',music:'bats'},
  {icon:'⭐',name:'Star Show',g:'jcjcppso',music:'starlight'}
];
const DN={playing:false,clock:'perf',t0:0,beat:0.5,kind:'beat',g:null,kit:'soft',ev:[],ei:0,end:0,step:0,nextT:0,
  last:-1,next:null,rounds:0,song:null,from:'room',imgKey:'',img:''};
const dnOk=g=>typeof g==='string'&&g.length===DN_BEATS&&[...g].every(c=>c==='.'||DN_MOVES[c]);
const dnCount=g=>[...g].filter(c=>c!=='.').length;
const dnSaved=p=>p.dance.cur===DN_EMPTY||p.dance.slots.some(s=>s===p.dance.cur);
const dnKinds=g=>new Set([...g].filter(c=>c!=='.')).size;

/* ---------- music ---------- */
// Every music choice she has right now: id, icon, name.
function dnChoices(p){
  const L=[{id:'beat',icon:'🥁',name:'Beat'}];
  if(p.music.cur!==MU_EMPTY) L.push({id:'loop',icon:'🎹',name:'My loop'});
  p.music.slots.forEach((s,i)=>{if(s)L.push({id:'m'+i,icon:'💾',name:'Loop '+(i+1)});});
  p.dance.tracks.forEach((t,i)=>{if(t&&typeof t==='object')L.push({id:'d'+i,icon:'💃',name:'Dance '+(i+1)+' music'});}); // a saved dance's own loop (v1.80)
  SONG_IDS.forEach(id=>L.push({id,icon:SONGS[id].icon,name:SONGS[id].name}));
  return L;
}
const dnMusic=p=>dnChoices(p).find(c=>c.id===p.dance.music)||dnChoices(p)[0];
// The loop behind a music id: 'loop' (the grid now), 'm0'-'m2' (a 💾 loop), 'd0'-'d2' (a saved dance's copy), else null.
function dnLoopSrc(p,id){
  if(id==='loop') return {g:p.music.cur,kit:muKit(p),speed:muSpeed(p)};
  if(/^m[0-2]$/.test(id)) return p.music.slots[+id[1]]||null;
  if(/^d[0-2]$/.test(id)){const t=p.dance.tracks[+id[1]];return t&&typeof t==='object'?t:null;}
  return null;
}
// 🥁 the beat or a loop: what to play and how fast (a song id gives the beat).
function dnLoopOf(p,id){
  const s=dnLoopSrc(p,id);
  if(!s) return {kind:'beat',g:null,beat:60/104};
  return {kind:'loop',g:MU_ROWS.map((_,r)=>[...s.g.slice(r*MU_STEPS,(r+1)*MU_STEPS)].map(Number)),
    kit:MU_KITS[s.kit]?s.kit:'soft',beat:60/MU_SPEEDS[MU_SPEEDS[s.speed]?s.speed:1].bpm};
}
const dnNow=()=>DN.clock==='ac'&&AC?AC.currentTime:performance.now()/1000;
const dnLat=()=>DN.clock==='ac'&&AC?(AC.outputLatency||AC.baseLatency||0)+(DB.settings.stageOffset||0)/1000:0;
function dnPlay(){
  const p=P(); if(!p) return;
  if(!DB.settings.sound) toast('🔇 Sound is off (⚙️ Settings)');
  const a=DB.settings.sound?ac():null, m=dnMusic(p); stopMusic(); muStop(); // the room music rests while she dances
  Object.assign(DN,{ev:[],ei:0,end:0,g:null,song:null,step:0,last:-1,next:null,rounds:0});
  if(SONGS[m.id]){const b=buildSong(m.id,'easy');Object.assign(DN,{kind:'song',song:m.id,ev:b.ev,end:b.end,beat:b.beat});}
  else Object.assign(DN,dnLoopOf(p,m.id));
  DN.clock=a&&a.state==='running'?'ac':'perf'; DN.t0=dnNow()+0.3; DN.nextT=DN.t0; DN.playing=true;
  $('#dnDancer').style.setProperty('--bt',DN.beat.toFixed(3)+'s');
  dnCtl(); wakeLoop();
}
function dnStop(){
  if(!DN.playing) return; DN.playing=false; DN.ev=[]; DN.next=null;
  $$('#dnSlots .dn-slot.now').forEach(e=>e.classList.remove('now')); $$('#dnLights i').forEach(e=>e.classList.remove('on'));
  const d=$('#dnDancer'); if(d){DN_CODES.concat('nod').forEach(c=>d.classList.remove('dm-'+c));d.style.setProperty('--bt','0.5s');}
  if(cur==='dance') dnCtl();
}
// One step of the plain 🥁 beat (8 steps = 4 beats): drum, clap and a soft shaker.
function dnBeatVoice(k,at){if(k%4===0)sKick(at);if(k%4===2)sSnare(at);if(k%2)sHat(at);}
// Called by the main loop while a dance plays: sends the music ahead, and starts each move on the beat she hears.
function dnTick(){
  const p=P(); if(!DN.playing||!p) return;
  const now=dnNow(), live=DN.clock==='ac'&&DB.settings.sound&&AC&&AC.state==='running';
  if(DN.kind==='song'){
    while(DN.ei<DN.ev.length&&DN.ev[DN.ei].t<now-DN.t0+0.2){const e=DN.ev[DN.ei++];
      if(live){const at=AC.currentTime+(DN.t0+e.t-now);if(at>=AC.currentTime-0.01)e.f(Math.max(at,AC.currentTime));}}
  } else {
    if(DN.nextT<now-0.5){dnStop();return;} // the app was paused for a long time: stop rather than rush to catch up
    while(DN.nextT<now+0.15){
      if(live){const at=Math.max(AC.currentTime,AC.currentTime+(DN.nextT-now)), k=DN.step%MU_STEPS;
        if(DN.kind==='beat') dnBeatVoice(k,at); else DN.g.forEach((row,r)=>{if(row[k])muVoice(r,at,DN.kit);});}
      DN.step++; DN.nextT+=DN.beat/2;
    }
  }
  const heard=now-dnLat()-DN.t0;
  if(DN.kind==='song'&&heard>DN.end){dnDone(p);dnStop();return;}
  if(heard<0) return;
  const b=Math.floor(heard/DN.beat+0.02);
  if(b!==DN.last){DN.last=b;dnBeat(p,b);}
}
function dnBeat(p,b){
  const i=b%DN_BEATS;
  if(i===0&&b>0){DN.rounds++;if(DN.rounds===1)dnDone(p);}
  const code=DN.next||p.dance.cur[i]; DN.next=null;
  dnMove(code==='.'?'nod':code,b);
  $$('#dnSlots .dn-slot').forEach((e,k)=>e.classList.toggle('now',k===i));
  $$('#dnLights i').forEach((e,k)=>e.classList.toggle('on',(k+b)%2===0));
}
// After one whole round: a dance to a Stage song counts for the 🎤 Dance Party sticker.
function dnDone(p){
  if(DN.song&&dnCount(p.dance.cur)&&!p.dance.songs.includes(DN.song)){p.dance.songs.push(DN.song);saveSoon();}
}
function dnMove(code,b){
  const d=$('#dnDancer'); if(!d) return;
  DN_CODES.concat('nod').forEach(c=>d.classList.remove('dm-'+c));
  d.style.setProperty('--d',b%2?-1:1); void d.getBoundingClientRect(); d.classList.add('dm-'+code);
  const fx=DN_MOVES[code]&&DN_MOVES[code].fx, box=$('#dnFx'); if(!fx||!box) return;
  box.innerHTML=[0,1,2].map(k=>`<span style="left:${22+k*28}%;animation-delay:${k*0.08}s">${fx}</span>`).join('');
}

/* ---------- screen ---------- */
function dnOpen(from){DN.from=from==='music'||from==='stage'?from:'room';
  const p=P(); if(!p) return;
  // Opened from the Stage: start on a song. From the Music Maker: on her loop (if it has notes).
  if(DN.from==='stage'&&!SONGS[p.dance.music]) p.dance.music=SONG_IDS[0];
  if(DN.from==='music'&&p.music.cur!==MU_EMPTY) p.dance.music='loop';
  show('dance');
}
function dnArt(p){
  const key=JSON.stringify(p.look); if(DN.imgKey===key) return DN.img; DN.imgKey=key;
  const svg=mascotSVG(p.look,null,'width="200" height="270"').replace('>',`><defs>${$('#gdefs').innerHTML}</defs>`);
  DN.img='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); return DN.img;
}
function renderDance(){
  const p=P(); if(!p) return;
  backBtn('#dnBack',DN.from==='music'||DN.from==='stage'?DN.from:'room');
  $('#dnBuddy').src=dnArt(p);
  $('#dnLights').innerHTML=Array.from({length:8},(_,k)=>`<i style="--k:${['#ff8cc6','#ffd166','#8ff0d0','#a97cff'][k%4]}"></i>`).join('');
  $('#dnMoves').innerHTML=DN_CODES.map(c=>`<button class="dn-move" data-move="${c}" aria-label="${DN_MOVES[c].name}">${DN_MOVES[c].icon}<span class="tn">${DN_MOVES[c].name}</span></button>`).join('');
  dnSlots(); dnCtl();
}
function dnSlots(){
  const g=P().dance.cur;
  $('#dnSlots').innerHTML=[...g].map((c,i)=>`<button class="dn-slot${c==='.'?'':' full'}" data-beat="${i}" aria-label="${c==='.'?'Beat '+(i+1)+', empty':DN_MOVES[c].name}">`
    +`<b>${i+1}</b>${c==='.'?'':DN_MOVES[c].icon}</button>`).join('');
}
function dnCtl(){
  const p=P(); if(!p) return; const m=dnMusic(p);
  $('#dnPlay').innerHTML=DN.playing?'⏹️ <span class="tn">Stop</span>':'▶️ <span class="tn">Play</span>';
  $('#dnPlay').setAttribute('aria-label',DN.playing?'Stop':'Play');
  $('#dnMusic').innerHTML=`${m.icon} <span class="tn">${esc(m.name)}</span>`; $('#dnMusic').setAttribute('aria-label','Music: '+m.name);
  $('#dnHint').textContent=DN.playing?'🕺 Tap a move to dance it now!':dnCount(p.dance.cur)?'Tap a beat to take its move out.':'Tap moves to make your dance!';
  $('#dnSaves').innerHTML=p.dance.slots.map((s,i)=>`<button class="mu-slot dn-save${s?' full':''}" data-slot="${i}" aria-label="${s?'Dance '+(i+1):'Save in slot '+(i+1)}">`
    +(s?`<span class="dn-mini">${[...s].slice(0,4).map(c=>c==='.'?'·':DN_MOVES[c].icon).join('')}</span>`:'<span class="mu-plus">💾</span>')+`<b>${i+1}</b></button>`).join('');
}
function dnSet(g){P().dance.cur=g;saveSoon();dnSlots();dnCtl();}
$('#dnMoves').onclick=e=>{
  const b=e.target.closest('[data-move]'), p=P(); if(!b||!p) return; const c=b.dataset.move;
  if(DN.playing){DN.next=c;SFX.click();vibrate(8);return;} // 🕺 free dance: on the next beat
  const g=p.dance.cur, i=g.indexOf('.');
  $('#dnDancer').style.setProperty('--bt','0.5s'); dnMove(c,0); SFX.click();
  if(i<0){toast('All 8 beats are full! Tap a beat to change it.');return;}
  dnSet(g.slice(0,i)+c+g.slice(i+1));
};
$('#dnSlots').onclick=e=>{
  const b=e.target.closest('[data-beat]'), p=P(); if(!b||!p) return; const i=+b.dataset.beat, g=p.dance.cur;
  if(g[i]==='.') return; SFX.click(); dnSet(g.slice(0,i)+'.'+g.slice(i+1));
};
$('#dnPlay').onclick=()=>{SFX.click();if(DN.playing)dnStop();else dnPlay();};
$('#dnMusic').onclick=()=>{
  const p=P(); SFX.click();
  modal('🎵 Pick the music',`<div class="dn-mus">${dnChoices(p).map(c=>`<button class="btn${c.id===dnMusic(p).id?' pink':' ghost'}" data-mus="${c.id}">${c.icon} ${esc(c.name)}</button>`).join('')}</div>`,[{text:'✖',cls:'ghost'}]);
};
$('#modalBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-mus]'); if(!b||cur!=='dance') return;
  const p=P(), was=DN.playing; p.dance.music=b.dataset.mus; save(); closeModal(); SFX.click(); dnStop(); if(was) dnPlay(); dnCtl();
});
$('#dnSaves').onclick=e=>{const b=e.target.closest('[data-slot]');if(b){SFX.click();dnSlot(+b.dataset.slot);}};
$('#dnClear').onclick=()=>{
  SFX.click(); if(P().dance.cur===DN_EMPTY) return;
  modal('🗑️ Clear the dance?','<div style="text-align:center;font-size:17px">Saved dances stay safe in 💾 1 2 3.</div>',
    [{text:'✖ No',cls:'ghost'},{text:'🗑️ Clear',cls:'pink',on:()=>dnSet(DN_EMPTY)}]);
};
$('#dnIdeas').onclick=()=>{
  SFX.click();
  modal('🎁 Dance ideas','<div style="text-align:center;font-size:16px">Start from one of these, then change it!</div>',
    DN_IDEAS.map(z=>({text:z.icon+' '+z.name,cls:'pink',on:()=>dnAsk(()=>{P().dance.music=z.music;dnSet(z.g);})})).concat([{text:'✖',cls:'ghost'}]));
};
$('#dnBack').onclick=()=>{SFX.click();dnBackKey();};
function dnAsk(fn){
  if(dnSaved(P())){fn();return;}
  modal('💃 Your dance is not saved','<div style="text-align:center;font-size:17px">Save it in 💾 1, 2 or 3 first, or load anyway?</div>',
    [{text:'✖ Keep mine',cls:'ghost'},{text:'▶ Load anyway',cls:'pink',on:fn}]);
}
// 🎵 A saved dance keeps its music (v1.80): p.dance.tracks[i] is null (older dances), 'beat' or a song id, or a copy of a loop.
// The music she has on now, as a track to keep: an id, or a copy of the loop (so changing the loop later doesn't change the dance).
function dnTrackNow(p){const id=dnMusic(p).id, s=dnLoopSrc(p,id);return s?{g:s.g,kit:s.kit,speed:s.speed}:id;}
// A saved dance's music as a music id ('' = none kept, or a song id that no longer exists).
function dnTrackId(p,i){const t=p.dance.tracks[i];
  return !t?'':typeof t==='object'?'d'+i:t==='beat'||SONGS[t]?t:'';}
function dnSlot(i){
  const p=P(), s=p.dance.slots[i];
  if(!s){dnSaveSlot(i);return;}
  const tid=dnTrackId(p,i), tm=tid&&dnChoices(p).find(c=>c.id===tid);
  modal(`💾 Dance ${i+1}`,`<div class="dn-big">${[...s].map(c=>c==='.'?'·':DN_MOVES[c].icon).join(' ')}</div>`
    +(tm?`<div class="dn-track">🎵 ${tm.icon} ${esc(tm.name)}</div>`:''),
    [{text:'▶ Load',cls:'pink',on:()=>dnAsk(()=>{const was=DN.playing;dnStop();if(tm)p.dance.music=tid;dnSet(s);if(was)dnPlay();})},
     {text:'💾 Save mine here',on:()=>dnSaveSlot(i)},{text:'✖',cls:'ghost'}]);
}
function dnSaveSlot(i){
  const p=P(), g=p.dance.cur;
  if(dnCount(g)<DN_MIN_MOVES){toast('Add a few more moves first! 💃');return;}
  const fresh=p.dance.slots[i]!==g; p.dance.slots[i]=g; p.dance.tracks[i]=dnTrackNow(p); // new music alone pays nothing
  if(fresh&&dailyPay(p.dance.pay,DN_DAILY,1)){earn(DN_COINS,'Dance!');toast(`Saved in 💾 ${i+1}! 💃`);}
  else{save();toast(fresh?`Saved in 💾 ${i+1}! 💃 Dance coins are done for today. Keep dancing for fun!`:`Saved in 💾 ${i+1}! 💃`);}
  SFX.happy(); dnCtl();
}
function dnBackKey(){show(DN.from==='music'||DN.from==='stage'?DN.from:'room');}
$('#muDance').onclick=()=>{SFX.click();dnOpen('music');};
$('#stgTabs').addEventListener('click',e=>{if(e.target.closest('[data-dance]')&&STG.state==='pick'){SFX.click();dnOpen('stage');}});

/* ---------- 💃 dancing in the room (v1.80) ---------- */
// The room's 💃 Dance emote (section 31) plays her saved dances in turn: one round of 8 beats on the buddy (#mascotG),
// with the music saved with that dance (a Stage song: the 8 beats after its intro). One setTimeout a beat plays that beat's sound and
// starts its move (.rm-* in app.css: 2D and in px, because #mascotG is SVG), so rdStop() cuts both off. No main loop.
const RD={n:0,t:[]};
const RD_CLS=DN_CODES.concat('nod').map(c=>'rm-'+c);
function rdStop(){
  if(!RD.t.length) return; RD.t.forEach(clearTimeout); RD.t=[];
  const g=$('#mascotG'); if(g) g.classList.remove(...RD_CLS);
}
// Returns the slot number it dances (1-3), or 0 when she has no saved dance (the old Dance emote then plays).
function rdDance(){
  const p=P(); if(!p) return 0;
  const saved=p.dance.slots.map((s,i)=>s&&dnOk(s)?i:-1).filter(i=>i>=0); if(!saved.length) return 0;
  rdStop(); const i=saved[RD.n%saved.length], g=p.dance.slots[i]; RD.n++;
  // The dance's own music, or the Dance Maker's music for a dance saved before v1.80.
  // A Stage song: its 8 beats right after the 2 intro bars (the intro is only drums), at its own speed.
  const id=dnTrackId(p,i)||dnMusic(p).id, sg=SONGS[id]?buildSong(id,'easy'):null;
  const m=sg?{kind:'song',beat:sg.beat}:dnLoopOf(p,id), bt=m.beat; stopMusic();
  for(let b=0;b<DN_BEATS;b++) RD.t.push(setTimeout(()=>{
    const a=DB.settings.sound?ac():null;
    if(a&&sg){const t0=sg.first+b*bt; sg.ev.forEach(e=>{if(e.t>=t0-0.001&&e.t<t0+bt-0.001)e.f(a.currentTime+0.02+e.t-t0);});}
    else if(a) for(let h=0;h<2;h++){const k=(b*2+h)%MU_STEPS, at=a.currentTime+0.02+h*bt/2;
      if(m.kind==='beat') dnBeatVoice(k,at); else m.g.forEach((row,r)=>{if(row[k])muVoice(r,at,m.kit);});}
    const el=$('#mascotG'); if(!el) return;
    el.classList.remove(...RD_CLS,'hop'); el.style.setProperty('--d',b%2?-1:1); el.style.setProperty('--bt',bt.toFixed(3)+'s');
    void el.getBoundingClientRect(); el.classList.add('rm-'+(g[b]==='.'?'nod':g[b]));
  },Math.round(b*bt*1000)));
  RD.t.push(setTimeout(()=>{rdStop();if(cur==='room')startMusic();},Math.round(DN_BEATS*bt*1000)+80));
  return i+1;
}

STICKERS.push(
  stk('dance1','stage','💃','First Dance','star','Save a dance in 💃 Dance Maker (in the 🎹 Music Maker or the Stage)',1,p=>p.dance.slots.filter(Boolean).length),
  stk('dance8','stage','🕺','All the Moves','heart','Use all 8 moves in one dance',8,p=>Math.max(dnKinds(p.dance.cur),...p.dance.slots.map(s=>s?dnKinds(s):0))),
  stk('dance3','stage','🪩','Dance Party','scallop','Dance to 3 different Stage songs',3,p=>p.dance.songs.length)
);
