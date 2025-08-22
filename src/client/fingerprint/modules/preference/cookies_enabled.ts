interface CookiesEnabledResult {
  cookiesEnabled: boolean;
}

export function collectCookiesEnabled(): CookiesEnabledResult {
  try {
    const cookiesEnabled = getCookiesEnabled();
    console.log("CookiesEnabled fingerprint collected:", { cookiesEnabled });

    return { cookiesEnabled };
  } catch (error) {
    console.error("Error collecting cookies enabled status:", error);
    return { cookiesEnabled: false };
  }
}

function getCookiesEnabled(): boolean {
  try {
    if (navigator.cookieEnabled !== undefined) {
      return navigator.cookieEnabled;
    }

    const testKey = "fps_cookie_test";
    const testValue = "test_value";

    document.cookie = `${testKey}=${testValue}; path=/`;

    const hasCookie = document.cookie.indexOf(testKey) !== -1;

    document.cookie = `${testKey}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

    return hasCookie;
  } catch {
    return false;
  }
}
