'use strict';
/* =========================================================
   18. CODE LAB: a first coding game on the Loft's computer desk (v1.13)
   Fuzzy stands on a small grid. She lines up big blocks (arrows, 🔁 repeat, 🌟 pick up), taps ▶️ Run and watches
   Fuzzy follow them one step at a time, with the block that is running lit up. Reaching the carrot 🥕 (with every
   ⭐ picked up) solves the puzzle. A bump is a gentle "oops": the block glows, nothing is lost, she fixes it and tries again.
   No timers. Each puzzle pays CODE_COINS once; finishing every puzzle of a level pays CODE_LEVEL_BONUS.
   Saved in p.code {level, solved[]}. Level ids (easy/medium/hard) and puzzle ids (e1, m1, h1 …) are saved: never rename them.
   The board is plain SVG moved with CSS transitions, so nothing runs in the main loop.
   ========================================================= */
const CODE_COINS=3, CODE_LEVEL_BONUS=5;
let CODE_STEP=520; // ms per step while a program runs (the smoke test makes it faster)
// Block tokens. A program is a list of them; a puzzle's answer (sol) is written with the same letters.
// A repeat block ('2' '3' '4') does the block right after it that many times.
const CODE_BLOCKS={
  U:{i:'⬆️',dx:0,dy:-1}, D:{i:'⬇️',dx:0,dy:1}, L:{i:'⬅️',dx:-1,dy:0}, R:{i:'➡️',dx:1,dy:0},
  2:{i:'🔁',n:2}, 3:{i:'🔁',n:3}, 4:{i:'🔁',n:4}, S:{i:'🌟',pick:1}
};
// blocks = the palette for that level; max = most blocks in a program (a puzzle can set its own).
const CODE_LEVELS={
  easy:{icon:'🐣',name:'Easy',blocks:'ULRD',max:12},
  medium:{icon:'🔁',name:'Medium',blocks:'ULRD234',max:8},
  hard:{icon:'🌟',name:'Hard',blocks:'ULRD234S',max:16}
};
// Puzzles are short text recipes. Map rows: . floor, F Fuzzy's start, C the carrot, * a star to pick up, # a toy block (wall).
// sol = one answer (the smoke test runs every one, so each puzzle is known to be solvable); hint = shown above the board
// (hidden in Easy mode). To add a puzzle, add one entry at the END of its level, with a new id.
const CODE_PUZZLES={
  easy:[
    {id:'e1',map:['...','F.C','...'],sol:'RR',hint:'Tap ➡️ two times, then ▶️ Run!'},
    {id:'e2',map:['.C.','...','.F.'],sol:'UU',hint:'Which way is the carrot?'},
    {id:'e3',map:['F..','...','..C'],sol:'RRDD',hint:'Mix the arrows to go round the corner.'},
    {id:'e4',map:['C...','....','....','...F'],sol:'LLLUUU'},
    {id:'e5',map:['...C','....','F...','....'],sol:'RRRUU'},
    {id:'e6',map:['....C','.....','.....','.....','F....'],sol:'RRRRUUUU',hint:'A long way! Count the squares.'}
  ],
  medium:[
    {id:'m1',map:['.....','F...C','.....'],max:2,sol:'4R',hint:'Only 2 blocks fit! Put 🔁 4 in front of ➡️ to do it 4 times.'},
    {id:'m2',map:['.C.','...','...','...','.F.'],max:2,sol:'4U'},
    {id:'m3',map:['F....','.....','.....','.....','....C'],max:4,sol:'4R4D',hint:'Two repeats in a row!'},
    {id:'m4',map:['..C..','.....','.....','.....','....F'],max:4,sol:'2L4U'},
    {id:'m5',map:['....C','.....','F....'],max:4,sol:'4R2U'},
    {id:'m6',map:['.....C','......','......','......','......','F.....'],max:6,sol:'4UU4RR',hint:'5 steps? Repeat 4, then one more!'}
  ],
  hard:[
    {id:'h1',map:['.....','F.*.C','.....'],max:8,sol:'RRSRR',hint:'Stand on the ⭐ and use 🌟 to pick it up. Get every star, then the carrot!'},
    {id:'h2',map:['.....','F.#.C','.....'],max:8,sol:'RURRDR',hint:'A toy block is in the way. Go around it!'},
    {id:'h3',map:['F.#..','..#*.','..#..','.....','....C'],max:12,sol:'3D3R2US3DR'},
    {id:'h4',map:['*...*','.###.','.#C#.','.#.#.','F....'],max:14,sol:'4US4RS4D2L2U'},
    {id:'h5',map:['F#...','.#.#.','.#.#.','...#C'],max:12,sol:'3D2R3U2R3D'},
    {id:'h6',map:['..C..','.###.','*.*.*','..F..'],max:16,sol:'US2LS4RS2U2L'}
  ]
};
const CODE_LVL_IDS=Object.keys(CODE_LEVELS);
// A bonus photocard for the first puzzle solved (the list lives in section 12).
BONUS.push({id:'code1',name:'First Program!',ok:p=>!!(p.code&&p.code.solved.length)});

