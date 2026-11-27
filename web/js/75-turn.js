'use strict';
/* =========================================================
   75. TURN DECORATIONS (v1.83): ↺ ↻ while decorating (the children's request); ◀ ▶ face left/right (v1.84, decoIn)
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
// ◀ ▶ Facing (v1.84): a standing decoration can face left or right (it.yaw -1/1, yawOk in 06). Nothing new is drawn: the
// same drawing is squashed across and leans a little (a 3D turn around its feet), with a darker edge on the side it turned
// away from (the #depthL/#depthR filters: a darker copy of itself, offset 4 times). The filters are static; an animated drawing
// (an an-* class) turns without the edge, so no filter is redrawn while the room's idle animations run.
const YAW_SQUASH=0.86, YAW_LEAN=0.1;
const faceable=it=>turnable(it)&&!DECOR[it.type].wall&&!DECOR[it.type].flat;
function decoIn(it,svg){
  const y=yawOk(it.yaw), D=DECOR[it.type]; if(!y||!D||D.wall||D.flat||D.shelf) return svg;
  const edge=/class="[^"]*\ban-/.test(svg)?'':` filter="url(#depth${y<0?'L':'R'})"`;
  return `<g transform="matrix(${YAW_SQUASH} ${-y*YAW_LEAN} 0 1 0 0)"${edge}>${svg}</g>`;
}
// its side: a darker copy of the drawing in its own colors, stacked 4 times 2 px apart (solid, like thickness), under it
// (dx: which side the edge shows on)
const yawFilter=(id,dx)=>`<filter id="${id}" x="-15%" y="-10%" width="130%" height="120%" color-interpolation-filters="sRGB">`
  +`<feColorMatrix in="SourceGraphic" type="matrix" values="0.55 0 0 0 0 0 0.5 0 0 0 0 0 0.62 0 0.03 0 0 0 1 0" result="s"/>`
  +[1,2,3,4].map(k=>`<feOffset in="s" dx="${dx*2*k}" dy="${-0.5*k}" result="o${k}"/>`).join('')
  +`<feMerge><feMergeNode in="o4"/><feMergeNode in="o3"/><feMergeNode in="o2"/><feMergeNode in="o1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
EXTRA_DEFS.push(yawFilter('depthL',1)+yawFilter('depthR',-1));
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
  const f=faceable(it), y=yawOk(it.yaw); bar.querySelectorAll('[data-face]').forEach(x=>{x.classList.toggle('gone',!f);x.classList.toggle('off',Number(x.dataset.face)===y);});
  bar.classList.remove('hidden');
  const S=bar.parentNode.getBoundingClientRect(), b=g.getBoundingClientRect(), w=bar.offsetWidth, h=bar.offsetHeight;
  let top=b.top-S.top-h-8; if(top<4) top=Math.min(S.height-h-4,b.bottom-S.top+8); // no room above it: just below
  bar.style.left=Math.round(clamp(b.left-S.left+b.width/2-w/2,4,S.width-w-4))+'px'; bar.style.top=Math.round(Math.max(4,top))+'px';
}
$('#turnBar').addEventListener('click',e=>{
  const b=e.target.closest('[data-turn],[data-face]'), p=P(); if(!b||!p||!decorating) return;
  const it=curRoom(p).items.find(i=>i.uid===picked); if(!turnable(it)) return;
  if(b.dataset.face){ // ◀ ▶ left → front → right
    const y=yawOk(it.yaw), n=Math.max(-1,Math.min(1,y+Number(b.dataset.face)));
    if(!faceable(it)||n===y){wiggle(b);return;}
    if(n) it.yaw=n; else delete it.yaw;
    SFX.click(); vibrate(8); saveSoon(); renderRoom(); return; // renderRoom calls turnShow
  }
  const r=rotOk(rotOk(it.rot)+ROT_STEP*Number(b.dataset.turn));
  if(r===rotOk(it.rot)){wiggle(b);return;} // as far as it goes
  if(r) it.rot=r; else delete it.rot;
  const g=roomSvg.querySelector(`.deco[data-uid="${it.uid}"]`); if(g) g.setAttribute('transform',decoT(it));
  SFX.click(); vibrate(8); saveSoon(); turnShow();
});
function wiggle(b){if(b.animate)b.animate([{transform:'rotate(0)'},{transform:'rotate(-8deg)'},{transform:'rotate(8deg)'},{transform:'rotate(0)'}],{duration:300});}
addEventListener('resize',()=>{if(decorating) turnShow();});
