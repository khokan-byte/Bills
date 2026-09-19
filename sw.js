const CACHE = 'meter-log-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./'])).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const store = res => {
    if (res && (res.ok || res.type === 'opaque')) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(r, copy));
    }
    return res;
  };
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(store).catch(() => caches.match(r).then(h => h || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(store)));
});
