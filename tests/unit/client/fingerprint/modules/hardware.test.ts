import { HardwareFingerprint } from '../../../../../src/client/fingerprint/modules/hardware';

// Mock navigator properties
const mockNavigator = {
  deviceMemory: 8,
  hardwareConcurrency: 4,
  maxTouchPoints: 0,
  cpuClass: 'x86',
  oscpu: 'Intel Mac OS X 10_15_7',
  buildID: '20230815123456'
};

// Mock screen properties
const mockScreen = {
  width: 1920,
  height: 1080,
  availWidth: 1920,
  availHeight: 1050,
  colorDepth: 24,
  pixelDepth: 24
};

describe('HardwareFingerprint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup global navigator mock
    Object.defineProperty(global, 'navigator', {
      value: { ...mockNavigator },
      writable: true,
      configurable: true
    });
    
    // Setup global screen mock
    Object.defineProperty(global, 'screen', {
      value: { ...mockScreen },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // Clean up global mocks
    delete (global as any).navigator;
    delete (global as any).screen;
  });

  describe('collect', () => {
    it('should return complete hardware fingerprint data structure', () => {
      const result = HardwareFingerprint.collect();

      expect(result).toHaveProperty('deviceMemory');
      expect(result).toHaveProperty('hardwareConcurrency');
      expect(result).toHaveProperty('maxTouchPoints');
      expect(result).toHaveProperty('colorDepth');
      expect(result).toHaveProperty('pixelDepth');
      expect(result).toHaveProperty('screen');
      expect(result).toHaveProperty('cpuClass');
      expect(result).toHaveProperty('oscpu');
      expect(result).toHaveProperty('buildID');
    });

    it('should collect device memory information', () => {
      const result = HardwareFingerprint.collect();

      expect(result.deviceMemory).toBe(8);
    });

    it('should collect hardware concurrency information', () => {
      const result = HardwareFingerprint.collect();

      expect(result.hardwareConcurrency).toBe(4);
    });

    it('should collect touch capabilities', () => {
      const result = HardwareFingerprint.collect();

      expect(result.maxTouchPoints).toBe(0);
    });

    it('should collect screen color information', () => {
      const result = HardwareFingerprint.collect();

      expect(result.colorDepth).toBe(24);
      expect(result.pixelDepth).toBe(24);
    });

    it('should collect CPU information', () => {
      const result = HardwareFingerprint.collect();

      expect(result.cpuClass).toBe('x86');
      expect(result.oscpu).toBe('Intel Mac OS X 10_15_7');
      expect(result.buildID).toBe('20230815123456');
    });

    it('should collect detailed screen information', () => {
      const result = HardwareFingerprint.collect();

      expect(result.screen).toEqual({
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1050,
        colorDepth: 24,
        pixelDepth: 24
      });
    });
  });

  describe('device memory handling', () => {
    it('should return -1 when deviceMemory is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator, deviceMemory: undefined },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.deviceMemory).toBe(-1);
    });

    it('should handle different device memory values', () => {
      const memoryValues = [1, 2, 4, 8, 16, 32];

      memoryValues.forEach(memory => {
        Object.defineProperty(global, 'navigator', {
          value: { ...mockNavigator, deviceMemory: memory },
          writable: true,
          configurable: true
        });

        const result = HardwareFingerprint.collect();
        expect(result.deviceMemory).toBe(memory);
      });
    });

    it('should handle fractional device memory values', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator, deviceMemory: 0.5 },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.deviceMemory).toBe(0.5);
    });
  });

  describe('hardware concurrency handling', () => {
    it('should return -1 when hardwareConcurrency is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator, hardwareConcurrency: undefined },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.hardwareConcurrency).toBe(-1);
    });

    it('should handle different CPU core counts', () => {
      const coreValues = [1, 2, 4, 6, 8, 12, 16, 24, 32];

      coreValues.forEach(cores => {
        Object.defineProperty(global, 'navigator', {
          value: { ...mockNavigator, hardwareConcurrency: cores },
          writable: true,
          configurable: true
        });

        const result = HardwareFingerprint.collect();
        expect(result.hardwareConcurrency).toBe(cores);
      });
    });

    it('should handle zero hardware concurrency', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator, hardwareConcurrency: 0 },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.hardwareConcurrency).toBe(0);
    });
  });

  describe('touch capabilities handling', () => {
    it('should return 0 when maxTouchPoints is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator, maxTouchPoints: undefined },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.maxTouchPoints).toBe(0);
    });

    it('should handle different touch point values', () => {
      const touchValues = [0, 1, 2, 5, 10];

      touchValues.forEach(touchPoints => {
        Object.defineProperty(global, 'navigator', {
          value: { ...mockNavigator, maxTouchPoints: touchPoints },
          writable: true,
          configurable: true
        });

        const result = HardwareFingerprint.collect();
        expect(result.maxTouchPoints).toBe(touchPoints);
      });
    });
  });

  describe('CPU information handling', () => {
    it('should return "unknown" when cpuClass is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator, cpuClass: undefined },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.cpuClass).toBe('unknown');
    });

    it('should return "unknown" when oscpu is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator, oscpu: undefined },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.oscpu).toBe('unknown');
    });

    it('should return "unknown" when buildID is not available', () => {
      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator, buildID: undefined },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.buildID).toBe('unknown');
    });

    it('should handle different CPU architectures', () => {
      const cpuClasses = ['x86', 'x64', 'ARM', 'ARM64', 'PowerPC'];

      cpuClasses.forEach(cpuClass => {
        Object.defineProperty(global, 'navigator', {
          value: { ...mockNavigator, cpuClass },
          writable: true,
          configurable: true
        });

        const result = HardwareFingerprint.collect();
        expect(result.cpuClass).toBe(cpuClass);
      });
    });

    it('should handle different operating systems', () => {
      const oscpuValues = [
        'Intel Mac OS X 10_15_7',
        'Windows NT 10.0; Win64; x64',
        'Linux x86_64',
        'FreeBSD amd64'
      ];

      oscpuValues.forEach(oscpu => {
        Object.defineProperty(global, 'navigator', {
          value: { ...mockNavigator, oscpu },
          writable: true,
          configurable: true
        });

        const result = HardwareFingerprint.collect();
        expect(result.oscpu).toBe(oscpu);
      });
    });

    it('should handle different build IDs', () => {
      const buildIDs = [
        '20230815123456',
        '20230601000000',
        '2023-08-15-release',
        ''
      ];

      buildIDs.forEach(buildID => {
        Object.defineProperty(global, 'navigator', {
          value: { ...mockNavigator, buildID },
          writable: true,
          configurable: true
        });

        const result = HardwareFingerprint.collect();
        expect(result.buildID).toBe(buildID || 'unknown');
      });
    });
  });

  describe('screen information handling', () => {
    it('should collect all screen dimensions', () => {
      const result = HardwareFingerprint.collect();

      expect(result.screen.width).toBe(1920);
      expect(result.screen.height).toBe(1080);
      expect(result.screen.availWidth).toBe(1920);
      expect(result.screen.availHeight).toBe(1050);
    });

    it('should handle different screen resolutions', () => {
      const screenConfigs = [
        { width: 1024, height: 768, availWidth: 1024, availHeight: 738 },
        { width: 1366, height: 768, availWidth: 1366, availHeight: 738 },
        { width: 1920, height: 1080, availWidth: 1920, availHeight: 1050 },
        { width: 2560, height: 1440, availWidth: 2560, availHeight: 1410 },
        { width: 3840, height: 2160, availWidth: 3840, availHeight: 2130 }
      ];

      screenConfigs.forEach(config => {
        Object.defineProperty(global, 'screen', {
          value: { ...mockScreen, ...config },
          writable: true,
          configurable: true
        });

        const result = HardwareFingerprint.collect();
        expect(result.screen.width).toBe(config.width);
        expect(result.screen.height).toBe(config.height);
        expect(result.screen.availWidth).toBe(config.availWidth);
        expect(result.screen.availHeight).toBe(config.availHeight);
      });
    });

    it('should handle different color depths', () => {
      const colorDepths = [8, 16, 24, 32];

      colorDepths.forEach(colorDepth => {
        Object.defineProperty(global, 'screen', {
          value: { ...mockScreen, colorDepth, pixelDepth: colorDepth },
          writable: true,
          configurable: true
        });

        const result = HardwareFingerprint.collect();
        expect(result.screen.colorDepth).toBe(colorDepth);
        expect(result.screen.pixelDepth).toBe(colorDepth);
        expect(result.colorDepth).toBe(colorDepth);
        expect(result.pixelDepth).toBe(colorDepth);
      });
    });

    it('should handle mobile screen configurations', () => {
      // Mobile portrait
      Object.defineProperty(global, 'screen', {
        value: {
          width: 375,
          height: 812,
          availWidth: 375,
          availHeight: 778,
          colorDepth: 24,
          pixelDepth: 24
        },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.screen.width).toBe(375);
      expect(result.screen.height).toBe(812);
      expect(result.screen.availWidth).toBe(375);
      expect(result.screen.availHeight).toBe(778);
    });
  });

  describe('browser compatibility and edge cases', () => {
    it('should handle missing navigator object', () => {
      delete (global as any).navigator;

      // This would cause errors in real implementation, but let's test graceful handling
      expect(() => {
        HardwareFingerprint.collect();
      }).toThrow();
    });

    it('should handle missing screen object', () => {
      delete (global as any).screen;

      // This would cause errors in real implementation, but let's test graceful handling
      expect(() => {
        HardwareFingerprint.collect();
      }).toThrow();
    });

    it('should handle partial navigator properties', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          // Only some properties available
          hardwareConcurrency: 4,
          maxTouchPoints: 0
          // deviceMemory, cpuClass, oscpu, buildID missing
        },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.deviceMemory).toBe(-1);
      expect(result.hardwareConcurrency).toBe(4);
      expect(result.maxTouchPoints).toBe(0);
      expect(result.cpuClass).toBe('unknown');
      expect(result.oscpu).toBe('unknown');
      expect(result.buildID).toBe('unknown');
    });

    it('should handle null and undefined values correctly', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          deviceMemory: null,
          hardwareConcurrency: null,
          maxTouchPoints: null,
          cpuClass: null,
          oscpu: null,
          buildID: null
        },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.deviceMemory).toBe(-1);
      expect(result.hardwareConcurrency).toBe(-1);
      expect(result.maxTouchPoints).toBe(0);
      expect(result.cpuClass).toBe('unknown');
      expect(result.oscpu).toBe('unknown');
      expect(result.buildID).toBe('unknown');
    });

    it('should handle extreme values', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          deviceMemory: 1024, // Very high memory
          hardwareConcurrency: 128, // Very high core count
          maxTouchPoints: 255, // Very high touch points
          cpuClass: 'unknown-architecture',
          oscpu: 'Very Long Operating System Name With Lots Of Details',
          buildID: '9'.repeat(100) // Very long build ID
        },
        writable: true,
        configurable: true
      });

      const result = HardwareFingerprint.collect();

      expect(result.deviceMemory).toBe(1024);
      expect(result.hardwareConcurrency).toBe(128);
      expect(result.maxTouchPoints).toBe(255);
      expect(result.cpuClass).toBe('unknown-architecture');
      expect(result.oscpu).toBe('Very Long Operating System Name With Lots Of Details');
      expect(result.buildID).toBe('9'.repeat(100));
    });
  });

  describe('data consistency and uniqueness', () => {
    it('should return consistent results for same hardware', () => {
      const result1 = HardwareFingerprint.collect();
      const result2 = HardwareFingerprint.collect();

      expect(result1).toEqual(result2);
    });

    it('should detect different hardware configurations', () => {
      // First configuration
      const result1 = HardwareFingerprint.collect();

      // Second configuration
      Object.defineProperty(global, 'navigator', {
        value: {
          deviceMemory: 16,
          hardwareConcurrency: 8,
          maxTouchPoints: 10,
          cpuClass: 'ARM64',
          oscpu: 'Windows NT 10.0; ARM64',
          buildID: '20230901000000'
        },
        writable: true,
        configurable: true
      });

      Object.defineProperty(global, 'screen', {
        value: {
          width: 2560,
          height: 1440,
          availWidth: 2560,
          availHeight: 1400,
          colorDepth: 32,
          pixelDepth: 32
        },
        writable: true,
        configurable: true
      });

      const result2 = HardwareFingerprint.collect();

      expect(result1.deviceMemory).not.toBe(result2.deviceMemory);
      expect(result1.hardwareConcurrency).not.toBe(result2.hardwareConcurrency);
      expect(result1.maxTouchPoints).not.toBe(result2.maxTouchPoints);
      expect(result1.cpuClass).not.toBe(result2.cpuClass);
      expect(result1.oscpu).not.toBe(result2.oscpu);
      expect(result1.screen.width).not.toBe(result2.screen.width);
    });

    it('should provide meaningful hardware fingerprint data', () => {
      const result = HardwareFingerprint.collect();

      // Check that all values are collected
      expect(typeof result.deviceMemory).toBe('number');
      expect(typeof result.hardwareConcurrency).toBe('number');
      expect(typeof result.maxTouchPoints).toBe('number');
      expect(typeof result.colorDepth).toBe('number');
      expect(typeof result.pixelDepth).toBe('number');
      expect(typeof result.cpuClass).toBe('string');
      expect(typeof result.oscpu).toBe('string');
      expect(typeof result.buildID).toBe('string');
      expect(typeof result.screen).toBe('object');

      // Check screen object structure
      expect(typeof result.screen.width).toBe('number');
      expect(typeof result.screen.height).toBe('number');
      expect(typeof result.screen.availWidth).toBe('number');
      expect(typeof result.screen.availHeight).toBe('number');
      expect(typeof result.screen.colorDepth).toBe('number');
      expect(typeof result.screen.pixelDepth).toBe('number');
    });
  });
});