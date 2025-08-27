export class MurmurHash3 {
  public static hash32(data: string, seed: number = 0): string {
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    const r1 = 15;
    const r2 = 13;
    const m = 5;
    const n = 0xe6546b64;

    let hash = seed;
    const len = data.length;
    const nblocks = len >>> 2;

    for (let i = 0; i < nblocks; i++) {
      let k = (data.charCodeAt(i * 4) & 0xff) |
             ((data.charCodeAt(i * 4 + 1) & 0xff) << 8) |
             ((data.charCodeAt(i * 4 + 2) & 0xff) << 16) |
             ((data.charCodeAt(i * 4 + 3) & 0xff) << 24);

      k = Math.imul(k, c1);
      k = (k << r1) | (k >>> (32 - r1));
      k = Math.imul(k, c2);

      hash ^= k;
      hash = (hash << r2) | (hash >>> (32 - r2));
      hash = Math.imul(hash, m) + n;
    }

    let k1 = 0;
    const tail = len & 3;
    const index = nblocks * 4;

    switch (tail) {
      case 3:
        k1 ^= (data.charCodeAt(index + 2) & 0xff) << 16;
      case 2:
        k1 ^= (data.charCodeAt(index + 1) & 0xff) << 8;
      case 1:
        k1 ^= data.charCodeAt(index) & 0xff;

        k1 = Math.imul(k1, c1);
        k1 = (k1 << r1) | (k1 >>> (32 - r1));
        k1 = Math.imul(k1, c2);
        hash ^= k1;
    }

    hash ^= len;
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = Math.imul(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;

    return (hash >>> 0).toString(16).padStart(8, '0');
  }
}

export class FingerprintHasher {

  public static hashFingerprint(fingerprintData: any): string {
    const fingerprintString = JSON.stringify(fingerprintData);
    
    return MurmurHash3.hash32(fingerprintString);
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


