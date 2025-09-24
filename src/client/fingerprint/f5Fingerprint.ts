/// <reference lib="dom" />

import { GraphicsGroupInfo } from "./types";
import { GraphicsFingerprint } from "./modules/graphics/index";
import { AbstractFingerprint } from "./abstract/abstractFingerprint";
import { CONFIG, FingerprintStep } from "../index";

export class F5Fingerprint extends AbstractFingerprint {
  private static readonly graphicsAliases = {
    canvas: 'cnv',
    webglBasics: 'wgb',
    webglExtensions: 'wgx',
    fonts: 'fnt',
    fontPreferences: 'fpr',
    screenResolution: 'scr',
    screenFrame: 'sfr',
    colorDepth: 'cld',
    colorGamut: 'clg',
  };

  protected readonly endpoint: string = CONFIG.ENDPOINTS.F5;

  protected async collectData(): Promise<{graphics: GraphicsGroupInfo}> {
    const graphics = await GraphicsFingerprint.collect();
    
    return {
      graphics,
    };
  }

  protected extractFlatAttributes(data: any): Record<string, any> {
    return {
      ...data.audio,
      ...data.browser,
      ...data.hardware,
      ...data.preferences,
      ...data.graphics,
    };
  }

  protected extractAttributes(data: {graphics: GraphicsGroupInfo}, f4Attributes?: Record<string, any>): Record<string, any> {
    const graphicsAttributes = {
      ...this.mapAttributes(F5Fingerprint.graphicsAliases, data.graphics),
    };

    if (f4Attributes) {
      return {
        ...f4Attributes,
        graphics: graphicsAttributes,
      };
    }

    return graphicsAttributes;
  }

  public async start(
    f4Attributes: Record<string, any>,
    callback: Function
  ): Promise<void> {
    const result = await this.process(f4Attributes);

    callback(result);
  }
}
