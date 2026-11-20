'use strict';
/* =========================================================
   52. RUNWAY (v1.51): pick a theme card, dress for it, walk the catwalk; three judges only cheer
   Opened by 👠 Runway in the Closet (section 9); Back goes card list -> Closet, dressing room -> card list.
   1. Cards: 3 theme cards at a time (🔀 shows 3 others). A card is tied to theme chips (section 33).
   2. Dress: her outfit is copied into RW.look (her saved look never changes here). Clothes she owns are worn as usual;
      anything else is 👜 borrowed for this show only (never added to p.owned). Clothes that match the card come first (✨).
      Three sparkles fill as matching pieces go on. 🎲 Theme surprise puts on matching pieces in one tap.
   3. Walk: the buddy (drawn once into a picture, like the Dance Maker, so #fuzz isn't redrawn) struts down the catwalk
      with CSS animations; a short beat plays on the audio clock. Then 3 visitor friends (section 42) hold up cheer cards:
      0 matching pieces 💖💖💖, 1 💖🌟💖, 2 🌟🌟🌟, 3+ 🤩🤩🤩 with confetti. ✨ Anything Goes always gets 🤩. Every walk gets cheers.
   4. After: +RW_COINS a show, RW_DAILY a day (p.runway.pay). 👗 Wear it home puts on only the pieces she owns.
   No main loop: one-time CSS animations and a few setTimeouts (RW_TEST_FAST makes them short for the smoke test).
   Saved: p.runway {pay{day,n}, cards[]} (card ids walked), stats.walks, stats.wows (🤩 on a themed card).
   Card ids are saved: never rename them; add new cards at the end.
   ========================================================= */
const RW_COINS=3, RW_DAILY=15, RW_WALK_MS=4200, RW_CHEER_MS=1600;
const RW_CATS=['hair','top','bottom','legs','arms','shoes','acc'];
const rwCard=(id,icon,name,th,say,judges)=>({id,icon,name,th,say,judges});
const RW_CARDS=[
  rwCard('spooky','🦇','Spooky Night',['emo'],'Dress spooky-cute!',['boo','flap','mochi']),
  rwCard('picnic','☁️','Cloud Picnic',['cute'],'Soft and sweet for a picnic!',['mochi','hop','boo']),
  rwCard('game','⚽','Game Day',['sport'],'Ready for the big game!',['zip','bolt','hop']),
  rwCard('concert','🎤','Concert Star',['stage'],'Shine on the stage!',['flap','mochi','zip']),
  rwCard('space','🚀','Space Day',['space'],'Blast off in style!',['bolt','boo','zip']),
  rwCard('dino','🦕','Dino Day',['dino'],'Stomp like a dino!',['hop','zip','bolt']),
  rwCard('hero','🤖','Hero Training',['hero'],'Suit up, hero!',['bolt','zip','flap']),
  rwCard('cafe','🧁','Cafe Date',['cafe'],'Cute for the cafe!',['mochi','flap','hop']),
  rwCard('beach','🐚','Beach Day',['ocean'],'Splash by the sea!',['hop','mochi','bolt']),
  rwCard('farm','🐮','Farm Fair',['farm'],'Off to the farm fair!',['hop','zip','mochi']),
  rwCard('road','🚗','Road Trip',['ride'],'Let\'s go for a ride!',['zip','bolt','boo']),
  rwCard('sleep','🍵','Cozy Sleepover',['cozy','cute'],'Comfy for a sleepover!',['mochi','boo','flap']),
  rwCard('spacey','🌌','Spooky Space',['emo','space'],'Spooky and starry!',['boo','bolt','flap']),
  rwCard('any','✨','Anything Goes',[],'Wear what you love!',['flap','mochi','zip'])
];
const RW_CHEERS=['💖💖💖','💖🌟💖','🌟🌟🌟','🤩🤩🤩'];
const RW_LINES=[['So cute!','Love it!','Adorable!'],['Love it!','Looking good!','So fun!'],['So stylish!','Wow, wow!','Great look!'],['Superstar!','Totally on theme!','Amazing!']];
const RW={view:'cards',card:null,look:null,cat:'top',deck:[],at:0,walking:false,timers:[],img:'',imgKey:''};
const rwCardOf=id=>RW_CARDS.find(c=>c.id===id);
const rwToday=()=>new Date().toDateString();

