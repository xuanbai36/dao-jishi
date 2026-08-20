// Service Worker v3:网络优先(页面拿最新版)+ 缓存优先(静态资源)+ 全站预缓存(离线可用)
// 更新版本号后部署,浏览器会自动替换旧缓存(activate 阶段清理旧版本)
var CACHE = "daojishi-v3";
var CORE = [
  "./",
  "./index.html",
  "./404.html",
  "./manifest.json",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./og-image.png",
  "./kaoyan-daojishi.html",
  "./guokao-daojishi.html",
  "./gaokao-daojishi.html",
  "./siliuji-daojishi.html",
  "./zhongkao-daojishi.html",
  "./chunjie-daojishi.html",
  "./yuandan-daojishi.html",
  "./jiazi-daojishi.html",
  "./shengkao-daojishi.html",
  "./erji-daojishi.html",
  "./duanwu-daojishi.html",
  "./zhongqiu-daojishi.html",
  "./guoqing-daojishi.html",
  "./qixi-daojishi.html",
  "./shengdan-daojishi.html",
  "./zhuan-shengben-daojishi.html",
  "./yuchanqi-daojishi.html",
  "./zidingyi-daojishi.html",
  "./xiaban-daojishi.html",
  "./fanqiezhong.html",
  "./shuimian-jisuanqi.html",
  "./riqi-jisuanqi.html",
  "./shijie-shizhong.html",
  "./fenxiang-haibao.html",
  "./wenben-gongju.html",
  "./kaoshi-yueli.html",
  "./wenzhang.html",
  "./about.html",
  "./privacy.html",
  "./terms.html",
  "./share.html"
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

  // 其他资源:缓存优先,未命中再请求并写入缓存
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
