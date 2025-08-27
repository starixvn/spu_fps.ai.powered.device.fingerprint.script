interface CookiesEnabledResult {
  cookiesEnabled: boolean;
}

export function collectCookiesEnabled(): CookiesEnabledResult {
  try {
    const cookiesEnabled = getCookiesEnabled();
    return { cookiesEnabled };
  } catch (error) {
    return { cookiesEnabled: false };
  }
}

function getCookiesEnabled(): boolean {
  try {
    if (typeof navigator.cookieEnabled === "boolean") {
      return navigator.cookieEnabled;
    }

    const key = `cookie_test_${Math.random().toString(36).slice(2)}`;
    document.cookie = `${key}=1; path=/`;

    const enabled = document.cookie
      .split("; ")
      .some((cookie) => cookie.startsWith(`${key}=`));

    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    return enabled;
  } catch {
    return false;
  }
}
