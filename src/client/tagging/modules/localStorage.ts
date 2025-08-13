export class LocalStorageHandler {

    public static get(key: string): string | null {
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

    public static set(key: string, value: string): boolean {
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

    public static available(): boolean {
        try {
            const test = '__localStorage_test__';
            window.localStorage.setItem(test, test);
            window.localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }
}
