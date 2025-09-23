/**
 * @jest-environment jsdom
 */

import { collectPlatform } from '../../../../../../src/client/fingerprint/modules/hardware/platform';
import { FINGERPRINT_SPECIAL_VALUES } from '../../../../../../src/client/fingerprint/utils/consts';

// Setup mock values in beforeEach
const setupMocks = () => {
  // Mock navigator properties
  Object.defineProperty(navigator, 'platform', {
    writable: true,
    value: undefined
  });
  
  Object.defineProperty(navigator, 'vendor', {
    writable: true,
    value: 'Google Inc.'
  });

  // Ensure window properties exist
  (window as any).HTMLElement = window.HTMLElement || { prototype: {} };
  (window as any).Document = window.Document || { prototype: { pointerLockElement: {} } };
  (window as any).Element = window.Element || { prototype: {} };
};

describe('Hardware Platform Module', () => {
  beforeEach(() => {
    setupMocks();
    
    // Reset platform
    Object.defineProperty(navigator, 'platform', {
      writable: true,
      value: undefined
    });
    
    // Reset vendor to non-Apple
    Object.defineProperty(navigator, 'vendor', {
      writable: true,
      value: 'Google Inc.'
    });
  });

  describe('collectPlatform', () => {
    it('should return platform from navigator.platform', () => {
      // Arrange
      Object.defineProperty(navigator, 'platform', {
        writable: true,
        value: 'Windows'
      });

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: 'Windows' });
    });

    it('should return empty string when navigator.platform not available', () => {
      // Arrange
      Object.defineProperty(navigator, 'platform', {
        writable: true,
        value: undefined
      });

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: FINGERPRINT_SPECIAL_VALUES.UNDEFINED });
    });

    it('should return MacIntel platform correctly in non-WebKit environment', () => {
      // Arrange - Set as non-WebKit environment
      Object.defineProperty(navigator, 'platform', {
        writable: true,
        value: 'MacIntel'
      });
      
      Object.defineProperty(navigator, 'vendor', {
        writable: true,
        value: 'Google Inc.' // Non-Apple vendor to avoid WebKit detection
      });

      // Act
      const result = collectPlatform();

      // Assert  
      expect(result).toEqual({ platform: 'MacIntel' });
    });

    it('should return empty string when navigator.platform is empty', () => {
      // Arrange
      Object.defineProperty(navigator, 'platform', {
        writable: true,
        value: ''
      });

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: FINGERPRINT_SPECIAL_VALUES.UNDEFINED });
    });

    it('should return different platform values as-is', () => {
      // Test Windows platforms
      Object.defineProperty(navigator, 'platform', { writable: true, value: 'Win32' });
      expect(collectPlatform()).toEqual({ platform: 'Win32' });

      Object.defineProperty(navigator, 'platform', { writable: true, value: 'Win64' });
      expect(collectPlatform()).toEqual({ platform: 'Win64' });

      // Test Mac platforms (ensure non-Apple vendor to avoid special logic)
      Object.defineProperty(navigator, 'vendor', { writable: true, value: 'Google Inc.' });
      Object.defineProperty(navigator, 'platform', { writable: true, value: 'MacIntel' });
      expect(collectPlatform()).toEqual({ platform: 'MacIntel' });

      // Test Linux platforms
      Object.defineProperty(navigator, 'platform', { writable: true, value: 'Linux x86_64' });
      expect(collectPlatform()).toEqual({ platform: 'Linux x86_64' });
    });

    it('should handle error gracefully and return ERROR', () => {
      // Arrange - Create a scenario where navigator access throws during platform access
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: {
          get platform() { throw new Error('Platform access denied'); },
          vendor: 'Apple Computer, Inc.', // Keep other properties accessible
          userAgent: 'test'
        },
        configurable: true
      });

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: FINGERPRINT_SPECIAL_VALUES.ERROR });

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true
      });
    });
  });
});