'use strict';
/* =========================================================
   44. 🎲 FREE PLAY + 📅 PUZZLE OF THE DAY (v1.43)
   Endless made-up puzzles, after (or alongside) the fixed lists. A puzzle is made by a "maker" from a seed: the same seed
   always makes the same puzzle (brRand, section 29). Every made puzzle is checked by its game's ok() before it is shown
   (solvable, one answer, choices hold the answer); if a check fails the dice roll again. Nothing about a made puzzle is
   saved and it never counts as solved: brain.solved, maze.solved, code.solved, level bonuses and Brain Champ don't change.
   - 🎲 Free Play: a button in 5 Brain Games (not Word Builder or Fact Cards), the Marble Maze bar and the Code Lab's Easy
     and Medium lists. It glows once that level's fixed puzzles are all solved. +1 coin each, FREE_DAILY a day in all
     (p.free), then one gentle note; it refills quietly the next day.
   - 📅 Puzzle of the Day: a card at the top of the Brain Games menu. The game turns through POTD_GAMES by the date and the
     seed is the date, so it is the same puzzle all day. +POTD_COINS once a day (p.potd.day); no streaks, no "missed it".
   Hooks: brPuzzle(g,l,idx,fz) / brWin / brKey (28), memory + pop shuffles (29), mzStart(i,free) / mzCur / mzWin (19),
   clOpen(lvl,idx,free) / clPz / clWin (18).
   Saved per room: free{day, n}, potd{day}, stats.free, stats.potd.
   ========================================================= */
const FREE_DAILY=10, POTD_COINS=5;
const POTD_GAMES=['train','pop','snack','memory','bake']; // the daily turn (+ word in 45; the Maze and Code Lab live on other screens)
const FP_BRAIN=['snack','memory','pop','train','bake'];   // Brain Games with 🎲 (+ word from the word bank in 45; facts can't be made up)
let fpToldDay='';

