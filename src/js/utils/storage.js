import { openDB } from "idb";

const DB_NAME = "dstory-db";
const DB_VERSION = 3; // Incremented version for favorites feature
const STORIES_STORE = "stories";
const FAVORITES_STORE = "favorites"; // New store for favorite stories
const CACHE_NAME = "dstory-api-cache-v2";

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create stories store if it doesn't exist
      if (!db.objectStoreNames.contains(STORIES_STORE)) {
        const store = db.createObjectStore(STORIES_STORE, { keyPath: "id" });
        store.createIndex("by-date", "createdAt");
        store.createIndex("by-author", "authorId");
      }
      
      // Create favorites store for version 3
      if (oldVersion < 3 && !db.objectStoreNames.contains(FAVORITES_STORE)) {
        const favStore = db.createObjectStore(FAVORITES_STORE, { keyPath: "id" });
        favStore.createIndex("by-date-added", "dateAdded");
        favStore.createIndex("by-story-id", "storyId");
      }
      
      // Migration for version updates
      if (oldVersion < 2) {
        // Add any migration logic here
      }
    }
  });
};

// Original story functions
export const saveStory = async (story) => {
  const db = await initDB();
  const tx = db.transaction(STORIES_STORE, 'readwrite');
  const store = tx.objectStore(STORIES_STORE);
  await store.put(story);
  await tx.done;
  return story;
};

export const getStories = async () => {
  const db = await initDB();
  const tx = db.transaction(STORIES_STORE, 'readonly');
  const store = tx.objectStore(STORIES_STORE);
  return store.getAll();
};

export const getStoryById = async (id) => {
  const db = await initDB();
  const tx = db.transaction(STORIES_STORE, 'readonly');
  const store = tx.objectStore(STORIES_STORE);
  return store.get(id);
};

export const deleteStory = async (id) => {
  const db = await initDB();
  const tx = db.transaction(STORIES_STORE, 'readwrite');
  const store = tx.objectStore(STORIES_STORE);
  await store.delete(id);
  await tx.done;
};

// NEW: Favorite stories functions
export const addToFavorites = async (story) => {
  try {
    const db = await initDB();
    const tx = db.transaction(FAVORITES_STORE, 'readwrite');
    const store = tx.objectStore(FAVORITES_STORE);
    
    const favoriteStory = {
      ...story,
      dateAdded: new Date().toISOString(),
      storyId: story.id
    };
    
    await store.put(favoriteStory);
    await tx.done;
    
    console.log('Story added to favorites:', story.id);
    return favoriteStory;
  } catch (error) {
    console.error('Error adding story to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (storyId) => {
  try {
    const db = await initDB();
    const tx = db.transaction(FAVORITES_STORE, 'readwrite');
    const store = tx.objectStore(FAVORITES_STORE);
    
    await store.delete(storyId);
    await tx.done;
    
    console.log('Story removed from favorites:', storyId);
    return true;
  } catch (error) {
    console.error('Error removing story from favorites:', error);
    throw error;
  }
};

export const getFavorites = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(FAVORITES_STORE, 'readonly');
    const store = tx.objectStore(FAVORITES_STORE);
    const favorites = await store.getAll();
    
    // Sort by date added (newest first)
    return favorites.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const isFavorite = async (storyId) => {
  try {
    const db = await initDB();
    const tx = db.transaction(FAVORITES_STORE, 'readonly');
    const store = tx.objectStore(FAVORITES_STORE);
    const favorite = await store.get(storyId);
    
    return !!favorite;
  } catch (error) {
    console.error('Error checking if story is favorite:', error);
    return false;
  }
};

export const getFavoriteById = async (storyId) => {
  try {
    const db = await initDB();
    const tx = db.transaction(FAVORITES_STORE, 'readonly');
    const store = tx.objectStore(FAVORITES_STORE);
    return await store.get(storyId);
  } catch (error) {
    console.error('Error getting favorite by ID:', error);
    return null;
  }
};

export const clearAllFavorites = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(FAVORITES_STORE, 'readwrite');
    const store = tx.objectStore(FAVORITES_STORE);
    await store.clear();
    await tx.done;
    
    console.log('All favorites cleared');
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
};

export const getFavoriteCount = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(FAVORITES_STORE, 'readonly');
    const store = tx.objectStore(FAVORITES_STORE);
    return await store.count();
  } catch (error) {
    console.error('Error getting favorite count:', error);
    return 0;
  }
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