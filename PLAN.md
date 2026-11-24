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
  Since v1.59 the same files are also hosted on GitHub Pages (free) for iPads and iPhones, which add it to the Home Screen;
  after the first visit it runs offline there too (`sw.js`), and it never sends anything anywhere.
- **Sideloaded APK.** No app stores. iPads and iPhones use the Home Screen web app instead (`docs/IOS.md`).
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
- ✅ **🌀 Curve balls (v1.56, agreed 2026-11-20):** a curved swipe (and, a little, a hard flick) makes the keeper worse at
  guessing, and a curve can send it the wrong way. A perfect 5/5 against Flap went from pure luck (about 1 in 150–800) to
  about 1 in 20–60 with great curved shots.
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
- ✅ **🔍 I Spy (v1.49, built; plan details below, agreed 2026-11-19):** a 🔍 button in every room. Clues (a picture, a name or a
  theme hint) for things in her own room; tap to find, 5 a round, nothing can go wrong; a 🔦 flashlight at night.
- ✅ **🪙 New things to spend coins on (v1.50, built; plan details below, agreed 2026-11-19):** 🏠 pet homes, 🎤 Stage backdrops
  and 🏛️ museum display pieces for showing off her prizes. One PR.
- ✅ **👠 Runway (v1.51, built; plan details below, agreed 2026-11-20):** pick a theme card, dress for it (her own clothes or
  borrowed ones), walk the catwalk; three visitor friends hold up cheer cards. Judges only cheer.
- ✅ **🎸 Stage Jam (v1.52, built; plan details below, agreed 2026-11-20):** one of her 🎹 Music Maker loops plays on the Stage
  and she taps big pads to play her own notes on top. Every note fits, no score.
- ✅ **🎯 Soccer Trick Shots (v1.53, built; plan details below, agreed 2026-11-20):** a 🎯 Tricks tab with 12 fixed trick
  shots (stars, hoops, balloons, a wall of friends to curve around). Unlimited tries, coins the first time, a prize for all 12.
- **🐾 More pet play (the last "Later" item; plans below, agreed 2026-11-20):** picked 2026-11-20. Owner's answers:
  **🙈 Hide & Seek, 🎾 Fetch and 🦮 Walks**; pet play gives **❤️ hearts and stickers, no coins** (the pet still never earns coins);
  a walk is **its own path scene**. Proposed as two PRs: 🙈 Hide & Seek + 🎾 Fetch in the rooms (v1.54), then 🦮 Walks (v1.55).
  Phase 12 is done when both are merged.
  - ✅ **🙈 Hide & Seek + 🎾 Fetch (v1.54, built).**
  - ✅ **🦮 Walks (v1.55, built).** Both merged 2026-11-20: **Phase 12 is done.**
- ✅ **🌀 Soccer curve balls (v1.56, built):** the owner's fix after Phase 12, so a perfect game against Flap takes skill, not
  luck. Details under Phase 4.
- ✅ **🎲 Brain Games Free Play coins (v1.57, built, asked 2026-11-20):** 🎲 Free Play in the Brain Games except Memory Match pays
  +2 a puzzle with no daily cap, so the thinking games are always worth coming back to. Memory Match, the Maze and the Code Lab keep
  +1 and the shared 10 a day. The owner accepted that Easy could be farmed.
- ✅ **🧩 Content Pack 5: Finish the Outfits (v1.58, built, plan agreed 2026-11-21):** `57-pack5.js`, 25 clothes that finish
  the half outfits (race driver, firefighter, builder, karate, farmer, robot, star hero, shark, astronaut, dino) and fill empty theme
  tabs (Stage leg warmers, Cozy and Cafe bottoms, Emo shoes). Field `p5` (any `THEMES` key) read by `themesOf`; `P5_SETS` lists
  the 10 outfits for 3 stickers. Clothes only, no save change. A hero cape was left out (Extras is one slot; it would need a new layer).
