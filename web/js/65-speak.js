'use strict';
/* =========================================================
   65. SPOKEN INSTRUCTIONS (v1.70)
   Every screen, tab and game has one short line that says what to do, written for listening (short, no emoji).
   The line comes from here, not from the screen, so an Easy-mode screen that only shows "🔤 ❓" still says a sentence.
   speakLine() works out where she is (screen + tab / mode / view / puzzle) and returns {k, t}: k names the place, t is the line.
   🗣️ By itself: when the place changes (spkCheck, after every tap and every show()), while 🔊 Read to me is on for the room
      (🧸 Little and 🐣 Easy by default) and the sound is on (🔇 means quiet). Never during a Stage song, a Jam, or a Music or
      Dance Maker loop. tell(text) speaks a one-off line the same way: the buddy's bubble (say), a visitor's wish, try-again hints.
   🔊 Say it again: a round button in each screen's top bar (only when the device has a voice). It works even with Read to me
      off or the sound off, because she asked for it.
   A new screen, tab, mode or Brain game should get a line here (the smoke test checks every one).
   ========================================================= */
const SPK_FIXED={
  stagePaused:'Paused. Tap Keep going when you are ready.', // ⏸️ (v1.74)
  closet:'Tap a tab, then tap clothes to dress up your buddy.',
  art:'Pick a color and draw with your finger.',
  cardsMake:'Pick a stage and a frame, then save your photocard.',
  cardsBinder:'Here are your photocards. Tap one to see it big.',
  stickers:'Here are your stickers. Tap one to see how to get it.',
  music:'Tap the squares to make a beat, then tap play.',
  brMenu:'Pick a game! Every puzzle you solve the first time pays coins.',
  brDuo:'Take turns! Find the pairs. Tap two cards.',
  brFacts:'Here are your fact cards. Tap one to read it.',
  codePick:'Pick a puzzle. Help your buddy get to the carrot!',
  codeMake:'Make your own level! Tap a box to start one, or play a level from your family.',
  codeEdit:'Paint your map. Then tap test it, and solve it yourself to save it.',
  stagePick:'Pick a song! ',
  littleMenu:'Pick something to play!',
  littlePick:'Pick a picture to color.',
  littleColor:'Pick a crayon, then tap the picture to color it.',
  littleMat:'Tap the pads to make music!',
  walkPick:'Pick a path for your walk.',
  walkBook:'Here is everything you found on your walks.',
  runwayCards:'Pick a card. Then dress up to match it.',
  runwayDress:'Dress up for the card, then tap walk.'};
// Fractions said as words: 1/2 = one half, 3/4 = 3 fourths.
const SPK_FRAC={2:'half',3:'third',4:'fourth',5:'fifth',6:'sixth',8:'eighth',10:'tenth',12:'twelfth'};
function spkFrac(a,b){const w=SPK_FRAC[b];if(!w)return a+' out of '+b;return Number(a)===1?'one '+w:a+' '+(w==='half'?'halves':w+'s');}
const SPK_WORDS={'🪙':' coins ','⭐':' star ','❓':' question block ','✋':' hide ','👀':' peek ','🔁':' repeat block ','×':' times '};
function spkClean(t){
  t=String(t||'').replace(/(\d+)\s*\/\s*(\d+)/g,(m,a,b)=>spkFrac(a,b));
  for(const [k,v] of Object.entries(SPK_WORDS)) t=t.split(k).join(v);
  return t.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}\u{1F3FB}-\u{1F3FF}]/gu,' ').replace(/[✔✖⬅➜•·…]/g,' ')
    .replace(/\s+([.,!?])/g,'$1').replace(/\s+/g,' ').replace(/^[\s.,!?]+/,'').trim();
}
const spkText=sel=>{const e=$(sel);return e?e.textContent:'';};
const SPK_IDS=new WeakMap(); let spkNextId=1;
const spkId=o=>{if(!o||typeof o!=='object')return String(o);if(!SPK_IDS.has(o))SPK_IDS.set(o,spkNextId++);return 'o'+SPK_IDS.get(o);};

