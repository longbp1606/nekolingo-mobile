import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuestMissionProps {
  title: string;
  subtitle: string;
  progress: number;
  total: number;
  icon: string;
  isCompleted?: boolean;
  onPress?: () => void;
}

export function QuestMission({
  title,
  subtitle,
  progress,
  total,
  icon,
  isCompleted = false,
  onPress,
}: QuestMissionProps) {
  const progressPercentage = (progress / total) * 100;

  return (
    <TouchableOpacity style={styles.missionContainer} onPress={onPress}>
      <View style={styles.missionContent}>
        <Text style={styles.missionTitle}>{title}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
                isCompleted && styles.progressFillCompleted,
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress} / {total}
          </Text>
        </View>

        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconWrapper,
              isCompleted && styles.iconWrapperCompleted,
            ]}
          >
            <Text style={styles.iconText}>{icon}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  missionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  missionContent: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  missionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 15,
  },
  progressContainer: {
    flex: 2,
    marginRight: 15,
  },
  progressBar: {
    height: 12,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFB800",
    borderRadius: 6,
  },
  progressFillCompleted: {
    backgroundColor: "#58CC02",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#FFB800",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperCompleted: {
    backgroundColor: "#58CC02",
  },
  iconText: {
    fontSize: 24,
  },
});
