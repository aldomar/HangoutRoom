'use strict';
/* =========================================================
   30. STAGE SONG PACK (v1.26): five more original songs, made by code like the first three (section 14)
   Each is one SONGS recipe (scale, chords, a 4-bar melody for the verse A and the chorus B, form, drum and bass patterns);
   buildSong() turns it into sound and a fixed note chart. Melodies keep 3-4 notes in most bars, so Medium has more
   notes than Easy (which taps the beat). Song ids (neon/clap/dino/rocket/lullaby) are saved in stage.best: never rename.
   The Encore! card stays "all of the first 3 songs" (section 12); the Golden Mic is still 3 stars on Hard on any song.
   ========================================================= */
Object.assign(SONGS,{
  neon:{name:'Neon Hearts',icon:'💖',desc:'A sparkly dance track',bpm:124,scale:[64,69,71,72,74,76,77,79,81,84],lead:'square',leadVol:0.04,
    chords:{A:['Am','F','C','G'],B:['F','G','Em','Am']},
    mel:{A:'1.1.3.5.'+'6-5-3...'+'1.1.3.5.'+'4-3-2...',B:'8.8.7.8.'+'9-8-6...'+'6.6.5.6.'+'8---..56'},
    form:'AABBABB',kick:'x.x.x.x.',snare:'..x...x.',hat:'.x.x.x.x',bass:'r.ro.r.o'},
  clap:{name:'Stadium Clap',icon:'👏',desc:'Clap along with the crowd',bpm:108,scale:[57,62,64,66,67,69,71,73,74,76],lead:'triangle',leadVol:0.1,
    chords:{A:['D','G','A','D'],B:['G','D','A','D']},
    mel:{A:'1.3.5.5.'+'6.5.3...'+'1.3.5.5.'+'4.2.1...',B:'8.8.8.6.'+'7.7.7.5.'+'6.6.6.4.'+'5---....'},
    form:'ABABAB',kick:'x..xx...',snare:'..x...x.',hat:'x.x.x.x.',bass:'r...r.o.'},
  dino:{name:'Dino Stomp',icon:'🦖',desc:'Slow and big: stomp, stomp!',bpm:80,scale:[55,60,62,63,65,67,68,70,72,74],lead:'sawtooth',leadVol:0.03,
    chords:{A:['Cm','Ab','Bb','Cm'],B:['Fm','Cm','G','Cm']},
    mel:{A:'1-1-3---'+'2-2-4---'+'1-1-5---'+'4-3-1---',B:'5-5-6-5-'+'4-4-3---'+'4-4-5-4-'+'2-2-1---'},
    form:'AABBA',kick:'x...x...',snare:'....x...',hat:'........',bass:'r...r...'},
  rocket:{name:'Rocket Launch',icon:'🚀',desc:'3, 2, 1... blast off!',bpm:128,scale:[59,64,66,68,69,71,73,75,76,78],lead:'square',leadVol:0.04,
    chords:{A:['E','C#m','A','B'],B:['A','B','E','C#m']},
    mel:{A:'1.2.3.4.'+'5-4-3...'+'1.2.3.4.'+'5---....',B:'5.6.7.8.'+'9-8-7...'+'8.7.6.5.'+'8---.567'},
    form:'AABBABB',kick:'x.x.x.x.',snare:'..x...x.',hat:'xxxxxxxx',bass:'r.o.r.o.'},
  lullaby:{name:'Moon Lullaby',icon:'🌙',desc:'Calm and cozy',bpm:72,scale:[62,67,69,71,72,74,76,78,79,81],lead:'sine',leadVol:0.11,echo:1,
    chords:{A:['G','Em','C','D'],B:['C','G','Am','G']},
    mel:{A:'5-3-5-3-'+'4-3-2---'+'3-1-3-1-'+'2-----..',B:'6-5-4-3-'+'2-3-4---'+'5-4-3-2-'+'1-------'},
    form:'ABAB',kick:'x.......',snare:'........',hat:'....x...',bass:'r.......'}
});
SONG_IDS.push('neon','clap','dino','rocket','lullaby');

const songStar=(p,id)=>Object.values(p.stage.best[id]||{}).some(r=>r.stars>0)?1:0;
STICKERS.push(
  stk('songDino','stage','🦖','Dino Stomper','circle','Get a star on Dino Stomp',1,p=>songStar(p,'dino')),
  stk('songRocket','stage','🚀','Lift-off!','star','Get a star on Rocket Launch',1,p=>songStar(p,'rocket')),
  stk('songMoon','stage','🌙','Sweet Dreams','cloud','Get a star on Moon Lullaby',1,p=>songStar(p,'lullaby')),
  stk('setlist','stage','🎶','Whole Setlist','scallop','Get 3 stars on every song',()=>SONG_IDS.length,p=>stkStars(p).filter(n=>n>=3).length)
);
