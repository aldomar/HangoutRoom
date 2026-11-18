# CLAUDE.md

Guidance for Claude Code in this repo. The full build plan and roadmap are in `PLAN.md`.

**Starting a new conversation? Read `docs/STATUS.md` first.** It records the current phase,
branches/PRs, decisions already made, and the owner's working preferences.
Update it at the end of each phase (or whenever something important changes).

## Project
Hangout Room: a personal gift app for the owner's 11-year-old niece and her younger sister (8), and since v1.20 also
their younger brothers (5 and 3).
It's a cozy virtual bedroom with an original fuzzy emo bunny mascot, a fidget shelf (pop-it, squishy,
spinner), a closet for dress-up, coins and room decorating.

- The app is **one web page**: `index.html` at the repo root plus the `web/` folder (CSS and code). It runs offline in any browser.
- `android/` is a thin WebView wrapper that builds a **sideloaded APK**. It is never published.
- **Family only.** It is never sold, published to an app store, or shared beyond the family.

Her interests (use these for themes): K-pop (currently ILLIT and Hearts2Hearts), soccer, Roblox, art,
anime (Demon Slayer, Hatsune Miku, Cinnamoroll), an emo style drift (fuzzy leg warmers, arm warmers,
stripes, stars, bats), and fidget and squishy toys. For the brothers (since v1.20): dinosaurs, space and rockets, trucks/trains/cars, robots,
sharks and (original) heroes. Every item stays open to every child: no "boy"/"girl" labels anywhere.

## Rules
- **Never commit to `main`.** Work on a feature branch and open a pull request on `aldomar/HangoutRoom`.
- **Never approve or merge pull requests.** The repo owner always does that.
- **Plan first** for any major change (a new room area or mini-game, any change to save data,
  anything touching more than a few sections). Get the plan agreed before writing code.
- **Ask before resource-heavy work**: Gradle builds, emulator runs, installing Playwright or browsers,
  large downloads. The owner builds the APK in Android Studio.
- **Free only.** The owner's Claude subscription is the only paid thing. Every tool, library, font and
  asset must be free (open source wherever practical). No Play Store or Apple developer fees.
  If anything would cost money (a paid plan, a card, a trial that ends), stop and ask.
- **Original content only.** Themes are *inspired by* her interests, never the real thing:
  - No real K-pop members, names, songs, lyrics or logos.
  - No Demon Slayer, Hatsune Miku, Sanrio/Hello Kitty/Cinnamoroll or Roblox characters, logos, art or music.
  - No other copyrighted characters either, even restyled or recoloured.
  - Art is drawn in code (SVG / canvas). Sounds and music are generated with the Web Audio API.
  - Third-party assets only if CC0/public domain *and* approved by the owner; record them in `docs/STATUS.md`.
- **Kid-safe and private.**
  - No internet use: the APK has no `INTERNET` permission. Don't add it.
  - No accounts, chat, sharing, ads, analytics, crash reporting or telemetry.
  - No external links and no real-money purchases. Coins are earned only by playing.
- **No pressure mechanics.** No punishing timers, streaks she can lose, "come back or lose it" messages,
  or random paid-style loot boxes. The daily gift is a bonus only.
- **Age-appropriate.** Spooky-cute is fine (bats, ghosts, stripes, stars).
  Nothing scary, gory, sad or edgy.
- **Usable by a younger child too.** Icons plus short words, big buttons, simple paths (1–2 taps to anything).
- **Update docs with every major change:** `README.md`, `PLAN.md` (tick the roadmap), `docs/STATUS.md`,
  and `android/README.md` if the build changes. Write them for readers with limited technical experience.
- **Light on the device.** Assume a modest Android tablet:
  - Keep animated SVG filters (the `#fuzz` filter) to a minimal number of elements.
  - Run animation loops only while their screen is visible. The main loop (`99-startup.js`) only runs on
    `LOOP_SCREENS` (`soccer stage fidget`); a new screen that draws every frame must be added there (since v1.32).
  - Endless idle animations (the buddy breathing, pet, lava lamp…) move in `steps()` every 0.2 s, all on the same
    grid, so the room is redrawn 5 times a second instead of 60. No SVG `<animate>` (SMIL): use a CSS class under
    `#roomSvg` instead (see `.an-*` in `app.css`). The smoke test's ⚡ Speed check checks both (since v1.32).
  - No large asset files.

## Architecture rules
- `index.html` + `web/` (repo root) are the **single source of truth**. The Android build copies both into the APK
  (`CopyWebApp` task in `android/app/build.gradle.kts`). Never edit or commit a copy inside `android/`.
