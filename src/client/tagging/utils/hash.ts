const SESSION_SEED = '&％#@?,:*!~^.';

export class RC4 {
    public static encrypt(key: string, value: string): string {
        if (!key || !value) {
            return value || '';
        }
        
        const keyCharArray = key.split('');
        const valueCharArray = value.split('');
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

        let encryptedValue = '';
        for (let y = 0, i = 0, j = 0; y < valueLength; y++) {
            i = (i + 1) % 256;
            j = (j + map[i]) % 256;
            const x = map[i];
            map[i] = map[j];
            map[j] = x;
            encryptedValue += String.fromCharCode(valueCharArray[y].charCodeAt(0) ^ map[(map[i] + map[j]) % 256]);
        }

        return encryptedValue;
    }

    public static decrypt(key: string, value: string): string {
        return this.encrypt(key, value);
    }
}

export class Hex {
    private static readonly HexDigits = "0123456789abcdef";

    public static encode(data: string): string {
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
            result.push(map[data.charCodeAt(i)]);
        }

        return result.join('');
    }

    public static decode(data: string): string {
        if (!data) {
            return '';
        }

        const map: { [key: number]: string } = {};

        for (let i = 0; i < 256; i++) {
            const hexStr = this.HexDigits[i >> 4] + this.HexDigits[i & 15];
            map[parseInt(hexStr, 16)] = String.fromCharCode(i);
        }

        let length = data.length;

        if (length % 2 !== 0) {
            data = '0' + data;
            length = data.length;
        }

        const result: string[] = [];
        for (let i = 0; i < length; i += 2) {
            const hexPair = data.substring(i, i + 2);
            const charCode = parseInt(hexPair, 16);
            
            if (map[charCode] !== undefined) {
                result.push(map[charCode]);
            } else {
                result.push(String.fromCharCode(charCode));
            }
        }

        return result.join('');
    }
}

export class PacketTransformer {

    public static wrapMessage(plaintext: string): string {
        const encryptedText = RC4.encrypt(SESSION_SEED, plaintext);
        return Hex.encode(encryptedText);
    }

    public static unwrapMessage(ciphertext: string): string {
        const decodedText = Hex.decode(ciphertext);
        return RC4.decrypt(SESSION_SEED, decodedText); 
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

