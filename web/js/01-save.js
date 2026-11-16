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
const APP_VERSION='1.21';   // shown in Settings; bump with every PR (matches versionName in android/app/build.gradle.kts)
const SAVE_KEY='hangoutRoom.v1'; // never change: her saves live under this key
const DB_VERSION=13;          // version of the save-data shape; bump only when the shape changes
// stageOffset = "Sound late?" on the Stage, in ms (per device, because it depends on the speaker)
// pin = the optional grown-up PIN ('' = none, else 4 digits). It stays with the device: restoring a backup keeps it.
const DEFAULT_SETTINGS={sound:true,music:false,backupArt:true,stageOffset:0,pin:''};

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
  // v1.11 Hair styles + colours: look.hair is now a style and look.hairColor a HAIR_COLORS id. The old coloured swoops
  // become the Emo Swoop style ('swoopBlack') in that colour, and owning one gives that colour (owned 'hairc:<id>').
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
  // (off for rooms made before v1.20, so they look the same) and p.furn (furniture colours; empty = the classic colours).
  13: d=>{ if(Array.isArray(d.profiles)) d.profiles.forEach(p=>{ if(p&&typeof p==='object'&&typeof p.tint!=='boolean') p.tint=false; }); }
};

// Hair ids from before v1.11 (one closet item per colour) -> the colour they had. They stay readable forever:
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
//   ink   = the drawing itself (see-through image, data URL); paper = paper colour id
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
