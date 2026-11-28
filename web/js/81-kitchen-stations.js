'use strict';
/* =====================================================================
   81. 🍳 KITCHEN STATIONS (v1.91): the hands-on steps a recipe is made of
   Each station is KC_STATIONS[id] = {start(ctx)} → {stop(), hint()} (the runner and ctx are in section 79). It draws one SVG
   (viewBox 0 0 800 500, touch-action:none) into ctx.stage and its buttons into ctx.tools. Every gesture has a tap:
   🫧 wash   rub the dirt spots (or tap each one 3 times); 🌟/🧠 some spots are on the back: ↻ turns the fruit over.
   🍌 peel   swipe a peel strip down from the top (one long swipe can take several); a tap peels too (🌟/🧠: two taps).
             🌟/🧠 an upward swipe is a miss (peel comes off from the top); 🧠 shows no arrows.
   🔪 chop   swipe down across the banana or tap where to cut. 🌟 on the dotted lines; 🧠 "N equal pieces" with no lines.
   🥣 bowl   drag a fruit into the bowl or tap it (tap one in the bowl to take it out). 🐣 count one kind; 🌟 count by
             color; 🧠 groups + half as many, with vegetables on the tray that don't belong, then ✔.
   ✨ plate  tap a topping to add it, drag one to move it, drag it off the bowl to take it away. 🐣 free; 🌟 copy the
             order card; 🧠 finish the pattern around the rim first.
   The fruit from each step is added to ctx.dish.f, so the plated dish shows what she really made.
   The bowl's and the plate's puzzles come from the challenge makers (KC_MAKERS, section 82, v1.92).
   The smoke test reads a few answers from the handles (chop n, bowl need/tray, plate order/rim); nothing else uses them.
   ===================================================================== */
