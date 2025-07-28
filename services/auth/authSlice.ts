import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthData, User } from "./authApiService";

// Storage keys
const TOKEN_KEY = "auth_token";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Async thunk to load stored auth data on app start
export const loadStoredAuth = createAsyncThunk(
  "auth/loadStoredAuth",
  async (_, { rejectWithValue }) => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);

      if (storedToken) {
        return {
          token: storedToken,
        };
      }

      return null;
    } catch (error: any) {
      console.error("Failed to load stored auth:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to store auth data
export const storeAuthData = createAsyncThunk(
  "auth/storeAuthData",
  async (authData: AuthData, { rejectWithValue }) => {
    try {
      console.log("Storing auth data:", JSON.stringify(authData, null, 2));

      // Validate required fields
      if (!authData.accessToken) {
        const error =
          "Cannot store auth data: accessToken is missing or undefined";
        console.error(error, authData);
        return rejectWithValue(error);
      }

      // Store tokens only - user profile will be fetched separately
      await AsyncStorage.setItem(TOKEN_KEY, authData.accessToken);
      return authData;
    } catch (error: any) {
      console.error("Failed to store auth data:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to clear auth data
export const clearAuthData = createAsyncThunk(
  "auth/clearAuthData",
  async (_, { rejectWithValue }) => {
    try {
      // Clear all authentication and user data
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        "userId",
        "userToken",
        "userData",
        "onboarding_completed", // Reset onboarding to show welcome screens again
      ]);
      return null;
    } catch (error: any) {
      console.error("Failed to clear auth data:", error);
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load stored auth
    builder
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.token = action.payload.token;
          state.isAuthenticated = true;
          // User profile will be fetched separately if needed
        }
      })
      .addCase(loadStoredAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = action.payload as string;
      });

    // Store auth data
    builder
      .addCase(storeAuthData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(storeAuthData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        // User will be set separately when profile is fetched
      })
      .addCase(storeAuthData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Clear auth data
    builder
      .addCase(clearAuthData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearAuthData.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(clearAuthData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setToken, clearError, logout } = authSlice.actions;
export default authSlice.reducer;