/* ---------- matching ---------- */
const rwItem=(cat,id)=>CLOSET[cat].items.find(i=>i.id===id);
// Does this closet item fit the card? (✨ Anything Goes has no themes, so nothing "matches" and nothing needs to.)
function rwFits(card,cat,it){return !!(card&&it&&it.id!=='none'&&card.th.length&&themesOf(cat+':'+it.id,it).some(t=>card.th.includes(t)));}
function rwMatches(card,look){return RW_CATS.filter(c=>rwFits(card,c,rwItem(c,look[c]))).length;}
// The cheer level 0-3 (✨ Anything Goes is always 3).
function rwLevel(card,look){return card.th.length?Math.min(3,rwMatches(card,look)):3;}
const rwOwns=(p,cat,id)=>{const it=rwItem(cat,id);return !it||isOwned(p,cat,it);};
const rwBorrowed=(p,look)=>RW_CATS.filter(c=>!rwOwns(p,c,look[c]));

/* ---------- 1. theme cards ---------- */
function rwOpen(){
  const p=P(); if(!p) return;
  RW.deck=RW_CARDS.map(c=>c.id).sort(()=>Math.random()-0.5); RW.at=0;
  RW.view='cards'; show('runway');
}
function renderRunway(){
  const p=P(); if(!p) return;
  $('#scr-runway').dataset.view=RW.view;
  $('#rwBack').textContent=RW.view==='cards'?'⬅ Closet':'⬅ Cards';
  if(RW.view==='cards') rwCards(); else rwDress();
}
function rwCards(){
  const p=P(), ids=[0,1,2].map(k=>RW.deck[(RW.at+k)%RW.deck.length]);
  $('#rwCardList').innerHTML=ids.map(id=>{const c=rwCardOf(id), done=p.runway.cards.includes(id);
    return `<button class="rw-card" data-card="${id}" aria-label="${esc(c.name)}"><span class="rw-ci">${c.icon}</span><b>${esc(c.name)}</b>`
      +`<span class="rw-say">${esc(c.say)}</span><span class="rw-th">${c.th.map(t=>THEMES[t]?THEMES[t].icon:'').join(' ')||'🌈'}</span>${done?'<span class="rw-done" aria-hidden="true">👠</span>':''}</button>`;}).join('');
}
$('#rwCardList').onclick=e=>{
  const b=e.target.closest('[data-card]'), p=P(); if(!b||!p) return;
  SFX.happy(); RW.card=rwCardOf(b.dataset.card);
  const h=hairIds(p.look); RW.look=Object.assign({},p.look,{hair:h.h,hairColor:h.c});
  // start on the first tab that has something matching the card
  RW.cat=RW_CATS.find(c=>CLOSET[c].items.some(it=>rwFits(RW.card,c,it)))||'top';
  RW.view='dress'; renderRunway();
};
$('#rwShuffle').onclick=()=>{SFX.click();RW.at=(RW.at+3)%RW.deck.length;rwCards();};

