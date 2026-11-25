'use strict';
/* =========================================================
   31. LOOKS, EMOTES + NIGHT MODE (v1.27)
   ⭐ My Looks: 4 outfit slots in the Closet (p.looks[4], each null or a saved outfit: every look key except the
   buddy kind, face and fur, which stay as they are). Tap an empty slot to keep the outfit there, a full one to wear it;
   💾 then a slot replaces one.
   Emotes: tapping the buddy shows 4 big buttons (👋 wave, 💃 dance, 😂 laugh, 💤 nap). Each is one short CSS
   animation on #mascotG (no loop, no extra fuzz filters).
   🌙 Night mode: the round button in the room's corner. Remembered per room (p.night {'1','2','3': true}).
   The room is dimmed by one see-through layer with soft holes where the lamps are (NIGHT_GLOW), and the windows
   (or the Backyard sky) show the moon and stars. Drawn once by renderRoom, no animation. Hidden while decorating.
   ========================================================= */
const LOOK_SLOTS=4;
const LOOK_KEEP=['kind','face','fur']; // a saved look never changes these
function lookOf(look){const o={};Object.keys(look).forEach(k=>{if(!LOOK_KEEP.includes(k))o[k]=look[k];});return o;}
function wearLook(p,slot){ // only things she owns (she always does: owned things are never taken away)
  Object.keys(slot).forEach(k=>{
    if(k==='hairColor'){if(HAIR_COLORS[slot[k]]&&hcOwned(p,slot[k]))p.look.hairColor=slot[k];return;}
    if(!CLOSET[k]||LOOK_KEEP.includes(k)) return; const it=itemOf(k,slot[k]);
    if(it&&it.id===slot[k]&&isOwned(p,k,it)) p.look[k]=it.id;
  });
}
let lookSaving=false;
function renderLooks(){
  const p=P(), el=$('#looksRow'); if(!p||!el) return;
  el.classList.toggle('saving',lookSaving);
  el.innerHTML=`<span class="lk-label">⭐<span> My Looks</span></span>`+p.looks.map((L,i)=>
    `<button class="lk-slot${L?' full':''}" data-look="${i}" aria-label="Look ${i+1}">${L?mascotSVG(Object.assign({},p.look,L)):'<b>+</b>'}</button>`).join('')
    +`<button class="lk-save${lookSaving?' on':''}" id="lookSave" aria-label="Save this look">💾</button>`;
}
function keepLook(p,i){p.looks[i]=lookOf(p.look);lookSaving=false;save();SFX.save();toast('Look saved! ⭐');renderLooks();checkStickers();}
$('#looksRow').onclick=e=>{
  const p=P(); if(!p) return;
  if(e.target.closest('#lookSave')){lookSaving=!lookSaving;SFX.click();if(lookSaving)toast('Tap a ⭐ spot to keep this look');renderLooks();return;}
  const b=e.target.closest('[data-look]'); if(!b) return; const i=+b.dataset.look, L=p.looks[i];
  if(!L){keepLook(p,i);return;}
  if(lookSaving){modal('Swap this look?',`<div class="lk-ask">${mascotSVG(Object.assign({},p.look,L))}<span>➜</span>${mascotSVG(p.look)}</div>`,
    [{text:'✖ No',cls:'ghost',on:()=>{lookSaving=false;renderLooks();}},{text:'✔ Yes',cls:'pink',on:()=>keepLook(p,i)}]);return;}
  wearLook(p,L); save(); SFX.happy();
  const st=$('#closetGrid').scrollTop; renderCloset(); $('#closetGrid').scrollTop=st; hopCloset();
};

