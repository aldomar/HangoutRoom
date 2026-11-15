'use strict';
/* =========================================================
   2. ART HELPERS
   ========================================================= */
function st(c,w){return `stroke="${c||'#4a3a5c'}" stroke-width="${w||3}" stroke-linejoin="round" stroke-linecap="round"`;}
function starPath(cx,cy,r,ri){ri=ri||r*0.45;let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?ri:r;d+=(i?'L':'M')+(cx+Math.cos(a)*rr).toFixed(1)+' '+(cy+Math.sin(a)*rr).toFixed(1);}return d+'Z';}
function heartPath(cx,cy,s){return `M${cx} ${cy+s*0.9} C${cx-s*1.6} ${cy-s*0.1} ${cx-s*0.9} ${cy-s*1.3} ${cx} ${cy-s*0.45} C${cx+s*0.9} ${cy-s*1.3} ${cx+s*1.6} ${cy-s*0.1} ${cx} ${cy+s*0.9}Z`;}

function buildDefs(){
  const rainbow=['#ff6b8a','#ffa94d','#ffe066','#69db7c','#4dabf7','#b197fc'];
  $('#gdefs').innerHTML=`
  <filter id="fuzz" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd0ff"/><stop offset="1" stop-color="#e0f6ff"/></linearGradient>
  <pattern id="stripeBP" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#1f1a26"/><rect y="5" width="10" height="5" fill="#9b5de5"/></pattern>
  <pattern id="stripeBW" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#1f1a26"/><rect y="5" width="10" height="5" fill="#f4f0f8"/></pattern>
  <pattern id="rainbowS" width="10" height="30" patternUnits="userSpaceOnUse">${rainbow.map((c,i)=>`<rect y="${i*5}" width="10" height="5" fill="${c}"/>`).join('')}</pattern>
  <pattern id="plaid" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#c2253f"/><rect y="5" width="16" height="5" fill="#1f1a26" opacity=".55"/><rect x="5" width="5" height="16" fill="#1f1a26" opacity=".55"/><rect y="13" width="16" height="1" fill="#ffd166" opacity=".6"/><rect x="13" width="1" height="16" fill="#ffd166" opacity=".6"/></pattern>
  <pattern id="plaidP" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#6d3fd6"/><rect y="5" width="16" height="5" fill="#1f1a26" opacity=".55"/><rect x="5" width="5" height="16" fill="#1f1a26" opacity=".55"/><rect y="13" width="16" height="1" fill="#ff8cc6" opacity=".8"/><rect x="13" width="1" height="16" fill="#ff8cc6" opacity=".8"/></pattern>
  <pattern id="pDots" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="4" fill="#fff" opacity=".45"/><circle cx="45" cy="45" r="4" fill="#fff" opacity=".45"/></pattern>
  <pattern id="pStars" width="110" height="110" patternUnits="userSpaceOnUse"><path d="${starPath(22,26,7)}" fill="#fff" opacity=".85"/><path d="${starPath(76,72,10)}" fill="#ffd166" opacity=".9"/><circle cx="62" cy="18" r="2.2" fill="#fff"/><circle cx="96" cy="36" r="1.7" fill="#fff"/><circle cx="30" cy="88" r="2" fill="#fff" opacity=".7"/></pattern>
  <pattern id="pHearts" width="70" height="70" patternUnits="userSpaceOnUse"><path d="${heartPath(18,18,8)}" fill="#fff" opacity=".5"/><path d="${heartPath(53,53,6)}" fill="#ff8cc6" opacity=".6"/></pattern>
  <pattern id="pCheck" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#ffffff16"/><rect x="30" y="30" width="30" height="30" fill="#ffffff16"/></pattern>
  <pattern id="pPlanks" width="240" height="46" patternUnits="userSpaceOnUse"><rect y="43" width="240" height="3" fill="#00000026"/><rect x="160" width="3" height="46" fill="#0000001c"/><path d="M20 20 Q60 14 100 22" stroke="#00000012" stroke-width="3" fill="none"/></pattern>
  <pattern id="pFluff" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="4" fill="#fff" opacity=".22"/><circle cx="19" cy="19" r="4" fill="#fff" opacity=".22"/></pattern>
  <pattern id="pTiles" width="70" height="70" patternUnits="userSpaceOnUse"><rect width="35" height="35" fill="#26212e"/><rect x="35" y="35" width="35" height="35" fill="#26212e"/></pattern>
  <pattern id="pTurf" width="100" height="10" patternUnits="userSpaceOnUse"><rect width="50" height="10" fill="#ffffff1c"/></pattern>
  <linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151033"/><stop offset="1" stop-color="#4b3a80"/></linearGradient>
  <linearGradient id="gCandy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc9e4"/><stop offset="1" stop-color="#d9c6ff"/></linearGradient>
  <linearGradient id="gSpooky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1b4a"/><stop offset="1" stop-color="#7a4fa8"/></linearGradient>
  <radialGradient id="gGold" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#fff4c2"/><stop offset=".55" stop-color="#ffd166"/><stop offset="1" stop-color="#e09a2d"/></radialGradient>
  <linearGradient id="gHolo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9fd0"/><stop offset=".3" stop-color="#ffe9a8"/><stop offset=".55" stop-color="#8ff0d0"/><stop offset=".8" stop-color="#a9c8ff"/><stop offset="1" stop-color="#c9a7ff"/></linearGradient>`+EXTRA_DEFS.join('');
}
// Content packs add their own patterns/gradients here (strings of SVG defs). buildDefs() runs at startup, after every file has loaded.
const EXTRA_DEFS=[];
