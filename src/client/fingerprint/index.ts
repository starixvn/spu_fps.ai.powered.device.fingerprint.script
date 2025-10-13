import { F4Fingerprint } from "./f4Fingerprint";
import { F5Fingerprint } from "./f5Fingerprint";
import { IPClass } from "../ip";
import { ErrorLogger } from "../utils/errorLogger";

export class FingerprintClass {
    private readonly f4Fingerprint: F4Fingerprint;
    private readonly f5Fingerprint: F5Fingerprint;
    private readonly ip: IPClass;

    constructor() {
        this.f4Fingerprint = new F4Fingerprint();
        this.f5Fingerprint = new F5Fingerprint();
        this.ip = new IPClass();
    }
    
    public async sendToServer(
        endpoint: string,
        payload: any
    ): Promise<boolean> {
        try {
            const formData = new FormData();
            formData.append('request', payload);

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                keepalive: true
            });

            return response.ok;
        } catch (error) {
            ErrorLogger.error('Failed to send data via fetch:', error);
            return false;
        }
    }

    public async start(callbackF4:Function, callbackF5:Function, callbackIP:Function): Promise<void> {

       await Promise.all([
        this.f4Fingerprint.start(callbackF4).then((f4Attributes: Record<string, any>) => {
            this.f5Fingerprint.start(f4Attributes, callbackF5);
        }),
        this.ip.start(callbackIP)
       ]);
    }
}