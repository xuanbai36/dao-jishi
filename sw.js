// Service Worker:基础离线缓存
var CACHE = "daojishi-v1";
var CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./kaoyan-daojishi.html",
  "./guokao-daojishi.html",
  "./gaokao-daojishi.html",
  "./siliuji-daojishi.html",
  "./chunjie-daojishi.html",
  "./zidingyi-daojishi.html",
  "./riqi-jisuanqi.html",
  "./fanqiezhong.html",
  "./shuimian-jisuanqi.html",
  "./wenben-gongju.html",
  "./wenzhang.html"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(CORE);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res.ok && (res.type === "basic" || res.type === "cors")) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        if (e.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