/* ---------- 2. dressing room ---------- */
function rwDress(){
  const c=RW.card;
  $('#rwCardChip').innerHTML=`${c.icon} <b>${esc(c.name)}</b>`;
  $('#rwTabs').innerHTML=RW_CATS.map(k=>{const C=CLOSET[k], n=C.items.some(it=>rwFits(c,k,it));
    return `<button class="tab ${k===RW.cat?'on':''}" data-rcat="${k}">${C.icon} ${C.label}${n?' ✨':''}</button>`;}).join('');
  rwGrid(); rwBuddy();
}
function rwGrid(){
  const p=P(), c=RW.card, C=CLOSET[RW.cat], cat=RW.cat;
  const list=C.items.map((it,i)=>({it,i,fit:rwFits(c,cat,it),own:isOwned(p,cat,it)}))
    .sort((a,b)=>(a.it.id==='none'?-1:0)-(b.it.id==='none'?-1:0)||(b.fit-a.fit)||(b.own-a.own)||a.i-b.i);
  $('#rwGrid').innerHTML=list.map(({it,fit,own})=>{const on=RW.look[cat]===it.id;
    return `<button class="tile ${on?'on':''}${fit?' rw-fit':''}" data-id="${it.id}" aria-label="${esc(it.name)}${own?'':', borrow it'}"><div class="tv">${mascotSVG(Object.assign({},RW.look,{[cat]:it.id}),C.vb)}</div>`
      +`<div class="tn">${fit?'✨ ':''}${esc(it.name)}</div>${own?'':'<span class="tp rw-borrow">👜</span>'}</button>`;}).join('');
}
// Only the big buddy, the sparkles and the ✔ outline change when she puts something on (like the Closet, v1.32).
function rwBuddy(){
  const p=P(), c=RW.card, lv=rwLevel(c,RW.look), n=c.th.length?Math.min(3,rwMatches(c,RW.look)):3, b=rwBorrowed(p,RW.look).length;
  $('#rwMascot').innerHTML=mascotSVG(RW.look);
  $('#rwSpark').innerHTML=[0,1,2].map(k=>`<i class="${k<n?'on':''}">✨</i>`).join('');
  $('#rwSpark').setAttribute('aria-label',c.th.length?(lv>=3?'Totally on theme!':'Put on more ✨ things!'):'Anything goes!');
  $('#rwNote').textContent=c.th.length?(n>=3?'Totally on theme! 🤩':'Put on ✨ things for the card!'):'Anything goes! Wear what you love.';
  $('#rwBag').textContent=b?`👜 ${b} borrowed for the show`:'';
}
$('#rwTabs').onclick=e=>{const b=e.target.closest('[data-rcat]');if(!b)return;RW.cat=b.dataset.rcat;SFX.click();rwDress();$('#rwGrid').scrollTop=0;};
$('#rwGrid').onclick=e=>{
  const t=e.target.closest('.tile'); if(!t||RW.walking) return;
  RW.look[RW.cat]=t.dataset.id; SFX.happy();
  $$('#rwGrid .tile[data-id]').forEach(x=>x.classList.toggle('on',x.dataset.id===t.dataset.id));
  rwBuddy(); rwHop();
};
function rwHop(){const m=$('#rwMascot');m.classList.remove('hop');void m.offsetWidth;m.classList.add('hop');}
// 🎲 Theme surprise: matching pieces in 3 or 4 tabs (✨ Anything Goes: anything, in every tab). Other tabs keep what's on.
function rwSurprise(card,look){
  const L=Object.assign({},look), pick=a=>a[Math.floor(Math.random()*a.length)];
  if(!card.th.length){RW_CATS.forEach(c=>{L[c]=pick(CLOSET[c].items.filter(i=>i.id!=='none')).id;});return L;}
  const cats=RW_CATS.filter(c=>CLOSET[c].items.some(it=>rwFits(card,c,it))).sort(()=>Math.random()-0.5);
  cats.slice(0,Math.max(3,Math.min(4,cats.length))).forEach(c=>{L[c]=pick(CLOSET[c].items.filter(it=>rwFits(card,c,it))).id;});
  return L;
}
$('#rwSurprise').onclick=()=>{if(RW.walking)return;RW.look=rwSurprise(RW.card,RW.look);SFX.happy();rwGrid();rwBuddy();rwHop();};
$('#rwWalk').onclick=()=>rwWalk();

