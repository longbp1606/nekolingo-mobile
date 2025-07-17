import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services";
import { User } from "../services/authService";

interface UserState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: UserState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isInitialized: false,
};

// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Load stored authentication data
export const loadStoredAuth = createAsyncThunk(
  "user/loadStoredAuth",
  async (_, { rejectWithValue }) => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        // Validate token by making a profile request
        const isValid = await authService.validateToken(storedToken);
        if (isValid) {
          return {
            token: storedToken,
            user: JSON.parse(storedUser),
          };
        } else {
          // Token is invalid, clear stored data
          await Promise.all([
            AsyncStorage.removeItem(TOKEN_KEY),
            AsyncStorage.removeItem(USER_KEY),
          ]);
        }
      }

      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load stored auth");
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.login({
        email: credentials.email,
        password: credentials.password,
      });

      // Store authentication data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, response.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
      ]);

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (
    userData: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });

      // Store authentication data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, response.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
      ]);

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrent",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const token = state.user.token;
      
      if (!token) {
        return rejectWithValue("No authentication token");
      }

      const user = await authService.getProfile(token);
      
      // Update stored user data
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch user");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      
      // Clear stored authentication data
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

export const setupRegisterUser = createAsyncThunk(
  "user/setupRegister",
  async (
    userData: {
      email: string;
      password: string;
      username?: string;
      language_from: string;
      language_to: string;
      current_level: number;
    },
    { rejectWithValue }
  ) => {
    try {
      // First setup the user with onboarding data
      await authService.setupRegister({
        email: userData.email,
        password: userData.password,
        username: userData.username,
        language_from: userData.language_from,
        language_to: userData.language_to,
        current_level: userData.current_level,
      });

      // Then login to get the tokens
      const response = await authService.login({
        email: userData.email,
        password: userData.password,
      });

      // Store authentication data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, response.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
      ]);

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Setup registration failed");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUserSettings(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearError(state) {
      state.error = null;
    },
    setInitialized(state) {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load stored auth cases
      .addCase(loadStoredAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
        state.loading = false;
        state.isInitialized = true;
      })
      .addCase(loadStoredAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isInitialized = true;
      })
      
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Setup Register cases (for onboarding completion)
      .addCase(setupRegisterUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setupRegisterUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.loading = false;
      })
      .addCase(setupRegisterUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { updateUserSettings, clearError, setInitialized } = userSlice.actions;
export default userSlice.reducer;
