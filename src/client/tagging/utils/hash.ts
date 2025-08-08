/**
 * Hash and encryption utilities for device fingerprinting
 * Implements RC4 encryption with Hex encoding similar to C# version
 */

const DEVICE_ID_ENCRYPT_KEY = process.env.DEVICE_ID_ENCRYPT_KEY || '&％#@?,:*!~^.';

export class RC4 {
    static encrypt(key: string, data: string): string {
        return this.process(key, data);
    }

    static decrypt(key: string, data: string): string {
        return this.process(key, data);
    }

    private static process(key: string, data: string): string {
        var s = [], j = 0, x, res = "";
        var i;
        
        for (i = 0; i < 256; i++) {
            s[i] = i;
        }
        for (i = 0; i < 256; i++) {
            j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
            x = s[i];
            s[i] = s[j];
            s[j] = x;
        }
        
        // Pseudo-Random Generation Algorithm (PRGA)
        i = 0;
        j = 0;
        for (var y = 0; y < data.length; y++) {
            i = (i + 1) % 256;
            j = (j + s[i]) % 256;
            x = s[i];
            s[i] = s[j];
            s[j] = x;
            res += String.fromCharCode(data.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
        }

        return res;
    }
}

/**
 * Hexadecimal encoding/decoding utilities
 */
export class Hex {
    static encode(str: string): string {
        var hex = "";
        for (var i = 0; i < str.length; i++) {
            hex += "" + str.charCodeAt(i).toString(16);
        }
        return hex;
    }

    static decode(hex: string): string {
        var str = "";
        for (var i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }
}

export class Hash {
    static encrypt(plaintext: string, key?: string): string {
        if (!plaintext) {
            throw new Error('Plaintext cannot be empty');
        }

        try {
            const encryptionKey = key || DEVICE_ID_ENCRYPT_KEY;
            const encryptedData = RC4.encrypt(encryptionKey, plaintext);
            return Hex.encode(encryptedData);
        } catch (error) {
            throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static decrypt(encryptedText: string, key?: string): string {
        if (!encryptedText) {
            throw new Error('Encrypted text cannot be empty');
        }

        try {
            const decryptionKey = key || DEVICE_ID_ENCRYPT_KEY;
            const encryptedData = Hex.decode(encryptedText);
            return RC4.decrypt(decryptionKey, encryptedData);
        } catch (error) {
            throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}



