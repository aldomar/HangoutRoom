'use strict';
/* =====================================================================
   72. 🛠️ CODE LAB LEVEL MAKER (v1.78)
   The Code Lab's 🛠️ Make tab (CL.mk) lists her 3 level slots (p.code.mine) and the levels saved in the other rooms
   on this device. A slot opens the editor (CL.view 'edit'): a 4×4, 5×5 or 6×6 map she paints (floor, 🧸 toy block,
   ⭐ star (5 at most), 💧 puddle, her buddy's start, the 🥕 carrot), a block limit and an optional ✨ My Move row.
   The blocks come from the map: arrows and 🔁 always, 🌟 with stars, ❓ with puddles, ✨ when My Move is on.
   ▶️ Test it plays the level in the normal play screen as level 'make' (CL.made = {own: slot}). Solving it saves it,
   with her answer as sol/move, so every saved level is known to be solvable (lmOk runs codeSim again).
   Coins: +LM_COINS for a new or changed level, LM_DAILY levels a day (p.code.makePay, dailyPay). Re-saving the same
   level pays nothing. Another room's level (CL.made = {from}) pays through Free Play (fpPay); nothing about it is saved.
   Made levels never touch code.solved, level bonuses or the 🤖 robots. Drafts stay in memory (LM.drafts) until saved.
   ===================================================================== */
const LM_COINS=3, LM_DAILY=3, LM_MAX_STARS=5;
const LM_TOOLS=[['.','⬜','Floor'],['#','🧸','Toy block'],['*','⭐','Star'],['~','💧','Puddle'],['F','','Start'],['C','🥕','Carrot']];
const LM={slot:0,d:null,tool:'#',drafts:{},drag:false,as:'',last:''};

// The blocks a level gets, from its map and My Move (in the Challenge level's order).
function lmBlocks(map,mv){const s=map.join('');return 'ULRD234'+(s.includes('*')?'S':'')+(mv?'M':'')+(s.includes('~')?'Q':'');}
const lmRows=d=>d.map.map(r=>r.join(''));
const lmKey=(map,max,mv)=>map.join('/')+'|'+max+'|'+(mv||0);
// A saved level as a puzzle the play screen understands.
function lmPz(L,hint){return {id:'mk:'+L.id,map:L.map,max:L.max,moveMax:L.moveMax||undefined,blocks:lmBlocks(L.map,L.moveMax),hint:hint||''};}
// A saved level is playable when its shape is right and its own answer still solves it.
function lmOk(L){
  if(!codeMineOk(L)||L.sol.length>L.max||(L.moveMax?L.move.length>L.moveMax:L.move)) return false;
  const ok=t=>[...t].every(c=>CODE_BLOCKS[c]&&lmBlocks(L.map,L.moveMax).includes(c));
  if(!L.sol||!ok(L.sol)||!ok(L.move)) return false;
  return codeSim(lmPz(L),[...L.sol],L.moveMax?[...L.move]:null).end==='win';
}
function lmBlank(n){
  const map=Array.from({length:n},()=>Array(n).fill('.'));
  map[n-1][0]='F'; map[0][n-1]='C';
  return {map,max:8,mv:0};
}
function lmFrom(L){return {map:L.map.map(r=>[...r]),max:L.max,mv:L.moveMax||0};}
function lmOthers(p){
  const out=[];
  DB.profiles.forEach(q=>{if(q.id===p.id||!q.code||!Array.isArray(q.code.mine))return;
    q.code.mine.forEach((L,i)=>{if(L&&lmOk(L))out.push({q,i,L});});});
  return out;
}

