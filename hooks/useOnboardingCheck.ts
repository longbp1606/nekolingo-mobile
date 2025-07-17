import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../stores";
import { loadOnboardingState } from "../stores/onboardingSlice";

export const useOnboardingCheck = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const isCompleted = await AsyncStorage.getItem("onboarding_completed");
        console.log("AsyncStorage onboarding_completed:", isCompleted);
        // If the key doesn't exist, isCompleted will be null, so default to false
        dispatch(loadOnboardingState(isCompleted === "true"));
      } catch (error) {
        console.error("Error loading onboarding status:", error);
        dispatch(loadOnboardingState(false));
      }
    };

    checkOnboardingStatus();
  }, [dispatch]);
};
