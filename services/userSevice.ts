import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageUtils } from "../utils/storage";
import AuthService from "./authService";
import { API_BASE_URL } from "./config";

async function getToken(): Promise<string | null> {
  try {
    // Try the correct auth token key first
    let token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      // Fallback to legacy userToken key
      token = await AsyncStorage.getItem("userToken");
    }
    return token;
  } catch (error) {
    console.error("[getToken] Error:", error);
    return null;
  }
}

async function getHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export const userService = {
  async getUserProfile(userId: string | null = null) {
    try {
      console.log("[getUserProfile] Called with userId:", userId);

      if (!userId) {
        const token = await getToken();
        console.log("[getUserProfile] Retrieved token:", token);

        if (!token) {
          const cachedUser = await StorageUtils.getCachedUserData();
          if (cachedUser) {
            console.log(
              "[getUserProfile] Using cached user data due to missing token"
            );
            return { user: cachedUser };
          }
          throw new Error("NO_TOKEN");
        }

        const isValid = await AuthService.validateToken(token);
        if (!isValid) {
          await StorageUtils.clearUserData();
          throw new Error("TOKEN_EXPIRED");
        }

        const userProfile = await AuthService.getProfile(token);
        const headers = await getHeaders();
        const response = await fetch(
          `${API_BASE_URL}/api/user/${userProfile.id}`,
          { headers }
        );
        const detailResponse = await response.json();

        console.log(
          "[getUserProfile] Detail response from API:",
          detailResponse
        );
        console.log(
          "[getUserProfile] User data from API:",
          detailResponse.data?.user
        );

        // The key fix: properly map snake_case API fields to camelCase
        const apiUserData = detailResponse.data?.user || {};

        const combinedUserData = {
          user: {
            // Start with profile data
            id: userProfile.id,
            name: userProfile.name,
            username: userProfile.username,
            email: userProfile.email || apiUserData.email,
            selectedLanguage: userProfile.selectedLanguage,

            // Map the important fields from API response (snake_case to camelCase)
            streakDays: apiUserData.streak_days || userProfile.streak || 0,
            currentLevel: apiUserData.current_level || userProfile.level || 1,
            xp: apiUserData.xp || userProfile.xp || 0,
            weeklyXp: apiUserData.weekly_xp || 0,
            hearts: apiUserData.hearts || 5,

            // Keep the snake_case versions as well for compatibility
            streak_days: apiUserData.streak_days || userProfile.streak || 0,
            current_level: apiUserData.current_level || userProfile.level || 1,
            weekly_xp: apiUserData.weekly_xp || 0,

            // Other fields
            freezeCount: apiUserData.freeze_count || 0,
            freeze_count: apiUserData.freeze_count || 0,
            isFreeze: apiUserData.is_freeze || false,
            is_freeze: apiUserData.is_freeze || false,

            languageFrom: apiUserData.language_from || "",
            language_from: apiUserData.language_from || "",
            languageTo: apiUserData.language_to || "",
            language_to: apiUserData.language_to || "",

            isPremiere: apiUserData.is_premiere || false,
            is_premiere: apiUserData.is_premiere || false,
            balance: apiUserData.balance || 0,
            isActive: apiUserData.is_active !== false,
            is_active: apiUserData.is_active !== false,
            role: apiUserData.role || 0,

            // Course/lesson data
            currentCourse: apiUserData.current_course,
            current_course: apiUserData.current_course,
            currentTopic: apiUserData.current_topic,
            current_topic: apiUserData.current_topic,
            currentLesson: apiUserData.current_lesson,
            current_lesson: apiUserData.current_lesson,

            // Dates
            createdAt: apiUserData.createdAt || apiUserData.created_at,
            created_at: apiUserData.createdAt || apiUserData.created_at,
            updatedAt: apiUserData.updatedAt || apiUserData.updated_at,
            updated_at: apiUserData.updatedAt || apiUserData.updated_at,

            // Include all other fields from API response
            ...apiUserData,
          },
          ...detailResponse.data,
        };

        console.log(
          "[getUserProfile] Combined user data:",
          combinedUserData.user
        );
        await StorageUtils.saveUserSession(combinedUserData.user, token);
        return combinedUserData;
      }

      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
        headers,
      });
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("[getUserProfile] Final catch error:", error);

      if (error.message === "NO_TOKEN" || error.message === "TOKEN_EXPIRED") {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.message?.includes("Network")) {
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra internet."
        );
      }

      throw error;
    }
  },

  async checkAuthStatus() {
    try {
      const token = await getToken();
      if (!token) return { isAuthenticated: false, reason: "NO_TOKEN" };

      const isValid = await AuthService.validateToken(token);
      if (!isValid) {
        await StorageUtils.clearUserData();
        return { isAuthenticated: false, reason: "TOKEN_EXPIRED" };
      }

      return { isAuthenticated: true };
    } catch (error) {
      return { isAuthenticated: false, reason: "ERROR", error };
    }
  },

  async getCurrentUser() {
    try {
      const authStatus = await this.checkAuthStatus();
      if (!authStatus.isAuthenticated) return null;

      const token = await getToken();
      if (!token) return null;

      return await AuthService.getProfile(token);
    } catch (error) {
      console.error("[getCurrentUser] Error:", error);
      return null;
    }
  },

  async refreshUserProfile() {
    try {
      const token = await getToken();
      if (!token) throw new Error("NO_TOKEN");

      const userProfile = await AuthService.getProfile(token);
      const headers = await getHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/user/${userProfile.id}`,
        { headers }
      );
      const detailResponse = await response.json();

      console.log(
        "[refreshUserProfile] Detail response from API:",
        detailResponse
      );

      const apiUserData = detailResponse.data?.user || {};

      const combinedUserData = {
        user: {
          // Start with profile data
          id: userProfile.id,
          name: userProfile.name,
          username: userProfile.username,
          email: userProfile.email || apiUserData.email,
          selectedLanguage: userProfile.selectedLanguage,

          // Map the important fields from API response (snake_case to camelCase)
          streakDays: apiUserData.streak_days || userProfile.streak || 0,
          currentLevel: apiUserData.current_level || userProfile.level || 1,
          xp: apiUserData.xp || userProfile.xp || 0,
          weeklyXp: apiUserData.weekly_xp || 0,
          hearts: apiUserData.hearts || 5,

          // Keep the snake_case versions as well for compatibility
          streak_days: apiUserData.streak_days || userProfile.streak || 0,
          current_level: apiUserData.current_level || userProfile.level || 1,
          weekly_xp: apiUserData.weekly_xp || 0,

          // Other fields - same mapping as getUserProfile
          freezeCount: apiUserData.freeze_count || 0,
          freeze_count: apiUserData.freeze_count || 0,
          isFreeze: apiUserData.is_freeze || false,
          is_freeze: apiUserData.is_freeze || false,

          languageFrom: apiUserData.language_from || "",
          language_from: apiUserData.language_from || "",
          languageTo: apiUserData.language_to || "",
          language_to: apiUserData.language_to || "",

          isPremiere: apiUserData.is_premiere || false,
          is_premiere: apiUserData.is_premiere || false,
          balance: apiUserData.balance || 0,
          isActive: apiUserData.is_active !== false,
          is_active: apiUserData.is_active !== false,
          role: apiUserData.role || 0,

          // Course/lesson data
          currentCourse: apiUserData.current_course,
          current_course: apiUserData.current_course,
          currentTopic: apiUserData.current_topic,
          current_topic: apiUserData.current_topic,
          currentLesson: apiUserData.current_lesson,
          current_lesson: apiUserData.current_lesson,

          // Dates
          createdAt: apiUserData.createdAt || apiUserData.created_at,
          created_at: apiUserData.createdAt || apiUserData.created_at,
          updatedAt: apiUserData.updatedAt || apiUserData.updated_at,
          updated_at: apiUserData.updatedAt || apiUserData.updated_at,

          // Include all other fields from API response
          ...apiUserData,
        },
        ...detailResponse.data,
      };

      console.log(
        "[refreshUserProfile] Combined user data:",
        combinedUserData.user
      );
      await StorageUtils.saveUserSession(combinedUserData.user, token);
      return combinedUserData;
    } catch (error) {
      console.error("[refreshUserProfile] Error:", error);
      throw error;
    }
  },

  async updateUserProfile(userId: string, userData: any) {
    try {
      const headers = await getHeaders();
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (data?.user) {
        const token = await getToken();
        if (token) {
          await StorageUtils.saveUserSession(data.user, token);
        }
      }

      return data;
    } catch (error) {
      console.error("[updateUserProfile] Error:", error);
      throw error;
    }
  },

  async getFollowing(userId: string) {
    try {
      const headers = await getHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/user/${userId}/following`,
        { headers }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[getFollowing] Error:", error);
      return [];
    }
  },

  async getFollowers(userId: string) {
    try {
      const headers = await getHeaders();
      const response = await fetch(
        `${API_BASE_URL}/api/user/${userId}/followers`,
        { headers }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[getFollowers] Error:", error);
      return [];
    }
  },
};
