'use strict';
/* =========================================================
   6. PROFILES
   ========================================================= */
// Each room has a color and a badge, so a child who can't read yet can still find her own room.
// Color ids and badges are saved: never rename or remove them (new ones can be added).
const ROOM_COLORS={pink:'#ff8cc6',purple:'#a97cff',mint:'#8ff0d0',gold:'#ffd166',sky:'#7fc8ff',peach:'#ffab7a',green:'#7ee08a',blue:'#6c8cff'}; // green, blue: v1.20
const ROOM_BADGES=['🐰','⭐','💜','🦇','⚽','🎤','🎨','☁️'];
function newProfile(name,fur,color,badge,look){
  const p={id:uid(),name,color,badge,mascotName:'Fuzzy',coins:25,created:Date.now(),lastDaily:'',seenTip:false,
    stats:{pops:0,flips:0,squish:0,spins:0,bestRpm:0},look:Object.assign({},DEFAULT_LOOK,look||{},{fur}),owned:[],tint:true,
    room:{wall:'lavender',floor:'wood',items:[]},fid:{pop:'rainbow',squish:'mochi',spin:'galaxy',slime:'grape',cube:'pastel',marble:'pearl'}};
  p.room.items.push({uid:uid(),type:'starRug',x:500,y:665,placed:true});
  p.room.items.push({uid:uid(),type:'plant',x:705,y:560,placed:true});
  normalize(p);
  return p;
}
function normalize(p){
  if(!p.id) p.id=uid();
  if(!p.name) p.name='Room';
  p.stats=Object.assign({pops:0,flips:0,squish:0,spins:0,bestRpm:0,drawings:0,cards:0,goals:0,kicks:0,matches:0,perfects:0,saves:0,shows:0,fullCombos:0,stretches:0,clicks:0,mazes:0,dailies:0,nights:0,gifts:0,snaps:0,wishes:0,free:0,potd:0,colored:0,peeks:0,pads:0,planted:0,harvests:0,spied:0,spyRounds:0,walks:0,wows:0,jams:0,jamOwn:0,tricks:0,seeks:0,fetches:0,petWalks:0,finds:0,hits:0,homers:0,catches:0,derbies:0},p.stats||{}); // dailies (v1.18) = daily gifts opened, a plain count (not a streak)
  p.artPay=Object.assign({day:'',n:0},p.artPay||{}); // art coins paid today (see ART_DAILY)
  p.fidPay=Object.assign({day:'',n:0},p.fidPay&&typeof p.fidPay==='object'?p.fidPay:{}); if(typeof p.fidPay.n!=='number'||!(p.fidPay.n>=0)) p.fidPay.n=0; // v1.36: fidget coins paid today (see FID_DAILY)
  // Music Maker (v1.38, section 40): sound kit, speed (0-2), the loop on the grid now, 3 saved loops, music coins paid today.
  // A loop is 72 characters of 0/1 (9 rows x 8 steps). Section 40 checks the kit id; this only checks the types.
  {const m=p.music&&typeof p.music==='object'&&!Array.isArray(p.music)?p.music:{}, ok=g=>typeof g==='string'&&/^[01]{72}$/.test(g), sp=v=>[0,1,2].includes(v)?v:1;
   const sl=Array.isArray(m.slots)?m.slots:[], pay=m.pay&&typeof m.pay==='object'?m.pay:{};
   p.music={kit:typeof m.kit==='string'?m.kit:'soft',speed:sp(m.speed),cur:ok(m.cur)?m.cur:'0'.repeat(72),
     slots:[0,1,2].map(i=>{const x=sl[i];return x&&typeof x==='object'&&ok(x.g)?{g:x.g,kit:typeof x.kit==='string'?x.kit:'soft',speed:sp(x.speed)}:null;}),
     pay:{day:typeof pay.day==='string'?pay.day:'',n:Math.max(0,Math.floor(Number(pay.n)||0))}};}
  p.look=Object.assign({},DEFAULT_LOOK,p.look||{});
  if(!BUDDIES[p.look.kind]) p.look.kind='bunny'; if(!FACES[p.look.face]) p.look.face='sparkle'; // v1.20
  p.owned=Array.isArray(p.owned)?p.owned:[];
  p.room=Object.assign({wall:'lavender',floor:'wood',items:[]},p.room||{});
  // The Cozy Loft (v1.10), a second room with its own wall, floor and decorations. My Stuff is shared between rooms.
  p.room2=Object.assign({wall:'attic',floor:'wood',items:[]},p.room2&&typeof p.room2==='object'?p.room2:{});
  p.room3=Object.assign({wall:'picket',floor:'grass',items:[]},p.room3&&typeof p.room3==='object'?p.room3:{}); // the Backyard (v1.23)
  // The Studio (v1.40): bare, nothing built in. '' = not visited yet: studioStart() (section 41) picks the wall then.
  p.room4=Object.assign({wall:'',floor:'',items:[]},p.room4&&typeof p.room4==='object'&&!Array.isArray(p.room4)?p.room4:{});
  ['wall','floor'].forEach(k=>{if(typeof p.room4[k]!=='string')p.room4[k]='';});
  [p.room,p.room2,p.room3,p.room4].forEach(r=>{if(!Array.isArray(r.items))r.items=[];r.items=r.items.filter(i=>i&&typeof i==='object');});
  p.fid=Object.assign({pop:'rainbow',squish:'mochi',spin:'galaxy',popShape:'classic',slime:'grape',cube:'pastel',marble:'pearl'},p.fid||{}); // popShape: v1.10; slime, cube, marble: v1.16
  // Marble Maze (v1.16): the ids of the mazes solved (each pays +3 once).
  p.maze=Object.assign({},p.maze&&typeof p.maze==='object'&&!Array.isArray(p.maze)?p.maze:{});
  p.maze.solved=Array.isArray(p.maze.solved)?p.maze.solved.filter((x,i,a)=>typeof x==='string'&&a.indexOf(x)===i):[];
  if(typeof p.coins!=='number') p.coins=0;
  // Two-player games (v1.42, section 43): the day and coins paid today for playing together, and games played together.
  {const d=p.duo&&typeof p.duo==='object'&&!Array.isArray(p.duo)?p.duo:{}, n=v=>Math.max(0,Math.floor(Number(v)||0));
   p.duo={day:typeof d.day==='string'?d.day:'',n:n(d.n),soccer:n(d.soccer),memory:n(d.memory),stage:n(d.stage),ball:n(d.ball)};} // ball: v1.64
  // Free Play + Puzzle of the Day (v1.43, section 44): coins today, and the last day the daily puzzle was solved.
  {const f=p.free&&typeof p.free==='object'&&!Array.isArray(p.free)?p.free:{}, d=p.potd&&typeof p.potd==='object'&&!Array.isArray(p.potd)?p.potd:{};
   p.free={day:typeof f.day==='string'?f.day:'',n:Math.max(0,Math.floor(Number(f.n)||0))};
   p.potd={day:typeof d.day==='string'?d.day:''};
   ['free','potd'].forEach(k=>{p.stats[k]=Math.max(0,Math.floor(Number(p.stats[k])||0));});}
  // Dance Maker (v1.47, section 48): the dance now and 3 saved dances (8 move codes each, '.' = empty), the music id,
  // the Stage songs danced to, and coins paid today. Move codes are fixed here; the music id is checked when it is read (dnMusic).
  {const o=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{}, dn=o(p.dance), py=o(dn.pay), ok=g=>typeof g==='string'&&/^[hspwbcjo.]{8}$/.test(g), sl=Array.isArray(dn.slots)?dn.slots:[];
   p.dance={cur:ok(dn.cur)?dn.cur:'........',music:typeof dn.music==='string'?dn.music:'beat',slots:[0,1,2].map(i=>ok(sl[i])?sl[i]:null),
     songs:Array.isArray(dn.songs)?[...new Set(dn.songs.filter(s=>typeof s==='string'))]:[],
     pay:{day:typeof py.day==='string'?py.day:'',n:Math.max(0,Math.floor(Number(py.n)||0))}};}
  // Garden (v1.48, section 49): 6 plots (null or {seed, day 'YYYY-MM-DD' planted, step 0-3}) and the seed ids grown once.
  // Seed ids are checked when they are read (gdPlot), so only the types are checked here.
  {const o=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{}, g=o(p.garden), pl=Array.isArray(g.plots)?g.plots:[];
   p.garden={plots:[0,1,2,3,4,5].map(i=>{const x=pl[i];return x&&typeof x==='object'&&typeof x.seed==='string'&&/^\d{4}-\d\d-\d\d$/.test(x.day)
       ?{seed:x.seed,day:x.day,step:Math.min(3,Math.max(0,Math.floor(Number(x.step)||0)))}:null;}),
     grown:Array.isArray(g.grown)?[...new Set(g.grown.filter(s=>typeof s==='string'))]:[]};
   ['planted','harvests'].forEach(k=>{p.stats[k]=Math.max(0,Math.floor(Number(p.stats[k])||0));});}
  // I Spy (v1.49, section 50): the clue level (1 picture, 2 name, 3 hint), the room numbers with a finished round, coins paid today.
  {const o=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{}, s=o(p.spy), py=o(s.pay), lv=Math.floor(Number(s.lvl));
   p.spy={lvl:lv>=1&&lv<=3?lv:1,rooms:Array.isArray(s.rooms)?[...new Set(s.rooms.filter(n=>[1,2,3,4].includes(n)))]:[],
     pay:{day:typeof py.day==='string'?py.day:'',n:Math.max(0,Math.floor(Number(py.n)||0))}};
   ['spied','spyRounds'].forEach(k=>{p.stats[k]=Math.max(0,Math.floor(Number(p.stats[k])||0));});}
  // Runway (v1.51, section 52): coins paid today and the theme card ids walked (checked against RW_CARDS when counted).
  {const o=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{}, r=o(p.runway), py=o(r.pay);
   p.runway={pay:{day:typeof py.day==='string'?py.day:'',n:Math.max(0,Math.floor(Number(py.n)||0))},
     cards:Array.isArray(r.cards)?[...new Set(r.cards.filter(c=>typeof c==='string'))]:[]};
   ['walks','wows'].forEach(k=>{p.stats[k]=Math.max(0,Math.floor(Number(p.stats[k])||0));});}
  // Stage Jam (v1.52, section 53): the jam sound (checked when it is read, jamSound) and jams paid today.
  {const o=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{}, j=o(p.jam), py=o(j.pay);
   p.jam={sound:typeof j.sound==='string'?j.sound:'sparkle',pay:{day:typeof py.day==='string'?py.day:'',n:Math.max(0,Math.floor(Number(py.n)||0))}};
   ['jams','jamOwn','tricks'].forEach(k=>{p.stats[k]=Math.max(0,Math.floor(Number(p.stats[k])||0));});}
  // Little Ones' Corner (v1.46, sections 46-47): colors per picture ('#rrggbb' or '' per area), pictures hung in the Gallery,
  // and coins paid today. Picture ids are checked when they are read (cbCols), so only the types are checked here.
  {const o=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{}, l=o(p.little), py=o(l.pay);
   p.little={colors:Object.fromEntries(Object.entries(o(l.colors)).filter(([k,v])=>Array.isArray(v)).map(([k,v])=>[k,v.slice(0,40).map(c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)?c:'')])),
     hung:Object.fromEntries(Object.entries(o(l.hung)).filter(([k,v])=>v&&typeof v==='object'&&typeof v.art==='string').map(([k,v])=>[k,{art:v.art,sig:typeof v.sig==='string'?v.sig:''}])),
     pay:{day:typeof py.day==='string'?py.day:'',n:Math.max(0,Math.floor(Number(py.n)||0))},
     lock:typeof l.lock==='boolean'?l.lock:null}; // 🧸 Little mode (v1.71): filled in below, once the band is known
   ['colored','peeks','pads'].forEach(k=>{p.stats[k]=Math.max(0,Math.floor(Number(p.stats[k])||0));});}
  // Visitors (v1.41, section 42): the wish waiting ('' = nobody), the day the last wish came true, and the wish ids done.
  {const v=p.visit&&typeof p.visit==='object'&&!Array.isArray(p.visit)?p.visit:{};
   p.visit={cur:typeof v.cur==='string'?v.cur:'',day:typeof v.day==='string'?v.day:'',done:Array.isArray(v.done)?v.done.filter((x,i,a)=>typeof x==='string'&&a.indexOf(x)===i):[]};}
  // Pet (v1.19): which pet is out (a PETS id, or '' before she picks one), what it wears, and a name and
  // friendship hearts for each kind of pet she has had. Section 22 checks the ids; this only checks the types.
  p.pet=Object.assign({kind:'',acc:'none'},p.pet&&typeof p.pet==='object'&&!Array.isArray(p.pet)?p.pet:{});
  if(typeof p.pet.kind!=='string') p.pet.kind=''; if(typeof p.pet.acc!=='string') p.pet.acc='none'; if(typeof p.pet.home!=='string') p.pet.home=''; // v1.50
  if(typeof p.pet.toy!=='string') p.pet.toy='ball'; // 🎾 the fetch toy (v1.54, section 55 checks the id)
  ['seeks','fetches'].forEach(k=>{p.stats[k]=Math.max(0,Math.floor(Number(p.stats[k])||0));}); // v1.54
  // Pet walks (v1.55, section 56): the last path walked and the find ids found (both checked when they are read).
  {const w=p.walk&&typeof p.walk==='object'&&!Array.isArray(p.walk)?p.walk:{};
   p.walk={path:typeof w.path==='string'?w.path:'meadow',finds:Array.isArray(w.finds)?w.finds.filter((x,i,a)=>typeof x==='string'&&a.indexOf(x)===i):[]};
   ['petWalks','finds'].forEach(k=>{p.stats[k]=Math.max(0,Math.floor(Number(p.stats[k])||0));});}
  // Ball Field (v1.60, section 59): the game on screen, then per game the level, best score per level and prizes won (level ids).
  // catch (🧤) and derby (🎯) are filled in now so later updates need no new save version.
  {const o=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{}, b=o(p.ball), L=['easy','medium','hard'], n=v=>Math.max(0,Math.floor(Number(v)||0));
   const game=g=>{const x=o(b[g]),best=o(x.best);return {level:L.includes(x.level)?x.level:'easy',best:{easy:n(best.easy),medium:n(best.medium),hard:n(best.hard)},
     prizes:Array.isArray(x.prizes)?x.prizes.filter((l,i,a)=>L.includes(l)&&a.indexOf(l)===i):[],pay:x.pay};}; // pay: v1.67, cleaned below
   const dy=o(b.derby), pay=o(dy.pay);
   p.ball={mode:['bat','catch','derby'].includes(b.mode)?b.mode:'bat',bat:game('bat'),catch:game('catch'),
     derby:{cur:typeof dy.cur==='string'?dy.cur:'d1',done:Array.isArray(dy.done)?dy.done.filter((x,i,a)=>typeof x==='string'&&a.indexOf(x)===i):[],
       pay:{day:typeof pay.day==='string'?pay.day:'',n:n(pay.n)}}};
   ['hits','homers','catches','derbies'].forEach(k=>{p.stats[k]=n(p.stats[k]);});}
  const petObj=o=>o&&typeof o==='object'&&!Array.isArray(o)?o:{};
  p.pet.names=Object.fromEntries(Object.entries(petObj(p.pet.names)).filter(([k,v])=>typeof v==='string'&&v.trim()).map(([k,v])=>[k,v.slice(0,12)]));
  p.pet.hearts=Object.fromEntries(Object.entries(petObj(p.pet.hearts)).map(([k,v])=>[k,Math.max(0,Math.floor(Number(v)||0))]));
  // Sticker Book (v1.18): sticker ids she has, and the ones not seen in the book yet.
  p.stickers=Array.isArray(p.stickers)?p.stickers.filter((x,i,a)=>typeof x==='string'&&a.indexOf(x)===i):[];
  p.stickerNew=Array.isArray(p.stickerNew)?p.stickerNew.filter((x,i,a)=>typeof x==='string'&&a.indexOf(x)===i&&p.stickers.includes(x)):[];
  if(!p.mascotName) p.mascotName='Fuzzy';
  // Looks + night mode (v1.27): 4 outfit slots (null = empty) and the rooms with the lights off ({'1':true}).
  const lk=Array.isArray(p.looks)?p.looks:[]; p.looks=[0,1,2,3].map(i=>lk[i]&&typeof lk[i]==='object'&&!Array.isArray(lk[i])?Object.fromEntries(Object.entries(lk[i]).filter(([k,v])=>typeof v==='string')):null);
  // Gifts + layouts (v1.28): the gifts waiting to be opened, and up to 3 saved layouts per room.
  p.gifts=(Array.isArray(p.gifts)?p.gifts:[]).filter(g=>g&&typeof g==='object'&&typeof g.id==='string'&&(g.kind==='coins'&&Number(g.n)>0||g.kind==='decor'&&typeof g.type==='string')).map(g=>Object.assign(g,{from:String(g.from||'').slice(0,24),badge:typeof g.badge==='string'?g.badge:'🎁'},g.kind==='coins'?{n:Math.min(100,Math.floor(Number(g.n)))}:{}));
  const pr=p.presets&&typeof p.presets==='object'&&!Array.isArray(p.presets)?p.presets:{}, lay=L=>L&&typeof L==='object'&&typeof L.wall==='string'&&typeof L.floor==='string'&&Array.isArray(L.items)?Object.assign(L,{items:L.items.filter(i=>i&&typeof i.uid==='string'&&typeof i.type==='string').map(i=>({uid:i.uid,type:i.type,x:Number(i.x)||0,y:Number(i.y)||0}))}):null;
  p.presets={1:0,2:0,3:0,4:0}; Object.keys(p.presets).forEach(k=>{const a=Array.isArray(pr[k])?pr[k]:[];p.presets[k]=[0,1,2].map(i=>lay(a[i]));});
  if(typeof p.speak!=='boolean') p.speak=null; // v1.30 🔊 Read to me: null = on in Easy mode, off otherwise
  if(typeof p.dream!=='string') p.dream=''; // v1.29: the big dream she is saving up for (a DECOR key, or '')
  p.night=Object.fromEntries(Object.entries(p.night&&typeof p.night==='object'&&!Array.isArray(p.night)?p.night:{}).filter(([k,v])=>['1','2','3','4'].includes(k)&&v===true));
  // Photocards (v1.4). A card: {id, no, at, look, stage, frame, title, name, s:[cute,spooky,sporty], bonus?}
  p.cards=Array.isArray(p.cards)?p.cards.filter(c=>c&&typeof c==='object'&&typeof c.id==='string'):[];
  p.cards.forEach(c=>{if(typeof c.no!=='number')c.no=Number(c.no)||0;});
  p.cardPins=Array.isArray(p.cardPins)?p.cardPins.filter((id,i,a)=>a.indexOf(id)===i&&p.cards.some(c=>c.id===id)).slice(0,3):[];
  p.bonusGot=Array.isArray(p.bonusGot)?p.bonusGot.filter(x=>typeof x==='string'):[];
  if(typeof p.cardNo!=='number') p.cardNo=0;
  p.cardNo=p.cards.reduce((m,c)=>Math.max(m,Number(c.no)||0),p.cardNo);
  // Soccer (v1.5): chosen level and best score (out of 5) per level.
  p.soccer=Object.assign({level:'easy'},p.soccer&&typeof p.soccer==='object'?p.soccer:{});
  p.soccer.best=Object.assign({easy:0,medium:0,hard:0},p.soccer.best&&typeof p.soccer.best==='object'?p.soccer.best:{});
  p.soccer.trophies=Array.isArray(p.soccer.trophies)?p.soccer.trophies.filter(l=>['easy','medium','hard'].includes(l)):[]; // levels whose trophy she has won
  if(!['easy','medium','hard'].includes(p.soccer.level)) p.soccer.level='easy';
  // Be the Keeper (v1.24): ⚽ Kick or 🧤 Keep (the last one used), and the keeper's level, best saves and gloves won.
  if(!['keep','trick'].includes(p.soccer.mode)) p.soccer.mode='kick'; // 'trick' since v1.53
  // Trick Shots (v1.53, section 54): trick ids done (checked against TRICKS when counted), the trick on screen, coins paid today.
  {const o=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{}, py=o(p.soccer.trickPay);
   p.soccer.tricks=Array.isArray(p.soccer.tricks)?[...new Set(p.soccer.tricks.filter(t=>typeof t==='string'))]:[];
   if(typeof p.soccer.trick!=='string') p.soccer.trick='t1';
   p.soccer.trickPay={day:typeof py.day==='string'?py.day:'',n:Math.max(0,Math.floor(Number(py.n)||0))};}
  const kp=p.soccer.keep&&typeof p.soccer.keep==='object'&&!Array.isArray(p.soccer.keep)?p.soccer.keep:{};
  p.soccer.keep={level:['easy','medium','hard'].includes(kp.level)?kp.level:'easy',
    best:Object.assign({easy:0,medium:0,hard:0},kp.best&&typeof kp.best==='object'?kp.best:{}),
    gloves:Array.isArray(kp.gloves)?kp.gloves.filter((l,i,a)=>['easy','medium','hard'].includes(l)&&a.indexOf(l)===i):[],pay:kp.pay}; // pay: v1.67, cleaned below
  ['easy','medium','hard'].forEach(l=>{p.soccer.keep.best[l]=clamp(Math.floor(Number(p.soccer.keep.best[l])||0),0,5);});
  // Stage (v1.7): chosen level, best {stars, score} per song and level, and whether the Golden Mic was given.
  p.stage=Object.assign({level:'easy',mic:false},p.stage&&typeof p.stage==='object'?p.stage:{});
  if(!p.stage.best||typeof p.stage.best!=='object'||Array.isArray(p.stage.best)) p.stage.best={};
  Object.keys(p.stage.best).forEach(k=>{const b=p.stage.best[k];if(!b||typeof b!=='object'||Array.isArray(b)){delete p.stage.best[k];return;}
    Object.keys(b).forEach(l=>{const r=b[l];if(!r||typeof r!=='object')delete b[l];else{r.stars=Number(r.stars)||0;r.score=Number(r.score)||0;}});});
  if(!['easy','medium','hard'].includes(p.stage.level)) p.stage.level='easy';
  p.stage.mic=!!p.stage.mic; if(typeof p.stage.backdrop!=='string') p.stage.backdrop='classic'; // v1.50
  // Daily coin allowances (v1.67, GAME_PAY in section 8): {day, n} = the day (fpDay) and the coins paid that day, one per game.
  {const dp=v=>{const o=v&&typeof v==='object'&&!Array.isArray(v)?v:{};return {day:typeof o.day==='string'?o.day:'',n:Math.max(0,Math.floor(Number(o.n)||0))};};
   p.soccer.pay=dp(p.soccer.pay); p.soccer.keep.pay=dp(p.soccer.keep.pay); p.ball.bat.pay=dp(p.ball.bat.pay); p.ball.catch.pay=dp(p.ball.catch.pay);
   p.stage.pay=dp(p.stage.pay); p.maze.pay=dp(p.maze.pay);}
  // Little-sister polish (v1.8): Easy mode, and the room's color + badge on the profile screen.
  p.easy=!!p.easy;
  // Level bands (v1.69, section 64): p.band, with p.easy kept in step (on for Little and Easy). If they disagree (an older
  // app version changed Easy mode), Easy mode wins, so the room acts as it did there.
  if(!['little','easy','normal','challenge'].includes(p.band)||(p.band==='little'||p.band==='easy')!==p.easy) p.band=p.easy?'easy':'normal';
  if(p.little.lock===null) p.little.lock=p.band==='little';
  // v1.73: every saved day is fpDay()'s 2026-11-24. Days saved in the old "Tue Nov 24 2026" form are turned into it (dayIso, section 1).
  p.lastDaily=dayIso(p.lastDaily);
  [p.artPay,p.fidPay,p.music.pay,p.dance.pay,p.little.pay,p.runway.pay,p.visit,p.duo].forEach(o=>{if(o&&typeof o.day==='string')o.day=dayIso(o.day);}); // 🧸 Little mode (v1.71, section 66): on for Little rooms
  // Buddies (v1.20): the room's color also colors the buttons and bars. New rooms start with it on; rooms made
  // before v1.20 start with it off, so they look the same as before (it can be switched on with ✏️ under the room).
  p.tint=!!p.tint;
  // Furniture colors (v1.20): {piece: color id}. Section 23 checks the ids when drawing; this only checks the types.
  p.furn=Object.fromEntries(Object.entries(p.furn&&typeof p.furn==='object'&&!Array.isArray(p.furn)?p.furn:{}).filter(([k,v])=>typeof v==='string'));
  if(!ROOM_COLORS[p.color]){const ks=Object.keys(ROOM_COLORS);p.color=ks[[...p.id].reduce((a,c)=>a+c.charCodeAt(0),0)%ks.length];}
  if(!ROOM_BADGES.includes(p.badge)) p.badge=ROOM_BADGES[0];
  // Code Lab (v1.13): chosen level and the ids of the puzzles solved (each puzzle pays once).
  p.code=Object.assign({level:'easy'},p.code&&typeof p.code==='object'&&!Array.isArray(p.code)?p.code:{});
  p.code.solved=Array.isArray(p.code.solved)?p.code.solved.filter((x,i,a)=>typeof x==='string'&&a.indexOf(x)===i):[];
  if(!['easy','medium','hard','move','if','challenge'].includes(p.code.level)) p.code.level='easy';
  // Brain Games (v1.25): the last game played, the level picked in each game, and the puzzle ids solved (each pays once).
  const br=p.brain&&typeof p.brain==='object'&&!Array.isArray(p.brain)?p.brain:{}, brL=br.level&&typeof br.level==='object'&&!Array.isArray(br.level)?br.level:{};
  const brG=['snack','memory','pop','train','word','bake','facts']; // v1.33: + Pattern Train, Word Builder; v1.34: + Fraction Bakery, Fact Cards
  p.brain={game:brG.includes(br.game)?br.game:'snack',level:{},solved:Array.isArray(br.solved)?br.solved.filter((x,i,a)=>typeof x==='string'&&a.indexOf(x)===i):[]};
  brG.forEach(g=>{p.brain.level[g]=['easy','medium','hard'].includes(brL[g])?brL[g]:'easy';});
}
DB.profiles.forEach(normalize);
