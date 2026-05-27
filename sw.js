const CACHE = "hikam-ali-v2";

// كل الملفات اللازمة للعمل بلا نت
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/screenshot-mobile.png"
];

// تثبيت: خزّن كل الملفات المحلية
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS)
        .then(() => {
          // حاول تخزين الخطوط (اختياري)
          return fetch("https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap")
            .then(r => cache.put("https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap", r))
            .catch(() => {});
        });
    })
  );
  self.skipWaiting();
});

// تفعيل: احذف الكاش القديم
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// الطلبات: Cache First — يعمل بلا نت
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached; // ← رجّع من الكاش مباشرة (بلا نت يعمل)

      return fetch(e.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return response;
        })
        .catch(() => {
          // إذا لا نت ولا كاش — أرجع الصفحة الرئيسية
          if (e.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
