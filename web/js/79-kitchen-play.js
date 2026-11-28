'use strict';
/* =====================================================================
   79. 🍳 KITCHEN PLAY (v1.91): the recipe book, the step runner, stars, coins and the 🍽️ Dish Book
   scr-kitchen has 4 views (KC.view): 'book' (the 8 recipe pages + 🐣 🌟 🧠 level tabs), 'play' (a recipe, one station at a
   time), 'dishes' (the 🍽️ Dish Book) and 'sink' (the washing toy, no goals). The room's 📖 opens 'book', the 🫧 sink 'sink'.
   A recipe is a list of stations (KC_RECIPES, section 80); each station (KC_STATIONS, section 81) is {start(ctx)} and returns
   {stop(), hint()}. ctx gives it: lvl, rnd (one seeded random for the whole recipe, brRand), the stage and tool boxes,
   say(shown, spoken) for its prompt, miss(words) for a wrong try, help() (true once it should show the answer), done().
   No failing: a miss is a funny line and a hint; the second miss in a station shows the answer and moves on.
   Hints: 🐣 Easy after 5 s without a touch or after a miss, 🌟 Medium after a miss, 🧠 Hard only from 💡 (always there).
   Stars (best kept per recipe and level in p.kitchen.stars): 🐣 Easy finishing = ⭐⭐⭐; 🌟 Medium 0-1 misses ⭐⭐⭐, 2-3 ⭐⭐, more ⭐;
   🧠 Hard 0 ⭐⭐⭐, 1-2 ⭐⭐, more ⭐. Coins: every new star (above the best on that level) pays KC_STAR_COINS outside any cap;
   a replay with no new star pays KC_REPLAY from the 🍳 Kitchen allowance (GAME_PAY.kitchen, 20 a day).
   The plated dish goes in the Dish Book (KC_DISH_MAX newest kept); 🍽️ Put it out makes a `dish` decoration in the room.
   Nothing about a recipe half made is saved: Back mid-recipe asks first (kcMid, navigation rule 5).
   No main loop: stations use pointer events, CSS and a few setTimeouts (cleared by kcStop).
   ===================================================================== */
const KC_STAR_COINS={easy:2,medium:3,hard:4}, KC_REPLAY=2, KC_DISH_MAX=24, KC_IDLE=5000, KC_LVLS=['easy','medium','hard'];
const KC_LV_ICON={easy:'🐣',medium:'🌟',hard:'🧠'}, KC_LV_NAME={easy:'Easy',medium:'Medium',hard:'Hard'};
GAME_PAY.kitchen={name:'🍳 Kitchen',cap:20,pay:p=>p.kitchen.pay};
const KC_STATIONS={}; // filled in by section 81
window.KC_TEST_SEED=null; // the smoke test may set a seed, so a recipe plays the same every time
let KC={view:'book',run:null,line:'',lineN:0,tok:0,idle:0,sink:null};

const kcLvl=p=>lockOn()?'easy':p.kitchen.level; // Easy mode opens on Easy (renderKitchen) but can switch, like the Brain Games
const kcStars=(p,r,l)=>((p.kitchen.stars[r]||{})[l])||0;
function kcOpen(view){KC.view=view==='sink'?'sink':'book';show('kitchen');}
function renderKitchen(){
  const p=P(); if(!p) return;
  if(p.easy||lockOn()) p.kitchen.level='easy';
  if(KC.view==='sink') kcSinkStart(); else kcBook();
}
function kcViews(v){
  KC.view=v;
  $('#kcBook').classList.toggle('hidden',v!=='book'); $('#kcDishes').classList.toggle('hidden',v!=='dishes');
  $('#kcPlay').classList.toggle('hidden',v!=='play'&&v!=='sink'); $('#kcPlay').classList.toggle('sink',v==='sink');
  backBtn('#kcBack',v==='play'||v==='dishes'?'recipes':'room');
  $('#kcTitle').textContent=v==='dishes'?'🍽️ My Dishes':v==='sink'?'🫧 Sink':v==='play'&&KC.run?`${KC.run.r.icon} ${KC.run.r.name}`:'📖 Recipes';
}
// Everything a station or the sink left running stops here (leaving the screen, a new step, Back).
function kcStop(){
  KC.tok++; clearTimeout(KC.idle);
  if(KC.run&&KC.run.st&&KC.run.st.stop) KC.run.st.stop();
  if(KC.sink&&KC.sink.stop) KC.sink.stop();
  KC.sink=null; if(cur!=='kitchen') KC.run=null;
}

