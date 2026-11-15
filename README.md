# HangoutRoom
Mini game app for niblings: a cozy virtual bedroom with a fuzzy emo bunny, fidget toys,
dress-up, decorating, an Art Desk for drawing, a Photocard Wall for making collectible bunny cards
a Soccer Field for penalty kicks, and a Stage where the bunny performs to original songs (tap to the beat).
A family gift; not for sale or public sharing.

## Try it on a computer
Double-click `index.html` (or open it in Chrome). It works offline, with nothing to install.

## Put it on an Android tablet or phone
See `android/README.md`. In short: open the `android` folder in Android Studio, build the APK, copy it to the device and tap to install.

## Which version is this?
In the app: ⚙️ Settings. The version is shown at the bottom (for example "version 1.7").

## Keep progress safe
In the app: ⚙️ Settings → Backup & Restore. Update the Android app by installing over it. Never uninstall first.
Backups from older versions always still restore.
Since version 1.3 a backup also holds the drawings from the Art Desk (you can switch that off in the backup screen
to make the file smaller). Restoring an older backup without drawings leaves the drawings on the device alone.
Photocards (since version 1.4) are always in the backup. They are tiny, because each card is saved as a
short description (outfit, stage, frame, title) instead of a picture.
Soccer and Stage progress (best scores, trophies, the Golden Mic) are in the backup too.

## Stage timing
If the notes on the Stage seem to arrive before you hear the beat (this can happen with Bluetooth speakers or slow tablets),
open the Stage and press + next to "⏱️ Sound late?" a few times. Each press waits 20 ms longer. It is saved on that device.

## For whoever works on it next
- `CLAUDE.md`: project rules (for Claude Code and people).
- `PLAN.md`: layout and roadmap.
- `docs/STATUS.md`: where things stand right now.
- `tests/smoke-test.js`: an automatic check of the whole app. With Node.js and Chrome installed, run
  `node tests/smoke-test.js` in the repo folder. It prints "ok" or "FAIL" for each check and saves screenshots in `tests/shots/`.
