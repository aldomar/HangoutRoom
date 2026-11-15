'use strict';
/* =========================================================
   11. ART DESK: drawing pad, stamps, gallery, posters
   The pad is a fixed 800 x 560 canvas, scaled to fit the screen.
   #artCv holds the drawing. It is see-through where nothing is drawn;
   the paper colour is the background behind it (so the eraser just erases).
   #artLive shows the marker/neon line while the finger is down, and is
   copied onto #artCv when it lifts (so the marker doesn't get darker where it crosses itself).
   No animation loop: the pad only redraws when she touches it.
   ========================================================= */
const ART_W=800,ART_H=560,UNDO_MAX=12;
const ART_COINS=5,ART_DAILY=5,ART_MIN_MARKS=3,MAX_POSTERS=4; // +5 per new drawing, first 5 a day; needs 3+ strokes
const PAPERS={white:'#ffffff',dark:'#231b2e',pink:'#ffe3f1'};
const ART_COLS=['#2b2235','#ffffff','#ff4fa3','#ff8cc6','#ff6b8a','#ffa94d','#ffd166','#69db7c','#8ff0d0','#4dabf7','#a97cff','#6d3fd6','rainbow'];
const TOOLS={
  pen:{icon:'✏️',name:'Pen',sizes:[4,10,20]},
  marker:{icon:'🖍️',name:'Marker',sizes:[14,28,48],live:1},
  glitter:{icon:'✨',name:'Glitter',sizes:[10,22,40]},
  neon:{icon:'💡',name:'Neon',sizes:[6,12,22],live:1},
  eraser:{icon:'🧽',name:'Eraser',sizes:[14,32,64]},
  stamp:{icon:'⭐',name:'Stamps',sizes:[50,85,130]}
};
// Stamps are drawn around (0,0) about 100 wide, then scaled to the brush size.
const INK='#2b2235';
function isDark(c){const n=parseInt(c.slice(1),16);return ((n>>16)*299+((n>>8)&255)*587+(n&255)*114)/1000<110;}
function shape(ctx,d,fill){const p=new Path2D(d);ctx.fillStyle=fill;ctx.fill(p);ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeStyle=INK;ctx.stroke(p);}
function dots(ctx,list,c){ctx.fillStyle=c;list.forEach(([x,y,rx,ry])=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry||rx,0,0,TAU);ctx.fill();});}
const STAMPS={
  star:{icon:'⭐',d:(c,col)=>shape(c,starPath(0,0,52),col)},
  heart:{icon:'💗',d:(c,col)=>shape(c,heartPath(0,4,36),col)},
  bat:{icon:'🦇',d:(c,col)=>{
    shape(c,'M-24 -4 Q-56 -46 -86 -16 Q-70 -12 -72 0 Q-58 -6 -56 8 Q-44 0 -26 12Z M24 -4 Q56 -46 86 -16 Q70 -12 72 0 Q58 -6 56 8 Q44 0 26 12Z',col);
    shape(c,'M-20 -18 L-15 -46 L-3 -26Z M20 -18 L15 -46 L3 -26Z',col);
    shape(c,'M-30 0 A30 30 0 1 0 30 0 A30 30 0 1 0 -30 0Z',col);
    dots(c,[[-11,-4,7],[11,-4,7]],'#fff');dots(c,[[-10,-3,3.5],[12,-3,3.5]],INK);}},
  ghost:{icon:'👻',d:(c,col)=>{
    shape(c,'M-38 46 V-6 Q-38 -50 0 -50 Q38 -50 38 -6 V46 Q29 34 19 46 Q10 34 0 46 Q-10 34 -19 46 Q-29 34 -38 46Z',col);
    dots(c,[[-13,-8,5,7],[13,-8,5,7],[0,8,5,6]],isDark(col)?'#fff':INK);dots(c,[[-24,6,6,4],[24,6,6,4]],'#ff8fb8');}},
  moon:{icon:'🌙',d:(c,col)=>{shape(c,'M12 -48 A48 48 0 1 0 12 48 A24 48 0 0 1 12 -48Z',col);shape(c,starPath(30,-20,10),col);}},
  ball:{icon:'⚽',d:(c,col)=>{
    shape(c,'M-46 0 A46 46 0 1 0 46 0 A46 46 0 1 0 -46 0Z',col);
    const pent=[0,1,2,3,4].map(k=>{const a=-Math.PI/2+k*TAU/5;return [Math.cos(a),Math.sin(a)];});
    c.strokeStyle=INK;c.lineWidth=4;c.beginPath();pent.forEach(([x,y])=>{c.moveTo(x*17,y*17);c.lineTo(x*44,y*44);});c.stroke();
    c.fillStyle=INK;c.beginPath();pent.forEach(([x,y],k)=>k?c.lineTo(x*18,y*18):c.moveTo(x*18,y*18));c.closePath();c.fill();}}
};

