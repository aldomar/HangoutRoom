'use strict';
/* =====================================================================
   71. 📻 Creations in the room (v1.77)
   Things she made or finished show up as room prizes (award:1: never in the Shop, never given away):
   - 🤖 Code Lab robots: one per Code Lab level (CR_BOTS, by CODE_LEVELS order), when every puzzle of that level is solved.
     They stand in the Loft (p.room2), in front of the computer desk. Given once: code.prizes[] holds the level ids.
   - 📚 Brain Shelf: given the first time any Brain Games level is finished (brain.shelf), by the Backyard chalkboard (p.room3).
     It is drawn from her progress, so its 🎀 Easy / 🏆 Medium / ⭐ Hard spots for each game fill in by themselves.
   - 📻 Boombox: put in My Stuff the first time she saves a Music Maker loop (music.box). Tapping it in the room (not while
     decorating) plays a saved loop twice through with its own kit and speed; the next tap plays her next saved loop.
   crCheck() gives whatever is due. It runs when the Room, Code Lab, Brain Games or Music Maker opens (show, 09) and after a loop
   is saved (40), so rooms that finished levels before v1.77 get their prizes too. Prize ids are saved: never rename them.
   ===================================================================== */
const CR_BOTS=['codeBotEasy','codeBotMedium','codeBotHard','codeBotMove','codeBotIf','codeBotChallenge']; // by CODE_LEVELS order
const CR_BOT_LVLS=['easy','medium','hard','move','if','challenge'];
const CR_BOT_COLS=['#8ff0d0','#7fc8ff','#ffd166','#c9a7ff','#ff9ec8','#ffc83d'];
// 🤖 A little robot; k = 0…5 adds a little more each level (wheels, a star, a cape, a ❓ screen, a gold crown).
function crBot(k){
  const c=CR_BOT_COLS[k], L=st('#2b2235',3);
  let s=`<ellipse cx="0" cy="0" rx="30" ry="6" fill="#00000030"/>`;
  if(k>=3) s+=`<path d="M-20 -56 Q-34 -24 -26 -6 L26 -6 Q34 -24 20 -56Z" fill="#a97cff" ${L}/>`; // ✨ My Move: a cape
  s+=k>=1?`<circle cx="-14" cy="-6" r="7" fill="#4a3b66" ${L}/><circle cx="14" cy="-6" r="7" fill="#4a3b66" ${L}/>`:`<rect x="-16" y="-12" width="10" height="12" rx="3" fill="#4a3b66" ${L}/><rect x="6" y="-12" width="10" height="12" rx="3" fill="#4a3b66" ${L}/>`;
  s+=`<rect x="-22" y="-50" width="44" height="40" rx="8" fill="${c}" ${L}/>`;
  s+=k===4?`<rect x="-12" y="-42" width="24" height="22" rx="4" fill="#2b2340"/><text x="0" y="-25" text-anchor="middle" font-size="18" font-weight="900" fill="#ff9ec8">?</text>`
    :`<rect x="-12" y="-42" width="24" height="16" rx="4" fill="#2b2340"/><circle cx="-5" cy="-34" r="2.5" fill="#8ff0d0"/><circle cx="5" cy="-34" r="2.5" fill="#8ff0d0"/>`;
  s+=`<rect x="-18" y="-84" width="36" height="32" rx="10" fill="${c}" ${L}/><circle cx="-7" cy="-68" r="5" fill="#fff" ${st('#2b2235',2)}/><circle cx="7" cy="-68" r="5" fill="#fff" ${st('#2b2235',2)}/>`;
  s+=`<circle cx="-7" cy="-68" r="2" fill="#2b2235"/><circle cx="7" cy="-68" r="2" fill="#2b2235"/><path d="M-6 -59 Q0 -55 6 -59" fill="none" ${st('#2b2235',2)}/>`;
  s+=`<path d="M0 -84 L0 -94" fill="none" ${L}/>`;
  s+=k>=2?`<path d="${starPath(0,-99,8,3.5)}" fill="#ffd166" ${st('#2b2235',2)}/>`:`<circle cx="0" cy="-97" r="4" fill="#ff8cc6" ${st('#2b2235',2)}/>`;
  if(k===5) s+=`<path d="M-14 -84 L-14 -94 L-7 -88 L0 -96 L7 -88 L14 -94 L14 -84Z" fill="#ffc83d" ${st('#a8730f',2)}/>`; // 🧠 Challenge: a crown
  return s;
}
const CR_BOT_NAMES=['Beep','Loop','Twinkle','Swish','Hmm','Captain Byte'];
CR_BOTS.forEach((k,i)=>{DECOR[k]={name:`${CR_BOT_NAMES[i]} the Robot`,price:0,award:1,box:'-44 -112 88 120',d:()=>crBot(i)};});
// 📚 The Brain Shelf: one row per Brain game (its color), 3 spots: 🎀 Easy, 🏆 Medium, ⭐ Hard.
function crShelf(){
  const p=P(), games=Object.keys(BRAIN_GAMES), n=games.length, h=n*18+20, L=st('#5a3a22',3);
  let s=`<ellipse cx="0" cy="0" rx="86" ry="8" fill="#00000030"/><rect x="-80" y="${-h-8}" width="160" height="${h}" rx="8" fill="#a0683d" ${L}/>`;
  s+=`<rect x="-74" y="${-h-2}" width="148" height="${h-12}" rx="4" fill="#7a4b2a"/>`;
  games.forEach((g,i)=>{const y=-h+6+i*18, G=BRAIN_GAMES[g];
    s+=`<rect x="-74" y="${y+14}" width="148" height="3" fill="#c08a5a"/><circle cx="-58" cy="${y+7}" r="6" fill="${G.color||'#ffd166'}" ${st('#2b2235',1.5)}/>`;
    BRAIN_LVLS.forEach((l,j)=>{const x=-26+j*34, on=!!p&&brLevelDone(p,g,l), f=on?['#ff8cc6','#d8dde6','#ffd166'][j]:'none', o=on?'1':'.35';
      s+=j===0?`<path d="M${x-8} ${y+2} L${x} ${y+7} L${x-8} ${y+12}Z M${x+8} ${y+2} L${x} ${y+7} L${x+8} ${y+12}Z" fill="${f}" opacity="${o}" ${st('#2b2235',1.5)}/>`
        :j===1?`<path d="M${x-6} ${y+1} H${x+6} V${y+6} Q${x+6} ${y+10} ${x} ${y+10} Q${x-6} ${y+10} ${x-6} ${y+6}Z M${x-4} ${y+13} H${x+4}" fill="${f}" opacity="${o}" ${st('#2b2235',1.5)}/>`
        :`<path d="${starPath(x,y+7,7,3)}" fill="${f}" opacity="${o}" ${st('#2b2235',1.5)}/>`;});});
  return s+`<rect x="-54" y="${-h-26}" width="108" height="20" rx="6" fill="#fff3d6" ${st('#5a3a22',2)}/><text x="0" y="${-h-11}" text-anchor="middle" font-size="13" font-weight="900" fill="#5a3a22">BRAIN SHELF</text>`;
}
DECOR.brainShelf={name:'Brain Shelf',price:0,award:1,box:'-92 -200 184 206',d:()=>crShelf()};
// 📻 The boombox
DECOR.boombox={name:'Boombox',price:0,award:1,box:'-80 -96 160 102',d:()=>{const L=st('#2b2235',3);
  return `<ellipse cx="0" cy="0" rx="70" ry="7" fill="#00000030"/><g class="bb"><path d="M-44 -66 Q-44 -90 -20 -90 H20 Q44 -90 44 -66" fill="none" ${st('#2b2235',6)}/>`
    +`<rect x="-66" y="-68" width="132" height="64" rx="12" fill="#ff8cc6" ${L}/><circle cx="-38" cy="-36" r="20" fill="#3b2f52" ${L}/><circle cx="-38" cy="-36" r="8" fill="#8ff0d0"/>`
    +`<circle cx="38" cy="-36" r="20" fill="#3b2f52" ${L}/><circle cx="38" cy="-36" r="8" fill="#8ff0d0"/><rect x="-14" y="-56" width="28" height="18" rx="3" fill="#2b2340" ${st('#2b2235',2)}/>`
    +`<circle cx="-6" cy="-47" r="3" fill="#ffd166"/><circle cx="6" cy="-47" r="3" fill="#ffd166"/><rect x="-12" y="-30" width="24" height="6" rx="3" fill="#ffd166"/></g>`;}};
