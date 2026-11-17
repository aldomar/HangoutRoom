'use strict';
/* =========================================================
   25. ABOUT & GIFT STORY (v1.22)
   ⚙️ Settings → 💌 About: a gold "Edition 1 of 1" certificate, a letter, and the story of every update.
   The personal words (nicknames, letter, secret) live in web/about-local.js, which is git-ignored so they
   never go to GitHub. That file sets window.ABOUT_LOCAL; anything it leaves out (or the whole file, if it
   isn't there) uses ABOUT_DEFAULT below. web/about-local.example.js shows how to write it.
   Also the ✨ What's New box, shown once per device after an update (DB.settings.seenNew).
   ========================================================= */
const ABOUT_DEFAULT={
  names:[],                       // nicknames, e.g. ['Sunny','Pip']; none = "made just for you"
  from:'With love, your family',  // the signature
  greeting:'Hi there,',           // used when there are no names
  letter:[
    'This Hangout Room was planned and built just for you, one update at a time, around the things you love.',
    "It isn't in any app store, and there's no other copy like it anywhere. There's only one Hangout Room, and it's yours.",
    'Keep playing, keep making things, and if you have an idea for something new, ask! Your ideas are how this place grows.'
  ],
  started:'2026-11-14'
};

// One entry per version, oldest first. Every PR adds its own entry at the end (the smoke test checks the last one
// is APP_VERSION). `why` is the generic line (the local file can replace it); `news` is the ✨ What's New list.
const GIFT_TIMELINE=[
  {v:'1.0', d:'2026-11-14',i:'🐰',n:'The first room',why:'A cozy room, a fuzzy friend and a fidget shelf to start'},
  {v:'1.1', d:'2026-11-14',i:'🧹',n:'Tidy-up',why:'A little spring clean behind the scenes'},
  {v:'1.2', d:'2026-11-15',i:'🔢',n:'Version numbers',why:'So every update you get can be counted'},
  {v:'1.3', d:'2026-11-15',i:'🎨',n:'Art Desk',why:'Because you love to draw'},
  {v:'1.4', d:'2026-11-15',i:'📸',n:'Photocard Wall',why:'For collecting cards, like real fans do'},
  {v:'1.5', d:'2026-11-15',i:'⚽',n:'Soccer Field',why:'For the soccer stars'},
  {v:'1.6', d:'2026-11-15',i:'🍡',n:'Squishier squishies',why:'Because the squishy needed more squish'},
  {v:'1.7', d:'2026-11-15',i:'🎤',n:'The Stage',why:'For singing and dancing along'},
  {v:'1.8', d:'2026-11-15',i:'🐣',n:'Easy mode',why:'So the littlest ones can play too'},
  {v:'1.9', d:'2026-11-15',i:'🧩',n:'Room to grow',why:'A big tidy-up so the app could keep growing'},
  {v:'1.10',d:'2026-11-15',i:'🪜',n:'Cozy Loft',why:"A second room, because one wasn't enough"},
  {v:'1.11',d:'2026-11-15',i:'💇',n:'Shelves + hair styles',why:'More ways to make it yours'},
  {v:'1.12',d:'2026-11-15',i:'🎶',n:'The Stage moves upstairs',why:'More space in your room'},
  {v:'1.13',d:'2026-11-15',i:'💻',n:'Code Lab',why:'To learn how games are made'},
  {v:'1.14',d:'2026-11-15',i:'✨',n:'My Move + If',why:'New coding tricks'},
  {v:'1.15',d:'2026-11-15',i:'🧠',n:'Code Challenge',why:'For the puzzle masters'},
  {v:'1.16',d:'2026-11-16',i:'🧪',n:'Slime, clicker + marble maze',why:'You can never have too many fidgets'},
  {v:'1.17',d:'2026-11-16',i:'🍂',n:'Seasons',why:'So your room changes with the year'},
  {v:'1.18',d:'2026-11-16',i:'📒',n:'Sticker Book',why:'To celebrate everything you do'},
  {v:'1.19',d:'2026-11-16',i:'🐾',n:'Pets',why:'A little friend for your buddy'},
  {v:'1.20',d:'2026-11-16',i:'🦕',n:'Buddies',why:'So the whole family can join in'},
  {v:'1.21',d:'2026-11-16',i:'🚀',n:'Dinos, space + trucks',why:'For the dino and rocket fans'},
  {v:'1.22',d:'2026-11-16',i:'💌',n:'About & Gift Story',why:'So everyone knows this was made just for you',
    news:['💌 An About page in ⚙️ Settings: a letter, a gold certificate and the story of every update',
          '✨ This box! It shows what is new after each update']},
  {v:'1.23',d:'2026-11-16',i:'🌳',n:'The Backyard',why:'A third room, with room to grow',
    news:['🌳 A Backyard! Tap 🌳 Yard at the top of your room',
          '⚽ Tap the soccer goal to play Soccer',
          '🏕️ Fences, grass and 8 outdoor things in 🛋️ Decorate: a trampoline, a tent, a slide and more']},
  {v:'1.24',d:'2026-11-16',i:'🧤',n:'Be the Keeper',why:'Now you can be the goalie too',
    news:['🧤 Soccer has a new Keep mode: your buddy goes in goal!',
          '🐸 Hop, 🤖 Bolt and 🦊 Zip take the shots. Tap where the ball goes (on Easy, just tap the ball)',
          '🥇 Save all 5 to win a keeper glove for your Backyard']},
  {v:'1.25',d:'2026-11-16',i:'📚',n:'Brain Games',why:'Puzzles to grow clever together',
    news:['📚 Tap the chalkboard in the Backyard for Brain Games',
          '🧁 Snack Stand: count, add up and give change',
          '🃏 Memory Match with your own buddies, and 🫧 Number Pop',
          '🐣 Easy, 🌟 Medium and 🧠 Hard: every puzzle pays 🪙 the first time']},
  {v:'1.26',d:'2026-11-16',i:'🎶',n:'Song Pack',why:'More songs to sing and tap along to',
    news:['🎤 5 new songs on the Stage: 8 in all',
          '💖 Neon Hearts, 👏 Stadium Clap and 🚀 Rocket Launch',
          '🦖 Dino Stomp (slow and big) and 🌙 Moon Lullaby (calm)',
          '📒 4 new Stage stickers, like 🎶 Whole Setlist']},
  {v:'1.27',d:'2026-11-16',i:'⭐',n:'Looks & Night Mode',why:'Your favourite outfits in one tap, and a cozy room at night',
    news:['⭐ My Looks in the Closet: keep 4 outfits, wear one with a tap',
          '👋 Tap your buddy to wave, dance, laugh or nap',
          '🌙 Turn the lights off: lamps glow and stars come out']},
  {v:'1.28',d:'2026-11-16',i:'🎁',n:'Gifts & Layouts',why:'So you can surprise each other, and keep your favourite room',
    news:['🎁 Give coins or a decoration to a brother or sister',
          '📦 A gift for you? Tap the wrapped box in your room!',
          '🏠 Save your room layout in 🛋️ Decorate and put it back any time']},
  {v:'1.29',d:'2026-11-16',i:'⭐',n:'Shop Filters & Big Dreams',why:'To find your favourite things fast, and something big to save up for',
    news:['🔎 Theme buttons in the Closet and the Shop: 🦇 ☁️ ⚽ 🎤 🦕 🚀 …',
          '⭐ 5 big dreams to save up for: Canopy Bed, Arcade, Castle Bunk Bed, Rocket Playhouse, Aquarium',
          '🌈 A new sticker: Dream Come True']},
  {v:'1.30',d:'2026-11-16',i:'📷',n:'Read to Me & Snapshots',why:'So the little ones can hear the buttons, and you can keep pictures of your rooms',
    news:['📷 Take a picture of your room (the button under 🌙) or a photocard',
          '🔊 Read to me: buttons say their names (⚙️ Settings, on in Easy mode)',
          '💾 Grown-ups: Settings now shows when the last backup was']},
  {v:'1.31',d:'2026-11-17',i:'🛋️',n:'Room Tweaks',why:'So decorating does what you expect, and your name fits on a phone',
    news:['🛋️ Decorating: the thing you touch last comes to the front',
          '📱 On a phone, your room name has its own row again']},
  {v:'1.32',d:'2026-11-17',i:'⚡',n:'Speed Check',why:'So everything stays quick and the tablet stays cool',
    news:['⚡ Rooms rest when nothing is happening, so the tablet stays cool',
          '👗 Trying on clothes is quicker',
          '🌙 At night, the windows stay behind your things']},
  {v:'1.33',d:'2026-11-17',i:'🚂',n:'Pattern Train & Word Builder',why:'So there are patterns to spot and words to build, for every age',
    news:['🚂 Pattern Train: which wagon comes next? (📚 Brain Games, at the Backyard chalkboard)',
          '🔤 Word Builder: first letters, little words and big words to spell',
          '⭐ Bonus photocards stay in your binder for good']},
  {v:'1.34',d:'2026-11-17',i:'🍕',n:'Fraction Bakery & Fact Cards',why:'So there are treats to share fairly and amazing facts to collect',
    news:['🍕 Fraction Bakery: cut treats fairly and put toppings on part of a pizza',
          '🪐 Fact Cards: answer questions about dinosaurs, space and the ocean',
          '📇 Every right answer unlocks a fact card for your binder']}
];

