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
  data: UserQuest[];
  pagination: null;
  message: string;
}

export const questApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDailyQuests: builder.query<UserQuest[], void>({
      query: () => "/quest/daily",
      providesTags: ["Quest"],
      transformResponse: (response: DailyQuestsResponse) => {
        // If API fails, return mock data for development
        if (!response?.data) {
          return getMockQuests();
        }
        return response.data;
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
      // Optimistic update
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
        } catch {
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
    }),

    claimQuestReward: builder.mutation<QuestClaimResponse, string>({
      query: (questId) => ({
        url: `/quest/${questId}/claim`,
        method: "POST",
      }),
      invalidatesTags: ["Quest", "User"],
    }),
  }),
});

// Mock data for development
function getMockQuests(): UserQuest[] {
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

// Utility functions for quest formatting
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

export const {
  useGetDailyQuestsQuery,
  useUpdateQuestProgressMutation,
  useCompleteQuestMutation,
  useClaimQuestRewardMutation,
} = questApi;
