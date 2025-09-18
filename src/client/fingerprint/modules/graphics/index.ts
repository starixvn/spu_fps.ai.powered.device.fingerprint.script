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
  }
}
