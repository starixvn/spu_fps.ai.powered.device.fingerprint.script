import { ScoringSpecialValue } from './consts';

export interface ScoringGroupInfo {
  languages: LanguagesInfo;
  userAgent: UserAgentInfo;
  appVersion: AppVersionInfo;
  platform: PlatformInfo;
  webgl: WebGLInfo;
  viewport: ViewportInfo;
  plugins: PluginsInfo;
  screen: ScreenInfo;
  devicePixelRatio: DevicePixelRatioInfo;
  productSub: ProductSubInfo;
  webdriver: WebdriverInfo;
  timezone: TimezoneInfo;
  touchPoints: TouchPointsInfo;
}

export type SessionKeyInfo = string;

export type LanguagesInfo = number | ScoringSpecialValue; // length only

export type UserAgentInfo = string | ScoringSpecialValue;

export type AppVersionInfo = string | ScoringSpecialValue;

export type PlatformInfo = string | ScoringSpecialValue;

export type WebGLInfo = [
  string | ScoringSpecialValue, // VENDOR
  string | ScoringSpecialValue, // RENDERER
  string | ScoringSpecialValue, // SHADING_LANGUAGE_VERSION
  string | ScoringSpecialValue  // UNMASKED_RENDERER_WEBGL
];

export type ViewportInfo = [number, number] | ScoringSpecialValue; // [width, height]

export type PluginsInfo = number | ScoringSpecialValue; // length only

export type ScreenInfo = [number, number] | ScoringSpecialValue; // [width, height]

export type DevicePixelRatioInfo = number | ScoringSpecialValue;

export type ProductSubInfo = string | ScoringSpecialValue;

export type WebdriverInfo = boolean | ScoringSpecialValue;

export type TimezoneInfo = string | ScoringSpecialValue;

export type TouchPointsInfo = number | ScoringSpecialValue;

