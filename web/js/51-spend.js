'use strict';
/* =========================================================
   51. NEW THINGS TO SPEND COINS ON (v1.50)
   🏠 Pet homes: the pet menu's 🏠 Home button (section 22) opens a picker. A home is drawn where the cushion bed was, under
   the pet, in every room (petHomeArt, called by petG). The cushion ('' in p.pet.home) is free. Homes stay low on the left,
   where the buddy's feet are, so they never cover the buddy. Owned as pethome:<id>; ids are saved, never rename them.
   🎨 Stage backdrops: a row of picture buttons under the Stage's song list (stgBdRow, called by stgPickView). drawStage
   calls stgBackdrop(), which draws the chosen backdrop once into a hidden canvas and then only copies it each frame
   (again only when the size or the backdrop changes). Saved in p.stage.backdrop ('classic' = the old look, free);
   owned as backdrop:<id>; ids are saved, never rename them.
   🏛️ Museum pieces: decorations with the new 🏛️ Museum theme chip. Pedestals and the Display Counter stand on the floor
   and work like shelves (shelf:{w, top}); section 9's rideY() draws what sits on them just in front of them.
   ========================================================= */
const spL='stroke="#2b2235" stroke-width="3.5" stroke-linejoin="round"', spL5='stroke="#2b2235" stroke-width="5" stroke-linejoin="round"';
const spShadow=(rx)=>`<ellipse cx="0" cy="-2" rx="${rx}" ry="10" fill="#00000030"/>`;
const spCushion=(c,c2)=>`<ellipse cx="0" cy="-12" rx="46" ry="14" fill="${c}" ${spL}/><ellipse cx="0" cy="-15" rx="34" ry="8" fill="${c2}"/>`;
// a little bat, centered on x, y (s = size)
const spBat=(x,y,s,c)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M-12 0 Q-9 -8 -3 -4 Q-2 -8 0 -6 Q2 -8 3 -4 Q9 -8 12 0 Q7 -2 5 3 Q2 0 0 2 Q-2 0 -5 3 Q-7 -2 -12 0Z" fill="${c||'#2b2235'}"/>`;

