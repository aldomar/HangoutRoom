'use strict';
/* =========================================================
   35. BRAIN GAMES (v1.33), part 3: 🚂 Pattern Train and 🔤 Word Builder (the menu and screen are section 28)
   Pattern Train: a little train whose wagons follow a pattern; one wagon is a ❓. Pick the wagon that fits.
   Easy = colors, Medium = shapes (later the color counts too), Hard = number sequences (a hint after a wrong try).
   A wagon is a short code: Easy 'r' (a color), Medium 'Sy' (shape + color), Hard a number. '?' marks the gap.
   Word Builder: Easy = tap the first letter of the picture; Medium = build a 3-letter word; Hard = spell the picture.
   Letters are tapped in order; a wrong letter just wobbles. Tiles are the word's letters plus a few extra, in a fixed
   order (a shuffle seeded by the puzzle id). A picture is an emoji or a memPic id ('d:bat', 'b:fox' ...).
   With Read to me on (section 34), tapping a picture or a letter says it out loud; 🔊 says the word.
   Puzzle ids are 'train:e1' ... and 'word:e1' ...: never reorder or remove puzzles, only add new ones at the end.
   ========================================================= */

/* ---------- 🚂 Pattern Train ---------- */
const TR_COLORS={r:['#ff6b6b','red'],b:['#6bb8ff','blue'],y:['#ffd166','yellow'],g:['#7ed957','green'],p:['#a97cff','purple'],k:['#ff8cc6','pink']};
const TR_SHAPES={S:'star',H:'heart',C:'circle',Q:'square',T:'triangle',M:'moon'};
const TR_PUZ={
  easy:[{s:'r b r b r ?',a:'b',o:'r b y'},{s:'y g y g y g ?',a:'y',o:'g y p'},{s:'r b y r b y r ?',a:'b',o:'y b r'},{s:'p y ? y p y',a:'p',o:'y g p'},
    {s:'g g p g g p g ?',a:'g',o:'p g b'},{s:'b y y b y y b ?',a:'y',o:'b r y'},{s:'k k b b k k b ?',a:'b',o:'b k y'},{s:'r b y g r b y ?',a:'g',o:'r g y'}],
  medium:[{s:'Sy Hk Sy Hk Sy ?',a:'Hk',o:'Sy Hk Cb'},{s:'Cb Qg Tr Cb Qg ?',a:'Tr',o:'Tr Cb Qg'},{s:'Sy Sy Mb Sy Sy ?',a:'Mb',o:'Sy Hk Mb'},{s:'Hk Cb Cb Hk Cb ?',a:'Cb',o:'Hk Cb Tr'},
    {s:'Tr ? Tr Qg Tr Qg',a:'Qg',o:'Tr Qg Cb'},{s:'Sk Sb Sy Sk Sb ?',a:'Sy',o:'Sy Hy Sk'},{s:'Hk Hb Ck Cb Hk Hb Ck ?',a:'Cb',o:'Cb Ck Hk Hb'},{s:'Mb Sy Sy Mb Sy Sy Mb ?',a:'Sy',o:'Mb Sy My'}],
  hard:[{s:'2 4 6 8 ?',a:'10',o:'9 10 11 12',h:'Each wagon is 2 more.'},{s:'5 ? 15 20 25',a:'10',o:'6 10 12 15',h:'Count by 5s.'},
    {s:'30 27 24 21 ?',a:'18',o:'17 18 19 20',h:'Each wagon is 3 less.'},{s:'1 2 4 8 16 ?',a:'32',o:'18 24 32 64',h:'Each wagon is double the one before.'},
    {s:'1 4 9 16 25 ?',a:'36',o:'30 34 36 49',h:'1×1, 2×2, 3×3 …'},{s:'3 4 6 9 13 ?',a:'18',o:'15 17 18 19',h:'Add 1, then 2, then 3 …'},
    {s:'1 1 2 3 5 8 ?',a:'13',o:'11 12 13 16',h:'Add the two wagons before.'},{s:'96 48 24 12 ?',a:'6',o:'0 2 6 8',h:'Each wagon is half the one before.'}]
};
const trList=s=>s.split(' ');
function trShape(k,c,x,y){ // a shape about 30 across, centered on x,y
  const L=`stroke="#2b2235" stroke-width="2.5" stroke-linejoin="round" fill="${c}"`;
  if(k==='S') return `<path d="${starPath(x,y,17)}" ${L}/>`;
  if(k==='H') return `<path d="${heartPath(x,y+1,13)}" ${L}/>`;
  if(k==='C') return `<circle cx="${x}" cy="${y}" r="14" ${L}/>`;
  if(k==='Q') return `<rect x="${x-13}" y="${y-13}" width="26" height="26" rx="3" ${L}/>`;
  if(k==='T') return `<path d="M${x} ${y-15} L${x+16} ${y+13} H${x-16}Z" ${L}/>`;
  return `<path d="M${x+6} ${y-16} A16 16 0 1 0 ${x+6} ${y+16} A12 13 0 1 1 ${x+6} ${y-16}Z" ${L}/>`; // moon
}
function trWagon(t,l,x){ // one wagon, 70 wide, from x
  const gap=t==='?', col=!gap&&l==='easy'?TR_COLORS[t][0]:'#fff6e8';
  let g=`<g transform="translate(${x} 0)"><rect x="-6" y="44" width="10" height="5" fill="#5b4a6b"/>`
    +`<rect x="4" y="12" width="62" height="42" rx="8" fill="${gap?'#ffffff22':col}" stroke="${gap?'#fff':'#2b2235'}" stroke-width="3"${gap?' stroke-dasharray="7 5"':''}/>`
    +`<circle cx="19" cy="60" r="8" fill="#3b2f52" stroke="#2b2235" stroke-width="2.5"/><circle cx="51" cy="60" r="8" fill="#3b2f52" stroke="#2b2235" stroke-width="2.5"/>`;
  if(gap) g+=`<text x="35" y="44" text-anchor="middle" font-size="28" font-weight="900" fill="#ffd166">?</text>`;
  else if(l==='medium') g+=trShape(t[0],TR_COLORS[t[1]][0],35,33);
  else if(l==='hard') g+=`<text x="35" y="${t.length>2?42:44}" text-anchor="middle" font-size="${t.length>2?22:27}" font-weight="900" fill="#2b2235">${t}</text>`;
  else g+=`<path d="M12 22 H58" stroke="#ffffff88" stroke-width="4" stroke-linecap="round"/>`;
  return g+'</g>';
}
const TR_ENGINE=`<g><rect x="6" y="20" width="44" height="34" rx="8" fill="#ff8cc6" stroke="#2b2235" stroke-width="3"/><rect x="38" y="2" width="30" height="52" rx="6" fill="#a97cff" stroke="#2b2235" stroke-width="3"/>`
  +`<rect x="44" y="9" width="18" height="16" rx="4" fill="#bfefff" stroke="#2b2235" stroke-width="2.5"/><rect x="14" y="4" width="12" height="18" rx="3" fill="#3b2f52" stroke="#2b2235" stroke-width="2.5"/>`
  +`<circle cx="20" cy="60" r="9" fill="#3b2f52" stroke="#2b2235" stroke-width="2.5"/><circle cx="52" cy="60" r="9" fill="#3b2f52" stroke="#2b2235" stroke-width="2.5"/>`
  +`<circle cx="20" cy="40" r="4" fill="#ffd166"/><path d="M68 44 H76" stroke="#5b4a6b" stroke-width="5"/></g>`;
