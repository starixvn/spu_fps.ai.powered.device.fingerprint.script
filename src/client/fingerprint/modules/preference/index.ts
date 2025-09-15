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
        touchSupport: touchSupportResult,
        sessionStorage: sessionStorageResult.sessionStorage,
        openDatabase: openDatabaseResult.openDatabase,
        localStorage: localStorageResult.localStorage,
        indexedDB: indexedDBResult.indexedDB,
        cookiesEnabled: cookiesEnabledResult.cookiesEnabled,
      };

      return preferencesGroup;
    } catch (error) {
      return {
        languages: [[""]],
        timezone: "",
        touchSupport: {
          maxTouchPoints: 0,
          touchEvent: 0,
          touchStart: 0,
        },
        sessionStorage: 0,
        openDatabase: 0,
        localStorage: 0,
        indexedDB: 0,
        cookiesEnabled: 0,
      };
    }
  }
}
