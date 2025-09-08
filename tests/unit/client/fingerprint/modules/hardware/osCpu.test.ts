import { collectOSCpu } from '../../../../../../src/client/fingerprint/modules/hardware/osCpu';

// Mock navigator object
const mockNavigator: any = {
  oscpu: undefined,
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

    it('should return userAgentData platform and architecture when navigator.oscpu not available', async () => {
      // Arrange
      mockNavigator.oscpu = undefined;
      mockNavigator.userAgentData = {
        getHighEntropyValues: jest.fn().mockResolvedValue({
          platform: 'Windows',
          architecture: 'x86'
        })
      };

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows; x86' });
      expect(mockNavigator.userAgentData.getHighEntropyValues).toHaveBeenCalledWith([
        'architecture',
        'platform'
      ]);
    });

    it('should return empty string when userAgentData returns incomplete data', async () => {
      // Arrange
      mockNavigator.oscpu = undefined;
      mockNavigator.userAgentData = {
        getHighEntropyValues: jest.fn().mockResolvedValue({
          platform: 'Windows'
          // Missing architecture
        })
      };

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: '' });
    });

    it('should return empty string when userAgentData.getHighEntropyValues throws error', async () => {
      // Arrange
      mockNavigator.oscpu = undefined;
      mockNavigator.userAgentData = {
        getHighEntropyValues: jest.fn().mockRejectedValue(new Error('Not allowed'))
      };

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: '' });
    });

    it('should return empty string when both navigator.oscpu and userAgentData are not available', async () => {
      // Arrange
      mockNavigator.oscpu = undefined;
      mockNavigator.userAgentData = undefined;

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: '' });
    });

    it('should prioritize navigator.oscpu over userAgentData', async () => {
      // Arrange
      mockNavigator.oscpu = 'Windows NT 10.0; Win64; x64';
      mockNavigator.userAgentData = {
        getHighEntropyValues: jest.fn().mockResolvedValue({
          platform: 'Linux',
          architecture: 'x86_64'
        })
      };

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows NT 10.0; Win64; x64' });
      // Should not call userAgentData when oscpu is available
      expect(mockNavigator.userAgentData.getHighEntropyValues).not.toHaveBeenCalled();
    });

    it('should handle various platform and architecture combinations', async () => {
      // Test different combinations
      const testCases = [
        { platform: 'macOS', architecture: 'arm64', expected: 'macOS; arm64' },
        { platform: 'Linux', architecture: 'x86_64', expected: 'Linux; x86_64' },
        { platform: 'Android', architecture: 'arm', expected: 'Android; arm' },
      ];

      for (const testCase of testCases) {
        mockNavigator.oscpu = undefined;
        mockNavigator.userAgentData = {
          getHighEntropyValues: jest.fn().mockResolvedValue({
            platform: testCase.platform,
            architecture: testCase.architecture
          })
        };

        const result = await collectOSCpu();
        expect(result).toEqual({ oscpu: testCase.expected });
      }
    });

    it('should handle error gracefully and return empty string', async () => {
      // Arrange
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: '' });

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
      });
    });
  });
});