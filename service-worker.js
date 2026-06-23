importScripts('./data/build-info.js');
const BUILD = globalThis.F1M_BUILD || { version:'dev', build_code:'F1M3D-dev', app_shell_schema:0 };
const CACHE_NAME = `f1m-${String(BUILD.build_code || BUILD.version).replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-s${Number(BUILD.app_shell_schema || 0)}`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./data/build-info.js",
  "./src/core/build-system.js",
  "./src/core/runtime-guard.js",
  "./src/core/event-bus.js",
  "./src/core/data-contracts.js",
  "./data/asset-catalog.js",
  "./src/core/asset-registry.js",
  "./src/systems/persistence-system.js",
  "./src/systems/career-system.js",
  "./src/systems/race-engine.js",
  "./src/ui/screen-manager.js",
  "./src/core/viewport-manager.js",
  "./src/core/performance-monitor.js",
  "./src/core/diagnostics.js",
  "./data/i18n.js",
  "./src/core/i18n-system.js",
  "./data/sporting-data.js",
  "./src/core/sporting-database.js",
  "./data/regulation-data.js",
  "./src/core/regulation-engine.js",
  "./data/vehicle-data.js",
  "./src/core/vehicle-physics.js",
  "./data/balance-data.js",
  "./src/core/balance-simulator.js",
  "./data/visual-data.js",
  "./src/core/track-visual-system.js",
  "./data/audio-ui-data.js",
  "./src/core/audio-ui-system.js",
  "./src/core/living-career-system.js",
  "./data/living-career-data.js",
  "./data/backend-launch-data.js",
  "./src/core/backend-launch-system.js",
  "./data/release-candidate-data.js",
  "./src/core/release-candidate-system.js",
  "./data/visual-hotfix-data.js",
  "./src/core/visual-hotfix-system.js",
  "./src/core/public-beta-assets-system.js",
  "./data/public-beta-assets-data.js",
  "./src/core/gameplay-polish-system.js",
  "./data/gameplay-polish-data.js",
  "./data/game-data.js",
  "./data/track-layouts.js",
  "./script.js",
  "./manifest.webmanifest",
  "./data/strategy-data.js",
  "./src/core/race-strategy-ai.js",
  "./data/deployment-data.js",
  "./src/core/deployment-system.js",
  "./data/operations-data.js",
  "./src/core/operations-system.js",
  "./src/core/asset-restore-system.js",
  "./data/asset-restore-data.js"
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(error => {
    console.warn('[F1M:SW] app shell parcial', error);
  }));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('message', event => {
  if(event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if(event.data?.type === 'CLEAR_CACHE') event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))));
  if(event.data?.type === 'GET_BUILD') event.source?.postMessage?.({type:'F1M_BUILD', build:BUILD, cache:CACHE_NAME});
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;
  const isNavigation = event.request.mode === 'navigate';
  const isAppShell = APP_SHELL.some(item => new URL(item, self.location.href).pathname === url.pathname);

  if(isNavigation){
    event.respondWith(fetch(event.request).then(response => {
      if(response.ok) caches.open(CACHE_NAME).then(cache => cache.put('./index.html', response.clone())).catch(()=>{});
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }

  if(isAppShell){
    event.respondWith(caches.match(event.request).then(cached => {
      const refresh = fetch(event.request).then(response => {
        if(response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone())).catch(()=>{});
        return response;
      }).catch(() => cached);
      return cached || refresh;
    }));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if(response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone())).catch(()=>{});
    return response;
  }).catch(() => caches.match('./index.html'))));
});
