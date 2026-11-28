'use strict';
/* =========================================================
   63. BALL FIELD: 👯 BATTING DUEL (v1.64), two players on one device (like the ⚽ Soccer Duel, section 43)
   The Ball Field's 👯 tab opens tgPick('ball') (another room or 👤 Guest). Then they take turns, one pitch each,
   TG_SHOTS (10) pitches in all: one player bats (their buddy at the plate, tap to swing, the batting rules from
   section 59), the other pitches (their buddy on the mound) by picking a pitch with big buttons (#bdBar):
   🐢 Slow and ⚡ Fast, + 🎈 Floater on Medium and Hard, + 🌀 Curve on Hard. The level tabs set how fast the pitches
   are and how good the timing must be (bfLvl() gives BDL.lvl while the duel is on; Easy mode's extra help is off,
   so it's the same for both). Most hits wins, but both are cheered (tgCheer).
   Coins only through tgPay (TG_COINS to each room, not a Guest, TG_DAILY a day). Never changes bests, bats,
   stats.hits/homers or stickers' counts except duo.ball (games played together, added in v1.64).
   Hooks in section 59: bfLvl, bfTap, bfSwing, bfScore, bfResult, bfNext, bfStop, renderBall, drawBallField, the tabs.
   ========================================================= */
// T = seconds from the throw to the plate per level (easy, medium, hard); x = where it crosses; kind as in BAT_PITCHES.
const BD_PITCHES={
  slow:{icon:'🐢',name:'Slow',kind:0,x:0,T:{easy:1.6,medium:1.35,hard:1.15}},
  fast:{icon:'⚡',name:'Fast',kind:0,x:0.2,T:{easy:1.2,medium:0.95,hard:0.75}},
  floater:{icon:'🎈',name:'Floater',kind:1,x:-0.2,T:{medium:1.35,hard:1.2}},
  curve:{icon:'🌀',name:'Curve',kind:2,x:0.3,T:{hard:0.9}}
};
const BDL={on:false,pl:null,lvl:'medium',res:[],lay:''}; // res: one {by, res} per pitch (by = the batter, 0 or 1)
const bdNo=()=>BF.state==='result'||BF.state==='done'?BDL.res.length-1:BDL.res.length; // the pitch being thrown (or just thrown)
const bdBatter=()=>BDL.pl[Math.max(0,bdNo())%2], bdPitcherPl=()=>BDL.pl[(Math.max(0,bdNo())+1)%2];
const bdChoices=lvl=>Object.keys(BD_PITCHES).filter(k=>BD_PITCHES[k].T[lvl]);

