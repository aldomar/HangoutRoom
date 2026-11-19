'use strict';
/* =========================================================
   29. BRAIN GAMES (v1.25), part 2: 🃏 Memory Match and 🫧 Number Pop (the menu and Snack Stand are section 28)
   Memory Match: 6 / 12 / 20 cards. The pictures are her own buddy (in today's outfit), the five buddies, the pets and
   room things, drawn without the fuzz filter. Each puzzle is a fixed set of pictures in a fixed order (a shuffle seeded
   by the puzzle id), so a replay is the same board. Solved when every pair is found; missed tries don't count.
   Number Pop: tap the right bubbles. Easy = pop every bubble with this number (shown with dots too); Medium = pop two
   that make 10 (later 20); Hard = pop every factor of a number. Wrong taps just wobble.
   Picture ids: 'me' (her buddy), 'b:<buddy>', 'p:<pet>', 'd:<DECOR key>'. A set with 'me' never has 'b:' pictures,
   because her buddy could look the same as one of them.
   ========================================================= */
function brRand(seed){let h=1779033703^seed.length;for(const c of seed){h=Math.imul(h^c.charCodeAt(0),3432918353);h=h<<13|h>>>19;}
  return ()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return (h>>>0)/4294967296;};}
function brShuffle(arr,seed){const r=brRand(seed),a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ---------- 🃏 Memory Match ---------- */
const flatSVG=s=>s.replace(/ filter="url\(#fuzz\)"/g,'');
function memPic(id){
  const p=P(), [k,v]=id.split(':');
  if(id==='me') return flatSVG(mascotSVG(p.look,'20 0 160 250'));
  if(k==='b') return flatSVG(mascotSVG(Object.assign({},p.look,{kind:v}),'20 0 160 250'));
  if(k==='p') return `<svg viewBox="-62 -92 124 100">${petArt(v,'none')}</svg>`;
  const D=DECOR[v]; return D?`<svg viewBox="${D.box}">${D.d()}</svg>`:'';
}
const MEM_SETS={
  easy:[['me','d:ball','d:plant'],['b:dino','d:toyRocket','d:dinoPlush'],['p:bat','d:ghost','d:moon'],['b:bear','d:beanbag','d:lava'],
    ['me','p:cloudPup','d:beachBall'],['b:puppy','d:dumpTruck','d:robotPal'],['b:fox','d:pumpkin','d:tulipPot'],['p:starHam','d:disco','d:neon']],
  medium:[['me','d:ball','d:plant','d:lava','p:bat','d:toyRocket'],['b:bunny','b:bear','b:puppy','b:dino','b:fox','d:heroBadge'],
    ['p:bat','p:ghostCat','p:cloudPup','p:starHam','d:ghost','d:bat'],['d:dinoPlush','d:dinoNest','d:volcano','d:telescope','d:planetMobile','d:toyRocket'],
    ['me','d:pumpkin','d:owlPlush','d:snowBunny','d:giftStack','d:pineTree'],['d:dumpTruck','d:trafficLight','d:robotPal','d:sharkBean','d:goal','d:speaker'],
    ['d:tulipPot','d:eggBasket','d:beachBall','d:donutFloat','d:lemonade','d:sunLamp'],['d:disco','d:neon','d:lightstick','d:gaming','d:eggChair','d:starMirror']],
  hard:[['b:bunny','b:bear','b:puppy','b:dino','b:fox','p:bat','p:ghostCat','p:cloudPup','p:starHam','d:heroBadge'],
    ['me','d:ball','d:goal','d:plant','d:lava','d:lights','d:neon','d:speaker','d:gaming','d:beanbag'],
    ['me','d:ghost','d:bat','d:blob','d:moon','d:pumpkin','d:owlPlush','d:snowBunny','d:dinoPlush','d:robotPal'],
    ['d:toyRocket','d:planetMobile','d:telescope','d:volcano','d:dinoNest','d:dumpTruck','d:trafficLight','d:sharkBean','d:robotPal','d:heroBadge'],
    ['d:tulipPot','d:eggBasket','d:beachBall','d:donutFloat','d:lemonade','d:sunLamp','d:pineTree','d:giftStack','d:leafPile','d:pumpkin'],
    ['me','p:bat','p:ghostCat','p:cloudPup','p:starHam','d:ghost','d:bat','d:moon','d:disco','d:starMirror'],
    ['d:trampoline','d:slide','d:sandbox','d:tent','d:birdhouse','d:ball','d:goal','d:beachBall','d:plant','d:tulipPot'],
    ['b:bunny','b:bear','b:puppy','b:dino','b:fox','d:dinoPlush','d:toyRocket','d:robotPal','d:sharkBean','d:lava']]
};
let MEM={cards:[],open:[],lock:false,found:0};
// The board for a puzzle: each picture twice, in a fixed shuffled order.
const memDeck=(l,idx)=>brShuffle([...MEM_SETS[l][idx],...MEM_SETS[l][idx]],brId('memory',l,idx));
BRAIN_GAMES.memory={icon:'🃏',name:'Memory Match',desc:'Find the pairs',color:'#a97cff',
  puzzles:{easy:MEM_SETS.easy,medium:MEM_SETS.medium,hard:MEM_SETS.hard},
  start(pz,l,idx){
    const p=P(), deck=BR.free?brShuffle([...pz,...pz],BR.free.key):memDeck(l,idx), faces={}; pz.forEach(id=>{faces[id]=memPic(id);});
    MEM={cards:deck.map(id=>({id,open:false,got:false})),open:[],lock:false,found:0};
    $('#brQ').innerHTML=`<div class="br-ask">${p.easy?'🃏 🔍':`Find the ${pz.length} pairs! Tap two cards.`}</div>`;
    const cols=deck.length<=6?3:deck.length<=12?4:5;
    $('#brBoard').innerHTML=`<div class="mem-grid" style="--cols:${cols};--cw:${cols===5?100:cols===4?124:150}px">`+deck.map((id,i)=>`<button class="mem-card" data-c="${i}"><span class="mem-back">❓</span><span class="mem-face">${faces[id]}</span></button>`).join('')+`</div>`;
    $('#brBoard').onclick=e=>{const b=e.target.closest('[data-c]');if(b)memTap(Number(b.dataset.c));};
  }
};
function memTap(i){
  const c=MEM.cards[i]; if(!c||MEM.lock||c.open||c.got||BR.won) return;
  c.open=true; MEM.open.push(i); $(`.mem-card[data-c="${i}"]`).classList.add('open'); SFX.flip();
  if(MEM.open.length<2) return;
  const [a,b]=MEM.open, A=MEM.cards[a], B=MEM.cards[b];
  if(A.id===B.id){
    A.got=B.got=true; MEM.open=[]; MEM.found++; SFX.happy();
    [a,b].forEach(k=>$(`.mem-card[data-c="${k}"]`).classList.add('got'));
    if(MEM.found*2===MEM.cards.length) brWin(); else brSay(P().easy?'✨':`${MEM.found} of ${MEM.cards.length/2} pairs ✨`);
  } else {
    MEM.lock=true; const tok=BR.tok;
    BR.timer=setTimeout(()=>{if(BR.tok!==tok)return;[a,b].forEach(k=>{MEM.cards[k].open=false;const el=$(`.mem-card[data-c="${k}"]`);if(el)el.classList.remove('open');});MEM.open=[];MEM.lock=false;},850);
  }
}

/* ---------- 🫧 Number Pop ---------- */
// t = the target; b = the bubbles. Medium: pairs that add up to t (a lone number is a decoy). Hard: the factors of t.
const POP_SETS={
  easy:[{t:2,b:[2,1,2,3,2,1,2]},{t:3,b:[3,1,3,2,3,4,1,3]},{t:1,b:[1,2,1,3,1,2]},{t:4,b:[4,2,4,3,1,4,5,4]},
    {t:5,b:[5,3,5,4,5,2,5,1]},{t:3,b:[3,5,3,2,3,6,3,4,1]},{t:6,b:[6,4,6,5,6,3,6,2,6]},{t:5,b:[5,4,6,5,3,5,2,5,6,5]}],
  medium:[{t:10,b:[3,7,6,4,5]},{t:10,b:[2,8,9,1,4,6,5]},{t:10,b:[7,3,1,9,8,2,6]},{t:10,b:[5,5,4,6,3,7,8,2,1]},
    {t:20,b:[12,8,15,5,11,9,14]},{t:20,b:[17,3,13,7,16,4,10,10,18]},{t:20,b:[19,1,14,6,12,8,15,5,11]},{t:20,b:[13,7,18,2,16,4,11,9,15,5,12]}],
  hard:[{t:12,b:[1,2,3,4,5,6,7,8,9,10,11,12]},{t:18,b:[1,2,3,4,5,6,8,9,12,15,18]},{t:24,b:[1,2,3,4,5,6,7,8,9,10,12,16,18,24]},
    {t:20,b:[1,2,3,4,5,6,8,10,12,15,20]},{t:30,b:[1,2,3,4,5,6,8,9,10,12,15,20,30]},{t:36,b:[1,2,3,4,5,6,7,8,9,12,16,18,24,36]},
    {t:42,b:[1,2,3,4,5,6,7,8,12,14,16,21,42]},{t:48,b:[1,2,3,4,5,6,7,8,9,12,14,16,18,24,48]}]
};
// How many bubbles must be popped to win.
function popNeed(pz,l){
  if(l==='easy') return pz.b.filter(n=>n===pz.t).length;
  if(l==='hard') return pz.b.filter(n=>pz.t%n===0).length;
  let k=0; const left=pz.b.slice(); // medium: pairs
  for(let i=0;i<left.length;i++){if(left[i]==null)continue;const j=left.findIndex((v,jj)=>jj!==i&&v!=null&&v+left[i]===pz.t);if(j>=0){left[i]=left[j]=null;k+=2;}}
  return k;
}
let POP={sel:-1,popped:0,need:0,order:[]};
BRAIN_GAMES.pop={icon:'🫧',name:'Number Pop',desc:'Pop the right bubbles',color:'#8ff0d0',
  puzzles:POP_SETS,
  start(pz,l,idx){
    const p=P(), order=brShuffle(pz.b.map((n,i)=>i),brKey('pop',l,idx));
    POP={sel:-1,popped:0,need:popNeed(pz,l),order,pz,l};
    const dots=n=>`<span class="br-dots">${'●'.repeat(n)}</span>`;
    $('#brQ').innerHTML=l==='easy'?`<div class="br-ask">${p.easy?'🫧':'Pop every'} <span class="pop-target"><b>${pz.t}</b>${dots(pz.t)}</span></div>`
      :l==='medium'?`<div class="br-ask">Pop two bubbles that make <span class="pop-target"><b>${pz.t}</b></span></div>`
      :`<div class="br-ask">Pop every number that goes into <span class="pop-target"><b>${pz.t}</b></span> evenly (its factors)</div>`;
    $('#brBoard').innerHTML=`<div class="pop-field">`+order.map((i,k)=>`<button class="nbub" data-b="${i}" style="--d:${(k*0.37)%2}s"><b>${pz.b[i]}</b>${l==='easy'?dots(pz.b[i]):''}</button>`).join('')+`</div>`;
    $('#brBoard').onclick=e=>{const b=e.target.closest('[data-b]');if(b)popTap(Number(b.dataset.b));};
    popCount();
  }
};
function popCount(){if(!P().easy||POP.l!=='easy')brSay(`🫧 ${POP.popped} / ${POP.need}`);}
function popBurst(i){const el=$(`.nbub[data-b="${i}"]`);if(el)el.classList.add('popped');POP.popped++;SFX.pop();}
function popTap(i){
  const pz=POP.pz, n=pz.b[i], el=$(`.nbub[data-b="${i}"]`); if(!el||el.classList.contains('popped')||BR.won) return;
  if(POP.l==='medium'){
    if(POP.sel===i){POP.sel=-1;el.classList.remove('sel');return;}
    if(POP.sel<0){POP.sel=i;el.classList.add('sel');SFX.click();return;}
    const j=POP.sel, other=$(`.nbub[data-b="${j}"]`); POP.sel=-1; if(other) other.classList.remove('sel');
    if(pz.b[j]+n===pz.t){popBurst(j);popBurst(i);}
    else {brOops(el);brWobble(other);brSay(`${pz.b[j]} + ${n} = ${pz.b[j]+n}. Try again! 💪`);return;}
  } else {
    const ok=POP.l==='easy'?n===pz.t:pz.t%n===0;
    if(!ok){brOops(el);if(POP.l==='hard')brSay(`${pz.t} ÷ ${n} leaves ${pz.t%n} over. Try another! 💪`);return;}
    popBurst(i);
  }
  if(POP.popped>=POP.need) brWin(); else popCount();
}
