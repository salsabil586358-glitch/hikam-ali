const CACHE = "hikam-ali-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/icon-192.png",
  "/icon-512.png",
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700&display=swap"
];

// تثبيت: خزّن كل الملفات
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // خزّن الملفات المحلية فقط بشكل إلزامي
      return cache.addAll(["/", "/index.html", "/icon-192.png", "/icon-512.png"])
        .then(() => {
          // حاول تخزين الخطوط (اختياري — قد يفشل بدون نت)
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

// الطلبات: Cache First ثم الشبكة
self.addEventListener("fetch", e => {
  // تجاهل الطلبات غير GET
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(response => {
          // خزّن في الكاش للمرة القادمة
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return response;
        })
        .catch(() => {
          // إذا فشل الطلب ولا يوجد كاش — أرجع الصفحة الرئيسية
          if (e.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
