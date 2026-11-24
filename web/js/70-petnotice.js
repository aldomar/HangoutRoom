'use strict';
/* =====================================================================
   70. 🐾 The pet notices (v1.76)
   Back in the room after playing somewhere else, the pet says one line about what she just did, in the buddy's speech bubble
   ("🐾 Nibbles: You scored 3 goals! ⚽"). With no pet yet, the buddy says it. It is spoken like every bubble (say → tell, 65).
   How: show() calls petNotice(from, to) (09). Leaving the room keeps a small copy of her counts in memory (ntSnap: p.stats,
   puzzles solved, the saved music and dances); coming back compares them and NT_LINES picks the most notable change.
   Nothing she did is saved. No game file changes: the games already keep these counts.
   The first thing she does each day gives the pet +1 ❤️ (p.pet.day = fpDay()). Hearts only, never coins, never a sad line.
   ===================================================================== */
const NT={snap:null,pid:'',last:null};
const NT_WAIT=700; // ms after the room opens, so trophy and mic notes come first
// [what changed, the smallest change worth a line, (n) -> the ways to say it]. The first that changed wins, so the order is the priority.
const ntS=k=>(p,s)=>(p.stats[k]||0)-(s.stats[k]||0);
const NT_LINES=[
  [ntS('perfects'),1,n=>['A perfect 5 out of 5! 🏆','Perfect game! 🏆','Five out of five! 🏆']],
  [ntS('homers'),1,n=>[n>1?`${n} home runs! ⚾`:'A home run! ⚾','Out of the park! ⚾']],
  [ntS('derbies'),1,n=>['Derby star! 🎯','What a swing! 🎯']],
  [ntS('tricks'),1,n=>['Nice trick shot! 🎯','That was so cool! 🎯']],
  [ntS('goals'),1,n=>[n>1?`You scored ${n} goals! ⚽`:'You scored a goal! ⚽','What a kick! ⚽',`${n} ⚽ in the net!`]],
  [ntS('saves'),1,n=>[n>1?`${n} super saves! 🧤`:'A super save! 🧤','Great hands! 🧤']],
  [ntS('hits'),1,n=>[n>1?`${n} hits! ⚾`:'A great hit! ⚾','Great batting! ⚾']],
  [ntS('catches'),1,n=>[n>1?`${n} catches! 🧤`:'Nice catch! 🧤','Great catching! 🧤']],
  [ntS('matches'),1,n=>['Good game! ⚽','That was fun to watch! ⚽']],
  [ntS('fullCombos'),1,n=>['Every note right! 🌟','A full combo! 🌟']],
  [ntS('shows'),1,n=>['You sang so well! 🎤','What a show! 🎤','I loved that song! 🎤']],
  [ntS('jams'),1,n=>['What a jam! 🎸','Rock star! 🎸']],
  [(p,s)=>p.brain.solved.length-s.brain,1,n=>[n>1?`You solved ${n} puzzles! 🧠`:'You solved a puzzle! 🧠','Big brain time! 🧠']],
  [(p,s)=>p.code.solved.length-s.code,1,n=>[n>1?`${n} code puzzles done! 💻`:'A code puzzle done! 💻','You are a coder! 💻']],
  [ntS('mazes'),1,n=>['Marble maze master! 🔮','Rolling, rolling! 🔮']],
  [ntS('potd'),1,n=>['Puzzle of the Day, done! 📅']],
  [ntS('free'),1,n=>[n>1?`${n} Free Play puzzles! 🎲`:'A Free Play puzzle! 🎲','Puzzle power! 🎲']],
  [ntS('harvests'),1,n=>['Yum, fresh from the garden! 🌱','What a harvest! 🌱']],
  [ntS('planted'),1,n=>['New seeds planted! 🌱','They will grow so big! 🌱']],
  [ntS('drawings'),1,n=>['I love your drawing! 🎨','What a picture! 🎨']],
  [(p,s)=>JSON.stringify(p.music.slots)!==s.music?1:0,1,n=>['Your song sounds great! 🎹','Play it again! 🎹']],
  [(p,s)=>JSON.stringify(p.dance.slots)!==s.dance?1:0,1,n=>['Cool dance moves! 💃','You can really dance! 💃']],
  [ntS('walks'),1,n=>['You rocked the runway! 👠','So stylish! 👠']],
  [ntS('spyRounds'),1,n=>['Super spy! 🔍','You found them all! 🔍']],
  [ntS('cards'),1,n=>['Cool new photocard! 📸','Star of the show! 📸']],
  [ntS('colored'),1,n=>['Pretty colors! 🖍️','So colorful! 🖍️']],
  [ntS('peeks'),1,n=>['Peekaboo! 👀','You found them! 👀']],
  [ntS('petWalks'),1,n=>['Thanks for the walk! 🦮','That was a lovely walk! 🦮']],
  [ntS('pops'),10,n=>['Pop pop pop! 🫧','So many pops! 🫧']],
  [ntS('squish'),5,n=>['So squishy! 🍡','Squish squish! 🍡']],
  [ntS('stretches'),5,n=>['Stretchy slime! 🧪','Slime time! 🧪']],
  [ntS('spins'),10,n=>['Wheee, spinning! 🌀','So fast! 🌀']],
  [ntS('clicks'),10,n=>['Click click! 🎛️','Clicky clicky! 🎛️']]
];
function ntSnap(p){return {stats:Object.assign({},p.stats),brain:p.brain.solved.length,code:p.code.solved.length,
  music:JSON.stringify(p.music.slots),dance:JSON.stringify(p.dance.slots)};}
// The most notable change since s: {i, n, lines} or null. any = something changed at all (for the daily heart).
function ntPick(p,s){
  let any=false;
  for(let i=0;i<NT_LINES.length;i++){const [f,min,say]=NT_LINES[i], n=f(p,s);
    if(n>0) any=true;
    if(n>=min) return {i,n,lines:say(n),any:true};}
  return any?{any:true,lines:null}:null;
}
// show() calls this before it changes screens (from = the screen she is on now).
function petNotice(from,to){
  const p=P(); if(!p||to==='profiles'){NT.snap=null;return;}
  if(from==='room'&&to!=='room'){NT.snap=ntSnap(p);NT.pid=p.id;return;}
  if(to!=='room'||from==='room'||!NT.snap) return;
  const s=NT.snap, same=NT.pid===p.id; NT.snap=null; if(!same) return;
  const r=ntPick(p,s); if(!r) return;
  clearTimeout(petNotice.t); let tries=0;
  const go=()=>{
    if(cur!=='room'||P()!==p) return;
    // a box on top (a bonus card, a prize…): wait until it is closed, for up to about 10 s
    if(!$('#modal').classList.contains('hidden')){if(++tries<16)petNotice.t=setTimeout(go,600);return;}
    const k=petKind(p), heart=k&&r.any&&p.pet.day!==fpDay();
    if(heart){p.pet.day=fpDay();petGive(p,1);petHeartsFloat(1);}
    if(!r.lines) return;
    const line=r.lines[Math.floor(Math.random()*r.lines.length)], text=k?`🐾 ${petName(p)}: ${line}`:line;
    NT.last={i:r.i,n:r.n,text}; say(text,k?'pet':''); // over the pet when there is one (v1.79)
  };
  petNotice.t=setTimeout(go,NT_WAIT);
}
