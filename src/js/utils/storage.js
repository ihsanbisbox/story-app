import { openDB } from "idb";

const DB_NAME = "dstory-db";
const DB_VERSION = 2; // Incremented version
const STORE_NAME = "stories";
const CACHE_NAME = "dstory-api-cache-v2";

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        // Create indexes for better querying
        store.createIndex("by-date", "createdAt");
        store.createIndex("by-author", "authorId");
      }
      
      // Migration for version updates
      if (oldVersion < 2) {
        // Add any migration logic here
      }
    }
  });
};

export const saveStory = async (story) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put(story);
  await tx.done;
  return story;
};

export const getStories = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return store.getAll();
};

export const getStoryById = async (id) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return store.get(id);
};

export const deleteStory = async (id) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(id);
  await tx.done;
};

// Enhanced cache functions
export const cacheStoriesData = async (data) => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'X-Cached-At': new Date().toISOString()
      }
    });
    await cache.put('/api/stories-cache', response);
    return true;
  } catch (error) {
    console.error('Error caching stories data:', error);
    return false;
  }
};

export const getCachedStoriesData = async () => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/api/stories-cache');
    
    if (response) {
      const data = await response.json();
      const cachedAt = response.headers.get('X-Cached-At');
      return { data, cachedAt };
    }
    return null;
  } catch (error) {
    console.error('Error getting cached stories data:', error);
    return null;
  }
};

export const clearCache = async () => {
  try {
    await caches.delete(CACHE_NAME);
    console.log('Cache cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Enhanced connection utilities
export const isOnline = () => {
  return navigator.onLine;
};

export const setupConnectionListener = (onOnline, onOffline) => {
  const handleOnline = () => {
    console.log('Connection restored');
    onOnline?.();
  };

  const handleOffline = () => {
    console.log('Connection lost');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Additional utility for syncing data when back online
export const syncWhenOnline = async (syncFunction) => {
  if (isOnline()) {
    return syncFunction();
  } else {
    return new Promise((resolve) => {
      const cleanup = setupConnectionListener(
        () => {
          syncFunction().then(resolve);
          cleanup();
        },
        null
      );
    });
  }
};