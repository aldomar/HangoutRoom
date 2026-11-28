'use strict';
/* =========================================================
   8. UI BASICS: toast, modal, coins
   ========================================================= */
let lastX=innerWidth/2,lastY=innerHeight/2;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2800);}
function floatText(txt,x,y){const d=document.createElement('div');d.className='float';d.textContent=txt;d.style.left=(x==null?lastX:x)+'px';d.style.top=(y==null?lastY:y)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),1200);}
function modal(title,body,buttons){
  $('#modalTitle').innerHTML=title; $('#modalBody').innerHTML=body;
  const bc=$('#modalBtns'); bc.innerHTML=''; bc.classList.remove('nav-wait'); // an end box's short wait (section 76) is only for its own buttons
  buttons.forEach(b=>{const el=document.createElement('button');el.className='btn '+(b.cls||'');el.textContent=b.text;el.onclick=()=>{if(!b.keep)closeModal();if(b.on)b.on();};bc.appendChild(el);});
  $('#modal').classList.remove('hidden');
}
function closeModal(){$('#modal').classList.add('hidden');}
function updateCoins(){const p=P();if(!p)return;$$('.coinsDisp').forEach(e=>e.textContent='🪙 '+p.coins);}
function earn(n,label,x,y){const p=P();if(!p)return;p.coins+=n;save();updateCoins();SFX.coin();floatText(`+${n} 🪙${label?' '+label:''}`,x,y);}
function tryBuy(key,price,name,done){
  const p=P();
  if(!price||p.owned.includes(key)){done();return;}
  if(p.coins<price){needMore(p,price);return;}
  // ↩ Undo (section 68, v1.74): a copy of the room just before, and the button just after
  buyAsk(p,'Get',name,price,()=>{const u=undoArm();p.coins-=price;p.owned.push(key);save();updateCoins();SFX.buy();toast(`Yay! You got ${name}! ✨`);done();undoShow(u);});
}
function buyConsumable(price,name,done){
  const p=P();
  if(!price){SFX.buy();done();return;} // free things (the Built-in Shelf, v1.40) need no question
  if(p.coins<price){needMore(p,price);return;}
  buyAsk(p,'Buy',name,price,()=>{const u=undoArm();p.coins-=price;save();updateCoins();SFX.buy();done();undoShow(u);});
}
function needMore(p,price){SFX.locked();toast(p.easy?`🔒 Need ${price-p.coins} more 🪙`:`You need ${price-p.coins} more 🪙. Try ${payTips(p).words}!`);}
// Daily coin allowances (v1.67): the games that pay for every goal, save, hit, catch, star or maze replay each have their own,
// so every day it pays to go around the app. Firsts (a new prize level, new stars, a new maze) pay with plain earn(), outside it.
// pay(p) is that game's saved {day, n}; the day comes from fpDay() (section 44), so the smoke test can set FP_TEST_DAY.
// Brain Games Free Play (+2, section 44) has no allowance on purpose.
const GAME_PAY={
  soccer:{name:'⚽ Soccer',cap:20,pay:p=>p.soccer.pay},
  keep:{name:'🧤 Keeper',cap:20,pay:p=>p.soccer.keep.pay},
  bat:{name:'⚾ Batting',cap:20,pay:p=>p.ball.bat.pay},
  catch:{name:'🧤 Catch',cap:20,pay:p=>p.ball.catch.pay},
  stage:{name:'🎤 Stage',cap:20,pay:p=>p.stage.pay},
  maze:{name:'🔮 Marble Maze',cap:10,pay:p=>p.maze.pay}
};
function dayLeft(o,cap){const d=fpDay();if(o.day!==d){o.day=d;o.n=0;}return Math.max(0,cap-o.n);} // o = {day, n}
const gameLeft=(p,k)=>dayLeft(GAME_PAY[k].pay(p),GAME_PAY[k].cap);
// How much of n may be paid (or counted) today against cap, and counts it (v1.73). o = a saved {day, n}; a new day starts it at 0.
// Every daily allowance goes through this: n is coins for some (fidgets, I Spy, Runway, Two-player) and things for others (drawings, loops…).
function dailyPay(o,cap,n){const g=Math.max(0,Math.min(n,dayLeft(o,cap)));o.n+=g;return g;}
// Somewhere that still pays today (not game k): one game with coins left (or the Fidget Shelf), and always 🧠 Brain Games.
function payTips(p,k){
  const open=Object.keys(GAME_PAY).filter(g=>g!==k&&gameLeft(p,g)>0).map(g=>GAME_PAY[g].name);
  if(dayLeft(p.fidPay,FID_DAILY)>0) open.push('🫧 Fidget Shelf'); // section 10
  const pick=open.length?[open[Math.floor(Math.random()*open.length)]]:[];
  const all=pick.concat('🧠 Brain Games');
  return {words:all.join(' or '),icons:all.map(n=>n.split(' ')[0]).join(' ')};
}
const gameTold=new Set(); // the allowance notes already shown (room:game:day), once a day each
// How much of n coins game k may pay now (0 when today's allowance is used up); counts it as paid.
function gameTake(k,n){
  const p=P(), G=GAME_PAY[k]; if(!p||!G||!(n>0)) return 0;
  const o=G.pay(p), give=dailyPay(o,G.cap,n);
  const t=p.id+':'+k+':'+o.day;
  if(o.n>=G.cap&&!gameTold.has(t)){gameTold.add(t);const tip=payTips(p,k);
    setTimeout(()=>toast(p.easy?`🪙 ✔ ${tip.icons}`:`${G.name} coins are full for today! Try ${tip.words} ✨`),give?1300:0);}
  return give;
}
// Pays up to n coins from game k's allowance (saves either way); returns the coins paid.
function gameEarn(k,n,label,x,y){const give=gameTake(k,n);if(give)earn(give,label,x,y);else save();return give;}
function buyAsk(p,verb,name,price,yes){
  if(p.easy) modal(`${esc(name)}?`,`<div style="font-size:24px;text-align:center">🪙 ${price}</div>`,[{text:'✖ No',cls:'ghost'},{text:'✔ Yes!',cls:'pink',on:yes}]);
  else modal(`${verb} ${esc(name)}?`,`It costs 🪙 ${price}. You have 🪙 ${p.coins}.`,[{text:'Not now',cls:'ghost'},{text:verb==='Get'?'Yes, get it!':'Buy it!',cls:'pink',on:yes}]);
}
// Easy mode shops: things she owns (or that are free) first, then cheapest first; ones she can't afford yet are dimmed.
// list = [key, item] entries; cost(entry) = 0 if owned/free, else the price.
function easySort(list,cost){const p=P();if(!p||!p.easy)return list;
  return list.map((e,i)=>[e,i]).sort((a,b)=>cost(a[0])-cost(b[0])||a[1]-b[1]).map(x=>x[0]);}
const poorCls=(p,own,price)=>!own&&p.easy&&p.coins<price?' poor':'';
const priceTag=(p,price)=>!price?`<div class="tp">Free</div>`:`<div class="tp">${p.easy&&p.coins<price?'🔒 ':''}🪙 ${price}</div>`;