Object.assign(TROPHY_SPOTS,{brainShelf:{x:780,y:700}});
CR_BOTS.forEach((k,i)=>{TROPHY_SPOTS[k]={x:712+i*44,y:626};});
CR_BOTS.forEach(k=>{THEME_OF['decor:'+k]=['hero'];}); THEME_OF['decor:brainShelf']=['yard']; THEME_OF['decor:boombox']=['stage'];

/* ---------- giving ---------- */
const crBotDone=(p,l)=>!!CODE_PUZZLES[l]&&CODE_PUZZLES[l].length>0&&CODE_PUZZLES[l].every(q=>p.code.solved.includes(q.id));
const crPrize=(R,type,placed)=>R.items.push(Object.assign({uid:uid(),type,placed},placed?Object.assign({},TROPHY_SPOTS[type]||{x:500,y:620}):{x:500,y:620}));
// Gives every prize that is due; shows one box (or a toast when a box is already open). Returns the new prize ids.
function crCheck(){
  const p=P(); if(!p) return []; const got=[], where=[];
  CR_BOT_LVLS.forEach((l,i)=>{if(!p.code.prizes.includes(l)&&crBotDone(p,l)){p.code.prizes.push(l);crPrize(p.room2,CR_BOTS[i],true);got.push(CR_BOTS[i]);}});
  if(got.length) where.push('🤖 in the Loft, by the computer');
  if(!p.brain.shelf&&Object.keys(BRAIN_GAMES).some(g=>BRAIN_LVLS.some(l=>brLevelDone(p,g,l)))){p.brain.shelf=true;crPrize(p.room3,'brainShelf',true);got.push('brainShelf');where.push('📚 in the Backyard, by the chalkboard');}
  if(!p.music.box&&p.music.slots.some(Boolean)){p.music.box=true;crPrize(p.room,'boombox',false);got.push('boombox');where.push('📻 in 📦 My Stuff: tap it in your room to play your music');}
  if(!got.length) return got;
  save(); if(cur==='room') renderRoom(); crShow(got,where,0);
  return got;
}
// The prize box waits while another box is open (a bonus card, a level bonus), up to about 10 s, then falls back to a toast.
function crShow(got,where,tries){
  if(!$('#modal').classList.contains('hidden')){
    if(tries<16) setTimeout(()=>crShow(got,where,tries+1),600); else toast('🎉 '+got.map(k=>DECOR[k].name).join(', ')+'!');
    return;
  }
  SFX.cheer();
  modal(got.length>1?'🎉 New prizes!':'🎉 A new prize!',`<div class="cr-got">${got.map(k=>`<svg viewBox="${DECOR[k].box}">${DECOR[k].d()}</svg>`).join('')}</div>`
      +`<p style="text-align:center">${got.map(k=>esc(DECOR[k].name)).join(', ')}!<br>${where.join('<br>')}</p>`,[{text:'Yay! ✨',cls:'pink'}]);
}