- **It must run from `file://` with no server:**
  - Classic `<script src>` only: no ES modules, no `import`. Every file starts with `'use strict';`.
  - No `fetch()`/XHR of local files, no CDNs, no downloaded web fonts.
  - No npm/build step needed to run it.
- **Files (since v1.9):** `index.html` holds only the page shell and screen markup; CSS is `web/app.css`; code is
  `web/js/NN-name.js`, one file per numbered section, listed in order by `<script src>` tags at the bottom of `index.html`.
  - All files share one global scope, but code that **runs while a file loads** (top-level statements, `x.onclick=fn`)
    may only use things from the same or earlier files. Functions called later (on taps, in the loop) can use anything.
  - A new game or content pack gets a **new numbered file** (e.g. `18-codelab.js`) and a new `<script src>` tag
    just above `99-startup.js` (which always loads last), rather than growing an old file. Keep each file under ~40 KB.
  - Keep the numbered section banner at the top of each file. The smoke test checks every `web/js` file is loaded, in order.
- **Touch first.** Use pointer events, which also work with a mouse. Interactive canvases and boards need `touch-action:none`.
- Tap targets of 48 px or more; text at least 14 px (16 px or more for body text).

## Save data: protect her progress
- localStorage key `hangoutRoom.v1`. Shape: `DB = {version, profiles[], activeId, settings}`.
  Each profile has `name, mascotName, coins, lastDaily, seenTip, stats, look, owned[], room{wall,floor,items[]}, fid{pop,squish,spin,popShape}`,
  `artPay`, (since v1.4) `cards[], cardPins[], bonusGot[], cardNo`, and (since v1.5) `soccer{level, best{easy,medium,hard}, trophies[]}`, and (since v1.7) `stage{level, best{songId:{level:{stars,score}}}, mic}`, and (since v1.8) `easy, color, badge`, and (since v1.10) `room2{wall,floor,items[]}` (the Cozy Loft), and (since v1.11) `look.hairColor`, and (since v1.13) `code{level, solved[]}`, and (since v1.16) `maze{solved[]}`, `fid.slime/cube/marble`, `stats.stretches/clicks/mazes`, and (since v1.18) `stickers[]`, `stickerNew[]`, `stats.dailies`, and (since v1.19) `pet{kind, acc, names{}, hearts{}}`, and (since v1.20) `look.kind`, `look.face`, `tint`, `furn{}`, and (since v1.23) `room3{wall,floor,items[]}` (the Backyard), and (since v1.24) `soccer.mode` ('kick'|'keep'), `soccer.keep{level, best{}, gloves[]}`, `stats.saves`, and (since v1.25) `brain{game, level{snack,memory,pop}, solved[]}`, and (since v1.27) `looks[4]` (null or an outfit), `night{'1'|'2'|'3':true}`, `stats.nights`, and (since v1.28) `gifts[]` (waiting gifts), `presets{'1'|'2'|'3': 3 × null or a layout}`, `stats.gifts`, and (since v1.29) `dream` ('' or the DECOR key she is saving for), and (since v1.30) `speak` (null = follow Easy mode, or true/false), `stats.snaps`.
  `settings.stageOffset` (ms, per device) is the Stage "Sound late?" setting. `settings.pin` ('' or 4 digits) is the
  optional grown-up PIN; it belongs to the device, so `doRestore()` keeps it. So does `settings.lastBackup` (ms, since v1.30).
- **Never rename or remove saved fields or item ids.** `owned` uses `category:id` keys
  (`top:zip`, `legs:pinkFuzz`, `pop:emo`, `squish:bat`, `spin:emo`, `wall:midnight`, `floor:galaxy`).
  Room items reference `DECOR` keys. Prices and names may change; ids may not.
- Add new fields with defaults in `normalize()`. If the shape changes, bump `DB.version` and migrate in code.
- Restore (Settings → Backup & Restore) must keep accepting every older backup.
- Large data (drawings, card images) goes in IndexedDB, not localStorage (~5 MB limit).
- Uninstalling the APK deletes saves. Updates must install over the old app (same signing key).

## Android wrapper (`android/`)
- Minimal on purpose: a plain `Activity` + `WebView`, no AndroidX, no dependencies.
  AGP 9.5.1 (built-in Kotlin, no Kotlin plugin), Gradle 9.6.0, compile/target SDK 36, min SDK 26.
  Android Studio 2026.x runs Gradle on a new Java, so Gradle must stay at 9.1 or newer.
