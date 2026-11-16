# Status / handover

_Last updated: 2026-11-16_

## Where we are
- **Phase 0 (v1 base): done.** **Phase 1 (ship to the tablet): done** (v1.2 merged).
- **Phase 2 (Art Desk): done** (v1.3 merged). Checked on an Android phone: it works, and drawings survive closing the app.
- **Phase 3 (Photocard Wall): done** (v1.4 merged). The owner checked it on the device: all checks passed (2026-11-15).
- **Phase 4 (Soccer Field): done** (v1.5 merged), with the swipe-power fix and Bronze/Silver/Gold trophies. Checked on the device.
- **Squishy upgrade: done** (v1.6 merged, PR #6).
- **Phase 5 (Stage rhythm game): done** (v1.7 merged, PR #7).
- **Phase 6 (little-sister polish): done** (v1.8 merged, PR #8). The owner checked it on the device: everything works.
- **Phase 7 (content packs): in progress.** Order (agreed 2026-11-15): code split (v1.9) → Cozy Loft + Content Pack 1 (v1.10)
  → Code Lab (the owner's intro-to-coding game idea, sketched in `PLAN.md`).
  - **Code split: done** (v1.9 merged, PR #9). Built in Android Studio and checked on the device: everything works.
  - **Cozy Loft + Content Pack 1: done** (v1.10 merged, PR #10). Tried on a device: everything works.
  - **Shelves + Hair Styles: done** (v1.11 merged, PR #11). The owner asked for it before Code Lab.
  - **Stage in the Loft + Easy-only labels: done** (v1.12 merged, PR #12; the owner's request, before Code Lab).
  - **Code Lab: done** (v1.13 merged, PR #13). The owner checked it on the device: it all works.
  - **Code Lab: My Move + If levels: done** (v1.14 merged, PR #14). The owner tried it: it worked great.
  - **Code Lab: 🧠 Challenge level: done** (v1.15 merged, PR #15).
  - **New fidgets (🧪 Slime, 🎛️ Clicker cube, 🔮 Marble Maze): built, PR open as v1.16** on branch `feature/fidgets`
    (from `main` after #15). Not yet tried on a device (tilting needs a real tablet).
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
- PR "New fidgets (v1.16)" on branch `feature/fidgets` (from `main` after #15): open.
- Android Studio should open only the `android/` folder. Its generated files (`android/.gradle/`, `android/.idea/`,
  `android/app/build/`, `android/local.properties`) are ignored.

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

## Decisions made
- Main idea: the "hangout room" (chosen because it can grow, and the younger sister can have her own profile).
- One web page (works offline, no server) plus a WebView APK wrapper. The same code serves both.
  Since v1.9 it is `index.html` + `web/app.css` + `web/js/` (one file per section), split because it passed 210 KB.
- No SQLite; localStorage is enough for v1. IndexedDB comes later for drawings.
- Mascot: original fuzzy emo bunny, default name "Fuzzy" (renamable). Starter look: emo swoop bangs,
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
15. Owner: build v1.16, try the slime, clicker and tilt maze on the tablet (see the PR), and merge it.
16. Pick the next Phase 7 item (ideas: Content Pack 2, more Challenge puzzles or mazes, a sticker book or a pet).

## How versions and save upgrades work (since v1.2)
- `APP_VERSION` (top of `web/js/01-save.js`) is the app version shown in Settings. It must match
  `versionName` in `android/app/build.gradle.kts`. Both go up with every PR.
- `DB_VERSION` is the version of the save-data *shape*, and is separate from the app version. It is 10 since v1.16 (New fidgets:
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
