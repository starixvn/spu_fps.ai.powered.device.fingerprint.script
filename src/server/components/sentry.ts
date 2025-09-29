import Sentry from "@sentry/node";
import config from '../config/environment';

let initialized = false;

const initSentry = () => {
    if (!initialized) {
        Sentry.init({ 
            dsn: config.sentryDns,
            release: config.version,
            sendDefaultPii: true,
         });
    }

    initialized = true;
};

const captureException = (message: Error) => {
    initSentry();
    Sentry.captureException(message)
};

export {
  captureException,
};