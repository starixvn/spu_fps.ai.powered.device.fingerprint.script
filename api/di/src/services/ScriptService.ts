import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

export class ScriptService {
  private bundledScript: string | null = null;
  private lastBuildTime: number = 0;
  
  constructor() {
    this.generateBundledScript();
  }
  
  /**
   * Generate bundled JavaScript from multiple TypeScript client files
   */
  private generateBundledScript(): void {
    try {
      // Define all TypeScript files to bundle in order
      const clientFiles = [
        'types.ts',
        'hardware.ts',
        'graphics.ts',
        'audio.ts',
        'browser.ts',
        'preferences.ts',
        'FingerprintClient.ts'
      ];
      
      const clientTsPath = path.join(__dirname, '..', '..', 'src', 'client');
      const fallbackTsPath = path.join(__dirname, '..', 'client');
      
      let basePath: string;
      if (fs.existsSync(clientTsPath)) {
        basePath = clientTsPath;
        console.log(`📂 Using client path: ${basePath}`);
      } else if (fs.existsSync(fallbackTsPath)) {
        basePath = fallbackTsPath;
        console.log(`📂 Using fallback path: ${basePath}`);
      } else {
        console.warn(`❌ TypeScript client directory not found. Checked:
        - ${clientTsPath}
        - ${fallbackTsPath}`);
        this.bundledScript = this.generateFallbackScript();
        return;
      }
      
      // Check if any files have been modified
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
        return; // No need to rebuild
      }
      
      // Read and combine all TypeScript files
      let combinedTsCode = '';
      let filesProcessed = 0;
      
      for (const fileName of clientFiles) {
        const filePath = path.join(basePath, fileName);
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Process content for bundling
          let processedContent = fileContent
            // Remove import statements
            .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
            // Remove export statements but keep the content
            .replace(/^export\s+\{.*?\}\s*;?\s*$/gm, '')
            .replace(/^export\s+(default\s+)?/gm, '')
            .replace(/^export\s+/gm, '');
          
          combinedTsCode += `\n// === ${fileName} ===\n${processedContent}\n`;
          filesProcessed++;
        }
      }
      
      if (filesProcessed === 0) {
        throw new Error('No TypeScript client files found to bundle');
      }
      
      console.log(`📦 Bundling ${filesProcessed} TypeScript client files...`);
      
      // Compile TypeScript to JavaScript
      const result = ts.transpile(combinedTsCode, {
        target: ts.ScriptTarget.ES2018,
        module: ts.ModuleKind.None,
        removeComments: true,
        strict: false,
        lib: ['dom', 'es2018'],
        skipLibCheck: true
      });
      
      // Wrap in IIFE for browser compatibility
      this.bundledScript = this.wrapInIIFE(result);
      this.lastBuildTime = Date.now();
      
      console.log('✅ Successfully bundled TypeScript client modules to JavaScript');
      
    } catch (error) {
      console.error('Error bundling TypeScript client:', error);
      this.bundledScript = this.generateFallbackScript();
    }
  }
  
  /**
   * Wrap compiled JavaScript in IIFE for browser compatibility
   */
  private wrapInIIFE(jsCode: string): string {
    return `
(function() {
  'use strict';
  
  // FPS Device Fingerprinting - Bundled from TypeScript
  // Generated at: ${new Date().toISOString()}
  
  ${jsCode}
  
})();
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
  
  /**
   * Get minified version of the script
   */
  getMinifiedScript(): string {
    const script = this.getClientScript();
    
    // Simple minification
    return script
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/^\s+/gm, '') // Remove leading whitespace
      .replace(/\s+$/gm, '') // Remove trailing whitespace
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .replace(/\s*{\s*/g, '{') // Compress braces
      .replace(/\s*}\s*/g, '}') // Compress braces
      .replace(/\s*;\s*/g, ';') // Compress semicolons
      .replace(/\s*,\s*/g, ',') // Compress commas
      .replace(/\s+/g, ' ') // Compress multiple spaces
      .trim();
  }
  
  /**
   * Get script with configuration wrapper
   */
  getWrappedScript(config: {
    apiEndpoint?: string;
    autoCollect?: boolean;
    debug?: boolean;
  } = {}): string {
    const baseScript = this.getClientScript();
    
    const configScript = `
// Configuration
window.FPSConfig = {
  apiEndpoint: '${config.apiEndpoint || '/api/fingerprint'}',
  autoCollect: ${config.autoCollect || false},
  debug: ${config.debug || false}
};

// Auto-collect configuration
if (window.FPSConfig.autoCollect) {
  window.FPSAutoCollect = true;
}

// Debug logging
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
  
  /**
   * Generate a fallback script if TypeScript compilation fails
   */
  private generateFallbackScript(): string {
    console.error('❌ FPS: TypeScript bundle compilation failed - serving empty script');
    return `
// FPS Fingerprint Client - Compilation Failed
console.error('❌ FPS Fingerprint Client: TypeScript compilation failed');
`.trim();
  }
}
