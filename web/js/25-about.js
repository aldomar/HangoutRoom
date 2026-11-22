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
  names:['The 4 of You'],                 // nicknames, e.g. ['Sunny','Pip']; none = 'made just for you' (since v1.59 the owner's words live here,
                                  // so the hosted iPad/iPhone version shows them; web/about-local.js can still replace any of them)
  from:'Aly', // the signature
  greeting:'Hi there,',           // used when there are no names
  letter:[
    'I made this little world just for you. Every room, every outfit, every squishy and every song was planned and built with you in mind: soccer and stages, art and anime, cozy emo stripes, dinosaurs, rockets, trucks and sharks.',
    "It isn't in any app store, and nobody else has one. There is only one Hangout Room in the whole world, and it belongs to the four of you.",
    'Keep playing, keep making things, and keep being exactly who you are. If you have an idea for something new, tell me! Your ideas are how this place grows.'
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
  {v:'1.27',d:'2026-11-16',i:'⭐',n:'Looks & Night Mode',why:'Your favorite outfits in one tap, and a cozy room at night',
    news:['⭐ My Looks in the Closet: keep 4 outfits, wear one with a tap',
          '👋 Tap your buddy to wave, dance, laugh or nap',
          '🌙 Turn the lights off: lamps glow and stars come out']},
  {v:'1.28',d:'2026-11-16',i:'🎁',n:'Gifts & Layouts',why:'So you can surprise each other, and keep your favorite room',
    news:['🎁 Give coins or a decoration to a brother or sister',
          '📦 A gift for you? Tap the wrapped box in your room!',
          '🏠 Save your room layout in 🛋️ Decorate and put it back any time']},
  {v:'1.29',d:'2026-11-16',i:'⭐',n:'Shop Filters & Big Dreams',why:'To find your favorite things fast, and something big to save up for',
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
          '📇 Every right answer unlocks a fact card for your binder']},
  {v:'1.35',d:'2026-11-17',i:'🎀',n:'Content Pack 3',why:'So there are stage outfits, cozy looks, a little cafe and the sea to decorate with',
    news:['🎤 Stage outfits: idol buns, a headset mic and glitter boots',
          '🧁 A cafe set, 🐚 a seashell set and 🍵 cozy things for your rooms',
          '🫧 New fidgets: a cupcake squishy, a jellyfish, milk tea slime and more']},
  {v:'1.36',d:'2026-11-17',i:'🦖',n:'Content Pack 4',why:'So there are hoops to shoot, farm friends, big trucks and a dino nugget to cuddle',
    news:['🦖 A Dino Nugget Plush (it fits on a little shelf!) and a Dino Nugget squishy',
          '🏀 Basketball, skate and karate clothes, a hoop and a skate ramp',
          '🐮 A farm set: a toy barn, cow and sheep plushies, a tractor and a hay bale',
          '🫧 Fidgets now give up to 30 coins a day (then they are just for fun)']},
  {v:'1.37',d:'2026-11-17',i:'🧩',n:'Extras',why:'So there are new puzzles to crack and new mazes to roll through',
    news:['🧠 6 new Challenge puzzles in the Code Lab',
          '🔮 6 new marble mazes, from Bumper Alley to the Long Way Home',
          '📒 3 new stickers to collect']},
  {v:'1.38',d:'2026-11-17',i:'🎹',n:'Music Maker',why:'So there is a place to make up your own beats and tunes',
    news:['🎹 A keyboard in the Cozy Loft: tap it to make your own music loop',
          '🥁 Drums, claps and 5 notes that always sound nice together',
          '💾 Keep 3 loops, and try 3 sounds and 3 speeds']},
  {v:'1.39',d:'2026-11-17',i:'🛋️',n:'Room depth',why:'So things in your rooms stand in front of and behind each other, like real furniture',
    news:['🛋️ Things lower on the floor stand in front, things higher up stand behind',
          '🎹 The closet, desks, keyboard and Backyard things join in too',
          '👻 While decorating, the room\'s own furniture goes see-through so you can grab what is behind it']},
  {v:'1.40',d:'2026-11-17',i:'✨',n:'The Studio',why:'A brand-new empty room where every single thing is your choice',
    news:['✨ A new room: the Studio! Nothing is built in, so you choose everything',
          '⬆️ Arrows on the sides of the screen take you to the next room',
          '🗺️ The Map button shows your whole house: tap a room to go there',
          '🌳 Your window now leads outside. ⚽ Soccer is at the goal in the Backyard',
          '🪵 A free Built-in Shelf in the Shop',
          '🌙 With the lights off, look for the Big Dipper in the Backyard sky']},
  {v:'1.41',d:'2026-11-18',i:'🚪',n:'Visitors',why:'Friends from the games come to visit, each with a little wish',
    news:['🚪 Knock knock! Mochi, Boo, Flap, Hop, Bolt and Zip come to visit',
          '💌 Tap a visitor to see their wish, then make it come true',
          '💡 Tap a line on the wish card for help. 🔄 picks another wish',
          '🧸 Make all 3 of a friend\'s wishes come true and they leave you a plush',
          '📒 A new 🚪 Friends page in the Sticker Book']},
  {v:'1.42',d:'2026-11-19',i:'👯',n:'Play Together',why:'So brothers and sisters can play games together on one tablet',
    news:['👯 Play with someone! Pick their room, or 👤 Guest',
          '⚽ Soccer Duel: one kicks, one keeps, then swap',
          '🃏 Memory for 2 in Brain Games: take turns finding pairs',
          '🎤 Stage Together: one taps the left circle, one the right',
          '🪙 Both players get coins for playing together']},
  {v:'1.43',d:'2026-11-19',i:'🎲',n:'Free Play & Puzzle of the Day',why:'So the puzzles never run out, with a fresh one waiting every day',
    news:['🎲 Free Play: endless new puzzles in Brain Games, the Marble Maze and the Code Lab',
          '📅 Puzzle of the Day on the Brain Games menu: +5 coins',
          '🪙 +1 coin for each Free Play puzzle (10 a day)',
          '📒 3 new stickers on the Code & Brain page']},
  {v:'1.44',d:'2026-11-19',i:'🔤',n:'American Spelling',why:'So the words in the app match the spelling you learn at school',
    news:['🎨 Words now use American spelling: color, favorite, gray, cozy',
          '🍂 The season is called Fall']},
  {v:'1.45',d:'2026-11-19',i:'📝',n:'Word Bank',why:'So spelling practice never runs out, with words picked for every age',
    news:['🎲 Word Builder has Free Play: a new word every time','👀 Look at the word, ✋ hide it, then spell it','📅 Word Builder joins the Puzzle of the Day']},
  {v:'1.46',d:'2026-11-19',i:'🧸',n:"Little Ones' Corner",why:'So the youngest players have toys where nothing can go wrong',
    news:['🧸 Play is in the top bar of every room','🖍️ Tap-to-Color: 12 pictures, and 🖼️ hang them in your Gallery','🎵 A Sound Mat and 👀 Peekaboo with your friends']},
  {v:'1.47',d:'2026-11-19',i:'💃',n:'Dance Maker',why:'So your buddy can dance to the music you make',
    news:['💃 Dance is in the 🎹 Music Maker and on the Stage','Pick 8 moves, then ▶️ watch your buddy dance','🎤 The Stage sign now hangs over the Loft keyboard']},
  {v:'1.48',d:'2026-11-19',i:'🌱',n:'Backyard Garden',why:'So something new can grow for you every day',
    news:['🏡 Tap the Backyard shed for your 🌱 Garden','Plant seeds: they grow a little every day and never wilt','Pick them for 🪙 coins and a 🪴 pot for your room']},
  {v:'1.49',d:'2026-11-19',i:'🔍',n:'I Spy',why:'So your own room can turn into a finding game',
    news:['🔍 Tap the magnifier in any room to play I Spy','Find things in your own room: a picture, a name or a hint','🌙 Turn the lights off for a 🔦 flashlight hunt']},
  {v:'1.50',d:'2026-11-19',i:'🪙',n:'New Things to Buy',why:'So your coins always have something fun to save up for',
    news:['🏠 A home for your pet: tap your pet, then 🏠 Home','🎨 Stage backdrops under the song list','🏛️ Museum pieces in the Shop to show off your prizes']},
  {v:'1.51',d:'2026-11-20',i:'👠',n:'Runway',why:'So every outfit gets its own little show',
    news:['👠 Runway in the Closet: pick a theme card and dress for it','👜 Borrow any clothes for the show, free','🤩 Walk the catwalk and the judges cheer']},
  {v:'1.52',d:'2026-11-20',i:'🎸',n:'Stage Jam',why:'So the loops you make can be the band for your own show',
    news:['🎸 Jam on the Stage: your 🎹 loop is the band','✨ Tap 5 big circles to play along. Every note fits!','🎶 Pick a jam sound: Sparkle, Pluck or Toot']},
  {v:'1.53',d:'2026-11-20',i:'🎯',n:'Trick Shots',why:'So there is always a new kick to learn, even after every trophy is won',
    news:['🎯 Trick Shots in Soccer: 12 tricks to try','🍌 Curve the ball around a wall of friends','🏅 Do all 12 to win the Trick Shot Star']},
  {v:'1.54',d:'2026-11-20',i:'🙈',n:'Pet Hide & Seek + Fetch',why:'So there is always something to play with your pet, even after it knows every trick',
    news:['🙈 Hide & Seek: your pet hides behind something in your room','🎾 Fetch: swipe to throw a toy and your pet brings it back','🦴 New fetch toys to get']},
  {v:'1.55',d:'2026-11-20',i:'🦮',n:'Pet Walks',why:'So your pet can take you somewhere new, with little treasures to find on the way',
    news:['🦮 Walk your pet on 4 paths: meadow, pond, town and a starry night','🧺 32 little things to find for your Walk Finds','🫙 Find a whole path for its treasure jar']},
  {v:'1.56',d:'2026-11-20',i:'🌀',n:'Curve Balls',why:'So scoring on the keepers takes skill, not just luck',
    news:['🌀 Bend your swipe to curve the ball: the keepers find it harder to guess','💨 A hard flick is a bit harder to stop too','🏆 The Gold Trophy is now within reach with great shots']},
  {v:'1.57',d:'2026-11-20',i:'🎲',n:'Brain Coins',why:'So the thinking games are always worth coming back to',
    news:['🎲 Free Play in the Brain Games: +2 coins for every puzzle','♾️ No daily limit: keep solving, keep earning','🃏 Memory Match, mazes and Code Lab boards stay the same']},
  {v:'1.58',d:'2026-11-21',i:'🧩',n:'Finish the Outfits',why:'So every dress-up idea has all its pieces, from head to toe',
    news:['🏎️ Race driver, 🚒 firefighter and 🚧 builder outfits are complete','🤖 Robot, ⭐ hero, 🦈 shark, 🚀 astronaut and 🦕 dino pieces to match','🥋 Karate pants, 🐮 overall pants, 🍵 PJ pants, 🍓 a strawberry skirt and more','🧩 3 new stickers for full outfits']},
  {v:'1.59',d:'2026-11-21',i:'📱',n:'Hangout Room on iPad + iPhone',why:'So the Hangout Room can live on every tablet and phone in the family',
    news:['📱 Add it to your Home Screen on an iPad or iPhone, and it works without internet','🔊 Read to me works on iPad and iPhone too','📳 A tiny buzz on iPhone when you pop, kick and squish','🧭 Tilt the marble maze on iPad and iPhone (tap 📱 Tilt once)']},
  {v:'1.60',d:'2026-11-21',i:'⚾',n:'Ball Field: Batting',why:'So everyone can step up to the plate and hit a home run',
    news:['⚾ Tap the bat rack in the Backyard for the new Ball Field','🐧 Pip, 🦝 Rocco and 🦉 Hoot pitch: tap right on time for a ⭐ home run','🏆 Hit all 6 pitches to win a Bronze, Silver or Gold Bat','🧢 New baseball clothes and decorations in the Shop and Closet']},
  {v:'1.61',d:'2026-11-21',i:'🧤',n:'Ball Field: Catch',why:'So everyone can make the big catch in the outfield',
    news:['🧤 A new Catch game on the Ball Field: run to the ring and catch the ball','🐢 Tilly, 🐨 Momo and 🦓 Zippy hit fly balls, pop-ups and grounders','🏆 Catch all 5 to win a Bronze, Silver or Gold Pennant for the Backyard fence']},
  {v:'1.62',d:'2026-11-21',i:'🎯',n:'Home Run Derby',why:'So everyone can aim their hits like a real slugger',
    news:['🎯 A new Derby game on the Ball Field: 12 challenges to hit','⏱️ Swing early to hit left, late to hit right, and tap high for a big fly ball','🎈 Pop balloons, ring the bell, drop it in the bucket… finish all 12 for the Golden Ball']},
  {v:'1.63',d:'2026-11-21',i:'🦓',n:'Tougher Ball Field',why:'So the big kids get a real challenge on Medium and Hard',
    news:['🦓 Medium and Hard batting and catching are tougher now','🧤 On Medium and Hard the ball can land near or far: drag up and down too','👀 No help ring on Hard: watch the ball and its shadow']},
  {v:'1.64',d:'2026-11-21',i:'👯',n:'Batting Duel',why:'So two can play ball together, one pitching and one batting',
    news:['👯 A new Duel on the Ball Field: one pitches, one bats, then switch','🫳 The pitcher picks Slow, Fast, Floater or Curve','⚾ 10 pitches, and both players get cheered']},
  {v:'1.65',d:'2026-11-22',i:'🔧',n:'Batting Duel fix',why:'So the Duel works whichever Ball Field game was played last',
    news:['👯 The Batting Duel now works after playing Catch or the Derby','🫳 The pitcher stands on the mound at the right size']}
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
