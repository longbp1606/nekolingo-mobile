import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface QuestMissionProps {
  title: string;
  subtitle: string;
  progress: number;
  total: number;
  icon: string;
  isCompleted?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function QuestMission({
  title,
  subtitle,
  progress,
  style,
  total,
  icon,
  isCompleted = false,
  onPress,
}: QuestMissionProps) {
  const progressPercentage = (progress / total) * 100;
  const lockInterval = 10;

  const renderProgressSegments = () => {
    if (total <= 10) {
      return (
        <View
          style={[
            styles.progressSegment,
            {
              left: '0%',
              width: `${progressPercentage}%`,
              backgroundColor: isCompleted ? '#58CC02' : '#FFA500',
            },
          ]}
        />
      );
    }

    const segments = [];
    let currentStart = 0;

    for (let i = lockInterval; i <= total; i += lockInterval) {
      const segmentEnd = (i / total) * 100;

      if (progress >= i) {
        segments.push(
          <View
            key={`green-${i}`}
            style={[
              styles.progressSegment,
              {
                left: `${currentStart}%`,
                width: `${segmentEnd - currentStart}%`,
                backgroundColor: '#58CC02',
              },
            ]}
          />
        );
      } else if (progress > currentStart * total / 100) {
        const currentProgress = Math.min(progressPercentage, segmentEnd);
        segments.push(
          <View
            key={`orange-${i}`}
            style={[
              styles.progressSegment,
              {
                left: `${currentStart}%`,
                width: `${currentProgress - currentStart}%`,
                backgroundColor: '#FFA500',
              },
            ]}
          />
        );
        break;
      }

      currentStart = segmentEnd;
    }

    return segments;
  };

  const renderLockIcons = () => {
    if (total <= 10 || total < 30 || total > 50) {
      return null;
    }

    const lockPositions = [];

    for (let i = lockInterval; i < total; i += lockInterval) {
      const lockPosition = (i / total) * 100;
      const isUnlocked = progress >= i;

      lockPositions.push(
        <View
          key={i}
          style={[
            styles.lockIcon,
            {
              left: `${lockPosition}%`,
            }
          ]}
        >
          <View style={[
            styles.lockCircle,
            { backgroundColor: isUnlocked ? '#58CC02' : '#E5E5E5' }
          ]}>
            {isUnlocked ? (
              <FontAwesome5 name="unlock" size={14} color="white" />
            ) : (
              <FontAwesome name="lock" size={14} color="#666" />
            )}
          </View>
        </View>
      );
    }

    return lockPositions;
  };

  return (
    <TouchableOpacity style={[styles.missionContainer, style]} onPress={onPress}>
      <View style={styles.missionContent}>
        <Text style={styles.missionTitle}>{title}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.row}>
            <View style={styles.progressBar}>
              {renderProgressSegments()}
              {renderLockIcons()}
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
  },
  iconChest: {
    width: 44,
    height: 44,
  },
  missionContent: {
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: "column",
  },
  missionContentView: {
    flexDirection: "row",
    alignItems: "center",
  },
  missionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#4B4B4B",
    marginRight: 15,
    marginBottom: 10,
  },
  progressContainer: {
    paddingRight: 20,
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
    overflow: 'visible',
    marginRight: 10,
    position: 'relative',
  },
  progressSegment: {
    position: 'absolute',
    height: '100%',
    borderRadius: 5,
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
  lockIcon: {
    position: 'absolute',
    top: -6,
    transform: [{ translateX: -12 }],
    zIndex: 10,
  },
  lockCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  lockText: {
    fontSize: 10,
  },
});