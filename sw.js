const CACHE_NAME = 'smartpay-trips-v6';

// Файлы, которые нужны для работы без интернета
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './smartpay-logo.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  // Кэшируем оболочку приложения при установке
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Не кэшируем запросы к API Google
  if (event.request.url.includes('script.google.com') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request, { cache: 'no-store' });
    })
  );
});