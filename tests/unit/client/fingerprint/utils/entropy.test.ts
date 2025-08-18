import { 
  calculateEntropy, 
  calculateArrayEntropy, 
  estimateUniqueness, 
  calculateMaxEntropy 
} from '../../../../../src/client/fingerprint/utils/entropy';

describe('Entropy Calculation Utilities', () => {
  describe('calculateEntropy', () => {
    it('should return 0 for empty string', () => {
      const entropy = calculateEntropy('');
      expect(entropy).toBe(0);
    });

    it('should return 0 for single character repeated', () => {
      const entropy = calculateEntropy('aaaa');
      expect(entropy).toBe(0);
    });

    it('should return maximum entropy for equally distributed characters', () => {
      // String with 4 different characters, each appearing once
      const entropy = calculateEntropy('abcd');
      const expectedEntropy = Math.log2(4); // log2(4) = 2
      expect(entropy).toBeCloseTo(expectedEntropy, 10);
    });

    it('should return correct entropy for known distribution', () => {
      // String with 2 'a's and 2 'b's
      const entropy = calculateEntropy('aabb');
      const expectedEntropy = -2 * (0.5 * Math.log2(0.5)); // 1.0
      expect(entropy).toBeCloseTo(expectedEntropy, 10);
    });

    it('should handle single character', () => {
      const entropy = calculateEntropy('a');
      expect(entropy).toBe(0);
    });

    it('should calculate entropy for mixed character distribution', () => {
      // 'a' appears 3 times, 'b' appears 1 time
      const entropy = calculateEntropy('aaab');
      const probA = 3/4;
      const probB = 1/4;
      const expectedEntropy = -(probA * Math.log2(probA) + probB * Math.log2(probB));
      expect(entropy).toBeCloseTo(expectedEntropy, 10);
    });

    it('should handle special characters and unicode', () => {
      const entropy = calculateEntropy('!@#$🔍📱');
      expect(entropy).toBeGreaterThan(0);
      expect(entropy).toBeLessThanOrEqual(Math.log2(6)); // Max possible for 6 unique chars
    });

    it('should handle very long strings efficiently', () => {
      const longString = 'abcd'.repeat(10000); // 40,000 characters
      const startTime = Date.now();
      const entropy = calculateEntropy(longString);
      const endTime = Date.now();
      
      expect(entropy).toBeCloseTo(Math.log2(4), 10);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should be consistent for same input', () => {
      const input = 'test-string-123';
      const entropy1 = calculateEntropy(input);
      const entropy2 = calculateEntropy(input);
      expect(entropy1).toBe(entropy2);
    });

    it('should handle whitespace and newlines', () => {
      const entropy = calculateEntropy('a b\nc\td');
      expect(entropy).toBeGreaterThan(0);
    });

    it('should return different values for different distributions', () => {
      const entropy1 = calculateEntropy('aaaaabbbbb'); // Balanced
      const entropy2 = calculateEntropy('aaaaaaaabb'); // Skewed
      expect(entropy1).toBeGreaterThan(entropy2);
    });
  });

  describe('calculateArrayEntropy', () => {
    it('should return 0 for empty array', () => {
      const entropy = calculateArrayEntropy([]);
      expect(entropy).toBe(0);
    });

    it('should return 0 for array with identical values', () => {
      const entropy = calculateArrayEntropy(['a', 'a', 'a', 'a']);
      expect(entropy).toBe(0);
    });

    it('should return maximum entropy for unique values', () => {
      const values = ['a', 'b', 'c', 'd'];
      const entropy = calculateArrayEntropy(values);
      const expectedEntropy = Math.log2(4);
      expect(entropy).toBeCloseTo(expectedEntropy, 10);
    });

    it('should handle mixed data types', () => {
      const values = [1, 'string', true, null, undefined, { key: 'value' }];
      const entropy = calculateArrayEntropy(values);
      expect(entropy).toBeGreaterThan(0);
      expect(entropy).toBeLessThanOrEqual(Math.log2(6));
    });

    it('should handle numbers correctly', () => {
      const values = [1, 2, 3, 4, 1, 2];
      const entropy = calculateArrayEntropy(values);
      // 1 and 2 appear twice each, 3 and 4 appear once each
      const prob1 = 2/6, prob2 = 2/6, prob3 = 1/6, prob4 = 1/6;
      const expectedEntropy = -(prob1 * Math.log2(prob1) + prob2 * Math.log2(prob2) + 
                                prob3 * Math.log2(prob3) + prob4 * Math.log2(prob4));
      expect(entropy).toBeCloseTo(expectedEntropy, 10);
    });

    it('should handle boolean values', () => {
      const values = [true, false, true, false];
      const entropy = calculateArrayEntropy(values);
      const expectedEntropy = Math.log2(2); // 1.0
      expect(entropy).toBeCloseTo(expectedEntropy, 10);
    });

    it('should handle objects and arrays as values', () => {
      const values = [
        { name: 'test1' },
        { name: 'test2' },
        [1, 2, 3],
        [4, 5, 6],
        { name: 'test1' } // Duplicate object
      ];
      const entropy = calculateArrayEntropy(values);
      expect(entropy).toBeGreaterThan(0);
    });

    it('should treat different object structures as different', () => {
      const values = [
        { a: 1, b: 2 },
        { b: 2, a: 1 }, // Same content, different order - should be treated as same
        { a: 1, b: 3 }  // Different content
      ];
      const entropy = calculateArrayEntropy(values);
      expect(entropy).toBeGreaterThan(0);
    });

    it('should handle single element array', () => {
      const entropy = calculateArrayEntropy(['single']);
      expect(entropy).toBe(0);
    });

    it('should handle large arrays efficiently', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i % 100);
      const startTime = Date.now();
      const entropy = calculateArrayEntropy(largeArray);
      const endTime = Date.now();
      
      expect(entropy).toBeCloseTo(Math.log2(100), 1);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should be consistent for same input', () => {
      const values = [1, 2, 3, 'a', 'b'];
      const entropy1 = calculateArrayEntropy(values);
      const entropy2 = calculateArrayEntropy(values);
      expect(entropy1).toBe(entropy2);
    });

    it('should handle nested arrays and objects', () => {
      const values = [
        [1, [2, 3]],
        { nested: { deep: 'value' } },
        'simple',
        [1, [2, 3]] // Duplicate
      ];
      const entropy = calculateArrayEntropy(values);
      expect(entropy).toBeGreaterThan(0);
    });
  });

  describe('estimateUniqueness', () => {
    it('should return 0 when entropy is 0', () => {
      const uniqueness = estimateUniqueness(0, 10);
      expect(uniqueness).toBe(0);
    });

    it('should return 1 when entropy equals max entropy', () => {
      const uniqueness = estimateUniqueness(5, 5);
      expect(uniqueness).toBe(1);
    });

    it('should return 1 when entropy exceeds max entropy', () => {
      const uniqueness = estimateUniqueness(10, 5);
      expect(uniqueness).toBe(1);
    });

    it('should return correct ratio for partial entropy', () => {
      const uniqueness = estimateUniqueness(2.5, 5);
      expect(uniqueness).toBe(0.5);
    });

    it('should handle negative entropy gracefully', () => {
      const uniqueness = estimateUniqueness(-1, 5);
      expect(uniqueness).toBe(-0.2);
    });

    it('should be precise with floating point calculations', () => {
      const uniqueness = estimateUniqueness(Math.log2(3), Math.log2(8));
      const expected = Math.log2(3) / Math.log2(8);
      expect(uniqueness).toBeCloseTo(expected, 10);
    });

    it('should handle very small numbers', () => {
      const uniqueness = estimateUniqueness(0.001, 0.002);
      expect(uniqueness).toBe(0.5);
    });

    it('should handle very large numbers', () => {
      const uniqueness = estimateUniqueness(1000, 2000);
      expect(uniqueness).toBe(0.5);
    });
  });

  describe('calculateMaxEntropy', () => {
    it('should return 0 for 1 distinct value', () => {
      const maxEntropy = calculateMaxEntropy(1);
      expect(maxEntropy).toBe(0);
    });

    it('should return 1 for 2 distinct values', () => {
      const maxEntropy = calculateMaxEntropy(2);
      expect(maxEntropy).toBe(1);
    });

    it('should return 2 for 4 distinct values', () => {
      const maxEntropy = calculateMaxEntropy(4);
      expect(maxEntropy).toBe(2);
    });

    it('should return 3 for 8 distinct values', () => {
      const maxEntropy = calculateMaxEntropy(8);
      expect(maxEntropy).toBe(3);
    });

    it('should handle large numbers', () => {
      const maxEntropy = calculateMaxEntropy(1024);
      expect(maxEntropy).toBe(10);
    });

    it('should handle non-power-of-2 numbers', () => {
      const maxEntropy = calculateMaxEntropy(10);
      const expected = Math.log2(10);
      expect(maxEntropy).toBeCloseTo(expected, 10);
    });

    it('should handle zero distinct values', () => {
      const maxEntropy = calculateMaxEntropy(0);
      expect(maxEntropy).toBe(-Infinity);
    });

    it('should handle very large numbers', () => {
      const maxEntropy = calculateMaxEntropy(1000000);
      const expected = Math.log2(1000000);
      expect(maxEntropy).toBeCloseTo(expected, 10);
    });
  });

  describe('Integration and real-world scenarios', () => {
    it('should work together for fingerprint analysis', () => {
      // Simulate fingerprint attributes
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0)',
        'Mozilla/5.0 (Macintosh; Intel)',
        'Mozilla/5.0 (X11; Linux)',
        'Mozilla/5.0 (Windows NT 10.0)', // Duplicate
      ];
      
      const entropy = calculateArrayEntropy(userAgents);
      const maxEntropy = calculateMaxEntropy(3); // 3 unique values
      const uniqueness = estimateUniqueness(entropy, maxEntropy);
      
      expect(entropy).toBeGreaterThan(0);
      expect(entropy).toBeLessThan(maxEntropy);
      expect(uniqueness).toBeGreaterThan(0);
      expect(uniqueness).toBeLessThan(1);
    });

    it('should identify high entropy in random data', () => {
      const randomData = Array.from({ length: 100 }, (_, i) => `unique-${i}`);
      const entropy = calculateArrayEntropy(randomData);
      const maxEntropy = calculateMaxEntropy(100);
      const uniqueness = estimateUniqueness(entropy, maxEntropy);
      
      expect(entropy).toBeCloseTo(maxEntropy, 5);
      expect(uniqueness).toBeCloseTo(1, 2);
    });

    it('should handle browser fingerprint-like data', () => {
      const fingerprintData = {
        userAgent: 'Mozilla/5.0...',
        language: 'en-US',
        timezone: 'America/New_York',
        screen: '1920x1080',
        plugins: ['PDF', 'Flash']
      };
      
      const stringified = JSON.stringify(fingerprintData);
      const entropy = calculateEntropy(stringified);
      
      expect(entropy).toBeGreaterThan(0);
      expect(typeof entropy).toBe('number');
      expect(isFinite(entropy)).toBe(true);
    });

    it('should analyze font list entropy', () => {
      const commonFonts = ['Arial', 'Times', 'Helvetica'];
      const uniqueFonts = ['Arial', 'Times', 'Helvetica', 'CustomFont1', 'CustomFont2'];
      
      const commonEntropy = calculateArrayEntropy(commonFonts);
      const uniqueEntropy = calculateArrayEntropy(uniqueFonts);
      
      expect(uniqueEntropy).toBeGreaterThan(commonEntropy);
    });

    it('should measure canvas fingerprint randomness', () => {
      const canvasData1 = 'data:image/png;base64,iVBORw0KGgoAAAANSU...';
      const canvasData2 = 'data:image/png;base64,iVBORw0KGgoAAAANSU...different';
      
      const entropy1 = calculateEntropy(canvasData1);
      const entropy2 = calculateEntropy(canvasData2);
      
      expect(entropy1).toBeGreaterThan(0);
      expect(entropy2).toBeGreaterThan(0);
      expect(entropy1).not.toBe(entropy2);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle strings with only whitespace', () => {
      const entropy = calculateEntropy('   \t\n  ');
      expect(entropy).toBeGreaterThan(0);
      expect(isFinite(entropy)).toBe(true);
    });

    it('should handle arrays with null and undefined values', () => {
      const values = [null, undefined, null, undefined, 'value'];
      const entropy = calculateArrayEntropy(values);
      expect(entropy).toBeGreaterThan(0);
      expect(isFinite(entropy)).toBe(true);
    });

    it('should handle very small entropy values', () => {
      const largeArray = Array(10000).fill('same').concat(['different']);
      const entropy = calculateArrayEntropy(largeArray);
      const maxEntropy = calculateMaxEntropy(2);
      const uniqueness = estimateUniqueness(entropy, maxEntropy);
      
      expect(entropy).toBeGreaterThan(0);
      expect(entropy).toBeLessThan(0.1);
      expect(uniqueness).toBeLessThan(0.1);
    });

    it('should maintain precision with floating point arithmetic', () => {
      const values = ['a', 'b', 'c'];
      const entropy1 = calculateArrayEntropy(values);
      const entropy2 = calculateArrayEntropy(values.slice().reverse());
      
      expect(entropy1).toBe(entropy2);
    });
  });

  describe('Performance benchmarks', () => {
    it('should handle large string entropy calculation efficiently', () => {
      const largeString = Array.from({ length: 100000 }, (_, i) => 
        String.fromCharCode(65 + (i % 26))
      ).join('');
      
      const startTime = performance.now();
      const entropy = calculateEntropy(largeString);
      const endTime = performance.now();
      
      expect(entropy).toBeCloseTo(Math.log2(26), 1);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it('should handle large array entropy calculation efficiently', () => {
      const largeArray = Array.from({ length: 50000 }, (_, i) => i % 1000);
      
      const startTime = performance.now();
      const entropy = calculateArrayEntropy(largeArray);
      const endTime = performance.now();
      
      expect(entropy).toBeCloseTo(Math.log2(1000), 1);
      expect(endTime - startTime).toBeLessThan(500); // Should complete reasonably fast
    });
  });
});