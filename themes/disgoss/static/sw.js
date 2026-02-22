/**
 * Service Worker — three cache strategies:
 *
 * 1. Static assets (fonts, CSS, JS): cache-first, network fallback.
 *    These are fingerprinted by Hugo so a new URL = new content; safe to
 *    cache forever.
 *
 * 2. HTML pages: stale-while-revalidate.
 *    User gets an instant load from cache; the page updates in the
 *    background for the next visit.
 *
 * 3. /sw.js itself: never cached by the SW (browser handles it with
 *    must-revalidate so updates propagate).
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE  = `pages-${CACHE_VERSION}`;

const STATIC_PATTERNS = [
  /^\/fonts\//,
  /^\/css\//,
  /^\/js\//,
];

function isStaticAsset(url) {
  return STATIC_PATTERNS.some(p => p.test(url.pathname));
}

/* ── Cache-first (static assets) ────────────────────────────────── */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

/* ── Stale-while-revalidate (HTML pages) ─────────────────────────── */
async function staleWhileRevalidate(request) {
  const cache    = await caches.open(PAGES_CACHE);
  const cached   = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });

  return cached || fetchPromise;
}

/* ── Fetch handler ───────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only intercept same-origin GET requests
  if (url.origin !== location.origin) return;
  if (event.request.method !== 'GET') return;

  // Never cache the SW itself
  if (url.pathname === '/sw.js') return;

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request));
  } else {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

/* ── Activate: clean up old caches ──────────────────────────────── */
self.addEventListener('activate', event => {
  const current = new Set([STATIC_CACHE, PAGES_CACHE]);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => !current.has(k)).map(k => caches.delete(k))
      )
    )
  );
  // Take control of uncontrolled clients immediately
  self.clients.claim();
});
