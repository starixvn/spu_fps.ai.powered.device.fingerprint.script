import { collectBrowserName } from "./browserName";
import { collectOSName } from "./osName";
import { collectVendor } from "./vendor";
import { collectVendorFlavors } from "./vendorFlavors";
import { collectPlugins } from "./plugins";
import type { BrowserGroupInfo } from "../../types";

export class BrowserFingerprint {
  public static collect(): BrowserGroupInfo {
    try {
      const browserNameResult = collectBrowserName();
      const osNameResult = collectOSName();
      const userAgentResult = collectUserAgentSync();
      const vendorResult = collectVendor();
      const vendorFlavorsResult = collectVendorFlavors();
      const pluginsResult = collectPlugins();
      const pdfViewerResult = collectPdfViewerEnabledSync();

      const browserGroup: BrowserGroupInfo = {
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
    return { pdfViewerEnabled: false };
  }
}
