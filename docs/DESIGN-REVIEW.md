# Design review (2026-11-23)

A whole-app review done before the children get the app. Nothing here is built yet: each item still needs its own
plan, agreed with the owner, before any code is written (see `CLAUDE.md`, "Plan first").
**Start here if you are picking this up in a new chat**, then read "Agreed so far" and "Next step".

## Who uses it (the owner's answers, 2026-11-23)
- Four children, ages 3, 5, 8 and 11 (the same children as in `CLAUDE.md`). The owner is their first cousin once removed,
  in an aunt-like role.
- **Each child has their own iPad** (the 3- and 5-year-olds too, the owner thinks). Two children on one iPad will be rare.
- **The children have not received the app yet.** No rooms and no PINs exist on their iPads, and there is no real use to
  learn from. So the first-time setup matters more than tuning for habits.
- The iPads are usually online (Roblox, kids' YouTube), so updates from GitHub Pages reach them.
- Whether each iPad has an English voice on the device (needed for 🔊 Read to me) is not known.
- The owner prefers safeguards built into the app (for example a toddler lock) over iPad settings like Guided Access,
  because they don't know the children's devices well.

## The feature list, checked against the code
The owner's list was right. These were missing from it or needed a correction:
- **Gifts and two-player games only work between rooms on the same iPad.** The gift list is the profiles on that device
  (`others(p)` in `32-gifts.js`). With one child per iPad, these features will almost never be used as they are.
- Gifts are 5, 10 or 20 coins, or a decoration from My Stuff. Drawings and prizes can't be given.
- Pet tricks are learned through hearts, not a game. 🙈 Hide & Seek was missing from the list.
- Visitors: one new wish a day, only after the last one came true. They wait as long as it takes.
- Not in the list: the clicker cube; Snack Stand, Number Pop, Fact Cards, 🎲 Free Play and 📅 Puzzle of the Day; Be the
  Keeper, Trick Shots and the Soccer Duel; Batting, Catch, Home Run Derby and the Batting Duel; 8 Stage songs, Stage
  Together and Stage Jam; the Dance Maker; the Photocard Wall, Sticker Book, Garden, I Spy, pet walks, Memory for 2;
  four rooms with a 🗺️ map, Seasons, night mode, room layouts, big dreams and shop filters; 5 buddies, hair colors,
  ⭐ My Looks and emotes; Easy mode, Read to me, the grown-up PIN, backup and restore, 📷 snapshots, About and What's New.

## What the review found

### 1. Age range
- **Usable at 3:** Little Ones' Corner, fidgets, Peekaboo, tapping the pet, Easy Soccer (tap the goal).
- **5–6 with Easy mode:** dress-up, decorating, Easy sports, Memory Match, I Spy (its clue is spoken), Word Builder Easy (tracing).
- **Need reading (about 7+):** Snack Stand, Fraction Bakery, Fact Cards, Code Lab, visitor wishes, the Shop.
- **Depth for the 11-year-old:** Hard sports, the Code Lab Challenge level, the Derby, Trick Shots.
- **Read to me only says the name of a tapped button** (`34-helpers.js`, the click listener). Only Word Builder, Peekaboo
  and I Spy speak by themselves. Puzzle questions (`#brQ`), game hints like "Swipe up from the ball…" (`13-soccer.js`),
  visitor wishes, the buddy's speech bubbles (`say()`) and pop-up messages (`toast()`) are silent text.
- **Easy mode is one switch.** While it is on, `show()` resets every game to Easy each time its screen opens
  (`09-screens.js`). There is no middle setting for the 5- and 8-year-olds and nothing based on age. Each game
  remembers its own level.

### 2. Two children, one iPad
- Saves are separate per room, except device settings (sound, the PIN).
- Tapping any room card opens that room with no check (`renderProfiles` click handler, `09-screens.js`), so a sibling can spend
  coins or give things away from another child's room.
- The PIN is off by default (`DEFAULT_SETTINGS.pin=''`, `01-save.js`), and `askPin()` lets everything through when no PIN
  is set: deleting a room takes 2 taps, and Restore can overwrite every room.
- Duels use one level for both players (`bdLevel` in `63-ballduel.js`), and the Easy-mode timing help is switched off in
  a duel (`bfWin` in `59-ballfield.js`). A 3-year-old can't really play against an 11-year-old.
- Less important now that each child has their own iPad.

### 3. Coins and gifting
- **Capped (an allowance a day):** the daily gift, fidgets (30), Art, Music Maker, Dance Maker, I Spy, Runway, Jam,
  Trick Shots, Derby, 🧸 Play, Free Play (Memory, Maze, Code Lab), two-player games.
- **Not capped:** Soccer Kick, Be the Keeper, Stage, Batting, Catch, Brain Games Free Play (+2 a puzzle, on purpose:
  the owner wants the thinking games to keep paying).
- **Most per game (best case):** Batting 41 on Hard and 29 on Easy (6 pitches, +2 for a home run, +1 with the kit, +5 for 6/6).
  Soccer, Keeper and Catch: 15 on Easy and 25 on Hard, but a perfect game on Hard is rare. Stage: 6 a song on Easy and 12 on Hard
  (about 70 seconds).
- About 480 priced things, worth roughly 7,000 coins (a rough count of prices in the code), plus seeds and pet treats.
- Gifting is hard to misuse by accident (3 taps a gift, 20 coins at most, no "give all"), but it can't be undone.
- With no PIN, coins can be farmed: a new room starts with 25 coins and +10 a day, up to 6 rooms, each giving 20 at a time.

### 4. Coming back
- Visitors already use art (posters), outfits and themes. Prizes (trophies, gloves, bats, pennants, garden pots, walk
  jars) go into the house.
- **Dead ends:** Code Lab, most Brain Games, Stage scores, saved Music and Dance slots, Photocards apart from their wall.
- **The pet knows nothing about the rest of the app:** only pats, treats and its own games (`22-pet.js`).

### 5. Consistency between games
- **Consistent:** every game saves as it goes, has Back, and has no lose state (good).
- **Missing:** spoken instructions (only 3 games); a "how to play" card with pictures; a shared results box (each game
  builds its own).
- **Interruptions:** only the Stage is timed. Leaving the app mid-song ends it with no coins (`visibilitychange` in
  `99-startup.js`).

### 6. iPad
- **Already handled:** offline after the first visit (`sw.js`), both orientations, safe areas, no pinch zoom, sound restarting
  when the app comes back.
- **Gaps:**
  - `audioSession.type='playback'` (`58-ios.js`) plays sound even when the iPad is muted, and sound is 2 taps deep in Settings.
  - Saves live only on each iPad: deleting the Home Screen icon deletes them. "Last backup" only shows inside Settings.
  - A toddler can wander from 🧸 Play into the full room.

### 7. Shared code
- The same daily-allowance reset (`pay{day,n}`) is copied in about 12 files (10, 11, 40, 43, 46, 47, 48, 50, 52, 53, 54, 62).
- At least four `*Today()` helpers exist besides `fpDay()`, so "today" is decided in two ways.
- `show()` (`09-screens.js`) and `androidBack` (`99-startup.js`) are long chains of if-statements, one line per screen.
- Soccer, Keeper, Batting and Catch each copy the same match pattern: level tabs, a "perfect" bonus, a kit bonus and a
  bronze/silver/gold prize.

## Bugs and risks found
1. With no PIN (the default), any child can delete another child's room in 2 taps, or restore over every room.
2. Coin farming with extra rooms when there is no PIN (see section 3).
3. The "not enough coins" message sends children to the Fidget Shelf even when today's fidget coins are used up (`needMore`, `08-ui.js`).
4. Sound plays when the iPad is muted (`playback` audio session).
5. Saves are only on each device; backups are manual, on 4 iPads.
6. Two ways of deciding "today" (`toDateString()` in most files, `fpDay()` in Garden, Free Play and Puzzle of the Day).
   Changing the iPad's date also repeats daily gifts and grows the garden. Low risk.
7. Leaving the app mid-song ends the song with no coins (by design, but it can feel unfair).
8. Duels switch off Easy-mode help.

## Not to add
1. **Online sync, accounts or real cross-device multiplayer:** breaks the no-internet rule, needs a paid server, adds privacy risk.
2. **Leaderboards or rankings between the children:** the youngest always loses.
3. **More separate minigames for now:** there are already about 40 activities. Voice, links between areas and shared
   helpers are worth more.

## The ideas, ranked after the owner's answers

| # | Idea | Helps | Effort | Impact | Status |
|---|---|---|---|---|---|
| 1 | Daily cap for the sports and Stage games + fix the "go to the Fidget Shelf" hint + a quick 🔊/🔇 button in the room | 8–11, parents | S | Med | **v1.67, built** (details below) |
| 1b | 🧤 Catch on Hard: cues for reading the ball (see "Next step" below) | 8–11 | S–M | Med | **v1.68** (owner agreed ideas 1–4; will test on the phone) |
| 2 | First-time setup for the grown-up: PIN, the child's room and age band, a "Can you hear me?" voice test, a word about backups | All | M | High | ✅ built in v1.69 |
| 3 | Age bands per room (Little / Easy / Normal / Challenge) instead of the one Easy switch; Brain Free Play's +2 only at the child's band or above | All | M | High | ✅ built in v1.69 (Little / Easy / Normal / Challenge) |
| 4 | Read every instruction aloud: a 🔊 button on prompts, spoken by itself for the Little and Easy bands | 3–6 | M | High | ✅ built in v1.70 |
| 5 | 🧸 Little mode: keeps a toddler in Little Ones' Corner and Easy games until a grown-up presses and holds | 3 (maybe 5) | M | High | v1.71 |
| 6 | Grown-up backup reminder on the rooms screen after about 30 days | All | S | High | ✅ built in v1.69 |
| 7 | Gifts between iPads with a gift code (details below) | 5–11 | M | Med | later; owner agrees in principle |
| 8 | The pet reacts to what the child did (a greeting after a game, a heart for the first activity of the day) | All | M | Med | later |
| 9 | Creations in the room: a boombox for saved loops and dances, prizes for finishing Code Lab and Brain levels | 6–11 | M | Med | later |
| 10 | Shared game helpers: one daily-allowance helper, one "today", one results box, one prize giver, a screen list | Dev | M–L | Med | later (the allowance helper can start in v1.67) |
| 11 | Something to make for the oldest: a Code Lab or maze level editor | 9–11 | L | Med | later |
| 12 | Undo the last purchase or gift for about 10 seconds | 3–5 | S | Low now | later |
| 13 | A picture lock for each room | 5–11 | M | Low now | only if iPads are shared |
| 14 | A level for each player in duels | mixed pairs | M | Low now | only for family visits |

Ideally 1–5 are done before the children get the app.
**Agreed order (2026-11-23):** v1.67 daily caps → v1.68 Catch on Hard → v1.69 first-time setup + age bands →
v1.70 spoken instructions → v1.71 🧸 Little mode.

## v1.67: daily caps
**Owner's decisions (2026-11-23):** one allowance per game (so each day it pays to visit several parts of the app); the first
perfect on each level (the one that wins the prize) never counts toward it, but repeat perfects do; any first-time win on a fixed level (a new trophy level, a new Trick Shot or Derby challenge, a new
Code Lab or Brain Games puzzle) never counts toward it. **The detailed plan is in `PLAN.md`, "v1.67 plan details".**
The notes below are how the decision was reached.

The owner asked: should every game act the same? Yes. The first answer ("cap only Batting and Catch, the others pay far
less") was too loose. Soccer, Keeper and Catch can pay 15–25 a game too; only Batting is clearly above them. A reason to
leave a game uncapped would be "it is a skill game, so getting better should pay more", but that is already true per game
(Hard pays more per goal), and it doesn't explain treating Soccer differently from Batting. So the proposal is one rule:
- **Every game that pays per play gets a daily allowance**, through one shared helper (the start of idea 10):
  Soccer Kick, Be the Keeper, Batting, Catch, the Stage.
- **First-time achievements stay outside the cap,** as everywhere else: a new trophy, glove, bat, pennant or Golden Mic,
  and new puzzles. Questions for the plan: does the +5 perfect bonus count towards the cap? Should the first perfect on
  each level always pay?
- After the cap, the game keeps working and counts for stickers, with one gentle note, like the fidgets. It refills the next day.
- **Left as it is (owner's choice):** Brain Games Free Play's +2 with no cap.
- Still to decide in the plan: one cap per game (encourages variety) or one shared sports allowance (simpler, stops hopping
  between games); the numbers; whether Batting's home-run bonus should shrink.
- Also: fix the `needMore` hint (point to a game that still pays today) and add a 🔊/🔇 button in the room (the iPad audio session stays `playback`, so this button is how to make it quiet).
- Save data: new `pay{day,n}` fields get defaults in `normalize()`.

## Gift codes between iPads (idea 7): what was meant
**Not** the backup code. The backup is the whole save as text. A gift code would be a short code of about 10–12 letters and
numbers (for example `K7P2-9QXM-4T`), using no easily confused characters (no 0/O or 1/I).
- **Making one:** the sender picks a gift (coins or a decoration) as now, and picks "Another iPad". The app takes the coins or
  the item away and shows the code in big letters.
- **Using one:** on the other iPad, the child taps 🎁 → "Type a gift code", types it, and the gift opens with confetti as usual.
- **What's in it:** what the gift is, a random gift id, and a check letter that catches typing mistakes.
- **How it stays off the internet:** the app never sends the code anywhere. A person reads it on one screen and types it on
  another, like reading out a phone number. To keep it that way:
  - The code screen has no Copy button and no Share button.
  - The Android app still has no internet permission, and on the iPad `sw.js` only fetches the app's own files.
  - The smoke test can check that no code uses `fetch`, XHR or WebSocket.
- **Stopping it being used twice:** each room remembers the gift ids it has opened, so a code opens once per room. A code
  could still be typed on two different iPads. To stop that, the receiver's room shows a short "mailbox number" that the
  sender types first, and the code then only opens in that room. That adds a step; good for the 8- and 11-year-olds, or
  with a grown-up helping.
- **Lost codes:** the coins leave when the code is made. The sender's 🎁 Sent list keeps the code so it can be read again.
  A code can't be taken back, because the sender's iPad can't know whether it was already used.
- **Making fake codes:** a child who read the source could make fake coin codes. Low risk in a family app; the check letter
  stops guessing.
- This is a later PR and needs its own plan.

## Open questions
- ~~Who sets up each iPad?~~ The owner will (2026-11-23), but the welcome is written for any grown-up.
- Does each iPad have an English voice on the device? The voice test in the setup will show it.

## Next step
**v1.67 (daily caps) is built** on branch `feature/caps` (`PLAN.md`, "v1.67 plan details"). **v1.68 (Catch on Hard) is built** on branch `feature/catchhard` (`PLAN.md`, "v1.68 plan details"). **v1.69 (first-time setup + level bands) is built** on branch `feature/setup` (`PLAN.md`, "v1.69 plan details"). **v1.70 (spoken instructions) is built** on branch `feature/speak`. Next: plan **v1.71 (🧸 Little mode)**.

**Raised by the owner (2026-11-23): 🧤 Catch on Hard is still too hard,** even for the owner, and with capped coins it may just be
frustrating. Why, from the code (`61-catch.js`): with no ring, the only cue is the ball's shadow, which starts at home plate (tiny,
far away) and moves at a steady pace, so where it will stop (especially how far in, `v`) only shows late; and the 15 Hard hits
come in the same order every time (`CT.round`), so winning comes down to memory. The owner does not want the "go here" ring back.
**The owner agreed ideas 1–4 for v1.68** and will judge them on the phone; idea 5 only if still needed. All are "reading the ball" cues that a real outfielder uses rather than a marker:
1. **The sound of the bat tells the distance:** a sharp, loud crack for a deep ball, a dull "tok" for a short one.
2. **Mowed stripes on the grass** (drawn once into the background, free each frame), so the shadow can be judged against
   lines early, in both directions.
3. **A short fading trail behind the shadow,** so its direction is clear in the first half second.
4. **No memorizing:** Hard hits made from a seed each game (like Free Play), each one checked with `ctCanCatch` so every
   hit stays catchable.
5. Only if still too hard after a phone test: a little more hang time on Hard. Then build it on a new branch (`feature/caps`) from `main`.
