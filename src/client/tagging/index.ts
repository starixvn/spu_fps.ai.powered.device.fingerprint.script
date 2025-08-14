import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { TaggingHandler } from './modules/tagging';
import { WindowNameHandler } from './modules/windowName';


class TaggingClass {
    private newKey = 'pwr_client_sync';

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
            CacheApiHandler,
            CookiesHandler,
            LocalStorageHandler,
            WindowNameHandler
        ];

        let targetTagValue = await TaggingHandler.getTagValue();

        let updateCount = 0;

        for (const handler of storageHandlers) {
                const currentValue = await handler.get(this.newKey);

                if (currentValue !== targetTagValue) {
                    await handler.set(this.newKey, targetTagValue);
                    updateCount++;
                }
        }

        ETagHandler.set(targetTagValue);

        return targetTagValue;
    }
}

// Initialize and expose globally
const tagging = new TaggingClass();

if (typeof window !== 'undefined') {
  (window as any).Tagging = tagging;
}

export default tagging;