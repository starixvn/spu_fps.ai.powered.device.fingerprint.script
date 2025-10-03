// Mock all dependencies BEFORE importing
jest.mock('../../../../src/client/fingerprint/modules/audio', () => ({
  AudioFingerprint: {
    collect: jest.fn()
  }
}));

jest.mock('../../../../src/client/fingerprint/modules/browser', () => ({
  BrowserFingerprint: {
    collect: jest.fn()
  }
}));

jest.mock('../../../../src/client/fingerprint/modules/hardware', () => ({
  HardwareFingerprint: {
    collect: jest.fn()
  }
}));

jest.mock('../../../../src/client/fingerprint/modules/preference', () => ({
  PreferencesFingerprint: {
    collect: jest.fn()
  }
}));

jest.mock('../../../../src/client/fingerprint/utils/hash', () => ({
  MurmurHash128: {
    hash128: jest.fn()
  },
  Base64Encoder: {
    encodeBase64: jest.fn()
  }
}));

// Mock CONFIG before any imports
jest.mock('../../../../src/client/utils/domain', () => ({
  CONFIG: {
    ENCODING_KEY: "__ENCODE_KEY__",
    GATEWAY_URL: "__GATEWAY_URL__",
    ENDPOINTS: {
      F4: "/meta-data",
      F5: "/logs-sync"
    },
    FIELD_NAMES: {
      DEVICE_INFO: "__di"
    }
  },
  FingerprintStep: 'F4'
}));

import { F4Fingerprint } from '../../../../src/client/fingerprint/f4Fingerprint';

// Import the mocked modules
import { AudioFingerprint } from '../../../../src/client/fingerprint/modules/audio';
import { BrowserFingerprint } from '../../../../src/client/fingerprint/modules/browser';
import { HardwareFingerprint } from '../../../../src/client/fingerprint/modules/hardware';
import { PreferencesFingerprint } from '../../../../src/client/fingerprint/modules/preference';
import { MurmurHash128, Base64Encoder } from '../../../../src/client/fingerprint/utils/hash';
import { CONFIG } from '../../../../src/client/utils/domain';

// Get mocked instances with any type to avoid strict typing issues
const mockAudioFingerprint = AudioFingerprint as any;
const mockBrowserFingerprint = BrowserFingerprint as any;
const mockHardwareFingerprint = HardwareFingerprint as any;
const mockPreferencesFingerprint = PreferencesFingerprint as any;
const mockMurmurHash = MurmurHash128 as any;
const mockBase64Encoder = Base64Encoder as any;

// Mock global window object
Object.defineProperty(global, 'window', {
  value: {
    navigator: {
      sendBeacon: jest.fn()
    },
    fetch: jest.fn()
  },
  writable: true,
  configurable: true
});

// Mock global navigator and fetch
global.navigator = {
  sendBeacon: jest.fn()
} as any;

global.fetch = jest.fn();

