import { apiSlice } from "./apiSlice";

export interface Course {
  _id: string;
  title: string;
  description: string;
  language: {
    _id: string;
    name: string;
    code: string;
  };
  difficulty_level: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const courseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<
      CoursesResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/course",
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      }),
      providesTags: ["Course"],
    }),
    getCourseById: builder.query<Course, string>({
      query: (id) => `/course/${id}`,
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),
  }),
});

export const { useGetCoursesQuery, useGetCourseByIdQuery } = courseApi;
