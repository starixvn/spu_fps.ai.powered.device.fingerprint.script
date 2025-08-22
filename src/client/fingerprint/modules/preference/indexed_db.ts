interface IndexedDBResult {
  indexedDB: boolean;
}

export async function collectIndexedDB(): Promise<IndexedDBResult> {
  try {
    const indexedDB = await getIndexedDB();
    console.log("IndexedDB fingerprint collected:", { indexedDB });

    return { indexedDB };
  } catch (error) {
    console.error("Error collecting IndexedDB status:", error);
    return { indexedDB: false };
  }
}

async function getIndexedDB(): Promise<boolean> {
  try {
    if (typeof window !== "undefined" && window.indexedDB) {
      const testDBName = "fps_indexeddb_test";
      const testStoreName = "test_store";

      const request = window.indexedDB.open(testDBName, 1);

      return new Promise((resolve) => {
        request.onerror = () => {
          resolve(false);
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          db.close();
          const deleteRequest = window.indexedDB.deleteDatabase(testDBName);

          deleteRequest.onsuccess = () => {
            resolve(true);
          };

          deleteRequest.onerror = () => {
            resolve(true);
          };
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains(testStoreName)) {
            db.createObjectStore(testStoreName, { keyPath: "id" });
          }
        };
      });
    }

    return false;
  } catch {
    return false;
  }
}
