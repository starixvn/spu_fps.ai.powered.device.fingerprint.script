import type { IndexedDBInfo, Bit } from '../../types';
import { isEdgeHTML, isTrident } from '../../utils/browser';
import { FingerprintSpecialValue } from '../../utils/consts';

export async function collectIndexedDB(): Promise<IndexedDBInfo> {
  try {
    if (isTrident() || isEdgeHTML()) return FingerprintSpecialValue.UNDEFINED;

    if (typeof window === 'undefined' || !window.indexedDB)
      return FingerprintSpecialValue.UNDEFINED;

    try {
      const tmp = window.indexedDB;
      if (!tmp) return 0;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'SecurityError') return 1;

      return FingerprintSpecialValue.ERROR;
    }

    // Open test database
    const testDBName = `fps_test_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;

    return await new Promise<Bit | FingerprintSpecialValue>((resolve) => {
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
          resolve(FingerprintSpecialValue.ERROR);
        }
      }, 4000);

      try {
        const request = window.indexedDB.open(testDBName, 1);

        request.onerror = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            resolve(FingerprintSpecialValue.ERROR);
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
            if (!db.objectStoreNames.contains('test')) {
              db.createObjectStore('test', {
                keyPath: 'id',
              });
            }
          } catch {}
        };
      } catch (e) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);

          if (e instanceof DOMException && e.name === 'SecurityError') {
            resolve(1);
          } else {
            resolve(FingerprintSpecialValue.ERROR);
          }
        }
      }
    });
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}
