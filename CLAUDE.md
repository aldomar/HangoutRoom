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
- **iPads and iPhones (since v1.59)**: the children's devices are iPads (and one iPhone). The same files are hosted on GitHub Pages
  (from `main`) and added to the Home Screen; `sw.js` keeps them offline after the first visit. Steps in `docs/IOS.md`.
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
  - No internet use: the APK has no `INTERNET` permission. Don't add it. The hosted iPad/iPhone copy (since v1.59) only loads
    its own files (first visit and updates, through `sw.js`); the app never sends or fetches anything else.
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
    A screen that only needs it sometimes adds a condition to `loopWanted()` instead (the Music Maker and the Dance Maker, while playing).
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
  - **Every file the page loads must be in `sw.js`'s `FILES` list** (the iPad/iPhone offline copy, since v1.59), in the same
    order, and `sw.js`'s `VERSION` must equal `APP_VERSION`. The smoke test checks both. A new `web/js` file goes in both places.
  - The service worker and the manifest link only start over `https` (`58-ios.js`), so `file://` and the APK never use them.
- **Files (since v1.9):** `index.html` holds only the page shell and screen markup; CSS is `web/app.css`; code is
  `web/js/NN-name.js`, one file per numbered section, listed in order by `<script src>` tags at the bottom of `index.html`.
  - All files share one global scope, but code that **runs while a file loads** (top-level statements, `x.onclick=fn`)
    may only use things from the same or earlier files. Functions called later (on taps, in the loop) can use anything.
  - A new game or content pack gets a **new numbered file** (e.g. `18-codelab.js`) and a new `<script src>` tag
    just above `99-startup.js` (which always loads last), rather than growing an old file. Keep each file under ~40 KB.
  - Keep the numbered section banner at the top of each file. The smoke test checks every `web/js` file is loaded, in order.
- **Touch first.** Use pointer events, which also work with a mouse. Interactive canvases and boards need `touch-action:none`.
- Tap targets of 48 px or more; text at least 14 px (16 px or more for body text).

## Navigation rules (agreed 2026-11-27)
The players are 3 to 11, and many can't read, so getting around must work from icons, places and sounds. **The iPads and
iPhone have no Back button or swipe-back in this app: on-screen buttons are the only way out of anything.** The map of every
screen and every way in and out is `docs/NAVIGATION.md`: **update its map and table whenever a screen, mode, game or way out
changes.** The shared helpers live in `76-nav.js`: `endBox` and `NAV_PLACES` since v1.85, `backBtn` since v1.86, `navBack`/`navLeave` since v1.87; the
whose-room chip `whoChips` and the Little mode check `lockCheck` since v1.88. New code must use these helpers; where none exists, follow the
rule by hand.
1. **Every round ends on the same end box** (`endBox`): ⬅ + the place's icon on the left (gray), 🔁 Again or ▶ Next on the right
   (pink), extra choices in the middle. Every button has an icon. The buttons ignore taps for about 0.5 s, so a quick tap from the
   game can't press one by accident.
2. **Back is always top-left, at least 48 px in every band, and shows where it goes** (⬅ + that place's icon from `NAV_PLACES`,
   plus its name when there is room). It goes exactly one step back, to where she came from (the room it was opened from, the
   Closet, the pet menu, a list), never further.
3. **One meaning per icon:** ⬅ = back one step; ✖ = close this box or game and stay here; 🏠 = her room and nothing else;
   ✔ = done; an arrow + a place's picture = go to that place (the room tabs and every Back button agree).
4. **Games that play inside the room** (like 🔍 I Spy, 🙈 Hide & Seek, 🎾 Fetch) follow rule 1 too and return to where they were
   started (the pet menu for pet games). The room must never look normal while it ignores taps: while one is on, its card shows
   at the top with a ✖.
5. **Back during a round pauses and asks, but only when leaving would lose something** (a match, a song, a show; `navLeave`): a big
   ▶ Keep playing and a smaller ⬅. If nothing is lost (a maker that keeps its work, a Jam, a fidget), Back leaves at once
   (owner, 2026-11-27). Between rounds it leaves straight away. Anything she made and hasn't saved asks first (like the Art Desk does).
