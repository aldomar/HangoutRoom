'use strict';
/* =========================================================
   28. BRAIN GAMES (v1.25), part 1: the menu, the shared puzzle screen and 🧁 Snack Stand
   Tap the Backyard's chalkboard. Three games (Snack Stand here; Memory Match and Number Pop in section 29), each with
   Easy (ages 3-5), Medium (8) and Hard (11) and 8 fixed puzzles per level. A puzzle pays BRAIN_COINS the first time it
   is solved, and a whole level pays BRAIN_BONUS once; replays are free practice. No timers; a wrong answer is a gentle
   wobble and "Try again!". Easy works without reading (pictures, numbers and dots).
   Saved per room: brain{game, level{snack,memory,pop}, solved[]}. Puzzle ids are '<game>:<e|m|h><n>' (snack:e1 ...),
   made from the puzzle's place in its list: never reorder or remove puzzles, only add new ones at the end of a level.
   A game registers itself in BRAIN_GAMES: {icon, name, desc, color, puzzles{easy,medium,hard}, start(pz, lvl, idx)}.
   ========================================================= */
const BRAIN_COINS=2, BRAIN_BONUS=5, BRAIN_LVLS=['easy','medium','hard'];
const BRAIN_GAMES={};
const BR_MENU_EXTRA=[]; // v1.34: functions p => HTML added under the games on the menu (the 🪐 Fact Cards binder button)
const BR_MENU_TOP=[];   // v1.42: functions p => HTML added above the games (👯 Memory for 2, section 43)
const brId=(g,l,i)=>`${g}:${l[0]}${i+1}`;
let BR={view:'menu',game:'snack',lvl:'easy',idx:0,won:false,timer:0,tok:0,free:null};
// (v1.43) the shuffle seed of a puzzle: its id, or for a made-up 🎲 / 📅 puzzle (section 44) its own key
const brKey=(g,l,idx)=>BR.free?BR.free.key:brId(g,l,idx);
const brSolved=(p,g,l)=>BRAIN_GAMES[g].puzzles[l].filter((z,i)=>p.brain.solved.includes(brId(g,l,i))).length;
const brLevelDone=(p,g,l)=>brSolved(p,g,l)===BRAIN_GAMES[g].puzzles[l].length;

/* ---------- menu ---------- */
function renderBrain(){if(P())brMenu();}
function brStop(){clearTimeout(BR.timer);BR.tok++;} // leaving stops any pending flip-back or win box
function brMenu(){
  const p=P(); if(!p) return; brStop(); BR.view='menu';
  $('#brMenu').classList.remove('hidden'); $('#brPlay').classList.add('hidden'); $('#brDuo').classList.add('hidden');
  $('#brBack').textContent='⬅ Room'; $('#brTitle').textContent='📚 Brain Games';
  $('#brMenu').innerHTML=`<div class="stg-note">${p.easy?'🧠 ✨':'Pick a game! Every puzzle you solve the first time pays 🪙'}</div>`
    +`<div class="br-top">${BR_MENU_TOP.map(f=>f(p)).join('')}</div>`+`<div class="br-games">`+Object.keys(BRAIN_GAMES).map(g=>{const G=BRAIN_GAMES[g];
      const n=BRAIN_LVLS.reduce((a,l)=>a+brSolved(p,g,l),0), all=BRAIN_LVLS.reduce((a,l)=>a+G.puzzles[l].length,0);
      return `<button class="br-game" data-game="${g}" style="--gc:${G.color}"><span class="br-gi">${G.icon}</span><b>${G.name}</b>`
        +`<small class="hint">${G.desc}</small><span class="br-pips">${BRAIN_LVLS.map(l=>`<i class="${brLevelDone(p,g,l)?'on':''}">${l==='easy'?'🐣':l==='medium'?'🌟':'🧠'}</i>`).join('')}</span>`
        +`<span class="br-n">⭐ ${n} / ${all}</span></button>`;}).join('')+`</div>`+BR_MENU_EXTRA.map(f=>f(p)).join('');
}
$('#brMenu').onclick=e=>{const b=e.target.closest('[data-game]');if(b){SFX.click();brOpen(b.dataset.game);}};
function brOpen(g){
  const p=P(); if(!p||!BRAIN_GAMES[g]) return;
  p.brain.game=g; const l=p.brain.level[g]; save();
  const list=BRAIN_GAMES[g].puzzles[l], first=list.findIndex((z,i)=>!p.brain.solved.includes(brId(g,l,i)));
  brPuzzle(g,l,first<0?0:first); // the first puzzle not solved yet
}
$('#brBack').onclick=()=>{SFX.click();brBackKey();};
function brBackKey(){if(BR.view!=='menu')brMenu();else show('room');} // Android Back: a puzzle -> the menu -> room

