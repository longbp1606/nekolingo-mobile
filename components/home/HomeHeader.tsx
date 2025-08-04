import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  subtitle: string;
  backgroundColor: string;
  onListPress: () => void;
  userLevel?: number;
  userName?: string;
}

export const HomeHeader: React.FC<HeaderProps> = ({
  title,
  subtitle,
  backgroundColor,
  onListPress,
  userLevel,
  userName,
}) => {
  // Convert title to Vietnamese format
  const getVietnameseTitle = (title: string) => {
    const sectionMatch = title.match(/Section (\d+)/);
    const unitMatch = title.match(/Unit (\d+)/);

    if (sectionMatch && unitMatch) {
      return `Phần ${String(sectionMatch[1])}, Bài ${String(unitMatch[1])}`;
    }
    return title || "";
  };

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.headerContent}>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>
            Xin chào, {userName || "Học viên"}! 👋
          </Text>
          {userLevel && (
            <View style={styles.levelBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.levelText}>
                Cấp độ {String(userLevel || 1)}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.headerTitle}>{getVietnameseTitle(title)}</Text>
        <Text style={styles.headerSubtitle}>{subtitle || ""}</Text>
        <View style={styles.pathIndicator}>
          <Ionicons name="map" size={18} color="rgba(255,255,255,0.9)" />
          <Text style={styles.pathText}>Hành trình học tập của bạn</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.bookmarkButton} onPress={onListPress}>
        <Ionicons name="list" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    position: "relative",
    zIndex: 10, // Ensure header appears above scroll view content
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    minHeight: 120,
  },
  headerContent: {
    flex: 1,
    paddingRight: 60, // Give space for the button
    minHeight: 80,
  },
  greetingSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  greeting: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  levelText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
    lineHeight: 30,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
    opacity: 0.9,
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pathIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  pathText: {
    color: "white",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
  userLevel: {
    color: "white",
    fontSize: 14,
    opacity: 0.8,
    fontWeight: "600",
    lineHeight: 18,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bookmarkButton: {
    position: "absolute",
    right: 20,
    top: 25,
    padding: 10,
    borderRadius: 12,
    borderColor: "#fff",
    borderWidth: 1,
  },
});
