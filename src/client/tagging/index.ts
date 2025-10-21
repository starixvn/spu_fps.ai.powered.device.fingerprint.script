import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { TaggingHandler } from './tagging';
import { DEFAULT_TAGGING_TYPE, STORAGE_KEYS } from '../utils/constants';
import { WindowNameHandler } from './modules/windowName';
import { IStorageHandler, ITaggingResult } from './types';
import { DeviceFactory } from '../utils/deviceFactory';
import { ErrorLogger } from '../utils/errorLogger';

export class TaggingClass {
    private readonly storageHandlers: Array<{
        handler: IStorageHandler;
        key: string;
    }>;
    private readonly STORAGE_TIMEOUT_MS = 3000; // 3 seconds timeout for storage operations
    private readonly MAX_RETRIES = 3;

    constructor() {
        // Chỉ giữ handlers available
        this.storageHandlers = [
            { handler: new IndexedDBHandler(), key: STORAGE_KEYS.indexedDB },
            { handler: new ETagHandler(), key: STORAGE_KEYS.etag },
            { handler: new CacheApiHandler(), key: STORAGE_KEYS.cache },
            { handler: new CookiesHandler(), key: STORAGE_KEYS.cookies },
            { handler: new LocalStorageHandler(), key: STORAGE_KEYS.localStorage },
            { handler: new WindowNameHandler(), key: STORAGE_KEYS.windowName }
        ].filter(handlerConfig => handlerConfig.handler.available());
    }

    private async executeWithRetry<T>(
        operation: () => Promise<T>, 
        maxRetries: number = this.MAX_RETRIES,
        delay: number = 1000
    ): Promise<T | null> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) {
                    ErrorLogger.error(`Operation failed after ${maxRetries} retries:`, error);
                    return null;
                }
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
        return null;
    }

    private async executeWithTimeout<T>(
        operation: () => Promise<T>,
        timeoutMs: number = this.STORAGE_TIMEOUT_MS
    ): Promise<T | null> {
        try {
            return await Promise.race([
                operation(),
                new Promise<never>((_, reject) => 
                    setTimeout(() => reject(new Error('Storage operation timeout')), timeoutMs)
                )
            ]);
        } catch (error) {
            ErrorLogger.warn('Storage operation timeout or failed:', error);
            return null;
        }
    }

    public async syncStorageValue(): Promise<[string, number]> {        
        try {
            const taggingResult: ITaggingResult | null = await this.executeWithRetry(
                () => TaggingHandler.getTaggingFromStorages()
            );

            if (!taggingResult) {
                ErrorLogger.warn('Failed to get tagging from storages, using generated value');
                const generatedValue = DeviceFactory.generateTagging();
                return [generatedValue, DEFAULT_TAGGING_TYPE.GENERATED];
            }

            const storageKey = taggingResult.key;
            const targetTaggingValue = taggingResult.value || DeviceFactory.generateTagging();
            const targetTaggingType = taggingResult.type || DEFAULT_TAGGING_TYPE.GENERATED;

            // Sử dụng Promise.allSettled để không bị block bởi một handler chậm
            const storagePromises = this.storageHandlers.map(async (handlerConfig) => {
                if (storageKey && storageKey === handlerConfig.key) {
                    return;
                }

                return this.executeWithTimeout(
                    () => handlerConfig.handler.set(handlerConfig.key, targetTaggingValue)
                ).catch(error => {
                    ErrorLogger.warn(`Storage ${handlerConfig.key} failed:`, error);
                });
            });

            await Promise.allSettled(storagePromises);

            return [targetTaggingValue, targetTaggingType];
        } catch (error: any) {
            ErrorLogger.error('Failed to sync storage value:', error, 'TaggingClass.syncStorageValue');
            // Return fallback values
            return [DeviceFactory.generateTagging(), DEFAULT_TAGGING_TYPE.GENERATED];
        }
    }

    public async getTaggingValue(): Promise<string> {
        try {
            let [targetTaggingValue, _] = await this.syncStorageValue();
            return targetTaggingValue;
        } catch (error: any) {
            ErrorLogger.error('Failed to get tagging value:', error, 'TaggingClass.getTaggingValue');
            return DeviceFactory.generateTagging();
        }
    }

    public async getTaggingValueWithFallback(): Promise<string> {
        try {
            // Thử lấy từ storage trước
            const [value] = await this.syncStorageValue();
            return value;
        } catch (error: any) {
            ErrorLogger.warn('Storage sync failed, using generated value:', error);
            // Fallback về generated value
            return DeviceFactory.generateTagging();
        }
    }

    public async start(): Promise<[string, number]> {
        return await this.syncStorageValue();
    }
}