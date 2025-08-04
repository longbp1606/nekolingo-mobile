import { apiSlice } from "./apiSlice";

// Types for exercise progress - matching backend DTO
export interface ExerciseAnswer {
  exercise_id: string;
  user_answer: string | string[] | number | object;
  answer_time?: number; // in seconds (optional in backend)
}

export interface CompleteFullLessonRequest {
  user_id: string;
  lesson_id: string;
  exercises: ExerciseAnswer[];
}

export interface ExplainAnswerRequest {
  lesson_id: string;
  exercise_ids: string[];
}

export interface SubmitExerciseRequest {
  user_id: string;
  exercise_id: string;
  user_answer: object;
  answer_time: number;
}

export interface ExplainAnswerResponse {
  exercise_id: string;
  explanation: string;
  grammar?: string;
  correct_answer: string | number | object | string[] | object[];
  user_answer: string | number | object | string[] | object[];
  is_mistake: boolean;
}

export interface WeeklyStreakData {
  streak_days: number;
  is_freeze: boolean;
  freeze_count: number;
  week: Array<{
    day: string;
    date: string;
    status: "streak" | "freeze" | "missed";
  }>;
}

export const progressApiService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    completeFullLesson: builder.mutation<any, CompleteFullLessonRequest>({
      query: (data) => ({
        url: "/user-progress/complete-full-lesson",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Lesson", "Topic", "User"], // More specific cache invalidation
    }),
    explainAnswer: builder.mutation<
      ExplainAnswerResponse[],
      ExplainAnswerRequest
    >({
      query: (data) => ({
        url: "/user-progress/explain-answer",
        method: "POST",
        body: data,
      }),
    }),
    submitExercise: builder.mutation<any, SubmitExerciseRequest>({
      query: (data) => ({
        url: "/user-progress/submit-exercise",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"], // Invalidate user cache to refresh heart count
    }),
    getWeeklyStreak: builder.query<WeeklyStreakData, string>({
      query: (userId) => ({
        url: `/user-progress/weekly-streak/${userId}`,
        method: "GET",
      }),
      providesTags: ["User"], // Cache the streak data
    }),
  }),
  overrideExisting: true, // Allow overriding during hot reload in development
});

export const {
  useCompleteFullLessonMutation,
  useExplainAnswerMutation,
  useSubmitExerciseMutation,
  useGetWeeklyStreakQuery,
} = progressApiService;
