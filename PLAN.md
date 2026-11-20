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

### ✅ Squishy upgrade (v1.6, between phases 4 and 5)
- ✅ Press anywhere on the squishy, not just the edge: a soft dent forms under each finger and gets deeper the longer
  she holds. The toy flattens and bulges around it, and the dent follows her finger (kneading).
- ✅ Two or more fingers at once. Squeezing the sides makes it narrower and taller; pressing the top makes it flatter
  and wider. A quick poke jiggles; a long squeeze leaves a dent that slowly rises back.
- ✅ The face watches her finger, scrunches up when squeezed, and blushes more when its cheeks are squished.
- ✅ Same coins as before (1 per 5 squishes), counted once per squeeze even with several fingers.

### ✅ Phase 5: Stage 🎤 (v1.7, the glowing sign above the closet; in the Cozy Loft since v1.12)
- ✅ Tap-to-the-beat rhythm game. Notes (hearts, stars, bats) fall from the stage toward glowing pads; tap a pad as
  its note arrives. Ratings: Perfect / Great / Good / Oops. The bunny dances to the beat in today's outfit.
- ✅ 3 original songs made with code (about a minute each): Starlight Pop (bright, 120 BPM), Midnight Bats
  (spooky-cute, 100 BPM), Sugar Clouds (soft and dreamy, 88 BPM). The notes are the same every time, so she can learn them.
- ✅ Three levels, all open: Easy = 1 pad (tap anywhere, good for her little sister), Medium = 2 pads, Hard = 3 pads.
- ✅ You can't fail: the song always plays to the end, and a tap between notes costs nothing. Leaving mid-song is fine.
- ✅ 1–3 stars per song (1 for taking part, 2 at 60%, 3 at 85% of the best score). Coins: 2 / 3 / 4 per star
  (Easy / Medium / Hard). Best stars and score per song and level.
- ✅ 4 new bonus photocards: First Show!, Full Combo, Encore! (all 3 songs), Superstar (3 stars on Hard).
  A new free photocard stage: Concert.
- ✅ Golden Mic: 3 stars on Hard (any song) puts a Golden Mic in her room, once. Never sold in the Shop.
- ✅ "⏱️ Sound late?" setting on the Stage for speakers that lag (saved per device).
- **Done when:** it plays in time on her tablet and stage progress survives updates and backups.

### ✅ Phase 6: Little-sister polish (v1.8)
- ✅ "Easy mode" per room (⚙️ Settings → 🐣 Easy mode): bigger buttons, tabs and tiles; no tip lines or long
  descriptions; Soccer and the Stage open on Easy (the other levels still work).
- ✅ Simpler shops in Easy mode: things she owns come first, then the cheapest first. Things she can't afford yet
  are dimmed with a 🔒 and tapping one says "Need 5 more 🪙". The buy box is just the price with ✔ Yes / ✖ No.
- ✅ Each room has a colour (6 to pick from) and a badge (🐰⭐💜🦇⚽🎤🎨☁️) on the profile screen, so a child who
  can't read yet can find her own room. Picked when making a room, changed with ✏️.
- ✅ Optional grown-up PIN (⚙️ Settings → 🔒 Grown-up PIN). When it is on, making, changing or deleting a room and
  restoring a backup ask for it. Easy mode does not. "Forgot PIN?" removes it after a grown-up multiplication sum.
  The PIN stays with the device: restoring a backup never changes it.
- **Done when:** the younger sister can find her room and play on her own, and old saves and backups still load.

### ✅ Phase 7: Content packs (v1.9–v1.21, done)
Order agreed 2026-11-15: **1)** split the code into files (v1.9), **2)** a content pack with a second room (v1.10),
**3)** Code Lab. Each gets its own plan, agreed before building.

- ✅ **Code split (v1.9), agreed 2026-11-15:** `index.html` stays at the repo root (page shell and screen markup).
  The CSS moves to `web/app.css` and the code to `web/js/`, one file per numbered section
  (`01-save.js` … `14-stage.js`, and `99-startup.js` last), loaded in order with plain `<script src>`. It still runs from `file://` with no server
  and no build step. New games and packs get their own numbered files. The Android build copies `index.html` and `web/`.
  Nothing changes for her: same app, same saves.
- ✅ **A second room** (moved up from the ideas backlog by the owner): the Cozy Loft, in v1.10.
- ✅ **Cozy Loft + Content Pack 1 (v1.10):** a free second room (🪜 Loft button) with its own wall, floor and decorations,
  shared My Stuff, and a computer desk ready for Code Lab. Pack 1: 8 clothes, 8 decorations, 2 walls + the free Attic wall,
  2 floors, the Ghosty squishy, the Batwing spinner, and heart / star pop-it boards.
- ✅ **Shelves + Hair Styles (v1.11, the owner's request):** Little and Long wall shelves (things snap onto them and
  move with them). Hair is now a style plus a colour bought once: Emo Swoop, Short Bob, Pigtails, Long Waves, Emo Spikes
  and Starry Twin Tails, in 10 colours.
- ✅ **Stage in the Loft (v1.12, the owner's request):** the Stage marquee moved up to the Loft to give her first room
  more space. The pink room labels now only show in Easy mode, so an older child finds things by exploring.
- More closet items, decorations and squishies: Content Pack 2 (v1.21); more packs are in Phase 11.
- ✅ **New fidgets (v1.16):** three more Fidget Shelf tabs. 🧪 Slime (pull to stretch, snaps back, pokes leave a dent;
  1 coin per 5 stretches), 🎛️ Clicker cube (buttons, switch, roller, joystick, spinning ball; 1 coin per 25 clicks) and
  🔮 Marble Maze (tilt the tablet or hold a finger; 6 mazes, +3 each the first time, +1 replay, +5 for all 6).
  Each has a free design and 3 to buy (10–20). Save version 10 (`maze.solved`).
- ✅ **Seasonal decorations, a sticker book of achievements, a pet for the mascot** (plan agreed 2026-11-16, three PRs):
  - ✅ **Seasons (v1.17):** a 🍂 Seasons tab in Decorate with 16 decorations and 4 walls (4 + 1 per season), all buyable
    all year, the current season first ("✨ In season!"). Her room's window and the Loft's window show the season.
  - ✅ **Sticker Book (v1.18):** a 📒 button in the room. 45 stickers on 6 themed pages, for fixed milestones in every
    game (many in steps, like 100 → 1,000 → 5,000 pops). +2 coins each, given once; ones already earned arrive on the
    first open. Unearned stickers are grey, with a hint and a progress bar. Bonus photocards stay as they are.
  - ✅ **Pet (v1.19):** a pet bed by Fuzzy's feet (both rooms); pick one of 4 original pets (tiny bat, ghost kitten,
    cloud puppy, star hamster), all free, switch any time. Tap it to pet it (tricks), give a treat (2 coins) or dress it
    (5 accessories). Friendship hearts only go up (no hunger, nothing sad); new tricks at 10 / 30 / 60 / 100 hearts.
    4 pet stickers. Save version 12.
