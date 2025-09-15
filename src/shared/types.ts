/**
 * Local types for fingerprint modules
 */
export interface FingerprintData {
  HardwareFingerprint: HardwareGroupResult;
  GraphicsFingerprint: GraphicsGroupResult;
  AudioFingerprint: AudioGroupResult;
  BrowserFingerprint: BrowserGroupResult;
  PreferencesFingerprint: PreferencesGroupResult;
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

export interface BrandsEntry {
  brand: string;
  version: string;
}

export interface BrowserGroupResult {
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

export interface GraphicsGroupResult {
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
  contextAttributes: string[];
  parameters: string[];
  shaderPrecisions: string[];
  extensions: string[] | null;
  extensionParameters: string[];
  unsupportedExtensions: string[];
}

export type FontsInfo = string[];

export interface FontPreferencesInfo {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  fontVariant: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: string;
  textDecoration: string;
  textTransform: string;
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

export interface AudioGroupResult {
  audio: string | null;
  audioBaseLatency: number | string;
}

export interface HardwareGroupResult {
  plf: string;
  arc: number;
  osc: string;
  ccl: string;
  hwc: number | string;
  dvm: number | string;
}

export interface PreferencesGroupResult {
  languages: string[];
  timezone: string;
  touchSupport: boolean;
  cookiesEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  openDatabase: boolean;
  indexedDB: boolean;
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