/* ---------- 📖 the recipe book ---------- */
function kcBook(){
  const p=P(); if(!p) return; kcStop(); KC.run=null; kcViews('book');
  const lvl=kcLvl(p), fresh=!Object.keys(p.kitchen.stars).length;
  $('#kcBook').innerHTML=`<div class="tabs" id="kcTabs">`+KC_LVLS.map(l=>`<button class="tab${l===lvl?' on':''}" data-lvl="${l}">${KC_LV_ICON[l]} <span>${KC_LV_NAME[l]}</span></button>`).join('')+`</div>`
    +`<div class="kc-pages">`+KC_RECIPES.map((r,i)=>{
      const st=kcStars(p,r.id,lvl), stamps=KC_LVLS.map(l=>`<i class="${kcStars(p,r.id,l)?'on':''}">${KC_LV_ICON[l]}</i>`).join('');
      return `<button class="kc-rcp${r.soon?' soon':''}" data-rcp="${r.id}" aria-label="${esc(r.name)}${r.soon?', coming soon':''}">`
        +`<span class="kc-no">${i+1}</span>${i===0&&fresh?'<span class="kc-first">⭐ Start here</span>':''}`
        +(r.soon?`<span class="kc-ri">${r.icon}</span>`:`<svg class="kc-rpic" viewBox="-96 -132 192 140" aria-hidden="true">${kcDishG(null)}</svg>`)
        +`<b>${esc(r.name)}</b>`+(r.soon?`<span class="kc-soon">🔜 Soon</span>`
          :`<span class="kc-st">${[1,2,3].map(n=>`<i class="${st>=n?'on':''}">⭐</i>`).join('')}</span><span class="kc-stamps">${stamps}</span>`)+`</button>`;}).join('')+`</div>`
    +`<button class="btn ghost kc-dishbtn" id="kcDishBtn" aria-label="My dishes">🍽️ <span class="tn">My Dishes</span> <b>${p.kitchen.dishes.length}</b></button>`;
}
$('#kcBook').addEventListener('click',e=>{
  const p=P(); if(!p) return;
  const t=e.target.closest('[data-lvl]');
  if(t){if(lockOn()&&t.dataset.lvl!=='easy')return;SFX.click();p.kitchen.level=t.dataset.lvl;save();kcBook();return;}
  if(e.target.closest('#kcDishBtn')){SFX.click();kcDishes();return;}
  const b=e.target.closest('[data-rcp]'); if(!b) return; const r=kcRecipe(b.dataset.rcp);
  if(r.soon){SFX.locked();toast(`🔜 ${r.icon} ${r.name} is coming in a future update!`);return;}
  SFX.click(); kcStart(r.id,kcLvl(p));
});

/* ---------- the step runner ---------- */
function kcStart(rid,lvl){
  const p=P(), r=kcRecipe(rid); if(!p||!r||r.soon) return; kcStop();
  const seed=window.KC_TEST_SEED||`${rid}:${lvl}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2,6)}`;
  KC.run={r,lvl,seed,rnd:brRand(seed),steps:r.steps[lvl],i:-1,miss:0,sMiss:0,touched:false,done:false,dish:{f:[],c:[],rim:[]},st:null};
  kcViews('play'); kcNext();
}
function kcNext(){
  const R=KC.run; if(!R) return;
  if(R.st&&R.st.stop) R.st.stop(); R.st=null; clearTimeout(KC.idle);
  R.i++; R.sMiss=0;
  if(R.i>=R.steps.length){kcFinish();return;}
  $('#kcSteps').innerHTML=R.steps.map((s,i)=>`<i class="${i<R.i?'done':i===R.i?'on':''}" aria-hidden="true">${KC_ICON[s]||'⭐'}</i>`).join('');
  $('#kcStage').innerHTML=''; $('#kcTools').innerHTML=''; $('#kcSay').textContent='';
  const tok=++KC.tok, ctx=kcCtx(R,tok);
  R.st=KC_STATIONS[R.steps[R.i]].start(ctx)||{};
  kcIdle();
}
function kcCtx(R,tok){
  const live=()=>KC.tok===tok&&KC.run===R;
  return {lvl:R.lvl,rnd:R.rnd,run:R,dish:R.dish,stage:$('#kcStage'),tools:$('#kcTools'),live,
    say:(shown,spoken)=>{if(!live())return;$('#kcSay').textContent=shown;KC.line=spoken||spkClean(shown);KC.lineN++;setTimeout(spkCheck,0);},
    touch:()=>{R.touched=true;kcIdle();},
    miss:words=>{if(!live())return 0;R.miss++;R.sMiss++;R.touched=true;SFX.locked();vibrate(15);if(words){toast(words);tell(words);}
      if(R.lvl!=='hard'&&R.st&&R.st.hint) setTimeout(()=>{if(live()&&R.st&&R.st.hint)R.st.hint();},900);
      kcIdle(); return R.sMiss;},
    help:()=>R.sMiss>=2, // the second miss: show the answer and move on
    done:()=>{if(!live())return;clearTimeout(KC.idle);SFX.happy();vibrate(20);kcCheer();setTimeout(()=>{if(live())kcNext();},900);}};
}
// 🐣 Easy: a hint by itself after KC_IDLE ms without a touch (once per quiet spell).
function kcIdle(){
  clearTimeout(KC.idle); const R=KC.run; if(!R||R.lvl!=='easy'||KC.view!=='play') return;
  const tok=KC.tok; KC.idle=setTimeout(()=>{if(KC.tok===tok&&KC.run===R&&R.st&&R.st.hint&&!endBoxOpen()&&$('#modal').classList.contains('hidden'))R.st.hint();},KC_IDLE);
}
$('#kcStage').addEventListener('pointerdown',()=>{if(KC.run){KC.run.touched=true;kcIdle();}});
$('#kcHint').onclick=()=>{const R=KC.run, s=R?R.st:KC.sink; if(s&&s.hint){SFX.click();s.hint();kcIdle();}};
function kcCheer(){const s=$('#kcStage'), d=document.createElement('div');d.className='kc-cheer';d.innerHTML='✨<b>⭐</b>✨';s.appendChild(d);setTimeout(()=>d.remove(),900);}
const kcMid=()=>KC.view==='play'&&!!KC.run&&!KC.run.done&&(KC.run.i>0||KC.run.touched);

