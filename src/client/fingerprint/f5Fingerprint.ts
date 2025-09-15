/// <reference lib="dom" />

import { GraphicsGroupInfo } from "./types";
import { GraphicsFingerprint } from "./modules/graphics/index";
import { AbstractFingerprint, InjectValueCallback } from "./abstract/abstractFingerprint";
import { CONFIG, FingerprintStep } from "../index";

export class F5Fingerprint extends AbstractFingerprint {
  protected readonly step: FingerprintStep = "F5";
  protected readonly endpoint: string = CONFIG.ENDPOINTS.F5;

  protected async collectData(): Promise<{graphics: GraphicsGroupInfo}> {
    const graphics = await GraphicsFingerprint.collect();
    
    return {
      graphics,
    };
  }

  private extractGraphicsAttributes(data: {graphics: GraphicsGroupInfo}): Record<string, GraphicsGroupInfo[keyof GraphicsGroupInfo]> {
    const graphicsAliases = {
      canvas: 'cnv',
      webglBasics: 'wgb',
      webglExtensions: 'wgx',
      fonts: 'fnt',
      fontPreferences: 'fpr',
      screenResolution: 'scr',
      screenFrame: 'sfr',
      colorDepth: 'cld',
      colorGamut: 'clg',
    } as const;

    return {
      [graphicsAliases.canvas]: data.graphics.canvas,
      [graphicsAliases.webglBasics]: data.graphics.webglBasics,
      [graphicsAliases.webglExtensions]: data.graphics.webglExtensions,
      [graphicsAliases.fonts]: data.graphics.fonts,
      [graphicsAliases.fontPreferences]: data.graphics.fontPreferences,
      [graphicsAliases.screenResolution]: data.graphics.screenResolution,
      [graphicsAliases.screenFrame]: data.graphics.screenFrame,
      [graphicsAliases.colorDepth]: data.graphics.colorDepth,
      [graphicsAliases.colorGamut]: data.graphics.colorGamut,
    };
  }

  protected extractAttributes(data: {graphics: GraphicsGroupInfo}, f4Attributes?: Record<string, any>): Record<string, any> {
    const mappedGraphics = this.extractGraphicsAttributes(data);

    if (f4Attributes) {
      return {
        ...f4Attributes,
        ...mappedGraphics,
      };
    }

    return {
      ...mappedGraphics,
    };
  }

  protected buildPayload(
    sessionKey: string,
    fingerprintData: {graphics: GraphicsGroupInfo}
  ): any {
   
    const payload = this.encodeData({sk: sessionKey, fp: {gp: JSON.stringify(fingerprintData.graphics)}});

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