/* ---------- the puzzle screen: level tabs, 8 puzzle buttons, the question and the board ---------- */
// fz (v1.43, section 44): a made-up puzzle {pz, key, idx, daily} for 🎲 Free Play or the 📅 Puzzle of the Day.
function brPuzzle(g,l,idx,fz){
  const p=P(), G=BRAIN_GAMES[g], pz=fz?fz.pz:G&&G.puzzles[l]&&G.puzzles[l][idx]; if(!pz) return;
  brStop(); Object.assign(BR,{view:'play',game:g,lvl:l,idx,won:false,free:fz||null});
  $('#brMenu').classList.add('hidden'); $('#brPlay').classList.remove('hidden');
  $('#brBack').textContent='⬅ Games'; $('#brTitle').textContent=fz&&fz.daily?'📅 Puzzle of the Day':`${G.icon} ${G.name}`;
  $$('#brTabs [data-lvl]').forEach(b=>b.classList.toggle('on',b.dataset.lvl===l));
  $$('#brTabs [data-duo]').forEach(b=>b.classList.toggle('hidden',b.dataset.duo!==g)); // 👯 2 players (Memory Match, section 43)
  $('#brDots').innerHTML=G.puzzles[l].map((z,i)=>`<button class="br-dot${p.brain.solved.includes(brId(g,l,i))?' done':''}${i===idx&&!fz?' on':''}" data-pz="${i}">${i+1}</button>`).join('')
    +(typeof fpDice==='function'?fpDice(g,l):''); // the 🎲 Free Play button (section 44)
  $('#brMsg').textContent=''; $('#brQ').innerHTML=''; $('#brBoard').innerHTML=''; $('#brBoard').className='br-board br-'+g;
  G.start(pz,l,idx);
}
$('#brTabs').onclick=e=>{const b=e.target.closest('[data-lvl]');if(!b||BR.view!=='play')return;const p=P();
  p.brain.level[BR.game]=b.dataset.lvl; save(); SFX.click();
  if(BR.free&&!BR.free.daily&&typeof fpBrain==='function'){fpBrain(BR.game,b.dataset.lvl);return;} // in 🎲 Free Play a tab makes a new one
  const list=BRAIN_GAMES[BR.game].puzzles[b.dataset.lvl], first=list.findIndex((z,i)=>!p.brain.solved.includes(brId(BR.game,b.dataset.lvl,i)));
  brPuzzle(BR.game,b.dataset.lvl,first<0?0:first);};
$('#brDots').onclick=e=>{if(e.target.closest('[data-dice]')){SFX.click();fpBrain(BR.game,BR.lvl);return;}
  const b=e.target.closest('[data-pz]');if(b){SFX.click();brPuzzle(BR.game,BR.lvl,Number(b.dataset.pz));}};
function brSay(t){const m=$('#brMsg');m.textContent=t;m.classList.remove('pop');void m.offsetWidth;m.classList.add('pop');}
function brWobble(el){if(!el)return;el.classList.remove('wob');void el.offsetWidth;el.classList.add('wob');}
function brOops(el){SFX.locked();vibrate(15);brWobble(el);brSay(P().easy?'🙈 🔁':'Not quite. Try again! 💪');tell('Not quite. Try again!');} // tell: section 65
// A try-again hint: shown in words (not in Easy mode) and said when Read to me is on (v1.70).
function brHint(t){if(!P().easy)brSay(t);tell(t);}
// Solved: coins the first time (+ the level bonus when the whole level is done), then a box with Next.
function brWin(){
  const p=P(), g=BR.game, l=BR.lvl, idx=BR.idx, id=brId(g,l,idx), first=!p.brain.solved.includes(id), G=BRAIN_GAMES[g];
  if(BR.won) return; BR.won=true;
  if(BR.free){fpBrainWin();return;} // a 🎲 / 📅 puzzle pays its own way and never counts as solved (section 44)
  let coins=0, all=false;
  if(first){p.brain.solved.push(id);coins=BRAIN_COINS;all=brLevelDone(p,g,l);if(all)coins+=BRAIN_BONUS;}
  SFX.cheer(); vibrate(30); brSay(p.easy?'🎉🎉🎉':'You did it! 🎉');
  if(coins) earn(coins,'Brain!'); else save();
  const d=$(`#brDots [data-pz="${idx}"]`); if(d) d.classList.add('done');
  const next=G.puzzles[l][idx+1], tok=BR.tok;
  BR.timer=setTimeout(()=>{
    if(cur!=='brain'||BR.view!=='play'||BR.tok!==tok) return;
    endBox({title:`${G.icon} Puzzle ${idx+1} solved!`,
      body:`<div style="text-align:center;font-size:18px">🎉${coins?` +${coins} 🪙`:''}`
      +(G.winExtra?G.winExtra(G.puzzles[l][idx],l,idx,first):'')
      +(all?`<br>Every ${l[0].toUpperCase()+l.slice(1)} puzzle solved! (+${BRAIN_BONUS} bonus) 🏆`:first||p.easy?'':'<br>Practice makes perfect ✨')+'</div>',
      back:{to:'games',on:brMenu},go:next?{text:'▶ Next',on:()=>brPuzzle(g,l,idx+1)}:{text:'🔁 Again',on:()=>brPuzzle(g,l,idx)}}); // section 76
  },900);
}
// Answer buttons (Snack Stand). nums = the choices in order; dots = also show the number as dots (Easy).
function brChoices(nums,ans,dots){
  $('#brBoard').innerHTML=`<div class="br-choices">`+nums.map(n=>`<button class="br-ch" data-n="${n}"><b>${n}</b>${dots?`<span class="br-dots">${'●'.repeat(n)}</span>`:''}</button>`).join('')+`</div>`;
  $('#brBoard').onclick=e=>{const b=e.target.closest('[data-n]');if(!b||BR.won)return;
    if(Number(b.dataset.n)===ans){b.classList.add('right');SFX.happy();brWin();} else brOops(b);};
}
// The choices around the answer: a pattern of offsets that changes from puzzle to puzzle (so the answer moves around).
function brOptions(ans,idx,pats){
  const out=[]; pats[idx%pats.length].forEach(o=>{let v=ans+o;while(v<1||out.includes(v))v+=7;out.push(v);});
  return out.sort((a,b)=>a-b);
}

