import { collectPdfViewerEnabled } from '../../../../../../src/client/fingerprint/modules/browser/pdfViewerEnabled';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

describe('PDF Viewer Enabled Module', () => {
  let mockNavigator: any;
  let originalNavigator: any;

  beforeAll(() => {
    // Store original navigator
    originalNavigator = global.navigator;
  });

  afterAll(() => {
    // Restore original navigator
    global.navigator = originalNavigator;
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create fresh mock navigator for each test
    mockNavigator = {
      pdfViewerEnabled: undefined
    };
    
    // Delete navigator to avoid redefinition error
    delete (global as any).navigator;
    
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
      configurable: true
    });
  });

  describe('collectPdfViewerEnabled', () => {
    it('should return 1 when PDF viewer is enabled', () => {
      // Arrange
      mockNavigator.pdfViewerEnabled = true;

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(1);
    });

    it('should return 0 when PDF viewer is disabled', () => {
      // Arrange
      mockNavigator.pdfViewerEnabled = false;

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(0);
    });

    it('should return UNDEFINED when navigator is not available', () => {
      // Arrange
      delete (global as any).navigator;
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return UNDEFINED when pdfViewerEnabled property is not available', () => {
      // Arrange
      mockNavigator.pdfViewerEnabled = undefined;

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return UNDEFINED when pdfViewerEnabled property does not exist', () => {
      // Arrange
      delete (mockNavigator as any).pdfViewerEnabled;

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return ERROR when an exception occurs', () => {
      // Arrange
      Object.defineProperty(mockNavigator, 'pdfViewerEnabled', {
        get: () => {
          throw new Error('Test error');
        },
        configurable: true
      });

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle truthy values correctly', () => {
      // Test various truthy values
      const truthyValues = [true, 1, '1', 'true', 'enabled', {}, [], function() {}];

      for (const value of truthyValues) {
        // Arrange
        mockNavigator.pdfViewerEnabled = value;

        // Act
        const result = collectPdfViewerEnabled();

        // Assert
        expect(result).toBe(1);
      }
    });

    it('should handle falsy values correctly', () => {
      // Test various falsy values
      const falsyValues = [false, 0, '', null];

      for (const value of falsyValues) {
        // Arrange
        mockNavigator.pdfViewerEnabled = value;

        // Act
        const result = collectPdfViewerEnabled();

        // Assert
        expect(result).toBe(0);
      }
    });

    it('should handle undefined specifically', () => {
      // Arrange
      mockNavigator.pdfViewerEnabled = undefined;

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle null navigator object', () => {
      // Arrange
      delete (global as any).navigator;
      Object.defineProperty(global, 'navigator', {
        value: null,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle navigator object without pdfViewerEnabled property', () => {
      // Arrange
      const navigatorWithoutPdf = {};
      delete (global as any).navigator;
      Object.defineProperty(global, 'navigator', {
        value: navigatorWithoutPdf,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle navigator as empty object', () => {
      // Arrange
      delete (global as any).navigator;
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
        configurable: true
      });

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle typeof navigator check', () => {
      // Arrange - Simulate environment where navigator doesn't exist
      const originalNavigator = global.navigator;
      delete (global as any).navigator;

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);

      // Cleanup
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true
      });
    });

    it('should handle number values for pdfViewerEnabled', () => {
      // Test specific number values
      const testCases = [
        { input: 1, expected: 1 },
        { input: 0, expected: 0 },
        { input: -1, expected: 1 }, // Truthy
        { input: 42, expected: 1 }, // Truthy
        { input: 0.1, expected: 1 }, // Truthy
        { input: -0, expected: 0 }, // Falsy
        { input: NaN, expected: 0 }, // Falsy
        { input: Infinity, expected: 1 }, // Truthy
        { input: -Infinity, expected: 1 }, // Truthy
      ];

      for (const testCase of testCases) {
        // Arrange
        mockNavigator.pdfViewerEnabled = testCase.input;

        // Act
        const result = collectPdfViewerEnabled();

        // Assert
        expect(result).toBe(testCase.expected);
      }
    });

    it('should handle string values for pdfViewerEnabled', () => {
      // Test specific string values
      const testCases = [
        { input: 'true', expected: 1 },
        { input: 'false', expected: 1 }, // Non-empty string is truthy
        { input: 'yes', expected: 1 },
        { input: 'no', expected: 1 }, // Non-empty string is truthy
        { input: '1', expected: 1 },
        { input: '0', expected: 1 }, // Non-empty string is truthy
        { input: '', expected: 0 }, // Empty string is falsy
        { input: ' ', expected: 1 }, // Non-empty string is truthy
      ];

      for (const testCase of testCases) {
        // Arrange
        mockNavigator.pdfViewerEnabled = testCase.input;

        // Act
        const result = collectPdfViewerEnabled();

        // Assert
        expect(result).toBe(testCase.expected);
      }
    });

    it('should handle object values for pdfViewerEnabled', () => {
      // Test object values
      const testCases = [
        { input: {}, expected: 1 }, // Empty object is truthy
        { input: { enabled: true }, expected: 1 }, // Object is truthy
        { input: [], expected: 1 }, // Empty array is truthy
        { input: [1, 2, 3], expected: 1 }, // Array is truthy
        { input: new Date(), expected: 1 }, // Date object is truthy
        { input: /regex/, expected: 1 }, // RegExp is truthy
      ];

      for (const testCase of testCases) {
        // Arrange
        mockNavigator.pdfViewerEnabled = testCase.input;

        // Act
        const result = collectPdfViewerEnabled();

        // Assert
        expect(result).toBe(testCase.expected);
      }
    });

    it('should handle function values for pdfViewerEnabled', () => {
      // Arrange
      mockNavigator.pdfViewerEnabled = function() { return true; };

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(1); // Function is truthy
    });

    it('should handle Symbol values for pdfViewerEnabled', () => {
      // Arrange
      mockNavigator.pdfViewerEnabled = Symbol('test');

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(1); // Symbol is truthy
    });

    it('should handle BigInt values for pdfViewerEnabled', () => {
      // Test BigInt values
      const testCases = [
        { input: BigInt(1), expected: 1 }, // Truthy
        { input: BigInt(0), expected: 0 }, // Falsy
        { input: BigInt(-1), expected: 1 }, // Truthy
        { input: BigInt(42), expected: 1 }, // Truthy
      ];

      for (const testCase of testCases) {
        // Arrange
        mockNavigator.pdfViewerEnabled = testCase.input;

        // Act
        const result = collectPdfViewerEnabled();

        // Assert
        expect(result).toBe(testCase.expected);
      }
    });

    it('should handle property getter that throws', () => {
      // Arrange
      Object.defineProperty(mockNavigator, 'pdfViewerEnabled', {
        get: () => {
          throw new Error('Property access failed');
        },
        configurable: true
      });

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle property descriptor with value', () => {
      // Arrange
      Object.defineProperty(mockNavigator, 'pdfViewerEnabled', {
        value: true,
        writable: true,
        enumerable: true,
        configurable: true
      });

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(1);
    });

    it('should handle non-enumerable property', () => {
      // Arrange
      Object.defineProperty(mockNavigator, 'pdfViewerEnabled', {
        value: false,
        writable: true,
        enumerable: false, // Non-enumerable
        configurable: true
      });

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(0);
    });

    it('should handle read-only property', () => {
      // Arrange
      Object.defineProperty(mockNavigator, 'pdfViewerEnabled', {
        value: true,
        writable: false, // Read-only
        enumerable: true,
        configurable: true
      });

      // Act
      const result = collectPdfViewerEnabled();

      // Assert
      expect(result).toBe(1);
    });
  });
});