- JS ↔ Android contract (keep both working, and feature-detect so the browser version still works):
  - `window.AndroidBridge.saveBackup(text, fileName)` opens Android's save picker (SAF `ACTION_CREATE_DOCUMENT`); after the
    file is written the wrapper calls `backupSaved()` (since v1.30).
  - `window.AndroidBridge.saveImage(base64Png, fileName)` saves a PNG the same way (📷, since v1.30).
  - `window.AndroidBridge.speak(text)` says text with Android's `TextToSpeech` (🔊 Read to me, since v1.30). The manifest's
    `<queries>` entry for `TTS_SERVICE` is needed on Android 11+ (it is not a permission).
  - `window.androidBack()` returns `true` if the web app handled Back (popup → room → profiles), otherwise the app exits.
  - The wrapper calls `save()` on pause and `toast(msg)` for messages.
- No new permissions without asking. Never add `INTERNET`.
- **Don't run Gradle builds without asking.** The owner builds and installs.

## Versions and pull requests
- Every pull request raises the minor version by one (1.0 → 1.1 → 1.2), committed on the branch before the PR:
  - `versionName` **and** `versionCode` (+1) in `android/app/build.gradle.kts`.
  - `APP_VERSION` in `web/js/01-save.js` (shown in Settings).
  - A `GIFT_TIMELINE` entry for the new version in `web/js/25-about.js` (since v1.22).
- Put the version in the PR title, for example "Art Desk (v1.2)".
- When several PRs are open, each takes the next number after the highest already used on any branch.
- The PR description says what to try on the tablet.

## Testing
- **Quick check:** open `index.html` in desktop Chrome and use DevTools device mode (tablet and phone sizes, touch).
- **Automated smoke test:** `node tests/smoke-test.js` (Node 22+ and an installed Chrome or Edge; nothing to install).
  It loads the page in a headless browser with a throwaway profile, makes a test room, opens every screen,
  exercises the Art Desk, Photocards, Soccer, the Stage and backup/restore, fails on any console error, and saves screenshots to `tests/shots/` (ignored by git).
  Run it before every PR, and extend it when you add a feature. Use invented names only.
- **On the device:** the owner builds the APK in Android Studio and sideloads it.

