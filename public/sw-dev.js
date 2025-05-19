self.addEventListener('install', () => {
  console.log('Development service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Development service worker activated');
});

self.addEventListener('fetch', () => {
  // No caching for development
});
