import { PreferencesFingerprint } from '../../../../../src/client/fingerprint/modules/preferences';

// Mock navigator properties
const mockNavigator = {
  language: 'en-US',
  languages: ['en-US', 'en', 'es'],
  userAgentData: {
    brands: [
      { brand: 'Google Chrome', version: '116' },
      { brand: 'Chromium', version: '116' },
      { brand: 'Not=A?Brand', version: '8' }
    ],
    mobile: false,
    platform: 'Windows'
  }
};

// Mock Date for timezone offset
const mockDate = {
  getTimezoneOffset: jest.fn(() => -240) // UTC-4 (240 minutes behind)
};

// Mock Intl.DateTimeFormat
const mockIntl = {
  DateTimeFormat: jest.fn(() => ({
    resolvedOptions: jest.fn(() => ({
      timeZone: 'America/New_York'
    }))
  }))
};

describe('PreferencesFingerprint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup global navigator mock
    Object.defineProperty(global, 'navigator', {
      value: { ...mockNavigator },
      writable: true,
      configurable: true
    });
    
    // Setup global Date mock
    Object.defineProperty(global, 'Date', {
      value: jest.fn().mockImplementation(() => mockDate),
      writable: true,
      configurable: true
    });
    
    // Setup global Intl mock
    Object.defineProperty(global, 'Intl', {
      value: mockIntl,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // Clean up global mocks
    delete (global as any).navigator;
    delete (global as any).Date;
    delete (global as any).Intl;
  });

  describe('collect', () => {
    it('should return complete preferences fingerprint data structure', () => {
      const result = PreferencesFingerprint.collect();

      expect(result).toHaveProperty('language');
      expect(result).toHaveProperty('languages');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('timezoneOffset');
      expect(result).toHaveProperty('clientHints');
    });

    it('should collect language information', () => {
      const result = PreferencesFingerprint.collect();

      expect(result.language).toBe('en-US');
      expect(result.languages).toEqual(['en-US', 'en', 'es']);
    });

    it('should collect timezone information', () => {
      const result = PreferencesFingerprint.collect();

      expect(result.timezone).toBe('America/New_York');
      expect(result.timezoneOffset).toBe(-240);
    });

    it('should collect client hints when available', () => {
      const result = PreferencesFingerprint.collect();

      expect(result.clientHints).toEqual({
        brands: [
          { brand: 'Google Chrome', version: '116' },
          { brand: 'Chromium', version: '116' },
          { brand: 'Not=A?Brand', version: '8' }
        ],
        mobile: false,
        platform: 'Windows'
      });
    });
  });

  describe('language handling', () => {
    it('should handle single language configuration', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          ...mockNavigator,
          language: 'fr-FR',
          languages: ['fr-FR']
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.language).toBe('fr-FR');
      expect(result.languages).toEqual(['fr-FR']);
    });

    it('should handle multiple languages', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          ...mockNavigator,
          language: 'en-GB',
          languages: ['en-GB', 'en', 'fr', 'de', 'es']
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.language).toBe('en-GB');
      expect(result.languages).toEqual(['en-GB', 'en', 'fr', 'de', 'es']);
    });

    it('should fallback to language when languages array is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          ...mockNavigator,
          language: 'ja-JP',
          languages: undefined
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.language).toBe('ja-JP');
      expect(result.languages).toEqual(['ja-JP']);
    });

    it('should handle empty languages array', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          ...mockNavigator,
          language: 'ko-KR',
          languages: []
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.language).toBe('ko-KR');
      expect(result.languages).toEqual(['ko-KR']);
    });

    it('should handle various language codes', () => {
      const languageCodes = [
        { lang: 'en-US', langs: ['en-US', 'en'] },
        { lang: 'zh-CN', langs: ['zh-CN', 'zh'] },
        { lang: 'pt-BR', langs: ['pt-BR', 'pt', 'en'] },
        { lang: 'ar-SA', langs: ['ar-SA', 'ar', 'en'] },
        { lang: 'hi-IN', langs: ['hi-IN', 'hi', 'en'] }
      ];

      languageCodes.forEach(({ lang, langs }) => {
        Object.defineProperty(global, 'navigator', {
          value: {
            ...mockNavigator,
            language: lang,
            languages: langs
          },
          writable: true,
          configurable: true
        });

        const result = PreferencesFingerprint.collect();
        expect(result.language).toBe(lang);
        expect(result.languages).toEqual(langs);
      });
    });
  });

  describe('timezone handling', () => {
    it('should get timezone from Intl.DateTimeFormat', () => {
      const result = PreferencesFingerprint.collect();

      expect(result.timezone).toBe('America/New_York');
      expect(mockIntl.DateTimeFormat).toHaveBeenCalled();
    });

    it('should handle different timezones', () => {
      const timezones = [
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
        'Australia/Sydney',
        'America/Los_Angeles',
        'Europe/Paris',
        'Asia/Shanghai',
        'America/Sao_Paulo'
      ];

      timezones.forEach(timezone => {
        mockIntl.DateTimeFormat.mockReturnValue({
          resolvedOptions: jest.fn(() => ({ timeZone: timezone }))
        });

        const result = PreferencesFingerprint.collect();
        expect(result.timezone).toBe(timezone);
      });
    });

    it('should return "unknown" when Intl.DateTimeFormat throws error', () => {
      mockIntl.DateTimeFormat.mockImplementation(() => {
        throw new Error('DateTimeFormat error');
      });

      const result = PreferencesFingerprint.collect();

      expect(result.timezone).toBe('unknown');
    });

    it('should return "unknown" when resolvedOptions throws error', () => {
      mockIntl.DateTimeFormat.mockReturnValue({
        resolvedOptions: jest.fn(() => {
          throw new Error('resolvedOptions error');
        })
      });

      const result = PreferencesFingerprint.collect();

      expect(result.timezone).toBe('unknown');
    });

    it('should handle missing Intl object', () => {
      delete (global as any).Intl;

      const result = PreferencesFingerprint.collect();

      expect(result.timezone).toBe('unknown');
    });
  });

  describe('timezone offset handling', () => {
    it('should get timezone offset from Date', () => {
      const result = PreferencesFingerprint.collect();

      expect(result.timezoneOffset).toBe(-240);
      expect(mockDate.getTimezoneOffset).toHaveBeenCalled();
    });

    it('should handle different timezone offsets', () => {
      const offsets = [
        0,    // UTC
        -60,  // UTC+1
        -120, // UTC+2
        -240, // UTC+4
        -300, // UTC+5
        180,  // UTC-3
        300,  // UTC-5
        480,  // UTC-8
        540   // UTC-9
      ];

      offsets.forEach(offset => {
        mockDate.getTimezoneOffset.mockReturnValue(offset);

        const result = PreferencesFingerprint.collect();
        expect(result.timezoneOffset).toBe(offset);
      });
    });

    it('should handle Date constructor with actual implementation', () => {
      // Use real Date constructor for this test
      Object.defineProperty(global, 'Date', {
        value: Date,
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(typeof result.timezoneOffset).toBe('number');
      expect(result.timezoneOffset).toBeGreaterThanOrEqual(-840); // UTC+14
      expect(result.timezoneOffset).toBeLessThanOrEqual(720);     // UTC-12
    });
  });

  describe('client hints handling', () => {
    it('should collect client hints when userAgentData is available', () => {
      const result = PreferencesFingerprint.collect();

      expect(result.clientHints).toEqual({
        brands: [
          { brand: 'Google Chrome', version: '116' },
          { brand: 'Chromium', version: '116' },
          { brand: 'Not=A?Brand', version: '8' }
        ],
        mobile: false,
        platform: 'Windows'
      });
    });

    it('should return null when userAgentData is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          ...mockNavigator,
          userAgentData: undefined
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.clientHints).toBeNull();
    });

    it('should handle mobile client hints', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          ...mockNavigator,
          userAgentData: {
            brands: [
              { brand: 'Google Chrome', version: '116' },
              { brand: 'Chromium', version: '116' }
            ],
            mobile: true,
            platform: 'Android'
          }
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.clientHints).toEqual({
        brands: [
          { brand: 'Google Chrome', version: '116' },
          { brand: 'Chromium', version: '116' }
        ],
        mobile: true,
        platform: 'Android'
      });
    });

    it('should handle different browser brands', () => {
      const browserConfigs = [
        {
          brands: [
            { brand: 'Microsoft Edge', version: '116' },
            { brand: 'Chromium', version: '116' }
          ],
          mobile: false,
          platform: 'Windows'
        },
        {
          brands: [
            { brand: 'Opera', version: '102' },
            { brand: 'Chromium', version: '116' }
          ],
          mobile: false,
          platform: 'macOS'
        },
        {
          brands: [
            { brand: 'Samsung Internet', version: '22' },
            { brand: 'Chromium', version: '116' }
          ],
          mobile: true,
          platform: 'Android'
        }
      ];

      browserConfigs.forEach(config => {
        Object.defineProperty(global, 'navigator', {
          value: {
            ...mockNavigator,
            userAgentData: config
          },
          writable: true,
          configurable: true
        });

        const result = PreferencesFingerprint.collect();
        expect(result.clientHints).toEqual(config);
      });
    });

    it('should handle partial client hints data', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          ...mockNavigator,
          userAgentData: {
            brands: [{ brand: 'Unknown Browser', version: '1' }],
            // mobile and platform missing
          }
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.clientHints).toEqual({
        brands: [{ brand: 'Unknown Browser', version: '1' }]
      });
    });

    it('should handle empty brands array', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          ...mockNavigator,
          userAgentData: {
            brands: [],
            mobile: false,
            platform: 'Linux'
          }
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.clientHints).toEqual({
        brands: [],
        mobile: false,
        platform: 'Linux'
      });
    });

    it('should handle different platforms', () => {
      const platforms = ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'ChromeOS'];

      platforms.forEach(platform => {
        Object.defineProperty(global, 'navigator', {
          value: {
            ...mockNavigator,
            userAgentData: {
              brands: [{ brand: 'Test Browser', version: '1' }],
              mobile: platform === 'Android' || platform === 'iOS',
              platform
            }
          },
          writable: true,
          configurable: true
        });

        const result = PreferencesFingerprint.collect();
        expect(result.clientHints!.platform).toBe(platform);
      });
    });
  });

  describe('edge cases and browser compatibility', () => {
    it('should handle missing navigator object', () => {
      delete (global as any).navigator;

      expect(() => {
        PreferencesFingerprint.collect();
      }).toThrow();
    });

    it('should handle partial navigator properties', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'en-US'
          // languages and userAgentData missing
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.language).toBe('en-US');
      expect(result.languages).toEqual(['en-US']);
      expect(result.clientHints).toBeNull();
    });

    it('should handle null values in navigator', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          language: null,
          languages: null,
          userAgentData: null
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.language).toBeNull();
      expect(result.languages).toEqual([null]);
      expect(result.clientHints).toBeNull();
    });

    it('should handle very long language arrays', () => {
      const longLanguageArray = Array.from({ length: 50 }, (_, i) => `lang-${i}`);
      
      Object.defineProperty(global, 'navigator', {
        value: {
          ...mockNavigator,
          language: 'primary-lang',
          languages: longLanguageArray
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.language).toBe('primary-lang');
      expect(result.languages).toEqual(longLanguageArray);
    });

    it('should handle unusual language codes', () => {
      const unusualLanguages = [
        'x-pig-latin',
        'en-US-x-custom',
        'zh-Hans-CN',
        'sr-Latn-RS',
        'ca-ES-valencia'
      ];

      Object.defineProperty(global, 'navigator', {
        value: {
          ...mockNavigator,
          language: unusualLanguages[0],
          languages: unusualLanguages
        },
        writable: true,
        configurable: true
      });

      const result = PreferencesFingerprint.collect();

      expect(result.language).toBe(unusualLanguages[0]);
      expect(result.languages).toEqual(unusualLanguages);
    });
  });

  describe('data consistency and uniqueness', () => {
    it('should return consistent results for same preferences', () => {
      const result1 = PreferencesFingerprint.collect();
      const result2 = PreferencesFingerprint.collect();

      expect(result1).toEqual(result2);
    });

    it('should detect different preference configurations', () => {
      // First configuration
      const result1 = PreferencesFingerprint.collect();

      // Second configuration
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'de-DE',
          languages: ['de-DE', 'de', 'en'],
          userAgentData: {
            brands: [{ brand: 'Firefox', version: '117' }],
            mobile: true,
            platform: 'Android'
          }
        },
        writable: true,
        configurable: true
      });

      mockIntl.DateTimeFormat.mockReturnValue({
        resolvedOptions: jest.fn(() => ({ timeZone: 'Europe/Berlin' }))
      });

      mockDate.getTimezoneOffset.mockReturnValue(-60); // UTC+1

      const result2 = PreferencesFingerprint.collect();

      expect(result1.language).not.toBe(result2.language);
      expect(result1.languages).not.toEqual(result2.languages);
      expect(result1.timezone).not.toBe(result2.timezone);
      expect(result1.timezoneOffset).not.toBe(result2.timezoneOffset);
      expect(result1.clientHints?.platform).not.toBe(result2.clientHints?.platform);
    });

    it('should provide meaningful preference fingerprint data', () => {
      const result = PreferencesFingerprint.collect();

      // Check data types
      expect(typeof result.language).toBe('string');
      expect(Array.isArray(result.languages)).toBe(true);
      expect(typeof result.timezone).toBe('string');
      expect(typeof result.timezoneOffset).toBe('number');
      expect(result.clientHints === null || typeof result.clientHints === 'object').toBe(true);

      // Check language array contains primary language
      expect(result.languages).toContain(result.language);

      // Check timezone offset is reasonable
      expect(result.timezoneOffset).toBeGreaterThanOrEqual(-840);
      expect(result.timezoneOffset).toBeLessThanOrEqual(720);
    });
  });
});