/**
 * Environment Configuration for Policy Radar Frontend
 * 
 * Typed configuration with runtime validation and environment detection.
 * Supports Vite/React with import.meta.env and fallback to process.env.
 */

// Environment types
export type Environment = 'development' | 'testing' | 'staging' | 'production';

// Configuration interface
export interface AppConfig {
  // Environment
  environment: Environment;
  isDevelopment: boolean;
  isProduction: boolean;
  version: string;
  
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  
  // Application Settings
  app: {
    name: string;
    title: string;
    description: string;
  };
  
  // Feature Flags
  features: {
    ragEnabled: boolean;
    analyticsEnabled: boolean;
    debugMode: boolean;
  };
  
  // UI Settings
  ui: {
    theme: 'light' | 'dark' | 'auto';
    defaultPageSize: number;
    maxQueryLength: number;
  };
}

// Type guards for environment variables
function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidEnvironment(env: string): env is Environment {
  return ['development', 'testing', 'staging', 'production'].includes(env);
}

// Environment variable getter with fallbacks
function getEnvVar(key: string, defaultValue?: string): string | undefined {
  // Try Vite import.meta.env first (React with Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteValue = import.meta.env[key];
    if (isString(viteValue)) return viteValue;
  }
  
  // Fallback to process.env (traditional React/Node)
  if (typeof process !== 'undefined' && process.env) {
    const processValue = process.env[key];
    if (isString(processValue)) return processValue;
  }
  
  // Return default value
  return defaultValue;
}

function getEnvVarRequired(key: string): string {
  const value = getEnvVar(key);
  if (!isString(value)) {
    throw new Error(`Required environment variable ${key} is not set or empty`);
  }
  return value;
}

