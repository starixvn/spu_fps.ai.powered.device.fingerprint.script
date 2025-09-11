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
            // Create a div element to log WebRTC data
            var divElement = window.document.createElement('div');
            divElement.innerText = `Error Collecting WebRTC data... ${error}`;
            window.document.body.appendChild(divElement);
            callback({});
        }
    }

    private async collectWebRTC(): Promise<any> {
        return await WebRTCFingerprint.collect();
    }
}
