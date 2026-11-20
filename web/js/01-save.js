'use strict';
/* =========================================================
   1. HELPERS + SAVE DATA
   ========================================================= */
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
const TAU=Math.PI*2;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const APP_VERSION='1.54';   // shown in Settings; bump with every PR (matches versionName in android/app/build.gradle.kts)
const SAVE_KEY='hangoutRoom.v1'; // never change: her saves live under this key
const DB_VERSION=35;          // version of the save-data shape; bump only when the shape changes
// stageOffset = "Sound late?" on the Stage, in ms (per device, because it depends on the speaker)
// pin = the optional grown-up PIN ('' = none, else 4 digits). It stays with the device: restoring a backup keeps it.
const DEFAULT_SETTINGS={sound:true,music:false,backupArt:true,stageOffset:0,pin:'',seenNew:'',lastBackup:0}; // lastBackup (v1.30): when a backup was last saved on this device (ms) // seenNew (v1.22): last version whose What's New was shown

function freshDB(){return {version:DB_VERSION,profiles:[],activeId:null,settings:Object.assign({},DEFAULT_SETTINGS)};}

// Save-data upgrades. When the shape changes, bump DB_VERSION and add a step here
// that turns a save of the previous version into the new one, e.g.
//   2: d=>{ d.profiles.forEach(p=>{ p.drawings=p.drawings||[]; }); },
// Steps run in order, so a very old save or backup is upgraded one version at a time.
// Never rename or remove saved fields or item ids.
const MIGRATIONS={
  // v1.3 Art Desk: drawings live in IndexedDB (see ArtStore below). Profiles count them in
  // stats.drawings and track today's art coins in artPay; posters are room items {type:'poster', art:<drawing id>}.
  2: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&p.stats&&typeof p.stats.drawings!=='number') p.stats.drawings=0; }); },
  // v1.4 Photocard Wall: each profile gets cards[] (small "recipes", not pictures), cardPins[] (up to 3 card ids
  // on the corkboard), bonusGot[] (milestone ids already given, never given twice) and cardNo (last card number).
  3: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(!p||typeof p!=='object') return;
    if(!Array.isArray(p.cards)) p.cards=[]; if(!Array.isArray(p.cardPins)) p.cardPins=[];
    if(!Array.isArray(p.bonusGot)) p.bonusGot=[]; if(typeof p.cardNo!=='number') p.cardNo=0;
    if(p.stats&&typeof p.stats.cards!=='number') p.stats.cards=0; }); }, // stats.cards = cards made (for a bonus)
  // v1.5 Soccer Field: soccer {level, best{easy,medium,hard}, trophies[]} and stats.goals / kicks / matches / perfects.
  4: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(!p||typeof p!=='object') return;
    if(!p.soccer||typeof p.soccer!=='object') p.soccer={level:'easy',best:{easy:0,medium:0,hard:0},trophies:[]};
    if(p.stats) ['goals','kicks','matches','perfects'].forEach(k=>{ if(typeof p.stats[k]!=='number') p.stats[k]=0; }); }); },
  // v1.7 Stage: stage {level, best{songId:{easy,medium,hard:{stars,score}}}, mic} and stats.shows / fullCombos.
  5: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(!p||typeof p!=='object') return;
    if(!p.stage||typeof p.stage!=='object') p.stage={level:'easy',best:{},mic:false};
    if(p.stats) ['shows','fullCombos'].forEach(k=>{ if(typeof p.stats[k]!=='number') p.stats[k]=0; }); }); },
  // v1.8 Little-sister polish: easy (Easy mode on/off), color (a ROOM_COLORS id) and badge (one of ROOM_BADGES)
  // per profile, filled in by normalize(); settings.pin comes from DEFAULT_SETTINGS.
  6: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&typeof p.easy!=='boolean') p.easy=false; }); },
  // v1.10 Loft + Content Pack 1: room2 {wall, floor, items} (the Cozy Loft, empty at first) and fid.popShape
  // ('classic' | 'heart' | 'star'). normalize() fills in both; this step only marks the upgrade.
  7: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&!p.room2) p.room2={wall:'attic',floor:'wood',items:[]}; }); },
  // v1.11 Hair styles + colors: look.hair is now a style and look.hairColor a HAIR_COLORS id. The old colored swoops
  // become the Emo Swoop style ('swoopBlack') in that color, and owning one gives that color (owned 'hairc:<id>').
  // Old keys are kept, never deleted.
  8: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(!p||typeof p!=='object') return;
    if(p.look&&LEGACY_HAIR[p.look.hair]){p.look.hairColor=LEGACY_HAIR[p.look.hair];p.look.hair='swoopBlack';}
    if(Array.isArray(p.owned)) Object.keys(LEGACY_HAIR).forEach(k=>{if(p.owned.includes('hair:'+k)&&!p.owned.includes('hairc:'+LEGACY_HAIR[k]))p.owned.push('hairc:'+LEGACY_HAIR[k]);}); }); },
  // v1.13 Code Lab: code {level, solved[]} (the puzzle ids solved). normalize() also fills it in.
  9: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.code||typeof p.code!=='object')) p.code={level:'easy',solved:[]}; }); },
  // v1.16 New fidgets: maze {solved[]} (Marble Maze ids), fid.slime / cube / marble and stats.stretches / clicks / mazes.
  // normalize() fills in all of them; this step adds the maze record.
  10: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.maze||typeof p.maze!=='object')) p.maze={solved:[]}; }); },
  // v1.18 Sticker Book: stickers[] (sticker ids she has), stickerNew[] (not seen in the book yet) and stats.dailies
  // (daily gifts opened). normalize() fills them in; stickers she had already earned are given the next time she plays.
  11: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&!Array.isArray(p.stickers)) p.stickers=[]; }); },
  // v1.19 Pet: pet {kind ('' until she picks one), acc, names{kind:name}, hearts{kind:n}}. normalize() fills it in.
  12: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.pet||typeof p.pet!=='object')) p.pet={kind:'',acc:'none',names:{},hearts:{}}; }); },
  // v1.20 Buddies: look.kind / look.face (a bunny with the Sparkly face, filled in by normalize), p.tint
  // (off for rooms made before v1.20, so they look the same) and p.furn (furniture colors; empty = the classic colors).
  13: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&typeof p.tint!=='boolean') p.tint=false; }); },
  // v1.23 Backyard: room3 {wall, floor, items} (empty, with the White Picket fence and Grass). normalize() fills it in too.
  14: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.room3||typeof p.room3!=='object')) p.room3={wall:'picket',floor:'grass',items:[]}; }); },
  // v1.24 Be the Keeper: soccer.mode ('kick'|'keep'), soccer.keep {level, best{easy,medium,hard}, gloves[]} and
  // stats.saves. normalize() fills them in; this step adds the keeper record.
  15: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&p.soccer&&typeof p.soccer==='object'&&!p.soccer.keep) p.soccer.keep={level:'easy',best:{easy:0,medium:0,hard:0},gloves:[]}; }); },
  // v1.25 Brain Games: brain {game, level{snack,memory,pop}, solved[]} (puzzle ids like 'snack:e1'). normalize() fills it in.
  16: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.brain||typeof p.brain!=='object')) p.brain={game:'snack',level:{snack:'easy',memory:'easy',pop:'easy'},solved:[]}; }); },
  // v1.27 Looks + night mode: looks[4] (saved outfits, null = empty) and night {'1'|'2'|'3': true}. normalize() fills them in.
  17: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&!Array.isArray(p.looks)) p.looks=[null,null,null,null]; }); },
  // v1.28 Gifts + layouts: gifts[] (wrapped gifts waiting to be opened) and presets {'1'|'2'|'3': 3 saved layouts}. normalize() fills them in.
  18: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&!Array.isArray(p.gifts)) p.gifts=[]; }); },
  // v1.29 Big dreams: dream ('' or the DECOR key she is saving up for). normalize() fills it in too.
  19: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&typeof p.dream!=='string') p.dream=''; }); },
  // v1.30 Grown-up helpers: speak (null = follow Easy mode, or true/false for 🔊 Read to me) and stats.snaps. normalize() fills them in.
  20: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&typeof p.speak!=='boolean') p.speak=null; }); },
  // v1.36 Fidget allowance: fidPay {day, n} = fidget coins paid today (see FID_DAILY in section 10). normalize() fills it in.
  21: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.fidPay||typeof p.fidPay!=='object')) p.fidPay={day:'',n:0}; }); },
  // v1.38 Music Maker: music {kit, speed, cur, slots[3], pay{day,n}} (section 40). normalize() fills it in.
  22: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.music||typeof p.music!=='object'||Array.isArray(p.music))) p.music={}; }); },
  // v1.40 Studio: room4 {wall, floor, items} (the fourth room, bare; the wall is chosen on the first visit). normalize() fills it in too.
  23: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.room4||typeof p.room4!=='object'||Array.isArray(p.room4))) p.room4={wall:'',floor:'',items:[]}; }); },
  // v1.41 Visitors: visit {cur, day, done[]} (section 42): the wish waiting, the day the last wish came true, the wishes done.
  24: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.visit||typeof p.visit!=='object'||Array.isArray(p.visit))) p.visit={cur:'',day:'',done:[]}; }); },
  // v1.42 Two-player games: duo {day, n, soccer, memory, stage} (section 43): coins today and games played together.
  25: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.duo||typeof p.duo!=='object'||Array.isArray(p.duo))) p.duo={day:'',n:0,soccer:0,memory:0,stage:0}; }); },
  // v1.43 Free Play + Puzzle of the Day: free {day, n} (Free Play coins today), potd {day} (the last day the daily puzzle was solved).
  26: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'){
    if(!p.free||typeof p.free!=='object'||Array.isArray(p.free)) p.free={day:'',n:0};
    if(!p.potd||typeof p.potd!=='object'||Array.isArray(p.potd)) p.potd={day:''}; } }); },
  // v1.46 Little Ones' Corner: little {colors{picId:[...]}, hung{picId:{art,sig}}, pay{day,n}} (sections 46-47). normalize() checks it.
  27: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.little||typeof p.little!=='object'||Array.isArray(p.little))) p.little={colors:{},hung:{},pay:{day:'',n:0}}; }); },
  // v1.47 Dance Maker: dance {cur, music, slots[3], songs[], pay{day,n}} (section 48). normalize() checks it.
  28: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.dance||typeof p.dance!=='object'||Array.isArray(p.dance))) p.dance={cur:'........',music:'beat',slots:[null,null,null],songs:[],pay:{day:'',n:0}}; }); },
  // v1.48 Garden: garden {plots[6], grown[]} (section 49), stats.planted / harvests. normalize() checks it.
  29: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.garden||typeof p.garden!=='object'||Array.isArray(p.garden))) p.garden={plots:[null,null,null,null,null,null],grown:[]}; }); },
  // v1.49 I Spy: spy {lvl, rooms[], pay{day,n}} (section 50), stats.spied / spyRounds. normalize() checks it.
  30: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.spy||typeof p.spy!=='object'||Array.isArray(p.spy))) p.spy={lvl:1,rooms:[],pay:{day:'',n:0}}; }); },
  // v1.50 coin spends: the pet's home ('' = the cushion) and the Stage backdrop
  31: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(!p||typeof p!=='object') return;
    if(p.pet&&typeof p.pet==='object'&&!Array.isArray(p.pet)&&typeof p.pet.home!=='string') p.pet.home='';
    if(p.stage&&typeof p.stage==='object'&&!Array.isArray(p.stage)&&typeof p.stage.backdrop!=='string') p.stage.backdrop='classic'; }); },
  // v1.51 Runway: runway {pay{day,n}, cards[]} (section 52), stats.walks / wows. normalize() checks it.
  32: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.runway||typeof p.runway!=='object'||Array.isArray(p.runway))) p.runway={pay:{day:'',n:0},cards:[]}; }); },
  // v1.52 Stage Jam: jam {sound, pay{day,n}} (section 53), stats.jams / jamOwn. normalize() checks it.
  33: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&(!p.jam||typeof p.jam!=='object'||Array.isArray(p.jam))) p.jam={sound:'sparkle',pay:{day:'',n:0}}; }); },
  // v1.53 Trick Shots: soccer.tricks[], soccer.trick, soccer.trickPay{day,n} (section 54), stats.tricks. normalize() checks it.
  34: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&p.soccer&&typeof p.soccer==='object'&&!Array.isArray(p.soccer)&&!Array.isArray(p.soccer.tricks)) Object.assign(p.soccer,{tricks:[],trick:'t1',trickPay:{day:'',n:0}}); }); },
  // v1.54 Pet play: pet.toy (the fetch toy, section 55), stats.seeks / fetches. normalize() checks it.
  35: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&p.pet&&typeof p.pet==='object'&&!Array.isArray(p.pet)&&typeof p.pet.toy!=='string') p.pet.toy='ball'; }); }
};

