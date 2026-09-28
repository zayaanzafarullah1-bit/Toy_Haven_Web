/* ==========================================================================
   service-worker.js
   Caches the "app shell" (HTML, CSS, JS) on install so Toy Haven's core
   pages still load when the visitor is offline or on a flaky connection.
   Registered from js/main.js: navigator.serviceWorker.register("service-worker.js")
   ========================================================================== */

const CACHE_NAME = "toy-haven-cache-v1";

const APP_SHELL = [
  "./",
  "index.html",
  "products.html",
  "cart.html",
  "checkout.html",
  "wishlist.html",
  "feedback.html",
  "css/style.css",
  "js/data.js",
  "js/main.js",
  "js/products.js",
  "js/cart.js",
  "js/checkout.js",
  "js/wishlist.js",
  "js/feedback.js",
  "manifest.json"
];

// Install: pre-cache the app shell so the site works offline immediately.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: remove any caches from a previous version of the service worker.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for app-shell files, falling back to the network,
// and caching new same-origin GET responses (e.g. product images) as they arrive.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response.ok && event.request.url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match("index.html"));
    })
  );
});