const acv=$('#artCv'), alive=$('#artLive'), artPad=$('#artPad');
const actx=acv.getContext('2d',{willReadFrequently:true}), lctx=alive.getContext('2d');
const ART_FMT=(()=>{try{const c=document.createElement('canvas');c.width=c.height=2;return c.toDataURL('image/webp').indexOf('data:image/webp')===0?'image/webp':'';}catch(e){return '';}})();
// owner = profile the pad belongs to; editId = the gallery drawing being changed (null = a new drawing)
const ART={tool:'pen',size:1,col:'#ff4fa3',stamp:'star',paper:'white',view:'pad',owner:null,editId:null,created:0,dirty:false,marks:0,undo:[],stroke:null};

function resetPad(owner){
  actx.clearRect(0,0,ART_W,ART_H); lctx.clearRect(0,0,ART_W,ART_H);
  Object.assign(ART,{owner,editId:null,created:0,dirty:false,marks:0,undo:[],stroke:null,paper:'white'});
  artPad.style.background=PAPERS.white;
}
function loadInto(rec,isDraft){
  const img=new Image();
  img.onload=()=>{
    resetPad(rec.profileId); actx.drawImage(img,0,0,ART_W,ART_H);
    ART.paper=Object.prototype.hasOwnProperty.call(PAPERS,rec.paper)?rec.paper:'white'; artPad.style.background=PAPERS[ART.paper];
    ART.editId=isDraft?(rec.editId||null):rec.id; ART.created=rec.created||0;
    ART.marks=isDraft?(rec.marks||0):ART_MIN_MARKS; ART.dirty=!!isDraft;
  };
  img.src=rec.ink;
}
function artBlank(){const d=actx.getImageData(0,0,ART_W,ART_H).data;for(let i=3;i<d.length;i+=28)if(d[i]>8)return false;return true;}
function fitPad(){
  const r=$('#artStage').getBoundingClientRect(); let w=r.width-24,h=r.height-24;
  if(w<=0||h<=0) return; if(w/h>ART_W/ART_H) w=h*ART_W/ART_H; else h=w*ART_H/ART_W;
  artPad.style.width=Math.floor(w)+'px'; artPad.style.height=Math.floor(h)+'px';
}
function renderArt(){
  const p=P(); if(!p) return;
  if(ART.owner!==p.id){
    resetPad(p.id); ART.view='pad';
    // bring back a drawing that was not saved when the app last went to the background
    ArtStore.get('draft-'+p.id).then(d=>{if(d&&ART.owner===p.id&&!ART.dirty&&!ART.marks)loadInto(d,true);}).catch(()=>{});
  }
  renderArtTools(); setArtView(ART.view);
}
function renderArtTools(){
  $('#artToolRow').innerHTML=Object.entries(TOOLS).map(([k,t])=>`<button class="abtn ${k===ART.tool?'on':''}" data-tool="${k}">${t.icon}<small>${t.name}</small></button>`).join('');
  $('#artStampRow').classList.toggle('hidden',ART.tool!=='stamp');
  $('#artStampRow').innerHTML=Object.entries(STAMPS).map(([k,s])=>`<button class="abtn ${k===ART.stamp?'on':''}" data-stamp="${k}">${s.icon}</button>`).join('');
  $('#artSizeRow').innerHTML=[8,16,26].map((px,i)=>`<button class="abtn ${i===ART.size?'on':''}" data-size="${i}" aria-label="Size ${i+1}"><span class="sdot" style="width:${px}px;height:${px}px"></span></button>`).join('');
  $('#artColRow').innerHTML=ART_COLS.map(c=>`<button class="swatch ${c===ART.col?'on':''}" data-col="${c}" aria-label="Colour" style="background:${c==='rainbow'?'conic-gradient(#ff6b8a,#ffd166,#69db7c,#4dabf7,#a97cff,#ff6b8a)':c}"></button>`).join('');
}
function setArtView(v){
  ART.view=v;
  $('#artPadView').classList.toggle('hidden',v!=='pad'); $('#artGalView').classList.toggle('hidden',v!=='gal');
  $('#artGalBtn').textContent=v==='gal'?'✏️ Draw':'🖼️ Gallery';
  if(v==='gal') renderGallery(); else fitPad();
}

