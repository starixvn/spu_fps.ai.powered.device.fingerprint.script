// Export all collect functions from graphics module attributes
export { collectCanvas } from "./canvas";
export { collectFonts } from "./fonts";
export { collectFontPreferences } from "./font_preferences";
export { collectScreenResolution } from "./screen_resolution";
export { collectScreenFrame } from "./screen_frame";
export { collectColorDepth } from "./color_depth";
export { collectColorGamut } from "./color_gamut";

// Main graphics fingerprint collection class
import { collectCanvas } from "./canvas";
import { collectFonts } from "./fonts";
import { collectFontPreferences } from "./font_preferences";
import { collectScreenResolution } from "./screen_resolution";
import { collectScreenFrame } from "./screen_frame";
import { collectColorDepth } from "./color_depth";
import { collectColorGamut } from "./color_gamut";
import type { GraphicsGroupResult } from "../../types";

export class GraphicsFingerprint {
  public static async collect(): Promise<GraphicsGroupResult> {
    try {
      console.log("Starting graphics fingerprint collection...");

      const canvasResult = await collectCanvas();
      const fontsResult = await collectFonts();
      const fontPreferencesResult = await collectFontPreferences();
      const screenResolutionResult = await collectScreenResolution();
      const screenFrameResult = await collectScreenFrame();
      const colorDepthResult = await collectColorDepth();
      const colorGamutResult = await collectColorGamut();

      const graphicsGroup: GraphicsGroupResult = {
        canvas: canvasResult,
        webglBasics: {
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
        },
        webglExtensions: {
          extensions: [],
          supportedExtensions: [],
          compressedTextureFormats: [],
          maxDrawBuffers: 0,
          maxColorAttachments: 0,
          maxVertexAttribs: 0,
          maxVertexUniformVectors: 0,
          maxFragmentUniformVectors: 0,
          maxVaryingVectors: 0,
        },
        fonts: fontsResult,
        fontPreferences: fontPreferencesResult,
        screenResolution: screenResolutionResult,
        screenFrame: screenFrameResult,
        colorDepth: colorDepthResult,
        colorGamut: colorGamutResult,
      };

      console.log("Graphics fingerprint collected:", graphicsGroup);
      return graphicsGroup;
    } catch (error) {
      console.error("Error collecting graphics fingerprint:", error);

      return {
        canvas: {
          fingerprint: "",
          width: 0,
          height: 0,
          textRendering: "",
          textBaseline: "",
          font: "",
          fillStyle: "",
          strokeStyle: "",
          lineWidth: 0,
          lineCap: "",
          lineJoin: "",
          miterLimit: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 0,
          shadowColor: "",
          globalAlpha: 0,
          globalCompositeOperation: "",
        },
        webglBasics: {
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
        },
        webglExtensions: {
          extensions: [],
          supportedExtensions: [],
          compressedTextureFormats: [],
          maxDrawBuffers: 0,
          maxColorAttachments: 0,
          maxVertexAttribs: 0,
          maxVertexUniformVectors: 0,
          maxFragmentUniformVectors: 0,
          maxVaryingVectors: 0,
        },
        fonts: {
          availableFonts: [],
          fontList: [],
          fontMetrics: {},
          fontDetection: {
            detectedFonts: [],
            fallbackFonts: [],
            systemFonts: [],
          },
        },
        fontPreferences: {
          fontFamily: "",
          fontSize: "",
          fontWeight: "",
          fontStyle: "",
          fontVariant: "",
          lineHeight: "",
          letterSpacing: "",
          textAlign: "",
          textDecoration: "",
          textTransform: "",
        },
        screenResolution: {
          width: 0,
          height: 0,
          availWidth: 0,
          availHeight: 0,
          pixelRatio: 0,
          devicePixelRatio: 0,
          logicalPixelRatio: 0,
        },
        screenFrame: {
          frameWidth: 0,
          frameHeight: 0,
          frameDepth: 0,
          frameColorDepth: 0,
          framePixelDepth: 0,
          orientation: "",
          orientationAngle: 0,
        },
        colorDepth: {
          colorDepth: 0,
          pixelDepth: 0,
          bitsPerChannel: 0,
          totalBits: 0,
          hasAlpha: false,
          hasTransparency: false,
        },
        colorGamut: {
          colorGamut: "",
          supportedColorSpaces: [],
          p3Support: false,
          rec2020Support: false,
          srgbSupport: false,
          displayP3Support: false,
        },
      };
    }
  }
}
