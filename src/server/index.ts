import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import config from './config/environment';
import { errorHandler } from './middleware/errorHandlingMiddleware';
import { restrictInProduction } from './middleware/restrictInProduction';
import { TaggingService } from './services/taggingService';
import { FingerprintScriptService } from './services/fingerprintScriptService';
import { TaggingScriptService } from './services/taggingScriptService';
import { CombinedScriptService } from './services/combinedScriptService';
import { Logger } from './components/sentry';

const app = express();

// Middleware - Basic configuration
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('.'));
app.use('/examples', express.static(path.join(__dirname, '../../examples')));
app.set('etag', false);

const fingerprintScript = new FingerprintScriptService();
const taggingScript = new TaggingScriptService();
const combinedScript = new CombinedScriptService();

Logger.captureMessage('APD Server is starting');

app.get('/api/taggingScript', restrictInProduction, (req: Request, res: Response) => {
  const script = taggingScript.getTaggingScript();

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
  res.send(script);
});

app.get('/api/fingerprintScript', restrictInProduction, (req: Request, res: Response) => {
  const script = fingerprintScript.getFingerprintScript();

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
  res.send(script);
});

app.get('/libs/apd-express.js', restrictInProduction, (req: Request, res: Response) => {
  const script = taggingScript.getTaggingScript();

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
  res.send(script);
});

app.get('/libs/apd-express.min.js', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const script = await taggingScript.getMinifiedTaggingScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', `private, max-age=${config.cacheExpireTime}`);
    res.send(script);
  } catch (error) {
    next(error);
  }
});

app.get('/libs/apd-routing.js', restrictInProduction, (req: Request, res: Response) => {
  const script = fingerprintScript.getFingerprintScript();

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
  res.send(script);
});

app.get('/libs/apd-routing.min.js', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const script = await fingerprintScript.getMinifiedFingerprintScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', `private, max-age=${config.cacheExpireTime}`);
    res.send(script);
  } catch (error) {
    next(error);
  }
});

// Combined Script Endpoints
app.get('/api/combinedScript', restrictInProduction, (req: Request, res: Response) => {
  const script = combinedScript.getCombinedScript();

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
  res.send(script);
});

app.get('/libs/apd-unified.js', restrictInProduction, (req: Request, res: Response) => {
  const script = combinedScript.getCombinedScript();

  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
  res.send(script);
});

app.get('/libs/apd-unified.min.js', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const script = await combinedScript.getMinifiedCombinedScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', `private, max-age=${config.cacheExpireTime}`); // Cache for 24 hours
    res.send(script);
  } catch (error) {
    next(error);
  }
});

app.get('/resources/vers', (req: Request, res: Response) => {
  const taggingService = new TaggingService();

  const eTaggingValues = req.headers['res-ec-x'];

  const etagValue = Array.isArray(eTaggingValues) ? eTaggingValues[0] : eTaggingValues;

  const cachedValue = etagValue ?? taggingService.getEtag(req);

  if (cachedValue) {
    taggingService.setEtag(res, cachedValue);

    return res.json({
      success: true,
      t: cachedValue
    });
  }

  return res.json({ 
    success: false, 
    t: null,
  });
});

app.get('/healthz', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root route - redirect to examples
app.get('/', (req: Request, res: Response) => {
  res.redirect('/healthz');
});

// Serve HTML demo pages
app.get('/demo.html', restrictInProduction, (req: Request, res: Response) => {
  res.sendFile('demo.html', { root: path.join(__dirname, '../../examples/basic') });
});

app.get('/examples.html', restrictInProduction, (req: Request, res: Response) => {
  res.sendFile('index.html', { root: path.join(__dirname, '../../examples') });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
