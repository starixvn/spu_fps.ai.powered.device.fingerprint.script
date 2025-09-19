import { HardwareFingerprint } from '../../../../../../src/client/fingerprint/modules/hardware';

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
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock return values
    mockCollectPlatform.mockReturnValue({ platform: 'Windows' });
    mockCollectCpuClass.mockReturnValue({ cpuClass: 'Intel x86' });
    mockCollectArchitecture.mockReturnValue({ architecture: 255 });  // Changed to number
    mockCollectOSCpu.mockResolvedValue({ oscpu: 'Windows NT 10.0; Win64; x64' });
    mockCollectHardwareConcurrency.mockResolvedValue({ hardwareConcurrency: 8 });
    mockCollectDeviceMemory.mockResolvedValue({ deviceMemory: 16 });  // Changed to Promise
  });

  describe('HardwareFingerprint.collect', () => {
    it('should collect all hardware attributes successfully', async () => {
      // Arrange
      const expectedResult = {
        platform: 'Windows',
        cpuClass: 'Intel x86',
        architecture: 255,  // Changed to number
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
      mockCollectArchitecture.mockReturnValue({ architecture: 0 });  // Changed to number
      mockCollectOSCpu.mockResolvedValue({ oscpu: '' });
      mockCollectHardwareConcurrency.mockResolvedValue({ hardwareConcurrency: '' });
      mockCollectDeviceMemory.mockResolvedValue({ deviceMemory: '' });

      const expectedResult = {
        platform: '',
        cpuClass: '',
        architecture: 0,  // Changed to number
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
      mockCollectArchitecture.mockReturnValue({ architecture: 255 });  // Changed to number
      mockCollectOSCpu.mockResolvedValue({ oscpu: '' });
      mockCollectHardwareConcurrency.mockResolvedValue({ hardwareConcurrency: '' });  // Changed
      mockCollectDeviceMemory.mockResolvedValue({ deviceMemory: '' });

      const expectedResult = {
        platform: 'Linux',
        cpuClass: '',
        architecture: 255,  // Changed to number
        oscpu: '',
        hardwareConcurrency: '',  // Changed
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
      mockCollectArchitecture.mockReturnValue({ architecture: 255 });  // Changed to number
      mockCollectOSCpu.mockResolvedValue({ oscpu: '' });  // Changed
      mockCollectHardwareConcurrency.mockResolvedValue({ hardwareConcurrency: '' });  // Changed
      mockCollectDeviceMemory.mockResolvedValue({ deviceMemory: '' });  // Changed

      const expectedResult = {
        platform: 'MacOS',
        cpuClass: 'Apple Silicon',
        architecture: 255,  // Changed to number
        oscpu: '',  // Changed
        hardwareConcurrency: '',  // Changed
        deviceMemory: '',  // Changed
      };

      // Act
      const result = await HardwareFingerprint.collect();

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should handle error in individual collectors gracefully', async () => {
      // Arrange
      mockCollectArchitecture.mockImplementation(() => {
        throw new Error('API not supported');
      });

      // When any collector throws, the entire collect() should throw the error
      // Act & Assert
      await expect(HardwareFingerprint.collect()).rejects.toThrow('API not supported');
      
      expect(mockCollectPlatform).toHaveBeenCalledTimes(1);
      expect(mockCollectCpuClass).toHaveBeenCalledTimes(1);
      expect(mockCollectArchitecture).toHaveBeenCalledTimes(1);
      // When collectArchitecture throws, subsequent collectors are not called
      expect(mockCollectOSCpu).toHaveBeenCalledTimes(0);
      expect(mockCollectHardwareConcurrency).toHaveBeenCalledTimes(0);
      expect(mockCollectDeviceMemory).toHaveBeenCalledTimes(0);
    });

    it('should handle multiple errors in collectors gracefully', async () => {
      // Arrange
      mockCollectPlatform.mockImplementation(() => {
        throw new Error('Platform API error');
      });
      mockCollectArchitecture.mockImplementation(() => {
        throw new Error('Architecture API error');
      });

      // When any collector throws, the entire collect() should throw the first error encountered
      // Act & Assert
      await expect(HardwareFingerprint.collect()).rejects.toThrow('Platform API error');
      
      expect(mockCollectPlatform).toHaveBeenCalledTimes(1);
      // When collectPlatform throws, subsequent collectors are not called
      expect(mockCollectCpuClass).toHaveBeenCalledTimes(0);
      expect(mockCollectArchitecture).toHaveBeenCalledTimes(0);
      expect(mockCollectOSCpu).toHaveBeenCalledTimes(0);
      expect(mockCollectHardwareConcurrency).toHaveBeenCalledTimes(0);
      expect(mockCollectDeviceMemory).toHaveBeenCalledTimes(0);
    });

    it('should handle all collectors failing gracefully', async () => {
      // Arrange
      mockCollectPlatform.mockImplementation(() => {
        throw new Error('Platform API error');
      });
      mockCollectCpuClass.mockImplementation(() => {
        throw new Error('CPU Class API error');
      });
      mockCollectArchitecture.mockImplementation(() => {
        throw new Error('Architecture API error');
      });
      mockCollectOSCpu.mockImplementation(() => {
        return Promise.reject(new Error('OS CPU API error')); // Changed to properly reject
      });
      mockCollectHardwareConcurrency.mockImplementation(() => {
        throw new Error('Hardware Concurrency API error');
      });
      mockCollectDeviceMemory.mockImplementation(() => {
        throw new Error('Device Memory API error');
      });

      // When any collector throws, the entire collect() should throw the first error encountered
      // Act & Assert
      await expect(HardwareFingerprint.collect()).rejects.toThrow('Platform API error');
    });

    it('should call collectors in the correct order', async () => {
      // Arrange
      const callOrder: string[] = [];
      
      mockCollectPlatform.mockImplementation(() => {
        callOrder.push('platform');
        return { platform: 'Windows' }; // Fixed: use correct property name
      });
      mockCollectCpuClass.mockImplementation(() => {
        callOrder.push('cpuClass');
        return { cpuClass: 'Intel x86' }; // Fixed: use correct property name
      });
      mockCollectArchitecture.mockImplementation(() => {
        callOrder.push('architecture');
        return { architecture: 255 }; // Fixed: use correct property name
      });
      mockCollectOSCpu.mockImplementation(async () => {
        callOrder.push('oscpu');
        return { oscpu: 'Windows NT 10.0; Win64; x64' }; // Fixed: use correct property name
      });
      mockCollectHardwareConcurrency.mockImplementation(async () => {
        callOrder.push('hardwareConcurrency');
        return { hardwareConcurrency: 8 }; // Fixed: use correct property name
      });
      mockCollectDeviceMemory.mockImplementation(async () => {
        callOrder.push('deviceMemory');
        return { deviceMemory: 16 }; // Fixed: use correct property name
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
      mockCollectArchitecture.mockReturnValue({ architecture: 0 });  // Changed to valid number
      mockCollectOSCpu.mockResolvedValue({ oscpu: undefined as any });
      mockCollectHardwareConcurrency.mockResolvedValue({ hardwareConcurrency: null as any });
      mockCollectDeviceMemory.mockResolvedValue({ deviceMemory: undefined as any });

      const expectedResult = {
        platform: '',
        cpuClass: '',
        architecture: 0,  // Changed to number
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