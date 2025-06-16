export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  selectedLanguage: string;
  streak: number;
  xp: number;
  level: number;
  dailyGoal: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // For demo purposes, we're returning mock data
    // In a real app, you would make an API call like this:
    // const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    // return response.data;

    // Mock response
    return {
      user: {
        id: "1",
        name: "Test User",
        email: data.email,
        selectedLanguage: "ja",
        streak: 5,
        xp: 120,
        level: 3,
        dailyGoal: 20,
      },
      token: "mock-jwt-token",
    };
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // For demo purposes, we're returning mock data
    // const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    // return response.data;

    // Mock response
    return {
      user: {
        id: "1",
        name: data.name,
        email: data.email,
        selectedLanguage: "ja",
        streak: 0,
        xp: 0,
        level: 1,
        dailyGoal: 20,
      },
      token: "mock-jwt-token",
    };
  },

  forgotPassword: async (email: string): Promise<{ success: boolean }> => {
    // For demo purposes
    // const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
    // return response.data;

    return { success: true };
  },

  logout: async (): Promise<void> => {
    // For demo purposes
    // await axios.post(`${API_BASE_URL}/auth/logout`);
    return;
  },

  getCurrentUser: async (): Promise<User | null> => {
    // For demo purposes
    // const response = await axios.get(`${API_BASE_URL}/auth/me`);
    // return response.data;

    // Mock user data
    return {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      selectedLanguage: "ja",
      streak: 5,
      xp: 120,
      level: 3,
      dailyGoal: 20,
    };
  },
};

export default authService;
