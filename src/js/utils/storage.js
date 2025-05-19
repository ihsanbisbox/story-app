import { openDB } from "idb";

const DB_NAME = "dstory-db";
const DB_VERSION = 1;
const STORE_NAME = "stories";

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    }
  });
};

export const saveStory = async (story) => {
  const db = await initDB();
  return db.put(STORE_NAME, story);
};

export const getStories = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

export const deleteStory = async (id) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
};
