# Status / handover

_Last updated: 2026-11-15_

## Where we are
- **Phase 0 (v1 base): done.** **Phase 1 (ship to the tablet): done** (v1.2 merged).
- **Phase 2 (Art Desk): done** (v1.3 merged). Checked on an Android phone: it works, and drawings survive closing the app.
- **Phase 3 (Photocard Wall): done** (v1.4 merged). The owner checked it on the device: all checks passed (2026-11-15).
- **Phase 4 (Soccer Field): built, PR open as v1.5** on branch `feature/soccer`. Not yet tried on a device.
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
- PR "Soccer Field (v1.5)" on branch `feature/soccer` (branched from `main` after #4): open.
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
- **Soccer Field (v1.5)**: `tests/smoke-test.js` now has 91 checks, all passing with no console errors. New checks
  (the keeper's guess is fixed in the test so results are repeatable):
  - the window opens the Soccer screen on Easy with Mochi; a goal pays +1 coin; a keeper save; a wide shot
  - tapping a spot in the goal shoots there; a real swipe kicks the ball in the swiped direction
  - the match ends after 5 kicks with the result box; best score saved; "First Goal!" bonus card
  - team kit badge and +1 kit coin; Medium shows Boo, Hard shows Flap; a perfect 5/5 on Hard pays 5×3 + 5
    (+10 for the "Perfect 5/5" bonus card)
  - Back goes to the room; restoring a v1.4 backup (no soccer fields) and a v1.5 one; phone portrait and landscape

## Decisions made
- Main idea: the "hangout room" (chosen because it can grow, and the younger sister can have her own profile).
- One self-contained `index.html` (works offline, no server) plus a WebView APK wrapper. The same code serves both.
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

## Owner's working preferences
- Personal gift for family; practice project. Never for sale or public sharing.
- $0 beyond the Claude subscription. Use free tiers and free tools only.
- Original characters/music *inspired by* her interests (no real idols, anime or game characters).
- Same working style as the owner's other projects: feature branches + PRs, the owner merges,
  plan before big changes, ask before heavy builds, docs written in plain language.
- Tools: VS Code for the repo, Android Studio for building `android/`. Windows PC, Android devices.

## Third-party assets
- None. All art, sounds and music are generated by code in `index.html`.

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
1. Owner: build v1.5, install it **over** the app, and play the Soccer Field (see the PR for what to check).
2. Check that it runs smoothly on her tablet, and that soccer progress survives closing the app.
3. Merge the v1.5 PR.
4. Plan Phase 5 (Stage rhythm game) and get it agreed before coding.

## How versions and save upgrades work (since v1.2)
- `APP_VERSION` (top of the script in `index.html`) is the app version shown in Settings. It must match
  `versionName` in `android/app/build.gradle.kts`. Both go up with every PR.
- `DB_VERSION` is the version of the save-data *shape*, and is separate from the app version. It is 4 since v1.5
  (Soccer: `soccer`, `stats.goals/kicks/matches/perfects`). It was 3 in v1.4
  (Photocards: `cards`, `cardPins`, `bonusGot`, `cardNo`, `stats.cards`). It was 2 in v1.3
  (Art Desk: `stats.drawings`, `artPay`, poster room items).
  Bump it only when the save shape changes, and add a step to `MIGRATIONS` that upgrades the previous version.
- `fixDB()` runs on the saved data when the app starts **and** on restored backups, then `normalize()` fills in
  per-profile defaults. So old saves and old backups always get upgraded the same way.
- A backup from a newer app still restores on an older app. Unknown fields are kept, not deleted.

## Open questions for the owner
- Her device model and screen size (to tune layouts).
- ~~Should backups include drawings?~~ Yes, with a switch (decided 2026-11-15).
