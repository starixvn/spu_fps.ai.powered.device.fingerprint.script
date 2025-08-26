import { PacketTransformer , GuidGenerator } from './utils/hash';
import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { WindowNameHandler } from './modules/windowName';

export const STORAGE_KEYS = {
    localStorage: "__localStorage_key__",
    cookies: "__cookies_key__",
    indexedDB: "__indexedDB_key__",
    cache: "__cache_key__",
    windowName: "__window_key__",
    etag: "__etag_key__"
};

export class TaggingHandler {

    public static async getTaggingValue(): Promise<string | null> {
        const storageHandlers = [
            { handler: new IndexedDBHandler(), oldKey: "(global.c3)", newKey: STORAGE_KEYS.indexedDB },
            { handler: new ETagHandler(), oldKey: "(global.c3)", newKey: STORAGE_KEYS.etag },
            { handler: new CacheApiHandler(), oldKey: "(global.c3)", newKey: STORAGE_KEYS.cache },
            { handler: new CookiesHandler(), oldKey: "gfp", newKey: STORAGE_KEYS.cookies },
            { handler: new LocalStorageHandler(), oldKey: "(global.c3)", newKey: STORAGE_KEYS.localStorage },
            { handler: new WindowNameHandler(), oldKey: "(global.c3)", newKey: STORAGE_KEYS.windowName }
        ];

        for (const handlerConfig of storageHandlers) {
            const keys = [handlerConfig.oldKey, handlerConfig.newKey];
            
            for (const key of keys) {
                let value = await this.getStoredValue(key, handlerConfig.handler);

                if (value && this.isValidTagging(value)) {
                    return value;
                } 
            }
        }

        return null;
    }

    public static generateTagging(): string {
        const guid = GuidGenerator.generateGuid();
        const encryptedGuid = PacketTransformer.wrapMessage(guid);

        return encryptedGuid;
    }

    public static isValidTagging(taggingValue: string): boolean {
        try {
            if (!taggingValue || taggingValue.trim() === '') {
                return false;
            }

            const decryptedTagging = PacketTransformer.unwrapMessage(taggingValue);

            return this.isValidGuid(decryptedTagging);
        } catch (error) {
            return false;
        }
    }

    private static isValidGuid(guid: string): boolean {
        if (!guid) {
            return false;
        }

        const guidWithoutHyphensRegex = /^[0-9a-f]{32}$/i;
        
        return guidWithoutHyphensRegex.test(guid);
    }

    private static async getStoredValue(key: string, handler: any): Promise<string | null> {
        return await handler.get(key);
    }
}









