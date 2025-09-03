export interface IStorageHandler {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<boolean>;
    available(): boolean;
}

declare global {
  interface Window {
    taggingReady: Promise<string>;
  }
}