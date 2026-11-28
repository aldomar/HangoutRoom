'use strict';
/* =====================================================================
   80. 🍳 KITCHEN FOOD (v1.91): the recipes as data, the food drawings and the dish picture
   KC_RECIPES: the 8 recipe pages, in the suggested order (each builds on the one before, but every page can be played).
     A recipe lists its stations per level: steps{easy, medium, hard}. Pages with soon:1 are drawn but not built yet.
     Recipe ids are saved (p.kitchen.stars, dishes): never rename them. Station ids are only code.
   KC_FOOD: every food, drawn at the origin about 40 across (kcFood(id, x, y, k) places one). kind 'fruit' or 'veg';
     col = its color word (the Medium bowl asks by color). Food ids are saved inside dishes: never rename them.
   KC_TOPS: the toppings for ✨ Decorate (ids saved inside dishes too).
   kcDishG(d): a plated dish {id, r, lv, f[], c[], rim[], at} drawn as a bowl standing on y = 0 (x -80..80): the 🍽️ Dish
     Book, the end box and the room's `dish` decoration all use it, so a dish is a few ids and numbers, never a picture.
   ===================================================================== */
const KC_RECIPES=[
  {id:'fruit',icon:'🥗',name:'Rainbow Fruit Salad',say:'Rainbow Fruit Salad',
    steps:{easy:['wash','peel','bowl','plate'],medium:['wash','peel','chop','bowl','plate'],hard:['wash','peel','chop','bowl','plate']},
    facts:['Bananas grow in big bunches called hands!','Strawberries wear their seeds on the outside.','Kiwis are fuzzy outside and green inside.',
      'Blueberries are blue all the way through their skin.','A rainbow salad has every color: red, orange, yellow, green, blue and purple!',
      'Washing fruit gets rid of dirt you cannot even see.']},
  {id:'pancakes',icon:'🥞',name:'Pancake Stack',soon:1},
  {id:'sandwich',icon:'🥪',name:'Sandwich Shop',soon:1},
  {id:'pizza',icon:'🍕',name:'Pizza Party',soon:1},
  {id:'soup',icon:'🍲',name:'Garden Veggie Soup',soon:1},
  {id:'cookies',icon:'🍪',name:'Cookie Bakery',soon:1},
  {id:'sundae',icon:'🍨',name:'Smoothie & Sundae Bar',soon:1},
  {id:'cake',icon:'🎂',name:'Birthday Cake',soon:1}];
const kcRecipe=id=>KC_RECIPES.find(r=>r.id===id);
const KC_ICON={wash:'🫧',peel:'🍌',chop:'🔪',bowl:'🥣',plate:'✨'}; // the step dots over a recipe

