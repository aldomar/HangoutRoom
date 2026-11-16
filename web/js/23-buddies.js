'use strict';
/* =========================================================
   23. BUDDIES (v1.20): starter looks for a new room, and room colours that tint the app
   The buddies themselves (BUDDIES, FACES and the new clothes) are in section 3, because mascotSVG draws them.
   ========================================================= */

// Starter looks, shown as pictures (no words) when a room is made. Only used at that moment, so these ids are not
// saved. Priced things in a starter are given to the new room for free. Everything can be changed later in the Closet.
const STARTERS={
  emo:{fur:'white',look:{}}, // the classic look (DEFAULT_LOOK)
  sporty:{fur:'sky',look:{face:'bright',hair:'buzz',hairColor:'brown',top:'stripeTee',bottom:'cargo',legs:'none',arms:'none',shoes:'hightops',acc:'capBack'}},
  dino:{fur:'mint',look:{kind:'dino',face:'cheeky',hair:'none',top:'hoodie',bottom:'cargo',legs:'none',arms:'none',shoes:'hightops',acc:'none'}},
  bear:{fur:'cocoa',look:{kind:'bear',face:'bright',hair:'tuft',top:'stripeTee',bottom:'jeans',legs:'none',arms:'none',shoes:'sneakers',acc:'headphones'}},
  fox:{fur:'ginger',look:{kind:'fox',face:'sparkle',hair:'bob',hairColor:'brown',top:'cardi',bottom:'plaidP',legs:'whiteFuzz',arms:'none',shoes:'maryjanes',acc:'bow'}},
  puppy:{fur:'stone',look:{kind:'puppy',face:'bright',hair:'messy',hairColor:'black',top:'jersey',bottom:'shorts',legs:'soccer',arms:'none',shoes:'cleats',acc:'none'}}
};
function starterLook(id,fur){const s=STARTERS[id]||STARTERS.emo;return Object.assign({},DEFAULT_LOOK,s.look,{fur:fur||s.fur});}
// The starter pictures for the New Room box (in the fur picked, if one was picked).
function starterRow(sel,fur){
  return Object.keys(STARTERS).map(k=>`<button data-start="${k}" class="${k===sel?'on':''}" aria-label="${(BUDDIES[STARTERS[k].look.kind||'bunny']||BUDDIES.bunny).name}">${mascotSVG(starterLook(k,fur),'0 0 200 270')}</button>`).join('');
}
// A new room gets the priced things its starter look wears (clothes and fur), free.
function giveStarter(p){
  for(const cat of Object.keys(CLOSET)){const it=itemOf(cat,p.look[cat]);if(it.price&&!p.owned.includes(cat+':'+it.id))p.owned.push(cat+':'+it.id);}
  const hc=HAIR_COLORS[p.look.hairColor];if(hc&&hc.price&&!p.owned.includes('hairc:'+p.look.hairColor))p.owned.push('hairc:'+p.look.hairColor);
}
// The profile screen shows a few buddies together.
function profHeroSVG(){return ['fox','emo','dino'].map(k=>mascotSVG(starterLook(k))).join('');}

