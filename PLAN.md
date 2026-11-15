# Hangout Room: project plan

## What it is
A personal gift: a customizable virtual bedroom for an 11-year-old who loves K-pop, soccer, Roblox,
art, anime, fidget/squishy toys and a cute emo style. Her younger sister can have her own room later.
Everything is original (no real idols, characters or logos) and nothing costs money.

## Goals
1. Fun every day: quick fidget play, dress-up and decorating, with steady coin rewards.
2. Grows over time: locked areas in the room open as new "updates".
3. Safe and private: offline, no accounts, chat, ads or tracking.
4. Easy for the owner to maintain: one web file plus a tiny Android wrapper, built with free tools.

## Constraints
- **$0:** free tools only (VS Code, Android Studio, GitHub free, Chrome). Claude subscription is the only cost.
- **Offline, no server.** It runs from `file://` in a browser or inside the APK's WebView.
- **Sideloaded APK.** No app stores.
- **Original art and sound only**, all made in code.

## How it fits together
```
HangoutRoom/                      (VS Code: the whole repo)
├── index.html                    the app; the only copy you edit
├── CLAUDE.md                     rules for Claude Code
├── PLAN.md                       this file
├── README.md                     what it is + how to open/install
├── docs/STATUS.md                handover: where we are, decisions, next steps
└── android/                      (Android Studio: open this folder only)
    ├── README.md                 build + sideload steps
    ├── build.gradle.kts, settings.gradle.kts, gradle/…
    └── app/
        ├── build.gradle.kts      CopyWebApp task pulls ../../index.html into the APK
        └── src/main/
            ├── AndroidManifest.xml   no INTERNET permission
            ├── java/…/MainActivity.kt  full-screen WebView, back button, backup save/restore
            └── res/                   bunny app icon, theme, strings
```
Saves live in the browser's/WebView's localStorage (`hangoutRoom.v1`). Settings → Backup gives a code or
file that moves rooms between the browser and the APK, or between devices.

## Roadmap
Each phase is its own branch and PR, and ends with an APK the owner installs over the old one.

### ✅ Phase 0: v1 base (done)
- Profiles (up to 6), daily gift, coins.
- Room hub with mascot, open areas (Fidget Shelf, Closet) and locked areas (Soccer window, Photocard wall, Art desk).
- Fidget Shelf: pop-it (swipe-pop, flip bonus), slow-rise squishy, flick spinner (speed record). Unlockable designs.
- Closet: 8 categories, ~45 items, "Surprise me", bunny naming.
- Decorate: 15 decorations, 5 walls, 5 floors; drag to place, drop in the panel to store.
- Sounds + optional music (generated), Backup & Restore.
- Android WebView wrapper (written; first build pending, see STATUS).

### Phase 1: Ship v1 to the tablet (finishing)
- ✅ Commit v1 (v1.0 is on `main`; v1.1 cleans up stray Android Studio files).
- ✅ First Gradle sync/build in Android Studio and sideload. Built with no errors; saves and Back checked on the device.
  Keep an eye out for layout on her screen size, touch feel, audio and the speed of the fuzzy filter.
- ✅ `APP_VERSION` and an "About" line in Settings (v1.2). Save-data upgrade hook (`fixDB()` + `MIGRATIONS`),
  used for both loading and restoring.
- ✅ A free automated smoke test: `tests/smoke-test.js` (added in v1.3). It drives the installed Chrome directly,
  with nothing to install.
- **Done when:** the APK installs, saves survive closing the app and installing an update, and Back works as described.

### ✅ Phase 2: Art Desk 🎨 (v1.3)
- ✅ Drawing pad: pen, marker, glitter, neon, eraser, stamps (star, heart, bat, ghost, moon, soccer ball).
- ✅ 12 colours plus rainbow, 3 brush sizes, 3 paper colours, undo (12 steps), clear (can be undone).
- ✅ Gallery saved in IndexedDB. +5 coins for each new drawing with 3 or more strokes, for the first 5 drawings a day.
- ✅ "Hang in room" turns a drawing into a framed poster (up to 4). Deleting a drawing takes its poster down.
- ✅ An unsaved drawing is kept as a draft when the app goes into the background, and comes back next time.
- ✅ Backups include drawings (a switch in the backup screen, on by default). Older backups still restore.
- **Done when:** drawings survive restarts, app updates and backups. ✅ Checked on an Android phone:
  drawings survive closing the app (IndexedDB works inside the WebView).

