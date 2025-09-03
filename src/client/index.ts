import { DOMUtils } from "./dom";
import { FingerprintClass } from "./fingerprint";
import { CollectedDeviceInfo } from "./fingerprint/types";
import { Base64Encoder } from "./fingerprint/utils/hash";
import { TaggingClass } from "./tagging";
import { PacketTransformer } from "./tagging/utils/hash";

export const CONFIG = {
    ENCODING_KEY: "__ENCODE_KEY__",
    GATEWAY_URL: "__GATEWAY_URL__",
    ENDPOINTS: {
      F4: "/CheckFP4",
      F5: "/CheckFP5"
    },
    FIELD_NAMES: {
      DEVICE_INFO: "__di"
    }
}

export type FingerprintStep = 'F4' | 'F5';
  
export class ClientClass {

    private injectValueIntoHiddenField(value: string): void {
        try {
          DOMUtils.injectValueIntoHiddenField(CONFIG.FIELD_NAMES.DEVICE_INFO, value);
        } catch (error) {
          // console.error(`Failed to inject value into field ${fieldName}:`, error);
        }
    }

    private injectCallback(deviceInfo: CollectedDeviceInfo, hashed: string, step?: FingerprintStep): void {
        if (step === 'F4') {
            deviceInfo.f4Hashed = hashed;
        } else if (step === 'F5') {
            deviceInfo.f5Hashed = hashed;
        }

        const encodedData = Base64Encoder.encodeBase64(JSON.stringify(deviceInfo), CONFIG.ENCODING_KEY);
        this.injectValueIntoHiddenField(encodedData);
    }

    public async start(): Promise<void> {
        try {
            const fingerprint = new FingerprintClass();
            const tagging = new TaggingClass();
            const sessionKey = await tagging.start();
            
            const deviceInfo: CollectedDeviceInfo = { 
                sessionKey, 
                deviceId: PacketTransformer.unwrapMessage(sessionKey) 
            };

            const collectedData = await fingerprint.start(sessionKey, (hashed: string, step?: FingerprintStep) => {
                this.injectCallback(deviceInfo, hashed, step);
            });
            
            deviceInfo.webrtc = collectedData.webrtc;
            const finalEncodedData = Base64Encoder.encodeBase64(JSON.stringify(deviceInfo), CONFIG.ENCODING_KEY);
            this.injectValueIntoHiddenField(finalEncodedData);

            if (typeof window !== "undefined") {
                (window as any).deviceInfo = deviceInfo;
            }

        } catch (error) {
            // console.error('Client start failed:', error);
        }
    }
}

const client = new ClientClass();
client.start();