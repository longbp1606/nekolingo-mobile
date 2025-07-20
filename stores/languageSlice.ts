import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { languageService } from "../services";
import { Language } from "../services/languageService";

interface LanguageState {
  languages: Language[];
  loading: boolean;
  error: string | null;
  selectedLanguageFrom: Language | null;
  selectedLanguageTo: Language | null;
}

const initialState: LanguageState = {
  languages: [],
  loading: false,
  error: null,
  selectedLanguageFrom: null,
  selectedLanguageTo: null,
};

// Async thunks
export const fetchLanguages = createAsyncThunk(
  "language/fetchLanguages",
  async (_, { rejectWithValue }) => {
    try {
      const languages = await languageService.getLanguages();
      return languages;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch languages");
    }
  }
);

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setSelectedLanguageFrom: (state, action: PayloadAction<Language>) => {
      state.selectedLanguageFrom = action.payload;
    },
    setSelectedLanguageTo: (state, action: PayloadAction<Language>) => {
      state.selectedLanguageTo = action.payload;
    },
    clearLanguageSelection: (state) => {
      state.selectedLanguageFrom = null;
      state.selectedLanguageTo = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanguages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.loading = false;
        state.languages = action.payload;
        state.error = null;
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedLanguageFrom,
  setSelectedLanguageTo,
  clearLanguageSelection,
  clearError,
} = languageSlice.actions;

export default languageSlice.reducer;
