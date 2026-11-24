'use strict';
/* =========================================================
   64. FIRST-TIME SETUP + LEVEL BANDS (v1.69)
   🎚️ Level bands: each room has p.band ('little' | 'easy' | 'normal' | 'challenge'), picked by a grown-up in the New Room
      box, ✏️ Change Room and ⚙️ Settings (icons and names only, no ages). p.easy stays saved and follows the band (on for
      Little and Easy), so everything that reads Easy mode keeps working and older app versions still understand a backup.
      normalize() (06) fills the band in from p.easy. Band ids are saved: never rename them.
      - Challenge: when a room becomes Challenge, every game with no progress yet starts on Medium (bandFresh).
      - 🎲 Brain Games Free Play pays its +2 (no cap) only at the band's level or above (bandThink); easier ones pay
        +1 from Free Play's 10 a day (section 44).
   👋 First-time setup: only on a device with no rooms whose setup was never finished (settings.setupDone, ms; it belongs to
      the device, so Restore keeps it, like the PIN). Welcome → 🔒 PIN → 🏠 the room → 🔊 voice test → 💾 backups. Every step
      can be skipped. ⚙️ Settings → 🧰 Grown-up setup runs the PIN, voice and backup steps again.
   💾 Backup reminder: a small grown-up line on the rooms screen when the last backup (or the setup) is 30+ days old.
   ========================================================= */
const BANDS={
  little:{icon:'🧸',name:'Little',say:'Big buttons, no reading needed',easy:true,lvl:'easy'},
  easy:{icon:'🐣',name:'Easy',say:'Easy games, and it reads to you',easy:true,lvl:'easy'},
  normal:{icon:'⭐',name:'Normal',say:'Each game remembers its level',easy:false,lvl:'medium'},
  challenge:{icon:'🔥',name:'Challenge',say:'New games start on Medium',easy:false,lvl:'hard'}};
const BAND_IDS=Object.keys(BANDS);
const BAND_LV=['easy','medium','hard'];
// If the band and Easy mode disagree (Easy mode was switched some other way), Easy mode wins, as in normalize() (06).
const bandOf=p=>!p?'normal':BANDS[p.band]&&BANDS[p.band].easy===!!p.easy?p.band:(p.easy?'easy':'normal');
// Free Play's +2 counts at the band's level or harder (bandThink); below it, the +1 from the daily 10.
const bandThink=(p,lvl)=>BAND_LV.indexOf(lvl)>=BAND_LV.indexOf(BANDS[bandOf(p)].lvl);

// A game "has progress" once it has a best score, a prize or a solved puzzle. Only games with none move to Medium.
function bandFresh(p){
  const none=o=>!Object.values(o||{}).some(v=>v&&(typeof v!=='object'||Object.keys(v).length));
  const go=(o,k)=>{if(o[k]==='easy')o[k]='medium';};
  if(none(p.soccer.best)&&!p.soccer.trophies.length) go(p.soccer,'level');
  if(none(p.soccer.keep.best)&&!p.soccer.keep.gloves.length) go(p.soccer.keep,'level');
  ['bat','catch'].forEach(g=>{const x=p.ball[g];if(x&&none(x.best)&&!x.prizes.length)go(x,'level');});
  if(none(p.stage.best)) go(p.stage,'level');
  if(!p.code.solved.length) go(p.code,'level');
  Object.keys(p.brain.level).forEach(g=>{if(!p.brain.solved.some(id=>id.startsWith(g+':')))go(p.brain.level,g);});
  if(!p.stats.spied&&p.spy.lvl===1) p.spy.lvl=2;
}
function setBand(p,b){
  if(!BANDS[b]) return;
  const was=bandOf(p); p.band=b; p.easy=BANDS[b].easy;
  if(b==='challenge'&&was!=='challenge') bandFresh(p);
  if(b!==was&&(b==='little'||was==='little')) p.little.lock=b==='little'; // 🧸 Little mode follows the Little band (section 66)
  save();
}
// The 4 big buttons with a line saying what the picked one does (New Room, Change Room, Settings).
function bandPick(id,cur){return `<div class="bandpick" id="${id}">${BAND_IDS.map(k=>`<button data-band="${k}" class="${k===cur?'on':''}" aria-label="${BANDS[k].name}"><i>${BANDS[k].icon}</i><span>${BANDS[k].name}</span></button>`).join('')}</div>`
  +`<div class="band-say" id="${id}Say">${BANDS[cur].say}</div>`;}
function bandWire(id,set){
  const row=$('#'+id); if(!row) return;
  row.onclick=e=>{const b=e.target.closest('[data-band]');if(!b)return;SFX.click();set(b.dataset.band);
    $$('#'+id+' button').forEach(x=>x.classList.toggle('on',x===b));const s=$('#'+id+'Say');if(s)s.textContent=BANDS[b.dataset.band].say;};
}
// ⚙️ Settings → the room's level (asks for the PIN when one is set).
function bandModal(){
  const p=P(); if(!p) return; let b=bandOf(p), lk=lockSet(p);
  modal('🎚️ Level',`<p style="text-align:center;margin:0 0 6px">How hard things are in this room.</p>${bandPick('stBand',b)}${lockRow(lk)}`,
    [{text:'Cancel',cls:'ghost',on:settingsModal},{text:'Save',cls:'pink',on:()=>{const was=lockSet(p);setBand(p,b);p.little.lock=lk;save();
      if(lk&&!was){LOCK.open=p.id;setTimeout(()=>toast('🧸 Little mode is on. Tap 🔒 Lock in the room when you are done.'),300);} // a grown-up is here: it locks when they tap 🔒
      applyEasy();applyLock();if(cur==='room')renderRoom();SFX.happy();settingsModal();}}]);
  // picking Little turns Little mode on; leaving Little turns it off (the switch can still change it)
  bandWire('stBand',v=>{b=v;lk=v==='little'?true:bandOf(p)==='little'?false:lockSet(p);lockRowSet(lk);});
  $('#stLock').onclick=()=>{SFX.click();lk=!lk;lockRowSet(lk);};
}

