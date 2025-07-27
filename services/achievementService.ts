import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config";

interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  condition: {
    type: string;
    value?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface UserAchievement {
  _id: string;
  user_id: string;
  archivement_id: Achievement;
  unlock_at: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface UserAchievementResponse {
  data: UserAchievement[];
  pagination: any;
  message: string;
}

interface ProcessedAchievement {
  id: string;
  level: string;
  className: string;
  icon: any;
  name: string;
  progressText: string;
  percentage: number;
  desc: string;
  isUnlocked: boolean;
  unlockDate?: string | null;
  condition: {
    type: string;
    value?: number;
  };
}

class AchievementService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const headers = await this.getHeaders();

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Achievement API request failed:", error);
      throw error;
    }
  }

  private getAchievementIcon(iconEmoji: string): any {
    const iconMap: Record<string, any> = {
      "🔥": require("../assets/images/flame.png"),
      "⚡": require("../assets/images/star-3d.png"),
      "📘": require("../assets/images/master-data.png"),
      "🏁": require("../assets/images/flame.png"),
      "🎯": require("../assets/images/star-3d.png"),
      "😅": require("../assets/images/master-data.png"),
    };

    return iconMap[iconEmoji] || require("../assets/images/flame.png");
  }

  private getAchievementClassName(type: string): string {
    const classMap: Record<string, string> = {
      first_practice: "fire",
      total_xp: "scholar",
      complete_lessons: "student",
      complete_courses: "fire",
      no_mistake_lesson: "scholar",
      first_mistake: "student",
    };

    return classMap[type] || "fire";
  }

  private getAchievementLevel(condition: {
    type: string;
    value?: number;
  }): string {
    if (!condition.value) return "CẤP 1";

    if (condition.value <= 10) return "CẤP 1";
    if (condition.value <= 50) return "CẤP 2";
    if (condition.value <= 100) return "CẤP 3";
    return "CẤP 4";
  }

  private calculateProgress(
    achievement: Achievement,
    userStats?: any
  ): { progressText: string; percentage: number } {
    const { type, value } = achievement.condition;

    if (!userStats) {
      return {
        progressText: value ? `0/${value}` : "1/1",
        percentage: 0,
      };
    }

    switch (type) {
      case "total_xp":
        const currentXP = userStats?.xp || 0;
        const targetXP = value || 500;
        const xpPercentage = Math.min((currentXP / targetXP) * 100, 100);
        return {
          progressText: `${currentXP}/${targetXP}`,
          percentage: xpPercentage,
        };

      case "complete_lessons":
        const completedLessons = userStats?.completed_lessons || 0;
        const targetLessons = value || 10;
        const lessonPercentage = Math.min(
          (completedLessons / targetLessons) * 100,
          100
        );
        return {
          progressText: `${completedLessons}/${targetLessons}`,
          percentage: lessonPercentage,
        };

      case "complete_courses":
        const completedCourses = userStats?.completed_courses || 0;
        const targetCourses = value || 1;
        const coursePercentage = Math.min(
          (completedCourses / targetCourses) * 100,
          100
        );
        return {
          progressText: `${completedCourses}/${targetCourses}`,
          percentage: coursePercentage,
        };

      case "no_mistake_lesson":
        const perfectLessons = userStats?.perfect_lessons || 0;
        const targetPerfect = value || 3;
        const perfectPercentage = Math.min(
          (perfectLessons / targetPerfect) * 100,
          100
        );
        return {
          progressText: `${perfectLessons}/${targetPerfect}`,
          percentage: perfectPercentage,
        };

      case "first_practice":
      case "first_mistake":
        return {
          progressText: "1/1",
          percentage: 100,
        };

      default:
        return {
          progressText: "1/1",
          percentage: 100,
        };
    }
  }

  async getUserAchievements(userId: string): Promise<UserAchievementResponse> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      console.log(`Fetching achievements for user: ${userId}`);
      const data = await this.makeRequest<UserAchievementResponse>(
        `/api/user-archivement/${userId}`
      );
      console.log("Raw API response:", JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      throw error;
    }
  }

  async getProcessedAchievements(
    userId: string,
    userStats?: any
  ): Promise<ProcessedAchievement[]> {
    try {
      const response = await this.getUserAchievements(userId);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format from API");
      }

      const processedAchievements: ProcessedAchievement[] = response.data
        .map((userAchievement) => {
          try {
            // Extract the achievement data from the archivement_id field
            const achievement = userAchievement.archivement_id;

            // Validate that achievement has required fields
            if (
              !achievement ||
              !achievement.condition ||
              !achievement.title ||
              !achievement.description
            ) {
              console.warn(
                "Achievement missing required fields:",
                userAchievement
              );
              return null;
            }

            // Calculate progress since backend doesn't provide it yet
            const progress = this.calculateProgress(achievement, userStats);
            const isUnlocked = !!userAchievement.unlock_at; // Achievement is unlocked if unlock_at exists

            return {
              id: userAchievement._id,
              level: this.getAchievementLevel(achievement.condition),
              className: this.getAchievementClassName(
                achievement.condition.type
              ),
              icon: this.getAchievementIcon(achievement.icon),
              name: achievement.title,
              progressText: progress.progressText,
              percentage: isUnlocked ? 100 : progress.percentage,
              desc: achievement.description,
              isUnlocked: isUnlocked,
              unlockDate: userAchievement.unlock_at,
              condition: achievement.condition,
            };
          } catch (error) {
            console.error(
              `Error processing achievement:`,
              error,
              userAchievement
            );
            return null;
          }
        })
        .filter(Boolean) as ProcessedAchievement[];

      return processedAchievements;
    } catch (error) {
      console.error("Error processing achievements:", error);
      throw error;
    }
  }

  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const data = await this.makeRequest<{ data: Achievement[] }>(
        "/api/achievements"
      );
      return data.data || [];
    } catch (error) {
      console.error("Error fetching all achievements:", error);
      throw error;
    }
  }
}

export default new AchievementService();
