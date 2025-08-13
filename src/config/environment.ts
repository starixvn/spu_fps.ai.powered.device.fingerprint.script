import { config } from 'dotenv';
import path from 'path';

// Load environment file based on NODE_ENV
const loadEnvironment = () => {
  const nodeEnv = process.env.NODE_ENV || 'local';
  const envFile = `.env.${nodeEnv}`;
  const envPath = path.resolve(process.cwd(), envFile);
  
  // Load specific environment file
  config({ path: envPath });
  
  // Also load base .env if it exists (for shared variables)
  config({ path: path.resolve(process.cwd(), '.env') });
};

// Load environment on import
loadEnvironment();

interface EnvironmentConfig {
  // Server Configuration
  port: number;
  nodeEnv: string;
  
  // Database Configuration
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  
  // Redis Configuration
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  
  // API Configuration
  api: {
    baseUrl: string;
    fpsEndpoint: string;
    fpsApiKey: string;
  };
  
  // Security Configuration
  security: {
    jwtSecret: string;
    encryptionKey: string;
    corsOrigin: string;
  };
  
  // Performance Configuration
  performance: {
    maxPayloadSize: string;
    requestTimeout: number;
  };
  
  // Logging Configuration
  logging: {
    level: string;
  };
  
  // Feature Flags
  features: {
    enableFingerprintCache: boolean;
    enableAnalytics: boolean;
    enableDebugMode: boolean;
  };
}

const environmentConfig: EnvironmentConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'local',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'fps_fingerprint',
    user: process.env.DB_USER || 'fps_user',
    password: process.env.DB_PASSWORD || '',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    fpsEndpoint: process.env.FPS_ENDPOINT || 'http://localhost:3000/api',
    fpsApiKey: process.env.FPS_API_KEY || '',
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
  
  performance: {
    maxPayloadSize: process.env.MAX_PAYLOAD_SIZE || '10mb',
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
  },
  
  logging: {
    level: process.env.LOG_LEVEL || getDefaultLogLevel(),
  },
  
  features: {
    enableFingerprintCache: process.env.ENABLE_FINGERPRINT_CACHE === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enableDebugMode: process.env.ENABLE_DEBUG_MODE === 'true',
  },
};

// Environment-specific defaults
function getDefaultLogLevel(): string {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'warn';
    case 'development':
      return 'info';
    case 'local':
    default:
      return 'debug';
  }
}

// Validation functions
function validateConfig(): void {
  const required = ['JWT_SECRET'];
  
  if (environmentConfig.nodeEnv === 'production') {
    required.push('DB_PASSWORD', 'ENCRYPTION_KEY', 'FPS_API_KEY');
  }
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  if (environmentConfig.port < 1 || environmentConfig.port > 65535) {
    throw new Error('PORT must be between 1 and 65535');
  }
}

function validateEnvironment(): void {
  const validEnvironments = ['local', 'development', 'staging', 'production'];
  if (!validEnvironments.includes(environmentConfig.nodeEnv)) {
    console.warn(`Warning: NODE_ENV '${environmentConfig.nodeEnv}' is not recognized. Using 'local' defaults.`);
  }
}

// Run validations
validateEnvironment();

// Only run strict validation in production
if (environmentConfig.nodeEnv === 'production') {
  validateConfig();
}

// Log the loaded configuration (excluding sensitive data)
console.log(`🚀 Environment loaded: ${environmentConfig.nodeEnv.toUpperCase()}`);
console.log(`📡 Server will run on port: ${environmentConfig.port}`);
console.log(`🔧 Log level: ${environmentConfig.logging.level}`);

if (environmentConfig.features.enableDebugMode) {
  console.log('🐛 Debug mode enabled');
}

export default environmentConfig;
