# CLAUDE.md

Guidance for Claude Code in this repo. The full build plan and roadmap are in `PLAN.md`.

**Starting a new conversation? Read `docs/STATUS.md` first.** It records the current phase,
branches/PRs, decisions already made, and the owner's working preferences.
Update it at the end of each phase (or whenever something important changes).

## Project
Hangout Room: a personal gift app for the owner's 11-year-old niece, and later her younger sister.
It's a cozy virtual bedroom with an original fuzzy emo bunny mascot, a fidget shelf (pop-it, squishy,
spinner), a closet for dress-up, coins and room decorating.

- The app is **one self-contained web page**, `index.html` at the repo root. It runs offline in any browser.
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
- `index.html` (repo root) is the **single source of truth**. The Android build copies it into the APK
  (`CopyWebApp` task in `android/app/build.gradle.kts`). Never edit or commit a copy inside `android/`.
- **It must run from `file://` with no server:**
  - Classic `<script>` only: no ES modules, no `import`.
  - No `fetch()`/XHR of local files, no CDNs, no downloaded web fonts.
  - No npm/build step needed to run it.
- If `index.html` grows past ~250 KB, plan a split into a `web/` folder (plain `<script src>` / `<link>`)
  and update `CopyWebApp` to copy the folder. Plan first.
- Keep the numbered section banners in `index.html` (see Layout) and put new code in the right section.
- **Touch first.** Use pointer events, which also work with a mouse. Interactive canvases and boards need `touch-action:none`.
- Tap targets of 48 px or more; text at least 14 px (16 px or more for body text).

## Save data: protect her progress
- localStorage key `hangoutRoom.v1`. Shape: `DB = {version, profiles[], activeId, settings}`.
  Each profile has `name, mascotName, coins, lastDaily, seenTip, stats, look, owned[], room{wall,floor,items[]}, fid{pop,squish,spin}`,
  `artPay`, (since v1.4) `cards[], cardPins[], bonusGot[], cardNo`, and (since v1.5) `soccer{level, best{easy,medium,hard}}`.
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
  - `APP_VERSION` in `index.html` (added in Phase 1; shown in Settings).
- Put the version in the PR title, for example "Art Desk (v1.2)".
- When several PRs are open, each takes the next number after the highest already used on any branch.
- The PR description says what to try on the tablet.

## Testing
- **Quick check:** open `index.html` in desktop Chrome and use DevTools device mode (tablet and phone sizes, touch).
- **Automated smoke test:** `node tests/smoke-test.js` (Node 22+ and an installed Chrome or Edge; nothing to install).
  It loads the page in a headless browser with a throwaway profile, makes a test room, opens every screen,
  exercises the Art Desk, Photocards, Soccer and backup/restore, fails on any console error, and saves screenshots to `tests/shots/` (ignored by git).
  Run it before every PR, and extend it when you add a feature. Use invented names only.
- **On the device:** the owner builds the APK in Android Studio and sideloads it.

## Layout
- `index.html`, sections in order:
  1. Helpers + save data (`DB`, `save`, `saveSoon`, `P()`)
  2. Art helpers (`st`, `starPath`, `heartPath`, `buildDefs` shared patterns and `#fuzz`/`#glow` filters)
  3. Mascot + closet items (`FUR`, `CLOSET` by category, `mascotSVG`; mascot box is 200×270)
  4. Room (`WALLS`, `FLOORS`, `DECOR` drawn bottom-centre at 0,0; `furniture()` hotspots; room box is 1000×700)
  5. Fidget data (`POP_THEMES`, `SQUISHIES`, `SPINS`)
  6. Profiles (`newProfile`, `normalize`)
  7. Sound (`SFX`, generated music, spinner hum)
  8. UI basics (`toast`, `modal`, `earn`, `tryBuy`, `buyConsumable`)
  9. Screens (profiles, room + decorate, settings/backup, closet)
  10. Fidget shelf (pop-it, squishy physics, spinner physics)
  11. Art Desk (drawing pad, stamps, gallery, posters)
  12. Photocard Wall (`STAGES`, `FRAMES`, `CARD_TAGS`, `BONUS`, `cardSVG`, card maker, binder, pins)
  13. Soccer Field (`KEEPERS` by level, `socShoot`, `resolveShot`, `drawSoccer`, `drawKeeper`)
  14. Main loop + startup (`androidBack` hook)
- Drawings live in IndexedDB (`hangoutRoomArt`, through `ArtStore` in section 1), with a localStorage fallback
  (`hangoutRoom.art`). A poster is a room item `{type:'poster', art:<drawing id>}`. Backups carry drawings in an `artwork` list.
- A photocard is a small recipe `{id, no, at, look, stage, frame, title, name, s, bonus?}` in `profile.cards`, drawn by `cardSVG()`.
  Stage, frame and bonus ids are saved (`owned` uses `stage:id` / `frame:id`): never rename them. Small cards are drawn
  with `flat` (no `#fuzz` filter).
- Soccer: one canvas drawn by the main loop only while `cur==='soccer'`. Goal coordinates are `u` (-0.5..0.5 across)
  and `v` (0..1 up). Each level has its own original keeper: Easy = Mochi (cat), Medium = Boo (ghost), Hard = Flap (bat).
  Level ids `easy/medium/hard` are saved: never rename them.
- Every room area is open. To add a locked area for a future feature, put it in `LOCKED` and `handleHot()`.
- `android/`: Gradle project; `app/src/main/java/com/family/hangoutroom/MainActivity.kt`; `android/README.md` has build/sideload steps.
- `PLAN.md`: roadmap. `docs/STATUS.md`: handover / current state.

## Conventions
- Coins: 1 per 10 pops, +5 per pop-it flip, 1 per 5 squishes, 1 per 25 spinner turns, +10 daily gift, 25 to start,
  +5 per new drawing (3+ strokes, first 5 a day), +10 per bonus photocard (each milestone once). Making a photocard is free.
  Soccer: +1 / +2 / +3 per goal (Easy / Medium / Hard), +1 more per goal with 2+ soccer clothes on, +5 for 5/5.
  Item prices are 0–40. Keep earning steady and fair.
- A new closet item = one entry in `CLOSET[cat].items` with `{id, name, price, d()}` (tops use `t()` and `s()` for sleeves).
  A new decoration = one entry in `DECOR` with `{name, price, box, d()}` (plus `flat:1` for rugs, `wall:1` for wall items).
- Use the existing palette (`:root` CSS variables; pink `#ff8cc6`, purple `#a97cff`, mint `#8ff0d0`, gold `#ffd166`, dark `#231b2e`).
