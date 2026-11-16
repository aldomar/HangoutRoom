'use strict';
/* =========================================================
   21. STICKER BOOK (v1.18): stickers for milestones in every game
   Tap 📒 in the room's top bar. 6 pages (one per theme). Each sticker is a fixed milestone (no randomness), given once,
   never taken away, and pays STICKER_COINS. Stickers she hasn't got yet are grey, with a hint and a progress bar.
   Saved per room: stickers[] (ids she has) and stickerNew[] (ids not seen in the book yet, for the dot on 📒).
   Sticker ids are saved: never rename or remove them. Add new stickers at the end of their page.
   Bonus photocards (section 12) are separate and unchanged.
   ========================================================= */
const STICKER_COINS=2;
const STK_PAGES={
  fidget:{icon:'🫧',name:'Fidgets',color:'#ff8cc6'},
  art:{icon:'🎨',name:'Art & Cards',color:'#c9a7ff'},
  soccer:{icon:'⚽',name:'Soccer',color:'#8ff0d0'},
  stage:{icon:'🎤',name:'Stage',color:'#ffd166'},
  code:{icon:'💻',name:'Code Lab',color:'#7fc8ff'},
  room:{icon:'🏠',name:'Room & Style',color:'#ffab7a'}
};
// need = how many (a number, or a function for lists that can grow); have(p) = how far she is. tier = 1-3 little stars.
const stk=(id,page,icon,name,shape,hint,need,have,tier)=>({id,page,icon,name,shape,hint,need,have,tier:tier||0});
const stkStars=p=>SONG_IDS.map(s=>Math.max(0,...Object.values(p.stage.best[s]||{}).map(r=>r.stars||0)));
const stkLevelDone=(p,l)=>CODE_PUZZLES[l].every(z=>p.code.solved.includes(z.id));
const stkSeasonal=p=>Object.keys(SEASONS).filter(s=>allItems(p).some(i=>DECOR[i.type]&&DECOR[i.type].season===s)).length;
const STICKERS=[
  stk('pop100','fidget','🫧','Popper','circle','Pop 100 bubbles',100,p=>p.stats.pops,1),
  stk('pop1000','fidget','🫧','Pop Star','circle','Pop 1,000 bubbles',1000,p=>p.stats.pops,2),
  stk('pop5000','fidget','🫧','Pop Master','circle','Pop 5,000 bubbles',5000,p=>p.stats.pops,3),
  stk('flip10','fidget','🔄','Flipper','scallop','Flip the pop-it over 10 times',10,p=>p.stats.flips),
  stk('squish50','fidget','🍡','Squisher','cloud','Squish the squishy 50 times',50,p=>p.stats.squish),
  stk('spin300','fidget','🌀','Whirlwind','star','Spin the spinner up to 300 RPM',300,p=>p.stats.bestRpm),
  stk('stretch50','fidget','🧪','Slime Puller','cloud','Stretch the slime 50 times',50,p=>p.stats.stretches),
  stk('click500','fidget','🎛️','Click Click','scallop','Click the clicker cube 500 times',500,p=>p.stats.clicks),
  stk('maze1','fidget','🔮','Marble Roller','circle','Solve a marble maze',1,p=>p.maze.solved.length),
  stk('mazeAll','fidget','🔮','Maze Champ','star','Solve every marble maze',()=>MAZES.length,p=>p.maze.solved.length),
  stk('draw1','art','🖍️','Little Artist','circle','Save a drawing at the Art Desk',1,p=>p.stats.drawings,1),
  stk('draw10','art','🎨','Big Artist','circle','Save 10 drawings',10,p=>p.stats.drawings,2),
  stk('draw25','art','🖼️','Art Star','circle','Save 25 drawings',25,p=>p.stats.drawings,3),
  stk('poster1','art','📌','On the Wall','scallop','Hang a drawing in your room',1,p=>allItems(p).some(i=>i.type==='poster'&&i.placed)?1:0),
  stk('card1','art','📸','Snap!','heart','Make a photocard',1,p=>p.stats.cards,1),
  stk('card10','art','📸','Card Fan','heart','Make 10 photocards',10,p=>p.stats.cards,2),
  stk('card30','art','📒','Card Collector','heart','Make 30 photocards',30,p=>p.stats.cards,3),
  stk('pin3','art','📍','Pin Board','scallop','Pin 3 cards on your corkboard',3,p=>p.cardPins.length),
  stk('goal1','soccer','⚽','First Goal','circle','Score a goal',1,p=>p.stats.goals,1),
  stk('goal25','soccer','⚽','Goal Getter','circle','Score 25 goals',25,p=>p.stats.goals,2),
  stk('goal100','soccer','⚽','Goal Machine','circle','Score 100 goals',100,p=>p.stats.goals,3),
  stk('match10','soccer','🥅','Team Player','scallop','Play 10 matches',10,p=>p.stats.matches),
  stk('perfect','soccer','🌟','Perfect!','star','Score 5 out of 5 in a match',1,p=>p.stats.perfects),
  stk('trophies','soccer','🏆','Trophy Case','star','Win all 3 trophies',3,p=>p.soccer.trophies.length),
  stk('show1','stage','🎤','First Show','circle','Play a song on the Stage',1,p=>p.stats.shows,1),
  stk('show10','stage','🎤','Show Time','circle','Play 10 songs',10,p=>p.stats.shows,2),
  stk('combo','stage','🎶','No Misses','heart','Get a Full Combo (no Oops)',1,p=>p.stats.fullCombos),
  stk('stars3','stage','⭐','3 Stars','star','Get 3 stars on a song',1,p=>stkStars(p).some(n=>n>=3)?1:0),
  stk('allSongs','stage','💿','Every Song','scallop','Get a star on every song',()=>SONG_IDS.length,p=>stkStars(p).filter(n=>n>0).length),
  stk('mic','stage','🎙️','Golden Voice','star','Win the Golden Mic (3 stars on Hard)',1,p=>p.stage.mic?1:0),
  stk('code1','code','💻','Hello, Code!','circle','Solve a Code Lab puzzle',1,p=>p.code.solved.length,1),
  stk('code10','code','💻','Coder','circle','Solve 10 puzzles',10,p=>p.code.solved.length,2),
  stk('code30','code','💻','Super Coder','circle','Solve 30 puzzles',30,p=>p.code.solved.length,3),
  stk('codeLevel','code','🏅','Level Done','scallop','Solve every puzzle in one level',1,p=>Object.keys(CODE_PUZZLES).some(l=>stkLevelDone(p,l))?1:0),
  stk('myMove','code','✨','My Move','star','Solve a ✨ My Move puzzle',1,p=>CODE_PUZZLES.move.some(z=>p.code.solved.includes(z.id))?1:0),
  stk('ifHop','code','💧','Puddle Hopper','cloud','Solve a ❓ If puzzle',1,p=>CODE_PUZZLES.if.some(z=>p.code.solved.includes(z.id))?1:0),
  stk('brainy','code','🧠','Big Brain','star','Solve every 🧠 Challenge puzzle',()=>CODE_PUZZLES.challenge.length,p=>CODE_PUZZLES.challenge.filter(z=>p.code.solved.includes(z.id)).length),
  stk('closet5','room','👗','Dress-up','heart','Get 5 things for the closet',5,p=>p.owned.filter(k=>CLOSET[String(k).split(':')[0]]).length,1),
  stk('closet15','room','👑','Fashion Star','heart','Get 15 things for the closet',15,p=>p.owned.filter(k=>CLOSET[String(k).split(':')[0]]).length,2),
  stk('decor10','room','🛋️','Cozy Room','scallop','Put 10 things in your rooms',10,p=>allItems(p).filter(i=>i.placed).length),
  stk('loft5','room','🪜','Loft Life','scallop','Put 5 things in the Loft',5,p=>p.room2.items.filter(i=>i.placed).length),
  stk('seasons','room','🍂','All Year','cloud','Get a decoration from every season',4,stkSeasonal),
  stk('rich100','room','🪙','Piggy Bank','circle','Save up 100 coins',100,p=>p.coins),
  stk('daily7','room','🎁','Gift Box','circle','Open the daily gift 7 times',7,p=>p.stats.dailies),
  stk('rename','room','🐰','Best Friend','heart','Give your buddy a new name (✏️ in the Closet)',1,p=>p.mascotName!=='Fuzzy'?1:0)
];
const stkNeed=s=>typeof s.need==='function'?s.need():s.need;
const stkHave=(p,s)=>Math.max(0,Math.min(stkNeed(s),Number(s.have(p))||0));
const stkDone=(p,s)=>stkHave(p,s)>=stkNeed(s);