/* ---------- the food ---------- */
const kcL=w=>st('#2b2235',w||2.5);
const KC_FOOD={
  strawberry:{name:'strawberry',many:'strawberries',kind:'fruit',col:'red',d:()=>`<path d="M0 19 C-17 7 -19 -8 -10 -12 C-4 -15 4 -15 10 -12 C19 -8 17 7 0 19Z" fill="#ff4d6d" ${kcL()}/>`
    +[[-6,-3],[5,-4],[0,4],[-4,10],[6,8]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.4" fill="#ffe08a"/>`).join('')
    +`<path d="M-10 -12 L-4 -9 L0 -17 L4 -9 L10 -12 L5 -6 H-5Z" fill="#4caf50" ${kcL(2)}/>`},
  cherry:{name:'cherry',many:'cherries',kind:'fruit',col:'red',d:()=>`<path d="M-6 4 Q-2 -12 4 -18 M8 6 Q8 -8 4 -18" stroke="#3f7a3a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
    +`<circle cx="-7" cy="8" r="9" fill="#e0244b" ${kcL()}/><circle cx="9" cy="10" r="9" fill="#e0244b" ${kcL()}/><circle cx="-10" cy="5" r="2.5" fill="#fff" opacity=".6"/>`},
  orange:{name:'orange slice',many:'orange slices',kind:'fruit',col:'orange',d:()=>`<path d="M-19 7 A19 19 0 0 1 19 7Z" fill="#ff9f1c" ${kcL()}/><path d="M-14 5 A14 14 0 0 1 14 5Z" fill="#ffc46b"/>`
    +[-50,-90,-130].map(a=>`<path d="M0 5 L${(13*Math.cos(a*Math.PI/180)).toFixed(1)} ${(5+13*Math.sin(a*Math.PI/180)).toFixed(1)}" stroke="#fff3d6" stroke-width="2"/>`).join('')},
  mango:{name:'mango cube',many:'mango cubes',kind:'fruit',col:'orange',d:()=>`<rect x="-13" y="-13" width="26" height="26" rx="7" fill="#ff9636" ${kcL()}/><path d="M-7 -7 h8" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/>`},
  banana:{name:'banana slice',many:'banana slices',kind:'fruit',col:'yellow',d:()=>`<circle r="14" fill="#fff3b0" ${kcL()}/><circle r="8" fill="#fbe58a"/>`
    +[0,1,2].map(k=>`<circle cx="${(4*Math.cos(k*2.1)).toFixed(1)}" cy="${(4*Math.sin(k*2.1)).toFixed(1)}" r="1.5" fill="#a8892a"/>`).join('')},
  pineapple:{name:'pineapple chunk',many:'pineapple chunks',kind:'fruit',col:'yellow',d:()=>`<path d="M-15 12 L-10 -13 Q0 -18 10 -13 L15 12 Q0 17 -15 12Z" fill="#ffd23f" ${kcL()}/><path d="M-8 -4 l4 4 l4 -4 l4 4" stroke="#d9a41a" stroke-width="2" fill="none"/>`},
  kiwi:{name:'kiwi slice',many:'kiwi slices',kind:'fruit',col:'green',d:()=>`<circle r="16" fill="#8bc34a" ${kcL()}/><circle r="12" fill="#b5dc63"/><circle r="5" fill="#fffbe0"/>`
    +[0,1,2,3,4,5,6,7].map(k=>`<circle cx="${(8.5*Math.cos(k*0.785)).toFixed(1)}" cy="${(8.5*Math.sin(k*0.785)).toFixed(1)}" r="1.3" fill="#2b2235"/>`).join('')},
  grape:{name:'green grape',many:'green grapes',kind:'fruit',col:'green',d:()=>`<ellipse rx="11" ry="13" fill="#9ad35b" ${kcL()}/><ellipse cx="-4" cy="-5" rx="3" ry="4" fill="#fff" opacity=".55"/>`},
  blueberry:{name:'blueberry',many:'blueberries',kind:'fruit',col:'blue',d:()=>`<circle r="11" fill="#4a5bd4" ${kcL()}/><path d="${starPath(0,-6,4)}" fill="#2a3590"/><circle cx="-4" cy="2" r="2.5" fill="#fff" opacity=".45"/>`},
  plum:{name:'purple grape',many:'purple grapes',kind:'fruit',col:'purple',d:()=>`<ellipse rx="11" ry="13" fill="#9b59c9" ${kcL()}/><ellipse cx="-4" cy="-5" rx="3" ry="4" fill="#fff" opacity=".5"/>`},
  apple:{name:'apple piece',many:'apple pieces',kind:'fruit',col:'red',d:()=>`<path d="M-15 10 L-12 -12 L14 -12 L15 10Z" fill="#fff6d8" ${kcL()}/><path d="M-12 -12 L14 -12 L13 -7 L-12 -7Z" fill="#ff4d6d"/>`},
  pear:{name:'pear piece',many:'pear pieces',kind:'fruit',col:'green',d:()=>`<path d="M-15 10 L-12 -12 L14 -12 L15 10Z" fill="#fbf7d2" ${kcL()}/><path d="M-12 -12 L14 -12 L13 -7 L-12 -7Z" fill="#a8d84a"/>`},
  peach:{name:'peach slice',many:'peach slices',kind:'fruit',col:'orange',d:()=>`<path d="M-16 8 Q0 -26 16 8 Q0 0 -16 8Z" fill="#ffc08a" ${kcL()}/><path d="M-12 4 Q0 -18 12 4" stroke="#ff8f6a" stroke-width="3" fill="none"/>`},
  // vegetables: they never go in a fruit salad (🧠 Hard puts a few on the tray, section 81)
  carrot:{name:'carrot',many:'carrots',kind:'veg',col:'orange',d:()=>`<path d="M-8 -12 L8 -12 L0 20Z" fill="#ff8a2a" ${kcL()}/><path d="M-4 -12 l-5 -9 M0 -12 v-11 M4 -12 l5 -9" stroke="#3f9a4d" stroke-width="3.5" stroke-linecap="round"/>`},
  broccoli:{name:'broccoli',many:'broccoli',kind:'veg',col:'green',d:()=>`<rect x="-4" y="0" width="8" height="18" rx="3" fill="#9ccc65" ${kcL()}/>`
    +[[-9,-2,9],[9,-2,9],[0,-10,11]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#3f9a4d" ${kcL()}/>`).join('')},
  onion:{name:'onion',many:'onions',kind:'veg',col:'purple',d:()=>`<path d="M0 -18 Q4 -8 14 0 Q16 16 0 17 Q-16 16 -14 0 Q-4 -8 0 -18Z" fill="#c48ad8" ${kcL()}/><path d="M-5 -4 Q0 6 -2 14 M5 -4 Q2 6 3 14" stroke="#8e4fa8" stroke-width="2" fill="none"/>`},
  potato:{name:'potato',many:'potatoes',kind:'veg',col:'brown',d:()=>`<ellipse rx="17" ry="12" fill="#d3a46d" ${kcL()}/>`+[[-7,-3],[5,2],[0,-6]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6" fill="#8a6237"/>`).join('')}
};
function kcFood(id,x,y,k,extra){const F=KC_FOOD[id]||KC_FOOD.strawberry;return `<g transform="translate(${x} ${y}) scale(${k||1})"${extra||''}>${F.d()}</g>`;}
const KC_COLS={red:'#ff4d6d',orange:'#ff9f1c',yellow:'#ffd23f',green:'#8bc34a',blue:'#4a5bd4',purple:'#9b59c9',brown:'#d3a46d'};

/* ---------- the whole fruit to wash (drawn about 240 across, centered) ---------- */
const KC_WASH={
  apple:{name:'apple',col:'#ff4d6d',d:(back)=>`<path d="M0 -92 C40 -132 120 -100 112 -10 C106 70 54 112 0 96 C-54 112 -106 70 -112 -10 C-120 -100 -40 -132 0 -92Z" fill="#ff4d6d" ${kcL(6)}/>`
    +`<path d="M-70 -50 Q-80 -10 -66 20" stroke="#fff" stroke-width="12" opacity=".35" fill="none" stroke-linecap="round"/>`
    +(back?'':`<path d="M0 -92 Q4 -120 16 -134" stroke="#7a4a2a" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M8 -112 Q40 -140 62 -112 Q34 -98 8 -112Z" fill="#4caf50" ${kcL(4)}/>`)},
  pear:{name:'pear',col:'#b9e05a',d:(back)=>`<path d="M0 -118 C34 -118 40 -70 46 -40 C100 -10 104 96 0 104 C-104 96 -100 -10 -46 -40 C-40 -70 -34 -118 0 -118Z" fill="#c4e35f" ${kcL(6)}/>`
    +`<path d="M-56 0 Q-66 40 -48 70" stroke="#fff" stroke-width="12" opacity=".35" fill="none" stroke-linecap="round"/>`
    +(back?'':`<path d="M0 -118 Q-2 -138 8 -150" stroke="#7a4a2a" stroke-width="8" fill="none" stroke-linecap="round"/>`)},
  peach:{name:'peach',col:'#ffb38a',d:(back)=>`<circle r="104" fill="#ffb38a" ${kcL(6)}/><path d="M0 -104 Q-30 0 0 104" stroke="#f08a6a" stroke-width="6" fill="none" opacity="${back?0:.8}"/>`
    +`<circle cx="44" cy="-30" r="42" fill="#ff8f8f" opacity=".45"/><path d="M-62 -40 Q-72 0 -58 30" stroke="#fff" stroke-width="12" opacity=".35" fill="none" stroke-linecap="round"/>`
    +(back?'':`<path d="M6 -100 Q40 -140 66 -108 Q36 -94 6 -100Z" fill="#4caf50" ${kcL(4)}/>`)},
  carrot:{name:'carrot',col:'#ff8a2a',veg:1,d:()=>`<path d="M-40 -96 L40 -96 L4 120 Q0 128 -4 120Z" fill="#ff8a2a" ${kcL(6)}/>`
    +`<path d="M-26 -50 h18 M10 -10 h18 M-14 40 h14" stroke="#d9661a" stroke-width="5" stroke-linecap="round"/>`
    +`<path d="M-14 -96 l-24 -40 M0 -96 v-50 M14 -96 l24 -40" stroke="#3f9a4d" stroke-width="12" stroke-linecap="round"/>`},
  potato:{name:'potato',col:'#d3a46d',veg:1,d:()=>`<ellipse rx="118" ry="84" fill="#d3a46d" ${kcL(6)}/>`+[[-40,-20],[30,10],[0,-44],[54,-30],[-60,30]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#8a6237"/>`).join('')}
};
const KC_WASH_FRUIT=['apple','pear','peach'];

/* ---------- toppings for ✨ Decorate ---------- */
const KC_TOPS={
  leaf:{icon:'🌿',name:'leaf',many:'leaves',d:()=>`<path d="M-12 6 Q-10 -12 12 -8 Q10 10 -12 6Z" fill="#4caf50" ${kcL(2)}/><path d="M-10 5 L8 -6" stroke="#2e7d32" stroke-width="1.5"/>`},
  cream:{icon:'🍦',name:'cream',many:'creams',d:()=>`<path d="M-14 8 Q-18 -2 -8 -4 Q-10 -14 0 -14 Q10 -14 8 -4 Q18 -2 14 8Z" fill="#fffaf0" ${kcL(2)}/><path d="M0 -14 q3 -5 0 -8" stroke="#2b2235" stroke-width="2" fill="#fffaf0"/>`},
  star:{icon:'⭐',name:'star',many:'stars',d:()=>`<path d="${starPath(0,0,12)}" fill="#ffd166" ${kcL(2)}/>`},
  heart:{icon:'💗',name:'heart',many:'hearts',d:()=>`<path d="${heartPath(0,0,10)}" fill="#ff8cc6" ${kcL(2)}/>`},
  cherry:{icon:'🍒',name:'cherry',many:'cherries',d:()=>`<path d="M0 -4 Q2 -14 8 -18" stroke="#3f7a3a" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle r="8" fill="#e0244b" ${kcL(2)}/><circle cx="-3" cy="-3" r="2" fill="#fff" opacity=".6"/>`},
  dots:{icon:'✨',name:'sprinkles',many:'sprinkles',d:()=>[[-12,-4,'#ff8cc6',30],[-4,6,'#8ff0d0',-20],[6,-6,'#ffd166',60],[12,4,'#a97cff',10],[0,-12,'#fff',-50],[-8,-14,'#ffd166',80]]
    .map(([x,y,c,a])=>`<rect x="${x-4}" y="${y-1.5}" width="8" height="3" rx="1.5" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join('')}
};
const KC_TOP_IDS=Object.keys(KC_TOPS);
function kcTop(k,x,y,s){const T=KC_TOPS[k]||KC_TOPS.star;return `<g transform="translate(${x} ${y}) scale(${s||1})">${T.d()}</g>`;}

/* ---------- the dish (a bowl standing on y = 0) ---------- */
const KC_RIM_N=8; // spots on the bowl's front rim (the 🧠 Hard pattern)
const kcRimPt=i=>{const a=Math.PI*(0.92-0.84*i/(KC_RIM_N-1));return {x:+(72*Math.cos(a)).toFixed(1),y:+(-70+18*Math.sin(a)).toFixed(1)};};
// where fruit sits in the bowl: a small mound over the rim, the same every time for the same dish (seeded by its id)
function kcPile(id,n){const r=brRand('pile:'+id), out=[];for(let i=0;i<n;i++){const layer=Math.floor(i/9), x=(-58+116*((i*0.618+layer*0.31)%1))*(0.92+0.08*r()), y=-64-(14+12*r())*(1-Math.abs(x)/90)-layer*9;out.push({x:+x.toFixed(1),y:+y.toFixed(1)});}return out;}
function kcBowlBack(){return `<ellipse cx="0" cy="-70" rx="78" ry="20" fill="#e9ddff" ${kcL(4)}/><ellipse cx="0" cy="-68" rx="68" ry="14" fill="#c9b3ff"/>`;}
function kcBowlFront(){return `<path d="M-78 -70 Q-74 -10 -36 -4 L-30 0 H30 L36 -4 Q74 -10 78 -70 Q40 -50 0 -50 Q-40 -50 -78 -70Z" fill="#a97cff" ${kcL(4)}/>`
  +`<path d="M-62 -52 Q-56 -26 -34 -18" stroke="#fff" stroke-width="6" opacity=".35" fill="none" stroke-linecap="round"/>`
  +[-40,0,40].map(x=>`<path d="${heartPath(x,-32,6)}" fill="#ffd1ea"/>`).join('');}
function kcDishG(d){
  d=d&&typeof d==='object'?d:{id:'x',f:['strawberry','banana','kiwi','blueberry','orange','plum'],c:[],rim:[]};
  const f=(Array.isArray(d.f)?d.f:[]).filter(k=>KC_FOOD[k]).slice(0,18), pile=kcPile(d.id||'x',f.length);
  return kcBowlBack()+f.map((k,i)=>kcFood(k,pile[i].x,pile[i].y,0.62)).join('')+kcBowlFront()
    +(Array.isArray(d.rim)?d.rim:[]).map((k,i)=>k&&KC_TOPS[k]?kcTop(k,kcRimPt(i).x,kcRimPt(i).y+14,0.7):'').join('')
    +(Array.isArray(d.c)?d.c:[]).filter(t=>t&&KC_TOPS[t.k]).slice(0,16).map(t=>kcTop(t.k,Math.max(-80,Math.min(80,+t.x||0)),Math.max(-120,Math.min(-40,+t.y||0)),0.8)).join('');
}
// The `dish` decoration: a dish she put in a room (it carries its own drawing: {type:'dish', dish:{…}}). Not in the Shop (dish:1).
DECOR.dish={name:'My Dish',price:0,dish:1,box:'-96 -132 192 140',d:i=>`<ellipse cx="0" cy="0" rx="70" ry="9" fill="#00000024"/>`+kcDishG(i&&i.dish)};
(THEME_OF['decor:dish']=THEME_OF['decor:dish']||[]).push('cafe');
