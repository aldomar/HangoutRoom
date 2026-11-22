'use strict';
/* Hangout Room service worker (v1.59): keeps the app's own files on an iPad/iPhone (or any browser) so it works offline.
   It only runs on the hosted https copy; the file:// page and the Android APK never start it.
   - VERSION must match APP_VERSION (web/js/01-save.js): a new version = a new store of files, and the old one is deleted.
   - FILES must list every file index.html loads (the smoke test checks). A new web/js file goes here too.
   - It never asks the internet for anything but these files. web/about-local.js is git-ignored, so it isn't hosted:
     when it's missing, an empty script is used. */
const VERSION='1.62';
const STORE='hangout-room-'+VERSION;
const FILES=['./','index.html','manifest.webmanifest','web/app.css','web/icon-180.png',
  'web/js/01-save.js','web/js/02-art-helpers.js','web/js/03-mascot.js','web/js/04-room.js',
  'web/js/05-fidget-data.js','web/js/06-profiles.js','web/js/07-sound.js','web/js/08-ui.js',
  'web/js/09-screens.js','web/js/10-fidget-shelf.js','web/js/11-art-desk.js','web/js/12-photocards.js',
  'web/js/13-soccer.js','web/js/14-stage.js','web/js/16-room2.js','web/js/17-pack1.js',
  'web/js/18-codelab.js','web/js/19-fidgets2.js','web/js/20-seasons.js','web/js/21-stickers.js',
  'web/js/22-pet.js','web/js/23-buddies.js','web/js/24-pack2.js','web/js/25-about.js',
  'web/js/26-backyard.js','web/js/27-keeper.js','web/js/28-brain.js','web/js/29-brain2.js',
  'web/js/30-songs2.js','web/js/31-looks.js','web/js/32-gifts.js','web/js/33-shopplus.js',
  'web/js/34-helpers.js','web/js/35-brain3.js','web/js/36-brain4.js','web/js/37-pack3.js',
  'web/js/38-pack4.js','web/js/39-extras.js','web/js/40-music.js','web/js/41-studio.js',
  'web/js/42-visitors.js','web/js/43-together.js','web/js/44-freeplay.js','web/js/45-words.js',
  'web/js/46-little.js','web/js/47-colorbook.js','web/js/48-dance.js','web/js/49-garden.js',
  'web/js/50-ispy.js','web/js/51-spend.js','web/js/52-runway.js','web/js/53-jam.js',
  'web/js/54-tricks.js','web/js/55-petplay.js','web/js/56-walk.js','web/js/57-pack5.js',
  'web/js/58-ios.js','web/js/59-ballfield.js','web/js/60-ballpack.js','web/js/61-catch.js',
  'web/js/62-derby.js','web/js/99-startup.js'];

self.addEventListener('install',e=>{
  // cache:'reload' skips the browser's own HTTP cache, so a new version never mixes in old files
  e.waitUntil(caches.open(STORE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('hangout-room-')&&k!==STORE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET'||new URL(req.url).origin!==location.origin) return;
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).catch(()=>
    /\.js$/.test(new URL(req.url).pathname)?new Response('',{headers:{'Content-Type':'text/javascript'}}):Response.error())));
});
