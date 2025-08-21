/**
 * Configuration for the PolicyRadar frontend application
 */

// API configuration
export const api = {
  baseUrl: process.env.REACT_APP_API_URL || 'https://policyradar-backend-production.up.railway.app',
  timeout: 10000, // 10 seconds
  retryAttempts: 2,
  retryDelay: 1000, // 1 second
};

// Configuration utilities
export const configUtils = {
  getApiUrl: (endpoint: string): string => {
    const baseUrl = api.baseUrl.endsWith('/') ? api.baseUrl.slice(0, -1) : api.baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  },
};

// Feature flags for the application
export const features = {
  reactQueryDevtools: process.env.NODE_ENV === 'development',
  debugMode: process.env.NODE_ENV === 'development',
  enableRag: true,
  enablePolling: true,
};

const config = {
  api,
  configUtils,
  features,
};

export default config;