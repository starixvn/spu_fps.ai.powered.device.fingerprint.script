/// <reference lib="dom" />

import { MurmurHash128, Base64Encoder } from '../utils/hash';
import { CONFIG } from '../../index';

export interface FingerprintResult {
    attributes: Record<string, any>;
    hashed: string;
}

export abstract class AbstractFingerprint {
    protected abstract readonly endpoint: string;

    protected abstract collectData(): Promise<any>;

    protected abstract extractAttributes(
        data: any,
        additionalData?: any
    ): Record<string, any>;

    protected abstract extractFlatAttributes(
        data: any
    ): Record<string, any>;

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
            };
        } catch (error) {
            // console.error(`${this.step} fingerprint collection failed:`, error);
            throw error;
        }
    }
}
