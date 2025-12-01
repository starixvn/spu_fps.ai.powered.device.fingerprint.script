import { collectCpuClass } from '../../../../../../src/client/fingerprint/modules/hardware/cpuClass';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock navigator object
const mockNavigator: any = {
  cpuClass: undefined,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  userAgentData: {
    getHighEntropyValues: jest.fn().mockResolvedValue({ architecture: undefined }),
  },
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
    mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
    mockNavigator.userAgentData = {
      getHighEntropyValues: jest.fn().mockResolvedValue({ architecture: undefined }),
    };
  });

  describe('collectCpuClass', () => {
    it('should return cpuClass when navigator.cpuClass is available as string', async () => {
      // Arrange
      mockNavigator.cpuClass = 'Intel x86';

      // Act
      const result = await collectCpuClass();

      // Assert
      expect(result).toEqual('Intel x86');
    });

    it('should trim whitespace from cpuClass string', async () => {
      // Arrange
      mockNavigator.cpuClass = '  Intel x86  ';

      // Act
      const result = await collectCpuClass();

      // Assert
      expect(result).toEqual('Intel x86');
    });

    it('should return empty string when navigator.cpuClass is undefined', async () => {
      // Arrange
      mockNavigator.cpuClass = undefined;
      mockNavigator.userAgent = '';
      mockNavigator.userAgentData = undefined;

      // Act
      const result = await collectCpuClass();

      // Assert
      expect(result).toEqual(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return empty string when navigator.cpuClass is null', async () => {
      // Arrange
      mockNavigator.cpuClass = null;
      mockNavigator.userAgent = '';
      mockNavigator.userAgentData = undefined;

      // Act
      const result = await collectCpuClass();

      // Assert
      expect(result).toEqual(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return empty string when navigator.cpuClass is not a string', async () => {
      // Arrange
      mockNavigator.cpuClass = 123;
      mockNavigator.userAgent = '';
      mockNavigator.userAgentData = undefined;

      // Act
      const result = await collectCpuClass();

      // Assert
      expect(result).toEqual(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return empty string when navigator.cpuClass is empty string', async () => {
      // Arrange
      mockNavigator.cpuClass = '';
      mockNavigator.userAgent = '';
      mockNavigator.userAgentData = undefined;

      // Act
      const result = await collectCpuClass();

      // Assert
      expect(result).toEqual(FingerprintSpecialValue.UNDEFINED);
    });

    it('should return empty string when navigator.cpuClass is whitespace only', async () => {
      // Arrange
      mockNavigator.cpuClass = '   ';
      mockNavigator.userAgent = '';
      mockNavigator.userAgentData = undefined;

      // Act
      const result = await collectCpuClass();

      // Assert
      expect(result).toEqual(FingerprintSpecialValue.UNDEFINED);
    });

    it('should handle error gracefully and return ERROR', async () => {
      // Arrange
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      // Act
      const result = await collectCpuClass();

      // Assert
      expect(result).toEqual(FingerprintSpecialValue.ERROR);

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
      });
    });
  });
});