/* ---------- the dice ---------- */
const fpInt=(r,a,b)=>a+Math.floor(r()*(b-a+1));
const fpPick=(r,a)=>a[Math.floor(r()*a.length)];
const fpMix=(r,a)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const fpSeed=()=>'free:'+Date.now().toString(36)+':'+Math.random().toString(36).slice(2,8);
// Today as 2026-11-19 (the device's own date). The smoke test can set window.FP_TEST_DAY.
function fpDay(){
  if(window.FP_TEST_DAY) return window.FP_TEST_DAY;
  const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
const fpDayNo=day=>{const [y,m,d]=day.split('-').map(Number);return Math.round(Date.UTC(y,m-1,d)/864e5);};
const potdGame=day=>POTD_GAMES[((fpDayNo(day||fpDay())%POTD_GAMES.length)+POTD_GAMES.length)%POTD_GAMES.length];
const potdLevel=(p,g)=>p.easy?'easy':BRAIN_LVLS.includes(p.brain.level[g])?p.brain.level[g]:'easy';

// FP_MAKERS[game] = {make(r, level) -> a puzzle in the game's own format (or null), ok(puzzle, level) -> true if it is fair}
const FP_MAKERS={};
// Makes a checked puzzle: {pz, key (its shuffle seed), idx (picks the answer-button layout), lvl}, or null.
function fpMake(g,l,key){
  const M=FP_MAKERS[g]; if(!M) return null;
  for(let k=0;k<120;k++){
    const kk=key+'#'+k, r=brRand(kk), pz=M.make(r,l);
    if(pz&&M.ok(pz,l)) return {pz,key:kk,idx:Math.floor(r()*8),lvl:l};
  }
  return null;
}

/* ---------- 🚂 Pattern Train ---------- */
const FP_UNITS=['AB','ABC','AAB','ABB','AABB','ABCD'];
// The repeat length when the gap is filled with a (0 = the train doesn't repeat), the same rule as the smoke test's.
function fpTrainPer(q,a){const f=q.map(t=>t==='?'?a:t);for(let p=1;p<=f.length/2;p++)if(f.every((t,i)=>i<p||t===f[i-p]))return p;return 0;}
function fpTrainHard(r){
  const L=fpInt(r,5,6), kind=fpInt(r,0,6), seq=[]; let h='';
  if(kind===0){const a=fpInt(r,1,20),n=fpInt(r,2,9);for(let i=0;i<L;i++)seq.push(a+i*n);h=`Each wagon is ${n} more.`;}
  else if(kind===1){const n=fpInt(r,2,10),k=fpInt(r,1,4);for(let i=0;i<L;i++)seq.push((k+i)*n);h=`Count by ${n}s.`;}
  else if(kind===2){const n=fpInt(r,2,6),a=n*(L-1)+fpInt(r,1,15);for(let i=0;i<L;i++)seq.push(a-i*n);h=`Each wagon is ${n} less.`;}
  else if(kind===3){const a=fpInt(r,1,4);for(let i=0;i<L;i++)seq.push(a*2**i);h='Each wagon is double the one before.';}
  else if(kind===4){const k=fpInt(r,1,4);for(let i=0;i<L;i++)seq.push(k*2**(L-1-i));h='Each wagon is half the one before.';}
  else if(kind===5){const k=fpInt(r,1,3);for(let i=0;i<L;i++)seq.push((k+i)*(k+i));h=`${k}×${k}, ${k+1}×${k+1}, ${k+2}×${k+2} …`;}
  else {const a=fpInt(r,1,9),s=fpInt(r,1,2);let v=a;for(let i=0;i<L;i++){seq.push(v);v+=s+i;}h=`Add ${s}, then ${s+1}, then ${s+2} …`;}
  const gap=r()<0.7?L-1:fpInt(r,1,L-2), a=seq[gap], step=Math.abs(gap?seq[gap]-seq[gap-1]:seq[1]-seq[0]);
  const wrong=fpMix(r,[...new Set([a+1,a-1,a+2,a-2,a+step,a-step,a+10].filter(v=>v>0&&v!==a))]).slice(0,3);
  const s=seq.map((v,i)=>i===gap?'?':String(v));
  return {s:s.join(' '),a:String(a),o:[a,...wrong].sort((x,y)=>x-y).join(' '),h};
}
FP_MAKERS.train={
  make(r,l){
    if(l==='hard') return fpTrainHard(r);
    const u=fpPick(r,FP_UNITS), keys=[...new Set(u)], co=fpMix(r,Object.keys(TR_COLORS)), sh=fpMix(r,Object.keys(TR_SHAPES));
    const mode=fpInt(r,0,2); // Medium: 0 = shapes change, 1 = colors change, 2 = both
    const tok=i=>l==='easy'?co[i]:mode===0?sh[i]+co[0]:mode===1?sh[0]+co[i]:sh[i]+co[i];
    const map={}; keys.forEach((c,i)=>{map[c]=tok(i);});
    const toks=keys.map(c=>map[c]), len=fpInt(r,Math.max(6,u.length*2),8), seq=Array.from({length:len},(_,i)=>map[u[i%u.length]]);
    const gap=r()<0.65?len-1:fpInt(r,1,len-2), a=seq[gap]; seq[gap]='?';
    // the choices: the answer, the other wagons in the train, and one that isn't in it
    const extra=l==='easy'?co.find(c=>!toks.includes(c)):fpMix(r,Object.keys(TR_COLORS).map(c=>a[0]+c).concat(Object.keys(TR_SHAPES).map(s=>s+a[1]))).find(t=>!toks.includes(t));
    const n=l==='medium'&&keys.length>=3?4:3;
    const o=fpMix(r,[a,...fpMix(r,[...toks.filter(t=>t!==a),extra]).slice(0,n-1)]);
    return {s:seq.join(' '),a,o:o.join(' ')};
  },
  ok(z,l){
    const q=trList(z.s), o=trList(z.o);
    const tk=t=>l==='easy'?!!TR_COLORS[t]:l==='medium'?t.length===2&&!!TR_SHAPES[t[0]]&&!!TR_COLORS[t[1]]:/^\d+$/.test(t)&&Number(t)<1000;
    if(!(q.filter(t=>t==='?').length===1&&q.every(t=>t==='?'||tk(t))&&o.every(tk)&&o.includes(z.a)&&new Set(o).size===o.length&&o.length>=3)) return false;
    if(l==='hard') return !!z.h&&o.length===4;
    return fpTrainPer(q,z.a)>0&&o.filter(a=>a!==z.a).every(a=>!fpTrainPer(q,a));
  }
};

/* ---------- 🫧 Number Pop ---------- */
const FP_POP_HARD=[12,18,20,24,28,30,32,36,40,42,48];
FP_MAKERS.pop={
  make(r,l){
    if(l==='easy'){const t=fpInt(r,1,6), others=[1,2,3,4,5,6].filter(n=>n!==t), b=[];
      for(let i=fpInt(r,3,5);i>0;i--) b.push(t); for(let i=fpInt(r,3,5);i>0;i--) b.push(fpPick(r,others));
      return {t,b:fpMix(r,b)};}
    if(l==='medium'){const t=r()<0.5?10:20, used=fpMix(r,Array.from({length:t/2-1},(_,i)=>i+1)).slice(0,fpInt(r,2,t===10?4:5)), b=[];
      used.forEach(a=>b.push(a,t-a));
      if(r()<0.7){const d=fpMix(r,Array.from({length:t-1},(_,i)=>i+1)).find(d=>!b.includes(d)&&!b.includes(t-d)); if(d) b.push(d);} // one lonely decoy
      return {t,b:fpMix(r,b)};}
    const t=fpPick(r,FP_POP_HARD), f=[], no=[];
    for(let n=1;n<=t;n++)(t%n===0?f:no).push(n);
    return {t,b:[...f,...fpMix(r,no).slice(0,fpInt(r,3,5))].sort((x,y)=>x-y)};
  },
  ok(z,l){
    if(!Array.isArray(z.b)||!z.b.every(n=>Number.isInteger(n)&&n>=1)) return false;
    if(l==='easy') return z.b.every(n=>n<=6)&&popNeed(z,'easy')>=3&&z.b.length<=10;
    if(l==='hard') return z.b.every(n=>n<=z.t)&&z.b.length<=15&&new Set(z.b).size===z.b.length&&popNeed(z,'hard')>=6
      &&popNeed(z,'hard')===Array.from({length:z.t},(_,i)=>i+1).filter(n=>z.t%n===0).length;
    const c={}; z.b.forEach(n=>{c[n]=(c[n]||0)+1;});
    return popNeed(z,'medium')>=4&&Object.keys(c).every(k=>{const n=+k,m=z.t-n;return n===m?c[n]%2===0||c[n]===1:!c[m]||c[m]===c[n];});
  }
};

/* ---------- 🧁 Snack Stand ---------- */
const FP_SNACK={cupcake:['cupcake','cupcakes','🧁'],cookie:['cookie','cookies','🍪'],juice:['juice','juices','🧃']};
const fpCap=s=>s[0].toUpperCase()+s.slice(1);
FP_MAKERS.snack={
  make(r,l){
    const its=fpMix(r,Object.keys(FP_SNACK));
    if(l==='easy') return {n:fpInt(r,2,10),it:its[0]};
    if(l==='medium') return {o:its.slice(0,fpInt(r,2,3)).map(it=>[it,fpInt(r,2,9)])};
    const [one,many,em]=FP_SNACK[its[0]], [one2,,em2]=FP_SNACK[its[1]], T=fpInt(r,0,5);
    if(T===0){const k=fpInt(r,2,6),b=fpInt(r,2,8);return {q:`${fpCap(many)} come in boxes of ${k}. How many ${many} are in ${b} boxes?`,a:k*b,pic:`📦×${b} ${em}×${k}`};}
    if(T===1){const P=fpPick(r,[10,20,50]),c=fpInt(r,3,P-1);return {q:`The order costs ${c} 🪙. You pay with ${P} 🪙. How much change do you give back?`,a:P-c,pic:`🪙${P} − 🪙${c}`};}
    if(T===2){const k=fpInt(r,2,9),n=fpInt(r,2,9);return {q:`${fpCap(many)} cost ${k} 🪙 each. How much do ${n} ${many} cost?`,a:k*n,pic:`${em}×${n} · ${k} 🪙 each`};}
    if(T===3){const n=fpInt(r,2,4),k=fpInt(r,2,9),k2=fpInt(r,2,9);return {q:`${n} ${many} at ${k} 🪙 each and 1 ${one2} at ${k2} 🪙. How much in all?`,a:n*k+k2,pic:`${em.repeat(n)} + ${em2}`};}
    if(T===4){const n=fpInt(r,2,6),k=fpInt(r,2,9),P=[20,50,100].find(P=>P>n*k);return {q:`${n} ${many} at ${k} 🪙 each. You pay with ${P} 🪙. How much change?`,a:P-n*k,pic:`${em}×${n} · 🪙${P}`};}
    const f=fpInt(r,2,5),e=fpInt(r,2,6);
    return {q:`${f*e} ${many} are shared fairly by ${f} friends. How many does each friend get?`,a:e,pic:`${em}×${f*e} ÷ ${f}`};
  },
  ok(z,l){
    if(l==='easy') return Number.isInteger(z.n)&&z.n>=1&&z.n<=10&&!!SNACK_ART[z.it];
    if(l==='medium') return Array.isArray(z.o)&&z.o.length>=2&&z.o.every(([it,n])=>SNACK_ART[it]&&n>=1&&n<=9);
    return typeof z.q==='string'&&Number.isInteger(z.a)&&z.a>=1&&z.a<=100&&!!z.pic;
  }
};

/* ---------- 🃏 Memory Match ---------- */
// Pictures: her buddy, the five buddies, the pets and the room things the fixed boards use (so every one is known to draw).
const fpMemPool=()=>[...new Set(BRAIN_LVLS.flatMap(l=>MEM_SETS[l].flat()))].filter(id=>id!=='me'&&(id[0]!=='d'||DECOR[id.slice(2)]));
FP_MAKERS.memory={
  make(r,l){
    const n=[3,6,10][BRAIN_LVLS.indexOf(l)], me=r()<0.3, pool=fpMix(r,fpMemPool().filter(id=>!(me&&id.startsWith('b:'))));
    return me?['me',...pool.slice(0,n-1)]:pool.slice(0,n);
  },
  ok(z,l){
    return Array.isArray(z)&&z.length===[3,6,10][BRAIN_LVLS.indexOf(l)]&&new Set(z).size===z.length
      &&!(z.includes('me')&&z.some(x=>x.startsWith('b:')))&&z.every(id=>id==='me'||/^[bpd]:/.test(id));
  }
};

/* ---------- 🍕 Fraction Bakery ---------- */
const FP_FRAC={'1/2':'½','1/3':'⅓','2/3':'⅔','1/4':'¼','3/4':'¾','1/5':'⅕','2/5':'⅖','3/5':'⅗','4/5':'⅘','1/6':'⅙','5/6':'⅚','1/8':'⅛','3/8':'⅜','5/8':'⅝','7/8':'⅞'};
const FP_BAKE_THINGS=[['strawberries','🍓'],['cookies','🍪'],['cupcakes','🧁'],['donuts','🍩'],['muffins','🧁']];
FP_MAKERS.bake={
  make(r,l){
    if(l==='easy'){const n=fpInt(r,2,4), m=fpPick(r,[2,3,4].filter(x=>x!==n));
      return {k:fpPick(r,['pizza','cake','cookie']),n,o:fpMix(r,[String(n),n+'u',r()<0.5?String(m):m+'u']).join(' ')};}
    if(l==='medium'){const k=fpPick(r,['pizza','cake']), b=fpPick(r,k==='cake'?[2,3,4,6]:[2,3,4,6,8]), cap=k==='cake'?6:8;
      return {k,a:fpInt(r,1,b-1),b,n:b*fpInt(r,1,Math.floor(cap/b))};}
    const fr=fpPick(r,Object.keys(FP_FRAC)), [fa,fb]=fr.split('/').map(Number), f=FP_FRAC[fr], [th,em]=fpPick(r,FP_BAKE_THINGS), T=fpInt(r,0,3);
    if(T===2){const N=fb*fpInt(r,1,Math.max(1,Math.floor(12/fb)));
      return {q:`A pizza has ${N} slices. You eat ${f} of it. How many slices are left?`,a:N-N*fa/fb,pic:`🍕 ${N} slices`};}
    const N=fb*fpInt(r,2,Math.max(2,Math.floor(40/fb)));
    if(T===0) return {q:`There are ${N} ${th}. You put ${f} of them on the cake. How many is that?`,a:N*fa/fb,pic:`${em}×${N}`};
    if(T===1) return {q:`${f} of ${N} ${th} have sprinkles. How many ${th} have sprinkles?`,a:N*fa/fb,pic:`${em}×${N}`};
    return {q:`${N} friends come to the bakery and ${f} of them want cake. How many want cake?`,a:N*fa/fb,pic:`🎂 ${f} of ${N}`};
  },
  ok(z,l){
    if(l==='easy'){const o=trList(z.o);return o.length===3&&new Set(o).size===3&&o.includes(String(z.n))&&o.every(x=>/^[234]u?$/.test(x))&&!!FB_TREATS[z.k];}
    if(l==='medium') return !!FB_TREATS[z.k]&&z.a>0&&z.a<z.b&&z.n<=8&&z.n%z.b===0&&Number.isInteger(z.a*z.n/z.b);
    return typeof z.q==='string'&&Number.isInteger(z.a)&&z.a>=1&&z.a<=100&&!!z.pic;
  }
};

/* ---------- 🔮 Marble Maze (9 × 6, like the fixed ones) ---------- */
// The shortest way from S to G (cell centers, like the smoke test's mzPath), or [] if there is none.
function fpMazePath(m){
  const R=m.length, C=m[0].length, key=(c,r)=>r*C+c; let s, g;
  m.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==='S')s=[c,r];if(ch==='G')g=[c,r];}));
  if(!s||!g) return [];
  const prev={}; prev[key(...s)]=-1; const q=[s];
  while(q.length){const [c,r]=q.shift();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=r+dr;
    if(nc<0||nr<0||nc>=C||nr>=R||'#o'.includes(m[nr][nc]))continue;const k=key(nc,nr);if(k in prev)continue;prev[k]=key(c,r);q.push([nc,nr]);}}
  const path=[]; let k=key(...g); if(!(k in prev)) return [];
  while(k!==-1){path.unshift([k%C+0.5,Math.floor(k/C)+0.5]);k=prev[k];}
  return path;
}
FP_MAKERS.maze={
  make(r){
    // A corridor maze: rooms on the even squares of the top 5 rows (5 × 3), joined by a random search, so there is
    // always exactly one way through; then 1-3 extra gaps for a little choice. Row 6 has the star hole and a few nooks.
    const W=9, H=6, g=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>y<5&&x%2===0&&y%2===0?'.':'#')), seen={};
    const dig=(x,y)=>{seen[x+','+y]=1;
      for(const [dx,dy] of fpMix(r,[[2,0],[-2,0],[0,2],[0,-2]])){const nx=x+dx, ny=y+dy;
        if(nx<0||ny<0||nx>=W||ny>4||seen[nx+','+ny]) continue;
        g[y+dy/2][x+dx/2]='.'; dig(nx,ny);}};
    dig(0,0);
    const gaps=[]; for(let y=0;y<5;y++) for(let x=0;x<W;x++) if(g[y][x]==='#'&&(x%2)!==(y%2)) gaps.push([x,y]);
    fpMix(r,gaps).slice(0,fpInt(r,1,3)).forEach(([x,y])=>{g[y][x]='.';});
    for(let x=0;x<W-1;x+=2) if(r()<0.35) g[5][x]='.'; // nooks under the bottom rooms
    g[0][0]='S'; g[5][8]='G';
    if(r()<0.5) g.forEach(row=>row.reverse());   // mirror it so the start is in any corner
    if(r()<0.5) g.reverse();
    let path=fpMazePath(g.map(row=>row.join(''))); if(path.length<16) return null;
    // a few bumpers in open spaces, away from the way through
    const near=(c,r)=>path.some(([pc,pr])=>Math.abs(pc-0.5-c)<=1&&Math.abs(pr-0.5-r)<=1);
    const open=[]; for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(g[y][x]==='.'&&!near(x,y)&&[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>g[y+dy]&&g[y+dy][x+dx]==='.').length>=3) open.push([x,y]);
    fpMix(r,open).slice(0,fpInt(r,0,2)).forEach(([x,y])=>{g[y][x]='o';});
    return {map:g.map(row=>row.join(''))};
  },
  ok(z){
    const m=z.map; return m.length===6&&m.every(row=>row.length===9&&/^[.#SGo]+$/.test(row))&&m.join('').split('S').length===2
      &&m.join('').split('G').length===2&&m.join('').split('#').length>10&&fpMazePath(m).length>=16;
  }
};

/* ---------- 💻 Code Lab (Easy: arrows; Medium: arrows + 🔁, and 🔁 is needed) ---------- */
const FP_DIRS={U:[0,-1],D:[0,1],L:[-1,0],R:[1,0]};
// The shortest walk from Fuzzy to the carrot as arrows ('RRDD'), or null.
function fpCodeWalk(map){
  const g=codeParse({map}), key=(x,y)=>x+','+y, prev={}; prev[key(g.start.x,g.start.y)]=null; const q=[[g.start.x,g.start.y]];
  while(q.length){const [x,y]=q.shift(); if(x===g.goal.x&&y===g.goal.y){let s='',k=key(x,y);while(prev[k]){s=prev[k][0]+s;k=prev[k][1];}return s;}
    for(const d in FP_DIRS){const nx=x+FP_DIRS[d][0], ny=y+FP_DIRS[d][1], k=key(nx,ny);
      if(nx<0||ny<0||nx>=g.w||ny>=g.h||g.wall[k]||k in prev) continue; prev[k]=[d,key(x,y)]; q.push([nx,ny]);}}
  return null;
}
// The fewest blocks for n steps one way, with 🔁 (2 × 3 = 6 and 2 × 4 = 8, because repeats in a row multiply).
const fpRun=(n,a)=>n<=0?'':n===1?a:n<=4?n+a:n===5?'4'+a+a:n===6?'32'+a:n===8?'24'+a:'4'+a+fpRun(n-4,a);
FP_MAKERS.code={
  make(r,l){
    const med=l==='medium', w=fpInt(r,3,med?6:5), h=fpInt(r,3,med?6:5), cells=[];
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) cells.push([x,y]);
    const [[fx,fy],[cx,cy],...rest]=fpMix(r,cells), g=Array.from({length:h},()=>Array(w).fill('.'));
    g[fy][fx]='F'; g[cy][cx]='C';
    if(med){
      const dx=cx-fx, dy=cy-fy; if(Math.max(Math.abs(dx),Math.abs(dy))<3) return null;
      const X=fpRun(Math.abs(dx),dx>0?'R':'L'), Y=fpRun(Math.abs(dy),dy>0?'D':'U'), sol=r()<0.5?X+Y:Y+X;
      return {id:'free',map:g.map(row=>row.join('')),max:sol.length,sol};
    }
    if(w*h>=12) rest.slice(0,fpInt(r,0,2)).forEach(([x,y])=>{g[y][x]='#';});
    const map=g.map(row=>row.join('')), sol=fpCodeWalk(map); if(!sol) return null;
    return {id:'free',map,max:Math.min(12,sol.length+2),sol};
  },
  ok(z,l){
    if(!z||!z.sol||codeSim(z,[...z.sol],null).end!=='win'||z.sol.length>z.max) return false;
    const walk=fpCodeWalk(z.map); if(!walk||walk.length<2) return false;
    return l==='medium'?walk.length>z.max&&[...z.sol].every(t=>'UDLR234'.includes(t)):walk.length<=10&&z.max<=12&&/^[UDLR]+$/.test(z.sol);
  }
};

