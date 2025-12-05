import { ScoringConstants } from './config';
import type { BrowserGroupInfo } from './modules/browser';
import type { HardwareGroupInfo } from './modules/hardware';
import type { GraphicsGroupInfo } from './modules/graphics';
import type { PreferenceGroupInfo } from './modules/preference';
import { GROUP_FIELD_MAPPING } from './fieldMapping';

export interface ScoringGroupInfo {
  [GROUP_FIELD_MAPPING.browser]: BrowserGroupInfo;
  [GROUP_FIELD_MAPPING.hardware]: HardwareGroupInfo;
  [GROUP_FIELD_MAPPING.graphics]: GraphicsGroupInfo;
  [GROUP_FIELD_MAPPING.preference]: PreferenceGroupInfo;
}

export type SessionKeyInfo = string;

export type LanguagesInfo = number | ScoringConstants; // length only

export type UserAgentInfo = string | ScoringConstants;

export type AppVersionInfo = string | ScoringConstants;

export type PlatformInfo = string | ScoringConstants;

export type RenderInfo = string | ScoringConstants; // UNMASKED_RENDERER_WEBGL only
export type WebGLInfo = string | ScoringConstants; // UNMASKED_RENDERER_WEBGL only (alias for RenderInfo)

export type ViewportInfo = [number, number] | ScoringConstants; // [width, height]

export type PluginsInfo = number | ScoringConstants; // length only

export type ScreenInfo = [number, number] | ScoringConstants; // [width, height]

export type DevicePixelRatioInfo = number | ScoringConstants;

export type ProductSubInfo = string | ScoringConstants;

export type WebdriverInfo = number | ScoringConstants;

export type TimezoneInfo = string | ScoringConstants;

export type MaxTouchPointsInfo = number | ScoringConstants;

