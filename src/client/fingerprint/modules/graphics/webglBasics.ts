import type { WebGLBasicsInfo } from "../../types";
import { isGecko } from "../../utils/browser";
import type { Bit } from '../../types';

type CanvasContext = WebGLRenderingContext & { readonly canvas: HTMLCanvasElement }

type Options = {
  cache: {
    webgl?: {
      context: CanvasContext | undefined
    }
  }
}

export const STATUS_NO_GL_CONTEXT = -1;
export const STATUS_GET_PARAMETER_NOT_A_FUNCTION = -2;
export type SpecialStatus = typeof STATUS_NO_GL_CONTEXT | typeof STATUS_GET_PARAMETER_NOT_A_FUNCTION;

const rendererInfoExtensionName = 'WEBGL_debug_renderer_info';
const globalCache: Options['cache'] = {};

export function collectWebGLBasics(): WebGLBasicsInfo {
  const options = { cache: globalCache };
  const basics = getWebGlBasics(options);
  
  if (typeof basics === 'number') {
    return getEmptyWebGLBasics();
  }

  return [
    basics.version,
    basics.vendor, 
    basics.vendorUnmasked,
    basics.renderer,
    basics.rendererUnmasked,
    basics.shadingLanguageVersion
  ]
}

export function getWebGlBasics({ cache }: Options): { version: string; vendor: string; vendorUnmasked: string; renderer: string; rendererUnmasked: string; shadingLanguageVersion: string } | SpecialStatus {
  const gl = getWebGLContext(cache);
  if (!gl) {
    return STATUS_NO_GL_CONTEXT;
  }

  if (!isValidParameterGetter(gl)) {
    return STATUS_GET_PARAMETER_NOT_A_FUNCTION;
  }

  const debugExtension = shouldAvoidDebugRendererInfo() ? null : gl.getExtension(rendererInfoExtensionName);

  return {
    version: gl.getParameter(gl.VERSION)?.toString() || '',
    vendor: gl.getParameter(gl.VENDOR)?.toString() || '',
    vendorUnmasked: debugExtension ? gl.getParameter(debugExtension.UNMASKED_VENDOR_WEBGL)?.toString() || '' : '',
    renderer: gl.getParameter(gl.RENDERER)?.toString() || '',
    rendererUnmasked: debugExtension ? gl.getParameter(debugExtension.UNMASKED_RENDERER_WEBGL)?.toString() || '' : '',
    shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)?.toString() || '',
  }
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
  return ["", "", "", "", "", ""]; // [version, vendor, vendorUnmasked, renderer, rendererUnmasked, shadingLanguageVersion]
}
