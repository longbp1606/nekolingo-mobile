import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export const useOnboardingCheck = () => {
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem("onboarding_completed");
        setIsCompleted(completed === "true");
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading onboarding status:", error);
        setIsCompleted(false); // Default to false on error
        setIsLoaded(true);
      }
    };

    checkOnboardingStatus();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("onboarding_completed", "true");
      setIsCompleted(true);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem("onboarding_completed");
      setIsCompleted(false);
    } catch (error) {
      console.error("Error resetting onboarding status:", error);
    }
  };

  return {
    isCompleted,
    isLoaded,
    completeOnboarding,
    resetOnboarding,
  };
};
