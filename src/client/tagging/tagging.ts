import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { WindowNameHandler } from './modules/windowName';
import { DeviceFactory } from '../utils/deviceFactory';
import { ITaggingResult } from './types';
import { STORAGE_KEYS, TAGGING_ORDER } from '../utils/constants';

export class TaggingHandler {

    private static readonly oldKey = "(global.c3)";

    private static computeTaggingType(key: string): number {
        return TAGGING_ORDER[key].order * 1000 + TAGGING_ORDER[key].id;
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









