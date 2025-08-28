/// <reference lib="dom" />

import { WebRTCGroupResult, AudioGroupResult, BrowserGroupResult, HardwareGroupResult, PreferencesGroupResult, GraphicsGroupResult } from "./types";
import { HardwareFingerprint } from "./modules/hardware/index";
import { GraphicsFingerprint } from "./modules/graphics/index";
import { AudioFingerprint } from "./modules/audio/index";
import { BrowserFingerprint } from "./modules/browser/index";
import { PreferencesFingerprint } from "./modules/preference/index";
import { WebRTCFingerprint } from "./modules/webrtc/index";
import { FingerprintHasher, Base64Encoder } from "./utils/hash";

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

  public async generateGroupHashes(
    f4Components: {
    HardwareFingerprint: HardwareGroupResult;
    AudioFingerprint: AudioGroupResult;
    BrowserFingerprint: BrowserGroupResult;
    PreferencesFingerprint: PreferencesGroupResult;
  }, f5Graphics: GraphicsGroupResult): Promise<{
    hardware: string;
    graphics: string;
    audio: string;
    browser: string;
    preferences: string;    
  }> {
    const hardwareHash = FingerprintHasher.hashFingerprint(f4Components.HardwareFingerprint);
    const audioHash = FingerprintHasher.hashFingerprint(f4Components.AudioFingerprint);
    const browserHash = FingerprintHasher.hashFingerprint(f4Components.BrowserFingerprint);
    const preferencesHash = FingerprintHasher.hashFingerprint(f4Components.PreferencesFingerprint);
    const graphicsHash = FingerprintHasher.hashFingerprint(f5Graphics);

    return {
      hardware: hardwareHash,
      graphics: graphicsHash,
      audio: audioHash,
      browser: browserHash,
      preferences: preferencesHash,
    };
  }

  public async collectF4(): Promise<{
    AudioFingerprint: AudioGroupResult;
    BrowserFingerprint: BrowserGroupResult;
    HardwareFingerprint: HardwareGroupResult;
    PreferencesFingerprint: PreferencesGroupResult;
    timestamp: string;
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
      timestamp: new Date().toISOString(),
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

  public async sendF4ToServer(
    endpoint: string
  ): Promise<boolean> {
    try {
      const f4Data = await this.collectF4();
      console.log("f4Data", f4Data);
      
      const payload = {
        groupA: Base64Encoder.encodeBase64(JSON.stringify(f4Data.AudioFingerprint), ENCODING_KEY),
        groupB: Base64Encoder.encodeBase64(JSON.stringify(f4Data.BrowserFingerprint), ENCODING_KEY),
        groupC: Base64Encoder.encodeBase64(JSON.stringify(f4Data.HardwareFingerprint), ENCODING_KEY),
        groupD: Base64Encoder.encodeBase64(JSON.stringify(f4Data.PreferencesFingerprint), ENCODING_KEY),
      };

      if (navigator.sendBeacon) {
        console.log("sendBeacon", payload);
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

  public async sendF5ToServer(
    endpoint: string
  ): Promise<boolean> {
    try {
      const f5Data = await this.collectF5();
      
      const graphics = f5Data.GraphicsFingerprint;
      
      const payload = {
        groupB: Base64Encoder.encodeBase64(JSON.stringify(graphics.webglBasics), ENCODING_KEY),
      };

      if (navigator.sendBeacon) {
        console.log("sendBeacon", payload);
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

  public async start(
    f4Endpoint: string = `${GATEWAY_URL}/InsertFP4`,
    f5Endpoint: string = `${GATEWAY_URL}/InsertFP5`
  ): Promise<{ f4Success: boolean; f5Success: boolean; }> {
    try {
      // Send F4 first
      const f4Result = await this.sendF4ToServer(f4Endpoint);
      
      // Then send F5
      const f5Result = await this.sendF5ToServer(f5Endpoint);

      return {
        f4Success: f4Result,
        f5Success: f5Result
      };
    } catch (error) {
      console.error('Error in start function:', error);
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
