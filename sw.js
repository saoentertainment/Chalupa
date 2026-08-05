// 🛡️ Service Worker - SAO Control · La Chalupa
// Estrategia: Cache-first (funciona offline)

const CACHE_NAME = 'sao-chalupa-v1';

const ARCHIVOS = [
    './',
    './index.html',
    './manifest.json'
];

// 📦 INSTALAR: guarda los archivos en el baúl
self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ARCHIVOS))
    );
    self.skipWaiting();
});

// 🧹 ACTIVAR: borra baúles viejos (versiones anteriores)
self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys().then((nombres) => {
            return Promise.all(
                nombres
                    .filter((nombre) => nombre !== CACHE_NAME)
                    .map((nombre) => caches.delete(nombre))
            );
        }).then(() => self.clients.claim())
    );
});

// 🔍 BUSCAR: primero busca en el baúl, si no está, va a internet
self.addEventListener('fetch', (evento) => {
    evento.respondWith(
        caches.match(evento.request).then((respuestaGuardada) => {
            if (respuestaGuardada) {
                return respuestaGuardada; // ✅ Estaba en el baúl
            }
            return fetch(evento.request).then((respuesta) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    if (evento.request.method === 'GET' && respuesta.status === 200) {
                        cache.put(evento.request, respuesta.clone());
                    }
                    return respuesta;
                });
            });
        }).catch(() => caches.match('./index.html'))
    );
});