/* ---------- the 🛠️ list ---------- */
function lmList(){
  const p=P(); if(!p) return; codeStop(); CL.mk=true; CL.view='make'; CL.made=null; LM.drag=false;
  $('#clPick').classList.remove('hidden'); $('#clPlay').classList.add('hidden'); $('#clMake').classList.add('hidden'); $('#clTabs').classList.remove('hidden');
  $('#clBack').textContent='⬅ Room';
  $$('#clTabs .tab').forEach(b=>b.classList.toggle('on',!!b.dataset.make));
  $('#clHint').textContent=p.easy?'🛠️ 🗺️ ➡️ 🥕 ➡️ 💾':'🛠️ Make your own level! Solve it yourself to save it.';
  const mini=map=>`<svg viewBox="0 0 ${map[0].length*10} ${map.length*10}">${clMini({map})}</svg>`;
  let h=p.code.mine.map((L,i)=>{
    let dr=LM.drafts[i];
    if(dr&&L&&lmKey(lmRows(dr),dr.max,dr.mv)===lmKey(L.map,L.max,L.moveMax)) dr=null; // the same as the saved level
    if(L&&!dr) return `<button class="clp done" data-mine="${i}" aria-label="My level ${i+1}">${mini(L.map)}<b>${i+1}</b></button>`;
    if(dr) return `<button class="clp lm-draft" data-mine="${i}" aria-label="My level ${i+1}">${mini(lmRows(dr))}<b>${i+1}</b></button>`;
    return `<button class="clp" data-mine="${i}" aria-label="Make a new level"><span class="lm-new">➕</span><b>${p.easy?'':'New'}</b></button>`;
  }).join('');
  const others=lmOthers(p);
  if(others.length) h+=`<div class="lm-head">🏠 ${p.easy?'':'Levels from the other rooms'}</div>`
    +others.map(o=>`<button class="clp lm-other" data-from="${esc(o.q.id)}" data-slot="${o.i}" aria-label="${esc(o.q.name)}'s level">${mini(o.L.map)}<span class="lm-who">${esc(o.q.badge||'')} ${esc(o.q.name)}</span></button>`).join('');
  $('#clList').innerHTML=h;
}
function lmListTap(e){
  const m=e.target.closest('[data-mine]');
  if(m){SFX.click();lmEdit(Number(m.dataset.mine));return;}
  const o=e.target.closest('[data-from]'); if(!o) return;
  const q=DB.profiles.find(x=>x.id===o.dataset.from), L=q&&q.code.mine[Number(o.dataset.slot)];
  if(!L||!lmOk(L)){SFX.locked();lmList();return;}
  SFX.click(); clOpen('make',0,lmPz(L,`🛠️ ${q.name}'s level`)); CL.made={from:q.id,name:q.name};
}

