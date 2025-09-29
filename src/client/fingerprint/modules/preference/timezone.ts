import type { TimezoneInfo } from '../../types';
import { FingerprintSpecialValue } from '../../utils/consts';

export function collectTimezone(): TimezoneInfo {
  try {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const formatter = new Intl.DateTimeFormat();
      const options = formatter.resolvedOptions();
      const tz = options.timeZone;

      if (typeof tz === 'string' && tz.trim().length > 0) {
        const cleanTz = tz
          .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '')
          .trim();

        const ianaPattern   = /^[A-Za-z0-9_\-]+(?:\/[A-Za-z0-9_\-]+)+$/;
        const offsetPattern = /^UTC[+-]\d{2}:\d{2}$/;

        if (cleanTz && (ianaPattern.test(cleanTz) || offsetPattern.test(cleanTz))) {
          return cleanTz;
        }
      }
    }

    const now = new Date();
    const offset = now.getTimezoneOffset(); // in minutes

    if (typeof offset !== 'number' || isNaN(offset)) return FingerprintSpecialValue.ERROR;

    const absHours = Math.floor(Math.abs(offset) / 60);
    const absMinutes = Math.abs(offset) % 60;
    const sign = offset <= 0 ? '+' : '-';

    return `UTC${sign}${absHours.toString().padStart(2, '0')}:${absMinutes
      .toString()
      .padStart(2, '0')}`;
  } catch (err) {
    return FingerprintSpecialValue.ERROR;
  }
}
