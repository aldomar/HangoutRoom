'use strict';
/* =========================================================
   Personal About words: EXAMPLE (this file is in git; the real one is not).
   To use it: copy this file to web/about-local.js (same folder) and change the words.
   web/about-local.js is git-ignored, so it stays on your PC and never goes to GitHub.
   The APK built in Android Studio on your PC includes it. Keep a copy somewhere safe (like the signing key).
   Anything you leave out uses the generic words in web/js/25-about.js.
   Use nicknames only. Keep the quotes and commas; a quote inside the words needs a \ in front: 'it\'s'.
   ========================================================= */
window.ABOUT_LOCAL={
  names:['Sunny','Pip'],               // nicknames, shown on the certificate and at the top of the letter
  from:'Love, Auntie Bee',             // the signature
  letter:[                             // the letter, one paragraph per line
    'I made this little world just for you.',
    'There is only one Hangout Room in the whole world, and it is yours.'
  ],
  secret:'',                           // tap the buddy on the certificate 5 times to see this ('' = off)
  why:{                                // optional: your own line for any update in the story
    '1.5':'For Sunny, our soccer star ⚽'
  }
};
