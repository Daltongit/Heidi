/* Service worker: permite instalar la página y abrirla aunque falle la red un momento.
   Estrategia "red primero": siempre intenta traer lo más nuevo y, si no hay red, usa la copia guardada.
   No guarda Instagram, Supabase ni ntfy (esos siempre van directo a internet). */
const CACHE = "para-ti-v8";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./css/v2.css",
  "./css/v3.css",
  "./css/v4.css",
  "./js/config.js",
  "./js/sonidos.js",
  "./js/corazon.js",
  "./js/videos.js",
  "./js/voz.js",
  "./js/juego.js",
  "./js/mascotas.js",
  "./js/extrano.js",
  "./js/main.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ARCHIVOS).catch(function () { /* si falla algo, sigue igual */ });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.filter(function (c) { return c !== CACHE; }).map(function (c) { return caches.delete(c); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Solo guardamos archivos de esta misma página
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then(function (res) {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copia); });
        }
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match("./index.html"); });
      })
  );
});
