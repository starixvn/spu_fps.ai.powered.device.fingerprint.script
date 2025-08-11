export class ETagHandler {

  public static get(key: string): string | null {
    return 'etag';
  }

  public static set(key: string, value: string): boolean {
    return true;
  }

  public static available(): boolean {
    return true;
  }
}
