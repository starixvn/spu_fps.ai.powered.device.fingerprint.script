import { MurmurHash128, Base64Encoder, murmurhash3_32_gc } from '../../../../../src/client/fingerprint/utils/hash';

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

  describe('murmurhash3_32_gc', () => {
    it('should generate consistent hash for same input', () => {
      const input = 'test string';
      const hash1 = murmurhash3_32_gc(input);
      const hash2 = murmurhash3_32_gc(input);
      
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('number');
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = murmurhash3_32_gc('input1');
      const hash2 = murmurhash3_32_gc('input2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', () => {
      const hash = murmurhash3_32_gc('');
      
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThanOrEqual(0);
    });

    it('should handle different seeds', () => {
      const input = 'test string';
      const hash1 = murmurhash3_32_gc(input, 31);
      const hash2 = murmurhash3_32_gc(input, 42);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should use default seed when not provided', () => {
      const input = 'test string';
      const hashWithDefault = murmurhash3_32_gc(input);
      const hashWithSeed31 = murmurhash3_32_gc(input, 31);
      
      expect(hashWithDefault).toBe(hashWithSeed31);
    });

    it('should return unsigned 32-bit integer', () => {
      const hash = murmurhash3_32_gc('test');
      
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xFFFFFFFF);
      expect(Number.isInteger(hash)).toBe(true);
    });

    it('should handle unicode characters', () => {
      const unicodeInput = 'Hello 世界 🌍';
      const hash = murmurhash3_32_gc(unicodeInput);
      
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThanOrEqual(0);
    });

    it('should handle very long strings', () => {
      const longInput = 'a'.repeat(10000);
      const hash = murmurhash3_32_gc(longInput);
      
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThanOrEqual(0);
    });

    it('should handle strings with different remainders when divided by 4', () => {
      // Test strings with length % 4 = 0, 1, 2, 3
      const tests = [
        'abcd',     // length 4, remainder 0
        'abcde',    // length 5, remainder 1
        'abcdef',   // length 6, remainder 2
        'abcdefg'   // length 7, remainder 3
      ];

      tests.forEach((input, index) => {
        const hash = murmurhash3_32_gc(input);
        expect(typeof hash).toBe('number');
        expect(hash).toBeGreaterThanOrEqual(0);
      });
    });

    it('should generate good distribution for similar inputs', () => {
      // Test that similar inputs generate different hashes
      const hashes = new Set();
      for (let i = 0; i < 100; i++) {
        const hash = murmurhash3_32_gc(`test${i}`);
        hashes.add(hash);
      }
      
      // Should have generated many unique hashes (good distribution)
      expect(hashes.size).toBeGreaterThan(90);
    });
  });

  describe('Integration tests', () => {
    it('should work together to create unique fingerprints', () => {
      const data = { 
        browser: 'Chrome',
        os: 'Windows',
        screen: { width: 1920, height: 1080 }
      };
      
      const jsonString = JSON.stringify(data);
      const hash128 = MurmurHash128.hash128(jsonString);
      const hash32 = murmurhash3_32_gc(jsonString);
      const key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      const encoded = Base64Encoder.encodeBase64(jsonString, key);
      
      expect(hash128).toHaveLength(32);
      expect(typeof hash32).toBe('number');
      expect(encoded.length).toBeGreaterThan(0);
      
      // All should be deterministic
      expect(MurmurHash128.hash128(jsonString)).toBe(hash128);
      expect(murmurhash3_32_gc(jsonString)).toBe(hash32);
      expect(Base64Encoder.encodeBase64(jsonString, key)).toBe(encoded);
    });

    it('should handle complex fingerprint data structures', () => {
      const complexData = {
        fingerprint: {
          canvas: 'canvas_hash_value',
          webgl: { vendor: 'NVIDIA', renderer: 'GTX 1080' },
          audio: { sampleRate: 44100, channels: 2 },
          fonts: ['Arial', 'Times New Roman', 'Helvetica'],
          screen: { width: 1920, height: 1080, depth: 24 },
          timezone: 'UTC+7',
          language: 'en-US'
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };
      
      const jsonString = JSON.stringify(complexData);
      
      expect(() => {
        const hash128 = MurmurHash128.hash128(jsonString);
        const hash32 = murmurhash3_32_gc(jsonString);
        const key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const encoded = Base64Encoder.encodeBase64(jsonString, key);
        
        expect(hash128).toHaveLength(32);
        expect(typeof hash32).toBe('number');
        expect(encoded.length).toBeGreaterThan(0);
      }).not.toThrow();
    });
  });

  describe('Performance tests', () => {
    it('should handle performance requirements for hash functions', () => {
      const testData = 'x'.repeat(1000);
      const iterations = 1000;
      
      const start128 = performance.now();
      for (let i = 0; i < iterations; i++) {
        MurmurHash128.hash128(testData);
      }
      const end128 = performance.now();
      
      const start32 = performance.now();
      for (let i = 0; i < iterations; i++) {
        murmurhash3_32_gc(testData);
      }
      const end32 = performance.now();
      
      const startBase64 = performance.now();
      const key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (let i = 0; i < iterations; i++) {
        Base64Encoder.encodeBase64(testData, key);
      }
      const endBase64 = performance.now();
      
      // All operations should complete in reasonable time (less than 1 second for 1000 iterations)
      expect(end128 - start128).toBeLessThan(1000);
      expect(end32 - start32).toBeLessThan(1000);
      expect(endBase64 - startBase64).toBeLessThan(1000);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null and undefined gracefully', () => {
      // These will cause TypeScript errors but test runtime behavior
      expect(() => {
        // @ts-ignore - Testing runtime behavior
        MurmurHash128.hash128(null);
      }).toThrow();
      
      expect(() => {
        // @ts-ignore - Testing runtime behavior  
        murmurhash3_32_gc(null);
      }).toThrow();
      
      expect(() => {
        // @ts-ignore - Testing runtime behavior
        Base64Encoder.encodeBase64(null, 'key');
      }).toThrow();
    });

    it('should handle extremely large numbers in seed', () => {
      const input = 'test';
      const largeSeed = Number.MAX_SAFE_INTEGER;
      
      expect(() => {
        const hash128 = MurmurHash128.hash128(input, largeSeed);
        const hash32 = murmurhash3_32_gc(input, largeSeed);
        
        expect(typeof hash128).toBe('string');
        expect(typeof hash32).toBe('number');
      }).not.toThrow();
    });

    it('should handle negative seeds', () => {
      const input = 'test';
      const negativeSeed = -42;
      
      expect(() => {
        const hash128 = MurmurHash128.hash128(input, negativeSeed);
        const hash32 = murmurhash3_32_gc(input, negativeSeed);
        
        expect(typeof hash128).toBe('string');
        expect(typeof hash32).toBe('number');
      }).not.toThrow();
    });
  });
});
