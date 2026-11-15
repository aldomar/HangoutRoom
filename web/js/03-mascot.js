'use strict';
/* =========================================================
   3. MASCOT (the fuzzy emo bunny) + CLOSET ITEMS
   Coordinates are in a 200 x 270 box.
   ========================================================= */
const FUR={
  white:{name:'Marshmallow',c:'#f8f4fb',e:'#ffb3cf',price:0},
  pink:{name:'Bubblegum',c:'#ffc9df',e:'#ff8fb8',price:0},
  lavender:{name:'Lavender',c:'#dccbff',e:'#ff9fd0',price:0},
  black:{name:'Midnight',c:'#3d3547',e:'#ff79b0',price:0},
  mint:{name:'Mint',c:'#c8f3e2',e:'#ffa8c8',price:0},
  cocoa:{name:'Cocoa',c:'#c9a184',e:'#ffb0c0',price:10}
};
const LA='rotate(20 52 136)', RA='rotate(-20 148 136)';
const TORSO='M60 160 Q60 126 94 126 H106 Q140 126 140 160 V188 H60 Z';
const SWOOP='M46 84 C52 50 86 36 118 42 C142 46 156 62 158 82 C150 74 140 70 130 70 C136 84 134 100 126 112 C122 96 112 82 98 74 C86 80 70 82 46 84 Z';

function sleeves(fill,len,extra){extra=extra||'';return `<g ${st()}><rect x="40" y="130" width="24" height="${len}" rx="11" fill="${fill}" transform="${LA}"${extra}/><rect x="136" y="130" width="24" height="${len}" rx="11" fill="${fill}" transform="${RA}"${extra}/></g>`;}
function lw(fill,rib){return `<g filter="url(#fuzz)" ${st()}><rect x="65" y="203" width="35" height="36" rx="11" fill="${fill}"/><rect x="100" y="203" width="35" height="36" rx="11" fill="${fill}"/></g>`+(rib?`<g stroke="${rib}" stroke-width="2" opacity=".6">${[0,1,2,3,4].map(i=>`<line x1="${72+i*6}" y1="208" x2="${72+i*6}" y2="234"/><line x1="${107+i*6}" y1="208" x2="${107+i*6}" y2="234"/>`).join('')}</g>`:'');}
function aw(fill){return `<g filter="url(#fuzz)" ${st()}><rect x="38" y="158" width="28" height="30" rx="11" fill="${fill}" transform="${LA}"/><rect x="134" y="158" width="28" height="30" rx="11" fill="${fill}" transform="${RA}"/></g>`;}
function swoop(c,extra){return `<path d="${SWOOP}" fill="${c}" ${st('#1a1320',2.5)}/><path d="M70 62 C88 50 110 48 128 56" stroke="#fff" stroke-opacity=".25" stroke-width="4" fill="none" stroke-linecap="round"/>`+(extra||'');}
const boot=x=>`<rect x="${x}" y="228" width="37" height="20" rx="9" fill="#2a2430" ${st('#111')}/><rect x="${x-3}" y="245" width="43" height="12" rx="4" fill="#111"/><path d="M${x+12} 233 h13 M${x+12} 239 h13" stroke="#ff8cc6" stroke-width="2.5"/>`;
const kick=(x,fill,sole,studs)=>`<path d="M${x} 238 Q${x} 228 ${x+12} 228 H${x+26} Q${x+40} 230 ${x+40} 248 H${x}Z" fill="${fill}" ${st()}/>`+(sole?`<rect x="${x}" y="244" width="40" height="7" rx="3" fill="${sole}"/>`:`<path d="M${x+6} 239 H${x+34}" stroke="#ff7eb6" stroke-width="4"/>`)+(studs?[6,18,30].map(o=>`<circle cx="${x+o}" cy="251" r="3" fill="#333"/>`).join(''):'');
const mj=x=>`<path d="M${x} 246 Q${x} 234 ${x+19} 234 Q${x+38} 234 ${x+38} 250 H${x}Z" fill="#1f1a26" ${st('#000',2)}/><path d="M${x+6} 238 L${x+32} 238" stroke="#ff8cc6" stroke-width="3"/><circle cx="${x+30}" cy="238" r="2.5" fill="#ffd166"/>`;
const none=()=>'';

