import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { WindowNameHandler } from './modules/windowName';
import { DeviceFactory } from '../deviceFactory';
import { ITaggingResult } from './types';

export const STORAGE_KEYS = {
    localStorage: "__localStorage_key__",
    cookies: "__cookies_key__",
    indexedDB: "__indexedDB_key__",
    cache: "__cache_key__",
    windowName: "__window_key__",
    etag: "__etag_key__"
};

const taggingOrder = {
    [STORAGE_KEYS.indexedDB]: {
        id: 1,
        order: 1,
    },
    [STORAGE_KEYS.etag]: {
        id: 2,
        order: 2
    },
    [STORAGE_KEYS.cache]: {
        id: 3,
        order: 3
    },
    [STORAGE_KEYS.cookies]: {
        id: 4,
        order: 4
    },
    [STORAGE_KEYS.localStorage]: {
        id: 5,
        order: 5
    },
    [STORAGE_KEYS.windowName]: {
        id: 6,
        order: 6
    }
}

export class TaggingHandler {

    private static readonly oldKey = "(global.c3)";

    private static computeTaggingType(key: string): number {
        return taggingOrder[key].order * 100 + taggingOrder[key].id * 10;
    }

    public static async getTaggingFromStorages(): Promise<ITaggingResult> {
        const storageHandlers = [
            { handler: new IndexedDBHandler(), oldKey: this.oldKey, newKey: STORAGE_KEYS.indexedDB },
            { handler: new ETagHandler(), oldKey: "", newKey: STORAGE_KEYS.etag },
            { handler: new CacheApiHandler(), oldKey: "", newKey: STORAGE_KEYS.cache },
            { handler: new CookiesHandler(), oldKey: "gfp", newKey: STORAGE_KEYS.cookies },
            { handler: new LocalStorageHandler(), oldKey: this.oldKey, newKey: STORAGE_KEYS.localStorage },
            { handler: new WindowNameHandler(), oldKey: "", newKey: STORAGE_KEYS.windowName }
        ];

        for (const handlerConfig of storageHandlers) {
            if(handlerConfig.oldKey != "") {
                let value = await this.getStoredValue(handlerConfig.oldKey, handlerConfig.handler);
                if (value && DeviceFactory.isValidTagging(value)) {
                    return { key: handlerConfig.newKey, value: value, type: this.computeTaggingType(handlerConfig.newKey) };
                }                
            }

            let value = await this.getStoredValue(handlerConfig.newKey, handlerConfig.handler);
            if (value && DeviceFactory.isValidTagging(value)) {
                return { key: handlerConfig.newKey, value: value, type: this.computeTaggingType(handlerConfig.newKey) };
            }
        }

        return { key: undefined, value: undefined, type: undefined };
    }

    private static async getStoredValue(key: string, handler: any): Promise<string | null> {
        return await handler.get(key);
    }
}









