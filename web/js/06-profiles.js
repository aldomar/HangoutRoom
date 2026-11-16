'use strict';
/* =========================================================
   6. PROFILES
   ========================================================= */
// Each room has a colour and a badge, so a child who can't read yet can still find her own room.
// Colour ids and badges are saved: never rename or remove them (new ones can be added).
const ROOM_COLORS={pink:'#ff8cc6',purple:'#a97cff',mint:'#8ff0d0',gold:'#ffd166',sky:'#7fc8ff',peach:'#ffab7a'};
const ROOM_BADGES=['🐰','⭐','💜','🦇','⚽','🎤','🎨','☁️'];
function newProfile(name,fur,color,badge){
  const p={id:uid(),name,color,badge,mascotName:'Fuzzy',coins:25,created:Date.now(),lastDaily:'',seenTip:false,
    stats:{pops:0,flips:0,squish:0,spins:0,bestRpm:0},look:Object.assign({},DEFAULT_LOOK,{fur}),owned:[],
    room:{wall:'lavender',floor:'wood',items:[]},fid:{pop:'rainbow',squish:'mochi',spin:'galaxy'}};
  p.room.items.push({uid:uid(),type:'starRug',x:500,y:665,placed:true});
  p.room.items.push({uid:uid(),type:'plant',x:705,y:560,placed:true});
  normalize(p);
  return p;
}
function normalize(p){
  if(!p.id) p.id=uid();
  if(!p.name) p.name='Room';
  p.stats=Object.assign({pops:0,flips:0,squish:0,spins:0,bestRpm:0,drawings:0,cards:0,goals:0,kicks:0,matches:0,perfects:0,shows:0,fullCombos:0},p.stats||{});
  p.artPay=Object.assign({day:'',n:0},p.artPay||{}); // art coins paid today (see ART_DAILY)
  p.look=Object.assign({},DEFAULT_LOOK,p.look||{});
  p.owned=Array.isArray(p.owned)?p.owned:[];
  p.room=Object.assign({wall:'lavender',floor:'wood',items:[]},p.room||{});
  // The Cozy Loft (v1.10), a second room with its own wall, floor and decorations. My Stuff is shared between rooms.
  p.room2=Object.assign({wall:'attic',floor:'wood',items:[]},p.room2&&typeof p.room2==='object'?p.room2:{});
  [p.room,p.room2].forEach(r=>{if(!Array.isArray(r.items))r.items=[];r.items=r.items.filter(i=>i&&typeof i==='object');});
  p.fid=Object.assign({pop:'rainbow',squish:'mochi',spin:'galaxy',popShape:'classic'},p.fid||{}); // popShape: v1.10
  if(typeof p.coins!=='number') p.coins=0;
  if(!p.mascotName) p.mascotName='Fuzzy';
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
  // Stage (v1.7): chosen level, best {stars, score} per song and level, and whether the Golden Mic was given.
  p.stage=Object.assign({level:'easy',mic:false},p.stage&&typeof p.stage==='object'?p.stage:{});
  if(!p.stage.best||typeof p.stage.best!=='object'||Array.isArray(p.stage.best)) p.stage.best={};
  Object.keys(p.stage.best).forEach(k=>{const b=p.stage.best[k];if(!b||typeof b!=='object'||Array.isArray(b)){delete p.stage.best[k];return;}
    Object.keys(b).forEach(l=>{const r=b[l];if(!r||typeof r!=='object')delete b[l];else{r.stars=Number(r.stars)||0;r.score=Number(r.score)||0;}});});
  if(!['easy','medium','hard'].includes(p.stage.level)) p.stage.level='easy';
  p.stage.mic=!!p.stage.mic;
  // Little-sister polish (v1.8): Easy mode, and the room's colour + badge on the profile screen.
  p.easy=!!p.easy;
  if(!ROOM_COLORS[p.color]){const ks=Object.keys(ROOM_COLORS);p.color=ks[[...p.id].reduce((a,c)=>a+c.charCodeAt(0),0)%ks.length];}
  if(!ROOM_BADGES.includes(p.badge)) p.badge=ROOM_BADGES[0];
  // Code Lab (v1.13): chosen level and the ids of the puzzles solved (each puzzle pays once).
  p.code=Object.assign({level:'easy'},p.code&&typeof p.code==='object'&&!Array.isArray(p.code)?p.code:{});
  p.code.solved=Array.isArray(p.code.solved)?p.code.solved.filter((x,i,a)=>typeof x==='string'&&a.indexOf(x)===i):[];
  if(!['easy','medium','hard','move','if'].includes(p.code.level)) p.code.level='easy';
}
DB.profiles.forEach(normalize);
