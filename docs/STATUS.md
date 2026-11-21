# Status / handover

_Last updated: 2026-11-20_

## Where we are
- **Phase 0 (v1 base): done.** **Phase 1 (ship to the tablet): done** (v1.2 merged).
- **Phase 2 (Art Desk): done** (v1.3 merged). Checked on an Android phone: it works, and drawings survive closing the app.
- **Phase 3 (Photocard Wall): done** (v1.4 merged). The owner checked it on the device: all checks passed (2026-11-15).
- **Phase 4 (Soccer Field): done** (v1.5 merged), with the swipe-power fix and Bronze/Silver/Gold trophies. Checked on the device.
- **Squishy upgrade: done** (v1.6 merged, PR #6).
- **Phase 5 (Stage rhythm game): done** (v1.7 merged, PR #7).
- **Phase 6 (little-sister polish): done** (v1.8 merged, PR #8). The owner checked it on the device: everything works.
- **Phase 7 (content packs): done** (v1.9–v1.21, the last one PR #21 merged 2026-11-16). Order (agreed 2026-11-15): code split (v1.9) → Cozy Loft + Content Pack 1 (v1.10)
  → Code Lab (the owner's intro-to-coding game idea, sketched in `PLAN.md`).
  - **Code split: done** (v1.9 merged, PR #9). Built in Android Studio and checked on the device: everything works.
  - **Cozy Loft + Content Pack 1: done** (v1.10 merged, PR #10). Tried on a device: everything works.
  - **Shelves + Hair Styles: done** (v1.11 merged, PR #11). The owner asked for it before Code Lab.
  - **Stage in the Loft + Easy-only labels: done** (v1.12 merged, PR #12; the owner's request, before Code Lab).
  - **Code Lab: done** (v1.13 merged, PR #13). The owner checked it on the device: it all works.
  - **Code Lab: My Move + If levels: done** (v1.14 merged, PR #14). The owner tried it: it worked great.
  - **Code Lab: 🧠 Challenge level: done** (v1.15 merged, PR #15).
  - **New fidgets (🧪 Slime, 🎛️ Clicker cube, 🔮 Marble Maze): done** (v1.16 merged, PR #16).
  - **Seasons, Sticker Book, Pet** (plan agreed 2026-11-16, three PRs in this order):
    - **🍂 Seasons: done** (v1.17 merged, PR #17). The owner checked it: everything looks good.
    - **📒 Sticker Book: done** (v1.18 merged, PR #18). The owner checked it: all looks good.
    - **🐾 Pet: done** (v1.19 merged, PR #19).
  - **Buddies + Content Pack 2** (plan agreed 2026-11-16, two PRs): options the nieces' younger brothers (5 and 3)
    will like too, while everyone can still use everything.
    - **🐾 Buddies: done** (v1.20 merged, PR #20).
    - **🦕 Content Pack 2: done** (v1.21 merged, PR #21).
- **Phase 8 and beyond: roadmap agreed 2026-11-16** (see `PLAN.md`). Order: 💌 About & Gift Story (v1.22) → 🌳 Backyard,
  a third room (v1.23) → 🧤 Be the Keeper (v1.24) → 📚 Brain Games part 1 (v1.25) → 🎤 song pack (v1.26) → Phase 10
  (backlog + helpers) → Phase 11 (more games and packs). Each still gets its own detailed plan before building.
  - **💌 About & Gift Story: done** (v1.22 merged, PR #22).
  - **🌳 Backyard: done** (v1.23 merged, PR #23).
- **Phase 9 (Games): done** (v1.24–v1.26 merged, PRs #24–#26). See "Phase 9 plan" under Decisions.
  - **🧤 Be the Keeper: done** (v1.24 merged, PR #24).
  - **📚 Brain Games part 1: done** (v1.25 merged, PR #25).
  - **🎤 Stage song pack: done** (v1.26 merged, PR #26).
- **Phase 10 (Backlog + helpers): detailed plan agreed 2026-11-16** (five PRs, stacked; see "Phase 10 plan" under
  Decisions and `PLAN.md`): Looks & night (v1.27) → Gifts & presets (v1.28) → Shop filters + big dreams (v1.29) →
  Grown-up helpers (v1.30) → Room tweaks (v1.31, added at the owner's request) → Speed check (v1.32).
  - **👗 Looks, emotes & night mode: done** (v1.27 merged, PR #27). The owner tested it on the device.
  - **🎁 Gifts & room layouts: done** (v1.28 merged, PR #28).
  - **🔎 Shop filters & big dreams: done** (v1.29 merged, PR #29).
  - **🧑‍🔧 Grown-up helpers: done** (v1.30 merged, PR #30).
  - **🛋️ Room tweaks: done** (v1.31 merged, PR #31). The owner asked for it on 2026-11-17.
  - **⚡ Speed check & tidy-up: built, PR #32 open as v1.32** on branch `feature/speed` (from `main` after #31). This is the last
    Phase 10 PR: once it is merged, Phase 10 is done. The numbers are under "What has been tested".
    It also fixes a night-mode bug the owner found: the 🌙 window sky (and the wall glow stars) were drawn on top of
    everything, hiding the Loft window's bars and covering decorations. They are now drawn by `nightBack()` right after
    the furniture, and the dark layer lets moonlight through the windows. The Backyard's night sky is unchanged.
- **Phase 10: done** (PR #32 merged 2026-11-17).
- **Phase 11 (More games and content): detailed plan agreed 2026-11-17** (six PRs, stacked; see "Phase 11 plan" under
  Decisions and `PLAN.md`): Brain 2a (v1.33) → Brain 2b (v1.34) → Content Pack 3 (v1.35) → Content Pack 4 (v1.36) →
  Extras (v1.37) → Music Maker (v1.38).
  - **🚂 Pattern Train & 🔤 Word Builder: built, PR #33 open as v1.33** on branch `feature/brain2` (from `main` after #32).
    It also makes bonus photocards undeletable (the owner's request, 2026-11-17). **Merged** (PR #33); the owner checked it.
  - **🍕 Fraction Bakery & 🪐 Fact Cards: done** (v1.34 merged, PR #34).
  - **🎀 Content Pack 3: done** (v1.35 merged, PR #35).
  - **🏀 Content Pack 4: done** (v1.36 merged, PR #36).
    It has the owner's 🦖 dino nugget wish: a plush that sits on a Little Shelf, and a matching squishy.
  - **🧩 Extras: done** (v1.37 merged, PR #37). 6 more 🧠 Challenge puzzles, 6 more marble mazes and 3 stickers.
  - **🎹 Music Maker: done** (v1.38 merged, PR #38), built on branch `feature/music` (from `main` after #37). Plan details agreed 2026-11-17
    (see "Music Maker" under Decisions). This is the last Phase 11 PR: once it is merged, Phase 11 is done.
  - **🛋️ Room depth: done** (v1.39 merged, PR #39). The owner's
    request (2026-11-17): the new keyboard was hidden behind decorations, with no way to bring it forward.
  - **Owner wish (2026-11-17):** a 🦖 dino nugget plush (decoration + squishy) in Content Pack 4 (Phase 11, see `PLAN.md`).
- **Phase 12 (Playability): roadmap talked through 2026-11-17** (see "Phase 12" in `PLAN.md` and under Decisions).
  Order: 🗺️ fourth room + getting around (v1.40) → 🚪 Visitors (v1.41) → 👯 Two-player (v1.42) → 🎲 Free Play (v1.43) →
  the rest in any order. The v1.40 plan details are written up; agreed 2026-11-17 on branch
  `feature/room4` (from `feature/depth`; #39 is now merged, so the PR goes straight to `main`).
  - **✨ Studio + 🗺️ getting around: done** (v1.40 merged, PR #40). The owner named the room ✨ Studio.
  - **🚪 Visitors & wishes: done** (v1.41 merged, PR #41).
  - **👯 Two-player games: done** (v1.42 merged, PR #42).
  - **🎲 Free Play + 📅 Puzzle of the Day: done** (v1.43 merged, PR #43). Plan agreed
    2026-11-19 (see "Free Play" under Decisions and `PLAN.md`). Owner's answers 2026-11-19: always open; +1 coin each, 10 a day; the daily
    card on the Brain Games menu; +5 for the Puzzle of the Day; the daily card rotates through 5 Brain Games only (Train,
    Pop, Snack, Memory, Bakery; not Word Builder or Fact Cards), and those 5 get 🎲 Free Play too.
  - **🇺🇸 American spelling (v1.44) and 🔤 Word Builder word bank (v1.45): done** (PRs #44 and #45 merged 2026-11-19).
  - **🧸 Little Ones' Corner: built, PR #46 open as v1.46** on branch `feature/little` (from `main` after #45). Picked from the
    "Later" list and planned 2026-11-19 (see "Little Ones' Corner" under Decisions and `PLAN.md`). **Merged** (PR #46).
  - **💃 Dance Maker: built as v1.47** on branch `feature/dance` (from `main` after #46). Picked from the "Later" list and
    planned 2026-11-19 (see "Dance Maker" under Decisions and `PLAN.md`). Also moves the Loft's 🎤 Stage sign above the keyboard.
  - **🌱 Backyard garden: built, PR #48 open as v1.48** on branch `feature/garden` (from `feature/dance`, as #47 is still open).
    Picked from the "Later" list 2026-11-19. Owner's answers: plants grow by themselves (one step a day, never wilt), picking gives
    +3 coins and the first time a pot, 4 free seeds + 8 to buy, 6 plots. Full plan in `PLAN.md` ("v1.48 plan details"); agreed and built.
    **Merged** (PRs #47 and #48).
  - **🔍 I Spy: built, PR #49 open as v1.49** on branch `feature/ispy` (from `main` after #48). Picked from the "Later" list 2026-11-19
    (the recommended pick). Owner's answers: build the plan as written, and 🌙 night turns it into a 🔦 flashlight game.
    Full plan in `PLAN.md` ("v1.49 plan details"). **Merged** (PR #49).
  - **🪙 New things to spend coins on: built, PR #50 open as v1.50** on branch `feature/spend` (from `main` after #49). Picked 2026-11-19.
    Owner's answers: one PR; the museum is display pieces she arranges (not self-filling cases). Plan agreed ("go for it")
    and built (`PLAN.md`, "v1.50 plan details"). Left out on purpose: the visitor wish (it would give one friend 4 wishes
    and delay that friend's plush). **Merged** (PR #50, 2026-11-20).
  - **👠 Runway: built, PR #51 open as v1.51** on branch `feature/runway` (from `main` after #50). Plan agreed 2026-11-20 ("go for it"). Picked from the
    "Later" list 2026-11-20. Owner's answers: her own clothes plus a 👜 Borrow rack (borrowed for one show, never owned); the
    judges (3 visitor friends) hold up cheer cards, every walk gets cheers; +3 coins a show, 15 a day; a 👠 button in the Closet.
    Full plan in `PLAN.md` ("v1.51 plan details"). **Merged** (PR #51).
  - **🎸 Stage Jam: built, PR #52 open as v1.52** on branch `feature/freestyle` (from `main` after #51). Picked 2026-11-20 together with 🎯 Soccer
    Trick Shots (v1.53, next). Owner's answers: jam over her own loop (no falling notes, no score); two PRs. Plans agreed ("go for it").
    Full plan in `PLAN.md` ("v1.52 plan details"). **Merged** (PR #52).
  - **🎯 Soccer Trick Shots: built, PR #53 open as v1.53** on branch `feature/tricks` (from `feature/freestyle`, as #52 is still open). Owner's answer:
    a fixed list of 12 tricks. Full plan in `PLAN.md` ("v1.53 plan details"). **Merged** (PR #53, 2026-11-20).
  - **🐾 More pet play: plans agreed 2026-11-20 ("go for it"); 🙈 Hide & Seek + 🎾 Fetch built, PR #54 open as v1.54** on branch `feature/petplay` (from `main` after #53);
    **🦮 Walks built, PR #55 open as v1.55** on branch `feature/walks` (on top of #54). The last
    "Later" item. Owner's answers (2026-11-20): 🙈 Hide & Seek, 🎾 Fetch and 🦮 Walks; ❤️ hearts and stickers only (no coins); a walk
    is its own path scene. Two PRs: v1.54 (Hide & Seek + Fetch), v1.55 (Walks). Full plans in `PLAN.md`. **Both merged** (PR #54 and #55,
    2026-11-20), so **Phase 12 is done**.
- **🧩 Content Pack 5: Finish the Outfits: built, PR #58 open as v1.58** on branch `feature/pack5` (from `main` after #57). The owner
  noticed (2026-11-21) that some outfit pieces had nothing to match (the Racing Pants, the Fire Rescue Jacket) and agreed a plan for 25
  clothes: the missing pieces of 10 outfits plus pieces for theme tabs that were empty. New field `p5` (read by `themesOf`), `P5_SETS`
  for 3 stickers. No save changes. No hero cape (would need a new drawing layer; a possible later plan).
- **🎲 Brain Games Free Play coins: built and merged as v1.57 (PR #57)** on branch `feature/brain-coins` (from `main` after #56). The owner
  asked (2026-11-20) for steady coins in Brain Games Free Play so the older children keep coming back to the thinking games: +2 a puzzle,
  no cap, in every Brain Game with 🎲 except Memory Match (farming Easy is accepted). Memory Match, the Maze and the Code Lab keep +1 and
  the shared 10 a day (owner's choice). No save changes.
- **🌀 Curve balls (a Soccer fix, not a new phase): built and merged as v1.56 (PR #56)** on branch `feature/curve` (from `main` after #55).
  The owner noticed Flap was too hard: a perfect 5/5 on Hard (the 🥇 Gold Trophy) was pure luck, about 1 match in 150–400 whatever she did.
  Now a curved swipe (and, a little, a hard flick) makes the keeper worse at guessing, and a curve can send it the wrong way.
  The owner agreed the numbers ("these numbers make sense", 2026-11-20): with great curved shots to the corners about 1 in 20–60.
- The first APK built in Android Studio with no errors (2026-11-14). The owner checked on the device that saves
  survive closing the app and that Back works (popup → room → profiles → exit).
- The app and the Android wrapper were built in a Claude chat session and written into `D:\HangoutRoom`.
  From now on, work continues in VS Code (whole repo) with Claude Code. Android Studio opens only `android/`, to build the APK.

## Git
- Remote: `https://github.com/aldomar/HangoutRoom`.
- **v1.0 is on `main`** (commit `fd03c3c` "First code v1 commit"). It was committed straight to `main`, not via a PR.
  That commit also picked up a root `.idea/` folder (Android Studio settings from opening the repo root).
- PR #1 "v1 cleanup (v1.1)": merged. Stopped tracking the root `.idea/` and added it to `.gitignore`.
- PR #2 "App version + save upgrades (v1.2)": merged.
- PR #3 "Art Desk (v1.3)": merged.
- PR #4 "Photocard Wall (v1.4)": merged.
- PR #5 "Soccer Field (v1.5)": merged.
- PR #6 "Squishy upgrade (v1.6)": merged.
- PR #7 "Stage (v1.7)": merged.
- PR #8 "Little-sister polish (v1.8)": merged.
- PR #9 "Code split (v1.9)": merged.
- PR #10 "Cozy Loft + Content Pack 1 (v1.10)": merged.
- PR #11 "Shelves + Hair Styles (v1.11)": merged.
- PR #12 "Stage in the Loft (v1.12)": merged.
- PR #13 "Code Lab (v1.13)": merged.
- PR #14 "Code Lab: My Move + If (v1.14)": merged.
- PR #15 "Code Lab: Challenge (v1.15)": merged.
- PR #16 "New fidgets (v1.16)": merged.
- PR #17 "Seasons (v1.17)": merged.
- PR #18 "Sticker Book (v1.18)": merged.
- PR #19 "Pet (v1.19)": merged.
- PR #20 "Buddies (v1.20)": merged.
- PR #21 "Content Pack 2 (v1.21)": merged.
- PR #22 "About & Gift Story (v1.22)": merged.
- PR #23 "Backyard (v1.23)": merged.
- PR #24 "Be the Keeper (v1.24)": merged.
- PR #25 "Brain Games (v1.25)": merged.
- PR #26 "Stage song pack (v1.26)": merged.
- PR #27 "Looks, emotes & night mode (v1.27)": merged.
- PR #28 "Gifts & room layouts (v1.28)": merged.
- PR #29 "Shop filters & big dreams (v1.29)": merged.
- PR #30 "Grown-up helpers (v1.30)": merged.
- PR #31 "Room tweaks (v1.31)": merged.
- PR #32 "Speed check (v1.32)": merged.
- PR #33 "Pattern Train & Word Builder (v1.33)": merged.
- PR #34 "Fraction Bakery & Fact Cards (v1.34)": merged.
- PR #35 "Content Pack 3 (v1.35)": merged.
- PR #36 "Content Pack 4 (v1.36)": merged.
- PR #37 "Extras (v1.37)": merged.
- PR #38 "Music Maker (v1.38)": merged.
- PR #39 "Room depth (v1.39)": merged.
- PR #40 "Studio + getting around (v1.40)": merged.
- PR #41 "Visitors & wishes (v1.41)": merged.
- PR #42 "Play Together (v1.42)": merged.
- PR #43 "Free Play & Puzzle of the Day (v1.43)": merged.
- PR #44 "American spelling (v1.44)": merged.
- PR #45 "Word Builder word bank (v1.45)": merged.
- PR #46 "Little Ones' Corner (v1.46)": merged.
- PR #47 "Dance Maker (v1.47)": merged.
- PR #48 "Backyard Garden (v1.48)": merged.
- PR #49 "I Spy (v1.49)": merged.
- PR #50 "New things to buy (v1.50)": merged.
- PR #51 "Runway (v1.51)": merged.
- PR #52 "Stage Jam (v1.52)": merged.
- PR #53 "Trick Shots (v1.53)": merged.
- PR #54 "Pet Hide & Seek + Fetch (v1.54)": merged.
- PR #55 "Pet Walks (v1.55)": merged.
- PR #56 "Curve Balls (v1.56)": merged.
- PR #57 "Brain Games Free Play coins (v1.57)": merged.
- PR #58 "Content Pack 5: Finish the Outfits (v1.58)" on branch `feature/pack5`: open.
- Android Studio should open only the `android/` folder. Its generated files (`android/.gradle/`, `android/.idea/`,
  `android/app/build/`, `android/local.properties`, and since v1.30 `android/app/release/`, where Generate Signed APK
  puts the APK) are ignored.

## What has been tested
- `index.html` was tested in headless Chrome at tablet (1180×820) and phone (412×860) sizes:
  every screen, buying, the pop-it flip bonus (+8 coins per full board), squishy and spinner physics,
  decorating, saving across reload, and the Android back/backup hooks with a fake bridge. No console errors.
- The APK builds in Android Studio and runs on the device (see "Where we are").
- **Art Desk (v1.3)** was tested with `tests/smoke-test.js`, which drives the installed desktop Chrome (headless) through its
  DevTools connection, so nothing had to be installed. Run it with `node tests/smoke-test.js`. 40 checks passed with
  no console errors. It covers every screen, plus:
  - every tool, stamp, undo, clear and paper; saving and the coin rules
  - the gallery, and hanging/taking down/deleting posters
  - the "Save your drawing?" prompt on Back, and a draft surviving a reload
  - a backup with drawings, wiping and restoring it, and restoring an old backup without drawings
  - tablet, phone portrait and phone landscape sizes
- **On a device (2026-11-15):** the owner installed v1.3 on an Android phone. The new features worked, and a saved
  drawing was still in the Gallery after swiping the app away and reopening it. So drawing storage (IndexedDB)
  works inside the Android WebView. Not yet tried on her tablet.
- **Photocard Wall (v1.4)**: `tests/smoke-test.js` now has 67 checks, all passing with no console errors. New checks:
  - the corkboard opens the Photocards screen; snapping is free; card stats match the outfit
  - buying a stage, picking a free frame and a title; 10 cards → 3 binder pages; paging
  - bonus cards: the first-drawing card pops up in the room, the flip card gives +10 coins once, the
    "Card Collector" card at 10 cards, and no repeats after a restore
  - pinning (max 3, the oldest pin comes down), the 3 cards drawn on the room corkboard without the fuzz filter,
    and deleting a pinned card unpins it
  - restoring a v1.3 backup (no card fields) and a v1.4 backup with cards and pins
  - Back from Photocards goes to the room; maker and binder at phone portrait and landscape sizes
- **On a device (2026-11-15):** the owner installed v1.4 and all checks from the PR passed.
- **Soccer Field (v1.5)**: `tests/smoke-test.js` now has 99 checks (v1.5), all passing with no console errors. New checks
  (the keeper's guess is fixed in the test so results are repeatable):
  - the window opens the Soccer screen on Easy with Mochi; a goal pays +1 coin; a keeper save; a wide shot
  - tapping a spot in the goal shoots there; a real swipe kicks the ball in the swiped direction
  - the match ends after 5 kicks with the result box; best score saved; "First Goal!" bonus card
  - team kit badge and +1 kit coin; Medium shows Boo, Hard shows Flap; a perfect 5/5 on Hard pays 5×3 + 5
    (+10 for the "Perfect 5/5" bonus card)
  - Back goes to the room; restoring a v1.4 backup (no soccer fields) and a v1.5 one; phone portrait and landscape
  - trophies: Gold for a perfect on Hard, shown in the result box; Silver from an earlier perfect on Medium;
    never given twice (also after a restore); not in the Shop; never placed behind Fuzzy. 99 checks in all.
- **Squishy upgrade (v1.6)**: 114 checks (incl. side squeeze = taller, top press = flatter), all passing, no console errors. New: pressing the middle makes a deep dent
  and squashes the toy; the dent follows the finger; a squeeze counts once; the dent stays and rises back over ~5 s;
  a quick poke jiggles and is not counted; two fingers make two dents and squash more (counted once);
  pressing outside the toy does nothing; every squishy design draws with dents.
- **Stage (v1.7)**: `tests/smoke-test.js` now has 158 checks, all passing with no console errors. New checks:
  - the marquee opens the Stage (Easy, 3 songs); every note chart is the same every time, stays in its lanes, never
    puts notes too close together, gets busier on harder levels; songs are about a minute long
  - "Sound late?" buttons; background music stays off during a song
  - a real tap on time hits a note; a note that goes past is an Oops and ends the combo; a tap between notes does nothing
  - result box, best stars/score, coins per star, First Show!, Full Combo, Superstar and Encore! cards
  - no taps = no stars or coins; half the notes = 1 star; on Hard each pad taps its own lane
  - 3 stars on Hard gives the Golden Mic once (drawn in the room, not in the Shop); the Concert photocard stage is free
  - Back during a song goes to the song list, then the room; restoring a v1.6 backup (no stage fields) and a v1.7 one
  - phone portrait and landscape layouts
  Not tested automatically: how the songs sound and whether taps feel in time on the real tablet (needs ears and fingers).
- **Little-sister polish (v1.8)**: `tests/smoke-test.js` now has 197 checks, all passing with no console errors. New checks:
  - every room gets a colour and a badge; changing them with ✏️; the badge shows on the profile card
  - Easy mode on/off from Settings; it hides tips, makes buttons 52 px or taller, and is off on the profile screen
  - Easy shops (closet, decorate shop, walls, photocard stages) sorted owned-then-cheapest; too-dear items dimmed with 🔒;
    tapping one says "Need N more"; the short ✔ Yes / ✖ No buy box; the normal order comes back when Easy mode is off
  - Soccer and the Stage open on Easy in Easy mode
  - PIN: set (typed twice, a mismatch starts over); delete, make, change and restore ask for it; a wrong PIN does nothing;
    restoring a backup keeps the device's PIN; "Forgot PIN?" needs the right answer to the sum
  - restoring a v1.7 backup (no easy/colour/badge fields)
- **Code split (v1.9)**: 200 checks, all passing, no console errors. The split was done by a script that cut the old
  `index.html` at its section banners and checked the pieces add back up to exactly the old code (no code was retyped).
  New checks: `index.html` loads every `web/js` file in number order, the CSS loaded, the last file ran, and a missing
  file now fails the test (tried by hiding `13-soccer.js`). The owner then built it in Android Studio: it works.
- **Cozy Loft + Content Pack 1 (v1.10)**: 238 checks, all passing, no console errors. New checks:
  - the 🪜 Loft button opens the Loft (own Attic wall, Fuzzy there too); Back goes Loft → room
  - buying and changing walls in the Loft only changes the Loft; My Stuff is shared (something put away in her room
    can be placed in the Loft and moves there); 4 posters per room; trophies and the Golden Mic stay in her room
  - every new closet item draws; buying and wearing one; new clothes count on photocard stats
  - all 8 new decorations in the Shop and drawn in the Loft; new walls and floors
  - heart and star pop-it boards: bought, a sensible number of bubbles, popping them all flips the board and the shape
    stays; back to the square board; Ghosty squishy and Batwing spinner draw
  - restoring a v1.9 backup (empty Loft, square board) and a v1.10 backup; the Loft button fits on a phone
- **Shelves + Hair Styles (v1.11)**: 263 checks, all passing, no console errors. New checks:
  - both shelves are in the Shop and hang on the wall; something dropped near a shelf top snaps onto it; dragging the
    shelf carries what's on it; things off the shelf don't move
  - every hair style draws in every colour; buying a colour once works on all styles; free colours are owned
  - a v1.10-style backup with old swoop hair (e.g. Cotton Candy) restores as Emo Swoop in the matching colour,
    with the colour owned; old photocards still draw
- **Stage in the Loft (v1.12)**: 267 checks, all passing, no console errors. New checks:
  - her first room has no Stage marquee; the Loft has it, fully on its wall, and tapping it opens the Stage;
    Back from the song list goes to the Loft
  - room labels (Soccer, Closet …) show with Easy mode on and are hidden with it off
- **Code Lab (v1.13)**: 301 checks, all passing, no console errors. New checks:
  - the Loft's computer desk opens the Code Lab on Easy with 6 puzzles
  - every one of the 18 puzzles is checked: one Fuzzy and one carrot, only its level's blocks, walls and stars only on
    Hard, Medium can't be done without 🔁, and its stored answer really solves it within the block limit
  - Run with no blocks; a bump (block glows, no coins); tapping a block takes it out and Fuzzy goes back to the start;
    running out of blocks; a 🔁 with nothing after it; 🌟 where there is no star; the carrot without every star
  - solving pays +3 once (not again), the "First Program!" bonus card, all of Easy pays the +5 level bonus, solved puzzles
    get a tick; the block limit stops extra blocks; a Hard maze with 2 stars
  - leaving during a run stops it; Back goes puzzle → list → Loft; Easy mode opens on Easy with bigger blocks and no tips
  - restoring a v1.12 backup (no Code Lab) and a v1.13 one; phone portrait and landscape layouts fit the board and ▶️ Run
- **Code Lab: My Move + If (v1.14)**: 332 checks, all passing, no console errors. New checks:
  - 5 level tabs; every new puzzle is solved by its stored answer within its block limits; a search through every
    shorter program proves each My Move puzzle can't be done without ✨ and each If puzzle can't be done without ❓
  - My Move: the ✨ row is picked first; arrows and 🔁 go into the picked row; ✨ always goes into the program (never
    inside My Move); ↩️ and tapping a block take blocks out; 🗑️ clears both rows; while running, ✨ and the My Move block
    it is doing both light up; ✨ with an empty My Move and a bump inside My Move glow the right block
  - If: walking into a puddle is a "Splash!" oops; ❓ with no arrow after it is an oops; ❓ ➡️ hops over a puddle and
    just walks when there is none; a hop that would land on a toy block is a bump
  - coins: 3 per puzzle and the +5 level bonus on both new levels; a backup keeps the new level and solved puzzles; an
    unknown level falls back to Easy; on a phone the 5 tabs fit (icons only) and both rows, the board and ▶️ Run fit
  - One run had 3 Soccer checks fail by timing (nothing in Soccer changed); the next full run passed everything.
- **Code Lab: Challenge (v1.15)**: 345 checks, all passing, no console errors. New checks:
  - a search through every program and My Move row proves no Challenge puzzle can be solved without ✨, nor without ❓
    when it has puddles; 7 of the 8 answers put 🌟 or ❓ inside My Move; c4's second answer also wins
  - 6 tabs; Challenge shows 8 puzzles and every block; puzzle 1 built by tapping picks up both stars and pays 5;
    all 8 pay 5 each + 10; other levels still pay 3 / 5; backups keep the level; phone portrait and landscape fit
- **New fidgets (v1.16)**: 408 checks, all passing, no console errors. New checks:
  - 6 shelf tabs (icons only on a phone, all fit)
  - Slime: pulling stretches it after the finger and thins the rest; letting go counts one stretch and it snaps back;
    a quick poke leaves a dent that fills in and isn't a stretch; two fingers stretch both sides (counted once);
    5 stretches = 1 coin; touching outside does nothing; every design draws
  - Clicker: buttons go down and up (1 click), the switch flips on and off, the joystick moves and clicks per new
    direction and springs back, one turn of the ball = 3 clicks, the roller ticks; 25 clicks = 1 coin; every colour
  - Maze: every maze is 9×6 with one start and one star hole and can be solved (path search); a finger to the right
    rolls the marble right; the first tilt reading counts as flat; **an autopilot that only sends tilt readings solves
    all 6 mazes without the marble ever entering a wall**; coins 6×3 + 5, a replay pays 1; ⭐ on solved buttons;
    Tilt ON/OFF; the sensor is only listened to while the maze is on screen
  - buying a design of each (owned as `slime:` / `cube:` / `marble:`); a v1.15 backup restores with the new defaults
    (save version 10); a v1.16 backup keeps solved mazes, designs and counts; phone portrait and landscape layouts
  - Not tested automatically: how tilting feels on the real tablet, and whether auto-rotate turns the screen
    while she tilts it (if it does, turn on the tablet's rotation lock, or use 📱 Tilt OFF and a finger).

- **Seasons (v1.17)**: 440 checks, all passing, no console errors. New checks:
  - the season from the date (Sep–Nov autumn, Dec–Feb winter, Mar–May spring, Jun–Aug summer); 4 decorations and a wall
    per season; seasonal things are not in the normal Shop
  - for each season: the Seasons tab lists it first with "✨ In season!" and its icon on the tab; all 16 decorations and
    4 walls are always listed (also in Easy mode)
  - buying the Smiley Pumpkin (15) puts it in the room; buying a seasonal wall in the Seasons tab owns it and puts it up;
    seasonal walls are in the Walls tab too; the Walls and Floors tabs still change the right thing
  - for each season: her room's window and the Loft's window show it; tapping the window still opens Soccer
  - every seasonal decoration draws; a backup keeps them; on a phone the 5 Decorate tabs (icons only) and ✔ Done fit
  - Not checked automatically: how the art looks on her tablet.
- **Sticker Book (v1.18)**: 467 checks, all passing, no console errors. New checks:
  - 45 stickers on 6 pages (6 or more each), all different ids, every one draws and measures progress
  - stickers she had already earned (22 in the test room) all arrive the first time, in one box, +2 coins each;
    never given twice; the dot on 📒; the book's count; earned = colour + name, others = grey + hint + bar; new ones
    sparkle; a page counts as seen once open; tab dots for other pages; the dot goes once every page is seen
  - tapping a grey sticker shows what to do and "have / need"; Back goes to the room
  - the daily gift is counted (`stats.dailies`) and the 7th gives the Gift Box sticker (+10 gift, +2 sticker)
  - a sticker earned while playing (the clicker) is a message, never a box over the game
  - Easy mode: bigger stickers, no hint text on grey ones
  - a v1.17 backup restores with an empty book (save version 11); a v1.18 backup keeps the stickers and gives nothing twice
  - phone: 📒 and ⚙️ fit in the room's top bar (icon-only 🛋️), the 6 page tabs fit, 3 stickers across
  - Test change: stickers pay coins, so the test pauses them (`window.STK_TEST_PAUSE`) until their own checks, so the
    other games' exact coin checks still add up. The test also now waits for the page to finish loading (a cold start
    right after files changed was sometimes slower than its fixed 1.2 s wait).
- **Pet (v1.19)**: 500 checks, all passing, no console errors. New checks:
  - 4 pets, 5 things to wear, 5 tricks; every pet draws with every accessory
  - the empty bed with 🐾 ? by Fuzzy; tapping it opens "Pick a pet!" (4 pets, free); the Ghost Kitten (Misty) appears in
    the bed and says hi in Fuzzy's bubble
  - tapping the pet opens its menu; 🤚 Pet = +1 heart, a floating heart and a trick; patting again at once = a trick but
    no heart; the pet never earns coins; the 10th heart teaches Spin (shown, and said)
  - 🍪 Treat: -2 coins, +3 hearts, a cookie; no treat (and no hearts) without the coins
  - 🎀 Dress: 6 tiles; buying the crown (15) puts it on; off and on again is free; ✏️ Name (Wisp); 🔄 Change to the
    hamster (Twinkle, 0 hearts, still crowned) and back (Wisp kept her 13 hearts)
  - every pet drawn in the room; the pet is in the Loft too; while decorating, tapping it does nothing; Back closes its menu
  - pet stickers: New Friend + Pet Stylist, then Best Buddies + Trick Star at 100 hearts (and Dance)
  - a v1.18 backup restores with no pet (save version 12); odd pet data (unknown pet, negative hearts) is made safe;
    a v1.19 backup keeps the pet, name, hearts and crown; Easy mode: big buttons; phone: the menu and Dress-up fit
  - The sticker count checks now expect 49 stickers (4 new for the pet).
- **Buddies (v1.20)**: 546 checks, all passing, no console errors. New checks:
  - 5 buddies × 3 faces × every fur draw cleanly; every starter look uses real closet items
  - an old look (no buddy or face saved) draws exactly the same picture as before; unknown ids fall back to the bunny
  - the new short hair, Sky Stripe Tee, Cargo Shorts, High-tops and Backwards Cap draw, and hair colours work on them
  - Closet: 🐾 Buddy is the first tab, 😊 Face is there, both free; picking a dino keeps the outfit; Surprise me keeps
    the buddy, face and fur; the room and the pet bed show with every buddy
  - New Room: 6 buddy pictures (no words, each 48 px+), the classic bunny picked; picking the dino picks Mint fur;
    picking Sky fur redraws every picture; the room is made with the dino look in Sky, the starter clothes free
  - tint: a new green room has green buttons and bars; the profile screen is never tinted; ✏️ under a room switches it
    off and on; pink rooms look classic; every room colour has a tint; Easy mode and the tint work together
  - photocards: an old card still draws a bunny, a new one the dino
  - a v1.19 backup restores as bunnies with the tint off (save version 13); odd buddy data is made safe; a v1.20
    backup keeps the dino and the tint; phone: the New Room pictures fit
  - furniture colours: with none saved, both rooms draw their classic colours; a new green room gets the Leafy Green
    wall (free) and green furniture in both rooms (the Loft's beams stay wood); the room labels take the room colour;
    Decorate's 🎨 Colours tab has 4 pieces × 11 swatches (48 px+); Sky paints the desk, free; Classic brings the old
    wardrobe back; the Loft tab lists the Loft's pieces; white beams; backups keep the colours, odd ones are made safe
  - The Closet hair check now expects 11 styles; the phone Decorate check now expects 6 tabs.
- **Content Pack 2 (v1.21)**: 593 checks, all passing, no console errors. New checks:
  - 16 new clothes, each with a theme; each one draws on every buddy with no broken numbers and is in the Closet;
    buying the Dino Spike Hoodie (20) and wearing it; the new clothes count on photocard stats (Sporty 5)
  - nothing in the whole app is named "boy" or "girl"
  - 12 new decorations in the Shop; buying the Dino Plush (20) puts it in her room; 4 new walls and 3 floors (Outer Space
    bought and put up); all 12 decorations drawn in the Loft with the new walls and floors
  - fidgets: 3 pop-it colours and the Rocket and Dino boards (sensible bubble counts; popping them all flips the board);
    every squishy extra, spinner picture and slime picture exists; the new squishies, spinners, slimes, cubes and marbles
    are listed and draw; buying the Rocket spinner
  - stickers: 53 in all; the theme counts include clothes, walls, fidget designs and decorations (also in My Stuff);
    3 dino and 3 space things give Dino Fan and Space Cadet (+2 each), not Road Trip or Hero Squad
  - a backup keeps the pack clothes, wall, spinner, plush and sticker
  - Test changes: the sticker count check now expects 53; the clicker check now uses the last cube in the list.
  - One early run stopped at the Art Desk reload step (a slow page load, nothing to do with this change); the next runs passed.

- **About & Gift Story (v1.22)**: 616 checks, all passing, no console errors, both **with** the owner's
  `web/about-local.js` and **without** it (moved aside for one run). New checks:
  - the personal file's `<script>` sits right after `25-about.js`; a missing file isn't counted as an error
  - Settings → 💌 About opens the About screen; generic words with no local file ("made just for you")
  - the timeline has every version from 1.0 to `APP_VERSION` in order, each with a date, icon, name and why line;
    this version has news and is highlighted; the certificate shows Edition 1 of 1, the version and the start date
  - a local file's nicknames ("Dear Zip, Bean and Moss," / "Zip, Bean & Moss"), letter, signature and one why line
    are used; odd local values fall back to the generic words
  - 5 taps on the buddy show nothing with no secret and show the secret when there is one
  - Back and ⬅ Room go to the room; What's New shows once after an update, not again, only this version's news for an
    old save, and restoring a backup doesn't bring it back; on a phone the certificate and letter fit the width

- **Backyard (v1.23)**: 656 checks, all passing, no console errors. New checks:
  - the room bar's two buttons in each room (Room: Loft + Yard; Loft: Room + Yard; Backyard: Room + Loft); 🌳 Yard opens
    "…'s Backyard" with the White Picket fence and Grass; the tree, goal, shed, easel, Fuzzy and the pet are drawn
  - Back goes Backyard → room; the goal opens Soccer and Back from Soccer returns to the Backyard
  - each season shows in the sky, on the tree and on the ground
  - Walls/Floors tabs: only the 5 fences / 5 grounds outside, none of them inside; buying the Garden Hedge (15) and Sandy
    Beach (15) changes only the Backyard; the Seasons tab has decorations but no walls outside
  - the Shop lists the 8 outdoor things first outside; buying the Trampoline (30); String Lights land on the fence
  - Colours: shed + chalkboard rows; painting the shed Sky is free
  - My Stuff: a trampoline put away outside can be placed in the Loft; all 8 outdoor decorations and all 5 fences draw
  - stickers: 55, the two new ones at the end; 5 things outside and 3 outdoor things earn them
  - a v1.22 backup restores with an empty Backyard (save version 14); a v1.23 backup keeps it; odd Backyard data
    (not an object, an indoor wall, an unknown ground) is made safe; on a phone both room buttons fit (48 px+)
  - Test changes: sticker counts now 55; the Buddies backup check accepts save version 13 and up; the What's New checks
    set `whatsNew.wait=0`.
- **Be the Keeper (v1.24)**: 696 checks, all passing, no console errors. New checks:
  - Soccer still opens in Kick mode; the ⚽ Kick / 🧤 Keep buttons; Keep changes the title and the level tabs (🐸 🤖 🦊)
    and hides the kicker; the buddy in goal is drawn from her own look
  - all 45 shots are inside the goal and each one is saved by diving to it; on Medium and Hard, standing still saves at
    most 2 of 15; Easy shots are much slower than Hard ones
  - Easy: tapping the flying ball dives to it and saves (+1 coin, 🧤 dot, saves count); no dive = a goal, nothing lost;
    tapping the goal dives there and a second tap changes the dive; the result box after 5 shots; the next match uses the
    next 5 shots
  - Medium: one dive per shot; a save with the team kit pays 2 + 1; the Kick level is not changed
  - Hard: a perfect 5/5 pays 5×3 + 5 and wins the Gold Glove, which stands in the Backyard at its own spot; an earlier
    5/5 on Medium gives the Silver Glove; never twice; both draw; not in the Shop
  - Back goes to the room; Soccer remembers Keep; Easy mode opens Keep on Easy; back to Kick shows the kicker and Mochi
  - 3 stickers at the end of the list; First Save earned, Glove Case 2 of 3; on a phone the 5 tabs fit
  - a v1.23 backup restores in Kick mode with no keeper record (save version 15); a v1.24 backup keeps everything;
    odd keeper data is made safe
  - Test changes: sticker counts now 58; the Backyard backup check accepts save version 14 and up.
  Not tested automatically: how diving feels with a finger on the real tablet.
- **Brain Games (v1.25)**: 743 checks, all passing, no console errors. New checks:
  - the Backyard chalkboard is a hotspot and opens the menu (3 games, 0 / 24 each)
  - all 72 puzzles: 8 per level, ids all different; every Snack Stand answer is among its choices (3 on Easy, 4 after,
    whole numbers, the answer not always in the same place, the Hard answers right); every Memory set has 3 / 6 / 10
    different pictures that all draw, never her own buddy next to the other buddies, the same board every time; Number
    Pop: Easy has 3+ to pop, Hard has every factor and nothing bigger, Medium pairs always work out
  - Snack Stand: a wrong answer wobbles (nothing lost), the right one pays +2, turns its button green and shows Next;
    all 8 Easy pay 8 × 2 + 5; a replay pays nothing; the Medium and Hard tabs
  - Memory Match: two different cards turn back over (a third tap waits meanwhile); all pairs solve it (+2); Hard is 20
    cards in 5 columns
  - Number Pop: a wrong bubble wobbles; Easy pops every 2; Medium picks one, a wrong pair shows its sum, right pairs pop;
    Hard says what is left over and pops the factors of 12
  - Back: puzzle → menu → Backyard; Easy mode opens every game on Easy with no reading; 4 stickers at the end (Code &
    Brain page); phone layouts fit (20 cards, 48 px puzzle buttons)
  - a v1.24 backup restores with Brain Games at the start (save version 16); a v1.25 backup keeps solved puzzles and
    levels; odd Brain Games data is made safe
  - Test changes: sticker counts now 62; the keeper backup check accepts save version 15 and up; the What's New check
    allows for the box showing only the last 3 updates; the Hard perfect kick test waits for each kick to finish
    (it could miss a kick on a slow run). Brain Games sits last in `index.html`, so older checks that click the first
    `[data-lvl]` tab still find Soccer's.
- **Stage song pack (v1.26)**: 755 checks, all passing, no console errors. New checks:
  - 8 songs in order (the first 3, then the 5 new ones), each a complete recipe; the older chart checks now cover all 8
    (fixed, in their lanes, never too close, busier on harder levels, 55–75 s long)
  - the song list shows all 8 with no scrolling on the tablet, big buttons; 2 across on a phone, fitting the width
  - Dino Stomp plays and pays 3 × 2 coins for 3 stars; Hard Rocket Launch has 3 lanes and saves 3 stars, with still just
    one Golden Mic; the song list shows the new stars
  - Encore! still means the first 3 songs; 4 song stickers at the end (Stage page); Dino Stomper, Lift-off! and
    Sweet Dreams earned; Whole Setlist needs 3 stars on all 8
  - Test changes: sticker counts now 66; the song-list count check now expects 8.
  Not tested automatically: how the new songs sound on the tablet.
- **Looks, emotes & night mode (v1.27)**: 786 checks, all passing, no console errors. New checks:
  - save version 17; the Closet's ⭐ My Looks row (4 slots + 💾, all 48 px or more); keeping a look (without buddy, face or
    fur); wearing it back (the buddy stays); 💾 + a full slot asks first, ✔ replaces; a look with unknown ids changes nothing
  - Fashionista with 4 looks; the 2 new stickers at the end of the Room & Style page
  - tapping the buddy shows 4 big emote buttons; Dance and Nap play (one at a time) and end by themselves
  - 🌙 turns the lights off in one room only and is saved; the dark layer, the night window and a lamp's glow are drawn;
    taps still go through; Night Owl; the Loft's own setting and its lamp; the Backyard's sky; decorating lifts the dark;
    ☀️ turns it back on; decorating hides 🌙 and the emote buttons
  - a v1.26 backup restores with empty looks and lights on; a v1.27 backup keeps them; odd data is made safe
  - phone: the looks row, the emote buttons and 🌙 fit on the screen
  - Test changes: the sticker count is 68; the "comes before" sticker checks now find their place by sticker id instead of
    counting from the end, so new stickers no longer break them; the Brain Games restore check accepts save version 16 or later.
  Not tested automatically: how the emotes and the night glow look and feel on the real tablet.
- **Gifts & room layouts (v1.28)**: 817 checks, all passing, no console errors. New checks:
  - save version 18; Settings' 🎁 button; 5 / 10 / 20 coins; posters and prizes can't be given; "who" lists every other
    room (not this one) with big buttons; nothing is sent before ✔; ✔ moves 10 coins into the other room's inbox; Kind Heart;
    coins she doesn't have can't be given; the 🎁 tile in My Stuff; giving a decoration takes it out of her stuff
  - the other room shows the gift pile with a 2; tapping opens the first gift (who from, confetti, coins added); the
    decoration gift lands in the room; a gift from a newer app waits unseen
  - 🏠 Layouts: 3 empty slots; saving keeps wall, floor and spots; picture + 📂 Load; Interior Designer; loading asks first,
    puts spots and the wall back and brings a thing back from the Loft; newer things go to My Stuff; a thing given away
    is skipped (she's told); saving over asks first; each room has its own layouts
  - a v1.27 backup restores with no gifts and empty layouts; a v1.28 backup keeps them; odd data is made safe
  - phone: the give box fits; the Layouts tab and slots fit
  - Test changes: sticker count 70; the looks checks accept save version 17 or later; the phone Decorate-tabs check is now
    for 7 tabs.
  - Note: the 🧤 keeper checks are timing-sensitive. They failed twice while Android Studio was busy on the PC, then passed
    with no change to that code.
  Not tested automatically: how the gift opening feels, and passing the tablet between two children.
- **Shop filters & big dreams (v1.29)**: 842 checks, all passing, no console errors. New checks:
  - save version 19; every theme in `THEME_IDS` names a real item; Closet chips (All first, Emo and Dino, no Dreams,
    48 px); 🦇 Emo shows exactly the 3 emo tops; 🦕 Dino the dino hoodie; a tab with nothing of that theme goes back to
    All; ✨ All shows every top again
  - Shop chips with ⭐ Dreams and 🌳 Outdoor; Dreams shows the 5 dreams (60–100, starred); only dreams cost more than
    40; every dream draws; the Arcade and Aquarium glow at night
  - Save up: the offer, the bar (10 / 100, 90 more), the chips not squashed under it, a second tap says how many
    more, ✖ stops it, "get it now" with enough coins, a normal buy that places it, costs 80 and clears the goal;
    Dream Come True
  - Easy mode: icon-only 56 px chips; a v1.28 backup restores with no goal; odd data is made safe; phone: chips and
    bar fit the width
  - Test changes: sticker count 71; the v1.28 checks accept save version 18 or later. The 🧤 keeper Easy-match step now
    waits inside the page and dives on the first frame the ball flies, so a busy PC can't make it miss (that was the
    flaky failure seen in v1.28).
  Not tested automatically: how the dream items look on the tablet.
- **Grown-up helpers (v1.30)**: 872 checks, all passing, no console errors. New checks (with a pretend Android bridge
  that records what it's asked to say and save):
  - save version 20; "Last backup: never", then today after saving a file, "12 days ago", "yesterday"; restoring keeps
    this device's time; on Android the time waits for the wrapper's `backupSaved()`
  - no Read to me switch in the browser; on Android it's off with Easy mode off, on by default in Easy mode, and the
    switch turns it off and on; Decorate says "Decorate" (no emoji), a Shop tile its name, a hotspot "Closet";
    nothing during a song, a double tap once, nothing when off
  - the 📷 button under 🌙 (48 px, hidden while decorating); it saves a real 1500 × 1050 PNG of the room (checked by
    reading pixels back); Say Cheese!; a photocard's 📷 Save picture saves the card and keeps the box open
  - a v1.29 backup restores with Read to me following Easy mode; odd data made safe; phone: 📷 and the backup line fit
  - The saved room picture is written to `tests/shots/I02-room-snapshot.png` so it can be looked at.
  - Test changes: sticker count 72; the v1.29 checks accept save version 19 or later.
  Not tested automatically (needs the tablet): the real voice, the save picker for pictures, and that the PNG opens in
  the Gallery or Files app.
- **Room tweaks (v1.31)**: 881 checks, all passing, no console errors. New checks: touching the back decoration brings
  it to the front (drawn last and saved last), the same for a wall thing (still behind standing things), the buddy
  stays in front, placing from My Stuff puts it in front; on phones (360 px, 360 px Easy, 412 px) the room name shows in
  full and the buttons stay 48 px+ and on screen; on the tablet the bar is still one row. Screenshot
  `tests/shots/J01-phone-room-bar.png`. Also fixed: the y-sort of standing things had been commented out by mistake
  (since v1.28), so they were already drawn in list order; now that order is on purpose.
- **Speed check (v1.32)**: 892 checks, all passing, no console errors. Measured in headless Chrome on the owner's PC with
  the CPU slowed 6× (about a modest tablet), with 30 decorations in each room (including every moving one).
  "Open" times run from the tap to the next drawn frame; "doing nothing" is how much work the page does per second
  while nobody touches it (1000 ms/s = the tablet's main thread is never free).
  | | Before (v1.31) | After (v1.32) |
  | --- | --- | --- |
  | **Room, doing nothing** | **~990 ms/s** | **~15–80 ms/s** |
  | **Closet, doing nothing** | ~430–590 ms/s | ~0–30 ms/s |
  | Wear something you own (Closet) | ~240–330 ms (whole grid) | ~75–120 ms |
  | Move a thing with the Shop open | room + Shop redrawn (~300 ms more) | room only |
  | Open a room / Loft / Backyard | ~175–300 ms | ~185–415 ms (no change, run-to-run noise) |
  | Open the Closet / change tab | ~230–325 ms | ~250–345 ms (no change) |
  | Open Decorate on the Shop | ~550–730 ms | ~455–620 ms |
  | Sticker Book | ~100–115 ms | ~130–250 ms (no change, noise) |
  What was slow, and the fixes:
  - A room doing nothing was the big one. The buddy's breathing, the pet, the gift pile and the lava lamp, fairy lights,
    light stick, speaker and Stage sign (SVG `<animate>`) moved smoothly, so the whole room SVG (with its `#fuzz` and
    `#glow` filters) was laid out and redrawn 60 times a second. Now every endless idle animation is a CSS animation with
    `steps()` on a shared 0.2 s grid; they all start when the room is drawn, so the room is redrawn 5 times a second,
    and Chrome sleeps in between. The moving decorations are `.an-*` classes under `#roomSvg`, so Shop tiles stay still.
  - The gift pile's wiggle used the separate CSS `rotate` property, which made Chrome redraw every frame even when
    stepped. It now wiggles an inner group with `transform`.
  - The main loop asked for a new frame forever, even on screens that draw nothing. It now runs only on
    `LOOP_SCREENS` (Soccer, Stage, Fidget Shelf), and `show()` wakes it (`wakeLoop`).
  - Wearing an owned item redraws only the big buddy, the ✔ outline and My Looks (`closetWear`); buying still redraws all.
  - Dropping a moved thing redraws the Decorate grid only on 📦 My Stuff or when it was put away.
  - Still the slowest: opening Decorate on the Shop (~500 ms slowed 6×, about 80 ms on the PC). It is spread over
    reading, laying out and drawing ~50 tiles (no single hot spot; skipping off-screen tiles and dropping filters did
    not help), so it was left alone. `09-screens.js` is 35 KB, under the 40 KB limit, so it was not split.
  - New ⚡ Speed check in the smoke test: no SVG `<animate>` anywhere; every endless room animation is stepped and uses
    `transform`/`opacity`; the lava lamp still moves; Shop tiles don't move; moving a thing doesn't rebuild the Shop;
    the main loop rests on the room and wakes on Soccer; wearing an owned item keeps the grid. Then it prints the
    timings above and fails only on a big slowdown (any screen over 1.5 s, or a resting room over 500 ms/s).
  - One Keeper check ("no dive: Hop scores") failed once in four full runs and passed in the others; it waits on the
    match timing, so it is a timing flake on a busy PC, not a code fault.
  Not tested automatically: how the stepped movements look on the tablet (the buddy and pet move only 2–6 px, so they
  should look the same; the lava blobs and speaker notes now hop about 4 px at a time, which may look a little less
  smooth) and how warm the tablet gets.
- **Pattern Train & Word Builder (v1.33):** `tests/smoke-test.js` has 914 checks, all passing, no console errors. New checks:
  every wagon code is a known colour/shape/number with one ❓; on Easy and Medium only the answer makes the train repeat
  (the pattern shows at least twice); the Hard answers and hints; Word Builder letters, word lengths, pictures and tiles
  (the same order every time, every letter there); playing Easy/Medium/Hard of both games (wrong tries wobble, right
  ones pay +2); SOCCER with two Cs; phone fit; the 2 stickers; Brain Champ still counts only the first 3 games; saved
  levels for the new games kept and odd ones made safe; a bonus photocard has no Delete and `delCard` refuses it.
  The early Art Desk "draft survives" check crashed once because the page reloaded slower than its 1.5 s wait (busy PC);
  the next full run passed.
  Not tested automatically: Read to me saying the words on the tablet (the browser has no voice), and how small the
  8-wagon trains look on a real phone (they fit; the choice wagons are big).
- **Little Ones' Corner (v1.46):** `tests/smoke-test.js` has 1391 checks, all passing, no console errors. New checks: save version 27;
  the 🧸 button in all four rooms (48 px+, Read to me says Play, one row on the tablet, icon only at 360 px); the menu's 3 big
  buttons; 12 pictures with 4–8 areas each, and **every area of every picture can really be tapped** (a point where it is on top);
  picking a crayon, filling, ↩️ undo, finishing (🌟, +1, counted), the background, saved colors, the ⭐ in the list, 🎲 and 🗑️ (asks
  first); 🖼️ Hang it up makes a real 800 × 560 Gallery drawing (+5, counted), again with the same colors does nothing, after a
  change it updates the same drawing; the Sound Mat's 8 pads (C D E G A notes), two fingers at once, every fun sound, no coins;
  Peekaboo's 6 spots (4 on a phone), an empty spot is never "wrong", finding the friend (+1, counted), a new round by itself, a
  fresh round after leaving; +1 coins stop at 10 a day with a note and come back the next day; the 6 stickers; Back; phone
  portrait and landscape layouts; restoring a v1.45 backup, a v1.46 backup and odd data.
  Older checks changed: the sticker count (107 on 8 pages), the phone sticker tabs (now two rows on a narrow phone), the v1.43
  backup check (save version 26 or later) and the v1.45 Gift Story check (no longer the current version).
  Not tested automatically: how the sounds and "Peekaboo!" voice feel on the tablet, and whether the little ones find 🧸.
- **Word Builder word bank (v1.45):** `tests/smoke-test.js` has 1333 checks; all pass except the old Soccer "a wide shot misses" check, which failed once on a timing hiccup (it passed on the run before; nothing here touches Soccer); no console errors. New checks: the
  bank's size, letters, lengths (Easy 3–5, Medium up to 9, Hard up to 11) and no repeats; the left-out words are gone and the theme
  words are in; American spelling; every picture draws; extra letters never appear in the word; Easy traces faint letters and wins;
  a wrong letter fills nothing; Hard shows the word, ✋ hides it, 👀 peeks and keeps progress, and wins; made-up words never count
  as solved; the longest words fit on a phone; no 🔊 in a browser; Easy mode's short question; a Word Builder 📅 day pays +5 once.
  The v1.43 checks now expect 8 makers, a 6-game daily turn, and 🎲 in Word Builder.
- **American spelling (v1.44):** `tests/smoke-test.js` has 1305 checks, all passing, no console errors. New checks: no British
  spelling in any app file (web/ and index.html), the season shows as Fall with its saved id still autumn, no British word in
  item names, sticker hints, song descriptions or the Gift Story, and Decorate's tab says 🎨 Colors.
- **Free Play + Puzzle of the Day (v1.43):** `tests/smoke-test.js` has 1301 checks, all passing, no console errors. New checks:
  7 makers (not Word Builder or Fact Cards); 150 seeds for every game and level all make a fair puzzle; the same seed makes the
  same puzzle and different seeds make many different ones; the checks catch broken puzzles and pass every fixed puzzle; Snack
  Stand and Bakery answers are among the choices; Memory pictures draw; Code Lab answers fit their blocks and Medium needs 🔁.
  📅: the 5 games turn by date; the card sits next to 👯 above the games; no streak words; it opens today's game at her level
  (Easy in Easy mode); the same puzzle all day; +5 once, then "Solved today" and free practice; a new game the next day.
  🎲: in the 5 games (not Word Builder or Fact Cards), lit while playing; +1 and 🎲 Another one!; a tab makes one at that level;
  a made-up puzzle of every game and level solved on screen; 15 solved = +10 coins (10 a day) and 15 counted; the gentle note once;
  a new day refills; the dice glows when a level is done; 4 made-up mazes solved by tilting, never inside a wall (+1, counts for
  Marble Marathon, not saved); the Code Lab tile on Easy and Medium only, a made-up board solved (+1, not saved); Back; 3 stickers;
  phone layouts; a v1.42 backup restores (save version 26) and odd data is made safe. Older checks updated: 101 stickers, the
  puzzle-number count ignores 🎲, the Bakery sticker check finds its place by id, the v1.41 restore accepts version 25 or later.
  First run: 7 failures. The maze maker gave up on 4 of 150 seeds (it only succeeded 3% of the time), so it was rewritten as a
  corridor maze; the rest were test mistakes (the test's "next day" was the same day, which also broke two coin checks).
- **Content Pack 4 + fidget allowance (v1.36):** `tests/smoke-test.js` has 1064 checks, all passing, no console errors.
  Allowance checks: 30 paid then nothing, the gentle note (no countdown), a flip near the limit pays the rest, a new
  day refills, a full pop-it board still pops and flips but pays nothing, odd `fidPay` made safe, save version 21.
  The Keeper checks still sometimes fail by timing on a busy PC (seen once more); the next run passed.
  Pack 4 checks: New checks: 17 clothes
  draw on every buddy, on a photocard row; no "boy"/"girl" and prices 10–40; the 🐮 Farm chip sits before 🌳 and ⭐;
  ⚽ Sport tops show the old jersey and the new ones; buying the tee and the plush; **the plush snaps onto a Little Shelf,
  rides with it and is narrower than it**; 14 decorations draw in the Loft, the farm set in the Backyard, the UFO Lamp
  at night; walls, floors; the 🏀 and 🦖 pop-it boards (12–35 bubbles, flip); every new fidget draws; sticker counts
  (soccer things count for All-Star) and pay; a backup keeps the plush, its shelf and the squishy. Older checks updated:
  the 🦕 Dino tops now include the Dino Nugget Tee, and there are 10 outdoor decorations.
- **Content Pack 3 (v1.35):** `tests/smoke-test.js` has 998 checks, all passing, no console errors. New checks: 18 clothes
  draw on every buddy with no broken numbers, all on a photocard row; no "boy"/"girl" and prices 10–40; the new chips sit
  before 🌳 and ⭐ and filter right (🍵 Cozy tops, 🎤 Stage old + new, 🐚 Ocean in the Shop); buying a top, the Seashell
  Bed and a wall; 14 decorations draw in the Loft and the 3 lamps glow at night; 4 walls and 4 floors; pop-it boards
  have 12–35 bubbles and flip; every new squishy, spinner, slime, cube and marble draws; sticker counts (fidgets and
  My Stuff count; older stage things count for Stage Star) and pay; backup keeps it all; phone closet fits.
  The test also had two small fixes of its own: the sticker checks for Brain Games 3/4 now look at the Code & Brain page
  (the pack's stickers come later in the list), and a Keeper check that broke when a shot was on the left (`x--0.2`).
  Runs can still stop by timing on a busy PC (seen once at the Art Desk reload and once in Keeper); a stray headless
  Chrome left by a crashed run also caused failures until it was closed. The next run passed everything.
- **Fraction Bakery & Fact Cards (v1.34):** `tests/smoke-test.js` has 941 checks, all passing, no console errors. New checks:
  7 games and the 📇 button on the menu; every Easy treat has the right number of pieces and the uneven cuts really are
  uneven; Medium fractions are whole numbers of pieces; the Hard answers; every fact puzzle has 3 different answers in
  a fixed order, a full card, all 3 topics on every level, and the answer moves around; playing Easy/Medium/Hard of the
  Bakery (wrong tries explain, toppings toggle, the counter, ✔); Fact Cards Easy and Medium, the new card in the win
  box, the binder (24 slots, found cards open, a ❓ offers ▶ Play it), Android Back from the binder; phone fit; stickers;
  saved levels for the new games. One bug found by the test and fixed: the binder slots used the class `empty`, which
  already means "span the whole row" in the app's CSS, so they are `fc-none` now.
  Not tested automatically: tapping pizza slices with a finger on the tablet.

- **Backyard Garden (v1.48)**: 1504 checks, all passing, no console errors. New checks: the shed is the 🌱 Garden hotspot
  (Easy label, Read to me); planting plot-first and seed-first; buying a seed once; growth by test date (0–3 days, weeks later,
  and a date going backwards never shrinks a plant); watering changes nothing saved and never shows a countdown; the shed's
  flower box; picking pays +3 and gives each kind's pot once, drawn in the Backyard and never in the Shop; the 4 stickers;
  Back to the Backyard; 5 screen sizes (plots and 48 px seed packets fit); a v1.47 backup restores with an empty garden,
  and odd garden data is made safe. Not tested automatically: how it feels over real days on the tablet.
- **Dance Maker (v1.47)**: 1453 checks, all passing, no console errors. New checks: the Stage sign hangs right above the
  Loft keyboard (and the Easy label doesn't cover it); 💃 from the Music Maker and the Stage (Back goes to each); filling and
  emptying beats; ▶ Play moves on the beat with the main loop on, room music quiet; 🕺 free dance on the next beat; ⏹ stops the
  loop; the music list (Beat, My loop, saved loops, 8 songs) and each one's speed; a song ends by itself and counts once;
  saving and the 3-a-day coins; Load, Ideas (asks over an unsaved dance), Clear; the 3 stickers; leaving the screen or the app
  stops it; Easy mode; phone, small phone, phone landscape, tablet and upright tablet layouts; restoring v1.46 and v1.47
  backups and odd data. Not tested automatically: how the moves look in time with the music on the real tablet.
- **I Spy (v1.49)**: `tests/smoke-test.js` has 1552 checks, all passing with no console errors (48 new). New checks: the 🔍 button
  and clue card; decorations and built-in furniture can be spied (the owner's browser test found decorations were skipped,
  because they let taps through outside Decorate; fixed with `body.spying #roomSvg .deco{pointer-events:all}`); a wrong tap
  changes nothing; 💡; a real mouse tap finds a thing; a round pays +2, 10 a day, and a new day pays again; ⭐/⭐⭐/⭐⭐⭐ clues
  and theme hints met by any matching thing; Easy mode; the 🔦 flashlight follows the pointer; too few things; ✖, Back and
  leaving the room; hidden while decorating; the 3 stickers; 5 screen sizes; restoring v1.48 and v1.49 backups and odd data.
  Not tested automatically: how the flashlight feels under a finger on the real tablet.
- **Stage Jam (v1.52)**: `tests/smoke-test.js` has 1682 checks, all passing with no console errors (50 new). New checks: the 🎸 tab
  and the loop picker (my loop now, saved loops, ideas), the 3 jam sounds, the band plays all 8 steps, real taps and a slide on the
  5 pads, a tap above the stage is not a note, the crowd cheer, Stop under and over 20 notes, the 3-a-day coins and a new day,
  Back at every step (from the Stage and from the Music Maker), a song still plays after a jam, leaving the screen keeps the coins,
  Easy mode, 4 screen sizes, the 3 stickers, restoring v1.51 and v1.52 backups and odd data. The Music Maker's button row was
  checked on a sideways phone (it wrapped; the side column is now 380 px). Not tested automatically: how in time the pads feel
  with the band on the real tablet's speakers.
- **Trick Shots (v1.53)**: `tests/smoke-test.js` has 1736 checks, all passing with no console errors (58 new + 16 changed). New checks: every
  trick can be done with its recipe shots; 🌀 and 🍌 can't be done with any straight shot (every tap position is tried); 🧱, 🌈 order and
  the 🎯 moving star; a real tap does ⭐; +3 / +1 / 10 a day / a new day; a wall bounce, misses and the 💡 hint; a balloon partly popped;
  every trick drawn; the prize once at its spot; Kick and Keep still work; Back; Easy mode; 4 screen sizes; stickers; backups and odd data.
  The Soccer tabs were measured at 360, 412, 620 and 1180 px in all 3 modes: on phones they are now tighter (44 px tall), and under
  400 px ⚽ and 🧤 show icons only. A first full run failed the ⚡ speed check with every screen ~2× slower (the machine was busy); the
  rerun was normal (Shop 1080 ms). Not tested automatically: how hard a curved swipe feels on the real tablet.
- **Pet Hide & Seek + Fetch (v1.54)**: `tests/smoke-test.js` has 1786 checks (about 55 new). The full run passed 1785 with no console errors; the
  one failure was the v1.53 section still expecting the app to say 1.53, fixed like the older sections (it now only checks the Gift Story).
  New checks: the menu buttons only with a pet; the curtain, then the pet behind a real spot with 8–45% showing (16%+ in Easy mode) and the
  stepped wiggle; wrong taps count nothing; the hint after 3; a redraw keeps the spot; finding by the pet or the spot (+2 hearts, no coins);
  🔁 picks another spot; the Loft and the Backyard; a bare Studio says so; glowing eyes at night; Back and leaving end it; Fetch by swipe and by
  tap (lands on the floor, +1 heart, no coins); buying and switching toys; the yarn string; no games while decorating; 3 screen sizes;
  stickers; backups and odd data. Speed check: Shop 1363 ms (under 1.5 s), the room doing nothing 87 ms/s. Not tested automatically: how easy
  a peeking pet is to spot for the little ones, and how a throw swipe feels on the real tablet.
- **Pet Walks (v1.55)**: `tests/smoke-test.js` has 1833 checks (51 new). The full run passed 1829 with no console errors. Of the 4 failures,
  1 was the v1.54 menu check expecting exactly 2 play buttons (there are 3 now), and 3 were a flaky v1.54 check: its "wrong tap" landed on
  the buddy, which counts as a find when the pet happens to hide right next to the buddy. The wrong tap now picks a point well away from the
  hiding spot and the pet (also fixed on `feature/petplay`). After the fix, the two pet sections passed 3 runs in a row (101 checks each); the
  full test was not run again. New checks: the 🦮 menu button; 4 path cards; standing still the scenery is paused, holding 👣 slides it;
  letting go keeps the distance; the sniff, the find card (+1 heart, no coins), 5 different new finds, home (+3); an animal is waved goodbye;
  new finds first; the 8th find gives the jar once in My Stuff; the book (32, gray when not found); Back at every step; leaving stops the
  walk; every path drawn; 4 screen sizes (the buddy, pet and bush on screen); Easy mode; stickers; backups and odd data; strict XML.
- **Content Pack 5 (v1.58)**: 1866 checks, all passing, no console errors (21 new, in their own section at the end): 25 clothes with real theme chips, every piece
  drawn on every buddy as strict XML, prices and photocard rows, each of the 10 outfits shares a theme chip, the Closet lists every
  piece, chip lists for Ride tops / Hero shoes / Stage legs / Cozy bottoms / Emo shoes, buying the Racing Jacket, Runway matches, the 3
  stickers, a screenshot of each outfit (`P1`–`P10`). The old "Dino has no arm warmers" chip check now uses 🐮 Farm (Dino has Claw Mitts).
- **Brain Games Free Play coins (v1.57)**: 1845 checks (4 new in the Free Play section: +2 a 🎲 puzzle with free.n untouched, the
  18-puzzle run adds up to +2 each in the thinking games and +1 each in Memory Match, Pattern Train still pays +2 after the 10 a day, Memory
  Match then pays nothing with the gentle note; and one v1.57 version check). The full run passed with no console errors, apart from the
  old "app says 1.56" version check, then updated to 1.57.
- **Curve Balls (v1.56)**: `tests/smoke-test.js` has 1841 checks (8 new, in their own section). The full run passed all 1841 with no
  console errors. `Math.random` is set to a fixed list so the keeper's choices are known:
  the tip mentions curving; the skill numbers; a straight shot Flap reads is saved, but the same roll with a big curve goes in; a big
  curve sends Flap the wrong way ("Curve ball! 🌀"); a straight shot never does; a curve down the middle sends Flap away from the bend.
  The older Soccer checks are unchanged (their shots are straight). The odds were worked out with a simulation that copies the keeper's
  movement frame by frame (40,000 kicks per shot type), not in the smoke test. Not tested automatically: how easy a curve is to swipe on
  the real tablet.
  Speed check: Shop 1386 ms (under 1.5 s), a room doing nothing 111 ms/s. Not tested automatically: how holding 👣 feels on the tablet.

## Decisions made
- Main idea: the "hangout room" (chosen because it can grow, and the younger sister can have her own profile).
- One web page (works offline, no server) plus a WebView APK wrapper. The same code serves both.
  Since v1.9 it is `index.html` + `web/app.css` + `web/js/` (one file per section), split because it passed 210 KB.
- No SQLite; localStorage is enough for v1. IndexedDB comes later for drawings.
- Mascot: original fuzzy emo bunny, default name "Fuzzy" (renamable). Since v1.20 it can also be a Bear Cub, Puppy,
  Little Dino or Fox, with a choice of 3 faces (see Buddies below). Starter look: emo swoop bangs,
  band tee, plaid skirt, black/purple striped leg warmers, platform boots, star clips.
- Locked room areas became updates: Art Desk (v1.3), Photocard Wall (v1.4), Soccer Field (v1.5). Every area is now open.
- Android: AGP 9.5.1 with built-in Kotlin, Gradle 9.6.0 (Android Studio's Upgrade Assistant raised them from
  9.3.3 / 9.5.0 at the first build; that build worked), SDK 36, min SDK 26, package `com.family.hangoutroom`.
  No AndroidX, no `INTERNET`. Debug-signed APK, sideloaded.
- Music is off by default. Sounds are on.
- Backup: a copy/paste code or a `.json` file (Android save picker in the APK).
- Art Desk (agreed 2026-11-15):
  - **Backups include drawings**, with a switch in the backup screen (on by default) to leave them out.
    Restoring a backup with drawings replaces the drawings on the device. Restoring one without drawings keeps them.
  - **Coins:** +5 per new drawing (needs 3+ strokes), for the first 5 new drawings a day. Updating a saved
    drawing pays nothing.
  - **Posters** are free, up to 4 per room. Deleting a drawing takes its poster down.
  - Drawings are stored in IndexedDB as WebP images (PNG/JPEG if WebP isn't available), with a localStorage fallback.
- Photocard Wall (agreed 2026-11-15):
  - **Making a card is free** and pays no coins (so it can't be used to farm coins). Up to 60 made cards per room.
  - **Bonus cards** for 8 fixed milestones (not random), +10 coins each, given once. Milestones reached before
    v1.4 are given the first time she opens her room after the update. Deleting a bonus card doesn't bring it back.
  - **Shop:** 3 stages and 3 frames are free; the others cost 10–25 coins.
  - **Stats** on a card are Cute / Spooky / Sporty, worked out from the outfit (no randomness).
  - Cards are saved as small "recipes" in the normal save (not as pictures), so they are always in backups.
  - Pinning a 4th card on the corkboard sends the oldest pin back to the binder (simpler for a young child than
    asking which one to swap).
- Soccer Field (agreed 2026-11-15):
  - **A different original keeper on each level** (the owner's idea): Easy = Mochi the sleepy cat,
    Medium = Boo the fluffy ghost, Hard = Flap the chubby bat.
  - **All levels open** from the start. No unlocking.
  - **Coins:** +1 / +2 / +3 per goal by level, +5 for a perfect 5/5, +1 more per goal with 2+ soccer clothes on.
  - **Controls:** swipe up from the ball (aim, power, curve) **or** tap a spot in the goal (for the younger sister).
  - Matches are 5 kicks. No timer, nothing lost on a miss, leaving mid-match just starts a fresh match next time.
  - **Trophies** (the owner's idea, added after the first device test): a perfect 5/5 wins Bronze (Easy),
    Silver (Medium) or Gold (Hard), once each. The trophy is put straight into her room as a decoration (she can move
    it or store it with Decorate). Not sold in the Shop. A perfect game from before is rewarded the next time she opens
    the room or the Soccer Field. Saved in `soccer.trophies` so it is never given twice.
    Each trophy has its own clear spot on the floor (`TROPHY_SPOTS`: Bronze left of Fuzzy, Silver right, Gold by the
    closet). At first they landed at random and could hide behind Fuzzy.
  - **Swipe power (fixed after the first device test):** it was measured over the whole touch, so touching the ball,
    pausing, then flicking gave a weak, slow roll. Power now comes from the speed of the last 0.12 s of the flick.
    Even a gentle swipe is about as strong as a tap, and full power rises to the top corners without going over the bar.
    To tune it, change the numbers in `power=` and `v=` in `socRelease()`.

- Squishy upgrade (2026-11-15): the owner found the squishy dull because only pokes near the edge did anything.
  Now a dent forms anywhere under each finger (multi-touch), deepens while held, follows the finger, and slowly rises
  back after release (memory foam). A quick poke (under 0.25 s) jiggles and doesn't count as a squish. No save changes.
  After the first try: squeezing the sides now makes it narrower and taller (it used to get shorter), and pressing the
  top makes it flatter and wider. The scene sits lower so the ears stay in view when it stretches tall.
- Stage (agreed 2026-11-15):
  - **Where:** a glowing "🎤 Stage" marquee above the closet (moved to the Cozy Loft's wall in v1.12). (The plan said a mic stand on the floor between the
    shelf and the closet, but every new room starts with a plant on that spot.)
  - **3 original songs** made by code: Starlight Pop (120 BPM), Midnight Bats (100 BPM), Sugar Clouds (88 BPM).
    Each song is a short text recipe (scale, chords, melody, drums) in `SONGS`. Note charts are fixed, not random.
  - **Levels, all open:** Easy = 1 pad (tap anywhere), Medium = 2 pads, Hard = 3 pads (hearts, stars, bats).
  - **Can't fail:** the song always plays to the end; a tap between notes costs nothing; leaving mid-song is fine.
  - **Coins:** 2 / 3 / 4 per star (Easy / Medium / Hard), 1–3 stars per song (1 for taking part, 2 at 60%, 3 at 85%).
    A song with no hits gives no stars and no coins, so leaving the music running earns nothing.
  - **No outfit bonus** (owner's choice). Fuzzy still performs in today's outfit.
  - **Golden Mic** (owner's choice): 3 stars on Hard on any song puts it in her room once (`stage.mic`). Not in the Shop.
  - **Bonus cards:** First Show!, Full Combo, Encore! (all 3 songs), Superstar (3 stars on Hard). Free Concert photocard stage.
  - **Timing:** song time comes from the audio clock, minus the speaker delay the browser reports, minus
    "⏱️ Sound late?" (`settings.stageOffset`, -100 to +400 ms, saved per device). Switching away from the app stops the song.

- Little-sister polish (agreed 2026-11-15):
  - **Easy mode is per room**, switched in ⚙️ Settings (not behind the PIN). Bigger buttons/tiles, no tips or long
    descriptions, games open on Easy.
  - **Easy shops:** show everything, owned first then cheapest first; too-dear items dimmed with a 🔒 (owner's choice
    over hiding them, so she can see what to save up for).
  - **Room look:** a colour (`ROOM_COLORS`, 6) and an emoji badge (`ROOM_BADGES`, 8) per room. A new room gets the first
    colour no other room uses.
  - **Grown-up PIN** (optional, off by default) guards: deleting a room, restoring a backup, making a room, and changing
    a room (✏️). It does **not** guard the Easy mode switch (owner's choice). Forgot PIN = a 2-digit × 2-digit sum.
    The PIN is saved in `settings.pin` and stays with the device: restoring a backup never changes it.

- Cozy Loft + Content Pack 1 (agreed 2026-11-15):
  - **The second room is a Cozy Loft** (slanted roof, round night-sky window, a pendant lamp and a computer desk),
    **free from the start** for every room. Switched with the 🪜 Loft / 🏠 Room button in the top bar (one tap).
  - Her first room stays `p.room`; the Loft is `p.room2`. Each has its own wall, floor and decorations.
    **My Stuff is shared**: put something away in one room and place it in the other. Up to 4 posters per room
    ("Hang in room" uses her room first, then the Loft). Trophies and the Golden Mic are given to her first room.
  - **The computer desk is plain furniture** (owner's choice: no "coming soon" sign). It becomes the Code Lab later.
  - **Content Pack 1:** 8 clothes (Cotton Candy hair, Bat Sweater, Galaxy Skirt, Mint Fluff leg warmers, Rainbow Fluff
    arm warmers, Bunny Slippers, Flower Crown, Heart Shades), 8 decorations (Book Nook, Disco Ball, Floor Cushions,
    Bat Garland, Egg Chair, Cloud Shelf, Star Mirror, Checker Rug), 2 walls (Peachy Stripes, Sky Clouds) plus the free
    Attic Boards wall, 2 floors (Mint Tiles, Cloud Carpet), the Ghosty squishy, the Batwing spinner, and heart / star
    pop-it boards (15 coins each). Prices 15–40.
  - **Pop-it shapes** are picked next to the colour themes. Bubbles that don't fit the shape are left out (heart 28,
    star 22). Popping all of them still flips the board for the same +5 coins.
- Shelves + Hair Styles (agreed 2026-11-15):
  - **Two wall shelves** in the Shop: Little Shelf (10) and Long Shelf (15), one cozy style (white wood, pink brackets).
    Something dropped near a shelf's top **snaps** onto it, and moving the shelf **carries** what's on it.
  - **Hair is now style + colour.** The old coloured swoops became one **Emo Swoop** style. Colours are bought
    **once** and work on every style: Black and Brown free; Purple, Pink, Blonde, Mint, Sky, Snow 10; Black + Pink
    Streak and Cotton Candy 20.
  - **New styles:** Short Bob, Pigtails (15), Long Waves, Emo Spikes (20), and **Starry Twin Tails** (25): long,
    gravity-defying twin tails with star clips. The owner asked for "anime style" hair; it is kept original (star clips,
    heart-dip fringe, no teal default) so it doesn't look like any real character.
  - Old saves: anyone wearing or owning an old swoop gets Emo Swoop plus that colour, free. The old ids stay readable.
- Stage in the Loft + labels (owner's request, 2026-11-15):
  - **The Stage marquee moved to the Cozy Loft's wall** (between the round window and the computer desk), because her
    first room was cramped. Songs, scores, the Golden Mic and its place in her first room are unchanged.
  - **The pink room labels (⚽ Soccer, 👗 Closet …) only show in Easy mode.** Without Easy mode she finds what can be
    tapped by exploring; a younger child in Easy mode still gets the labels.
- Code Lab (plan agreed 2026-11-15, built as v1.13):
  - Tap the Loft's computer desk. A small grid with Fuzzy and a goal; she lines up big arrow blocks, taps ▶️ Run and
    watches Fuzzy follow them. A bump is a gentle "oops, try again": nothing is lost.
  - Easy = arrows only; Medium adds a 🔁 repeat block; Hard adds walls and a 🌟 pick-up block.
  - Coins: about 3 per new puzzle solved plus a small level bonus, each puzzle paying once. No timers.
  - Puzzles are short text recipes in a new `18-codelab.js`, so more puzzles and levels are easy to add.
  - Save: `code{level, solved[]}` per room, with defaults for old saves (save version 9).
  - As built: 6 puzzles per level (18). The goal is a carrot 🥕 (Fuzzy is a bunny); walls are pink toy blocks.
    🔁 comes as ×2, ×3 and ×4 blocks and repeats the block right after it. Medium puzzles have a block limit (shown
    as empty slots) so 🔁 is needed. Reaching the carrot with every ⭐ wins straight away, even if blocks are left.
    Tapping a block in the program takes it out; ↩️ removes the last one, 🗑️ clears all.
  - Coins: 3 per new puzzle, +5 when every puzzle of a level is solved. If puzzles are added to a level later, finishing
    the new ones pays that level bonus again (a small, fair extra).
  - Added a **"First Program!" bonus photocard** (+10, once), like the other games have. Easy to remove if not wanted.
- Code Lab: My Move + If (agreed 2026-11-15, built as v1.14):
  - **Two new levels**, after Hard and open from the start: ✨ My Move and ❓ If, 6 hand-made puzzles each (ids `f1`–`f6`,
    `i1`–`i6`; level ids `move` and `if`). No extra puzzles for the old levels and no new bonus card (owner's choice).
  - **✨ My Move:** a second row (up to 4 blocks) above the program. She taps a row to pick where blocks go; a My Move
    puzzle starts with the ✨ row picked. Tapping ✨ always puts it in the program and picks the program row, so My Move
    can never run itself. The program has room for only 2–4 blocks, so My Move is needed.
  - **❓ If:** puddles 💧 on the board. Stepping into one is a gentle "Splash!" oops. ❓ goes in front of an arrow: hop over
    a puddle (2 squares) if one is next, otherwise a normal step. A hop can't land on a toy block, a puddle or off the board.
  - Same coins as the other levels (3 per new puzzle, +5 per finished level). No save shape change (`DB_VERSION` stays 9);
    `normalize()` now also accepts `move` and `if` as `code.level`. On a phone the level tabs show only their icons.
- Code Lab: Challenge (agreed 2026-11-16, built as v1.15): the owner found the levels straightforward once the idea is
  learned and asked for a harder layer that mixes everything.
  - **🧠 Challenge**, a 6th tab, open from the start, with **8 puzzles** (ids `c1`–`c8`, level id `challenge`) and every
    block. The key ideas: 🌟 inside ✨ My Move, ❓ inside My Move, both together, and finding a pattern (c4 has two answers).
  - Puzzles were designed with a search through every possible program, so none has an easy shortcut.
  - **Coins: 5 per puzzle, +10 for the whole level** (owner's choice; other levels stay 3 / +5). Levels can now set their
    own `coins` and `bonus` in `CODE_LEVELS`. No save shape change. Level tabs show only icons below 760 px wide.
- New fidgets (agreed 2026-11-16, built as v1.16): all three in one PR, as three more Fidget Shelf tabs (in the new
  `19-fidgets2.js`). On a phone the 6 tabs show only their icons.
  - **🧪 Slime:** pull to stretch (one or two fingers), snaps back with a wobble; a quick poke leaves a dent.
    1 coin per 5 stretches (a pull counts once, however many fingers). Glitter Grape free; Mint Cloud 10, Galaxy Goo 15,
    Bat Goo 20.
  - **🎛️ Clicker cube:** 3 buttons, a flip switch, a roller, a joystick and a spinning ball, made of plain buttons
    (no animation loop). 1 coin per 25 clicks; the roller and ball "tick", and 4 ticks count as 1 click, so fast rolling
    doesn't earn faster than tapping. Pastel free; Emo Night 10, Soccer 15, Starry 20.
  - **🔮 Marble Maze:** 6 hand-made mazes (ids `m1`–`m6`), with no traps or timers. Tilt the device (no permission needed);
    the way it's held when a maze starts counts as flat. A finger held on the board always works too (and is the only
    way on a computer). The **📱 Tilt ON/OFF** button appears once a tilt sensor is found. +3 per new maze, +1 per replay,
    +5 once for all 6. Moon Pearl free; Candy Swirl 10, Galaxy 15, Soccer Ball 15.
  - Save version 10: `maze{solved[]}`, `fid.slime/cube/marble`, `stats.stretches/clicks/mazes`.

- Seasons, Sticker Book, Pet (plan agreed 2026-11-16): **three PRs** (owner's choice), Seasons v1.17 → Sticker Book
  v1.18 → Pet v1.19.
  - **Seasons:** 🍂 Autumn (Sep–Nov), ❄️ Winter (Dec–Feb), 🌸 Spring (Mar–May), ☀️ Summer (Jun–Aug), from the device date.
    16 decorations (4 per season, 10–30 coins) and 4 walls (20 each) in a new **Seasons tab** in Decorate (the tab's icon
    is the current season). **No limited-time pressure:** everything can be bought all year; the current season is only
    listed first. **The windows change by themselves** (owner's choice): leaves, snow, blossoms or sun in her room's
    window; leaves, snow, petals or fireflies in the Loft's night window. Plain drawings, no animation loop.
    Winter has a Snowflake Garland, because Fairy Lights were already in the Shop. No save change.
  - **Sticker Book (built as v1.18):** a 📒 button in the room's top bar. **45 stickers** on 6 themed pages
    (Fidgets 10, Art & Cards 8, Soccer 6, Stage 6, Code Lab 7, Room & Style 8). Fixed milestones, many in steps (1–3 little stars). **+2 coins per sticker**
    (owner's choice), given once; ones already earned arrive in one message the first time she opens her room.
    Unearned = grey shape + short hint. A new sticker shows a toast and a dot on 📒 (no popup during games).
    Bonus photocards are unchanged. Save version 11: `p.stickers[]`, `p.stickerNew[]` (not seen yet, for the dot),
    `stats.dailies` (a plain count, not a streak). Tapping a sticker shows the numbers ("340 / 1,000").
    Several stickers at once in the room get one box; otherwise a toast. On a phone 🛋️ Decorate shows only its icon.
    "Best Friend" (renaming the bunny) points to ✏️ in the Closet, where the rename button is.
  - **Pet (built as v1.19):** a pet bed next to Fuzzy; "Pick a pet!" with 4 original pets (tiny fluffy bat,
    ghost kitten, cloud puppy, star hamster), **all free and switchable any time** (owner's choice; hearts kept per pet).
    Tap the pet: 🤚 Pet, 🍪 Treat (2 coins), 🎀 Dress-up (5 accessories, 5–15 coins, `petacc:<id>`), ✏️ Name, 🔄 Change.
    Friendship hearts only go up (no hunger, nothing sad); tricks at 10 / 30 / 60 / 100 hearts. The pet never earns
    coins. Save version 12: `p.pet{kind, acc, names{}, hearts{}}`.
    As built: the bed sits in front, by Fuzzy's right foot (x 566, y 694). It was first next to Fuzzy's side, but the
    Silver Trophy's fixed spot hid it. Pets: Nibbles (Tiny Bat), Misty (Ghost Kitten), Puff (Cloud Puppy), Twinkle (Star
    Hamster). One heart per pat, at most every 2.5 s (so fast tapping doesn't count). A treat = 2 coins, 3 hearts.
    Accessories, one worn at a time by any pet: Pink Bow 5, Star Collar 8, Cozy Scarf 10, Tiny Witch Hat 12, Little Crown 15.
    Tricks: Wiggle (from the start), Spin 10, Hop 30, Flip 60, Dance 100. Pet messages appear in Fuzzy's speech bubble.
    4 pet stickers on the Room & Style page (49 stickers in all).
- **Buddies + Content Pack 2 (agreed 2026-11-16, the owner's request):** the nieces have two younger brothers (5 and 3).
  Add options boys might like, while every option stays open to everyone. Two PRs:
  - **Buddies (built as v1.20):** one shared body, so every outfit fits every buddy. `look.kind`: Bunny, Bear Cub, Puppy,
    Little Dino, Fox (ears and a tail change). `look.face`: Sparkly (the old face, with lashes), Bright Smile, Cheeky Grin.
    All free, in the Closet's new 🐾 Buddy and 😊 Face tabs. A boy bunny = the bunny with a Bright or Cheeky face and
    short hair (new: Buzz Cut free, Messy Mop 10, Side Part 15). New free basics: Sky Stripe Tee, Cargo Shorts,
    High-tops, Backwards Cap. Three more free furs: Sky, Ginger, Stone.
    New Room shows 6 starter looks as **pictures only** (no "boy"/"girl" words): classic emo bunny, sporty bunny, dino,
    bear, fox, soccer puppy. The starter's priced clothes are given free. Surprise me never changes buddy, face or fur.
  - **Room colour tints (v1.20):** `p.tint`. The room's colour (plus new Green and Blue) replaces the pink and purple of
    the buttons, tabs and bars, and the dark panels take a hint of it (`TINTS` in section 23). On for new rooms, off for
    rooms made before v1.20 (so the girls' rooms look the same); switch with ✏️ under the room. Pink and purple rooms
    always look classic. The profile screen is never tinted. The Easy-mode room labels take the room colour too
    (the owner found them still pink in a green room on the first try).
  - **Furniture colours + matching new rooms (v1.20, the owner's request after trying it):** `p.furn {piece: colour}`.
    Decorate's 🎨 Colours tab: Art Desk, Wardrobe, Shelf, Curtains (her room) and Computer Desk, Roof Beams, Round Window,
    Lamp (the Loft), each with Classic + 10 free swatches (`FURN_COLORS`). Nothing saved = the classic colours, so
    older rooms look the same. A new room starts in its colour: a matching wall (given free; new Lemon Dots, Leafy Green
    and Blue Dots walls) and furniture in both rooms, except the Loft's beams. Changing a room's colour later with ✏️
    doesn't repaint anything she chose.
  - **Content Pack 2 (built as v1.21):** themes dinosaurs, space and rockets, trucks/trains/cars, robots/sharks/heroes,
    in the new `24-pack2.js`. 16 clothes, 12 decorations, 4 walls, 3 floors, 17 fidget designs, photocard tags, prices
    10–30. Each entry has `p2:` its theme. 4 stickers (Dino Fan, Space Cadet, Road Trip, Hero Squad) for owning 3 things
    of a theme (a decoration counts while it is in either room or in My Stuff). No save changes (save version stays 13).
    To let a pack add new squishy shapes and spinner/slime pictures, sections 5, 10 and 19 got two small hooks:
    `SQ_EXTRAS` (a squishy's `extra` drawn behind/in front of its body) and `FID_ICONS` (a spinner or slime `deco`).

- **Phase 8 and beyond (agreed 2026-11-16):** the owner's ideas (an About with a personal message, a Goalie mode, more
  songs, math and learning games, more items) plus the backlog and Claude's suggestions, all accepted: Read to me, backup
  reminder, shop theme filters, a speed check, a coin review with "big dream" items, room snapshots, a third room.
  - **About privacy:** the repo is **public**, so the personal About words use **nicknames only** and live in the
    git-ignored `web/about-local.js`. A generic About in git fills in anything missing. The APK built on the owner's PC
    includes the local file.
  - **The third room (Backyard) comes early** (owner's choice), right after About, to give later games room to grow.
    Brain Games live at its chalkboard.
- **About & Gift Story (agreed 2026-11-16, built as v1.22):**
  - **⚙️ Settings → 💌 About** opens its own screen (`scr-about`, ⬅ Room / Back go to the room): a gold "Edition 1 of 1"
    certificate with the room's buddy, the nicknames, the signature, "Started 14 Nov 2026" and the version; the letter;
    and "🎁 The story so far" (`GIFT_TIMELINE`, one entry per version with date, icon, name and a "why" line).
  - **Personal words:** the four children's nicknames and the owner's signature are only in the git-ignored
    `web/about-local.js` (with a letter Claude drafted for the owner to edit), never in git or on GitHub. `index.html`
    loads it right after `25-about.js`; when it is missing the browser logs one "file not found" line, which the
    smoke test ignores for that file only. Each field falls back to `ABOUT_DEFAULT` on its own.
  - **Family secret:** built (tap the buddy on the certificate 5 times) but **tabled** by the owner, so it is off
    (`secret:''`). Nothing happens on the taps until a secret is written in.
  - **✨ What's New:** shown once per device on the profile screen after an update, from the `news` list of the newer
    timeline entries (at most 3). `settings.seenNew` remembers the version; like the PIN, it belongs to the device, so
    restoring a backup keeps it. A brand-new device (no rooms yet) just notes the version. No save-shape change
    (`DB_VERSION` stays 13: the new setting is filled in by `DEFAULT_SETTINGS`).
  - **Every PR from now on adds its own `GIFT_TIMELINE` entry with `news`** (the smoke test checks the last entry is
    `APP_VERSION`).
  - Fixed in v1.23: deciding "brand-new device" now happens straight away at startup (only the box waits 0.6 s). With a
    timer, a slow start could show the box to a brand-new device after a room had just been made.
- **Backyard (agreed 2026-11-16, built as v1.23):** a third free room for every profile (`p.room3`, `roomNo` 3,
  `26-backyard.js`).
  - The single 🪜/🏠 button became **two buttons, one for each other room** ("🌳 Yard", "🪜 Loft", "🏠 Room"; icons only on
    a phone, where the room bar is a little tighter). Back from the Loft or the Backyard goes to her room.
  - Sky with clouds and a sun, and the season in the air, on the tree and on the ground (no animation loop). A tree with a
    rope swing, a garden shed (both plain, spots for later games), a **soccer goal that opens Soccer**, and a chalkboard
    easel (plain until Brain Games).
  - **Fences and grounds only outside, indoor walls and floors only inside** (owner's choice). Fences: White Picket (free),
    Garden Hedge 15, Stone Wall 15, Rainbow Fence 20, Bat Night Fence 20. Grounds: Grass (free), Flower Meadow 15, Sandy
    Beach 15, Stepping Stones 15, Soccer Stripes 20. The Seasons tab shows no walls in the Backyard.
  - **8 outdoor decorations** (`yard:1`), allowed in any room and listed first in the Backyard's Shop: Trampoline 30,
    Slide 30, Sandbox 20, Kiddie Pool 20 (a flat rug-like item), Camping Tent 25, Picnic Blanket 10 (flat), Birdhouse 15,
    String Lights 15 (hang on the fence).
  - 🎨 Colours: the Garden Shed and the Chalkboard (`shed`, `easel`); a new room starts with them in its colour too.
  - Stickers: 🌳 Yard Life (5 things in the Backyard) and 🏕️ Happy Camper (3 different outdoor things). 55 in all.
  - Save version 14: `room3 {wall:'picket', floor:'grass', items:[]}`, filled in for old saves and old backups.
- **Phase 9 plan (agreed 2026-11-16):** three PRs, stacked (each branch on top of the one before).
  - **🧤 Be the Keeper (v1.24, built):** ⚽ Kick / 🧤 Keep buttons on the Soccer screen; **it remembers the last mode**
    (owner's choice, saved per room). Her own buddy and outfit stand in goal, with mint keeper gloves. Strikers: Hop the
    bouncy frog (Easy: slow glowing shots; tapping the ball catches it; she can change her dive), Bolt the robot (Medium: a
    dotted arrow hints the side) and Zip the speedy fox (Hard: fast, some curve, sometimes leans the wrong way). One dive per
    shot on Medium and Hard. 15 fixed shots per level, 5 per match, taken in turn (the turn isn't saved; it starts again
    when the app opens). Coins like Kick: +1/+2/+3 per save, +1 with the team kit, +5 for 5/5. Bronze / Silver / Gold
    **Gloves** (awards) stand in the **Backyard**, by the goal, because her first room's floor is full. Keeper matches count
    as matches (Team Player sticker) and a 5/5 counts as a perfect. Stickers: First Save, Safe Hands (25), Glove Case.
    Save version 15.
  - **📚 Brain Games part 1 (v1.25):** the Backyard chalkboard opens a menu of 3 games, each with Easy / Medium / Hard
    and **8 fixed puzzles per level** (owner's choice; ids saved like the Code Lab). +2 coins per puzzle the first time,
    +5 when a level is done; replays are free practice. No timers; a wrong answer is a gentle "Try again!". 🧁 Snack Stand
    (count cupcakes → add up an order → change from 20 and times tables), 🃏 Memory Match (6 → 12 → 20 cards with their
    buddies and items, drawn without the fuzz filter), 🫧 Number Pop (pop the 4s → pairs that make 10 → factors). Easy works
    without reading. Stickers: one per game + Brain Champ. Save `brain{game, level{}, solved[]}`, version 16. Files
    `28-brain.js` (menu + Snack Stand) and `29-brain2.js` (Memory + Number Pop).
  - **🎤 Stage song pack (v1.26):** 5 new generated songs in `30-songs2.js`: Neon Hearts (K-pop-style dance, original),
    Stadium Clap, Dino Stomp (slow, sparse notes), Rocket Launch, Moon Lullaby. The song list becomes a grid that fits 8.
    Golden Mic and Encore! rules unchanged; new song ids only, so no save version change. Stickers: Dino Stomper, Lift-off,
    Sweet Dreams, Whole Setlist (all 8).
- **Phase 10 plan (agreed 2026-11-16):** five PRs in the order of `PLAN.md`, stacked. Owner's answers: the order is fine
  and the speed check stays last (the app is fast today; it's there to catch slowness the new features might add);
  gifts are **decorations and coins only, with no PIN check**; 5 big-dream items at 60–100 coins are fine (more can be
  added later); 🔊 Read to me is **on by default in Easy mode**, off otherwise.
- **Grown-up helpers (built as v1.30, `34-helpers.js`, the only Phase 10 PR that changes `android/`):**
  - 💾 `settings.lastBackup` (ms, belongs to the device: `doRestore()` keeps it) is set when a backup file is saved or
    the code is copied. On Android, the wrapper calls `backupSaved()` only after the save picker really wrote the file.
    ⚙️ Settings shows "💾 Last backup: never / today / yesterday / N days ago" in small text under the version.
  - 🔊 Read to me: a capture-phase click listener speaks the tapped button's `aria-label`, its `.tn` text or its text
    (emoji stripped, max 60 letters), or a hotspot's name (`HOT_WORDS`), through `AndroidBridge.speak`. Never during a
    Stage song; the same words twice within 0.8 s are said once. `p.speak` is null (follow Easy mode) until someone
    uses the ⚙️ switch, which only shows when the wrapper can speak (the browser has no switch and stays quiet).
  - 📷 A round button under 🌙 (hidden while decorating, id `roomSnapBtn`: the card maker already has `snapBtn`)
    saves the room at 1500 × 1050; "📷 Save picture" in a photocard's box saves the card at 3× size. The SVG is copied
    with the shared `#gdefs` (patterns, fuzz), without the speech bubble, emotes and Easy-mode labels (they use CSS
    colours), drawn into a canvas and saved via `AndroidBridge.saveImage` (save picker) or a download.
  - Android: `TextToSpeech` started in `onCreate` and shut down in `onDestroy`; `saveImage` (request 43); a
    `<queries>` entry for `TTS_SERVICE` in the manifest (needed on Android 11+, not a permission). No new permissions.
  - Sticker: 📷 Say Cheese! (Art & Cards page). 72 in all.
  - Save version 20: `speak`, `stats.snaps`.
- **Shop filters & big dreams (built as v1.29, `33-shopplus.js`):**
  - Theme chips are the first row inside the Closet grid and the Decorate Shop grid (`themeFilter(where, list)`).
    An item's themes: `THEME_IDS` (older items, by `category:id` or `decor:<key>`), plus `p2`, `yard:1` → Outdoor and
    `dream:1` → Dreams. Only themes present in the list on screen get a chip; a chip with nothing in a new tab falls
    back to All. The choice is remembered while the app is open (not saved). Icons only on a phone and in Easy mode.
  - **No 🍂 Season chip** (it was in the plan): seasonal things aren't in the Shop or the Closet (they have their own
    tab), so it would always be empty. A ⭐ Dreams chip took its place.
  - Big dreams (`dream:1`, the only items above 40): Canopy Bed 100, Arcade Cabinet 80, Castle Bunk Bed 90, Rocket
    Playhouse 80, Aquarium 60, all original art. Gold border and ⭐ in the Shop. Tapping one she can't afford asks
    "⭐ Save up for it?" and sets `p.dream`; tapping it again says how many more. A "Saving for…" bar (picture,
    progress, ✖) sits at the top of the Shop. With enough coins it's a normal buy, which clears the goal.
    The Arcade and the Aquarium have `NIGHT_GLOW` entries.
  - Sticker: 🌈 Dream Come True. 71 in all.
  - Save version 19: `dream` ('' or a DECOR key).

- **Gifts & room layouts (built as v1.28, `32-gifts.js`):**
  - 🎁 Give opens from ⚙️ Settings and from a 🎁 tile at the start of My Stuff (only when there is another room on the
    tablet). Three steps, each a modal: what (🪙 5 / 10 / 20, or one tile per kind of decoration in My Stuff; no posters
    or `award` prizes) → who (every other room, as big buttons with its badge and colour) → ✔ / ✖. **No PIN** (owner's
    choice). The giver's coins or the item leave at once; the gift goes into the other room's `gifts[]` inbox as
    `{id, from, badge, kind:'coins', n}` or `{…, kind:'decor', type}` (a new item uid is made when it's opened).
  - The inbox shows as a wrapped gift pile (`data-hot="gift"`, with a count) at `GIFT_SPOT` (262, 690) in every room,
    clear of the trophies, the pet and the buddy. Tapping it opens the oldest gift: confetti, "A gift from …", coins
    added or the decoration placed in the room on screen. A gift of a decoration this app doesn't know (from a newer
    backup) waits unopened and isn't drawn.
  - 🏠 Layouts: a 7th Decorate tab. 3 slots per room (`presets['1'|'2'|'3']`), each `{wall, floor, items:[{uid,type,x,y}],
    at}` with a small picture. Saving over a slot and loading both ask first. Loading puts what's in the room now into
    My Stuff, then moves each saved item (found by uid in My Stuff or any room) back to its spot; items gone since
    (given away) are skipped and she's told how many. The wall and floor come back only if still owned and of the right
    kind (fence/ground in the Backyard).
  - On a phone, Decorate's ✔ Done shows just ✔ so the 7 tabs fit.
  - Stickers: 🎁 Kind Heart (`stats.gifts`), 🏠 Interior Designer (a layout saved). 70 in all.
  - Save version 18: `gifts[]`, `presets{}`, `stats.gifts`.

- **Looks, emotes & night mode (built as v1.27, `31-looks.js`):**
  - ⭐ My Looks: a row under the buddy in the Closet with 4 slots and 💾. Empty slot = keep the outfit there; full slot =
    wear it; 💾 then a full slot = replace it (a ✔/✖ box with before and after pictures). A look is every `look` key except
    `kind`, `face` and `fur`; wearing it only puts on things she owns (and ignores unknown ids).
  - Emotes: tapping the buddy still hops and says a line, and also shows a bar of 4 big buttons at the bottom of the room
    (👋 Wave, 💃 Dance, 😂 Laugh, 💤 Nap). It hides after 6 s, when the room redraws, and while decorating. Each emote
    is one CSS animation class on `#mascotG` (1.5–3.2 s), floating emoji, a generated sound and a speech bubble.
  - 🌙 Night: a round button in the room's top-left corner (hidden while decorating), saved per room in `p.night`.
    `nightLayer()` (called by `renderRoom`) adds one dark rectangle with an SVG mask that has soft holes around the buddy,
    the Loft's pendant lamp and every placed `NIGHT_GLOW` decoration, plus a coloured halo for each lamp. Windows get a
    night sky and moon; indoor walls get glow-in-the-dark stars; the Backyard gets a moon over the sun and stars. It has
    `pointer-events:none`, so every hotspot still works in the dark. No animation.
  - Stickers: ⭐ Fashionista (4 looks kept), 🌙 Night Owl (`stats.nights`, lights turned off at least once). 68 in all.
  - Save version 17: `looks` (4 × null or an outfit), `night {'1'|'2'|'3': true}`, `stats.nights`.
- **Song pack (built as v1.26):** the song list is a grid (4 across on the tablet, 2 on a phone, descriptions hidden on a
  phone). Encore! is pinned to `starlight/bats/sugar`; the Every Song sticker now needs all 8 (stickers already earned stay).
- **Brain Games (built as v1.25):** a game opens straight on its first unsolved puzzle (one tap from the menu), with level
  tabs and 8 numbered puzzle buttons to jump around; the level is remembered per game. Answers are big buttons (Snack
  Stand), cards (Memory) or floating bubbles (Number Pop). Medium Number Pop does pairs that make 10, then 20. Memory
  pictures: her buddy, the 5 buddies in her outfit, the 4 pets and room things. The Sticker Book's Code Lab page is now
  called "Code & Brain" and holds the 4 new stickers (Brain Champ needs all 9 levels).
- **Phase 11 plan (agreed 2026-11-17):** six PRs in the order of `PLAN.md`, stacked. Owner's answers: games first
  (Brain 2a → 2b → Pack 3 → Pack 4 → Extras → Music Maker); include the Music Maker, last; Fact Cards get their own 🪐 binder.
- **Phase 12 (Playability), talked through 2026-11-17.** The owner liked all the ideas (see `PLAN.md`) and may not do them
  all at once. Owner's answers for the fourth room: keep it **bare** (nothing built in), with a free **Built-in Shelf** in
  the Shop as an option; the main room's **window leads to the Backyard** and Soccer is opened from the Backyard goal only;
  the top bar's room buttons become a **🗺️ house map**, so more rooms can be added later. Arrow tabs at the screen edges
  (not drawn doors) were chosen so decorations can never cover the way between rooms. The owner named the room ✨ Studio,
  and agreed her room also gets a ⬅️ Backyard arrow (the same kind of arrow everywhere for the younger ones), with the
  window as a secret shortcut.
- **Studio + getting around (built as v1.40, `41-studio.js`):** `ROOM_MAP` (room, icon, name, `from`, `dir`, map `col`/`row`)
  drives both the edge tabs (`#roomTabs`, HTML over the picture, hidden while decorating) and the 🗺️ map popup. The Studio is
  `p.room4` (save version 23, `MIGRATIONS[23]` + `normalize`); its wall and floor are `''` until the first visit, when
  `studioStart()` gives it her room colour's wall (`ROOM_START`) and wood. `nightBack()` only draws the Loft window in the Loft
  (it used to draw it in any room but her first one). The Built-in Shelf (`builtShelf`, free, `first:1`, 440 wide) is first in
  every room's Shop; free things skip the buy question and show "Free". Her window's Easy label is now 🌳 Outside (it said
  ⚽ Soccer), and Read to me calls it Backyard. Sticker ✨ Studio Star (89 stickers).
- **Night stars (v1.40, the owner's request 2026-11-17):** the glow-in-the-dark stars on the indoor walls are gone (the owner
  didn't want stars showing inside), and the Backyard's 9 scattered sky stars now form the **Big Dipper** (7 stars, no
  connecting lines; a first try with lines and wall stars in every room was turned down). It sits between the tree and the
  moon. The window skies (her room, the Loft) keep their own few stars.
- **Arrow tabs on an upright phone (v1.40, the owner's request 2026-11-18):** on a tall screen (`max-aspect-ratio:4/5`) the
  room picture is a band in the middle, and the tall side tabs covered a big part of it. There the ⬅️/➡️ tabs become wide,
  short pills in the empty strip under the picture (the ⬆️ tab was already in the strip above), and the emote bar moves up
  so it doesn't cover them. Tablets, landscape phones and Easy mode's bigger tabs elsewhere are unchanged.
- **Curve Balls (built as v1.56, in `13-soccer.js`), agreed 2026-11-20.** The owner asked how Flap decides where to dive, then asked for
  more skill (like the Trick Shots' curves) so a perfect game is nearer 1 in 50. How the keeper picks: when she kicks, one roll picks
  "guess right" (`read`), "stay in the middle" (`stay`) or "guess a side". Since v1.56 the read chance is lowered by up to 30% for a big
  curve and 15% for a hard flick (`CURVE_SKILL`, `socSkill`), and a curved shot that isn't read sends the keeper the wrong way up to half
  the time (`shot.fooled`, "Curve ball! 🌀"). Applies to all three keepers. Taps and straight shots are nearly unchanged. Simulated odds
  of a 5/5 against Flap: tap near a post 1 in 120 (was 155), big curve + hard flick to a corner 1 in 22 (was 800). No save changes.
- **Pet Walks (built as v1.55, `56-walk.js`), agreed 2026-11-20** (the owner said "start on walk pr"). Built as planned: 4 free paths, hold 👣 to
  walk, 5 sniffs a walk, 32 finds (animals only said hello to), +1 heart a find and +3 a walk, a 🫙 treasure jar per full path into My Stuff.
  The first sticker is called Walk Buddy (Runway already has "First Walk", id `walk1`, so these ids start with `petWalk`). Save version 36.
  3 stickers (136 in all).
- **Pet Hide & Seek + Fetch (built as v1.54, `55-petplay.js`), agreed 2026-11-20.** Owner's answers: Hide & Seek, Fetch and Walks, hearts and
  stickers only (no coins), a walk on its own path scene; plans agreed ("go for it"), two PRs. Built as planned, except: a room needs 2 hiding
  spots (not 3), the pet may also hide higher up behind a solid part (desks and keyboard stands have open legs), at least 8% peeks out (16% in
  Easy mode), and 🌙 hides during a game. Toys: ball (free), bone 6, yarn 8, disc 10. Save version 35. 4 stickers (133 in all).
- **Trick Shots (built as v1.53, `54-tricks.js`), agreed 2026-11-20.** Picked with Stage Jam from the Phase 12 "Later" list. Owner's answer:
  **a fixed trick list** (not endless targets). 12 tricks, unlimited tries, a 💡 dotted path after 3 misses, +3 the first time, +1 a replay
  (10 a day), the 🏅 Trick Shot Star in the Backyard for all 12 (at `TROPHY_SPOTS.trickStar`, 745/695). No keeper: Mochi, Boo and Flap
  cheer at the side or stand as the wall. The bell hangs under the crossbar (a swipe can't reach the bar). Save version 34. 3 stickers
  (129 in all). On a phone the 🎯 tab shows its icon only.
- **Stage Jam (built as v1.52, `53-jam.js`), agreed 2026-11-20.** Picked by the owner from the Phase 12 "Later" list ("Stage freestyle").
  Owner's answers: **jam over her loop** (her 🎹 loop is the band, she taps 5 pads on top; not a tap-along chart made from the loop);
  Jam and 🎯 Trick Shots are **two PRs**. 5 pads = the Music Maker's C D E G A (✨ Sparkle an octave up); 3 free jam sounds
  (✨ Sparkle, 🎸 Pluck, 🎺 Toot). +2 coins per jam of 20+ notes, 3 a day. No new screen: it lives on `scr-stage` (`STG.state` `jam`/`jamdone`),
  sharing `stgScene()`/`stgBounce()` with songs. Save version 33: `jam{sound, pay}`, `stats.jams/jamOwn`. 3 stickers (126 in all).
  The loop on the grid counts as her own for 🎹 My Own Song, like her saved loops.
- **Runway (built as v1.51, `52-runway.js`), agreed 2026-11-20.** Picked by the owner from the Phase 12 "Later" list. Owner's
  answers: her own clothes **plus a 👜 Borrow rack** (any closet item for one show, free, never owned); the judges (3 visitor
  friends) hold up **cheer cards** (💖 / 🌟 / 🤩, every walk gets cheers, no score); **+3 coins a show, 15 a day**; a **👠 button
  in the Closet**. 14 theme cards tied to theme chips (✨ Anything Goes has none and always gets 🤩). Her outfit changes only with
  👗 Wear it home (owned pieces only). Save version 32: `runway{pay, cards[]}`, `stats.walks/wows`. 3 stickers (123 in all);
  Crowd Favorite counts 🤩 on themed cards only. No visitor wish (each friend has exactly 3).
  **Bug found by the owner (2026-11-20), fixed in the same PR:** a second room's buddy showed as a broken image on the Runway.
  The 🦕 Little Dino and 🦊 Fox buddies and the Messy Mop hair repeated `stroke-linejoin` (already in `st()`), which a page
  forgives but a picture made from the SVG does not. The 💃 Dance Maker and 📷 snapshots had the same problem with those looks,
  and so did 🏛️ Dino Bones (a repeated `fill`). All fixed; the smoke test now parses every look and decoration as strict XML.
- **Backyard Garden (built as v1.48, `49-garden.js`), agreed 2026-11-19.** Picked by the owner from the Phase 12 "Later" list.
  Owner's answers: plants **grow by themselves** (one step a day by the device date, ready in 3 days, never wilt); picking gives
  **+3 coins and, the first time, a pot**; **4 free seeds + 8 to buy** (8–15 coins, once); **6 plots**. The shed (the old "spot for a
  future game") opens it. Watering is only for fun, so forgetting it costs nothing. A plot remembers the biggest step it reached,
  so moving the date back never shrinks a plant. A new pot goes straight into the Backyard, like a visitor's plush.
- **Dance Maker (built as v1.47, `48-dance.js`), agreed 2026-11-19.** Picked by the owner from the Phase 12 "Later" list.
  Owner's answers: opened from **the Music Maker and the Stage**; **8 free moves**; **8 beats**. The buddy can't move its arms
  or legs on its own (sleeves and arm warmers are drawn on top of the body), so moves are whole-body CSS animations on a picture
  of the buddy drawn once. Save version 28: `dance{cur, music, slots[3], songs[], pay{day,n}}`. +3 coins per saved new dance,
  3 a day. 3 stickers on the Stage page (110 in all). Also the owner's request (2026-11-19): the Loft's 🎤 Stage sign now hangs
  right above the 🎹 keyboard (it was between the window and the desk), so the music things are together.
- **Little Ones' Corner (built as v1.46, `46-little.js` + `47-colorbook.js`), agreed 2026-11-19.** Picked by the owner from the
  Phase 12 "Later" list. Owner's answers: a **🧸 Play button in the top bar** of every room; **+1 coin** per finished picture or
  Peekaboo friend, **10 a day**; **🖼️ Hang it up** saves a colored picture into the Art Desk Gallery (drawing coin rules); the
  12 pictures (dino, rocket, dump truck, train, shark, robot, buddy, kitten, flower, cupcake, butterfly, house). Save version 27:
  `little{colors, hung, pay}`, `stats.colored/peeks/pads`. A new 🧸 Play sticker page with 6 stickers (107 in all; a page
  needs 6 or more). On a phone the room bar's button row has 5 columns.
- **Word Bank (built as v1.45, `45-words.js`), agreed 2026-11-19.** From the owner's SpellingWords.txt (the words are typed into
  `WB_BANK`; the file itself is not in the repo). Owner's answers: 🎲 **and** the 📅 daily turn (6 games now); Easy = **trace**
  (faint letters in the slots, a picture where there is one), Medium/Hard = **👀 look, ✋ hide, spell** (👀 Peek any time, no timer,
  progress kept); 🔊 on every level (the tablet's voice, even with Read to me off). Left out: 1–2 letter words, the homophones
  section, harass, illegal, cemetery, explosion, and photosynthesis, international, misunderstand (over 11 letters). Added: web, bat,
  cub / robot, rocket, slime, goal, ghost, comet / dinosaur, volcano, galaxy, astronaut, telescope. Pictures (`WB_PICS`) only for
  words with a clear one. Extra letters are never letters of the word, so there is only one way to spell it. A bank word is
  `{bank:1, w, x, pic}` and is played by `wbBankStart`; the fixed puzzles still use the old `start`. No save change.
- **American spelling (built as v1.44), agreed 2026-11-19.** The children learn American English. Owner's answers: the season
  label is **Fall** (the saved id stays `autumn`); **on-screen text and code comments** switch (the smoke test too); the docs
  stay as written, and new doc text is American. Changed on screen: Room color, Color the buttons too, 🎨 Colors, nothing to
  color, the Art Desk's spoken "Color", the Tire spinner, "favorite" in 3 Gift Story lines, "Calm and cozy" (Moon Lullaby).
  No saved id changed (none contained these words). `web/about-local.js` (personal, not in git) was not touched: the owner can
  check it by hand.
- **Free Play + Puzzle of the Day (built as v1.43, `44-freeplay.js`), plan agreed 2026-11-19.** Owner's answers: 🎲 is **always open**
  (it glows once a level's fixed puzzles are done); **+1 coin each, 10 a day**; the 📅 card is on the **Brain Games menu**; it pays **+5**.
  The daily game turns through **5 Brain Games only** (Pattern Train, Number Pop, Snack Stand, Memory Match, Fraction Bakery), because
  the Maze and Code Lab live on other screens; those 5 get 🎲 too, as do the Maze and Code Lab (Easy/Medium). Word Builder and Fact
  Cards are left out: words and facts can't be made up. **The owner will think about a word bank for Word Builder later.**
  Each game has a maker (`FP_MAKERS[g].make`) and a check (`ok`) that uses the same rules as the fixed puzzles; the dice roll again
  until the check passes. Seeds use `brRand`, so the daily puzzle (seeded with the date) is the same all day. Made-up puzzles are
  never saved and never change solved lists, ticks, level bonuses or Brain Champ. Save version 26: `free{day, n}`, `potd{day}`,
  `stats.free`, `stats.potd`. 3 stickers on the Code & Brain page (101 in all).
- **Two-player games (built as v1.42, `43-together.js`), plan agreed 2026-11-19.** Owner's answers: player 2 **picks their room or
  👤 Guest**; **+3 coins** per finished game for each room (not a Guest), **15 a day**; **gentle scores** (both scores shown, the end box
  cheers both, a tie is "you're both stars"); a **👯 button in each game**. Soccer Duel is real-time on one screen: the kicker swipes
  below the goal (`socAim`, the Kick swipe, moved out of `socRelease`), the keeper may dive only once the ball flies; Easy/Medium/Hard
  set the ball speed from `STRIKERS`; 10 shots, alternating. Memory for 2: classic rule (a pair = another go). Stage Together: the
  `duo` level (Medium's 2-lane chart with Easy's fall time and timing windows). Nothing personal (bests, stars, trophies, solved
  puzzles, matches) changes. Save version 25: `duo{day, n, soccer, memory, stage}`. 3 stickers on the 🚪 Friends page (98 in all).
- **Visitors (built as v1.41, `42-visitors.js`), plan agreed 2026-11-18.** Owner's answers: **one new friend a day** (the first
  right away; after a wish comes true the next knocks the next day; a friend never leaves); thank-you = **+5 coins** per wish and,
  after a friend's 3 wishes, **a plush of them** (`plushMochi` … `award:1`, placed where the friend stood); the friend stands
  **in every room** (`VISIT_SPOT` x 880, y 676, in the floor layer like the gifts); when she lacks things, **💡 Help + 🔄 swap**
  (a line on the card opens the Shop or Closet with that theme chip, the Art Desk, or the Backyard; 🔄 picks the next wish not done).
  The strikers are only drawn from behind in Keep mode, so all six friends got new front-view SVG drawings (same colours).
  18 wishes, checked with the theme chips (`themesOf`), so new themed items count. Not done yet: a kind "Almost!" line, no coins.
  Save version 24: `visit{cur, day, done[]}` + `stats.wishes`. 6 stickers on a new 🚪 Friends page (95 stickers, 7 pages).
- **Bonus photocards can't be deleted (v1.33, owner's request):** they are won once (`bonusGot`), so a deleted one was
  gone for good. `cardModal` leaves out 🗑️ Delete for a card with `bonus`, and `delCard` refuses one.
- **Pattern Train & Word Builder (built as v1.33, `35-brain3.js`):** game ids `train` and `word` (puzzle ids `train:e1`…,
  `word:e1`…); `normalize()` knows the 5 game ids. Wagons are short codes (Easy colour `r`, Medium shape+colour `Sy`,
  Hard numbers); the train is drawn once in SVG (no loop) and the engine is at the front. Word pictures are an emoji or one
  of their own room things/buddies (`memPic`); emoji newer than Android 8 were avoided. Medium shows faint letters in the
  slots; Hard does not. Brain Champ was changed to count only `snack memory pop`, so it keeps meaning "all 3 games".
  No save version change.
- **Fidget allowance (v1.36, owner's request, agreed 2026-11-17):** a pop-it swipe earned about 8 coins every couple of
  seconds with no limit. Owner picked a shared daily allowance of **30 fidget coins** (pop-it pops and flips, squishy,
  spinner, slime, clicker), like the Art Desk's daily art coins. `fidEarn()` in section 10 pays up to what is left (a
  flip near the limit pays only the rest); after that the fidgets still work and count for stickers, and one gentle
  toast says "Fidget coins are full for today! Keep playing for fun ✨ Games still give coins." (once per room per day,
  no countdown, no "come back" message). It refills quietly when the date changes. The marble maze and games are
  not included. Save version 21: `fidPay{day,n}` per profile (normalize + MIGRATIONS[21]). The flip bonus stays +5.
- **Room depth (built as v1.39), agreed 2026-11-17 (the owner's request).** History: the first rooms drew standing things,
  the buddy, pet and gifts sorted by floor `y`. In v1.28 that sort was commented out by mistake, and v1.31 then made list
  order ("last touched in front") the rule on purpose. Built-in furniture was never sorted: it was drawn first, so any
  decoration covered it, which hid the new Loft keyboard. Owner's answers: bring the floor sort back; the buddy, pet bed and
  gifts join it (as originally); built-ins (and the buddy, pet, gifts) fade to 35% and let taps through while decorating;
  a separate PR from the Music Maker. Floor positions: closet 564, art desk 582, keyboard 590, code desk 594, shed 470,
  goal 492, tree 572, easel 612, buddy 604, gifts 690, pet 694. Wall pieces (windows, corkboard, the fidget shelf, the
  Stage sign, lamps, the yard ground) stay behind everything. Posters on the wall are now behind the closet where they
  overlap it (before, they were drawn on top). Rugs and wall things keep `toFront`. No save change.
- **Music Maker (built as v1.38, `40-music.js`), plan agreed 2026-11-17.** Owner's answers: a free built-in 🎹 keyboard in the
  Cozy Loft opens it (not the bought Music Speaker); +3 coins per saved new loop, 3 a day (`MU_DAILY`, like the Art Desk);
  the melody uses only C D E G A (a pentatonic scale), so any pattern sounds nice. The grid is 9 rows (A G E D C, then
  🔔 bell, 🥚 shaker, 👏 clap, 🥁 drum) x 8 steps; a finger can slide to paint a row. 3 sound kits (`soft chip dreamy`,
  saved ids), 3 speeds (84 / 104 / 126 beats a minute, saved as 0-2), 3 💾 slots with a little picture, 🎁 3 ready-made
  loops (Bat Bop, Bunny Hop, Sleepy Stars), 🗑️ Clear (asks first). Loading over a loop that isn't saved anywhere asks first.
  A loop pays only when it is new for that slot and has 3+ notes; after 3 a day saving still works, with one gentle note.
  Sound: the Stage's voices (`sTone`, `sKick`, `sSnare`, `sNoise`) are scheduled 0.15 s ahead on the audio clock; the
  light on the step uses the same "Sound late?" setting as the Stage. The room music rests while a loop plays
  (`startMusic` checks `MU.playing`). Speed: the main loop runs on the Music Maker only while a loop plays
  (`loopWanted()` in 99), not just because the screen is open; leaving the screen or the app stops the loop.
  Save version 22: `music{kit, speed, cur, slots[3], pay{day,n}}`; a loop is 72 characters of 0/1. normalize() checks
  the types, and backups from before v1.38 restore with an empty Music Maker. Sticker: 🎹 Beat Maker (Stage page).
  On a phone held upright the squares are about 40 px (9 columns must fit); on a tablet they are 64 px.
- **Extras (built as v1.37, `39-extras.js`):** the new file only pushes onto `CODE_PUZZLES.challenge` (c9–c14),
  `MAZES` (m7–m12) and `STICKERS`. Each Challenge puzzle was checked by a full search (no answer without ✨, or
  without ❓ when it has puddles); two first drafts had shortcuts and got extra puddles and blocks. New ideas:
  ⬅️/⬇️ in My Move (c9, c12), 🔁 + ❓ inside My Move (c10, c14), a 5-block My Move (c11, c14) and ✨ mixed with
  other blocks in the program (c13). The level bonus (Challenge +10, all mazes +5) is paid once more when the bigger
  list is finished: it was always "when every puzzle is solved", and keeping it that way was simpler and fair.
  Stickers: Marble Marathon (`stats.mazes` 25, replays count), Level Collector (3 Code Lab levels done) and Code
  Master (all 44 Code Lab puzzles; it counts only known ids). With 12 maze buttons, a short screen (phone sideways)
  squashed the board, so under 500 px tall the bar is one row that scrolls and keeps the current maze in view.
  No save version change.
- **Content Pack 4 (built as v1.36, `38-pack4.js`):** themes are a new field `p4` ('sport' 'farm' 'ride' 'space' 'dino');
  only 🐮 Farm is a new chip, the rest reuse ⚽ Sport, 🚗 Ride, 🚀 Space and 🦕 Dino. The dino nugget is an original chunky
  long-neck dinosaur in golden crumbs (no brand or packaging), drawn once by `p4Nug()` and reused by the plush, the tee
  and (in canvas) the squishy. The plush needed no new shelf code: any standing decoration snaps onto a shelf, and it is
  about 125 wide, so it fits the Little Shelf (160). Big Adventures needs 5 (ride + space), a step up from Pack 2's 3.
  Also (owner's request): the 🚀 rocket picture used by Rocket Goo and the Rocket spinner (`FID_ICONS.rocket`, section 24)
  was redrawn: a rounder nose, slanted fins, a porthole and an orange flame under a narrow nozzle, in place of the flat
  bottom that looked odd. The 🚀 Rocket pop-it board shape was not changed.
  The pack itself changes no save data; the fidget allowance (above) is save version 21.
- **Content Pack 3 (built as v1.35, `37-pack3.js`):** themes are a new field `p3` ('stage' 'cozy' 'cafe' 'ocean'), not `p2`,
  so Pack 2's checks and stickers stay the same; `themesOf()` reads it. 🎤 Stage reuses the existing chip; 🍵 Cozy,
  🧁 Cafe and 🐚 Ocean are new chips, put before 🌳 Outdoor and ⭐ Dreams. `p3Have()` counts clothes and decorations by
  their chip (so older stage things count for Stage Star) and walls/floors/fidgets by `p3`. The decorations come in
  4 matching sets (same colours). "Cozy anime-style" means generic looks only (big sweater, sailor collar, kitty beret,
  a blanket table, a paper lantern); nothing from a real show. No save version change.
- **Fraction Bakery & Fact Cards (built as v1.34, `36-brain4.js`):** game ids `bake` and `facts`. Fact cards are unlocked by
  `brain.solved` (no `facts[]` field, unlike the plan: simpler, and backups can't get out of step). The binder is a
  view of the Brain Games screen (`BR.view='facts'`, `factBinder()`), opened by a button that section 28 adds through
  `BR_MENU_EXTRA`; a game may give `winExtra(pz,l,idx,first)` for extra HTML in its win box. Facts were checked for
  accuracy and kept simple; the topics are 5 dinosaur, 9 space and 10 ocean cards. No save version change.

## Owner's working preferences
- Personal gift for family; practice project. Never for sale or public sharing.
- $0 beyond the Claude subscription. Use free tiers and free tools only.
- Original characters/music *inspired by* her interests (no real idols, anime or game characters).
- Same working style as the owner's other projects: feature branches + PRs, the owner merges,
  plan before big changes, ask before heavy builds, docs written in plain language.
- Tools: VS Code for the repo, Android Studio for building `android/`. Windows PC, Android devices.

## Third-party assets
- None. All art, sounds and music are generated by code (`web/js/`).

## Next steps (Phase 1)
1. ~~Branch, commit, push, open the PR (v1.0).~~ Done: v1.0 is on `main`; cleanup PR is v1.1.
2. ~~Owner: build the APK and sideload.~~ Done, no build errors.
3. ~~Fix whatever the first build or the real tablet shows.~~ Nothing to fix so far.
4. ~~`APP_VERSION`, About line, save-upgrade hook.~~ Done in the v1.2 PR. After merging, install v1.2 **over** the
   current app and check her room is still there and Settings shows "version 1.2". That completes Phase 1.
5. ~~Plan Phase 2 (Art Desk) and get it agreed.~~ Agreed and built (v1.3 PR).

## Next steps (Phase 2)
1. ~~Check on a device that drawings survive closing the app.~~ Done on an Android phone (2026-11-15).
2. ~~Owner: merge v1.2, then the v1.3 PR.~~ Merged. Install **over** the app on her tablet and check that her room is still there.
3. ~~Plan Phase 3 (Photocard Wall) and get it agreed before coding.~~ Agreed and built (v1.4 PR).

## Next steps (Phase 3)
1. ~~Owner: build v1.4, install it over the app, and try the Photocard Wall.~~ Done, all checks passed.
2. ~~Check that cards and pins survive closing the app and installing an update.~~ Done.
3. ~~Merge the v1.4 PR.~~ Merged.
4. ~~Plan Phase 4 (Soccer Field) and get it agreed before coding.~~ Agreed and built (v1.5 PR).

## Next steps (Phase 4)
1. ~~Owner: build v1.5, install it over the app, and play the Soccer Field.~~ Done (swipes fixed, trophies added).
2. ~~Merge the v1.5 PR.~~ Merged.

## Next steps (squishy upgrade, then Phase 5)
1. ~~Owner: build v1.6 and try the squishy (see the PR). Merge the v1.6 PR.~~ Merged.
2. ~~Plan Phase 5 (Stage rhythm game) and get it agreed before coding.~~ Agreed and built (v1.7 PR).

## Next steps (Phase 5)
1. ~~Owner: build v1.7 and play the Stage. Merge the v1.7 PR.~~ Merged.
2. ~~Plan Phase 6 (little-sister polish) and get it agreed before coding.~~ Agreed and built (v1.8 PR).

## Next steps (Phase 6)
1. ~~Owner: build v1.8 and try it. Merge the v1.8 PR.~~ Done, everything works.

## Next steps (Phase 7)
1. ~~Decide which Phase 7 item comes first.~~ Code split, then content pack + second room, then Code Lab.
2. ~~Merge the v1.9 PR.~~ Merged after a device check.
3. ~~Plan the content pack + second room (v1.10).~~ Agreed and built (v1.10 PR).
4. ~~Owner: build v1.10 and try the Loft.~~ Everything works. Merged.
5. ~~Owner: build v1.11 and merge it.~~ Merged.
6. ~~Plan Code Lab and get it agreed.~~ Agreed (see "Decisions made").
7. ~~Owner: build v1.12, try the Stage in the Loft and the labels, and merge it.~~ Merged.
8. ~~Build Code Lab (v1.13) on the Loft's computer desk.~~ Built (v1.13 PR).
9. ~~Owner: build v1.13, try the Code Lab (see the PR), and merge it.~~ Merged; it all works on the device.
10. ~~Pick the next Phase 7 item.~~ Code Lab: My Move + If (v1.14), built (v1.14 PR).
11. ~~Owner: build v1.14, try the ✨ My Move and ❓ If levels (see the PR), and merge it.~~ Merged; worked great.
12. ~~Next: a harder Code Lab layer.~~ 🧠 Challenge level built (v1.15 PR).
13. ~~Owner: build v1.15, try the Challenge puzzles (see the PR), and merge it.~~ Merged.
14. ~~Pick the next Phase 7 item.~~ New fidgets (v1.16), built (v1.16 PR).
15. ~~Owner: build v1.16, try the slime, clicker and tilt maze on the tablet (see the PR), and merge it.~~ Merged.
16. ~~Pick the next Phase 7 item.~~ Seasons + Sticker Book + Pet, planned and agreed as three PRs.
17. ~~Owner: build v1.17, try the Seasons tab and the windows (see the PR), and merge it.~~ Merged; everything looks good.
18. ~~Build the Sticker Book (v1.18).~~ Built (v1.18 PR).
19. ~~Owner: build v1.18, try the Sticker Book (see the PR), and merge it.~~ Merged; all looks good.
20. ~~Build the Pet (v1.19).~~ Built (v1.19 PR).
21. ~~Owner: build v1.19, try the pet (see the PR), and merge it.~~ Merged. That finished Seasons + Sticker Book + Pet.
22. ~~Pick the next item.~~ Buddies + Content Pack 2 (agreed 2026-11-16).
23. ~~Owner: build v1.20, try the buddies and tints (see the PR), and merge it.~~ Merged.
24. ~~Build Content Pack 2 (v1.21) from `main` after v1.20 is merged.~~ Built (v1.21 PR).
25. ~~Owner: build v1.21, try the new things (see the PR), and merge it.~~ Merged. That finished Phase 7.

## Next steps (Phase 8)
1. ~~Plan Phase 8 and beyond.~~ Roadmap agreed 2026-11-16 (in `PLAN.md`).
2. ~~Agree the detailed plan for 💌 About & Gift Story (v1.22), then build it on `feature/about`.~~ Built (v1.22 PR).
3. Owner: read the drafted letter in `web/about-local.js` and change anything; keep a copy of the file somewhere safe.
   Later, if a family secret comes to mind, put it in `secret:` there.
4. ~~Owner: build v1.22, try the About and the What's New box (see the PR), and merge it.~~ Merged.
5. ~~Plan the 🌳 Backyard (v1.23) in detail and get it agreed.~~ Agreed and built (v1.23 PR).
6. ~~Owner: build v1.23, try the Backyard (see the PR), and merge it.~~ Merged.
7. ~~Plan 🧤 Be the Keeper (v1.24) in detail and get it agreed.~~ Phase 9 plan agreed; v1.24 built.

## Next steps (Phase 9)
1. ~~Owner: build v1.24, try 🧤 Keep (see the PR), and merge it.~~ Merged.
2. ~~Build 📚 Brain Games part 1 (v1.25) on `feature/brain` (on top of `feature/keeper`).~~ Merged.
3. ~~Build the 🎤 song pack (v1.26) on `feature/songs` (on top of `feature/brain`).~~ Merged.
4. ~~Plan Phase 10 (backlog + helpers) in detail and get it agreed.~~ Agreed 2026-11-16.

## Next steps (Phase 10)
1. ~~Build 👗 Looks, emotes & night mode (v1.27) on `feature/looks`.~~ Built (PR #27); the owner tested it.
2. ~~Build 🎁 Gifts & room presets (v1.28) on `feature/gifts` (on top of `feature/looks`).~~ Merged (PR #28).
3. ~~Build 🔎 Shop filters + 💰 big dreams (v1.29) on `feature/shop`.~~ Merged (PR #29).
4. ~~Build 🧑‍🔧 Grown-up helpers (v1.30).~~ Merged (PR #30).
5. ~~🛋️ Room tweaks (v1.31).~~ Merged (PR #31).
6. ~~Build ⚡ Speed check & tidy-up (v1.32), the last Phase 10 PR.~~ Built (PR #32).
7. Owner: build v1.32 and check that the room still feels alive (buddy breathing, lava lamp, fairy lights, speaker
   notes, gift wiggle) and that the tablet stays cooler; then merge it. That finishes Phase 10.
8. ~~Plan Phase 11 (more games and content, see `PLAN.md`) in detail and get it agreed before building.~~ Agreed 2026-11-17.

## Next steps (Phase 11)
1. ~~Build 🚂 Pattern Train & 🔤 Word Builder (v1.33) on `feature/brain2`.~~ Built (PR #33).
2. ~~Owner: build v1.33, try the two new games (see the PR), and merge it.~~ Merged.
3. ~~Build 🍕 Fraction Bakery & 🪐 Fact Cards (v1.34) on `feature/brain3`.~~ Built (PR #34).
4. ~~Owner: build v1.34, try the two new games and the 📇 binder (see the PR), and merge it.~~ Merged.
5. ~~Build 🎀 Content Pack 3 (v1.35) on `feature/pack3`.~~ Built (PR #35).
6. ~~Owner: build v1.35, try the new clothes, decorations and fidgets (see the PR), and merge it.~~ Merged.
7. ~~Build 🏀 Content Pack 4 (v1.36), with the 🦖 dino nugget plush.~~ Built (PR #36, on top of #35).
8. ~~Owner: merge #35 first, then build v1.36, try the dino nugget on a shelf and the new things (see the PR), and merge it.~~ Merged.
9. ~~Build 🧩 Extras (v1.37): more 🧠 Challenge puzzles and marble mazes.~~ Built (PR #37, on top of #36).
10. ~~Owner: merge #35 and #36 first, then build v1.37, try the new puzzles and mazes (see the PR), and merge it.~~ Merged.
11. ~~Plan details and build 🎹 Music Maker (v1.38), the last Phase 11 PR.~~ Built (PR #38).
12. Owner: build v1.38, try the Music Maker on the tablet (see the PR; check the sound timing and the speakers), and merge it.
13. ~~Build 🛋️ Room depth (v1.39), the owner's request.~~ Built (PR #39).
14. ~~Owner: build v1.39 and check the rooms (see the PR), and merge it.~~ Merged.
15. ~~Phase 11 is then done. Talk about what comes next (the ideas backlog in `PLAN.md`).~~ Talked through: Phase 12.

## Next steps (Phase 12)
1. ~~Owner: OK the v1.40 plan in `PLAN.md` and pick the new room's name.~~ Agreed: ✨ Studio.
2. ~~Build the fourth room + 🗺️ map (v1.40) on `feature/room4`.~~ Built.
3. ~~Owner: build v1.40 and try it (see the PR), and merge it.~~ Merged.
4. ~~Plan 🚪 Visitors (v1.41) and get it agreed before coding.~~ Agreed 2026-11-18 and built.
5. ~~Owner: build v1.41 and try it (see the PR), and merge it.~~ Merged.
6. ~~Plan 👯 Two-player games (v1.42) and get it agreed before coding.~~ Agreed 2026-11-19 and built.
7. ~~Owner: build v1.42 and try it with two children (see the PR), and merge it.~~ Merged.
8. ~~Plan 🎲 Free Play + Puzzle of the Day (v1.43) and get it agreed before coding.~~ Agreed 2026-11-19 and built.
9. ~~Owner: build v1.43 and try 🎲 and 📅 (see the PR), and merge it.~~ Merged.
10. ~~🇺🇸 American spelling (v1.44, the owner's request 2026-11-19).~~ Built (PR #44). Owner: build it and check the words, then merge.
11. ~~🔤 Word Builder word bank (v1.45).~~ Built (PR #45). Owner: merge #44, then build v1.45 and try a few words, then merge. The list: (Easy 3–5, Medium 6–8, Hard 9–13). Agreed 2026-11-19:
    👀 look, hide (✋), spell, with 👀 to peek again (no timer); a picture where there is one; 🔊 says the word (it works on the
    tablet even with Read to me off); American spelling; drop 1–2 letter words and homophones; Hard at most 11 letters; swap
    harass, illegal, cemetery (explosion borderline); remove repeats; add theme words (web, bat, cub / robot, rocket, slime,
    goal, ghost, comet / dinosaur, volcano, galaxy, astronaut, telescope). The owner's file is SpellingWords.txt (not in the repo yet).
12. ~~Then pick from the "Later, any order" list in `PLAN.md` (Phase 12).~~ Picked 🧸 Little Ones' Corner (v1.46), planned and built.
13. ~~Owner: build v1.46, try 🧸 Play with the little ones (see the PR), and merge it.~~ Merged.
14. ~~Then pick the next item from the "Later, any order" list in `PLAN.md` (Phase 12).~~ Picked 💃 Dance Maker (v1.47), planned and built.
15. ~~Owner: build v1.47, try 💃 Dance (see the PR), and merge it.~~ Merged.
16. ~~Then pick the next item from the "Later, any order" list in `PLAN.md` (Phase 12).~~ Picked 🌱 Backyard garden (v1.48); plan written.
17. ~~Owner: OK the v1.48 garden plan in `PLAN.md`, then build it on `feature/garden`.~~ Agreed and built.
18. ~~Owner: merge #47, then build v1.48, try the 🌱 Garden over a few days (see the PR), and merge it.~~ Merged.
19. ~~Then pick the next item from the "Later, any order" list in `PLAN.md` (Phase 12).~~ Picked 🔍 I Spy (v1.49), planned and built.
20. ~~Owner: build v1.49, try 🔍 I Spy in a few rooms and with the lights off (see the PR), and merge it.~~ Merged.
21. ~~Then pick the next item from the "Later, any order" list in `PLAN.md` (Phase 12).~~ Picked 🪙 new things to spend
    coins on (v1.50), 2026-11-19: pet homes, Stage backdrops, museum display pieces, one PR. Plan written in `PLAN.md`.
22. ~~Owner: OK the v1.50 plan in `PLAN.md`, then build it on `feature/spend`.~~ Agreed and built.
23. ~~Owner: build v1.50, try a 🏠 pet home, a 🎨 Stage backdrop and 🏛️ a trophy on a pedestal (see the PR), and merge it.~~ Merged.
24. ~~Then pick the next item from the "Later, any order" list in `PLAN.md` (Phase 12).~~ Picked 👠 Runway (v1.51), 2026-11-20.
    Plan written in `PLAN.md` ("v1.51 plan details") on branch `feature/runway`.
25. ~~Owner: OK the v1.51 Runway plan in `PLAN.md`, then build it on `feature/runway`.~~ Agreed and built.
26. ~~Owner: build v1.51, try 👠 Runway from the Closet (see PR #51), and merge it.~~ Merged.
27. ~~Then pick the next item from the "Later, any order" list.~~ Picked 🎸 Stage freestyle and 🎯 Soccer trick shots, 2026-11-20.
    Owner's answers: freestyle = **jam over her own loop** (no falling notes, no score); trick shots = **a fixed list of 12
    tricks**; **two PRs** (Jam v1.52, then Trick Shots v1.53). Both plans written in `PLAN.md` on branch `feature/freestyle`.
28. ~~Owner: OK the v1.52 Jam and v1.53 Trick Shots plans in `PLAN.md`, then build Jam on `feature/freestyle`.~~ Agreed and built.
28b. ~~Owner: build v1.52, try 🎸 Jam from the Stage and from the Music Maker (see PR #52), and merge it.~~ Merged.
29. ~~Then build 🎯 Trick Shots (v1.53) on `feature/tricks` (from `feature/freestyle`).~~ Built.
29b. ~~Owner: merge #52 first, then build v1.53, try 🎯 Tricks in Soccer (see PR #53), and merge it.~~ Merged (2026-11-20).
30. ~~Then the last "Later" item: 🐾 more pet play.~~ Picked 2026-11-20. Owner's answers: 🙈 Hide & Seek, 🎾 Fetch and 🦮 Walks;
    ❤️ hearts and stickers only (no coins); a walk is its own path scene. Plans written in `PLAN.md` on branch `feature/petplay`:
    v1.54 (Hide & Seek + Fetch) and v1.55 (Walks), two PRs.
31. ~~Owner: OK the v1.54 and v1.55 plans in `PLAN.md`, then build v1.54 on `feature/petplay`.~~ Agreed ("go for it") and built.
31b. ~~Owner: build v1.54, try 🙈 Hide & Seek and 🎾 Fetch in a few rooms (see PR #54), and merge it.~~ Merged.
32. ~~Then build v1.55 (🦮 Walks) on `feature/walks`.~~ Built (on top of `feature/petplay`).
32b. ~~Owner: merge #54 first, then build v1.55, go for a 🦮 walk on each path (see PR #55), and merge it.~~ Merged. Phase 12 is done.
33. ~~Then talk about what comes next.~~ The owner asked for 🌀 curve balls in Soccer first (v1.56, built on `feature/curve`).
33b. ~~Owner: build v1.56, try curving shots past Flap on Hard (see PR #56), and merge it.~~ Merged.
33c. The owner asked for +2 uncapped Brain Games Free Play coins (v1.57, built on `feature/brain-coins`).
33d. ~~Owner: build v1.57, try a few 🎲 puzzles in Pattern Train (+2 each, past 10 a day) (see PR #57), and merge it.~~ Merged.
33e. The owner asked to finish the half outfits; plan agreed 2026-11-21 and built as 🧩 Content Pack 5 (v1.58, `feature/pack5`).
33f. Owner: build v1.58, dress up the 10 outfits in the Closet (see PR #58), and merge it.
34. Then talk about what comes next (a Phase 13, or a rest).

## How versions and save upgrades work (since v1.2)
- `APP_VERSION` (top of `web/js/01-save.js`) is the app version shown in Settings. It must match
  `versionName` in `android/app/build.gradle.kts`. Both go up with every PR.
- `DB_VERSION` is the version of the save-data *shape*, and is separate from the app version. It is 36 since v1.55 (Pet walks: `walk`, `stats.petWalks/finds`). It was 35 in v1.54 (Pet play: `pet.toy`, `stats.seeks/fetches`). It was 34 in v1.53 (Trick Shots: `soccer.tricks/trick/trickPay`, `stats.tricks`). It was 33 in v1.52 (Stage Jam: `jam`, `stats.jams/jamOwn`). It was 32 in v1.51 (Runway: `runway`, `stats.walks/wows`). It was 31 in v1.50 (new things to buy: `pet.home`, `stage.backdrop`). It was 30 in v1.49 (I Spy: `spy`, `stats.spied/spyRounds`). It was 29 in v1.48 (Garden: `garden`, `stats.planted/harvests`). It was 28 in v1.47 (Dance Maker: `dance`). It was 27 in v1.46 (Little Ones' Corner: `little`, `stats.colored/peeks/pads`). It was 26 in v1.43 (Free Play: `free`, `potd`, `stats.free`, `stats.potd`). It was 25 in v1.42 (Two-player: `duo`). It was 24 in v1.41 (Visitors: `visit`). It was 23 in v1.40 (Studio: `room4`). It was 22 in v1.38 (Music Maker: `music`). It was 21 in v1.36 (Fidget allowance: `fidPay`; v1.37 added only puzzles, mazes and stickers). It was 20 in v1.30 (v1.33 and v1.34 added game ids only, v1.35 only new items, no new shape) (Grown-up helpers: `speak`, `stats.snaps`). It was 19 in v1.29 (Big dreams: `dream`). It was 18 in v1.28 (Gifts & layouts: `gifts`, `presets`, `stats.gifts`). It was 17 in v1.27 (Looks & night: `looks`, `night`, `stats.nights`). It was 16 in v1.25 (Brain Games: `brain`). It was 15 in v1.24 (Be the Keeper: `soccer.mode`, `soccer.keep`, `stats.saves`). It was 14 in v1.23 (Backyard: `room3`). It was 13 in v1.20 (Buddies: `look.kind`, `look.face`, `tint`, `furn`).
  It was 12 in v1.19 (Pet: `pet{kind, acc, names{},
  hearts{}}`). It was 11 in v1.18 (Sticker Book: `stickers[]`, `stickerNew[]`, `stats.dailies`). It was 10 in v1.16 (New fidgets:
  `maze{solved[]}`, `fid.slime/cube/marble`, `stats.stretches/clicks/mazes`). It was 9 in v1.13
  (Code Lab: `code{level, solved[]}`; v1.14 and v1.15 added level ids only, no new shape). It was 8 in v1.11
  (old swoop hair ids → `swoopBlack` + `look.hairColor`, and `hairc:<colour>` added to `owned`). It was 7 in v1.10
  (Loft + Content Pack 1: `room2` and `fid.popShape`). It was 6 in v1.8
  (Little-sister polish: per-profile `easy`, `color`, `badge`, plus `settings.pin`). It was 5 in v1.7
  (Stage: `stage`, `stats.shows/fullCombos`, plus `settings.stageOffset` filled in by `DEFAULT_SETTINGS`).
  It was 4 in v1.5 (Soccer: `soccer`, `stats.goals/kicks/matches/perfects`). It was 3 in v1.4
  (Photocards: `cards`, `cardPins`, `bonusGot`, `cardNo`, `stats.cards`). It was 2 in v1.3
  (Art Desk: `stats.drawings`, `artPay`, poster room items).
  Bump it only when the save shape changes, and add a step to `MIGRATIONS` that upgrades the previous version.
- `fixDB()` runs on the saved data when the app starts **and** on restored backups, then `normalize()` fills in
  per-profile defaults. So old saves and old backups always get upgraded the same way.
- A backup from a newer app still restores on an older app. Unknown fields are kept, not deleted.

## Open questions for the owner
- Her device model and screen size (to tune layouts).
- ~~Should backups include drawings?~~ Yes, with a switch (decided 2026-11-15).
