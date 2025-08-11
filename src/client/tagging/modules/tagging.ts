/**
 * Universal Storage Manager for Device Fingerprinting
 * Class-based storage with interface pattern
 * Priority Order: IndexedDB > Etag > WebRTC > Cookies > Cache API > Local Storage
 */

import { DeviceEncryption } from '../utils/deviceEncryption';
import { CacheApiHandler } from './cacheApi';
import { CookiesHandler } from './cookie';
import { ETagHandler } from './etag';
import { IndexedDBHandler } from './indexedDB';
import { LocalStorageHandler } from './localStorage';

export class TaggingHandler {

    public static NewGuid(): string {
        return this.generateGuid();
    }

    public static async getDeviceId(): Promise<string> {
        const storages = await this.getStorages('(global.c3)');
        const found = storages.find(t => t.value !== null);

        if (!found) {
            const guid = this.NewGuid();
            const encryptedText = DeviceEncryption.Encrypt(guid);
            return encryptedText;
        } 

        return found.value as string;
    }

    private static async getStorages(key: string) {
        return [
            { type: 'indexedDB', value: await IndexedDBHandler.get(key) },
            { type: 'etag', value: ETagHandler.get(key) },
            { type: 'cacheApi', value: CacheApiHandler.get(key) },
            { type: 'cookie', value: CookiesHandler.get(key) },
            { type: 'localStorage', value: LocalStorageHandler.get(key) },
        ];
    }

    private static generateGuid(): string {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID().replace(/-/g, '');
        }
        
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const buffer = new Uint8Array(16);
            crypto.getRandomValues(buffer);
            
            buffer[6] = (buffer[6] & 0x0f) | 0x40; 
            buffer[8] = (buffer[8] & 0x3f) | 0x80; 
            
            const hex = Array.from(buffer)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            return hex; 
        }
        
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).replace(/-/g, '');
    }
}