- **Buddies + Content Pack 2** (plan agreed 2026-11-16, two PRs): options the nieces' younger brothers (5 and 3) will
  enjoy too. Everything stays open to everyone.
  - ✅ **Buddies (v1.20):** 5 free buddies with one shared body (Bunny, Bear Cub, Puppy, Little Dino, Fox) and 3 faces
    (Sparkly, Bright Smile, Cheeky Grin), in the Closet's new 🐾 Buddy and 😊 Face tabs. Short hair (Buzz Cut, Messy Mop,
    Side Part), free basics (Sky Stripe Tee, Cargo Shorts, High-tops, Backwards Cap) and 3 more furs. A new room starts
    from one of 6 starter looks, picked by picture. The room's colour (now also Green and Blue) can tint the buttons and
    bars, and a new room starts with a matching wall and furniture. Decorate's 🎨 Colours tab recolours the built-in
    furniture of both rooms (10 free swatches). Save version 13.
  - ✅ **Content Pack 2 (v1.21):** dinosaurs, space and rockets, trucks/trains/cars, robots/sharks/heroes: 16 clothes,
    12 decorations, 4 walls, 3 floors, 17 fidget designs (pop-it colours and Rocket/Dino boards, squishies, spinners,
    slimes, clicker cubes, marbles), photocard tags and 4 theme stickers. Prices 10–30. No save changes.
