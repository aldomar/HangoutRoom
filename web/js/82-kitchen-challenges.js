'use strict';
/* =====================================================================
   82. 🍳 KITCHEN CHALLENGES (v1.92): the learning puzzles a recipe step can ask
   One maker per kind of challenge, like 🎲 Free Play's FP_MAKERS (section 44):
     KC_MAKERS[id] = {name, lvls, make(r, lvl), ok(pz, lvl)}
   make() turns a seeded random function (brRand, section 29) into a puzzle; ok() checks it with the maker's own rules.
   kcMake(id, lvl, r) rolls until ok() holds, so a station never shows a broken puzzle.
   Every puzzle is plain data (no drawing, no functions), with at least:
     {k: maker id, lvl, shown: the line on screen (emoji are fine), say: the spoken line (30 words at most, no emoji),
      hint: a short spoken help line (20 words at most)}
   A puzzle with buttons to pick from has choices[] (strings) and answer (one of them); pics[] (emoji) go with choices
   when the choice is a picture. Fractions are counted in quarters (q: 1 = ¼ cup), so the math stays in whole numbers.
   Nothing here is saved: puzzles are made fresh each play. The smoke test runs every maker at every level over many seeds.
   Used so far by the 🥗 Fruit Salad's 🥣 bowl (count) and ✨ plate (order, pattern); the rest are for recipes 2-8.
   ===================================================================== */
const KC_MAKERS={};
const kcCap=s=>s[0].toUpperCase()+s.slice(1);
const kcAnd=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
const kcWordsOk=(t,max)=>{const c=spkClean(t);return !!c&&!/\p{Extended_Pictographic}/u.test(c)&&c.split(' ').length<=max;};
// the lines every puzzle needs; a maker's ok() starts with this
const kcPzOk=pz=>!!pz&&!!pz.shown&&kcWordsOk(pz.say,30)&&kcWordsOk(pz.hint,20);
// buttons: 2-4 different choices, the answer among them
const kcChoicesOk=pz=>Array.isArray(pz.choices)&&pz.choices.length>=2&&pz.choices.length<=4&&new Set(pz.choices).size===pz.choices.length
  &&pz.choices.includes(pz.answer)&&(!pz.pics||pz.pics.length===pz.choices.length&&new Set(pz.pics).size===pz.pics.length);
function kcChoices(r,answer,wrong,n){ // the answer + up to n-1 different wrong ones, shuffled
  const w=[...new Set(wrong.map(String))].filter(x=>x!==String(answer));
  return kcShuf(r,[String(answer)].concat(kcShuf(r,w).slice(0,(n||3)-1)));
}
function kcMake(id,lvl,r){
  const M=KC_MAKERS[id]; if(!M) return null;
  if(!M.lvls.includes(lvl)) lvl=M.lvls[0];
  let pz=null;
  for(let i=0;i<30;i++){pz=M.make(r,lvl);if(M.ok(pz,lvl))return pz;}
  return null;
}

/* ---------- cups, said as words ---------- */
const KC_Q_SHOW=['','¼','½','¾'], KC_Q_SAY=['','a quarter','a half','three quarters'];
function kcCups(q){const w=Math.floor(q/4), f=q%4;return (w?w:'')+KC_Q_SHOW[f]+(q>4?' cups':' cup');}
function kcCupsSay(q){const w=Math.floor(q/4), f=q%4;
  if(!f) return `${w} cup${w>1?'s':''}`; if(!w) return f===3?'three quarters of a cup':`${KC_Q_SAY[f]} cup`; return `${w} and ${KC_Q_SAY[f]} cup${w>1||f?'s':''}`;}
const kcScoopSay=q=>q===4?'one cup scoop':q===2?'half cup scoop':'quarter cup scoop';

/* ---------- 🥣 count: what goes into the bowl (the Fruit Salad) ----------
   need: [{key, by:'id'|'col', n, label}]; tray: food ids to pick from (more than needed, + vegetables on 🧠 Hard). */
