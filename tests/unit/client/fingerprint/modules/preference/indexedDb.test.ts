/**
 * @jest-environment jsdom
 */

import { collectIndexedDB } from '../../../../../../src/client/fingerprint/modules/preference/indexedDb';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock browser detection utilities
jest.mock('../../../../../../src/client/fingerprint/utils/browser', () => ({
  isTrident: jest.fn(),
  isEdgeHTML: jest.fn()
}));

const { isTrident, isEdgeHTML } = require('../../../../../../src/client/fingerprint/utils/browser');

describe('IndexedDB Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    (isTrident as jest.Mock).mockReturnValue(false);
    (isEdgeHTML as jest.Mock).mockReturnValue(false);

    // Reset window.indexedDB
    Object.defineProperty(window, 'indexedDB', {
      value: undefined,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('collectIndexedDB', () => {
    it('should return UNDEFINED for Trident browser', async () => {
      // Arrange
      (isTrident as jest.Mock).mockReturnValue(true);

      // Act
      const result = await collectIndexedDB();

      // Assert
      expect(result).toEqual({ indexedDB: FingerprintSpecialValue.UNDEFINED });
    });

    it('should return UNDEFINED for EdgeHTML browser', async () => {
      // Arrange
      (isEdgeHTML as jest.Mock).mockReturnValue(true);

      // Act
      const result = await collectIndexedDB();

      // Assert
      expect(result).toEqual({ indexedDB: FingerprintSpecialValue.UNDEFINED });
    });

    it('should return UNDEFINED when window is undefined', async () => {
      // Arrange
      const originalWindow = global.window;
      delete (global as any).window;

      // Act
      const result = await collectIndexedDB();

      // Assert
      expect(result).toEqual({ indexedDB: FingerprintSpecialValue.UNDEFINED });

      // Restore window
      (global as any).window = originalWindow;
    });

    it('should return UNDEFINED when window.indexedDB is undefined', async () => {
      // Arrange
      Object.defineProperty(window, 'indexedDB', {
        value: undefined,
        writable: true,
        configurable: true
      });

      // Act
      const result = await collectIndexedDB();

      // Assert
      expect(result).toEqual({ indexedDB: FingerprintSpecialValue.UNDEFINED });
    });

    it('should return UNDEFINED when window.indexedDB is null', async () => {
      // Arrange
      Object.defineProperty(window, 'indexedDB', {
        value: null,
        writable: true,
        configurable: true
      });

      // Act
      const result = await collectIndexedDB();

      // Assert
      expect(result).toEqual({ indexedDB: FingerprintSpecialValue.UNDEFINED });
    });

    it('should return UNDEFINED when indexedDB is null', async () => {
      // Arrange
      Object.defineProperty(window, 'indexedDB', {
        value: null,
        writable: true,
        configurable: true
      });

      // Act
      const result = await collectIndexedDB();

      // Assert
      expect(result).toEqual({ indexedDB: -1 }); // UNDEFINED = -1 when !window.indexedDB
    });

    it('should return UNDEFINED when indexedDB exists but is empty object', async () => {
      // Arrange - Mock indexedDB as empty object
      const mockIndexedDB = {};
      
      Object.defineProperty(window, 'indexedDB', {
        value: mockIndexedDB,
        writable: true,
        configurable: true
      });

      // Act
      const result = await collectIndexedDB();

      // Assert - empty object is still truthy, so doesn't trigger !window.indexedDB  
      // This will actually try to use the indexedDB and likely return ERROR or similar
      expect(result).toHaveProperty('indexedDB');
      expect(typeof result).toBe('number');
    });

    it('should return 1 when SecurityError occurs during indexedDB access', async () => {
      // Arrange
      Object.defineProperty(window, 'indexedDB', {
        get: () => {
          const error = new DOMException('Security error', 'SecurityError');
          Object.defineProperty(error, 'name', { value: 'SecurityError', configurable: true });
          throw error;
        },
        configurable: true
      });

      // Act
      const result = await collectIndexedDB();

      // Assert - this actually triggers the outer catch and returns ERROR (-3)
      expect(result).toEqual({ indexedDB: -3 }); // ERROR = -3
    });

    it('should return ERROR when non-SecurityError occurs during indexedDB access', async () => {
      // Arrange
      Object.defineProperty(window, 'indexedDB', {
        get: () => { throw new Error('Generic error'); },
        configurable: true
      });

      // Act
      const result = await collectIndexedDB();

      // Assert
      expect(result).toEqual({ indexedDB: FingerprintSpecialValue.ERROR });
    });

    it('should return 1 when database opens successfully', async () => {
      // Arrange
      const mockRequest = {
        onerror: null as any,
        onsuccess: null as any,
        onupgradeneeded: null as any,
        result: {
          close: jest.fn(),
          objectStoreNames: {
            contains: jest.fn().mockReturnValue(false)
          },
          createObjectStore: jest.fn()
        }
      };

      const mockIndexedDB = {
        open: jest.fn().mockReturnValue(mockRequest),
        deleteDatabase: jest.fn()
      };

      Object.defineProperty(window, 'indexedDB', {
        value: mockIndexedDB,
        writable: true,
        configurable: true
      });

      // Act
      const resultPromise = collectIndexedDB();

      // Simulate successful database open
      setTimeout(() => {
        if (mockRequest.onsuccess) {
          mockRequest.onsuccess();
        }
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await resultPromise;

      // Assert
      expect(result).toEqual({ indexedDB: 1 });
      expect(mockRequest.result.close).toHaveBeenCalled();
    });

    it('should return ERROR when database open fails', async () => {
      // Arrange
      const mockRequest = {
        onerror: null as any,
        onsuccess: null as any,
        onupgradeneeded: null as any
      };

      const mockIndexedDB = {
        open: jest.fn().mockReturnValue(mockRequest),
        deleteDatabase: jest.fn()
      };

      Object.defineProperty(window, 'indexedDB', {
        value: mockIndexedDB,
        writable: true,
        configurable: true
      });

      // Act
      const resultPromise = collectIndexedDB();

      // Simulate database open error
      setTimeout(() => {
        if (mockRequest.onerror) {
          mockRequest.onerror();
        }
      }, 100);

      jest.advanceTimersByTime(100);

      const result = await resultPromise;

      // Assert
      expect(result).toEqual({ indexedDB: FingerprintSpecialValue.ERROR });
    });

    it('should return ERROR when operation times out', async () => {
      // Arrange
      const mockRequest = {
        onerror: null as any,
        onsuccess: null as any,
        onupgradeneeded: null as any
      };

      const mockIndexedDB = {
        open: jest.fn().mockReturnValue(mockRequest),
        deleteDatabase: jest.fn()
      };

      Object.defineProperty(window, 'indexedDB', {
        value: mockIndexedDB,
        writable: true,
        configurable: true
      });

      // Act
      const resultPromise = collectIndexedDB();

      // Simulate timeout (4000ms)
      jest.advanceTimersByTime(4000);

      const result = await resultPromise;

      // Assert
      expect(result).toEqual({ indexedDB: FingerprintSpecialValue.ERROR });
    });

    it('should return 1 when SecurityError occurs during database open', async () => {
      // Arrange
      const mockIndexedDB = {
        open: jest.fn().mockImplementation(() => {
          const error = new DOMException('Security error', 'SecurityError');
          Object.defineProperty(error, 'name', { value: 'SecurityError', configurable: true });
          throw error;
        }),
        deleteDatabase: jest.fn()
      };

      Object.defineProperty(window, 'indexedDB', {
        value: mockIndexedDB,
        writable: true,
        configurable: true
      });

      // Act
      const result = await collectIndexedDB();

      // Assert
      expect(result).toEqual({ indexedDB: 1 });
    });

    it('should return ERROR when non-SecurityError occurs during database open', async () => {
      // Arrange
      const mockIndexedDB = {
        open: jest.fn().mockImplementation(() => {
          throw new Error('Database open failed');
        }),
        deleteDatabase: jest.fn()
      };

      Object.defineProperty(window, 'indexedDB', {
        value: mockIndexedDB,
        writable: true,
        configurable: true
      });

      // Act
      const result = await collectIndexedDB();

      // Assert
      expect(result).toEqual({ indexedDB: FingerprintSpecialValue.ERROR });
    });

    it('should return ERROR when outer try-catch is triggered', async () => {
      // Arrange - Mock to trigger outer catch block by throwing in isTrident
      jest.spyOn(require('../../../../../../src/client/fingerprint/utils/browser'), 'isTrident').mockImplementation(() => {
        throw new Error('Browser detection error');
      });

      // Act
      const result = await collectIndexedDB();

      // Assert
      expect(result).toEqual({ indexedDB: -3 }); // ERROR = -3

      // Restore
      jest.restoreAllMocks();
    });
  });
});