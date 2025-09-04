import { WebRTCFingerprint } from "./modules/webrtc";

export class IPClass {
    public async start(callback: any): Promise<void> {
        const webRTC = await WebRTCFingerprint.collect();

        callback(webRTC);
        
        if(window !== undefined) {
            (window as any).webRTCData = webRTC;
        }
       
    }
}