/* ---------- drawing ---------- */
function artPt(e){const r=acv.getBoundingClientRect();return {x:(e.clientX-r.left)*ART_W/r.width,y:(e.clientY-r.top)*ART_H/r.height};}
function pushUndo(){ART.undo.push(actx.getImageData(0,0,ART_W,ART_H));if(ART.undo.length>UNDO_MAX)ART.undo.shift();}
function strokeCol(s,dist){return ART.col==='rainbow'?`hsl(${Math.round(s.hue+dist*0.6)%360},90%,62%)`:ART.col;}
function artSeg(a,b){ // pen, eraser and glitter draw straight onto the drawing
  const s=ART.stroke;
  if(ART.tool==='glitter'){sparkle(a,b,s);return;}
  actx.save(); actx.lineCap=actx.lineJoin='round'; actx.lineWidth=s.w;
  if(ART.tool==='eraser'){actx.globalCompositeOperation='destination-out';actx.strokeStyle='#000';} else actx.strokeStyle=strokeCol(s,s.dist);
  actx.beginPath(); actx.moveTo(a.x,a.y); actx.lineTo(b.x+0.01,b.y); actx.stroke(); actx.restore();
}
function sparkle(a,b,s){
  const n=2*Math.max(1,Math.round(Math.hypot(b.x-a.x,b.y-a.y)/5));
  for(let i=0;i<n;i++){
    const t=Math.random(), r=Math.random()*s.w, an=Math.random()*TAU, k=Math.random();
    const x=a.x+(b.x-a.x)*t+Math.cos(an)*r, y=a.y+(b.y-a.y)*t+Math.sin(an)*r, sz=1+Math.random()*s.w*0.13;
    actx.fillStyle=ART.col==='rainbow'?`hsl(${Math.floor(Math.random()*360)},95%,65%)`:(k<0.6?ART.col:k<0.8?'#ffffff':'#ffd166');
    actx.globalAlpha=0.6+Math.random()*0.4; actx.beginPath();
    if(Math.random()<0.25){const q=sz*2.4;actx.moveTo(x,y-q);actx.quadraticCurveTo(x,y,x+q,y);actx.quadraticCurveTo(x,y,x,y+q);actx.quadraticCurveTo(x,y,x-q,y);actx.quadraticCurveTo(x,y,x,y-q);}
    else actx.arc(x,y,sz,0,TAU);
    actx.fill();
  }
  actx.globalAlpha=1;
}
function drawLive(){ // marker + neon: redraw the whole line on the top canvas
  const s=ART.stroke, c=lctx, pts=s.pts;
  c.clearRect(0,0,ART_W,ART_H); c.lineCap=c.lineJoin='round';
  const pass=(w,col)=>{
    c.lineWidth=w;
    if(ART.col==='rainbow'&&!col){let d=0;for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[i];d+=Math.hypot(b.x-a.x,b.y-a.y);c.strokeStyle=strokeCol(s,d);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x+0.01,b.y);c.stroke();}return;}
    c.strokeStyle=col||ART.col; c.beginPath(); c.moveTo(pts[0].x,pts[0].y);
    for(let i=1;i<pts.length;i++) c.lineTo(pts[i].x,pts[i].y);
    if(pts.length===1) c.lineTo(pts[0].x+0.01,pts[0].y);
    c.stroke();
  };
  pass(s.w); if(ART.tool==='neon') pass(Math.max(2,s.w*0.35),'#ffffff');
}
function commitLive(){
  actx.save();
  if(ART.tool==='marker'){actx.globalAlpha=0.5;actx.drawImage(alive,0,0);}
  else{actx.shadowColor=ART.col==='rainbow'?'#ff8cc6':ART.col;actx.shadowBlur=18;actx.drawImage(alive,0,0);actx.shadowBlur=7;actx.drawImage(alive,0,0);}
  actx.restore(); lctx.clearRect(0,0,ART_W,ART_H); alive.className='';
}
function placeStamp(pt,w){
  const col=ART.col==='rainbow'?ART_COLS[2+Math.floor(Math.random()*10)]:ART.col;
  actx.save(); actx.translate(pt.x,pt.y); actx.rotate((Math.random()-0.5)*0.4); actx.scale(w/100,w/100);
  STAMPS[ART.stamp].d(actx,col); actx.restore(); SFX.pop(); vibrate(8);
}
artPad.addEventListener('pointerdown',e=>{
  if(ART.stroke||e.button>0) return; // one finger at a time
  e.preventDefault();
  const pt=artPt(e), T=TOOLS[ART.tool], w=T.sizes[ART.size];
  pushUndo(); ART.dirty=true; ART.marks++;
  if(ART.tool==='stamp'){placeStamp(pt,w);return;}
  ART.stroke={id:e.pointerId,pts:[pt],last:pt,dist:0,hue:Math.random()*360,w};
  try{artPad.setPointerCapture(e.pointerId);}catch(_){}
  if(T.live){alive.className=ART.tool;alive.style.setProperty('--glow',ART.col==='rainbow'?'#ff8cc6':ART.col);drawLive();}
  else artSeg(pt,pt);
});
artPad.addEventListener('pointermove',e=>{
  const s=ART.stroke; if(!s||e.pointerId!==s.id) return;
  const evs=(e.getCoalescedEvents&&e.getCoalescedEvents())||[], live=TOOLS[ART.tool].live;
  (evs.length?evs:[e]).forEach(ev=>{
    const pt=artPt(ev), d=Math.hypot(pt.x-s.last.x,pt.y-s.last.y); if(d<1.5) return;
    if(!live) artSeg(s.last,pt);
    s.dist+=d; s.pts.push(pt); s.last=pt;
  });
  if(live) drawLive();
});
function artEnd(e){const s=ART.stroke;if(!s||e.pointerId!==s.id)return;if(TOOLS[ART.tool].live)commitLive();ART.stroke=null;}
artPad.addEventListener('pointerup',artEnd);
artPad.addEventListener('pointercancel',artEnd);

