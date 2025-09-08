import { collectPlatform } from '../../../../../../src/client/fingerprint/modules/hardware/platform';

// Mock navigator object
const mockNavigator: any = {
  userAgentData: undefined,
  platform: undefined,
};

// Mock global navigator
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('Hardware Platform Module', () => {
  beforeEach(() => {
    // Reset mock navigator before each test
    mockNavigator.userAgentData = undefined;
    mockNavigator.platform = undefined;
  });

  describe('collectPlatform', () => {
    it('should return normalized platform from navigator.platform first', () => {
      // Arrange
      mockNavigator.platform = 'Windows';
      mockNavigator.userAgentData = {
        platform: 'Linux',
      };

      // Act
      const result = collectPlatform();

      // Assert
      // Should prioritize navigator.platform and normalize it
      expect(result).toEqual({ platform: 'Win32' });
    });

    it('should return normalized platform from navigator.userAgentData.platform when navigator.platform not available', () => {
      // Arrange
      mockNavigator.platform = undefined;
      mockNavigator.userAgentData = {
        platform: 'Windows',
      };

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: 'Win32' });
    });

    it('should return platform from navigator.platform when userAgentData is not available', () => {
      // Arrange
      mockNavigator.platform = 'MacIntel';

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: 'MacIntel' });
    });

    it('should return empty string when both userAgentData and platform are not available', () => {
      // Arrange
      mockNavigator.userAgentData = undefined;
      mockNavigator.platform = undefined;

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: '' });
    });

    it('should return empty string when userAgentData.platform is empty', () => {
      // Arrange
      mockNavigator.userAgentData = {
        platform: '',
      };

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: '' });
    });

    it('should return empty string when navigator.platform is empty', () => {
      // Arrange
      mockNavigator.platform = '';

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: '' });
    });

    it('should normalize different platform values correctly', () => {
      // Test Windows normalization
      mockNavigator.platform = 'Win32';
      expect(collectPlatform()).toEqual({ platform: 'Win32' });

      mockNavigator.platform = 'Win64';
      expect(collectPlatform()).toEqual({ platform: 'Win32' });

      // Test Mac normalization
      mockNavigator.platform = 'MacIntel';
      expect(collectPlatform()).toEqual({ platform: 'MacIntel' });

      // Test Linux normalization
      mockNavigator.platform = 'Linux x86_64';
      expect(collectPlatform()).toEqual({ platform: 'Linux x86_64' });
    });

    it('should handle error gracefully and return empty string', () => {
      // Arrange
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: '' });

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
      });
    });
  });
});