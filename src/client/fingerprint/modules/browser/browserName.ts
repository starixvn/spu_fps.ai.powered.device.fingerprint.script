import type { BrowserNameInfo } from "../../types";

export function collectBrowserName(): BrowserNameInfo {
  const browserName = getBrowserName();
  return { browserName };
}

type Detector = { name: string; test: () => boolean };

const mobileDetectors: Detector[] = [
  { name: "Mi Browser",       test: () => (window as any).miui || (navigator as any).miui || (window as any).MiWebView },
  { name: "Samsung Browser",  test: () =>
      (window as any).SamsungBrowser ||
      (navigator as any).userAgentData?.brands?.some((b: any) =>
        b.brand.toLowerCase().includes("samsung")) },
  { name: "UC Browser",       test: () => (window as any).ucweb || (window as any).UCShellJava || (navigator as any).ucweb },
  { name: "Xiaomi Browser",   test: () => (window as any).xiaomi || (navigator as any).xiaomi },
  { name: "Huawei Browser",   test: () => (window as any).huawei || (navigator as any).huawei || (window as any).HuaweiBrowser },
  { name: "OPPO Browser",     test: () => (window as any).oppo   || (navigator as any).oppo   || (window as any).OppoBrowser },
  { name: "Vivo Browser",     test: () => (window as any).vivo   || (navigator as any).vivo   || (window as any).VivoBrowser },
  { name: "QQ Browser",       test: () => (window as any).qq     || (navigator as any).qq     || (window as any).QQBrowser },
  { name: "360 Browser",      test: () => (window as any).so     || (window as any).browser360|| (navigator as any).so },
  { name: "Sogou Browser",    test: () => (window as any).sogou  || (navigator as any).sogou  || (window as any).SogouBrowser },
  { name: "Baidu Browser",    test: () => (window as any).baidu  || (navigator as any).baidu  || (window as any).BaiduBrowser },
];

const featureDetectors: Detector[] = [
  { name: "Brave",        test: () => (navigator as any).brave && typeof (navigator as any).brave.isBrave === "function" },
  { name: "Opera",        test: () => (window as any).opr || (window as any).opera },
  { name: "Chrome",       test: () => (window as any).chrome && !(window as any).opr && !(navigator as any).brave },
  { name: "Firefox",      test: () => typeof (window as any).InstallTrigger !== "undefined" },
  { name: "Safari",       test: () => (window as any).safari && (window as any).safari.pushNotification },
  { name: "Edge (Legacy)",test: () => (window as any).StyleMedia || (navigator as any).msLaunchUri },
];

const cssDetectors: Detector[] = [
  { name: "Firefox",        test: () => "MozAppearance" in document.createElement("div").style },
  { name: "Edge (Legacy)",  test: () => "msScrollLimit" in document.createElement("div").style ||
                                       "msImeAlign"   in document.createElement("div").style },
  { name: "Safari/WebKit",  test: () => "WebkitAppearance" in document.createElement("div").style &&
                                       !(window as any).chrome },
];

export function getBrowserName(): string {
  try {
    // Mobile browsers 
    const mobile = findMatch(mobileDetectors);
    if (mobile) return mobile;

    // UA-CH brands (Chromium)
    const brands = (navigator as any).userAgentData?.brands || [];
    const fromBrands = parseFromBrands(brands);
    if (fromBrands) return fromBrands;

    // Features
    const feat = findMatch(featureDetectors);
    if (feat) return feat;

    // CSS fallback
    const css = findMatch(cssDetectors);
    if (css) {
      if (css === "Safari/WebKit") return "Safari";
      return css;
    }

    return "";
  } catch {
    return "";
  }
}

function findMatch(list: Detector[]): string {
  for (const d of list) {
    try { 
      if (d.test()) return d.name; 
    } catch {  }
  }

  return "";
}

function parseFromBrands(
  brands: ReadonlyArray<{ brand: string; version: string }>
): string {
  const names = brands.map(b => b.brand.toLowerCase());

  if (names.some(n => n.includes("brave"))) return "Brave";
  if (names.some(n => n.includes("edge")))  return "Edge";
  if (names.some(n => n.includes("opera") || n.includes("opr"))) return "Opera";
  if (names.some(n => n.includes("samsung"))) return "Samsung Browser";
  if (names.some(n => n.includes("miui")))    return "Mi Browser";
  if (names.some(n => n.includes("huawei")))  return "Huawei Browser";
  if (names.some(n => n.includes("oppo")))    return "OPPO Browser";
  if (names.some(n => n.includes("vivo")))    return "Vivo Browser";
  if (names.some(n => n.includes("chrome")))  return isMobileDevice() ? "Mobile Chrome" : "Chrome";
  if (names.some(n => n.includes("chromium")))return "Chromium";

  return "";
}

function isMobileDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 768 ||
    /Mobi|Android/i.test(navigator.userAgent)
  );
}
