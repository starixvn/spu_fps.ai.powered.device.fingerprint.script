import { IStorageHandler } from "../types";

export class CookiesHandler implements IStorageHandler {

  public async get(key: string): Promise<string | null> {
    try {
      if (!this.available() || !key) {
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

  public async set(key: string, value: string, exdays: number = 365): Promise<boolean> {
    try {
      if (!this.available() || !key || !value) {
        return false;
      }

      const d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      
      const currentDomain = window.location.hostname;
      
      document.cookie = `${key}=${value}; path=/; expires=${d.toUTCString()}; domain=${currentDomain}; SameSite=None; Secure`;
      
      return true;
    } catch (error) {
      return false;
    }
  }

  public available(): boolean {
    try {
      return typeof document !== 'undefined' ? true : false;
    } catch {
      return false;
    }
  }
}
