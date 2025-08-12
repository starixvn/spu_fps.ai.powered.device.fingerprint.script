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

    constructor() {
        
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol;
            const hostname = window.location.hostname;
            const port = window.location.port ? `:${window.location.port}` : '';
            ETagHandler.setBaseUrl(`${protocol}//${hostname}${port}`);
        }
    }

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
  (window as any).Tagging = tagging;
}

export default tagging;