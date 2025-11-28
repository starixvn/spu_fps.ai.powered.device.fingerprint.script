import { ScriptService } from './scriptService';
import config from '../config/environment';

export class ScoringScriptService extends ScriptService {
  
  protected getScriptName(): string {
    return 'Scoring';
  }

  protected getScriptFiles(): string[] {
    return [
      // Utils
      "utils/hash.js",
      "utils/deviceFactory.js",
      "utils/dom.js",
      
      // Scoring Core
      "scoring/consts.js",
      "scoring/config.js",
      
      // Scoring Utils
      "scoring/utils/base64Encoder.js",
      
      // Session Key
      "scoring/sessionKey/index.js",
      
      // Collectors
      "scoring/collectors/languages.js",
      "scoring/collectors/userAgent.js",
      "scoring/collectors/appVersion.js",
      "scoring/collectors/platform.js",
      "scoring/collectors/webgl.js",
      "scoring/collectors/viewport.js",
      "scoring/collectors/plugins.js",
      "scoring/collectors/screen.js",
      "scoring/collectors/devicePixelRatio.js",
      "scoring/collectors/productSub.js",
      "scoring/collectors/webdriver.js",
      "scoring/collectors/timezone.js",
      "scoring/collectors/touchPoints.js",
      
      // Scoring Core
      "scoring/index.js",
    ];
  }

  protected replaceConfigPlaceholders(content: string): string {
    const replacements = {
      '__VERSION__': config.version,
      '__ENCODE_KEY__': config.encodeKey,
      '__GatewayDomain__': config.gatewayUrl,
      '__SESSION_KEY__': config.scoringSessionKey,
      '__DEBUG__': config.debug.toString(),
    };

    let result = content;
    for (const [placeholder, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }

    return result;
  }

  protected wrapInIIFE(jsCode: string): string {
    return `
(function(global) {
  'use strict';
  
  ${jsCode}
  
  // Expose ScoringCollector to window
  if (typeof global !== 'undefined') {
    global.ScoringCollector = ScoringCollector;
  }
  
})(typeof window !== 'undefined' ? window : global);
`.trim();
  }

  /**
   * Get the scoring script bundle
   */
  getScoringScript(): string {
    return this.getScript();
  }

  async getMinifiedScoringScript(): Promise<string> {
    try {
      const script = this.getScript();
      
      if (!script || script.trim().length === 0) {
        return script || '';
      }

      const { minify } = await import('terser');
      const result = await minify(script, {
        compress: {
          keep_fargs: false,
          drop_console: false,
          drop_debugger: true,
          pure_funcs: [],
          passes: 2,
          dead_code: false, // Don't remove dead code
          unused: false, // Don't remove unused code
        },
        mangle: {
          reserved: ['window', 'document', 'global', 'self', 'ScoringCollector', 'ScoringSessionKeyManager', 'Base64Encoder', 'DOMUtils', 'DeviceFactory'],
          keep_fnames: false
        },
        format: {
          comments: false,
          beautify: false,
          indent_level: 0
        },
        sourceMap: false,
        ecma: 2015,
        parse: {
          ecma: 2015
        }
      });

      if (!result.code || result.code.trim().length === 0) {
        return this.fallbackMinify(script);
      }

      if (result.code.length < script.length * 0.1) {
        return this.fallbackMinify(script);
      }

      return result.code;
    } catch (error) {
      return this.fallbackMinify(this.getScript());
    }
  }
}

