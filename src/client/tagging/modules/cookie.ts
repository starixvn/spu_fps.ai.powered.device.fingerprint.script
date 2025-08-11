export class CookiesHandler {

  public static get(key: string): string | null {
    try {
      if (typeof document === 'undefined') {
        return null;
      }

      const name = key + "=";
      const ca = document.cookie.split(";");
      
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  public static set(key: string, value: string, exdays: number = 365): boolean {
    try {
      if (typeof document === 'undefined') {
        return false;
      }

      const d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      document.cookie = key + "=" + value + "; path=/; expires=" + d.toUTCString() + ';SameSite=None;Secure';
      
      return true;
    } catch (error) {
      return false;
    }
  }

  public static available(): boolean {
    try {
      if (typeof document === 'undefined') {
        return false;
      }

      const testKey = '__test_cookie__';
      const testValue = 'test';
      
      this.set(testKey, testValue, 1);
      const retrieved = this.get(testKey);
      
      if (retrieved === testValue) {
        const d = new Date();
        d.setTime(d.getTime() - 1);
        document.cookie = testKey + "=; path=/; expires=" + d.toUTCString();
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }
}
