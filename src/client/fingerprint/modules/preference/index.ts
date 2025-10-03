import { collectLanguages } from './languages';
import { collectTimezone } from './timezone';
import { collectTouchSupport } from './touchSupport';
import { collectSessionStorage } from './sessionStorage';
import { collectOpenDatabase } from './openDatabase';
import { collectLocalStorage } from './localStorage';
import { collectIndexedDB } from './indexedDb';
import { collectCookiesEnabled } from './cookiesEnabled';
import type { PreferencesGroupInfo } from '../../types';

export class PreferencesFingerprint {
  public static async collect(): Promise<PreferencesGroupInfo> {
    const languagesResult = collectLanguages();
    const timezoneResult = collectTimezone();
    const touchSupportResult = collectTouchSupport();
    const sessionStorageResult = collectSessionStorage();
    const openDatabaseResult = collectOpenDatabase();
    const localStorageResult = collectLocalStorage();
    const indexedDBResult = await collectIndexedDB();
    const cookiesEnabledResult = collectCookiesEnabled();

    const preferencesGroup: PreferencesGroupInfo = {
      languages: languagesResult,
      timezone: timezoneResult,
      touchSupport: touchSupportResult,
      sessionStorage: sessionStorageResult,
      openDatabase: openDatabaseResult,
      localStorage: localStorageResult,
      indexedDB: indexedDBResult,
      cookiesEnabled: cookiesEnabledResult,
    };

    return preferencesGroup;
  }
}