KC_MAKERS.count={name:'Counting',lvls:['easy','medium','hard'],make(r,L){
  if(L==='easy'){
    const k=kcPick(r,['strawberry','blueberry','cherry','kiwi','orange']), n=kcInt(r,2,6), F=KC_FOOD[k];
    return {k:'count',lvl:L,need:[{key:k,by:'id',n,label:F.many}],tray:kcShuf(r,Array(n+kcInt(r,2,3)).fill(k)),
      shown:`🥣 Put ${n} ${kcPlural(n,F)} in the bowl!`,say:`Put ${n} ${kcPlural(n,F)} in the bowl.`,hint:`We need ${n}. Count them one by one.`};
  }
  if(L==='medium'){
    const cols=kcShuf(r,Object.keys(KC_BY_COL)), c1=cols[0], c2=cols[1], c3=cols[2], a=kcInt(r,2,5), b=kcInt(r,2,5);
    const of=(c,n)=>Array.from({length:n},(_,i)=>KC_BY_COL[c][i%KC_BY_COL[c].length]);
    return {k:'count',lvl:L,need:[{key:c1,by:'col',n:a,label:KC_COL_NAME[c1]},{key:c2,by:'col',n:b,label:KC_COL_NAME[c2]}],
      tray:kcShuf(r,of(c1,a+2).concat(of(c2,b+2),of(c3,2))),
      shown:`🥣 Put in ${a} ${c1} and ${b} ${c2} fruits!`,say:`Put in ${a} ${c1} fruits and ${b} ${c2} fruits.`,
      hint:`${a} ${c1} and ${b} ${c2}. Count each color.`};
  }
  const ks=kcShuf(r,['blueberry','grape','plum','strawberry','cherry','kiwi']), A=ks[0], B=ks[1], FA=KC_FOOD[A], FB=KC_FOOD[B];
  const veg=()=>kcShuf(r,['carrot','broccoli','onion','potato']).slice(0,3);
  if(r()<0.5){
    const g=kcInt(r,2,3); let k=kcInt(r,2,4); if((g*k)%2) k++;
    const nA=g*k, nB=nA/2, t=`Add ${g} groups of ${k} ${FA.many}, and half as many ${FB.many}. Only fruit!`;
    return {k:'count',lvl:L,need:[{key:A,by:'id',n:nA,label:FA.many},{key:B,by:'id',n:nB,label:FB.many}],
      tray:kcShuf(r,Array(nA+2).fill(A).concat(Array(nB+2).fill(B),veg())),shown:'🥣 '+t,say:t,hint:`${g} groups of ${k} is ${nA}. Half of ${nA} is ${nB}.`};
  }
  const T=kcInt(r,8,12), a=kcInt(r,3,5), b=T-a;
  return {k:'count',lvl:L,need:[{key:A,by:'id',n:a,label:FA.many},{key:B,by:'id',n:b,label:FB.many}],
    tray:kcShuf(r,Array(a+2).fill(A).concat(Array(b+2).fill(B),veg())),
    shown:`🥣 Put ${T} fruits in: ${a} ${kcPlural(a,FA)} and the rest ${FB.many}. Only fruit!`,
    say:`Put ${T} fruits in. ${a} ${kcPlural(a,FA)}, and the rest ${FB.many}. Only fruit!`,hint:`${T} take away ${a} is ${b}.`};
},ok(pz,L){
  if(!kcPzOk(pz)||!pz.need.length||pz.tray.length>26) return false;
  const fits=(nd,id)=>nd.by==='id'?id===nd.key:KC_FOOD[id].col===nd.key;
  if(!pz.tray.every(id=>KC_FOOD[id])) return false;
  // enough on the tray for every need, and nothing on the tray fits two needs
  if(!pz.need.every(nd=>nd.n>=1&&pz.tray.filter(id=>fits(nd,id)).length>nd.n)) return false;
  if(pz.tray.some(id=>pz.need.filter(nd=>fits(nd,id)).length>1)) return false;
  const veg=pz.tray.filter(id=>KC_FOOD[id].kind==='veg').length;
  return L==='hard'?veg>=2:veg===0;
}};

/* ---------- 🧾 order: copy an order card of toppings (KC_TOPS) ---------- */
KC_MAKERS.order={name:'Order card',lvls:['easy','medium','hard'],make(r,L){
  const tops=KC_TOP_IDS.filter(k=>k!=='dots'), n=L==='easy'?1:L==='medium'?kcInt(r,2,3):3;
  const order=kcShuf(r,tops).slice(0,n).map(k=>({k,n:L==='easy'?kcInt(r,2,5):L==='medium'?kcInt(r,1,3):kcInt(r,2,4)}));
  const words=kcAnd(order.map(o=>`${o.n} ${o.n===1?KC_TOPS[o.k].name:KC_TOPS[o.k].many}`));
  return {k:'order',lvl:L,order,words,shown:'✨ Make it look like the order card!',say:`Copy the order card: ${words}. Then tap done.`,
    hint:'Count each topping on the card.'};
},ok(pz){return kcPzOk(pz)&&pz.order.length>=1&&new Set(pz.order.map(o=>o.k)).size===pz.order.length
  &&pz.order.reduce((s,o)=>s+o.n,0)<=16&&pz.order.every(o=>KC_TOPS[o.k]&&o.n>=1);}};

/* ---------- 🔁 pattern: finish a repeating pattern (the rim of a bowl, a kebab, a cupcake) ----------
   rim: the whole pattern (KC_TOPS ids), given: how many are already in place. */
const KC_PAT={easy:[['a','b']],medium:[['a','b','b'],['a','a','b'],['a','b','c']],hard:[['a','b'],['a','b','b'],['a','b','c'],['a','a','b'],['a','a','b','b'],['a','b','c','b']]};
KC_MAKERS.pattern={name:'Patterns',lvls:['easy','medium','hard'],make(r,L){
  const P=kcPick(r,KC_PAT[L]), ks=kcShuf(r,KC_TOP_IDS.filter(k=>k!=='dots')), map={a:ks[0],b:ks[1],c:ks[2]};
  const len=L==='easy'?6:KC_RIM_N;
  return {k:'pattern',lvl:L,rim:Array.from({length:len},(_,i)=>map[P[i%P.length]]),given:L==='easy'?3:P.length+1,size:P.length,
    shown:'✨ Finish the pattern! What comes next?',say:'Finish the pattern. What comes next?',hint:'Look at the pattern. Say it out loud!'};
},ok(pz){
  if(!kcPzOk(pz)||pz.given>=pz.rim.length||!pz.rim.every(k=>KC_TOPS[k])) return false;
  // the given part shows the whole repeat at least once, and the rest really repeats it
  const s=pz.size; return pz.given>s&&pz.rim.every((k,i)=>k===pz.rim[i%s])&&new Set(pz.rim.slice(0,s)).size>=2;
}};