/* ---------- the editor ---------- */
function lmEdit(i){
  const p=P(); if(!p) return; codeStop();
  LM.slot=i; LM.d=LM.drafts[i]||(p.code.mine[i]?lmFrom(p.code.mine[i]):lmBlank(5));
  CL.view='edit'; CL.made=null;
  $('#clPick').classList.add('hidden'); $('#clPlay').classList.add('hidden'); $('#clTabs').classList.add('hidden'); $('#clMake').classList.remove('hidden');
  $('#clBack').textContent='⬅ Levels';
  lmMsg(p.easy?'🗺️ ➡️ ▶️':'Pick a tool, then tap or drag on the map. 🎨',true);
  lmRender();
}
function lmMsg(t,tip){const m=$('#lmMsg');m.textContent=t;m.classList.toggle('hint',!!tip);m.classList.toggle('oops',!tip&&!!t);}
// Something changed: keep it as a draft of this slot (in memory only).
function lmChanged(){LM.drafts[LM.slot]=LM.d;}
function lmRender(){
  const p=P(), d=LM.d, n=d.map.length;
  $('#lmSize').innerHTML=[4,5,6].map(k=>`<button class="btn small ghost${k===n?' on':''}" data-size="${k}" aria-label="${k} by ${k}">${k}×${k}</button>`).join('');
  $('#lmTools').innerHTML=LM_TOOLS.map(([t,i,name])=>`<button class="clb${LM.tool===t?' on':''}" data-tool="${t}" aria-label="${name}">`
    +(t==='F'?`<svg viewBox="0 0 200 270">${mascotSVG(p.look,null,'width="200" height="270"')}</svg>`:i)+'</button>').join('');
  $('#lmLimits').innerHTML=`<span class="lm-step">🧩 <button class="btn small ghost" data-step="max:-1" aria-label="Fewer blocks">−</button><b>${d.max}</b><button class="btn small ghost" data-step="max:1" aria-label="More blocks">+</button></span>`
    +`<button class="btn small ${d.mv?'pink':'ghost'}" data-mv aria-label="My Move">✨ ${p.easy?'':'My Move'}</button>`
    +(d.mv?`<span class="lm-step">✨ <button class="btn small ghost" data-step="mv:-1" aria-label="Fewer My Move blocks">−</button><b>${d.mv}</b><button class="btn small ghost" data-step="mv:1" aria-label="More My Move blocks">+</button></span>`:'');
  $('#lmBlocks').innerHTML=[...lmBlocks(lmRows(d),d.mv)].filter(t=>t!=='3'&&t!=='4').map(t=>CODE_BLOCKS[t].n?'🔁':CODE_BLOCKS[t].i).join(' ');
  $('#lmDel').classList.toggle('hidden',!p.code.mine[LM.slot]&&!LM.drafts[LM.slot]);
  lmDraw();
}
function lmDraw(){
  const p=P(), d=LM.d, n=d.map.length, g=codeParse({map:lmRows(d)}), W=n*100;
  let s=clArt(g);
  if(g.start) s+=`<g transform="translate(${g.start.x*100},${g.start.y*100})">${mascotSVG(p.look,null,'x="10" y="-30" width="80" height="108"')}</g>`;
  const sv=$('#lmBoard'); sv.setAttribute('viewBox',`-10 -36 ${W+20} ${W+46}`); sv.innerHTML=s;
}
// Painting: the first square decides. Tapping a square that already has the tool's thing clears it (drag to clear more).
// The start and the carrot are moved with their own tools, never painted over, so a level always has both.
function lmCell(e){
  const sv=$('#lmBoard'), m=sv.getScreenCTM(); if(!m) return null;
  const pt=sv.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY;
  const q=pt.matrixTransform(m.inverse()), n=LM.d.map.length, x=Math.floor(q.x/100), y=Math.floor(q.y/100);
  return x>=0&&y>=0&&x<n&&y<n?{x,y}:null;
}
function lmPaint(x,y){
  const d=LM.d, row=d.map[y], was=row[x], t=LM.as;
  if(t==='F'||t==='C'){
    if(was===t||was==='F'||was==='C') return false;
    d.map.forEach(r=>r.forEach((c,i)=>{if(c===t)r[i]='.';})); row[x]=t; return true;
  }
  if(was==='F'||was==='C'||was===t) return false;
  if(t==='*'&&d.map.flat().filter(c=>c==='*').length>=LM_MAX_STARS){lmMsg(`⭐ ${LM_MAX_STARS} ${P().easy?'':'stars at most!'}`);return false;}
  row[x]=t; return true;
}
function lmPaintAt(c){
  if(!c||c.x+','+c.y===LM.last) return; LM.last=c.x+','+c.y;
  if(lmPaint(c.x,c.y)){lmChanged();tone(420+c.x*40+c.y*25,0.05,'triangle',0.06,600);lmDraw();$('#lmDel').classList.remove('hidden');}
}
$('#lmBoard').addEventListener('pointerdown',e=>{
  if(CL.view!=='edit') return; const c=lmCell(e); if(!c) return;
  const was=LM.d.map[c.y][c.x], t=LM.tool;
  LM.as=t!=='.'&&t!=='F'&&t!=='C'&&was===t?'.':t; LM.drag=true; LM.last='';
  try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}
  lmMsg('',true); lmPaintAt(c);
});
$('#lmBoard').addEventListener('pointermove',e=>{if(LM.drag&&LM.as!=='F'&&LM.as!=='C')lmPaintAt(lmCell(e));});
['pointerup','pointercancel','lostpointercapture'].forEach(k=>$('#lmBoard').addEventListener(k,()=>{LM.drag=false;}));
// A new size keeps what fits; the start and the carrot move inside if they were cut off.
function lmResize(n){
  const d=LM.d, old=d.map, map=Array.from({length:n},(_,y)=>Array.from({length:n},(_,x)=>old[y]&&old[y][x]||'.'));
  ['F','C'].forEach(t=>{
    if(map.flat().includes(t)) return;
    let at=null; old.forEach((r,y)=>r.forEach((c,x)=>{if(c===t)at={x:Math.min(x,n-1),y:Math.min(y,n-1)};}));
    if(!at||map[at.y][at.x]==='F'||map[at.y][at.x]==='C') at=t==='F'?{x:0,y:n-1}:{x:n-1,y:0};
    if(map[at.y][at.x]==='F'||map[at.y][at.x]==='C') at={x:0,y:0};
    map[at.y][at.x]=t;
  });
  d.map=map;
}
$('#clMake').addEventListener('click',e=>{
  if(CL.view!=='edit') return; const d=LM.d, b=e.target.closest('button'); if(!b) return;
  if(b.dataset.size){const n=Number(b.dataset.size);if(n!==d.map.length){lmResize(n);lmChanged();}SFX.click();lmRender();return;}
  if(b.dataset.tool){LM.tool=b.dataset.tool;SFX.click();lmRender();return;}
  if(b.dataset.step){const [k,v]=b.dataset.step.split(':'), lo=2, hi=k==='max'?16:6, nv=d[k]+Number(v);
    if(nv<lo||nv>hi){SFX.locked();return;} d[k]=nv; lmChanged(); SFX.click(); lmRender(); return;}
  if(b.hasAttribute('data-mv')){d.mv=d.mv?0:4;lmChanged();SFX.click();lmRender();return;}
});
$('#lmTest').onclick=()=>{
  if(CL.view!=='edit') return; const d=LM.d;
  SFX.click(); lmChanged();
  clOpen('make',0,{id:'mk:test',map:lmRows(d),max:d.max,moveMax:d.mv||undefined,blocks:lmBlocks(lmRows(d),d.mv),
    hint:P().easy?'💾 🥕':'Solve your level to save it! 💾'});
  CL.made={own:LM.slot};
};
$('#lmDel').onclick=()=>{
  if(CL.view!=='edit') return; const p=P(), i=LM.slot; SFX.click();
  if(!p.code.mine[i]){delete LM.drafts[i];lmList();return;} // only a draft: nothing saved to lose
  modal('🗑️ Remove this level?',`<p style="text-align:center">${p.easy?'🗺️ ❓':`Level ${i+1} will be gone for good.`}</p>`,
    [{text:'Keep it',cls:'ghost'},{text:'🗑️ Remove',cls:'pink',on:()=>{p.code.mine[i]=null;delete LM.drafts[i];save();SFX.whoosh();lmList();}}]);
};

