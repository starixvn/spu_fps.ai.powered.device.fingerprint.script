import { NextFunction, Request, Response } from "express";
import config from "../config/environment";

// Middleware to restrict development endpoints in production
const restrictInProduction = (req: Request, res: Response, next: NextFunction) => {
    if (config.nodeEnv === 'klprod') {
      return res.sendStatus(404);
    }
    next();
  };

export {
    restrictInProduction,
};