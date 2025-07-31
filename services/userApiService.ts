import { apiSlice } from "./apiSlice";
import { User } from "./auth/authApiService";

export interface UserProfile {
  user: User;
  current_course: any;
  current_topic: any;
  current_lesson: any;
  lesson_status: string;
  completed_topics: any[];
  completed_courses: any[];
  streak_list: any[];
}

export interface UserProfileResponse {
  data: UserProfile;
  pagination: null;
  message: string;
}

export interface UserFollowing {
  _id: string;
  username: string;
  email: string;
  xp: number;
  current_level: number;
  streak_days: number;
}

export interface UserFollowingResponse {
  data: UserFollowing[];
  pagination: null;
  message: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  language_from?: string;
  language_to?: string;
  current_level?: number;
  [key: string]: any;
}

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfileResponse, string | void>({
      query: (userId) => ({
        url: userId ? `/user/${userId}` : "/auth/profile",
      }),
      providesTags: (result, error, userId) => [
        { type: "User", id: userId || "CURRENT" },
      ],
    }),

    refreshUserProfile: builder.query<UserProfileResponse, void>({
      query: () => "/auth/profile",
      providesTags: ["User"],
      // This will be used to refresh the current user's profile
    }),

    updateUserProfile: builder.mutation<
      UserProfileResponse,
      { userId: string; userData: UpdateUserRequest }
    >({
      query: ({ userId, userData }) => ({
        url: `/user/${userId}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        "User",
      ],
    }),

    getUserFollowing: builder.query<UserFollowing[], string>({
      query: (userId) => `/user/${userId}/following`,
      providesTags: (result, error, userId) => [
        { type: "User", id: `${userId}-following` },
      ],
      transformResponse: (response: UserFollowingResponse) =>
        response.data || [],
    }),

    getUserFollowers: builder.query<UserFollowing[], string>({
      query: (userId) => `/user/${userId}/followers`,
      providesTags: (result, error, userId) => [
        { type: "User", id: `${userId}-followers` },
      ],
      transformResponse: (response: UserFollowingResponse) =>
        response.data || [],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useRefreshUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetUserFollowingQuery,
  useGetUserFollowersQuery,
} = userApi;
