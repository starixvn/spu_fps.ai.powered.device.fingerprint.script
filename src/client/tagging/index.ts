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


class TaggingClass {
    private newKey = '(global.c4)';

    public async getStorage (): Promise<string> {
        const storageHandlers = [
            IndexedDBHandler,
            ETagHandler,
            CacheApiHandler,
            CookiesHandler,
            LocalStorageHandler
        ];

        let targetDeviceID = await TaggingHandler.getDeviceId();

        let updateCount = 0;

        for (const handler of storageHandlers) {
                const currentValue = await handler.get(this.newKey);

                if (currentValue !== targetDeviceID) {
                    await handler.set(this.newKey, targetDeviceID);
                    updateCount++;
                }
        }

        return targetDeviceID;
    }
}

// Initialize and expose globally
const tagging = new TaggingClass();

if (typeof window !== 'undefined') {
  (window).Tagging = tagging;

  if (window.TaggingAutoCollected) {
    document.addEventListener('DOMContentLoaded', async function() {
      const data = await tagging.getStorage();

      if (window.TaggingOnCollected && typeof window.TaggingOnCollected === 'function') {
        window.TaggingOnCollected(data);
      }
    });
  }
}

export default tagging;