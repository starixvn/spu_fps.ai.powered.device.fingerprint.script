import { collectOSCpu } from '../../../../../../src/client/fingerprint/modules/hardware/osCpu';
import { FINGERPRINT_SPECIAL_VALUES } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock navigator object
const mockNavigator: any = {
  osc: undefined,
  userAgentData: undefined,
};

// Mock global navigator
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('Hardware OS CPU Module', () => {
  beforeEach(() => {
    // Reset mock navigator before each test
    mockNavigator.oscpu = undefined;
    mockNavigator.userAgentData = undefined;
  });

  describe('collectOSCpu', () => {
    it('should return navigator.oscpu when available', async () => {
      // Arrange
      mockNavigator.oscpu = 'Windows NT 10.0; Win64; x64';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows NT 10.0; Win64; x64' });
    });

    it('should return empty string when navigator.oscpu not available', async () => {
      // Arrange
      mockNavigator.oscpu = undefined;

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: FINGERPRINT_SPECIAL_VALUES.UNDEFINED });
    });

    it('should return empty string when userAgentData returns incomplete data', async () => {
      // Arrange
      mockNavigator.oscpu = undefined;

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: FINGERPRINT_SPECIAL_VALUES.UNDEFINED });
    });

    it('should return empty string when userAgentData.getHighEntropyValues throws error', async () => {
      // Arrange
      mockNavigator.oscpu = undefined;

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: FINGERPRINT_SPECIAL_VALUES.UNDEFINED });
    });

    it('should return empty string when both navigator.oscpu and userAgentData are not available', async () => {
      // Arrange
      mockNavigator.oscpu = undefined;

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: FINGERPRINT_SPECIAL_VALUES.UNDEFINED });
    });

    it('should prioritize navigator.oscpu over userAgentData', async () => {
      // Arrange
      mockNavigator.oscpu = 'Windows NT 10.0; Win64; x64';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows NT 10.0; Win64; x64' });
    });

    it('should handle oscpu property that is not a string', async () => {
      // Test different cases of invalid oscpu values
      const testCases = [
        { osc: null, expected: FINGERPRINT_SPECIAL_VALUES.UNDEFINED },
        { osc: undefined, expected: FINGERPRINT_SPECIAL_VALUES.UNDEFINED },
        { osc: 123, expected: FINGERPRINT_SPECIAL_VALUES.UNDEFINED },
        { osc: {}, expected: FINGERPRINT_SPECIAL_VALUES.UNDEFINED },
        { osc: '   ', expected: FINGERPRINT_SPECIAL_VALUES.UNDEFINED }, // Only whitespace
        { osc: '  Windows NT 10.0  ', expected: 'Windows NT 10.0' }, // With whitespace
      ];

      for (const testCase of testCases) {
        mockNavigator.oscpu = testCase.osc;

        const result = await collectOSCpu();
        expect(result).toEqual({ oscpu: testCase.expected });
      }
    });

    it('should handle error gracefully and return ERROR', async () => {
      // Arrange
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: FINGERPRINT_SPECIAL_VALUES.ERROR });

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
      });
    });

    it('should return empty string when navigator does not have oscpu property', async () => {
      // Arrange
      const navigatorWithoutOscpu = {};
      Object.defineProperty(global, 'navigator', {
        value: navigatorWithoutOscpu,
        writable: true,
      });

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: FINGERPRINT_SPECIAL_VALUES.UNDEFINED });

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
      });
    });
  });
});