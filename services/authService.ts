import { API_BASE_URL } from './config';

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
  username?: string;
  role?: number;
  language_from?: string;
  language_to?: string;
  current_level?: number;
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

export interface SetupRegisterRequest {
  email: string;
  password: string;
  username?: string;
  language_from: string;
  language_to: string;
  current_level: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  error: any;
  message: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  role: number;
}

class AuthService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      console.log(`Making request to: ${API_BASE_URL}/api/auth${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<TokenResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const tokenData = response.data;
    
    // Get user profile with the token
    const userProfile = await this.getProfile(tokenData.accessToken);

    return {
      user: userProfile,
      token: tokenData.accessToken,
    };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // First, create basic account
    await this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    // Then login to get tokens
    return this.login({
      email: data.email,
      password: data.password,
    });
  }

  async setupRegister(data: SetupRegisterRequest): Promise<void> {
    await this.makeRequest('/setup-register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(token: string): Promise<User> {
    const response = await this.makeRequest<any>('/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const profile = response.data;
    
    // Map API response to our User interface
    return {
      id: profile._id || profile.id,
      name: profile.username || profile.name || profile.email.split('@')[0],
      email: profile.email,
      selectedLanguage: profile.language_to || 'en',
      streak: profile.streakDays || 0,
      xp: profile.xp || 0,
      level: profile.current_level || 1,
      dailyGoal: profile.dailyGoal || 20,
      username: profile.username,
      role: profile.role,
      language_from: profile.language_from,
      language_to: profile.language_to,
      current_level: profile.current_level,
    };
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    // API doesn't have forgot password endpoint yet, so return mock
    console.log('Forgot password for:', email);
    return { success: true };
  }

  async logout(): Promise<void> {
    // API doesn't have logout endpoint yet since tokens are stateless
    return;
  }

  async getCurrentUser(): Promise<User | null> {
    // This would need a stored token to work
    // For now, return null to indicate no stored session
    return null;
  }

  // Helper method to validate token
  async validateToken(token: string): Promise<boolean> {
    try {
      await this.getProfile(token);
      return true;
    } catch {
      return false;
    }
  }
}

export default new AuthService();