/* ---------- 📈 grow: what number comes next (sprinkles that grow) ---------- */
KC_MAKERS.grow={name:'Growing patterns',lvls:['easy','medium','hard'],make(r,L){
  let seq;
  if(L==='easy'){const a=kcInt(r,1,5);seq=[a,a+1,a+2,a+3];}
  else if(L==='medium'){const a=kcInt(r,1,6), d=kcInt(r,2,5);seq=[a,a+d,a+2*d,a+3*d];}
  else{const t=kcInt(r,0,2), a=kcInt(r,1,3);
    seq=t===0?[a,a*2,a*4,a*8]:t===1?[a,a+1,a+3,a+6]:[a,a+2,a+6,a+12]; // doubles; +1 +2 +3; +2 +4 +6
  }
  const ans=seq.pop(), last=seq[seq.length-1], d=seq[seq.length-1]-seq[seq.length-2];
  const shown=`🍬 Sprinkles: ${seq.join(', ')}, … How many next?`;
  return {k:'grow',lvl:L,seq,answer:String(ans),choices:kcChoices(r,ans,[ans+1,ans-1,last+d,ans+2,ans-2].filter(x=>x>last),3),
    shown,say:`The sprinkles go ${seq.join(', ')}. How many come next?`,hint:L==='hard'?'Look at how much it grows each time.':`It grows by ${d} each time.`};
},ok(pz){return kcPzOk(pz)&&kcChoicesOk(pz)&&pz.choices.length===3&&pz.choices.every(c=>+c>0&&+c<=99);}};

/* ---------- 🫐 tops: counting toppings (5 blueberries; 3 rows of 4; mushrooms on half the pizza) ---------- */
const KC_TOP_THINGS=[['blueberry','blueberries'],['strawberry','strawberries'],['chocolate chip','chocolate chips'],['banana slice','banana slices']];
const KC_PIZZA_THINGS=[['mushrooms','🍄'],['olives','🫒'],['peppers','🫑'],['tomatoes','🍅'],['pineapple','🍍']];
KC_MAKERS.tops={name:'Counting toppings',lvls:['easy','medium','hard'],make(r,L){
  const T=kcPick(r,KC_TOP_THINGS);
  if(L==='easy'){const n=kcInt(r,2,8);
    return {k:'tops',lvl:L,kind:'n',n,thing:T[0],shown:`🫐 Put ${n} ${n===1?T[0]:T[1]} on top!`,say:`Put ${n} ${n===1?T[0]:T[1]} on top.`,hint:`Count up to ${n}.`};}
  if(L==='medium'){const rows=kcInt(r,2,3), cols=kcInt(r,2,5);
    return {k:'tops',lvl:L,kind:'rows',rows,cols,n:rows*cols,thing:T[0],shown:`🫐 Make ${rows} rows of ${cols} ${T[1]}!`,
      say:`Make ${rows} rows, with ${cols} ${T[1]} in each row.`,hint:`${rows} rows of ${cols} makes ${rows*cols}.`};}
  // 🧠 a pizza in 4 or 8 slices: one topping on a half or a quarter, another on a different part
  const slices=kcPick(r,[4,8]), two=kcShuf(r,KC_PIZZA_THINGS).slice(0,2), parts=kcShuf(r,[[1,2],[1,4]]);
  const fr=parts.map(p=>p[1]), sl=fr.map(d=>slices/d), word=d=>d===2?'half':'a quarter';
  return {k:'tops',lvl:L,kind:'frac',slices,parts:two.map((t,i)=>({thing:t[0],pic:t[1],of:fr[i],slices:sl[i]})),
    shown:`🍕 ${kcCap(two[0][0])} on ${fr[0]===2?'½':'¼'} of the pizza, ${two[1][0]} on ${fr[1]===2?'½':'¼'}!`,
    say:`Put ${two[0][0]} on ${word(fr[0])} of the pizza, and ${two[1][0]} on ${word(fr[1])}.`,
    hint:`The pizza has ${slices} slices. Half is ${slices/2}, a quarter is ${slices/4}.`};
},ok(pz){
  if(!kcPzOk(pz)) return false;
  if(pz.kind==='n') return pz.n>=1&&pz.n<=10;
  if(pz.kind==='rows') return pz.n===pz.rows*pz.cols&&pz.n<=15;
  return pz.parts.length===2&&pz.parts[0].thing!==pz.parts[1].thing&&pz.parts.every(p=>p.slices>=1&&p.slices*p.of===pz.slices)
    &&pz.parts[0].slices+pz.parts[1].slices<=pz.slices;
}};

/* ---------- 🥄 scoop: measure with scoops (q = quarter cups) ----------
   target q; scoops: the scoop sizes on the counter; answer: the fewest scoops {size: count}. Any mix that adds up is right
   (kcScoopOk). */