/* ---------- the rules (no drawing here, so the smoke test can check every puzzle) ---------- */
function codeParse(pz){
  const g={w:pz.map[0].length,h:pz.map.length,wall:{},stars:[],start:null,goal:null};
  pz.map.forEach((row,y)=>[...row].forEach((c,x)=>{
    if(c==='#') g.wall[x+','+y]=1; else if(c==='*') g.stars.push(x+','+y);
    else if(c==='F') g.start={x,y}; else if(c==='C') g.goal={x,y};
  }));
  return g;
}
// Turns a program into single steps {t, bs}: t = U/D/L/R/S, or '?' for a repeat with nothing after it;
// bs = the program blocks to light up (a repeat lights up together with the block it repeats).
function codeSteps(prog){
  const out=[];
  for(let i=0;i<prog.length;){
    let n=1; const bs=[];
    while(i<prog.length&&CODE_BLOCKS[prog[i]].n){n*=CODE_BLOCKS[prog[i]].n;bs.push(i);i++;}
    if(i>=prog.length){out.push({t:'?',bs});break;}
    bs.push(i); for(let k=0;k<n;k++) out.push({t:prog[i],bs}); i++;
  }
  return out;
}
// Runs a program on a puzzle. Returns {ev:[…], end}: ev = what happens at each step (for the animation),
// end = 'win' | 'bump' | 'nostar' (🌟 where there is no star) | 'lonely' (🔁 with nothing after it)
//     | 'short' (ran out of blocks) | 'stars' (ran out of blocks on the carrot with stars still to get).
function codeSim(pz,prog){
  const g=codeParse(pz), got={}, ev=[]; let x=g.start.x, y=g.start.y, end='short';
  for(const s of codeSteps(prog)){
    if(s.t==='?'){ev.push({k:'oops',bs:s.bs,x,y});end='lonely';break;}
    if(s.t==='S'){
      const key=x+','+y;
      if(g.stars.includes(key)&&!got[key]){got[key]=1;ev.push({k:'pick',bs:s.bs,x,y,star:key});}
      else{ev.push({k:'oops',bs:s.bs,x,y});end='nostar';break;}
    } else {
      const B=CODE_BLOCKS[s.t], nx=x+B.dx, ny=y+B.dy;
      if(nx<0||ny<0||nx>=g.w||ny>=g.h||g.wall[nx+','+ny]){ev.push({k:'bump',bs:s.bs,x,y,dx:B.dx,dy:B.dy});end='bump';break;}
      x=nx; y=ny; ev.push({k:'move',bs:s.bs,x,y});
    }
    if(x===g.goal.x&&y===g.goal.y&&g.stars.every(k=>got[k])){end='win';break;} // the carrot counts as soon as she gets there
  }
  if(end==='short'&&x===g.goal.x&&y===g.goal.y) end='stars';
  return {ev,end};
}
const codeMax=(lvl,pz)=>pz.max||CODE_LEVELS[lvl].max;

