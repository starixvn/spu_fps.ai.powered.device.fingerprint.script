import { PacketTransformer , GuidGenerator } from './utils/hash';
import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { WindowNameHandler } from './modules/windowName';

const STORAGE_OLD_KEY = "__STORAGE_OLD_KEY__";
const STORAGE_NEW_KEY = "__STORAGE_NEW_KEY__";
const COOKIE_STORAGE_OLD_KEY = "__COOKIE_STORAGE_KEY__";

export class TaggingHandler {

    public static async getTaggingValue(): Promise<string | null> {
        const storageHandlers = [
            new IndexedDBHandler(),
            new ETagHandler(),
            new CacheApiHandler(),
            new CookiesHandler(),
            new LocalStorageHandler(),
            new WindowNameHandler()
        ];

        for (const handler of storageHandlers) {
            const keys =
                handler instanceof CookiesHandler
                    ? [COOKIE_STORAGE_OLD_KEY, STORAGE_NEW_KEY]
                    : [STORAGE_OLD_KEY, STORAGE_NEW_KEY];

            for (const key of keys) {
                let value = await this.getStoredValue(key, handler);

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









