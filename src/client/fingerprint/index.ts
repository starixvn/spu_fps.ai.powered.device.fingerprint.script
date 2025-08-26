/// <reference lib="dom" />

import { FingerprintData } from "./types";
import { HardwareFingerprint } from "./modules/hardware/index";
import { GraphicsFingerprint } from "./modules/graphics/index";
import { AudioFingerprint } from "./modules/audio/index";
import { PreferencesFingerprint } from "./modules/preference/index";

import { collectBrowserName } from "./modules/browser/browser_name";
import { collectOSName } from "./modules/browser/os_name";
import { collectVendor } from "./modules/browser/vendor";
import { collectVendorFlavors } from "./modules/browser/vendor_flavors";
import { collectPlugins } from "./modules/browser/plugins";
import { collectPdfViewerEnabled } from "./modules/browser/pdf_viewer_enabled";

class FPSFingerprintClass {
  public readonly version: string = "1.9.0";

  public async collect(
    callback?: (fingerprint: FingerprintData) => void
  ): Promise<FingerprintData> {
    const browser = await this.collectBrowserData();
    const graphics = await GraphicsFingerprint.collect();
    const audio = await AudioFingerprint.collect();
    const hardware = await HardwareFingerprint.collect();
    const preferences = await PreferencesFingerprint.collect();

    const fingerprint: FingerprintData = {
      BrowserFingerprint: browser,
      GraphicsFingerprint: graphics,
      AudioFingerprint: audio,
      HardwareFingerprint: hardware,
      PreferencesFingerprint: preferences,
      timestamp: new Date().toISOString(),
    };

    if (callback && typeof callback === "function") {
      callback(fingerprint);
    }

    return fingerprint;
  }

