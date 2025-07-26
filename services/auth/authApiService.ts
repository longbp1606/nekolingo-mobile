import { apiSlice } from "../apiSlice";

export interface User {
  _id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number;
  profile_language: string;
  learning_language: string;
  currentCourse?: string;
  currentLesson?: string;
  currentTopic?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
  profile_language: string;
  learning_language: string;
}

export interface SetupRegisterRequest {
  email: string;
  password: string;
  username?: string;
  language_from: string;
  language_to: string;
  current_level: number;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  role: number;
}

export interface AuthResponse {
  data: AuthData;
  pagination: null;
  message: string;
}

export interface ProfileResponse {
  data: User;
  pagination: null;
  message: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    setupRegister: builder.mutation<AuthResponse, SetupRegisterRequest>({
      query: (userData) => ({
        url: "/auth/setup-register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    validateToken: builder.query<{ valid: boolean; user: User }, string>({
      query: (token) => ({
        url: "/auth/validate",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["User"],
    }),
    getProfile: builder.query<ProfileResponse, void>({
      query: () => "/auth/profile",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (updates) => ({
        url: "/auth/profile",
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSetupRegisterMutation,
  useValidateTokenQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
