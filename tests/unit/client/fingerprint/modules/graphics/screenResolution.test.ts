import { collectScreenResolution } from '../../../../../../src/client/fingerprint/modules/graphics/screenResolution';
import { isBrave } from '../../../../../../src/client/fingerprint/utils/browser';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock browser detection functions
jest.mock('../../../../../../src/client/fingerprint/utils/browser', () => ({
  isWebKit: jest.fn(() => false),
  isWebKit616OrNewer: jest.fn(() => false),
  isSafariWebKit: jest.fn(() => false),
  isSamsungInternetV17OrNewer: jest.fn(() => false),
  isBrave: jest.fn(() => false),
}));

// Mock DOM objects - configured to make isLikelyMobile() return false
const mockWindow = {
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1, // Low DPR to avoid mobile detection
  matchMedia: jest.fn((query: string) => ({
    matches: query === '(hover: hover)' ? true : false // Has hover capability (desktop)
  }))
};

const mockDocument = {
  documentElement: {
    clientWidth: 1920,
    clientHeight: 1080
  }
};

const mockNavigator = {
  maxTouchPoints: 0 // No touch support
};

// Mock screen object
const mockScreen = {
  width: 1920,
  height: 1080,
  availWidth: 1920,
  availHeight: 1040
};

describe('Screen Resolution Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup screen mock
    Object.defineProperty(global, 'screen', {
      value: mockScreen,
      writable: true,
      configurable: true
    });

    // Setup window mock
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
      configurable: true
    });

    // Setup document mock
    Object.defineProperty(global, 'document', {
      value: mockDocument,
      writable: true,
      configurable: true
    });

    // Setup navigator mock
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
      configurable: true
    });
    
    (isBrave as jest.Mock).mockReturnValue(false);
  });

  describe('collectScreenResolution', () => {
    it('should return screen resolution as [width, height] array', () => {
      // Arrange
      mockScreen.width = 1920;
      mockScreen.height = 1080;

      // Act
      const result = collectScreenResolution();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      if (Array.isArray(result)) {
        expect(result[0]).toBe(1920);
        expect(result[1]).toBe(1080);
      }
    });

    it('should handle different screen resolutions correctly', () => {
      // Test different resolutions
      const testCases = [
        [1366, 768],
        [1280, 720], 
        [1920, 1200],
        [2560, 1440],
        [3840, 2160]
      ];

      testCases.forEach(([width, height]) => {
        // Arrange
        mockScreen.width = width;
        mockScreen.height = height;

        // Act
        const result = collectScreenResolution();

        // Assert
        expect(result).toEqual([width, height]);
      });
    });

    it('should handle zero screen dimensions', () => {
      // Arrange
      mockScreen.width = 0;
      mockScreen.height = 0;

      // Act
      const result = collectScreenResolution();

      // Assert - zero dimensions are detected as suspicious (too small)
      expect(result).toBe(FingerprintSpecialValue.ANTI_FINGERPRINTED);
    });

    it('should handle very large screen dimensions', () => {
      // Arrange
      mockScreen.width = 7680; // 8K width
      mockScreen.height = 4320; // 8K height

      // Act
      const result = collectScreenResolution();

      // Assert
      expect(result).toEqual([7680, 4320]);
    });

    it('should handle negative screen dimensions', () => {
      // Arrange
      mockScreen.width = -100;
      mockScreen.height = -200;

      // Act
      const result = collectScreenResolution();

      // Assert - negative dimensions are detected as suspicious (too small)
      expect(result).toBe(FingerprintSpecialValue.ANTI_FINGERPRINTED);
    });

    it('should handle non-integer screen dimensions', () => {
      // Arrange
      mockScreen.width = 1920.5;
      mockScreen.height = 1080.7;

      // Act
      const result = collectScreenResolution();

      // Assert - toInt() converts non-integers to integers
      expect(result).toEqual([1920, 1080]);
    });

    it('should handle undefined screen object', () => {
      // Arrange
      Object.defineProperty(global, 'screen', {
        value: undefined,
        writable: true,
        configurable: true
      });

      // Act
      const result = collectScreenResolution();
      
      // Assert - Function doesn't throw, returns ERROR special value due to try-catch
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle screen object without width/height properties', () => {
      // Arrange
      Object.defineProperty(global, 'screen', {
        value: {},
        writable: true,
        configurable: true
      });

      // Act
      const result = collectScreenResolution();

      // Assert - toInt(undefined) => NaN => replaceNaN => UNDEFINED (-1), then flagged as suspicious
      expect(result).toBe(FingerprintSpecialValue.ANTI_FINGERPRINTED);
    });

    it('should handle screen object with null width/height', () => {
      // Arrange
      Object.defineProperty(global, 'screen', {
        value: { width: null, height: null },
        writable: true,
        configurable: true
      });

      // Act
      const result = collectScreenResolution();

      // Assert - toInt(null) => NaN => replaceNaN => UNDEFINED (-1), then flagged as suspicious
      expect(result).toBe(FingerprintSpecialValue.ANTI_FINGERPRINTED);
    });

    it('should return consistent results across multiple calls', () => {
      // Arrange
      mockScreen.width = 1440;
      mockScreen.height = 900;

      // Act
      const result1 = collectScreenResolution();
      const result2 = collectScreenResolution();

      // Assert
      expect(result1).toEqual(result2);
      expect(result1).toEqual([1440, 900]);
    });

    it('should handle screen object with string dimensions', () => {
      // Arrange
      Object.defineProperty(global, 'screen', {
        value: { width: '1920', height: '1080' },
        writable: true,
        configurable: true
      });

      // Act
      const result = collectScreenResolution();

      // Assert - toInt() parses strings to integers
      expect(result).toEqual([1920, 1080]);
    });

    it('should handle mobile screen resolutions', () => {
      // Test common mobile resolutions - normalized to [max, min] format
      const mobileResolutions = [
        { input: [360, 640], expected: [640, 360] },   // Small mobile
        { input: [414, 896], expected: [896, 414] },   // iPhone XR
        { input: [375, 667], expected: [667, 375] },   // iPhone SE
        { input: [360, 780], expected: [780, 360] },   // Android
        { input: [768, 1024], expected: [1024, 768] }  // Tablet
      ];

      mobileResolutions.forEach(({ input: [width, height], expected }) => {
        // Arrange
        mockScreen.width = width;
        mockScreen.height = height;

        // Act
        const result = collectScreenResolution();

        // Assert - resolutions are normalized to [max, min] format
        expect(result).toEqual(expected);
      });
    });

    it('should handle ultra-wide screen resolutions', () => {
      // Arrange
      mockScreen.width = 3440; // Ultra-wide
      mockScreen.height = 1440;

      // Act
      const result = collectScreenResolution();

      // Assert
      expect(result).toEqual([3440, 1440]);
    });

    it('should work in different orientations', () => {
      // Test portrait orientation - normalized to [max, min] = [1920, 1080]
      mockScreen.width = 1080;
      mockScreen.height = 1920;
      
      let result = collectScreenResolution();
      expect(result).toEqual([1920, 1080]); // Normalized to [max, min]

      // Test landscape orientation - already in [max, min] format
      mockScreen.width = 1920;
      mockScreen.height = 1080;
      
      result = collectScreenResolution();
      expect(result).toEqual([1920, 1080]); // Same result - orientation independent
    });

    it('should handle fractional pixel ratios correctly', () => {
      // Arrange - Simulate screen with fractional dimensions
      mockScreen.width = 1366.5;
      mockScreen.height = 768.25;

      // Act
      const result = collectScreenResolution();

      // Assert - toInt() converts fractional values to integers
      expect(result).toEqual([1366, 768]);
      if (Array.isArray(result)) {
        expect(typeof result[0]).toBe('number');
        expect(typeof result[1]).toBe('number');
      }
    });
  });
});
