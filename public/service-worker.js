// Simple service worker for PWA offline support
const CACHE_NAME = 'vsb-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/image/logo-nav.png',
  '/image/VSB-logo.png',
  // Add more assets as needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
