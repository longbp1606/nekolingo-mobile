import { apiSlice } from "./apiSlice";

export interface QuestReward {
  type: string;
  amount: number;
}

export interface QuestDetail {
  _id: string;
  title: string;
  icon: string;
  reward: QuestReward;
  type: string;
  condition: number;
  progress: number;
  progress_text: string;
  score?: number;
}

export interface UserQuest {
  _id: string;
  user_id: string;
  quest_id: QuestDetail | string; // Can be either full object or just ID string
  is_completed: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserQuestRaw {
  _id: string;
  user_id: string;
  quest_id: string; // Raw response has quest_id as string
  is_completed: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestCompletionResponse {
  quest: UserQuest;
  reward: QuestReward;
}

export interface QuestClaimResponse {
  success: boolean;
  reward: QuestReward;
}

export interface FormattedQuest {
  id: string;
  questId: string;
  title: string;
  subtitle: string;
  progress: number;
  total: number;
  icon: string;
  isCompleted: boolean;
  reward: QuestReward;
  type: string;
  score?: number;
}

export interface QuestProgress {
  questId: string;
  isCompleted: boolean;
  progress: number;
  total: number;
}

export interface DailyQuestsResponse {
  data?: UserQuest[];
  pagination?: null;
  message?: string;
}

export interface CreateDailyQuestsResponse {
  data?: UserQuestRaw[];
  pagination?: null;
  message?: string;
}

export const questApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDailyQuests: builder.query<UserQuest[], void>({
      query: () => "/quest/daily",
      providesTags: ["Quest"],
      transformResponse: (response: UserQuest[] | DailyQuestsResponse) => {
        if (Array.isArray(response)) {
          return response;
        }

        if (response && "data" in response && response.data) {
          return response.data;
        }

        console.warn("API returned invalid response:", response);
        return [];
      },
    }),
    createDailyQuests: builder.mutation<UserQuestRaw[], void>({
      query: () => ({
        url: "/quest/daily",
        method: "POST",
      }),
      invalidatesTags: ["Quest"],
      transformResponse: (
        response: UserQuestRaw[] | CreateDailyQuestsResponse
      ) => {
        if (Array.isArray(response)) {
          return response;
        }

        if (response && "data" in response && response.data) {
          return response.data;
        }

        console.warn("API returned invalid response:", response);
        return [];
      },
    }),
  }),
});

export const formatQuestForUI = (userQuest: UserQuest): FormattedQuest => {
  const { quest_id, is_completed } = userQuest;

  // Handle case where quest_id is just a string (from createDailyQuests response)
  if (typeof quest_id === "string") {
    console.warn("Quest details not populated, quest_id is string:", quest_id);
    // Return a minimal formatted quest - this should trigger a refetch
    return {
      id: userQuest._id,
      questId: quest_id,
      title: "Quest Loading...",
      subtitle: "Loading quest details...",
      progress: 0,
      total: 1,
      icon: "🏆",
      isCompleted: is_completed,
      reward: { type: "XP", amount: 0 },
      type: "Complete",
    };
  }

  const currentProgress =
    quest_id.progress !== undefined ? quest_id.progress : 0;

  const formatted: FormattedQuest = {
    id: userQuest._id,
    questId: quest_id._id,
    title: quest_id.title,
    subtitle: getQuestSubtitle(quest_id),
    progress: Math.min(currentProgress, quest_id.condition),
    total: quest_id.condition,
    icon: getQuestIcon(quest_id.type),
    isCompleted: is_completed,
    reward: quest_id.reward,
    type: quest_id.type,
  };

  if (quest_id.type === "Result" && quest_id.score !== undefined) {
    formatted.score = quest_id.score;
  }

  return formatted;
};

function getQuestSubtitle(quest: QuestDetail): string {
  switch (quest.type) {
    case "Complete":
      return `Hoàn thành ${quest.condition} bài học`;
    case "Result":
      return `Đạt ${quest.score}% trong ${quest.condition} bài học`;
    case "XP":
      return `Thu thập ${quest.condition} XP`;
    case "Streak":
      return `Duy trì streak ${quest.condition} ngày`;
    default:
      return quest.progress_text;
  }
}

function getQuestIcon(type: string): string {
  switch (type) {
    case "Complete":
      return "📚";
    case "Result":
      return "🎯";
    case "XP":
      return "⭐";
    case "Streak":
      return "🔥";
    default:
      return "🏆";
  }
}

