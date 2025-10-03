const SESSION_SEED = '&％#@?,:*!~^.';

export class RC4 {
    public static encrypt(key: string, value: Uint8Array): Uint8Array {
        if (!key || !value) {
            return value || new Uint8Array(0);
        }
        
        const keyCharArray = key.split('');
        const keyLength = key.length;
        const valueLength = value.length;
        const map = new Array(256);

        for (let i = 0; i < 256; i++) {
            map[i] = i;
        }

        for (let i = 0, j = 0; i < 256; i++) {
            j = (j + map[i] + keyCharArray[i % keyLength].charCodeAt(0)) % 256;
            const x = map[i];
            map[i] = map[j];
            map[j] = x;
        }

        const encryptedValue = new Uint8Array(valueLength);
        for (let y = 0, i = 0, j = 0; y < valueLength; y++) {
            i = (i + 1) % 256;
            j = (j + map[i]) % 256;
            const x = map[i];
            map[i] = map[j];
            map[j] = x;
            encryptedValue[y] = value[y] ^ map[(map[i] + map[j]) % 256];
        }

        return encryptedValue;
    }

    public static decrypt(key: string, value: Uint8Array): Uint8Array {
        return this.encrypt(key, value);
    }
}

export class Hex {
    private static readonly HexDigits = "0123456789abcdef";

    public static encode(data: Uint8Array): string {
        if (!data) {
            return '';
        }

        const map: string[] = new Array(256);
        for (let i = 0; i < 256; i++) {
            map[i] = this.HexDigits[i >> 4] + this.HexDigits[i & 15];
        }

        const length = data.length;
        const result: string[] = [];
        for (let i = 0; i < length; i++) {
            result.push(map[data[i]]);
        }

        return result.join('');
    }

    public static decode(data: string): Uint8Array {
        if (!data) {
            return new Uint8Array(0);
        }

        let length = data.length;

        if (length % 2 !== 0) {
            data = '0' + data;
            length = data.length;
        }

        const result = new Uint8Array(length / 2);
        for (let i = 0; i < length; i += 2) {
            const hexPair = data.substring(i, i + 2);
            const byteValue = parseInt(hexPair, 16);
            result[i / 2] = byteValue;
        }

        return result;
    }
}

export class PacketTransformer {

    public static wrapMessage(plaintext: string): string {
        const plaintextBytes = new TextEncoder().encode(plaintext);
        const encryptedBytes = RC4.encrypt(SESSION_SEED, plaintextBytes);
        return Hex.encode(encryptedBytes);
    }

    public static unwrapMessage(ciphertext: string): string {
        const encryptedBytes = Hex.decode(ciphertext);
        const decryptedBytes = RC4.decrypt(SESSION_SEED, encryptedBytes);
        return new TextDecoder().decode(decryptedBytes); 
    }
}

export class GuidGenerator {
    
    public static generateGuid(): string {
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

