/**
 * Configuration Module Export
 * 
 * Central export point for all configuration utilities
 */

export { default as config, configUtils, assertions } from './env';
export type { Environment, AppConfig } from './env';

// Re-export commonly used config values
export {
  environment,
  isDevelopment,
  isProduction,
  version,
  api,
  app,
  features,
  ui
} from './env';