KC_MAKERS.scoop={name:'Scoop math',lvls:['easy','medium','hard'],make(r,L){
  let q, scoops;
  if(L==='easy'){q=4*kcInt(r,1,5);scoops=[4];}
  else if(L==='medium'){q=2*kcInt(r,2,6);scoops=[2];}
  else{q=kcPick(r,[3,5,6,7,9,10,11]);scoops=[2,1];}
  const ing=kcPick(r,['flour','sugar','oats','rice']);
  const answer={}; let left=q; scoops.forEach(s=>{answer[s]=Math.floor(left/s);left-=answer[s]*s;});
  const taps=Object.values(answer).reduce((a,b)=>a+b,0);
  const tools=scoops.length>1?'the half cup and the quarter cup scoops':'the '+kcScoopSay(scoops[0]);
  return {k:'scoop',lvl:L,q,scoops,ing,answer,taps,shown:`🥄 Add ${kcCups(q)} of ${ing}!`,say:`Add ${kcCupsSay(q)} of ${ing}. Use ${tools}.`,
    hint:L==='easy'?`One scoop is one cup. Scoop ${q/4} times.`:L==='medium'?`Two half cups make one cup.`:`Two quarters make a half. Two halves make a cup.`};
},ok(pz){return kcPzOk(pz)&&kcScoopOk(pz,pz.answer)&&pz.taps>=1&&pz.taps<=8;}};
const kcScoopOk=(pz,used)=>Object.entries(used).reduce((s,[k,n])=>s+(+k)*n,0)===pz.q&&Object.keys(used).every(k=>pz.scoops.includes(+k));

/* ---------- 🍕 parts: equal parts and sharing ---------- */
KC_MAKERS.parts={name:'Equal parts',lvls:['easy','medium','hard'],make(r,L){
  if(L!=='hard'){const n=L==='easy'?2:kcPick(r,[3,4]), what=kcPick(r,L==='easy'?['sandwich','pancake','cookie']:['pizza','pie','cake']);
    return {k:'parts',lvl:L,kind:'cut',n,what,shown:`🔪 Cut the ${what} into ${n} equal parts!`,say:`Cut the ${what} into ${n} pieces that are all the same size.`,
      hint:n===2?'Cut it right down the middle.':`${n} pieces, all the same size.`};}
  const k=kcInt(r,2,4), each=kcInt(r,2,5), N=k*each, what=kcPick(r,[['cookie','cookies'],['muffin','muffins'],['strawberry','strawberries']]);
  return {k:'parts',lvl:L,kind:'share',N,friends:k,each,what:what[1],answer:String(each),choices:kcChoices(r,each,[each+1,each-1,N-k,k],3),
    shown:`🍪 Share ${N} ${what[1]} with ${k} friends. How many each?`,say:`Share ${N} ${what[1]} with ${k} friends, the same for each. How many does each friend get?`,
    hint:`Give one to each friend, then go round again.`};
},ok(pz){if(!kcPzOk(pz)) return false; return pz.kind==='cut'?pz.n>=2&&pz.n<=4:kcChoicesOk(pz)&&pz.N===pz.friends*pz.each&&pz.N<=20&&pz.choices.every(c=>+c>0);}};

/* ---------- ✖️ scale: double a recipe, or make half (🌟 Medium and 🧠 Hard) ---------- */
const KC_SCALE_THINGS=[['egg','eggs'],['banana','bananas'],['spoon of honey','spoons of honey'],['apple','apples']];
KC_MAKERS.scale={name:'Scaling a recipe',lvls:['medium','hard'],make(r,L){
  if(L==='medium'){const T=kcPick(r,KC_SCALE_THINGS), n=kcInt(r,1,6), a=2*n;
    return {k:'scale',lvl:L,kind:'double',from:n,answer:String(a),choices:kcChoices(r,a,[n+2,a+1,a-1,n+1],3),
      shown:`✖️ Double it! ${n} ${n===1?T[0]:T[1]} becomes…?`,say:`Double the recipe! ${n} ${n===1?T[0]:T[1]} becomes how many?`,hint:`Double means two times. ${n} and ${n} more.`};}
  // 🧠 half a batch, in quarter cups: ½ → ¼, 1 → ½, 1½ → ¾, 2 → 1, 3 → 1½
  const q=kcPick(r,[2,4,6,8,12]), h=q/2, ing=kcPick(r,['milk','flour','sugar','water']);
  const wrong=[q,h+2,h+1,h*2].filter(x=>x>0&&x!==h&&x%1===0).map(kcCups);
  return {k:'scale',lvl:L,kind:'half',q,answer:kcCups(h),choices:kcChoices(r,kcCups(h),wrong,3),
    shown:`➗ Half a batch! ${kcCups(q)} of ${ing} becomes…?`,say:`Make half a batch. ${kcCupsSay(q)} of ${ing} becomes how much?`,hint:'Half means split it into two equal parts.'};
},ok(pz){return kcPzOk(pz)&&kcChoicesOk(pz)&&pz.choices.length===3;}};

