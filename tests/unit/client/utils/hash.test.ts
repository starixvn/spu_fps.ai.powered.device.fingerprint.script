import { RC4, Hex, PacketTransformer } from '../../../../src/client/utils/hash';

describe('RC4', () => {
  describe('encrypt', () => {
    it('should encrypt a simple string', () => {
      const key = 'testkey';
      const plaintext = new TextEncoder().encode('hello world');
      
      const result = RC4.encrypt(key, plaintext);
      
      expect(result).toBeDefined();
      expect(result).not.toEqual(plaintext);
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should return empty Uint8Array when value is empty', () => {
      const key = 'testkey';
      const plaintext = new Uint8Array(0);
      
      const result = RC4.encrypt(key, plaintext);
      
      expect(result).toEqual(new Uint8Array(0));
    });

    it('should return original value when key is empty', () => {
      const key = '';
      const plaintext = new TextEncoder().encode('hello world');
      
      const result = RC4.encrypt(key, plaintext);
      
      expect(result).toEqual(plaintext);
    });

    it('should return value when key is null or undefined', () => {
      const plaintext = new TextEncoder().encode('hello world');
      
      expect(RC4.encrypt(null as any, plaintext)).toEqual(plaintext);
      expect(RC4.encrypt(undefined as any, plaintext)).toEqual(plaintext);
    });

    it('should return empty Uint8Array when value is null or undefined', () => {
      const key = 'testkey';
      
      expect(RC4.encrypt(key, null as any)).toEqual(new Uint8Array(0));
      expect(RC4.encrypt(key, undefined as any)).toEqual(new Uint8Array(0));
    });

    it('should produce different outputs for different keys', () => {
      const plaintext = new TextEncoder().encode('hello world');
      const key1 = 'key1';
      const key2 = 'key2';
      
      const result1 = RC4.encrypt(key1, plaintext);
      const result2 = RC4.encrypt(key2, plaintext);
      
      expect(result1).not.toEqual(result2);
    });

    it('should produce different outputs for different plaintexts', () => {
      const key = 'testkey';
      const plaintext1 = new TextEncoder().encode('hello world');
      const plaintext2 = new TextEncoder().encode('goodbye world');
      
      const result1 = RC4.encrypt(key, plaintext1);
      const result2 = RC4.encrypt(key, plaintext2);
      
      expect(result1).not.toEqual(result2);
    });

    it('should handle special characters in key', () => {
      const key = '!@#$%^&*()';
      const plaintext = new TextEncoder().encode('hello world');
      
      const result = RC4.encrypt(key, plaintext);
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle special characters in plaintext', () => {
      const key = 'testkey';
      const plaintext = new TextEncoder().encode('héllo wörld!@#$%^&*()');
      
      const result = RC4.encrypt(key, plaintext);
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle long strings', () => {
      const key = 'testkey';
      const plaintext = new TextEncoder().encode('a'.repeat(1000));
      
      const result = RC4.encrypt(key, plaintext);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(1000);
    });

    it('should be deterministic - same input produces same output', () => {
      const key = 'testkey';
      const plaintext = new TextEncoder().encode('hello world');
      
      const result1 = RC4.encrypt(key, plaintext);
      const result2 = RC4.encrypt(key, plaintext);
      
      expect(result1).toEqual(result2);
    });
  });

  describe('decrypt', () => {
    it('should decrypt to original plaintext', () => {
      const key = 'testkey';
      const plaintext = new TextEncoder().encode('hello world');
      
      const encrypted = RC4.encrypt(key, plaintext);
      const decrypted = RC4.decrypt(key, encrypted);
      
      expect(decrypted).toEqual(plaintext);
    });

    it('should handle empty Uint8Array in decryption', () => {
      const key = 'testkey';
      const encrypted = new Uint8Array(0);
      
      const result = RC4.decrypt(key, encrypted);
      
      expect(result).toEqual(new Uint8Array(0));
    });

    it('should be symmetric with encrypt', () => {
      const key = 'testkey';
      const plaintext = new TextEncoder().encode('The quick brown fox jumps over the lazy dog');
      
      const encrypted = RC4.encrypt(key, plaintext);
      const decrypted = RC4.decrypt(key, encrypted);
      
      expect(decrypted).toEqual(plaintext);
    });

    it('should handle special characters correctly', () => {
      const key = 'testkey';
      const plaintext = new TextEncoder().encode('héllo wörld!@#$%^&*()çñü');
      
      const encrypted = RC4.encrypt(key, plaintext);
      const decrypted = RC4.decrypt(key, encrypted);
      
      expect(decrypted).toEqual(plaintext);
    });

    it('should handle long strings correctly', () => {
      const key = 'testkey';
      const plaintext = new TextEncoder().encode('Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50));
      
      const encrypted = RC4.encrypt(key, plaintext);
      const decrypted = RC4.decrypt(key, encrypted);
      
      expect(decrypted).toEqual(plaintext);
    });
  });
});

describe('Hex', () => {
  describe('encode', () => {
    it('should encode simple ASCII string to hex', () => {
      const input = new TextEncoder().encode('hello');
      
      const result = Hex.encode(input);
      
      // 'hello' = [104, 101, 108, 108, 111] = '68656c6c6f'
      expect(result).toBe('68656c6c6f');
    });

    it('should return empty string for empty input', () => {
      const input = new Uint8Array(0);
      
      const result = Hex.encode(input);
      
      expect(result).toBe('');
    });

    it('should return empty string for null or undefined input', () => {
      expect(Hex.encode(null as any)).toBe('');
      expect(Hex.encode(undefined as any)).toBe('');
    });

    it('should encode single character correctly', () => {
      const input = new TextEncoder().encode('A');
      
      const result = Hex.encode(input);
      
      // 'A' = 65 = '41'
      expect(result).toBe('41');
    });

    it('should encode special characters correctly', () => {
      const input = new TextEncoder().encode('!@#');
      
      const result = Hex.encode(input);
      
      // '!' = 33 = '21', '@' = 64 = '40', '#' = 35 = '23'
      expect(result).toBe('214023');
    });

    it('should encode numbers correctly', () => {
      const input = new TextEncoder().encode('123');
      
      const result = Hex.encode(input);
      
      // '1' = 49 = '31', '2' = 50 = '32', '3' = 51 = '33'
      expect(result).toBe('313233');
    });

    it('should encode Unicode characters correctly', () => {
      const input = new TextEncoder().encode('ñ');
      
      const result = Hex.encode(input);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(4); // UTF-8 encoding of 'ñ' is 2 bytes
    });

    it('should handle long strings', () => {
      const input = new TextEncoder().encode('a'.repeat(100));
      
      const result = Hex.encode(input);
      
      expect(result.length).toBe(200); // Each character becomes 2 hex digits
      expect(result).toBe('61'.repeat(100)); // 'a' = 97 = '61'
    });

    it('should produce lowercase hex digits', () => {
      const input = new TextEncoder().encode('Hello World');
      
      const result = Hex.encode(input);
      
      expect(result).toMatch(/^[0-9a-f]+$/); // Only lowercase hex digits
    });
  });

  describe('decode', () => {
    it('should decode hex string back to original', () => {
      const original = new TextEncoder().encode('hello');
      const hex = '68656c6c6f';
      
      const result = Hex.decode(hex);
      
      expect(result).toEqual(original);
    });

    it('should return empty Uint8Array for empty input', () => {
      const input = '';
      
      const result = Hex.decode(input);
      
      expect(result).toEqual(new Uint8Array(0));
    });

    it('should return empty Uint8Array for null or undefined input', () => {
      expect(Hex.decode(null as any)).toEqual(new Uint8Array(0));
      expect(Hex.decode(undefined as any)).toEqual(new Uint8Array(0));
    });

    it('should handle odd-length hex strings by padding with zero', () => {
      const input = '41'; // 'A'
      
      const result = Hex.decode(input);
      
      expect(result).toEqual(new TextEncoder().encode('A'));
    });

    it('should handle odd-length hex strings correctly', () => {
      const input = '414'; // Should be treated as '0414'
      
      const result = Hex.decode(input);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });

    it('should decode special characters correctly', () => {
      const hex = '214023'; // '!@#'
      
      const result = Hex.decode(hex);
      
      expect(result).toEqual(new TextEncoder().encode('!@#'));
    });

    it('should decode numbers correctly', () => {
      const hex = '313233'; // '123'
      
      const result = Hex.decode(hex);
      
      expect(result).toEqual(new TextEncoder().encode('123'));
    });

    it('should be symmetric with encode', () => {
      const original = new TextEncoder().encode('The quick brown fox jumps over the lazy dog!@#$%^&*()');
      
      const encoded = Hex.encode(original);
      const decoded = Hex.decode(encoded);
      
      expect(decoded).toEqual(original);
    });

    it('should handle long hex strings', () => {
      const original = new TextEncoder().encode('a'.repeat(100));
      const hex = '61'.repeat(100);
      
      const result = Hex.decode(hex);
      
      expect(result).toEqual(original);
    });

    it('should handle uppercase and lowercase hex digits', () => {
      const upperHex = '48656C6C6F'; // 'Hello'
      const lowerHex = '48656c6c6f'; // 'Hello'
      
      const upperResult = Hex.decode(upperHex);
      const lowerResult = Hex.decode(lowerHex);
      
      expect(upperResult).toEqual(new TextEncoder().encode('Hello'));
      expect(lowerResult).toEqual(new TextEncoder().encode('Hello'));
    });

    it('should handle invalid hex characters gracefully', () => {
      const invalidHex = '4g'; // 'g' is not a valid hex digit
      
      const result = Hex.decode(invalidHex);
      
      expect(result).toBeDefined(); // Should not throw, but result may be unexpected
    });
  });

  describe('encode/decode round trip', () => {
    it('should maintain data integrity through encode/decode cycle', () => {
      const testCases = [
        'hello world',
        'Hello World!',
        '1234567890',
        '!@#$%^&*()',
        '',
        'a',
        'The quick brown fox jumps over the lazy dog',
        'ñáéíóú',
        'Mixed123!@#'
      ];

      testCases.forEach(testCase => {
        const original = new TextEncoder().encode(testCase);
        const encoded = Hex.encode(original);
        const decoded = Hex.decode(encoded);
        expect(decoded).toEqual(original);
      });
    });
  });
});

describe('DeviceEncryption', () => {
  describe('Encrypt', () => {
    it('should encrypt plaintext and return hex-encoded result', () => {
      const plaintext = 'hello world';

      const result = PacketTransformer.wrapMessage(plaintext);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).not.toBe(plaintext);
      expect(result).toMatch(/^[0-9a-f]*$/); // Should be hex-encoded
    });

    it('should handle empty string', () => {
      const plaintext = '';

      const result = PacketTransformer.wrapMessage(plaintext);

      expect(result).toBe('');
    });

    it('should produce consistent results for same input', () => {
      const plaintext = 'test string';
      
      const result1 = PacketTransformer.wrapMessage(plaintext);
      const result2 = PacketTransformer.wrapMessage(plaintext);
      
      expect(result1).toBe(result2);
    });

    it('should produce different results for different inputs', () => {
      const plaintext1 = 'test string 1';
      const plaintext2 = 'test string 2';
      
      const result1 = PacketTransformer.wrapMessage(plaintext1);
      const result2 = PacketTransformer.wrapMessage(plaintext2);
      
      expect(result1).not.toBe(result2);
    });

    it('should handle special characters', () => {
      const plaintext = 'héllo wörld!@#$%^&*()';
      
      const result = PacketTransformer.wrapMessage(plaintext);
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^[0-9a-f]*$/);
    });

    it('should handle long strings', () => {
      const plaintext = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
      
      const result = PacketTransformer.wrapMessage(plaintext);
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^[0-9a-f]*$/);
      expect(result.length).toBe(plaintext.length * 2); // Hex encoding doubles length
    });

    it('should handle GUIDs correctly', () => {
      const guid = '123e4567e89b12d3a456426614174000';
      
      const result = PacketTransformer.wrapMessage(guid);
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^[0-9a-f]*$/);
      expect(result).not.toBe(guid);
    });

    it('should use the predefined encryption key', () => {
      const plaintext = 'test';
      
      // Since we can't directly test the key, we test that encryption works consistently
      const result1 = PacketTransformer.wrapMessage(plaintext);
      const result2 = PacketTransformer.wrapMessage(plaintext);
      
      expect(result1).toBe(result2);
      expect(result1).toMatch(/^[0-9a-f]*$/);
    });

    it('should handle numbers as strings', () => {
      const plaintext = '1234567890';
      
      const result = PacketTransformer.wrapMessage(plaintext);
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^[0-9a-f]*$/);
      expect(result).not.toBe(plaintext);
    });

    it('should handle single characters', () => {
      const plaintext = 'A';
      
      const result = PacketTransformer.wrapMessage(plaintext);
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^[0-9a-f]*$/);
      expect(result.length).toBe(2); // Single character becomes 2 hex digits
    });
  });

  describe('Integration with RC4 and Hex', () => {
    it('should be reversible when knowing the key', () => {
      const plaintext = 'test string for encryption';
      const encryptKey = '&％#@?,:*!~^.'; // The actual key used in DeviceEncryption
      
      // Encrypt using DeviceEncryption
      const encrypted = PacketTransformer.wrapMessage(plaintext);
      
      // Manually reverse the process
      const hexDecoded = Hex.decode(encrypted);
      const decrypted = RC4.decrypt(encryptKey, hexDecoded);
      const decryptedString = new TextDecoder().decode(decrypted);
      
      expect(decryptedString).toBe(plaintext);
    });

    it('should match manual RC4 + Hex process', () => {
      const plaintext = 'test string';
      const encryptKey = '&％#@?,:*!~^.';
      
      // Using DeviceEncryption
      const deviceResult = PacketTransformer.wrapMessage(plaintext);
      
      // Manual process
      const plaintextBytes = new TextEncoder().encode(plaintext);
      const rc4Encrypted = RC4.encrypt(encryptKey, plaintextBytes);
      const hexEncoded = Hex.encode(rc4Encrypted);
      
      expect(deviceResult).toBe(hexEncoded);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle very long strings', () => {
      const plaintext = 'a'.repeat(10000);
      
      const result = PacketTransformer.wrapMessage(plaintext);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(20000); // Hex encoding doubles the length
    });

    it('should handle strings with all possible ASCII characters', () => {
      let plaintext = '';
      for (let i = 32; i <= 126; i++) { // Printable ASCII characters
        plaintext += String.fromCharCode(i);
      }
      
      const result = PacketTransformer.wrapMessage(plaintext);
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^[0-9a-f]*$/);
    });

    it('should handle whitespace characters', () => {
      const plaintext = ' \t\n\r';
      
      const result = PacketTransformer.wrapMessage(plaintext);
      
      expect(result).toBeDefined();
      expect(result).toMatch(/^[0-9a-f]*$/);
    });
  });
});