- ✅ **Code Lab 💻 (v1.13, the owner's idea):** tap the Loft's computer desk. 18 hand-made puzzles (6 per level):
  Easy = arrows only, Medium = 🔁 repeat (with a block limit, so repeat is needed), Hard = toy-block walls and ⭐ stars
  picked up with 🌟. No timers, a bump is a gentle "oops". 3 coins per new puzzle, +5 for a whole level, and a
  "First Program!" bonus card. Puzzles are text recipes in `18-codelab.js`, so more are easy to add.
- ✅ **Code Lab: My Move + If (v1.14, the owner's choice):** two new levels, 6 puzzles each, open from the start.
  ✨ My Move = a second short row of blocks that the ✨ block runs (a first "function"). ❓ If = puddles 💧 and a ❓ block
  in front of an arrow: hop over a puddle if one is next, otherwise step. Same coins (3 per puzzle, +5 per level).
  No save changes.
- ✅ **Code Lab: 🧠 Challenge (v1.15, the owner's request for more challenge):** 8 puzzles using every block at once,
  mixing the ideas (🌟 and ❓ inside ✨ My Move, walls, puddles, stars, bigger boards, tight block limits). 5 coins each,
  +10 for the level. Ideas for later: more Challenge puzzles at the end of the level.
- First sketch of Code Lab (kept for the history; the build above is what was agreed):
  - Fuzzy stands on a small grid (for example 5×5) and has to reach a ⭐ or collect treats.
  - She snaps big picture blocks into a row (➡️ ⬅️ ⬆️ ⬇️ moves, 🔁 repeat, later "if"), then presses ▶ Run and
    watches Fuzzy follow the program one step at a time, with the current block lit up.
  - Levels teach one idea at a time: putting steps in order → repeat loops → reusing a "my move" block →
    simple "if" (for example "if there's a puddle, jump").
  - No failing: if the program goes wrong, Fuzzy stops, the block where it went wrong glows, and she can fix it and try again.
  - **Starts with 3 levels, Easy / Medium / Hard** (like Soccer and the Stage), each with a handful of hand-made puzzles.
    More puzzles and levels will be added later, so puzzles are plain data entries (adding one = one entry).
  - Coins the first time each level is solved, plus a bonus star for using few blocks. All levels are made by hand (not random).
  - Easy mode (younger sister): only arrow blocks and short paths, so it works without reading.
  - Original look and art: block coding is a common kind of game, but it must not copy any existing coding app's look,
    characters or levels.

## Phase 8 and beyond (roadmap agreed 2026-11-16)
The owner picked the order: About → third room → Goalie → first Brain Games → new songs → the rest.
Each line is one PR with its own detailed plan, agreed before building. Each PR takes the next version number, so the
numbers after v1.22 are only a guide. The usual rules apply to every new game: all levels open from the start, no
timers, nothing lost, Easy mode works for the 3- and 5-year-olds, and a few new stickers.

### Phase 8: Made for you + room to grow
- ✅ **💌 About & Gift Story (v1.22, the owner's idea):** ⚙️ Settings → 💌 About, so the children can show others the app
  was made just for them:
  - a dedication letter from the owner with the children's **nicknames** and the date the project started (14 Nov 2026)
  - a gift timeline: every update with its date and a short "why" line ("v1.5 Soccer Field ⚽: for our soccer star")
  - a family secret: tap the buddy on the certificate 5 times to see an inside joke only the family knows
    (built, but switched off until the owner writes a secret into the local file)
  - an "Edition 1 of 1" certificate, drawn like a gold photocard
  - a ✨ What's New box, shown once after an update is installed
  - **Privacy (the repo is public):** the personal words live in `web/about-local.js`, which is **git-ignored**, so it
    never goes to GitHub. A generic version in git (inside the new `web/js/25-about.js`) is used for anything the local
    file doesn't fill in, or when the file isn't there at all. `web/about-local.example.js` (in git) shows how to write it.
    The Android build copies the whole `web/` folder, so the APK built on the owner's PC includes the local file.
    The owner keeps a copy of `about-local.js` somewhere safe (like the signing key), because git doesn't have it.
- ✅ **🌳 Third room: the Backyard (v1.23, the owner's choice: start it now, to make room to grow):** a free outdoor room
  next to her room and the Loft, with its own fences (walls), grass and paths (floors) and decorations, and the season
  in the sky. It has a soccer goal (opens Soccer) and a chalkboard easel, which becomes Brain Games. The 🪜/🏠 room button
  becomes a three-room switch (still one tap to any room). Save: `room3`, with defaults for old saves.
  As built: 🌳 Yard / 🪜 Loft / 🏠 Room buttons (one for each other room); a tree with a swing and a garden shed (spots
  for later); 5 fences and 5 grounds (only listed outside); 8 outdoor decorations (10–30); 2 stickers. Save version 14.

### Phase 9: Games
Detailed plan for all three agreed 2026-11-16 (built one PR after another, each branch on top of the one before).
- ✅ **🧤 Be the Keeper (v1.24, the owner's idea):** a second Soccer mode where you're the goalie. Original strikers, one per
  level (a bouncy frog, a robot, a speedy fox). Swipe or tap to dive; Easy sends slow, glowing shots a 3-year-old can stop
  by tapping the ball. Its own glove trophies and stickers.
  As built: ⚽ Kick / 🧤 Keep buttons on the Soccer screen (remembered per room); her own buddy and outfit in goal;
  Hop 🐸, Bolt 🤖 (a hint arrow) and Zip 🦊 (sometimes fakes); 15 fixed shots per level, 5 per match, taken in turn;
  +1/+2/+3 per save (+1 with the kit), +5 for 5/5; Bronze/Silver/Gold Gloves stand in the Backyard by the goal;
  3 stickers. Save version 15 (`soccer.mode`, `soccer.keep`, `stats.saves`).
- ✅ **📚 Brain Games, part 1 (v1.25):** at the Backyard's chalkboard. Each game has Easy (ages 3–5), Medium (8) and Hard (11),
  coins for each first solve plus a level bonus (like the Code Lab), never a timer.
  - 🧁 **Snack Stand:** count cupcakes → add up an order → make change and times tables.
  - 🃏 **Memory Match:** 6 → 12 → 20 cards, using their own buddies and items.
  - 🫧 **Number Pop:** pop the 4 → pop pairs that make 10 → pop the factors of 24.
  As built: a menu of the 3 games; a game opens on its first unsolved puzzle, with level tabs and 8 numbered puzzle
  buttons; 8 fixed puzzles per level (72 in all), +2 per first solve, +5 per level; Medium Number Pop goes on to pairs
  that make 20; 4 stickers. Save version 16 (`brain`).
- ✅ **🎤 Stage song pack (v1.26, the owner's idea):** 4–5 new generated songs: a K-pop-style dance track (original), a soccer
  stadium chant, Dino Stomp (slow and big, for the little ones), Rocket Launch and a calm lullaby. Stickers for them.
  As built: 5 songs in `30-songs2.js` (Neon Hearts, Stadium Clap, Dino Stomp, Rocket Launch, Moon Lullaby), 8 in all;
  the song list is a grid; Encore! stays "the first 3 songs"; 4 stickers. No save change (new song ids only).

### Phase 10: Backlog + helpers
Detailed plan agreed 2026-11-16: five PRs in this order, each branch on top of the one before (the owner merges them
in order). The speed check comes last on purpose: the app is fast enough today, and it should measure everything added here.
- ✅ **👗 Looks, emotes & night mode (v1.27):** in `31-looks.js`.
  - ⭐ My Looks: 4 outfit slots in the Closet. Tap an empty slot to keep the outfit, a full one to wear it; 💾 then a slot
    replaces one (it asks first). A look keeps clothes and hair, never the buddy kind, face or fur.
  - Tap the buddy for 4 big emote buttons: 👋 wave, 💃 dance, 😂 laugh, 💤 nap (short CSS animations, no loop).
  - 🌙 Night mode per room (the round button in the room's corner): one dark layer with soft light around lamps, lights
    and the buddy; the window (or the Backyard sky) shows the moon and stars. Drawn once, no animation; off while decorating.
  - 2 stickers (⭐ Fashionista, 🌙 Night Owl). Save version 17 (`looks`, `night`, `stats.nights`).
- ✅ **🎁 Gifts & room presets (v1.28):** 🎁 give a decoration from My Stuff (it leaves your stuff) or coins (5 / 10 / 20,
  never more than you have) to another room on the same tablet. **No PIN check** (owner's choice). It arrives as a
  wrapped box in their room; tapping it opens it with confetti and says who it's from. Clothes and fidgets can't be given.
  🏠 Save up to 3 layouts per room and load one later (things no longer owned are skipped). 2 stickers.
  As built (`32-gifts.js`): 🎁 from Settings or the top of My Stuff (what → who → ✔); the gift pile sits on the floor of
  every room; 🏠 Layouts is a new Decorate tab; things moved to another room come back when a layout loads. Save version 18.
- ✅ **🔎 Shop filters + 💰 big dreams (v1.29):** theme chips above the Closet and the Shop (All · 🦇 Emo · ☁️ Cute · ⚽ Sport ·
  🎤 Stage · 🦕 Dino · 🚀 Space · 🚗 Ride · 🤖 Hero · 🌳 Outdoor · 🍂 Season); older items get their theme from a list in the
  new file, so no ids change. 5 "big dream" decorations at **60–100 coins** (Canopy Bed, Arcade Cabinet, Castle Bunk Bed,
  Rocket Playhouse, Aquarium), with a "⭐ Saving for…" bar. More dream items can come later. A sticker.
  As built (`33-shopplus.js`): no 🍂 Season chip (seasonal things have their own tab, so it would be empty); a ⭐ Dreams
  chip instead. Tapping a dream she can't afford offers "⭐ Save up for it?". Save version 19 (`dream`).
- ✅ **🧑‍🔧 Grown-up helpers (v1.30), the only one that changes `android/`:** 💾 "Last backup: 12 days ago" in Settings
  (grown-up text only); 🔊 Read to me, a switch per room, **on by default in Easy mode** (owner's choice), off otherwise,
  using Android's built-in `TextToSpeech` through the wrapper (no new permission; the browser stays quiet);
  📷 Room snapshot, a PNG of a room or a photocard saved with Android's save picker (`AndroidBridge.saveImage`).
  As built (`34-helpers.js`): the 📷 button sits under 🌙; a 📷 Say Cheese! sticker; Read to me stays quiet during a
  Stage song. Save version 20 (`speak`, `stats.snaps`; `settings.lastBackup` belongs to the device).
- ✅ **🛋️ Room tweaks (v1.31, the owner's request):** on a phone the room's top bar is two rows (name + coins, then the
  buttons), so the name isn't squeezed; while decorating, the thing touched last comes to the front.
- ✅ **⚡ Speed check & tidy-up (v1.32):** the smoke test slows the CPU 4–6× and times the rooms, the Shop, the Closet and the
  Sticker Book; fix the slowest spots and write the numbers in STATUS. Split `09-screens.js` if it's needed.
  As built: the biggest cost was a room doing nothing (the breathing buddy, the pet and moving decorations redrew the
  whole room 60 times a second). Idle animations now step 5 times a second, all together (SVG `<animate>` became CSS),
  and the main loop only runs on Soccer, the Stage and the Fidget Shelf. Wearing an owned item redraws only the buddy;
  moving things doesn't rebuild the Shop. `09-screens.js` is 35 KB, so it was not split. Numbers are in STATUS.

### Phase 11: More games and content
Detailed plan agreed 2026-11-17: six PRs in this order, each branch on top of the one before (the owner merges them in order).
- ✅ **🚂 Brain Games 2a (v1.33):** Pattern Train + Word Builder in `35-brain3.js`. 8 fixed puzzles per level, +2 / +5 like
  part 1, 2 stickers. No save change. Also: bonus photocards can't be deleted (the owner's request).
- ✅ **🍕 Brain Games 2b (v1.34):** Fraction Bakery + Fact Cards in `36-brain4.js`. Right answers unlock fact cards, kept in their
  own 📇 binder inside Brain Games. 2 stickers. As built: a card is unlocked when its puzzle is solved, so there is no
  new save field (the planned `facts[]` wasn't needed) and no save version change.
- ✅ **🎀 Content Pack 3 (v1.35):** `37-pack3.js`, only adds entries; every item gets a theme chip and photocard tags. 4 stickers.
  As built: 🎤 stage, 🍵 cozy, 🧁 cafe and 🐚 ocean themes. 18 clothes (with the Idol Buns hair style), 14 decorations in
  4 matching sets, 4 walls, 4 floors, 14 fidget designs (3 new squishies: Cupcake, Jellyfish, Rice Ball). New 🍵 Cozy,
  🧁 Cafe and 🐚 Ocean chips. No save change.
- ✅ **🏀 Content Pack 4 (v1.36):** `38-pack4.js`, with the 🦖 dino nugget plush (a decoration that sits on shelves + a squishy). 4 stickers.
  As built: 🏀 basketball/skate/karate, 🐮 farm, 🚒 trucks and 🚀 space, and 🦖 the dino nugget (plush, squishy, tee and a
  pop-it board). 17 clothes, 14 decorations (Hay Bale and Toy Tractor are outdoor), 3 walls, 3 floors, 14 fidget designs.
  A new 🐮 Farm chip. Also (owner's requests): the Rocket Goo rocket redrawn with a flame, and a **30-a-day fidget coin
  allowance** (pop-it swipes earned coins too fast). Save version 21 (`fidPay`).
- ✅ **🧩 Extras (v1.37):** about 6 more 🧠 Challenge puzzles and about 6 more marble mazes, added at the end, plus stickers.
  As built: `39-extras.js` adds Challenge puzzles c9–c14 (14 in all) and mazes m7–m12 (12 in all), and 3 stickers
  (Marble Marathon, Level Collector, Code Master). Finishing the bigger list pays the level bonus once more. On a short
  screen the maze buttons scroll in one row. No save change.
- ✅ **🎹 Music Maker (v1.38, last):** an 8-step beat-and-melody grid on the Loft's speaker, 3 saved loops, the main loop only
  while it is on screen. A sticker. Save version 22 (`music`).
  As built (plan details agreed 2026-11-17): a free 🎹 keyboard built into the Cozy Loft opens it (`40-music.js`). 5 notes
  (C D E G A) and 4 beat rows, 3 sounds, 3 speeds, 3 💾 slots, 3 ready-made loops. +3 coins per saved new loop, 3 a day.
  The main loop runs only while a loop is playing. Sticker: 🎹 Beat Maker.

- ✅ **🛋️ Room depth (v1.39, the owner's request 2026-11-17):** things standing on the floor are drawn front to back by
  floor position again (the original design; a v1.28 slip had switched it off and v1.31 had made "last touched in front"
  the rule). The rooms' own floor furniture, the buddy, the pet bed and gifts join the same order. While decorating they
  fade so things behind can be grabbed. No save change.

The first ideas list:
- **📚 Brain Games, part 2:** 🚂 Pattern Train (colours → shapes → number sequences), 🔤 Word Builder (first letters →
  3-letter words → spelling from a picture), 🍕 Fraction Bakery (halves → quarters → "⅔ of the pizza"), 🪐 Fact Cards
  (dinosaurs, space, ocean; right answers unlock collectible fact cards).
- **🎹 Music Maker (optional):** a beat-and-melody grid for making their own loop.
- **Content Pack 3:** K-pop-inspired stage outfits (original), cozy anime-style looks, cafe and bakery, ocean and mermaids,
  matching furniture sets. **Content Pack 4:** basketball, skateboard and karate, farm animals, more trucks and space,
  and a 🦖 **dino nugget plush** (an original dinosaur-shaped nugget plushie: a room decoration that can sit on shelves,
  plus a matching squishy for the Fidget Shelf; no real brand names or packaging).
- More 🧠 Challenge puzzles, more marble mazes, and stickers for every new game.

### Phase 12: Playability (roadmap talked through 2026-11-17)
Why: an honest look at the app found that most games are fixed lists that run out, decorating and dressing up have no
goal, nothing is played together (four children share it), the youngest two have little no-fail play, and the creative
tools (Art Desk, Music Maker, Photocards, Stage) don't connect. Each PR still gets its own detailed plan before building.
- ✅ **🗺️ A fourth room + getting around (v1.40, first; plan details below, agreed 2026-11-17):**
  - A bare room with nothing built in (only a wall and a floor), so every piece is her choice. Named ✨ Studio (the owner liked it).
    A free **Built-in Shelf** (a wide wall shelf, price 0) in the Shop gives her a built-in look if she wants one.
  - Getting around: the main room is the hub. Small arrow tabs at the screen edges (pictures of the room they lead to,
    hidden while decorating, never covered by decorations): main room ⬆️ Loft, ⬅️ Backyard, ➡️ the new room; each other room
    has one tab back. The main room's **window now leads to the Backyard**; Soccer is opened from the Backyard's goal only.
  - The top bar's two room buttons become one **🗺️ house map** (a picture of every room, one tap each), with room to add
    more rooms later. Back still goes any room → main room → profiles.
- ✅ **🚪 Visitors & requests (v1.41, built; plan details below, agreed 2026-11-18):** the original characters she knows (Mochi, Boo, Flap, Hop, Bolt, Zip) drop by with a
  small wish ("a spooky-cozy corner", "dress up for a picnic"). She decorates or dresses up, they cheer, she gets a sticker.
  No timer, no failing. The new room is the natural place for decorating requests.
- ✅ **👯 Two-player games (v1.42, built; plan details below, agreed 2026-11-19):** take turns on one tablet: one kicks, one keeps (both Soccer modes exist), 2-player
  Memory Match, and tapping the beat together on the Stage.
- ✅ **🎲 Free Play + Puzzle of the Day (v1.43, built; plan details below, agreed 2026-11-19):** endless generated puzzles
  (made from a seed, never saved by id) for the mazes, simple Code Lab boards and 5 Brain Games; one generated
  puzzle a day for a small bonus, with no streak and no "missed it".
- ✅ **🔤 American spelling (v1.44, the owner's request, built):** the app's words and code comments use American English
  (color, favorite, gray, cozy, tire; the season is Fall). Saved ids are unchanged. A smoke-test check keeps it that way.
- ✅ **🔤 Word Builder word bank (v1.45, built; agreed 2026-11-19):** the owner's spelling list by age (`45-words.js`).
  🎲 Free Play in Word Builder: Easy traces faint letters, Medium/Hard is 👀 look, ✋ hide, spell (👀 peeks again, no timer),
  🔊 on every level. Word Builder joins the 📅 daily turn (6 games). The 8 fixed puzzles per level are unchanged.
- ✅ **🧸 Little Ones' Corner (v1.46, built; plan details below, agreed 2026-11-19):** a 🧸 Play button in every room:
  🖍️ Tap-to-Color (12 pictures, 🖼️ hang one in the Gallery), 🎵 Sound Mat and 👀 Peekaboo. Nothing can go wrong.
- ✅ **💃 Dance Maker (v1.47, built; plan details below, agreed 2026-11-19):** 8 beats of whole-body moves, danced to a beat,
  a Music Maker loop or a Stage song; 🕺 free dance while it plays. Also (owner's request) the 🎤 Stage sign hangs above the 🎹 keyboard.
- ✅ **🌱 Backyard garden (v1.48, built; plan details below, agreed 2026-11-19):** the garden shed opens a 6-plot
  garden. Plants grow one step a day by themselves and never wilt; picking one gives coins and, the first time, a potted plant.
- **Later, any order:** 👗 Runway (style a look for a theme
  card; judges only cheer), 🔍 I Spy in her own room, 🐾 more pet play (walks, hide-and-seek), Stage freestyle (play her own
  loop), Soccer trick shots, and new things to spend coins on (pet house, a collections museum, Stage backdrops).

#### v1.48 plan details: 🌱 Backyard garden (agreed 2026-11-19)
Why: the Backyard has a shed that was "a spot for a future game", and nothing in the app grows over time. A garden gives a
gentle reason to visit, with nothing to lose. Owner's answers: plants **grow by themselves**; picking gives **coins + a pot**;
**4 free seeds + 8 to buy**; **6 plots**.
- **The way in:** tap the 🏡 Garden Shed in the Backyard (it becomes a hotspot, with a 🌱 Garden sign in Easy mode). It opens
  a garden screen: a big raised bed with **6 plots** (2 rows of 3; on a phone held upright, 3 rows of 2) and a seed tray
  underneath. Back goes to the Backyard. A small flower box under the shed's window shows up to 3 blooms that are ready.
- **Planting:** tap an empty plot → the seed tray glows → tap a seed packet (a picture of the grown plant on it) → it's
  planted, with a little "pat pat" sound. Or tap a seed first, then a plot. One seed per plot. No coins to plant.
- **Growing, by itself:** 4 steps: 🟤 seed → 🌱 sprout → 🌿 bud → 🌸 ready. It moves **one step each new day** (from the device
  date, like the daily gift), so a seed planted today is ready in 3 days. Nothing ever wilts, dries out or goes away.
  If the date goes backwards, a plant never shrinks. Each plot shows the step as a picture; growth is never a number or a countdown.
  - 💧 **Watering is just for fun:** a watering can she drags or taps over a plot makes sparkles, a splash sound and a happy
    wiggle. It doesn't change growth, so forgetting it costs nothing. No "your plant is thirsty" messages, ever.
  - `README.md` tells grown-ups that plants grow by the device date (so changing the date changes them too).
- **Picking:** tap a ready plant: it pops out with a cheer, the plot is empty again. **+3 coins** every time (6 plots × one
  harvest per 3 days, so about 6 coins a day at most). The **first time** she grows a kind, a **potted version** goes into
  My Stuff (an `award:1` decoration for any room, never sold in the Shop), with a "New pot! 🪴" box that offers Place it.
- **12 seeds** (all original, drawn in code): free: 🌻 Sunflower, 🍓 Strawberry, 🥕 Bunny Carrot, 🌷 Tulip.
  To buy once (5–15 coins, then planted forever, owned as `seed:<id>`): ⭐ Star Flower (glows at night), 🦇 Bat-Wing Bloom,
  🌙 Moon Bell, 🍄 Puff Mushroom, 🎃 Mini Pumpkin, 🦖 Dino Fern, 🚀 Rocket Pepper, 🍭 Candy Swirl. Every kind can be grown in any
  season (no limited-time seeds). They get theme chips (the 🦇, ⭐ and 🦖 ones join those themes), so Visitors' wishes and the
  Shop filters find the pots.
- **Stickers** (🏠 Room & Style page): 🌱 First Sprout (plant a seed), 🪴 Green Thumb (10 plants picked), 🌻 Garden Party
  (all 6 plots growing at once), 🏡 Master Gardener (every kind grown once). Totals only, never streaks.
- **Night:** the Star Flower and Moon Bell pots get `NIGHT_GLOW` entries, so they glow in 🌙 night mode.
- **Light on the device:** no main loop. Plants are drawn once per change (SVG); wiggles and sparkles are CSS animations.
- **Read to me** names every seed and plot ("Sunflower, ready to pick"). Big tap targets (each plot is 96 px or more).
- **Save:** `garden{plots[6], grown[], pay?}` per profile, where a plot is `null` or `{seed, day}` (the day it was planted;
  the step comes from today's date), `grown` lists every kind picked at least once; `stats.harvests`. Save version 29
  (`normalize` + `MIGRATIONS[29]`). Seed ids and pot keys (`pot<Name>`) are saved: never rename them; new seeds go at the end.
  Older backups restore with an empty garden.
- **Files:** new `49-garden.js` (seeds, plant drawings, the screen, the pots, stickers) and a new `scr-garden` screen in
  `index.html`; a small hook in `26-backyard.js` (the shed becomes `data-hot="garden"`, plus the window box).
- **Smoke test:** the shed opens the garden (also on a phone); planting from plot-first and seed-first; growth by test day
  (`FP_TEST_DAY`): 0, 1, 2, 3 days and a date going backwards; watering changes nothing saved; picking pays +3 and gives the
  pot once (placing it works in every room); buying a seed; all 12 plants draw at every step; the stickers; Back; a restore
  from v1.47; tap targets 48 px+ and phone layouts fit.
- As built: a new pot is put straight into the Backyard (next to the garden), like a visitor's plush, rather than My Stuff;
  she can move it anywhere in Decorate. Tapping a growing plant waters it, and 💧 waters them all. Seeds to buy cost 8–15.

#### v1.40 plan details (agreed 2026-11-17; built as planned)
- Save: `room4{wall,floor,items[]}` per profile, starting wall and floor from `ROOM_START`; `night['4']`, `presets['4']`.
  Save version 23 (`normalize` + `MIGRATIONS[23]`); every older backup still restores (the room is added empty).
- `roomNo` 4: `curRoom`, `rooms(p)` and `allItems(p)` include it, so My Stuff, layouts, gifts, night mode and the Shop work
  there. Indoor walls and floors, all indoor and outdoor decorations; posters get a spot there too.
- Built-in Shelf: a `DECOR` entry with `wall:1`, `shelf:{w,top}`, price 0, coloured to blend with the wall.
- Edge tabs and the 🗺️ map: one `ROOM_MAP` list (id, icon, name, which room it hangs off) so a future room is one entry.
  Read to me names every tab. The ✨ What's New box says the window now goes outside and Soccer is at the Backyard goal.
- As built: `41-studio.js`. Her window's Easy-mode label says 🌳 Outside. Also (owner's request): no more stars on the indoor walls at
  night, and the Backyard's night sky shows the Big Dipper. One sticker, ✨ Studio Star (5 things in the Studio).
- 1–2 stickers (for example, decorating the new room). Smoke test: walk every tab and the map, place things in the new
  room, night mode, a layout, a gift, a backup restore from v1.39.

#### v1.41 plan details: 🚪 Visitors & wishes (agreed 2026-11-18)
- Six friends from the games visit: Mochi 😺, Boo 👻, Flap 🦇 (the Soccer keepers), Hop 🐸, Bolt 🤖, Zip 🦊 (the strikers).
  Each is drawn once into a small picture (no drawing every frame) and stands in **whichever room is on screen** (like the
  gift pile), with a speech bubble. Tapping the friend opens their wish card.
- **18 fixed wishes, 3 per friend** (saved by id, never renamed; new ones go at the end). Each wish is a simple check:
  things of a theme chip placed in the room on screen, clothes of a theme worn, a poster, night mode with a lamp, a rug…
  Wishes never need a ⭐ big dream item.
- ✅ **Show me!** checks it. Not yet: a gentle "Almost! 1 more 🦇 thing" and the friend keeps waiting. No timer, no failing.
  💡 **Help** opens the Shop (or Closet) with that theme chip picked. 🔄 **Something else?** swaps to another wish.
- **One new friend a day.** The first comes right after the update. A friend waits as long as it takes (never leaves,
  nothing is missed); after a wish is done, the next friend knocks the next day (from the device date, like the daily gift).
- Thank-you: **+5 coins** per wish; after all 3 of a friend's wishes, they leave a **plush of themselves** (an `award:1`
  decoration for any room, not in the Shop). A few stickers (first wish, 6 / 18 wishes, all six plushes).
- Save: `visit{cur, day, done[]}` per profile; save version 24 (`normalize` + `MIGRATIONS[24]`); older backups restore
  with no wishes done. New file `42-visitors.js`. Smoke test: every wish can be met and is checked, the daily pace, the
  plush, the stickers, a restore from v1.40.
- As built: 6 stickers on a new 🚪 Friends page (Welcome!, Good Friend, Super Friend, Best Host, First Plush, Plush Pals).

#### v1.42 plan details: 👯 Two-player games (agreed 2026-11-19)
- **Who plays:** player 1 is the room that is open. Player 2 taps another room's badge (their buddy shows up in the game)
  or 👤 Guest. The partner is remembered until the app closes, so "Play again" is one tap.
- **Where:** a 👯 button in each game: Soccer's Kick/Keep row gets 👯 **Duel**, the Brain Games menu gets 👯 **Memory for 2**,
  the Stage song list gets 👯 **Together**. One tap from where they already play.
- **⚽ Soccer duel:** both play at once on one screen. The kicker swipes up from the ball (the same swipe as ⚽ Kick); the
  keeper (their buddy in goal) taps or swipes to dive once the ball flies (the same as 🧤 Keep). Easy / Medium / Hard set
  how fast the ball flies (Easy is slow and the glowing ball can be tapped). 10 shots, taking turns: after each shot the
  players swap ends ("🔄 Switch!").
- **🃏 Memory for 2:** a board from Memory Match (Easy / Medium / Hard size). Players take turns flipping 2 cards; a pair
  gives a point in that player's colour and another go; a miss passes the turn. Nothing is saved as solved.
- **🎤 Stage together:** any song, with 2 pads: the left one is player 1's, the right one player 2's (the Medium chart,
  with Easy's slower notes and wider timing). One shared team score and stars.
- **Gentle scores:** Soccer and Memory show both scores; the end box cheers both ("Great game, you two! 🎉"), never a
  loser. A draw is "It's a tie, you're both stars!".
- **Coins:** each player's room (not a Guest) gets **+3 coins** per finished game, up to **15 a day** (5 games), then a
  gentle note and it keeps working for fun. Personal bests, trophies, gloves and stars are not changed by 2-player games.
- **Stickers** (🚪 Friends page): Play Date (1 game together), Game Night (all 3 games together), Best Buddies (20 games).
- Save: `duo{day, n, soccer, memory, stage}` per room (coins today + games played); save version 25. New file
  `43-together.js` with small hooks in Soccer, Brain Games and the Stage. Smoke test: the partner picker, a whole duel with
  both inputs at once, Memory turns and scores, a Stage song split by lane, coins and the daily limit, a restore from v1.41.

#### v1.43 plan details: 🎲 Free Play + 📅 Puzzle of the Day (agreed 2026-11-19)
Owner's answers so far (2026-11-19): Free Play is **always open**; **+1 coin each, 10 a day**; the Puzzle of the Day is a
**card on the Brain Games menu**; it pays **+5 coins**.
- **How a puzzle is made:** a small "dice" (a random number maker started from a seed) builds a puzzle from rules. The same
  seed always gives the same puzzle. Free Play rolls a new seed each time; the Puzzle of the Day uses the date, so it is the
  same all day (also after closing the app). Every made puzzle is checked before it is shown (it can be solved, and only one
  answer fits); if a check fails, the dice rolls again. Nothing about a made puzzle is saved.
- **🎲 Free Play, one button in each game** (glowing once that level's fixed puzzles are all done):
  - **🔮 Marble Maze:** a 🎲 button at the end of the maze bar. A new 9×6 maze with a start, a star hole, walls and a few
    bumpers; checked with the same path search as the fixed mazes, and never a too-short path.
  - **Brain Games:** a 🎲 button after the 8 puzzle numbers in every game below.
  - **🚂 Pattern Train** (🐣 Easy / 🌟 Medium / 🧠 Hard): Easy: colour patterns
    (AB, ABC, AAB, ABB), the gap at the end or in the middle. Medium: shape + colour. Hard: number rules (+n, −n, ×2, ÷2,
    squares, growing steps), with the matching hint. Only the answer may make the train repeat.
  - **🫧 Number Pop** (same levels): Easy "pop every 3" with dots; Medium pairs that make 10 or 20 (one lonely decoy at most);
    Hard the factors of a number with lots of them (12 to 60), mixed with numbers that aren't.
  - **🧁 Snack Stand** (same levels, added 2026-11-19): Easy counting, Medium adding up an order, Hard word problems from about
    6 sentence templates ("Cupcakes come in boxes of N…"); the answer is always among the choices, whole numbers only.
  - **🃏 Memory Match** (same levels, added 2026-11-19): 3 / 6 / 10 different pictures picked from her room things, buddies
    and pets, shuffled by the seed (never her own buddy next to the other buddies, as in the fixed sets).
  - **🍕 Fraction Bakery** (same levels, added 2026-11-19): a treat and a fraction made from the same kinds as the fixed
    puzzles. There are few sensible fractions, so repeats will happen, which is fine.
  - Not generated: 🔤 Word Builder (words can't be made up) and 🪐 Fact Cards (fixed, checked facts that unlock cards).
  - **💻 Code Lab:** a 🎲 New board tile on the Easy and Medium lists only (arrows, and 🔁 on Medium). Fuzzy, a carrot and a few
    toy blocks; the block limit comes from the shortest answer (found by search), plus a little room. Medium boards need 🔁.
    My Move, If and Challenge stay fixed (they are hand-checked puzzles).
  - Solving shows the usual cheer and a box with **🎲 Another one!** and **⬅ Back**. **+1 coin each, up to 10 a day**
    (`FREE_DAILY`, shared by all the games), then one gentle note ("Free Play coins are full for today! Keep playing for
    fun ✨"), and it keeps working. It refills quietly when the date changes. No countdown, no "come back".
  - Free Play never changes `brain.solved`, `maze.solved`, `code.solved`, the level bonuses, Brain Champ or the puzzle ticks.
- **📅 Puzzle of the Day:** a card at the top of the Brain Games menu (`BR_MENU_TOP`, next to 👯 Memory for 2). The game turns
  through 5 Brain Games by the date: Pattern Train → Number Pop → Snack Stand → Memory Match → Fraction Bakery (owner's
  choice 2026-11-19: the Maze and Code Lab stay out, as they live on other screens and already have 🎲). The level is her
  saved level for that game (Easy mode: always Easy). Tapping it opens the game straight on the day's puzzle; Back goes
  back to the Brain Games menu.
  - Solved: **+5 coins** once that day, and the card says "✔ Solved today 🎉". Not solved: the card just shows the puzzle,
    with no reminder, streak or "missed" message. A replay the same day is free practice.
- **Stickers** (Code & Brain page, total counts, never streaks): 🎲 Dice Roller (10 Free Play puzzles), 🎲 Puzzle Explorer
  (50), 📅 Daily Thinker (5 Puzzles of the Day).
- **Save:** `free{day, n}` (Free Play coins today), `potd{day}` (the last day the Puzzle of the Day was solved),
  `stats.free`, `stats.potd`; save version 26 (`normalize` + `MIGRATIONS[26]`). Older backups restore with nothing played.
- **Files:** new `44-freeplay.js` (the dice, the 🎲 buttons, the daily card, the maze and Code Lab makers) and, if that
  goes over ~40 KB, `45-freeplay2.js` (the Brain Games makers); small hooks in the maze (19), the Code Lab (18) and the
  Brain Games puzzle screen (28) so a made puzzle can be opened like a fixed one.
- **Smoke test:** each maker on a few hundred seeds gives puzzles that follow the fixed puzzles' rules (solvable, one answer,
  choices contain the answer, Medium Code Lab needs 🔁); the same seed gives the same puzzle; the 🎲 buttons in all seven
  games; +1 coins up to 10 then the note; a new day refills; the daily card: the right game by date (only the 5 rotation games), +5 once, then
  "Solved today", a new puzzle the next day, no streak words anywhere; fixed-puzzle progress unchanged; the stickers; a
  restore from v1.42; phone layouts.
- As built: one file, `44-freeplay.js` (about 22 KB, so no second file was needed). On Easy, Code Lab boards may have up to 2 toy
  blocks; Medium boards have none (so the fewest blocks can be worked out exactly). Free Play mazes count for Marble Marathon,
  like a replay. The "coins are full" note shows once a day in the done box. The makers' checks also pass every fixed puzzle. Mazes are corridor mazes (rooms joined by a random search, so there is always
  a way through, plus 1–3 extra gaps and a few nooks in the bottom row), mirrored so the start can be in any corner.

#### v1.47 plan details: 💃 Dance Maker (agreed 2026-11-19)
Why: the creative tools didn't connect; this gives the Music Maker's loops and the Stage's songs something to do together.
Owner's answers: opened from **both** the Music Maker and the Stage; **8 free moves**; dances are **8 beats** long.
- **The way in:** a 💃 **Dance** button in the Music Maker (next to 🎁 Ideas and 🗑️) and a 💃 **Dance** tab on the Stage's level row.
  Back goes to where she came from. Opened from the Stage it starts on a song; from the Music Maker, on her loop (if it has notes).
- **Moves:** the buddy is one picture (every closet item is drawn on top of the body), so moves are whole-body: 🦘 Hop, ↔️ Sway,
  🌀 Spin, 🐛 Wiggle, ⬇️ Bounce, 👏 Clap, ⭐ Star jump, 🙇 Bow, each exactly one beat long (CSS animations on a picture of the
  buddy drawn once, so the `#fuzz` filter is never redrawn). Saved as one letter each (`h s p w b c j o`, `.` = empty).
- **Making a dance:** tap a move = the next empty beat; tap a beat = empty it (like the Code Lab blocks). ▶️ plays the dance
  round and round. **🕺 Free dance:** while the music plays, a tapped move is danced on the next beat (the dance itself stays).
- **Music:** 🥁 Beat (104 beats a minute), 🎹 My loop, 💾 saved loops (their own sound and speed), and the 8 Stage songs (played
  once, sounds only; no notes to tap). Scheduled ahead on the audio clock like the Stage, with the same "Sound late?" setting.
- **Saving:** 💾 3 slots, 🎁 3 ideas (Bunny Bop, Bat Flap, Star Show), 🗑️ Clear; loading over an unsaved dance asks first.
- **Coins:** +3 per saved new dance (3 moves or more), 3 a day (`DN_DAILY`), then a gentle note.
- **Stickers** (Stage page): 💃 First Dance, 🕺 All the Moves (all 8 in one dance), 🪩 Dance Party (3 different Stage songs).
- **Light on the device:** the main loop runs only while a dance plays (`loopWanted`); leaving the screen or the app stops it.
- **Save:** `dance{cur, music, slots[3], songs[], pay{day,n}}`; save version 28 (`normalize` + `MIGRATIONS[28]`).
- **Files:** new `48-dance.js` and a `scr-dance` screen. Also (owner's request): the Loft's 🎤 Stage sign moved from between
  the window and the desk to the wall right above the 🎹 keyboard.

#### v1.46 plan details: 🧸 Little Ones' Corner (agreed 2026-11-19)
Why: the youngest two (5 and 3) can't read yet and most games have right and wrong answers. This corner has three toys
where **nothing can go wrong**: no words needed, no scores, no timers, nothing to lose. Everyone can use it (no age or
"boy"/"girl" labels); it just suits the little ones best.
- **The way in:** a 🧸 **Play** button in the room's top bar, next to 📒, in every room. One tap. It opens a
  menu with 3 huge picture buttons (🖍️ 🎵 👀). Back goes toy → menu → the room she came from.
- **🖍️ Tap-to-Color:** 12 original pictures drawn in code with thick outlines and 4–8 big areas each (dino, rocket, dump
  truck, train, shark, robot, her buddy, kitten, flower, cupcake, butterfly, house). 10 huge crayons at the bottom (48 px or more).
  Tap a crayon, tap an area: it fills, with a soft "pop" sound and a sparkle. No outside-the-lines, nothing wrong. 🧽 undo
  (last fill), 🎲 surprise colors, 🗑️ start again (asks with ✔/✖ pictures). Each picture's colors are **remembered**, so it is
  still there next time. A ✔ that's finished shows a big 🌟 cheer.
  - 🖼️ **Hang it up**: save the colored picture into the Art Desk Gallery as a drawing, so it can be a poster
    on the wall like her own drawings (uses the existing gallery storage; it counts as a drawing).
- **🎵 Sound Mat:** a grid of 8 huge pads (2 × 4) that fill the screen. Two mats, picked by tabs:
  - 🎹 **Notes:** 8 colored pads with a picture each, playing a pentatonic scale, so any taps in any order sound nice.
  - 🥁 **Fun sounds:** boing, drum, bell, whoosh, rocket, train "choo-choo", car honk, splash, all made with Web Audio.
  - Several fingers at once work (pointer events). Each pad bounces and its picture wiggles. No recording, no score.
- **👀 Peekaboo:** a cozy scene (her Backyard style: a bush, a box, a curtain, a cloud, a flower pot, a door; 4 spots on
  phones, 6 on the tablet, all big). A friend hides (her pet, a buddy or one of the visitors). Tap a spot: it lifts with a
  little sound. An empty spot shows a fun surprise (a butterfly, a star, a ladybug) and a giggle, never a "wrong". Finding
  the friend: "Peekaboo!" (said with the tablet's voice when 🔊 is on), confetti, and a new round after a moment. No timer, no counting misses.
- **Coins:** **+1 coin per finished picture or friend found, up to 10 a day** (`LITTLE_DAILY`, like the
  fidget allowance), then it keeps working with one gentle note. The Sound Mat pays nothing (it's free play).
- **Stickers:** a new 🧸 page with 4: First Colors (1 picture finished), Little Artist (all 12 colored), Peekaboo! (10 friends found),
  Music Mat (100 pad taps). They count totals, never streaks.
- **Light on the device:** no main loop (CSS animations and transitions only), no `#fuzz` filter on the pictures, the
  hiding friend is drawn once. Read to me names every button. Easy mode makes nothing smaller (the buttons are already big).
- **Save:** `little{colors{picId:[...]}, pay{day,n}}`, `stats.colored`, `stats.peeks`, `stats.pads`; save version 27
  (`normalize` + `MIGRATIONS[27]`). Older backups restore with nothing colored. Picture ids are saved: never rename them.
- **Files:** new `46-little.js` (menu, Sound Mat, Peekaboo) and `47-colorbook.js` (the 12 pictures and coloring), a new
  `scr-little` screen in `index.html`.
- **Smoke test:** the 🧸 button in all four rooms (also on a phone); every picture draws and every area can be filled; fills
  are remembered after a reload; undo/surprise/start again; Hang it up puts a drawing in the Gallery; every pad of both mats
  plays and two fingers at once work; Peekaboo: empty spots never say wrong, finding the friend cheers and starts a new
  round; coins +1 up to 10 then the note; the stickers; Back; a restore from v1.45; tap targets 48 px+, phone layouts fit.
- As built: undo is ↩️ (not 🧽). The background is area 0 and can be colored, but a picture counts as finished without it.
  🎲 colors every area at once (finishing that way counts too). The saved shape also has `hung{picId:{art, sig}}`, so hanging the
  same picture again updates its drawing instead of making a new one. **6 stickers** (a sticker page needs 6 or more):
  First Colors, Little Artist, Peekaboo!, Hide and Seek Pro (50 friends), Music Mat, On the Wall. Peekaboo's 6 hiding spots
  are a bush, a gift box, a flower pot, a cloud, a door and a drum. "Peekaboo!" is spoken when sound is on (Android only).
  On a phone the room bar's button row has 5 columns.

## Ideas backlog (not scheduled)
- Mascot emotes/dances, outfit save slots ("looks"), room presets, night mode and gifting between rooms are now in Phase 10.

## Risks and how we handle them
| Risk | Plan |
| --- | --- |
| Lost progress (uninstall, new device) | Update in place, keep the debug keystore safe, use Backup before big updates |
| The code gets too big to manage | Split into `web/` in v1.9: one file per section. Start a new file for each new game or pack instead of growing old ones |
| Slow on an older tablet | Limit fuzz filters/animations, test on the real device every phase |
| Android tooling changes | Versions pinned in `android/`. Upgrade only when Android Studio requires it, using its Upgrade Assistant |
| Copyright slips | Original-only rule in CLAUDE.md. Review new art against it in every PR |
