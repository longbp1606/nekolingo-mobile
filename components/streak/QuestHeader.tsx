import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface QuestHeaderProps {
  title: string;
  subtitle: string;
  timeRemaining: string;
  characterAvatar?: string;
}

export function QuestHeader({
  title,
  subtitle,
  timeRemaining,
  characterAvatar,
}: QuestHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.monthLabel}>THÁNG BẢY</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeIcon}>⏰</Text>
            <Text style={styles.timeText}>{timeRemaining}</Text>
          </View>
        </View>

        {characterAvatar && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🤓</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#1CB0F6",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
  },
  monthLabel: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  timeText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
  },
  avatarContainer: {
    marginLeft: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarEmoji: {
    fontSize: 40,
  },
});