// Hair ids from before v1.11 (one closet item per color) -> the color they had. They stay readable forever:
// old saves, old backups and old photocards (which keep the outfit they were made in) still draw the same hair.
const LEGACY_HAIR={swoopPurple:'purple',swoopPink:'pink',swoopStreak:'streak',swoopCandy:'candy'};

// Used for the saved data on load AND for restored backups, so both get the same fixes.
// (Per-profile defaults are filled in later by normalize() in section 6.)
function fixDB(d){
  if(!d||typeof d!=='object'||Array.isArray(d)) d=freshDB();
  let v=Number(d.version)||1;
  while(v<DB_VERSION){v++;if(MIGRATIONS[v])MIGRATIONS[v](d);}
  d.version=v; // a backup from a newer app keeps its higher number and extra fields
  d.settings=Object.assign({},DEFAULT_SETTINGS,d.settings||{});
  if(!/^\d{4}$/.test(String(d.settings.pin))) d.settings.pin='';
  d.settings.lastBackup=Math.max(0,Number(d.settings.lastBackup)||0);
  d.profiles=Array.isArray(d.profiles)?d.profiles.filter(p=>p&&typeof p==='object'):[];
  if(!d.profiles.some(p=>p.id===d.activeId)) d.activeId=null;
  return d;
}

