import * as Sentry from "@sentry/node";

export class Logger {
  public static captureException(message: Error) {
    Sentry.captureException(message);
  }

  public static captureMessage(message: string) {
    Sentry.captureMessage(message);
  }
}