import { collectArchitecture } from '../../../../../../src/client/fingerprint/modules/hardware/architecture';

// Mock navigator object
const mockNavigator: any = {
  userAgentData: undefined,
  userAgent: '',
};

// Mock global navigator
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('Hardware Architecture Module', () => {
  beforeEach(() => {
    // Reset mock navigator before each test
    mockNavigator.userAgentData = undefined;
    mockNavigator.userAgent = '';
  });

  describe('collectArchitecture', () => {
    it('should return architecture from navigator.userAgentData.getHighEntropyValues when available', async () => {
      // Arrange
      const mockGetHighEntropyValues = jest.fn().mockResolvedValue({
        architecture: 'x86_64',
      });
      
      mockNavigator.userAgentData = {
        getHighEntropyValues: mockGetHighEntropyValues,
      };

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 'x86_64' });
      expect(mockGetHighEntropyValues).toHaveBeenCalledWith(['architecture']);
    });

    it('should return empty string when getHighEntropyValues throws error', async () => {
      // Arrange
      const mockGetHighEntropyValues = jest.fn().mockRejectedValue(new Error('API not supported'));
      
      mockNavigator.userAgentData = {
        getHighEntropyValues: mockGetHighEntropyValues,
      };

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: '' });
    });

    it('should return empty string when getHighEntropyValues returns undefined architecture', async () => {
      // Arrange
      const mockGetHighEntropyValues = jest.fn().mockResolvedValue({
        architecture: undefined,
      });
      
      mockNavigator.userAgentData = {
        getHighEntropyValues: mockGetHighEntropyValues,
      };

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: '' });
    });

    it('should return x86_64 when userAgent contains win64', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 'x86_64' });
    });

    it('should return x86_64 when userAgent contains x64', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; x64)';

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 'x86_64' });
    });

    it('should return x86 when userAgent contains win32', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win32)';

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 'x86' });
    });

    it('should return x86 when userAgent contains i686', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; i686)';

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 'x86' });
    });

    it('should return arm64 when userAgent contains aarch64', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; aarch64)';

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 'arm64' });
    });

    it('should return arm64 when userAgent contains arm64', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; arm64)';

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 'arm64' });
    });

    it('should return armv7l when userAgent contains armv7l', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; armv7l)';

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 'armv7l' });
    });

    it('should return empty string when userAgent does not contain architecture indicators', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0)';

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: '' });
    });

    it('should prioritize userAgentData over userAgent parsing', async () => {
      // Arrange
      const mockGetHighEntropyValues = jest.fn().mockResolvedValue({
        architecture: 'arm64',
      });
      
      mockNavigator.userAgentData = {
        getHighEntropyValues: mockGetHighEntropyValues,
      };
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 'arm64' });
    });

    it('should handle error gracefully and return empty string', async () => {
      // Arrange
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: '' });

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
      });
    });
  });
});
