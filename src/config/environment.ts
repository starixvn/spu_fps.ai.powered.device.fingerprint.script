import { config } from 'dotenv';
import path from 'path';

// Load environment file based on NODE_ENV
const loadEnvironment = () => {
  const nodeEnv = process.env.NODE_ENV || 'local';
  const envFile = `.env.${nodeEnv}`;
  const cwd = process.cwd();
  const envPath = path.resolve(cwd, envFile);
  
  console.log(`🔍 Current working directory: ${cwd}`);
  console.log(`🔍 Looking for environment file: ${envPath}`);
  console.log(`🔍 NODE_ENV from process: ${process.env.NODE_ENV}`);
  
  // Check if file exists
  const fs = require('fs');
  const fileExists = fs.existsSync(envPath);
  console.log(`🔍 Environment file exists: ${fileExists}`);
  
  if (fileExists) {
    // Load specific environment file
    const result = config({ path: envPath });
    
    if (result.error) {
      console.warn(`⚠️ Failed to load ${envFile}:`, result.error.message);
    } else {
      console.log(`✅ Loaded environment file: ${envFile}`);
      console.log(`✅ Loaded ${Object.keys(result.parsed || {}).length} variables from ${envFile}`);
    }
  } else {
    console.warn(`⚠️ Environment file not found: ${envPath}`);
    console.log(`🔍 Available files in directory:`, fs.readdirSync(cwd).filter((f: string) => f.startsWith('.env')));
  }
  
  // Also load base .env if it exists (for shared variables)
  const baseEnvPath = path.resolve(cwd, '.env');
  if (fs.existsSync(baseEnvPath)) {
    console.log(`🔍 Loading base .env file: ${baseEnvPath}`);
    config({ path: baseEnvPath });
  }
  
  console.log(`🔍 Final environment values - NODE_ENV: ${process.env.NODE_ENV}, PORT: ${process.env.PORT}`);
};

// Load environment on import
loadEnvironment();

interface EnvironmentConfig {
  // Server Configuration
  port: number;
  nodeEnv: string;
}

const environmentConfig: EnvironmentConfig = {
  port: parseInt(process.env.PORT || (process.env.NODE_ENV === 'production' ? '5000' : '3000'), 10),
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
