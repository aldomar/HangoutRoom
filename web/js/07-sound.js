'use strict';
/* =========================================================
   7. SOUND (all generated — no audio files)
   ========================================================= */
let AC=null,master=null,musicBus=null,noiseBuf=null;
function ac(){
  if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{AC=new C();}catch(e){return null;}
    master=AC.createGain();master.gain.value=0.9;master.connect(AC.destination);
    musicBus=AC.createGain();musicBus.gain.value=0.6;musicBus.connect(AC.destination);}
  if(AC.state==='suspended'||AC.state==='interrupted') AC.resume(); // iOS says 'interrupted' after a call or another app's sound
  return AC;
}
function tone(f,dur,type,vol,slide,delay,bus){
  if(!bus&&!DB.settings.sound) return; const a=ac(); if(!a) return;
  const t=a.currentTime+(delay||0), o=a.createOscillator(), g=a.createGain();
  o.type=type||'sine'; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.exponentialRampToValueAtTime(slide,t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(bus||master); o.start(t); o.stop(t+dur+0.05);
}
function noiseBuffer(a){
  if(!noiseBuf){noiseBuf=a.createBuffer(1,a.sampleRate,a.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  return noiseBuf;
}
function noise(dur,vol,f1,f2){
  if(!DB.settings.sound) return; const a=ac(); if(!a) return;
  const t=a.currentTime, src=a.createBufferSource(); src.buffer=noiseBuffer(a);
  const fl=a.createBiquadFilter(); fl.type='lowpass'; fl.frequency.setValueAtTime(f1,t); fl.frequency.exponentialRampToValueAtTime(f2,t+dur); fl.Q.value=4;
  const g=a.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.03); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  src.connect(fl); fl.connect(g); g.connect(master); src.start(t); src.stop(t+dur+0.05);
}
const SFX={
  pop:()=>{const f=380+Math.random()*260;tone(f,0.09,'sine',0.35,f*0.35);noise(0.05,0.12,3000,800);},
  click:()=>tone(720,0.06,'triangle',0.12,540),
  coin:()=>{tone(988,0.08,'square',0.05);tone(1319,0.18,'square',0.05,null,0.08);},
  squish:()=>noise(0.4,0.35,1400,140),
  unsquish:()=>tone(170,0.5,'sine',0.12,300),
  happy:()=>{tone(660,0.1,'sine',0.15,880);tone(880,0.14,'sine',0.15,1170,0.1);},
  locked:()=>tone(320,0.16,'triangle',0.14,210),
  buy:()=>[523,659,784,1047].forEach((f,i)=>tone(f,0.16,'triangle',0.12,null,i*0.08)),
  flip:()=>noise(0.3,0.25,600,3000),
  kick:()=>{tone(150,0.12,'sine',0.4,60);noise(0.06,0.2,2500,600);},
  cheer:()=>{noise(1.1,0.22,900,3000);[784,988,1175].forEach((f,i)=>tone(f,0.18,'triangle',0.1,null,0.1+i*0.09));},
  save:()=>{tone(260,0.22,'triangle',0.16,560);tone(560,0.2,'triangle',0.1,280,0.18);},
  post:()=>{tone(1400,0.25,'square',0.05,1300);tone(2100,0.3,'sine',0.06);},
  whistle:()=>{tone(2300,0.12,'sine',0.08,2500);tone(2300,0.3,'sine',0.08,2450,0.16);},
  snap:()=>{noise(0.06,0.3,6000,2000);noise(0.12,0.18,1500,400);tone(1568,0.12,'sine',0.08,null,0.12);},
  whoosh:()=>noise(0.25,0.2,2000,300)
};
// gentle generated background music (A-minor chill loop)
let musicTimer=null,mStep=0;
const mf=n=>440*Math.pow(2,(n-69)/12);
const CHORDS=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]], MEL=[69,72,74,76,79,81];
function startMusic(){
  if(musicTimer||!DB.settings.music||!DB.settings.sound||STG.state==='play'||MU.playing||(typeof DN!=='undefined'&&DN.playing)||(typeof RW!=='undefined'&&RW.walking)) return; if(!ac()) return; // quiet while a Stage song plays
  musicTimer=setInterval(()=>{
    if(!AC||AC.state!=='running') return;
    const bar=Math.floor(mStep/8)%4;
    if(mStep%8===0) CHORDS[bar].forEach(n=>tone(mf(n),2.3,'triangle',0.035,null,0,musicBus));
    if(mStep%2===0) tone(mf(CHORDS[bar][0]-12),0.5,'sine',0.06,null,0,musicBus);
    if(Math.random()<0.55) tone(mf(MEL[Math.floor(Math.random()*MEL.length)]),0.4,'sine',0.045,null,0,musicBus);
    mStep++;
  },300);
}
function stopMusic(){clearInterval(musicTimer);musicTimer=null;}
let humO=null,humG=null;
function hum(speed){
  if(!AC||!DB.settings.sound){if(humG&&AC)humG.gain.setTargetAtTime(0,AC.currentTime,0.05);return;}
  if(!humO){humO=AC.createOscillator();humO.type='triangle';humG=AC.createGain();humG.gain.value=0;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;humO.connect(lp);lp.connect(humG);humG.connect(master);humO.start();}
  const t=AC.currentTime; humO.frequency.setTargetAtTime(70+speed*7,t,0.05); humG.gain.setTargetAtTime(Math.min(0.08,speed*0.0018),t,0.05);
}
// A tiny buzz. iPhones have no navigator.vibrate, so iosTick() (section 58) gives the same tap there; iPads have no buzzer.
function vibrate(ms){try{if(navigator.vibrate)navigator.vibrate(ms);else if(typeof iosTick==='function')iosTick(ms);}catch(e){}}
