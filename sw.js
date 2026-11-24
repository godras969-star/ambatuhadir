/* Service worker Ambatuhadir.
   Strategi: jaringan dulu, cache hanya cadangan saat offline.
   Jadi setiap kali kamu mengubah file di GitHub, versi baru langsung dipakai
   tanpa perlu hapus cache. Permintaan ke Apps Script (API) tidak pernah di-cache. */
const CACHE = 'ambatuhadir-v1';
const INTI = [
  './',
  'index.html',
  'config.js',
  'logo.png',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(INTI.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nama) => Promise.all(nama.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API Apps Script, font, CDN: biarkan langsung ke jaringan

  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res && res.ok) {
          const salinan = res.clone();
          caches.open(CACHE).then((c) => c.put(req, salinan));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))
      )
  );
});
