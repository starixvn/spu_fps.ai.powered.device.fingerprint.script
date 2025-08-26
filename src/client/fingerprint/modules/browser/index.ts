import { collectBrowserName } from "./browser_name";
import { collectOSName } from "./os_name";
import { collectUserAgent } from "./user_agent";
import { collectVendor } from "./vendor";
import { collectVendorFlavors } from "./vendor_flavors";
import { collectPlugins } from "./plugins";
import { collectPdfViewerEnabled } from "./pdf_viewer_enabled";
import type { ClientHints, BrowserGroupResult } from "../../types";

export type { UserAgentResult } from "./user_agent";
export type { PdfViewerEnabledResult } from "./pdf_viewer_enabled";
export {
  collectBrowserName,
  collectOSName,
  collectUserAgent,
  collectVendor,
  collectVendorFlavors,
  collectPlugins,
  collectPdfViewerEnabled,
};

export class BrowserFingerprint {
  public static collect(): BrowserGroupResult {
    try {
      console.log("Starting browser fingerprint collection...");

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
        clientHints: userAgentResult.clientHints,
      };

      console.log("Browser fingerprint collected:", browserGroup);
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
  clientHints?: ClientHints;
} {
  try {
    const userAgent = navigator.userAgent || "";
    let clientHints: ClientHints | undefined;

    if (navigator.userAgentData) {
      clientHints = {
        brands: navigator.userAgentData.brands || [],
        mobile: navigator.userAgentData.mobile || false,
      };
    }

    return { userAgent, clientHints };
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
