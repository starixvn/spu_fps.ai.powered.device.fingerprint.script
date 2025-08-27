import type { WebGLBasicsInfo } from "../../types";

export function collectWebGLBasics(): WebGLBasicsInfo {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

    if (!gl) {
      return getEmptyWebGLBasics();
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

    const ext =
      gl.getExtension("EXT_texture_filter_anisotropic") ||
      gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") ||
      gl.getExtension("MOZ_EXT_texture_filter_anisotropic");

    const maxAnisotropy = ext
      ? gl.getParameter((ext as any).MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 0
      : 0;

    const info: WebGLBasicsInfo = {
      vendor: gl.getParameter(gl.VENDOR) || "",
      renderer: gl.getParameter(gl.RENDERER) || "",
      version: gl.getParameter(gl.VERSION) || "",
      shadingLanguageVersion:
        gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || "",
      unmaskedVendor: debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : undefined,
      unmaskedRenderer: debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : undefined,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) || 0,
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS) as [
        number,
        number
      ],
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) || 0,
      aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE) as [
        number,
        number
      ],
      aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as [
        number,
        number
      ],
      maxAnisotropy,
    };

    return info;
  } catch (error) {
    return getEmptyWebGLBasics();
  }
}

function getEmptyWebGLBasics(): WebGLBasicsInfo {
  return {
    vendor: "",
    renderer: "",
    version: "",
    shadingLanguageVersion: "",
    maxTextureSize: 0,
    maxViewportDims: [0, 0],
    maxRenderbufferSize: 0,
    aliasedLineWidthRange: [0, 0],
    aliasedPointSizeRange: [0, 0],
    maxAnisotropy: 0,
  };
}
