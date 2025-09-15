import * as murmurhash from "murmurhash3js";

export class MurmurHash128 {
  public static hash128(data: string, seed: number = 0): string {
    return murmurhash3_x86_128(data, seed);
  }
}

function murmurhash3_x86_128(key: string, seed: number = 0): string {
  const c1 = 0x239b961b;
  const c2 = 0xab0e9789;
  const c3 = 0x38b34ae5;
  const c4 = 0xa1e38b93;

  let h1 = seed;
  let h2 = seed;
  let h3 = seed;
  let h4 = seed;

  const length = key.length;
  const remainder = length & 15;
  const bytes = length - remainder;

  // Process 16 bytes at a time
  for (let i = 0; i < bytes; i += 16) {
    let k1 =
      key.charCodeAt(i) |
      (key.charCodeAt(i + 1) << 8) |
      (key.charCodeAt(i + 2) << 16) |
      (key.charCodeAt(i + 3) << 24);
    let k2 =
      key.charCodeAt(i + 4) |
      (key.charCodeAt(i + 5) << 8) |
      (key.charCodeAt(i + 6) << 16) |
      (key.charCodeAt(i + 7) << 24);
    let k3 =
      key.charCodeAt(i + 8) |
      (key.charCodeAt(i + 9) << 8) |
      (key.charCodeAt(i + 10) << 16) |
      (key.charCodeAt(i + 11) << 24);
    let k4 =
      key.charCodeAt(i + 12) |
      (key.charCodeAt(i + 13) << 8) |
      (key.charCodeAt(i + 14) << 16) |
      (key.charCodeAt(i + 15) << 24);

    // Mix k1
    k1 = ((k1 & 0xff) * c1) >>> 0;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = (k1 * c2) >>> 0;
    h1 = (h1 ^ k1) >>> 0;
    h1 = (h1 + h2 + h3 + h4) >>> 0;
    h1 = (h1 * 3 + 0x52dce729) >>> 0;

    // Mix k2
    k2 = ((k2 & 0xff) * c2) >>> 0;
    k2 = (k2 << 16) | (k2 >>> 16);
    k2 = (k2 * c3) >>> 0;
    h2 = (h2 ^ k2) >>> 0;
    h2 = (h2 + h1 + h3 + h4) >>> 0;
    h2 = (h2 * 3 + 0x38495ab5) >>> 0;

    // Mix k3
    k3 = ((k3 & 0xff) * c3) >>> 0;
    k3 = (k3 << 17) | (k3 >>> 15);
    k3 = (k3 * c4) >>> 0;
    h3 = (h3 ^ k3) >>> 0;
    h3 = (h3 + h1 + h2 + h4) >>> 0;
    h3 = (h3 * 3 + 0x4c6f6a87) >>> 0;

    // Mix k4
    k4 = ((k4 & 0xff) * c4) >>> 0;
    k4 = (k4 << 18) | (k4 >>> 14);
    k4 = (k4 * c1) >>> 0;
    h4 = (h4 ^ k4) >>> 0;
    h4 = (h4 + h1 + h2 + h3) >>> 0;
    h4 = (h4 * 3 + 0x5cf7bce1) >>> 0;
  }

  // Reset k variables
  let k1 = 0;
  let k2 = 0;
  let k3 = 0;
  let k4 = 0;

  // Handle remaining bytes
  switch (remainder) {
    case 15:
      k4 = (k4 ^ (key.charCodeAt(bytes + 14) << 16)) >>> 0;
    case 14:
      k4 = (k4 ^ (key.charCodeAt(bytes + 13) << 8)) >>> 0;
    case 13:
      k4 = (k4 ^ key.charCodeAt(bytes + 12)) >>> 0;
      k4 = (k4 * c4) >>> 0;
      k4 = (k4 << 18) | (k4 >>> 14);
      k4 = (k4 * c1) >>> 0;
      h4 = (h4 ^ k4) >>> 0;
      break;

    case 12:
      k3 = (k3 ^ (key.charCodeAt(bytes + 11) << 24)) >>> 0;
    case 11:
      k3 = (k3 ^ (key.charCodeAt(bytes + 10) << 16)) >>> 0;
    case 10:
      k3 = (k3 ^ (key.charCodeAt(bytes + 9) << 8)) >>> 0;
    case 9:
      k3 = (k3 ^ key.charCodeAt(bytes + 8)) >>> 0;
      k3 = (k3 * c3) >>> 0;
      k3 = (k3 << 17) | (k3 >>> 15);
      k3 = (k3 * c4) >>> 0;
      h3 = (h3 ^ k3) >>> 0;
      break;

    case 8:
      k2 = (k2 ^ (key.charCodeAt(bytes + 7) << 24)) >>> 0;
    case 7:
      k2 = (k2 ^ (key.charCodeAt(bytes + 6) << 16)) >>> 0;
    case 6:
      k2 = (k2 ^ (key.charCodeAt(bytes + 5) << 8)) >>> 0;
    case 5:
      k2 = (k2 ^ key.charCodeAt(bytes + 4)) >>> 0;
      k2 = (k2 * c2) >>> 0;
      k2 = (k2 << 16) | (k2 >>> 16);
      k2 = (k2 * c3) >>> 0;
      h2 = (h2 ^ k2) >>> 0;
      break;

    case 4:
      k1 = (k1 ^ (key.charCodeAt(bytes + 3) << 24)) >>> 0;
    case 3:
      k1 = (k1 ^ (key.charCodeAt(bytes + 2) << 16)) >>> 0;
    case 2:
      k1 = (k1 ^ (key.charCodeAt(bytes + 1) << 8)) >>> 0;
    case 1:
      k1 = (k1 ^ key.charCodeAt(bytes)) >>> 0;
      k1 = (k1 * c1) >>> 0;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = (k1 * c2) >>> 0;
      h1 = (h1 ^ k1) >>> 0;
      break;
  }

  // Finalization mix
  h1 = (h1 ^ length) >>> 0;
  h2 = (h2 ^ length) >>> 0;
  h3 = (h3 ^ length) >>> 0;
  h4 = (h4 ^ length) >>> 0;

  h1 = (h1 + h2 + h3 + h4) >>> 0;
  h2 = (h2 + h1) >>> 0;
  h3 = (h3 + h1) >>> 0;
  h4 = (h4 + h1) >>> 0;

  h1 = fmix32(h1);
  h2 = fmix32(h2);
  h3 = fmix32(h3);
  h4 = fmix32(h4);

  h1 = (h1 + h2 + h3 + h4) >>> 0;
  h2 = (h2 + h1) >>> 0;
  h3 = (h3 + h1) >>> 0;
  h4 = (h4 + h1) >>> 0;

  return toHexString(h1) + toHexString(h2) + toHexString(h3) + toHexString(h4);
}

function fmix32(h: number): number {
  h = (h ^ (h >>> 16)) >>> 0;
  h = (h * 0x85ebca6b) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = (h * 0xc2b2ae35) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h;
}

function toHexString(num: number): string {
  return ("00000000" + num.toString(16)).slice(-8);
}

export class Base64Encoder {
  private static utf8_encode(string: string): string {
    string = string.replace(/\r\n/g, "\n");
    let utfText = "";

    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n);

      if (c < 128) {
        utfText += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
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

      output =
        output +
        key.charAt(enc1) +
        key.charAt(enc2) +
        key.charAt(enc3) +
        key.charAt(enc4);
    }

    return output;
  }
}

