import * as fs from 'fs';
import * as path from 'path';
import { minify } from 'terser';
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
        "utils/hash.js",
        "deviceFactory.js",
        "sessionKey/index.js",
        "tagging/modules/cacheApi.js",
        "tagging/modules/cookie.js",
        "tagging/modules/etag.js",
        "tagging/modules/indexedDB.js",
        "tagging/modules/localStorage.js",
        "tagging/tagging.js",
        "tagging/modules/windowName.js",
        "tagging/index.js",
        "fingerprint/utils/hash.js",
        "fingerprint/modules/hardware/platform.js",
        "fingerprint/modules/hardware/architecture.js",
        "fingerprint/modules/hardware/osCpu.js",
        "fingerprint/modules/hardware/cpuClass.js",
        "fingerprint/modules/hardware/hardwareConcurrency.js",
        "fingerprint/modules/hardware/deviceMemory.js",
        "fingerprint/modules/hardware/index.js",
        "fingerprint/modules/graphics/canvas.js",
        "fingerprint/modules/graphics/webglBasics.js",
        "fingerprint/modules/graphics/webglExtensions.js",
        "fingerprint/modules/graphics/fonts.js",
        "fingerprint/modules/graphics/fontPreferences.js",
        "fingerprint/modules/graphics/screenResolution.js",
        "fingerprint/modules/graphics/screenFrame.js",
        "fingerprint/modules/graphics/colorDepth.js",
        "fingerprint/modules/graphics/colorGamut.js",
        "fingerprint/modules/graphics/index.js",
        "fingerprint/modules/audio/audio.js",
        "fingerprint/modules/audio/audioBaseLatency.js",
        "fingerprint/modules/audio/index.js",
        "fingerprint/modules/browser/browserName.js",
        "fingerprint/modules/browser/osName.js",
        "fingerprint/modules/browser/userAgent.js",
        "fingerprint/modules/browser/vendor.js",
        "fingerprint/modules/browser/vendorFlavors.js",
        "fingerprint/modules/browser/plugins.js",
        "fingerprint/modules/browser/pdfViewerEnabled.js",
        "fingerprint/modules/browser/index.js",
        "fingerprint/modules/preference/languages.js",
        "fingerprint/modules/preference/timezone.js",
        "fingerprint/modules/preference/touchSupport.js",
        "fingerprint/modules/preference/cookiesEnabled.js",
        "fingerprint/modules/preference/localStorage.js",
        "fingerprint/modules/preference/sessionStorage.js",
        "fingerprint/modules/preference/openDatabase.js",
        "fingerprint/modules/preference/indexedDb.js",
        "fingerprint/modules/preference/index.js",
        "fingerprint/abstract/abstractFingerprint.js",
        "fingerprint/f4Fingerprint.js",
        "fingerprint/f5Fingerprint.js",
        "ip/modules/webrtc/ipCollector.js",
        "ip/modules/webrtc/index.js",
        "ip/index.js",
        "index.js",
        "dom.js",
      ];

      const clientDistPath = path.join(__dirname, "..", "..", "client");
      const fallbackDistPath = path.join(__dirname, "..", "client");

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
          let fileContent = fs.readFileSync(filePath, "utf8");

          fileContent = fileContent
            .replace(/__SERVER_DOMAIN__/g, config.serverDomain)
            .replace(/__VERSION__/g, config.version)
            .replace(/__ENCODE_KEY__/g, config.encodeKey)
            .replace(/__GATEWAY_URL__/g, config.gatewayUrl)
            .replace(/__localStorage_key__/g, config.localStorageKey)
            .replace(/__indexedDB_key__/g, config.indexedDBKey)
            .replace(/__cookies_key__/g, config.cookiesKey)
            .replace(/__cache_key__/g, config.cacheKey)
            .replace(/__session_key__/g, config.sessionKey);

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
        throw new Error("No compiled client files found to bundle");
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
      const clientTsPath = path.join(
        __dirname,
        "..",
        "client",
        "FingerprintClient.ts"
      );
      const fallbackTsPath = path.join(
        __dirname,
        "..",
        "..",
        "src",
        "client",
        "FingerprintClient.ts"
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
  
  async getMinifiedScript(): Promise<string> {
    try {
      const script = this.getClientScript();
      
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
      return this.fallbackMinify(this.getClientScript());
    }
  }

  getMinifiedScriptSync(): string {
    return this.fallbackMinify(this.getClientScript());
  }

  private fallbackMinify(script: string): string {
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
  
  getWrappedScript(config: {
    apiEndpoint?: string;
    autoCollect?: boolean;
    debug?: boolean;
  } = {}): string {
    const baseScript = this.getClientScript();

    const configScript = `
window.FPSConfig = {
  apiEndpoint: '${config.apiEndpoint || "/api/fingerprint"}',
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

    return configScript + "\n" + baseScript;
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
  async getScriptInfo(): Promise<{
    size: number;
    minifiedSize: number;
    lastBuilt: string;
    source: string;
  }> {
    const script = this.getClientScript();
    const minified = await this.getMinifiedScript();
    
    return {
      size: script.length,
      minifiedSize: minified.length,
      lastBuilt: new Date(this.lastBuildTime).toISOString(),
      source: "TypeScript bundle",
    };
  }
  
  private generateFallbackScript(): string {
    return `
console.error('❌ FPS Fingerprint Client: TypeScript compilation failed');
`.trim();
  }
}
