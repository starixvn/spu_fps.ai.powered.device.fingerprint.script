/**
 * Shared TypeScript interfaces for fingerprinting
 */

export interface FingerprintData {
  userAgent: string;
  language: string;
  languages: string[];
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  onLine: boolean;
  screen: ScreenInfo;
  deviceMemory: number;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  colorDepth: number;
  pixelDepth: number;
  timezone: string;
  timezoneOffset: number;
  webgl: WebGLInfo | null;
  canvas: string | null;
  audio: string | null;
  fonts: string[];
  plugins: PluginInfo[];
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  webSQL: boolean;
  cpuClass: string;
  oscpu: string;
  buildID: string;
  clientHints: ClientHints | null;
  timestamp: string;
}

export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
}

export interface WebGLInfo {
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  unmaskedVendor?: string;
  unmaskedRenderer?: string;
}

export interface PluginInfo {
  name: string;
  description: string;
  filename: string;
  version?: string;
}

export interface ClientHints {
  brands?: any[];
  mobile?: boolean;
  platform?: string;
}

declare global {
  interface Window {
    FPSFingerprint: any;
    FPSAutoCollect?: boolean;
    FPSOnCollected?: (fingerprint: FingerprintData) => void;
    webkitAudioContext?: any;
  }
  interface Navigator {
    userAgentData?: {
      brands: any[];
      mobile: boolean;
      platform: string;
    };
    deviceMemory?: number;
    cpuClass?: string;
    oscpu?: string;
    buildID?: string;
  }
}