/* ---------- 🌸 words: homophones (words that sound the same) ----------
   🐣 pick the picture (heard, not read); 🌟 pick the word for the sentence; 🧠 find the silly line on the recipe card. */
// w = the kitchen word, o = the sound-alike; wp/op = pictures (🐣 only uses pairs with both); s = a recipe line with ___ for w;
// q = the 🐣 question (spoken, so it must say which one without spelling it).
const KC_HOMO=[
  {w:'flour',o:'flower',wp:'🌾',op:'🌸',s:'Add two cups of ___.',q:'Which one do we bake bread with?'},
  {w:'pear',o:'pair',wp:'🍐',op:'🧦',s:'Slice a juicy ___.',q:'Which one is a fruit we can eat?'},
  {w:'meat',o:'meet',wp:'🍖',op:'🤝',s:'Cook the ___ in the pan.',q:'Which one can we cook in a pan?'},
  {w:'tea',o:'tee',wp:'🍵',op:'⛳',s:'Pour a cup of hot ___.',q:'Which one can we drink from a cup?'},
  {w:'chili',o:'chilly',wp:'🌶️',op:'🥶',s:'Stir the ___ in the pot.',q:'Which one can go in a pot?'},
  {w:'sundae',o:'Sunday',wp:'🍨',op:'📅',s:'Add a cherry on top of the ___.',q:'Which one is a treat to eat?'},
  {w:'roll',o:'role',wp:'🥖',op:'🎭',s:'Put butter on a warm ___.',q:'Which one is bread we can eat?'},
  {w:'berry',o:'bury',wp:'🍓',op:'🦴',s:'Put one ___ on each pancake.',q:'Which one is a fruit for pancakes?'},
  {w:'whole',o:'hole',wp:'🍕',op:'🕳️',s:'We ate the ___ pizza!',q:'Which one is a pizza we can eat?'},
  {w:'thyme',o:'time',s:'Add a pinch of ___ to the soup.'},
  {w:'beet',o:'beat',s:'Chop one red ___ for the salad.'},
  {w:'leek',o:'leak',s:'Wash the ___ and slice it.'},
  {w:'dough',o:'doe',s:'Roll the ___ flat.'},
  {w:'mousse',o:'moose',s:'Top the chocolate ___ with cream.'},
  {w:'cereal',o:'serial',s:'Pour milk on the ___.'},
  {w:'eight',o:'ate',s:'Bake ___ cookies.'}
];
KC_MAKERS.words={name:'Sound-alike words',lvls:['easy','medium','hard'],make(r,L){
  if(L==='easy'){const h=kcPick(r,KC_HOMO.filter(h=>h.wp)), sw=r()<0.5, pics=sw?[h.op,h.wp]:[h.wp,h.op], ch=sw?[h.o,h.w]:[h.w,h.o];
    return {k:'words',lvl:L,pair:h.w,choices:ch,pics,answer:h.w,shown:`👂 ${pics.join(' or ')}?`,say:`${h.q} Tap the picture.`,hint:'Think about which one goes in the kitchen.'};}
  if(L==='medium'){const h=kcPick(r,KC_HOMO), ch=kcShuf(r,[h.w,h.o]);
    return {k:'words',lvl:L,pair:h.w,choices:ch,answer:h.w,line:h.s,shown:`📝 ${h.s}`,say:`Which word goes in the recipe? Read it: ${h.s.replace('___','blank')}`,
      hint:'They sound the same. Which one is food?'};}
  // 🧠 a recipe card of 3 lines; one has the sound-alike instead of the kitchen word
  const hs=kcShuf(r,KC_HOMO).slice(0,3), bad=kcInt(r,0,2), card=hs.map((h,i)=>h.s.replace('___',i===bad?h.o:h.w));
  return {k:'words',lvl:L,pair:hs[bad].w,fix:hs[bad].w,card,choices:card.slice(),answer:card[bad],shown:'🧾 One line on this card is silly! Tap it.',
    say:'One line on the recipe card has a silly word that sounds right but is spelled wrong. Find it!',hint:`Look for a word that isn't food.`};
},ok(pz,L){
  if(!kcPzOk(pz)||!kcChoicesOk(pz)) return false;
  if(L==='easy') return pz.pics.length===2&&!pz.say.toLowerCase().includes(pz.answer.toLowerCase());
  if(L==='hard') return pz.choices.length===3&&pz.card.filter(t=>KC_HOMO.some(h=>h.s.replace('___',h.w)===t)).length===2;
  return pz.choices.length===2;
}};

/* ---------- 🔢 sequence: put the steps in order ----------
   🐣 3 picture steps; 🌟 4-5 steps, picture + words; 🧠 all 6 in words, plus one silly step that doesn't belong. */
