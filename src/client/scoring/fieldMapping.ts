export const GROUP_FIELD_MAPPING = {
  browser: 'br',
  hardware: 'hw',
  graphics: 'gp',
  preference: 'pf',
} as const;

export const BROWSER_FIELD_MAPPING = {
  userAgent: 'uag',
  appVersion: 'avr',
  productSub: 'prs',
  plugins: 'plg',
  webdriver: 'wdr',
} as const;

export const HARDWARE_FIELD_MAPPING = {
  platform: 'plf',
} as const;

export const GRAPHICS_FIELD_MAPPING = {
  viewport: 'vpt',
  screen: 'scn',
  devicePixelRatio: 'dpr',
  render: 'rdr',
} as const;

export const PREFERENCE_FIELD_MAPPING = {
  languageLength: 'lng',
  timezone: 'tze',
  maxTouchPoints: 'mtp',
} as const;

export type BrowserFieldKey = keyof typeof BROWSER_FIELD_MAPPING;
export type HardwareFieldKey = keyof typeof HARDWARE_FIELD_MAPPING;
export type GraphicsFieldKey = keyof typeof GRAPHICS_FIELD_MAPPING;
export type PreferenceFieldKey = keyof typeof PREFERENCE_FIELD_MAPPING;


export function mapBrowserGroupToShortCodes<T extends Record<string, any>>(
  browserGroup: T
): Record<string, any> {
  const mapped: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(browserGroup)) {
    const shortCode = BROWSER_FIELD_MAPPING[key as BrowserFieldKey];
    if (shortCode) {
      mapped[shortCode] = value;
    } else {
      mapped[key] = value;
    }
  }
  
  return mapped;
}

export function mapHardwareGroupToShortCodes<T extends Record<string, any>>(
  hardwareGroup: T
): Record<string, any> {
  const mapped: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(hardwareGroup)) {
    const shortCode = HARDWARE_FIELD_MAPPING[key as HardwareFieldKey];
    if (shortCode) {
      mapped[shortCode] = value;
    } else {
      mapped[key] = value;
    }
  }
  
  return mapped;
}

export function mapGraphicsGroupToShortCodes<T extends Record<string, any>>(
  graphicsGroup: T
): Record<string, any> {
  const mapped: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(graphicsGroup)) {
    const shortCode = GRAPHICS_FIELD_MAPPING[key as GraphicsFieldKey];
    if (shortCode) {
      mapped[shortCode] = value;
    } else {
      mapped[key] = value;
    }
  }
  
  return mapped;
}

export function mapPreferenceGroupToShortCodes<T extends Record<string, any>>(
  preferenceGroup: T
): Record<string, any> {
  const mapped: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(preferenceGroup)) {
    const shortCode = PREFERENCE_FIELD_MAPPING[key as PreferenceFieldKey];
    if (shortCode) {
      mapped[shortCode] = value;
    } else {
      mapped[key] = value;
    }
  }
  
  return mapped;
}

