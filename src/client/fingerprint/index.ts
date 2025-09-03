/// <reference lib="dom" />

import {
  AudioGroupInfo,
  BrowserGroupInfo,
  HardwareGroupInfo,
  PreferencesGroupInfo,
  GraphicsGroupInfo,
} from "./types";
import { HardwareFingerprint } from "./modules/hardware/index";
import { GraphicsFingerprint } from "./modules/graphics/index";
import { AudioFingerprint } from "./modules/audio/index";
import { BrowserFingerprint } from "./modules/browser/index";
import { PreferencesFingerprint } from "./modules/preference/index";
import { WebRTCFingerprint } from "./modules/webrtc/index";
import { MurmurHash128, Base64Encoder } from "./utils/hash";
import { CONFIG, FingerprintStep } from "../index";

type InjectValueCallback = (hashed: string, step?: FingerprintStep) => void;

export class FingerprintClass {
  public readonly version: string = "1.9.0";

  private generateGroupHashes(fingerprint: any): string {
    try {
      return MurmurHash128.hash128(JSON.stringify(fingerprint));
    } catch (error) {
      // console.log('error', error);
      return "";
    }
  }

  private async collectF4(): Promise<{
    audio: AudioGroupInfo;
    browser: BrowserGroupInfo;
    hardware: HardwareGroupInfo;
    preferences: PreferencesGroupInfo;
  }> {
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

  private async collectGraphics(): Promise<{
    graphics: GraphicsGroupInfo;
  }> {
    const graphics = await GraphicsFingerprint.collect();
    return {
      graphics,
    };
  }

  private async sendViaBeacon(
    endpoint: string,
    payload: any
  ): Promise<boolean> {
    try {
      if (!navigator.sendBeacon) {
        return false;
      }

      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      return navigator.sendBeacon(endpoint, blob);
    } catch (error) {
      // console.error('Failed to send data via sendBeacon:', error);
      return false;
    }
  }

  private async sendViaFetch(endpoint: string, payload: any): Promise<boolean> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      // console.error('Failed to send data via fetch:', error);
      return false;
    }
  }

  private async sendToServer(endpoint: string, payload: any): Promise<boolean> {
    try {
      const beaconSuccess = await this.sendViaBeacon(endpoint, payload);
      if (beaconSuccess) {
        return true;
      }

      return await this.sendViaFetch(endpoint, payload);
    } catch (error) {
      // console.error('Failed to send data to server:', error);
      return false;
    }
  }

  private encodeData(obj: any): string {
    return Base64Encoder.encodeBase64(JSON.stringify(obj), CONFIG.ENCODING_KEY);
  }

  private buildPayload(
    type: "F4" | "F5",
    sessionKey: string,
    fingerprintData: any,
    hashed: string
  ): any {
    const fingerprint: any = {};

    if (type === "F4") {
      fingerprint.audio = this.encodeData(fingerprintData.audio);
      fingerprint.browser = this.encodeData(fingerprintData.browser);
      fingerprint.hardware = this.encodeData(fingerprintData.hardware);
      fingerprint.preferences = this.encodeData(fingerprintData.preferences);
    }

    if (type === "F5") {
      fingerprint.graphics = this.encodeData(fingerprintData.graphics);
    }

    return { sessionKey, fingerprint, hashed };
  }

  private async processData<T>(options: {
    step: FingerprintStep;
    sessionKey: string;
    injectCallback: InjectValueCallback;
    collectFn: () => Promise<T>;
    extractAttributes: (data: T) => Record<string, any>;
    endpoint: string;
  }): Promise<any> {
    const {
      step,
      sessionKey,
      injectCallback,
      collectFn,
      extractAttributes,
      endpoint,
    } = options;

    try {
      const data = await collectFn();
      const attributes = extractAttributes(data);

      const hashed = this.generateGroupHashes(attributes);

      injectCallback(hashed, step);

      const payload = this.buildPayload(step, sessionKey, data, hashed);
      await this.sendToServer(`${CONFIG.GATEWAY_URL}${endpoint}`, payload);

      return attributes;
    } catch (error) {
      // Consider logging with a proper logger or monitoring tool
    }
  }

  public async processF4Data(
    sessionKey: string,
    injectCallback: InjectValueCallback
  ): Promise<any> {
    return this.processData({
      step: "F4",
      sessionKey,
      injectCallback,
      collectFn: () => this.collectF4(),
      extractAttributes: (data) => ({
        ...data.audio,
        ...data.browser,
        ...data.hardware,
        ...data.preferences,
      }),
      endpoint: CONFIG.ENDPOINTS.F4,
    });
  }

  public async processF5Data(
    sessionKey: string,
    f4Attributes: Record<string, any>,
    injectCallback: InjectValueCallback
  ): Promise<any> {
    return this.processData({
      step: "F5",
      sessionKey,
      injectCallback,
      collectFn: () => this.collectGraphics(),
      extractAttributes: (data) => ({
        ...f4Attributes,
        ...data.graphics,
      }),
      endpoint: CONFIG.ENDPOINTS.F5,
    });
  }

  public async collectWebRTC(): Promise<any> {
    try {
      return await WebRTCFingerprint.collect();
    } catch (error) {
      // console.error('Failed to collect WebRTC:', error);
      return { webrtc: {} };
    }
  }

  public async start(
    sessionKey: string,
    injectCallback: InjectValueCallback
  ): Promise<any> {
    try {
      const f4Attributes = await this.processF4Data(sessionKey, injectCallback);

      if (typeof window !== "undefined") {
        (window as any).f4Attributes = f4Attributes;
      }

      const f5Attributes = await this.processF5Data(
        sessionKey,
        f4Attributes,
        injectCallback
      );
      if (typeof window !== "undefined") {
        (window as any).f5Attributes = f5Attributes;
      }

      const webrtcData = await this.collectWebRTC();
      if (typeof window !== "undefined") {
        (window as any).webrtcData = webrtcData;
      }

      return {
        f4: f4Attributes,
        f5: f5Attributes,
        webrtc: webrtcData,
        sessionKey,
      };
    } catch (error) {
      // console.error('Fingerprint collection failed:', error);
      throw error;
    }
  }
}
