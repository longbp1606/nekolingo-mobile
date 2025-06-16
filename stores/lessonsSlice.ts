import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { lessonsService } from "../services";
import { Lesson, LessonProgress } from "../services/lessonsService";

interface LessonsState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  progress: LessonProgress[];
  loading: boolean;
  error: string | null;
}

const initialState: LessonsState = {
  lessons: [],
  currentLesson: null,
  progress: [],
  loading: false,
  error: null,
};

export const fetchLessons = createAsyncThunk(
  "lessons/fetchAll",
  async (language: string, { rejectWithValue }) => {
    try {
      const lessons = await lessonsService.getLessons(language);
      return lessons;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lessons"
      );
    }
  }
);

export const fetchLessonById = createAsyncThunk(
  "lessons/fetchById",
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const lesson = await lessonsService.getLesson(lessonId);
      return lesson;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lesson"
      );
    }
  }
);

export const submitLessonResults = createAsyncThunk(
  "lessons/submitResults",
  async (
    {
      lessonId,
      results,
    }: {
      lessonId: string;
      results: { exerciseId: string; isCorrect: boolean }[];
    },
    { rejectWithValue }
  ) => {
    try {
      const progress = await lessonsService.submitLessonResult(
        lessonId,
        results
      );
      return progress;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit lesson results"
      );
    }
  }
);

export const fetchUserProgress = createAsyncThunk(
  "lessons/fetchProgress",
  async (userId: string, { rejectWithValue }) => {
    try {
      const progress = await lessonsService.getLessonProgress(userId);
      return progress;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lesson progress"
      );
    }
  }
);

const lessonsSlice = createSlice({
  name: "lessons",
  initialState,
  reducers: {
    clearCurrentLesson(state) {
      state.currentLesson = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all lessons
      .addCase(fetchLessons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.lessons = action.payload;
        state.loading = false;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch lesson by id
      .addCase(fetchLessonById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.currentLesson = action.payload;
        state.loading = false;
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Submit lesson results
      .addCase(submitLessonResults.fulfilled, (state, action) => {
        // Add the new progress to our progress array
        state.progress = [...state.progress, action.payload];

        // Update the completed status of the lesson
        if (state.currentLesson) {
          state.currentLesson = {
            ...state.currentLesson,
            isCompleted: true,
          };
        }

        // Update the lesson in the lessons array
        state.lessons = state.lessons.map((lesson) => {
          if (lesson.id === action.payload.lessonId) {
            return { ...lesson, isCompleted: true };
          }
          return lesson;
        });
      })

      // Fetch user progress
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.progress = action.payload;

        // Update completion status of lessons based on progress
        if (action.payload.length > 0) {
          const completedLessonIds = action.payload
            .filter((p) => p.completed)
            .map((p) => p.lessonId);

          state.lessons = state.lessons.map((lesson) => ({
            ...lesson,
            isCompleted: completedLessonIds.includes(lesson.id),
          }));
        }
      });
  },
});

export const { clearCurrentLesson } = lessonsSlice.actions;
export default lessonsSlice.reducer;
