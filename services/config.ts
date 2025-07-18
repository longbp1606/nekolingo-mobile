// API configuration

// For Android emulator, use 10.0.2.2 to access host machine's localhost
export const API_BASE_URL = "http://10.0.2.2:3000"; // Local API server for development

// Setup axios interceptors and other config here if needed
export const setupApiInterceptors = (token: string) => {
  // This would configure axios with authentication headers
  // Example:
  // axios.interceptors.request.use((config) => {
  //   config.headers.Authorization = `Bearer ${token}`;
  //   return config;
  // });
};