// Room colour tints (v1.20): when p.tint is on, the room's colour (ROOM_COLORS id) replaces the pink and purple of the
// buttons, tabs and bars, and the dark panels take a hint of it. Pink and purple rooms keep the classic look.
// a = main colour (pink before), ad = its shadow, ai = text on it, b = second colour (purple before), bd = its shadow, hi = a highlighted tile.
const TINTS={
  mint:{a:'#8ff0d0',ad:'#3fae8c',ai:'#123a2e',b:'#2f9c7c',bd:'#1d6b54',bg:'#16262a',panel:'#1f3438',panel2:'#284247',line:'#355a5e',hi:'#2f5458'},
  gold:{a:'#ffd166',ad:'#c8962a',ai:'#3a2a08',b:'#d98a1f',bd:'#9a5e0c',bg:'#2a2216',panel:'#382d1d',panel2:'#463825',line:'#5c4a2f',hi:'#5a4830'},
  sky:{a:'#7fc8ff',ad:'#3d8ccf',ai:'#0f2a44',b:'#3d7fd6',bd:'#24589e',bg:'#18202e',panel:'#212c40',panel2:'#2b3851',line:'#3a4b6b',hi:'#36476a'},
  peach:{a:'#ffab7a',ad:'#d0703e',ai:'#3e1c0a',b:'#e0703f',bd:'#a44b22',bg:'#2a1c1c',panel:'#3a2626',panel2:'#4a3030',line:'#634040',hi:'#5e3c3c'},
  green:{a:'#7ee08a',ad:'#3d9e4a',ai:'#0f3316',b:'#3f9e4d',bd:'#256b30',bg:'#18261b',panel:'#213425',panel2:'#2a4230',line:'#38573e',hi:'#36553d'},
  blue:{a:'#8fa8ff',ad:'#4a62c8',ai:'#10183e',b:'#4f6ae0',bd:'#3247a6',bg:'#181c33',panel:'#212746',panel2:'#2b3257',line:'#3a4373',hi:'#37406f'}
};
const TINT_VARS={a:'--pink',ad:'--pink-dk',ai:'--pink-ink',b:'--purple',bd:'--purple-dk',bg:'--bg',panel:'--panel',panel2:'--panel2',line:'--line',hi:'--hi'};
function roomTint(p){return p&&p.tint?TINTS[p.color]||null:null;}
// Called by applyEasy() every time a screen opens.
function applyTint(){
  const t=roomTint(cur==='profiles'?null:P()), b=document.body;
  b.classList.toggle('tint',!!t);
  for(const [k,v] of Object.entries(TINT_VARS)){if(t)b.style.setProperty(v,t[k]);else b.style.removeProperty(v);}
}

