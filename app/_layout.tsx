import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useDispatch } from "react-redux";
import { Colors } from "../constants";
import { AppDispatch, store } from "../stores";
import { fetchCurrentUser } from "../stores/userSlice";

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Try to fetch the current user on app start
    dispatch(fetchCurrentUser());
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
          name="auth/register"
          options={{
            title: "Register",
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
          name="onboarding/language-selection"
          options={{
            title: "Choose a Language",
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
