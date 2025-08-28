import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import config from '../config/environment';
import { FingerprintService } from './services/fingerprintService';
import { TaggingService } from './services/taggingService';
import { HashService } from './services/hashService';
import { ScriptService } from './services/scriptService';

const app = express();

// Middleware - Basic configuration
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('.'));
app.use('/examples', express.static(path.join(__dirname, '../../examples')));
app.set('etag', false);

// Services
const fingerprintService = new FingerprintService();
const hashService = new HashService();
const scriptService = new ScriptService();

// Routes
app.get('/api/fingerprint', async (req: Request, res: Response) => {
  try {
    const fingerprint = await fingerprintService.generateFingerprint(req);
    const hashedFingerprint = hashService.hashFingerprint(fingerprint);
    
    res.json({
      success: true,
      data: {
        fingerprint: hashedFingerprint,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate fingerprint'
    });
  }
});

app.post('/api/fingerprint', async (req: Request, res: Response) => {
  try {
    const clientFingerprint = req.body.fingerprint;
    const serverFingerprint = await fingerprintService.generateFingerprint(req);
    
    // Combine client and server fingerprints
    const combinedFingerprint = fingerprintService.combineFingerprints(
      clientFingerprint,
      serverFingerprint
    );
    
    const hashedFingerprint = hashService.hashFingerprint(combinedFingerprint);
    
    res.json({
      success: true,
      data: {
        fingerprint: hashedFingerprint,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process fingerprint'
    });
  }
});

app.get('/libs/apd-express.js', (req: Request, res: Response) => {
  try {
    const script = scriptService.getClientScript();

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

app.get('/api/script', (req: Request, res: Response) => {
  try {
    const script = scriptService.getClientScript();

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
    const script = await scriptService.getMinifiedScript();

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

app.get('/test', (req: Request, res: Response) => {
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
  res.redirect('/examples.html');
});

app.get('/api/script-info', async (req: Request, res: Response) => {
  try {
    const info = await scriptService.getScriptInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('Error getting script info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get script info'
    });
  }
});

// Compare async vs sync minification
app.get('/api/minify-compare', async (req: Request, res: Response) => {
  try {
    const originalScript = scriptService.getClientScript();
    const [asyncMinified, syncMinified] = await Promise.all([
      scriptService.getMinifiedScript(),
      Promise.resolve(scriptService.getMinifiedScriptSync())
    ]);

    const comparison = {
      original: {
        size: originalScript.length,
        lines: originalScript.split('\n').length
      },
      async: {
        size: asyncMinified.length,
        compression: ((originalScript.length - asyncMinified.length) / originalScript.length * 100).toFixed(2) + '%',
        method: 'Terser'
      },
      sync: {
        size: syncMinified.length,
        compression: ((originalScript.length - syncMinified.length) / originalScript.length * 100).toFixed(2) + '%',
        method: 'Fallback regex'
      },
      recommendation: asyncMinified.length < syncMinified.length ? 'async' : 'sync'
    };

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing minification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare minification methods'
    });
  }
});

app.post('/api/rebuild-script', (req: Request, res: Response) => {
  try {
    scriptService.rebuildScript();
    res.json({
      success: true,
      message: 'Script rebuilt successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to rebuild script'
    });
  }
});

// Serve HTML demo pages
app.get('/demo.html', (req: Request, res: Response) => {
  res.sendFile('demo.html', { root: path.join(__dirname, '../../examples/basic') });
});

app.get('/examples.html', (req: Request, res: Response) => {
  res.sendFile('index.html', { root: path.join(__dirname, '../../examples') });
});

app.get('/login-demo.html', (req: Request, res: Response) => {
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

export default app;
