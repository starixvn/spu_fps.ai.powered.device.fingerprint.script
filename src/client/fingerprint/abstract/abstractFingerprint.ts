/// <reference lib="dom" />

import { MurmurHash128, Base64Encoder } from "../utils/hash";
import { CONFIG, FingerprintStep } from "../../index";

export type InjectValueCallback = (hashed: string, step?: FingerprintStep) => void;

export interface FingerprintResult {
  attributes: Record<string, any>;
  hashed: string;
  step: FingerprintStep;
}

export abstract class AbstractFingerprint {
  protected abstract readonly step: FingerprintStep;
  protected abstract readonly endpoint: string;

  protected abstract collectData(): Promise<any>;

  protected abstract extractAttributes(data: any, additionalData?: any): Record<string, any>;

  protected generateGroupHashes(fingerprint: any): string {
    try {
      return MurmurHash128.hash128(JSON.stringify(fingerprint));
    } catch (error) {
      // console.log('Hash generation error', error);
      return "";
    }
  }

  protected encodeData(obj: any): string {
    return Base64Encoder.encodeBase64(JSON.stringify(obj), CONFIG.ENCODING_KEY);
  }

  protected async sendViaBeacon(endpoint: string, payload: any): Promise<boolean> {
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

  protected async sendViaFetch(endpoint: string, payload: any): Promise<boolean> {
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

  protected async sendToServer(endpoint: string, payload: any): Promise<boolean> {
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

  protected abstract buildPayload(
    sessionKey: string,
    fingerprintData: any,
    hashed: string
  ): any;

  public async process(
    sessionKey: string,
    injectCallback: InjectValueCallback,
    additionalData?: any
  ): Promise<FingerprintResult> {
    try {
      const data = await this.collectData();
      
      const attributes = this.extractAttributes(data, additionalData);

      const hashed = this.generateGroupHashes(attributes);

      injectCallback(hashed, this.step);

      const payload = this.buildPayload(sessionKey, data, hashed);
      await this.sendToServer(`${CONFIG.GATEWAY_URL}${this.endpoint}`, payload);

      return {
        attributes,
        hashed,
        step: this.step
      };
    } catch (error) {
      // console.error(`${this.step} fingerprint collection failed:`, error);
      throw error;
    }
  }

  public async collect(): Promise<Record<string, any>> {
    try {
      const data = await this.collectData();
      return this.extractAttributes(data);
    } catch (error) {
      // console.error(`${this.step} collection failed:`, error);
      return {};
    }
  }
}
