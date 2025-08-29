export interface FingerprintData {
  HardwareFingerprint: HardwareGroupInfo;
  GraphicsFingerprint: GraphicsGroupInfo;
  AudioFingerprint: AudioGroupInfo;
  BrowserFingerprint: BrowserGroupInfo;
  PreferencesFingerprint: PreferencesGroupInfo;
  WebRTCFingerprint: WebRTCGroupInfo;
  timestamp: string;
}

// Hardware
export interface HardwareGroupInfo {
  platform: string;
  architecture: string;
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
  architecture: string;
}

export interface OSCpuInfo {
  oscpu: string;
}

// Graphics
export interface GraphicsGroupInfo {
  canvas: CanvasInfo;
  webglBasics: WebGLBasicsInfo;
  webglExtensions: WebGLExtensionsInfo;
  fonts: FontsInfo;
  fontPreferences: FontPreferencesInfo;
  screenResolution: ScreenResolutionInfo;
  screenFrame: ScreenFrameInfo;
  colorDepth: ColorDepthInfo;
  colorGamut: ColorGamutInfo;
}

export interface CanvasInfo {
  fingerprint: string;
  noiseType: "ok" | "blocked" | "spoofed" | "randomized";
  width: number;
  height: number;
  textRendering: string;
  textBaseline: string;
  font: string;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  lineCap: string;
  lineJoin: string;
  miterLimit: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowColor: string;
  globalAlpha: number;
  globalCompositeOperation: string;
}

export interface WebGLBasicsInfo {
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  unmaskedVendor?: string;
  unmaskedRenderer?: string;
  maxTextureSize: number;
  maxViewportDims: [number, number];
  maxRenderbufferSize: number;
  aliasedLineWidthRange: [number, number];
  aliasedPointSizeRange: [number, number];
  maxAnisotropy: number;
}

export interface WebGLExtensionsInfo {
  extensions: string[];
  supportedExtensions: string[];
  compressedTextureFormats: string[];
  maxDrawBuffers: number;
  maxColorAttachments: number;
  maxVertexAttribs: number;
  maxVertexUniformVectors: number;
  maxFragmentUniformVectors: number;
  maxVaryingVectors: number;
}

export interface FontsInfo {
  availableFonts: string[];
  fontList: string[];
  fontMetrics: Record<string, FontMetrics>;
  fontDetection: FontDetectionInfo;
  noiseType: "ok" | "blocked" | "spoofed" | "randomized";
  entropy: number;
}

export interface FontMetrics {
  width: number;
  height: number;
  baseline: number;
  ascent: number;
  descent: number;
}

export interface FontDetectionInfo {
  detectedFonts: string[];
  fallbackFonts: string[];
  systemFonts: string[];
}

export interface FontPreferencesInfo {
  default: number;
  apple: number;
  serif: number;
  sans: number;
  mono: number;
  min: number;
  system: number;
}

export interface ScreenResolutionInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  pixelRatio: number;
  devicePixelRatio: number;
  logicalPixelRatio: number;
}

export interface ScreenFrameInfo {
  frameWidth: number;
  frameHeight: number;
  frameDepth: number;
  frameColorDepth: number;
  framePixelDepth: number;
  orientation: string;
  orientationAngle: number;
}

export interface ColorDepthInfo {
  colorDepth: number;
  pixelDepth: number;
  bitsPerChannel: number;
  totalBits: number;
  hasAlpha: boolean;
  hasTransparency: boolean;
}

export interface ColorGamutInfo {
  colorGamut: string;
  supportedColorSpaces: string[];
  p3Support: boolean;
  rec2020Support: boolean;
  srgbSupport: boolean;
  displayP3Support: boolean;
}

// Audio
export interface AudioGroupInfo {
  audio: AudioInfo;
  audioBaseLatency: number | string;
}

export interface AudioInfo {
  audio: number | null;
  noiseType: "clean" | "block" | "spoof" | "randomize";
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

// IP (WebRTC)
export interface WebRTCGroupInfo {
  localIPs: string[];
  publicIPs: string[];
  relayIPs: string[];
  flags: {
    isSupported: boolean;
    isBlocked: boolean;
    hasNoise: boolean;
    relayOnly: boolean;
  };
  error: string | null;
  timestamp: string;
}

export interface CollectedDeviceInfo {
  sessionKey: string;
  f4Hashed?: string;
  f5Hashed?: string;
}

declare global {
  interface Window {
    FPSFingerprint: any;
    BrowserFingerprint: any;
    HardwareFingerprint: any;
    AudioFingerprint: any;
    PreferencesFingerprint: any;
    FPSAutoCollect?: boolean;
    FPSOnCollected?: (fingerprint: FingerprintData) => void;
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
