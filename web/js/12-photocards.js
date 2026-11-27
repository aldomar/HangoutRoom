'use strict';
/* =========================================================
   12. PHOTOCARD WALL: card maker, binder, corkboard pins, bonus cards
   A card is saved as a small "recipe" (outfit, stage, frame, title, name, stats), not a picture,
   so it lives in the normal save and backups, and is drawn again from the recipe when shown.
   Card art is a 300 x 420 box; the photo (stage + mascot) is a 268 x 250 box inside it.
   Ids of stages, frames and bonus milestones are saved: never rename them.
   ========================================================= */
const CARD_MAX=60, CARD_PAGE=6, PIN_MAX=3, BONUS_COINS=10; // 60 made cards (bonus cards don't count)
const twinkle=(x,y,r)=>`M${x} ${y-r} Q${x} ${y} ${x+r} ${y} Q${x} ${y} ${x} ${y+r} Q${x} ${y} ${x-r} ${y} Q${x} ${y} ${x} ${y-r}Z`;
const miniBat=(x,y,k,c)=>`<g transform="translate(${x} ${y}) scale(${k})" fill="${c}"><path d="M0 -2 Q-14 -18 -28 -8 Q-21 -6 -22 1 Q-15 -2 -13 5 Q-7 1 0 7 Q7 1 13 5 Q15 -2 22 1 Q21 -6 28 -8 Q14 -18 0 -2Z"/><path d="M-6 -6 L-5 -14 L-1 -8 M6 -6 L5 -14 L1 -8"/><circle cy="-1" r="7"/></g>`;
const cloud=(x,y,k)=>`<g transform="translate(${x} ${y}) scale(${k})" fill="#fff" opacity=".9"><circle cx="-18" cy="4" r="14"/><circle cx="0" cy="-4" r="18"/><circle cx="20" cy="4" r="13"/><rect x="-30" y="4" width="62" height="14" rx="7"/></g>`;
const CORNERS=[[14,14],[286,14],[14,406],[286,406]];

