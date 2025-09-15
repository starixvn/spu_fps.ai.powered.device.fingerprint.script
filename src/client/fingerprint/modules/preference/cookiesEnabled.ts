import type { CookiesEnabledInfo, Bit } from "../../types";
import { boolToBit } from "../../utils/data";

export function collectCookiesEnabled(): CookiesEnabledInfo {
  try {
    const cookiesEnabled = getCookiesEnabled();

    return {
      cookiesEnabled: cookiesEnabled,
    };
  } catch (error) {
    return { cookiesEnabled: 0 };
  }
}

function getCookiesEnabled(): Bit {
  try {
    if (typeof navigator.cookieEnabled === "boolean") {
      return boolToBit(navigator.cookieEnabled);
    }

    if (
      typeof document !== "undefined" &&
      typeof document.cookie === "string"
    ) {
      const key = `cookie_test_${Math.random().toString(36).slice(2)}`;

      document.cookie = `${key}=1; path=/; max-age=60`; // 1 min validity

      const cookieExists = document.cookie
        .split("; ")
        .some((c) => c.startsWith(`${key}=`));

      document.cookie = `${key}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      return boolToBit(cookieExists);
    }

    return 0;
  } catch (err) {
    return 0;
  }
}
