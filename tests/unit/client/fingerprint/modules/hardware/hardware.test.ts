import { HardwareFingerprint } from '../../../../../../src/client/fingerprint/modules/hardware';
import { collectPlatform } from '../../../../../../src/client/fingerprint/modules/hardware/platform';
import { collectCpuClass } from '../../../../../../src/client/fingerprint/modules/hardware/cpuClass';
import { collectArchitecture } from '../../../../../../src/client/fingerprint/modules/hardware/architecture';
import { collectOSCpu } from '../../../../../../src/client/fingerprint/modules/hardware/osCpu';
import { collectHardwareConcurrency } from '../../../../../../src/client/fingerprint/modules/hardware/hardwareConcurrency';
import { collectDeviceMemory } from '../../../../../../src/client/fingerprint/modules/hardware/deviceMemory';

// Mock navigator object for all tests
const mockNavigator: any = {
  userAgentData: undefined,
  platform: undefined,
  cpuClass: undefined,
  hardwareConcurrency: undefined,
  deviceMemory: undefined,
  oscpu: undefined,
  userAgent: '',
};

// Mock global navigator
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('Hardware Modules Integration Tests', () => {
  beforeEach(() => {
    // Reset mock navigator before each test
    mockNavigator.userAgentData = undefined;
    mockNavigator.platform = undefined;
    mockNavigator.cpuClass = undefined;
    mockNavigator.hardwareConcurrency = undefined;
    mockNavigator.deviceMemory = undefined;
    mockNavigator.oscpu = undefined;
    mockNavigator.userAgent = '';
  });

  describe('Complete Hardware Fingerprint Collection', () => {
    it('should collect complete hardware fingerprint for Windows x64 system', async () => {
      // Arrange
      mockNavigator.userAgentData = { platform: 'Windows' };
      mockNavigator.cpuClass = 'Intel x86';
      mockNavigator.hardwareConcurrency = 16;
      mockNavigator.deviceMemory = 32;
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual({
        platform: 'Windows',
        cpuClass: 'Intel x86',
        architecture: 'x86_64',
        oscpu: 'Windows NT 10.0; Win64; x64',
        hardwareConcurrency: 16,
        deviceMemory: 32,
      });
    });

    it('should collect complete hardware fingerprint for MacOS ARM system', async () => {
      // Arrange
      mockNavigator.userAgentData = { platform: 'macOS' };
      mockNavigator.cpuClass = 'Apple Silicon';
      mockNavigator.hardwareConcurrency = 8;
      mockNavigator.deviceMemory = 16;
      mockNavigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual({
        platform: 'macOS',
        cpuClass: 'Apple Silicon',
        architecture: '',
        oscpu: 'Mac OS X; Intel',
        hardwareConcurrency: 8,
        deviceMemory: 16,
      });
    });

    it('should collect complete hardware fingerprint for Linux ARM system', async () => {
      // Arrange
      mockNavigator.userAgentData = { platform: 'Linux' };
      mockNavigator.cpuClass = 'ARM';
      mockNavigator.hardwareConcurrency = 4;
      mockNavigator.deviceMemory = 8;
      mockNavigator.userAgent = 'Mozilla/5.0 (X11; Linux aarch64)';

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual({
        platform: 'Linux',
        cpuClass: 'ARM',
        architecture: 'arm64',
        oscpu: 'Linux; aarch64',
        hardwareConcurrency: 4,
        deviceMemory: 8,
      });
    });

    it('should collect complete hardware fingerprint for Android system', async () => {
      // Arrange
      mockNavigator.userAgentData = { platform: 'Android' };
      mockNavigator.cpuClass = 'Qualcomm';
      mockNavigator.hardwareConcurrency = 8;
      mockNavigator.deviceMemory = 6;
      mockNavigator.userAgent = 'Mozilla/5.0 (Linux; Android 11; SM-G991B)';

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual({
        platform: 'Android',
        cpuClass: 'Qualcomm',
        architecture: '',
        oscpu: 'Linux',
        hardwareConcurrency: 8,
        deviceMemory: 6,
      });
    });

    it('should collect complete hardware fingerprint for iOS system', async () => {
      // Arrange
      mockNavigator.userAgentData = { platform: 'iOS' };
      mockNavigator.cpuClass = 'Apple A14';
      mockNavigator.hardwareConcurrency = 6;
      mockNavigator.deviceMemory = 4;
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)';

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual({
        platform: 'iOS',
        cpuClass: 'Apple A14',
        architecture: '',
        oscpu: '',
        hardwareConcurrency: 6,
        deviceMemory: 4,
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing navigator properties gracefully', async () => {
      // Arrange
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual({
        platform: '',
        cpuClass: '',
        architecture: '',
        oscpu: '',
        hardwareConcurrency: '',
        deviceMemory: '',
      });

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
      });
    });

    it('should handle undefined navigator gracefully', async () => {
      // Arrange
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual({
        platform: '',
        cpuClass: '',
        architecture: '',
        oscpu: '',
        hardwareConcurrency: '',
        deviceMemory: '',
      });

      // Restore navigator for other tests
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true,
      });
    });

    it('should handle mixed data types and edge values', async () => {
      // Arrange
      mockNavigator.userAgentData = { platform: 'Windows' };
      mockNavigator.cpuClass = '  Intel x86  '; // With whitespace
      mockNavigator.hardwareConcurrency = 0;
      mockNavigator.deviceMemory = 0.5;
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win32; i686)';

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual({
        platform: 'Windows',
        cpuClass: 'Intel x86', // Should be trimmed
        architecture: 'x86',
        oscpu: 'Windows NT 10.0; Win32; x86',
        hardwareConcurrency: '',
        deviceMemory: 0.5,
      });
    });
  });

  describe('Individual Module Function Tests', () => {
    it('should test collectPlatform function independently', () => {
      // Arrange
      mockNavigator.userAgentData = { platform: 'Test Platform' };

      // Act
      const result = collectPlatform();

      // Assert
      expect(result).toEqual({ platform: 'Test Platform' });
    });

    it('should test collectCpuClass function independently', () => {
      // Arrange
      mockNavigator.cpuClass = 'Test CPU';

      // Act
      const result = collectCpuClass();

      // Assert
      expect(result).toEqual({ cpuClass: 'Test CPU' });
    });

    it('should test collectHardwareConcurrency function independently', () => {
      // Arrange
      mockNavigator.hardwareConcurrency = 12;

      // Act
      const result = collectHardwareConcurrency();

      // Assert
      expect(result).toEqual({ hardwareConcurrency: 12 });
    });

    it('should test collectDeviceMemory function independently', () => {
      // Arrange
      mockNavigator.deviceMemory = 24;

      // Act
      const result = collectDeviceMemory();

      // Assert
      expect(result).toEqual({ deviceMemory: 24 });
    });

    it('should test collectOSCpu function independently', () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

      // Act
      const result = collectOSCpu();

      // Assert
      expect(result).toEqual({ oscpu: 'Windows NT 10.0; Win64; x64' });
    });

    it('should test collectArchitecture function independently', async () => {
      // Arrange
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

      // Act
      const result = await collectArchitecture();

      // Assert
      expect(result).toEqual({ architecture: 'x86_64' });
    });
  });
});
