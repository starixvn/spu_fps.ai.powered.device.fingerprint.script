import * as fs from 'fs';
import * as path from 'path';
import { minify } from 'terser';
import config from '../../config/environment';

export abstract class ScriptService {
  protected script: string | null = null;
  protected minifiedScript: string | null = null;
  protected lastBuildTime: number = 0;

  constructor() {
    this.generateScript();
    this.initializeMinifiedScript();
  }

  protected abstract getScriptFiles(): string[];
  protected abstract getScriptName(): string;

  protected resolveBasePath(): string | null {
    const paths = [
      path.join(__dirname, "..", "..", "client"),
      path.join(__dirname, "..", "client")
    ];

    for (const testPath of paths) {
      if (fs.existsSync(testPath)) {
        return testPath;
      }
    }

    return null;
  }

  protected shouldRebuild(scriptFiles: string[], basePath: string): boolean {
    if (!this.script) {
      return true;
    }

    for (const fileName of scriptFiles) {
      const filePath = path.join(basePath, fileName);
      if (fs.existsSync(filePath)) {
        const fileStats = fs.statSync(filePath);
        if (fileStats.mtime.getTime() > this.lastBuildTime) {
          return true;
        }
      }
    }

    return false;
  }

  protected processClientFiles(clientFiles: string[], basePath: string): string {
    let combinedJsCode = '';
    let filesProcessed = 0;

    for (const fileName of clientFiles) {
      const filePath = path.join(basePath, fileName);
      if (fs.existsSync(filePath)) {
        const processedContent = this.processFileContent(filePath);
        combinedJsCode += `\n${processedContent}\n`;
        filesProcessed++;
      }
    }

    if (filesProcessed === 0) {
      throw new Error(`No compiled ${this.getScriptName()} files found to bundle`);
    }

    return combinedJsCode;
  }

  protected processFileContent(filePath: string): string {
    let fileContent = fs.readFileSync(filePath, "utf8");

    // Replace config placeholders
    fileContent = this.replaceConfigPlaceholders(fileContent);
    
    // Remove ES6 imports/exports
    return this.removeES6Syntax(fileContent);
  }

