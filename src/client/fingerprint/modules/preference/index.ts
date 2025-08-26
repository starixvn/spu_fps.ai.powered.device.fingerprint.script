import { collectLanguages } from "./languages";
import { collectTimezone } from "./timezone";
import { collectTouchSupport } from "./touch_support";
import { collectSessionStorage } from "./session_storage";
import { collectOpenDatabase } from "./open_database";
import { collectLocalStorage } from "./local_storage";
import { collectIndexedDB } from "./indexed_db";
import { collectCookiesEnabled } from "./cookies_enabled";
import type { PreferencesGroupResult } from "../../types";

export class PreferencesFingerprint {
  public static async collect(): Promise<PreferencesGroupResult> {
    try {
      const languagesResult = collectLanguages();
      const timezoneResult = collectTimezone();
      const touchSupportResult = collectTouchSupport();
      const sessionStorageResult = collectSessionStorage();
      const openDatabaseResult = collectOpenDatabase();
      const localStorageResult = collectLocalStorage();
      const indexedDBResult = await collectIndexedDB();
      const cookiesEnabledResult = collectCookiesEnabled();

      const preferencesGroup: PreferencesGroupResult = {
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
