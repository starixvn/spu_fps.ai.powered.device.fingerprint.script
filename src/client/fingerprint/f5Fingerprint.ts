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

  protected extractAttributes(data: {graphics: GraphicsGroupInfo}, f4Attributes?: Record<string, any>): Record<string, any> {
    const attributes = {
      ...data.graphics,
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
    fingerprintData: {graphics: GraphicsGroupInfo},
    hashed: string
  ): any {
   
    const payload = this.encodeData({sk: sessionKey, fp: {gp: JSON.stringify(fingerprintData.graphics)}, hs: hashed});

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