## Layout
- `index.html` (markup) + `web/app.css` + `web/js/`, one file per section, in order:
  1. `01-save.js` Helpers + save data (`DB`, `save`, `saveSoon`, `P()`)
  2. `02-art-helpers.js` Art helpers (`st`, `starPath`, `heartPath`, `buildDefs` shared patterns and `#fuzz`/`#glow` filters)
  3. `03-mascot.js` Mascot + closet items (`FUR`, `CLOSET` by category, `mascotSVG`; mascot box is 200×270)
  4. `04-room.js` Room (`WALLS`, `FLOORS`, `DECOR` drawn bottom-centre at 0,0; `furniture()` hotspots; room box is 1000×700)
  5. `05-fidget-data.js` Fidget data (`POP_THEMES`, `SQUISHIES`, `SPINS`)
  6. `06-profiles.js` Profiles (`newProfile`, `normalize`)
  7. `07-sound.js` Sound (`SFX`, generated music, spinner hum)
  8. `08-ui.js` UI basics (`toast`, `modal`, `earn`, `tryBuy`, `buyConsumable`)
  9. `09-screens.js` Screens (profiles, room + decorate, settings/backup, closet)
  10. `10-fidget-shelf.js` Fidget shelf (pop-it, squishy physics, spinner physics)
  11. `11-art-desk.js` Art Desk (drawing pad, stamps, gallery, posters)
  12. `12-photocards.js` Photocard Wall (`STAGES`, `FRAMES`, `CARD_TAGS`, `BONUS`, `cardSVG`, card maker, binder, pins)
  13. `13-soccer.js` Soccer Field (`KEEPERS` by level, `socShoot`, `resolveShot`, `drawSoccer`, `drawKeeper`)
  14. `14-stage.js` Stage (`SONGS`, `buildSong`, `stStart`, `stTap`, `stFinish`, `drawStage`, `giveMic`)
  16. `16-room2.js` Cozy Loft, the second room (`loftFurniture`, the `attic` wall)
  17. `17-pack1.js` Content Pack 1 (only adds entries to `CLOSET`, `DECOR`, `WALLS`, `FLOORS`, `SQUISHIES`, `SPINS`, `POP_SHAPES`, `CARD_TAGS`)
  18. `18-codelab.js` Code Lab (`CODE_PUZZLES`, `CODE_LEVELS`, `codeSim`, `clOpen`, `clGo`)
  19. `19-fidgets2.js` New fidgets: slime (`SLIMES`, `drawSlime`), clicker cube (`CUBES`, `renderCube`), marble maze (`MAZES`, `MARBLES`, `drawMaze`, `mzSensor`)
  20. `20-seasons.js` Seasons (`SEASONS`, `seasonNow()`, seasonal `DECOR`/`WALLS` with `season:'autumn'…`, `seasonWindow()`, `seasonGrid()` for the 🍂 Seasons tab)
  21. `21-stickers.js` Sticker Book (`STICKERS`, `STK_PAGES`, `stickerSVG`, `checkStickers`, `renderStickers`)
  22. `22-pet.js` Pet (`PETS`, `PET_ACC`, `PET_TRICKS`, `petG` drawn by `renderRoom`, `petTap`, `petMenu`, `petPat`, `petTreat`)
  23. `23-buddies.js` Buddies (`STARTERS` for New Room, `starterRow`, `giveStarter`; room colour tints `TINTS`, `applyTint`;
      furniture colours `FURN_COLORS`, `FURN_PIECES`, `furnC`, `furnGrid`; `ROOM_START` for a new room's wall and colours)
  24. `24-pack2.js` Content Pack 2 (dinosaurs, space, vehicles, robots/sharks/heroes; only adds entries, each with `p2:<theme>`;
      `p2Have` counts a theme for its 4 stickers)
  25. `25-about.js` About & Gift Story (`ABOUT_DEFAULT`, `GIFT_TIMELINE`, `aboutData`, `renderAbout`, `whatsNew`)
  26. `26-backyard.js` Backyard, the third room (`YARD_FENCES`, `yardBack`, `yardFurniture`, `yardSeason`, outdoor `DECOR`)
  27. `27-keeper.js` Be the Keeper, Soccer's 🧤 Keep mode (`STRIKERS`, `KEEP_SHOTS`, `KP`, `kpDive`, `drawKeep`, `drawStriker`, `GLOVES`)
  28. `28-brain.js` Brain Games: menu and puzzle screen (`BRAIN_GAMES`, `brId`, `brOpen`, `brPuzzle`, `brWin`, `brChoices`) + 🧁 Snack Stand
  29. `29-brain2.js` Brain Games: 🃏 Memory Match (`MEM_SETS`, `memPic`, `memDeck`, `memTap`) and 🫧 Number Pop (`POP_SETS`, `popNeed`, `popTap`)
  30. `30-songs2.js` Stage song pack (5 more `SONGS` recipes, pushed onto `SONG_IDS`; 4 song stickers)
  31. `31-looks.js` Looks, emotes + night mode (`renderLooks`, `wearLook`, `EMOTES`, `playEmote`, `emoteBar`, `NIGHT_GLOW`, `nightLayer`, `nightBtn`)
  32. `32-gifts.js` Gifts + room layouts (`giveModal`, `sendGift`, `giftG`, `giftOpen`, `GIFT_SPOT`, `layoutGrid`, `layoutSave`, `layoutLoad`)
  33. `33-shopplus.js` Shop filters + big dreams (`THEMES`, `THEME_IDS`, `themesOf`, `themeFilter`, the 5 `dream:1` decorations, `dreamBar`, `dreamTap`)
  34. `34-helpers.js` Grown-up helpers (`backupSaved`, `lastBackupText`, `readOn`, `canSpeak`, `speakLabel`, `svgPng`, `snapRoom`, `snapCard`)
  35. `35-brain3.js` Brain Games 3: 🚂 Pattern Train (`TR_PUZ`, `trTrain`, `trWagon`) and 🔤 Word Builder (`WB_PUZ`, `wbTiles`, `wbTap`)
  36. `36-brain4.js` Brain Games 4: 🍕 Fraction Bakery (`FB_PUZ`, `fbTreat`, `fbCheck`) and 🪐 Fact Cards (`FACT_PUZ`, `factCard`, the 📇 binder `factBinder`)
  37. `37-pack3.js` Content Pack 3 (stage, cozy, cafe, ocean; only adds entries, each with `p3:<theme>`; `P3_THEMES`, `p3Have`,
      the squishy extras `frosting tentacles nori`, the 🍵 Cozy / 🧁 Cafe / 🐚 Ocean theme chips)
  99. `99-startup.js` (always last) Main loop + startup (`LOOP_SCREENS`, `wakeLoop` called by `show()`, `androidBack` hook)
- Drawings live in IndexedDB (`hangoutRoomArt`, through `ArtStore` in section 1), with a localStorage fallback
  (`hangoutRoom.art`). A poster is a room item `{type:'poster', art:<drawing id>}`. Backups carry drawings in an `artwork` list.
- A photocard is a small recipe `{id, no, at, look, stage, frame, title, name, s, bonus?}` in `profile.cards`, drawn by `cardSVG()`.
  Stage, frame and bonus ids are saved (`owned` uses `stage:id` / `frame:id`): never rename them. Small cards are drawn
  with `flat` (no `#fuzz` filter).
- Soccer: one canvas drawn by the main loop only while `cur==='soccer'`. Goal coordinates are `u` (-0.5..0.5 across)
  and `v` (0..1 up). Each level has its own original keeper: Easy = Mochi (cat), Medium = Boo (ghost), Hard = Flap (bat).
  Level ids `easy/medium/hard` are saved: never rename them. A perfect 5/5 gives that level's trophy once
  (`TROPHIES`, `giveTrophies()`): a room item `trophyBronze` / `trophySilver` / `trophyGold`. Decorations with
  `award:1` are prizes and never appear in the Shop.
- Be the Keeper (since v1.24, `27-keeper.js`): the Soccer screen's ⚽ Kick / 🧤 Keep buttons set `soccer.mode` (remembered).
  `drawSoccer()` hands over to `drawKeep()` in Keep mode, and the canvas pointer handlers to `kpDown/kpUp`; both modes share
  `socField`, `socNet`, `socPosts` and `ballPos` (section 13). Strikers: Easy = Hop (frog), Medium = Bolt (robot), Hard = Zip (fox).
  Shots come from fixed lists (`KEEP_SHOTS`, 15 per level, 5 per match, taken in turn; the smoke test proves each is
  saveable). The match runs from the main loop only (no timers). Her buddy is drawn once into a small canvas (`kpArt`),
  so the `#fuzz` filter isn't redrawn every frame. A 5/5 gives that level's glove once (`giveGloves()`): `gloveBronze` /
  `gloveSilver` / `gloveGold` (`award:1`), placed in the **Backyard** (`p.room3`) at their `TROPHY_SPOTS`. Glove ids are saved.
- Brain Games (since v1.25, `28-brain.js` + `29-brain2.js`): the Backyard chalkboard (`data-hot="brain"`) opens `scr-brain`.
  A game is one `BRAIN_GAMES` entry `{icon, name, desc, color, puzzles{easy,medium,hard}, start(pz, lvl, idx)}`; `start` fills
  `#brQ` and `#brBoard` and calls `brWin()` when solved (`brOops(el)` for a wrong try). Puzzle ids are `<game>:<e|m|h><n>`
  (`brId`), made from the place in the list, and saved in `brain.solved`: never reorder or remove puzzles, add new ones at
  the end of a level. All puzzles are fixed (Memory boards use a shuffle seeded by the id). The smoke test checks every
  answer, choice list, pair set and picture. Number Pop's bubbles are `.nbub` (`.bub` is the pop-it's).
  Since v1.33 there are 5 games (+ `train`, `word` in `35-brain3.js`), since v1.34 7 (+ `bake`, `facts` in `36-brain4.js`);
  a new game id must also go in `normalize()`'s list (`brG` in 06). A fact card is unlocked by its puzzle id in
  `brain.solved`. `BR_MENU_EXTRA` adds HTML under the menu's games; a game's optional `winExtra()` adds to its win box. Brain Champ counts only the first 3 games. Bonus photocards (`c.bonus`) can't be deleted.
