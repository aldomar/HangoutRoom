# Hangout Room on iPad and iPhone (since version 1.59)

iPads and iPhones can't install the Android app. Instead, the Hangout Room is put on a free web address
(GitHub Pages) and added to the Home Screen. After that it opens like an app, full screen with the bunny
icon, and **works without internet**. It costs nothing, and you don't need a Mac or an Apple developer account.

## 1. Turn on GitHub Pages (once, on a computer)
1. On GitHub, open the **HangoutRoom** repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, pick **Deploy from a branch**, then branch **main** and folder **/ (root)**. Click **Save**.
4. Wait a minute or two. The page shows the address, which will be:
   `https://aldomar.github.io/HangoutRoom/`

Every time a pull request is merged into `main`, GitHub updates the address by itself (it takes a minute or two).

## 2. Put it on each iPad or iPhone (once per device)
1. Open the address in **Safari** (not Chrome; only Safari can add it to the Home Screen as an app).
2. Wait until the room picker shows, so the whole app is saved on the device.
3. Tap **Share** (the square with an arrow), then **Add to Home Screen**, then **Add**.
4. From now on, **only use the Home Screen icon.**

That's it. The device can now go offline: the app keeps working.

## Things to know
- **Each device keeps its own rooms.** Nothing is sent anywhere. Saves stay on the iPad or iPhone, like on the Android tablet.
- **Use only the icon, not Safari.** On the same device, the Safari tab and the Home Screen icon keep *separate* rooms.
  If a child plays once in Safari and then in the icon, their room may look "gone". It's still there, in Safari.
  To move it, use Backup in Safari and Restore in the icon.
- **Deleting the icon deletes its rooms** (like uninstalling the Android app). Make a backup first.
- **Updates come by themselves.** When the device is online, a new version is fetched quietly in the background and
  shows the next time the app is opened. The ✨ What's New box then says what changed. There are no pop-ups.
- **The address isn't secret**, but nobody is told about it, search engines are asked not to list it, and the page
  holds no personal data (rooms and drawings stay on each device).

## Backup and Restore on iPad and iPhone
- **⚙️ Settings → 💾 Backup → Save file** opens the iPad/iPhone share sheet. Tap **Save to Files** and pick a folder
  (for example iCloud Drive or On My iPad). **Copy code** also works: paste the code into Notes.
- **Restore…** lets you pick that file from Files, or paste the code.
- A backup made on the Android tablet restores on an iPad or iPhone, and the other way around.

## What works differently on iPad and iPhone
- **📷 Save picture:** the picture opens big. Press and hold it, then tap **Save to Photos**.
- **🔊 Read to me** uses the voice built into the device (it never goes online). Look for it in ⚙️ Settings.
- **🔮 Marble maze tilt:** tap **📱 Tilt** once and allow motion. A finger on the board always works too.
- **📳 Buzz:** iPhones give a tiny tap when you pop, kick or squish (iOS 18 or newer). iPads have no buzzer, so
  they don't buzz at all; the sounds and squish animations give the feel instead.
- **Sound with the device muted:** the app's sounds play like a game's. Use the volume buttons, or turn sound off in ⚙️ Settings.

## If something looks wrong
- **It shows an old version:** open the app once while online, close it fully (swipe it away), then open it again.
- **"Safari can't open the page":** the first visit needs internet. After the first visit it works offline.
- **The icon is plain or blank:** remove it, open the address in Safari again, wait for the room picker, then add it again.
  (Make a backup first if a child already played in it.)

## For whoever works on it next
- `sw.js` (next to `index.html`) is the service worker: it saves every app file on the device so the app works offline.
  Its `FILES` list must name every file the page loads, and its `VERSION` must match `APP_VERSION`. The smoke test
  checks both. It only runs on the hosted `https` copy; opening `index.html` from the disk and the Android APK never use it.
- `manifest.webmanifest` and `web/icon-180.png` give the Home Screen name and icon. `node tools/make-icons.js` draws
  the icon again from the buddy drawing.
- The iPad/iPhone code is `web/js/58-ios.js`. It is all feature-detected, so other devices act exactly as before.
- `web/about-local.js` is git-ignored, so it is **not** on GitHub Pages: the hosted app uses the words in
  `ABOUT_DEFAULT` (`web/js/25-about.js`).