// One line per Brain game: (pz, lvl) → sentence. Word Builder says the word, as it did before (it used to say it by itself).
const BR_SPEAK={
  snack:(pz,l)=>l==='easy'?`How many ${SNACK_NAMES[pz.it]}?`:l==='medium'?'How many treats in this order? Add them up.':pz.q,
  memory:pz=>`Find the ${pz.length} pairs! Tap two cards.`,
  pop:(pz,l)=>l==='easy'?`Pop every bubble with ${pz.t}.`:l==='medium'?`Pop two bubbles that make ${pz.t}.`:`Pop every number that goes into ${pz.t} evenly.`,
  train:(pz,l)=>l==='hard'?'Which number goes in the empty wagon?':'Which wagon goes in the empty spot?',
  word:(pz,l)=>{const w=pz.w.toLowerCase();
    if(pz.bank) return l==='easy'?`Copy the word ${w}. Tap the letters in order.`:WB.look?`Look at the word ${w}. Then tap hide and spell it.`:`Listen and spell the word. ${w}.`;
    return l==='easy'?`What letter does ${w} start with?`:l==='medium'?`Tap the letters to spell ${w}.`:`Spell the word. ${w}.`;},
  bake:(pz,l)=>l==='easy'?`Which one is cut into ${pz.n} equal pieces?`:l==='medium'?`Put toppings on ${spkFrac(pz.a,pz.b)} of the ${pz.k}. Tap the pieces, then tap done.`:pz.q,
  facts:pz=>pz.q,
  search:(pz,l)=>`Find the ${pz.w.split(" ").length} hidden words. Slide your finger from the first letter to the last.`}; // v1.90
const brPz=()=>BR.free?BR.free.pz:(BRAIN_GAMES[BR.game]&&BRAIN_GAMES[BR.game].puzzles[BR.lvl]||[])[BR.idx];
const CL_SPEAK={
  easy:'Tap the arrows to make a path to the carrot. Then tap play.',
  medium:'Make a path to the carrot. A repeat block does the next move again.',
  hard:'Make a path to the carrot. Use repeat blocks to save space.',
  move:'Put arrows in My Move. Then use the sparkle block to do your move.',
  if:'Put the question block in front of an arrow to hop over a puddle.',
  challenge:'Use My Move to get to the carrot.',
  make:'Make a path to the carrot on this home made level.'};
function clSpeak(lvl,pz){return (CL_SPEAK[lvl]||CL_SPEAK.easy)+(pz&&pz.map&&pz.map.join('').includes('*')?' Pick up every star first.':'');}

