import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useDispatch } from "react-redux";
import { AppDispatch, store } from "../config/store";
import { Colors } from "../constants";
import { loadStoredAuth } from "../services/auth/authSlice";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Load stored authentication data on app start
    dispatch(loadStoredAuth());
  }, [dispatch]);

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
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
          name="auth/forgot-password"
          options={{
            title: "Forgot Password",
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
          name="onboarding/welcome"
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
        <Stack.Screen
          name="onboarding/source-selection"
          options={{
            title: "Source Selection",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding/reason-selection"
          options={{
            title: "Reason Selection",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding/level-selection"
          options={{
            title: "Level Selection",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding/results-preview"
          options={{
            title: "Results Preview",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding/goal-selection"
          options={{
            title: "Goal Selection",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="onboarding/register"
          options={{
            title: "Create Account",
            headerShown: false,
          }}
        />

        {/* Main app screens with tabs */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        {/* Lessons screens */}
        <Stack.Screen
          name="lessons/index"
          options={{
            title: "Lessons",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="lessons/[id]"
          options={{
            title: "Lesson Detail",
            headerShown: false,
          }}
        />

        {/* Exercise flow screens */}
        <Stack.Screen
          name="exercise/[lessonId]"
          options={{
            title: "Exercise",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="exercise/result"
          options={{
            title: "Exercise Result",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="streak/celebration"
          options={{
            title: "Streak Celebration",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="allachievement/index"
          options={{
            title: "Thành tích",
            headerShown: false,
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
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootLayoutNav />
      </SafeAreaProvider>
    </Provider>
  );
}
