'use strict';
/* =====================================================================
   67. 🎉 Holiday greetings (v1.72)
   On 12 US holidays the buddy hops and says "Happy Thanksgiving, Mia! 🦃" when her room opens (enterRoom, 09),
   with a short burst of confetti in the holiday's colors (giftConfetti, 32). Nothing is saved, nothing pays,
   nothing is for a limited time: a missed day loses nothing.
   A holiday is {id, icon, words, cols, date(year) -> 'YYYY-MM-DD'}. "Today" is fpDay() (44), so the smoke test sets FP_TEST_DAY.
   ===================================================================== */
const hdIso=(y,m,d)=>`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
// The nth weekday (0 = Sunday … 6 = Saturday) of month m (1-12) of year y.
function hdNth(y,m,wd,n){const first=new Date(Date.UTC(y,m-1,1)).getUTCDay();return hdIso(y,m,1+((wd-first+7)%7)+(n-1)*7);}
// Easter Sunday (the Gregorian calendar's "anonymous" rule).
function hdEaster(y){
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
  const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  const mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1; return hdIso(y,mo,da);
}
const hdFixed=(m,d)=>y=>hdIso(y,m,d);
const HOLIDAYS=[
  {id:'newYear',icon:'🎆',words:'Happy New Year',cols:['#ffd166','#fff3b0','#a97cff','#7fc8ff'],date:hdFixed(1,1)},
  {id:'valentine',icon:'💝',words:"Happy Valentine's Day",cols:['#ff4fa3','#ff8cc6','#ffffff','#e0245e'],date:hdFixed(2,14)},
  {id:'stPatrick',icon:'🍀',words:"Happy St. Patrick's Day",cols:['#3cc36b','#8ff0d0','#ffd166','#1f9e4f'],date:hdFixed(3,17)},
  {id:'easter',icon:'🐣',words:'Happy Easter',cols:['#ffd6ec','#c9f2e4','#fff3b0','#d9c8ff'],date:hdEaster},
  {id:'mother',icon:'💐',words:"Happy Mother's Day",cols:['#ff8cc6','#ffd6ec','#a97cff','#8ff0d0'],date:y=>hdNth(y,5,0,2)},
  {id:'father',icon:'👔',words:"Happy Father's Day",cols:['#7fc8ff','#3f7fd9','#ffd166','#8ff0d0'],date:y=>hdNth(y,6,0,3)},
  {id:'july4',icon:'🎆',words:'Happy Fourth of July',cols:['#e0245e','#ffffff','#3f7fd9','#7fc8ff'],date:hdFixed(7,4)},
  {id:'halloween',icon:'🎃',words:'Happy Halloween',cols:['#ff9a3c','#a97cff','#231b2e','#8ff0d0'],date:hdFixed(10,31)},
  {id:'thanksgiving',icon:'🦃',words:'Happy Thanksgiving',cols:['#ff9a3c','#c8662b','#ffd166','#a0522d'],date:y=>hdNth(y,11,4,4)},
  {id:'xmasEve',icon:'🎄',words:'Merry Christmas Eve',cols:['#e0245e','#3cc36b','#ffffff','#ffd166'],date:hdFixed(12,24)},
  {id:'christmas',icon:'🎄',words:'Merry Christmas',cols:['#e0245e','#3cc36b','#ffffff','#ffd166'],date:hdFixed(12,25)},
  {id:'newYearsEve',icon:'🥳',words:"Happy New Year's Eve",cols:['#ffd166','#a97cff','#ff8cc6','#7fc8ff'],date:hdFixed(12,31)}
];
// The holiday on day (default today), or null.
function holidayToday(day){day=day||fpDay();const y=+day.slice(0,4);return HOLIDAYS.find(h=>h.date(y)===day)||null;}
const holidayLine=(h,p)=>`${h.words}, ${p.name}! ${h.icon}`;
// Called by enterRoom() (09) when a room opens from the rooms list. `wait` = ms before the greeting (after the first-visit tip).
function holidayGreet(p,wait){
  const h=holidayToday(); if(!h) return null;
  clearTimeout(holidayGreet.t);
  holidayGreet.t=setTimeout(()=>{
    if(cur!=='room'||!P()||P().id!==p.id) return; // she has already gone somewhere else
    const g=$('#mascotG');
    if(g){g.classList.remove('hop');void g.getBoundingClientRect();g.classList.add('hop');setTimeout(()=>g.classList.remove('hop'),650);}
    SFX.cheer(); say(holidayLine(h,p)); giftConfetti(h.cols);
  },wait);
  return h;
}
