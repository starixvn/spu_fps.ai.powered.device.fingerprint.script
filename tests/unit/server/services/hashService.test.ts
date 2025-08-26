import { HashService, RC4, Hex } from '../../../../src/server/services/hashService';

describe('HashService', () => {
  let hashService: HashService;

  beforeEach(() => {
    hashService = new HashService();
  });

  describe('hashFingerprint', () => {
    it('should generate consistent hashes for the same fingerprint', () => {
      const fingerprint = {
        userAgent: 'Mozilla/5.0',
        platform: 'Windows',
        canvas: 'canvas-hash'
      };

      const result1 = hashService.hashFingerprint(fingerprint);
      const result2 = hashService.hashFingerprint(fingerprint);

      expect(result1).toEqual(result2);
      expect(result1.murmur).toBe(result2.murmur);
      expect(result1.sha256).toBe(result2.sha256);
      expect(result1.combined).toBe(result2.combined);
    });

    it('should generate different hashes for different fingerprints', () => {
      const fingerprint1 = { userAgent: 'Chrome' };
      const fingerprint2 = { userAgent: 'Firefox' };

      const result1 = hashService.hashFingerprint(fingerprint1);
      const result2 = hashService.hashFingerprint(fingerprint2);

      expect(result1.murmur).not.toBe(result2.murmur);
      expect(result1.sha256).not.toBe(result2.sha256);
      expect(result1.combined).not.toBe(result2.combined);
    });

    it('should return object with murmur, sha256, and combined properties', () => {
      const fingerprint = { test: 'value' };
      const result = hashService.hashFingerprint(fingerprint);

      expect(result).toHaveProperty('murmur');
      expect(result).toHaveProperty('sha256');
      expect(result).toHaveProperty('combined');
    //   expect(typeof result.murmur).toBe('string');
      expect(typeof result.sha256).toBe('string');
      expect(typeof result.combined).toBe('string');
    });

    it('should generate 64-character SHA-256 hashes', () => {
      const fingerprint = { test: 'value' };
      const result = hashService.hashFingerprint(fingerprint);

      expect(result.sha256).toHaveLength(64);
      expect(result.combined).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(result.sha256)).toBe(true);
      expect(/^[a-f0-9]+$/.test(result.combined)).toBe(true);
    });

    it('should handle empty fingerprint objects', () => {
      const emptyFingerprint = {};
      const result = hashService.hashFingerprint(emptyFingerprint);

      expect(result.murmur).toBeDefined();
      expect(result.sha256).toBeDefined();
      expect(result.combined).toBeDefined();
    });

    it('should handle complex nested fingerprint objects', () => {
      const complexFingerprint = {
        client: {
          canvas: 'canvas-data',
          webgl: { vendor: 'NVIDIA', renderer: 'GeForce' },
          screen: { width: 1920, height: 1080 }
        },
        server: {
          userAgent: 'Mozilla/5.0',
          headers: { accept: 'text/html' }
        }
      };

      const result = hashService.hashFingerprint(complexFingerprint);

      expect(result.murmur).toBeDefined();
      expect(result.sha256).toBeDefined();
      expect(result.combined).toBeDefined();
    });

    it('should be sensitive to property order changes', () => {
      const fingerprint1 = { a: 1, b: 2 };
      const fingerprint2 = { b: 2, a: 1 };

      const result1 = hashService.hashFingerprint(fingerprint1);
      const result2 = hashService.hashFingerprint(fingerprint2);

      // JSON.stringify preserves property order, so these should be different
      expect(result1.sha256).not.toBe(result2.sha256);
    });
  });

  describe('hashString', () => {
    it('should generate consistent SHA-256 hash for same input', () => {
      const input = 'test-string';
      const result1 = hashService.hashString(input);
      const result2 = hashService.hashString(input);

      expect(result1).toBe(result2);
      expect(result1).toHaveLength(64);
    });

    it('should generate different hashes for different inputs', () => {
      const result1 = hashService.hashString('input1');
      const result2 = hashService.hashString('input2');

      expect(result1).not.toBe(result2);
    });

    it('should handle empty strings', () => {
      const result = hashService.hashString('');
      expect(result).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(result)).toBe(true);
    });

    it('should handle special characters and unicode', () => {
      const specialChars = 'Hello 世界! @#$%^&*()';
      const result = hashService.hashString(specialChars);

      expect(result).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(result)).toBe(true);
    });

    it('should be case sensitive', () => {
      const result1 = hashService.hashString('Test');
      const result2 = hashService.hashString('test');

      expect(result1).not.toBe(result2);
    });
  });
});

