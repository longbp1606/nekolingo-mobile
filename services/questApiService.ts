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
  quest_id: QuestDetail;
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

export const questApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDailyQuests: builder.query<UserQuest[], void>({
      query: () => "/quest/daily",
      providesTags: ["Quest"],
      transformResponse: (response: UserQuest[] | DailyQuestsResponse) => {
        if (Array.isArray(response)) {
          return response;
        }

        if (response && 'data' in response && response.data) {
          return response.data;
        }

        console.warn("API returned invalid response:", response);
        return [];
      },
    }),

    updateQuestProgress: builder.mutation<
      UserQuest,
      { questId: string; progress: number }
    >({
      query: ({ questId, progress }) => ({
        url: `/quest/${questId}/progress`,
        method: "PUT",
        body: { progress },
      }),
      invalidatesTags: ["Quest"],
      async onQueryStarted(
        { questId, progress },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          questApi.util.updateQueryData(
            "getDailyQuests",
            undefined,
            (draft) => {
              const quest = draft.find((q) => q._id === questId);
              if (quest) {
                quest.quest_id.progress = progress;
                quest.quest_id.progress_text = `${progress}/${quest.quest_id.condition}`;
                quest.is_completed = progress >= quest.quest_id.condition;
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Failed to update quest progress:", error);
          patchResult.undo();
        }
      },
    }),

    completeQuest: builder.mutation<QuestCompletionResponse, string>({
      query: (questId) => ({
        url: `/quest/${questId}/complete`,
        method: "POST",
      }),
      invalidatesTags: ["Quest", "User"],
      async onQueryStarted(questId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(questApi.util.invalidateTags(["Quest"]));
        } catch (error) {
          console.error("Failed to complete quest:", error);
        }
      },
    }),

    claimQuestReward: builder.mutation<QuestClaimResponse, string>({
      query: (questId) => ({
        url: `/quest/${questId}/claim`,
        method: "POST",
      }),
      invalidatesTags: ["Quest", "User"],
      async onQueryStarted(questId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(questApi.util.invalidateTags(["Quest", "User"]));
        } catch (error) {
          console.error("Failed to claim quest reward:", error);
        }
      },
    }),
  }),
});

export const formatQuestForUI = (userQuest: UserQuest): FormattedQuest => {
  const { quest_id, is_completed } = userQuest;
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
  const progress = quest.quest_id.progress || 0;
  const condition = quest.quest_id.condition;
  return Math.min((progress / condition) * 100, 100);
};

export const canCompleteQuest = (quest: UserQuest): boolean => {
  const progress = quest.quest_id.progress || 0;
  return progress >= quest.quest_id.condition && !quest.is_completed;
};

export const {
  useGetDailyQuestsQuery,
  useUpdateQuestProgressMutation,
  useCompleteQuestMutation,
  useClaimQuestRewardMutation,
} = questApi;