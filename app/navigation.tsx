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
      {/* <Stack.Screen
        name="auth/login"
        options={{
          title: "Login",
          headerShown: false,
        }}
      /> */}
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
      />{" "}
      {/* Main app screens with tabs */}
      <Stack.Screen
        name="(tabs)"
        options={{
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
  );
}
