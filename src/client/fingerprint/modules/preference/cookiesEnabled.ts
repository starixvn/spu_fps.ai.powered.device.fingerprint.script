import type { CookiesEnabledInfo } from "../../types";

export function collectCookiesEnabled(): CookiesEnabledInfo {
  try {
    const cookiesEnabled = getCookiesEnabled();

    return {
      cookiesEnabled:
        typeof cookiesEnabled === "boolean" ? cookiesEnabled : false,
    };
  } catch (error) {
    return { cookiesEnabled: false };
  }
}

function getCookiesEnabled(): boolean {
  try {
    if (typeof navigator.cookieEnabled === "boolean") {
      return navigator.cookieEnabled;
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

      return cookieExists;
    }

    return false;
  } catch (err) {
    return false;
  }
}
