import { DeviceEncryption, GuidGenerator } from './utils/hash';
import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { WindowNameHandler } from './modules/windowName';

export class TaggingHandler {

    public static async getTaggingValue(): Promise<string | null> {
        const keys = ['(global.c3)', 'pwr_client_sync'];

        const storageHandlers = [
            new IndexedDBHandler(),
            new ETagHandler(),
            new CacheApiHandler(),
            new CookiesHandler(),
            new LocalStorageHandler(),
            new WindowNameHandler()
        ];


        for (const handler of storageHandlers) {
            for (const key of keys) {
                let value = await this.getStoredValue(key, handler);

                if (value) {
                    return value;
                }
            }
        }

        return null;
    }

    public static generateTagging(): string {
        const guid = GuidGenerator.generateGuid();
        const encryptedGuid = DeviceEncryption.Encrypt(guid);

        return encryptedGuid;
    }

    private static async getStoredValue(key: string, handler: any): Promise<string | null> {
        return await handler.get(key);
    }
}









