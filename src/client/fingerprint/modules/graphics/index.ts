import { collectCanvas } from "./canvas";
import { collectFonts } from "./fonts";
import { collectFontPreferences } from "./fontPreferences";
import { collectScreenResolution } from "./screenResolution";
import { collectScreenFrame } from "./screenFrame";
import { collectColorDepth } from "./colorDepth";
import { collectColorGamut } from "./colorGamut";
import { collectWebGLBasics } from "./webglBasics";
import { collectWebGLExtensions } from "./webglExtensions";
import type { GraphicsGroupInfo } from "../../types";

export class GraphicsFingerprint {
  public static async collect(): Promise<GraphicsGroupInfo> {
    try {
      const canvasResult = await collectCanvas();
      const webglBasicsResult = collectWebGLBasics();
      const webglExtensionsResult = await collectWebGLExtensions();
      const fontsResult = await collectFonts();
      const fontPreferencesResult = collectFontPreferences();
      const screenResolutionResult = collectScreenResolution();
      const screenFrameResult = collectScreenFrame();
      const colorDepthResult = collectColorDepth();
      const colorGamutResult = await collectColorGamut();

      const graphicsGroup: GraphicsGroupInfo = {
        canvas: canvasResult,
        webglBasics: webglBasicsResult,
        webglExtensions: webglExtensionsResult,
        fonts: fontsResult,
        fontPreferences: fontPreferencesResult,
        screenResolution: screenResolutionResult,
        screenFrame: screenFrameResult,
        colorDepth: colorDepthResult,
        colorGamut: colorGamutResult,
      };

      return graphicsGroup;
    } catch (error) {
      return {
        canvas: "",
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
          noiseType: "blocked",
          entropy: 0,
        },
        fontPreferences: {
          default: 0,
          apple: 0,
          serif: 0,
          sans: 0,
          mono: 0,
          min: 0,
          system: 0,
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
