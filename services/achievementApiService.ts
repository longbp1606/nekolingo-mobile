import { apiSlice } from "./apiSlice";

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  condition: number;
  type: string;
  reward: {
    type: string;
    amount: number;
  };
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAchievement {
  _id: string;
  user_id: string;
  achievement_id: Achievement;
  progress: number;
  is_completed: boolean;
  completed_at?: string;
  createdAt: string;
  updatedAt: string;
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
  data: UserAchievement[];
  pagination: any;
  message: string;
}

export interface AchievementResponse {
  data: Achievement[];
  pagination: any;
  message: string;
}

export interface ClaimAchievementRequest {
  achievementId: string;
}

export interface ClaimAchievementResponse {
  success: boolean;
  reward: {
    type: string;
    amount: number;
  };
  message: string;
}

export const achievementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserAchievements: builder.query<UserAchievement[], void>({
      query: () => "/achievement/user",
      providesTags: ["Achievement"],
      transformResponse: (
        response: UserAchievementResponse | UserAchievement[]
      ) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.data || [];
      },
    }),

    getAllAchievements: builder.query<Achievement[], void>({
      query: () => "/achievement",
      providesTags: ["Achievement"],
      transformResponse: (response: AchievementResponse | Achievement[]) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.data || [];
      },
    }),

    getAchievementById: builder.query<Achievement, string>({
      query: (id) => `/achievement/${id}`,
      providesTags: (result, error, id) => [{ type: "Achievement", id }],
    }),

    claimAchievement: builder.mutation<
      ClaimAchievementResponse,
      ClaimAchievementRequest
    >({
      query: ({ achievementId }) => ({
        url: `/achievement/claim/${achievementId}`,
        method: "POST",
      }),
      invalidatesTags: ["Achievement", "User"], // Invalidate both achievements and user data
    }),

    // Simplified processed achievements endpoint
    getProcessedAchievements: builder.query<ProcessedAchievement[], void>({
      query: () => "/achievement/processed",
      providesTags: ["Achievement"],
    }),
  }),
});

export const {
  useGetUserAchievementsQuery,
  useGetAllAchievementsQuery,
  useGetAchievementByIdQuery,
  useClaimAchievementMutation,
  useGetProcessedAchievementsQuery,
  useLazyGetUserAchievementsQuery,
  useLazyGetAllAchievementsQuery,
  useLazyGetProcessedAchievementsQuery,
} = achievementApi;

// Helper functions for achievement processing
export const processAchievementForUI = (
  userAchievement: UserAchievement
): ProcessedAchievement => {
  const achievement = userAchievement.achievement_id;

  return {
    id: userAchievement._id,
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
    progress: userAchievement.progress,
    total: achievement.condition,
    isCompleted: userAchievement.is_completed,
    reward: achievement.reward,
    completedAt: userAchievement.completed_at,
    type: achievement.type,
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