const kcInt=(r,a,b)=>a+Math.floor(r()*(b-a+1));
const kcPick=(r,a)=>a[Math.floor(r()*a.length)];
function kcShuf(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const kcPlural=(n,F)=>n===1?F.name:F.many;
// focus [x, y, w, h]: on a tall screen (an upright phone) the picture zooms to that part, so the thing to touch stays big.
function kcSvgIn(ctx,inner,focus){const b=ctx.stage.getBoundingClientRect(), tall=focus&&b.height>b.width*1.05;
  ctx.stage.innerHTML=`<svg class="kc-svg" viewBox="${tall?focus.join(' '):'0 0 800 500'}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;return ctx.stage.querySelector('svg');}
function kcPt(el,e){const m=el.getScreenCTM();if(!m)return {x:0,y:0};const q=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());return {x:q.x,y:q.y};}
function kcPulse(el){if(!el)return;el.classList.remove('kc-pulse');void el.getBoundingClientRect();el.classList.add('kc-pulse');setTimeout(()=>el.classList.remove('kc-pulse'),1700);}
// One pointer at a time on a station's SVG: o = {down(pt, e), move(pt, e), up(pt, moved, e)}.
function kcPointer(svg,o){
  let on=null;
  svg.addEventListener('pointerdown',e=>{if(on)return;on={id:e.pointerId,pt:kcPt(svg,e),moved:0};try{svg.setPointerCapture(e.pointerId);}catch(x){}if(o.down)o.down(on.pt,e);});
  svg.addEventListener('pointermove',e=>{if(!on||e.pointerId!==on.id)return;const pt=kcPt(svg,e);on.moved+=Math.hypot(pt.x-on.pt.x,pt.y-on.pt.y);on.pt=pt;if(o.move)o.move(pt,e);});
  const end=e=>{if(!on||e.pointerId!==on.id)return;const m=on.moved;on=null;if(o.up)o.up(kcPt(svg,e),m,e);};
  svg.addEventListener('pointerup',end); svg.addEventListener('pointercancel',end);
}
const kcSplash=()=>noise(0.3,0.08,2400,700);
const kcChop=()=>{noise(0.05,0.22,1600,300);tone(300,0.06,'triangle',0.08,180);};

/* ---------- 🫧 Wash ---------- */
const KC_WASH_EMO={apple:'🍎',pear:'🍐',peach:'🍑',carrot:'🥕',potato:'🥔'};
KC_STATIONS.wash={start(ctx){
  const r=ctx.rnd, L=ctx.lvl, free=!!ctx.free;
  let W, item, spots, back=false, alive=true, bub=0, squeak=0, total=0;
  const sides=()=>new Set(spots.filter(s=>s.dirt>0).map(s=>s.back));
  function newItem(){
    item=free?kcPick(r,KC_WASH_FRUIT.concat('carrot','potato')):kcPick(r,KC_WASH_FRUIT); W=KC_WASH[item]; back=false;
    const n=free?kcInt(r,3,5):L==='easy'?kcInt(r,2,3):L==='medium'?kcInt(r,4,5):6;
    const nb=free?kcInt(r,0,2):L==='easy'?0:L==='medium'?kcInt(r,1,2):3;
    spots=[]; let tries=0;
    while(spots.length<n&&tries++<400){const a=r()*Math.PI*2, d=18+r()*62, x=Math.cos(a)*d, y=Math.sin(a)*d*0.9;
      if(spots.every(s=>Math.hypot(s.x-x,s.y-y)>46)) spots.push({x,y,dirt:1,back:spots.length>=n-nb});}
    total=spots.length; draw();
    const nm=W.name, em=KC_WASH_EMO[item]||'';
    if(free) ctx.say(`🫧 Rub the dirt off the ${em}!`,`Rub the dirty spots to wash the ${nm}.`);
    else if(L==='easy') ctx.say(`🫧 Rub the dirt off the ${em}!`,`Rub the dirty spots to wash the ${nm}.`);
    else if(L==='medium') ctx.say(`🫧 Wash the ${em} ${nm}. Check the back too! ↻`,`Wash the ${nm}. Check the back too.`);
    else ctx.say(`🫧 Wash the ${em} ${nm} until it is clean all over.`,`Wash the ${nm} until it is clean all over.`);
    kcSplash();
  }
  const dirtG=(s,i)=>s.dirt>0&&s.back===back?`<g class="kc-dirt" data-spot="${i}" opacity="${Math.max(.15,s.dirt).toFixed(2)}" transform="translate(${s.x.toFixed(0)} ${s.y.toFixed(0)})">`
    +`<circle r="20" fill="#8a6237"/><circle cx="-12" cy="8" r="11" fill="#7a5230"/><circle cx="13" cy="-7" r="9" fill="#9b7246"/><circle cx="6" cy="12" r="6" fill="#7a5230"/></g>`:'';
  function draw(){
    const svg=kcSvgIn(ctx,`<ellipse cx="400" cy="440" rx="250" ry="34" fill="#8ac9f0" opacity=".35"/><ellipse cx="400" cy="436" rx="190" ry="18" fill="#cfeeff" opacity=".35"/>`
      +`<g transform="translate(400 250)"><g class="kc-flip" id="kcWashG">${W.d(back)}${spots.map(dirtG).join('')}</g></g><g id="kcBub"></g>`,[200,90,400,390]);
    kcPointer(svg,{down:()=>{lastPt=null;},move:(pt,e)=>rub(pt,e),up:(pt,m)=>{lastPt=null;if(m<10)tapAt(pt);}});
  }
  function hitSpots(pt,rad){return spots.map((s,i)=>({s,i})).filter(o=>o.s.dirt>0&&o.s.back===back&&Math.hypot(o.s.x+400-pt.x,o.s.y+250-pt.y)<rad);}
  function bubble(pt,big){
    const g=$('#kcBub'); if(!g) return; if(g.childElementCount>26) g.firstChild.remove();
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',(pt.x+(Math.random()*30-15)).toFixed(0)); c.setAttribute('cy',(pt.y+(Math.random()*30-15)).toFixed(0)); c.setAttribute('r',big?14:6+Math.random()*8);
    c.setAttribute('class','kc-bubble'); g.appendChild(c); setTimeout(()=>c.remove(),800);
  }
  let lastPt=null;
  function rub(pt){
    if(lastPt){const d=Math.min(60,Math.hypot(pt.x-lastPt.x,pt.y-lastPt.y)); bub+=d;
      if(bub>22){bub=0;bubble(pt);} hitSpots(pt,46).forEach(o=>clean(o.i,d/110));
      const t=Date.now(); if(d>4&&t-squeak>140){squeak=t;tone(1100+Math.random()*500,0.04,'sine',0.03);} }
    lastPt=pt; ctx.touch();
  }
  function tapAt(pt){const h=hitSpots(pt,52); h.slice(0,1).forEach(o=>{clean(o.i,0.34);bubble(pt,1);bubble(pt);tone(900,0.05,'sine',0.05,1300);});}
  function clean(i,by){
    const s=spots[i]; if(!s||s.dirt<=0) return; s.dirt-=by;
    const el=ctx.stage.querySelector(`[data-spot="${i}"]`);
    if(s.dirt<=0){if(el)el.remove();SFX.pop();checkDone();}
    else if(el) el.setAttribute('opacity',Math.max(.15,s.dirt).toFixed(2));
  }
  function checkDone(){
    const left=sides();
    if(!left.size){
      const g=$('#kcWashG'); if(g) g.classList.add('kc-shine'); kcSplash();
      if(free){SFX.happy();toast(`✨ Squeaky clean ${W.name}!`);setTimeout(()=>{if(alive&&ctx.live())newItem();},1300);return;}
      const piece={apple:'apple',pear:'pear',peach:'peach'}[item]||'apple'; ctx.dish.f.push(piece,piece);
      ctx.done(); return;
    }
    if(!left.has(back)){ctx.say('↻ Turn it around! More dirt on the back.','Turn it around! There is more dirt on the back.');kcPulse($('#kcTurn'));}
  }
  function turn(){
    const g=$('#kcWashG'); if(!g) return; SFX.whoosh(); ctx.touch();
    g.classList.add('kc-turning'); setTimeout(()=>{if(!alive)return;back=!back;draw();const h=$('#kcWashG');if(h){h.classList.add('kc-turned');}},180);
  }
  ctx.tools.innerHTML=free||L!=='easy'?`<button class="btn ghost kc-tool" id="kcTurn" aria-label="Turn it around">↻ <span class="tn">Turn</span></button>`:'';
  const tb=$('#kcTurn'); if(tb) tb.onclick=turn;
  newItem();
  return {stop(){alive=false;},hint(){
    const h=spots.findIndex(s=>s.dirt>0&&s.back===back);
    if(h>=0){kcPulse(ctx.stage.querySelector(`[data-spot="${h}"]`));tell('Rub the brown spots.');}
    else{kcPulse($('#kcTurn'));tell('Turn it around.');}}};
}};

/* ---------- 🍌 Peel ---------- */
const KC_BAN_TOP=-185, KC_BAN_BOT=165;
const kcBanW=y=>{const t=(y-KC_BAN_TOP)/(KC_BAN_BOT-KC_BAN_TOP);return 10+60*Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,t))),0.7);};
const kcBanX=y=>-26*Math.sin(Math.PI*(y-KC_BAN_TOP)/(KC_BAN_BOT-KC_BAN_TOP)); // a gentle curve
function kcBanEdge(u){const pts=[];for(let y=KC_BAN_TOP;y<=KC_BAN_BOT;y+=17.5)pts.push([kcBanX(y)+u*kcBanW(y),y]);return pts;}
function kcStripPath(u0,u1){const a=kcBanEdge(u0),b=kcBanEdge(u1).reverse();return 'M'+a.concat(b).map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')+'Z';}
KC_STATIONS.peel={start(ctx){
  const L=ctx.lvl, N=L==='easy'?3:L==='medium'?4:5, strips=Array(N).fill(0); // 0 on, 1 lifted, 2 off
  let alive=true, touched=new Set(), start=null, arrows=L!=='hard';
  const flesh=kcStripPath(-0.92,0.92);
  function draw(){
    const svg=kcSvgIn(ctx,`<g transform="translate(400 262)"><path d="${flesh}" fill="#fff3c4" ${kcL(4)}/>`
      +`<path d="M${(kcBanX(KC_BAN_TOP)-8).toFixed(0)} ${KC_BAN_TOP-28} h16 v30 h-16Z" fill="#7a5a2a" ${kcL(3)}/>`
      +strips.map((s,k)=>{const u0=-1+2*k/N,u1=-1+2*(k+1)/N, mid=(u0+u1)/2;
        return `<g class="kc-strip${s===1?' lift':''}${s===2?' off':''}" data-strip="${k}" style="--r:${mid<0?-118:118}deg;--l:${mid<0?-10:10}deg">`
          +`<path d="${kcStripPath(u0,u1)}" fill="#ffd93b" ${kcL(3.5)}/>`
          +(arrows&&s!==2?`<path class="kc-arrow" d="M${(kcBanX(-110)+mid*kcBanW(-110)).toFixed(0)} -140 v46 m-10 -12 l10 12 l10 -12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`:'')
          +`</g>`;}).join('')
      +`<circle cx="${kcBanX(KC_BAN_BOT).toFixed(0)}" cy="${KC_BAN_BOT+2}" r="7" fill="#5a3a1e"/></g>`,[250,40,300,460]);
    kcPointer(svg,{down:(pt,e)=>{start=pt;touched=new Set();add(e);},move:(pt,e)=>add(e),up:(pt,m)=>release(pt,m)});
  }
  function add(e){const el=document.elementFromPoint(e.clientX,e.clientY), g=el&&el.closest&&el.closest('[data-strip]');if(g)touched.add(+g.dataset.strip);ctx.touch();}
  function off(k){if(strips[k]===2)return false;strips[k]=2;return true;}
  function release(pt,moved){
    if(!start) return; const dy=pt.y-start.y, dx=pt.x-start.x, ks=[...touched].filter(k=>strips[k]!==2); start=null;
    if(!ks.length) return;
    if(moved<14){ // a tap
      const k=ks[0];
      if(L==='easy'||strips[k]===1){off(k);peeled();}
      else {strips[k]=1;draw();SFX.click();ctx.say('🍌 Tap it again, or swipe down ⬇️','Tap it again, or swipe down.');}
      return;
    }
    if(L==='easy'||(dy>30&&Math.abs(dy)>=Math.abs(dx)*0.5)){ks.forEach(off);peeled(ks.length);return;}
    if(dy<-30&&Math.abs(dy)>=Math.abs(dx)*0.5){
      const n=ctx.miss('Oops! Peel comes off from the top, down ⬇️');
      if(ctx.help()||n>=2){arrows=true;ks.forEach(off);peeled(ks.length);} else {arrows=true;draw();}
      return;
    }
    ctx.say('🍌 Swipe down the peel ⬇️','Swipe down the yellow peel.');
  }
  function peeled(n){
    draw(); noise(0.12,0.12,900,300); tone(500,0.08,'triangle',0.08,320); vibrate(10);
    if(n>1&&n===N) toast('🍌 One long swipe! Wow!');
    if(strips.every(s=>s===2)){
      setTimeout(()=>{if(!alive)return;ctx.stage.querySelectorAll('.kc-strip').forEach(g=>g.classList.add('gone'));},450);
      if(L==='easy') ctx.dish.f.push('banana','banana','banana');
      ctx.done();
    }
  }
  if(L==='easy') ctx.say('🍌 Peel the banana! Swipe or tap the peel.','Peel the banana. Swipe or tap the yellow peel.');
  else if(L==='medium') ctx.say('🍌 Peel the banana: swipe down from the top ⬇️','Peel the banana. Swipe down from the top.');
  else ctx.say('🍌 Peel the banana. Which way does peel come off?','Peel the banana. Which way does the peel come off?');
  draw();
  return {stop(){alive=false;},hint(){const k=strips.findIndex(s=>s!==2);if(k<0)return;arrows=true;draw();kcPulse(ctx.stage.querySelector(`[data-strip="${k}"]`));tell('Swipe down from the top.');}};
}};

