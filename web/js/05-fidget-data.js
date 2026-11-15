'use strict';
/* =========================================================
   5. FIDGET DATA
   ========================================================= */
const POP_THEMES={
  rainbow:{name:'Rainbow',price:0,board:'#fff',cols:['#ff6b8a','#ffa94d','#ffe066','#69db7c','#4dabf7','#b197fc']},
  pastel:{name:'Pastel',price:10,board:'#fff7fb',cols:['#ffd6e7','#ffe5cc','#fff3bf','#d3f9d8','#d0ebff','#e5dbff']},
  emo:{name:'Emo Night',price:15,board:'#1d1724',cols:['#2b2236','#4a2a6e','#7b3fb0','#c04fd6','#ff4fa3','#ff8cc6']},
  soccer:{name:'Soccer',price:15,board:'#2f9e44',cols:['#ffffff','#8ce99a','#ffffff','#8ce99a','#ffffff','#8ce99a']}
};
const SQUISHIES={
  mochi:{name:'Mochi Bunny',price:0,fill:'#fff6fa',shade:'#f0cfe0',line:'#c9a3b8',hi:'#ffffff',extra:'ears'},
  peach:{name:'Peachy',price:10,fill:'#ffc2a8',shade:'#f59f86',line:'#d6806a',hi:'#fff1ea',extra:'leaf'},
  strawberry:{name:'Strawberry',price:15,fill:'#ff6b81',shade:'#d9435a',line:'#b8344a',hi:'#ffc2cc',extra:'berry'},
  cloud:{name:'Cloud',price:15,fill:'#e3f2ff',shade:'#b9d8f5',line:'#8fb3d6',hi:'#ffffff',extra:'cloud'},
  bat:{name:'Batty',price:20,fill:'#3d3150',shade:'#241c30',line:'#120d17',hi:'#6a5a80',extra:'wings',dark:true}
};
const SPINS={
  galaxy:{name:'Galaxy',price:0,body:'#3b1f6e',edge:'#a97cff',cap:'#ffd166',deco:'star'},
  pink:{name:'Bubblegum',price:10,body:'#ff8cc6',edge:'#fff',cap:'#fff',deco:'heart'},
  soccer:{name:'Soccer',price:15,body:'#f4f4f4',edge:'#222',cap:'#222',deco:'pent'},
  emo:{name:'Emo',price:20,body:'#1d1724',edge:'#ff4fa3',cap:'#a97cff',deco:'heart'}
};
// Pop-it board shapes (v1.10). 'classic' is the square board; content packs add more (with a 100 x 100 outline path).
// Saved in p.fid.popShape and owned as popshape:<id>: never rename the ids.
const POP_SHAPES={classic:{name:'⬜ Square Board',price:0}};
const FID={popit:{key:'pop',list:POP_THEMES},squish:{key:'squish',list:SQUISHIES},spin:{key:'spin',list:SPINS}};
