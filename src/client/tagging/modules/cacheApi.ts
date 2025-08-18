import { IStorageHandler } from "../types";

export class CacheApiHandler implements IStorageHandler {

  public async get(key: string): Promise<string | null> {
    try {
      if (this.available() || !key) {

        const cache = await caches.open(key);
        const response = await cache.match(new Request(`/cache/${key}`));
        
        if (response) {
          const data = await response.text();
          return data;
        }
      }
      return null;

    } catch (exception) {
      return null;
    }
  }

  public async set(key: string, value: string): Promise<boolean> {
    try {
      if (this.available() || !key || !value) {
        const cache = await caches.open(key);
        const response = new Response(value, {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'max-age=31536000'
          }
        });
        
        await cache.put(new Request(`/cache/${key}`), response);
        return true;
      }
      return false;

    } catch (exception) {
      return false;
    }
  }

  public available(): boolean {
    try {
      return 'caches' in window && typeof caches.open === 'function';
    } catch {
      return false;
    }
  }
}