const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function aboutDate(iso){const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(iso||'');return m?`${+m[3]} ${MONTHS[+m[2]-1]} ${m[1]}`:'';}
function verNum(v){const m=/^(\d+)\.(\d+)$/.exec(v||'');return m?(+m[1])*1000+(+m[2]):0;}
function joinNames(a,and){return a.length<2?(a[0]||''):a.slice(0,-1).join(', ')+' '+and+' '+a[a.length-1];}

// The local file's words, checked one by one; anything missing or odd falls back to ABOUT_DEFAULT.
function aboutData(){
  const L=(window.ABOUT_LOCAL&&typeof window.ABOUT_LOCAL==='object')?window.ABOUT_LOCAL:{}, D=ABOUT_DEFAULT;
  const strs=v=>Array.isArray(v)?v.filter(s=>typeof s==='string'&&s.trim()).map(s=>s.trim()):[];
  const names=strs(L.names), letter=strs(typeof L.letter==='string'?L.letter.split(/\n\s*\n/):L.letter);
  return {names:names.length?names:D.names, letter:letter.length?letter:D.letter,
    from:typeof L.from==='string'&&L.from.trim()?L.from.trim():D.from,
    secret:typeof L.secret==='string'?L.secret.trim():'',
    why:L.why&&typeof L.why==='object'?L.why:{}};
}