/* ---------- emotes ---------- */
const EMOTES={
  wave:{icon:'👋',name:'Wave',ms:1700,fx:'👋',line:()=>`Hi ${P().name}! 👋`,snd:()=>SFX.happy()},
  dance:{icon:'💃',name:'Dance',ms:2200,fx:'🎵',line:()=>'Dance break! 💃',snd:()=>[523,659,784,659,880].forEach((f,i)=>tone(f,0.14,'triangle',0.12,null,i*0.2))},
  laugh:{icon:'😂',name:'Laugh',ms:1500,fx:'😆',line:()=>'Hee hee hee! 😂',snd:()=>[880,830,880,830].forEach((f,i)=>tone(f,0.1,'sine',0.13,f*1.2,i*0.16))},
  nap:{icon:'💤',name:'Nap',ms:3200,fx:'💤',line:()=>'Zzz… 💤',snd:()=>{tone(420,0.9,'sine',0.1,260);tone(300,0.9,'sine',0.08,200,1.1);}}
};
function emoteBar(on){
  const b=$('#emoteBar'); clearTimeout(emoteBar.t);
  if(on&&!decorating){
    b.innerHTML=Object.entries(EMOTES).map(([k,e])=>`<button class="em-btn" data-emote="${k}" aria-label="${e.name}">${e.icon}<span>${e.name}</span></button>`).join('');
    b.classList.remove('hidden'); emoteBar.t=setTimeout(()=>emoteBar(false),6000);
  } else b.classList.add('hidden');
}
function playEmote(k){
  const e=EMOTES[k], g=$('#mascotG'); if(!e||!g) return;
  rdStop(); // any emote ends a saved dance (section 48)
  Object.keys(EMOTES).forEach(n=>g.classList.remove('em-'+n)); g.classList.remove('hop'); void g.getBoundingClientRect();
  clearTimeout(playEmote.t);
  const danced=k==='dance'?rdDance():0; // 💃 her saved dances in turn, with the Dance Maker's music (v1.80)
  if(!danced){g.classList.add('em-'+k); playEmote.t=setTimeout(()=>{const m=$('#mascotG');if(m)m.classList.remove('em-'+k);},e.ms);}
  const old=$('#emoteFx'); if(old) old.remove();
  roomSvg.insertAdjacentHTML('beforeend',`<g id="emoteFx" class="em-fx" style="pointer-events:none">${[0,1,2].map(i=>`<text x="${k==='nap'?560+i*24:440+i*60}" y="${k==='nap'?430-i*30:410}" font-size="${k==='nap'?28+i*8:34}" style="animation-delay:${i*0.25}s">${e.fx}</text>`).join('')}</g>`);
  setTimeout(()=>{const f=$('#emoteFx');if(f)f.remove();},e.ms+600);
  if(danced) say(`💃 Dance ${danced}!`); else{e.snd(); say(e.line());}
  vibrate(10); emoteBar(true);
}
$('#emoteBar').onclick=e=>{const b=e.target.closest('[data-emote]');if(b)playEmote(b.dataset.emote);};

