import type { IndexedDBInfo } from "../../types";

export async function collectIndexedDB(): Promise<IndexedDBInfo> {
  try {
    const indexedDB = await getIndexedDB();
    return { indexedDB };
  } catch (error) {
    return { indexedDB: false };
  }
}

async function getIndexedDB(): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !window.indexedDB) {
      return false;
    }

    const testDBName = `test_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);
      const request = window.indexedDB.open(testDBName, 1);

      request.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      request.onsuccess = () => {
        clearTimeout(timeout);
        const db = request.result;
        db.close();

        window.indexedDB.deleteDatabase(testDBName);
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("test")) {
          db.createObjectStore("test", { keyPath: "id" });
        }
      };
    });
  } catch {
    return false;
  }
}
