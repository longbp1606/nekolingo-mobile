import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Sizes } from "../constants";

interface BottomNavItem {
  id: string;
  icon: string;
  label: string;
  route: string;
}

const navItems: BottomNavItem[] = [
  { id: "home", icon: "🏠", label: "Home", route: "/(tabs)/home" },
  { id: "streak", icon: "�", label: "Streak", route: "/(tabs)/streak" },
  { id: "exercise", icon: "🏋️", label: "Exercise", route: "/(tabs)/exercise" },
  {
    id: "leaderboard",
    icon: "🏆",
    label: "Leaderboard",
    route: "/(tabs)/leaderboard",
  },
  { id: "membership", icon: "🦅", label: "Plus", route: "/(tabs)/membership" },
  { id: "profile", icon: "👤", label: "Profile", route: "/(tabs)/profile" },
];

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (route: string) => {
    // Use router.push with the route as a string - the type error can be ignored for now
    // since we're creating these routes dynamically
    router.push(route as any);
  };

  const isActiveRoute = (route: string) => {
    return pathname === route || pathname.startsWith(route + "/");
  };

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.navItem,
            isActiveRoute(item.route) && styles.activeNavItem,
          ]}
          onPress={() => handleNavigation(item.route)}
        >
          <Text
            style={[
              styles.navIcon,
              isActiveRoute(item.route) && styles.activeNavIcon,
            ]}
          >
            {item.icon}
          </Text>
          <Text
            style={[
              styles.navLabel,
              isActiveRoute(item.route) && styles.activeNavLabel,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Sizes.xs,
    paddingHorizontal: Sizes.xs,
    elevation: 10,
    shadowColor: Colors.textDark,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Sizes.xs,
    paddingHorizontal: Sizes.xs,
  },
  activeNavItem: {
    backgroundColor: Colors.primary + "10",
    borderRadius: 12,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  activeNavIcon: {
    fontSize: 26,
  },
  navLabel: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: "500",
  },
  activeNavLabel: {
    color: Colors.primary,
    fontWeight: "bold",
  },
});
