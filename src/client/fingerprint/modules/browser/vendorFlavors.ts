import type { VendorFlavorsInfo } from '../../types';
import { FingerprintSpecialValue } from '../../utils/consts';

export function collectVendorFlavors(): VendorFlavorsInfo {
  try {
    const flavors: string[] = [];

    const browserGlobals = [
      'chrome', // Chrome, Edge, Opera, Brave (Blink-based)
      'safari', // Safari on macOS
      '__crWeb', // Chrome on iOS
      '__gCrWeb', // Chrome on iOS (alternative)
      'yandex', // Yandex Browser (multi-platform)
      '__yb', // Yandex Browser on iOS
      '__ybro', // Yandex Browser on iOS (alternative)
      '__firefox__', // Firefox on iOS
      '__edgeTrackingPreventionStatistics', // Edge on iOS
      'webkit', // WebKit-based browsers
      'oprt', // Opera Touch on iOS
      'samsungAr', // Samsung Internet on Android
      'ucweb', // UC Browser on Android
      'UCShellJava', // UC Browser on Android (alternative)
      'puffinDevice', // Puffin on Android
    ];

    for (const key of browserGlobals) {
      const value = (window as any)[key];
      if (value && typeof value === 'object') {
        flavors.push(key);
      }
    }

    return flavors.sort();
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}
