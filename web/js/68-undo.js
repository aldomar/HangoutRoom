'use strict';
/* =====================================================================
   68. ↩ Undo after buying or giving (v1.74)
   After a purchase (tryBuy, buyConsumable: section 8) or a gift (sendGift: section 32) a big ↩ Undo button shows for 10 s.
   Undo puts the room back exactly as it was just before: coins, owned things, what was worn, applied or placed (a copy of the
   whole profile taken just before, undoArm). It only lasts while she stays on the same screen (show() calls undoLeave), so nothing
   done elsewhere can be lost. A gift can be taken back only while it is still unopened in the other room's gifts[].
   Nothing new is saved.
   ===================================================================== */
const UNDO_MS=10000;
const UNDO={u:null,t:0};
// Just before a purchase or gift changes anything: a copy of the room (profile) and where she is.
function undoArm(){
  const p=P(); if(!p) return null;
  return {pid:p.id,snap:JSON.stringify(p),scr:cur,card:cur==='cards'&&typeof CARD!=='undefined'?{stage:CARD.stage,frame:CARD.frame}:null};
}
// Just after: show the ↩ button. back() (optional) undoes anything outside this room (a gift in another room); false = too late.
function undoShow(u,back){
  if(!u) return; u.back=back||null; UNDO.u=u;
  const b=$('#undoBar'); b.classList.remove('on'); void b.offsetWidth; b.classList.add('on'); // restarts the shrinking bar
  clearTimeout(UNDO.t); UNDO.t=setTimeout(undoOff,UNDO_MS);
}
function undoOff(){UNDO.u=null;clearTimeout(UNDO.t);$('#undoBar').classList.remove('on');}
function undoLeave(n){if(UNDO.u&&n!==UNDO.u.scr)undoOff();} // show(): another screen ends it
function undoDo(){
  const u=UNDO.u; undoOff(); const p=P();
  if(!u||!p||p.id!==u.pid||cur!==u.scr) return;
  if(u.back&&!u.back()){SFX.locked();toast('They already opened it! 🎁');return;}
  const q=JSON.parse(u.snap); Object.keys(p).forEach(k=>delete p[k]); Object.assign(p,q);
  save(); updateCoins(); SFX.whoosh(); toast(p.easy?'↩ 🪙 ✔':'↩ Undone! Your coins are back.');
  closeModal();
  if(u.card){Object.assign(CARD,u.card);renderMaker();}
  else if(cur==='room'){renderRoom();if(decorating)renderDecoGrid();}
  else show(cur);
}
$('#undoBtn').onclick=undoDo;
