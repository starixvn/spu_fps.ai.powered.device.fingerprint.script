/**
 * @jest-environment jsdom
 */

import { collectLanguages } from '../../../../../../src/client/fingerprint/modules/preference/languages';

// Mock browser detection utilities
jest.mock('../../../../../../src/client/fingerprint/utils/browser', () => ({
  isChromium: jest.fn(),
  isChromium86OrNewer: jest.fn()
}));

const { isChromium, isChromium86OrNewer } = require('../../../../../../src/client/fingerprint/utils/browser');

describe('Languages Module', () => {
  beforeEach(() => {
    // Reset navigator properties
    Object.defineProperty(navigator, 'language', {
      writable: true,
      configurable: true,
      value: undefined
    });

    Object.defineProperty(navigator, 'languages', {
      writable: true,
      configurable: true,
      value: undefined
    });

    delete (navigator as any).userLanguage;
    delete (navigator as any).browserLanguage;
    delete (navigator as any).systemLanguage;

    // Reset browser detection mocks
    jest.clearAllMocks();
    (isChromium as jest.Mock).mockReturnValue(false);
    (isChromium86OrNewer as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('collectLanguages', () => {
    it('should return languages from navigator.language', () => {
      // Arrange
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: 'en-US'
      });

      // Act
      const result = collectLanguages();

      // Assert
      expect(result).toEqual({ languages: [['en-US']] });
    });

    it('should return languages from navigator.languages when available', () => {
      // Arrange
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: 'en-US'
      });

      Object.defineProperty(navigator, 'languages', {
        writable: true,
        configurable: true,
        value: ['en-US', 'en', 'vi-VN', 'vi']
      });

      (isChromium as jest.Mock).mockReturnValue(false);

      // Act
      const result = collectLanguages();

      // Assert
      expect(result).toEqual({ 
        languages: [['en-US'], ['en-US', 'en', 'vi-VN', 'vi']] 
      });
    });

    it('should ignore navigator.languages in Chromium 86+ incognito mode', () => {
      // Arrange
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: 'en-US'
      });

      Object.defineProperty(navigator, 'languages', {
        writable: true,
        configurable: true,
        value: ['en-US', 'en', 'vi-VN']
      });

      (isChromium as jest.Mock).mockReturnValue(true);
      (isChromium86OrNewer as jest.Mock).mockReturnValue(true);

      // Act
      const result = collectLanguages();

      // Assert
      expect(result).toEqual({ languages: [['en-US']] }); // Only primary language
    });

    it('should use navigator.languages in older Chromium versions', () => {
      // Arrange
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: 'en-US'
      });

      Object.defineProperty(navigator, 'languages', {
        writable: true,
        configurable: true,
        value: ['en-US', 'en']
      });

      (isChromium as jest.Mock).mockReturnValue(true);
      (isChromium86OrNewer as jest.Mock).mockReturnValue(false);

      // Act
      const result = collectLanguages();

      // Assert
      expect(result).toEqual({ 
        languages: [['en-US'], ['en-US', 'en']] 
      });
    });

    it('should fallback to userLanguage when language is undefined', () => {
      // Arrange
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: undefined
      });

      (navigator as any).userLanguage = 'zh-CN';

      // Act
      const result = collectLanguages();

      // Assert
      expect(result).toEqual({ languages: [['zh-CN']] });
    });

    it('should fallback to browserLanguage when language and userLanguage are undefined', () => {
      // Arrange
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: undefined
      });

      (navigator as any).browserLanguage = 'ja-JP';

      // Act
      const result = collectLanguages();

      // Assert
      expect(result).toEqual({ languages: [['ja-JP']] });
    });

    it('should fallback to systemLanguage when other primary languages are undefined', () => {
      // Arrange
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: undefined
      });

      (navigator as any).systemLanguage = 'ko-KR';

      // Act
      const result = collectLanguages();

      // Assert
      expect(result).toEqual({ languages: [['ko-KR']] });
    });

    it('should handle string navigator.languages (non-standard)', () => {
      // Arrange
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: 'en-US'
      });

      Object.defineProperty(navigator, 'languages', {
        writable: true,
        configurable: true,
        value: 'en-US,en,fr-FR,fr'
      });

      // Act
      const result = collectLanguages();

      // Assert
      expect(result).toEqual({ 
        languages: [['en-US'], ['en-US', 'en', 'fr-FR', 'fr']] 
      });
    });

    it('should filter out empty strings from languages array', () => {
      // Arrange
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: 'en-US'
      });

      Object.defineProperty(navigator, 'languages', {
        writable: true,
        configurable: true,
        value: ['en-US', '', 'en', '   ', 'fr-FR']
      });

      // Act
      const result = collectLanguages();

      // Assert
      expect(result).toEqual({ 
        languages: [['en-US'], ['en-US', 'en', 'fr-FR']] 
      });
    });

    it('should return default empty language when no languages are available', () => {
      // Arrange - No language properties set

      // Act
      const result = collectLanguages();

      // Assert
      expect(result).toEqual({ languages: [['']] });
    });

    it('should handle errors gracefully and return default', () => {
      // Arrange - Simulate error in navigator access
      const originalNavigator = global.navigator;
      delete (global as any).navigator;

      // Act
      const result = collectLanguages();

      // Assert
      expect(result).toEqual({ languages: [['']] });

      // Restore navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true
      });
    });
  });
});