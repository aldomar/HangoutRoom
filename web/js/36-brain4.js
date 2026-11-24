'use strict';
/* =========================================================
   36. BRAIN GAMES (v1.34), part 4: 🍕 Fraction Bakery and 🪐 Fact Cards (the menu and screen are section 28)
   Fraction Bakery: Easy = tap the treat cut into N equal pieces (a row of N buddies shows N, so no reading is needed);
   Medium = tap slices to put toppings on a fraction of a pizza or cake, then ✔; Hard = fractions of a number.
   A treat is drawn in SVG: a pizza or cookie is a circle cut into sectors, a cake is a bar cut into columns.
   Fact Cards: a question about 🦕 dinosaurs, 🚀 space or 🐠 the ocean with 3 answers (pictures on Easy). Solving one
   unlocks its fact card, kept in the 🪐 Fact Cards binder (a button on the Brain Games menu). A card is unlocked when
   its puzzle is in brain.solved, so there is no extra save data. Facts are real and checked; keep them that way.
   Puzzle ids are 'bake:e1' ... and 'facts:e1' ...: never reorder or remove puzzles, only add new ones at the end.
   ========================================================= */

/* ---------- drawing a treat ---------- */
const FB_TREATS={pizza:{crust:'#e8a95c',base:'#ffd166',top:'#ff6b6b',line:'#8a4b1f'},cookie:{crust:'#c98b52',base:'#e3a45c',top:'#5a3a2a',line:'#5a3a2a'},
  cake:{crust:'#ff8cc6',base:'#fff4fb',top:'#ff8cc6',line:'#8a3a66'}};
// Uneven cuts, used for the "not equal" choices: sector angles for round treats, cut points (0..1) for the cake.
const FB_UNEVEN={round:{2:[-90,40],3:[-90,-20,150],4:[-90,-30,80,130]},bar:{2:[.32],3:[.2,.55],4:[.15,.38,.72]}};
const fbPt=(a,r)=>[(100+Math.cos(a*Math.PI/180)*r).toFixed(1),(100+Math.sin(a*Math.PI/180)*r).toFixed(1)];
// The pieces of a treat as SVG shapes. n pieces; even = equal or not; on = which pieces have a topping.
function fbPieces(kind,n,even,on){
  const T=FB_TREATS[kind], out=[];
  if(kind==='cake'){
    const cuts=even?Array.from({length:n-1},(_,i)=>(i+1)/n):FB_UNEVEN.bar[n], xs=[0,...cuts,1].map(c=>20+c*160);
    for(let i=0;i<n;i++){const x=xs[i],w=xs[i+1]-xs[i], t=on&&on[i];
      out.push(`<g class="fb-sl" data-sl="${i}"><rect x="${x}" y="60" width="${w}" height="90" fill="${t?'#ffd6ec':T.base}" stroke="${T.line}" stroke-width="3"/>`
        +`<rect x="${x}" y="52" width="${w}" height="16" fill="${t?'#ff8cc6':'#fff'}" stroke="${T.line}" stroke-width="3"/>`
        +(t?`<circle cx="${x+w/2}" cy="44" r="${Math.min(9,w/3)}" fill="#ff4d6d" stroke="${T.line}" stroke-width="2"/>`:'')+`</g>`);}
    return out.join('');
  }
  const ang=even?Array.from({length:n},(_,i)=>-90+i*360/n):FB_UNEVEN.round[n];
  for(let i=0;i<n;i++){
    const a0=ang[i], a1=i+1<n?ang[i+1]:ang[0]+360, big=a1-a0>180?1:0, [x0,y0]=fbPt(a0,80), [x1,y1]=fbPt(a1,80), t=on&&on[i];
    const mid=(a0+a1)/2, dots=t?[0.45,0.72].map(f=>{const [cx,cy]=fbPt(mid+(f>0.6?(a1-a0)/6:0),80*f);return `<circle cx="${cx}" cy="${cy}" r="${kind==='pizza'?9:5}" fill="${T.top}" stroke="${T.line}" stroke-width="2"/>`;}).join(''):'';
    out.push(`<g class="fb-sl" data-sl="${i}"><path d="M100 100 L${x0} ${y0} A80 80 0 ${big} 1 ${x1} ${y1}Z" fill="${t&&kind==='pizza'?'#ffe08a':T.base}" stroke="${T.line}" stroke-width="3" stroke-linejoin="round"/>${dots}</g>`);
  }
  return `<circle cx="100" cy="100" r="86" fill="${T.crust}" stroke="${T.line}" stroke-width="3"/>`+out.join('');
}
const fbTreat=(kind,n,even,on,cls)=>`<svg class="fb-treat${cls?' '+cls:''}" viewBox="0 ${kind==='cake'?20:0} 200 ${kind==='cake'?150:200}">${fbPieces(kind,n,even,on)}</svg>`;
const fbFrac=(a,b)=>`<span class="frac"><b>${a}</b><i>${b}</i></span>`;

