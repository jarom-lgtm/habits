/* Habits - offline service worker.
   Bump CACHE whenever a file below changes, so phones pick the update up. */
var CACHE = 'habits-v40';

/* './' is deliberately NOT listed. Caching both './' and './index.html' stores
   the same page under two keys that drift apart, and the stale one wins - which
   is exactly how an update can appear not to have landed. One canonical entry. */
var ASSETS = [
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return k === CACHE ? null : caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;

  var url;
  try { url = new URL(e.request.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;

  /* The page itself is fetched from the NETWORK first, falling back to the
     cache only when there is no signal.

     Cache-first is the usual advice for an offline app and it is wrong here:
     it serves the old page on every open and picks the new one up only in the
     background, so a change looks like it never landed until the app has been
     opened twice. Anyone refreshing to check an update reasonably concludes it
     is broken. The page is a few tens of KB - fetching it fresh costs nothing
     worth having, and offline still works through the catch below. */
  if (e.request.mode === 'navigate') {
    e.respondWith(
      /* cache:'reload' matters more than it looks. GitHub Pages serves this
         page with max-age=600, so a plain fetch() is allowed to be answered
         from the browser's own HTTP cache - meaning "network first" could
         still hand back a ten minute old page and an update would appear not
         to have landed. This forces it past that cache to the server. */
      fetch(e.request.url, { cache: 'reload', credentials: 'same-origin' })
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
          return res;
        })
        .catch(function () { return caches.match('./index.html'); })
    );
    return;
  }

  /* A script asking for the page itself gets the same canonical entry, never a
     second copy stored under its own URL. */
  if (url.pathname === self.registration.scope.replace(self.location.origin, '') ||
      /\/(index\.html)?$/.test(url.pathname)) {
    e.respondWith(
      fetch(e.request.url, { cache: 'reload', credentials: 'same-origin' })
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
          return res;
        })
        .catch(function () { return caches.match('./index.html'); })
    );
    return;
  }

  /* Everything else - icons, the manifest - stays cache-first and is refreshed
     quietly behind the scenes. They barely change and are wanted instantly. */
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      var live = fetch(e.request).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () { return hit; });

      return hit || live;
    })
  );
});
