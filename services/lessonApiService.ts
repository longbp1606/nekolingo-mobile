import { apiSlice } from "./apiSlice";

export interface ImageOption {
  image: string;
  value: string;
}

export interface MatchOption {
  id: string;
  left: string;
  right: string;
}

export interface Exercise {
  _id: string;
  lesson_id?: string;
  question_format:
    | "fill_in_blank"
    | "multiple_choice"
    | "reorder"
    | "image_select"
    | "listening"
    | "match";
  type: string;
  question: string;
  options?: string[] | ImageOption[] | MatchOption[];
  correct_answer: string | string[] | MatchOption[];
  explanation?: string;
  order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  audio_url?: string;
  lesson?: {
    _id: string;
    title: string;
  };
  grammar?: {
    _id: string;
    name: string;
  };
  vocabulary?: {
    _id: string;
    word: string;
  };
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
