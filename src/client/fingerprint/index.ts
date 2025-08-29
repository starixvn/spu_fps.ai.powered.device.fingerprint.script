/// <reference lib="dom" />

import { WebRTCGroupResult, AudioGroupResult, BrowserGroupResult, HardwareGroupResult, PreferencesGroupResult, GraphicsGroupResult } from "./types";
import { HardwareFingerprint } from "./modules/hardware/index";
import { GraphicsFingerprint } from "./modules/graphics/index";
import { AudioFingerprint } from "./modules/audio/index";
import { BrowserFingerprint } from "./modules/browser/index";
import { PreferencesFingerprint } from "./modules/preference/index";
import { WebRTCFingerprint } from "./modules/webrtc/index";
import { MurmurHash128, Base64Encoder } from "./utils/hash";
import { DOMUtils } from "./dom";

const ENCODING_KEY = "__ENCODE_KEY__";
const GATEWAY_URL = "__GATEWAY_URL__";

class FPSFingerprintClass {
  public readonly version: string = "1.9.0";

  public async collectIPs(timeout: number = 5000): Promise<WebRTCGroupResult> {
    return await WebRTCFingerprint.collect(timeout);
  }

  public async collectLocalIPs(timeout: number = 5000): Promise<string[]> {
    return await WebRTCFingerprint.getLocalIPs(timeout);
  }

  public async collectPublicIPs(timeout: number = 5000): Promise<string[]> {
    return await WebRTCFingerprint.getPublicIPs(timeout);
  }

  public async collectRelayIPs(timeout: number = 5000): Promise<string[]> {
    return await WebRTCFingerprint.getRelayIPs(timeout);
  }

  public generateGroupHashes(
    fingerprint: any
    ): string {
    const fingerprintHash = MurmurHash128.hash128(JSON.stringify(fingerprint));

    return fingerprintHash;
  }

  public async collectF4(): Promise<{
    AudioFingerprint: AudioGroupResult;
    BrowserFingerprint: BrowserGroupResult;
    HardwareFingerprint: HardwareGroupResult;
    PreferencesFingerprint: PreferencesGroupResult;
  }> {
    const audio = await AudioFingerprint.collect();
    const browser = BrowserFingerprint.collect();
    const hardware = await HardwareFingerprint.collect();
    const preferences = await PreferencesFingerprint.collect();

    return {
      AudioFingerprint: audio,
      BrowserFingerprint: browser,
      HardwareFingerprint: hardware,
      PreferencesFingerprint: preferences,
    };
  }

  public async collectF5(): Promise<{
    GraphicsFingerprint: GraphicsGroupResult;
    timestamp: string;
  }> {
    const graphics = await GraphicsFingerprint.collect();

    return {
      GraphicsFingerprint: graphics,
      timestamp: new Date().toISOString(),
    };
  }

  public async sendToServer(
    endpoint: string,
    payload: any
  ): Promise<boolean> {
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        return navigator.sendBeacon(endpoint, blob);
      } else {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          body: JSON.stringify(payload)
        });
        return response.ok;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  private encodeData(obj: any): string {
    return Base64Encoder.encodeBase64(JSON.stringify(obj), ENCODING_KEY);
  }

  private buildPayload(type: 'F4' | 'F5', sessionKey: string, fingerprintData: any, hashed: string): any {
    const fingerprint: any = {};

    if (type === 'F4') {
      fingerprint.audio = this.encodeData(fingerprintData.AudioFingerprint);
      fingerprint.browser = this.encodeData(fingerprintData.BrowserFingerprint);
      fingerprint.hardware = this.encodeData(fingerprintData.HardwareFingerprint);
      fingerprint.preferences = this.encodeData(fingerprintData.PreferencesFingerprint);
    }
  
    if (type === 'F5') {
      fingerprint.graphics = this.encodeData(fingerprintData.GraphicsFingerprint);
    }
  
    return { sessionKey, fingerprint, hashed: hashed };
  }

  /**
   * Convenience method to inject values into hidden form fields
   * @param fieldName - The name of the field to inject value into
   * @param value - The value to inject
   */
  public injectValueIntoHiddenField(fieldName: string, value: string): void {
    DOMUtils.injectValueIntoHiddenField(fieldName, value);
  }

  /**
   * Cleans up DOM elements commonly used in fingerprinting
   */
  public cleanup(): void {
    DOMUtils.cleanup();
  }

  /**
   * Cleans up DOM elements with configuration-based IDs
   * @param config - Configuration object for dynamic element IDs
   */
  public cleanupWithConfig(ip: string): void {
    DOMUtils.cleanupWithConfig(ip);
  }

  public 

  public async start(
  ): Promise<{ f4Success: boolean; f5Success: boolean; }> {
    try {
      console.log("start");
      let sessionKey = await TaggingHandler.getTaggingValue();

      if (!sessionKey) {
        sessionKey = TaggingHandler.generateTagging();
      }

      console.log("sessionKey", sessionKey);

      const f4Data = await this.collectF4();
      const f4Hash = this.generateGroupHashes(f4Data);
      console.log("f4Data", f4Data);

      const f4Payload = this.buildPayload('F4', sessionKey, f4Data, f4Hash);

      // Send F4 first
      const f4Result = await this.sendToServer(`${GATEWAY_URL}/InsertFP4`, f4Payload);

      const f5Data = await this.collectF5();

      const mergedData = { ...f4Data, ...f5Data };
      console.log("mergedData", mergedData);

      const f5Hash = this.generateGroupHashes(mergedData);
      console.log("f5Data", f5Data);

      const f5Payload = this.buildPayload('F5', sessionKey, f5Data, f5Hash);
      // Then send F5
      const f5Result = await this.sendToServer(`${GATEWAY_URL}/InsertFP5`, f5Payload);

      return {
        f4Success: f4Result,
        f5Success: f5Result
      };
    } catch (error) {
      return {
        f4Success: false,
        f5Success: false
      };
    }
  }
}

const fpsFingerprint = new FPSFingerprintClass();

if (typeof window !== "undefined") {
  window.FPSFingerprint = fpsFingerprint;
}

export default fpsFingerprint;
