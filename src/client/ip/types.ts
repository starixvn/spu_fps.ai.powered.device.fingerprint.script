import { FingerprintSpecialValue } from '../fingerprint/utils/consts';

export type WebRTCGroupInfo = string | FingerprintSpecialValue;

declare global {
    interface Window {
      webRTCData: any;
    }
  }