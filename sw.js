const CACHE = "fiber-forms-v42";
const ASSETS = ["./", "./index.html", "./manifest.json", "./privacy.html",
                "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png",
                "./maskable-192.png", "./maskable-512.png"];

/* cache: "reload" skips the browser's own HTTP cache, so a new version
   never gets stored with a stale copy of index.html inside it */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(u => new Request(u, {cache: "reload"}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* The page itself: network first, so an update shows on the very next open.
   No signal (or slower than 4 s) -> the saved copy, so it still works offline.
   Everything else (icons, manifest): saved copy first. */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isPage = req.mode === "navigate" || url.pathname.endsWith("/index.html");
  if (isPage) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const net = await Promise.race([
          fetch(req, {cache: "no-store"}),
          new Promise((_, rej) => setTimeout(() => rej(new Error("slow")), 4000))
        ]);
        if (net && net.ok) {
          cache.put("./index.html", net.clone());
          return net;
        }
        throw new Error("bad response");
      } catch (err) {
        return (await cache.match("./index.html")) || (await cache.match("./")) || fetch(req);
      }
    })());
    return;
  }

  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req))
  );
});