/* ---------- 👋 first-time setup ---------- */
let setupSkipped=false;
const needSetup=()=>!DB.settings.setupDone&&!DB.profiles.length&&!setupSkipped;
function setupCheck(){if(needSetup())setupStart();}
function setupStart(){
  modal('👋 Hi, grown-up!',`<div class="setup-txt"><p>This app is a gift: a cozy room with a buddy, games, fidgets and things to make.</p>`
    +`<p>Everything stays on this device. There is no internet use, no ads, no chat and no buying with real money.</p>`
    +`<p>Let's set it up together. It takes about a minute.</p></div>`,
    [{text:'Skip',cls:'ghost',on:()=>{setupSkipped=true;}},{text:'📂 I have a backup',cls:'ghost',on:restoreModal},{text:'Start ✨',cls:'pink',on:()=>setupPin(false)}]);
}
// again = from ⚙️ Settings (the room already exists): PIN → voice → backups.
function setupPin(again){
  const next=()=>again?setupVoice(true):roomModal(null,()=>setupVoice(false),setupStart);
  if(DB.settings.pin){if(again)modal('🔒 Grown-up PIN','<div class="setup-txt"><p>The PIN is on ✔</p></div>',[{text:'Next ▶',cls:'pink',on:next}]);else next();return;}
  modal('🔒 Grown-up PIN',`<div class="setup-txt"><p>A 4-digit PIN stops little hands from deleting a room, restoring a backup or changing a room's level.</p>`
    +`<p>Only grown-ups need it. It is optional, and you can set it later in ⚙️ Settings.</p></div>`,
    [{text:'Skip',cls:'ghost',on:next},{text:'🔒 Set a PIN',cls:'pink',on:()=>newPin(next)}]);
}
const SETUP_NO_VOICE=`<p>To add a voice (free, and it works offline):</p><ul class="setup-list">`
  +`<li><b>iPad / iPhone:</b> Settings → Accessibility → Spoken Content → Voices → English. Pick a voice and download it.</li>`
  +`<li><b>Android:</b> Settings → Text-to-speech, and pick an English voice.</li></ul><p>Then close the app and open it again.</p>`;
function setupVoice(again){
  const p=P(), done=()=>setupBackup(again);
  if(!p){done();return;}
  if(!canSpeak()){
    modal('🔊 Read to me',`<div class="setup-txt"><p>This device has no voice the app can use yet, so 🔊 Read to me stays off. Everything else works.</p>${SETUP_NO_VOICE}</div>`,
      [{text:'Next ▶',cls:'pink',on:done}]);
    return;
  }
  const hi=()=>speakText(`Hi ${p.name}! I'm ${p.mascotName||'your buddy'}!`);
  modal('🔊 Can you hear me?',`<div class="setup-txt"><p>Turn the sound up. ${esc(p.mascotName||'The buddy')} is saying hello.</p>`
    +`<p>🔊 Read to me says what a button is when it is tapped. It is on for 🧸 Little and 🐣 Easy rooms.</p></div>`,
    [{text:'✖ Nothing',cls:'ghost',on:()=>modal('🔇 No voice?',`<div class="setup-txt"><p>Check the volume. Then try again.</p>${SETUP_NO_VOICE}</div>`,
        [{text:'🔁 Try again',cls:'ghost',on:()=>setupVoice(again)},{text:'Next ▶',cls:'pink',on:done}])},
     {text:'🔁 Again',cls:'ghost',keep:true,on:hi},{text:'✔ I heard it',cls:'pink',on:done}]);
  hi();
}
function setupBackup(again){
  const home=onIOS()&&!IS_STANDALONE?`<p>📲 <b>Open it from the Home Screen:</b> in Safari tap Share → Add to Home Screen. Then it works offline and keeps the room safer.</p>`:'';
  modal('💾 Keep the room safe',`<div class="setup-txt"><p>The room lives only on this device. Deleting the app or clearing the browser's data erases it.</p>`
    +`<p>Make a backup now and then: ⚙️ Settings → 💾 Backup &amp; Restore. Keep the file somewhere safe.</p>${home}</div>`,
    [{text:'Later',cls:'ghost',on:()=>setupFinish(again)},{text:'💾 Back up now',cls:'pink',on:backupModal}]);
}
function setupFinish(again){if(!again&&cur==='room'){say('All set! Let\'s hang out ✨');
  if(lockOn())setTimeout(()=>toast('🧸 Little mode is on. To leave it, press and hold 🔒 at the top.'),1500);}} // section 66

/* ---------- 💾 backup reminder (rooms screen only) ---------- */
const BK_NAG_DAYS=30;
function bkNagDue(){
  const s=DB.settings, base=Math.max(Number(s.lastBackup)||0,Number(s.setupDone)||0);
  return DB.profiles.length>0&&base>0&&Date.now()-base>BK_NAG_DAYS*86400000;
}
function bkNag(){const b=$('#bkNag');if(b)b.classList.toggle('hidden',!bkNagDue());}
$('#bkNag').onclick=()=>{SFX.click();backupModal();};