function aboutCertSVG(A){
  const p=P(), names=A.names.length?joinNames(A.names,'&'):'you', fs=Math.min(32,Math.floor(620/Math.max(names.length,8)));
  const stars=[[60,40,9],[548,44,11],[566,300,8],[40,318,10],[300,26,7],[230,330,6]].map(([x,y,r])=>`<path d="${starPath(x,y,r)}" fill="#ffd166"/>`).join('');
  return `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Certificate">
    <defs><linearGradient id="abGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".45" stop-color="#ffd166"/><stop offset="1" stop-color="#d99a28"/></linearGradient></defs>
    <rect x="4" y="4" width="592" height="352" rx="26" fill="url(#abGold)"/>
    <rect x="18" y="18" width="564" height="324" rx="18" fill="#2b2140"/>
    <rect x="26" y="26" width="548" height="308" rx="14" fill="none" stroke="#ffd16688" stroke-width="2" stroke-dasharray="6 6"/>
    ${stars}
    <g id="abBuddy" style="cursor:pointer"><ellipse cx="125" cy="300" rx="62" ry="10" fill="#00000050"/>${mascotSVG(p?p.look:starterLook('emo'),null,'x="40" y="70" width="170" height="230"')}</g>
    <g text-anchor="middle" font-weight="900">
      <text x="395" y="84" font-size="30" fill="#ffd166">HANGOUT ROOM</text>
      <text x="395" y="116" font-size="17" fill="#ffe7a3">✦ Edition 1 of 1 ✦</text>
      <text x="395" y="160" font-size="17" fill="#fff">made just for</text>
      <text x="395" y="${160+fs+12}" font-size="${fs}" fill="#ff8cc6">${esc(names)}</text>
      <text x="395" y="252" font-size="16" fill="#fff" font-weight="700">${esc(A.from)}</text>
      <text x="395" y="290" font-size="14" fill="#cbbbe6" font-weight="700">Started ${aboutDate(ABOUT_DEFAULT.started)}</text>
      <text x="395" y="314" font-size="14" fill="#cbbbe6" font-weight="700">No. 001 · version ${APP_VERSION}</text>
    </g></svg>`;
}

