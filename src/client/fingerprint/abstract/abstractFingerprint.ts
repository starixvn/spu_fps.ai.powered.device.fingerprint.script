/// <reference lib="dom" />

import { MurmurHash128, Base64Encoder } from '../utils/hash';
import { CONFIG, FingerprintStep } from '../../index';

export interface FingerprintResult {
    attributes: Record<string, any>;
    hashed: string;
    step: FingerprintStep;
}

export abstract class AbstractFingerprint {
    protected abstract readonly step: FingerprintStep;
    protected abstract readonly endpoint: string;

    protected abstract collectData(): Promise<any>;

    protected abstract extractAttributes(
        data: any,
        additionalData?: any
    ): Record<string, any>;

    protected abstract extractFlatAttributes(
        data: any
    ): Record<string, any>;

    protected abstract buildPayload(
        sessionKey: string,
        fingerprintData: Record<string, any>,
    ): any;
    
    protected encodeData(obj: any): string {
        return Base64Encoder.encodeBase64(
            JSON.stringify(obj),
            CONFIG.ENCODING_KEY
        );
    }

    protected generateGroupHashes(fingerprint: any): string {
        try {
            const flatFingerprint = this.extractFlatAttributes(fingerprint);

            const sortedFingerprint = Object.keys(flatFingerprint).sort().reduce((acc, key) => {
                acc[key] = flatFingerprint[key];
                return acc;
            }, {} as Record<string, any>);

            const values = Object.values(sortedFingerprint);
            
            const processedValues = values.map(v => 
                typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')
            ).join('|');

            return MurmurHash128.hash128(processedValues);
        } catch (error) {
            // console.log('Hash generation error', error);
            return '';
        }
    }

    protected async sendViaBeacon(
        endpoint: string,
        payload: any
    ): Promise<boolean> {
        try {
            if (!navigator.sendBeacon) {
                return false;
            }
            const formData = new FormData();
            formData.append('request', payload);
            return navigator.sendBeacon(endpoint, formData);
        } catch (error) {
            // console.error('Failed to send data via sendBeacon:', error);
            return false;
        }
    }

    protected async sendViaFetch(
        endpoint: string,
        payload: any
    ): Promise<boolean> {
        try {
            const formData = new FormData();
            formData.append('request', payload);

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            return response.ok;
        } catch (error) {
            // console.error('Failed to send data via fetch:', error);
            return false;
        }
    }

    protected async sendToServer(
        endpoint: string,
        payload: any
    ): Promise<boolean> {
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

    protected mapAttributes<T extends Record<string, any>>(
        aliases: Record<keyof T, string>, 
        data: T
      ): Record<string, T[keyof T]> {
        const result: Record<string, T[keyof T]> = {};
      
        for (const [dataKey, aliasKey] of Object.entries(aliases)) {
          const key = dataKey as keyof T;
          result[aliasKey] = data[key];
        }
      
        return result;
      }

    public async process(
        additionalData?: any
    ): Promise<FingerprintResult> {
        try {
            const data = await this.collectData();

            const attributes = this.extractAttributes(data, additionalData);

            const hashed = this.generateGroupHashes(attributes);

            return {
                attributes,
                hashed,
                step: this.step,
            };
        } catch (error) {
            // console.error(`${this.step} fingerprint collection failed:`, error);
            throw error;
        }
    }
}
