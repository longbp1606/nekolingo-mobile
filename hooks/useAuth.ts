import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../config/store";
import {
  LoginRequest,
  RegisterRequest,
  useGetProfileQuery,
  useLoginMutation,
  useRegisterMutation,
} from "../services/auth/authApiService";
import {
  clearAuthData,
  logout,
  setUser,
  storeAuthData,
} from "../services/auth/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();

  // Skip profile query if no token
  const {
    data: profileData,
    refetch: refetchProfile,
    isLoading: profileLoading,
  } = useGetProfileQuery(undefined, {
    skip: !authState.token,
  });

  // Update user in state when profile data is available
  React.useEffect(() => {
    if (profileData?.data && authState.token) {
      dispatch(setUser(profileData.data));
    }
  }, [profileData, authState.token, dispatch]);

  const login = async (credentials: LoginRequest) => {
    try {
      const result = await loginMutation(credentials).unwrap();
      console.log("Login API Response:", JSON.stringify(result, null, 2));

      // Check if result has the required fields
      if (!result.data?.accessToken) {
        console.error("Login response missing accessToken:", result);
        throw new Error("Invalid login response: missing access token");
      }

      // Store the auth data in AsyncStorage and Redux
      await dispatch(storeAuthData(result.data)).unwrap();

      // Fetch user profile after successful login and wait for it
      const profileResult = await refetchProfile();
      if (profileResult.data?.data) {
        dispatch(setUser(profileResult.data.data));
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const result = await registerMutation(userData).unwrap();
      // Store the auth data in AsyncStorage and Redux
      await dispatch(storeAuthData(result.data)).unwrap();

      // Fetch user profile after successful registration and wait for it
      const profileResult = await refetchProfile();
      if (profileResult.data?.data) {
        dispatch(setUser(profileResult.data.data));
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      // Clear auth data from AsyncStorage and Redux
      await dispatch(clearAuthData()).unwrap();
      dispatch(logout());
    } catch (error) {
      console.error("Logout error:", error);
      // Even if clearing storage fails, logout from Redux
      dispatch(logout());
    }
  };

  return {
    // Auth state
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading || profileLoading,
    error: authState.error,
    isInitialized: authState.isInitialized,

    // Auth actions
    login,
    register,
    logout: logoutUser,
  };
};
