import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface MissionSectionProps {
  title: string;
  timeRemaining?: string;
  children: React.ReactNode;
  style?: ViewStyle;
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
            <Text style={styles.timeIcon}><FontAwesome name="clock-o" size={18} color="#FFA500" /></Text>
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
  isCompleted?: boolean;
  onFindFriends?: () => void;
}

export function FriendQuestCard({
  title,
  subtitle,
  progress,
  total,
  isCompleted,
  onFindFriends,
}: FriendQuestCardProps) {
  const progressPercentage = total > 0 ? Math.min((progress / total) * 100, 100) : 0;
  const isQuestCompleted = isCompleted !== undefined ? isCompleted : progress >= total;
  
  return (
    <View style={styles.friendQuestContainer}>
      <Text style={styles.friendQuestTitle}>{title}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.row}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Image 
            source={
              isCompleted
                ? require('../../assets/images/treasure-open.png')
                : require('../../assets/images/treasure-close.png')
            } 
            style={styles.iconChest} 
          />
        </View>
        <Text style={styles.progressText}>{progress} / {total}</Text>
      </View>

      {onFindFriends && (
        <TouchableOpacity
          style={styles.findFriendsButton}
          onPress={onFindFriends}
        >
          <Text style={styles.findFriendsText}>TÌM BẠN</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    paddingRight: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressBar: {
    width: '90%',
    height: 20,
    backgroundColor: '#E5E5E5',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2B70C9',
  },
  progressText: {
    position: 'absolute',
    top: 11,
    right: 155,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B4B4B',
  },
  iconChest: {
    width: 44,
    height: 44,
  },
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
    color: "#4B4B4B",
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
    color: "#FFA500",
    fontSize: 14,
    fontWeight: "600",
  },
  friendQuestContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  friendQuestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B4B4B",
    marginBottom: 15,
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
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 24,
  },
  findFriendsButton: {
    backgroundColor: "#2B70C9",
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
