import type { LanguagesInfo, TimezoneInfo, MaxTouchPointsInfo } from '../../types';
import { collectLanguages } from './languages';
import { collectMaxTouchPoints } from './maxTouchPoints';
import { collectTimezone } from './timezone';

export interface PreferenceGroupInfo {
    languageLength: LanguagesInfo;
    timezone: TimezoneInfo;
    maxTouchPoints: MaxTouchPointsInfo;
}

export class PreferenceScoring {
  public static collect(): PreferenceGroupInfo {
    const languageLengthResult = collectLanguages();
    const timezoneResult = collectTimezone();
    const maxTouchPointsResult = collectMaxTouchPoints();

    const preferenceGroup: PreferenceGroupInfo = {
      languageLength: languageLengthResult,
      timezone: timezoneResult,
      maxTouchPoints: maxTouchPointsResult,
    };

    return preferenceGroup;
  }
}