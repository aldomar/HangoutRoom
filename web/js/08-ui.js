'use strict';
/* =========================================================
   8. UI BASICS: toast, modal, coins
   ========================================================= */
let lastX=innerWidth/2,lastY=innerHeight/2;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2800);}
function floatText(txt,x,y){const d=document.createElement('div');d.className='float';d.textContent=txt;d.style.left=(x==null?lastX:x)+'px';d.style.top=(y==null?lastY:y)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),1200);}
function modal(title,body,buttons){
  $('#modalTitle').innerHTML=title; $('#modalBody').innerHTML=body;
  const bc=$('#modalBtns'); bc.innerHTML='';
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
  buyAsk(p,'Get',name,price,()=>{p.coins-=price;p.owned.push(key);save();updateCoins();SFX.buy();toast(`Yay! You got ${name}! ✨`);done();});
}
function buyConsumable(price,name,done){
  const p=P();
  if(p.coins<price){needMore(p,price);return;}
  buyAsk(p,'Buy',name,price,()=>{p.coins-=price;save();updateCoins();SFX.buy();done();});
}
function needMore(p,price){SFX.locked();toast(p.easy?`🔒 Need ${price-p.coins} more 🪙`:`You need ${price-p.coins} more 🪙 — play on the Fidget Shelf to earn some!`);}
function buyAsk(p,verb,name,price,yes){
  if(p.easy) modal(`${esc(name)}?`,`<div style="font-size:24px;text-align:center">🪙 ${price}</div>`,[{text:'✖ No',cls:'ghost'},{text:'✔ Yes!',cls:'pink',on:yes}]);
  else modal(`${verb} ${esc(name)}?`,`It costs 🪙 ${price}. You have 🪙 ${p.coins}.`,[{text:'Not now',cls:'ghost'},{text:verb==='Get'?'Yes, get it!':'Buy it!',cls:'pink',on:yes}]);
}
// Easy mode shops: things she owns (or that are free) first, then cheapest first; ones she can't afford yet are dimmed.
// list = [key, item] entries; cost(entry) = 0 if owned/free, else the price.
function easySort(list,cost){const p=P();if(!p||!p.easy)return list;
  return list.map((e,i)=>[e,i]).sort((a,b)=>cost(a[0])-cost(b[0])||a[1]-b[1]).map(x=>x[0]);}
const poorCls=(p,own,price)=>!own&&p.easy&&p.coins<price?' poor':'';
const priceTag=(p,price)=>`<div class="tp">${p.easy&&p.coins<price?'🔒 ':''}🪙 ${price}</div>`;
