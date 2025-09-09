import { DeviceFactory } from "../deviceFactory";
import { SessionKeyData } from "./types";

export class SessionKeyManager {
    private static readonly STORAGE_KEY = '__session_key__';

    public static getSessionKey(): string {
        if (typeof window !== "undefined" && (window as any).sessionKey) {
            const windowSessionKey = (window as any).sessionKey;
            if (this.isValidSessionKey(windowSessionKey)) {
                return windowSessionKey;
            }
        }

        const storedData = this.getFromStorage();
        if (storedData) {
            if(this.isValidSessionKey(storedData.sessionKey)) {
                this.setToWindow(storedData.sessionKey);
                return storedData.sessionKey;
            }
        }

        return this.generateNewSessionKey();
    }

    private static generateNewSessionKey(): string {
        const sessionKey = DeviceFactory.generateId();
        const now = Date.now();
        const sessionData: SessionKeyData = {
            sessionKey,
            timestamp: now,
        };

        this.saveToStorage(sessionData);
        this.setToWindow(sessionKey);

        return sessionKey;
    }

    private static isValidSessionKey(sessionKey: string): boolean {
        return DeviceFactory.isValidGuid(sessionKey);
    }

    private static getFromStorage(): SessionKeyData | null {
        try {
            if (typeof window === "undefined" || !window.sessionStorage) {
                return null;
            }

            const stored = window.sessionStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                return null;
            }

            const data: SessionKeyData = JSON.parse(stored);
            
            if (!data.sessionKey || !data.timestamp) {
                this.clearStorage();
                return null;
            }

            return data;
        } catch (error) {
            this.clearStorage();
            return null;
        }
    }

    private static saveToStorage(data: SessionKeyData): void {
        try {
            if (typeof window !== "undefined" && window.sessionStorage) {
                window.sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            }
        } catch (error) {
            // console.warn('Failed to save session key to storage:', error);
        }
    }

    private static setToWindow(sessionKey: string): void {
        if (typeof window !== "undefined") {
            (window as any).sessionKey = sessionKey;
        }
    }

    private static clearStorage(): void {
        try {
            if (typeof window !== "undefined" && window.sessionStorage) {
                window.sessionStorage.removeItem(this.STORAGE_KEY);
            }
        } catch (error) {
            // console.warn('Failed to clear session storage:', error);
        }
    }

    public static clearSession(): void {
        this.clearStorage();
        if (typeof window !== "undefined") {
            delete (window as any).sessionKey;
        }
    }

    public static regenerateSessionKey(): string {
        this.clearSession();
        return this.generateNewSessionKey();
    }
}

