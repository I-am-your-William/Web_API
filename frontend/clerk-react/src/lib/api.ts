// API configuration utility
const getApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const isProduction = import.meta.env.VITE_APP_ENV === 'production';
  
  // If we have an explicit base URL from environment, use it
  if (envBaseUrl) {
    return envBaseUrl;
  }
  
  // Fallback logic: detect if we're on localhost or hosted
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If running on localhost, use local backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // If hosted, try to use relative URLs (same domain) or fallback to localhost
    // You can customize this logic based on your hosting setup
    return isProduction ? '' : 'http://localhost:5000';
  }
  
  // Server-side fallback
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function for making API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    return response;
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
};

export default { API_BASE_URL, apiCall };
