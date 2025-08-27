import { collectHardwareConcurrency } from '../../../../../../src/client/fingerprint/modules/hardware/hardwareConcurrency';

// Mock navigator object
const mockNavigator: any = {
  hardwareConcurrency: undefined,
};

// Mock global navigator
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('Hardware Concurrency Module', () => {
  beforeEach(() => {
    // Reset mock navigator before each test
    mockNavigator.hardwareConcurrency = undefined;
  });

  describe('collectHardwareConcurrency', () => {
    it('should return hardwareConcurrency when navigator.hardwareConcurrency is available as number', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = 8;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: 8 });
    });

    it('should return hardwareConcurrency when navigator.hardwareConcurrency is available as string', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = '4';

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: '4' });
    });

    it('should return empty string when navigator.hardwareConcurrency is 0', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = 0;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: '' });
    });

    it('should return hardwareConcurrency when navigator.hardwareConcurrency is 1', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = 1;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: 1 });
    });

    it('should return hardwareConcurrency when navigator.hardwareConcurrency is a large number', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = 32;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: 32 });
    });

    it('should return empty string when navigator.hardwareConcurrency is undefined', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = undefined;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: '' });
    });

    it('should return empty string when navigator.hardwareConcurrency is null', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = null;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: '' });
    });

    it('should return empty string when navigator.hardwareConcurrency is false', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = false;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: '' });
    });

    it('should return empty string when navigator.hardwareConcurrency is empty string', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = '';

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: '' });
    });

    it('should return empty string when navigator.hardwareConcurrency is NaN', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = NaN;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: '' });
    });

    it('should return Infinity when navigator.hardwareConcurrency is Infinity', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = Infinity;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: Infinity });
    });

    it('should return -Infinity when navigator.hardwareConcurrency is -Infinity', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = -Infinity;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: -Infinity });
    });

    it('should return negative number when navigator.hardwareConcurrency is negative number', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = -1;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: -1 });
    });

    it('should handle error gracefully and return empty string', () => {
      // Arrange
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: '' });

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
      });
    });
  });
});