/* ---------- 🔪 Chop ---------- */
const KC_CH_A=140, KC_CH_B=660, KC_CH_Y=250;
KC_STATIONS.chop={start(ctx){
  const r=ctx.rnd, L=ctx.lvl, N=kcInt(r,3,4); // pieces
  const len=KC_CH_B-KC_CH_A, guides=Array.from({length:N-1},(_,i)=>KC_CH_A+len*(i+1)/N);
  let cuts=[], showG=L==='medium', snap=L==='medium', alive=true, start=null, busy=false;
  function draw(slash){
    const xs=[KC_CH_A].concat(cuts.slice().sort((a,b)=>a-b),[KC_CH_B]), pcs=[];
    for(let i=0;i<xs.length-1;i++) pcs.push([xs[i],xs[i+1]]);
    const spread=10, mid=(pcs.length-1)/2;
    const svg=kcSvgIn(ctx,`<defs><clipPath id="kcBanC"><rect x="${KC_CH_A}" y="${KC_CH_Y-40}" width="${len}" height="80" rx="40"/></clipPath></defs>`
      +`<rect x="90" y="150" width="620" height="200" rx="26" fill="#d9a46d" ${kcL(4)}/><rect x="110" y="168" width="580" height="164" rx="18" fill="#e8b97a"/>`
      +`<circle cx="672" cy="190" r="10" fill="#c98b52" ${kcL(3)}/>`
      +pcs.map(([a,b],i)=>`<g transform="translate(${((i-mid)*spread).toFixed(0)} 0)"><g clip-path="url(#kcBanC)"><rect x="${a}" y="${KC_CH_Y-42}" width="${b-a}" height="84" fill="#fff3c4"/>`
        +`<path d="M${a} ${KC_CH_Y-14} H${b} M${a} ${KC_CH_Y+14} H${b}" stroke="#f2df9a" stroke-width="3"/></g>`
        +(a>KC_CH_A?`<ellipse cx="${a}" cy="${KC_CH_Y}" rx="7" ry="36" fill="#fbe58a" ${kcL(2)}/>`:`<circle cx="${KC_CH_A+6}" cy="${KC_CH_Y}" r="7" fill="#7a5a2a"/>`)
        +(b<KC_CH_B?`<ellipse cx="${b}" cy="${KC_CH_Y}" rx="7" ry="36" fill="#fbe58a" ${kcL(2)}/>`:'')+`</g>`).join('')
      +`<rect x="${KC_CH_A}" y="${KC_CH_Y-40}" width="${len}" height="80" rx="40" fill="none" ${kcL(4)} opacity="${cuts.length?0:1}"/>`
      +(showG?guides.map((x,i)=>cuts.some(c=>Math.abs(c-x)<2)?'':`<path class="kc-guide" data-g="${i}" d="M${x} ${KC_CH_Y-62} V${KC_CH_Y+62}" stroke="#fff" stroke-width="5" stroke-dasharray="10 9" stroke-linecap="round"/>`).join(''):'')
      +(slash!=null?`<path class="kc-slash" d="M${slash} ${KC_CH_Y-80} V${KC_CH_Y+80}" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`:''));
    kcPointer(svg,{down:pt=>{start=pt;},up:(pt,m)=>release(pt,m)});
  }
  function release(pt,moved){
    if(!start||busy) return; const s=start; start=null; ctx.touch();
    const inBan=y=>y>KC_CH_Y-70&&y<KC_CH_Y+70;
    let x=null;
    if(moved<14){if(inBan(pt.y)&&pt.x>KC_CH_A&&pt.x<KC_CH_B)x=pt.x;}
    else if(pt.y-s.y>40&&Math.min(s.y,pt.y)<KC_CH_Y+20&&Math.max(s.y,pt.y)>KC_CH_Y-20) x=(s.x+pt.x)/2;
    if(x==null||x<=KC_CH_A+8||x>=KC_CH_B-8) return;
    if(snap){
      const open=guides.filter(g=>!cuts.some(c=>Math.abs(c-g)<2)); if(!open.length) return;
      const near=open.reduce((a,g)=>Math.abs(g-x)<Math.abs(a-x)?g:a,open[0]);
      if(Math.abs(near-x)>36&&!ctx.help()){const n=ctx.miss('Cut on the dotted lines! ✂️'); if(n<2){kcPulse(ctx.stage.querySelector('.kc-guide'));return;}}
      x=near;
    } else if(cuts.concat(KC_CH_A,KC_CH_B).some(c=>Math.abs(c-x)<26)){toast('Too close! Cut a bit further away');return;}
    cuts.push(x); kcChop(); vibrate(12); draw(x);
    if(cuts.length<N-1) return;
    // all the cuts are made
    const xs=[KC_CH_A].concat(cuts.slice().sort((a,b)=>a-b),[KC_CH_B]), size=len/N;
    const ok=snap||xs.slice(1).every((b,i)=>Math.abs(b-xs[i]-size)<=size*0.22);
    if(ok){ctx.dish.f.push(...Array(N).fill('banana'));ctx.done();return;}
    busy=true; const n=ctx.miss('Hmm, some pieces are bigger than others! Try again.');
    setTimeout(()=>{if(!alive)return;busy=false;cuts=[];if(n>=2){showG=true;snap=true;ctx.say(`🔪 Cut on the lines: ${N} equal pieces.`,`Cut on the lines to make ${N} equal pieces.`);}draw();},1100);
  }
  if(L==='medium') ctx.say('🔪 Cut the banana on the dotted lines!','Cut the banana on the dotted lines. Swipe down or tap.');
  else ctx.say(`🔪 Cut the banana into ${N} equal pieces.`,`Cut the banana into ${N} equal pieces. Make them all the same size.`);
  draw();
  return {n:N,stop(){alive=false;},hint(){
    if(showG){kcPulse(ctx.stage.querySelector('.kc-guide'));tell('Cut on the dotted lines.');return;}
    const svg=ctx.stage.querySelector('svg'); if(!svg) return;
    svg.insertAdjacentHTML('beforeend',guides.map(x=>`<path class="kc-tick" d="M${x} ${KC_CH_Y-74} v20" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`).join(''));
    setTimeout(()=>ctx.stage.querySelectorAll('.kc-tick').forEach(t=>t.remove()),1800); tell(`Make ${N} pieces the same size.`);}};
}};

