# CLAUDE.md

Guidance for Claude Code in this repo. The full build plan and roadmap are in `PLAN.md`.

**Starting a new conversation? Read `docs/STATUS.md` first.** It records the current phase,
branches/PRs, decisions already made, and the owner's working preferences.
Update it at the end of each phase (or whenever something important changes).

## Project
Hangout Room: a personal gift app for the owner's 11-year-old niece, and later her younger sister.
It's a cozy virtual bedroom with an original fuzzy emo bunny mascot, a fidget shelf (pop-it, squishy,
spinner), a closet for dress-up, coins and room decorating.

- The app is **one web page**: `index.html` at the repo root plus the `web/` folder (CSS and code). It runs offline in any browser.
- `android/` is a thin WebView wrapper that builds a **sideloaded APK**. It is never published.
- **Family only.** It is never sold, published to an app store, or shared beyond the family.

Her interests (use these for themes): K-pop (currently ILLIT and Hearts2Hearts), soccer, Roblox, art,
anime (Demon Slayer, Hatsune Miku, Cinnamoroll), an emo style drift (fuzzy leg warmers, arm warmers,
stripes, stars, bats), and fidget and squishy toys.

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
  - Run animation loops only while their screen is visible.
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
  - A new game or content pack gets a **new numbered file** (e.g. `16-codelab.js`) and a new `<script src>` tag
    just above `99-startup.js` (which always loads last), rather than growing an old file. Keep each file under ~40 KB.
  - Keep the numbered section banner at the top of each file. The smoke test checks every `web/js` file is loaded, in order.
- **Touch first.** Use pointer events, which also work with a mouse. Interactive canvases and boards need `touch-action:none`.
- Tap targets of 48 px or more; text at least 14 px (16 px or more for body text).

## Save data: protect her progress
- localStorage key `hangoutRoom.v1`. Shape: `DB = {version, profiles[], activeId, settings}`.
  Each profile has `name, mascotName, coins, lastDaily, seenTip, stats, look, owned[], room{wall,floor,items[]}, fid{pop,squish,spin,popShape}`,
  `artPay`, (since v1.4) `cards[], cardPins[], bonusGot[], cardNo`, and (since v1.5) `soccer{level, best{easy,medium,hard}, trophies[]}`, and (since v1.7) `stage{level, best{songId:{level:{stars,score}}}, mic}`, and (since v1.8) `easy, color, badge`, and (since v1.10) `room2{wall,floor,items[]}` (the Cozy Loft).
  `settings.stageOffset` (ms, per device) is the Stage "Sound late?" setting. `settings.pin` ('' or 4 digits) is the
  optional grown-up PIN; it belongs to the device, so `doRestore()` keeps it.
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
  - `window.AndroidBridge.saveBackup(text, fileName)` opens Android's save picker (SAF `ACTION_CREATE_DOCUMENT`).
  - `window.androidBack()` returns `true` if the web app handled Back (popup → room → profiles), otherwise the app exits.
  - The wrapper calls `save()` on pause and `toast(msg)` for messages.
- No new permissions without asking. Never add `INTERNET`.
- **Don't run Gradle builds without asking.** The owner builds and installs.

## Versions and pull requests
- Every pull request raises the minor version by one (1.0 → 1.1 → 1.2), committed on the branch before the PR:
  - `versionName` **and** `versionCode` (+1) in `android/app/build.gradle.kts`.
  - `APP_VERSION` in `web/js/01-save.js` (shown in Settings).
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
  99. `99-startup.js` (always last) Main loop + startup (`androidBack` hook)
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
- Stage: songs are generated from small text recipes in `SONGS` (scale, chords, melody, drum patterns). `buildSong(id, level)`
  turns a recipe into audio events and a fixed note chart (no randomness). Song time comes from the audio clock
  (`stSongT()`), so taps line up with what she hears. Song ids `starlight/bats/sugar` and level ids are saved: never rename them.
  3 stars on Hard gives the Golden Mic (`goldenMic`, `award:1`) once (`stage.mic`). Background music pauses during a song.
- Easy mode (per profile, `p.easy`): `applyEasy()` puts `easy` on `<body>` while that room is open; CSS under `body.easy`
  makes things bigger and hides tips. Shop grids go through `easySort()`, `poorCls()` and `priceTag()`; buying goes through
  `tryBuy`/`buyConsumable`, which switch to the short Easy buy box. New shops should use the same helpers.
- Grown-up PIN: wrap a guarded action in `askPin(fn)` (it runs `fn` straight away when no PIN is set).
  Room colours (`ROOM_COLORS`) and badges (`ROOM_BADGES`) are saved ids: never rename or remove them.
- Two rooms (since v1.10): `roomNo` (1 = `p.room`, 2 = `p.room2`), `curRoom(p)` for the room on screen and `allItems(p)` for
  both. My Stuff (items with `placed:false`) is shared between rooms; placing a stored item moves it into the room on screen.
  New code that adds or finds room items must use these, not `p.room` directly (prizes like trophies still go to `p.room`).
- Every room area is open. To add a locked area for a future feature, put it in `LOCKED` and `handleHot()`.
- `android/`: Gradle project; `app/src/main/java/com/family/hangoutroom/MainActivity.kt`; `android/README.md` has build/sideload steps.
- `PLAN.md`: roadmap. `docs/STATUS.md`: handover / current state.

## Conventions
- Coins: 1 per 10 pops, +5 per pop-it flip, 1 per 5 squishes, 1 per 25 spinner turns, +10 daily gift, 25 to start,
  +5 per new drawing (3+ strokes, first 5 a day), +10 per bonus photocard (each milestone once). Making a photocard is free.
  Soccer: +1 / +2 / +3 per goal (Easy / Medium / Hard), +1 more per goal with 2+ soccer clothes on, +5 for 5/5.
  Stage: 2 / 3 / 4 coins per star (Easy / Medium / Hard), 1–3 stars per song; no stars (and no coins) without a hit.
  Item prices are 0–40. Keep earning steady and fair.
- A new closet item = one entry in `CLOSET[cat].items` with `{id, name, price, d()}` (tops use `t()` and `s()` for sleeves).
  A new decoration = one entry in `DECOR` with `{name, price, box, d()}` (plus `flat:1` for rugs, `wall:1` for wall items).
- **A content pack** is a new numbered file (like `17-pack1.js`) that only adds entries. New SVG patterns go in
  `EXTRA_DEFS` (added by `buildDefs`). New clothes should get photocard tags in `CARD_TAGS`. Give pack helpers a unique
  prefix (`p1Bat`, `p1Line`): all files share one global scope, so a repeated name stops the file from loading.
  Pop-it shapes are `POP_SHAPES` entries with a 100×100 outline `path`; owned as `popshape:<id>`.
- Use the existing palette (`:root` CSS variables; pink `#ff8cc6`, purple `#a97cff`, mint `#8ff0d0`, gold `#ffd166`, dark `#231b2e`).
