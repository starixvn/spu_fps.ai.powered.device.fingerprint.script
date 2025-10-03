import { WebRTCFingerprint } from './modules/webrtc';

export class IPClass {
    public async start(callback: any): Promise<void> {
        try {
            const webRTC = await this.collectWebRTC();

            callback(webRTC);

            if (typeof window !== 'undefined') {
                (window as any).webRTCData = webRTC;
            }
        } catch (error) {
            callback({});
        }
    }

    private async collectWebRTC(): Promise<any> {
        return await WebRTCFingerprint.collect();
    }
}
