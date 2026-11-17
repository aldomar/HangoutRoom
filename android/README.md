# Hangout Room - Android wrapper

A tiny Android app that shows `../index.html` full-screen and offline.
The web app at the repo root (`index.html` plus the `web/` folder) is the only copy you edit;
both are copied into the APK on every build.

## Build the APK
1. Android Studio -> **File > Open** -> pick this `android` folder (not the repo root).
2. Let Gradle sync. If it asks to install SDK Platform 36 / Build Tools, click to install.
   If it says the plugin needs a newer Android Studio, update Android Studio (free).
3. **Build > Build App Bundle(s) / APK(s) > Build APK(s)**.
4. The APK is at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Install on the tablet / phone (sideload)
- Copy `app-debug.apk` to the device (USB, Google Drive, etc.) and tap it.
  Allow "Install unknown apps" for the app you opened it from when asked.
- Or plug in with USB debugging on and press the green Run button in Android Studio.

## Updating later
1. Edit `../index.html` or the files in `../web/` (test in a browser first).
2. In `app/build.gradle.kts`, bump `versionCode` (1 -> 2 -> 3 ...) and `versionName`.
3. Build again and install over the old app. **Don't uninstall first** - uninstalling deletes her saves.

Updates only install over the old app if they are signed with the same key. Debug builds use
a key stored on this computer (`%USERPROFILE%\.android\debug.keystore`), so build updates on this
same computer or keep a copy of that file. Use the in-app **Settings > Backup** before big updates anyway.

## The personal About words (since version 1.22)
The letter and nicknames in **⚙️ Settings > 💌 About** come from `../web/about-local.js`. That file is kept off GitHub
(it is git-ignored), but the build copies the whole `web/` folder, so an APK built on this computer includes it.
An APK built from a fresh copy of the repo (without the file) shows a generic About instead. Keep a copy of
`about-local.js` somewhere safe, next to the debug key.

## What the wrapper does
- No internet permission: the app can't go online.
- Saves use the WebView's localStorage (kept with the app's data).
- Android back button: closes popups, then goes Room -> Profiles, then exits.
- Settings > Backup > "Save file" opens Android's save picker; "Restore" can pick that file.
  Once the file is really saved, the app notes the time (Settings shows "Last backup: …", since version 1.30).
- 📷 Pictures (since version 1.30): the 📷 button in a room, or "📷 Save picture" on a photocard, opens the same kind of
  save picker for a PNG picture.
- 🔊 Read to me (since version 1.30): buttons can say their names using the tablet's own text-to-speech voice
  (Android's built-in `TextToSpeech`). It needs no permission and no internet. The manifest has a `<queries>` entry
  for the speech engine, which Android 11 and newer need so the app can find it; it is **not** a permission.
  If nothing is heard, check the tablet's Settings → Accessibility → Text-to-speech output (a voice must be installed).