function getEnvVarNumber(key: string, defaultValue: number): number {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Environment variable ${key} is not a valid number: ${value}, using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

function getEnvVarBoolean(key: string, defaultValue: boolean): boolean {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
}

// Configuration validation
function validateConfig(config: AppConfig): string[] {
  const errors: string[] = [];
  
  // Validate API base URL
  if (!isValidUrl(config.api.baseUrl)) {
    errors.push(`Invalid API base URL: ${config.api.baseUrl}`);
  }
  
  // Validate timeout values
  if (config.api.timeout <= 0) {
    errors.push(`API timeout must be positive: ${config.api.timeout}`);
  }
  
  if (config.api.retryAttempts < 0) {
    errors.push(`Retry attempts cannot be negative: ${config.api.retryAttempts}`);
  }
  
  // Validate UI settings
  if (config.ui.defaultPageSize <= 0) {
    errors.push(`Page size must be positive: ${config.ui.defaultPageSize}`);
  }
  
  if (config.ui.maxQueryLength <= 0) {
    errors.push(`Max query length must be positive: ${config.ui.maxQueryLength}`);
  }
  
  // Production-specific validations
  if (config.isProduction) {
    if (config.features.debugMode) {
      errors.push('Debug mode should be disabled in production');
    }
    
    if (!config.api.baseUrl.startsWith('https://')) {
      errors.push('Production API should use HTTPS');
    }
  }
  
  return errors;
}

// Create configuration object
function createConfig(): AppConfig {
  // Detect environment
  const envString = getEnvVar('REACT_APP_ENVIRONMENT') || 
                   getEnvVar('NODE_ENV') || 
                   'development';
  
  const environment: Environment = isValidEnvironment(envString) ? envString : 'development';
  
  const config: AppConfig = {
    // Environment
    environment,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    version: getEnvVar('REACT_APP_VERSION', '1.0.0'),
    
    // API Configuration
    api: {
      baseUrl: getEnvVarRequired('REACT_APP_API_BASE_URL'),
      timeout: getEnvVarNumber('REACT_APP_API_TIMEOUT', 30000),
      retryAttempts: getEnvVarNumber('REACT_APP_API_RETRY_ATTEMPTS', 3),
      retryDelay: getEnvVarNumber('REACT_APP_API_RETRY_DELAY', 1000),
    },
    
    // Application Settings
    app: {
      name: getEnvVar('REACT_APP_APP_NAME', 'Policy Radar'),
      title: getEnvVar('REACT_APP_APP_TITLE', 'Policy Radar Dashboard'),
      description: getEnvVar('REACT_APP_APP_DESCRIPTION', 'Brussels public affairs platform with AI-enhanced document tracking'),
    },
    
    // Feature Flags
    features: {
      ragEnabled: getEnvVarBoolean('REACT_APP_RAG_ENABLED', true),
      analyticsEnabled: getEnvVarBoolean('REACT_APP_ANALYTICS_ENABLED', false),
      debugMode: getEnvVarBoolean('REACT_APP_DEBUG_MODE', environment === 'development'),
    },
    
    // UI Settings
    ui: {
      theme: getEnvVar('REACT_APP_THEME', 'auto') as 'light' | 'dark' | 'auto',
      defaultPageSize: getEnvVarNumber('REACT_APP_DEFAULT_PAGE_SIZE', 20),
      maxQueryLength: getEnvVarNumber('REACT_APP_MAX_QUERY_LENGTH', 500),
    },
  };
  
  return config;
}

// Initialize configuration
let config: AppConfig;

try {
  config = createConfig();
  
  // Validate configuration
  const errors = validateConfig(config);
  if (errors.length > 0) {
    console.error('Configuration validation errors:', errors);
    if (config.isProduction) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    } else {
      console.warn('Configuration validation failed, but continuing in development mode');
    }
  }
  
  // Log configuration in development
  if (config.features.debugMode) {
    console.log('🔧 Configuration loaded:', {
      environment: config.environment,
      apiBaseUrl: config.api.baseUrl,
      features: config.features,
      version: config.version
    });
  }
  
} catch (error) {
  console.error('Failed to initialize configuration:', error);
  
  // Fallback configuration for development
  config = {
    environment: 'development',
    isDevelopment: true,
    isProduction: false,
    version: '1.0.0',
    api: {
      baseUrl: 'http://localhost:8000/api',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    app: {
      name: 'Policy Radar',
      title: 'Policy Radar Dashboard',
      description: 'Brussels public affairs platform with AI-enhanced document tracking',
    },
    features: {
      ragEnabled: true,
      analyticsEnabled: false,
      debugMode: true,
    },
    ui: {
      theme: 'auto',
      defaultPageSize: 20,
      maxQueryLength: 500,
    },
  };
  
  console.warn('🚨 Using fallback configuration');
}

// Export configuration
export default config;

// Named exports for convenience
export const {
  environment,
  isDevelopment,
  isProduction,
  version,
  api,
  app,
  features,
  ui
} = config;

// Utility functions
export const configUtils = {
  /**
   * Get a configuration value with type safety
   */
  get: <K extends keyof AppConfig>(key: K): AppConfig[K] => config[key],
  
  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled: (feature: keyof AppConfig['features']): boolean => 
    config.features[feature],
  
  /**
   * Get API endpoint URL
   */
  getApiUrl: (endpoint: string): string => {
    const baseUrl = config.api.baseUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  },
  
  /**
   * Validate environment is production
   */
  requiresProduction: (): void => {
    if (!config.isProduction) {
      throw new Error('This operation requires production environment');
    }
  },
  
  /**
   * Get current configuration summary
   */
  getSummary: () => ({
    environment: config.environment,
    version: config.version,
    apiBaseUrl: config.api.baseUrl,
    featuresEnabled: Object.entries(config.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature),
  }),
};

// Runtime configuration assertions
export const assertions = {
  /**
   * Assert configuration is valid for production
   */
  assertProductionReady: (): void => {
    const errors = validateConfig(config);
    if (errors.length > 0) {
      throw new Error(`Configuration not production ready: ${errors.join(', ')}`);
    }
  },
  
  /**
   * Assert API is accessible
   */
  assertApiAccessible: async (): Promise<boolean> => {
    try {
      const healthUrl = configUtils.getApiUrl('/health');
      const response = await fetch(healthUrl, { 
        method: 'GET',
        signal: AbortSignal.timeout(config.api.timeout)
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

// Export types for external use
export type { Environment, AppConfig };