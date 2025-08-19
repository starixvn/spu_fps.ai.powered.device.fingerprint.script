import fpsFingerprint from '../../../../src/client/fingerprint/index';

// Mock all fingerprinting modules
jest.mock('../../../../src/client/fingerprint/modules/hardware', () => ({
  HardwareFingerprint: {
    collect: jest.fn(() => ({
      deviceMemory: 8,
      hardwareConcurrency: 4,
      maxTouchPoints: 0,
      colorDepth: 24,
      pixelDepth: 24,
      screen: {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1050,
        colorDepth: 24,
        pixelDepth: 24
      },
      cpuClass: 'x86',
      oscpu: 'Intel Mac OS X 10_15_7',
      buildID: '20230815123456'
    }))
  }
}));

jest.mock('../../../../src/client/fingerprint/modules/graphics', () => ({
  GraphicsFingerprint: {
    collect: jest.fn(() => ({
      webgl: {
        vendor: 'Google Inc.',
        renderer: 'ANGLE (Intel, Intel(R) HD Graphics 620)',
        version: 'WebGL 1.0',
        shadingLanguageVersion: 'WebGL GLSL ES 1.0',
        unmaskedVendor: 'Intel Inc.',
        unmaskedRenderer: 'Intel(R) HD Graphics 620'
      },
      canvas: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      fonts: ['Arial', 'Times', 'Helvetica', 'Georgia', 'Verdana']
    }))
  }
}));

jest.mock('../../../../src/client/fingerprint/modules/audio', () => ({
  AudioFingerprint: {
    collect: jest.fn(() => ({
      audio: '124.04344968475198_126.08073630537838_147.4495433701226'
    }))
  }
}));