/* ---------- 🧁 Snack Stand: count -> add up an order -> change and times tables ---------- */
const SNACK_ART={ // 40 x 40, drawn bottom-center-ish
  cupcake:`<path d="M9 22 L13 38 H27 L31 22Z" fill="#ff8cc6" stroke="#2b2235" stroke-width="2.5" stroke-linejoin="round"/><path d="M15 23 L16.5 37 M20 23 V37 M25 23 L23.5 37" stroke="#fff" stroke-width="2" opacity=".7"/>`
    +`<path d="M7 23 Q4 15 12 13 Q13 5 20 7 Q27 5 28 13 Q36 15 33 23Z" fill="#fff4fb" stroke="#2b2235" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="6" r="3.5" fill="#ff4d6d" stroke="#2b2235" stroke-width="2"/>`
    +`<circle cx="14" cy="17" r="1.4" fill="#a97cff"/><circle cx="24" cy="15" r="1.4" fill="#8ff0d0"/><circle cx="27" cy="20" r="1.4" fill="#ffd166"/>`,
  cookie:`<circle cx="20" cy="22" r="15" fill="#e3a45c" stroke="#2b2235" stroke-width="2.5"/><circle cx="14" cy="17" r="2.6" fill="#5a3a2a"/><circle cx="24" cy="15" r="2.2" fill="#5a3a2a"/>`
    +`<circle cx="26" cy="26" r="2.6" fill="#5a3a2a"/><circle cx="15" cy="28" r="2" fill="#5a3a2a"/><circle cx="20" cy="22" r="1.6" fill="#5a3a2a"/>`,
  juice:`<path d="M24 10 L28 2" stroke="#2b2235" stroke-width="3" stroke-linecap="round"/><path d="M24 10 L28 2" stroke="#ff8cc6" stroke-width="1.5" stroke-linecap="round"/>`
    +`<rect x="11" y="10" width="18" height="28" rx="3" fill="#8ff0d0" stroke="#2b2235" stroke-width="2.5"/><circle cx="20" cy="25" r="5.5" fill="#ffd166" stroke="#2b2235" stroke-width="2"/><path d="M18 20 q2 -3 4 0" stroke="#7ed957" stroke-width="2" fill="none"/>`
};
const snackPic=(it,n,cols)=>{cols=cols||5;const rows=Math.ceil(n/cols), w=Math.min(n,cols)*40;
  return `<svg class="br-pic" viewBox="0 0 ${w} ${rows*40}" style="width:${Math.min(w*(n<5?2.4:1.6),560)}px">`
    +Array.from({length:n},(_,i)=>`<g transform="translate(${(i%cols)*40} ${Math.floor(i/cols)*40})">${SNACK_ART[it]}</g>`).join('')+`</svg>`;};
