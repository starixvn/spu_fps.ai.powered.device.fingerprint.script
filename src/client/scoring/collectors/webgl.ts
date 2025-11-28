import type { WebGLInfo } from '../types';
import { ScoringSpecialValue } from '../consts';

function getWebGLContext(): WebGLRenderingContext | null {
  try {
    if (typeof document === 'undefined') {
      return null;
    }

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null ||
               canvas.getContext('experimental-webgl') as WebGLRenderingContext | null ||
               null;

    return gl;
  } catch {
    return null;
  }
}

export function collectWebGL(): WebGLInfo {
  try {
    const gl = getWebGLContext();

    if (!gl) {
      return [
        ScoringSpecialValue.UNDEFINED, // VENDOR
        ScoringSpecialValue.UNDEFINED, // RENDERER
        ScoringSpecialValue.UNDEFINED, // SHADING_LANGUAGE_VERSION
        ScoringSpecialValue.UNDEFINED  // UNMASKED_RENDERER_WEBGL
      ];
    }

    const safeGet = (param: number): string | ScoringSpecialValue => {
      try {
        const value = gl.getParameter(param);
        return value != null ? value.toString() : ScoringSpecialValue.UNDEFINED;
      } catch {
        return ScoringSpecialValue.ERROR;
      }
    };

    // Get debug extension for unmasked renderer
    const rendererInfoExtensionName = 'WEBGL_debug_renderer_info';
    let unmaskedRenderer: string | ScoringSpecialValue = ScoringSpecialValue.UNDEFINED;
    
    try {
      const debugExtension = gl.getExtension(rendererInfoExtensionName);
      if (debugExtension) {
        unmaskedRenderer = safeGet(debugExtension.UNMASKED_RENDERER_WEBGL);
      }
    } catch {
      unmaskedRenderer = ScoringSpecialValue.ERROR;
    }

    return [
      safeGet(gl.VENDOR),                    // [0] VENDOR
      safeGet(gl.RENDERER),                   // [1] RENDERER
      safeGet(gl.SHADING_LANGUAGE_VERSION),   // [2] SHADING_LANGUAGE_VERSION
      unmaskedRenderer                        // [3] UNMASKED_RENDERER_WEBGL
    ];
  } catch {
    return [
      ScoringSpecialValue.ERROR, // VENDOR
      ScoringSpecialValue.ERROR, // RENDERER
      ScoringSpecialValue.ERROR, // SHADING_LANGUAGE_VERSION
      ScoringSpecialValue.ERROR  // UNMASKED_RENDERER_WEBGL
    ];
  }
}