/* ---------- 🏠 pet homes (drawn bottom-center at the pet's spot, behind the pet) ---------- */
const PET_HOMES={
  batTent:{name:'Bat Tent',price:15,icon:'🦇',d:()=>spShadow(60)
    +`<path d="M0 -112 V-134" stroke="#2b2235" stroke-width="3"/><path d="M0 -134 L22 -128 L0 -121Z" fill="#ff8cc6" ${spL}/>`
    +`<path d="M-62 -4 L0 -112 L62 -4Z" fill="#4a3a6e" ${spL}/><path d="M-36 -4 L0 -76 L36 -4Z" fill="#241a33"/>`
    +`<path d="M-48 -26 L-38 -44 M48 -26 L38 -44" stroke="#a97cff" stroke-width="4" stroke-linecap="round"/>`+spBat(26,-60,0.9,'#c9b8f0')+spBat(-22,-50,0.7,'#c9b8f0')
    +spCushion('#a97cff','#c9b8f0')},
  cloudBed:{name:'Cloud Bed',price:12,icon:'☁️',d:()=>spShadow(60)
    +`<path d="M-58 -10 Q-72 -40 -44 -48 Q-40 -80 -10 -78 Q8 -104 34 -84 Q62 -84 56 -54 Q70 -36 56 -10Z" fill="#fbf7ff" ${spL}/>`
    +`<path d="${starPath(40,-62,7)}" fill="#ffd166"/><path d="${heartPath(-30,-56,6)}" fill="#ffc1dc"/><circle cx="12" cy="-74" r="3" fill="#8ff0d0"/>`
    +spCushion('#c9e8ff','#fbf7ff')},
  starDome:{name:'Star Dome',price:18,icon:'⭐',d:()=>spShadow(62)
    +`<path d="M-60 -4 A60 60 0 0 1 60 -4Z" fill="#3b2f6e" ${spL}/><path d="M-32 -4 A32 38 0 0 1 32 -4Z" fill="#221a3a"/>`
    +[[-40,-30],[-22,-50],[24,-52],[44,-28],[2,-56]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%2?2.5:3.5}" fill="#ffd166"/>`).join('')
    +`<path d="${starPath(0,-68,13)}" fill="#ffd166" ${spL}/>`+spCushion('#ffd166','#fff3c4')},
  cottage:{name:'Tiny Cottage',price:20,icon:'🏡',d:()=>spShadow(62)
    +`<rect x="24" y="-110" width="14" height="26" fill="#c8578f" ${spL}/>`
    +`<rect x="-52" y="-64" width="104" height="60" fill="#ffe1b8" ${spL}/><path d="M-64 -58 L0 -108 L64 -58Z" fill="#ff8cc6" ${spL}/>`
    +`<path d="${heartPath(0,-78,8)}" fill="#fff"/><path d="M-28 -4 V-34 A28 26 0 0 1 28 -34 V-4Z" fill="#6b4630" ${spL}/>`
    +`<rect x="34" y="-50" width="12" height="12" fill="#8ff0d0" ${st('#2b2235',2)}/>`+spCushion('#ff8cc6','#ffc1dc')},
  rocketPod:{name:'Rocket Pod',price:25,icon:'🚀',d:()=>spShadow(60)
    +`<path d="M-34 -40 L-58 -4 H-34Z M34 -40 L58 -4 H34Z" fill="#ff8cc6" ${spL}/>`
    +`<path d="M-34 -4 V-66 Q-34 -104 0 -120 Q34 -104 34 -66 V-4Z" fill="#e9edf7" ${spL}/><path d="M-24 -102 Q0 -126 24 -102Z" fill="#a97cff"/>`
    +`<circle cx="0" cy="-80" r="12" fill="#8ff0d0" ${spL}/><circle cx="-4" cy="-84" r="4" fill="#fff"/>`
    +`<path d="M-34 -50 H34" stroke="#c9cfe0" stroke-width="3"/>`+spCushion('#7fc8ff','#c9e8ff')},
  dinoEgg:{name:'Dino Egg Bed',price:22,icon:'🥚',d:()=>spShadow(62)
    +`<path d="M-58 -6 Q-64 -64 -42 -82 L-30 -64 L-16 -88 L0 -66 L16 -92 L30 -66 L42 -84 Q64 -64 58 -6Z" fill="#f4f0dc" ${spL}/>`
    +[[-38,-40,9],[30,-34,11],[-6,-56,7],[44,-62,6],[-46,-66,5]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#8fd18a"/>`).join('')
    +spCushion('#8fd18a','#c8f0c0')},
  shellBed:{name:'Seashell Bed',price:15,icon:'🐚',d:()=>spShadow(62)
    +`<path d="M-60 -6 Q-68 -58 -32 -88 Q0 -108 32 -88 Q68 -58 60 -6Z" fill="#ffc1dc" ${spL}/>`
    +[-48,-26,0,26,48].map(x=>`<path d="M0 -8 L${x} ${-90+Math.abs(x)*0.5}" stroke="#ff8cc6" stroke-width="4" stroke-linecap="round"/>`).join('')
    +`<circle cx="46" cy="-22" r="8" fill="#fbf7ff" ${st('#2b2235',2.5)}/>`+spCushion('#8ff0d0','#d2fff0')},
  castle:{name:'Mini Castle',price:30,icon:'🏰',d:()=>{const cr=(x,y,w)=>`<path d="M${x} ${y} v-8 h${w/5} v8 h${w/5} v-8 h${w/5} v8 h${w/5} v-8 h${w/5} v8Z" fill="#c9b8f0" ${st('#2b2235',3)}/>`;
    return spShadow(64)
    +`<path d="M44 -112 V-130" stroke="#2b2235" stroke-width="3"/><path d="M44 -130 L62 -125 L44 -119Z" fill="#ff8cc6" ${spL}/>`
    +`<rect x="28" y="-104" width="32" height="100" fill="#c9b8f0" ${spL}/>`+cr(28,-104,32)
    +`<rect x="-62" y="-70" width="28" height="66" fill="#c9b8f0" ${spL}/>`+cr(-62,-70,28)
    +`<rect x="-36" y="-62" width="66" height="58" fill="#ddd0ff" ${spL}/>`+cr(-36,-62,66)
    +`<path d="M-22 -4 V-30 A22 22 0 0 1 22 -30 V-4Z" fill="#4a3a6e" ${spL}/><rect x="38" y="-86" width="12" height="16" rx="6" fill="#ffd166" ${st('#2b2235',2)}/>`
    +spCushion('#ffd166','#fff3c4');}}
};
const petHomeId=p=>{const h=p.pet.home;return h&&PET_HOMES[h]&&p.owned.includes('pethome:'+h)?h:'';};
function petHomeArt(p){const h=petHomeId(p);return `<g class="pet-home" data-ph="${h||'cushion'}">${h?PET_HOMES[h].d():petBed()}</g>`;}
function petHomes(){
  const p=P(), k=petKind(p), on=petHomeId(p);
  const tile=(id,H)=>{const own=!id||p.owned.includes('pethome:'+id);
    return `<button class="tile${id===on?' on':''}${own?'':' locked'}${poorCls(p,own,H?H.price:0)}" data-home="${id}" aria-label="${H?H.name:'Cushion'}"><div class="tv"><svg viewBox="-70 -140 140 146">${H?H.d():petBed()}<g transform="translate(0 -8) scale(.8)">${petArt(k,petAcc(p))}</g></svg></div><div class="tn">${H?H.name:'Cushion'}</div>${own?'':priceTag(p,H.price)}</button>`;};
  modal('🏠 Pet home',`<div class="pet-pick">${tile('')}${easySort(Object.entries(PET_HOMES),([id,H])=>p.owned.includes('pethome:'+id)?0:H.price).map(([id,H])=>tile(id,H)).join('')}</div>`,[{text:'Done',cls:'pink'}]);
  $$('#modalBody [data-home]').forEach(b=>b.onclick=()=>petHomeSet(b.dataset.home));
}
function petHomeSet(id){
  const p=P(), H=PET_HOMES[id];
  const use=()=>{p.pet.home=H?id:''; save(); if(cur==='room') renderRoom(); SFX.click(); petHomes();};
  if(!H){use();return;}
  tryBuy('pethome:'+id,H.price,H.name,use);
}

/* ---------- 🎨 Stage backdrops (canvas drawings; W x H in CSS pixels) ---------- */
// The same "random" dots every time (a tiny seeded generator), so a backdrop never changes between songs.
function spRand(seed){let s=seed>>>0||1;return ()=>(s=(s*1664525+1013904223)>>>0)/4294967296;}
function spGrad(c,W,H,a,b){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,a);g.addColorStop(1,b);c.fillStyle=g;c.fillRect(0,0,W,H);}
function spDots(c,W,H,n,col,seed,maxY){const r=spRand(seed);c.fillStyle=col;
  for(let i=0;i<n;i++){const x=r()*W,y=r()*H*(maxY||1),s=0.6+r()*1.6;c.globalAlpha=0.35+r()*0.6;c.beginPath();c.arc(x,y,s,0,TAU);c.fill();}c.globalAlpha=1;}
