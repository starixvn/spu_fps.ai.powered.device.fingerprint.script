/// <reference lib="dom" />

import {
  AudioGroupInfo,
  BrowserGroupInfo,
  HardwareGroupInfo,
  PreferencesGroupInfo,
} from "./types";
import { HardwareFingerprint } from "./modules/hardware/index";
import { AudioFingerprint } from "./modules/audio/index";
import { BrowserFingerprint } from "./modules/browser/index";
import { PreferencesFingerprint } from "./modules/preference/index";
import { AbstractFingerprint, InjectValueCallback, FingerprintResult } from "./abstract/abstractFingerprint";
import { CONFIG, FingerprintStep } from "../index";

export interface F4Data {
  audio: AudioGroupInfo;
  browser: BrowserGroupInfo;
  hardware: HardwareGroupInfo;
  preferences: PreferencesGroupInfo;
}

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
      audio,
      browser,
      hardware,
      preferences,
    };
  }

  protected extractAttributes(data: F4Data): Record<string, any> {
    return {
      ...data.audio,
      ...data.browser,
      ...data.hardware,
      ...data.preferences,
    };
  }

  protected buildPayload(
    sessionKey: string,
    fingerprintData: F4Data,
    hashed: string
  ): any {
    const fp = {
      au: this.encodeData(fingerprintData.audio),
      br: this.encodeData(fingerprintData.browser),
      hw: this.encodeData(fingerprintData.hardware),
      pf: this.encodeData(fingerprintData.preferences),
    };

    return { sk: sessionKey, fp, hs: hashed };
  }

  public async processF4Data(
    sessionKey: string,
    callback: InjectValueCallback
  ): Promise<Record<string, any>> {
    const result = await this.process(sessionKey, callback);
    return result.attributes;
  }

  public static create(): F4Fingerprint {
    return new F4Fingerprint();
  }

}
