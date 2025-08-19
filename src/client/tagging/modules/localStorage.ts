import { IStorageHandler } from "../types";

export class LocalStorageHandler implements IStorageHandler {

    public async get(key: string): Promise<string | null> {
        try {
            const localStorageObj = window.localStorage;

            if (localStorageObj) {
                const value = localStorageObj.getItem(key);
                return value;
            } else {
                return null;
            }
        } catch (exception) {
            return null;
        }
    }

    public async set(key: string, value: string): Promise<boolean> {
        try {
            const localStorageObj = window.localStorage;
            if (localStorageObj) {
                localStorageObj.setItem(key, value);
                return true;
            } else {
                return false;
            }
        } catch (exception) {
            return false;
        }
    }

    public available(): boolean {
        return typeof window.localStorage !== "undefined";
    }
}
