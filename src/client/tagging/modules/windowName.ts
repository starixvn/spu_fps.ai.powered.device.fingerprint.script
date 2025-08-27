import { IStorageHandler } from "../types";

export class WindowNameHandler implements IStorageHandler {

    public async get(key: string): Promise<string | null> {
        try {
            if (!this.available()) {
                return null;
            }

            const windowNameValue = window.name;
            
            if (this.isValidValue(windowNameValue)) {
                return windowNameValue;
            }

            const historyState = window.history.state;
            if (historyState && historyState[key]) {
                return historyState[key];
            }

            return null;
        } catch (exception) {
            return null;
        }
    }

    public async set(key: string, value: string): Promise<boolean> {
        try {
            if (!this.available() || !value) {
                return false;
            }

            window.name = value;
            
            const currentState = window.history.state || {};

            const newState = {
                ...currentState,
                [key]: value
            };
            
            if (currentState[key]) {
                window.history.replaceState(newState, "", window.location.href);
            } else {
                window.history.pushState(newState, "", window.location.href);
            }
            
            return true;
        } catch (exception) {
            return false;
        }
    }

    public available(): boolean {
        try {
            return typeof window !== 'undefined';
        } catch (exception) {
            return false;
        }
    }

    private isValidValue(value: any): boolean {
        return value !== undefined && value !== null && value !== "";
    }
}