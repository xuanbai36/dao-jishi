// Service Worker:网络优先策略(页面始终拿最新版,离线时才用缓存)
var CACHE = "daojishi-v2";
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
  "./xiaban-daojishi.html",
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

  // 页面导航:网络优先 —— 先请求最新版,失败(离线)才用缓存
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (h) {
          return h || caches.match("./index.html");
        });
      })
    );
    return;
  }

  // 其他资源:缓存优先,未命中再请求
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
