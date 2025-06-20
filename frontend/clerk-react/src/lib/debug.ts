// Debug utility to check environment configuration
export const debugConfig = () => {
  const config = {
    // Environment info
    NODE_ENV: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
    
    // Custom environment variables
    APP_ENV: import.meta.env.VITE_APP_ENV,
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    
    // Clerk configuration
    CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 
      `${import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.substring(0, 12)}...` : 'NOT SET',
    
    // Runtime info
    CURRENT_ORIGIN: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    CURRENT_HOSTNAME: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    
    // Computed API URL
    COMPUTED_API_URL: (() => {
      const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
      if (envBaseUrl) return envBaseUrl;
      
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return 'http://localhost:5000';
        }
        return 'https://web-api-6003cem.onrender.com';
      }
      return 'Unable to determine';
    })()
  };
  
  console.log('🔍 Environment Configuration Debug:', config);
  return config;
};

// Call this in development to debug
if (import.meta.env.DEV) {
  debugConfig();
}
