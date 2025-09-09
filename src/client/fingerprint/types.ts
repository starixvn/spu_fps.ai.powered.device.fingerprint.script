export interface FingerprintData {
  HardwareFingerprint: HardwareGroupInfo;
  GraphicsFingerprint: GraphicsGroupInfo;
  AudioFingerprint: AudioGroupInfo;
  BrowserFingerprint: BrowserGroupInfo;
  PreferencesFingerprint: PreferencesGroupInfo;
  timestamp: string;
}

export interface F4Data {
  au: AudioGroupInfo;
  br: BrowserGroupInfo;
  hw: HardwareGroupInfo;
  pf: PreferencesGroupInfo;
}

// Hardware
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

// Graphics
export interface GraphicsGroupInfo {
  canvas: CanvasInfo;
  webglBasics: WebGLBasicsInfo;
  webglExtensions: WebGLExtensionsInfo;
  fonts: string[];
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

export interface WebGLExtensionsInfo {
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

// Audio
export interface AudioGroupInfo {
  audio: number | null;
  audioBaseLatency: number | string;
}

export interface AudioInfo {
  audio: number | null;
  status: string;
}

export interface AudioBaseLatencyInfo {
  audioBaseLatency: number | string;
}

// Browser
export interface BrowserGroupInfo {
  browserName: string;
  osName: string;
  userAgent: string;
  vendor: string;
  vendorFlavors: string[];
  plugins: Array<{
    name: string;
    description: string;
    filename: string;
  }>;
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

export interface PluginsInfo {
  plugins: Array<{
    name: string;
    description: string;
    filename: string;
  }>;
}

export interface PdfViewerEnabledInfo {
  pdfViewerEnabled: boolean;
}

// Preferences
export interface PreferencesGroupInfo {
  languages: string[];
  timezone: string;
  touchSupport: boolean;
  cookiesEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  openDatabase: boolean;
  indexedDB: boolean;
}
export interface LanguagesInfo {
  languages: string[];
}

export interface TimezoneInfo {
  timezone: string;
}

export interface TouchSupportInfo {
  touchSupport: boolean;
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