// Stages: the background of the photo, in a 268 x 250 box.
const STAGES={
  spot:{name:'Spotlight',price:0,d:()=>`<rect width="268" height="250" fill="#2b2340"/><path d="M30 0 L-10 250 H120Z M238 0 L148 250 H278Z" fill="#fff" opacity=".1"/><path d="M134 0 L84 250 H184Z" fill="#ffd166" opacity=".14"/><ellipse cx="134" cy="236" rx="170" ry="42" fill="#5b3a99"/><ellipse cx="134" cy="228" rx="118" ry="22" fill="#7d58cc"/>`
    +[0,1,2,3,4,5,6].map(i=>`<circle cx="${20+i*38}" cy="10" r="6" fill="${['#ff8cc6','#ffd166','#8ff0d0','#a97cff'][i%4]}"/>`).join('')},
  stars:{name:'Starry Night',price:0,d:()=>`<rect width="268" height="250" fill="url(#gNight)"/><rect width="268" height="250" fill="url(#pStars)"/><path d="${twinkle(40,60,12)} ${twinkle(230,110,9)}" fill="#fff"/><ellipse cx="134" cy="244" rx="170" ry="36" fill="#2a2150"/>`},
  candy:{name:'Candy Clouds',price:0,d:()=>`<rect width="268" height="250" fill="url(#gCandy)"/><rect width="268" height="250" fill="url(#pHearts)"/>${cloud(46,50,1)}${cloud(220,90,.8)}${cloud(70,170,.7)}<ellipse cx="134" cy="246" rx="170" ry="34" fill="#fff" opacity=".7"/>`},
  pitch:{name:'Soccer Pitch',price:10,d:()=>`<rect width="268" height="250" fill="url(#gSky)"/><circle cx="36" cy="34" r="18" fill="#ffe066"/>${cloud(200,40,.6)}<rect y="150" width="268" height="100" fill="#5cb85f"/><rect y="150" width="268" height="100" fill="url(#pTurf)"/>`
    +`<g stroke="#fff" stroke-width="1.5" opacity=".6">${[80,96,112,128,144,160,176,192].map(x=>`<line x1="${x}" y1="98" x2="${x}" y2="150"/>`).join('')}${[110,124,138].map(y=>`<line x1="70" y1="${y}" x2="198" y2="${y}"/>`).join('')}</g><path d="M70 152 V96 H198 V152" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><path d="M0 214 H268" stroke="#fff" stroke-width="4" opacity=".8"/>`},
  neon:{name:'Neon Hearts',price:15,d:()=>`<rect width="268" height="250" fill="#1a1022"/><g stroke="#ff4fa3" stroke-width="2" opacity=".45">${[-200,-120,-40,40,120,200].map(x=>`<line x1="134" y1="170" x2="${134+x*1.6}" y2="250"/>`).join('')}<line x1="0" y1="190" x2="268" y2="190"/><line x1="0" y1="216" x2="268" y2="216"/></g>`
    +`<path d="${heartPath(134,96,58)}" fill="none" stroke="#ff4fa3" stroke-width="9" filter="url(#glow)"/><path d="${heartPath(134,96,58)}" fill="none" stroke="#ffd1ea" stroke-width="3"/><path d="${twinkle(34,40,8)} ${twinkle(236,58,10)} ${twinkle(222,150,6)}" fill="#8ff0d0"/>`},
  spooky:{name:'Spooky Moon',price:20,d:()=>`<rect width="268" height="250" fill="url(#gSpooky)"/><circle cx="208" cy="56" r="32" fill="#ffe9a8" filter="url(#glow)"/><circle cx="198" cy="50" r="6" fill="#f2d68a"/><circle cx="216" cy="68" r="4" fill="#f2d68a"/>${miniBat(52,44,.9,'#1d1430')}${miniBat(96,78,.6,'#1d1430')}`
    +`<path d="M0 196 Q60 168 130 192 T268 186 V250 H0Z" fill="#2a1f3a"/><g transform="translate(30 186)"><path d="M-14 22 V0 Q-14 -18 0 -18 Q14 -18 14 0 V22 Q9 16 5 22 Q0 16 -5 22 Q-9 16 -14 22Z" fill="#fbf7ff"/><circle cx="-5" cy="-3" r="2.5" fill="#2a1f33"/><circle cx="5" cy="-3" r="2.5" fill="#2a1f33"/></g>`},
  // v1.7 (free): a concert stage with light beams and a crowd of glowing light sticks.
  concert:{name:'Concert',price:0,d:()=>`<rect width="268" height="250" fill="#1d1233"/>`
    +`<path d="M20 0 L-20 200 H90Z" fill="#ff8cc6" opacity=".22"/><path d="M248 0 L178 200 H288Z" fill="#8ff0d0" opacity=".22"/><path d="M134 0 L94 200 H174Z" fill="#ffd166" opacity=".18"/>`
    +[0,1,2,3,4,5].map(i=>`<circle cx="${24+i*44}" cy="8" r="7" fill="${['#ff8cc6','#ffd166','#8ff0d0'][i%3]}"/>`).join('')
    +`<path d="${twinkle(46,70,8)} ${twinkle(224,92,10)}" fill="#fff"/><rect y="196" width="268" height="54" fill="#120b20"/>`
    +[0,1,2,3,4,5,6,7].map(i=>{const x=12+i*35,y=224+(i%2)*8;return `<line x1="${x}" y1="${y+20}" x2="${x}" y2="${y}" stroke="#3b2f52" stroke-width="4"/><path d="${heartPath(x,y-4,7)}" fill="${['#ff8cc6','#a97cff','#8ff0d0','#ffd166'][i%4]}"/>`;}).join('')
    +`<ellipse cx="134" cy="206" rx="120" ry="16" fill="#5b3a99"/>`},
  // Bonus cards only (not in the picker).
  gold:{name:'Golden Stage',price:0,bonus:1,d:()=>`<rect width="268" height="250" fill="url(#gGold)"/><g fill="#fff" opacity=".28">${[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>{const a=i*Math.PI/6,b=a+0.16;return `<path d="M134 110 L${(134+Math.cos(a)*300).toFixed(0)} ${(110+Math.sin(a)*300).toFixed(0)} L${(134+Math.cos(b)*300).toFixed(0)} ${(110+Math.sin(b)*300).toFixed(0)}Z"/>`;}).join('')}</g>`
    +`<path d="${twinkle(36,40,12)} ${twinkle(232,52,10)} ${twinkle(222,170,8)} ${twinkle(46,160,7)}" fill="#fff"/><ellipse cx="134" cy="244" rx="170" ry="34" fill="#e09a2d" opacity=".55"/>`}
};
// Frames: the card border. bg = border fill; d() = corner decorations (in the 300 x 420 card box).
const FRAMES={
  sparkle:{name:'Sparkle',price:0,bg:'#ffe3f1',d:()=>`<path d="${CORNERS.map(([x,y])=>twinkle(x,y,11)).join(' ')}" fill="#ffd166" stroke="#c8578f" stroke-width="1.5"/>`},
  hearts:{name:'Hearts',price:0,bg:'#ff8cc6',d:()=>CORNERS.map(([x,y])=>`<path d="${heartPath(x,y,9)}" fill="#fff" stroke="#c8578f" stroke-width="2"/>`).join('')},
  stars:{name:'Stars',price:0,bg:'#2b2340',d:()=>`<path d="${CORNERS.map(([x,y])=>starPath(x,y,12)).join(' ')}" fill="#ffd166" stroke="#2b2235" stroke-width="2"/>`},
  stripes:{name:'Emo Stripes',price:10,bg:'url(#stripeBP)',d:()=>CORNERS.map(([x,y])=>`<path d="${heartPath(x,y,8)}" fill="#ff8cc6" stroke="#1f1a26" stroke-width="2"/>`).join('')},
  bats:{name:'Bats',price:15,bg:'#3d3150',d:()=>CORNERS.map(([x,y])=>miniBat(x,y,.55,'#a97cff')).join('')},
  gold:{name:'Gold',price:25,bg:'url(#gGold)',d:()=>`<path d="${CORNERS.map(([x,y])=>starPath(x,y,12)).join(' ')}" fill="#fff" stroke="#b07a1e" stroke-width="2"/>`},
  // Bonus cards only (not in the picker).
  holo:{name:'Holo',price:0,bonus:1,bg:'url(#gHolo)',d:()=>`<path d="${CORNERS.map(([x,y])=>twinkle(x,y,12)).join(' ')}" fill="#fff" stroke="#a97cff" stroke-width="1.5"/>`}
};
const CARD_TITLES=['Main Dancer','Lead Singer','Leader','Rapper','Visual','Center','Team Captain','Goal Getter',
  'Artist','Squish Master','Pop-it Pro','Spin Champ','Style Icon','Spooky Cutie','Best Bunny','Rising Star'];