6. **Whose room it is shows on every screen** (her buddy's face and badge next to the coins). Switching rooms stays easy (⚙️ → 👥)
   but never happens from a stray tap in a game.
7. **Every place says where she is:** a title with its icon, the room or game picture, and a line in `speakLine` (section 65).
8. **Three taps at most** from a room to anything played often; deeper things get a shortcut one level up.
- A new screen, mode or game: add it to `docs/NAVIGATION.md` (map and table), give its Back a `NAV_PLACES` place, and end its
  rounds with `endBox`. Remember 🧸 Little mode (`LOCK_SCREENS`) and the Android Back key (`androidBack`, which must do the same
  as the on-screen Back).

## Save data: protect her progress
- localStorage key `hangoutRoom.v1`. Shape: `DB = {version, profiles[], activeId, settings}`.
  Each profile has `name, mascotName, coins, lastDaily, seenTip, stats, look, owned[], room{wall,floor,items[]}, fid{pop,squish,spin,popShape}`,
  `artPay`, (since v1.4) `cards[], cardPins[], bonusGot[], cardNo`, and (since v1.5) `soccer{level, best{easy,medium,hard}, trophies[]}`, and (since v1.7) `stage{level, best{songId:{level:{stars,score}}}, mic}`, and (since v1.8) `easy, color, badge`, and (since v1.10) `room2{wall,floor,items[]}` (the Cozy Loft), and (since v1.11) `look.hairColor`, and (since v1.13) `code{level, solved[]}`, and (since v1.16) `maze{solved[]}`, `fid.slime/cube/marble`, `stats.stretches/clicks/mazes`, and (since v1.18) `stickers[]`, `stickerNew[]`, `stats.dailies`, and (since v1.19) `pet{kind, acc, names{}, hearts{}}`, and (since v1.20) `look.kind`, `look.face`, `tint`, `furn{}`, and (since v1.23) `room3{wall,floor,items[]}` (the Backyard), and (since v1.24) `soccer.mode` ('kick'|'keep'), `soccer.keep{level, best{}, gloves[]}`, `stats.saves`, and (since v1.25) `brain{game, level{snack,memory,pop}, solved[]}`, and (since v1.27) `looks[4]` (null or an outfit), `night{'1'|'2'|'3':true}`, `stats.nights`, and (since v1.28) `gifts[]` (waiting gifts), `presets{'1'|'2'|'3': 3 × null or a layout}`, `stats.gifts`, and (since v1.29) `dream` ('' or the DECOR key she is saving for), and (since v1.30) `speak` (null = follow Easy mode, or true/false), `stats.snaps`, and (since v1.36) `fidPay{day,n}` (fidget coins paid today), and (since v1.38) `music{kit, speed, cur, slots[3], pay{day,n}}`, and (since v1.40) `room4{wall,floor,items[]}` (the Studio; wall and floor are `''` until the first visit), and (since v1.41) `visit{cur, day, done[]}` (Visitors), `stats.wishes`, and (since v1.42) `duo{day, n, soccer, memory, stage}` (two-player coins today + games played; + `ball` since v1.64), and (since v1.43) `free{day, n}` (Free Play coins today), `potd{day}` (the last day the Puzzle of the Day was solved), `stats.free`, `stats.potd`, and (since v1.46) `little{colors{picId:[...]}, hung{picId:{art,sig}}, pay{day,n}}` (🧸 Play), `stats.colored/peeks/pads`, and (since v1.47) `dance{cur, music, slots[3], songs[], pay{day,n}}`, and (since v1.48) `garden{plots[6], grown[]}` (a plot is null or `{seed, day, step}`), `stats.planted/harvests`, and (since v1.49) `spy{lvl, rooms[], pay{day,n}}` (🔍 I Spy), `stats.spied/spyRounds`, and (since v1.50) `pet.home` ('' = the cushion, or a `PET_HOMES` id), `stage.backdrop` (a `BACKDROPS` id), and (since v1.51) `runway{pay{day,n}, cards[]}` (👠 Runway), `stats.walks/wows`, and (since v1.52) `jam{sound, pay{day,n}}` (🎸 Jam), `stats.jams/jamOwn`, and (since v1.53) `soccer.tricks[]`, `soccer.trick`, `soccer.trickPay{day,n}` (🎯 Trick Shots; `soccer.mode` can be `trick`), `stats.tricks`, and (since v1.54) `pet.toy` (the 🎾 fetch toy), `stats.seeks/fetches`, and (since v1.55) `walk{path, finds[]}` (🦮 Walks), `stats.petWalks/finds`, and (since v1.60) `ball{mode, bat{level, best{}, prizes[]}, catch{…}, derby{cur, done[], pay{day,n}}}` (⚾ Ball Field), `stats.hits/homers/catches/derbies`, and (since v1.67) `soccer.pay`, `soccer.keep.pay`, `ball.bat.pay`, `ball.catch.pay`, `stage.pay`, `maze.pay` (each `{day, n}`: that game's coins paid today, `GAME_PAY`), and (since v1.69) `band` ('little'|'easy'|'normal'|'challenge'; `p.easy` stays and follows it), and (since v1.71) `little.lock` (🧸 Little mode), and (since v1.75) `giftCodes{sent[], opened[], made{day,n}}` (🎁 Gift codes), and (since v1.76) `pet.day` (🐾 the pet's first-play heart), and (since v1.77) `code.prizes[]` (levels whose 🤖 robot was given), `brain.shelf`, `music.box` (📚 / 📻 given), and (since v1.78) `code.mine[3]` (🛠️ made levels: null or `{id, map[], max, moveMax, sol, move, at}`), `code.makePay{day,n}`, `stats.made`, and (since v1.79, save version 38) `room5{wall,floor,items[]}` (the Basement; wall and floor are `''` until the first visit), and (since v1.80) `dance.tracks[3]` (each saved dance's music: null, `beat`/a song id, or a loop copy `{g, kit, speed}`), and (since v1.83) a room item's optional `rot` (−45…45 in 15° steps, `rotOk`; missing = 0; saved layouts keep it too), and (since v1.84) its optional `yaw` (−1 faces left, 1 right, `yawOk`; missing = the front; layouts keep it).
  `settings.stageOffset` (ms, per device) is the Stage "Sound late?" setting. `settings.pin` ('' or 4 digits) is the
  optional grown-up PIN; it belongs to the device, so `doRestore()` keeps it. So does `settings.lastBackup` (ms, since v1.30), and `settings.setupDone` (ms, 0 = never, since v1.69; a device that had rooms before v1.69 counts as set up).
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
  - `APP_VERSION` in `web/js/01-save.js` (shown in Settings), **and** `VERSION` in `sw.js` (since v1.59).
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
  **Never compare `APP_VERSION` to a fixed number in a feature's section** (it breaks on the next bump): a section only checks its own
  `GIFT_TIMELINE` entry. The shared checks (section "Every other screen", and the About checks) tie `APP_VERSION` to `sw.js`, `versionName`,
  `versionCode` (= the minor version + 1) and a Gift Story that runs from 1.0 to `APP_VERSION`.
- **On the device:** the owner builds the APK in Android Studio and sideloads it. iPads/iPhones get each merge from GitHub Pages.
- iOS-only code paths are tried in the smoke test with `IOS_FAKE=true` and fakes for `navigator.share`, `speechSynthesis` and
  `DeviceOrientationEvent.requestPermission`. Haptics, the share sheet and Add to Home Screen can only be checked on a real device.

## Layout
- `index.html` (markup) + `web/app.css` + `web/js/`, one file per section, in order:
  1. `01-save.js` Helpers + save data (`DB`, `save`, `saveSoon`, `P()`; since v1.73 `fpDay()`, the one "today", and `dayIso`)
  2. `02-art-helpers.js` Art helpers (`st`, `starPath`, `heartPath`, `buildDefs` shared patterns and `#fuzz`/`#glow` filters)
  3. `03-mascot.js` Mascot + closet items (`FUR`, `CLOSET` by category, `mascotSVG`; mascot box is 200×270)
  4. `04-room.js` Room (`WALLS`, `FLOORS`, `DECOR` drawn bottom-centre at 0,0; `furniture()` hotspots; room box is 1000×700)
  5. `05-fidget-data.js` Fidget data (`POP_THEMES`, `SQUISHIES`, `SPINS`)
  6. `06-profiles.js` Profiles (`newProfile`, `normalize`)
  7. `07-sound.js` Sound (`SFX`, generated music, spinner hum)
  8. `08-ui.js` UI basics (`toast`, `modal`, `earn`, `tryBuy`, `buyConsumable`; since v1.67 the daily allowances `GAME_PAY`, `dayLeft`, `gameTake`, `gameEarn`, `payTips`; since v1.73 `dailyPay`)
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
  34. `34-helpers.js` Grown-up helpers (`backupSaved`, `lastBackupText`, `readOn`, `canSpeak`, `speakText` (Android or a device voice), `speakLabel`, `svgPng`, `snapRoom`, `snapCard`; since v1.67 the room's 🔊/🔇 button `#soundBtn`: `setSound`, `soundBtn`)
  35. `35-brain3.js` Brain Games 3: 🚂 Pattern Train (`TR_PUZ`, `trTrain`, `trWagon`) and 🔤 Word Builder (`WB_PUZ`, `wbTiles`, `wbTap`)
  36. `36-brain4.js` Brain Games 4: 🍕 Fraction Bakery (`FB_PUZ`, `fbTreat`, `fbCheck`) and 🪐 Fact Cards (`FACT_PUZ`, `factCard`, the 📇 binder `factBinder`)
  37. `37-pack3.js` Content Pack 3 (stage, cozy, cafe, ocean; only adds entries, each with `p3:<theme>`; `P3_THEMES`, `p3Have`,
      the squishy extras `frosting tentacles nori`, the 🍵 Cozy / 🧁 Cafe / 🐚 Ocean theme chips)
  38. `38-pack4.js` Content Pack 4 (sport, farm, trucks, space, the 🦖 dino nugget; only adds entries, each with `p4:<theme>`;
      `P4_THEMES`, `p4Nug` (the nugget drawing), `p4Have`, `p4Nuggets`, the squishy extras `nugget chick seams`, the 🐮 Farm chip)
  39. `39-extras.js` Extras (only pushes Challenge puzzles `c9`–`c14`, marble mazes `m7`–`m12` and 3 stickers; `exCodeAll`, `exCodeGot`)
  40. `40-music.js` Music Maker on the Loft's 🎹 keyboard (`MU_ROWS`, `MU_KITS`, `MU_SPEEDS`, `MU_IDEAS`, `MU`, `muPlay`, `muTick`, `muStop`, `renderMusic`)
  41. `41-studio.js` Studio + getting around (`ROOM_MAP`, `roomLinks`, `roomTabs`, `mapOpen`, `studioFurniture`, `studioStart`, the free `builtShelf`)
  42. `42-visitors.js` Visitors & wishes (`VISIT_FRIENDS` front-view SVG friends, `VISIT_WISHES`, `VISIT_SPOT`, `visitG`, `visitTap`, `visitCheck`, `VISIT_PLUSH`)
  43. `43-together.js` Two-player games (`TG` partner, `tgPick`, `tgPay`; Soccer Duel `TGS`, `tgDraw`; Memory for 2 `TGM`; Stage Together `TGT`)
  44. `44-freeplay.js` 🎲 Free Play + 📅 Puzzle of the Day (`FP_MAKERS` per game: `make(r, lvl)` + `ok(pz, lvl)`, `fpMake`, `fpPay`,
      `fpBrain`, `fpMaze`, `fpCode`, `POTD_GAMES`, `potdGame`, `potdOpen`)
  45. `45-words.js` Word Builder word bank (`WB_BANK` by level, `WB_PICS`, `FP_MAKERS.word`, `wbBankStart` for trace or
      👀 look, ✋ hide, spell, `wbLookView`, `wbBankTap`)
  46. `46-little.js` 🧸 Little Ones' Corner: `#littleBtn` in the room bar opens `scr-little` (`LT.view`: menu, colorPick, color,
      mat, peek; `renderLittle`, `ltGo`, `ltBackKey`), `ltPay` (`LITTLE_DAILY`), 🎵 Sound Mat (`LT_NOTES`, `LT_FUN`),
      👀 Peekaboo (`LT_HIDES`, `LT_SURPRISES`, `ltFriends`, `ltPeekTap`), the 🧸 Play sticker page
  47. `47-colorbook.js` 🖍️ Tap-to-Color (`CB_PICS` pictures as area paths, area 0 = background; `CB_CRAYONS`, `cbSVG`,
      `cbCols`, `cbDone`, `cbSet`, `cbHang` into the Art Desk Gallery)
  48. `48-dance.js` 💃 Dance Maker, opened from the Music Maker's `#muDance` and the Stage's `data-dance` tab (`DN_MOVES`,
      `DN_IDEAS`, `DN`, `dnChoices`, `dnPlay`, `dnTick`, `dnBeat`, `dnMove`, `renderDance`, `dnSaveSlot`)
  49. `49-garden.js` 🌱 Garden, opened from the Backyard's shed (`data-hot="garden"`): `GD_SEEDS` (12 seeds, a `d()` drawing each), `gdPlant`,
      `gdStep` (one step a day by `fpDay()`, never less than `plot.step`), `gdTouch`, `renderGarden`, `gdPick`, the pots `pot<Name>`, `gdShedBox`
  50. `50-ispy.js` 🔍 I Spy, started by `#spyBtn` on the room picture (`SPY`, `SPY_FURN`, `SPY_THEME_WORDS`, `spyThings`, `spySeen`,
      `spyPic`, `spyStart`, `spyNext`, `spyTap`, `spyHint`, `spyRoundDone`, `spyDark` for the 🔦 night flashlight, `spyEnd`)
  51. `51-spend.js` New things to buy (v1.50): 🏠 pet homes (`PET_HOMES`, `petHomeArt` drawn by `petG`, `petHomes`), 🎨 Stage
      backdrops (`BACKDROPS`, `stgBackdrop` called by `drawStage`, `stgBdRow` called by `stgPickView`), 🏛️ museum pieces (`SP_MUSEUM`)
  52. `52-runway.js` 👠 Runway, opened by `#runwayBtn` in the Closet (`RW_CARDS`, `RW_CATS`, `RW`, `rwFits`, `rwMatches`, `rwLevel`,
      `rwSurprise`, `rwWalk`, `rwCheer`, `rwDone`, `rwWearHome`, `rwStop`, `rwBackKey`; `RW_TEST_FAST` for the smoke test)
  53. `53-jam.js` 🎸 Stage Jam, opened by the Stage's `data-jam` tab and the Music Maker's `#muJam` (`JAM_SOUNDS`, `JAM_PADS`, `JAM`, `jamLoops`,
      `jamOpen`, `jamPickView`, `jamStart`, `jamTick`, `jamVoice`, `jamPlay`, `jamEnd`, `jamBackKey`, `drawJam`)
  54. `54-tricks.js` 🎯 Trick Shots, Soccer's third mode (`TRICKS`, `trTargets`, `trWallHit`, `trJudge`, `trRender`, `trShoot`, `trResolve`,
      `trWin`, `trGivePrize`, `drawTrick`, the 🏅 `trickStar` prize)
  55. `55-petplay.js` 🙈 Hide & Seek + 🎾 Fetch with the pet (`PP`, `PET_TOYS`, `ppStart`, `ppEnd`, `ppRedraw`, `ppSpots`, `ppCands`,
      `ppHide`, `ppShows`, `ppSeekTap`, `ppFound`, `ppThrow`, `ppLand`, `ppStep`, `ppFetched`; `PP_TEST_FAST` for the smoke test)
  56. `56-walk.js` 🦮 Pet walks, opened from the pet menu (`WALK_PATHS`, `WALK_IDS`, `WALK_FINDS`, `WALK_JARS`, `WK`, `wkOpen`, `renderWalk`,
      `wkStart`, `wkWalk`, `wkSniff`, `wkDig`, `wkHome`, `wkGiveJar`, `wkBook`, `wkStop`, `wkBackKey`; `WK_TEST_FAST` for the smoke test)
  57. `57-pack5.js` Content Pack 5: Finish the Outfits (only adds clothes, each with `p5:<any THEMES key>`; `P5_SETS` = the 10 finished
      outfits, `p5SetHave`, `p5SetsDone` for its 3 stickers)
  58. `58-ios.js` iPad + iPhone (v1.59): `IS_IOS`, `onIOS()` (`IOS_FAKE` for the smoke test), the https-only manifest link + `sw.js`
      registration, `iosTick` (iPhone haptics through a hidden `<input switch>`), `iosSaveFile` (share sheet), `iosPicture` (press and hold)
  59. `59-ballfield.js` ⚾ Ball Field (v1.60), opened by the Backyard's bat rack (`data-hot="ballfield"`): `scr-ball`, Batting (`BAT_PITCHERS`,
      `BAT_PITCHES`, `bfJudge`, `bfTap`, `bfSwing`, `bfResult`, `bfEnd`, `giveBats`, `drawBallField`, `bfPt`, `bfDrawPitcher`, `BATS` prizes, `BF_KIT`)
  60. `60-ballpack.js` Ball Field pack (only adds 4 baseball clothes, 4 decorations, theme chips through `bpTheme`, `CARD_TAGS`)
  61. `61-catch.js` 🧤 Catch, the Ball Field's second game (`CATCH_HITTERS`, `CATCH_HITS`, `ctCanCatch`, `ctCaught`, `ctDown/ctMove/ctUp`,
      `ctLand`, `ctEnd`, `givePennantPrizes`, `ctDraw`, `ctBallPt`, `ctDrawHitter`, `PENNANTS` prizes)
  62. `62-derby.js` 🎯 Home Run Derby, the Ball Field's third game (`DERBY`, `HR`, `hrPath`, `hrJudge`, `hrAim`, `hrLoft`, `hrFy`,
      `hrRender`, `hrBar`, `hrDown`, `hrResult`, `hrWin`, `hrPicker`, `hrDraw`, `hrTarget`, the ⚾ `goldenBall` prize)
  63. `63-ballduel.js` 👯 Batting Duel, the Ball Field's two-player game (`BD_PITCHES`, `BDL`, `bdStart`, `bdTurn`, `bdScore`,
      `bdResult`, `bdNext`, `bdEnd`, `bdOff`, `bdLevel`, `bdLayout`, `bdBatter`, `bdPitcherPl`)
  64. `64-setup.js` 👋 First-time setup + level bands (v1.69): `BANDS`, `BAND_IDS`, `bandOf`, `setBand`, `bandFresh`, `bandThink`, `bandPick`/`bandWire`,
      `bandModal`, `needSetup`, `setupCheck`, `setupStart`, `setupPin`, `setupVoice`, `setupBackup`, the 💾 `#bkNag` line (`bkNagDue`, `bkNag`)
  65. `65-speak.js` 🗣️ Spoken instructions (v1.70): `SPK_FIXED`, `BR_SPEAK` (per Brain game), `CL_SPEAK`/`clSpeak`, `speakLine` (where she is → `{k, t}`),
      `spkClean` (emoji out, fractions and 🪙 as words), `spkAuto`, `tell`, `spkCheck`, `spkAgain`, the 🔊 `.say-btn` in each top bar (`sayBtns`)
  66. `66-littlemode.js` 🧸 Little mode (v1.71): `LOCK_SCREENS`, `LOCK_ROOMS`, `LOCK_HOTS`, `lockOn`, `lockGuard` (called first by `show()`), `applyLock`
      (`body.locked`), `lockWiggle`, `lockLine`, the 🔒 `#lockBtn` hold (`LOCK_HOLD`, `lockUnlock`, `lockRelock`), `lockStart`, `lockRow` (Settings → Level);
      🎨 Dress like… (`dressThemes`, `dressLike`, `dressModal`, `#dressBtn`)
  67. `67-holidays.js` 🎉 Holiday greetings (v1.72): `HOLIDAYS` (`{id, icon, words, cols, date(year)}`; `hdFixed`, `hdNth` for "the Nth weekday",
      `hdEaster`), `holidayToday(day)` (by `fpDay()`), `holidayGreet(p, wait)` called by `enterRoom()` (09); confetti through `giftConfetti(cols)` (32).
      Nothing saved, no coins. Holiday ids aren't saved, so they can change.
  69. `69-giftcodes.js` 🎁 Gift codes between iPads (v1.75): `GC_ABC`, `gcMake`/`gcRead` (the 12-character code with 2 check characters),
      `gcWhatOf`/`gcKeyOf` (a `DECOR` key's 16-bit fingerprint), `gcMailbox`, `gcAsk` → `gcSend` → `gcShow`, `gcSentModal`, `gcTypeModal` → `gcOpen`;
      hooked into `giveModal` (`gcTop`, `gcWire`) and `giveTo` (`gcWhoBtn`). **Never change `GC_ABC`, `GC_KEY`, the bit layout or `gcHash`**:
      codes already made must keep opening (a new layout = a new `GC_VER`). A new decoration must not share a fingerprint (the smoke test checks).
  70. `70-petnotice.js` 🐾 The pet notices (v1.76): `petNotice(from, to)` (called by `show()`), `ntSnap`, `ntPick`, `NT_LINES`
      (`[change(p, snap), minimum, n -> lines]`, first one wins). **A new game should count what she does in `p.stats`** (or add an
      `NT_LINES` entry reading its own data), so the pet can cheer for it.
  71. `71-creations.js` 📻 Creations in the room (v1.77): the 🤖 Code Lab robots (`CR_BOTS`, one per `CR_BOT_LVLS` level, in the Loft),
      the 📚 `brainShelf` (Backyard; `crShelf()` draws each game's level spots from her progress), the 📻 `boombox` (My Stuff; `crBoomTap`
      plays her saved loops, `crRoomTap` called by the room's click handler). `crCheck()` (called by `show()` for room/code/brain/music and by
      `muSaveSlot`) gives what's due, once; `crShow` waits for an open box. Prize keys are saved: never rename them. A new Code Lab level needs a robot.
  72. `72-levelmaker.js` 🛠️ Code Lab level maker (v1.78): the `#clTabs [data-make]` tab (`CL.mk`), `CL.view` `make` (`lmList`, `lmListTap`,
      `lmOthers`) and `edit` (`#clMake`: `lmEdit`, `lmRender`, `lmDraw` with `clArt` from 18, `lmPaint`, `lmResize`), `lmBlocks(map, mv)`,
      `lmPz`, `lmOk` (shape by `codeMineOk` in 06 + its own answer through `codeSim`). A made level plays as level `make` (not in `CODE_LEVELS`;
      the puzzle carries `max`, `moveMax`, `blocks`, read through `clBlocks()`) with `CL.made` = `{own: slot}` or `{from, name}`; `clWin` hands it to `lmWin`.
  73. `73-basement.js` 🪜 Basement, the fifth room (v1.79): one `ROOM_MAP` entry (down from her room), `ROOM_NAMES[5]`, drawn with
      `studioFurniture` (nothing built in); `baseStart` (free `brick` wall + `grayCarpet` floor on the first visit), `baseHi`; the free
      `prizeCase` (`shelf.tops`, 3 shelves) and `prizePodium`; Decorate's 📦 All / 🏆 Prizes chips (`MINE.prizes`, `prizeChips`,
      `prizeGrid`: every `award:1` item in any room, tap = bring it here). Locked out in 🧸 Little mode (not in `LOCK_ROOMS`).
  74. `74-pack6.js` Content Pack 6 (v1.82, the children's first requests; only adds entries): 6 coloring pages pushed onto `CB_PICS`
      (`axolotl whaleShark dinoPup jelly turtle starPony`), the `axolotlPlush` and `dinoPup` plushes, purple things (`P6_PURPLE`, `P6_PURPLE_DECOR`,
      the `axolotl` pop-it board); themes through `p6Th` (adds to `THEME_OF`), no new chip.
  75. `75-turn.js` ↻ Turn decorations (v1.83): `decoT(it)` (every decoration's transform: spot + turn; standing things turn on their feet,
      wall/flat ones around their box's middle), `picked` (set by the room's pointerdown in 09), `turnable` (not shelves), `turnShow` (the
      `#turnBar` ↺ ↻ over the picked thing, called by `renderRoom`); `ROT_STEP`, `ROT_MAX` and `rotOk` live in 06. New code that draws a
      room item must use `decoT` for its `<g>` and `decoIn(it, svg)` around its drawing.
      ◀ ▶ Face left/right (v1.84): `decoIn` squashes and leans a standing item with `yaw` (`YAW_SQUASH`, `YAW_LEAN`) and adds the static
      `#depthL`/`#depthR` filter (a darker copy behind it as its side; not on drawings with an `an-*` animation); `faceable` (not wall,
      flat or shelf); `yawOk` lives in 06.
  76. `76-nav.js` 🧭 Getting around (v1.85, the navigation rules): `endBox({title, body, back:{to, on}, mid[], go})` (every game's end box:
      ⬅ + place on the left, extras in the middle, 🔁/▶/🎲 on the right in pink; `#modalBtns.nav-wait` blocks taps for `NAV_WAIT` ms; `modal()`
      clears it), `NAV_PLACES`/`navPlace`/`navBackText` (`'room'` = the room on screen, from `ROOM_MAP`), `endBoxOpen()`. The smoke test fails
      on a game file that makes an again/next button the old way. Pet games: `ppQuit` (55) and `wkToPet` (56) go back to the pet menu.
      ⬅ Back buttons (v1.86): a top-bar Back is `<button class="btn small nav-bk" data-place="…">`; `backBtn(el, place)` draws ⬅ + the place's
      icon + name (`.nb-t`, hidden under 520 px) and its `aria-label`; `show()` calls `navBacks(n)`, so `room` always shows the room the screen
      was opened from. Screens with steps call `backBtn` at each step. Boxes close with `✖ Close` (gray, last) and finish with `✔ Done`.
      ⏸️ Ask before leaving (v1.87): every Back that can leave a round calls `navBack(leave)`; `navMid()` says whether a round is under way
      (a new game that can lose a round adds a line there). Mid-round, `navLeave` opens ⏸️ Paused (⬅ + place gray, big pink ▶ Keep playing)
      and `NAV_HOLD.on` (08) makes the main loop pass `dt` 0; `modal()`/`closeModal()` turn it off. The Stage uses its own ⏸️ (`#stgLeave`), the
      Runway walk holds its timers (`rwHold`/`rwResume`). Android Back on the box = its ⬅.
      👤 Whose room (v1.88): `whoChips` (called by `updateCoins`, 08) puts the room's buddy (drawn once per look into an `<img>`, `whoArt`)
      and badge, in the room color, at the start of every `.coinsDisp`; tapping it only says whose room it is. A new screen with coins
      gets it for free. 🔒 `lockCheck(then)`: the PIN, or with no PIN 4 numbers written as words (`LOCK_WORDS`). 🎁 `#giveBtn` on the room picture.
  68. `68-undo.js` ↩ Undo (v1.74): `undoArm()` (a copy of the profile just before), `undoShow(u, back)`, `undoDo`, `undoOff`, `undoLeave`
      (called by `show()`), `#undoBar`. Hooked into `tryBuy`, `buyConsumable` (08) and `sendGift` (32). **A new shop must buy through
      `tryBuy`/`buyConsumable`** so it gets Undo; a new way to spend or give coins outside them should call `undoArm`/`undoShow` itself.
  99. `99-startup.js` (always last) Main loop + startup (`LOOP_SCREENS`, `wakeLoop` called by `show()`, `androidBack` hook)
- Drawings live in IndexedDB (`hangoutRoomArt`, through `ArtStore` in section 1), with a localStorage fallback
  (`hangoutRoom.art`). A poster is a room item `{type:'poster', art:<drawing id>}`. Backups carry drawings in an `artwork` list.
- A photocard is a small recipe `{id, no, at, look, stage, frame, title, name, s, bonus?}` in `profile.cards`, drawn by `cardSVG()`.
  Stage, frame and bonus ids are saved (`owned` uses `stage:id` / `frame:id`): never rename them. Small cards are drawn
  with `flat` (no `#fuzz` filter).
- Soccer: one canvas drawn by the main loop only while `cur==='soccer'`. Goal coordinates are `u` (-0.5..0.5 across)
  and `v` (0..1 up). Each level has its own original keeper: Easy = Mochi (cat), Medium = Boo (ghost), Hard = Flap (bat).
  The keeper picks its dive once, when she kicks (`socShoot`): one roll for guess right (`read`), stay in the middle (`stay`) or a side.
  Since v1.56 a curve and a hard flick lower `read` (`CURVE_SKILL`, `socSkill`), and a curve can send it the wrong way (`shot.fooled`,
  "Curve ball! 🌀"); tuned so a 5/5 against Flap is about 1 in 20–60 with great curved shots (straight shots stay as they were).
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
- Stage: the marquee (`stageMarquee()` in 04) hangs on the Cozy Loft's wall since v1.12 (it was above the closet), right above the 🎹 keyboard since v1.47. Songs are generated from small text recipes in `SONGS` (scale, chords, melody, drum patterns). `buildSong(id, level)`
  turns a recipe into audio events and a fixed note chart (no randomness). Song time comes from the audio clock
  (`stSongT()`), so taps line up with what she hears. Song ids `starlight/bats/sugar` (and since v1.26 `neon/clap/dino/rocket/lullaby`, in `30-songs2.js`) and level ids are saved: never rename them.
  `SONG_IDS` is made when 14 loads, so a song file must push its new ids onto it. A new song must pass the smoke test's chart rules
  (55–75 s long, Easy < Medium < Hard notes, so keep 3–4 melody notes in most bars). Encore! is pinned to the first 3 songs.
  Leaving the app mid-song pauses it (since v1.74): `stPause` → `#stgPause` ▶ `stGo` → a 3-2-1 → `stCountDone`; `STG.paused` keeps the audio
  clock suspended (`ac()` checks it) and `stUnpause()` drops the queued notes when she leaves instead.
  3 stars on Hard gives the Golden Mic (`goldenMic`, `award:1`) once (`stage.mic`). Background music pauses during a song.
- Level bands (since v1.69, section 64): each room has `p.band` 🧸 little / 🐣 easy / ⭐ normal / 🔥 challenge, picked by a grown-up in the New Room box,
  ✏️ Change Room and ⚙️ Settings → Level (behind `askPin`), shown as icons and names only (no ages). `p.easy` stays saved and follows it
  (on for little and easy), so code keeps reading `p.easy`; always read the band through `bandOf(p)` (Easy mode wins if they disagree) and change
  it through `setBand`. Becoming Challenge sets every game with no progress yet to Medium (`bandFresh`). Brain Games 🎲 Free Play's +2 only pays
  at the band's level or above (`bandThink`), otherwise `fpPay`. Band ids are saved: never rename them. The first-time setup shows only when
  `!settings.setupDone` and there are no rooms; `roomModal(p, then, back)` takes the setup's next step. Restoring counts as set up.
- 🧸 Little mode (since v1.71, section 66): `p.little.lock` (on for Little rooms; `setBand` turns it on going to Little and off leaving it;
  a switch in Settings → Level). While `lockOn()`, `show()` sends any screen not in `LOCK_SCREENS` to the room (the rooms list too,
  so Back never leaves and `lockStart()` reopens into it), `goRoom`/the room tabs keep to `LOCK_ROOMS`, `handleHot` wiggles anything not in
  `LOCK_HOTS` (the desk opens 🧸 Play instead of the Art Desk, with a Play sign; the corkboard has no sign), games open on Easy, and CSS under `body.locked` hides the rest (non-Easy level tabs, duels, Tricks, Derby, 📅, rename, Runway).
  **A new screen or hotspot is locked out by default**; add it to `LOCK_SCREENS`/`LOCK_HOTS` only if it's right for a 3-year-old, and hide its
  harder tabs under `body.locked`. Unlocking (hold 🔒 3 s, then `lockCheck`: the PIN, or with no PIN 4 numbers written as words, v1.88) lasts until 🔒 Lock or the app reopens (`LOCK.open`, never saved).
- Spoken instructions (since v1.70, section 65): `speakLine()` names where she is (screen + tab/mode/view/puzzle) and its line. `spkCheck()` runs
  after every tap (the Read to me click listener in 34, which now says a button's name just after the tap, unless a place's line was said) and
  after `show()`; it speaks when the place changed and `spkAuto()` (Read to me on, sound on, no song or loop). `tell(t)` says one-off lines the
  same way (`say()`, a visitor's wish, `brOops`, `brHint`, Code Lab's oops). The 🔊 button always speaks. **A new screen, tab, mode or Brain game
  needs a line in `speakLine`/`BR_SPEAK`** (the smoke test checks every one: no emoji, 20 words at most, 30 for a puzzle). Speech is slower
  (`spkRate`, 0.8) in Little and Easy rooms.
- Easy mode (per profile, `p.easy`): `applyEasy()` puts `easy` on `<body>` while that room is open; CSS under `body.easy`
  makes things bigger and hides tips. The pink room labels (`sign()`, class `sign`) only show under `body.easy` (since v1.12). Shop grids go through `easySort()`, `poorCls()` and `priceTag()`; buying goes through
  `tryBuy`/`buyConsumable`, which switch to the short Easy buy box. New shops should use the same helpers.
- Grown-up PIN: wrap a guarded action in `askPin(fn)` (it runs `fn` straight away when no PIN is set).
  Room colours (`ROOM_COLORS`) and badges (`ROOM_BADGES`) are saved ids: never rename or remove them.
- Hair (since v1.11) is a style (`CLOSET.hair` item, `hair:<id>`) plus a colour (`HAIR_COLORS`, owned as `hairc:<id>`,
  bought once for all styles). Hair items take `d(f, line, H)` and an optional back layer `b(f, line, H)`, where `H` is the colour.
  Old swoop ids (`swoopPurple` …) live on in `LEGACY_HAIR`; always read hair through `hairIds(look)`.
- Shelves (since v1.11): a wall decoration with `shelf:{w, top}`. Dropped items snap onto a shelf top, and dragging a
  shelf carries its riders (`onShelf`, `snapToShelf` in 09). Since v1.79 a shelf can have several tops (`shelf.tops`, read through
  `shelfTops(S)`; keep `top` too), like the Basement's Trophy Case. The room draws the wall and wall furniture, then flat items,
  then wall items (both in `R.items` order; touching one moves it to the end with `toFront(R, it)`, v1.31), then one
  layer sorted by floor position `y` (since v1.39): standing items, the room's own floor furniture, the buddy (y 604),
  the pet bed and gifts. Equal `y` keeps list order, so the last touched wins a tie.
- Room depth (since v1.39): `furniture(split)`, `loftFurniture(split)` and `yardFurniture(split)` return `{wall, floor:[{y, h}]}`
  with `split` (and the whole picture as text without it). A new built-in piece that stands on the floor goes in `floor`
  with the `y` of its feet; wall pieces stay in `wall`. Floor pieces, the buddy, pet and gifts are wrapped in `.fixed`,
  which fades and lets taps through while decorating.
- Five rooms (Loft since v1.10, Backyard since v1.23, Studio since v1.40, Basement since v1.79): `roomNo` (1 = `p.room`, 2 = `p.room2`, 3 = `p.room3`,
  4 = `p.room4`, 5 = `p.room5`), `curRoom(p)` for the room on screen, `rooms(p)` for all five and `allItems(p)` for every item. My Stuff (items with `placed:false`) is shared
  between rooms; placing a stored item moves it into the room on screen. New code that adds or finds room items must use
  these, not `p.room` directly (prizes like trophies still go to `p.room`). Back goes any other room → room → profiles.
- Getting around (since v1.40, `41-studio.js`): her room is the hub. `ROOM_MAP` lists every room with the room it hangs off
  (`from`) and the way (`dir`: up/down/left/right) plus its place on the map (`col`, `row`). That gives the arrow tabs
  (`#roomTabs`, HTML over the room picture, so decorations can't cover them; hidden while decorating) and the 🗺️ house map
  (`#mapBtn` in the top bar). A new room = one `ROOM_MAP` entry + its drawing in `renderRoom`. Her window (`data-hot="window"`)
  is a shortcut to the Backyard; Soccer opens only from the Backyard's goal.
- Studio (since v1.40): nothing built in (`studioFurniture` is empty). `studioStart()` gives it her room colour's wall on the
  first visit. The free Built-in Shelf (`builtShelf`, `first:1` = listed first in the Shop) is the built-in option;
  `buyConsumable` skips the question for price 0 and `priceTag` says Free.
- Two-player games (since v1.42, `43-together.js`): a 👯 button in Soccer (`data-duo` tab), Memory Match (a `#brTabs` tab) and the top of the Brain Games menu (`BR_MENU_TOP`) and
  the Stage tabs opens `tgPick` (another room or 👤 Guest; `TG.p2` lasts until the app closes). Hooks: `drawSoccer`/the Soccer canvas
  pointer handlers hand over to `tgDraw`/`tgDown`/`tgMove`/`tgUp` while `TGS.on`; the kicker uses `socAim()` (the ⚽ Kick swipe maths,
  shared). The Stage's `duo` level (`STG_LEVELS.duo`: Medium chart, Easy timing; lane 0 = player 1) is used while `TGT.on` and is never
  saved; `stFinish` hands over to `tgStageEnd`. Memory for 2 is the Brain Games view `duo` (`#brDuo`). Two-player games must never
  change bests, trophies, gloves, stars, `brain.solved` or `stats.matches`; they pay through `tgPay` only.
- Free Play + Puzzle of the Day (since v1.43, `44-freeplay.js`): a maker turns a seed into a puzzle in the game's own format
  (`brRand`, so the same seed = the same puzzle) and its `ok()` checks it with the same rules as the fixed puzzles (the dice roll
  again if not). Made-up puzzles are opened through hooks: `brPuzzle(g, l, idx, fz)` with `BR.free` (shuffles use `brKey`),
  `mzStart(i, free)` with `MZ.free`/`mzCur()`, `clOpen(lvl, idx, free)` with `CL.free`/`clPz()`; their wins go to `fpBrainWin`,
  `fpMazeWin`, `fpCodeWin`. They are never saved and never change `brain.solved`, `maze.solved`, `code.solved` or level bonuses.
  🎲 is in `FP_BRAIN` (snack memory pop train bake, + word since v1.45; facts can't be made up), the maze bar and the Code Lab's Easy/Medium
  lists. The 📅 card (`BR_MENU_TOP`) turns through `POTD_GAMES` by the date (`fpDay()`; the smoke test sets `FP_TEST_DAY`) and
  seeds with the date. A new game that can be generated gets a `FP_MAKERS` entry (and its `ok` should also pass its fixed puzzles).
  Word Builder (since v1.45) draws words from `WB_BANK` (the owner's list); a bank word is `{bank:1, w, x, pic}` and plays through
  `wbBankStart` (Easy traces faint letters; Medium/Hard: 👀 look, ✋ hide, spell, 👀 peeks, no timer; since v1.66 the word starts hidden
  when `canSpeak()`, so she listens first). Extra letters are never in the word.
- 🧸 Little Ones' Corner (since v1.46, `46-little.js` + `47-colorbook.js`): no words needed, no scores, no wrong answers. Colors are
  saved per picture as one `'#rrggbb'` or `''` per area, by the area's place in `CB_PICS[i].areas`: picture ids are saved, so never
  rename a picture or reorder, remove or insert its areas (new pictures go at the end). Areas in one region that overlap must wind
  the same way (`cbE`/`cbC` go one way, `cbR` the other), or the overlap shows as a hole. `p.little.hung` maps a picture to its
  Gallery drawing, so hanging again updates it. No main loop: CSS animations only. Peekaboo's next round uses one `setTimeout`.
- Dance Maker (since v1.47, `48-dance.js`): a dance is 8 move codes (`h s p w b c j o`, `.` = empty, an empty beat nods); codes and
  music ids (`beat`, `loop`, `m0`-`m2`, a song id) are saved: never rename them. Moves are whole-body CSS animations (`.dm-*`, one beat
  long through `--bt`) on an `<img>` of the buddy drawn once (`dnArt`), because sleeves and arm warmers are drawn over the arms.
  Music is scheduled on the audio clock (Music Maker voices `muVoice`, or `buildSong(id,'easy').ev`); `dnTick()` runs from the
  main loop only while `DN.playing`. While playing, a tapped move is 🕺 free dance (`DN.next`). Back goes to `DN.from` (music/stage).
  The Loft's 🎤 Stage marquee hangs above the 🎹 keyboard since v1.47.
  Since v1.80 the room's 💃 Dance emote (`playEmote`, 31) dances her saved dances in turn through `rdDance()` (48): one `setTimeout` a beat
  plays its sound (the dance's own music, else the Dance Maker's, through `dnLoopOf`; a song plays its events from `first`, the 8 beats after the 2 intro bars) and puts a `.rm-*` move on `#mascotG`. The `.rm-*`
  moves are 2D and in px (SVG: no `%`, no `rotateX/Y`). `rdStop()` runs on any emote, in `show()` leaving the room, and in `renderRoom()` while
  decorating; a plain redraw keeps it going. No saved dance = the old `em-dance`. No main loop.
  Each saved dance keeps its music in `p.dance.tracks[i]` (`dnTrackNow` on 💾 save; `dnTrackId` for ▶ Load and the room). A loop is kept as a copy,
  chosen as music id `d0`-`d2` (`dnLoopSrc`); those ids are saved in `p.dance.music`: never rename them. A null track = the Dance Maker's music.
- 📻 The boombox (71) is the one decoration that catches taps outside Decorate (`#roomSvg .deco .bb`); `.deco` lets taps through.
- I Spy (since v1.49, `50-ispy.js`): the 🔍 `#spyBtn` (right of 🌙) puts `spying` on `<body>`: the `#spyCard` clue card takes the top
  bar's place and the room tabs, 📷 and emotes hide. While `SPY.on`, the room's click handler hands taps to `spyTap` (nothing opens),
  `show()` to another screen and Back end it, and `renderRoom` adds `spyDark()` at night. Things to spy are found in the drawn room:
  every `.deco` plus the `[data-hot]` pieces named in `SPY_FURN` (a new built-in hotspot that should be spied needs an entry), minus
  anything hidden or under 22 px (`spySeen`, by `elementFromPoint`). ⭐⭐⭐ hints use theme chips through `SPY_THEME_WORDS` (a new
  theme chip needs words there; the smoke test checks). Nothing about a round is saved except the totals and `spy.rooms`. No main loop.
- New things to buy (since v1.50, `51-spend.js`): pet homes are owned as `pethome:<id>` and drawn under the pet where the cushion
  (`petBed()`) was; they stay inside the pet's spot and low on the left, where the buddy's feet are. Stage backdrops are owned as
  `backdrop:<id>` and drawn once into a hidden canvas (`BD`), then copied each frame, so a new backdrop costs nothing per frame.
  Home and backdrop ids are saved: never rename them. A **standing** decoration with `shelf:{w, top}` (a pedestal) carries what sits on
  it like a wall shelf; `rideY()` (09) sorts riders just in front of it, and `snapToShelf` never puts a shelf on a shelf.
- Runway (since v1.51, `52-runway.js`): `scr-runway` has 3 views (`data-view` cards/dress/walk). The outfit for a show is a copy (`RW.look`);
  her `p.look` changes only through 👗 Wear it home (`rwWearHome`, owned pieces only), and 👜 borrowing never touches `p.owned`. A piece
  matches a card when its theme chips (`themesOf`) share one with `card.th`, so new themed clothes count automatically; every themed card
  needs matching clothes in 3+ tabs (the smoke test checks). Card ids are saved in `runway.cards`: never rename them; add new cards at the
  end. The walk is one-time CSS animations on a picture of the buddy drawn once (like the Dance Maker) and a few `setTimeout`s; `show()`
  to another screen and Back call `rwStop()`. Coins +3 a show, `RW_DAILY` 15 a day. No main loop.
- Trick Shots (since v1.53, `54-tricks.js`): `soccer.mode` `trick` (`socTrick()`); `renderSoccer`, `drawSoccer` and the canvas pointer handlers hand
  over like 🧤 Keep. No keeper; the 3 keepers cheer at the side or stand as a wall. A trick is a `TRICKS` recipe: targets `{k, u, v, r, mu/mv}`
  (star, hoop, balloon, bell, bathoop), an optional `wall{e, u0, u1, h}` checked where the ball passes it (`trAtWall`, the same path as
  `ballPos`), `order`, and `sol` (one working shot per target: the smoke test proves them and they draw the 💡 hint). `trJudge()` holds the
  rules with no drawing. Trick ids `t1`… are saved: never rename them; new tricks go at the end. All 12 = `trickStar` (`award:1`) in the Backyard.
- Pet play (since v1.54, `55-petplay.js`): 🙈 and 🎾 at the top of the pet menu. While `PP.on`, `body.petplay` hides the top bar, room tabs,
  🌙 🔍 📷 and emotes; `#ppCard` takes the top bar's place; the room's click handler hands taps to `ppTap`; `show()` to another screen and Back
  call `ppEnd`; `renderRoom` ends with `ppRedraw()` so a redraw keeps the game. Hiding spots are found in the drawn room (standing `.deco`s
  and `.fixed` floor pieces, not the buddy, pet, gift or visitor, at least 60×50); the pet is drawn just before the spot in the SVG and
  `ppShows()` measures what peeks out with `elementFromPoint` (8–45%, Easy 16–45%). Fetch moves the toy and a runner copy of the pet with
  `requestAnimationFrame` only while they move. Toy ids (`ball bone yarn disc`, owned as `pettoy:<id>`) are saved: never rename them.
  Pet play earns hearts only (`petGive`), never coins.
- Pet walks (since v1.55, `56-walk.js`): `scr-walk` has 3 views (`data-view` pick/walk/book). A path is a `WALK_PATHS` entry of SVG strips
  (`still` sky, `far`, `mid`, `ground`, each 1000 wide and drawn twice) that CSS slides only while `.walking` is on the scene (no main loop),
  plus the sniff spot `prop`. A sniff comes after `WK_GAP` ms of walking (one `setTimeout`, cleared on letting go); new finds come first.
  Path ids, find ids (`WALK_FINDS`, `seen:1` = an animal, only said hello to) and jar keys (`jarMeadow` …, `award:1`, put in My Stuff) are
  saved: never rename them; new finds go at the end of their path. Hearts only, never coins.
- Stage Jam (since v1.52, `53-jam.js`): no new screen; `scr-stage` gets `#jamPick` (the loop picker) and `#jamStop`. `STG.state` is `jam` while
  the band plays and `jamdone` behind the cheer box; `drawStage()` hands over to `drawJam()` then, and both share `stgScene()` (backdrop,
  spotlights, beat lights) and `stgBounce()` (14). The loop is scheduled on the audio clock with the Music Maker's `muVoice`. Back goes
  jam → loops → songs (or the Music Maker, `JAM.from`); `stgStop()` (leaving the screen) ends a jam quietly and still pays.
  Sound ids (`sparkle pluck toot`) are saved: never rename them. Song stars and bests never change in a jam.
- Garden (since v1.48, `49-garden.js`): the Backyard shed opens `scr-garden` (6 plots, a seed tray). A plant grows one step a day by
  itself from the device date (`fpDay()`, so the smoke test sets `FP_TEST_DAY`): seed, sprout, bud, ready. It never wilts; `plot.step`
  keeps the biggest step reached, so a date that goes back never shrinks it. Watering is only sparkles (nothing saved). Picking pays
  `GD_COINS` (3); the first of a kind puts its pot (`pot<Name>`, `award:1`, a theme chip + 🌳 Outdoor) in the Backyard. Seeds to buy are
  owned as `seed:<id>`. Seed ids and pot keys are saved: never rename them; new seeds go at the end of `GD_SEEDS`. No main loop.
- Ball Field (since v1.60, `59-ballfield.js`): one canvas `#bfCv` drawn by the main loop only while `cur==='ball'`; the view is from behind
  home plate, field points (x across, z out to the fence = 1) go through `bfPt()`, and the static background is drawn once per size into `BF.bg`.
  Her buddy is an SVG over the canvas (`#bfMascot`, with a CSS-swung bat). Batting: tap = the pitch, tap again = swing; `bfJudge(level, d)`
  holds the timing rules (home run / hit / foul / miss) with no drawing. 6 pitches, no strike-outs, no timer. Pitches are fixed lists
  (`BAT_PITCHES`, taken in turn). `p.ball.mode` is `bat` (later also `catch`, `derby`); mode, level and prize ids are saved: never rename them.
  A 6/6 gives `batBronze/batSilver/batGold` (`award:1`) in the Backyard. The Sticker Book's `soccer` page is named Sports since v1.60.
  🧤 Catch (v1.61, `61-catch.js`): `bfMode()` picks the game; `renderBall`, `drawBallField` and the canvas pointer handlers hand over to
  `ctNewGame`/`ctDraw`/`ctDown`… The view is from the outfield (z = 0 her catch line, z = 1 home), `ctPt` maps `u` (-1..1) through `g.k`,
  which keeps the buddy on screen. Hits are fixed lists (`CATCH_HITS`, 15 per level, 5 a game); `ctCanCatch` must hold for every hit from
  either side (the smoke test checks). A 5/5 gives `pennantBronze/pennantSilver/pennantGold` (`award:1`, `wall:1`) on the Backyard fence.
  🎯 Home Run Derby (v1.62, `62-derby.js`): mode `derby`; the batting view, Pip only, the level tabs hidden (`#bfTabs.derby`) and the
  `#hrBar` challenge bar (Trick Shots' `.tr-*` classes) instead of the scoreboard. A swing is `a` (timing, `hrAim`) and `l` (tap height,
  `hrLoft`); the ball follows `hrPath(a, l, e)`. A `DERBY` challenge is `{id, icon, name, say, sol{a, l}, t:[{k, e}]}`: each target sits
  at place `e` on the `sol` path (`hrTgt`), so `hrJudge(ch, a, l, ease)` always passes `sol` (the smoke test checks every one, and that
  enough nearby swings work). Challenge ids `d1`… are saved in `ball.derby.done`: never rename them; new challenges go at the end.
  All 12 = `goldenBall` (`award:1`) in the Backyard.
  Since v1.63 Medium and Hard are tougher: the help ring (Batting's circle, Catch's landing ring) shows fully only on Easy and in Easy
  mode, fades in late on Medium, and never shows on Hard. Catch on Medium/Hard (`depth:1`, `ctDepth()`) adds `v` (0..1, `CT_ZMAX` in
  toward home) to every hit and to the buddy (`CT.bv`/`CT.tv`; `ctFinger` reads the finger's height on the grass); distances go through
  `ctDist` (a run in costs `CT_VU` of a run across), and `ctCanCatch(lvl, fu, fv, hit)` must hold from all 4 corners.
  Since v1.68 every hit must pass `ctHitOk(lvl, hit)` (inside, `CT_KIND_MIN`, all 4 corners, 0.1–0.55 s spare on Medium/Hard), and Hard
  makes 5 fresh hits each game (`ctMakeGame(seed)`, `brRand`; `CT_SPARE` is the knob if Hard is too hard); Medium and Easy keep their fixed lists.
  Reading the ball, every level: the crack by depth (`ctCrack`, `ctTier`: CRACK!/WHACK/tok, with the word drawn by `ctWord` so it works with
  the sound off), mowed lanes from home and 3 bands near her line (drawn once in `ctBack`), and a shadow trail on Medium and Hard.
  👯 Batting Duel (v1.64, `63-ballduel.js`): the `data-duo="ball"` tab opens `tgPick('ball')`, which calls `bdStart()`. While `BDL.on`
  (`bfDuel()`), section 59 hands over: `bfLvl()` returns `BDL.lvl`, and `bfScore`, `bfResult`, `bfNext` and a tap before a pitch go to
  the `bd*` functions; the mound shows the pitcher's buddy (`#bdPitcher`) instead of Pip/Rocco/Hoot, and the pitcher picks from `#bdBar`.
  `renderBall()` and `bfStop()` end a duel (`bdOff`). The state object is `BDL` because `BD` is the Stage backdrop canvas (section 51).
  Like every two-player game it pays through `tgPay` only and never changes bests, bats or `stats.hits/homers`.
  `bfMode()` returns `bat` while `BDL.on` (v1.65), so a duel started after Catch or Derby still draws and plays as batting.
- Visitors (since v1.41, `42-visitors.js`): one friend at a time stands at `VISIT_SPOT` in whichever room is on screen
  (`visitG`, in the floor layer, `data-hot="visitor"`). A wish is `{id, who, icon, title, say, parts[]}`; a part is one line of the
  card with `have(p, R)` and `n`, built by `vInRoom`/`vWear` (theme chips, so new themed items count automatically) or the fixed
  parts `vRug vPosters vGlow vNight vYard`. `visit.cur` is the wish waiting; a new one comes only when none is waiting and
  `visit.day` (the day the last wish came true) is not today. Wish ids (`mochi1` …) and plush keys (`plushMochi` …) are saved:
  never rename them; add new wishes at the end. The smoke test proves every wish can be met with things for sale.
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
  In the room, pet messages use the speech bubble (`say`), because a toast would cover the pet; since v1.79 `say(text, 'pet')`
  (`petSay`, the 🐾 pet-notice lines) puts it over the pet with its tail pointing at it (`#bubble[data-who]`), or over the buddy when there is no pet.
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
- About (since v1.22): ⚙️ Settings → 💌 About (`scr-about`). Since v1.59 the owner's generic words ("Kids", the letter, the
  signature) are the built-in `ABOUT_DEFAULT`, so the hosted iPad/iPhone copy shows them. Anything personal (nicknames, secret,
  per-version `why` lines) goes in `web/about-local.js`, which is **git-ignored and must never be committed, read into a PR, or
  quoted on GitHub** (and so is never on GitHub Pages); `index.html` loads it right after `25-about.js`, and each field falls back to `ABOUT_DEFAULT`.
  `web/about-local.example.js` (in git) uses invented names only. **Every PR adds a `GIFT_TIMELINE` entry** for its
  version (date, icon, name, generic `why`, and a short `news` list for the ✨ What's New box). `settings.seenNew` is
  the last version whose What's New was shown; it belongs to the device, so `doRestore()` keeps it (like the PIN).
- Looks & night (since v1.27, `31-looks.js`): ⭐ My Looks in the Closet saves 4 outfits (every `look` key except `kind`, `face`, `fur`).
  Tapping the buddy shows `#emoteBar` (4 CSS emotes on `#mascotG`). 🌙 `#nightBtn` sets `p.night[roomNo]`; `renderRoom` adds
  `nightLayer()`: one masked dark layer (`pointer-events:none`) with soft light at `NIGHT_GLOW` decorations.
  Since v1.40 indoor walls have no night stars (only the windows show a starry sky); the Backyard's sky has the
  Big Dipper (`DIPPER`, 7 stars, no lines). A new lamp-like
  decoration should get a `NIGHT_GLOW` entry. Night is off while decorating.
- Gifts & layouts (since v1.28, `32-gifts.js`): a gift goes into the other profile's `gifts[]` inbox (no network) and is drawn as
  a `data-hot="gift"` pile at `GIFT_SPOT` in every room; opening adds coins or places the decoration. Posters and `award` items
  can't be given. 🏠 Layouts is Decorate's 7th tab; a layout stores item uids, so loading finds items in any room or My Stuff.
- Theme chips + dreams (since v1.29, `33-shopplus.js`): an item's themes come from `p2`, `p3` (since v1.35), `p4` (since v1.36), `p5` (since v1.58), `yard`, `dream` and `THEME_IDS`.
  **A new closet item or decoration should get a theme** (a `p2`-style field or a `THEME_IDS` entry), so the chips find it.
  Big dreams have `dream:1` and are the only items allowed above 40 coins.
- Helpers (since v1.30, `34-helpers.js`): Read to me speaks a tapped button's `aria-label`, `.tn` text or text (emoji
  stripped), or a hotspot's `HOT_WORDS` name; give icon-only buttons an `aria-label`. Snapshots copy an SVG with the
  `#gdefs` patterns into a canvas, so room drawings should not depend on CSS (labels with `.sign` are left out).
- Music Maker (since v1.38, `40-music.js`): the Loft's keyboard (`data-hot="music"`) opens `scr-music`. A loop is 72 characters
  of 0/1 (9 rows x 8 steps). Kit ids (`soft chip dreamy`) and speeds (0-2) are saved: never rename them. Notes are scheduled on the
  audio clock with the Stage's voices; `muTick()` runs from the main loop only while `MU.playing`.
- Every room area is open. To add a locked area for a future feature, put it in `LOCKED` and `handleHot()`.
- `android/`: Gradle project; `app/src/main/java/com/family/hangoutroom/MainActivity.kt`; `android/README.md` has build/sideload steps.
- `PLAN.md`: roadmap. `docs/STATUS.md`: handover / current state.

## Conventions
- **Days and daily allowances (since v1.73):** "today" is always `fpDay()` (section 1, `2026-11-24`; the smoke test sets `FP_TEST_DAY`),
  never `new Date().toDateString()` or a file's own helper. Every saved `{day, n}` allowance is paid through `dailyPay(o, cap, n)` (section 8),
  which starts a new day at 0, pays up to the cap and counts it; never copy the reset. The smoke test checks both.
- **Fidget allowance (since v1.36):** pop-it, squishy, spinner, slime and clicker coins go through `fidEarn()` (section 10) and
  share `FID_DAILY` = 30 coins a day (`p.fidPay`, like the Art Desk's `artPay`). After that the fidgets still work and count
  for stickers, with one gentle note, and it refills quietly the next day. A new fidget must pay through `fidEarn()`, not `earn()`.
  The marble maze (a puzzle) and the games are not part of it.
- Coins: 1 per 10 pops, +5 per pop-it flip, 1 per 5 squishes, 1 per 25 spinner turns (fidget coins: 30 a day in all, since v1.36), +10 daily gift, 25 to start,
  +5 per new drawing (3+ strokes, first 5 a day), +10 per bonus photocard (each milestone once). Making a photocard is free.
  Soccer: +1 / +2 / +3 per goal (Easy / Medium / Hard), +1 more per goal with 2+ soccer clothes on, +5 for 5/5.
  Be the Keeper (v1.24): the same per save (+1 / +2 / +3, +1 with the kit), +5 for 5/5 saves.
  Brain Games (v1.25): +2 per puzzle the first time it is solved, +5 when every puzzle of a level is solved.
  Stage: 2 / 3 / 4 coins per star (Easy / Medium / Hard), 1–3 stars per song; no stars (and no coins) without a hit.
  Code Lab: +3 per puzzle the first time it is solved, +5 when every puzzle of a level is solved (Challenge: +5 and +10).
  Fidgets (v1.16): 1 per 5 slime stretches, 1 per 25 clicker clicks, Marble Maze +3 per new maze, +1 per replay, +5 once for all.
  Sticker Book (v1.18): +2 per sticker, once each. Pet (v1.19): earns nothing; a treat costs 2. Music Maker (v1.38): +3 per saved new loop, 3 a day.
  Two-player (v1.42): +3 per finished game to each player's room (not a Guest), 15 a day (`TG_DAILY`).
  Free Play (v1.43): +1 per made-up puzzle, 10 a day (`FREE_DAILY`); since v1.57 the Brain Games in `FP_THINK` (all but Memory Match,
  + word) pay +2 (`FREE_THINK`, `fpThinkPay`) with no cap and leave `p.free.n` alone (since v1.69 only at the room's band level or above, `bandThink`); 📅 Puzzle of the Day +5 once a day (no streak).
  🧸 Play (v1.46): +1 per finished picture or Peekaboo friend found, 10 a day (`LITTLE_DAILY`); the Sound Mat pays nothing;
  🖼️ Hang it up goes through the drawing rules (+5, first 5 a day).
  Dance Maker (v1.47): +3 per saved new dance, 3 a day (`DN_DAILY`). Garden (v1.48): +3 per plant picked (each plant takes 3 days).
  I Spy (v1.49): +2 per round of 5 finds, 10 a day (`SPY_DAILY`). Runway (v1.51): +3 per show, 15 a day (`RW_DAILY`).
  Stage Jam (v1.52): +2 per jam of 20+ notes, 3 jams a day (`JAM_DAILY`). Trick Shots (v1.53): +3 per trick the first time, +1 a replay, 10 a day (`TR_DAILY`). Pet play (v1.54): hearts only (+2 a find, +1 a fetch), no coins. Pet walks (v1.55): hearts only (+1 a find, +3 a walk), no coins.
  Ball Field Batting (v1.60): +1 / +2 / +3 per hit (Easy / Medium / Hard), +2 more for a home run, +1 more with 2+ baseball kit pieces on, +5 for 6/6.
  Ball Field Catch (v1.61): +1 / +2 / +3 per catch, +1 more with the kit, +5 for 5/5.
  **Daily allowances (v1.67):** Soccer Kick, Be the Keeper, Batting, Catch and the Stage pay per play through `gameEarn(key, …)`/`gameTake`
  (section 8), 20 coins a day each; Marble Maze replays 10. Outside the allowance (plain `earn()`): the first perfect on a level
  (the one that wins its trophy, glove, bat or pennant; a repeat perfect comes out of the allowance), Stage coins for new stars
  (above her best on that song and level), a new maze, and every other first. When one is full, one note a day names a place that
  still pays (`payTips`, also used by `needMore`). A new game that pays per play gets a `GAME_PAY` entry.
  Home Run Derby (v1.62): +3 per challenge the first time, +1 a replay, 10 a day (`HR_DAILY`).
  Visitors (v1.41): +5 per wish that comes true (one new friend a day), and a plush after a friend's 3 wishes.
  Item prices are 0–40, except ⭐ big dreams (`dream:1`, 60–100, since v1.29). Keep earning steady and fair.
  🧸 Little rooms (since v1.89, by `bandOf(p)==='little'`, not the lock): everything costs half, rounded up (`costOf(p, price)`, section 8),
  and the daily gift is +20 (`dailyGift(p)`). **A new shop must buy through `tryBuy`/`buyConsumable` and show prices through
  `priceTag` or `costOf`**, never a raw `item.price`.
- A new closet item = one entry in `CLOSET[cat].items` with `{id, name, price, d()}` (tops use `t()` and `s()` for sleeves).
  A new decoration = one entry in `DECOR` with `{name, price, box, d()}` (plus `flat:1` for rugs, `wall:1` for wall items).
- **A content pack** is a new numbered file (like `17-pack1.js`) that only adds entries. New SVG patterns go in
  `EXTRA_DEFS` (added by `buildDefs`). New clothes should get photocard tags in `CARD_TAGS`. Give pack helpers a unique
  prefix (`p1Bat`, `p1Line`): all files share one global scope, so a repeated name stops the file from loading.
  Pop-it shapes are `POP_SHAPES` entries with a 100×100 outline `path`; owned as `popshape:<id>`.
  A new squishy `extra` goes in `SQ_EXTRAS` (`back`/`front` canvas drawings); a new spinner or slime `deco` picture goes in
  `FID_ICONS` (both in section 5, since v1.21). Pack 2 helpers use the `p2` prefix.
- **American English (since v1.44).** The children learn American spelling, so everything the app shows and every code comment
  uses it (color, favorite, gray, center, cozy, tire; the season is "Fall"). Saved ids never change to match (the season id
  stays `autumn`). The smoke test fails on British spellings in `web/` and `index.html`. New doc text uses American spelling too.
- **Drawings must be strict XML (since v1.51).** Never repeat an attribute on one element: `st()` already writes
  `stroke`, `stroke-width`, `stroke-linejoin` and `stroke-linecap`, so don't add those after `${st(...)}` (or `${HL}`), and don't put a
  `fill` before a shared attribute string that has its own. Inside the page the browser ignores the repeat, but a picture made from the
  SVG (the Runway and Dance Maker buddy, 📷 snapshots) shows as a broken image. The smoke test parses every look and decoration as XML.
- Use the existing palette (`:root` CSS variables; pink `#ff8cc6`, purple `#a97cff`, mint `#8ff0d0`, gold `#ffd166`, dark `#231b2e`).
