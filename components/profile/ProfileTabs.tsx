import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileTabsProps {
  activeTab: "stats" | "deposit" | "transactions";
  onTabChange: (tab: "stats" | "deposit" | "transactions") => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "stats" && styles.tabButtonActive,
        ]}
        onPress={() => onTabChange("stats")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "stats" && styles.tabTextActive,
          ]}
        >
          THỐNG KÊ
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "deposit" && styles.tabButtonActive,
        ]}
        onPress={() => onTabChange("deposit")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "deposit" && styles.tabTextActive,
          ]}
        >
          NẠP GEM
        </Text>
      </TouchableOpacity>
      {/* Uncomment if you want to enable transactions tab */}
      {/* <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "transactions" && styles.tabButtonActive,
        ]}
        onPress={() => onTabChange("transactions")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "transactions" && styles.tabTextActive,
          ]}
        >
          LỊCH SỬ
        </Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  tabButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#00C2D1",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B4B4B",
  },

  tabTextActive: {
    color: "#00C2D1",
  },
});

export default ProfileTabs;