// The three stats come from the outfit: 1 star, plus 1 for each matching item (5 at most). No randomness.
const CARD_TAGS={
  cute:['fur:white','fur:pink','fur:lavender','fur:mint','hair:tuft','hair:swoopPink','top:hoodie','top:cardi','top:stage','bottom:tutu',
    'legs:pinkFuzz','legs:whiteFuzz','legs:rainbow','arms:pinkFuzz','arms:lavFuzz','shoes:sneakers','shoes:maryjanes','acc:bow','acc:tiara','acc:stars'],
  spooky:['fur:black','hair:swoopBlack','hair:swoopPurple','hair:swoopStreak','top:tee','top:zip','bottom:plaid','bottom:plaidP',
    'legs:stripeBP','legs:stripeBW','legs:blackFuzz','arms:stripeBP','arms:stripeBW','arms:blackFuzz','shoes:boots','acc:batclip','acc:choker'],
  sporty:['top:jersey','top:hoodie','bottom:shorts','bottom:jeans','legs:soccer','shoes:cleats','shoes:sneakers','acc:headphones']
};
const STAT_ROWS=[['cute','💗 Cute'],['spooky','🦇 Spooky'],['sporty','⚽ Sporty']];
// Hair counts by style and (for styles that aren't fur) by color, e.g. Pigtails or Pink hair are Cute.
function cardStats(look){
  const hi=hairIds(look), hk=['hair:'+hi.h].concat(itemOf('hair',hi.h).fur?[]:['hairc:'+hi.c]);
  return STAT_ROWS.map(([k])=>Math.min(5,1+Object.keys(CLOSET).filter(cat=>cat==='hair'?hk.some(x=>CARD_TAGS[k].includes(x)):CARD_TAGS[k].includes(cat+':'+look[cat])).length));}