function renderAbout(){
  const A=aboutData();
  const hi=A.names.length?`Dear ${esc(joinNames(A.names,'and'))},`:esc(ABOUT_DEFAULT.greeting);
  const rows=GIFT_TIMELINE.map(t=>{const w=typeof A.why[t.v]==='string'&&A.why[t.v].trim()?A.why[t.v].trim():t.why;
    return `<div class="ab-row${t.v===APP_VERSION?' now':''}" data-v="${t.v}"><div class="ic">${t.i}</div><div><div class="nm">${esc(t.n)}</div>`
      +`<div class="wy">${esc(w)}</div><div class="vd">v${t.v} · ${aboutDate(t.d)}</div></div></div>`;}).join('');
  $('#abPage').innerHTML=`<div class="ab-cert" id="abCert">${aboutCertSVG(A)}<div class="ab-bub hidden" id="abSecret"></div></div>`
    +`<div class="ab-letter"><p class="hi">${hi}</p>${A.letter.map(s=>`<p>${esc(s)}</p>`).join('')}<p class="sig">${esc(A.from)} 💜</p></div>`
    +`<div class="ab-h">🎁 The story so far</div><div class="ab-tl">${rows}</div>`
    +`<div class="ab-foot">…and more to come!<br>No ads, no internet, no strangers. Just for you. 🐰</div>`;
  const B=$('#abBuddy'); let taps=0, tt=0;
  B.addEventListener('pointerdown',()=>{ // the family secret: tap the buddy 5 times (only when the local file has one)
    taps=performance.now()-tt<1500?taps+1:1; tt=performance.now(); SFX.click();
    if(taps>=5&&A.secret){taps=0;SFX.pop();const s=$('#abSecret');s.textContent=A.secret;s.classList.remove('hidden');clearTimeout(renderAbout.t);renderAbout.t=setTimeout(()=>s.classList.add('hidden'),6000);}
  });
  $('#abPage').scrollTop=0;
}

// ✨ What's New: once per device after an update. A brand-new device (no rooms yet) just notes the version.
function whatsNew(){
  const s=DB.settings, seen=s.seenNew||'';
  if(seen===APP_VERSION)return;
  const list=GIFT_TIMELINE.filter(t=>t.news&&(seen?verNum(t.v)>verNum(seen):t.v===APP_VERSION)&&verNum(t.v)<=verNum(APP_VERSION)).slice(-3);
  s.seenNew=APP_VERSION; save();
  if(!DB.profiles.length||!list.length)return; // decided straight away at startup; only the box waits a moment
  setTimeout(()=>modal('✨ What\'s New!',list.map(t=>`<div class="wn"><div class="wn-t">${t.i} ${esc(t.n)} <span>v${t.v}</span></div><ul>${t.news.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></div>`).join(''),
    [{text:'Yay! ✨',cls:'pink'}]),whatsNew.wait);
}
whatsNew.wait=600;