const CLOSET={
  fur:{label:'Fur',icon:'🐰',vb:'0 0 200 270',items:Object.entries(FUR).map(([id,f])=>({id,name:f.name,price:f.price,d:none}))},
  hair:{label:'Hair',icon:'💇',vb:'30 10 140 120',items:[
    {id:'none',name:'No Bangs',price:0,d:none},
    {id:'tuft',name:'Fluffy Tuft',price:0,d:(f,l)=>`<path d="M86 50 Q86 28 98 40 Q102 22 110 40 Q122 30 118 52 Z" fill="${f.c}" ${st(l)}/>`},
    {id:'swoopBlack',name:'Emo Swoop',price:0,d:()=>swoop('#2a2230')},
    {id:'swoopPurple',name:'Purple Swoop',price:15,d:()=>swoop('#7c4ddb')},
    {id:'swoopPink',name:'Pink Swoop',price:15,d:()=>swoop('#ff6fae')},
    {id:'swoopStreak',name:'Pink Streak',price:20,d:()=>swoop('#2a2230',`<path d="M58 77 C76 58 102 50 124 56 C134 62 134 76 128 92" stroke="#ff6fae" stroke-width="7" fill="none" stroke-linecap="round"/>`)}
  ]},
  top:{label:'Tops',icon:'👕',vb:'26 110 148 100',items:[
    {id:'none',name:'Just Fluff',price:0},
    {id:'tee',name:'Emo Band Tee',price:0,t:()=>`<path d="${TORSO}" fill="#24202b" ${st()}/><path d="M86 127 Q100 138 114 127" fill="none" stroke="#ff8cc6" stroke-width="3"/><path d="${starPath(100,160,14)}" fill="#ff8cc6"/><path d="${starPath(100,160,5.5)}" fill="#24202b"/>`,s:()=>sleeves('#24202b',26)},
    {id:'zip',name:'Emo Zip Hoodie',price:20,t:()=>`<path d="${TORSO}" fill="#2b2533" ${st()}/><line x1="100" y1="128" x2="100" y2="188" stroke="#c9c3d6" stroke-width="3" stroke-dasharray="3 2"/><path d="M90 128 v22 M110 128 v22" stroke="#ff8cc6" stroke-width="3"/><circle cx="90" cy="152" r="3" fill="#ff8cc6"/><circle cx="110" cy="152" r="3" fill="#ff8cc6"/><path d="${heartPath(78,170,6)}" fill="#ff8cc6"/>`,s:()=>sleeves('#2b2533',58)},
    {id:'stage',name:'Idol Stage Jacket',price:30,t:()=>`<path d="${TORSO}" fill="#6d3fd6" ${st()}/><rect x="92" y="127" width="16" height="61" fill="#24202b"/><path d="M92 127 V188 M108 127 V188" stroke="#ffd166" stroke-width="3"/>${[[74,145],[126,170],[80,176],[124,140]].map(([x,y])=>`<path d="${starPath(x,y,5)}" fill="#ffd166"/>`).join('')}`,s:()=>sleeves('#6d3fd6',56)+`<g stroke="#ffd166" stroke-width="4"><line x1="41" y1="180" x2="63" y2="180" transform="${LA}"/><line x1="137" y1="180" x2="159" y2="180" transform="${RA}"/></g>`},
    {id:'jersey',name:'Soccer Jersey',price:15,t:()=>`<path d="${TORSO}" fill="#ff7eb6" ${st()}/><path d="M88 127 L100 142 L112 127" fill="#fff" stroke="#fff" stroke-width="3"/><text x="100" y="179" text-anchor="middle" font-size="28" font-weight="900" font-family="Arial,sans-serif" fill="#fff" stroke="#c8578f" stroke-width="1">11</text>`,s:()=>sleeves('#ff7eb6',28)+`<g stroke="#fff" stroke-width="4"><line x1="42" y1="153" x2="62" y2="153" transform="${LA}"/><line x1="138" y1="153" x2="158" y2="153" transform="${RA}"/></g>`},
    {id:'hoodie',name:'Cozy Hoodie',price:15,t:()=>`<path d="${TORSO}" fill="#a7d8ff" ${st()}/><path d="M78 166 H122 L118 186 H82Z" fill="#8cc6f2" stroke="#4a3a5c" stroke-width="2"/><path d="M92 130 v18 M108 130 v18" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,s:()=>sleeves('#a7d8ff',58)},
    {id:'cardi',name:'Fuzzy Cardigan',price:25,t:()=>`<path d="${TORSO}" fill="#fff" ${st()}/><path d="M60 160 Q60 126 94 126 L96 188 H60Z" fill="#c9b3ff" filter="url(#fuzz)"/><path d="M140 160 Q140 126 106 126 L104 188 H140Z" fill="#c9b3ff" filter="url(#fuzz)"/><circle cx="92" cy="150" r="2.5" fill="#ff8cc6"/><circle cx="92" cy="168" r="2.5" fill="#ff8cc6"/>`,s:()=>sleeves('#c9b3ff',58,' filter="url(#fuzz)"')}
  ]},
  bottom:{label:'Bottoms',icon:'👖',vb:'36 160 128 90',items:[
    {id:'none',name:'Nothing',price:0,d:none},
    {id:'plaid',name:'Plaid Skirt',price:0,d:()=>`<path d="M60 180 H140 L152 214 Q100 224 48 214 Z" fill="url(#plaid)" ${st()}/><path d="M66 190 Q92 204 120 189" stroke="#d6d2e0" stroke-width="2.5" fill="none" stroke-dasharray="4 3"/>`},
    {id:'plaidP',name:'Purple Plaid',price:15,d:()=>`<path d="M60 180 H140 L152 214 Q100 224 48 214 Z" fill="url(#plaidP)" ${st()}/><path d="M66 190 Q92 204 120 189" stroke="#d6d2e0" stroke-width="2.5" fill="none" stroke-dasharray="4 3"/>`},
    {id:'tutu',name:'Sparkle Tutu',price:20,d:()=>{let d='M60 180 H140 L158 210';for(let i=0;i<8;i++){const x=158-i*14.5;d+=` Q${(x-7.25).toFixed(1)} 222 ${(x-14.5).toFixed(1)} 210`;}d+='Z';return `<path d="${d}" fill="#ffb3d9" ${st()}/>`+[[72,200],[100,195],[128,202],[86,211],[116,211]].map(([x,y])=>`<path d="${starPath(x,y,4)}" fill="#fff"/>`).join('');}},
    {id:'shorts',name:'Soccer Shorts',price:10,d:()=>`<path d="M60 180 H140 L144 212 H104 L100 202 L96 212 H56Z" fill="#24202b" ${st()}/><path d="M60 184 L57 210 M140 184 L143 210" stroke="#ff7eb6" stroke-width="4"/>`},
    {id:'jeans',name:'Baggy Jeans',price:15,under:true,d:()=>`<path d="M60 180 H140 L142 240 H104 L100 206 L96 240 H58Z" fill="#6f8fd6" ${st()}/><path d="M100 184 V204" stroke="#4a5f9e" stroke-width="2"/>`}
  ]},
  legs:{label:'Leg Warmers',icon:'🧦',vb:'50 180 100 85',items:[
    {id:'none',name:'None',price:0,d:none},
    {id:'stripeBP',name:'Emo Stripes',price:0,d:()=>lw('url(#stripeBP)')},
    {id:'stripeBW',name:'Zebra Stripes',price:10,d:()=>lw('url(#stripeBW)')},
    {id:'pinkFuzz',name:'Pink Fluff',price:15,d:()=>lw('#ffb3d9','#e07fb0')},
    {id:'whiteFuzz',name:'Cloud Fluff',price:15,d:()=>lw('#fbf7ff','#cfc4dd')},
    {id:'blackFuzz',name:'Midnight Fluff',price:15,d:()=>lw('#2a2430','#4b4257')},
    {id:'rainbow',name:'Rainbow Fluff',price:25,d:()=>lw('url(#rainbowS)')},
    {id:'soccer',name:'Soccer Socks',price:10,d:()=>`<g ${st()}><rect x="68" y="196" width="29" height="44" rx="8" fill="#fff"/><rect x="103" y="196" width="29" height="44" rx="8" fill="#fff"/></g><path d="M69 205 h27 M104 205 h27" stroke="#ff7eb6" stroke-width="5"/>`}
  ]},
  arms:{label:'Arm Warmers',icon:'🧤',vb:'14 120 172 90',items:[
    {id:'none',name:'None',price:0,d:none},
    {id:'stripeBW',name:'Zebra Stripes',price:10,d:()=>aw('url(#stripeBW)')},
    {id:'stripeBP',name:'Emo Stripes',price:10,d:()=>aw('url(#stripeBP)')},
    {id:'pinkFuzz',name:'Pink Fluff',price:15,d:()=>aw('#ffb3d9')},
    {id:'blackFuzz',name:'Midnight Fluff',price:15,d:()=>aw('#2a2430')},
    {id:'lavFuzz',name:'Lavender Fluff',price:15,d:()=>aw('#c9b3ff')}
  ]},
  shoes:{label:'Shoes',icon:'👟',vb:'50 212 100 52',items:[
    {id:'none',name:'Bare Paws',price:0,d:(f,l)=>`<g fill="${f.c}" ${st(l)}><ellipse cx="82" cy="244" rx="17" ry="10"/><ellipse cx="118" cy="244" rx="17" ry="10"/></g>`},
    {id:'boots',name:'Platform Boots',price:0,d:()=>boot(64)+boot(99)},
    {id:'cleats',name:'Soccer Cleats',price:15,d:()=>kick(62,'#fff',null,true)+kick(98,'#fff',null,true)},
    {id:'sneakers',name:'Pastel Kicks',price:10,d:()=>kick(62,'#c9b3ff','#fff')+kick(98,'#c9b3ff','#fff')},
    {id:'maryjanes',name:'Mary Janes',price:15,d:()=>mj(63)+mj(99)}
  ]},
  acc:{label:'Extras',icon:'🎀',vb:'20 0 160 160',items:[
    {id:'none',name:'None',price:0,d:none},
    {id:'stars',name:'Star Clips',price:0,d:()=>`<path d="${starPath(64,66,10)}" fill="#ffd166" ${st('#b8860b',2)}/><path d="${starPath(82,54,7.5)}" fill="#ff8cc6" ${st('#c8578f',2)}/>`},
    {id:'bow',name:'Big Bow',price:10,d:()=>`<g fill="#ff6fae" ${st('#c8578f',2.5)}><path d="M100 46 L74 30 Q66 46 74 62 Z"/><path d="M100 46 L126 30 Q134 46 126 62 Z"/><circle cx="100" cy="46" r="7"/></g>`},
    {id:'headphones',name:'Headphones',price:20,d:()=>`<path d="M44 96 Q42 26 100 26 Q158 26 156 96" fill="none" stroke="#1f1a26" stroke-width="9" stroke-linecap="round"/><g fill="#ff8cc6" ${st('#1f1a26',3)}><rect x="30" y="76" width="24" height="38" rx="10"/><rect x="146" y="76" width="24" height="38" rx="10"/></g>`},
    {id:'tiara',name:'Idol Tiara',price:25,d:()=>`<path d="M74 52 L80 32 L90 45 L100 24 L110 45 L120 32 L126 52 Z" fill="#ffd166" ${st('#b8860b',2)}/><circle cx="100" cy="40" r="4" fill="#ff6fae"/><circle cx="84" cy="46" r="3" fill="#8ff0d0"/><circle cx="116" cy="46" r="3" fill="#8ff0d0"/>`},
    {id:'choker',name:'Heart Choker',price:15,d:()=>`<path d="M78 139 Q100 150 122 139" stroke="#1f1a26" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${heartPath(100,152,5)}" fill="#ff6fae" ${st('#1f1a26',1.5)}/>`},
    {id:'batclip',name:'Bat Clip',price:15,d:()=>`<path d="M122 62 Q126 52 134 56 Q138 48 142 56 Q150 52 154 62 Q146 60 144 66 Q140 60 138 66 Q136 60 132 66 Q130 60 122 62Z" fill="#1f1a26" ${st('#000',1.5)}/><circle cx="135" cy="58" r="1.4" fill="#ff6fae"/><circle cx="141" cy="58" r="1.4" fill="#ff6fae"/>`}
  ]}
};
const DEFAULT_LOOK={fur:'white',hair:'swoopBlack',top:'tee',bottom:'plaid',legs:'stripeBP',arms:'none',shoes:'boots',acc:'stars'};
function itemOf(cat,id){const list=CLOSET[cat].items;return list.find(i=>i.id===id)||list[0];}
function isOwned(p,cat,it){return !it.price||p.owned.includes(cat+':'+it.id);}

function face(dark){
  const ec=dark?'#0e0a12':'#2a1f33', lc=dark?'#fff':ec;
  const eye=x=>`<ellipse cx="${x}" cy="100" rx="8.5" ry="10.5" fill="${ec}"${dark?' stroke="#ffffff66" stroke-width="2"':''}/><circle cx="${x+3}" cy="95.5" r="3.4" fill="#fff"/><circle cx="${x-2.5}" cy="104.5" r="1.6" fill="#fff"/>`;
  return eye(80)+eye(120)+`<path d="M71.5 94 l-6 -4 M128.5 94 l6 -4" stroke="${lc}" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="65" cy="115" rx="9" ry="5" fill="#ff8fb8" opacity=".55"/><ellipse cx="135" cy="115" rx="9" ry="5" fill="#ff8fb8" opacity=".55"/><path d="M96.5 108 h7 l-3.5 4z" fill="#ff8fb8"/><path d="M93 115.5 q3.5 4 7 0 q3.5 4 7 0" fill="none" stroke="${lc}" stroke-width="2.2" stroke-linecap="round"/>`;
}

function mascotSVG(L,vb,attrs){
  const f=FUR[L.fur]||FUR.white, dark=L.fur==='black', line=dark?'#15101b':'#4a3a5c';
  const top=itemOf('top',L.top), bot=itemOf('bottom',L.bottom);
  let s=`<svg viewBox="${vb||'0 0 200 270'}" xmlns="http://www.w3.org/2000/svg" ${attrs||''}>`;
  s+=`<g ${st(line)} fill="${f.c}"><ellipse cx="74" cy="40" rx="17" ry="40" transform="rotate(-14 74 70)"/><ellipse cx="126" cy="40" rx="17" ry="40" transform="rotate(14 126 70)"/></g>`;
  s+=`<g fill="${f.e}"><ellipse cx="74" cy="44" rx="8" ry="27" transform="rotate(-14 74 70)"/><ellipse cx="126" cy="44" rx="8" ry="27" transform="rotate(14 126 70)"/></g>`;
  s+=`<g ${st(line)} fill="${f.c}"><rect x="70" y="186" width="25" height="56" rx="12"/><rect x="105" y="186" width="25" height="56" rx="12"/></g>`;
  s+=`<rect x="60" y="126" width="80" height="84" rx="32" fill="${f.c}" ${st(line)}/><ellipse cx="100" cy="178" rx="24" ry="22" fill="#fff" opacity=".3"/>`;
  if(bot.under) s+=bot.d(f,line);
  s+=itemOf('legs',L.legs).d(f,line);
  s+=itemOf('shoes',L.shoes).d(f,line);
  if(!bot.under) s+=bot.d(f,line);
  if(top.t) s+=top.t(f);
  s+=`<g ${st(line)} fill="${f.c}"><rect x="40" y="130" width="24" height="60" rx="12" transform="${LA}"/><rect x="136" y="130" width="24" height="60" rx="12" transform="${RA}"/></g>`;
  if(top.s) s+=top.s(f);
  s+=itemOf('arms',L.arms).d(f,line);
  s+=`<ellipse cx="100" cy="92" rx="58" ry="50" fill="${f.c}" ${st(line)}/>`;
  s+=face(dark);
  s+=itemOf('hair',L.hair).d(f,line);
  s+=itemOf('acc',L.acc).d(f,line);
  return s+'</svg>';
}