- Stage: the marquee (`stageMarquee()` in 04) hangs on the Cozy Loft's wall since v1.12 (it was above the closet). Songs are generated from small text recipes in `SONGS` (scale, chords, melody, drum patterns). `buildSong(id, level)`
  turns a recipe into audio events and a fixed note chart (no randomness). Song time comes from the audio clock
  (`stSongT()`), so taps line up with what she hears. Song ids `starlight/bats/sugar` (and since v1.26 `neon/clap/dino/rocket/lullaby`, in `30-songs2.js`) and level ids are saved: never rename them.
  `SONG_IDS` is made when 14 loads, so a song file must push its new ids onto it. A new song must pass the smoke test's chart rules
  (55–75 s long, Easy < Medium < Hard notes, so keep 3–4 melody notes in most bars). Encore! is pinned to the first 3 songs.
  3 stars on Hard gives the Golden Mic (`goldenMic`, `award:1`) once (`stage.mic`). Background music pauses during a song.
- Easy mode (per profile, `p.easy`): `applyEasy()` puts `easy` on `<body>` while that room is open; CSS under `body.easy`
  makes things bigger and hides tips. The pink room labels (`sign()`, class `sign`) only show under `body.easy` (since v1.12). Shop grids go through `easySort()`, `poorCls()` and `priceTag()`; buying goes through
  `tryBuy`/`buyConsumable`, which switch to the short Easy buy box. New shops should use the same helpers.
