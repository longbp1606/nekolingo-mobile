import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Sizes } from "../constants";

interface BottomNavItem {
  id: string;
  icon: any;
  label: string;
  route: string;
}

const navItems: BottomNavItem[] = [
  {
    id: "home",
    icon: require("../assets/images/house-cleaning.png"),
    label: "Home",
    route: "/(tabs)/home",
  },
  {
    id: "streak",
    icon: require("../assets/images/reward.png"),
    label: "Streak",
    route: "/(tabs)/streak",
  },
  {
    id: "exercise",
    icon: require("../assets/images/homework.png"),
    label: "Exercise",
    route: "/(tabs)/exercise",
  },
  {
    id: "leaderboard",
    icon: require("../assets/images/trophy.png"),
    label: "Leaderboard",
    route: "/(tabs)/leaderboard",
  },
  {
    id: "shop",
    icon: require("../assets/images/subscription.png"),
    label: "Shop",
    route: "/(tabs)/shop",
  },
  {
    id: "profile",
    icon: require("../assets/images/user.png"),
    label: "Profile",
    route: "/(tabs)/profile",
  },
];

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (route: string) => {
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
          <Image
            source={item.icon}
            style={[
              styles.navIconImage,
              isActiveRoute(item.route) && styles.activeNavIconImage,
            ]}
          />
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
  navIconImage: {
    width: 24,
    height: 24,
    marginBottom: 2,
    resizeMode: "contain",
  },
  activeNavIconImage: {
    width: 26,
    height: 26,
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
