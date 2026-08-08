/* Kadalkavach service worker v2 — app-shell cache + resilient SPA fallback.
   The full app logic (offline report queue, media sync) lives in the React app;
   this worker keeps the shell installable and makes deep links (/citizen,
   /authority, ...) reload correctly even when the static host cannot rewrite
   the path to index.html. Bump CACHE_NAME on every deploy that ships a new
   shell so returning visitors get the fresh build. */
const CACHE_NAME = 'kadalkavach-shell-v2';
const SHELL_URLS = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never cache API calls or cross-origin requests — live data must stay live.
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) return;

  // Navigations (any SPA route): serve the cached shell immediately and refresh
  // it in the background. Error responses are never returned or cached, and the
  // fetch event is always resolved to a real Response (never undefined).
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => {
        if (cached) {
          // Background refresh so the next load picks up a new deploy.
          fetch(request)
            .then((response) => {
              if (response && response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
              }
            })
            .catch(() => undefined);
          return cached;
        }
        // First visit before the install precache finished: network, safe fallback.
        return fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
              return response;
            }
            return new Response('', { status: 503, statusText: 'Offline' });
          })
          .catch(() => new Response('', { status: 503, statusText: 'Offline' }));
      }),
    );
    return;
  }

  // Static assets: stale-while-revalidate. Never cache error responses and
  // never resolve the fetch event to undefined.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return Promise.resolve(cached || network).then(
        (response) => response || new Response('', { status: 503, statusText: 'Offline' }),
      );
    }),
  );
});
