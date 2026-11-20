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
  cocoa:{name:'Cocoa',c:'#c9a184',e:'#ffb0c0',price:10},
  // v1.20 (Buddies): three more free colors that suit every buddy.
  sky:{name:'Sky',c:'#c4e2ff',e:'#ff9fc4',price:0},
  ginger:{name:'Ginger',c:'#ffc59a',e:'#ff9fb0',price:0},
  stone:{name:'Stone',c:'#cfcbd8',e:'#ffa8c8',price:0}
};
// A fur color a little darker (k<0) or lighter (k>0), for puppy ears.
function bdShade(hex,k){const n=parseInt(hex.slice(1),16),c=[n>>16,n>>8&255,n&255].map(v=>Math.round(k<0?v*(1+k):v+(255-v)*k));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');}
// Buddies (v1.20): every buddy has the same body, so every outfit fits every buddy. Only the ears (back = behind the
// head, front = over it) and a tail change. Ids are saved in look.kind: never rename them.
const BUDDIES={
  bunny:{name:'Bunny',back:(f,l)=>`<g ${st(l)} fill="${f.c}"><ellipse cx="74" cy="40" rx="17" ry="40" transform="rotate(-14 74 70)"/><ellipse cx="126" cy="40" rx="17" ry="40" transform="rotate(14 126 70)"/></g>`
    +`<g fill="${f.e}"><ellipse cx="74" cy="44" rx="8" ry="27" transform="rotate(-14 74 70)"/><ellipse cx="126" cy="44" rx="8" ry="27" transform="rotate(14 126 70)"/></g>`},
  bear:{name:'Bear Cub',back:(f,l)=>[58,142].map(x=>`<circle cx="${x}" cy="50" r="20" fill="${f.c}" ${st(l)}/><circle cx="${x}" cy="52" r="10" fill="${f.e}"/>`).join('')},
  puppy:{name:'Puppy',front:(f,l)=>{const ear=bdShade(f.c,f.c==='#3d3547'?.2:-.16);
    return [0,1].map(k=>`<path d="M64 56 C44 52 28 80 33 118 C35 134 51 136 57 121 C63 100 67 80 64 56Z" fill="${ear}" ${st(l)}${k?' transform="translate(200 0) scale(-1 1)"':''}/>`).join('');}},
  dino:{name:'Little Dino',back:(f,l)=>`<path d="M68 54 L78 22 L92 46Z M89 45 L100 10 L111 45Z M108 46 L122 22 L132 54Z" fill="${f.e}" ${st(l)}/>`,
    tail:(f,l)=>`<path d="M132 198 C160 202 184 214 196 242 C172 236 150 230 132 226Z" fill="${f.c}" ${st(l)}/><path d="M148 203 L155 190 L161 207Z M166 210 L175 199 L178 216Z" fill="${f.e}" ${st(l)}/>`},
  fox:{name:'Fox',back:(f,l)=>[0,1].map(k=>`<g${k?' transform="translate(200 0) scale(-1 1)"':''}><path d="M46 82 L52 12 L98 50Z" fill="${f.c}" ${st(l)}/><path d="M57 64 L60 30 L84 52Z" fill="${f.e}"/></g>`).join(''),
    tail:(f,l)=>`<path d="M132 204 C168 206 190 182 184 146 C180 128 164 124 158 138 C170 158 158 182 132 188Z" fill="${f.c}" ${st(l)}/><path d="M184 146 C180 128 164 124 158 138 C166 144 176 148 184 146Z" fill="#fff" ${st(l)}/>`}
};
// Face styles (v1.20), all free. Ids are saved in look.face: never rename them.
const FACES={sparkle:{name:'Sparkly'},bright:{name:'Bright Smile'},cheeky:{name:'Cheeky Grin'}};
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

// Hair colors (v1.11): bought once (owned 'hairc:<id>') and used with every style. s = a streak color.
// Ids are saved: never rename them.
const HAIR_COLORS={
  black:{name:'Black',c:'#2a2230',price:0}, brown:{name:'Brown',c:'#6b4630',price:0},
  purple:{name:'Purple',c:'#7c4ddb',price:10}, pink:{name:'Pink',c:'#ff6fae',price:10}, blonde:{name:'Blonde',c:'#f2c75c',price:10},
  mint:{name:'Mint',c:'#7fdcbc',price:10}, sky:{name:'Sky Blue',c:'#7fb8ff',price:10}, snow:{name:'Snow White',c:'#f6f2fa',price:10},
  streak:{name:'Pink Streak',c:'#2a2230',s:'#ff6fae',price:20}, candy:{name:'Cotton Candy',c:'#c9a7ff',s:'#ff9fd0',price:20}
};
const HL=st('#1a1320',2.5);
const hShine=d=>`<path d="${d}" stroke="#fff" stroke-opacity=".25" stroke-width="4" fill="none" stroke-linecap="round"/>`;
const hStreak=(H,d)=>H.s?`<path d="${d}" stroke="${H.s}" stroke-width="7" fill="none" stroke-linecap="round"/>`:'';
// The hair a look really shows: old colored-swoop ids (LEGACY_HAIR, section 1) become Emo Swoop in that color.
function hairIds(L){let h=L.hair,c=L.hairColor;if(LEGACY_HAIR[h]){c=LEGACY_HAIR[h];h='swoopBlack';}return {h,c:HAIR_COLORS[c]?c:'black'};}
const CLOSET={
  kind:{label:'Buddy',icon:'🐾',vb:'0 0 200 270',items:Object.entries(BUDDIES).map(([id,b])=>({id,name:b.name,price:0,d:none}))},
  fur:{label:'Fur',icon:'🎨',vb:'0 0 200 270',items:Object.entries(FUR).map(([id,f])=>({id,name:f.name,price:f.price,d:none}))},
  face:{label:'Face',icon:'😊',vb:'38 60 124 76',items:Object.entries(FACES).map(([id,f])=>({id,name:f.name,price:0,d:none}))},
  // Hair (v1.11): each item is a STYLE; the color comes from look.hairColor (HAIR_COLORS). d = in front of the head,
  // b = behind the head and body (long hair). fur:1 styles are made of fur, so the hair color doesn't change them.
  hair:{label:'Hair',icon:'💇',vb:'0 0 200 230',items:[
    {id:'none',name:'No Bangs',price:0,fur:1,d:none},
    {id:'tuft',name:'Fluffy Tuft',price:0,fur:1,d:(f,l)=>`<path d="M86 50 Q86 28 98 40 Q102 22 110 40 Q122 30 118 52 Z" fill="${f.c}" ${st(l)}/>`},
    {id:'swoopBlack',name:'Emo Swoop',price:0,d:(f,l,H)=>swoop(H.c,hStreak(H,'M58 77 C76 58 102 50 124 56 C134 62 134 76 128 92'))},
    {id:'bob',name:'Short Bob',price:15,b:(f,l,H)=>`<path d="M32 92 Q28 152 60 152 H140 Q172 152 168 92 Q166 32 100 32 Q34 32 32 92Z" fill="${H.c}" ${HL}/>`,
      d:(f,l,H)=>`<path d="M44 86 Q44 42 100 40 Q156 42 156 86 L146 80 L134 86 L122 79 L110 86 L100 80 L90 86 L78 79 L66 86 L54 80Z" fill="${H.c}" ${HL}/>`+hShine('M66 56 Q100 44 134 56')+hStreak(H,'M72 50 Q78 66 74 80')},
    {id:'pigtails',name:'Pigtails',price:15,b:(f,l,H)=>[1,-1].map(k=>`<g transform="${k<0?'translate(200 0) scale(-1 1)':''}"><ellipse cx="36" cy="128" rx="15" ry="36" fill="${H.c}" ${HL} transform="rotate(16 36 100)"/></g>`).join(''),
      d:(f,l,H)=>`<path d="M46 84 C50 50 90 38 120 44 C140 48 154 62 156 84 C140 70 120 64 104 66 C92 74 70 80 46 84Z" fill="${H.c}" ${HL}/>`+hShine('M70 54 Q96 44 124 50')+hStreak(H,'M96 46 Q108 56 112 66')
        +[46,154].map(x=>`<g fill="#ff8cc6" ${st('#c8578f',2)}><path d="M${x} 92 l-11 -7 v14Z"/><path d="M${x} 92 l11 -7 v14Z"/><circle cx="${x}" cy="92" r="4"/></g>`).join('')},
    {id:'waves',name:'Long Waves',price:20,b:(f,l,H)=>`<path d="M38 84 Q22 150 34 214 Q46 204 56 216 Q66 204 76 214 H124 Q134 204 144 216 Q154 204 166 214 Q178 150 162 84 Q160 30 100 30 Q40 30 38 84Z" fill="${H.c}" ${HL}/>`,
      d:(f,l,H)=>`<path d="M46 86 C52 48 96 36 134 44 C150 50 158 66 156 86 C140 70 112 62 84 70 C70 76 56 82 46 86Z" fill="${H.c}" ${HL}/>`+hShine('M70 56 Q100 42 132 50')+hStreak(H,'M120 48 Q136 60 140 76')},
    {id:'spikes',name:'Emo Spikes',price:20,d:(f,l,H)=>`<path d="M42 88 L48 58 L58 70 L64 42 L76 62 L86 34 L96 58 L108 32 L116 58 L130 38 L134 62 L148 50 L150 72 L160 66 L156 90 Q132 70 100 70 Q68 70 42 88Z" fill="${H.c}" ${HL}/>`+hStreak(H,'M88 42 L95 62 M110 38 L113 60')},
    // Original anime-style twin tails: star clips, heart-dip bangs, tails that float out in a big curl.
    {id:'twinTails',name:'Starry Twin Tails',price:25,b:(f,l,H)=>[1,-1].map(k=>`<path transform="${k<0?'translate(200 0) scale(-1 1)':''}" d="M56 56 C12 26 -6 92 10 140 C22 178 6 218 24 258 C42 228 36 196 40 160 C44 120 34 92 62 74Z" fill="${H.c}" ${HL}/>`).join('')
        +hStreak(H,'M30 70 C12 110 26 150 20 200'),
      d:(f,l,H)=>`<path d="M46 86 Q46 44 100 42 Q154 44 154 86 Q138 74 124 80 Q112 66 100 78 Q88 66 76 80 Q62 74 46 86Z" fill="${H.c}" ${HL}/>`+hShine('M66 56 Q100 44 134 56')
        +`<path d="${starPath(54,60,10)} ${starPath(146,60,10)}" fill="#ffd166" ${st('#b8860b',2)}/>`},
    // Short styles (v1.20).
    {id:'buzz',name:'Buzz Cut',price:0,d:(f,l,H)=>`<path d="M46 84 Q46 40 100 40 Q154 40 154 84 Q150 70 138 65 Q120 58 100 58 Q80 58 62 65 Q50 70 46 84Z" fill="${H.c}" ${HL}/>`+hShine('M70 52 Q100 44 130 52')+hStreak(H,'M92 46 Q100 50 108 46')},
    {id:'messy',name:'Messy Mop',price:10,d:(f,l,H)=>`<path d="M44 90 L40 66 L54 70 L52 46 L68 56 L72 34 L86 50 L96 28 L106 48 L120 30 L126 52 L144 40 L142 62 L160 62 L154 90 Q146 74 130 74 L122 84 L112 72 L100 84 L90 72 L78 84 L68 74 Q54 78 44 90Z" fill="${H.c}" ${HL}/>`+hStreak(H,'M96 36 L100 60 M120 38 L118 60')},
    {id:'sidePart',name:'Side Part',price:15,d:(f,l,H)=>`<path d="M44 88 Q42 44 96 38 Q150 36 158 80 Q156 90 152 96 Q146 74 124 66 Q104 74 76 72 Q56 72 44 88Z" fill="${H.c}" ${HL}/><path d="M84 42 Q80 56 74 70" stroke="#00000033" stroke-width="3" fill="none" stroke-linecap="round"/>`+hShine('M98 46 Q128 44 146 62')+hStreak(H,'M110 44 Q132 52 140 70')}
  ]},
  top:{label:'Tops',icon:'👕',vb:'26 110 148 100',items:[
    {id:'none',name:'Just Fluff',price:0},
    {id:'tee',name:'Emo Band Tee',price:0,t:()=>`<path d="${TORSO}" fill="#24202b" ${st()}/><path d="M86 127 Q100 138 114 127" fill="none" stroke="#ff8cc6" stroke-width="3"/><path d="${starPath(100,160,14)}" fill="#ff8cc6"/><path d="${starPath(100,160,5.5)}" fill="#24202b"/>`,s:()=>sleeves('#24202b',26)},
    {id:'zip',name:'Emo Zip Hoodie',price:20,t:()=>`<path d="${TORSO}" fill="#2b2533" ${st()}/><line x1="100" y1="128" x2="100" y2="188" stroke="#c9c3d6" stroke-width="3" stroke-dasharray="3 2"/><path d="M90 128 v22 M110 128 v22" stroke="#ff8cc6" stroke-width="3"/><circle cx="90" cy="152" r="3" fill="#ff8cc6"/><circle cx="110" cy="152" r="3" fill="#ff8cc6"/><path d="${heartPath(78,170,6)}" fill="#ff8cc6"/>`,s:()=>sleeves('#2b2533',58)},
    {id:'stage',name:'Idol Stage Jacket',price:30,t:()=>`<path d="${TORSO}" fill="#6d3fd6" ${st()}/><rect x="92" y="127" width="16" height="61" fill="#24202b"/><path d="M92 127 V188 M108 127 V188" stroke="#ffd166" stroke-width="3"/>${[[74,145],[126,170],[80,176],[124,140]].map(([x,y])=>`<path d="${starPath(x,y,5)}" fill="#ffd166"/>`).join('')}`,s:()=>sleeves('#6d3fd6',56)+`<g stroke="#ffd166" stroke-width="4"><line x1="41" y1="180" x2="63" y2="180" transform="${LA}"/><line x1="137" y1="180" x2="159" y2="180" transform="${RA}"/></g>`},
    {id:'jersey',name:'Soccer Jersey',price:15,t:()=>`<path d="${TORSO}" fill="#ff7eb6" ${st()}/><path d="M88 127 L100 142 L112 127" fill="#fff" stroke="#fff" stroke-width="3"/><text x="100" y="179" text-anchor="middle" font-size="28" font-weight="900" font-family="Arial,sans-serif" fill="#fff" stroke="#c8578f" stroke-width="1">11</text>`,s:()=>sleeves('#ff7eb6',28)+`<g stroke="#fff" stroke-width="4"><line x1="42" y1="153" x2="62" y2="153" transform="${LA}"/><line x1="138" y1="153" x2="158" y2="153" transform="${RA}"/></g>`},
    {id:'hoodie',name:'Cozy Hoodie',price:15,t:()=>`<path d="${TORSO}" fill="#a7d8ff" ${st()}/><path d="M78 166 H122 L118 186 H82Z" fill="#8cc6f2" stroke="#4a3a5c" stroke-width="2"/><path d="M92 130 v18 M108 130 v18" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`,s:()=>sleeves('#a7d8ff',58)},
    {id:'cardi',name:'Fuzzy Cardigan',price:25,t:()=>`<path d="${TORSO}" fill="#fff" ${st()}/><path d="M60 160 Q60 126 94 126 L96 188 H60Z" fill="#c9b3ff" filter="url(#fuzz)"/><path d="M140 160 Q140 126 106 126 L104 188 H140Z" fill="#c9b3ff" filter="url(#fuzz)"/><circle cx="92" cy="150" r="2.5" fill="#ff8cc6"/><circle cx="92" cy="168" r="2.5" fill="#ff8cc6"/>`,s:()=>sleeves('#c9b3ff',58,' filter="url(#fuzz)"')},
    {id:'stripeTee',name:'Sky Stripe Tee',price:0,t:()=>`<path d="${TORSO}" fill="url(#stripeSky)" ${st()}/><path d="M86 127 Q100 138 114 127" fill="none" stroke="#2f5fae" stroke-width="3"/>`,s:()=>sleeves('url(#stripeSky)',26)}
  ]},
  bottom:{label:'Bottoms',icon:'👖',vb:'36 160 128 90',items:[
    {id:'none',name:'Nothing',price:0,d:none},
    {id:'plaid',name:'Plaid Skirt',price:0,d:()=>`<path d="M60 180 H140 L152 214 Q100 224 48 214 Z" fill="url(#plaid)" ${st()}/><path d="M66 190 Q92 204 120 189" stroke="#d6d2e0" stroke-width="2.5" fill="none" stroke-dasharray="4 3"/>`},
    {id:'plaidP',name:'Purple Plaid',price:15,d:()=>`<path d="M60 180 H140 L152 214 Q100 224 48 214 Z" fill="url(#plaidP)" ${st()}/><path d="M66 190 Q92 204 120 189" stroke="#d6d2e0" stroke-width="2.5" fill="none" stroke-dasharray="4 3"/>`},
    {id:'tutu',name:'Sparkle Tutu',price:20,d:()=>{let d='M60 180 H140 L158 210';for(let i=0;i<8;i++){const x=158-i*14.5;d+=` Q${(x-7.25).toFixed(1)} 222 ${(x-14.5).toFixed(1)} 210`;}d+='Z';return `<path d="${d}" fill="#ffb3d9" ${st()}/>`+[[72,200],[100,195],[128,202],[86,211],[116,211]].map(([x,y])=>`<path d="${starPath(x,y,4)}" fill="#fff"/>`).join('');}},
    {id:'shorts',name:'Soccer Shorts',price:10,d:()=>`<path d="M60 180 H140 L144 212 H104 L100 202 L96 212 H56Z" fill="#24202b" ${st()}/><path d="M60 184 L57 210 M140 184 L143 210" stroke="#ff7eb6" stroke-width="4"/>`},
    {id:'jeans',name:'Baggy Jeans',price:15,under:true,d:()=>`<path d="M60 180 H140 L142 240 H104 L100 206 L96 240 H58Z" fill="#6f8fd6" ${st()}/><path d="M100 184 V204" stroke="#4a5f9e" stroke-width="2"/>`},
    {id:'cargo',name:'Cargo Shorts',price:0,d:()=>`<path d="M60 180 H140 L144 214 H104 L100 202 L96 214 H56Z" fill="#b59a6b" ${st()}/><g fill="#a0855a" stroke="#6e5a3a" stroke-width="2"><rect x="60" y="192" width="16" height="13" rx="3"/><rect x="124" y="192" width="16" height="13" rx="3"/></g><path d="M60 186 H140" stroke="#6e5a3a" stroke-width="2"/>`}
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
    {id:'maryjanes',name:'Mary Janes',price:15,d:()=>mj(63)+mj(99)},
    {id:'hightops',name:'High-tops',price:0,d:()=>[62,98].map(x=>`<rect x="${x+5}" y="214" width="26" height="26" rx="8" fill="#5b8dff" ${st()}/>`+kick(x,'#5b8dff','#fff')+`<circle cx="${x+18}" cy="226" r="5" fill="#fff" ${st('#2f5fae',1.5)}/><path d="M${x+10} 220 h16 M${x+10} 233 h16" stroke="#fff" stroke-width="2.5"/>`).join('')}
  ]},
  acc:{label:'Extras',icon:'🎀',vb:'20 0 160 160',items:[
    {id:'none',name:'None',price:0,d:none},
    {id:'stars',name:'Star Clips',price:0,d:()=>`<path d="${starPath(64,66,10)}" fill="#ffd166" ${st('#b8860b',2)}/><path d="${starPath(82,54,7.5)}" fill="#ff8cc6" ${st('#c8578f',2)}/>`},
    {id:'bow',name:'Big Bow',price:10,d:()=>`<g fill="#ff6fae" ${st('#c8578f',2.5)}><path d="M100 46 L74 30 Q66 46 74 62 Z"/><path d="M100 46 L126 30 Q134 46 126 62 Z"/><circle cx="100" cy="46" r="7"/></g>`},
    {id:'headphones',name:'Headphones',price:20,d:()=>`<path d="M44 96 Q42 26 100 26 Q158 26 156 96" fill="none" stroke="#1f1a26" stroke-width="9" stroke-linecap="round"/><g fill="#ff8cc6" ${st('#1f1a26',3)}><rect x="30" y="76" width="24" height="38" rx="10"/><rect x="146" y="76" width="24" height="38" rx="10"/></g>`},
    {id:'tiara',name:'Idol Tiara',price:25,d:()=>`<path d="M74 52 L80 32 L90 45 L100 24 L110 45 L120 32 L126 52 Z" fill="#ffd166" ${st('#b8860b',2)}/><circle cx="100" cy="40" r="4" fill="#ff6fae"/><circle cx="84" cy="46" r="3" fill="#8ff0d0"/><circle cx="116" cy="46" r="3" fill="#8ff0d0"/>`},
    {id:'choker',name:'Heart Choker',price:15,d:()=>`<path d="M78 139 Q100 150 122 139" stroke="#1f1a26" stroke-width="7" fill="none" stroke-linecap="round"/><path d="${heartPath(100,152,5)}" fill="#ff6fae" ${st('#1f1a26',1.5)}/>`},
    {id:'batclip',name:'Bat Clip',price:15,d:()=>`<path d="M122 62 Q126 52 134 56 Q138 48 142 56 Q150 52 154 62 Q146 60 144 66 Q140 60 138 66 Q136 60 132 66 Q130 60 122 62Z" fill="#1f1a26" ${st('#000',1.5)}/><circle cx="135" cy="58" r="1.4" fill="#ff6fae"/><circle cx="141" cy="58" r="1.4" fill="#ff6fae"/>`},
    {id:'capBack',name:'Backwards Cap',price:0,d:()=>`<path d="M116 40 Q150 16 174 30 Q156 38 136 50Z" fill="#2f5fae" ${st('#1a1320',2.5)}/><path d="M48 74 Q48 32 100 30 Q152 32 152 74 Q100 60 48 74Z" fill="#5b8dff" ${st('#1a1320',2.5)}/><path d="M86 66 Q100 52 114 66" fill="#2f5fae" ${st('#1a1320',2)}/><circle cx="100" cy="31" r="4" fill="#2f5fae"/>`}
  ]}
};
EXTRA_DEFS.push(`<pattern id="stripeSky" width="10" height="12" patternUnits="userSpaceOnUse"><rect width="10" height="12" fill="#7fb8ff"/><rect y="6" width="10" height="6" fill="#f4f8ff"/></pattern>`);
const DEFAULT_LOOK={kind:'bunny',face:'sparkle',fur:'white',hair:'swoopBlack',hairColor:'black',top:'tee',bottom:'plaid',legs:'stripeBP',arms:'none',shoes:'boots',acc:'stars'};
function itemOf(cat,id){const list=CLOSET[cat].items;return list.find(i=>i.id===id)||list[0];}
function isOwned(p,cat,it){return !it.price||p.owned.includes(cat+':'+it.id);}

function face(dark,style){
  const ec=dark?'#0e0a12':'#2a1f33', lc=dark?'#fff':ec;
  const eye=x=>`<ellipse cx="${x}" cy="100" rx="8.5" ry="10.5" fill="${ec}"${dark?' stroke="#ffffff66" stroke-width="2"':''}/><circle cx="${x+3}" cy="95.5" r="3.4" fill="#fff"/><circle cx="${x-2.5}" cy="104.5" r="1.6" fill="#fff"/>`;
  const blush=o=>`<ellipse cx="65" cy="115" rx="9" ry="5" fill="#ff8fb8" opacity="${o}"/><ellipse cx="135" cy="115" rx="9" ry="5" fill="#ff8fb8" opacity="${o}"/>`, nose=`<path d="M96.5 108 h7 l-3.5 4z" fill="#ff8fb8"/>`;
  // Bright Smile (v1.20): no lashes, an open smile.
  if(style==='bright') return eye(80)+eye(120)+blush(.3)+nose+`<path d="M90 114 Q100 127 110 114Z" fill="#5a2a3a" stroke="${lc}" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="100" cy="120.5" rx="4.5" ry="2.5" fill="#ff8fb8"/>`;
  // Cheeky Grin (v1.20): eyebrows, a lopsided grin and one bunny tooth.
  if(style==='cheeky') return eye(80)+eye(120)+blush(.4)+nose+`<path d="M70 86 q9 -6 18 -2 M112 84 q9 -4 18 2" stroke="${lc}" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="96.5" y="115" width="6" height="5.5" rx="1.2" fill="#fff" stroke="${lc}" stroke-width="1.2"/><path d="M90 114 q12 6 21 -4" fill="none" stroke="${lc}" stroke-width="2.4" stroke-linecap="round"/>`;
  return eye(80)+eye(120)+`<path d="M71.5 94 l-6 -4 M128.5 94 l6 -4" stroke="${lc}" stroke-width="2.5" stroke-linecap="round"/>`+blush(.55)+nose+`<path d="M93 115.5 q3.5 4 7 0 q3.5 4 7 0" fill="none" stroke="${lc}" stroke-width="2.2" stroke-linecap="round"/>`;
}

function mascotSVG(L,vb,attrs){
  const f=FUR[L.fur]||FUR.white, dark=L.fur==='black', line=dark?'#15101b':'#4a3a5c';
  const top=itemOf('top',L.top), bot=itemOf('bottom',L.bottom);
  let s=`<svg viewBox="${vb||'0 0 200 270'}" xmlns="http://www.w3.org/2000/svg" ${attrs||''}>`;
  const bd=BUDDIES[L.kind]||BUDDIES.bunny; // old looks (and old photocards) have no kind: a bunny
  if(bd.back) s+=bd.back(f,line);
  const hi=hairIds(L), hair=itemOf('hair',hi.h), HC=HAIR_COLORS[hi.c];
  if(hair.b) s+=hair.b(f,line,HC); // long hair goes behind the head and body
  if(bd.tail) s+=bd.tail(f,line);
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
  if(bd.front) s+=bd.front(f,line);
  s+=face(dark,L.face);
  s+=hair.d(f,line,HC);
  s+=itemOf('acc',L.acc).d(f,line);
  return s+'</svg>';
}
