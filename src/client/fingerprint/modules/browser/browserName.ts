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
  isOpera,
  isUCBrowser,
  isVivaldi,
  isVivoBrowser,
  isXiaomiBrowser,
  isYandex,
  isEdgeHTML,
  isEdgeLegacyByCSS,
  isChrome,
  isEdgeChromium,
  isSamsungBrowser,
  isQqFamily,
  isSafariOrWebKit
} from '../../utils/browser';

export enum BrowserName {
  MiBrowser = 'Mi Browser',
  SamsungBrowser = 'Samsung Browser',
  UcBrowser = 'UC Browser',
  XiaomiBrowser = 'Xiaomi Browser',
  HuaweiBrowser = 'Huawei Browser',
  OppoBrowser = 'OPPO Browser',
  VivoBrowser = 'Vivo Browser',
  QqFamily = 'QQ Family',
  BaiduBrowser = 'Baidu Browser',
  Brave = 'Brave',
  DuckDuckGo = 'DuckDuckGo',
  Edge = 'Edge',
  Opera = 'Opera',
  YandexBrowser = 'Yandex Browser',
  Vivaldi = 'Vivaldi',
  Chrome = 'Chrome',
  Firefox = 'Firefox',
  Safari = 'Safari',
  EdgeLegacy = 'Edge (Legacy)',
  Chromium = 'Chromium',
}

type Detector = { name: BrowserName; test: () => boolean };

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
    if (css) return css;

    return FingerprintSpecialValue.UNDEFINED;
  } catch {
    return FingerprintSpecialValue.ERROR;
  }
}

function findMatch(list: Detector[]): BrowserName | null {
  for (const d of list) {
    try {
      if (d.test()) return d.name;
    } catch {}
  }
  return null;
}

const mobileDetectors: Detector[] = [
  {
    name: BrowserName.MiBrowser,
    test: isMiBrowser,
  },
  {
    name: BrowserName.SamsungBrowser,
    test: isSamsungBrowser,
  },
  {
    name: BrowserName.UcBrowser,
    test: isUCBrowser,
  },
  {
    name: BrowserName.XiaomiBrowser,
    test: isXiaomiBrowser,
  },
  {
    name: BrowserName.HuaweiBrowser,
    test: isHuaweiBrowser,
  },
  {
    name: BrowserName.OppoBrowser,
    test: isOppoBrowser,
  },
  {
    name: BrowserName.VivoBrowser,
    test: isVivoBrowser,
  },
  {
    name: BrowserName.QqFamily,
    test: isQqFamily,
  },
  {
    name: BrowserName.BaiduBrowser,
    test: isBaiduBrowser,
  },
  {
    name: BrowserName.DuckDuckGo,
    test: isDuckDuckGo,
  },
];

const featureDetectors: Detector[] = [
  {
    name: BrowserName.Brave,
    test: isBrave,
  },
  {
    name: BrowserName.Edge,
    test: isEdgeChromium,
  },
  {
    name: BrowserName.Opera,
    test: isOpera,
  },
  {
    name: BrowserName.YandexBrowser,
    test: isYandex,
  },
  {
    name: BrowserName.Vivaldi,
    test: isVivaldi,
  },
  {
    name: BrowserName.Chrome,
    test: isChrome,
  },
  {
    name: BrowserName.Firefox,
    test: isFirefox,
  },
  {
    name: BrowserName.Safari,
    test: isSafariOrWebKit,
  },
  {
    name: BrowserName.EdgeLegacy,
    test: isEdgeHTML,
  },
];

const cssDetectors: Detector[] = [
  {
    name: BrowserName.Firefox,
    test: () => isGecko() === 1,
  },
  {
    name: BrowserName.EdgeLegacy,
    test: isEdgeLegacyByCSS,
  },
];

function parseFromBrands(
  brands: ReadonlyArray<{ brand: string; version: string }>
): BrowserName | null {
  if (!brands || brands.length === 0) return null;
  const names = brands.map((b) => b.brand.toLowerCase());

  if (names.some((n) => n.includes('brave'))) return BrowserName.Brave;
  if (names.some((n) => n.includes('duckduckgo'))) return BrowserName.DuckDuckGo;
  if (names.some((n) => n.includes('edge') && !n.includes('edgehtml'))) return BrowserName.Edge;
  if (names.some((n) => n.includes('opera') || n.includes('opr'))) return BrowserName.Opera;
  if (names.some((n) => n.includes('yabrowser') || n.includes('yowser') || n.includes('yandex'))) return BrowserName.YandexBrowser;
  if (names.some((n) => n.includes('vivaldi'))) return BrowserName.Vivaldi;
  if (names.some((n) => n.includes('samsung'))) return BrowserName.SamsungBrowser;
  if (names.some((n) => n.includes('miui'))) return BrowserName.MiBrowser;
  if (names.some((n) => n.includes('huawei'))) return BrowserName.HuaweiBrowser;
  if (names.some((n) => n.includes('oppo'))) return BrowserName.OppoBrowser;
  if (names.some((n) => n.includes('vivo'))) return BrowserName.VivoBrowser;
  if (names.some((n) => n.includes('chrome'))) return BrowserName.Chrome;
  if (names.some((n) => n.includes('chromium'))) return BrowserName.Chromium;

  return null;
}