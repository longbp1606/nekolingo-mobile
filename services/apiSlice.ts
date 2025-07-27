import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../config/store";

// Define base query with auth
const baseQuery = fetchBaseQuery({
  baseUrl: "http://api.nekolingo.site/api",
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state
    const state = getState() as RootState;
    const token = state.auth?.token;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// Create our main API slice
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Language",
    "Course",
    "Topic",
    "Lesson",
    "User",
    "Progress",
    "Leaderboard",
    "Achievement",
  ],
  endpoints: () => ({}),
});
