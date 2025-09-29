import { collectOSName } from '../../../../../../src/client/fingerprint/modules/browser/osName';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock browser utils
jest.mock('../../../../../../src/client/fingerprint/utils/browser');
const mockIsAndroid = jest.mocked(require('../../../../../../src/client/fingerprint/utils/browser').isAndroid);
const mockIsDesktopWebKit = jest.mocked(require('../../../../../../src/client/fingerprint/utils/browser').isDesktopWebKit);

// Mock DOM and navigator
const mockNavigator = {
  platform: '',
  userAgent: '',
  userAgentData: undefined as any,
  msMaxTouchPoints: undefined as any,
  msSaveBlob: undefined as any,
  keyboard: undefined as any,
  standalone: undefined as any,
  maxTouchPoints: 0,
};

const mockWindow = {
  MSInputMethodContext: undefined as any,
  DeviceMotionEvent: undefined as any,
  safari: undefined as any,
  orientation: undefined as any,
  ontouchstart: undefined as any,
  screen: {
    width: 1920,
    height: 1080,
  },
  devicePixelRatio: 1,
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

describe('OS Name Module', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset mock values by deleting properties to ensure they're truly undefined
    Object.keys(mockNavigator).forEach(key => {
      if (key !== 'maxTouchPoints') {
        try {
          delete (mockNavigator as any)[key];
        } catch {
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
        }
      }
    });
    Object.keys(mockWindow).forEach(key => {
      if (key !== 'screen' && key !== 'devicePixelRatio') {
        try {
          delete (mockWindow as any)[key];
        } catch {
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
        }
      }
    });
    
    // Set default values
    Object.defineProperty(mockNavigator, 'platform', {
      value: '',
      writable: true,
      configurable: true
    });
    Object.defineProperty(mockNavigator, 'userAgent', {
      value: '',
      writable: true,
      configurable: true
    });
    mockNavigator.maxTouchPoints = 0;
    mockWindow.screen = { width: 1920, height: 1080 };
    mockWindow.devicePixelRatio = 1;
    
    mockIsAndroid.mockReturnValue(false);
    mockIsDesktopWebKit.mockReturnValue(false);
  });

  describe('collectOSName', () => {
    it('should detect Android using isAndroid utility', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(true);

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Android');
      expect(mockIsAndroid).toHaveBeenCalledTimes(1);
    });

    it('should detect Windows from platform', () => {
      // Arrange
      mockNavigator.platform = 'Win32';

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Windows');
    });

    it('should detect macOS from platform', () => {
      // Arrange
      mockNavigator.platform = 'MacIntel';

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('macOS');
    });

    it('should detect iOS from platform - iPhone', () => {
      // Arrange
      mockNavigator.platform = 'iPhone';

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('iOS');
    });

    it('should detect iOS from platform - iPad', () => {
      // Arrange
      mockNavigator.platform = 'iPad';

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('iOS');
    });

    it('should detect iOS from platform - iPod', () => {
      // Arrange
      mockNavigator.platform = 'iPod';

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('iOS');
    });

    it('should detect Linux from platform', () => {
      // Arrange
      mockNavigator.platform = 'Linux x86_64';

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Linux');
    });

    it('should detect Windows using MS features', () => {
      // Arrange
      mockNavigator.msMaxTouchPoints = 0;

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Windows');
    });

    it('should detect Windows using msSaveBlob', () => {
      // Arrange
      mockNavigator.msSaveBlob = {};

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Windows');
    });

    it('should detect Windows using MSInputMethodContext', () => {
      // Arrange
      mockWindow.MSInputMethodContext = {};

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Windows');
    });

    it('should detect iOS using DeviceMotionEvent.requestPermission', () => {
      // Arrange
      mockWindow.DeviceMotionEvent = {
        requestPermission: jest.fn()
      };

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('iOS');
    });

    it('should detect macOS using Safari pushNotification', () => {
      // Arrange
      mockWindow.safari = {
        pushNotification: {}
      };

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('macOS');
    });

    it('should detect Android using touch and orientation features', () => {
      // Arrange
      mockWindow.orientation = 0;
      mockWindow.ontouchstart = {};
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 10; Mobile)';

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Android');
    });

    it('should detect iOS using iPhone screen resolution', () => {
      // Arrange
      mockWindow.screen = { width: 375, height: 667 };
      mockWindow.devicePixelRatio = 1; // Set to 1 so width*ratio matches iosResolutions exactly

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('iOS');
    });

    it('should detect iOS using iPad screen resolution', () => {
      // Arrange
      mockWindow.screen = { width: 768, height: 1024 };
      mockWindow.devicePixelRatio = 1; // Set to 1 so width*ratio matches iosResolutions exactly

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('iOS');
    });

    it('should detect iOS using touch input with standalone', () => {
      // Arrange
      mockWindow.ontouchstart = {};
      mockNavigator.maxTouchPoints = 5;
      mockWindow.orientation = 0;
      mockNavigator.standalone = 1;

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('iOS');
    });

    it('should detect Android using touch input without standalone', () => {
      // Arrange
      mockWindow.ontouchstart = {};
      mockNavigator.maxTouchPoints = 5;
      mockWindow.orientation = 0;
      mockNavigator.standalone = undefined;

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Android');
    });

    it('should detect Windows using touch with Windows user agent', () => {
      // Arrange
      mockWindow.ontouchstart = {};
      mockNavigator.maxTouchPoints = 10;
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Touch)';

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Windows');
    });

    it('should detect Windows from userAgentData platform', () => {
      // Arrange
      mockNavigator.userAgentData = {
        platform: 'Windows'
      };

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Windows');
    });

    it('should detect macOS from userAgentData platform', () => {
      // Arrange
      mockNavigator.userAgentData = {
        platform: 'macOS'
      };

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('macOS');
    });

    it('should detect iOS from userAgentData platform', () => {
      // Arrange
      mockNavigator.userAgentData = {
        platform: 'iOS'
      };

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('iOS');
    });

    it('should detect Android from userAgentData platform', () => {
      // Arrange
      mockNavigator.userAgentData = {
        platform: 'Android'
      };

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Android');
    });

    it('should detect Chrome OS from userAgentData platform', () => {
      // Arrange
      mockNavigator.userAgentData = {
        platform: 'Chrome OS'
      };

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Chrome OS');
    });

    it('should detect Linux from userAgentData platform', () => {
      // Arrange
      mockNavigator.userAgentData = {
        platform: 'Linux'
      };

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Linux');
    });

    it('should handle custom platform from userAgentData', () => {
      // Arrange
      mockNavigator.userAgentData = {
        platform: 'CustomOS'
      };

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('CustomOS');
    });

    it('should return UNDEFINED when no OS is detected', () => {
      // Arrange - No specific OS indicators set

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return ERROR when an exception occurs', () => {
      // Arrange
      // Mock isAndroid to throw an exception
      mockIsAndroid.mockImplementation(() => {
        throw new Error('Test error');
      });

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle case-insensitive platform detection', () => {
      // Arrange
      mockNavigator.platform = 'MACINTEL';

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('macOS');
    });

    it('should handle platform with additional text', () => {
      // Arrange
      mockNavigator.platform = 'Win32 Enterprise';

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Windows');
    });

    it('should handle missing platform property', () => {
      // Arrange
      delete (mockNavigator as any).platform;

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle empty platform string', () => {
      // Arrange
      mockNavigator.platform = '';

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle null platform', () => {
      // Arrange
      mockNavigator.platform = null as any;

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should prioritize Android detection over other methods', () => {
      // Arrange
      mockIsAndroid.mockReturnValue(true);
      mockNavigator.platform = 'Win32'; // Should be overridden

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('Android');
      expect(mockIsAndroid).toHaveBeenCalledTimes(1);
    });

    it('should detect screen resolution variations for iOS', () => {
      // Test various iOS resolutions (using devicePixelRatio = 1 to match iosResolutions exactly)
      const iosResolutions = [
        { width: 320, height: 568 }, // iPhone 5
        { width: 375, height: 667 }, // iPhone 6/7/8
        { width: 375, height: 812 }, // iPhone X
        { width: 414, height: 896 }, // iPhone XR
        { width: 1024, height: 1366 }, // iPad Pro
      ];

      for (const resolution of iosResolutions) {
        // Arrange
        mockWindow.screen = { width: resolution.width, height: resolution.height };
        mockWindow.devicePixelRatio = 1; // Use 1 so screen.width * ratio matches iosResolutions exactly

        // Act
        const result = collectOSName();

        // Assert
        expect(result).toBe('iOS');
      }
    });

    it('should detect rotated iOS screen resolutions', () => {
      // Arrange - Rotated iPhone screen
      mockWindow.screen = { width: 667, height: 375 };
      mockWindow.devicePixelRatio = 1; // Use 1 so screen.width * ratio matches iosResolutions exactly

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe('iOS');
    });

    it('should not detect iOS for non-iOS screen resolutions', () => {
      // Arrange - Standard desktop resolution
      mockWindow.screen = { width: 1920, height: 1080 };
      mockWindow.devicePixelRatio = 1;

      // Act
      const result = collectOSName();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });
  });
});