/* ---------- coins ---------- */
// +1 per Free Play puzzle, FREE_DAILY a day in all. Returns the line for the done box.
function fpPay(x,y){
  const p=P(), day=fpDay(); if(p.free.day!==day) p.free={day,n:0};
  p.stats.free++;
  if(p.free.n<FREE_DAILY){p.free.n++;earn(1,'Free Play',x,y);return '+1 🪙';}
  save();
  if(fpToldDay===p.id+day||p.easy) return '';
  fpToldDay=p.id+day; return '<br><small>Free Play coins are full for today! Keep playing for fun ✨</small>';
}

/* ---------- 🎲 in the Brain Games ---------- */
function fpDice(g,l){
  if(!FP_BRAIN.includes(g)) return '';
  return `<button class="br-dot br-dice${BR.free&&!BR.free.daily?' on':''}${brLevelDone(P(),g,l)?' glow':''}" data-dice aria-label="Free Play: a new puzzle">🎲</button>`;
}
function fpBrain(g,l){
  if(!FP_BRAIN.includes(g)) g='snack';
  const fz=fpMake(g,l,fpSeed()); if(!fz){brPuzzle(g,l,0);return;}
  brPuzzle(g,l,fz.idx,fz);
}
// Called by brWin() for a made-up puzzle.
function fpBrainWin(){
  const p=P(), g=BR.game, l=BR.lvl, G=BRAIN_GAMES[g], fz=BR.free, tok=BR.tok;
  SFX.cheer(); vibrate(30); brSay(p.easy?'🎉🎉🎉':'You did it! 🎉');
  let line;
  if(fz.daily){
    if(p.potd.day!==fz.day){p.potd.day=fz.day;p.stats.potd++;earn(POTD_COINS,'Puzzle of the Day!');line=`+${POTD_COINS} 🪙`;}
    else {save();line=p.easy?'':'<br>Practice makes perfect ✨';}
  } else line=fpPay();
  BR.timer=setTimeout(()=>{
    if(cur!=='brain'||BR.view!=='play'||BR.tok!==tok) return;
    modal(fz.daily?'📅 Puzzle of the Day solved!':`🎲 ${G.icon} Solved!`,`<div style="text-align:center;font-size:18px">🎉 ${line}</div>`,
      [{text:'📚 Games',cls:'ghost',on:brMenu},{text:'🎲 Another one!',cls:'pink',on:()=>fpBrain(g,l)}]);
  },900);
}

