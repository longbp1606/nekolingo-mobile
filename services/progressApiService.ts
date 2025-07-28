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

export interface ExplainAnswerResponse {
  exercise_id: string;
  explanation: string;
  grammar?: string;
  correct_answer: string | number | object | string[] | object[];
  user_answer: string | number | object | string[] | object[];
  is_mistake: boolean;
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
  }),
  overrideExisting: true, // Allow overriding during hot reload in development
});

export const { useCompleteFullLessonMutation, useExplainAnswerMutation } =
  progressApiService;