/* ---------- drawing a sticker (100 x 100, a die-cut shape with a white edge) ---------- */
const STK_SHAPES={
  circle:'M10 50 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0Z',
  star:starPath(50,54,47,25),
  heart:heartPath(50,50,36),
  cloud:'M26 76 Q6 76 9 58 Q7 40 26 40 Q28 18 50 20 Q72 16 76 38 Q95 38 93 58 Q95 76 74 76Z',
  scallop:Array.from({length:84},(_,i)=>{const a=i/84*TAU, r=40+3.5*Math.cos(a*14);return (i?'L':'M')+(50+Math.cos(a)*r).toFixed(1)+' '+(50+Math.sin(a)*r).toFixed(1);}).join('')+'Z'
};
function stickerSVG(s){
  const d=STK_SHAPES[s.shape]||STK_SHAPES.circle, c=STK_PAGES[s.page].color;
  const ty=s.shape==='heart'?55:s.shape==='star'?66:62, fs=s.shape==='star'?28:36;
  const tiers=[0,1,2].slice(0,s.tier).map(i=>`<path d="${starPath(50+(i-(s.tier-1)/2)*15,s.shape==='star'?87:88,6.5)}" fill="${['#e0a060','#d8dee8','#ffd166'][s.tier-1]}" stroke="#2b2235" stroke-width="1.5"/>`).join('');
  return `<svg viewBox="0 0 100 100" class="stks"><path d="${d}" fill="#00000040" stroke="#00000040" stroke-width="7" stroke-linejoin="round" transform="translate(2 3)"/>`
    +`<path d="${d}" fill="${c}" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><path d="${d}" fill="url(#stkShine)" opacity=".5"/>`
    +`<text x="50" y="${ty}" text-anchor="middle" font-size="${fs}">${s.icon}</text>${tiers}</svg>`;
}
EXTRA_DEFS.push(`<linearGradient id="stkShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>`);