### ✅ Phase 3: Photocard Wall 📸 (v1.4)
- ✅ Card maker: tap 📸 Snap! to take a card of the bunny in today's outfit. Pick a stage (Spotlight, Starry Night,
  Candy Clouds free; Soccer Pitch 10, Neon Hearts 15, Spooky Moon 20), a frame (Sparkle, Hearts, Stars free;
  Emo Stripes 10, Bats 15, Gold 25) and a title from a list. The name on the card can be changed.
- ✅ Making cards is free and pays no coins. Up to 60 cards per room.
- ✅ Card stats (Cute / Spooky / Sporty, 1–5 stars) come from the outfit, so the same outfit always gets the same stats.
- ✅ Binder with pages of 6 cards (newest first). Tap a card to pin it, unpin it or delete it.
- ✅ Up to 3 cards pinned on the corkboard in the room. Pinning a 4th puts the oldest pin back in the binder.
- ✅ 8 gold "holo" bonus cards for milestones (first flip, 1,000 pops, 100 squishes, 500 RPM spin, first drawing,
  10 drawings, 10 closet items, 10 cards made). Each comes with +10 coins and is given only once. Milestones
  reached before v1.4 are given the first time she opens the room.
- ✅ Cards are saved as small recipes in the normal save, so they are in every backup. Old backups still restore.
- **Done when:** cards survive restarts, app updates and backups. ✅ Checked on the device.

### ✅ Phase 4: Soccer Field ⚽ (v1.5, the window)
- ✅ Penalty kicks, 5 per match. Swipe up from the ball to shoot (direction = aim, speed = power and height,
  a bent swipe curves the ball), or just tap a spot in the goal for an easy shot.
- ✅ Three levels, all open, each with its own original keeper: Easy = Mochi the sleepy cat, Medium = Boo the ghost,
  Hard = Flap the bat. Harder keepers react faster, reach further and guess better.
- ✅ Coins: +1 / +2 / +3 per goal (Easy / Medium / Hard), +5 for a perfect 5/5. Team kit bonus: +1 more per goal
  with 2 or more soccer clothes on (jersey, shorts, soccer socks, cleats).
- ✅ Best score per level. 3 new bonus photocards: First Goal!, Perfect 5/5, 50 Goals.
- ✅ Trophies: a perfect 5/5 wins a Bronze (Easy), Silver (Medium) or Gold (Hard) trophy, once each.
  It appears in her room as a decoration she can move or put away. Trophies are never sold in the Shop.
- ✅ No timer and nothing to lose: a miss just counts as a miss. Leaving mid-match is fine.
- **Done when:** it plays smoothly on her tablet and soccer progress survives updates and backups.

### Phase 5: Stage 🎤
- Tap-to-the-beat rhythm game with original generated songs. The mascot performs in the current outfit.
- Rewards: coins and special photocards.

### Phase 6: Little-sister polish
- "Easy mode" per profile: bigger buttons, fewer words, simpler shop.
- Profile picture or colour choice. An optional grown-up PIN for delete/restore.

### Phase 7: Content packs (ongoing)
- More closet items, decorations, squishies and pop-it shapes (heart, star).
- New fidgets: slime stretcher, fidget-cube clicker, tilt marble maze (device tilt works in WebView).
- Seasonal decorations, a sticker book of achievements, a pet for the mascot.

## Ideas backlog (not scheduled)
- Mascot emotes/dances, outfit save slots ("looks"), and room themes saved as presets.
- Night mode for the room (lights on/off with the lamps glowing).
- Bigger rooms or a second room.
- Gift room items between the sisters' profiles on the same device (no network).

## Risks and how we handle them
| Risk | Plan |
| --- | --- |
| Lost progress (uninstall, new device) | Update in place, keep the debug keystore safe, use Backup before big updates |
| `index.html` gets too big to manage | Split into `web/` with plain script tags once it passes ~250 KB (plan first) |
| Slow on an older tablet | Limit fuzz filters/animations, test on the real device every phase |
| Android tooling changes | Versions pinned in `android/`. Upgrade only when Android Studio requires it, using its Upgrade Assistant |
| Copyright slips | Original-only rule in CLAUDE.md. Review new art against it in every PR |
