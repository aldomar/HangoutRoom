'use strict';
/* =====================================================================
   69. 🎁 Gift codes between iPads (v1.75)
   Each child has their own iPad, so a gift can travel as a short code that a person reads out and the other types in,
   like a phone number. The app never sends it anywhere: no Copy or Share button, no network (the smoke test checks).
   - 📮 Every room has a mailbox number (4 characters, the last one a check letter), made from the room's id: gcMailbox(p).
   - Sending: 🎁 Give → coins or a decoration → 📮 Another iPad → their mailbox number → the code. The coins or the decoration
     leave straight away (no ↩ Undo: once seen, the code may already be typed). 3 codes a day (GC_DAILY, dailyPay).
     📮 Sent keeps the last 20 codes so a lost one can be read again.
   - Receiving: 🎁 Give → 📥 Type a gift code. A good code for this mailbox, not opened before, goes into the gift pile (p.gifts)
     and opens with confetti as usual. A decoration this copy doesn't know says "Update first" (and still works after updating).
   - The code: 12 characters from GC_ABC (no 0/O, no 1/I), shown as XXXX-XXXX-XXXX. 50 bits = gift id (12), version (2),
     what (16: 0-2 = 5/10/20 coins, else a fingerprint of the DECOR key), mailbox (20); chained so codes look random,
     then 2 check characters (a sum mod 1021) that catch any one wrong character or two swapped neighbors.
   Saved per room: giftCodes{sent[], opened[], made{day, n}}.
   ===================================================================== */
const GC_ABC='23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const GC_DAILY=3, GC_SENT_MAX=20, GC_OPENED_MAX=300, GC_VER=1;
const GC_KEY=[19,7,28,3,22,11,30,5,14,25]; // scrambles the 10 data characters (not a secret, just so codes look random)
function gcHash(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h;}
const gcSendable=k=>!!DECOR[k]&&!DECOR[k].art&&!DECOR[k].award;
const gcWhatOf=k=>3+(gcHash('decor:'+k)%65533); // a decoration's fingerprint (3-65535)
function gcKeyOf(w){return Object.keys(DECOR).find(k=>gcSendable(k)&&gcWhatOf(k)===w)||null;}
// 📮 The mailbox number: 3 characters from the room's id, then a check letter.
function gcMailbox(p){
  const h=gcHash('mb:'+p.id), v=[(h>>>10)&31,(h>>>5)&31,h&31]; v.push((v[0]+3*v[1]+5*v[2])%32);
  return v.map(x=>GC_ABC[x]).join('');
}
const gcClean=s=>String(s||'').toUpperCase().replace(/[^0-9A-Z]/g,'');
function gcMailboxOk(m){const v=[...m].map(c=>GC_ABC.indexOf(c));return m.length===4&&v.every(x=>x>=0)&&(v[0]+3*v[1]+5*v[2])%32===v[3];}
const gcMbBits=m=>[...m].reduce((a,c)=>a*32+GC_ABC.indexOf(c),0);
const gcMbText=b=>[15,10,5,0].map(s=>GC_ABC[Math.floor(b/Math.pow(2,s))%32]).join('');
// Fields -> bits -> 10 data characters (chained) -> + 2 check characters.
function gcPut(bits,v,n){for(let i=n-1;i>=0;i--)bits.push(Math.floor(v/Math.pow(2,i))%2);}
function gcTake(bits,at,n){let v=0;for(let i=0;i<n;i++)v=v*2+bits[at+i];return v;}
function gcCheck(s){let c=0;for(let i=0;i<10;i++)c+=(i+1)*s[i];c%=1021;return [Math.floor(c/32),c%32];}
function gcMake(what,mb,gid){
  const bits=[]; gcPut(bits,gid,12); gcPut(bits,GC_VER,2); gcPut(bits,what,16); gcPut(bits,gcMbBits(mb),20);
  const s=[]; for(let i=0;i<10;i++) s.push((gcTake(bits,i*5,5)+(i?s[i-1]:0)+GC_KEY[i])%32);
  const all=s.concat(gcCheck(s)).map(x=>GC_ABC[x]).join('');
  return all.slice(0,4)+'-'+all.slice(4,8)+'-'+all.slice(8);
}
// A typed code -> {gid, ver, what, mb} or {bad:'letters'|'length'|'typo'}.
function gcRead(text){
  const c=gcClean(text);
  if(/[01OI]/.test(c)) return {bad:'letters'};
  if(c.length!==12) return {bad:'length'};
  const s=[...c].map(ch=>GC_ABC.indexOf(ch)); if(s.some(x=>x<0)) return {bad:'letters'};
  const ck=gcCheck(s); if(ck[0]!==s[10]||ck[1]!==s[11]) return {bad:'typo'};
  const bits=[]; for(let i=0;i<10;i++) gcPut(bits,((s[i]-(i?s[i-1]:0)-GC_KEY[i])%32+64)%32,5);
  return {code:c,gid:gcTake(bits,0,12),ver:gcTake(bits,12,2),what:gcTake(bits,14,16),mb:gcMbText(gcTake(bits,30,20))};
}
const gcWhatText=w=>w<3?`🪙 ${GIFT_COINS[w]} coins`:(k=>k?esc(DECOR[k].name):'?')(gcKeyOf(w));
const gcLeft=p=>dayLeft(p.giftCodes.made,GC_DAILY);

