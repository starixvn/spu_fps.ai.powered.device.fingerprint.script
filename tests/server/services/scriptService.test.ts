import { ScriptService } from '../../../src/server/services/scriptService';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('ScriptService', () => {
  let scriptService: ScriptService;
  let consoleSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock path.join to return predictable paths
    mockPath.join.mockImplementation((...segments) => segments.join('/'));
    
    // Mock console methods to reduce noise and track calls
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize and generate bundled script successfully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);

      scriptService = new ScriptService();

      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('📂 Using client path:'));
    });

    it('should use fallback path when primary path does not exist', () => {
      mockFs.existsSync
        .mockReturnValueOnce(false) // Primary path doesn't exist
        .mockReturnValueOnce(true)  // Fallback path exists
        .mockReturnValue(true);     // Individual files exist
      
      mockFs.readFileSync.mockReturnValue('console.log("fallback");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);

      scriptService = new ScriptService();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('📂 Using fallback path:'));
    });

    it('should generate fallback script when no client directory exists', () => {
      mockFs.existsSync.mockReturnValue(false);

      scriptService = new ScriptService();

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('❌ Compiled client directory not found'));
    });
  });

  describe('getClientScript', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      scriptService = new ScriptService();
    });

    it('should return bundled script', () => {
      const script = scriptService.getClientScript();

      expect(script).toContain('FPS Device Fingerprinting - Bundled from TypeScript');
      expect(script).toContain('console.log("test");');
      expect(script).toMatch(/^\(function\(global\)/);
    });

    it('should rebuild script if needed', () => {
      // Mock needsRebuild to return true
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() + 1000) // Future time to trigger rebuild
      } as fs.Stats);

      const script = scriptService.getClientScript();

      expect(script).toBeDefined();
    });

    it('should return fallback script when bundling fails', () => {
      mockFs.existsSync.mockReturnValue(false);
      scriptService = new ScriptService();

      const script = scriptService.getClientScript();

      expect(script).toContain('TypeScript compilation failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('❌ FPS: TypeScript bundle compilation failed'));
    });
  });

  describe('getMinifiedScript', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(`
        // This is a comment
        /* Block comment */
        function test() {
          console.log("hello world");
          
          return true;
        }
      `);
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      scriptService = new ScriptService();
    });

    it('should return minified version of the script', () => {
      const original = scriptService.getClientScript();
      const minified = scriptService.getMinifiedScript();

      expect(minified.length).toBeLessThan(original.length);
      expect(minified).not.toContain('// This is a comment');
      expect(minified).not.toContain('/* Block comment */');
      expect(minified).not.toContain('\n\n'); // No double newlines
    });

    it('should remove comments and compress whitespace', () => {
      const minified = scriptService.getMinifiedScript();

      expect(minified).not.toMatch(/\/\*[\s\S]*?\*\//); // No block comments
      expect(minified).not.toMatch(/\/\/.*$/m); // No line comments
      expect(minified).not.toMatch(/^\s+/m); // No leading whitespace
    });
  });

  describe('getWrappedScript', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      scriptService = new ScriptService();
    });

    it('should wrap script with default configuration', () => {
      const wrapped = scriptService.getWrappedScript();

      expect(wrapped).toContain('window.FPSConfig');
      expect(wrapped).toContain("apiEndpoint: '/api/fingerprint'");
      expect(wrapped).toContain('autoCollect: false');
      expect(wrapped).toContain('debug: false');
    });

    it('should wrap script with custom configuration', () => {
      const config = {
        apiEndpoint: '/custom/api',
        autoCollect: true,
        debug: true
      };

      const wrapped = scriptService.getWrappedScript(config);

      expect(wrapped).toContain("apiEndpoint: '/custom/api'");
      expect(wrapped).toContain('autoCollect: true');
      expect(wrapped).toContain('debug: true');
      expect(wrapped).toContain('window.FPSAutoCollect = true');
    });

    it('should include auto-collect logic when enabled', () => {
      const wrapped = scriptService.getWrappedScript({ autoCollect: true });

      expect(wrapped).toContain('window.FPSAutoCollect = true');
    });

    it('should include debug logging when enabled', () => {
      const wrapped = scriptService.getWrappedScript({ debug: true });

      expect(wrapped).toContain('🔍 FPS Fingerprint Client loaded with config:');
    });
  });

  describe('rebuildScript', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      scriptService = new ScriptService();
    });

    it('should force rebuild of the script', () => {
      const originalScript = scriptService.getClientScript();
      
      mockFs.readFileSync.mockReturnValue('console.log("rebuilt");');
      
      scriptService.rebuildScript();
      const rebuiltScript = scriptService.getClientScript();

      expect(rebuiltScript).toContain('console.log("rebuilt");');
      expect(rebuiltScript).not.toBe(originalScript);
    });
  });

  describe('getScriptInfo', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      scriptService = new ScriptService();
    });

    it('should return script information', () => {
      const info = scriptService.getScriptInfo();

      expect(info).toHaveProperty('size');
      expect(info).toHaveProperty('minifiedSize');
      expect(info).toHaveProperty('lastBuilt');
      expect(info).toHaveProperty('source');

      expect(typeof info.size).toBe('number');
      expect(typeof info.minifiedSize).toBe('number');
      expect(typeof info.lastBuilt).toBe('string');
      expect(info.source).toBe('TypeScript bundle');
    });

    it('should show minified script is smaller', () => {
      const info = scriptService.getScriptInfo();

      expect(info.minifiedSize).toBeLessThanOrEqual(info.size);
    });

    it('should return valid ISO date string for lastBuilt', () => {
      const info = scriptService.getScriptInfo();

      expect(() => new Date(info.lastBuilt)).not.toThrow();
      expect(new Date(info.lastBuilt).toISOString()).toBe(info.lastBuilt);
    });
  });

  describe('IIFE wrapping', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
      
      scriptService = new ScriptService();
    });

    it('should wrap code in IIFE', () => {
      const script = scriptService.getClientScript();

      expect(script).toMatch(/^\(function\(global\)/);
      expect(script).toContain("'use strict';");
      expect(script).toContain('FPS Device Fingerprinting - Bundled from TypeScript');
      expect(script).toContain('Generated at:');
      expect(script).toMatch(/\}\)\(typeof window !== 'undefined' \? window : global\);$/);
    });

    it('should include generation timestamp', () => {
      const script = scriptService.getClientScript();

      expect(script).toMatch(/Generated at: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });
  });

  describe('needsRebuild method (private)', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('console.log("test");');
    });

    it('should detect when rebuild is needed', () => {
      // Mock file with old timestamp
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);

      scriptService = new ScriptService();
      
      // Mock file with newer timestamp to trigger rebuild
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() + 1000) 
      } as fs.Stats);

      // This should trigger a rebuild internally
      const script = scriptService.getClientScript();
      expect(script).toBeDefined();
    });

    it('should handle missing TypeScript files gracefully', () => {
      mockFs.statSync
        .mockReturnValueOnce({ mtime: new Date(Date.now() - 1000) } as fs.Stats) // For initial build
        .mockImplementation(() => {
          throw new Error('File not found');
        });

      scriptService = new ScriptService();
      
      // Should not throw and should return script
      const script = scriptService.getClientScript();
      expect(script).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle fs.readFileSync errors', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      scriptService = new ScriptService();
      const script = scriptService.getClientScript();

      expect(script).toContain('TypeScript compilation failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error bundling TypeScript client:', expect.any(Error));
    });

    it('should handle path.join errors', () => {
      mockPath.join.mockImplementation(() => {
        throw new Error('Path error');
      });

      scriptService = new ScriptService();
      const script = scriptService.getClientScript();

      expect(script).toContain('TypeScript compilation failed');
    });
  });

  describe('script content processing', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.statSync.mockReturnValue({ 
        mtime: new Date(Date.now() - 1000) 
      } as fs.Stats);
    });

    it('should add file separators', () => {
      mockFs.readFileSync.mockReturnValue('console.log("file content");');
      scriptService = new ScriptService();
      const script = scriptService.getClientScript();

      expect(script).toMatch(/=== .*\.js ===/);
    });
  });
});
