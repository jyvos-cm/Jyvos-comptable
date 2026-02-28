const CACHE_NAME = 'jyvos-v1';
const urlsToCache = [
  '/Jyvos-comptable/',
  '/Jyvos-comptable/index.html',
  '/Jyvos-comptable/manifest.json',
  '/Jyvos-comptable/icons/icon-192x192.png',
  '/Jyvos-comptable/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => caches.match('/Jyvos-comptable/'));
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
