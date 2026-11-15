# HangoutRoom
Mini game app for niblings: a cozy virtual bedroom with a fuzzy emo bunny, fidget toys,
dress-up, decorating, an Art Desk for drawing, a Photocard Wall for making collectible bunny cards
a Soccer Field for penalty kicks, a Stage where the bunny performs to original songs (tap to the beat),
and a Code Lab where she "programs" the bunny with arrow blocks (a first taste of coding).
A family gift; not for sale or public sharing.

## Try it on a computer
Double-click `index.html` (or open it in Chrome). It works offline, with nothing to install.
Since version 1.9 the app is `index.html` **plus the `web` folder** next to it. If you copy it somewhere, copy both.

## Put it on an Android tablet or phone
See `android/README.md`. In short: open the `android` folder in Android Studio, build the APK, copy it to the device and tap to install.

## Which version is this?
In the app: ⚙️ Settings. The version is shown at the bottom (for example "version 1.8").

## Keep progress safe
In the app: ⚙️ Settings → Backup & Restore. Update the Android app by installing over it. Never uninstall first.
Backups from older versions always still restore.
Since version 1.3 a backup also holds the drawings from the Art Desk (you can switch that off in the backup screen
to make the file smaller). Restoring an older backup without drawings leaves the drawings on the device alone.
Photocards (since version 1.4) are always in the backup. They are tiny, because each card is saved as a
short description (outfit, stage, frame, title) instead of a picture.
Soccer, Stage and Code Lab progress (best scores, trophies, the Golden Mic, puzzles solved) are in the backup too.

## The Cozy Loft (since version 1.10)
Every room has a second room upstairs: tap **🪜 Loft** at the top of the room screen (and **🏠 Room** to go back).
The Loft has its own wall, floor and decorations. Things put away in **My Stuff** (🛋️ Decorate) can be placed
in either room.

## Where things are
In her room: the window (⚽ Soccer), the corkboard (📸 Photocards), the shelf (🫧 Fidget Shelf), the desk
(🎨 Art Desk) and the wardrobe (👗 Closet). In the Cozy Loft: the glowing **🎤 Stage** sign (since version 1.12)
and the computer desk (**💻 Code Lab**, since version 1.13).
The pink labels only show in Easy mode; otherwise, tap things to find out what they do.

## Code Lab (since version 1.13)
Tap the computer desk in the Cozy Loft. Pick a puzzle, then tap arrow blocks to make a "program" for Fuzzy,
and press **▶️ Run**. Fuzzy follows the blocks one at a time (the block that is running lights up) to reach the carrot 🥕.
- **Easy:** arrows only. **Medium:** adds 🔁 repeat blocks (🔁 ×3 then ➡️ = go right 3 times), and only a few blocks fit,
  so she has to use them. **Hard:** adds toy blocks in the way and ⭐ stars to pick up with the 🌟 block.
- If Fuzzy bumps into something, the block that went wrong glows yellow. Nothing is lost: tap a block to take it out,
  fix the program and run it again. There is no timer.
- Each puzzle pays 3 coins the first time it is solved, plus 5 more for finishing a whole level.

## Shelves and hair (since version 1.11)
- **Shelves:** buy a Little or Long Shelf in the Shop and hang it on the wall. Drag a small thing onto the shelf and it
  sits on top. Move the shelf and everything on it comes along.
- **Hair:** in the Closet's Hair tab, pick a style, then tap a colour circle above. A colour is bought once and works
  with every style.

## For a younger child (since version 1.8)
- **Easy mode:** open her room, then ⚙️ Settings → 🐣 Easy mode. Buttons get bigger, tips are hidden, the room shows labels,
  shops show the cheapest things first (too-dear things are dimmed with a 🔒), and the games start on Easy.
  It is set for each room separately, so the older sister's room stays as it is.
- **Room colour and badge:** each room has a colour and a little picture (🐰⭐💜🦇⚽🎤🎨☁️) on the first screen.
  Change them with ✏️ under the room.
- **Grown-up PIN (optional):** ⚙️ Settings → 🔒 Grown-up PIN. When it is on, making, changing or deleting a room and
  restoring a backup ask for the 4-digit PIN. If you forget it, tap "Forgot PIN?" and answer the sum
  (a calculator helps). The PIN belongs to the device and is not changed by restoring a backup.

## Stage timing
If the notes on the Stage seem to arrive before you hear the beat (this can happen with Bluetooth speakers or slow tablets),
open the Stage and press + next to "⏱️ Sound late?" a few times. Each press waits 20 ms longer. It is saved on that device.

## For whoever works on it next
- `CLAUDE.md`: project rules (for Claude Code and people).
- `PLAN.md`: layout and roadmap.
- `docs/STATUS.md`: where things stand right now.
- `index.html` is the page; `web/app.css` is the look; `web/js/` is the code, one numbered file per part of the app
  (for example `13-soccer.js`). They load in number order.
- `tests/smoke-test.js`: an automatic check of the whole app. With Node.js and Chrome installed, run
  `node tests/smoke-test.js` in the repo folder. It prints "ok" or "FAIL" for each check and saves screenshots in `tests/shots/`.
