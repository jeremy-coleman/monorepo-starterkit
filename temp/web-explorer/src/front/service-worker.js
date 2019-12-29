const enableLogs = true;
const log = enableLogs ? (...msg) => console.log(...msg) : () => {};

const cacheVersion = 1;
const dataCacheName = `webexplorer-data-v${cacheVersion}`;
const appShellCacheName = `webexplorer-appshell-v${cacheVersion}`;
let appShellFiles = [
  // You can add more file here...
];

self.addEventListener('install', function(e) {
  log('[ServiceWorker] Install');
  e.waitUntil(
    Promise.all([
      caches.open(appShellCacheName),
      fetch('./assets.json').then(response => response.json())
    ]).then(([cache, assets]) => {
      appShellFiles = appShellFiles.concat(Object.values(assets));
      log('[ServiceWorker] Caching app shell', appShellFiles);
      return cache.addAll(appShellFiles);
    })
  );
});

self.addEventListener('activate', function(e) {
  log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (key !== appShellCacheName && key !== dataCacheName) {
          log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response) {
        log('[Service Worker] Fetch from cache', e.request.url);
        return response;
      } else {
        return caches.open(dataCacheName).then(function(cache) {
          return fetch(e.request).then(function(response){
            log('[Service Worker] Fetch from server', e.request.url);
            cache.put(e.request.url, response.clone());
            return response;
          });
        })
      }
    })
  );
});
