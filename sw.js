// 🛡️ Service Worker - SAO Control · La Chalupa
// Estrategia: Network-first (siempre lo último; offline usa el baúl)

const CACHE_NAME = 'sao-chalupa-v2';

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

// 🧹 ACTIVAR: borra baúles viejos
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

// 🔍 BUSCAR: primero internet, si no hay → usa el baúl
self.addEventListener('fetch', (evento) => {
    evento.respondWith(
        fetch(evento.request)
            .then((respuesta) => {
                // Mientras hay internet, guardamos una copia en el baúl
                const copia = respuesta.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    if (evento.request.method === 'GET' && respuesta.status === 200) {
                        cache.put(evento.request, copia);
                    }
                });
                return respuesta;
            })
            .catch(() => {
                // 📵 Sin internet → buscamos en el baúl
                return caches.match(evento.request).then((guardado) => {
                    return guardado || caches.match('./index.html');
                });
            })
    );
});