/* ---------- 🥣 Into the bowl ---------- */
const KC_BOWL={x:400,y:478,k:2.3};
const KC_BY_COL={red:['strawberry','cherry'],orange:['orange','mango'],green:['kiwi','grape'],blue:['blueberry'],purple:['plum']};
const KC_COL_NAME={red:'red',orange:'orange',green:'green',blue:'blue',purple:'purple'};
KC_STATIONS.bowl={start(ctx){
  const r=ctx.rnd, L=ctx.lvl, pre=ctx.dish.f.slice(), pileId='bowl:'+(ctx.run?ctx.run.seed:'x');
  let need=[], tray=[], inB=[], alive=true, drag=null, fixed=false, shown, spoken, showNeed=L!=='hard', hardWords='';
  // need: [{key, test(foodId), n, label, icon}] - what has to be in the bowl, from the 🥣 count maker (section 82)
  const pz=kcMake('count',L,r);
  need=pz.need.map(nd=>({key:nd.key,n:nd.n,col:nd.by==='col'?nd.key:'',label:nd.by==='col'?nd.label:'',
    test:nd.by==='col'?id=>KC_FOOD[id].col===nd.key:id=>id===nd.key,icon:nd.by==='id'?kcFood(nd.key,0,0,0.9):''}));
  tray=pz.tray.map((id,i)=>({id,i,out:false})); shown=pz.shown; spoken=pz.say; hardWords=L==='hard'?pz.hint:'';
  const have=nd=>inB.filter(id=>nd.test(id)).length;
  const trayPos=i=>{const per=Math.ceil(tray.length/2), row=i<per?0:1, k=row?i-per:i, n=row?tray.length-per:per;return {x:400+(k-(n-1)/2)*Math.min(84,700/n),y:row?172:76};};
  function bowlG(){
    const all=pre.concat(inB), pile=kcPile(pileId,Math.max(all.length,1));
    return `<g transform="translate(${KC_BOWL.x} ${KC_BOWL.y}) scale(${KC_BOWL.k})">${kcBowlBack()}`
      +all.map((id,i)=>kcFood(id,pile[i].x,pile[i].y,0.62,i>=pre.length?` class="kc-bi" data-bi="${i-pre.length}"`:'')).join('')+kcBowlFront()+`</g>`;
  }
  function draw(){
    const svg=kcSvgIn(ctx,`<rect x="20" y="24" width="760" height="210" rx="26" fill="#ffffff14" stroke="#ffffff30" stroke-width="3"/>`
      +`<g id="kcBowlG">${bowlG()}</g>`
      +tray.map(t=>t.out?'':(p=>`<g class="kc-ti" data-ti="${t.i}" transform="translate(${p.x.toFixed(0)} ${p.y.toFixed(0)})"><circle r="38" fill="transparent"/>${kcFood(t.id,0,0,1.7)}</g>`)(trayPos(t.i))).join(''));
    kcPointer(svg,{down:(pt,e)=>{const g=e.target.closest&&e.target.closest('[data-ti],[data-bi]');drag=g?{g,pt0:pt,ti:g.dataset.ti!=null?+g.dataset.ti:null,bi:g.dataset.bi!=null?+g.dataset.bi:null}:null;ctx.touch();},
      move:pt=>{if(drag&&drag.ti!=null){const p=trayPos(drag.ti);drag.g.setAttribute('transform',`translate(${(p.x+pt.x-drag.pt0.x).toFixed(0)} ${(p.y+pt.y-drag.pt0.y).toFixed(0)}) scale(1.1)`);}},
      up:(pt,m)=>{const d=drag;drag=null;if(!d)return;
        if(d.bi!=null){if(m<14)takeOut(d.bi);return;}
        const intoBowl=m<14||(pt.y>290&&Math.abs(pt.x-KC_BOWL.x)<210);
        if(intoBowl) putIn(d.ti); else draw();}});
    counters();
  }
  function counters(){
    const H=need.map(nd=>{const h=have(nd);
      const ic=nd.col?`<i class="kc-cdot" style="background:${KC_COLS[nd.col]}"></i><span>${nd.label}</span>`:`<svg viewBox="-20 -22 40 44" aria-hidden="true">${nd.icon}</svg>`;
      const dots=L==='easy'?`<span class="kc-dots">${Array.from({length:nd.n},(_,i)=>`<i class="${i<h?'on':''}"></i>`).join('')}</span>`:'';
      return `<div class="kc-count${h===nd.n&&showNeed?' ok':''}">${ic}<b>${h}${showNeed?' / '+nd.n:''}</b>${dots}</div>`;}).join('');
    ctx.tools.innerHTML=`<div class="kc-counts">${H}</div>`+(L==='hard'?`<button class="btn pink kc-done" id="kcBowlDone" aria-label="Done">✔ <span class="tn">Done</span></button>`:'');
    const d=$('#kcBowlDone'); if(d) d.onclick=check;
  }
  function bounce(ti){draw();const g=ctx.stage.querySelector(`[data-ti="${ti}"]`);if(g){g.classList.add('kc-no');}}
  function putIn(ti){
    const t=tray.find(x=>x.i===ti); if(!t||t.out||fixed) return; const F=KC_FOOD[t.id];
    if(F.kind==='veg'){ctx.miss(`${F.many[0].toUpperCase()+F.many.slice(1)} in a fruit salad? Silly! Only fruit.`);bounce(ti);return;}
    if(L!=='hard'){
      const nd=need.find(n=>n.test(t.id));
      if(!nd){ctx.miss(`We need ${need.map(n=>n.label).join(' and ')} fruits!`);bounce(ti);return;}
      if(have(nd)>=nd.n){if(!ctx.help())ctx.miss(`That's too many! We need ${nd.n}.`);else toast(`We need ${nd.n} ✔`);bounce(ti);return;}
    }
    t.out=true; inB.push(t.id); tone(600+inB.length*40,0.07,'sine',0.08,900); SFX.pop(); draw();
    if(L!=='hard'&&need.every(nd=>have(nd)===nd.n)) finish();
  }
  function takeOut(bi){
    if(fixed) return; const id=inB[bi]; if(id==null) return; inB.splice(bi,1);
    const t=tray.find(x=>x.out&&x.id===id); if(t) t.out=false; SFX.click(); draw();
  }
  function check(){
    if(fixed) return; const wrong=need.find(nd=>have(nd)!==nd.n);
    if(!wrong){finish();return;}
    const F=KC_FOOD[wrong.key], h=have(wrong), n=ctx.miss(`You have ${h} ${kcPlural(h,F)}. ${hardWords}`);
    showNeed=true; counters();
    if(n>=2) autoFix();
  }
  function autoFix(){ // the second miss: put in exactly what's needed, and move on
    fixed=true; inB=[]; need.forEach(nd=>{for(let i=0;i<nd.n;i++)inB.push(nd.key);});
    tray.forEach(t=>{t.out=false;}); need.forEach(nd=>{let k=nd.n;tray.forEach(t=>{if(k>0&&t.id===nd.key){t.out=true;k--;}});});
    draw(); toast('✨ Here is how many we need!'); setTimeout(()=>{if(alive)finish();},1400);
  }
  function finish(){fixed=true;ctx.dish.f.push(...inB);ctx.done();}
  ctx.say(shown,spoken); draw();
  return {need:()=>need.map(n=>({key:n.key,n:n.n,col:n.col||''})),tray:()=>tray.map(t=>({id:t.id,i:t.i,out:t.out})),stop(){alive=false;},hint(){
    if(L==='hard'){showNeed=true;counters();tell(hardWords);return;}
    const nd=need.find(n=>have(n)<n.n); if(!nd) return; const t=tray.find(x=>!x.out&&nd.test(x.id));
    if(t) kcPulse(ctx.stage.querySelector(`[data-ti="${t.i}"]`)); tell(`We need ${nd.n}. You have ${have(nd)}.`);}};
}};