- Grown-up PIN: wrap a guarded action in `askPin(fn)` (it runs `fn` straight away when no PIN is set).
  Room colours (`ROOM_COLORS`) and badges (`ROOM_BADGES`) are saved ids: never rename or remove them.
- Hair (since v1.11) is a style (`CLOSET.hair` item, `hair:<id>`) plus a colour (`HAIR_COLORS`, owned as `hairc:<id>`,
  bought once for all styles). Hair items take `d(f, line, H)` and an optional back layer `b(f, line, H)`, where `H` is the colour.
  Old swoop ids (`swoopPurple` …) live on in `LEGACY_HAIR`; always read hair through `hairIds(look)`.
- Shelves (since v1.11): a wall decoration with `shelf:{w, top}`. Dropped items snap onto a shelf top, and dragging a
  shelf carries its riders (`onShelf`, `snapToShelf` in 09). The room draws flat items, then wall items, then standing items,
  then the buddy, pet and gifts. Inside each layer items are drawn in `R.items` order; since v1.31 touching an item while
  decorating (or placing it from My Stuff) moves it to the end with `toFront(R, it)`, so the last touched sits in front.
- Three rooms (Loft since v1.10, Backyard since v1.23): `roomNo` (1 = `p.room`, 2 = `p.room2`, 3 = `p.room3`), `curRoom(p)` for
  the room on screen, `rooms(p)` for all three and `allItems(p)` for every item. My Stuff (items with `placed:false`) is shared
  between rooms; placing a stored item moves it into the room on screen. New code that adds or finds room items must use
  these, not `p.room` directly (prizes like trophies still go to `p.room`). The top bar has two buttons (`#roomGo`,
  `#roomGo2`), one for each of the other rooms; Back goes Loft/Backyard → room → profiles.
