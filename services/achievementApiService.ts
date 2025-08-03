import { apiSlice } from "./apiSlice";

export interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  condition: {
    type: string;
    value?: number;
  };
  createdAt: string;
  updatedAt: string;
  progress: number;
  progress_text: string;
  is_unlocked: boolean;
  unlock_at: string | null;
}

export interface ProcessedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  isCompleted: boolean;
  reward: {
    type: string;
    amount: number;
  };
  completedAt?: string;
  type: string;
}

export interface UserAchievementResponse {
  data: Achievement[];
  pagination: any;
  message: string;
}

export const achievementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserAchievements: builder.query<Achievement[], string>({
      query: (userId) => {
        return `/user-archivement/${userId}`;
      },
      providesTags: ["User-Achievement"],
      transformResponse: (
        response: UserAchievementResponse | Achievement[]
      ) => {
        if (Array.isArray(response)) {
          return response;
        }

        if (response && response.data) {
          return response.data;
        }
        return [];
      },
    }),
  }),
});

export const { useGetUserAchievementsQuery } = achievementApi;

// Helper functions for achievement processing
export const processAchievementForUI = (
  achievement: Achievement
): ProcessedAchievement => {
  // Extract total from condition value or default to 1
  const total = achievement.condition.value || 1;

  return {
    id: achievement._id,
    name: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
    progress: achievement.progress,
    total: total,
    isCompleted: achievement.is_unlocked,
    reward: {
      type: "xp", // Default reward type
      amount: 10, // Default reward amount
    },
    completedAt: achievement.unlock_at || undefined,
    type: achievement.condition.type,
  };
};

export const getAchievementProgress = (
  achievement: ProcessedAchievement
): number => {
  if (achievement.isCompleted) return 100;
  return Math.min((achievement.progress / achievement.total) * 100, 100);
};

export const getAchievementStatusText = (
  achievement: ProcessedAchievement
): string => {
  if (achievement.isCompleted) {
    return "Completed";
  }
  return `${achievement.progress}/${achievement.total}`;
};
