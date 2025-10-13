import { TaggingScriptService } from '../../../../src/server/services/taggingScriptService';
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

describe('TaggingScriptService', () => {
  let taggingScriptService: TaggingScriptService;
  let consoleSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock path.join to return predictable paths
    mockPath.join.mockImplementation((...segments) => segments.join('/'));
    
    // Mock Terser to return minified code
    mockTerser.minify.mockResolvedValue({
      code: 'function tagging(){console.log("minified");}' // Minified version
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
    it('should initialize and generate bundled tagging script successfully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("tagging test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);

      taggingScriptService = new TaggingScriptService();

      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(taggingScriptService).toBeInstanceOf(TaggingScriptService);
    });

    it('should use fallback path when primary path does not exist', () => {
      mockFs.existsSync
        .mockReturnValueOnce(false) // Primary path doesn't exist
        .mockReturnValueOnce(true)  // Fallback path exists
        .mockReturnValue(true);     // Individual files exist
      
      mockFs.readFileSync.mockReturnValue('console.log("fallback tagging");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);

      taggingScriptService = new TaggingScriptService();

      expect(taggingScriptService).toBeInstanceOf(TaggingScriptService);
    });

    it('should generate fallback script when no client directory exists', () => {
      mockFs.existsSync.mockReturnValue(false);

      taggingScriptService = new TaggingScriptService();

      const script = taggingScriptService.getTaggingScript();
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
      
      taggingScriptService = new TaggingScriptService();
    });

    it('should return "Tagging" as script name', () => {
      // Access protected method through any for testing
      const scriptName = (taggingScriptService as any).getScriptName();
      expect(scriptName).toBe('Tagging');
    });
  });

  describe('getScriptFiles', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      taggingScriptService = new TaggingScriptService();
    });

    it('should return correct list of tagging script files', () => {
      const scriptFiles = (taggingScriptService as any).getScriptFiles();
      
      expect(scriptFiles).toBeInstanceOf(Array);
      expect(scriptFiles.length).toBe(12);
      
      // Check for key tagging files
      expect(scriptFiles).toContain('deviceFactory.js');
      expect(scriptFiles).toContain('tagging/tagging.js');
      expect(scriptFiles).toContain('tagging/index.js');
      
      // Check for utils files including errorLogger
      expect(scriptFiles).toContain('utils/domain.js');
      expect(scriptFiles).toContain('utils/errorLogger.js');
      expect(scriptFiles).toContain('utils/hash.js');
      
      // Check for all expected tagging modules
      expect(scriptFiles).toContain('tagging/modules/cacheApi.js');
      expect(scriptFiles).toContain('tagging/modules/cookie.js');
      expect(scriptFiles).toContain('tagging/modules/etag.js');
      expect(scriptFiles).toContain('tagging/modules/indexedDB.js');
      expect(scriptFiles).toContain('tagging/modules/localStorage.js');
      expect(scriptFiles).toContain('tagging/modules/windowName.js');
    });

    it('should have proper file ordering in script files array', () => {
      const scriptFiles = (taggingScriptService as any).getScriptFiles();
      
      // Verify utils/domain.js comes first
      expect(scriptFiles[0]).toBe('utils/domain.js');
      // Verify utils/errorLogger.js comes second
      expect(scriptFiles[1]).toBe('utils/errorLogger.js');
      // Verify utils/hash.js comes third
      expect(scriptFiles[2]).toBe('utils/hash.js');
      
      // Verify tagging/index.js comes last
      expect(scriptFiles[scriptFiles.length - 1]).toBe('tagging/index.js');
      
      // Verify utils comes before modules
      const utilsDomainIndex = scriptFiles.indexOf('utils/domain.js');
      const utilsErrorLoggerIndex = scriptFiles.indexOf('utils/errorLogger.js');
      const utilsHashIndex = scriptFiles.indexOf('utils/hash.js');
      const cacheApiIndex = scriptFiles.indexOf('tagging/modules/cacheApi.js');
      expect(utilsDomainIndex).toBeLessThan(cacheApiIndex);
      expect(utilsErrorLoggerIndex).toBeLessThan(cacheApiIndex);
      expect(utilsHashIndex).toBeLessThan(cacheApiIndex);
    });
  });

  describe('getTaggingScript', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("tagging test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      taggingScriptService = new TaggingScriptService();
    });

    it('should return bundled tagging script', () => {
      const script = taggingScriptService.getTaggingScript();

      expect(script).toContain('console.log("tagging test");');
      expect(script).toMatch(/\(function\(global\)/);
      expect(script).toContain("'use strict';");
      expect(script).toContain("global.enabledTag = true;");
    });

    it('should rebuild script if needed', () => {
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() + 1000) // Future time to trigger rebuild
      } as fs.Stats);

      const script = taggingScriptService.getTaggingScript();
      expect(script).toBeDefined();
    });

    it('should return fallback script when bundling fails', () => {
      mockFs.existsSync.mockReturnValue(false);
      taggingScriptService = new TaggingScriptService();

      const script = taggingScriptService.getTaggingScript();
      expect(script).toContain('TypeScript compilation failed');
    });
  });

  describe('getMinifiedTaggingScript', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(`
        // This is a tagging comment
        /* Block comment for tagging */
        function taggingTest() {
          console.log("tagging hello world");
          
          return { tagging: true };
        }
      `);
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      taggingScriptService = new TaggingScriptService();
    });

    it('should return minified version of the tagging script', async () => {
      const original = taggingScriptService.getTaggingScript();
      const minified = await taggingScriptService.getMinifiedTaggingScript();

      expect(typeof minified).toBe('string');
      expect(minified.length).toBeGreaterThan(0);
      expect(minified).toBeDefined();
    });

    it('should use Terser when minifying tagging script', async () => {
      const minified = await taggingScriptService.getMinifiedTaggingScript();
      
      expect(mockTerser.minify).toHaveBeenCalled();
      expect(minified).toBeTruthy();
      expect(typeof minified).toBe('string');
    });
  });

  describe('rebuildScript', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("original tagging");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      taggingScriptService = new TaggingScriptService();
    });

    it('should force rebuild of the tagging script', () => {
      const originalScript = taggingScriptService.getTaggingScript();
      
      mockFs.readFileSync.mockReturnValue('console.log("rebuilt tagging");');
      
      taggingScriptService.rebuildScript();
      const rebuiltScript = taggingScriptService.getTaggingScript();

      expect(rebuiltScript).toContain('console.log("rebuilt tagging");');
      expect(rebuiltScript).not.toBe(originalScript);
    });
  });

  describe('getScriptInfo', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("tagging test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      taggingScriptService = new TaggingScriptService();
    });

    it('should return tagging script information', async () => {
      const info = await taggingScriptService.getScriptInfo();

      expect(info).toHaveProperty('size');
      expect(info).toHaveProperty('minifiedSize');
      expect(info).toHaveProperty('lastBuilt');
      expect(info).toHaveProperty('source');

      expect(typeof info.size).toBe('number');
      expect(typeof info.minifiedSize).toBe('number');
      expect(typeof info.lastBuilt).toBe('string');
      expect(info.source).toBe('Tagging bundle');
    });

    it('should show script info with valid timestamp', async () => {
      const info = await taggingScriptService.getScriptInfo();

      expect(() => new Date(info.lastBuilt)).not.toThrow();
      expect(new Date(info.lastBuilt).toISOString()).toBe(info.lastBuilt);
    });
  });

  describe('IIFE wrapping', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("tagging test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      taggingScriptService = new TaggingScriptService();
    });

    it('should wrap tagging code in IIFE', () => {
      const script = taggingScriptService.getTaggingScript();

      expect(script).toMatch(/\(function\(global\)/);
      expect(script).toContain("'use strict';");
      expect(script).toContain("global.enabledTag = true;");
      expect(script).toContain('console.log("tagging test");');
      expect(script).toMatch(/\}\)\(typeof window !== 'undefined' \? window : global\);/);
    });
  });

  describe('error handling', () => {
    it('should handle fs.readFileSync errors for tagging files', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Tagging file read error');
      });

      taggingScriptService = new TaggingScriptService();
      const script = taggingScriptService.getTaggingScript();

      expect(script).toContain('TypeScript compilation failed');
    });

    it('should handle path.join errors for tagging paths', () => {
      mockPath.join.mockImplementation(() => {
        throw new Error('Tagging path error');
      });

      taggingScriptService = new TaggingScriptService();
      const script = taggingScriptService.getTaggingScript();

      expect(script).toContain('TypeScript compilation failed');
    });

    it('should handle terser minification errors gracefully', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("tagging test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);

      // Mock Terser to fail
      mockTerser.minify.mockRejectedValue(new Error('Minification failed'));

      taggingScriptService = new TaggingScriptService();
      const minified = await taggingScriptService.getMinifiedTaggingScript();

      // Should fallback to regex-based minification
      expect(typeof minified).toBe('string');
      expect(minified.length).toBeGreaterThan(0);
    });
  });

  describe('script file validation', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      taggingScriptService = new TaggingScriptService();
    });

    it('should include all required tagging module files', () => {
      const scriptFiles = (taggingScriptService as any).getScriptFiles();
      
      const expectedFiles = [
        'utils/domain.js',
        'utils/errorLogger.js',
        'utils/hash.js',
        'deviceFactory.js',
        'tagging/modules/cacheApi.js',
        'tagging/modules/cookie.js',
        'tagging/modules/etag.js',
        'tagging/modules/indexedDB.js',
        'tagging/modules/localStorage.js',
        'tagging/modules/windowName.js',
        'tagging/tagging.js',
        'tagging/index.js'
      ];

      expectedFiles.forEach(file => {
        expect(scriptFiles).toContain(file);
      });

      // Verify exact count
      expect(scriptFiles.length).toBe(expectedFiles.length);
    });

    it('should have proper file ordering in script files array', () => {
      const scriptFiles = (taggingScriptService as any).getScriptFiles();
      
      // Verify key ordering constraints
      expect(scriptFiles.indexOf('utils/domain.js')).toBe(0);
      expect(scriptFiles.indexOf('utils/errorLogger.js')).toBe(1);
      expect(scriptFiles.indexOf('utils/hash.js')).toBe(2);
      expect(scriptFiles.indexOf('deviceFactory.js')).toBe(3);
      expect(scriptFiles.indexOf('tagging/modules/cacheApi.js')).toBe(4);
      expect(scriptFiles.indexOf('tagging/index.js')).toBe(scriptFiles.length - 1);
      
      // Verify utils comes before core tagging
      const utilsDomainIndex = scriptFiles.indexOf('utils/domain.js');
      const utilsErrorLoggerIndex = scriptFiles.indexOf('utils/errorLogger.js');
      const utilsHashIndex = scriptFiles.indexOf('utils/hash.js');
      const taggingIndex = scriptFiles.indexOf('tagging/tagging.js');
      expect(utilsDomainIndex).toBeLessThan(taggingIndex);
      expect(utilsErrorLoggerIndex).toBeLessThan(taggingIndex);
      expect(utilsHashIndex).toBeLessThan(taggingIndex);
      
      // Verify core tagging comes before index
      const indexIndex = scriptFiles.indexOf('tagging/index.js');
      expect(taggingIndex).toBeLessThan(indexIndex);
    });
  });
});
