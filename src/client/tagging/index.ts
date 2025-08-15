import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { TaggingHandler } from './tagging';
import { WindowNameHandler } from './modules/windowName';
import { IStorageHandler } from './types';


class TaggingClass {
    private newKey = 'pwr_client_sync';
    private readonly storageHandlers: IStorageHandler[];
    private readonly etagHandler: ETagHandler;

    constructor() {
        this.etagHandler = new ETagHandler();

        this.storageHandlers = [
            new IndexedDBHandler(),
            this.etagHandler,
            new CacheApiHandler(),
            new CookiesHandler(),
            new LocalStorageHandler(),
            new WindowNameHandler()
        ];

        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol;
            const hostname = window.location.hostname;
            const port = window.location.port ? `:${window.location.port}` : '';
            this.etagHandler.setBaseUrl(`${protocol}//${hostname}${port}`);
        }
    }

    public async getStorage (): Promise<string> {
        const storageHandlers = this.storageHandlers;

        let targetTaggingValue = await TaggingHandler.getTaggingValue();

        if (!targetTaggingValue) {
            targetTaggingValue = TaggingHandler.generateTagging();
        }

        await Promise.all(
        storageHandlers.map(async (handler) => {
            const currentValue = await handler.get(this.newKey);
            if (currentValue !== targetTaggingValue) {
                await handler.set(this.newKey, targetTaggingValue);
            }
        }));

        return targetTaggingValue;
    }
}

// Initialize and expose globally
const tagging = new TaggingClass();

if (typeof window !== 'undefined') {
  (window as any).Tagging = tagging;
}

export default tagging;