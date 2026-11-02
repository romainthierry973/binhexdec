/* Service worker Bin·Hex·Déc : l'application fonctionne hors ligne.
   Après une mise à jour des fichiers, augmenter le numéro de VERSION. */
const VERSION = "binhexdec-v12";
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./fonts/archivo-latin-500-normal.woff2",
  "./fonts/archivo-latin-700-normal.woff2",
  "./fonts/archivo-latin-800-normal.woff2",
  "./fonts/ibm-plex-mono-latin-400-normal.woff2",
  "./fonts/ibm-plex-mono-latin-500-normal.woff2",
  "./fonts/ibm-plex-mono-latin-600-normal.woff2",
  "./fonts/ibm-plex-sans-latin-400-normal.woff2",
  "./fonts/ibm-plex-sans-latin-500-normal.woff2",
  "./fonts/ibm-plex-sans-latin-600-normal.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    // page : réseau d'abord (pour recevoir les mises à jour), sinon la copie hors ligne
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put("./index.html", copy)); return res;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  // autres fichiers : copie hors ligne d'abord
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
