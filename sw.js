var CACHE_NAME = 'expense-tracker-v1';
var ASSETS = [
  '/expanse-master/',
  '/expanse-master/index.html',
  '/expanse-master/manifest.json',
  '/expanse-master/icon-192.png',
  '/expanse-master/icon-512.png'
];

// Install - cache all assets
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS.filter(function(url) {
        return !url.endsWith('.png'); // skip icons if not present
      })).catch(function(){});
    })
  );
});

// Activate - clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch - cache first, then network
self.addEventListener('fetch', function(e) {
  // Only handle same-origin requests
  if(e.request.url.indexOf(self.location.origin) !== 0) return;
  
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if(cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cache successful GET requests
        if(e.request.method === 'GET' && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback
        return caches.match('/expanse-master/index.html');
      });
    })
  );
});
