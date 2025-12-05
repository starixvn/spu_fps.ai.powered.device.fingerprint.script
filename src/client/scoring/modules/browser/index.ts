import { collectUserAgent } from './userAgent';
import { collectAppVersion } from './appVersion';
import { collectPlugins } from './plugins';
import { collectProductSub } from './productSub';
import { collectWebdriver } from './webdriver';

import type {
  UserAgentInfo,
  AppVersionInfo,
  PluginsInfo,
  ProductSubInfo,
  WebdriverInfo,
} from '../../types';

export interface BrowserGroupInfo {
  userAgent: UserAgentInfo;
  appVersion: AppVersionInfo;
  plugins: PluginsInfo;
  productSub: ProductSubInfo;
  webdriver: WebdriverInfo;
}

export class BrowserScoring {
  public static collect(): BrowserGroupInfo {
    const userAgentResult = collectUserAgent();
    const appVersionResult = collectAppVersion();
    const pluginsResult = collectPlugins();
    const productSubResult = collectProductSub();
    const webdriverResult = collectWebdriver();

    const browserGroup: BrowserGroupInfo = {
      userAgent: userAgentResult,
      appVersion: appVersionResult,
      plugins: pluginsResult,
      productSub: productSubResult,
      webdriver: webdriverResult,
    };

    return browserGroup;
  }
}
