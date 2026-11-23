'use strict';
/* =========================================================
   45. WORD BANK (v1.45): 🎲 Free Play and 📅 Puzzle of the Day for 🔤 Word Builder
   The owner's spelling list by age (American spelling): Easy = ages 3-5 (3 to 5 letters), Medium = ages 6-8 (up to 9),
   Hard = ages 9-13 (up to 11). Left out on purpose: 1-2 letter words, homophones (they need a sentence), and a few words
   that don't suit a kids' app. A made-up word puzzle is {bank:1, w, x, pic}: w = the word, x = extra letters, pic = a
   picture when there is a good one (an emoji old Android shows, or a memPic id), else ''.
   Easy (trace): the letters show faintly in the slots; she taps them in order. Medium and Hard (listen, spell): since v1.66
   the word starts hidden and is said aloud; she spells it, and 👀 Peek shows it any time (✋ hides it again; no timer,
   progress is kept). With no voice (canSpeak() false) it starts by showing the word, as before.
   🔊 says the word (on the tablet). The 8 fixed Word Builder puzzles per level are unchanged (section 35).
   ========================================================= */
const WB_BANK={
  easy:('cat hat bat mat rat sat pan man fan ran van bag rag tag map cap nap dad mad sad jam ham '
    +'bed fed pen hen men wet pet net jet get let leg peg web yes beg '
    +'pig big dig wig fig sit hit bit fit kit pin win fin tin lip hip zip dip mix fix kid lid him '
    +'dog log fog hog jog hot pot dot got not top hop mop pop box fox mom job rod '
    +'bug hug mug rug jug cup pup sun run fun bun cut hut nut but bus tub cub gum mud '
    +'the and see she you look like said was are for here play '
    +'red blue pink tan gray black green white brown '
    +'one two three four five six seven eight nine ten '
    +'cow owl bee ant egg toy car ball tree book cake'),
  medium:('stop step spin spot snap swim skip sled slip flag flat frog from drum drip grab grass clap club crab trip truck plan plum brick glad glass spell '
    +'hand sand band land pond jump lamp camp milk desk nest best fast last list gift help belt tent went '
    +'ship shop fish dish wish shell chip chin chat much lunch bench thin thick bath with math this that them when what which whip duck back sock kick rock neck ring sing king long song '
    +'make take game name same gate plate cape wave shape bike kite time ride hide smile line home hope rope nose bone note stone cute mule huge tube rule flute '
    +'rain train paint tail mail say stay way tray sheep sleep street need week seed eat sea read team beach leaf dream boat coat road soap goat snow show grow slow yellow light night right high bright glue true '
    +'star far park farm card shark her fern bird girl first shirt dirt corn fork horn storm short more store fur burn turn hurt nurse '
    +'moon food spoon room zoo good cook foot wood out house mouse cloud loud found now how down town clown coin boil oil point boy joy enjoy saw draw paw straw '
    +'jumped played helped wanted looked stopped running sitting swimming making riding hoping '
    +'sunshine rainbow cupcake football baseball sandbox bedroom inside outside airplane snowman backpack birthday popcorn homework something '
    +'about after again always any around because been before could does every friend give goes many never only other people pretty put their there they very want were where who would write your once buy done '
    +'monday tuesday wednesday thursday friday saturday sunday january february march april may june july august september october november december '
    +'robot rocket slime goal ghost comet'),
  hard:('unhappy unlock unusual redo rewrite return review preview prepare disagree dislike disappear misspell mistake nonstop nonfiction impossible impatient incorrect invisible irregular overcome underground submarine transport interrupt semicircle '
    +'careful beautiful thankful careless fearless kindness happiness darkness friendship movement agreement government enjoyment comfortable valuable responsible possible visible education celebration information invention vacation decision television musician dangerous famous nervous curious quickly finally easily usually '
    +'beginning forgetting planned admitted preferred occurred controlled shining writing coming changing believing arriving hurried carried studied families cities ladies happiest easier earliest '
    +'believe piece field chief niece receive ceiling deceive weight height weird either '
    +'knife knee knock know wrong wrist thumb climb lamb comb island listen castle whistle ghost honest hour answer '
    +'phone photograph alphabet elephant laugh cough enough tough rough through though thought caught daughter '
    +'accommodate achieve across address apparent argument business calendar category committee conscience conscious definitely embarrass environment exaggerate foreign grammar guarantee immediately independent judgment knowledge library license maintenance mischievous necessary noticeable occasion parallel separate sincerely special surprise temperature tomorrow truly until vacuum '
    +'color favorite neighbor honor humor behavior flavor labor center theater meter fiber organize realize apologize recognize analyze traveled canceled jewelry program catalog defense offense tire curb aluminum pajamas plow mustache '
    +'hypothesis experiment observe evidence energy gravity molecule organism ecosystem '
    +'equation fraction decimal percent perimeter diameter multiply divide quotient symmetry '
    +'geography democracy continent history culture paragraph sentence character vocabulary summary adjective adverb pronoun '
    +'dinosaur volcano galaxy astronaut telescope')
};
Object.keys(WB_BANK).forEach(l=>{WB_BANK[l]=[...new Set(WB_BANK[l].trim().split(/\s+/).map(w=>w.toUpperCase()))];});
// Pictures for words that have a clear one (emoji that old Android tablets show, or a drawing from the app).
const WB_PICS={CAT:'🐱',HAT:'🎩',BAT:'d:bat',RAT:'🐀',VAN:'🚐',BAG:'👜',MAP:'🗺️',BED:'🛏️',HEN:'🐔',JET:'✈️',WEB:'🕸️',EGG:'🥚',PIG:'🐷',PIN:'📌',
  LIP:'👄',DOG:'🐶',FOX:'🦊',HOT:'🔥',BOX:'📦',BUG:'🐛',MUG:'☕',CUP:'☕',PUP:'🐶',SUN:'☀️',BUS:'🚌',NUT:'🥜',COW:'🐮',OWL:'🦉',BEE:'🐝',ANT:'🐜',
  TOY:'🧸',CAR:'🚗',BALL:'⚽',TREE:'🌳',BOOK:'📖',CAKE:'🎂',ONE:'1',TWO:'2',THREE:'3',FOUR:'4',FIVE:'5',SIX:'6',SEVEN:'7',EIGHT:'8',NINE:'9',TEN:'10',
  FROG:'🐸',CRAB:'🦀',TRUCK:'🚚',DRUM:'🥁',FLAG:'🚩',FISH:'🐟',DUCK:'🦆',RING:'💍',KING:'👑',BIKE:'🚲',HOME:'🏠',RAIN:'🌧️',TRAIN:'🚂',SHEEP:'🐑',
  BOAT:'⛵',GOAT:'🐐',SNOW:'❄️',STAR:'⭐',SHARK:'d:sharkBean',BIRD:'🐦',CORN:'🌽',MOON:'d:moon',MOUSE:'🐭',CLOUD:'☁️',CLOWN:'🤡',RAINBOW:'🌈',
  CUPCAKE:'🧁',FOOTBALL:'🏈',SNOWMAN:'⛄',AIRPLANE:'✈️',POPCORN:'🍿',ROBOT:'d:robotPal',ROCKET:'d:toyRocket',GHOST:'d:ghost',HOUSE:'🏠',
  ELEPHANT:'🐘',DINOSAUR:'d:dinoPlush',VOLCANO:'🌋',TELESCOPE:'🔭',GALAXY:'🌌',CASTLE:'🏰',ISLAND:'🏝️',PHONE:'📱',THUMB:'👍',TELEVISION:'📺'};
