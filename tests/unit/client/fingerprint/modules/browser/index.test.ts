import { BrowserFingerprint } from '../../../../../../src/client/fingerprint/modules/browser';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock all browser modules
jest.mock('../../../../../../src/client/fingerprint/modules/browser/browserName');
jest.mock('../../../../../../src/client/fingerprint/modules/browser/osName');
jest.mock('../../../../../../src/client/fingerprint/modules/browser/userAgent');
jest.mock('../../../../../../src/client/fingerprint/modules/browser/vendor');
jest.mock('../../../../../../src/client/fingerprint/modules/browser/vendorFlavors');
jest.mock('../../../../../../src/client/fingerprint/modules/browser/plugins');
jest.mock('../../../../../../src/client/fingerprint/modules/browser/pdfViewerEnabled');

const mockCollectBrowserName = jest.mocked(require('../../../../../../src/client/fingerprint/modules/browser/browserName').collectBrowserName);
const mockCollectOSName = jest.mocked(require('../../../../../../src/client/fingerprint/modules/browser/osName').collectOSName);
const mockCollectUserAgent = jest.mocked(require('../../../../../../src/client/fingerprint/modules/browser/userAgent').collectUserAgent);
const mockCollectVendor = jest.mocked(require('../../../../../../src/client/fingerprint/modules/browser/vendor').collectVendor);
const mockCollectVendorFlavors = jest.mocked(require('../../../../../../src/client/fingerprint/modules/browser/vendorFlavors').collectVendorFlavors);
const mockCollectPlugins = jest.mocked(require('../../../../../../src/client/fingerprint/modules/browser/plugins').collectPlugins);
const mockCollectPdfViewerEnabled = jest.mocked(require('../../../../../../src/client/fingerprint/modules/browser/pdfViewerEnabled').collectPdfViewerEnabled);

