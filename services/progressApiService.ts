import { apiSlice } from "./apiSlice";

export interface UserProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  completedAt?: string;
}

export interface LeaderboardEntry {
  _id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  total_xp: number;
  current_streak: number;
  rank: number;
}

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon_url?: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const progressApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProgress: builder.query<UserProgress[], string>({
      query: (userId) => `/progress/user/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "Progress", id: `user-${userId}` },
      ],
    }),
    updateProgress: builder.mutation<UserProgress, Partial<UserProgress>>({
      query: (progress) => ({
        url: "/progress",
        method: "POST",
        body: progress,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Progress", id: `user-${userId}` },
      ],
    }),
    getLeaderboard: builder.query<
      LeaderboardEntry[],
      { limit?: number } | void
    >({
      query: (params) => ({
        url: "/leaderboard",
        params: {
          limit: params?.limit || 10,
        },
      }),
      providesTags: ["Leaderboard"],
      transformResponse: (response: { data: LeaderboardEntry[] }) =>
        response.data,
    }),
    getAchievements: builder.query<Achievement[], void>({
      query: () => "/achievement",
      providesTags: ["Achievement"],
      transformResponse: (response: { data: Achievement[] }) => response.data,
    }),
    getUserAchievements: builder.query<Achievement[], string>({
      query: (userId) => `/achievement/user/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "Achievement", id: `user-${userId}` },
      ],
    }),
  }),
});

export const {
  useGetUserProgressQuery,
  useUpdateProgressMutation,
  useGetLeaderboardQuery,
  useGetAchievementsQuery,
  useGetUserAchievementsQuery,
} = progressApi;
