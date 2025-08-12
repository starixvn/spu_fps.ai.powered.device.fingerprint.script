export interface IStorageHandler {
    get(key: string): Promise<string | null> | string | null;
    set(key: string, value: string): Promise<boolean> | boolean;
    available(): boolean;
}

export interface IStorageData {
    indexedDB: string | null;
    etag: string | null;
    cookies: string | null;
    cacheAPI: string | null;
    localStorage: string | null;
}

declare global {
  interface Window {
    Tagging: any;
    TaggingAutoCollected?: boolean;
    TaggingOnCollected?: (data: string) => void;
  }
}