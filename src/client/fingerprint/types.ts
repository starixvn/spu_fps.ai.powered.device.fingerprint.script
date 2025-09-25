import { FingerprintSpecialValue } from './utils/consts';

// Bit type for boolean values as 0 or 1
export type Bit = 0 | 1;

export interface FingerprintData {
  HardwareFingerprint: HardwareGroupInfo;
  GraphicsFingerprint: GraphicsGroupInfo;
  AudioFingerprint: AudioGroupInfo;
  BrowserFingerprint: BrowserGroupInfo;
  PreferencesFingerprint: PreferencesGroupInfo;
  timestamp: string;
}

export interface F4Data {
  audio: AudioGroupInfo;
  browser: BrowserGroupInfo;
  hardware: HardwareGroupInfo;
  preferences: PreferencesGroupInfo;
}

export interface CollectedDeviceInfo {
  sk: string;
  tag?: string;
  f4?: string;
  f5?: string;
  rtc?: any;
  v?: string;
}

// #region Hardware
export interface HardwareGroupInfo {
  platform: string | FingerprintSpecialValue;
  architecture: number | FingerprintSpecialValue;
  oscpu: string | FingerprintSpecialValue;
  cpuClass: string | FingerprintSpecialValue;
  hardwareConcurrency: number | string | FingerprintSpecialValue;
  deviceMemory: number | string | FingerprintSpecialValue;
}

export interface DeviceMemoryInfo {
  deviceMemory: number | string | FingerprintSpecialValue;
}

export interface HardwareConcurrencyInfo {
  hardwareConcurrency: number | string | FingerprintSpecialValue;
}

export interface CpuClassInfo {
  cpuClass: string | FingerprintSpecialValue;
}

export interface PlatformInfo {
  platform: string | FingerprintSpecialValue;
}

export interface ArchitectureInfo {
  architecture: number | FingerprintSpecialValue;
}

export interface OSCpuInfo {
  oscpu: string | FingerprintSpecialValue;
}
// #endregion

// #region Graphics
export interface GraphicsGroupInfo {
  canvas: CanvasInfo;
  webglBasics: WebGLBasicsInfo | FingerprintSpecialValue;
  webglExtensions: WebGLExtensionsInfo;
  fonts: FontsInfo | FingerprintSpecialValue;
  fontPreferences: FontPreferencesInfo;
  screenResolution: [number, number];
  screenFrame: [number, number, number, number];
  colorDepth: number | FingerprintSpecialValue;
  colorGamut: 'srgb' | 'p3' | 'rec2020' | FingerprintSpecialValue;
}

export type CanvasInfo = [string | FingerprintSpecialValue, Bit]; // [value, canvasProtection]

export type WebGLBasicsInfo = [
  string | FingerprintSpecialValue,
  string | FingerprintSpecialValue,
  string | FingerprintSpecialValue,
  string | FingerprintSpecialValue,
  string | FingerprintSpecialValue,
  string | FingerprintSpecialValue
]; // [version, vendor, vendorUnmasked, renderer, rendererUnmasked, shadingLanguageVersion]

export type WebGLExtensionsInfo = string | FingerprintSpecialValue;

export interface WebGLExtensionsData {
  contextAttributes: string[];
  parameters: string[];
  shaderPrecisions: string[];
  extensions: string[] | null;
  extensionParameters: string[];
  unsupportedExtensions: string[];
}

export type FontsInfo = string[];

export interface FontPreferencesInfo {
  default: number | FingerprintSpecialValue;
  apple: number | FingerprintSpecialValue;
  serif: number | FingerprintSpecialValue;
  sans: number | FingerprintSpecialValue;
  mono: number | FingerprintSpecialValue;
  min: number | FingerprintSpecialValue;
  system: number | FingerprintSpecialValue;
}
// #endregion

// #region Audio
export interface AudioGroupInfo {
  audio: number | FingerprintSpecialValue;
  audioBaseLatency: number | FingerprintSpecialValue;
}
// #endregion

// #region Browser
export interface BrowserGroupInfo {
  browserName: BrowserNameInfo;
  osName: OSNameInfo;
  userAgent: UserAgentInfo;
  vendor: VendorInfo;
  vendorFlavors: VendorFlavorsInfo;
  plugins: PluginsInfo;
  pdfViewerEnabled: PdfViewerEnabledInfo;
}

export type BrowserNameInfo = string | FingerprintSpecialValue;

export type OSNameInfo = string | FingerprintSpecialValue;

export type UserAgentInfo = string | FingerprintSpecialValue;

export type VendorInfo = string | FingerprintSpecialValue;

export type VendorFlavorsInfo = string[] | FingerprintSpecialValue;

export type PluginsInfo = string[] | FingerprintSpecialValue;

export type PdfViewerEnabledInfo = Bit | FingerprintSpecialValue;
// #endregion

// #region Preferences
export interface PreferencesGroupInfo {
  languages: LanguagesInfo;
  timezone: TimezoneInfo;
  touchSupport: TouchSupportInfo;
  cookiesEnabled: CookiesEnabledInfo;
  localStorage: LocalStorageInfo;
  sessionStorage: SessionStorageInfo;
  openDatabase: OpenDatabaseInfo;
  indexedDB: IndexedDBInfo;
}

export type LanguagesInfo = string[][] | FingerprintSpecialValue;

export type TimezoneInfo = string | FingerprintSpecialValue;

export type TouchSupportInfo = [number, Bit, Bit] | FingerprintSpecialValue; // [maxTouchPoints, touchEvent, touchStart]

export type CookiesEnabledInfo = Bit | FingerprintSpecialValue;

export type LocalStorageInfo = Bit | FingerprintSpecialValue;

export type SessionStorageInfo = Bit | FingerprintSpecialValue;

export type OpenDatabaseInfo = Bit | FingerprintSpecialValue;

export type IndexedDBInfo = Bit | FingerprintSpecialValue;
// #endregion

declare global {
  interface Window {
    f4Attributes: any;
    f5Attributes: any;
    BrowserFingerprint: any;
    HardwareFingerprint: any;
    AudioFingerprint: any;
    PreferencesFingerprint: any;
    webkitAudioContext?: any;
    webkitDevicePixelRatio?: number;
    chrome: any;
    opr: any;
    opera: any;
    safari: any;
    StyleMedia: any;
    InstallTrigger: any;
  }

  interface Navigator {
    userAgentData?: {
      brands: any[];
      mobile: Bit;
      platform: string;
      getHighEntropyValues: (hints: string[]) => Promise<{
        architecture?: string;
        bitness?: string;
        brands?: Array<{
          brand: string;
          version: string;
        }>;
        fullVersionList?: Array<{
          brand: string;
          version: string;
        }>;
        mobile?: Bit;
        model?: string;
        platform?: string;
        platformVersion?: string;
        uaFullVersion?: string;
        wow64?: Bit;
      }>;
    };
    deviceMemory?: number;
    cpuClass?: string;
    oscpu?: string;
    buildID?: string;
    pdfViewerEnabled?: Bit;
    brave: any;
    msLaunchUri: any;
    standalone: Bit;
  }

  interface Screen {
    webkitOrientation?: {
      type: string;
      angle: number;
    };
    mozOrientation?: {
      type: string;
      angle: number;
    };
    msOrientation?: {
      type: string;
      angle: number;
    };
    webkitDevicePixelRatio?: number;
  }
}
