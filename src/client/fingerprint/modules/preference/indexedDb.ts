import type { IndexedDBInfo } from "../../types";

export async function collectIndexedDB(): Promise<IndexedDBInfo> {
  try {
    const indexedDBSupported = await getIndexedDB();

    return {
      indexedDB:
        typeof indexedDBSupported === "boolean" ? indexedDBSupported : false,
    };
  } catch (error) {
    return { indexedDB: false };
  }
}

async function getIndexedDB(): Promise<boolean> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return false;
  }

  const testDBName = `fps_test_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`;

  return new Promise((resolve) => {
    let resolved = false;

    const cleanup = (db?: IDBDatabase) => {
      if (db) db.close();

      try {
        window.indexedDB.deleteDatabase(testDBName);
      } catch {}
    };

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, 4000); // 4s timeout to avoid hanging

    try {
      const request = window.indexedDB.open(testDBName, 1);

      request.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(false);
        }
      };

      request.onsuccess = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          cleanup(request.result);
          resolve(true);
        }
      };

      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains("test")) {
            db.createObjectStore("test", { keyPath: "id" });
          }
        } catch {}
      };
    } catch (err) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(false);
      }
    }
  });
}