// The train runs left to right: the wagons in order, then the engine at the front (on the right).
function trTrain(seq,l){const n=seq.length, w=n*74+80;
  return `<svg class="tr-train" viewBox="-4 -10 ${w+8} 82" style="width:min(100%,${w*1.1}px)">`
    +seq.map((t,i)=>trWagon(t,l,i*74)).join('')+`<g transform="translate(${n*74+80} 0) scale(-1 1)">${TR_ENGINE}</g></svg>`;}
const trName=(t,l)=>l==='easy'?TR_COLORS[t][1]:l==='medium'?`${TR_COLORS[t[1]][1]} ${TR_SHAPES[t[0]]}`:t;
BRAIN_GAMES.train={icon:'🚂',name:'Pattern Train',desc:'What comes next?',color:'#6bb8ff',
  puzzles:TR_PUZ,
  start(pz,l,idx){
    const p=P(), seq=trList(pz.s); let tries=0;
    $('#brQ').innerHTML=`<div class="br-card"><div class="br-ask">${p.easy?'🚂 ❓':l==='hard'?'Which number goes in the ❓ wagon?':'Which wagon goes in the ❓ spot?'}</div>${trTrain(seq,l)}</div>`;
    $('#brBoard').innerHTML=`<div class="br-choices">`+trList(pz.o).map(t=>`<button class="br-ch tr-ch" data-t="${t}" aria-label="${trName(t,l)}">`
      +(l==='hard'?`<b>${t}</b>`:`<svg viewBox="-2 6 74 64" width="84" height="73">${trWagon(t,l,0)}</svg>`)+`</button>`).join('')+`</div>`;
    $('#brBoard').onclick=e=>{const b=e.target.closest('[data-t]');if(!b||BR.won)return;
      if(b.dataset.t===pz.a){b.classList.add('right');SFX.happy();
        const s=$('#brQ .tr-train'); if(s) s.outerHTML=trTrain(seq.map(t=>t==='?'?pz.a:t),l);
        $('#brQ .tr-train').classList.add('go'); brWin();}
      else{brOops(b);tries++;if(pz.h&&tries>0)brSay(`💡 ${pz.h}`);}};
  }
};

