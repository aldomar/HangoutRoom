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
- **Looks, emotes & night mode:** outfit save slots (switch a whole look in one tap); tap Fuzzy for a wave, dance, laugh
  or nap; 🌙 lights off, with lamps, fairy lights and stars glowing (drawn once, no animation loop).
- **Gifts & room presets:** 🎁 give an item or coins to a brother's or sister's room on the same tablet (it arrives as a
  wrapped box to open; no network); 🏠 save a room layout and switch back later.
- **🔊 Read to me:** in Easy mode, tapping a button also says its name, using Android's built-in offline voice through the
  wrapper (no new permission). The browser version stays quiet.
- **💾 Backup reminder:** Settings shows "Last backup: 12 days ago" for the grown-up. Nothing for the children to worry about.
- **🔎 Shop filters by theme** (🦇 🦕 🚀 ⚽ ☁️ …) in the Closet and the Shop, which now hold well over 100 things.
- **⚡ Speed check and tidy-up:** measure how fast the rooms and shops draw on a modest tablet and trim slow spots. Can move
  earlier if the tablet starts to feel slow.
- **💰 Coin balance review:** a few "big dream" things to save up for (for example a canopy bed or an arcade machine),
  which means raising the 40-coin price cap for those.
- **📷 Room snapshot:** save a picture of a room or a photocard to the tablet, the same way Backup saves a file.

### Phase 11: More games and content (ongoing)
- **📚 Brain Games, part 2:** 🚂 Pattern Train (colours → shapes → number sequences), 🔤 Word Builder (first letters →
  3-letter words → spelling from a picture), 🍕 Fraction Bakery (halves → quarters → "⅔ of the pizza"), 🪐 Fact Cards
  (dinosaurs, space, ocean; right answers unlock collectible fact cards).
- **🎹 Music Maker (optional):** a beat-and-melody grid for making their own loop.
- **Content Pack 3:** K-pop-inspired stage outfits (original), cozy anime-style looks, cafe and bakery, ocean and mermaids,
  matching furniture sets. **Content Pack 4:** basketball, skateboard and karate, farm animals, more trucks and space.
- More 🧠 Challenge puzzles, more marble mazes, and stickers for every new game.

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
