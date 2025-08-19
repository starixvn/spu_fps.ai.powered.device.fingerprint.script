import { LocalStorageHandler } from '../../../../../src/client/tagging/modules/localStorage';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Mock window object for browser environment
const mockWindow = {
  localStorage: mockLocalStorage,
};

// Setup global mocks
(global as any).window = mockWindow;

describe('LocalStorageHandler', () => {
  let localStorageHandler: LocalStorageHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    
    // Create new instance for each test
    localStorageHandler = new LocalStorageHandler();
  });

  describe('get', () => {
    it('should return value when key exists in localStorage', async () => {
      const testKey = 'testKey';
      const testValue = 'testValue';
      
      mockLocalStorage.getItem.mockReturnValue(testValue);

      const result = await localStorageHandler.get(testKey);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(testKey);
      expect(result).toBe(testValue);
    });

    it('should return null when key does not exist in localStorage', async () => {
      const testKey = 'nonExistentKey';
      
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await localStorageHandler.get(testKey);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(testKey);
      expect(result).toBeNull();
    });

    it('should return null when localStorage is not available', async () => {
      const originalWindow = (global as any).window;
      (global as any).window = { localStorage: null };

      const result = await localStorageHandler.get('testKey');

      expect(result).toBeNull();
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should return null when window.localStorage is undefined', async () => {
      const originalWindow = (global as any).window;
      (global as any).window = {};

      const result = await localStorageHandler.get('testKey');

      expect(result).toBeNull();
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should return null when getItem throws an exception', async () => {
      const testKey = 'testKey';
      
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });

      const result = await localStorageHandler.get(testKey);

      expect(result).toBeNull();
    });

    it('should handle empty string values correctly', async () => {
      const testKey = 'emptyKey';
      const testValue = '';
      
      mockLocalStorage.getItem.mockReturnValue(testValue);

      const result = await localStorageHandler.get(testKey);

      expect(result).toBe('');
    });

    it('should handle special characters in keys', async () => {
      const testKey = 'special/key@#$%';
      const testValue = 'specialValue';
      
      mockLocalStorage.getItem.mockReturnValue(testValue);

      const result = await localStorageHandler.get(testKey);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(testKey);
      expect(result).toBe(testValue);
    });

    it('should handle large values correctly', async () => {
      const testKey = 'largeKey';
      const testValue = 'a'.repeat(10000); // Large string
      
      mockLocalStorage.getItem.mockReturnValue(testValue);

      const result = await localStorageHandler.get(testKey);

      expect(result).toBe(testValue);
    });
  });

  describe('set', () => {
    it('should successfully set value in localStorage', async () => {
      const testKey = 'testKey';
      const testValue = 'testValue';

      const result = await localStorageHandler.set(testKey, testValue);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, testValue);
      expect(result).toBe(true);
    });

    it('should return false when localStorage is not available', async () => {
      const originalWindow = (global as any).window;
      (global as any).window = { localStorage: null };

      const result = await localStorageHandler.set('testKey', 'testValue');

      expect(result).toBe(false);
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should return false when window.localStorage is undefined', async () => {
      const originalWindow = (global as any).window;
      (global as any).window = {};

      const result = await localStorageHandler.set('testKey', 'testValue');

      expect(result).toBe(false);
      
      // Restore original window
      (global as any).window = originalWindow;
    });

    it('should return false when setItem throws an exception', async () => {
      const testKey = 'testKey';
      const testValue = 'testValue';
      
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
      });

      const result = await localStorageHandler.set(testKey, testValue);

      expect(result).toBe(false);
    });

    // it('should handle empty string values', async () => {
    //   const testKey = 'emptyKey';
    //   const testValue = '';

    //   const result = await localStorageHandler.set(testKey, testValue);

    //   expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, testValue);
    //   expect(result).toBe(true);
    // });

    // it('should handle special characters in keys and values', async () => {
    //   const testKey = 'special/key@#$%';
    //   const testValue = 'special/value@#$%^&*()';

    //   const result = await localStorageHandler.set(testKey, testValue);

    //   expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, testValue);
    //   expect(result).toBe(true);
    // });

    // it('should handle JSON string values', async () => {
    //   const testKey = 'jsonKey';
    //   const testValue = JSON.stringify({ name: 'test', value: 123 });

    //   const result = await localStorageHandler.set(testKey, testValue);

    //   expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, testValue);
    //   expect(result).toBe(true);
    // });

    // it('should handle large values', async () => {
    //   const testKey = 'largeKey';
    //   const testValue = 'a'.repeat(10000);

    //   const result = await localStorageHandler.set(testKey, testValue);

    //   expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, testValue);
    //   expect(result).toBe(true);
    // });
  });

  describe('available', () => {
    it('should return true when localStorage is available', () => {
      const result = localStorageHandler.available();

      expect(result).toBe(true);
    });

    it('should return false when window.localStorage is undefined', () => {
      const originalWindow = (global as any).window;
      (global as any).window = {};

      const result = localStorageHandler.available();

      expect(result).toBe(false);
      
      // Restore original window
      (global as any).window = originalWindow;
    });
  });

  // describe('Integration scenarios', () => {
  //   it('should handle complete localStorage workflow', async () => {
  //     const testKey = 'integrationKey';
  //     const testValue = 'integrationValue';

  //     // First, check localStorage is available
  //     expect(localStorageHandler.available()).toBe(true);

  //     // Set a value
  //     const setResult = await localStorageHandler.set(testKey, testValue);
  //     expect(setResult).toBe(true);

  //     // Mock the return value for get
  //     mockLocalStorage.getItem.mockReturnValue(testValue);

  //     // Get the value
  //     const getValue = await localStorageHandler.get(testKey);
  //     expect(getValue).toBe(testValue);
  //   });

  //   it('should handle overwriting existing values', async () => {
  //     const testKey = 'overwriteKey';
  //     const firstValue = 'firstValue';
  //     const secondValue = 'secondValue';

  //     // Set first value
  //     await localStorageHandler.set(testKey, firstValue);
  //     expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, firstValue);

  //     // Set second value (overwrite)
  //     await localStorageHandler.set(testKey, secondValue);
  //     expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, secondValue);

  //     // Verify setItem was called twice
  //     expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
  //   });

  //   it('should handle multiple key-value pairs', async () => {
  //     const pairs = [
  //       { key: 'key1', value: 'value1' },
  //       { key: 'key2', value: 'value2' },
  //       { key: 'key3', value: 'value3' }
  //     ];

  //     // Set multiple values
  //     for (const pair of pairs) {
  //       const result = await localStorageHandler.set(pair.key, pair.value);
  //       expect(result).toBe(true);
  //     }

  //     // Mock get responses
  //     for (const pair of pairs) {
  //       mockLocalStorage.getItem.mockReturnValueOnce(pair.value);
  //       const result = await localStorageHandler.get(pair.key);
  //       expect(result).toBe(pair.value);
  //     }
  //   });

  //   it('should handle edge cases with null and undefined', async () => {
  //     const testKey = 'nullKey';

  //     // Mock getItem returning null
  //     mockLocalStorage.getItem.mockReturnValue(null);
  //     const result = await localStorageHandler.get(testKey);
  //     expect(result).toBeNull();

  //     // Set value and verify it works
  //     const setValue = 'actualValue';
  //     await localStorageHandler.set(testKey, setValue);
  //     expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, setValue);
  //   });

  //   it('should handle concurrent operations', async () => {
  //     const keys = ['concurrent1', 'concurrent2', 'concurrent3'];
  //     const values = ['value1', 'value2', 'value3'];

  //     // Simulate concurrent set operations
  //     const results = await Promise.all(
  //       keys.map((key, index) => localStorageHandler.set(key, values[index]))
  //     );

  //     // All should succeed
  //     results.forEach(result => expect(result).toBe(true));

  //     // Verify all setItem calls were made
  //     keys.forEach((key, index) => {
  //       expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, values[index]);
  //     });
  //   });

  //   it('should handle storage when disabled in private browsing', async () => {
  //     // Simulate private browsing where localStorage exists but throws on use
  //     mockLocalStorage.setItem.mockImplementation(() => {
  //       throw new Error('localStorage is disabled');
  //     });

  //     expect(localStorageHandler.available()).toBe(true); // available() only checks if defined
  //     expect(await localStorageHandler.set('testKey', 'testValue')).toBe(false); // set() will fail
  //   });
  // });
});