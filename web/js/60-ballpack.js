'use strict';
/* =========================================================
   60. BALL FIELD PACK (v1.60): baseball clothes and decorations
   A pack only ADDS entries to the lists from earlier sections. All ids below are saved: never rename them.
   Clothes are drawn in the mascot's 200 x 270 box. 2 of the ⚾ kit pieces on (BF_KIT in section 59: the cap, tee,
   pants, socks or the Soccer Cleats) = +1 coin a hit. Everything gets the ⚽ Sport theme chip (bpTheme) and photocard tags.
   Everything is for everyone: no "boy" or "girl".
   ========================================================= */
// theme chips for these items (section 33 builds THEME_OF from THEME_IDS when it loads; this adds to it)
const bpTheme=(th,keys)=>keys.forEach(k=>{(THEME_OF[k]=THEME_OF[k]||[]).push(th);});

/* ---------- closet ---------- */
CLOSET.acc.items.push(
  {id:'ballCap',name:'Baseball Cap',price:15,d:()=>`<path d="M48 76 Q48 32 100 30 Q152 32 152 76 Q100 62 48 76Z" fill="#5b8dff" ${st('#1a1320',2.5)}/>`
    +`<path d="M100 31 V64 M74 37 Q70 54 70 70 M126 37 Q130 54 130 70" stroke="#2f5fae" stroke-width="2" fill="none"/>`
    +`<path d="M44 76 Q100 58 156 76 Q152 90 100 86 Q48 90 44 76Z" fill="#2f5fae" ${st('#1a1320',2.5)}/>`
    +`<path d="${starPath(100,50,9,5)}" fill="#ffd166" ${st('#1a1320',1.5)}/><circle cx="100" cy="31" r="4" fill="#2f5fae"/>`}
);
CLOSET.top.items.push(
  {id:'ballTee',name:'Baseball Tee',price:20,t:()=>`<path d="${TORSO}" fill="#fbf7ff" ${st()}/><path d="M86 127 Q100 140 114 127" fill="none" stroke="#5b8dff" stroke-width="4"/>`
    +`<path d="M100 140 V188" stroke="#5b8dff" stroke-width="2" stroke-dasharray="3 4"/><path d="${starPath(82,160,8,5)}" fill="#ff8cc6" ${st('#c8578f',1.5)}/>`
    +`<text x="118" y="176" text-anchor="middle" font-size="22" font-weight="900" font-family="Arial,sans-serif" fill="#5b8dff">7</text>`,
    s:()=>sleeves('#5b8dff',30)}
);
CLOSET.bottom.items.push(
  {id:'ballPants',name:'Baseball Pants',price:15,under:true,d:()=>`<path d="M60 180 H140 L142 228 H104 L100 206 L96 228 H58Z" fill="#fbf7ff" ${st()}/>`
    +`<path d="M61 184 L59 226 M139 184 L141 226" stroke="#5b8dff" stroke-width="5"/><path d="M60 186 H140" stroke="#2b2235" stroke-width="5"/>`}
);
CLOSET.legs.items.push(
  {id:'ballSocks',name:'Baseball Socks',price:10,d:()=>`<g ${st()}><rect x="68" y="200" width="29" height="40" rx="8" fill="#5b8dff"/><rect x="103" y="200" width="29" height="40" rx="8" fill="#5b8dff"/></g>`
    +`<path d="M69 212 h27 M104 212 h27 M69 220 h27 M104 220 h27" stroke="#fbf7ff" stroke-width="4"/>`}
);

