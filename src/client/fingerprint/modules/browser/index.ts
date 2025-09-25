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
    const browserNameResult = collectBrowserName();
    const osNameResult = collectOSName();
    const userAgentResult = await collectUserAgent();
    const vendorResult = collectVendor();
    const vendorFlavorsResult = collectVendorFlavors();
    const pluginsResult = collectPlugins();
    const pdfViewerResult = collectPdfViewerEnabled();

    const browserGroup: BrowserGroupInfo = {
      browserName: browserNameResult.browserName,
      osName: osNameResult.osName,
      userAgent: userAgentResult,
      vendor: vendorResult.vendor,
      vendorFlavors: vendorFlavorsResult.vendorFlavors,
      plugins: pluginsResult,
      pdfViewerEnabled: pdfViewerResult,
    };

    return browserGroup;
  }
}

