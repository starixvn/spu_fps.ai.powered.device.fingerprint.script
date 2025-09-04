export interface CollectedDeviceInfo {
    sessionKey: string;
    deviceId?: string;
    f4Hashed?: string;
    f5Hashed?: string;
    webrtc?: any;
  }

declare global {
    interface Window {
        deviceInfo: any;
    }
}