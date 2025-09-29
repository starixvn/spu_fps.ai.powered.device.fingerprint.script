import Sentry from "@sentry/node";

let initialized = false;

const initSentry = (sentryDns: string, version: string) => {
    if (!initialized) {
        Sentry.init({ 
            dsn: sentryDns,
            release: version,
            sendDefaultPii: true,
         });
    }

    initialized = true;
};

const captureException = (message: Error) => {
    Sentry.captureException(message)
};

export {
  captureException,
  initSentry,
};