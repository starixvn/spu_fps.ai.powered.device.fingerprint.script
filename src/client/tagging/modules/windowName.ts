import { IStorageHandler } from "../types";

export class WindowNameHandler implements IStorageHandler {

    public async get(key: string): Promise<string | null> {
        try {
            if (this.available()) {
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

    public async set(key: string, value: string): Promise<boolean> {
        try {
            if (this.available() || !value) {
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

    public available(): boolean {
        try {
            return typeof window !== 'undefined' && typeof window.name !== 'undefined';
        } catch (exception) {
            return false;
        }
    }

    private isValidObject(value: any): boolean {
        return value !== null && value !== undefined && value !== '';
    }

    private isValidTagValue(value: string): boolean {
        if (!value || typeof value !== 'string') {
            return false;
        }

        return value.trim().length > 0 && value.length < 1000;
    }
}