import { collectDeviceMemory } from '../../../../../../src/client/fingerprint/modules/hardware/device_memory';

// Mock navigator object
const mockNavigator: any = {
  deviceMemory: undefined,
};

// Mock global navigator
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('Hardware Device Memory Module', () => {
  beforeEach(() => {
    // Reset mock navigator before each test
    mockNavigator.deviceMemory = undefined;
  });

  describe('collectDeviceMemory', () => {
    it('should return deviceMemory when navigator.deviceMemory is available as number', () => {
      // Arrange
      mockNavigator.deviceMemory = 8;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: 8 });
    });

    it('should return deviceMemory when navigator.deviceMemory is available as string', () => {
      // Arrange
      mockNavigator.deviceMemory = '4';

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: '4' });
    });

    it('should return empty string when navigator.deviceMemory is 0', () => {
      // Arrange
      mockNavigator.deviceMemory = 0;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: '' });
    });

    it('should return deviceMemory when navigator.deviceMemory is 1', () => {
      // Arrange
      mockNavigator.deviceMemory = 1;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: 1 });
    });

    it('should return deviceMemory when navigator.deviceMemory is a large number', () => {
      // Arrange
      mockNavigator.deviceMemory = 32;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: 32 });
    });

    it('should return deviceMemory when navigator.deviceMemory is a decimal number', () => {
      // Arrange
      mockNavigator.deviceMemory = 16.5;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: 16.5 });
    });

    it('should return deviceMemory when navigator.deviceMemory is a very small number', () => {
      // Arrange
      mockNavigator.deviceMemory = 0.5;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: 0.5 });
    });

    it('should return empty string when navigator.deviceMemory is undefined', () => {
      // Arrange
      mockNavigator.deviceMemory = undefined;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: '' });
    });

    it('should return empty string when navigator.deviceMemory is null', () => {
      // Arrange
      mockNavigator.deviceMemory = null;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: '' });
    });

    it('should return empty string when navigator.deviceMemory is false', () => {
      // Arrange
      mockNavigator.deviceMemory = false;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: '' });
    });

    it('should return empty string when navigator.deviceMemory is empty string', () => {
      // Arrange
      mockNavigator.deviceMemory = '';

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: '' });
    });

    it('should return empty string when navigator.deviceMemory is NaN', () => {
      // Arrange
      mockNavigator.deviceMemory = NaN;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: '' });
    });

    it('should return Infinity when navigator.deviceMemory is Infinity', () => {
      // Arrange
      mockNavigator.deviceMemory = Infinity;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: Infinity });
    });

    it('should return -Infinity when navigator.deviceMemory is -Infinity', () => {
      // Arrange
      mockNavigator.deviceMemory = -Infinity;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: -Infinity });
    });

    it('should return negative number when navigator.deviceMemory is negative number', () => {
      // Arrange
      mockNavigator.deviceMemory = -1;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: -1 });
    });

    it('should return object when navigator.deviceMemory is an object', () => {
      // Arrange
      mockNavigator.deviceMemory = {};

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: {} });
    });

    it('should return array when navigator.deviceMemory is an array', () => {
      // Arrange
      mockNavigator.deviceMemory = [];

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: [] });
    });

    it('should return function when navigator.deviceMemory is a function', () => {
      // Arrange
      mockNavigator.deviceMemory = () => {};

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: expect.any(Function) });
    });

    it('should handle error gracefully and return empty string', () => {
      // Arrange
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: '' });

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
      });
    });
  });
});
