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

// #region Hardware
export interface HardwareGroupInfo {
  platform: string;
  architecture: number;
  oscpu: string;
  cpuClass: string;
  hardwareConcurrency: number | string;
  deviceMemory: number | string;
}

export interface DeviceMemoryInfo {
  deviceMemory: number | string;
}

export interface HardwareConcurrencyInfo {
  hardwareConcurrency: number | string;
}

export interface CpuClassInfo {
  cpuClass: string;
}

export interface PlatformInfo {
  platform: string;
}

export interface ArchitectureInfo {
  architecture: number;
}

export interface OSCpuInfo {
  oscpu: string;
}
// #endregion

// #region Graphics
export interface GraphicsGroupInfo {
  canvas: CanvasInfo;
  webglBasics: WebGLBasicsInfo;
  webglExtensions: WebGLExtensionsInfo;
  fonts: FontsInfo;
  fontPreferences: FontPreferencesInfo;
  screenResolution: [number, number];
  screenFrame: [number, number, number, number];
  colorDepth: number | "";
  colorGamut: 'srgb' | 'p3' | 'rec2020' | undefined;
}

export type CanvasInfo = [string, Bit]; // [value, canvasProtection]

export type WebGLBasicsInfo = [string, string, string, string, string, string]; // [version, vendor, vendorUnmasked, renderer, rendererUnmasked, shadingLanguageVersion]

export type WebGLExtensionsInfo = string;

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
  default: number;
  apple: number;
  serif: number;
  sans: number;
  mono: number;
  min: number;
  system: number;
}
// #endregion

// #region Audio
export interface AudioGroupInfo {
  audio: number | null;
  audioBaseLatency: number | -1 | -2 | -3;
}

export interface AudioInfo {
  audio: number | null;
  status: string;
}

export interface AudioBaseLatencyInfo {
  audioBaseLatency: number | -1 | -2 | -3;
}
// #endregion

// #region Browser
export interface BrowserGroupInfo {
  browserName: string;
  osName: string;
  userAgent: string;
  vendor: string;
  vendorFlavors: string[];
  plugins: string[]; 
  pdfViewerEnabled: Bit;
}

export interface BrowserNameInfo {
  browserName: string;
}

export interface OSNameInfo {
  osName: string;
}

export interface UserAgentInfo {
  userAgent: string;
}

export interface VendorInfo {
  vendor: string;
}

export interface VendorFlavorsInfo {
  vendorFlavors: string[];
}

export interface PluginMimeTypeData {
  type: string;
  suffixes: string;
}

export interface PluginData {
  name: string;
  description: string;
  mimeTypes: PluginMimeTypeData[];
}

export type PluginsInfo = string[]; 

export interface PdfViewerEnabledInfo {
  pdfViewerEnabled: Bit;
}
// #endregion

// #region Preferences
export interface PreferencesGroupInfo {
  languages: string[][];
  timezone: string;
  touchSupport: TouchSupportInfo;
  cookiesEnabled: Bit;
  localStorage: Bit;
  sessionStorage: Bit;
  openDatabase: Bit;
  indexedDB: Bit;
}
export interface LanguagesInfo {
  languages: string[][];
}

export interface TimezoneInfo {
  timezone: string;
}

export type TouchSupportInfo = [number, Bit, Bit]; // [maxTouchPoints, touchEvent, touchStart]

export interface CookiesEnabledInfo {
  cookiesEnabled: Bit;
}

export interface LocalStorageInfo {
  localStorage: Bit;
}

export interface SessionStorageInfo {
  sessionStorage: Bit;
}

export interface OpenDatabaseInfo {
  openDatabase: Bit;
}

export interface IndexedDBInfo {
  indexedDB: Bit;
}
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
