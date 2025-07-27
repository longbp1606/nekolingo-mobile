import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config";

class AuthService {
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("[AuthService.validateToken] Error:", error);
      return false;
    }
  }

  async getProfile(token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[AuthService.getProfile] Error:", error);
      throw error;
    }
  }

  async login(credentials: { email: string; password: string }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[AuthService.login] Error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("auth_token");
    } catch (error) {
      console.error("[AuthService.logout] Error:", error);
    }
  }
}

export default new AuthService();