/* ---------- 🔤 Word Builder ---------- */
const WB_PUZ={
  easy:[{w:'APPLE',pic:'🍎',o:'A M S'},{w:'BEE',pic:'🐝',o:'D B O'},{w:'CAT',pic:'🐱',o:'C T P'},{w:'DUCK',pic:'🦆',o:'G K D'},
    {w:'FISH',pic:'🐟',o:'F H L'},{w:'MOON',pic:'d:moon',o:'N W M'},{w:'STAR',pic:'⭐',o:'S Z R'},{w:'TRAIN',pic:'🚂',o:'P T E'}],
  medium:[{w:'CAT',pic:'🐱',x:'OM'},{w:'DOG',pic:'🐶',x:'BA'},{w:'SUN',pic:'☀️',x:'TE'},{w:'BUS',pic:'🚌',x:'RA'},
    {w:'BAT',pic:'d:bat',x:'PO'},{w:'FOX',pic:'b:fox',x:'AS'},{w:'PIG',pic:'🐷',x:'UT'},{w:'BED',pic:'🛏️',x:'AL'}],
  hard:[{w:'GHOST',pic:'d:ghost',x:'AEL'},{w:'ROBOT',pic:'d:robotPal',x:'EIN'},{w:'SHARK',pic:'d:sharkBean',x:'OTE'},{w:'ROCKET',pic:'d:toyRocket',x:'AIN'},
    {w:'PLANET',pic:'🌍',x:'ORS'},{w:'SOCCER',pic:'⚽',x:'AIK'},{w:'RAINBOW',pic:'🌈',x:'ELU'},{w:'DINOSAUR',pic:'d:dinoPlush',x:'EKT'}]
};
const wbPic=pic=>/^[a-z]:/.test(pic)?`<span class="wb-art">${memPic(pic)}</span>`:`<span class="wb-emo">${pic}</span>`;
// The letter tiles for Medium and Hard: the word's letters and the extra ones, in a fixed shuffled order.
const wbTiles=(pz,l,idx)=>brShuffle([...pz.w,...pz.x],brId('word',l,idx));
let WB={got:0};
function wbSay(w){if(canSpeak())try{window.AndroidBridge.speak(w.toLowerCase());}catch(e){}}
BRAIN_GAMES.word={icon:'🔤',name:'Word Builder',desc:'Letters and words',color:'#ffd166',
  puzzles:WB_PUZ,
  start(pz,l,idx){
    const p=P(), say=canSpeak()?`<button class="btn small ghost wb-say" aria-label="${pz.w.toLowerCase()}">🔊</button>`:'';
    WB={got:0};
    const pic=`<button class="wb-pic" aria-label="${pz.w.toLowerCase()}">${wbPic(pz.pic)}</button>`;
    if(l==='easy'){
      $('#brQ').innerHTML=`<div class="br-card"><div class="br-ask">${p.easy?'🔤 ❓':'What letter does it start with?'}</div>${pic}<div class="wb-word">❓${'<i>•</i>'.repeat(pz.w.length-1)}</div>${say}</div>`;
      $('#brBoard').innerHTML=`<div class="br-choices">`+trList(pz.o).map(c=>`<button class="br-ch wb-tile" data-c="${c}" aria-label="${c}"><b>${c}</b><small>${c.toLowerCase()}</small></button>`).join('')+`</div>`;
    } else {
      $('#brQ').innerHTML=`<div class="br-card"><div class="br-ask">${p.easy?'🔤':l==='medium'?'Tap the letters to spell the word!':'Spell what you see!'}</div>${pic}`
        +`<div class="wb-slots">${[...pz.w].map((c,i)=>`<span class="wb-slot" data-s="${i}">${l==='medium'?`<i>${c}</i>`:''}</span>`).join('')}</div>${say}</div>`;
      $('#brBoard').innerHTML=`<div class="br-choices wb-tiles">`+wbTiles(pz,l,idx).map((c,i)=>`<button class="br-ch wb-tile" data-c="${c}" data-k="${i}" aria-label="${c}"><b>${c}</b></button>`).join('')+`</div>`;
    }
    $('#brQ').onclick=e=>{if(e.target.closest('.wb-say,.wb-pic'))wbSay(pz.w);};
    $('#brBoard').onclick=e=>{const b=e.target.closest('[data-c]');if(!b||BR.won||b.classList.contains('used'))return;wbTap(pz,l,b);};
  }
};
function wbTap(pz,l,b){
  const want=pz.w[WB.got];
  if(b.dataset.c!==want){brOops(b);return;}
  if(l==='easy'){b.classList.add('right');$('#brQ .wb-word').innerHTML=`<b>${pz.w[0]}</b>${pz.w.slice(1).toLowerCase()}`;SFX.happy();wbSay(pz.w);brWin();return;}
  b.classList.add('used'); SFX.pop();
  const s=$(`#brQ .wb-slot[data-s="${WB.got}"]`); if(s){s.textContent=want;s.classList.add('on');}
  WB.got++;
  if(WB.got===pz.w.length){SFX.happy();wbSay(pz.w);brWin();} else if(!P().easy) brSay(`${WB.got} / ${pz.w.length}`);
}

/* ---------- stickers ---------- */
STICKERS.push(
  stk('train8','code','🚂','Pattern Pro','circle','Solve 8 Pattern Train puzzles (📚 Brain Games)',8,p=>brCount(p,'train')),
  stk('word8','code','🔤','Word Wizard','star','Solve 8 Word Builder puzzles (📚 Brain Games)',8,p=>brCount(p,'word'))
);
