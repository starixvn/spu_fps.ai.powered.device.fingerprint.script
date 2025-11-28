import { SessionKeyData } from './types';
import { DeviceFactory } from '../../utils/deviceFactory';
import { SCORING_CONFIG } from '../config';

export class ScoringSessionKeyManager {
    public static getSessionKey(): string {
        try {
            const storedData = window.sessionStorage.getItem(SCORING_CONFIG.sessionKey);

            if (storedData) {
                const parsedData: SessionKeyData = JSON.parse(storedData);
                const sessionKey = parsedData.sessionKey;

                if (sessionKey && this.isValidSessionKey(sessionKey)) {
                    const updatedData: SessionKeyData = {
                        sessionKey,
                        timestamp: Date.now(),
                    };
                    this.saveToStorage(updatedData);
                    return sessionKey;
                }
            }

            return this.generateNewSessionKey();

        } catch (error) {
            return this.generateNewSessionKey();
        }
    }
    
    private static generateNewSessionKey(): string {
        const sessionKey = DeviceFactory.generateId();
        const now = Date.now();
        const sessionData: SessionKeyData = {
            sessionKey,
            timestamp: now,
        };

        this.saveToStorage(sessionData);
        return sessionKey;
    }

    private static isValidSessionKey(sessionKey: string): boolean {
        return DeviceFactory.isValidGuid(sessionKey);
    }

    private static saveToStorage(data: SessionKeyData): void {
        try {
            if (typeof window !== "undefined" && window.sessionStorage) {
                window.sessionStorage.setItem(SCORING_CONFIG.sessionKey, JSON.stringify(data));
            }
        } catch (error) {
            // console.warn('Failed to save session key to storage:', error);
        }
    }
}