/* ---------- 🍕 Fraction Bakery ---------- */
// Easy: {k: treat, n: equal pieces wanted, o: the choices ('3' = 3 equal pieces, '3u' = 3 pieces that are not equal)}.
// Medium: {k, a, b, n}: put toppings on a/b of a treat cut into n pieces. Hard: {q, a, pic} like the Snack Stand.
const FB_PUZ={
  easy:[{k:'pizza',n:2,o:'2 2u 3'},{k:'cake',n:2,o:'2u 2 4'},{k:'cookie',n:2,o:'3 2u 2'},{k:'pizza',n:4,o:'4 4u 2'},
    {k:'cake',n:3,o:'3u 2 3'},{k:'pizza',n:3,o:'3 3u 4'},{k:'cake',n:4,o:'4u 4 3'},{k:'cookie',n:4,o:'2 4 4u'}],
  medium:[{k:'pizza',a:1,b:2,n:2},{k:'cake',a:1,b:4,n:4},{k:'pizza',a:3,b:4,n:4},{k:'cake',a:1,b:3,n:3},
    {k:'pizza',a:1,b:2,n:8},{k:'pizza',a:2,b:3,n:6},{k:'cake',a:3,b:6,n:6},{k:'pizza',a:5,b:8,n:8}],
  hard:[{q:'There are 10 strawberries. You put ½ of them on the cake. How many is that?',a:5,pic:'🍓×10'},
    {q:'¼ of 12 cookies have sprinkles. How many cookies have sprinkles?',a:3,pic:'🍪×12'},
    {q:'⅔ of 9 cupcakes are pink. How many are pink?',a:6,pic:'🧁×9'},
    {q:'¾ of 16 muffins have blueberries. How many have blueberries?',a:12,pic:'🧁×16'},
    {q:'A pizza has 8 slices. You eat ¼ of it. How many slices are left?',a:6,pic:'🍕 8 slices'},
    {q:'A cake is cut into 6 pieces and ⅔ of it is eaten. How many pieces are left?',a:2,pic:'🎂 6 pieces'},
    {q:'⅗ of 20 donuts have chocolate on top. How many is that?',a:12,pic:'🍩×20'},
    {q:'30 friends come to the bakery and ⅚ of them want cake. How many want cake?',a:25,pic:'🎂 ⅚ of 30'}]
};
const fbOpts=pz=>trList(pz.o);
let FB={on:[]};
BRAIN_GAMES.bake={icon:'🍕',name:'Fraction Bakery',desc:'Halves, quarters and more',color:'#ff9f6b',
  puzzles:FB_PUZ,
  start(pz,l,idx){
    const p=P();
    if(l==='easy'){
      $('#brQ').innerHTML=`<div class="br-card"><div class="br-ask">${p.easy?'':`Which one is cut into ${pz.n} equal pieces?`}</div>`
        +`<div class="fb-friends" aria-label="${pz.n} friends">${'🐰'.repeat(pz.n)}</div></div>`;
      $('#brBoard').innerHTML=`<div class="br-choices">`+fbOpts(pz).map(o=>`<button class="br-ch fb-ch" data-o="${o}" aria-label="${o.endsWith('u')?'not equal':o+' equal pieces'}">${fbTreat(pz.k,parseInt(o,10),!o.endsWith('u'))}</button>`).join('')+`</div>`;
      $('#brBoard').onclick=e=>{const b=e.target.closest('[data-o]');if(!b||BR.won)return;
        if(b.dataset.o===String(pz.n)){b.classList.add('right');SFX.happy();brWin();}
        else{brOops(b);brHint(b.dataset.o.endsWith('u')?'Those pieces are not the same size. Try again! 💪':`That one has ${parseInt(b.dataset.o,10)} pieces. Try again! 💪`);}};
    } else if(l==='medium'){
      FB={on:Array(pz.n).fill(false)};
      $('#brQ').innerHTML=`<div class="br-card"><div class="br-ask">${p.easy?'🍕':`Put toppings on`} ${fbFrac(pz.a,pz.b)} ${p.easy?'':`of the ${pz.k}!`}</div>`
        +`<div class="hint" style="padding:0">${p.easy?'👆':'Tap the pieces, then ✔'}</div></div>`;
      fbDrawMed(pz);
      $('#brBoard').onclick=e=>{if(BR.won)return;
        if(e.target.closest('#fbDone')){fbCheck(pz);return;}
        const s=e.target.closest('[data-sl]'); if(!s) return;
        const i=Number(s.dataset.sl); FB.on[i]=!FB.on[i]; SFX.pop(); fbDrawMed(pz);};
    } else {
      $('#brQ').innerHTML=`<div class="br-card"><div class="br-pic2">${pz.pic}</div><div class="br-ask">${pz.q}</div></div>`;
      brChoices(brOptions(pz.a,idx,[[-2,0,1,10],[-1,0,2,4],[0,2,3,-1],[-3,-1,0,1]]),pz.a);
    }
  }
};
function fbDrawMed(pz){
  const n=FB.on.filter(Boolean).length;
  $('#brBoard').innerHTML=`<div class="fb-med"><div class="fb-big">${fbTreat(pz.k,pz.n,true,FB.on)}</div>`
    +`<div class="fb-side"><div class="fb-count">${fbFrac(n,pz.n)}</div><button class="btn pink" id="fbDone" aria-label="Done">✔ <span>Done</span></button></div></div>`;
}
function fbCheck(pz){
  const want=pz.a*pz.n/pz.b, n=FB.on.filter(Boolean).length;
  if(n===want){SFX.happy();brWin();return;}
  brOops($('#brBoard .fb-big'));
  brHint(n<want?`A little more! You need ${pz.a}/${pz.b}. 💪`:`Too many! Take some off. 💪`);
}

