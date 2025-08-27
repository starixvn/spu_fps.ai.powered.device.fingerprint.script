import { HardwareFingerprint } from '../../../../../../src/client/fingerprint/modules/hardware';

// Mock all hardware modules
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/platform');
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/cpu_class');
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/architecture');
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/os_cpu');
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/hardware_concurrency');
jest.mock('../../../../../../src/client/fingerprint/modules/hardware/device_memory');

const mockCollectPlatform = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/platform').collectPlatform);
const mockCollectCpuClass = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/cpu_class').collectCpuClass);
const mockCollectArchitecture = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/architecture').collectArchitecture);
const mockCollectOSCpu = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/os_cpu').collectOSCpu);
const mockCollectHardwareConcurrency = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/hardware_concurrency').collectHardwareConcurrency);
const mockCollectDeviceMemory = jest.mocked(require('../../../../../../src/client/fingerprint/modules/hardware/device_memory').collectDeviceMemory);

describe('Hardware Fingerprint Module', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock return values
    mockCollectPlatform.mockReturnValue({ platform: 'Windows' });
    mockCollectCpuClass.mockReturnValue({ cpuClass: 'Intel x86' });
    mockCollectArchitecture.mockResolvedValue({ architecture: 'x86_64' });
    mockCollectOSCpu.mockReturnValue({ oscpu: 'Windows NT 10.0; Win64; x64' });
    mockCollectHardwareConcurrency.mockReturnValue({ hardwareConcurrency: 8 });
    mockCollectDeviceMemory.mockReturnValue({ deviceMemory: 16 });
  });

  describe('HardwareFingerprint.collect', () => {
    it('should collect all hardware attributes successfully', async () => {
      // Arrange
      const expectedResult = {
        platform: 'Windows',
        cpuClass: 'Intel x86',
        architecture: 'x86_64',
        oscpu: 'Windows NT 10.0; Win64; x64',
        hardwareConcurrency: 8,
        deviceMemory: 16,
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

    it('should handle empty values from individual collectors', async () => {
      // Arrange
      mockCollectPlatform.mockReturnValue({ platform: '' });
      mockCollectCpuClass.mockReturnValue({ cpuClass: '' });
      mockCollectArchitecture.mockResolvedValue({ architecture: '' });
      mockCollectOSCpu.mockReturnValue({ oscpu: '' });
      mockCollectHardwareConcurrency.mockReturnValue({ hardwareConcurrency: '' });
      mockCollectDeviceMemory.mockReturnValue({ deviceMemory: '' });

      const expectedResult = {
        platform: '',
        cpuClass: '',
        architecture: '',
        oscpu: '',
        hardwareConcurrency: '',
        deviceMemory: '',
      };

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle mixed empty and non-empty values', async () => {
      // Arrange
      mockCollectPlatform.mockReturnValue({ platform: 'Linux' });
      mockCollectCpuClass.mockReturnValue({ cpuClass: '' });
      mockCollectArchitecture.mockResolvedValue({ architecture: 'arm64' });
      mockCollectOSCpu.mockReturnValue({ oscpu: '' });
      mockCollectHardwareConcurrency.mockReturnValue({ hardwareConcurrency: 4 });
      mockCollectDeviceMemory.mockReturnValue({ deviceMemory: '' });

      const expectedResult = {
        platform: 'Linux',
        cpuClass: '',
        architecture: 'arm64',
        oscpu: '',
        hardwareConcurrency: 4,
        deviceMemory: '',
      };

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle different data types correctly', async () => {
      // Arrange
      mockCollectPlatform.mockReturnValue({ platform: 'MacOS' });
      mockCollectCpuClass.mockReturnValue({ cpuClass: 'Apple Silicon' });
      mockCollectArchitecture.mockResolvedValue({ architecture: 'arm64' });
      mockCollectOSCpu.mockReturnValue({ oscpu: 'Mac OS X; Intel' });
      mockCollectHardwareConcurrency.mockReturnValue({ hardwareConcurrency: '16' });
      mockCollectDeviceMemory.mockReturnValue({ deviceMemory: 32.5 });

      const expectedResult = {
        platform: 'MacOS',
        cpuClass: 'Apple Silicon',
        architecture: 'arm64',
        oscpu: 'Mac OS X; Intel',
        hardwareConcurrency: '16',
        deviceMemory: 32.5,
      };

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle error in individual collectors gracefully', async () => {
      // Arrange
      mockCollectArchitecture.mockRejectedValue(new Error('API not supported'));

      const expectedResult = {
        platform: 'Windows',
        cpuClass: 'Intel x86',
        architecture: '',
        oscpu: 'Windows NT 10.0; Win64; x64',
        hardwareConcurrency: 8,
        deviceMemory: 16,
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

    it('should handle multiple errors in collectors gracefully', async () => {
      // Arrange
      mockCollectPlatform.mockImplementation(() => {
        throw new Error('Platform API error');
      });
      mockCollectArchitecture.mockRejectedValue(new Error('Architecture API error'));

      const expectedResult = {
        platform: '',
        cpuClass: 'Intel x86',
        architecture: '',
        oscpu: 'Windows NT 10.0; Win64; x64',
        hardwareConcurrency: 8,
        deviceMemory: 16,
      };

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle all collectors failing gracefully', async () => {
      // Arrange
      mockCollectPlatform.mockImplementation(() => {
        throw new Error('Platform API error');
      });
      mockCollectCpuClass.mockImplementation(() => {
        throw new Error('CPU Class API error');
      });
      mockCollectArchitecture.mockRejectedValue(new Error('Architecture API error'));
      mockCollectOSCpu.mockImplementation(() => {
        throw new Error('OS CPU API error');
      });
      mockCollectHardwareConcurrency.mockImplementation(() => {
        throw new Error('Hardware Concurrency API error');
      });
      mockCollectDeviceMemory.mockImplementation(() => {
        throw new Error('Device Memory API error');
      });

      const expectedResult = {
        platform: '',
        cpuClass: '',
        architecture: '',
        oscpu: '',
        hardwareConcurrency: '',
        deviceMemory: '',
      };

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should call collectors in the correct order', async () => {
      // Arrange
      const callOrder: string[] = [];
      
      mockCollectPlatform.mockImplementation(() => {
        callOrder.push('platform');
        return { platform: 'Windows' };
      });
      mockCollectCpuClass.mockImplementation(() => {
        callOrder.push('cpuClass');
        return { cpuClass: 'Intel x86' };
      });
      mockCollectArchitecture.mockImplementation(async () => {
        callOrder.push('architecture');
        return { architecture: 'x86_64' };
      });
      mockCollectOSCpu.mockImplementation(() => {
        callOrder.push('oscpu');
        return { oscpu: 'Windows NT 10.0; Win64; x64' };
      });
      mockCollectHardwareConcurrency.mockImplementation(() => {
        callOrder.push('hardwareConcurrency');
        return { hardwareConcurrency: 8 };
      });
      mockCollectDeviceMemory.mockImplementation(() => {
        callOrder.push('deviceMemory');
        return { deviceMemory: 16 };
      });

      // Act
      await HardwareFingerprint.collect();

      // Assert
      expect(callOrder).toEqual([
        'platform',
        'cpuClass', 
        'architecture',
        'oscpu',
        'hardwareConcurrency',
        'deviceMemory'
      ]);
    });

    it('should handle null and undefined values from collectors', async () => {
      // Arrange
      mockCollectPlatform.mockReturnValue({ platform: null as any });
      mockCollectCpuClass.mockReturnValue({ cpuClass: undefined as any });
      mockCollectArchitecture.mockResolvedValue({ architecture: null as any });
      mockCollectOSCpu.mockReturnValue({ oscpu: undefined as any });
      mockCollectHardwareConcurrency.mockReturnValue({ hardwareConcurrency: null as any });
      mockCollectDeviceMemory.mockReturnValue({ deviceMemory: undefined as any });

      const expectedResult = {
        platform: '',
        cpuClass: '',
        architecture: '',
        oscpu: '',
        hardwareConcurrency: '',
        deviceMemory: '',
      };

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
});