$('#artTools').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return; const ds=b.dataset;
  if(ds.tool){ART.tool=ds.tool;SFX.click();renderArtTools();fitPad();}
  else if(ds.stamp){ART.stamp=ds.stamp;SFX.click();renderArtTools();}
  else if(ds.size){ART.size=+ds.size;SFX.click();renderArtTools();}
  else if(ds.col){ART.col=ds.col;SFX.click();renderArtTools();}
  else if(ds.act==='undo'){const u=ART.undo.pop();if(!u){toast('Nothing to undo');return;}actx.putImageData(u,0,0);ART.dirty=true;SFX.whoosh();}
  else if(ds.act==='clear'){if(artBlank()){toast('The paper is already empty ✨');return;}pushUndo();actx.clearRect(0,0,ART_W,ART_H);ART.dirty=true;SFX.whoosh();toast('Cleared! Tap ↩️ Undo to bring it back');}
  else if(ds.act==='paper'){const ks=Object.keys(PAPERS);ART.paper=ks[(ks.indexOf(ART.paper)+1)%ks.length];artPad.style.background=PAPERS[ART.paper];ART.dirty=true;SFX.click();}
  else if(ds.act==='save') saveDrawing();
});

/* ---------- saving ---------- */
function inkURL(){return ART_FMT?acv.toDataURL(ART_FMT,0.9):acv.toDataURL('image/png');}
function thumbURL(){
  const c=document.createElement('canvas');c.width=240;c.height=168;const x=c.getContext('2d');
  x.fillStyle=PAPERS[ART.paper];x.fillRect(0,0,240,168);x.drawImage(acv,0,0,240,168);
  return c.toDataURL(ART_FMT||'image/jpeg',0.8);
}
function saveDrawing(){
  const p=P(); if(!p) return Promise.resolve(false);
  if(artBlank()){toast('Draw something first! ✏️');return Promise.resolve(false);}
  const isNew=!ART.editId, now=Date.now();
  const rec={id:ART.editId||uid(),profileId:p.id,created:ART.created||now,updated:now,paper:ART.paper,ink:inkURL(),thumb:thumbURL()};
  return ArtStore.put(rec).then(()=>{
    ArtStore.del('draft-'+p.id).catch(()=>{});
    Object.assign(ART,{editId:rec.id,created:rec.created,dirty:false}); ART_THUMBS[rec.id]=rec.thumb; SFX.buy();
    if(!isNew){save();toast('Drawing updated! 🖼️');return true;}
    p.stats.drawings++;
    const today=new Date().toDateString(); if(p.artPay.day!==today) p.artPay={day:today,n:0};
    if(ART.marks>=ART_MIN_MARKS&&p.artPay.n<ART_DAILY){p.artPay.n++;earn(ART_COINS,'Art!');toast('Saved to your Gallery! 🖼️');}
    else{save();toast(p.artPay.n>=ART_DAILY?'Saved! 🖼️ Art coins are done for today. Keep drawing for fun!':'Saved to your Gallery! 🖼️');}
    return true;
  },()=>{toast('No space left for drawings. Delete an old one in the Gallery.');return false;});
}
// While the app is in the background, keep an unsaved drawing as a draft so it isn't lost.
function saveDraft(){
  const p=P(); if(cur!=='art'||!ART.dirty||!p||ART.owner!==p.id) return;
  ArtStore.put({id:'draft-'+p.id,draft:true,profileId:p.id,editId:ART.editId,created:ART.created,marks:ART.marks,paper:ART.paper,ink:inkURL(),updated:Date.now()}).catch(()=>{});
}
// Leaving the pad with unsaved changes asks first.
function artLeave(next){
  const p=P();
  const drop=()=>{if(p)ArtStore.del('draft-'+p.id).catch(()=>{});resetPad(p?p.id:null);next();};
  if(!ART.dirty){next();return;}
  if(artBlank()){drop();return;}
  modal('Save your drawing? 🎨','Your drawing is not in the Gallery yet.',[
    {text:"Don't save",cls:'ghost',on:drop},
    {text:'💾 Save it!',cls:'pink',keep:true,on:()=>saveDrawing().then(ok=>{if(ok){closeModal();next();}})}]);
}
function artBack(){artLeave(()=>{ART.view='pad';show('room');});}
$('#artBack').onclick=()=>{SFX.click();artBack();};
$('#artGalBtn').onclick=()=>{SFX.click();setArtView(ART.view==='gal'?'pad':'gal');};
$('#artNewBtn').onclick=()=>{SFX.click();artLeave(()=>{resetPad(P().id);setArtView('pad');});};
addEventListener('resize',()=>{if(cur==='art'&&ART.view==='pad')fitPad();});

