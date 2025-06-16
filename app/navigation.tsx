import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Colors } from "../constants";
import { AppDispatch, RootState } from "../stores";
import { fetchCurrentUser } from "../stores/userSlice";

export default function AppNavigation() {
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    // Try to fetch the current user on app start
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerBackTitle: "Back",
      }}
    >
      {/* Auth flow screens */}
      <Stack.Screen
        name="auth/login"
        options={{
          title: "Login",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/register"
        options={{
          title: "Create Account",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth/forgot-password"
        options={{
          title: "Reset Password",
          headerShown: false,
        }}
      />

      {/* Onboarding screens */}
      <Stack.Screen
        name="onboarding/index"
        options={{
          title: "Welcome",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="onboarding/language-selection"
        options={{
          title: "Choose a Language",
          headerShown: false,
        }}
      />

      {/* Main app screens */}
      <Stack.Screen
        name="home/index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="lessons/index"
        options={{
          title: "Lessons",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="lessons/detail"
        options={{
          title: "Lesson",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="practice/index"
        options={{
          title: "Practice",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="profile/index"
        options={{
          title: "Profile",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="leaderboard/index"
        options={{
          title: "Leaderboard",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="achievements/index"
        options={{
          title: "Achievements",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="settings/index"
        options={{
          title: "Settings",
          headerShown: true,
        }}
      />

      {/* Sample screen - will be removed in final version */}
      <Stack.Screen
        name="(sample)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
