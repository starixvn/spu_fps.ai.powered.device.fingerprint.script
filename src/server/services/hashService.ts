import * as crypto from 'crypto';
import * as murmurhash from 'murmurhash3js';

const DEVICE_ID_ENCRYPT_KEY = '&％#@?,:*!~^.';

export class HashService {
  /**
   * Hash fingerprint using both MurmurHash3 and SHA-256
   */
  hashFingerprint(fingerprint: any): {
    murmur: string;
    sha256: string;
    combined: string;
  } {
    const fingerprintString = JSON.stringify(fingerprint);
    
    // MurmurHash3
    const murmurHash = murmurhash.x86.hash32(fingerprintString);
    
    // SHA-256
    const sha256Hash = crypto
      .createHash('sha256')
      .update(fingerprintString)
      .digest('hex');
    
    // Combined hash (SHA-256 of concatenated hashes)
    const combinedHash = crypto
      .createHash('sha256')
      .update(murmurHash + sha256Hash)
      .digest('hex');
    
    return {
      murmur: murmurHash,
      sha256: sha256Hash,
      combined: combinedHash
    };
  }
  
  /**
   * Create a simple hash from string input
   */
  hashString(input: string): string {
    return crypto
      .createHash('sha256')
      .update(input)
      .digest('hex');
  }
}

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
        // RC4 is symmetric - decrypt is same as encrypt
        return this.encrypt(key, value);
    }
}

/**
 * Hexadecimal encoding/decoding utilities 
 */
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

