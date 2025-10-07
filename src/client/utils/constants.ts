export const STORAGE_KEYS = {
    localStorage: "__localStorage_key__",
    cookies: "__cookies_key__",
    indexedDB: "__indexedDB_key__",
    cache: "__cache_key__",
    windowName: "__window_key__",
    etag: "__etag_key__"
};

export const TAGGING_ORDER = {
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

export const DEFAULT_TAGGING_TYPE = {
    NONE: 0,
    GENERATED: 7000,
    DEFAULT: 8000
}