const KC_SEQ=[
  {name:'toast',steps:[['🍞','Get the bread'],['🔥','Toast it with a grown-up'],['🧈','Spread the butter'],['🍯','Add some honey'],['🔪','Cut it in half'],['🍽️','Put it on a plate']],silly:['🧊','Freeze the toast']},
  {name:'clean hands',steps:[['💧','Wet your hands'],['🧼','Add soap'],['👐','Scrub for twenty seconds'],['🚿','Rinse the soap off'],['🧻','Dry your hands'],['🍳','Start cooking']],silly:['🥾','Put on rain boots']},
  {name:'pancakes',steps:[['🥚','Crack the eggs'],['🥣','Add the flour'],['🥛','Pour in the milk'],['🥄','Stir it smooth'],['🍳','Cook and flip'],['🍓','Add the toppings']],silly:['🧦','Add a sock']},
  {name:'fruit salad',steps:[['🫧','Wash the fruit'],['🍌','Peel the banana'],['🔪','Chop the fruit'],['🥣','Put it in the bowl'],['✨','Add the toppings'],['😋','Eat it up']],silly:['🔥','Bake it for a week']},
  {name:'a sandwich',steps:[['🍞','Get two slices of bread'],['🍓','Spread the jam'],['🍌','Add banana slices'],['🥪','Put the top slice on'],['🔪','Cut it in half'],['🧺','Pack it for lunch']],silly:['🛁','Give it a bath']},
  {name:'a smoothie',steps:[['🧺','Pick the fruit'],['🍓','Put it in the blender'],['🥛','Pour in the milk'],['🔒','Put the lid on'],['🌀','Blend it'],['🥤','Pour it in a cup']],silly:['🎩','Wear it as a hat']},
  {name:'cookies',steps:[['🥄','Scoop the flour'],['🥚','Crack an egg'],['🥣','Mix the dough'],['📏','Roll it flat'],['⭐','Cut out the shapes'],['🔥','Bake them with a grown-up']],silly:['🎈','Tie on a balloon']}
];
KC_MAKERS.sequence={name:'Steps in order',lvls:['easy','medium','hard'],make(r,L){
  const S=kcPick(r,KC_SEQ), n=L==='easy'?3:L==='medium'?kcInt(r,4,5):6, at=kcInt(r,0,6-n), steps=S.steps.slice(at,at+n);
  let cards=steps.map(s=>s[1]); if(L==='hard') cards.push(S.silly[1]);
  let mixed=kcShuf(r,cards); if(mixed.join('|')===cards.join('|')) mixed=mixed.slice(1).concat(mixed[0]);
  const pic=t=>(S.steps.concat([S.silly]).find(s=>s[1]===t)||[''])[0];
  return {k:'sequence',lvl:L,what:S.name,order:steps.map(s=>s[1]),silly:L==='hard'?S.silly[1]:'',cards:mixed,pics:L==='hard'?null:mixed.map(pic),
    shown:L==='hard'?`🔢 Put the steps for ${S.name} in order. One step is silly!`:`🔢 What happens first? Put them in order!`,
    say:L==='hard'?`Put the steps for ${S.name} in order. One step is silly, so leave it out.`:`Put the steps for ${S.name} in order. What happens first?`,
    hint:`First: ${steps[0][1]}.`};
},ok(pz,L){
  if(!kcPzOk(pz)||new Set(pz.cards).size!==pz.cards.length) return false;
  const want=L==='easy'?[3]:L==='medium'?[4,5]:[6];
  return want.includes(pz.order.length)&&pz.order.every(t=>pz.cards.includes(t))&&pz.cards.length===pz.order.length+(L==='hard'?1:0)
    &&pz.cards.join('|')!==pz.order.join('|')&&(L!=='hard'||!pz.order.includes(pz.silly)&&pz.cards.includes(pz.silly));
}};

/* ---------- ⏲️ time: timers and clocks ----------
   🐣 turn the dial to a number; 🌟 set a digital timer; 🧠 "It's 3:45. Cookies take 20 minutes. When are they done?" */
const kcClock=(h,m)=>`${h}:${String(m).padStart(2,'0')}`;
function kcAddMin(h,m,d){let t=(h%12)*60+m+d;t=((t%720)+720)%720;const hh=Math.floor(t/60);return [hh===0?12:hh,t%60];}
KC_MAKERS.time={name:'Timers and clocks',lvls:['easy','medium','hard'],make(r,L){
  const food=kcPick(r,[['cookies','take'],['muffins','take'],['the pizza','takes'],['the soup','takes'],['the cake','takes']]);
  if(L==='easy'){const n=kcInt(r,1,10);
    return {k:'time',lvl:L,kind:'dial',minutes:n,answer:String(n),shown:`⏲️ Turn the timer to ${n}!`,say:`Turn the timer to number ${n}.`,hint:`Find the number ${n}.`};}
  if(L==='medium'){const n=kcPick(r,[5,10,15,20,25,30,12,8]);
    return {k:'time',lvl:L,kind:'digital',minutes:n,answer:String(n),shown:`⏲️ Set the timer for ${n} minutes!`,say:`${kcCap(food[0])} ${food[1]} ${n} minutes. Set the timer.`,
      hint:`Tap the numbers to make ${n}.`};}
  const h=kcInt(r,1,12), m=5*kcInt(r,0,11), d=kcPick(r,[10,15,20,25,30,40,45]), e=kcAddMin(h,m,d), ans=kcClock(e[0],e[1]);
  const wrong=[kcAddMin(h,m,d+5),kcAddMin(h,m,d-5),kcAddMin(h,m,d+60),kcAddMin(h,m,d+10)].map(x=>kcClock(x[0],x[1]));
  return {k:'time',lvl:L,kind:'clock',start:kcClock(h,m),minutes:d,answer:ans,choices:kcChoices(r,ans,wrong,3),
    shown:`🕒 It's ${kcClock(h,m)}. ${kcCap(food[0])} ${food[1]} ${d} minutes. When ${food[0]==='cookies'||food[0]==='muffins'?'are they':'is it'} done?`,
    say:`It is ${kcClock(h,m)}. ${kcCap(food[0])} ${food[1]} ${d} minutes. What time will it be done?`,hint:`Count on ${d} minutes from ${kcClock(h,m)}.`};
},ok(pz,L){
  if(!kcPzOk(pz)) return false;
  if(L==='easy') return pz.minutes>=1&&pz.minutes<=10;
  if(L==='medium') return pz.minutes>=1&&pz.minutes<=30;
  return kcChoicesOk(pz)&&pz.choices.length===3&&pz.choices.every(c=>/^(1[0-2]|[1-9]):[0-5]\d$/.test(c));
}};