let DB;
try{DB=JSON.parse(localStorage.getItem(SAVE_KEY));}catch(e){DB=null;}
DB=fixDB(DB);

function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(DB));}catch(e){toast('Hmm, could not save!');}}
function saveSoon(){clearTimeout(saveSoon.t);saveSoon.t=setTimeout(save,600);}
const P=()=>DB.profiles.find(p=>p.id===DB.activeId);

// ---------- Drawings store (Art Desk) ----------
// Drawings are too big for localStorage, so they live in IndexedDB. One record per drawing:
//   {id, profileId, created, updated, paper, ink, thumb}
//   ink   = the drawing itself (see-through image, data URL); paper = paper color id
//   thumb = small picture with the paper behind it (gallery + room posters)
// A record with draft:true is an unsaved drawing kept while the app is in the background.
// If IndexedDB is not available, drawings fall back to the localStorage key ART_LS (smaller limit),
// and move into IndexedDB automatically the next time it works.
const ART_DB='hangoutRoomArt', ART_LS='hangoutRoom.art';
let ART_THUMBS={}; // drawing id -> thumb, used to draw posters in the room
const ArtStore={
  mode:'', db:null, _ready:null,
  ready(){
    if(!this._ready) this._ready=new Promise(done=>{
      let settled=false; const finish=m=>{if(!settled){settled=true;this.mode=m;done();}};
      try{
        const q=indexedDB.open(ART_DB,1);
        q.onupgradeneeded=()=>{q.result.createObjectStore('art',{keyPath:'id'});};
        q.onsuccess=()=>{if(settled){q.result.close();return;}this.db=q.result;finish('idb');};
        q.onerror=e=>{try{e.preventDefault();}catch(_){}finish('ls');};
      }catch(e){finish('ls');}
      setTimeout(()=>finish('ls'),4000);
    }).then(()=>this._moveFromLS());
    return this._ready;
  },
  _moveFromLS(){
    const l=this._ls(); if(this.mode!=='idb'||!l.length) return;
    return this._tx('readwrite',s=>{l.forEach(r=>s.put(r));}).then(()=>localStorage.removeItem(ART_LS),()=>{});
  },
  _tx(mode,fn){return new Promise((ok,bad)=>{
    const t=this.db.transaction('art',mode), r=fn(t.objectStore('art'));
    t.oncomplete=()=>ok(r?r.result:undefined); t.onerror=t.onabort=()=>bad(t.error);
  });},
  _ls(){try{const l=JSON.parse(localStorage.getItem(ART_LS));return Array.isArray(l)?l:[];}catch(e){return [];}},
  _setLs(l){if(l.length)localStorage.setItem(ART_LS,JSON.stringify(l));else localStorage.removeItem(ART_LS);}, // throws when full
  all(){return this.ready().then(()=>this.mode==='idb'?this._tx('readonly',s=>s.getAll()):this._ls());},
  get(id){return this.ready().then(()=>this.mode==='idb'?this._tx('readonly',s=>s.get(id)):this._ls().find(r=>r.id===id));},
  put(rec){return this.ready().then(()=>{
    if(this.mode==='idb') return this._tx('readwrite',s=>{s.put(rec);});
    this._setLs(this._ls().filter(r=>r.id!==rec.id).concat([rec]));
  });},
  del(id){return this.delWhere(r=>r.id===id);},
  delWhere(test){return this.all().then(l=>{
    const ids=l.filter(test).map(r=>r.id); if(!ids.length) return;
    if(this.mode==='idb') return this._tx('readwrite',s=>{ids.forEach(i=>s.delete(i));});
    this._setLs(this._ls().filter(r=>!test(r)));
  });},
  replaceAll(list){return this.ready().then(()=>{
    if(this.mode==='idb') return this._tx('readwrite',s=>{s.clear();list.forEach(r=>s.put(r));});
    this._setLs(list);
  });}
};
