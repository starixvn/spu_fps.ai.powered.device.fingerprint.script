import * as fs from 'fs';
import * as path from 'path';
import config from '../../config/environment';

export class ScriptService {
  private bundledScript: string | null = null;
  private lastBuildTime: number = 0;
  
  constructor() {
    this.generateBundledScript();
  }
  
  private generateBundledScript(): void {
    try {
      const clientFiles = [
        'tagging/utils/hash.js',
        'tagging/modules/cacheApi.js',
        'tagging/modules/cookie.js',
        'tagging/modules/etag.js',
        'tagging/modules/indexedDB.js',
        'tagging/modules/localStorage.js',
        'tagging/tagging.js',
        'tagging/modules/windowName.js',
        'tagging/index.js',
      ];
      
      const clientDistPath = path.join(__dirname, '..', '..', 'client');
      const fallbackDistPath = path.join(__dirname, '..', 'client');
      
      let basePath: string;
      if (fs.existsSync(clientDistPath)) {
        basePath = clientDistPath;
      } else if (fs.existsSync(fallbackDistPath)) {
        basePath = fallbackDistPath;
      } else {
        this.bundledScript = this.generateFallbackScript();
        return;
      }
      
      let needsRebuild = !this.bundledScript;
      if (!needsRebuild) {
        for (const fileName of clientFiles) {
          const filePath = path.join(basePath, fileName);
          if (fs.existsSync(filePath)) {
            const fileStats = fs.statSync(filePath);
            if (fileStats.mtime.getTime() > this.lastBuildTime) {
              needsRebuild = true;
              break;
            }
          }
        }
      }
      
      if (!needsRebuild) {
        return;
      }
      
      let combinedJsCode = '';
      let filesProcessed = 0;
      
      for (const fileName of clientFiles) {
        const filePath = path.join(basePath, fileName);
        if (fs.existsSync(filePath)) {
          let fileContent = fs.readFileSync(filePath, 'utf8');

          fileContent = fileContent
            .replace(/__SERVER_DOMAIN__/g, config.serverDomain)
            .replace(/__localStorage_key__/g, config.localStorageKey)
            .replace(/__indexedDB_key__/g, config.indexedDBKey)
            .replace(/__cookies_key__/g, config.cookiesKey)
            .replace(/__cache_key__/g, config.cacheKey);

          let processedContent = fileContent
            .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
            .replace(/^import\s+['"].*?['"];?\s*$/gm, '')
            .replace(/^export\s+\{[^}]*\}\s*;?\s*$/gm, '')
            .replace(/^export\s+\{[^}]*\}\s+from\s+['"][^'"]*['"];?\s*$/gm, '')
            .replace(/^export\s+\*\s+from\s+['"][^'"]*['"];?\s*$/gm, '')
            .replace(/^export\s+default\s+.*;?\s*$/gm, '')
            .replace(/^export\s+(default\s+)?/gm, '')
            .replace(/^export\s*\{[^}]*\}\s*$/gm, '')
            .replace(/^export\s*$/gm, '');
          
          combinedJsCode += `\n${processedContent}\n`;
          filesProcessed++;
        }
      }
      
      if (filesProcessed === 0) {
        throw new Error('No compiled client files found to bundle');
      }
      
      this.bundledScript = this.wrapInIIFE(combinedJsCode);
      this.lastBuildTime = Date.now();
      
    } catch (error) {
      this.bundledScript = this.generateFallbackScript();
    }
  }
  
  private wrapInIIFE(jsCode: string): string {
    return `
(function(global) {
  'use strict';
  
  ${jsCode}
  
})(typeof window !== 'undefined' ? window : global);
`.trim();
  }
  
  /**
   * Get the bundled client script
   */
  getClientScript(): string {
    if (!this.bundledScript || this.needsRebuild()) {
      this.generateBundledScript();
    }
    
    return this.bundledScript || this.generateFallbackScript();
  }
  
  /**
   * Check if script needs rebuilding (in development)
   */
  private needsRebuild(): boolean {
    try {
      const clientTsPath = path.join(__dirname, '..', 'client', 'FingerprintClient.ts');
      const fallbackTsPath = path.join(__dirname, '..', '..', 'src', 'client', 'FingerprintClient.ts');
      
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
  
  getMinifiedScript(): string {
    const script = this.getClientScript();
    
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
    
    protectedScript = protectedScript.replace(/`(?:[^`\\]|\\.)*`/g, (match) => {
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
  
  getWrappedScript(config: {
    apiEndpoint?: string;
    autoCollect?: boolean;
    debug?: boolean;
  } = {}): string {
    const baseScript = this.getClientScript();
    
    const configScript = `
window.FPSConfig = {
  apiEndpoint: '${config.apiEndpoint || '/api/fingerprint'}',
  autoCollect: ${config.autoCollect || false},
  debug: ${config.debug || false}
};

if (window.FPSConfig.autoCollect) {
  window.FPSAutoCollect = true;
}

if (window.FPSConfig.debug) {
  console.log('🔍 FPS Fingerprint Client loaded with config:', window.FPSConfig);
}
`;
    
    return configScript + '\n' + baseScript;
  }
  
  /**
   * Force rebuild of the script (useful for development)
   */
  rebuildScript(): void {
    this.bundledScript = null;
    this.lastBuildTime = 0;
    this.generateBundledScript();
  }
  
  /**
   * Get script info for debugging
   */
  getScriptInfo(): {
    size: number;
    minifiedSize: number;
    lastBuilt: string;
    source: string;
  } {
    const script = this.getClientScript();
    const minified = this.getMinifiedScript();
    
    return {
      size: script.length,
      minifiedSize: minified.length,
      lastBuilt: new Date(this.lastBuildTime).toISOString(),
      source: 'TypeScript bundle'
    };
  }
  
  private generateFallbackScript(): string {
    return `
console.error('❌ FPS Fingerprint Client: TypeScript compilation failed');
`.trim();
  }
}
