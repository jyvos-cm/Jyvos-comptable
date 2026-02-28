// JYVOS Comptable - Service Worker PWA
// Version du cache - changer pour forcer la mise à jour
const CACHE_NAME = 'jyvos-v1';

// Fichiers à mettre en cache pour le mode hors ligne
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installation JYVOS...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Mise en cache des fichiers');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', event => {
  console.log('[SW] Activation JYVOS...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes - Cache First Strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Si trouvé dans le cache, retourner le cache
      if (cachedResponse) {
        return cachedResponse;
      }
      // Sinon faire la requête réseau
      return fetch(event.request).then(response => {
        // Vérifier que la réponse est valide
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Mettre en cache la nouvelle ressource
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Si pas de réseau et pas en cache, retourner index.html
        return caches.match('./index.html');
      });
    })
  );
});

// Gestion des notifications push (future utilisation)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nouveau rappel JYVOS !',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'jyvos-notification'
  };
  event.waitUntil(
    self.registration.showNotification('JYVOS Comptable', options)
  );
});
