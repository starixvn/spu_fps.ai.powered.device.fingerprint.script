/// <reference lib="dom" />

import { F4Fingerprint } from "./f4Fingerprint";
import { F5Fingerprint } from "./f5Fingerprint";
import { InjectValueCallback } from "./abstract/abstractFingerprint";

export class FingerprintClass {
  public readonly version: string = "1.9.0";
  
  private f4Fingerprint: F4Fingerprint;
  private f5Fingerprint: F5Fingerprint;

  constructor() {
    this.f4Fingerprint = F4Fingerprint.create();
    this.f5Fingerprint = F5Fingerprint.create();
  }

  public async processF4Data(
    sessionKey: string,
    callback: any,
  ): Promise<any> {
    return await this.f4Fingerprint.processF4Data(sessionKey, callback);
  }

  public async processF5Data(
    sessionKey: string,
    f4Attributes: Record<string, any>,
    callback: any,
  ): Promise<any> {
    return await this.f5Fingerprint.processF5Data(sessionKey, f4Attributes, callback);
  }

  public async start(
    sessionKey: string, 
    callbacks: {
      f4Callback: any;
      f5Callback: any;
    }
  ): Promise<void> 
  {
    try {
      const f4Attributes = await this.processF4Data(sessionKey, callbacks.f4Callback);

      if(window !== undefined) {
        (window as any).f4Attributes = f4Attributes;
      }

      const f5Attributes = await this.processF5Data(sessionKey, f4Attributes, callbacks.f5Callback);

      if(window !== undefined) {
        (window as any).f5Attributes = f5Attributes;
      }
    } catch (error) {
      // console.error('Fingerprint collection failed:', error);
      // throw error;
    }
  }
}
