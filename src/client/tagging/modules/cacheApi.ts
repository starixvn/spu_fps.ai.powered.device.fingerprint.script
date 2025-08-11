export class CacheApiHandler {

  public static get(key: string): string | null {
    return 'cache api';
  }

  public static set(key: string, value: string): boolean {
    return true;
  }

  public static available(): boolean {
    return true;
  }
}