- ✅ **🦈 Shark Pants + listen and spell (v1.66, the owner's request 2026-11-22):** `sharkPants` (bottom, `p5:'hero'`) finishes the
  Shark Hoodie's belly circle and joins `P5_SETS.shark`. Word Builder bank words on Medium/Hard start hidden when `canSpeak()`.
- ✅ **📱 iPad + iPhone (v1.59, built, plan agreed 2026-11-21):** all the children's devices turned out to be iPads/iPhones. Plan details below.

#### v1.59 plan details: 📱 iPad + iPhone (agreed 2026-11-21, built)
Options looked at: a native iOS wrapper needs a Mac and either re-signing every 7 days (free Apple ID) or $99 a year, so it
breaks "free only". Opening `index.html` from the Files app doesn't run the scripts. A PC server at home needs https to work
offline. Chosen: **a Home Screen web app hosted on GitHub Pages** (the repo is public; free).
- **Hosting:** GitHub Pages from `main`, root folder (`.nojekyll` so files are served as they are). Each merge updates it.
- **About words:** the owner's generic words ("Kids", the letter, the signature) moved into `ABOUT_DEFAULT`, so the hosted copy
  shows them. `about-local.js` stays git-ignored and optional.
- **Offline:** `sw.js` keeps every app file on the device (only over https; file:// and the APK never use it). `VERSION` =
  `APP_VERSION`; a new version replaces the old files quietly, shown the next time the app opens (no pop-ups).
- **Home Screen:** `manifest.webmanifest` (added from code only over https) + iOS meta tags + `web/icon-180.png` (the buddy,
  drawn by `tools/make-icons.js`). `noindex` for search engines. In the Home Screen app, storage is asked to be kept for good.
- **iOS fixes (`58-ios.js`, all feature-detected):** 🔊 Read to me falls back to a voice built into the device (`speechSynthesis`,
  local voices only; `speakText()` in 34); 🔊 sound plays like a game's (`audioSession` playback) and also unlocks on touchend/click;
  🔮 the marble maze asks for tilt with a 📱 Tilt button; 💾 the backup file goes through the share sheet (Save to Files);
  📷 pictures open big to press and hold (Save to Photos); no pinch or double-tap zoom; the top bar stays clear of a notch.
- **📳 iPhone haptics:** iPhones have no `navigator.vibrate`; `vibrate()` calls `iosTick()`, which flips a hidden
  `<input type=checkbox switch>` (iOS 18+ taps). iPads have no buzzer. One of the children has an iPhone, so it is in.
- **No save changes**, no Android wrapper changes. The smoke test checks the offline file list, the manifest, the icon and the iOS paths
  (faked in the desktop browser with `IOS_FAKE`). To try on a real device after merging: see `docs/IOS.md`.

#### v1.54 plan details: 🙈 Pet Hide & Seek + 🎾 Fetch (agreed 2026-11-20, built)
Why: the pet can only be patted, fed and dressed, so after the tricks are learned there is nothing to *do* with it. Hide &
Seek and Fetch are short, no-fail games in the room she has decorated, so every decoration becomes a hiding spot or
something to throw past. Both work for all four children (the 3-year-old can find a pet whose ears stick out).
- **The way in:** the pet menu (tap the pet) gets two big buttons at the top: 🙈 **Hide & Seek** and 🎾 **Fetch**. They show
  only once she has picked a pet. Both play in whichever room is on screen (all 4 rooms). Not while decorating or in 🔍 I Spy.
  While a game is on, the top bar and room tabs hide (like I Spy) and a small card at the top shows the game with a ✖ Stop
  button; Back, Stop or leaving the room ends it quietly.
- **🙈 Hide & Seek:**
  1. Fuzzy says "Close your eyes! 🙈" and a soft curtain covers the room picture for a short count (1… 2… 3…, about 2 s,
     with little footstep sounds). Then "Ready or not! 🐾".
  2. The pet has hidden behind one thing in the room: a **standing decoration** or a **built-in floor piece** (closet, desk,
     tree, shed…) big enough to hide it. Spots come from the drawn room, the same way 🔍 I Spy finds things (`spyThings`,
     `spySeen`), so every new decoration is a hiding spot automatically. Wall items and rugs are left out.
  3. A bit of the pet **peeks out** from the side of its spot: ears, a tail or a wing tip, with a small wiggle every few
     seconds. At 🌙 night it is two little glowing eyes instead (cute, not scary).
  4. She taps things. A wrong spot gives a little shake and "Not here! 🤭" (nothing is counted). After 3 wrong taps the right
     spot sparkles. Found: the pet pops out with a trick and floats ❤️❤️ **+2 hearts**. 🔁 Again picks a different spot.
  - A room with fewer than 3 hiding spots: Fuzzy says "Put out a few more things first! 🛋️" (like I Spy). The bare Studio has
    no built-ins, so it needs a few decorations first.
- **🎾 Fetch:**
  1. A toy appears in Fuzzy's hand. She **swipes** (or taps a spot on the floor) to throw it. A longer swipe throws farther;
     the toy arcs, lands on the floor area, bounces a little and rolls to a stop (it bounces back off the room's sides).
  2. The pet runs to it (pets that fly, like the bat and the ghost kitten, float), picks it up and trots back, drops it at
     Fuzzy's feet and wags: **+1 heart**. Every 5th fetch in a row it shows off a trick it knows. It always brings it back.
  3. **Fetch toys:** 🎾 Ball (free), and 3 to buy, a new thing to spend coins on: 🦴 Squeaky Bone (6), 🥏 Star Disc (10,
     glides farther) and 🧶 Yarn Ball (8, leaves a short wiggly string trail). Owned as `pettoy:<id>`; a 🎾 toy row in the
     Fetch card switches toys (buying goes through `tryBuy`, so Easy mode and the PIN work as usual).
- **Hearts:** finds and fetches only add hearts (tricks unlock sooner); nothing is ever lost. No coins.
- **Stickers** (🏠 Room & Style page): 🙈 Found You! (first find), 🔎 Seek Champ (25 finds), 🎾 Good Catch (first fetch),
  🥏 Fetch Fan (50 fetches). 133 in all.
- **Not in this PR:** no 🦮 walks (v1.55), no two-player hide & seek, no pet hiding by itself when she isn't playing.
- **Light on the device:** no main loop. The pet is moved as one group with CSS transforms (the throw and the run use a short
  `requestAnimationFrame` only while the toy is moving, then stop). The `#fuzz` filter is never redrawn; the pet has none.
- **Code:** a new file `55-petplay.js` (+ a little markup, styles). While a game is on, the room's click handler hands taps to
  it (like `spyTap`). The pet is drawn at its hiding spot just *behind* that thing in the floor layer, so the thing covers it.
  Save version 34 → 35: `pet.toy` (the fetch toy, default `ball`), `stats.seeks`, `stats.fetches`; defaults in `normalize()`,
  old backups still restore. Toy ids are saved: never rename them.
- **Smoke test:** the 🙈/🎾 buttons only with a pet; Hide & Seek in every room with enough things: the pet is behind a real
  spot and a peek part shows (`spySeen`-style check), a wrong tap counts nothing, the hint after 3, a find gives +2 hearts and
  a new spot on 🔁; too few things says so; Fetch: a throw lands inside the floor area, the pet brings it back, +1 heart; toys
  buy and switch; no coins change; the 4 stickers; I Spy, decorating and the room tabs still work; speed and spelling checks pass.
- *Changed while building:* a room needs only **2** hiding spots (a new Loft has just the keyboard and the computer desk). The pet
  can also hide higher up, behind a solid part (the monitor, the keyboard, the closet top), because a desk or keyboard stand has open
  legs. At least 8% of the pet peeks out (16% in Easy mode, so the little ones find it), and at most 45%. The 🌙 button hides while
  a game is on (like the room tabs), so the lights can't change mid-game.

#### v1.55 plan details: 🦮 Pet Walks (agreed 2026-11-20, built)
Why: pet play in the room stays in the room. A walk takes her buddy and the pet somewhere new, with little things to
discover and collect. It is calm, has no wrong answers and suits the little ones as much as the older two.
- **The way in:** 🦮 **Walk** in the pet menu (next to 🙈 and 🎾). It opens a new screen, `scr-walk`. Back goes to the room.
- **1. Pick a path:** 4 big picture cards, all free: 🌼 **Flower Meadow**, 🦆 **Duck Pond**, 🏘️ **Town Sidewalk** and
  🌙 **Starry Path** (fireflies and a big moon; cozy, not dark). Each shows how many of its finds she has (🧺 3/8).
- **2. Walk:** a side view. Her buddy and the pet walk along the path while the scenery slides by (2–3 layers, the far ones
  slower). **Hold the big 👣 button** (or the path itself) to walk; let go to stop and look around. Now and then the pet
  stops and sniffs: a "❗" bubble and a bush, puddle or patch of grass wiggles. Tap it and the pet digs or pokes in and finds
  something: a **find** card pops up ("🐚 A spiral shell!"). Visitor friends sometimes wave from the path (just for fun).
  A walk has 5 sniff spots; then the path reaches a bench and home: "What a lovely walk! 🐾" **+3 hearts**, and +1 heart a find.
- **3. Finds:** 8 per path, 32 in all, all original little drawings (for example the meadow: daisy, ladybug*, butterfly*,
  four-leaf clover, feather, acorn, smooth stone, lost ball; the pond: spiral shell, duck feather, frog*, lily flower, pebble
  heart, cattail…). *Animals are "seen", not taken: "Hello, little frog! 🐸 Bye bye!".* A sniff spot picks a find she
  doesn't have yet when there is one (so a path fills in about 2 walks), then any find from the path. The 🧺 **Walk Finds**
  book (a button on the path picker) shows all 32 as gray shapes until found; tapping one says its name.
- **Prizes:** all 8 finds of a path give that path's **treasure jar** decoration (🫙 Meadow Jar, Pond Jar, Town Jar,
  Star Jar; `award:1`, never in the Shop), which goes to My Stuff for her to place in any room.
- **Stickers** (🏠 Room & Style page): 🦮 First Walk, 🧺 Collector (all finds of one path), 🌟 Treasure Hunter (all 32).
  136 in all.
- **Not in this PR:** no leash or "pull" (the pet always walks with her), no walking the pet in the Backyard picture, no coins.
- **Light on the device:** no main loop. The scenery is a few wide SVG strips moved by CSS transform animations that pause when
  she lets go (`animation-play-state`); her buddy is drawn once into a picture (like the Dance Maker and Runway) and bobs with CSS.
- **Code:** a new file `56-walk.js` (+ screen markup in `index.html`, styles in `app.css`). Paths and finds are lists
  (`WALK_PATHS`, `WALK_FINDS` with a `d()` drawing each). Save version 35 → 36: `walk{path, finds[]}` (find ids), `stats.petWalks`,
  `stats.finds`; defaults in `normalize()`, old backups still restore. Path ids, find ids and jar keys are saved: never rename
  them; new finds go at the end of their path.
- **Smoke test:** open a walk from the pet menu; every path draws and walks (a test switch skips the wait); 5 sniff spots then
  home with the right hearts; a find card for each spot, new finds first; the Walk Finds book; all 8 finds of a path give its
  jar once (into My Stuff); no coins change; the 3 stickers; every find drawing parses as XML; speed and spelling checks pass.
- *Changed while building:* the first sticker is called 🦮 **Walk Buddy** (the Runway already has a "First Walk"). On an upright phone the
  scene keeps its shape at the bottom with more sky above, so the buddy, the pet and the bush always stay on screen.

#### v1.52 plan details: 🎸 Stage Jam (agreed 2026-11-20)
Why: the Music Maker makes loops, but a loop can only be listened to. The Stage only plays fixed songs. Jam joins the two:
her own loop becomes the band, and she plays on top of it, like a real show. It works for all four children, because
nothing can sound wrong. Owner's answers (2026-11-20): **jam over her loop** (not a tap-along chart made from the loop);
Jam and Trick Shots are **two PRs**.
- **The way in:** a 🎸 Jam tab in the Stage's tabs (after 💃 Dance), and a 🎸 Jam button in the 🎹 Music Maker next to
  💃 Dance (it takes the loop on the grid straight to the Stage). Back goes to where she came from (Stage songs or Music Maker).
- **1. Pick the band:** big loop cards with the small grid picture the Music Maker already draws (no reading needed):
  🎹 My loop now (the loop on the Music Maker's grid, if it has notes), her saved loops 1–3 (empty slots are left out), and the
  3 ready-made ideas (🦇 Bat Bop, 🐰 Bunny Hop, ⭐ Sleepy Stars). Each loop plays with its own kit and speed.
  A row of 3 **jam sounds** to play with: ✨ Sparkle (bells), 🎸 Pluck (a guitar-like pluck), 🎺 Toot (a soft horn). All free.
- **2. Jam:** the Stage scene she knows (her 🎨 backdrop, spotlights, the light row flashing on the beat, her buddy bouncing).
  The loop plays round and round. **5 big pads** in a row at the bottom, colored like the Music Maker's note rows, playing
  the same 5 notes (C D E G A; ✨ Sparkle plays them an octave higher, like bells). Those 5 notes always fit together, so any tap sounds
  right. A tap lights the pad and sends a little note shape floating up toward her buddy; the spotlights take that pad's color.
  Every 16 notes the crowd cheers with a short word (✨ "Wow!", 🔥 "On fire!", 🎉 "Encore!"). No falling notes, no score,
  no "Oops", no timer: she plays as long as she wants. Slide a finger across the pads to play a run (a glissando).
- **3. Stop:** ⏹️ Stop (or Back) ends the jam with a small cheer box: "Great jam! 🎸" and how many notes she played.
  A jam with at least 20 notes pays **+2 coins, 3 jams a day** (6 coins, like the Music Maker's 3 a day). After that it
  still plays, with one gentle note. No coins for a jam under 20 notes, but it still gets the cheer.
- **Stickers** (🎤 Stage page): 🎸 First Jam (one jam of 20+ notes), 🎶 Jam Band (10 jams), 🎹 My Own Song (jam over one of
  her own saved loops). 126 in all. *Changed while building:* the loop on the grid counts as her own too.
- **Not in this PR:** no recording of the jam, no two-player jam, no notes snapped to the beat (a delay feels slow on a
  tablet), no Dance Maker link.
- **Light on the device:** the Stage is already a main-loop screen (`LOOP_SCREENS`); the jam draws in the same canvas and
  only while the Stage is open. The loop is scheduled a little ahead on the audio clock with the Music Maker's voices
  (`muVoice`), so the band never drifts from what she hears. The buddy picture moves as a whole (the `#fuzz` filter isn't redrawn).
- **Code:** a new file `53-jam.js` (+ a little markup in `index.html`, styles in `app.css`). `drawStage()` hands over to
  `drawJam()` while `STG.state==='jam'`, and the canvas taps go to `jamTap()`. Save version 32 → 33: `jam{sound, pay{day,n}}`
  and `stats.jams`, `stats.jamOwn`; defaults in `normalize()`, old backups still restore. Song stars and bests never change.
- **Smoke test:** open Jam from the Stage tabs and from the Music Maker; every loop card plays (the loop's notes are scheduled);
  each jam sound plays; taps on all 5 pads; Stop pays +2 for 20+ notes and nothing under 20; the 3-a-day limit; the 3
  stickers; leaving the screen stops the loop; speed and spelling checks still pass.

#### v1.53 plan details: 🎯 Soccer Trick Shots (agreed 2026-11-20)
Why: Kick and Keep are both "5 shots against a keeper". Once she wins the trophies, there's nothing new to learn, and the
curve she can put on the ball (a bent swipe) is never needed. Trick Shots are little fixed challenges that teach aiming, height
and curve, with no keeper and no failing. Owner's answers (2026-11-20): **a fixed trick list**, its own PR after Jam.
- **The way in:** a 🎯 Tricks tab next to ⚽ Kick and 🧤 Keep (remembered like those: `soccer.mode` = `trick`). The level tabs
  hide in Tricks mode; instead a big card at the top names the trick ("⭐ Hit the star!") with a ◀ ▶ to change trick and a
  🎯 button for the picker (a popup with all 12 tricks as pictures, ✅ on the done ones). Every trick is open from the start.
- **How a trick plays:** the same field, goal, ball and swipe as ⚽ Kick (tap the goal for a straight shot, swipe for power,
  a bent swipe for curve). No keeper in goal. The keeper friends Mochi, Boo and Flap stand at the side and cheer, or
  stand together as a **wall** in front of the goal in the wall tricks. Unlimited tries, nothing counted against her. A miss
  just says "So close! Try again ⚽". After 3 misses on the same trick, a dotted 💡 hint line shows one swipe that works.
- **The 12 tricks** (about easiest to hardest):
  1. ⭐ Star Kick: a big star in the middle of the goal.
  2. ↖️ Top Corner: a star in the top-left corner.
  3. ↘️ Low and Right: a star low in the right corner (a soft kick stays low).
  4. 🍩 Hoop Shot: kick through a ring hanging in the goal.
  5. 🎈 Balloon Pop: 3 balloons across the goal; pop all 3 (a popped one stays popped, misses are free).
  6. 🔔 Ring the Bell: hit the crossbar where a bell hangs (a "hit the bar" is the goal here!).
  7. 🧱 Over the Wall: the 3 friends stand in the middle; chip the ball over them into the goal.
  8. 🌀 Curve It: the wall stands on the left; bend the ball around it into the left side of the goal.
  9. 🎯 Moving Star: a star slides slowly from side to side.
  10. 🦇 Bat Hoop: a ring held by a little bat that floats up and down.
  11. 🍌 Banana Kick: the wall and a hoop behind it; curve around the wall and through the hoop.
  12. 🌈 Rainbow Row: 3 stars (red, yellow, blue) to hit in order, left to right; a miss keeps the ones already hit.
- **Coins and prizes:** +3 coins the first time each trick is done (36 in all), and **+1 each replay, 10 a day**. Doing all 12
  gives a 🏅 **Trick Shot Star** (a prize decoration, `award:1`, never in the Shop) in the **Backyard**, next to the gloves.
  The ⚽ Kick kit bonus (+1 with 2+ soccer clothes) does not apply here.
- **Stickers** (⚽ Soccer page): 🎯 First Trick, 🍌 Banana Kick (a curve trick: 8 or 11), 🏅 Trick Master (all 12). 129 in all.
- **Not in this PR:** no trick shots in 👯 Duel, no made-up (🎲) tricks, no keeper in tricks.
- **Light on the device:** the Soccer screen is already a main-loop screen. Tricks reuse the field, net, posts, ball and the
  keeper drawings (drawn flat on the canvas, no `#fuzz`). Targets are a few simple canvas shapes.
- **Code:** a new file `54-tricks.js` (+ a little markup, styles). `drawSoccer()` hands over to `drawTrick()` in Tricks mode,
  the canvas pointer handlers to the trick ones, and shots use the same swipe maths (`socAim`) and ball path (`ballPos`).
  A wall is checked where the ball passes it (its height and the curve's bend at that point). Tricks are text recipes in
  `TRICKS` with ids `t1`…`t12`, saved in `soccer.tricks[]`: never rename them; new tricks go at the end. Save version 33 → 34:
  `soccer.tricks[]`, `soccer.trick` (the trick on screen), `soccer.trickPay{day,n}`, `stats.tricks`; defaults in `normalize()`.
  An older app that restores a backup with `soccer.mode='trick'` simply opens ⚽ Kick.
- **Smoke test:** open 🎯 Tricks; for every trick, a fixed shot is proven to work (like the keeper shots) and a plain straight
  shot is proven not to work where the trick needs curve or height; Balloon Pop and Rainbow Row need all three; +3 the first
  time, +1 replays and the 10-a-day limit; all 12 gives the Trick Shot Star in the Backyard once; the 3 stickers; ⚽ Kick,
  🧤 Keep and 👯 Duel still work; speed and spelling checks still pass.
- *Changed while building:* 🔔 Ring the Bell is a bell hanging just under the crossbar (a swipe can't reach the bar itself, only a tap can);
  the 🌀 and 🍌 walls are wider and lower than first drawn, so the three friends stand side by side instead of in a pile (they still
  block every straight shot; the smoke test checks every one). On a phone the 🎯 tab shows only its icon, like 👯.

#### v1.51 plan details: 👠 Runway (agreed 2026-11-20)
Why: dressing up has no goal. She owns many clothes (112 in the Closet) but nothing asks her to put an outfit together.
Runway gives every outfit a reason and a little show, and works for all four children. Owner's answers (2026-11-20):
her own clothes **plus a 👜 Borrow rack**; the judges hold up **cheer cards**; **+3 coins a show, 15 a day**; a **👠 Runway
button in the Closet**.
- **The way in:** a big 👠 Runway button in the Closet, next to 🎲 Surprise me. It opens a new screen, `scr-runway`.
  Back goes to the Closet.
- **1. Pick a theme card:** 3 big cards at a time (🔀 shows 3 others). About 14 cards, each tied to theme chips, for example
  🦇 Spooky Night (Emo), ☁️ Cloud Picnic (Cute), ⚽ Game Day (Sport), 🎤 Concert Star (Stage), 🚀 Space Day, 🦕 Dino Day,
  🤖 Hero Training, 🧁 Cafe Date, 🐚 Beach Day, 🐮 Farm Fair, 🚗 Road Trip, 🍵 Cozy Sleepover, 🌌 Spooky Space (Emo + Space),
  and ✨ Anything Goes (no theme, always the biggest cheer; good for the little ones). Every card's theme has clothes in at
  least 3 closet categories (the smoke test checks).
- **2. Dress:** her buddy on the left, closet tabs on the right (no Buddy/Fur/Face tabs). It starts from her outfit. Clothes
  that match the card are listed first with a ✨. Clothes she owns are worn as usual; anything else shows 👜 and can be
  **borrowed for this show** for free. A row of 3 sparkles fills as matching pieces go on (no numbers). 🎲 Theme surprise
  dresses her in matching pieces with one tap (great for the younger ones).
- **3. Walk:** 🚶 Walk! The buddy struts down a drawn catwalk under spotlights, turns, poses and walks back (about 4 s), to a
  short generated runway beat. Three of the six visitor friends (Mochi, Boo, Flap, Hop, Bolt, Zip) sit by the catwalk and
  then hold up cheer cards: 0 matching pieces 💖💖💖 "So cute!", 1 💖🌟💖, 2 🌟🌟🌟, 3 or more 🤩🤩🤩 with confetti.
  **Every walk gets cheers**; there is no score, no number and no "try again".
- **4. After the show:** +3 coins (15 a day, `RW_DAILY`; after that it still plays, with one gentle note). Buttons:
  🔁 Another card, 👗 Wear it home (puts on only the pieces she owns; borrowed ones go back to the rack), 🏠 Done.
  Her saved outfit never changes unless she taps Wear it home, and borrowing never adds anything to `owned`.
- **Stickers** (🏠 Room & Style page): 👠 First Walk (one show), 🌈 Theme Hopper (8 different cards), 🤩 Crowd Favorite
  (three 🤩 cards). 123 in all. *Changed while building:* Crowd Favorite counts 🤩 on themed cards only (✨ Anything Goes
  always gets 🤩, so it would be too easy).
- **Not in this PR:** no visitor wish (each friend has exactly 3 wishes; see v1.50), no photocard from the show, no two-player.
- **Light on the device:** no main loop. The buddy is drawn once into a picture (like the Dance Maker), so the `#fuzz`
  filter is not redrawn while it walks; the walk, confetti and cheer cards are CSS animations. Judges are drawn once, flat.
- **Code:** a new file `52-runway.js` (+ screen markup in `index.html`, styles in `app.css`). Save version 31 → 32:
  `runway{pay{day,n}, cards[]}` (cards walked, for Theme Hopper) and `stats.walks`, `stats.wows`; defaults in `normalize()`,
  old backups still restore.
- **Smoke test:** open Runway from the Closet; every card has matching clothes in 3+ categories; 🎲 Theme surprise gives 3+
  matching pieces; borrow, walk (a test switch skips the wait) and check the cheer level, +3 coins and the 15-a-day limit;
  borrowed pieces are not owned and the outfit is unchanged; Wear it home keeps only owned pieces; the 3 stickers; speed and
  spelling checks still pass.

#### v1.50 plan details: 🪙 New things to spend coins on (agreed 2026-11-19)
Why: the last few PRs added many ways to earn coins (Garden, I Spy, Dance Maker, 🧸 Play, Free Play) but nothing new to
buy, so coins pile up with no goal. This adds about 25 new things across three places. Owner's answers: one PR; the museum
is display pieces she arranges herself (not cases that fill themselves). Everything is a normal one-time buy with the
usual helpers (`tryBuy`/`buyConsumable`, Easy buy box, `priceTag`), all prices 6–35 (no new big dreams).
- **🏠 Pet homes** (instead of the cushion bed under the pet, in every room):
  - The pet menu gets a 🏠 Home button next to 🎀 Dress-up, with the same kind of picture picker. The cushion stays free.
  - 8 homes to buy: 🦇 Bat Tent (15), ☁️ Cloud Bed (12), ⭐ Star Dome (18), 🏡 Tiny Cottage (20), 🚀 Rocket Pod (25),
    🥚 Dino Egg Bed (22), 🐚 Seashell Bed (15), 🏰 Mini Castle (30).
  - A home stays inside the pet's spot (about the size of the cushion's tap area), so it never covers the buddy or the trophies.
  - Saved: `pet.home` (`''` = the cushion), owned as `pethome:<id>`.
- **🎤 Stage backdrops** (behind the lanes while a song plays):
  - A 🎨 Backdrop row of round picture buttons under the song list. Tap one she owns to use it, a new one to buy it.
  - 7 to buy, plus today's look (✨ Classic, free): 🌙 Starry Night (10), 🍭 Candy Clouds (12), 🦇 Bat Castle (15),
    🐠 Under the Sea (15), 🦖 Dino Jungle (15), 🌌 Galaxy (18), 🌃 Neon City (20). Spooky stays cute.
  - The spotlights and beat lights stay on top. A backdrop is drawn once into a hidden canvas (again only when the screen
    size changes), so each frame only copies one picture: no extra work for the tablet. Stage Together uses it too.
  - Saved: `stage.backdrop` (`'classic'` by default), owned as `backdrop:<id>`.
- **🏛️ Museum pieces** (decorations in the Shop, with a new 🏛️ Museum theme chip; the ✨ Studio is a natural museum):
  - Standing: Pedestal (10), Tall Pedestal (14), Display Counter (25), Velvet Rope (12), Museum Bench (15),
    Dino Bones (35, a friendly model skeleton). Wall: Wall Case (20, a shelf), Gold Frame (15), Spotlight (12, glows at night),
    Museum Plaque (6, "⭐ My Collection").
  - Pedestals and the counter work like shelves: a trophy, glove, plush, pot or anything standing dropped on top sits there
    and moves with it. New: things on a standing shelf are drawn just in front of it (today only wall shelves exist).
- **Extras:** 3 stickers (a pet home, a backdrop, 3 museum pieces). The museum pieces count for 🔍 I Spy by themselves.
  *Changed while building:* no new visitor wish. Each friend has exactly 3 wishes and leaves a plush after all 3, so a 4th
  wish would have moved a plush further away. A museum wish can come with a future set of wishes.
- **Code:** a new file `51-spend.js` (split into a second file if it passes ~40 KB). Save version 30 → 31 (`pet.home`,
  `stage.backdrop`), defaults filled in by `normalize()`; old backups still restore.
- **Smoke test:** buy and show each pet home; buy, pick and play a song with each backdrop; put a trophy on a pedestal and
  check it is drawn in front and moves with it; the new wish can be met; speed and spelling checks still pass.

#### v1.49 plan details: 🔍 I Spy (agreed 2026-11-19)
Why: her room fills up as she decorates, but nothing asks her to look at it again. I Spy turns whatever she has built into
a finding game that never runs out (every new thing is a new thing to find). Owner's answers: build the plan as written; at night it
becomes a 🔦 flashlight game.
- **The way in:** a round 🔍 button on the room picture, right of 🌙 (the top bar is full). It works in all 4 rooms and hides
  while decorating.
- **Play:** a clue card takes the top bar's place: "Find the Bat Lamp!". She taps the thing; a tap on it or close to it
  counts. It sparkles and the next clue comes. A wrong tap only says "👀 Keep looking!" (no timer, no score). 💡 makes the
  right thing shimmer, 🔊 says the clue, ✖ (or Back) stops. While I Spy is on, tapping furniture doesn't open anything.
- **Clue levels** (remembered; Easy mode is always ⭐): ⭐ picture + name, ⭐⭐ name only, ⭐⭐⭐ a theme hint
  ("something 🦇 spooky"): any thing with that theme chip counts.
- **What can be spied:** the decorations on screen plus the room's own furniture (by its hotspot) and the pet. Things too
  small to tap or hidden behind others are skipped. A room needs at least 3 things ("Put out a few more things first!").
- **Rounds and coins:** 5 finds a round (fewer in a room with fewer things), then a cheer box (🔁 Again / 🏠 Done).
  +2 coins a round, 10 a day (`SPY_DAILY`); after that it still plays, with one gentle note.
- **🌙 Night:** a dark layer with one 🔦 circle of light that follows her finger (bigger in Easy mode); lamps still glow a little.
- **Stickers** (🏠 Room & Style): 🔍 Sharp Eyes (a round), 🕵️ Super Spy (100 things found), 🗺️ Spy Everywhere (a round in all 4 rooms).
- **Light on the device:** no main loop. Sparkles and the hint ring are short CSS animations; only the flashlight circle moves.
- **Save:** `spy{lvl, rooms[], pay{day,n}}`, `stats.spied`, `stats.spyRounds`. Save version 30 (`normalize` + `MIGRATIONS[30]`).
  Older backups restore with nothing spied yet.
- **Files:** new `50-ispy.js`, the 🔍 button and clue card in `index.html`, CSS in `app.css`, small hooks in sections 9, 31 and 99.
- **Smoke test:** every room, right and wrong taps (also a real mouse tap), 💡, a round paying +2 and the daily limit, the
  levels and theme hints, Easy mode, the flashlight, too few things, ✖ and Back, stickers, phone layouts, backups.

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
    (`FREE_DAILY`, shared by all the games; since v1.57 the Brain Games in `FP_THINK`, all but Memory Match, pay +2 with no cap), then one gentle note ("Free Play coins are full for today! Keep playing for
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

### Phase 13: ⚾ Ball Field (plan agreed 2026-11-21)
The owner asked for baseball mini-games like the Soccer ones. Owner's answers: **all four games** (Batting, Catch, Home Run Derby,
Duel for 2); opened from **a new built-in Backyard piece** (a bat rack); **a small set of baseball clothes and decorations** with a
team-kit bonus, prizes and stickers; **new original animal characters**. Four stacked PRs, one game each:
- ✅ **⚾ Ball Field + Batting (v1.60, built):** plan details below.
- ✅ **🧤 Catch (v1.61, built):** like 🧤 Keep. A hitter (Easy 🐢 Tilly, Medium 🐨 Momo, Hard 🦓 Zippy) hits fly balls and grounders; a shadow
  shows where it lands; drag the glove there. Fixed lists (`CATCH_HITS`, 15 per level, 5 a game), all proven catchable. +1/+2/+3 a
  catch, +1 with the kit, +5 for 5/5; a 5/5 wins a Bronze/Silver/Gold Pennant (`pennantBronze` …). A sticker.
  As built (`61-catch.js`): the hitter tosses and hits it (a fungo, no pitcher); the view is from the outfield looking in; a ring on the
  grass marks where it comes down; the buddy runs toward the finger at the hitter's `speed` and catches when within `reach`
  (`ctCanCatch` proves every hit from the far side). Fly balls, line drives, pop-ups and grounders. Pennants hang on the fence top.
- ✅ **🎯 Home Run Derby (v1.62, built):** like 🎯 Trick Shots. 12 fixed challenges (`d1`…`d12`: hit the ⭐ sign, pop the 🎈, ring the 🔔, two in
  order…); timing aims left/right, where you tap aims high/low; each has a proven `sol` and a 💡 hint. +3 the first time, +1 a replay,
  10 a day; all 12 = the ⚾ Golden Ball. A sticker.
  As built (`62-derby.js`): the batting view with 🐧 Pip pitching one slow, straight pitch; no level tabs, a challenge bar (◀ name ▶, the
  Trick Shots picker) instead. A swing is `{a, l}`: `a` from the timing (±`HR_AW` = 0.4 s = all the way left/right, more = no contact),
  `l` from the tap height. The ball flies on a fixed path (`hrPath`); a challenge's targets sit on its own `sol` path, so `hrJudge`
  (the rules, no drawing) proves every one. Targets: star sign, balloon, bell on a post, hoop, bucket (where it lands), fence (a homer,
  one side or any). The 💡 shows after 3 misses: the dotted path and a 👆 at the tap height.
- ✅ **🦓 Tougher Medium and Hard (v1.63, built, asked by the owner 2026-11-21):** Batting windows Medium ±0.045/0.09/0.14 s, Hard
  ±0.03/0.065/0.1 s (home run/hit/foul). The help ring (Batting's circle, Catch's landing ring) shows on Easy and in Easy mode;
  on Medium it fades in late, on Hard there is none (Catch draws a darker ball shadow instead). Catch on Medium and Hard adds depth:
  each hit has `v` (0 = her line, 1 = `CT_ZMAX` in toward home); the finger's height on the grass sets how far in she runs, and the
  buddy is drawn higher and smaller there. Run speed 1.75 / 1.9, glove 0.2 / 0.18 (eased twice after the owner's phone tests;
  first try: 1 catch in 15 on Hard); hang times are set so every hit is catchable from the worst corner with little to spare (`ctCanCatch` from all 4 corners). Easy is unchanged. No save changes.
- ✅ **👯 Batting Duel (v1.64, built):** one pitches, one bats on the same tablet, 5 each, then swap; pays through `tgPay` only, never changes
  bests or prizes (`p.duo.ball`).
  As built (`63-ballduel.js`): they swap after every pitch (10 in all). The pitcher picks a pitch with buttons (`BD_PITCHES`: Slow, Fast,
  + Floater on Medium, + Curve on Hard); their buddy stands on the mound as an SVG. The batting rules are section 59's, through hooks
  (`bfDuel()`; `bfLvl()` gives `BDL.lvl`, so the level tabs set speed and timing; Easy mode's help is off). It also carries the
  second Catch easing (Medium 1.75 / 0.2, Hard 1.9 / 0.18), which wasn't merged with #65.
  Fix (v1.65): a duel started after Catch or Derby now always uses the batting view (found on the owner's phone).

#### v1.60 plan details: ⚾ Ball Field + Batting (agreed 2026-11-21, built)
- **Where:** a built-in bat rack and ball bucket in the Backyard (`data-hot="ballfield"`, recolorable as `FURN_PIECES.rack`), between
  the buddy and the chalkboard. It opens `scr-ball` (`59-ballfield.js`); Back goes to the Backyard. The main loop draws it (`LOOP_SCREENS`).
- **The view:** from behind home plate, field points `(x across, z out to the fence)` turned into the screen by `bfPt()`; the sky,
  stands, fence and field are drawn once per screen size into a hidden canvas. Her buddy (an SVG over the canvas) holds a bat that
  swings with a CSS animation.
- **Batting:** tap for the pitch (the pitcher winds up), tap again to swing. `bfJudge(level, d)` turns the swing time into a ⭐ home
  run, a hit (early = left, late = right), a foul or a miss; windows get smaller per level and wider in Easy mode. 6 pitches a game,
  no strike-outs, no timer. Pitches are fixed lists (`BAT_PITCHES`, 18 per level, 6 a game in turn): straight, floaters and curves.
- **Coins:** +1/+2/+3 a hit, +2 a home run, +1 with 2 of the ⚾ kit (cap, tee, pants, socks, Soccer Cleats), +5 for 6/6.
  A 6/6 gives that level's Bronze/Silver/Gold Bat once (`batBronze` …, `award:1`) in the Backyard.
- **Extras (`60-ballpack.js`):** 4 clothes and 4 decorations, all ⚽ Sport; the Baseball Lamp glows at night. 3 stickers on the
  Sticker Book's Soccer page, now named Sports (the page id stays `soccer`).
- **Save version 37:** `ball{mode, bat{level, best, prizes}, catch{…}, derby{cur, done, pay}}`, `stats.hits/homers/catches/derbies`.
  All the later games' fields are added now, so v1.61–v1.64 need no new save version.

### ✅ Phase 14: Before the hand-over (design review 2026-11-23, done)
A whole-app review before the children get the app; the findings, the owner's answers and the ranked ideas are in
`docs/DESIGN-REVIEW.md`. Agreed order (2026-11-23): ✅ v1.67 daily caps (built) → ✅ v1.68 🧤 Catch on Hard (reading the ball: bat
sound, grass stripes, a shadow trail, no memorizing) → ✅ v1.69 first-time setup + level bands (built) → ✅ v1.70 spoken instructions (built) →
✅ v1.71 🧸 Little mode (built). Each gets its own plan first.

#### v1.67 plan details: fair daily coins (agreed 2026-11-23, built)
**Why:** the games that pay for every goal, save, hit, catch or star had no daily limit, and ⚾ Batting (added last) pays the
most: up to 41 coins in a one-minute game on Hard and 29 on Easy. The owner chose **one allowance per game**, so that each day it
pays to go around the app, and said that **first-time wins never count toward it**.

**The rule (the same everywhere):**
- Coins paid *per play* (a goal, a save, a hit, a catch, a song's stars, a maze replay) come out of that game's own daily allowance.
- **Outside the allowance (always paid):**
  - The **first** perfect game on each level (+5, the one that wins the trophy, glove, bat or pennant). Owner's choice
    (2026-11-23): repeat perfects still pay +5, but from the allowance, so Easy perfects can't be farmed.
  - Anything else that is a first: a new Trick Shot or Derby challenge; a new Code Lab or Brain
    Games puzzle and its level bonus; a new marble maze and the all-mazes bonus.
  - On the Stage, the coins for **new stars**: stars above the best already reached on that song and level.
    Example: the first time she gets 2 ⭐ on Medium, 2 × 3 = 6 coins, outside. Later 3 ⭐ on the same song and level gives 3 more, outside.
    A replay that only matches her best counts toward the allowance.
- After the allowance is used up, the game works exactly as before (scores, bests, prizes, stickers), just without per-play
  coins. One gentle note a day per game, which suggests somewhere that still pays today, for example
  "⚾ Batting coins are full for today! Try 🎤 the Stage or 🧠 Brain Games ✨" (Easy mode: "🪙 ✔ Try 🎤 🧠").
  It refills quietly the next day (no countdown, nothing lost).
- If a goal is worth more than what is left, she gets what is left (like `fidEarn`).

**Which games, and the proposed numbers:**

| Game | Per play now | New daily allowance | Where it is saved |
|---|---|---|---|
| ⚽ Soccer Kick | +1/+2/+3 a goal, +1 with the kit | 20 | `soccer.pay {day, n}` |
| 🧤 Be the Keeper | +1/+2/+3 a save, +1 with the kit | 20 | `soccer.keep.pay` |
| ⚾ Batting | +1/+2/+3 a hit, +2 a home run, +1 with the kit | 20 | `ball.bat.pay` |
| 🧤 Catch | +1/+2/+3 a catch, +1 with the kit | 20 | `ball.catch.pay` |
| 🎤 Stage | 2/3/4 a star (Easy/Medium/Hard) | 20 | `stage.pay` |
| 🔮 Marble Maze replays | +1 a replay | 10 | `maze.pay` |

20 is about one to three games' worth, depending on the game and level. With the existing allowances (fidgets 30, Art 25,
Runway 15, two-player 15, Trick Shots 10, Derby 10, I Spy 10, 🧸 Play 10, Free Play 10, Music/Dance/Jam a few each,
+10 daily gift), a child who visits everything can still earn well over 150 a day. Prices are 0–40, big dreams 60–100.

**Already like this, no change:** Trick Shots and Derby (first time outside, replays capped at 10); Code Lab and Brain Games
fixed puzzles (pay only the first time); two-player games (`tgPay`, 15 a day); fidgets (`fidEarn`); Art, Music, Dance, Runway,
I Spy, Jam, 🧸 Play, Free Play. **Brain Games Free Play's +2 stays uncapped** (owner's choice, so the thinking games keep paying).

**The "not enough coins" hint:** `needMore()` (section 8) now says "play on the Fidget Shelf" even when fidget coins are full.
It will name up to two places that still pay today (from the same list of allowances, Brain Games always counts), for example
"You need 7 more 🪙. Try ⚽ Soccer or 🧠 Brain Games!" Easy mode keeps the short "🔒 Need 7 more 🪙".

**🔊/🔇 sound button:** a round button in the room next to 🌙 📷 🔍 switches all sound on or off (`DB.settings.sound`; music
already stops without it). It hides with the others during 🔍 I Spy and pet play. Settings keeps its switches. The iPad audio
session stays `playback` (sound plays even with the mute switch on, as a game's does), so this button is how to make it quiet.

**How it's built:**
- One shared helper in section 8 (`08-ui.js`): `dayLeft(o, cap)` resets a `{day, n}` object when the day changed (by `fpDay()`,
  so the smoke test can set `FP_TEST_DAY`) and says what is left; `gameEarn(key, n, label, x, y)` pays up to what is left from
  `GAME_PAY[key]` (`{name, icon, cap, pay: p => the {day, n}}`) and shows the note once a day; plain `earn()` stays for coins outside
  the allowance. Later games (and, one day, the older copies of the same code) can use it too. The existing fields keep their names.
- Calls change in `13-soccer.js` (goal), `27-keeper.js` (save), `59-ballfield.js` (hit), `61-catch.js` (catch), `14-stage.js`
  (stars, split into new stars and the rest) and `19-fidgets2.js` (maze replay). A perfect bonus uses plain `earn()` when it wins
  that level's prize (the prize list didn't have the level yet) and `gameEarn()` otherwise.
- Save data: 6 new `{day:'', n:0}` fields with defaults in `normalize()`. Nothing is renamed or removed, so no new save version,
  and every older backup still restores.
- Smoke test: goals, saves, hits, catches, stars and maze replays stop paying exactly at 20/10 and pay again the next
  `FP_TEST_DAY`; a first perfect on a level, new stars and a first maze still pay after the allowance is used up, and a repeat
  perfect doesn't; a part
  payment when 1 coin is left; the note shows once; `needMore` names places that still pay; the 🔇 button flips the setting.
  Existing exact coin checks are updated where they play past the allowance.
- Docs: README, this plan, STATUS, the coin list in `CLAUDE.md`, a `GIFT_TIMELINE` entry, and the version (1.67) in the four places.

**Try on the tablet:** play ⚾ Batting until the note shows (coins stop, the game still works, the note names other places);
win a level's bat after that (its +5 still comes), then get another 6/6 on that level (no +5 today); try the 🔊/🔇 button; try to buy something you can't afford and read the hint;
the next day the coins come again.

#### v1.68 plan details: 🧤 Catch you can read (agreed 2026-11-23, built)
**Why:** the owner finds Hard Catch close to impossible, even for themselves, and doesn't want the "go here" ring back.
From the code (`61-catch.js`):
- **Where the ball lands across the field** shows early, but only faintly. The shadow moves in a straight line from home plate
  (`ctBallPt`: ground point `(u·e, 1 − e·(1 − ctZ(v)))`), but home is tiny and far away, so the first half second is hard to read.
- **How far in it lands** (`v`) hardly shows at all until the end. All landing spots are within `CT_ZMAX` = 0.15 of her
  line, so a deep ball and a short one look the same until the last moment.
- **The 15 Hard hits always come in the same order** (`CT.round`), so winning becomes remembering.

The fix gives her the cues a real outfielder uses. Nothing marks the landing spot.

**1. The bat tells how far (sound + a comic word).** When the hitter hits it, the crack depends on `v`:
- Deep (`v` < 0.34, her line or behind it): a loud, high **CRACK!**
- Middle: a **WHACK**
- Short (`v` > 0.67, she must run in): a dull, quiet **tok**

The same word pops up by the hitter for about half a second, big for CRACK!, small for tok. It works with the sound off, and
it's in the style of a comic. One of the 3 sounds and words for each hit; nothing new is saved.

**2. Mowed grass to judge against.** The outfield gets real mowing patterns, drawn once into the background (`ctBack`), so
they cost nothing per frame:
- **Wedges from home plate**: alternating light and dark lanes that fan out from home (about 6 lanes across her line). The shadow
  runs straight along its lane from the moment it leaves the bat, so "which lane" tells left or right early.
- **3 bands near her line** for how far in (her line, half way, all the way in), so the end of the flight is easier to judge.

The old faint bands stay farther out. The stripes are part of the field, like the foul lines; they don't light up or point anywhere.

**3. A short trail behind the shadow.** The last 5 shadow positions (along the same path, 0.04 of the flight apart), fading out,
so the shadow's direction is clear as soon as it starts moving. They're computed from the flight, nothing stored. Hard and Medium only
(Easy has the ring).

**4. No memorizing: fresh hits on Hard.** Each Hard game makes 5 new hits from a seed (`brRand`, like Free Play). A new rule
`ctHitOk(lvl, hit)` holds what every hit must meet, and the fixed lists must pass it too:
- Inside the field (`|u| ≤ CT_U`, `v` 0..1).
- Catchable from all 4 corners (`ctCanCatch`).
- Tight: 0.1–0.55 s to spare from the worst corner, unless it's as slow as its kind allows.
- Never faster than its kind allows (fly 1.2 s, line drive 0.95, pop-up 1.5, grounder 1.2).

The maker picks a kind, a side, a depth and a spare time (0.15–0.45 s). A game must have at least 3 kinds, both sides, and at most
1 hit she could catch without moving. If the dice give a hit that breaks a rule, they roll again. Medium keeps its fixed 15 (it's
winnable as it is). Easy is unchanged.

**What doesn't change:** the glove size, run speed and time to react, so Hard is no easier to *do*. It just becomes possible to
*read*. The pennants, best scores, coins (the v1.67 allowance), the Batting Duel and Easy mode are unchanged. No save changes.

**If it's still too hard after your phone test (idea 5):** widen the spare time on Hard (for example 0.25–0.5 s). It's one number.

**Smoke test:**
- `ctHitOk` passes all 45 fixed hits.
- 300 made-up Hard games all pass it, each has 3+ kinds and both sides, and at most 1 hit can be caught standing still.
- The same seed gives the same game, and every made-up hit flies inside the canvas.
- Each depth gets its sound and word (CRACK! / WHACK / tok), and the word shows with the sound off too.
- The trail draws only while the ball flies, on Medium and Hard.
- The background has the wedges and bands, and a screenshot of each level is saved.
- The old checks still pass: catching where it lands catches it, and the wrong depth misses.

**Docs:** README, this plan, STATUS, `CLAUDE.md` (the Catch notes), a `GIFT_TIMELINE` entry, and the version (1.68) in the four places.

**Owner's answers (2026-11-23):** the stripes and the word on every level, with Medium nudged slightly harder again to make up
for the new cues (built: glove 0.2 → 0.19, the ring from 55% of the flight instead of 45%; speed and hang times unchanged);
fresh hits on Hard only; keep the word for sound-off play.

**The questions were:**
1. Stripes and the CRACK!/tok word on **every level** (they're part of the field and the hitter; Medium gets a little easier to
   read), or on **Hard only**? Recommended: every level.
2. Fresh hits on **Hard only** (recommended; Medium is already winnable), or **Medium too**?
3. Is a small comic word by the hitter OK, or **sound only**? Recommended: keep the word, so it also works with the sound off.

**Try on your phone:**
- Play Hard a few times: the hits are different each game.
- Listen for CRACK! (stay back) and tok (run in).
- Watch the shadow's lane. Can you get 5/5 with practice?
- If it's still too hard, tell me, and I'll widen the spare time.

#### v1.69 plan details: 👋 First-time setup + age bands (agreed 2026-11-23, built)
**Why:** no child has the app yet. The first time it opens on each iPad, a grown-up should be able to set it up properly in about
a minute. Easy mode is also one ON/OFF switch, with nothing in between for the 5- and 8-year-olds and nothing extra for the 11-year-old.

**1. Age bands instead of the Easy switch.** Each room gets a band, picked by the grown-up. The picker shows icons and names only (no ages):

| Band | Meant for | What it does now (v1.69) | Later |
|---|---|---|---|
| 🧸 Little | ages 2–4 | Everything Easy mode does today, plus 🔊 Read to me on | v1.70 speaks instructions; v1.71 🧸 Little mode lock |
| 🐣 Easy | ages 5–6 | Exactly today's Easy mode, plus 🔊 Read to me on | v1.70 speaks instructions |
| ⭐ Normal | ages 7–9 | Exactly today's Easy mode OFF | |
| 🔥 Challenge | ages 10+ | Easy mode OFF, and a game she has never played opens on **Medium** instead of Easy (she can still tap Easy) | |

- **Brain Games 🎲 Free Play:** today, every level pays +2 with no daily cap. With bands, the +2 counts only at the child's
  band or above (see question 1). A level below the band still pays, but +1 out of Free Play's 10-a-day allowance, like Memory
  Match. This stops an older child farming the easiest puzzles, while the thinking games still pay for the level that's right for her.
- **Where it's picked:** in the New Room box (a new "Level" row of 4 big buttons: icon + name) and in ✏️ Change Room. ⚙️ Settings shows
  the room's band in place of the 🐣 Easy mode switch, and changing it there asks for the grown-up PIN when one is set.
- Bands are about difficulty only, never about the child being a boy or a girl. Every item stays open to every band.

**2. First-time setup (grown-up only).** It appears only when the device has **no rooms yet** and setup was never finished.
Each step is one short box with big buttons and a **Skip**:
1. **👋 Welcome:** "Hi grown-up! Let's set this up together. It takes about a minute." Buttons: **Start**, or **📂 I have a
   backup** (opens Restore, for moving to a new iPad).
2. **🔒 Grown-up PIN** (recommended): the same PIN pad as Settings. It protects deleting rooms, restoring and changing the band.
3. **🏠 Make the room:** the New Room box (name, buddy, fur, color, badge) with the new **Level** row.
4. **🔊 Can you hear me?** The buddy says "Hi! I'm your buddy!" with **✔ I heard it**, **🔁 Again** and **✖ Nothing**. If the
   device has no voice, or nothing is heard, a short how-to shows (iPad: Settings → Accessibility → Spoken Content → Voices →
   English; free and offline) and the app carries on without speech. Nothing is sent anywhere.
5. **💾 Backups:** "Her room lives only on this iPad. Deleting the app or clearing Safari's data erases it. Make a backup
   now and then (⚙️ Settings → 💾 Backup)." Buttons: **💾 Back up now** and **Later**. On an iPad opened in Safari rather than from
   the Home Screen, this box also says to use Share → Add to Home Screen (`docs/IOS.md`).

Then her room opens. ⚙️ Settings gets **🧰 Grown-up setup** (behind the PIN) to run steps 2, 4 and 5 again, for example to retest the voice.

**3. Backup reminder (review idea 6).** On the rooms screen (never inside a room or a game), a small grown-up line shows when
the last backup on this device is more than 30 days old: "💾 No backup for 30+ days · Back up". Tapping it opens Backup.
It disappears as soon as a backup is saved. It never blocks anything and makes no sound.

**Save changes (no `DB.version` bump; only added fields, like earlier versions):**
- `p.band`: `'little' | 'easy' | 'normal' | 'challenge'`. `normalize()` gives an old room `'easy'` if `p.easy` is on, otherwise
  `'normal'`, so **nothing changes for an existing room**. Every older backup still restores.
- `p.easy` **stays** and is kept in step with the band (on for Little and Easy). The ~70 places that read it keep working, and an
  older app version restoring a newer backup still sees Easy mode.
- `p.speak` is unchanged: `null` still means "follow Easy mode", so Little and Easy hear Read to me unless someone switched it.
- `settings.setupDone` (ms, `0` = never). It belongs to the device, so Restore keeps it, like the PIN. A device that already
  has rooms is marked done, so **your own phone never sees the setup**. The 30-day reminder counts from the later of `lastBackup`
  and `setupDone`.

**Code:** a new file `64-setup.js` (the setup steps, `BANDS`, `bandOf`, `setBand`, the band row, the voice test, the reminder).
Small hooks: `normalize()` (06), the New Room/Change Room box, Settings and the rooms screen (09), the first-open level in
`show()` (09), and `fpThinkPay` (44).

**Smoke test:**
- A fresh device shows the setup and goes through every step, including Skip, Restore and the no-voice path.
- A device that already has rooms never sees it.
- Old rooms get the band that matches their Easy switch, and an old backup restores with the right bands.
- Each band sets Easy mode and Read to me correctly.
- Challenge opens a game she has never played on Medium, but not one she has played.
- The Free Play pay follows the band.
- Changing the band in Settings asks for the PIN when one is set.
- The reminder shows after 30 days and hides after a backup.
- Phone and tablet screenshots of every step.

**Docs:** README, this plan, STATUS, DESIGN-REVIEW, `CLAUDE.md` (save fields and the new section), a `GIFT_TIMELINE` entry, and
the version (1.69) in the four places.

**Owner's answers (2026-11-23):**
1. Free Play +2: Little and Easy at any level, Normal on Medium and Hard, Challenge on Hard only (below the band: +1 from the daily 10).
2. Challenge also starts new games on Medium. (Built as: when a room becomes Challenge, every game with no progress yet is set to Medium.)
3. Icons and names only in the picker, no ages. (The table's ages are for this plan only.)
4. The owner sets up each iPad, but the welcome is written for any grown-up, in case a parent does it.

#### v1.70 plan details: 🔊 Spoken instructions (agreed 2026-11-23, built)
**Why:** the 3- and 5-year-olds can't read. 🔊 Read to me only says a button's name when it is tapped (`34-helpers.js`). Only
Word Builder, Peekaboo and I Spy speak by themselves. Everything else that tells a child *what to do* is silent text:
- puzzle questions (`#brQ`)
- game tips (`#socTip`, `#bfTip`, `.fid-tip`, `#clHint` …)
- the buddy's speech bubble (`say()`)
- visitor wishes

Worse, in Easy mode many of these show only emoji ("🔤 ❓", "➕"), so there is nothing to read even for a grown-up helping.

**1. Every screen and game can say what to do.** A new file `65-speak.js` holds one short spoken line for each place, written for
listening: short, American English, no emoji, about 15 words at most.
- **The line comes from its own list, not from the screen.** So an Easy-mode screen that shows "🔤 ❓" still says "What letter does
  it start with?"
- **Where lines are needed:**
  - Fidget tabs: pop-it, squishy, spinner, slime, clicker, marble maze.
  - Making things: the Closet, Art Desk, Photocards, Music Maker, Dance Maker, Jam, Garden, Runway, pet walks.
  - Sports: Soccer (Kick / Keep / Trick Shots), the Ball Field (Batting / Catch / Derby), the Stage.
  - Puzzles and other screens: Code Lab, Brain Games (the menu and each game), 🧸 Play (menu, coloring, Sound Mat), the Sticker Book.
- **Some lines fill in the puzzle in front of her.** For example:
  - 🫧 Number Pop: "Pop every bubble with a 3."
  - 🍕 Fraction Bakery: "Which one is cut into 4 equal pieces?"
  - 🧁 Snack Stand: "How many treats in this order?"

  Every fixed puzzle in every Brain game gets one.
- **Code Lab** says how to play at the start of a puzzle ("Tap the arrows to make a path to the carrot, then tap Go"), and its oops lines.

**2. When it speaks by itself:** whenever 🔊 Read to me is on for the room. That's 🧸 Little and 🐣 Easy rooms by default; a
grown-up can turn it on for any room in ⚙️ Settings.
- **When:** when a screen or game tab opens, when a new puzzle starts, and when the buddy's speech bubble or a visitor's wish appears.
- **Brain Games:** the gentle "try again" hints are spoken too (the ones that are text today, like "A little more! You need 3/4").
- **Never spoken:** coins, toasts and the win boxes (the sounds already cover those). Never during a Stage song, a Music Maker,
  Dance Maker or Jam loop, or a sports throw or kick in the air.
- **When things overlap:** a new line cuts off the one before (no queue), and a button's name is skipped when the tap opens a
  screen that speaks its own line.

**3. A 🔊 "say it again" button on every screen that has a line.** A round 48 px button in the top bar (added in code to each of
the 18 top bars, with `aria-label="Say it again"`).
- It works for every band, even with Read to me off, so the 8-year-old (or a grown-up) can listen when she wants.
- It only shows when the device has a voice (`canSpeak()`).

**What doesn't change:** no new save data (it uses `p.speak` and the band), and no internet: the device's own voice only,
the same as Read to me today. No main loop, so nothing runs per frame. The words on screen stay as they are.

**Code:** `65-speak.js`:
- `SPEAK` (lines by screen / tab / mode), `BR_SPEAK` (a function per Brain game: `(pz, lvl) → sentence`), `CL_SPEAK`.
- `tell(text)` (speaks when Read to me is on and it's a quiet moment), `tellScreen()`, `lastTell`, and the 🔊 buttons (`sayBtns`).

Small hooks call `tellScreen()` or `tell()`:
- `show()` (09), `setFidTab` (10), the Soccer and Ball Field mode buttons, `brPuzzle` and `brOops` (28), `clOpen` (18)
- `say()` (09), the visitor's wish (42), `ltGo` (46)

**Smoke test:** a fake voice records what is said.
- **Every screen, tab and mode has a line.**
- **Every fixed Brain puzzle and Code Lab level gives a sentence.** It must be non-empty, have no emoji, have 20 words at most,
  and use American spelling.
- **Easy mode:** an emoji-only screen still says a real sentence.
- **Speaking by itself:** it happens only with Read to me on, and never during a Stage song.
- **🔊 again:** it repeats the line and works with Read to me off.
- **The button:** it's hidden with no voice, it's 48 px with a label, and it fits on a phone.

**Docs:** README, this plan, STATUS, DESIGN-REVIEW, `CLAUDE.md` (the new section, and "a new game or screen adds a `SPEAK` line"),
a `GIFT_TIMELINE` entry, and the version (1.70) in the four places.

**Owner's answers (2026-11-23):**
1. Yes: 🔇 also stops the automatic voice; tapping 🔊 say it again still speaks.
2. The recommended set: instructions, questions, try-again hints, the buddy's bubble and visitor wishes.
3. A little slower in 🧸 Little and 🐣 Easy rooms.
4. No: Read to me stays in ⚙️ Settings.

#### v1.71 plan details: 🧸 Little mode (agreed 2026-11-24, built)
**Why:** a 3-year-old could tap from 🧸 Play into the full app: the Shop, Decorate, Settings, other rooms and the rooms list.
The owner prefers a lock inside the app to iPad settings like Guided Access.

**What it does** (new file `web/js/66-littlemode.js`):
- **The Little home is her own room, locked down.**
  - **Top bar:** only 🧸 Play and 🔒. Map, Decorate, Settings, Sticker Book, 🔍, 📷 and visitors are hidden; 🌙 and 🔊/🔇 stay.
  - **Rooms:** her room and the Backyard only (one arrow).
  - **What opens:** 🧸 Play, the Fidget Shelf, the Closet, the pet, Soccer, the Ball Field, Brain Games, the Garden and pet Walks.
  - **The desk opens 🧸 Play** and its sign says Play (the owner asked for this, so nothing labeled just wiggles); the corkboard has no sign.
  - **Everything else:** it only wiggles, and nothing is said.
- **One check in `show()`** (`lockGuard`) sends any other screen back to the room, so a path that was missed still can't get out.
  The rooms list (`show('profiles')`) is one of them, so Android Back never leaves, and the app opens straight into a locked room.
- **Games:**
  - Every game opens on Easy.
  - Soccer: Kick and Keep only (no Tricks or Duel).
  - Ball Field: Bat and Catch only (no Derby or Duel).
  - Brain Games: Easy only, plus 🎲 Free Play on Easy. No 📅 Puzzle of the Day and no 👯 Memory for 2.
  - The level tabs other than Easy are hidden.
- **Closet:** wearing, the Easy buy box, 🎲 Surprise me, ⭐ My Looks and the new 🎨 Dress like… stay; ✏️ rename and 👠 Runway are hidden.
- **Pet menu:** ✏️ Name and 🔄 Change are hidden.
- **Unlocking and locking again:**
  - **Unlock:** press and hold 🔒 for 3 s (a ring fills), then the PIN if one is set. A quick tap only shakes it.
  - **Relock:** it stays unlocked until 🔒 Lock is tapped or the app is opened again (`LOCK.open` is never saved).
- **Speech:** the room gets a spoken line while locked ("Tap Play, the shelf, the closet, your buddy or your pet!"). A wiggle says
  nothing, and tapping 🔒 never says "press and hold".
- **Who:** `p.little.lock`, on for 🧸 Little rooms, with a switch in ⚙️ Settings → Level (behind the PIN).
  - Picking Little turns it on; leaving Little turns it off.
  - Switching it on from Settings keeps the grown-up in until they tap 🔒 Lock.
- **🎨 Dress like… (every room's Closet):** a big button for each theme the room owns clothes from. It dresses the buddy in owned
  pieces of that theme, a different one where it can, and keeps the buddy, fur and face.

**Save:** `little.lock` (a default in `normalize()` from the band), no new save version.

**Owner's answers (2026-11-24):**
1. The Little home is her own room, locked down.
2. Every sport on Easy (Kick, Keep, Bat, Catch) and the Brain Games on Easy are in. The Closet stays for real dress-up (not only
   Surprise me), plus a new theme dress-up: 🎨 Dress like…, in every room's Closet. The Garden shed opens too.
3. On by default for Little rooms, with a switch in Settings for any room.
4. It locks again when the app is reopened, and with 🔒 Lock.

### Phase 15: Holidays + the rest of the design review (order agreed 2026-11-24)
Phase 14 finished the review's first five ideas. This phase covers the rest of `docs/DESIGN-REVIEW.md` (ideas 7–14 and the risks
still open), plus the owner's 🎉 holiday greeting. One PR for each version, in this order. Each still gets its own detailed plan,
agreed before any code (only v1.72's is written so far).
- ✅ **🎉 Holiday greetings (v1.72, built, PR open on `feature/holidays`):** the owner's idea (2026-11-24). On 12 US holidays the buddy says
  "Happy Thanksgiving!" (and so on) when the room opens, with confetti. No coins, nothing for a limited time. Plan details below.
- ✅ **🧰 Shared helpers, part 1 (v1.73; review idea 10 + risk 6; built, PR open on `feature/shared`):** nothing the children can see changes.
  - Everything uses `fpDay()` for "today". That removes `ltToday`, `rwToday`, `spyToday`, `jamToday`, `trToday`, `hrToday` and the
    `toDateString()` calls in 08, 09, 10, 11, 40, 42, 43, 46, 48 and 52.
  - One helper, `dailyPay(o, cap, n)`, built on `dayLeft` (08), replaces the 12 copied `pay{day,n}` resets.
  - No new save fields. Old `day` values are in the other date format, so each counter starts fresh once on the update day
    (one extra allowance, once). **Owner's answer (2026-11-24): convert them instead.** `normalize()` turns an old
    "Tue Nov 24 2026" day into `2026-11-24` (`dayIso`, a small hand-written converter, so it doesn't depend on iPad Safari reading
    the old text), so nothing pays twice on the update day. Built as planned otherwise: `fpDay()` moved to section 1, `dailyPay`
    in section 8 replaces 13 copies (fidgets, Art Desk, Tap-to-Color, Music, Dance, Two-player, Free Play, 🧸 Play, I Spy,
    Runway, Jam, Trick Shots, Derby), and `gameTake` uses it too.
  - The rest of idea 10 (a screen list for `show()`/`androidBack`, one results box, one prize giver) waits. The exception is
    when `09-screens.js` (at the ~40 KB limit) next has to grow.
- ✅ **⏸️ Small fixes (v1.74; risk 7 + idea 12; built, PR open on `feature/fixes`):** no save changes.
  - **Stage pause:** leaving the app mid-song pauses it instead of ending it. `AC.suspend()` already freezes the audio clock
    the song runs on, so coming back shows "Ready? ▶" with a 3-2-1 and carries on.
  - **↩ Undo for 10 seconds:** the message after a purchase or a gift gets an Undo button.
    - A purchase is refunded, and the item is removed from `owned` or from the room.
    - A gift can be taken back only while it is still unopened in the other room's `gifts[]`.
  - **Owner's answers (2026-11-24):**
    - Undo goes back to just before: the whole room as it was (coins, owned things, what was worn, applied or placed). It's offered
      for 10 s, and only while she stays on the same screen.
    - Coming back to a paused song shows ⏸️ Paused with ▶ Keep going, then 3-2-1.
    - Undo shows in every room, Easy and 🧸 Little ones too.
  - **As built:**
    - **Stage pause** (`14-stage.js`): `STG.paused` goes `'wait'` → `'count'` → `''`. The audio clock stays suspended until the
      3-2-1 ends; `ac()` (07) and the return to the app (99) don't wake it.
    - Leaving a paused song drops the notes already sent to the speaker (the stage bus is disconnected). Jams still end quietly, as before.
    - **Undo** (new `68-undo.js`): `undoArm()` copies the profile just before `tryBuy`/`buyConsumable`/`sendGift` change anything.
      `undoShow()` then shows a big ↩ button with a 10 s bar, and `show()` to another screen ends it. The card maker's picked stage
      or frame is put back too.
- ✅ **🎁 Gift codes between iPads (v1.75; idea 7; built, PR open on `feature/giftcodes`):** as described in `docs/DESIGN-REVIEW.md`.
  - The code: about 12 characters, a check letter, and a short hash of the `DECOR` key. The smoke test checks that no two keys
    share a hash.
  - Save data: `giftCodes{sent[], opened[]}`.
  - No Copy or Share buttons. The smoke test checks that no code uses `fetch`, XHR or WebSocket.
  - An older app copy that doesn't know a decoration says "Update first".
  - Questions for the plan: the mailbox step (required, optional or left out), a limit on codes per day, and what can be sent.
  - **Owner's answers (2026-11-24):** the mailbox number is required; 3 codes a day; the same things as gifts between rooms (coins
    5/10/20 or a decoration from My Stuff; no posters or prizes). Code plan agreed ("go for it").
  - **As built** (new `69-giftcodes.js`):
    - **The code:** 12 characters from `GC_ABC` (no 0/O, no 1/I), shown as XXXX-XXXX-XXXX. It holds 50 bits:
      - a gift id (12 bits)
      - a version (2)
      - what it is (16: 0–2 = 5/10/20 coins, else `gcWhatOf(key)`, a fingerprint of the `DECOR` key)
      - the mailbox (20)
    - The characters are chained with `GC_KEY` so codes look random. Then come 2 check characters (a sum mod 1021, weights 1–10),
      which catch every single wrong character and every swap of neighbors (the smoke test tries them all).
    - **Mailbox:** `gcMailbox(p)` is 3 characters from the room's id plus a check letter. Nothing is stored, and a restore keeps it.
    - **Sending:** 🎁 Give → "Who is it for?" → 📮 Another iPad → their mailbox → ✔ Make it! The gift leaves at once.
      - There's no ↩ Undo, no Copy and no Share.
      - 3 a day through `dailyPay` (`giftCodes.made`). 📮 Sent keeps the last 20.
    - **Receiving:** 🎁 Give → 📥 Type a gift code. A good code goes into `p.gifts` (from "another iPad", badge 📮) and opens with
      confetti in the room. An unknown decoration says "update the app first" and isn't used up.
    - 🎁 Give now opens even with only one room on the iPad (it used to say there was only one room).
    - Save: `giftCodes{sent[], opened[], made{day,n}}`, with defaults in `normalize()`. No new save version.
- ✅ **🐾 The pet notices (v1.76; idea 8; built, PR open on `feature/petnotice`):**
  - Back in the room after a game, the pet says one line about it in Fuzzy's bubble ("You scored 3 goals! ⚽"). The line is
    spoken for the Little and Easy levels.
  - The child's first activity of the day gives the pet +1 heart. Hearts only, never coins, never a sad line.
  - Save data: `pet.day` only; what the child just did stays in memory.
  - **Owner's answers (2026-11-24):** every game with a clear result (not just the sports); with no pet, the buddy says the line.
  - **As built** (new `70-petnotice.js`):
    - `show()` calls `petNotice(from, to)`. Leaving the room keeps a copy of `p.stats`, the puzzles solved and the saved music
      and dances (`ntSnap`). Coming back compares them, and `NT_LINES` (33 kinds, in priority order, 1–3 wordings each, some
      with a minimum such as 10 pops) picks the most notable change.
    - With a pet the line is "🐾 Name: …", without one the buddy says it. It's spoken like every bubble.
    - A box on top (a bonus card, a prize) makes it wait until the box is closed (up to about 10 s).
    - Moving between rooms and going out to the rooms list say nothing.
    - No game file changed.
- ⬜ **📻 Creations in the room (v1.77; idea 9):**
  - A boombox decoration plays a saved Music Maker loop once when tapped.
  - New `award:1` prizes for finished Code Lab levels (in the Loft, by the desk) and Brain Games levels (in the Backyard, by the chalkboard).
  - Questions for the plan: which levels give a prize, and is the boombox free?
- ⬜ **🛠️ Code Lab level maker (v1.78; idea 11):**
  - She paints a map and sets the block limit. To save the level she must solve it herself within that limit, checked by `codeSim()`,
    so every saved level can be solved.
  - 3 slots in `code.mine[]`.
  - Chosen over a maze maker because a maze can only be proven by playing it (it uses physics).
  - Best after seeing how the 11-year-old uses the Code Lab.
- ⏸️ **Parked:**
  - A picture lock for each room (idea 13): only if iPads get shared.
  - A level for each player in duels (idea 14, risk 8): only for family visits.

Why this order:
- **Holidays first** so Thanksgiving (Thursday 2026-11-26) works. It has to be merged by Wednesday to reach the iPads in time.
- **The shared helpers come early.** Ideas 8, 9 and 11 add new things that pay or count days, and they should use the shared
  helpers rather than copy them again.
- **The small fixes come before the hand-over** if possible. A song lost to a phone call, or coins spent by mistake, are
  the first things a young child would notice.
- **Gift codes come before the other new features.** With one child per iPad, they are the only way gifting can actually happen.
- **The level maker comes last.** It's the largest step.

#### v1.72 plan details: 🎉 Holiday greetings (agreed 2026-11-24)
**Owner's answers (2026-11-24):**
- The holidays: the 7 defaults below, plus Christmas Eve and Christmas Day 🎄, Easter 🐣, Mother's Day 💐 (the 2nd Sunday of May)
  and Father's Day 👔 (the 3rd Sunday of June).
- Not included: the federal days and other family celebrations.
- Yes to confetti in the holiday's colors.

**Why:** the owner asked for the buddy to say "Happy Thanksgiving!" (and so on) when the room opens on a big US holiday.

**What it does** (new file `web/js/67-holidays.js`):
- **`HOLIDAYS`:** a list of `{id, icon, words, date(year)}`. `date` returns `YYYY-MM-DD` and handles three kinds of holiday:
  - fixed dates (July 4)
  - "the Nth weekday of a month" (Thanksgiving = the 4th Thursday of November)
  - Easter, if it's chosen (worked out from the year).
- **The greeting:** `holidayToday()` compares `fpDay()` with the list. `enterRoom()` (09) then has the buddy hop and say the greeting
  in its speech bubble, for example "Happy Thanksgiving, Mia! 🦃" (the name is the room's own).
  - It's spoken by the automatic voice like other buddy lines (v1.70), so the 3- and 5-year-olds hear it.
  - It comes every time the room opens from the rooms list or when the app starts, not when moving between rooms. Nothing is saved.
  - On the very first visit the "Hi! Tap the shelf…" tip comes first, and the greeting follows a few seconds later.
  - It also works in a 🧸 Little-mode room.
- **A little extra (optional):** a short burst of confetti in the holiday's colors, using the gift confetti (`giftConfetti`, 32).
- **No coins, no limited-time items.** Seasonal things stay on sale all year (the no-pressure rule), and a missed day loses nothing.
- **Smoke test:**
  - Each holiday's date is checked for 2026–2030 (for example Thanksgiving 2026-11-26 and 2027-11-25; Easter 2027-03-28).
  - With `FP_TEST_DAY` set to a holiday, opening the room shows the greeting.
  - On an ordinary day, no greeting.

**Save:** none.

**Proposed holidays (owner to confirm):**
- In by default: New Year's Day (Jan 1) 🎆, Valentine's Day (Feb 14) 💝, St. Patrick's Day (Mar 17) 🍀, the Fourth of July 🎆,
  Halloween (Oct 31) 🎃, Thanksgiving (4th Thursday of November) 🦃, New Year's Eve (Dec 31) 🥳.
- To ask about:
  - Christmas Eve and Christmas Day 🎄, and Easter 🐣: these are religious holidays, so they're the family's call.
  - Other family celebrations, such as Hanukkah, Lunar New Year or Diwali. They need a date table for each year.
  - Mother's Day and Father's Day: left out by default, because not every child's family fits.
  - Quieter federal days (MLK Day, Presidents' Day, Memorial Day, Labor Day, Veterans Day): left out by default; they aren't party days.
- Birthdays would be nice too, but a child's birthday is personal. It would go in `web/about-local.js` (never in git) or in
  Settings → Level. That's a later question.

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