/* ---------- giving stickers ---------- */
// Runs when a screen opens and every couple of seconds while she plays (cheap: a few dozen little checks).
// Several at once in the room (e.g. the first time after the update) get one happy box; otherwise just a message.
let stkPaused=!!window.STK_TEST_PAUSE; // the smoke test pauses stickers while it checks other games' exact coins
function checkStickers(){
  const p=P(); if(!p||cur==='profiles'||stkPaused) return [];
  const got=STICKERS.filter(s=>!p.stickers.includes(s.id)&&stkDone(p,s)); if(!got.length) return [];
  got.forEach(s=>{p.stickers.push(s.id);p.stickerNew.push(s.id);});
  const coins=STICKER_COINS*got.length; p.coins+=coins; save(); updateCoins(); stkDot(); SFX.coin();
  const names=got.map(s=>s.name).join(', ').replace(/!+$/,'');
  if(got.length>=3&&cur==='room'&&!decorating&&$('#modal').classList.contains('hidden')){
    modal(`🌟 ${got.length} new stickers!`,`<div class="stk-few">${got.slice(0,8).map(stickerSVG).join('')}</div>`
      +`<div style="text-align:center">You already did all this! +${coins} 🪙<br>They are in your 📒 Sticker Book.</div>`,
      [{text:'📒 Open book',cls:'ghost',on:()=>openStickers(got[0].page)},{text:'Yay! ✨',cls:'pink'}]);
  } else toast(`🌟 New sticker${got.length>1?'s':''}: ${names}! +${coins} 🪙`);
  return got;
}
setInterval(()=>{if(!document.hidden)checkStickers();},2000);
function stkDot(){const p=P(), d=$('#stkDot'); if(d) d.classList.toggle('hidden',!(p&&p.stickerNew.length));}

