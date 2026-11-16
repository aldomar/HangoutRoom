// Smoke test for Hangout Room. Run from the repo folder:   node tests/smoke-test.js
// Needs only Node 22+ (built-in WebSocket) and an installed Chrome or Edge. Nothing to install.
// It starts a hidden (headless) browser with a fresh, empty profile, so it never touches real saves.
// It makes a test room, uses every screen and the Art Desk, and fails on any console error.
// Screenshots go to tests/shots/ (not committed) so you can look at the layouts.
// If the browser isn't found, set CHROME to its path, e.g.  CHROME="C:/path/to/chrome.exe" node tests/smoke-test.js
const {spawn}=require('child_process'), fs=require('fs'), path=require('path'), os=require('os'), {pathToFileURL}=require('url');
const OUT=path.join(__dirname,'shots'); fs.mkdirSync(OUT,{recursive:true});
const CHROME=[process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  path.join(process.env.LOCALAPPDATA||'','Google/Chrome/Application/chrome.exe'),
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium'
].find(p=>p&&fs.existsSync(p));
if(!CHROME){console.error('Could not find Chrome or Edge. Set CHROME to the browser path.');process.exit(2);}
const URL=pathToFileURL(path.join(__dirname,'..','index.html')).href;
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'hangout-test-'));
const ch=spawn(CHROME,['--headless=new','--remote-debugging-port=9333','--user-data-dir='+prof,'--no-first-run','--window-size=1180,820','about:blank']);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ws,id=0; const pend={}; const errors=[];
function send(method,params={}){return new Promise((res,rej)=>{const i=++id;pend[i]={res,rej};ws.send(JSON.stringify({id:i,method,params}));});}
async function ev(expr){const r=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error('eval: '+JSON.stringify(r.exceptionDetails).slice(0,400));return r.result.value;}
async function shot(name){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(OUT+'/'+name+'.png',Buffer.from(r.data,'base64'));}
async function mouse(type,x,y){await send('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons:type==='mouseReleased'?0:1,clickCount:1});}
async function stroke(pts){await mouse('mousePressed',pts[0][0],pts[0][1]);for(const [x,y] of pts.slice(1))await mouse('mouseMoved',x,y);const l=pts[pts.length-1];await mouse('mouseReleased',l[0],l[1]);}
async function padRect(){return ev(`(()=>{const r=document.querySelector('#artCv').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};})()`);}
function wave(r,fy,amp){const p=[];for(let i=0;i<=30;i++){const t=i/30;p.push([r.x+r.w*(0.1+0.8*t),r.y+r.h*fy+Math.sin(t*12)*amp]);}return p;}
let ok=0,bad=0; function check(name,cond,extra){if(cond){ok++;console.log('  ok  '+name);}else{bad++;console.log('  FAIL '+name+(extra!==undefined?' -> '+JSON.stringify(extra):''));}}

(async()=>{
  let tabs; for(let i=0;i<40;i++){try{tabs=await (await fetch('http://127.0.0.1:9333/json')).json();if(tabs.find(t=>t.type==='page'))break;}catch(e){}await sleep(250);}
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>ws.onopen=r);
  ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){d.error?pend[d.id].rej(new Error(JSON.stringify(d.error))):pend[d.id].res(d.result);delete pend[d.id];}
    if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.exception?d.params.exceptionDetails.exception.description:d.params.exceptionDetails.text);
    if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')errors.push(d.params.args.map(a=>a.value||a.description).join(' '));
    if(d.method==='Log.entryAdded'&&d.params.entry.level==='error'&&d.params.entry.source==='network')errors.push(d.params.entry.text+' '+(d.params.entry.url||''));}; // e.g. a web/ file that is missing
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  // stickers pay coins, so they are paused (also after a reload) until their own checks; other games' exact coin checks still add up
  await send('Page.addScriptToEvaluateOnNewDocument',{source:'window.STK_TEST_PAUSE=true'});
  await send('Page.navigate',{url:URL}); await sleep(1200);
  // a cold start (e.g. right after files changed) can be slow: wait until the page has fully loaded
  for(let i=0;i<60&&!(await ev('document.readyState==="complete"'));i++) await sleep(250);

  console.log('The page and its web/ files');
  const jsFiles=fs.readdirSync(path.join(__dirname,'..','web','js')).filter(f=>f.endsWith('.js')).sort();
  const loaded=await ev(`[...document.scripts].map(s=>s.getAttribute('src'))`);
  check('index.html loads every web/js file, in number order', JSON.stringify(loaded)===JSON.stringify(jsFiles.map(f=>'web/js/'+f)), [loaded,jsFiles]);
  check('the CSS loaded', await ev(`getComputedStyle(document.body).backgroundColor==='rgb(35, 27, 46)'`));
  check('the last file ran (startup)', await ev(`cur==='profiles'&&document.querySelector('#scr-profiles').classList.contains('on')`));

  console.log('Make a profile + open the Art Desk');
  await ev(`(()=>{document.querySelector('#newProfBtn').click();document.querySelector('#npName').value='Testy';[...document.querySelectorAll('#modalBtns button')].pop().click();})()`);
  await sleep(900);
  check('desk sign is unlocked', await ev(`!document.querySelector('[data-hot=desk]').textContent.includes('🔒')`));
  await shot('01-room');
  await ev(`handleHot('desk')`); await sleep(400);
  check('art screen shown', await ev(`cur==='art'`));
  const r=await padRect(); check('pad has 10:7 shape', Math.abs(r.w/r.h-800/560)<0.02, r);
  const coins0=await ev('P().coins');

  console.log('Draw with every tool');
  const tools=['pen','marker','glitter','neon','eraser'];
  for(let k=0;k<tools.length;k++){
    await ev(`document.querySelector('[data-tool=${tools[k]}]').click()`);
    if(k===3) await ev(`document.querySelector('[data-col=rainbow]').click()`);
    await stroke(wave(await padRect(),0.15+k*0.16,25));
  }
  await ev(`document.querySelector('[data-tool=stamp]').click()`); await sleep(100);
  check('stamp row visible', await ev(`!document.querySelector('#artStampRow').classList.contains('hidden')`));
  const r2=await padRect();
  for(const [i,s] of ['star','heart','bat','ghost','moon','ball'].entries()){await ev(`document.querySelector('[data-stamp=${s}]').click()`);await stroke([[r2.x+r2.w*(0.12+i*0.15),r2.y+r2.h*0.8]]);}
  check('canvas not blank', await ev('!artBlank()'));
  check('undo stack has steps', await ev('ART.undo.length'), await ev('ART.undo.length'));
  await shot('02-drawing');
  await ev(`document.querySelector('[data-act=undo]').click()`);
  await ev(`document.querySelector('[data-act=clear]').click()`); check('clear empties', await ev('artBlank()'));
  await ev(`document.querySelector('[data-act=undo]').click()`); check('undo brings it back', await ev('!artBlank()'));
  await ev(`document.querySelector('[data-act=paper]').click()`); check('paper is dark', await ev(`ART.paper==='dark'`));

  console.log('Save + coins');
  await ev(`document.querySelector('[data-act=save]').click()`); await sleep(600);
  check('+5 coins for new drawing', (await ev('P().coins'))===coins0+5, [coins0, await ev('P().coins')]);
  check('stats.drawings = 1', (await ev('P().stats.drawings'))===1);
  check('not dirty after save', await ev('!ART.dirty'));
  await ev(`document.querySelector('[data-act=save]').click()`); await sleep(500);
  check('re-save is an update (no coins)', (await ev('P().coins'))===coins0+5);
  check('store uses IndexedDB', (await ev('ArtStore.mode'))==='idb', await ev('ArtStore.mode'));

  console.log('Gallery + poster');
  await ev(`document.querySelector('#artGalBtn').click()`); await sleep(500);
  for(let i=0;i<30&&!(await ev(`document.querySelectorAll('#artGrid [data-art]').length`));i++) await sleep(100); // the gallery loads in the background
  check('gallery has 1 drawing', (await ev(`document.querySelectorAll('#artGrid [data-art]').length`))===1);
  await shot('03-gallery');
  await ev(`document.querySelector('#artGrid [data-art]').click()`); await sleep(200);
  await shot('04-art-modal');
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes('Hang')).click()`); await sleep(300);
  check('poster item added', (await ev(`P().room.items.filter(i=>i.type==='poster').length`))===1);
  await ev(`artBack()`); await sleep(500);
  check('back to room (clean pad, no prompt)', await ev(`cur==='room'&&document.querySelector('#modal').classList.contains('hidden')`));
  check('poster image drawn in room', await ev(`!!document.querySelector('#roomSvg image')`));
  await sleep(700);
  check('first-drawing bonus pops up in the room', (await ev(`document.querySelector('#modalTitle').textContent`)).includes('Bonus'));
  await shot('05b-bonus-in-room'); await ev(`closeModal()`);
  await shot('05-room-poster');
  await ev(`enterDecorate()`); await sleep(200); await shot('06-decorate'); await ev(`exitDecorate()`);

  console.log('Unsaved drawing asks before leaving');
  await ev(`handleHot('desk')`); await sleep(200);
  await ev(`document.querySelector('#artNewBtn')&&setArtView('pad')`);
  await ev(`(()=>{document.querySelector('#artGalBtn').click();document.querySelector('#artNewBtn').click();})()`); await sleep(300);
  check('new drawing is blank', await ev('artBlank()&&!ART.editId'));
  await ev(`document.querySelector('[data-tool=pen]').click()`);
  await stroke(wave(await padRect(),0.5,30));
  check('androidBack handled', await ev('window.androidBack()'));
  check('save prompt shown', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&document.querySelector('#modalTitle').textContent.includes('Save')`));
  await shot('07-save-prompt');
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes("Don't")).click()`); await sleep(200);
  check('discarded, in room', await ev(`cur==='room'`));

  console.log('Draft survives going to the background');
  await ev(`handleHot('desk')`); await sleep(200);
  for(const f of [0.3,0.5,0.7]) await stroke(wave(await padRect(),f,30));
  await ev(`saveDraft()`); await sleep(400);
  await send('Page.reload'); await sleep(1500);
  await ev(`(()=>{document.querySelector('.pcard').click();})()`); await sleep(700);
  check('poster still in room after reload', await ev(`!!document.querySelector('#roomSvg image')`));
  await ev(`handleHot('desk')`); await sleep(800);
  check('draft restored into pad', await ev('!artBlank()&&ART.dirty'));
  await ev(`setArtView('gal')`); await sleep(500);
  check('gallery still has 1 after reload (draft hidden)', (await ev(`document.querySelectorAll('#artGrid [data-art]').length`))===1);

  console.log('Backup + restore');
  await ev(`setArtView('pad')`); await ev(`document.querySelector('[data-act=save]').click()`); await sleep(600);
  check('second drawing saved (+5, plus the +10 first-drawing bonus)', (await ev('P().coins'))===coins0+5+5+10, [coins0, await ev('P().coins')]);
  await ev(`closeModal();backupModal()`); await sleep(500);
  const info=await ev(`document.querySelector('#modalBody').textContent`);
  check('backup says 2 drawings', info.includes('2 drawings'), info);
  await shot('08-backup');
  const code=await ev(`ArtStore.all().then(l=>JSON.stringify(Object.assign({},DB,{artwork:l.filter(r=>!r.draft)})))`);
  const oldCode=await ev(`JSON.stringify(Object.assign({},DB,{version:1}))`); // a v1.2-style backup (no drawings)
  await ev(`ArtStore.replaceAll([])`); await ev(`localStorage.removeItem('hangoutRoom.v1')`);
  await ev(`doRestore(${JSON.stringify(code)})`); await sleep(800);
  check('restore brings back 2 drawings', (await ev(`ArtStore.all().then(l=>l.length)`))===2);
  check('artwork not saved into localStorage', await ev(`!JSON.parse(localStorage.getItem('hangoutRoom.v1')).artwork`));
  check('DB version is DB_VERSION', (await ev('DB.version'))===(await ev('DB_VERSION')));
  await ev(`doRestore(${JSON.stringify(oldCode)})`); await sleep(800);
  check('old backup restores and keeps drawings', (await ev(`ArtStore.all().then(l=>l.length)`))===2 && (await ev('DB.profiles.length'))===1);
  await ev(`DB.settings.backupArt=false;backupModal()`); await sleep(400);
  check('backup switch off says NOT', (await ev(`document.querySelector('#modalBody').textContent`)).includes('NOT in this backup'));
  await ev(`DB.settings.backupArt=true;closeModal()`);

  console.log('Delete drawing takes poster down');
  await ev(`document.querySelector('.pcard').click()`); await sleep(500);
  await ev(`handleHot('desk')`); await sleep(300); await ev(`setArtView('gal')`); await sleep(500);
  const hungId=await ev(`P().room.items.find(i=>i.type==='poster').art`);
  await ev(`artModal(galList.find(r=>r.id===${JSON.stringify(hungId)}))`);
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes('Delete')).click()`); await sleep(100);
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes('Delete')).click()`); await sleep(600);
  check('poster removed with drawing', (await ev(`P().room.items.filter(i=>i.type==='poster').length`))===0);
  check('1 drawing left', (await ev(`ArtStore.all().then(l=>l.filter(r=>!r.draft).length)`))===1);

  console.log('Photocard Wall');
  const btn=t=>`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes(${JSON.stringify(t)}))`;
  await ev(`closeModal();show('room')`); await sleep(1300); await ev(`closeModal()`);
  check('photocard sign is unlocked', await ev(`!document.querySelector('[data-hot=photo]').textContent.includes('🔒')`));
  check('first-drawing bonus card given', await ev(`P().bonusGot.includes('draw1')&&P().cards.some(c=>c.bonus==='draw1'&&c.stage==='gold'&&c.frame==='holo')`));
  await ev(`handleHot('photo')`); await sleep(400);
  check('cards screen shown', await ev(`cur==='cards'&&!!document.querySelector('#cardBig svg')`));
  await shot('20-card-maker');
  const cBonus=await ev('P().coins');
  await ev(`P().stats.flips=1;show('cards')`); await sleep(700);
  check('flip bonus: modal + 10 coins', (await ev(`document.querySelector('#modalTitle').textContent`)).includes('Bonus') && (await ev('P().coins'))===cBonus+10);
  await shot('21-bonus-modal');
  await ev(`closeModal();show('cards')`); await sleep(500);
  check('bonus is given only once', (await ev(`P().cards.filter(c=>c.bonus==='flip1').length`))===1 && (await ev('P().coins'))===cBonus+10);
  const cSnap=await ev('P().coins');
  await ev(`document.querySelector('#snapBtn').click()`); await sleep(700);
  check('snap makes a card (free)', (await ev(`P().cards.filter(c=>!c.bonus).length`))===1 && (await ev('P().stats.cards'))===1 && (await ev('P().coins'))===cSnap);
  check('new card modal shown', (await ev(`document.querySelector('#modalTitle').textContent`)).includes('Card #'));
  check('card stats come from outfit', JSON.stringify(await ev(`P().cards[P().cards.length-1].s`))===JSON.stringify(await ev(`cardStats(P().look)`)));
  await shot('22-new-card');
  await ev(`${btn('Pin')}.click()`); await sleep(200);
  check('card pinned', (await ev('P().cardPins.length'))===1);
  await ev(`document.querySelector('[data-ct=stage]').click()`); await sleep(100);
  await ev(`document.querySelector('[data-stage=pitch]').click()`); await sleep(150);
  await ev(`${btn('Yes')}.click()`); await sleep(200);
  check('bought Soccer Pitch stage', await ev(`P().owned.includes('stage:pitch')&&CARD.stage==='pitch'`) && (await ev('P().coins'))===cSnap-10);
  await ev(`document.querySelector('[data-ct=frame]').click()`); await sleep(100);
  await ev(`document.querySelector('[data-frame=hearts]').click()`); await sleep(100);
  check('free frame picked', await ev(`CARD.frame==='hearts'`));
  await shot('23-card-frames');
  await ev(`document.querySelector('[data-ct=title]').click()`); await sleep(100);
  await ev(`document.querySelector('[data-title="Team Captain"]').click()`);
  check('title picked', await ev(`CARD.title==='Team Captain'&&document.querySelector('#cardBig').textContent.includes('Team Captain')`));
  for(let i=0;i<9;i++){await ev(`closeModal();document.querySelector('#snapBtn').click()`);await sleep(420);}
  await ev(`closeModal()`);
  check('10 cards made', (await ev('P().stats.cards'))===10);
  await ev(`show('cards')`); await sleep(500); await ev(`closeModal()`);
  check('Card Collector bonus at 10 cards', await ev(`P().bonusGot.includes('cards10')`));
  await ev(`setCardView('binder')`); await sleep(300);
  check('binder page shows 6', (await ev(`document.querySelectorAll('#binderGrid .bcard').length`))===6);
  check('3 pages (10 made + 3 bonus)', (await ev(`document.querySelector('#pgInfo').textContent`)).includes('of 3'), await ev(`document.querySelector('#pgInfo').textContent`));
  await shot('24-binder');
  await ev(`document.querySelector('#pgNext').click();document.querySelector('#pgNext').click()`); await sleep(200);
  check('last page shows 1', (await ev(`document.querySelectorAll('#binderGrid .bcard').length`))===1);
  await ev(`document.querySelector('#binderGrid .bcard').click()`); await sleep(200);
  await shot('25-card-modal');
  await ev(`closeModal();CARD.page=0;renderBinder()`);
  for(let i=0;i<4;i++){await ev(`document.querySelectorAll("#binderGrid .bcard")[${i}].click()`);await ev(`${btn("Pin")}.click()`);await sleep(120);}
  check('only 3 pins (oldest pin replaced)', (await ev('P().cardPins.length'))===3, await ev('JSON.stringify([P().cardPins,binderList(P()).slice(0,4).map(c=>c.id)])'));
  await ev(`show('room')`); await sleep(500);
  check('3 cards on the corkboard', (await ev(`document.querySelectorAll('[data-hot=photo] svg[viewBox="0 0 300 420"]').length`))===3);
  check('corkboard cards have no fuzz filter', await ev(`!document.querySelector('[data-hot=photo] [filter="url(#fuzz)"]')`));
  await shot('26-room-corkboard');
  await ev(`show('cards');setCardView('binder')`); await sleep(200);
  const pinId=await ev('P().cardPins[0]');
  await ev(`cardModal(P().cards.find(c=>c.id===${JSON.stringify(pinId)}))`); await ev(`${btn('Delete')}.click()`); await sleep(100); await ev(`${btn('Delete')}.click()`); await sleep(200);
  check('deleting a pinned card unpins it', (await ev('P().cardPins.length'))===2 && !(await ev(`P().cards.some(c=>c.id===${JSON.stringify(pinId)})`)));
  check('androidBack from cards goes to room', await ev(`window.androidBack()&&cur==='room'`));

  console.log('Photocards in backups');
  const nCards=await ev('P().cards.length');
  const cardCode=await ev('JSON.stringify(DB)');
  const v13Code=await ev(`JSON.stringify(Object.assign({},DB,{version:2,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));['cards','cardPins','bonusGot','cardNo'].forEach(k=>delete q[k]);delete q.stats.cards;return q;})}))`);
  await ev(`doRestore(${JSON.stringify(v13Code)})`); await sleep(500);
  check('v1.3 backup restores with empty card lists', await ev(`DB.version===DB_VERSION&&DB.profiles[0].cards.length===0&&DB.profiles[0].cardPins.length===0&&DB.profiles[0].stats.cards===0`));
  await ev(`doRestore(${JSON.stringify(cardCode)})`); await sleep(500);
  check('backup brings cards and pins back', (await ev('DB.profiles[0].cards.length'))===nCards && (await ev('DB.profiles[0].cardPins.length'))===2);
  await ev(`closeModal();document.querySelector('.pcard').click()`); await sleep(1300); await ev(`closeModal()`);
  check('no repeat bonus after restore', (await ev(`P().cards.filter(c=>c.bonus).length`))===3);

  console.log('Soccer Field');
  // The keeper guesses with Math.random. 0.99 = "guess a side, the right one" (dives to u=+0.32), so tests are repeatable.
  await ev(`window._rand=Math.random;Math.random=()=>0.99`);
  check('soccer sign is unlocked', await ev(`!document.querySelector('[data-hot=window]').textContent.includes('🔒')`));
  await ev(`handleHot('window')`); await sleep(500);
  check('soccer screen shown', await ev(`cur==='soccer'&&!!SOC.g&&document.querySelectorAll('#socScore .dot').length===5`));
  check('starts on Easy with Mochi', await ev(`P().soccer.level==='easy'&&document.querySelector('#socTip').textContent.includes('Mochi')`));
  await shot('40-soccer-easy');
  const sc0=await ev('P().coins');
  const kickWait=2700; // 0.95 s flight + 1.5 s before the next kick
  await ev(`socShoot(-0.35,0.5,1,0)`); await sleep(500); await shot('41-soccer-flying'); await sleep(700);
  check('goal on the left (keeper dived right)', await ev(`SOC.kicks[0]===true&&P().stats.goals===1`));
  check('+1 coin per goal on Easy', (await ev('P().coins'))===sc0+1, [sc0, await ev('P().coins')]);
  await shot('42-soccer-goal'); await sleep(kickWait-1200);
  check('ready for kick 2', await ev(`SOC.state==='aim'`));
  await ev(`socShoot(0.3,0.3,1,0)`); await sleep(1200);
  check('saved by the keeper', await ev(`SOC.kicks[1]===false&&SOC.shot.res==='saved'`));
  await shot('43-soccer-saved'); await sleep(kickWait-1200);
  const tapAt=await ev(`(()=>{const r=socCv.getBoundingClientRect(),p=toScr(SOC.g,-0.38,0.6);return [r.left+p.x,r.top+p.y];})()`);
  await mouse('mousePressed',tapAt[0],tapAt[1]); await mouse('mouseReleased',tapAt[0],tapAt[1]); await sleep(1200);
  check('tapping the goal shoots there (goal)', await ev(`SOC.kicks[2]===true&&Math.abs(SOC.shot.u+0.38)<0.02`), await ev('JSON.stringify(SOC.shot)'));
  await sleep(kickWait-1200);
  const ball=await ev(`(()=>{const r=socCv.getBoundingClientRect();return [r.left+SOC.g.bx,r.top+SOC.g.by];})()`);
  // Like a child: touch the ball, wait a moment, then flick hard. The pause must not make the kick weak.
  // (Sent from inside the page so the 10 ms gaps are exact: about 3.6 px per ms, a real quick flick.)
  await ev(`(async()=>{const pe=(t,x,y)=>socCv.dispatchEvent(new PointerEvent(t,{clientX:x,clientY:y,pointerId:7,bubbles:true}));
    const [x,y]=${JSON.stringify(ball)}; pe('pointerdown',x,y); await new Promise(r=>setTimeout(r,600));
    for(let i=1;i<=6;i++){await new Promise(r=>setTimeout(r,10)); pe('pointermove',x-i*8,y-i*35);}
    pe('pointerup',x-48,y-210);})()`); await sleep(100);
  check('swiping up kicks the ball (aimed left)', await ev(`SOC.kicks.length===3&&SOC.state==='fly'&&SOC.shot.u<0`), await ev('JSON.stringify(SOC.shot)'));
  check('a hard flick after a pause is a strong shot that stays under the bar', await ev(`SOC.shot.T<0.7&&SOC.shot.v>0.5&&SOC.shot.v<=0.9`), await ev('JSON.stringify(SOC.shot)'));
  for(let i=0;i<60&&!(await ev(`SOC.state==='aim'`));i++) await sleep(100);
  await ev(`socShoot(0.8,0.4,1,0)`); await sleep(1200);
  check('a wide shot misses', await ev(`SOC.shot.res==='wide'`));
  await sleep(1700);
  check('match ends after 5 kicks', (await ev(`document.querySelector('#modalTitle').textContent`)).includes('/ 5 goals') && (await ev('P().stats.matches'))===1);
  check('best score saved', (await ev('P().soccer.best.easy'))>=2);
  await shot('44-soccer-result');
  check('First Goal! bonus card', await ev(`P().bonusGot.includes('goal1')`));
  await ev(`closeModal()`); await sleep(100);
  check('tap after the match starts a new one', await ev(`(()=>{socCv.dispatchEvent(new PointerEvent('pointerdown',{clientX:5,clientY:5}));return SOC.state==='aim'&&SOC.kicks.length===0;})()`));

  console.log('Team kit bonus + harder keepers');
  const look0=await ev('JSON.stringify(P().look)');
  await ev(`P().look.top='jersey';P().look.bottom='shorts';renderSoccer()`); await sleep(300);
  check('kit badge shows with 2 soccer items', await ev(`!document.querySelector('#kitBadge').classList.contains('hidden')`));
  const sc1=await ev('P().coins');
  await ev(`socShoot(-0.35,0.5,1,0)`); await sleep(1300);
  check('+1 kit bonus (2 coins per goal on Easy)', (await ev('P().coins'))===sc1+2, [sc1, await ev('P().coins')]);
  await shot('45-soccer-kit');
  await ev(`document.querySelector('[data-lvl=medium]').click()`); await sleep(400);
  check('Medium has Boo', await ev(`P().soccer.level==='medium'&&document.querySelector('#socTip').textContent.includes('Boo')`));
  await shot('46-soccer-medium');
  await ev(`P().look=JSON.parse(${JSON.stringify(look0)});document.querySelector('[data-lvl=hard]').click()`); await sleep(400);
  check('Hard has Flap, kit badge gone', await ev(`P().soccer.level==='hard'&&document.querySelector('#socTip').textContent.includes('Flap')&&document.querySelector('#kitBadge').classList.contains('hidden')`));
  await shot('47-soccer-hard');
  const sc2=await ev('P().coins');
  for(let i=0;i<5;i++){await ev(`socShoot(-0.35,0.5,1.2,0)`);await sleep(i<4?kickWait:1300);}
  await sleep(1500);
  check('perfect 5/5 on Hard: 5×3 + 5 coins, +10 for the bonus card', (await ev('P().coins'))===sc2+30 && (await ev('P().stats.perfects'))===1, [sc2, await ev('P().coins')]);
  check('Perfect 5/5 bonus card', await ev(`P().bonusGot.includes('perfect1')`));
  check('perfect on Hard wins the Gold Trophy (in the room)', await ev(`P().soccer.trophies.includes('hard')&&P().room.items.filter(i=>i.type==='trophyGold'&&i.placed).length===1`));
  check('trophy stands in its own spot, not behind Fuzzy', await ev(`(()=>{const t=P().room.items.find(i=>i.type==='trophyGold');return t.x===TROPHY_SPOTS.trophyGold.x&&Object.values(TROPHY_SPOTS).every(p=>p.x+70<420||p.x-70>580||p.y>604);})()`));
  check('result box shows the trophy', (await ev(`document.querySelector('#modalBody').textContent`)).includes('Gold Trophy'));
  await shot('48-soccer-perfect');
  await ev(`closeModal()`);
  check('androidBack from soccer goes to room', await ev(`window.androidBack()&&cur==='room'`));
  await ev(`P().soccer.best.medium=5;show('room')`); await sleep(300);
  check('an earlier perfect on Medium gives the Silver Trophy', await ev(`P().soccer.trophies.includes('medium')&&P().room.items.some(i=>i.type==='trophySilver')`));
  await ev(`show('soccer')`); await sleep(200); await ev(`show('room')`); await sleep(300);
  check('trophies are given only once', await ev(`P().room.items.filter(i=>/^trophy/.test(i.type)).length===2&&!P().soccer.trophies.includes('easy')`));
  await ev(`closeModal()`); await shot('51-room-trophies');
  await ev(`enterDecorate();document.querySelector('[data-dt=shop]').click()`);
  check('trophies are not in the Shop', await ev(`!document.querySelector('#decoGrid [data-buy^=trophy]')`)); await ev(`exitDecorate()`);
  await ev(`Math.random=window._rand`);

  console.log('Soccer in backups');
  const v14Code=await ev(`JSON.stringify(Object.assign({},DB,{version:3,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.soccer;['goals','kicks','matches','perfects'].forEach(k=>delete q.stats[k]);return q;})}))`);
  const socCode=await ev('JSON.stringify(DB)');
  await ev(`doRestore(${JSON.stringify(v14Code)})`); await sleep(400);
  check('v1.4 backup restores with soccer defaults', await ev(`DB.version===DB_VERSION&&DB.profiles[0].soccer.level==='easy'&&DB.profiles[0].soccer.best.hard===0&&DB.profiles[0].stats.goals===0&&DB.profiles[0].soccer.trophies.length===0`));
  await ev(`doRestore(${JSON.stringify(socCode)})`); await sleep(400);
  check('backup keeps soccer progress', await ev(`DB.profiles[0].soccer.best.hard===5&&DB.profiles[0].stats.perfects===1&&DB.profiles[0].soccer.trophies.length===2`));
  await ev(`closeModal();document.querySelector('.pcard').click()`); await sleep(1300); await ev(`closeModal()`);
  check('no duplicate trophies after restore', await ev(`P().room.items.filter(i=>/^trophy/.test(i.type)).length===2`));

  console.log('Stage (rhythm game)');
  // stAll() taps every note still to come exactly on time; stSkip() jumps to the end of the song.
  await ev(`window.stAll=()=>STG.notes.forEach(n=>{if(!n.r)stTap(n.lane,n.t);});window.stSkip=()=>{STG.t0-=STG.end+2;}`);
  await ev(`show('room');goRoom(1)`); await sleep(300);
  check('no stage marquee in her first room (moved to the Loft in v1.12)', await ev(`!document.querySelector('[data-hot=stage]')`));
  await ev(`goRoom(2)`); await sleep(300);
  check('stage marquee on the Loft wall', await ev(`(()=>{const m=document.querySelector('[data-hot=stage] rect');if(!m)return false;const r=m.getBoundingClientRect(),w=document.querySelector('[data-hot=stage]').ownerSVGElement.getBoundingClientRect();return r.width>50&&r.left>w.left&&r.right<w.right&&r.top>w.top;})()`));
  await shot('69-loft-stage');
  await ev(`document.querySelector('[data-hot=stage] rect').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(400);
  check('marquee opens the Stage on Easy with 3 songs', await ev(`cur==='stage'&&STG.state==='pick'&&P().stage.level==='easy'&&document.querySelectorAll('#stgSongs [data-song]').length===3`));
  check('Back from the song list goes to the Loft', await ev(`window.androidBack()&&cur==='room'&&roomNo===2`));
  await ev(`goRoom(1);show('stage')`); await sleep(300);
  await shot('70-stage-songs');
  const charts=await ev(`(()=>{const out=[];for(const s of SONG_IDS)for(const l of ['easy','medium','hard']){const a=buildSong(s,l),b=buildSong(s,l),L=STG_LEVELS[l];
    let gap=99;for(let i=1;i<a.notes.length;i++)gap=Math.min(gap,(a.notes[i].t-a.notes[i-1].t)/a.beat);
    out.push({s,l,n:a.notes.length,gap:+gap.toFixed(3),len:Math.round(a.end),same:JSON.stringify(a.notes)===JSON.stringify(b.notes),
      lanes:a.notes.every(n=>n.lane>=0&&n.lane<L.lanes),used:new Set(a.notes.map(n=>n.lane)).size===L.lanes,inSong:a.notes.every(n=>n.t>=a.first&&n.t<a.end-a.bar)});}return out;})()`);
  check('every chart is fixed (same every time), in its lanes, inside the song', charts.every(c=>c.same&&c.lanes&&c.used&&c.inSong), charts);
  check('notes are never too close (Easy 1 beat, Medium 1 beat, Hard half a beat)', charts.every(c=>c.gap>=(c.l==='hard'?0.499:0.999)), charts.map(c=>c.s+'/'+c.l+':'+c.gap));
  check('harder levels have more notes', charts.filter(c=>c.l==='easy').every(e=>{const m=charts.find(c=>c.s===e.s&&c.l==='medium'),h=charts.find(c=>c.s===e.s&&c.l==='hard');return e.n<m.n&&m.n<h.n;}), charts.map(c=>c.s+'/'+c.l+':'+c.n));
  check('songs are about a minute long', charts.every(c=>c.len>=55&&c.len<=75), charts.map(c=>c.len));
  await ev(`document.querySelector('[data-late="20"]').click()`);
  check('"Sound late?" + adds 20 ms', await ev(`DB.settings.stageOffset===20&&document.querySelector('#stgLate').textContent==='+20 ms'`));
  await ev(`document.querySelector('[data-late="-20"]').click()`);
  check('"Sound late?" − goes back to 0', await ev(`DB.settings.stageOffset===0`));

  const st0=await ev('P().coins');
  await ev(`document.querySelector('[data-song=starlight]').click()`); await sleep(300);
  check('tapping a song starts it', await ev(`STG.state==='play'&&STG.song==='starlight'&&!document.querySelector('#stgPlay').classList.contains('hidden')&&!!document.querySelector('#stgMascot svg')`));
  await ev(`DB.settings.music=true;document.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);
  check('background music stays off during a song', await ev(`!musicTimer`)); await ev(`DB.settings.music=false`);
  await sleep(1200); await shot('71-stage-countin');
  // a real tap on the pad, sent exactly when the first note arrives
  const tap1=await ev(`new Promise(r=>setTimeout(()=>{const c=stgCv.getBoundingClientRect(),g=STG.g;stgCv.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:c.left+g.xs[0],clientY:c.top+g.yh}));r(STG.counts.slice(0,3).reduce((a,b)=>a+b));},Math.max(0,(STG.notes[0].t-stSongT())*1000)))`);
  check('a tap on time hits the first note', tap1===1, await ev('JSON.stringify(STG.counts)'));
  await sleep(300); await shot('72-stage-hit');
  await sleep(Math.max(0,await ev(`(STG.notes[1].t-stSongT())*1000`))+500);
  check('a note that goes past is an Oops and ends the combo', await ev(`STG.notes[1].r===4&&STG.counts[3]>=1&&STG.combo===0`), await ev('JSON.stringify(STG.counts)'));
  check('a tap between notes does nothing', await ev(`stTap(0,STG.notes[2].t-0.45)===-1&&STG.counts[3]===STG.notes.filter(n=>n.r===4).length`));
  await ev('stAll()'); await sleep(200); await shot('73-stage-playing'); await ev('stSkip()'); await sleep(500);
  check('the song ends with the result box', await ev(`STG.state==='done'&&document.querySelector('#modalTitle').textContent.includes('Starlight Pop')`));
  await shot('74-stage-result');
  const b1=await ev('P().stage.best.starlight.easy');
  check('best stars and score saved', b1&&b1.stars>=2&&b1.score>0, b1);
  check('coins: stars × 2 on Easy, +10 for the First Show! card', (await ev('P().coins'))===st0+b1.stars*2+10, [st0, await ev('P().coins'), b1]);
  check('First Show! bonus card (not yet a Full Combo)', await ev(`P().bonusGot.includes('show1')&&!P().bonusGot.includes('combo1')&&P().stats.shows===1`));
  const st1=await ev('P().coins');
  await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(200);
  check('Play again starts the song again', await ev(`STG.state==='play'&&STG.counts.every(x=>x===0)`));
  await ev('stAll()'); await ev('stSkip()'); await sleep(500);
  check('every note Perfect = 3 stars and a Full Combo', await ev(`P().stage.best.starlight.easy.stars===3&&P().stats.fullCombos===1&&P().bonusGot.includes('combo1')`));
  check('coins: 3 × 2, +10 for the Full Combo card', (await ev('P().coins'))===st1+16, [st1, await ev('P().coins')]);

  await ev(`[...document.querySelectorAll('#modalBtns button')][0].click()`); await sleep(200);
  check('Songs button goes back to the song list', await ev(`STG.state==='pick'&&!document.querySelector('#stgPick').classList.contains('hidden')`));
  check('song list shows the stars', await ev(`document.querySelectorAll('[data-song=starlight] .ss span:not(.off)').length===3`));
  await ev(`document.querySelector('#stgTabs [data-lvl=hard]').click()`); await sleep(200);
  check('Hard tab picked (saved)', await ev(`P().stage.level==='hard'&&document.querySelector('#stgTabs .on').dataset.lvl==='hard'`));
  check('Hard has no stars yet', await ev(`document.querySelectorAll('[data-song=starlight] .ss span:not(.off)').length===0`));
  const st2=await ev('P().coins');
  await ev(`stStart('bats')`); await sleep(4500); await shot('75-stage-hard');
  check('Hard has 3 lanes', await ev(`STG.g.n===3`));
  // three fingers: one tap on each lane's pad (the lane comes from where she taps)
  check('each pad taps its own lane', await ev(`(()=>{const c=stgCv.getBoundingClientRect(),g=STG.g,got=[];const o=window.stTap;window.stTap=(l,t)=>{got.push(l);return -1;};
    try{g.xs.forEach(x=>stgCv.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:c.left+x,clientY:c.top+g.yh})));}finally{window.stTap=o;}return got.join();})()`)==='0,1,2');
  await ev('stAll()'); await ev('stSkip()'); await sleep(500);
  check('3 stars on Hard wins the Golden Mic (in the room)', await ev(`P().stage.mic&&P().room.items.filter(i=>i.type==='goldenMic'&&i.placed).length===1`));
  check('result box shows the Golden Mic', (await ev(`document.querySelector('#modalBody').textContent`)).includes('Golden Mic'));
  check('Superstar bonus card', await ev(`P().bonusGot.includes('superstar')`));
  check('coins: 3 × 4 on Hard, +10 for Superstar', (await ev('P().coins'))===st2+22, [st2, await ev('P().coins')]);
  await shot('76-stage-golden-mic');
  await ev(`closeModal();P().stage.level='medium';stgPickView();stStart('sugar')`); await ev('stSkip()'); await sleep(500);
  check('a song with no taps gives no stars or coins', await ev(`P().stats.shows===3&&!((P().stage.best.sugar||{}).medium||{}).stars&&!P().bonusGot.includes('encore')`));
  await ev(`closeModal();stStart('sugar')`); await ev(`STG.notes.forEach((n,i)=>{if(i%2)stTap(n.lane,n.t+0.08);})`); await ev('stSkip()'); await sleep(500);
  check('half the notes = 1 star', await ev(`P().stage.best.sugar.medium.stars===1`), await ev('JSON.stringify(P().stage.best.sugar)'));
  check('Encore! card after playing all 3 songs', await ev(`P().bonusGot.includes('encore')`));
  await ev(`closeModal();stStart('starlight')`); await sleep(200);
  check('Back during a song goes to the song list', await ev(`window.androidBack()&&cur==='stage'&&STG.state==='pick'`));
  check('Back again goes to the room', await ev(`window.androidBack()&&cur==='room'`));
  await ev(`show('stage');show('room')`); await sleep(300);
  check('the Golden Mic is given only once', await ev(`P().room.items.filter(i=>i.type==='goldenMic').length===1`));
  check('the Golden Mic is drawn in the room', await ev(`!!document.querySelector('#roomSvg .deco [fill="url(#gGold)"]')`));
  await shot('77-room-stage');
  await ev(`enterDecorate();document.querySelector('[data-dt=shop]').click()`); await sleep(150);
  check('the Golden Mic is not in the Shop', await ev(`!document.querySelector('#decoGrid [data-buy=goldenMic]')`)); await ev(`exitDecorate()`);
  check('Concert photocard stage is free', await ev(`cardOwned(P(),'stage','concert')`));

  console.log('Stage in backups');
  const v16Code=await ev(`JSON.stringify(Object.assign({},DB,{version:4,settings:{sound:true,music:false,backupArt:true},profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.stage;delete q.stats.shows;delete q.stats.fullCombos;return q;})}))`);
  const stgCode=await ev('JSON.stringify(DB)');
  await ev(`doRestore(${JSON.stringify(v16Code)})`); await sleep(400);
  check('v1.6 backup restores with stage defaults', await ev(`DB.version===DB_VERSION&&DB.settings.stageOffset===0&&DB.profiles[0].stage.level==='easy'&&Object.keys(DB.profiles[0].stage.best).length===0&&DB.profiles[0].stats.shows===0&&DB.profiles[0].stage.mic===false`));
  await ev(`doRestore(${JSON.stringify(stgCode)})`); await sleep(400);
  check('backup keeps stage progress', await ev(`DB.profiles[0].stage.best.bats.hard.stars===3&&DB.profiles[0].stage.mic===true&&DB.profiles[0].stats.fullCombos>=2`));
  await ev(`closeModal();document.querySelector('.pcard').click()`); await sleep(1300); await ev(`closeModal()`);
  check('no second Golden Mic after restore', await ev(`P().room.items.filter(i=>i.type==='goldenMic').length===1`));

  console.log('Squishy: press anywhere, knead, slow rise, poke, two fingers');
  // Finger events are sent from inside the page. sq(type,id,u,v) presses at body position u,v (-1..1 across the toy).
  await ev(`window.sq=(t,id,u,v)=>{const r=sqc.getBoundingClientRect(),g=SQ.geo;sqc.dispatchEvent(new PointerEvent(t,{pointerId:id,bubbles:true,clientX:r.left+g.cx+u*g.R*g.sx,clientY:r.top+g.cy+v*g.R*g.sy}));}`);
  await ev(`show('fidget');setFidTab('squish')`); await sleep(500);
  const sq0=await ev('P().stats.squish');
  await ev(`sq('pointerdown',11,0,0)`); await sleep(700);
  check('pressing the middle makes a deep dent', await ev(`SQ.touches.size===1&&SQ.touches.get(11).d>0.5`), await ev('JSON.stringify([...SQ.touches.values()])'));
  check('pressing the middle squashes the toy', await ev('SQ.s>0.08'), await ev('SQ.s'));
  await shot('60-squish-press-middle');
  await ev(`sq('pointermove',11,0.45,0.1)`); await sleep(200);
  check('the dent follows the finger (kneading)', await ev('SQ.touches.get(11).u>0.3'));
  await ev(`sq('pointerup',11,0.45,0.1)`); await sleep(300);
  check('a squeeze counts as one squish', (await ev('P().stats.squish'))===sq0+1);
  check('the dent stays after letting go', await ev('SQ.touches.size===0&&SQ.dents.length===1&&SQ.dents[0].d>0.4'), await ev('JSON.stringify(SQ.dents)'));
  await shot('61-squish-slow-rise');
  await sleep(1500);
  check('...and is still rising slowly', await ev('SQ.dents.length===1&&SQ.dents[0].d>0.05&&SQ.dents[0].d<0.6'), await ev('JSON.stringify(SQ.dents)'));
  await sleep(4000);
  check('...until it is smooth again', await ev('SQ.dents.length===0'));
  await ev(`sq('pointerdown',12,-0.3,-0.3)`); await sleep(50); await ev(`sq('pointerup',12,-0.3,-0.3)`); await sleep(60);
  check('a quick poke jiggles', await ev('Math.abs(SQ.wob)>0.005'), await ev('SQ.wob'));
  check('a quick poke is not counted as a squish', (await ev('P().stats.squish'))===sq0+1);
  await sleep(800);
  await ev(`sq('pointerdown',21,-0.6,0);sq('pointerdown',22,0.6,0)`); await sleep(700);
  check('two fingers make two dents', await ev('SQ.touches.size===2'));
  check('squeezing both sides makes it narrower and taller', await ev('SQ.geo.sx<0.92&&SQ.geo.sy>1.05'), await ev('JSON.stringify(SQ.geo)'));
  await shot('62-squish-two-fingers');
  await ev(`sq('pointerup',21,-0.6,0)`); await sleep(50); await ev(`sq('pointerup',22,0.6,0)`); await sleep(100);
  check('a two-finger squeeze counts once', (await ev('P().stats.squish'))===sq0+2);
  await sleep(5500);
  await ev(`sq('pointerdown',23,0,-0.6)`); await sleep(700);
  check('pressing the top makes it flatter and wider', await ev('SQ.geo.sx>1.05&&SQ.geo.sy<0.9'), await ev('JSON.stringify(SQ.geo)'));
  await shot('62b-squish-top'); await ev(`sq('pointerup',23,0,-0.6)`); await sleep(100);
  await ev(`sqc.dispatchEvent(new PointerEvent('pointerdown',{pointerId:31,bubbles:true,clientX:sqc.getBoundingClientRect().left+4,clientY:sqc.getBoundingClientRect().top+4}))`);
  check('pressing outside the toy does nothing', await ev('SQ.touches.size===0'));
  await ev(`sqc.dispatchEvent(new PointerEvent('pointerup',{pointerId:31,bubbles:true}))`);
  for(const k of await ev('Object.keys(SQUISHIES)')){
    await ev(`P().fid.squish='${k}';sq('pointerdown',40,0.4,0.15)`); await sleep(450);
    await shot('63-squish-'+k); await ev(`sq('pointerup',40,0.4,0.15)`); await sleep(50);
  }
  check('every squishy design draws with dents', await ev("cur==='fidget'"));
  await ev(`P().fid.squish='mochi';show('room')`);

  console.log('Little-sister polish: room colour + badge, Easy mode, grown-up PIN');
  const mbtn=t=>`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes(${JSON.stringify(t)}))`;
  const title=()=>ev(`document.querySelector('#modal').classList.contains('hidden')?'':document.querySelector('#modalTitle').textContent`);
  const pinType=async s=>{for(const k of s)await ev(`document.querySelector('#pinPad [data-k="${k}"]').click()`);await sleep(300);};
  const prices=sel=>ev(`[...document.querySelectorAll('${sel}')].map(t=>{const p=t.querySelector('.tp');return p?Number(p.textContent.replace(/\\D/g,'')):0;})`);
  const sorted=a=>a.every((v,i)=>!i||a[i-1]<=v);
  check('every room has a colour and a badge', await ev(`DB.profiles.every(p=>ROOM_COLORS[p.color]&&ROOM_BADGES.includes(p.badge)&&p.easy===false)`));
  await ev(`settingsModal()`); await shot('90-settings-easy-pin');
  await ev(`document.querySelector('#sEasy').click()`); await sleep(150);
  check('Settings turns Easy mode on', await ev(`P().easy===true&&document.body.classList.contains('easy')`));
  check('Settings button says ON', (await ev(`document.querySelector('#sEasy').textContent`)).includes('ON'));
  check('room labels show in Easy mode', await ev(`(()=>{const L=[...document.querySelectorAll('#roomSvg .sign, svg .sign')];return L.length>=5&&L.every(g=>getComputedStyle(g).display!=='none');})()`));
  await ev(`closeModal()`); await shot('91-easy-room');
  await ev(`show('fidget');setFidTab('popit')`); await sleep(200);
  check('Easy mode hides the tips', await ev(`getComputedStyle(document.querySelector('#fid-popit .fid-tip')).display==='none'`));
  const btnH=await ev(`document.querySelector('#scr-fidget [data-back]').getBoundingClientRect().height`);
  check('Easy mode buttons are big (52+ px)', btnH>=52, btnH);
  await ev(`P().coins=5;show('closet');document.querySelector('[data-cat=top]').click()`); await sleep(200);
  const cp=await prices('#closetGrid .tile');
  check('Easy closet: owned first, then cheapest first', sorted(cp), cp);
  check('Easy closet: too-dear items are dimmed with a lock', await ev(`[...document.querySelectorAll('#closetGrid .tile.poor')].length>0&&[...document.querySelectorAll('#closetGrid .tile.poor .tp')].every(t=>t.textContent.includes('🔒'))`));
  await shot('92-easy-closet');
  await ev(`document.querySelector('#closetGrid .tile.poor').click()`); await sleep(100);
  check('tapping a too-dear item says how many more coins', (await ev(`document.querySelector('#toast').textContent`)).includes('Need') && !(await title()));
  await ev(`P().coins=100;renderCloset();document.querySelector('#closetGrid .tile.locked').click()`); await sleep(100);
  check('Easy buy box: short, with ✔ Yes / ✖ No', await ev(`!!${mbtn('✔ Yes')}&&!!${mbtn('✖ No')}`));
  await shot('93-easy-buy'); await ev(`${mbtn('✖ No')}.click()`);
  check('saying No buys nothing', (await ev('P().coins'))===100);
  await ev(`show('room');enterDecorate();document.querySelector('[data-dt=shop]').click()`); await sleep(150);
  const dp=await prices('#decoGrid .tile'); check('Easy decorate shop is cheapest first', sorted(dp), dp);
  await ev(`document.querySelector('[data-dt=wall]').click()`); await sleep(100);
  const wp=await prices('#decoGrid .tile'); check('Easy walls: owned first, then cheapest', sorted(wp), wp);
  await shot('94-easy-decorate'); await ev(`exitDecorate()`);
  await ev(`show('cards');setCardView('make');CARD.tab='stage';renderMaker()`); await sleep(200);
  const sp=await prices('#cardGrid .tile'); check('Easy photocard stages: cheapest first', sorted(sp), sp);
  await ev(`P().soccer.level='hard';P().stage.level='hard';show('soccer')`); await sleep(200);
  check('Easy mode opens Soccer on Easy', await ev(`P().soccer.level==='easy'`));
  await ev(`show('stage')`); await sleep(200);
  check('Easy mode opens the Stage on Easy', await ev(`P().stage.level==='easy'&&getComputedStyle(document.querySelector('.stg-late')).display==='none'`));
  await shot('95-easy-stage');
  await ev(`show('profiles')`); await sleep(200);
  check('no Easy mode on the profile screen; card shows 🐣', await ev(`!document.body.classList.contains('easy')&&document.querySelector('.pcard').textContent.includes('🐣')`));
  await ev(`document.querySelector('.pcard').click()`); await sleep(300); await ev(`closeModal()`);
  check('opening the room turns Easy mode back on', await ev(`document.body.classList.contains('easy')`));
  await ev(`settingsModal();document.querySelector('#sEasy').click();closeModal()`);
  check('Easy mode off again', await ev(`!P().easy&&!document.body.classList.contains('easy')`));
  check('room labels hidden when Easy mode is off', await ev(`(()=>{const L=[...document.querySelectorAll('svg .sign')];return L.length>=5&&L.every(g=>getComputedStyle(g).display==='none');})()`));
  await ev(`show('closet')`); await sleep(150);
  check('normal closet keeps its usual order', JSON.stringify(await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id)`))===JSON.stringify(await ev(`CLOSET.top.items.map(i=>i.id)`)));

  console.log('Grown-up PIN');
  await ev(`show('room');settingsModal();document.querySelector('#sPin').click()`); await sleep(100);
  check('PIN pad opens', (await title()).includes('Pick'));
  await shot('96-pin-pad');
  await pinType('1234'); check('asks to type it again', (await title()).includes('again'));
  await pinType('9999'); check('a mismatch starts over', (await title()).includes('Pick') && (await ev('DB.settings.pin'))==='');
  await pinType('1234'); await pinType('1234');
  check('PIN is set', (await ev('DB.settings.pin'))==='1234' && (await title()).includes('Settings'));
  check('Settings shows PIN: ON', (await ev(`document.querySelector('#sPin').textContent`)).includes('ON'));
  await ev(`closeModal();show('profiles')`); await sleep(200);
  await ev(`document.querySelector('.pcard [data-act=del]').click()`); await sleep(100);
  check('delete asks for the PIN', (await title()).includes('PIN'));
  await pinType('0000');
  check('a wrong PIN does nothing', (await title()).includes('PIN') && (await ev(`document.querySelectorAll('#pinDots .on').length`))===0 && (await ev('DB.profiles.length'))===1);
  await pinType('1234'); check('the right PIN opens the delete box', (await title()).includes('Delete'));
  await ev(`${mbtn('Keep it')}.click()`); check('room kept', (await ev('DB.profiles.length'))===1);
  await ev(`document.querySelector('#newProfBtn').click()`); await sleep(100);
  check('making a room asks for the PIN', (await title()).includes('PIN'));
  await ev(`closeModal();document.querySelector('.pcard [data-act=edit]').click()`); await sleep(100);
  check('changing a room asks for the PIN', (await title()).includes('PIN'));
  await pinType('1234'); check('...then opens Change Room', (await title()).includes('Change Room'));
  await ev(`document.querySelector('#npCol [data-col=mint]').click();document.querySelector('#npBadge [data-badge="⚽"]').click()`);
  await shot('97-change-room');
  await ev(`${mbtn('Save')}.click()`); await sleep(150);
  check('new colour and badge saved', await ev(`DB.profiles[0].color==='mint'&&DB.profiles[0].badge==='⚽'`));
  check('profile card shows the badge', (await ev(`document.querySelector('.pcard .pbadge').textContent`))==='⚽');
  await shot('98-profiles-badge');
  await ev(`document.querySelector('.pcard').click()`); await sleep(300); await ev(`closeModal();backupModal()`); await sleep(400);
  await ev(`${mbtn('Restore')}.click()`); await sleep(100);
  check('restore asks for the PIN', (await title()).includes('PIN'));
  await ev(`closeModal()`);
  const pinCode=await ev(`JSON.stringify(Object.assign({},DB,{settings:Object.assign({},DB.settings,{pin:'9999'})}))`);
  await ev(`doRestore(${JSON.stringify(pinCode)})`); await sleep(400);
  check('restoring keeps this device\'s PIN', (await ev('DB.settings.pin'))==='1234');
  const v17Code=await ev(`JSON.stringify(Object.assign({},DB,{version:5,settings:{sound:true,music:false,backupArt:true,stageOffset:0},profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));['easy','color','badge'].forEach(k=>delete q[k]);return q;})}))`);
  await ev(`doRestore(${JSON.stringify(v17Code)})`); await sleep(400);
  check('v1.7 backup restores with a colour, a badge and Easy mode off', await ev(`DB.version===DB_VERSION&&ROOM_COLORS[DB.profiles[0].color]&&DB.profiles[0].badge==='🐰'&&DB.profiles[0].easy===false&&DB.settings.pin==='1234'`));
  await ev(`window._ok=0;askPin(()=>window._ok=1)`); await ev(`${mbtn('Forgot')}.click()`); await sleep(100);
  check('Forgot PIN asks a grown-up sum', (await title()).includes('Grown-up'));
  await shot('99-forgot-pin');
  const [fa,fb]=(await ev(`document.querySelector('#modalBody b').textContent`)).split('×').map(s=>Number(s.trim()));
  await ev(`document.querySelector('#fpAns').value='7';${mbtn('Remove')}.click()`); await sleep(100);
  check('a wrong answer keeps the PIN', (await ev('DB.settings.pin'))==='1234');
  await ev(`document.querySelector('#fpAns').value='${fa*fb}';${mbtn('Remove')}.click()`); await sleep(100);
  check('the right answer removes the PIN', (await ev('DB.settings.pin'))==='' && !(await title()));
  await ev(`document.querySelector('.pcard').click()`); await sleep(300); await ev(`closeModal();show('room')`);

  console.log('Cozy Loft (second room)');
  await ev(`P().coins=400;save()`);
  check('room button says Loft', (await ev(`document.querySelector('#roomGo').textContent`)).includes('Loft'));
  await ev(`document.querySelector('#roomGo').click()`); await sleep(200);
  check('the Loft opens', await ev(`roomNo===2&&document.querySelector('#roomTitle').textContent.includes('Loft')&&!!document.querySelector('#roomSvg [fill="url(#gMoonSky)"]')`));
  check('the Loft has its own free Attic wall', await ev(`P().room2.wall==='attic'&&!!document.querySelector('#gdefs #pBoards')`));
  check('Fuzzy is in the Loft too', await ev(`!!document.querySelector('#mascotG')`));
  await shot('A0-loft');
  check('Back from the Loft goes to her room', await ev(`window.androidBack()&&cur==='room'&&roomNo===1&&document.querySelector('#roomGo').textContent.includes('Loft')`));
  await ev(`goRoom(2);enterDecorate();document.querySelector('[data-dt=shop]').click()`); await sleep(150);
  const r1n=await ev('P().room.items.length');
  await ev(`document.querySelector('#decoGrid [data-buy=disco]').click()`); await ev(`${mbtn('Buy')}.click()`); await sleep(150);
  check('buying in the Loft puts it in the Loft', await ev(`P().room2.items.some(i=>i.type==='disco'&&i.placed)`) && (await ev('P().room.items.length'))===r1n);
  await ev(`document.querySelector('[data-dt=wall]').click()`); await sleep(100);
  check('the Loft shows its own wall as picked', await ev(`!!document.querySelector('#decoGrid .tile.on[data-surf=attic]')`));
  await ev(`document.querySelector('#decoGrid [data-surf=peachStripe]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('changing the Loft wall leaves her room alone', await ev(`P().room2.wall==='peachStripe'&&P().room.wall!=='peachStripe'`));
  await shot('A1-loft-decorate');
  // My Stuff is shared: put the plant away in her room, then place it in the Loft
  await ev(`P().room.items.find(i=>i.type==='plant').placed=false;save();renderDecoGrid();document.querySelector('[data-dt=mine]').click()`); await sleep(100);
  check('My Stuff in the Loft shows things put away in her room', await ev(`!!document.querySelector('#decoGrid [data-place=plant]')`));
  await ev(`document.querySelector('#decoGrid [data-place=plant]').click()`); await sleep(100);
  check('placing it moves it into the Loft', await ev(`P().room2.items.some(i=>i.type==='plant'&&i.placed)&&!P().room.items.some(i=>i.type==='plant')`));
  // posters: 4 per room
  await ev(`for(let k=0;k<4;k++)P().room2.items.push({uid:'tp'+k,type:'poster',art:'fake'+k,placed:true,x:200,y:250});P().room.items.push({uid:'tp9',type:'poster',art:'fake9',placed:false,x:0,y:0});save();renderDecoGrid()`);
  await ev(`document.querySelector('#decoGrid [data-place-uid=tp9]').click()`); await sleep(100);
  check('a 5th poster does not fit in the Loft', await ev(`P().room.items.find(i=>i.uid==='tp9').placed===false`) && (await ev(`document.querySelector('#toast').textContent`)).includes('posters'));
  await ev(`exitDecorate();goRoom(1);enterDecorate();document.querySelector('[data-dt=mine]').click()`); await sleep(100);
  await ev(`document.querySelector('#decoGrid [data-place-uid=tp9]').click()`); await sleep(100);
  check('...but it fits in her room', await ev(`P().room.items.find(i=>i.uid==='tp9').placed===true`));
  await ev(`exitDecorate();[P().room,P().room2].forEach(R=>{R.items=R.items.filter(i=>i.type!=='poster'||!String(i.art).startsWith('fake'));});save();renderRoom()`);
  check('the Golden Mic and trophies stay in her room', await ev(`P().room.items.some(i=>i.type==='goldenMic')&&!P().room2.items.some(i=>DECOR[i.type].award)`));

  console.log('Content Pack 1');
  await ev(`show('closet')`);
  const newClothes=[['top','batSweater'],['bottom','galaxySkirt'],['legs','mintFuzz'],['arms','rainbow'],['shoes','slippers'],['acc','flowers'],['acc','heartShades']];
  for(const [c,i] of newClothes){await ev(`document.querySelector('[data-cat=${c}]').click()`);
    check(`closet has ${c}:${i}`, await ev(`!!document.querySelector('#closetGrid [data-id=${i}] svg')`));}
  await ev(`document.querySelector('[data-cat=top]').click();document.querySelector('#closetGrid [data-id=batSweater]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('bought and wearing the Bat Sweater', await ev(`P().look.top==='batSweater'&&P().owned.includes('top:batSweater')`));
  check('new clothes count on photocard stats (spooky)', (await ev(`cardStats(Object.assign({},DEFAULT_LOOK,{fur:'white',hair:'tuft',top:'batSweater',bottom:'tutu',legs:'none',arms:'none',shoes:'none',acc:'none'}))[1]`))===2);
  await ev(`P().look=Object.assign({},P().look,{hair:'swoopBlack',hairColor:'candy',bottom:'galaxySkirt',legs:'mintFuzz',arms:'rainbow',shoes:'slippers',acc:'flowers'});renderCloset()`); await sleep(100);
  await shot('A2-pack-outfit');
  await ev(`P().look.acc='heartShades';renderCloset()`); await sleep(80); await shot('A3-pack-shades');
  await ev(`show('room');enterDecorate();document.querySelector('[data-dt=shop]').click()`); await sleep(150);
  check('the Shop has all 8 new decorations', await ev(`['bookNook','disco','cushions','batGarland','eggChair','cloudShelf','starMirror','checkerRug'].every(k=>document.querySelector('#decoGrid [data-buy='+k+']'))`));
  await shot('A4-pack-shop');
  await ev(`document.querySelector('[data-dt=floor]').click()`); await sleep(100);
  check('new floors in the Shop', await ev(`!!document.querySelector('#decoGrid [data-surf=mintTiles]')&&!!document.querySelector('#decoGrid [data-surf=cloudCarpet]')`));
  await ev(`exitDecorate();goRoom(2);for(const k of ['bookNook','cushions','batGarland','eggChair','cloudShelf','starMirror','checkerRug'])P().room2.items.push(Object.assign({uid:uid(),type:k,placed:true},spot(k)));P().room2.floor='cloudCarpet';save();renderRoom()`); await sleep(200);
  await shot('A5-loft-furnished');
  check('every new decoration draws in the Loft', (await ev(`document.querySelectorAll('#roomSvg .deco').length`))>=9);
  await ev(`goRoom(1)`);

  console.log('Pop-it shapes, Ghosty, Batwing');
  await ev(`show('fidget');setFidTab('popit')`); await sleep(200);
  check('board shapes are listed after the themes', await ev(`!!document.querySelector('#skinRow [data-shape=heart]')&&!!document.querySelector('#skinRow [data-shape=star]')&&!!document.querySelector('#skinRow .skin-sep')`));
  await ev(`document.querySelector('#skinRow [data-shape=heart]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(200);
  check('bought the Heart Board', await ev(`P().fid.popShape==='heart'&&P().owned.includes('popshape:heart')&&document.querySelector('#popBoard').classList.contains('shaped')`));
  const heartN=await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').length`);
  check('the heart has a sensible number of bubbles', heartN>=16&&heartN<36, heartN);
  await shot('A6-pop-heart');
  const flips0=await ev('P().stats.flips');
  await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').forEach(b=>popAt(b))`); await sleep(1300);
  check('popping every heart bubble flips the board', (await ev('P().stats.flips'))===flips0+1 && (await ev(`document.querySelectorAll('#popBoard .bub.down').length`))===0);
  check('...and the heart shape stays after the flip', (await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').length`))===heartN);
  await ev(`P().fid.pop='emo';document.querySelector('#skinRow [data-shape=star]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(200);
  const starN=await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').length`);
  check('the star has a sensible number of bubbles', starN>=12&&starN<36, starN);
  await shot('A7-pop-star');
  await ev(`document.querySelector('#skinRow [data-shape=classic]').click()`); await sleep(100);
  check('back to the square board (36 bubbles)', (await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').length`))===36);
  await ev(`P().fid.pop='rainbow';P().fid.squish='ghost';setFidTab('squish')`); await sleep(100);
  await ev(`sq('pointerdown',50,0.3,0.1)`); await sleep(500); await shot('A8-squish-ghosty'); await ev(`sq('pointerup',50,0.3,0.1)`);
  check('Ghosty squishy is listed', await ev(`!!document.querySelector('#skinRow [data-skin=ghost]')`));
  await ev(`P().fid.squish='mochi';P().fid.spin='batwing';setFidTab('spin');SP.w=20`); await sleep(400); await shot('A9-spin-batwing');
  check('Batwing spinner is listed', await ev(`!!document.querySelector('#skinRow [data-skin=batwing]')`));
  await ev(`P().fid.spin='galaxy';save();show('room')`);

  console.log('Loft + pack in backups');
  const v19Code=await ev(`JSON.stringify(Object.assign({},DB,{version:6,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.room2;delete q.fid.popShape;return q;})}))`);
  const v110Code=await ev('JSON.stringify(DB)');
  await ev(`doRestore(${JSON.stringify(v19Code)})`); await sleep(400);
  check('v1.9 backup restores with an empty Loft and the square board', await ev(`DB.version===DB_VERSION&&DB.profiles[0].room2.wall==='attic'&&DB.profiles[0].room2.items.length===0&&DB.profiles[0].fid.popShape==='classic'`));
  await ev(`doRestore(${JSON.stringify(v110Code)})`); await sleep(400);
  check('v1.10 backup keeps the Loft and pop-it shape', await ev(`DB.profiles[0].room2.wall==='peachStripe'&&DB.profiles[0].room2.items.some(i=>i.type==='eggChair')&&DB.profiles[0].owned.includes('popshape:star')`));
  await ev(`document.querySelector('.pcard').click()`); await sleep(300); await ev(`closeModal();show('room')`);

  console.log('Wall shelves');
  // dragDeco(uid,x,y): a real drag (pointer events) of a room item so its bottom-centre ends at room point x,y
  await ev(`window.dragDeco=(uid,x,y)=>{const g=roomSvg.querySelector('.deco[data-uid="'+uid+'"]'), it=allItems(P()).find(i=>i.uid===uid), m=roomSvg.getScreenCTM();
    const S=(a,b)=>({clientX:m.a*a+m.e,clientY:m.d*b+m.f,bubbles:true,pointerId:7}), A=S(it.x,it.y-10), B=S(x,y-10);
    g.dispatchEvent(new PointerEvent('pointerdown',A));roomSvg.dispatchEvent(new PointerEvent('pointermove',B));roomSvg.dispatchEvent(new PointerEvent('pointerup',B));}`);
  await ev(`P().coins=500;goRoom(1);enterDecorate();document.querySelector('[data-dt=shop]').click()`); await sleep(150);
  check('both shelves are in the Shop', await ev(`!!document.querySelector('#decoGrid [data-buy=shelfS]')&&!!document.querySelector('#decoGrid [data-buy=shelfL]')`));
  for(const k of ['shelfL','shelfS','lava','lights']){await ev(`document.querySelector('#decoGrid [data-buy=${k}]').click()`);await ev(`${mbtn('Buy')}.click()`);await sleep(120);}
  const uidOf=k=>ev(`P().room.items.filter(i=>i.type==='${k}').pop().uid`);
  const [shL,shS,lava,lights]=[await uidOf('shelfL'),await uidOf('shelfS'),await uidOf('lava'),await uidOf('lights')];
  await ev(`(()=>{const f=u=>P().room.items.find(i=>i.uid===u);Object.assign(f('${shL}'),{x:560,y:300});Object.assign(f('${shS}'),{x:150,y:420});renderRoom();})()`);
  await ev(`dragDeco('${lava}',600,245)`); await sleep(100);
  const lavaAt=()=>ev(`(()=>{const i=P().room.items.find(i=>i.uid==='${lava}');return [Math.round(i.x),Math.round(i.y)];})()`);
  check('a lamp dropped near the shelf snaps onto its top', JSON.stringify(await lavaAt())===JSON.stringify([600,256]), await lavaAt());
  check('the lamp is drawn in front of the shelf', await ev(`(()=>{const k=[...roomSvg.children];return k.indexOf(roomSvg.querySelector('.deco[data-uid="${shL}"]'))<k.indexOf(roomSvg.querySelector('.deco[data-uid="${lava}"]'));})()`));
  await ev(`dragDeco('${shL}',400,330)`); await sleep(100);
  check('moving the shelf takes the lamp along', JSON.stringify(await lavaAt())===JSON.stringify([440,286]), await lavaAt());
  await ev(`dragDeco('${lights}',420,300)`); await sleep(100);
  check('wall things do not snap onto shelves', (await ev(`Math.round(P().room.items.find(i=>i.uid==='${lights}').y)`))===300, await ev(`JSON.stringify(P().room.items.find(i=>i.uid==='${lights}'))`));
  await ev(`dragDeco('${lava}',150,390)`); await sleep(100);
  check('the lamp can move to the little shelf', JSON.stringify(await lavaAt())===JSON.stringify([150,376]), await lavaAt());
  await ev(`dragDeco('${shL}',600,250)`); await sleep(100);
  check('...and then stays put when the long shelf moves', JSON.stringify(await lavaAt())===JSON.stringify([150,376]), await lavaAt());
  await shot('B0-shelves');
  await ev(`dragDeco('${lava}',520,650)`); await sleep(100);
  check('a lamp dropped on the floor stays on the floor', (await ev(`Math.round(P().room.items.find(i=>i.uid==='${lava}').y)`))===650);
  await ev(`exitDecorate()`);

  console.log('Hair styles + colours');
  await ev(`P().coins=500;show('closet');document.querySelector('[data-cat=hair]').click()`); await sleep(150);
  check('hair tab shows 11 styles (8, and 3 short ones since v1.20)', (await ev(`document.querySelectorAll('#closetGrid .tile').length`))===11, await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id)`));
  check('and 10 colour swatches', await ev(`!document.querySelector('#hairCols').classList.contains('hidden')&&document.querySelectorAll('#hairCols [data-hc]').length===10`));
  check('no old coloured swoops in the closet', await ev(`!document.querySelector('#closetGrid [data-id=swoopPurple]')&&!document.querySelector('#closetGrid [data-id=swoopCandy]')`));
  await ev(`document.querySelector('#hairCols [data-hc=pink]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('buying Pink colours the hair', await ev(`P().look.hairColor==='pink'&&P().owned.includes('hairc:pink')&&document.querySelector('#closetMascot').innerHTML.includes('#ff6fae')`));
  await ev(`document.querySelector('#hairCols [data-hc=brown]').click()`); await sleep(100);
  check('Brown is free (no buy box)', await ev(`P().look.hairColor==='brown'&&document.querySelector('#modal').classList.contains('hidden')`));
  await ev(`P().look.hairColor='pink';renderCloset()`);
  for(const id of ['bob','pigtails','waves','spikes','twinTails']){
    await ev(`document.querySelector('#closetGrid [data-id=${id}]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
    check(`bought and wearing ${id}`, await ev(`P().look.hair==='${id}'&&P().owned.includes('hair:${id}')`));
    await shot('B1-hair-'+id);
  }
  await ev(`document.querySelector('#hairCols [data-hc=candy]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('two-tone colours draw a streak', await ev(`document.querySelector('#closetMascot').innerHTML.includes('#ff9fd0')`));
  await shot('B2-hair-twin-candy');
  check('pigtails in pink count as Cute', (await ev(`cardStats(Object.assign({},DEFAULT_LOOK,{fur:'black',hair:'pigtails',hairColor:'pink',top:'none',bottom:'none',legs:'none',arms:'none',shoes:'none',acc:'none'}))[0]`))===2);
  check('Emo Spikes count as Spooky', (await ev(`cardStats(Object.assign({},DEFAULT_LOOK,{fur:'white',hair:'spikes',hairColor:'blonde',top:'none',bottom:'none',legs:'none',arms:'none',shoes:'none',acc:'none'}))[1]`))===2);
  let surpriseOk=true; for(let k=0;k<12;k++){const ok=await ev(`document.querySelector('#randomBtn').click(),hcOwned(P(),P().look.hairColor)&&isOwned(P(),'hair',itemOf('hair',P().look.hair))`);if(!ok)surpriseOk=false;}
  check('Surprise me only picks owned styles and colours', surpriseOk);
  check('an old photocard with Purple Swoop still draws purple hair', await ev(`cardSVG(Object.assign({no:1,at:Date.now(),stage:'pastel',frame:'classic',title:'Superstar',name:'Fuzzy'},{look:Object.assign({},DEFAULT_LOOK,{hair:'swoopPurple',hairColor:undefined})})).includes('#7c4ddb')`));
  const hairCode=await ev('JSON.stringify(DB)');
  const v110Hair=await ev(`JSON.stringify(Object.assign({},DB,{version:7,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));q.look.hair='swoopPurple';delete q.look.hairColor;q.owned=q.owned.filter(k=>!k.startsWith('hairc:')).concat(['hair:swoopPink','hair:swoopCandy']);return q;})}))`);
  await ev(`doRestore(${JSON.stringify(v110Hair)})`); await sleep(400);
  check('a v1.10 backup turns Purple Swoop into Emo Swoop + Purple', await ev(`DB.version===DB_VERSION&&DB.profiles[0].look.hair==='swoopBlack'&&DB.profiles[0].look.hairColor==='purple'`));
  check('...and owned Pink Swoop / Cotton Candy become owned colours', await ev(`['hairc:pink','hairc:candy'].every(k=>DB.profiles[0].owned.includes(k))&&DB.profiles[0].owned.includes('hair:swoopPink')`));
  await ev(`doRestore(${JSON.stringify(hairCode)})`); await sleep(400);
  check('a v1.11 backup keeps style and colour', await ev(`DB.profiles[0].owned.includes('hair:twinTails')&&HAIR_COLORS[DB.profiles[0].look.hairColor]`));
  await ev(`document.querySelector('.pcard').click()`); await sleep(300); await ev(`closeModal();show('room')`);

  console.log('Code Lab (coding puzzles)');
  // clSolve(level, n) loads a puzzle's own answer and runs it; steps are sped up so the test is quick.
  await ev(`window.clSolve=(l,i)=>{const q=CODE_PUZZLES[l][i];clOpen(l,i);CL.prog=[...q.sol];CL.move=[...(q.move||'')];clProg();clGo();};CODE_STEP=40`);
  await ev(`closeModal();P().easy=false;show('room');goRoom(2)`); await sleep(300);
  check('the Loft computer desk is the Code Lab spot', await ev(`!!document.querySelector('[data-hot=code]')`));
  await ev(`document.querySelector('[data-hot=code] rect').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(300);
  check('the desk opens the Code Lab on Easy with 6 puzzles', await ev(`cur==='code'&&CL.view==='pick'&&P().code.level==='easy'&&document.querySelectorAll('#clList [data-pz]').length===6`));
  await shot('A20-code-list');
  const pzs=await ev(`(()=>{const out=[];for(const l of CODE_LVL_IDS)CODE_PUZZLES[l].forEach(q=>{const g=codeParse(q),all=q.map.join('');
    out.push({id:q.id,l,rect:q.map.every(r=>r.length===q.map[0].length),one:all.split('F').length===2&&all.split('C').length===2,
      fits:q.sol.length<=codeMax(l,q)&&(q.move||'').length<=(q.moveMax||CODE_LEVELS[l].moveMax||0),
      palette:[...q.sol+(q.move||'')].every(t=>CODE_LEVELS[l].blocks.includes(t))&&!(q.move||'').includes('M'),
      win:codeSim(q,[...q.sol],q.move?[...q.move]:null).end==='win',
      extras:(!all.includes('#')||!['easy','medium'].includes(l))&&(!all.includes('*')||['hard','challenge'].includes(l))&&(!all.includes('~')||['if','challenge'].includes(l)),far:Math.abs(g.goal.x-g.start.x)+Math.abs(g.goal.y-g.start.y)>codeMax(l,q)});});return out;})()`);
  check('every puzzle has one Fuzzy and one carrot, is a rectangle, uses only its level\'s blocks; no walls on Easy or Medium, stars only on Hard and Challenge, puddles only on If and Challenge', pzs.every(q=>q.rect&&q.one&&q.palette&&q.extras), pzs);
  check('every puzzle can be solved within its block limit (its answer wins)', pzs.every(q=>q.win&&q.fits), pzs.filter(q=>!q.win||!q.fits));
  check('puzzle ids are all different', new Set(pzs.map(q=>q.id)).size===pzs.length);
  // My Move puzzles must need ✨ and If puzzles must need ❓: try every program without that block (up to the block limit).
  const need=await ev(`(()=>{const out={};for(const [l,tok] of [['move','M'],['if','Q']])CODE_PUZZLES[l].forEach(q=>{
    const pal=[...CODE_LEVELS[l].blocks.replace(tok,'')], max=codeMax(l,q); let found=null;
    const rec=p=>{if(found)return;if(p.length&&codeSim(q,p,null).end==='win'){found=p.join('');return;}if(p.length>=max)return;for(const t of pal){p.push(t);rec(p);p.pop();}};
    rec([]); out[q.id]=found;});return out;})()`);
  check('My Move puzzles need ✨ and If puzzles need ❓ (no answer without them fits)', Object.values(need).every(v=>v===null)&&Object.keys(need).length===12, need);
  check('Medium needs 🔁 (plain arrows would not fit)', pzs.filter(q=>q.l==='medium').every(q=>q.far), pzs.filter(q=>q.l==='medium'));
  const cl0=await ev('P().coins');
  await ev(`document.querySelector('#clList [data-pz="0"]').click()`); await sleep(200);
  check('puzzle 1 opens: board, Fuzzy, arrows only', await ev(`CL.view==='play'&&!!document.querySelector('#clFz svg')&&document.querySelectorAll('#clPal [data-add]').length===4&&!document.querySelector('#clPal [data-add=S]')`));
  await ev(`document.querySelector('#clRun').click()`); await sleep(100);
  check('Run with no blocks asks for some (nothing happens)', await ev(`CL.state==='edit'&&document.querySelector('#clMsg').textContent.length>0`));
  await ev(`document.querySelector('[data-add=L]').click();document.querySelector('#clRun').click()`); await sleep(400);
  check('a bump is a gentle oops: the block glows, no coins', await ev(`CL.state==='oops'&&CL.end==='bump'&&!!document.querySelector('#clProg .clb.oops')&&P().coins===${cl0}`));
  await shot('A21-code-oops');
  await ev(`document.querySelector('#clProg [data-at="0"]').click()`);
  check('tapping a block takes it out; Fuzzy goes back to the start', await ev(`CL.prog.length===0&&CL.state==='edit'&&document.querySelector('#clFz').style.transform==='translate(0px, 100px)'`), await ev(`document.querySelector('#clFz').style.transform`));
  await ev(`document.querySelector('[data-add=R]').click();document.querySelector('#clRun').click()`); await sleep(400);
  check('running out of blocks says "add more"', await ev(`CL.end==='short'&&CL.state==='oops'&&!document.querySelector('#clProg .clb.oops')`));
  await ev(`document.querySelector('[data-add=R]').click();document.querySelector('#clRun').click()`); await sleep(1400);
  check('reaching the carrot solves it: +3 coins', await ev(`P().code.solved.includes('e1')&&P().coins===${cl0}+3+BONUS_COINS`), await ev('P().coins-'+cl0));
  check('result box shows, and the "First Program!" bonus card is given', await ev(`document.querySelector('#modalTitle').textContent.includes('solved')&&P().bonusGot.includes('code1')`));
  await shot('A22-code-solved');
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes('Next')).click()`); await sleep(200);
  check('Next opens puzzle 2', await ev(`CL.view==='play'&&CL.idx===1&&CL.prog.length===0`));
  await ev(`clSolve('easy',0)`); await sleep(1300); await ev(`closeModal()`);
  check('solving a puzzle again pays nothing', (await ev('P().coins'))===cl0+3+(await ev('BONUS_COINS')));
  for(let i=1;i<6;i++){await ev(`clSolve('easy',${i})`);await sleep(1500);await ev(`closeModal()`);}
  check('every Easy puzzle solved: 3 coins each + 5 level bonus', await ev(`CODE_PUZZLES.easy.every(q=>P().code.solved.includes(q.id))&&P().coins===${cl0}+BONUS_COINS+6*CODE_COINS+CODE_LEVEL_BONUS`), await ev('P().coins-'+cl0));
  await ev(`clPickView()`); await sleep(100);
  check('the list ticks solved puzzles', await ev(`document.querySelectorAll('#clList .clp.done').length===6`));
  await ev(`document.querySelector('#clTabs [data-lvl=medium]').click()`); await sleep(100);
  check('Medium tab is saved and shows its puzzles', await ev(`P().code.level==='medium'&&document.querySelectorAll('#clList .clp.done').length===0`));
  await ev(`document.querySelector('#clList [data-pz="0"]').click()`); await sleep(150);
  check('Medium adds 🔁 ×2 ×3 ×4', await ev(`['2','3','4'].every(t=>document.querySelector('#clPal [data-add="'+t+'"]'))`));
  await ev(`document.querySelector('[data-add="4"]').click();document.querySelector('#clRun').click()`); await sleep(300);
  check('a 🔁 with nothing after it is an oops', await ev(`CL.end==='lonely'&&!!document.querySelector('#clProg .clb.oops')`));
  await ev(`document.querySelector('[data-add=R]').click();document.querySelector('[data-add=R]').click()`);
  check('the block limit (2 here) stops a 3rd block', await ev(`CL.prog.join('')==='4R'&&document.querySelectorAll('#clProg .clslot').length===0`));
  await ev(`document.querySelector('#clRun').click()`); await sleep(500);
  check('🔁 4 ➡️ walks 4 squares and solves it', await ev(`CL.state==='win'&&P().code.solved.includes('m1')`));
  await sleep(900); await shot('A23-code-medium'); await ev(`closeModal()`);
  await ev(`P().code.level='hard';clOpen('hard',0)`); await sleep(150);
  check('Hard adds 🌟 and draws the stars', await ev(`!!document.querySelector('#clPal [data-add=S]')&&document.querySelectorAll('#clBoard .clstar').length===1`));
  await ev(`CL.prog=['R','R','R','R'];clProg();clGo()`); await sleep(500);
  check('the carrot without the star is not a win', await ev(`CL.end==='stars'&&!P().code.solved.includes('h1')`));
  await ev(`CL.prog=['R','S'];clEdited();clGo()`); await sleep(400);
  check('🌟 where there is no star is an oops', await ev(`CL.end==='nostar'&&!!document.querySelector('#clProg .clb.oops')`));
  await ev(`clOpen('hard',3);CL.prog=[...CODE_PUZZLES.hard[3].sol];clProg();clGo()`); await sleep(400); await shot('A24-code-hard-running');
  await sleep(1400);
  check('a Hard maze with 2 stars solves (stars picked up)', await ev(`P().code.solved.includes('h4')&&document.querySelectorAll('#clBoard .clstar.got').length===2`));
  await shot('A25-code-hard-solved'); await ev(`closeModal()`);
  await ev(`CODE_STEP=400;clSolve('hard',5)`); await sleep(200); await ev(`show('room')`); await sleep(900);
  check('leaving during a run stops it (nothing paid)', await ev(`CL.state!=='run'&&!P().code.solved.includes('h6')`));
  await ev(`CODE_STEP=40;show('code');clOpen('hard',0)`); await sleep(100);
  check('Back from a puzzle goes to the list, then the Loft', await ev(`window.androidBack()&&cur==='code'&&CL.view==='pick'&&window.androidBack()&&cur==='room'&&roomNo===2`));
  await ev(`P().easy=true;P().code.level='hard';show('code')`); await sleep(200);
  check('Easy mode opens the Code Lab on Easy', await ev(`P().code.level==='easy'&&document.querySelector('#clTabs .tab.on').dataset.lvl==='easy'`));
  await ev(`clOpen('easy',1)`); await sleep(100); await shot('A26-code-easy-mode');
  check('Easy mode: big blocks (64 px+), no tip text', await ev(`document.querySelector('#clPal .clb').getBoundingClientRect().width>=64&&getComputedStyle(document.querySelector('#clMsg')).display==='none'`));
  await ev(`P().easy=false;show('room')`);

  console.log('Code Lab in backups');
  const v112Code=await ev(`JSON.stringify(Object.assign({},DB,{version:8,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.code;return q;})}))`);
  const clCode=await ev('JSON.stringify(DB)');
  await ev(`doRestore(${JSON.stringify(v112Code)})`); await sleep(400);
  check('a v1.12 backup (no Code Lab) restores with nothing solved', await ev(`DB.version===DB_VERSION&&DB.profiles[0].code.level==='easy'&&DB.profiles[0].code.solved.length===0`));
  await ev(`doRestore(${JSON.stringify(clCode)})`); await sleep(400);
  check('a v1.13 backup keeps solved puzzles', await ev(`DB.profiles[0].code.solved.includes('h4')&&DB.profiles[0].code.solved.length===8`));
  await ev(`closeModal();document.querySelector('.pcard').click()`); await sleep(1300); await ev(`closeModal();show('room')`);

  console.log('Code Lab: My Move and If levels (v1.14)');
  await ev(`P().easy=false;P().code.level='easy';show('code')`); await sleep(200);
  check('level tabs start Easy, Medium, Hard, My Move, If', await ev(`[...document.querySelectorAll('#clTabs [data-lvl]')].map(b=>b.dataset.lvl).join().startsWith('easy,medium,hard,move,if')`));
  await ev(`document.querySelector('#clTabs [data-lvl=move]').click()`); await sleep(150);
  check('My Move tab is saved and shows 6 puzzles', await ev(`P().code.level==='move'&&document.querySelectorAll('#clList [data-pz]').length===6`));
  const mv0=await ev('P().coins');
  await ev(`document.querySelector('#clList [data-pz="0"]').click()`); await sleep(150);
  check('My Move puzzle: the ✨ row shows and is picked first; ✨ in the palette', await ev(`!document.querySelector('#clMove').classList.contains('hidden')&&document.querySelector('#clMove').classList.contains('on')&&!!document.querySelector('#clPal [data-add=M]')&&document.querySelectorAll('#clMove .clslot').length===4`));
  await ev(`document.querySelector('[data-add=R]').click();document.querySelector('[data-add=U]').click()`);
  check('arrows go into ✨ My Move', await ev(`CL.move.join('')==='RU'&&CL.prog.length===0&&document.querySelectorAll('#clMove .clb').length===2`));
  await ev(`document.querySelector('#clRun').click()`); await sleep(100);
  check('Run with an empty program asks for blocks', await ev(`CL.state==='edit'&&document.querySelector('#clMsg').textContent.length>0`));
  await ev(`document.querySelector('[data-add="3"]').click()`);
  check('🔁 also goes in the ✨ row while it is picked', await ev(`CL.move.join('')==='RU3'`));
  await ev(`document.querySelector('#clUndo').click()`);
  check('↩️ takes the last block off the picked row', await ev(`CL.move.join('')==='RU'`));
  await ev(`document.querySelector('[data-add=M]').click()`);
  check('tapping ✨ puts it in the program and picks the program row', await ev(`CL.prog.join('')==='M'&&CL.row==='main'&&document.querySelector('#clProg').classList.contains('on')`));
  await ev(`document.querySelector('#clMove').click();document.querySelector('#clPal [data-add=M]').click()`);
  check('✨ never goes inside My Move', await ev(`CL.move.join('')==='RU'&&CL.prog.join('')==='MM'`));
  await ev(`document.querySelector('#clProg [data-at="1"]').click()`);
  check('tapping a block in the program takes it out', await ev(`CL.prog.join('')==='M'`));
  await ev(`document.querySelector('#clProg').click();document.querySelector('#clProg [data-at="0"]').click();document.querySelector('[data-add="3"]').click();document.querySelector('[data-add=M]').click()`);
  check('the program is now 🔁3 ✨', await ev(`CL.prog.join('')==='3M'&&CL.move.join('')==='RU'`));
  await ev(`CODE_STEP=300;document.querySelector('#clRun').click()`); await sleep(500);
  check('while it runs, ✨ and the My Move block it is doing both light up', await ev(`CL.state==='run'&&!!document.querySelector('#clProg .clb.fn.lit')&&document.querySelectorAll('#clMove .clb.lit').length===1`));
  await shot('A30-code-mymove-running');
  await sleep(2600); await ev(`CODE_STEP=40`);
  check('🔁 3 ✨ (✨ = ➡️ ⬆️) climbs the stairs and solves it: +3 coins', await ev(`P().code.solved.includes('f1')&&P().coins===${mv0}+3`), await ev('P().coins-'+mv0));
  await sleep(600); await shot('A31-code-mymove-solved'); await ev(`closeModal()`);
  await ev(`clOpen('move',1);document.querySelector('#clProg').click();document.querySelector('[data-add=M]').click();document.querySelector('#clRun').click()`); await sleep(300);
  check('✨ with an empty My Move is an oops (✨ glows)', await ev(`CL.end==='nomove'&&!!document.querySelector('#clProg .clb.fn.oops')`));
  await ev(`CL.move=['U'];CL.prog=['M'];clEdited();clGo()`); await sleep(400);
  check('a bump inside My Move makes that My Move block glow', await ev(`CL.end==='bump'&&!!document.querySelector('#clMove .clb.oops')`));
  await ev(`document.querySelector('#clClear').click()`);
  check('🗑️ clears both rows and picks the ✨ row again', await ev(`!CL.prog.length&&!CL.move.length&&CL.row==='move'`));
  for(let i=1;i<6;i++){await ev(`clSolve('move',${i})`);await sleep(1600);await ev(`closeModal()`);}
  check('every My Move puzzle solved: 3 coins each + 5 level bonus', await ev(`CODE_PUZZLES.move.every(q=>P().code.solved.includes(q.id))&&P().coins===${mv0}+6*CODE_COINS+CODE_LEVEL_BONUS`), await ev('P().coins-'+mv0));
  await ev(`clPickView();document.querySelector('#clTabs [data-lvl=if]').click()`); await sleep(150);
  check('If tab shows 6 puzzles with puddles in the little pictures', await ev(`P().code.level==='if'&&document.querySelectorAll('#clList [data-pz]').length===6&&!!document.querySelector('#clList rect[fill="#5fb4ff"]')`));
  const if0=await ev('P().coins');
  await ev(`document.querySelector('#clList [data-pz="0"]').click()`); await sleep(150);
  check('If puzzle: ❓ in the palette, a puddle on the board, no ✨ row', await ev(`!!document.querySelector('#clPal [data-add=Q]')&&!document.querySelector('#clPal [data-add=M]')&&document.querySelector('#clMove').classList.contains('hidden')&&!!document.querySelector('#clBoard path[fill="#5fb4ff"]')`));
  await ev(`document.querySelector('[data-add=R]').click();document.querySelector('#clRun').click()`); await sleep(300);
  check('walking into a puddle is a gentle splash oops (no coins)', await ev(`CL.end==='splash'&&CL.state==='oops'&&!!document.querySelector('#clProg .clb.oops')&&P().coins===${if0}`));
  await shot('A32-code-if-splash');
  await ev(`document.querySelector('#clClear').click();document.querySelector('[data-add=Q]').click();document.querySelector('#clRun').click()`); await sleep(300);
  check('❓ with no arrow after it is an oops', await ev(`CL.end==='noarrow'&&!!document.querySelector('#clProg .clb.cond.oops')`));
  await ev(`document.querySelector('[data-add=R]').click();document.querySelector('#clRun').click()`); await sleep(700);
  check('❓ ➡️ hops over the puddle (2 squares) and solves it', await ev(`CL.ev[0].k==='hop'&&CL.ev[0].x===2&&P().code.solved.includes('i1')`));
  await sleep(500); await shot('A33-code-if-solved'); await ev(`closeModal()`);
  check('❓ ➡️ just walks when no puddle is next (🔁 3 ❓ ➡️: hop, step, step)', await ev(`codeSim(CODE_PUZZLES.if[1],[...'3QR']).ev.map(e=>e.k).join()==='hop,move,move'`));
  check('a hop that would land in a toy block is a bump', await ev(`codeSim({map:['F~#C']},['Q','R']).end==='bump'`));
  for(let i=1;i<6;i++){await ev(`clSolve('if',${i})`);await sleep(1600);await ev(`closeModal()`);}
  check('every If puzzle solved: 3 coins each + 5 level bonus', await ev(`CODE_PUZZLES.if.every(q=>P().code.solved.includes(q.id))&&P().coins===${if0}+6*CODE_COINS+CODE_LEVEL_BONUS`), await ev('P().coins-'+if0));
  await ev(`clOpen('if',4)`); await sleep(200); await shot('A34-code-if-board');
  const lvCode=await ev('JSON.stringify(DB)');
  await ev(`doRestore(${JSON.stringify(lvCode)})`); await sleep(400);
  check('a v1.14 backup keeps the If level and the new solved puzzles', await ev(`DB.profiles[0].code.level==='if'&&DB.profiles[0].code.solved.includes('f6')&&DB.profiles[0].code.solved.includes('i6')`));
  const oddCode=await ev(`JSON.stringify(Object.assign({},DB,{profiles:DB.profiles.map(p=>Object.assign({},p,{code:{level:'later',solved:['e1']}}))}))`);
  await ev(`doRestore(${JSON.stringify(oddCode)})`); await sleep(400);
  check('an unknown Code Lab level in a backup falls back to Easy', await ev(`DB.profiles[0].code.level==='easy'`));
  await ev(`doRestore(${JSON.stringify(lvCode)})`); await sleep(400);
  await ev(`closeModal();document.querySelector('.pcard').click()`); await sleep(1300); await ev(`closeModal();show('room')`);

  console.log('Code Lab: Challenge level (v1.15)');
  // Every Challenge puzzle must need ✨, and the ones with puddles must need ❓: search every program (and My Move row) without it.
  const chNeed=await ev(`(()=>{
    const strs=(pal,n)=>{const o=[];const r=p=>{if(p.length)o.push(p.slice());if(p.length>=n)return;for(const t of pal){p.push(t);r(p);p.pop();}};r([]);return o;};
    const search=(q,pal,max,mm)=>{const moves=pal.includes('M')?strs(pal.filter(t=>t!=='M'),mm):[];
      for(const p of strs(pal,max)){if(!p.includes('M')){if(codeSim(q,p,null).end==='win')return p.join('');continue;}
        for(const m of moves)if(codeSim(q,p,m).end==='win')return p.join('')+' / '+m.join('');}return null;};
    const L=CODE_LEVELS.challenge, out={};
    CODE_PUZZLES.challenge.forEach(q=>{const max=codeMax('challenge',q), mm=q.moveMax||L.moveMax;
      out[q.id+' without ✨']=search(q,[...L.blocks.replace('M','')],max,mm);
      if(q.map.join('').includes('~')) out[q.id+' without ❓']=search(q,[...L.blocks.replace('Q','')],max,mm);});
    return out;})()`);
  check('every Challenge puzzle needs ✨ (and ❓ when it has puddles): no answer without them fits', Object.values(chNeed).every(v=>v===null)&&Object.keys(chNeed).length>=14, chNeed);
  check('Challenge puzzles mix ideas: every answer puts 🌟 or ❓ inside ✨ My Move, except one pattern puzzle', await ev(`CODE_PUZZLES.challenge.filter(q=>/[SQ]/.test(q.move)).length>=7`));
  check('c4 has a second answer: ✨, 🔁2 ➡️, 🔁2 ✨ (My Move = ⬆️ ➡️) also wins', await ev(`codeSim(CODE_PUZZLES.challenge[3],[...'M2R2M'],[...'UR']).end==='win'`));
  await ev(`P().easy=false;P().code.level='if';show('code')`); await sleep(200);
  check('6 level tabs, the last is 🧠 Challenge', await ev(`[...document.querySelectorAll('#clTabs [data-lvl]')].map(b=>b.dataset.lvl).join()==='easy,medium,hard,move,if,challenge'`));
  await ev(`document.querySelector('#clTabs [data-lvl=challenge]').click()`); await sleep(150);
  check('Challenge tab is saved and shows 8 puzzles', await ev(`P().code.level==='challenge'&&document.querySelectorAll('#clList [data-pz]').length===8`));
  await shot('A40-code-challenge-list');
  const ch0=await ev('P().coins');
  await ev(`document.querySelector('#clList [data-pz="0"]').click()`); await sleep(150);
  check('Challenge puzzle: every block in the palette (arrows, 🔁, 🌟, ✨, ❓) and the ✨ row', await ev(`[...'ULRD234SMQ'].every(t=>document.querySelector('#clPal [data-add="'+t+'"]'))&&!document.querySelector('#clMove').classList.contains('hidden')`));
  await ev(`['R','U','S'].forEach(t=>document.querySelector('[data-add='+t+']').click());document.querySelector('#clProg').click();document.querySelector('[data-add="3"]').click();document.querySelector('[data-add=M]').click()`);
  check('built by tapping: My Move = ➡️ ⬆️ 🌟, program = 🔁3 ✨', await ev(`CL.move.join('')==='RUS'&&CL.prog.join('')==='3M'`));
  await ev(`document.querySelector('#clRun').click()`); await sleep(1300);
  check('🌟 inside My Move picks up both stars and solves it: +5 coins', await ev(`P().code.solved.includes('c1')&&document.querySelectorAll('#clBoard .clstar.got').length===2&&P().coins===${ch0}+5`), await ev('P().coins-'+ch0));
  await ev(`closeModal()`);
  for(let i=1;i<8;i++){await ev(`clSolve('challenge',${i})`);await sleep(i===7?2600:2000);if(i===7)await shot('A41-code-challenge-final');await ev(`closeModal()`);}
  check('every Challenge puzzle solved: 5 coins each + 10 level bonus', await ev(`CODE_PUZZLES.challenge.every(q=>P().code.solved.includes(q.id))&&P().coins===${ch0}+8*5+10`), await ev('P().coins-'+ch0));
  check('the other levels still pay 3 a puzzle and 5 a level', await ev(`codeCoins('easy')===3&&codeBonus('if')===5&&codeCoins('challenge')===5&&codeBonus('challenge')===10`));
  await ev(`clOpen('challenge',7);CL.move=[...'QRQUS'];CL.prog=['4','M'];clProg()`); await sleep(200); await shot('A42-code-challenge-board');
  const chCode=await ev('JSON.stringify(DB)');
  await ev(`doRestore(${JSON.stringify(chCode)})`); await sleep(400);
  check('a v1.15 backup keeps the Challenge level and its solved puzzles', await ev(`DB.profiles[0].code.level==='challenge'&&DB.profiles[0].code.solved.includes('c8')`));
  await ev(`closeModal();document.querySelector('.pcard').click()`); await sleep(1300); await ev(`closeModal();show('room')`);

  console.log('New fidgets (v1.16): slime, clicker cube, marble maze');
  await ev(`closeModal();show('fidget');setFidTab('slime')`); await sleep(400);
  check('the Fidget Shelf has 6 tabs', await ev(`document.querySelectorAll('#fidTabs .tab').length===6`));
  // sl(type,id,x,y) touches the slime at x,y in units of its size, from its resting middle
  await ev(`window.sl=(t,id,x,y)=>{const r=slc.getBoundingClientRect(),g=SL.geo;slc.dispatchEvent(new PointerEvent(t,{pointerId:id,bubbles:true,clientX:r.left+g.cx+x*g.R,clientY:r.top+g.cy+y*g.R}));}`);
  const fzslPull=async(id,x0,x1)=>{await ev(`sl('pointerdown',${id},${x0},0)`);for(let k=1;k<=6;k++){await ev(`sl('pointermove',${id},${x0+(x1-x0)*k/6},0)`);await sleep(30);}};
  const slSt0=await ev('P().stats.stretches'), fzsc0=await ev('P().coins');
  check('a new fidget starts with no stretches', slSt0===0, slSt0);
  await fzslPull(51,0.5,2.2); await sleep(500);
  check('pulling stretches the slime out after the finger', await ev(`Math.max(...SL.pts.map(q=>q.x))>1.8`), await ev(`Math.max(...SL.pts.map(q=>q.x))`));
  check('...and the rest of it gets thinner', await ev(`SL.pts[Math.round(SL.N*3/4)].y>-0.58`), await ev(`SL.pts[Math.round(SL.N*3/4)].y`));
  await shot('B1-slime-stretch');
  await ev(`sl('pointerup',51,2.2,0)`); await sleep(100);
  check('letting go counts one stretch', (await ev('P().stats.stretches'))===1);
  await sleep(1600);
  check('it snaps back to a round blob', await ev(`Math.max(...SL.pts.map(q=>q.x))<1.15`), await ev(`Math.max(...SL.pts.map(q=>q.x))`));
  await ev(`sl('pointerdown',52,-0.2,-0.2)`); await sleep(40); await ev(`sl('pointerup',52,-0.2,-0.2)`); await sleep(80);
  check('a quick poke leaves a dimple', await ev('SL.dimples.length===1'));
  check('a poke is not a stretch', (await ev('P().stats.stretches'))===1);
  await shot('B2-slime-poke');
  await sleep(1600); check('the dimple fills back in', await ev('SL.dimples.length===0'));
  await ev(`sl('pointerdown',53,-0.5,0);sl('pointerdown',54,0.5,0)`);
  for(let k=1;k<=6;k++){await ev(`sl('pointermove',53,${-0.5-k*0.25},0);sl('pointermove',54,${0.5+k*0.25},0)`);await sleep(30);}
  await sleep(400); await shot('B3-slime-two-fingers');
  check('two fingers stretch both sides', await ev(`Math.max(...SL.pts.map(q=>q.x))>1.5&&Math.min(...SL.pts.map(q=>q.x))<-1.5`));
  await ev(`sl('pointerup',53,-2,0)`); await sleep(40); await ev(`sl('pointerup',54,2,0)`); await sleep(100);
  check('a two-finger stretch counts once', (await ev('P().stats.stretches'))===2);
  for(let i=0;i<3;i++){await fzslPull(55,0.3,1.4);await ev(`sl('pointerup',55,1.4,0)`);await sleep(80);}
  check('5 stretches pay 1 coin', (await ev('P().stats.stretches'))===5&&(await ev('P().coins'))===fzsc0+1, [await ev('P().stats.stretches'),await ev('P().coins')-fzsc0]);
  await ev(`slc.dispatchEvent(new PointerEvent('pointerdown',{pointerId:56,bubbles:true,clientX:slc.getBoundingClientRect().left+4,clientY:slc.getBoundingClientRect().top+4}))`);
  check('touching outside the slime does nothing', await ev('SL.touches.size===0'));
  for(const k of await ev('Object.keys(SLIMES)')){await ev(`P().fid.slime='${k}'`);await fzslPull(57,0.4,1.6);await sleep(300);await shot('B4-slime-'+k);await ev(`sl('pointerup',57,1.6,0)`);await sleep(60);}
  check('every slime design draws', await ev(`cur==='fidget'&&fidTab==='slime'`));
  await ev(`P().fid.slime='grape'`);

  await ev(`setFidTab('cube')`); await sleep(300); await shot('B5-cube');
  const fzcb=sel=>`document.querySelector('#cube ${sel}')`;
  await ev(`window.cbp=(el,t,x,y,id)=>{const r=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent(t,{pointerId:id||61,bubbles:true,clientX:r.left+r.width/2+(x||0),clientY:r.top+r.height/2+(y||0)}));}`);
  check('clicker cube: buttons are big enough to tap', await ev(`[...document.querySelectorAll('#cube .cb-btn')].every(b=>b.getBoundingClientRect().width>=48)`), await ev(`${fzcb('.cb-btn')}.getBoundingClientRect().width`));
  check('the cube fits in the shelf', await ev(`(()=>{const c=document.querySelector('#cube').getBoundingClientRect(),s=document.querySelector('.fid-stage').getBoundingClientRect();return c.top>=s.top&&c.bottom<=s.bottom&&c.left>=s.left&&c.right<=s.right;})()`));
  const fzk0=await ev('P().stats.clicks'), fzkc0=await ev('P().coins');
  await ev(`cbp(${fzcb('.cb-btn')},'pointerdown')`);
  check('a button goes down when pressed', await ev(`${fzcb('.cb-btn')}.classList.contains('down')`));
  await ev(`cbp(${fzcb('.cb-btn')},'pointerup')`);
  check('...and comes back up: 1 click', await ev(`!${fzcb('.cb-btn')}.classList.contains('down')&&P().stats.clicks===${fzk0}+1`));
  await ev(`cbp(${fzcb('.cb-sw')},'pointerdown');cbp(${fzcb('.cb-sw')},'pointerup')`);
  check('the switch flips on (1 click)', await ev(`${fzcb('.cb-sw')}.classList.contains('on')&&P().stats.clicks===${fzk0}+2`));
  await ev(`cbp(${fzcb('.cb-sw')},'pointerdown');cbp(${fzcb('.cb-sw')},'pointerup')`);
  check('...and off again', await ev(`!${fzcb('.cb-sw')}.classList.contains('on')&&P().stats.clicks===${fzk0}+3`));
  await ev(`{const j=${fzcb('.cb-joy')};cbp(j,'pointerdown');cbp(j,'pointermove',60,0);}`); await sleep(50);
  check('pushing the joystick moves the knob and clicks', await ev(`${fzcb('.cb-joy i')}.style.transform.includes('translate')&&P().stats.clicks===${fzk0}+4`));
  await ev(`{const j=${fzcb('.cb-joy')};cbp(j,'pointermove',0,-60);cbp(j,'pointerup',0,-60)}`);
  check('a new direction clicks again, and letting go springs back', await ev(`${fzcb('.cb-joy i')}.style.transform===''&&P().stats.clicks===${fzk0}+5`));
  await ev(`(()=>{const b=${fzcb('.cb-ball')};cbp(b,'pointerdown',40,0);for(let i=1;i<=24;i++){const a=i/24*Math.PI*2;cbp(b,'pointermove',Math.cos(a)*40,Math.sin(a)*40);}cbp(b,'pointerup',40,0);})()`);
  check('one turn of the ball: 12 ticks = 3 clicks', (await ev('P().stats.clicks'))===fzk0+8, await ev(`P().stats.clicks-${fzk0}`));
  await ev(`(()=>{const r=${fzcb('.cb-roll')};cbp(r,'pointerdown');for(let i=1;i<=16;i++)cbp(r,'pointermove',0,i*parseFloat(cubeEl.style.fontSize));cbp(r,'pointerup',0,0);})()`);
  check('rolling the roller ticks (16 ticks = 4 clicks)', (await ev('P().stats.clicks'))===fzk0+12, await ev(`P().stats.clicks-${fzk0}`));
  await ev(`(()=>{const b=document.querySelectorAll('#cube .cb-btn')[1];for(let i=0;i<13;i++){cbp(b,'pointerdown');cbp(b,'pointerup');}})()`);
  check('25 clicks pay 1 coin', (await ev('P().stats.clicks'))===fzk0+25&&(await ev('P().coins'))===fzkc0+1, [await ev(`P().stats.clicks-${fzk0}`),await ev(`P().coins-${fzkc0}`)]);
  for(const k of await ev('Object.keys(CUBES)')){await ev(`P().fid.cube='${k}';renderCube()`);await sleep(80);await shot('B6-cube-'+k);}
  check('every cube colour draws', await ev(`getComputedStyle(cubeEl).getPropertyValue('--f').trim()===CUBES.star.face`));
  await ev(`P().fid.cube='pastel';renderCube()`);

  await ev(`setFidTab('maze')`); await sleep(300); await shot('B7-maze');
  check('the maze screen shows 6 maze buttons', await ev(`document.querySelectorAll('#mazeBar [data-mz]').length===6`));
  check('the tilt sensor is listened to only while the maze is on screen', await ev('MZ.listening'));
  // a path search over each maze: one start, one star hole, all 9 x 6, and the star can be reached
  await ev(`window.mzPath=i=>{const m=MAZES[i].map,R=m.length,C=m[0].length,key=(c,r)=>r*C+c;let s,g;m.forEach((row,r)=>[...row].forEach((ch,c)=>{if(ch==='S')s=[c,r];if(ch==='G')g=[c,r];}));
    const prev={};prev[key(...s)]=-1;const q=[s];while(q.length){const [c,r]=q.shift();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=r+dr;if(nc<0||nr<0||nc>=C||nr>=R||'#o'.includes(m[nr][nc]))continue;const k=key(nc,nr);if(k in prev)continue;prev[k]=key(c,r);q.push([nc,nr]);}}
    const path=[];let k=key(...g);if(!(k in prev))return [];while(k!==-1){path.unshift([k%C+0.5,Math.floor(k/C)+0.5]);k=prev[k];}return path;}`);
  check('every maze is 9 x 6 with one start and one star hole', await ev(`MAZES.every(z=>z.map.length===6&&z.map.every(r=>r.length===9)&&z.map.join('').split('S').length===2&&z.map.join('').split('G').length===2)`));
  check('every maze can be solved', await ev(`MAZES.every((z,i)=>mzPath(i).length>4)`));
  check('maze ids are unique', await ev(`new Set(MAZES.map(z=>z.id)).size===MAZES.length`));
  check('no tilt button until a tilt sensor is found', await ev(`!document.querySelector('#mzTilt')`));
  const fzx0=await ev('MZ.x');
  await ev(`(()=>{const r=mzc.getBoundingClientRect(),G=MZ.geo;mzc.dispatchEvent(new PointerEvent('pointerdown',{pointerId:71,bubbles:true,clientX:r.left+G.mx+G.short*0.4,clientY:r.top+G.my-G.short*0.4}));})()`);
  await sleep(500); await shot('B8-maze-finger');
  check('holding a finger to the right rolls the marble right', await ev(`MZ.x>${fzx0}+0.3&&MZ.vx>0`), await ev('MZ.x'));
  await ev(`mzc.dispatchEvent(new PointerEvent('pointerup',{pointerId:71,bubbles:true}))`);
  check('letting go stops the push', await ev('MZ.fing===null'));
  await ev(`window.dispatchEvent(new DeviceOrientationEvent('deviceorientation',{alpha:0,beta:30,gamma:0}))`); await sleep(50);
  check('a tilt reading shows the 📱 Tilt button', await ev(`!!document.querySelector('#mzTilt')&&MZ.tilt.seen`));
  await ev(`window.dispatchEvent(new DeviceOrientationEvent('deviceorientation',{alpha:0,beta:30,gamma:-25}))`); await sleep(30);
  check('how she held it at first counts as flat; tilting left pushes left', await ev(`MZ.tilt.x===-1&&MZ.tilt.y===0`), await ev('JSON.stringify(MZ.tilt)'));
  // autopilot: follows the path by sending tilt readings (like a real tablet would), checking the marble never enters a wall
  await ev(`window.mzAuto=()=>new Promise(res=>{const path=mzPath(MZ.i);let k=1,bad=0,n=0;const send=(x,y)=>window.dispatchEvent(new DeviceOrientationEvent('deviceorientation',{alpha:0,beta:y,gamma:x}));
    const iv=setInterval(()=>{n++;if(mzCell(Math.floor(MZ.x),Math.floor(MZ.y))==='#')bad++;
      if(!document.querySelector('#modal').classList.contains('hidden')||n>900){clearInterval(iv);res({bad,n,done:MZ.done});return;}
      if(!MZ.tilt.base){send(0,0);return;}
      const t=path[k];let dx=t[0]-MZ.x,dy=t[1]-MZ.y;const d=Math.hypot(dx,dy);if(d<0.3&&k<path.length-1){k++;return;}
      const s=Math.min(2.5,d*3+0.4);const ax=(dx/(d||1)*s-MZ.vx)*6,ay=(dy/(d||1)*s-MZ.vy)*6;
      send(clamp(ax/MZ_ACC,-1,1)*MZ_TILT,clamp(ay/MZ_ACC,-1,1)*MZ_TILT);},30);})`);
  const fzmc0=await ev('P().coins');
  for(let i=0;i<6;i++){
    await ev(`closeModal();mzStart(${i})`);
    const r=await ev('mzAuto()');
    check(`maze ${i+1} solved by tilting, never inside a wall`, r.done&&r.bad===0&&(await ev(`P().maze.solved.includes(MAZES[${i}].id)`)), r);
    if(i===3) await shot('B9-maze-bumpers-done');
  }
  await sleep(900);
  check('each new maze pays 3, and all 6 pay 5 more', (await ev('P().coins'))===fzmc0+6*3+5, await ev(`P().coins-${fzmc0}`));
  check('the done box offers Again and Next', (await ev(`document.querySelector('#modalBtns').textContent`)).includes('Again'));
  await shot('B10-maze-done');
  await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(100);
  check('after the last maze, Next goes back to maze 1', await ev(`MZ.i===0&&!MZ.done`));
  const fzrc0=await ev('P().coins'); const fzrr=await ev('mzAuto()'); await sleep(300);
  check('a replay pays 1', fzrr.done&&(await ev('P().coins'))===fzrc0+1&&(await ev('P().stats.mazes'))===7, [fzrr,await ev(`P().coins-${fzrc0}`)]);
  check('solved mazes get a ⭐ on their button', await ev(`[...document.querySelectorAll('#mazeBar [data-mz]')].every(b=>b.textContent.includes('⭐'))`));
  await ev(`closeModal();document.querySelector('#mzTilt').click()`);
  check('the Tilt button turns tilt off', await ev(`!MZ.tilt.on&&document.querySelector('#mzTilt').textContent.includes('OFF')`));
  await ev(`window.dispatchEvent(new DeviceOrientationEvent('deviceorientation',{alpha:0,beta:0,gamma:30}));document.querySelector('#mzTilt').click()`);
  check('...and on again', await ev(`MZ.tilt.on`));
  for(const k of await ev('Object.keys(MARBLES)')){await ev(`P().fid.marble='${k}';mzStart(4)`);await sleep(150);await shot('B11-marble-'+k);}
  await ev(`P().fid.marble='pearl';setFidTab('popit')`); await sleep(100);
  check('leaving the maze stops listening to the tilt sensor', await ev('!MZ.listening'));

  console.log('New fidgets: buying designs, backups');
  await ev(`P().coins+=100;updateCoins();setFidTab('slime')`);
  const fzbc0=await ev('P().coins');
  for(const [tab,id,key] of [['slime','mint','slime'],['cube','emo','cube'],['maze','galaxy','marble']]){
    await ev(`setFidTab('${tab}');document.querySelector('#skinRow [data-skin=${id}]').click()`); await sleep(100);
    await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(100);
    check(`buying the ${id} ${tab} owns it as ${key}:${id} and uses it`, await ev(`P().owned.includes('${key}:${id}')&&P().fid.${key}==='${id}'`));
  }
  check('the three designs cost 10 + 10 + 15', (await ev('P().coins'))===fzbc0-35, await ev(`${fzbc0}-P().coins`));
  check('a bought cube colour shows straight away', await ev(`getComputedStyle(cubeEl).getPropertyValue('--f').trim()===CUBES.emo.face`));
  const fzfCode=await ev('JSON.stringify(DB)');
  const fzv115=await ev(`(()=>{const d=JSON.parse(JSON.stringify(DB));d.version=9;d.profiles.forEach(p=>{delete p.maze;['slime','cube','marble'].forEach(k=>delete p.fid[k]);['stretches','clicks','mazes'].forEach(k=>delete p.stats[k]);p.owned=p.owned.filter(o=>!/^(slime|cube|marble):/.test(o));});return JSON.stringify(d);})()`);
  await ev(`doRestore(${JSON.stringify(fzv115)})`); await sleep(400);
  check('a v1.15 backup restores with the new fidgets at their defaults', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>Array.isArray(p.maze.solved)&&p.maze.solved.length===0&&p.fid.slime==='grape'&&p.fid.cube==='pastel'&&p.fid.marble==='pearl'&&p.stats.clicks===0)`));
  await ev(`doRestore(${JSON.stringify(fzfCode)})`); await sleep(400);
  check('a v1.16 backup keeps solved mazes, designs and counts', await ev(`(()=>{const p=DB.profiles.find(q=>q.maze.solved.length===6);return !!p&&p.fid.slime==='mint'&&p.owned.includes('marble:galaxy')&&p.stats.stretches>=5&&p.stats.clicks>=25;})()`));
  await ev(`closeModal();document.querySelector('.pcard').click()`); await sleep(1300); await ev(`closeModal();show('room')`);

  console.log('Seasons (v1.17): seasonal decorations, walls and windows');
  await ev(`closeModal();P().easy=false;seasonTest=null;show('room');goRoom(1);applyEasy()`); await sleep(150);
  check('the season comes from the date (Nov = autumn, Dec/Jan = winter, Mar = spring, Jul = summer, Sep = autumn)', await ev(`[[10,'autumn'],[11,'winter'],[0,'winter'],[2,'spring'],[6,'summer'],[8,'autumn']].every(([m,s])=>seasonNow(new Date(2026,m,15))===s)`));
  check('4 seasonal decorations and 1 wall for each season', await ev(`Object.keys(SEASONS).every(s=>Object.values(DECOR).filter(d=>d.season===s).length===4&&Object.values(WALLS).filter(w=>w.season===s).length===1)`));
  check('all 16 seasonal decorations exist', await ev(`['pumpkin','ghostGarland','leafPile','owlPlush','snowBunny','snowGarland','giftStack','pineTree','tulipPot','rainbowArch','eggBasket','butterflies','beachBall','donutFloat','lemonade','sunLamp'].every(k=>DECOR[k]&&DECOR[k].season)`));
  await ev(`P().coins=500;updateCoins();enterDecorate();document.querySelector('[data-dt=shop]').click()`); await sleep(150);
  check('seasonal things are not in the normal Shop', await ev(`!Object.keys(DECOR).filter(k=>DECOR[k].season).some(k=>document.querySelector('#decoGrid [data-buy='+k+']'))`));
  for(const s of ['autumn','winter','spring','summer']){
    await ev(`seasonTest='${s}';document.querySelector('[data-dt=season]').click()`); await sleep(120);
    check(`${s}: the Seasons tab lists ${s} first, marked "In season!"`, await ev(`(()=>{const h=document.querySelector('#decoGrid .grid-head');return h.classList.contains('now')&&h.textContent.includes(SEASONS['${s}'].name)&&h.textContent.includes('In season')&&document.querySelectorAll('#decoGrid .grid-head.now').length===1;})()`));
    check(`${s}: the Seasons tab shows the ${s} icon`, await ev(`document.querySelector('[data-dt=season]').textContent.startsWith(SEASONS['${s}'].icon)`));
    await shot('C1-seasons-tab-'+s);
  }
  check('the Seasons tab has all 16 decorations and 4 walls, all year', await ev(`document.querySelectorAll('#decoGrid [data-buy]').length===16&&document.querySelectorAll('#decoGrid [data-surf][data-kind=wall]').length===4&&document.querySelectorAll('#decoGrid .grid-head').length===4`));
  await ev(`seasonTest='autumn';document.querySelector('[data-dt=season]').click()`); await sleep(100);
  const ssc0=await ev('P().coins');
  await ev(`document.querySelector('#decoGrid [data-buy=pumpkin]').click()`); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(150);
  check('buying the Smiley Pumpkin puts it in the room for 15 coins', (await ev(`P().room.items.some(i=>i.type==='pumpkin'&&i.placed)`))&&(await ev('P().coins'))===ssc0-15, await ev('P().coins'));
  await ev(`document.querySelector('#decoGrid [data-surf=winterSnow]').click()`); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(150);
  check('a seasonal wall bought in the Seasons tab is owned and goes up', await ev(`P().owned.includes('wall:winterSnow')&&P().room.wall==='winterSnow'`));
  check('the wall in use is marked in the Seasons tab', await ev(`document.querySelector('#decoGrid [data-surf=winterSnow]').classList.contains('on')`));
  await ev(`document.querySelector('[data-dt=wall]').click()`); await sleep(100);
  check('seasonal walls are in the Walls tab too', await ev(`['autumnLeaves','winterSnow','springBloom','summerWaves'].every(k=>document.querySelector('#decoGrid [data-surf='+k+']'))`));
  await ev(`document.querySelector('#decoGrid [data-surf=lavender]').click()`); await sleep(100);
  await ev(`document.querySelector('[data-dt=floor]').click()`); await sleep(100);
  await ev(`document.querySelector('#decoGrid [data-surf=wood]').click()`); await sleep(100);
  check('the Walls and Floors tabs still change the right thing', await ev(`P().room.wall==='lavender'&&P().room.floor==='wood'`));
  await ev(`P().easy=true;applyEasy();document.querySelector('[data-dt=season]').click()`); await sleep(100);
  check('Easy mode: the Seasons tab still lists every season and item', await ev(`document.querySelectorAll('#decoGrid .grid-head').length===4&&document.querySelectorAll('#decoGrid [data-buy]').length===16`));
  await shot('C1-seasons-tab-easy');
  await ev(`P().easy=false;applyEasy();exitDecorate()`);
  for(const s of ['autumn','winter','spring','summer']){
    await ev(`seasonTest='${s}';goRoom(1)`); await sleep(120);
    check(`${s}: her room's window shows ${s}`, await ev(`document.querySelectorAll('#roomSvg [data-hot=window] [data-season=${s}]').length===2`));
    await shot('C2-window-'+s);
    await ev(`goRoom(2)`); await sleep(120);
    check(`${s}: the Loft's round window shows ${s}`, await ev(`document.querySelectorAll('#roomSvg [data-season=${s}]').length===1`));
    await shot('C3-loft-window-'+s);
  }
  await ev(`goRoom(1)`); await sleep(100);
  await ev(`document.querySelector('#roomSvg [data-hot=window] [data-season]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(150);
  check('tapping the seasonal window still opens the Soccer Field', await ev(`cur==='soccer'`));
  await ev(`show('room');goRoom(2);{const R=P().room2;R.items=R.items.filter(i=>!DECOR[i.type].season);for(const k of Object.keys(DECOR).filter(k=>DECOR[k].season))R.items.push(Object.assign({uid:uid(),type:k,placed:true},spot(k)));}save();renderRoom()`); await sleep(200);
  check('every seasonal decoration draws in the room', await ev(`Object.keys(DECOR).filter(k=>DECOR[k].season).every(k=>{const i=P().room2.items.find(x=>x.type===k);const g=document.querySelector('#roomSvg .deco[data-uid="'+i.uid+'"]');return g&&g.getBBox().width>20;})`));
  check('the Donut Float lies flat; the garlands and rainbow hang on the wall', await ev(`!!DECOR.donutFloat.flat&&['ghostGarland','snowGarland','rainbowArch','butterflies'].every(k=>DECOR[k].wall)`));
  await shot('C4-loft-all-seasonal');
  await ev(`{const R=P().room2;R.items=R.items.filter(i=>!DECOR[i.type].season);}seasonTest=null;save();goRoom(1)`);
  const ssCode=await ev('JSON.stringify(DB)'), ssId=await ev('P().id');
  await ev(`doRestore(${JSON.stringify(ssCode)})`); await sleep(400);
  check('a backup keeps seasonal decorations and walls', await ev(`(()=>{const p=DB.profiles.find(q=>q.id==='${ssId}');return !!p&&p.owned.includes('wall:winterSnow')&&p.room.items.some(i=>i.type==='pumpkin');})()`));
  await ev(`closeModal();document.querySelector('.pcard[data-id="${ssId}"]').click()`); await sleep(1300); await ev(`closeModal();show('room')`);

  console.log('Sticker Book (v1.18)');
  await ev(`closeModal();P().easy=false;show('room');goRoom(1);applyEasy()`); await sleep(500);
  check('49 stickers on 6 pages (4 for the pet since v1.19), ids all different, 6 or more per page', await ev(`STICKERS.length===49&&new Set(STICKERS.map(s=>s.id)).size===49&&Object.keys(STK_PAGES).length===6&&Object.keys(STK_PAGES).every(k=>STICKERS.filter(s=>s.page===k).length>=6)`));
  check('every sticker draws and can measure progress', await ev(`STICKERS.every(s=>STK_SHAPES[s.shape]&&/<svg[^>]*>.*<path/.test(stickerSVG(s))&&Number.isFinite(stkHave(P(),s))&&stkNeed(s)>0)`));
  check('stickers are given only through the book code (none yet while paused)', await ev(`P().stickers.length===0`));
  const sk0=await ev('P().coins'), skWant=await ev(`STICKERS.filter(s=>stkDone(P(),s)).length`);
  await ev(`stkPaused=false;show('room')`); await sleep(900);
  const skGot=await ev('P().stickers.length');
  check('stickers she already earned arrive the first time (many, from all the games played)', skGot===skWant&&skGot>=10, [skGot,skWant]);
  check('+2 coins for each one', (await ev('P().coins'))===sk0+2*skGot, [sk0,await ev('P().coins'),skGot]);
  check('several at once in the room get one happy box', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&document.querySelector('#modalTitle').textContent.includes('new stickers')&&document.querySelectorAll('#modalBody .stk-few svg').length>=3`));
  await shot('D1-stickers-welcome');
  await ev(`closeModal()`);
  const sk1=await ev('P().coins');
  check('never given twice', (await ev('checkStickers().length'))===0&&(await ev('P().coins'))===sk1);
  check('the 📒 button has a dot for new stickers', await ev(`!document.querySelector('#stkDot').classList.contains('hidden')`));
  await ev(`document.querySelector('#stkBtn').click()`); await sleep(250);
  check('📒 opens the Sticker Book on the Fidgets page', await ev(`cur==='stickers'&&document.querySelectorAll('#stkPage .stk').length===STICKERS.filter(s=>s.page==='fidget').length`));
  check('the count shows stickers got / all', await ev(`document.querySelector('#stkCount').textContent===P().stickers.length+' / '+STICKERS.length`));
  check('earned stickers are in colour with their name; the rest are grey with a hint and a bar', await ev(`[...document.querySelectorAll('#stkPage .stk')].every(b=>{const s=STICKERS.find(x=>x.id===b.dataset.stk), got=P().stickers.includes(s.id);return got?!b.classList.contains('locked')&&b.querySelector('.sn').textContent===s.name:b.classList.contains('locked')&&b.querySelector('.sn').textContent===s.hint&&!!b.querySelector('.sbar');})`));
  check('new stickers sparkle', await ev(`document.querySelectorAll('#stkPage .stk.new').length>0`));
  await shot('D2-stickers-fidgets');
  check('stickers on a page count as seen once it is open', await ev(`!P().stickerNew.some(id=>STICKERS.find(s=>s.id===id).page==='fidget')`));
  check('other pages with new stickers show a dot on their tab', await ev(`P().stickerNew.length===0||!!document.querySelector('#stkTabs .stk-dot')`));
  for(const pg of ['art','soccer','stage','code','room']){await ev(`document.querySelector('#stkTabs [data-page=${pg}]').click()`); await sleep(120); await shot('D3-stickers-'+pg);}
  check('after every page is seen, the dot goes away', await ev(`P().stickerNew.length===0&&document.querySelector('#stkDot').classList.contains('hidden')`));
  const skLocked=await ev(`(STICKERS.find(s=>!P().stickers.includes(s.id))||{}).id`);
  if(skLocked){
    await ev(`stkPage=STICKERS.find(s=>s.id==='${skLocked}').page;renderStickers();document.querySelector('#stkPage [data-stk=${skLocked}]').click()`); await sleep(150);
    check('tapping a grey sticker says what to do and how far she is', await ev(`(()=>{const s=STICKERS.find(x=>x.id==='${skLocked}');const t=document.querySelector('#modalBody').textContent;return document.querySelector('#modalTitle').textContent.includes('Not yet')&&t.includes(s.hint)&&t.includes(stkHave(P(),s).toLocaleString()+' / '+stkNeed(s).toLocaleString());})()`));
    await shot('D4-sticker-locked'); await ev(`closeModal()`);
  }
  check('Back goes from the Sticker Book to the room', await ev(`window.androidBack()&&cur==='room'`));
  // the daily gift is counted (a plain count, never lost), and the 7th one gives a sticker
  await ev(`P().stickers=P().stickers.filter(x=>x!=='daily7');P().stats.dailies=6;P().lastDaily='';save()`);
  const sk2=await ev('P().coins');
  await ev(`enterRoom()`); await sleep(1100);
  check('opening the daily gift counts it', (await ev('P().stats.dailies'))===7);
  check('the 7th daily gift gives the Gift Box sticker (+10 gift, +2 sticker), with a message, not a box', (await ev(`P().stickers.includes('daily7')&&document.querySelector('#modal').classList.contains('hidden')`))&&(await ev('P().coins'))===sk2+12, [sk2,await ev('P().coins')]);
  // a sticker earned in the middle of a game: a short message only
  await ev(`P().stickers=P().stickers.filter(x=>x!=='click500');P().stats.clicks=Math.max(P().stats.clicks,500);show('fidget');setFidTab('cube')`); await sleep(2600);
  check('a sticker earned while playing shows a message (no box over the game)', await ev(`P().stickers.includes('click500')&&document.querySelector('#modal').classList.contains('hidden')&&document.querySelector('#toast').textContent.includes('Click Click')`));
  await ev(`show('room')`); await sleep(200);
  check('a new sticker brings the dot back', await ev(`!document.querySelector('#stkDot').classList.contains('hidden')`));
  await ev(`P().easy=true;openStickers('room')`); await sleep(200); await shot('D5-stickers-easy');
  check('Easy mode: big stickers, no hint text on grey ones', await ev(`document.querySelector('#stkPage .stk svg').getBoundingClientRect().width>=104&&[...document.querySelectorAll('#stkPage .stk.locked .sn')].every(e=>getComputedStyle(e).display==='none')`));
  await ev(`P().easy=false;show('room')`);
  console.log('Stickers in backups');
  const skCode=await ev('JSON.stringify(DB)'), skId=await ev('P().id'), skN=await ev('P().stickers.length');
  const sk117=await ev(`(()=>{const d=JSON.parse(JSON.stringify(DB));d.version=10;d.profiles.forEach(p=>{delete p.stickers;delete p.stickerNew;delete p.stats.dailies;});return JSON.stringify(d);})()`);
  await ev(`doRestore(${JSON.stringify(sk117)})`); await sleep(400);
  check('a v1.17 backup restores with an empty sticker book', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>Array.isArray(p.stickers)&&p.stickers.length===0&&p.stickerNew.length===0&&p.stats.dailies===0)`));
  await ev(`doRestore(${JSON.stringify(skCode)})`); await sleep(400);
  check('a v1.18 backup keeps the stickers', await ev(`DB.profiles.find(p=>p.id==='${skId}').stickers.length===${skN}`));
  await ev(`closeModal();document.querySelector('.pcard[data-id="${skId}"]').click()`); await sleep(1300);
  const sk3=await ev('P().coins'); await ev(`closeModal()`); await sleep(2200);
  check('no stickers (or coins) are given again after restoring', (await ev('P().stickers.length'))===skN&&(await ev('P().coins'))===sk3);
  await ev(`closeModal();show('room')`);

  console.log('Pet (v1.19)');
  await ev(`closeModal();stkPaused=true;P().easy=false;P().coins=100;show('room');goRoom(1);applyEasy()`); await sleep(300);
  check('4 pets, 5 things to wear, 5 tricks (Wiggle from the start, then 10 / 30 / 60 / 100 hearts)', await ev(`Object.keys(PETS).length===4&&Object.keys(PET_ACC).length===5&&PET_TRICKS.map(t=>t.at).join()==='0,10,30,60,100'`));
  check('every pet draws with every thing to wear', await ev(`Object.keys(PETS).every(k=>['none',...Object.keys(PET_ACC)].every(a=>/<path|<ellipse|<circle/.test(petArt(k,a))))`));
  check('before she picks a pet, an empty bed with a 🐾 ? waits by Fuzzy', await ev(`P().pet.kind===''&&!!document.querySelector('#roomSvg #petG .pet-ask')&&!document.querySelector('#petBody')`));
  await shot('E1-pet-bed');
  await ev(`document.querySelector('#petG .pet-ask').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(150);
  check('tapping the bed opens "Pick a pet!" with all 4 pets', await ev(`document.querySelector('#modalTitle').textContent.includes('Pick a pet')&&document.querySelectorAll('#modalBody [data-pet]').length===4`));
  await shot('E2-pet-pick');
  const pc0=await ev('P().coins');
  await ev(`document.querySelector('#modalBody [data-pet=ghostCat]').click()`); await sleep(300);
  check('picking the Ghost Kitten is free and she sits in the bed', (await ev(`P().pet.kind==='ghostCat'&&P().pet.hearts.ghostCat===0&&!!document.querySelector('#roomSvg #petBody')&&document.querySelector('#modal').classList.contains('hidden')`))&&(await ev('P().coins'))===pc0);
  check('her default name is Misty', await ev(`petName(P())==='Misty'&&document.querySelector('#bubble').textContent.includes('Misty')`));
  await ev(`document.querySelector('#petBody').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(150);
  check('tapping the pet opens her menu: Pet, Treat, Dress, Name, Change', await ev(`document.querySelector('#modalTitle').textContent.includes('Misty')&&['pat','treat','dress','name','change'].every(a=>document.querySelector('#modalBody [data-pa='+a+']'))`));
  await shot('E3-pet-menu');
  await ev(`PET.last=0;document.querySelector('#modalBody [data-pa=pat]').click()`); await sleep(100);
  check('🤚 Pet: +1 heart, a heart floats up and she does a trick', await ev(`P().pet.hearts.ghostCat===1&&!!document.querySelector('#roomSvg .pet-heart')&&/t-/.test(document.querySelector('#petBody').getAttribute('class'))&&document.querySelector('#modal').classList.contains('hidden')`));
  await shot('E4-pet-pat');
  await ev(`petPat()`); await sleep(100);
  check('patting again straight away still does a trick but gives no extra heart', await ev(`P().pet.hearts.ghostCat===1&&/t-/.test(document.querySelector('#petBody').getAttribute('class'))`));
  check('the pet never earns coins', (await ev('P().coins'))===pc0);
  await ev(`P().pet.hearts.ghostCat=9;PET.last=0;petPat()`); await sleep(900);
  check('the 10th heart teaches Spin, and she shows it', await ev(`P().pet.hearts.ghostCat===10&&document.querySelector('#petBody').classList.contains('t-spin')&&document.querySelector('#bubble').textContent.includes('Spin')`));
  await ev(`petMenu()`); await sleep(100);
  check('the menu shows the hearts and the next trick', await ev(`document.querySelector('#modalBody .pet-h').textContent.includes('10')&&document.querySelector('#modalBody .pet-sub').textContent.includes('30')&&document.querySelectorAll('#modalBody .pet-tricks span.on').length===2`));
  await ev(`document.querySelector('#modalBody [data-pa=treat]').click()`); await sleep(100);
  await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(200);
  check('🍪 Treat costs 2 coins and gives 3 hearts', (await ev('P().pet.hearts.ghostCat'))===13&&(await ev('P().coins'))===pc0-2&&(await ev(`!!document.querySelector('#roomSvg .pet-cookie')`)));
  await ev(`P().coins=1;updateCoins();petTreat()`); await sleep(100);
  check('no treat without enough coins (and no hearts)', await ev(`P().pet.hearts.ghostCat===13&&P().coins===1&&document.querySelector('#modal').classList.contains('hidden')`));
  await ev(`P().coins=100;updateCoins();petDress()`); await sleep(100);
  check('🎀 Dress shows Nothing + 5 things to wear, on her own pet', await ev(`document.querySelectorAll('#modalBody [data-acc]').length===6&&document.querySelector('#modalBody [data-acc=none]').classList.contains('on')`));
  await shot('E5-pet-dress');
  await ev(`document.querySelector('#modalBody [data-acc=crown]').click()`); await sleep(100);
  await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(200);
  check('buying the Little Crown (15) puts it on her', await ev(`P().owned.includes('petacc:crown')&&P().pet.acc==='crown'&&P().coins===85&&!!document.querySelector('#petBody circle[fill="#ff4fa3"][r="3"]')`));
  check('the Dress-up box stays open with the crown ticked', await ev(`!!document.querySelector('#modalBody [data-acc=crown].on')`));
  await ev(`document.querySelector('#modalBody [data-acc=none]').click()`); await sleep(100);
  await ev(`document.querySelector('#modalBody [data-acc=crown]').click()`); await sleep(100);
  check('taking it off and putting it back on is free', await ev(`P().pet.acc==='crown'&&P().coins===85&&document.querySelector('#modalTitle').textContent.includes('Dress')`));
  await ev(`closeModal()`); await shot('E6-pet-crown');
  await ev(`petRename()`); await sleep(100);
  await ev(`document.querySelector('#rnName').value='Wisp';[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(150);
  check('✏️ Name: she becomes Wisp (the menu opens again)', await ev(`P().pet.names.ghostCat==='Wisp'&&document.querySelector('#modalTitle').textContent.includes('Wisp')`));
  await ev(`document.querySelector('#modalBody [data-pa=change]').click()`); await sleep(100);
  check('🔄 Change shows all 4, with her hearts on the Ghost Kitten', await ev(`document.querySelectorAll('#modalBody [data-pet]').length===4&&document.querySelector('#modalBody [data-pet=ghostCat]').classList.contains('on')&&document.querySelector('#modalBody [data-pet=ghostCat]').textContent.includes('13')`));
  await ev(`document.querySelector('#modalBody [data-pet=starHam]').click()`); await sleep(200);
  check('switching to the Star Hamster: Twinkle, 0 hearts, still wearing the crown', await ev(`P().pet.kind==='starHam'&&petName(P())==='Twinkle'&&petHearts(P())===0&&!!document.querySelector('#petBody circle[fill="#ff4fa3"][r="3"]')`));
  await shot('E7-pet-hamster');
  await ev(`petChoose();document.querySelector('#modalBody [data-pet=ghostCat]').click()`); await sleep(200);
  check('switching back: Wisp still has her 13 hearts', await ev(`P().pet.kind==='ghostCat'&&petName(P())==='Wisp'&&petHearts(P())===13`));
  for(const k of ['bat','cloudPup','starHam','ghostCat']){await ev(`P().pet.kind='${k}';renderRoom()`); await sleep(80); await shot('E8-pet-'+k);}
  await ev(`goRoom(2)`); await sleep(150);
  check('the pet is by Fuzzy in the Loft too', await ev(`!!document.querySelector('#roomSvg #petBody')`));
  await shot('E9-pet-loft'); await ev(`goRoom(1)`);
  await ev(`enterDecorate()`); await sleep(100);
  check('while decorating, tapping the pet does nothing', await ev(`getComputedStyle(document.querySelector('#petG')).pointerEvents==='none'`));
  await ev(`exitDecorate();petMenu()`); await sleep(100);
  check('Back closes the pet menu', await ev(`window.androidBack()&&document.querySelector('#modal').classList.contains('hidden')&&cur==='room'`));
  // stickers for the pet (Room & Style page)
  const pc1=await ev('P().coins');
  await ev(`stkPaused=false;checkStickers()`); const pGot=await ev(`P().stickers.filter(id=>/^pet/.test(id)).sort().join()`);
  check('pet stickers: New Friend and Pet Stylist (+2 each)', pGot==='pet1,petDress'&&(await ev('P().coins'))===pc1+4, pGot);
  await ev(`P().pet.hearts.ghostCat=99;PET.last=0;petPat()`); await sleep(100);
  await ev('checkStickers()'); const pGot2=await ev(`P().stickers.filter(id=>/^pet/.test(id)&&!['pet1','petDress'].includes(id)).sort().join()`);
  check('100 hearts: Dance, and the Best Buddies and Trick Star stickers', pGot2==='petLove,petTricks'&&(await ev(`petKnows(petHearts(P())).length===5`)), pGot2);
  await ev(`closeModal()`); await sleep(100);
  console.log('Pet in backups');
  const ptCode=await ev('JSON.stringify(DB)'), ptId=await ev('P().id');
  const pt118=await ev(`(()=>{const d=JSON.parse(JSON.stringify(DB));d.version=11;d.profiles.forEach(p=>{delete p.pet;p.owned=p.owned.filter(o=>!/^petacc:/.test(o));});return JSON.stringify(d);})()`);
  await ev(`doRestore(${JSON.stringify(pt118)})`); await sleep(400);
  check('a v1.18 backup restores with no pet yet (save version 12+)', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.pet.kind===''&&p.pet.acc==='none'&&Object.keys(p.pet.hearts).length===0)`));
  const ptBad=await ev(`(()=>{const d=JSON.parse(JSON.stringify(DB));d.profiles[0].pet={kind:'dragon',acc:'cape',names:{bat:7,ghostCat:'Wisp'},hearts:{bat:-5,ghostCat:'12'}};return JSON.stringify(d);})()`);
  await ev(`doRestore(${JSON.stringify(ptBad)})`); await sleep(400);
  check('odd pet data is made safe (unknown pet = the empty bed)', await ev(`(()=>{const p=DB.profiles[0];return p.pet.hearts.bat===0&&p.pet.hearts.ghostCat===12&&!('bat' in p.pet.names)&&petKind(p)===''&&petAcc(p)==='none';})()`));
  await ev(`doRestore(${JSON.stringify(ptCode)})`); await sleep(400);
  check('a v1.19 backup keeps the pet, her name, hearts and crown', await ev(`(()=>{const p=DB.profiles.find(q=>q.id==='${ptId}');return p.pet.kind==='ghostCat'&&p.pet.names.ghostCat==='Wisp'&&p.pet.hearts.ghostCat===100&&p.pet.acc==='crown'&&p.owned.includes('petacc:crown');})()`));
  await ev(`closeModal();document.querySelector('.pcard[data-id="${ptId}"]').click()`); await sleep(1300); await ev(`closeModal();show('room')`);
  await ev(`P().easy=true;applyEasy();petMenu()`); await sleep(150); await shot('E10-pet-menu-easy');
  check('Easy mode: the pet menu buttons are big', await ev(`[...document.querySelectorAll('#modalBody [data-pa]')].every(b=>b.getBoundingClientRect().height>=52)`));
  await ev(`closeModal();P().easy=false;applyEasy()`);

  console.log('Buddies (v1.20): animal buddies, faces, starter looks, room colour tints');
  await ev(`stkPaused=true`);
  check('5 buddies, 3 faces, 6 starter looks', await ev(`Object.keys(BUDDIES).join()==='bunny,bear,puppy,dino,fox'&&Object.keys(FACES).join()==='sparkle,bright,cheeky'&&Object.keys(STARTERS).length===6`));
  check('every buddy draws with every face and fur', await ev(`Object.keys(BUDDIES).every(k=>Object.keys(FACES).every(fc=>Object.keys(FUR).every(fu=>{const s=mascotSVG(Object.assign({},DEFAULT_LOOK,{kind:k,face:fc,fur:fu}));return s.length>2000&&!/undefined|NaN/.test(s);})))`));
  check('every starter look uses real closet items', await ev(`Object.keys(STARTERS).every(k=>{const L=starterLook(k);return Object.keys(CLOSET).every(c=>CLOSET[c].items.some(i=>i.id===L[c]))&&FUR[STARTERS[k].fur];})`));
  check('an old look (no buddy, no face) draws exactly like before: a bunny with the Sparkly face', await ev(`(()=>{const o=Object.assign({},DEFAULT_LOOK);delete o.kind;delete o.face;return mascotSVG(o)===mascotSVG(DEFAULT_LOOK)&&mascotSVG(Object.assign({},o,{kind:'dragon',face:'x'}))===mascotSVG(DEFAULT_LOOK);})()`));
  check('the new short hair, tee, shorts, high-tops and cap draw', await ev(`['hair:buzz','hair:messy','hair:sidePart','top:stripeTee','bottom:cargo','shoes:hightops','acc:capBack'].every(k=>{const [c,i]=k.split(':');return CLOSET[c].items.some(x=>x.id===i)&&!/undefined|NaN/.test(mascotSVG(Object.assign({},DEFAULT_LOOK,{[c]:i})));})`));
  check('hair colours work on the new hair', await ev(`mascotSVG(Object.assign({},DEFAULT_LOOK,{hair:'messy',hairColor:'streak'})).includes('#ff6fae')`));
  // the Closet: 🐾 Buddy is the first tab, and buddies and faces are free
  await ev(`closeModal();show('closet')`); await sleep(200);
  check('the Closet starts with 🐾 Buddy and has a 😊 Face tab', await ev(`(()=>{const t=[...document.querySelectorAll('#closetTabs [data-cat]')].map(b=>b.dataset.cat);return t[0]==='kind'&&t.includes('face');})()`));
  const bc0=await ev('P().coins'), bLook=await ev('JSON.stringify(P().look)');
  await ev(`document.querySelector('#closetTabs [data-cat=kind]').click()`); await sleep(150);
  check('the Buddy tab shows 5 buddies, all free', await ev(`document.querySelectorAll('#closetGrid .tile').length===5&&!document.querySelector('#closetGrid .tile.locked')`));
  await ev(`document.querySelector('#closetGrid [data-id=dino]').click()`); await sleep(150);
  await ev(`document.querySelector('#closetTabs [data-cat=face]').click()`); await sleep(150);
  await ev(`document.querySelector('#closetGrid [data-id=cheeky]').click()`); await sleep(150); await shot('F1-closet-dino');
  check('picking Little Dino and Cheeky Grin: free, and the rest of the outfit stays', await ev(`(()=>{const L=P().look,o=${bLook};return L.kind==='dino'&&L.face==='cheeky'&&L.top===o.top&&L.hair===o.hair&&P().coins===${bc0};})()`));
  check('the Closet picture is a dino now', await ev(`document.querySelector('#closetMascot').innerHTML.includes('M89 45 L100 10')`));
  await ev(`document.querySelector('#randomBtn').click()`); await sleep(100);
  check('Surprise me keeps the buddy, face and fur', await ev(`P().look.kind==='dino'&&P().look.face==='cheeky'&&P().look.fur===${JSON.stringify(JSON.parse(bLook).fur)}`));
  for(const k of Object.keys(await ev('BUDDIES'))){await ev(`P().look.kind='${k}';renderCloset()`); await sleep(80); await shot('F2-buddy-'+k);}
  await ev(`P().look.kind='dino';save();show('room')`); await sleep(250); await shot('F3-room-dino');
  check('the room shows the dino too', await ev(`document.querySelector('#mascotG').innerHTML.includes('M89 45 L100 10')`));
  check('the pet still sits by the dino', await ev(`!!document.querySelector('#petG')`));
  check('rooms from before v1.20 get the tint OFF (save step 13)', await ev(`(()=>{const d={profiles:[{},{tint:true}]};MIGRATIONS[13](d);return d.profiles[0].tint===false&&d.profiles[1].tint===true;})()`));
  // make a new room from a starter look
  const nRooms=await ev('DB.profiles.length'), prevId=await ev('P().id');
  await ev(`show('profiles')`); await sleep(150);
  check('the profile screen shows three buddies', await ev(`document.querySelectorAll('#profHero svg').length===3`));
  await ev(`roomModal(null)`); await sleep(150); await shot('F4-new-room');
  check('the New Room box shows 6 buddy pictures (no words), the classic bunny picked', await ev(`(()=>{const b=[...document.querySelectorAll('#npStart [data-start]')];return b.length===6&&b.every(x=>x.children.length===1&&x.firstElementChild.tagName==='svg')&&b[0].classList.contains('on')&&b[0].dataset.start==='emo';})()`));
  check('every buddy picture is at least 48 px', await ev(`[...document.querySelectorAll('#npStart button')].every(b=>{const r=b.getBoundingClientRect();return r.width>=48&&r.height>=48;})`));
  await ev(`document.querySelector('#npStart [data-start=dino]').click()`); await sleep(100);
  check('picking the dino picks Mint fur', await ev(`document.querySelector('#npFur .on').dataset.fur==='mint'`));
  await ev(`document.querySelector('#npFur [data-fur=sky]').click()`); await sleep(100);
  check('picking Sky fur shows every buddy in Sky, the dino still picked', await ev(`document.querySelector('#npStart .on').dataset.start==='dino'&&document.querySelector('#npStart').innerHTML.split('#c4e2ff').length>6`));
  await ev(`document.querySelector('#npCol [data-col=green]').click();document.querySelector('#npName').value='Rexy';[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(700);
  check('the new room has the dino starter look in Sky', await ev(`(()=>{const p=P(),L=p.look;return p.name==='Rexy'&&L.kind==='dino'&&L.face==='cheeky'&&L.fur==='sky'&&L.top==='hoodie'&&L.bottom==='cargo'&&L.shoes==='hightops';})()`));
  check('the starter clothes are hers for free (no coins spent, hoodie owned)', await ev(`[25,35].includes(P().coins)&&P().owned.includes('top:hoodie')`));
  check('a new room is tinted: green buttons and bars', await ev(`P().tint===true&&document.body.classList.contains('tint')&&document.body.style.getPropertyValue('--pink')==='#7ee08a'`));
  check('a tinted button really is green', await ev(`(()=>{const b=document.createElement('button');b.className='btn pink';document.body.appendChild(b);const c=getComputedStyle(b).backgroundColor;b.remove();return c==='rgb(126, 224, 138)';})()`));
  await shot('F5-green-room'); await ev(`show('closet')`); await sleep(200); await shot('F6-green-closet');
  await ev(`show('profiles')`); await sleep(150);
  check('the profile screen is never tinted', await ev(`!document.body.classList.contains('tint')&&!document.body.style.getPropertyValue('--pink')`));
  // switch the tint off (✏️ under the room) and back
  const rexId=await ev('P().id');
  await ev(`roomModal(P())`); await sleep(150);
  check('the Change Room box has the tint switch (ON) and no buddy pictures', await ev(`document.querySelector('#npTint b').textContent==='ON'&&!document.querySelector('#npStart')`));
  await ev(`document.querySelector('#npTint').click();[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(200);
  await ev(`document.querySelector('.pcard[data-id="${rexId}"]').click()`); await sleep(500); await ev(`closeModal();show('room')`);
  check('tint OFF: the classic pink and purple', await ev(`P().tint===false&&!document.body.classList.contains('tint')`));
  await ev(`P().tint=true;P().color='pink';applyEasy()`);
  check('a pink room with the tint on looks classic', await ev(`!document.body.classList.contains('tint')`));
  for(const c of ['mint','gold','sky','peach','green','blue']){await ev(`P().color='${c}';applyEasy()`); await sleep(60); await shot('F7-tint-'+c);}
  check('every room colour tints', await ev(`Object.keys(ROOM_COLORS).filter(c=>c!=='pink'&&c!=='purple').every(c=>TINTS[c])`));
  await ev(`P().color='green';applyEasy();P().easy=true;applyEasy()`);
  check('Easy mode and the tint work together', await ev(`document.body.classList.contains('tint')&&document.body.classList.contains('easy')`));
  await ev(`P().easy=false;applyEasy()`);
  // photocards: an old card (no buddy in its look) still draws a bunny; a new card shows the dino
  check('an old photocard look draws a bunny; a dino card draws a dino', await ev(`(()=>{const o=Object.assign({},DEFAULT_LOOK);delete o.kind;delete o.face;const old=cardSVG({no:1,at:0,look:o,stage:'spot',frame:'sparkle',title:'Best Bunny',name:'Test'}),dn=cardSVG({no:2,at:0,look:P().look,stage:'spot',frame:'sparkle',title:'Best Bunny',name:'Test'});return old.includes('rotate(-14 74 70)')&&dn.includes('M89 45 L100 10');})()`));
  console.log('Buddies in backups');
  const bdCode=await ev('JSON.stringify(DB)');
  const bd119=await ev(`(()=>{const d=JSON.parse(JSON.stringify(DB));d.version=12;d.profiles.forEach(p=>{delete p.tint;delete p.look.kind;delete p.look.face;});return JSON.stringify(d);})()`);
  await ev(`doRestore(${JSON.stringify(bd119)})`); await sleep(400);
  check('a v1.19 backup restores as bunnies, Sparkly faces, no tint (save version 13)', await ev(`DB.version===DB_VERSION&&DB_VERSION===13&&DB.profiles.every(p=>p.look.kind==='bunny'&&p.look.face==='sparkle'&&p.tint===false)`));
  const bdBad=await ev(`(()=>{const d=JSON.parse(JSON.stringify(DB));d.profiles[0].look.kind='dragon';d.profiles[0].look.face=7;d.profiles[0].tint='yes';return JSON.stringify(d);})()`);
  await ev(`doRestore(${JSON.stringify(bdBad)})`); await sleep(400);
  check('odd buddy data is made safe', await ev(`(()=>{const p=DB.profiles[0];return p.look.kind==='bunny'&&p.look.face==='sparkle'&&p.tint===true;})()`));
  await ev(`doRestore(${JSON.stringify(bdCode)})`); await sleep(400);
  check('a v1.20 backup keeps the dino and the tint', await ev(`(()=>{const p=DB.profiles.find(q=>q.id==='${rexId}');return p&&p.look.kind==='dino'&&p.look.face==='cheeky'&&p.tint===true;})()`));
  // tidy up: remove the test room and go back to the earlier one
  await ev(`closeModal();DB.profiles=DB.profiles.filter(p=>p.id!=='${rexId}');DB.activeId='${prevId}';P().look.kind='bunny';P().look.face='sparkle';save();show('room')`); await sleep(200);
  check('back to the earlier room', await ev(`DB.profiles.length===${nRooms}&&P().id==='${prevId}'`));

  console.log('Phone portrait + other screens');
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true});
  await ev(`show('art');setArtView('pad');document.querySelector('[data-tool=stamp]').click()`); await sleep(300);
  const pr=await padRect(); check('phone pad visible', pr.w>200&&pr.h>140, pr);
  await shot('09-phone-pad');
  await ev(`setArtView('gal')`); await sleep(400); await shot('10-phone-gallery');
  await ev(`show('cards');setCardView('make')`); await sleep(300); await shot('27-phone-card-maker');
  const big=await ev(`(()=>{const r=document.querySelector('#cardBig svg').getBoundingClientRect();return {w:r.width,h:r.height};})()`);
  check('phone card preview visible', big.h>150, big);
  await ev(`setCardView('binder')`); await sleep(300); await shot('28-phone-binder');
  await ev(`show('soccer')`); await sleep(400); await shot('49-phone-soccer');
  check('phone soccer canvas visible', await ev(`SOC.g&&SOC.g.GW>200`), await ev('SOC.g&&SOC.g.GW'));
  await ev(`show('stage')`); await sleep(300); await shot('78-phone-stage-songs');
  await ev(`P().stage.level='hard';stStart('starlight')`); await sleep(4600); await shot('79-phone-stage-play');
  check('phone stage: 3 pads fit on screen', await ev(`STG.g.xs[0]-STG.g.pr>0&&STG.g.xs[2]+STG.g.pr<innerWidth`), await ev('JSON.stringify(STG.g)'));
  await ev(`show('code');clOpen('hard',3)`); await sleep(300); await shot('A27-phone-code');
  check('phone: Code Lab board and Run button both on screen', await ev(`(()=>{const b=document.querySelector('#clBoard').getBoundingClientRect(),r=document.querySelector('#clRun').getBoundingClientRect();return b.height>150&&r.bottom<=innerHeight&&r.height>=48;})()`));
  await ev(`clPickView()`); await sleep(150); await shot('A35-phone-code-tabs');
  check('phone: all 6 Code Lab tabs fit without scrolling', await ev(`(()=>{const t=document.querySelector('#clTabs');return t.scrollWidth<=t.clientWidth&&[...t.children].every(b=>b.getBoundingClientRect().height>=44);})()`));
  await ev(`clOpen('challenge',7);CL.move=[...'QRQUS'];CL.prog=['4','M'];clProg()`); await sleep(200); await shot('A43-phone-code-challenge');
  check('phone: Challenge puzzle (10 palette blocks, both rows) fits with ▶️ Run on screen', await ev(`(()=>{const r=document.querySelector('#clRun').getBoundingClientRect(),b=document.querySelector('#clBoard').getBoundingClientRect();return r.bottom<=innerHeight&&b.height>120;})()`));
  await ev(`clOpen('move',4);CL.move=[...'2R2U'];CL.prog=['2','M'];clProg()`); await sleep(200); await shot('A36-phone-code-mymove');
  check('phone: My Move puzzle shows both rows, the board and ▶️ Run', await ev(`(()=>{const r=document.querySelector('#clRun').getBoundingClientRect(),m=document.querySelector('#clMove').getBoundingClientRect(),b=document.querySelector('#clBoard').getBoundingClientRect();return r.bottom<=innerHeight&&m.height>40&&b.height>120;})()`));
  await ev(`show('room')`); await sleep(200); await shot('A10-phone-room-topbar');
  check('phone: the Loft button fits in the top bar', await ev(`(()=>{const r=document.querySelector('#roomGo').getBoundingClientRect(), d=document.querySelector('#setBtn').getBoundingClientRect();return r.width>=48&&d.right<=innerWidth;})()`));
  await ev(`show('room');enterDecorate();document.querySelector('[data-dt=season]').click()`); await sleep(200); await shot('C5-phone-seasons');
  check('phone: all 5 Decorate tabs and ✔ Done fit without scrolling', await ev(`(()=>{const t=document.querySelector('#decoTabs'),d=document.querySelector('#decoDone').getBoundingClientRect();return t.scrollWidth<=t.clientWidth&&d.right<=innerWidth&&[...t.children].every(b=>b.getBoundingClientRect().height>=44);})()`), await ev(`(()=>{const t=document.querySelector('#decoTabs');return [t.scrollWidth,t.clientWidth,document.querySelector('#decoDone').getBoundingClientRect().right,[...t.children].map(b=>Math.round(b.getBoundingClientRect().height))];})()`));
  await ev(`exitDecorate()`);
  check('phone: the 📒 Sticker Book button and ⚙️ fit in the room top bar', await ev(`(()=>{const b=document.querySelector('#stkBtn').getBoundingClientRect(),s=document.querySelector('#setBtn').getBoundingClientRect(),t=document.querySelector('#roomTitle').getBoundingClientRect();return b.width>=44&&s.right<=innerWidth&&t.width>=60;})()`));
  await ev(`openStickers('fidget')`); await sleep(250); await shot('D6-phone-stickers');
  check('phone: the 6 sticker page tabs fit, and 3 stickers fit across', await ev(`(()=>{const t=document.querySelector('#stkTabs'),g=[...document.querySelectorAll('#stkPage .stk')].slice(0,3).map(b=>b.getBoundingClientRect());return t.scrollWidth<=t.clientWidth&&g[2].top===g[0].top&&g[2].right<=innerWidth;})()`));
  await ev(`show('room');petMenu()`); await sleep(200); await shot('E11-phone-pet-menu');
  check('phone: the whole pet menu fits on screen', await ev(`[...document.querySelectorAll('#modalBody [data-pa],#modalBtns button')].every(b=>{const r=b.getBoundingClientRect();return r.bottom<=innerHeight&&r.right<=innerWidth&&r.left>=0&&(r.height>=48||!b.dataset.pa);})`));
  await ev(`petDress()`); await sleep(150); await shot('E12-phone-pet-dress');
  check('phone: the Dress-up tiles and Done fit', await ev(`(()=>{const d=[...document.querySelectorAll('#modalBtns button')].pop().getBoundingClientRect();return d.bottom<=innerHeight&&[...document.querySelectorAll('#modalBody [data-acc]')].every(b=>b.getBoundingClientRect().right<=innerWidth);})()`));
  await ev(`closeModal();show('profiles');roomModal(null)`); await sleep(200); await shot('F8-phone-new-room');
  check('phone: the New Room buddy pictures fit across', await ev(`[...document.querySelectorAll('#npStart button')].every(b=>{const r=b.getBoundingClientRect();return r.right<=innerWidth&&r.left>=0&&r.height>=48;})`));
  await ev(`closeModal();show('room')`);
  await ev(`show('fidget');setFidTab('cube')`); await sleep(300); await shot('B12-phone-cube');
  check('phone: all 6 fidget tabs fit without scrolling', await ev(`(()=>{const t=document.querySelector('#fidTabs');return t.scrollWidth<=t.clientWidth&&[...t.children].every(b=>b.getBoundingClientRect().height>=44);})()`));
  check('phone: the clicker cube fits and its buttons are 48 px or more', await ev(`(()=>{const c=cubeEl.getBoundingClientRect(),s=document.querySelector('.fid-stage').getBoundingClientRect(),b=document.querySelector('#cube .cb-btn').getBoundingClientRect();return c.top>=s.top&&c.bottom<=s.bottom&&c.right<=innerWidth&&b.width>=48;})()`));
  await ev(`setFidTab('maze')`); await sleep(300); await shot('B13-phone-maze');
  check('phone: the maze board is big enough to play', await ev('MZ.geo.cs>=36'), await ev('MZ.geo.cs'));
  await ev(`setFidTab('slime')`); await sleep(300); await shot('B14-phone-slime');
  await ev(`show('art')`); await sleep(200);
  await send('Emulation.setDeviceMetricsOverride',{width:860,height:412,deviceScaleFactor:1,mobile:true});
  await ev(`setArtView('pad')`); await sleep(300); await shot('11-phone-landscape');
  await ev(`show('cards');setCardView('make')`); await sleep(300); await shot('29-phone-landscape-cards');
  await ev(`setCardView('binder')`); await sleep(300); await shot('30-phone-landscape-binder');
  await ev(`show('soccer')`); await sleep(400); await shot('50-phone-landscape-soccer');
  await ev(`show('stage');stStart('bats')`); await sleep(4500); await shot('80-phone-landscape-stage');
  check('landscape stage: pads below Fuzzy', await ev(`STG.g.yh-STG.g.pr>stgCv.clientHeight*0.4&&stgCv.clientHeight>200`), await ev('JSON.stringify(STG.g)'));
  await ev(`show('code');clOpen('hard',3)`); await sleep(300); await shot('A28-phone-landscape-code');
  check('landscape: Code Lab board and Run button both on screen', await ev(`(()=>{const b=document.querySelector('#clBoard').getBoundingClientRect(),r=document.querySelector('#clRun').getBoundingClientRect();return b.height>150&&r.bottom<=innerHeight&&r.right<=innerWidth;})()`));
  await ev(`clOpen('challenge',7);CL.move=[...'QRQUS'];CL.prog=['4','M'];clProg()`); await sleep(200); await shot('A44-phone-landscape-challenge');
  check('landscape: Challenge puzzle fits with ▶️ Run on screen', await ev(`(()=>{const r=document.querySelector('#clRun').getBoundingClientRect(),b=document.querySelector('#clBoard').getBoundingClientRect();return r.bottom<=innerHeight&&r.right<=innerWidth&&b.height>120;})()`));
  await ev(`clOpen('move',4);CL.move=[...'2R2U'];CL.prog=['2','M'];clProg()`); await sleep(200); await shot('A37-phone-landscape-mymove');
  check('landscape: My Move puzzle shows both rows and ▶️ Run', await ev(`(()=>{const r=document.querySelector('#clRun').getBoundingClientRect(),m=document.querySelector('#clMove').getBoundingClientRect();return r.bottom<=innerHeight&&r.right<=innerWidth&&m.height>40;})()`));
  await ev(`show('fidget');setFidTab('cube')`); await sleep(300); await shot('B15-landscape-cube');
  check('landscape: all 6 fidget tabs fit without scrolling', await ev(`(()=>{const t=document.querySelector('#fidTabs');return t.scrollWidth<=t.clientWidth;})()`));
  check('landscape: the clicker cube fits and its buttons are 48 px or more', await ev(`(()=>{const c=cubeEl.getBoundingClientRect(),s=document.querySelector('.fid-stage').getBoundingClientRect(),b=document.querySelector('#cube .cb-btn').getBoundingClientRect();return c.top>=s.top&&c.bottom<=s.bottom&&c.right<=innerWidth&&b.width>=48;})()`));
  await ev(`setFidTab('maze')`); await sleep(300); await shot('B16-landscape-maze');
  check('landscape: the maze board is big enough to play', await ev('MZ.geo.cs>=24'), await ev('MZ.geo.cs'));
  await ev(`setFidTab('slime')`); await sleep(300); await shot('B17-landscape-slime');
  await ev(`show('art')`);

  console.log('Every other screen (tablet size)');
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`show('room')`); await sleep(250);
  for(const t of ['popit','squish','spin','slime','cube','maze']){await ev(`show('fidget');setFidTab('${t}')`);await sleep(400);await shot('12-fidget-'+t);}
  check('fidget shelf shown', await ev(`cur==='fidget'`));
  const cats=await ev(`Object.keys(CLOSET)`);
  await ev(`show('closet')`);
  for(const c of cats){await ev(`document.querySelector('[data-cat=${c}]').click()`);await sleep(120);}
  await shot('13-closet'); check('closet has items', (await ev(`document.querySelectorAll('#closetGrid .tile').length`))>0);
  await ev(`show('room');enterDecorate()`);
  for(const t of ['mine','shop','wall','floor','season']){await ev(`document.querySelector('[data-dt=${t}]').click()`);await sleep(150);}
  check('shop has no poster for sale', await ev(`!document.querySelector('#decoGrid [data-buy=poster]')`));
  await shot('14-decorate-floors'); await ev(`exitDecorate()`);
  await ev(`settingsModal()`); await shot('15-settings');
  const appV=await ev('APP_VERSION');
  const gradleV=(fs.readFileSync(path.join(__dirname,'..','android','app','build.gradle.kts'),'utf8').match(/versionName\s*=\s*"([^"]+)"/)||[])[1];
  check('settings shows APP_VERSION', (await ev(`document.querySelector('.about').textContent`)).includes(appV));
  check('APP_VERSION matches Android versionName', appV===gradleV, [appV,gradleV]);
  await ev(`closeModal();show('profiles')`); await sleep(200); await shot('16-profiles');

  console.log(`\n${ok} passed, ${bad} failed`);
  console.log(errors.length?'CONSOLE ERRORS:\n'+errors.join('\n'):'No console errors');
  ws.close(); ch.kill(); setTimeout(()=>{try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){} process.exit(bad||errors.length?1:0);},800);
})().catch(e=>{console.error('TEST CRASHED',e);console.log(errors.join('\n'));ch.kill();process.exit(2);});
