'use strict';
/* =========================================================
   77. 🔎 WORD SEARCH (v1.90): a Brain game (the menu and puzzle screen are section 28)
   Find the hidden words in a grid of letters: slide a finger from the first letter to the last, or tap the first letter
   and then the last (easier for little hands). Either way round counts. No timer and no wrong answers: a line that
   isn't a word just clears with a soft sound.
   Easy 5×5, 3 words, across and down only (the other letters are never in a word, and words show their picture).
   Medium 6×6, 5 words, + diagonal. Hard 7×7, 6 words, every way, backwards too. 7 columns is the most that keeps
   every letter 48 px on an iPhone held upright.
   A fixed puzzle is just its words; its grid is built from a seed of its id (brKey), so it never changes. 🎲 Free Play
   and 📅 Puzzle of the Day pick words from the Word Builder bank (WB_BANK, section 45) and carry their grid (g).
   wsCheck holds the rules: every word is in the grid exactly once, in a way the level allows, and the filler letters
   never make a rude word (WS_NO, written backwards). A word that reads the same both ways (POP, MOM) can't be used: it
   would be found twice; made-up puzzles just roll again. The smoke test checks every fixed and many made-up grids.
   Puzzle ids are 'search:e1' ...: never reorder or remove puzzles, only add new ones at the end.
   Saved: brain.level.search, brain.solved (as every Brain game), stats.searched (puzzles finished, 🎲 ones too).
   ========================================================= */
const WS_SIZE={easy:5,medium:6,hard:7}, WS_COUNT={easy:3,medium:5,hard:6};
const WS_ALL=[[1,0],[0,1],[1,1],[-1,1],[-1,0],[0,-1],[-1,-1],[1,-1]];
const WS_DIRS={easy:WS_ALL.slice(0,2),medium:WS_ALL.slice(0,3),hard:WS_ALL};
const WS_NO='KCUF TIHS TNUC KCID KCOC SSIP NMAD PARC XES SSA TIT GAF LLIK DAED'.split(' ').map(w=>[...w].reverse().join(''));
const WS_COLORS=['#ffd166','#8ff0d0','#c9b0ff','#9fd3ff','#ffb3da','#a8e88a'];
const WS_PUZ={
  easy:[{w:'CAT DOG PIG'},{w:'SUN MOON STAR'},{w:'BEE ANT BUG'},{w:'RED BLUE PINK'},
    {w:'CAKE PIE JAM'},{w:'FOX OWL BAT'},{w:'BUS CAR VAN'},{w:'ONE TWO TEN'}],
  medium:[{w:'FROG DUCK FISH CRAB SHARK'},{w:'ROBOT ROCKET COMET STAR MOON'},{w:'SOCCER GOAL KICK BALL TEAM'},{w:'GHOST BAT NIGHT OWL CAPE'},
    {w:'APPLE PEAR GRAPE PEACH JUICE'},{w:'RAIN SNOW CLOUD WIND STORM'},{w:'DRUM SONG DANCE MUSIC SING'},{w:'SLIME SPIN CUBE CLICK TWIST'}],
  hard:[{w:'FOSSIL VOLCANO REPTILE MAMMAL HABITAT CLIMATE'},{w:'GALAXY PLANET COMET ROCKET ORBIT GRAVITY'},
    {w:'KNIGHT CASTLE CROWN QUEEN SHIELD THRONE'},{w:'GUITAR CHORUS RHYTHM MUSIC STAGE DRUMS'},
    {w:'DOLPHIN WHALE ANCHOR SHARK CORAL OCEAN'},{w:'SOCCER KEEPER TROPHY PENALTY STRIKER HEADER'},
    {w:'ROBOT MAGNET ATOM ENERGY CIRCUIT GEARS'},{w:'ARTIST SKETCH COLOR CANVAS DESIGN PAINT'}]
};
const wsWords=pz=>pz.w.split(' ');
const wsRev=s=>[...s].reverse().join('');

