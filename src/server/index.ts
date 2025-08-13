import express, { Request, Response } from 'express';
import cors from 'cors';
import * as path from 'path';
import { FingerprintService } from './services/FingerprintService';
import { HashService } from './services/HashService';
import { ScriptService } from './services/ScriptService';
import config from '../config/environment';

const app = express();

// Middleware - Environment-aware configuration
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true
}));
app.use(express.json({ 
  limit: config.performance.maxPayloadSize 
}));
app.use(express.static('.'));
app.use('/examples', express.static(path.join(__dirname, '../../examples')));

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

app.get('/script.js', (req: Request, res: Response) => {
  try {
    const config = {
      apiEndpoint: req.query.endpoint as string,
      autoCollect: req.query.autoCollect === 'true',
      debug: req.query.debug === 'true'
    };
    
    const script = Object.keys(config).some(key => config[key as keyof typeof config] !== undefined)
      ? scriptService.getWrappedScript(config)
      : scriptService.getClientScript();
    
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
    const config = {
      apiEndpoint: req.query.endpoint as string,
      autoCollect: req.query.autoCollect === 'true',
      debug: req.query.debug === 'true'
    };
    
    const script = Object.keys(config).some(key => config[key as keyof typeof config] !== undefined)
      ? scriptService.getWrappedScript(config)
      : scriptService.getClientScript();
    
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

app.get('/script.min.js', (req: Request, res: Response) => {
  try {
    const script = scriptService.getMinifiedScript();
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(script);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to deliver minified script'
    });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/session', (req: Request, res: Response) => {
  const clientETag = req.headers['if-none-match'];

  res.setHeader('Cache-Control', 'private, max-age=600');
  
  if (clientETag) {
    
    res.json({ 
      session: clientETag,
      timestamp: new Date().toISOString()
    });

  } else {
    res.json({ 
      session: null,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/session', (req: Request, res: Response) => {
  const newSession = req.body.session || req.body.value;
  
  if (!newSession) {
    res.status(400).json({ error: 'Session value required' });
    return;
  }
  
  res.setHeader('ETag', newSession);
  res.setHeader('Cache-Control', 'private, max-age=600');
  
  res.json({
    session: newSession,
    timestamp: new Date().toISOString()
  });
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

app.get('/api/script-info', (req: Request, res: Response) => {
  try {
    const info = scriptService.getScriptInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get script info'
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

app.listen(config.port, () => {
  console.log(`🚀 FPS API server running on port ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv.toUpperCase()}`);
  console.log(`📊 Debug mode: ${config.features.enableDebugMode ? 'ON' : 'OFF'}`);
  console.log(`🔗 API endpoint: ${config.api.fpsEndpoint}`);
});

export default app;