describe('F4Fingerprint', () => {
  let f4Fingerprint: F4Fingerprint;
  let mockInjectCallback: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    f4Fingerprint = new F4Fingerprint();
    mockInjectCallback = jest.fn();

    // Setup default mock return values matching the proper interfaces
    mockAudioFingerprint.collect.mockResolvedValue({
      audio: 0.5,
      audioBaseLatency: 0.01
    });

    mockBrowserFingerprint.collect.mockResolvedValue({
      browserName: 'Chrome',
      osName: 'Windows',
      userAgent: 'Chrome/90.0.4430.212',
      vendor: 'Google Inc.',
      vendorFlavors: ['chromium'],
      plugins: [],
      pdfViewerEnabled: 1
    });

    mockHardwareFingerprint.collect.mockResolvedValue({
      platform: 'Win32',
      architecture: 64,
      oscpu: 'Intel Mac OS X 10_15_7',
      cpuClass: 'x86',
      hardwareConcurrency: 8,
      deviceMemory: 16
    });

    mockPreferencesFingerprint.collect.mockResolvedValue({
      languages: [['en-US'], ['en']],
      timezone: 'Asia/Ho_Chi_Minh',
      touchSupport: [0, 0, 0],
      cookiesEnabled: 1,
      localStorage: 1,
      sessionStorage: 1,
      openDatabase: 0,
      indexedDB: 1
    });

    mockMurmurHash.hash128.mockReturnValue('mocked-hash-value');
    mockBase64Encoder.encodeBase64.mockReturnValue('mocked-encoded-data');

    // Mock sendBeacon and fetch
    (global.navigator.sendBeacon as jest.Mock).mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
  });

  describe('collectData', () => {
    it('should collect all F4 data successfully', async () => {
      // Act
      const result = await (f4Fingerprint as any).collectData();

      // Assert
      expect(result).toEqual({
        audio: {
          audio: 0.5,
          audioBaseLatency: 0.01
        },
        browser: {
          browserName: 'Chrome',
          osName: 'Windows',
          userAgent: 'Chrome/90.0.4430.212',
          vendor: 'Google Inc.',
          vendorFlavors: ['chromium'],
          plugins: [],
          pdfViewerEnabled: 1
        },
        hardware: {
          platform: 'Win32',
          architecture: 64,
          oscpu: 'Intel Mac OS X 10_15_7',
          cpuClass: 'x86',
          hardwareConcurrency: 8,
          deviceMemory: 16
        },
        preferences: {
          languages: [['en-US'], ['en']],
          timezone: 'Asia/Ho_Chi_Minh',
          touchSupport: [0, 0, 0],
          cookiesEnabled: 1,
          localStorage: 1,
          sessionStorage: 1,
          openDatabase: 0,
          indexedDB: 1
        }
      });

      expect(mockAudioFingerprint.collect).toHaveBeenCalledTimes(1);
      expect(mockBrowserFingerprint.collect).toHaveBeenCalledTimes(1);
      expect(mockHardwareFingerprint.collect).toHaveBeenCalledTimes(1);
      expect(mockPreferencesFingerprint.collect).toHaveBeenCalledTimes(1);
    });

    it('should handle individual module failures by propagating the error', async () => {
      // Arrange
      mockAudioFingerprint.collect.mockRejectedValue(new Error('Audio collection failed'));

      // Act & Assert
      // Since Promise.all is used, any individual failure should cause the entire operation to fail
      await expect((f4Fingerprint as any).collectData()).rejects.toThrow('Audio collection failed');
    });
  });

  describe('extractAttributes', () => {
    it('should merge all attributes from F4 data', () => {
      // Arrange
      const mockData = {
        audio: { audio: 0.5, audioBaseLatency: 0.01 },
        browser: { browserName: 'Chrome', osName: 'Windows', userAgent: 'Chrome/90.0', vendor: 'Google', vendorFlavors: ['chromium'], plugins: [], pdfViewerEnabled: 1 },
        hardware: { platform: 'Win32', hardwareConcurrency: 8, architecture: 64, oscpu: 'Intel', cpuClass: 'x86', deviceMemory: 16 },
        preferences: { languages: [['en-US']], timezone: 'UTC', touchSupport: [0, 0, 0], cookiesEnabled: 1, localStorage: 1, sessionStorage: 1, openDatabase: 0, indexedDB: 1 }
      };

      // Act
      const result = (f4Fingerprint as any).extractAttributes(mockData);

      // Assert - extractAttributes returns nested structure with aliased field names
      expect(result).toEqual({
        hardware: {
          plf: 'Win32',          // platform
          hwc: 8,                // hardwareConcurrency
          arc: 64,               // architecture
          osc: 'Intel',          // oscpu
          ccl: 'x86',            // cpuClass
          dvm: 16                // deviceMemory
        },
        audio: {
          aud: 0.5,              // audio
          abl: 0.01              // audioBaseLatency
        },
        browser: {
          brn: 'Chrome',         // browserName
          osn: 'Windows',        // osName
          uag: 'Chrome/90.0',    // userAgent
          vdr: 'Google',         // vendor
          vfl: ['chromium'],     // vendorFlavors
          plg: [],               // plugins
          pve: 1                 // pdfViewerEnabled
        },
        preferences: {
          lng: [['en-US']],      // languages
          tze: 'UTC',            // timezone
          tsp: [0, 0, 0],        // touchSupport
          cke: 1,                // cookiesEnabled
          lst: 1,                // localStorage
          ssg: 1,                // sessionStorage
          odb: 0,                // openDatabase
          idb: 1                 // indexedDB
        }
      });
    });

    it('should properly map attributes using aliases', () => {
      // Arrange - Create a scenario with actual data values
      const mockData = {
        audio: { audio: 'audio-value', audioBaseLatency: 0.01 },
        browser: { browserName: 'browser-value', userAgent: 'ua', vendor: 'vendor', osName: 'os', vendorFlavors: [], plugins: [], pdfViewerEnabled: 1 },
        hardware: { platform: 'hardware-value', cpuClass: 'cpu', architecture: 64, oscpu: 'oscpu', hardwareConcurrency: 8, deviceMemory: 16 },
        preferences: { languages: [['en']], timezone: 'preferences-value', touchSupport: [1, 1, 1], sessionStorage: 1, openDatabase: 0, localStorage: 1, indexedDB: 1, cookiesEnabled: 1 }
      };

      // Act
      const result = (f4Fingerprint as any).extractAttributes(mockData);

      // Assert
      // Each group should have its aliased fields properly nested
      expect(result.audio.aud).toBe('audio-value');        // Audio alias
      expect(result.browser.brn).toBe('browser-value');    // Browser alias
      expect(result.hardware.plf).toBe('hardware-value');  // Hardware alias
      expect(result.preferences.tze).toBe('preferences-value'); // Preferences alias
      expect(result.audio.abl).toBe(0.01);                 // Audio specific
      expect(result.browser.uag).toBe('ua');               // Browser specific
      expect(result.hardware.hwc).toBe(8);                 // Hardware specific
      expect(result.preferences.lng).toEqual([['en']]);    // Preferences specific
    });
  });



  describe('start', () => {
    it('should process F4 data and return attributes', async () => {
      // Arrange
      const expectedAttributes = {
        hardware: { plf: 'Win32', hwc: 8, arc: 64, osc: 'Intel Mac OS X 10_15_7', ccl: 'x86', dvm: 16 },
        audio: { aud: 0.5, abl: 0.01 },
        browser: { brn: 'Chrome', osn: 'Windows', uag: 'Chrome/90.0.4430.212', vdr: 'Google Inc.', vfl: ['chromium'], plg: [], pve: 1 },
        preferences: { lng: [['en-US'], ['en']], tze: 'Asia/Ho_Chi_Minh', tsp: [0, 0, 0], cke: 1, lst: 1, ssg: 1, odb: 0, idb: 1 }
      };

      // Mock the process method to return expected result
      jest.spyOn(f4Fingerprint as any, 'process').mockResolvedValue({
        attributes: expectedAttributes,
        hashed: 'test-hash'
      });

      // Act
      const result = await f4Fingerprint.start(mockInjectCallback);

      // Assert
      expect(result).toEqual(expectedAttributes);
      expect(mockInjectCallback).toHaveBeenCalledWith({
        attributes: expectedAttributes,
        hashed: 'test-hash'
      });
    });

    it('should handle process errors gracefully', async () => {
      // Arrange
      const error = new Error('Process failed');

      jest.spyOn(f4Fingerprint as any, 'process').mockRejectedValue(error);

      // Act & Assert
      await expect(f4Fingerprint.start(mockInjectCallback))
        .rejects.toThrow('Process failed');
    });
  });

  describe('Integration with AbstractFingerprint', () => {
    it('should call abstract methods in correct order during process', async () => {
      // Arrange
      const callOrder: string[] = [];

      // Spy on methods that are actually called in the process method
      jest.spyOn(f4Fingerprint as any, 'collectData').mockImplementation(async () => {
        callOrder.push('collectData');
        return { 
          audio: { audio: 0.5, audioBaseLatency: 0.01 }, 
          browser: { browserName: 'Chrome', osName: 'Windows', userAgent: 'Chrome/90.0', vendor: 'Google', vendorFlavors: [], plugins: [], pdfViewerEnabled: 1 }, 
          hardware: { platform: 'Win32', architecture: 64, oscpu: 'Intel', cpuClass: 'x86', hardwareConcurrency: 8, deviceMemory: 16 }, 
          preferences: { languages: [['en-US']], timezone: 'UTC', touchSupport: [0, 0, 0], cookiesEnabled: 1, localStorage: 1, sessionStorage: 1, openDatabase: 0, indexedDB: 1 } 
        };
      });

      jest.spyOn(f4Fingerprint as any, 'extractAttributes').mockImplementation((data) => {
        callOrder.push('extractAttributes');
        return { extracted: 'attributes' };
      });

      jest.spyOn(f4Fingerprint as any, 'generateGroupHashes').mockImplementation(() => {
        callOrder.push('generateGroupHashes');
        return 'test-hash';
      });

      // Act
      const result = await (f4Fingerprint as any).process();

      // Assert
      expect(callOrder).toEqual([
        'collectData',
        'extractAttributes',
        'generateGroupHashes'
      ]);

      expect(result).toEqual({
        attributes: { extracted: 'attributes' },
        hashed: 'test-hash'
      });
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from module collection', async () => {
      // Arrange
      mockAudioFingerprint.collect.mockRejectedValue(new Error('Audio module error'));
      mockBrowserFingerprint.collect.mockRejectedValue(new Error('Browser module error'));
      mockHardwareFingerprint.collect.mockRejectedValue(new Error('Hardware module error'));
      mockPreferencesFingerprint.collect.mockRejectedValue(new Error('Preferences module error'));

      // Act & Assert
      await expect((f4Fingerprint as any).collectData()).rejects.toThrow();
    });

    it('should handle partial module failures in Promise.all', async () => {
      // Arrange
      mockAudioFingerprint.collect.mockResolvedValue({ 
        audio: { audio: 0.5, status: 'ok' }, 
        audioBaseLatency: 0.01 
      });
      mockBrowserFingerprint.collect.mockRejectedValue(new Error('Browser failed'));
      mockHardwareFingerprint.collect.mockResolvedValue({ 
        platform: 'Win32', 
        architecture: 'x64', 
        oscpu: 'Intel', 
        cpuClass: 'x86', 
        hardwareConcurrency: 8, 
        deviceMemory: 16 
      });
      mockPreferencesFingerprint.collect.mockResolvedValue({ 
        languages: ['en-US'], 
        timezone: 'UTC', 
        touchSupport: false, 
        cookiesEnabled: true, 
        localStorage: true, 
        sessionStorage: true, 
        openDatabase: false, 
        indexedDB: true 
      });

      // Act & Assert
      // Promise.all should fail if any promise fails
      await expect((f4Fingerprint as any).collectData()).rejects.toThrow('Browser failed');
    });
  });

  describe('Type Safety', () => {
    it('should maintain proper TypeScript types', () => {
      // Arrange & Act
      const fingerprint = new F4Fingerprint();

      // Assert
      expect(fingerprint).toBeInstanceOf(F4Fingerprint);
      expect(typeof fingerprint.start).toBe('function');
    });
  });
});
