import type { BrowserNameInfo } from '../../types';
import { FingerprintSpecialValue } from '../../utils/consts';
import { isBrave, isFirefox, isGecko } from '../../utils/browser';

export function collectBrowserName(): BrowserNameInfo {
  try {
    // Mobile browsers (kiểm tra trước vì có thể override)
    const mobile = findMatch(mobileDetectors);
    if (mobile) return mobile;

    // UA-CH brands (Chromium) - method chính xác nhất
    const brands = (navigator as any).userAgentData?.brands || [];
    const fromBrands = parseFromBrands(brands);
    if (fromBrands) return fromBrands;

    // Features detection (fallback)
    const feat = findMatch(featureDetectors);
    if (feat) return feat;

    // CSS fallback (last resort)
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
    test: () =>
      (window as any).miui ||
      (navigator as any).miui ||
      (window as any).MiWebView,
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
    test: () =>
      (window as any).ucweb ||
      (window as any).UCShellJava ||
      (navigator as any).ucweb,
  },
  {
    name: 'Xiaomi Browser',
    test: () => (window as any).xiaomi || (navigator as any).xiaomi,
  },
  {
    name: 'Huawei Browser',
    test: () =>
      (window as any).huawei ||
      (navigator as any).huawei ||
      (window as any).HuaweiBrowser,
  },
  {
    name: 'OPPO Browser',
    test: () =>
      (window as any).oppo ||
      (navigator as any).oppo ||
      (window as any).OppoBrowser,
  },
  {
    name: 'Vivo Browser',
    test: () =>
      (window as any).vivo ||
      (navigator as any).vivo ||
      (window as any).VivoBrowser,
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
    test: () =>
      (window as any).sogou ||
      (navigator as any).sogou ||
      (window as any).SogouBrowser,
  },
  {
    name: 'Baidu Browser',
    test: () =>
      (window as any).baidu ||
      (navigator as any).baidu ||
      (window as any).BaiduBrowser,
  },
];

const featureDetectors: Detector[] = [
  // Brave - sử dụng utility function
  {
    name: 'Brave',
    test: () => isBrave(),
  },
  // DuckDuckGo - check trước Chrome vì có thể có window.chrome
  {
    name: 'DuckDuckGo',
    test: () =>
      (navigator as any).duckduckgo ||
      ((window as any).chrome &&
        navigator.vendor?.includes('DuckDuckGo')),
  },
  // Edge Chromium - check trước Chrome
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
  // Opera - check trước Chrome
  { 
    name: 'Opera', 
    test: () => (window as any).opr || (window as any).opera 
  },
  // Yandex - thêm detection
  {
    name: 'Yandex Browser',
    test: () =>
      (window as any).yandex ||
      ((window as any).chrome && navigator.vendor?.includes('Yandex')),
  },
  // Vivaldi - thêm detection
  {
    name: 'Vivaldi',
    test: () =>
      (window as any).chrome &&
      navigator.vendor?.includes('Vivaldi') &&
      !(navigator as any).duckduckgo,
  },
  // Chrome - check sau các browser Chromium khác
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
  // Firefox - sử dụng utility function
  {
    name: 'Firefox',
    test: () => isFirefox(),
  },
  // Safari - cải thiện detection
  {
    name: 'Safari',
    test: () =>
      ((window as any).safari &&
        (window as any).safari.pushNotification) ||
      (!(window as any).chrome &&
        'WebkitAppearance' in document.createElement('div').style &&
        navigator.vendor?.includes('Apple')),
  },
  // Edge (Legacy) - giữ nguyên
  {
    name: 'Edge (Legacy)',
    test: () => (window as any).StyleMedia || (navigator as any).msLaunchUri,
  },
];

const cssDetectors: Detector[] = [
  // Firefox - sử dụng utility function
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

  // Thứ tự quan trọng: kiểm tra các browser đặc biệt trước Chrome
  if (names.some((n) => n.includes('brave'))) return 'Brave';
  if (names.some((n) => n.includes('duckduckgo'))) return 'DuckDuckGo';
  if (names.some((n) => n.includes('edge') && !n.includes('edgehtml'))) return 'Edge';
  if (names.some((n) => n.includes('opera') || n.includes('opr'))) return 'Opera';
  if (names.some((n) => n.includes('yandex'))) return 'Yandex Browser';
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
