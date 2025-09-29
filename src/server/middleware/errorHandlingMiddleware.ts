import config from '../config/environment';
import { captureException } from '../components/sentry';
import { NextFunction, Request, Response } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) =>{

    if (res.headersSent) {
        return next(err);
    }

    if(config.nodeEnv === 'development'){
        captureException(err);
        console.error(err);
    } else {
        captureException(err);
    }

    res.status(500).json({ error: 'Internal Server Error' });
}


export {
    errorHandler,
};
