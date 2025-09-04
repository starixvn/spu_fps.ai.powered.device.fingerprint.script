/// <reference lib="dom" />

import { GraphicsGroupInfo } from "./types";
import { GraphicsFingerprint } from "./modules/graphics/index";
import { AbstractFingerprint, InjectValueCallback, FingerprintResult } from "./abstract/abstractFingerprint";
import { CONFIG, FingerprintStep } from "../index";

export interface F5Data {
  graphics: GraphicsGroupInfo;
}

export class F5Fingerprint extends AbstractFingerprint {
  protected readonly step: FingerprintStep = "F5";
  protected readonly endpoint: string = CONFIG.ENDPOINTS.F5;

  protected async collectData(): Promise<F5Data> {
    const graphics = await GraphicsFingerprint.collect();
    
    return {
      graphics,
    };
  }

  protected extractAttributes(data: F5Data, f4Attributes?: Record<string, any>): Record<string, any> {
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
    fingerprintData: F5Data,
    hashed: string
  ): any {
    const fp = {
      gp: this.encodeData(fingerprintData.graphics),
    };

    return { sk: sessionKey, fp, hs: hashed };
  }

  public async processF5Data(
    sessionKey: string,
    f4Attributes: Record<string, any>,
    callback: InjectValueCallback
  ): Promise<Record<string, any>> {
    const result = await this.process(sessionKey, callback, f4Attributes);
    return result.attributes;
  }

  public static create(): F5Fingerprint {
    return new F5Fingerprint();
  }
}