CARD_TAGS.cute.push('hair:bob','hair:pigtails','hair:waves','hair:twinTails','hairc:pink','hairc:candy','hairc:snow','hairc:blonde','hairc:sky','hairc:mint');
CARD_TAGS.spooky.push('hair:spikes','hairc:black','hairc:purple','hairc:streak');
// Bonus cards: one gold holo card (+10 coins) for each milestone, given once. Ids are saved in bonusGot.
const BONUS=[
  {id:'flip1',name:'First Flip!',ok:p=>p.stats.flips>=1},
  {id:'pop1000',name:'1,000 Pops',ok:p=>p.stats.pops>=1000},
  {id:'squish100',name:'100 Squishes',ok:p=>p.stats.squish>=100},
  {id:'spin500',name:'Speed Spinner',ok:p=>p.stats.bestRpm>=500},
  {id:'draw1',name:'First Drawing',ok:p=>p.stats.drawings>=1},
  {id:'draw10',name:'10 Drawings',ok:p=>p.stats.drawings>=10},
  {id:'closet10',name:'Style Star',ok:p=>p.owned.filter(k=>CLOSET[String(k).split(':')[0]]).length>=10},
  {id:'cards10',name:'Card Collector',ok:p=>p.stats.cards>=10},
  // v1.5 Soccer Field
  {id:'goal1',name:'First Goal!',ok:p=>p.stats.goals>=1},
  {id:'perfect1',name:'Perfect 5/5',ok:p=>p.stats.perfects>=1},
  {id:'goals50',name:'50 Goals',ok:p=>p.stats.goals>=50},
  // v1.7 Stage
  {id:'show1',name:'First Show!',ok:p=>p.stats.shows>=1},
  {id:'combo1',name:'Full Combo',ok:p=>p.stats.fullCombos>=1},
  {id:'encore',name:'Encore!',ok:p=>['starlight','bats','sugar'].every(s=>Object.values(p.stage.best[s]||{}).some(r=>r.stars>0))},
  {id:'superstar',name:'Superstar',ok:p=>SONG_IDS.some(s=>((p.stage.best[s]||{}).hard||{}).stars>=3)}
];

// Draws a card. flat = leave out the animated-looking fuzz filter (for small cards: binder, corkboard, tiles).
function cardSVG(c,flat,attrs){
  const S=STAGES[c.stage]||STAGES.spot, F=FRAMES[c.frame]||FRAMES.sparkle, look=Object.assign({},DEFAULT_LOOK,c.look||{});
  const s=Array.isArray(c.s)&&c.s.length===3?c.s:cardStats(look), name=String(c.name||'Fuzzy'), title=String(c.title||'');
  let m=mascotSVG(look,null,'x="64" y="22" width="140" height="189"'); if(flat) m=m.replace(/ filter="url\(#fuzz\)"/g,'');
  const no='#'+String(Number(c.no)||0).padStart(3,'0');
  const date=c.at?new Date(c.at).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):'';
  return `<svg viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" ${attrs||''}>`
    +`<rect x="2" y="2" width="296" height="416" rx="18" fill="${F.bg}" stroke="#2b2235" stroke-width="4"/>`
    +`<svg x="16" y="16" width="268" height="250" viewBox="0 0 268 250">${S.d()}<ellipse cx="134" cy="208" rx="50" ry="9" fill="#00000040"/>${m}</svg>`
    +`<rect x="16" y="16" width="268" height="250" rx="4" fill="none" stroke="#2b2235" stroke-width="3"/>`
    +F.d()
    +`<rect x="24" y="24" width="62" height="26" rx="13" fill="#fff" stroke="#2b2235" stroke-width="2.5"/><text x="55" y="43" text-anchor="middle" font-size="16" font-weight="900" fill="#2b2235">${no}</text>`
    +(c.bonus?`<rect x="190" y="24" width="86" height="26" rx="13" fill="#ffd166" stroke="#2b2235" stroke-width="2.5"/><text x="233" y="43" text-anchor="middle" font-size="14" font-weight="900" fill="#3a2c18">★ BONUS</text>`:'')
    +`<rect x="16" y="288" width="268" height="118" rx="12" fill="#fff" opacity=".94"/>`
    +`<rect x="45" y="250" width="210" height="32" rx="16" fill="#ff8cc6" stroke="#2b2235" stroke-width="3"/><text x="150" y="272" text-anchor="middle" font-size="${title.length>14?14:17}" font-weight="900" fill="#3a1830">${esc(title)}</text>`
    +`<text x="150" y="313" text-anchor="middle" font-size="${name.length>12?20:25}" font-weight="900" fill="#2b2235">${esc(name)}</text>`
    +`<text x="150" y="330" text-anchor="middle" font-size="11" font-weight="700" fill="#7a6a8f">${esc(date)}</text>`
    +STAT_ROWS.map(([k,label],i)=>{const y=352+i*21;return `<text x="32" y="${y+5}" font-size="15" font-weight="800" fill="#2b2235">${label}</text>`
      +[0,1,2,3,4].map(j=>`<path d="${starPath(170+j*22,y,9)}" fill="${j<s[i]?'#ffd166':'#e6dcf2'}" stroke="#2b2235" stroke-width="1.5"/>`).join('');}).join('')
    +'</svg>';
}
function newCard(p,o){
  const c={id:uid(),no:++p.cardNo,at:Date.now(),look:Object.assign({},p.look),stage:o.stage,frame:o.frame,title:o.title,name:o.name,s:cardStats(p.look)};
  if(o.bonus) c.bonus=o.bonus;
  p.cards.push(c); return c;
}

