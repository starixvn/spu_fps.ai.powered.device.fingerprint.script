export interface CollectedDeviceInfo {
    sk: string;
    tag?: string;
    f4: string | null;
    f5: string | null;
    rtc?: any;
    v?: string;
    fv?: string;
    taggingType?: number;
  }

declare global {
    interface Window {
        deviceInfo: any;
    }
}