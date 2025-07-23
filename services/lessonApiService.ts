import { apiSlice } from "./apiSlice";

export interface Exercise {
  _id: string;
  lesson_id: string;
  type: string;
  question: string;
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  topic: {
    _id: string;
    title: string;
    course: string;
  };
  order: number;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  exercises?: Exercise[];
}

export const lessonApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLessonsByTopic: builder.query<Lesson[], string>({
      query: (topicId) => `/lesson/topic/${topicId}`,
      providesTags: (result, error, topicId) => [
        { type: "Lesson", id: `topic-${topicId}` },
        ...(result || []).map(({ _id }) => ({
          type: "Lesson" as const,
          id: _id,
        })),
      ],
      transformResponse: (response: { data: Lesson[] }) => response.data,
    }),
    getLessonById: builder.query<Lesson, { lessonId: string; token?: string }>({
      query: ({ lessonId, token }) => ({
        url: `/lesson/${lessonId}`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      providesTags: (result, error, { lessonId }) => [
        { type: "Lesson", id: lessonId },
      ],
    }),
  }),
});

export const { useGetLessonsByTopicQuery, useGetLessonByIdQuery } = lessonApi;
