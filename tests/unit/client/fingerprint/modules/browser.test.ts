import { BrowserFingerprint } from '../../../../../src/client/fingerprint/modules/browser';

// Mock navigator object
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  platform: 'Win32',
  cookieEnabled: true,
  doNotTrack: null,
  onLine: true,
  plugins: {
    length: 2,
    0: {
      name: 'Chrome PDF Plugin',
      description: 'Portable Document Format',
      filename: 'internal-pdf-viewer',
      version: undefined
    },
    1: {
      name: 'Chrome PDF Viewer',
      description: '',
      filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
      version: '1.0'
    }
  }
};

// Mock storage objects
const mockLocalStorage = {
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
  clear: jest.fn(),
};

const mockSessionStorage = {
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn(),
  clear: jest.fn(),
};

// Mock window object
const mockWindow = {
  indexedDB: {},
  openDatabase: jest.fn(),
};

describe('BrowserFingerprint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup global mocks
    (global as any).navigator = mockNavigator;
    (global as any).localStorage = mockLocalStorage;
    (global as any).sessionStorage = mockSessionStorage;
    (global as any).window = mockWindow;
    
    // Reset mock implementations
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    mockSessionStorage.removeItem.mockClear();
  });

  afterEach(() => {
    // Clean up global mocks
    delete (global as any).navigator;
    delete (global as any).localStorage;
    delete (global as any).sessionStorage;
    delete (global as any).window;
  });

  describe('collect', () => {
    it('should return complete browser fingerprint data', () => {
      const result = BrowserFingerprint.collect();

      expect(result).toHaveProperty('userAgent');
      expect(result).toHaveProperty('platform');
      expect(result).toHaveProperty('cookieEnabled');
      expect(result).toHaveProperty('doNotTrack');
      expect(result).toHaveProperty('onLine');
      expect(result).toHaveProperty('plugins');
      expect(result).toHaveProperty('localStorage');
      expect(result).toHaveProperty('sessionStorage');
      expect(result).toHaveProperty('indexedDB');
      expect(result).toHaveProperty('webSQL');
    });

    it('should collect correct navigator properties', () => {
      const result = BrowserFingerprint.collect();

      expect(result.userAgent).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      expect(result.platform).toBe('Win32');
      expect(result.cookieEnabled).toBe(true);
      expect(result.doNotTrack).toBeNull();
      expect(result.onLine).toBe(true);
    });

    it('should handle missing navigator properties gracefully', () => {
      (global as any).navigator = {
        userAgent: undefined,
        platform: undefined,
        cookieEnabled: undefined,
        doNotTrack: undefined,
        onLine: undefined,
        plugins: undefined
      };

      const result = BrowserFingerprint.collect();

      expect(result.userAgent).toBeUndefined();
      expect(result.platform).toBeUndefined();
      expect(result.cookieEnabled).toBeUndefined();
      expect(result.doNotTrack).toBeUndefined();
      expect(result.onLine).toBeUndefined();
      expect(result.plugins).toEqual([]);
    });

    it('should collect storage capabilities correctly', () => {
      const result = BrowserFingerprint.collect();

      expect(typeof result.localStorage).toBe('boolean');
      expect(typeof result.sessionStorage).toBe('boolean');
      expect(typeof result.indexedDB).toBe('boolean');
      expect(typeof result.webSQL).toBe('boolean');
    });
  });

  describe('navigator properties', () => {
    it('should handle different userAgent strings', () => {
      const testCases = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        ''
      ];

      testCases.forEach(userAgent => {
        (global as any).navigator = { ...mockNavigator, userAgent };
        const result = BrowserFingerprint.collect();
        expect(result.userAgent).toBe(userAgent);
      });
    });

    it('should handle different platform values', () => {
      const testCases = [
        'Win32',
        'MacIntel',
        'Linux x86_64',
        'Linux armv7l',
        ''
      ];

      testCases.forEach(platform => {
        (global as any).navigator = { ...mockNavigator, platform };
        const result = BrowserFingerprint.collect();
        expect(result.platform).toBe(platform);
      });
    });

    it('should handle different doNotTrack values', () => {
      const testCases = [
        null,
        '1',
        '0',
        'unspecified'
      ];

      testCases.forEach(doNotTrack => {
        (global as any).navigator = { ...mockNavigator, doNotTrack };
        const result = BrowserFingerprint.collect();
        expect(result.doNotTrack).toBe(doNotTrack);
      });
    });

    it('should handle cookieEnabled variations', () => {
      [true, false].forEach(cookieEnabled => {
        (global as any).navigator = { ...mockNavigator, cookieEnabled };
        const result = BrowserFingerprint.collect();
        expect(result.cookieEnabled).toBe(cookieEnabled);
      });
    });

    it('should handle onLine variations', () => {
      [true, false].forEach(onLine => {
        (global as any).navigator = { ...mockNavigator, onLine };
        const result = BrowserFingerprint.collect();
        expect(result.onLine).toBe(onLine);
      });
    });
  });

  describe('getPluginList', () => {
    it('should extract plugin information correctly', () => {
      const result = BrowserFingerprint.collect();

      expect(result.plugins).toHaveLength(2);
      expect(result.plugins[0]).toEqual({
        name: 'Chrome PDF Plugin',
        description: 'Portable Document Format',
        filename: 'internal-pdf-viewer',
        version: undefined
      });
      expect(result.plugins[1]).toEqual({
        name: 'Chrome PDF Viewer',
        description: '',
        filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
        version: '1.0'
      });
    });

    it('should handle empty plugins list', () => {
      (global as any).navigator = {
        ...mockNavigator,
        plugins: { length: 0 }
      };

      const result = BrowserFingerprint.collect();

      expect(result.plugins).toEqual([]);
    });

    it('should handle missing plugins property', () => {
      (global as any).navigator = {
        ...mockNavigator,
        plugins: null
      };

      const result = BrowserFingerprint.collect();

      expect(result.plugins).toEqual([]);
    });

    it('should handle undefined plugins property', () => {
      (global as any).navigator = {
        ...mockNavigator,
        plugins: undefined
      };

      const result = BrowserFingerprint.collect();

      expect(result.plugins).toEqual([]);
    });

    it('should handle plugins with missing properties', () => {
      (global as any).navigator = {
        ...mockNavigator,
        plugins: {
          length: 1,
          0: {
            name: 'Test Plugin',
            // Missing description, filename, version
          }
        }
      };

      const result = BrowserFingerprint.collect();

      expect(result.plugins).toHaveLength(1);
      expect(result.plugins[0]).toEqual({
        name: 'Test Plugin',
        description: undefined,
        filename: undefined,
        version: undefined
      });
    });

    it('should handle large number of plugins', () => {
      const mockPlugins: any = { length: 10 };
      for (let i = 0; i < 10; i++) {
        mockPlugins[i] = {
          name: `Plugin ${i}`,
          description: `Description ${i}`,
          filename: `plugin${i}.dll`,
          version: `${i}.0`
        };
      }

      (global as any).navigator = {
        ...mockNavigator,
        plugins: mockPlugins
      };

      const result = BrowserFingerprint.collect();

      expect(result.plugins).toHaveLength(10);
      expect(result.plugins[5]).toEqual({
        name: 'Plugin 5',
        description: 'Description 5',
        filename: 'plugin5.dll',
        version: '5.0'
      });
    });
  });

  describe('hasLocalStorage', () => {
    it('should return true when localStorage is available', () => {
      const result = BrowserFingerprint.collect();

      expect(result.localStorage).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('fps_test', 'fps_test');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('fps_test');
    });

    it('should return false when localStorage setItem throws error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = BrowserFingerprint.collect();

      expect(result.localStorage).toBe(false);
    });

    it('should return false when localStorage removeItem throws error', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('localStorage removeItem error');
      });

      const result = BrowserFingerprint.collect();

      expect(result.localStorage).toBe(false);
    });

    it('should return false when localStorage is undefined', () => {
      delete (global as any).localStorage;

      const result = BrowserFingerprint.collect();

      expect(result.localStorage).toBe(false);
    });

    it('should handle quota exceeded errors', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const result = BrowserFingerprint.collect();

      expect(result.localStorage).toBe(false);
    });
  });

  describe('hasSessionStorage', () => {
    it('should return true when sessionStorage is available', () => {
      const result = BrowserFingerprint.collect();

      expect(result.sessionStorage).toBe(true);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('fps_test', 'fps_test');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('fps_test');
    });

    it('should return false when sessionStorage setItem throws error', () => {
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('sessionStorage not available');
      });

      const result = BrowserFingerprint.collect();

      expect(result.sessionStorage).toBe(false);
    });

    it('should return false when sessionStorage removeItem throws error', () => {
      mockSessionStorage.removeItem.mockImplementation(() => {
        throw new Error('sessionStorage removeItem error');
      });

      const result = BrowserFingerprint.collect();

      expect(result.sessionStorage).toBe(false);
    });

    it('should return false when sessionStorage is undefined', () => {
      delete (global as any).sessionStorage;

      const result = BrowserFingerprint.collect();

      expect(result.sessionStorage).toBe(false);
    });
  });

  describe('hasIndexedDB', () => {
    it('should return true when indexedDB is available', () => {
      const result = BrowserFingerprint.collect();

      expect(result.indexedDB).toBe(true);
    });

    it('should return false when indexedDB is undefined', () => {
      (global as any).window = { ...mockWindow, indexedDB: undefined };

      const result = BrowserFingerprint.collect();

      expect(result.indexedDB).toBe(false);
    });

    it('should return false when indexedDB is null', () => {
      (global as any).window = { ...mockWindow, indexedDB: null };

      const result = BrowserFingerprint.collect();

      expect(result.indexedDB).toBe(false);
    });

    it('should return false when window is undefined', () => {
      delete (global as any).window;

      const result = BrowserFingerprint.collect();

      expect(result.indexedDB).toBe(false);
    });

    it('should handle indexedDB access errors', () => {
      Object.defineProperty(global, 'window', {
        get: () => {
          throw new Error('Window access error');
        },
        configurable: true
      });

      const result = BrowserFingerprint.collect();

      expect(result.indexedDB).toBe(false);
    });
  });

  describe('hasWebSQL', () => {
    it('should return true when openDatabase is available', () => {
      const result = BrowserFingerprint.collect();

      expect(result.webSQL).toBe(true);
    });

    it('should return false when openDatabase is undefined', () => {
      (global as any).window = { ...mockWindow, openDatabase: undefined };

      const result = BrowserFingerprint.collect();

      expect(result.webSQL).toBe(false);
    });

    it('should return false when openDatabase is null', () => {
      (global as any).window = { ...mockWindow, openDatabase: null };

      const result = BrowserFingerprint.collect();

      expect(result.webSQL).toBe(false);
    });

    it('should return false when window is undefined', () => {
      delete (global as any).window;

      const result = BrowserFingerprint.collect();

      expect(result.webSQL).toBe(false);
    });

    it('should handle openDatabase access errors', () => {
      Object.defineProperty(global, 'window', {
        get: () => {
          throw new Error('Window access error');
        },
        configurable: true
      });

      const result = BrowserFingerprint.collect();

      expect(result.webSQL).toBe(false);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle completely missing navigator', () => {
      delete (global as any).navigator;

      // This will likely throw an error, but the method should handle it gracefully
      expect(() => {
        BrowserFingerprint.collect();
      }).toThrow();
    });

    it('should handle partial navigator object', () => {
      (global as any).navigator = {
        userAgent: 'Test Agent'
        // Missing other properties
      };

      const result = BrowserFingerprint.collect();

      expect(result.userAgent).toBe('Test Agent');
      expect(result.platform).toBeUndefined();
      expect(result.cookieEnabled).toBeUndefined();
      expect(result.plugins).toEqual([]);
    });

    it('should handle private browsing mode', () => {
      // Simulate private browsing where storage throws errors
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage disabled in private mode');
      });
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('sessionStorage disabled in private mode');
      });

      const result = BrowserFingerprint.collect();

      expect(result.localStorage).toBe(false);
      expect(result.sessionStorage).toBe(false);
    });
  });

  describe('data consistency', () => {
    it('should return same results for multiple calls with same environment', () => {
      const result1 = BrowserFingerprint.collect();
      const result2 = BrowserFingerprint.collect();

      expect(result1).toEqual(result2);
    });

    it('should detect changes in navigator properties', () => {
      const result1 = BrowserFingerprint.collect();

      // Change navigator properties
      (global as any).navigator = {
        ...mockNavigator,
        userAgent: 'Different User Agent',
        onLine: false
      };

      const result2 = BrowserFingerprint.collect();

      expect(result1.userAgent).not.toBe(result2.userAgent);
      expect(result1.onLine).not.toBe(result2.onLine);
    });
  });
});