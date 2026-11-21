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
    if(d.method==='Log.entryAdded'&&d.params.entry.level==='error'&&d.params.entry.source==='network'&&!/web\/about-local\.js$/.test(d.params.entry.url||''))errors.push(d.params.entry.text+' '+(d.params.entry.url||''));}; // e.g. a web/ file that is missing (the git-ignored web/about-local.js may be missing on purpose)
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  // stickers pay coins, so they are paused (also after a reload) until their own checks; other games' exact coin checks still add up
  await send('Page.addScriptToEvaluateOnNewDocument',{source:'window.STK_TEST_PAUSE=true'});
  await send('Page.navigate',{url:URL}); await sleep(1200);
  // a cold start (e.g. right after files changed) can be slow: wait until the page has fully loaded
  for(let i=0;i<60&&!(await ev('document.readyState==="complete"'));i++) await sleep(250);

  console.log('The page and its web/ files');
  const jsFiles=fs.readdirSync(path.join(__dirname,'..','web','js')).filter(f=>f.endsWith('.js')).sort();
  const allSrc=await ev(`[...document.scripts].map(s=>s.getAttribute('src'))`), loaded=allSrc.filter(s=>s.startsWith('web/js/'));
  check('index.html loads every web/js file, in number order', JSON.stringify(loaded)===JSON.stringify(jsFiles.map(f=>'web/js/'+f)), [loaded,jsFiles]);
  check('the personal About file (git-ignored) is loaded after 25-about.js, before startup', allSrc.indexOf('web/about-local.js')===allSrc.indexOf('web/js/25-about.js')+1&&allSrc.indexOf('web/js/99-startup.js')>allSrc.indexOf('web/about-local.js'), allSrc.slice(-3));
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
  await ev(`cardModal(P().cards.find(c=>c.bonus))`);
  check('a bonus card has no Delete button (it can never be won again, v1.33)', await ev(`![...document.querySelectorAll('#modalBtns button')].some(b=>b.textContent.includes('Delete'))`));
  await ev(`closeModal();delCard(P().cards.find(c=>c.bonus))`);
  check('…and delCard leaves it alone', await ev(`P().cards.filter(c=>c.bonus).length===3&&!document.querySelector('#modalTitle').textContent.includes('Delete')`));
  await ev(`closeModal()`);

  console.log('Soccer Field');
  // The keeper guesses with Math.random. 0.99 = "guess a side, the right one" (dives to u=+0.32), so tests are repeatable.
  await ev(`window._rand=Math.random;Math.random=()=>0.99`);
  check('the Backyard has the soccer goal (the way to Soccer since v1.40)', await ev(`yardFurniture().includes('data-hot="goal"')`));
  await ev(`handleHot('goal')`); await sleep(500);
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
  // each kick waits until the field is ready again (a slow run could otherwise shoot while the last kick is still showing)
  for(let i=0;i<5;i++){for(let w=0;w<60&&!(await ev(`SOC.state==='aim'`));w++) await sleep(100);await ev(`socShoot(-0.35,0.5,1.2,0)`);await sleep(1300);}
  for(let w=0;w<60&&!(await ev(`SOC.state==='done'`));w++) await sleep(100);
  await sleep(300);
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
  check('marquee opens the Stage on Easy with every song', await ev(`cur==='stage'&&STG.state==='pick'&&P().stage.level==='easy'&&document.querySelectorAll('#stgSongs [data-song]').length===SONG_IDS.length&&SONG_IDS.length===8`));
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

  console.log('Little-sister polish: room color + badge, Easy mode, grown-up PIN');
  const mbtn=t=>`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes(${JSON.stringify(t)}))`;
  const title=()=>ev(`document.querySelector('#modal').classList.contains('hidden')?'':document.querySelector('#modalTitle').textContent`);
  const pinType=async s=>{for(const k of s)await ev(`document.querySelector('#pinPad [data-k="${k}"]').click()`);await sleep(300);};
  const prices=sel=>ev(`[...document.querySelectorAll('${sel}')].map(t=>{const p=t.querySelector('.tp');return p?Number(p.textContent.replace(/\\D/g,'')):0;})`);
  const sorted=a=>a.every((v,i)=>!i||a[i-1]<=v);
  check('every room has a color and a badge', await ev(`DB.profiles.every(p=>ROOM_COLORS[p.color]&&ROOM_BADGES.includes(p.badge)&&p.easy===false)`));
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
  check('new color and badge saved', await ev(`DB.profiles[0].color==='mint'&&DB.profiles[0].badge==='⚽'`));
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
  check('v1.7 backup restores with a color, a badge and Easy mode off', await ev(`DB.version===DB_VERSION&&ROOM_COLORS[DB.profiles[0].color]&&DB.profiles[0].badge==='🐰'&&DB.profiles[0].easy===false&&DB.settings.pin==='1234'`));
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
  check('her room has a ⬆️ tab to the Loft', await ev(`!!document.querySelector('#roomTabs .rt-up[data-go="2"]')`));
  await ev(`document.querySelector('#roomTabs [data-go="2"]').click()`); await sleep(200);
  check('the Loft opens', await ev(`roomNo===2&&document.querySelector('#roomTitle').textContent.includes('Loft')&&!!document.querySelector('#roomSvg [fill="url(#gMoonSky)"]')`));
  check('the Loft has its own free Attic wall', await ev(`P().room2.wall==='attic'&&!!document.querySelector('#gdefs #pBoards')`));
  check('Fuzzy is in the Loft too', await ev(`!!document.querySelector('#mascotG')`));
  await shot('A0-loft');
  check('Back from the Loft goes to her room', await ev(`window.androidBack()&&cur==='room'&&roomNo===1&&!!document.querySelector('#roomTabs [data-go="2"]')`));
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
  // dragDeco(uid,x,y): a real drag (pointer events) of a room item so its bottom-center ends at room point x,y
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

  console.log('Hair styles + colors');
  await ev(`P().coins=500;show('closet');document.querySelector('[data-cat=hair]').click()`); await sleep(150);
  check('hair tab shows 12 styles (8, 3 short ones since v1.20, Idol Buns since v1.35)', (await ev(`document.querySelectorAll('#closetGrid .tile').length`))===12, await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id)`));
  check('and 10 color swatches', await ev(`!document.querySelector('#hairCols').classList.contains('hidden')&&document.querySelectorAll('#hairCols [data-hc]').length===10`));
  check('no old colored swoops in the closet', await ev(`!document.querySelector('#closetGrid [data-id=swoopPurple]')&&!document.querySelector('#closetGrid [data-id=swoopCandy]')`));
  await ev(`document.querySelector('#hairCols [data-hc=pink]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('buying Pink colors the hair', await ev(`P().look.hairColor==='pink'&&P().owned.includes('hairc:pink')&&document.querySelector('#closetMascot').innerHTML.includes('#ff6fae')`));
  await ev(`document.querySelector('#hairCols [data-hc=brown]').click()`); await sleep(100);
  check('Brown is free (no buy box)', await ev(`P().look.hairColor==='brown'&&document.querySelector('#modal').classList.contains('hidden')`));
  await ev(`P().look.hairColor='pink';renderCloset()`);
  for(const id of ['bob','pigtails','waves','spikes','twinTails']){
    await ev(`document.querySelector('#closetGrid [data-id=${id}]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
    check(`bought and wearing ${id}`, await ev(`P().look.hair==='${id}'&&P().owned.includes('hair:${id}')`));
    await shot('B1-hair-'+id);
  }
  await ev(`document.querySelector('#hairCols [data-hc=candy]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('two-tone colors draw a streak', await ev(`document.querySelector('#closetMascot').innerHTML.includes('#ff9fd0')`));
  await shot('B2-hair-twin-candy');
  check('pigtails in pink count as Cute', (await ev(`cardStats(Object.assign({},DEFAULT_LOOK,{fur:'black',hair:'pigtails',hairColor:'pink',top:'none',bottom:'none',legs:'none',arms:'none',shoes:'none',acc:'none'}))[0]`))===2);
  check('Emo Spikes count as Spooky', (await ev(`cardStats(Object.assign({},DEFAULT_LOOK,{fur:'white',hair:'spikes',hairColor:'blonde',top:'none',bottom:'none',legs:'none',arms:'none',shoes:'none',acc:'none'}))[1]`))===2);
  let surpriseOk=true; for(let k=0;k<12;k++){const ok=await ev(`document.querySelector('#randomBtn').click(),hcOwned(P(),P().look.hairColor)&&isOwned(P(),'hair',itemOf('hair',P().look.hair))`);if(!ok)surpriseOk=false;}
  check('Surprise me only picks owned styles and colors', surpriseOk);
  check('an old photocard with Purple Swoop still draws purple hair', await ev(`cardSVG(Object.assign({no:1,at:Date.now(),stage:'pastel',frame:'classic',title:'Superstar',name:'Fuzzy'},{look:Object.assign({},DEFAULT_LOOK,{hair:'swoopPurple',hairColor:undefined})})).includes('#7c4ddb')`));
  const hairCode=await ev('JSON.stringify(DB)');
  const v110Hair=await ev(`JSON.stringify(Object.assign({},DB,{version:7,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));q.look.hair='swoopPurple';delete q.look.hairColor;q.owned=q.owned.filter(k=>!k.startsWith('hairc:')).concat(['hair:swoopPink','hair:swoopCandy']);return q;})}))`);
  await ev(`doRestore(${JSON.stringify(v110Hair)})`); await sleep(400);
  check('a v1.10 backup turns Purple Swoop into Emo Swoop + Purple', await ev(`DB.version===DB_VERSION&&DB.profiles[0].look.hair==='swoopBlack'&&DB.profiles[0].look.hairColor==='purple'`));
  check('...and owned Pink Swoop / Cotton Candy become owned colors', await ev(`['hairc:pink','hairc:candy'].every(k=>DB.profiles[0].owned.includes(k))&&DB.profiles[0].owned.includes('hair:swoopPink')`));
  await ev(`doRestore(${JSON.stringify(hairCode)})`); await sleep(400);
  check('a v1.11 backup keeps style and color', await ev(`DB.profiles[0].owned.includes('hair:twinTails')&&HAIR_COLORS[DB.profiles[0].look.hairColor]`));
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
  check('Challenge tab is saved and shows all 14 puzzles (8 + 6 since v1.37)', await ev(`P().code.level==='challenge'&&CODE_PUZZLES.challenge.length===14&&document.querySelectorAll('#clList [data-pz]').length===14`));
  await shot('A40-code-challenge-list');
  const ch0=await ev('P().coins');
  await ev(`document.querySelector('#clList [data-pz="0"]').click()`); await sleep(150);
  check('Challenge puzzle: every block in the palette (arrows, 🔁, 🌟, ✨, ❓) and the ✨ row', await ev(`[...'ULRD234SMQ'].every(t=>document.querySelector('#clPal [data-add="'+t+'"]'))&&!document.querySelector('#clMove').classList.contains('hidden')`));
  await ev(`['R','U','S'].forEach(t=>document.querySelector('[data-add='+t+']').click());document.querySelector('#clProg').click();document.querySelector('[data-add="3"]').click();document.querySelector('[data-add=M]').click()`);
  check('built by tapping: My Move = ➡️ ⬆️ 🌟, program = 🔁3 ✨', await ev(`CL.move.join('')==='RUS'&&CL.prog.join('')==='3M'`));
  await ev(`document.querySelector('#clRun').click()`); await sleep(1300);
  check('🌟 inside My Move picks up both stars and solves it: +5 coins', await ev(`P().code.solved.includes('c1')&&document.querySelectorAll('#clBoard .clstar.got').length===2&&P().coins===${ch0}+5`), await ev('P().coins-'+ch0));
  await ev(`closeModal()`);
  for(let i=1;i<14;i++){await ev(`clSolve('challenge',${i})`);await sleep(i===7||i===13?2600:2000);if(i===7)await shot('A41-code-challenge-final');if(i===13)await shot('A41b-code-challenge-c14');await ev(`closeModal()`);}
  check('every Challenge puzzle solved: 5 coins each + 10 level bonus', await ev(`CODE_PUZZLES.challenge.every(q=>P().code.solved.includes(q.id))&&P().coins===${ch0}+14*5+10`), await ev('P().coins-'+ch0));
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
  check('every cube color draws', await ev(`getComputedStyle(cubeEl).getPropertyValue('--f').trim()===CUBES[Object.keys(CUBES).pop()].face`));
  await ev(`P().fid.cube='pastel';renderCube()`);

  await ev(`setFidTab('maze')`); await sleep(300); await shot('B7-maze');
  check('the maze screen shows 12 maze buttons (6 + 6 since v1.37)', await ev(`MAZES.length===12&&document.querySelectorAll('#mazeBar [data-mz]').length===12`));
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
  for(let i=0;i<12;i++){
    await ev(`closeModal();mzStart(${i})`);
    const r=await ev('mzAuto()');
    check(`maze ${i+1} solved by tilting, never inside a wall`, r.done&&r.bad===0&&(await ev(`P().maze.solved.includes(MAZES[${i}].id)`)), r);
    if(i===3) await shot('B9-maze-bumpers-done');
  }
  await sleep(900);
  check('each new maze pays 3, and all 12 pay 5 more', (await ev('P().coins'))===fzmc0+12*3+5, await ev(`P().coins-${fzmc0}`));
  check('the done box offers Again and Next', (await ev(`document.querySelector('#modalBtns').textContent`)).includes('Again'));
  await shot('B10-maze-done');
  await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(100);
  check('after the last maze, Next goes back to maze 1', await ev(`MZ.i===0&&!MZ.done`));
  const fzrc0=await ev('P().coins'); const fzrr=await ev('mzAuto()'); await sleep(300);
  check('a replay pays 1', fzrr.done&&(await ev('P().coins'))===fzrc0+1&&(await ev('P().stats.mazes'))===13, [fzrr,await ev(`P().coins-${fzrc0}`)]);
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
  check('a bought cube color shows straight away', await ev(`getComputedStyle(cubeEl).getPropertyValue('--f').trim()===CUBES.emo.face`));
  const fzfCode=await ev('JSON.stringify(DB)');
  const fzv115=await ev(`(()=>{const d=JSON.parse(JSON.stringify(DB));d.version=9;d.profiles.forEach(p=>{delete p.maze;['slime','cube','marble'].forEach(k=>delete p.fid[k]);['stretches','clicks','mazes'].forEach(k=>delete p.stats[k]);p.owned=p.owned.filter(o=>!/^(slime|cube|marble):/.test(o));});return JSON.stringify(d);})()`);
  await ev(`doRestore(${JSON.stringify(fzv115)})`); await sleep(400);
  check('a v1.15 backup restores with the new fidgets at their defaults', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>Array.isArray(p.maze.solved)&&p.maze.solved.length===0&&p.fid.slime==='grape'&&p.fid.cube==='pastel'&&p.fid.marble==='pearl'&&p.stats.clicks===0)`));
  await ev(`doRestore(${JSON.stringify(fzfCode)})`); await sleep(400);
  check('a v1.16 backup keeps solved mazes, designs and counts', await ev(`(()=>{const p=DB.profiles.find(q=>q.maze.solved.length===12);return !!p&&p.fid.slime==='mint'&&p.owned.includes('marble:galaxy')&&p.stats.stretches>=5&&p.stats.clicks>=25;})()`));
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
  check('tapping the seasonal window goes out to the Backyard (v1.40)', await ev(`cur==='room'&&roomNo===3`));
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
  check('136 stickers on 8 pages (4 for the pet since v1.19, 4 for Pack 2 since v1.21, 2 for the Backyard since v1.23, 3 for the keeper since v1.24, 4 for Brain Games since v1.25, 4 for songs since v1.26, 2 for looks since v1.27, 2 for gifts and layouts since v1.28, 1 for big dreams since v1.29, 1 for snapshots since v1.30, 2 for Brain Games 3 since v1.33, 2 for Brain Games 4 since v1.34, 4 for Pack 3 since v1.35, 4 for Pack 4 since v1.36, 3 for Extras since v1.37, 1 for the Music Maker since v1.38, 1 for the Studio since v1.40, 6 on the Friends page since v1.41, 3 more for playing together since v1.42, 3 for Free Play since v1.43, 6 on the 🧸 Play page since v1.46, 3 for the Dance Maker since v1.47, 4 for the Garden since v1.48, 3 for I Spy since v1.49, 3 for new things to buy since v1.50, 3 for the Runway since v1.51, 3 for the Stage Jam since v1.52, 3 for Trick Shots since v1.53, 4 for pet play since v1.54, 3 for pet walks since v1.55), ids all different, 6 or more per page', await ev(`STICKERS.length===136&&new Set(STICKERS.map(s=>s.id)).size===136&&Object.keys(STK_PAGES).length===8&&Object.keys(STK_PAGES).every(k=>STICKERS.filter(s=>s.page===k).length>=6)`));
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
  check('earned stickers are in color with their name; the rest are gray with a hint and a bar', await ev(`[...document.querySelectorAll('#stkPage .stk')].every(b=>{const s=STICKERS.find(x=>x.id===b.dataset.stk), got=P().stickers.includes(s.id);return got?!b.classList.contains('locked')&&b.querySelector('.sn').textContent===s.name:b.classList.contains('locked')&&b.querySelector('.sn').textContent===s.hint&&!!b.querySelector('.sbar');})`));
  check('new stickers sparkle', await ev(`document.querySelectorAll('#stkPage .stk.new').length>0`));
  await shot('D2-stickers-fidgets');
  check('stickers on a page count as seen once it is open', await ev(`!P().stickerNew.some(id=>STICKERS.find(s=>s.id===id).page==='fidget')`));
  check('other pages with new stickers show a dot on their tab', await ev(`P().stickerNew.length===0||!!document.querySelector('#stkTabs .stk-dot')`));
  for(const pg of ['art','soccer','stage','code','room']){await ev(`document.querySelector('#stkTabs [data-page=${pg}]').click()`); await sleep(120); await shot('D3-stickers-'+pg);}
  check('after every page is seen, the dot goes away', await ev(`P().stickerNew.length===0&&document.querySelector('#stkDot').classList.contains('hidden')`));
  const skLocked=await ev(`(STICKERS.find(s=>!P().stickers.includes(s.id))||{}).id`);
  if(skLocked){
    await ev(`stkPage=STICKERS.find(s=>s.id==='${skLocked}').page;renderStickers();document.querySelector('#stkPage [data-stk=${skLocked}]').click()`); await sleep(150);
    check('tapping a gray sticker says what to do and how far she is', await ev(`(()=>{const s=STICKERS.find(x=>x.id==='${skLocked}');const t=document.querySelector('#modalBody').textContent;return document.querySelector('#modalTitle').textContent.includes('Not yet')&&t.includes(s.hint)&&t.includes(stkHave(P(),s).toLocaleString()+' / '+stkNeed(s).toLocaleString());})()`));
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
  check('Easy mode: big stickers, no hint text on gray ones', await ev(`document.querySelector('#stkPage .stk svg').getBoundingClientRect().width>=104&&[...document.querySelectorAll('#stkPage .stk.locked .sn')].every(e=>getComputedStyle(e).display==='none')`));
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

  console.log('Buddies (v1.20): animal buddies, faces, starter looks, room color tints');
  await ev(`stkPaused=true`);
  check('5 buddies, 3 faces, 6 starter looks', await ev(`Object.keys(BUDDIES).join()==='bunny,bear,puppy,dino,fox'&&Object.keys(FACES).join()==='sparkle,bright,cheeky'&&Object.keys(STARTERS).length===6`));
  check('every buddy draws with every face and fur', await ev(`Object.keys(BUDDIES).every(k=>Object.keys(FACES).every(fc=>Object.keys(FUR).every(fu=>{const s=mascotSVG(Object.assign({},DEFAULT_LOOK,{kind:k,face:fc,fur:fu}));return s.length>2000&&!/undefined|NaN/.test(s);})))`));
  check('every starter look uses real closet items', await ev(`Object.keys(STARTERS).every(k=>{const L=starterLook(k);return Object.keys(CLOSET).every(c=>CLOSET[c].items.some(i=>i.id===L[c]))&&FUR[STARTERS[k].fur];})`));
  check('an old look (no buddy, no face) draws exactly like before: a bunny with the Sparkly face', await ev(`(()=>{const o=Object.assign({},DEFAULT_LOOK);delete o.kind;delete o.face;return mascotSVG(o)===mascotSVG(DEFAULT_LOOK)&&mascotSVG(Object.assign({},o,{kind:'dragon',face:'x'}))===mascotSVG(DEFAULT_LOOK);})()`));
  check('the new short hair, tee, shorts, high-tops and cap draw', await ev(`['hair:buzz','hair:messy','hair:sidePart','top:stripeTee','bottom:cargo','shoes:hightops','acc:capBack'].every(k=>{const [c,i]=k.split(':');return CLOSET[c].items.some(x=>x.id===i)&&!/undefined|NaN/.test(mascotSVG(Object.assign({},DEFAULT_LOOK,{[c]:i})));})`));
  check('hair colors work on the new hair', await ev(`mascotSVG(Object.assign({},DEFAULT_LOOK,{hair:'messy',hairColor:'streak'})).includes('#ff6fae')`));
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
  check('a room with no furniture colors has the classic pink desk, purple wardrobe and curtains', await ev(`(()=>{const k=P().furn;P().furn={};const f=furniture();P().furn=k;return ['#ffb3d9','#e48fbf','#6b46b8','#7d58cc','#a97cff','#ff8cc6'].every(c=>f.includes(c));})()`));
  check('the Loft has its classic wood beams and lavender desk', await ev(`(()=>{const k=P().furn;P().furn={};const f=loftFurniture();P().furn=k;return ['#9b6a42','#c9a7ff','#5b3a99'].every(c=>f.includes(c));})()`));
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
  check('a green room starts with the Leafy Green wall (given free) and green furniture', await ev(`(()=>{const p=P();return p.room.wall==='leafDots'&&p.owned.includes('wall:leafDots')&&['desk','closet','shelf','curtain','desk2','window2','lamp'].every(k=>p.furn[k]==='green')&&!p.furn.beams&&p.room2.wall==='attic';})()`));
  check('the green furniture is drawn in the room', await ev(`document.querySelector('#roomSvg').innerHTML.includes('#62c470')&&!furniture().includes('#6b46b8')`));
  check('the room labels take the room color', await ev(`(()=>{const r=document.querySelector('#roomSvg .sign rect');return r&&(r.getAttribute('style')||'').includes('var(--pink)')&&getComputedStyle(r).fill==='rgb(126, 224, 138)';})()`));
  await ev(`enterDecorate();document.querySelector('[data-dt=colors]').click()`); await sleep(150); await shot('F9-colors-tab');
  check('Decorate has a 🎨 Colors tab: 4 pieces, 11 swatches each (Classic + 10)', await ev(`document.querySelectorAll('#decoGrid .furn-row').length===4&&[...document.querySelectorAll('#decoGrid .furn-row')].every(r=>r.querySelectorAll('[data-fc]').length===11)`));
  const fcc0=await ev('P().coins');
  await ev(`document.querySelector('[data-furn=desk][data-fc=sky]').click()`); await sleep(100);
  check('tapping Sky paints the desk sky blue, free', await ev(`P().furn.desk==='sky'&&document.querySelector('#roomSvg').innerHTML.includes('#c6e6ff')&&document.querySelector('[data-furn=desk][data-fc=sky]').classList.contains('on')&&P().coins===${fcc0}`));
  await ev(`document.querySelector('[data-furn=closet][data-fc=classic]').click()`); await sleep(100);
  check('Classic gives the wardrobe its old purple back', await ev(`!('closet' in P().furn)&&furniture().includes('#6b46b8')`));
  check('every swatch is at least 48 px', await ev(`[...document.querySelectorAll('#decoGrid [data-fc]')].every(b=>b.getBoundingClientRect().width>=48)`));
  await ev(`goRoom(2)`); await sleep(200); await ev(`decorating||enterDecorate();document.querySelector('[data-dt=colors]').click()`); await sleep(150);
  check('in the Loft the Colors tab lists the Loft pieces', await ev(`[...document.querySelectorAll('#decoGrid [data-fc=classic]')].map(b=>b.dataset.furn).join()==='desk2,beams,window2,lamp'`));
  await ev(`document.querySelector('[data-furn=beams][data-fc=white]').click()`); await sleep(100); await shot('F10-loft-colors');
  check('white beams in the Loft', await ev(`P().furn.beams==='white'&&loftFurniture().includes('#ddd5e8')`));
  await ev(`exitDecorate();goRoom(1)`); await sleep(150);
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
  check('every room color tints', await ev(`Object.keys(ROOM_COLORS).filter(c=>c!=='pink'&&c!=='purple').every(c=>TINTS[c])`));
  await ev(`P().color='green';applyEasy();P().easy=true;applyEasy()`);
  check('Easy mode and the tint work together', await ev(`document.body.classList.contains('tint')&&document.body.classList.contains('easy')`));
  await ev(`P().easy=false;applyEasy()`);
  // photocards: an old card (no buddy in its look) still draws a bunny; a new card shows the dino
  check('an old photocard look draws a bunny; a dino card draws a dino', await ev(`(()=>{const o=Object.assign({},DEFAULT_LOOK);delete o.kind;delete o.face;const old=cardSVG({no:1,at:0,look:o,stage:'spot',frame:'sparkle',title:'Best Bunny',name:'Test'}),dn=cardSVG({no:2,at:0,look:P().look,stage:'spot',frame:'sparkle',title:'Best Bunny',name:'Test'});return old.includes('rotate(-14 74 70)')&&dn.includes('M89 45 L100 10');})()`));
  console.log('Buddies in backups');
  const bdCode=await ev('JSON.stringify(DB)');
  const bd119=await ev(`(()=>{const d=JSON.parse(JSON.stringify(DB));d.version=12;d.profiles.forEach(p=>{delete p.tint;delete p.furn;delete p.look.kind;delete p.look.face;});return JSON.stringify(d);})()`);
  await ev(`doRestore(${JSON.stringify(bd119)})`); await sleep(400);
  check('a v1.19 backup restores as bunnies, Sparkly faces, no tint (save version 13 and up)', await ev(`DB.version===DB_VERSION&&DB_VERSION>=13&&DB.profiles.every(p=>p.look.kind==='bunny'&&p.look.face==='sparkle'&&p.tint===false&&Object.keys(p.furn).length===0)`));
  const bdBad=await ev(`(()=>{const d=JSON.parse(JSON.stringify(DB));d.profiles[0].look.kind='dragon';d.profiles[0].look.face=7;d.profiles[0].tint='yes';d.profiles[0].furn={desk:'rainbow',closet:5};return JSON.stringify(d);})()`);
  await ev(`doRestore(${JSON.stringify(bdBad)})`); await sleep(400);
  check('odd buddy data is made safe', await ev(`(()=>{const p=DB.profiles[0];return p.look.kind==='bunny'&&p.look.face==='sparkle'&&p.tint===true&&p.furn.desk==='rainbow'&&!('closet' in p.furn)&&furniture().length>1000;})()`));
  await ev(`doRestore(${JSON.stringify(bdCode)})`); await sleep(400);
  check('a v1.20 backup keeps the dino and the tint', await ev(`(()=>{const p=DB.profiles.find(q=>q.id==='${rexId}');return p&&p.look.kind==='dino'&&p.look.face==='cheeky'&&p.tint===true&&p.furn.desk==='sky'&&p.furn.beams==='white';})()`));
  // tidy up: remove the test room and go back to the earlier one
  await ev(`closeModal();DB.profiles=DB.profiles.filter(p=>p.id!=='${rexId}');DB.activeId='${prevId}';P().look.kind='bunny';P().look.face='sparkle';save();show('room')`); await sleep(200);
  check('back to the earlier room', await ev(`DB.profiles.length===${nRooms}&&P().id==='${prevId}'`));

  console.log('Content Pack 2 (v1.21): dinosaurs, space, vehicles, robots/sharks/heroes');
  await ev(`closeModal();stkPaused=true;P().easy=false;P().coins=500;applyEasy();show('room');goRoom(1)`); await sleep(200);
  const p2Wall=await ev('P().room.wall');
  const p2Clothes=JSON.parse(await ev(`JSON.stringify(Object.entries(CLOSET).flatMap(([c,v])=>v.items.filter(i=>i.p2).map(i=>[c,i.id])))`));
  check('16 new clothes, each with a theme', p2Clothes.length===16&&await ev(`Object.values(CLOSET).every(c=>c.items.filter(i=>i.p2).every(i=>P2_THEMES[i.p2]))`), p2Clothes.length);
  check('nothing in the pack says "boy" or "girl"', await ev(`![...Object.values(CLOSET).flatMap(c=>c.items),...Object.values(DECOR),...Object.values(WALLS),...Object.values(FLOORS),...Object.values(POP_THEMES),...Object.values(POP_SHAPES),...Object.values(SQUISHIES),...Object.values(SPINS),...Object.values(SLIMES),...Object.values(CUBES),...Object.values(MARBLES),...STICKERS].some(x=>/\\b(boy|girl)s?\\b/i.test((x.name||'')+' '+(x.hint||'')))`));
  check('every new piece of clothing draws on every buddy, with no broken numbers', await ev(`(()=>{const items=Object.entries(CLOSET).flatMap(([c,v])=>v.items.filter(i=>i.p2).map(i=>[c,i.id]));return items.every(([c,id])=>Object.keys(BUDDIES).every(k=>{const s=mascotSVG(Object.assign({},DEFAULT_LOOK,{kind:k,[c]:id}));return s.length>500&&!/NaN|undefined/.test(s);}));})()`));
  await ev(`show('closet')`);
  for(const [c,i] of p2Clothes){await ev(`document.querySelector('[data-cat=${c}]').click()`);
    check(`closet has ${c}:${i}`, await ev(`!!document.querySelector('#closetGrid [data-id=${i}] svg')`));}
  await ev(`document.querySelector('[data-cat=top]').click();document.querySelector('#closetGrid [data-id=dinoHoodie]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('bought and wearing the Dino Spike Hoodie (20)', await ev(`P().look.top==='dinoHoodie'&&P().owned.includes('top:dinoHoodie')&&P().coins===480`), await ev('P().coins'));
  check('new clothes count on photocard stats (sporty)', (await ev(`cardStats(Object.assign({},DEFAULT_LOOK,{top:'heroSuit',bottom:'racePants',legs:'none',arms:'none',shoes:'rocketBoots',acc:'hardHat'}))[2]`))===5);
  await ev(`P().look=Object.assign({},P().look,{kind:'dino',bottom:'dinoShorts',legs:'dinoSocks',arms:'none',shoes:'dinoFeet',acc:'none'});renderCloset()`); await sleep(100); await shot('G1-pack2-dino');
  await ev(`P().look=Object.assign({},P().look,{kind:'puppy',top:'rocketTee',bottom:'cargo',legs:'spaceSocks',shoes:'rocketBoots',acc:'spaceHelmet'});renderCloset()`); await sleep(100); await shot('G2-pack2-space');
  await ev(`P().look=Object.assign({},P().look,{kind:'bear',top:'robotTop',bottom:'racePants',legs:'none',arms:'robotArms',shoes:'hightops',acc:'antennae'});renderCloset()`); await sleep(100); await shot('G3-pack2-robot');
  await ev(`P().look=Object.assign({},P().look,{kind:'fox',top:'heroSuit',bottom:'cargo',arms:'none',acc:'heroMask'});renderCloset()`); await sleep(100); await shot('G4-pack2-hero');
  await ev(`P().look=Object.assign({},P().look,{kind:'bunny',top:'stripeTee',acc:'sharkHat'});renderCloset()`); await sleep(100); await shot('G5-pack2-shark');
  await ev(`P().look=Object.assign({},P().look,{top:'tee',bottom:'plaid',legs:'stripeBP',arms:'none',shoes:'boots',acc:'hardHat'});renderCloset()`); await sleep(100); await shot('G6-pack2-hardhat');
  await ev(`P().look=Object.assign({},P().look,{kind:'bunny',acc:'stars'});save();show('room')`);
  const p2Decor=['dinoPlush','dinoNest','volcano','toyRocket','planetMobile','telescope','trainRug','dumpTruck','trafficLight','robotPal','sharkBean','heroBadge'];
  check('12 new decorations, each with a theme', (await ev(`Object.entries(DECOR).filter(([k,d])=>d.p2).map(([k])=>k).join()`))===p2Decor.join());
  await ev(`enterDecorate();document.querySelector('[data-dt=shop]').click()`); await sleep(150);
  check('the Shop has all 12 new decorations', await ev(`${JSON.stringify(p2Decor)}.every(k=>document.querySelector('#decoGrid [data-buy='+k+']'))`));
  await shot('G7-pack2-shop');
  await ev(`document.querySelector('#decoGrid [data-buy=dinoPlush]').click()`); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(150);
  check('buying the Dino Plush (20) puts it in her room', await ev(`P().room.items.some(i=>i.type==='dinoPlush'&&i.placed)&&P().coins===460`), await ev('P().coins'));
  await ev(`document.querySelector('[data-dt=wall]').click()`); await sleep(100);
  check('4 new walls', await ev(`['jungle','outerSpace','ocean','robotPanels'].every(k=>document.querySelector('#decoGrid [data-surf='+k+']'))`));
  await ev(`document.querySelector('#decoGrid [data-surf=outerSpace]').click()`); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(150);
  check('bought and put up the Outer Space wall', await ev(`P().room.wall==='outerSpace'&&P().owned.includes('wall:outerSpace')`));
  await ev(`document.querySelector('[data-dt=floor]').click()`); await sleep(100);
  check('3 new floors', await ev(`['road','moon','dinoDig'].every(k=>document.querySelector('#decoGrid [data-surf='+k+']'))`));
  await ev(`exitDecorate();renderRoom()`); await sleep(150); await shot('G7b-pack2-space-room');
  await ev(`goRoom(2);for(const k of ${JSON.stringify(p2Decor)})P().room2.items.push(Object.assign({uid:'p2'+k,type:k,placed:true},spot(k)));P().room2.floor='road';P().room2.wall='ocean';save();renderRoom()`); await sleep(200);
  await shot('G8-pack2-loft');
  check('every new decoration draws in the Loft, with no broken numbers', await ev(`(()=>{const h=document.querySelector('#roomSvg').innerHTML;return ${JSON.stringify(p2Decor)}.every(k=>P().room2.items.some(i=>i.type===k))&&document.querySelectorAll('#roomSvg .deco').length>=12&&!/NaN|undefined/.test(h);})()`));
  for(const [w,f] of [['jungle','dinoDig'],['robotPanels','moon']]){await ev(`P().room2.wall='${w}';P().room2.floor='${f}';renderRoom()`); await sleep(100); await shot('G9-pack2-'+w);}
  await ev(`P().room2.items=P().room2.items.filter(i=>!String(i.uid).startsWith('p2'));P().room2.wall='attic';save();goRoom(1)`);

  console.log('Content Pack 2: fidget designs');
  await ev(`show('fidget');setFidTab('popit')`); await sleep(200);
  check('3 new pop-it colors and 2 new board shapes', await ev(`['dino','space','traffic'].every(k=>document.querySelector('#skinRow [data-skin='+k+']'))&&['rocket','dino'].every(k=>document.querySelector('#skinRow [data-shape='+k+']'))`));
  for(const sh of ['rocket','dino']){
    await ev(`P().fid.pop='${sh==='rocket'?'space':'dino'}';document.querySelector('#skinRow [data-shape=${sh}]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(200);
    const n=await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').length`);
    check(`the ${sh} board has a sensible number of bubbles`, n>=12&&n<36, n); await shot('G10-pop-'+sh);
    const fl=await ev('P().stats.flips'); await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').forEach(b=>popAt(b))`); await sleep(1300);
    check(`popping every ${sh} bubble flips the board`, (await ev('P().stats.flips'))===fl+1);
  }
  await ev(`P().fid.pop='traffic';P().fid.popShape='classic';renderPop()`); await sleep(100); await shot('G11-pop-traffic');
  await ev(`P().fid.pop='rainbow';renderPop()`);
  check('every squishy extra has a drawing', await ev(`Object.values(SQUISHIES).every(T=>!T.extra||['ears','wings','berry','leaf','cloud','ghost'].includes(T.extra)||SQ_EXTRAS[T.extra])`));
  check('every spinner and slime picture exists', await ev(`Object.values(SPINS).every(T=>['star','bat','heart','pent'].includes(T.deco)||FID_ICONS[T.deco])&&Object.values(SLIMES).every(T=>['glitter','fluff','stars','bats'].includes(T.deco)||FID_ICONS[T.deco])`));
  for(const [tab,ids] of [['squish',['dino','shark','planet']],['spin',['rocket','gear','dino']],['slime',['dino','rocket']],['cube',['robot','dino']],['maze',['earth','wheel']]]){
    await ev(`setFidTab('${tab}')`); await sleep(150);
    check(`new ${tab} designs are listed`, await ev(`${JSON.stringify(ids)}.every(k=>document.querySelector('#skinRow [data-skin='+k+']'))`));
    for(const id of ids){await ev(`P().fid[FID['${tab}'].key]='${id}';fid2Open('${tab}');${tab==='spin'?'SP.w=12;':''}`);
      if(tab==='squish'){await ev(`sq('pointerdown',51,0.2,0.1)`); await sleep(450); await shot(`G12-${tab}-${id}`); await ev(`sq('pointerup',51,0.2,0.1)`);}
      else {await sleep(350); await shot(`G12-${tab}-${id}`);}}
  }
  await ev(`P().fid.spin='galaxy';setFidTab('spin');document.querySelector('#skinRow [data-skin=rocket]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('bought the Rocket spinner (owned as spin:rocket)', await ev(`P().fid.spin==='rocket'&&P().owned.includes('spin:rocket')`));
  await ev(`P().fid.squish='mochi';P().fid.spin='galaxy';P().fid.slime='grape';P().fid.cube='pastel';P().fid.marble='pearl';save();show('room')`);

  console.log('Content Pack 2: stickers');
  check('the 4 pack stickers come just before the Backyard ones, on the Room & Style page', await ev(`STICKERS.slice(STICKERS.findIndex(s=>s.id==='yard5')-4,STICKERS.findIndex(s=>s.id==='yard5')).every(s=>s.page==='room'&&/^p2/.test(s.id))`));
  check('pack stickers count what she has: 3 dino things (hoodie, plush, dino board), 3 space (wall, spinner, rocket board), 0 vehicle', await ev(`p2Have(P(),'dino')===3&&p2Have(P(),'space')===3&&p2Have(P(),'ride')===0`), await ev(`[p2Have(P(),'dino'),p2Have(P(),'space'),p2Have(P(),'ride'),p2Have(P(),'hero')]`));
  await ev(`P().owned.push('legs:dinoSocks');P().room.items.push({uid:'p2nest',type:'dinoNest',placed:false})`);
  check('socks and a decoration in My Stuff count too (5 dino things)', await ev(`p2Have(P(),'dino')===5`));
  const p2c0=await ev('P().coins');
  await ev(`stkPaused=false`); const p2Got=await ev(`checkStickers().map(s=>s.id).filter(id=>/^p2/.test(id)).join()`); const p2c1=await ev('P().coins'); await ev(`stkPaused=true;closeModal()`);
  check('3+ dino and 3 space things give Dino Fan and Space Cadet, not the other two', p2Got==='p2dino,p2space', p2Got);
  check('...and they pay +2 each (with any other sticker that came at the same time)', p2c1>=p2c0+4&&(p2c1-p2c0)%2===0, [p2c0,p2c1]);
  await ev(`P().room.items=P().room.items.filter(i=>i.uid!=='p2nest');save()`);

  console.log('Content Pack 2 in backups');
  const p2Id=await ev('P().id'), p2Code=await ev('JSON.stringify(DB)');
  await ev(`doRestore(${JSON.stringify(p2Code)})`); await sleep(400);
  check('a backup keeps the pack clothes, wall, spinner, plush and sticker', await ev(`(()=>{const p=DB.profiles.find(q=>q.id==='${p2Id}');return !!p&&p.owned.includes('top:dinoHoodie')&&p.owned.includes('wall:outerSpace')&&p.owned.includes('spin:rocket')&&p.stickers.includes('p2dino')&&p.room.items.some(i=>i.type==='dinoPlush');})()`));
  await ev(`closeModal();document.querySelector('.pcard[data-id="${p2Id}"]').click()`); await sleep(1300); await ev(`closeModal();P().room.wall='${p2Wall}';save();show('room')`);

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
  check('phone: the 🗺️ Map button fits in the top bar', await ev(`(()=>{const r=document.querySelector('#mapBtn').getBoundingClientRect(), d=document.querySelector('#setBtn').getBoundingClientRect();return r.width>=48&&d.right<=innerWidth;})()`));
  await ev(`show('room');enterDecorate();document.querySelector('[data-dt=season]').click()`); await sleep(200); await shot('C5-phone-seasons');
  check('phone: all 7 Decorate tabs and ✔ Done fit without scrolling', await ev(`(()=>{const t=document.querySelector('#decoTabs'),d=document.querySelector('#decoDone').getBoundingClientRect();return t.scrollWidth<=t.clientWidth&&d.right<=innerWidth&&[...t.children].every(b=>b.getBoundingClientRect().height>=44);})()`), await ev(`(()=>{const t=document.querySelector('#decoTabs');return [t.scrollWidth,t.clientWidth,document.querySelector('#decoDone').getBoundingClientRect().right,[...t.children].map(b=>Math.round(b.getBoundingClientRect().height))];})()`));
  await ev(`exitDecorate()`);
  check('phone: the 📒 Sticker Book button and ⚙️ fit in the room top bar', await ev(`(()=>{const b=document.querySelector('#stkBtn').getBoundingClientRect(),s=document.querySelector('#setBtn').getBoundingClientRect(),t=document.querySelector('#roomTitle').getBoundingClientRect();return b.width>=44&&s.right<=innerWidth&&t.width>=60;})()`));
  await ev(`openStickers('fidget')`); await sleep(250); await shot('D6-phone-stickers');
  check('phone: the sticker page tabs fit (two rows since v1.46), and 3 stickers fit across', await ev(`(()=>{const t=document.querySelector('#stkTabs'),g=[...document.querySelectorAll('#stkPage .stk')].slice(0,3).map(b=>b.getBoundingClientRect());return t.scrollWidth<=t.clientWidth&&g[2].top===g[0].top&&g[2].right<=innerWidth;})()`));
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

  console.log('Backyard (v1.23)');
  await ev(`closeModal();stkPaused=true;P().easy=false;P().coins=500;applyEasy();show('room');goRoom(1)`); await sleep(200);
  const goBtns=()=>ev(`[...document.querySelectorAll('#roomTabs [data-go]')].map(b=>b.className.split('rt-')[1]+':'+b.dataset.go).join('|')`);
  check('her room has ⬆️ Loft, ⬅️ Backyard and ➡️ Studio tabs', (await goBtns())==='up:2|left:3|right:4', await goBtns());
  await ev(`document.querySelector('#roomTabs [data-go="3"]').click()`); await sleep(250); await shot('F01-backyard');
  check('🌳 Yard opens the Backyard', await ev(`roomNo===3&&cur==='room'&&document.querySelector('#roomTitle').textContent.endsWith("'s Backyard")`));
  check('the Backyard has one ➡️ tab back to her room', (await goBtns())==='right:1', await goBtns());
  check('a new Backyard: White Picket fence, Grass, nothing placed', await ev(`P().room3.wall==='picket'&&P().room3.floor==='grass'&&document.querySelector('[data-fence=picket]')&&!P().room3.items.length`));
  check('the tree, goal, shed, easel, Fuzzy and the pet are drawn', await ev(`!!(document.querySelector('[data-tree]')&&document.querySelector('[data-hot=goal]')&&document.querySelector('[data-piece=shed]')&&document.querySelector('[data-piece=easel]')&&document.querySelector('#mascotG')&&document.querySelector('[data-hot=pet]'))`));
  await ev(`document.querySelector('#mapBtn').click()`); await sleep(150);
  await ev(`document.querySelector('[data-map="2"]').click()`); await sleep(200);
  check('the 🗺️ map takes her from the Backyard to the Loft', (await ev('roomNo'))===2);
  check('…and the Loft has one ⬇️ tab back', (await goBtns())==='down:1', await goBtns());
  await ev(`goRoom(3)`); await sleep(150);
  check('Android Back from the Backyard goes to her room', await ev(`window.androidBack()===true&&cur==='room'&&roomNo===1`));
  await ev(`goRoom(3)`); await sleep(150);
  await ev(`handleHot('goal')`); await sleep(300);
  check('tapping the goal opens Soccer', await ev(`cur==='soccer'`));
  await ev(`document.querySelector('#scr-soccer [data-back]').click()`); await sleep(200);
  check('Back from Soccer returns to the Backyard', await ev(`cur==='room'&&roomNo===3`));
  for(const s of ['autumn','winter','spring','summer']){await ev(`seasonTest='${s}';renderRoom()`);await sleep(80);
    check(`${s}: the sky, the tree and the ground show the season`, await ev(`document.querySelector('#roomSvg [data-season="${s}"]')&&document.querySelector('#roomSvg [data-tree="${s}"]')&&document.querySelector('#roomSvg [data-ground]')`)); await shot('F02-yard-'+s);}
  await ev(`seasonTest=null;renderRoom()`);
  // Decorate: fences and ground only outside, indoor walls and floors only inside
  await ev(`enterDecorate();document.querySelector('[data-dt=wall]').click()`); await sleep(150);
  check('Walls tab in the Backyard: the 5 fences only', await ev(`(()=>{const k=[...document.querySelectorAll('#decoGrid [data-surf]')].map(t=>t.dataset.surf);return k.length===5&&k.every(id=>WALLS[id].yard);})()`));
  await ev(`document.querySelector('#decoGrid [data-surf=hedge]').click()`); await sleep(150); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(200);
  check('buying the Garden Hedge (15) puts it up in the Backyard only', await ev(`P().room3.wall==='hedge'&&P().owned.includes('wall:hedge')&&P().coins===485&&P().room.wall!=='hedge'&&!!document.querySelector('[data-fence=hedge]')`));
  await ev(`document.querySelector('[data-dt=floor]').click()`); await sleep(150);
  check('Floors tab in the Backyard: the 5 grounds only', await ev(`(()=>{const k=[...document.querySelectorAll('#decoGrid [data-surf]')].map(t=>t.dataset.surf);return k.length===5&&k.every(id=>FLOORS[id].yard);})()`));
  await ev(`document.querySelector('#decoGrid [data-surf=sand]').click()`); await sleep(150); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(200);
  check('buying the Sandy Beach (15) changes the ground', await ev(`P().room3.floor==='sand'&&P().coins===470`)); await shot('F03-yard-hedge-sand');
  await ev(`document.querySelector('[data-dt=season]').click()`); await sleep(150);
  check('Seasons tab in the Backyard: decorations, but no indoor walls', await ev(`document.querySelectorAll('#decoGrid [data-buy]').length>=16&&!document.querySelector('#decoGrid [data-kind=wall]')`));
  await ev(`document.querySelector('[data-dt=shop]').click()`); await sleep(150);
  const yardFirst=await ev(`[...document.querySelectorAll('#decoGrid [data-buy]')].slice(0,8).map(t=>t.dataset.buy)`);
  check('the Shop in the Backyard lists the 8 outdoor things first', yardFirst.length===8&&(await ev(`${JSON.stringify(yardFirst)}.every(k=>DECOR[k].yard)`)), yardFirst);
  await ev(`document.querySelector('#decoGrid [data-buy=trampoline]').click()`); await sleep(150); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(200);
  check('buying the Trampoline (30) puts it in the Backyard', await ev(`P().room3.items.some(i=>i.type==='trampoline'&&i.placed)&&P().coins===440`));
  await ev(`document.querySelector('#decoGrid [data-buy=stringLights]').click()`); await sleep(150); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(200);
  check('String Lights hang on the fence, not up in the sky', await ev(`(()=>{const i=P().room3.items.find(i=>i.type==='stringLights');return i&&i.y>=340&&i.y<=420;})()`));
  await ev(`document.querySelector('[data-dt=colors]').click()`); await sleep(150);
  check('Colors tab in the Backyard: the shed and the chalkboard', await ev(`[...document.querySelectorAll('#decoGrid [data-furn]')].every(b=>['shed','easel'].includes(b.dataset.furn))&&document.querySelectorAll('#decoGrid .furn-row').length===2`));
  await ev(`document.querySelector('#decoGrid [data-furn=shed][data-fc=sky]').click()`); await sleep(150);
  check('painting the shed Sky is free and shows', await ev(`P().furn.shed==='sky'&&P().coins===425&&yardFurniture().includes(FURN_COLORS.sky.l)`));
  await ev(`exitDecorate();goRoom(1);enterDecorate();document.querySelector('[data-dt=wall]').click()`); await sleep(150);
  check('her room\'s Walls tab has no fences', await ev(`document.querySelectorAll('#decoGrid [data-surf]').length>5&&![...document.querySelectorAll('#decoGrid [data-surf]')].some(t=>WALLS[t.dataset.surf].yard)`));
  await ev(`document.querySelector('[data-dt=floor]').click()`); await sleep(150);
  check('her room\'s Floors tab has no grounds', await ev(`![...document.querySelectorAll('#decoGrid [data-surf]')].some(t=>FLOORS[t.dataset.surf].yard)`));
  // My Stuff is shared by all three rooms
  await ev(`exitDecorate();P().room3.items.find(i=>i.type==='trampoline').placed=false;save();goRoom(2);enterDecorate();document.querySelector('[data-dt=mine]').click()`); await sleep(150);
  await ev(`document.querySelector('#decoGrid [data-place=trampoline]').click()`); await sleep(150);
  check('a trampoline put away in the Backyard can be placed in the Loft (it moves there)', await ev(`P().room2.items.some(i=>i.type==='trampoline'&&i.placed)&&!P().room3.items.some(i=>i.type==='trampoline')`));
  await ev(`exitDecorate();goRoom(3)`);
  // every outdoor decoration draws
  const yardKeys=await ev(`Object.keys(DECOR).filter(k=>DECOR[k].yard)`);
  check('10 outdoor decorations (8, and the Hay Bale and Toy Tractor since v1.36), priced 10-30, not in the Seasons tab', yardKeys.length===10&&(await ev(`Object.keys(DECOR).filter(k=>DECOR[k].yard).every(k=>DECOR[k].price>=10&&DECOR[k].price<=30&&!DECOR[k].season)`)), yardKeys);
  await ev(`{const R=P().room3;R.items=R.items.filter(i=>!DECOR[i.type].yard);for(const k of ${JSON.stringify(yardKeys)})R.items.push(Object.assign({uid:'yd'+k,type:k,placed:true},spot(k)));}save();renderRoom()`); await sleep(200); await shot('F04-yard-all');
  check('every outdoor decoration draws in the Backyard', await ev(`${JSON.stringify(yardKeys)}.every(k=>{const g=document.querySelector('#roomSvg .deco[data-uid="yd'+k+'"]');return g&&g.getBBox().width>20;})`));
  for(const w of ['picket','hedge','stoneWall','rainbowFence','batFence']){await ev(`P().room3.wall='${w}';renderRoom()`);check(`the ${w} fence draws`, await ev(`(()=>{const g=document.querySelector('[data-fence=${w}]');return g&&g.getBBox().width>900;})()`));}
  await shot('F05-yard-batfence');
  // stickers
  check('Yard Life and Happy Camper come just before the keeper stickers, on the Room & Style page', await ev(`STICKERS.slice(STICKERS.findIndex(s=>s.id==='save1')-2,STICKERS.findIndex(s=>s.id==='save1')).map(s=>s.id+':'+s.page).join()==='yard5:room,camper:room'`));
  check('5 things in the Backyard earn Yard Life; 3 outdoor things earn Happy Camper', await ev(`(()=>{const f=id=>stkDone(P(),STICKERS.find(s=>s.id===id));return f('yard5')&&f('camper');})()`));
  // save data
  const v22=await ev(`JSON.stringify(Object.assign({},DB,{version:13,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.room3;return q;})}))`);
  const v23=await ev(`JSON.stringify(DB)`);
  await ev(`doRestore(${JSON.stringify(v22)})`); await sleep(300);
  check('a v1.22 backup restores with an empty Backyard (save version 14 or newer)', await ev(`DB_VERSION>=14&&DB.version===DB_VERSION&&DB.profiles.every(p=>p.room3&&p.room3.wall==='picket'&&p.room3.floor==='grass'&&p.room3.items.length===0)`));
  await ev(`doRestore(${JSON.stringify(v23)})`); await sleep(300);
  check('a v1.23 backup keeps the Backyard\'s fence, ground and things', await ev(`(()=>{const p=DB.profiles.find(p=>p.room3.items.length);return p&&p.room3.floor==='sand'&&p.room3.items.some(i=>i.type==='slide')&&p.owned.includes('wall:hedge');})()`));
  await ev(`closeModal();{const p=DB.profiles[0];p.room3='oops';normalize(p);DB.profiles[0].room3.wall='lavender';DB.profiles[0].room3.floor='nope';}DB.activeId=DB.profiles[0].id;enterRoom();goRoom(3)`); await sleep(200);
  check('odd Backyard data is made safe (an indoor wall or unknown ground draws the picket fence and grass)', await ev(`typeof P().room3==='object'&&Array.isArray(P().room3.items)&&!!document.querySelector('[data-fence=picket]')&&document.querySelector('#roomSvg').innerHTML.includes('pGrass')`));
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await sleep(300); await shot('F06-phone-yard');
  check('phone: the room bar fits the 🗺️ Map button (icon only)', await ev(`(()=>{const t=document.querySelector('#scr-room .topbar');const a=document.querySelector('#mapBtn').getBoundingClientRect();return t.scrollWidth<=t.clientWidth&&a.right<=innerWidth&&a.width>=48;})()`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`goRoom(1)`); await sleep(200);

  console.log('Be the Keeper (v1.24)');
  // kpTo(state) skips the pauses (and the run-up, unless we want to dive during it) until the match reaches that state
  const kpTo=async st=>{const skip=st==='wind'?['ready','result']:['ready','wind','result'];
    // check and skip in one step: two separate calls let a frame slip in between and skip a result (a flaky test before v1.42)
    for(let i=0;i<120;i++){if(await ev(`KP.state==='${st}'||(${JSON.stringify(skip)}.includes(KP.state)&&(KP.timer=99),false)`))break;await sleep(50);}return ev('KP.state');};
  const kpTap=async(u,v)=>{const p=await ev(`(()=>{const r=socCv.getBoundingClientRect(),p=toScr(KP.g,${u},${v});return [r.left+p.x,r.top+p.y];})()`);
    await mouse('mousePressed',p[0],p[1]); await mouse('mouseReleased',p[0],p[1]); await sleep(50);};
  await ev(`closeModal();stkPaused=true;P().easy=false;applyEasy();P().coins=100;save();show('room');goRoom(1)`); await sleep(200);
  const kickLvl=await ev('P().soccer.level');
  await ev(`handleHot('goal')`); await sleep(400);
  check('Soccer still opens in ⚽ Kick mode, with ⚽ Kick and 🧤 Keep buttons', await ev(`cur==='soccer'&&P().soccer.mode==='kick'&&document.querySelector('[data-mode=kick]').classList.contains('on')&&!!document.querySelector('[data-mode=keep]')`));
  check('Kick mode: Mochi, Boo and Flap on the level tabs', await ev(`[...document.querySelectorAll('#socTabs [data-lvl] i')].map(i=>i.textContent).join('')==='😺👻🦇'`));
  await ev(`document.querySelector('[data-mode=keep]').click()`); await sleep(300);
  check('🧤 Keep: saved, the title changes, Hop / Bolt / Zip on the tabs, the kicker is hidden', await ev(`P().soccer.mode==='keep'&&document.querySelector('#socTitle').textContent.includes('Keeper')&&[...document.querySelectorAll('#socTabs [data-lvl] i')].map(i=>i.textContent).join('')==='🐸🤖🦊'&&document.querySelector('#socMascot').classList.contains('hidden')&&document.querySelector('#socTip').textContent.includes('Hop')`));
  for(let i=0;i<30&&!(await ev(`KP.img&&KP.img!=='none'`));i++) await sleep(100);
  check('the buddy in goal is a picture of her own buddy and outfit', await ev(`KP.img instanceof HTMLCanvasElement&&KP.imgKey===JSON.stringify(P().look)`));
  check('15 fixed shots per level, all inside the goal; Zip has some fakes', await ev(`['easy','medium','hard'].every(l=>KEEP_SHOTS[l].length===15&&KEEP_SHOTS[l].every(([u,v])=>Math.abs(u)<=0.42&&v>0.05&&v<0.95))&&KEEP_SHOTS.hard.some(s=>s[3])`));
  check('every shot is saved by diving to it', await ev(`['easy','medium','hard'].every(l=>KEEP_SHOTS[l].every(([u,v])=>{const x=clamp(u,-0.42,0.42),lift=clamp(v-0.5,0,0.35);return Math.abs(u-x)<STRIKERS[l].reach+0.035&&v>lift-0.035&&v<lift+KEEP_H2+0.035;}))`));
  check('on Medium and Hard, standing still saves at most 2 of 15 shots', await ev(`['medium','hard'].every(l=>KEEP_SHOTS[l].filter(([u,v])=>Math.abs(u)<STRIKERS[l].reach+0.035&&v<KEEP_H2+0.035).length<=2)`));
  check('Easy shots are slow (Hop), Hard shots are fast (Zip)', await ev(`STRIKERS.easy.T>2*STRIKERS.hard.T&&STRIKERS.easy.ballTap&&!STRIKERS.hard.ballTap`));
  const kc0=await ev('P().coins');
  await kpTo('fly');
  check('shot 1 is the first Easy shot', await ev(`KP.shot.u===KEEP_SHOTS.easy[0][0]&&KP.shot.v===KEEP_SHOTS.easy[0][1]`));
  await sleep(600);
  const bp=await ev(`(()=>{const r=socCv.getBoundingClientRect(),b=ballPos(KP.g,KP.shot,KP.t);return [r.left+b.x,r.top+b.y];})()`);
  await mouse('mousePressed',bp[0],bp[1]); await mouse('mouseReleased',bp[0],bp[1]); await sleep(150);
  check('Easy: tapping the flying ball dives right to it', await ev(`!!KP.tgt&&KP.tgt.x===KP.shot.u`)); await shot('G01-keep-easy-dive');
  await kpTo('result'); await sleep(150); await shot('G02-keep-saved');
  check('a save: a 🧤 dot, +1 coin and a saves count', await ev(`KP.saves[0]===true&&P().stats.saves===1&&document.querySelector('#socScore .dot').textContent==='🧤'&&P().coins===${kc0+1}`), await ev('P().coins'));
  await kpTo('fly'); await kpTo('result');
  check('no dive: Hop scores, and nothing is lost', await ev(`KP.saves[1]===false&&KP.shot.res==='goal'&&P().coins===${kc0+1}&&P().stats.saves===1`));
  await kpTo('wind'); const n3=await ev('JSON.stringify(KP.next)'); const N3=JSON.parse(n3);
  await kpTap(-N3.u-0.1,0.3);
  check('Easy: tapping the goal dives there', await ev(`!!KP.tgt&&Math.abs(KP.tgt.x-clamp(${-N3.u-0.1},-0.42,0.42))<0.02`));
  await kpTap(N3.u,N3.v);
  check('Easy: she can change her mind (a second tap moves the dive)', await ev(`Math.abs(KP.tgt.x-(${N3.u}))<0.02`));
  await kpTo('result');
  check('…and that saves it', await ev(`KP.saves[2]===true`));
  // dive on the first frame the ball flies (waiting inside the page, so a busy PC can't miss the short flight)
  const kpDiveInFlight=()=>ev(`new Promise(r=>{let n=0;const f=()=>{if(KP.state==='fly'){kpDive(KP.shot.u,KP.shot.v);r(1);return;}if(['ready','wind','result'].includes(KP.state))KP.timer=99;if(++n>900){r(0);return;}requestAnimationFrame(f);};f();})`);
  for(let i=3;i<5;i++){await kpDiveInFlight();await kpTo('result');}
  await kpTo('done'); await sleep(200); await shot('G03-keep-result');
  check('after 5 shots: the result box, best saves, a match counted', await ev(`document.querySelector('#modalTitle').textContent.includes('4 / 5 saves')&&P().soccer.keep.best.easy===4&&KP.round.easy===1`));
  check('+1 coin for each of the 4 saves', (await ev('P().coins'))===kc0+4, await ev('P().coins'));
  await ev(`closeModal();socCv.dispatchEvent(new PointerEvent('pointerdown',{clientX:5,clientY:5}))`);
  check('a tap after the match starts a new one, with the next 5 shots', await ev(`KP.state==='ready'&&KP.saves.length===0&&KP.next.u===KEEP_SHOTS.easy[5][0]&&KP.next.v===KEEP_SHOTS.easy[5][1]`));
  // Medium: one dive per shot, the team kit adds +1
  await ev(`document.querySelector('[data-lvl=medium]').click()`); await sleep(300);
  check('Medium has Bolt; the Kick level is untouched', await ev(`P().soccer.keep.level==='medium'&&P().soccer.level==='${kickLvl}'&&document.querySelector('#socTip').textContent.includes('Bolt')`));
  const kLook=await ev('JSON.stringify(P().look)');
  await ev(`P().look.top='jersey';P().look.bottom='shorts';renderSoccer()`); await sleep(200);
  const kc1=await ev('P().coins');
  await kpTo('wind'); await sleep(700); await shot('G04-keep-medium-hint');
  check('Medium: the first dive counts, a second one is ignored', await ev(`kpDive(KP.next.u,KP.next.v)===true&&kpDive(-KP.next.u,0.2)===false`));
  await kpTo('result');
  check('a Medium save with the team kit pays 2 + 1', await ev(`KP.saves[0]===true&&P().coins===${kc1+3}`), await ev('P().coins'));
  await ev(`P().look=JSON.parse(${JSON.stringify(kLook)});save()`);
  // Hard: a perfect 5/5 wins the Gold Glove (in the Backyard)
  await ev(`document.querySelector('[data-lvl=hard]').click()`); await sleep(300);
  check('Hard has Zip', await ev(`P().soccer.keep.level==='hard'&&document.querySelector('#socTip').textContent.includes('Zip')`));
  await kpTo('wind'); await sleep(500); await shot('G05-keep-hard');
  const kc2=await ev('P().coins'), perf0=await ev('P().stats.perfects');
  for(let i=0;i<5;i++){await kpTo('wind');await ev(`kpDive(KP.next.u,KP.next.v)`);await kpTo('result');}
  await kpTo('done'); await sleep(300); await shot('G06-keep-perfect');
  check('perfect 5/5 on Hard: 5×3 + 5 coins', (await ev('P().coins'))===kc2+20&&(await ev('P().stats.perfects'))===perf0+1, [kc2, await ev('P().coins')]);
  check('…wins the Gold Glove, shown in the result box', await ev(`P().soccer.keep.gloves.includes('hard')&&document.querySelector('#modalBody').textContent.includes('Gold Glove')`));
  check('the Gold Glove stands in the Backyard, in its own spot', await ev(`(()=>{const g=P().room3.items.filter(i=>i.type==='gloveGold');return g.length===1&&g[0].placed&&g[0].x===TROPHY_SPOTS.gloveGold.x&&!P().room.items.some(i=>/^glove/.test(i.type));})()`));
  check('no trophy or glove spot is behind the buddy', await ev(`Object.values(TROPHY_SPOTS).every(p=>p.x+70<420||p.x-70>580||p.y>604)`));
  await ev(`closeModal()`);
  check('Android Back from Keep goes to the room', await ev(`window.androidBack()===true&&cur==='room'`));
  await ev(`P().soccer.keep.best.medium=5;show('room')`); await sleep(300);
  check('an earlier 5/5 on Medium gives the Silver Glove', await ev(`P().soccer.keep.gloves.includes('medium')&&P().room3.items.some(i=>i.type==='gloveSilver')`));
  await ev(`show('soccer')`); await sleep(200); await ev(`show('room')`); await sleep(200);
  check('gloves are given only once', await ev(`P().room3.items.filter(i=>/^glove/.test(i.type)).length===2&&!P().soccer.keep.gloves.includes('easy')`));
  await ev(`closeModal();goRoom(3)`); await sleep(300); await shot('G07-yard-gloves');
  check('both gloves draw in the Backyard', await ev(`P().room3.items.filter(i=>/^glove/.test(i.type)).every(i=>{const g=document.querySelector('#roomSvg .deco[data-uid="'+i.uid+'"]');return g&&g.getBBox().width>40;})`));
  await ev(`enterDecorate();document.querySelector('[data-dt=shop]').click()`);
  check('gloves are not in the Shop', await ev(`!document.querySelector('#decoGrid [data-buy^=glove]')`)); await ev(`exitDecorate();goRoom(1)`);
  await ev(`show('soccer')`); await sleep(300);
  check('Soccer remembers Keep mode', await ev(`P().soccer.mode==='keep'&&document.querySelector('[data-mode=keep]').classList.contains('on')&&KP.state!=='off'`));
  await ev(`P().easy=true;applyEasy();P().soccer.keep.level='hard';show('room');show('soccer')`); await sleep(200);
  check('Easy mode opens Keep on Easy', await ev(`P().soccer.keep.level==='easy'&&document.querySelector('#socTip').textContent.includes('Hop')`));
  await ev(`P().easy=false;applyEasy();renderSoccer()`);
  // stickers
  check('3 keeper stickers come before the Brain Games ones, on the Soccer page', await ev(`STICKERS.slice(STICKERS.findIndex(s=>s.id==='snack8')-3,STICKERS.findIndex(s=>s.id==='snack8')).map(s=>s.id+':'+s.page).join()==='save1:soccer,save25:soccer,gloves:soccer'`));
  check('First Save is earned; Glove Case shows 2 of 3', await ev(`(()=>{const f=id=>STICKERS.find(s=>s.id===id);return stkDone(P(),f('save1'))&&stkHave(P(),f('gloves'))===2&&!stkDone(P(),f('gloves'));})()`));
  // phone
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await sleep(500); await shot('G08-phone-keep');
  check('phone: Kick, Keep, 👯 Duel and the 3 level tabs fit (icons only on the levels and Duel)', await ev(`(()=>{const t=document.querySelector('#socTabs');return t.scrollWidth<=t.clientWidth&&getComputedStyle(document.querySelector('#socTabs [data-lvl] span')).display==='none'&&document.querySelector('[data-mode=keep]').getBoundingClientRect().height>=40;})()`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false}); await sleep(200);
  await ev(`document.querySelector('[data-mode=kick]').click()`); await sleep(300);
  check('back to ⚽ Kick: the kicker shows and the keeper is Mochi, Boo or Flap again', await ev(`P().soccer.mode==='kick'&&!document.querySelector('#socMascot').classList.contains('hidden')&&document.querySelector('#socTip').textContent.includes(KEEPERS[P().soccer.level].name)&&document.querySelector('#socTitle').textContent.includes('Soccer Field')`));
  // save data
  const kv23=await ev(`JSON.stringify(Object.assign({},DB,{version:14,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.soccer.keep;delete q.soccer.mode;delete q.stats.saves;return q;})}))`);
  await ev(`P().soccer.mode='keep';save()`); const kv24=await ev(`JSON.stringify(DB)`);
  await ev(`doRestore(${JSON.stringify(kv23)})`); await sleep(300);
  check('a v1.23 backup restores with Kick mode and no keeper record (save version 15 or newer)', await ev(`DB_VERSION>=15&&DB.version===DB_VERSION&&DB.profiles.every(p=>p.soccer.mode==='kick'&&p.soccer.keep.level==='easy'&&p.soccer.keep.best.hard===0&&p.soccer.keep.gloves.length===0&&p.stats.saves===0)`));
  await ev(`doRestore(${JSON.stringify(kv24)})`); await sleep(300);
  check('a v1.24 backup keeps Keep mode, best saves, gloves and the saves count', await ev(`(()=>{const p=DB.profiles.find(p=>p.soccer.keep.gloves.length);return p&&p.soccer.mode==='keep'&&p.soccer.keep.best.hard===5&&p.soccer.keep.gloves.length===2&&p.stats.saves>=10;})()`));
  await ev(`closeModal();{const p=DB.profiles[0];p.soccer.keep='oops';p.soccer.mode=7;normalize(p);p.soccer.keep.best.hard=99;p.soccer.keep.gloves=['hard','hard','x'];normalize(p);}`);
  check('odd keeper data is made safe', await ev(`(()=>{const k=DB.profiles[0].soccer;return k.mode==='kick'&&k.keep.level==='easy'&&k.keep.best.hard===5&&k.keep.gloves.join()==='hard';})()`));
  await ev(`DB.activeId=DB.profiles[0].id;enterRoom();show('room')`); await sleep(200);

  console.log('Brain Games (v1.25)');
  await ev(`closeModal();stkPaused=true;P().easy=false;applyEasy();P().coins=100;save();show('room');goRoom(3)`); await sleep(250);
  check('the Backyard chalkboard is now a hotspot', await ev(`!!document.querySelector('#roomSvg [data-hot=brain][data-piece=easel]')`));
  await ev(`handleHot('brain')`); await sleep(300); await shot('H01-brain-menu');
  check('it opens the Brain Games menu with 7 games (2 more since v1.33, 2 more since v1.34), 0 / 24 each', await ev(`cur==='brain'&&BR.view==='menu'&&[...document.querySelectorAll('#brMenu [data-game]')].map(b=>b.dataset.game).join()==='snack,memory,pop,train,word,bake,facts'&&[...document.querySelectorAll('#brMenu .br-n')].every(n=>n.textContent.includes('0 / 24'))`));
  // the puzzle recipes
  check('every game has 8 puzzles on each level, with different ids', await ev(`Object.keys(BRAIN_GAMES).every(g=>BRAIN_LVLS.every(l=>BRAIN_GAMES[g].puzzles[l].length===8))&&new Set(Object.keys(BRAIN_GAMES).flatMap(g=>BRAIN_LVLS.flatMap(l=>BRAIN_GAMES[g].puzzles[l].map((z,i)=>brId(g,l,i))))).size===168`));
  check('Snack Stand: every answer is one of the choices; choices are different whole numbers (3 on Easy, 4 after)', await ev(`BRAIN_LVLS.every(l=>BRAIN_GAMES.snack.puzzles[l].every((z,i)=>{const o=BRAIN_GAMES.snack.options(z,l,i),a=BRAIN_GAMES.snack.answer(z,l);return o.includes(a)&&new Set(o).size===o.length&&o.every(n=>Number.isInteger(n)&&n>=1)&&o.length===(l==='easy'?3:4);}))`));
  check('Snack Stand: Easy counts up to 10; the answer is not always in the same place', await ev(`BRAIN_GAMES.snack.puzzles.easy.every(z=>z.n>=1&&z.n<=10)&&BRAIN_LVLS.every(l=>new Set(BRAIN_GAMES.snack.puzzles[l].map((z,i)=>BRAIN_GAMES.snack.options(z,l,i).indexOf(BRAIN_GAMES.snack.answer(z,l)))).size>=2)`));
  check('Snack Stand: the Hard answers are right (boxes, change, prices)', await ev(`BRAIN_GAMES.snack.puzzles.hard.map(z=>z.a).join()==='18,7,28,14,48,19,63,6'`));
  check('Memory Match: 3 / 6 / 10 different pictures; every picture draws; her own buddy never sits with the other buddies', await ev(`BRAIN_LVLS.every((l,k)=>MEM_SETS[l].every(s=>s.length===[3,6,10][k]&&new Set(s).size===s.length&&s.every(id=>memPic(id).length>60)&&!(s.includes('me')&&s.some(x=>x.startsWith('b:')))))`));
  check('Memory Match: each board is the same every time (fixed shuffle) and holds every picture twice', await ev(`BRAIN_LVLS.every(l=>MEM_SETS[l].every((s,i)=>{const a=memDeck(l,i),b=memDeck(l,i);return a.join()===b.join()&&a.length===s.length*2&&s.every(id=>a.filter(x=>x===id).length===2);}))&&memDeck('easy',0).join()!==[...MEM_SETS.easy[0],...MEM_SETS.easy[0]].join()`));
  check('Number Pop: Easy has 3+ bubbles to pop; Hard has every factor and nothing bigger than the number', await ev(`POP_SETS.easy.every(z=>popNeed(z,'easy')>=3)&&POP_SETS.hard.every(z=>z.b.every(n=>n<=z.t)&&popNeed(z,'hard')>=6&&popNeed(z,'hard')===Array.from({length:z.t},(_,i)=>i+1).filter(n=>z.t%n===0).length)`));
  check('Number Pop: Medium pairs always work out (a lone decoy never has a partner), 2+ pairs each', await ev(`POP_SETS.medium.every(z=>{const c={};z.b.forEach(n=>c[n]=(c[n]||0)+1);return popNeed(z,'medium')>=4&&Object.keys(c).every(k=>{const n=+k,m=z.t-n;return n===m?c[n]%2===0||c[n]===1:!c[m]||c[m]===c[n];});})`));
  // Snack Stand: Easy
  await ev(`document.querySelector('#brMenu [data-game=snack]').click()`); await sleep(250); await shot('H02-snack-easy');
  check('Snack Stand opens on Easy puzzle 1 with 8 puzzle buttons and 3 answers', await ev(`BR.view==='play'&&BR.game==='snack'&&BR.lvl==='easy'&&BR.idx===0&&document.querySelectorAll('#brDots [data-pz]').length===8&&document.querySelectorAll('.br-ch').length===3&&document.querySelector('#brQ').textContent.includes('How many')`));
  const sc0b=await ev('P().coins');
  const snackRight=`document.querySelector('.br-ch[data-n="'+BRAIN_GAMES.snack.answer(BRAIN_GAMES.snack.puzzles[BR.lvl][BR.idx],BR.lvl)+'"]')`;
  await ev(`document.querySelector('.br-ch:not([data-n="'+BRAIN_GAMES.snack.answer(BRAIN_GAMES.snack.puzzles.easy[0],'easy')+'"])').click()`); await sleep(150);
  check('a wrong answer wobbles and says try again (nothing lost)', await ev(`!BR.won&&document.querySelector('.br-ch.wob')&&document.querySelector('#brMsg').textContent.includes('Try again')&&P().coins===${sc0b}`));
  await ev(`${snackRight}.click()`); await sleep(150);
  check('the right answer solves it: +2 coins, the puzzle button turns green', await ev(`BR.won&&P().brain.solved.includes('snack:e1')&&P().coins===${sc0b+2}&&document.querySelector('#brDots [data-pz="0"]').classList.contains('done')`));
  await sleep(1000); await shot('H03-snack-solved');
  check('then a box with Next', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&document.querySelector('#modalTitle').textContent.includes('Puzzle 1 solved')`));
  await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(200);
  check('Next opens puzzle 2', await ev(`BR.idx===1&&!BR.won`));
  for(let i=1;i<8;i++){await ev(`${snackRight}.click()`);await sleep(80);if(i<7){await ev(`brPuzzle('snack','easy',${i+1})`);await sleep(60);}}
  check('all 8 Easy puzzles: 8 × 2 + the 5 level bonus', (await ev('P().coins'))===sc0b+21, await ev('P().coins'));
  await sleep(1000);
  check('the last box says every Easy puzzle is solved', await ev(`document.querySelector('#modalBody').textContent.includes('Every Easy puzzle solved')`));
  await ev(`closeModal();brPuzzle('snack','easy',0)`); await sleep(100); await ev(`${snackRight}.click()`); await sleep(100);
  check('replaying a solved puzzle is free practice (no coins)', (await ev('P().coins'))===sc0b+21);
  // Snack Stand: Medium and Hard
  await ev(`document.querySelector('#brTabs [data-lvl=medium]').click()`); await sleep(200); await shot('H04-snack-medium');
  check('the Medium tab: an order to add up, 4 answers, saved as this game\'s level', await ev(`BR.lvl==='medium'&&P().brain.level.snack==='medium'&&document.querySelectorAll('.br-ch').length===4&&document.querySelectorAll('#brQ .br-grp').length===2`));
  await ev(`document.querySelector('#brTabs [data-lvl=hard]').click()`); await sleep(200); await shot('H05-snack-hard');
  check('the Hard tab: a word problem', await ev(`BR.lvl==='hard'&&document.querySelector('#brQ').textContent.includes('boxes of 6')`));
  // Memory Match
  await ev(`brMenu()`); await sleep(150);
  check('the menu shows Snack Stand\'s Easy level done', await ev(`document.querySelector('[data-game=snack] .br-pips i').classList.contains('on')&&document.querySelector('[data-game=snack] .br-n').textContent.includes('8 / 24')`));
  await ev(`document.querySelector('#brMenu [data-game=memory]').click()`); await sleep(250);
  check('Memory Match Easy: 6 cards face down', await ev(`BR.game==='memory'&&document.querySelectorAll('.mem-card').length===6&&!document.querySelector('.mem-card.open')`));
  const pairOf=`(i=>MEM.cards.findIndex((c,k)=>k!==i&&c.id===MEM.cards[i].id))`;
  const notPair=await ev(`MEM.cards.findIndex(c=>c.id!==MEM.cards[0].id)`);
  await ev(`document.querySelector('.mem-card[data-c="0"]').click();document.querySelector('.mem-card[data-c="${notPair}"]').click()`); await sleep(150); await shot('H06-memory-miss');
  check('two different cards stay open for a moment…', await ev(`document.querySelectorAll('.mem-card.open').length===2&&MEM.lock`));
  await ev(`document.querySelector('.mem-card[data-c="${notPair===1?2:1}"]').click()`);
  check('…(a third tap waits)…', await ev(`document.querySelectorAll('.mem-card.open').length===2`));
  await sleep(1000);
  check('…then turn back over', await ev(`!document.querySelector('.mem-card.open')&&!MEM.lock`));
  const mc1=await ev('P().coins');
  await ev(`(()=>{for(let i=0;i<MEM.cards.length;i++){if(MEM.cards[i].got)continue;const j=${pairOf}(i);document.querySelector('.mem-card[data-c="'+i+'"]').click();document.querySelector('.mem-card[data-c="'+j+'"]').click();}})()`); await sleep(150); await shot('H07-memory-done');
  check('finding all 3 pairs solves it (+2)', await ev(`BR.won&&P().brain.solved.includes('memory:e1')&&P().coins===${mc1+2}&&document.querySelectorAll('.mem-card.got').length===6`));
  await ev(`closeModal();document.querySelector('#brTabs [data-lvl=hard]').click()`); await sleep(300); await shot('H08-memory-hard');
  check('Memory Hard: 20 cards in 5 columns', await ev(`document.querySelectorAll('.mem-card').length===20&&getComputedStyle(document.querySelector('.mem-grid')).gridTemplateColumns.split(' ').length===5`));
  // Number Pop
  await ev(`brMenu();document.querySelector('#brMenu [data-game=pop]').click()`); await sleep(250); await shot('H09-pop-easy');
  check('Number Pop Easy: pop every 2 (shown with dots)', await ev(`BR.game==='pop'&&document.querySelector('.pop-target b').textContent==='2'&&document.querySelectorAll('.nbub').length===7&&!!document.querySelector('.nbub .br-dots')`));
  await ev(`[...document.querySelectorAll('.nbub')].find(b=>b.querySelector('b').textContent!=='2').click()`); await sleep(100);
  check('a wrong bubble wobbles and stays', await ev(`!!document.querySelector('.nbub.wob:not(.popped)')&&POP.popped===0`));
  const pcb0=await ev('P().coins');
  await ev(`[...document.querySelectorAll('.nbub')].filter(b=>b.querySelector('b').textContent==='2').forEach(b=>b.click())`); await sleep(150);
  check('popping all four 2s solves it (+2)', await ev(`BR.won&&POP.popped===4&&P().brain.solved.includes('pop:e1')&&P().coins===${pcb0+2}`));
  await ev(`closeModal();document.querySelector('#brTabs [data-lvl=medium]').click()`); await sleep(250);
  const bub=v=>`[...document.querySelectorAll('.nbub:not(.popped)')].find(b=>b.querySelector('b').textContent==='${v}')`;
  await ev(`${bub(3)}.click()`);
  check('Medium: the first bubble is picked (glows)', await ev(`document.querySelectorAll('.nbub.sel').length===1`));
  await ev(`${bub(6)}.click()`); await sleep(100);
  check('3 + 6 isn\'t 10: both wobble, the sum is shown, nothing pops', await ev(`POP.popped===0&&!document.querySelector('.nbub.sel')&&document.querySelector('#brMsg').textContent.includes('3 + 6 = 9')`));
  await ev(`${bub(3)}.click();${bub(7)}.click()`); await sleep(100);
  check('3 + 7 = 10 pops both', await ev(`POP.popped===2&&!BR.won`));
  await ev(`${bub(6)}.click();${bub(4)}.click()`); await sleep(100); await shot('H10-pop-medium');
  check('6 + 4 pops the last pair and solves it (the lone 5 is a decoy)', await ev(`BR.won&&P().brain.solved.includes('pop:m1')`));
  await ev(`closeModal();document.querySelector('#brTabs [data-lvl=hard]').click()`); await sleep(250);
  await ev(`${bub(5)}.click()`); await sleep(100);
  check('Hard: 5 is not a factor of 12 (it says what is left over)', await ev(`POP.popped===0&&document.querySelector('#brMsg').textContent.includes('leaves 2 over')`));
  await ev(`[...document.querySelectorAll('.nbub')].filter(b=>12%Number(b.querySelector('b').textContent)===0).forEach(b=>b.click())`); await sleep(150); await shot('H11-pop-hard');
  check('popping 1, 2, 3, 4, 6 and 12 solves it', await ev(`BR.won&&POP.popped===6&&P().brain.solved.includes('pop:h1')`));
  // back, Easy mode, stickers
  await ev(`closeModal()`);
  check('Android Back: puzzle → menu', await ev(`window.androidBack()===true&&cur==='brain'&&BR.view==='menu'`));
  check('…→ the Backyard', await ev(`window.androidBack()===true&&cur==='room'&&roomNo===3`));
  await ev(`show('brain');document.querySelector('#brMenu [data-game=pop]').click()`); await sleep(150);
  await ev(`document.querySelector('#brBack').click()`); await sleep(100);
  check('⬅ Games goes back to the menu, ⬅ Room to the room', await ev(`BR.view==='menu'&&document.querySelector('#brBack').textContent.includes('Room')`)&&await ev(`(document.querySelector('#brBack').click(),cur==='room')`));
  await ev(`P().easy=true;applyEasy();show('brain')`); await sleep(200);
  check('Easy mode: every game opens on Easy, with no reading needed', await ev(`Object.values(P().brain.level).every(l=>l==='easy')`)&&await ev(`(document.querySelector('#brMenu [data-game=snack]').click(),BR.lvl==='easy'&&!document.querySelector('#brQ').textContent.includes('How many'))`));
  await shot('H12-brain-easy-mode');
  await ev(`P().easy=false;applyEasy();show('room')`);
  check('4 Brain Games stickers before the song ones, on the Code & Brain page', await ev(`STICKERS.slice(STICKERS.findIndex(s=>s.id==='songDino')-4,STICKERS.findIndex(s=>s.id==='songDino')).map(s=>s.id+':'+s.page).join()==='snack8:code,memory8:code,pop8:code,brainChamp:code'&&STK_PAGES.code.name==='Code & Brain'`));
  check('8 Snack Stand puzzles earn Snack Shop; Brain Champ shows 1 of 9 levels', await ev(`(()=>{const f=id=>STICKERS.find(s=>s.id===id);return stkDone(P(),f('snack8'))&&!stkDone(P(),f('pop8'))&&stkHave(P(),f('brainChamp'))===1;})()`));
  // phone
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await ev(`show('brain')`); await sleep(400); await shot('H13-phone-brain-menu');
  check('phone: the 3 games fit (no sideways scroll)', await ev(`(()=>{const m=document.querySelector('#brMenu');return m.scrollWidth<=m.clientWidth&&[...document.querySelectorAll('.br-game')].every(b=>b.getBoundingClientRect().right<=innerWidth);})()`));
  await ev(`P().brain.level.memory='hard';brOpen('memory')`); await sleep(300); await shot('H14-phone-memory-hard');
  check('phone: 20 Memory cards and the puzzle buttons fit the width; buttons are 48 px', await ev(`(()=>{const s=document.querySelector('.br-scroll');return s.scrollWidth<=s.clientWidth&&[...document.querySelectorAll('.mem-card')].every(c=>c.getBoundingClientRect().right<=innerWidth&&c.getBoundingClientRect().width>=56)&&document.querySelector('.br-dot').getBoundingClientRect().width>=48;})()`));
  await ev(`P().brain.level.snack='easy';brOpen('snack')`); await sleep(200); await shot('H15-phone-snack');
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false}); await ev(`show('room')`); await sleep(200);
  // save data
  const bv24=await ev(`JSON.stringify(Object.assign({},DB,{version:15,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.brain;return q;})}))`);
  const bv25=await ev(`JSON.stringify(DB)`);
  await ev(`doRestore(${JSON.stringify(bv24)})`); await sleep(300);
  check('a v1.24 backup restores with Brain Games at the start (save version 16 or later)', await ev(`DB_VERSION>=16&&DB.version===DB_VERSION&&DB.profiles.every(p=>p.brain&&p.brain.game==='snack'&&p.brain.solved.length===0&&Object.values(p.brain.level).every(l=>l==='easy')&&Object.keys(p.brain.level).length===Object.keys(BRAIN_GAMES).length)`));
  await ev(`doRestore(${JSON.stringify(bv25)})`); await sleep(300);
  check('a v1.25 backup keeps the puzzles solved and the levels', await ev(`(()=>{const p=DB.profiles.find(p=>p.brain.solved.length);return p&&p.brain.solved.length===12&&p.brain.solved.includes('pop:h1')&&p.brain.level.memory==='hard';})()`));
  await ev(`closeModal();{const p=DB.profiles[0];p.brain={game:'chess',level:{snack:'super',pop:7},solved:['snack:e1','snack:e1',5]};normalize(p);}`);
  check('odd Brain Games data is made safe', await ev(`(()=>{const b=DB.profiles[0].brain;return b.game==='snack'&&b.level.snack==='easy'&&b.level.pop==='easy'&&b.level.memory==='easy'&&b.solved.join()==='snack:e1';})()`));
  await ev(`DB.activeId=DB.profiles[0].id;enterRoom();show('room')`); await sleep(200);

  console.log('Stage song pack (v1.26)');
  check('8 songs: the first 3, then Neon Hearts, Stadium Clap, Dino Stomp, Rocket Launch, Moon Lullaby', await ev(`SONG_IDS.join()==='starlight,bats,sugar,neon,clap,dino,rocket,lullaby'&&SONG_IDS.every(id=>{const S=SONGS[id];return S.name&&S.icon&&S.desc&&S.scale.length===10&&S.mel.A.length===32&&S.mel.B.length===32&&/^[AB]+$/.test(S.form);})`));
  await ev(`closeModal();P().stage.level='easy';show('stage')`); await sleep(400); await shot('S01-stage-8-songs');
  check('the song list shows all 8, with no scrolling on the tablet; every button is big', await ev(`(()=>{const b=[...document.querySelectorAll('#stgSongs [data-song]')],k=document.querySelector('#stgPick');return b.length===8&&k.scrollHeight<=k.clientHeight&&b.every(x=>x.getBoundingClientRect().height>=80&&x.getBoundingClientRect().width>=180);})()`));
  const sp0=await ev('P().coins'), spb0=await ev('P().bonusGot.length');
  await ev(`document.querySelector('[data-song=dino]').click()`); await sleep(300);
  check('tapping a new song starts it', await ev(`STG.state==='play'&&STG.song==='dino'`));
  await sleep(1500); await shot('S02-stage-dino');
  await ev('stAll()'); await ev('stSkip()'); await sleep(500);
  check('Dino Stomp: every note Perfect = 3 stars, 3 × 2 coins (+10 per new card)', await ev(`P().stage.best.dino.easy.stars===3&&document.querySelector('#modalTitle').textContent.includes('Dino Stomp')`)&&(await ev('P().coins'))===sp0+6+10*((await ev('P().bonusGot.length'))-spb0), [sp0, spb0, await ev('P().coins')]);
  await ev(`closeModal();P().stage.level='hard';stStart('rocket')`); await sleep(200);
  check('Hard Rocket Launch has 3 lanes', await ev(`STG.g.n===3`));
  await ev('stAll()'); await ev('stSkip()'); await sleep(500);
  check('3 stars on Hard on a new song is saved (the Golden Mic stays one)', await ev(`P().stage.best.rocket.hard.stars===3&&allItems(P()).filter(i=>i.type==='goldenMic').length===1`));
  await ev(`closeModal();P().stage.level='medium';stStart('lullaby')`); await sleep(200); await ev('stAll()'); await ev('stSkip()'); await sleep(500);
  await ev(`closeModal();show('stage')`); await sleep(200);
  check('the song list shows the new stars', await ev(`document.querySelectorAll('[data-song=lullaby] .ss span:not(.off)').length===3&&document.querySelectorAll('[data-song=neon] .ss span:not(.off)').length===0`));
  check('Encore! still means the first 3 songs (not all 8)', await ev(`(()=>{const e=BONUS.find(b=>b.id==='encore'),one={easy:{stars:1}};return e.ok({stage:{best:{starlight:one,bats:one,sugar:one}}})&&!e.ok({stage:{best:{starlight:one,bats:one}}});})()`));
  check('4 song stickers after the Brain Games ones, on the Stage page', await ev(`STICKERS.slice(STICKERS.findIndex(s=>s.id==='songDino'),STICKERS.findIndex(s=>s.id==='songDino')+4).map(s=>s.id+':'+s.page).join()==='songDino:stage,songRocket:stage,songMoon:stage,setlist:stage'`));
  check('Dino Stomper, Lift-off! and Sweet Dreams are earned; Whole Setlist needs 3 stars on all 8', await ev(`(()=>{const f=id=>STICKERS.find(s=>s.id===id),p=P();return ['songDino','songRocket','songMoon'].every(id=>stkDone(p,f(id)))&&stkNeed(f('setlist'))===8&&!stkDone(p,f('setlist'))&&stkHave(p,f('setlist'))>=3;})()`));
  check('Whole Setlist is earned with 3 stars on every song', await ev(`(()=>{const q={stage:{best:{}}};SONG_IDS.forEach(id=>q.stage.best[id]={hard:{stars:3,score:1}});return stkDone(q,STICKERS.find(s=>s.id==='setlist'));})()`));
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await ev(`stgPickView()`); await sleep(300); await shot('S03-phone-songs');
  check('phone: the songs are 2 across and fit the width', await ev(`(()=>{const b=[...document.querySelectorAll('#stgSongs [data-song]')].map(x=>x.getBoundingClientRect());return b[0].top===b[1].top&&b[1].top<b[2].top&&b.every(r=>r.right<=innerWidth&&r.height>=48);})()`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false}); await ev(`show('room')`); await sleep(200);

  console.log('About & Gift Story (v1.22)');
  check('a new device (no rooms at the start) noted the version without a What\'s New box', await ev(`DB.settings.seenNew===APP_VERSION`));
  await ev(`show('room');settingsModal()`);
  check('Settings has a 💌 About button', await ev(`!!document.querySelector('#sAbout')`));
  await ev(`document.querySelector('#sAbout').click()`); await sleep(300);
  check('it opens the About screen and closes Settings', await ev(`cur==='about'&&document.querySelector('#modal').classList.contains('hidden')`));
  const realLocal=await ev(`JSON.stringify(window.ABOUT_LOCAL||null)`);
  check('the example About file is in the repo', fs.existsSync(path.join(__dirname,'..','web','about-local.example.js')));
  await ev(`window.ABOUT_LOCAL=undefined;renderAbout()`); await sleep(150); await shot('C01-about-generic');
  check('with no local file: generic greeting, letter and signature, "made just for you"', await ev(`(()=>{const t=document.querySelector('#abPage').textContent,c=document.querySelector('#abCert').textContent;return t.includes(ABOUT_DEFAULT.greeting)&&t.includes(ABOUT_DEFAULT.from)&&t.includes(ABOUT_DEFAULT.letter[0])&&c.includes('made just for')&&c.includes('you');})()`));
  const tl=await ev(`GIFT_TIMELINE.map(t=>t.v)`);
  check('the gift timeline has every version from 1.0 to APP_VERSION, in order', tl[0]==='1.0'&&tl[tl.length-1]===appV&&tl.every((v,i)=>v==='1.'+i), tl);
  check('every timeline entry has a date, icon, name and why line', await ev(`GIFT_TIMELINE.every(t=>/^\\d{4}-\\d\\d-\\d\\d$/.test(t.d)&&t.i&&t.n&&t.why)`));
  check('this version has What\'s New news', await ev(`!!(GIFT_TIMELINE[GIFT_TIMELINE.length-1].news||[]).length`));
  check('the timeline shows one row per version; this version is highlighted', await ev(`document.querySelectorAll('.ab-row').length===GIFT_TIMELINE.length&&document.querySelector('.ab-row.now').dataset.v===APP_VERSION`));
  check('the certificate shows Edition 1 of 1, the version and the start date', await ev(`(()=>{const t=document.querySelector('#abCert').textContent;return t.includes('Edition 1 of 1')&&t.includes('version '+APP_VERSION)&&t.includes('14 Nov 2026');})()`));
  await ev(`window.ABOUT_LOCAL={names:['Zip','Bean','Moss'],from:'Love, Test Cousin',letter:['Hello from the test.'],why:{'1.5':'For Zip ⚽'}};renderAbout()`); await sleep(150); await shot('C02-about-local');
  check('a local file\'s nicknames, letter and signature are used', await ev(`(()=>{const t=document.querySelector('#abPage').textContent;return t.includes('Dear Zip, Bean and Moss,')&&document.querySelector('#abCert').textContent.includes('Zip, Bean & Moss')&&t.includes('Hello from the test.')&&!t.includes(ABOUT_DEFAULT.letter[0])&&t.includes('Love, Test Cousin');})()`));
  check('a local why line replaces only its own update', await ev(`document.querySelector('.ab-row[data-v="1.5"]').textContent.includes('For Zip')&&document.querySelector('.ab-row[data-v="1.3"]').textContent.includes('Because you love to draw')`));
  await ev(`window.ABOUT_LOCAL={names:'oops',letter:[3,''],from:'  ',why:null};renderAbout()`); await sleep(100);
  check('odd local words fall back to the generic ones', await ev(`(()=>{const t=document.querySelector('#abPage').textContent;return t.includes(ABOUT_DEFAULT.greeting)&&t.includes(ABOUT_DEFAULT.letter[0])&&t.includes(ABOUT_DEFAULT.from);})()`));
  const tapBuddy=async()=>{for(let i=0;i<5;i++){await ev(`document.querySelector('#abBuddy').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);await sleep(60);}};
  await tapBuddy();
  check('with no secret, tapping the buddy 5 times shows nothing', await ev(`document.querySelector('#abSecret').classList.contains('hidden')`));
  await ev(`window.ABOUT_LOCAL={secret:'Boop the snoot!'};renderAbout()`); await sleep(100); await tapBuddy(); await sleep(100);
  check('with a secret, tapping the buddy 5 times shows it', await ev(`!document.querySelector('#abSecret').classList.contains('hidden')&&document.querySelector('#abSecret').textContent==='Boop the snoot!'`));
  await shot('C03-about-secret');
  await ev(`window.ABOUT_LOCAL=${realLocal}||undefined;renderAbout()`);
  check('Android Back from About goes to the room', await ev(`window.androidBack()===true&&cur==='room'`));
  await ev(`show('about')`); await ev(`document.querySelector('#scr-about [data-back]').click()`);
  check('⬅ Room from About goes to the room', await ev(`cur==='room'`));
  await ev(`show('profiles');whatsNew.wait=0;DB.settings.seenNew='1.21';whatsNew()`); await sleep(200); await shot('C04-whats-new');
  check('after an update, What\'s New shows the news once (the last 3 updates at most, the newest included)', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&document.querySelector('#modalTitle').textContent.includes('New')&&document.querySelectorAll('#modalBody .wn').length===Math.min(3,GIFT_TIMELINE.filter(t=>verNum(t.v)>verNum('1.21')).length)&&document.querySelector('#modalBody').textContent.includes(GIFT_TIMELINE[GIFT_TIMELINE.length-1].n)&&DB.settings.seenNew===APP_VERSION`));
  await ev(`closeModal();whatsNew()`);
  check('it does not show again', await ev(`document.querySelector('#modal').classList.contains('hidden')`));
  await ev(`DB.settings.seenNew='';whatsNew()`); await sleep(100);
  check('an old save with no seenNew sees only this version\'s news', await ev(`document.querySelectorAll('#modalBody .wn').length===1&&document.querySelector('#modalBody').textContent.includes('v'+APP_VERSION)`));
  await ev(`closeModal()`);
  await ev(`(()=>{const b=JSON.parse(JSON.stringify(DB));b.settings.seenNew='1.0';doRestore(JSON.stringify(b));})()`); await sleep(300);
  check('restoring a backup keeps this device\'s What\'s New (no repeat)', await ev(`DB.settings.seenNew===APP_VERSION`));
  await ev(`closeModal();DB.activeId=DB.profiles[0].id;show('about')`);
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await sleep(300); await shot('C05-phone-about');
  check('phone: the certificate and letter fit the width (no sideways scroll)', await ev(`(()=>{const pg=document.querySelector('#abPage'),c=document.querySelector('#abCert').getBoundingClientRect();return pg.scrollWidth<=pg.clientWidth&&c.right<=innerWidth&&c.left>=0&&c.width>300;})()`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`show('room')`);

  console.log('Looks, emotes & night mode (v1.27)');
  await ev(`closeModal();DB.activeId=DB.profiles[0].id;{const p=P();p.looks=[null,null,null,null];p.night={};p.stats.nights=0;p.easy=false;}show('closet')`); await sleep(200);
  check('save version 17 or later: every room has 4 empty look slots and the lights on', await ev(`DB_VERSION>=17&&DB.version===DB_VERSION&&DB.profiles.every(p=>Array.isArray(p.looks)&&p.looks.length===4&&p.night&&typeof p.night==='object')`));
  check('the Closet shows ⭐ My Looks: 4 slots and a 💾 button, all big enough', await ev(`(()=>{const s=[...document.querySelectorAll('#looksRow .lk-slot')],b=document.querySelector('#lookSave');return s.length===4&&!!b&&s.concat(b).every(x=>{const r=x.getBoundingClientRect();return r.width>=48&&r.height>=48;});})()`));
  await ev(`P().look.kind='bunny';document.querySelector('[data-look="0"]').click()`); await sleep(100);
  check('tapping an empty slot keeps the outfit there (not the buddy, face or fur)', await ev(`(()=>{const p=P(),L=p.looks[0];return !!L&&L.top===p.look.top&&L.hair===p.look.hair&&!('kind' in L)&&!('face' in L)&&!('fur' in L);})()`));
  const top0=await ev(`P().looks[0].top`);
  const otherTop=await ev(`(()=>{const p=P(),it=CLOSET.top.items.find(i=>i.id!==p.look.top);if(!p.owned.includes('top:'+it.id))p.owned.push('top:'+it.id);return it.id;})()`);
  await ev(`P().look.top=${JSON.stringify(otherTop)};P().look.kind='dino';renderCloset()`);
  await ev(`document.querySelector('[data-look="0"]').click()`); await sleep(100);
  check('tapping a full slot wears that look; the buddy stays the same', await ev(`P().look.top===${JSON.stringify(top0)}&&P().look.kind==='dino'`));
  await shot('L01-closet-looks');
  await ev(`P().look.top=${JSON.stringify(otherTop)};renderCloset();document.querySelector('#lookSave').click()`); await sleep(50);
  check('💾 makes the slots ready to save', await ev(`document.querySelector('#looksRow').classList.contains('saving')`));
  await ev(`document.querySelector('[data-look="0"]').click()`); await sleep(100);
  check('saving over a full slot asks first', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&P().looks[0].top===${JSON.stringify(top0)}`));
  await ev(`[...document.querySelectorAll('#modalBtns .btn')].pop().click()`); await sleep(100);
  check('✔ Yes replaces the look', await ev(`P().looks[0].top===${JSON.stringify(otherTop)}&&!document.querySelector('#looksRow').classList.contains('saving')`));
  await ev(`P().looks[1]={top:'noSuchTop',hairColor:'noSuchColor'};window._lk=[P().look.top,P().look.hairColor];renderCloset();document.querySelector('[data-look="1"]').click()`);
  check('a look with things that do not exist changes nothing', await ev(`P().look.top===window._lk[0]&&P().look.hairColor===window._lk[1]`));
  await ev(`P().looks[1]=null;renderCloset();[1,2,3].forEach(i=>document.querySelector('[data-look="'+i+'"]').click())`);
  check('Fashionista is earned with 4 looks kept', await ev(`P().looks.every(Boolean)&&stkDone(P(),STICKERS.find(s=>s.id==='looks4'))`));
  check('2 looks stickers after the song ones, on the Room & Style page', await ev(`STICKERS.slice(STICKERS.findIndex(s=>s.id==='looks4'),STICKERS.findIndex(s=>s.id==='looks4')+2).map(s=>s.id+':'+s.page).join()==='looks4:room,night1:room'`));
  await ev(`P().look.kind='bunny';roomNo=1;show('room')`); await sleep(200);
  await ev(`mascotTap()`); await sleep(100);
  check('tapping the buddy shows 4 big emote buttons', await ev(`(()=>{const b=[...document.querySelectorAll('#emoteBar [data-emote]')];return !document.querySelector('#emoteBar').classList.contains('hidden')&&b.map(x=>x.dataset.emote).join()==='wave,dance,laugh,nap'&&b.every(x=>x.getBoundingClientRect().height>=48&&x.getBoundingClientRect().width>=48);})()`));
  await ev(`document.querySelector('[data-emote=dance]').click()`); await sleep(150); await shot('L02-emote-dance');
  check('💃 Dance makes the buddy dance and say so', await ev(`document.querySelector('#mascotG').classList.contains('em-dance')&&document.querySelector('#bubble').textContent.includes('Dance')&&!!document.querySelector('#emoteFx')`));
  await ev(`document.querySelector('[data-emote=nap]').click()`); await sleep(100);
  check('💤 Nap switches to the nap (one emote at a time)', await ev(`(()=>{const c=document.querySelector('#mascotG').classList;return c.contains('em-nap')&&!c.contains('em-dance');})()`));
  await sleep(3400);
  check('the emote ends by itself', await ev(`![...document.querySelector('#mascotG').classList].some(c=>c.startsWith('em-'))`));
  await ev(`enterDecorate()`);
  check('decorating hides the emote buttons and the 🌙 button', await ev(`document.querySelector('#emoteBar').classList.contains('hidden')&&document.querySelector('#nightBtn').classList.contains('hidden')`));
  await ev(`exitDecorate()`);
  check('the 🌙 button is in the room corner, big enough', await ev(`(()=>{const r=document.querySelector('#nightBtn').getBoundingClientRect();return !document.querySelector('#nightBtn').classList.contains('hidden')&&r.width>=48&&r.height>=48;})()`));
  await ev(`{const p=P();p.room.items.push({uid:'lavaT',type:'lava',x:700,y:560,placed:true});}document.querySelector('#nightBtn').click()`); await sleep(200); await shot('L03-night-room');
  check('🌙 turns the lights off in this room only, and is saved', await ev(`P().night[1]===true&&!P().night[2]&&JSON.parse(localStorage.getItem(SAVE_KEY)).profiles.find(q=>q.id===P().id).night[1]===true`));
  check('the room is dimmed, with the window at night and a lamp glowing', await ev(`!!document.querySelector('#roomSvg .night mask')&&!!document.querySelector('#roomSvg .night [fill="url(#ngGlow-pink)"]')&&document.querySelector('#nightBtn').textContent==='☀️'`));
  check('the dark layer lets taps through to the room', await ev(`getComputedStyle(document.querySelector('#roomSvg .night')).pointerEvents==='none'`));
  check('Night Owl is earned', await ev(`P().stats.nights===1&&stkDone(P(),STICKERS.find(s=>s.id==='night1'))`));
  await ev(`goRoom(2)`); await sleep(150);
  check('the Loft still has the lights on', await ev(`!document.querySelector('#roomSvg .night')&&document.querySelector('#nightBtn').textContent==='🌙'`));
  await ev(`document.querySelector('#nightBtn').click()`); await sleep(150); await shot('L04-night-loft');
  check('the Loft at night: its pendant lamp glows', await ev(`!!document.querySelector('#roomSvg .night [fill="url(#ngGlow-warm)"]')`));
  await ev(`goRoom(3);document.querySelector('#nightBtn').click()`); await sleep(150); await shot('L05-night-yard');
  check('the Backyard at night has the moon and stars', await ev(`!!document.querySelector('#roomSvg .night')&&P().night[3]===true`));
  await ev(`goRoom(1)`); await sleep(100);
  check('back in her room, it is still night', await ev(`!!document.querySelector('#roomSvg .night')`));
  await ev(`enterDecorate()`);
  check('decorating turns the dark off while moving things', await ev(`!document.querySelector('#roomSvg .night')`));
  await ev(`exitDecorate();document.querySelector('#nightBtn').click()`); await sleep(100);
  check('☀️ turns the lights back on', await ev(`!P().night[1]&&!document.querySelector('#roomSvg .night')`));
  await ev(`{const p=P();p.room.items=p.room.items.filter(i=>i.uid!=='lavaT');}save()`);
  const bv26=await ev(`JSON.stringify(Object.assign({},DB,{version:16,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.looks;delete q.night;return q;})}))`);
  const bv27=await ev(`JSON.stringify(DB)`);
  await ev(`doRestore(${JSON.stringify(bv26)})`); await sleep(300);
  check('a v1.26 backup restores with empty looks and the lights on (save version 17 or later)', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.looks.length===4&&p.looks.every(l=>l===null)&&Object.keys(p.night).length===0)`));
  await ev(`closeModal();doRestore(${JSON.stringify(bv27)})`); await sleep(300);
  check('a v1.27 backup keeps the looks and the night rooms', await ev(`(()=>{const p=DB.profiles[0];return p.looks.every(Boolean)&&p.night[2]===true&&p.night[3]===true;})()`));
  await ev(`closeModal();{const p=DB.profiles[0];p.looks='lots';p.night={1:'yes',2:true,7:true};normalize(p);}`);
  check('odd looks and night data are made safe', await ev(`(()=>{const p=DB.profiles[0];return p.looks.length===4&&p.looks.every(l=>l===null)&&JSON.stringify(p.night)==='{"2":true}';})()`));
  await ev(`DB.activeId=DB.profiles[0].id;roomNo=1;show('closet')`);
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await sleep(300); await shot('L06-phone-closet');
  check('phone: the looks row fits the width', await ev(`[...document.querySelectorAll('#looksRow > *')].every(x=>{const r=x.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})`));
  await ev(`show('room');mascotTap()`); await sleep(200); await shot('L07-phone-emotes');
  check('phone: the emote buttons and 🌙 fit on the screen', await ev(`[...document.querySelectorAll('#emoteBar .em-btn'),document.querySelector('#nightBtn')].every(x=>{const r=x.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight&&r.height>=48;})`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`show('room')`);

  console.log('Gifts & room layouts (v1.28)');
  await ev(`closeModal();if(DB.profiles.length<2){const q=newProfile('Gifty');normalize(q);DB.profiles.push(q);}
    {const A=DB.profiles[0],B=DB.profiles[1];DB.activeId=A.id;[A,B].forEach(p=>{p.gifts=[];p.stats.gifts=0;p.presets={1:[null,null,null],2:[null,null,null],3:[null,null,null]};p.easy=false;});A.coins=30;}
    save();roomNo=1;show('room')`); await sleep(200);
  const nmA=await ev(`DB.profiles[0].name`), idB=await ev(`DB.profiles[1].id`), coinsB=await ev(`DB.profiles[1].coins`);
  check('save version 18: every room has a gift inbox and 3 layout slots per room', await ev(`DB_VERSION>=18&&DB.version===DB_VERSION&&DB.profiles.every(p=>Array.isArray(p.gifts)&&[1,2,3].every(k=>p.presets[k].length===3))`));
  await ev(`settingsModal()`);
  check('Settings has 🎁 Give a gift', await ev(`!!document.querySelector('#sGift')`));
  await ev(`document.querySelector('#sGift').click()`); await sleep(100); await shot('GF01-give-what');
  check('it shows 5 / 10 / 20 coins', await ev(`[...document.querySelectorAll('#gvGrid [data-gk^="coins:"]')].map(b=>b.dataset.gk).join()==='coins:5,coins:10,coins:20'`));
  check('posters and prizes can not be given', await ev(`!giftable({type:'poster',placed:false})&&!giftable({type:'trophyGold',placed:false})&&!giftable({type:'gloveGold',placed:false})&&giftable({type:'plant',placed:false})&&!giftable({type:'plant',placed:true})`));
  await ev(`document.querySelector('[data-gk="coins:10"]').click()`); await sleep(100);
  check('then it asks who: every other room, not this one', await ev(`(()=>{const w=[...document.querySelectorAll('#gvWho [data-to]')].map(b=>b.dataset.to);return w.length===DB.profiles.length-1&&!w.includes(P().id)&&w.includes(${JSON.stringify(idB)})&&[...document.querySelectorAll('#gvWho .btn')].every(b=>b.getBoundingClientRect().height>=48);})()`));
  await ev(`document.querySelector('[data-to="${idB}"]').click()`); await sleep(100);
  check('then ✔ / ✖ to be sure (nothing sent yet)', await ev(`document.querySelector('#modalTitle').textContent.includes('Give')&&P().coins===30&&DB.profiles[1].gifts.length===0`));
  await ev(`[...document.querySelectorAll('#modalBtns .btn')].pop().click()`); await sleep(100);
  check('✔ sends 10 coins: they leave this room and wait in the other room\'s inbox', await ev(`(()=>{const B=DB.profiles[1],g=B.gifts[0];return P().coins===20&&B.gifts.length===1&&g.kind==='coins'&&g.n===10&&g.from===${JSON.stringify(nmA)}&&B.coins===${coinsB};})()`));
  check('Kind Heart is earned', await ev(`P().stats.gifts===1&&stkDone(P(),STICKERS.find(s=>s.id==='gift1'))`));
  await ev(`P().coins=3;giveModal();document.querySelector('[data-gk="coins:5"]').click()`); await sleep(100);
  check('coins she does not have can not be given', await ev(`!document.querySelector('#gvWho')&&P().coins===3`));
  await ev(`closeModal();P().coins=20;P().room.items.push({uid:'gvT',type:'plant',placed:false});enterDecorate();decoTab='mine';renderDecoGrid()`);
  check('My Stuff starts with a 🎁 Give a gift tile', await ev(`document.querySelector('#decoGrid .tile').dataset.give==='1'`));
  await ev(`document.querySelector('#decoGrid [data-give]').click()`); await sleep(100);
  await ev(`document.querySelector('[data-gk="decor:gvT"]').click()`); await sleep(50); await ev(`document.querySelector('[data-to="${idB}"]').click()`); await sleep(50);
  await ev(`[...document.querySelectorAll('#modalBtns .btn')].pop().click()`); await sleep(100);
  check('a decoration from My Stuff is given: it leaves her stuff', await ev(`!allItems(P()).some(i=>i.uid==='gvT')&&DB.profiles[1].gifts[1].kind==='decor'&&DB.profiles[1].gifts[1].type==='plant'`));
  await ev(`exitDecorate();DB.activeId=${JSON.stringify(idB)};roomNo=1;show('room')`); await sleep(200); await shot('GF02-gift-waiting');
  check('the other room shows a wrapped gift pile with a 2 on it', await ev(`(()=>{const g=document.querySelector('#roomSvg [data-hot=gift]');return !!g&&g.textContent.trim()==='2';})()`));
  await ev(`document.querySelector('#roomSvg [data-hot=gift] rect').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(150); await shot('GF03-gift-open');
  check('tapping it opens the first gift: from who, with confetti, coins added', await ev(`document.querySelector('#modalTitle').textContent.includes(${JSON.stringify(nmA)})&&!!document.querySelector('.confetti')&&P().coins===${coinsB}+10&&P().gifts.length===1`));
  await ev(`closeModal();giftOpen()`); await sleep(100);
  check('the decoration gift goes into the room; no gifts left', await ev(`P().gifts.length===0&&P().room.items.some(i=>i.type==='plant'&&i.placed)&&!document.querySelector('#roomSvg [data-hot=gift]')`));
  await ev(`closeModal();P().gifts=[{id:'zz',kind:'decor',type:'fromTheFuture',from:'Z',badge:'⭐'}];renderRoom()`);
  check('a gift from a newer app waits, unopened and not shown', await ev(`!document.querySelector('#roomSvg [data-hot=gift]')&&P().gifts.length===1`));
  // layouts
  await ev(`{const p=P();p.gifts=[];p.room.items=p.room.items.filter(i=>i.placed);p.room.items.push({uid:'lyA',type:'lava',x:700,y:560,placed:true},{uid:'lyB',type:'beanbag',x:300,y:600,placed:true});p.room.wall='lavender';}enterDecorate();decoTab='layouts';renderDecoGrid()`); await sleep(100);
  check('Decorate has a 🏠 Layouts tab with 3 empty slots', await ev(`!!document.querySelector('#decoTabs [data-dt=layouts]')&&document.querySelectorAll('#decoGrid [data-lay-save]').length===3&&!document.querySelector('#decoGrid [data-lay-load]')`));
  const placedN=await ev(`P().room.items.filter(i=>i.placed).length`);
  await ev(`document.querySelector('#decoGrid [data-lay-save="0"]').click()`); await sleep(100); await shot('GF04-layouts');
  check('saving keeps the wall, floor and every placed thing with its spot', await ev(`(()=>{const L=P().presets[1][0];return !!L&&L.wall==='lavender'&&L.items.length===${placedN}&&L.items.some(i=>i.uid==='lyA'&&i.x===700&&i.y===560);})()`));
  check('the slot now has a picture and 📂 Load', await ev(`!!document.querySelector('#decoGrid [data-lay-load="0"]')&&!!document.querySelector('#decoGrid .tile.lay svg')`));
  check('Interior Designer is earned', await ev(`stkDone(P(),STICKERS.find(s=>s.id==='layout1'))`));
  await ev(`{const p=P(),a=p.room.items.find(i=>i.uid==='lyA');a.x=200;a.y=650;const b=p.room.items.find(i=>i.uid==='lyB');p.room.items=p.room.items.filter(i=>i!==b);p.room2.items.push(b);if(!p.owned.includes('wall:midnight'))p.owned.push('wall:midnight');p.room.wall='midnight';p.room.items.push({uid:'lyC',type:'plant',x:500,y:650,placed:true});}renderRoom();renderDecoGrid()`);
  await ev(`document.querySelector('#decoGrid [data-lay-load="0"]').click()`); await sleep(50);
  check('loading asks first', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&P().room.wall==='midnight'`));
  await ev(`[...document.querySelectorAll('#modalBtns .btn')].pop().click()`); await sleep(100);
  check('✔ puts the room back: spots, the wall, and a thing moved to the Loft comes back', await ev(`(()=>{const p=P(),a=p.room.items.find(i=>i.uid==='lyA'),b=p.room.items.find(i=>i.uid==='lyB');return a.x===700&&a.y===560&&a.placed&&!!b&&b.placed&&!p.room2.items.some(i=>i.uid==='lyB')&&p.room.wall==='lavender';})()`));
  check('things added since go to My Stuff', await ev(`P().room.items.find(i=>i.uid==='lyC').placed===false`));
  await ev(`{const p=P();p.room.items=p.room.items.filter(i=>i.uid!=='lyA');}layoutLoad(P(),0)`); await sleep(100);
  check('a thing given away since is skipped (and she is told)', await ev(`P().room.items.some(i=>i.uid==='lyB'&&i.placed)&&document.querySelector('#toast').textContent.includes('not here')`));
  await ev(`document.querySelector('#decoGrid [data-lay-save="0"]').click()`); await sleep(50);
  check('saving over a layout asks first', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&document.querySelector('#modalTitle').textContent.includes('Save over')`));
  await ev(`closeModal();goRoom(2)`); await sleep(100);
  check('each room has its own layouts', await ev(`document.querySelectorAll('#decoGrid [data-lay-save]').length===3&&!document.querySelector('#decoGrid [data-lay-load]')`));
  await ev(`exitDecorate();goRoom(1)`);
  check('the Kind Heart and Interior Designer stickers come after the looks ones, on the Room & Style page', await ev(`STICKERS.slice(STICKERS.findIndex(s=>s.id==='gift1'),STICKERS.findIndex(s=>s.id==='gift1')+2).map(s=>s.id+':'+s.page).join()==='gift1:room,layout1:room'`));
  // save data
  await ev(`DB.profiles[1].gifts=[{id:'g1',kind:'coins',n:5,from:'Test',badge:'⭐',at:1}]`);
  const gv27=await ev(`JSON.stringify(Object.assign({},DB,{version:17,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.gifts;delete q.presets;return q;})}))`);
  const gv28=await ev(`JSON.stringify(DB)`);
  await ev(`doRestore(${JSON.stringify(gv27)})`); await sleep(300);
  check('a v1.27 backup restores with no gifts and empty layouts (save version 18 or later)', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.gifts.length===0&&[1,2,3].every(k=>p.presets[k].every(l=>l===null)))`));
  await ev(`closeModal();doRestore(${JSON.stringify(gv28)})`); await sleep(300);
  check('a v1.28 backup keeps waiting gifts and layouts', await ev(`DB.profiles[1].gifts.length===1&&DB.profiles[1].presets[1][0]!==null`));
  await ev(`closeModal();{const p=DB.profiles[0];p.gifts=[{id:'a',kind:'coins',n:'7',from:5},{kind:'coins',n:5},{id:'b',kind:'decor'},{id:'c',kind:'coins',n:-3},'x',{id:'d',kind:'coins',n:500}];p.presets={1:'no',2:[{wall:'x',floor:'y',items:[{uid:'u',type:'plant',x:'9'},null]},7],9:[]};normalize(p);}`);
  check('odd gift and layout data is made safe', await ev(`(()=>{const p=DB.profiles[0];return p.gifts.map(g=>g.id+g.n).join()==='a7,d100'&&p.gifts[0].from==='5'&&p.presets[1].every(l=>l===null)&&p.presets[2][0].items.length===1&&p.presets[2][0].items[0].x===9&&p.presets[2][1]===null&&!('9' in p.presets);})()`));
  await ev(`DB.activeId=DB.profiles[0].id;roomNo=1;show('room')`);
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await sleep(300);
  await ev(`giveModal()`); await sleep(150); await shot('GF05-phone-give');
  check('phone: the gift box fits the screen', await ev(`(()=>{const r=document.querySelector('#gvGrid').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})()`));
  await ev(`closeModal();enterDecorate();decoTab='layouts';renderDecoGrid();document.querySelector('#decoTabs [data-dt=layouts]').scrollIntoView()`); await sleep(150); await shot('GF06-phone-layouts');
  check('phone: the 🏠 Layouts tab can be reached and the slots fit', await ev(`(()=>{const t=document.querySelector('#decoTabs [data-dt=layouts]').getBoundingClientRect();return t.right<=innerWidth&&t.width>=44&&[...document.querySelectorAll('#decoGrid .tile.lay')].every(x=>x.getBoundingClientRect().right<=innerWidth);})()`));
  await ev(`exitDecorate()`);
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`show('room')`);

  console.log('Shop filters & big dreams (v1.29)');
  await ev(`closeModal();DB.activeId=DB.profiles[0].id;{const p=P();p.easy=false;p.dream='';}roomNo=1;closetCat='top';themePick.closet='all';themePick.shop='all';show('closet')`); await sleep(200);
  check('save version 19: every room has a dream goal (none yet)', await ev(`DB_VERSION>=19&&DB.version===DB_VERSION&&DB.profiles.every(p=>typeof p.dream==='string')`));
  check('every theme in the list names a real item', await ev(`Object.keys(THEME_OF).every(k=>{const [c,id]=k.split(':');return c==='decor'?!!DECOR[id]:!!(CLOSET[c]&&CLOSET[c].items.some(i=>i.id===id));})`));
  check('Closet tops show theme chips (All first, Emo and Dino among them, no Dreams), all big enough', await ev(`(()=>{const c=[...document.querySelectorAll('#closetGrid [data-theme]')].map(b=>b.dataset.theme);return c[0]==='all'&&c.includes('emo')&&c.includes('dino')&&!c.includes('dream')&&document.querySelector('#closetGrid [data-theme=all]').classList.contains('on')&&[...document.querySelectorAll('#closetGrid .chip')].every(b=>b.getBoundingClientRect().height>=48);})()`));
  const allTops=await ev(`document.querySelectorAll('#closetGrid .tile').length`);
  await ev(`document.querySelector('#closetGrid [data-theme=emo]').click()`); await sleep(100); await shot('H01-closet-emo');
  check('🦇 Emo shows only the emo tops', await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id).sort().join()==='batSweater,tee,zip'&&document.querySelector('#closetGrid [data-theme=emo]').classList.contains('on')`), await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id).join()`));
  await ev(`document.querySelector('#closetGrid [data-theme=dino]').click()`); await sleep(50);
  check('🦕 Dino shows the dino hoodie (Pack 2) and the Dino Nugget Tee (Pack 4)', await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id).sort().join()==='dinoHoodie,nuggetTee'`));
  await ev(`[...document.querySelectorAll('#closetTabs [data-cat]')].find(b=>b.dataset.cat==='arms').click()`); await sleep(50);
  check('a tab with nothing of that theme goes back to All', await ev(`themePick.closet==='all'&&document.querySelectorAll('#closetGrid .tile').length===CLOSET.arms.items.length`));
  await ev(`closetCat='top';themePick.closet='all';renderCloset()`);
  check('✨ All shows every top again', await ev(`document.querySelectorAll('#closetGrid .tile').length===${allTops}&&${allTops}===CLOSET.top.items.length`));
  await ev(`show('room');enterDecorate();decoTab='shop';renderDecoGrid()`); await sleep(100);
  check('the Shop has chips too, with ⭐ Dreams and 🌳 Outdoor', await ev(`(()=>{const c=[...document.querySelectorAll('#decoGrid [data-theme]')].map(b=>b.dataset.theme);return c[0]==='all'&&c.includes('dream')&&c.includes('yard')&&c.includes('stage');})()`));
  await ev(`document.querySelector('#decoGrid [data-theme=dream]').click()`); await sleep(100); await shot('H02-shop-dreams');
  check('⭐ Dreams shows the 5 big dreams, 60–100 coins, with a star', await ev(`(()=>{const t=[...document.querySelectorAll('#decoGrid [data-buy]')];return t.map(x=>x.dataset.buy).join()==='canopyBed,arcade,castleBunk,rocketHouse,aquarium'&&t.every(x=>x.classList.contains('dream'))&&t.every(x=>{const d=DECOR[x.dataset.buy];return d.price>=60&&d.price<=100;});})()`));
  check('only big dreams cost more than 40', await ev(`Object.values(DECOR).filter(d=>d.price>40).every(d=>d.dream)&&Object.values(DECOR).filter(d=>d.dream).length===5`));
  check('every big dream draws (no broken numbers)', await ev(`['canopyBed','arcade','castleBunk','rocketHouse','aquarium'].every(k=>{const s=DECOR[k].d();return s.length>200&&!/NaN|undefined/.test(s);})`));
  check('the arcade and the aquarium glow at night', await ev(`!!NIGHT_GLOW.arcade&&!!NIGHT_GLOW.aquarium`));
  await ev(`P().coins=10;document.querySelector('#decoGrid [data-buy=canopyBed]').click()`); await sleep(100);
  check('tapping a dream she can not afford offers ⭐ Save up', await ev(`document.querySelector('#modalTitle').textContent.includes('Save up for Canopy Bed')&&P().coins===10`));
  await ev(`[...document.querySelectorAll('#modalBtns .btn')].pop().click()`); await sleep(100); await shot('H03-saving-for');
  check('the chips are not squashed under the bar', await ev(`[...document.querySelectorAll('#decoGrid .chip')].every(c=>{const r=c.getBoundingClientRect(),g=document.querySelector('#decoGrid .chips').getBoundingClientRect();return r.height>=48&&g.height>=r.height;})`));
  check('⭐ Save up! sets the goal; the Shop shows a Saving for bar (10 / 100)', await ev(`P().dream==='canopyBed'&&(()=>{const b=document.querySelector('#decoGrid .dream-bar');return !!b&&b.textContent.includes('Canopy Bed')&&b.textContent.includes('10 / 100')&&b.textContent.includes('90 more');})()`));
  await ev(`document.querySelector('#decoGrid [data-buy=canopyBed]').click()`); await sleep(100);
  check('tapping the same dream again just says how many more', await ev(`document.querySelector('#modal').classList.contains('hidden')&&document.querySelector('#toast').textContent.includes('90')`));
  await ev(`document.querySelector('#decoGrid [data-dream-stop]').click()`); await sleep(50);
  check('✖ stops saving for it', await ev(`P().dream===''&&!document.querySelector('#decoGrid .dream-bar')`));
  await ev(`P().dream='arcade';P().coins=200;renderDecoGrid()`);
  check('with enough coins the bar says she can get it now', await ev(`document.querySelector('#decoGrid .dream-bar').textContent.includes('get it now')`));
  await ev(`document.querySelector('#decoGrid [data-buy=arcade]').click()`); await sleep(100);
  check('then tapping it is a normal buy', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&document.querySelector('#modalTitle').textContent.includes('Arcade')`));
  await ev(`[...document.querySelectorAll('#modalBtns .btn')].pop().click()`); await sleep(150);
  check('buying it puts it in the room, costs 80 and clears the goal', await ev(`P().coins===120&&curRoom(P()).items.some(i=>i.type==='arcade'&&i.placed)&&P().dream===''`));
  check('Dream Come True is earned (Room & Style page)', await ev(`stkDone(P(),STICKERS.find(s=>s.id==='dream1'))&&STICKERS.find(s=>s.id==='dream1').page==='room'`));
  await ev(`exitDecorate()`); await sleep(100); await shot('H04-arcade-room');
  await ev(`P().easy=true;applyEasy();enterDecorate();decoTab='shop';renderDecoGrid()`); await sleep(100);
  check('Easy mode: chips are icons only, 56 px', await ev(`(()=>{const c=document.querySelector('#decoGrid .chip');return getComputedStyle(c.querySelector('span')).display==='none'&&c.getBoundingClientRect().height>=56;})()`));
  await ev(`exitDecorate();P().easy=false;applyEasy()`);
  const hv28=await ev(`JSON.stringify(Object.assign({},DB,{version:18,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.dream;return q;})}))`);
  await ev(`doRestore(${JSON.stringify(hv28)})`); await sleep(300);
  check('a v1.28 backup restores with no dream goal (save version 19 or later)', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.dream==='')`));
  await ev(`closeModal();{const p=DB.profiles[0];p.dream=5;normalize(p);window._d1=p.dream;p.dream='noSuchThing';}`);
  check('odd dream data is made safe', await ev(`window._d1===''&&dreamOf(DB.profiles[0])===''`));
  await ev(`DB.profiles[0].dream='aquarium';DB.activeId=DB.profiles[0].id;show('room');enterDecorate();decoTab='shop';renderDecoGrid()`);
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await sleep(300); await shot('H05-phone-shop');
  check('phone: the chips and the Saving for bar fit the width', await ev(`(()=>{const c=document.querySelector('#decoGrid .chips').getBoundingClientRect(),b=document.querySelector('#decoGrid .dream-bar').getBoundingClientRect();return c.right<=innerWidth&&b.right<=innerWidth&&b.left>=0;})()`));
  await ev(`exitDecorate();DB.profiles[0].dream=''`);
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`show('room')`);

  console.log('Grown-up helpers (v1.30)');
  await ev(`closeModal();delete window.AndroidBridge;DB.activeId=DB.profiles[0].id;{const p=P();p.easy=false;p.speak=null;p.stats.snaps=0;}DB.settings.lastBackup=0;save();roomNo=1;show('room')`); await sleep(200);
  check('save version 20 or newer: Read to me follows Easy mode everywhere; the device has a last-backup time', await ev(`DB_VERSION>=20&&DB.version===DB_VERSION&&DB.profiles.every(p=>p.speak===null||typeof p.speak==='boolean')&&typeof DB.settings.lastBackup==='number'`));
  await ev(`settingsModal()`);
  check('Settings shows "Last backup: never" for the grown-up', await ev(`document.querySelector('#bkLast').textContent==='💾 Last backup: never'`));
  check('in the browser there is no Read to me switch (it cannot speak)', await ev(`!document.querySelector('#sSpeak')`));
  await ev(`closeModal();downloadFile('{}')`); await sleep(200);
  check('saving a backup file notes the time', await ev(`Date.now()-DB.settings.lastBackup<5000`));
  await ev(`settingsModal()`);
  check('…and Settings says today', await ev(`document.querySelector('#bkLast').textContent==='💾 Last backup: today'`));
  await ev(`closeModal();DB.settings.lastBackup=Date.now()-12*86400000-1000;settingsModal()`);
  check('12 days later it says 12 days ago', await ev(`document.querySelector('#bkLast').textContent==='💾 Last backup: 12 days ago'`));
  await ev(`closeModal();DB.settings.lastBackup=Date.now()-86400000-1000;settingsModal()`);
  check('one day later it says yesterday', await ev(`document.querySelector('#bkLast').textContent.endsWith('yesterday')`));
  const lb=await ev(`DB.settings.lastBackup`);
  await ev(`closeModal();(()=>{const b=JSON.parse(JSON.stringify(DB));b.settings.lastBackup=5;doRestore(JSON.stringify(b));})()`); await sleep(300);
  check('restoring a backup keeps the last-backup time of this device', await ev(`DB.settings.lastBackup===${lb}`));
  // a pretend Android wrapper
  await ev(`closeModal();window._said=[];window._img=null;window._bk=null;window.AndroidBridge={speak(t){window._said.push(t);},saveImage(b,n){window._img={b,n};},saveBackup(t,n){window._bk=n;}};DB.settings.lastBackup=0;DB.activeId=DB.profiles[0].id;show('room')`); await sleep(150);
  await ev(`downloadFile('{}')`);
  check('on Android, the backup time waits until the file is really saved', await ev(`window._bk&&DB.settings.lastBackup===0`));
  await ev(`backupSaved()`);
  check('…and is noted when the wrapper says it was saved', await ev(`DB.settings.lastBackup>0`));
  await ev(`settingsModal()`);
  check('on Android, Settings has 🔊 Read to me; off when Easy mode is off', await ev(`document.querySelector('#sSpeak').textContent.includes('OFF')`));
  await ev(`closeModal();P().easy=true;applyEasy();settingsModal()`);
  check('Read to me is on by default in Easy mode', await ev(`document.querySelector('#sSpeak').textContent.includes('ON')&&readOn(P())`));
  await ev(`window._said=[];document.querySelector('#sSpeak').click()`); await sleep(50);
  check('the switch turns it off (and stays off in Easy mode)', await ev(`P().speak===false&&!readOn(P())&&document.querySelector('#sSpeak').textContent.includes('OFF')`));
  await ev(`document.querySelector('#sSpeak').click()`); await sleep(50);
  check('…and on again', await ev(`P().speak===true&&readOn(P())`));
  await ev(`closeModal();P().easy=false;applyEasy();window._said=[];document.querySelector('#decoBtn').click()`); await sleep(50);
  check('with it on, tapping 🛋️ Decorate says "Decorate" (no emoji)', await ev(`window._said[window._said.length-1]==='Decorate'`), await ev(`JSON.stringify(window._said)`));
  await ev(`decoTab='shop';themePick.shop='all';renderDecoGrid();document.querySelector('#decoGrid [data-buy=plant]').click()`); await sleep(50);
  check('a Shop tile says its name', await ev(`window._said.includes('Happy Plant')`));
  await ev(`closeModal();exitDecorate();window._said=[];document.querySelector('#roomSvg [data-hot=closet]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(100);
  check('a room hotspot says what it is', await ev(`window._said[0]==='Closet'`));
  await ev(`show('room');document.body.insertAdjacentHTML('beforeend','<button id="tSpk">✨ Hello</button>');window._said=[];const s=STG.state;cur='stage';STG.state='play';document.querySelector('#tSpk').click();STG.state=s;cur='room'`);
  check('it never talks during a song', await ev(`window._said.length===0`));
  await ev(`document.querySelector('#tSpk').click();document.querySelector('#tSpk').click()`);
  check('a double tap says it once', await ev(`window._said.join()==='Hello'`));
  await ev(`P().speak=false;window._said=[];document.querySelector('#tSpk').click();document.querySelector('#tSpk').remove()`);
  check('with it off, nothing is said', await ev(`window._said.length===0`));
  // snapshots
  check('the 📷 button sits under 🌙, big enough', await ev(`(()=>{const a=document.querySelector('#nightBtn').getBoundingClientRect(),b=document.querySelector('#roomSnapBtn').getBoundingClientRect();return b.top>=a.bottom&&b.width>=48&&b.height>=48&&!document.querySelector('#roomSnapBtn').classList.contains('hidden');})()`));
  await ev(`enterDecorate()`);
  check('decorating hides 📷', await ev(`document.querySelector('#roomSnapBtn').classList.contains('hidden')`));
  await ev(`exitDecorate();mascotTap()`);
  await ev(`document.querySelector('#roomSnapBtn').click()`); for(let i=0;i<40&&!(await ev(`!!window._img`));i++) await sleep(100);
  const img=await ev(`window._img&&{n:window._img.n,len:window._img.b.length,head:window._img.b.slice(0,8)}`);
  check('📷 saves the room as a PNG picture through the wrapper', !!img&&img.head==='iVBORw0K'&&img.len>20000&&/^hangout-.+-room-\d{4}-\d\d-\d\d\.png$/.test(img.n), img&&[img.n,img.len,img.head]);
  check('the picture really shows the room (not blank), 1500 × 1050', await ev(`new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);const d=g.getImageData(750,200,1,1).data,w=g.getImageData(30,30,1,1).data;r(i.width===1500&&i.height===1050&&!(d[0]===35&&d[1]===27&&d[2]===46)&&!(w[0]===35&&w[1]===27&&w[2]===46));};i.onerror=()=>r(false);i.src='data:image/png;base64,'+window._img.b;})`));
  fs.writeFileSync(OUT+'/I02-room-snapshot.png',Buffer.from(await ev(`window._img.b`),'base64')); // the saved picture itself
  check('Say Cheese! is earned', await ev(`P().stats.snaps===1&&stkDone(P(),STICKERS.find(s=>s.id==='snap1'))&&STICKERS[71].id==='snap1'&&STICKERS[71].page==='art'`));
  await ev(`window._img=null;{const p=P();if(!p.cards.length){p.cards.push({id:'tc1',no:1,at:Date.now(),look:Object.assign({},p.look),stage:'spot',frame:'sparkle',title:'',name:'Fuzzy'});}cardModal(p.cards[0]);}`); await sleep(100);
  check('a photocard has 📷 Save picture', await ev(`[...document.querySelectorAll('#modalBtns .btn')].some(b=>b.textContent.includes('Save picture'))`));
  await ev(`[...document.querySelectorAll('#modalBtns .btn')].find(b=>b.textContent.includes('Save picture')).click()`); for(let i=0;i<40&&!(await ev(`!!window._img`));i++) await sleep(100);
  check('…which saves the card as a PNG, and the card stays open', await ev(`!!window._img&&window._img.b.startsWith('iVBORw0K')&&/^hangout-card-\\d{3}-/.test(window._img.n)&&!document.querySelector('#modal').classList.contains('hidden')`), await ev(`window._img&&window._img.n`));
  await ev(`closeModal();delete window.AndroidBridge`);
  // save data
  const hv29=await ev(`JSON.stringify(Object.assign({},DB,{version:19,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.speak;return q;})}))`);
  await ev(`doRestore(${JSON.stringify(hv29)})`); await sleep(300);
  check('a v1.29 backup restores with Read to me following Easy mode (save version 20 or newer)', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.speak===null)`));
  await ev(`closeModal();{const p=DB.profiles[0];p.speak='yes';normalize(p);}`);
  check('odd Read to me data is made safe', await ev(`DB.profiles[0].speak===null`));
  await ev(`DB.activeId=DB.profiles[0].id;show('room')`);
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await sleep(300);
  await ev(`settingsModal()`); await sleep(100); await shot('I01-phone-settings');
  check('phone: the 📷 button and the last-backup line fit', await ev(`(()=>{const b=document.querySelector('#roomSnapBtn').getBoundingClientRect(),t=document.querySelector('#bkLast').getBoundingClientRect();return b.right<=innerWidth&&b.bottom<=innerHeight&&t.right<=innerWidth;})()`));
  await ev(`closeModal()`);
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`show('room')`);

  console.log('Room tweaks (v1.31)');
  // two standing things and two wall things, overlapping; the one touched last must come to the front
  await ev(`(()=>{const p=P(),R=p.room;p.coins=500;goRoom(1);R.items.push({uid:'tfA',type:'plant',x:300,y:600,placed:true},{uid:'tfB',type:'lava',x:310,y:600,placed:true},
    {uid:'tfC',type:'lights',x:300,y:200,placed:true},{uid:'tfD',type:'lights',x:310,y:205,placed:true});enterDecorate();})()`); await sleep(150);
  const decoOrder=()=>ev(`[...roomSvg.querySelectorAll('.deco')].map(g=>g.dataset.uid).filter(u=>/^tf/.test(u)).join()`);
  check('things start in list order', (await decoOrder())==='tfC,tfD,tfA,tfB', await decoOrder());
  await ev(`dragDeco('tfA',300,600)`); await sleep(100);
  check('touching the back thing brings it to the front (drawn last, saved last)', (await decoOrder())==='tfC,tfD,tfB,tfA'&&await ev(`P().room.items[P().room.items.length-1].uid==='tfA'&&JSON.parse(localStorage.getItem('hangoutRoom.v1')).profiles.find(q=>q.id===DB.activeId).room.items.pop().uid==='tfA'`), await decoOrder());
  await ev(`dragDeco('tfC',300,200)`); await sleep(100);
  check('…and a wall thing too (still behind the standing things)', (await decoOrder())==='tfD,tfC,tfB,tfA', await decoOrder());
  check('the buddy is drawn in front of decorations standing behind it', await ev(`(()=>{const k=[...roomSvg.children];return k.indexOf(document.querySelector('#mascotG').closest('.fixed'))>k.indexOf(roomSvg.querySelector('.deco[data-uid="tfA"]'));})()`));
  // put tfB away and move it to the start of the list, so My Stuff's lava tile finds it first
  await ev(`(()=>{const R=P().room,it=R.items.find(i=>i.uid==='tfB');it.placed=false;R.items.splice(R.items.indexOf(it),1);R.items.unshift(it);renderRoom();document.querySelector('[data-dt=mine]').click();})()`); await sleep(100);
  await ev(`document.querySelector('#decoGrid [data-place="lava"]').click()`); await sleep(100);
  check('placing from My Stuff puts it last in the list, and it is drawn by where it stands (v1.39)', await ev(`(()=>{const R=P().room,b=R.items.find(i=>i.uid==='tfB');return R.items[R.items.length-1]===b;})()`)&&(await decoOrder())===(await ev(`P().room.items.find(i=>i.uid==='tfB').y>=600`)?'tfD,tfC,tfA,tfB':'tfD,tfC,tfB,tfA'), await decoOrder());
  await ev(`exitDecorate();P().room.items=P().room.items.filter(i=>!/^tf/.test(i.uid));save();renderRoom()`);
  for(const [w,h,easy] of [[360,740,false],[360,740,true],[412,860,false]]){
    await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true});
    await ev(`P().easy=${easy};P().name='Testy';goRoom(2);applyEasy()`); await sleep(300);
    const bar=await ev(`(()=>{const t=document.querySelector('#roomTitle'),bs=[...document.querySelectorAll('#scr-room .topbar .btn')].map(b=>b.getBoundingClientRect());return {tw:Math.round(t.getBoundingClientRect().width),full:t.scrollWidth<=t.clientWidth,minB:Math.round(Math.min(...bs.map(b=>b.width))),fit:bs.every(b=>b.right<=innerWidth)};})()`);
    check(`phone ${w}px${easy?' (Easy)':''}: the room name shows in full and the buttons are 48 px+`, bar.full&&bar.tw>=150&&bar.minB>=48&&bar.fit, bar);
    if(w===360&&!easy) await shot('J01-phone-room-bar');
  }
  await ev(`P().easy=false;goRoom(1);applyEasy()`);
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  check('tablet: the room bar is still one row', await ev(`(()=>{const t=document.querySelector('#roomTitle').getBoundingClientRect(),b=document.querySelector('#setBtn').getBoundingClientRect();return Math.abs(t.top+t.height/2-(b.top+b.height/2))<8;})()`));

  console.log('Speed check (v1.32)');
  // A busy test room: 30 things in each room, with every moving decoration, so the numbers are a worst case.
  await ev(`(()=>{const p=P();p.easy=false;p.night={};const keys=Object.keys(DECOR).filter(k=>!DECOR[k].art&&!DECOR[k].award);
    rooms(p).forEach((R,ri)=>{for(let i=0;i<30;i++){const k=i<4?['lava','lights','lightstick','speaker'][i]:keys[(i*7+ri*11)%keys.length];
      R.items.push({uid:'sp'+ri+'_'+i,type:k,x:100+(i*29)%800,y:DECOR[k].wall?200:560,placed:true});}});save();show('room');goRoom(1);})()`); await sleep(300);
  check('no decoration or room uses SVG <animate> (it redraws the whole room every frame)',
    await ev(`Object.keys(DECOR).every(k=>!/<animate/.test(DECOR[k].d({})))&&!/<animate/.test(furniture()+loftFurniture()+yardFurniture())&&!roomSvg.querySelector('animate,animateTransform,animateMotion')`));
  const idleAnims=`document.getAnimations().filter(a=>a.effect&&a.effect.getComputedTiming().iterations===Infinity&&a.effect.target&&roomSvg.contains(a.effect.target))`;
  // (the separate rotate/scale/translate properties make Chrome redraw every frame even when stepped: use transform)
  check('every endless animation in the room moves in steps (only a few redraws a second), with transform or opacity',
    await ev(`(()=>{const A=${idleAnims};return A.length>=6&&A.every(a=>/^steps\\(/.test(getComputedStyle(a.effect.target).animationTimingFunction)
      &&a.effect.getKeyframes().every(k=>!('rotate' in k||'scale' in k||'translate' in k)));})()`),
    await ev(`${idleAnims}.map(a=>a.animationName+':'+getComputedStyle(a.effect.target).animationTimingFunction)`));
  const blob=()=>ev(`getComputedStyle(roomSvg.querySelector('.an-lava1')).transform`);
  const lava1=await blob(); await sleep(1000);
  check('…and the lava lamp still bubbles', lava1!==await blob(), lava1);
  check('Shop tiles stay still (no moving pictures in the grid)', await ev(`(enterDecorate(),decoTab='shop',renderDecoGrid(),!document.getAnimations().some(a=>document.querySelector('#decoGrid').contains(a.effect&&a.effect.target)))`));
  await ev(`$('#decoGrid').firstElementChild.dataset.mark='1'`);
  await ev(`dragDeco('sp0_5',420,520)`); await sleep(100);
  check('moving a thing while the Shop is open does not rebuild the Shop', await ev(`$('#decoGrid').firstElementChild.dataset.mark==='1'&&Math.round(P().room.items.find(i=>i.uid==='sp0_5').x)===420`));
  await ev(`exitDecorate()`); await sleep(100);
  check('the main loop rests on the room screen', await ev(`loopOn===false`));
  await ev(`show('soccer')`); await sleep(150);
  check('…and runs again on a game screen', await ev(`loopOn===true`));
  await ev(`show('room')`); await sleep(150);
  check('…and rests again after it', await ev(`loopOn===false`));
  await ev(`closetCat='top';show('closet')`); await sleep(150);
  const wearId=await ev(`(()=>{const p=P();const it=CLOSET.top.items.find(i=>isOwned(p,'top',i)&&i.id!==p.look.top);return it&&it.id;})()`);
  await ev(`$('#closetGrid').querySelector('.tile').dataset.mark='1';$('#closetGrid').querySelector('[data-id="${wearId}"]').click()`); await sleep(100);
  check('wearing something you own only redraws the buddy (not every tile)', await ev(`P().look.top==='${wearId}'&&$('#closetGrid').querySelector('.tile').dataset.mark==='1'&&$('#closetGrid').querySelector('.tile.on').dataset.id==='${wearId}'&&$('#closetMascot').innerHTML===Object.assign(document.createElement('div'),{innerHTML:mascotSVG(P().look)}).innerHTML`));
  await ev(`show('room')`);
  // Timings with the CPU slowed 6× (about a modest tablet). Each is the middle of 5 tries, from the call to the next
  // drawn frame. The limits are loose on purpose: they catch a big slowdown, not small changes between runs.
  await send('Performance.enable'); await send('Emulation.setCPUThrottlingRate',{rate:6});
  await ev(`window.__t=async f=>{const t=performance.now();f();await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));return performance.now()-t;}`);
  const timed=[['Room',`goRoom(1)`,`goRoom(2)`],['Loft',`goRoom(2)`,`goRoom(1)`],['Backyard',`goRoom(3)`,`goRoom(1)`],
    ['Closet (open)',`show('closet')`,`show('room')`],['Closet (change tab)',`closetCat=closetCat==='top'?'legs':'top';renderCloset()`,`show('closet')`],
    ['Closet (wear an item)',`$('#closetGrid').querySelector('.tile:not(.on):not(.locked)').click()`,`show('closet')`],
    ['Shop (open Decorate)',`decoTab='shop';enterDecorate()`,`show('room');exitDecorate()`],['Shop (change tab)',`decoTab=decoTab==='shop'?'mine':'shop';renderDecoGrid()`,`show('room');if(!decorating)enterDecorate()`],
    ['Sticker Book',`show('stickers')`,`exitDecorate();show('room')`]];
  const speed=[];
  for(const [name,run,setup] of timed){const ts=[];for(let i=0;i<5;i++){await ev(setup);await sleep(80);ts.push(await ev(`__t(()=>{${run}})`));}
    ts.sort((a,b)=>a-b);speed.push([name,Math.round(ts[2])]);}
  const busy=async setup=>{await ev(setup);await sleep(700);const m=async()=>(await send('Performance.getMetrics')).metrics.find(x=>x.name==='TaskDuration').value;
    const a=await m();await sleep(2500);return Math.round((await m()-a)*1000/2.5);};
  const idleRoom=await busy(`show('room');goRoom(1)`);
  // what keeps the page busy, shown if the check below fails
  const idleWhy=await ev(`({music:!!DB.settings.music,loop:loopOn,anims:document.getAnimations().filter(a=>a.playState==='running').map(a=>(a.animationName||a.constructor.name)+'@'+(a.effect&&a.effect.target?(a.effect.target.id||a.effect.target.getAttribute('class')||a.effect.target.tagName):'?'))})`);
  const idleCloset=await busy(`show('closet')`);
  await send('Emulation.setCPUThrottlingRate',{rate:1}); await ev(`show('room')`);
  console.log('     CPU slowed 6×:'); speed.forEach(([n,t])=>console.log(`       ${n.padEnd(24)} ${t} ms`));
  console.log(`       Room, doing nothing      ${idleRoom} ms of work per second`); console.log(`       Closet, doing nothing    ${idleCloset} ms of work per second`);
  check('every screen above opens in under 1.5 s with the CPU slowed 6×', speed.every(([n,t])=>t<1500), speed);
  check('a room doing nothing keeps the CPU mostly free (under 500 ms of work per second, slowed 6×)', idleRoom<500&&idleCloset<500, {idleRoom,idleCloset,idleWhy});
  await ev(`(()=>{const p=P();rooms(p).forEach(R=>{R.items=R.items.filter(i=>!/^sp\\d_/.test(i.uid));});save();goRoom(1);})()`);

  console.log('Pattern Train + Word Builder (v1.33)');
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`P().easy=false;applyEasy();show('brain')`); await sleep(200);
  check('Pattern Train: every wagon is a known color / shape / number, one ❓ per train, the answer is a choice, choices are different',
    await ev(`BRAIN_LVLS.every(l=>TR_PUZ[l].every(z=>{const q=trList(z.s),o=trList(z.o);const ok=t=>l==='easy'?!!TR_COLORS[t]:l==='medium'?t.length===2&&!!TR_SHAPES[t[0]]&&!!TR_COLORS[t[1]]:/^\\d+$/.test(t);
      return q.filter(t=>t==='?').length===1&&q.every(t=>t==='?'||ok(t))&&o.every(ok)&&o.includes(z.a)&&new Set(o).size===o.length&&o.length>=3;}))`));
  check('Pattern Train: on Easy and Medium only the answer makes the train repeat', await ev(`['easy','medium'].every(l=>TR_PUZ[l].every(z=>{const q=trList(z.s);
    const per=a=>{const f=q.map(t=>t==='?'?a:t);for(let p=1;p<=f.length/2;p++)if(f.every((t,i)=>i<p||t===f[i-p]))return p;return 0;};
    return per(z.a)>0&&trList(z.o).filter(a=>a!==z.a).every(a=>!per(a));}))`));
  check('Pattern Train: the Hard answers are right, 4 choices each, each has a hint', await ev(`TR_PUZ.hard.map(z=>z.a).join()==='10,10,18,32,36,18,13,6'&&TR_PUZ.hard.every(z=>z.h&&trList(z.o).length===4)`));
  check('Word Builder: Easy shows the first letter among 3; Medium words have 3 letters; Hard 5 or more; every picture draws',
    await ev(`WB_PUZ.easy.every(z=>{const o=trList(z.o);return o.length===3&&new Set(o).size===3&&o.includes(z.w[0]);})&&WB_PUZ.medium.every(z=>z.w.length===3)&&WB_PUZ.hard.every(z=>z.w.length>=5)
      &&BRAIN_LVLS.every(l=>WB_PUZ[l].every(z=>/^[A-Z]+$/.test(z.w)&&wbPic(z.pic).length>(/^[a-z]:/.test(z.pic)?80:20)))`));
  check('Word Builder: the tiles hold every letter of the word plus the extras, the same order every time',
    await ev(`['medium','hard'].every(l=>WB_PUZ[l].every((z,i)=>{const t=wbTiles(z,l,i);return t.join()===wbTiles(z,l,i).join()&&t.length===z.w.length+z.x.length&&[...z.w].every(c=>t.filter(x=>x===c).length>=[...z.w].filter(x=>x===c).length);}))`));
  // play Pattern Train Easy 1: a wrong wagon, then the right one
  await ev(`document.querySelector('#brMenu [data-game=train]').click()`); await sleep(200);
  const tc0=await ev('P().coins');
  check('Pattern Train opens on Easy puzzle 1 with a train and 3 wagons to pick', await ev(`BR.game==='train'&&BR.lvl==='easy'&&BR.idx===0&&!!document.querySelector('#brQ .tr-train')&&document.querySelectorAll('#brBoard .tr-ch').length===3&&document.querySelector('.tr-ch[data-t=b]').getAttribute('aria-label')==='blue'`));
  await shot('K01-pattern-train-easy');
  await ev(`document.querySelector('.tr-ch[data-t=y]').click()`); await sleep(100);
  check('a wrong wagon only wobbles', await ev(`!BR.won&&!P().brain.solved.includes('train:e1')`));
  await ev(`document.querySelector('.tr-ch[data-t=b]').click()`); await sleep(150);
  check('the right wagon solves it (+2) and fills the gap', await ev(`BR.won&&P().brain.solved.includes('train:e1')&&P().coins===${tc0+2}&&!document.querySelector('#brQ .tr-train').textContent.includes('?')`));
  await ev(`closeModal();brPuzzle('train','medium',6)`); await sleep(150); await shot('K02-pattern-train-medium');
  await ev(`brPuzzle('train','hard',3)`); await sleep(150);
  await ev(`document.querySelector('.br-ch[data-t="24"]').click()`); await sleep(100);
  check('Hard: a wrong number shows a hint', await ev(`document.querySelector('#brMsg').textContent.includes('double')`));
  await shot('K03-pattern-train-hard');
  // Word Builder
  await ev(`show('brain');document.querySelector('#brMenu [data-game=word]').click()`); await sleep(200);
  const wc0=await ev('P().coins');
  check('Word Builder opens on Easy: a picture and 3 letters', await ev(`BR.game==='word'&&BR.lvl==='easy'&&document.querySelectorAll('#brBoard .wb-tile').length===3&&document.querySelector('#brQ .wb-pic').getAttribute('aria-label')==='apple'`));
  await shot('K04-word-easy');
  await ev(`document.querySelector('.wb-tile[data-c=M]').click()`); await sleep(80);
  await ev(`document.querySelector('.wb-tile[data-c=A]').click()`); await sleep(150);
  check('the first letter solves it (+2) and shows the word', await ev(`BR.won&&P().brain.solved.includes('word:e1')&&P().coins===${wc0+2}&&document.querySelector('.wb-word').textContent==='Apple'`));
  await ev(`closeModal();brPuzzle('word','medium',0)`); await sleep(150);
  check('Medium: 3 slots and 5 tiles', await ev(`document.querySelectorAll('.wb-slot').length===3&&document.querySelectorAll('.wb-tile').length===5`));
  await ev(`document.querySelector('.wb-tile[data-c=A]').click()`); await sleep(80);
  check('a letter out of order wobbles and fills nothing', await ev(`WB.got===0&&!document.querySelector('.wb-slot.on')`));
  for(const c of 'CAT'){await ev(`document.querySelector('.wb-tile[data-c=${c}]:not(.used)').click()`); await sleep(60);}
  check('C-A-T spells it and solves it', await ev(`BR.won&&P().brain.solved.includes('word:m1')&&[...document.querySelectorAll('.wb-slot')].map(x=>x.textContent).join('')==='CAT'`));
  await shot('K05-word-medium');
  await ev(`closeModal();brPuzzle('word','hard',5)`); await sleep(150);
  for(const c of 'SOCCER'){await ev(`document.querySelector('.wb-tile[data-c=${c}]:not(.used)').click()`); await sleep(60);}
  check('Hard: SOCCER (two Cs) spells and solves', await ev(`BR.won&&P().brain.solved.includes('word:h6')`));
  await ev(`closeModal();brPuzzle('word','hard',7)`); await sleep(150); await shot('K06-word-hard');
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true});
  await ev(`brPuzzle('train','easy',7)`); await sleep(200); await shot('K07-phone-train');
  check('phone: the train fits the screen', await ev(`document.querySelector('#brQ .tr-train').getBoundingClientRect().right<=innerWidth`));
  await ev(`brPuzzle('word','hard',7)`); await sleep(200); await shot('K08-phone-word');
  check('phone: no tile spills off the screen', await ev(`[...document.querySelectorAll('.wb-tile')].every(b=>b.getBoundingClientRect().right<=innerWidth)`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  check('2 new stickers on the Code & Brain page', await ev(`(a=>a.slice(a.indexOf('train8'),a.indexOf('train8')+2).join())(STICKERS.filter(s=>s.page==='code').map(s=>s.id))==='train8,word8'`));
  check('Brain Champ still counts only the first 3 games', await ev(`(()=>{const p=JSON.parse(JSON.stringify(P()));p.brain.solved=[];BRAIN_LVLS.forEach(l=>['train','word'].forEach(g=>BRAIN_GAMES[g].puzzles[l].forEach((z,i)=>p.brain.solved.push(brId(g,l,i)))));return stkHave(p,STICKERS.find(s=>s.id==='brainChamp'))===0;})()`));
  await ev(`{const p=DB.profiles[0];p.brain={game:'word',level:{snack:'hard',train:'medium',word:'nope'},solved:['word:e1']};normalize(p);}`);
  check('saved game and levels for the new games are kept; odd ones are made safe', await ev(`(()=>{const b=DB.profiles[0].brain;return b.game==='word'&&b.level.train==='medium'&&b.level.word==='easy'&&b.level.snack==='hard';})()`));
  await ev(`show('room')`);

  console.log('Fraction Bakery + Fact Cards (v1.34)');
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`closeModal();P().easy=false;applyEasy();show('brain')`); await sleep(200);
  check('the menu shows 7 games and a 📇 My Fact Cards button (0 / 24)', await ev(`[...document.querySelectorAll('#brMenu [data-game]')].map(b=>b.dataset.game).join()==='snack,memory,pop,train,word,bake,facts'&&document.querySelector('#factsBtn').textContent.includes('0 / 24')`));
  check('Fraction Bakery Easy: the answer is a choice, 3 different choices, each treat has the right number of pieces, and the uneven ones really are uneven',
    await ev(`FB_PUZ.easy.every(z=>{const o=fbOpts(z);return o.length===3&&new Set(o).size===3&&o.includes(String(z.n))&&o.every(x=>(fbTreat(z.k,parseInt(x,10),!x.endsWith('u')).match(/data-sl=/g)||[]).length===parseInt(x,10));})
      &&[2,3,4].every(n=>{const a=FB_UNEVEN.round[n],s=a.map((x,i)=>(i+1<n?a[i+1]:a[0]+360)-x),c=[0,...FB_UNEVEN.bar[n],1],w=c.slice(1).map((x,i)=>x-c[i]);
        return a.length===n&&s.every(x=>x>0)&&s.reduce((p,x)=>p+x,0)===360&&new Set(s).size>1&&w.length===n&&w.every(x=>x>0)&&new Set(w.map(x=>x.toFixed(3))).size>1;})`));
  check('Fraction Bakery Medium: a/b of n pieces is always a whole number of pieces; Hard answers are right',
    await ev(`FB_PUZ.medium.every(z=>z.a>0&&z.a<z.b&&Number.isInteger(z.a*z.n/z.b))&&FB_PUZ.hard.map(z=>z.a).join()==='5,3,6,12,6,2,12,25'`));
  check('Fact Cards: every puzzle has a topic, 3 different answers (in a fixed order) and a full card; the answer moves around',
    await ev(`BRAIN_LVLS.every(l=>FACT_PUZ[l].every((z,i)=>{const o=factOpts(z,l,i);return FACT_TOPICS[z.t]&&o.length===3&&new Set(o).size===3&&o.includes(z.a)&&o.join()===factOpts(z,l,i).join()&&z.card.i&&z.card.n&&z.card.f.length>20;})
      &&new Set(FACT_PUZ[l].map((z,i)=>factOpts(z,l,i).indexOf(z.a))).size>=2)&&FACT_PUZ.easy.every((z,i)=>factOpts(z,'easy',i).every(x=>factPic(x).length>20))`));
  check('…all 3 topics appear on every level', await ev(`BRAIN_LVLS.every(l=>Object.keys(FACT_TOPICS).every(t=>FACT_PUZ[l].some(z=>z.t===t)))`));
  // Fraction Bakery Easy 1
  await ev(`document.querySelector('#brMenu [data-game=bake]').click()`); await sleep(200);
  const fb0=await ev('P().coins');
  check('Fraction Bakery opens on Easy with 2 bunnies and 3 treats', await ev(`BR.game==='bake'&&BR.lvl==='easy'&&document.querySelector('.fb-friends').textContent==='🐰🐰'&&document.querySelectorAll('.fb-ch').length===3`));
  await shot('L01-bakery-easy');
  await ev(`document.querySelector('.fb-ch[data-o=\"2u\"]').click()`); await sleep(100);
  check('the uneven treat wobbles and says why', await ev(`!BR.won&&document.querySelector('#brMsg').textContent.includes('not the same size')`));
  await ev(`document.querySelector('.fb-ch[data-o=\"2\"]').click()`); await sleep(150);
  check('the even halves solve it (+2)', await ev(`BR.won&&P().brain.solved.includes('bake:e1')&&P().coins===${fb0+2}`));
  // Medium 3: toppings on 3/4
  await ev(`closeModal();brPuzzle('bake','medium',2)`); await sleep(150);
  check('Medium: a pizza in 4 pieces and ✔ Done', await ev(`document.querySelectorAll('.fb-big [data-sl]').length===4&&!!document.querySelector('#fbDone')`));
  const tapSl=i=>ev(`document.querySelector('.fb-big [data-sl="${i}"] path').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  await tapSl(0); await tapSl(1); await ev(`document.querySelector('#fbDone').click()`); await sleep(100);
  check('2 of 4 is not ¾: it asks for a little more', await ev(`!BR.won&&document.querySelector('#brMsg').textContent.includes('3/4')`));
  await tapSl(1); await tapSl(1); await tapSl(3); await sleep(50); await shot('L02-bakery-medium');
  check('tapping a piece twice takes the topping off again; the counter shows 3 / 4', await ev(`FB.on.filter(Boolean).length===3&&document.querySelector('.fb-count').textContent==='34'`));
  await ev(`document.querySelector('#fbDone').click()`); await sleep(150);
  check('3 of 4 pieces solves ¾', await ev(`BR.won&&P().brain.solved.includes('bake:m3')`));
  await ev(`closeModal();brPuzzle('bake','medium',7)`); await sleep(150); await shot('L03-bakery-medium-8');
  await ev(`brPuzzle('bake','hard',2)`); await sleep(150);
  await ev(`document.querySelector('.br-ch[data-n="6"]').click()`); await sleep(150);
  check('Hard: ⅔ of 9 is 6', await ev(`BR.won&&P().brain.solved.includes('bake:h3')`));
  // Fact Cards
  await ev(`closeModal();show('brain');document.querySelector('#brMenu [data-game=facts]').click()`); await sleep(200);
  const fc0=await ev('P().coins');
  check('Fact Cards opens on Easy: a topic, a question and 3 pictures', await ev(`BR.game==='facts'&&BR.lvl==='easy'&&!!document.querySelector('.fc-topic')&&document.querySelectorAll('.fc-pic').length===3`));
  await shot('L04-facts-easy');
  const factBtn=right=>ev(`(()=>{const z=FACT_PUZ[BR.lvl][BR.idx],o=factOpts(z,BR.lvl,BR.idx);const i=o.findIndex(x=>${right?'x===z.a':'x!==z.a'});document.querySelector('#brBoard [data-i="'+i+'"]').click();})()`);
  await factBtn(false); await sleep(100);
  check('a wrong answer wobbles', await ev(`!BR.won`));
  await factBtn(true); await sleep(1200);
  check('the right answer pays +2 and the win box shows the new fact card', await ev(`BR.won&&P().brain.solved.includes('facts:e1')&&P().coins===${fc0+2}&&document.querySelector('#modalBody .fc-card')&&document.querySelector('#modalBody').textContent.includes('Octopus')`));
  await shot('L05-facts-win');
  await ev(`closeModal();brPuzzle('facts','medium',1)`); await sleep(150);
  check('Medium: 3 word answers', await ev(`document.querySelectorAll('.fc-ans').length===3`)); await shot('L06-facts-medium');
  await factBtn(true); await sleep(150);
  await ev(`closeModal();show('brain')`); await sleep(150);
  check('the menu button now says 2 / 24', await ev(`document.querySelector('#factsBtn').textContent.includes('2 / 24')`));
  await ev(`document.querySelector('#factsBtn').click()`); await sleep(200);
  check('📇 the binder: 3 topics, 24 slots, 2 cards found', await ev(`BR.view==='facts'&&document.querySelectorAll('.fc-sec').length===3&&document.querySelectorAll('.fc-slot').length===24&&document.querySelectorAll('.fc-slot:not(.fc-none)').length===2`));
  await shot('L07-facts-binder');
  await ev(`document.querySelector('.fc-slot[data-fc="facts:m2"]').click()`); await sleep(150);
  check('tapping a found card shows it', await ev(`document.querySelector('#modalBody').textContent.includes('Jupiter')`));
  await ev(`closeModal();document.querySelector('.fc-slot[data-fc="facts:h1"]').click()`); await sleep(150);
  check('tapping a missing card offers ▶ Play it…', await ev(`document.querySelector('#modalTitle').textContent.includes('Not found')`));
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes('Play')).click()`); await sleep(200);
  check('…which opens that puzzle', await ev(`BR.view==='play'&&BR.game==='facts'&&BR.lvl==='hard'&&BR.idx===0`));
  await ev(`show('brain');factBinder()`); await sleep(100);
  check('Android Back: binder → menu', await ev(`window.androidBack()===true&&BR.view==='menu'`));
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true});
  await ev(`factBinder()`); await sleep(200); await shot('L08-phone-binder');
  await ev(`brPuzzle('bake','medium',7)`); await sleep(200); await shot('L09-phone-bakery');
  check('phone: the pizza and ✔ fit the screen', await ev(`[...document.querySelectorAll('.fb-big,#fbDone')].every(e=>e.getBoundingClientRect().right<=innerWidth)`));
  await ev(`brPuzzle('facts','hard',5)`); await sleep(200); await shot('L10-phone-facts-hard');
  check('phone: long answers fit', await ev(`[...document.querySelectorAll('.fc-ans')].every(e=>e.getBoundingClientRect().right<=innerWidth&&e.scrollWidth<=e.clientWidth+1)`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  check('2 new stickers on the Code & Brain page', await ev(`(a=>a.slice(a.indexOf('bake8'),a.indexOf('bake8')+2).join())(STICKERS.filter(s=>s.page==='code').map(s=>s.id))==='bake8,facts12'`));
  await ev(`{const p=DB.profiles[0];p.brain={game:'facts',level:{bake:'hard',facts:'medium'},solved:['facts:e1']};normalize(p);}`);
  check('saved game and levels for the new games are kept', await ev(`(()=>{const b=DB.profiles[0].brain;return b.game==='facts'&&b.level.bake==='hard'&&b.level.facts==='medium'&&b.level.train==='easy';})()`));
  await ev(`closeModal();show('room')`);

  console.log('Content Pack 3 (v1.35): stage, cozy, cafe, ocean');
  await ev(`closeModal();stkPaused=true;P().easy=false;P().coins=500;applyEasy();show('room');goRoom(1)`); await sleep(200);
  const p3Wall=await ev('P().room.wall'), p3Look=await ev('JSON.stringify(P().look)');
  const p3Clothes=JSON.parse(await ev(`JSON.stringify(Object.entries(CLOSET).flatMap(([c,v])=>v.items.filter(i=>i.p3).map(i=>[c,i.id])))`));
  check('18 new clothes (one a hair style), each with a theme', p3Clothes.length===18&&p3Clothes.some(([c])=>c==='hair')&&await ev(`Object.values(CLOSET).every(c=>c.items.filter(i=>i.p3).every(i=>P3_THEMES[i.p3]&&!i.p2))`), p3Clothes.length);
  check('every new piece of clothing draws on every buddy, with no broken numbers', await ev(`(()=>{const items=Object.entries(CLOSET).flatMap(([c,v])=>v.items.filter(i=>i.p3).map(i=>[c,i.id]));return items.every(([c,id])=>Object.keys(BUDDIES).every(k=>{const s=mascotSVG(Object.assign({},DEFAULT_LOOK,{kind:k,[c]:id}));return s.length>500&&!/NaN|undefined/.test(s);}));})()`));
  check('nothing in the pack says "boy" or "girl", and every price is 10–40', await ev(`(()=>{const L=[...Object.values(CLOSET).flatMap(c=>c.items),...Object.values(DECOR),...Object.values(WALLS),...Object.values(FLOORS),...Object.values(POP_THEMES),...Object.values(POP_SHAPES),...Object.values(SQUISHIES),...Object.values(SPINS),...Object.values(SLIMES),...Object.values(CUBES),...Object.values(MARBLES)].filter(x=>x.p3);return L.length>=50&&L.every(x=>!/\\b(boy|girl)s?\\b/i.test(x.name)&&x.price>=10&&x.price<=40);})()`));
  check('every new item is on a photocard row (cute, spooky or sporty)', await ev(`Object.entries(CLOSET).flatMap(([c,v])=>v.items.filter(i=>i.p3).map(i=>c+':'+i.id)).every(k=>Object.values(CARD_TAGS).some(t=>t.includes(k)))`));
  check('Cozy, Cafe and Ocean chips sit before Outdoor and Dreams', await ev(`(()=>{const k=Object.keys(THEMES);return k.slice(-2).join()==='yard,dream'&&['cozy','cafe','ocean'].every(t=>k.indexOf(t)>=0&&k.indexOf(t)<k.indexOf('yard'));})()`));
  await ev(`show('closet')`);
  for(const [c,i] of p3Clothes){await ev(`document.querySelector('[data-cat=${c}]').click()`);
    check(`closet has ${c}:${i}`, await ev(`!!document.querySelector('#closetGrid [data-id=${i}] svg')`));}
  await ev(`document.querySelector('[data-cat=top]').click()`); await sleep(100);
  check('Closet tops show the 🎤 Stage, 🍵 Cozy, 🧁 Cafe and 🐚 Ocean chips', await ev(`['stage','cozy','cafe','ocean'].every(t=>document.querySelector('#closetGrid [data-theme='+t+']'))`));
  await ev(`document.querySelector('#closetGrid [data-theme=cozy]').click()`); await sleep(100);
  check('🍵 Cozy shows the sweater and the sailor top', await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id).sort().join()==='bigSweater,sailorTop'`), await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id).join()`));
  await ev(`document.querySelector('#closetGrid [data-theme=stage]').click()`); await sleep(100);
  check('🎤 Stage shows the old Idol Stage Jacket and the new Sparkle Stage Top', await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id).sort().join()==='idolCrop,stage'`));
  await ev(`themePick.closet='all';renderCloset();document.querySelector('#closetGrid [data-id=scaleTop]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('bought and wearing the Mermaid Scale Top (20)', await ev(`P().look.top==='scaleTop'&&P().owned.includes('top:scaleTop')&&P().coins===480`), await ev('P().coins'));
  check('new clothes count on photocard stats (cute)', (await ev(`cardStats(Object.assign({},DEFAULT_LOOK,{hair:'idolBuns',top:'cafeApron',bottom:'mermaidTail',legs:'knitSocks',arms:'pearlBands',shoes:'berryShoes',acc:'shellCrown'}))[0]`))===5);
  await ev(`P().look=Object.assign({},P().look,{kind:'bunny',hair:'idolBuns',hairColor:'pink',top:'idolCrop',bottom:'starPleats',legs:'none',arms:'sparkleGloves',shoes:'glitterBoots',acc:'headsetMic'});renderCloset()`); await sleep(100); await shot('M1-pack3-stage');
  await ev(`P().look=Object.assign({},P().look,{kind:'bear',hair:'messy',top:'bigSweater',bottom:'cargo',legs:'knitSocks',arms:'none',shoes:'slippers',acc:'catBeret'});renderCloset()`); await sleep(100); await shot('M2-pack3-cozy');
  await ev(`P().look=Object.assign({},P().look,{kind:'fox',hair:'bob',top:'sailorTop',bottom:'plaid',legs:'none',shoes:'maryjanes',acc:'none'});renderCloset()`); await sleep(100); await shot('M3-pack3-sailor');
  await ev(`P().look=Object.assign({},P().look,{kind:'puppy',hair:'tuft',top:'cafeApron',bottom:'shorts',legs:'none',shoes:'berryShoes',acc:'chefHat'});renderCloset()`); await sleep(100); await shot('M4-pack3-cafe');
  await ev(`P().look=Object.assign({},P().look,{kind:'dino',hair:'waves',hairColor:'sky',top:'scaleTop',bottom:'mermaidTail',arms:'pearlBands',shoes:'none',acc:'shellCrown'});renderCloset()`); await sleep(100); await shot('M5-pack3-ocean');
  await ev(`P().look=Object.assign({},P().look,{kind:'bunny',hair:'swoopBlack',hairColor:'black',top:'tee',bottom:'plaid',arms:'none',shoes:'boots',acc:'cupcakeClip'});renderCloset()`); await sleep(100); await shot('M6-pack3-clip');
  await ev(`P().look=${p3Look};P().look.top='scaleTop';save();show('room')`);
  const p3Decor=['idolVanity','micStand','cheerBanner','kotatsu','paperLantern','catCushion','cafeCounter','cafeTable','cupcakeTower','menuBoard','shellBed','shellChair','coralLamp','starfishRug'];
  check('14 new decorations in 4 matching sets, each with a theme', (await ev(`Object.entries(DECOR).filter(([k,d])=>d.p3).map(([k])=>k).join()`))===p3Decor.join());
  check('the 3 new lamps glow at night', await ev(`['idolVanity','paperLantern','coralLamp'].every(k=>NIGHT_GLOW[k]&&NIGHT_COLS[NIGHT_GLOW[k].c])`));
  await ev(`enterDecorate();document.querySelector('[data-dt=shop]').click()`); await sleep(150);
  check('the Shop has all 14 new decorations', await ev(`${JSON.stringify(p3Decor)}.every(k=>document.querySelector('#decoGrid [data-buy='+k+']'))`));
  await ev(`document.querySelector('#decoGrid [data-theme=ocean]').click()`); await sleep(100);
  check('🐚 Ocean in the Shop shows the seashell set', await ev(`[...document.querySelectorAll('#decoGrid [data-buy]')].map(b=>b.dataset.buy).sort().join()==='coralLamp,shellBed,shellChair,starfishRug'`), await ev(`[...document.querySelectorAll('#decoGrid [data-buy]')].map(b=>b.dataset.buy).join()`));
  await shot('M7-pack3-shop-ocean');
  await ev('checkBonus()'); await sleep(100); const p3Bed0=await ev('P().coins'); // a bonus photocard (+10) may be due from the closet buys
  await ev(`document.querySelector('#decoGrid [data-buy=shellBed]').click()`); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(150);
  check('buying the Seashell Bed (40) puts it in her room', await ev(`P().room.items.some(i=>i.type==='shellBed'&&i.placed)&&P().coins===${p3Bed0-40}`), [p3Bed0,await ev('P().coins')]);
  await ev(`themePick.shop='all';document.querySelector('[data-dt=wall]').click()`); await sleep(100);
  check('4 new walls', await ev(`['stageLights','blossom','cafeStripe','underSea'].every(k=>document.querySelector('#decoGrid [data-surf='+k+']'))`));
  await ev(`document.querySelector('#decoGrid [data-surf=underSea]').click()`); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(150);
  check('bought and put up the Under the Sea wall', await ev(`P().room.wall==='underSea'&&P().owned.includes('wall:underSea')`));
  await ev(`document.querySelector('[data-dt=floor]').click()`); await sleep(100);
  check('4 new floors', await ev(`['stageFloor','wovenMat','cafeTiles','seaFloor'].every(k=>document.querySelector('#decoGrid [data-surf='+k+']'))`));
  await ev(`exitDecorate();P().room.floor='seaFloor';renderRoom()`); await sleep(150); await shot('M8-pack3-ocean-room');
  await ev(`goRoom(2);for(const k of ${JSON.stringify(p3Decor)})P().room2.items.push(Object.assign({uid:'p3'+k,type:k,placed:true},spot(k)));P().room2.floor='cafeTiles';P().room2.wall='cafeStripe';save();renderRoom()`); await sleep(200);
  await shot('M9-pack3-loft');
  check('every new decoration draws in the Loft, with no broken numbers', await ev(`(()=>{const h=document.querySelector('#roomSvg').innerHTML;return ${JSON.stringify(p3Decor)}.every(k=>P().room2.items.some(i=>i.type===k))&&document.querySelectorAll('#roomSvg .deco').length>=14&&!/NaN|undefined/.test(h);})()`));
  for(const [w,f] of [['stageLights','stageFloor'],['blossom','wovenMat']]){await ev(`P().room2.wall='${w}';P().room2.floor='${f}';renderRoom()`); await sleep(100); await shot('M10-pack3-'+w);}
  await ev(`P().night={2:true};renderRoom()`); await sleep(150); await shot('M11-pack3-night');
  await ev(`P().night={};P().room2.items=P().room2.items.filter(i=>!String(i.uid).startsWith('p3'));P().room2.wall='attic';save();goRoom(1)`);

  console.log('Content Pack 3: fidget designs');
  await ev(`show('fidget');setFidTab('popit')`); await sleep(200);
  check('3 new pop-it colors and 2 new board shapes', await ev(`['idol','macaron','sea'].every(k=>document.querySelector('#skinRow [data-skin='+k+']'))&&['shell','cupcake'].every(k=>document.querySelector('#skinRow [data-shape='+k+']'))`));
  for(const sh of ['shell','cupcake']){
    await ev(`P().fid.pop='${sh==='shell'?'sea':'macaron'}';document.querySelector('#skinRow [data-shape=${sh}]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(200);
    const n=await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').length`);
    check(`the ${sh} board has a sensible number of bubbles`, n>=12&&n<36, n); await shot('M12-pop-'+sh);
    const fl=await ev('P().stats.flips'); await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').forEach(b=>popAt(b))`); await sleep(1300);
    check(`popping every ${sh} bubble flips the board`, (await ev('P().stats.flips'))===fl+1);
  }
  await ev(`P().fid.pop='idol';P().fid.popShape='classic';renderPop()`); await sleep(100); await shot('M13-pop-idol');
  await ev(`P().fid.pop='rainbow';renderPop()`);
  check('every new squishy extra, spinner and slime picture has a drawing', await ev(`['frosting','tentacles','nori'].every(k=>SQ_EXTRAS[k]&&(SQ_EXTRAS[k].front||SQ_EXTRAS[k].back))&&['shell','note','boba'].every(k=>typeof FID_ICONS[k]==='function')`));
  for(const [tab,ids] of [['squish',['cupcake','jelly','riceBall']],['spin',['seashell','idolNote']],['slime',['milkTea','mermaid']],['cube',['macaron','idol']],['maze',['seaBubble','boba']]]){
    await ev(`setFidTab('${tab}')`); await sleep(150);
    check(`new ${tab} designs are listed`, await ev(`${JSON.stringify(ids)}.every(k=>document.querySelector('#skinRow [data-skin='+k+']'))`));
    for(const id of ids){await ev(`P().fid[FID['${tab}'].key]='${id}';fid2Open('${tab}');${tab==='spin'?'SP.w=12;':''}`);
      if(tab==='squish'){await ev(`sq('pointerdown',51,0.2,0.1)`); await sleep(450); await shot(`M14-${tab}-${id}`); await ev(`sq('pointerup',51,0.2,0.1)`); await sleep(400); await shot(`M14-${tab}-${id}-rest`);}
      else {await sleep(350); await shot(`M14-${tab}-${id}`);}}
  }
  await ev(`P().fid.marble='pearl';setFidTab('maze');document.querySelector('#skinRow [data-skin=seaBubble]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('bought the Sea Bubble marble (owned as marble:seaBubble)', await ev(`P().fid.marble==='seaBubble'&&P().owned.includes('marble:seaBubble')`));
  await ev(`P().fid.squish='mochi';P().fid.spin='galaxy';P().fid.slime='grape';P().fid.cube='pastel';P().fid.marble='pearl';save();show('room')`);

  console.log('Content Pack 3: stickers');
  check('4 new stickers on the Room & Style page', await ev(`['p3stage','p3cozy','p3cafe','p3ocean'].every(id=>STICKERS.some(s=>s.id===id&&s.page==='room'))`));
  check('ocean things count: the top, the bed, the wall, the marble and the shell board (5); cafe: the cupcake board (1)', await ev(`p3Have(P(),'ocean')===5&&p3Have(P(),'cafe')===1`), await ev(`[p3Have(P(),'stage'),p3Have(P(),'cozy'),p3Have(P(),'cafe'),p3Have(P(),'ocean')]`));
  check('older stage things (Idol Stage Jacket, Idol Tiara) count for Stage Star too', await ev(`p3Have(Object.assign({},P(),{owned:['top:stage','acc:tiara']}),'stage')-p3Have(Object.assign({},P(),{owned:[]}),'stage')===2`));
  await ev(`P().owned.push('slime:milkTea','squish:cupcake');P().room.items.push({uid:'p3cc',type:'cupcakeTower',placed:false})`);
  check('fidgets and a decoration in My Stuff count too (4 cafe things)', await ev(`p3Have(P(),'cafe')===4`));
  const p3c0=await ev('P().coins'), p3Had=await ev(`JSON.stringify(P().stickers.filter(id=>/^p3/.test(id)))`);
  await ev(`stkPaused=false`); const p3Got=await ev(`checkStickers().map(s=>s.id).filter(id=>/^p3/.test(id)).sort().join()`); const p3c1=await ev('P().coins'); await ev(`stkPaused=true;closeModal()`);
  check('3+ ocean and 3 cafe things give Mermaid Friend and Cafe Owner, not Cozy Day', p3Got.split(',').includes('p3ocean')&&p3Got.split(',').includes('p3cafe')&&!p3Got.includes('p3cozy'), [p3Had,p3Got]);
  check('...and they pay +2 each (with any other sticker that came at the same time)', p3c1>=p3c0+4&&(p3c1-p3c0)%2===0, [p3c0,p3c1]);
  await ev(`P().room.items=P().room.items.filter(i=>i.uid!=='p3cc');save()`);

  console.log('Content Pack 3 in backups');
  const p3Id=await ev('P().id'), p3Code=await ev('JSON.stringify(DB)');
  await ev(`doRestore(${JSON.stringify(p3Code)})`); await sleep(400);
  check('a backup keeps the pack top, wall, marble, bed and sticker', await ev(`(()=>{const p=DB.profiles.find(q=>q.id==='${p3Id}');return !!p&&p.owned.includes('top:scaleTop')&&p.owned.includes('wall:underSea')&&p.owned.includes('marble:seaBubble')&&p.stickers.includes('p3ocean')&&p.room.items.some(i=>i.type==='shellBed');})()`));
  await ev(`closeModal();document.querySelector('.pcard[data-id="${p3Id}"]').click()`); await sleep(1300);
  await ev(`closeModal();{const p=P();p.room.wall='${p3Wall}';p.room.items=p.room.items.filter(i=>i.type!=='shellBed');p.look=${p3Look};}save();show('room')`);
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true});
  await ev(`closetCat='top';themePick.closet='all';show('closet')`); await sleep(250); await shot('M15-phone-closet');
  check('phone: the closet has its chips and nothing makes the page scroll sideways', await ev(`!!document.querySelector('#closetGrid .chips')&&document.documentElement.scrollWidth<=innerWidth+1`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`closeModal();show('room')`);

  console.log('Content Pack 4 (v1.36): sport, farm, trucks, space and the dino nugget');
  await ev(`closeModal();stkPaused=true;P().easy=false;P().coins=600;applyEasy();show('room');goRoom(1)`); await sleep(200);
  const p4Wall=await ev('P().room.wall'), p4Look=await ev('JSON.stringify(P().look)');
  const p4Clothes=JSON.parse(await ev(`JSON.stringify(Object.entries(CLOSET).flatMap(([c,v])=>v.items.filter(i=>i.p4).map(i=>[c,i.id])))`));
  check('17 new clothes, each with a theme', p4Clothes.length===17&&await ev(`Object.values(CLOSET).every(c=>c.items.filter(i=>i.p4).every(i=>P4_THEMES[i.p4]&&!i.p2&&!i.p3))`), p4Clothes.length);
  check('every new piece of clothing draws on every buddy, with no broken numbers', await ev(`(()=>{const items=Object.entries(CLOSET).flatMap(([c,v])=>v.items.filter(i=>i.p4).map(i=>[c,i.id]));return items.every(([c,id])=>Object.keys(BUDDIES).every(k=>{const s=mascotSVG(Object.assign({},DEFAULT_LOOK,{kind:k,[c]:id}));return s.length>500&&!/NaN|undefined/.test(s);}));})()`));
  check('nothing in the pack says "boy" or "girl", and every price is 10–40', await ev(`(()=>{const L=[...Object.values(CLOSET).flatMap(c=>c.items),...Object.values(DECOR),...Object.values(WALLS),...Object.values(FLOORS),...Object.values(POP_THEMES),...Object.values(POP_SHAPES),...Object.values(SQUISHIES),...Object.values(SPINS),...Object.values(SLIMES),...Object.values(CUBES),...Object.values(MARBLES)].filter(x=>x.p4);return L.length>=50&&L.every(x=>!/\\b(boy|girl)s?\\b/i.test(x.name)&&x.price>=10&&x.price<=40);})()`));
  check('every new item is on a photocard row', await ev(`Object.entries(CLOSET).flatMap(([c,v])=>v.items.filter(i=>i.p4).map(i=>c+':'+i.id)).every(k=>Object.values(CARD_TAGS).some(t=>t.includes(k)))`));
  check('the 🐮 Farm chip sits before Outdoor and Dreams (and 🏛️ Museum since v1.50)', await ev(`Object.keys(THEMES).slice(-4).join()==='farm,museum,yard,dream'`));
  await ev(`show('closet')`);
  for(const [c,i] of p4Clothes){await ev(`document.querySelector('[data-cat=${c}]').click()`);
    check(`closet has ${c}:${i}`, await ev(`!!document.querySelector('#closetGrid [data-id=${i}] svg')`));}
  await ev(`document.querySelector('[data-cat=top]').click()`); await sleep(100);
  await ev(`document.querySelector('#closetGrid [data-theme=sport]').click()`); await sleep(100);
  check('⚽ Sport tops: the soccer jersey, Hoops Jersey and Karate Gi', await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id).sort().join()==='hoopJersey,jersey,karateGi'`), await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id).join()`));
  await ev(`document.querySelector('#closetGrid [data-theme=farm]').click()`); await sleep(100);
  check('🐮 Farm tops: the overalls', await ev(`[...document.querySelectorAll('#closetGrid .tile')].map(t=>t.dataset.id).join()==='overalls'`));
  await ev(`themePick.closet='all';renderCloset();document.querySelector('#closetGrid [data-id=nuggetTee]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('bought and wearing the Dino Nugget Tee (15)', await ev(`P().look.top==='nuggetTee'&&P().owned.includes('top:nuggetTee')&&P().coins===585`), await ev('P().coins'));
  check('new clothes count on photocard stats (sporty)', (await ev(`cardStats(Object.assign({},DEFAULT_LOOK,{top:'hoopJersey',bottom:'hoopShorts',legs:'kneePads',arms:'wristbands',shoes:'skateShoes',acc:'skateHelmet'}))[2]`))===5);
  await ev(`P().look=Object.assign({},P().look,{kind:'bear',hair:'buzz',top:'hoopJersey',bottom:'hoopShorts',legs:'kneePads',arms:'wristbands',shoes:'skateShoes',acc:'sportBand'});renderCloset()`); await sleep(100); await shot('N1-pack4-hoops');
  await ev(`P().look=Object.assign({},P().look,{kind:'fox',hair:'messy',top:'karateGi',bottom:'none',legs:'none',arms:'none',shoes:'none',acc:'skateHelmet'});renderCloset()`); await sleep(100); await shot('N2-pack4-karate');
  await ev(`P().look=Object.assign({},P().look,{kind:'puppy',hair:'pigtails',top:'overalls',bottom:'jeans',shoes:'rainBoots',acc:'strawHat'});renderCloset()`); await sleep(100); await shot('N3-pack4-farm');
  await ev(`P().look=Object.assign({},P().look,{kind:'dino',hair:'none',top:'fireTop',bottom:'cargo',shoes:'hightops',acc:'fireHelmet'});renderCloset()`); await sleep(100); await shot('N4-pack4-fire');
  await ev(`P().look=Object.assign({},P().look,{kind:'bunny',hair:'swoopBlack',top:'alienTee',bottom:'plaid',shoes:'boots',acc:'starVisor'});renderCloset()`); await sleep(100); await shot('N5-pack4-alien');
  await ev(`P().look=Object.assign({},P().look,{top:'nuggetTee',acc:'chickClip'});renderCloset()`); await sleep(100); await shot('N6-pack4-nugget');
  await ev(`P().look=${p4Look};P().look.top='nuggetTee';save();show('room')`);
  const p4Decor=['dinoNugget','hoop','skateRamp','karateMat','skateRack','barn','cowPlush','sheepPlush','hayBale','tractor','fireTruck','carBed','ufoLamp','alienPlush'];
  check('14 new decorations, each with a theme', (await ev(`Object.entries(DECOR).filter(([k,d])=>d.p4).map(([k])=>k).join()`))===p4Decor.join());
  await ev(`enterDecorate();document.querySelector('[data-dt=shop]').click()`); await sleep(150);
  check('the Shop has all 14 new decorations', await ev(`${JSON.stringify(p4Decor)}.every(k=>document.querySelector('#decoGrid [data-buy='+k+']'))`));
  await ev(`document.querySelector('#decoGrid [data-theme=farm]').click()`); await sleep(100);
  check('🐮 Farm in the Shop shows the farm set', await ev(`[...document.querySelectorAll('#decoGrid [data-buy]')].map(b=>b.dataset.buy).sort().join()==='barn,cowPlush,hayBale,sheepPlush,tractor'`), await ev(`[...document.querySelectorAll('#decoGrid [data-buy]')].map(b=>b.dataset.buy).join()`));
  await shot('N7-pack4-shop-farm');
  await ev(`themePick.shop='dino';renderDecoGrid()`); await sleep(100);
  await ev('checkBonus()'); await sleep(100); const p4c0=await ev('P().coins');
  await ev(`document.querySelector('#decoGrid [data-buy=dinoNugget]').click()`); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(150);
  check('buying the Dino Nugget Plush (15) puts it in her room', await ev(`P().room.items.some(i=>i.type==='dinoNugget'&&i.placed)&&P().coins===${p4c0-15}`), [p4c0,await ev('P().coins')]);
  // 🦖 it sits on a Little Shelf: put a shelf up, drop the plush just above its top, and it snaps on
  await ev(`{const R=P().room;R.items.push({uid:'p4shelf',type:'shelfS',placed:true,x:820,y:330});const n=R.items.find(i=>i.type==='dinoNugget');n.x=826;n.y=330-44-18;snapToShelf(n);save();renderRoom();}`); await sleep(150);
  check('🦖 the plush snaps onto a Little Shelf and rides along with it', await ev(`(()=>{const R=P().room,n=R.items.find(i=>i.type==='dinoNugget'),s=R.items.find(i=>i.uid==='p4shelf');return n.y===s.y-44&&onShelf(s).includes(n);})()`));
  check('...and fits on it (narrower than the shelf)', await ev(`(()=>{const b=DECOR.dinoNugget.box.split(' ').map(Number);return b[2]<=DECOR.shelfS.shelf.w;})()`));
  await ev(`exitDecorate();renderRoom()`); await sleep(150); await shot('N8-pack4-nugget-shelf');
  await ev(`enterDecorate();themePick.shop='all';document.querySelector('[data-dt=wall]').click()`); await sleep(100);
  check('3 new walls', await ev(`['gymWall','barnWood','nebula'].every(k=>document.querySelector('#decoGrid [data-surf='+k+']'))`));
  await ev(`document.querySelector('[data-dt=floor]').click()`); await sleep(100);
  check('3 new floors', await ev(`['court','hayFloor','roadMat'].every(k=>document.querySelector('#decoGrid [data-surf='+k+']'))`));
  await ev(`exitDecorate()`);
  await ev(`goRoom(2);for(const k of ${JSON.stringify(p4Decor)})P().room2.items.push(Object.assign({uid:'p4'+k,type:k,placed:true},spot(k)));P().room2.floor='court';P().room2.wall='gymWall';save();renderRoom()`); await sleep(200);
  await shot('N9-pack4-loft');
  check('every new decoration draws in the Loft, with no broken numbers', await ev(`(()=>{const h=document.querySelector('#roomSvg').innerHTML;return ${JSON.stringify(p4Decor)}.every(k=>P().room2.items.some(i=>i.type===k))&&document.querySelectorAll('#roomSvg .deco').length>=14&&!/NaN|undefined/.test(h);})()`));
  for(const [w,f] of [['barnWood','hayFloor'],['nebula','roadMat']]){await ev(`P().room2.wall='${w}';P().room2.floor='${f}';renderRoom()`); await sleep(100); await shot('N10-pack4-'+w);}
  await ev(`P().night={2:true};renderRoom()`); await sleep(150); await shot('N11-pack4-night');
  await ev(`P().night={};P().room2.items=P().room2.items.filter(i=>!String(i.uid).startsWith('p4'));P().room2.wall='attic';save();goRoom(3)`); await sleep(150);
  await ev(`for(const k of ['hayBale','tractor','barn'])P().room3.items.push(Object.assign({uid:'p4y'+k,type:k,placed:true},spot(k)));renderRoom()`); await sleep(150); await shot('N12-pack4-yard');
  await ev(`P().room3.items=P().room3.items.filter(i=>!String(i.uid).startsWith('p4y'));save();goRoom(1)`);

  console.log('Content Pack 4: fidget designs');
  await ev(`show('fidget');setFidTab('popit')`); await sleep(200);
  check('3 new pop-it colors and 2 new board shapes', await ev(`['hoops','farm','nebula'].every(k=>document.querySelector('#skinRow [data-skin='+k+']'))&&['bball','nugget'].every(k=>document.querySelector('#skinRow [data-shape='+k+']'))`));
  for(const sh of ['bball','nugget']){
    await ev(`P().fid.pop='${sh==='bball'?'hoops':'farm'}';document.querySelector('#skinRow [data-shape=${sh}]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(200);
    const n=await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').length`);
    check(`the ${sh} board has a sensible number of bubbles`, n>=12&&n<36, n); await shot('N13-pop-'+sh);
    const fl=await ev('P().stats.flips'); await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').forEach(b=>popAt(b))`); await sleep(1300);
    check(`popping every ${sh} bubble flips the board`, (await ev('P().stats.flips'))===fl+1);
  }
  await ev(`P().fid.pop='nebula';P().fid.popShape='classic';renderPop()`); await sleep(100); await shot('N14-pop-nebula');
  await ev(`P().fid.pop='rainbow';renderPop()`);
  check('every new squishy extra and picture has a drawing', await ev(`['nugget','chick','seams'].every(k=>SQ_EXTRAS[k]&&(SQ_EXTRAS[k].front||SQ_EXTRAS[k].back))&&['ufo','flower'].every(k=>typeof FID_ICONS[k]==='function')`));
  for(const [tab,ids] of [['squish',['nugget','chick','bball']],['spin',['hoops','ufo']],['slime',['meadow','nebula']],['cube',['hoops','farm']],['maze',['bball','egg']]]){
    await ev(`setFidTab('${tab}')`); await sleep(150);
    check(`new ${tab} designs are listed`, await ev(`${JSON.stringify(ids)}.every(k=>document.querySelector('#skinRow [data-skin='+k+']'))`));
    for(const id of ids){await ev(`P().fid[FID['${tab}'].key]='${id}';fid2Open('${tab}');${tab==='spin'?'SP.w=12;':''}`);
      if(tab==='squish'){await ev(`sq('pointerdown',51,0.2,0.1)`); await sleep(450); await shot(`N15-${tab}-${id}`); await ev(`sq('pointerup',51,0.2,0.1)`); await sleep(400); await shot(`N15-${tab}-${id}-rest`);}
      else {await sleep(350); await shot(`N15-${tab}-${id}`);}}
  }
  await ev(`P().fid.squish='mochi';setFidTab('squish');document.querySelector('#skinRow [data-skin=nugget]').click()`); await ev(`${mbtn('Yes')}.click()`); await sleep(150);
  check('bought the Dino Nugget squishy (owned as squish:nugget)', await ev(`P().fid.squish==='nugget'&&P().owned.includes('squish:nugget')`));
  await ev(`P().fid.squish='mochi';P().fid.spin='galaxy';P().fid.slime='grape';P().fid.cube='pastel';P().fid.marble='pearl';save();show('room')`);

  console.log('Content Pack 4: stickers');
  check('4 new stickers on the Room & Style page', await ev(`['p4sport','p4farm','p4go','p4nug'].every(id=>STICKERS.some(s=>s.id===id&&s.page==='room'))`));
  check('Nugget Buddy counts the plush and the squishy (2 of 2)', await ev(`p4Nuggets(P())===2`));
  check('no farm things bought yet (0)', await ev(`p4Have(P(),'farm')===0`), await ev(`[p4Have(P(),'sport'),p4Have(P(),'farm'),p4Have(P(),'ride'),p4Have(P(),'space'),p4Have(P(),'dino')]`));
  check('older soccer things count for All-Star (Soccer Jersey, Soccer Socks)', await ev(`p4Have(Object.assign({},P(),{owned:['top:jersey','legs:soccer']}),'sport')-p4Have(Object.assign({},P(),{owned:[]}),'sport')===2`));
  await ev(`P().owned.push('wall:barnWood','marble:egg');P().room.items.push({uid:'p4cow',type:'cowPlush',placed:false})`);
  check('a wall, a marble and a plush in My Stuff make 3 farm things', await ev(`p4Have(P(),'farm')===3`));
  const p4s0=await ev('P().coins');
  await ev(`stkPaused=false`); const p4Got=await ev(`checkStickers().map(s=>s.id).filter(id=>/^p4/.test(id)).sort().join()`); const p4s1=await ev('P().coins'); await ev(`stkPaused=true;closeModal()`);
  check('Farm Friend and Nugget Buddy arrive', p4Got.split(',').includes('p4farm')&&p4Got.split(',').includes('p4nug'), p4Got);
  check('...and they pay +2 each (with any other sticker that came at the same time)', p4s1>=p4s0+4&&(p4s1-p4s0)%2===0, [p4s0,p4s1]);
  await ev(`P().room.items=P().room.items.filter(i=>i.uid!=='p4cow');save()`);

  console.log('Content Pack 4 in backups');
  const p4Id=await ev('P().id'), p4Code=await ev('JSON.stringify(DB)');
  await ev(`doRestore(${JSON.stringify(p4Code)})`); await sleep(400);
  check('a backup keeps the tee, the squishy, the plush on its shelf and the sticker', await ev(`(()=>{const p=DB.profiles.find(q=>q.id==='${p4Id}');return !!p&&p.owned.includes('top:nuggetTee')&&p.owned.includes('squish:nugget')&&p.stickers.includes('p4nug')&&p.room.items.some(i=>i.type==='dinoNugget')&&p.room.items.some(i=>i.uid==='p4shelf');})()`));
  await ev(`closeModal();document.querySelector('.pcard[data-id="${p4Id}"]').click()`); await sleep(1300);
  await ev(`closeModal();{const p=P();p.room.wall='${p4Wall}';p.room.items=p.room.items.filter(i=>i.type!=='dinoNugget'&&i.uid!=='p4shelf');p.look=${p4Look};}save();show('room')`);
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true});
  await ev(`closetCat='acc';themePick.closet='all';show('closet')`); await sleep(250); await shot('N16-phone-closet');
  check('phone: nothing makes the closet scroll sideways', await ev(`document.documentElement.scrollWidth<=innerWidth+1`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`closeModal();show('room')`);

  console.log('Fidget allowance (v1.36): 30 fidget coins a day');
  await ev(`closeModal();show('room');{const p=P();p.fidPay={day:'',n:0};p.coins=100;fidToldDay='';}`); await sleep(100);
  check('fidget coins share an allowance of 30 a day', await ev(`FID_DAILY===30`));
  await ev(`for(let k=0;k<6;k++)fidEarn(5)`); await sleep(100);
  check('the first 30 fidget coins are paid as usual', await ev(`P().coins===130&&P().fidPay.n===30&&P().fidPay.day===new Date().toDateString()`), await ev('[P().coins,P().fidPay.n]'));
  check('…and a gentle note says they are full for today (no countdown)', await ev(`/full for today/.test(document.querySelector('#toast')?.textContent||document.body.textContent)&&!/tomorrow|hours|minutes/i.test(document.querySelector('#toast')?.textContent||'')`));
  await ev(`fidEarn(1);fidEarn(5)`); await sleep(100);
  check('after that, fidgets pay nothing more today', await ev(`P().coins===130&&P().fidPay.n===30`));
  await ev(`P().fidPay={day:new Date().toDateString(),n:28};fidEarn(5)`); await sleep(100);
  check('a flip bonus near the limit pays only what is left (2 of 5)', await ev(`P().coins===132&&P().fidPay.n===30`));
  await ev(`P().fidPay={day:'Mon Jan 01 2001',n:30};fidEarn(1)`); await sleep(100);
  check('a new day refills it quietly', await ev(`P().coins===133&&P().fidPay.n===1`));
  // a real pop-it board when the allowance is used up: it still pops and flips, it just pays nothing
  await ev(`P().fidPay={day:new Date().toDateString(),n:30};P().fid.pop='rainbow';P().fid.popShape='classic';show('fidget');setFidTab('popit')`); await sleep(250);
  const fa0=await ev('P().coins'), ff0=await ev('P().stats.flips'), fp0=await ev('P().stats.pops');
  await ev(`document.querySelectorAll('#popBoard .bub:not(.gone)').forEach(b=>popAt(b))`); await sleep(1300);
  check('with the allowance used, the pop-it still pops and flips (counted for stickers) but pays nothing', await ev(`P().stats.flips===${ff0}+1&&P().stats.pops>${fp0}&&P().coins===${fa0}`), [fa0,await ev('P().coins')]);
  check('the marble maze and games are not part of the allowance', await ev(`!/fidEarn/.test(String(mzWin||''))&&typeof earn==='function'`));
  await ev(`{const p=DB.profiles[0];p.fidPay='odd';normalize(p);}`);
  check('odd saved fidPay is made safe', await ev(`(()=>{const f=DB.profiles[0].fidPay;return f&&f.day===''&&f.n===0;})()`));
  check('save version 21 adds fidPay to older saves', await ev(`DB_VERSION>=21&&(()=>{const d={profiles:[{name:'Old'}]};MIGRATIONS[21](d);return d.profiles[0].fidPay.n===0;})()`));
  await ev(`P().fidPay={day:'',n:0};save();show('room')`);

  console.log('Extras (v1.37): Challenge puzzles, marble mazes, stickers');
  check('6 new Challenge puzzles c9-c14, added at the end', await ev(`CODE_PUZZLES.challenge.map(q=>q.id).join()==='c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11,c12,c13,c14'`));
  check('Code Lab puzzle ids are all different (44 puzzles)', await ev(`(()=>{const ids=CODE_LVL_IDS.flatMap(l=>CODE_PUZZLES[l].map(q=>q.id));return ids.length===44&&new Set(ids).size===44;})()`));
  check('every new answer fits its block limits and wins', await ev(`CODE_PUZZLES.challenge.slice(8).every(q=>q.sol.length<=codeMax('challenge',q)&&q.move.length<=(q.moveMax||CODE_LEVELS.challenge.moveMax)&&codeSim(q,[...q.sol],[...q.move]).end==='win')`));
  check('the new puzzles use new ideas: ⬅️/⬇️, 🔁 inside ✨, and ✨ mixed with other blocks', await ev(`(()=>{const c=CODE_PUZZLES.challenge;return /L/.test(c[8].move)&&/[234]/.test(c[9].move)&&c[12].sol.length>2&&/[234]Q/.test(c[13].move);})()`));
  check('6 new mazes m7-m12, added at the end, each 9 x 6', await ev(`MAZES.map(z=>z.id).join()==='m1,m2,m3,m4,m5,m6,m7,m8,m9,m10,m11,m12'&&MAZES.every(z=>z.map.length===6&&z.map.every(r=>r.length===9))`));
  check('the new mazes are longer than the first one', await ev(`MAZES.slice(6).every((z,i)=>mzPath(6+i).length>=mzPath(0).length)`), await ev(`MAZES.map((z,i)=>mzPath(i).length).join()`));
  check('3 new stickers: Marble Marathon (Fidgets), Level Collector and Code Master (Code & Brain)', await ev(`(a=>a.slice(a.indexOf('maze25:fidget'),a.indexOf('maze25:fidget')+3).join())(STICKERS.map(s=>s.id+':'+s.page))==='maze25:fidget,codeLevels:code,codeAll:code'`));
  check('Code Master needs every Code Lab puzzle; unknown ids in a save do not count', await ev(`(()=>{const s=STICKERS.find(x=>x.id==='codeAll'),p=JSON.parse(JSON.stringify(P()));p.code.solved=['e1','zz9','c99'];return stkNeed(s)===44&&stkHave(p,s)===1;})()`));
  check('Level Collector counts finished levels', await ev(`(()=>{const s=STICKERS.find(x=>x.id==='codeLevels'),p=JSON.parse(JSON.stringify(P()));p.code.solved=[...CODE_PUZZLES.easy,...CODE_PUZZLES.if].map(q=>q.id);return stkHave(p,s)===2&&!stkDone(p,s);})()`));
  check('Marble Marathon counts every maze rolled in, replays too', await ev(`(()=>{const s=STICKERS.find(x=>x.id==='maze25'),p=JSON.parse(JSON.stringify(P()));p.stats.mazes=25;return stkDone(p,s);})()`));
  // a v1.36 player who finished all 8 Challenge puzzles and all 6 mazes: the new ones pay, and the level bonus once more
  await ev(`P().code.solved=P().code.solved.filter(id=>!/^c(9|1[0-4])$/.test(id));P().maze.solved=MAZES.slice(0,6).map(z=>z.id);P().easy=false;save();show('code')`); await sleep(200);
  check('an old full Challenge level shows 8 of 14 solved', await ev(`P().code.level==='challenge'&&document.querySelector('#clHint').textContent.includes('8 of 14')`));
  await shot('X01-extras-challenge-list');
  const ex0=await ev('P().coins');
  for(let i=8;i<14;i++){await ev(`clSolve('challenge',${i})`);await sleep(2000);if(i===10)await shot('X02-extras-c11');await ev(`closeModal()`);}
  check('the 6 new puzzles pay 5 each, and finishing the level again pays its +10 once', await ev(`P().coins===${ex0}+6*5+10`), await ev('P().coins-'+ex0));
  await ev(`show('fidget');setFidTab('maze');closeModal();mzStart(6)`); await sleep(300); await shot('X03-extras-maze7');
  for(const i of [8,11]){await ev(`closeModal();mzStart(${i})`);await sleep(250);await shot('X0'+(i===8?4:5)+'-extras-maze'+(i+1));}
  const exm0=await ev('P().coins');
  for(let i=6;i<12;i++){await ev(`closeModal();mzStart(${i})`);const r=await ev('mzAuto()');check(`new maze ${i+1} (${await ev(`MAZES[${i}].name`)}) solved by tilting, never inside a wall`,r.done&&r.bad===0,r);}
  await sleep(900);
  check('the 6 new mazes pay 3 each, and every maze solved pays +5 once more', (await ev('P().coins'))===exm0+6*3+5, await ev(`P().coins-${exm0}`));
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true});
  await ev(`closeModal();mzStart(11)`); await sleep(300); await shot('X06-phone-maze12');
  check('phone: 12 maze buttons still leave a big board', await ev('MZ.geo.cs>=36'), await ev('MZ.geo.cs'));
  await send('Emulation.setDeviceMetricsOverride',{width:860,height:412,deviceScaleFactor:1,mobile:true});
  await ev(`mzStart(11)`); await sleep(300); await shot('X07-landscape-maze12');
  check('landscape: 12 maze buttons still leave a playable board', await ev('MZ.geo.cs>=24'), await ev('MZ.geo.cs'));
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true});
  await ev(`show('code');clOpen('challenge',10)`); await sleep(200); await shot('X08-phone-c11');
  check('phone: the 7-wide c11 board fits the screen', await ev(`document.querySelector('#clBoard').getBoundingClientRect().right<=innerWidth`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  const exB=await ev('JSON.stringify(DB)');
  await ev(`doRestore(${JSON.stringify(exB)})`); await sleep(400);
  check('a v1.37 backup keeps the new puzzles and mazes', await ev(`DB.profiles.some(p=>p.code.solved.includes('c14')&&p.maze.solved.includes('m12'))`));
  await ev(`closeModal();show('room')`);

  console.log('Music Maker (v1.38): the Loft keyboard');
  await ev(`closeModal();P().easy=false;show('room');goRoom(2)`); await sleep(400);
  check('the Loft has a 🎹 keyboard hotspot', await ev(`!!document.querySelector('#roomSvg [data-hot=music]')&&HOT_WORDS.music==='Music Maker'`));
  await shot('M01-loft-keyboard');
  await ev(`document.querySelector('#roomSvg [data-hot=music] rect').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(300);
  check('tapping the keyboard opens the Music Maker', await ev(`cur==='music'`));
  check('9 rows x 8 steps, with a label for each row', await ev(`document.querySelectorAll('#muGrid .mc').length===72&&document.querySelectorAll('#muGrid .mu-lab').length===9`));
  check('a new room starts with an empty grid, Soft sound, medium speed and 3 empty slots', await ev(`P().music.cur===MU_EMPTY&&muKit(P())==='soft'&&muSpeed(P())===1&&P().music.slots.every(s=>s===null)`));
  check('the melody notes are C D E G A only (they always sound nice together)', await ev(`MU_ROWS.filter(r=>r.m).map(r=>r.m%12).sort((a,b)=>a-b).join()==='0,2,4,7,9'`));
  check('the main loop rests while no loop is playing', await ev('!loopOn'));
  await ev(`window.muCell=(r,c)=>document.querySelector('#muGrid .mc[data-r="'+r+'"][data-c="'+c+'"]');
    window.muPt=(type,el,id)=>{const b=el.getBoundingClientRect();el.dispatchEvent(new PointerEvent(type,{pointerId:id,bubbles:true,clientX:b.left+b.width/2,clientY:b.top+b.height/2}));};
    window.muTap=(r,c)=>{const e=muCell(r,c);muPt('pointerdown',e,5);muPt('pointerup',e,5);}`);
  await ev(`muTap(8,0)`);
  check('tapping a square turns it on and saves it', await ev(`muCell(8,0).classList.contains('on')&&P().music.cur[64]==='1'`));
  await ev(`muTap(8,0)`);
  check('tapping it again turns it off', await ev(`!muCell(8,0).classList.contains('on')&&P().music.cur===MU_EMPTY`));
  // slide a finger along the drum row: every square it passes turns on
  await ev(`(()=>{const a=muCell(8,0);muPt('pointerdown',a,6);for(let c=1;c<4;c++){const b=muCell(8,c).getBoundingClientRect();a.parentNode.dispatchEvent(new PointerEvent('pointermove',{pointerId:6,bubbles:true,clientX:b.left+b.width/2,clientY:b.top+b.height/2}));}muPt('pointerup',a,6);})()`);
  check('sliding a finger paints a row (4 drums)', await ev(`P().music.cur.slice(64,72)==='11110000'`), await ev(`P().music.cur.slice(64,72)`));
  await ev(`muTap(2,0);muTap(1,4);muTap(0,6)`);
  const mu0=await ev('P().coins');
  await ev(`document.querySelector('#muPlay').click()`); await sleep(100);
  check('▶️ Play starts the loop and wakes the main loop', await ev(`MU.playing&&loopOn&&document.querySelector('#muPlay').textContent.includes('Stop')`));
  await ev(`DB.settings.music=true;startMusic()`);
  check('the room music stays quiet while her loop plays', await ev(`musicTimer===null`));
  const seen=await ev(`new Promise(res=>{const s=new Set();const iv=setInterval(()=>s.add(MU.shown),40);setTimeout(()=>{clearInterval(iv);res([...s].filter(x=>x>=0).length);},2600);})`);
  check('the light moves along all 8 steps while it plays', seen===8, seen);
  await shot('M02-music-playing');
  check('only one step is lit at a time', await ev(`new Set([...document.querySelectorAll('#muGrid .mc.now')].map(e=>e.dataset.c)).size<=1`));
  await ev(`document.querySelector('#muSpeed [data-speed="2"]').click();document.querySelector('#muKit [data-kit=dreamy]').click()`);
  check('speed and sound kit are saved', await ev(`P().music.speed===2&&P().music.kit==='dreamy'&&document.querySelector('#muKit [data-kit=dreamy]').classList.contains('on')`));
  await ev(`document.querySelector('#muPlay').click()`); await sleep(150);
  check('⏹️ Stop stops it, clears the light and lets the main loop rest', await ev(`!MU.playing&&!document.querySelector('#muGrid .mc.now')&&!loopOn`));
  await ev(`DB.settings.music=false;stopMusic()`);
  await ev(`document.querySelector('#muPlay').click()`); await sleep(100); await ev(`show('room')`); await sleep(100);
  check('leaving the screen stops the loop', await ev(`!MU.playing`));
  await ev(`show('music')`); await sleep(150);
  check('the grid is still there when she comes back', await ev(`document.querySelectorAll('#muGrid .mc.on').length===7`));
  // saving loops: +3 for a new loop, 3 times a day
  await ev(`P().music.pay={day:'',n:0};muUse(MU_EMPTY);muTap(8,0);document.querySelector('#muSlots [data-slot="0"]').click()`); await sleep(100);
  check('a loop with fewer than 3 notes is not saved', await ev(`P().music.slots[0]===null`));
  await ev(`muTap(8,2);muTap(3,1);document.querySelector('#muSlots [data-slot="0"]').click()`); await sleep(150);
  check('saving a new loop in an empty slot pays 3 coins', await ev(`!!P().music.slots[0]&&P().music.slots[0].g===P().music.cur&&P().coins===${mu0}+3&&P().music.pay.n===1`), await ev(`P().coins-${mu0}`));
  check('a saved slot shows a little picture of the loop', await ev(`!!document.querySelector('#muSlots [data-slot="0"].full svg')`));
  await ev(`document.querySelector('#muSlots [data-slot="0"]').click()`); await sleep(100);
  check('tapping a full slot offers Load and Save', await ev(`(t=>t.includes('Load')&&t.includes('Save'))(document.querySelector('#modalBtns').textContent)`));
  await shot('M03-music-slot');
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes('Save')).click()`); await sleep(100);
  check('saving the same loop again pays nothing', await ev(`P().coins===${mu0}+3`));
  await ev(`muTap(4,5);document.querySelector('#muSlots [data-slot="1"]').click()`); await sleep(100);
  await ev(`muTap(4,6);document.querySelector('#muSlots [data-slot="2"]').click()`); await sleep(100);
  check('3 new loops pay 3 each', await ev(`P().coins===${mu0}+9&&P().music.pay.n===3`), await ev(`P().coins-${mu0}`));
  await ev(`muTap(4,7);document.querySelector('#muSlots [data-slot="2"]').click()`); await sleep(100);
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes('Save')).click()`); await sleep(100);
  check('after 3 a day, saving still works but pays nothing (with a gentle note)', await ev(`P().coins===${mu0}+9&&P().music.slots[2].g===P().music.cur&&document.querySelector('#toast').textContent.includes('done for today')`));
  await ev(`P().music.pay.day='Mon Jan 01 2001';muTap(0,0);document.querySelector('#muSlots [data-slot="1"]').click()`); await sleep(100);
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes('Save')).click()`); await sleep(100);
  check('a new day pays again', await ev(`P().coins===${mu0}+12&&P().music.pay.n===1`));
  const slot0=await ev(`JSON.stringify(P().music.slots[0])`);
  await ev(`document.querySelector('#muClear').click()`); await sleep(100); await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(100);
  check('🗑️ Clear empties the grid (saved loops stay)', await ev(`P().music.cur===MU_EMPTY&&!document.querySelector('#muGrid .mc.on')&&P().music.slots.every(Boolean)`));
  await ev(`P().music.kit='chip';P().music.speed=0;document.querySelector('#muSlots [data-slot="0"]').click()`); await sleep(100);
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes('Load')).click()`); await sleep(100);
  check('▶ Load puts a saved loop back, with its sound and speed', await ev(`(s=>P().music.cur===s.g&&P().music.kit===s.kit&&P().music.speed===s.speed&&document.querySelectorAll('#muGrid .mc.on').length===(s.g.match(/1/g)||[]).length)(${slot0})`));
  await ev(`muTap(5,7);document.querySelector('#muIdeas').click()`); await sleep(100);
  check('🎁 Ideas offers 3 ready-made loops', await ev(`MU_IDEAS.length===3&&MU_IDEAS.every(z=>z.rows.length===9&&z.rows.every(r=>/^[01]{8}$/.test(r))&&MU_KITS[z.kit]&&MU_SPEEDS[z.speed])&&document.querySelectorAll('#modalBtns button').length===4`));
  await shot('M04-music-ideas');
  await ev(`document.querySelector('#modalBtns button').click()`); await sleep(100);
  check('loading over a loop that is not saved asks first', await ev(`document.querySelector('#modalTitle').textContent.includes('not saved')&&P().music.cur[5*8+7]==='1'`));
  await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(100);
  check('…and Load anyway loads the idea (Bat Bop, Chip, fast)', await ev(`P().music.cur===MU_IDEAS[0].rows.join('')&&P().music.kit==='chip'&&P().music.speed===2`));
  await ev(`P().music.slots[0]={g:P().music.cur,kit:'chip',speed:2};document.querySelector('#muIdeas').click()`); await sleep(100); await ev(`document.querySelectorAll('#modalBtns button')[2].click()`); await sleep(100);
  check('an idea loads straight away when nothing would be lost', await ev(`P().music.cur===MU_IDEAS[2].rows.join('')`));
  await shot('M05-music-idea');
  check('Read to me knows the Play and slot buttons', await ev(`speakLabel(document.querySelector('#muPlay'))==='Play'&&/Loop 1/.test(speakLabel(document.querySelector('#muSlots [data-slot="0"]')))`), await ev(`speakLabel(document.querySelector('#muPlay'))`));
  check('the 🎹 Beat Maker sticker for saving a loop', await ev(`(s=>stkDone(P(),s)&&s.page==='stage'&&!stkDone(Object.assign({},P(),{music:{slots:[null,null,null]}}),s))(STICKERS.find(s=>s.id==='beat1'))`));
  await ev(`closeModal()`);
  check('Android Back goes from the Music Maker to the room', await ev(`androidBack()&&cur==='room'`));
  await ev(`show('music');document.querySelector('#muPlay').click()`); await sleep(100);
  await ev(`Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))`); await sleep(100);
  check('switching away from the app stops the loop', await ev(`!MU.playing`));
  // phone sizes
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true});
  await ev(`renderMusic()`); await sleep(250); await shot('M06-phone-music');
  check('phone: the whole grid fits on screen with squares 36 px or more', await ev(`(()=>{const g=document.querySelector('#muGrid').getBoundingClientRect(),c=muCell(0,0).getBoundingClientRect();return g.right<=innerWidth&&g.bottom<=innerHeight&&c.width>=36;})()`), await ev(`muCell(0,0).getBoundingClientRect().width`));
  check('phone: the controls fit below the grid', await ev(`document.querySelector('#muIdeas').getBoundingClientRect().bottom<=innerHeight`));
  await send('Emulation.setDeviceMetricsOverride',{width:860,height:412,deviceScaleFactor:1,mobile:true});
  await ev(`renderMusic()`); await sleep(250); await shot('M07-landscape-music');
  check('landscape: the grid fits on screen', await ev(`(()=>{const g=document.querySelector('#muGrid').getBoundingClientRect();return g.right<=innerWidth&&g.bottom<=innerHeight&&g.top>=0;})()`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`renderMusic()`); await sleep(200);
  check('tablet: squares are big (60 px or more)', await ev(`muCell(0,0).getBoundingClientRect().width>=60`), await ev(`muCell(0,0).getBoundingClientRect().width`));
  // save data
  check('save version 22 adds music to older saves', await ev(`DB_VERSION>=22&&(()=>{const d={profiles:[{name:'Old'}]};MIGRATIONS[22](d);return typeof d.profiles[0].music==='object';})()`));
  await ev(`{const p=DB.profiles[0];p.music={kit:5,speed:9,cur:'012',slots:[{g:'1'},'x',{g:MU_EMPTY.replace('0','1'),kit:'chip',speed:0},7],pay:'odd'};normalize(p);}`);
  check('odd saved music is made safe', await ev(`(m=>m.kit==='soft'&&m.speed===1&&m.cur===MU_EMPTY&&m.slots.length===3&&m.slots[0]===null&&m.slots[1]===null&&m.slots[2].kit==='chip'&&m.pay.n===0)(DB.profiles[0].music)`));
  const muOld=await ev(`(()=>{const d=JSON.parse(JSON.stringify(DB));d.version=21;d.profiles.forEach(p=>delete p.music);return JSON.stringify(d);})()`);
  await ev(`doRestore(${JSON.stringify(muOld)})`); await sleep(400);
  check('a v1.37 backup restores with an empty Music Maker', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.music.cur===MU_EMPTY&&p.music.slots.every(s=>s===null))`));
  await ev(`closeModal()`);
  const muNew=await ev(`(()=>{const d=JSON.parse(JSON.stringify(DB));d.profiles[0].music.slots[1]={g:MU_IDEAS[1].rows.join(''),kit:'soft',speed:1};return JSON.stringify(d);})()`);
  await ev(`doRestore(${JSON.stringify(muNew)})`); await sleep(400);
  check('a v1.38 backup keeps saved loops', await ev(`DB.profiles[0].music.slots[1].g===MU_IDEAS[1].rows.join('')`));
  await ev(`closeModal();P().easy=true;show('room');goRoom(2)`); await sleep(300); await shot('M08-loft-keyboard-easy');
  check('Easy mode shows the 🎹 Music sign', await ev(`[...document.querySelectorAll('#roomSvg .sign')].some(s=>s.textContent.includes('Music'))`));
  await ev(`P().easy=false;goRoom(1);show('room')`);

  console.log('Room depth (v1.39): front to back by floor position');
  await ev(`window.dIx=el=>[...roomSvg.children].indexOf(el&&el.closest('#roomSvg > *'));window.dU=u=>roomSvg.querySelector('.deco[data-uid="'+u+'"]');window.dH=h=>roomSvg.querySelector('[data-hot="'+h+'"]');`);
  await ev(`(()=>{const p=P();closeModal();P().easy=false;show('room');goRoom(2);p.room2.items=p.room2.items.filter(i=>!/^dp/.test(i.uid));
    p.room2.items.push({uid:'dpFront',type:'plant',x:200,y:660,placed:true},{uid:'dpBack',type:'lava',x:200,y:540,placed:true},{uid:'dpMid',type:'plant',x:520,y:598,placed:true});renderRoom();})()`); await sleep(150);
  check('the Loft keyboard is drawn in front of a thing placed behind it (higher up the floor)', await ev(`dIx(dU('dpBack'))<dIx(dH('music'))`));
  check('…and behind a thing placed in front of it (lower on the floor), even if that one was placed first', await ev(`dIx(dU('dpFront'))>dIx(dH('music'))`));
  check('the buddy joins the same order: in front of things behind, behind things in front', await ev(`dIx(dU('dpMid'))<dIx(document.querySelector('#mascotG'))&&dIx(document.querySelector('#mascotG'))<dIx(dU('dpFront'))`));
  check('the code desk is in the order too', await ev(`dIx(dU('dpBack'))<dIx(dH('code'))&&dIx(dH('code'))<dIx(dU('dpFront'))`));
  await shot('N01-depth-loft');
  await ev(`P().room2.items.push(P().room2.items.splice(P().room2.items.findIndex(i=>i.uid==='dpBack'),1)[0]);renderRoom()`); await sleep(100);
  check('touching a thing no longer pulls it in front of things lower on the floor', await ev(`dIx(dU('dpBack'))<dIx(dH('music'))&&dIx(dU('dpBack'))<dIx(dU('dpFront'))`));
  check('wall things (the round window, the Stage sign) stay behind everything standing', await ev(`dIx(roomSvg.querySelector('[data-hot=stage]'))<dIx(dU('dpBack'))`));
  // decorating: built-ins, the buddy, the pet and gifts fade and let taps through
  await ev(`enterDecorate()`); await sleep(150);
  check('while decorating, the keyboard, desk and buddy fade', await ev(`[dH('music'),dH('code'),document.querySelector('#mascotG')].every(e=>getComputedStyle(e.closest('.fixed')).opacity==='0.35')`));
  await ev(`(()=>{const it=P().room2.items.find(i=>i.uid==='dpBack');it.x=196;it.y=560;P().room2.items.find(i=>i.uid==='dpFront').x=640;renderRoom();})()`); await sleep(100);
  check('a thing hidden behind the keyboard can still be grabbed while decorating', await ev(`(()=>{const r=dU('dpBack').getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width/2,r.top+r.height*0.75);return !!e&&!!e.closest('.deco[data-uid="dpBack"]');})()`));
  await shot('N02-depth-decorating');
  await ev(`exitDecorate()`); await sleep(150);
  check('after Done the furniture looks normal again and can be tapped', await ev(`getComputedStyle(dH('music').closest('.fixed')).opacity==='1'&&(()=>{const r=dH('music').querySelector('rect').getBoundingClientRect(),e=document.elementFromPoint(r.left+30,r.top+10);return !!e&&!!e.closest('[data-hot=music]');})()`));
  // her room and the Backyard
  await ev(`(()=>{const p=P();goRoom(1);p.room.items.push({uid:'dpCl',type:'plant',x:860,y:520,placed:true},{uid:'dpCl2',type:'plant',x:860,y:640,placed:true});renderRoom();})()`); await sleep(100);
  check('her room: the closet hides a thing behind it and is hidden by a thing in front', await ev(`dIx(dU('dpCl'))<dIx(dH('closet'))&&dIx(dH('closet'))<dIx(dU('dpCl2'))&&dIx(dH('desk'))>dIx(dU('dpCl'))`));
  await shot('N03-depth-room');
  await ev(`(()=>{const p=P();goRoom(3);p.room3.items.push({uid:'dpY',type:'plant',x:780,y:560,placed:true},{uid:'dpY2',type:'plant',x:780,y:660,placed:true});renderRoom();})()`); await sleep(100);
  check('Backyard: the easel and the tree are in the order too', await ev(`dIx(dU('dpY'))<dIx(dH('brain'))&&dIx(dH('brain'))<dIx(dU('dpY2'))&&dIx(roomSvg.querySelector('[data-tree]'))<dIx(dU('dpY2'))`));
  check('the furniture functions still give the whole picture as text (for checks and snapshots)', await ev(`furniture().includes('data-hot="closet"')&&loftFurniture().includes('data-hot="music"')&&yardFurniture().includes('data-piece="shed"')&&typeof loftFurniture(true).floor[0].y==='number'`));
  await shot('N04-depth-yard');
  await ev(`(()=>{const p=P();[p.room,p.room2,p.room3].forEach(r=>{r.items=r.items.filter(i=>!/^dp/.test(i.uid));});save();goRoom(1);})()`);

  console.log('Studio + getting around (v1.40)');
  await ev(`(()=>{closeModal();exitDecorate(true);stkPaused=true;const p=P();p.easy=false;applyEasy();p.night={};p.coins=100;p.dream='';themePick.shop='all';p.room4={wall:'',floor:'',items:[]};save();show('room');goRoom(1);})()`); await sleep(200);
  const stTabs=()=>ev(`[...document.querySelectorAll('#roomTabs [data-go]')].map(b=>b.className.split('rt-')[1]+':'+b.dataset.go).join('|')`);
  check('her room: ⬆️ Loft, ⬅️ Backyard and ➡️ Studio tabs, each with a spoken name', (await stTabs())==='up:2|left:3|right:4'&&await ev(`[...document.querySelectorAll('#roomTabs .rtab')].every(b=>/^Go to the /.test(b.getAttribute('aria-label')))`), await stTabs());
  check('the tabs are at least 48 px and sit inside the screen', await ev(`[...document.querySelectorAll('#roomTabs .rtab')].every(b=>{const r=b.getBoundingClientRect();return r.width>=48&&r.height>=48&&r.left>=0&&r.right<=innerWidth;})`));
  check('the left tab is clear of the 🌙 and 📷 buttons', await ev(`(()=>{const t=document.querySelector('.rt-left').getBoundingClientRect(),s=document.querySelector('#roomSnapBtn').getBoundingClientRect();return t.top>=s.bottom;})()`));
  await shot('S01-room-tabs');
  await ev(`document.querySelector('#roomTabs [data-go="4"]').click()`); await sleep(250);
  check('➡️ opens the Studio', await ev(`roomNo===4&&cur==='room'&&document.querySelector('#roomTitle').textContent.endsWith("'s Studio")`));
  check('a first visit gives it her room color wall and the wood floor', await ev(`(()=>{const p=P(),r=ROOM_START[p.color];return p.room4.wall===(r&&WALLS[r[0]]?r[0]:'lavender')&&p.room4.floor==='wood'&&(p.owned.includes('wall:'+p.room4.wall)||!WALLS[p.room4.wall].price);})()`));
  check('nothing is built in: no furniture to tap, only the buddy and the pet', await ev(`[...document.querySelectorAll('#roomSvg [data-hot]')].every(e=>['pet','gift','visitor'].includes(e.dataset.hot))&&!!document.querySelector('#mascotG')`));
  check('Fuzzy says hello while the Studio is empty', await ev(`!!document.querySelector('#bubble')&&document.querySelector('#bubble').textContent.includes('Studio')`));
  check('the Studio has one ⬅️ tab back to her room', (await stTabs())==='left:1'&&await ev(`document.querySelector('.rt-left').getAttribute('aria-label')==='Back to my room'`), await stTabs());
  await shot('S02-studio-empty');
  // decorating
  await ev(`enterDecorate()`); await sleep(150);
  check('the tabs hide while decorating', (await stTabs())==='');
  await ev(`document.querySelector('[data-dt=colors]').click()`); await sleep(100);
  check('🎨 Colors says there is nothing built in to color', await ev(`document.querySelector('#decoGrid .empty').textContent.includes('nothing to color')`));
  await ev(`document.querySelector('[data-dt=shop]').click()`); await sleep(150);
  check('the Shop lists the Built-in Shelf first, marked Free', await ev(`(()=>{const t=document.querySelector('#decoGrid [data-buy]');return t.dataset.buy==='builtShelf'&&t.querySelector('.tp').textContent==='Free';})()`));
  await ev(`document.querySelector('#decoGrid [data-buy=builtShelf]').click()`); await sleep(150);
  check('it goes straight into the Studio, with no question and no coins taken', await ev(`document.querySelector('#modal').classList.contains('hidden')&&P().coins===100&&P().room4.items.some(i=>i.type==='builtShelf'&&i.placed)`));
  check('it is also listed first in the other rooms', await ev(`(()=>{goRoom(2);const t=document.querySelector('#decoGrid [data-buy]');goRoom(4);return t.dataset.buy==='builtShelf';})()`));
  check('it has a theme chip (☁️ Cute)', await ev(`themesOf('decor:builtShelf',DECOR.builtShelf).includes('cute')`));
  await ev(`(()=>{const p=P(),s=p.room4.items.find(i=>i.type==='builtShelf');s.x=500;s.y=260;const it={uid:'stP',type:'plant',x:600,y:228,placed:true};p.room4.items.push(it);window._snap=snapToShelf(it);renderRoom();})()`); await sleep(100);
  check('a plant dropped near it sits on it', await ev(`window._snap===true&&P().room4.items.find(i=>i.uid==='stP').y===260-44`));
  check('buying in the Studio leaves the other rooms alone', await ev(`!P().room.items.some(i=>i.type==='builtShelf')&&!P().room2.items.some(i=>i.type==='builtShelf')`));
  await ev(`for(const k of ['lava','plant','disco','eggChair'])P().room4.items.push(Object.assign({uid:'st'+k,type:k,placed:true},spot(k)));exitDecorate()`); await sleep(150);
  await shot('S03-studio-decorated');
  check('5 things in the Studio earn ✨ Studio Star', await ev(`stkDone(P(),STICKERS.find(s=>s.id==='studio5'))&&STICKERS.find(s=>s.id==='studio5').page==='room'`));
  check('allItems and rooms() include the Studio', await ev(`rooms(P()).length===4&&allItems(P()).some(i=>i.uid==='stP')`));
  // night mode: the Studio has no window, so no Loft window appears
  await ev(`document.querySelector('#nightBtn').click()`); await sleep(150);
  check('🌙 works in the Studio, without the Loft window', await ev(`P().night['4']===true&&!!document.querySelector('#roomSvg .night')&&!document.querySelector('#roomSvg circle[cx="340"][cy="140"]')`));
  await shot('S04-studio-night');
  await ev(`document.querySelector('#nightBtn').click()`); await sleep(100);
  // night stars: the Big Dipper (7 stars, no lines) in the Backyard sky; no stars on the indoor walls
  for(const n of [1,2,3,4]){
    await ev(`(()=>{const p=P();p.night={};p.night[${n}]=true;goRoom(${n});})()`); await sleep(150); await shot('S04-night-'+n);
    if(n===3){
      check('Backyard at night: the Big Dipper, 7 stars in the sky and no lines', await ev(`document.querySelectorAll('#roomSvg [data-dipper] path').length===7&&dipperPts().every(([x,y])=>x>=300&&x<=820&&y>=10&&y<=300)&&!document.querySelector('#roomSvg .night path[stroke]')`));
    } else {
      check(`room ${n} at night: no stars on the wall`, await ev(`!document.querySelector('#roomSvg [data-dipper]')&&!document.querySelector('#roomSvg [fill="#c8ffb0"]')`));
    }
  }
  await ev(`(()=>{P().night={};save();goRoom(4);})()`); await sleep(100);
  check('the Studio has its own layouts', await ev(`Array.isArray(P().presets[4])&&P().presets[4].length===3&&(()=>{enterDecorate();document.querySelector('[data-dt=layouts]').click();const n=document.querySelectorAll('#decoGrid *').length;exitDecorate();return n>0;})()`));
  // 🗺️ the map
  await ev(`document.querySelector('#mapBtn').click()`); await sleep(150);
  check('🗺️ shows every room, the Studio marked ⭐ Here', await ev(`document.querySelectorAll('#modalBody [data-map]').length===4&&document.querySelector('#modalBody .hm-room.on').dataset.map==='4'&&document.querySelector('#modalBody .hm-room.on').textContent.includes('Here')`));
  check('the map buttons are big enough to tap', await ev(`[...document.querySelectorAll('#modalBody .hm-room')].every(b=>{const r=b.getBoundingClientRect();return r.width>=48&&r.height>=48;})`));
  await shot('S05-map');
  await ev(`document.querySelector('[data-map="3"]').click()`); await sleep(200);
  check('tapping the Backyard on the map goes there and closes the map', await ev(`roomNo===3&&document.querySelector('#modal').classList.contains('hidden')`));
  await ev(`document.querySelector('#mapBtn').click()`); await sleep(100); await ev(`document.querySelector('[data-map="3"]').click()`); await sleep(100);
  check('tapping the room she is in just closes the map', await ev(`roomNo===3&&document.querySelector('#modal').classList.contains('hidden')`));
  check('Android Back from the Backyard goes to her room', await ev(`window.androidBack()===true&&cur==='room'&&roomNo===1`));
  await ev(`goRoom(4)`); await sleep(100);
  check('Android Back from the Studio goes to her room, then the profiles', await ev(`window.androidBack()===true&&roomNo===1&&cur==='room'&&window.androidBack()===true&&cur==='profiles'`));
  await ev(`enterRoom()`); await sleep(200);
  // the window is a shortcut outside
  await ev(`document.querySelector('#roomSvg [data-hot=window]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(200);
  check('her window is a shortcut to the Backyard (Soccer is at the goal)', await ev(`cur==='room'&&roomNo===3`));
  check('Read to me calls the window "Backyard"', await ev(`HOT_WORDS.window==='Backyard'`));
  await ev(`goRoom(1);P().easy=true;applyEasy();renderRoom()`); await sleep(150);
  check('Easy mode: the window sign says Outside, and the tabs get bigger', await ev(`[...document.querySelectorAll('#roomSvg .sign')].some(s=>s.textContent.includes('Outside'))&&document.querySelector('.rtab').getBoundingClientRect().width>=68`));
  await shot('S06-room-tabs-easy');
  await ev(`P().easy=false;applyEasy();renderRoom()`);
  // phone sizes
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await sleep(300);
  check('phone: the top bar fits, with 🗺️ Map as an icon', await ev(`(()=>{const t=document.querySelector('#scr-room .topbar'),m=document.querySelector('#mapBtn').getBoundingClientRect();return t.scrollWidth<=t.clientWidth&&m.right<=innerWidth&&m.width>=48;})()`));
  check('phone: the tabs sit inside the screen', await ev(`[...document.querySelectorAll('#roomTabs .rtab')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;})`));
  // upright phone: the picture is a band in the middle; the tabs must sit in the empty space, not on the room
  const offPic=()=>ev(`(()=>{const s=document.querySelector('#roomSvg').getBoundingClientRect(),h=Math.min(s.height,s.width*0.7),top=s.top+(s.height-h)/2,bot=top+h;
    return [...document.querySelectorAll('#roomTabs .rtab')].every(b=>{const r=b.getBoundingClientRect();return r.bottom<=top+1||r.top>=bot-1;});})()`);
  check('phone: the arrow tabs sit above or below the room picture, not on it', await offPic());
  await ev(`goRoom(3)`); await sleep(150);
  check('phone: the Backyard\'s ➡️ tab is off the picture too', await offPic());
  await ev(`goRoom(1);P().easy=true;applyEasy();renderRoom()`); await sleep(150);
  check('phone, Easy mode: the bigger tabs are still off the picture and 48 px or more', await offPic()&&await ev(`[...document.querySelectorAll('#roomTabs .rtab')].every(b=>b.getBoundingClientRect().height>=48)`));
  await ev(`P().easy=false;applyEasy();renderRoom()`); await sleep(150);
  await ev(`document.querySelector('#mascotG')&&document.querySelector('#mascotG').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(150);
  check('phone: the emote bar does not cover the tabs', await ev(`(()=>{const e=document.querySelector('#emoteBar');if(e.classList.contains('hidden'))return true;const a=e.getBoundingClientRect();return [...document.querySelectorAll('#roomTabs .rtab')].every(t=>{const b=t.getBoundingClientRect();return a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top;});})()`));
  await shot('S07-phone-tabs');
  await ev(`emoteBar(false)`);
  await ev(`document.querySelector('#mapBtn').click()`); await sleep(150); await shot('S08-phone-map');
  check('phone: the map fits the screen', await ev(`[...document.querySelectorAll('#modalBody .hm-room')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})`));
  await ev(`closeModal()`);
  await send('Emulation.setDeviceMetricsOverride',{width:860,height:412,deviceScaleFactor:1,mobile:true}); await sleep(300); await shot('S09-phone-landscape-tabs');
  check('phone landscape: the tabs do not cover each other or the 📷 button', await ev(`(()=>{const B=[...document.querySelectorAll('#roomTabs .rtab'),document.querySelector('#roomSnapBtn')].map(b=>b.getBoundingClientRect());return B.every((a,i)=>B.every((b,j)=>i===j||a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top));})()`));
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false}); await sleep(200);
  // save data
  const v39=await ev(`JSON.stringify(Object.assign({},DB,{version:22,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.room4;q.presets={1:q.presets[1],2:q.presets[2],3:q.presets[3]};return q;})}))`);
  const v40=await ev(`JSON.stringify(DB)`);
  await ev(`doRestore(${JSON.stringify(v39)})`); await sleep(300);
  check('a v1.39 backup restores with an empty Studio (save version 23 or later)', await ev(`DB.version===DB_VERSION&&DB_VERSION>=23&&DB.profiles.every(p=>p.room4&&p.room4.wall===''&&p.room4.items.length===0&&p.presets[4].length===3)`));
  await ev(`doRestore(${JSON.stringify(v40)})`); await sleep(300);
  check('a v1.40 backup keeps the Studio and its things', await ev(`DB.profiles.some(p=>p.room4.wall&&p.room4.items.some(i=>i.type==='builtShelf'))`));
  await ev(`closeModal();{const p=DB.profiles[0];p.room4=['oops'];p.night={'4':true,'9':true};normalize(p);}`);
  check('odd Studio data is made safe', await ev(`(()=>{const p=DB.profiles[0];return !Array.isArray(p.room4)&&p.room4.wall===''&&Array.isArray(p.room4.items)&&p.night['4']===true&&!p.night['9'];})()`));
  await ev(`(()=>{const p=DB.profiles[0];p.night={};DB.activeId=p.id;save();enterRoom();goRoom(4);})()`); await sleep(200);
  check('…and a visit sets it up again', await ev(`!!P().room4.wall&&P().room4.floor==='wood'&&!!document.querySelector('#roomSvg rect')`));
  await ev(`(()=>{const p=P();p.room4.items=p.room4.items.filter(i=>!/^st/.test(i.uid)&&i.type!=='builtShelf');save();goRoom(1);})()`);

  console.log('Visitors & wishes (v1.41)');
  // A helper in the page that makes the room on screen (and her outfit) meet one wish, using only things the Shop sells.
  await ev(`window.vMeet=w=>{const p=P();for(const pt of w.parts){
      if(pt===vYard){goRoom(3);continue;}
      const R=curRoom(p);
      if(pt===vRug)R.items.push({uid:'vt'+uid(),type:'starRug',x:500,y:660,placed:true});
      else if(pt===vPosters){for(let i=0;i<2;i++)R.items.push({uid:'vt'+uid(),type:'poster',art:'none',x:300+i*200,y:220,placed:true});}
      else if(pt===vGlow)R.items.push({uid:'vt'+uid(),type:'lava',x:300,y:600,placed:true});
      else if(pt===vNight)p.night[roomNo]=true;
      else if(pt.wear){let n=0;for(const c of Object.keys(CLOSET)){if(['kind','fur','face'].includes(c)||n>=pt.n)continue;
          const it=CLOSET[c].items.find(i=>i.id!=='none'&&themesOf(c+':'+i.id,i).some(t=>pt.th.includes(t)));if(it){p.look[c]=it.id;n++;}}}
      else {const ks=Object.keys(DECOR).filter(k=>{const d=DECOR[k];return !d.art&&!d.award&&!d.dream&&themesOf('decor:'+k,d).some(t=>pt.th.includes(t));}).slice(0,pt.n);
        ks.forEach((k,i)=>R.items.push({uid:'vt'+uid(),type:k,x:200+i*150,y:DECOR[k].wall?220:600,placed:true}));}
    }};
    window.vClear=()=>{const p=P();rooms(p).forEach(R=>{R.items=R.items.filter(i=>!/^vt/.test(i.uid));});p.night={};p.look=Object.assign({},DEFAULT_LOOK,{kind:p.look.kind,face:p.look.face,fur:p.look.fur});};`);
  await ev(`(()=>{closeModal();exitDecorate(true);stkPaused=true;const p=P();p.easy=false;applyEasy();p.coins=100;p.visit={cur:'',day:'',done:[]};
    window._vKeep=rooms(p).map(R=>R.items);rooms(p).forEach(R=>{R.items=[];});vClear();save();show('room');goRoom(1);})()`); await sleep(500);
  check('18 wishes, 3 for each of the 6 friends, with different ids', await ev(`VISIT_WISHES.length===18&&new Set(VISIT_WISHES.map(w=>w.id)).size===18&&Object.keys(VISIT_FRIENDS).every(f=>VISIT_WISHES.filter(w=>w.who===f).length===3)`));
  check('the first friend knocks straight away (Mochi)', await ev(`P().visit.cur==='mochi1'&&!!document.querySelector('#roomSvg .visitor[data-hot=visitor]')`));
  check('…and the friend is in every room', await ev(`[2,3,4,1].every(n=>{goRoom(n);return !!document.querySelector('#roomSvg .visitor');})`));
  check('the friend is a little picture (no #fuzz filter) and moves in steps', await ev(`!document.querySelector('#roomSvg .visitor [filter]')&&/^steps/.test(getComputedStyle(document.querySelector('#roomSvg .visitor .an-bob')).animationTimingFunction)`));
  check('Read to me knows the visitor', await ev(`speakLabel(document.querySelector('#roomSvg .visitor'))==='A friend is visiting'`));
  await shot('V01-visitor');
  // every wish: not met in an empty room, met once its things are there (all for sale, no big dreams)
  const wishBad=await ev(`(()=>{const out=[];for(const w of VISIT_WISHES){vClear();goRoom(4);
      if(vMet(P(),w)){out.push(w.id+': met with nothing');continue;}
      vMeet(w); if(!vMet(P(),w))out.push(w.id+': not met: '+JSON.stringify(vPartsDone(P(),w).map(x=>x.have)));
      for(const pt of w.parts.filter(x=>x.th&&!x.wear)){const n=Object.keys(DECOR).filter(k=>{const d=DECOR[k];return !d.art&&!d.award&&!d.dream&&themesOf('decor:'+k,d).some(t=>pt.th.includes(t));}).length;if(n<pt.n+1)out.push(w.id+': only '+n+' to pick from');}
      goRoom(1);} vClear();return out;})()`);
  check('every wish needs something, and can be met with things from the Shop or the Closet', wishBad.length===0, wishBad);
  // the card
  await ev(`goRoom(1);document.querySelector('#roomSvg .visitor').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(200);
  check('tapping the friend opens the wish card', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&/Mochi/.test(document.querySelector('#modalTitle').textContent)&&document.querySelectorAll('#modalBody .vs-row').length===2`));
  check('the card\'s lines and buttons are big enough to tap', await ev(`[...document.querySelectorAll('#modalBody .vs-row,#modalBody .vs-x,#modalBtns .btn')].every(b=>{const r=b.getBoundingClientRect();return r.height>=48;})`));
  await shot('V02-wish-card');
  await ev(`[...document.querySelectorAll('#modalBtns .btn')].find(b=>/Show me/.test(b.textContent)).click()`); await sleep(150);
  check('Show me! before it is done: a kind "Almost!", the card stays open, no coins', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&/Almost!/.test(document.querySelector('.vs-msg').textContent)&&P().coins===100&&P().visit.cur==='mochi1'`));
  // 💡 help from a line: the Shop with the right chip
  await ev(`document.querySelector('#modalBody [data-vs-help="0"]').click()`); await sleep(200);
  check('💡 a "things" line opens the Shop with that theme chip picked', await ev(`decorating&&decoTab==='shop'&&themePick.shop==='cute'&&!!document.querySelector('#decoGrid [data-theme=cute].on')&&document.querySelector('#modal').classList.contains('hidden')`));
  await ev(`exitDecorate()`);
  // meet it and show
  await ev(`vMeet(vWishOf('mochi1'));renderRoom();visitTap()`); await sleep(150);
  check('…the card ticks the lines that are done', await ev(`document.querySelectorAll('#modalBody .vs-row.ok').length===2`));
  await ev(`[...document.querySelectorAll('#modalBtns .btn')].find(b=>/Show me/.test(b.textContent)).click()`); await sleep(250);
  check('done: +5 coins, the wish is saved, and a thank-you', await ev(`P().coins===105&&P().visit.done.join()==='mochi1'&&P().visit.cur===''&&P().visit.day===new Date().toDateString()&&/loves it/.test(document.querySelector('#modalTitle').textContent)`));
  await shot('V03-thank-you');
  await ev(`closeModal();renderRoom()`);
  check('no new friend the same day', await ev(`P().visit.cur===''&&!document.querySelector('#roomSvg .visitor')`));
  await ev(`P().visit.day='Mon Jan 01 2001';renderRoom()`); await sleep(100);
  check('the next day, the next friend knocks (Boo)', await ev(`P().visit.cur==='boo1'&&!!document.querySelector('#roomSvg .visitor')`));
  // 🔄 another wish
  await ev(`visitTap();[...document.querySelectorAll('#modalBtns .btn')].find(b=>/Other/.test(b.textContent)).click()`); await sleep(150);
  check('🔄 Other wish brings the next friend, and keeps Boo\'s wish for later', await ev(`P().visit.cur==='flap1'&&!P().visit.done.includes('boo1')`));
  // 💡 help for clothes: the Closet
  await ev(`P().visit.cur='zip1';save();visitTap();document.querySelector('#modalBody [data-vs-help="0"]').click()`); await sleep(200);
  check('💡 a clothes line opens the Closet with that chip', await ev(`cur==='closet'&&themePick.closet==='sport'&&!!document.querySelector('#closetGrid [data-theme=sport].on')`));
  await ev(`show('room');goRoom(1)`); await sleep(100);
  // 💡 help for going outside
  await ev(`P().visit.cur='hop1';save();renderRoom();visitTap();document.querySelector('#modalBody [data-vs-help="0"]').click()`); await sleep(200);
  check('💡 "Out in the Backyard" takes her there, and the friend comes along', await ev(`roomNo===3&&!!document.querySelector('#roomSvg .visitor')`));
  // the plush after all 3 of a friend's wishes
  await ev(`(()=>{vClear();goRoom(1);const p=P();p.visit.done=['mochi1','mochi2'];p.visit.cur='mochi3';p.coins=100;vMeet(vWishOf('mochi3'));save();renderRoom();visitTap();})()`); await sleep(100);
  await ev(`[...document.querySelectorAll('#modalBtns .btn')].find(b=>/Show me/.test(b.textContent)).click()`); await sleep(250);
  check('all 3 of Mochi\'s wishes: a Mochi Plush in the room, where Mochi stood', await ev(`P().room.items.some(i=>i.type==='plushMochi'&&i.placed&&i.x===VISIT_SPOT.x)&&!!document.querySelector('#modalBody .vs-plush')&&P().coins===105`));
  check('plushes are prizes: never in the Shop', await ev(`Object.values(VISIT_PLUSH).every(k=>DECOR[k].award)`));
  await ev(`closeModal();renderRoom()`); await sleep(100); await shot('V04-plush');
  // stickers
  await ev(`stkPaused=false;checkStickers();stkPaused=true;closeModal()`);
  check('the 🚪 Friends sticker page: Welcome! after the first wish', await ev(`!!STK_PAGES.friends&&P().stickers.includes('wish1')&&STICKERS.filter(s=>s.page==='friends').length===9`));
  // every wish done: nobody knocks again
  await ev(`(()=>{const p=P();p.visit={cur:'',day:'',done:VISIT_WISHES.map(w=>w.id)};save();renderRoom();})()`);
  check('when every wish has come true, nobody knocks', await ev(`P().visit.cur===''&&!document.querySelector('#roomSvg .visitor')`));
  // phone
  await ev(`P().visit={cur:'bolt2',day:'',done:[]};save();renderRoom()`);
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await sleep(300);
  await ev(`visitTap()`); await sleep(150); await shot('V05-phone-card');
  check('phone: the wish card fits the screen', await ev(`(()=>{const r=document.querySelector('.modal-card').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&[...document.querySelectorAll('#modalBtns .btn')].every(b=>b.getBoundingClientRect().right<=innerWidth);})()`));
  await ev(`closeModal()`);
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false}); await sleep(200);
  // save data
  const v40b=await ev(`JSON.stringify(Object.assign({},DB,{version:23,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.visit;return q;})}))`);
  await ev(`doRestore(${JSON.stringify(v40b)})`); await sleep(300);
  check('a v1.40 backup restores with no wishes done (save version 24 or later)', await ev(`DB.version===DB_VERSION&&DB_VERSION>=24&&DB.profiles.every(p=>p.visit&&p.visit.cur===''&&p.visit.done.length===0)`));
  await ev(`closeModal();{const p=DB.profiles[0];p.visit={cur:7,day:null,done:['zip1',3,'zip1']};normalize(p);}`);
  check('odd visitor data is made safe', await ev(`(()=>{const v=DB.profiles[0].visit;return v.cur===''&&v.day===''&&v.done.join()==='zip1';})()`));
  await ev(`(()=>{const p=DB.profiles[0];DB.activeId=p.id;p.visit.cur='nope';p.visit.done=[];p.visit.day='';save();enterRoom();})()`); await sleep(200);
  check('an unknown wish id is skipped: the first wish not done comes instead', await ev(`P().visit.cur==='mochi1'`));
  await ev(`(()=>{vClear();const p=P();if(window._vKeep&&p===DB.profiles[0])rooms(p).forEach((R,i)=>{R.items=_vKeep[i];});save();closeModal();})()`);

  console.log('Two-player games (v1.42)');
  await ev(`(()=>{closeModal();stkPaused=true;const p=P();window._tgMe=p.id;p.easy=false;applyEasy();p.coins=100;p.duo={day:'',n:0,soccer:0,memory:0,stage:0};
    let q=DB.profiles.find(x=>x.name==='Pal');if(!q){q=newProfile('Pal','white','mint','⭐');DB.profiles.push(q);}q.coins=50;q.duo={day:'',n:0,soccer:0,memory:0,stage:0};
    window._tgPal=q.id;window._tgBest=JSON.stringify([p.soccer.best,p.soccer.keep.best,p.stats.matches,p.stage.best,p.brain.solved]);TG.p2=null;save();show('soccer');})()`); await sleep(300);
  check('Soccer has a 👯 Duel tab', await ev(`!!document.querySelector('#socTabs [data-duo=soccer]')`));
  await ev(`document.querySelector('#socTabs [data-duo=soccer]').click()`); await sleep(150);
  check('👯 asks who is playing: every other room and 👤 Guest, big enough to tap', await ev(`document.querySelectorAll('#modalBody [data-tg-who]').length===DB.profiles.length&&!!document.querySelector('#modalBody [data-tg-who=guest]')&&[...document.querySelectorAll('#modalBody [data-tg-who]')].every(b=>b.getBoundingClientRect().height>=48)`));
  await shot('T01-who-plays');
  await ev(`document.querySelector('#modalBody [data-tg-who="'+_tgPal+'"]').click()`); await sleep(300);
  check('picking Pal starts the duel: both players in the score, the kicker first', await ev(`TGS.on&&document.querySelector('#socTitle').textContent.includes('Duel')&&document.querySelectorAll('#socScore .tg-row').length===2&&tgKicker().id===_tgMe&&tgKeeper().id===_tgPal&&TGS.state==='aim'`));
  // two fingers at once: the kicker swipes while the keeper touches the goal
  const pd=(type,id,x,y)=>ev(`(()=>{const r=socCv.getBoundingClientRect();socCv.dispatchEvent(new PointerEvent('${type}',{pointerId:${id},clientX:r.left+${x},clientY:r.top+${y},bubbles:true}));})()`);
  const G=await ev(`({bx:TGS.g.bx,by:TGS.g.by,cx:TGS.g.cx,gy:TGS.g.gy,GW:TGS.g.GW,GH:TGS.g.GH})`);
  await pd('pointerdown',1,G.bx,G.by); await pd('pointermove',1,G.bx+10,G.by-80);
  await pd('pointerdown',2,G.cx-G.GW*0.3,G.gy-G.GH*0.4); await pd('pointerup',2,G.cx-G.GW*0.3,G.gy-G.GH*0.4);
  check('the keeper can\'t dive before the kick', await ev(`TGS.state==='aim'&&!TGS.tgt`));
  await pd('pointermove',1,G.bx+20,G.by-160); await pd('pointerup',1,G.bx+24,G.by-200);
  check('the kicker\'s swipe up from the ball shoots', await ev(`TGS.state==='fly'&&!!TGS.shot&&TGS.shot.u>0`));
  await pd('pointerdown',3,G.cx+G.GW*0.3,G.gy-G.GH*0.3); await pd('pointerup',3,G.cx+G.GW*0.3,G.gy-G.GH*0.3);
  check('…and the keeper\'s tap in the goal dives that way', await ev(`!!TGS.tgt&&TGS.tgt.x>0.2`));
  await shot('T02-duel');
  await sleep(1800);
  check('the shot ends as a goal or a save, for the right player', await ev(`TGS.shots.length===1&&TGS.shots[0].by===0&&['goal','saved','post','wide','over'].includes(TGS.shot.res)`));
  await sleep(1900);
  check('🔄 then they switch: Pal kicks, the other keeps', await ev(`TGS.state==='aim'&&tgKicker().id===_tgPal&&tgKeeper().id===_tgMe`));
  // jump to the last shot
  await ev(`TGS.shots.push(...Array.from({length:8},(_,i)=>({by:(i+1)%2,goal:i%3===0})));tgSocScore()`);
  const G2=await ev(`({bx:TGS.g.bx,by:TGS.g.by})`);
  await pd('pointerdown',4,G2.bx,G2.by); await pd('pointermove',4,G2.bx-10,G2.by-90); await pd('pointerup',4,G2.bx-14,G2.by-200);
  await sleep(3800);
  check('after 10 shots: both scores and a cheer for both', await ev(`TGS.state==='done'&&document.querySelector('#modalTitle').textContent.includes('Duel')&&document.querySelectorAll('#modalBody .tg-sc').length===2&&/Great game|tie/.test(document.querySelector('#modalBody').textContent)`));
  check('…and +3 coins for each room', await ev(`P().coins===103&&DB.profiles.find(x=>x.id===_tgPal).coins===53&&P().duo.soccer===1&&DB.profiles.find(x=>x.id===_tgPal).duo.soccer===1`));
  await shot('T03-duel-end');
  await ev(`[...document.querySelectorAll('#modalBtns .btn')].find(b=>/Just me/.test(b.textContent)).click()`); await sleep(200);
  check('⚽ Just me goes back to the normal game', await ev(`!TGS.on&&!document.querySelector('#socTitle').textContent.includes('Duel')&&!document.querySelector('#socScore .tg-row')`));
  await ev(`document.querySelector('#socTabs [data-duo=soccer]').click()`); await sleep(100); await ev(`document.querySelector('#modalBody [data-tg-who="'+_tgPal+'"]').click()`); await sleep(150);
  await ev(`document.querySelector('#socTabs [data-mode=kick]').click()`); await sleep(150);
  check('the ⚽ Kick tab also leaves the duel', await ev(`!TGS.on&&P().soccer.mode==='kick'&&document.querySelector('#socTabs [data-mode=kick]').classList.contains('on')`));
  // 🃏 Memory for 2
  await ev(`P().brain.level.memory='easy';show('brain')`); await sleep(200);
  check('Brain Games has 👯 Memory for 2 at the top, on screen without scrolling', await ev(`(()=>{const b=document.querySelector('#brMenu [data-duo=memory]'),g=document.querySelector('#brMenu .br-games');return !!b&&b.getBoundingClientRect().bottom<=innerHeight&&b.getBoundingClientRect().bottom<=g.getBoundingClientRect().top;})()`));
  await ev(`brOpen('memory')`); await sleep(150);
  check('Memory Match itself has a 👯 2 players tab; the other games don\'t', await ev(`!document.querySelector('#brTabs [data-duo=memory]').classList.contains('hidden')&&(brOpen('snack'),document.querySelector('#brTabs [data-duo=memory]').classList.contains('hidden'))`));
  await ev(`brPuzzle('memory','medium',0);document.querySelector('#brTabs [data-duo=memory]').click()`); await sleep(100);
  await ev(`document.querySelector('#modalBody [data-tg-who="'+_tgPal+'"]').click()`); await sleep(200);
  check('…which starts Memory for 2 on the level she was playing', await ev(`BR.view==='duo'&&TGM.lvl==='medium'&&document.querySelectorAll('#brDuo [data-tg-c]').length===12`));
  await ev(`brMenu()`); await sleep(100);
  await ev(`document.querySelector('#brMenu [data-duo=memory]').click()`); await sleep(100);
  await ev(`document.querySelector('#modalBody [data-tg-who="'+_tgPal+'"]').click()`); await sleep(200);
  check('a 6-card board with both players, and whose turn it is', await ev(`BR.view==='duo'&&document.querySelectorAll('#brDuo [data-tg-c]').length===6&&document.querySelectorAll('#tgTurn .tg-sc').length===2&&TGM.turn===0&&/turn/.test(document.querySelector('#tgTurn').textContent)`));
  const memTapC=i=>ev(`document.querySelector('#brDuo [data-tg-c="${i}"]').click()`);
  const pairs=await ev(`(()=>{const m={};TGM.cards.forEach((c,i)=>{(m[c.id]=m[c.id]||[]).push(i);});return Object.values(m);})()`);
  await memTapC(pairs[0][0]); await memTapC(pairs[1][0]); await sleep(1100);
  check('a miss flips back and passes the turn', await ev(`TGM.turn===1&&TGM.pts.join()==='0,0'&&!document.querySelector('#brDuo .mem-card.open')`));
  await memTapC(pairs[0][0]); await memTapC(pairs[0][1]); await sleep(100);
  check('a pair gives a point and another go', await ev(`TGM.turn===1&&TGM.pts.join()==='0,1'&&document.querySelectorAll('#brDuo .mem-card.got').length===2`));
  await shot('T04-memory-duo');
  for(const pr of pairs.slice(1)){await memTapC(pr[0]);await memTapC(pr[1]);await sleep(80);}
  await sleep(900);
  check('all pairs found: both scores and a cheer, +3 coins each, nothing marked solved', await ev(`/Memory for 2/.test(document.querySelector('#modalTitle').textContent)&&TGM.pts.join()==='0,3'&&P().coins===106&&DB.profiles.find(x=>x.id===_tgPal).coins===56&&!P().brain.solved.some(id=>/^memory:/.test(id)&&!JSON.parse(_tgBest)[4].includes(id))`));
  await ev(`closeModal();brBackKey()`); await sleep(100);
  check('Back from Memory for 2 goes to the menu', await ev(`BR.view==='menu'&&document.querySelector('#brDuo').classList.contains('hidden')`));
  // 🎤 Stage together
  await ev(`show('stage')`); await sleep(150);
  await ev(`document.querySelector('#stgTabs [data-duo=stage]').click()`); await sleep(100);
  await ev(`document.querySelector('#modalBody [data-tg-who="'+_tgPal+'"]').click()`); await sleep(150);
  check('Stage 👯 Together: its tab is on and the hint says who has which circle', await ev(`TGT.on&&document.querySelector('#stgTabs [data-duo]').classList.contains('on')&&/Pal/.test(document.querySelector('#stgHint').textContent)`));
  await ev(`document.querySelector('#stgSongs [data-song=starlight]').click()`); await sleep(400);
  check('a song together: 2 pads, notes for both, both buddies dancing, names by the pads', await ev(`STG.lvl==='duo'&&STG.notes.some(n=>n.lane===0)&&STG.notes.some(n=>n.lane===1)&&document.querySelectorAll('#stgMascot svg').length===2&&!document.querySelector('#stgNames').classList.contains('hidden')&&document.querySelector('#stgN2').textContent.includes('Pal')`));
  await shot('T05-stage-together');
  await ev(`(()=>{STG.notes.forEach((n,i)=>{if(n.lane===0||i%2)stTap(n.lane,n.t);});stFinish();})()`); await sleep(200);
  check('the end: a team score, notes for each player, +3 coins each', await ev(`STG.state==='done'&&document.querySelectorAll('#modalBody .tg-sc').length===2&&/Team score/.test(document.querySelector('#modalBody').textContent)&&P().coins===109&&DB.profiles.find(x=>x.id===_tgPal).coins===59`));
  check('two-player games never change her bests, matches, stars or solved puzzles', await ev(`JSON.stringify([P().soccer.best,P().soccer.keep.best,P().stats.matches,P().stage.best,P().brain.solved])===_tgBest&&!Object.values(P().stage.best).some(b=>b.duo)`));
  await ev(`closeModal();stgPickView();document.querySelector('#stgTabs [data-lvl=easy]').click()`); await sleep(100);
  check('a level tab goes back to playing alone', await ev(`!TGT.on&&!document.querySelector('#stgTabs [data-duo]').classList.contains('on')`));
  // the daily limit, and a Guest
  await ev(`(()=>{const p=P();p.duo.n=14;window._tgPay=[tgPay(tgPlayers(),'memory'),tgPay(tgPlayers(),'memory')];})()`);
  check('coins for playing together stop at 15 a day, with a gentle note', await ev(`/\\+1 🪙/.test(_tgPay[0])&&/full today/.test(_tgPay[1])&&P().duo.n===15`));
  await ev(`TG.p2='guest'`);
  check('a Guest plays but gets no coins (and the room still does)', await ev(`(()=>{const pl=tgPlayers();const h=tgPay(pl,'stage');return pl[1].name==='Guest'&&!/Guest/.test(h);})()`));
  await ev(`stkPaused=false;checkStickers();stkPaused=true;closeModal()`);
  check('stickers: Play Date and Game Night (all 3 games together)', await ev(`P().stickers.includes('duo1')&&P().stickers.includes('duo3')`));
  // phone
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await sleep(300);
  await ev(`show('soccer');tgPick('soccer')`); await sleep(150); await shot('T06-phone-who');
  check('phone: the picker fits the screen', await ev(`[...document.querySelectorAll('#modalBody [data-tg-who]')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})`));
  await ev(`TG.p2=_tgPal;closeModal();tgSocStart()`); await sleep(300); await shot('T07-phone-duel');
  check('phone: both score rows fit', await ev(`[...document.querySelectorAll('#socScore .tg-row')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})`));
  await ev(`show('room')`);
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false}); await sleep(200);
  // save data
  const v41=await ev(`JSON.stringify(Object.assign({},DB,{version:24,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.duo;return q;})}))`);
  await ev(`doRestore(${JSON.stringify(v41)})`); await sleep(300);
  check('a v1.41 backup restores with nothing played together yet (save version 25 or later)', await ev(`DB_VERSION>=25&&DB.version===DB_VERSION&&DB.profiles.every(p=>p.duo&&p.duo.n===0&&p.duo.soccer===0&&p.duo.day==='')`));
  await ev(`closeModal();{const p=DB.profiles[0];p.duo={day:5,n:'x',soccer:-2,memory:3.7};normalize(p);}`);
  check('odd two-player data is made safe', await ev(`(()=>{const d=DB.profiles[0].duo;return d.day===''&&d.n===0&&d.soccer===0&&d.memory===3&&d.stage===0;})()`));
  await ev(`(()=>{DB.profiles=DB.profiles.filter(x=>x.name!=='Pal');DB.activeId=_tgMe;save();enterRoom();})()`); await sleep(200);

  console.log('Free Play + Puzzle of the Day (v1.43)');
  await ev(`(()=>{closeModal();stkPaused=true;const p=P();p.easy=false;applyEasy();p.coins=100;p.free={day:'',n:0};p.potd={day:''};p.stats.free=0;p.stats.potd=0;
    window._fpBest=JSON.stringify([p.brain.solved,p.maze.solved,p.code.solved]);window.FP_TEST_DAY='2026-11-19';save();})()`);
  // the makers: many seeds each, every puzzle checked by the same rules as the fixed ones
  check('8 makers: 6 Brain Games (Word Builder from v1.45, not Fact Cards), the maze and the Code Lab', await ev(`Object.keys(FP_MAKERS).sort().join()==='bake,code,maze,memory,pop,snack,train,word'&&FP_BRAIN.length===6&&FP_BRAIN.includes('word')&&!FP_BRAIN.includes('facts')`));
  const fpAll=await ev(`(()=>{const bad=[];
    FP_BRAIN.forEach(g=>BRAIN_LVLS.forEach(l=>{for(let i=0;i<150;i++){const z=fpMake(g,l,'t'+i);if(!z||!FP_MAKERS[g].ok(z.pz,l))bad.push(g+l+i);}}));
    for(let i=0;i<150;i++){const z=fpMake('maze','easy','t'+i);if(!z)bad.push('maze'+i);}
    ['easy','medium'].forEach(l=>{for(let i=0;i<150;i++){const z=fpMake('code',l,'t'+i);if(!z)bad.push('code'+l+i);}});
    return bad;})()`);
  check('every game and level makes a fair puzzle from 150 different seeds', fpAll.length===0, fpAll.slice(0,10));
  check('the same seed always makes the same puzzle', await ev(`[...FP_BRAIN,'maze','code'].every(g=>['easy','medium','hard'].every(l=>JSON.stringify(fpMake(g,l,'same'))===JSON.stringify(fpMake(g,l,'same'))))`));
  check('…and different seeds make many different puzzles', await ev(`[...FP_BRAIN.map(g=>[g,'medium']),['maze','easy'],['code','easy'],['code','medium']].every(([g,l])=>new Set(Array.from({length:40},(_,i)=>JSON.stringify(fpMake(g,l,'d'+i).pz))).size>=15)`),
    await ev(`[...FP_BRAIN.map(g=>[g,'medium']),['maze','easy'],['code','easy'],['code','medium']].map(([g,l])=>new Set(Array.from({length:40},(_,i)=>JSON.stringify(fpMake(g,l,'d'+i).pz))).size).join()`));
  check('the checks catch broken puzzles (a train whose answer does not fit, a maze with no way through, a board that needs no 🔁)', await ev(`!FP_MAKERS.train.ok({s:'r b r b r ?',a:'r',o:'r b y'},'easy')&&!FP_MAKERS.train.ok({s:'r b r b r ?',a:'b',o:'b r b'},'easy')
    &&!FP_MAKERS.maze.ok({map:['S.#......','..#......','###......','.........','.........','........G']})&&!FP_MAKERS.code.ok({id:'free',map:['F.C'],max:2,sol:'RR'},'medium')`));
  check('the fixed puzzles pass the same checks', await ev(`['train','pop','snack','bake'].every(g=>BRAIN_LVLS.every(l=>BRAIN_GAMES[g].puzzles[l].every(z=>FP_MAKERS[g].ok(z,l))))&&BRAIN_LVLS.every(l=>MEM_SETS[l].every(z=>FP_MAKERS.memory.ok(z,l)))`),
    await ev(`['train','pop','snack','bake'].flatMap(g=>BRAIN_LVLS.flatMap(l=>BRAIN_GAMES[g].puzzles[l].map((z,i)=>FP_MAKERS[g].ok(z,l)?'':g+l+i))).filter(Boolean).join()`));
  check('Snack Stand and Bakery: the answer is always among the choices', await ev(`BRAIN_LVLS.every(l=>Array.from({length:60},(_,i)=>fpMake('snack',l,'o'+i)).every(z=>BRAIN_GAMES.snack.options(z.pz,l,z.idx).includes(BRAIN_GAMES.snack.answer(z.pz,l))))&&Array.from({length:60},(_,i)=>fpMake('bake','hard','o'+i)).every(z=>brOptions(z.pz.a,z.idx,[[-2,0,1,10]]).includes(z.pz.a))`));
  check('Memory: every made board\'s pictures draw', await ev(`BRAIN_LVLS.every(l=>Array.from({length:20},(_,i)=>fpMake('memory',l,'m'+i).pz).every(s=>s.every(id=>memPic(id).length>60)))`));
  check('Code Lab: each made board\'s answer works within its blocks; Medium can\'t be done with arrows only', await ev(`Array.from({length:80},(_,i)=>fpMake('code','medium','c'+i).pz).every(z=>codeSim(z,[...z.sol],null).end==='win'&&z.sol.length<=z.max&&fpCodeWalk(z.map).length>z.max&&/[234]/.test(z.sol))
    &&Array.from({length:80},(_,i)=>fpMake('code','easy','c'+i).pz).every(z=>codeSim(z,[...z.sol],null).end==='win'&&z.max<=12&&!/[234]/.test(z.sol))`));
  // 📅 Puzzle of the Day
  await ev(`window._fpDays=Array.from({length:7},(_,k)=>new Date(Date.UTC(2026,10,19+k)).toISOString().slice(0,10))`);
  check('the daily game turns through the 6 Brain Games, one a day', await ev(`new Set(_fpDays.slice(0,6).map(potdGame)).size===6&&_fpDays.slice(0,6).every(d=>POTD_GAMES.includes(potdGame(d)))&&potdGame(_fpDays[6])===potdGame(_fpDays[0])`));
  await ev(`window.FP_TEST_DAY=_fpDays.find(d=>potdGame(d)==='train');P().brain.level.train='medium';show('brain')`); await sleep(200);
  check('the 📅 card is at the top of the Brain Games menu, next to 👯, and says what today\'s game is', await ev(`(()=>{const c=document.querySelector('#brMenu [data-potd]'),d=document.querySelector('#brMenu [data-duo=memory]'),g=document.querySelector('#brMenu .br-games');
    return !!c&&c.parentElement===d.parentElement&&c.getBoundingClientRect().bottom<=g.getBoundingClientRect().top&&c.getBoundingClientRect().bottom<=innerHeight&&c.textContent.includes('Pattern Train')&&c.textContent.includes('+5')&&c.getBoundingClientRect().height>=48;})()`));
  await shot('U01-brain-daily-card');
  check('no streaks or "missed" words anywhere on the menu', await ev(`!/streak|missed|come back|tomorrow|in a row/i.test(document.querySelector('#brMenu').textContent)`));
  await ev(`document.querySelector('#brMenu [data-potd]').click()`); await sleep(200);
  check('the card opens today\'s puzzle: Pattern Train at her level (Medium)', await ev(`BR.view==='play'&&!!BR.free&&BR.free.daily&&BR.game==='train'&&BR.lvl==='medium'&&document.querySelector('#brTitle').textContent.includes('Puzzle of the Day')`));
  await shot('U02-daily-train');
  const fpDailyPz=await ev(`JSON.stringify(BR.free.pz)`);
  await ev(`brMenu();document.querySelector('#brMenu [data-potd]').click()`); await sleep(150);
  check('it is the same puzzle all day', (await ev(`JSON.stringify(BR.free.pz)`))===fpDailyPz);
  // a helper that solves whatever made-up puzzle is on screen
  await ev(`window._fpSolve=()=>{const g=BR.game,l=BR.lvl,z=BR.free.pz,q=s=>{const b=document.querySelector(s);if(b)b.click();};
    if(g==='train') q('.tr-ch[data-t="'+z.a+'"]');
    else if(g==='snack') q('#brBoard [data-n="'+BRAIN_GAMES.snack.answer(z,l)+'"]');
    else if(g==='memory'){const m={};MEM.cards.forEach((c,i)=>{(m[c.id]=m[c.id]||[]).push(i);});Object.values(m).forEach(([a,b])=>{memTap(a);memTap(b);});}
    else if(g==='pop'){const done=i=>document.querySelector('.nbub[data-b="'+i+'"]').classList.contains('popped');
      if(l==='medium'){z.b.forEach((n,i)=>{if(done(i))return;const j=z.b.findIndex((m,jj)=>jj!==i&&!done(jj)&&m+n===z.t);if(j>=0){popTap(i);popTap(j);}});}
      else z.b.forEach((n,i)=>{if(l==='easy'?n===z.t:z.t%n===0)popTap(i);});}
    else if(g==='word'){q('#wbHide:not(.hidden)');[...z.w].forEach(c=>q('#brBoard .wb-tile[data-c="'+c+'"]:not(.used)'));}
    else if(g==='bake'){if(l==='easy')q('[data-o="'+z.n+'"]');else if(l==='medium'){FB.on=FB.on.map((x,i)=>i<z.a*z.n/z.b);fbCheck(z);}else q('#brBoard [data-n="'+z.a+'"]');}
    return BR.won;}`);
  const fpc0=await ev('P().coins');
  check('solving it wins', await ev('_fpSolve()'));
  await sleep(1100);
  check('📅 +5 coins once, and it never counts as a solved puzzle', await ev(`P().coins===${fpc0}+5&&P().potd.day===FP_TEST_DAY&&P().stats.potd===1&&JSON.stringify([P().brain.solved,P().maze.solved,P().code.solved])===_fpBest&&document.querySelector('#modalTitle').textContent.includes('Puzzle of the Day')`));
  await shot('U03-daily-solved');
  await ev(`closeModal();brMenu()`); await sleep(100);
  check('the card now says ✔ Solved today', await ev(`document.querySelector('#brMenu [data-potd]').textContent.includes('Solved today')&&document.querySelector('#brMenu [data-potd]').classList.contains('done')`));
  await ev(`document.querySelector('#brMenu [data-potd]').click()`); await sleep(150); await ev('_fpSolve()'); await sleep(1100);
  check('playing it again the same day is free practice', await ev(`P().coins===${fpc0}+5&&P().stats.potd===1`));
  await ev(`closeModal();window.FP_TEST_DAY=_fpDays[_fpDays.indexOf(FP_TEST_DAY)+1];brMenu()`); await sleep(100);
  check('the next day: a new game on the card, +5 again, nothing about yesterday', await ev(`(()=>{const c=document.querySelector('#brMenu [data-potd]');return !c.classList.contains('done')&&c.textContent.includes('+5')&&c.textContent.includes(BRAIN_GAMES[potdGame(FP_TEST_DAY)].name)&&potdGame(FP_TEST_DAY)!=='train';})()`));
  await ev(`P().easy=true;applyEasy();brMenu();document.querySelector('#brMenu [data-potd]').click()`); await sleep(150);
  check('Easy mode: the daily puzzle is on Easy', await ev(`BR.free.daily&&BR.lvl==='easy'`));
  await shot('U04-daily-easy');
  await ev(`P().easy=false;applyEasy();closeModal()`);
  // 🎲 Free Play in the Brain Games
  check('🎲 sits after the puzzle numbers in the 6 games, not in Fact Cards', await ev(`FP_BRAIN.every(g=>(brOpen(g),!!document.querySelector('#brDots [data-dice]')&&document.querySelector('#brDots').lastElementChild.matches('[data-dice]')))&&!(brOpen('facts'),document.querySelector('#brDots [data-dice]'))`));
  await ev(`P().brain.level.pop='easy';brOpen('pop');document.querySelector('#brDots [data-dice]').click()`); await sleep(150);
  check('🎲 opens a made-up puzzle: the dice lit, no number lit', await ev(`!!BR.free&&!BR.free.daily&&BR.game==='pop'&&document.querySelector('#brDots [data-dice]').classList.contains('on')&&!document.querySelector('#brDots [data-pz].on')`));
  await shot('U05-free-pop');
  const fpc1=await ev('P().coins');
  await ev('_fpSolve()'); await sleep(1100);
  check('solved: +2 coins (no cap in the thinking games), the box offers 🎲 Another one!, nothing marked solved', await ev(`P().coins===${fpc1}+2&&P().stats.free===1&&P().free.n===0&&/Another one/.test(document.querySelector('#modalBtns').textContent)&&JSON.stringify([P().brain.solved,P().maze.solved,P().code.solved])===_fpBest`));
  const fpKey=await ev('BR.free.key');
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>/Another/.test(b.textContent)).click()`); await sleep(150);
  check('🎲 Another one! makes a new one', await ev(`!!BR.free&&BR.free.key!==${JSON.stringify(fpKey)}&&!BR.won`));
  await ev(`document.querySelector('#brTabs [data-lvl=hard]').click()`); await sleep(150);
  check('a level tab in Free Play makes a new one at that level', await ev(`!!BR.free&&!BR.free.daily&&BR.lvl==='hard'&&BR.free.lvl==='hard'`));
  // every game and level, through the screen (18 puzzles: +2 each in FP_THINK, Memory Match +1 within the 10 a day)
  await ev(`P().free={day:FP_TEST_DAY,n:0};P().stats.free=0`); const fpc2=await ev('P().coins');
  const fpWon=await ev(`(()=>{const out=[];FP_BRAIN.forEach(g=>BRAIN_LVLS.forEach(l=>{fpBrain(g,l);if(!_fpSolve())out.push(g+':'+l);}));return out;})()`);
  check('a made-up puzzle of every game and level can be solved on screen', fpWon.length===0, fpWon);
  await sleep(1100);
  const fpWant=await ev(`(()=>{let c=0,n=0;FP_BRAIN.forEach(g=>BRAIN_LVLS.forEach(()=>{if(FP_THINK.includes(g))c+=FREE_THINK;else if(n<FREE_DAILY){n++;c++;}}));return [c,n];})()`);
  check('Memory Match is the only Brain Game 🎲 on the 10-a-day cap', await ev(`FP_BRAIN.filter(g=>!FP_THINK.includes(g)).join()==='memory'&&FREE_THINK===2`));
  check('18 solved: +2 each in the thinking games, +1 each in Memory Match, all 18 count for stickers', await ev(`P().coins===${fpc2}+${fpWant[0]}&&P().free.n===${fpWant[1]}&&P().stats.free===18`), await ev(`[P().coins-${fpc2},P().free.n,P().stats.free,${JSON.stringify(fpWant)}]`));
  await ev(`closeModal();P().free={day:FP_TEST_DAY,n:FREE_DAILY}`); const fpCap=await ev('P().coins');
  await ev(`fpBrain('train','easy');_fpSolve()`); await sleep(1100);
  check('with the 10 a day used up, a 🎲 Pattern Train still pays +2', await ev(`P().coins===${fpCap}+2&&/[+]2/.test(document.querySelector('#modalBody').textContent)`));
  await ev(`closeModal();fpToldDay='';fpBrain('memory','easy');_fpSolve()`); await sleep(1100);
  check('…while a 🎲 Memory Match pays nothing more, with the gentle note', await ev(`P().coins===${fpCap}+2&&/full for today/.test(document.querySelector('#modalBody').textContent)`));
  await ev('closeModal()');
  check('the full note is gentle (once, no countdown, no "come back")', await ev(`(()=>{fpToldDay='';const h=fpPay();return /full for today/.test(h)&&!/come back|hours|minutes|tomorrow/i.test(h)&&fpPay()==='';})()`));
  await ev(`closeModal();window.FP_TEST_DAY='2027-01-01'`); const fpc3=await ev('P().coins');
  check('a new day refills the Free Play coins quietly', await ev(`fpPay()==='+1 🪙'&&P().coins===${fpc3}+1&&P().free.n===1&&P().free.day===FP_TEST_DAY`));
  await ev(`BRAIN_GAMES.pop.puzzles.easy.forEach((z,i)=>{if(!P().brain.solved.includes(brId('pop','easy',i)))P().brain.solved.push(brId('pop','easy',i));});brPuzzle('pop','easy',0)`); await sleep(100);
  check('🎲 glows once every fixed puzzle of that level is solved', await ev(`document.querySelector('#brDots [data-dice]').classList.contains('glow')&&!(brPuzzle('pop','hard',0),document.querySelector('#brDots [data-dice]').classList.contains('glow'))`));
  await ev(`P().brain.solved=JSON.parse(_fpBest)[0];save()`);
  // 🎲 in the Marble Maze
  await ev(`closeModal();show('fidget');setFidTab('maze')`); await sleep(300);
  check('the maze bar has 🎲 after the numbered mazes', await ev(`(()=>{const k=[...document.querySelectorAll('#mazeBar > *')];const d=k.findIndex(b=>b.id==='mzDice');return d>0&&k.slice(0,d).filter(b=>b.dataset.mz).length===MAZES.length;})()`));
  await ev(`document.querySelector('#mzDice').click()`); await sleep(200);
  check('🎲 starts a made-up 9 × 6 maze; no numbered maze is lit', await ev(`!!MZ.free&&mzCur().map.length===6&&!document.querySelector('#mazeBar [data-mz].on')&&document.querySelector('#mzDice').classList.contains('on')`));
  await shot('U06-free-maze');
  await ev(`window._mzPathKeep=window.mzPath;window.mzPath=()=>fpMazePath(mzCur().map)`);
  const fpc4=await ev('P().coins'), fpMz0=await ev('P().stats.mazes');
  const fmr=await ev('mzAuto()'); await sleep(300);
  check('a made-up maze can be solved by tilting, never inside a wall', fmr.done&&fmr.bad===0, fmr);
  check('…it pays +1 (Free Play), counts for Marble Marathon and is not saved as a maze', await ev(`P().coins===${fpc4}+1&&P().stats.mazes===${fpMz0}+1&&JSON.stringify(P().maze.solved)===JSON.stringify(JSON.parse(_fpBest)[1])&&/Maze done/.test(document.querySelector('#modalTitle').textContent)`));
  for(let i=0;i<3;i++){await ev(`closeModal();fpMaze()`);const r=await ev('mzAuto()');check(`another made-up maze (${i+2}) solved by tilting, never inside a wall`,r.done&&r.bad===0,r);}
  await ev(`closeModal();window.mzPath=_mzPathKeep;document.querySelector('#mazeBar [data-mz="0"]').click()`); await sleep(100);
  check('a numbered maze button goes back to the fixed mazes', await ev(`!MZ.free&&MZ.i===0`));
  // 🎲 in the Code Lab
  await ev(`P().code.level='easy';show('code')`); await sleep(200);
  check('the Code Lab\'s Easy list ends with a 🎲 New board tile', await ev(`!!document.querySelector('#clList [data-dice]')&&document.querySelector('#clList').lastElementChild.matches('[data-dice]')&&document.querySelector('#clList [data-dice]').getBoundingClientRect().height>=48`));
  await shot('U07-code-list');
  await ev(`P().code.level='hard';clPickView()`);
  check('…on Medium too, but not on Hard, My Move, If or Challenge', await ev(`!document.querySelector('#clList [data-dice]')&&['move','if','challenge'].every(l=>(P().code.level=l,clPickView(),!document.querySelector('#clList [data-dice]')))&&(P().code.level='medium',clPickView(),!!document.querySelector('#clList [data-dice]'))`));
  await ev(`CODE_STEP=40;document.querySelector('#clList [data-dice]').click()`); await sleep(200);
  check('a made-up Medium board with 🔁 in the blocks', await ev(`!!CL.free&&CL.lvl==='medium'&&CL.view==='play'&&!!document.querySelector('#clPal [data-add="4"]')`));
  await shot('U08-free-code');
  const fpc5=await ev('P().coins');
  await ev(`CL.prog=[...CL.free.sol];clProg();clGo()`); await sleep(1500);
  check('its answer runs, pays +1 and offers 🎲 Another one!; not saved as solved', await ev(`CL.state==='win'&&P().coins===${fpc5}+1&&/Board solved/.test(document.querySelector('#modalTitle').textContent)&&/Another/.test(document.querySelector('#modalBtns').textContent)&&JSON.stringify(P().code.solved)===JSON.stringify(JSON.parse(_fpBest)[2])`));
  await ev(`[...document.querySelectorAll('#modalBtns button')].find(b=>/Another/.test(b.textContent)).click()`); await sleep(150);
  check('…and Another one! makes a new board', await ev(`!!CL.free&&CL.state==='edit'&&CL.lvl==='medium'`));
  await ev(`clBackKey()`);
  check('Back from a made-up board goes to the list', await ev(`CL.view==='pick'`));
  // stickers
  await ev(`P().stats.free=50;P().stats.potd=5;stkPaused=false;checkStickers();stkPaused=true;closeModal()`);
  check('stickers: Dice Roller, Puzzle Explorer and Daily Thinker (totals, never streaks)', await ev(`['free10','free50','potd5'].every(id=>P().stickers.includes(id))&&STICKERS.filter(s=>/^(free|potd)/.test(s.id)).every(s=>s.page==='code'&&!/streak|in a row/i.test(s.hint))`));
  // phone
  await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true}); await sleep(300);
  await ev(`show('brain')`); await sleep(200); await shot('U09-phone-brain');
  check('phone: the 📅 card and 👯 fit the width', await ev(`[...document.querySelectorAll('#brMenu .br-top > *')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})`));
  await ev(`brOpen('train')`); await sleep(150);
  check('phone: the 🎲 dot fits with the 8 numbers', await ev(`(()=>{const r=document.querySelector('#brDots [data-dice]').getBoundingClientRect();return r.right<=innerWidth&&r.width>=48;})()`));
  await ev(`show('fidget');setFidTab('maze');fpMaze()`); await sleep(300);
  check('phone: a made-up maze still leaves a big board', await ev('MZ.geo.cs>=36'), await ev('MZ.geo.cs'));
  await ev(`mzStart(0);show('room')`);
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false}); await sleep(200);
  // save data
  const v42=await ev(`JSON.stringify(Object.assign({},DB,{version:25,profiles:DB.profiles.map(p=>{const q=JSON.parse(JSON.stringify(p));delete q.free;delete q.potd;delete q.stats.free;delete q.stats.potd;return q;})}))`);
  await ev(`doRestore(${JSON.stringify(v42)})`); await sleep(300);
  check('a v1.42 backup restores with no Free Play yet (save version 26 or later)', await ev(`DB_VERSION>=26&&DB.version===DB_VERSION&&DB.profiles.every(p=>p.free&&p.free.n===0&&p.free.day===''&&p.potd.day===''&&p.stats.free===0&&p.stats.potd===0)`));
  await ev(`closeModal();{const p=DB.profiles[0];p.free=[3];p.potd='x';p.stats.free=-4;p.stats.potd='7';normalize(p);}`);
  check('odd Free Play data is made safe', await ev(`(()=>{const p=DB.profiles[0];return p.free.day===''&&p.free.n===0&&p.potd.day===''&&p.stats.free===0&&p.stats.potd===7;})()`));
  await ev(`window.FP_TEST_DAY='';save()`);

  console.log('American spelling (v1.44)');
  {
    // every app file (on-screen text and comments) uses American spelling; saved ids like the season 'autumn' are allowed
    const UK=/\b(colour|favourite|centre|theatre|metre|grey|tyre|cosy|organis(?!m)|realis|recognis|apologis|personalis|customis|travell|cancell|jewellery|pyjama|moustache|honour|humour|behaviour|flavour|neighbour|labour|maths|fringe)\w*/i;
    const appFiles=[...fs.readdirSync(path.join(__dirname,'..','web/js')).map(f=>'web/js/'+f),'index.html','web/app.css','web/about-local.example.js'];
    const ukHits=appFiles.flatMap(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8').split('\n').map((l,i)=>UK.test(l)?f+':'+(i+1)+' '+l.trim().slice(0,60):'').filter(Boolean));
    check('no British spellings in the app files (color, favorite, gray, center, tire, cozy …)', ukHits.length===0, ukHits.slice(0,5));
    check('the season is called Fall on screen; its saved id is still autumn', await ev(`SEASONS.autumn&&SEASONS.autumn.name==='Fall'&&!SEASONS.fall&&Object.values(DECOR).filter(d=>d.season==='autumn').length===4`));
    check('no "Autumn" in anything she can see (names, hints, news)', await ev(`![...Object.values(DECOR).map(d=>d.name),...Object.values(WALLS).map(w=>w.name),...Object.values(FLOORS).map(w=>w.name),...Object.values(CLOSET).flatMap(c=>c.items.map(i=>i.name)),
      ...STICKERS.map(s=>s.name+' '+s.hint),...Object.values(SEASONS).map(s=>s.name),...GIFT_TIMELINE.map(t=>t.n+' '+t.why+' '+(t.news||[]).join(' ')),...Object.values(SONGS).map(s=>s.name+' '+(s.desc||''))].some(t=>/autumn|colour|favourite|grey\\b|tyre|cosy/i.test(t))`));
    await ev(`show('room');enterDecorate()`); await sleep(200);
    check('Decorate\'s tab says 🎨 Colors', await ev(`document.querySelector('[data-dt=colors]').textContent.includes('Colors')`));
    await ev(`exitDecorate()`);
  }

  console.log('Word Builder word bank (v1.45)');
  {
    await ev(`closeModal();show('brain')`); await sleep(250);
    check('the word bank: 3 levels, plenty of words, capital letters only, no repeats', await ev(`BRAIN_LVLS.every(l=>WB_BANK[l].length>=120&&WB_BANK[l].every(w=>/^[A-Z]+$/.test(w))&&new Set(WB_BANK[l]).size===WB_BANK[l].length)`),
      await ev(`BRAIN_LVLS.map(l=>WB_BANK[l].length).join()`));
    check('word lengths: Easy 3-5, Medium 3-9, Hard 3-11 (no 1-2 letter words)', await ev(`BRAIN_LVLS.every(l=>WB_BANK[l].every(w=>w.length>=3&&w.length<=WB_MAX[l]))`),
      await ev(`BRAIN_LVLS.flatMap(l=>WB_BANK[l].filter(w=>w.length<3||w.length>WB_MAX[l])).join()`));
    check('the words we agreed to leave out are not there', await ev(`!['HARASS','ILLEGAL','CEMETERY','EXPLOSION','PHOTOSYNTHESIS','INTERNATIONAL','MISUNDERSTAND','HEAR','WHOLE','WEATHER','PRINCIPAL','AFFECT','DESSERT','ALOUD'].some(w=>BRAIN_LVLS.some(l=>WB_BANK[l].includes(w)))`));
    check('the theme words are in (web bat cub / robot rocket slime goal ghost comet / dinosaur volcano galaxy astronaut telescope)', await ev(`['WEB','BAT','CUB'].every(w=>WB_BANK.easy.includes(w))&&['ROBOT','ROCKET','SLIME','GOAL','GHOST','COMET'].every(w=>WB_BANK.medium.includes(w))&&['DINOSAUR','VOLCANO','GALAXY','ASTRONAUT','TELESCOPE'].every(w=>WB_BANK.hard.includes(w))`));
    check('American spelling in the bank (COLOR, FAVORITE, GRAY, CENTER; no COLOUR)', await ev(`['COLOR','FAVORITE','CENTER','THEATER','PAJAMAS'].every(w=>WB_BANK.hard.includes(w))&&WB_BANK.easy.includes('GRAY')&&!BRAIN_LVLS.some(l=>WB_BANK[l].some(w=>/COLOUR|FAVOURITE|GREY|CENTRE|THEATRE/.test(w)))`));
    check('every picture belongs to a word in the bank and draws', await ev(`Object.entries(WB_PICS).every(([w,pic])=>BRAIN_LVLS.some(l=>WB_BANK[l].includes(w))&&(/^[db]:/.test(pic)?memPic(pic).length>60:wbPic(pic).length>0))`),
      await ev(`Object.entries(WB_PICS).filter(([w,pic])=>!BRAIN_LVLS.some(l=>WB_BANK[l].includes(w))||(/^[db]:/.test(pic)&&memPic(pic).length<=60)).map(e=>e[0]).join()`));
    check('a made-up word: extra letters are never in the word (so only one way to spell it)', await ev(`BRAIN_LVLS.every(l=>Array.from({length:120},(_,i)=>fpMake('word',l,'w'+i).pz).every(z=>[...z.x].every(c=>!z.w.includes(c))&&z.x.length>=2))`));
    check('Word Builder has 🎲 and is in the 📅 daily turn (6 games)', await ev(`FP_BRAIN.includes('word')&&POTD_GAMES.length===6&&POTD_GAMES.includes('word')`));
    check('the 8 fixed Word Builder puzzles are unchanged and still play the old way', await ev(`BRAIN_LVLS.every(l=>WB_PUZ[l].length===8)&&(brPuzzle('word','medium',0),!document.querySelector('#wbLook')&&!!document.querySelector('#brQ .wb-slot i'))`));
    const _wbBest=await ev(`JSON.stringify(P().brain.solved)`);
    // Easy = trace
    await ev(`P().easy=false;window._said=[];window.AndroidBridge={speak(t){window._said.push(t);}};brPuzzle('word','easy',0,{pz:{bank:1,w:'FOX',x:'AM',pic:'b:fox'},key:'wtest',idx:0,lvl:'easy'})`); await sleep(150);
    await shot('V01-word-easy-trace');
    check('Easy traces: the letters show faintly in the slots, with the picture, and no Hide button', await ev(`[...document.querySelectorAll('#brQ .wb-slot i')].map(i=>i.textContent).join('')==='FOX'&&!!document.querySelector('#brQ .wb-pic svg')&&!document.querySelector('#wbHide')&&!document.querySelector('#brBoard .wb-tiles').classList.contains('hidden')&&document.querySelectorAll('#brBoard .wb-tile').length===5`));
    check('🔊 is there on the tablet and the word is said when it opens', await ev(`!!document.querySelector('#brQ .wb-say')&&_said.includes('fox')`));
    await ev(`_said=[];document.querySelector('#brQ .wb-say').click()`);
    check('tapping 🔊 says the word again', await ev(`_said.join()==='fox'`));
    await ev(`document.querySelector('#brBoard .wb-tile[data-c="O"]').click()`); await sleep(50);
    check('a letter out of order is a gentle "try again" and fills nothing', await ev(`WB.got===0&&!document.querySelector('#brQ .wb-slot.on')`));
    await ev(`['F','O','X'].forEach(c=>document.querySelector('#brBoard .wb-tile[data-c="'+c+'"]:not(.used)').click())`); await sleep(100);
    check('tapping the letters in order spells it and wins', await ev(`BR.won===true&&document.querySelectorAll('#brQ .wb-slot.on').length===3`));
    await sleep(1100); await ev(`closeModal()`);
    // Medium/Hard = look, hide, spell
    await ev(`brPuzzle('word','hard',0,{pz:{bank:1,w:'TEMPERATURE',x:'BDK',pic:''},key:'wtest2',idx:0,lvl:'hard'})`); await sleep(150);
    await shot('V02-word-look');
    check('Hard starts by showing the word, with ✋ Hide it; the letters wait', await ev(`document.querySelector('#wbLook').textContent==='TEMPERATURE'&&!document.querySelector('#wbLook').classList.contains('hidden')&&!document.querySelector('#wbHide').classList.contains('hidden')&&document.querySelector('#brQ .wb-slots').classList.contains('hidden')&&document.querySelector('#brBoard .wb-tiles').classList.contains('hidden')&&document.querySelector('#wbPeek').classList.contains('hidden')`));
    check('the slots are empty on Hard (no faint letters)', await ev(`!document.querySelector('#brQ .wb-slot i')`));
    await ev(`document.querySelector('#wbHide').click()`); await sleep(100);
    await shot('V03-word-spell');
    check('✋ hides the word and shows the slots, the letters and 👀 Peek', await ev(`document.querySelector('#wbLook').classList.contains('hidden')&&!document.querySelector('#brQ .wb-slots').classList.contains('hidden')&&!document.querySelector('#brBoard .wb-tiles').classList.contains('hidden')&&!document.querySelector('#wbPeek').classList.contains('hidden')&&document.querySelectorAll('#brBoard .wb-tile').length===14`));
    await ev(`['T','E','M'].forEach(c=>document.querySelector('#brBoard .wb-tile[data-c="'+c+'"]:not(.used)').click())`);
    await ev(`document.querySelector('#wbPeek').click()`); await sleep(50);
    check('👀 Peek shows the word again and keeps what she spelled (no timer)', await ev(`!document.querySelector('#wbLook').classList.contains('hidden')&&WB.got===3&&WB.look===true&&document.querySelectorAll('#brQ .wb-slot.on').length===3`));
    await ev(`document.querySelector('#wbHide').click()`);
    await ev(`[...'PERATURE'].forEach(c=>document.querySelector('#brBoard .wb-tile[data-c="'+c+'"]:not(.used)').click())`); await sleep(100);
    check('…then she finishes the word and wins', await ev(`BR.won===true&&WB.got===11`));
    await sleep(1100); await ev(`closeModal()`);
    check('made-up words never count as solved puzzles', await ev(`JSON.stringify(P().brain.solved)===${JSON.stringify(_wbBest)}`));
    // phone width: the longest word fits
    await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true});
    await ev(`brPuzzle('word','hard',0,{pz:{bank:1,w:'ACCOMMODATE',x:'BFG',pic:''},key:'wtest3',idx:0,lvl:'hard'})`); await sleep(200);
    await shot('V04-phone-word-look');
    check('on a phone the longest word fits on screen', await ev(`cur==='brain'&&document.querySelector('#wbLook').getBoundingClientRect().width>100&&document.querySelector('#wbLook').getBoundingClientRect().right<=innerWidth&&document.documentElement.scrollWidth<=innerWidth`));
    await ev(`document.querySelector('#wbHide').click()`); await sleep(100);
    await shot('V05-phone-word-spell');
    check('…and so do its 11 slots', await ev(`[...document.querySelectorAll('#brQ .wb-slot')].every(s=>s.getBoundingClientRect().right<=innerWidth)&&document.documentElement.scrollWidth<=innerWidth`));
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    // without the tablet: no 🔊
    await ev(`delete window.AndroidBridge;brPuzzle('word','medium',0,{pz:{bank:1,w:'ROBOT',x:'AEK',pic:'d:robotPal'},key:'wtest4',idx:0,lvl:'medium'})`); await sleep(100);
    check('in a browser there is no 🔊 button (it needs the tablet)', await ev(`!document.querySelector('#brQ .wb-say')&&!!document.querySelector('#brQ .wb-pic svg')`));
    // Easy mode words
    await ev(`P().easy=true;brPuzzle('word','medium',0,{pz:{bank:1,w:'ROBOT',x:'AEK',pic:'d:robotPal'},key:'wtest4',idx:0,lvl:'medium'})`); await sleep(100);
    check('in Easy mode the question is just 👀, then 🔤', await ev(`document.querySelector('#wbAsk').textContent==='👀'&&(document.querySelector('#wbHide').click(),document.querySelector('#wbAsk').textContent==='🔤')`));
    await ev(`P().easy=false`);
    // 📅 daily Word Builder
    await ev(`window.FP_TEST_DAY=Array.from({length:7},(_,k)=>new Date(Date.UTC(2027,0,1+k)).toISOString().slice(0,10)).find(d=>potdGame(d)==='word');P().brain.level.word='medium';brMenu()`); await sleep(150);
    check('📅 a Word Builder day: the card says Word Builder and opens a bank word', await ev(`document.querySelector('#brMenu [data-potd]').textContent.includes('Word Builder')&&(document.querySelector('#brMenu [data-potd]').click(),BR.game==='word'&&BR.free&&BR.free.daily&&BR.free.pz.bank===1&&!!document.querySelector('#wbLook'))`));
    const wc0=await ev('P().coins'), wd0=await ev('P().stats.potd');
    check('…and solving it pays the daily +5', await ev('_fpSolve()'));
    await sleep(1100);
    check('…+5 coins, once', await ev(`P().coins===${wc0}+5&&P().stats.potd===${wd0}+1`));
    await ev(`closeModal();window.FP_TEST_DAY=''`);
    check('v1.45 is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.45')`));
  }

  console.log("Little Ones' Corner (v1.46)");
  {
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`closeModal();stkPaused=true;P().easy=false;goRoom(1);show('room')`); await sleep(300);
    check('save version 27; every room has a Little Ones\' Corner record', await ev(`DB_VERSION>=27&&DB.profiles.every(p=>p.little&&typeof p.little.colors==='object'&&typeof p.little.hung==='object'&&typeof p.little.pay.n==='number'&&p.stats.colored>=0&&p.stats.peeks>=0&&p.stats.pads>=0)`));
    check('the 🧸 Play button is in the room bar (48 px+), and Read to me calls it Play', await ev(`(b=>!!b&&b.getBoundingClientRect().width>=48&&speakLabel(b)==='Play')(document.querySelector('#littleBtn'))`));
    check('tablet: the room bar is still one row with 🧸', await ev(`(()=>{const t=document.querySelector('#roomTitle').getBoundingClientRect(),b=document.querySelector('#setBtn').getBoundingClientRect();return Math.abs(t.top+t.height/2-(b.top+b.height/2))<8;})()`));
    await ev(`document.querySelector('#littleBtn').click()`); await sleep(200);
    check('tapping 🧸 opens the Play menu with 3 huge picture buttons', await ev(`cur==='little'&&LT.view==='menu'&&[...document.querySelectorAll('#ltBody .lt-big')].length===3&&[...document.querySelectorAll('#ltBody .lt-big')].every(b=>b.getBoundingClientRect().height>=150)`));
    await shot('L01-little-menu');
    check('the 🧸 button works from the Loft, Backyard and Studio too', await ev(`[2,3,4].every(n=>{goRoom(n);document.querySelector('#littleBtn').click();return cur==='little';})`));
    check('Android Back goes from the menu to the room it came from', await ev(`androidBack()&&cur==='room'&&roomNo===4`));
    await ev(`goRoom(1);document.querySelector('#littleBtn').click()`); await sleep(100);
    // 🖍️ coloring
    await ev(`document.querySelector('[data-lt=color]').click()`); await sleep(200);
    check('🖍️ shows 12 pictures', await ev(`LT.view==='colorPick'&&document.querySelectorAll('#ltBody .cb-thumb').length===12&&CB_PICS.length===12`));
    await shot('L02-color-pick');
    check('picture ids are all different; each has 4 to 8 areas to color plus the background', await ev(`new Set(CB_PICS.map(z=>z.id)).size===12&&CB_PICS.every(z=>z.areas.length>=5&&z.areas.length<=9&&z.areas[0]===CB_BG)`), await ev(`CB_PICS.map(z=>z.id+':'+(z.areas.length-1)).join(' ')`));
    check('10 big crayons, all different colors', await ev(`CB_CRAYONS.length===10&&new Set(CB_CRAYONS).size===10&&CB_NAMES.length===10`));
    // every area of every picture can be tapped somewhere (it is on top at that point)
    await ev(`window.cbSpot=i=>{const el=document.querySelector('#cbSvg [data-a="'+i+'"]');const b=el.getBoundingClientRect();
      for(let k=0;k<900;k++){const x=b.left+((k*37)%30+0.5)/30*b.width,y=b.top+(Math.floor(k/30)+0.5)/30*b.height;const t=document.elementFromPoint(x,y);if(t===el)return {x,y};}return null;};
      window.cbTap=i=>{const s=cbSpot(i);if(!s)return false;const el=document.querySelector('#cbSvg [data-a="'+i+'"]');el.dispatchEvent(new PointerEvent('pointerdown',{pointerId:7,bubbles:true,clientX:s.x,clientY:s.y}));return true;};
      window.crTap=i=>{const el=document.querySelector('#cbCrayons [data-cr="'+i+'"]');el.dispatchEvent(new PointerEvent('pointerdown',{pointerId:8,bubbles:true}));};`);
    const unreach=await ev(`(()=>{const bad=[];for(const z of CB_PICS){LT.pic=z.id;ltGo('color');z.areas.forEach((_,i)=>{if(!cbSpot(i))bad.push(z.id+':'+i);});}return bad.join(' ');})()`);
    check('every area of all 12 pictures can be tapped', unreach==='', unreach);
    await ev(`P().little.colors={};P().little.pay={day:'',n:0};ltGo('colorPick')`);
    await ev(`document.querySelector('#ltBody [data-pic=dino]').click()`); await sleep(150);
    check('tapping a picture opens it big, with crayons and ↩️ 🎲 🗑️ 🖼️ (all 48 px+)', await ev(`LT.view==='color'&&LT.pic==='dino'&&document.querySelectorAll('#cbCrayons .cb-crayon').length===10&&document.querySelectorAll('#ltBody [data-cbt]').length===4&&[...document.querySelectorAll('#cbCrayons .cb-crayon,#ltBody [data-cbt]')].every(b=>b.getBoundingClientRect().width>=48&&b.getBoundingClientRect().height>=48)`));
    await ev(`crTap(3)`);
    check('tapping a crayon picks it', await ev(`LT.crayon===3&&document.querySelector('#cbCrayons [data-cr="3"]').classList.contains('on')`));
    const lc0=await ev('P().coins');
    await ev(`cbTap(5)`);
    check('tapping an area fills it with that crayon, and it is saved', await ev(`document.querySelector('#cbSvg [data-a="5"]').getAttribute('fill')==='#ffd166'&&P().little.colors.dino[5]==='#ffd166'`));
    await ev(`crTap(5);cbTap(5)`);
    await ev(`document.querySelector('#ltBody [data-cbt=undo]').click()`); await sleep(50);
    check('↩️ takes back the last fill', await ev(`P().little.colors.dino[5]==='#ffd166'&&document.querySelector('#cbSvg [data-a="5"]').getAttribute('fill')==='#ffd166'`));
    check('nothing is finished yet: no coins', await ev(`P().coins===${lc0}&&P().stats.colored===0`));
    await ev(`crTap(4);[1,2,3,4,6,7].forEach(i=>cbTap(i))`); await sleep(100);
    check('coloring every area (not the background) finishes it: 🌟, +1 coin', await ev(`cbDone(P(),cbPic('dino'))&&P().stats.colored===1&&P().coins===${lc0}+1&&!!document.querySelector('.cb-star')`), await ev(`P().coins-${lc0}`));
    await shot('L03-color-dino');
    await ev(`crTap(6);cbTap(0)`);
    check('the background can be colored too (no coin, it was already finished)', await ev(`P().little.colors.dino[0]==='#4d7cff'&&P().coins===${lc0}+1`));
    await ev(`save()`);
    check('the colors are in the saved data', await ev(`JSON.parse(localStorage.getItem('hangoutRoom.v1')).profiles.find(p=>p.id===P().id).little.colors.dino[5]==='#ffd166'`));
    await ev(`ltBackKey()`); await sleep(100);
    check('Back goes to the pictures; the finished one has a ⭐ and shows its colors', await ev(`LT.view==='colorPick'&&document.querySelector('#ltBody [data-pic=dino]').classList.contains('done')&&!!document.querySelector('#ltBody [data-pic=dino] path[fill="#ffd166"]')`));
    await ev(`document.querySelector('#ltBody [data-pic=rocket]').click()`); await sleep(100);
    await ev(`document.querySelector('#ltBody [data-cbt=dice]').click()`); await sleep(100);
    check('🎲 colors every area at once (and finishing that way counts)', await ev(`P().little.colors.rocket.every(c=>CB_CRAYONS.includes(c))&&P().stats.colored===2&&P().coins===${lc0}+2`));
    await ev(`document.querySelector('#ltBody [data-cbt=clear]').click()`); await sleep(100);
    check('🗑️ asks first with picture buttons', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&!!document.querySelector('#modal .cb-ask svg')&&P().little.colors.rocket.some(Boolean)`));
    await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(100);
    check('✔ starts the picture again', await ev(`P().little.colors.rocket.every(c=>!c)&&[...document.querySelectorAll('#cbSvg [data-a]')].every(e=>e.getAttribute('fill')==='#fff')`));
    // 🖼️ hang it up
    await ev(`LT.pic='dino';ltGo('color');P().artPay={day:'',n:0}`); await sleep(50);
    const hc0=await ev('P().coins'), hd0=await ev('P().stats.drawings');
    check('🖼️ Hang it up puts the picture in the Art Desk Gallery', await ev(`cbHang()`)===true);
    check('…as a new drawing: +5 art coins, counted as a drawing', await ev(`P().coins===${hc0}+5&&P().stats.drawings===${hd0}+1&&P().artPay.n===1`), await ev(`P().coins-${hc0}`));
    check('…the drawing is a real 800 x 560 picture in her Gallery', await ev(`myArt().then(l=>{const r=l.find(x=>x.id===P().little.hung.dino.art);if(!r||!/^data:image/.test(r.ink)||!r.thumb)return false;return new Promise(ok=>{const i=new Image();i.onload=()=>ok(i.width===800&&i.height===560);i.onerror=()=>ok(false);i.src=r.ink;});})`));
    check('hanging it again with the same colors does nothing new', await ev(`cbHang().then(r=>r===false&&P().coins===${hc0}+5&&/in your Gallery/.test(document.querySelector('#toast').textContent))`));
    await ev(`crTap(0);cbTap(1)`);
    const hid=await ev('P().little.hung.dino.art');
    check('after changing a color, it updates the same drawing (no more coins)', await ev(`cbHang().then(r=>r===true&&P().little.hung.dino.art==='${hid}'&&P().coins===${hc0}+5&&P().stats.drawings===${hd0}+1)`));
    check('a blank picture can\'t be hung', await ev(`(LT.pic='robot',P().little.colors.robot=[],cbHang()).then(r=>r===false)`));
    // 🎵 Sound Mat
    await ev(`ltGo('menu')`); await ev(`document.querySelector('[data-lt=mat]').click()`); await sleep(150);
    check('🎵 the Sound Mat: 8 huge pads', await ev(`LT.view==='mat'&&document.querySelectorAll('#ltMat .lt-pad').length===8&&[...document.querySelectorAll('#ltMat .lt-pad')].every(b=>b.getBoundingClientRect().width>=100&&b.getBoundingClientRect().height>=100)`));
    check('the notes are C D E G A only (any taps sound nice together)', await ev(`LT_NOTES.length===8&&LT_NOTES.every(n=>[0,2,4,7,9].includes(n.m%12))`));
    await shot('L04-sound-mat');
    const pd0=await ev('P().stats.pads');
    await ev(`DB.settings.sound=true;['0','5'].forEach((k,j)=>{const el=document.querySelector('#ltMat [data-pad="'+k+'"]');el.dispatchEvent(new PointerEvent('pointerdown',{pointerId:20+j,bubbles:true}));})`);
    check('two fingers play two pads at once (each bounces, both counted)', await ev(`P().stats.pads===${pd0}+2&&document.querySelectorAll('#ltMat .lt-pad.hit').length===2`));
    await ev(`document.querySelector('[data-mat=fun]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`); await sleep(50);
    check('🥁 Fun sounds: 8 pads, each named for Read to me, and every sound plays', await ev(`LT.mat==='fun'&&document.querySelectorAll('#ltMat .lt-pad').length===8&&[...document.querySelectorAll('#ltMat .lt-pad')].every(b=>speakLabel(b).length>2)&&(LT_FUN.forEach(x=>x.s()),true)`));
    check('the Sound Mat pays nothing', await ev(`P().coins===${hc0}+5`));
    // 👀 Peekaboo
    await ev(`ltGo('menu')`); await ev(`document.querySelector('[data-lt=peek]').click()`); await sleep(200);
    check('👀 Peekaboo: 6 big hiding spots on the tablet, one friend behind one of them', await ev(`LT.view==='peek'&&document.querySelectorAll('#ltPeek [data-spot]').length===6&&LT.peek.friend>=0&&LT.peek.friend<6&&[...document.querySelectorAll('#ltPeek [data-spot]')].every(g=>g.getBoundingClientRect().width>=100)`));
    check('the friends who can hide: 6 visitors and her buddy (and her pet once she has one)', await ev(`(f=>f.length>=7&&f.some(x=>x.k==='buddy')&&f.every(x=>x.art().length>50))(ltFriends(P()))`));
    await shot('L05-peekaboo');
    const pk0=await ev('P().coins'), pp0=await ev('P().stats.peeks');
    await ev(`window.pkTap=i=>document.querySelector('#ltPeek [data-spot="'+i+'"]').dispatchEvent(new PointerEvent('pointerdown',{pointerId:30,bubbles:true}))`);
    await ev(`pkTap((LT.peek.friend+1)%6)`); await sleep(100);
    check('an empty spot shows a surprise, never a "wrong", and the game goes on', await ev(`LT.peek.open.length===1&&!LT.peek.found&&document.querySelector('#ltPeek [data-spot="'+((LT.peek.friend+1)%6)+'"]').classList.contains('open')&&P().coins===${pk0}`));
    await ev(`pkTap(LT.peek.friend)`); await sleep(500);
    check('finding the friend: Peekaboo!, +1 coin, counted', await ev(`LT.peek.found&&!!document.querySelector('#ltPeek .lt-boo')&&P().coins===${pk0}+1&&P().stats.peeks===${pp0}+1`));
    await shot('L06-peekaboo-found');
    await ev(`pkTap((LT.peek.friend+2)%6)`);
    check('taps after finding wait for the next round', await ev(`P().coins===${pk0}+1&&LT.peek.open.length===2`));
    await sleep(2500);
    check('a new round starts by itself (no timer to beat)', await ev(`!LT.peek.found&&LT.peek.open.length===0&&!document.querySelector('#ltPeek .lt-boo')`));
    await ev(`pkTap(LT.peek.friend);ltGo('menu');ltGo('peek')`);
    check('leaving right after finding a friend: coming back starts a fresh round', await ev(`!LT.peek.found&&LT.peek.open.length===0`));
    // coins: 10 a day in all
    await ev(`P().little.pay={day:ltToday(),n:9};LT.noted=''`);
    const cc0=await ev('P().coins');
    await ev(`ltPay();ltPay()`);
    check('+1 coins stop at 10 a day', await ev(`P().coins===${cc0}+1&&P().little.pay.n===10`));
    await sleep(1000);
    check('…with a gentle note that it keeps working for fun', await ev(`/full for today/.test(document.querySelector('#toast').textContent)`));
    await ev(`P().little.pay.day='Mon Jan 01 2001';ltPay()`);
    check('a new day pays again', await ev(`P().coins===${cc0}+2&&P().little.pay.n===1`));
    // stickers
    check('6 stickers on the 🧸 Play page', await ev(`!!STK_PAGES.little&&STICKERS.filter(s=>s.page==='little').length===6`));
    check('First Colors and On the Wall are earned; Little Artist counts finished pictures', await ev(`(g=>stkDone(P(),g('lt1'))&&stkDone(P(),g('lthang'))&&stkHave(P(),g('lt12'))===1&&!stkDone(P(),g('lt12')))(id=>STICKERS.find(s=>s.id===id))`));
    check('Little Artist needs all 12 pictures', await ev(`(()=>{const q=JSON.parse(JSON.stringify(P()));CB_PICS.forEach(z=>{q.little.colors[z.id]=z.areas.map(()=>'#ff8cc6');});return stkDone(q,STICKERS.find(s=>s.id==='lt12'));})()`));
    // Back
    await ev(`ltGo('mat')`);
    check('Android Back: a toy → the 🧸 menu → the room', await ev(`androidBack()&&LT.view==='menu'&&cur==='little'&&androidBack()&&cur==='room'`));
    await ev(`show('little');LT.view='color';LT.pic='dino';renderLittle()`);
    check('Back from a picture goes to the pictures', await ev(`androidBack()&&LT.view==='colorPick'`));
    // phones
    await send('Emulation.setDeviceMetricsOverride',{width:360,height:740,deviceScaleFactor:1,mobile:true});
    await ev(`show('room')`); await sleep(200);
    check('phone 360 px: 🧸 fits in the room bar (icon only, 48 px+)', await ev(`(()=>{const t=document.querySelector('#scr-room .topbar'),b=document.querySelector('#littleBtn').getBoundingClientRect();return t.scrollWidth<=t.clientWidth&&b.right<=innerWidth&&b.width>=48;})()`));
    await shot('L07-phone-room-bar');
    await send('Emulation.setDeviceMetricsOverride',{width:412,height:860,deviceScaleFactor:1,mobile:true});
    await ev(`show('little');ltGo('menu')`); await sleep(150);
    check('phone: the 3 menu buttons fit', await ev(`[...document.querySelectorAll('#ltBody .lt-big')].every(b=>{const r=b.getBoundingClientRect();return r.right<=innerWidth&&r.bottom<=innerHeight&&r.height>=100;})`));
    await ev(`LT.pic='house';ltGo('color')`); await sleep(200);
    await shot('L08-phone-color');
    check('phone: the picture, the crayons and the tools fit on screen', await ev(`[...document.querySelectorAll('#cbSvg,#cbCrayons .cb-crayon,#ltBody [data-cbt]')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.width>=48;})&&document.querySelector('#cbSvg').getBoundingClientRect().width>=300`));
    await ev(`ltGo('mat')`); await sleep(150);
    check('phone: 8 pads fit (2 across)', await ev(`[...document.querySelectorAll('#ltMat .lt-pad')].every(b=>{const r=b.getBoundingClientRect();return r.right<=innerWidth&&r.bottom<=innerHeight&&r.height>=60;})`));
    await ev(`LT.peek=null;ltGo('peek')`); await sleep(150);
    check('phone: Peekaboo has 4 big spots', await ev(`document.querySelectorAll('#ltPeek [data-spot]').length===4&&[...document.querySelectorAll('#ltPeek [data-spot]')].every(g=>g.getBoundingClientRect().width>=80)`));
    await shot('L09-phone-peekaboo');
    await send('Emulation.setDeviceMetricsOverride',{width:860,height:412,deviceScaleFactor:1,mobile:true});
    await ev(`LT.pic='robot';ltGo('color')`); await sleep(200);
    await shot('L10-landscape-color');
    check('phone landscape: the picture and crayons fit', await ev(`[...document.querySelectorAll('#cbSvg,#cbCrayons .cb-crayon,#ltBody [data-cbt]')].every(e=>{const r=e.getBoundingClientRect();return r.right<=innerWidth+1&&r.bottom<=innerHeight+1;})&&document.querySelector('#cbSvg').getBoundingClientRect().height>=200`));
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    // backups
    const ltB=await ev(`JSON.stringify(DB)`);
    await ev(`(()=>{const d=JSON.parse(${JSON.stringify(ltB)});d.version=26;d.profiles.forEach(p=>{delete p.little;delete p.stats.colored;delete p.stats.peeks;delete p.stats.pads;});doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('a v1.45 backup restores with nothing colored yet', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>Object.keys(p.little.colors).length===0&&p.little.pay.n===0&&p.stats.colored===0)`));
    await ev(`closeModal();doRestore(${JSON.stringify(ltB)})`); await sleep(400);
    check('a v1.46 backup keeps the colors and the hung pictures', await ev(`DB.profiles.some(p=>p.little.colors.dino&&p.little.colors.dino[5]==='#ffd166'&&p.little.hung.dino)`));
    await ev(`closeModal();(()=>{const d=JSON.parse(${JSON.stringify(ltB)});d.profiles[0].little={colors:{dino:['red',5,'#12345g','#ABCDEF'],x:'no'},hung:{a:{art:3}},pay:[]};doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('odd Play data is made safe', await ev(`(l=>l.colors.dino.join()===',,,#ABCDEF'&&!('x' in l.colors)&&Object.keys(l.hung).length===0&&l.pay.n===0)(DB.profiles[0].little)`));
    await ev(`closeModal();stkPaused=false;show('room')`);
    check('v1.46 is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.46')`));
  }

  console.log('Dance Maker (v1.47)');
  {
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`closeModal();stkPaused=true;P().easy=false;goRoom(1);show('room')`); await sleep(300);
    check('save version 28 or later; every room has an empty dance to start', await ev(`DB_VERSION>=28&&DB.profiles.every(p=>p.dance&&p.dance.cur===DN_EMPTY&&p.dance.slots.length===3&&Array.isArray(p.dance.songs)&&p.dance.pay.n===0)`));
    check('8 moves, one letter each (saved ids), and 3 ideas that use only them', await ev(`DN_CODES.join('')==='hspwbcjo'&&DN_IDEAS.length===3&&DN_IDEAS.every(z=>dnOk(z.g)&&(z.music==='beat'||SONGS[z.music]))`));
    // the Stage sign hangs over the Loft keyboard (v1.47, the owner's request)
    await ev(`goRoom(2)`); await sleep(300);
    check('the Loft: the 🎤 Stage sign hangs on the wall right above the 🎹 keyboard', await ev(`(()=>{const m=document.querySelector('#roomSvg [data-hot=stage] rect').getBoundingClientRect(),k=document.querySelector('#roomSvg [data-hot=music] rect').getBoundingClientRect();return m.bottom<k.top&&Math.abs((m.left+m.right)/2-(k.left+k.right)/2)<k.width*0.2;})()`));
    await ev(`P().easy=true;applyEasy();renderRoom()`); await sleep(150);
    check('Easy mode: the 🎹 Music label does not cover the Stage sign', await ev(`(()=>{const m=document.querySelector('#roomSvg [data-hot=stage] rect').getBoundingClientRect(),s=document.querySelector('#roomSvg [data-hot=music] .sign').getBoundingClientRect();return s.top>=m.bottom;})()`));
    await shot('D01-loft-stage-sign'); await ev(`P().easy=false;applyEasy();goRoom(1);show('room')`);
    // from the Music Maker
    await ev(`P().music.cur=MU_EMPTY;show('music')`); await sleep(150);
    check('the Music Maker has a 💃 Dance button', await ev(`!!document.querySelector('#muDance')&&speakLabel(document.querySelector('#muDance'))==='Dance Maker'`));
    await ev(`document.querySelector('#muDance').click()`); await sleep(200);
    check('💃 opens the Dance Maker: 8 empty beats, 8 big moves, ⬅ Music', await ev(`cur==='dance'&&document.querySelectorAll('#dnSlots .dn-slot').length===8&&!document.querySelector('#dnSlots .full')&&document.querySelectorAll('#dnMoves .dn-move').length===8&&[...document.querySelectorAll('#dnMoves .dn-move,#dnSlots .dn-slot')].every(b=>b.getBoundingClientRect().height>=48)&&document.querySelector('#dnBack').textContent.includes('Music')`));
    check('the buddy is a picture (drawn once), and the music starts on the 🥁 Beat', await ev(`document.querySelector('#dnBuddy').src.startsWith('data:image/svg+xml')&&dnMusic(P()).id==='beat'`));
    check('the main loop rests while nothing plays', await ev('!loopOn'));
    await ev(`['h','s','c'].forEach(c=>document.querySelector('#dnMoves [data-move='+c+']').click())`);
    check('tapping moves fills the beats in order', await ev(`P().dance.cur==='hsc.....'&&document.querySelectorAll('#dnSlots .full').length===3`));
    check('…and the buddy shows the move', await ev(`document.querySelector('#dnDancer').classList.contains('dm-c')`));
    await ev(`document.querySelector('#dnSlots [data-beat="1"]').click()`);
    check('tapping a beat takes its move out (the others stay in place)', await ev(`P().dance.cur==='h.c.....'`));
    await ev(`document.querySelector('#dnMoves [data-move=w]').click()`);
    check('the next move fills the empty beat', await ev(`P().dance.cur==='hwc.....'`));
    await ev(`P().dance.cur='hwcbpjso';renderDance()`);
    await ev(`document.querySelector('#dnMoves [data-move=h]').click()`);
    check('when all 8 are full, a move just shows itself (with a note)', await ev(`P().dance.cur==='hwcbpjso'&&document.querySelector('#toast').textContent.includes('full')`));
    await shot('D02-dance-maker');
    // playing
    await ev(`DB.settings.music=true;document.querySelector('#dnPlay').click()`); await sleep(1300);
    check('▶ Play: the dance plays on the beat (main loop on, a beat lit, a move on)', await ev(`DN.playing&&loopOn&&DN.last>=1&&!!document.querySelector('#dnSlots .dn-slot.now')&&/dm-/.test(document.querySelector('#dnDancer').className)`), await ev(`JSON.stringify({p:DN.playing,l:DN.last,c:document.querySelector('#dnDancer').className})`));
    await ev(`startMusic()`);
    check('the room music stays quiet while she dances', await ev(`musicTimer===null`));
    check('the hint says 🕺 tap a move to dance it now', await ev(`document.querySelector('#dnHint').textContent.includes('dance it now')`));
    await shot('D03-dancing');
    await ev(`document.querySelector('#dnMoves [data-move=o]').click()`);
    check('🕺 free dance: a move tapped while playing waits for the next beat and does not change the dance', await ev(`DN.next==='o'&&P().dance.cur==='hwcbpjso'`));
    await sleep(800);
    check('…and the buddy does it on the beat', await ev(`DN.next===null`));
    await ev(`document.querySelector('#dnPlay').click()`); await sleep(100);
    check('⏹ Stop stops the dance and the main loop', await ev(`!DN.playing&&!loopOn&&!document.querySelector('#dnSlots .now')`));
    await ev(`DB.settings.music=false;stopMusic()`);
    // music choices
    await ev(`P().music.cur=MU_IDEAS[0].rows.join('');P().music.slots=[null,{g:MU_IDEAS[1].rows.join(''),kit:'soft',speed:1},null];document.querySelector('#dnMusic').click()`); await sleep(150);
    check('🎵 lists the Beat, My loop, saved loops and every Stage song', await ev(`[...document.querySelectorAll('#modalBody [data-mus]')].map(b=>b.dataset.mus).join()===['beat','loop','m1',...SONG_IDS].join()`));
    await shot('D04-music-pick');
    await ev(`document.querySelector('#modalBody [data-mus=m1]').click()`); await sleep(100);
    check('picking one saves it and shows it on the button', await ev(`P().dance.music==='m1'&&document.querySelector('#dnMusic').textContent.includes('Loop 2')&&document.querySelector('#modal').classList.contains('hidden')`));
    await ev(`dnPlay()`); await sleep(300);
    check('a saved loop plays at its own speed', await ev(`DN.kind==='loop'&&Math.abs(DN.beat-60/MU_SPEEDS[1].bpm)<1e-6`));
    await ev(`dnStop();P().dance.music='bats';dnPlay()`); await sleep(200);
    check('a Stage song plays at its own beat', await ev(`DN.kind==='song'&&DN.song==='bats'&&Math.abs(DN.beat-60/SONGS.bats.bpm)<1e-6`));
    await ev(`dnBeat(P(),8);dnBeat(P(),16)`);
    check('a whole round danced to a song counts it (once)', await ev(`P().dance.songs.join()==='bats'`));
    await ev(`DN.t0-=DN.end+1`); await sleep(200);
    check('the song ends by itself', await ev(`!DN.playing&&!loopOn`));
    await ev(`P().dance.music='nope'`);
    check('an unknown music id falls back to the Beat', await ev(`dnMusic(P()).id==='beat'`));
    // saving and coins
    await ev(`P().dance.pay={day:'',n:0};P().dance.slots=[null,null,null];P().dance.cur='hh......';renderDance();document.querySelector('#dnSaves [data-slot="0"]').click()`); await sleep(100);
    check('a dance with fewer than 3 moves is not saved', await ev(`P().dance.slots[0]===null`));
    const dn0=await ev(`P().coins`);
    await ev(`P().dance.cur='hhc.....';document.querySelector('#dnSaves [data-slot="0"]').click()`); await sleep(100);
    check('saving a new dance pays 3 coins', await ev(`P().dance.slots[0]==='hhc.....'&&P().coins===${dn0}+3&&P().dance.pay.n===1`), await ev(`P().coins-${dn0}`));
    await ev(`document.querySelector('#dnSaves [data-slot="0"]').click()`); await sleep(100);
    check('a full slot asks: Load or Save mine here', await ev(`document.querySelector('#modalTitle').textContent.includes('Dance 1')`));
    await ev(`document.querySelectorAll('#modalBtns button')[1].click()`); await sleep(100);
    check('saving the same dance again pays nothing', await ev(`P().coins===${dn0}+3`));
    await ev(`P().dance.cur='hhcc....';document.querySelector('#dnSaves [data-slot="1"]').click()`); await sleep(100);
    await ev(`P().dance.cur='hhccc...';document.querySelector('#dnSaves [data-slot="2"]').click()`); await sleep(100);
    await ev(`P().dance.cur='hhcccc..';document.querySelector('#dnSaves [data-slot="2"]').click()`); await sleep(100); await ev(`document.querySelectorAll('#modalBtns button')[1].click()`); await sleep(100);
    check('after 3 a day, saving still works but pays nothing (with a gentle note)', await ev(`P().coins===${dn0}+9&&P().dance.slots[2]==='hhcccc..'&&document.querySelector('#toast').textContent.includes('done for today')`), await ev(`P().coins-${dn0}`));
    await ev(`P().dance.pay.day='Mon Jan 01 2001';P().dance.cur='jjj.....';document.querySelector('#dnSaves [data-slot="1"]').click()`); await sleep(100); await ev(`document.querySelectorAll('#modalBtns button')[1].click()`); await sleep(100);
    check('a new day pays again', await ev(`P().coins===${dn0}+12&&P().dance.pay.n===1`));
    await ev(`document.querySelector('#dnSaves [data-slot="0"]').click()`); await sleep(100); await ev(`document.querySelectorAll('#modalBtns button')[0].click()`); await sleep(100);
    check('▶ Load puts a saved dance back', await ev(`P().dance.cur==='hhc.....'`));
    await ev(`P().dance.cur='pppp....';document.querySelector('#dnIdeas').click()`); await sleep(100); await ev(`document.querySelectorAll('#modalBtns button')[1].click()`); await sleep(100);
    check('loading an idea over a dance that is not saved asks first', await ev(`document.querySelector('#modalTitle').textContent.includes('not saved')&&P().dance.cur==='pppp....'`));
    await ev(`document.querySelectorAll('#modalBtns button')[1].click()`); await sleep(100);
    check('…and Load anyway loads the idea with its music', await ev(`P().dance.cur===DN_IDEAS[1].g&&P().dance.music===DN_IDEAS[1].music`));
    await ev(`P().dance.slots[0]=P().dance.cur;document.querySelector('#dnClear').click()`); await sleep(100); await ev(`document.querySelectorAll('#modalBtns button')[1].click()`); await sleep(100);
    check('🗑️ Clear empties the dance (saved dances stay)', await ev(`P().dance.cur===DN_EMPTY&&P().dance.slots.every(Boolean)`));
    // stickers
    check('3 Dance stickers on the Stage page', await ev(`['dance1','dance8','dance3'].every(id=>(s=>s&&s.page==='stage')(STICKERS.find(s=>s.id===id)))`));
    check('First Dance: a saved dance', await ev(`(s=>stkDone(P(),s)&&!stkDone(Object.assign({},P(),{dance:{cur:DN_EMPTY,slots:[null,null,null],songs:[]}}),s))(STICKERS.find(s=>s.id==='dance1'))`));
    check('All the Moves: all 8 moves in one dance (not spread over two)', await ev(`(s=>stkDone(Object.assign({},P(),{dance:{cur:'hspwbcjo',slots:[null,null,null],songs:[]}}),s)&&!stkDone(Object.assign({},P(),{dance:{cur:'hspw....',slots:['bcjo....',null,null],songs:[]}}),s))(STICKERS.find(s=>s.id==='dance8'))`));
    check('Dance Party: 3 different Stage songs', await ev(`(s=>!stkDone(P(),s)&&stkDone(Object.assign({},P(),{dance:{cur:DN_EMPTY,slots:[null,null,null],songs:['bats','neon','dino']}}),s))(STICKERS.find(s=>s.id==='dance3'))`));
    // getting there and back
    check('Android Back goes from the Dance Maker to the Music Maker', await ev(`androidBack()&&cur==='music'`));
    await ev(`P().dance.music='beat';show('stage')`); await sleep(200);
    check('the Stage has a 💃 Dance tab', await ev(`!!document.querySelector('#stgTabs [data-dance]')`));
    const lvBefore=await ev(`P().stage.level`);
    await ev(`document.querySelector('#stgTabs [data-dance]').click()`); await sleep(200);
    check('💃 on the Stage opens the Dance Maker on a song, ⬅ Stage', await ev(`cur==='dance'&&!!SONGS[P().dance.music]&&document.querySelector('#dnBack').textContent.includes('Stage')`));
    check('the 💃 tab does not change the song level', await ev(`P().stage.level===${JSON.stringify(lvBefore)}`));
    await ev(`document.querySelector('#dnBack').click()`); await sleep(150);
    check('⬅ goes back to the Stage song list', await ev(`cur==='stage'&&STG.state==='pick'`));
    await ev(`dnOpen('stage');dnPlay()`); await sleep(150);
    await ev(`Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))`); await sleep(100);
    check('switching away from the app stops the dance', await ev(`!DN.playing`));
    await ev(`dnPlay();show('room')`); await sleep(100);
    check('leaving the screen stops the dance', await ev(`!DN.playing&&!loopOn`));
    // sizes
    await ev(`P().dance.cur='hspwbcjo';P().easy=true;show('dance')`); await sleep(200);
    check('Easy mode: moves are bigger (76 px)', await ev(`document.querySelector('#dnMoves .dn-move').getBoundingClientRect().height>=76`));
    await shot('D05-easy-dance'); await ev(`P().easy=false;show('dance')`);
    const dnEls=`[...document.querySelectorAll('#dnPlay,#dnMusic,#dnSlots .dn-slot,#dnMoves .dn-move,#dnSaves .dn-save,#dnIdeas,#dnClear,#dnDancer')]`;
    for(const [w,h,name] of [[412,860,'phone'],[360,740,'small phone'],[860,412,'phone landscape'],[1180,820,'tablet'],[820,1180,'tablet upright']]){
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<1000});
      await ev(`show('dance')`); await sleep(250);
      check(name+': the dancer, the beats, the moves and the buttons fit on screen', await ev(`${dnEls}.every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.top>=0;})`), await ev(`${dnEls}.filter(e=>{const r=e.getBoundingClientRect();return !(r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.top>=0);}).map(e=>(e.id||e.className)+':'+JSON.stringify(e.getBoundingClientRect())).join(' ')`));
      check(name+': taps are 44 px or more and the buddy is easy to see', await ev(`[...document.querySelectorAll('#dnSlots .dn-slot,#dnMoves .dn-move')].every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44;})&&document.querySelector('#dnDancer').getBoundingClientRect().height>=110`), await ev(`JSON.stringify([document.querySelector('#dnSlots .dn-slot').getBoundingClientRect().width,document.querySelector('#dnMoves .dn-move').getBoundingClientRect().height,document.querySelector('#dnDancer').getBoundingClientRect().height])`));
      await shot('D06-'+name.replace(/ /g,'-'));
    }
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    // backups
    const dnB=await ev(`JSON.stringify(DB)`);
    await ev(`(()=>{const d=JSON.parse(${JSON.stringify(dnB)});d.version=27;d.profiles.forEach(p=>delete p.dance);doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('a v1.46 backup restores with no dances yet', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.dance.cur===DN_EMPTY&&p.dance.slots.every(s=>s===null)&&p.dance.music==='beat')`));
    await ev(`closeModal();doRestore(${JSON.stringify(dnB)})`); await sleep(400);
    check('a v1.47 backup keeps the dances', await ev(`DB.profiles.some(p=>p.dance.cur==='hspwbcjo'&&p.dance.slots[0]===DN_IDEAS[1].g)`));
    await ev(`closeModal();(()=>{const d=JSON.parse(${JSON.stringify(dnB)});d.profiles[0].dance={cur:'hhhhhhhx',music:7,slots:['hs......','abc',null,'jjjjjjjj'],songs:['bats','bats',3],pay:'x'};doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('odd dance data is made safe', await ev(`(d=>d.cur===DN_EMPTY&&d.music==='beat'&&d.slots.length===3&&d.slots[0]==='hs......'&&d.slots[1]===null&&d.songs.join()==='bats'&&d.pay.n===0)(DB.profiles[0].dance)`));
    await ev(`closeModal();stkPaused=false;show('room')`);
    check('v1.47 is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.47')`));
  }

  console.log('Backyard Garden (v1.48)');
  {
    const gdDay=n=>{const d=new Date(Date.UTC(2026,10,19+n));return d.toISOString().slice(0,10);};
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`closeModal();stkPaused=true;P().easy=false;window.FP_TEST_DAY='${gdDay(0)}';goRoom(1);show('room')`); await sleep(300);
    check('save version 29 or later; every room has an empty garden of 6 plots', await ev(`DB_VERSION>=29&&DB.profiles.every(p=>p.garden&&p.garden.plots.length===6&&p.garden.plots.every(x=>x===null)&&p.garden.grown.length===0&&p.stats.planted===0&&p.stats.harvests===0)`));
    check('12 seeds with different ids: 4 free, the others 5–15 coins', await ev(`GD_SEEDS.length===12&&new Set(GD_SEEDS.map(s=>s.id)).size===12&&GD_SEEDS.filter(s=>!s.price).length===4&&GD_SEEDS.filter(s=>s.price).every(s=>s.price>=5&&s.price<=15)`));
    check('every plant draws at every step (and in a pot)', await ev(`GD_SEEDS.every(s=>[0,1,2,3].every(k=>{const h=gdPlant(s.id,k);return h.length>80&&!/undefined|NaN/.test(h);})&&!/undefined|NaN/.test(gdPlant(s.id,3,true)))`));
    check('every seed has a pot: a prize (never in the Shop) with a theme chip and 🌳 Outdoor', await ev(`GD_SEEDS.every(s=>{const k=gdPotKey(s),d=DECOR[k];return d&&d.award&&!d.price&&themesOf('decor:'+k,d).includes('yard')&&themesOf('decor:'+k,d).includes(s.th)&&!/undefined|NaN/.test(d.d());})`));
    check('the Star Flower and Moon Bell pots glow at night', await ev(`!!NIGHT_GLOW.potStar&&!!NIGHT_GLOW.potMoonbell`));
    // the Backyard shed
    await ev(`goRoom(3)`); await sleep(300);
    check('the Backyard shed is now the 🌱 Garden hotspot (Read to me: Garden)', await ev(`!!document.querySelector('#roomSvg [data-hot=garden][data-piece=shed]')&&HOT_WORDS.garden==='Garden'`));
    await ev(`P().easy=true;applyEasy();renderRoom()`); await sleep(150);
    check('Easy mode: a 🌱 Garden label over the shed, inside the picture', await ev(`(()=>{const s=document.querySelector('#roomSvg [data-hot=garden] .sign'),r=s&&s.getBoundingClientRect(),w=roomSvg.getBoundingClientRect();return !!s&&s.textContent.includes('Garden')&&r.right<=w.right+1&&r.top>=w.top;})()`));
    await shot('G01-yard-shed'); await ev(`P().easy=false;applyEasy();renderRoom()`);
    await ev(`document.querySelector('#roomSvg [data-hot=garden]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(250);
    check('tapping the shed opens the Garden: 6 empty plots, 12 seed packets, ⬅ Yard', await ev(`cur==='garden'&&document.querySelectorAll('#gdBed .gd-plot.gd-empty').length===6&&document.querySelectorAll('#gdSeeds .gd-seed').length===12&&document.querySelector('#gdBack').textContent.includes('Yard')`));
    check('seeds to buy show a price; free ones do not', await ev(`GD_SEEDS.every(s=>!!document.querySelector('#gdSeeds [data-seed="'+s.id+'"] .tp')===!!s.price)`));
    // planting: plot first
    const gc0=await ev(`P().coins`);
    await ev(`document.querySelector('#gdBed [data-plot="0"]').click()`); await sleep(80);
    check('tapping an empty plot picks it and the seed tray glows', await ev(`GD.plot===0&&document.querySelector('#gdBed [data-plot="0"]').classList.contains('on')&&document.querySelector('#gdTray').classList.contains('pick')&&document.querySelector('#gdHint').textContent.includes('seed')`));
    await ev(`document.querySelector('#gdSeeds [data-seed=sunflower]').click()`); await sleep(80);
    check('…then a seed plants it there (free, no question)', await ev(`(x=>x&&x.seed==='sunflower'&&x.day===FP_TEST_DAY&&x.step===0)(P().garden.plots[0])&&P().coins===${gc0}&&P().stats.planted===1&&document.querySelector('#modal').classList.contains('hidden')&&!document.querySelector('#gdTray').classList.contains('pick')`));
    // planting: seed first, several in a row
    await ev(`GD.sel='';renderGarden();document.querySelector('#gdSeeds [data-seed=tulip]').click()`); await sleep(80);
    check('tapping a seed picks it', await ev(`GD.sel==='tulip'&&document.querySelector('#gdSeeds [data-seed=tulip]').classList.contains('on')`));
    await ev(`document.querySelector('#gdBed [data-plot="1"]').click()`); await sleep(60); await ev(`document.querySelector('#gdBed [data-plot="2"]').click()`); await sleep(60);
    check('…then each empty plot tapped gets one', await ev(`P().garden.plots[1].seed==='tulip'&&P().garden.plots[2].seed==='tulip'&&P().stats.planted===3`));
    // buying a seed
    await ev(`P().coins=50;updateCoins();document.querySelector('#gdSeeds [data-seed=star]').click()`); await sleep(100);
    check('a seed to buy asks first', await ev(`!document.querySelector('#modal').classList.contains('hidden')&&!P().owned.includes('seed:star')`));
    await ev(`document.querySelectorAll('#modalBtns button')[1].click()`); await sleep(100);
    check('…buying it costs its price once, then it is picked', await ev(`P().owned.includes('seed:star')&&P().coins===50-GD_SEEDS.find(s=>s.id==='star').price&&GD.sel==='star'&&!document.querySelector('#gdSeeds [data-seed=star] .tp')`));
    await ev(`document.querySelector('#gdBed [data-plot="3"]').click()`); await sleep(60);
    check('a bought seed plants like a free one', await ev(`P().garden.plots[3].seed==='star'`));
    await shot('G02-garden-planted');
    // growing by the date
    const stepsAt=async n=>{await ev(`FP_TEST_DAY='${gdDay(n)}';renderGarden()`);await sleep(50);return ev(`P().garden.plots.slice(0,4).map(x=>gdStep(x)).join()`);};
    check('the day it is planted: a seed', (await stepsAt(0))==='0,0,0,0');
    check('the next day: a sprout', (await stepsAt(1))==='1,1,1,1');
    check('2 days: a bud', (await stepsAt(2))==='2,2,2,2');
    check('3 days: ready, with a glow and ✨', (await stepsAt(3))==='3,3,3,3'&&await ev(`document.querySelectorAll('#gdBed .gd-plot.ready .gd-tag').length===4&&document.querySelector('#gdBed [data-plot="0"]').getAttribute('aria-label')==='Sunflower, ready to pick'`));
    check('weeks later: still ready, never wilted', (await stepsAt(30))==='3,3,3,3');
    check('if the date goes backwards, plants keep how big they were', (await stepsAt(-5))==='3,3,3,3');
    await shot('G03-garden-ready');
    // watering is just for fun
    await ev(`FP_TEST_DAY='${gdDay(4)}';GD.sel='';renderGarden();document.querySelector('#gdBed [data-plot="4"]').click()`); await sleep(60);
    await ev(`document.querySelector('#gdSeeds [data-seed=strawberry]').click()`); await sleep(60);
    const gdBefore=await ev(`JSON.stringify(P().garden)`);
    await ev(`document.querySelector('#gdBed [data-plot="4"]').click()`); await sleep(60);
    check('tapping a growing plant waters it: a wiggle and a note, nothing saved changes', await ev(`document.querySelector('#gdBed [data-plot="4"]').classList.contains('wet')&&JSON.stringify(P().garden)===${JSON.stringify(gdBefore)}&&/growing/.test(document.querySelector('#toast').textContent)&&!/day|tomorrow/.test(document.querySelector('#toast').textContent)`));
    await ev(`document.querySelector('#gdWater').click()`); await sleep(200);
    check('💧 waters every growing plant, and changes nothing saved', await ev(`JSON.stringify(P().garden)===${JSON.stringify(gdBefore)}`));
    // the shed's flower box
    await ev(`show('room')`); await sleep(200);
    check('the shed\'s flower box shows up to 3 plants ready to pick', await ev(`document.querySelector('#roomSvg [data-gbox]').dataset.gbox==='3'`));
    await ev(`document.querySelector('#roomSvg [data-hot=garden]').dispatchEvent(new MouseEvent('click',{bubbles:true}))`); await sleep(200);
    // picking
    const gc1=await ev(`P().coins`), items0=await ev(`P().room3.items.length`);
    await ev(`document.querySelector('#gdBed [data-plot="0"]').click()`); await sleep(150);
    check('picking a ready plant: +3 coins and the plot is empty again', await ev(`P().coins===${gc1}+3&&P().garden.plots[0]===null&&P().stats.harvests===1&&document.querySelector('#gdBed [data-plot="0"]').classList.contains('gd-empty')`));
    check('the first Sunflower: a 🪴 pot in the Backyard, with a box', await ev(`P().garden.grown.join()==='sunflower'&&P().room3.items.length===${items0}+1&&P().room3.items.some(i=>i.type==='potSunflower'&&i.placed)&&document.querySelector('#modalTitle').textContent.includes('pot')`));
    await shot('G04-new-pot'); await ev(`closeModal()`);
    await ev(`P().garden.plots[0]={seed:'sunflower',day:FP_TEST_DAY,step:3};renderGarden();document.querySelector('#gdBed [data-plot="0"]').click()`); await sleep(150);
    check('another Sunflower: +3 again, but no second pot and no box', await ev(`P().coins===${gc1}+6&&P().room3.items.filter(i=>i.type==='potSunflower').length===1&&document.querySelector('#modal').classList.contains('hidden')&&P().stats.harvests===2`));
    await ev(`document.querySelector('#gdBed [data-plot="1"]').click()`); await sleep(150); await ev(`closeModal()`);
    check('a different kind gives its own pot', await ev(`P().garden.grown.join()==='sunflower,tulip'&&P().room3.items.some(i=>i.type==='potTulip')`));
    await ev(`show('room')`); await sleep(200);
    check('the pots are drawn in the Backyard', await ev(`!!document.querySelector('#roomSvg .deco[data-uid="'+P().room3.items.find(i=>i.type==='potTulip').uid+'"]')`));
    await shot('G05-yard-pots');
    check('pots are not sold in the Shop', await ev(`(()=>{enterDecorate();decoTab='shop';themePick.shop='all';renderDecoGrid();const t=document.querySelector('#decoGrid').innerHTML;exitDecorate();return !GD_SEEDS.some(s=>t.includes('"'+gdPotKey(s)+'"'));})()`));
    // stickers
    check('4 garden stickers on the Room & Style page', await ev(`['sprout1','harvest10','garden6','gardenAll'].every(id=>(s=>s&&s.page==='room')(STICKERS.find(s=>s.id===id)))`));
    check('First Sprout: a seed planted', await ev(`(s=>stkDone(P(),s)&&!stkDone(Object.assign({},P(),{stats:Object.assign({},P().stats,{planted:0})}),s))(STICKERS.find(s=>s.id==='sprout1'))`));
    check('Green Thumb: 10 plants picked', await ev(`(s=>!stkDone(P(),s)&&stkDone(Object.assign({},P(),{stats:Object.assign({},P().stats,{harvests:10})}),s))(STICKERS.find(s=>s.id==='harvest10'))`));
    check('Garden Party: all 6 plots growing at once', await ev(`(s=>!stkDone(P(),s)&&stkDone(Object.assign({},P(),{garden:{plots:Array(6).fill({seed:'tulip',day:FP_TEST_DAY,step:0}),grown:[]}}),s))(STICKERS.find(s=>s.id==='garden6'))`));
    check('Master Gardener: every kind grown once', await ev(`(s=>!stkDone(P(),s)&&stkDone(Object.assign({},P(),{garden:{plots:[],grown:GD_SEEDS.map(x=>x.id)}}),s))(STICKERS.find(s=>s.id==='gardenAll'))`));
    // Back
    await ev(`show('garden')`); await sleep(150);
    check('Android Back goes from the Garden to the Backyard', await ev(`androidBack()&&cur==='room'&&roomNo===3`));
    // layouts
    const gdEls=`[...document.querySelectorAll('#gdBed .gd-plot,#gdSeeds .gd-seed,#gdWater,#gdHint')]`;
    for(const [w,h,name] of [[412,860,'phone'],[360,740,'small phone'],[860,412,'phone landscape'],[1180,820,'tablet'],[820,1180,'tablet upright']]){
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<1000});
      await ev(`show('garden')`); await sleep(250);
      check(name+': the plots, the seeds and the buttons fit on screen', await ev(`${gdEls}.every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.top>=0;})`), await ev(`${gdEls}.filter(e=>{const r=e.getBoundingClientRect();return !(r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.top>=0);}).map(e=>(e.id||e.className)+':'+JSON.stringify(e.getBoundingClientRect())).join(' ')`));
      check(name+': seed packets are 48 px or more and plots are big', await ev(`[...document.querySelectorAll('#gdSeeds .gd-seed,#gdWater')].every(e=>{const r=e.getBoundingClientRect();return r.width>=47.5&&r.height>=47.5;})&&[...document.querySelectorAll('#gdBed .gd-plot')].every(e=>{const r=e.getBoundingClientRect();return r.width>=96&&r.height>=96;})`), await ev(`JSON.stringify([document.querySelector('#gdSeeds .gd-seed').getBoundingClientRect().width,document.querySelector('#gdBed .gd-plot').getBoundingClientRect().width,document.querySelector('#gdBed .gd-plot').getBoundingClientRect().height])`));
      await shot('G06-'+name.replace(/ /g,'-'));
    }
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    // backups
    const gdB=await ev(`JSON.stringify(DB)`);
    await ev(`show('room');(()=>{const d=JSON.parse(${JSON.stringify(gdB)});d.version=28;d.profiles.forEach(p=>{delete p.garden;delete p.stats.planted;delete p.stats.harvests;});doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('a v1.47 backup restores with an empty garden', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.garden.plots.every(x=>x===null)&&p.garden.grown.length===0&&p.stats.harvests===0)`));
    await ev(`closeModal();doRestore(${JSON.stringify(gdB)})`); await sleep(400);
    check('a v1.48 backup keeps the plants and what was grown', await ev(`DB.profiles.some(p=>p.garden.plots[3]&&p.garden.plots[3].seed==='star'&&p.garden.grown.includes('tulip'))`));
    await ev(`closeModal();(()=>{const d=JSON.parse(${JSON.stringify(gdB)});d.profiles[0].garden={plots:[{seed:'tulip',day:'yesterday'},{seed:'nope',day:'2026-11-19',step:9},'x',{seed:4,day:'2026-11-19'}],grown:['tulip','tulip',5]};doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('odd garden data is made safe (an unknown seed just shows an empty plot)', await ev(`(g=>g.plots.length===6&&g.plots[0]===null&&g.plots[1].step===3&&g.plots[2]===null&&g.plots[3]===null&&g.grown.join()==='tulip'&&gdPlot(DB.profiles[0],1)===null)(DB.profiles[0].garden)`));
    await ev(`closeModal();stkPaused=false;delete window.FP_TEST_DAY;show('room')`);
    check('v1.48 is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.48')`));
  }

  console.log('I Spy (v1.49)');
  {
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`closeModal();stkPaused=true;P().easy=false;Object.keys(P().night).forEach(k=>delete P().night[k]);window.FP_TEST_DAY='2026-11-19';goRoom(1);show('room')`); await sleep(300);
    check('save version 30 or later; every room starts I Spy on ⭐ with nothing spied', await ev(`DB_VERSION>=30&&DB.profiles.every(p=>p.spy&&p.spy.lvl===1&&p.spy.rooms.length===0&&p.spy.pay.n===0&&p.stats.spied===0&&p.stats.spyRounds===0)`));
    check('the 🔍 button sits on the room picture, right of 🌙, 48 px or more', await ev(`(()=>{const b=document.querySelector('#spyBtn'),n=document.querySelector('#nightBtn'),r=b.getBoundingClientRect(),q=n.getBoundingClientRect();return !b.classList.contains('hidden')&&r.width>=48&&r.height>=48&&r.left>=q.right&&Math.abs(r.top-q.top)<2&&b.getAttribute('aria-label')==='I Spy';})()`));
    // the Studio: 4 known things (2 spooky, 2 cute) and the pet bed
    await ev(`{const p=P();window.spyKeep=JSON.stringify(p.room4.items);p.room4.items=[{uid:'sp1',type:'ghost',x:150,y:560,placed:true},{uid:'sp2',type:'moon',x:330,y:560,placed:true},{uid:'sp3',type:'plant',x:720,y:560,placed:true},{uid:'sp4',type:'starRug',x:500,y:690,placed:true}];goRoom(4);}`); await sleep(250);
    const spyFind=`(()=>{const t=spyThings().find(SPY.clue.ok);const r=t.el.getBoundingClientRect();t.el.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2}));return t.key;})()`;
    await ev(`document.querySelector('#spyBtn').click()`); await sleep(300);
    check('🔍 starts I Spy: the clue card takes the top bar\'s place, the room tabs and 📷 hide', await ev(`SPY.on&&!document.querySelector('#spyCard').classList.contains('hidden')&&getComputedStyle(document.querySelector('#scr-room .topbar')).display==='none'&&getComputedStyle(document.querySelector('#roomTabs')).display==='none'&&getComputedStyle(document.querySelector('#roomSnapBtn')).display==='none'`));
    check('the Studio has 5 things to spy (4 decorations + the pet), with names', await ev(`(a=>a.length===5&&a.every(t=>t.name&&!/undefined/.test(t.name))&&a.some(t=>t.key==='hot:pet'))(spyThings())`), await ev(`spyThings().map(t=>t.key).join()`));
    check('⭐ clue: "Find the …!" with a picture of the thing, and 5 dots', await ev(`/^Find the .+!$/.test(document.querySelector('#spyText').textContent)&&!!document.querySelector('#spyPic svg')&&!document.querySelector('#spyPic').classList.contains('hidden')&&document.querySelectorAll('#spyDots b').length===5`));
    check('every thing draws a clue picture', await ev(`spyThings().every(t=>{const h=spyPic(t.el);return h.startsWith('<svg viewBox=')&&!/NaN|undefined/.test(h);})`));
    await shot('S01-ispy-card');
    // a wrong tap
    const c0=await ev(`P().coins`);
    const wrong=await ev(`(()=>{const ok=spyThings().filter(SPY.clue.ok).map(t=>t.el.getBoundingClientRect());const w=spyThings().find(t=>{if(SPY.clue.ok(t))return false;const r=t.el.getBoundingClientRect();return ok.every(o=>r.right+20<o.left||r.left-20>o.right||r.bottom+20<o.top||r.top-20>o.bottom);});if(!w)return '';const r=w.el.getBoundingClientRect();w.el.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2}));return w.key;})()`);
    check('a wrong tap only says keep looking: nothing found, nothing lost, the same clue', !!wrong&&await ev(`SPY.found===0&&!!SPY.clue&&P().coins===${c0}&&P().stats.spied===0&&[...document.querySelectorAll('.float')].some(f=>f.textContent.includes('Keep looking'))`), wrong);
    await ev(`document.querySelector('#spyHint').click()`); await sleep(100);
    check('💡 rings the right thing', await ev(`(()=>{const g=document.querySelector('#spyRing ellipse'),t=spyThings().find(SPY.clue.ok);if(!g||!t)return false;const b=spyBox(t.el);return Math.abs(+g.getAttribute('cx')-b.cx)<2&&Math.abs(+g.getAttribute('cy')-b.cy)<2;})()`));
    await shot('S02-ispy-hint');
    await ev(`SPY.clue.ok=x=>x.key==='decor:ghost';document.querySelector('#roomSvg [data-hot=pet]').dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:5,clientY:5}))`); await sleep(150);
    check('while spying, tapping the pet doesn\'t open its menu', await ev(`document.querySelector('#modal').classList.contains('hidden')&&cur==='room'&&SPY.found===0`));
    await ev(`SPY.clue=null;SPY.used=[];spyNext()`);
    // a right tap with a real mouse click inside the thing
    const pt=await ev(`(()=>{const t=spyThings().find(SPY.clue.ok),r=t.el.getBoundingClientRect();for(const [a,b] of [[.5,.5],[.3,.3],[.7,.3],[.3,.7],[.7,.7],[.5,.15],[.5,.88]]){const x=r.left+r.width*a,y=r.top+r.height*b,e=document.elementFromPoint(x,y);if(e&&t.el.contains(e))return [x,y];}return null;})()`);
    await mouse('mousePressed',pt[0],pt[1]); await mouse('mouseReleased',pt[0],pt[1]); await sleep(100);
    check('a real tap on the thing finds it: a sparkle, a dot fills, 1 spied', await ev(`SPY.found===1&&P().stats.spied===1&&!!document.querySelector('#roomSvg .spy-spark')&&document.querySelectorAll('#spyDots b.on').length===1&&!document.querySelector('#spyRing')`));
    await sleep(800);
    check('…then the next clue comes, for a different thing', await ev(`!!SPY.clue&&SPY.used.length>=1&&!SPY.used.includes(SPY.clue.key)`));
    for(let i=0;i<3;i++){await ev(spyFind);await sleep(850);}
    check('no coins before the round is done', await ev(`P().coins===${c0}&&SPY.found===4`));
    await ev(spyFind); await sleep(900);
    check('5 finds: a cheer box, +2 coins, the Studio counted', await ev(`document.querySelector('#modalTitle').textContent.includes('Super spy')&&P().coins===${c0}+2&&P().stats.spyRounds===1&&P().stats.spied===5&&P().spy.rooms.join()==='4'&&P().spy.pay.n===2`));
    await shot('S03-ispy-done');
    await ev(`[...document.querySelectorAll('#modalBtns .btn')].find(b=>b.textContent.includes('Again')).click()`); await sleep(300);
    check('🔁 Again: a new round of 5', await ev(`SPY.on&&SPY.found===0&&!!SPY.clue&&document.querySelectorAll('#spyDots b.on').length===0`));
    // the daily limit
    await ev(`P().spy.pay={day:'2026-11-19',n:10}`); const c1=await ev(`P().coins`);
    for(let i=0;i<5;i++){await ev(spyFind);await sleep(850);}
    check('after 10 coins today a round still cheers, with no coins and a gentle note', await ev(`P().coins===${c1}&&document.querySelector('#modalBody').textContent.includes('full for today')&&P().stats.spyRounds===2`));
    check('Back on the cheer box ends I Spy', await ev(`androidBack()&&!SPY.on&&cur==='room'&&document.querySelector('#modal').classList.contains('hidden')&&getComputedStyle(document.querySelector('#scr-room .topbar')).display!=='none'`));
    await ev(`P().spy.pay={day:'2026-11-18',n:10}`); await ev(`document.querySelector('#spyBtn').click()`); await sleep(300); const c2=await ev(`P().coins`);
    for(let i=0;i<5;i++){await ev(spyFind);await sleep(850);}
    check('a new day pays again', await ev(`P().coins===${c2}+2&&P().spy.pay.day==='2026-11-19'&&P().spy.pay.n===2`));
    await ev(`[...document.querySelectorAll('#modalBtns .btn')].find(b=>b.textContent.includes('Again')).click()`); await sleep(300);
    // levels
    await ev(`document.querySelector('#spyLvl').click()`); await sleep(100);
    check('⭐⭐: the name only, no picture (remembered)', await ev(`P().spy.lvl===2&&document.querySelector('#spyLvl').textContent==='⭐⭐'&&document.querySelector('#spyPic').classList.contains('hidden')&&/^Find the .+!$/.test(document.querySelector('#spyText').textContent)`));
    await ev(`document.querySelector('#spyLvl').click()`); await sleep(100);
    check('⭐⭐⭐: a hint like "Find something 🦇 spooky!"', await ev(`P().spy.lvl===3&&!!SPY.clue.theme&&/^Find something .+!$/.test(document.querySelector('#spyText').textContent)&&document.querySelector('#spyText').textContent.includes(SPY_THEME_WORDS[SPY.clue.theme])`));
    const other=await ev(`(()=>{const t=spyThings().find(x=>SPY.clue.ok(x)&&x.key!==SPY.clue.key);if(!t)return '';const r=t.el.getBoundingClientRect();t.el.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2}));return t.key;})()`);
    check('a hint is met by any thing with that theme', !!other&&await ev(`SPY.found===1`), other);
    await sleep(850);
    check('every theme chip but Dreams has hint words', await ev(`Object.keys(THEMES).filter(t=>t!=='all'&&t!=='dream').every(t=>SPY_THEME_WORDS[t])`));
    await ev(`document.querySelector('#spyLvl').click()`); await sleep(100);
    check('the level button goes round to ⭐ again', await ev(`P().spy.lvl===1`));
    await ev(`P().spy.lvl=3;P().easy=true;applyEasy();spyNext()`); await sleep(100);
    check('Easy mode: always the picture clue, no level button', await ev(`!!document.querySelector('#spyPic svg')&&document.querySelector('#spyLvl').classList.contains('hidden')&&/^Find the/.test(document.querySelector('#spyText').textContent)`));
    await shot('S04-ispy-easy');
    await ev(`P().easy=false;applyEasy();spyNext()`);
    // night: the flashlight
    await ev(`document.querySelector('#nightBtn').click()`); await sleep(200);
    check('🌙 while spying: the room goes dark with a 🔦 light, and I Spy goes on', await ev(`SPY.on&&!!SPY.clue&&!!document.querySelector('#spyDark #spyLight')&&!!document.querySelector('#roomSvg .night')`));
    const lp=await ev(`(()=>{const r=roomSvg.getBoundingClientRect();return [r.left+r.width*0.8,r.top+r.height*0.75];})()`);
    await mouse('mouseMoved',lp[0],lp[1]); await sleep(60);
    check('the light follows the finger (or mouse)', await ev(`(l=>{const q=toSvg({clientX:${lp[0]},clientY:${lp[1]}});return Math.abs(+l.getAttribute('cx')-q.x)<2&&Math.abs(+l.getAttribute('cy')-q.y)<2;})(document.querySelector('#spyLight'))`), await ev(`[document.querySelector('#spyLight').getAttribute('cx'),document.querySelector('#spyLight').getAttribute('cy')]`));
    check('spying still works in the dark', await ev(`spyThings().length===5`));
    await shot('S05-ispy-flashlight');
    await ev(`document.querySelector('#spyX').click()`); await sleep(200);
    check('✖ ends I Spy: the top bar is back and the flashlight is gone (night stays on)', await ev(`!SPY.on&&document.querySelector('#spyCard').classList.contains('hidden')&&!document.querySelector('#spyDark')&&!!document.querySelector('#roomSvg .night')&&getComputedStyle(document.querySelector('#scr-room .topbar')).display!=='none'`));
    await ev(`document.querySelector('#nightBtn').click()`); await sleep(150);
    // too few things
    await ev(`P().room4.items=[{uid:'sp1',type:'ghost',x:150,y:560,placed:true}];renderRoom();document.querySelector('#spyBtn').click()`); await sleep(250);
    check('a room with fewer than 3 things: Fuzzy asks for more, I Spy doesn\'t start', await ev(`!SPY.on&&document.querySelector('#bubble').textContent.includes('few more things')&&getComputedStyle(document.querySelector('#scr-room .topbar')).display!=='none'`));
    await ev(`P().room4.items=JSON.parse(window.spyKeep);save();goRoom(1)`); await sleep(250);
    // the other rooms
    const counts=await ev(`[1,2,3].map(n=>{goRoom(n);SPY.on=true;document.body.classList.add('spying');const k=spyThings().map(t=>t.key);SPY.on=false;document.body.classList.remove('spying');return k;})`);
    check('her Room, the Loft and the Backyard each have 3+ things to spy, furniture too', counts.every(k=>k.length>=3)&&counts[0].includes('hot:closet')&&counts[1].includes('hot:music')&&counts[2].includes('hot:garden'), counts);
    await ev(`goRoom(1);renderRoom();document.querySelector('#spyBtn').click()`); await sleep(250);
    check('Back while spying ends I Spy and stays in the room', await ev(`SPY.on&&androidBack()&&!SPY.on&&cur==='room'&&roomNo===1`));
    await ev(`document.querySelector('#spyBtn').click()`); await sleep(250); await ev(`show('closet')`); await sleep(150);
    check('leaving the room ends I Spy', await ev(`!SPY.on&&!document.body.classList.contains('spying')`));
    await ev(`show('room');enterDecorate()`); await sleep(150);
    check('🔍 hides while decorating', await ev(`document.querySelector('#spyBtn').classList.contains('hidden')`));
    await ev(`exitDecorate()`); await sleep(150);
    // stickers
    check('3 I Spy stickers on the Room & Style page', await ev(`['spy1','spy100','spyAll'].every(id=>(s=>s&&s.page==='room')(STICKERS.find(s=>s.id===id)))`));
    check('Sharp Eyes is done after a round; Spy Everywhere needs all 4 rooms', await ev(`(s=>stkDone(P(),s))(STICKERS.find(s=>s.id==='spy1'))&&(s=>!stkDone(P(),s)&&stkDone(Object.assign({},P(),{spy:{lvl:1,rooms:[1,2,3,4],pay:{day:'',n:0}}}),s))(STICKERS.find(s=>s.id==='spyAll'))`));
    // layouts
    for(const [w,h,name] of [[412,860,'phone'],[360,740,'small phone'],[860,412,'phone landscape'],[1180,820,'tablet'],[820,1180,'tablet upright']]){
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<1000});
      await ev(`spyEnd();goRoom(1);show('room')`); await sleep(250);
      check(name+': the 🔍 button fits', await ev(`(r=>r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&r.width>=48)(document.querySelector('#spyBtn').getBoundingClientRect())`));
      await ev(`document.querySelector('#spyBtn').click()`); await sleep(400);
      const els=`[...document.querySelectorAll('#spyCard .spy-b:not(.hidden),#spyText')]`;
      check(name+': the clue card and its 48 px buttons fit on screen', await ev(`SPY.on&&${els}.every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1&&(e.id==='spyText'||(r.width>=48&&r.height>=48));})`), await ev(`${els}.map(e=>e.id+':'+JSON.stringify(e.getBoundingClientRect())).join(' ')`));
      await shot('S06-'+name.replace(/ /g,'-'));
    }
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`spyEnd();show('room')`);
    // backups
    const spB=await ev(`JSON.stringify(DB)`);
    await ev(`(()=>{const d=JSON.parse(${JSON.stringify(spB)});d.version=29;d.profiles.forEach(p=>{delete p.spy;delete p.stats.spied;delete p.stats.spyRounds;});doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('a v1.48 backup restores with nothing spied yet', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.spy.lvl===1&&p.spy.rooms.length===0&&p.stats.spied===0&&p.stats.spyRounds===0)`));
    await ev(`closeModal();doRestore(${JSON.stringify(spB)})`); await sleep(400);
    check('a v1.49 backup keeps the rounds and rooms', await ev(`DB.profiles.some(p=>p.stats.spyRounds===3&&p.spy.rooms.includes(4))`));
    await ev(`closeModal();(()=>{const d=JSON.parse(${JSON.stringify(spB)});d.profiles[0].spy={lvl:9,rooms:[4,4,'x',7,2],pay:'no'};d.profiles[0].stats.spied=-3;doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('odd I Spy data is made safe', await ev(`(s=>s.lvl===1&&s.rooms.join()==='4,2'&&s.pay.n===0&&s.pay.day===''&&DB.profiles[0].stats.spied===0)(DB.profiles[0].spy)`));
    await ev(`closeModal();stkPaused=false;delete window.FP_TEST_DAY;show('room')`);
    check('v1.49 is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.49')`));
  }

  console.log('New things to spend coins on (v1.50)');
  {
    const mb=t=>`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes(${JSON.stringify(t)}))`;
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`closeModal();stkPaused=true;{const p=P();p.easy=false;applyEasy();Object.keys(p.night).forEach(k=>delete p.night[k]);p.coins=1000;}goRoom(1);show('room')`); await sleep(300);
    check('save version 31 or later; every room has the cushion and the Classic backdrop', await ev(`DB_VERSION>=31&&DB.version===DB_VERSION&&DB.profiles.every(p=>p.pet.home===''&&p.stage.backdrop==='classic')`));
    check('save version 31 adds the home and backdrop to older saves', await ev(`(()=>{const d={profiles:[{name:'Old',pet:{kind:'bat'},stage:{level:'easy'}}]};MIGRATIONS[31](d);return d.profiles[0].pet.home===''&&d.profiles[0].stage.backdrop==='classic';})()`));
    // 🏠 pet homes
    await ev(`{const p=P();p.pet.kind='bat';if(!('bat' in p.pet.hearts))p.pet.hearts.bat=0;renderRoom();}`); await sleep(150);
    check('8 pet homes to buy, 12-30 coins, with different ids', await ev(`(e=>e.length===8&&e.every(([k,H])=>H.price>=12&&H.price<=30&&H.name&&H.icon))(Object.entries(PET_HOMES))`));
    check('before buying one, the pet sits on the cushion bed', await ev(`petHomeId(P())===''&&!!document.querySelector('#petG [data-ph=cushion]')`));
    await ev(`petMenu()`); await sleep(150);
    check('the pet menu has a 🏠 Home button', await ev(`!!document.querySelector('#modalBody [data-pa=home]')`));
    await ev(`document.querySelector('#modalBody [data-pa=home]').click()`); await sleep(150);
    check('🏠 Home shows the cushion (picked) and the 8 homes with prices', await ev(`document.querySelectorAll('#modalBody [data-home]').length===9&&document.querySelector('#modalBody [data-home=""]').classList.contains('on')&&document.querySelectorAll('#modalBody [data-home] .tp').length===8`));
    await shot('CS1-pet-homes');
    const homeBad=[];
    for(const id of await ev(`Object.keys(PET_HOMES)`)){
      const before=await ev(`P().coins`);
      await ev(`document.querySelector('#modalBody [data-home=${id}]').click()`); await sleep(80);
      await ev(`${mb('Yes, get it!')}.click()`); await sleep(120);
      const ok=await ev(`(()=>{const p=P();return p.pet.home==='${id}'&&p.owned.includes('pethome:${id}')&&p.coins===${before}-PET_HOMES['${id}'].price&&!!document.querySelector('#petG [data-ph=${id}]')&&!!document.querySelector('#modalBody [data-home=${id}].on');})()`);
      // a home stays in the pet's spot (the screenshots show it stays clear of the buddy)
      const fit=await ev(`(b=>b.x>=-66&&b.x+b.width<=66&&b.y>=-140&&b.y+b.height<=8.5)(document.querySelector('#petG [data-ph=${id}]').getBBox())`);
      if(!ok||!fit) homeBad.push(id+(ok?'':' buy')+(fit?'':' size '+JSON.stringify(await ev(`(b=>[b.x,b.y,b.width,b.height].map(Math.round))(document.querySelector('#petG [data-ph=${id}]').getBBox())`))));
    }
    check('each home can be bought and is drawn under the pet; each fits the pet spot', homeBad.length===0, homeBad);
    await ev(`closeModal()`); await sleep(100); await shot('CS2-room-castle');
    await ev(`petHomes();document.querySelector('#modalBody [data-home=batTent]').click()`); await sleep(120);
    check('an owned home is picked again with no question and no coins', await ev(`P().pet.home==='batTent'&&!!document.querySelector('#modalBody [data-home=batTent].on')`));
    await ev(`document.querySelector('#modalBody [data-home=""]').click()`); await sleep(100);
    check('the cushion is free and can be picked back', await ev(`P().pet.home===''&&!!document.querySelector('#petG [data-ph=cushion]')`));
    await ev(`P().pet.home='cottage';closeModal();renderRoom()`);
    check('the home shows in every room', await ev(`[2,3,4,1].every(n=>{goRoom(n);return !!document.querySelector('#petG [data-ph=cottage]');})`));
    check('a home she does not own (an odd save) draws the cushion', await ev(`(()=>{const p=P();p.pet.home='castle';const o=p.owned;p.owned=o.filter(k=>k!=='pethome:castle');const r=petHomeArt(p).includes('data-ph="cushion"');p.owned=o;p.pet.home='cottage';return r;})()`));
    // 🎨 Stage backdrops
    await ev(`show('stage')`); await sleep(250);
    check('the Stage song list has a 🎨 Backdrop row: Classic (picked) + 7 to buy, 10-20 coins', await ev(`(b=>b.length===8&&document.querySelector('#stgBds [data-bd=classic]').classList.contains('on')&&document.querySelectorAll('#stgBds .tp').length===7&&Object.values(BACKDROPS).every(B=>B.price===0||(B.price>=10&&B.price<=20)))([...document.querySelectorAll('#stgBds [data-bd]')])`));
    check('each backdrop button has a picture and is 48 px or more', await ev(`[...document.querySelectorAll('#stgBds [data-bd]')].every(b=>{const r=b.getBoundingClientRect(),i=b.querySelector('img');return r.width>=48&&r.height>=48&&i&&/^data:image\\/png/.test(i.src);})`));
    await shot('CS3-stage-backdrops');
    const bdBad=[];
    for(const id of await ev(`Object.keys(BACKDROPS).filter(k=>BACKDROPS[k].price)`)){
      const before=await ev(`P().coins`);
      await ev(`document.querySelector('#stgBds [data-bd=${id}]').click()`); await sleep(80);
      await ev(`${mb('Yes, get it!')}.click()`); await sleep(120);
      const ok=await ev(`P().stage.backdrop==='${id}'&&P().owned.includes('backdrop:${id}')&&P().coins===${before}-BACKDROPS['${id}'].price&&document.querySelector('#stgBds [data-bd=${id}]').classList.contains('on')&&!document.querySelector('#stgBds [data-bd=${id}] .tp')`);
      await ev(`stStart('starlight')`); await sleep(500);
      const drawn=await ev(`BD.key.startsWith('${id}|')&&(()=>{const c=document.querySelector('#stgCv'),x=c.getContext('2d').getImageData(4,Math.round(c.height/2),1,1).data;return x[3]===255;})()`);
      await shot('CS4-backdrop-'+id);
      await ev(`stgPickView()`); await sleep(100);
      if(!ok||!drawn) bdBad.push(id+(ok?'':' buy')+(drawn?'':' draw'));
    }
    check('each backdrop can be bought, picked, and is drawn behind a song', bdBad.length===0, bdBad);
    await ev(`stStart('starlight')`); await sleep(300);
    const cv1=await ev(`(window.bdCv=BD.cv,1)`); await sleep(400);
    check('the backdrop is drawn once, not every frame', await ev(`BD.cv===window.bdCv&&STG.state==='play'`));
    await ev(`stgPickView();document.querySelector('#stgBds [data-bd=classic]').click()`); await sleep(100);
    check('Classic is free and can be picked back', await ev(`P().stage.backdrop==='classic'&&stgBdId(P())==='classic'`));
    check('a backdrop she does not own (an odd save) plays as Classic', await ev(`(()=>{const p=P();p.stage.backdrop='neon';const o=p.owned;p.owned=o.filter(k=>k!=='backdrop:neon');const r=stgBdId(p)==='classic';p.owned=o;p.stage.backdrop='galaxy';return r;})()`));
    for(const [w,h,name] of [[412,860,'phone'],[360,740,'small phone'],[820,1180,'tablet upright']]){
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true});
      await ev(`stgPickView()`); await sleep(200);
      check(name+': the backdrop buttons fit across the screen', await ev(`[...document.querySelectorAll('#stgBds [data-bd]')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.width>=48&&r.height>=48;})`));
      await ev(`document.querySelector('#stgBds').scrollIntoView()`); await sleep(100); await shot('CS5-'+name.replace(/ /g,'-'));
    }
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    // 🏛️ museum pieces
    await ev(`show('room');goRoom(4)`); await sleep(200);
    check('10 museum pieces, 6-35 coins, all with the 🏛️ Museum chip and none a prize', await ev(`SP_MUSEUM.length===10&&SP_MUSEUM.every(k=>DECOR[k]&&DECOR[k].price>=6&&DECOR[k].price<=35&&!DECOR[k].award&&themesOf('decor:'+k,DECOR[k]).includes('museum'))&&THEMES.museum.icon==='🏛️'`));
    check('🔍 I Spy has words for the Museum chip', await ev(`SPY_THEME_WORDS.museum==='for a museum'`));
    await ev(`enterDecorate();decoTab='shop';renderDecoGrid()`); await sleep(150);
    check('the Shop shows a 🏛️ Museum chip', await ev(`!!document.querySelector('#decoPanel [data-theme=museum]')`));
    await ev(`document.querySelector('#decoPanel [data-theme=museum]').click()`); await sleep(150);
    check('…which lists the 10 museum pieces', await ev(`SP_MUSEUM.every(k=>!!document.querySelector('#decoGrid [data-buy='+k+']'))&&document.querySelectorAll('#decoGrid [data-buy]').length===10`));
    await shot('CS6-shop-museum');
    await ev(`exitDecorate(true)`);
    // a pedestal carries what sits on it, drawn in front of it
    await ev(`{const p=P();window.muKeep=JSON.stringify(p.room4.items);p.room4.items=[{uid:'mu2',type:'plant',x:300,y:500,placed:true},{uid:'mu1',type:'pedestal',x:300,y:600,placed:true},{uid:'mu3',type:'velvetRope',x:620,y:640,placed:true},{uid:'mu4',type:'dinoBones',x:760,y:560,placed:true},{uid:'mu5',type:'wallCase',x:520,y:330,placed:true},{uid:'mu6',type:'spotlight',x:150,y:300,placed:true},{uid:'mu7',type:'goldFrame',x:860,y:300,placed:true},{uid:'mu8',type:'museumPlaque',x:520,y:400,placed:true},{uid:'mu9',type:'tallPedestal',x:120,y:640,placed:true},{uid:'mu10',type:'museumCounter',x:460,y:690,placed:true},{uid:'mu11',type:'museumBench',x:900,y:690,placed:true}];renderRoom();}`); await sleep(150);
    check('a thing dropped near a pedestal\'s top sits on it', await ev(`(()=>{const R=P().room4,t=R.items.find(i=>i.uid==='mu2');return snapToShelf(t)&&t.y===600-DECOR.pedestal.shelf.top;})()`));
    await ev(`renderRoom()`); await sleep(100);
    check('…and is drawn in front of the pedestal (its own y is higher up)', await ev(`(d=>d.indexOf('mu2')>d.indexOf('mu1')&&d.indexOf('mu1')>=0)([...document.querySelectorAll('#roomSvg .deco')].map(g=>g.dataset.uid))`));
    check('moving the pedestal takes it along', await ev(`onShelf(P().room4.items.find(i=>i.uid==='mu1')).map(i=>i.uid).join()==='mu2'`));
    check('a pedestal never sits on another shelf', await ev(`(()=>{const R=P().room4,t=R.items.find(i=>i.uid==='mu9'),y=t.y;t.x=520;t.y=330-44+5;const r=snapToShelf(t);t.x=120;t.y=y;return r===false;})()`));
    check('the spotlight glows at night', await ev(`!!NIGHT_GLOW.spotlight`));
    await shot('CS7-museum');
    // stickers
    check('3 new stickers: Home Sweet Home, Set Designer, Museum Maker', await ev(`[['petHome','room'],['backdrop','stage'],['museum3','room']].every(([id,pg])=>(s=>s&&s.page===pg)(STICKERS.find(s=>s.id===id)))`));
    check('…all done now (a home, a backdrop, 3+ museum pieces placed)', await ev(`['petHome','backdrop','museum3'].every(id=>stkDone(P(),STICKERS.find(s=>s.id===id)))`));
    // backups
    const spendB=await ev(`JSON.stringify(DB)`);
    await ev(`(()=>{const d=JSON.parse(${JSON.stringify(spendB)});d.version=30;d.profiles.forEach(p=>{delete p.pet.home;delete p.stage.backdrop;});doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('a v1.49 backup restores with the cushion and the Classic backdrop', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.pet.home===''&&p.stage.backdrop==='classic')`));
    await ev(`closeModal();doRestore(${JSON.stringify(spendB)})`); await sleep(400);
    check('a v1.50 backup keeps the home, the backdrop and what was bought', await ev(`DB.profiles.some(p=>p.pet.home==='cottage'&&p.stage.backdrop==='galaxy'&&p.owned.includes('pethome:castle')&&p.owned.includes('backdrop:neon'))`));
    await ev(`closeModal();(()=>{const d=JSON.parse(${JSON.stringify(spendB)});d.profiles[0].pet.home=5;d.profiles[0].stage.backdrop={};doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('odd home and backdrop data is made safe', await ev(`DB.profiles[0].pet.home===''&&DB.profiles[0].stage.backdrop==='classic'`));
    await ev(`closeModal();doRestore(${JSON.stringify(spendB)})`); await sleep(400);
    await ev(`closeModal();{const p=P();p.room4.items=JSON.parse(window.muKeep);}stkPaused=false;goRoom(1);show('room')`);
    check('v1.50 is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.50')`));
  }

  console.log('Runway (v1.51)');
  {
    const mb=t=>`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes(${JSON.stringify(t)}))`;
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`closeModal();stkPaused=true;window.RW_TEST_FAST=true;{const p=P();p.easy=false;applyEasy();p.coins=500;window.rwOwned=JSON.stringify(p.owned);window.rwLook=JSON.stringify(p.look);}goRoom(1);show('room')`); await sleep(300);
    check('save version 32; every room starts the Runway with nothing walked', await ev(`DB_VERSION>=32&&DB.profiles.every(p=>p.runway&&p.runway.cards.length===0&&p.runway.pay.n===0&&p.stats.walks===0&&p.stats.wows===0)`));
    check('save version 32 adds the Runway to older saves', await ev(`(()=>{const d={profiles:[{name:'Old'}]};MIGRATIONS[32](d);return d.profiles[0].runway.cards.length===0&&d.profiles[0].runway.pay.n===0;})()`));
    check('14 theme cards with different ids, 3 judges each (visitor friends), themes that exist', await ev(`RW_CARDS.length===14&&new Set(RW_CARDS.map(c=>c.id)).size===14&&RW_CARDS.every(c=>c.judges.length===3&&new Set(c.judges).size===3&&c.judges.every(j=>VISIT_FRIENDS[j])&&c.th.every(t=>THEMES[t])&&c.icon&&c.name&&c.say)`));
    const thin=await ev(`RW_CARDS.filter(c=>c.th.length&&RW_CATS.filter(k=>CLOSET[k].items.some(it=>rwFits(c,k,it))).length<3).map(c=>c.id)`);
    check('every themed card has matching clothes in 3 or more closet tabs', thin.length===0, thin);
    const weak=await ev(`RW_CARDS.filter(c=>Array.from({length:25}).some(()=>rwLevel(c,rwSurprise(c,P().look))<3)).map(c=>c.id)`);
    check('🎲 Theme surprise always gives 3+ matching pieces (🤩), for every card', weak.length===0, weak);
    // A picture made from an SVG must be strict XML: a repeated attribute (st() already has stroke-linejoin) shows a broken image
    // on the Runway, in the Dance Maker and in 📷 snapshots, though the same drawing looks fine inside the page (v1.51 fix).
    const xmlBad=await ev(`(async()=>{const bad=[],base=newProfile('x').look,X='xmlns="http://www.w3.org/2000/svg"';
      const xml=(s,t)=>{if(new DOMParser().parseFromString(s,'image/svg+xml').querySelector('parsererror'))bad.push(t);};
      const looks=[];Object.keys(BUDDIES).forEach(k=>looks.push(['kind:'+k,{kind:k}]));Object.keys(FACES).forEach(k=>looks.push(['face:'+k,{face:k}]));
      Object.keys(FUR).forEach(k=>looks.push(['fur:'+k,{fur:k}]));Object.keys(HAIR_COLORS).forEach(k=>looks.push(['hc:'+k,{hairColor:k}]));
      Object.keys(CLOSET).forEach(c=>CLOSET[c].items.forEach(it=>looks.push([c+':'+it.id,{[c]:it.id}])));
      looks.forEach(([t,L])=>xml(mascotSVG(Object.assign({},base,L),null,'width="200" height="270"'),t));
      Object.keys(DECOR).forEach(k=>xml('<svg '+X+'>'+DECOR[k].d({})+'</svg>','decor:'+k));
      xml('<svg '+X+'>'+furniture()+loftFurniture()+yardFurniture()+'</svg>','furniture');
      for(const k of ['dino','fox','bunny']){RW.imgKey='';const src=rwArt(Object.assign({},base,{kind:k}));
        if(!await new Promise(r=>{const i=new Image();i.onload=()=>r(true);i.onerror=()=>r(false);i.src=src;}))bad.push('image:'+k);}
      RW.imgKey='';return bad;})()`);
    check('every buddy, face, fur, hair color, closet item, decoration and room piece is strict XML (so its picture never breaks)', xmlBad.length===0, xmlBad);
    check('cheer levels: nothing matching = 💖 (level 0), Anything Goes = 🤩 always', await ev(`(()=>{const L=Object.assign({},P().look);RW_CATS.forEach(k=>L[k]='none');return rwLevel(rwCardOf('farm'),L)===0&&rwLevel(rwCardOf('any'),L)===3&&RW_CHEERS.length===4;})()`));
    // the way in
    await ev(`show('closet')`); await sleep(200);
    check('the Closet has a 👠 Runway button, 48 px or more', await ev(`(r=>r.width>=48&&r.height>=48)(document.querySelector('#runwayBtn').getBoundingClientRect())`));
    await ev(`document.querySelector('#runwayBtn').click()`); await sleep(200);
    check('…which opens 3 theme cards', await ev(`cur==='runway'&&RW.view==='cards'&&document.querySelectorAll('#rwCardList [data-card]').length===3`));
    await shot('RW1-cards');
    const first=await ev(`[...document.querySelectorAll('#rwCardList [data-card]')].map(b=>b.dataset.card).join()`);
    await ev(`document.querySelector('#rwShuffle').click()`); await sleep(100);
    check('🔀 shows 3 other cards', await ev(`[...document.querySelectorAll('#rwCardList [data-card]')].map(b=>b.dataset.card).join()`)!==first);
    // dress
    await ev(`RW.deck=RW_CARDS.map(c=>c.id).sort((a,b)=>(b==='farm')-(a==='farm'));RW.at=0;rwCards();document.querySelector('#rwCardList [data-card=farm]').click()`); await sleep(200);
    check('a card opens the dressing room on her own outfit, with 7 tabs (no Buddy, Fur or Face)', await ev(`RW.view==='dress'&&RW.card.id==='farm'&&RW_CATS.every(k=>RW.look[k]===P().look[k])&&document.querySelectorAll('#rwTabs [data-rcat]').length===7&&document.querySelector('#rwCardChip').textContent.includes('Farm Fair')`));
    check('matching clothes come first, marked ✨', await ev(`(t=>t.length>1&&t.findIndex(x=>!x.classList.contains('rw-fit')&&x.dataset.id!=='none')>t.findLastIndex(x=>x.classList.contains('rw-fit')))([...document.querySelectorAll('#rwGrid .tile')])`));
    const bor=await ev(`(t=>t&&t.dataset.id)(document.querySelector('#rwGrid .tile.rw-fit:has(.rw-borrow)'))`);
    check('clothes she does not own show 👜 (borrow) instead of a price', !!bor&&await ev(`!document.querySelector('#rwGrid .tile .tp:not(.rw-borrow)')`));
    await ev(`document.querySelector('#rwGrid [data-id="${bor}"]').click()`); await sleep(120);
    check('borrowing puts it on for the show only: her outfit, coins and things are unchanged', await ev(`RW.look[RW.cat]==='${bor}'&&JSON.stringify(P().look)===window.rwLook&&JSON.stringify(P().owned)===window.rwOwned&&P().coins===500`));
    check('…and the bag says what is borrowed', await ev(`document.querySelector('#rwBag').textContent.includes('borrowed')`));
    await ev(`document.querySelector('#rwSurprise').click()`); await sleep(150);
    check('🎲 Theme surprise lights all 3 sparkles', await ev(`rwMatches(RW.card,RW.look)>=3&&document.querySelectorAll('#rwSpark i.on').length===3`));
    await shot('RW2-dress');
    // walk
    await ev(`window.RW_TEST_FAST=false;document.querySelector('#rwWalk').click()`); await sleep(1500);
    check('🚶 Walk shows the catwalk, the buddy picture and 3 judges', await ev(`RW.view==='walk'&&RW.walking&&document.querySelector('#rwWalker.go')&&document.querySelector('#rwBuddyImg').src.startsWith('data:image/svg')&&document.querySelectorAll('#rwJudges .rw-judge svg').length===3`));
    await shot('RW3-walk');
    check('the room music rests during the walk', await ev(`musicTimer===null`));
    await ev(`rwBackKey()`); await sleep(100);
    check('Back during the walk stops it (no coins) and goes back to dressing', await ev(`!RW.walking&&RW.view==='dress'&&P().coins===500&&P().stats.walks===0`));
    await ev(`document.querySelector('#rwWalk').click()`); await sleep(4700);
    check('after the walk, the judges hold up 🤩 cheer cards', await ev(`[...document.querySelectorAll('#rwJudges .rw-judge')].every(j=>j.classList.contains('show')&&j.querySelector('.rw-cheer').textContent==='🤩')`));
    await shot('RW4-cheers'); await sleep(1800);
    check('then a cheer box: +3 coins, the walk and card counted, a 🤩 on a themed card', await ev(`/What a show/.test(document.querySelector('#modalTitle').textContent)&&P().coins===503&&P().stats.walks===1&&P().stats.wows===1&&P().runway.cards.join()==='farm'&&P().runway.pay.n===3`));
    check('…with 🔁 Another card and 🏠 Done; 👗 Wear it home only when something she owns would change', await ev(`!!(${mb('Another card')}&&${mb('Done')})&&!!${mb('Wear it home')}===RW_CATS.some(k=>RW.look[k]!==P().look[k]&&rwOwns(P(),k,RW.look[k]))`));
    check('…and her things are unchanged (nothing borrowed was kept)', await ev(`JSON.stringify(P().owned)===window.rwOwned&&JSON.stringify(P().look)===window.rwLook`));
    await shot('RW5-done');
    await ev(`${mb('Another card')}.click()`); await sleep(150);
    check('🔁 Another card goes back to the cards', await ev(`RW.view==='cards'&&document.querySelectorAll('#rwCardList [data-card]').length===3`));
    // the daily limit (fast walks from here)
    await ev(`window.RW_TEST_FAST=true;P().runway.pay.n=12;RW.card=rwCardOf('any');RW.look=Object.assign({},P().look);RW.view='dress';renderRunway();document.querySelector('#rwWalk').click()`); await sleep(400);
    check('Anything Goes gets 🤩 too, pays up to 15 a day, and is not a themed 🤩', await ev(`P().coins===506&&P().runway.pay.n===15&&P().stats.wows===1&&P().stats.walks===2&&P().runway.cards.includes('any')`));
    await ev(`closeModal();RW.view='dress';renderRunway();document.querySelector('#rwWalk').click()`); await sleep(400);
    check('after 15 coins a day it still plays, with a gentle note and no coins', await ev(`P().coins===506&&P().stats.walks===3&&document.querySelector('#modalBody').textContent.includes('full for today')`));
    await ev(`closeModal();P().runway.pay.day='old';RW.view='dress';renderRunway();rwWalk()`); await sleep(400);
    check('a new day pays again', await ev(`P().coins===509&&P().runway.pay.n===3`));
    // 👗 Wear it home: owned pieces only
    await ev(`closeModal()`);
    check('👗 Wear it home puts on the pieces she owns; borrowed ones go back (and are not owned)', await ev(`(()=>{const p=P(),own=CLOSET.top.items.find(i=>i.id!=='none'&&isOwned(p,'top',i)&&i.id!==p.look.top),not=CLOSET.legs.items.find(i=>!isOwned(p,'legs',i));
      RW.card=rwCardOf('any');RW.look=Object.assign({},p.look,{top:own.id,legs:not.id});const legs=p.look.legs;rwWearHome();
      return p.look.top===own.id&&p.look.legs===legs&&!p.owned.includes('legs:'+not.id)&&cur==='closet';})()`));
    await ev(`P().look=JSON.parse(window.rwLook);save()`);
    // Back
    await ev(`rwOpen();document.querySelector('#rwCardList [data-card]').click()`); await sleep(150);
    await ev(`androidBack()`); await sleep(100);
    check('Back: dressing room → cards', await ev(`cur==='runway'&&RW.view==='cards'`));
    await ev(`androidBack()`); await sleep(100);
    check('Back: cards → Closet', await ev(`cur==='closet'`));
    await ev(`rwOpen();document.querySelector('#rwCardList [data-card]').click();window.RW_TEST_FAST=false;rwWalk();show('room')`); await sleep(100);
    check('leaving the screen during a walk stops it', await ev(`!RW.walking&&RW.timers.length===0`));
    await ev(`window.RW_TEST_FAST=true`);
    // Easy mode and small screens
    await ev(`{const p=P();p.easy=true;}rwOpen()`); await sleep(150);
    await shot('RW6-easy-cards');
    for(const [w,h,name] of [[412,860,'phone'],[360,740,'small phone'],[820,1180,'tablet upright'],[860,412,'phone sideways']]){
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true});
      await ev(`RW.view='cards';renderRunway()`); await sleep(150);
      check(name+': the 3 cards and 🔀 fit on the screen', await ev(`[...document.querySelectorAll('#rwCardList [data-card]'),document.querySelector('#rwShuffle')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.height>=48;})&&document.documentElement.scrollWidth<=innerWidth+1`));
      await shot('RW7-'+name.replace(/ /g,'-')+'-cards');
      await ev(`document.querySelector('#rwCardList [data-card]').click()`); await sleep(150);
      check(name+': 🚶 Walk and 🎲 are on screen in the dressing room', await ev(`['#rwWalk','#rwSurprise'].every(s=>{const r=document.querySelector(s).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&r.right<=innerWidth+1&&r.height>=40;})`));
      await shot('RW7-'+name.replace(/ /g,'-')+'-dress');
      await ev(`window.RW_TEST_FAST=false;rwWalk()`); await sleep(1700);
      check(name+': the judges fit on the catwalk screen', await ev(`[...document.querySelectorAll('#rwJudges .rw-judge')].every(j=>{const r=j.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.height>40;})`));
      await shot('RW7-'+name.replace(/ /g,'-')+'-walk');
      await ev(`rwStop();window.RW_TEST_FAST=true;closeModal()`);
    }
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`P().easy=false;applyEasy();show('room')`);
    // stickers
    check('3 new stickers on the 🏠 Room & Style page: First Walk, Theme Hopper, Crowd Favorite', await ev(`['walk1','walk8','wow3'].every(id=>(s=>s&&s.page==='room')(STICKERS.find(s=>s.id===id)))`));
    check('…First Walk is done; Theme Hopper needs 8 cards, Crowd Favorite 3 🤩', await ev(`stkDone(P(),STICKERS.find(s=>s.id==='walk1'))&&!stkDone(P(),STICKERS.find(s=>s.id==='walk8'))&&(P().runway.cards=RW_CARDS.slice(0,8).map(c=>c.id),P().stats.wows=3,stkDone(P(),STICKERS.find(s=>s.id==='walk8'))&&stkDone(P(),STICKERS.find(s=>s.id==='wow3')))`));
    // backups
    const rwB=await ev(`JSON.stringify(DB)`);
    await ev(`(()=>{const d=JSON.parse(${JSON.stringify(rwB)});d.version=31;d.profiles.forEach(p=>{delete p.runway;delete p.stats.walks;delete p.stats.wows;});doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('a v1.50 backup restores with an empty Runway', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.runway.cards.length===0&&p.stats.walks===0&&p.stats.wows===0)`));
    await ev(`closeModal();doRestore(${JSON.stringify(rwB)})`); await sleep(400);
    check('a v1.51 backup keeps the cards walked and the counts', await ev(`DB.profiles.some(p=>p.runway.cards.length===8&&p.stats.walks===4&&p.stats.wows===3)`));
    await ev(`closeModal();(()=>{const d=JSON.parse(${JSON.stringify(rwB)});d.profiles[0].runway={pay:'x',cards:[5,'farm','farm']};d.profiles[0].stats.walks='lots';doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('odd Runway data is made safe', await ev(`DB.profiles[0].runway.pay.n===0&&DB.profiles[0].runway.cards.join()==='farm'&&DB.profiles[0].stats.walks===0`));
    await ev(`closeModal();doRestore(${JSON.stringify(rwB)})`); await sleep(400);
    await ev(`closeModal();stkPaused=false;window.RW_TEST_FAST=false;goRoom(1);show('room')`);
    check('v1.51 is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.51')`));
  }

  console.log('Stage Jam (v1.52)');
  {
    const mb=t=>`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes(${JSON.stringify(t)}))`;
    const box=`(!document.querySelector('#modal').classList.contains('hidden'))`, boxText=`document.querySelector('#modalBody').textContent`;
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`closeModal();stkPaused=true;window.FP_TEST_DAY='2026-12-01';{const p=P();p.easy=false;applyEasy();window.jmMusic=JSON.stringify(p.music);}goRoom(1);show('room')`); await sleep(300);
    check('save version 33; every room starts with the ✨ Sparkle sound and no jams', await ev(`DB_VERSION>=33&&DB.profiles.every(p=>p.jam&&p.jam.sound==='sparkle'&&p.jam.pay.n===0&&p.stats.jams===0&&p.stats.jamOwn===0)`));
    check('save version 33 adds the Jam to older saves', await ev(`(()=>{const d={profiles:[{name:'Old'}]};MIGRATIONS[33](d);return d.profiles[0].jam.sound==='sparkle'&&d.profiles[0].jam.pay.n===0;})()`));
    check('5 pads play the Music Maker notes C D E G A, low to high; 3 jam sounds', await ev(`JAM_PADS.map(x=>MU_ROWS[x.r].l).join('')==='CDEGA'&&JAM_PADS.every((x,i)=>!i||x.m>JAM_PADS[i-1].m)&&Object.keys(JAM_SOUNDS).join()==='sparkle,pluck,toot'`));
    // the way in, from the Stage
    await ev(`{const p=P();p.music.cur=MU_IDEAS[1].rows.join('');p.music.kit='soft';p.music.speed=1;p.music.slots=[null,{g:MU_IDEAS[0].rows.join(''),kit:'chip',speed:2},null];}show('stage')`); await sleep(200);
    check('the Stage has a 🎸 Jam tab (as big as the other tabs) that Read to me calls Jam', await ev(`(b=>!!b&&b.getBoundingClientRect().height>=document.querySelector('#stgTabs [data-dance]').getBoundingClientRect().height-1&&speakLabel(b)==='Jam')(document.querySelector('#stgTabs [data-jam]'))`));
    await ev(`document.querySelector('#stgTabs [data-jam]').click()`); await sleep(200);
    check('🎸 opens the loop picker: my loop now, my saved loop 2 and the 3 ideas', await ev(`JAM.pick&&!document.querySelector('#jamPick').classList.contains('hidden')&&document.querySelector('#stgPick').classList.contains('hidden')&&[...document.querySelectorAll('#jamLoops [data-loop]')].map(b=>b.dataset.loop).join()==='cur,s1,i0,i1,i2'&&document.querySelectorAll('#jamLoops .own').length===2&&document.querySelectorAll('#jamLoops svg').length===5`), await ev(`[...document.querySelectorAll('#jamLoops [data-loop]')].map(b=>b.dataset.loop).join()`));
    check('…with 3 jam sounds, ✨ Sparkle picked', await ev(`document.querySelectorAll('#jamSounds [data-snd]').length===3&&document.querySelector('#jamSounds [data-snd=sparkle]').classList.contains('on')`));
    await shot('J01-jam-pick');
    await ev(`document.querySelector('#jamSounds [data-snd=pluck]').click()`); await sleep(100);
    check('a jam sound is picked and remembered', await ev(`P().jam.sound==='pluck'&&jamSound(P())==='pluck'&&document.querySelector('#jamSounds [data-snd=pluck]').classList.contains('on')`));
    // jamming
    await ev(`window.jmCalls=0;window.jmOrig=muVoice;muVoice=function(){window.jmCalls++;return window.jmOrig.apply(null,arguments);};DB.settings.sound=true;document.querySelector('#jamLoops [data-loop=cur]').click()`); await sleep(200);
    check('a loop card starts the jam: the stage, the pads and ⏹️ Stop', await ev(`STG.state==='jam'&&JAM.on&&JAM.loop.id==='cur'&&!document.querySelector('#stgPlay').classList.contains('hidden')&&!document.querySelector('#jamStop').classList.contains('hidden')&&loopOn`));
    const steps=await ev(`new Promise(res=>{const s=new Set();const iv=setInterval(()=>s.add(JAM.step),40);setTimeout(()=>{clearInterval(iv);res(s.size);},2600);})`);
    check('the band plays the loop round and round (all 8 steps)', steps===8, steps);
    const live=await ev(`JAM.clock==='ac'`);
    check('the loop\'s notes are sent to the speaker'+(live?'':' (no audio clock here, skipped)'), !live||await ev(`window.jmCalls>0`), await ev(`window.jmCalls`));
    await ev(`muVoice=window.jmOrig`);
    const cv=await ev(`(()=>{const r=document.querySelector('#stgCv').getBoundingClientRect();return {x:r.left,y:r.top,xs:JAM.g.xs,yh:JAM.g.yh,pr:JAM.g.pr,w:r.width,h:r.height};})()`);
    for(const x of cv.xs){await mouse('mousePressed',cv.x+x,cv.y+cv.yh);await mouse('mouseReleased',cv.x+x,cv.y+cv.yh);}
    check('tapping the 5 pads plays 5 notes', await ev(`JAM.notes===5`), await ev(`JAM.notes`));
    await stroke(cv.xs.map(x=>[cv.x+x,cv.y+cv.yh]));
    check('sliding across the pads plays a run (one note per pad)', await ev(`JAM.notes===10`), await ev(`JAM.notes`));
    await mouse('mousePressed',cv.x+cv.w/2,cv.y+cv.h*0.15); await mouse('mouseReleased',cv.x+cv.w/2,cv.y+cv.h*0.15);
    check('a tap on her buddy (above the stage) is not a note', await ev(`JAM.notes===10`));
    check('the pads fit on the screen', cv.xs.every(x=>x-cv.pr>=0&&x+cv.pr<=cv.w)&&cv.yh+cv.pr<=cv.h);
    for(const snd of ['sparkle','pluck','toot']) await ev(`(ac()&&jamVoice(0,AC.currentTime+0.01,'${snd}'),1)`);
    check('every jam sound plays without errors', true);
    await ev(`for(let i=0;i<6;i++)jamPlay(i%5)`); await sleep(300);
    check('the crowd cheers every 16 notes', await ev(`JAM.cheers===1&&JAM.fx.some(o=>o.big)`));
    await shot('J02-jam-playing');
    // stop
    const c0=await ev('P().coins');
    await ev(`JAM.notes=12;document.querySelector('#jamStop').click()`); await sleep(200);
    check('⏹️ Stop with fewer than 20 notes: a cheer box, no coins, no jam counted', await ev(`STG.state==='jamdone'&&!JAM.on&&${box}&&P().coins===${c0}&&P().stats.jams===0&&/20 notes/.test(${boxText})`));
    await shot('J03-jam-stop');
    await ev(`${mb('Again')}.click()`); await sleep(150);
    check('🎸 Again starts the same loop', await ev(`STG.state==='jam'&&JAM.loop.id==='cur'&&JAM.notes===0`));
    await ev(`for(let i=0;i<20;i++)jamPlay(i%5);jamEnd(false)`); await sleep(150);
    check('a jam of 20 notes pays +2, counts the jam and her own loop', await ev(`P().coins===${c0}+2&&P().stats.jams===1&&P().stats.jamOwn===1&&P().jam.pay.n===1&&P().jam.pay.day==='2026-12-01'`), await ev(`P().coins-${c0}`));
    await ev(`closeModal();P().jam.pay.n=3;jamStart('i0');for(let i=0;i<25;i++)jamPlay(i%5);jamEnd(false)`); await sleep(150);
    check('after 3 jams a day: no coins, a gentle note, still counted; an idea loop is not her own', await ev(`P().coins===${c0}+2&&P().stats.jams===2&&P().stats.jamOwn===1&&/full for today/.test(${boxText})`));
    await ev(`closeModal();window.FP_TEST_DAY='2026-12-02';jamStart('s1');for(let i=0;i<20;i++)jamPlay(i%5);jamEnd(false)`); await sleep(150);
    check('the next day it pays again (her saved loop counts as her own)', await ev(`P().coins===${c0}+4&&P().jam.pay.n===1&&P().stats.jamOwn===2`));
    await ev(`closeModal()`);
    // Back
    await ev(`jamPickView();jamStart('cur')`); await sleep(100);
    await ev(`androidBack()`); await sleep(100);
    check('Back during a jam stops it with the cheer box', await ev(`STG.state==='jamdone'&&!JAM.on&&${box}`));
    await ev(`androidBack()`); await sleep(100);
    check('Back: the cheer box → the loops', await ev(`JAM.pick&&!${box}&&!document.querySelector('#jamPick').classList.contains('hidden')&&document.querySelector('#stgBack').textContent.includes('Songs')`));
    await ev(`androidBack()`); await sleep(100);
    check('Back: the loops → the songs', await ev(`cur==='stage'&&!JAM.pick&&!document.querySelector('#stgPick').classList.contains('hidden')&&document.querySelector('#jamPick').classList.contains('hidden')&&!document.querySelector('#stgTabs').classList.contains('hidden')`));
    await ev(`stStart('starlight')`); await sleep(400);
    check('a Stage song still plays after a jam', await ev(`STG.state==='play'&&document.querySelector('#jamStop').classList.contains('hidden')`));
    await ev(`stgPickView()`);
    // from the Music Maker
    await ev(`show('music')`); await sleep(150);
    check('the Music Maker has a 🎸 Jam button that Read to me reads', await ev(`!!document.querySelector('#muJam')&&speakLabel(document.querySelector('#muJam'))==='Jam on the Stage'`));
    await ev(`document.querySelector('#muJam').click()`); await sleep(200);
    check('🎸 in the Music Maker starts a jam with the loop on the grid straight away', await ev(`cur==='stage'&&STG.state==='jam'&&JAM.loop.id==='cur'&&JAM.loop.g===P().music.cur`));
    await ev(`androidBack()`); await sleep(100); await ev(`androidBack()`); await sleep(100);
    check('…Back goes to the loops, with ⬅ Music', await ev(`JAM.pick&&document.querySelector('#stgBack').textContent.includes('Music')`));
    await ev(`androidBack()`); await sleep(100);
    check('…and Back again to the Music Maker', await ev(`cur==='music'`));
    await ev(`P().music.cur=MU_EMPTY;renderMusic();document.querySelector('#muJam').click()`); await sleep(200);
    check('with an empty grid, 🎸 opens the loop picker (no "My loop now")', await ev(`cur==='stage'&&JAM.pick&&!document.querySelector('#jamLoops [data-loop=cur]')`));
    // leaving the screen
    await ev(`P().jam.pay.n=0;jamStart('i2');for(let i=0;i<20;i++)jamPlay(i%5);window.jmC=P().coins;show('room')`); await sleep(150);
    check('leaving the screen stops the band and keeps the jam\'s coins', await ev(`!JAM.on&&STG.state==='pick'&&P().coins===window.jmC+2`));
    // Easy mode and small screens
    await ev(`P().easy=true;show('stage');jamOpen('stage')`); await sleep(200);
    await shot('J04-easy-pick');
    for(const [w,h,name] of [[412,860,'phone'],[360,740,'small phone'],[820,1180,'tablet upright'],[860,412,'phone sideways']]){
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true});
      await ev(`jamPickView()`); await sleep(150);
      check(name+': the loop cards and sounds fit across the screen', await ev(`[...document.querySelectorAll('#jamLoops [data-loop],#jamSounds [data-snd]')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.height>=48;})&&document.documentElement.scrollWidth<=innerWidth+1`));
      await shot('J05-'+name.replace(/ /g,'-')+'-pick');
      await ev(`jamStart('i0')`); await sleep(250);
      check(name+': the 5 pads fit and ⏹️ Stop is on screen', await ev(`(()=>{const c=document.querySelector('#stgCv').getBoundingClientRect(),g=JAM.g,s=document.querySelector('#jamStop').getBoundingClientRect();return g.xs.every(x=>x-g.pr>=0&&x+g.pr<=c.width+1)&&g.yh+g.pr<=c.height+1&&g.pr>=24&&s.top>=0&&s.right<=innerWidth+1&&s.height>=48;})()`));
      await ev(`for(let i=0;i<5;i++)jamPlay(i)`); await sleep(150);
      await shot('J05-'+name.replace(/ /g,'-')+'-jam');
      await ev(`jamEnd(true)`);
    }
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`P().easy=false;applyEasy();show('room')`);
    // stickers
    check('3 new stickers on the 🎤 Stage page: First Jam, Jam Band, My Own Song', await ev(`['jam1','jam10','jamOwn'].every(id=>(s=>s&&s.page==='stage')(STICKERS.find(s=>s.id===id)))`));
    check('…First Jam and My Own Song are done; Jam Band needs 10 jams', await ev(`stkDone(P(),STICKERS.find(s=>s.id==='jam1'))&&stkDone(P(),STICKERS.find(s=>s.id==='jamOwn'))&&!stkDone(P(),STICKERS.find(s=>s.id==='jam10'))&&(P().stats.jams=10,stkDone(P(),STICKERS.find(s=>s.id==='jam10')))`));
    // backups
    const jmB=await ev(`JSON.stringify(DB)`);
    await ev(`(()=>{const d=JSON.parse(${JSON.stringify(jmB)});d.version=32;d.profiles.forEach(p=>{delete p.jam;delete p.stats.jams;delete p.stats.jamOwn;});doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('a v1.51 backup restores with no jams yet', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.jam.sound==='sparkle'&&p.jam.pay.n===0&&p.stats.jams===0&&p.stats.jamOwn===0)`));
    await ev(`closeModal();doRestore(${JSON.stringify(jmB)})`); await sleep(400);
    check('a v1.52 backup keeps the jam sound and the counts', await ev(`DB.profiles.some(p=>p.jam.sound==='pluck'&&p.stats.jams===10&&p.stats.jamOwn>=2)`));
    await ev(`closeModal();(()=>{const d=JSON.parse(${JSON.stringify(jmB)});d.profiles[0].jam={sound:7,pay:'x'};d.profiles[0].stats.jams='lots';doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('odd Jam data is made safe', await ev(`DB.profiles[0].jam.sound==='sparkle'&&DB.profiles[0].jam.pay.n===0&&DB.profiles[0].stats.jams===0`));
    await ev(`DB.profiles[0].jam.sound='banjo'`);
    check('an unknown jam sound plays as ✨ Sparkle', await ev(`jamSound(DB.profiles[0])==='sparkle'`));
    await ev(`closeModal();doRestore(${JSON.stringify(jmB)})`); await sleep(400);
    await ev(`closeModal();{const p=P();p.music=JSON.parse(window.jmMusic);}save();stkPaused=false;window.FP_TEST_DAY=null;goRoom(1);show('room')`);
    check('v1.52 is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.52')`));
  }

  console.log('Trick Shots (v1.53)');
  {
    const mb=t=>`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes(${JSON.stringify(t)}))`;
    const box=`(!document.querySelector('#modal').classList.contains('hidden'))`, boxText=`document.querySelector('#modalBody').textContent`;
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`closeModal();stkPaused=true;window.FP_TEST_DAY='2026-12-05';{const p=P();p.easy=false;applyEasy();window.trMode=p.soccer.mode;}goRoom(1);show('room')`); await sleep(300);
    check('save version 34; every room starts with no tricks done, on the first trick', await ev(`DB_VERSION>=34&&DB.profiles.every(p=>Array.isArray(p.soccer.tricks)&&p.soccer.tricks.length===0&&p.soccer.trick==='t1'&&p.soccer.trickPay.n===0&&p.stats.tricks===0)`));
    check('save version 34 adds Trick Shots to older saves', await ev(`(()=>{const d={profiles:[{name:'Old',soccer:{level:'easy'}}]};MIGRATIONS[34](d);const s=d.profiles[0].soccer;return s.tricks.length===0&&s.trick==='t1'&&s.trickPay.n===0&&s.level==='easy';})()`));
    check('12 tricks, ids t1-t12 in order, one working shot per target, every target inside the goal', await ev(`TRICKS.length===12&&TRICKS.every((t,i)=>t.id==='t'+(i+1)&&t.icon&&t.name&&t.say&&t.sol.length===t.targets.length&&t.targets.every(x=>Math.abs(x.u)+(x.mu?x.mu.a:0)<0.5&&x.v-(x.mv?x.mv.a:0)>0&&x.v+(x.mv?x.mv.a:0)<1))`));
    // the rules: every trick can be done, with the shots in its recipe
    const unsolved=await ev(`TRICKS.filter(tr=>{const hit=[];return !tr.sol.every((sh,k)=>{const j=trJudge(tr,{u:sh[0],v:sh[1],curve:sh[3]},0,hit);if(j.target!==k)return false;hit[k]=true;return true;});}).map(t=>t.id)`);
    check('every trick can be done: its shots hit every target, in order', unsolved.length===0, unsolved);
    const lazy=await ev(`['t8','t11'].filter(id=>{const tr=TRICKS.find(t=>t.id===id);for(let u=-0.6;u<=0.6;u+=0.01)for(let v=0.03;v<=1.3;v+=0.02)if(trJudge(tr,{u,v,curve:0},0,[]).target>=0)return true;return false;})`);
    check('🌀 Curve It and 🍌 Banana Kick need a curve: no straight shot gets past the wall to the target', lazy.length===0, lazy);
    check('…and their curved shots really go around the wall', await ev(`['t8','t11'].every(id=>{const tr=TRICKS.find(t=>t.id===id),sh=tr.sol[0];return !trWallHit(tr.wall,{u:sh[0],v:sh[1],curve:sh[3]})&&Math.abs(sh[3])<=0.5;})`));
    check('🧱 Over the Wall: a low kick at the star hits the wall, a high one goes over', await ev(`(()=>{const tr=TRICKS[6];return trJudge(tr,{u:0,v:0.55,curve:0},0,[]).res==='wall'&&trJudge(tr,{u:0,v:0.82,curve:0},0,[]).target===0;})()`));
    check('🌈 Rainbow Row: the middle star does not count before the red one', await ev(`(()=>{const tr=TRICKS[11];return trJudge(tr,{u:0,v:0.5,curve:0},0,[]).target===-1&&trJudge(tr,{u:0,v:0.5,curve:0},0,[true]).target===1;})()`));
    check('🎯 Moving Star: where the star is depends on the time', await ev(`(()=>{const tr=TRICKS[8];return trJudge(tr,{u:0,v:0.5,curve:0},0,[]).target===0&&trJudge(tr,{u:0,v:0.5,curve:0},Math.PI/1.6,[]).target===-1&&trJudge(tr,{u:0.3,v:0.5,curve:0},Math.PI/1.6,[]).target===0;})()`));
    check('a shot wide of the goal never counts', await ev(`trJudge(TRICKS[0],{u:0.7,v:0.45,curve:0},0,[]).res==='wide'&&trJudge(TRICKS[0],{u:0.7,v:0.45,curve:0},0,[]).target===-1`));
    // the way in
    await ev(`show('soccer')`); await sleep(300);
    check('Soccer has a 🎯 Tricks tab that Read to me calls Trick Shots', await ev(`(b=>!!b&&speakLabel(b)==='Trick Shots')(document.querySelector('#socTabs [data-mode=trick]'))`));
    await ev(`document.querySelector('#socTabs [data-mode=trick]').click()`); await sleep(300);
    check('🎯 opens Trick Shots: remembered, the level tabs hide, the trick bar shows the first trick', await ev(`P().soccer.mode==='trick'&&socTrick()&&document.querySelector('#socTitle').textContent.includes('Trick')&&[...document.querySelectorAll('#socTabs [data-lvl]')].every(b=>getComputedStyle(b).display==='none')&&!document.querySelector('#trBar').classList.contains('hidden')&&document.querySelector('#trPick').textContent.includes('Star Kick')&&/0\\/12/.test(document.querySelector('#trBar').textContent)`));
    await shot('T01-tricks-star');
    check('the tip says what to do; no keeper match dots', await ev(`document.querySelector('#socTip').textContent===TRICKS[0].say&&!document.querySelector('#socScore .dot')`));
    await ev(`document.querySelector('#trBar [data-tr="1"]').click()`); await sleep(100);
    check('▶ goes to the next trick (remembered)', await ev(`P().soccer.trick==='t2'&&document.querySelector('#trPick').textContent.includes('Top Corner')`));
    await ev(`document.querySelector('#trBar [data-tr="-1"]').click();document.querySelector('#trBar [data-tr="-1"]').click()`); await sleep(100);
    check('◀ goes back, and from the first trick round to the last', await ev(`P().soccer.trick==='t12'`));
    await ev(`document.querySelector('#trPick').click()`); await sleep(150);
    check('tapping the trick name opens a picker with all 12 tricks', await ev(`${box}&&document.querySelectorAll('#modalBody .tr-card').length===12&&document.querySelector('#modalBody .tr-card.on').dataset.pick==='11'`));
    await shot('T02-tricks-picker');
    await ev(`document.querySelector('#modalBody [data-pick="0"]').click()`); await sleep(150);
    check('picking a trick closes the picker and opens it', await ev(`!${box}&&P().soccer.trick==='t1'`));
    // a real tap in the goal does the first trick
    const c0=await ev('P().coins');
    const pt=await ev(`(()=>{const r=socCv.getBoundingClientRect(),q=toScr(TR.g,0,0.45);return [r.left+q.x,r.top+q.y];})()`);
    await mouse('mousePressed',pt[0],pt[1]); await mouse('mouseReleased',pt[0],pt[1]); await sleep(150);
    check('a tap in the goal kicks the ball', await ev(`TR.state==='fly'||TR.state==='result'`));
    await sleep(1900);
    check('⭐ Star Kick done: the trick box, +3 coins, ✅ and 1/12', await ev(`${box}&&/did the trick/.test(${boxText})&&P().coins===${c0}+3&&P().soccer.tricks.join()==='t1'&&P().stats.tricks===1&&/1\\/12/.test(document.querySelector('#trBar').textContent)&&document.querySelector('#trPick').classList.contains('done')`), await ev(`P().coins-${c0}`));
    await shot('T03-trick-done');
    await ev(`${mb('Again')}.click()`); await sleep(100);
    check('🔁 Again: the same trick, ready to kick', await ev(`!${box}&&P().soccer.trick==='t1'&&TR.state==='aim'&&!TR.shot`));
    await ev(`trShoot(0,0.45,1,0)`); await sleep(2100);
    check('doing a trick again pays +1', await ev(`P().coins===${c0}+4&&P().soccer.trickPay.n===1&&P().stats.tricks===2`));
    await ev(`closeModal();trRender();P().soccer.trickPay.n=10;trShoot(0,0.45,1,0)`); await sleep(2100);
    check('after 10 replay coins a day: no coins, a gentle note', await ev(`P().coins===${c0}+4&&/full for today/.test(${boxText})`));
    await ev(`${mb('Next')}.click()`); await sleep(100);
    check('▶ Next trick goes to a trick not done yet', await ev(`!${box}&&P().soccer.trick==='t2'`));
    await ev(`window.FP_TEST_DAY='2026-12-06';trGo(0);trShoot(0,0.45,1,0)`); await sleep(2100);
    check('the next day replays pay again', await ev(`P().coins===${c0}+5&&P().soccer.trickPay.n===1`));
    await ev(`closeModal();trRender()`);
    // misses, the wall and the hint
    await ev(`trGo(6);trShoot(0,0.45,1,0)`); await sleep(400);
    await shot('T04-wall-flying');
    await sleep(900);
    check('🧱 a low kick bounces off the wall: a miss, nothing lost', await ev(`TR.shot&&TR.shot.res==='wall'&&TR.miss===1&&P().soccer.tricks.length===1`));
    await sleep(1000);
    check('after a miss she can kick again', await ev(`TR.state==='aim'`));
    await ev(`TR.miss=3;trScore()`); await sleep(200);
    check('after 3 misses the 💡 dotted hint shows', await ev(`document.querySelector('#socTip').textContent.includes('💡')`));
    await shot('T05-wall-hint');
    await ev(`trShoot(0,0.82,1,0)`); await sleep(2100);
    check('…and following it (a high kick) does 🧱 Over the Wall', await ev(`${box}&&P().soccer.tricks.includes('t7')`));
    await ev(`closeModal()`);
    // more than one target
    await ev(`trGo(4);trShoot(-0.3,0.6,1,0)`); await sleep(1400);
    check('🎈 one balloon popped: 2 more to go (dots show it), not done yet', await ev(`TR.hit[0]&&!TR.hit[1]&&!P().soccer.tricks.includes('t5')&&document.querySelectorAll('#socScore .dot').length===3&&document.querySelectorAll('#socScore .dot.miss').length===2&&!${box}`));
    await shot('T06-balloon-pop');
    await ev(`trGo(4)`);
    check('changing trick starts it fresh', await ev(`TR.hit.length===0&&TR.miss===0`));
    // every trick, drawn
    for(let i=0;i<12;i++){await ev(`trGo(${i})`);await sleep(150);await shot('T07-trick-'+(i+1));}
    check('every trick draws without errors', true);
    // the prize: all 12
    await ev(`{const p=P();p.soccer.tricks=TRICKS.slice(1).map(t=>t.id);p.room3.items=p.room3.items.filter(i=>i.type!==TR_PRIZE);}trGo(0);trShoot(0,0.45,1,0)`); await sleep(2100);
    check('all 12 tricks: the 🏅 Trick Shot Star in the Backyard, at its own spot', await ev(`/Trick Shot Star/.test(${boxText})&&(g=>g.length===1&&g[0].placed&&g[0].x===TROPHY_SPOTS.trickStar.x)(P().room3.items.filter(i=>i.type==='trickStar'))&&!P().room.items.some(i=>i.type==='trickStar')`));
    await shot('T08-trick-prize');
    await ev(`closeModal()`);
    check('…given once, a prize (never in the Shop), clear of the buddy', await ev(`!trGivePrize()&&DECOR.trickStar.award&&!DECOR.trickStar.price&&(s=>s.x-70>580||s.x+70<420||s.y>604)(TROPHY_SPOTS.trickStar)`));
    // the other modes still work
    await ev(`document.querySelector('#socTabs [data-mode=kick]').click()`); await sleep(200);
    check('⚽ Kick: the level tabs and match dots come back, the trick bar hides', await ev(`P().soccer.mode==='kick'&&document.querySelector('#trBar').classList.contains('hidden')&&getComputedStyle(document.querySelector('#socTabs [data-lvl]')).display!=='none'&&document.querySelectorAll('#socScore .dot').length===5&&SOC.state==='aim'`));
    await ev(`socShoot(0.3,0.5,1,0)`); await sleep(200);
    check('…and kicks as before', await ev(`SOC.state==='fly'||SOC.state==='result'`));
    await ev(`document.querySelector('#socTabs [data-mode=keep]').click()`); await sleep(200);
    check('🧤 Keep still works', await ev(`P().soccer.mode==='keep'&&KP.state!=='off'&&document.querySelector('#trBar').classList.contains('hidden')`));
    await ev(`document.querySelector('#socTabs [data-mode=trick]').click()`); await sleep(200);
    check('back to 🎯: the trick she was on', await ev(`socTrick()&&!document.querySelector('#trBar').classList.contains('hidden')&&P().soccer.trick==='t1'`));
    await ev(`androidBack()`); await sleep(150);
    check('Android Back goes to the room', await ev(`cur==='room'`));
    // Easy mode and small screens
    await ev(`P().easy=true;show('soccer')`); await sleep(300);
    check('Easy mode keeps Trick Shots', await ev(`socTrick()&&!document.querySelector('#trBar').classList.contains('hidden')`));
    for(const [w,h,name] of [[412,860,'phone'],[360,740,'small phone'],[820,1180,'tablet upright'],[860,412,'phone sideways']]){
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true});
      await ev(`trGo(10)`); await sleep(250);
      check(name+': the trick bar fits, its buttons 48 px tall, and the tabs fit', await ev(`[...document.querySelectorAll('#socTabs .tab')].filter(b=>b.offsetWidth).every(b=>b.getBoundingClientRect().right<=innerWidth+1)&&[...document.querySelectorAll('#trBar button')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.height>=48;})&&document.documentElement.scrollWidth<=innerWidth+1`));
      await shot('T09-'+name.replace(/ /g,'-'));
      await ev(`document.querySelector('#trPick').click()`); await sleep(150);
      check(name+': the picker fits', await ev(`[...document.querySelectorAll('#modalBody .tr-card')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.height>=48;})`));
      await ev(`closeModal()`);
    }
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`P().easy=false;applyEasy();show('room')`);
    // stickers
    check('3 new stickers on the ⚽ Soccer page: First Trick, Banana Kick, Trick Master', await ev(`['trick1','banana','trickAll'].every(id=>(s=>s&&s.page==='soccer')(STICKERS.find(s=>s.id===id)))`));
    check('…all done now; Banana Kick needs a curve trick', await ev(`['trick1','banana','trickAll'].every(id=>stkDone(P(),STICKERS.find(s=>s.id===id)))&&(()=>{const q={soccer:{tricks:['t1','t7']}};return !stkDone(q,STICKERS.find(s=>s.id==='banana'))&&(q.soccer.tricks.push('t11'),stkDone(q,STICKERS.find(s=>s.id==='banana')));})()`));
    // backups
    const trB=await ev(`JSON.stringify(DB)`);
    await ev(`(()=>{const d=JSON.parse(${JSON.stringify(trB)});d.version=33;d.profiles.forEach(p=>{delete p.soccer.tricks;delete p.soccer.trick;delete p.soccer.trickPay;delete p.stats.tricks;});doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('a v1.52 backup restores with no tricks done', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.soccer.tricks.length===0&&p.soccer.trick==='t1'&&p.stats.tricks===0)`));
    await ev(`closeModal();doRestore(${JSON.stringify(trB)})`); await sleep(400);
    check('a v1.53 backup keeps the tricks done and the trick mode', await ev(`DB.profiles.some(p=>p.soccer.tricks.length===12&&p.soccer.mode==='trick'&&p.stats.tricks>=5)`));
    await ev(`closeModal();(()=>{const d=JSON.parse(${JSON.stringify(trB)});const s=d.profiles[0].soccer;s.tricks=[3,'t2','t2'];s.trick=9;s.trickPay='x';s.mode='juggle';d.profiles[0].stats.tricks='lots';doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('odd Trick Shots data is made safe (an unknown mode opens ⚽ Kick)', await ev(`(s=>s.tricks.join()==='t2'&&s.trick==='t1'&&s.trickPay.n===0&&s.mode==='kick')(DB.profiles[0].soccer)&&DB.profiles[0].stats.tricks===0`));
    await ev(`DB.profiles[0].soccer.trick='t99'`);
    check('an unknown trick id opens the first trick', await ev(`trIdx(DB.profiles[0])===0`));
    await ev(`closeModal();doRestore(${JSON.stringify(trB)})`); await sleep(400);
    await ev(`closeModal();P().soccer.mode=window.trMode;save();stkPaused=false;window.FP_TEST_DAY=null;goRoom(1);show('room')`);
    check('v1.53 is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.53')`));
  }

  console.log('Pet Hide & Seek + Fetch (v1.54)');
  {
    const box=`(!document.querySelector('#modal').classList.contains('hidden'))`;
    const waitFor=async(cond,ms)=>{for(let i=0;i<(ms||3000)/50;i++){if(await ev(cond))return true;await sleep(50);}return false;};
    const click=async([x,y])=>{await mouse('mousePressed',x,y);await mouse('mouseReleased',x,y);};
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`closeModal();stkPaused=true;PP_TEST_FAST=true;{const p=P();p.easy=false;applyEasy();p.night={};window.ppSaved={kind:p.pet.kind,hearts:JSON.stringify(p.pet.hearts),coins:p.coins,r4:JSON.stringify(p.room4)};p.pet.kind='';save();}goRoom(1);show('room')`); await sleep(300);
    check('save version 35; every room starts with the ball and no finds or fetches', await ev(`DB_VERSION>=35&&DB.profiles.every(p=>p.pet.toy==='ball'&&p.stats.seeks===0&&p.stats.fetches===0)`));
    check('save version 35 gives older saves the ball', await ev(`(()=>{const d={profiles:[{name:'Old',pet:{kind:'bat'}}]};MIGRATIONS[35](d);return d.profiles[0].pet.toy==='ball'&&d.profiles[0].pet.kind==='bat';})()`));
    check('4 fetch toys, the ball free, the others 6-10 coins, every drawing is strict XML', await ev(`Object.keys(PET_TOYS).join()==='ball,bone,yarn,disc'&&PET_TOYS.ball.price===0&&['bone','yarn','disc'].every(k=>PET_TOYS[k].price>=6&&PET_TOYS[k].price<=10)&&Object.values(PET_TOYS).every(T=>!new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+T.d()+'</svg>','image/svg+xml').querySelector('parsererror'))`));
    await ev(`petTap()`); await sleep(150);
    check('before she has a pet: the pet bed asks her to pick one (no games yet)', await ev(`${box}&&!document.querySelector('#modalBody [data-pa=hide]')`));
    await ev(`closeModal();{const p=P();p.pet.kind='bat';p.pet.hearts.bat=0;save();}renderRoom();petTap()`); await sleep(150);
    check('with a pet: 🙈 Hide & Seek and 🎾 Fetch are the first buttons in its menu', await ev(`${box}&&(b=>b.length>=2&&b[0].dataset.pa==='hide'&&b[1].dataset.pa==='fetch')(document.querySelectorAll('#modalBody .pet-play [data-pa]'))`));
    await shot('PP01-pet-menu');
    // 🙈 Hide & Seek
    await ev(`document.querySelector('#modalBody [data-pa=hide]').click()`); await sleep(20);
    check('🙈 starts: the menu closes, the card takes the top bar place, a curtain covers the room', await ev(`!${box}&&PP.on&&PP.mode==='hide'&&document.body.classList.contains('petplay')&&!document.querySelector('#ppCard').classList.contains('hidden')&&getComputedStyle(document.querySelector('#scr-room .topbar')).display==='none'&&getComputedStyle(document.querySelector('#roomTabs')).display==='none'&&!!document.querySelector('#ppCurtain')`));
    await shot('PP02-curtain');
    check('…then the pet hides', await waitFor(`PP.phase==='seek'`));
    const spot=await ev(`(()=>{const pet=$('#ppPet'),n=pet&&pet.nextElementSibling;return {key:PP.spot.key,behind:!!n&&(n.classList.contains('deco')||n.classList.contains('fixed')),share:ppShows(),seen:PP.seen.length,home:getComputedStyle(document.querySelector('#petG .pet-bob')).display};})()`);
    check('the pet is drawn just behind a hiding spot, with only a little of it showing, and not at home', spot.behind&&spot.share>=0.08&&spot.share<=0.45&&spot.seen>=4&&spot.home==='none', spot);
    await shot('PP03-hiding');
    check('the peeking pet wiggles in steps (light on the device)', await ev(`(a=>!!a&&/^steps\\(/.test(getComputedStyle(a.effect.target).animationTimingFunction))(document.getAnimations().find(a=>a.animationName==='ppWig'))`));
    const h0=await ev(`petHearts(P())`), c0=await ev(`P().coins`);
    // a wrong tap: somewhere well away from the hiding spot and the pet
    const fz=await ev(`(()=>{const s=ppSpots().find(x=>x.key===PP.spot.key).el.getBoundingClientRect(),q=document.querySelector('#ppPet').getBoundingClientRect(),R=roomSvg.getBoundingClientRect();
      for(let i=1;i<10;i++)for(let j=1;j<10;j++){const x=R.left+R.width*i/10,y=R.top+R.height*j/10,far=r=>x<r.left-30||x>r.right+30||y<r.top-30||y>r.bottom+30;if(far(s)&&far(q))return [x,y];}return null;})()`);
    await click(fz); await sleep(100);
    check('a wrong tap counts nothing ("Not here!"); the game goes on', await ev(`PP.wrong===1&&!PP.found&&PP.phase==='seek'&&petHearts(P())===${h0}&&!${box}`));
    await click(fz); await click(fz); await sleep(100);
    check('after 3 wrong taps the right spot sparkles', await ev(`!!document.querySelector('#ppRing')&&!!document.querySelector('#roomSvg .spy-spark')`));
    await shot('PP04-hint');
    await ev(`renderRoom()`); await sleep(50);
    check('a redraw of the room keeps the pet in the same spot', await ev(`PP.spot&&PP.spot.key===${JSON.stringify(spot.key)}&&!!document.querySelector('#ppPet')`));
    const seen=await ev(`PP.seen[Math.floor(PP.seen.length/2)]`);
    await click(seen); await sleep(100);
    check('a tap on the peeking pet finds it: +2 hearts, 🔁 Again shows, no coins', await ev(`PP.found&&petHearts(P())===${h0}+2&&P().stats.seeks===1&&!!document.querySelector('#ppAgain')&&P().coins===${c0}`));
    await shot('PP05-found');
    check('…and then it is back at home', await waitFor(`!document.querySelector('#ppPet')&&getComputedStyle(document.querySelector('#petG .pet-bob')).display!=='none'`));
    await ev(`document.querySelector('#ppAgain').click()`);
    check('🔁 Again hides it somewhere else', await waitFor(`PP.phase==='seek'`)&&await ev(`PP.spot.key!==${JSON.stringify(spot.key)}`));
    await ev(`(()=>{const s=ppSpots().find(x=>x.key===PP.spot.key);const r=s.el.getBoundingClientRect();window.__spotPt=[r.left+r.width/2,r.top+r.height/2];})()`);
    await click(await ev(`__spotPt`)); await sleep(100);
    check('a tap on the hiding spot itself finds it too', await ev(`PP.found&&P().stats.seeks===2`));
    // every room
    for(const n of [2,3]){
      await ev(`ppEnd();goRoom(${n});ppStart('hide')`);
      check(`it hides in the ${['','Room','Loft','Backyard'][n]} too`, await waitFor(`PP.phase==='seek'`)&&await ev(`(f=>f>=0.08&&f<=0.45)(ppShows())`), await ev(`[PP.phase,PP.spot&&PP.spot.key]`));
      await shot('PP06-hide-room'+n);
    }
    check('Easy mode: more of the pet peeks out', await ev(`(()=>{ppEnd();P().easy=true;goRoom(1);ppStart('hide');return true;})()`)&&await waitFor(`PP.phase==='seek'`)&&await ev(`(f=>f>=0.16&&f<=0.45)(ppShows())`));
    await shot('PP06-hide-easy');
    await ev(`ppEnd();P().easy=false;P().room4.items=[];save();goRoom(4);ppStart('hide')`);
    check('in a bare room: "Put out a few more things first!" and the game ends', await waitFor(`!PP.on`)&&await ev(`!document.body.classList.contains('petplay')`));
    await ev(`P().room4=JSON.parse(ppSaved.r4);save();goRoom(1)`);
    // night
    await ev(`P().night['1']=true;save();renderRoom();ppStart('hide')`);
    check('at night: two glowing eyes peek out instead', await waitFor(`PP.phase==='seek'`)&&await ev(`!!document.querySelector('#ppEyes')&&document.querySelector('#ppEyes').parentNode===roomSvg&&!document.querySelector('#nightBtn').offsetWidth`));
    await shot('PP07-night-eyes');
    check('Android Back ends the game, in the room', await ev(`androidBack()&&!PP.on&&cur==='room'&&!document.body.classList.contains('petplay')&&getComputedStyle(document.querySelector('#scr-room .topbar')).display!=='none'`));
    await ev(`P().night={};save();renderRoom();ppStart('hide')`); await sleep(20);
    await ev(`show('closet')`);
    check('leaving the room ends it too', await ev(`!PP.on&&!document.body.classList.contains('petplay')`));
    await ev(`show('room')`); await sleep(100);
    // 🎾 Fetch
    await ev(`petTap()`); await sleep(100); await ev(`document.querySelector('#modalBody [data-pa=fetch]').click()`); await sleep(100);
    check('🎾 starts: the toy waits by the buddy, the card shows 4 toys with the ball on', await ev(`PP.on&&PP.mode==='fetch'&&PP.phase==='ready'&&!!document.querySelector('#ppToy')&&document.querySelectorAll('#ppCard [data-toy]').length===4&&document.querySelector('#ppCard .pp-toy.on').dataset.toy==='ball'`));
    await shot('PP08-fetch');
    check('a throw always lands on the floor (and bounces off the sides)', await ev(`[[2000,100],[-500,900],[500,300],[980,690]].every(([x,y])=>{const L=ppLand(x,y);return L.x>=PP_FLOOR.x0&&L.x<=PP_FLOOR.x1&&L.y>=PP_FLOOR.y0&&L.y<=PP_FLOOR.y1;})&&ppLand(1000,600).x===880`));
    const h1=await ev(`petHearts(P())`);
    const hand=await ev(`(r=>[r.left+r.width/2,r.top+r.height/2])(document.querySelector('#ppToy').getBoundingClientRect())`);
    await ev(`PP_TEST_FAST=false`);
    await mouse('mousePressed',hand[0],hand[1]); await mouse('mouseMoved',hand[0]-80,hand[1]+20); await mouse('mouseReleased',hand[0]-160,hand[1]+40); await sleep(30);
    check('a swipe throws the toy and the pet runs after it', await ev(`PP.phase==='fly'&&!!document.querySelector('#ppRun')&&!!document.querySelector('#ppToyFly')&&getComputedStyle(document.querySelector('#petG .pet-bob')).display==='none'`));
    await sleep(300); await shot('PP09-throw'); await ev(`PP_TEST_FAST=true`);
    check('…it brings it back: +1 heart, no coins', await waitFor(`PP.phase==='wag'||PP.phase==='ready'&&P().stats.fetches===1`,4000)&&await ev(`P().stats.fetches===1&&petHearts(P())===${h1}+1&&P().coins===${c0}`));
    await shot('PP10-fetched');
    check('…and the toy is back by the buddy, ready again', await waitFor(`PP.phase==='ready'&&!!document.querySelector('#ppToy')&&!document.querySelector('#ppRun')`));
    await ev(`P().coins=20;save();document.querySelector('#ppCard [data-toy=bone]').click()`); await sleep(100);
    check('a toy to buy asks first', await ev(`${box}&&!P().owned.includes('pettoy:bone')`));
    await ev(`[...document.querySelectorAll('#modalBtns button')].pop().click()`); await sleep(100);
    check('…buying it puts it to use (20 - 6 coins)', await ev(`P().owned.includes('pettoy:bone')&&P().pet.toy==='bone'&&P().coins===14&&document.querySelector('#ppCard .pp-toy.on').dataset.toy==='bone'`));
    await ev(`{const p=P();p.owned.push('pettoy:yarn','pettoy:disc');p.pet.toy='yarn';save();}ppCard();ppHand();ppThrow(200,520)`); await sleep(80);
    check('the yarn ball leaves a wiggly string', await ev(`!!document.querySelector('#ppTrail')`));
    await shot('PP11-yarn');
    await waitFor(`PP.phase==='ready'`,4000);
    await ev(`P().pet.toy='disc';save();ppCard();ppHand();ppThrow(900,520)`);
    check('the disc flies and comes back too', await waitFor(`PP.phase==='ready'&&P().stats.fetches===3`,4000));
    const floorPt=await ev(`(()=>{const m=roomSvg.getScreenCTM();return [m.a*300+m.e,m.d*640+m.f];})()`);
    await click(floorPt); await sleep(30);
    check('a tap on the floor throws to that spot', await ev(`PP.phase==='fly'&&Math.abs(PP.fly.L.x-300)<3&&Math.abs(PP.fly.L.y-640)<3`));
    await waitFor(`PP.phase==='ready'`,4000);
    check('an unknown or not-owned toy falls back to the ball', await ev(`(()=>{const p=P(),t=p.pet.toy;p.pet.toy='rocket';const a=ppToy(p);p.pet.toy='disc';p.owned=p.owned.filter(k=>k!=='pettoy:disc');const b=ppToy(p);p.owned.push('pettoy:disc');p.pet.toy=t;return a==='ball'&&b==='ball';})()`));
    await ev(`document.querySelector('#ppX').click()`); await sleep(50);
    check('✖ stops: the room is back as before', await ev(`!PP.on&&!document.querySelector('#ppToy')&&getComputedStyle(document.querySelector('#scr-room .topbar')).display!=='none'`));
    check('pet play never opens anything in the room (taps go to the game)', await ev(`(()=>{ppStart('fetch');const c=cur;document.querySelector('[data-hot=closet]').dispatchEvent(new MouseEvent('click',{bubbles:true}));const ok=cur===c&&cur==='room';ppEnd();return ok;})()`));
    // Decorating and I Spy still win
    await ev(`enterDecorate();ppStart('hide')`); await sleep(50);
    check('no pet games while decorating', await ev(`!PP.on`));
    await ev(`exitDecorate()`);
    // small screens
    for(const [w,h,name] of [[412,860,'phone'],[360,740,'small phone'],[860,412,'phone sideways']]){
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true});
      await ev(`ppStart('fetch')`); await sleep(150);
      check(name+': the Fetch card fits, buttons 48 px or more', await ev(`[...document.querySelectorAll('#ppCard button')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.height>=48&&r.width>=48;})&&document.documentElement.scrollWidth<=innerWidth+1`));
      await shot('PP12-'+name.replace(/ /g,'-'));
      await ev(`ppEnd();petTap()`); await sleep(100);
      check(name+': the pet menu buttons fit', await ev(`[...document.querySelectorAll('#modalBody .pet-play button')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.height>=48;})`));
      await ev(`closeModal()`);
    }
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`P().easy=true;applyEasy();renderRoom();ppStart('fetch')`); await sleep(100);
    check('Easy mode: Fetch works with a short tip', await ev(`PP.on&&document.querySelector('#ppText').textContent.includes('Swipe')`));
    await shot('PP13-easy');
    await ev(`ppEnd();P().easy=false;applyEasy();renderRoom()`);
    // stickers
    check('4 new stickers on the 🏠 Room & Style page: Found You!, Seek Champ, Good Catch, Fetch Fan', await ev(`['ppFind1','ppFind','ppFetch1','ppFetch'].every(id=>(s=>s&&s.page==='room')(STICKERS.find(s=>s.id===id)))`));
    check('…Found You! and Good Catch are done now', await ev(`['ppFind1','ppFetch1'].every(id=>stkDone(P(),STICKERS.find(s=>s.id===id)))&&!stkDone(P(),STICKERS.find(s=>s.id==='ppFetch'))`));
    // backups
    const ppB=await ev(`JSON.stringify(DB)`);
    await ev(`(()=>{const d=JSON.parse(${JSON.stringify(ppB)});d.version=34;d.profiles.forEach(p=>{delete p.pet.toy;delete p.stats.seeks;delete p.stats.fetches;});doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('a v1.53 backup restores with the ball and no finds', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.pet.toy==='ball'&&p.stats.seeks===0&&p.stats.fetches===0)`));
    await ev(`closeModal();doRestore(${JSON.stringify(ppB)})`); await sleep(400);
    check('a v1.54 backup keeps the toy, the toys owned and the totals', await ev(`DB.profiles.some(p=>p.pet.toy==='disc'&&p.owned.includes('pettoy:bone')&&p.stats.seeks===2&&p.stats.fetches>=4)`));
    await ev(`closeModal();(()=>{const d=JSON.parse(${JSON.stringify(ppB)});d.profiles[0].pet.toy=7;d.profiles[0].stats.seeks='lots';d.profiles[0].stats.fetches=-3;doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('odd pet play data is made safe', await ev(`(p=>p.pet.toy==='ball'&&p.stats.seeks===0&&p.stats.fetches===0)(DB.profiles[0])`));
    await ev(`closeModal();doRestore(${JSON.stringify(ppB)})`); await sleep(400);
    await ev(`closeModal();{const p=P();p.pet.kind=ppSaved.kind;p.pet.hearts=JSON.parse(ppSaved.hearts);p.coins=ppSaved.coins;save();}PP_TEST_FAST=false;stkPaused=false;goRoom(1);show('room')`);
    check('v1.54 is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.54')`));
  }

  console.log('Pet Walks (v1.55)');
  {
    const box=`(!document.querySelector('#modal').classList.contains('hidden'))`, boxText=`document.querySelector('#modalBody').textContent`;
    const mb=t=>`[...document.querySelectorAll('#modalBtns button')].find(b=>b.textContent.includes(${JSON.stringify(t)}))`;
    const waitFor=async(cond,ms)=>{for(let i=0;i<(ms||3000)/50;i++){if(await ev(cond))return true;await sleep(50);}return false;};
    const center=sel=>ev(`(r=>[r.left+r.width/2,r.top+r.height/2])(document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect())`);
    const xml=`(h=>!new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+h+'</svg>','image/svg+xml').querySelector('parsererror'))`;
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`closeModal();stkPaused=true;WK_TEST_FAST=true;{const p=P();p.easy=false;applyEasy();window.wkSaved={kind:p.pet.kind,hearts:JSON.stringify(p.pet.hearts),coins:p.coins};p.pet.kind='cloudPup';p.pet.hearts.cloudPup=0;save();}goRoom(1);show('room')`); await sleep(300);
    check('save version 36; every room starts on the meadow with no finds', await ev(`DB_VERSION>=36&&DB.profiles.every(p=>p.walk.path==='meadow'&&p.walk.finds.length===0&&p.stats.petWalks===0&&p.stats.finds===0)`));
    check('save version 36 adds walks to older saves', await ev(`(()=>{const d={profiles:[{name:'Old'}]};MIGRATIONS[36](d);return d.profiles[0].walk.path==='meadow'&&d.profiles[0].walk.finds.length===0;})()`));
    check('4 paths with 8 finds each, 32 different find ids', await ev(`WALK_IDS.join()==='meadow,pond,town,stars'&&WALK_IDS.every(k=>WALK_FINDS[k].length===8)&&new Set(wkAllFinds().map(f=>f.id)).size===32`));
    check('every path picture, sniff spot, find and treasure jar is strict XML', await ev(`WALK_IDS.every(k=>{const W=WALK_PATHS[k];return ['still','far','mid','ground','prop'].every(x=>${xml}(W[x]()))&&${xml}(DECOR[WALK_JARS[k]].d({}));})&&wkAllFinds().every(f=>${xml}(f.d()))`));
    check('the 4 treasure jars are prizes (never in the Shop) with a theme chip', await ev(`Object.values(WALK_JARS).every(k=>DECOR[k].award&&!DECOR[k].price&&themesOf('decor:'+k,DECOR[k]).length>0)`));
    // the way in
    await ev(`petTap()`); await sleep(150);
    check('the pet menu has 🦮 Walk next to 🙈 and 🎾', await ev(`[...document.querySelectorAll('#modalBody .pet-play [data-pa]')].map(b=>b.dataset.pa).join()==='hide,fetch,walk'`));
    await ev(`document.querySelector('#modalBody [data-pa=walk]').click()`); await sleep(200);
    check('🦮 opens the walk screen: 4 path cards, each with its finds count', await ev(`!${box}&&cur==='walk'&&document.querySelector('#scr-walk').dataset.view==='pick'&&document.querySelectorAll('#wkPaths [data-path]').length===4&&[...document.querySelectorAll('#wkPaths .wk-cc')].every(e=>e.textContent.includes('0/8'))`));
    await shot('W01-paths');
    await ev(`document.querySelector('#wkPaths [data-path=meadow]').click()`); await sleep(200);
    check('a path card starts the walk: the scene, 5 paw dots, the 👣 button', await ev(`document.querySelector('#scr-walk').dataset.view==='walk'&&!!document.querySelector('#wkSvg .wk-buddy image')&&document.querySelectorAll('#wkDots b').length===5&&!document.querySelector('#wkGo').disabled`));
    check('standing still: the scenery does not move', await ev(`document.getAnimations().filter(a=>a.animationName==='wkScroll').every(a=>a.playState==='paused')`));
    await shot('W02-walk');
    const h0=await ev(`petHearts(P())`), c0=await ev(`P().coins`);
    await ev(`WK_TEST_FAST=false`);
    const go=await center('#wkGo');
    await mouse('mousePressed',go[0],go[1]); await sleep(150);
    check('holding 👣 walks: the scenery slides', await ev(`WK.walking&&document.querySelector('#wkScene').classList.contains('walking')&&document.getAnimations().filter(a=>a.animationName==='wkScroll').every(a=>a.playState==='running')`));
    await shot('W03-walking');
    await mouse('mouseReleased',go[0],go[1]); await sleep(50);
    check('letting go stops (and keeps how far she walked)', await ev(`!WK.walking&&WK.walked>0&&!WK.sniff`));
    await ev(`WK_TEST_FAST=true`);
    await mouse('mousePressed',go[0],go[1]);
    check('after a while the pet stops and sniffs a bush', await waitFor(`!!WK.sniff`)&&await ev(`!WK.walking&&!document.querySelector('#wkSpot').classList.contains('hidden')&&document.querySelector('#wkGo').disabled&&document.querySelector('#wkTip').textContent.includes('found something')`));
    await mouse('mouseReleased',go[0],go[1]);
    await shot('W04-sniff');
    const first=await ev(`WK.sniff.id`);
    await (async()=>{const pt=await center('#wkSpot .wk-prop');await mouse('mousePressed',pt[0],pt[1]);await mouse('mouseReleased',pt[0],pt[1]);})(); await sleep(150);
    check('a tap on the bush finds something: a card, +1 heart, in the finds, no coins', await ev(`${box}&&P().walk.finds.join()===${JSON.stringify(first)}&&petHearts(P())===${h0}+1&&P().stats.finds===1&&P().coins===${c0}&&WK.spots===1`));
    await shot('W05-find');
    await ev(`${mb('Keep walking')}.click()`); await sleep(50);
    check('👣 Keep walking: ready to walk on, one paw dot on', await ev(`!${box}&&!WK.sniff&&!document.querySelector('#wkGo').disabled&&document.querySelectorAll('#wkDots b.on').length===1&&document.querySelector('#wkSpot').classList.contains('hidden')`));
    for(let i=1;i<5;i++){await ev(`wkWalk(true)`);await waitFor(`!!WK.sniff`);await ev(`wkDig()`);await sleep(50);if(i<4)await ev(`${mb('Keep walking')}.click()`);}
    check('5 sniffs on one walk: 5 different finds, all new', await ev(`WK.got.length===5&&new Set(WK.got).size===5&&P().walk.finds.length===5&&WK.got.every(id=>WALK_FINDS.meadow.some(f=>f.id===id))`));
    check('the 5th find offers 🏡 Head home', await ev(`!!${mb('Head home')}`));
    await ev(`${mb('Head home')}.click()`); await sleep(100);
    check('home: the bench, "What a lovely walk!", +3 hearts (and +1 for each of 5 finds)', await ev(`${box}&&/lovely walk/.test(document.querySelector('#modalTitle').textContent)&&!document.querySelector('#wkBench').classList.contains('hidden')&&P().stats.petWalks===1&&petHearts(P())===${h0}+8&&P().coins===${c0}`));
    await shot('W06-home');
    await ev(`${mb('Another walk')}.click()`); await sleep(100);
    check('🔁 Another walk goes back to the paths; the meadow card says 5/8', await ev(`document.querySelector('#scr-walk').dataset.view==='pick'&&document.querySelector('#wkPaths [data-path=meadow] .wk-cc').textContent.includes('5/8')`));
    // an animal is only seen
    await ev(`wkStart('pond');P().walk.finds=P().walk.finds.concat(WALK_FINDS.pond.filter(f=>f.id!=='frog').map(f=>f.id));save();wkWalk(true)`);
    await waitFor(`!!WK.sniff`);
    check('a new find comes first: the only pond find left (the frog)', await ev(`WK.sniff.id==='frog'`));
    await ev(`wkDig()`); await sleep(100);
    check('an animal is waved goodbye ("Hello, frog!") and still goes in the book', await ev(`/Hello, frog/.test(document.querySelector('#modalTitle').textContent)&&/Bye bye/.test(${boxText})&&P().walk.finds.includes('frog')`));
    check('the 8th pond find puts the 🫙 Pond Jar in My Stuff, once', await ev(`/Pond Jar/.test(${boxText})&&(j=>j.length===1&&!j[0].placed)(allItems(P()).filter(i=>i.type==='jarPond'))&&wkGiveJar(P(),'pond')===''`));
    await shot('W07-jar');
    await ev(`closeModal();wkWalk(true)`); await waitFor(`!!WK.sniff`);
    check('a full path still has finds (seen again)', await ev(`WALK_FINDS.pond.some(f=>f.id===WK.sniff.id)&&!WK.got.includes(WK.sniff.id)`));
    // the book
    await ev(`document.querySelector('#wkBookBtn').click()`); await sleep(150);
    check('🧺 Walk Finds: all 32 shown, the ones not found as gray shapes', await ev(`document.querySelector('#scr-walk').dataset.view==='book'&&document.querySelectorAll('#wkBook [data-find]').length===32&&document.querySelectorAll('#wkBook .wk-no').length===32-P().walk.finds.length`));
    await shot('W08-book');
    await ev(`androidBack()`); await sleep(100);
    check('Back: the finds -> the paths', await ev(`cur==='walk'&&document.querySelector('#scr-walk').dataset.view==='pick'`));
    await ev(`wkStart('stars');wkWalk(true)`); await sleep(30);
    await shot('W09-stars');
    await ev(`androidBack()`); await sleep(100);
    check('Back in the middle of a walk: stops walking, back to the paths', await ev(`!WK.walking&&document.querySelector('#scr-walk').dataset.view==='pick'&&!document.querySelector('#wkScene').classList.contains('walking')`));
    await ev(`androidBack()`); await sleep(100);
    check('Back from the paths: the room', await ev(`cur==='room'`));
    await ev(`wkOpen();wkStart('town');wkWalk(true);show('room')`); await sleep(50);
    check('leaving the screen stops the walk', await ev(`!WK.walking`));
    // every path draws
    await ev(`show('walk')`);
    for(const k of ['meadow','pond','town','stars']){await ev(`wkStart('${k}')`);await sleep(100);await shot('W10-path-'+k);}
    check('every path draws without errors', true);
    // small screens
    for(const [w,h,name] of [[412,860,'phone'],[360,740,'small phone'],[820,1180,'tablet upright'],[860,412,'phone sideways']]){
      await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true});
      await ev(`WK.view='pick';renderWalk()`); await sleep(150);
      check(name+': the path cards fit', await ev(`[...document.querySelectorAll('#wkPaths .wk-card')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.height>=48;})&&document.documentElement.scrollWidth<=innerWidth+1`));
      await shot('W11-'+name.replace(/ /g,'-')+'-paths');
      await ev(`wkStart('meadow')`); await sleep(150);
      check(name+': the buddy, the pet and the sniff spot are all on screen; 👣 is big enough', await ev(`(()=>{document.querySelector('#wkSpot').classList.remove('hidden');const s=document.querySelector('#wkScene').getBoundingClientRect(),in_=e=>{const r=e.getBoundingClientRect();return r.left>=s.left-1&&r.right<=s.right+1&&r.top>=s.top-1&&r.bottom<=s.bottom+1;};const g=document.querySelector('#wkGo').getBoundingClientRect();const ok=in_(document.querySelector('.wk-buddy image'))&&in_(document.querySelector('#wkPet'))&&in_(document.querySelector('#wkSpot .wk-prop'))&&g.height>=48&&g.width>=48&&g.right<=innerWidth+1;document.querySelector('#wkSpot').classList.add('hidden');return ok;})()`));
      await shot('W11-'+name.replace(/ /g,'-')+'-walk');
      await ev(`WK.view='book';renderWalk()`); await sleep(100);
      check(name+': the finds book fits', await ev(`[...document.querySelectorAll('#wkBook .wk-bt')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.height>=48;})`));
    }
    await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
    await ev(`P().easy=true;applyEasy();show('walk');wkStart('meadow')`); await sleep(100);
    check('Easy mode: a short tip, a bigger 👣', await ev(`document.querySelector('#wkTip').textContent==='Hold 👣'&&document.querySelector('#wkGo').getBoundingClientRect().height>=70`));
    await ev(`P().easy=false;applyEasy();show('room')`);
    // stickers
    check('3 new stickers on the 🏠 Room & Style page: Walk Buddy, Collector, Treasure Hunter', await ev(`['petWalk1','petWalkPath','petWalkAll'].every(id=>(s=>s&&s.page==='room')(STICKERS.find(s=>s.id===id)))`));
    check('…Walk Buddy and Collector are done (the pond is full), Treasure Hunter not yet', await ev(`stkDone(P(),STICKERS.find(s=>s.id==='petWalk1'))&&stkDone(P(),STICKERS.find(s=>s.id==='petWalkPath'))&&!stkDone(P(),STICKERS.find(s=>s.id==='petWalkAll'))`));
    // backups
    const wkB=await ev(`JSON.stringify(DB)`);
    await ev(`(()=>{const d=JSON.parse(${JSON.stringify(wkB)});d.version=35;d.profiles.forEach(p=>{delete p.walk;delete p.stats.petWalks;delete p.stats.finds;});doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('a v1.54 backup restores with no walks', await ev(`DB.version===DB_VERSION&&DB.profiles.every(p=>p.walk.finds.length===0&&p.stats.petWalks===0)`));
    await ev(`closeModal();doRestore(${JSON.stringify(wkB)})`); await sleep(400);
    check('a v1.55 backup keeps the finds and the jar', await ev(`DB.profiles.some(p=>p.walk.finds.length>=13&&p.stats.petWalks===1&&allItems(p).some(i=>i.type==='jarPond'))`));
    await ev(`closeModal();(()=>{const d=JSON.parse(${JSON.stringify(wkB)});d.profiles[0].walk={path:5,finds:['daisy',7,'daisy','nope']};d.profiles[0].stats.finds='x';doRestore(JSON.stringify(d));})()`); await sleep(400);
    check('odd walk data is made safe (unknown finds are ignored by the book and stickers)', await ev(`(p=>p.walk.path==='meadow'&&p.walk.finds.join()==='daisy,nope'&&p.stats.finds===0&&wkHave(p,'meadow')===1)(DB.profiles[0])`));
    await ev(`closeModal();doRestore(${JSON.stringify(wkB)})`); await sleep(400);
    await ev(`closeModal();{const p=P();p.pet.kind=wkSaved.kind;p.pet.hearts=JSON.parse(wkSaved.hearts);p.coins=wkSaved.coins;save();}WK_TEST_FAST=false;stkPaused=false;goRoom(1);show('room')`);
    check('v1.55 is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.55')`));
  }

  console.log('Curve Balls (v1.56)');
  {
    const waitFor=async(cond,ms)=>{for(let i=0;i<(ms||4000)/50;i++){if(await ev(cond))return true;await sleep(50);}return false;};
    // Math.random walks through a fixed list, so the keeper's choices are known.
    await ev(`window._rand2=Math.random;window._seq=a=>{let i=0;Math.random=()=>a[i++%a.length];};stkPaused=true`);
    await ev(`(()=>{const p=P();window._cbSaved={level:p.soccer.level,mode:p.soccer.mode,coins:p.coins,best:JSON.stringify(p.soccer.best)};p.soccer.level='hard';p.soccer.mode='kick';show('soccer');})()`); await sleep(400);
    check('the tip says to bend the swipe', await ev(`document.querySelector('#socTip').textContent.includes('curve')&&document.querySelector('#socTip').textContent.includes('Flap')`));
    check('skill: no curve = 0, a big curve = 1; a tap = a little power, a hard flick = 1', await ev(`(n=>(a=>a.fc===0&&n(a.fp,0.25))(socSkill(1,0))&&(a=>a.fc===1&&a.fp===1)(socSkill(1.8,-0.4))&&n(socSkill(1,0.15).fc,0.5))((x,y)=>Math.abs(x-y)<1e-9)`));
    const kick=async(seq,u,curve)=>{await waitFor(`SOC.state==='aim'`);await ev(`_seq(${JSON.stringify(seq)});socShoot(${u},0.5,1,${curve})`);
      await waitFor(`SOC.state==='result'`);return ev(`JSON.stringify({res:SOC.shot.res,fooled:SOC.shot.fooled,dive:SOC.shot.dive,msg:document.querySelector('#socMsg').textContent})`).then(JSON.parse);};
    // roll 0.45: below Flap's read for a straight tap (0.6 × 0.9625), above it for a big curve (0.6 × 0.6625), so Flap stays in the middle
    let k=await kick([0.45],0.3,0);
    check('a straight shot Flap reads is saved', k.res==='saved'&&!k.fooled&&k.dive>0.2, k);
    k=await kick([0.45],0.3,0.3);
    check('the same roll with a big curve: Flap misreads it and the ball goes in', k.res==='goal'&&!k.fooled&&k.dive===0, k);
    // roll 0.99, then 0.1: not read, then fooled by the curve (0.1 < 0.5): dives the wrong way
    k=await kick([0.99,0.1,0.5],0.3,0.3);
    check('a big curve sends Flap the wrong way: "Curve ball!"', k.res==='goal'&&k.fooled&&k.dive===-0.32&&k.msg.includes('Curve ball'), k);
    k=await kick([0.99,0.1,0.5],0.3,0);
    check('a straight shot never fools Flap (it guesses a side as before)', k.res==='saved'&&!k.fooled&&k.dive===0.32, k);
    k=await kick([0.99,0.1,0.5],0.04,-0.3);
    check('a curve down the middle sends Flap away from the bend', k.res==='goal'&&k.fooled&&k.dive===0.32, k);
    await waitFor(`SOC.state==='done'`);
    await ev(`closeModal();Math.random=window._rand2;(()=>{const p=P(),s=window._cbSaved;p.soccer.level=s.level;p.soccer.mode=s.mode;p.coins=s.coins;p.soccer.best=JSON.parse(s.best);save();})();stkPaused=false;show('room')`);
    check('v1.56 is in the Gift Story and the app says 1.57', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.56')&&APP_VERSION==='1.57'`));
    check('v1.57 (Brain Games Free Play coins) is in the Gift Story', await ev(`GIFT_TIMELINE.some(t=>t.v==='1.57')`));
  }

  console.log(`\n${ok} passed, ${bad} failed`);
  console.log(errors.length?'CONSOLE ERRORS:\n'+errors.join('\n'):'No console errors');
  ws.close(); ch.kill(); setTimeout(()=>{try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){} process.exit(bad||errors.length?1:0);},800);
})().catch(e=>{console.error('TEST CRASHED',e);console.log(errors.join('\n'));ch.kill();process.exit(2);});