function spCircle(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
const BACKDROPS={
  classic:{name:'Classic',icon:'✨',price:0,d:(c,W,H)=>spGrad(c,W,H,'#2b1846','#120a1e')},
  starry:{name:'Starry Night',icon:'🌙',price:10,d:(c,W,H)=>{spGrad(c,W,H,'#1b2350','#0b0f24');spDots(c,W,H,Math.round(W*H/4000)+20,'#fff',7,0.8);
    const m=Math.min(W,H)*0.08;spCircle(c,W*0.86,H*0.14,m,'#fff3c4');spCircle(c,W*0.86+m*0.45,H*0.14-m*0.2,m*0.9,'#1b2350');}},
  candy:{name:'Candy Clouds',icon:'🍭',price:12,d:(c,W,H)=>{spGrad(c,W,H,'#5a2f6e','#22122e');const u=Math.min(W,H);
    c.globalAlpha=0.28;[[0.12,0.2,'#ffc1dc'],[0.88,0.3,'#c9e8ff'],[0.2,0.55,'#d2fff0'],[0.82,0.62,'#ffc1dc']].forEach(([x,y,col])=>{
      [[0,0,1],[-0.9,0.25,0.7],[0.9,0.25,0.7]].forEach(([dx,dy,s])=>spCircle(c,W*x+dx*u*0.07,H*y+dy*u*0.07,u*0.07*s,col));});
    c.globalAlpha=0.5;[[0.06,0.85],[0.94,0.85]].forEach(([x,y])=>{const cx=W*x,cy=H*y,r=u*0.06;c.strokeStyle='#fbf7ff';c.lineWidth=4;
      c.beginPath();c.moveTo(cx,cy+r);c.lineTo(cx,cy+r*3);c.stroke();spCircle(c,cx,cy,r,'#ff8cc6');c.strokeStyle='#fff';c.lineWidth=3;
      c.beginPath();for(let a=0;a<TAU*2.2;a+=0.2){const rr=r*a/(TAU*2.2);c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}c.stroke();});
    c.globalAlpha=1;spDots(c,W,H,30,'#ffd166',3,0.7);}},
  bats:{name:'Bat Castle',icon:'🦇',price:15,d:(c,W,H)=>{spGrad(c,W,H,'#2f1c48','#0e0818');const u=Math.min(W,H);
    spCircle(c,W*0.5,H*0.2,u*0.16,'#3f2c5e');spDots(c,W,H,40,'#c9b8f0',11,0.6);
    c.fillStyle='#1a1028';[[0.03,0.62,0.1],[0.84,0.58,0.13]].forEach(([x,y,w])=>{const X=W*x,Y=H*y,ww=W*w,tw=ww*0.3;
      c.fillRect(X,Y,ww,H-Y);c.fillRect(X,Y-H*0.08,tw,H*0.08);c.fillRect(X+ww-tw,Y-H*0.08,tw,H*0.08);
      c.beginPath();c.moveTo(X-tw*0.2,Y-H*0.08);c.lineTo(X+tw/2,Y-H*0.16);c.lineTo(X+tw*1.2,Y-H*0.08);c.fill();
      c.beginPath();c.moveTo(X+ww-tw*1.2,Y-H*0.08);c.lineTo(X+ww-tw/2,Y-H*0.16);c.lineTo(X+ww+tw*0.2,Y-H*0.08);c.fill();});
    c.fillStyle='#ffd166';c.globalAlpha=0.7;[[0.07,0.7],[0.1,0.78],[0.9,0.66],[0.92,0.75]].forEach(([x,y])=>c.fillRect(W*x,H*y,u*0.015,u*0.022));c.globalAlpha=1;
    const r=spRand(5);c.fillStyle='#c9b8f0';for(let i=0;i<7;i++){const x=W*(0.1+r()*0.8),y=H*(0.06+r()*0.3),s=u*(0.01+r()*0.008);
      c.beginPath();c.moveTo(x-s*3,y);c.quadraticCurveTo(x-s*1.5,y-s*2,x,y-s*0.3);c.quadraticCurveTo(x+s*1.5,y-s*2,x+s*3,y);c.quadraticCurveTo(x+s*1.5,y-s*0.5,x,y+s);c.quadraticCurveTo(x-s*1.5,y-s*0.5,x-s*3,y);c.fill();}}},
  ocean:{name:'Under the Sea',icon:'🐠',price:15,d:(c,W,H)=>{spGrad(c,W,H,'#14557a','#06223a');const u=Math.min(W,H);
    c.globalAlpha=0.08;c.fillStyle='#fff';[0.2,0.45,0.7].forEach(x=>{c.beginPath();c.moveTo(W*x,0);c.lineTo(W*(x+0.06),0);c.lineTo(W*(x-0.05),H);c.lineTo(W*(x-0.12),H);c.fill();});
    c.globalAlpha=0.45;c.strokeStyle='#c9e8ff';c.lineWidth=2;const r=spRand(9);
    for(let i=0;i<22;i++){c.beginPath();c.arc(W*r(),H*r()*0.8,u*(0.006+r()*0.012),0,TAU);c.stroke();}
    c.globalAlpha=0.6;c.strokeStyle='#3aa87a';c.lineWidth=Math.max(4,u*0.014);c.lineCap='round';
    [0.04,0.08,0.92,0.96].forEach((x,i)=>{c.beginPath();c.moveTo(W*x,H);for(let k=1;k<=6;k++)c.lineTo(W*x+Math.sin(k*1.3+i)*u*0.02,H-k*H*0.05);c.stroke();});
    c.globalAlpha=0.5;[[0.12,0.3,'#ffab7a'],[0.88,0.42,'#ffd166']].forEach(([x,y,col])=>{const X=W*x,Y=H*y,s=u*0.03;c.fillStyle=col;
      c.beginPath();c.ellipse(X,Y,s,s*0.6,0,0,TAU);c.fill();c.beginPath();c.moveTo(X-s*0.8,Y);c.lineTo(X-s*1.6,Y-s*0.6);c.lineTo(X-s*1.6,Y+s*0.6);c.fill();});
    c.globalAlpha=1;}},
  dino:{name:'Dino Jungle',icon:'🦖',price:15,d:(c,W,H)=>{spGrad(c,W,H,'#2a4a3a','#0b2018');const u=Math.min(W,H);
    const vx=W*0.8,vy=H*0.5;c.fillStyle='#183428';c.beginPath();c.moveTo(vx-W*0.16,H*0.72);c.lineTo(vx-W*0.03,vy);c.lineTo(vx+W*0.03,vy);c.lineTo(vx+W*0.16,H*0.72);c.fill();
    c.globalAlpha=0.5;spCircle(c,vx,vy-u*0.02,u*0.03,'#ff8a2a');c.globalAlpha=0.25;spCircle(c,vx,vy-u*0.07,u*0.04,'#c9cfe0');spCircle(c,vx+u*0.03,vy-u*0.13,u*0.05,'#c9cfe0');c.globalAlpha=1;
    c.fillStyle='#183428';const dx=W*0.18,dy=H*0.66,s=u*0.05;c.beginPath();c.ellipse(dx,dy,s*1.6,s*0.8,0,0,TAU);c.fill();
    c.lineWidth=s*0.45;c.lineCap='round';c.strokeStyle='#183428';c.beginPath();c.moveTo(dx+s,dy-s*0.3);c.quadraticCurveTo(dx+s*2.2,dy-s*2.6,dx+s*2.8,dy-s*2.8);c.stroke();
    c.beginPath();c.moveTo(dx-s*1.4,dy);c.quadraticCurveTo(dx-s*2.6,dy+s*0.2,dx-s*3.2,dy-s*0.4);c.stroke();
    c.fillStyle='#2f7a4a';[[0,0.9,1],[1,0.95,-1]].forEach(([x,y,k])=>{for(let i=0;i<4;i++){c.save();c.translate(W*x,H*y);c.rotate(k*(-0.9-i*0.35));
      c.beginPath();c.ellipse(u*0.13,0,u*0.13,u*0.035,0,0,TAU);c.fill();c.restore();}});}},
  galaxy:{name:'Galaxy',icon:'🌌',price:18,d:(c,W,H)=>{spGrad(c,W,H,'#2a1050','#080418');const u=Math.min(W,H);
    [[0.2,0.3,'255,140,198'],[0.8,0.45,'127,200,255'],[0.5,0.15,'169,124,255']].forEach(([x,y,rgb])=>{const g=c.createRadialGradient(W*x,H*y,0,W*x,H*y,u*0.35);
      g.addColorStop(0,`rgba(${rgb},0.3)`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(0,0,W,H);});
    spDots(c,W,H,Math.round(W*H/3000)+30,'#fff',21,1);
    const px=W*0.12,py=H*0.16,pr=u*0.05;spCircle(c,px,py,pr,'#ffab7a');c.strokeStyle='#ffd166';c.lineWidth=3;c.beginPath();c.ellipse(px,py,pr*1.7,pr*0.45,-0.3,0,TAU);c.stroke();}},
  neon:{name:'Neon City',icon:'🌃',price:20,d:(c,W,H)=>{spGrad(c,W,H,'#24124a','#080616');const u=Math.min(W,H),r=spRand(13);
    spDots(c,W,H,25,'#fff',17,0.4);let x=0;
    while(x<W){const w=W*(0.05+r()*0.06),h=H*(0.18+r()*0.28);c.fillStyle='#140c28';c.fillRect(x,H-h,w,h);
      for(let wy=H-h+u*0.03;wy<H-u*0.02;wy+=u*0.045)for(let wx=x+u*0.015;wx<x+w-u*0.02;wx+=u*0.04)if(r()<0.4){c.fillStyle=r()<0.5?'#ff8cc6':'#8ff0d0';c.globalAlpha=0.55;c.fillRect(wx,wy,u*0.014,u*0.018);c.globalAlpha=1;}
      x+=w+W*0.005;}
    c.lineWidth=4;c.shadowBlur=12;[[0.12,0.3,'#ff8cc6'],[0.88,0.28,'#8ff0d0']].forEach(([x1,y1,col],i)=>{c.strokeStyle=col;c.shadowColor=col;const X=W*x1,Y=H*y1,s=u*0.05;
      c.beginPath();if(i){for(let k=0;k<=10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?s*0.45:s;c.lineTo(X+Math.cos(a)*rr,Y+Math.sin(a)*rr);}}
      else{c.moveTo(X,Y+s*0.8);c.bezierCurveTo(X-s*1.4,Y-s*0.2,X-s*0.6,Y-s*1.1,X,Y-s*0.4);c.bezierCurveTo(X+s*0.6,Y-s*1.1,X+s*1.4,Y-s*0.2,X,Y+s*0.8);}c.stroke();});
    c.shadowBlur=0;}}
};
const stgBdId=p=>{const b=p&&p.stage.backdrop;return b&&BACKDROPS[b]&&(!BACKDROPS[b].price||p.owned.includes('backdrop:'+b))?b:'classic';};
const BD={key:'',cv:null,thumbs:{}};
function spBdCanvas(id,W,H){const d=Math.min(2,window.devicePixelRatio||1), cv=document.createElement('canvas');
  cv.width=Math.max(1,Math.round(W*d)); cv.height=Math.max(1,Math.round(H*d));
  const c=cv.getContext('2d'); c.setTransform(d,0,0,d,0,0); BACKDROPS[id].d(c,W,H); return cv;}
// Called by drawStage every frame: draws the backdrop once, then only copies it.
function stgBackdrop(ctx,W,H){
  const id=stgBdId(P()), key=id+'|'+Math.round(W)+'x'+Math.round(H);
  if(key!==BD.key||!BD.cv){BD.cv=spBdCanvas(id,W,H);BD.key=key;}
  ctx.drawImage(BD.cv,0,0,W,H);
}
const bdThumb=id=>BD.thumbs[id]||(BD.thumbs[id]=spBdCanvas(id,120,80).toDataURL());
function stgBdRow(){
  const p=P(), box=$('#stgBds'); if(!p||!box) return; const on=stgBdId(p);
  box.innerHTML=`<div class="bd-t">🎨 <span>Backdrop</span></div>`+easySort(Object.entries(BACKDROPS),([id,B])=>!B.price||p.owned.includes('backdrop:'+id)?0:B.price).map(([id,B])=>{
    const own=!B.price||p.owned.includes('backdrop:'+id);
    return `<button class="bd${id===on?' on':''}${poorCls(p,own,B.price)}" data-bd="${id}" aria-label="${B.name}"><img alt="" src="${bdThumb(id)}"><span class="tn">${B.icon} ${B.name}</span>${own?'':priceTag(p,B.price)}</button>`;}).join('');
}
$('#stgBds').onclick=e=>{
  const b=e.target.closest('[data-bd]'), p=P(); if(!b||!p||STG.state!=='pick') return;
  const id=b.dataset.bd, B=BACKDROPS[id]; if(!B) return;
  tryBuy('backdrop:'+id,B.price,B.name,()=>{p.stage.backdrop=id; save(); SFX.click(); stgBdRow();});
};

/* ---------- 🏛️ museum pieces ---------- */
const spGold='#ffd166', spGoldDk='#c99a2e';
// a pedestal of height h (things sit on its top, at y = -h)
const spPedestal=(h,c,c2)=>`<ellipse cx="0" cy="-3" rx="54" ry="8" fill="#00000030"/><rect x="-46" y="-18" width="92" height="16" rx="4" fill="${c}" ${spL}/>`
  +`<rect x="-34" y="${-h+14}" width="68" height="${h-32}" fill="${c2}" ${spL}/>`+[-18,0,18].map(x=>`<path d="M${x} ${-h+20} V-24" stroke="${c}" stroke-width="4" opacity=".7"/>`).join('')
  +`<rect x="-46" y="${-h}" width="92" height="16" rx="4" fill="${c}" ${spL}/>`;
Object.assign(DECOR,{
  pedestal:{name:'Pedestal',price:10,shelf:{w:90,top:110},box:'-60 -120 120 128',d:()=>spPedestal(110,'#fbf7ff','#e7e0f2')},
  tallPedestal:{name:'Tall Pedestal',price:14,shelf:{w:90,top:170},box:'-60 -180 120 188',d:()=>spPedestal(170,'#c9b8f0','#ddd0ff')},
  museumCounter:{name:'Display Counter',price:25,shelf:{w:220,top:100},box:'-125 -110 250 118',d:()=>`<ellipse cx="0" cy="-3" rx="116" ry="9" fill="#00000030"/>`
    +`<rect x="-112" y="-100" width="224" height="96" rx="6" fill="#6b4630" ${spL5}/><rect x="-100" y="-86" width="200" height="56" rx="4" fill="#c9e8ff" ${spL}/>`
    +`<path d="M-80 -80 L-60 -40 M-30 -80 L-14 -48 M40 -82 L58 -46" stroke="#fff" stroke-width="5" opacity=".7" stroke-linecap="round"/>`
    +`<path d="${starPath(-40,-50,9)}" fill="${spGold}" ${st('#2b2235',2)}/><path d="${heartPath(20,-58,9)}" fill="#ff8cc6" ${st('#2b2235',2)}/><circle cx="70" cy="-54" r="8" fill="#8ff0d0" ${st('#2b2235',2)}/>`
    +`<rect x="-116" y="-104" width="232" height="12" rx="4" fill="#8a5e35" ${spL}/>`},
  velvetRope:{name:'Velvet Rope',price:12,box:'-130 -112 260 120',d:()=>`<ellipse cx="0" cy="-3" rx="120" ry="8" fill="#00000030"/>`
    +`<path d="M-96 -86 Q0 -30 96 -86" fill="none" stroke="#2b2235" stroke-width="15" stroke-linecap="round"/><path d="M-96 -86 Q0 -30 96 -86" fill="none" stroke="#c8344a" stroke-width="9" stroke-linecap="round"/>`
    +[-100,100].map(x=>`<ellipse cx="${x}" cy="-8" rx="20" ry="7" fill="${spGold}" ${spL}/><rect x="${x-6}" y="-92" width="12" height="84" fill="${spGold}" ${spL}/><circle cx="${x}" cy="-96" r="10" fill="${spGold}" ${spL}/>`).join('')},
  museumBench:{name:'Museum Bench',price:15,box:'-112 -76 224 84',d:()=>`<ellipse cx="0" cy="-3" rx="104" ry="8" fill="#00000030"/>`
    +[-80,80].map(x=>`<rect x="${x-8}" y="-46" width="16" height="44" fill="#6b4630" ${spL}/>`).join('')
    +`<rect x="-104" y="-66" width="208" height="24" rx="10" fill="#a97cff" ${spL}/>`+[-60,-20,20,60].map(x=>`<circle cx="${x}" cy="-54" r="3" fill="#ddd0ff"/>`).join('')},
  dinoBones:{name:'Dino Bones',price:35,box:'-150 -232 300 240',d:()=>{const b=`fill="#fbf2e6" stroke="#2b2235" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
    return `<ellipse cx="0" cy="-3" rx="130" ry="9" fill="#00000030"/><rect x="-126" y="-20" width="252" height="18" rx="6" fill="#8a5e35" ${spL}/>`
    +[-50,40].map(x=>`<path d="M${x} -20 V-70" stroke="#c9cfe0" stroke-width="5"/>`).join('')
    // legs, tail and neck as thick bones, then ribs, then the friendly skull
    +`<path d="M-62 -82 L-70 -24 M-36 -84 L-30 -24 M30 -86 L22 -24 M56 -84 L62 -24" stroke="#2b2235" stroke-width="13" stroke-linecap="round"/><path d="M-62 -82 L-70 -24 M-36 -84 L-30 -24 M30 -86 L22 -24 M56 -84 L62 -24" stroke="#fbf2e6" stroke-width="7" stroke-linecap="round"/>`
    +`<path d="M-70 -96 Q-110 -96 -140 -60" fill="none" stroke="#2b2235" stroke-width="13" stroke-linecap="round"/><path d="M-70 -96 Q-110 -96 -140 -60" fill="none" stroke="#fbf2e6" stroke-width="7" stroke-linecap="round" stroke-dasharray="10 4"/>`
    +`<path d="M66 -100 Q96 -150 96 -186" fill="none" stroke="#2b2235" stroke-width="13" stroke-linecap="round"/><path d="M66 -100 Q96 -150 96 -186" fill="none" stroke="#fbf2e6" stroke-width="7" stroke-linecap="round" stroke-dasharray="10 4"/>`
    +`<path d="M-76 -96 Q0 -112 72 -98" fill="none" stroke="#2b2235" stroke-width="12" stroke-linecap="round"/><path d="M-76 -96 Q0 -112 72 -98" fill="none" stroke="#fbf2e6" stroke-width="6" stroke-linecap="round"/>`
    +[-50,-26,-2,22,46].map(x=>`<path d="M${x} -104 Q${x-6} -80 ${x} -66" fill="none" ${b}/>`).join('')
    +`<path d="M80 -206 Q86 -224 110 -222 Q140 -218 140 -200 Q138 -184 112 -182 L88 -184 Q78 -190 80 -206Z" ${b}/>`
    +`<circle cx="104" cy="-206" r="6" fill="#2b2235"/><circle cx="106" cy="-208" r="2" fill="#fff"/><path d="M116 -192 Q126 -188 134 -194" fill="none" stroke="#2b2235" stroke-width="3" stroke-linecap="round"/><circle cx="124" cy="-198" r="4" fill="#ffc1dc"/>`;}},
  wallCase:{name:'Wall Case',price:20,wall:1,shelf:{w:220,top:44},box:'-125 -222 250 224',d:()=>`<rect x="-112" y="-214" width="224" height="174" rx="8" fill="${spGold}" ${spL}/>`
    +`<rect x="-102" y="-204" width="204" height="160" rx="4" fill="#4a3a6e"/>`+[-70,0,70].map(x=>`<path d="${starPath(x,-190,5)}" fill="${spGold}" opacity=".7"/>`).join('')+shelfArt(230)},
  goldFrame:{name:'Gold Frame',price:15,wall:1,box:'-80 -190 160 190',d:()=>`<rect x="-72" y="-182" width="144" height="170" rx="8" fill="${spGold}" ${spL5}/>`
    +`<rect x="-58" y="-168" width="116" height="142" fill="${spGoldDk}" ${spL}/><rect x="-52" y="-162" width="104" height="130" fill="#1b2350"/>`
    +`<path d="M-52 -60 Q-20 -84 10 -62 T52 -70 V-32 H-52Z" fill="#3b2f6e"/><circle cx="22" cy="-128" r="16" fill="#fff3c4"/><circle cx="30" cy="-132" r="14" fill="#1b2350"/>`
    +`<path d="${starPath(-26,-120,8)}" fill="${spGold}"/><circle cx="-36" cy="-90" r="2.5" fill="#fff"/><circle cx="38" cy="-90" r="2" fill="#fff"/>`
    +[[-72,-182],[72,-182],[-72,-12],[72,-12]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="${spGold}" ${spL}/>`).join('')},
  spotlight:{name:'Spotlight',price:12,wall:1,box:'-70 -210 140 210',d:()=>`<path d="M-16 -178 L-62 -6 H62 L16 -178Z" fill="#fff3c4" opacity=".28"/>`
    +`<rect x="-30" y="-206" width="60" height="10" rx="4" fill="#3b2f52" ${spL}/><path d="M0 -196 V-188" stroke="#2b2235" stroke-width="5"/>`
    +`<path d="M-20 -190 H20 L26 -170 H-26Z" fill="#3b2f52" ${spL}/><ellipse cx="0" cy="-170" rx="24" ry="6" fill="#fff3c4" ${spL}/>`},
  museumPlaque:{name:'Museum Plaque',price:6,wall:1,box:'-104 -62 208 62',d:()=>`<rect x="-98" y="-56" width="196" height="48" rx="8" fill="${spGold}" ${spL}/>`
    +`<rect x="-90" y="-48" width="180" height="32" rx="5" fill="none" stroke="${spGoldDk}" stroke-width="2.5"/>`
    +`<text x="0" y="-26" text-anchor="middle" font-size="16" font-weight="900" fill="#4a3320" font-family="sans-serif">⭐ My Collection</text>`}
});
NIGHT_GLOW.spotlight={y:-60,r:110,c:'warm'};
// 🏛️ the Museum theme chip (listed before 🌳 Outdoor and ⭐ Dreams, like the packs' chips)
{const y=THEMES.yard,d=THEMES.dream; delete THEMES.yard; delete THEMES.dream;
  Object.assign(THEMES,{museum:{icon:'🏛️',name:'Museum'},yard:y,dream:d});}
const SP_MUSEUM=['pedestal','tallPedestal','museumCounter','velvetRope','museumBench','dinoBones','wallCase','goldFrame','spotlight','museumPlaque'];
SP_MUSEUM.forEach(k=>(THEME_OF['decor:'+k]=THEME_OF['decor:'+k]||[]).push('museum'));
(THEME_OF['decor:dinoBones']).push('dino');
SPY_THEME_WORDS.museum='for a museum';

/* ---------- stickers ---------- */
const spOwnsAny=(p,pre)=>p.owned.some(k=>String(k).startsWith(pre))?1:0;
STICKERS.push(
  stk('petHome','room','🏠','Home Sweet Home','heart','Get a new home for your pet (tap your pet, then 🏠 Home)',1,p=>spOwnsAny(p,'pethome:')),
  stk('backdrop','stage','🎨','Set Designer','star','Get a new Stage backdrop (under the song list)',1,p=>spOwnsAny(p,'backdrop:')),
  stk('museum3','room','🏛️','Museum Maker','scallop','Put 3 museum pieces in your rooms',3,p=>allItems(p).filter(i=>i.placed&&SP_MUSEUM.includes(i.type)).length)
);
