export interface IStorageHandler {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<boolean>;
    available(): boolean;
}

export interface ITaggingResult {
    key?: string;
    value?: string;
    type?: number;
}

declare global {
  interface Window {
    taggingReady: Promise<string>;
  }
}