import { collectBrowserName } from '../../../../../../src/client/fingerprint/modules/browser/browserName';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

describe('Browser Name Module', () => {
  let mockNavigator: any;
  let mockWindow: any;
  let mockDocument: any;
  let originalNavigator: any;
  let originalWindow: any;
  let originalDocument: any;

  beforeAll(() => {
    // Store originals
    originalNavigator = global.navigator;
    originalWindow = global.window;
    originalDocument = global.document;
  });

  afterAll(() => {
    // Restore originals
    global.navigator = originalNavigator;
    global.window = originalWindow;
    global.document = originalDocument;
  });

  beforeEach(() => {
    // Create fresh mocks for each test
    mockNavigator = {
      userAgent: '',
      userAgentData: undefined,
      maxTouchPoints: 0,
      standalone: undefined,
    };

    mockWindow = {
      chrome: undefined,
      opr: undefined,
      opera: undefined,
      safari: undefined,
      InstallTrigger: undefined,
      StyleMedia: undefined,
      // NOTE: NOT including ontouchstart to ensure 'ontouchstart' in window returns false
      innerWidth: 1920,
      orientation: undefined,
      miui: undefined,
      SamsungBrowser: undefined,
      ucweb: undefined,
      xiaomi: undefined,
      huawei: undefined,
      oppo: undefined,
      vivo: undefined,
      qq: undefined,
      so: undefined,
      sogou: undefined,
      baidu: undefined,
    };

    mockDocument = {
      createElement: jest.fn(() => ({
        style: {}
      }))
    };

    // Set globals
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
      configurable: true
    });

    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
      configurable: true
    });

    Object.defineProperty(global, 'document', {
      value: mockDocument,
      writable: true,
      configurable: true
    });
    
    jest.clearAllMocks();
  });

  describe('collectBrowserName', () => {
    it('should detect Chrome browser correctly', () => {
      // Arrange
      mockWindow.chrome = { runtime: {} };
      mockWindow.opr = undefined;
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Chrome');
    });

    it('should detect Firefox browser correctly', () => {
      // Arrange
      mockWindow.InstallTrigger = {};
      mockDocument.createElement.mockReturnValue({
        style: { MozAppearance: '' }
      });

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Firefox');
    });

    it('should detect Safari browser correctly', () => {
      // Arrange
      mockWindow.safari = {
        pushNotification: {}
      };
      mockDocument.createElement.mockReturnValue({
        style: { WebkitAppearance: '' }
      });

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Safari');
    });

    it('should detect Opera browser correctly', () => {
      // Arrange
      mockWindow.opr = {};
      mockWindow.opera = {};

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Opera');
    });

    it('should detect Brave browser correctly', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Brave', version: '1.60.0' },
          { brand: 'Chromium', version: '120.0.0.0' }
        ]
      };

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Brave');
    });

    it('should detect Edge browser correctly', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Microsoft Edge', version: '120.0.0.0' },
          { brand: 'Chromium', version: '120.0.0.0' }
        ]
      };

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Edge');
    });

    it('should detect Samsung Browser correctly', () => {
      // Arrange
      mockWindow.SamsungBrowser = {};
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Samsung Internet', version: '20.0' },
          { brand: 'Chromium', version: '120.0.0.0' }
        ]
      };

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Samsung Browser');
    });

    it('should detect Mi Browser correctly', () => {
      // Arrange
      mockWindow.miui = {};

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Mi Browser');
    });

    it('should detect UC Browser correctly', () => {
      // Arrange
      mockWindow.ucweb = {};

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('UC Browser');
    });

    it('should detect Chrome on mobile devices correctly', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Google Chrome', version: '120.0.0.0' },
          { brand: 'Chromium', version: '120.0.0.0' }
        ]
      };
      mockWindow.ontouchstart = {};
      mockNavigator.maxTouchPoints = 5;
      mockWindow.innerWidth = 375;
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1';

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Chrome'); // Implementation doesn't distinguish between mobile and desktop Chrome
    });

    it('should detect Chromium correctly', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Chromium', version: '120.0.0.0' }
        ]
      };

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Chromium');
    });

    it('should detect Edge Legacy correctly using StyleMedia', () => {
      // Arrange
      mockWindow.StyleMedia = {};
      mockDocument.createElement.mockReturnValue({
        style: { msScrollLimit: '' }
      });

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Edge (Legacy)');
    });

    it('should return Safari when WebKit detected but not Chrome', () => {
      // Arrange
      mockDocument.createElement.mockReturnValue({
        style: { WebkitAppearance: '' }
      });
      mockWindow.chrome = undefined;

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Safari');
    });

    it('should return UNDEFINED when no browser is detected', () => {
      // Arrange - No specific browser indicators set

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return ERROR when an exception occurs', () => {
      // Arrange - Mock navigator.userAgentData to throw error at a higher level
      Object.defineProperty(mockNavigator, 'userAgentData', {
        get: () => {
          throw new Error('Test error');
        },
        configurable: true
      });

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    it('should handle empty userAgentData brands array', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: []
      };

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle userAgentData with Not A Brand entries', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Not A Brand', version: '8.0.0.0' },
          { brand: 'Chromium', version: '120.0.0.0' },
          { brand: 'Google Chrome', version: '120.0.0.0' }
        ]
      };

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Chrome');
    });

    it('should prioritize mobile detectors over other methods', () => {
      // Arrange
      mockWindow.miui = {}; // Mobile detector
      mockWindow.chrome = {}; // Feature detector
      mockNavigator.userAgentData = {
        brands: [{ brand: 'Google Chrome', version: '120.0.0.0' }]
      };

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Mi Browser'); // Should prioritize mobile detector
    });

    it('should prioritize userAgentData brands over feature detectors', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [{ brand: 'Microsoft Edge', version: '120.0.0.0' }]
      };
      mockWindow.chrome = {}; // Feature detector

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Edge'); // Should prioritize userAgentData
    });

    it('should prioritize feature detectors over CSS detectors', () => {
      // Arrange
      mockWindow.InstallTrigger = {}; // Feature detector
      mockDocument.createElement.mockReturnValue({
        style: { MozAppearance: '' } // CSS detector
      });

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Firefox'); // Should use feature detector result
    });

    it('should handle multiple mobile browser indicators', () => {
      // Arrange
      mockWindow.xiaomi = {};
      mockWindow.huawei = {};
      // Should return the first match

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Xiaomi Browser'); // First in the detector list
    });

    it('should handle case-insensitive brand matching', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'google chrome', version: '120.0.0.0' }, // lowercase
          { brand: 'CHROMIUM', version: '120.0.0.0' } // uppercase
        ]
      };

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Chrome');
    });

    it('should handle navigator without userAgentData', () => {
      // Arrange
      mockNavigator.userAgentData = undefined;
      mockWindow.chrome = {};

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe('Chrome');
    });

    it('should handle document.createElement returning element without style', () => {
      // Arrange
      mockDocument.createElement.mockReturnValue({ style: {} });

      // Act
      const result = collectBrowserName();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });
  });
});
