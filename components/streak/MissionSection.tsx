import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MissionSectionProps {
  title: string;
  timeRemaining?: string;
  children: React.ReactNode;
}

export function MissionSection({
  title,
  timeRemaining,
  children,
}: MissionSectionProps) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {timeRemaining && (
          <View style={styles.timeContainer}>
            <Text style={styles.timeIcon}>⏰</Text>
            <Text style={styles.timeText}>{timeRemaining}</Text>
          </View>
        )}
      </View>
      {children}
    </View>
  );
}

interface FriendQuestCardProps {
  title: string;
  subtitle: string;
  progress: number;
  total: number;
  onFindFriends?: () => void;
}

export function FriendQuestCard({
  title,
  subtitle,
  progress,
  total,
  onFindFriends,
}: FriendQuestCardProps) {
  return (
    <View style={styles.friendQuestContainer}>
      <Text style={styles.friendQuestTitle}>{title}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(progress / total) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progress} / {total}
        </Text>
      </View>

      <View style={styles.iconContainer}>
        <View style={styles.iconWrapper}>
          <Text style={styles.iconText}>👑</Text>
        </View>
      </View>

      {onFindFriends && (
        <TouchableOpacity
          style={styles.findFriendsButton}
          onPress={onFindFriends}
        >
          <Text style={styles.findFriendsIcon}>👤+</Text>
          <Text style={styles.findFriendsText}>TÌM BẠN</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  timeText: {
    color: "#FF6B00",
    fontSize: 14,
    fontWeight: "600",
  },
  friendQuestContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  friendQuestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    marginRight: 15,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFB800",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    minWidth: 40,
  },
  iconContainer: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#FFB800",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 24,
  },
  findFriendsButton: {
    backgroundColor: "#1CB0F6",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  findFriendsIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  findFriendsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