/* ---------- ✨ Decorate & plate ---------- */
const KC_PLATE={x:400,y:450,k:2.6};
KC_STATIONS.plate={start(ctx){
  const r=ctx.rnd, L=ctx.lvl, D=ctx.dish, pileId='bowl:'+(ctx.run?ctx.run.seed:'x');
  let alive=true, drag=null, order=null, rim=null, rimGiven=0, doneShown=L==='medium';
  D.c=[]; D.rim=[];
  if(L==='medium') order=kcMake('order','medium',r).order; // 🧾 and 🔁 makers (section 82)
  if(L==='hard'){const pz=kcMake('pattern','hard',r);rim=pz.rim;rimGiven=pz.given;D.rim=rim.slice(0,rimGiven);}
  const cnt=k=>D.c.filter(t=>t.k===k).length;
  const orderWords=()=>order.map(o=>`${o.n} ${o.n===1?KC_TOPS[o.k].name:KC_TOPS[o.k].many}`).join(', ').replace(/, ([^,]*)$/,' and $1');
  function draw(){
    const all=D.f, pile=kcPile(pileId,Math.max(all.length,1));
    const rimG=rim?rim.map((k,i)=>{const p=kcRimPt(i);return D.rim[i]?kcTop(D.rim[i],p.x,p.y+14,0.7):`<circle class="kc-slot${i===D.rim.length?' next':''}" cx="${p.x}" cy="${p.y+14}" r="8" fill="#ffffff55" stroke="#fff" stroke-width="2" stroke-dasharray="4 3"/>`;}).join(''):'';
    const svg=kcSvgIn(ctx,`<ellipse cx="400" cy="462" rx="250" ry="26" fill="#00000030"/><g id="kcPlateG" transform="translate(${KC_PLATE.x} ${KC_PLATE.y}) scale(${KC_PLATE.k})">`
      +kcBowlBack()+all.map((id,i)=>kcFood(id,pile[i].x,pile[i].y,0.62)).join('')+kcBowlFront()+rimG
      +D.c.map((t,i)=>`<g class="kc-tp" data-tp="${i}">${kcTop(t.k,t.x,t.y,0.8)}</g>`).join('')+`</g>`,[180,130,440,370]);
    kcPointer(svg,{down:(pt,e)=>{const g=e.target.closest&&e.target.closest('[data-tp]');drag=g?{i:+g.dataset.tp}:null;ctx.touch();},
      move:(pt,e)=>{if(!drag)return;const q=kcPt($('#kcPlateG'),e), t=D.c[drag.i];if(!t)return;t.x=+q.x.toFixed(1);t.y=+q.y.toFixed(1);
        const g=ctx.stage.querySelector(`[data-tp="${drag.i}"]`);if(g)g.innerHTML=kcTop(t.k,t.x,t.y,0.8);},
      up:(pt,m,e)=>{const d=drag;drag=null;if(!d||m<6)return;const t=D.c[d.i];if(!t)return;
        if(t.y>-30||Math.abs(t.x)>96||t.y<-150){D.c.splice(d.i,1);SFX.click();toast('Poof! Taken off');}
        else{t.x=Math.max(-70,Math.min(70,t.x));t.y=Math.max(-118,Math.min(-46,t.y));}
        draw();tools();}});
  }
  function tools(){
    const card=order?`<div class="kc-card" aria-label="Order card">🧾 ${order.map(o=>`<span>${KC_TOPS[o.k].icon}×${o.n}</span>`).join('')}</div>`:'';
    const done=doneShown?`<button class="btn pink kc-done" id="kcPlateDone" aria-label="Done">✔ <span class="tn">Done</span></button>`:'';
    ctx.tools.innerHTML=card+`<div class="kc-tops">`+KC_TOP_IDS.map(k=>`<button class="btn ghost kc-topbtn" data-top="${k}" aria-label="${KC_TOPS[k].name}">${KC_TOPS[k].icon}</button>`).join('')+`</div>`+done;
    ctx.tools.querySelectorAll('[data-top]').forEach(b=>b.onclick=()=>addTop(b.dataset.top));
    const d=$('#kcPlateDone'); if(d) d.onclick=check;
  }
  function freeSpot(){let best=null,bd=-1;for(let k=0;k<14;k++){const x=-60+r()*120,y=-112+r()*58, d=Math.min(99,...D.c.map(t=>Math.hypot(t.x-x,t.y-y)));if(d>bd){bd=d;best={x:+x.toFixed(1),y:+y.toFixed(1)};}}return best;}
  function addTop(k){
    ctx.touch();
    if(rim&&D.rim.length<KC_RIM_N){
      const want=rim[D.rim.length];
      if(k!==want){const n=ctx.miss('Look at the pattern! What comes next?');kcPulse(ctx.stage.querySelector('.kc-slot.next'));if(n<2&&!ctx.help())return;k=want;}
      D.rim.push(k); tone(700+D.rim.length*60,0.08,'sine',0.08); SFX.pop(); draw();
      if(D.rim.length===KC_RIM_N){doneShown=true;tools();ctx.say('✨ Pattern done! Add more toppings, then tap ✔','Pattern done! Add more toppings if you like, then tap done.');}
      return;
    }
    if(D.c.length>=16){toast('The bowl is full! Tap ✔');return;}
    const s=freeSpot(); D.c.push({k,x:s.x,y:s.y});
    if(k==='dots'){tone(1500,0.05,'square',0.03);tone(1800,0.05,'square',0.03,null,0.05);} else SFX.pop();
    draw(); if(!doneShown){doneShown=true;tools();}
  }
  function check(){
    if(order){
      const bad=order.find(o=>cnt(o.k)!==o.n)||(D.c.some(t=>!order.some(o=>o.k===t.k))?{extra:1}:null);
      if(bad){
        const n=ctx.miss(bad.extra?'The card only has '+orderWords()+'.':`The card says ${bad.n} ${bad.n===1?KC_TOPS[bad.k].name:KC_TOPS[bad.k].many}. You have ${cnt(bad.k)}.`);
        if(n<2) return;
        D.c=[]; order.forEach(o=>{for(let i=0;i<o.n;i++){const s=freeSpot();D.c.push({k:o.k,x:s.x,y:s.y});}}); draw(); toast('✨ Here it is, just like the card!');
        setTimeout(()=>{if(alive)ctx.done();},1200); return;
      }
    }
    ctx.done();
  }
  if(L==='easy') ctx.say('✨ Decorate your salad! Tap a topping.','Decorate your salad! Tap a topping, then tap done.');
  else if(L==='medium') ctx.say('✨ Make it look like the order card!',`Copy the order card: ${orderWords()}. Then tap done.`);
  else ctx.say('✨ Finish the pattern around the bowl!','Finish the pattern around the bowl. What comes next?');
  draw(); tools();
  return {order:()=>order,rim:()=>rim,stop(){alive=false;},hint(){
    if(rim&&D.rim.length<KC_RIM_N){kcPulse(ctx.tools.querySelector(`[data-top="${rim[D.rim.length]}"]`));tell('Look at the pattern. Say it out loud!');return;}
    if(order){const o=order.find(x=>cnt(x.k)!==x.n);if(o){kcPulse(ctx.tools.querySelector(`[data-top="${o.k}"]`));tell(`The card says ${o.n}. You have ${cnt(o.k)}.`);return;}}
    kcPulse(ctx.tools.querySelector('.kc-tops')); tell('Tap a topping.');}};
}};
