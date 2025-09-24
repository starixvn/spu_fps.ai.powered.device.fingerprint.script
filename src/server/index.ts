import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import config from '../config/environment';
import { TaggingService } from './services/taggingService';
import { FingerprintScriptService } from './services/fingerprintScriptService';
import { TaggingScriptService } from './services/taggingScriptService';
import { CombinedScriptService } from './services/combinedScriptService';

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

// Middleware to restrict development endpoints in production
const restrictInProduction = (req: Request, res: Response, next: NextFunction) => {
  if (config.nodeEnv === 'production') {
    return res.sendStatus(404);
  }
  next();
};

app.get('/api/taggingScript', restrictInProduction, (req: Request, res: Response) => {
  try {
    const script = taggingScript.getTaggingScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(script);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deliver script'
    });
  }
});

app.get('/api/fingerprintScript', restrictInProduction, (req: Request, res: Response) => {
  try {
    const script = fingerprintScript.getFingerprintScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(script);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deliver script'
    });
  }
});

app.get('/libs/apd-express.js', restrictInProduction, (req: Request, res: Response) => {
  try {
    const script = taggingScript.getTaggingScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(script);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deliver script'
    });
  }
});

app.get('/libs/apd-express.min.js', async (req: Request, res: Response) => {
  try {
    const script = await taggingScript.getMinifiedTaggingScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(script);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deliver minified script'
    });
  }
});

app.get('/libs/apd-routing.js', restrictInProduction, (req: Request, res: Response) => {
  try {
    const script = fingerprintScript.getFingerprintScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(script);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deliver script'
    });
  }
});

app.get('/libs/apd-routing.min.js', async (req: Request, res: Response) => {
  try {
    const script = await fingerprintScript.getMinifiedFingerprintScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(script);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deliver minified script'
    });
  }
});

// Combined Script Endpoints
app.get('/api/combinedScript', restrictInProduction, (req: Request, res: Response) => {
  try {
    const script = combinedScript.getCombinedScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(script);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deliver combined script'
    });
  }
});

app.get('/libs/apd-unified.js', restrictInProduction, (req: Request, res: Response) => {
  try {
    const script = combinedScript.getCombinedScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(script);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deliver combined script'
    });
  }
});

app.get('/libs/apd-unified.min.js', async (req: Request, res: Response) => {
  try {
    const script = await combinedScript.getMinifiedCombinedScript();

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(script);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deliver minified combined script'
    });
  }
});

app.get('/healthz', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/resources/vers', (req: Request, res: Response) => {
  try {
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

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session',
    });
  }
});

app.get('/test', restrictInProduction, (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>FPS Test</title></head>
    <body>
      <h1>FPS Fingerprint Test</h1>
      <button onclick="testFPS()">Test FPSFingerprint</button>
      <pre id="result"></pre>
      
      <script src="/script.js"></script>
      <script>
        function testFPS() {
          try {
            console.log('FPSFingerprint object:', FPSFingerprint);
            const result = FPSFingerprint.collect();
            document.getElementById('result').textContent = JSON.stringify(result, null, 2);
          } catch (error) {
            document.getElementById('result').textContent = 'Error: ' + error.message;
            console.error('Error:', error);
          }
        }
      </script>
    </body>
    </html>
  `);
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

app.get('/login-demo.html', restrictInProduction, (req: Request, res: Response) => {
  // Return a simple message since login-demo.html doesn't exist yet
  res.status(404).send(`
    <html>
      <head><title>Demo Not Available</title></head>
      <body>
        <h1>Login Demo Not Available</h1>
        <p>This demo is not yet implemented. Please use the <a href="/demo.html">basic demo</a> instead.</p>
      </body>
    </html>
  `);
});

// Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 FPS API server running on port ${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv.toUpperCase()}`);
    console.log(`📊 Debug mode: ${config.nodeEnv !== 'production' ? 'ON' : 'OFF'}`);
    console.log(`🔗 API endpoint: http://localhost:${config.port}/api`);
    console.log(`🐳 Docker: Server listening on 0.0.0.0:${config.port}`);
  }).on('error', (err) => {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}

export default app;
