import { ErrorLogger } from "../../utils/errorLogger";
import { IStorageHandler } from "../types";

export class WindowNameHandler implements IStorageHandler {

    public async get(key: string): Promise<string | null> {
        try {
            if (!this.available()) {
                return null;
            }

            const currentValue = window.name;
            
            if (!this.isValidValue(currentValue)) {
                return null;
            }

            return currentValue || null;
        } catch (exception) {
            ErrorLogger.error('Failed to get windowName:', exception);
            return null;
        }
    }

    public async set(key: string, value: string): Promise<boolean> {
        try {
            if (!this.available() || !value) {
                return false;
            }
           
            window.name = value;

            return true;

        } catch (exception) {
            return false;
        }
    }

    public available(): boolean {
        try {
            return typeof window !== 'undefined' && typeof window.name !== 'undefined';
        } catch (exception) {
            ErrorLogger.error('Failed to check windowName:', exception);
            return false;
        }
    }

    private isValidValue(value: any): boolean {
        return value !== undefined && value !== null && value !== "";
    }
}