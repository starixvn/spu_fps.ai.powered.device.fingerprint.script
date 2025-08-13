import { config } from 'dotenv';
import path from 'path';

// Load environment file based on NODE_ENV
const loadEnvironment = () => {
  const nodeEnv = process.env.NODE_ENV || 'local';
  const envFile = `.env.${nodeEnv}`;
  const envPath = path.resolve(process.cwd(), envFile);
  
  console.log(`🔍 Loading environment file: ${envPath}`);
  
  // Load specific environment file
  const result = config({ path: envPath });
  
  if (result.error) {
    console.warn(`⚠️ Failed to load ${envFile}:`, result.error.message);
  } else {
    console.log(`✅ Loaded environment file: ${envFile}`);
  }
  
  // Also load base .env if it exists (for shared variables)
  config({ path: path.resolve(process.cwd(), '.env') });
  
  console.log(`🔍 After loading - NODE_ENV: ${process.env.NODE_ENV}, PORT: ${process.env.PORT}`);
};

// Load environment on import
loadEnvironment();

interface EnvironmentConfig {
  // Server Configuration
  port: number;
  nodeEnv: string;
}

const environmentConfig: EnvironmentConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'local',
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
  // Only validate port range - no other required variables
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
validateConfig();

// Log the loaded configuration
console.log(`🚀 Environment loaded: ${environmentConfig.nodeEnv.toUpperCase()}`);
console.log(`📡 Server will run on port: ${environmentConfig.port}`);
console.log(`🔧 Log level: ${getDefaultLogLevel()}`);

if (environmentConfig.nodeEnv !== 'production') {
  console.log('🐛 Debug mode enabled');
}

export default environmentConfig;
