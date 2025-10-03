/**
 * @jest-environment jsdom
 */

import { collectCookiesEnabled } from '../../../../../../src/client/fingerprint/modules/preference/cookiesEnabled';

describe('Cookies Enabled Module', () => {
  beforeEach(() => {
    // Reset navigator.cookieEnabled
    Object.defineProperty(navigator, 'cookieEnabled', {
      writable: true,
      configurable: true,
      value: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('collectCookiesEnabled', () => {
    it('should return 1 when cookies are enabled', () => {
      // Arrange
      Object.defineProperty(navigator, 'cookieEnabled', {
        writable: true,
        configurable: true,
        value: true
      });

      // Act
      const result = collectCookiesEnabled();

      // Assert
      expect(result).toBe(1);
    });

    it('should return 0 when cookies are disabled', () => {
      // Arrange
      Object.defineProperty(navigator, 'cookieEnabled', {
        writable: true,
        configurable: true,
        value: false
      });

      // Act
      const result = collectCookiesEnabled();

      // Assert
      expect(result).toBe(0);
    });

    it('should fallback to document.cookie when cookieEnabled is undefined', () => {
      // Arrange
      Object.defineProperty(navigator, 'cookieEnabled', {
        writable: true,
        configurable: true,
        value: undefined
      });

      // Act
      const result = collectCookiesEnabled();

      // Assert - Should fallback to document.cookie test, which works in jsdom
      expect(result).toBe(1);
    });

    it('should fallback to document.cookie when cookieEnabled is null', () => {
      // Arrange
      Object.defineProperty(navigator, 'cookieEnabled', {
        writable: true,
        configurable: true,
        value: null
      });

      // Act
      const result = collectCookiesEnabled();

      // Assert - Should fallback to document.cookie test
      expect(result).toBe(1);
    });

    it('should fallback to document.cookie when cookieEnabled property does not exist', () => {
      // Arrange
      const originalCookieEnabled = navigator.cookieEnabled;
      delete (navigator as any).cookieEnabled;

      // Act
      const result = collectCookiesEnabled();

      // Assert - Should fallback to document.cookie test
      expect(result).toBe(1);

      // Restore
      Object.defineProperty(navigator, 'cookieEnabled', {
        value: originalCookieEnabled,
        writable: true,
        configurable: true
      });
    });

    it('should handle truthy values correctly', () => {
      // Test various truthy values
      const truthyValues = [true, 1, 'true', 'any string', {}, []];
      
      for (const value of truthyValues) {
        // Arrange
        Object.defineProperty(navigator, 'cookieEnabled', {
          writable: true,
          configurable: true,
          value: value
        });

        // Act
        const result = collectCookiesEnabled();

        // Assert
        expect(result).toBe(1);
      }
    });

    it('should handle falsy values correctly', () => {
      // Test boolean false specifically
      Object.defineProperty(navigator, 'cookieEnabled', {
        writable: true,
        configurable: true,
        value: false
      });

      // Act
      const result = collectCookiesEnabled();

      // Assert
      expect(result).toBe(0);
      
      // Test non-boolean falsy values that should fallback to document.cookie
      const nonBooleanFalsyValues = [0, '', null, undefined, NaN];
      
      for (const value of nonBooleanFalsyValues) {
        // Arrange
        Object.defineProperty(navigator, 'cookieEnabled', {
          writable: true,
          configurable: true,
          value: value
        });

        // Act
        const result = collectCookiesEnabled();

        // Assert - Should fallback to document.cookie test
        expect(result).toBe(1);
      }
    });

    it('should always return a number', () => {
      // Arrange
      Object.defineProperty(navigator, 'cookieEnabled', {
        writable: true,
        configurable: true,
        value: true
      });

      // Act
      const result = collectCookiesEnabled();

      // Assert
      expect(typeof result).toBe('number');
      expect([0, 1, -1, -3]).toContain(result);
    });

    it('should handle navigator property access errors gracefully', () => {
      // Arrange - Create a scenario where accessing cookieEnabled throws
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: {
          get cookieEnabled() { throw new Error('Cookie access denied'); },
        },
        configurable: true
      });

      // Act
      const result = collectCookiesEnabled();

      // Assert - Should return ERROR (-3) when error occurs
      expect(result).toBe(-3);

      // Restore navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true
      });
    });

    it('should fallback to document.cookie test when navigator.cookieEnabled is not boolean', () => {
      // Arrange
      Object.defineProperty(navigator, 'cookieEnabled', {
        writable: true,
        configurable: true,
        value: 'not a boolean'
      });

      // Mock document.cookie to simulate working cookies
      let mockCookie = '';
      Object.defineProperty(document, 'cookie', {
        get: () => mockCookie,
        set: (value) => {
          if (value.includes('max-age=0') || value.includes('expires=Thu, 01 Jan 1970')) {
            // Clear the cookie
            const cookieName = value.split('=')[0];
            mockCookie = mockCookie.split('; ').filter(c => !c.startsWith(cookieName + '=')).join('; ');
          } else {
            // Set the cookie
            mockCookie = value;
          }
        },
        configurable: true
      });

      // Act
      const result = collectCookiesEnabled();

      // Assert
      expect(result).toBe(1);
    });

    it('should return 0 when document.cookie test fails', () => {
      // Arrange
      Object.defineProperty(navigator, 'cookieEnabled', {
        writable: true,
        configurable: true,
        value: undefined
      });

      // Mock document.cookie to simulate blocked cookies
      Object.defineProperty(document, 'cookie', {
        get: () => '', // Always return empty
        set: () => {}, // Do nothing
        configurable: true
      });

      // Act
      const result = collectCookiesEnabled();

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 when document is undefined', () => {
      // Arrange
      Object.defineProperty(navigator, 'cookieEnabled', {
        writable: true,
        configurable: true,
        value: undefined
      });

      const originalDocument = global.document;
      delete (global as any).document;

      // Act
      const result = collectCookiesEnabled();

      // Assert
      expect(result).toBe(0);

      // Restore document
      (global as any).document = originalDocument;
    });

    it('should handle document.cookie access errors gracefully', () => {
      // Arrange
      Object.defineProperty(navigator, 'cookieEnabled', {
        writable: true,
        configurable: true,
        value: undefined
      });

      Object.defineProperty(document, 'cookie', {
        get: () => { throw new Error('Cookie access denied'); },
        set: () => { throw new Error('Cookie write denied'); },
        configurable: true
      });

      // Act
      const result = collectCookiesEnabled();

      // Assert - Should return ERROR (-3) when document.cookie access fails
      expect(result).toBe(-3);
    });
  });
});