/* ---------- 🪐 Fact Cards ---------- */
// Each puzzle: q = the question, a = the right answer, w = two wrong answers, t = topic, card = {i: picture, n: name, f: the fact}.
// On Easy the answers are pictures (an emoji or a memPic id) and the question is short.
const FACT_TOPICS={dino:['🦕','Dinosaurs','#7ed957'],space:['🚀','Space','#a97cff'],ocean:['🐠','Ocean','#6bb8ff']};
const FACT_PUZ={
  easy:[
    {t:'ocean',q:'Which one lives in the sea?',a:'🐙',w:['🐄','🐔'],card:{i:'🐙',n:'Octopus',f:'An octopus has 8 arms, and each arm can taste what it touches.'}},
    {t:'dino',q:'Which one is a dinosaur?',a:'d:dinoPlush',w:['🐱','🐶'],card:{i:'d:dinoPlush',n:'Dinosaurs',f:'Dinosaurs lived a very, very long time ago, long before there were any people.'}},
    {t:'space',q:'Which one shines in the sky at night?',a:'d:moon',w:['🍎','🚗'],card:{i:'d:moon',n:'The Moon',f:'The Moon has no light of its own. It shines because the Sun lights it up.'}},
    {t:'ocean',q:'Which one is the biggest?',a:'🐳',w:['🐭','🐞'],card:{i:'🐳',n:'Blue Whale',f:'The blue whale is the biggest animal that has ever lived: bigger than any dinosaur!'}},
    {t:'space',q:'Which one can fly to space?',a:'d:toyRocket',w:['🚲','⛵'],card:{i:'d:toyRocket',n:'Rockets',f:'A rocket pushes hot gas down very hard, and that pushes the rocket up into space.'}},
    {t:'space',q:'Which one is hot?',a:'☀️',w:['⛄','❄️'],card:{i:'☀️',n:'The Sun',f:'The Sun is a star. It is the closest star to us.'}},
    {t:'ocean',q:'Which one has a shell?',a:'🐢',w:['🐟','🐬'],card:{i:'🐢',n:'Sea Turtles',f:'Sea turtles have swum in the oceans since the time of the dinosaurs.'}},
    {t:'ocean',q:'Which one is a shark?',a:'d:sharkBean',w:['🐔','🐱'],card:{i:'d:sharkBean',n:'Sharks',f:'Sharks grow new teeth all their lives. When one falls out, another moves up.'}}],
  medium:[
    {t:'dino',q:'Which dinosaur had three horns on its face?',a:'Triceratops',w:['Stegosaurus','Velociraptor'],card:{i:'🦕',n:'Triceratops',f:'Triceratops means "three-horned face".'}},
    {t:'space',q:'Which planet is the biggest?',a:'Jupiter',w:['Mars','Earth'],card:{i:'🪐',n:'Jupiter',f:'Jupiter is so big that more than 1,000 Earths could fit inside it.'}},
    {t:'ocean',q:'How many hearts does an octopus have?',a:'3',w:['1','2'],card:{i:'💙',n:'Three Hearts',f:'An octopus has three hearts, and its blood is blue.'}},
    {t:'space',q:'Which planet has big, bright rings?',a:'Saturn',w:['Mars','Mercury'],card:{i:'🪐',n:'Saturn',f:'Saturn\'s rings are made of billions of chunks of ice and rock.'}},
    {t:'dino',q:'What did long-necked dinosaurs eat?',a:'Plants',w:['Fish','Other dinosaurs'],card:{i:'🌿',n:'Long Necks',f:'Long-necked dinosaurs ate plants. Their long necks reached the tops of trees.'}},
    {t:'ocean',q:'How do dolphins breathe?',a:'Through a blowhole',w:['With gills','They don\'t need air'],card:{i:'🐬',n:'Dolphins',f:'Dolphins are mammals, like us. They breathe air through a blowhole on top of their head.'}},
    {t:'space',q:'How many people have walked on the Moon?',a:'12',w:['None','1,000'],card:{i:'👣',n:'Moon Walkers',f:'12 astronauts walked on the Moon between 1969 and 1972. Their footprints are still there.'}},
    {t:'ocean',q:'What is the biggest fish in the sea?',a:'The whale shark',w:['The blue whale','The goldfish'],card:{i:'🦈',n:'Whale Shark',f:'The whale shark is the biggest fish. Whales are bigger, but whales are not fish!'}}],
  hard:[
    {t:'space',q:'About how long does sunlight take to reach Earth?',a:'8 minutes',w:['8 seconds','8 days'],card:{i:'☀️',n:'Sunlight',f:'Light from the Sun takes about 8 minutes to reach us, even at the fastest speed there is.'}},
    {t:'dino',q:'T. rex lived closer in time to…',a:'people today',w:['Stegosaurus','the very first dinosaurs'],card:{i:'⏳',n:'Deep Time',f:'Stegosaurus died out so long before T. rex that T. rex lived closer in time to us than to Stegosaurus.'}},
    {t:'ocean',q:'What is the deepest place in the ocean called?',a:'The Mariana Trench',w:['The Great Barrier Reef','The Equator'],card:{i:'🌊',n:'The Deepest Place',f:'The Mariana Trench is about 11 km deep. The world\'s tallest mountain would fit inside it.'}},
    {t:'space',q:'Which planet is the hottest?',a:'Venus',w:['Mercury','Mars'],card:{i:'🔥',n:'Venus',f:'Venus is the hottest planet, even though Mercury is closer to the Sun. Its thick clouds trap the heat.'}},
    {t:'ocean',q:'What do blue whales eat?',a:'Tiny krill',w:['Sharks','Seaweed'],card:{i:'🦐',n:'Krill',f:'The biggest animal eats some of the smallest: blue whales gulp tonnes of tiny krill a day.'}},
    {t:'space',q:'Why does the Moon seem to change shape?',a:'We see different parts of its sunny side',w:['Clouds cover it','It shrinks and grows'],card:{i:'🌓',n:'Moon Phases',f:'The Sun always lights half of the Moon. As the Moon goes round us, we see more or less of that half.'}},
    {t:'dino',q:'What is a scientist who studies fossils called?',a:'A palaeontologist',w:['An astronaut','A chef'],card:{i:'🔍',n:'Fossil Hunters',f:'Palaeontologists dig up fossils, like bones and footprints, to learn about life long ago.'}},
    {t:'ocean',q:'Which deep-sea fish makes its own light?',a:'The anglerfish',w:['The goldfish','The salmon'],card:{i:'💡',n:'Deep-Sea Light',f:'Sunlight never reaches the deep sea, so some fish, like the anglerfish, make their own light.'}}]
};
const factPic=x=>/^[a-z]:/.test(x)?`<span class="wb-art">${memPic(x)}</span>`:`<span class="wb-emo">${x}</span>`;
const factWord=x=>/^[a-z]:/.test(x)?{'d:dinoPlush':'dinosaur','d:moon':'moon','d:toyRocket':'rocket','d:sharkBean':'shark'}[x]||'':'';
// The 3 answers in a fixed shuffled order.
const factOpts=(pz,l,idx)=>brShuffle([pz.a,...pz.w],brId('facts',l,idx));
BRAIN_GAMES.facts={icon:'🪐',name:'Fact Cards',desc:'Dinosaurs, space and the ocean',color:'#a97cff',
  puzzles:FACT_PUZ,
  start(pz,l,idx){
    const p=P(), T=FACT_TOPICS[pz.t], pics=l==='easy';
    $('#brQ').innerHTML=`<div class="br-card"><div class="fc-topic" style="--tc:${T[2]}">${T[0]} ${T[1]}</div><div class="br-ask">${pz.q}</div></div>`;
    $('#brBoard').innerHTML=`<div class="br-choices${pics?'':' fc-words'}">`+factOpts(pz,l,idx).map((x,i)=>`<button class="br-ch ${pics?'fc-pic':'fc-ans'}" data-i="${i}" aria-label="${pics?factWord(x):x}">`
      +(pics?factPic(x):`<b>${x}</b>`)+`</button>`).join('')+`</div>`;
    const opts=factOpts(pz,l,idx);
    $('#brBoard').onclick=e=>{const b=e.target.closest('[data-i]');if(!b||BR.won)return;
      if(opts[Number(b.dataset.i)]===pz.a){b.classList.add('right');SFX.happy();brWin();} else brOops(b);};
  },
  winExtra:(pz,l,idx,first)=>`<div class="fc-win">${first?'🆕 A new fact card!':'Your fact card:'}${factCard(pz)}</div>`
};
function factCard(pz,locked){
  const T=FACT_TOPICS[pz.t];
  if(locked) return `<div class="fc-card locked" style="--tc:${T[2]}"><span class="fc-i">❓</span><b>${T[0]} ${T[1]}</b></div>`;
  return `<div class="fc-card" style="--tc:${T[2]}"><span class="fc-i">${factPic(pz.card.i)}</span><b>${pz.card.n}</b><p>${pz.card.f}</p><small>${T[0]} ${T[1]}</small></div>`;
}
const factAll=()=>BRAIN_LVLS.flatMap(l=>FACT_PUZ[l].map((pz,i)=>({pz,l,i,id:brId('facts',l,i)})));
const factGot=p=>factAll().filter(c=>p.brain.solved.includes(c.id)).length;