/* ---------- night mode ---------- */
// Where a decoration glows, from its spot (x, y = bottom center): dy up, r = how far the light reaches, c = color.
const NIGHT_GLOW={
  lava:{y:-80,r:110,c:'pink'}, lights:{y:-75,r:170,c:'warm'}, neon:{y:-70,r:120,c:'pink'}, lightstick:{y:-118,r:80,c:'pink'},
  moon:{y:-88,r:120,c:'warm'}, disco:{y:-90,r:130,c:'purple'}, sunLamp:{y:-150,r:130,c:'warm'}, gaming:{y:-110,r:100,c:'mint'},
  pumpkin:{y:-60,r:100,c:'orange'}, volcano:{y:-150,r:110,c:'orange'}, trafficLight:{y:-180,r:90,c:'mint'},
  stringLights:{y:-40,r:170,c:'warm'}, goldenMic:{y:-80,r:70,c:'warm'}
};
const NIGHT_COLS={warm:'#ffd98a',pink:'#ff8cc6',mint:'#8ff0d0',purple:'#c9a7ff',orange:'#ff9a3c'};
EXTRA_DEFS.push(`<radialGradient id="ngHole"><stop offset="0" stop-color="#000" stop-opacity="1"/><stop offset=".55" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`
  +Object.entries(NIGHT_COLS).map(([k,c])=>`<radialGradient id="ngGlow-${k}"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join(''));
const isNight=(p,n)=>!!(p&&p.night[n||roomNo]);
function nightStars(pts,r){return pts.map(([x,y],k)=>`<path d="${starPath(x,y,r*(k%3?0.7:1))}" fill="#fff6c9"/>`).join('');}
function nightLayer(p,R){
  if(!isNight(p)||decorating) return '';
  const lit=[{x:500,y:500,r:170,c:''}]; // a soft light on the buddy, so she can still see them
  if(roomNo===2) lit.push({x:590,y:110,r:140,c:'warm'},{x:340,y:140,r:125,c:''}); // the Loft's pendant lamp + moonlight from its window
  if(roomNo===1) lit.push({x:195,y:152,r:150,c:''}); // moonlight from her window
  R.items.filter(i=>i.placed&&NIGHT_GLOW[i.type]).forEach(i=>{const g=NIGHT_GLOW[i.type];lit.push({x:i.x,y:i.y+g.y,r:g.r,c:g.c});});
  const hole=l=>`<circle cx="${Math.round(l.x)}" cy="${Math.round(l.y)}" r="${l.r}" fill="url(#ngHole)"/>`;
  // (Glow-in-the-dark wall stars were cut out of this layer until v1.40; indoor walls have no stars now.)
  let s=`<g class="night" style="pointer-events:none"><mask id="nightMask"><rect x="-300" y="-100" width="1600" height="900" fill="#fff"/>${lit.map(hole).join('')}</mask>`
    +`<rect x="-300" y="-100" width="1600" height="900" fill="#0d0a2a" opacity=".64" mask="url(#nightMask)"/>`
    +lit.filter(l=>l.c).map(l=>`<circle cx="${Math.round(l.x)}" cy="${Math.round(l.y)}" r="${Math.round(l.r*1.2)}" fill="url(#ngGlow-${l.c})"/>`).join('');
  if(roomNo===3) s+=`<path d="M902 52 A44 44 0 1 0 902 128 A34 34 0 1 1 902 52Z" fill="#fff3c4"/>`+dipperArt(); // the Big Dipper in the Backyard sky (v1.40)
  return s+'</g>';
}
// The Big Dipper (v1.40, the owner's idea): 7 stars in the Backyard's night sky, between the tree and the moon.
// One shape (handle end -> bowl), placed at x 400, y 30, 2.3 times bigger. No lines between them. Nothing about it is saved.
const DIPPER=[[0,20],[40,8],[72,12],[100,22],[104,50],[150,56],[152,22]]; // Alkaid Mizar Alioth Megrez Phecda Merak Dubhe
const dipperPts=()=>DIPPER.map(([x,y])=>[Math.round(400+x*2.3),Math.round(30+y*2.3)]);
const dipperArt=()=>`<g fill="#fff6c9" data-dipper="1">`+dipperPts().map(([x,y],k)=>`<path d="${starPath(x,y,k===3?6:8)}"/>`).join('')+`</g>`;
// The night window, drawn right after the furniture (renderRoom), so the window keeps its frame and bars and the room's
// things stay in front of it (it used to be drawn over everything). Since v1.40 there are no stars on the indoor walls.
function nightBack(p){
  if(!isNight(p)||decorating||roomNo===3) return '';
  let s='<g style="pointer-events:none">';
  if(roomNo===1) s+=`<rect x="94" y="74" width="202" height="157" rx="6" fill="#1d1846"/><path d="M262 92 A22 22 0 1 0 262 132 A17 17 0 1 1 262 92Z" fill="#fff3c4"/>`+nightStars([[120,100],[170,150],[210,96],[150,200],[230,180],[280,210]],6);
  else if(roomNo===2){ const wf=furnC('window2').frame; // the Studio (v1.40) has no window, so nothing is drawn there
    s+=`<circle cx="340" cy="140" r="68" fill="#1d1846"/><path d="M360 104 A20 20 0 1 0 360 140 A15 15 0 1 1 360 104Z" fill="#fff3c4"/>`+nightStars([[300,120],[320,170],[370,180],[300,150]],6)
      +`<path d="M340 72 V208 M272 140 H408" stroke="${wf}" stroke-width="7"/>`; } // the Loft window's bars go back on top of the night sky
  return s+'</g>';
}
function nightBtn(){const p=P(),b=$('#nightBtn');if(!p||!b)return;const on=isNight(p);
  b.textContent=on?'☀️':'🌙'; b.setAttribute('aria-label',on?'Lights on':'Lights off'); b.classList.toggle('on',on); b.classList.toggle('hidden',decorating);$('#roomSnapBtn').classList.toggle('hidden',decorating);$('#spyBtn').classList.toggle('hidden',decorating);soundBtn();$('#soundBtn').classList.toggle('hidden',decorating);} // 📷 + 🔊 (section 34) and 🔍 (section 50) hide with it
$('#nightBtn').onclick=()=>{
  const p=P(); if(!p) return; const on=!isNight(p);
  if(on){p.night[roomNo]=true;p.stats.nights++;tone(300,0.12,'triangle',0.12,200);}else{delete p.night[roomNo];tone(500,0.12,'triangle',0.12,760);}
  save(); renderRoom(); if(on) say(roomNo===3?'Look at the stars! ✨':'Nighty night! 🌙'); checkStickers();
};

STICKERS.push(
  stk('looks4','room','⭐','Fashionista','heart','Keep 4 looks in the Closet (⭐ My Looks)',LOOK_SLOTS,p=>p.looks.filter(Boolean).length),
  stk('night1','room','🌙','Night Owl','star','Turn the lights off in a room (🌙)',1,p=>p.stats.nights)
);
