'use strict';
/* =========================================================
   47. COLORING BOOK (v1.46): 🖍️ Tap-to-Color in the Little Ones' Corner (section 46)
   12 original pictures drawn in code (400 x 300). Each picture is a list of areas (SVG paths); area 0 is the
   background. Pick a crayon, tap an area: it fills. Nothing can go wrong. A picture is finished when every area
   except the background has a color: a cheer, +1 coin (ltPay) and stats.colored.
   Saved per room: little.colors[picId] = one '#rrggbb' (or '') per area, in area order. Picture ids are saved
   and areas are saved by their place in the list: never rename a picture or reorder, remove or insert areas
   (new pictures go at the end of CB_PICS).
   🖼️ Hang it up saves the picture into the Art Desk Gallery as a drawing (so it can be a poster), through the
   Art Desk's own rules: +5 coins for a new drawing, the first 5 a day. Hanging the same picture again updates it.
   ========================================================= */
const cbE=(cx,cy,rx,ry)=>`M${cx-rx} ${cy}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`;
const cbC=(cx,cy,r)=>cbE(cx,cy,r,r);
const cbR=(x,y,w,h,r)=>`M${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${y+h-r}Q${x+w} ${y+h} ${x+w-r} ${y+h}H${x+r}Q${x} ${y+h} ${x} ${y+h-r}V${y+r}Q${x} ${y} ${x+r} ${y}Z`;
const CB_BG='M0 0H400V300H0Z';
const cbInk='#3b2f52';
const cbEye=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r||7}" fill="${cbInk}"/><circle cx="${x+2}" cy="${y-2.5}" r="${(r||7)*0.35}" fill="#fff"/>`;
const cbLine=(d,w)=>`<path d="${d}" fill="none" stroke="${cbInk}" stroke-width="${w||4}" stroke-linecap="round" stroke-linejoin="round"/>`;
const cbStar=(x,y,r)=>`<path d="${starPath(x,y,r)}" fill="none" stroke="${cbInk}" stroke-width="3" stroke-linejoin="round"/>`;
const CB_PICS=[
  {id:'dino',icon:'🦕',name:'Dino',areas:[CB_BG,'M0 250Q200 228 400 250V300H0Z',
    'M118 125L133 86L153 110L173 74L195 103L217 70L236 105L257 82L270 128Z',
    'M118 170Q45 175 18 118Q62 150 122 138Z',
    cbR(140,190,38,62,10)+cbR(236,190,38,62,10),
    cbE(200,160,95,60),cbE(205,184,58,24),
    'M262 150Q262 110 285 85Q300 62 330 66Q362 70 360 98Q358 124 326 126Q302 128 298 152Z'],
    det:()=>cbEye(326,88)+cbLine('M320 110Q336 117 350 106')+`<circle cx="352" cy="84" r="3" fill="${cbInk}"/>`
      +['M165 140','M215 132','M245 150'].map(m=>cbLine(m+'a8 8 0 1 0 0.1 0',3)).join('')},
  {id:'rocket',icon:'🚀',name:'Rocket',areas:[CB_BG,cbC(55,265,75),
    'M175 214Q182 262 200 292Q218 262 225 214Z',
    'M166 160L128 222L166 210Z M234 160L272 222L234 210Z',
    'M165 216V110Q165 72 200 40Q235 72 235 110V216Z',
    'M200 40Q178 58 170 86H230Q222 58 200 40Z',cbC(200,135,21)],
    det:()=>cbStar(60,50,12)+cbStar(330,70,14)+cbStar(300,200,10)+cbStar(110,130,9)+cbStar(355,250,11)
      +cbLine('M188 128Q192 120 200 118',3)+[180,200,220].map(x=>`<circle cx="${x}" cy="190" r="3.5" fill="${cbInk}"/>`).join('')},
  {id:'truck',icon:'🚚',name:'Dump Truck',areas:[CB_BG,'M0 255H400V300H0Z',
    'M50 110L232 110L216 190L68 190Z',cbR(60,188,292,30,8),
    'M240 190V122Q240 100 262 100H310Q330 100 340 128L356 160V190Z',
    'M258 116H304Q316 116 322 134L328 150H258Z',
    cbC(112,226,32)+cbC(300,226,32),cbC(112,226,12)+cbC(300,226,12)],
    det:()=>cbLine('M95 118L102 182M140 118L142 182M185 118L180 182',3)+cbLine('M282 156V186',3)
      +`<circle cx="348" cy="174" r="7" fill="#fff" stroke="${cbInk}" stroke-width="3"/>`},
  {id:'train',icon:'🚂',name:'Train',areas:[CB_BG,'M0 255H400V300H0Z',
    cbE(110,55,22,18)+cbE(140,45,26,20)+cbE(170,60,20,16),
    'M95 122L88 80H132L125 122Z',cbR(70,120,180,82,30),
    cbR(240,80,100,122,10)+cbR(230,66,120,22,8),cbR(262,100,56,40,8),
    'M72 198L38 246H88Z',
    cbC(112,216,28)+cbC(182,216,28)+cbC(292,214,32)],
    det:()=>cbLine('M0 248H400',4)+cbLine('M112 216H292',5)+cbLine('M130 124V198M200 124V198',3)
      +[112,182,292].map(x=>`<circle cx="${x}" cy="${x===292?214:216}" r="6" fill="${cbInk}"/>`).join('')},
  {id:'shark',icon:'🦈',name:'Shark',areas:[CB_BG,'M0 262Q100 246 200 262Q300 276 400 256V300H0Z',
    'M60 264Q40 222 64 190Q84 160 62 128Q92 160 76 196Q60 226 82 264Z M340 262Q320 230 340 205Q358 180 340 158Q372 185 352 210Q340 235 358 262Z',
    'M96 150L34 94Q56 150 34 208Z',
    'M182 112Q200 60 242 54Q226 86 236 116Z M212 176Q196 214 170 226Q206 222 242 182Z',
    'M80 150Q120 104 222 104Q302 104 352 146Q332 162 302 172Q222 196 140 182Q100 172 80 150Z',
    'M150 176Q222 192 302 170Q320 166 336 158Q302 196 222 198Q172 198 150 176Z'],
    det:()=>cbEye(300,132)+cbLine('M310 160Q326 160 336 150',3)+cbLine('M255 128Q250 142 255 156M268 126Q263 142 268 158',3)
      +[[330,90,8],[350,60,6],[340,30,10]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${cbInk}" stroke-width="3"/>`).join('')},
  {id:'robot',icon:'🤖',name:'Robot',areas:[CB_BG,
    cbR(160,214,30,52,8)+cbR(210,214,30,52,8)+cbR(148,258,52,24,10)+cbR(200,258,52,24,10),
    cbR(94,140,40,72,16)+cbR(266,140,40,72,16),cbR(130,128,140,96,18),cbR(166,148,68,52,10),
    cbR(140,42,120,76,20),cbR(158,58,84,46,14),cbC(200,20,12)],
    det:()=>cbLine('M200 32V42',5)+cbLine('M190 118V128M210 118V128',5)
      +`<circle cx="182" cy="78" r="8" fill="${cbInk}"/><circle cx="218" cy="78" r="8" fill="${cbInk}"/>`+cbLine('M186 94Q200 102 214 94',3)
      +[183,200,217].map(x=>`<circle cx="${x}" cy="174" r="6" fill="#fff" stroke="${cbInk}" stroke-width="3"/>`).join('')},
  {id:'buddy',icon:'🐰',name:'Buddy',areas:[CB_BG,cbE(165,70,20,55)+cbE(235,70,20,55),cbE(165,76,9,38)+cbE(235,76,9,38),
    cbE(165,276,32,16)+cbE(235,276,32,16),cbE(200,214,70,64),cbE(200,228,42,40),
    cbE(130,206,18,30)+cbE(270,206,18,30),cbE(200,136,68,58)],
    det:()=>cbEye(176,128,8)+cbEye(224,128,8)+`<path d="M194 146H206L200 153Z" fill="${cbInk}"/>`+cbLine('M200 153V158M190 160Q200 168 210 160',3)},
  {id:'kitten',icon:'🐱',name:'Kitten',areas:[CB_BG,
    'M250 230Q330 230 320 160Q315 130 335 120Q345 150 340 170Q345 255 255 250Z',
    cbE(200,214,70,60),cbE(170,268,22,13)+cbE(230,268,22,13),
    'M140 100L150 40L185 80Z M260 100L250 40L215 80Z','M152 88L156 56L176 80Z M248 88L244 56L224 80Z',
    cbE(200,120,65,52),'M200 172L170 158L170 186Z M200 172L230 158L230 186Z'],
    det:()=>cbEye(178,115,8)+cbEye(222,115,8)+`<path d="M195 132H205L200 138Z" fill="${cbInk}"/>`+cbLine('M200 138Q193 146 186 142M200 138Q207 146 214 142',3)
      +cbLine('M150 128H120M150 136L122 144M250 128H280M250 136L278 144',2.5)+`<circle cx="200" cy="172" r="6" fill="#fff" stroke="${cbInk}" stroke-width="3"/>`},
  {id:'flower',icon:'🌷',name:'Flower',areas:[CB_BG,'M0 250Q200 236 400 250V300H0Z',
    'M150 212H250L238 286H162Z'+cbR(142,198,116,22,6),cbR(194,112,12,92,6),
    'M200 176Q160 140 134 160Q160 186 200 182Z M206 160Q246 124 272 144Q246 170 206 166Z',
    [0,1,2,3,4,5].map(k=>cbC(Math.round(200+38*Math.cos(k*Math.PI/3)),Math.round(95+38*Math.sin(k*Math.PI/3)),24)).join(''),
    cbC(200,95,24),cbC(345,52,30)],
    det:()=>[0,1,2,3,4,5,6,7].map(k=>{const a=k*Math.PI/4,c=Math.cos(a),s=Math.sin(a);return cbLine(`M${(345+c*38).toFixed(1)} ${(52+s*38).toFixed(1)}L${(345+c*50).toFixed(1)} ${(52+s*50).toFixed(1)}`,3);}).join('')
      +cbEye(192,90,4)+cbEye(208,90,4)+cbLine('M193 102Q200 107 207 102',2.5)},
  {id:'cupcake',icon:'🧁',name:'Cupcake',areas:[CB_BG,'M0 250H400V300H0Z',cbE(200,252,120,18),
    'M130 170H270L250 255H150Z',
    cbE(200,160,82,30)+cbE(200,130,62,28)+cbE(200,103,40,22)+'M215 90Q200 60 185 90Z',
    cbC(200,58,16),heartPath(200,212,17)],
    det:()=>cbLine('M160 176L170 250M240 176L230 250',3)+cbLine('M200 42Q204 30 214 26',3)
      +[[170,150,-30],[230,150,30],[188,122,20],[214,128,-20],[200,100,0],[160,168,10],[240,168,-10]].map(([x,y,r])=>`<rect x="${x-6}" y="${y-2}" width="12" height="4" rx="2" fill="${cbInk}" transform="rotate(${r} ${x} ${y})"/>`).join('')},
  {id:'butterfly',icon:'🦋',name:'Butterfly',areas:[CB_BG,
    'M195 140Q120 40 70 80Q50 130 120 160Z','M205 140Q280 40 330 80Q350 130 280 160Z',
    'M195 160Q120 160 100 215Q120 262 190 200Z','M205 160Q280 160 300 215Q280 262 210 200Z',
    cbC(115,105,16)+cbC(285,105,16)+cbC(140,210,12)+cbC(260,210,12),
    cbE(200,168,12,60)+cbC(200,98,15)],
    det:()=>cbLine('M195 86Q182 58 170 50M205 86Q218 58 230 50',3)+`<circle cx="170" cy="50" r="5" fill="${cbInk}"/><circle cx="230" cy="50" r="5" fill="${cbInk}"/>`
      +cbEye(195,96,3)+cbEye(205,96,3)+cbLine('M196 104Q200 107 204 104',2)},
  {id:'house',icon:'🏠',name:'House',areas:[CB_BG,'M0 250H400V300H0Z',cbR(255,60,30,60,4),
    'M95 140L200 55L305 140Z',cbR(115,135,170,120,4),
    'M180 255V205Q180 185 200 185Q220 185 220 205V255Z',
    cbR(130,160,40,36,6)+cbR(230,160,40,36,6),
    cbE(330,60,30,18)+cbE(355,50,24,16)+cbE(305,64,20,14)],
    det:()=>cbLine('M150 160V196M130 178H170M250 160V196M230 178H270',3)+`<circle cx="211" cy="222" r="4" fill="${cbInk}"/>`
      +cbLine('M140 120H260M170 96H230',3)}
];
const CB_CRAYONS=['#ff8cc6','#ff5d6c','#ffa94d','#ffd166','#7ee08a','#7fc8ff','#4d7cff','#a97cff','#b07a4f','#ffffff'];
const CB_NAMES=['Pink','Red','Orange','Yellow','Green','Sky blue','Blue','Purple','Brown','White'];
const cbPic=id=>CB_PICS.find(z=>z.id===id);
const cbCols=(p,z)=>{const c=Array.isArray(p.little.colors[z.id])?p.little.colors[z.id]:[];return z.areas.map((_,i)=>typeof c[i]==='string'?c[i]:'');};
const cbDone=(p,z)=>cbCols(p,z).every((c,i)=>i===0||c);
// The picture as SVG. With live, areas are tappable (data-a); the background has no outline.
function cbSVG(z,cols,attrs,live){
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" ${attrs||''}>`
    +z.areas.map((d,i)=>`<path${live?` data-a="${i}"`:''} d="${d}" fill="${cols[i]||'#fff'}"${i?` stroke="${cbInk}" stroke-width="5" stroke-linejoin="round"`:''}/>`).join('')
    +`<g pointer-events="none">${z.det()}</g></svg>`;
}

/* ---------- the picture list ---------- */
function cbPick(b){
  const p=P();
  b.innerHTML=`<div class="cb-pick">${CB_PICS.map(z=>`<button class="cb-thumb${cbDone(p,z)?' done':''}" data-pic="${z.id}" aria-label="${z.name}">${cbSVG(z,cbCols(p,z))}</button>`).join('')}</div>`;
}

/* ---------- coloring one picture ---------- */
let CBK={undo:[]}; // CB is the clicker cube (section 19)
function cbOpen(b){
  const p=P(), z=cbPic(LT.pic); if(!z){ltGo('colorPick');return;}
  b.innerHTML=`<div class="cb-wrap"><div class="cb-pic" id="cbPic">${cbSVG(z,cbCols(p,z),'id="cbSvg"',true)}</div>`
    +`<div class="cb-side"><div class="cb-crayons" id="cbCrayons">${CB_CRAYONS.map((c,i)=>`<button class="cb-crayon${i===LT.crayon?' on':''}" data-cr="${i}" style="--k:${c}" aria-label="${CB_NAMES[i]}"></button>`).join('')}</div>`
    +`<div class="cb-tools"><button class="btn ghost" data-cbt="undo" aria-label="Undo">↩️</button><button class="btn ghost" data-cbt="dice" aria-label="Surprise colors">🎲</button>`
    +`<button class="btn ghost" data-cbt="clear" aria-label="Start again">🗑️</button><button class="btn pink" data-cbt="hang" aria-label="Hang it up">🖼️</button></div></div></div>`;
}
function cbLeave(){CBK.undo=[];}
function cbSet(cols,fx){
  const p=P(), z=cbPic(LT.pic); if(!z) return;
  const was=cbDone(p,z);
  CBK.undo.push(cbCols(p,z)); if(CBK.undo.length>30) CBK.undo.shift();
  p.little.colors[z.id]=cols; saveSoon();
  $$('#cbSvg [data-a]').forEach(el=>{const i=+el.dataset.a, c=cols[i]||'#fff'; if(el.getAttribute('fill')!==c){el.setAttribute('fill',c); if(fx){el.classList.remove('cb-fx');void el.getBoundingClientRect();el.classList.add('cb-fx');}}});
  if(!was&&cbDone(p,z)) cbFinished();
}
function cbFinished(){
  const p=P(); p.stats.colored++;
  SFX.cheer(); giftConfetti(); ltPay(); save();
  const s=document.createElement('div'); s.className='cb-star'; s.textContent='🌟'; document.body.appendChild(s); setTimeout(()=>s.remove(),1400);
  checkStickers();
}
function cbDown(e){
  const cr=e.target.closest('[data-cr]');
  if(cr){e.preventDefault();LT.crayon=+cr.dataset.cr;$$('#cbCrayons .cb-crayon').forEach(x=>x.classList.toggle('on',x===cr));tone(520+LT.crayon*40,0.07,'triangle',0.12);return;}
  const a=e.target.closest('#cbSvg [data-a]'); if(!a) return;
  e.preventDefault();
  const p=P(), z=cbPic(LT.pic), i=+a.dataset.a, cols=cbCols(p,z), c=CB_CRAYONS[LT.crayon]||CB_CRAYONS[0];
  if(cols[i]===c) return;
  cols[i]=c; ltSoundNote(); tone(mf(64+LT.crayon*2),0.12,'sine',0.2,mf(76+LT.crayon*2)); cbSet(cols,true);
}
$('#ltBody').addEventListener('click',e=>{
  const pic=e.target.closest('[data-pic]');
  if(pic&&LT.view==='colorPick'){SFX.click();LT.pic=pic.dataset.pic;CBK.undo=[];ltGo('color');return;}
  const t=e.target.closest('[data-cbt]'); if(!t||LT.view!=='color') return;
  const p=P(), z=cbPic(LT.pic), k=t.dataset.cbt; SFX.click();
  if(k==='undo'){const u=CBK.undo.pop(); if(!u) return; p.little.colors[z.id]=u; save(); renderLittle();}
  else if(k==='dice') cbSet(z.areas.map((_,i)=>CB_CRAYONS[Math.floor(Math.random()*CB_CRAYONS.length)]),true);
  else if(k==='clear'){ if(cbCols(p,z).every(c=>!c)) return;
    modal('🗑️','<div class="cb-ask">'+cbSVG(z,z.areas.map(()=>''))+'</div>',[{text:'✖',cls:'ghost'},{text:'✔',cls:'pink',on:()=>cbSet(z.areas.map(()=>''))}]);}
  else if(k==='hang') cbHang();
});

/* ---------- 🖼️ hang it up (into the Art Desk Gallery) ---------- */
// The picture is drawn onto the Art Desk's 800 x 560 paper (white), as a normal drawing record.
function cbImage(z,cols,w,h){
  const xml=cbSVG(z,cols,`width="${w}" height="${h}"`);
  return new Promise((ok,bad)=>{
    const img=new Image();
    img.onload=()=>{try{const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d');
      g.fillStyle='#fff';g.fillRect(0,0,w,h);const s=Math.min(w/400,h/300),dw=400*s,dh=300*s;g.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);ok(cv);}catch(e){bad(e);}};
    img.onerror=bad; img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);
  });
}
function cbHang(){
  const p=P(), z=cbPic(LT.pic); if(!p||!z) return Promise.resolve(false);
  const cols=cbCols(p,z), sig=cols.join(','), old=p.little.hung[z.id];
  if(cols.every(c=>!c)){toast('Color it first! 🖍️');return Promise.resolve(false);}
  return ArtStore.get(old?old.art:'').catch(()=>null).then(have=>{
    if(have&&old.sig===sig){toast('It is in your Gallery! 🖼️');return false;}
    return Promise.all([cbImage(z,cols,ART_W,ART_H),cbImage(z,cols,240,168)]).then(([big,small])=>{
      const now=Date.now(), isNew=!have;
      const rec={id:isNew?uid():old.art,profileId:p.id,created:isNew?now:(have.created||now),updated:now,paper:'white',
        ink:ART_FMT?big.toDataURL(ART_FMT,0.9):big.toDataURL('image/png'),thumb:small.toDataURL(ART_FMT||'image/jpeg',0.8),color:z.id};
      return ArtStore.put(rec).then(()=>{
        ART_THUMBS[rec.id]=rec.thumb; p.little.hung[z.id]={art:rec.id,sig}; SFX.buy();
        if(!isNew){save();toast('Updated in your Gallery! 🖼️');checkStickers();return true;}
        p.stats.drawings++;
        if(p.artPay.day!==ltToday()) p.artPay={day:ltToday(),n:0};
        if(p.artPay.n<ART_DAILY){p.artPay.n++;earn(ART_COINS,'Art!');toast('In your Gallery! 🖼️ Hang it on the wall from the Art Desk.');}
        else{save();toast('In your Gallery! 🖼️ Art coins are done for today.');}
        checkStickers(); return true;
      });
    });
  }).catch(()=>{toast('No space left for drawings. Delete an old one in the Gallery.');return false;});
}
