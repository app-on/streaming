// Nombre del caché
const CACHE_NAME = "mi-cache-nv-1727223952535";
// Archivos a cachear durante la instalación del Service Worker
const URLS_TO_CACHE = ["/"];

// Durante la instalación del Service Worker, cachear los recursos definidos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Interceptar las peticiones de red
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Filtrar solo las peticiones de archivos HTML, JS y CSS
  if (
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".json") ||
    url.pathname.endsWith(".css")
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          // Opcional: Actualizar el caché en segundo plano
          fetch(event.request)
            .then((networkResponse) => {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            })
            .catch((err) => {
              console.log(err);
            });
          return response;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch((err) => {
            console.log(err);
          });
      })
    );
  }
});

// Activación del Service Worker y limpieza de cachés viejos
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