function bdOff(){BDL.on=false;$('#bdBar').classList.add('hidden');$('#bdPitcher').classList.add('hidden');$('#bfTabs').classList.remove('duo');$('#bfTabs [data-duo]').classList.remove('on');}
function bdStart(){
  const pl=tgPlayers(); if(!pl||cur!=='ball') return;
  const p=P(); ctStop(); hrStop();
  Object.assign(BDL,{on:true,pl,lvl:BDL.lvl||(p.easy?'easy':'medium'),res:[],lay:''});
  if(p.easy&&!bdStart.picked) BDL.lvl='easy';
  Object.assign(BF,{res:[],state:'ready',pitch:null,fly:null,swung:false,wait:0,d:null,lay:''});
  $('#bfTabs').classList.remove('derby'); $('#bfStage').classList.remove('derby'); $('#hrBar').classList.add('hidden');
  $('#bfTabs').classList.add('duo');
  $$('#bfTabs [data-mode]').forEach(t=>t.classList.remove('on')); $('#bfTabs [data-duo]').classList.add('on');
  $$('#bfTabs [data-lvl]').forEach(t=>{t.classList.toggle('on',t.dataset.lvl===BDL.lvl);t.querySelector('i').textContent={easy:'🐣',medium:'⭐',hard:'🔥'}[t.dataset.lvl];});
  $('#bfTitle').textContent='👯 Batting Duel'; $('#bfKit').classList.add('hidden'); $('#bfMsg').classList.remove('on');
  $('#bdPitcher').classList.remove('hidden');
  bdTurn(); SFX.whistle();
}
// a new pitch: the batter's buddy at the plate, the pitcher's on the mound, the pitch buttons
function bdTurn(){
  const b=bdBatter(), q=bdPitcherPl();
  $('#bfMascot').innerHTML=mascotSVG(b.look)+bfBatSVG();
  $('#bdPitcher').innerHTML=mascotSVG(q.look);
  $('#bdBar').innerHTML=`<span class="bd-who" style="--tc:${q.color}">${esc(q.badge)} ${esc(q.name)}:</span>`
    +bdChoices(BDL.lvl).map(k=>{const c=BD_PITCHES[k];return `<button class="btn bd-pitch" data-pitch="${k}" aria-label="${c.name} pitch">${c.icon} <span class="tn">${c.name}</span></button>`;}).join('');
  $('#bdBar').classList.remove('hidden');
  bdScore();
}
function bdScore(){
  const pl=BDL.pl; if(!pl) return; const half=TG_SHOTS/2;
  $('#bfScore').innerHTML=pl.map((x,i)=>{const mine=BDL.res.filter(r=>r.by===i);
    return `<span class="tg-row" style="--tc:${x.color}"><b>${esc(x.badge)}</b>`+Array.from({length:half},(_,j)=>{const r=mine[j];
      return `<span class="dot ${r&&!r.res?'miss':''} ${BF.state!=='done'&&j===mine.length&&BDL.res.length%2===i?'now':''}">${r?(r.res==='homer'?'⭐':r.res?'⚾':'✖'):''}</span>`;}).join('')+`</span>`;}).join('');
  const b=bdBatter(), q=bdPitcherPl();
  $('#bfTip').textContent=BF.state==='done'?'Tap 👯 Duel to play again!'
    :BF.state==='ready'?`🫳 ${q.name}: pick a pitch! Then ⚾ ${b.name} taps to swing`:`⚾ ${b.name}: tap to swing when the ball reaches you!`;
}
// the pitcher picks a pitch: it's thrown at once
$('#bdBar').addEventListener('click',e=>{
  const t=e.target.closest('[data-pitch]'); if(!t||!BDL.on||BF.state!=='ready') return;
  const c=BD_PITCHES[t.dataset.pitch]; SFX.click();
  BF.pitch={T:c.T[BDL.lvl],kind:c.kind,x:c.x}; BF.state='wind'; BF.t=0; BF.swung=false; BF.d=null;
  $('#bdBar').classList.add('hidden');
  const m=$('#bdPitcher'); m.classList.remove('throw'); void m.offsetWidth; m.classList.add('throw');
  bdScore();
});
function bdNeedPick(){bfSay(`🫳 ${bdPitcherPl().name}: pick a pitch first!`);}
// called by bfResult while the duel is on: no coins, no stats, no bests
function bdResult(res){
  const hit=res==='homer'||res==='hit';
  BDL.res.push({by:BDL.res.length%2,res:hit?res:false}); BF.state='result'; BF.wait=BF.time+1.4;
  const b=bdBatter();
  if(hit){bfSay(res==='homer'?`HOME RUN, ${b.name}! ⭐`:`${b.name} hits it! ⚾`);if(res!=='homer'){SFX.happy();BF.cheer=BF.time;}}
  else if(res==='foul'){SFX.post();bfSay('Foul ball!');}
  else {SFX.save();bfSay(BF.swung?`Strike! Nice pitch, ${bdPitcherPl().name} 🫳`:'It went by! ⚾');}
  bdScore();
}
function bdNext(){ // called by bfNext
  if(BDL.res.length>=TG_SHOTS){bdEnd();return;}
  BF.state='ready'; BF.pitch=null; BF.fly=null;
  bdTurn(); bfSay(`🔄 Switch! ⚾ ${bdBatter().name} bats`);
}
function bdEnd(){
  BF.state='done'; SFX.whistle(); $('#bdBar').classList.add('hidden'); bdScore();
  const pl=BDL.pl, s=[0,1].map(i=>BDL.res.filter(r=>r.by===i&&r.res).length);
  const pay=tgPay(pl,'ball');
  endBox({title:'👯 Batting Duel',body:`<div class="tg-end">${tgScores(pl,s.map(n=>`⚾ ${n}`))}<p>${tgCheer(pl,s[0],s[1])}</p>${pay}</div>`,
    back:{to:'room',on:()=>show('room')},mid:[{text:'⚾ Just me',on:()=>{bdOff();renderBall();}}],go:{text:'🔁 Play again',on:bdStart}}); // section 76
  setTimeout(checkStickers,300);
}
// the level tabs during a duel: a new duel at that speed
function bdLevel(l){BDL.lvl=l;bdStart.picked=true;SFX.click();bdStart();}
// the pitcher's buddy stands on the mound (an SVG over the canvas, moved only when the size changes)
function bdLayout(g,m,ps){
  const h=ps*1.25, w=h*200/270, key=`${Math.round(m.x)},${Math.round(m.gy)},${Math.round(h)}`;
  if(BDL.lay===key) return; BDL.lay=key;
  const el=$('#bdPitcher'); el.style.width=w+'px'; el.style.height=h+'px'; el.style.left=(m.x-w/2)+'px'; el.style.top=(m.gy-h*0.97)+'px';
}
