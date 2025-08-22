import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { TaggingHandler } from './tagging';
import { WindowNameHandler } from './modules/windowName';
import { IStorageHandler } from './types';

const STORAGE_KEY = '__STORAGE_NEW_KEY__';

class TaggingClass {
    private readonly storageHandlers: IStorageHandler[];

    constructor() {
        this.storageHandlers = [
            new IndexedDBHandler(),
            new ETagHandler(),
            new CacheApiHandler(),
            new CookiesHandler(),
            new LocalStorageHandler(),
            new WindowNameHandler()
        ];
    }

    public async getStorage (): Promise<string> {
        const storageHandlers = this.storageHandlers;

        let targetTaggingValue = await TaggingHandler.getTaggingValue();

        if (!targetTaggingValue) {
            targetTaggingValue = TaggingHandler.generateTagging();
        }

        await Promise.all(
        storageHandlers.map(async (handler) => {
            const currentValue = await handler.get(STORAGE_KEY);
            if (currentValue !== targetTaggingValue) {
                await handler.set(STORAGE_KEY, targetTaggingValue);
            }
        }));

        return targetTaggingValue;
    }
}

const tagging = new TaggingClass();

if (typeof window !== 'undefined') {
  (window as any).Tagging = tagging;

  (window as any).TaggingReady = (async () => {
    return await tagging.getStorage();
  })();
}

export default tagging;