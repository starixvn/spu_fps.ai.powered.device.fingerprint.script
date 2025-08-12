/**
 * Cache API module for device fingerprinting
 * Uses browser Cache API to persist data across sessions
 */

export class CacheApiHandler {

  public static async get(key: string): Promise<string | null> {
    try {
      if ('caches' in window) {
        
        const cache = await caches.open('data-cache-v1');
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

  public static async set(key: string, value: string): Promise<boolean> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('data-cache-v1');
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

  public static available(): boolean {
    try {
      return 'caches' in window && typeof caches.open === 'function';
    } catch {
      return false;
    }
  }
}