// Where she is, and what to say there. Busy moments keep the place's key with no words.
function speakLine(){
  const p=cur==='profiles'?null:P(); if(!p) return null;
  switch(cur){
    case 'room': return lockOn()&&!SPY.on&&!PP.on?{k:'room:lock'+roomNo,t:lockLine()}:null; // 🧸 Little mode's home (section 66)
    case 'closet': return {k:'closet',t:SPK_FIXED.closet};
    case 'art': return {k:'art',t:SPK_FIXED.art};
    case 'cards': return CARD.view==='make'?{k:'cards:make',t:SPK_FIXED.cardsMake}:{k:'cards:binder',t:SPK_FIXED.cardsBinder};
    case 'stickers': return {k:'stickers',t:SPK_FIXED.stickers};
    case 'fidget': return {k:'fid:'+fidTab,t:spkText(`#fid-${fidTab} .fid-tip`)};
    case 'soccer': return {k:'soc:'+(TGS.on?'duo':socMode()),t:spkText('#socTip')};
    case 'ball': return {k:'ball:'+(BDL.on?'duo':bfMode()),t:spkText('#bfTip')};
    case 'stage':
      if(STG.state==='play'&&STG.paused==='wait') return {k:'stage:paused',t:SPK_FIXED.stagePaused}; // ⏸️ (v1.74)
      if(STG.state==='play'||STG.state==='jam') return {k:'stage:busy',t:''};
      if(JAM.pick) return {k:'stage:jam',t:spkText('#jamHint')};
      return {k:'stage:pick'+(TGT.on?':duo':''),t:SPK_FIXED.stagePick+spkText('#stgHint')};
    case 'code':
      if(CL.view==='pick') return {k:'code:pick',t:SPK_FIXED.codePick};
      if(CL.view==='make') return {k:'code:make',t:SPK_FIXED.codeMake}; // 🛠️ (v1.78)
      if(CL.view==='edit') return {k:'code:edit',t:SPK_FIXED.codeEdit};
      return {k:'code:'+CL.lvl+':'+(CL.free?spkId(CL.free):CL.idx),t:clSpeak(CL.lvl,clPz())};
    case 'brain':
      if(BR.view==='menu') return {k:'br:menu',t:SPK_FIXED.brMenu};
      if(BR.view==='duo') return {k:'br:duo',t:SPK_FIXED.brDuo};
      if(BR.view==='facts') return {k:'br:facts',t:SPK_FIXED.brFacts};
      if(BR.view==='play'){const pz=brPz(),f=BR_SPEAK[BR.game];if(!pz||!f)return null;
        return {k:'br:'+BR.game+':'+BR.lvl+':'+(BR.free?spkId(BR.free):BR.idx)+(pz.bank&&WB.look?':look':''),t:f(pz,BR.lvl)};}
      return null;
    case 'music': return MU.playing?{k:'music',t:''}:{k:'music',t:SPK_FIXED.music};
    case 'dance': return DN.playing?{k:'dance',t:''}:{k:'dance',t:spkText('#dnHint')};
    case 'garden': return {k:'garden',t:spkText('#gdHint')};
    case 'kitchen': return kcSpeak(); // 🍳 (section 79, v1.91)
    case 'walk': return WK.view==='pick'?{k:'walk:pick',t:SPK_FIXED.walkPick}:WK.view==='book'?{k:'walk:book',t:SPK_FIXED.walkBook}:{k:'walk:walk',t:spkText('#wkTip')};
    case 'runway': return RW.view==='cards'?{k:'rw:cards',t:SPK_FIXED.runwayCards}:RW.view==='dress'?{k:'rw:dress',t:SPK_FIXED.runwayDress}:{k:'rw:walk',t:''};
    case 'little': return LT.view==='menu'?{k:'lt:menu',t:SPK_FIXED.littleMenu}:LT.view==='colorPick'?{k:'lt:pick',t:SPK_FIXED.littlePick}
      :LT.view==='color'?{k:'lt:color',t:SPK_FIXED.littleColor}:LT.view==='mat'?{k:'lt:mat',t:SPK_FIXED.littleMat}:{k:'lt:'+LT.view,t:''}; // 👀 Peekaboo speaks by itself
  }
  return null;
}
const socMode=()=>typeof socTrick==='function'&&socTrick()?'trick':P().soccer.mode==='keep'?'keep':'kick';

// May it speak by itself now? Read to me on, the sound on, and not over music.
function spkAuto(){
  const p=cur==='profiles'?null:P();
  if(!p||!canSpeak()||!readOn(p)||!DB.settings.sound) return false;
  if(cur==='stage'&&((STG.state==='play'&&STG.paused!=='wait')||STG.state==='jam')) return false;
  return !(MU.playing||DN.playing);
}
let spkToldAt=0; // so the tapped button's name doesn't cut off what was just told (section 34)
function tell(text){const t=spkClean(text);if(t&&spkAuto()){speakText(t);spkToldAt=Date.now();}}
let spkLast='';
// After a tap or a new screen: if she is somewhere new, say its line. Returns true when it spoke (so a button's name isn't said too).
function spkCheck(){
  sayBtns();
  const L=speakLine(), k=L?L.k:'';
  if(k===spkLast) return false;
  spkLast=k;
  if(!L||!L.t||!spkAuto()) return false;
  speakText(spkClean(L.t)); return true;
}
function spkAgain(){const L=speakLine();const t=L&&spkClean(L.t);if(t)speakText(t);else SFX.click();}

/* ---------- 🔊 say it again: one round button in each top bar ---------- */
$$('.screen').forEach(s=>{
  if(s.id==='scr-profiles'||s.id==='scr-room'||s.id==='scr-about') return;
  const bar=s.querySelector('.topbar'), title=bar&&bar.querySelector('.title'); if(!title) return;
  title.insertAdjacentHTML('afterend','<button class="btn small ghost say-btn hidden" aria-label="Say it again">🔊</button>');
});
function sayBtns(){const on=canSpeak();$$('.say-btn').forEach(b=>b.classList.toggle('hidden',!on));}
document.addEventListener('click',e=>{const b=e.target.closest('.say-btn');if(!b)return;e.stopPropagation();spkAgain();});
if(window.speechSynthesis) try{window.speechSynthesis.addEventListener('voiceschanged',sayBtns);}catch(_){}
sayBtns();
