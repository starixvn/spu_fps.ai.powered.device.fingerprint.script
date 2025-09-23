/// <reference lib="dom" />

import { GraphicsGroupInfo } from "./types";
import { GraphicsFingerprint } from "./modules/graphics/index";
import { AbstractFingerprint, InjectValueCallback } from "./abstract/abstractFingerprint";
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

  private extractGraphicsAttributes(data: GraphicsGroupInfo): Record<string, GraphicsGroupInfo[keyof GraphicsGroupInfo]> {

    return {
      [F5Fingerprint.graphicsAliases.canvas]: data.canvas,
      [F5Fingerprint.graphicsAliases.webglBasics]: data.webglBasics,
      [F5Fingerprint.graphicsAliases.webglExtensions]: data.webglExtensions,
      [F5Fingerprint.graphicsAliases.fonts]: data.fonts,
      [F5Fingerprint.graphicsAliases.fontPreferences]: data.fontPreferences,
      [F5Fingerprint.graphicsAliases.screenResolution]: data.screenResolution,
      [F5Fingerprint.graphicsAliases.screenFrame]: data.screenFrame,
      [F5Fingerprint.graphicsAliases.colorDepth]: data.colorDepth,
      [F5Fingerprint.graphicsAliases.colorGamut]: data.colorGamut,
    };
  }

  protected extractAttributes(data: {graphics: GraphicsGroupInfo}, f4Attributes?: Record<string, any>): Record<string, any> {
    const attributes = {
      ...this.extractGraphicsAttributes(data.graphics),
    };

    if (f4Attributes) {
      return {
        ...f4Attributes,
        ...attributes,
      };
    }

    return attributes;
  }

  protected buildPayload(
    sessionKey: string,
    fingerprintData: {graphics: GraphicsGroupInfo}
  ): any {
    const graphicsAttributes = this.extractGraphicsAttributes(fingerprintData.graphics);
   
    const payload = this.encodeData({sk: sessionKey, fp: {gp: JSON.stringify(graphicsAttributes)}});

    return payload;
  }

  public async processF5Data(
    sessionKey: string,
    f4Attributes: Record<string, any>,
    callback: InjectValueCallback
  ): Promise<Record<string, any>> {
    const result = await this.process(sessionKey, callback, f4Attributes);

    if(window !== undefined) {
      (window as any).f5Attributes = result.attributes;
    }

    return result.attributes;
  }
}
