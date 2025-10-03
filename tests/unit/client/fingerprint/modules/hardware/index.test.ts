import { HardwareFingerprint } from '../../../../../../src/client/fingerprint/modules/hardware';
import { FingerprintSpecialValue } from '../../../../../../src/client/fingerprint/utils/consts';

// Mock all hardware modules
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/platform');
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/cpuClass');
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/architecture');
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/osCpu');
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/hardwareConcurrency');
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/deviceMemory');

const mockCollectPlatform = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/platform').collectPlatform);
const mockCollectCpuClass = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/cpuClass').collectCpuClass);
const mockCollectArchitecture = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/architecture').collectArchitecture);
const mockCollectOSCpu = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/osCpu').collectOSCpu);
const mockCollectHardwareConcurrency = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/hardwareConcurrency').collectHardwareConcurrency);
const mockCollectDeviceMemory = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/deviceMemory').collectDeviceMemory);

describe('Hardware Fingerprint Module', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('HardwareFingerprint.collect', () => {
    it('should collect complete hardware information successfully', async () => {
      // Arrange
      const mockPlatformResult = 'Win32';
      const mockCpuClassResult = 'x86';
      const mockArchitectureResult = 255;
      const mockOSCpuResult = 'Windows NT 10.0; Win64; x64';
      const mockHardwareConcurrencyResult = 8;
      const mockDeviceMemoryResult = 8;

      mockCollectPlatform.mockReturnValue(mockPlatformResult);
      mockCollectCpuClass.mockReturnValue(mockCpuClassResult);
      mockCollectArchitecture.mockReturnValue(mockArchitectureResult);
      mockCollectOSCpu.mockResolvedValue(mockOSCpuResult);
      mockCollectHardwareConcurrency.mockResolvedValue(mockHardwareConcurrencyResult);
      mockCollectDeviceMemory.mockResolvedValue(mockDeviceMemoryResult);

      const expectedResult = {
        platform: 'Win32',
        cpuClass: 'x86',
        architecture: 255,
        oscpu: 'Windows NT 10.0; Win64; x64',
        hardwareConcurrency: 8,
        deviceMemory: 8,
      };

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockCollectPlatform).toHaveBeenCalledTimes(1);
      expect(mockCollectCpuClass).toHaveBeenCalledTimes(1);
      expect(mockCollectArchitecture).toHaveBeenCalledTimes(1);
      expect(mockCollectOSCpu).toHaveBeenCalledTimes(1);
      expect(mockCollectHardwareConcurrency).toHaveBeenCalledTimes(1);
      expect(mockCollectDeviceMemory).toHaveBeenCalledTimes(1);
    });

    it('should handle mixed valid and invalid values from collectors', async () => {
      // Arrange
      mockCollectPlatform.mockReturnValue('Linux x86_64');
      mockCollectCpuClass.mockReturnValue(FingerprintSpecialValue.UNDEFINED);
      mockCollectArchitecture.mockReturnValue(255);
      mockCollectOSCpu.mockResolvedValue('Linux x86_64');
      mockCollectHardwareConcurrency.mockResolvedValue(FingerprintSpecialValue.UNDEFINED);
      mockCollectDeviceMemory.mockResolvedValue(16);

      const expectedResult = {
        platform: 'Linux x86_64',
        cpuClass: FingerprintSpecialValue.UNDEFINED,
        architecture: 255,
        oscpu: 'Linux x86_64',
        hardwareConcurrency: FingerprintSpecialValue.UNDEFINED,
        deviceMemory: 16,
      };

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle all special values from collectors', async () => {
      // Arrange
      mockCollectPlatform.mockReturnValue(FingerprintSpecialValue.UNDEFINED);
      mockCollectCpuClass.mockReturnValue(FingerprintSpecialValue.UNDEFINED);
      mockCollectArchitecture.mockReturnValue(FingerprintSpecialValue.ERROR);
      mockCollectOSCpu.mockResolvedValue(FingerprintSpecialValue.UNDEFINED);
      mockCollectHardwareConcurrency.mockResolvedValue(FingerprintSpecialValue.TIMEOUT);
      mockCollectDeviceMemory.mockResolvedValue(FingerprintSpecialValue.UNDEFINED);

      const expectedResult = {
        platform: FingerprintSpecialValue.UNDEFINED,
        cpuClass: FingerprintSpecialValue.UNDEFINED,
        architecture: FingerprintSpecialValue.ERROR,
        oscpu: FingerprintSpecialValue.UNDEFINED,
        hardwareConcurrency: FingerprintSpecialValue.TIMEOUT,
        deviceMemory: FingerprintSpecialValue.UNDEFINED,
      };

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors from individual collectors gracefully', async () => {
      // Arrange
      mockCollectPlatform.mockReturnValue({ platform: 'Darwin' });
      mockCollectCpuClass.mockImplementation(() => {
        throw new Error('CPU Class collection failed');
      });
      mockCollectArchitecture.mockReturnValue({ architecture: 255 });
      mockCollectOSCpu.mockRejectedValue(new Error('OS CPU collection failed'));
      mockCollectHardwareConcurrency.mockResolvedValue({ hardwareConcurrency: 4 });
      mockCollectDeviceMemory.mockResolvedValue({ deviceMemory: 8 });

      // Act & Assert
      await expect(HardwareFingerprint.collect()).rejects.toThrow();
    });

    it('should maintain proper data types for all collectors', async () => {
      // Arrange
      mockCollectPlatform.mockReturnValue('Win32');
      mockCollectCpuClass.mockReturnValue('x86');
      mockCollectArchitecture.mockReturnValue(255);
      mockCollectOSCpu.mockResolvedValue('Windows NT 10.0; Win64; x64');
      mockCollectHardwareConcurrency.mockResolvedValue(8);
      mockCollectDeviceMemory.mockResolvedValue(16);

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(typeof result.platform).toBe('string');
      expect(typeof result.cpuClass).toBe('string');
      expect(typeof result.architecture).toBe('number');
      expect(typeof result.oscpu).toBe('string');
      expect(typeof result.hardwareConcurrency).toBe('number');
      expect(typeof result.deviceMemory).toBe('number');
    });

    it('should handle asynchronous collectors properly', async () => {
      // Arrange
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      mockCollectPlatform.mockReturnValue('Darwin');
      mockCollectCpuClass.mockReturnValue('x64');
      mockCollectArchitecture.mockReturnValue(255);
      mockCollectOSCpu.mockImplementation(async () => {
        await delay(10);
        return 'macOS';
      });
      mockCollectHardwareConcurrency.mockImplementation(async () => {
        await delay(5);
        return 8;
      });
      mockCollectDeviceMemory.mockImplementation(async () => {
        await delay(15);
        return 16;
      });

      const startTime = Date.now();

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(15); // Should take at least 15ms due to the longest delay
      
      expect(result).toEqual({
        platform: 'Darwin',
        cpuClass: 'x64',
        architecture: 255,
        oscpu: 'macOS',
        hardwareConcurrency: 8,
        deviceMemory: 16,
      });
    });

    it('should return the exact structure from individual collectors', async () => {
      // Arrange
      const mockResults = {
        platform: 'Test Platform',
        cpuClass: 'Test CPU',
        architecture: 128,
        oscpu: 'Test OS',
        hardwareConcurrency: 16,
        deviceMemory: 32,
      };

      mockCollectPlatform.mockReturnValue(mockResults.platform);
      mockCollectCpuClass.mockReturnValue(mockResults.cpuClass);
      mockCollectArchitecture.mockReturnValue(mockResults.architecture);
      mockCollectOSCpu.mockResolvedValue(mockResults.oscpu);
      mockCollectHardwareConcurrency.mockResolvedValue(mockResults.hardwareConcurrency);
      mockCollectDeviceMemory.mockResolvedValue(mockResults.deviceMemory);

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result.platform).toBe(mockResults.platform);
      expect(result.cpuClass).toBe(mockResults.cpuClass);
      expect(result.architecture).toBe(mockResults.architecture);
      expect(result.oscpu).toBe(mockResults.oscpu);
      expect(result.hardwareConcurrency).toBe(mockResults.hardwareConcurrency);
      expect(result.deviceMemory).toBe(mockResults.deviceMemory);
    });

    it('should handle special fingerprint values correctly', async () => {
      // Arrange
      const specialValues = [
        FingerprintSpecialValue.UNDEFINED,
        FingerprintSpecialValue.ERROR,
        FingerprintSpecialValue.TIMEOUT,
      ];

      for (const specialValue of specialValues) {
        mockCollectPlatform.mockReturnValue(specialValue);
        mockCollectCpuClass.mockReturnValue(specialValue);
        mockCollectArchitecture.mockReturnValue(specialValue);
        mockCollectOSCpu.mockResolvedValue(specialValue);
        mockCollectHardwareConcurrency.mockResolvedValue(specialValue);
        mockCollectDeviceMemory.mockResolvedValue(specialValue);

        // Act
        const result = await HardwareFingerprint.collect();

        // Assert
        expect(result.platform).toBe(specialValue);
        expect(result.cpuClass).toBe(specialValue);
        expect(result.architecture).toBe(specialValue);
        expect(result.oscpu).toBe(specialValue);
        expect(result.hardwareConcurrency).toBe(specialValue);
        expect(result.deviceMemory).toBe(specialValue);
      }
    });
  });
});