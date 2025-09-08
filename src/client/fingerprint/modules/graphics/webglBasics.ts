import type { WebGLBasicsInfo } from "../../types";

type CanvasContext = WebGLRenderingContext & { readonly canvas: HTMLCanvasElement }

type Options = {
  cache: {
    webgl?: {
      context: CanvasContext | undefined
    }
  }
}

/** WebGl context is not available */
export const STATUS_NO_GL_CONTEXT = -1
/** WebGL context `getParameter` method is not a function */
export const STATUS_GET_PARAMETER_NOT_A_FUNCTION = -2

export type SpecialStatus = typeof STATUS_NO_GL_CONTEXT | typeof STATUS_GET_PARAMETER_NOT_A_FUNCTION

const rendererInfoExtensionName = 'WEBGL_debug_renderer_info'

// Global cache
const globalCache: Options['cache'] = {}

export function collectWebGLBasics(): WebGLBasicsInfo {
  try {
    const options = { cache: globalCache }
    
    // Get basic WebGL info using FingerprintJS logic
    const basics = getWebGlBasics(options)
    
    if (typeof basics === 'number') {
      // Error case
      return getEmptyWebGLBasics()
    }

    return basics
  } catch (error) {
    return getEmptyWebGLBasics()
  }
}

/**
 * Gets the basic and simple WebGL parameters (from FingerprintJS)
 */
export function getWebGlBasics({ cache }: Options): WebGLBasicsInfo | SpecialStatus {
  const gl = getWebGLContext(cache)
  if (!gl) {
    return STATUS_NO_GL_CONTEXT
  }

  if (!isValidParameterGetter(gl)) {
    return STATUS_GET_PARAMETER_NOT_A_FUNCTION
  }

  const debugExtension = shouldAvoidDebugRendererInfo() ? null : gl.getExtension(rendererInfoExtensionName)

  return {
    version: gl.getParameter(gl.VERSION)?.toString() || '',
    vendor: gl.getParameter(gl.VENDOR)?.toString() || '',
    vendorUnmasked: debugExtension ? gl.getParameter(debugExtension.UNMASKED_VENDOR_WEBGL)?.toString() || '' : '',
    renderer: gl.getParameter(gl.RENDERER)?.toString() || '',
    rendererUnmasked: debugExtension ? gl.getParameter(debugExtension.UNMASKED_RENDERER_WEBGL)?.toString() || '' : '',
    shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)?.toString() || '',
  }
}

/**
 * This function usually takes the most time to execute in all the sources, therefore we cache its result.
 */
export function getWebGLContext(cache: Options['cache']) {
  if (cache.webgl) {
    return cache.webgl.context
  }

  const canvas = document.createElement('canvas')
  let context: CanvasContext | undefined

  canvas.addEventListener('webglCreateContextError', () => (context = undefined))

  for (const type of ['webgl', 'experimental-webgl']) {
    try {
      context = canvas.getContext(type) as CanvasContext
    } catch {
      // Ok, continue
    }
    if (context) {
      break
    }
  }

  cache.webgl = { context }
  return context
}

/**
 * Some browsers print a console warning when the WEBGL_debug_renderer_info extension is requested.
 */
export function shouldAvoidDebugRendererInfo(): boolean {
  return isGecko()
}

/**
 * Some unknown browsers have no `getParameter` method
 */
function isValidParameterGetter(gl: WebGLRenderingContext) {
  return typeof gl.getParameter === 'function'
}

function getEmptyWebGLBasics(): WebGLBasicsInfo {
  return {
    version: "",
    vendor: "",
    vendorUnmasked: "",
    renderer: "",
    rendererUnmasked: "",
    shadingLanguageVersion: "",
  }
}

// Browser detection functions (from FingerprintJS)
function countTruthy(values: unknown[]): number {
  return values.reduce<number>((sum, value) => sum + (value ? 1 : 0), 0)
}

export function isChromium(): boolean {
  const w = window
  const n = navigator

  return (
    countTruthy([
      'webkitPersistentStorage' in n,
      'webkitTemporaryStorage' in n,
      (n.vendor || '').indexOf('Google') === 0,
      'webkitResolveLocalFileSystemURL' in w,
      'BatteryManager' in w,
      'webkitMediaStream' in w,
      'webkitSpeechGrammar' in w,
    ]) >= 5
  )
}

export function isGecko(): boolean {
  const w = window

  return (
    countTruthy([
      'buildID' in navigator,
      'MozAppearance' in (document.documentElement?.style ?? {}),
      'onmozfullscreenchange' in w,
      'mozInnerScreenX' in w,
      'CSSMozDocumentRule' in w,
      'CanvasCaptureMediaStream' in w,
    ]) >= 4
  )
}

export function isWebKit(): boolean {
  const w = window
  const n = navigator

  return (
    countTruthy([
      'ApplePayError' in w,
      'CSSPrimitiveValue' in w,
      'Counter' in w,
      n.vendor.indexOf('Apple') === 0,
      'RGBColor' in w,
      'WebKitMediaKeys' in w,
    ]) >= 4
  )
}