// Gives every milestone card she has earned but not had yet (also the ones reached before v1.4).
function checkBonus(){
  const p=P(); if(!p) return;
  const got=BONUS.filter(b=>!p.bonusGot.includes(b.id)&&b.ok(p)); if(!got.length) return;
  const made=got.map(b=>{p.bonusGot.push(b.id);return newCard(p,{stage:'gold',frame:'holo',title:b.name,name:p.mascotName,bonus:b.id});});
  const coins=BONUS_COINS*got.length; p.coins+=coins; save(); // saved straight away so it can never be given twice
  const here=cur;
  setTimeout(()=>{
    updateCoins(); SFX.buy(); floatText(`+${coins} 🪙`,innerWidth/2,innerHeight/2);
    const n=made.length, names=got.map(b=>b.name).join(', ').replace(/!+$/,'');
    // Only pop up if she is still where she was and not busy; otherwise a quick message is enough.
    if(cur!==here||decorating||!$('#modal').classList.contains('hidden')){toast(`🌟 New bonus card${n>1?'s':''}: ${names}! +${coins} 🪙`);return;}
    modal(`🌟 ${n>1?n+' bonus cards':'Bonus card'}!`,`<div class="card-modal${n>1?' few':''}">${made.slice(0,3).map(c=>cardSVG(c,true)).join('')}</div>`
      +`<div style="text-align:center">You did it: ${esc(names)}!<br>+${coins} 🪙 and ${n>1?'they are':'it is'} in your binder.</div>`,
      [{text:'📒 See binder',cls:'ghost',on:()=>{show('cards');setCardView('binder');}},{text:'Yay! ✨',cls:'pink'}]);
  },cur==='room'?900:300);
}

let CARD={owner:null,stage:'spot',frame:'sparkle',title:'Main Dancer',name:'',nameSet:false,tab:'stage',view:'make',page:0};
const cardOwned=(p,kind,k)=>{const L=kind==='stage'?STAGES:FRAMES;return !!L[k]&&!L[k].bonus&&(!L[k].price||p.owned.includes(kind+':'+k));};
function renderCards(){
  const p=P(); if(!p) return;
  if(CARD.owner!==p.id) Object.assign(CARD,{owner:p.id,stage:'spot',frame:'sparkle',title:'Main Dancer',nameSet:false,view:'make',page:0});
  if(!CARD.nameSet) CARD.name=p.mascotName;
  if(!cardOwned(p,'stage',CARD.stage)) CARD.stage='spot';
  if(!cardOwned(p,'frame',CARD.frame)) CARD.frame='sparkle';
  setCardView(CARD.view);
}
function setCardView(v){
  CARD.view=v;
  $('#cardMakeView').classList.toggle('hidden',v!=='make');
  $('#cardBinderView').classList.toggle('hidden',v!=='binder');
  $('#cardViewBtn').textContent=v==='binder'?'📸 Maker':'📒 Binder';
  if(v==='binder') renderBinder(); else renderMaker();
}
$('#cardViewBtn').onclick=()=>{SFX.click();setCardView(CARD.view==='binder'?'make':'binder');};

