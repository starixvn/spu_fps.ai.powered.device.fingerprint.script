// IP (WebRTC)
export interface WebRTCGroupInfo {
    localIPs: string[];
    publicIPs: string[];
    relayIPs: string[];
    flags: {
      isSupported: boolean;
      isBlocked: boolean;
      hasNoise: boolean;
      relayOnly: boolean;
    };
    error: string | null;
    timestamp: string;
  }

declare global {
    interface Window {
      webRTCData: any;
    }
  }