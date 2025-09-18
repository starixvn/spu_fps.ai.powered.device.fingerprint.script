import { collectBrowserName } from "./browserName";
import { collectOSName } from "./osName";
import { collectUserAgent } from "./userAgent";
import { collectVendor } from "./vendor";
import { collectVendorFlavors } from "./vendorFlavors";
import { collectPlugins } from "./plugins";
import { collectPdfViewerEnabled } from "./pdfViewerEnabled";
import type { BrowserGroupInfo } from "../../types";

export class BrowserFingerprint {
  public static async collect(): Promise<BrowserGroupInfo> {
    try {
      const browserNameResult = collectBrowserName();
      const osNameResult = collectOSName();
      const userAgentResult = await collectUserAgent();
      const vendorResult = collectVendor();
      const vendorFlavorsResult = collectVendorFlavors();
      const pluginsResult = collectPlugins();
      const pdfViewerResult = await collectPdfViewerEnabled();

      const browserGroup: BrowserGroupInfo = {
        browserName: browserNameResult.browserName,
        osName: osNameResult.osName,
        userAgent: userAgentResult.userAgent,
        vendor: vendorResult.vendor,
        vendorFlavors: vendorFlavorsResult.vendorFlavors,
        plugins: pluginsResult,
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
        pdfViewerEnabled: 0,
      };
    }
  }
}