// Furniture colours (v1.20): the built-in furniture of both rooms can be recoloured, free, in Decorate's 🎨 Colours
// tab. Saved per room-profile in p.furn {piece: colour id}; a missing or unknown id = the classic colours (as before
// v1.20). Piece ids and colour ids are saved: never rename them. b = bright, l = light, m = middle, d = dark.
const FURN_COLORS={
  pink:{name:'Pink',b:'#ff8cc6',l:'#ffc2df',m:'#e48fbf',d:'#c8578f'},
  purple:{name:'Purple',b:'#a97cff',l:'#c9b3ff',m:'#8d68dc',d:'#4e3191'},
  mint:{name:'Mint',b:'#8ff0d0',l:'#c8f7e8',m:'#6fd3b2',d:'#3a9c7e'},
  lemon:{name:'Lemon',b:'#ffd166',l:'#ffeaa8',m:'#f0bd45',d:'#b8862a'},
  sky:{name:'Sky',b:'#7fc8ff',l:'#c6e6ff',m:'#64aee8',d:'#3a7cba'},
  peach:{name:'Peach',b:'#ffab7a',l:'#ffd3b8',m:'#f08f5c',d:'#bf6332'},
  green:{name:'Green',b:'#7ee08a',l:'#c4f2c8',m:'#62c470',d:'#3a8c48'},
  blue:{name:'Blue',b:'#8fa8ff',l:'#c8d3ff',m:'#6f88e8',d:'#3e55b0'},
  white:{name:'White',b:'#f4f0fa',l:'#ffffff',m:'#ddd5e8',d:'#9f93b5'},
  wood:{name:'Wood',b:'#c08a58',l:'#d9a46c',m:'#a87444',d:'#6e4526'}
};
// orig = the classic colours; map = the colours drawn from a FURN_COLORS entry.
const FURN_PIECES={
  desk:{room:1,icon:'🎨',name:'Art Desk',orig:{top:'#ffb3d9',legs:'#e48fbf'},map:c=>({top:c.l,legs:c.m})},
  closet:{room:1,icon:'👗',name:'Wardrobe',orig:{body:'#6b46b8',door:'#7d58cc',dark:'#3e2670'},map:c=>({body:c.m,door:c.l,dark:c.d})},
  shelf:{room:1,icon:'🫧',name:'Shelf',orig:{board:'#ff8cc6',bracket:'#c8578f'},map:c=>({board:c.b,bracket:c.d})},
  curtain:{room:1,icon:'🪟',name:'Curtains',orig:{fill:'#a97cff',line:'#5b4a6b'},map:c=>({fill:c.b,line:c.d})},
  desk2:{room:2,icon:'💻',name:'Computer Desk',orig:{top:'#c9a7ff',legs:'#a283e0',drawer:'#b494f0'},map:c=>({top:c.l,legs:c.m,drawer:c.b})},
  beams:{room:2,icon:'🪵',name:'Roof Beams',orig:{wood:'#9b6a42',dark:'#6e4526'},map:c=>({wood:c.m,dark:c.d})},
  window2:{room:2,icon:'🌙',name:'Round Window',orig:{frame:'#5b3a99'},map:c=>({frame:c.m})},
  lamp:{room:2,icon:'💡',name:'Lamp',orig:{shade:'#ff8cc6'},map:c=>({shade:c.b})}
};
// The colours to draw a piece with, for the room on screen.
function furnC(piece){const p=P(),F=FURN_PIECES[piece],c=FURN_COLORS[p&&p.furn?p.furn[piece]:''];return c?F.map(c):F.orig;}
// Decorate's 🎨 Colours tab: one row of swatches per piece in the room on screen. 'classic' = the colours from before.
function furnGrid(p){
  return Object.entries(FURN_PIECES).filter(([k,F])=>F.room===roomNo).map(([k,F])=>{const now=FURN_COLORS[p.furn[k]]?p.furn[k]:'classic', o=Object.values(F.orig);
    return `<div class="furn-row"><div class="furn-name">${F.icon} ${F.name}</div><div class="furn-sw">`
      +`<button data-furn="${k}" data-fc="classic" class="${now==='classic'?'on':''}" title="Classic" style="background:linear-gradient(135deg,${o[0]} 50%,${o[1]||o[0]} 50%)"></button>`
      +Object.entries(FURN_COLORS).map(([c,v])=>`<button data-furn="${k}" data-fc="${c}" class="${now===c?'on':''}" title="${v.name}" style="background:${v.b}"></button>`).join('')+`</div></div>`;}).join('');
}
$('#decoGrid').addEventListener('click',e=>{
  const b=e.target.closest('[data-furn]'); if(!b) return; const p=P();
  if(b.dataset.fc==='classic') delete p.furn[b.dataset.furn]; else p.furn[b.dataset.furn]=b.dataset.fc;
  save(); SFX.click(); renderRoom(); renderDecoGrid();
});
// Pastel walls to match the new room colours (bought in the Walls tab, or given to a new room of that colour).
Object.assign(WALLS,{
  lemonDots:{name:'Lemon Dots',price:20,fill:'#fff0b8',pat:'pDots'},
  leafDots:{name:'Leafy Green',price:20,fill:'#cdf0c8',pat:'pDots'},
  blueDots:{name:'Blue Dots',price:20,fill:'#c8d4ff',pat:'pDots'}
});
// A new room starts in its colour: a matching wall (given free) and furniture in both rooms (the Loft's beams stay wood).
const ROOM_START={pink:['bubblegum','pink'],purple:['lavender','purple'],mint:['mint','mint'],gold:['lemonDots','lemon'],
  sky:['skyCloud','sky'],peach:['peachStripe','peach'],green:['leafDots','green'],blue:['blueDots','blue']};
function roomStart(p){
  const r=ROOM_START[p.color]; if(!r) return;
  const [wall,fc]=r; p.room.wall=wall; if(WALLS[wall].price&&!p.owned.includes('wall:'+wall)) p.owned.push('wall:'+wall);
  ['desk','closet','shelf','curtain','desk2','window2','lamp'].forEach(k=>p.furn[k]=fc);
}