/* ---------- the 🪐 Fact Cards binder (on the Brain Games menu) ---------- */
BR_MENU_EXTRA.push(p=>`<button class="btn ghost fc-open" id="factsBtn" aria-label="My fact cards">📇 <span>My Fact Cards</span> <b>${factGot(p)} / ${factAll().length}</b></button>`);
$('#brMenu').addEventListener('click',e=>{if(e.target.closest('#factsBtn')){SFX.click();factBinder();}});
function factBinder(){
  const p=P(); if(!p) return; brStop(); BR.view='facts';
  $('#brMenu').classList.remove('hidden'); $('#brPlay').classList.add('hidden');
  $('#brBack').textContent='⬅ Games'; $('#brTitle').textContent='📇 My Fact Cards';
  $('#brMenu').innerHTML=`<div class="stg-note">${p.easy?'🪐 ✨':'Solve 🪐 Fact Cards puzzles to fill your binder! Tap a card to read it.'}</div>`
    +Object.keys(FACT_TOPICS).map(t=>{const T=FACT_TOPICS[t], cs=factAll().filter(c=>c.pz.t===t);
      return `<div class="fc-sec"><h3>${T[0]} ${T[1]} <small>${cs.filter(c=>p.brain.solved.includes(c.id)).length} / ${cs.length}</small></h3><div class="fc-grid">`
        +cs.map(c=>{const got=p.brain.solved.includes(c.id);return `<button class="fc-slot${got?'':' fc-none'}" data-fc="${c.id}" aria-label="${got?c.pz.card.n:'A card to find'}">${got?`<span class="fc-i">${factPic(c.pz.card.i)}</span><b>${c.pz.card.n}</b>`:`<span class="fc-i">❓</span><small>${c.l==='easy'?'🐣':c.l==='medium'?'🌟':'🧠'}</small>`}</button>`;}).join('')
        +`</div></div>`;}).join('');
}
$('#brMenu').addEventListener('click',e=>{const b=e.target.closest('[data-fc]'); if(!b||BR.view!=='facts') return;
  const c=factAll().find(x=>x.id===b.dataset.fc), p=P(); if(!c) return; SFX.click();
  if(p.brain.solved.includes(c.id)) modal(`${FACT_TOPICS[c.pz.t][0]} ${c.pz.card.n}`,factCard(c.pz),[{text:'Close',cls:'pink'}]);
  else modal('❓ Not found yet',`<div style="text-align:center">${factCard(c.pz,true)}<p>${p.easy?'🪐 ▶':'Solve this puzzle to unlock it!'}</p></div>`,
    [{text:'Close',cls:'ghost'},{text:'▶ Play it',cls:'pink',on:()=>{p.brain.level.facts=c.l;save();brPuzzle('facts',c.l,c.i);}}]);});

/* ---------- stickers ---------- */
STICKERS.push(
  stk('bake8','code','🍕','Fraction Baker','circle','Solve 8 Fraction Bakery puzzles (📚 Brain Games)',8,p=>brCount(p,'bake')),
  stk('facts12','code','📇','Fact Finder','heart','Collect 12 fact cards (🪐 Fact Cards)',12,p=>brCount(p,'facts'))
);
