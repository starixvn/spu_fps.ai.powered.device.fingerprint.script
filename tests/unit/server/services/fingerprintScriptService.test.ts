import { FingerprintScriptService } from '../../../../src/server/services/fingerprintScriptService';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
jest.mock('path');
jest.mock('terser', () => ({
  minify: jest.fn()
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;
const mockTerser = require('terser');

describe('FingerprintScriptService', () => {
  let fingerprintService: FingerprintScriptService;
  let consoleSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock path.join to return predictable paths
    mockPath.join.mockImplementation((...segments) => segments.join('/'));
    
    // Mock Terser to return minified code
    mockTerser.minify.mockResolvedValue({
      code: 'function fingerprint(){console.log("minified");}' // Minified version
    });
    
    // Mock console methods to reduce noise and track calls
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize and generate bundled fingerprint script successfully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("fingerprint test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);

      fingerprintService = new FingerprintScriptService();

      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(fingerprintService).toBeInstanceOf(FingerprintScriptService);
    });

    it('should use fallback path when primary path does not exist', () => {
      mockFs.existsSync
        .mockReturnValueOnce(false) // Primary path doesn't exist
        .mockReturnValueOnce(true)  // Fallback path exists
        .mockReturnValue(true);     // Individual files exist
      
      mockFs.readFileSync.mockReturnValue('console.log("fallback fingerprint");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);

      fingerprintService = new FingerprintScriptService();

      expect(fingerprintService).toBeInstanceOf(FingerprintScriptService);
    });

    it('should generate fallback script when no client directory exists', () => {
      mockFs.existsSync.mockReturnValue(false);

      fingerprintService = new FingerprintScriptService();

      const script = fingerprintService.getFingerprintScript();
      expect(script).toContain('TypeScript compilation failed');
    });
  });

  describe('getScriptName', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      fingerprintService = new FingerprintScriptService();
    });

    it('should return "Fingerprint" as script name', () => {
      // Access protected method through any for testing
      const scriptName = (fingerprintService as any).getScriptName();
      expect(scriptName).toBe('Fingerprint');
    });
  });

  describe('getScriptFiles', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      fingerprintService = new FingerprintScriptService();
    });

    it('should return correct list of fingerprint script files', () => {
      const scriptFiles = (fingerprintService as any).getScriptFiles();
      
      expect(scriptFiles).toBeInstanceOf(Array);
      expect(scriptFiles.length).toBeGreaterThan(0);
      
      // Check for key files
      expect(scriptFiles).toContain('utils/hash.js');
      expect(scriptFiles).toContain('fingerprint/f4Fingerprint.js');
      expect(scriptFiles).toContain('fingerprint/f5Fingerprint.js');
      expect(scriptFiles).toContain('fingerprint/index.js');
      
      // Check for module categories
      expect(scriptFiles.some((file: string) => file.includes('hardware'))).toBe(true);
      expect(scriptFiles.some((file: string) => file.includes('graphics'))).toBe(true);
      expect(scriptFiles.some((file: string) => file.includes('audio'))).toBe(true);
      expect(scriptFiles.some((file: string) => file.includes('browser'))).toBe(true);
      expect(scriptFiles.some((file: string) => file.includes('preference'))).toBe(true);
    });
  });

  describe('getFingerprintScript', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("fingerprint test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      fingerprintService = new FingerprintScriptService();
    });

    it('should return bundled fingerprint script', () => {
      const script = fingerprintService.getFingerprintScript();

      expect(script).toContain('console.log("fingerprint test");');
      expect(script).toMatch(/^\(function\(global\)/);
      expect(script).toContain("'use strict';");
    });

    it('should rebuild script if needed', () => {
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() + 1000) // Future time to trigger rebuild
      } as fs.Stats);

      const script = fingerprintService.getFingerprintScript();
      expect(script).toBeDefined();
    });

    it('should return fallback script when bundling fails', () => {
      mockFs.existsSync.mockReturnValue(false);
      fingerprintService = new FingerprintScriptService();

      const script = fingerprintService.getFingerprintScript();
      expect(script).toContain('TypeScript compilation failed');
    });
  });

  describe('getMinifiedFingerprintScript', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(`
        // This is a fingerprint comment
        /* Block comment for fingerprint */
        function fingerprintTest() {
          console.log("fingerprint hello world");
          
          return { fingerprint: true };
        }
      `);
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      fingerprintService = new FingerprintScriptService();
    });

    it('should return minified version of the fingerprint script', async () => {
      const original = fingerprintService.getFingerprintScript();
      const minified = await fingerprintService.getMinifiedFingerprintScript();

      expect(typeof minified).toBe('string');
      expect(minified.length).toBeGreaterThan(0);
      expect(minified).toBeDefined();
    });

    it('should use Terser when minifying fingerprint script', async () => {
      const minified = await fingerprintService.getMinifiedFingerprintScript();
      
      expect(mockTerser.minify).toHaveBeenCalled();
      expect(minified).toBeTruthy();
      expect(typeof minified).toBe('string');
    });
  });

  describe('rebuildScript', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("original fingerprint");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      fingerprintService = new FingerprintScriptService();
    });

    it('should force rebuild of the fingerprint script', () => {
      const originalScript = fingerprintService.getFingerprintScript();
      
      mockFs.readFileSync.mockReturnValue('console.log("rebuilt fingerprint");');
      
      fingerprintService.rebuildScript();
      const rebuiltScript = fingerprintService.getFingerprintScript();

      expect(rebuiltScript).toContain('console.log("rebuilt fingerprint");');
      expect(rebuiltScript).not.toBe(originalScript);
    });
  });

  describe('getScriptInfo', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("fingerprint test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      fingerprintService = new FingerprintScriptService();
    });

    it('should return fingerprint script information', async () => {
      const info = await fingerprintService.getScriptInfo();

      expect(info).toHaveProperty('size');
      expect(info).toHaveProperty('minifiedSize');
      expect(info).toHaveProperty('lastBuilt');
      expect(info).toHaveProperty('source');

      expect(typeof info.size).toBe('number');
      expect(typeof info.minifiedSize).toBe('number');
      expect(typeof info.lastBuilt).toBe('string');
      expect(info.source).toBe('Fingerprint bundle');
    });

    it('should show script info with valid timestamp', async () => {
      const info = await fingerprintService.getScriptInfo();

      expect(() => new Date(info.lastBuilt)).not.toThrow();
      expect(new Date(info.lastBuilt).toISOString()).toBe(info.lastBuilt);
    });
  });

  describe('IIFE wrapping', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("fingerprint test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      fingerprintService = new FingerprintScriptService();
    });

    it('should wrap fingerprint code in IIFE', () => {
      const script = fingerprintService.getFingerprintScript();

      expect(script).toMatch(/^\(function\(global\)/);
      expect(script).toContain("'use strict';");
      expect(script).toContain('console.log("fingerprint test");');
      expect(script).toMatch(/\}\)\(typeof window !== 'undefined' \? window : global\);$/);
    });
  });

  describe('error handling', () => {
    it('should handle fs.readFileSync errors for fingerprint files', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Fingerprint file read error');
      });

      fingerprintService = new FingerprintScriptService();
      const script = fingerprintService.getFingerprintScript();

      expect(script).toContain('TypeScript compilation failed');
    });

    it('should handle path.join errors for fingerprint paths', () => {
      mockPath.join.mockImplementation(() => {
        throw new Error('Fingerprint path error');
      });

      fingerprintService = new FingerprintScriptService();
      const script = fingerprintService.getFingerprintScript();

      expect(script).toContain('TypeScript compilation failed');
    });

    it('should handle terser minification errors gracefully', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      mockTerser.minify.mockRejectedValue(new Error('Terser error'));
      
      fingerprintService = new FingerprintScriptService();
      const minified = await fingerprintService.getMinifiedFingerprintScript();
      
      expect(minified).toBeDefined();
      expect(typeof minified).toBe('string');
    });
  });

  describe('script file validation', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      fingerprintService = new FingerprintScriptService();
    });

    it('should include all required fingerprint module files', () => {
      const scriptFiles = (fingerprintService as any).getScriptFiles();
      
      // Core files
      expect(scriptFiles).toContain('fingerprint/index.js');
      expect(scriptFiles).toContain('utils/dom.js');
      expect(scriptFiles).toContain('utils/deviceFactory.js');
      
      // Utils
      expect(scriptFiles).toContain('utils/hash.js');
      expect(scriptFiles).toContain('utils/domain.js');
      
      // Fingerprint utils
      expect(scriptFiles).toContain('fingerprint/utils/hash.js');
      expect(scriptFiles).toContain('fingerprint/utils/data.js');
      expect(scriptFiles).toContain('fingerprint/utils/browser.js');
      expect(scriptFiles).toContain('fingerprint/utils/dom.js');
      
      // Session
      expect(scriptFiles).toContain('sessionKey/index.js');
      
      // Hardware modules
      expect(scriptFiles).toContain('fingerprint/modules/hardware/index.js');
      expect(scriptFiles).toContain('fingerprint/modules/hardware/platform.js');
      expect(scriptFiles).toContain('fingerprint/modules/hardware/architecture.js');
      
      // Graphics modules
      expect(scriptFiles).toContain('fingerprint/modules/graphics/index.js');
      expect(scriptFiles).toContain('fingerprint/modules/graphics/canvas.js');
      expect(scriptFiles).toContain('fingerprint/modules/graphics/webglBasics.js');
      
      // Audio modules
      expect(scriptFiles).toContain('fingerprint/modules/audio/index.js');
      expect(scriptFiles).toContain('fingerprint/modules/audio/audio.js');
      
      // Browser modules
      expect(scriptFiles).toContain('fingerprint/modules/browser/index.js');
      expect(scriptFiles).toContain('fingerprint/modules/browser/browserName.js');
      expect(scriptFiles).toContain('fingerprint/modules/browser/userAgent.js');
      
      // Preference modules
      expect(scriptFiles).toContain('fingerprint/modules/preference/index.js');
      expect(scriptFiles).toContain('fingerprint/modules/preference/languages.js');
      expect(scriptFiles).toContain('fingerprint/modules/preference/timezone.js');
      
      // Core fingerprint files
      expect(scriptFiles).toContain('fingerprint/abstract/abstractFingerprint.js');
      expect(scriptFiles).toContain('fingerprint/f4Fingerprint.js');
      expect(scriptFiles).toContain('fingerprint/f5Fingerprint.js');
      
      // IP modules
      expect(scriptFiles).toContain('ip/index.js');
      expect(scriptFiles).toContain('ip/modules/webrtc/index.js');
      expect(scriptFiles).toContain('ip/modules/webrtc/ipCollector.js');
    });

    it('should have proper file ordering in script files array', () => {
      const scriptFiles = (fingerprintService as any).getScriptFiles();
      
      // Utils should come before fingerprint modules
      const utilsIndex = scriptFiles.findIndex((file: string) => file === 'utils/hash.js');
      const fingerprintIndex = scriptFiles.findIndex((file: string) => file === 'fingerprint/f4Fingerprint.js');
      expect(utilsIndex).toBeLessThan(fingerprintIndex);
      
      // Domain utils should also come before fingerprint modules
      const domainUtilsIndex = scriptFiles.findIndex((file: string) => file === 'utils/domain.js');
      expect(domainUtilsIndex).toBeLessThan(fingerprintIndex);
      
      // Core fingerprint/index.js should come last
      const fingerprintIndexJsIndex = scriptFiles.findIndex((file: string) => file === 'fingerprint/index.js');
      expect(fingerprintIndexJsIndex).toBe(scriptFiles.length - 1); // should be the last file
    });
  });
});
