/// <reference lib="dom" />

import {
  F4Data,
} from "./types";
import { HardwareFingerprint } from "./modules/hardware/index";
import { AudioFingerprint } from "./modules/audio/index";
import { BrowserFingerprint } from "./modules/browser/index";
import { PreferencesFingerprint } from "./modules/preference/index";
import { AbstractFingerprint, InjectValueCallback } from "./abstract/abstractFingerprint";
import { CONFIG, FingerprintStep } from "../index";



export class F4Fingerprint extends AbstractFingerprint {
  protected readonly step: FingerprintStep = "F4";
  protected readonly endpoint: string = CONFIG.ENDPOINTS.F4;

  protected async collectData(): Promise<F4Data> {
    const [audio, browser, hardware, preferences] = await Promise.all([
      AudioFingerprint.collect(),
      BrowserFingerprint.collect(),
      HardwareFingerprint.collect(),
      PreferencesFingerprint.collect(),
    ]);

    return {
      au: audio,
      br: browser,
      hw: hardware,
      pf: preferences,
    };
  }

  protected extractAttributes(data: F4Data): Record<string, any> {
    return {
      ...data.au,
      ...data.br,
      ...data.hw,
      ...data.pf,
    };
  }

  protected buildPayload(
    sessionKey: string,
    fingerprintData: F4Data,
    hashed: string
  ): any {
    const payload = this.encodeData({sk: sessionKey, fp: fingerprintData, hs: hashed});

    return payload;
  }

  public async processF4Data(
    sessionKey: string,
    callback: InjectValueCallback
  ): Promise<Record<string, any>> {
    const result = await this.process(sessionKey, callback);

    if(window !== undefined) {
      (window as any).f4Attributes = result.attributes;
    }

    return result.attributes;
  }

}