/* ---------- the end: stars, coins, the dish ---------- */
function kcStarsFor(lvl,miss){return lvl==='easy'?3:lvl==='medium'?(miss<=1?3:miss<=3?2:1):(miss===0?3:miss<=2?2:1);}
function kcFinish(){
  const p=P(), R=KC.run; if(!p||!R) return; R.done=true; clearTimeout(KC.idle);
  const stars=kcStarsFor(R.lvl,R.miss), was=kcStars(p,R.r.id,R.lvl), fresh=Math.max(0,stars-was);
  const S=p.kitchen.stars[R.r.id]=Object.assign({easy:0,medium:0,hard:0},p.kitchen.stars[R.r.id]); S[R.lvl]=Math.max(was,stars);
  const dish={id:uid(),r:R.r.id,lv:R.lvl,f:R.dish.f.slice(0,18),c:R.dish.c.slice(0,16),rim:R.dish.rim.slice(0,KC_RIM_N),at:Date.now()};
  p.kitchen.dishes.push(dish); if(p.kitchen.dishes.length>KC_DISH_MAX) p.kitchen.dishes=p.kitchen.dishes.slice(-KC_DISH_MAX);
  p.stats.cooked=(p.stats.cooked||0)+1;
  let coins=0;
  if(fresh){coins=fresh*KC_STAR_COINS[R.lvl];earn(coins,'⭐',innerWidth/2,innerHeight/2);}
  else coins=gameEarn('kitchen',KC_REPLAY,'🍳',innerWidth/2,innerHeight/2);
  save(); SFX.cheer(); checkStickers();
  const fact=R.r.facts[Math.floor(R.rnd()*R.r.facts.length)], easy=p.easy;
  KC.line=`Yum! You made a ${R.r.say}! ${fact}`;
  endBox({title:`${R.r.icon} Yum! ${esc(R.r.name)}`,
    body:`<div class="kc-end"><svg viewBox="-96 -132 192 140" aria-hidden="true">${kcDishG(dish)}</svg>`
      +`<div class="kc-endst">${[1,2,3].map(n=>`<i class="${stars>=n?'on':''}">⭐</i>`).join('')}</div>`
      +(coins?`<div class="kc-coins">+${coins} 🪙${fresh?` · ${fresh} new ⭐`:''}</div>`:'')
      +(easy?'':`<p class="kc-fact">💡 ${esc(fact)}</p>`)+`</div>`,
    back:{to:'recipes',on:kcBook},
    mid:[{text:'🍽️ Put it out',on:()=>{kcPutOut(dish);kcBook();}}],
    go:{text:'🔁 Again',on:()=>kcStart(R.r.id,R.lvl)}});
  tell(KC.line);
}
// 🍽️ A dish becomes a decoration in the room the Kitchen screen was opened from (usually the Kitchen).
function kcPutOut(d){
  const p=P(); if(!p||!d) return;
  const it=Object.assign({uid:uid(),type:'dish',dish:{id:d.id,r:d.r,lv:d.lv,f:d.f.slice(),c:d.c.map(t=>Object.assign({},t)),rim:(d.rim||[]).slice(),at:d.at},placed:true},spot('dish'));
  curRoom(p).items.push(it); save(); SFX.pop();
  toast(`🍽️ It's in your ${roomInfo(roomNo).name}! Move it in 🛋️ Decorate.`);
}

