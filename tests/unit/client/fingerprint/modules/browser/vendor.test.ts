import { collectVendor } from '../../../../../../src/client/fingerprint/modules/browser/vendor';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock DOM and navigator
const mockNavigator = {
  vendor: '',
  brave: undefined as any,
  duckduckgo: undefined as any,
};

const mockWindow = {
  safari: undefined as any,
  InstallTrigger: undefined as any,
  opr: undefined as any,
  oprt: undefined as any,
  chrome: undefined as any,
  samsungAr: undefined as any,
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

describe('Vendor Module', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset mock values using defineProperty to avoid getter-only errors
    Object.keys(mockNavigator).forEach(key => {
      try {
        (mockNavigator as any)[key] = undefined;
      } catch {
        // Property might be read-only, use defineProperty
        Object.defineProperty(mockNavigator, key, {
          value: undefined,
          writable: true,
          configurable: true
        });
      }
    });
    Object.keys(mockWindow).forEach(key => {
      try {
        (mockWindow as any)[key] = undefined;
      } catch {
        // Property might be read-only, use defineProperty
        Object.defineProperty(mockWindow, key, {
          value: undefined,
          writable: true,
          configurable: true
        });
      }
    });
    
    // Set default vendor value
    Object.defineProperty(mockNavigator, 'vendor', {
      value: '',
      writable: true,
      configurable: true
    });
  });

  describe('collectVendor', () => {
    it('should detect Apple Computer, Inc. from Safari', () => {
      // Arrange
      mockWindow.safari = {
        pushNotification: {}
      };

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Apple Computer, Inc.');
    });

    it('should detect Mozilla Foundation from Firefox', () => {
      // Arrange
      mockWindow.InstallTrigger = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Mozilla Foundation');
    });

    it('should detect Opera Software ASA from Opera (opr)', () => {
      // Arrange
      mockWindow.opr = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Opera Software ASA');
    });

    it('should detect Opera Software ASA from Opera Touch (oprt)', () => {
      // Arrange
      mockWindow.oprt = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Opera Software ASA');
    });

    it('should detect Brave Software Inc. from navigator.brave', () => {
      // Arrange
      mockNavigator.brave = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Brave Software Inc.');
    });

    it('should detect Brave Software Inc. from window.chrome.brave', () => {
      // Arrange
      mockWindow.chrome = {
        brave: {}
      };

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Brave Software Inc.');
    });

    it('should detect Duck Duck Go, Inc. from navigator.duckduckgo', () => {
      // Arrange
      mockNavigator.duckduckgo = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Duck Duck Go, Inc.');
    });

    it('should detect Samsung Electronics from window.samsungAr', () => {
      // Arrange
      mockWindow.samsungAr = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Samsung Electronics');
    });

    it('should return navigator.vendor when it has a value', () => {
      // Arrange
      mockNavigator.vendor = 'Custom Vendor Name';

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Custom Vendor Name');
    });

    it('should ignore empty navigator.vendor string', () => {
      // Arrange
      mockNavigator.vendor = '';
      mockWindow.chrome = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Google Inc.');
    });

    it('should ignore whitespace-only navigator.vendor string', () => {
      // Arrange
      mockNavigator.vendor = '   ';
      mockWindow.chrome = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Google Inc.');
    });

    it('should detect Google Inc. from Chrome when present', () => {
      // Arrange
      mockWindow.chrome = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Google Inc.');
    });

    it('should return UNDEFINED when no vendor is detected', () => {
      // Arrange - No specific vendor indicators set

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return ERROR when an exception occurs', () => {
      // Arrange
      Object.defineProperty(mockWindow, 'safari', {
        get: () => {
          throw new Error('Test error');
        }
      });

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should prioritize Safari over other detections', () => {
      // Arrange
      mockWindow.safari = { pushNotification: {} };
      mockWindow.InstallTrigger = {}; // Firefox
      mockWindow.chrome = {}; // Chrome

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Apple Computer, Inc.');
    });

    it('should prioritize Firefox over Opera and others', () => {
      // Arrange
      mockWindow.InstallTrigger = {}; // Firefox
      mockWindow.opr = {}; // Opera
      mockWindow.chrome = {}; // Chrome

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Mozilla Foundation');
    });

    it('should prioritize Opera over Brave and others', () => {
      // Arrange
      mockWindow.opr = {}; // Opera
      mockNavigator.brave = {}; // Brave
      mockWindow.chrome = {}; // Chrome

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Opera Software ASA');
    });

    it('should prioritize Brave over DuckDuckGo and others', () => {
      // Arrange
      mockNavigator.brave = {}; // Brave
      mockNavigator.duckduckgo = {}; // DuckDuckGo
      mockWindow.chrome = {}; // Chrome

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Brave Software Inc.');
    });

    it('should prioritize DuckDuckGo over Samsung and others', () => {
      // Arrange
      mockNavigator.duckduckgo = {}; // DuckDuckGo
      mockWindow.samsungAr = {}; // Samsung
      mockWindow.chrome = {}; // Chrome

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Duck Duck Go, Inc.');
    });

    it('should prioritize Samsung over navigator.vendor', () => {
      // Arrange
      mockWindow.samsungAr = {}; // Samsung
      mockNavigator.vendor = 'Some Other Vendor';

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Samsung Electronics');
    });

    it('should prioritize navigator.vendor over Chrome detection', () => {
      // Arrange
      mockNavigator.vendor = 'Custom Vendor';
      mockWindow.chrome = {}; // Chrome

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Custom Vendor');
    });

    it('should handle Safari with missing pushNotification', () => {
      // Arrange
      mockWindow.safari = {}; // Safari without pushNotification

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle Safari with null pushNotification', () => {
      // Arrange
      mockWindow.safari = {
        pushNotification: null
      };

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle window.chrome with null brave property', () => {
      // Arrange
      mockWindow.chrome = {
        brave: null
      };

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Google Inc.'); // Should fallback to Chrome detection
    });

    it('should handle undefined window.chrome object', () => {
      // Arrange
      mockWindow.chrome = undefined;

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle null window.chrome object', () => {
      // Arrange
      mockWindow.chrome = null;

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle navigator.vendor with leading/trailing whitespace', () => {
      // Arrange
      mockNavigator.vendor = '  Apple Computer, Inc.  ';

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Apple Computer, Inc.');
    });

    it('should handle navigator.vendor with only whitespace', () => {
      // Arrange
      mockNavigator.vendor = '     ';
      mockWindow.chrome = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Google Inc.');
    });

    it('should handle navigator.vendor with tabs and newlines', () => {
      // Arrange
      mockNavigator.vendor = '\t\n  \r ';
      mockWindow.chrome = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Google Inc.');
    });

    it('should return navigator.vendor when it contains meaningful content after trimming', () => {
      // Arrange
      mockNavigator.vendor = '  Microsoft Corporation  ';
      mockWindow.chrome = {};

      // Act
      const result = collectVendor();

      // Assert
      expect(result).toBe('Microsoft Corporation');
    });

    it('should handle multiple boolean conditions correctly', () => {
      // Test scenarios where multiple conditions might be truthy
      const testCases = [
        {
          setup: () => {
            mockWindow.InstallTrigger = {};
            mockWindow.opr = {};
          },
          expected: 'Mozilla Foundation' // Firefox should win
        },
        {
          setup: () => {
            mockNavigator.brave = {};
            mockNavigator.duckduckgo = {};
          },
          expected: 'Brave Software Inc.' // Brave should win
        },
        {
          setup: () => {
            mockWindow.samsungAr = {};
            mockNavigator.vendor = 'Custom Vendor';
          },
          expected: 'Samsung Electronics' // Samsung should win
        }
      ];

      for (const testCase of testCases) {
        // Reset
        Object.keys(mockNavigator).forEach(key => {
          (mockNavigator as any)[key] = undefined;
        });
        Object.keys(mockWindow).forEach(key => {
          (mockWindow as any)[key] = undefined;
        });
        mockNavigator.vendor = '';

        // Arrange
        testCase.setup();

        // Act
        const result = collectVendor();

        // Assert
        expect(result).toBe(testCase.expected);
      }
    });
  });
});
