import { collectVendorFlavors } from '../../../../../../src/client/fingerprint/modules/browser/vendorFlavors';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

describe('Vendor Flavors Module', () => {
  let mockWindow: any;
  let originalWindow: any;

  beforeAll(() => {
    // Store original window if it exists
    originalWindow = (global as any).window;
  });

  afterAll(() => {
    // Restore original window
    if (originalWindow) {
      (global as any).window = originalWindow;
    } else {
      delete (global as any).window;
    }
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create fresh mock window for each test
    mockWindow = {
      chrome: undefined,
      safari: undefined,
      __crWeb: undefined,
      __gCrWeb: undefined,
      yandex: undefined,
      __yb: undefined,
      __ybro: undefined,
      __firefox__: undefined,
      __edgeTrackingPreventionStatistics: undefined,
      webkit: undefined,
      oprt: undefined,
      samsungAr: undefined,
      ucweb: undefined,
      UCShellJava: undefined,
      puffinDevice: undefined,
    };
    
    // Delete window to avoid redefinition error
    delete (global as any).window;
    
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
      configurable: true
    });
  });

  describe('collectVendorFlavors', () => {
    it('should detect Chrome flavor', () => {
      // Arrange
      mockWindow.chrome = { runtime: {} };

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['chrome']);
    });

    it('should detect Safari flavor', () => {
      // Arrange
      mockWindow.safari = { pushNotification: {} };

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['safari']);
    });

    it('should detect Chrome on iOS flavors', () => {
      // Arrange
      mockWindow.__crWeb = {};
      mockWindow.__gCrWeb = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['__crWeb', '__gCrWeb']);
    });

    it('should detect Yandex Browser flavors', () => {
      // Arrange
      mockWindow.yandex = {};
      mockWindow.__yb = {};
      mockWindow.__ybro = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['__yb', '__ybro', 'yandex']);
    });

    it('should detect Firefox on iOS flavor', () => {
      // Arrange
      mockWindow.__firefox__ = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['__firefox__']);
    });

    it('should detect Edge on iOS flavor', () => {
      // Arrange
      mockWindow.__edgeTrackingPreventionStatistics = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['__edgeTrackingPreventionStatistics']);
    });

    it('should detect WebKit flavor', () => {
      // Arrange
      mockWindow.webkit = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['webkit']);
    });

    it('should detect Opera Touch on iOS flavor', () => {
      // Arrange
      mockWindow.oprt = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['oprt']);
    });

    it('should detect Samsung Internet flavor', () => {
      // Arrange
      mockWindow.samsungAr = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['samsungAr']);
    });

    it('should detect UC Browser flavors', () => {
      // Arrange
      mockWindow.ucweb = {};
      mockWindow.UCShellJava = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['UCShellJava', 'ucweb']);
    });

    it('should detect Puffin Browser flavor', () => {
      // Arrange
      mockWindow.puffinDevice = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['puffinDevice']);
    });

    it('should detect multiple flavors and sort them', () => {
      // Arrange
      mockWindow.chrome = {};
      mockWindow.webkit = {};
      mockWindow.safari = {};
      mockWindow.yandex = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['chrome', 'safari', 'webkit', 'yandex']);
    });

    it('should return empty array when no flavors are detected', () => {
      // Arrange - No browser globals set

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual([]);
    });

    it('should ignore non-object values', () => {
      // Arrange
      mockWindow.chrome = 'string'; // Not an object
      mockWindow.safari = 123; // Not an object
      mockWindow.webkit = null; // Not an object
      mockWindow.yandex = undefined; // Not an object
      mockWindow.ucweb = {}; // Valid object

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['ucweb']);
    });

    it('should ignore boolean values', () => {
      // Arrange
      mockWindow.chrome = true; // Not an object
      mockWindow.safari = false; // Not an object
      mockWindow.webkit = {}; // Valid object

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['webkit']);
    });

    it('should ignore function values', () => {
      // Arrange
      mockWindow.chrome = function() {}; // Not an object (functions are typeof 'function')
      mockWindow.safari = {}; // Valid object

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['safari']);
    });

    it('should handle arrays as objects', () => {
      // Arrange
      mockWindow.chrome = []; // Arrays are objects
      mockWindow.safari = {}; // Valid object

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['chrome', 'safari']);
    });

    it('should return ERROR when an exception occurs', () => {
      // Arrange
      Object.defineProperty(mockWindow, 'chrome', {
        get: () => {
          throw new Error('Test error');
        }
      });

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle window object without expected properties', () => {
      // Arrange
      const limitedWindow = {}; // Empty window object
      Object.defineProperty(global, 'window', {
        value: limitedWindow,
        writable: true,
      });

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual([]);
    });

    it('should sort results alphabetically', () => {
      // Arrange - Set up in non-alphabetical order
      mockWindow.yandex = {};
      mockWindow.chrome = {};
      mockWindow.webkit = {};
      mockWindow.safari = {};
      mockWindow.__crWeb = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['__crWeb', 'chrome', 'safari', 'webkit', 'yandex']);
    });

    it('should handle case-sensitive property names correctly', () => {
      // Arrange
      (mockWindow as any).Chrome = {}; // Wrong case
      mockWindow.chrome = {}; // Correct case
      (mockWindow as any).SAFARI = {}; // Wrong case
      mockWindow.safari = {}; // Correct case

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['chrome', 'safari']); // Only correct case should be detected
    });

    it('should handle all browser globals simultaneously', () => {
      // Arrange - Set all supported browser globals
      const allGlobals = [
        'chrome', 'safari', '__crWeb', '__gCrWeb', 'yandex', '__yb', '__ybro',
        '__firefox__', '__edgeTrackingPreventionStatistics', 'webkit', 'oprt',
        'samsungAr', 'ucweb', 'UCShellJava', 'puffinDevice'
      ];

      allGlobals.forEach(global => {
        (mockWindow as any)[global] = {};
      });

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(allGlobals.sort());
      expect(result).toHaveLength(allGlobals.length);
    });

    it('should handle edge case with null and undefined mixed with valid objects', () => {
      // Arrange
      mockWindow.chrome = {};
      mockWindow.safari = null;
      mockWindow.webkit = undefined;
      mockWindow.yandex = {};
      mockWindow.ucweb = false;
      mockWindow.oprt = {};

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['chrome', 'oprt', 'yandex']);
    });

    it('should handle empty objects as valid flavors', () => {
      // Arrange
      mockWindow.chrome = {}; // Empty object should still count
      mockWindow.safari = { someProperty: 'value' }; // Object with properties

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['chrome', 'safari']);
    });

    it('should handle deeply nested objects', () => {
      // Arrange
      mockWindow.chrome = {
        runtime: {
          nested: {
            deeply: 'value'
          }
        }
      };
      mockWindow.safari = {
        pushNotification: {
          toString: function() { return 'test'; }
        }
      };

      // Act
      const result = collectVendorFlavors();

      // Assert
      expect(result).toEqual(['chrome', 'safari']);
    });
  });
});
