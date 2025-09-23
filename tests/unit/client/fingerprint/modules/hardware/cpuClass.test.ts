import { collectCpuClass } from '../../../../../../src/client/fingerprint/modules/hardware/cpuClass';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock navigator object
const mockNavigator: any = {
  ccl: undefined,
};

// Mock global navigator
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('Hardware CPU Class Module', () => {
  beforeEach(() => {
    // Reset mock navigator before each test
    mockNavigator.cpuClass = undefined;
  });

  describe('collectCpuClass', () => {
    it('should return cpuClass when navigator.cpuClass is available as string', () => {
      // Arrange
      mockNavigator.cpuClass = 'Intel x86';

      // Act
      const result = collectCpuClass();

      // Assert
      expect(result).toEqual({ cpuClass: 'Intel x86' });
    });

    it('should trim whitespace from cpuClass string', () => {
      // Arrange
      mockNavigator.cpuClass = '  Intel x86  ';

      // Act
      const result = collectCpuClass();

      // Assert
      expect(result).toEqual({ cpuClass: 'Intel x86' });
    });

    it('should return empty string when navigator.cpuClass is undefined', () => {
      // Arrange
      mockNavigator.cpuClass = undefined;

      // Act
      const result = collectCpuClass();

      // Assert
      expect(result).toEqual({ cpuClass: FingerprintSpecialValue.UNDEFINED });
    });

    it('should return empty string when navigator.cpuClass is null', () => {
      // Arrange
      mockNavigator.cpuClass = null;

      // Act
      const result = collectCpuClass();

      // Assert
      expect(result).toEqual({ cpuClass: FingerprintSpecialValue.UNDEFINED });
    });

    it('should return empty string when navigator.cpuClass is not a string', () => {
      // Arrange
      mockNavigator.cpuClass = 123;

      // Act
      const result = collectCpuClass();

      // Assert
      expect(result).toEqual({ cpuClass: FingerprintSpecialValue.UNDEFINED });
    });

    it('should return empty string when navigator.cpuClass is empty string', () => {
      // Arrange
      mockNavigator.cpuClass = '';

      // Act
      const result = collectCpuClass();

      // Assert
      expect(result).toEqual({ cpuClass: FingerprintSpecialValue.UNDEFINED });
    });

    it('should return empty string when navigator.cpuClass is whitespace only', () => {
      // Arrange
      mockNavigator.cpuClass = '   ';

      // Act
      const result = collectCpuClass();

      // Assert
      expect(result).toEqual({ cpuClass: FingerprintSpecialValue.UNDEFINED });
    });

    it('should handle error gracefully and return ERROR', () => {
      // Arrange
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      // Act
      const result = collectCpuClass();

      // Assert
      expect(result).toEqual({ cpuClass: FingerprintSpecialValue.ERROR });

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
      });
    });
  });
});