jest.mock('../../../../src/client/fingerprint/modules/browser', () => ({
  BrowserFingerprint: {
    collect: jest.fn(() => ({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      platform: 'Win32',
      cookieEnabled: true,
      doNotTrack: null,
      onLine: true,
      plugins: [
        { name: 'PDF Viewer', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-plugin' }
      ],
      localStorage: true,
      sessionStorage: true,
      indexedDB: true,
      webSQL: false
    }))
  }
}));

jest.mock('../../../../src/client/fingerprint/modules/preferences', () => ({
  PreferencesFingerprint: {
    collect: jest.fn(() => ({
      language: 'en-US',
      languages: ['en-US', 'en'],
      timezone: 'America/New_York',
      timezoneOffset: -240,
      clientHints: {
        brands: [
          { brand: 'Google Chrome', version: '116' },
          { brand: 'Chromium', version: '116' }
        ],
        mobile: false,
        platform: 'Windows'
      }
    }))
  }
}));

// Mock global fetch and XMLHttpRequest
const mockFetch = jest.fn();
const mockXMLHttpRequest = {
  open: jest.fn(),
  setRequestHeader: jest.fn(),
  send: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: '{"success": true}',
  onreadystatechange: null as any
};

describe('FPSFingerprint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all module mocks to their original implementations
    const { HardwareFingerprint } = require('../../../../src/client/fingerprint/modules/hardware');
    const { GraphicsFingerprint } = require('../../../../src/client/fingerprint/modules/graphics');
    const { AudioFingerprint } = require('../../../../src/client/fingerprint/modules/audio');
    const { BrowserFingerprint } = require('../../../../src/client/fingerprint/modules/browser');
    const { PreferencesFingerprint } = require('../../../../src/client/fingerprint/modules/preferences');
    
    // Reset HardwareFingerprint mock
    HardwareFingerprint.collect.mockImplementation(() => ({
      deviceMemory: 8,
      hardwareConcurrency: 4,
      maxTouchPoints: 0,
      colorDepth: 24,
      pixelDepth: 24,
      screen: {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1050,
        colorDepth: 24,
        pixelDepth: 24
      },
      cpuClass: 'x86',
      oscpu: 'Intel Mac OS X 10_15_7',
      buildID: '20230815123456'
    }));
    
    // Reset GraphicsFingerprint mock
    GraphicsFingerprint.collect.mockImplementation(() => ({
      webgl: {
        vendor: 'Google Inc.',
        renderer: 'ANGLE (Intel, Intel(R) HD Graphics 620)',
        version: 'WebGL 1.0',
        shadingLanguageVersion: 'WebGL GLSL ES 1.0',
        unmaskedVendor: 'Intel Inc.',
        unmaskedRenderer: 'Intel(R) HD Graphics 620'
      },
      canvas: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      fonts: ['Arial', 'Times', 'Helvetica', 'Georgia', 'Verdana']
    }));
    
    // Reset AudioFingerprint mock
    AudioFingerprint.collect.mockImplementation(() => ({
      audio: '124.04344968475198_126.08073630537838_147.4495433701226'
    }));
    
    // Reset BrowserFingerprint mock
    BrowserFingerprint.collect.mockImplementation(() => ({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      platform: 'Win32',
      cookieEnabled: true,
      doNotTrack: null,
      onLine: true,
      plugins: [
        { name: 'PDF Viewer', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-plugin' }
      ],
      localStorage: true,
      sessionStorage: true,
      indexedDB: true,
      webSQL: false
    }));
    
    // Reset PreferencesFingerprint mock
    PreferencesFingerprint.collect.mockImplementation(() => ({
      language: 'en-US',
      languages: ['en-US', 'en'],
      timezone: 'America/New_York',
      timezoneOffset: -240,
      clientHints: {
        brands: [
          { brand: 'Google Chrome', version: '116' },
          { brand: 'Chromium', version: '116' }
        ],
        mobile: false,
        platform: 'Windows'
      }
    }));
    
    // Setup global mocks
    (global as any).fetch = mockFetch;
    (global as any).XMLHttpRequest = jest.fn(() => mockXMLHttpRequest);
    
    // Reset Date mock
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-08-15T12:34:56.789Z');
  });

  afterEach(() => {
    delete (global as any).fetch;
    delete (global as any).XMLHttpRequest;
    jest.restoreAllMocks();
  });

  describe('basic properties', () => {
    it('should have correct version', () => {
      expect(fpsFingerprint.version).toBe('1.9.0');
    });
  });

  describe('collect method', () => {
    it('should collect comprehensive fingerprint data', () => {
      const result = fpsFingerprint.collect();

      // Check that all module data is included
      expect(result).toHaveProperty('deviceMemory', 8);
      expect(result).toHaveProperty('hardwareConcurrency', 4);
      expect(result).toHaveProperty('userAgent');
      expect(result).toHaveProperty('platform', 'Win32');
      expect(result).toHaveProperty('webgl');
      expect(result).toHaveProperty('canvas');
      expect(result).toHaveProperty('audio');
      expect(result).toHaveProperty('language', 'en-US');
      expect(result).toHaveProperty('timezone', 'America/New_York');
      expect(result).toHaveProperty('timestamp', '2023-08-15T12:34:56.789Z');
    });

    it('should call all fingerprinting modules', () => {
      const { HardwareFingerprint } = require('../../../../src/client/fingerprint/modules/hardware');
      const { GraphicsFingerprint } = require('../../../../src/client/fingerprint/modules/graphics');
      const { AudioFingerprint } = require('../../../../src/client/fingerprint/modules/audio');
      const { BrowserFingerprint } = require('../../../../src/client/fingerprint/modules/browser');
      const { PreferencesFingerprint } = require('../../../../src/client/fingerprint/modules/preferences');

      fpsFingerprint.collect();

      expect(HardwareFingerprint.collect).toHaveBeenCalled();
      expect(GraphicsFingerprint.collect).toHaveBeenCalled();
      expect(AudioFingerprint.collect).toHaveBeenCalled();
      expect(BrowserFingerprint.collect).toHaveBeenCalled();
      expect(PreferencesFingerprint.collect).toHaveBeenCalled();
    });

    it('should invoke callback when provided', () => {
      const callback = jest.fn();
      const result = fpsFingerprint.collect(callback);

      expect(callback).toHaveBeenCalledWith(result);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not throw error when callback is not a function', () => {
      expect(() => {
        fpsFingerprint.collect('not a function' as any);
      }).not.toThrow();

      expect(() => {
        fpsFingerprint.collect(null as any);
      }).not.toThrow();

      expect(() => {
        fpsFingerprint.collect(undefined);
      }).not.toThrow();
    });

    it('should return data structure with all expected properties', () => {
      const result = fpsFingerprint.collect();

      // Hardware properties
      expect(result).toHaveProperty('deviceMemory');
      expect(result).toHaveProperty('hardwareConcurrency');
      expect(result).toHaveProperty('maxTouchPoints');
      expect(result).toHaveProperty('colorDepth');
      expect(result).toHaveProperty('pixelDepth');
      expect(result).toHaveProperty('screen');
      expect(result).toHaveProperty('cpuClass');
      expect(result).toHaveProperty('oscpu');
      expect(result).toHaveProperty('buildID');

      // Graphics properties
      expect(result).toHaveProperty('webgl');
      expect(result).toHaveProperty('canvas');
      expect(result).toHaveProperty('fonts');

      // Audio properties
      expect(result).toHaveProperty('audio');

      // Browser properties
      expect(result).toHaveProperty('userAgent');
      expect(result).toHaveProperty('platform');
      expect(result).toHaveProperty('cookieEnabled');
      expect(result).toHaveProperty('doNotTrack');
      expect(result).toHaveProperty('onLine');
      expect(result).toHaveProperty('plugins');
      expect(result).toHaveProperty('localStorage');
      expect(result).toHaveProperty('sessionStorage');
      expect(result).toHaveProperty('indexedDB');
      expect(result).toHaveProperty('webSQL');

      // Preferences properties
      expect(result).toHaveProperty('language');
      expect(result).toHaveProperty('languages');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('timezoneOffset');
      expect(result).toHaveProperty('clientHints');

      // Timestamp
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('generateHash method', () => {
    it('should generate hash from fingerprint data', () => {
      const hash = fpsFingerprint.generateHash();

      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
      expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
    });

    it('should generate hash from provided fingerprint', () => {
      const mockFingerprint = {
        userAgent: 'test-agent',
        platform: 'test-platform',
        language: 'en-US',
        screen: { width: 1920, height: 1080, colorDepth: 24 },
        timezone: 'UTC',
        hardwareConcurrency: 4,
        deviceMemory: 8,
        webgl: { vendor: 'test', renderer: 'test' },
        canvas: 'test-canvas',
        audio: 'test-audio',
        fonts: ['Arial', 'Times']
      } as any;

      const hash = fpsFingerprint.generateHash(mockFingerprint);

      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
    });

    it('should generate consistent hash for same data', () => {
      const hash1 = fpsFingerprint.generateHash();
      const hash2 = fpsFingerprint.generateHash();

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different data', () => {
      const fingerprint1 = { userAgent: 'agent1' } as any;
      const fingerprint2 = { userAgent: 'agent2' } as any;

      const hash1 = fpsFingerprint.generateHash(fingerprint1);
      const hash2 = fpsFingerprint.generateHash(fingerprint2);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle null/undefined values gracefully', () => {
      const fingerprint = {
        userAgent: null,
        platform: undefined,
        language: 'en-US',
        screen: null,
        timezone: undefined,
        hardwareConcurrency: null,
        deviceMemory: undefined,
        webgl: null,
        canvas: undefined,
        audio: null,
        fonts: null
      } as any;

      expect(() => {
        const hash = fpsFingerprint.generateHash(fingerprint);
        expect(typeof hash).toBe('string');
      }).not.toThrow();
    });
  });

  describe('generateGroupHashes method', () => {
    it('should generate hashes for all groups', () => {
      const hashes = fpsFingerprint.generateGroupHashes();

      expect(hashes).toHaveProperty('hardware');
      expect(hashes).toHaveProperty('graphics');
      expect(hashes).toHaveProperty('audio');
      expect(hashes).toHaveProperty('browser');
      expect(hashes).toHaveProperty('preferences');
      expect(hashes).toHaveProperty('combined');

      // Check all hashes are valid
      Object.values(hashes).forEach(hash => {
        expect(typeof hash).toBe('string');
        expect(hash).toHaveLength(8);
        expect(/^[0-9a-f]{8}$/.test(hash)).toBe(true);
      });
    });

    it('should generate hardware-specific hash', () => {
      const hashes = fpsFingerprint.generateGroupHashes();

      expect(typeof hashes.hardware).toBe('string');
      expect(hashes.hardware).toHaveLength(8);
    });

    it('should generate graphics-specific hash', () => {
      const hashes = fpsFingerprint.generateGroupHashes();

      expect(typeof hashes.graphics).toBe('string');
      expect(hashes.graphics).toHaveLength(8);
    });

    it('should generate audio-specific hash', () => {
      const hashes = fpsFingerprint.generateGroupHashes();

      expect(typeof hashes.audio).toBe('string');
      expect(hashes.audio).toHaveLength(8);
    });

    it('should generate browser-specific hash', () => {
      const hashes = fpsFingerprint.generateGroupHashes();

      expect(typeof hashes.browser).toBe('string');
      expect(hashes.browser).toHaveLength(8);
    });

    it('should generate preferences-specific hash', () => {
      const hashes = fpsFingerprint.generateGroupHashes();

      expect(typeof hashes.preferences).toBe('string');
      expect(hashes.preferences).toHaveLength(8);
    });

    it('should generate combined hash', () => {
      const hashes = fpsFingerprint.generateGroupHashes();

      expect(typeof hashes.combined).toBe('string');
      expect(hashes.combined).toHaveLength(8);
    });

    it('should generate consistent hashes for same data', () => {
      const hashes1 = fpsFingerprint.generateGroupHashes();
      const hashes2 = fpsFingerprint.generateGroupHashes();

      expect(hashes1).toEqual(hashes2);
    });

    it('should work with provided fingerprint data', () => {
      const mockFingerprint = fpsFingerprint.collect();
      const hashes = fpsFingerprint.generateGroupHashes(mockFingerprint);

      expect(Object.keys(hashes)).toEqual([
        'hardware', 'graphics', 'audio', 'browser', 'preferences', 'combined'
      ]);
    });

    it('should handle partial fingerprint data', () => {
      const partialFingerprint = {
        deviceMemory: 8,
        userAgent: 'test-agent'
      } as any;

      expect(() => {
        const hashes = fpsFingerprint.generateGroupHashes(partialFingerprint);
        expect(typeof hashes.hardware).toBe('string');
        expect(typeof hashes.browser).toBe('string');
      }).not.toThrow();
    });
  });

  describe('sendToServer method', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true })
      });
    });

    it('should send fingerprint data using fetch', async () => {
      const callback = jest.fn();
      
      fpsFingerprint.sendToServer('/test-endpoint', undefined, callback);

      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async

      expect(mockFetch).toHaveBeenCalledWith('/test-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"fingerprint"')
      });
    });

    it('should use provided fingerprint data', async () => {
      const customFingerprint = { userAgent: 'custom-agent' } as any;
      
      fpsFingerprint.sendToServer('/test', customFingerprint);

      await new Promise(resolve => setTimeout(resolve, 0));

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.fingerprint).toEqual(customFingerprint);
    });

    it('should include timestamp in request', async () => {
      fpsFingerprint.sendToServer('/test');

      await new Promise(resolve => setTimeout(resolve, 0));

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body).toHaveProperty('timestamp');
      expect(body.timestamp).toBe('2023-08-15T12:34:56.789Z');
    });

    it('should call success callback', async () => {
      const callback = jest.fn();
      
      fpsFingerprint.sendToServer('/test', undefined, callback);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(callback).toHaveBeenCalledWith(null, { success: true });
    });

    it('should call error callback on fetch error', async () => {
      const callback = jest.fn();
      const error = new Error('Network error');
      mockFetch.mockRejectedValue(error);
      
      fpsFingerprint.sendToServer('/test', undefined, callback);

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(callback).toHaveBeenCalledWith(error, null);
    });

    it('should fallback to XMLHttpRequest when fetch is not available', () => {
      delete (global as any).fetch;

      const callback = jest.fn();
      fpsFingerprint.sendToServer('/test-xhr', undefined, callback);

      expect(mockXMLHttpRequest.open).toHaveBeenCalledWith('POST', '/test-xhr', true);
      expect(mockXMLHttpRequest.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockXMLHttpRequest.send).toHaveBeenCalled();
    });

    it('should handle XMLHttpRequest success', () => {
      delete (global as any).fetch;

      const callback = jest.fn();
      fpsFingerprint.sendToServer('/test-xhr', undefined, callback);

      // Simulate successful response
      mockXMLHttpRequest.onreadystatechange();

      expect(callback).toHaveBeenCalledWith(null, { success: true });
    });

    it('should handle XMLHttpRequest error', () => {
      delete (global as any).fetch;
      mockXMLHttpRequest.status = 500;

      const callback = jest.fn();
      fpsFingerprint.sendToServer('/test-xhr', undefined, callback);

      // Simulate error response
      mockXMLHttpRequest.onreadystatechange();

      expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
    });

    it('should handle XMLHttpRequest JSON parse error', () => {
      delete (global as any).fetch;
      mockXMLHttpRequest.responseText = 'invalid json';

      const callback = jest.fn();
      fpsFingerprint.sendToServer('/test-xhr', undefined, callback);

      // Simulate response with invalid JSON
      mockXMLHttpRequest.onreadystatechange();

      expect(callback).toHaveBeenCalledWith(expect.any(Error), null);
    });

    it('should use default endpoint when none provided', async () => {
      fpsFingerprint.sendToServer();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockFetch).toHaveBeenCalledWith('/api/fingerprint', expect.any(Object));
    });

    it('should work without callback', async () => {
      expect(() => {
        fpsFingerprint.sendToServer('/test');
      }).not.toThrow();

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('hash function consistency', () => {
    it('should generate same hash for same input string', () => {
      const instance = fpsFingerprint as any;
      
      const hash1 = instance.hashString('test-string');
      const hash2 = instance.hashString('test-string');

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different strings', () => {
      const instance = fpsFingerprint as any;
      
      const hash1 = instance.hashString('string1');
      const hash2 = instance.hashString('string2');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty strings', () => {
      const instance = fpsFingerprint as any;
      
      const hash = instance.hashString('');
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
    });

    it('should handle long strings', () => {
      const instance = fpsFingerprint as any;
      const longString = 'a'.repeat(10000);
      
      const hash = instance.hashString(longString);
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
    });

    it('should handle unicode characters', () => {
      const instance = fpsFingerprint as any;
      
      const hash = instance.hashString('🔍📱💻🌐');
      
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(8);
    });
  });

  describe('integration and edge cases', () => {
    it('should handle module collection errors gracefully', () => {
      const { HardwareFingerprint } = require('../../../../src/client/fingerprint/modules/hardware');
      HardwareFingerprint.collect.mockImplementation(() => {
        throw new Error('Hardware collection failed');
      });

      expect(() => {
        fpsFingerprint.collect();
      }).toThrow('Hardware collection failed');
    });

    it('should collect fingerprint multiple times consistently', () => {
      const fingerprint1 = fpsFingerprint.collect();
      const fingerprint2 = fpsFingerprint.collect();

      // Remove timestamps for comparison
      const { timestamp: ts1, ...fp1 } = fingerprint1;
      const { timestamp: ts2, ...fp2 } = fingerprint2;

      expect(fp1).toEqual(fp2);
    });

    it('should handle large fingerprint data efficiently', () => {
      // Mock large font list
      const { GraphicsFingerprint } = require('../../../../src/client/fingerprint/modules/graphics');
      GraphicsFingerprint.collect.mockReturnValue({
        fonts: Array.from({ length: 1000 }, (_, i) => `Font${i}`),
        canvas: 'x'.repeat(10000),
        webgl: { vendor: 'Large Vendor Data '.repeat(100), renderer: 'Large Renderer Data '.repeat(100) }
      });

      expect(() => {
        const fingerprint = fpsFingerprint.collect();
        const hash = fpsFingerprint.generateHash(fingerprint);
        const groupHashes = fpsFingerprint.generateGroupHashes(fingerprint);
        
        expect(typeof hash).toBe('string');
        expect(typeof groupHashes.combined).toBe('string');
      }).not.toThrow();
    });

    it('should maintain version consistency', () => {
      expect(fpsFingerprint.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});