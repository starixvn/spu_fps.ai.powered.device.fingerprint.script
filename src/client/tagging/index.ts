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

    public async syncStorageValue(): Promise<[string, number]> {        
        const taggingResult: ITaggingResult = await TaggingHandler.getTaggingFromStorages();

        const storageKey = taggingResult.key;
        const targetTaggingValue = taggingResult.value || DeviceFactory.generateTagging();
        const targetTaggingType = taggingResult.type || DEFAULT_TAGGING_TYPE.GENERATED;

        await Promise.all(
            this.storageHandlers.map(async (handlerConfig) => {
                if (storageKey && storageKey === handlerConfig.key) {
                    return;
                }

                return handlerConfig.handler.set(handlerConfig.key, targetTaggingValue);
            })
        );

        return [targetTaggingValue, targetTaggingType];
    }

    public async getTaggingValue() : Promise<string> {
        let [targetTaggingValue, _] = await this.syncStorageValue();
        return targetTaggingValue;
    }

    public async start(): Promise<[string, number]> {
        return await this.syncStorageValue();
    }
}

if (typeof window !== 'undefined') {
    if ((window as any).enabledTag) {
        const tagging = new TaggingClass();

        (window.history as any).tag = {
            ...(window.performance && { ...window.performance }),
            self: null as Promise<string> | null,
            sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };

        (window.history as any).tag.self = (async () => {
            return await tagging.getTaggingValue();
        })();
    }
}
