'use strict';
/* =========================================================
   15. MAIN LOOP + STARTUP
   ========================================================= */
// The loop only runs on screens that draw every frame (v1.32, speed): a waiting frame request alone makes the browser
// redo its frame work 60 times a second. show() wakes it again with wakeLoop().
// The Music Maker (v1.38) and the Dance Maker (v1.47) only need it while something is playing (loopWanted).
const LOOP_SCREENS=['soccer','stage','fidget'];
const loopWanted=()=>LOOP_SCREENS.includes(cur)||(cur==='music'&&MU.playing)||(cur==='dance'&&DN.playing);
let loopOn=false;
function wakeLoop(){if(loopOn||!loopWanted())return;loopOn=true;loop.last=0;requestAnimationFrame(loop);}
function loop(t){
  if(!loopWanted()){loopOn=false;if(humG&&AC)humG.gain.setTargetAtTime(0,AC.currentTime,0.05);mzSensor(false);return;}
  const dt=Math.min(0.05,(t-(loop.last||t))/1000); loop.last=t;
  if(cur==='soccer'&&P()) drawSoccer(dt);
  if(cur==='stage'&&STG.state!=='pick'&&P()) drawStage(dt); // keeps dancing behind the result box
  if(cur==='fidget'&&P()){
    if(fidTab==='squish') drawSquish(dt);
    if(fidTab==='slime') drawSlime(dt);
    if(fidTab==='maze') drawMaze(dt);
    if(fidTab==='spin') drawSpin(dt); else if(humG&&AC) humG.gain.setTargetAtTime(0,AC.currentTime,0.05);
  } else if(humG&&AC) humG.gain.setTargetAtTime(0,AC.currentTime,0.05);
  if(cur==='music') muTick(); // section 40
  if(cur==='dance') dnTick(); // section 48
  mzSensor(cur==='fidget'&&fidTab==='maze'&&!!P()); // the tilt sensor is only used while the maze is on screen
  requestAnimationFrame(loop);
}
document.addEventListener('pointerdown',e=>{lastX=e.clientX;lastY=e.clientY;ac();if(DB.settings.music)startMusic();},true);
document.addEventListener('contextmenu',e=>e.preventDefault());
// Android back button (called by the APK wrapper). Returns true if the app handled it.
window.androidBack=function(){
  if(SPY.on&&SPY.done&&!$('#modal').classList.contains('hidden')){closeModal();spyEnd();return true;} // the 🔍 round box: Back = Done
  if(cur==='stage'&&STG.state==='jamdone'){closeModal();jamPickView();return true;} // the 🎸 jam's cheer box: Back = the loops (section 53)
  if(!$('#modal').classList.contains('hidden')){closeModal();return true;}
  if(cur==='room'&&SPY.on){spyEnd();return true;} // 🔍 I Spy -> the room (section 50)
  if(decorating){exitDecorate();return true;}
  if(cur==='fidget'||cur==='closet'){show('room');return true;}
  if(cur==='art'){artBack();return true;}
  if(cur==='cards'||cur==='soccer'||cur==='stickers'||cur==='about'){show('room');return true;}
  if(cur==='stage'){if(jamBackKey())return true;if(STG.state==='pick')show('room');else stgPickView();return true;} // a song -> the song list -> room
  if(cur==='code'){clBackKey();return true;} // a puzzle -> the puzzle list -> room
  if(cur==='music'){muBackKey();return true;} // section 40
  if(cur==='dance'){dnBackKey();return true;} // back to the Music Maker or the Stage (section 48)
  if(cur==='garden'){gdBackKey();return true;} // back to the Backyard (section 49)
  if(cur==='runway'){rwBackKey();return true;} // the walk -> dressing room -> cards -> Closet (section 52)
  if(cur==='little'){ltBackKey();return true;} // a toy -> the 🧸 menu -> room (section 46)
  if(cur==='brain'){brBackKey();return true;} // a puzzle -> the Brain Games menu -> room
  if(cur==='room'){if(roomNo!==1)goRoom(1);else show('profiles');return true;} // Loft, Backyard or Studio -> room -> profiles
  return false;
};
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){save();saveDraft();if(AC)AC.suspend();if(cur==='stage'&&STG.state==='play')stgPickView();if(cur==='stage'&&STG.state==='jam'){jamEnd(true);jamPickView();}muStop();dnStop();} // a song stops (nothing lost)
  else if(AC)AC.resume();
});

buildDefs();
show('profiles');
whatsNew(); // ✨ What's New, once per device after an update (section 25)
wakeLoop();
