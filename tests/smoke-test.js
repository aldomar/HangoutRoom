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
    if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')errors.push(d.params.args.map(a=>a.value||a.description).join(' '));};
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:URL}); await sleep(1200);

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
  check('DB version is 3', (await ev('DB.version'))===3);
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
  check('v1.3 backup restores with empty card lists', await ev(`DB.version===3&&DB.profiles[0].cards.length===0&&DB.profiles[0].cardPins.length===0&&DB.profiles[0].stats.cards===0`));
  await ev(`doRestore(${JSON.stringify(cardCode)})`); await sleep(500);
  check('backup brings cards and pins back', (await ev('DB.profiles[0].cards.length'))===nCards && (await ev('DB.profiles[0].cardPins.length'))===2);
  await ev(`closeModal();document.querySelector('.pcard').click()`); await sleep(1300); await ev(`closeModal()`);
  check('no repeat bonus after restore', (await ev(`P().cards.filter(c=>c.bonus).length`))===3);

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
  await ev(`show('art')`); await sleep(200);
  await send('Emulation.setDeviceMetricsOverride',{width:860,height:412,deviceScaleFactor:1,mobile:true});
  await ev(`setArtView('pad')`); await sleep(300); await shot('11-phone-landscape');
  await ev(`show('cards');setCardView('make')`); await sleep(300); await shot('29-phone-landscape-cards');
  await ev(`setCardView('binder')`); await sleep(300); await shot('30-phone-landscape-binder');
  await ev(`show('art')`);

  console.log('Every other screen (tablet size)');
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await send('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});
  await ev(`show('room')`); await sleep(250);
  for(const t of ['popit','squish','spin']){await ev(`show('fidget');setFidTab('${t}')`);await sleep(400);await shot('12-fidget-'+t);}
  check('fidget shelf shown', await ev(`cur==='fidget'`));
  const cats=await ev(`Object.keys(CLOSET)`);
  await ev(`show('closet')`);
  for(const c of cats){await ev(`document.querySelector('[data-cat=${c}]').click()`);await sleep(120);}
  await shot('13-closet'); check('closet has items', (await ev(`document.querySelectorAll('#closetGrid .tile').length`))>0);
  await ev(`show('room');enterDecorate()`);
  for(const t of ['mine','shop','wall','floor']){await ev(`document.querySelector('[data-dt=${t}]').click()`);await sleep(150);}
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