/* ---------- sending ---------- */
// The 📮 Another iPad button in "Who is it for?" (section 32).
const gcWhoBtn=()=>`<button class="btn ghost gc-who" data-gc="1"><span>📮</span>Another iPad</button>`;
function gcAsk(g){
  const p=P(); if(!p) return; SFX.click();
  if(!gcLeft(p)){modal('📮 Another iPad',`<p style="text-align:center">You made ${GC_DAILY} gift codes today. More tomorrow! ✨</p>`,[{text:'OK',cls:'pink'}]);return;}
  modal('📮 Their mailbox number',`<p class="gc-help">Ask them to tap 🎁 Give, then 📥 Type a gift code. Their mailbox number is at the top.</p>`
    +`<input id="gcMb" class="inp gc-inp" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="AB3K">`
    +`<p class="gc-msg" id="gcMsg"></p>`,
    [{text:'⬅ Back',cls:'ghost',keep:1,on:()=>giveTo(g)},{text:'Next ➜',cls:'pink',keep:1,on:()=>gcAskDone(g)}]);
  setTimeout(()=>{const i=$('#gcMb');if(i)i.focus();},60);
}
function gcAskDone(g){
  const p=P(), m=gcClean($('#gcMb').value), msg=$('#gcMsg');
  if(m===gcMailbox(p)){SFX.locked();msg.textContent="That's your own mailbox! Type theirs.";return;}
  if(!gcMailboxOk(m)){SFX.locked();msg.textContent=m.length===4?"That mailbox number doesn't look right. Check each letter.":'A mailbox number has 4 letters and numbers.';return;}
  SFX.click();
  modal(`Make a gift code for ${g.kind==='coins'?`🪙 ${g.n}`:esc(DECOR[g.type].name)}?`,`<div class="gv-ask">${g.kind==='coins'?`🪙 ${g.n}`:`<svg viewBox="${DECOR[g.type].box}">${DECOR[g.type].d()}</svg>`}<span>➜</span>📮 ${m}</div>`
    +`<p class="gc-help">It leaves your room now. Codes can't be taken back.</p>`,
    [{text:'✖ No',cls:'ghost'},{text:'✔ Make it!',cls:'pink',on:()=>gcSend(p,g,m)}]);
}
function gcSend(p,g,m){
  if(!gcLeft(p)) return;
  let what;
  if(g.kind==='coins'){if(p.coins<g.n){needMore(p,g.n);return;}what=GIFT_COINS.indexOf(g.n);if(what<0)return;p.coins-=g.n;}
  else {const it=allItems(p).find(i=>i.uid===g.uid&&giftable(i)); if(!it||!gcSendable(it.type)) return;
    rooms(p).forEach(r=>{r.items=r.items.filter(i=>i!==it);}); what=gcWhatOf(it.type);}
  const code=gcMake(what,m,Math.floor(Math.random()*4096));
  dailyPay(p.giftCodes.made,GC_DAILY,1); p.stats.gifts++;
  p.giftCodes.sent.unshift({code,what,mb:m,at:Date.now()}); p.giftCodes.sent=p.giftCodes.sent.slice(0,GC_SENT_MAX);
  save(); updateCoins(); SFX.buy();
  if(cur==='room'){renderRoom();if(decorating)renderDecoGrid();}
  gcShow(code,what,m,true); checkStickers();
}
// The code, big. No Copy or Share on purpose: it is read out loud.
function gcShow(code,what,m,fresh){
  modal('🎁 Your gift code',`<div class="gc-code" id="gcCode">${code}</div>`
    +`<p class="gc-help">${gcWhatText(what)} for 📮 ${m}.<br>Read it to them. They tap 🎁 Give, then 📥 Type a gift code.</p>`
    +(fresh?`<p class="gc-help">It's kept in 📮 Sent, in case you need it again.</p>`:''),
    [{text:'✔ Done',cls:'pink'}]);
}
function gcSentModal(){
  const p=P(); if(!p) return; SFX.click(); const L=p.giftCodes.sent;
  modal('📮 Sent',L.length?`<div class="gc-list" id="gcList">${L.map((s,i)=>`<button class="btn ghost" data-gs="${i}"><b>${s.code}</b><span>${gcWhatText(s.what)} · 📮 ${s.mb}</span></button>`).join('')}</div>`
    :'<p style="text-align:center">No gift codes yet. Make one with 🎁 Give → 📮 Another iPad.</p>',[{text:'⬅ Back',cls:'ghost',keep:1,on:giveModal}]);
  const l=$('#gcList'); if(l) l.onclick=e=>{const b=e.target.closest('[data-gs]');if(!b)return;const s=L[+b.dataset.gs];gcShow(s.code,s.what,s.mb,false);};
}

