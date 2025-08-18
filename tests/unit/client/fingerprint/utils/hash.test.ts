import { djb2Hash, simpleHash, hashArray, hashObject } from '../../../../../src/client/fingerprint/utils/hash';

describe('Hash Utility Functions', () => {
  describe('djb2Hash', () => {
    it('should return consistent hash for same input', () => {
      const input = 'test-string';
      const hash1 = djb2Hash(input);
      const hash2 = djb2Hash(input);
      
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash1)).toBe(true);
    });

    it('should return different hashes for different inputs', () => {
      const hash1 = djb2Hash('string1');
      const hash2 = djb2Hash('string2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', () => {
      const hash = djb2Hash('');
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const hash = djb2Hash(longString);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = djb2Hash(specialChars);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should handle unicode characters', () => {
      const unicode = '🔍📱💻🌐';
      const hash = djb2Hash(unicode);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should be case sensitive', () => {
      const hash1 = djb2Hash('Test');
      const hash2 = djb2Hash('test');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should produce valid hexadecimal output', () => {
      const hash = djb2Hash('test-input');
      const numericValue = parseInt(hash, 16);
      
      expect(Number.isNaN(numericValue)).toBe(false);
      expect(numericValue).toBeGreaterThanOrEqual(0);
    });
  });

  describe('simpleHash', () => {
    it('should return consistent hash for same input', () => {
      const input = 'test-string';
      const hash1 = simpleHash(input);
      const hash2 = simpleHash(input);
      
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('number');
      expect(hash1).toBeGreaterThanOrEqual(0);
    });

    it('should return different hashes for different inputs', () => {
      const hash1 = simpleHash('string1');
      const hash2 = simpleHash('string2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', () => {
      const hash = simpleHash('');
      
      expect(hash).toBe(0);
      expect(typeof hash).toBe('number');
    });

    it('should return positive numbers', () => {
      const hash1 = simpleHash('positive-test');
      const hash2 = simpleHash('another-test');
      const hash3 = simpleHash('third-test');
      
      expect(hash1).toBeGreaterThanOrEqual(0);
      expect(hash2).toBeGreaterThanOrEqual(0);
      expect(hash3).toBeGreaterThanOrEqual(0);
    });

    it('should handle very long strings', () => {
      const longString = 'b'.repeat(5000);
      const hash = simpleHash(longString);
      
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThanOrEqual(0);
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = simpleHash(specialChars);
      
      expect(typeof hash).toBe('number');
      expect(hash).toBeGreaterThanOrEqual(0);
    });

    it('should be case sensitive', () => {
      const hash1 = simpleHash('Test');
      const hash2 = simpleHash('test');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('hashArray', () => {
    it('should return consistent hash for same array', () => {
      const input = ['item1', 'item2', 'item3'];
      const hash1 = hashArray(input);
      const hash2 = hashArray(input);
      
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash1)).toBe(true);
    });

    it('should return different hashes for different arrays', () => {
      const array1 = ['item1', 'item2'];
      const array2 = ['item3', 'item4'];
      
      const hash1 = hashArray(array1);
      const hash2 = hashArray(array2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should be order sensitive', () => {
      const array1 = ['item1', 'item2'];
      const array2 = ['item2', 'item1'];
      
      const hash1 = hashArray(array1);
      const hash2 = hashArray(array2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty array', () => {
      const hash = hashArray([]);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should handle single item array', () => {
      const hash = hashArray(['single-item']);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should handle arrays with special characters', () => {
      const array = ['item!@#', 'item$%^', 'item&*()'];
      const hash = hashArray(array);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should handle arrays with empty strings', () => {
      const array = ['', 'item1', '', 'item2'];
      const hash = hashArray(array);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should handle large arrays', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => `item${i}`);
      const hash = hashArray(largeArray);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });
  });

  describe('hashObject', () => {
    it('should return consistent hash for same object', () => {
      const input = { key1: 'value1', key2: 'value2', key3: 'value3' };
      const hash1 = hashObject(input);
      const hash2 = hashObject(input);
      
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash1)).toBe(true);
    });

    it('should return different hashes for different objects', () => {
      const obj1 = { key1: 'value1' };
      const obj2 = { key2: 'value2' };
      
      const hash1 = hashObject(obj1);
      const hash2 = hashObject(obj2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should be key order independent', () => {
      const obj1 = { key1: 'value1', key2: 'value2' };
      const obj2 = { key2: 'value2', key1: 'value1' };
      
      const hash1 = hashObject(obj1);
      const hash2 = hashObject(obj2);
      
      expect(hash1).toBe(hash2);
    });

    it('should handle empty object', () => {
      const hash = hashObject({});
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should handle objects with different value types', () => {
      const obj = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
        array: [1, 2, 3],
        object: { nested: 'value' }
      };
      
      const hash = hashObject(obj);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should handle objects with special characters in keys and values', () => {
      const obj = {
        'key!@#': 'value$%^',
        'key&*()': 'value_+-='
      };
      
      const hash = hashObject(obj);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should be sensitive to value changes', () => {
      const obj1 = { key: 'value1' };
      const obj2 = { key: 'value2' };
      
      const hash1 = hashObject(obj1);
      const hash2 = hashObject(obj2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should be sensitive to key changes', () => {
      const obj1 = { key1: 'value' };
      const obj2 = { key2: 'value' };
      
      const hash1 = hashObject(obj1);
      const hash2 = hashObject(obj2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle objects with numeric keys', () => {
      const obj = {
        1: 'value1',
        2: 'value2',
        10: 'value10'
      };
      
      const hash = hashObject(obj);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should handle large objects', () => {
      const largeObj: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeObj[`key${i}`] = `value${i}`;
      }
      
      const hash = hashObject(largeObj);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });
  });

  describe('Hash collision and distribution', () => {
    it('should have low collision rate for djb2Hash', () => {
      const hashes = new Set<string>();
      const inputs = Array.from({ length: 1000 }, (_, i) => `test-string-${i}`);
      
      inputs.forEach(input => {
        hashes.add(djb2Hash(input));
      });
      
      // Should have very few collisions (less than 5% for 1000 inputs)
      expect(hashes.size).toBeGreaterThan(950);
    });

    it('should have low collision rate for simpleHash', () => {
      const hashes = new Set<number>();
      const inputs = Array.from({ length: 1000 }, (_, i) => `test-string-${i}`);
      
      inputs.forEach(input => {
        hashes.add(simpleHash(input));
      });
      
      // Should have very few collisions (less than 5% for 1000 inputs)
      expect(hashes.size).toBeGreaterThan(950);
    });

    it('should produce well-distributed hashes for hashArray', () => {
      const hashes = new Set<string>();
      const arrays = Array.from({ length: 500 }, (_, i) => [`item${i}`, `value${i}`]);
      
      arrays.forEach(array => {
        hashes.add(hashArray(array));
      });
      
      // Should have very few collisions
      expect(hashes.size).toBeGreaterThan(475);
    });

    it('should produce well-distributed hashes for hashObject', () => {
      const hashes = new Set<string>();
      const objects = Array.from({ length: 500 }, (_, i) => ({
        [`key${i}`]: `value${i}`,
        id: i
      }));
      
      objects.forEach(obj => {
        hashes.add(hashObject(obj));
      });
      
      // Should have very few collisions
      expect(hashes.size).toBeGreaterThan(475);
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle extremely long strings efficiently', () => {
      const veryLongString = 'x'.repeat(100000);
      const startTime = Date.now();
      
      const hash = djb2Hash(veryLongString);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(hash).toBeDefined();
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle objects with circular references gracefully', () => {
      const obj: any = { key: 'value' };
      obj.self = obj; // Create circular reference
      
      // Should handle toString conversion of circular reference
      expect(() => {
        const hash = hashObject(obj);
        expect(typeof hash).toBe('string');
      }).not.toThrow();
    });

    it('should handle arrays with various data types', () => {
      const mixedArray = [
        'string',
        42,
        true,
        null,
        undefined,
        { nested: 'object' },
        [1, 2, 3]
      ].map(item => String(item));
      
      const hash = hashArray(mixedArray);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });
  });
});