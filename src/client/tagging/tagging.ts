import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { WindowNameHandler } from './modules/windowName';
import { DeviceFactory } from '../deviceFactory';

export const STORAGE_KEYS = {
    localStorage: "__localStorage_key__",
    cookies: "__cookies_key__",
    indexedDB: "__indexedDB_key__",
    cache: "__cache_key__",
    windowName: "__window_key__",
    etag: "__etag_key__"
};

export class TaggingHandler {

    private static readonly oldKey = "(global.c3)";

    public static async getTaggingValue(): Promise<string | null> {
        const storageHandlers = [
            { handler: new IndexedDBHandler(), oldKey: this.oldKey, newKey: STORAGE_KEYS.indexedDB },
            { handler: new ETagHandler(), oldKey: this.oldKey, newKey: STORAGE_KEYS.etag },
            { handler: new CacheApiHandler(), oldKey: this.oldKey, newKey: STORAGE_KEYS.cache },
            { handler: new CookiesHandler(), oldKey: "gfp", newKey: STORAGE_KEYS.cookies },
            { handler: new LocalStorageHandler(), oldKey: this.oldKey, newKey: STORAGE_KEYS.localStorage },
            { handler: new WindowNameHandler(), oldKey: this.oldKey, newKey: STORAGE_KEYS.windowName }
        ];

        for (const handlerConfig of storageHandlers) {
            const keys = [handlerConfig.oldKey, handlerConfig.newKey];
            
            for (const key of keys) {
                let value = await this.getStoredValue(key, handlerConfig.handler);

                if (value && DeviceFactory.isValidTagging(value)) {
                    return value;
                } 
            }
        }

        return null;
    }

    private static async getStoredValue(key: string, handler: any): Promise<string | null> {
        return await handler.get(key);
    }
}









