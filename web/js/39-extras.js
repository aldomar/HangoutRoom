'use strict';
/* =========================================================
   39. EXTRAS (v1.37): 6 more 🧠 Challenge puzzles, 6 more marble mazes and 3 stickers
   Only ADDS entries at the END of lists from earlier sections (Code Lab is section 18, the marble maze section 19,
   stickers section 21). Puzzle ids (c9 … c14), maze ids (m7 … m12) and sticker ids are saved: never rename them.
   The level bonus (Challenge +10, every maze +5) is paid again when she finishes the bigger list, once.
   The smoke test runs every answer, proves each Challenge puzzle needs ✨ (and ❓ when it has puddles),
   and rolls through every maze by tilting.
   ========================================================= */
CODE_PUZZLES.challenge.push(
  {id:'c9',map:['...F','..*.','.*..','*...','C...'],max:3,sol:'3MD',move:'LDS',hint:'⬅️ and ⬇️ work inside ✨ My Move too.'},
  {id:'c10',map:['##..C','...~~','#....','.~~..','F....'],max:2,sol:'2M',move:'2RQU',hint:'🔁 and ❓ can both go inside ✨ My Move.'},
  {id:'c11',map:['.......','F#*#*#C'],max:2,moveMax:5,sol:'3M',move:'URRDS',hint:'Over the toy blocks, and grab every ⭐!'},
  {id:'c12',map:['....~F','.....#','..~...','.~....','C.~...'],max:2,sol:'3M',move:'QLQD'},
  {id:'c13',map:['....C','.....','.....','F.*.*'],max:4,sol:'2M3U',move:'2RS',hint:'Mix ✨ with other blocks in the program.'},
  {id:'c14',map:['.*C.','....','*...','....','~...','F...'],max:2,moveMax:5,sol:'2M',move:'2QUSR',hint:'The last one! Climb up, hop, and grab every ⭐.'}
);

MAZES.push(
  {id:'m7',name:'Round and Round',map:['S........','########.','########.','.....G.#.','.#######.','.........']},
  {id:'m8',name:'Ladder',map:['S........','#######.#','.........','#.#######','.........','#######.G']},
  {id:'m9',name:'Bumper Alley',map:['S...o....','..o...o..','o...o...o','..o...o..','....o....','.o.....oG']},
  {id:'m10',name:'Little Rooms',map:['S..#...#.','...#.#.#.','##.#.#...','...#.####','.###.....','.....##.G']},
  {id:'m11',name:'Bat Wings',map:['#...G...#','#.#####.#','..#...#..','.##.#.##.','....#....','###.S.###']},
  {id:'m12',name:'Long Way Home',map:['S.#...#.G','..#.#.#.#','..#.#.#..','..#.#.##.','....#....','###...##.']}
);

// How many Code Lab puzzles there are, and how many of them she has solved (unknown ids in an odd backup don't count).
const exCodeAll=()=>CODE_LVL_IDS.reduce((a,l)=>a+CODE_PUZZLES[l].length,0);
const exCodeGot=p=>CODE_LVL_IDS.reduce((a,l)=>a+CODE_PUZZLES[l].filter(z=>p.code.solved.includes(z.id)).length,0);
STICKERS.push(
  stk('maze25','fidget','🔮','Marble Marathon','scallop','Roll the marble into the ⭐ 25 times',25,p=>p.stats.mazes,2),
  stk('codeLevels','code','🏅','Level Collector','star','Solve every puzzle in 3 Code Lab levels',3,p=>CODE_LVL_IDS.filter(l=>stkLevelDone(p,l)).length,2),
  stk('codeAll','code','👑','Code Master','heart','Solve every Code Lab puzzle',exCodeAll,exCodeGot,3)
);