function previewCard(p){return {no:p.cardNo+1,at:Date.now(),look:p.look,stage:CARD.stage,frame:CARD.frame,title:CARD.title,name:CARD.name};}
function renderMaker(){
  const p=P(); if(!p) return;
  $('#cardBig').innerHTML=cardSVG(previewCard(p));
  $('#cardNameBtn').textContent=CARD.name+' ✏️';
  $$('#cardTabs .tab').forEach(b=>b.classList.toggle('on',b.dataset.ct===CARD.tab));
  let h='';
  if(CARD.tab==='stage') h=easySort(Object.entries(STAGES).filter(([k,v])=>!v.bonus),([k,v])=>cardOwned(p,'stage',k)?0:v.price).map(([k,v])=>{const own=cardOwned(p,'stage',k);
    return `<button class="tile ${k===CARD.stage?'on':''} ${own?'':'locked'}${poorCls(p,own,v.price)}" data-stage="${k}"><div class="tv"><svg viewBox="0 0 268 250">${v.d()}</svg></div><div class="tn">${v.name}</div>${own?'':priceTag(p,v.price)}</button>`;}).join('');
  else if(CARD.tab==='frame') h=easySort(Object.entries(FRAMES).filter(([k,v])=>!v.bonus),([k,v])=>cardOwned(p,'frame',k)?0:v.price).map(([k,v])=>{const own=cardOwned(p,'frame',k);
    return `<button class="tile ${k===CARD.frame?'on':''} ${own?'':'locked'}${poorCls(p,own,v.price)}" data-frame="${k}"><div class="tcard">${cardSVG(Object.assign(previewCard(p),{frame:k}),true)}</div><div class="tn">${v.name}</div>${own?'':priceTag(p,v.price)}</button>`;}).join('');
  else h=CARD_TITLES.map(t=>`<button class="tile ttl ${t===CARD.title?'on':''}" data-title="${esc(t)}"><div class="tn">${esc(t)}</div></button>`).join('');
  $('#cardGrid').innerHTML=h;
}
function hopCard(){const m=$('#cardBig');m.classList.remove('hop');void m.offsetWidth;m.classList.add('hop');}
$('#cardTabs').onclick=e=>{const b=e.target.closest('[data-ct]');if(!b)return;CARD.tab=b.dataset.ct;SFX.click();renderMaker();$('#cardGrid').scrollTop=0;};
$('#cardGrid').onclick=e=>{
  const t=e.target.closest('.tile'); if(!t) return; const p=P();
  const keep=()=>{const st=$('#cardGrid').scrollTop;renderMaker();$('#cardGrid').scrollTop=st;hopCard();};
  if(t.dataset.title){CARD.title=t.dataset.title;SFX.click();keep();return;}
  const kind=t.dataset.stage?'stage':'frame', k=t.dataset[kind], v=(kind==='stage'?STAGES:FRAMES)[k]; if(!v) return;
  tryBuy(kind+':'+k,v.price,v.name,()=>{CARD[kind]=k;SFX.happy();keep();});
};
$('#cardNameBtn').onclick=()=>{
  modal('Name on the card',`<input id="cnName" class="inp" maxlength="16" value="${esc(CARD.name)}" autocomplete="off">`,
    [{text:'Cancel',cls:'ghost'},{text:'Save',cls:'pink',on:()=>{const n=$('#cnName').value.trim();if(n){CARD.name=n;CARD.nameSet=true;}renderMaker();}}]);
};
$('#snapBtn').onclick=()=>{
  const p=P(); if(!p) return;
  if(p.cards.filter(c=>!c.bonus).length>=CARD_MAX){SFX.locked();toast(`Your binder is full (${CARD_MAX} cards). Delete one to make room!`);return;}
  const f=$('#flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
  SFX.snap(); vibrate(15);
  const c=newCard(p,{stage:CARD.stage,frame:CARD.frame,title:CARD.title,name:CARD.name}); p.stats.cards++; save();
  setTimeout(()=>{renderMaker();cardModal(c,true);},380);
};

function binderList(p){return p.cards.slice().reverse();} // newest first
function renderBinder(){
  const p=P(); if(!p) return;
  const list=binderList(p), pages=Math.max(1,Math.ceil(list.length/CARD_PAGE));
  CARD.page=clamp(CARD.page,0,pages-1);
  const made=p.cards.filter(c=>!c.bonus).length;
  $('#pgInfo').textContent=list.length?`Page ${CARD.page+1} of ${pages} · ${made}/${CARD_MAX} cards`:'';
  $('#pgPrev').disabled=CARD.page===0; $('#pgNext').disabled=CARD.page>=pages-1;
  const pins=new Set(p.cardPins);
  $('#binderGrid').innerHTML=list.length?list.slice(CARD.page*CARD_PAGE,(CARD.page+1)*CARD_PAGE).map(c=>
    `<button class="bcard" data-card="${esc(c.id)}"><span class="bwrap">${cardSVG(c,true)}${pins.has(c.id)?'<span class="bpin">📌</span>':''}</span></button>`).join('')
    :`<div class="empty">No cards yet! Tap 📸 Maker, dress up ${esc(p.mascotName)} in the Closet, then tap 📸 Snap!</div>`;
}
$('#pgPrev').onclick=()=>{if(CARD.page>0){CARD.page--;SFX.whoosh();renderBinder();}};
$('#pgNext').onclick=()=>{CARD.page++;SFX.whoosh();renderBinder();};
$('#binderGrid').onclick=e=>{const b=e.target.closest('[data-card]');if(!b)return;const c=P().cards.find(x=>x.id===b.dataset.card);if(c){SFX.click();cardModal(c);}};

function cardModal(c,isNew){
  const p=P(), pinned=p.cardPins.includes(c.id), no=String(c.no).padStart(3,'0');
  const btns=[{text:pinned?'Unpin':'📌 Pin to wall',cls:pinned?'ghost':'pink',on:()=>togglePin(c)},c.bonus?null:{text:'🗑️ Delete',cls:'ghost',on:()=>delCard(c)},{text:'📷 Save picture',cls:'ghost',keep:true,on:()=>snapCard(c)}]; // section 34
  btns.push(isNew?{text:'Make another',cls:'ghost'}:{text:'✖ Close',cls:'ghost'});
  modal(isNew?`📸 Card #${no} is in your binder!`:`Card #${no}`,`<div class="card-modal">${cardSVG(c)}</div>`,btns.filter(Boolean)); // bonus cards are won once: no Delete (v1.33)
}
function togglePin(c){
  const p=P(), i=p.cardPins.indexOf(c.id);
  if(i>=0){p.cardPins.splice(i,1);toast('Taken down from the wall');}
  else{
    let msg='📌 Pinned on your wall!';
    if(p.cardPins.length>=PIN_MAX){const outId=p.cardPins.shift(), out=p.cards.find(x=>x.id===outId);msg=`📌 Pinned! Card #${String(out?out.no:0).padStart(3,'0')} went back in the binder.`;}
    p.cardPins.push(c.id); toast(msg);
  }
  save(); SFX.pop(); if(cur==='cards'&&CARD.view==='binder') renderBinder();
}
function delCard(c){
  if(c.bonus){toast('Bonus cards stay in your binder for good ⭐');return;}
  modal(`Delete card #${String(c.no).padStart(3,'0')}?`,'It will be gone for good.',[{text:'Keep it',cls:'pink'},{text:'Delete',cls:'ghost',on:()=>{
    const p=P(); p.cards=p.cards.filter(x=>x.id!==c.id); p.cardPins=p.cardPins.filter(id=>id!==c.id);
    save(); SFX.whoosh(); toast('Card deleted'); if(cur==='cards'&&CARD.view==='binder') renderBinder();}}]);
}
