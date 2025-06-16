import { StatusBar } from "expo-status-bar";
import React from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "../stores";
import AppNavigation from "./navigation";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <AppNavigation />
      </SafeAreaProvider>
    </Provider>
  );
}
