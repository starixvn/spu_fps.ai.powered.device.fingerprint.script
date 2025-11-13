import type { BrowserNameInfo } from '../../types';
import { FingerprintSpecialValue } from '../../utils/consts';
import {
  isBaiduBrowser,
  isBrave,
  isDuckDuckGo,
  isFirefox,
  isGecko,
  isHuaweiBrowser,
  isMiBrowser,
  isOppoBrowser,
  isSogouBrowser,
  isUCBrowser,
  isVivaldi,
  isVivoBrowser,
  isXiaomiBrowser,
  isYandex,
} from '../../utils/browser';

export function collectBrowserName(): BrowserNameInfo {
  try {
    // Mobile browsers 
    const mobile = findMatch(mobileDetectors);
    if (mobile) return mobile;

    // UA-CH brands (Chromium)  
    const brands = (navigator as any).userAgentData?.brands || [];
    const fromBrands = parseFromBrands(brands);
    if (fromBrands) return fromBrands;

    // Features detection 
    const feat = findMatch(featureDetectors);
    if (feat) return feat;

    // CSS fallback
    const css = findMatch(cssDetectors);
    if (css) {
      if (css === "Safari/WebKit") return "Safari";
      return css;
    }

    return FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

type Detector = { name: string; test: () => boolean };

const mobileDetectors: Detector[] = [
  {
    name: 'Mi Browser',
    test: isMiBrowser,
  },
  {
    name: 'Samsung Browser',
    test: () =>
      (window as any).SamsungBrowser ||
      (navigator as any).userAgentData?.brands?.some((b: any) =>
        b.brand.toLowerCase().includes('samsung')
      ),
  },
  {
    name: 'UC Browser',
    test: isUCBrowser,
  },
  {
    name: 'Xiaomi Browser',
    test: isXiaomiBrowser,
  },
  {
    name: 'Huawei Browser',
    test: isHuaweiBrowser,
  },
  {
    name: 'OPPO Browser',
    test: isOppoBrowser,
  },
  {
    name: 'Vivo Browser',
    test: isVivoBrowser,
  },
  {
    name: 'QQ Browser',
    test: () => (window as any).qq || (navigator as any).qq || (window as any).QQBrowser,
  },
  {
    name: '360 Browser',
    test: () =>
      (window as any).so || (window as any).browser360 || (navigator as any).so,
  },
  {
    name: 'Sogou Browser',
    test: isSogouBrowser,
  },
  {
    name: 'Baidu Browser',
    test: isBaiduBrowser,
  },
];

const featureDetectors: Detector[] = [
  // Brave 
  {
    name: 'Brave',
    test: isBrave
  },
  // DuckDuckGo 
  {
    name: 'DuckDuckGo',
    test: isDuckDuckGo,
  },
  // Edge Chromium 
  {
    name: 'Edge',
    test: () =>
      (window as any).chrome &&
      (navigator as any).userAgentData?.brands?.some((b: any) =>
        b.brand.toLowerCase().includes('edge')
      ) &&
      !(window as any).opr &&
      !(navigator as any).brave &&
      !(navigator as any).duckduckgo,
  },
  // Opera 
  { 
    name: 'Opera', 
    test: () => (window as any).opr || (window as any).opera 
  },
  // Yandex 
  {
    name: 'Yandex Browser',
    test: isYandex,
  },
  // Vivaldi 
  {
    name: 'Vivaldi',
    test: isVivaldi,
  },
  // Chrome 
  {
    name: 'Chrome',
    test: () =>
      (window as any).chrome &&
      !(window as any).opr &&
      !(navigator as any).brave &&
      !(navigator as any).duckduckgo &&
      !navigator.vendor?.includes('Yandex') &&
      !navigator.vendor?.includes('Vivaldi') &&
      !(navigator as any).userAgentData?.brands?.some((b: any) =>
        b.brand.toLowerCase().includes('edge')
      ),
  },
  // Firefox 
  {
    name: 'Firefox',
    test: isFirefox,
  },
  // Safari 
  {
    name: 'Safari',
    test: () =>
      ((window as any).safari &&
        (window as any).safari.pushNotification) ||
      (!(window as any).chrome &&
        'WebkitAppearance' in document.createElement('div').style &&
        navigator.vendor?.includes('Apple')),
  },
  // Edge (Legacy) 
  {
    name: 'Edge (Legacy)',
    test: () => (window as any).StyleMedia || (navigator as any).msLaunchUri,
  },
];

const cssDetectors: Detector[] = [
  // Firefox 
  {
    name: 'Firefox',
    test: () => isGecko() === 1,
  },
  {
    name: 'Edge (Legacy)',
    test: () =>
      'msScrollLimit' in document.createElement('div').style ||
      'msImeAlign' in document.createElement('div').style,
  },
  {
    name: 'Safari/WebKit',
    test: () =>
      'WebkitAppearance' in document.createElement('div').style &&
      !(window as any).chrome,
  },
];

function findMatch(list: Detector[]): string | null {
  for (const d of list) {
    try {
      if (d.test()) return d.name;
    } catch {}
  }
  return null;
}

function parseFromBrands(
  brands: ReadonlyArray<{ brand: string; version: string }>
): string | null {
  if (!brands || brands.length === 0) return null;
  
  const names = brands.map((b) => b.brand.toLowerCase());

  if (names.some((n) => n.includes('brave'))) return 'Brave';
  if (names.some((n) => n.includes('duckduckgo'))) return 'DuckDuckGo';
  if (names.some((n) => n.includes('edge') && !n.includes('edgehtml'))) return 'Edge';
  if (names.some((n) => n.includes('opera') || n.includes('opr'))) return 'Opera';
  if (names.some((n) => n.includes('yabrowser') || n.includes('yowser'))) return 'Yandex Browser';
  if (names.some((n) => n.includes('vivaldi'))) return 'Vivaldi';
  if (names.some((n) => n.includes('samsung'))) return 'Samsung Browser';
  if (names.some((n) => n.includes('miui'))) return 'Mi Browser';
  if (names.some((n) => n.includes('huawei'))) return 'Huawei Browser';
  if (names.some((n) => n.includes('oppo'))) return 'OPPO Browser';
  if (names.some((n) => n.includes('vivo'))) return 'Vivo Browser';
  if (names.some((n) => n.includes('chrome'))) return 'Chrome';
  if (names.some((n) => n.includes('chromium'))) return 'Chromium';

  return null;
}