/* ---------- 📅 Puzzle of the Day (the Brain Games menu) ---------- */
BR_MENU_TOP.push(p=>{
  const day=fpDay(), g=potdGame(day), G=BRAIN_GAMES[g], done=p.potd.day===day;
  return `<button class="br-daily${done?' done':''}" data-potd style="--gc:${G.color}" aria-label="Puzzle of the Day: ${G.name}">`
    +`<span class="br-gi">📅</span><span class="br-dt"><b>Puzzle of the Day</b><small>${G.icon} ${G.name}</small></span>`
    +`<i>${done?'✔ Solved today 🎉':`+${POTD_COINS} 🪙`}</i></button>`;
});
$('#brMenu').addEventListener('click',e=>{if(e.target.closest('[data-potd]')){SFX.click();potdOpen();}});
function potdOpen(){
  const p=P(), day=fpDay(), g=potdGame(day), l=potdLevel(p,g), fz=fpMake(g,l,`day:${day}:${g}:${l}`); if(!fz) return;
  fz.daily=true; fz.day=day; brPuzzle(g,l,fz.idx,fz);
}

/* ---------- 🎲 in the Marble Maze ---------- */
function fpMazeBtn(){
  const p=P(), all=MAZES.every(m=>p.maze.solved.includes(m.id));
  return `<button class="tab mzb mz-dice${MZ.free?' on':''}${all?' glow':''}" id="mzDice" aria-label="Free Play: a new maze">🎲</button>`;
}
function fpMaze(){
  const fz=fpMake('maze','easy',fpSeed()); if(!fz){mzStart(0);return;}
  mzStart(0,{id:'free',name:'Free Play maze',map:fz.pz.map});
}
// Called by mzWin() for a made-up maze. It counts for Marble Marathon (stats.mazes), like a replay.
function fpMazeWin(){
  const p=P(), G=MZ.geo, r=mzc.getBoundingClientRect(), free=MZ.free;
  p.stats.mazes++; SFX.happy();
  const line=fpPay(G?r.left+G.ox+MZ.gx*G.cs:null,G?r.top+G.oy+MZ.gy*G.cs:null);
  mzBar();
  modal('🎲 Maze done!',`<div style="font-size:22px;text-align:center">🎉 ${line}</div>`,
    [{text:'🔁 Again',cls:'ghost',on:()=>mzStart(0,free)},{text:'🎲 Another one!',cls:'pink',on:fpMaze}]);
}

