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
jest.mock('../../../../src/client/index', () => ({
  CONFIG: {
    ENCODING_KEY: "__ENCODE_KEY__",
    GATEWAY_URL: "__GATEWAY_URL__",
    ENDPOINTS: {
      F4: "/meta_data",
      F5: "/logs_sync"
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
import { CONFIG } from '../../../../src/client/index';

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
      audio: {
        audio: 0.5,
        status: 'ok'
      },
      audioBaseLatency: 0.01
    });

    mockBrowserFingerprint.collect.mockResolvedValue({
      browserName: 'Chrome',
      osName: 'Windows',
      userAgent: 'Chrome/90.0.4430.212',
      vendor: 'Google Inc.',
      vendorFlavors: ['chromium'],
      plugins: [],
      pdfViewerEnabled: true
    });

    mockHardwareFingerprint.collect.mockResolvedValue({
      platform: 'Win32',
      architecture: 'x64',
      oscpu: 'Intel Mac OS X 10_15_7',
      cpuClass: 'x86',
      hardwareConcurrency: 8,
      deviceMemory: 16
    });

    mockPreferencesFingerprint.collect.mockResolvedValue({
      languages: ['en-US', 'en'],
      timezone: 'Asia/Ho_Chi_Minh',
      touchSupport: false,
      cookiesEnabled: true,
      localStorage: true,
      sessionStorage: true,
      openDatabase: false,
      indexedDB: true
    });

    mockMurmurHash.hash128.mockReturnValue('mocked-hash-value');
    mockBase64Encoder.encodeBase64.mockReturnValue('mocked-encoded-data');

    // Mock sendBeacon and fetch
    (global.navigator.sendBeacon as jest.Mock).mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
  });

  describe('Constructor', () => {
    it('should initialize with correct step and endpoint', () => {
      expect((f4Fingerprint as any).step).toBe('F4');
      expect((f4Fingerprint as any).endpoint).toBe('/meta_data');
    });
  });

  describe('collectData', () => {
    it('should collect all F4 data successfully', async () => {
      // Act
      const result = await (f4Fingerprint as any).collectData();

      // Assert
      expect(result).toEqual({
        audio: {
          audio: {
            audio: 0.5,
            status: 'ok'
          },
          audioBaseLatency: 0.01
        },
        browser: {
          browserName: 'Chrome',
          osName: 'Windows',
          userAgent: 'Chrome/90.0.4430.212',
          vendor: 'Google Inc.',
          vendorFlavors: ['chromium'],
          plugins: [],
          pdfViewerEnabled: true
        },
        hardware: {
          platform: 'Win32',
          architecture: 'x64',
          oscpu: 'Intel Mac OS X 10_15_7',
          cpuClass: 'x86',
          hardwareConcurrency: 8,
          deviceMemory: 16
        },
        preferences: {
          languages: ['en-US', 'en'],
          timezone: 'Asia/Ho_Chi_Minh',
          touchSupport: false,
          cookiesEnabled: true,
          localStorage: true,
          sessionStorage: true,
          openDatabase: false,
          indexedDB: true
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
        audio: { audio: { audio: 0.5, status: 'ok' }, audioBaseLatency: 0.01 },
        browser: { browserName: 'Chrome', userAgent: 'Chrome/90.0', vendor: 'Google' },
        hardware: { platform: 'Win32', hardwareConcurrency: 8, architecture: 'x64', oscpu: 'Intel', cpuClass: 'x86', deviceMemory: 16 },
        preferences: { languages: ['en-US'], timezone: 'UTC', touchSupport: false, cookiesEnabled: true, localStorage: true, sessionStorage: true, openDatabase: false, indexedDB: true }
      };

      // Act
      const result = (f4Fingerprint as any).extractAttributes(mockData);

      // Assert - extractAttributes should spread all nested properties with aliased field names
      expect(result).toEqual({
        // Hardware aliases
        plf: 'Win32',          // platform
        hwc: 8,                // hardwareConcurrency
        arc: 'x64',            // architecture
        osc: 'Intel',          // oscpu
        ccl: 'x86',            // cpuClass
        dvm: 16,               // deviceMemory
        // Audio aliases
        aud: { audio: 0.5, status: 'ok' }, // audio
        abl: 0.01,             // audioBaseLatency
        // Browser aliases
        brn: 'Chrome',         // browserName
        uag: 'Chrome/90.0',    // userAgent
        vdr: 'Google',         // vendor
        osn: undefined,        // osName (not provided in mock)
        vfl: undefined,        // vendorFlavors (not provided in mock)
        plg: undefined,        // plugins (not provided in mock)
        pve: undefined,        // pdfViewerEnabled (not provided in mock)
        // Preferences aliases
        lng: ['en-US'],        // languages
        tze: 'UTC',            // timezone
        tsp: false,            // touchSupport
        cke: true,             // cookiesEnabled
        lst: true,             // localStorage
        ssg: true,             // sessionStorage
        odb: false,            // openDatabase
        idb: true              // indexedDB
      });
    });

    it('should handle duplicate keys by using spread operator precedence', () => {
      // Arrange - Create a scenario where the same aliased key could come from different sources
      const mockData = {
        audio: { audio: 'audio-value', audioBaseLatency: 0.01 },
        browser: { browserName: 'browser-value', userAgent: 'ua', vendor: 'vendor', osName: 'os', vendorFlavors: [], plugins: [], pdfViewerEnabled: 1 },
        hardware: { platform: 'hardware-value', cpuClass: 'cpu', architecture: 1, oscpu: 'oscpu', hardwareConcurrency: 8, deviceMemory: 16 },
        preferences: { languages: [['en']], timezone: 'preferences-value', touchSupport: [1, 1, 1], sessionStorage: 1, openDatabase: 0, localStorage: 1, indexedDB: 1, cookiesEnabled: 1 }
      };

      // Act
      const result = (f4Fingerprint as any).extractAttributes(mockData);

      // Assert
      // Each aliased field should have its proper value since they don't actually conflict
      expect(result.aud).toBe('audio-value');        // Audio alias
      expect(result.brn).toBe('browser-value');      // Browser alias
      expect(result.plf).toBe('hardware-value');     // Hardware alias
      expect(result.tze).toBe('preferences-value');  // Preferences alias
      expect(result.abl).toBe(0.01);                 // Audio specific
      expect(result.uag).toBe('ua');                 // Browser specific
      expect(result.hwc).toBe(8);                    // Hardware specific
      expect(result.lng).toEqual([['en']]);          // Preferences specific
    });
  });

  describe('buildPayload', () => {
    it('should build correct payload structure', () => {
      // Arrange
      const sessionKey = 'test-session-key';
      // Use proper F4Data structure that matches the interfaces
      const fingerprintData = {
        audio: { audio: { audio: 0.5, status: 'ok' }, audioBaseLatency: 0.01 },
        browser: { browserName: 'Chrome', osName: 'Windows', userAgent: 'Chrome/90.0', vendor: 'Google', vendorFlavors: ['chromium'], plugins: [], pdfViewerEnabled: 1 },
        hardware: { platform: 'Win32', cpuClass: 'x86', architecture: 64, oscpu: 'Intel', hardwareConcurrency: 8, deviceMemory: 16 },
        preferences: { languages: [['en-US']], timezone: 'UTC', touchSupport: [1, 1, 1], sessionStorage: 1, openDatabase: 0, localStorage: 1, indexedDB: 1, cookiesEnabled: 1 }
      };

      mockBase64Encoder.encodeBase64.mockReturnValue('encoded-payload');

      // Act
      const result = (f4Fingerprint as any).buildPayload(sessionKey, fingerprintData);

      // Assert
      expect(result).toBe('encoded-payload');
      expect(mockBase64Encoder.encodeBase64).toHaveBeenCalledTimes(1);
      
      // The buildPayload method uses extractXXXAttributes methods which return aliased data
      const expectedPayload = JSON.stringify({
        sk: sessionKey, 
        fp: {
          au: JSON.stringify({ aud: { audio: 0.5, status: 'ok' }, abl: 0.01 }),
          br: JSON.stringify({ brn: 'Chrome', osn: 'Windows', uag: 'Chrome/90.0', vdr: 'Google', vfl: ['chromium'], plg: [], pve: 1 }),
          hw: JSON.stringify({ plf: 'Win32', ccl: 'x86', arc: 64, osc: 'Intel', hwc: 8, dvm: 16 }),
          pf: JSON.stringify({ lng: [['en-US']], tze: 'UTC', tsp: [1, 1, 1], ssg: 1, odb: 0, lst: 1, idb: 1, cke: 1 })
        }
      });
      
      expect(mockBase64Encoder.encodeBase64).toHaveBeenCalledWith(
        expectedPayload,
        CONFIG.ENCODING_KEY
      );
    });

    it('should handle empty fingerprint data', () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const fingerprintData = {
        audio: {},
        browser: {},
        hardware: {},
        preferences: {}
      };

      mockBase64Encoder.encodeBase64.mockReturnValue('encoded-empty-payload');

      // Act
      const result = (f4Fingerprint as any).buildPayload(sessionKey, fingerprintData);

      // Assert
      expect(result).toBe('encoded-empty-payload');
      expect(mockBase64Encoder.encodeBase64).toHaveBeenCalledWith(
        JSON.stringify({
          sk: sessionKey, 
          fp: {
            au: JSON.stringify(fingerprintData.audio), 
            br: JSON.stringify(fingerprintData.browser), 
            hw: JSON.stringify(fingerprintData.hardware), 
            pf: JSON.stringify(fingerprintData.preferences)
          }
        }), 
        CONFIG.ENCODING_KEY
      );
    });
  });

  describe('processF4Data', () => {
    it('should process F4 data and return attributes', async () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const expectedAttributes = {
        audioCodecs: ['mp3'],
        userAgent: 'Chrome',
        platform: 'Win32',
        timezone: 'UTC'
      };

      // Mock the process method to return expected result
      jest.spyOn(f4Fingerprint as any, 'process').mockResolvedValue({
        attributes: expectedAttributes,
        hashed: 'test-hash',
        step: 'F4'
      });

      // Act
      const result = await f4Fingerprint.processF4Data(sessionKey, mockInjectCallback);

      // Assert
      expect(result).toEqual(expectedAttributes);
      expect((f4Fingerprint as any).process).toHaveBeenCalledWith(sessionKey, mockInjectCallback);
      expect((window as any).f4Attributes).toEqual(expectedAttributes);
    });

    it('should handle process errors gracefully', async () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const error = new Error('Process failed');

      jest.spyOn(f4Fingerprint as any, 'process').mockRejectedValue(error);

      // Act & Assert
      await expect(f4Fingerprint.processF4Data(sessionKey, mockInjectCallback))
        .rejects.toThrow('Process failed');
    });

    it('should set window.f4Attributes when window is available', async () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const expectedAttributes = { testData: 'value' };

      jest.spyOn(f4Fingerprint as any, 'process').mockResolvedValue({
        attributes: expectedAttributes,
        hashed: 'test-hash',
        step: 'F4'
      });

      // Act
      await f4Fingerprint.processF4Data(sessionKey, mockInjectCallback);

      // Assert
      expect((window as any).f4Attributes).toEqual(expectedAttributes);
    });

    it('should not throw when window is undefined', async () => {
      // Arrange
      const originalWindow = global.window;
      (global as any).window = undefined;

      const sessionKey = 'test-session-key';
      const expectedAttributes = { testData: 'value' };

      jest.spyOn(f4Fingerprint as any, 'process').mockResolvedValue({
        attributes: expectedAttributes,
        hashed: 'test-hash',
        step: 'F4'
      });

      // Act & Assert
      await expect(f4Fingerprint.processF4Data(sessionKey, mockInjectCallback))
        .resolves.toEqual(expectedAttributes);

      // Cleanup
      global.window = originalWindow;
    });
  });

  describe('Integration with AbstractFingerprint', () => {
    it('should call abstract methods in correct order during process', async () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const callOrder: string[] = [];

      // Spy on all abstract methods
      jest.spyOn(f4Fingerprint as any, 'collectData').mockImplementation(async () => {
        callOrder.push('collectData');
        return { audio: {}, browser: {}, hardware: {}, preferences: {} };
      });

      jest.spyOn(f4Fingerprint as any, 'extractAttributes').mockImplementation((data) => {
        callOrder.push('extractAttributes');
        return { extracted: 'attributes' };
      });

      jest.spyOn(f4Fingerprint as any, 'generateGroupHashes').mockImplementation(() => {
        callOrder.push('generateGroupHashes');
        return 'test-hash';
      });

      jest.spyOn(f4Fingerprint as any, 'buildPayload').mockImplementation(() => {
        callOrder.push('buildPayload');
        return { payload: 'data' };
      });

      jest.spyOn(f4Fingerprint as any, 'sendToServer').mockImplementation(async () => {
        callOrder.push('sendToServer');
        return true;
      });

      // Act
      await (f4Fingerprint as any).process(sessionKey, mockInjectCallback);

      // Assert
      expect(callOrder).toEqual([
        'collectData',
        'extractAttributes',
        'generateGroupHashes',
        'buildPayload',
        'sendToServer'
      ]);

      expect(mockInjectCallback).toHaveBeenCalledWith('test-hash', 'F4');
    });

    it('should handle errors in abstract method chain', async () => {
      // Arrange
      const sessionKey = 'test-session-key';
      jest.spyOn(f4Fingerprint as any, 'collectData').mockRejectedValue(new Error('Collection failed'));

      // Act & Assert
      await expect((f4Fingerprint as any).process(sessionKey, mockInjectCallback))
        .rejects.toThrow('Collection failed');
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
      expect(typeof fingerprint.processF4Data).toBe('function');
    });

    // it('should enforce readonly properties', () => {
    //   // Arrange
    //   const fingerprint = new F4Fingerprint();

    //   // Assert
    //   expect((fingerprint as any).step).toBe('F4');
    //   expect((fingerprint as any).endpoint).toBe('/meta_data');
      
    //   // These should be readonly
    //   expect(() => {
    //     (fingerprint as any).step = 'F5';
    //   }).toThrow();
    // });
  });
});
