const CACHE_NAME = "dstory-cache-v2";
const API_CACHE_NAME = "dstory-api-cache-v2";
const IMAGE_CACHE_NAME = "dstory-image-cache-v2";

// Daftar URL yang akan di-cache
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/styles.css",
  "/bundle.js",
  "/images/icons/icon-72x72.png",
  "/images/icons/icon-96x96.png",
  "/images/icons/icon-128x128.png",
  "/images/icons/icon-144x144.png",
  "/images/icons/icon-152x152.png",
  "/images/icons/icon-192x192.png",
  "/images/icons/icon-384x384.png",
  "/images/icons/icon-512x512.png",
  "/offline.html"
];

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching App Shell");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("Service Worker: Skip Waiting");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Cache failed", error);
      })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log("Service Worker: Clearing Old Cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Claiming Clients");
        return self.clients.claim();
      })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.origin === "https://story-api.dicoding.dev") {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle image requests
  if (request.destination === "image") {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests (CSS, JS, etc.)
  event.respondWith(handleResourceRequest(request));
});

// Handle API requests with Network First strategy
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log("Service Worker: Network failed, trying cache");
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API
    return new Response(
      JSON.stringify({ 
        error: true, 
        message: "Offline - Data tidak tersedia" 
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// Handle image requests with Cache First strategy
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log("Service Worker: Image request failed");
    // Return a placeholder image or default response
    return new Response("", { 
      status: 404, 
      statusText: "Image not found" 
    });
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log("Service Worker: Navigation failed, serving offline page");
    const cache = await caches.open(CACHE_NAME);
    const offlineResponse = await cache.match("/offline.html");
    return offlineResponse || cache.match("/index.html");
  }
}

// Handle resource requests (CSS, JS, etc.) with Cache First strategy
async function handleResourceRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log("Service Worker: Resource request failed");
    return new Response("", { 
      status: 404, 
      statusText: "Resource not found" 
    });
  }
}

// Background sync (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log("Service Worker: Background sync triggered");
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementasi background sync
  console.log("Service Worker: Performing background sync");
}

// Push notification (optional)
self.addEventListener('push', (event) => {
  console.log("Service Worker: Push received");
  
  const options = {
    body: event.data ? event.data.text() : 'Notifikasi baru dari DStory',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Lihat Cerita',
        icon: '/images/icons/view-icon.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/images/icons/close-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('DStory', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log("Service Worker: Notification clicked");
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});