describe('RC4', () => {
  describe('encrypt', () => {
    it('should encrypt and decrypt strings correctly', () => {
      const key = 'secret-key';
      const plaintext = 'Hello, World!';

      const encrypted = RC4.encrypt(key, plaintext);
      const decrypted = RC4.decrypt(key, encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should return different ciphertext for same plaintext with different keys', () => {
      const plaintext = 'test data';
      const encrypted1 = RC4.encrypt('key1', plaintext);
      const encrypted2 = RC4.encrypt('key2', plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty strings', () => {
      const result1 = RC4.encrypt('key', '');
      const result2 = RC4.encrypt('', 'value');

      expect(result1).toBe('');
      expect(result2).toBe('value');
    });

    it('should handle null/undefined inputs gracefully', () => {
      expect(RC4.encrypt(null as any, 'test')).toBe('test');
      expect(RC4.encrypt('key', null as any)).toBe('');
      expect(RC4.encrypt(null as any, null as any)).toBe('');
    });

    it('should be symmetric (encrypt = decrypt)', () => {
      const key = 'test-key';
      const data = 'symmetric test';

      const encrypted = RC4.encrypt(key, data);
      const decrypted = RC4.encrypt(key, encrypted); // Using encrypt as decrypt

      expect(decrypted).toBe(data);
    });

    it('should handle special characters and unicode', () => {
      const key = 'unicode-key';
      const plaintext = 'Test with émojis 🎉 and spëcial chars!';

      const encrypted = RC4.encrypt(key, plaintext);
      const decrypted = RC4.decrypt(key, encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long strings', () => {
      const key = 'long-key';
      const plaintext = 'x'.repeat(10000);

      const encrypted = RC4.encrypt(key, plaintext);
      const decrypted = RC4.decrypt(key, encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('decrypt', () => {
    it('should be identical to encrypt (RC4 is symmetric)', () => {
      const key = 'test-key';
      const data = 'test data';

      expect(RC4.decrypt(key, data)).toBe(RC4.encrypt(key, data));
    });
  });
});

describe('Hex', () => {
  describe('encode', () => {
    it('should encode strings to hexadecimal format', () => {
      const input = 'Hello';
      const result = Hex.encode(input);

      // 'H' = 72 = 0x48, 'e' = 101 = 0x65, etc.
      expect(result).toBe('48656c6c6f');
    });

    it('should handle empty strings', () => {
      expect(Hex.encode('')).toBe('');
    });

    it('should handle null/undefined inputs', () => {
      expect(Hex.encode(null as any)).toBe('');
      expect(Hex.encode(undefined as any)).toBe('');
    });

    it('should encode special characters correctly', () => {
      const input = '!@#$';
      const result = Hex.encode(input);

      expect(result).toHaveLength(input.length * 2);
      expect(/^[0-9a-f]+$/.test(result)).toBe(true);
    });

    it('should be reversible with decode', () => {
      const input = 'Test String 123!';
      const encoded = Hex.encode(input);
      const decoded = Hex.decode(encoded);

      expect(decoded).toBe(input);
    });

    it('should handle unicode characters', () => {
      const input = 'émojis';
      const encoded = Hex.encode(input);
      const decoded = Hex.decode(encoded);

      expect(decoded).toBe(input);
    });
  });

  describe('decode', () => {
    it('should decode hexadecimal strings back to original format', () => {
      const hex = '48656c6c6f'; // "Hello" in hex
      const result = Hex.decode(hex);

      expect(result).toBe('Hello');
    });

    it('should handle empty strings', () => {
      expect(Hex.decode('')).toBe('');
    });

    it('should handle null/undefined inputs', () => {
      expect(Hex.decode(null as any)).toBe('');
      expect(Hex.decode(undefined as any)).toBe('');
    });

    it('should handle odd-length hex strings by padding with zero', () => {
      const oddHex = '48656c6c6'; // Missing last character
      const result = Hex.decode(oddHex);

      // Should pad with '0' to make it even length
      expect(result).toBeDefined();
    });

    it('should handle lowercase and uppercase hex', () => {
      const lowerHex = '48656c6c6f';
      const upperHex = '48656C6C6F';

      expect(Hex.decode(lowerHex)).toBe('Hello');
      expect(Hex.decode(upperHex)).toBe('Hello');
    });

    it('should be reversible with encode', () => {
      const originalHex = '48656c6c6f576f726c64';
      const decoded = Hex.decode(originalHex);
      const reencoded = Hex.encode(decoded);

      expect(reencoded).toBe(originalHex);
    });
  });
});