/* ---------- solved ---------- */
// Called by clWin() while CL.made is set.
function lmWin(){
  const p=P(), made=CL.made, n=CL.prog.length+(clHasMove()?CL.move.length:0);
  CL.state='win'; clProg();
  const hop=$('#clFz .clhop'); if(hop) hop.classList.add('on');
  SFX.cheer(); vibrate(30);
  let title, body, btns;
  if(made.own!=null){
    const i=made.own, pz=clPz(), old=p.code.mine[i], mv=pz.moveMax||0, key=lmKey(pz.map,pz.max,mv);
    const fresh=!old||lmKey(old.map,old.max,old.moveMax)!==key;
    const L={id:fresh?'u'+Date.now().toString(36):old.id,map:pz.map.slice(),max:pz.max,moveMax:mv,sol:CL.prog.join(''),move:mv?CL.move.join(''):'',at:Date.now()};
    if(!lmOk(L)){CL.state='oops';clSay('🙈');return;} // can't happen: the run just won
    p.code.mine[i]=L; delete LM.drafts[i];
    let line='';
    if(fresh){
      p.stats.made++;
      const got=dailyPay(p.code.makePay,LM_COINS*LM_DAILY,LM_COINS);
      if(got){earn(got,'Level!');line=` · +${got} 🪙`;} else {save();line=p.easy?'':'<br><small>Level coins are full for today. Keep making for fun! ✨</small>';}
    } else save();
    title='💾 Level saved!';
    body=`${p.easy?'🎉':fresh?`Your level ${i+1} is saved. The other rooms can play it too! 🎉`:'Saved again! 🎉'}<br>${n} block${n>1?'s':''}${line}`;
    btns=[{text:'✏️ Edit',cls:'ghost',on:()=>lmEdit(i)},{text:'Yay! ✨',cls:'pink',on:lmList}];
  } else {
    const line=fpPay();
    title='🥕 Yum! Level solved!';
    body=`${p.easy?'🎉':`You solved ${esc(made.name)}'s level! 🎉`}<br>${n} block${n>1?'s':''}${line?' · '+line:''}`;
    btns=[{text:'🛠️ Levels',cls:'pink',on:lmList}];
  }
  CL.timer=setTimeout(()=>{
    if(cur!=='code'||CL.view!=='play') return;
    modal(title,`<div style="text-align:center;font-size:17px">${body}</div>`,btns);
  },700);
}

/* ---------- stickers + the pet ---------- */
STICKERS.push(
  stk('make1','code','🛠️','Level Maker','circle','Make a Code Lab level',1,p=>p.stats.made,1),
  stk('make3','code','🛠️','Game Designer','scallop','Make 3 Code Lab levels',3,p=>p.stats.made,2)
);
{const at=NT_LINES.findIndex(l=>/code puzzle/.test(l[2](2).join()));
 NT_LINES.splice(at<0?NT_LINES.length:at,0,[ntS('made'),1,n=>[n>1?`You made ${n} levels! 🛠️`:'You made a level! 🛠️','A brand new level! 🛠️']]);}
