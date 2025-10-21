import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { WindowNameHandler } from './modules/windowName';
import { DeviceFactory } from '../utils/deviceFactory';
import { ITaggingResult } from './types';
import { STORAGE_KEYS, TAGGING_ORDER } from '../utils/constants';
import { ErrorLogger } from '../utils/errorLogger';

export class TaggingHandler {

    private static readonly oldKey = "(global.c3)";
    private static readonly STORAGE_TIMEOUT_MS = 2000; // 2 seconds timeout for individual storage reads

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
        ].filter(handlerConfig => handlerConfig.handler.available()); // Chỉ giữ handlers available

        for (const handlerConfig of storageHandlers) {
            try {
                // Thử old key trước nếu có
                if(handlerConfig.oldKey !== "") {
                    const storedValue = await this.getStoredValueWithTimeout(
                        handlerConfig.oldKey, 
                        handlerConfig.handler
                    );
                    if (storedValue && DeviceFactory.isValidTagging(storedValue)) {
                        return { 
                            key: handlerConfig.newKey, 
                            value: storedValue, 
                            type: this.computeTaggingType(handlerConfig.newKey) 
                        };
                    }                
                }

                // Thử new key
                const storedValue = await this.getStoredValueWithTimeout(
                    handlerConfig.newKey, 
                    handlerConfig.handler
                );
                if (storedValue && DeviceFactory.isValidTagging(storedValue)) {
                    return { 
                        key: handlerConfig.newKey, 
                        value: storedValue, 
                        type: this.computeTaggingType(handlerConfig.newKey) 
                    };
                }
            } catch (error) {
                ErrorLogger.warn(`Storage handler ${handlerConfig.newKey} failed:`, error);
                // Tiếp tục với handler tiếp theo
                continue;
            }
        }

        return { key: undefined, value: undefined, type: undefined };
    }

    private static async getStoredValueWithTimeout(key: string, handler: any): Promise<string | null> {
        try {
            return await Promise.race([
                handler.get(key),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error('Storage read timeout')), this.STORAGE_TIMEOUT_MS)
                )
            ]);
        } catch (error) {
            ErrorLogger.warn(`Failed to get stored value for key ${key}:`, error);
            return null;
        }
    }
}