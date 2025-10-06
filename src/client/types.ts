export interface CollectedDeviceInfo {
    sk: string;
    tag?: string;
    f4?: string;
    f5?: string;
    rtc?: any;
    sv?: string;
    v?: string;
    tagType?: number;
  }

declare global {
    interface Window {
        deviceInfo: any;
    }
}