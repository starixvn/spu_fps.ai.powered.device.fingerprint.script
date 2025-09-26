import { config } from 'dotenv';
import { existsSync } from 'fs';
import path from 'path';

/* istanbul ignore file */

const loadEnvironment = (): void => {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase() || 'development';
  const envFile = `.env.${nodeEnv}`;
  const envPath = path.resolve(process.cwd(), envFile);
  
  if (existsSync(envPath)) {
    const result = config({ path: envPath });
    if (result.error) {
      console.warn(`⚠️ Failed to load ${envFile}:`, result.error.message);
    }
  }
  
  const baseEnvPath = path.resolve(process.cwd(), '.env');
  if (existsSync(baseEnvPath)) {
    config({ path: baseEnvPath });
  }
};

loadEnvironment();

interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  localStorageKey: string;
  indexedDBKey: string;
  cookiesKey: string;
  cacheKey: string;
  gatewayUrl: string;
  encodeKey: string;
  sessionKey: string;
  version: string;
  cacheExpireTime: string;
}

const getDefaultPort = (): number => {
  return parseInt(
    process.env.PORT || (process.env.NODE_ENV?.toLowerCase() === 'klprod' ? '5000' : '3000'), 
    10
  );
};

const environmentConfig: EnvironmentConfig = {
  port: getDefaultPort(),
  nodeEnv: process.env.NODE_ENV?.toLowerCase() || 'development',
  
  localStorageKey: process.env.LOCAL_STORAGE_KEY || 'awb_visitor_session',
  indexedDBKey: process.env.INDEXEDDB_KEY || 'pwr_client_sync',
  cookiesKey: process.env.COOKIES_KEY || 'cke_anchor_key',
  cacheKey: process.env.CACHE_KEY || 'msn_identity_tag',
  sessionKey: process.env.SESSION_KEY || '',
  
  gatewayUrl: process.env.GATEWAY_URL || '',
  
  encodeKey: process.env.ENCODE_KEY || '',
  
  version: process.env.VERSION || '',

  cacheExpireTime: process.env.CACHE_EXPIRE_TIME || '3600',
};

const getDefaultLogLevel = (): string => {
  switch (process.env.NODE_ENV?.toLowerCase()) {
    case 'klprod':
      return 'warn';
    case 'development':
      return 'info';
    case 'local':
    default:
      return 'debug';
  }
};

const validateConfig = (): void => {
  if (environmentConfig.port < 1 || environmentConfig.port > 65535) {
    throw new Error('PORT must be between 1 and 65535');
  }
};

const validateEnvironment = (): void => {
  const validEnvironments = ['local', 'development', 'staging', 'klprod'];
  if (!validEnvironments.includes(environmentConfig.nodeEnv)) {
    console.warn(`Warning: NODE_ENV '${environmentConfig.nodeEnv}' is not recognized. Using 'local' defaults.`);
  }
};

const initializeEnvironment = (): void => {
  validateEnvironment();
  validateConfig();
  
  if (environmentConfig.nodeEnv !== 'klprod') {
    console.log(`🚀 Environment: ${environmentConfig.nodeEnv.toUpperCase()} | Port: ${environmentConfig.port}`);
  }
};

initializeEnvironment();

export default environmentConfig;
export { getDefaultLogLevel };