/* ---------- 🗂️ sort: into groups ----------
   🐣 red or green; 🌟 fruit or vegetable; 🧠 fridge, freezer or pantry. items: [{id, name, bin}] (id = a KC_FOOD id, or
   an emoji for the 🧠 Hard foods, which are not drawn yet). */
const KC_STORE=[['🥛','milk','fridge'],['🧀','cheese','fridge'],['🥚','eggs','fridge'],['🧈','butter','fridge'],['🥬','lettuce','fridge'],
  ['🍨','ice cream','freezer'],['🧊','ice cubes','freezer'],['🍧','ice pops','freezer'],
  ['🍞','bread','pantry'],['🍚','rice','pantry'],['🍯','honey','pantry'],['🥫','canned soup','pantry'],['🍝','dry pasta','pantry']];
KC_MAKERS.sort={name:'Sorting',lvls:['easy','medium','hard'],make(r,L){
  let bins, items;
  if(L==='easy'){bins=[['red','🔴','Red','red'],['green','🟢','Green','green']];
    const of=c=>Object.keys(KC_FOOD).filter(k=>KC_FOOD[k].col===c);
    items=kcShuf(r,of('red')).slice(0,kcInt(r,2,3)).concat(kcShuf(r,of('green')).slice(0,kcInt(r,2,3))).map(id=>({id,name:KC_FOOD[id].name,bin:KC_FOOD[id].col}));}
  else if(L==='medium'){bins=[['fruit','🍎','Fruit','fruit'],['veg','🥕','Vegetable','vegetables']];
    const of=k=>Object.keys(KC_FOOD).filter(x=>KC_FOOD[x].kind===k);
    items=kcShuf(r,of('fruit')).slice(0,kcInt(r,3,4)).concat(kcShuf(r,of('veg')).slice(0,kcInt(r,2,3))).map(id=>({id,name:KC_FOOD[id].name,bin:KC_FOOD[id].kind}));}
  else{bins=[['fridge','🧊','Fridge','the fridge'],['freezer','❄️','Freezer','the freezer'],['pantry','🚪','Pantry','the pantry']];
    items=['fridge','freezer','pantry'].flatMap(b=>kcShuf(r,KC_STORE.filter(s=>s[2]===b)).slice(0,2)).map(s=>({id:s[0],name:s[1],bin:s[2]}));}
  const said=kcAnd(bins.map(b=>b[3]));
  return {k:'sort',lvl:L,bins:bins.map(b=>({id:b[0],icon:b[1],name:b[2]})),items:kcShuf(r,items),
    shown:`🗂️ Sort them: ${bins.map(b=>b[1]+' '+b[2]).join(' or ')}!`,say:`Sort the food into ${said}.`,
    hint:L==='hard'?'Cold things go in the fridge, frozen things in the freezer.':L==='medium'?'Fruit is sweet, like a treat. Vegetables are not.':'Look at the color.'};
},ok(pz){if(!kcPzOk(pz)) return false; const ids=pz.bins.map(b=>b.id);
  return pz.items.length>=4&&pz.items.length<=7&&new Set(pz.items.map(i=>i.id)).size===pz.items.length&&pz.items.every(i=>ids.includes(i.bin))
    &&ids.every(b=>pz.items.some(i=>i.bin===b));}};

/* ---------- 🔤 spell ----------
   🐣 the first letter (P for pizza); 🌟 fridge magnets: spell a short word; 🧠 unscramble a dish name. */
