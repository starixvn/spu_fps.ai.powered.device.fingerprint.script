import { collectBrowserName } from "./browser_name";
import { collectOSName } from "./os_name";
import { collectVendor } from "./vendor";
import { collectVendorFlavors } from "./vendor_flavors";
import { collectPlugins } from "./plugins";
import type { BrowserGroupResult } from "../../types";

export class BrowserFingerprint {
  public static collect(): BrowserGroupResult {
    try {
      const browserNameResult = collectBrowserName();
      const osNameResult = collectOSName();
      const userAgentResult = collectUserAgentSync();
      const vendorResult = collectVendor();
      const vendorFlavorsResult = collectVendorFlavors();
      const pluginsResult = collectPlugins();
      const pdfViewerResult = collectPdfViewerEnabledSync();

      const browserGroup: BrowserGroupResult = {
        browserName: browserNameResult.browserName,
        osName: osNameResult.osName,
        userAgent: userAgentResult.userAgent,
        vendor: vendorResult.vendor,
        vendorFlavors: vendorFlavorsResult.vendorFlavors,
        plugins: pluginsResult.plugins,
        pdfViewerEnabled: pdfViewerResult.pdfViewerEnabled,
      };

      return browserGroup;
    } catch (error) {
      console.error("Error collecting browser fingerprint:", error);

      return {
        browserName: "",
        osName: "",
        userAgent: "",
        vendor: "",
        vendorFlavors: [],
        plugins: [],
        pdfViewerEnabled: false,
      };
    }
  }
}

function collectUserAgentSync(): {
  userAgent: string;
} {
  try {
    const userAgent = navigator.userAgent || "";
    return { userAgent };
  } catch {
    return { userAgent: "" };
  }
}

function collectPdfViewerEnabledSync(): { pdfViewerEnabled: boolean } {
  try {
    const pdfViewerEnabled = navigator.pdfViewerEnabled ?? false;
    return { pdfViewerEnabled };
  } catch (error) {
    console.error("Error collecting PDF viewer status:", error);
    return { pdfViewerEnabled: false };
  }
}