  private async collectBrowserData() {
    try {
      console.log("Starting browser fingerprint collection...");

      const browserNameResult = collectBrowserName();
      const osNameResult = collectOSName();
      const userAgentResult = this.collectUserAgentSync();
      const vendorResult = collectVendor();
      const vendorFlavorsResult = collectVendorFlavors();
      const pluginsResult = collectPlugins();
      const pdfViewerResult = await collectPdfViewerEnabled();

      const browserGroup = {
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

  /**
   * Collect user agent data synchronously
   */
  private collectUserAgentSync(): {
    userAgent: string;
    clientHints?: any;
  } {
    try {
      const userAgent = navigator.userAgent || "";
      let clientHints: any;

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

  /**
   * Collect PDF viewer status synchronously
   */
  private collectPdfViewerEnabledSync(): { pdfViewerEnabled: boolean } {
    try {
      const pdfViewerEnabled = (navigator as any).pdfViewerEnabled ?? false;
      return { pdfViewerEnabled };
    } catch (error) {
      console.error("Error collecting PDF viewer status:", error);
      return { pdfViewerEnabled: false };
    }
  }

  /**
   * Generate hash from fingerprint data
   */
  public async generateHash(fingerprint?: FingerprintData): Promise<string> {
    const data = fingerprint || (await this.collect());

    // Create a string representation of key fingerprint attributes
    const hashString = [
      data.BrowserFingerprint?.userAgent || "",
      data.BrowserFingerprint?.osName || "",
      data.BrowserFingerprint?.browserName || "",
      data.GraphicsFingerprint?.screenResolution?.width || "",
      data.GraphicsFingerprint?.screenResolution?.height || "",
      data.GraphicsFingerprint?.colorDepth?.colorDepth || "",
      data.HardwareFingerprint?.hardwareConcurrency || "",
      data.HardwareFingerprint?.deviceMemory || "",
      data.PreferencesFingerprint?.timezone || "",
      data.PreferencesFingerprint?.languages?.join(",") || "",
    ].join("|");

    // Simple hash function (djb2)
    let hash = 5381;
    for (let i = 0; i < hashString.length; i++) {
      hash = (hash << 5) + hash + hashString.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16).padStart(8, "0");
  }

  /**
   * Generate hashes for each fingerprint group
   */
  public async generateGroupHashes(fingerprint?: FingerprintData): Promise<{
    hardware: string;
    graphics: string;
    audio: string;
    browser: string;
    preferences: string;
    combined: string;
  }> {
    const data = fingerprint || (await this.collect());

    // Hardware hash
    const hardwareString = [
      data.HardwareFingerprint?.hardwareConcurrency || "",
      data.HardwareFingerprint?.deviceMemory || "",
      data.HardwareFingerprint?.platform || "",
      data.HardwareFingerprint?.architecture || "",
    ].join("|");

    // Graphics hash
    const graphicsString = [
      data.GraphicsFingerprint?.screenResolution?.width || "",
      data.GraphicsFingerprint?.screenResolution?.height || "",
      data.GraphicsFingerprint?.colorDepth?.colorDepth || "",
      data.GraphicsFingerprint?.canvas?.fingerprint || "",
    ].join("|");

    // Audio hash
    const audioString = [
      data.AudioFingerprint?.audio || "",
      data.AudioFingerprint?.audioBaseLatency || "",
    ].join("|");

    // Browser hash
    const browserString = [
      data.BrowserFingerprint?.userAgent || "",
      data.BrowserFingerprint?.browserName || "",
      data.BrowserFingerprint?.osName || "",
      data.BrowserFingerprint?.vendor || "",
      data.BrowserFingerprint?.plugins?.length || "",
    ].join("|");

    // Preferences hash
    const preferencesString = [
      data.PreferencesFingerprint?.languages?.join(",") || "",
      data.PreferencesFingerprint?.timezone || "",
      data.PreferencesFingerprint?.cookiesEnabled || "",
    ].join("|");

    // Combined hash (all groups)
    const combinedString = [
      hardwareString,
      graphicsString,
      audioString,
      browserString,
      preferencesString,
    ].join("||");

    return {
      hardware: this.hashString(hardwareString),
      graphics: this.hashString(graphicsString),
      audio: this.hashString(audioString),
      browser: this.hashString(browserString),
      preferences: this.hashString(preferencesString),
      combined: this.hashString(combinedString),
    };
  }

  /**
   * Internal hash function (DJB2)
   */
  private hashString(input: string): string {
    let hash = 5381;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) + hash + input.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }

  /**
   * Send fingerprint to server
   */
  public sendToServer(
    endpoint: string = "/api/fingerprint",
    fingerprint?: FingerprintData,
    callback?: (error: Error | null, response?: any) => void
  ): void {
    const data = {
      fingerprint: fingerprint || this.collect(),
      timestamp: new Date().toISOString(),
    };

    if (typeof fetch !== "undefined") {
      // Modern browsers
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((result) => {
          if (callback && typeof callback === "function") {
            callback(null, result);
          }
        })
        .catch((error) => {
          if (callback && typeof callback === "function") {
            callback(error, null);
          }
        });
    } else {
      // Fallback for older browsers
      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              if (callback && typeof callback === "function") {
                callback(null, result);
              }
            } catch (e) {
              if (callback && typeof callback === "function") {
                callback(e as Error, null);
              }
            }
          } else {
            if (callback && typeof callback === "function") {
              callback(new Error("HTTP " + xhr.status), null);
            }
          }
        }
      };

      xhr.send(JSON.stringify(data));
    }
  }
}

const fpsFingerprint = new FPSFingerprintClass();

if (typeof window !== "undefined") {
  window.FPSFingerprint = fpsFingerprint;

  if (window.FPSAutoCollect) {
    document.addEventListener("DOMContentLoaded", function () {
      fpsFingerprint.collect(function (fingerprint) {
        console.log("FPS Fingerprint collected:", fingerprint);
        if (
          window.FPSOnCollected &&
          typeof window.FPSOnCollected === "function"
        ) {
          window.FPSOnCollected(fingerprint);
        }
      });
    });
  }
}

// Export all modules for direct access
export { GraphicsFingerprint } from "./modules/graphics/index";
export { AudioFingerprint } from "./modules/audio/index";
export { HardwareFingerprint } from "./modules/hardware/index";
export { PreferencesFingerprint } from "./modules/preference/index";
export { FPSFingerprintClass };

export default fpsFingerprint;
