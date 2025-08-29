import { collectLanguages } from "./languages";
import { collectTimezone } from "./timezone";
import { collectTouchSupport } from "./touchSupport";
import { collectSessionStorage } from "./sessionStorage";
import { collectOpenDatabase } from "./openDatabase";
import { collectLocalStorage } from "./localStorage";
import { collectIndexedDB } from "./indexedDb";
import { collectCookiesEnabled } from "./cookiesEnabled";
import type { PreferencesGroupInfo } from "../../types";

export class PreferencesFingerprint {
  public static async collect(): Promise<PreferencesGroupInfo> {
    try {
      const languagesResult = collectLanguages();
      const timezoneResult = collectTimezone();
      const touchSupportResult = collectTouchSupport();
      const sessionStorageResult = collectSessionStorage();
      const openDatabaseResult = collectOpenDatabase();
      const localStorageResult = collectLocalStorage();
      const indexedDBResult = await collectIndexedDB();
      const cookiesEnabledResult = collectCookiesEnabled();

      const preferencesGroup: PreferencesGroupInfo = {
        languages: languagesResult.languages,
        timezone: timezoneResult.timezone,
        touchSupport: touchSupportResult.touchSupport,
        sessionStorage: sessionStorageResult.sessionStorage,
        openDatabase: openDatabaseResult.openDatabase,
        localStorage: localStorageResult.localStorage,
        indexedDB: indexedDBResult.indexedDB,
        cookiesEnabled: cookiesEnabledResult.cookiesEnabled,
      };

      return preferencesGroup;
    } catch (error) {
      console.error("Error collecting preferences fingerprint:", error);
      return {
        languages: [],
        timezone: "",
        touchSupport: false,
        sessionStorage: false,
        openDatabase: false,
        localStorage: false,
        indexedDB: false,
        cookiesEnabled: false,
      };
    }
  }
}
