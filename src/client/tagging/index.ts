/**
 * Main export file for tagging module
 * Device fingerprinting and storage utilities
 */

import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { TaggingHandler } from './modules/tagging';
import { IStorageData } from './types';


class FPSTaggingClass {
    private key = '(global.c3)';

    public async getStorage (callback?: (storage: IStorageData) => void): Promise<IStorageData> {
        const storages : IStorageData = {
            indexedDB: await IndexedDBHandler.get(this.key),
            etag: ETagHandler.get(this.key),
            cacheAPI: CacheApiHandler.get(this.key),
            cookies: CookiesHandler.get(this.key),
            localStorage: LocalStorageHandler.get(this.key)
        };

        if (callback && typeof callback === 'function') {
            callback(storages);
        }

        return storages;
    }

    public async updateStorage (): Promise<boolean> {
        const storageHandlers = [
            IndexedDBHandler,
            ETagHandler,
            CacheApiHandler,
            CookiesHandler,
            LocalStorageHandler
        ];

        const targetDeviceID = await TaggingHandler.getDeviceId();

        if (!targetDeviceID) {
            return false;
        }

        let updateCount = 0;

        for (const handler of storageHandlers) {
            try {
                const currentValue = await handler.get(this.key);
                if (currentValue !== targetDeviceID) {
                    await handler.set(this.key, targetDeviceID);
                    updateCount++;
                }
            } catch (error) {
                // Silent error handling - no console output
            }
        }

        return updateCount > 0;
    }
}

// Initialize and expose globally
const fpsTagging = new FPSTaggingClass();

if (typeof window !== 'undefined') {
  (window).FPSTagging = fpsTagging;

  if (window.FPSTaggingAutoCollect) {
    document.addEventListener('DOMContentLoaded', async function() {
      const data = await fpsTagging.getStorage();

      if (window.FPSTaggingOnCollected && typeof window.FPSTaggingOnCollected === 'function') {
        window.FPSTaggingOnCollected(data);
      }
    });
  }
}

export default fpsTagging;