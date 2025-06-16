// API configuration

// In a real app, this would be an environment variable
export const API_BASE_URL = "https://api.nekolingo.com"; // This is a placeholder

// Setup axios interceptors and other config here if needed
export const setupApiInterceptors = (token: string) => {
  // This would configure axios with authentication headers
  // Example:
  // axios.interceptors.request.use((config) => {
  //   config.headers.Authorization = `Bearer ${token}`;
  //   return config;
  // });
};
