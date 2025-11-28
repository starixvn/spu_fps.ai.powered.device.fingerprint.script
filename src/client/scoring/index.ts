import { collectLanguages } from './collectors/languages';
import { collectUserAgent } from './collectors/userAgent';
import { collectAppVersion } from './collectors/appVersion';
import { collectPlatform } from './collectors/platform';
import { collectWebGL } from './collectors/webgl';
import { collectViewport } from './collectors/viewport';
import { collectPlugins } from './collectors/plugins';
import { collectScreen } from './collectors/screen';
import { collectDevicePixelRatio } from './collectors/devicePixelRatio';
import { collectProductSub } from './collectors/productSub';
import { collectWebdriver } from './collectors/webdriver';
import { collectTimezone } from './collectors/timezone';
import { collectTouchPoints } from './collectors/touchPoints';
import { ScoringSessionKeyManager } from './sessionKey';
import { Base64Encoder } from './utils/base64Encoder';
import { SCORING_CONFIG } from './config';
import type { ScoringGroupInfo } from './types';
import { DOMUtils } from '../utils/dom';

class ScoringCollector {
  private collect(): ScoringGroupInfo {
    const languagesResult = collectLanguages();
    const userAgentResult = collectUserAgent();
    const appVersionResult = collectAppVersion();
    const platformResult = collectPlatform();
    const webglResult = collectWebGL();
    const viewportResult = collectViewport();
    const pluginsResult = collectPlugins();
    const screenResult = collectScreen();
    const devicePixelRatioResult = collectDevicePixelRatio();
    const productSubResult = collectProductSub();
    const webdriverResult = collectWebdriver();
    const timezoneResult = collectTimezone();
    const touchPointsResult = collectTouchPoints();

    const scoringGroup: ScoringGroupInfo = {
      languages: languagesResult,
      userAgent: userAgentResult,
      appVersion: appVersionResult,
      platform: platformResult,
      webgl: webglResult,
      viewport: viewportResult,
      plugins: pluginsResult,
      screen: screenResult,
      devicePixelRatio: devicePixelRatioResult,
      productSub: productSubResult,
      webdriver: webdriverResult,
      timezone: timezoneResult,
      touchPoints: touchPointsResult,
    };

    return scoringGroup;
  }

  private getScoringServerUrl(): string {
    const searchPattern = "nsc.";
    const replacePattern = "sc.";
    const placeholder = "__GatewayDomain__";
    const serverDomain = SCORING_CONFIG.serverDomain;
    let updatedDomainName = serverDomain.replace(searchPattern, replacePattern);
    return updatedDomainName.replace(placeholder, updatedDomainName);
  }

  private async sendToServer(
    endpoint: string,
    payload: any
  ): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('request', payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        keepalive: true
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  public async start(): Promise<void> {
    try {
      const scoringGroup = this.collect();
      const sessionKey = ScoringSessionKeyManager.getSessionKey();
      
      DOMUtils.injectValueIntoHiddenField("__sk", sessionKey);

      if (typeof window !== 'undefined') {
        (window as any).scoringGroup = scoringGroup;
        (window as any).scoringSessionKey = sessionKey;
      }

      const jsonPayload = JSON.stringify({ sessionKey, scoringGroup });
      const encodedPayload = Base64Encoder.encodeBase64(jsonPayload, SCORING_CONFIG.encodingKey);
      const apiEndpoint = this.getScoringServerUrl() + SCORING_CONFIG.endpoints.scoring;

      await this.sendToServer(apiEndpoint, encodedPayload);
    } catch (error) {
      // console.error('Failed to start scoring:', error);
    }
  }
}

const scoringCollector = new ScoringCollector();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
      scoringCollector.start();
  });
} else {
  scoringCollector.start();
}
