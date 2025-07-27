import { apiSlice } from "./apiSlice";

// Types for exercise progress
export interface ExerciseAnswer {
  exercise_id: string;
  user_answer: string | string[] | number | object;
  is_correct: boolean;
  time_taken: number; // in seconds
}

export interface CompleteFullLessonRequest {
  lesson_id: string;
  exercise_answers: ExerciseAnswer[];
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
