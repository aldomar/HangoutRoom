'use strict';
/* =========================================================
   33. SHOP FILTERS + BIG DREAMS (v1.29)
   🔎 Theme chips above the Closet grid and the Decorate Shop grid. An item's themes come from its own fields
   (p2:<theme>, since v1.35 p3:<theme>, since v1.36 p4:<theme>, yard:1 → 'yard', dream:1 → 'dream') plus THEME_IDS below for older items (no ids change).
   A chip only shows when the list on screen has something with that theme. The chosen chip is remembered while the
   app is open (not saved). Easy mode shows icons only.
   💰 Big dreams: 5 decorations at 60–100 coins (dream:1, the only things above 40). Tapping one she can't afford yet
   offers "⭐ Save up for it?"; p.dream (a DECOR key, or '') is the goal, shown as a bar at the top of the Shop.
   Buying it clears the goal. Nothing runs out or goes away.
   ========================================================= */
const THEMES={
  all:{icon:'✨',name:'All'}, emo:{icon:'🦇',name:'Emo'}, cute:{icon:'☁️',name:'Cute'}, sport:{icon:'⚽',name:'Sport'},
  stage:{icon:'🎤',name:'Stage'}, dino:{icon:'🦕',name:'Dino'}, space:{icon:'🚀',name:'Space'}, ride:{icon:'🚗',name:'Ride'},
  hero:{icon:'🤖',name:'Hero'}, yard:{icon:'🌳',name:'Outdoor'}, dream:{icon:'⭐',name:'Dreams'}
};
// Older items' themes, by 'category:id' (closet) or 'decor:<key>'. Pack 2 items already have p2.
const THEME_IDS={
  emo:'hair:swoopBlack hair:spikes top:tee top:zip top:batSweater bottom:plaid bottom:plaidP legs:stripeBP legs:stripeBW legs:blackFuzz arms:stripeBW arms:stripeBP arms:blackFuzz shoes:boots acc:choker acc:batclip decor:bat decor:ghost decor:batGarland decor:checkerRug decor:moon',
  cute:'hair:tuft hair:bob hair:pigtails hair:waves hair:twinTails top:hoodie top:cardi top:stripeTee bottom:tutu legs:pinkFuzz legs:whiteFuzz legs:rainbow legs:mintFuzz arms:pinkFuzz arms:lavFuzz arms:rainbow shoes:sneakers shoes:maryjanes shoes:slippers acc:stars acc:bow acc:flowers acc:heartShades decor:starRug decor:heartRug decor:beanbag decor:bed decor:plant decor:lava decor:blob decor:bookNook decor:cushions decor:eggChair decor:cloudShelf decor:starMirror decor:canopyBed decor:aquarium',
  sport:'top:jersey bottom:shorts legs:soccer shoes:cleats shoes:hightops acc:capBack decor:goal decor:ball',
  stage:'hair:twinTails top:stage bottom:tutu bottom:galaxySkirt shoes:boots acc:headphones acc:tiara decor:lights decor:neon decor:lightstick decor:speaker decor:disco decor:arcade',
  space:'bottom:galaxySkirt decor:rocketHouse',
  hero:'decor:gaming decor:castleBunk'
};
const THEME_OF={}; Object.entries(THEME_IDS).forEach(([t,s])=>s.split(' ').forEach(k=>{(THEME_OF[k]=THEME_OF[k]||[]).push(t);}));
function themesOf(key,it){const t=(THEME_OF[key]||[]).slice();if(it.p2)t.push(it.p2);if(it.p3)t.push(it.p3);if(it.p4)t.push(it.p4);if(it.p5)t.push(it.p5);if(it.yard)t.push('yard');if(it.dream)t.push('dream');return t;}
const themePick={closet:'all',shop:'all'};
// list = [[key, item]...]; returns the list for the chosen chip, and the chips' html (where = 'closet' | 'shop')
function themeFilter(where,list){
  const have=new Set(); list.forEach(([k,it])=>themesOf(k,it).forEach(t=>have.add(t)));
  if(!have.has(themePick[where])) themePick[where]='all';
  const pick=themePick[where], out=pick==='all'?list:list.filter(([k,it])=>themesOf(k,it).includes(pick));
  const chips=have.size?`<div class="chips" data-chips="${where}">${Object.entries(THEMES).filter(([t])=>t==='all'||have.has(t)).map(([t,v])=>`<button class="chip${t===pick?' on':''}" data-theme="${t}" aria-label="${v.name}">${v.icon}<span> ${v.name}</span></button>`).join('')}</div>`:'';
  return {list:out,chips};
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-theme]'), box=b&&b.closest('[data-chips]'); if(!box) return;
  themePick[box.dataset.chips]=b.dataset.theme; SFX.click();
  if(box.dataset.chips==='closet'){renderCloset();$('#closetGrid').scrollTop=0;} else {renderDecoGrid();$('#decoGrid').scrollTop=0;}
});

