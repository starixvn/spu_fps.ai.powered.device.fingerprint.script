/**
 * Universal Storage Manager for Device Fingerprinting
 * Class-based storage with interface pattern
 * Priority Order: IndexedDB > Etag > WebRTC > Cookies > Cache API > Local Storage
 */

import { DeviceEncryption } from '../utils/hash';
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
        const storageHandlers = [
            IndexedDBHandler,
            // ETagHandler,
            CacheApiHandler,
            CookiesHandler,
            LocalStorageHandler
        ];

        for (const handler of storageHandlers) {
            // Check for old key
            let value = await handler.get('(global.c3)');
            if (value) {
                return value;
            }

            // Check for new key
            value = await handler.get('(global.c4)');
            if (value) {
                return value;
            }
        }

        const guid = this.NewGuid();
        const encryptedText = DeviceEncryption.Encrypt(guid);
        return encryptedText;
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









