import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export const useOnboardingCheck = () => {
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const isCompleted = await AsyncStorage.getItem("onboarding_completed");
        console.log("AsyncStorage onboarding_completed:", isCompleted);
        // If the key doesn't exist, isCompleted will be null, so default to false
      } catch (error) {
        console.error("Error loading onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, []);
};
