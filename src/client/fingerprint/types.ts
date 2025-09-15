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
  plf: string;
  arc: number;
  osc: string;
  ccl: string;
  hwc: number | string;
  dvm: number | string;
}

export interface DeviceMemoryInfo {
  dvm: number | string;
}

export interface HardwareConcurrencyInfo {
  hwc: number | string;
}

export interface CpuClassInfo {
  ccl: string;
}

export interface PlatformInfo {
  plf: string;
}

export interface ArchitectureInfo {
  arc: number;
}

export interface OSCpuInfo {
  osc: string;
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

export interface CanvasInfo {
  value: string;
  canvasProtection: boolean;
}

export interface WebGLBasicsInfo {
  version: string;
  vendor: string;
  vendorUnmasked: string;
  renderer: string;
  rendererUnmasked: string;
  shadingLanguageVersion: string;
}

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
  plugins: PluginData[];
  pdfViewerEnabled: boolean;
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

export interface PluginsInfo {
  plugins: PluginData[];
}

export interface PdfViewerEnabledInfo {
  pdfViewerEnabled: boolean;
}
// #endregion

// #region Preferences
export interface PreferencesGroupInfo {
  languages: string[][];
  timezone: string;
  touchSupport: TouchSupportInfo;
  cookiesEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  openDatabase: boolean;
  indexedDB: boolean;
}
export interface LanguagesInfo {
  languages: string[][];
}

export interface TimezoneInfo {
  timezone: string;
}

export interface TouchSupportInfo {
  maxTouchPoints: number;
  touchEvent: boolean;
  touchStart: boolean;
}

export interface CookiesEnabledInfo {
  cookiesEnabled: boolean;
}

export interface LocalStorageInfo {
  localStorage: boolean;
}

export interface SessionStorageInfo {
  sessionStorage: boolean;
}

export interface OpenDatabaseInfo {
  openDatabase: boolean;
}

export interface IndexedDBInfo {
  indexedDB: boolean;
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
      mobile: boolean;
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
        mobile?: boolean;
        model?: string;
        platform?: string;
        platformVersion?: string;
        uaFullVersion?: string;
        wow64?: boolean;
      }>;
    };
    deviceMemory?: number;
    cpuClass?: string;
    oscpu?: string;
    buildID?: string;
    pdfViewerEnabled?: boolean;
    brave: any;
    msLaunchUri: any;
    standalone: boolean;
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