  protected replaceConfigPlaceholders(content: string): string {
    const replacements = {
      '__VERSION__': config.version,
      '__ENCODE_KEY__': config.encodeKey,
      '__GATEWAY_URL__': config.gatewayUrl,
      '__localStorage_key__': config.localStorageKey,
      '__indexedDB_key__': config.indexedDBKey,
      '__cookies_key__': config.cookiesKey,
      '__cache_key__': config.cacheKey,
      '__session_key__': config.sessionKey
    };

    let result = content;
    for (const [placeholder, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }

    return result;
  }

  protected removeES6Syntax(content: string): string {
    return content
      .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
      .replace(/^import\s+['"].*?['"];?\s*$/gm, '')
      .replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '')
      .replace(/^export\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?\s*$/gm, '')
      .replace(/^export\s+\*\s+from\s+['"][^'"]*['"];?\s*$/gm, '')
      .replace(/^export\s+default\s+.*;?\s*$/gm, '')
      .replace(/^export\s+(default\s+)?/gm, '')
      .replace(/^export\s*\{[^}]*\}\s*$/gm, '')
      .replace(/^export\s*$/gm, '');
  }

  protected wrapInIIFE(jsCode: string): string {
    return `
(function(global) {
  'use strict';
  
  ${jsCode}
  
})(typeof window !== 'undefined' ? window : global);
`.trim();
  }

  protected generateScript(): void {
    try {
      const scriptFiles = this.getScriptFiles();
      const basePath = this.resolveBasePath();
      
      if (!basePath) {
        this.script = this.generateFallbackScript();
        return;
      }

      if (!this.shouldRebuild(scriptFiles, basePath)) {
        return;
      }
      
      const combinedJsCode = this.processClientFiles(scriptFiles, basePath);
      this.script = this.wrapInIIFE(combinedJsCode);
      this.lastBuildTime = Date.now();
      
    } catch (error) {
      this.script = this.generateFallbackScript();
    }
  }

  protected async initializeMinifiedScript(): Promise<void> {
    this.minifiedScript = await this.getMinifiedScript();
  }

  protected generateFallbackScript(): string {
    return `
console.error('❌ FPS ${this.getScriptName()} Client: TypeScript compilation failed');
`.trim();
  }

  protected fallbackMinify(script: string): string {
    const protectedContent: string[] = [];
    let protectedScript = script;
    
    protectedScript = protectedScript.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (match) => {
      const index = protectedContent.length;
      protectedContent.push(match);
      return `__PROTECTED_${index}__`;
    });
    
    protectedScript = protectedScript.replace(/__[A-Z_]+__/g, (match) => {
      const index = protectedContent.length;
      protectedContent.push(match);
      return `__PROTECTED_${index}__`;
    });
    
    let minified = protectedScript
      .replace(/\/\*[\s\S]*?\*\//g, '') 
      .replace(/\/\/.*$/gm, '') 
      .replace(/^\s+/gm, '') 
      .replace(/\s+$/gm, '') 
      .replace(/\n\s*\n/g, '\n') 
      .replace(/\s*{\s*/g, '{') 
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';') 
      .replace(/\s*,\s*/g, ',')
      .replace(/\s+/g, ' ')
      .trim();
    
    protectedContent.forEach((content, index) => {
      minified = minified.replace(`__PROTECTED_${index}__`, content);
    });
    
    return minified;
  }

  protected needsRebuild(): boolean {
    try {
      const clientTsPath = path.join(
        __dirname,
        "..",
        "client",
        `${this.getScriptName()}Client.ts`
      );
      const fallbackTsPath = path.join(
        __dirname,
        "..",
        "..",
        "src",
        "client",
        `${this.getScriptName()}Client.ts`
      );

      let tsPath: string;
      if (fs.existsSync(clientTsPath)) {
        tsPath = clientTsPath;
      } else if (fs.existsSync(fallbackTsPath)) {
        tsPath = fallbackTsPath;
      } else {
        return false;
      }

      const fileStats = fs.statSync(tsPath);
      return fileStats.mtime.getTime() > this.lastBuildTime;
    } catch {
      return false;
    }
  }

  /**
   * Get the script bundle
   */
  getScript(): string {
    if (!this.script || this.needsRebuild()) {
      this.generateScript();
    }

    return this.script || this.generateFallbackScript();
  }

  async getMinifiedScript(): Promise<string> {
    if (this.minifiedScript) {
      return this.minifiedScript;
    }
    
    try {
      const script = this.getScript();
      
      const result = await minify(script, {
        compress: {
          keep_fargs: false,
          drop_console: false,
          drop_debugger: true,
          pure_funcs: [],
          passes: 2
        },
        mangle: {
          reserved: ['window', 'document', 'global', 'self'],
          keep_fnames: false
        },
        format: {
          comments: false,
          beautify: false,
          indent_level: 0
        },
        sourceMap: false,
        ecma: 2015 
      });

      return result.code || script;
    } catch (error) {
      return this.fallbackMinify(this.getScript());
    }
  }

  /**
   * Force rebuild of the script
   */
  rebuildScript(): void {
    this.script = null;
    this.minifiedScript = null;
    this.lastBuildTime = 0;
    this.generateScript();
  }

  /**
   * Get script info for debugging
   */
  async getScriptInfo(): Promise<{
    size: number;
    minifiedSize: number;
    lastBuilt: string;
    source: string;
  }> {
    const script = this.getScript();
    const minified = await this.getMinifiedScript();
    
    return {
      size: script.length,
      minifiedSize: minified.length,
      lastBuilt: new Date(this.lastBuildTime).toISOString(),
      source: `${this.getScriptName()} bundle`,
    };
  }
}

