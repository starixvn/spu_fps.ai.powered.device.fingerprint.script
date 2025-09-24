import { F4Fingerprint } from "./f4Fingerprint";
import { F5Fingerprint } from "./f5Fingerprint";
import { IPClass } from "../ip";

export class FingerprintClass {
    private readonly f4Fingerprint: F4Fingerprint;
    private readonly f5Fingerprint: F5Fingerprint;
    private readonly ip: IPClass;

    constructor() {
        this.f4Fingerprint = new F4Fingerprint();
        this.f5Fingerprint = new F5Fingerprint();
        this.ip = new IPClass();
    }

    
    public async sendViaBeacon(
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

    public async sendViaFetch(
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

    public async sendToServer(
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

    public async start(callbackF4:Function, callbackF5:Function, callbackIP:Function): Promise<void> {

        await this.f4Fingerprint.start(callbackF4).then((f4Attributes: Record<string, any>) => {
            Promise.all([
                this.f5Fingerprint.start(f4Attributes, callbackF5),
                this.ip.start(callbackIP)
            ])
        });
    }
}