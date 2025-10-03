import type { WebGLBasicsInfo } from "../../types";
import { isGecko } from "../../utils/browser";
import type { Bit } from '../../types';
import { FingerprintSpecialValue } from "../../utils/consts";

type CanvasContext = WebGLRenderingContext & { readonly canvas: HTMLCanvasElement }

type Options = {
  cache: {
    webgl?: {
      context: CanvasContext | undefined
    }
  }
}

const rendererInfoExtensionName = 'WEBGL_debug_renderer_info';
const globalCache: Options['cache'] = {};

export function collectWebGLBasics(): WebGLBasicsInfo | FingerprintSpecialValue {
  const options = { cache: globalCache };
  const basics = getWebGlBasics(options);
  
  if (!basics) {
    return getEmptyWebGLBasics();
  }

  return basics;
}

export function getWebGlBasics({ cache }: Options): WebGLBasicsInfo | FingerprintSpecialValue {
  const gl = getWebGLContext(cache);
  if (!gl) {
    return FingerprintSpecialValue.UNDEFINED;
  }

  if (!isValidParameterGetter(gl)) {
    return FingerprintSpecialValue.UNDEFINED;
  }

  const debugExtension = shouldAvoidDebugRendererInfo() ? null : gl.getExtension(rendererInfoExtensionName);
  const safeGet = (p: number): string | FingerprintSpecialValue => {
      try {
        const v = gl.getParameter(p);
        return v != null ? v.toString() : FingerprintSpecialValue.UNDEFINED;
      } catch {
        return FingerprintSpecialValue.ERROR;
      }
  };

  return [
    safeGet(gl.VERSION),
    safeGet(gl.VENDOR),
    debugExtension ? safeGet(debugExtension.UNMASKED_VENDOR_WEBGL) : FingerprintSpecialValue.UNDEFINED,
    safeGet(gl.RENDERER),
    debugExtension ? safeGet(debugExtension.UNMASKED_RENDERER_WEBGL) : FingerprintSpecialValue.UNDEFINED,
    safeGet(gl.SHADING_LANGUAGE_VERSION)
  ];
}

export function getWebGLContext(cache: Options['cache']) {
  if (cache.webgl) {
    return cache.webgl.context;
  }

  const canvas = document.createElement('canvas');
  let context: CanvasContext | undefined;

  canvas.addEventListener('webglCreateContextError', () => (context = undefined));

  for (const type of ['webgl', 'experimental-webgl']) {
    try {
      context = canvas.getContext(type) as CanvasContext;
    } catch {
    }
    
    if (context) {
      break;
    }
  }

  cache.webgl = { context };
  return context;
}


export function shouldAvoidDebugRendererInfo(): Bit {
  return isGecko();
}

function isValidParameterGetter(gl: WebGLRenderingContext) {
  return typeof gl.getParameter === 'function';
}

function getEmptyWebGLBasics(): WebGLBasicsInfo {
  return [
    FingerprintSpecialValue.UNDEFINED,
    FingerprintSpecialValue.UNDEFINED,
    FingerprintSpecialValue.UNDEFINED,
    FingerprintSpecialValue.UNDEFINED,
    FingerprintSpecialValue.UNDEFINED,
    FingerprintSpecialValue.UNDEFINED,
  ];
}
