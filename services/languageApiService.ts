import { apiSlice } from "./apiSlice";

export interface Language {
  _id: string;
  name: string;
  code: string;
  flag_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const languageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLanguages: builder.query<Language[], void>({
      query: () => "/language",
      providesTags: ["Language"],
      transformResponse: (response: { languages: Language[] }) =>
        response.languages,
    }),
    getLanguageById: builder.query<Language, string>({
      query: (id) => `/language/${id}`,
      providesTags: (result, error, id) => [{ type: "Language", id }],
    }),
  }),
});

export const { useGetLanguagesQuery, useGetLanguageByIdQuery } = languageApi;