/* ---------- 🍽️ the Dish Book ---------- */
function kcDishes(){
  const p=P(); if(!p) return; kcStop(); kcViews('dishes');
  const L=p.kitchen.dishes.slice().reverse();
  $('#kcDishes').innerHTML=L.length?`<div class="kc-dgrid">`+L.map(d=>{const r=kcRecipe(d.r)||KC_RECIPES[0];
    return `<button class="kc-dish" data-dish="${d.id}" aria-label="${esc(r.name)}"><svg viewBox="-96 -132 192 140" aria-hidden="true">${kcDishG(d)}</svg>`
      +`<span class="tn">${r.icon} ${KC_LV_ICON[d.lv]||''}</span></button>`;}).join('')+`</div>`
    :`<div class="empty">No dishes yet! Make a recipe and it shows up here 🥗</div>`;
}
$('#kcDishes').addEventListener('click',e=>{
  const b=e.target.closest('[data-dish]'), p=P(); if(!b||!p) return;
  const d=p.kitchen.dishes.find(x=>x.id===b.dataset.dish); if(!d) return; const r=kcRecipe(d.r)||KC_RECIPES[0]; SFX.click();
  modal(`${r.icon} ${esc(r.name)}`,`<div class="kc-end"><svg viewBox="-96 -132 192 140" aria-hidden="true">${kcDishG(d)}</svg></div>`,
    [{text:'🍽️ Put it out',cls:'pink',on:()=>kcPutOut(d)},{text:'✖ Close',cls:'ghost'}]);
});

/* ---------- 🫧 the sink: wash anything, no goals ---------- */
function kcSinkStart(){
  kcStop(); KC.run=null; kcViews('sink');
  $('#kcSteps').innerHTML=''; $('#kcStage').innerHTML=''; $('#kcTools').innerHTML='';
  const tok=++KC.tok, rnd=brRand('sink:'+Date.now());
  const ctx={lvl:'easy',free:true,rnd,dish:{f:[],c:[],rim:[]},stage:$('#kcStage'),tools:$('#kcTools'),live:()=>KC.tok===tok&&KC.view==='sink',
    say:(shown,spoken)=>{$('#kcSay').textContent=shown;KC.line=spoken||spkClean(shown);KC.lineN++;setTimeout(spkCheck,0);},
    touch:()=>{},miss:()=>0,help:()=>false,done:()=>{}};
  KC.sink=KC_STATIONS.wash.start(ctx)||{};
}

/* ---------- getting around + words ---------- */
function kcBackKey(){
  if(KC.view==='play'){navBack(kcBook);return;}
  if(KC.view==='dishes'){kcBook();return;}
  kcStop(); show('room');
}
$('#kcBack').onclick=()=>{SFX.click();kcBackKey();};
SPK_FIXED.kcBook='Pick a recipe to cook! The top buttons make it easier or harder.';
SPK_FIXED.kcBookEasy='Pick a recipe to cook!';
SPK_FIXED.kcDishes='Here are the dishes you made. Tap one to put it in your room.';
function kcSpeak(){
  const p=P(); if(!p) return null;
  if(KC.view==='book') return {k:'kc:book',t:p.easy||lockOn()?SPK_FIXED.kcBookEasy:SPK_FIXED.kcBook};
  if(KC.view==='dishes') return {k:'kc:dishes',t:SPK_FIXED.kcDishes};
  return {k:'kc:'+KC.view+':'+KC.lineN,t:KC.line};
}

/* ---------- stickers (Room & Style page) + the pet notices ---------- */
STICKERS.push(
  stk('chef1','room','🥗','Little Chef','circle','Make a recipe in the 🍳 Kitchen (tap the recipe book)',1,p=>p.stats.cooked||0),
  stk('chefStars','room','🍳','Star Chef','star','Get 3 stars on Easy, Medium and Hard in one recipe',3,p=>Math.max(0,...KC_RECIPES.map(r=>KC_LVLS.filter(l=>kcStars(p,r.id,l)>=3).length)),2)
);
NT_LINES.push([ntS('cooked'),1,n=>['Yum, that looks so tasty! 🥗','What a chef! 🍳','Can I have a bite? 🥗']]);