export const formatQuestsForUI = (quests: UserQuest[]): FormattedQuest[] => {
  return quests.map(formatQuestForUI);
};

export const getQuestProgressPercentage = (quest: UserQuest): number => {
  if (typeof quest.quest_id === "string") {
    return 0; // Cannot calculate progress without quest details
  }

  const progress = quest.quest_id.progress || 0;
  const condition = quest.quest_id.condition;
  return Math.min((progress / condition) * 100, 100);
};

export const canCompleteQuest = (quest: UserQuest): boolean => {
  if (typeof quest.quest_id === "string") {
    return false; // Cannot complete without quest details
  }

  const progress = quest.quest_id.progress || 0;
  return progress >= quest.quest_id.condition && !quest.is_completed;
};

// Helper function to initialize daily quests for new users
export const initializeDailyQuestsForNewUser = async (
  createDailyQuests: () => Promise<any>
): Promise<UserQuestRaw[]> => {
  try {
    console.log("Initializing daily quests for new user...");
    const result = await createDailyQuests();
    console.log("Daily quests initialized successfully:", result);
    return result.data || result || [];
  } catch (error) {
    console.error("Failed to initialize daily quests:", error);
    throw error;
  }
};

// Helper function to handle quest initialization in user registration flow
export const handleQuestInitialization = async (
  createDailyQuests: () => Promise<{ data: UserQuestRaw[] }>,
  onSuccess?: (quests: UserQuestRaw[]) => void,
  onError?: (error: any) => void
): Promise<boolean> => {
  try {
    const result = await initializeDailyQuestsForNewUser(createDailyQuests);
    console.log(
      `Successfully created ${result.length} daily quests for new user`
    );

    if (onSuccess) {
      onSuccess(result);
    }

    return true;
  } catch (error) {
    console.error("Quest initialization failed:", error);

    if (onError) {
      onError(error);
    }

    return false;
  }
};

export const { useGetDailyQuestsQuery, useCreateDailyQuestsMutation } =
  questApi;

// Custom hook for handling quest initialization during registration
export const useQuestInitialization = () => {
  const [createDailyQuests, { isLoading, error }] =
    useCreateDailyQuestsMutation();

  const initializeQuests = async (): Promise<{
    success: boolean;
    quests?: UserQuestRaw[];
    error?: any;
  }> => {
    try {
      const result = await createDailyQuests().unwrap();
      return {
        success: true,
        quests: result,
      };
    } catch (err) {
      console.error("Failed to initialize daily quests:", err);
      return {
        success: false,
        error: err,
      };
    }
  };

  return {
    initializeQuests,
    isLoading,
    error,
  };
};

// Comprehensive hook for quest management after login/registration
export const useQuestManager = () => {
  const {
    data: existingQuests,
    isLoading: isLoadingQuests,
    error: questsError,
    refetch: refetchQuests,
  } = useGetDailyQuestsQuery();

  const [createDailyQuests, { isLoading: isCreatingQuests }] =
    useCreateDailyQuestsMutation();

  const ensureQuestsExist = async (): Promise<{
    success: boolean;
    quests: UserQuest[];
    created: boolean;
    error?: any;
  }> => {
    try {
      console.log("Checking for existing daily quests...");

      // First, get current quests
      const questsResult = await refetchQuests();
      const currentQuests = questsResult.data || [];

      console.log("Current quests:", currentQuests);

      // Check if user has any quests
      if (!currentQuests || currentQuests.length === 0) {
        console.log("No quests found, creating daily quests...");

        // Create new daily quests
        const createResult = await createDailyQuests().unwrap();
        console.log("Created quests (raw):", createResult);

        // Refetch to get the populated quest data
        console.log("Refetching quests to get populated data...");
        const refreshedResult = await refetchQuests();
        const newQuests = refreshedResult.data || [];

        console.log("Refreshed quests with populated data:", newQuests);

        return {
          success: true,
          quests: newQuests,
          created: true,
        };
      } else {
        console.log(`User already has ${currentQuests.length} daily quests`);

        return {
          success: true,
          quests: currentQuests,
          created: false,
        };
      }
    } catch (error) {
      console.error("Failed to ensure quests exist:", error);
      return {
        success: false,
        quests: [],
        created: false,
        error,
      };
    }
  };

  return {
    existingQuests: existingQuests || [],
    isLoadingQuests,
    isCreatingQuests,
    questsError,
    ensureQuestsExist,
    refetchQuests,
  };
};
