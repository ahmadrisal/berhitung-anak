// Naikkan VERSI setiap kali file game diubah supaya perangkat mengambil versi baru.
const VERSI = 'berhitung-v1';
const FILES = ['./', 'index.html', 'game.js', 'manifest.json', 'icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSI).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