const SNACK_NAMES={cupcake:'cupcakes',cookie:'cookies',juice:'juices'};
BRAIN_GAMES.snack={icon:'🧁',name:'Snack Stand',desc:'Count, add up and give change',color:'#ff8cc6',
  puzzles:{
    easy:[{n:2,it:'cupcake'},{n:3,it:'cookie'},{n:4,it:'juice'},{n:5,it:'cupcake'},{n:6,it:'cookie'},{n:7,it:'cupcake'},{n:8,it:'juice'},{n:10,it:'cookie'}],
    medium:[{o:[['cupcake',3],['cookie',4]]},{o:[['cupcake',5],['juice',6]]},{o:[['cookie',7],['cupcake',5]]},{o:[['cupcake',8],['cookie',6]]},
      {o:[['juice',9],['cookie',7]]},{o:[['cupcake',6],['cookie',5],['juice',4]]},{o:[['cupcake',9],['cookie',8],['juice',7]]},{o:[['cookie',8],['cupcake',8],['juice',9]]}],
    hard:[{q:'Cupcakes come in boxes of 6. How many cupcakes are in 3 boxes?',a:18,pic:'📦📦📦 🧁×6'},
      {q:'The order costs 13 🪙. You pay with 20 🪙. How much change do you give back?',a:7,pic:'🪙20 − 🪙13'},
      {q:'Cookies cost 4 🪙 each. How much do 7 cookies cost?',a:28,pic:'🍪×7 · 4 🪙 each'},
      {q:'The order costs 36 🪙. You pay with 50 🪙. How much change?',a:14,pic:'🪙50 − 🪙36'},
      {q:'8 boxes with 6 cupcakes in each. How many cupcakes?',a:48,pic:'📦×8 🧁×6'},
      {q:'2 cupcakes at 7 🪙 each and a juice at 5 🪙. How much in all?',a:19,pic:'🧁🧁 + 🧃'},
      {q:'Juice costs 9 🪙. How much for 7 juices?',a:63,pic:'🧃×7 · 9 🪙 each'},
      {q:'6 cupcakes at 9 🪙 each. You pay with 60 🪙. How much change?',a:6,pic:'🧁×6 · 🪙60'}]
  },
  answer:(pz,l)=>l==='easy'?pz.n:l==='medium'?pz.o.reduce((a,x)=>a+x[1],0):pz.a,
  options:(pz,l,idx)=>{const a=BRAIN_GAMES.snack.answer(pz,l);
    return l==='easy'?brOptions(a,idx,[[-1,0,1],[0,1,2],[-2,-1,0]])
      :l==='medium'?brOptions(a,idx,[[-2,-1,0,1],[-1,0,1,2],[0,1,2,3],[-3,-2,-1,0]])
      :brOptions(a,idx,[[-2,0,1,10],[-10,-1,0,2],[0,2,3,-1],[-1,0,4,10]]);},
  start(pz,l,idx){
    const p=P(), G=BRAIN_GAMES.snack, a=G.answer(pz,l);
    if(l==='easy') $('#brQ').innerHTML=`<div class="br-card">${p.easy?'':`<div class="br-ask">How many ${SNACK_NAMES[pz.it]}?</div>`}${snackPic(pz.it,pz.n)}<div class="br-big">❓</div></div>`;
    else if(l==='medium') $('#brQ').innerHTML=`<div class="br-card"><div class="br-ask">${p.easy?'➕':'How many treats in this order?'}</div><div class="br-order">`
      +pz.o.map(([it,n],i)=>`${i?'<span class="br-plus">+</span>':''}<span class="br-grp"><b>${n}</b>${snackPic(it,n,3)}</span>`).join('')+`</div></div>`;
    else $('#brQ').innerHTML=`<div class="br-card"><div class="br-pic2">${pz.pic}</div><div class="br-ask">${pz.q}</div></div>`;
    brChoices(G.options(pz,l,idx),a,l==='easy');
  }
};

/* ---------- the chalkboard opens it; stickers ---------- */
STK_PAGES.code.name='Code & Brain';
const brCount=(p,g)=>p.brain.solved.filter(x=>x.startsWith(g+':')).length;
STICKERS.push(
  stk('snack8','code','🧁','Snack Shop','circle','Solve 8 Snack Stand puzzles (📚 Brain Games)',8,p=>brCount(p,'snack')),
  stk('memory8','code','🃏','Sharp Memory','heart','Solve 8 Memory Match puzzles',8,p=>brCount(p,'memory')),
  stk('pop8','code','🫧','Number Popper','cloud','Solve 8 Number Pop puzzles',8,p=>brCount(p,'pop')),
  stk('brainChamp','code','🎓','Brain Champ','star','Solve every level of all 3 Brain Games',9,p=>['snack','memory','pop'].reduce((a,g)=>a+BRAIN_LVLS.filter(l=>brLevelDone(p,g,l)).length,0))
);
