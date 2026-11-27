'use strict';
/* =========================================================
   76. 🧭 GETTING AROUND (v1.85): one end box for every round
   Navigation rules 1 and 4 (CLAUDE.md, docs/NAVIGATION.md). Every game round ends on endBox():
   ⬅ + the icon and name of where it goes on the left (gray), extra choices in the middle, and 🔁 Again / ▶ Next / 🎲 on the
   right (pink). Every button starts with an icon, so a child who can't read can tell them apart by picture, color and place.
   The buttons wait NAV_WAIT ms before they take a tap (#modalBtns.nav-wait), so a quick tap left over from the game can't
   press one by accident. NAV_PLACES names every place a ⬅ can go; 'room' is the room on screen (the one the game was
   opened from), so leaving Soccer says ⬅ 🌳 Backyard. v1.86 uses the same places for the top bars' Back buttons.
   A new game ends its rounds with endBox, and its ⬅ goes exactly one step back (to the room, the list, the pet menu…).
   ========================================================= */
const NAV_WAIT=500;
const NAV_PLACES={
  room:()=>{const r=roomInfo(roomNo);return {icon:r.icon,name:r.name};},
  closet:{icon:'👗',name:'Closet'}, pet:{icon:'🐾',name:'Pet'},
  songs:{icon:'🎵',name:'Songs'}, loops:{icon:'🎵',name:'Loops'},
  puzzles:{icon:'🧩',name:'Puzzles'}, levels:{icon:'🛠️',name:'Levels'}, games:{icon:'📚',name:'Games'}
};
function navPlace(k){const v=NAV_PLACES[k]||NAV_PLACES.room;return typeof v==='function'?v():v;}
const navBackText=k=>{const v=navPlace(k);return `⬅ ${v.icon} ${v.name}`;};

// o = {title, body, back:{to, on}, mid:[{text, on}], go:{text, on}}. Every text starts with its icon; go is optional.
function endBox(o){
  const btns=[{text:navBackText(o.back.to),cls:'ghost nav-back',on:o.back.on}]
    .concat((o.mid||[]).map(m=>({text:m.text,cls:'nav-mid',on:m.on})));
  if(o.go) btns.push({text:o.go.text,cls:'pink nav-go',on:o.go.on});
  modal(o.title,o.body,btns);
  const c=$('#modalBtns'); c.classList.add('nav-wait');
  clearTimeout(endBox.t); endBox.t=setTimeout(()=>c.classList.remove('nav-wait'),NAV_WAIT);
}
const endBoxOpen=()=>!$('#modal').classList.contains('hidden')&&!!$('#modalBtns .nav-back');
