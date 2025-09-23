import type { WebGLExtensionsInfo, WebGLExtensionsData } from "../../types";
import { isChromium, isWebKit, isGecko } from "../../utils/browser";
import { MurmurHash128 } from "../../utils/hash";
import type { Bit } from '../../types';
import { boolToBit } from '../../utils/data';
import { FingerprintSpecialValue } from "../../utils/consts";

type CanvasContext = WebGLRenderingContext & { readonly canvas: HTMLCanvasElement }

type Options = {
  cache: {
    webgl?: {
      context: CanvasContext | undefined
    }
  }
}

const validContextParameters = new Set([
  10752, 2849, 2884, 2885, 2886, 2928, 2929, 2930, 2931, 2932, 2960, 2961, 2962, 2963, 2964, 2965, 2966, 2967, 2968,
  2978, 3024, 3042, 3088, 3089, 3106, 3107, 32773, 32777, 32777, 32823, 32824, 32936, 32937, 32938, 32939, 32968, 32969,
  32970, 32971, 3317, 33170, 3333, 3379, 3386, 33901, 33902, 34016, 34024, 34076, 3408, 3410, 3411, 3412, 3413, 3414,
  3415, 34467, 34816, 34817, 34818, 34819, 34877, 34921, 34930, 35660, 35661, 35724, 35738, 35739, 36003, 36004, 36005,
  36347, 36348, 36349, 37440, 37441, 37443, 7936, 7937, 7938,
]);

const validExtensionParams = new Set([
  34047, // MAX_TEXTURE_MAX_ANISOTROPY_EXT
  35723, // FRAGMENT_SHADER_DERIVATIVE_HINT_OES
  36063, // MAX_COLOR_ATTACHMENTS_WEBGL
  34852, // MAX_DRAW_BUFFERS_WEBGL
  34853, // DRAW_BUFFER0_WEBGL
  34854, // DRAW_BUFFER1_WEBGL
  34229, // VERTEX_ARRAY_BINDING_OES
  36392, // TIMESTAMP_EXT
  36795, // GPU_DISJOINT_EXT
  38449, // MAX_VIEWS_OVR
]);

const shaderTypes = ['FRAGMENT_SHADER', 'VERTEX_SHADER'] as const;
const precisionTypes = ['LOW_FLOAT', 'MEDIUM_FLOAT', 'HIGH_FLOAT', 'LOW_INT', 'MEDIUM_INT', 'HIGH_INT'] as const;
const rendererInfoExtensionNameExt = 'WEBGL_debug_renderer_info';
const polygonModeExtensionName = 'WEBGL_polygon_mode';

export async function collectWebGLExtensions(): Promise<WebGLExtensionsInfo | FingerprintSpecialValue> {
  try {
    const cache = { webgl: { context: undefined } };
    const result = getWebGlExtensions({ cache });
    
    if (result === FingerprintSpecialValue.UNDEFINED) {
      return FingerprintSpecialValue.UNDEFINED;
    }
    
    return MurmurHash128.hash128(JSON.stringify(result));
  } catch (error) {
    return FingerprintSpecialValue.ERROR;
  }
}

export function getWebGlExtensions({ cache }: Options): WebGLExtensionsData | FingerprintSpecialValue {
  const gl = getWebGLContextExt(cache);
  if (!gl) {
    return FingerprintSpecialValue.UNDEFINED;
  }

  if (!isValidParameterGetter(gl)) {
    return FingerprintSpecialValue.UNDEFINED;
  }

  const extensions = gl.getSupportedExtensions();
  const contextAttributes = gl.getContextAttributes();
  const unsupportedExtensions: string[] = [];
  const attributes: string[] = [];
  const parameters: string[] = [];
  const extensionParameters: string[] = [];
  const shaderPrecisions: string[] = [];

  if (contextAttributes) {
    for (const attributeName of Object.keys(contextAttributes) as (keyof WebGLContextAttributes)[]) {
      attributes.push(`${attributeName}=${contextAttributes[attributeName]}`);
    }
  }

  const constants = getConstantsFromPrototype(gl);
  
  for (const constant of constants) {
    const code = gl[constant] as number;
    parameters.push(`${constant}=${code}${validContextParameters.has(code) ? `=${gl.getParameter(code)}` : ''}`);
  }

  // Extension parameters
  if (extensions) {
    for (const name of extensions) {
      if (
        (name === rendererInfoExtensionNameExt && shouldAvoidDebugRendererInfoExt()) ||
        (name === polygonModeExtensionName && shouldAvoidPolygonModeExtensionsExt())
      ) {
        continue;
      }

      const extension = gl.getExtension(name);
      if (!extension) {
        unsupportedExtensions.push(name);
        continue;
      }

      for (const constant of getConstantsFromPrototype(extension)) {
        const code = extension[constant];
        let val: any = '';
        if (validExtensionParams.has(code)) {
          try {
            val = gl.getParameter(code);
          } catch {
            val = FingerprintSpecialValue.UNDEFINED;
          }
        }
        extensionParameters.push(
          `${constant}=${code}${validExtensionParams.has(code) ? `=${val}` : ''}`,
        )
      }
    }
  }

  // Shader precision
  for (const shaderType of shaderTypes) {
    for (const precisionType of precisionTypes) {
      const shaderPrecision = getShaderPrecision(gl, shaderType, precisionType);
      shaderPrecisions.push(`${shaderType}.${precisionType}=${shaderPrecision.join(',')}`);
    }
  }

  // Postprocess
  extensionParameters.sort();
  parameters.sort();

  return {
    contextAttributes: attributes,
    parameters: parameters,
    shaderPrecisions: shaderPrecisions,
    extensions: extensions,
    extensionParameters: extensionParameters,
    unsupportedExtensions,
  }
}

function getWebGLContextExt(cache: Options['cache']): CanvasContext | undefined {
  if (cache.webgl?.context) {
    return cache.webgl.context;
  }

  const canvas = document.createElement('canvas');
  let context: CanvasContext | undefined;

  canvas.addEventListener('webglCreateContextError', () => (context = undefined));

  const types = ['webgl', 'experimental-webgl', 'webgl2', 'experimental-webgl2'];

  for (const type of types) {
    try {
      context = canvas.getContext(type, { failIfMajorPerformanceCaveat: false }) as CanvasContext;
    } catch {
    }
    if (context) break;;
  }

  cache.webgl = { context };
  return context;
}



function getShaderPrecision(
  gl: WebGLRenderingContext,
  shaderType: typeof shaderTypes[number],
  precisionType: typeof precisionTypes[number],
) {
  const shaderPrecision = gl.getShaderPrecisionFormat(gl[shaderType], gl[precisionType]);
  return shaderPrecision ? [shaderPrecision.rangeMin, shaderPrecision.rangeMax, shaderPrecision.precision] : [];
}

function getConstantsFromPrototype<K>(obj: K): Array<Extract<keyof K, string>> {
  const keys = Object.keys((obj as any).__proto__) as Array<keyof K>;
  return keys.filter(isConstantLike);
}

function isConstantLike<K>(key: K): key is Extract<K, string> {
  return typeof key === 'string' && !key.match(/[^A-Z0-9_x]/);
}

function shouldAvoidDebugRendererInfoExt(): Bit {
  return isGecko();
}

function shouldAvoidPolygonModeExtensionsExt(): Bit {
  return boolToBit(isChromium() === 1 || isWebKit() === 1);
}

function isValidParameterGetter(gl: WebGLRenderingContext) {
  return typeof gl.getParameter === 'function';
}


