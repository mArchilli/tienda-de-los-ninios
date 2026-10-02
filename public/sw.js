// Service worker mínimo: hace la app instalable y muestra una página offline
// cuando no hay conexión. No cachea páginas ni respuestas de la API a propósito
// (carrito, sesión, CSRF y panel admin deben ser siempre datos frescos).
const CACHE = 'tienda-pwa-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png', '/images/logo.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Solo interceptamos navegaciones; el resto va directo a la red.
    if (request.mode !== 'navigate') {
        return;
    }

    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
});