/* ---------- big dreams ---------- */
const spO5='stroke="#2b2235" stroke-width="5" stroke-linejoin="round"', spO4='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"', spO3='stroke="#2b2235" stroke-width="3" stroke-linejoin="round"';
Object.assign(DECOR,{
  canopyBed:{name:'Canopy Bed',price:100,dream:1,box:'-200 -340 400 350',d:()=>{
    let s=`<ellipse cx="0" cy="-4" rx="190" ry="12" fill="#00000030"/>`;
    s+=[-180,166].map(x=>`<rect x="${x}" y="-300" width="14" height="300" rx="6" fill="#fff4fb" ${spO4}/>`).join('');
    s+=`<rect x="-170" y="-70" width="340" height="70" rx="12" fill="#c9a7ff" ${spO5}/><rect x="-160" y="-108" width="320" height="48" rx="20" fill="#fff" ${spO4}/>`
      +`<path d="M-50 -112 H140 Q160 -112 160 -90 V-58 H-50Z" fill="#ff9fd0" ${spO4}/>`+[[10,-86],[70,-80],[125,-92]].map(([x,y])=>`<path d="${starPath(x,y,8)}" fill="#fff"/>`).join('')
      +`<rect x="-150" y="-134" width="80" height="36" rx="15" fill="#ffe9f6" ${spO4}/>`;
    s+=`<path d="M-176 -300 Q-188 -190 -160 -90 L-140 -96 Q-150 -200 -140 -290Z" fill="#ffd1ea" opacity=".85" ${spO3}/><path d="M176 -300 Q188 -190 160 -90 L140 -96 Q150 -200 140 -290Z" fill="#ffd1ea" opacity=".85" ${spO3}/>`;
    s+=`<rect x="-190" y="-326" width="380" height="32" rx="10" fill="#a97cff" ${spO5}/><path d="M-186 -294 ${[...Array(10)].map((_,i)=>`Q${-167+i*38} -266 ${-148+i*38} -294`).join(' ')}" fill="#ff8cc6" ${spO3}/>`
      +[-130,-60,10,80,150].map(x=>`<path d="${starPath(x,-310,7)}" fill="#ffd166"/>`).join('');
    return s;}},
  arcade:{name:'Arcade Cabinet',price:80,dream:1,box:'-90 -320 180 330',d:()=>`<ellipse cx="0" cy="-4" rx="80" ry="10" fill="#00000030"/>`
    +`<path d="M-70 0 V-200 L-60 -300 H60 L70 -200 V0Z" fill="#6a45c0" ${spO5}/><rect x="-62" y="-300" width="124" height="36" rx="6" fill="#ff8cc6" ${spO4}/>`
    +`<text x="0" y="-275" text-anchor="middle" font-size="20" font-weight="900" fill="#fff">★ PLAY ★</text>`
    +`<rect x="-54" y="-254" width="108" height="86" rx="6" fill="#1d1846" ${spO4}/>`
    +[[-36,-236],[-12,-236],[12,-236],[36,-236],[-24,-220],[24,-220]].map(([x,y],k)=>`<rect x="${x-6}" y="${y-6}" width="12" height="10" rx="2" fill="${['#8ff0d0','#ffd166','#ff8cc6','#7fc8ff'][k%4]}"/>`).join('')
    +`<path d="${heartPath(0,-190,11)}" fill="#ff8cc6"/><rect x="-40" y="-184" width="80" height="4" fill="#8ff0d0"/>`
    +`<path d="M-70 -160 L-82 -130 H82 L70 -160Z" fill="#c9a7ff" ${spO4}/><rect x="-46" y="-162" width="6" height="20" fill="#2b2235"/><circle cx="-43" cy="-164" r="9" fill="#ff5a5f" ${spO3}/>`
    +[[10,'#ffd166'],[32,'#8ff0d0'],[54,'#7fc8ff']].map(([x,c])=>`<circle cx="${x}" cy="-146" r="8" fill="${c}" ${spO3}/>`).join('')
    +`<rect x="-30" y="-100" width="60" height="40" rx="6" fill="#4b3a66" ${spO3}/><rect x="-6" y="-88" width="12" height="16" rx="3" fill="#ffd166"/>`},
  castleBunk:{name:'Castle Bunk Bed',price:90,dream:1,box:'-200 -380 400 390',d:()=>{
    const tower=x=>`<rect x="${x-26}" y="-300" width="52" height="300" fill="#b9c3d9" ${spO5}/>${[-260,-180,-100].map(y=>`<rect x="${x-8}" y="${y}" width="16" height="22" rx="8" fill="#4b3a66"/>`).join('')}<path d="M${x-34} -298 L${x} -360 L${x+34} -298Z" fill="#a97cff" ${spO5}/><path d="M${x} -360 V-384" stroke="#2b2235" stroke-width="4"/><path d="M${x} -384 L${x+24} -376 L${x} -368Z" fill="#ff8cc6" ${spO3}/>`;
    const bunk=y=>`<rect x="-140" y="${y-34}" width="280" height="34" rx="8" fill="#8a6fd1" ${spO4}/><rect x="-132" y="${y-58}" width="264" height="28" rx="12" fill="#fff" ${spO4}/><path d="M-30 ${y-60} H124 Q132 ${y-60} 132 ${y-50} V${y-32} H-30Z" fill="#7fc8ff" ${spO4}/><rect x="-124" y="${y-74}" width="64" height="26" rx="12" fill="#e9ddff" ${spO4}/>`;
    return `<ellipse cx="0" cy="-4" rx="190" ry="12" fill="#00000030"/>`+bunk(-10)+bunk(-170)
      +`<path d="M-140 -220 V-246 ${[...Array(7)].map((_,i)=>`H${-140+i*40+20} V-232 H${-140+i*40+40} V-246`).join(' ')} V-220Z" fill="#b9c3d9" ${spO4}/>`
      +`<g ${spO3}><path d="M86 -170 V0 M126 -170 V0" fill="none"/>${[-140,-105,-70,-35].map(y=>`<rect x="86" y="${y}" width="40" height="7" rx="3" fill="#ffd166"/>`).join('')}</g>`
      +tower(-160)+tower(160);}},
  rocketHouse:{name:'Rocket Playhouse',price:80,dream:1,box:'-130 -380 260 390',d:()=>`<ellipse cx="0" cy="-4" rx="120" ry="12" fill="#00000030"/>`
    +`<path d="M-62 -60 L-118 0 H-56Z M62 -60 L118 0 H56Z" fill="#ff5a5f" ${spO5}/>`
    +`<path d="M-66 0 V-250 Q-66 -340 0 -372 Q66 -340 66 -250 V0Z" fill="#f4f6ff" ${spO5}/><path d="M-50 -300 Q-20 -350 0 -360 Q20 -350 50 -300Z" fill="#ff5a5f" ${spO4}/>`
    +`<circle cx="0" cy="-230" r="34" fill="#7fc8ff" stroke="#8a97b8" stroke-width="10"/><circle cx="0" cy="-230" r="34" fill="none" ${spO4}/><path d="M-14 -246 Q-4 -254 8 -250" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`
    +`<path d="M-36 0 V-110 Q-36 -142 0 -142 Q36 -142 36 -110 V0Z" fill="#a97cff" ${spO4}/><circle cx="22" cy="-60" r="5" fill="#ffd166"/>`
    +`<path d="M-66 -160 H66" stroke="#ff5a5f" stroke-width="10"/><path d="${starPath(-38,-190,9)}" fill="#ffd166"/><path d="${starPath(40,-120,7)}" fill="#ffd166"/>`},
  aquarium:{name:'Aquarium',price:60,dream:1,box:'-130 -250 260 260',d:()=>{
    const fish=(x,y,c,f)=>`<g transform="translate(${x} ${y}) scale(${f} 1)"><path d="M-16 0 Q0 -14 16 0 Q0 14 -16 0Z M14 0 L26 -9 V9Z" fill="${c}" ${spO3}/><circle cx="-8" cy="-2" r="2.5" fill="#2b2235"/></g>`;
    return `<ellipse cx="0" cy="-4" rx="120" ry="10" fill="#00000030"/><rect x="-110" y="-90" width="220" height="90" rx="8" fill="#8a6fd1" ${spO5}/><rect x="-96" y="-76" width="88" height="62" rx="6" fill="#a98be6" ${spO3}/><rect x="8" y="-76" width="88" height="62" rx="6" fill="#a98be6" ${spO3}/>`
      +`<rect x="-118" y="-240" width="236" height="152" rx="10" fill="#bfe9ff" ${spO5}/><rect x="-110" y="-214" width="220" height="118" fill="#5fc6f2" opacity=".75"/><path d="M-110 -110 Q-60 -124 0 -112 Q60 -100 110 -114 V-96 H-110Z" fill="#ffe1a8"/>`
      +`<path d="M-80 -100 Q-92 -140 -76 -170 M-70 -100 Q-60 -136 -72 -160 M84 -100 Q96 -132 82 -160" stroke="#49c27a" stroke-width="7" fill="none" stroke-linecap="round"/>`
      +`<path d="M20 -98 Q30 -126 44 -98Z" fill="#ff9fd0" ${spO3}/>`+fish(-20,-170,'#ffd166',1)+fish(46,-146,'#ff8cc6',-1)+fish(-50,-128,'#8ff0d0',1)
      +[[10,-196,5],[20,-180,3.5],[60,-200,4]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".8"/>`).join('')
      +`<rect x="-122" y="-246" width="244" height="14" rx="6" fill="#6a45c0" ${spO4}/>`;}}
});
Object.assign(NIGHT_GLOW,{arcade:{y:-210,r:120,c:'mint'},aquarium:{y:-160,r:130,c:'mint'}});

const dreamOf=p=>p.dream&&DECOR[p.dream]&&DECOR[p.dream].dream?p.dream:'';
function dreamBar(p){
  const k=dreamOf(p); if(!k) return ''; const d=DECOR[k], pr=costOf(p,d.price), have=Math.min(p.coins,pr), pct=Math.round(have/pr*100);
  return `<div class="dream-bar"><div class="db-pic">${decoPrev(k)}</div><div class="db-mid"><b>⭐ Saving for ${esc(d.name)}</b><div class="db-track"><i style="width:${pct}%"></i></div><span>${p.coins>=pr?'You can get it now! 🎉':`🪙 ${have} / ${pr} · ${pr-p.coins} more to go`}</span></div><button class="btn small ghost" data-dream-stop aria-label="Stop saving">✖</button></div>`;
}
function dreamAsk(p,k){
  const d=DECOR[k];
  modal(`⭐ Save up for ${esc(d.name)}?`,`<div class="gv-ask"><svg viewBox="${d.box}">${d.d()}</svg></div><p style="text-align:center">It costs 🪙 ${costOf(p,d.price)}. You have 🪙 ${p.coins}.<br>Keep playing to save up: it'll wait for you!</p>`,
    [{text:'✖ Not now',cls:'ghost'},{text:'⭐ Save up!',cls:'pink',on:()=>{p.dream=k;save();SFX.happy();renderDecoGrid();}}]);
}
// Called by the Shop's buy handler (section 9): returns true when it took care of the tap.
function dreamTap(p,k){
  if(!DECOR[k].dream||p.coins>=DECOR[k].price) return false;
  if(dreamOf(p)===k){needMore(p,DECOR[k].price);return true;}
  dreamAsk(p,k); return true;
}
$('#decoGrid').addEventListener('click',e=>{if(e.target.closest('[data-dream-stop]')){const p=P();p.dream='';save();SFX.click();renderDecoGrid();}});

STICKERS.push(
  stk('dream1','room','🌈','Dream Come True','star','Get a ⭐ big dream thing (60 coins or more)',1,p=>new Set(allItems(p).filter(i=>DECOR[i.type]&&DECOR[i.type].dream).map(i=>i.type)).size)
);
