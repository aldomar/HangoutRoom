'use strict';
/* =========================================================
   75. TURN DECORATIONS (v1.83): ↺ ↻ while decorating (the children's request)
   Tap or drag a decoration in Decorate and it is picked: it glows and #turnBar shows just above it. Each tap turns it
   ROT_STEP (15°), at most ROT_MAX (45°) each way (rotOk, section 6). Saved as an optional rot on the room item
   (missing = 0, so older saves look the same). renderRoom (09) draws every decoration with decoT() and calls turnShow();
   the room's pointerdown (09) sets picked. Shelves don't turn. Saved layouts (32) keep the turn.
   ========================================================= */
// ↻ Turning things (v1.83). A decoration's transform: its spot, then its turn (it.rot degrees, see rotOk in 06). Standing things
// turn around their feet (0,0), so they stay on the floor or a shelf; wall things and rugs turn around the middle of their box.
function decoT(it){
  let t=`translate(${Math.round(it.x)} ${Math.round(it.y)})`; const r=rotOk(it.rot), D=DECOR[it.type]; if(!r||!D) return t;
  if(D.wall||D.flat){const b=String(D.box).split(/[\s,]+/).map(Number); return t+` rotate(${r} ${Math.round(b[0]+b[2]/2)} ${Math.round(b[1]+b[3]/2)})`;}
  return t+` rotate(${r})`;
}
// While decorating, the last thing touched is picked: a soft glow, and the #turnBar (↺ ↻) just above it. Nothing about it is saved.
// Shelves (anything with shelf) don't turn, so what sits on them never floats.
let picked=null;
const turnable=it=>!!(it&&it.placed&&DECOR[it.type]&&!DECOR[it.type].shelf);
function turnShow(){
  const bar=$('#turnBar'); if(!bar) return;
  roomSvg.querySelectorAll('.deco.picked').forEach(e=>e.classList.remove('picked'));
  const p=P(), it=decorating&&picked&&p?curRoom(p).items.find(i=>i.uid===picked):null, g=turnable(it)&&roomSvg.querySelector(`.deco[data-uid="${it.uid}"]`);
  if(!g){bar.classList.add('hidden');return;}
  g.classList.add('picked'); const r=rotOk(it.rot);
  bar.querySelector('[data-turn="-1"]').classList.toggle('off',r<=-ROT_MAX); bar.querySelector('[data-turn="1"]').classList.toggle('off',r>=ROT_MAX);
  bar.classList.remove('hidden');
  const S=bar.parentNode.getBoundingClientRect(), b=g.getBoundingClientRect(), w=bar.offsetWidth, h=bar.offsetHeight;
  let top=b.top-S.top-h-8; if(top<4) top=Math.min(S.height-h-4,b.bottom-S.top+8); // no room above it: just below
  bar.style.left=Math.round(clamp(b.left-S.left+b.width/2-w/2,4,S.width-w-4))+'px'; bar.style.top=Math.round(Math.max(4,top))+'px';
}
$('#turnBar').addEventListener('click',e=>{
  const b=e.target.closest('[data-turn]'), p=P(); if(!b||!p||!decorating) return;
  const it=curRoom(p).items.find(i=>i.uid===picked); if(!turnable(it)) return;
  const r=rotOk(rotOk(it.rot)+ROT_STEP*Number(b.dataset.turn));
  if(r===rotOk(it.rot)){b.animate&&b.animate([{transform:'rotate(0)'},{transform:'rotate(-8deg)'},{transform:'rotate(8deg)'},{transform:'rotate(0)'}],{duration:300});return;} // as far as it goes
  if(r) it.rot=r; else delete it.rot;
  const g=roomSvg.querySelector(`.deco[data-uid="${it.uid}"]`); if(g) g.setAttribute('transform',decoT(it));
  SFX.click(); vibrate(8); saveSoon(); turnShow();
});
addEventListener('resize',()=>{if(decorating) turnShow();});
