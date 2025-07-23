import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthResponse, User } from "./authApiService";

// Storage keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

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
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        return {
          token: storedToken,
          user: JSON.parse(storedUser) as User,
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
  async (authData: AuthResponse, { rejectWithValue }) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, authData.access_token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(authData.user)),
      ]);
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
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
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
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
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
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
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
