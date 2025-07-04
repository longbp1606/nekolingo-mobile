import { Tabs } from "expo-router";
import React from "react";
import { BottomNavigation } from "../../components";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // Hide default tab bar since we're using custom BottomNavigation
      }}
      tabBar={() => <BottomNavigation />} // Use our custom bottom navigation
    >
      <Tabs.Screen name="home/index" />
      <Tabs.Screen name="chest/index" />
      <Tabs.Screen name="practice/index" />
      <Tabs.Screen name="leaderboard/index" />
      <Tabs.Screen name="membership/index" />
      <Tabs.Screen name="profile/index" />
    </Tabs>
  );
}