/* ---------- gallery + posters ---------- */
let galList=[];
function myArt(){const p=P();return ArtStore.all().catch(()=>[]).then(l=>l.filter(r=>!r.draft&&p&&r.profileId===p.id).sort((a,b)=>b.updated-a.updated));}
function renderGallery(){
  myArt().then(list=>{
    const p=P(); if(!p||cur!=='art'||ART.view!=='gal') return; galList=list;
    const hung=new Set(allItems(p).filter(i=>i.type==='poster').map(i=>i.art));
    $('#galInfo').textContent=list.length?`${list.length} drawing${list.length===1?'':'s'} · 🖼️ ${hung.size} poster${hung.size===1?'':'s'}`:'';
    $('#artGrid').innerHTML=list.length?list.map(r=>`<button class="tile" data-art="${esc(r.id)}"><div class="tv wide"><img src="${esc(r.thumb)}" alt=""></div>${hung.has(r.id)?'<div class="tp cnt">🖼️</div>':''}<div class="tn">${new Date(r.created).toLocaleDateString()}</div></button>`).join('')
      :'<div class="empty">No drawings yet! Draw something, then tap 💾 Save 🎨</div>';
  });
}
$('#artGrid').addEventListener('click',e=>{const t=e.target.closest('[data-art]');if(!t)return;const r=galList.find(x=>x.id===t.dataset.art);if(r){SFX.click();artModal(r);}});
function artModal(r){
  const p=P(), hung=allItems(p).some(i=>i.type==='poster'&&i.art===r.id);
  modal('🎨 My drawing',`<div class="art-big" style="background:${Object.prototype.hasOwnProperty.call(PAPERS,r.paper)?PAPERS[r.paper]:'#fff'}"><img src="${esc(r.ink)}" alt=""></div>`,[
    {text:'🗑️ Delete',cls:'ghost',on:()=>delArt(r)},
    {text:hung?'📦 Take down':'🖼️ Hang in room',cls:'ghost',on:()=>hung?takeDown(r.id):hangArt(r)},
    {text:'Close',cls:'ghost'},
    {text:'✏️ Keep drawing',cls:'pink',on:()=>openArt(r)}]);
}
function openArt(r){
  if(ART.editId===r.id&&ART.dirty){setArtView('pad');return;}
  artLeave(()=>{loadInto(r,false);setArtView('pad');});
}
function hangArt(r){
  const p=P();
  // Up to MAX_POSTERS hanging in each room: her room first, then the Loft.
  const R=[p.room,p.room2].find(x=>postersUp(x)<MAX_POSTERS);
  if(!R){SFX.locked();toast(`Both rooms have ${MAX_POSTERS} posters already! Take one down first.`);return;}
  const keep=roomNo; roomNo=R===p.room2?2:1; R.items.push(Object.assign({uid:uid(),type:'poster',art:r.id,placed:true},spot('poster'))); roomNo=keep;
  ART_THUMBS[r.id]=r.thumb; save(); SFX.buy(); toast(R===p.room2?'Your poster is in the Loft! 🪜':'Your poster is in your room! Use 🛋️ Decorate to move it.'); renderGallery();
}
const postersUp=R=>R.items.filter(i=>i.type==='poster'&&i.placed).length;
function dropPoster(p,id){[p.room,p.room2].forEach(R=>{R.items=R.items.filter(i=>!(i.type==='poster'&&i.art===id));});}
function takeDown(id){const p=P();dropPoster(p,id);save();SFX.whoosh();toast('Poster taken down 📦');renderGallery();}
function delArt(r){
  modal('Delete this drawing?','It will be gone forever. If it is hanging in your room, the poster comes down too.',[
    {text:'Keep it',cls:'pink'},
    {text:'🗑️ Delete',cls:'ghost',on:()=>{
      const p=P(); dropPoster(p,r.id); save();
      delete ART_THUMBS[r.id]; if(ART.editId===r.id) resetPad(p.id);
      ArtStore.del(r.id).catch(()=>{}).then(()=>{SFX.whoosh();toast('Drawing deleted');renderGallery();});}}]);
}
// Posters in the room need the small pictures in memory, because the room draws all at once.
function loadArtThumbs(){
  return ArtStore.all().then(list=>{
    ART_THUMBS={}; list.forEach(r=>{if(!r.draft)ART_THUMBS[r.id]=r.thumb;});
    const p=P(); if(cur==='room'&&!drag&&p&&allItems(p).some(i=>i.type==='poster')) renderRoom();
  }).catch(()=>{});
}
