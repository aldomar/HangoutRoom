// Makes the Home Screen icons (web/icon-180.png) from the app's own buddy drawing.
// Run from the repo folder:   node tools/make-icons.js
// Needs Node 22+ and an installed Chrome or Edge (the same as the smoke test). Run it again only if the icon should change.
const {spawn}=require('child_process'), fs=require('fs'), path=require('path'), os=require('os'), {pathToFileURL}=require('url');
const CHROME=[process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  path.join(process.env.LOCALAPPDATA||'','Google/Chrome/Application/chrome.exe'),
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome','/usr/bin/chromium'
].find(p=>p&&fs.existsSync(p));
if(!CHROME){console.error('Could not find Chrome or Edge. Set CHROME to the browser path.');process.exit(2);}
const ROOT=path.join(__dirname,'..');
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'hangout-icons-'));
const ch=spawn(CHROME,['--headless=new','--remote-debugging-port=9334','--user-data-dir='+prof,'--no-first-run','about:blank']);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ws,id=0; const pend={};
const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pend[i]={res,rej};ws.send(JSON.stringify({id:i,method,params}));});
async function ev(expr){const r=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails).slice(0,400));return r.result.value;}

// The icon: the emo buddy on the app's dark purple, with a few gold stars. Head and shoulders, a full square (iOS rounds the corners itself).
const DRAW=`(async()=>{
  const star=(x,y,r)=>'<path d="'+starPath(x,y,r)+'" fill="#ffd166"/>';
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="SIZE" height="SIZE"><defs>'+document.querySelector('#gdefs').innerHTML+
    '<radialGradient id="icBg" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#4a3470"/><stop offset="1" stop-color="#231b2e"/></radialGradient></defs>'+
    '<rect width="512" height="512" fill="url(#icBg)"/>'+star(70,84,24)+star(446,96,18)+star(452,330,12)+star(58,320,10)+
    mascotSVG(starterLook('emo'),null,'x="16" y="10" width="480" height="648"')+'</svg>';
  const out={};
  for(const n of [180]){
    const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg.replace(/SIZE/g,n));
    const img=await new Promise((ok,bad)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=bad;i.src=url;});
    const c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');g.fillStyle='#231b2e';g.fillRect(0,0,n,n);g.drawImage(img,0,0,n,n);
    out[n]=c.toDataURL('image/png').split(',')[1];
  }
  return out;
})()`;

(async()=>{
  let tabs; for(let i=0;i<40;i++){try{tabs=await (await fetch('http://127.0.0.1:9334/json')).json();if(tabs.find(t=>t.type==='page'))break;}catch(e){}await sleep(250);}
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){d.error?pend[d.id].rej(new Error(JSON.stringify(d.error))):pend[d.id].res(d.result);delete pend[d.id];}};
  await send('Page.enable'); await send('Page.navigate',{url:pathToFileURL(path.join(ROOT,'index.html')).href});
  for(let i=0;i<80&&!(await ev('document.readyState==="complete"&&typeof mascotSVG==="function"'));i++) await sleep(250);
  const out=await ev(DRAW);
  for(const n of [180]){const f=path.join(ROOT,'web','icon-'+n+'.png');fs.writeFileSync(f,Buffer.from(out[n],'base64'));console.log('wrote',path.relative(ROOT,f),fs.statSync(f).size,'bytes');}
  ws.close(); ch.kill(); setTimeout(()=>{try{fs.rmSync(prof,{recursive:true,force:true});}catch(e){}process.exit(0);},500);
})().catch(e=>{console.error(e);ch.kill();process.exit(1);});
