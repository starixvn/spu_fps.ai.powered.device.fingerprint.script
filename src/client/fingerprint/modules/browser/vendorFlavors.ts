import type { VendorFlavorsInfo } from "../../types";

export function collectVendorFlavors(): VendorFlavorsInfo {
  try {
    const vendorFlavors = getVendorFlavors();
    return { vendorFlavors };
  } catch (error) {
    return { vendorFlavors: [] };
  }
}

function getVendorFlavors(): string[] {
  const flavors: string[] = [];

  const browserGlobals = [
    'chrome',           // Chrome, Edge, Opera, Brave (Blink-based)
    'safari',           // Safari on macOS
    '__crWeb',          // Chrome on iOS
    '__gCrWeb',         // Chrome on iOS (alternative)
    'yandex',           // Yandex Browser (multi-platform)
    '__yb',             // Yandex Browser on iOS
    '__ybro',           // Yandex Browser on iOS (alternative)  
    '__firefox__',      // Firefox on iOS
    '__edgeTrackingPreventionStatistics', // Edge on iOS
    'webkit',           // WebKit-based browsers
    'oprt',             // Opera Touch on iOS
    'samsungAr',        // Samsung Internet on Android
    'ucweb',            // UC Browser on Android
    'UCShellJava',      // UC Browser on Android (alternative)
    'puffinDevice'      // Puffin on Android
  ];

  for (const key of browserGlobals) {
    const value = (window as any)[key];

    if (value && typeof value === 'object') {
      flavors.push(key);
    }
  }

  if (flavors.length === 0) {
    try {
      // Chrome-family detection
      if ((window as any).chrome?.runtime) {
        flavors.push('chrome');
      }
      
      // Safari-specific features
      if ((window as any).safari?.pushNotification) {
        flavors.push('safari');
      }
      
      // Firefox detection
      if (typeof (window as any).InstallTrigger !== 'undefined') {
        flavors.push('firefox');
      }
      
      // Legacy Edge detection  
      if ((window as any).StyleMedia || (navigator as any).msLaunchUri) {
        flavors.push('edge');
      }
    } catch {}
  }

  if (flavors.length === 0) {
    try {
      if (CSS.supports && CSS.supports('-webkit-appearance', 'none')) {
        if (CSS.supports('-webkit-transform-style', 'preserve-3d')) {
          flavors.push('blink');
        } else {
          flavors.push('webkit');
        }
      }
    } catch {}
  }

  return flavors.length > 0 ? flavors.sort() : []; 
}