/* ---------- 📻 playing the boombox ---------- */
const CR={boom:0,until:0};
// The loops it can play: her saved ones, or a built-in tune when she has none.
function crLoops(p){const s=p.music.slots.filter(Boolean);
  return s.length?s:[(I=>({g:I.rows.join(''),kit:I.kit,speed:I.speed}))(MU_IDEAS[0])];}
function crBoomTap(g){
  const p=P(); if(!p) return;
  if(!DB.settings.sound){toast('🔇 Sound is off (⚙️ Settings)');return;}
  const a=ac(); if(!a) return;
  if(performance.now()<CR.until) return; // still playing
  const L=crLoops(p), lp=L[CR.boom%L.length]; CR.boom++;
  const kit=MU_KITS[lp.kit]?lp.kit:'soft', sd=60/(MU_SPEEDS[lp.speed]||MU_SPEEDS[1]).bpm/2, t0=a.currentTime+0.08;
  stopMusic(); let notes=0;
  for(let rep=0;rep<2;rep++) for(let s=0;s<MU_STEPS;s++) MU_ROWS.forEach((_,r)=>{if(lp.g[r*MU_STEPS+s]==='1'){muVoice(r,t0+(rep*MU_STEPS+s)*sd,kit);notes++;}});
  const ms=Math.round(2*MU_STEPS*sd*1000)+200; CR.until=performance.now()+ms; CR.notes=notes;
  g.classList.add('boom-play'); setTimeout(()=>g.classList.remove('boom-play'),ms);
  toast(`📻 ${p.music.slots.includes(lp)?`Your music 💾 ${p.music.slots.indexOf(lp)+1}`:'A little tune'} 🎶`);
}
// The room's click handler (09) asks first: true = it was the boombox.
function crRoomTap(e){const g=e.target.closest('.deco');if(!g)return false;const it=curRoom(P()).items.find(i=>i.uid===g.dataset.uid);
  if(!it||it.type!=='boombox')return false;crBoomTap(g);return true;}
