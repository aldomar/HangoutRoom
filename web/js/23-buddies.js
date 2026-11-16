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
