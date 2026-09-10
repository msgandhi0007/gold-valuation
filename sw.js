const CACHE_NAME = "gold-valuation-clean-20260910-step287";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if (
          request.method === "GET" &&
          response &&
          response.ok
        ) {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copy));
        }

        return response;
      })
      .catch(() => caches.match(request))
  );
});
