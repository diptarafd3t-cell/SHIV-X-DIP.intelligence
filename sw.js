self.addEventListener('install', (e) => {
    console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
    // A basic pass-through fetch handler is enough to satisfy PWA requirements
    e.respondWith(fetch(e.request).catch(() => console.log('Network request failed')));
});
