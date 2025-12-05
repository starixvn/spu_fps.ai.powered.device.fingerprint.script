import type { WebGLInfo } from '../../types';
import { ScoringConstants } from '../../config';

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

export function collectRender(): WebGLInfo {
  try {
    const gl = getWebGLContext();

    if (!gl) {
      return ScoringConstants.UNDEFINED;
    }

    const rendererInfoExtensionName = 'WEBGL_debug_renderer_info';
    
    try {
      const debugExtension = gl.getExtension(rendererInfoExtensionName);
      if (debugExtension) {
        const value = gl.getParameter(debugExtension.UNMASKED_RENDERER_WEBGL);
        return value != null ? value.toString() : ScoringConstants.UNDEFINED;
      }
      return ScoringConstants.UNDEFINED;
    } catch {
      return ScoringConstants.ERROR;
    }
  } catch {
    return ScoringConstants.ERROR;
  }
}