- Backyard (since v1.23, `26-backyard.js`): `yardBack()` draws the sky, the season and the fence; `yardFurniture()` the
  tree, the `data-hot="goal"` soccer goal (opens Soccer), the shed and the chalkboard easel (Brain Games will use it).
  Fences and grounds are `WALLS`/`FLOORS` entries with `yard:1`: Decorate lists them only in the Backyard and lists
  indoor ones only indoors (the Seasons tab shows no walls there). A fence is drawn by `YARD_FENCES[id]()`, so a new
  fence needs one there too. Outdoor decorations have `yard:1` (allowed in any room, listed first in the Backyard's Shop).
- Code Lab (since v1.13): the Loft's computer desk (`data-hot="code"`). Puzzles are text recipes in `CODE_PUZZLES`
  (map rows: `.` floor, `F` Fuzzy, `C` carrot, `*` star, `#` toy block, `~` puddle; `max` blocks; `sol` = one answer, which the smoke
  test runs; `move` = the ✨ My Move row of that answer). Blocks: arrows `UDLR`, repeats `2 3 4`, `S` pick up a star,
  `M` ✨ run My Move (levels with `M` show the My Move row, `moveMax` blocks; My Move can't hold `M`), `Q` ❓ in front of an
  arrow = hop a puddle if one is next (since v1.14). The smoke test also proves My Move puzzles need ✨ and If puzzles need ❓,
  and every Challenge puzzle (since v1.15, ids `c1`…) needs ✨ (and ❓ when it has puddles). A level may set its own `coins`/`bonus`. `codeSim()` holds the rules with no drawing; the board is SVG moved by CSS transitions (nothing in the main loop).
  Puzzle ids (`e1`, `m1`, `h1`, `f1`, `i1` …) and level ids (`easy medium hard move if challenge`) are saved in `code.solved`: never rename them. Add new puzzles at the end of a level.
- New fidgets (since v1.16): three more Fidget Shelf tabs added through `FID` (designs owned as `slime:<id>`, `cube:<id>`,
  `marble:<id>`). `setFidTab` calls `fid2Open()`. The slime and the maze are drawn by the main loop only on their tab;
  the clicker cube is plain buttons (no loop). The maze listens to `deviceorientation` only while its tab is on screen
  (`mzSensor`), takes how the device is held at the start of a maze as flat, and turns the reading with the screen.
  A finger on the board always works too. Maze ids (`m1`…) are saved in `maze.solved`: never rename them; add new
  mazes at the end (all mazes are 9×6 text maps: `#` wall, `S` start, `G` star hole, `o` bumper).
- Seasons (since v1.17): a decoration or wall with `season:<id>` is listed in Decorate's 🍂 Seasons tab (not the Shop;
  walls show in the Walls tab too). **Seasonal things are for sale all year** (no limited-time pressure); the current
  season (from the device date, `seasonNow()`) is only listed first. `seasonWindow(n, layer)` draws the season into her
  room's window (n=1) and the Loft's window (n=2). The smoke test sets `seasonTest` to try each season.
- Sticker Book (since v1.18): the 📒 button in the room's top bar opens `scr-stickers`. A sticker is one `stk(...)`
  entry in `STICKERS` with a `need` (number, or a function for lists that grow) and `have(p)` (progress). Sticker ids
  are saved in `p.stickers`: never rename or remove them; add new ones at the end of their page. `checkStickers()` runs
  when a screen opens and every 2 s while playing; 3+ at once in the room get one box, otherwise a toast (never a box
  over a game). A new game should add a few stickers. The smoke test pauses stickers (`window.STK_TEST_PAUSE`) until
  their own checks, so other games' exact coin checks still add up.
- Pet (since v1.19): `petG(p)` is drawn by `renderRoom` at `PET_SPOT` (in front, by Fuzzy's right foot, clear of
  `TROPHY_SPOTS`) in both rooms; it's a `data-hot="pet"` hotspot. Pet kinds (`bat ghostCat cloudPup starHam`) and
  accessory ids (owned as `petacc:<id>`) are saved: never rename them. `normalize()` runs while file 06 loads, so it only
  checks types; read the pet through `petKind/petName/petHearts/petAcc`. Hearts only go up; the pet never earns coins.
  In the room, pet messages use Fuzzy's speech bubble (`say`), because a toast would cover the pet.
- Buddies (since v1.20): `BUDDIES` (`bunny bear puppy dino fox`) and `FACES` (`sparkle bright cheeky`) live in section 3,
  because `mascotSVG` draws them. Every buddy shares one body, so clothes never need a per-buddy version: a buddy only
  adds `back` (ears behind the head), `front` (over the head) and `tail` (behind the body). They are Closet
  categories `kind` and `face` (price 0); "Surprise me" never changes kind, face or fur. Old looks with no kind/face
  draw the bunny with the Sparkly face, exactly as before. Buddy and face ids are saved: never rename them.
  Never label anything "boy" or "girl"; New Room shows `STARTERS` as pictures only.
- Room tints (since v1.20): when `p.tint` is on and the room colour has a `TINTS` entry, `applyTint()` (called by
  `applyEasy()`) sets the CSS variables `--pink --pink-dk --pink-ink --purple --purple-dk --bg --panel --panel2 --line --hi`
  on `<body>`. New CSS should use these variables instead of the raw pink/purple hex values, so it tints too.
- Furniture colours (since v1.20): `furniture()` and `loftFurniture()` take the built-in pieces' colours from
  `furnC(piece)` (classic colours when `p.furn[piece]` is missing or unknown). A new built-in piece that should be
  recolourable gets a `FURN_PIECES` entry. Piece ids (`desk closet shelf curtain desk2 beams window2 lamp shed easel`) and colour ids
  are saved: never rename them.
- About (since v1.22): ⚙️ Settings → 💌 About (`scr-about`). The personal words (nicknames, letter, secret, per-version
  `why` lines) are in `web/about-local.js`, which is **git-ignored and must never be committed, read into a PR, or
  quoted on GitHub**; `index.html` loads it right after `25-about.js`, and each field falls back to `ABOUT_DEFAULT`.
  `web/about-local.example.js` (in git) uses invented names only. **Every PR adds a `GIFT_TIMELINE` entry** for its
  version (date, icon, name, generic `why`, and a short `news` list for the ✨ What's New box). `settings.seenNew` is
  the last version whose What's New was shown; it belongs to the device, so `doRestore()` keeps it (like the PIN).
- Looks & night (since v1.27, `31-looks.js`): ⭐ My Looks in the Closet saves 4 outfits (every `look` key except `kind`, `face`, `fur`).
  Tapping the buddy shows `#emoteBar` (4 CSS emotes on `#mascotG`). 🌙 `#nightBtn` sets `p.night[roomNo]`; `renderRoom` adds
  `nightLayer()`: one masked dark layer (`pointer-events:none`) with soft light at `NIGHT_GLOW` decorations. A new lamp-like
  decoration should get a `NIGHT_GLOW` entry. Night is off while decorating.
- Gifts & layouts (since v1.28, `32-gifts.js`): a gift goes into the other profile's `gifts[]` inbox (no network) and is drawn as
  a `data-hot="gift"` pile at `GIFT_SPOT` in every room; opening adds coins or places the decoration. Posters and `award` items
  can't be given. 🏠 Layouts is Decorate's 7th tab; a layout stores item uids, so loading finds items in any room or My Stuff.
- Theme chips + dreams (since v1.29, `33-shopplus.js`): an item's themes come from `p2`, `p3` (since v1.35), `yard`, `dream` and `THEME_IDS`.
  **A new closet item or decoration should get a theme** (a `p2`-style field or a `THEME_IDS` entry), so the chips find it.
  Big dreams have `dream:1` and are the only items allowed above 40 coins.
- Helpers (since v1.30, `34-helpers.js`): Read to me speaks a tapped button's `aria-label`, `.tn` text or text (emoji
  stripped), or a hotspot's `HOT_WORDS` name; give icon-only buttons an `aria-label`. Snapshots copy an SVG with the
  `#gdefs` patterns into a canvas, so room drawings should not depend on CSS (labels with `.sign` are left out).
- Every room area is open. To add a locked area for a future feature, put it in `LOCKED` and `handleHot()`.
- `android/`: Gradle project; `app/src/main/java/com/family/hangoutroom/MainActivity.kt`; `android/README.md` has build/sideload steps.
- `PLAN.md`: roadmap. `docs/STATUS.md`: handover / current state.

## Conventions
- Coins: 1 per 10 pops, +5 per pop-it flip, 1 per 5 squishes, 1 per 25 spinner turns, +10 daily gift, 25 to start,
  +5 per new drawing (3+ strokes, first 5 a day), +10 per bonus photocard (each milestone once). Making a photocard is free.
  Soccer: +1 / +2 / +3 per goal (Easy / Medium / Hard), +1 more per goal with 2+ soccer clothes on, +5 for 5/5.
  Be the Keeper (v1.24): the same per save (+1 / +2 / +3, +1 with the kit), +5 for 5/5 saves.
  Brain Games (v1.25): +2 per puzzle the first time it is solved, +5 when every puzzle of a level is solved.
  Stage: 2 / 3 / 4 coins per star (Easy / Medium / Hard), 1–3 stars per song; no stars (and no coins) without a hit.
  Code Lab: +3 per puzzle the first time it is solved, +5 when every puzzle of a level is solved (Challenge: +5 and +10).
  Fidgets (v1.16): 1 per 5 slime stretches, 1 per 25 clicker clicks, Marble Maze +3 per new maze, +1 per replay, +5 once for all.
  Sticker Book (v1.18): +2 per sticker, once each. Pet (v1.19): earns nothing; a treat costs 2.
  Item prices are 0–40, except ⭐ big dreams (`dream:1`, 60–100, since v1.29). Keep earning steady and fair.
- A new closet item = one entry in `CLOSET[cat].items` with `{id, name, price, d()}` (tops use `t()` and `s()` for sleeves).
  A new decoration = one entry in `DECOR` with `{name, price, box, d()}` (plus `flat:1` for rugs, `wall:1` for wall items).
- **A content pack** is a new numbered file (like `17-pack1.js`) that only adds entries. New SVG patterns go in
  `EXTRA_DEFS` (added by `buildDefs`). New clothes should get photocard tags in `CARD_TAGS`. Give pack helpers a unique
  prefix (`p1Bat`, `p1Line`): all files share one global scope, so a repeated name stops the file from loading.
  Pop-it shapes are `POP_SHAPES` entries with a 100×100 outline `path`; owned as `popshape:<id>`.
  A new squishy `extra` goes in `SQ_EXTRAS` (`back`/`front` canvas drawings); a new spinner or slime `deco` picture goes in
  `FID_ICONS` (both in section 5, since v1.21). Pack 2 helpers use the `p2` prefix.
- Use the existing palette (`:root` CSS variables; pink `#ff8cc6`, purple `#a97cff`, mint `#8ff0d0`, gold `#ffd166`, dark `#231b2e`).
