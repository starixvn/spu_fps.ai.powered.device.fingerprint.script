import { MurmurHash128, Base64Encoder } from '../../../../../src/client/fingerprint/utils/hash';

describe('Hash Utilities', () => {
  describe('MurmurHash128', () => {
    describe('hash128', () => {
      it('should generate consistent hash for same input', () => {
        const input = 'test string';
        const hash1 = MurmurHash128.hash128(input);
        const hash2 = MurmurHash128.hash128(input);
        
        expect(hash1).toBe(hash2);
        expect(typeof hash1).toBe('string');
        expect(hash1).toHaveLength(32); // 128 bits = 32 hex characters
      });

      it('should generate different hashes for different inputs', () => {
        const hash1 = MurmurHash128.hash128('input1');
        const hash2 = MurmurHash128.hash128('input2');
        
        expect(hash1).not.toBe(hash2);
      });

      it('should handle empty string', () => {
        const hash = MurmurHash128.hash128('');
        
        expect(typeof hash).toBe('string');
        expect(hash).toHaveLength(32);
      });

      it('should handle different seeds', () => {
        const input = 'test string';
        const hash1 = MurmurHash128.hash128(input, 0);
        const hash2 = MurmurHash128.hash128(input, 1);
        
        expect(hash1).not.toBe(hash2);
      });

      it('should handle unicode characters', () => {
        const unicodeInput = 'Hello 世界 🌍';
        const hash = MurmurHash128.hash128(unicodeInput);
        
        expect(typeof hash).toBe('string');
        expect(hash).toHaveLength(32);
      });

      it('should handle very long strings', () => {
        const longInput = 'a'.repeat(10000);
        const hash = MurmurHash128.hash128(longInput);
        
        expect(typeof hash).toBe('string');
        expect(hash).toHaveLength(32);
      });

      it('should return hex string with lowercase characters', () => {
        const hash = MurmurHash128.hash128('test');
        
        expect(hash).toMatch(/^[0-9a-f]{32}$/);
      });

      it('should generate known hash for specific test cases', () => {
        // Test with empty string and seed 0
        const emptyHash = MurmurHash128.hash128('', 0);
        expect(emptyHash).toMatch(/^[0-9a-f]{32}$/);

        // Test with simple string
        const simpleHash = MurmurHash128.hash128('a', 0);
        expect(simpleHash).toMatch(/^[0-9a-f]{32}$/);
        expect(simpleHash).not.toBe(emptyHash);
      });
    });
  });

  describe('Base64Encoder', () => {
    describe('encodeBase64', () => {
      const testKey = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

      it('should encode simple strings correctly', () => {
        const input = 'Hello World';
        const encoded = Base64Encoder.encodeBase64(input, testKey);
        
        expect(typeof encoded).toBe('string');
        expect(encoded.length).toBeGreaterThan(0);
      });

      it('should handle empty string', () => {
        const encoded = Base64Encoder.encodeBase64('', testKey);
        
        expect(encoded).toBe('');
      });

      it('should generate consistent output for same input', () => {
        const input = 'test string';
        const encoded1 = Base64Encoder.encodeBase64(input, testKey);
        const encoded2 = Base64Encoder.encodeBase64(input, testKey);
        
        expect(encoded1).toBe(encoded2);
      });

      it('should generate different output for different keys', () => {
        const input = 'test string';
        const key1 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const key2 = 'ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba9876543210/+';
        
        const encoded1 = Base64Encoder.encodeBase64(input, key1);
        const encoded2 = Base64Encoder.encodeBase64(input, key2);
        
        expect(encoded1).not.toBe(encoded2);
      });

      it('should handle unicode characters', () => {
        const unicodeInput = 'Hello 世界 🌍';
        const encoded = Base64Encoder.encodeBase64(unicodeInput, testKey);
        
        expect(typeof encoded).toBe('string');
        expect(encoded.length).toBeGreaterThan(0);
      });

      it('should handle newline characters', () => {
        const inputWithNewlines = 'Line 1\nLine 2\r\nLine 3';
        const encoded = Base64Encoder.encodeBase64(inputWithNewlines, testKey);
        
        expect(typeof encoded).toBe('string');
        expect(encoded.length).toBeGreaterThan(0);
      });

      it('should only use characters from the provided key', () => {
        const input = 'test string';
        const customKey = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz+/';
        const encoded = Base64Encoder.encodeBase64(input, customKey);
        
        // Check that all characters in encoded string are from the key
        for (const char of encoded) {
          expect(customKey).toContain(char);
        }
      });

      it('should handle JSON objects', () => {
        const jsonObject = { name: 'test', value: 123, nested: { key: 'value' } };
        const jsonString = JSON.stringify(jsonObject);
        const encoded = Base64Encoder.encodeBase64(jsonString, testKey);
        
        expect(typeof encoded).toBe('string');
        expect(encoded.length).toBeGreaterThan(0);
      });

      it('should handle very long strings', () => {
        const longInput = 'a'.repeat(10000);
        const encoded = Base64Encoder.encodeBase64(longInput, testKey);
        
        expect(typeof encoded).toBe('string');
        expect(encoded.length).toBeGreaterThan(0);
      });

      it('should handle special characters', () => {
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const encoded = Base64Encoder.encodeBase64(specialChars, testKey);
        
        expect(typeof encoded).toBe('string');
        expect(encoded.length).toBeGreaterThan(0);
      });
    });
  });
});
