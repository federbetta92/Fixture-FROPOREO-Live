// ══ Service Worker unificado — PWA + OneSignal ══════════════════════
// OneSignal requiere este nombre de archivo en el root del sitio.
// También actúa como service worker de la PWA para que la instalación funcione.

importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// ── Caching para la PWA ──────────────────────────────────────────────
const CACHE = 'froporeo-v2';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll([
      '/',
      '/index.html',
      '/js/app.js',
      '/css/style.css',
      '/manifes.json',
      '/img/icon-192.png',
      '/img/icon-512.png',
    ])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    // Limpiar caches viejos
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Dejar pasar las requests que no son GET (y las de APIs externas)
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (url.includes('espn.com') || url.includes('onesignal.com') || url.includes('fonts.google')) return;

  // Network first → cache fallback (scores siempre frescos, offline funciona)
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
