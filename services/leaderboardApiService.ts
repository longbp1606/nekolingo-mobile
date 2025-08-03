import { apiSlice } from "./apiSlice";

export interface LeaderboardUser {
  _id: string;
  xp: number;
}

export interface UserDetail {
  _id: string;
  email: string;
  role: number;
  current_level: number;
  xp: number;
  weekly_xp: number;
  streak_days: number;
  is_premiere: boolean;
  balance: number;
  hearts: number;
  is_active: boolean;
  username?: string;
}

export interface UserResponse {
  data: {
    user: UserDetail;
    current_course: any;
    current_topic: any;
    current_lesson: any;
    lesson_status: string;
    completed_topics: any[];
    completed_courses: any[];
    streak_list: any[];
  };
  pagination: any;
  message: string;
}

export interface DetailedUser {
  rank: number;
  _id: string;
  name: string;
  email: string;
  score: string;
  xp: number;
  avatar: string;
  color: string;
  isOnline: boolean;
  level: number;
  streak: number;
  hearts: number;
}

export interface TournamentLeaderboards {
  bronze: DetailedUser[];
  silver: DetailedUser[];
  gold: DetailedUser[];
  diamond: DetailedUser[];
}

export interface UserRankInfo {
  rank: number;
  tournament: string;
}

export interface LeaderboardResponse {
  data: LeaderboardUser[];
  pagination: any;
  message: string;
}

export const leaderboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverallLeaderboard: builder.query<LeaderboardUser[], void>({
      query: () => "/leaderboard/overall",
      providesTags: ["Leaderboard"],
      transformResponse: (
        response: LeaderboardResponse | LeaderboardUser[]
      ) => {
        // Handle both response formats
        if (Array.isArray(response)) {
          return response;
        }
        return response.data || [];
      },
    }),

    getWeeklyLeaderboard: builder.query<LeaderboardUser[], void>({
      query: () => "/leaderboard/weekly",
      providesTags: ["Leaderboard"],
    }),
  }),
});

export const { useGetOverallLeaderboardQuery, useGetWeeklyLeaderboardQuery } =
  leaderboardApi;

// Helper function for random color generation
const getRandomColor = (): string => {
  const colors = [
    "#ff9500",
    "#ff69b4",
    "#ff4444",
    "#4CAF50",
    "#9966ff",
    "#00BFFF",
    "#FFD700",
    "#FF6347",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
