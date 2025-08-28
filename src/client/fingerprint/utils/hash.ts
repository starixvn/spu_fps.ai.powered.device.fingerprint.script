import * as murmurhash from 'murmurhash3js';

export class MurmurHash3 {
  public static hash32(data: string, seed: number = 0): string {
    const hash = murmurhash.x86.hash32(data);
    return hash as string;
  }
}

export class MurmurHash128 {
  public static hash128(data: string, seed: number = 0): string {
    const hash = murmurhash.x86.hash128(data);
    return hash;
  }
}

export class SHA256 {
  public static async hash(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  public static hashSync(message: string): string {
    let result = '';
    this.hash(message).then(hash => result = hash);
    return result || 'pending...';
  }
}

export class FingerprintHasher {

  public static hashFingerprint(fingerprintData: any): string {
    const fingerprintString = JSON.stringify(fingerprintData);
    
    return MurmurHash3.hash32(fingerprintString);
  }

  public static hashFingerprintMurmur128(fingerprintData: any): string {
    const fingerprintString = JSON.stringify(fingerprintData);
    
    return MurmurHash128.hash128(fingerprintString);
  }

  public static async hashFingerprintSHA256(fingerprintData: any): Promise<string> {
    const fingerprintString = JSON.stringify(fingerprintData);
    
    return await SHA256.hash(fingerprintString);
  }

  public static hashFingerprintSHA256Sync(fingerprintData: any): string {
    const fingerprintString = JSON.stringify(fingerprintData);
    
    return SHA256.hashSync(fingerprintString);
  }
}

export class Base64Encoder {

  private static utf8_encode(string: string): string {
    string = string.replace(/\r\n/g, "\n");
    let utfText = "";

    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n);

      if (c < 128) {
        utfText += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utfText += String.fromCharCode((c >> 6) | 192);
        utfText += String.fromCharCode((c & 63) | 128);
      } else {
        utfText += String.fromCharCode((c >> 12) | 224);
        utfText += String.fromCharCode(((c >> 6) & 63) | 128);
        utfText += String.fromCharCode((c & 63) | 128);
      }
    }

    return utfText;
  }

  public static encodeBase64(input: string, key: string): string {
    let output = "";
    let chr1: number, chr2: number, chr3: number;
    let enc1: number, enc2: number, enc3: number, enc4: number;
    let i = 0;

    const utfInput = this.utf8_encode(input);

    while (i < utfInput.length) {
      chr1 = utfInput.charCodeAt(i++);
      chr2 = utfInput.charCodeAt(i++);
      chr3 = utfInput.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
        key.charAt(enc1) + key.charAt(enc2) +
        key.charAt(enc3) + key.charAt(enc4);
    }

    return output;
  }
}


