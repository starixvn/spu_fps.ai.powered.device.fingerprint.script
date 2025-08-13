export interface IStorageHandler {
    get(key: string): Promise<string | null> | string | null;
    set(key: string, value: string): Promise<boolean> | boolean;
    available(): boolean;
}

declare global {
  interface Window {
    Tagging: any;
  }
}