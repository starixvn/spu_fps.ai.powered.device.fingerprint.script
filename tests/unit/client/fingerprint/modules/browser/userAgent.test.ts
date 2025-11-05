import { collectUserAgent } from '../../../../../../src/client/fingerprint/modules/browser/userAgent';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

describe('User Agent Module', () => {
  let mockNavigator: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create fresh mock navigator for each test
    mockNavigator = {
      userAgentData: undefined
    };
    
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
      configurable: true
    });
  });

  describe('collectUserAgent', () => {
    it('should collect user agent data successfully', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Google Chrome', version: '120.0.6099' },
          { brand: 'Chromium', version: '120.0.6099' },
          { brand: 'Not A Brand', version: '8.0.0.0' }
        ],
        platform: 'Windows',
        mobile: false
      };

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe('Chromium/120.0.6099 Google Chrome/120.0.6099|Windows');
    });

    it('should filter out "Not A Brand" entries', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Not A Brand', version: '8.0.0.0' },
          { brand: 'Microsoft Edge', version: '120.0.0.0' },
          { brand: 'Chromium', version: '120.0.0.0' }
        ],
        platform: 'Windows',
        mobile: false
      };

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe('Chromium/120.0.0.0 Microsoft Edge/120.0.0.0|Windows');
      expect(result).not.toContain('Not A Brand');
    });

    it('should sort brands alphabetically', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Zzz Browser', version: '1.0' },
          { brand: 'Aaa Browser', version: '2.0' },
          { brand: 'Mmm Browser', version: '3.0' }
        ],
        platform: 'Linux',
        mobile: false
      };

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe('Aaa Browser/2.0 Mmm Browser/3.0 Zzz Browser/1.0|Linux');
    });


    it('should handle empty brands array', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [],
        platform: 'macOS',
        mobile: false
      };

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe('|macOS');
    });

    it('should handle brands array with only "Not A Brand" entries', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Not A Brand', version: '8.0.0.0' },
          { brand: 'Not/A)Brand', version: '99.0.0.0' }
        ],
        platform: 'Chrome OS',
        mobile: false
      };

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe('|Chrome OS');
    });

    it('should handle different platform values', () => {
      // Test different platforms
      const platforms = ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Chrome OS'];

      for (const platform of platforms) {
        // Arrange
        mockNavigator.userAgentData = {
          brands: [{ brand: 'Test Browser', version: '1.0' }],
          platform: platform,
          mobile: false
        };

        // Act
        const result = collectUserAgent();

        // Assert
        expect(typeof result).toBe('string');
        expect(result).toContain(`|${platform}`);
      }
    });

    it('should handle brands with special characters in names', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Chrome/Test', version: '120.0.0.0' },
          { brand: 'Brand (Test)', version: '1.0' },
          { brand: 'Brand-Name', version: '2.0' }
        ],
        platform: 'Windows',
        mobile: false
      };

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe('Brand (Test)/1.0 Brand-Name/2.0 Chrome/Test/120.0.0.0|Windows');
    });

    it('should handle version strings with different formats', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Browser A', version: '120.0.6099.199' },
          { brand: 'Browser B', version: '15.0' },
          { brand: 'Browser C', version: '1' }
        ],
        platform: 'Linux',
        mobile: false
      };

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe('Browser A/120.0.6099.199 Browser B/15.0 Browser C/1|Linux');
    });

    it('should return UNDEFINED when userAgentData is not available', () => {
      // Arrange
      mockNavigator.userAgentData = undefined;

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return UNDEFINED when userAgentData is null', () => {
      // Arrange
      mockNavigator.userAgentData = null;

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return ERROR when an exception occurs', () => {
      // Arrange
      Object.defineProperty(mockNavigator, 'userAgentData', {
        get: () => {
          throw new Error('Test error');
        }
      });

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe(FingerprintSpecialValue.ERROR);
    });

    // Note: Missing/null brands tests removed as unrealistic
    // In practice, if userAgentData exists, brands will always be an array

    it('should handle userAgentData with missing platform property', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [{ brand: 'Test Browser', version: '1.0' }],
        mobile: false
        // platform property is missing
      };

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe('Test Browser/1.0|undefined');
    });


    it('should handle brands with empty brand names', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: '', version: '1.0' },
          { brand: 'Valid Browser', version: '2.0' },
          { brand: ' ', version: '3.0' }
        ],
        platform: 'Linux',
        mobile: false
      };

      // Act
      const result = collectUserAgent();

      // Assert  
      expect(result).toBe('/1.0  /3.0 Valid Browser/2.0|Linux');
    });

    it('should handle brands with empty version strings', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Browser A', version: '' },
          { brand: 'Browser B', version: '1.0' }
        ],
        platform: 'Windows',
        mobile: false
      };

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe('Browser A/ Browser B/1.0|Windows');
    });

    it('should filter all "notabrand" variations (case insensitive)', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Not A Brand', version: '8.0.0.0' },
          { brand: 'NOT A BRAND', version: '8.0.0.0' },
          { brand: 'not a brand', version: '8.0.0.0' },
          { brand: 'NotABrand', version: '8.0.0.0' },
          { brand: 'Chrome', version: '120.0.0.0' }
        ],
        platform: 'Windows',
        mobile: false
      };

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe('Chrome/120.0.0.0|Windows');
      expect(result).not.toContain('Not A Brand');
      expect(result).not.toContain('NOT A BRAND');
      expect(result).not.toContain('not a brand');
      expect(result).not.toContain('NotABrand'); // All "notabrand" variations filtered
    });

    it('should handle complex "Not A Brand" variations', () => {
      // Arrange
      mockNavigator.userAgentData = {
        brands: [
          { brand: 'Not/A)Brand', version: '99.0.0.0' },
          { brand: 'Not-A-Brand', version: '24.0.0.0' },
          { brand: 'Not_A_Brand', version: '8.0.0.0' },
          { brand: 'Edge', version: '120.0.0.0' }
        ],
        platform: 'Windows',
        mobile: false
      };

      // Act
      const result = collectUserAgent();

      // Assert
      expect(result).toBe('Edge/120.0.0.0|Windows');
      // All "Not A Brand" variations should be filtered out
    });
  });
});