/* ---------- receiving ---------- */
function gcTypeModal(){
  const p=P(); if(!p) return; SFX.click();
  modal('📥 Type a gift code',`<div class="gc-mb">📮 Your mailbox: <b>${gcMailbox(p)}</b></div>`
    +`<input id="gcIn" class="inp gc-inp" maxlength="16" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX-XXXX">`
    +`<p class="gc-msg" id="gcMsg"></p>`,
    [{text:'⬅ Back',cls:'ghost',keep:1,on:giveModal},{text:'🎁 Open',cls:'pink',keep:1,on:()=>gcOpen(p,$('#gcIn').value)}]);
  setTimeout(()=>{const i=$('#gcIn');if(i)i.focus();},60);
}
// Returns '' when it opened, or the gentle message shown.
function gcOpen(p,text){
  const r=gcRead(text), msg=$('#gcMsg'), say=t=>{SFX.locked();if(msg)msg.textContent=t;return t;};
  if(r.bad==='letters') return say('Gift codes never have 0, O, 1 or I. Check those letters.');
  if(r.bad==='length') return say('A gift code has 12 letters and numbers.');
  if(r.bad==='typo'||r.ver!==GC_VER&&r.ver<GC_VER) return say("That code doesn't look right. Check each letter.");
  if(r.ver>GC_VER) return say('This code is from a newer app. Ask a grown-up to update this one first.');
  if(r.mb!==gcMailbox(p)) return say(`This code is for mailbox ${r.mb}. Your mailbox is ${gcMailbox(p)}.`);
  if(p.giftCodes.opened.includes(r.code)) return say('You already opened this one! 🎁');
  let g;
  if(r.what<3) g={kind:'coins',n:GIFT_COINS[r.what]};
  else {const k=gcKeyOf(r.what); if(!k) return say('This gift is something new! Ask a grown-up to update the app first, then type it again.'); g={kind:'decor',type:k};}
  p.giftCodes.opened.push(r.code); p.giftCodes.opened=p.giftCodes.opened.slice(-GC_OPENED_MAX);
  p.gifts.push(Object.assign({id:uid(),from:'another iPad',badge:'📮',at:Date.now()},g)); save(); closeModal();
  if(cur==='room') {renderRoom();giftOpen();} else {SFX.happy();toast('🎁 Your gift is waiting in your room!');}
  return '';
}

// The two buttons at the top of 🎁 Give (section 32).
const gcTop=()=>`<div class="gc-top"><button class="btn ghost" id="gcTypeBtn">📥 Type a gift code</button><button class="btn ghost" id="gcSentBtn">📮 Sent</button></div>`;
function gcWire(){const a=$('#gcTypeBtn'),b=$('#gcSentBtn');if(a)a.onclick=gcTypeModal;if(b)b.onclick=gcSentModal;}