/* ---------- 🎲 in the Code Lab (Easy and Medium) ---------- */
function fpCodeTile(lv){
  if(lv!=='easy'&&lv!=='medium') return '';
  const p=P(), all=CODE_PUZZLES[lv].every(q=>p.code.solved.includes(q.id));
  return `<button class="clp clp-dice${all?' glow':''}" data-dice aria-label="Free Play: a new board"><span class="fp-dice">🎲</span><b>${p.easy?'':'New'}</b></button>`;
}
function fpCode(lvl){
  if(lvl!=='easy'&&lvl!=='medium') lvl='easy';
  const fz=fpMake('code',lvl,fpSeed()); if(!fz){clPickView();return;}
  clOpen(lvl,0,fz.pz);
}
// Called by clWin() for a made-up board.
function fpCodeWin(){
  const p=P(), lvl=CL.lvl, n=CL.prog.length;
  CL.state='win'; clProg();
  const hop=$('#clFz .clhop'); if(hop) hop.classList.add('on');
  SFX.cheer(); vibrate(30);
  const line=fpPay();
  CL.timer=setTimeout(()=>{
    if(cur!=='code'||CL.view!=='play') return;
    modal('🥕 Yum! 🎲 Board solved!',`<div style="text-align:center;font-size:17px">${p.easy?'🎉':`${esc(p.mascotName)} followed your program all the way! 🎉`}<br>${n} block${n>1?'s':''} · ${line}</div>`,
      [{text:'🧩 Puzzles',cls:'ghost',on:clPickView},{text:'🎲 Another one!',cls:'pink',on:()=>fpCode(lvl)}]);
  },700);
}

/* ---------- stickers (Code & Brain page; total counts, never streaks) ---------- */
STICKERS.push(
  stk('free10','code','🎲','Dice Roller','circle','Solve 10 🎲 Free Play puzzles',10,p=>p.stats.free),
  stk('free50','code','🧭','Puzzle Explorer','star','Solve 50 🎲 Free Play puzzles',50,p=>p.stats.free),
  stk('potd5','code','📅','Daily Thinker','scallop','Solve 5 📅 Puzzles of the Day (any days)',5,p=>p.stats.potd)
);
