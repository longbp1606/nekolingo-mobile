import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnboardingState {
  isCompleted: boolean;
  selectedLanguage: string | null;
  selectedSource: string | null;
  selectedReason: string | null;
  selectedLevel: number | null;
  selectedGoal: string | null;
  currentStep: number;
  isLoaded: boolean; // Add loading state
}

const initialState: OnboardingState = {
  isCompleted: false,
  selectedLanguage: null,
  selectedSource: null,
  selectedReason: null,
  selectedLevel: null,
  selectedGoal: null,
  currentStep: 1,
  isLoaded: false,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
    },
    setSource: (state, action: PayloadAction<string>) => {
      state.selectedSource = action.payload;
    },
    setReason: (state, action: PayloadAction<string>) => {
      state.selectedReason = action.payload;
    },
    setLevel: (state, action: PayloadAction<number>) => {
      state.selectedLevel = action.payload;
    },
    setGoal: (state, action: PayloadAction<string>) => {
      state.selectedGoal = action.payload;
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    completeOnboarding: (state) => {
      state.isCompleted = true;
      state.isLoaded = true;
      // Save to AsyncStorage
      AsyncStorage.setItem("onboarding_completed", "true");
    },
    resetOnboarding: (state) => {
      state.isCompleted = false;
      state.selectedLanguage = null;
      state.selectedSource = null;
      state.selectedReason = null;
      state.selectedLevel = null;
      state.selectedGoal = null;
      state.currentStep = 1;
      state.isLoaded = true;
      AsyncStorage.removeItem("onboarding_completed");
    },
    loadOnboardingState: (state, action: PayloadAction<boolean>) => {
      state.isCompleted = action.payload;
      state.isLoaded = true;
    },
  },
});

export const {
  setLanguage,
  setSource,
  setReason,
  setLevel,
  setGoal,
  setCurrentStep,
  completeOnboarding,
  resetOnboarding,
  loadOnboardingState,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
