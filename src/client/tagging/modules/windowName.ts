export class WindowNameHandler {

    public static get(key: string): string | null {
        try {
            if (typeof window === 'undefined') {
                return null;
            }

            const currentValue = window.name;
            
            if (!this.isValidObject(currentValue) || !this.isValidTagValue(currentValue)) {
                return null;
            }

            return currentValue || null;
        } catch (exception) {
            return null;
        }
    }

    public static set(key: string, value: string): boolean {
        try {
            if (typeof window === 'undefined' || !value) {
                return false;
            }

            const currentValue = window.name;
            
            if (!this.isValidObject(currentValue) || this.isValidTagValue(currentValue)) {
                window.name = value;
                return true;
            }

            return false;
        } catch (exception) {
            return false;
        }
    }

    public static available(): boolean {
        try {
            if (typeof window === 'undefined') {
                return false;
            }

            const testValue = window.name;
            const originalValue = testValue;
            
            window.name = '__test_window_name__';
            const canWrite = window.name === '__test_window_name__';
            
            window.name = originalValue;
            
            return canWrite;
        } catch (exception) {
            return false;
        }
    }

    private static isValidObject(value: any): boolean {
        return value !== null && value !== undefined && value !== '';
    }

    private static isValidTagValue(value: string): boolean {
        if (!value || typeof value !== 'string') {
            return false;
        }

        return value.trim().length > 0 && value.length < 1000;
    }
}