/* ---------- decorations ---------- */
const bpBall=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#2b2235" stroke-width="3"/><path d="M${x-r*0.55} ${y-r*0.75} Q${x-r*0.2} ${y} ${x-r*0.55} ${y+r*0.75} M${x+r*0.55} ${y-r*0.75} Q${x+r*0.2} ${y} ${x+r*0.55} ${y+r*0.75}" stroke="#ff5a6e" stroke-width="2.5" fill="none"/>`;
Object.assign(DECOR,{
  homePlate:{name:'Home Plate Rug',price:15,flat:1,box:'-120 -50 240 60',d:()=>`<ellipse cx="0" cy="-20" rx="114" ry="28" fill="#e0a96d" stroke="#2b2235" stroke-width="4"/>`
    +`<path d="M-30 -32 H30 V-20 L0 -8 L-30 -20Z" fill="#fff" stroke="#2b2235" stroke-width="3" stroke-linejoin="round"/>`
    +`<rect x="-88" y="-36" width="44" height="30" fill="none" stroke="#fff" stroke-width="3"/><rect x="44" y="-36" width="44" height="30" fill="none" stroke="#fff" stroke-width="3"/>`},
  ballBucket:{name:'Ball Bucket',price:15,yard:1,box:'-70 -150 140 160',d:()=>`<path d="M30 0 L52 -140 Q56 -150 62 -146 Q66 -140 62 -132 L38 2Z" fill="#e8b97a" stroke="#5a3a1e" stroke-width="4" stroke-linejoin="round"/>`
    +bpBall(-26,-66,14)+bpBall(2,-70,14)+bpBall(-12,-80,13)
    +`<path d="M-50 -62 L-42 0 H26 L34 -62Z" fill="#7cc8ff" stroke="#2b2235" stroke-width="4" stroke-linejoin="round"/><path d="M-48 -46 H32" stroke="#4a9fd8" stroke-width="5"/><path d="${starPath(-8,-26,9,5)}" fill="#ffd166"/>`},
  ballScoreboard:{name:'Ball Scoreboard',price:30,yard:1,box:'-125 -230 250 240',d:()=>`<path d="M-80 0 V-120 M80 0 V-120" stroke="#8b5a35" stroke-width="12" stroke-linecap="round"/>`
    +`<rect x="-112" y="-222" width="224" height="118" rx="10" fill="#2f5d50" stroke="#2b2235" stroke-width="4"/>`
    +`<text x="-52" y="-196" text-anchor="middle" font-size="16" font-weight="900" fill="#ffe9a8" font-family="Arial,sans-serif">HOME</text>`
    +`<text x="52" y="-196" text-anchor="middle" font-size="16" font-weight="900" fill="#ffe9a8" font-family="Arial,sans-serif">GUEST</text>`
    +`<rect x="-80" y="-186" width="56" height="44" rx="6" fill="#1d3a32"/><rect x="24" y="-186" width="56" height="44" rx="6" fill="#1d3a32"/>`
    +`<text x="-52" y="-151" text-anchor="middle" font-size="34" font-weight="900" fill="#ffd166" font-family="Arial,sans-serif">7</text>`
    +`<text x="52" y="-151" text-anchor="middle" font-size="34" font-weight="900" fill="#8ff0d0" font-family="Arial,sans-serif">5</text>`
    +[-60,-30,0,30,60].map((x,i)=>`<circle cx="${x}" cy="-120" r="5" fill="${i<3?'#ff8cc6':'#4a7a6c'}"/>`).join('')},
  ballLamp:{name:'Baseball Lamp',price:25,box:'-60 -210 120 220',d:()=>`<ellipse cx="0" cy="-4" rx="40" ry="9" fill="#5b8dff" stroke="#2b2235" stroke-width="4"/>`
    +`<path d="M-4 -8 L-10 -130 M4 -8 L10 -130" stroke="#e8b97a" stroke-width="8" stroke-linecap="round"/><path d="M0 -10 V-130" stroke="#5a3a1e" stroke-width="3"/>`
    +`<circle cx="0" cy="-160" r="42" fill="#fff8e0" stroke="#2b2235" stroke-width="4"/>`
    +`<path d="M-24 -192 Q-8 -160 -24 -128 M24 -192 Q8 -160 24 -128" stroke="#ff5a6e" stroke-width="3.5" fill="none" stroke-dasharray="5 4"/>`}
});
NIGHT_GLOW.ballLamp={y:-160,r:120,c:'warm'};

/* ---------- theme chips and photocards ---------- */
bpTheme('sport',['acc:ballCap','top:ballTee','bottom:ballPants','legs:ballSocks','decor:homePlate','decor:ballBucket','decor:ballScoreboard','decor:ballLamp']);
CARD_TAGS.sporty.push('acc:ballCap','top:ballTee','bottom:ballPants','legs:ballSocks');