/* ---------- building and checking a grid (no drawing) ---------- */
// Places the words (longest first) and fills the rest; null if they don't fit this time.
// Each word looks at every spot it fits and takes a high-scoring one (v1.90, the owner's wish): crossing a word already
// there (sharing a letter) and going a way no word has gone yet both score, plus a little chance, so the words mix
// across, down, slanted and backwards and cross each other instead of all lying side by side.
const WS_CROSS=3, WS_NEWDIR=4, WS_LUCK=3;
function wsPlace(words,l,r){
  const N=WS_SIZE[l], dirs=WS_DIRS[l], g=Array.from({length:N},()=>Array(N).fill('')), went=new Set();
  for(const w of words.slice().sort((a,b)=>b.length-a.length)){
    let best=null, bs=-1;
    for(const [dx,dy] of dirs)for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      const ex=x+dx*(w.length-1), ey=y+dy*(w.length-1); if(ex<0||ey<0||ex>=N||ey>=N) continue;
      let shared=0, fits=true;
      for(let i=0;i<w.length&&fits;i++){const v=g[y+dy*i][x+dx*i]; if(v===w[i])shared++; else if(v)fits=false;}
      if(!fits||shared===w.length) continue;
      const s=Math.min(shared,2)*WS_CROSS+(went.has(dx+','+dy)?0:WS_NEWDIR)+r()*WS_LUCK;
      if(s>bs){bs=s;best={x,y,dx,dy};}
    }
    if(!best) return null;
    [...w].forEach((c,i)=>{g[best.y+best.dy*i][best.x+best.dx*i]=c;}); went.add(best.dx+','+best.dy);
  }
  if(dirs.length>1&&went.size<2) return null; // never every word the same way: try again
  const used=words.join(''), pool=(l==='easy'?'ABCDEFGHIJKLMNOPRSTUVWY'.split('').filter(c=>!used.includes(c)):'AABCDEEEFGHIIKLMNOOPRSSTTUUWY'.split(''));
  return g.map(row=>row.map(c=>c||fpPick(r,pool.length?pool:['O'])).join(''));
}
// Every place a word can be read: {x, y, dx, dy} in all 8 directions.
function wsFind(g,w){
  const N=g.length, out=[];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)for(const [dx,dy] of WS_ALL){
    let i=0; while(i<w.length){const xx=x+dx*i, yy=y+dy*i; if(xx<0||yy<0||xx>=N||yy>=N||g[yy][xx]!==w[i])break; i++;}
    if(i===w.length) out.push({x,y,dx,dy});
  }
  return out;
}
function wsCheck(g,words,l){
  const N=WS_SIZE[l];
  if(!Array.isArray(g)||g.length!==N||!g.every(row=>typeof row==='string'&&row.length===N&&/^[A-Z]+$/.test(row))) return false;
  if(words.length!==WS_COUNT[l]||new Set(words).size!==words.length) return false;
  const mask=new Set();
  for(const w of words){
    const f=wsFind(g,w);
    if(f.length!==1||!WS_DIRS[l].some(([dx,dy])=>dx===f[0].dx&&dy===f[0].dy)) return false;
    for(let i=0;i<w.length;i++) mask.add((f[0].y+f[0].dy*i)*N+f[0].x+f[0].dx*i);
  }
  // a rude word anywhere that uses even one filler letter = build again
  for(const bad of WS_NO) for(const f of wsFind(g,bad)){
    for(let i=0;i<bad.length;i++) if(!mask.has((f.y+f.dy*i)*N+f.x+f.dx*i)) return false;
  }
  return true;
}
// A fixed puzzle's grid, from its id (the same every time).
function wsBuild(words,l,key){
  for(let k=0;k<400;k++){const g=wsPlace(words,l,brRand(key+'#'+k)); if(g&&wsCheck(g,words,l)) return g;}
  return null;
}

/* ---------- playing ---------- */
let WS={g:null,words:[],got:[],start:null,drag:null,l:'easy'};
const wsCell=(x,y)=>$(`#brBoard .ws-cell[data-x="${x}"][data-y="${y}"]`);
function wsLine(a,b){ // the cells from a to b, snapped to the nearest of the 8 directions
  const dx=b.x-a.x, dy=b.y-a.y, len=Math.max(Math.abs(dx),Math.abs(dy)); if(!len) return [a];
  let best=WS_ALL[0], bs=-9; for(const d of WS_ALL){const s=(d[0]*dx+d[1]*dy)/Math.hypot(d[0],d[1]); if(s>bs){bs=s;best=d;}}
  const N=WS.g.length, out=[];
  for(let i=0;i<=len;i++){const x=a.x+best[0]*i, y=a.y+best[1]*i; if(x<0||y<0||x>=N||y>=N)break; out.push({x,y});}
  return out;
}
function wsPaint(cells){
  $$('#brBoard .ws-cell.sel').forEach(c=>c.classList.remove('sel'));
  (cells||[]).forEach(c=>{const el=wsCell(c.x,c.y); if(el) el.classList.add('sel');});
}
function wsAt(e){const el=document.elementFromPoint(e.clientX,e.clientY), c=el&&el.closest('#brBoard .ws-cell');
  return c?{x:Number(c.dataset.x),y:Number(c.dataset.y)}:null;}
