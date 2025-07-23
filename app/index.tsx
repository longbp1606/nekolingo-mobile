import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../config/store";
import { Colors, Sizes } from "../constants";
import { useOnboardingCheck } from "../hooks/useOnboardingCheck";

// Debug function to clear AsyncStorage
const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage cleared!");
  } catch (error) {
    console.error("Error clearing AsyncStorage:", error);
  }
};

export default function Index() {
  const { user, token, isInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const { isCompleted: onboardingCompleted, isLoaded: onboardingLoaded } =
    useOnboardingCheck();
  const router = useRouter();

  // Show loading until both auth and onboarding data are loaded
  if (!isInitialized || !onboardingLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Determine which screen to show based on auth state and onboarding
  const getInitialRoute = () => {
    console.log("=== NAVIGATION DEBUG ===");
    console.log("Token:", token);
    console.log("Onboarding Completed:", onboardingCompleted);
    console.log("Onboarding Loaded:", onboardingLoaded);
    console.log("User Learning Language:", user?.learning_language);
    console.log("========================");

    // NEW LOGIC: Onboarding first, then authentication
    // 1. If onboarding not completed -> go to onboarding (regardless of login status)
    if (!onboardingCompleted) {
      console.log("Going to onboarding - not completed");
      return "/onboarding";
    }

    // 2. If onboarding completed but not logged in -> go to login
    if (!token) {
      console.log("Going to login - onboarding completed but not logged in");
      return "/auth/login";
    }

    // 3. If logged in and onboarding completed -> go to main app
    console.log("Going to home - fully set up");
    return "/(tabs)/home";
  };

  return <Redirect href={getInitialRoute()} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: Sizes.h3,
    color: Colors.primary,
  },
});
