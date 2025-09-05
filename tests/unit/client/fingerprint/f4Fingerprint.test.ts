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
        au: {
          audio: {
            audio: 0.5,
            status: 'ok'
          },
          audioBaseLatency: 0.01
        },
        br: {
          browserName: 'Chrome',
          osName: 'Windows',
          userAgent: 'Chrome/90.0.4430.212',
          vendor: 'Google Inc.',
          vendorFlavors: ['chromium'],
          plugins: [],
          pdfViewerEnabled: true
        },
        hw: {
          platform: 'Win32',
          architecture: 'x64',
          oscpu: 'Intel Mac OS X 10_15_7',
          cpuClass: 'x86',
          hardwareConcurrency: 8,
          deviceMemory: 16
        },
        pf: {
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
        au: { audio: { audio: 0.5, status: 'ok' }, audioBaseLatency: 0.01 },
        br: { browserName: 'Chrome', userAgent: 'Chrome/90.0', vendor: 'Google' },
        hw: { platform: 'Win32', hardwareConcurrency: 8, architecture: 'x64', oscpu: 'Intel', cpuClass: 'x86', deviceMemory: 16 },
        pf: { languages: ['en-US'], timezone: 'UTC', touchSupport: false, cookiesEnabled: true, localStorage: true, sessionStorage: true, openDatabase: false, indexedDB: true }
      };

      // Act
      const result = (f4Fingerprint as any).extractAttributes(mockData);

      // Assert - extractAttributes should spread all nested properties
      expect(result).toEqual({
        audio: { audio: 0.5, status: 'ok' },
        audioBaseLatency: 0.01,
        browserName: 'Chrome',
        userAgent: 'Chrome/90.0',
        vendor: 'Google',
        platform: 'Win32',
        hardwareConcurrency: 8,
        architecture: 'x64',
        oscpu: 'Intel',
        cpuClass: 'x86',
        deviceMemory: 16,
        languages: ['en-US'],
        timezone: 'UTC',
        touchSupport: false,
        cookiesEnabled: true,
        localStorage: true,
        sessionStorage: true,
        openDatabase: false,
        indexedDB: true
      });
    });

    it('should handle missing properties gracefully', () => {
      // Arrange
      const mockData = {
        au: { audio: { audio: 0.5, status: 'ok' } },
        br: {},
        hw: null,
        pf: undefined
      };

      // Act
      const result = (f4Fingerprint as any).extractAttributes(mockData);

      // Assert
      expect(result).toEqual({
        audio: { audio: 0.5, status: 'ok' }
      });
    });

    it('should handle duplicate keys by using spread operator precedence', () => {
      // Arrange
      const mockData = {
        au: { commonKey: 'audio-value', audioSpecific: 'audio' },
        br: { commonKey: 'browser-value', browserSpecific: 'browser' },
        hw: { commonKey: 'hardware-value', hardwareSpecific: 'hardware' },
        pf: { commonKey: 'preferences-value', prefSpecific: 'pref' }
      };

      // Act
      const result = (f4Fingerprint as any).extractAttributes(mockData);

      // Assert
      // Later spread operations should override earlier ones
      expect(result.commonKey).toBe('preferences-value');
      expect(result.audioSpecific).toBe('audio');
      expect(result.browserSpecific).toBe('browser');
      expect(result.hardwareSpecific).toBe('hardware');
      expect(result.prefSpecific).toBe('pref');
    });
  });

  describe('buildPayload', () => {
    it('should build correct payload structure', () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const fingerprintData = {
        au: { audioCodecs: ['mp3'] },
        br: { userAgent: 'Chrome' },
        hw: { platform: 'Win32' },
        pf: { timezone: 'UTC' }
      };
      const hashed = 'test-hash';

      mockBase64Encoder.encodeBase64.mockReturnValue('encoded-payload');

      // Act
      const result = (f4Fingerprint as any).buildPayload(sessionKey, fingerprintData, hashed);

      // Assert
      expect(result).toBe('encoded-payload');
      expect(mockBase64Encoder.encodeBase64).toHaveBeenCalledTimes(1);
      expect(mockBase64Encoder.encodeBase64).toHaveBeenCalledWith(
        JSON.stringify({
          sk: sessionKey, 
          fp: {
            au: JSON.stringify(fingerprintData.au), 
            br: JSON.stringify(fingerprintData.br), 
            hw: JSON.stringify(fingerprintData.hw), 
            pf: JSON.stringify(fingerprintData.pf)
          }, 
          hs: hashed
        }), 
        CONFIG.ENCODING_KEY
      );
    });

    it('should handle empty fingerprint data', () => {
      // Arrange
      const sessionKey = 'test-session-key';
      const fingerprintData = {
        au: {},
        br: {},
        hw: {},
        pf: {}
      };
      const hashed = 'test-hash';

      mockBase64Encoder.encodeBase64.mockReturnValue('encoded-empty-payload');

      // Act
      const result = (f4Fingerprint as any).buildPayload(sessionKey, fingerprintData, hashed);

      // Assert
      expect(result).toBe('encoded-empty-payload');
      expect(mockBase64Encoder.encodeBase64).toHaveBeenCalledWith(
        JSON.stringify({
          sk: sessionKey, 
          fp: {
            au: JSON.stringify(fingerprintData.au), 
            br: JSON.stringify(fingerprintData.br), 
            hw: JSON.stringify(fingerprintData.hw), 
            pf: JSON.stringify(fingerprintData.pf)
          }, 
          hs: hashed
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
