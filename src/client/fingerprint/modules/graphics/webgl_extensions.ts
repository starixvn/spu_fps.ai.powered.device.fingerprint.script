import type { WebGLExtensionsInfo } from "../../types";

export async function collectWebGLExtensions(): Promise<WebGLExtensionsInfo> {
  try {
    return await getWebGLExtensions();
  } catch (error) {
    console.error("Error collecting WebGL extensions fingerprint:", error);
    return {
      extensions: [],
      supportedExtensions: [],
      compressedTextureFormats: [],
      maxDrawBuffers: 0,
      maxColorAttachments: 0,
      maxVertexAttribs: 0,
      maxVertexUniformVectors: 0,
      maxFragmentUniformVectors: 0,
      maxVaryingVectors: 0,
    };
  }
}

async function getWebGLExtensions(): Promise<WebGLExtensionsInfo> {
  const canvas = document.createElement("canvas");
  const gl = (canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

  if (!gl) {
    return {
      extensions: [],
      supportedExtensions: [],
      compressedTextureFormats: [],
      maxDrawBuffers: 0,
      maxColorAttachments: 0,
      maxVertexAttribs: 0,
      maxVertexUniformVectors: 0,
      maxFragmentUniformVectors: 0,
      maxVaryingVectors: 0,
    };
  }

  const supportedExtensions = gl.getSupportedExtensions() || [];

  const extensions = supportedExtensions.filter((ext) => {
    try {
      return !!gl.getExtension(ext);
    } catch {
      return false;
    }
  });

  let compressedTextureFormats: string[] = [];
  try {
    const formats = gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS) as
      | number[]
      | null;
    if (formats && Array.isArray(formats)) {
      compressedTextureFormats = formats.map(String);
    }
  } catch {
    compressedTextureFormats = [];
  }

  const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS) || 0;
  const maxVertexUniformVectors =
    gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 0;
  const maxFragmentUniformVectors =
    gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) || 0;
  const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS) || 0;

  let maxDrawBuffers = 0;
  let maxColorAttachments = 0;
  const drawBuffersExt = gl.getExtension("WEBGL_draw_buffers");
  if (drawBuffersExt) {
    maxDrawBuffers =
      gl.getParameter(drawBuffersExt.MAX_DRAW_BUFFERS_WEBGL) || 0;
    maxColorAttachments =
      gl.getParameter(drawBuffersExt.MAX_COLOR_ATTACHMENTS_WEBGL) || 0;
  }

  return {
    extensions,
    supportedExtensions,
    compressedTextureFormats,
    maxDrawBuffers,
    maxColorAttachments,
    maxVertexAttribs,
    maxVertexUniformVectors,
    maxFragmentUniformVectors,
    maxVaryingVectors,
  };
}