const WB_MAX={easy:5,medium:9,hard:11};

FP_MAKERS.word={
  make(r,l){
    const w=fpPick(r,WB_BANK[l]), n=l==='easy'?2:l==='medium'?3:fpInt(r,3,4);
    const extra=fpMix(r,'ABCDEFGHIKLMNOPRSTUVWY'.split('').filter(c=>!w.includes(c))).slice(0,n).join('');
    return {bank:1,w,x:extra,pic:WB_PICS[w]||''};
  },
  ok(z,l){
    return !!z&&z.bank===1&&/^[A-Z]+$/.test(z.w)&&z.w.length>=3&&z.w.length<=WB_MAX[l]&&WB_BANK[l].includes(z.w)
      &&/^[A-Z]+$/.test(z.x)&&new Set(z.x).size===z.x.length&&[...z.x].every(c=>!z.w.includes(c));
  }
};
FP_BRAIN.push('word');   // 🎲 in Word Builder too
FP_THINK.push('word');   // and it pays +2 with no cap (v1.57)
POTD_GAMES.push('word'); // and the 📅 daily turn has 6 games

/* ---------- playing a word from the bank ---------- */
const wbStartFixed=BRAIN_GAMES.word.start;
BRAIN_GAMES.word.start=function(pz,l,idx){if(pz&&pz.bank)wbBankStart(pz,l);else wbStartFixed.call(this,pz,l,idx);};
function wbBankStart(pz,l){
  const trace=l==='easy', word=pz.w.toLowerCase();
  WB={got:0,look:!trace&&!canSpeak()};   // with a voice the word starts hidden (v1.66)
  const say=canSpeak()?`<button class="btn small ghost wb-say" aria-label="${word}">🔊</button>`:'';
  const pic=pz.pic?`<button class="wb-pic" aria-label="${word}">${wbPic(pz.pic)}</button>`:'';
  $('#brQ').innerHTML=`<div class="br-card"><div class="br-ask" id="wbAsk"></div>${pic}<div class="wb-look" id="wbLook">${pz.w}</div>`
    +`<div class="wb-slots">${[...pz.w].map((c,i)=>`<span class="wb-slot" data-s="${i}">${trace?`<i>${c}</i>`:''}</span>`).join('')}</div>`
    +`<div class="wb-btns">${trace?'':`<button class="btn pink" id="wbHide" aria-label="Hide it">✋ <span>Hide it</span></button><button class="btn ghost" id="wbPeek" aria-label="Peek">👀 <span>Peek</span></button>`}${say}</div></div>`;
  $('#brBoard').innerHTML=`<div class="br-choices wb-tiles">`+brShuffle([...pz.w,...pz.x],BR.free?BR.free.key:pz.w)
    .map((c,i)=>`<button class="br-ch wb-tile" data-c="${c}" data-k="${i}" aria-label="${c}"><b>${c}</b></button>`).join('')+`</div>`;
  wbLookView(l);
  $('#brQ').onclick=e=>{
    if(e.target.closest('.wb-say,.wb-pic')) wbSay(pz.w);
    else if(e.target.closest('#wbHide')){WB.look=false;SFX.whoosh();wbLookView(l);}
    else if(e.target.closest('#wbPeek')){WB.look=true;SFX.click();wbLookView(l);}
  };
  $('#brBoard').onclick=e=>{const b=e.target.closest('[data-c]');if(!b||BR.won||WB.look||b.classList.contains('used'))return;wbBankTap(pz,b);};
  wbSay(pz.w);
}
// Look (the word and ✋) or spell (the slots, the letters and 👀). Easy is always "spell", with the letters traced.
function wbLookView(l){
  const p=P(), look=WB.look, trace=l==='easy', q=s=>$('#brQ '+s);
  q('#wbLook').classList.toggle('hidden',!look);
  q('.wb-slots').classList.toggle('hidden',look);
  $('#brBoard .wb-tiles').classList.toggle('hidden',look);
  if(q('#wbHide')) q('#wbHide').classList.toggle('hidden',!look);
  if(q('#wbPeek')) q('#wbPeek').classList.toggle('hidden',look);
  q('#wbAsk').textContent=p.easy?(look?'👀':'🔤'):trace?'Copy the word! Tap the letters in order.'
    :look?'Look at the word. Then tap ✋ Hide it and spell it!':canSpeak()?'Listen and spell the word! Tap 👀 to peek.':'Spell the word! Tap 👀 to peek.';
}
function wbBankTap(pz,b){
  const want=pz.w[WB.got];
  if(b.dataset.c!==want){brOops(b);return;}
  b.classList.add('used'); SFX.pop();
  const s=$(`#brQ .wb-slot[data-s="${WB.got}"]`); if(s){s.textContent=want;s.classList.add('on');}
  WB.got++;
  if(WB.got===pz.w.length){SFX.happy();wbSay(pz.w);brWin();} else if(!P().easy) brSay(`${WB.got} / ${pz.w.length}`);
}
