/*
 * Caching strategy:
 *
 * 1. Fonts & JS: cache-first (fingerprinted by Hugo)
 * 2. CSS: network-first (so style changes propagate immediately)
 * 3. HTML pages: stale-while-revalidate
 * 4. /sw.js: never cached by the SW
 */

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE  = `pages-${CACHE_VERSION}`;

const STATIC_PATTERNS = [
  /^\/fonts\//,
  /^\/js\//,
];

const CSS_PATTERN = /^\/css\//;

function isStaticAsset(url) {
  return STATIC_PATTERNS.some(p => p.test(url.pathname));
}

/* ── Cache-first (fonts, JS) ────────────────────────────────── */
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

/* ── Network-first (CSS) ─────────────────────────────────────── */
async function networkFirst(request) {
  const cache = await caches.open(STATIC_CACHE);

  try {
    const response = await fetch(request, { cache: "no-store" });

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (err) {
    const cached = await cache.match(request);
    return cached || Response.error();
  }
}

/* ── Stale-while-revalidate (HTML pages) ─────────────────────── */
async function staleWhileRevalidate(request) {
  const cache  = await caches.open(PAGES_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });

  return cached || fetchPromise;
}

/* ── Fetch handler ───────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only intercept same-origin GET requests
  if (url.origin !== location.origin) return;
  if (event.request.method !== 'GET') return;

  // Never cache the SW itself
  if (url.pathname === '/sw.js') return;

  if (CSS_PATTERN.test(url.pathname)) {
    event.respondWith(networkFirst(event.request));
  }
  else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request));
  }
  else {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

/* ── Activate: clean up old caches ───────────────────────────── */
self.addEventListener('activate', event => {
  const current = new Set([STATIC_CACHE, PAGES_CACHE]);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => !current.has(k)).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});