import { CacheApiHandler } from './modules/cacheApi';
import { CookiesHandler } from './modules/cookie';
import { ETagHandler } from './modules/etag';
import { IndexedDBHandler } from './modules/indexedDB';
import { LocalStorageHandler } from './modules/localStorage';
import { TaggingHandler, STORAGE_KEYS } from './tagging';
import { WindowNameHandler } from './modules/windowName';
import { IStorageHandler } from './types';
import { DeviceFactory } from '../deviceFactory';

export class TaggingClass {
    private readonly storageHandlers: Array<{
        handler: IStorageHandler;
        key: string;
    }>;

    constructor() {
        this.storageHandlers = [
            { handler: new IndexedDBHandler(), key: STORAGE_KEYS.indexedDB },
            { handler: new ETagHandler(), key: STORAGE_KEYS.etag },
            { handler: new CacheApiHandler(), key: STORAGE_KEYS.cache },
            { handler: new CookiesHandler(), key: STORAGE_KEYS.cookies },
            { handler: new LocalStorageHandler(), key: STORAGE_KEYS.localStorage },
            { handler: new WindowNameHandler(), key: STORAGE_KEYS.windowName }
        ];
    }

    public async getStorage(): Promise<string> {
        let targetTaggingValue = await TaggingHandler.getTaggingValue();

        if (!targetTaggingValue) {
            targetTaggingValue = DeviceFactory.generateTagging();
        }

        await Promise.all(
            this.storageHandlers.map(async (handlerConfig) => {
                const currentValue = await handlerConfig.handler.get(handlerConfig.key);
                if (currentValue !== targetTaggingValue) {
                    await handlerConfig.handler.set(handlerConfig.key, targetTaggingValue);
                }
            })
        );

        return targetTaggingValue;
    }

    public async start(): Promise<string> {
        return await this.getStorage();
    }
}

const tagging = new TaggingClass();

if (typeof window !== 'undefined') {
    (window.history as any).tag = {
        ...(window.performance && { ...window.performance }),
        self: null as Promise<string> | null,
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
    };

    (window.history as any).tag.self = (async () => {
        return await tagging.start();
    })();
}
