import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../config/store";
import {
  LoginRequest,
  RegisterRequest,
  useLoginMutation,
  useRegisterMutation,
} from "../services";
import {
  clearAuthData,
  logout,
  storeAuthData,
} from "../services/auth/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();

  const login = async (credentials: LoginRequest) => {
    try {
      const result = await loginMutation(credentials).unwrap();
      // Store the auth data in AsyncStorage and Redux
      await dispatch(storeAuthData(result)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const result = await registerMutation(userData).unwrap();
      // Store the auth data in AsyncStorage and Redux
      await dispatch(storeAuthData(result)).unwrap();
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
    isLoading: authState.isLoading,
    error: authState.error,
    isInitialized: authState.isInitialized,

    // Auth actions
    login,
    register,
    logout: logoutUser,
  };
};
