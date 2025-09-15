import type { IndexedDBInfo, Bit } from "../../types";
import { boolToBit } from "../../utils/data";

export async function collectIndexedDB(): Promise<IndexedDBInfo> {
  try {
    const indexedDBSupported = await getIndexedDB();

    return {
      indexedDB: indexedDBSupported,
    };
  } catch (error) {
    return { indexedDB: 0 };
  }
}

async function getIndexedDB(): Promise<Bit> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return 0;
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
        resolve(0);
      }
    }, 4000); // 4s timeout to avoid hanging

    try {
      const request = window.indexedDB.open(testDBName, 1);

      request.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(0);
        }
      };

      request.onsuccess = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          cleanup(request.result);
          resolve(1);
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
        resolve(0);
      }
    }
  });
}
