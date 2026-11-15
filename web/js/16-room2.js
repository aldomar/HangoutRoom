'use strict';
/* =========================================================
   16. COZY LOFT: the second room (v1.10)
   Saved in p.room2 {wall, floor, items}; switched with the 🪜 Loft / 🏠 Room button (goRoom in section 9).
   Same 1000 x 700 box as her room. Fuzzy hangs out in whichever room is showing.
   The Stage marquee hangs on the Loft wall (since v1.12; it used to be above the closet downstairs).
   The computer desk opens the Code Lab (section 18, since v1.13).
   ========================================================= */
// A free wall made for the Loft (it can be used in her room too). Wall ids are saved: never rename.
WALLS.attic={name:'Attic Boards',price:0,fill:'#efd6b8',pat:'pBoards'};
EXTRA_DEFS.push(`<pattern id="pBoards" width="84" height="470" patternUnits="userSpaceOnUse"><rect x="81" width="3" height="470" fill="#00000018"/><circle cx="42" cy="120" r="2.5" fill="#00000014"/><circle cx="20" cy="330" r="2" fill="#00000012"/></pattern>`
  +`<radialGradient id="gMoonSky" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#3d3170"/><stop offset="1" stop-color="#171236"/></radialGradient>`);

function loftFurniture(){
  const wood='#9b6a42', dark='#6e4526', o='stroke="#2b2235" stroke-width="4" stroke-linejoin="round"';
  let s='';
  // slanted ceiling with beams
  s+=`<path d="M0 0 H270 L0 210Z" fill="${wood}"/><path d="M1000 0 H730 L1000 210Z" fill="${wood}"/>`;
  s+=`<path d="M270 0 L0 210 M730 0 L1000 210" stroke="${dark}" stroke-width="14" stroke-linecap="round"/>`;
  s+=`<path d="M150 0 L0 117 M850 0 L1000 117" stroke="${dark}" stroke-width="5" opacity=".5"/>`;
  // round attic window with a night sky, a moon and stars
  s+=`<circle cx="340" cy="140" r="82" fill="#5b3a99" ${o}/><circle cx="340" cy="140" r="68" fill="url(#gMoonSky)"/>`;
  s+=`<path d="M362 108 A26 26 0 1 0 380 150 A20 20 0 1 1 362 108Z" fill="#fff3c4"/>`;
  s+=`<path d="${starPath(300,110,7)} ${starPath(318,176,5)} ${starPath(388,184,4)}" fill="#ffd166"/><circle cx="292" cy="150" r="2" fill="#fff"/><circle cx="350" cy="96" r="1.8" fill="#fff"/>`;
  s+=`<path d="M340 72 V208 M272 140 H408" stroke="#5b3a99" stroke-width="7"/>`;
  // a little pendant lamp
  s+=`<line x1="590" y1="0" x2="590" y2="66" stroke="#3b2f52" stroke-width="3"/><path d="M562 96 Q590 56 618 96Z" fill="#ff8cc6" ${o}/><ellipse cx="590" cy="100" rx="14" ry="6" fill="#fff6c8"/>`;
  // the Stage marquee, on the wall between the window and the desk (moved up from her room in v1.12)
  s+=`<g transform="translate(-345 230)">${stageMarquee()}</g>`;
  // computer desk: tap it for the Code Lab (v1.13)
  s+=`<g class="hot" data-hot="code"><rect x="712" y="434" width="250" height="20" rx="6" fill="#c9a7ff" ${o}/>`;
  s+=`<rect x="726" y="454" width="16" height="140" fill="#a283e0" ${o}/><rect x="932" y="454" width="16" height="140" fill="#a283e0" ${o}/>`;
  s+=`<rect x="846" y="454" width="86" height="70" rx="6" fill="#b494f0" ${o}/><circle cx="889" cy="489" r="5" fill="#2b2235"/>`;
  s+=`<rect x="760" y="316" width="150" height="104" rx="12" fill="#2b2340" ${o}/><rect x="772" y="328" width="126" height="80" rx="6" fill="#1d6f6a"/>`;
  s+=`<circle cx="815" cy="360" r="5" fill="#8ff0d0"/><circle cx="855" cy="360" r="5" fill="#8ff0d0"/><path d="M820 380 Q835 392 850 380" stroke="#8ff0d0" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  s+=`<rect x="826" y="420" width="18" height="14" fill="#3b2f52"/><rect x="770" y="424" width="70" height="10" rx="4" fill="#efe6ff" stroke="#2b2235" stroke-width="2"/>${sign(835,290,'💻 Code Lab')}</g>`;
  return s;
}
