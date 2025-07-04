import { usePathname } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNavigation } from "../../components";

interface TabLayoutProps {
  children: React.ReactNode;
}

export default function TabLayout({ children }: TabLayoutProps) {
  const pathname = usePathname();

  // Don't show bottom navigation on auth or onboarding screens
  const shouldShowBottomNav = ![
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/onboarding",
    "/onboarding/language-selection",
    "/(sample)",
  ].some((path) => pathname.startsWith(path));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{children}</View>
      {shouldShowBottomNav && <BottomNavigation />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
