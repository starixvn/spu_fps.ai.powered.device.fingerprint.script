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
      const fontPreferencesResult = await collectFontPreferences();
      const screenResolutionResult = collectScreenResolution();
      const screenFrameResult = await collectScreenFrame();
      const colorDepthResult = collectColorDepth();
      const colorGamutResult = collectColorGamut();

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
        canvas: {
          value: "",
          canvasProtection: false
        },
        webglBasics: {
          vendor: "",
          renderer: "",
          version: "",
          shadingLanguageVersion: "",
          vendorUnmasked: "",
          rendererUnmasked: "",
        },
        webglExtensions: {
          contextAttributes: [],
          parameters: [],
          shaderPrecisions: [],
          extensions: null,
          extensionParameters: [],
          unsupportedExtensions: [],
        },
        fonts: [],
        fontPreferences: {
          default: 0,
          apple: 0,
          serif: 0,
          sans: 0,
          mono: 0,
          min: 0,
          system: 0,
        },
        screenResolution: [0, 0],
        screenFrame: [0, 0, 0, 0],
        colorDepth: "",
        colorGamut: undefined,
      };
    }
  }
}
