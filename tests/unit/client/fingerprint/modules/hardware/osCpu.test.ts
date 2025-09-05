import { collectOSCpu } from '../../../../../../src/client/fingerprint/modules/hardware/osCpu';

// Mock navigator object
const mockNavigator: any = {
  oscpu: undefined,
  userAgent: '',
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
    mockNavigator.userAgent = '';
  });

  describe('collectOSCpu', () => {
    it('should return oscpu from navigator.oscpu when available', async () => {
      // Arrange
      mockNavigator.oscpu = 'Windows NT 10.0; Win64; x64';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows NT 10.0; Win64; x64' });
    });

    it('should return Windows NT 10.0 when userAgent contains Windows NT 10.0', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows NT 10.0; Win64; x64' });
    });

    it('should return Windows NT 6.3 when userAgent contains Windows NT 6.3', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 6.3; Win64; x64)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows NT 6.3; Win64; x64' });
    });

    it('should return Windows NT 6.2 when userAgent contains Windows NT 6.2', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 6.2; Win64; x64)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows NT 6.2; Win64; x64' });
    });

    it('should return Windows NT 6.1 when userAgent contains Windows NT 6.1', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows NT 6.1; Win64; x64' });
    });

    it('should return Mac OS X when userAgent contains Mac OS X', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Mac OS X; Intel' });
    });

    it('should return Linux when userAgent contains Linux', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (X11; Linux x86_64)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Linux; x86_64' });
    });

    it('should return Android when userAgent contains Android', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 11)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Android' });
    });

    it('should return iOS when userAgent contains iPhone', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'iOS' });
    });

    it('should add Win64; x64 to Windows when userAgent contains Win64 or x64', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows NT 10.0; Win64; x64' });
    });

    it('should add Win32; x86 to Windows when userAgent contains Win32 or i686', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win32; i686)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows NT 10.0; Win32; x86' });
    });

    it('should add Intel to Mac OS X when userAgent contains Intel', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Mac OS X; Intel' });
    });

    it('should add PPC to Mac OS X when userAgent contains PPC', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Macintosh; PPC Mac OS X 10_5_8)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Mac OS X; PPC' });
    });

    it('should add x86_64 to Linux when userAgent contains x86_64', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (X11; Linux x86_64)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Linux; x86_64' });
    });

    it('should add i686 to Linux when userAgent contains i686', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (X11; Linux i686)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Linux; i686' });
    });

    it('should add armv7l to Linux when userAgent contains armv7l', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (X11; Linux armv7l)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Linux; armv7l' });
    });

    it('should add aarch64 to Linux when userAgent contains aarch64', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (X11; Linux aarch64)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Linux; aarch64' });
    });

    it('should prioritize navigator.oscpu over userAgent parsing', async () => {
      // Arrange
      mockNavigator.oscpu = 'Custom OS String';
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Custom OS String' });
    });

    it('should return empty string when no OS indicators found', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Unknown Platform)';

      // Act
      const result = await collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: '' });
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