/* ---------- screen ---------- */
// view: 'pick' (puzzle list) or 'play'. state while playing: 'edit' | 'run' | 'oops' | 'win'.
let CL={view:'pick',lvl:'easy',idx:0,prog:[],state:'edit',timer:0,ev:null,k:0,bad:[]};
function renderCode(){if(P())clPickView();}
function codeStop(){clearTimeout(CL.timer);if(CL.state==='run')CL.state='edit';} // leaving the screen stops a run (nothing lost)
function clPickView(){
  const p=P(); if(!p) return; codeStop(); CL.view='pick';
  $('#clPick').classList.remove('hidden'); $('#clPlay').classList.add('hidden'); $('#clTabs').classList.remove('hidden');
  $('#clBack').textContent='⬅ Room';
  const lv=p.code.level, list=CODE_PUZZLES[lv];
  $$('#clTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.lvl===lv));
  const done=list.filter(q=>p.code.solved.includes(q.id)).length;
  $('#clHint').textContent=done===list.length?`You solved every ${CODE_LEVELS[lv].name} puzzle! 🎉`:`Help ${p.mascotName} get to the carrot! 🥕 (${done} of ${list.length} solved)`;
  $('#clList').innerHTML=list.map((q,i)=>`<button class="clp${p.code.solved.includes(q.id)?' done':''}" data-pz="${i}">`
    +`<svg viewBox="0 0 ${q.map[0].length*10} ${q.map.length*10}">${clMini(q)}</svg><b>${i+1}</b></button>`).join('');
}
// A tiny picture of the puzzle for the list (works without reading).
function clMini(q){
  const col={'#':'#ff8cc6','C':'#ff9f43','F':'#fff','*':'#ffd166'};
  return q.map.map((row,y)=>[...row].map((c,x)=>`<rect x="${x*10+0.6}" y="${y*10+0.6}" width="8.8" height="8.8" rx="2" fill="${col[c]||'#4b3a66'}"/>`).join('')).join('');
}
$('#clTabs').onclick=e=>{const b=e.target.closest('[data-lvl]');if(!b||CL.view!=='pick')return;P().code.level=b.dataset.lvl;save();SFX.click();clPickView();};
$('#clList').onclick=e=>{const b=e.target.closest('[data-pz]');if(b){SFX.click();clOpen(P().code.level,Number(b.dataset.pz));}};
$('#clBack').onclick=()=>{SFX.click();if(CL.view==='pick')show('room');else clPickView();};
function clBackKey(){if(CL.view==='pick')show('room');else clPickView();} // Android Back: a puzzle -> the list -> room

function clOpen(lvl,idx){
  const p=P(), pz=CODE_PUZZLES[lvl]&&CODE_PUZZLES[lvl][idx]; if(!p||!pz) return;
  codeStop(); Object.assign(CL,{view:'play',lvl,idx,prog:[],state:'edit',bad:[]});
  $('#clPick').classList.add('hidden'); $('#clTabs').classList.add('hidden'); $('#clPlay').classList.remove('hidden');
  $('#clBack').textContent='⬅ Puzzles';
  $('#clPal').innerHTML=[...CODE_LEVELS[lvl].blocks].map(t=>`<button class="clb${CODE_BLOCKS[t].n?' rep':''}" data-add="${t}">${clFace(t)}</button>`).join('');
  clBoard(); clProg(); clSay(pz.hint||'',true);
}
const clFace=t=>CODE_BLOCKS[t].n?`🔁<small>×${CODE_BLOCKS[t].n}</small>`:CODE_BLOCKS[t].i;
// The board: 100 units per square, Fuzzy in a group moved with a CSS transition.
function clBoard(){
  const p=P(), pz=CODE_PUZZLES[CL.lvl][CL.idx], g=codeParse(pz), W=g.w*100, H=g.h*100;
  let s=`<rect x="-8" y="-8" width="${W+16}" height="${H+16}" rx="22" fill="#2b2340"/>`;
  for(let y=0;y<g.h;y++) for(let x=0;x<g.w;x++){
    const k=x+','+y, X=x*100, Y=y*100;
    s+=`<rect x="${X+4}" y="${Y+4}" width="92" height="92" rx="16" fill="${(x+y)%2?'#43355d':'#4d3d6b'}"/>`;
    if(g.wall[k]) s+=`<g><rect x="${X+12}" y="${Y+14}" width="76" height="72" rx="12" fill="#ffb3d9" stroke="#2b2235" stroke-width="4"/>`
      +`<rect x="${X+12}" y="${Y+14}" width="76" height="16" rx="8" fill="#ff8cc6"/><path d="${heartPath(X+50,Y+52,13)}" fill="#a97cff"/></g>`;
  }
  // the carrot
  const cx=g.goal.x*100+50, cy=g.goal.y*100+50;
  s+=`<g><path d="M${cx-10} ${cy-22} Q${cx-26} ${cy-44} ${cx-14} ${cy-46} Q${cx-4} ${cy-38} ${cx} ${cy-26} Q${cx+6} ${cy-48} ${cx+18} ${cy-42} Q${cx+22} ${cy-30} ${cx+8} ${cy-22}Z" fill="#69db7c" stroke="#2b2235" stroke-width="3"/>`
    +`<path d="M${cx-18} ${cy-22} Q${cx} ${cy-30} ${cx+18} ${cy-22} Q${cx+8} ${cy+14} ${cx} ${cy+38} Q${cx-8} ${cy+14} ${cx-18} ${cy-22}Z" fill="#ff9f43" stroke="#2b2235" stroke-width="3.5"/>`
    +`<path d="M${cx-8} ${cy-6} h8 M${cx-2} ${cy+10} h7" stroke="#c96a1c" stroke-width="3" stroke-linecap="round"/></g>`;
  g.stars.forEach(k=>{const [x,y]=k.split(',').map(Number);
    s+=`<path class="clstar" data-star="${k}" d="${starPath(x*100+50,y*100+50,30)}" fill="#ffd166" stroke="#2b2235" stroke-width="3.5"/>`;});
  // Fuzzy (one mascot only, so one fuzz filter)
  s+=`<g id="clFz"><g class="clhop">${mascotSVG(p.look,null,'x="10" y="-30" width="80" height="108"')}</g></g>`;
  const sv=$('#clBoard'); sv.setAttribute('viewBox',`-10 -36 ${W+20} ${H+46}`); sv.innerHTML=s;
  clPut(g.start.x,g.start.y,true);
}
function clPut(x,y,now){
  const f=$('#clFz'); if(!f) return;
  f.style.transition=now?'none':''; f.style.transform=`translate(${x*100}px,${y*100}px)`;
  if(now) void f.getBoundingClientRect();
}
function clProg(){
  const max=codeMax(CL.lvl,CODE_PUZZLES[CL.lvl][CL.idx]);
  let h=CL.prog.map((t,i)=>`<button class="clb${CODE_BLOCKS[t].n?' rep':''}${CL.bad.includes(i)?' oops':''}" data-at="${i}">${clFace(t)}</button>`).join('');
  for(let i=CL.prog.length;i<max;i++) h+=`<span class="clslot"></span>`;
  $('#clProg').innerHTML=h;
  const running=CL.state==='run';
  $('#clRun').innerHTML=running?'⏹ <span>Stop</span>':'▶️ <span>Run</span>';
  $('#clPlay').classList.toggle('running',running);
}
function clSay(text,tip){const m=$('#clMsg');m.textContent=text;m.classList.toggle('hint',!!tip);m.classList.toggle('oops',!tip&&!!text);}
// Editing puts Fuzzy back at the start, ready for the next try.
function clEdited(){
  if(CL.state!=='edit'){CL.state='edit';clBoard();}
  CL.bad=[]; clSay('',true); clProg();
}
$('#clPal').onclick=e=>{
  const b=e.target.closest('[data-add]'); if(!b||CL.state==='run') return;
  const max=codeMax(CL.lvl,CODE_PUZZLES[CL.lvl][CL.idx]);
  if(CL.prog.length>=max){SFX.locked();toast(P().easy?`🔒 ${max} blocks`:`Only ${max} blocks fit! Try 🔁 repeat, or tap a block to take it out.`);return;}
  CL.prog.push(b.dataset.add); SFX.click(); vibrate(6); clEdited();
};
$('#clProg').onclick=e=>{ // tap a block to take it out
  const b=e.target.closest('[data-at]'); if(!b||CL.state==='run') return;
  CL.prog.splice(Number(b.dataset.at),1); SFX.whoosh(); clEdited();
};
$('#clUndo').onclick=()=>{if(CL.state==='run'||!CL.prog.length)return;CL.prog.pop();SFX.click();clEdited();};
$('#clClear').onclick=()=>{if(CL.state==='run'||!CL.prog.length)return;CL.prog=[];SFX.whoosh();clEdited();};
$('#clRun').onclick=()=>{if(CL.state==='run'){codeStop();clBoard();CL.bad=[];clProg();clSay('',true);SFX.click();}else clGo();};

/* ---------- running a program ---------- */
function clGo(){
  if(!CL.prog.length){SFX.locked();clSay(P().easy?'👇 ⬆️ ⬇️ ⬅️ ➡️':'Tap the blocks below to make a program first! 👇');return;}
  const r=codeSim(CODE_PUZZLES[CL.lvl][CL.idx],CL.prog);
  clBoard(); Object.assign(CL,{state:'run',ev:r.ev,end:r.end,k:0,bad:[]}); clSay('',true); clProg(); SFX.click();
  CL.timer=setTimeout(clTick,CODE_STEP*0.6);
}
function clTick(){
  if(CL.state!=='run'||cur!=='code') return;
  const e=CL.ev[CL.k++];
  $$('#clProg .clb').forEach((b,i)=>b.classList.toggle('lit',!!e&&e.bs.includes(i)));
  if(!e){clDone();return;}
  if(e.k==='move'){clPut(e.x,e.y);tone(500+e.x*40+(4-e.y)*30,0.08,'triangle',0.1,700);}
  else if(e.k==='pick'){const st=$(`[data-star="${e.star}"]`);if(st)st.classList.add('got');tone(1320,0.12,'sine',0.12,1760);vibrate(10);}
  else if(e.k==='bump'){ // lean into the block, then back
    const f=$('#clFz'); f.style.transform=`translate(${e.x*100+e.dx*30}px,${e.y*100+e.dy*30}px)`;
    setTimeout(()=>clPut(e.x,e.y),170); SFX.locked(); vibrate(20);
  }
  CL.timer=setTimeout(clTick,CODE_STEP);
}
const CL_OOPS={
  bump:['🙈 Bonk!','Bonk! Something is in the way. Fix the glowing block and try again!'],
  nostar:['🌟❓','There is no star here to pick up. Fix the glowing block!'],
  lonely:['🔁❓','🔁 needs a block after it, to know what to repeat.'],
  short:['🥕 ➕','Fuzzy stopped before the carrot. Add more blocks!'],
  stars:['⭐ ➕',"Pick up every ⭐ first, then go to the carrot!"]
};
function clDone(){
  const p=P(); if(!p) return;
  $$('#clProg .clb').forEach(b=>b.classList.remove('lit'));
  if(CL.end==='win'){clWin();return;}
  CL.state='oops';
  const last=CL.ev[CL.ev.length-1];
  CL.bad=CL.end==='short'||CL.end==='stars'?[]:(last?last.bs:[]);
  clSay(CL_OOPS[CL.end][p.easy?0:1]); clProg();
}
function clWin(){
  const p=P(), pz=CODE_PUZZLES[CL.lvl][CL.idx], first=!p.code.solved.includes(pz.id);
  CL.state='win'; clProg();
  let coins=0, all=false;
  if(first){
    p.code.solved.push(pz.id); coins=CODE_COINS;
    all=CODE_PUZZLES[CL.lvl].every(q=>p.code.solved.includes(q.id)); if(all) coins+=CODE_LEVEL_BONUS;
  }
  const hop=$('#clFz .clhop'); if(hop) hop.classList.add('on');
  SFX.cheer(); vibrate(30);
  if(coins) earn(coins,'Code!'); else save();
  const next=CODE_PUZZLES[CL.lvl][CL.idx+1], lvl=CL.lvl, idx=CL.idx, n=CL.prog.length;
  CL.timer=setTimeout(()=>{
    if(cur!=='code'||CL.view!=='play') return;
    modal(`🥕 Yum! Puzzle ${idx+1} solved!`,
      `<div style="text-align:center;font-size:17px">${p.easy?'🎉':`${esc(p.mascotName)} followed your program all the way! 🎉`}`
      +`<br>${n} block${n>1?'s':''}${coins?` · +${coins} 🪙`:''}`
      +(all?`<br>Every ${CODE_LEVELS[lvl].name} puzzle solved! (+${CODE_LEVEL_BONUS} bonus) 🏆`:'')+'</div>',
      [{text:'🧩 Puzzles',cls:'ghost',on:clPickView},next?{text:'Next ▶',cls:'pink',on:()=>clOpen(lvl,idx+1)}:{text:'Yay! ✨',cls:'pink',on:clPickView}]);
    checkBonus(); // "First Program!" (shown as a message, because the result box is open)
  },700);
}
