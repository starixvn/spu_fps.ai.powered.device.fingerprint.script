export type WebRTCGroupInfo = string;

declare global {
    interface Window {
      webRTCData: any;
    }
  }