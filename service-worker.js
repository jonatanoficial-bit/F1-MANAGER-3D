const CACHE_NAME = 'f1-manager-career-2026-v0-9-37';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data/game-data.js',
  './data/track-layouts.js',
  './manifest.webmanifest'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => undefined));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if(event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))));
  }
});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== location.origin) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      if(response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => undefined);
      return response;
    }).catch(() => cached || caches.match('./index.html')))
  );
});