function wsTry(cells){
  wsPaint(null);
  if(cells.length<2) return;
  const s=cells.map(c=>WS.g[c.y][c.x]).join(''), i=WS.words.findIndex((w,k)=>!WS.got.includes(k)&&(w===s||w===wsRev(s)));
  if(i<0){SFX.click();brWobble($('#brBoard .ws-grid'));return;}
  WS.got.push(i);
  cells.forEach(c=>{const el=wsCell(c.x,c.y); if(el){el.classList.add('got');el.style.setProperty('--wc',WS_COLORS[i%WS_COLORS.length]);}});
  const chip=$(`#brQ .ws-w[data-i="${i}"]`); if(chip) chip.classList.add('got');
  SFX.happy(); wbSay(WS.words[i]); vibrate(15);
  if(WS.got.length===WS.words.length){const p=P(); p.stats.searched++; brWin();}
  else if(!P().easy) brSay(`${WS.got.length} / ${WS.words.length}`);
}
function wsStartMark(c){$$('#brBoard .ws-cell.start').forEach(x=>x.classList.remove('start'));WS.start=c;if(c){const el=wsCell(c.x,c.y);if(el)el.classList.add('start');}}
function wsDown(e){
  if(BR.won) return; const c=wsAt(e); if(!c) return; e.preventDefault();
  if(WS.start&&(WS.start.x!==c.x||WS.start.y!==c.y)){const a=WS.start; wsStartMark(null); wsTry(wsLine(a,c)); return;} // tap, then tap
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}
  WS.drag={a:c,b:c,moved:false}; wsPaint([c]);
}
function wsMove(e){
  const d=WS.drag; if(!d) return; const c=wsAt(e); if(!c||(c.x===d.b.x&&c.y===d.b.y)) return;
  d.b=c; d.moved=true; wsStartMark(null); wsPaint(wsLine(d.a,c));
}
function wsUp(){
  const d=WS.drag; if(!d) return; WS.drag=null;
  if(d.moved&&(d.a.x!==d.b.x||d.a.y!==d.b.y)) wsTry(wsLine(d.a,d.b));
  else{wsPaint(null); if(WS.start&&WS.start.x===d.a.x&&WS.start.y===d.a.y)wsStartMark(null); else{wsStartMark(d.a);SFX.pop();}}
}
// Finds every word at once (the smoke test, and a grown-up checking a puzzle in the console).
function wsSolveAll(){WS.words.forEach(w=>{const f=wsFind(WS.g,w)[0];if(f)wsTry(Array.from({length:w.length},(_,i)=>({x:f.x+f.dx*i,y:f.y+f.dy*i})));});return BR.won;}
BRAIN_GAMES.search={icon:'🔎',name:'Word Search',desc:'Find the hidden words',color:'#8ff0d0',
  puzzles:WS_PUZ,
  start(pz,l,idx){
    const p=P(), words=wsWords(pz), g=pz.g||wsBuild(words,l,brKey('search',l,idx)); if(!g) return;
    WS={g,words,got:[],start:null,drag:null,l};
    const N=g.length, pics=l==='easy'||p.easy;
    $('#brQ').innerHTML=`<div class="br-card"><div class="br-ask">${p.easy?'🔎 ✨':l==='hard'?'Find the words! They can go any way, even backwards.':l==='medium'?'Find the words! Across, down or slanted.':'Find the words! Slide across the letters.'}</div>`
      +`<div class="ws-list">`+words.map((w,i)=>{const pic=pics&&WB_PICS[w]&&!/^[a-z]:/.test(WB_PICS[w])?`<span class="ws-pic">${WB_PICS[w]}</span>`:'';
        return `<button class="ws-w" data-i="${i}" style="--wc:${WS_COLORS[i%WS_COLORS.length]}" aria-label="${w.toLowerCase()}">${pic}<b>${w}</b></button>`;}).join('')+`</div></div>`;
    $('#brBoard').innerHTML=`<div class="ws-grid" style="--n:${N}">`+g.map((row,y)=>[...row].map((c,x)=>`<span class="ws-cell" data-x="${x}" data-y="${y}">${c}</span>`).join('')).join('')+`</div>`;
    const grid=$('#brBoard .ws-grid');
    grid.onpointerdown=wsDown; grid.onpointermove=wsMove; grid.onpointerup=wsUp; grid.onpointercancel=()=>{WS.drag=null;wsPaint(null);};
    $('#brQ').onclick=e=>{const b=e.target.closest('.ws-w'); if(b) wbSay(WS.words[Number(b.dataset.i)]);}; // a word chip says the word
    $('#brBoard').onclick=null;
  }
};

/* ---------- 🎲 Free Play + 📅 Puzzle of the Day: words from the Word Builder bank ---------- */
FP_MAKERS.search={
  make(r,l){
    const N=WS_SIZE[l], list=WB_BANK[l].filter(w=>w.length>=3&&w.length<=N), words=[];
    for(let t=0;t<60&&words.length<WS_COUNT[l];t++){
      const w=fpPick(r,list);
      if(!words.some(v=>v.includes(w)||w.includes(v)||v.includes(wsRev(w))||wsRev(w).includes(v))) words.push(w);
    }
    if(words.length<WS_COUNT[l]) return null;
    const g=wsPlace(words,l,r); return g?{w:words.join(' '),g}:null;
  },
  ok(z,l){
    if(!z||typeof z.w!=='string') return false;
    const words=wsWords(z);
    return words.every(w=>WB_BANK[l].includes(w)&&w.length<=WS_SIZE[l])&&wsCheck(z.g,words,l);
  }
};
FP_BRAIN.push('search'); FP_THINK.push('search'); POTD_GAMES.push('search');

/* ---------- stickers ---------- */
STICKERS.push(
  stk('search8','code','🔎','Word Finder','star','Solve 8 Word Search puzzles (📚 Brain Games)',8,p=>brCount(p,'search')),
  stk('search30','code','🔍','Sharp Eyes','circle','Finish 30 word searches (🎲 ones count too)',30,p=>p.stats.searched)
);