/* ---------- 3. the walk ---------- */
function rwArt(look){
  const key=JSON.stringify(look); if(RW.imgKey===key) return RW.img; RW.imgKey=key;
  const svg=mascotSVG(look,null,'width="200" height="270"').replace('>',`><defs>${$('#gdefs').innerHTML}</defs>`);
  RW.img='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); return RW.img;
}
const rwMs=ms=>window.RW_TEST_FAST?20:ms;
function rwLater(fn,ms){RW.timers.push(setTimeout(fn,rwMs(ms)));}
function rwWalk(){
  const p=P(); if(!p||RW.walking) return;
  RW.walking=true; RW.view='walk'; $('#scr-runway').dataset.view='walk'; $('#rwBack').textContent='⬅ Cards';
  stopMusic(); SFX.click();
  $('#rwBuddyImg').src=rwArt(RW.look);
  $('#rwJudges').innerHTML=RW.card.judges.map(w=>`<div class="rw-judge"><div class="rw-cheer"></div><div class="rw-line"></div>${vFriendSVG(w,'rw-jsvg')}<span>${VISIT_FRIENDS[w].name}</span></div>`).join('');
  const w=$('#rwWalker'); w.classList.remove('go'); void w.offsetWidth; w.classList.add('go');
  w.style.setProperty('--wt',rwMs(RW_WALK_MS)+'ms');
  rwBeat(RW_WALK_MS/1000);
  rwLater(()=>rwCheer(p),RW_WALK_MS);
}
// A short runway beat (8 beats at 115 bpm), scheduled on the audio clock with the Stage's drums.
function rwBeat(sec){
  if(!DB.settings.sound||window.RW_TEST_FAST) return; const a=ac(); if(!a) return;
  const b=60/115, t0=a.currentTime+0.05, bass=[45,45,48,50];
  for(let i=0;i*b<sec-0.1;i++){const at=t0+i*b; sKick(at); sHat(at+b/2); if(i%2) sSnare(at); sTone(mf(bass[Math.floor(i/2)%4]),at,b*0.8,'triangle',0.08);}
}
function rwCheer(p){
  if(cur!=='runway'||!RW.walking) return;
  const c=RW.card, lv=rwLevel(c,RW.look);
  $$('#rwJudges .rw-judge').forEach((j,k)=>{
    j.querySelector('.rw-cheer').textContent=Array.from(RW_CHEERS[lv])[k]; // one card each (the emojis are single characters)
    const L=RW_LINES[lv]; j.querySelector('.rw-line').textContent=L[(k+Math.floor(Math.random()*L.length))%L.length];
    j.style.setProperty('--k',k); j.classList.add('show');});
  SFX.cheer(); vibrate(20); if(lv>=3) giftConfetti();
  rwLater(()=>rwDone(p,lv),RW_CHEER_MS);
}
function rwDone(p,lv){
  if(cur!=='runway'||!RW.walking) return;
  RW.walking=false;
  const c=RW.card; p.stats.walks++; if(lv>=3&&c.th.length) p.stats.wows++;
  if(!p.runway.cards.includes(c.id)) p.runway.cards.push(c.id);
  if(p.runway.pay.day!==rwToday()) p.runway.pay={day:rwToday(),n:0};
  let line;
  if(p.runway.pay.n+RW_COINS<=RW_DAILY){p.runway.pay.n+=RW_COINS;earn(RW_COINS,'Runway');line=`+${RW_COINS} 🪙`;}
  else {save();line='Runway coins are full for today. Keep walking for fun ✨';}
  const keep=RW_CATS.some(k=>RW.look[k]!==p.look[k]&&rwOwns(p,k,RW.look[k]));
  modal(`${c.icon} What a show!`,`<div class="rw-end"><div class="rw-big">${RW_CHEERS[lv]}</div>${esc(RW_LINES[lv][0])}<br><b>${line}</b></div>`,
    [{text:'🔁 Another card',cls:'pink',on:()=>{RW.view='cards';RW.at=(RW.at+3)%RW.deck.length;renderRunway();}}]
    .concat(keep?[{text:'👗 Wear it home',on:()=>rwWearHome()}]:[])
    .concat([{text:'🏠 Done',on:()=>show('closet')}]));
  checkStickers();
}
// 👗 Wear it home: only the pieces she owns; borrowed ones go back to the rack.
function rwWearHome(){
  const p=P(); if(!p||!RW.look) return;
  const back=rwBorrowed(p,RW.look).length;
  RW_CATS.forEach(k=>{if(rwOwns(p,k,RW.look[k])) p.look[k]=RW.look[k];});
  if(rwOwns(p,'hair',RW.look.hair)&&hcOwned(p,RW.look.hairColor)) p.look.hairColor=RW.look.hairColor;
  save(); SFX.happy(); show('closet');
  toast(back?`👗 Wearing it! The 👜 borrowed things went back to the rack.`:'👗 Wearing it!');
}
function rwStop(){
  RW.timers.forEach(clearTimeout); RW.timers=[];
  if(RW.walking){RW.walking=false;const w=$('#rwWalker');if(w)w.classList.remove('go');}
}
function rwBackKey(){
  if(RW.view==='walk'){rwStop();RW.view='dress';renderRunway();return;}
  if(RW.view==='dress'){RW.view='cards';renderRunway();return;}
  show('closet');
}
$('#rwBack').onclick=()=>{SFX.click();rwBackKey();};
$('#runwayBtn').onclick=()=>{SFX.click();rwOpen();};

/* ---------- stickers (🏠 Room & Style) ---------- */
STICKERS.push(
  stk('walk1','room','👠','First Walk','star','Walk the 👠 Runway (in the Closet)',1,p=>p.stats.walks||0),
  stk('walk8','room','🌈','Theme Hopper','cloud','Walk the Runway with 8 different theme cards',8,p=>p.runway.cards.length,1),
  stk('wow3','room','🤩','Crowd Favorite','heart','Get 🤩🤩🤩 for a themed card 3 times',3,p=>p.stats.wows||0,1)
);
