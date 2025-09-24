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

  protected readonly step: FingerprintStep = "F5";
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

  protected buildPayload(
    sessionKey: string,
    fingerprintData: Record<string, any>
  ): any {
    const payload = this.encodeData({sk: sessionKey, fp: {gp: JSON.stringify(fingerprintData.graphics)}});

    return payload;
  }

  public async start(
    sessionKey: string,
    f4Attributes: Record<string, any>,
    callback: Function
  ): Promise<Record<string, any>> {
    const result = await this.process(f4Attributes);

    callback(result);

    const payload = this.buildPayload(sessionKey, result.attributes);

    await this.sendToServer(this.endpoint, payload);

    if(window !== undefined) {
      (window as any).f5Attributes = result.attributes;
    }

    return result.attributes;
  }
}