/* ---------- the book ---------- */
let stkPage='fidget';
function openStickers(page){if(STK_PAGES[page])stkPage=page;SFX.click();show('stickers');}
function renderStickers(){
  const p=P(); if(!p) return;
  if(!STK_PAGES[stkPage]) stkPage='fidget';
  $('#stkCount').textContent=`${p.stickers.length} / ${STICKERS.length}`;
  $('#stkTabs').innerHTML=Object.entries(STK_PAGES).map(([k,g])=>{const n=STICKERS.filter(s=>s.page===k), has=n.filter(s=>p.stickers.includes(s.id)).length;
    return `<button class="tab${k===stkPage?' on':''}" data-page="${k}">${g.icon}<span> ${g.name}</span><small> ${has}/${n.length}</small>${n.some(s=>p.stickerNew.includes(s.id))&&k!==stkPage?'<i class="stk-dot"></i>':''}</button>`;}).join('');
  const G=STK_PAGES[stkPage];
  $('#stkPage').innerHTML=`<div class="stk-title">${G.icon} ${G.name}</div><div class="stk-grid">`+STICKERS.filter(s=>s.page===stkPage).map(s=>{
    const got=p.stickers.includes(s.id), fresh=p.stickerNew.includes(s.id), need=stkNeed(s), pct=Math.round(stkHave(p,s)/need*100);
    return `<button class="stk${got?'':' locked'}${fresh?' new':''}" data-stk="${s.id}">${stickerSVG(s)}<div class="sn">${got?esc(s.name):esc(s.hint)}</div>`
      +(got?'':`<div class="sbar"><i style="width:${pct}%"></i></div>`)+`</button>`;}).join('')+'</div>';
  // the stickers on this page have been seen now (they keep their sparkle until she leaves the page)
  const before=p.stickerNew.length; p.stickerNew=p.stickerNew.filter(id=>{const s=STICKERS.find(x=>x.id===id);return s&&s.page!==stkPage;});
  if(p.stickerNew.length!==before) save();
  stkDot();
}
$('#stkTabs').onclick=e=>{const b=e.target.closest('[data-page]'); if(!b) return; stkPage=b.dataset.page; SFX.click(); renderStickers(); $('#stkPage').scrollTop=0;};
$('#stkPage').onclick=e=>{const b=e.target.closest('[data-stk]'); if(!b) return; const p=P(), s=STICKERS.find(x=>x.id===b.dataset.stk); if(!s) return;
  const got=p.stickers.includes(s.id), need=stkNeed(s), have=stkHave(p,s); SFX.click();
  modal(esc(got?s.name:'Not yet…'),`<div class="stk-big${got?'':' locked'}">${stickerSVG(s)}</div><div style="text-align:center;font-size:17px">`
    +(got?`✔ You did it!<br><b>${esc(s.hint)}</b>`:`<b>${esc(s.hint)}</b><div class="sbar big"><i style="width:${Math.round(have/need*100)}%"></i></div>${have.toLocaleString()} / ${need.toLocaleString()}`)+`</div>`,
    [{text:'OK',cls:'pink'}]);
};
$('#stkBtn').onclick=()=>openStickers();