describe('Browser Fingerprint Module', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('BrowserFingerprint.collect', () => {
    it('should collect complete browser information successfully', async () => {
      // Arrange
      const mockBrowserNameResult = 'Chrome';
      const mockOSNameResult = 'Windows';
      const mockUserAgentResult = 'Chrome/120.0.0.0|Windows|0';
      const mockVendorResult = 'Google Inc.';
      const mockVendorFlavorsResult = ['chrome', 'webkit'];
      const mockPluginsResult = ['Chrome PDF Plugin', 'Widevine Content Decryption Module'];
      const mockPdfViewerResult = 1;

      mockCollectBrowserName.mockReturnValue(mockBrowserNameResult);
      mockCollectOSName.mockReturnValue(mockOSNameResult);
      mockCollectUserAgent.mockReturnValue(mockUserAgentResult);
      mockCollectVendor.mockReturnValue(mockVendorResult);
      mockCollectVendorFlavors.mockReturnValue(mockVendorFlavorsResult);
      mockCollectPlugins.mockReturnValue(mockPluginsResult);
      mockCollectPdfViewerEnabled.mockReturnValue(mockPdfViewerResult);

      const expectedResult = {
        browserName: 'Chrome',
        osName: 'Windows',
        userAgent: 'Chrome/120.0.0.0|Windows|0',
        vendor: 'Google Inc.',
        vendorFlavors: ['chrome', 'webkit'],
        plugins: ['Chrome PDF Plugin', 'Widevine Content Decryption Module'],
        pdfViewerEnabled: 1,
      };

      // Act
      const result = await BrowserFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCollectBrowserName).toHaveBeenCalledTimes(1);
      expect(mockCollectOSName).toHaveBeenCalledTimes(1);
      expect(mockCollectUserAgent).toHaveBeenCalledTimes(1);
      expect(mockCollectVendor).toHaveBeenCalledTimes(1);
      expect(mockCollectVendorFlavors).toHaveBeenCalledTimes(1);
      expect(mockCollectPlugins).toHaveBeenCalledTimes(1);
      expect(mockCollectPdfViewerEnabled).toHaveBeenCalledTimes(1);
    });

    it('should handle mixed valid and special values from collectors', async () => {
      // Arrange
      mockCollectBrowserName.mockReturnValue('Firefox');
      mockCollectOSName.mockReturnValue('macOS');
      mockCollectUserAgent.mockReturnValue(FingerprintSpecialValue.UNDEFINED);
      mockCollectVendor.mockReturnValue('Mozilla Foundation');
      mockCollectVendorFlavors.mockReturnValue([]);
      mockCollectPlugins.mockReturnValue(FingerprintSpecialValue.UNDEFINED);
      mockCollectPdfViewerEnabled.mockReturnValue(0);

      const expectedResult = {
        browserName: 'Firefox',
        osName: 'macOS',
        userAgent: FingerprintSpecialValue.UNDEFINED,
        vendor: 'Mozilla Foundation',
        vendorFlavors: [],
        plugins: FingerprintSpecialValue.UNDEFINED,
        pdfViewerEnabled: 0,
      };

      // Act
      const result = await BrowserFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle all special values from collectors', async () => {
      // Arrange
      mockCollectBrowserName.mockReturnValue(FingerprintSpecialValue.UNDEFINED);
      mockCollectOSName.mockReturnValue(FingerprintSpecialValue.ERROR);
      mockCollectUserAgent.mockReturnValue(FingerprintSpecialValue.UNDEFINED);
      mockCollectVendor.mockReturnValue(FingerprintSpecialValue.UNDEFINED);
      mockCollectVendorFlavors.mockReturnValue(FingerprintSpecialValue.ERROR);
      mockCollectPlugins.mockReturnValue(FingerprintSpecialValue.ERROR);
      mockCollectPdfViewerEnabled.mockReturnValue(FingerprintSpecialValue.UNDEFINED);

      const expectedResult = {
        browserName: FingerprintSpecialValue.UNDEFINED,
        osName: FingerprintSpecialValue.ERROR,
        userAgent: FingerprintSpecialValue.UNDEFINED,
        vendor: FingerprintSpecialValue.UNDEFINED,
        vendorFlavors: FingerprintSpecialValue.ERROR,
        plugins: FingerprintSpecialValue.ERROR,
        pdfViewerEnabled: FingerprintSpecialValue.UNDEFINED,
      };

      // Act
      const result = await BrowserFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from individual collectors gracefully', async () => {
      // Arrange
      mockCollectBrowserName.mockReturnValue('Safari');
      mockCollectOSName.mockImplementation(() => {
        throw new Error('OS Name collection failed');
      });
      mockCollectUserAgent.mockReturnValue('Safari/605.1.15|macOS|0');
      mockCollectVendor.mockReturnValue('Apple Computer, Inc.');
      mockCollectVendorFlavors.mockReturnValue(['safari', 'webkit']);
      mockCollectPlugins.mockReturnValue([]);
      mockCollectPdfViewerEnabled.mockReturnValue(1);

      // Act & Assert
      await expect(BrowserFingerprint.collect()).rejects.toThrow('OS Name collection failed');
    });

    it('should maintain proper data types for all collectors', async () => {
      // Arrange
      mockCollectBrowserName.mockReturnValue('Edge');
      mockCollectOSName.mockReturnValue('Windows');
      mockCollectUserAgent.mockReturnValue('Edge/120.0.0.0|Windows|0');
      mockCollectVendor.mockReturnValue('Microsoft Corporation');
      mockCollectVendorFlavors.mockReturnValue(['chrome', 'webkit']);
      mockCollectPlugins.mockReturnValue(['PDF Viewer']);
      mockCollectPdfViewerEnabled.mockReturnValue(1);

      // Act
      const result = await BrowserFingerprint.collect();

      // Assert
      expect(typeof result.browserName).toBe('string');
      expect(typeof result.osName).toBe('string');
      expect(typeof result.userAgent).toBe('string');
      expect(typeof result.vendor).toBe('string');
      expect(Array.isArray(result.vendorFlavors)).toBe(true);
      expect(Array.isArray(result.plugins)).toBe(true);
      expect(typeof result.pdfViewerEnabled).toBe('number');
    });

    it('should handle different browser scenarios correctly', async () => {
      // Test different browser scenarios
      const browserTestCases = [
        {
          name: 'Chrome on Windows',
          browserName: 'Chrome',
          osName: 'Windows',
          vendor: 'Google Inc.',
          vendorFlavors: ['chrome', 'webkit'],
          expectedPdf: 1
        },
        {
          name: 'Firefox on macOS',
          browserName: 'Firefox',
          osName: 'macOS',
          vendor: 'Mozilla Foundation',
          vendorFlavors: [],
          expectedPdf: 1
        },
        {
          name: 'Safari on iOS',
          browserName: 'Safari',
          osName: 'iOS',
          vendor: 'Apple Computer, Inc.',
          vendorFlavors: ['webkit', 'safari'],
          expectedPdf: 0
        },
        {
          name: 'Mobile Chrome on Android',
          browserName: 'Mobile Chrome',
          osName: 'Android',
          vendor: 'Google Inc.',
          vendorFlavors: ['chrome', 'webkit'],
          expectedPdf: 1
        },
      ];

      for (const testCase of browserTestCases) {
        // Arrange
        mockCollectBrowserName.mockReturnValue(testCase.browserName);
        mockCollectOSName.mockReturnValue(testCase.osName);
        mockCollectUserAgent.mockReturnValue(`${testCase.browserName}/120.0.0.0|${testCase.osName}|0`);
        mockCollectVendor.mockReturnValue(testCase.vendor);
        mockCollectVendorFlavors.mockReturnValue(testCase.vendorFlavors);
        mockCollectPlugins.mockReturnValue(['Plugin 1', 'Plugin 2']);
        mockCollectPdfViewerEnabled.mockReturnValue(testCase.expectedPdf);

        // Act
        const result = await BrowserFingerprint.collect();

        // Assert
        expect(result.browserName).toBe(testCase.browserName);
        expect(result.osName).toBe(testCase.osName);
        expect(result.vendor).toBe(testCase.vendor);
        expect(result.vendorFlavors).toEqual(testCase.vendorFlavors);
        expect(result.pdfViewerEnabled).toBe(testCase.expectedPdf);
      }
    });

    it('should handle empty and null values properly', async () => {
      // Arrange
      mockCollectBrowserName.mockReturnValue('');
      mockCollectOSName.mockReturnValue('');
      mockCollectUserAgent.mockReturnValue('');
      mockCollectVendor.mockReturnValue('');
      mockCollectVendorFlavors.mockReturnValue([]);
      mockCollectPlugins.mockReturnValue([]);
      mockCollectPdfViewerEnabled.mockReturnValue(0);

      // Act
      const result = await BrowserFingerprint.collect();

      // Assert
      expect(result.browserName).toBe('');
      expect(result.osName).toBe('');
      expect(result.userAgent).toBe('');
      expect(result.vendor).toBe('');
      expect(result.vendorFlavors).toEqual([]);
      expect(result.plugins).toEqual([]);
      expect(result.pdfViewerEnabled).toBe(0);
    });

    it('should return the exact structure from individual collectors', async () => {
      // Arrange
      const mockResults = {
        browserName: 'Brave',
        osName: 'Linux',
        userAgent: 'Brave/1.60.0|Linux|0',
        vendor: 'Brave Software Inc.',
        vendorFlavors: ['chrome', 'webkit'],
        plugins: ['Brave Ad Blocker', 'Brave Shields'],
        pdfViewerEnabled: 1,
      };

      mockCollectBrowserName.mockReturnValue(mockResults.browserName);
      mockCollectOSName.mockReturnValue(mockResults.osName);
      mockCollectUserAgent.mockReturnValue(mockResults.userAgent);
      mockCollectVendor.mockReturnValue(mockResults.vendor);
      mockCollectVendorFlavors.mockReturnValue(mockResults.vendorFlavors);
      mockCollectPlugins.mockReturnValue(mockResults.plugins);
      mockCollectPdfViewerEnabled.mockReturnValue(mockResults.pdfViewerEnabled);

      // Act
      const result = await BrowserFingerprint.collect();

      // Assert
      expect(result.browserName).toBe(mockResults.browserName);
      expect(result.osName).toBe(mockResults.osName);
      expect(result.userAgent).toBe(mockResults.userAgent);
      expect(result.vendor).toBe(mockResults.vendor);
      expect(result.vendorFlavors).toBe(mockResults.vendorFlavors);
      expect(result.plugins).toBe(mockResults.plugins);
      expect(result.pdfViewerEnabled).toBe(mockResults.pdfViewerEnabled);
    });

    it('should handle special fingerprint values correctly', async () => {
      // Arrange
      const specialValues = [
        FingerprintSpecialValue.UNDEFINED,
        FingerprintSpecialValue.ERROR,
      ];

      for (const specialValue of specialValues) {
        mockCollectBrowserName.mockReturnValue(specialValue);
        mockCollectOSName.mockReturnValue(specialValue);
        mockCollectUserAgent.mockReturnValue(specialValue);
        mockCollectVendor.mockReturnValue(specialValue);
        mockCollectVendorFlavors.mockReturnValue(specialValue);
        mockCollectPlugins.mockReturnValue(specialValue);
        mockCollectPdfViewerEnabled.mockReturnValue(specialValue);

        // Act
        const result = await BrowserFingerprint.collect();

        // Assert
        expect(result.browserName).toBe(specialValue);
        expect(result.osName).toBe(specialValue);
        expect(result.userAgent).toBe(specialValue);
        expect(result.vendor).toBe(specialValue);
        expect(result.vendorFlavors).toBe(specialValue);
        expect(result.plugins).toBe(specialValue);
        expect(result.pdfViewerEnabled).toBe(specialValue);
      }
    });

    it('should handle concurrent calls consistently', async () => {
      // Arrange
      mockCollectBrowserName.mockReturnValue('Opera');
      mockCollectOSName.mockReturnValue('Windows');
      mockCollectUserAgent.mockReturnValue('Opera/120.0.0.0|Windows|0');
      mockCollectVendor.mockReturnValue('Opera Software ASA');
      mockCollectVendorFlavors.mockReturnValue(['opr', 'webkit']);
      mockCollectPlugins.mockReturnValue(['Opera Plugin']);
      mockCollectPdfViewerEnabled.mockReturnValue(1);

      // Act - Make multiple concurrent calls
      const promises = Array.from({ length: 5 }, () => BrowserFingerprint.collect());
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toEqual({
          browserName: 'Opera',
          osName: 'Windows',
          userAgent: 'Opera/120.0.0.0|Windows|0',
          vendor: 'Opera Software ASA',
          vendorFlavors: ['opr', 'webkit'],
          plugins: ['Opera Plugin'],
          pdfViewerEnabled: 1,
        });
      });

      // Each collector should be called once per BrowserFingerprint.collect() call
      expect(mockCollectBrowserName).toHaveBeenCalledTimes(5);
      expect(mockCollectOSName).toHaveBeenCalledTimes(5);
      expect(mockCollectUserAgent).toHaveBeenCalledTimes(5);
      expect(mockCollectVendor).toHaveBeenCalledTimes(5);
      expect(mockCollectVendorFlavors).toHaveBeenCalledTimes(5);
      expect(mockCollectPlugins).toHaveBeenCalledTimes(5);
      expect(mockCollectPdfViewerEnabled).toHaveBeenCalledTimes(5);
    });

    it('should handle different plugin scenarios', async () => {
      // Test different plugin scenarios
      const pluginTestCases = [
        [], // No plugins
        ['Single Plugin'], // Single plugin
        ['Plugin 1', 'Plugin 2', 'Plugin 3'], // Multiple plugins
        ['Chrome PDF Plugin', 'Widevine Content Decryption Module', 'Flash Player'], // Common plugins
      ];

      for (const plugins of pluginTestCases) {
        // Arrange
        mockCollectBrowserName.mockReturnValue('Chrome');
        mockCollectOSName.mockReturnValue('Windows');
        mockCollectUserAgent.mockReturnValue('Chrome/120.0.0.0|Windows|0');
        mockCollectVendor.mockReturnValue('Google Inc.');
        mockCollectVendorFlavors.mockReturnValue(['chrome', 'webkit']);
        mockCollectPlugins.mockReturnValue(plugins);
        mockCollectPdfViewerEnabled.mockReturnValue(1);

        // Act
        const result = await BrowserFingerprint.collect();

        // Assert
        expect(result.plugins).toEqual(plugins);
        expect(Array.isArray(result.plugins)).toBe(true);
        if (Array.isArray(result.plugins)) {
          expect(result.plugins).toHaveLength(plugins.length);
        }
      }
    });

    it('should handle vendor flavors variations correctly', async () => {
      // Test different vendor flavors scenarios
      const vendorFlavorsTestCases = [
        [], // No vendor flavors
        ['chrome'], // Single flavor
        ['chrome', 'webkit'], // Multiple flavors
        ['safari', 'webkit', '__crWeb'], // iOS Safari flavors
        ['yandex', '__yb', '__ybro'], // Yandex browser flavors
      ];

      for (const vendorFlavors of vendorFlavorsTestCases) {
        // Arrange
        mockCollectBrowserName.mockReturnValue('Test Browser');
        mockCollectOSName.mockReturnValue('Test OS');
        mockCollectUserAgent.mockReturnValue('Test/1.0|TestOS|0');
        mockCollectVendor.mockReturnValue('Test Vendor');
        mockCollectVendorFlavors.mockReturnValue(vendorFlavors);
        mockCollectPlugins.mockReturnValue([]);
        mockCollectPdfViewerEnabled.mockReturnValue(0);

        // Act
        const result = await BrowserFingerprint.collect();

        // Assert
        expect(result.vendorFlavors).toEqual(vendorFlavors);
        expect(Array.isArray(result.vendorFlavors)).toBe(true);
        if (Array.isArray(result.vendorFlavors)) {
          expect(result.vendorFlavors).toHaveLength(vendorFlavors.length);
        }
      }
    });

    it('should handle PDF viewer enabled/disabled scenarios', async () => {
      // Test different PDF viewer scenarios
      const pdfTestCases = [
        { enabled: 1, description: 'PDF viewer enabled' },
        { enabled: 0, description: 'PDF viewer disabled' },
        { enabled: FingerprintSpecialValue.UNDEFINED, description: 'PDF viewer undefined' },
        { enabled: FingerprintSpecialValue.ERROR, description: 'PDF viewer error' },
      ];

      for (const testCase of pdfTestCases) {
        // Arrange
        mockCollectBrowserName.mockReturnValue('Test Browser');
        mockCollectOSName.mockReturnValue('Test OS');
        mockCollectUserAgent.mockReturnValue('Test/1.0|TestOS|0');
        mockCollectVendor.mockReturnValue('Test Vendor');
        mockCollectVendorFlavors.mockReturnValue([]);
        mockCollectPlugins.mockReturnValue([]);
        mockCollectPdfViewerEnabled.mockReturnValue(testCase.enabled);

        // Act
        const result = await BrowserFingerprint.collect();

        // Assert
        expect(result.pdfViewerEnabled).toBe(testCase.enabled);
      }
    });
  });
});
