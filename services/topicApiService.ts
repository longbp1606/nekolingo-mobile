import { apiSlice } from "./apiSlice";

export interface Topic {
  _id: string;
  title: string;
  description: string;
  course: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const topicApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTopicsByCourse: builder.query<Topic[], string>({
      query: (courseId) => `/topic/course/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: "Topic", id: `course-${courseId}` },
        ...(result || []).map(({ _id }) => ({
          type: "Topic" as const,
          id: _id,
        })),
      ],
      transformResponse: (response: { data: Topic[] }) => response.data,
    }),
    getTopicById: builder.query<Topic, string>({
      query: (id) => `/topic/${id}`,
      providesTags: (result, error, id) => [{ type: "Topic", id }],
    }),
  }),
});

export const { useGetTopicsByCourseQuery, useGetTopicByIdQuery } = topicApi;
