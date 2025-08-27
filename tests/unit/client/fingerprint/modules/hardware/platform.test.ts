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
    it('should return platform from navigator.userAgentData.platform when available', () => {
      // Arrange
      mockNavigator.userAgentData = {
        platform: 'Windows',
      };

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: 'Windows' });
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

    it('should prioritize userAgentData.platform over navigator.platform', () => {
      // Arrange
      mockNavigator.userAgentData = {
        platform: 'Linux',
      };
      mockNavigator.platform = 'Win32';

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: 'Linux' });
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
