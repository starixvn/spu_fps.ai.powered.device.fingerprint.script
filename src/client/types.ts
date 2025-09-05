export interface CollectedDeviceInfo {
    sk: string;
    tag?: string;
    f4?: string;
    f5?: string;
    rtc?: any;
    v?: string;
  }

declare global {
    interface Window {
        deviceInfo: any;
    }
}