const KC_SPELL={
  easy:[['🍕','pizza'],['🍎','apple'],['🍌','banana'],['🎂','cake'],['🥛','milk'],['🥚','egg'],['🍲','soup'],['🍐','pear'],['🍇','grapes'],['🍯','honey'],['🍚','rice'],['🌽','corn'],['🍋','lemon'],['🍉','melon'],['🍑','peach'],['🍪','cookie'],['🧀','cheese'],['🥕','carrot']],
  medium:[['🎂','cake'],['🥛','milk'],['🥚','egg'],['🍲','soup'],['🍐','pear'],['🍚','rice'],['🌽','corn'],['🍯','jam'],['🍑','plum'],['🥧','pie'],['🍞','bun'],['🍵','tea'],['🍋','lime'],['🍉','melon'],['🍝','pasta']],
  hard:[['🥞','pancake'],['🍕','pizza'],['🥗','salad'],['🍪','cookie'],['🧁','muffin'],['🍜','noodle'],['🍞','toast'],['🍨','sundae'],['🥪','sandwich'],['🌮','taco'],['🥤','smoothie'],['🍲','stew']]
};
const kcRude=w=>WS_NO.some(b=>w.toUpperCase().includes(b));
KC_MAKERS.spell={name:'Spelling',lvls:['easy','medium','hard'],make(r,L){
  const [pic,w]=kcPick(r,KC_SPELL[L]), W=w.toUpperCase();
  if(L==='easy'){const a=W[0], wrong=kcShuf(r,'BCDFGHMPST'.split('').filter(c=>c!==a)).slice(0,2);
    return {k:'spell',lvl:L,word:w,pic,choices:kcShuf(r,[a].concat(wrong)),answer:a,shown:`🔤 ${pic} starts with…?`,say:`${kcCap(w)}. What letter does ${w} start with?`,
      hint:`Say it slowly: ${w}.`};}
  if(L==='medium'){const extra=kcShuf(r,'BDFGHKMNPRST'.split('').filter(c=>!W.includes(c))).slice(0,2);
    return {k:'spell',lvl:L,word:w,pic,tiles:kcShuf(r,W.split('').concat(extra)),answer:W,shown:`🧲 Spell it with the magnets: ${pic}`,
      say:`Spell ${w} with the fridge magnets.`,hint:`${kcCap(w)} starts with ${W[0]}.`};}
  let s=kcShuf(r,W.split('')).join(''); for(let i=0;i<6&&(s===W||kcRude(s));i++) s=kcShuf(r,W.split('')).join('');
  return {k:'spell',lvl:L,word:w,pic,tiles:s.split(''),answer:W,shown:`🔀 Unscramble the dish: ${s}`,say:'These letters are a mixed up dish name. Put them in order!',hint:`It starts with ${W[0]}.`};
},ok(pz,L){
  if(!kcPzOk(pz)) return false;
  if(L==='easy') return kcChoicesOk(pz)&&pz.choices.length===3&&pz.answer===pz.word[0].toUpperCase();
  const t=pz.tiles.join('');
  if(L==='medium') return pz.tiles.length===pz.answer.length+2&&pz.answer.split('').every(c=>t.split(c).length>pz.answer.split(c).length-1)&&!kcRude(t);
  return t!==pz.answer&&[...t].sort().join('')===[...pz.answer].sort().join('')&&!kcRude(t);
}};

/* ---------- 🪙 money: pretend shop money (US coins) ----------
   🐣 pay with pennies; 🌟 make the price with dimes and nickels (any mix that adds up); 🧠 the change from a dollar. */
const KC_SHOP=[['🥚','eggs','cost'],['🥛','milk','costs'],['🍞','bread','costs'],['🍌','bananas','cost'],['🧈','butter','costs'],['🍓','strawberries','cost']];
KC_MAKERS.money={name:'Money',lvls:['easy','medium','hard'],make(r,L){
  const [pic,what,cost]=kcPick(r,KC_SHOP);
  if(L==='easy'){const n=kcInt(r,1,6);
    return {k:'money',lvl:L,kind:'pennies',price:n,pic,coins:[1],shown:`${pic} ${n}¢: pay ${n} ${n===1?'penny':'pennies'}!`,
      say:`The ${what} ${cost} ${n} cents. Pay ${n} ${n===1?'penny':'pennies'}.`,hint:`One penny is one cent. Count to ${n}.`};}
  if(L==='medium'){const c=5*kcInt(r,3,10);
    return {k:'money',lvl:L,kind:'pay',price:c,pic,coins:[10,5],answer:{10:Math.floor(c/10),5:(c%10)/5},
      shown:`${pic} ${c}¢: pay with dimes and nickels!`,say:`The ${what} ${cost} ${c} cents. Pay with dimes and nickels.`,hint:'A dime is ten cents. A nickel is five cents.'};}
  const c=5*kcInt(r,5,19), ch=100-c;
  return {k:'money',lvl:L,kind:'change',price:c,pic,answer:`${ch}¢`,choices:kcChoices(r,`${ch}¢`,[`${ch+5}¢`,`${ch-5}¢`,`${ch+10}¢`,`${c}¢`].filter(x=>parseInt(x)>0),3),
    shown:`${pic} ${c}¢. You pay $1. What is your change?`,say:`The ${what} ${cost} ${c} cents. You pay one dollar. How much change do you get?`,hint:`One dollar is 100 cents. Count up from ${c}.`};
},ok(pz,L){
  if(!kcPzOk(pz)) return false;
  if(L==='easy') return pz.price>=1&&pz.price<=6;
  if(L==='medium') return pz.price%5===0&&kcMoneyOk(pz,pz.answer);
  return kcChoicesOk(pz)&&pz.choices.length===3&&parseInt(pz.answer)+pz.price===100;
}};
const kcMoneyOk=(pz,used)=>Object.entries(used).reduce((s,[k,n])=>s+(+k)*n,0)===pz.price&&Object.keys(used).every(k=>pz.coins.includes(+k));
