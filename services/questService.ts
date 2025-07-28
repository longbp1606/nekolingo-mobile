import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FormattedQuest,
  QuestClaimResponse,
  QuestCompletionResponse,
  QuestDetail,
  QuestProgress,
  QuestReward,
  UserQuest,
} from "../types/quest";
import { API_BASE_URL } from "./config";

class QuestService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async getToken(): Promise<string | null> {
    try {
      // Try the correct auth token key first
      let token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        // Fallback to legacy userToken key
        token = await AsyncStorage.getItem("userToken");
      }
      console.log(
        "[QuestService] Retrieved token:",
        token ? `${token.substring(0, 50)}...` : "null"
      );
      return token;
    } catch (error) {
      console.error("[QuestService] Error retrieving token:", error);
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
      console.log(
        "[QuestService] Using authorization header:",
        `Bearer ${token.substring(0, 50)}...`
      );
    } else {
      console.warn("[QuestService] No token available for authorization");
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const headers = await this.getHeaders();
      const requestConfig = {
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, requestConfig);

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorDetail = null;

        try {
          const errorData = JSON.parse(responseText);
          errorDetail = errorData;
          // console.error('[QuestService] Parsed error data:', errorData);

          if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          }
          if (errorData.detail) {
            errorMessage += ` (${errorData.detail})`;
          }
        } catch (parseError) {
          // console.error('[QuestService] Could not parse error response as JSON:', parseError);
          if (responseText) {
            errorMessage += ` - ${responseText}`;
          }
        }

        // console.error('[QuestService] Final error message:', errorMessage);
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).detail = errorDetail;
        throw error;
      }

      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (parseError) {
        // console.error('[QuestService] Could not parse response as JSON:', parseError);
        // console.error('[QuestService] Response text was:', responseText);
        throw new Error("Invalid JSON response from server");
      }
    } catch (error) {
      // console.error('[QuestService] Request error:', error);

      if (
        error instanceof TypeError &&
        error.message.includes("Network request failed")
      ) {
        // console.error('[QuestService] Network error - check internet connection and server status');
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet."
        );
      }

      if (error instanceof Error && error.message.includes("timeout")) {
        // console.error('[QuestService] Request timeout');
        throw new Error("Yêu cầu bị timeout. Vui lòng thử lại.");
      }

      throw error;
    }
  }

  async getDailyQuests(): Promise<UserQuest[]> {
    try {
      // Small delay to ensure token is stored after login
      await new Promise((resolve) => setTimeout(resolve, 100));

      const data = await this.makeRequest<UserQuest[]>("/api/quest/daily");

      if (!Array.isArray(data)) {
        // console.error('[QuestService] Invalid response format - expected array, got:', typeof data);
        throw new Error("Dữ liệu từ server không đúng định dạng");
      }

      data.forEach((quest, index) => {
        if (!quest._id || !quest.quest_id) {
          // console.error(`[QuestService] Invalid quest at index ${index}:`, quest);
          throw new Error(`Dữ liệu quest không hợp lệ tại vị trí ${index}`);
        }
      });

      console.log("[QuestService] Successfully loaded quests from API");
      return data;
    } catch (error) {
      console.error("[QuestService] Error in getDailyQuests:", error);

      // Always return mock data in development or when there are API issues
      if (
        __DEV__ ||
        (error instanceof Error &&
          (error.message.includes("500") ||
            error.message.includes("401") ||
            error.message.includes("403") ||
            error.message.includes("404") ||
            error.message.includes("Network") ||
            error.message.includes("kết nối") ||
            error.message.includes("Phiên đăng nhập")))
      ) {
        console.log("[QuestService] Using mock data due to API error");
        return this.getMockQuests();
      }

      if (error instanceof Error) {
        if (error.message.includes("500")) {
          throw new Error("Server đang gặp sự cố. Vui lòng thử lại sau.");
        } else if (
          error.message.includes("401") ||
          error.message.includes("403")
        ) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else if (error.message.includes("404")) {
          throw new Error("Không tìm thấy dữ liệu nhiệm vụ.");
        } else if (
          error.message.includes("Network") ||
          error.message.includes("kết nối")
        ) {
          throw new Error(
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet."
          );
        }
      }

      throw error;
    }
  }

  private getMockQuests(): UserQuest[] {
    return [
      {
        _id: "6885d02094cd182006a297d1",
        user_id: "6882f9114afd8ba5efed678c",
        quest_id: {
          _id: "f4afbb1da8b94e3bb13657f8",
          title: "Hoàn thành 3 bài học để nhận Streak Freeze",
          icon: "https://example.com/icons/freeze.png",
          reward: {
            type: "freeze",
            amount: 1,
          },
          type: "Complete",
          condition: 3,
          progress: 1,
          progress_text: "1/3",
        },
        is_completed: false,
        __v: 0,
        createdAt: "2025-07-27T07:07:12.946Z",
        updatedAt: "2025-07-27T07:07:12.946Z",
      },
      {
        _id: "6885d02094cd182006a297d0",
        user_id: "6882f9114afd8ba5efed678c",
        quest_id: {
          _id: "2e5faa2c4db0435eadfcfdd6",
          title: "Đạt trên 95% trong 1 bài học",
          icon: "https://example.com/icons/result.png",
          reward: {
            type: "heart",
            amount: 2,
          },
          type: "Result",
          condition: 1,
          score: 95,
          progress: 0,
          progress_text: "0/1",
        },
        is_completed: false,
        __v: 0,
        createdAt: "2025-07-27T07:07:12.946Z",
        updatedAt: "2025-07-27T07:07:12.946Z",
      },
      {
        _id: "6885d02094cd182006a297cf",
        user_id: "6882f9114afd8ba5efed678c",
        quest_id: {
          _id: "f0b79496e6834f6499c3a858",
          title: "Thu thập 300 XP trong ngày",
          icon: "https://example.com/icons/xp.png",
          reward: {
            type: "gem",
            amount: 30,
          },
          type: "XP",
          condition: 300,
          progress: 150,
          progress_text: "150/300",
        },
        is_completed: false,
        __v: 0,
        createdAt: "2025-07-27T07:07:12.946Z",
        updatedAt: "2025-07-27T07:07:12.946Z",
      },
    ];
  }

  async updateQuestProgress(
    questId: string,
    progress: number
  ): Promise<UserQuest> {
    // Backend automatically calculates quest progress
    // Just refresh quests to get updated data
    const quests = await this.getDailyQuests();
    const updatedQuest = quests.find((q) => q._id === questId);
    if (!updatedQuest) {
      throw new Error("Quest not found");
    }
    return updatedQuest;
  }

  async completeQuest(questId: string): Promise<QuestCompletionResponse> {
    // Backend automatically handles quest completion
    // Just refresh to get the latest data and return mock reward
    const quests = await this.getDailyQuests();
    const quest = quests.find((q) => q._id === questId);
    if (!quest) {
      throw new Error("Quest not found");
    }

    return {
      quest: quest,
      reward: quest.quest_id.reward,
    };
  }

  async claimQuestReward(questId: string): Promise<QuestClaimResponse> {
    // Backend automatically handles rewards when quest is completed
    // Just refresh to get the latest data
    const quests = await this.getDailyQuests();
    const quest = quests.find((q) => q._id === questId);
    if (!quest) {
      throw new Error("Quest not found");
    }

    return {
      success: true,
      reward: quest.quest_id.reward,
    };
  }

  formatQuestForUI(userQuest: UserQuest): FormattedQuest {
    const { quest_id, is_completed } = userQuest;

    // Backend provides progress in quest_id.progress field
    const currentProgress =
      quest_id.progress !== undefined ? quest_id.progress : 0;

    const formatted: FormattedQuest = {
      id: userQuest._id,
      questId: quest_id._id,
      title: quest_id.title,
      subtitle: this.getQuestSubtitle(quest_id),
      progress: Math.min(currentProgress, quest_id.condition),
      total: quest_id.condition,
      icon: this.getQuestIcon(quest_id.type),
      isCompleted: is_completed,
      reward: quest_id.reward,
      type: quest_id.type,
    };

    if (quest_id.type === "Result" && quest_id.score !== undefined) {
      formatted.score = quest_id.score;
    }

    return formatted;
  }

  private getQuestSubtitle(quest: QuestDetail): string {
    let subtitle = "";
    switch (quest.type) {
      case "XP":
        subtitle = `Kiếm ${quest.condition} XP`;
        break;
      case "Complete":
        subtitle = `Hoàn thành ${quest.condition} bài học`;
        break;
      case "Time":
        subtitle = `Học ${quest.condition} phút`;
        break;
      case "Streak":
        subtitle = `Duy trì streak ${quest.condition} ngày`;
        break;
      case "Result":
        subtitle = `Đạt trên ${quest.score || 95}% trong ${
          quest.condition
        } bài học`;
        break;
      default:
        subtitle = quest.progress_text || "";
    }

    return subtitle;
  }

  private getQuestIcon(type: string): string {
    let icon = "";
    switch (type) {
      case "XP":
        icon = "⭐";
        break;
      case "Complete":
        icon = "✅";
        break;
      case "Time":
        icon = "⏰";
        break;
      case "Streak":
        icon = "🔥";
        break;
      case "Result":
        icon = "🎯";
        break;
      default:
        icon = "🎯";
    }

    return icon;
  }

  async checkQuestCompletion(
    userQuests: UserQuest[]
  ): Promise<QuestProgress[]> {
    const result = userQuests.map((quest) => {
      const progress =
        quest.quest_id.progress !== undefined
          ? quest.quest_id.progress
          : quest.progress || 0;
      return {
        questId: quest._id,
        progress: progress,
        isCompleted: quest.is_completed,
      };
    });

    return result;
  }
}

const questServiceInstance = new QuestService();
export default questServiceInstance;
export type {
  FormattedQuest,
  QuestDetail,
  QuestProgress,
  QuestReward,
  UserQuest,
};
